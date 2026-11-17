import * as T from 'three';
import {part} from './models.js';

const plaqueHeight=.82;
const pixelsPerUnit=196;
const facePlane=new T.PlaneGeometry(1,1);
const faceMaterials=new Map();

// Arcade stones reach .93 m in front of the facade and approximately 4.47 m above the floor.
export const doorSign=(name,width)=>[
  name,0,4.98,1.12,Math.min(8.15,width*.75,Math.max(4.4,name.length*.25+.6))
];

function plaqueFace(name,width){
  const key=name+' / '+width;
  const cached=faceMaterials.get(key);
  if(cached) return cached;
  const canvas=document.createElement('canvas');
  canvas.width=Math.ceil(width*pixelsPerUnit);
  canvas.height=Math.ceil(plaqueHeight*pixelsPerUnit);
  const c=canvas.getContext('2d');
  const w=canvas.width,h=canvas.height;
  c.fillStyle='#332127';
  c.fillRect(0,0,w,h);
  c.strokeStyle='#d1ae76';c.lineWidth=4;
  c.beginPath();c.roundRect(12,10,w-24,h-20,16);c.stroke();
  c.strokeStyle='#735343';c.lineWidth=2;
  c.beginPath();c.roundRect(20,18,w-40,h-36,11);c.stroke();
  c.fillStyle='#cfaa73';
  for(const x of [34,w-34]){
    c.beginPath();c.moveTo(x,h*.50-10);c.lineTo(x+6,h*.50);
    c.lineTo(x,h*.50+10);c.lineTo(x-6,h*.50);c.closePath();c.fill();
  }
  const base=88;
  c.font='bold '+base+'px Georgia, serif';
  const maxWidth=w-116;
  const fontSize=Math.min(base,Math.floor(base*maxWidth/c.measureText(name).width));
  c.font='bold '+fontSize+'px Georgia, serif';
  c.textAlign='center';c.textBaseline='alphabetic';
  const metrics=c.measureText(name);
  const baseline=(h+metrics.actualBoundingBoxAscent-metrics.actualBoundingBoxDescent)*.5;
  c.fillStyle='#fff2ce';
  c.fillText(name,w*.5,baseline);
  const texture=new T.CanvasTexture(canvas);
  texture.colorSpace=T.SRGBColorSpace;
  texture.anisotropy=4;
  const fill=new T.MeshBasicMaterial({map:texture,toneMapped:false});
  fill.name='Campus plaque: '+name;
  fill.userData={name,width,height:plaqueHeight,inkHeight:metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent};
  return faceMaterials.set(key,fill).get(key);
}

export function mountCampusSign(parent,name,x,y,z,width,posts=false,yaw=0){
  const plaque=new T.Group();
  plaque.position.set(x,y,z);plaque.rotation.y=yaw;plaque.name='Sign: '+name;parent.add(plaque);
  if(posts){
    for(const side of [-1,1]){
      const height=posts-plaqueHeight*.5+.17;
      part(plaque,'cube','#775348',side*width*.33,-posts+height*.50,-.065,.125,height,.12);
    }
  }
  const back=part(plaque,'cube','#62443a',0,0,0,width,plaqueHeight,.14);
  back.castShadow=false;
  if(typeof document!=='undefined'){
    const face=new T.Mesh(facePlane,plaqueFace(name,width));
    face.position.z=.073;
    face.scale.set(width,plaqueHeight,1);
    plaque.add(face);
  }
  return plaque;
}
