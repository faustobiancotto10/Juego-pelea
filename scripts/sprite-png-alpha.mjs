import { inflateSync } from 'node:zlib';

const PNG_SIGNATURE = Buffer.from([137,80,78,71,13,10,26,10]);

function paeth(a,b,c) {
  const p=a+b-c;
  const pa=Math.abs(p-a), pb=Math.abs(p-b), pc=Math.abs(p-c);
  if (pa<=pb && pa<=pc) return a;
  return pb<=pc ? b : c;
}

export function parseRgbaPng(buffer) {
  if (buffer.length<33 || !buffer.subarray(0,8).equals(PNG_SIGNATURE)) throw new Error('not a PNG');
  let offset=8;
  let ihdr=null;
  const idat=[];
  while (offset+12<=buffer.length) {
    const length=buffer.readUInt32BE(offset);
    const type=buffer.toString('ascii',offset+4,offset+8);
    const start=offset+8, end=start+length, next=end+4;
    if (next>buffer.length) throw new Error('truncated PNG chunk');
    const data=buffer.subarray(start,end);
    if (type==='IHDR') {
      ihdr={
        width:data.readUInt32BE(0), height:data.readUInt32BE(4),
        bitDepth:data[8], colorType:data[9],
        compression:data[10], filter:data[11], interlace:data[12],
      };
    } else if (type==='IDAT') idat.push(data);
    else if (type==='IEND') break;
    offset=next;
  }
  if (!ihdr) throw new Error('PNG missing IHDR');
  if (ihdr.bitDepth!==8 || ihdr.colorType!==6 || ihdr.compression!==0 || ihdr.filter!==0 || ihdr.interlace!==0) {
    throw new Error('unsupported PNG format '+JSON.stringify(ihdr));
  }

  const bpp=4, stride=ihdr.width*bpp;
  const raw=inflateSync(Buffer.concat(idat));
  const expected=(stride+1)*ihdr.height;
  if (raw.length!==expected) throw new Error('unexpected inflated length '+raw.length+' expected '+expected);

  const rgba=Buffer.alloc(stride*ihdr.height);
  let src=0;
  for (let y=0;y<ihdr.height;y+=1) {
    const filterType=raw[src++];
    const row=y*stride, prev=row-stride;
    for (let x=0;x<stride;x+=1) {
      const byte=raw[src++];
      const left=x>=bpp ? rgba[row+x-bpp] : 0;
      const up=y>0 ? rgba[prev+x] : 0;
      const upLeft=y>0 && x>=bpp ? rgba[prev+x-bpp] : 0;
      let value=byte;
      if (filterType===1) value=(byte+left)&255;
      else if (filterType===2) value=(byte+up)&255;
      else if (filterType===3) value=(byte+Math.floor((left+up)/2))&255;
      else if (filterType===4) value=(byte+paeth(left,up,upLeft))&255;
      else if (filterType!==0) throw new Error('unsupported PNG row filter '+filterType);
      rgba[row+x]=value;
    }
  }
  return {...ihdr,rgba};
}

export function gridRect(image,rows,cols,row,col) {
  const x0=Math.floor(col*image.width/cols);
  const x1=Math.floor((col+1)*image.width/cols);
  const y0=Math.floor(row*image.height/rows);
  const y1=Math.floor((row+1)*image.height/rows);
  return {x:x0,y:y0,width:x1-x0,height:y1-y0};
}

export function scanAlpha(image,rect) {
  let minX=rect.x+rect.width,minY=rect.y+rect.height,maxX=-1,maxY=-1;
  let visiblePixels=0,transparentPixels=0,touchesCanvasEdge=false,touchesCellEdge=false;
  const x2=rect.x+rect.width,y2=rect.y+rect.height;
  for (let y=rect.y;y<y2;y+=1) {
    for (let x=rect.x;x<x2;x+=1) {
      const alpha=image.rgba[(y*image.width+x)*4+3];
      if (alpha===0) { transparentPixels+=1; continue; }
      visiblePixels+=1;
      minX=Math.min(minX,x); minY=Math.min(minY,y);
      maxX=Math.max(maxX,x); maxY=Math.max(maxY,y);
      if (x===0 || y===0 || x===image.width-1 || y===image.height-1) touchesCanvasEdge=true;
      if (x===rect.x || y===rect.y || x===x2-1 || y===y2-1) touchesCellEdge=true;
    }
  }
  return {
    visiblePixels,transparentPixels,touchesCanvasEdge,touchesCellEdge,
    bbox:visiblePixels===0 ? null : {x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1},
  };
}
