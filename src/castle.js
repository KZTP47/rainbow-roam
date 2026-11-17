import * as T from 'three';
import {part,branch,material} from './models.js';
import {celMaterial} from './cel.js';
import {seeded} from './map-data.js';
import {doorSign,mountCampusSign} from './campus-signs.js';

const stone='#c1afa0',dark='#958a91',light='#e0c8ab',roof='#525373',wood='#8c685d';
const metal='#b38a69', gold='#e4ae69';
const pane=celMaterial('#86aab3',{transparent:true,opacity:.36,depthWrite:false});
const glow=celMaterial('#fbe1a7',{emissive:'#f8b46d',emissiveIntensity:.72});
const rimGeo=new T.TorusGeometry(1,.049,10,30);
const skyBlue='#84acc9';
const pointedWindow=new T.Shape().moveTo(-.5,0).lineTo(.5,0).lineTo(.5,.66)
  .quadraticCurveTo(.45,.83,0,1).quadraticCurveTo(-.45,.83,-.5,.66).lineTo(-.5,0);
const windowGeometry=new T.ShapeGeometry(pointedWindow);

export const blackLake={x:-39,z:0,rx:10.8,rz:16.1,level:.27};
const rooms=[
  [-25,-11,11,'library','Library and Restricted Section'],
  [32,-28,7.4,'owlery','Owlery'],
  [27,-12,11,'potions','Potions Classroom'],
  [25,27,13,'greenhouse','Herbology Greenhouses'],
  [-16,-22,8.5,'kitchen','Hogwarts Kitchens'],
  [16,-19,8.3,'hospital','Hospital Wing'],
  [44,5,10,'charms','Charms Classroom'],
  [36,18,9,'transfigure','Transfiguration Classroom'],
  [41,-14,10,'defense','Defence Against the Dark Arts'],
  [44,-32,10,'requirement','Room of Requirement'],
  [-42,-18,9,'bath','Prefects’ Bathroom'],
  [-43,-36,12,'chamber','Chamber of Secrets'],
  [-23,43,10,'gryffindor','Gryffindor Common Room'],
  [-36,45,10,'hufflepuff','Hufflepuff Common Room'],
  [35,46,10,'ravenclaw','Ravenclaw Common Room'],
  [48,44,10,'slytherin','Slytherin Common Room'],
  [-5,43,15,'staircase','Grand Staircase'],
  [-4,-33,8.0,'headmaster','Headmaster’s Office'],
  [16,7,8.8,'trophy','Trophy Room'],
  [-30,3,8.7,'myrtle','Moaning Myrtle’s Bathroom']
];
const outdoorSigns=[
  ['Quidditch Pitch',13,54.25,3.18,4.4],
  ['Forbidden Forest',-51,43.4,3.15,4.8],
  ['Whomping Willow',-49,22.4,3.15,4.9],
  ['Boathouse',-51,4.75,3.21,3.9],
  ['Astronomy Tower',23,-40,3.15,4.8],
  ['Training Courtyard',12,24.9,3.15,5.2]
];
function chamberPlaque(name,width,type){
  // The Great Hall blocks a straight view down the office's shallow courtyard.
  if(type==='headmaster') return [name,width*.5+.14,3.92,-2.85,5.15,false,Math.PI*.5];
  const board=doorSign(name,width);
  if(type==='myrtle') board[1]=.86; // Leave a clear sightline past the Covered Bridge.
  return board;
}
export function campusSigns(height){
  const doors=rooms.map(([x,z,width,type,name])=>{
    const [,dx,dy,dz,boardWidth,,yaw=0]=chamberPlaque(name,width,type);
    return {name,x:x+dx,y:height(x,z)+dy,z:z+dz,width:boardWidth,yaw,door:true};
  });
  return [...doors,...outdoorSigns.map(([name,x,z,elevation,width])=>
    ({name,x,y:height(x,z)+elevation,z,width,yaw:0,door:false}))];
}
export const castleLandmarks=[
  ...rooms.filter(([, , ,type])=>!['library','potions','greenhouse','owlery'].includes(type))
    .map(([x,z, ,type,name])=>[name,x,z-3,type==='bath'?'water':'hall']),
  ['Restricted Section',-25,-18,'hall'],['Astronomy Tower',23,-43,'hall'],
  ['Quidditch Pitch',13,47,'wind'],['Forbidden Forest',-51,33,'tree'],
  ['Whomping Willow',-49,17,'tree'],['Boathouse',-50,2,'water'],
  ['Viaduct',0,-52,'bridge'],['Training Courtyard',12,23,'hall']
];
export const campusPlantClear=(x,z,padding=0)=>rooms.every(([rx,rz,width])=>
  Math.abs(x-rx)>width*.5+padding||z<rz-10-padding||z>rz+1+padding)
  &&Math.hypot((x-13)/1.3,z-47)>8+padding;

