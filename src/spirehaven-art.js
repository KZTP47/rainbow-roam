import * as T from 'three';
import {animate,branch,material,part,person} from './models.js';
import {celMaterial} from './cel.js';
import {arcanum,overBridge,riverCenter,riverLevel,silverrunWalls} from './silverrun.js';
import {wardWorkshops} from './ward-workshops.js';
import {wards,relayPosts} from './city-wards.js';
import {seeded} from './map-data.js';
import {rooms} from './spirehaven-rooms.js';
import {populateWalkInRooms} from './spirehaven-room-art.js';

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

function townhouse(parent,blockers,height,spec,room=false){
  const [x,z,yaw,w,d,stories,wall,roof,shop]=spec;
  const group=placed(parent,x,height(x,z)-.15,z,yaw);
  const ground=2.17,upper=2.03,h=ground+upper*(stories-1),over=.25;
  const slope=.77,peak=w*.48;
  const box=(color,x,y,z,a,b,c,rz=0)=>part(group,'cube',color,x,y,z,a,b,c,0,0,rz);
  if(!room){
    box(mortar,0,.14,0,w+.24,.43,d+.25);
    box(shop?'#b29588':wall,0,ground/2,0,w,ground,d);
  }
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
      const sx=sign*(w*.5+.09),back=-front-over;
      box(timber,sx,y+.08,0,.14,.16,d+.49);
      box(timber,sx,y+upper*.50,0,.12,upper,.14);
      box(timber,sx,y+upper*.54,sign*front*.95,.14,upper,.13);
      for(const at of [-.48,.48]){
        const pz=d*at*.77;
        box(timber,sx+sign*.043,y+1.20,pz,.12,.91,.80);
        box(glass,sx+sign*.113,y+1.22,pz,.037,.70,.58);
        box('#d7b392',sx+sign*.141,y+1.22,pz,.041,.05,.62);
        box('#d7b392',sx+sign*.141,y+1.22,pz,.041,.74,.05);
        box(roof,sx+sign*.081,y+.74,pz,.25,.10,.91);
      }
      box(timber,sign*w*.26,y+1.22,back-.043,.81,.94,.14);
      box(glass,sign*w*.26,y+1.22,back-.131,.64,.70,.041);
      box(timber,sign*w*.26,y+1.22,back-.16,.05,.76,.035);
      box(timber,sign*w*.486,y+1.02,back-.066,.14,upper,.13);
    }
    box(timber,0,y+.08,-front-over,w+.16,.16,.15);
  }
  if(!room){
    arch(group,0,.13,front+.073,.52,1.03,.12,.16,timber);
    box(shop?'#9b7163':'#a77b69',0,.77,front+.046,1.04,1.29,.10);
    part(group,'sphere',gold,.35,.89,front+.13,.052,.055,.055);
    for(const side of [-1,1]){
      box(timber,side*w*.32,1.31,front+.041,.76,1,.16);
      box(glass,side*w*.32,1.31,front+.137,.61,.78,.043);
      box('#f4c49a',side*w*.32,1.32,front+.164,.65,.052,.034);
      box('#f4c49a',side*w*.32,1.32,front+.164,.049,.80,.034);
      const sx=side*(w*.5+.05);
      box(timber,sx,.23,0,.14,.23,d+.12);
      box(timber,sx,1.12,-d*.18,.14,.92,.94);
      box(glass,sx+side*.079,1.15,-d*.18,.051,.67,.72);
      box('#d7b392',sx+side*.117,1.15,-d*.18,.034,.70,.057);
    }
  }
  const triangle=new T.Shape().moveTo(-w*.52,0).lineTo(w*.52,0).lineTo(0,peak).closePath();
  const end=new T.ShapeGeometry(triangle);
  for(const face of [-1,1]){
    const wallEnd=new T.Mesh(end,material(wall));
    wallEnd.position.set(0,h,d*.5*face+face*over);wallEnd.rotation.y=face<0?Math.PI:0;
    wallEnd.castShadow=true;group.add(wallEnd);
    box(timber,0,h,face*(front+over),w+.24,.15,.16);
    box(timber,0,h+peak*.43,face*(front+over+.059),.12,peak*.80,.15);
  }
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
  if(!room) blockers.push([x,z,Math.abs(Math.cos(yaw))*w*.5+Math.abs(Math.sin(yaw))*d*.5+.16,
    Math.abs(Math.sin(yaw))*w*.5+Math.abs(Math.cos(yaw))*d*.5+.16]);
}

