import * as T from 'three';
import {celMaterial} from './cel.js';

const ink='#3d253a';
const palettes=[
  ['#4d303b','#a76d56','#efb885'],
  ['#284c50','#5e9379','#bbda9c'],
  ['#293a64','#628ec1','#bce0f0'],
  ['#583e45','#c58a52','#fae1a0'],
  ['#49305f','#956eaf','#dfb9e8'],
  ['#382638','#69475b','#c29492']
];
const designs=new Map();

function ellipse(ctx,x,y,rx,ry,fill){
  ctx.beginPath();
  ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  ctx.fillStyle=fill;
  ctx.fill();
}

function stroke(ctx,path,color,width){
  ctx.strokeStyle=color;
  ctx.lineWidth=width;
  ctx.stroke(new Path2D(path));
}

function blendBlush(ctx,x,y){
  ctx.save();
  ctx.translate(x,y);ctx.scale(1,.44);
  const glow=ctx.createRadialGradient(0,0,3,0,0,51);
  glow.addColorStop(0,'rgba(222,108,127,0.48)');
  glow.addColorStop(1,'rgba(230,103,124,0)');
  ellipse(ctx,0,0,51,51,glow);
  ctx.restore();
}

function eye(ctx,feminine,index,closed,side){
  const upper=feminine?'M -61 2 Q -44 -34 -4 -36 Q 35 -37 59 -12':'M -59 1 Q -41 -29 -4 -32 Q 33 -32 58 -10';
  const shape=new Path2D(upper+' Q 53 24 24 32 Q -24 46 -53 17 Z');
  const [dark,middle,light]=palettes[index]??palettes[0];
  if(closed){
    stroke(ctx,'M -57 7 Q -27 -13 2 -14 Q 35 -15 55 0',ink,7);
    return;
  }
  ctx.fillStyle='#f7e7df';ctx.fill(shape);
  ctx.save();ctx.clip(shape);
  const iris=ctx.createLinearGradient(0,-34,0,38);
  iris.addColorStop(0,dark);iris.addColorStop(.68,middle);iris.addColorStop(1,light);
  ellipse(ctx,-side*3,-1,30,35,iris);
  ellipse(ctx,-side*3,-5,17,26,dark);
  ellipse(ctx,-side*13,-15,7.5,8.5,'#fff3ea');
  ctx.restore();
  stroke(ctx,'M -46 22 Q -14 44 22 31 Q 41 27 48 18','#a4787b',2.8);
  stroke(ctx,upper,ink,feminine?8:7.5);
  if(feminine) stroke(ctx,'M 53 -15 Q 61 -14 66 -20',ink,4.5);
}

function drawing(feminine,index,closed){
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d');
  ctx.lineCap=ctx.lineJoin='round';
  for(const s of [-1,1]){
    const x=256+s*91;
    blendBlush(ctx,256+s*149,289);
    ctx.save();ctx.translate(x,223);ctx.scale(s,1);
    eye(ctx,feminine,index,closed,s);
    stroke(ctx,feminine?'M -42 -65 Q -9 -79 38 -69':'M -42 -65 Q -9 -77 40 -69','#583447',feminine?4.8:6.7);
    ctx.restore();
  }
  stroke(ctx,'M 250 298 Q 256 302 263 299','rgba(144,76,78,.62)',4);
  stroke(ctx,'M 252 291 L 260 291','rgba(255,221,187,.72)',3.5);
  stroke(ctx,'M 233 346 Q 251 362 279 346','#965665',5.4);
  stroke(ctx,'M 249 375 Q 259 377 267 374','rgba(232,132,140,.48)',3);
  const texture=new T.CanvasTexture(canvas);
  texture.colorSpace=T.SRGBColorSpace;
  texture.anisotropy=4;
  return celMaterial('#ffffff',{map:texture,transparent:true,depthWrite:false,
    polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
}

function materials(feminine,index){
  const key=feminine+'-'+index;
  if(!designs.has(key)) designs.set(key,[drawing(feminine,index,false),drawing(feminine,index,true)]);
  return designs.get(key);
}

function crossSection(rings,y){
  const next=rings.findIndex(r=>r[0]>=y);
  const hi=rings[Math.max(1,next)],lo=rings[Math.max(1,next)-1];
  const t=T.MathUtils.clamp((y-lo[0])/(hi[0]-lo[0]),0,1);
  return lo.slice(1).map((value,i)=>T.MathUtils.lerp(value,hi[i+1],t));
}

export function paintedFace(head,rings,feminine,index){
  const geometry=new T.PlaneGeometry(.46,.452,32,40);
  const pos=geometry.attributes.position;
  for(let i=0;i<pos.count;i++){
    const y=pos.getY(i)-.005,x=pos.getX(i);
    const [width,depth,center=0]=crossSection(rings,y);
    const angle=x/.23*1.31;
    pos.setXYZ(i,Math.sin(angle)*(width+.001),y,Math.cos(angle)*(depth+.002)+center+.003);
  }
  geometry.computeVertexNormals();geometry.userData.avatarOwned=true;
  const [open,closed]=materials(feminine,index);
  const face=new T.Mesh(geometry,open);
  head.add(face);
  return {face,open,closed};
}
