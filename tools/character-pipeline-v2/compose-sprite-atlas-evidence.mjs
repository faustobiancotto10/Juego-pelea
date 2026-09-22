import { mkdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

const manifestPath=resolve('assets/fighters/el-toro/el-toro-animations.json');
const atlasPath=resolve('assets/fighters/el-toro/el-toro-body.png');
const outPath=resolve('artifacts/v07-m3/sprite-atlas-evidence.png');
const phonePath=resolve('artifacts/v07-m3/sprite-atlas-evidence-phone.png');
const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));

const selections=[
  ['RIGHT IDLE',manifest.animations,'idle',0],
  ['LEFT IDLE',manifest.leftAnimations,'idle',0],
  ['RIGHT TOPETE',manifest.animations,'move:topete',4],
  ['LEFT ULTIMATE',manifest.leftAnimations,'ultimate:superEructo:startup',3],
];

mkdirSync(dirname(outPath),{recursive:true});

function run(args){
  const result=spawnSync('convert',args,{encoding:'utf8'});
  if(result.status!==0) throw new Error(result.stderr||`convert failed: ${args.join(' ')}`);
}

const tiles=[];
for(let i=0;i<selections.length;i++){
  const [label,map,key,index]=selections[i];
  const frames=map[key]?.frames;
  if(!frames?.length) throw new Error(`missing animation ${key}`);
  const fr=frames[Math.min(index,frames.length-1)];
  const crop=resolve(`artifacts/v07-m3/.sprite-crop-${i}.png`);
  const tile=resolve(`artifacts/v07-m3/.sprite-tile-${i}.png`);
  run([atlasPath,'-crop',`${fr.width}x${fr.height}+${fr.x}+${fr.y}`,'+repage','-resize','260x430>',crop]);
  run(['-size','300x520','xc:#111a27',crop,'-gravity','south','-geometry','+0+34','-composite',
       '-gravity','north','-fill','#eef3fb','-pointsize','20','-annotate','+0+14',label,tile]);
  tiles.push(tile);
}

const montage=spawnSync('montage',[...tiles,'-tile','4x1','-geometry','300x520+0+0','-background','#111a27',outPath],{encoding:'utf8'});
if(montage.status!==0) throw new Error(montage.stderr||'montage failed');
run([outPath,'-resize','844x366','-gravity','center','-background','#111a27','-extent','844x390',phonePath]);

console.log(JSON.stringify({
  atlas:manifest.atlas,
  mirrorSafe:manifest.mirrorSafe,
  rightKeys:Object.keys(manifest.animations).length,
  leftKeys:Object.keys(manifest.leftAnimations).length,
  outputs:[outPath,phonePath],
}));
