import * as T from 'three';
import {animate,material,part,person} from './models.js';
import {workshopFittings} from './workshop-art.js';
import {celMaterial} from './cel.js';
import {regionalCarpet,regionalPanel,workpiece} from './regional-interior-art.js';
import {dialFaces,rooms,roomBlockers,roomDoorWidth,roomFloorOffset,roomWalls,starDials} from './spirehaven-rooms.js';

const wood='#8a5e54',beam='#644855',gold='#dbb16f',cream='#edd0a8',stone='#b5a09e';
const glow=celMaterial('#ffdd9e',{emissive:'#ffb166',emissiveIntensity:.56});
const magic=celMaterial('#9bdbdb',{emissive:'#75b1e3',emissiveIntensity:.63});
const dialColors=['#f7bb73','#a5d4eb','#c2a0ed'];
const covers=['#8b667f','#58878a','#bd8b66','#9c6b6d','#d0a979','#698d77'];

function rootAt(parent,room,height){
  const root=new T.Group();
  root.position.set(room.x,height(room.x,room.z),room.z);
  root.rotation.y=room.yaw;parent.add(root);return root;
}

function mark(parent,shape,color,x,y,z,scale,rotation=0){
  const mesh=part(parent,shape,color,x,y,z,scale,scale,scale,0,0,rotation);
  mesh.castShadow=false;return mesh;
}

function emblem(parent,type,x,y,z){
  if(type==='silk'){
    for(const side of [-1,1])part(parent,'cube',cream,x,y+side*.18,z,.46,.086,.10);
    part(parent,'cube','#d8819f',x,y,z+.035,.34,.31,.085);
    for(const offset of [-.085,.045])part(parent,'cube',gold,x,y+offset,z+.09,.35,.032,.021,0,0,-.15);
  }else if(type==='cask'){
    part(parent,'soft',wood,x,y,z,.20,.27,.085);
    for(const side of [-1,1])part(parent,'cube',gold,x,y+side*.13,z+.077,.33,.045,.035);
  }else if(type==='orbit'){
    const ring=new T.Mesh(new T.TorusGeometry(.20,.025,6,20),material(gold));ring.position.set(x,y,z);parent.add(ring);
    part(parent,'diamond',magic,x,y,z+.04,.087,.12,.046);
  }else if(type==='bread'){
    part(parent,'soft','#dfac69',x,y,z,.29,.17,.064,0,0,.28);
    for(let i=-1;i<=1;i++) part(parent,'cube',cream,x+i*.127,y+i*.037,z+.065,.035,.122,.025,0,0,-.15);
  }else if(type==='bottle'){
    part(parent,'soft','#99ceac',x,y-.055,z,.16,.17,.067);
    part(parent,'cube','#99ceac',x,y+.12,z,.12,.18,.11);
    part(parent,'cube',gold,x,y+.225,z,.15,.058,.11);
  }else if(type==='book'){
    for(const side of [-1,1]) part(parent,'cube',cream,x+side*.11,y,z,.21,.34,.07,0,0,side*.15);
    part(parent,'cube','#a97863',x,y,z+.043,.042,.35,.04);
  }else{
    part(parent,'diamond',gold,x,y,z,.25,.25,.055,0,0,Math.PI/4);
    if(type==='griffin'){
      part(parent,'soft','#e4a679',x-.18,y+.035,z+.033,.27,.072,.033,0,0,-.46);
      part(parent,'soft','#e4a679',x+.18,y+.035,z+.033,.27,.072,.033,0,0,.46);
    }else{
      part(parent,'diamond',glow,x,y,z+.034,.10,.10,.037);
    }
  }
}