const crestLine='#682f39';
const crests={
  gryffindor:{ink:'#ffe09a',shade:'#bd724e',field:'#92293e',animal:[[19,19],[24,32],[43,42],[52,55],[45,61],[40,67],[44,77],[50,76],[52,87],[60,83],[69,88],[68,77],[79,79],[80,69],[91,68],[83,58],[71,58],[68,51],[80,49],[77,43],[67,46],[60,45],[56,41],[65,34],[80,34],[86,28],[84,20],[76,23],[72,28],[58,23],[49,29],[36,24],[32,16],[19,14],[13,17]],parts:[
    [[24,34],[11,43],[8,55],[11,68],[23,77],[24,84],[18,92],[28,93],[34,86],[32,74],[20,65],[16,56],[19,48],[32,45]],
    [[48,56],[34,61],[26,72],[31,75],[37,67],[53,65]], [[54,70],[58,74],[65,76],[70,73],[68,62],[72,58],[63,60],[59,67]]],
    eye:[72,72]},
  hufflepuff:{ink:'#f7e2ad',shade:'#4f4142',field:'#a86d2d',animal:[[11,32],[13,44],[23,54],[35,62],[63,64],[72,72],[81,72],[80,64],[89,62],[96,51],[96,46],[84,42],[77,39],[74,30],[69,23],[58,23],[61,30],[62,38],[46,37],[43,28],[35,24],[28,24],[31,33],[22,31],[13,26],[7,27]],parts:[
    [[62,64],[72,69],[77,64],[74,57],[85,55],[91,48],[81,47],[73,50],[70,44],[65,43],[64,53],[59,56]],
    [[22,42],[31,49],[60,51],[63,47],[42,45],[27,37]], [[75,58],[81,58],[89,53],[92,49],[88,48],[83,53],[77,54]]],eye:[80,59]},
  ravenclaw:{ink:'#edcf98',shade:'#ac7551',field:'#405d9a',animal:[[50,75],[56,83],[65,81],[71,74],[65,71],[61,65],[70,58],[84,79],[94,84],[91,71],[85,61],[92,65],[91,54],[82,45],[91,50],[85,36],[76,30],[72,24],[60,28],[52,20],[43,22],[34,28],[25,26],[12,36],[10,45],[19,42],[9,55],[7,66],[19,58],[11,72],[9,84],[23,79],[38,58],[45,59]],parts:[
    [[49,65],[53,70],[55,76],[62,76],[65,73],[60,71],[59,65],[55,61],[58,57],[50,46],[47,52]],
    [[38,46],[25,55],[16,72],[20,68],[32,54],[45,48]], [[61,47],[73,52],[86,70],[81,63],[74,52],[65,44]],
    [[48,40],[55,40],[62,32],[51,25],[44,30]]],eye:[60,75]},
  slytherin:{ink:'#e7e5c2',shade:'#9db595',field:'#315f53',animal:[[65,82],[68,88],[76,87],[87,78],[92,69],[90,63],[84,63],[79,68],[76,62],[72,62],[70,71],[65,69],[63,76]],parts:[],eye:[80,79]}
};

function crestMesh(group,points,color,z=.026){
  const shape=new T.Shape();
  points.forEach(([x,y],index)=>index?shape.lineTo(x,y):shape.moveTo(x,y));
  shape.closePath();
  const mesh=new T.Mesh(new T.ShapeGeometry(shape),new T.MeshStandardMaterial({
    color,side:T.DoubleSide,emissive:color,emissiveIntensity:.17,roughness:.85
  }));
  mesh.position.z=z;group.add(mesh);return mesh;
}

export function houseCrest(parent,house,x,y,z,scale=1){
  const {animal,parts,ink,shade,field,eye}=crests[house];
  const group=new T.Group();group.name=house+' animal crest';
  group.position.set(x-scale*.5,y-scale*.5,z);group.scale.setScalar(scale/100);parent.add(group);
  crestMesh(group,[[7,91],[50,95],[93,91],[89,34],[72,19],[50,7],[28,19],[11,34]],ink);
  crestMesh(group,[[12,85],[50,89],[88,85],[84,36],[70,23],[50,12],[30,23],[16,36]],field,.09);
  if(house==='slytherin'){
    const curve=new T.CatmullRomCurve3([[76,74],[48,73],[31,65],[33,59],[57,57],[73,53],[74,45],
      [61,40],[39,41],[31,34],[37,27],[57,29],[65,23],[59,18],[49,21]].map(([px,py])=>new T.Vector3(px,py,.22)));
    group.add(new T.Mesh(new T.TubeGeometry(curve,48,4.2,5,false),material(ink)));
    crestMesh(group,[[87,71],[94,67],[94,64],[90,65],[92,61],[89,61],[85,65]],'#e3aa94',.44);
  }
  crestMesh(group,animal,ink,.37);
  for(const detail of parts) crestMesh(group,detail,shade,.48);
  crestMesh(group,[[eye[0]-2.35,eye[1]],[eye[0],eye[1]+1.55],[eye[0]+2,eye[1]+.45],[eye[0],eye[1]-1.62]],crestLine,.67);
  return group;
}

function box(g,color,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){
  return part(g,'cube',color,x,y,z,sx,sy,sz,rx,ry,rz);
}

function lancet(parent,x,y,z,width,height,tone,trim=light){
  const group=new T.Group();group.position.set(x,y,z);parent.add(group);
  const glass=new T.Mesh(windowGeometry,material(tone));
  glass.scale.set(width,height,1);group.add(glass);
  for(const side of [-1,1]){
    box(group,trim,side*width*.51,height*.337,.04,width*.057,height*.68,.071);
    branch(group,trim,[side*width*.51,height*.674,.04],[0,height*1.025,.04],width*.031);
  }
  box(group,trim,0,-.027,.06,width*1.14,.067,.11);
  box(group,trim,0,height*.43,.049,width*.044,height*.86,.047);
  box(group,trim,0,height*.38,.046,width,.038,.049);
  return group;
}

function tower(root,x,z,y,size,height,color=stone){
  const g=new T.Group();g.position.set(x,y,z);root.add(g);
  part(g,'cyl',color,0,height*.50,0,size,height,size);
  part(g,'cyl',dark,0,height*.82,0,size*1.07,.32,size*1.07);
  part(g,'cyl',light,0,height*.97,0,size*1.13,.53,size*1.13);
  part(g,'cone',roof,0,height+size*1.19,0,size*1.25,size*2.62,size*1.25);
  part(g,'sphere',gold,0,height+size*2.58,0,.14+size*.07,.14+size*.07,.14+size*.07);
  for(let level=0;level<3;level++){
    const yy=height*(.22+level*.25);
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3;
      const window=lancet(g,Math.sin(a)*size*.997,yy,Math.cos(a)*size*.997,size*.34,Math.min(3,height*.18),
        level%2?'#7b849d':'#caa27f');
      window.rotation.y=a;
    }
  }
  for(let i=0;i<14;i++){
    const a=i*Math.PI/7;
    box(g,dark,Math.sin(a)*size*.99,height*.9,Math.cos(a)*size*.99,
      size*.09,.45,size*.09,0,a,0);
  }
  return g;
}

