import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SHEETS, REJECTED_ALTERNATE } from './sprite-source-config.mjs';
import { gridRect, parseRgbaPng, scanAlpha } from './sprite-png-alpha.mjs';
import { buildNormalization, normalizedTransform } from './sprite-normalize-contract.mjs';
import { renderNormalizedPreview } from './sprite-preview-svg.mjs';

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

export function generateSpriteSourceEvidence({sourceDir,outDir}) {
  const sourceRoot=resolve(sourceDir),outputRoot=resolve(outDir);
  mkdirSync(outputRoot,{recursive:true});
  const names=new Set(readdirSync(sourceRoot));
  const hashMismatches=[],unsupportedPngs=[],emptyFrames=[],canvasEdgeClipping=[],cellBoundaryTouches=[];
  const sheets=[],frames=[];

  for (const spec of SHEETS) {
    const path=join(sourceRoot,spec.file);
    if (!existsSync(path)) throw new Error('missing accepted source sheet '+spec.file);
    const bytes=readFileSync(path);
    const actualHash=sha256(bytes);
    if (actualHash!==spec.hash) hashMismatches.push({file:spec.file,expected:spec.hash,actual:actualHash});

    let image;
    try { image=parseRgbaPng(bytes); }
    catch (error) {
      unsupportedPngs.push({file:spec.file,error:error instanceof Error?error.message:String(error)});
      continue;
    }

    let visible=0,transparent=0,extractedFrames=0;
    for (let row=0;row<spec.rows;row+=1) {
      for (let col=0;col<spec.cols;col+=1) {
        const slot=row*spec.cols+col+1;
        const rect=gridRect(image,spec.rows,spec.cols,row,col);
        const alpha=scanAlpha(image,rect);
        visible+=alpha.visiblePixels; transparent+=alpha.transparentPixels;
        const frameId=spec.id+'__f'+String(slot).padStart(2,'0');
        if (!alpha.bbox) { emptyFrames.push(frameId); continue; }
        extractedFrames+=1;
        if (alpha.touchesCanvasEdge) canvasEdgeClipping.push(frameId);
        if (alpha.touchesCellEdge) cellBoundaryTouches.push(frameId);
        frames.push({
          frameId,sheetId:spec.id,kind:spec.kind==='fx'?'fx':'body',
          sourceRect:rect,bbox:alpha.bbox,
        });
      }
    }

    sheets.push({
      id:spec.id,file:spec.file,
      sourcePath:relative(process.cwd(),path).replaceAll('\\','/'),
      expectedHash:spec.hash,actualHash,
      width:image.width,height:image.height,bitDepth:image.bitDepth,colorType:image.colorType,
      grid:{rows:spec.rows,cols:spec.cols},
      expectedFrames:spec.expectedFrames,extractedFrames,
      hasVisiblePixels:visible>0,hasTransparentPixels:transparent>0,
    });
  }

  const normalization=buildNormalization(frames);
  const manifestFrames=frames.map((frame)=>({...frame,normalized:normalizedTransform(frame,normalization)}));
  const rejectedAlternatePresent=names.has(REJECTED_ALTERNATE);
  const manifest={
    contractVersion:1,
    fighterId:'el-toro',
    facing:'right',
    shippingStatus:'pilot-only-left-facing-blocked',
    authority:[
      'docs/SPRITE_PRODUCTION_CONTRACT.md',
      'docs/characters/el-toro/SPRITE_INTAKE_2026-09-21.md',
      'docs/characters/el-toro/LEFT_FACING_SET_PROMPT.md',
    ],
    runtimeBoundary:'Runtime consumes normalized derived frames/atlases and this transform contract; source sheets remain authoring-only and must never be loaded as fighter textures.',
    leftFacingGate:'El Toro is not mirror-safe. Authored LEFT-IMG-00 + LEFT IMG-01..12 remain mandatory before production cutover.',
    normalization,sheets,frames:manifestFrames,
    diagnostics:{hashMismatches,rejectedAlternatePresent,emptyFrames,canvasEdgeClipping,cellBoundaryTouches,unsupportedPngs},
  };

  writeFileSync(join(outputRoot,'NORMALIZATION_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
  writeFileSync(join(outputRoot,'NORMALIZED_PREVIEW.svg'),renderNormalizedPreview(manifestFrames,sheets,normalization));

  const bodyFrameCount=frames.filter((frame)=>/^IMG-(0[1-9]|1[0-2])$/.test(frame.sheetId)).length;
  const fxFrameCount=frames.filter((frame)=>frame.kind==='fx').length;
  return {
    acceptedSheetCount:sheets.length,
    masterFrameCount:frames.filter((frame)=>frame.sheetId==='IMG-00').length,
    bodyFrameCount,fxFrameCount,totalPreviewFrames:frames.length,
    hashMismatches,rejectedAlternatePresent,emptyFrames,canvasEdgeClipping,cellBoundaryTouches,unsupportedPngs,
    sheets,normalization,
  };
}

function parseArgs(argv) {
  const args={};
  for (let i=0;i<argv.length;i+=1) {
    if (argv[i]==='--source-dir') args.sourceDir=argv[++i];
    else if (argv[i]==='--out-dir') args.outDir=argv[++i];
    else throw new Error('unknown argument '+argv[i]);
  }
  if (!args.sourceDir||!args.outDir) throw new Error('usage: node scripts/el-toro-sprite-source-pipeline.mjs --source-dir <dir> --out-dir <dir>');
  return args;
}

if (process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const report=generateSpriteSourceEvidence(parseArgs(process.argv.slice(2)));
  process.stdout.write(JSON.stringify({
    acceptedSheetCount:report.acceptedSheetCount,
    masterFrameCount:report.masterFrameCount,
    bodyFrameCount:report.bodyFrameCount,
    fxFrameCount:report.fxFrameCount,
    totalPreviewFrames:report.totalPreviewFrames,
    hashMismatches:report.hashMismatches,
    rejectedAlternatePresent:report.rejectedAlternatePresent,
    emptyFrames:report.emptyFrames,
    canvasEdgeClipping:report.canvasEdgeClipping,
    cellBoundaryTouches:report.cellBoundaryTouches,
    unsupportedPngs:report.unsupportedPngs,
    normalization:report.normalization,
  },null,2)+'\n');
}