function facade(shell,room){
  const front=room.depth/2+.15;
  const w=room.width;
  for(const side of [-1,1]){
    for(const x of [side*.77,side*(w/2-.13)])
      part(shell,'cube',beam,x,1.06,front,.12,2.17,.15);
    const wall=side*(w/2+.125);
    part(shell,'cube',beam,wall,2.06,0,.15,.14,room.depth+.12);
    part(shell,'cube',beam,wall,1.08,.03,.10,2.05,.13);
    part(shell,'cube',beam,wall,1.31,-room.depth*.24,.13,.84,.71);
    part(shell,'cube',glow,wall+side*.077,1.34,-room.depth*.24,.039,.61,.51);
    part(shell,'cube',cream,wall+side*.105,1.34,-room.depth*.24,.036,.63,.043);
    const x=side*(room.id==='griffin'?2.49:1.45);
    part(shell,'cube',beam,x,1.27,front,.88,.89,.13);
    part(shell,'cube',room.id==='starMap'?magic:glow,x,1.27,front+.08,.67,.65,.065);
    part(shell,'cube',cream,x,1.27,front+.126,.068,.67,.04);
    part(shell,'cube',cream,x,1.24,front+.126,.70,.059,.04);
    part(shell,'cube',room.roof??stone,x,.80,front+.06,1.02,.12,.34);
  }
  part(shell,'cube',beam,0,2.15,front,roomDoorWidth+.26,.18,.18);
  for(const side of [-1,1]) part(shell,'cube',cream,side*.80,.18,front,.24,.34,.25);
  part(shell,'cube',room.roof??'#85719a',0,2.47,front+.03,1.14,.55,.17);
  emblem(shell,room.sign,0,2.48,front+.15);
}

function bulb(root,x,z,y=1.6){
  part(root,'cube',beam,x,y-.20,z,.17,.11,.19);
  part(root,'cube',glow,x,y,z,.14,.31,.15);
  part(root,'cone',wood,x,y+.20,z,.15,.15,.15);
}

function shelf(root,room,x,z,w,d){
  const style=room.style??room.id;
  part(root,'cube',beam,x,.83,z,w,1.64,d*.76);
  for(let row=0;row<3;row++){
    const y=.30+row*.44;
    part(root,'cube',wood,x,y,z,w,.11,d);
    for(let i=0;i<Math.floor(w/.21);i++){
      const px=x-w*.44+i*.19;
      if(style==='bookshop'){
        const h=.14+(i%4)*.034;
        part(root,'cube',covers[(i+row)%covers.length],px,y+.058+h*.5,z+d*.47,.13,h,.12,0,0,i%5===4?.12:0);
        part(root,'cube',cream,px,y+.079+h*.52,z+d*.645,.083,.024,.013);
      }else if(style==='bakery'&&row<2){
        part(root,'soft','#e6ad6a',px,y+.109,z+d*.51,.076,.065,.090,0,0,.33);
      }else{
        const tint=covers[(i+row*2)%covers.length];
        part(root,'cyl',tint,px,y+.135,z+d*.46,.059,.17,.060);
        part(root,'cyl',gold,px,y+.231,z+d*.46,.044,.035,.044);
      }
    }
  }
}

