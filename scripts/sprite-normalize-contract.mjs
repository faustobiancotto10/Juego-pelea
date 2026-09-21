import { BODY_CANVAS, FX_CANVAS } from './sprite-source-config.mjs';

function rounded(value) { return Number(value.toFixed(8)); }

function sharedScale(frames,canvas,bottomAnchored) {
  const maxWidth=Math.max(...frames.map((frame)=>frame.bbox.width));
  const maxHeight=Math.max(...frames.map((frame)=>frame.bbox.height));
  const usableWidth=canvas.width-canvas.margin*2;
  const usableHeight=bottomAnchored ? canvas.pivotY-canvas.margin : canvas.height-canvas.margin*2;
  return rounded(Math.min(usableWidth/maxWidth,usableHeight/maxHeight));
}

export function buildNormalization(frames) {
  const bodyFrames=frames.filter((frame)=>frame.kind==='body');
  const fxFrames=frames.filter((frame)=>frame.kind==='fx');
  const bodyScale=bodyFrames.length ? sharedScale(bodyFrames,BODY_CANVAS,true) : 0;
  const fxScale=fxFrames.length ? sharedScale(fxFrames,FX_CANVAS,false) : 0;
  return {
    body:{
      canvas:{width:BODY_CANVAS.width,height:BODY_CANVAS.height},
      anchor:'bottom-center',
      groundPivot:{x:BODY_CANVAS.pivotX,y:BODY_CANVAS.pivotY},
      sharedScale:bodyScale,
    },
    fx:{
      canvas:{width:FX_CANVAS.width,height:FX_CANVAS.height},
      anchor:'center',
      pivot:{x:FX_CANVAS.centerX,y:FX_CANVAS.centerY},
      sharedScale:fxScale,
    },
  };
}

export function normalizedTransform(frame,normalization) {
  if (frame.kind==='fx') {
    const scale=normalization.fx.sharedScale;
    return {
      scale,
      pivotX:FX_CANVAS.centerX,pivotY:FX_CANVAS.centerY,
      x:rounded(FX_CANVAS.centerX-frame.bbox.width*scale/2),
      y:rounded(FX_CANVAS.centerY-frame.bbox.height*scale/2),
      width:rounded(frame.bbox.width*scale),height:rounded(frame.bbox.height*scale),
    };
  }
  const scale=normalization.body.sharedScale;
  return {
    scale,
    pivotX:BODY_CANVAS.pivotX,pivotY:BODY_CANVAS.pivotY,
    x:rounded(BODY_CANVAS.pivotX-frame.bbox.width*scale/2),
    y:rounded(BODY_CANVAS.pivotY-frame.bbox.height*scale),
    width:rounded(frame.bbox.width*scale),height:rounded(frame.bbox.height*scale),
  };
}
