import * as T from 'three';
import {part} from './models.js';
import {celMaterial} from './cel.js';
import {kingfisherBridge,riverCenter,riverLevel,riverWidth,silverrunBridges} from './silverrun.js';
import {populateSpirehaven} from './spirehaven-art.js';

const cream='#f3dbb9', stone='#d1b6b6', trim='#ad869d', wood='#946761', gold='#efbc6a';
const windowGlass=celMaterial('#ffe3a0',{emissive:'#f3b975',emissiveIntensity:.23});

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
    if(z===kingfisherBridge){
      for(let n=0;n<20;n++) part(group,'cube',n%2?'#bb907a':'#a27969',x+(n-9.5)*.39,y+.026,z,.38,.08,3.45);
      for(const side of [-1,1]){
        for(let n=-2;n<=2;n++){
          const px=x+n*1.89,edge=z+side*1.59;
          part(group,'cube','#6f5057',px,y+1.37,edge,.17,2.75,.16);
          part(group,'cube',wood,px+.40,y+2.48,edge,.083,1.21,.09,0,0,.72);
        }
        part(group,'cube',wood,x,y+.63,z+side*1.60,7.83,.41,.14);
        part(group,'cube','#65778f',x,y+3.17,z+side*.92,8.36,.13,2.19,-side*.39);
        for(let i=1;i<=4;i++) part(group,'cube','#8297a2',x,y+3.52-i*.169,z+side*i*.43,8.41,.078,.077);
      }
      part(group,'cube',trim,x,y+3.60,z,8.48,.14,.21);
      for(const side of [-1,1]){
        part(group,'diamond',gold,x+side*4.18,y+3.77,z,.15,.23,.15);
        part(group,'cube',windowGlass,x+side*3.14,y+2.32,z,.18,.29,.19);
      }
      continue;
    }
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
  const city=populateSpirehaven(group,scene,blockers,height);
  const turnMills=mills(group,scene,blockers,height);
  return (time,player,progress)=>{city(time,player,progress);turnMills(time);};
}