function furnish(root,room,[kind,x,z,w,d]){
  const style=room.style??room.id;
  if(kind==='shelf'){shelf(root,room,x,z,w,d);return;}
  if(kind==='bench'){
    const tone=room.joinery??wood;
    for(const side of [-1,1]) part(root,'cube',tone,x+side*w*.36,.27,z,.13,.52,d*.71);
    part(root,'cube',tone,x,.53,z,w,.12,d);
    part(root,'cube',room.rug,x,.62,z,w*.89,.09,d*.85);
    return;
  }
  if(kind==='counter'||kind==='table'){
    const counter=kind==='counter',y=counter?.95:.72;
    const tone=room.joinery??wood;
    if(counter){
      part(root,'cube',tone,x,y/2,z,w*.91,y,d*.90);
      for(let i=0;i<3;i++) part(root,'cube',cream,x+(i-1)*w*.28,y*.50,z+d*.46,w*.20,.46,.04);
    }else{
      for(const dx of [-.34,.34]) for(const dz of [-.31,.31])
        part(root,'cube',beam,x+w*dx,y*.48,z+d*dz,.10,y,.10);
    }
    part(root,'cube',counter?'#c09570':'#b47e62',x,y,z,w,.13,d);
    for(let i=-1;i<=1;i++){
      const px=x+i*w*.25,pz=z+i*d*.11;
      part(root,'cyl',cream,px,y+.085,pz,.124,.04,.112);
      if(style==='apothecary'){
        part(root,'soft',covers[i+2],px,y+.19,pz,.074,.11,.073);
        part(root,'cyl',gold,px,y+.30,pz,.037,.055,.04);
      }else if(style==='bookshop'){
        part(root,'cube',covers[i+2],px,y+.145,pz,.18,.065,.20,0,-.29+i*.1);
      }else{
        part(root,'soft',i%2===0?'#e0ae70':'#bc7662',px,y+.137,pz,.096,.067,.09);
      }
    }
    return;
  }
  if(kind==='display'){
    part(root,'cube',wood,x,.34,z,w*.69,.67,d*.72);
    part(root,'cube',room.stockTone,x,.70,z,w,.13,d);
    for(const i of [-1,0,1]){
      const xx=x+i*.18,zz=z+i*.12;
      const tint=i%2?room.stockAccent:cream;
      if(room.stockIcon==='gem'||room.stockIcon==='mountain'){
        part(root,'diamond',tint,xx,.92,zz,.10,.17,.09,0,i,.24*i);
      }else if(room.stockIcon==='sprout'||room.stockIcon==='flower-2'){
        part(root,'cyl',gold,xx,.83,zz,.071,.13,.07);
        part(root,'soft',tint,xx,.98,zz,.083,.072,.063,0,i,i*.43);
      }else{
        part(root,'soft',tint,xx,.88,zz,.091,.095,.092);
        part(root,'cyl',gold,xx,.99,zz,.045,.040,.046);
      }
    }
    return;
  }
  if(kind==='hearth'||kind==='oven'){
    const h=kind==='hearth'?1.45:1.14;
    part(root,'cube',stone,x,h/2,z,w,h,d);
    part(root,'cube',beam,x,.37,z+d*.51,w*.64,.56,.055);
    part(root,'cube',cream,x,h+.04,z,w+.14,.14,d+.09);
    for(let i=0;i<4;i++) part(root,'diamond',i%2?glow:'#df8e63',x+(i-1.5)*w*.136,.37+(i%2)*.07,z+d*.56,.085,.18,.042);
    return;
  }
  if(kind==='lectern'){
    part(root,'cube',wood,x,.45,z,.17,.89,.21);
    part(root,'cube',beam,x,.91,z,w,.11,d,-.27);
    for(const side of [-1,1]) part(root,'cube',cream,x+side*w*.20,.988,z,w*.36,.045,d*.75,-.27);
    return;
  }
  if(kind==='kettle'){
    part(root,'cyl',stone,x,.19,z,w*.45,.38,d*.45);
    part(root,'soft','#856784',x,.57,z,w*.47,.36,d*.47);
    part(root,'cyl',magic,x,.80,z,w*.39,.074,d*.39);
    for(let i=-1;i<=1;i++) mark(root,'diamond',magic,x+i*.19,1.03+Math.abs(i)*.10,z+.06,.068);
    return;
  }
  part(root,'cyl',stone,x,.16,z,w*.49,.32,d*.49);
  part(root,'cyl',wood,x,.48,z,w*.28,.62,d*.29);
  part(root,'cyl',gold,x,.81,z,w*.47,.11,d*.45);
}