function arcade(g,x,y,z,width){
  box(g,stone,x-width*.49,y+1.22,z,.42,2.45,.78);
  box(g,stone,x+width*.49,y+1.22,z,.42,2.45,.78);
  for(let i=0;i<13;i++){
    const angle=i*Math.PI/12;
    box(g,i%3===0?light:stone,x+Math.cos(angle)*width*.49,y+2.36+Math.sin(angle)*width*.49,z,
      .49,.45,.79,0,0,angle-Math.PI*.5);
  }
}

function study(room,width,type){
  for(let side=-1;side<=1;side+=2)for(let i=0;i<4;i++){
    const x=side*(width*.31),z=-1.5-i*1.9;
    if(type==='library'){
      box(room,wood,x,1.23,z,.40,2.45,1.71);
      for(let row=0;row<3;row++){
        box(room,metal,x-side*.11,.34+row*.66,z,.37,.087,1.61);
        for(let j=0;j<6;j++)
          box(room,['#a7758d','#ad825f','#829889','#7790a7','#bc8966'][j%5],x-side*.31,.56+row*.66,z-.62+j*.24,.26,.31+(j%3)*.084,.15,0,side*.15,.06);
      }
    } else {
      box(room,wood,x,.83,z,1.8,.24,.85);
      for(const sign of [-1,1])box(room,dark,x+sign*.69,.38,z,.21,.75,.52);
      if(type==='potions'){
        part(room,'fine','#414455',x,1.11,z,.42,.32,.37);
        part(room,'cyl',i%2?'#cab2dd':'#84b1ae',x,1.25,z,.29,.059,.286);
        part(room,'fine','#b19e93',x+.61,1.11,z,.095,.16,.091);
      }else{
        part(room,'cyl','#96705d',x,1.14,z,.35,.40,.31);
        for(let j=0;j<5;j++){
          const a=j*Math.PI*2/5;
          branch(room,'#659173',[x,1.33,z],[x+Math.cos(a)*.31,1.81,z+Math.sin(a)*.30],.043);
          part(room,'fine',j%2?'#8eac78':'#7f9d68',x+Math.cos(a)*.30,1.79,z+Math.sin(a)*.30,.23,.11,.16,0,a,.39);
        }
      }
    }
  }
}

const chamberThemes={
  gryffindor:['#ba9e94','#bfa094','#bc8e7d'],hufflepuff:['#baab89','#bcc090','#c3a887'],
  ravenclaw:['#a4a0bb','#afadc5','#b5a4bd'],slytherin:['#8eaaa1','#a1aba5','#939d96'],
  chamber:['#85a096','#879e94','#778f8a'],bath:['#b9a3bc','#d2bdd3','#c9becc'],
  myrtle:['#a2b3b3','#adbfbd','#8eaab3'],hospital:['#c6b9a6','#d3cbc2','#c6bfc0'],
  requirement:['#aaa0b2','#b1a6bb','#9d94a6'],staircase:['#aaa3b2','#bab1be','#a5a5b2'],
  kitchen:['#b3a092','#c5aa8b','#bd9f89'],headmaster:['#bba4b0','#c3a9ad','#b59caf'],
  trophy:['#b7a5b8','#c6b1bb','#b6a7bb']
};

function chamber(root,land,blockers,x,z,width,type,name,scene,animated){
  const depth=10, height=type==='greenhouse'?4.1:type==='staircase'?7.4:5.6;
  const room=new T.Group();room.position.set(x,land.height(x,z),z);root.add(room);
  const glass=type==='greenhouse';
  const [wallTint,tileA,tileB]=chamberThemes[type]??[stone,'#c3af9f','#b7a5a1'];
  box(room,'#b4a38f',0,.033,-depth*.46,width,.12,depth+.62);
  for(let j=0;j<8;j++)for(let k=0;k<5;k++){
    const xx=(j-3.5)*width/8,zz=-.35-k*1.95;
    box(room,(j+k)%3?tileA:tileB,xx,.103,zz,width/8-.027,.025,1.91);
  }
  const wall=glass?pane:wallTint;
  for(const side of [-1,1]){
    const xx=side*width*.49;
    box(room,wall,xx,height*.5,-4.6,.30,height,10.25);
    box(room,wall,side*(width*.29),height*.49,.45,width*.36,height*.98,.49);
    box(room,glass?pane:roof,side*width*.25,height+.88,-4.61,width*.58,.18,10.38,0,0,side*-.48);
    blockers.push([x+xx,z-4.6,.27,5.19],[x+side*width*.28,z+.45,width*.17,.28]);
    for(let j=0;j<6;j++){
      const zz=.33-j*1.96;
      box(room,glass?'#74988f':dark,xx,height*.48,zz,.28,height,.26);
      box(room,glass?'#74988f':dark,side*width*.26,height+.84,zz,width*.58,.16,.21,0,0,side*-.48);
      if(!glass&&j<5){
        const win=lancet(room,xx-side*.18,2.24,zz-1,type==='library'?1.2:.91,2.04,j%2?skyBlue:'#bb8ea5');
        win.rotation.y=-side*Math.PI/2;
      }
    }
  }
  box(room,wall,0,height*.5,-9.69,width,height,.37);blockers.push([x,z-9.69,width*.5,.22]);
  const ridge=.88+width*.25*Math.tan(.48);
  for(let rise=.12;rise<ridge;rise+=.24){
    const span=2*(ridge-rise)/Math.tan(.48)+.19;
    for(const z of [-9.69,.45]) box(room,wall,0,height+rise,z,Math.min(span,width),.249,.37);
  }
  arcade(room,0,0,.54,Math.min(3.8,width*.37));
  if(!glass){
    box(room,stone,0,height*.84,.45,width*.29,height*.29,.41);
    part(room,'cone',roof,0,height+ridge+.83,-8.8,width*.12,2.14,1,0,0,.06);
  }
  mountCampusSign(room,...chamberPlaque(name,width,type));
  if(['library','potions','greenhouse'].includes(type)) study(room,width,type);
  else furnish(room,width,type,scene,animated);
  if(type==='library'){
    box(room,'#b28c79',0,1.07,-8.27,width*.38,.17,1.11);
    for(const side of [-1,1]) box(room,wood,side*1.44,.52,-8.27,.22,1.02,.86);
    const openBook='#eadcc3';
    box(room,openBook,-.26,1.21,-8.21,.48,.068,.48,0,0,-.19);
    box(room,openBook,.26,1.21,-8.21,.48,.068,.48,0,0,.19);
    for(const side of [-1,1]){
      box(room,'#8e798b',side*2.32,3.36,-9.45,1.09,1.42,.049);
      box(room,gold,side*2.32,4.08,-9.38,1.29,.059,.055);
    }
  }
  for(const point of [[-1.32,-2.9],[1.32,-6.25]])
    part(room,'fine',glow,point[0],height*.66,point[1],.18,.21,.18).castShadow=false;
}

