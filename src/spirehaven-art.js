import * as T from 'three';
import {branch,material,part} from './models.js';
import {celMaterial} from './cel.js';
import {arcanum,riverCenter,riverLevel,silverrunWalls} from './silverrun.js';
import {seeded} from './map-data.js';

const stone='#cfb9a4', ashlar='#edd6b5', mortar='#a89491', gold='#ecc77c', timber='#654951';
const glass=celMaterial('#ffe7a7',{emissive:'#ffb762',emissiveIntensity:.48});
const violet=celMaterial('#b79cee',{emissive:'#9457e1',emissiveIntensity:.65});
const aqua=celMaterial('#8bdfd8',{emissive:'#5eafc5',emissiveIntensity:.32});
const tiles=['#ba9b8b','#cdb1a1','#b7a5a1','#d8baa6','#ccbaa9'];

function placed(parent,x,y,z,yaw=0){
  const group=new T.Group();
  group.position.set(x,y,z);group.rotation.y=yaw;parent.add(group);
  return group;
}

function arch(group,x,y,z,r,spring,thickness,depth,color){
  const R=r+thickness,shape=new T.Shape();
  shape.moveTo(-R,0).lineTo(-R,spring).absarc(0,spring,R,Math.PI,0,true).lineTo(R,0).lineTo(r,0)
    .lineTo(r,spring).absarc(0,spring,r,0,Math.PI,false).lineTo(-r,0).closePath();
  const mesh=new T.Mesh(new T.ExtrudeGeometry(shape,{steps:1,depth,bevelEnabled:false,curveSegments:10}),material(color));
  mesh.position.set(x,y,z-depth*.5);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);
  return mesh;
}

function star(group,x,y,z,color,size){
  const shape=new T.Shape();
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4,r=i%2?size*.36:size;
    if(i) shape.lineTo(Math.sin(a)*r,Math.cos(a)*r);else shape.moveTo(0,r);
  }
  shape.closePath();
  const mesh=new T.Mesh(new T.ShapeGeometry(shape),celMaterial(color,{side:T.DoubleSide}));
  mesh.position.set(x,y,z);group.add(mesh);
}

function lantern(group,x,y,z,scale=1){
  part(group,'cube',timber,x,y-.20*scale,z,.27*scale,.11*scale,.27*scale);
  part(group,'cube',glass,x,y,z,.22*scale,.34*scale,.22*scale);
  part(group,'cone','#6f5e70',x,y+.26*scale,z,.24*scale,.18*scale,.24*scale);
}

function streetLamp(parent,x,z,y){
  part(parent,'cyl','#6b5669',x,y+1.38,z,.072,2.77,.072);
  part(parent,'cyl',stone,x,y+.15,z,.18,.32,.18);
  lantern(parent,x,y+2.66,z,1.28);
}

