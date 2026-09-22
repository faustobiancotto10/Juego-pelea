import { normalizedTransform } from './sprite-normalize-contract.mjs';

function esc(value) {
  return String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

export function renderNormalizedPreview(frames,sheets,normalization,facing='right') {
  const sheetMap=new Map(sheets.map((sheet)=>[sheet.id,sheet]));
  const columns=6,cellWidth=340,cellHeight=360,titleHeight=56;
  const rowCount=Math.ceil(frames.length/columns);
  const width=columns*cellWidth,height=titleHeight+rowCount*cellHeight;
  const cells=frames.map((frame,index)=>{
    const sheet=sheetMap.get(frame.sheetId);
    const t=normalizedTransform(frame,normalization);
    const col=index%columns,row=Math.floor(index/columns);
    const ox=col*cellWidth,oy=titleHeight+row*cellHeight;
    const href=esc(sheet.sourcePath),label=esc(frame.frameId);
    return [
      '<g data-frame-id="'+label+'">',
      '<rect x="'+(ox+1)+'" y="'+(oy+1)+'" width="'+(cellWidth-2)+'" height="'+(cellHeight-2)+'" fill="none" stroke="currentColor" opacity="0.18"/>',
      '<text x="'+(ox+8)+'" y="'+(oy+18)+'" font-size="12">'+label+'</text>',
      '<svg x="'+(ox+t.x)+'" y="'+(oy+t.y)+'" width="'+t.width+'" height="'+t.height+'" viewBox="'+frame.bbox.x+' '+frame.bbox.y+' '+frame.bbox.width+' '+frame.bbox.height+'" preserveAspectRatio="none">',
      '<image href="'+href+'" width="'+sheet.width+'" height="'+sheet.height+'"/>',
      '</svg>',
      '<circle cx="'+(ox+t.pivotX)+'" cy="'+(oy+t.pivotY)+'" r="2" fill="currentColor" opacity="0.45"/>',
      '</g>',
    ].join('');
  }).join('\n');
  const title='El Toro '+facing+'-facing normalized source preview';
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'">',
    '<title>'+title+'</title>',
    '<text x="12" y="26" font-size="20">'+title+'</text>',
    '<text x="12" y="46" font-size="12">Shared body scale + stable bottom-center ground pivot; FX use a separate shared center scale when present.</text>',
    cells,
    '</svg>',
    '',
  ].join('\n');
}
