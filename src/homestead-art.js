import * as T from 'three';
import {part,branch} from './models.js';
import {home,plots,crops,cropFood,furnishings} from './homestead.js';

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

function cottage(group){
  for(const side of [-1,1]){
    box(group,wall,side*2.87,1.28,0,.21,2.56,4.28);
    box(group,wall,side*1.80,1.29,2.0,2.12,2.58,.25);
    box(group,roof,side*1.5,3.04,0,3.73,.23,4.93,side*-.48);
    for(let seam=-2;seam<=2;seam++)box(group,'#a37392',side*1.49,3.18,seam*.88,3.59,.035,.032,side*-.48);
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
  box(group,wall,0,1.27,-2.07,5.87,2.54,.22);
  for(let i=0;i<6;i++) for(const z of [-2.05,2.04])
    box(group,i%2===0?wall:'#edcea8',0,2.59+i*.21,z,5.68-i*.85,.24,.23);
  box(group,trim,0,2.49,2.14,1.66,.30,.29);
  box(group,'#916c67',1.86,3.64,-1.03,.58,1.85,.68);
  box(group,'#ad8285',1.86,4.59,-1.03,.73,.18,.82);
  box(group,'#c7a890',0,.033,0,5.74,.103,4.10);
  const hearth='#a18379';
  box(group,hearth,0,.12,-1.62,1.36,.24,.75);
  box(group,'#6e5757',0,.53,-1.89,.93,.65,.11);
  for(const side of [-1,1])box(group,hearth,side*.57,.57,-1.74,.24,.83,.45);
  box(group,'#b98e76',0,1.02,-1.68,1.43,.18,.61);
  for(let i=0;i<3;i++)part(group,'fine',i%2?'#e5a05e':'#e9c77e',(i-1)*.13,.41+i*.036,-1.63,.085,.13,.066,0,0,(i-1)*.29);
  box(group,'#c79787',0,.06,2.45,2.36,.10,.70);
  for(let i=0;i<6;i++)box(group,'#bda18b',(i-2.5)*.81,.087,-.18,.78,.039,3.83);
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


const wings={sunroom:{x:-4.18,z:-.21,hw:1.48,hd:1.78},workshop:{x:1.05,z:-3.53,hw:1.76,hd:1.51}};

function drawWing(parent,room){
  const {x,z,hw,hd}=wings[room];
  const wing=new T.Group();
  wing.position.set(x,0,z);
  parent.add(wing);
  const glass=room==='sunroom';
  const casing=glass?'#8ba88b':'#bd957e';
  const roofTint=glass?'#9ebfb3':'#a97991';
  box(wing,casing,0,.20,0,hw*2,.39,hd*2);
  for(const side of [-1,1]){
    box(wing,glass?'#b0d4bd':'#edcf9f',side*hw,1.26,0,.11,2.19,hd*2);
    box(wing,glass?'#d1e0b7':'#e5c8a4',0,1.31,side*hd,hw*2,2.18,.11);
    box(wing,roofTint,side*hw*.50,2.63,0,hw*1.19,.135,hd*2+.36,side*-.43);
    for(const step of [-1,0,1]){
      const yy=.20+2.28;
      box(wing,casing,side*hw,1.35,step*hd*.84,.15,2.34,.14);
      box(wing,casing,hw*step*.84,1.35,side*hd,.14,2.34,.15);
      box(wing,casing,side*hw*.49,yy+Math.abs(.37*step),step*hd*.72,hw*1.21,.045,.056,side*-.43);
    }
    box(wing,casing,0,1.53,side*(hd+.038),hw*2,.09,.081);
  }
  for(let i=0;i<4;i++){
    const xx=(i-1.5)*.62;
    box(wing,glass?'#dde4ac':'#b58978',xx,1.53,hd+.065,.43,.68,.048);
    if(glass) part(wing,'fine',i%2?'#ba9f83':'#7ba886',xx,1.36,hd+.10,.16,.22,.08);
  }
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
export function makeHomestead(scene,realm,height,state){
  if(realm!=='valley') return null;
  const group=new T.Group(),plotGroup=new T.Group(),interior=new T.Group(),entrance=new T.Group(),additions=new T.Group();
  const base=height(home.x,home.z);
  group.position.set(home.x,base,home.z);
  scene.add(group,plotGroup,interior,entrance);group.add(additions);
  entrance.position.copy(group.position);
  interior.position.copy(group.position);
  cottage(group);
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
    const plan=JSON.stringify(Object.keys(h.extensions??{}).sort());
    if(plan!==builtPlan){
      builtPlan=plan;additions.clear();
      for(const id of Object.keys(wings)) if(h.extensions?.[id]) drawWing(additions,id);
      if(h.extensions?.loft) drawDormer(additions);
    }
    interior.clear();entrance.clear();door(entrance,!h.owned);
    for(const [slot,id] of h.decor.entries()){
      if(!Object.hasOwn(furnishings,id)) continue;
      const model=homesteadItem(id);
      const [x,z]=positions[slot];
      model.position.set(x,.13,z);interior.add(model);
    }
    stages='';update(true);
  }
  function update(force=false){
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
  return {refresh,update,inside(x,z){
    return state.homestead.owned&&Math.abs(x-home.x)<2.72&&Math.abs(z-home.z)<1.89;
  },blocks(x,z){
    const localX=x-home.x,dz=z-home.z;
    if(Object.entries(wings).some(([id,wing])=>state.homestead.extensions?.[id]&&
      Math.abs(localX-wing.x)<wing.hw+.15&&Math.abs(dz-wing.z)<wing.hd+.15)) return true;
    const dx=Math.abs(localX);
    return dx<3.05&&dz> -2.34&&dz<2.31&&(!state.homestead.owned||
      dx>2.66||dz< -1.88||(dz>1.80&&dx>.57));
  }};
}