function townhouse(parent,blockers,height,spec){
  const [x,z,yaw,w,d,stories,wall,roof,shop]=spec;
  const group=placed(parent,x,height(x,z)-.15,z,yaw);
  const ground=2.17,upper=2.03,h=ground+upper*(stories-1),over=.25;
  const slope=.77,peak=w*.48;
  const box=(color,x,y,z,a,b,c,rz=0)=>part(group,'cube',color,x,y,z,a,b,c,0,0,rz);
  box(mortar,0,.14,0,w+.24,.43,d+.25);
  box(shop?'#b29588':wall,0,ground/2,0,w,ground,d);
  const front=d*.5;
  for(let floor=1;floor<stories;floor++){
    const y=ground+(floor-1)*upper;
    box(wall,0,y+upper*.5,0,w+.16,upper,d+over*2);
    box(timber,0,y+.08,front+over,w+.19,.15,.15);
    box('#976a62',0,y+.23,front+over+.01,w+.20,.075,.17);
    for(const sign of [-1,1]){
      for(const fraction of [.13,.48]) box(timber,sign*w*fraction,y+upper*.5,front+over+.045,.12,upper,.12);
      box(timber,sign*w*.32,y+.60,front+over+.046,.112,1.44,.12,sign*.66);
      const wx=sign*w*.26,wy=y+1.22;
      box(timber,wx,wy,front+over+.09,.78,.99,.17);
      box(glass,wx,wy,front+over+.19,.57,.72,.041);
      box('#e2bc98',wx,wy,front+over+.225,.043,.76,.036);
      box('#e2bc98',wx,wy,front+over+.225,.62,.045,.036);
      box(roof,wx,wy-.50,front+over+.17,.87,.11,.30);
      if(floor===1){
        box('#9f726a',wx,wy-.57,front+over+.25,.86,.23,.32);
        for(let i=0;i<5;i++) part(group,'low',i%2?'#eaa1c2':'#86a47f',wx+(i-2)*.135,wy-.43+(i%2)*.055,front+over+.35,.12,.13,.12);
      }
      box(timber,sign*(w*.5+.09),y+upper*.54,0,.13,upper,d+.42);
      box(glass,sign*(w*.5+.10),y+1.25,.06,.034,.70,.52);
    }
  }
  arch(group,0,.13,front+.073,.52,1.03,.12,.16,timber);
  box(shop?'#9b7163':'#a77b69',0,.77,front+.046,1.04,1.29,.10);
  part(group,'sphere',gold,.35,.89,front+.13,.052,.055,.055);
  for(const side of [-1,1]){
    box(timber,side*w*.32,1.31,front+.041,.76,1,.16);
    box(glass,side*w*.32,1.31,front+.137,.61,.78,.043);
    box('#f4c49a',side*w*.32,1.32,front+.164,.65,.052,.034);
    box('#f4c49a',side*w*.32,1.32,front+.164,.049,.80,.034);
  }
  const triangle=new T.Shape().moveTo(-w*.52,0).lineTo(w*.52,0).lineTo(0,peak).closePath();
  const end=new T.ShapeGeometry(triangle);
  for(const face of [-1,1]){
    const wallEnd=new T.Mesh(end,material(wall));
    wallEnd.position.set(0,h,d*.5*face+face*over);wallEnd.rotation.y=face<0?Math.PI:0;
    wallEnd.castShadow=true;group.add(wallEnd);
    box(timber,0,h,face*(front+over),w+.24,.15,.16);
  }
  box(timber,0,h+peak*.42,front+over+.059,.12,peak*.81,.15);
  part(group,'cyl',timber,0,h+peak*.40,front+over+.10,.32,.12,.32,Math.PI/2);
  part(group,'cyl',glass,0,h+peak*.40,front+over+.17,.24,.07,.24,Math.PI/2);
  const roofSpan=Math.hypot(w*.56,peak+.13);
  for(const side of [-1,1]){
    box(roof,side*w*.27,h+peak*.54,0,roofSpan,.17,d+.92,-side*slope);
    for(let row=0;row<5;row++){
      const f=(row+.52)/5;
      box(row%2?'#75677c':roof,side*w*.53*f,h+peak*(1-f)+.07,0,.077,.065,d+.96,-side*slope);
    }
    box(timber,side*w*.28,h+peak*.54,front+.438,roofSpan+.12,.14,.11,-side*slope);
  }
  box('#a27167',w*.30,h+peak*.74,-d*.25,.43,1.34,.60);
  box(stone,w*.30,h+peak*.74+.67,-d*.25,.57,.15,.73);
  if(shop){
    for(let i=0;i<9;i++) part(group,'cube',i%2?ashlar:roof,(i-4)*w*.087,ground-.19,front+.47,w*.089,.084,.92,.2);
    part(group,'cube',timber,-w*.32,ground+.19,front+.32,.48,.08,.63);
    const sign=part(group,'cube',roof,-w*.32,ground-.06,front+.60,.48,.43,.10);
    sign.rotation.y=.04;
    star(group,-w*.32,ground-.06,front+.658,gold,.14);
  }
  blockers.push([x,z,Math.abs(Math.cos(yaw))*w*.5+Math.abs(Math.sin(yaw))*d*.5+.16,
    Math.abs(Math.sin(yaw))*w*.5+Math.abs(Math.cos(yaw))*d*.5+.16]);
}