function stool(group,x,y,z,tone=wood){
  part(group,'cyl',tone,x,y+.49,z,.33,.11,.32);
  for(const angle of [0,2.1,4.2])
    branch(group,wood,[x+Math.sin(angle)*.28,y,z+Math.cos(angle)*.28],[x+Math.sin(angle)*.16,y+.47,z+Math.cos(angle)*.16],.057);
}

function table(group,x,y,z,width,depth){
  box(group,wood,x,y+.93,z,width,.18,depth);
  for(const edge of [-1,1])box(group,'#785d57',x+edge*(width*.5-.19),y+.43,z,.21,.86,depth*.75);
}

function fireplace(group,x,z,tone){
  box(group,'#716274',x,1.57,z,2.52,3.13,.52);
  box(group,'#4d455b',x,.72,z+.28,1.65,1.46,.051);
  box(group,wood,x,1.76,z+.49,2.62,.19,.75);
  box(group,tone,x,.26,z+.56,2.75,.23,.9);
  for(const side of [-1,1]){
    part(group,'fine',glow,x+side*.31,.59,z+.422,.21,.35,.13,.12,0,side*.27);
    part(group,'diamond','#f4b871',x+side*.14,.65,z+.468,.10,.31,.11);
  }
}

function sofa(group,x,z,tone){
  box(group,tone,x,.42,z,2.62,.61,.91);
  box(group,tone,x,.89,z-.31,2.51,.56,.28);
  for(const sign of [-1,1]){
    box(group,tone,x+sign*1.24,.64,z,.26,.45,.94);
    part(group,'fine',light,x+sign*.62,.79,z-.11,.23,.21,.12,0,sign*.38);
  }
}

