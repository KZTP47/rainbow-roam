import * as T from 'three';
import {part,branch} from './models.js';
import {home,plots,crops,cropFood,furnishings,extensions,homesteadDoorHalfWidth,homesteadLayout,propertyArea} from './homestead.js';

const wall='#f4d7ac',wood='#825b53',roof='#b47e9b',trim='#a37e6d';
const positions=[[-2.05,.12],[2.0,-1.12],[-2.06,-1.42],[2.03,1.18]];
const box=(root,color,x,y,z,a,b,c,rz=0)=>part(root,'cube',color,x,y,z,a,b,c,0,0,rz);

export function homesteadItem(id){
  const model=new T.Group();
  if(Object.hasOwn(crops,id)){
    const c=crops[id].color;
    box(model,'#f1d6ae',0,.29,0,.52,.58,.15,-.12);
    box(model,c,0,.36,.085,.35,.27,.024,-.12);
    for(let i=0;i<3;i++)part(model,'fine','#896f62',(i-1)*.09,.17,.086,.033,.042,.022);
  }else if(cropFood.includes(id)){
    const seed=Object.values(crops).find(c=>c.crop===id);
    for(let i=0;i<4;i++){
      const x=(i%2-.5)*.26,z=(Math.floor(i/2)-.5)*.22;
      const body=id==='honeyCarrot'?'cone':'fine';
      part(model,body,seed.color,x,.22,z,.125,id==='honeyCarrot'?.38:.134,.126,0,0,(i-1.5)*.2);
      part(model,'fine','#87a67a',x,.36,z,.079,.124,.032,0,i,.47);
    }
  }else if(id==='patchRug'){
    box(model,'#deb1a1',0,.023,0,1.58,.06,1.10);
    for(let x=0;x<5;x++)for(let z=0;z<3;z++)
      box(model,['#c28fa9','#e7b4af','#ecce9c','#a8b8b4'][(x+z*2)%4],(x-2)*.291,.058,(z-1)*.31,.283,.012,.304);
  }else if(id==='moonLamp'){
    part(model,'cyl','#a58b71',0,.065,0,.24,.13,.24);
    part(model,'cyl','#996d64',0,.52,0,.043,.95,.043);
    part(model,'fine','#fce3ba',0,1.06,0,.29,.31,.27);
    for(let i=0;i<5;i++){
      const a=i*Math.PI*2/5;
      part(model,'fine','#d6a8ce',Math.cos(a)*.215,.99,Math.sin(a)*.215,.119,.25,.091,0,a,.22);
    }
  }else if(id==='herbShelf'){
    for(const x of [-.47,.47])box(model,wood,x,.49,0,.11,.98,.39);
    for(const y of [.10,.52,.91])box(model,'#ac8a70',0,y,0,.94,.09,.36);
    for(let i=0;i<6;i++){
      const x=(i%3-1)*.28,y=i<3?.65:1.04;
      part(model,'cyl','#ca9682',x,y,0,.085,.19,.086);
      part(model,'fine',i%2?'#b1b188':'#85a893',x,y+.14,0,.113,.13,.085);
    }
  }else if(id==='cloudBed'){
    box(model,wood,0,.21,0,1.15,.32,1.59);
    box(model,'#a0b9c8',0,.42,.10,1.13,.20,1.39);
    box(model,'#e9b4be',0,.55,.39,1.13,.085,.61);
    box(model,'#a88278',0,.52,-.77,1.19,.61,.103);
    part(model,'fine','#f7e7cb',0,.53,-.44,.43,.12,.21,0,0,.08);
  }
  return model;
}

function door(root,closed){
  if(!closed) return;
  box(root,'#98756a',0,1.20,2.06,1.22,2.28,.14);
  part(root,'fine','#e8c28f',.36,1.13,2.15,.054,.055,.05);
  box(root,'#f9dfa8',0,1.64,2.16,.60,.34,.037);
}

