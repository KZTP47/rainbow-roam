import * as T from 'three';
import {part} from './models.js';
import {celMaterial} from './cel.js';
import {riverCenter,riverLevel,riverWidth,silverrunBridges,silverrunWalls} from './silverrun.js';

const cream='#f3dbb9', stone='#d1b6b6', trim='#ad869d', wood='#946761', gold='#efbc6a';
const windowGlass=celMaterial('#ffe3a0',{emissive:'#f3b975',emissiveIntensity:.23});
const shallows=celMaterial('#87cbc8',{emissive:'#569a9d',emissiveIntensity:.31});

export function house(group,blockers,height,x,z,yaw,roof,wall,width=4.9,stories=1){
  const g=new T.Group(),depth=4.2,h=2.7*stories;
  g.position.set(x,height(x,z)-.18,z);g.rotation.y=yaw;group.add(g);
  part(g,'cube',stone,0,.13,0,width+.22,.5,depth+.17);
  part(g,'cube',wall,0,h*.5+.23,0,width,h,depth);
  for(const side of [-1,1]){
    part(g,'cube',roof,side*width*.26,h+.96,0,width*.65,.24,depth+.54,0,0,-side*.55);
    part(g,'cube',wood,side*(width*.5-.05),h*.5+.22,2.14,.16,h,.13);
    part(g,'cube',wood,side*(width*.5-.05),h*.5+.22,-2.14,.16,h,.13);
    part(g,'cube',roof,side*width*.26,h+.9,depth*.5+.21,width*.62,.16,.14,0,0,-side*.55);
    for(let floor=0;floor<stories;floor++){
      const wx=side*width*.29,wy=1.85+floor*2.7;
      part(g,'cube',wood,wx,wy,2.14,.92,1.04,.16);
      part(g,'cube',windowGlass,wx,wy,2.24,.71,.79,.06);
      part(g,'cube',cream,wx,wy,2.29,.073,.79,.03);
      part(g,'cube',cream,wx,wy,2.29,.71,.07,.03);
      part(g,'cube','#bc8577',wx,wy-.52,2.29,1.04,.22,.39);
      for(let n=0;n<5;n++) part(g,'low',n%2?'#edacbe':'#a4b784',wx+(n-2)*.17,wy-.35,2.38,.13,.15,.13);
    }
  }
  const gable=new T.Shape().moveTo(-width*.5,0).lineTo(width*.5,0).lineTo(0,width*.30).closePath();
  const face=new T.ShapeGeometry(gable);
  for(const side of [-1,1]){
    const panel=new T.Mesh(face,celMaterial(wall));
    panel.position.set(0,h+.19,side*depth*.5);panel.rotation.y=side<0?Math.PI:0;g.add(panel);
    part(g,'cube',wood,0,h+.22,side*2.14,width+.1,.18,.14);
  }
  part(g,'cube',wood,0,1.2,2.17,1.22,1.96,.15);
  part(g,'sphere',wood,0,2.15,2.18,.61,.39,.11);
  part(g,'cube','#ca9680',0,1.18,2.27,.95,1.87,.08);
  part(g,'sphere',gold,.30,1.25,2.35,.076,.076,.04);
  part(g,'cube',stone,0,.26,2.28,1.49,.19,.54);
  part(g,'cube',trim,width*.3,h+1.35,-.92,.51,1.47,.53);
  part(g,'cube',cream,width*.3,h+2.08,-.92,.64,.16,.66);
  blockers.push([x,z,Math.abs(Math.cos(yaw))*width/2+Math.abs(Math.sin(yaw))*depth/2+.25,
    Math.abs(Math.sin(yaw))*width/2+Math.abs(Math.cos(yaw))*depth/2+.25]);
}

function tower(group,blockers,height,x,z,r,h,roof){
  const y=height(x,z);
  part(group,'cyl',stone,x,y+h*.5-.22,z,r,h+.45,r);
  part(group,'cyl',cream,x,y+h-.25,z,r*1.11,.36,r*1.11);
  part(group,'cone',roof,x,y+h+r*.94,z,r*1.13,r*1.94,r*1.13);
  part(group,'diamond',gold,x,y+h+r*1.95,z,r*.16,r*.34,r*.16);
  for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
    const px=x+Math.sin(angle)*r,pz=z+Math.cos(angle)*r;
    part(group,'cube',trim,px,y+h*.72,pz,.54,.98,.14,0,angle);
    part(group,'cube',windowGlass,px+Math.sin(angle)*.10,y+h*.72,pz+Math.cos(angle)*.10,.28,.74,.09,0,angle);
  }
  blockers.push([x,z,r+.22]);
}