function furnish(room,width,type,scene,animated){
  const theme=crests[type];
  if(theme){
    fireplace(room,0,-9.03,theme.field);
    houseCrest(room,type,0,3.22,-8.71,1.65);
    box(room,theme.field,0,.139,-4.9,width*.68,.038,5.44);
    box(room,theme.shade,0,.16,-4.9,width*.59,.014,4.89);
    for(const sign of [-1,1]){
      sofa(room,sign*(width*.29),-6.7,theme.field);
      table(room,sign*(width*.31),.13,-3.55,1.83,1.13);
      for(let j=0;j<4;j++)
        box(room,j%2?theme.shade:theme.ink,sign*(width*.31)+(j-1.5)*.32,1.15,-3.57,.21,.18+j*.07,.43,0,.08*j);
    }
    if(type==='gryffindor'){
      const portrait=new T.Group();
      portrait.position.set(-3,2.39,.74);room.add(portrait);
      part(portrait,'fine','#a98b61',0,0,0,.64,.86,.088);
      part(portrait,'fine','#87607f',0,0,.048,.53,.72,.077);
      part(portrait,'fine','#bb9b99',0,-.25,.13,.33,.32,.088);
      part(portrait,'fine','#a4877e',0,.16,.12,.26,.37,.10);
      part(portrait,'fine','#ecd0af',0,.03,.202,.17,.22,.066);
      part(portrait,'fine','#ebacaa',0,-.26,.21,.22,.14,.055);
      for(const s of [-1,1])part(portrait,'sphere','#7e5b69',s*.067,.064,.266,.022,.021,.012);
    }else if(type==='hufflepuff'){
      for(const side of [-1,1]) for(let j=0;j<3;j++){
        const x=side*(2.06+j*.83),z=-7.63+j*.62,y=.65+j*.04;
        part(room,'cyl',j%2?'#b5906e':'#a67a60',x,y,z,.39,1.24,.415);
        part(room,'cyl',metal,x,y+.37,z,.42,.10,.449);
        part(room,'cyl',metal,x,y-.40,z,.41,.10,.444);
        for(let leaf=0;leaf<5;leaf++){
          const a=leaf*2.40,dx=Math.sin(a)*.42,dz=Math.cos(a)*.37;
          branch(room,'#75876d',[x,y+.62,z],[x+dx,y+1.14,z+dz],.026);
          part(room,'fine',leaf%2?'#9bac6b':'#7f9c72',x+dx,y+1.14,z+dz,.22,.08,.16,0,a,.34);
        }
      }
    }else if(type==='ravenclaw'){
      const skyPanel=part(room,'fine','#635d86',0,6.02,-5.11,3.63,.048,3.13);
      skyPanel.castShadow=false;
      for(let star=0;star<32;star++){
        const a=star*2.39,span=Math.sqrt(star/32),size=.025+.045*(star%3);
        part(room,'diamond',star%2?glow:'#d7c3e6',Math.sin(a)*3.17*span,5.96,-5.11+Math.cos(a)*2.65*span,size,.026,size);
      }
      part(room,'cyl',light,3.22,.45,-8.77,.51,.9,.53);
      part(room,'fine','#d2c6b7',3.22,1.24,-8.77,.28,.49,.23);
      part(room,'fine','#e2d0b8',3.22,1.75,-8.73,.182,.235,.17);
      part(room,'cone',gold,3.22,1.955,-8.74,.245,.16,.23);
    }else{
      for(const side of [-1,1]){
        const x=side*3.32;
        const water=celMaterial('#668e8a',{emissive:'#467471',emissiveIntensity:.58});
        const glass=lancet(room,x,1.47,-9.39,1.45,3.61,'#6d9c8c','#687676');
        for(let i=0;i<4;i++){
          const fish=part(glass,'fine',water,-.41+i*.27,1.0+i*.43,.11,.16,.093,.026,0,0,i*.11);
          fish.castShadow=false;
          part(glass,'cone',water,-.57+i*.27,1.0+i*.43,.107,.084,.18,.021,0,0,-Math.PI*.5);
        }
      }
    }
    return;
  }
  if(type==='kitchen'){
    fireplace(room,0,-8.98,'#be9892');
    for(const sign of [-1,1]){
      table(room,sign*2.24,.12,-4.21,2.67,1.51);
      for(let i=0;i<7;i++){
        const x=sign*2.24+(i%4-1.5)*.54,z=-4.65+Math.floor(i/4)*.66;
        part(room,'fine',i%3?'#d1a475':'#c68585',x,1.23,z,.20,.10,.22,0,i);
      }
      for(let i=0;i<4;i++){
        const x=sign*(1.96+i*.45);
        branch(room,metal,[x,3.13,-7.1],[x,2.56,-7.1],.032);
        part(room,'cyl','#bb8e6c',x,2.49,-7.1,.26,.10,.20,i*.36);
      }
    }
  }else if(type==='headmaster'){
    table(room,0,.16,-8.23,3.52,1.7);
    box(room,'#a17272',0,1.38,-9.12,1.52,2.19,.16);
    box(room,'#805d64',0,.66,-8.71,1.39,.27,1.12);
    part(room,'fine','#e9d8ac',.8,1.30,-7.84,.42,.085,.31,0,.22);
    for(const side of [-1,1]) for(let i=0;i<3;i++){
      const x=side*(2.18+(i%2)*.42),z=-3.4-i*1.84;
      box(room,wood,x,1.44,z,.71,2.88,1.3);
      for(let row=0;row<3;row++)for(let j=0;j<3;j++)
        box(room,['#ac8f99','#778b9d','#c8af89'][(j+row+i)%3],x-side*.4,.61+row*.66,z+.33-j*.33,.21,.46,.23,0,0,.12*j);
    }
    const perch=2.05;
    branch(room,gold,[perch,.12,-8.25],[perch,2.27,-8.25],.073);
    branch(room,gold,[perch-.38,2.27,-8.25],[perch+.38,2.27,-8.25],.052);
    part(room,'fine','#cc795e',perch,2.60,-8.27,.26,.33,.30);
    part(room,'fine','#e5ac73',perch,2.89,-8.04,.19,.20,.19);
    part(room,'cone','#e9bc70',perch,2.85,-7.82,.09,.13,.076,Math.PI*.5);
    for(const side of [-1,1])part(room,'fine','#d59868',perch+side*.23,2.53,-8.35,.078,.11,.27,0,side*.26);
  }else if(type==='trophy'){
    for(const s of [-1,1]) for(let i=0;i<3;i++){
      const x=s*2.79,z=-2.57-i*2.13;
      table(room,x,.13,z,1.39,1.04);
      for(let k=0;k<2;k++){
        const q=x+(k-.5)*.57,yy=1.21+k*.17;
        part(room,'cyl','#c6a47d',q,1.14,z,.15,.10,.16);
        part(room,'cone',gold,q,yy+.17,z,.18,.28,.18,0,0,Math.PI);
        part(room,'fine',gold,q,yy+.19,z,.20,.151,.193);
        for(const e of [-1,1]){
          const handle=new T.Mesh(rimGeo,material(gold));handle.scale.set(.10,.13,1);
          handle.position.set(q+e*.18,yy+.25,z);room.add(handle);
        }
      }
    }
    box(room,'#8a7293',0,.15,-5.08,2.5,.075,6.83);
  }else if(type==='myrtle'){
    for(const side of [-1,1])for(let i=0;i<3;i++){
      const x=side*2.84,z=-2.67-i*2.09;
      box(room,wood,x,.44,z,1.02,.89,.61);
      part(room,'fine','#ddd9c6',x,.95,z,.54,.14,.47);
      part(room,'fine','#a5bbb6',x,1.033,z,.385,.058,.31);
      branch(room,metal,[x,.98,z-.28],[x,1.29,z-.28],.038);
    }
    const ghost=new T.Group();
    room.updateMatrixWorld(true);
    ghost.position.copy(room.localToWorld(new T.Vector3(.55,1.38,-6.1)));
    scene.add(ghost);
    const mist=new T.MeshBasicMaterial({color:'#b7d4e5',transparent:true,opacity:.63,depthWrite:false});
    part(ghost,'fine',mist,0,.22,0,.26,.31,.23).castShadow=false;
    part(ghost,'fine',mist,0,-.16,-.022,.26,.46,.21,0,0,.14).castShadow=false;
    for(const side of [-1,1]){
      part(ghost,'fine',mist,side*.21,.02,0,.09,.42,.09,0,0,side*.39).castShadow=false;
      part(ghost,'sphere','#86a5c5',side*.089,.27,.192,.036,.029,.015).castShadow=false;
    }
    const hover=ghost.position.y;
    animated.push(t=>{ghost.position.y=hover+Math.sin(t*.97)*.22;});
  }else if(type==='owlery'){
    for(const side of [-1,1]) for(let i=0;i<3;i++){
      const x=side*2.87,z=-2.73-i*2.19;
      branch(room,wood,[x,0,z],[x,3.80,z],.125);
      branch(room,wood,[x-side*.8,1.13+i*.24,z],[x,1.13+i*.24,z],.071);
      box(room,'#ac927d',x-side*.19,2.42+i*.31,z,.64,.72,.79);
      const hatch=part(room,'fine','#655960',x-side*.52,2.52+i*.31,z,.046,.20,.216);
      hatch.castShadow=false;
      part(room,'low','#baa173',x-side*.64,.22,z-.51,.34,.16,.44);
    }
    part(room,'fine','#786772',0,.14,-8.61,1.87,.11,.74);
    for(let i=0;i<8;i++){
      const x=(i-3.5)*.35,z=-8.49+Math.sin(i)*.29;
      part(room,'fine','#eadfd5',x,.37+i%3*.25,z,.052,.28,.027,.33,0,Math.sin(i*.47));
    }
  }else if(type==='hospital'){
    for(const sign of [-1,1]) for(let i=0;i<3;i++){
      const px=sign*2.74,pz=-2.2-i*2.46;
      box(room,wood,px,.40,pz,1.78,.58,1.13);
      box(room,'#e1ded3',px,.74,pz,1.58,.18,1.06);
      box(room,'#aec7c7',px-sign*.27,.844,pz,1.09,.082,.99);
      part(room,'fine','#f4e7d1',px+sign*.52,.89,pz,.28,.15,.36);
      box(room,metal,sign*3.93,1.24,pz,.14,2.07,1.28);
      box(room,'#ded5dd',sign*3.74,2.45,pz,.12,.70,1.82);
    }
  }else if(type==='bath'){
    part(room,'cyl',light,0,.27,-6.15,2.78,.29,2.46);
    part(room,'cyl','#a8d3d6',0,.451,-6.15,2.41,.16,2.16);
    for(let i=0;i<8;i++){
      const px=(i-3.5)*.39;
      branch(room,gold,[px,.42,-8.06],[px,1.17,-8.06],.057);
      branch(room,gold,[px,1.17,-8.06],[px,1.07,-7.77],.046);
      part(room,'sphere',i%2?'#d4b8dd':'#c3dfe0',px,.61,-7.77,.108,.112,.111);
    }
    lancet(room,0,1.98,-9.33,3.1,3.35,'#83b7bb','#cbb3c3');
  }else if(type==='chamber'){
    for(const sign of [-1,1]) for(let i=0;i<3;i++){
      const xx=sign*4.14, z=-1.7-i*2.45;
      part(room,'cyl','#768f84',xx,1.73,z,.56,3.44,.57);
      part(room,'fine','#8da89b',xx-sign*.21,3.1,z+.044,.69,.48,.60,0,sign*.64);
      part(room,'fine','#4b5d59',xx-sign*.57,3.12,z+.46,.08,.082,.10);
    }
    box(room,'#71908a',0,.173,-5.1,3.84,.036,7.8);
    part(room,'fine','#9aa9a0',0,2.32,-9.1,1.36,1.79,.47);
    for(const sign of [-1,1]){
      part(room,'fine','#718880',sign*.63,2.56,-8.69,.36,.23,.17);
      part(room,'cone','#9aa9a0',sign*.37,1.71,-8.68,.27,.82,.18,.27,0,sign*.2);
    }
    part(room,'fine','#b2b8a7',0,2.31,-8.63,.27,.39,.23,.19);
  }else if(type==='staircase'){
    box(room,'#a6a0aa',0,.19,-7.88,13.71,.23,2.87);
    for(let i=0;i<9;i++){
      const side=i%2===0?-1:1,x=side*(2.1+i%3*1.15),y=2.2+i%4*1.02;
      const z=-9.3;
      box(room,gold,x,y,z,.99,1.33,.16);
      box(room,i%3?'#80677d':'#908390',x,y,z+.11,.84,1.12,.08);
      part(room,'fine','#dbb99a',x,y+.07,z+.157,.21,.35,.078);
    }
    room.updateMatrixWorld(true);
    for(const s of [-1,1]){
      const stair=new T.Group();
      stair.position.copy(room.localToWorld(new T.Vector3(s*3.21,.4,-6.59)));scene.add(stair);
      for(let i=0;i<10;i++){
        box(stair,'#ad9ca0',0,.19+i*.21,1.82-i*.46,2.48,.36,.6);
        for(const sign of [-1,1])box(stair,wood,sign*1.2,.52+i*.21,1.79-i*.46,.12,.74,.13);
      }
      animated.push(t=>{stair.rotation.y=s*(.21+Math.sin(t*.47+s)*.31);});
    }
  }else if(type==='requirement'){
    for(const sign of [-1,1]) for(let i=0;i<7;i++){
      const px=sign*(2.28+(i%3)*.55),pz=-2.5-i*.95;
      const high=.43+(i%4)*.31;
      box(room,i%2?wood:'#bb9e72',px,.33+high*.5,pz,.71,high,.78,0,i*.4);
      if(i%2)box(room,light,px,.33+high,pz,.75,.075,.83,0,i*.4);
      if(i%3===0)part(room,'fine','#c9afd5',px,.44+high,pz,.28,.25,.27);
    }
    const mirror=new T.Mesh(rimGeo,material(gold));
    mirror.scale.set(1.12,1.75,.48);mirror.position.set(0,2.1,-9.02);room.add(mirror);
    part(room,'fine','#a4b7c7',0,2.11,-9.08,1.16,1.77,.11);
  }else{
    for(const sign of [-1,1]) for(let i=0;i<3;i++){
      const x=sign*(width*.28),z=-2.25-i*2.25;
      table(room,x,0,z,1.63,1.1);stool(room,x,0,z+.94,'#aa8c85');
      if(type==='charms'){
        const quill=part(room,'fine','#e7cde0',x,.18+i*.11+1.11,z,.068,.29,.031,.19,0,.66);
        quill.castShadow=false;
      }else if(type==='transfigure'){
        part(room,'cyl','#c09c86',x,.96+.135,z,.127,.25,.13,0,0,.12);
        part(room,'fine','#cac3d7',x+.24,1.15,z,.14,.12,.18);
      }else{
        for(const dx of [-.58,.58])branch(room,metal,[x+dx,1.18,z],[x-dx,2.0,z],.064);
        part(room,'diamond','#b7b1b7',x,1.57,z+.06,.40,.52,.10);
      }
    }
  }
}