function wallRun(root,tint,side,fixed,low,high,openings=[],height=2.48){
  const depth=.24;
  const sideAxis=side==='west'||side==='east';
  const segment=(a,b,y=height/2,h=height)=>{
    if(b<=a) return;
    const middle=(a+b)/2,span=b-a;
    box(root,tint,sideAxis?fixed:middle,y,sideAxis?middle:fixed,sideAxis?depth:span,h,sideAxis?span:depth);
  };
  let edge=low;
  for(const door of [...openings].sort((a,b)=>a-b)){
    segment(edge,door-homesteadDoorHalfWidth);
    if(height>=2) segment(door-homesteadDoorHalfWidth,door+homesteadDoorHalfWidth,2.43,.27);
    edge=door+homesteadDoorHalfWidth;
  }
  segment(edge,high);
}

function roomLayers(group,layer,exclusive=false){
  group.traverse(node=>exclusive?node.layers.set(layer):node.layers.enable(layer));
}

function cutawayPanels(parent,hw,hd,openings,tint,layer){
  const low=new T.Group();
  parent.add(low);
  const panels=sides.map(side=>{
    const main=acrossX(side),fixed=sideFixed[side]*(main?hd:hw),span=main?hw:hd;
    const doors=openings(side);
    wallRun(low,'#dcbf9b',side,fixed,-span-.04,span+.04,doors,.31);
    const backdrop=new T.Group();
    parent.add(backdrop);
    wallRun(backdrop,tint,side,fixed,-span-.04,span+.04,doors,1.44);
    wallRun(backdrop,'#c08f77',side,fixed,-span-.04,span+.04,doors,.42);
    roomLayers(backdrop,layer,true);
    return backdrop;
  });
  roomLayers(low,layer,true);
  return panels;
}

function cottage(group,h,layer){
  const shellRoof=new T.Group(),details=new T.Group();
  group.add(shellRoof,details);
  for(const side of [-1,1]){
    const sideName=side<0?'west':'east';
    wallRun(group,wall,sideName,side*2.87,-2.13,2.14,mainOpenings(h,sideName));
    box(group,wall,side*1.80,1.29,2.0,2.12,2.58,.25);
    box(shellRoof,roof,side*1.5,3.04,0,3.73,.23,4.93,side*-.48);
    for(let seam=-2;seam<=2;seam++)box(shellRoof,'#a37392',side*1.49,3.18,seam*.88,3.59,.035,.032,side*-.48);
    for(const z of [-1.98,1.98])box(group,wood,side*2.75,1.37,z,.18,2.74,.18);
    box(group,trim,side*.77,1.26,2.085,.17,2.5,.25);
    box(group,'#af8470',side*1.85,1.36,2.16,.93,1.04,.16);
    box(group,'#fbd99d',side*1.85,1.36,2.27,.75,.85,.03);
    for(const y of [1.05,1.36,1.66])box(group,wood,side*1.85,y,2.30,.79,.05,.051);
    box(group,wood,side*1.85,1.35,2.30,.047,.94,.041);
    box(group,'#bc8a83',side*1.85,.76,2.29,1.06,.21,.39);
    for(let i=0;i<5;i++){
      const xx=side*1.85+(i-2)*.15;
      part(group,'fine',i%2?'#e9a4b1':'#ecca91',xx,.915,2.40,.096,.087,.085);
    }
  }
  wallRun(group,wall,'north',-2.07,-2.94,2.94,mainOpenings(h,'north'));
  for(let i=0;i<6;i++) for(const z of [-2.05,2.04])
    box(shellRoof,i%2===0?wall:'#edcea8',0,2.59+i*.21,z,5.68-i*.85,.24,.23);
  box(group,trim,0,2.49,2.14,1.66,.30,.29);
  box(shellRoof,'#916c67',1.86,3.64,-1.03,.58,1.85,.68);
  box(shellRoof,'#ad8285',1.86,4.59,-1.03,.73,.18,.82);
  box(details,'#c7a890',0,.033,0,5.74,.103,4.10);
  const hearth='#a18379';
  box(details,hearth,0,.12,-1.62,1.36,.24,.75);
  box(details,'#6e5757',0,.53,-1.89,.93,.65,.11);
  for(const side of [-1,1])box(details,hearth,side*.57,.57,-1.74,.24,.83,.45);
  box(details,'#b98e76',0,1.02,-1.68,1.43,.18,.61);
  for(let i=0;i<3;i++)part(details,'fine',i%2?'#e5a05e':'#e9c77e',(i-1)*.13,.41+i*.036,-1.63,.085,.13,.066,0,0,(i-1)*.29);
  box(details,'#c79787',0,.06,2.45,2.36,.10,.70);
  for(let i=0;i<6;i++)box(details,'#bda18b',(i-2.5)*.81,.087,-.18,.78,.039,3.83);
  roomLayers(details,layer);
  const panels=cutawayPanels(group,2.87,2.07,side=>side==='south'?[0]:mainOpenings(h,side),wall,layer);
  return {canopy:shellRoof,panels};
}