function tower(group,blockers,height,x,z,radius,h,roof){
  const y=height(x,z);
  part(group,'cyl',stone,x,y+h*.5-.22,z,radius,h+.46,radius);
  for(const [level,depth,spread,color] of [[.12,.34,1.12,mortar],[.48,.19,1.04,ashlar],[.82,.23,1.08,ashlar],[.98,.42,1.15,mortar]]){
    part(group,'cyl',color,x,y+h*level,z,radius*spread,depth,radius*spread);
  }
  const point=radius*2.52;
  part(group,'cone',roof,x,y+h+point*.48,z,radius*1.18,point,radius*1.18);
  for(const ring of [.18,.42,.68]){
    const rr=radius*1.18*(1-ring);
    part(group,'cyl',ring===.68?gold:roof,x,y+h+point*ring,z,rr,.09,rr);
  }
  part(group,'diamond',gold,x,y+h+point,z,radius*.13,radius*.38,radius*.13);
  for(let n=0;n<4;n++){
    const angle=n*Math.PI/2;
    const recess=placed(group,x+Math.sin(angle)*(radius-.035),y+h*.61,z+Math.cos(angle)*(radius-.035),angle);
    part(recess,'cube','#6d5a70',0,.27,.046,.43,1.05,.125);
    part(recess,'soft','#6d5a70',0,.80,.059,.22,.28,.089);
    part(recess,'cube',glass,0,.28,.13,.19,.75,.052);
    part(recess,'cube',ashlar,0,-.29,.12,.66,.13,.22);
  }
  blockers.push([x,z,radius+.18]);
}

function wall(group,blockers,height,ax,az,bx,bz){
  const length=Math.hypot(bx-ax,bz-az);
  const x=(ax+bx)*.5,z=(az+bz)*.5,horizontal=az===bz;
  const y=height(x,z);
  const face=placed(group,x,y,z,horizontal?0:Math.PI/2);
  part(face,'cube',stone,0,1.38,0,length,3.74,1.19);
  part(face,'cube',mortar,0,.25,0,length+.06,.47,1.36);
  part(face,'cube',ashlar,0,3.19,0,length,.31,1.49);
  for(let i=0;i<Math.floor(length/1.38);i++){
    const px=(i+.5)*1.38-length*.5;
    part(face,'cube',stone,px,3.59,0,.83,.62,1.04);
    part(face,'cube',ashlar,px,3.92,0,.94,.13,1.18);
    if(i%3===1) for(const side of [-1,1]) part(face,'cube','#bc9e8f',px,1.91,side*.603,.79,.29,.04);
  }
  blockers.push([x,z,horizontal?length*.5:.78,horizontal?.78:length*.5]);
}

function gate(group,blockers,height,x,z,yaw=0){
  const y=height(x,z);
  const g=placed(group,x,y-.15,z,yaw);
  arch(g,0,0,0,2.02,2.04,.58,1.55,stone);
  for(let i=0;i<11;i++){
    const a=Math.PI*(i+.5)/11;
    for(const sign of [-1,1]) part(g,'cube',i%2?ashlar:stone,Math.cos(a)*2.32,2.04+Math.sin(a)*2.32,sign*.81,
      .53,.28,.17,0,0,a-Math.PI/2);
  }
  part(g,'cube',mortar,0,4.65,0,5.76,.32,1.68);
  for(let i=-3;i<=3;i++) part(g,'cube',ashlar,i*.78,5.02,0,.47,.53,1.48);
  star(g,0,4.71,1.00,gold,.38);
  for(const side of [-1,1]){
    const tx=x+side*2.85*Math.cos(yaw),tz=z+side*2.85*Math.sin(yaw);
    tower(group,blockers,height,tx,tz,1.30,5.12,'#648599');
    lantern(g,side*1.85,2.22,1.08,1.4);
  }
}

