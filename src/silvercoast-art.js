import * as T from 'three';
import {branch,part} from './models.js';
import {celMaterial} from './cel.js';
import {house} from './silverrun-art.js';
import {coastRiverX,coastRiverY,piers,saltBridge,seaHeight} from './silvercoast.js';
import {gangplank,hullBreadth,marigold,stairs} from './marigold.js';

const cream='#f4dfbf', stone='#c5abad', coral='#c98587', wood='#a97960', iron='#786275', gold='#eac17b';
const glow=celMaterial('#ffe1a0',{emissive:'#ffba65',emissiveIntensity:.65});

function deck(group,x,z,y,length,width,stoneDeck=false,withGangplank=false){
  const steps=Math.ceil(length/.44),plank=length/steps;
  const colors=stoneDeck?['#c9b5a8','#dfc7a8']:['#b08366','#c69772'];
  for(let i=0;i<steps;i++) part(group,'cube',colors[i%2],x,y-.063,z+(i+.5)*plank,width,.16,plank-.025);
  for(const side of [-1,1]){
    const edge=x+side*(width/2-.12);
    for(let i=0;i<=length;i+=2.12) part(group,'cube',wood,edge,y-.54,z+i,.21,2.2,.22);
    const rails=withGangplank&&side===1
      ?[[z,gangplank.z-gangplank.halfWidth],[gangplank.z+gangplank.halfWidth,z+length]]
      :[[z,z+length]];
    for(const [from,to] of rails) part(group,'cube',cream,edge,y+.41,(from+to)/2,.10,.12,to-from);
  }
}

function harbour(group,blockers,height){
  const houses=[
    [-34,7,Math.PI,'#858eae','#f2c8aa',4.5,2],[-29,3,Math.PI,'#7ca9a1',cream,4.3,2],
    [-34,16,Math.PI,'#a985ad','#efc4b8',4.7,1],[-22,12,Math.PI*.5,'#b57783',cream,3.7,1],
    [-31,10,Math.PI*.5,'#c59187','#f4d3aa',3.5,1],[-39,12,Math.PI,'#829ba9',cream,4.25,2],
    [-46,12,Math.PI,'#b9838c','#eed6a5',4.4,1]
  ];
  for(const row of houses) house(group,blockers,height,...row);
  const x=-48,z=23,y=height(x,z);
  part(group,'cyl',stone,x,y+.21,z,2.05,.62,2.05);
  for(let i=0;i<7;i++){
    const size=1.61-i*.073;
    part(group,'cyl',i%2?coral:cream,x,y+.38+i*.86,z,size,.90,size);
  }
  part(group,'cyl',stone,x,y+6.04,z,1.33,.28,1.33);
  part(group,'cyl',glow,x,y+6.55,z,.69,1.05,.69);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    part(group,'cyl',iron,x+Math.cos(a)*.83,y+6.62,z+Math.sin(a)*.83,.072,1.18,.072);
  }
  part(group,'cone','#876e95',x,y+7.57,z,1.14,1.18,1.14);
  part(group,'sphere',gold,x,y+8.18,z,.17,.19,.17);
  part(group,'cube',wood,x,y+.98,z-1.58,.73,1.7,.16);
  blockers.push([x,z,2.02]);
  for(const [x,z] of [[-23.3,20.5],[-30.1,23],[-34.8,23.5]]) {
    const y=height(x,z);
    part(group,'cube',wood,x,y+.39,z,.99,.78,.79);
    part(group,'cube','#d19d78',x,y+.80,z,1.09,.11,.87);
    for(let i=0;i<3;i++) part(group,'soft',i%2?'#abbfc5':'#d0a5ac',x+(i-1)*.25,y+.91,z,.12,.11,.33,0,i*.45,0);
    blockers.push([x,z,.57,.46]);
  }
  for(const [x,z,yaw,color] of [[-29.1,31.5,.18,'#718c9e'],[-36.2,31.6,-.23,'#a97b81']]){
    const boat=hull(group,x,1.06,z,4.1,.71,.50,color);
    boat.rotation.y=yaw;
    branch(group,wood,[x,1.02,z],[x,3.03,z],.057);
    part(group,'cube',cream,x+.28,2.63,z,.57,.43,.055,0,.2,-.17);
  }
}

function hull(group,x,y,z,length,width,height,paint,withDeck=true){
  const rows=24,rings=4,points=[],faces=[];
  for(let i=0;i<=rows;i++){
    const t=i/rows;
    const breadth=hullBreadth(t,width);
    for(const side of [-1,1]) for(let r=0;r<rings;r++){
      const k=r/(rings-1);
      points.push(side*breadth*(.26+.74*k**.6),-height+k*height*(.87+.19*Math.abs(t-.55)*2),(t-.5)*length);
    }
    if(!i) continue;
    for(let n=0;n<rings*2-1;n++){
      if(n===rings-1) continue;
      const a=(i-1)*rings*2+n,b=i*rings*2+n;
      faces.push(a,b,a+1,a+1,b,b+1);
    }
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(points,3));geo.setIndex(faces);geo.computeVertexNormals();
  const vessel=new T.Group();vessel.position.set(x,y,z);group.add(vessel);
  const body=new T.Mesh(geo,celMaterial(paint,{side:T.DoubleSide}));
  body.castShadow=true;vessel.add(body);
  for(let i=1;withDeck&&i<rows;i++){
    const t=i/rows,b=hullBreadth(t,width);
    part(vessel,'cube',wood,0,-.19,(t-.5)*length,b*1.88,.19,length/rows+.03);
    for(const side of [-1,1])part(vessel,'cube',i%2?wood:gold,side*b,-.08,(t-.5)*length,
      .13,.20,length/rows+.07);
  }
  return vessel;
}