function floorPattern(root,room){
  const w=room.width,d=room.depth;
  part(root,'cube',beam,0,-.13,0,w+.22,.23,d+.23);
  const tile=['stone','tiles','bands'].includes(room.floorStyle);
  const palette=room.id==='starMap'?['#9681a4','#a28cac']:
    room.floorStyle==='stone'?['#ac9c9f','#beb0ad','#a2949c']:
    room.floorStyle==='tiles'?[room.wall,'#c49a82','#dec0a5']:
    room.floorStyle==='bands'?[room.wall,'#d7b99d','#bfa89e']:
    room.floorStyle==='boards'?['#a5836d','#bb9a82','#b49b83']:
    ['#be946f','#c49c77','#be946f'];
  if(room.kind==='regional'){
    const accent=new T.Color(room.roof);
    for(const [i,color] of palette.entries()){
      palette[i]='#'+new T.Color(color).lerp(accent,[.21,.37,.28][i%3]).getHexString();
    }
  }
  const columns=Math.ceil(w/(tile?.82:.39)),rows=tile?Math.ceil(d/.81):1;
  const width=w/columns,depth=d/rows;
  for(let i=0;i<columns;i++) for(let j=0;j<rows;j++){
    const x=(i+.5)*width-w*.5,z=(j+.5)*depth-d*.5;
    part(root,'cube',palette[(i+j*2)%palette.length],x,-.035,z,width-.015,.065,depth-(tile?.019:.038));
  }
  part(root,'cube',cream,0,.014,d*.50,room.doorWidth??roomDoorWidth,.085,.41).castShadow=false;
  if(room.kind==='regional'){regionalCarpet(root,room);return;}
  const tone=room.rug??{griffin:'#9b6379',bakery:'#5f898b',apothecary:'#6a8790',bookshop:'#92718a',starMap:'#53476a'}[room.id];
  const rw=room.id==='griffin'?3.3:1.28;
  const rd=room.id==='starMap'?2.85:2.15;
  part(root,'cube',tone,0,.009,.47,rw,.042,rd).castShadow=false;
  for(const side of [-1,1]){
    part(root,'cube',gold,side*(rw/2-.081),.034,.47,.032,.025,rd-.16).castShadow=false;
    part(root,'cube',gold,0,.034,.47+side*(rd/2-.069),rw-.14,.023,.028).castShadow=false;
  }
  if(room.id==='starMap'){
    const sigil=new T.RingGeometry(.42,.44,28).rotateX(-Math.PI/2);
    const ring=new T.Mesh(sigil,material(gold));
    ring.position.set(0,.040,.48);root.add(ring);
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      part(root,'cube',gold,Math.sin(a)*.25,.041,.48+Math.cos(a)*.25,.034,.012,.36,0,a).castShadow=false;
    }
  }else{
    for(let i=-1;i<=1;i++){
      const z=.47+i*.52;
      part(root,'cube',cream,0,.039,z,.16,.021,.16,0,Math.PI/4).castShadow=false;
      for(const side of [-1,1]) part(root,'cube',gold,side*.27,.038,z,.064,.018,.064,0,Math.PI/4).castShadow=false;
    }
  }
}

function cutawayWall(interior,room,wall,i){
  const [x,z,w,d]=wall;
  const panel=new T.Group();
  const yaw=[Math.PI/2,-Math.PI/2,0,Math.PI,Math.PI][i];
  const length=i<2?d:w;
  panel.position.set(x,0,z);panel.rotation.y=yaw;interior.add(panel);
  part(panel,'cube',room.wall,0,.94,0,length,1.27,.235);
  part(panel,'cube',room.joinery??beam,0,.53,.127,length,.31,.055);
  part(panel,'cube',cream,0,1.59,0,length+.06,.11,.269);
  for(const side of [-1,1]){
    const column=side*(length*.5-.09);
    part(panel,'cube',beam,column,1.07,.137,.11,1.0,.073);
  }
  if(room.kind==='regional'&&length>2.5){
    regionalPanel(panel,room,length,i===2);
    return panel;
  }
  if(length>2.5&&(room.style??room.id)!=='bookshop'){
    const x=room.id==='griffin'?length*.24:0;
    const tint=room.id==='starMap'?magic:glow;
    part(panel,'cube',beam,x,1.16,.137,.77,.60,.075);
    part(panel,'cube',tint,x,1.16,.181,.63,.46,.053);
    part(panel,'cube',cream,x,1.16,.214,.047,.50,.025);
    part(panel,'cube',cream,x,1.16,.214,.65,.038,.025);
    if(room.id==='griffin'||room.id==='starMap'){
      const banner=room.rug??(room.id==='griffin'?'#aa6687':'#796397');
      part(panel,'cube',banner,-x-.92,1.16,.162,.38,.72,.043);
      part(panel,'diamond',gold,-x-.92,1.16,.192,.087,.13,.025);
    }
  }
  return panel;
}

function roomActors(root,room){
  return room.people.map(([x,z,skin,coat],i)=>{
    const actor=person([skin,coat,'#604957'],false,i+2);
    actor.group.position.set(x,0,z);
    actor.group.rotation.y=i===2?-.9:.25+i*.33;
    actor.group.scale.setScalar(i===0?.91:.95);
    root.add(actor.group);
    return actor;
  });
}