function bunting(group,from,to,tints){
  const count=16;
  const points=Array.from({length:count+1},(_,i)=>{
    const t=i/count;
    return from.map((v,axis)=>T.MathUtils.lerp(v,to[axis],t)-(axis===1?Math.sin(t*Math.PI)*.95:0));
  });
  for(let i=1;i<points.length;i++){
    branch(group,'#826668',points[i-1],points[i],.018);
    const middle=points[i].map((v,j)=>(v+points[i-1][j])*.5);
    part(group,'diamond',tints[i%tints.length],middle[0],middle[1]-.16,middle[2],.205,.29,.028,0,0,i%2?.08:-.12);
  }
}

function stall(parent,blockers,height,x,z,yaw,tint,fruit){
  const group=placed(parent,x,height(x,z),z,yaw);
  for(const dx of [-1.28,1.28]) for(const dz of [-.70,.70]){
    part(group,'cube',timber,dx,1.25,dz,.113,2.53,.107);
  }
  for(let n=0;n<10;n++){
    const x=(n-4.5)*.286,color=n%2?tint:'#fff0c8';
    part(group,'cube',color,x,2.43,0,.30,.087,1.98,-.20);
    part(group,'soft',color,x,2.19,.95,.157,.17,.072);
  }
  part(group,'cube','#a67465',0,.65,.29,2.53,1.27,.84);
  part(group,'cube',tint,0,.65,.73,2.24,.71,.055);
  part(group,'cube',ashlar,0,1.33,.28,2.75,.16,.98);
  for(let tray=0;tray<3;tray++){
    const tx=(tray-1)*.76;
    part(group,'cube','#a77759',tx,1.43,.29,.66,.123,.6);
    for(let i=0;i<6;i++) part(group,'low',fruit[(i+tray)%fruit.length],tx+(i%3-1)*.156,1.59+(i%2)*.045,
      .13+(i>=3?.24:0),.105,.115,.10,0,0,.34*i);
  }
  blockers.push([x,z,Math.abs(Math.cos(yaw))*1.45+Math.abs(Math.sin(yaw))*.84,
    Math.abs(Math.sin(yaw))*1.45+Math.abs(Math.cos(yaw))*.84]);
}

function blossom(group,x,y,z,seed){
  const rand=seeded(seed);
  part(group,'cyl',ashlar,x,y+.16,z,1.05,.33,1.05);
  part(group,'cyl','#97806b',x,y+.35,z,.89,.11,.89);
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3,px=x+Math.cos(a)*(.68+rand()*.55),pz=z+Math.sin(a)*(.68+rand()*.55),py=y+2.45+rand()*.88;
    branch(group,'#89696c',[x,y+.19,z],[px,py,pz],.095,.76);
    for(let j=0;j<4;j++) part(group,'soft',['#dc8eb0','#f0aec6','#fabfca','#c97cab'][(i+j)%4],
      px+(rand()-.5)*.95,py+rand()*.81,pz+(rand()-.5)*.83,.72+rand()*.37,.49+rand()*.44,.70+rand()*.29,.12,a,.12);
  }
}

function cobbles(group,height,x1,x2,z1,z2,contains=()=>true){
  for(let row=0,z=z1;z<z2;row++,z+=.59){
    for(let col=0,x=x1+(row%2)*.31;x<x2;col++,x+=.63){
      if(!contains(x,z)) continue;
      part(group,'cube',tiles[(row*13+col*7+row*col)%tiles.length],x,height(x,z)-.023,z,.609,.082,.565).castShadow=false;
    }
  }
}