function buildMarigold(group,scene){
  const {x,z,deck:level,hold,length,width}=marigold;
  hull(group,x,level,z,length,width,3.36,'#794e61',false);
  const ship=new T.Group();
  ship.position.set(x,level,z);group.add(ship);
  for(let i=0;i<40;i++){
    const t=(i+.5)/40,pz=(t-.5)*length;
    const b=hullBreadth(t,width), open=pz+z>=stairs.top-.12&&pz+z<=stairs.bottom+.12;
    const paint=i%3?'#ba8e6c':'#cea17b';
    if(open){
      for(const side of [-1,1]){
        const edge=stairs.halfWidth+.075;
        part(ship,'cube',paint,side*(edge+b)*.5,-.07,pz,b-edge,.14,.407);
        part(ship,'cube','#92685c',side*(edge+.05),.10,pz,.10,.25,.407);
      }
    }else part(ship,'cube',paint,0,-.07,pz,b*2,.14,.407);
    for(const side of [-1,1]){
      if(side===-1&&Math.abs(z+pz-gangplank.z)<gangplank.halfWidth+.20) continue;
      part(ship,'cube',iron,side*b,.22,pz,.14,.49,.405);
      part(ship,'cube',gold,side*b,.50,pz,.18,.13,.407);
    }
  }
  for(let n=0;n<12;n++){
    const f=(n+.5)/12,pz=stairs.top+(stairs.bottom-stairs.top)*f;
    const py=level+(hold-level)*f;
    part(group,'cube',n%2?'#ad795b':'#c2916d',x,py-.055,pz,stairs.halfWidth*2,.12,.396);
  }
  part(group,'cube','#bd8a63',x,hold-.085,44.825,3.57,.17,8.72);
  for(const side of [-1,1]){
    for(let i=0;i<5;i++){
      const pz=41+i*1.85;
      part(group,'cube','#815a56',x+side*1.78,hold+.94,pz,.18,1.83,.18);
      part(group,'cube','#a87965',x+side*1.82,hold+.47,pz,.10,.87,1.87);
      part(group,'cube','#ae816a',x+side*1.84,hold+1.38,pz,.11,.87,1.88);
      part(group,'cube','#ac7f6c',x+side*1.83,hold+2.09,pz,.12,.56,1.89);
      if(i===0||i===4) part(group,'sphere',glow,x+side*1.63,hold+1.62,pz,.115,.16,.12);
    }
    part(group,'cube','#956954',x+side*1.41,hold+.25,48.14,.53,.5,.66);
    part(group,'cyl','#bc926a',x+side*1.37,hold+.35,41.55,.32,.70,.32);
    part(group,'cyl',iron,x+side*1.37,hold+.53,41.55,.33,.09,.33);
    part(group,'cyl',iron,x+side*1.37,hold+.15,41.55,.33,.09,.33);
  }
  for(const pz of [40.48,49.23]){
    part(group,'cube','#80545a',x,hold+1.16,pz,3.58,2.32,.17);
    part(group,'cube',wood,x,hold+2.12,pz,3.59,.20,.22);
  }
  part(group,'cube','#876d81',x,hold+.18,48.61,.86,.36,.51);
  part(group,'cube',gold,x,hold+.40,48.61,.89,.10,.51);
  for(const pz of [41.3,47.95]){
    const lamp=new T.PointLight('#ffcb86',6,4.3,2);
    lamp.position.set(x,hold+1.6,pz);scene.add(lamp);
  }

  const jetty=piers.at(-1).y;
  const span=gangplank.to-gangplank.from, rise=level-jetty, slope=Math.atan2(rise,span);
  const plankLength=Math.hypot(span,rise);
  const ramp=new T.Group();
  ramp.position.set((gangplank.from+gangplank.to)/2,(jetty+level)/2,gangplank.z);
  ramp.rotation.z=slope;group.add(ramp);
  for(let i=0;i<11;i++) part(ramp,'cube',i%2?wood:'#c89871',(i-5)*plankLength/11,-.07,0,
    plankLength/11+.01,.14,gangplank.halfWidth*2);
  for(const side of [-1,1]){
    const edge=side*(gangplank.halfWidth-.06);
    for(const dx of [-1.55,-.52,.52,1.55]) part(ramp,'cyl',wood,dx,.27,edge,.065,.66,.065);
    part(ramp,'cube',cream,0,.57,edge,plankLength,.079,.079);
  }

  for(const side of [-1,1]){
    part(ship,'cyl',wood,side*1.04,.36,4.93,.31,.72,.31);
    part(ship,'cyl',iron,side*1.04,.6,4.93,.33,.09,.33);
  }
  part(ship,'cyl',wood,0,.5,5.72,.17,1,.17);
  const wheel=new T.Mesh(new T.TorusGeometry(.46,.067,6,22),celMaterial(gold));
  wheel.position.set(0,1.06,5.72);ship.add(wheel);
  for(let i=0;i<4;i++) part(ship,'cube',wood,0,1.06,5.72,.07,1.02,.07,0,0,i*Math.PI/4);
  branch(ship,gold,[0,.15,-7.1],[0,1.24,-9.2],.13);
  part(ship,'diamond',gold,0,.96,-8.13,.37,.59,.39);
  for(const [z,h,s] of [[-3.4,6.6,.83],[.6,9.5,1],[4.9,6.3,.68]]){
    const offset=z===.6?-1.23:0;
    branch(ship,wood,[offset,0,z],[offset,h,z],.13);
    branch(ship,wood,[-3.1*s,h-1.0,z],[3.1*s,h-1.0,z],.085);
    const geo=new T.PlaneGeometry(5.75*s,3.72*s,14,10);
    const p=geo.getAttribute('position');
    for(let i=0;i<p.count;i++){
      const u=(i%15)/14,v=Math.floor(i/15)/10;
      p.setZ(i,Math.sin(u*Math.PI)*Math.sin(v*Math.PI*.76)*.64*s);
      p.setX(i,p.getX(i)*(.94+.1*v));
    }
    geo.computeVertexNormals();
    const sail=new T.Mesh(geo,celMaterial(z===.6?'#765173':'#be7d8c',{side:T.DoubleSide}));
    sail.position.set(0,h-1.0-1.86*s,z-.04);sail.castShadow=true;ship.add(sail);
    for(const side of [-1,1]) branch(ship,iron,[side*2.42,.16,z+.88],[0,h-.52,z],.026);
    part(ship,'cube',coral,.33,h-.11,z,.70,.28,.055,0,0,-.23);
    if(z===.6) part(ship,'diamond',gold,0,h-2.84*s,z+.49,.60,.70,.12);
  }
}