function lineWall(group,blockers,height,ax,az,bx,bz){
  const length=Math.hypot(bx-ax,bz-az),x=(ax+bx)/2,z=(az+bz)/2,y=height(x,z);
  const horizontal=az===bz,yaw=horizontal?0:Math.PI*.5;
  part(group,'cube',stone,x,y+1.48,z,length,3.56,1.12,0,yaw);
  part(group,'cube',cream,x,y+3.19,z,length,.21,1.33,0,yaw);
  for(let d=.55;d<length-.14;d+=1.37){
    part(group,'cube',trim,ax+(bx-ax)*d/length,y+3.53,az+(bz-az)*d/length,.61,.62,1.05,0,yaw);
  }
  blockers.push([x,z,horizontal?length*.5:.75,horizontal?.75:length*.5]);
}

function gate(group,blockers,height,x,z,yaw=0,half=2.55){
  const y=height(x,z)+1.24;
  part(group,'cube',cream,x,y+2.29,z,half*2,1.15,1.35,0,yaw);
  part(group,'cube',trim,x,y+2.91,z,half*2+.28,.22,1.56,0,yaw);
  for(const side of [-1,1]){
    const tx=x+side*half*Math.cos(yaw),tz=z+side*half*Math.sin(yaw);
    tower(group,blockers,height,tx,tz,1.01,4.18,'#9592c1');
  }
  part(group,'diamond',gold,x,y+2.32,z,.44,.54,.75,0,yaw);
}

function stand(group,blockers,height,x,z,color){
  const y=height(x,z);
  for(const dx of [-1.27,1.27]) for(const dz of [-.72,.72])
    part(group,'cube',wood,x+dx,y+1.2,z+dz,.105,2.45,.105);
  for(let stripe=0;stripe<8;stripe++){
    const px=x+(stripe-3.5)*.34;
    part(group,'cube',stripe%2?cream:color,px,y+2.35,z,.35,.13,1.94,-.21);
    part(group,'sphere',stripe%2?cream:color,px,y+2.15,z+.94,.181,.20,.081);
  }
  part(group,'cube',wood,x,y+.7,z+.20,2.6,1.4,.80);
  part(group,'cube',cream,x,y+1.33,z+.2,2.72,.17,.88);
  for(let n=0;n<7;n++) part(group,'low',n%2?'#d88c83':'#e8be70',x+(n-3)*.30,y+1.5,z+.23,.19,.14,.17);
  blockers.push([x,z,1.46,.95]);
}