function grounds(root,scene,land,blockers,seed,animated){
  const height=land.height;
  const xPitch=13,zPitch=47,y=height(xPitch,zPitch);
  for(let i=0;i<8;i++)
    box(root,i%2?'#94ac7e':'#a1b787',xPitch+(i-3.5)*2.84,y+.025,zPitch,2.842,.042,14.78);
  for(const sign of [-1,1]){
    for(let i=0;i<3;i++){
      const zz=zPitch+sign*6.08,xx=xPitch+(i-1)*2.05,yy=height(xx,zz),h=5.14+i%2*1.67;
      branch(root,metal,[xx,yy,zz],[xx,yy+h,zz],.10);
      const hoop=new T.Mesh(rimGeo,material(gold));hoop.position.set(xx,yy+h+.43,zz);hoop.scale.setScalar(.63);root.add(hoop);
    }
    for(let t=0;t<3;t++){
      box(root,wood,xPitch+sign*(10.75+t*.57),y+.25+t*.28,zPitch,1.00,.37+t*.38,10.3);
      box(root,t%2?'#9f7294':'#ba8a5e',xPitch+sign*(10.75+t*.57),y+.48+t*.47,zPitch,.74,.094,10.22);
    }
  }
  const pitchLine=new T.Mesh(rimGeo,material('#edddb2'));
  pitchLine.rotation.x=-Math.PI*.5;pitchLine.scale.set(2.78,2.36,.12);pitchLine.position.set(xPitch,y+.074,zPitch);
  root.add(pitchLine);
  for(const s of [-1,1]){
    box(root,'#d6cf9f',xPitch,y+.061,zPitch+s*7.20,22.23,.034,.075);
    box(root,'#d6cf9f',xPitch+s*11.12,y+.061,zPitch,.075,.034,14.46);
  }

  for(let i=0;i<25;i++){
    const angle=seed()*Math.PI*2,radius=2.6+seed()*5.2;
    const x=-51+Math.cos(angle)*radius,z=33+Math.sin(angle)*radius,y=height(x,z);
    const scale=.72+seed()*.88, h=3.42*scale;
    branch(root,'#6f6269',[x,y,z],[x+.27*scale,y+h,z],.16*scale);
    for(let j=0;j<3;j++)part(root,'cone',j%2?'#637e73':'#4f6e69',x,y+h*.66+j*.71*scale,z,1.14*scale-j*.17,h*.58,1.13*scale-j*.18,0,i*.43,.04-j*.04);
    blockers.push([x,z,.32]);
  }

  const willow=new T.Group(),wx=-49,wz=17,wy=height(wx,wz);
  willow.position.set(wx,wy,wz);scene.add(willow);
  part(willow,'cyl','#826d64',0,2.21,0,.72,4.43,.72,.06);
  for(let i=0;i<7;i++){
    const limb=new T.Group();limb.position.y=3.12+i%.5;willow.add(limb);
    const a=i*2.41;
    branch(limb,'#87746a',[0,0,0],[Math.sin(a)*2.12,1.13,Math.cos(a)*2.12],.26);
    branch(limb,'#857367',[Math.sin(a)*1.57,.83,Math.cos(a)*1.57],[Math.sin(a)*3.92,-.29,Math.cos(a)*3.92],.12);
    for(let n=0;n<4;n++)part(limb,'fine',i%2?'#6e937c':'#8d9d7b',Math.sin(a)*(1.35+n*.63),1.19-n*.29,Math.cos(a)*(1.35+n*.63),.91-n*.10,.61,.73,0,a);
    animated.push(t=>{limb.rotation.y=Math.sin(t*.86+i)*.17;limb.rotation.z=Math.sin(t*1.21+i)*.065;});
  }
  blockers.push([wx,wz,1.14]);

  const bx=-51,bz=2,by=height(bx,bz);
  for(let i=0;i<9;i++){
    const z=bz+(i-4)*.62;
    box(root,i%2?wood:'#a98370',bx,by+.034,z,3.9,.23,.60);
  }
  for(const s of [-1,1]){
    box(root,wood,bx+s*1.71,by+1.07,bz,.21,2.14,.24);
    box(root,roof,bx+s*.87,by+2.55,bz,2.12,.19,4.9,0,0,s*-.53);
  }
  for(let i=0;i<3;i++){
    const xx=bx+1.32+i*.84,z=bz-(i%2)*2.71;
    part(root,'fine','#a98774',xx,blackLake.level+.08,z,.41,.19,1.01,0,.2*i);
    box(root,wood,xx,blackLake.level+.23,z,.84,.08,.2);
  }

  for(let i=0;i<30;i++){
    const x=-16+i*1.10,y=height(x,-52),z=-52;
    box(root,i%2?'#a5969b':'#ad9b98',x,y+.04,z,1.105,.20,3.47);
    if(i%3===0)for(const sign of [-1,1]){
      box(root,stone,x,y+.53,z+sign*1.63,.32,1.14,.28);
      if(i) box(root,steelGray,x-1.66,y+.87,z+sign*1.63,3.32,.15,.16);
    }
  }
  const ax=23,az=-43,ay=height(ax,az);
  const spot=new T.Group();spot.position.set(ax,ay,az);root.add(spot);
  part(spot,'cyl',stone,0,.16,0,3.1,.26,2.49);
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3,px=Math.sin(a)*2.71,pz=Math.cos(a)*2.38;
    if(pz>1.6)continue;
    part(spot,'cyl',stone,px,1.45,pz,.21,2.91,.21);
    part(spot,'cyl',gold,px,2.94,pz,.30,.16,.29);
  }
  part(spot,'cyl',wood,0,1.15,0,.13,2.1,.13);
  part(spot,'cyl','#bda380',0,2.51,.22,.31,2.0,.30,1.17,0,.34);
  part(spot,'cyl','#7795ac',0,2.86,.99,.34,.12,.34,1.17,0,.34);

  for(let i=0;i<6;i++){
    const x=12+(i%2?2.46:-2.46),z=20+Math.floor(i/2)*2.10,y=height(x,z);
    const target=new T.Mesh(rimGeo,material(i%2?'#d0b88e':'#9a8cb1'));
    target.position.set(x,y+1.85,z);target.scale.setScalar(.54);root.add(target);
    box(root,wood,x,y+.67,z,.134,1.46,.15);
  }
  for(const [name,x,z,elevation,width] of outdoorSigns)
    mountCampusSign(root,name,x,height(x,z)+elevation,z,width,elevation);
}
const steelGray='#7a778e';