function corsair(group,blockers,height){
  house(group,blockers,height,24,15,Math.PI*.5,'#a27b9c',cream,5.1);
  house(group,blockers,height,39,9,-Math.PI*.5,'#748eaa','#efceae',4.7,2);
  house(group,blockers,height,24,5,Math.PI,'#b38286','#e6c5a9',4.4);
  for(const [x,z,yaw] of [[20.6,23,.61],[41.6,22,-.76]]){
    const boat=hull(group,x,height(x,z)+.46,z,4.1,.76,.46,'#a26c69');boat.rotation.y=yaw;
    blockers.push([x,z,1.24,1.73]);
  }
  for(const [x,z] of [[17.5,25],[43.5,26],[46,28],[12,34],[-41,32],[-52,30]]){
    const y=height(x,z);
    part(group,'low','#a3a3a1',x,y+1.28,z,2.8,3.9,2.6,.08,x*.1,.12);
    part(group,'low','#cbb9a9',x+1.52,y+.39,z+.42,1.39,1.7,1.33);
    blockers.push([x,z,2.12]);
  }
  const x=46,z=34;
  for(let i=0;i<=10;i++){
    const a=i/10*Math.PI;
    part(group,'low',i%3?'#aaa8a2':'#c0b6a8',x+Math.cos(a)*3.7,1+Math.sin(a)*5.1,z,
      1.53,1.52,1.67,0,.2,a*.55);
  }
}

export function populateSilvercoast(group,scene,height,blockers,waterMaterial){
  const ocean=new T.Mesh(new T.PlaneGeometry(118,118),waterMaterial);
  ocean.rotation.x=-Math.PI*.5;ocean.position.y=seaHeight;scene.add(ocean);
  const points=[],indices=[];
  for(let i=0;i<=88;i++){
    const z=i-59,x=coastRiverX(z),y=coastRiverY(z);
    points.push(x-4.05,y,z,x+4.05,y,z);
    if(i) indices.push(i*2-2,i*2,i*2-1,i*2-1,i*2,i*2+1);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(points,3));geometry.setIndex(indices);
  scene.add(new T.Mesh(geometry,waterMaterial));
  for(const p of piers) deck(group,p.x,p.from,p.y,p.to-p.from,p.width,false,p===piers.at(-1));
  const x=coastRiverX(saltBridge),y=height(x,saltBridge);
  const bridge=new T.Group();
  bridge.position.set(x,0,saltBridge);bridge.rotation.y=Math.PI/2;group.add(bridge);
  deck(bridge,0,-4.35,y,8.7,3.35,true);
  harbour(group,blockers,height);
  corsair(group,blockers,height);
  buildMarigold(group,scene);
}
