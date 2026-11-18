import * as T from 'three';
import {material,part} from './models.js';

const oak='#986b50',iron='#606574',brass='#d5aa67',parchment='#fae7bb';
function pivot(parent,x,y,z){
  const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;
}
function ring(parent,color,r,tube,y){
  const mesh=new T.Mesh(new T.TorusGeometry(r,tube,8,32),material(color));
  mesh.rotation.x=Math.PI/2;mesh.position.y=y;parent.add(mesh);return mesh;
}
function bench(parent){
  for(const x of [-.52,.52])for(const z of [-.31,.31])part(parent,'cube',oak,x,.35,z,.12,.70,.12);
  part(parent,'cube','#bf9674',0,.72,0,1.38,.13,.92);
}
function silk(bath,frame){
  part(bath,'cyl',oak,0,.46,0,.66,.91,.66);
  for(const y of [.23,.73])ring(bath,iron,.66,.034,y);
  const surface=part(bath,'cyl',parchment,0,.93,0,.61,.03,.61);
  const stick=part(bath,'cyl',oak,.26,1.11,0,.036,.80,.036,.21,0,-.32);
  for(const x of [-.60,.60])part(frame,'cube',oak,x,.85,0,.11,1.7,.13);
  part(frame,'cube',brass,0,1.68,0,1.39,.09,.09);
  const ribbon=pivot(frame,0,1.64,0);
  part(ribbon,'cube','#c35885',0,-.52,0,.89,1.04,.04);
  for(const y of [-.24,-.79])part(ribbon,'cube',parchment,0,y,.024,.90,.083,.026);
  return (t,n)=>{
    surface.material=material(n>=2?'#aa456c':'#dac4ab');
    stick.rotation.z=-.32+(n===1?.18*Math.sin(t*2.5):0);
    ribbon.visible=n>=3;ribbon.rotation.x=.1*Math.sin(t*2.3);
  };
}
function cask(horse,stand){
  bench(horse);
  for(let i=0;i<3;i++)part(horse,'cube',i===1?'#d5ae72':'#a27a5a',(i-1)*.29,.83,i*.04,.25,.08,.79,0,.11*i);
  part(horse,'cube',iron,.38,.97,.07,.58,.05,.14,0,.08,.24);
  part(stand,'cyl','#704d44',0,.15,0,.63,.28,.63);
  const staves=[];
  for(let i=0;i<14;i++){
    const a=i*Math.PI/7;
    staves.push(part(stand,'cube',i%2?'#d6a46e':'#b68057',.47*Math.sin(a),.69,.47*Math.cos(a),.215,.91,.08,0,a));
  }
  const lower=ring(stand,iron,.49,.046,.42),upper=ring(stand,iron,.49,.046,.96);
  const head=part(stand,'cyl','#cea577',0,1.14,0,.466,.067,.466);
  return (t,n)=>{
    staves.forEach((p,i)=>{p.visible=n>=2||i>5;});
    head.visible=n>=3;lower.visible=n>=2;upper.position.y=n>=3?.96:1.23+Math.sin(t*2)*.035;
  };
}
function orbit(scope,dais){
  for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3;
    part(scope,'cyl',brass,.30*Math.sin(a),.51,.30*Math.cos(a),.05,1.07,.05,.43*Math.cos(a),0,-.43*Math.sin(a));
  }
  const tube=pivot(scope,0,1.06,0);
  part(tube,'cyl',iron,0,0,0,.13,1.10,.13,1.08);
  part(tube,'cyl',brass,0,.22,.42,.17,.18,.17,1.08);
  part(tube,'sphere','#85c8d0',0,.27,.50,.14,.12,.06,-.41);
  part(dais,'cyl','#8f82a5',0,.37,0,.64,.73,.64);
  const rings=pivot(dais,0,1.38,0);
  for(let j=0;j<3;j++){
    const wheel=ring(rings,j===1?'#96c6c7':brass,.55-j*.075,.030,0);
    wheel.rotation.set(.32+j*.66,.28*j,.31*j);
    part(wheel,'sphere',j===1?'#c2a5dc':'#f4cd86',.55-j*.075,0,0,.092,.092,.092);
  }
  const star=part(rings,'diamond','#f7d87e',0,0,0,.13,.19,.13);
  return (t,n)=>{tube.rotation.y=n>=2?.14:-.92;star.visible=n>=3;rings.rotation.y=n>=3?t*.72:.36;};
}
export function workshopFittings(interior,room){
  const [firstTool,secondTool,desk]=room.fixtures.map(([,x,z])=>pivot(interior,x,0,z));
  part(desk,'cube',oak,0,.45,0,.16,.9,.16);
  part(desk,'cube',oak,0,.95,0,.64,.08,.49,.20);
  part(desk,'cube',parchment,0,1,.01,.43,.025,.37,.20);
  for(let i=0;i<3;i++)part(desk,'cube',iron,0,1.036-i*.009,-.11+i*.066,.24,.015,.017,.2);
  const exhibit=pivot(interior,0,0,-room.depth/2+.27);
  if(room.work==='silk'){
    part(exhibit,'cube',oak,0,1.52,0,4.65,.10,.30);
    for(const [i,tone] of ['#ae5d6c','#dbae57','#839c73','#8194b7','#a384ad'].entries()){
      const x=(i-2)*.79;
      part(exhibit,'cyl',tone,x,1.78,.02,.17,.63,.17,0,0,Math.PI/2);
      for(const dx of [-.24,.24])part(exhibit,'cyl',parchment,x+dx,1.78,.02,.173,.055,.173,0,0,Math.PI/2);
      part(exhibit,'cube',tone,x,1.17,.16,.60,.63,.035);
      part(exhibit,'cube',parchment,x,.98,.184,.60,.056,.024);
    }
    for(let j=0;j<3;j++)part(firstTool,'soft',['#ad585d','#c49953','#6988a0'][j],(j-1)*.32,1.02,-.42,.13,.17,.13);
  }else if(room.work==='cask'){
    for(const x of [-2.24,0,2.24])part(exhibit,'cube',iron,x,.63,.03,.08,1.22,.19);
    for(let j=0;j<5;j++)part(exhibit,'cube',j%2?'#b88259':'#d1a47a',0,.24+j*.16,.12,4.85-j*.14,.12,.24);
    for(let i=0;i<3;i++){
      const hoop=ring(exhibit,iron,.31+i*.045,.030,1.52);
      hoop.rotation.x=0;hoop.position.x=(i-1)*.89;hoop.position.z=.20;
    }
    for(let i=0;i<6;i++)part(firstTool,'cube','#e2c297',-.45+i*.15,.816,.35-Math.sin(i)*.09,.08,.018,.05,0,i*.78);
  }else{
    part(exhibit,'cube','#4d5278',0,1.23,.02,4.82,1.32,.09);
    for(const y of [.54,1.92])part(exhibit,'cube',brass,0,y,.05,4.94,.065,.12);
    const stars=[[-2,.95],[-1.46,1.58],[-.74,1.29],[-.16,1.73],[.53,.98],[1.37,1.32],[2.04,1.68]];
    stars.forEach(([x,y],i)=>{
      part(exhibit,'diamond',parchment,x,y,.096,.076,.083,.039);
      if(i){
        const [px,py]=stars[i-1],dx=x-px,dy=y-py;
        part(exhibit,'cube',brass,(x+px)/2,(y+py)/2,.086,Math.hypot(dx,dy),.019,.016,0,0,Math.atan2(dy,dx));
      }
    });
    for(let i=0;i<8;i++){
      const angle=i*Math.PI/4;
      part(interior,'diamond',i%2?parchment:brass,Math.sin(angle)*.50,.061,.45+Math.cos(angle)*.50,.074,.013,.13,0,angle);
    }
  }
  return {silk,cask,orbit}[room.work](firstTool,secondTool);
}