function cropModel(seed,stage){
  const group=new T.Group(),color=crops[seed].color;
  for(let i=0;i<5;i++){
    const x=((i*7)%5-2)*.26,z=(i%2-.5)*.42,high=stage===2?.48:.22;
    branch(group,'#79a070',[x,.03,z],[x,high,z],.019);
    for(const side of [-1,1])
      part(group,'fine','#a4b57c',x+side*.065,high*.68,z,.092,.035,.062,0,.27,side*.36);
    if(stage===2) part(group,'fine',color,x,high+.027,z,.109,.12,.106);
  }
  return group;
}


const roomLooks={
  sunroom:['#d4e7c2','#8ba88b','#9ebfb3'],
  workshop:['#edcfaa','#bd957e','#a97991'],
  loft:['#e9d1de','#a98ba5','#ad7da5'],
  kitchen:['#f2d6b1','#bc8f73','#ba806f'],
  companionNook:['#e8ddae','#83a492','#78a496'],
  wizardTower:['#d9cdea','#907ba5','#7565a7']
};
const roomDecorPositions={
  sunroom:[[-.84,1.04],[.17,-1.01]],workshop:[[-.74,.44],[.76,-1.10]],loft:[[.69,.58],[-.71,-1.15]],
  kitchen:[[.73,.71],[.48,-.95]],companionNook:[[-.87,.42],[.79,.48]],wizardTower:[[-.87,.50],[.81,-.70]]
};
const sides=['north','east','south','west'];
const sideFixed={north:-1,east:1,south:1,west:-1};
const acrossX=side=>side==='north'||side==='south';
const mainOpenings=(h,side)=>Object.entries(homesteadLayout).flatMap(([id,room])=>
  h.extensions?.[id]&&room.join===side?[acrossX(side)?room.x:room.z]:[]);