function fountain(group,scene,blockers,height){
  const x=11,z=12,y=height(x,z);
  const base=placed(group,x,y,z);
  for(const [radius,cy,depth,tint] of [[2.61,.11,.28,mortar],[2.48,.30,.15,ashlar],[2.33,.48,.27,stone],[2.37,.61,.13,ashlar],
    [2.17,.66,.08,'#7dc7c9'],[1.08,.72,.12,stone],[.44,1.01,.51,ashlar]]){
    part(base,'cyl',tint,0,cy,0,radius,depth,radius);
  }
  const gryphon='#d89f60',wing='#ebc07d';
  part(base,'soft',gryphon,0,1.43,-.04,.46,.37,.74);
  part(base,'soft',wing,0,1.84,.40,.36,.50,.37);
  part(base,'soft',wing,0,2.21,.55,.31,.33,.30);
  part(base,'cone','#ffd894',0,2.15,.88,.16,.38,.17,Math.PI/2);
  for(const side of [-1,1]){
    const xx=side*.28;
    part(base,'soft',gryphon,xx,1.25,.37,.142,.38,.15,0,0,side*.19);
    part(base,'soft',wing,xx,1.08,.56,.20,.11,.19);
    part(base,'sphere','#503c49',side*.251,2.25,.68,.052,.053,.034);
    for(let n=0;n<7;n++){
      const r=.45+n*.133;
      part(base,'soft',n%2?gryphon:wing,side*r,1.81+n*.125,-.19+n*.022,.19,.37+n*.038,.165,0,side*.3,-side*.44);
    }
  }
  const effects=placed(scene,x,y,z);
  const orb=part(effects,'diamond',aqua,0,2.84,0,.28,.43,.28);
  const sprays=[];
  for(let j=0;j<24;j++) sprays.push(part(effects,'sphere',aqua,0,0,0,.044,.075,.044));
  blockers.push([x,z,2.68]);
  return t=>{
    orb.position.y=2.91+Math.sin(t*.88)*.12;orb.rotation.y=t*.8;
    for(let j=0;j<sprays.length;j++){
      const t0=(t*.72+j%6/6)%1,a=Math.floor(j/6)*Math.PI*.5+Math.PI*.25;
      const radial=.61+t0*1.45;
      sprays[j].position.set(Math.sin(a)*radial,.68+Math.sin(t0*Math.PI)*.96,Math.cos(a)*radial);
    }
  };
}

function arcanumHill(group,scene,blockers,height){
  const {x,z}=arcanum;
  for(let i=0;i<18;i++){
    const zz=3.4-i*.61,y=height(x,zz);
    part(group,'cube',i%4?stone:ashlar,x,y-.115,zz,4.06,.25,.63);
    for(const side of [-1,1]){
      part(group,'cube',mortar,x+side*2.19,y+.24,zz,.33,.63,.63);
      part(group,'cube',ashlar,x+side*2.19,y+.55,zz,.43,.11,.64);
    }
  }
  for(const zz of [2.7,-1.7,-6.5]) for(const side of [-1,1]){
    const xx=x+side*2.66,y=height(xx,zz);
    part(group,'cube',ashlar,xx,y+.36,zz,.82,.72,.84);
    part(group,'cyl',stone,xx,y+1.16,zz,.24,1.23,.24);
    part(group,'diamond',violet,xx,y+1.92,zz,.22,.33,.22);
  }
  const sy=height(x,z);
  part(group,'cyl',ashlar,x,sy+.30,z,3.45,1.13,3.45);
  tower(group,blockers,height,x,z,2.78,15.0,'#72578c');
  for(const side of [-1,1]){
    tower(group,blockers,height,x+side*4.42,z-.97,1.40,8.1,side<0?'#607e99':'#8d70a1');
    const xx=x+side*1.42;
    part(group,'cube','#77638f',xx,sy+5.3,z+2.56,.74,2.5,.12);
    star(group,xx,sy+5.63,z+2.65,gold,.27);
  }
  const portal=placed(group,x,sy,z+2.62);
  arch(portal,0,0,0,1.03,1.7,.33,.29,ashlar);
  part(portal,'cube','#6b577c',0,.96,.16,1.99,1.92,.15);
  part(portal,'soft','#6b577c',0,1.75,.16,1.008,.95,.075);
  star(portal,0,2.13,.255,gold,.40);
  const ring=placed(scene,x,sy+17.55,z);
  for(const [radius,rotate] of [[4.25,.30],[3.99,-.35]]){
    const mesh=new T.Mesh(new T.TorusGeometry(radius,.075,7,66),material(gold));
    mesh.rotation.set(Math.PI/2+rotate,0,rotate);ring.add(mesh);
  }
  for(let n=0;n<10;n++){
    const a=n*Math.PI*.2;
    part(ring,'diamond',violet,Math.cos(a)*4.15,Math.sin(a*2)*.48,Math.sin(a)*4.15,.15,.28,.15);
  }
  return t=>{ring.rotation.y=t*.18;ring.rotation.z=Math.sin(t*.37)*.063;};
}