function city(group,blockers,height){
  const {west,east,north,south}=silverrunWalls;
  for(const z of [north,south]){
    const channel=riverCenter(z);
    lineWall(group,blockers,height,west,z,channel-3.9,z);
    lineWall(group,blockers,height,channel+3.9,z,8.4,z);
    lineWall(group,blockers,height,13.6,z,east,z);
    gate(group,blockers,height,11,z);
    // The river is open below these low water gates.
    part(group,'cube',stone,channel,riverLevel+2.74,z,7.8,1.2,1.27);
    part(group,'cube',cream,channel,riverLevel+3.38,z,7.95,.23,1.41);
  }
  for(const x of [west,east]){
    lineWall(group,blockers,height,x,north,x,11.4);
    lineWall(group,blockers,height,x,16.6,x,south);
    gate(group,blockers,height,x,14,Math.PI*.5);
    for(const z of [north,south]) tower(group,blockers,height,x,z,1.88,4.75,'#9299bd');
  }
  const roofs=['#ae869f','#739eaa','#bd858b','#928ab7'];
  const walls=['#f8ddb5','#f0c4b7','#eed5cd','#e1dec3'];
  const houses=[[3,22,0],[1,5,0],[2,-3,0],[23,-4,0],[29,-3,0],
    [24,5,0],[30,5,0],[23,22,Math.PI],[29,23,Math.PI],[1,28,Math.PI],[-18,3,Math.PI*.5],[-18,24,Math.PI*.5]];
  houses.forEach(([x,z,yaw],i)=>house(group,blockers,height,x,z,yaw,roofs[i%4],walls[i%4],i%4===1?4.6:4.9,i%3===0?1:2));
  for(const [x,z,yaw] of [[-2,-1,Math.PI*.5],[-4,6,Math.PI*.5],[-2,23,Math.PI*.5]])
    house(group,blockers,height,x,z,yaw,'#a586b1',cream,3.65);
  const y=height(11,12);
  for(let j=0;j<19;j++) for(let i=0;i<27;i++){
    const x=1.95+i*.82+(j%2)*.39,z=6.9+j*.74;
    const shade=['#ddc6b1','#e5cdb5','#e4c9bd','#e9d3bb'][(i*13+j*7+i*j)%4];
    const brick=part(group,'cube',shade,x,height(x,z)-.032,z,.801,.095,.723);
    brick.castShadow=false;
  }
  part(group,'cyl',cream,11,y+.18,12,2.59,.38,2.59);
  part(group,'cyl',stone,11,y+.41,12,2.32,.34,2.32);
  part(group,'cyl',shallows,11,y+.59,12,2.04,.07,2.04);
  part(group,'cyl',cream,11,y+.96,12,.46,.78,.46);
  part(group,'soft',gold,11,y+1.42,12,.44,.39,.72);
  part(group,'soft',gold,11,y+1.93,12+.34,.31,.40,.28);
  part(group,'cone','#fff0b6',11,y+1.98,12+.67,.15,.40,.15,Math.PI*.5);
  for(const side of [-1,1]){
    part(group,'soft','#e2ab6e',11+side*.58,y+1.86,11.96,.22,.75,.4,0,0,side*-.72);
    for(let j=0;j<4;j++) part(group,'sphere','#cef1e1',11+side*(.60+j*.13),y+1.10-j*.13,12,.072,.07,.072);
  }
  blockers.push([11,12,2.68]);
  for(const [x,z,color] of [[6,10,'#a3bfa4'],[6,17,'#e3a0a9'],[18,19,'#b39ac9'],[24,12,'#e5b17f']])
    stand(group,blockers,height,x,z,color);
  for(const [x,z] of [[7.3,25.4],[14.6,25.4],[4,15],[21,16],[16.7,7],[-4,13],[-17,12],[27,14]]){
    const y=height(x,z);
    part(group,'cyl',trim,x,y+1.32,z,.095,2.64,.095);
    part(group,'cube',gold,x,y+2.57,z,.39,.14,.39);
    part(group,'cube',windowGlass,x,y+2.79,z,.30,.36,.30);
    part(group,'cone',trim,x,y+3.06,z,.30,.24,.30);
  }

  const sy=height(11,-2);
  part(group,'cyl',cream,11,sy+.3,-2,3.28,.71,3.28);
  tower(group,blockers,height,11,-2,2.34,9.7,'#9383bd');
  for(const side of [-1,1]) tower(group,blockers,height,11+side*2.95,-2,1.23,6,'#aaa1cc');
  part(group,'cube','#9e7898',11,sy+1.2,.38,1.36,2.35,.22);
  part(group,'diamond',gold,11,sy+2.92,.55,.46,.58,.16);
  for(const side of [-1,1]){
    part(group,'cube','#c78ba8',11+side*1.55,sy+6.5,-.10,.72,2.6,.095);
    part(group,'diamond','#fff0c3',11+side*1.55,sy+6.72,-.041,.23,.39,.08);
  }
}

function river(scene,group,height,waterMaterial){
  const points=[],indices=[];
  for(let i=0;i<=118;i++){
    const z=i-59,x=riverCenter(z);
    points.push(x-riverWidth-1.35,riverLevel,z,x+riverWidth+1.35,riverLevel,z);
    if(i) indices.push(i*2-2,i*2,i*2-1,i*2-1,i*2,i*2+1);
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(points,3));geo.setIndex(indices);
  scene.add(new T.Mesh(geo,waterMaterial));
  for(const z of silverrunBridges){
    const x=riverCenter(z),y=height(x,z);
    part(group,'cube',stone,x,y-.27,z,7.8,.59,3.56);
    for(let n=0;n<18;n++)
      part(group,'cube',n%3?'#d5c2b0':'#e7d3b6',x+(n-8.5)*.43,y+.015,z,.41,.091,3.42);
    for(const side of [-1,1]){
      part(group,'cube',cream,x,y+.32,z+side*1.70,7.95,.48,.23);
      for(const dx of [-3.61,0,3.61]){
        part(group,'cube',trim,x+dx,y+.49,z+side*1.70,.34,.83,.36);
        part(group,'sphere',cream,x+dx,y+.95,z+side*1.70,.20,.14,.20);
      }
    }
  }
}