function roomProps(wing,id,hw,hd){
  const back=-hd+.23,oak='#a27662',rim='#d2a982';
  if(id==='wizardTower'){
    const ring=new T.Group();ring.position.set(0,.18,0);wing.add(ring);
    part(ring,'cyl','#7869a0',0,.05,0,.91,.12,.91);
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6;
      part(ring,'diamond','#e3caff',Math.sin(a)*.74,.15,Math.cos(a)*.74,.055,.049,.052);
    }
    for(const r of [.50,.63]){
      const circle=new T.Mesh(new T.RingGeometry(r,r+.018,32),new T.MeshBasicMaterial({color:'#dbbafa',side:T.DoubleSide}));
      circle.rotation.x=-Math.PI/2;circle.position.y=.118;ring.add(circle);
    }
    part(wing,'cyl','#876d95',0,.37,back,.43,.74,.35);
    part(wing,'diamond','#d1a4ef',0,1.39,back,.26,.45,.25);
    return;
  }
  if(id==='companionNook'){
    for(const x of [-.63,.63]){
      box(wing,oak,x,.21,back,1.11,.25,.54);
      part(wing,'fine',x<0?'#e4b7bb':'#acc8bc',x,.39,back,.44,.13,.25);
      box(wing,rim,x,.44,back-.21,.98,.34,.11);
    }
    part(wing,'cyl','#ba856d',-hw+.25,.10,.13,.16,.12,.17);
    part(wing,'cyl','#add3d3',-hw+.25,.18,.13,.105,.072,.11);
    return;
  }
  if(id==='loft'){
    const shelf=homesteadItem('herbShelf');
    shelf.position.set(-.62,.12,back); wing.add(shelf);
    for(let i=0;i<6;i++){
      const xx=.27+(i%3)*.21,yy=.36+Math.floor(i/3)*.32;
      box(wing,['#bc8599','#819b9d','#dab479'][i%3],xx,yy,back,.17,.25,.19,i%3===2?.15:0);
    }
    box(wing,rim,.49,.49,back,.91,.08,.45);
    box(wing,rim,.49,.19,back,.91,.08,.45);
    return;
  }
  box(wing,oak,0,.38,back,hw*1.52,.64,.40);
  box(wing,rim,0,.74,back,hw*1.58,.14,.54);
  if(id==='kitchen'){
    box(wing,'#92746e',.70,.87,back,.61,.27,.41);
    box(wing,'#664c58',.70,.54,back+.227,.40,.25,.035);
    for(let i=0;i<4;i++)part(wing,'fine','#e7b587',-.74+i*.16,.85,back,.075,.048,.084);
  }else if(id==='sunroom'){
    for(let i=0;i<5;i++){
      const x=(i-2)*.37;
      part(wing,'cyl','#bb9080',x,.90,back,.125,.19,.12);
      branch(wing,'#729a78',[x,.99,back],[x,1.24,back],.024);
      part(wing,'fine',i%2?'#eac9b0':'#a0bf8b',x,1.25,back,.12,.092,.12);
    }
  }else{
    for(let i=0;i<5;i++){
      const x=(i-2)*.32;
      box(wing,['#cea68c','#a7b6b2','#9c839e'][i%3],x,.85,back,.20,.075,.29,.06*i);
    }
  }
}

function drawWing(parent,id,raise,layer){
  const {x,z,halfWidth:hw,halfDepth:hd,door}=homesteadLayout[id];
  const wing=new T.Group();
  const canopy=new T.Group(),details=new T.Group(),decor=new T.Group();
  wing.position.set(x,raise,z);
  parent.add(wing);
  wing.add(canopy,details,decor);
  const [facing,casing,roofTint]=roomLooks[id];
  box(details,casing,0,-.035,0,hw*2,.18,hd*2);
  for(let n=0;n<5;n++)
    box(details,n%2?'#b99476':'#d4af8d',(n-2)*hw*.39,.062,0,hw*.365,.055,hd*1.90);
  for(const side of sides){
    const main=acrossX(side),span=main?hw:hd,fixed=sideFixed[side]*(main?hd:hw);
    wallRun(wing,facing,side,fixed,-span-.10,span+.10,side===door.side?[door.offset]:[]);
  }
  for(const side of [-1,1]){
    if(id!=='wizardTower') box(canopy,roofTint,side*hw*.51,2.70,0,hw*1.20,.145,hd*2+.40,side*-.42);
    for(const opposite of [-1,1]){
      box(wing,casing,side*hw,1.27,opposite*hd,.16,2.57,.17);
      const front=opposite*hd;
      box(wing,casing,side*hw*.70,1.48,front,.49,.77,.29);
      box(wing,id==='wizardTower'?'#d8b6f6':'#f5dca5',side*hw*.70,1.49,front+opposite*.158,.38,.64,.035);
      box(wing,casing,side*hw*.70,1.48,front+opposite*.188,.033,.64,.035);
      box(wing,casing,side*hw*.70,1.48,front+opposite*.188,.41,.045,.035);
    }
  }
  if(id==='wizardTower'){
    part(canopy,'cyl','#a99cca',0,3.59,0,1.41,2.24,1.41);
    part(canopy,'cyl','#bdabc8',0,4.67,0,1.51,.19,1.52);
    part(canopy,'cone',roofTint,0,5.78,0,1.54,2.31,1.55);
    part(canopy,'diamond','#e1baff',0,7.03,0,.24,.39,.24);
    for(const side of [-1,1]){
      box(canopy,'#7763a4',side*.80,3.73,1.26,.28,.73,.11);
      box(canopy,'#dac2f4',side*.80,3.73,1.325,.18,.51,.058);
    }
  }
  roomProps(details,id,hw,hd);
  roomLayers(details,layer);
  const panels=cutawayPanels(wing,hw,hd,side=>side===door.side?[door.offset]:[],facing,layer);
  return {canopy,decor,panels};
}

