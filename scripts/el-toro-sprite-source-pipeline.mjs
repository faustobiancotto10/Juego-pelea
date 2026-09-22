import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { REJECTED_ALTERNATE, sheetsForFacing } from './sprite-source-config.mjs';
import { parseRgbaPng } from './sprite-png-alpha.mjs';
import { extractFramesByComponents, extractPixelIsolatedFrames } from './sprite-component-extractor.mjs';
import { buildNormalization, normalizedTransform } from './sprite-normalize-contract.mjs';
import { renderNormalizedPreview } from './sprite-preview-svg.mjs';

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

export function generateSpriteSourceEvidence({sourceDir,outDir,facing='right'}) {
  const sourceRoot=resolve(sourceDir),outputRoot=resolve(outDir);\n  const sheetSpecs=sheetsForFacing(facing);
  mkdirSync(outputRoot,{recursive:true});
  const names=new Set(readdirSync(sourceRoot));
  const hashMismatches=[],unsupportedPngs=[],emptyFrames=[],canvasEdgeClipping=[],cellBoundaryTouches=[];
  const sheets=[],frames=[];

  for (const spec of sheetSpecs) {
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

    const extraction=extractFramesByComponents(image,spec.rows,spec.cols,{contentAlpha:32,clipAlpha:128});
    let extractedFrames=0;
    if (extraction.hardCanvasEdge.length>0) canvasEdgeClipping.push(spec.id+'__sheet-edge');

    for (const extracted of extraction.frames) {
      const frameId=spec.id+'__f'+String(extracted.slot).padStart(2,'0');
      if (!extracted.bbox) { emptyFrames.push(frameId); continue; }
      extractedFrames+=1;
      if (extracted.crossesNominal) cellBoundaryTouches.push(frameId);
      frames.push({
        frameId,sheetId:spec.id,kind:spec.kind,
        sourceRect:extracted.nominal,bbox:extracted.bbox,
        extraction:{method:'alpha-components',contentAlpha:32,components:extracted.components,crossesNominal:extracted.crossesNominal,pixelIsolation:'component-owned-rgba-v1'},
      });
    }

    sheets.push({
      id:spec.id,file:spec.file,
      sourcePath:relative(process.cwd(),path).replaceAll('\\','/'),
      expectedHash:spec.hash,actualHash,
      width:image.width,height:image.height,bitDepth:image.bitDepth,colorType:image.colorType,
      grid:{rows:spec.rows,cols:spec.cols},
      extraction:{method:'alpha-components',contentAlpha:32,clipAlpha:128},
      expectedFrames:spec.expectedFrames,extractedFrames,
      hasVisiblePixels:extraction.visiblePixels>0,hasTransparentPixels:extraction.transparentPixels>0,
    });
  }

  const normalization=buildNormalization(frames);
  const manifestFrames=frames.map((frame)=>({...frame,normalized:normalizedTransform(frame,normalization)}));
  const rejectedAlternatePresent=facing==='right' && names.has(REJECTED_ALTERNATE);
  const manifest={
    contractVersion:1,
    fighterId:'el-toro',
    facing,
    shippingStatus:facing==='right' ? 'pilot-only-left-facing-blocked' : 'pilot-only-anchor-blocked',
    authority:[
      'docs/SPRITE_PRODUCTION_CONTRACT.md',
      'docs/characters/el-toro/SPRITE_INTAKE_2026-09-21.md',
      'docs/characters/el-toro/LEFT_FACING_SET_PROMPT.md',
    ],
    runtimeBoundary:'Runtime consumes normalized derived frames/atlases and this transform contract; source sheets remain authoring-only and must never be loaded as fighter textures.',
    leftFacingGate:facing==='right'\n      ? 'El Toro is not mirror-safe. Authored LEFT-IMG-00 + LEFT IMG-01..12 remain mandatory before production cutover.'\n      : 'Authored LEFT source is admitted; visually verified anatomical attachment anchors remain mandatory before production cutover.',
    normalization,sheets,frames:manifestFrames,
    diagnostics:{hashMismatches,rejectedAlternatePresent,emptyFrames,canvasEdgeClipping,cellBoundaryTouches,unsupportedPngs},
  };

  writeFileSync(join(outputRoot,'NORMALIZATION_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
  writeFileSync(join(outputRoot,'NORMALIZED_PREVIEW.svg'),renderNormalizedPreview(manifestFrames,sheets,normalization,facing));

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


export function generatePixelIsolatedFrameSet({sourceDir,facing='right'}) {
  const sourceRoot=resolve(sourceDir);
  const names=new Set(readdirSync(sourceRoot));
  if (names.has(REJECTED_ALTERNATE)) {
    throw new Error('rejected El Toro alternate is present in admitted source path');
  }

  const frames=[];
  const sourceHashes={};

  for (const spec of sheetSpecs) {
    const path=join(sourceRoot,spec.file);
    if (!existsSync(path)) throw new Error('missing accepted source sheet '+spec.file);
    const bytes=readFileSync(path);
    const actualHash=sha256(bytes);
    if (actualHash!==spec.hash) {
      throw new Error('source hash mismatch for '+spec.file+': expected '+spec.hash+' actual '+actualHash);
    }
    sourceHashes[spec.id]=actualHash;

    const image=parseRgbaPng(bytes);
    const extraction=extractPixelIsolatedFrames(image,spec.rows,spec.cols,{contentAlpha:32,clipAlpha:128});
    if (extraction.hardCanvasEdge.length>0) {
      throw new Error('hard outer-canvas clipping detected for '+spec.id);
    }

    for (const extracted of extraction.frames) {
      const frameId=spec.id+'__f'+String(extracted.slot).padStart(2,'0');
      if (!extracted.bbox || extracted.ownedPixelCount<=0) {
        throw new Error('empty isolated frame '+frameId);
      }
      frames.push({
        frameId,
        sheetId:spec.id,
        kind:spec.kind,
        bbox:extracted.bbox,
        sourceRect:extracted.nominal,
        crossesNominal:extracted.crossesNominal,
        components:extracted.components,
        ownedPixelCount:extracted.ownedPixelCount,
        cropWidth:extracted.cropWidth,
        cropHeight:extracted.cropHeight,
        rgba:extracted.rgba,
      });
    }
  }

  return {
    fighterId:'el-toro',
    facing,
    isolationVersion:'component-owned-rgba-v1',
    contentAlpha:32,
    sourceHashes,
    frames,
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