function mills(group,scene,blockers,height){
  const rotors=[];
  house(group,blockers,height,-12.55,-37.5,0,'#739cad',cream,4.8,2);
  const wheel=new T.Group();
  wheel.position.set(riverCenter(-35)+riverWidth-.28,riverLevel+1.6,-35);
  wheel.rotation.y=Math.PI*.32;
  scene.add(wheel);
  const axle=new T.Group();wheel.add(axle);
  const rim=new T.TorusGeometry(1.55,.13,7,28);
  for(const z of [-.36,.36]){
    const ring=new T.Mesh(rim,celMaterial('#aa795e'));
    ring.position.z=z;ring.castShadow=true;axle.add(ring);
  }
  for(let n=0;n<12;n++){
    const a=n*Math.PI/6;
    part(axle,'cube',wood,-Math.sin(a)*.76,Math.cos(a)*.76,0,.13,1.56,.13,0,0,a);
    part(axle,'cube','#bd9271',-Math.sin(a)*1.53,Math.cos(a)*1.53,0,.21,.38,.94,0,0,a);
  }
  part(wheel,'cyl',wood,0,0,.60,.21,1.9,.21,Math.PI*.5);
  rotors.push([axle,-.55]);
  for(const [x,z,yaw,color] of [[-6,-36,0,'#ac87a8'],[-25,-37,0,'#829eba'],[-4.5,-25,0,'#92ad90'],[-29,-24,Math.PI,'#bd8a76'],[-34,26,0,'#b18ea7'],[-46,27,0,'#bc867c'],[-30,10,Math.PI*.5,'#899fb3']])
    house(group,blockers,height,x,z,yaw,color,cream,4.24);
  for(const [x,z,s] of [[-43,11,1],[-31,3,.78],[-49,36,.83]]){
    const y=height(x,z);
    part(group,'cyl',cream,x,y+2.16*s,z,1.53*s,4.56*s,1.53*s);
    part(group,'cyl',stone,x,y+.31*s,z,1.67*s,.78*s,1.67*s);
    part(group,'cone','#b48292',x,y+5.12*s,z,1.77*s,1.93*s,1.77*s);
    part(group,'cube',wood,x,y+.96*s,z+1.50*s,.69*s,1.67*s,.17);
    part(group,'cube',windowGlass,x-.72*s,y+2.53*s,z+1.40*s,.32*s,.54*s,.10);
    blockers.push([x,z,1.75*s]);
    const rotor=new T.Group();rotor.position.set(x,y+3.94*s,z+1.69*s);rotor.scale.setScalar(s);scene.add(rotor);
    part(group,'cyl',wood,x,y+3.94*s,z+1.62*s,.29*s,.69*s,.29*s,Math.PI*.5);
    for(let n=0;n<4;n++){
      const sail=new T.Group();sail.rotation.z=n*Math.PI/2;rotor.add(sail);
      part(sail,'cube',wood,0,1.68,0,.14,3.25,.13);
      part(sail,'cube',n%2?'#edb3ad':'#fff0cf',.42,2.09,.045,.68,2.31,.13);
      for(let j=0;j<4;j++) part(sail,'cube','#c79d82',.40,1.17+j*.63,.113,.74,.066,.055);
    }
    part(rotor,'sphere',gold,0,0,.12,.23,.23,.22);
    rotors.push([rotor,.39*s]);
  }
  for(let row=0;row<7;row++) for(let col=0;col<22;col++){
    const x=-40.3+col*.52,z=30+row*.91+Math.sin(col*.23)*.35,y=height(x,z);
    const h=.46+.13*Math.sin(row*2+col);
    part(group,'cube','#bc955a',x,y+h*.40,z,.049,h,.058,0,0,.11);
    part(group,'diamond',col%3?'#e8bd66':'#f5d78d',x-.03,y+h,z,.095,.22,.10,0,0,.23);
  }
  return t=>rotors.forEach(([mesh,speed],i)=>{mesh.rotation.z=t*speed+.38+i*.73;});
}

export function populateSilverrun(group,scene,height,blockers,waterMaterial){
  river(scene,group,height,waterMaterial);
  city(group,blockers,height);
  return mills(group,scene,blockers,height);
}