function drawDormer(parent){
  const g=new T.Group();
  g.position.set(.12,2.78,-.66);parent.add(g);
  box(g,'#e6ccac',0,.94,.37,1.88,1.86,1.12);
  for(const side of [-1,1]){
    box(g,'#a9769b',side*.56,1.9,.37,1.35,.168,1.45,side*-.48);
    box(g,'#805f69',side*.92,.99,.99,.12,1.58,.14);
    box(g,'#e4bd8b',side*.51,.47,1.04,.53,.14,.24);
  }
  box(g,'#705866',0,1.16,1.002,1.26,.89,.09);
  box(g,'#ffdfa3',0,1.16,1.068,1.11,.73,.04);
  box(g,'#8c6a77',0,1.16,1.103,.052,.73,.045);
  box(g,'#8c6a77',0,1.16,1.103,1.11,.05,.045);
}

function doorwayPaths(root,id,height,base){
  if(id!=='companionNook'&&id!=='wizardTower') return;
  const room=homesteadLayout[id],doorZ=room.z+room.halfDepth;
  for(const [start,end] of [[[0,3.13],[-2.76,doorZ+.57]],[[-2.76,doorZ+.57],[room.x,doorZ+.26]]]){
    const length=Math.hypot(end[0]-start[0],end[1]-start[1]);
    const steps=Math.ceil(length/.59);
    for(let i=0;i<steps;i++){
      const t=(i+.48)/steps,x=T.MathUtils.lerp(start[0],end[0],t),z=T.MathUtils.lerp(start[1],end[1],t);
      const y=height(home.x+x,home.z+z)-base;
      part(root,'low',i%2?'#bea380':'#d8ba91',x,y+.047,z,.27,.064,.20,0,i*.43).castShadow=false;
    }
  }
}

function wallsBlock(localX,localZ,cx,cz,hw,hd,openings,front=hw){
  const x=localX-cx,z=localZ-cz;
  return sides.some(side=>{
    const main=acrossX(side),span=(main?hw:hd)+.19;
    const axis=main?x:z,normal=main?z:x;
    const depth=main?hd:hw;
    return Math.abs(normal-sideFixed[side]*depth)<.19 && Math.abs(axis)<span &&
      !openings(side).some(at=>Math.abs(axis-at)<(side==='south'?Math.min(front,homesteadDoorHalfWidth):homesteadDoorHalfWidth));
  });
}