export function castleAnnex(root,scene,land,blockers){
  const seed=seeded(482),animated=[];
  for(const [x,z,r,h] of [[-15,-39,3.5,17.3],[7,-44,5.6,24],[18,-37,3.2,17.8],[-25,-34,2.6,14.4],[33,-41,3,17.1],[-12,21,2.7,11.2]]){
    const y=land.height(x,z);
    tower(root,x,z,y,r,h);
    blockers.push([x,z,r*.86]);
  }
  for(const [x,z,sx,sz,h] of [[-12,-48,12,6.4,12],[14,-41,7,8,11.2],[-20,-33,7.7,5.3,8.2]]){
    const y=land.height(x,z);
    box(root,stone,x,y+h*.5,z,sx,h,sz);
    for(const side of [-1,1]) box(root,roof,x+side*sx*.25,y+h+.72,z,sx*.57,.25,sz+.61,0,0,side*-.42);
    for(let i=0;i<Math.floor(sx/2.1);i++){
      const cx=x+(i-(Math.floor(sx/2.1)-1)*.5)*1.87;
      lancet(root,cx,y+h*.58,z+sz*.505,1.2,h*.28,i%2?'#91a9b9':'#c39f82');
    }
    blockers.push([x,z,sx*.48,sz*.49]);
  }

  for(const [x,z,width,type,name] of rooms) chamber(root,land,blockers,x,z,width,type,name,scene,animated);

  const clock=new T.Mesh(new T.CircleGeometry(.83,32),material('#dfc8a3'));
  clock.position.set(-12,land.height(-12,21)+8.6,23.73);root.add(clock);
  const band=new T.Mesh(rimGeo,material(metal));band.position.copy(clock.position).add(new T.Vector3(0,0,.05));
  band.scale.setScalar(.85);root.add(band);
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    box(root,dark,-12+Math.sin(a)*.68,clock.position.y+Math.cos(a)*.68,23.807,.063,.13,.026,0,0,-a);
  }
  box(root,'#756383',-12,clock.position.y+.15,23.81,.087,.38,.04,0,0,-.41);
  box(root,'#756383',-12+.21,clock.position.y-.12,23.81,.069,.49,.038,0,0,1.0);

  const lake=new T.Mesh(new T.CircleGeometry(1,68),celMaterial('#5996a8',{transparent:true,opacity:.89}));
  lake.rotation.x=-Math.PI/2;lake.scale.set(blackLake.rx,blackLake.rz,1);
  lake.position.set(blackLake.x,blackLake.level,blackLake.z);scene.add(lake);
  for(let i=0;i<43;i++){
    const a=i*Math.PI*2/43,r=1+seed()*.10;
    const x=blackLake.x+Math.sin(a)*blackLake.rx*r,z=blackLake.z+Math.cos(a)*blackLake.rz*r;
    if(Math.abs(z-11)<2)continue;
    const y=land.height(x,z);
    part(root,'fine',i%3?'#aaa495':'#8b9a8c',x,y+.22,z,.48+seed()*.48,.52,.50+seed()*.43).castShadow=false;
    if(i%3===0)branch(root,'#789379',[x,y,z],[x+.17,y+.99,z+.09],.047);
  }
  for(let i=0;i<16;i++){
    const x=-49.8+i*1.19,z=11;
    const y=land.height(x,z);
    box(root,i%2?'#ae8a79':'#b99782',x,y+.073,z,1.16,.14,2.85);
    if(i%3===0)for(const s of [-1,1]){
      box(root,wood,x,y+1.45,z+s*1.38,.17,2.86,.16);
      box(root,wood,x,y+1.11,z+s*1.38,3.56,.096,.09);
    }
    for(const s of [-1,1])box(root,roof,x,y+2.99,z+s*.74,1.22,.19,1.72,s*.32);
  }
  const schoolyard=new T.Group();
  schoolyard.position.set(0,land.height(0,24)-.09,24);root.add(schoolyard);
  for(const s of [-1,1])for(let i=0;i<5;i++){
    const x=s*(5.9+i*2.0);
    box(schoolyard,stone,x,.19,1.56,1.97,.38,1.39);
    box(schoolyard,'#9c9977',x,.39,1.55,1.62,.047,1.04);
    for(let j=0;j<4;j++){
      const u=x+(j-1.5)*.32;
      part(schoolyard,'fine',['#8aa385','#8fac80','#d4acbd'][j%3],u,.57,1.56,.22,.26,.19);
    }
  }
  for(let i=0;i<4;i++){
    const x=38+(i%2)*4,z=11-Math.floor(i/2)*14,y=land.height(x,z);
    part(root,'cyl','#b1a997',x,y+.12,z,.83,.25,.83);
    for(let k=0;k<3;k++)part(root,'cube','#dbc5a0',x-.49+k*.48,y+.272,z,.35,.05,.098);
  }
  grounds(root,scene,land,blockers,seed,animated);
  return t=>animated.forEach(update=>update(t));
}