function tower(group,blockers,height,x,z,radius,h,roof,lower=0){
  const y=height(x,z);
  part(group,'cyl',stone,x,y+(h+lower)*.5-.22,z,radius,h-lower+.46,radius);
  for(const [level,depth,spread,color] of [[.12,.34,1.12,mortar],[.48,.19,1.04,ashlar],[.82,.23,1.08,ashlar],[.98,.42,1.15,mortar]]){
    if(h*level>=lower) part(group,'cyl',color,x,y+h*level,z,radius*spread,depth,radius*spread);
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
    if(h>7){
      for(const lift of [-h*.25,h*.18]){
        arch(recess,0,lift-.20,.066,.22,.46,.071,.12,ashlar);
        part(recess,'cube',timber,0,lift+.04,.117,.43,.52,.075);
        part(recess,'cube',glass,0,lift+.04,.168,.14,.47,.04);
      }
    }
  }
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    const brace=placed(group,x+Math.sin(a)*radius,y+h*.90,z+Math.cos(a)*radius,a);
    part(brace,'cube',ashlar,0,0,.045,.21,.42,.28,.20);
  }
  if(!lower) blockers.push([x,z,radius+.18]);
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
  const banner=yaw?'#ad718c':'#6c91a6';
  for(const side of [-1,1]){
    part(g,'diamond',banner,0,4.63,side*.93,.58,.53,.11);
    const crest=placed(g,0,4.65,side*1.0,side<0?Math.PI:0);
    star(crest,0,0,0,gold,.36);
    for(let i=-4;i<=4;i++) part(g,'cube','#80656f',i*.34,3.68,side*.68,.09,.93,.105);
    for(const dx of [-2.86,2.86]){
      part(g,'cube',timber,dx,4.19,side*1.39,.95,.08,.16);
      part(g,'cube',banner,dx,3.43,side*1.47,.64,1.44,.055);
      part(g,'diamond',banner,dx,2.77,side*1.47,.322,.27,.025);
      const pennant=placed(g,dx,3.60,side*1.514,side<0?Math.PI:0);
      star(pennant,0,0,0,gold,.215);
    }
  }
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