function starMap(root){
  const ringRoot=new T.Group();ringRoot.position.set(0,1.37,-1.26);root.add(ringRoot);
  for(const [r,a] of [[.57,.48],[.49,-.44],[.40,1.57]]){
    const ring=new T.Mesh(new T.TorusGeometry(r,.027,6,32),material(gold));
    ring.rotation.set(a,a*.62,0);ringRoot.add(ring);
  }
  const core=part(ringRoot,'diamond',magic,0,0,0,.24,.30,.24);
  const dials=roomDialArt(root);
  return (t,progress)=>{
    const aligned=progress?.aligned;
    ringRoot.rotation.y=t*(aligned?1.08:.36);
    core.scale.setScalar((aligned?.36:.23)+Math.sin(t*2)*.024);
    for(const [i,indicator] of dials.entries()){
      const value=progress?.dials[starDials[i]]??0;
      indicator.rotation.y=value*Math.PI*2/dialFaces.length;
      indicator.children.forEach((marker,index)=>{marker.visible=index===value;});
    }
  };
}

function roomDialArt(root){
  return [[-1.49,-.33],[-.93,-1.43],[1.49,-.33]].map(([x,z])=>{
    const indicators=new T.Group();
    indicators.position.set(x,.90,z);root.add(indicators);
    for(const [i,color] of dialColors.entries()){
      const shape=i===0?'sphere':i===1?'soft':'diamond';
      part(indicators,shape,color,0,.12,0,.106,i===1?.14:.11,.106);
    }
    return indicators;
  });
}

export function populateWalkInRooms(group,scene,height,blockers,roomList=rooms){
  const shells=new Map(),updates=[];
  for(const room of roomList){
    const shell=room.kind==='regional'?null:rootAt(group,room,height);
    // Exteriors share the city batch. The cutaway furniture also renders through the open doorway.
    const interior=rootAt(scene,room,height);
    interior.position.y+=roomFloorOffset;
    if(shell) shells.set(room.id,shell);
    blockers.push(...roomBlockers(room,Boolean(shell)));
    floorPattern(interior,room);
    const panels=[];
    const lowWalls=new T.Group();
    interior.add(lowWalls);
    for(const [i,wall] of roomWalls(room).entries()){
      const [x,z,w,d]=wall;
      part(lowWalls,'cube',stone,x,.16,z,w,.32,d);
      part(lowWalls,'cube',cream,x,.32,z,w+.032,.10,d+.029);
      if(shell){
        part(shell,'cube',room.wall,x,1.45,z,w,2.22,d);
        part(shell,'cube',beam,x,2.56,z,w+.04,.15,d+.04);
      }
      panels.push(cutawayWall(interior,room,wall,i));
    }
    if(shell){
      part(shell,'cube',room.wall,0,2.46,room.depth/2,roomDoorWidth,.24,.26);
      facade(shell,room);
    }
    let updateWorkpiece;
    if(room.kind==='workshop')updateWorkpiece=workshopFittings(interior,room);
    else for(const fixture of room.fixtures){
      if(room.feature===fixture[0]) updateWorkpiece=workpiece(interior,room,fixture);
      else furnish(interior,room,fixture);
    }
    for(const direction of [-1,1]) bulb(interior,direction*(room.width*.5-.29),-.84,1.36);
    const actors=roomActors(interior,room);
    const updateStarMap=room.id==='starMap'?starMap(interior):null;
    interior.traverse(node=>node.layers.enable(room.layer));
    if(!shell) lowWalls.traverse(node=>node.layers.set(room.layer));
    for(const panel of panels) panel.traverse(node=>node.layers.set(room.layer));
    updates.push({room,actors,panels,updateStarMap,updateWorkpiece});
  }
  return {shells,update(t,player,progress,activities){
    for(const {room,actors,panels,updateStarMap,updateWorkpiece} of updates){
      if(Math.hypot(room.x-player.x,room.z-player.z)>28) continue;
      for(const [i,actor] of actors.entries()) animate(actor,t+i,false);
      updateStarMap?.(t,progress);
      updateWorkpiece?.(t,activities?.[room.id]??0);
      const angle=player.yaw-room.yaw,s=Math.sin(angle),c=Math.cos(angle);
      const facing=[s,-s,c,-c,-c];
      panels.forEach((panel,i)=>{panel.visible=facing[i]>.20;});
    }
  }};
}
