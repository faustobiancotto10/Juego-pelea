function alphaAt(image,index) {
  return image.rgba[index*4+3];
}

function nearestSlot(image,rows,cols,cx,cy) {
  const col=Math.max(0,Math.min(cols-1,Math.floor(cx*cols/image.width)));
  const row=Math.max(0,Math.min(rows-1,Math.floor(cy*rows/image.height)));
  return row*cols+col;
}

function componentList(image,threshold,{includePixels=false}={}) {
  const total=image.width*image.height;
  const visited=new Uint8Array(total);
  const stack=new Int32Array(total);
  const components=[];
  const w=image.width,h=image.height;

  for (let seed=0;seed<total;seed+=1) {
    if (visited[seed] || alphaAt(image,seed)<threshold) continue;
    let top=0;
    stack[top++]=seed;
    visited[seed]=1;
    let area=0,sumX=0,sumY=0,minX=w,minY=h,maxX=-1,maxY=-1,maxAlpha=0,solidPixels=0;
    const pixels=includePixels ? [] : null;

    while (top>0) {
      const index=stack[--top];
      const x=index%w,y=Math.floor(index/w),a=alphaAt(image,index);
      area+=1; sumX+=x; sumY+=y;
      minX=Math.min(minX,x); minY=Math.min(minY,y);
      maxX=Math.max(maxX,x); maxY=Math.max(maxY,y);
      maxAlpha=Math.max(maxAlpha,a);
      if (a>128) solidPixels+=1;
      if (pixels) pixels.push(index);

      for (let dy=-1;dy<=1;dy+=1) {
        for (let dx=-1;dx<=1;dx+=1) {
          if (dx===0 && dy===0) continue;
          const nx=x+dx,ny=y+dy;
          if (nx<0||ny<0||nx>=w||ny>=h) continue;
          const next=ny*w+nx;
          if (visited[next] || alphaAt(image,next)<threshold) continue;
          visited[next]=1;
          stack[top++]=next;
        }
      }
    }

    if (area>=3) {
      components.push({
        area,solidPixels,maxAlpha,
        cx:sumX/area,cy:sumY/area,
        bbox:{x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1},
        ...(pixels ? {pixels} : {}),
      });
    }
  }
  return components;
}

function unionBbox(a,b) {
  if (!a) return {...b};
  const x=Math.min(a.x,b.x),y=Math.min(a.y,b.y);
  const x2=Math.max(a.x+a.width,b.x+b.width);
  const y2=Math.max(a.y+a.height,b.y+b.height);
  return {x,y,width:x2-x,height:y2-y};
}

function assignComponents(image,rows,cols,components,{retainComponents=false}={}) {
  const groups=Array.from({length:rows*cols},()=>({
    bbox:null,components:0,area:0,solidPixels:0,
    ...(retainComponents ? {componentRefs:[]} : {}),
  }));
  for (const component of components) {
    const slot=nearestSlot(image,rows,cols,component.cx,component.cy);
    const group=groups[slot];
    group.bbox=unionBbox(group.bbox,component.bbox);
    group.components+=1;
    group.area+=component.area;
    group.solidPixels+=component.solidPixels;
    if (retainComponents) group.componentRefs.push(component);
  }
  return groups;
}

function frameMetadata(image,rows,cols,group,slot) {
  const row=Math.floor(slot/cols),col=slot%cols;
  const x0=Math.floor(col*image.width/cols),x1=Math.floor((col+1)*image.width/cols);
  const y0=Math.floor(row*image.height/rows),y1=Math.floor((row+1)*image.height/rows);
  const nominal={x:x0,y:y0,width:x1-x0,height:y1-y0};
  const bbox=group.bbox;
  const crossesNominal=Boolean(bbox && (
    bbox.x<nominal.x || bbox.y<nominal.y ||
    bbox.x+bbox.width>nominal.x+nominal.width ||
    bbox.y+bbox.height>nominal.y+nominal.height
  ));
  return {
    bbox:group.bbox,
    components:group.components,
    area:group.area,
    solidPixels:group.solidPixels,
    slot:slot+1,row,col,nominal,crossesNominal,
  };
}

function hardCanvasEdgePixels(image,clipAlpha) {
  const hardCanvasEdge=[];
  for (let x=0;x<image.width;x+=1) {
    const top=x,bottom=(image.height-1)*image.width+x;
    if (alphaAt(image,top)>clipAlpha) hardCanvasEdge.push({x,y:0});
    if (alphaAt(image,bottom)>clipAlpha) hardCanvasEdge.push({x,y:image.height-1});
  }
  for (let y=1;y<image.height-1;y+=1) {
    const left=y*image.width,right=y*image.width+image.width-1;
    if (alphaAt(image,left)>clipAlpha) hardCanvasEdge.push({x:0,y});
    if (alphaAt(image,right)>clipAlpha) hardCanvasEdge.push({x:image.width-1,y});
  }
  return hardCanvasEdge;
}

function alphaSummary(image) {
  let visiblePixels=0,transparentPixels=0;
  for (let index=0;index<image.width*image.height;index+=1) {
    if (alphaAt(image,index)>0) visiblePixels+=1;
    else transparentPixels+=1;
  }
  return {visiblePixels,transparentPixels};
}

export function extractFramesByComponents(image,rows,cols,{contentAlpha=32,clipAlpha=128}={}) {
  const components=componentList(image,contentAlpha);
  const groups=assignComponents(image,rows,cols,components);
  const frames=groups.map((group,slot)=>frameMetadata(image,rows,cols,group,slot));
  return {
    frames,
    components,
    hardCanvasEdge:hardCanvasEdgePixels(image,clipAlpha),
    ...alphaSummary(image),
    contentAlpha,
    clipAlpha,
  };
}

function isolatedCrop(image,frame,componentRefs) {
  if (!frame.bbox) {
    return {cropWidth:0,cropHeight:0,rgba:Buffer.alloc(0),ownedPixelCount:0};
  }
  const cropWidth=frame.bbox.width,cropHeight=frame.bbox.height;
  const rgba=Buffer.alloc(cropWidth*cropHeight*4);
  let ownedPixelCount=0;

  for (const component of componentRefs) {
    for (const sourceIndex of component.pixels) {
      const sourceX=sourceIndex%image.width;
      const sourceY=Math.floor(sourceIndex/image.width);
      const targetX=sourceX-frame.bbox.x;
      const targetY=sourceY-frame.bbox.y;
      const sourceOffset=sourceIndex*4;
      const targetOffset=(targetY*cropWidth+targetX)*4;
      rgba[targetOffset]=image.rgba[sourceOffset];
      rgba[targetOffset+1]=image.rgba[sourceOffset+1];
      rgba[targetOffset+2]=image.rgba[sourceOffset+2];
      rgba[targetOffset+3]=image.rgba[sourceOffset+3];
      ownedPixelCount+=1;
    }
  }

  return {cropWidth,cropHeight,rgba,ownedPixelCount};
}

export function extractPixelIsolatedFrames(image,rows,cols,{contentAlpha=32,clipAlpha=128}={}) {
  const components=componentList(image,contentAlpha,{includePixels:true});
  const groups=assignComponents(image,rows,cols,components,{retainComponents:true});
  const frames=groups.map((group,slot)=>{
    const metadata=frameMetadata(image,rows,cols,group,slot);
    return {
      ...metadata,
      ...isolatedCrop(image,metadata,group.componentRefs),
    };
  });

  return {
    frames,
    hardCanvasEdge:hardCanvasEdgePixels(image,clipAlpha),
    ...alphaSummary(image),
    contentAlpha,
    clipAlpha,
  };
}