function stall(parent,blockers,height,x,z,yaw,tint,wares,kind){
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
    if(kind==='pottery'){
      for(let i=0;i<3;i++){
        const px=tx+(i-1)*.165,pz=.29+Math.sin(i*2)*.115;
        part(group,'soft',wares[i%wares.length],px,1.60,pz,.073,.15,.073);
        part(group,'cyl',wares[i%wares.length],px,1.75,pz,.058,.10,.058);
        part(group,'cyl',ashlar,px,1.80,pz,.043,.026,.044);
      }
    } else if(kind==='weaving'){
      for(let i=0;i<4;i++) part(group,'cyl',wares[(i+tray)%wares.length],tx+(i%2-.5)*.24,1.55+Math.floor(i/2)*.13,.29,
        .076,.45,.078,Math.PI/2,0,i%2?.08:-.19);
    } else {
      for(let i=0;i<6;i++) part(group,'low',wares[(i+tray)%wares.length],tx+(i%3-1)*.156,1.59+(i%2)*.045,
        .13+(i>=3?.24:0),.105,.115,.10,0,0,.34*i);
    }
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

function arcanumHill(group,scene,blockers,height,spireShell){
  const {x,z}=arcanum;
  for(let i=0;i<18;i++){
    const zz=3.4-i*.61,y=height(x,zz);
    part(group,'cube',i%4?stone:ashlar,x,y-.115,zz,4.06,.25,.63);
    for(const side of [-1,1]){
      part(group,'cube',mortar,x+side*2.19,y+.24,zz,.33,.63,.63);
      part(group,'cube',ashlar,x+side*2.19,y+.55,zz,.43,.11,.64);
    }
  }
  for(const side of [-1,1]){
    const xx=x+side*3.15;
    for(let i=0;i<8;i++){
      const zz=2.26-i*.97,y=height(xx,zz);
      const tall=.51+Math.floor(i/3)*.22;
      part(group,'cube',stone,xx,y+tall*.27,zz,.61,tall,.99);
      part(group,'cube',ashlar,xx,y+tall*.76,zz,.70,.12,.99);
      for(let row=0;row<2;row++){
        for(let col=0;col<2;col++){
          part(group,'cube',row?'#c2a99c':'#dfc4a9',xx-side*.312,y+.14+row*.24,zz+(col-.5)*.42+row*.07,.03,.15,.37);
        }
      }
      blockers.push([xx,zz,.32,.47]);
    }
  }
  for(const zz of [2.7,-1.7,-6.5]) for(const side of [-1,1]){
    const xx=x+side*2.66,y=height(xx,zz);
    part(group,'cube',ashlar,xx,y+.36,zz,.82,.72,.84);
    part(group,'cyl',stone,xx,y+1.16,zz,.24,1.23,.24);
    part(group,'diamond',violet,xx,y+1.92,zz,.22,.33,.22);
  }
  const sy=height(x,z);
  part(spireShell,'cyl',ashlar,0,2.74,0,2.82,.40,2.82);
  tower(spireShell,blockers,()=>0,0,0,2.78,15.0,'#72578c',2.90);
  for(const side of [-1,1]){
    tower(group,blockers,height,x+side*4.42,z-.97,1.40,8.1,side<0?'#607e99':'#8d70a1');
    const xx=x+side*1.42;
    part(group,'cube','#77638f',xx,sy+5.3,z+2.56,.74,2.5,.12);
    star(group,xx,sy+5.63,z+2.65,gold,.27);
  }
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

function guildhall(group,blockers,height){
  const x=12,z=3.3,hall=placed(group,x,height(x,z),z);
  part(hall,'cube',ashlar,0,.01,0,7.16,.16,5.64);
  part(hall,'cube',stone,0,1.35,-2.63,6.9,2.7,.32);
  for(const side of [-1,1]) part(hall,'cube',stone,side*3.4,1.35,0,.32,2.7,5.3);
  blockers.push([x,z-2.63,3.5,.2],[x-3.4,z,.19,2.63],[x+3.4,z,.19,2.63]);
  for(const column of [-2.24,0,2.24]){
    arch(hall,column,.08,2.59,.83,1.56,.22,.36,ashlar);
    part(hall,'cube',gold,column,2.42,2.8,.23,.23,.07);
    for(const side of [-1,1]) blockers.push([x+column+side*.94,z+2.59,.13,.19]);
  }
  part(hall,'cube',stone,0,2.64,0,7.05,.41,5.49);
  part(hall,'cube','#f2d2ae',0,3.91,0,7.01,2.35,5.25);
  for(const side of [-1,1]){
    part(hall,'cube','#7f638e',0,5.89,side*1.45,7.56,.23,3.49,-side*.52);
    part(hall,'cube',timber,0,5.12,side*2.73,7.62,.19,.14);
    for(let i=-2;i<=2;i++){
      const px=i*1.26,pz=side*2.66;
      part(hall,'cube',timber,px,3.99,pz,.78,1.37,.16);
      part(hall,'cube',glass,px,4.01,pz+side*.10,.58,1.15,.06);
      part(hall,'cube',timber,px,4.01,pz+side*.15,.056,1.19,.06);
      part(hall,'cube',timber,px,3.95,pz+side*.15,.65,.055,.06);
    }
  }
  part(hall,'cube',gold,0,6.77,0,7.69,.13,.16);
  for(const side of [-1,1]){
    const end=placed(hall,side*3.50,5.05,0,side*Math.PI/2);
    const gable=new T.Shape().moveTo(-2.69,0).lineTo(0,1.6).lineTo(2.69,0).closePath();
    end.add(new T.Mesh(new T.ShapeGeometry(gable),material('#dfb99f')));
    star(end,0,.67,.013,gold,.44);
    lantern(hall,side*3.0,2.07,2.83,1.13);
    part(hall,'cube',timber,side*2.30,.69,-1.65,1.45,.15,.94);
    for(const dx of [-.53,.53]) part(hall,'cube',timber,side*2.30+dx,.36,-1.65,.13,.70,.74);
    for(let i=0;i<5;i++) part(hall,'cube',i%2?'#b66e7b':'#789899',side*2.30+(i-2)*.17,.85,-1.65,.14,.16,.31);
    blockers.push([x+side*2.30,z-1.65,.74,.49]);
  }
}

function stage(group,scene,blockers,height){
  const x=25,z=20.2,y=height(x,z),stage=placed(group,x,y,z,Math.PI);
  part(stage,'cube',timber,0,.22,0,4.9,.46,1.9);
  for(let i=0;i<12;i++) part(stage,'cube',i%2?'#c29873':'#ae7e68',(i-5.5)*.40,.47,0,.388,.064,1.97);
  part(stage,'cube','#a87a67',0,.13,1.15,2.2,.25,.40);
  for(const side of [-1,1]){
    part(stage,'cube',timber,side*2.28,1.99,-.78,.18,3.1,.18);
    for(let i=0;i<6;i++) part(stage,'cube',i%2?'#c57a9d':'#a95c83',side*(1.44+i*.15),2.09,-.77,.16,2.8,.10);
    lantern(stage,side*2.3,2.86,.6);
    part(stage,'cube',timber,side*2.28,1.99,.76,.14,3.1,.14);
  }
  part(stage,'cube','#6d9898',0,3.55,0,5.06,.16,2.08);
  for(let i=0;i<13;i++) part(stage,'soft',i%2?'#f3d3ad':'#d38cab',(i-6)*.36,3.36,1.03,.19,.15,.06);
  star(stage,0,3.45,1.094,gold,.28);
  blockers.push([x,z,2.44,.95]);
  const minstrel=person(['#ca8f70','#708e96','#655174'],false,9);
  minstrel.group.position.set(x+.29,y+.53,z+.18);
  minstrel.group.rotation.y=Math.PI;scene.add(minstrel.group);
  const lute=placed(minstrel.group,0,.99,.24);
  lute.rotation.z=-.66;
  part(lute,'soft','#bd8963',0,0,0,.22,.28,.095);
  part(lute,'cube','#c8a481',0,.24,.014,.081,.34,.071);
  part(lute,'cyl',timber,0,.042,.082,.063,.031,.067,Math.PI/2);
  for(const dx of [-.018,0,.018]) part(lute,'cube','#ead5a7',dx,.11,.109,.007,.44,.007);
  return t=>{
    animate(minstrel,t,false);
    minstrel.group.rotation.y=Math.PI+Math.sin(t*.92)*.15;
    minstrel.arms[0].rotation.x=-1.02+Math.sin(t*7.6)*.24;
    minstrel.arms[1].rotation.x=-.94;
    minstrel.arms[1].rotation.z=.31;
  };
}

function crookedTower(group,scene,blockers,height){
  const x=30.9,z=-6.6,y=height(x,z);
  const dark='#765367',copper='#739993';
  const shell=placed(group,x,y,z),pipe=placed(group,x,y,z);
  for(let i=0;i<5;i++){
    const sx=.23*i+.07*i*i,sz=-i*.14,r=1.38+i*.07;
    part(shell,'cyl',i%2?'#bb8c98':'#d9b3ac',sx,1.03+i*1.42,sz,r,1.63,r,0,.15*i,-.052*i);
    part(shell,'cyl',dark,sx,.32+i*1.42,sz,r*1.06,.14,r*1.06,0,0,-.052*i);
    for(const side of [-1,1]){
      const wx=sx+side*.54;
      part(shell,'cube',dark,wx,1.16+i*1.42,sz+1.32,.50,.83,.16,0,side*.28,side*.09);
      part(shell,'cube',i%2?violet:glass,wx,1.17+i*1.42,sz+1.416,.28,.62,.10,0,side*.28,side*.09);
    }
  }
  part(shell,'cyl','#96b1a0',2.03,7.15,-.61,1.91,.33,1.91,0,0,-.17);
  part(shell,'cone',copper,2.28,8.69,-.77,1.80,3.05,1.82,.09,0,-.33);
  part(shell,'diamond',gold,2.8,10.2,-.63,.14,.32,.14);
  arch(shell,0,.08,1.39,.52,1.02,.15,.21,dark);
  part(shell,'cube','#8c6f90',0,.84,1.36,1.02,1.6,.12);
  const points=[[-1.18,1.07,1.0],[-1.92,1.07,1.0],[-1.92,3.56,1.0],[-.56,3.56,1.0],[-.17,4.83,.79]];
  for(let i=1;i<points.length;i++) branch(pipe,i%2?copper:gold,points[i-1],points[i],.12);
  part(shell,'cyl',dark,-1.80,.35,1.16,.58,.70,.58);
  part(shell,'cyl',violet,-1.80,.74,1.16,.49,.08,.49);
  blockers.push([x,z,1.51], [x-1.8,z+1.16,.61]);
  const motes=Array.from({length:5},()=>part(scene,'sphere',violet,x,y,z,.08,.08,.08));
  return t=>motes.forEach((m,i)=>{
    const rise=(t*.49+i*.21)%1;
    m.position.set(x-1.8+Math.sin(t*1.5+i)*.27,y+.82+rise*1.45,z+1.16+Math.cos(t*1.3+i)*.21);
    m.scale.setScalar(.09*(.4+Math.sin(rise*Math.PI)));
  });
}

function planter(group,height,x,z,flowers){
  const y=height(x,z);
  part(group,'cyl',stone,x,y+.14,z,.64,.30,.64);
  part(group,'cyl','#8d786e',x,y+.29,z,.56,.09,.56);
  for(let n=0;n<9;n++){
    const a=n*2.39996,r=.13+n*.042,h=.24+(n%4)*.075;
    const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
    branch(group,'#789e7d',[px,y+.31,pz],[px,y+.32+h,pz],.024);
    part(group,'soft',flowers[n%flowers.length],px,y+.32+h,pz,.117,.10,.117);
  }
}

function moonpetalCourt(group,blockers,height){
  cobbles(group,height,26.5,30.8,-11,-7.7);
  for(const [x,z] of [[28.15,-8.85],[29.85,-10.55],[26.65,-10.5]]){
    planter(group,height,x,z,['#bba1df','#ffe3c0','#9ddacb']);
    blockers.push([x,z,.66]);
  }
  const z=-11.15,y=height(28.4,z);
  part(group,'cube','#ae8c75',28.4,y+.41,z,2.01,.13,.53);
  for(const x of [27.65,29.15]) part(group,'cube',stone,x,y+.19,z,.27,.39,.55);
  blockers.push([28.4,z,1.02,.31]);
}

function stargazerTerrace(group,scene,blockers,height){
  const x=23.75,z=-5.12,y=height(x,z);
  for(const [r,h,cy,tint] of [[.80,.19,.07,ashlar],[.63,.22,.24,mortar],[.26,1.02,.74,stone],[.48,.16,1.29,ashlar]]){
    part(group,'cyl',tint,x,y+cy,z,r,h,r);
  }
  const instrument=placed(scene,x,y+2.04,z);
  for(const [radius,angle] of [[.77,.7],[.61,-.55],[.49,1.57]]){
    const ring=new T.Mesh(new T.TorusGeometry(radius,.039,6,30),material(gold));
    ring.rotation.set(angle,angle*.65,angle*.3);instrument.add(ring);
  }
  const globe=part(instrument,'sphere',aqua,0,0,0,.23,.23,.23);
  blockers.push([x,z,.77]);
  for(const [px,pz] of [[23.4,-6.55],[25.62,-5.3],[22.93,-4.2]]) planter(group,height,px,pz,['#d292bb','#b0c9df','#f1cf8f']);
  return t=>{instrument.rotation.y=t*.51;globe.position.y=Math.sin(t*1.9)*.095;};
}

function waterfront(group,scene,blockers,height){
  const boats=[];
  for(const [z,side,tint] of [[5.6,1,'#b77f76'],[9.7,-1,'#739397'],[21.8,1,'#967f9f'],[25.2,-1,'#ae8a64']]){
    const x=riverCenter(z)+side*1.7;
    const boat=placed(scene,x,riverLevel+.10,z);
    part(boat,'soft',tint,0,.01,0,.57,.23,1.37);
    part(boat,'soft','#d6aa7e',0,.17,0,.47,.072,1.21);
    for(const dz of [-.55,.42]) part(boat,'cube',timber,0,.20,dz,.81,.09,.17);
    for(const dx of [-.53,.53]) part(boat,'cube','#b69177',dx,.25,-.16,.086,.061,1.45,0,side*.39);
    part(boat,'cyl','#956c62',0,.72,.1,.035,1.32,.035);
    part(boat,'diamond',tint,0,1.22,.30,.032,.33,.35,0,.1,.10);
    boats.push({boat,x,z,side});
    const moorX=riverCenter(z)+side*4.43,y=height(moorX,z);
    part(group,'cyl','#846b70',moorX,y+.29,z,.11,.62,.11);
    part(group,'sphere',gold,moorX,y+.59,z,.12,.08,.12);
    branch(group,'#997b66',[moorX,y+.31,z],[x,riverLevel+.22,z+.78],.022);
  }
  for(const side of [-1,1]) for(let z=-12;z<29;z+=1.46){
    if(overBridge(z)||overBridge(z-.62)||overBridge(z+.62)) continue;
    const x=riverCenter(z)+side*4.10,y=height(x,z);
    part(group,'cube',mortar,x,y-.44,z,.36,.72,1.36,0,-.11);
    part(group,'cube',ashlar,x,y+.06,z,.42,.17,1.37,0,-.11);
    part(group,'cube',timber,x,y+.44,z,.086,.81,.087);
    const nextZ=z+1.46;
    if(!overBridge(nextZ+.62)){
      const next=riverCenter(nextZ)+side*4.10;
      branch(group,timber,[x,y+.72,z],[next,height(next,nextZ)+.72,nextZ],.049);
    }
  }
  for(const [z,side] of [[5,-1],[18,1],[23,-1]]){
    const x=riverCenter(z)+side*4.74,y=height(x,z);
    for(let i=0;i<3;i++){
      const px=x+side*(i%2)*.44,pz=z+Math.floor(i/2)*.55;
      part(group,'cube','#aa7d69',px,y+.24,pz,.47,.49,.48);
      part(group,'cube','#d1a17b',px,y+.43,pz,.51,.09,.54);
      part(group,'cube','#d1a17b',px,y+.23,pz-.25,.47,.08,.041,0,0,.72);
    }
  }
  const millZ=-6.8,millX=riverCenter(millZ)+3.45;
  const axle=placed(scene,millX,riverLevel+1.02,millZ,Math.PI/2);
  const wheel=placed(axle,0,0,0);
  for(const side of [-1,1]){
    const rim=new T.Mesh(new T.TorusGeometry(1.23,.066,6,26),material('#88645d'));
    rim.position.z=side*.23;wheel.add(rim);
  }
  for(let i=0;i<10;i++){
    const angle=i*Math.PI/5;
    const spoke=placed(wheel,0,0,0);spoke.rotation.z=angle;
    part(spoke,'cube','#987361',0,.62,0,.095,1.21,.13);
    part(spoke,'cube','#ba9375',0,1.17,0,.24,.19,.62);
  }
  part(axle,'cyl',timber,0,0,1.01,.12,2.3,.12,Math.PI/2);
  return t=>{
    wheel.rotation.z=t*.64;
    for(const {boat,x,z,side} of boats){
      boat.position.set(x+Math.sin(t*.55+z)*.14,riverLevel+.10+Math.sin(t*1.48+z)*.058,z+Math.cos(t*.7+z)*.16);
      boat.rotation.set(Math.cos(t*1.48+z)*.039,side*.11+Math.sin(t*.7+z)*.12,Math.sin(t*1.48+z)*.054);
    }
  };
}

function cityBirds(scene,height){
  const birds=Array.from({length:7},(_,i)=>{
    const bird=placed(scene,0,0,0);
    const tone=i%2?'#999aaf':'#778692';
    part(bird,'soft',tone,0,0,0,.12,.17,.25);
    part(bird,'soft','#c1bacb',0,.10,.19,.11,.107,.121);
    part(bird,'cone','#dcad86',0,.076,.30,.052,.13,.048,Math.PI/2);
    const wings=[-1,1].map(side=>{
      const wing=placed(bird,side*.10,.03,0);
      part(wing,'soft',tone,side*.19,0,-.053,.28,.055,.12,0,side*.24);
      return wing;
    });
    return {bird,wings};
  });
  return t=>birds.forEach(({bird,wings},i)=>{
    const angle=t*.37+i*.49, onQuay=i<3;
    const x=onQuay?riverCenter(10)+Math.sin(angle)*2.4:18+Math.sin(angle)*6.8;
    const z=onQuay?11+Math.cos(angle)*11:13+Math.cos(angle)*4.9;
    bird.position.set(x,height(x,z)+(onQuay?3.1:4.8)+Math.sin(angle*1.8)*.48,z);
    bird.rotation.y=Math.atan2(Math.cos(angle)*(onQuay?2.4:6.8),-Math.sin(angle)*(onQuay?11:4.9));
    const beat=Math.sin(t*7+i)*.59;
    wings[0].rotation.z=-beat;wings[1].rotation.z=beat;
  });
}

function washingLine(group,scene,height){
  const z=1.1,x1=23.1,x2=27.65;
  const y=height(25,z)+3.65;
  for(const x of [x1,x2]) part(group,'cyl',timber,x,(height(x,z)+y)*.5,z,.053,y-height(x,z),.053);
  const fabrics=[];
  for(let i=0;i<8;i++){
    const ratio=i/8,next=(i+1)/8;
    const point=u=>[T.MathUtils.lerp(x1,x2,u),y-Math.sin(u*Math.PI)*.38,z];
    const end=point(next),start=point(ratio);
    branch(group,'#7e6771',start,end,.024);
    if(i===0||i===7) continue;
    const [x,cy,cz]=point((i+.5)/8);
    const cloth=placed(scene,x,cy,cz);
    const length=i%2?.60:.43;
    part(cloth,'cube',['#e9bac1','#eed5ac','#9ab5be','#b2a1cd'][i%4],0,-length*.5,0,.39,length,.034);
    part(cloth,'cube','#f7e4ca',0,-length*.84,.023,.4,.049,.020);
    fabrics.push(cloth);
  }
  return t=>fabrics.forEach((cloth,i)=>{cloth.rotation.x=Math.sin(t*2+i*.6)*.43;});
}

export function populateWard(group,scene,realm,blockers,height){
  const ward=wards[realm],shop=wardWorkshops[realm];
  const [green,cream,roof,accent]=ward.colors;
  // Two frontages flank each street, with alleys to the back courts between blocks.
  for(const [row,z] of [-31,-9,23,43].entries()){
    for(const [i,x] of [-49,-41,-28,-12,9,18,42,51].entries()){
      if(x===shop.x&&z===shop.z){
        townhouse(group,blockers,height,[x,z,shop.yaw,shop.width,shop.depth,2,shop.wall,shop.roof,false],true);
        continue;
      }
      const storeys=1+(i+row+(realm==='starward'?1:0))%3;
      const hue=[cream,'#ecd0b5',accent,'#d7c4b7'][(i+row)%4];
      townhouse(group,blockers,height,[x,z,row>=2?Math.PI:0,4.3+i%3*.66,4.1+row%2,storeys,hue,i%3?roof:green,i%2]);
    }
  }
  for(const x of [-52,-27,-8,12,41,53]){
    streetLamp(group,x,17.3,height(x,17.3));
    blossom(group,x,height(x,29),29,Math.abs(x)*17);
    bunting(group,[x,height(x,23)+4.2,23],[x+5,height(x+5,23)+4.4,23],[accent,cream,green]);
  }
  for(const [i,x] of [-14,-8,6,12,18].entries()) stall(group,blockers,height,x,2,0,i%2?accent:roof,[cream,green],realm==='dyeward'?'weaving':'pottery');
  // Lay the same walkable approach through three working trades.
  cobbles(group,height,-30,31,6.8,9.35);
  const cloth=[];
  for(const [j,x] of [-43,-26,17,40].entries()){
    const z=realm==='starward'?-22:19.3,base=placed(group,x,height(x,z),z);
    if(realm==='dyeward'){
      for(const dx of [-3,3])part(base,'cyl',timber,dx,1.7,0,.085,3.4,.085);
      branch(base,gold,[-3,3.15,0],[3,3.15,0],.033);
      for(let panel=0;panel<5;panel++){
        const xx=x+(panel-2)*1.10;
        const silk=placed(scene,xx,height(x,z)+3.13,z);
        const tone=[accent,'#b67584','#e3bc73',green,roof][panel];
        part(silk,'cube',tone,0,-.68,0,.94,1.36,.048);
        part(silk,'cube',cream,0,-1.18,.025,.95,.10,.055);
        cloth.push(silk);
      }
    }else if(realm==='cooperward'){
      const cart=placed(base,0,0,0,.20*(j-1));
      part(cart,'cube',timber,0,.70,0,2.9,.22,1.4);
      for(const zz of [-.82,.82])for(const xx of [-.99,.99]){
        part(cart,'cyl','#785850',xx,.49,zz,.47,.15,.47,Math.PI/2);
        part(cart,'cyl',gold,xx,.49,zz+Math.sign(zz)*.08,.13,.06,.13,Math.PI/2);
      }
      for(const xx of [-.85,0,.85]){
        part(cart,'cyl','#b98b63',xx,1.28,0,.36,.98,.36);
        for(const yy of [1.0,1.58])part(cart,'cyl','#817a7a',xx,yy,0,.38,.07,.38);
      }
      for(const zz of [-.44,.44])part(cart,'cube',timber,1.93,.62,zz,1.24,.11,.13);
      blockers.push([x,z,2.4,1.1]);
    }else{
      for(const xx of [-2.3,2.3]){
        part(base,'cyl',cream,xx,2,0,.30,4,.30);
        part(base,'cyl',stone,xx,.24,0,.56,.46,.56);
        part(base,'cyl',gold,xx,4.03,0,.44,.26,.44);
      }
      arch(base,0,.08,0,2.00,3.68,.55,.88,cream);
      part(base,'diamond',violet,0,5.88,0,.37,.62,.28);
      star(base,0,4.84,.47,gold,.37);
      for(const xx of [-2.3,2.3])blockers.push([x+xx,z,.55,.55]);
    }
  }
  const motors=[];
  const hub=placed(group,0,height(0,-5),-5);
  if(realm==='dyeward'){
    for(const side of [-1,1]){
      const x=side*5.8;
      part(hub,'cube',stone,x,1.20,0,3.7,2.4,4.5);
      const wheel=placed(scene,x,height(x,-5)+2.2,-2.4);
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6;
        part(wheel,'cube',timber,1.0*Math.sin(a),1.0*Math.cos(a),0,.13,2.1,.15,0,0,-a);
        part(wheel,'cube',accent,2.02*Math.sin(a),2.02*Math.cos(a),0,.62,.18,.85,0,0,-a);
      }
      motors.push(wheel);
      // A raised millrace feeds each wheel and keeps the shopping avenue open.
      const race=placed(hub,x,0,2.85);
      part(race,'cube',stone,0,.25,0,8.2,.53,1.62);
      part(race,'cube','#7dbece',0,.55,0,8.04,.07,1.34);
      for(const zz of [-.78,.78])part(race,'cube',ashlar,0,.58,zz,8.2,.35,.16);
      blockers.push([x,-2.15,4.1,.84]);
      for(let j=0;j<4;j++){
        const xx=x+side*(3+j*2.2);
        part(hub,'cyl',timber,xx,.54,0,.84,1.05,.84);
        part(hub,'cyl',j%2?'#8872ad':'#a45468',xx,1.08,0,.75,.035,.75);
      }
    }
  }else if(realm==='cooperward'){
    // Leave the ground floor hollow and interrupt the staves and iron hoops above the threshold.
    for(let i=0;i<24;i++){
      const a=i*Math.PI/12,door=Math.min(i,24-i)<=1;
      const x=4.06*Math.sin(a),z=4.06*Math.cos(a),bottom=door?2.85:0;
      part(hub,'cube',i%2?'#916e55':'#a07c5d',x,(6+bottom)/2,z,1.10,6-bottom,.29,0,a);
      if(!door)blockers.push([x,z-5,.30+Math.abs(Math.cos(a))*.31,.30+Math.abs(Math.sin(a))*.31]);
      for(const y of [.45,2.0,4.5,5.92])if(y>bottom){
        part(hub,'cube','#899093',x*1.03,y,z*1.03,1.14,.24,.18,0,a);
      }
    }
    part(hub,'cone',roof,0,7.25,0,4.9,2.8,4.9);
    arch(hub,0,.05,4.14,1.23,1.85,.23,.34,cream);
    for(let j=0;j<10;j++){
      const xx=(j%5-2)*1.64,zz=-6-Math.floor(j/5)*1.5;
      part(hub,'cyl',j%2?timber:roof,xx,.76,zz,.66,1.52,.66);
      for(const y of [.34,1.12])part(hub,'cyl','#9e9b97',xx,y,zz,.69,.09,.69);
    }
  }else{
    for(const side of [-1,1]){
      part(hub,'cyl',cream,side*2.75,1.5,2.66,.22,3,.22);
      part(hub,'diamond',gold,side*2.75,3.21,2.66,.31,.36,.31);
    }
    for(let j=0;j<3;j++)part(hub,'cyl',j%2?cream:stone,0,2.89+j*.27,0,4.2-j*.40,.29,4.2-j*.40);
    const orbit=placed(scene,0,height(0,-5)+6.3,-5);
    for(let j=0;j<3;j++){
      const mesh=new T.Mesh(new T.TorusGeometry(2.8-j*.4,.10,7,40),material(j%2?cream:gold));
      mesh.rotation.set(j*.86,.44+j*.77,.2);orbit.add(mesh);
    }
    part(orbit,'diamond',violet,0,0,0,.98,1.43,.98);motors.push(orbit);
    for(const side of [-1,1])for(let j=0;j<4;j++){
      const x=side*(6+j*1.5);part(hub,'diamond',j%2?aqua:violet,x,1.1,0,.63,1.48,.60,0,j,side*.20);
    }
  }
  if(realm==='dyeward')blockers.push([0,-5,1,3.0]);
  if(realm==='dyeward')for(const side of [-1,1])blockers.push([side*5.8,-5,2.15,3.1]);
  for(const [x,z] of relayPosts){
    const peg=placed(group,x,height(x,z),z);
    part(peg,'cyl',timber,0,1,0,.09,2,.09);
    part(peg,'diamond',gold,0,2.32,0,.26,.39,.26);
    part(peg,'cube',accent,.34,1.7,0,.69,.3,.05,0,0,-.11);
  }
  for(const side of [-1,1]){
    tower(group,blockers,height,side*53,-38,2.5,6.2,roof);
    wall(group,blockers,height,side*53,-39,side*29,-39);
  }
  const procession=[];
  for(let i=0;i<9;i++){
    const x=-8+i*2.25,z=18+Math.sin(i)*1.5;
    const light=placed(scene,x,height(x,z),z);
    part(light,'soft',i%2?glass:aqua,0,0,0,.18,.25,.18);
    part(light,'cube',timber,0,-.23,0,.18,.07,.18);
    procession.push(light);
  }
  return (t,hour)=>{
    cloth.forEach((silk,i)=>silk.rotation.x=.085+.13*Math.sin(t*2+i*.68));
    motors.forEach((m,i)=>{if(realm==='starward')m.rotation.y=t*.23;else m.rotation.z=t*(i?-.42:.42);});
    procession.forEach((light,i)=>{
      light.visible=hour>=18||hour<6;
      if(light.visible){
        const phase=(t*.12+i*.31)%1;
        light.position.y=height(light.position.x,18)+1.6+phase*5;
        light.position.z=18+Math.sin(t*.55+i)*.65;
        light.scale.setScalar(Math.min(1,phase*12,(1-phase)*12));
      }
    });
  };
}

export function populateSpirehaven(group,scene,blockers,height){
  const interiors=populateWalkInRooms(group,scene,height,blockers);
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
    [2.12,29.1,Math.PI/2,4.06,3.84,3,'#ebad92','#9e655f',1],
    [24.3,23.6,Math.PI,4.5,4.2,2,'#dbbbbe','#7795a0',1],
    [29.25,22.2,Math.PI,4.69,4.32,3,'#efd0a2','#a16870',1],
    [27.5,28.35,Math.PI,4.68,4.34,2,'#e6baa7','#639291',0],
    [31.12,29.4,Math.PI,3.2,3.14,2,'#eed2af','#957aa0',0],
    [-3.42,5.40,0,4.31,4.16,2,'#f4d79c','#9d6f60',1],
    [-3.6,21.35,Math.PI,4.03,4.03,3,'#d9c0bf','#6c839b',0],
    [-4.83,26.16,Math.PI/2,3.5,3.85,2,'#f1c38e','#7e699a',0],
    [28.10,3.5,-Math.PI*.5,4.04,4.12,3,'#f5d7aa','#936585',0],
    [30.67,-1.23,Math.PI,4.31,4.13,2,'#e0b8b7','#6b9298',0],
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
  for(const room of rooms){
    if(room.stories) townhouse(group,blockers,height,[room.x,room.z,room.yaw,room.width,room.depth,room.stories,room.wall,room.roof,false],true);
  }
  cobbles(group,height,1.8,26,6.6,21);
  cobbles(group,height,7.1,15.9,21,31.35);
  cobbles(group,height,-9,2.3,12,16.1);
  cobbles(group,height,23.94,25.91,-4.3,14);
  cobbles(group,height,10.4,13.6,5.9,9.15);
  cobbles(group,height,-12,-4.4,-12,29,(x,z)=>{
    const d=x-riverCenter(z);return d>4.64&&d<6.03&&Math.abs(z-14)>2.02;
  });
  for(const [x,z] of [[-1.65,10.95],[28.1,17.9],[5.35,-8.5],[28.1,-13]]) blossom(group,x,height(x,z),z,Math.round((x+34)*96));
  for(const [x,z,yaw,tint,wares,kind] of [
    [6.35,11.48,Math.PI/2,'#81bdb7',['#90cd96','#efc883']],
    [6.0,17.75,Math.PI/2,'#d588a8',['#e78d91','#eac27e']],
    [18.85,19.2,-Math.PI/2,'#bea1db',['#ad91dc','#f8c6d9'],'pottery'],
    [21.8,10.4,0,'#eeaf71',['#f7cc86','#c77f6f']],
    [6.05,22.5,Math.PI/2,'#a590cc',['#a891d4','#edb67a']],
    [22.2,6.45,0,'#7fbbb8',['#afc58c','#d9a6b0','#f3d4a0'],'weaving']
  ]) stall(group,blockers,height,x,z,yaw,tint,wares,kind);
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
  guildhall(group,blockers,height);
  const animateStage=stage(group,scene,blockers,height);
  moonpetalCourt(group,blockers,height);
  const animateFountain=fountain(group,scene,blockers,height);
  const animateArcanum=arcanumHill(group,scene,blockers,height,interiors.shells.get('starMap'));
  const animateTower=crookedTower(group,scene,blockers,height);
  const animateTerrace=stargazerTerrace(group,scene,blockers,height);
  const animateWaterfront=waterfront(group,scene,blockers,height);
  const animateBirds=cityBirds(scene,height);
  const animateWashing=washingLine(group,scene,height);
  return (t,player,progress)=>{
    animateFountain(t);animateArcanum(t);animateTower(t);
    animateTerrace(t);animateWaterfront(t);animateBirds(t);animateStage(t);animateWashing(t);
    interiors.update(t,player,progress);
  };
}