function clockTower(group,blockers,height,x,z){
  const y=height(x,z);
  tower(group,blockers,height,x,z,1.74,8.7,'#608798');
  for(const yaw of [0,Math.PI/2,-Math.PI/2]){
    const dial=placed(group,x+Math.sin(yaw)*1.69,y+6.66,z+Math.cos(yaw)*1.69,yaw);
    part(dial,'cyl',gold,0,0,0,.69,.16,.69,Math.PI/2);
    part(dial,'cyl','#fff0c3',0,0,.111,.55,.12,.55,Math.PI/2);
    for(let n=0;n<12;n++){
      const a=n*Math.PI/6;
      part(dial,'cube',timber,Math.sin(a)*.44,Math.cos(a)*.44,.184,.041,.083,.032,0,0,-a);
    }
    part(dial,'cube',timber,.045,.138,.206,.056,.36,.038,0,0,-.37);
    part(dial,'cube',timber,-.12,.008,.226,.049,.31,.038,0,0,-1.43);
  }
}

export function populateSpirehaven(group,scene,blockers,height){
  const {west,east,north,south}=silverrunWalls;
  for(const z of [north,south]){
    const channel=riverCenter(z);
    wall(group,blockers,height,west,z,channel-3.95,z);
    wall(group,blockers,height,channel+3.95,z,8.05,z);
    wall(group,blockers,height,13.95,z,east,z);
    gate(group,blockers,height,11,z);
    arch(group,channel,riverLevel-.26,z,3.57,.60,.43,1.49,stone);
  }
  for(const x of [west,east]){
    wall(group,blockers,height,x,north,x,11.05);
    wall(group,blockers,height,x,16.95,x,south);
    gate(group,blockers,height,x,14,Math.PI/2);
    for(const z of [north,south]) tower(group,blockers,height,x,z,1.63,5.6,'#8d7296');
  }
  const buildings=[
    [3,24.6,Math.PI/2,4.35,4.15,2,'#f7d6a5','#598e92',1],
    [2.12,29.1,Math.PI/2,4.06,3.84,3,'#ebad92','#9e655f',1],
    [19.42,25.4,-Math.PI/2,4.20,3.82,3,'#efc190','#7f658c',1],
    [19.66,29.72,-Math.PI/2,4.02,4.02,2,'#f4d8aa','#a77954',1],
    [24.3,23.6,Math.PI,4.5,4.2,2,'#dbbbbe','#7795a0',1],
    [29.25,22.2,Math.PI,4.69,4.32,3,'#efd0a2','#a16870',1],
    [27.5,28.35,Math.PI,4.68,4.34,2,'#e6baa7','#639291',0],
    [31.12,29.4,Math.PI,3.2,3.14,2,'#eed2af','#957aa0',0],
    [1.25,5.15,0,4.65,4.17,3,'#eec79f','#826f9b',1],
    [5.96,4.55,0,4.28,4.10,2,'#e3bbab','#668b88',1],
    [-3.42,5.40,0,4.31,4.16,2,'#f4d79c','#9d6f60',1],
    [-3.6,21.35,Math.PI,4.03,4.03,3,'#d9c0bf','#6c839b',0],
    [-4.83,26.16,Math.PI/2,3.5,3.85,2,'#f1c38e','#7e699a',0],
    [28.10,3.5,-Math.PI*.5,4.04,4.12,3,'#f5d7aa','#936585',0],
    [30.67,-1.23,Math.PI,4.31,4.13,2,'#e0b8b7','#6b9298',0],
    [29.62,-9.25,-Math.PI*.5,4.5,4.32,3,'#ecd1b4','#977390',0],
    [4.85,-5.53,Math.PI/2,4.26,4.16,3,'#ebbaa6','#659394',1],
    [-.25,-2.92,0,4.44,4.0,2,'#ead3a1','#997a57',0],
    [-5.10,-3.65,Math.PI/2,4.21,4.35,3,'#ebc6b7','#80729e',1],
    [3.9,-12.35,0,4.4,4.0,2,'#ecb783','#92729d',1],
    [-1.08,-11.65,0,4.33,4.11,3,'#edcdac','#708699',0],
    [-5.78,-11.50,0,3.83,4.12,2,'#e4b5ad','#946273',1],
    [-22.17,3.53,Math.PI/2,4.38,3.7,3,'#e9c7ac','#617c95',0],
    [-22.07,-2.19,Math.PI/2,4.45,3.73,2,'#ecc8a1','#a77361',1],
    [-22.05,22.13,Math.PI/2,4.14,3.73,2,'#d9b1aa','#9b6a91',1],
    [-22.04,27.35,Math.PI/2,4.25,3.56,3,'#eee0bc','#76958f',0]
  ];
  for(const specs of buildings) townhouse(group,blockers,height,specs);
  cobbles(group,height,1.8,26,6.6,21);
  cobbles(group,height,7.1,15.9,21,31.35);
  cobbles(group,height,-9,2.3,12,16.1);
  cobbles(group,height,-12,-4.4,-12,29,(x,z)=>{
    const d=x-riverCenter(z);return d>4.64&&d<6.03&&Math.abs(z-14)>2.02;
  });
  for(let z=-11;z<=28;z+=.68){
    const x=riverCenter(z)+4.08,y=height(x,z);
    if(Math.abs(z-14)>2.04) part(group,'cube',z%2<1?stone:ashlar,x,y-.09,z,.42,.40,.69,0,-.13);
  }
  for(const [x,z] of [[2.25,10.2],[25.0,17.9],[5.35,-8.5],[26.7,-4.55]]) blossom(group,x,height(x,z),z,Math.round((x+34)*96));
  for(const [x,z,yaw,tint,fruit] of [
    [5.95,9.35,Math.PI/2,'#81bdb7',['#90cd96','#efc883']],
    [6.0,17.75,Math.PI/2,'#d588a8',['#e78d91','#eac27e']],
    [18.85,19.2,-Math.PI/2,'#bea1db',['#ad91dc','#f8c6d9']],
    [22.7,10.4,0,'#eeaf71',['#f7cc86','#c77f6f']],
    [6.05,22.5,Math.PI/2,'#a590cc',['#a891d4','#edb67a']],
    [22.85,6.45,0,'#7fbbb8',['#afc58c','#d9a6b0']]
  ]) stall(group,blockers,height,x,z,yaw,tint,fruit);
  for(const [x,z] of [[7.14,25.5],[14.85,25.65],[4.2,15.1],[21.0,16.1],[16.8,7.0],[-4.51,12.1],[-17.65,12.5],[28.4,15.9],[-7.08,20.4],[-8.35,8.25]]){
    streetLamp(group,x,z,height(x,z));
  }
  for(const zz of [7.03,17.1,24.5]){
    const x1=zz>20?5.2:3.8,x2=zz>20?16.4:23.5;
    for(const x of [x1,x2]){
      const y=height(x,zz);
      part(group,'cyl',timber,x,y+2.70,zz,.047,5.4,.047);
      part(group,'diamond',gold,x,y+5.43,zz,.12,.17,.12);
    }
    bunting(group,[x1,height(x1,zz)+5.38,zz],[x2,height(x2,zz)+5.38,zz],['#d78cad','#92c6c2','#edbe78','#a48bca']);
  }
  clockTower(group,blockers,height,26.2,9.55);
  const animateFountain=fountain(group,scene,blockers,height);
  const animateArcanum=arcanumHill(group,scene,blockers,height);
  return t=>{animateFountain(t);animateArcanum(t);};
}