export function makeHomestead(scene,realm,height,state){
  if(realm!=='valley') return null;
  const group=new T.Group(),plotGroup=new T.Group(),interior=new T.Group(),entrance=new T.Group(),architecture=new T.Group();
  const base=height(home.x,home.z);
  const builtRooms=new Map();
  const cameraViews=new Map([
    ['house',{kind:'homestead',id:'house',layer:1,name:home.name,x:home.x,z:home.z,yaw:0,width:5.74,depth:4.14}],
    ...Object.entries(homesteadLayout).map(([id,{x,z,halfWidth,halfDepth}],i)=>[id,{
      kind:'homestead',id,layer:i+2,name:extensions[id].name,x:home.x+x,z:home.z+z,yaw:0,width:halfWidth*2,depth:halfDepth*2
    }])
  ]);
  group.position.set(home.x,base,home.z);
  scene.add(group,plotGroup,interior,entrance);group.add(architecture);
  entrance.position.copy(group.position);
  interior.position.copy(group.position);
  for(const [i,[x,z]] of plots.entries()){
    const patch=new T.Group(); patch.position.set(x,height(x,z),z); plotGroup.add(patch);
    part(patch,'fine','#845c50',0,.055,0,.96,.132,.68);
    for(const xx of [-.92,.92])box(patch,'#c29879',xx,.145,0,.115,.25,1.35);
    for(const zz of [-.64,.64])box(patch,'#c29879',0,.145,zz,1.9,.25,.115);
    for(let r=-1;r<=1;r++)box(patch,'#a47558',r*.37,.163,0,.12,.045,1.06);
    if(i%2===0) part(patch,'fine','#89a78c',-.73,.205,.53,.11,.075,.101);
  }
  for(let i=0;i<14;i++){
    const x=home.x-Math.max(0,i-5)*1.14+Math.sin(i*2.2)*.22,z=home.z+3.1+Math.min(i,5)*.66;
    const stone=part(plotGroup,'fine','#d3b990',x,height(x,z)+.06,z,.55,.11,.30);
    stone.castShadow=false;
  }
  const gardenFence='#b28e71';
  const fenceRuns=[[[17,19],[22,19]],[[22,19],[22,26.5]]];
  for(const [[x,z],[ex,ez]] of fenceRuns){
    const length=Math.hypot(ex-x,ez-z);
    const count=Math.ceil(length/1.35);
    for(let i=0;i<=count;i++){
      const u=i/count,px=x+(ex-x)*u,pz=z+(ez-z)*u,py=height(px,pz);
      box(plotGroup,gardenFence,px,py+.39,pz,.12,.78,.12);
      if(i===0)continue;
      const end=(i-1)/count,qx=x+(ex-x)*end,qz=z+(ez-z)*end,qy=height(qx,qz);
      for(const h of [.27,.55])branch(plotGroup,gardenFence,[px,py+h,pz],[qx,qy+h,qz],.043);
    }
  }
  for(let i=0;i<19;i++){
    const x=16.6+(i%6)*.86,z=i<7?18.5:26.8+(i%2)*.23,y=height(x,z);
    branch(plotGroup,'#7f9f78',[x,y,z],[x+.04,y+.25,z],.025);
    part(plotGroup,'fine',i%2?'#e5aebb':'#efd088',x+.05,y+.29,z,.107,.056,.104);
  }
  const cropGroup=new T.Group(),sign=new T.Group();
  scene.add(cropGroup,sign);
  sign.position.set(home.x+2.02,height(home.x+2.02,home.z+4.5),home.z+4.5);
  box(sign,wood,0,.70,0,.12,1.4,.12);
  box(sign,'#ca9b89',0,1.20,0,.93,.39,.15);
  part(sign,'fine','#f5e3b1',0,1.22,.095,.15,.097,.04);
  let stages='',builtPlan='',last=0;
  function refresh(){
    const h=state.homestead;
    const plan=JSON.stringify([h.owned,...Object.keys(h.extensions??{}).sort()]);
    if(plan!==builtPlan){
      builtPlan=plan;architecture.clear();builtRooms.clear();
      const house=cottage(architecture,h,1);
      builtRooms.set('house',house);
      if(h.extensions?.loft) drawDormer(house.canopy);
      for(const [id,room] of Object.entries(homesteadLayout)){
        if(!h.extensions?.[id]) continue;
        const level=height(home.x+room.x,home.z+room.z);
        builtRooms.set(id,drawWing(architecture,id,level-base,cameraViews.get(id).layer));
        doorwayPaths(architecture,id,height,base);
      }
    }
    interior.clear();entrance.clear();door(entrance,!h.owned);
    for(const [slot,id] of h.decor.entries()){
      if(!Object.hasOwn(furnishings,id)) continue;
      const model=homesteadItem(id);
      const [x,z]=positions[slot];
      model.position.set(x,.13,z);roomLayers(model,1);interior.add(model);
    }
    for(const [id,{decor}] of builtRooms){
      if(!decor) continue;
      decor.clear();
      h.extensions[id].decor.forEach((item,i)=>{
        if(!Object.hasOwn(furnishings,item)) return;
        const [x,z]=roomDecorPositions[id][i],model=homesteadItem(item);
        model.position.set(x,.10,z);model.scale.setScalar(.72);
        roomLayers(model,cameraViews.get(id).layer);decor.add(model);
      });
    }
    stages='';update(true);
  }
  function update(force=false){
    const area=state.transit?null:propertyArea(state.player,realm,state.homestead);
    const yaw=state.player.yaw??0,s=Math.sin(yaw),c=Math.cos(yaw);
    const rear=[c,-s,-c,s];
    for(const [id,{canopy,panels}] of builtRooms){
      canopy.visible=id!==area||!state.homestead.owned;
      for(const [i,panel] of panels.entries()) panel.visible=rear[i]>.24;
    }
    const now=Date.now();
    if(!force&&now-last<380) return;
    last=now;
    const plants=state.homestead.plots.map(p=>p?[p.seed,p.readyAt<=now?2:1]:null);
    const signature=JSON.stringify(plants);
    if(signature===stages) return;
    stages=signature;
    cropGroup.clear();
    plants.forEach((plant,i)=>{
      if(!plant) return;
      const [x,z]=plots[i],model=cropModel(...plant);
      model.position.set(x,height(x,z)+.15,z);cropGroup.add(model);
    });
  }
  refresh();
  return {refresh,update,cameraRoom(x,z){
    if(!state.homestead.owned) return null;
    const room=cameraViews.get(propertyArea({x,z},realm,state.homestead));
    if(room) return room;
    const dx=x-home.x,dz=z-home.z;
    for(const [id,{join,x:atX,z:atZ}] of Object.entries(homesteadLayout)){
      if(!join||!state.homestead.extensions?.[id]) continue;
      const north=join==='north';
      const axis=north?dx:dz,along=north?-dz:join==='west'?-dx:dx;
      const center=north?atX:atZ,threshold=north?2.08:2.88;
      if(Math.abs(axis-center)<homesteadDoorHalfWidth&&Math.abs(along-threshold)<.31)
        return cameraViews.get(along<threshold?'house':id);
    }
    return null;
  },inside(x,z){
    const area=propertyArea({x,z},realm,state.homestead);
    return state.homestead.owned&&Boolean(area)&&area!=='garden';
  },blocks(x,z){
    const h=state.homestead,localX=x-home.x,localZ=z-home.z;
    if(Math.abs(localX)>7||localZ<-6||localZ>10) return false;
    if(!h.owned) return Math.abs(localX)<3.06&&Math.abs(localZ)<2.30;
    if(wallsBlock(localX,localZ,0,0,2.87,2.07,side=>side==='south'?[0]:mainOpenings(h,side),.57)) return true;
    return Object.entries(homesteadLayout).some(([id,room])=>h.extensions?.[id]&&
      wallsBlock(localX,localZ,room.x,room.z,room.halfWidth,room.halfDepth,side=>side===room.door.side?[room.door.offset]:[]));
  }};
}
