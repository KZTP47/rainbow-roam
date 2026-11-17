import {skyCounterPoint,skyIslands,skyRim} from './sky-islands.js';
import {geography} from './overworld.js';
import {atlas,realmRegions} from './horizons.js';
import {lake,paths,seeded} from './map-data.js';
import {regions,villagers} from './content.js';
import {castleLandmarks} from './castle.js';
import {townProfiles,townServicesForPlace,townWater,townsByPlace,townPavement} from './town-data.js';
import {riverCenter,riverWidth,silverrunLandmarks,silverrunPaths,silverrunWalls} from './silverrun.js';
import {coastLandmarks,coastPaths,coastRiverX,piers,shoreZ} from './silvercoast.js';
import {gangplank} from './marigold.js';

export const campusLandmarks=[
  ['Great Hall',0,-18,'hall'],['Clock Tower',-12,21,'hall'],['Covered Bridge',-42,11,'bridge'],
  ['Library',-25,-16,'hall'],['Potions classroom',27,-17,'hall'],['Herbology greenhouses',25,24,'tree'],
  ['Owlery',34,-35,'hall'],['Black Lake',-39,0,'water'],['Hagrid’s hut',-23,8,'tree'],
  ['Flying lawn',38,5,'wind']
];

const feature={
  valley:['orchard','brook'],woods:['ancient trees','fern glade'],frost:['glacier','hot spring'],
  mesa:['red arches','suncup beds'],coast:['tide pools','cliff path'],delta:['lily beds','reeds'],
  sky:['Wind ferry landings','Island rim trails'],hogwarts:['Cloisters','Grounds'],
  heath:['Heather moors','Slate watchpaths'],cinder:['Charcoal terraces','Ash gardens'],
  reef:['Tide paths','Coral ledges'],verdigris:['Copper hills','High meadows'],
  orchards:['Apple groves','Cider lanes'],
  silverrun:['Griffin Fountain','Old Bridge','Arcanum Spire','Watermill','Windmill downs'],
  silvercoast:['Saltwick Quay','Saltwick Light','The Long Jetty','The Black Marigold']
};
const allCampusLandmarks=[...campusLandmarks,...castleLandmarks];
const colorways={
  valley:['#69a77b','#f1cd77','#528e72','#49b3c1'],
  woods:['#5b8a67','#c5cb84','#336b60','#58abb5'],
  frost:['#a6cce4','#eaf2ed','#688bbe','#72b9d7'],
  mesa:['#d3935c','#f3cc75','#b56766','#59b2b9'],
  coast:['#7ab991','#eddf9d','#4b9080','#44b3bc'],
  delta:['#65af92','#d3d485','#397f75','#6bbbc5'],
  sky:['#a7a9d7','#ded7ee','#8f79bf','#9bd8e1'],
  hogwarts:['#81a589','#d6cc97','#4f826f','#509db3'],
  heath:['#a99ac5','#ded3a6','#78659e','#64b3c9'],
  cinder:['#d77c66','#efb679','#b64e58','#59aab8'],
  reef:['#82c9ba','#efc282','#478f93','#49b8ca'],
  verdigris:['#63ab91','#d6c981','#488978','#4eb4b2'],
  orchards:['#a8be76','#e3c079','#718d62','#63b5be']
};
const paletteFor=id=>colorways[id]??[geography[id].tone,'#d8c990','#749585','#6db8bd'];
const lands=Object.entries(geography).filter(([id])=>id!=='sky');
const chartBounds={
  left:Math.min(...lands.map(([,r])=>r.x-r.rx))-33,
  right:Math.max(...lands.map(([,r])=>r.x+r.rx))+33,
  top:Math.min(...lands.map(([,r])=>r.z-r.rz))-43,
  bottom:Math.max(...lands.map(([,r])=>r.z+r.rz))+33
};
export const chartLocation=(x,z)=>[9+(x-chartBounds.left)/(chartBounds.right-chartBounds.left)*82,
  7+(z-chartBounds.top)/(chartBounds.bottom-chartBounds.top)*88];
export const chartPins={
  ...Object.fromEntries(lands.map(([id,r])=>[id,chartLocation(r.x,r.z)])),sky:[80,14]
};
export const localPlaces=(realm)=>realm==='valley'
  ?Object.entries(regions).filter(([,r])=>!r.realm):realmRegions(realm);

export function localFrame(realm,id){
  const place=regions[id];
  if(realm==='silverrun'&&id==='spirehaven') return {x:6,z:8,rx:34,rz:29};
  if(realm==='silvercoast'&&id) return id==='saltwick'?{x:-30,z:13,rx:29,rz:29}:{x:30,z:21,rx:26,rz:32};
  if(place) return {x:place.x,z:place.z,rx:realm==='sky'?21.5:realm==='hogwarts'?52:townsByPlace[id]?24:21,
    rz:realm==='sky'?20:realm==='hogwarts'?53:townsByPlace[id]?22:18};
  if(realm==='sky'){
    const places=realmRegions(realm).map(([,p])=>p);
    const xs=places.map(p=>p.x),zs=places.map(p=>p.z);
    const left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...zs),bottom=Math.max(...zs);
    return {x:(left+right)/2,z:(top+bottom)/2,rx:(right-left)/2+skyRim+9,rz:(bottom-top)/2+skyRim+9};
  }
  const r=geography[realm];
  return {x:0,z:0,rx:r.rx+4,rz:r.rz+4};
}

function locator(canvas,frame){
  return (x,z)=>[
    canvas.width*(.5+(x-frame.x)/(2*frame.rx)),
    canvas.height*(.5+(z-frame.z)/(2*frame.rz))
  ];
}

export function routeLines(realm){
  if(realm==='silverrun') return silverrunPaths;
  if(realm==='silvercoast') return coastPaths;
  if(realm==='valley') return [...paths,[[0,-8],[-29,-12],[-61,-4],[-96,0]],
    [[0,-8],[14,-34],[9,-51],[0,-96]],[[25,5],[54,7],[74,2],[96,0]],
    [[-7,38],[4,60],[0,96]]];
  if(realm==='hogwarts'){
    return [[[0,46],[0,25],[0,7],[0,-16]],[[-49,11],[-32,11],[-24,17],[-13,26],[0,19],[23,25],[33,21]],
      [[-25,-16],[-13,-6],[0,4],[15,-7],[28,-17]],[[34,-35],[28,-17],[39,5],[28,26]],
      [[-35,39],[-23,39],[-5,38],[0,33],[17,33],[30,37],[48,38]],
      [[-44,-33],[-35,-23],[-34,-13],[-28,-7],[-20,6]],
      [[2,-50],[22,-45],[41,-37],[42,-24],[39,-7],[39,7],[34,15],[29,21]]];
  }
  const local=realmRegions(realm).map(([,r])=>[r.x,r.z]);
  if(townProfiles[realm]){
    const [x,z]=local[0];
    const [a,b]=local[1];
    const origin=geography[realm];
    const exits=lands.filter(([id,r])=>id!==realm&&neighbors(origin,r)).map(([,r])=>{
      const dx=r.x-origin.x,dz=r.z-origin.z;
      return [[x,z],[dx*.22,dz*.26],
        [dx===0?0:Math.sign(dx)*origin.rx,dz===0?0:Math.sign(dz)*origin.rz]];
    });
    return [[[x,z],[x*.64+a*.36-1.6,z*.41+b*.59],[a,b]],...exits];
  }
  return local.map((p,i)=>{
    const q=local[(i+1)%local.length],mx=(p[0]+q[0])/2,mz=(p[1]+q[1])/2;
    return [p,[mx+(i%2?2.8:0),mz+(i%2?0:3.8)],q];
  });
}

function smoothPath(c,points,point){
  c.beginPath();
  for(const [i,xy] of points.entries()){
    const [x,z]=point(...xy);
    if(i)c.lineTo(x,z);else c.moveTo(x,z);
  }
}
function coastline(c,point,bounds,realm,places,survey=false){
  const p=realm==='sky'?places.map(a=>[a.x,a.z,a.rx??18.9,a.rz??18.1])
    :[[bounds.x??0,bounds.z??0,bounds.rx,bounds.rz]];
  c.beginPath();
  for(const [x,z,rx,rz] of p){
    for(let i=0;i<=72;i++){
      const a=i/72*Math.PI*2;
      const exponent=realm==='sky'?1:survey?.69:.59;
      const coast=1+(survey?.050:.033)*Math.sin(a*7+x*.35)+.018*Math.cos(a*13+z);
      const mx=Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**exponent;
      const mz=Math.sign(Math.sin(a))*Math.abs(Math.sin(a))**exponent;
      const [u,v]=point(x+mx*rx*coast,z+mz*rz*coast);
      if(i)c.lineTo(u,v);else c.moveTo(u,v);
    }
    c.closePath();
  }
}

function mark(c,x,y,s,type){
  c.beginPath();
  if(type==='tree'){
    c.moveTo(x,y-s*1.2);c.quadraticCurveTo(x+s*1.2,y+s*.28,x+s*.53,y+s*.44);
    c.lineTo(x+s*.12,y+s*.45);c.lineTo(x+s*.12,y+s*.83);c.lineTo(x-s*.12,y+s*.83);
    c.lineTo(x-s*.12,y+s*.43);c.lineTo(x-s*.63,y+s*.44);c.quadraticCurveTo(x-s*.8,y+.23*s,x,y-s*1.2);
  }else if(type==='hall'){
    c.moveTo(x-s,y+s*.63);c.lineTo(x-s,y-s*.4);c.lineTo(x-s*.69,y-s*.91);
    c.lineTo(x-s*.32,y-s*.4);c.lineTo(x+s*.31,y-s*.4);c.lineTo(x+s*.67,y-s*.91);
    c.lineTo(x+s,y-s*.4);c.lineTo(x+s,y+s*.63);c.closePath();
  }else if(type==='mountain'){
    c.moveTo(x-s,y+s*.57);c.lineTo(x-.32*s,y-s*.73);c.lineTo(x+.06*s,y-.15*s);
    c.lineTo(x+.44*s,y-s*.48);c.lineTo(x+s,y+s*.58);c.closePath();
  }else if(type==='water'||type==='bridge'){
    c.moveTo(x-s,y+s*.18);c.quadraticCurveTo(x-s*.16,y-s*.81,x+s,y+s*.18);
    c.moveTo(x-s,y+s*.6);c.quadraticCurveTo(x-s*.16,y-s*.4,x+s,y+s*.6);
    c.stroke();return;
  }else{
    c.moveTo(x,y-s);c.lineTo(x+s*.64,y);c.lineTo(x,y+s);c.lineTo(x-s*.64,y);c.closePath();
  }
  c.fill();c.stroke();
}

function compassRose(c,x,y,r){
  c.save();c.translate(x,y);
  c.strokeStyle='#557f81';c.fillStyle='#fff1c6';c.lineWidth=Math.max(1,r*.1);
  c.beginPath();c.arc(0,0,r*.84,0,Math.PI*2);c.fill();c.stroke();
  for(let i=0;i<4;i++){
    c.rotate(Math.PI*.5);
    c.beginPath();c.moveTo(0,-r*1.22);c.lineTo(r*.28,0);c.lineTo(0,r*.1);c.closePath();
    c.fillStyle=i%2?'#bf7e78':'#477781';c.fill();
  }
  c.fillStyle='#385a63';c.font='800 '+Math.round(r*.82)+'px Nunito, sans-serif';
  c.textAlign='center';c.fillText('N',0,-r*1.45);
  c.restore();
}

function neighbors(a,b){
  const dx=Math.abs(a.x-b.x),dz=Math.abs(a.z-b.z);
  return (Math.abs(dx-a.rx-b.rx)<3&&dz<a.rz+b.rz-8)||
    (Math.abs(dz-a.rz-b.rz)<3&&dx<a.rx+b.rx-8);
}

export function paintWorldChart(canvas){
  const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const point=(x,z)=>chartLocation(x,z).map((n,i)=>n*(i?h:w)*.01);
  const skyPoint=([x,y])=>[w*x*.01,h*y*.01];
  const ratio=w/800;
  const rand=seeded(9136);
  const sea=c.createLinearGradient(0,0,w,h);
  sea.addColorStop(0,'#91d5db');sea.addColorStop(.59,'#c0e9da');sea.addColorStop(1,'#58b7c9');
  c.fillStyle=sea;c.fillRect(0,0,w,h);
  c.lineWidth=.9*ratio;
  for(let i=0;i<260;i++){
    const x=rand()*w,y=rand()*h,s=2+rand()*7;
    c.strokeStyle=i%3===0?'#377b905d':'#f1f9df6b';
    c.beginPath();c.moveTo(x-s,y);c.quadraticCurveTo(x,y-2*ratio,x+s,y);c.stroke();
  }

  for(const [id,r] of lands){
    const [grass,sunlit,shadow]=paletteFor(id);
    const [x,y]=point(r.x,r.z);
    const land=c.createRadialGradient(x,y,0,x,y,Math.max(w,h)*.18);
    land.addColorStop(0,sunlit);land.addColorStop(.55,grass);land.addColorStop(1,shadow);
    c.save();
    coastline(c,point,{...r,rx:r.rx*.985,rz:r.rz*.981},id,[],true);
    c.fillStyle=land;c.fill();c.strokeStyle='#f6e6ac';c.lineWidth=4.5*ratio;c.stroke();c.clip();
    for(let k=0;k<24;k++){
      const x=r.x+(rand()-.5)*r.rx*1.87,z=r.z+(rand()-.5)*r.rz*1.66;
      if(Math.hypot(x-r.x,z-r.z)<17) continue;
      const [u,v]=point(x,z);
      c.fillStyle=shadow;c.strokeStyle='#f5e6b6bc';c.lineWidth=.75*ratio;
      mark(c,u,v,(3+rand()*4)*ratio,k%4===0||['frost','mesa','cinder'].includes(id)?'mountain':'tree');
    }
    c.restore();
  }

  for(const [index,[,a]] of lands.entries()){
    for(const [,b] of lands.slice(index+1)){
      if(!neighbors(a,b)) continue;
      const x=(a.x+b.x)*.5,z=(a.z+b.z)*.5;
      smoothPath(c,[[a.x,a.z],[x,z],[b.x,b.z]],point);
      c.strokeStyle='#fff2c6';c.lineWidth=3.1*ratio;c.stroke();
      c.strokeStyle='#886c67';c.lineWidth=1.1*ratio;c.setLineDash([4*ratio,5*ratio]);c.stroke();c.setLineDash([]);
    }
  }

  const [sx,sy]=skyPoint(chartPins.sky);
  c.strokeStyle='#f6e7ff';c.lineWidth=2.2*ratio;c.setLineDash([3*ratio,5*ratio]);
  c.beginPath();c.moveTo(...point(0,-38));c.quadraticCurveTo(w*.64,h*.09,sx,sy);c.stroke();
  c.setLineDash([]);
  const [skyGrass,skyLight,skyShade]=paletteFor('sky');
  for(const [i,[x,y,rx,ry]] of [[-41,-9,30,15],[31,-10,28,16],[-31,13,24,15],[41,13,21,13]].entries()){
    const px=sx+x*ratio,py=sy+y*ratio;
    c.beginPath();c.ellipse(px,py,rx*ratio,ry*ratio,-.12,0,Math.PI*2);
    c.fillStyle=i%2?skyGrass:skyLight;c.fill();c.strokeStyle='#f5ebff';c.lineWidth=2*ratio;c.stroke();
    c.fillStyle=skyShade;c.strokeStyle=skyLight;c.lineWidth=.8*ratio;
    mark(c,px,py,5*ratio,'mountain');
  }
  for(const [,island] of realmRegions('sky')){
    const [x,z]=point(island.x+geography.sky.x,island.z+geography.sky.z);
    c.fillStyle='#746194';c.strokeStyle='#f8e5ff';c.lineWidth=1.7*ratio;
    mark(c,x,z,4.9*ratio,'wind');
  }
  compassRose(c,w-42*ratio,44*ratio,16*ratio);
}

function drawContours(c,frame,realm,height,w,h,shade,ratio){
  if(!height) return;
  const cols=59,rows=45;
  const points=Array.from({length:rows},(_,j)=>Array.from({length:cols},(_,i)=>{
    const u=i/(cols-1),v=j/(rows-1);
    return {x:u*w,y:v*h,elevation:height(realm,frame.x+(u-.5)*2*frame.rx,frame.z+(v-.5)*2*frame.rz)};
  }));
  const terrain=points.flat().map(p=>p.elevation).filter(y=>Number.isFinite(y)&&y>-8).sort((a,b)=>a-b);
  if(!terrain.length) return;
  const range=terrain[Math.floor(terrain.length*.9)]-terrain[Math.floor(terrain.length*.12)];
  if(range<.60) return;
  const bottom=terrain[Math.floor(terrain.length*.12)];
  c.save();c.strokeStyle=shade;c.globalAlpha=.33;c.lineWidth=Math.max(.7,ratio*.6);
  for(let i=1;i<7;i++){
    const level=bottom+range*i/7;
    c.beginPath();
    for(let y=1;y<rows;y++)for(let x=1;x<cols;x++){
      const cell=[points[y-1][x-1],points[y-1][x],points[y][x],points[y][x-1]];
      if(cell.some(p=>!Number.isFinite(p.elevation)||p.elevation<-8)) continue;
      const cuts=[];
      for(let corner=0;corner<4;corner++){
        const a=cell[corner],b=cell[(corner+1)%4];
        if((a.elevation<level)===(b.elevation<level)) continue;
        const t=(level-a.elevation)/(b.elevation-a.elevation);
        cuts.push([a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t]);
      }
      for(let j=1;j<cuts.length;j+=2){
        c.moveTo(...cuts[j-1]);c.lineTo(...cuts[j]);
      }
    }
    c.stroke();
  }
  c.restore();
}

export function paintRegion(canvas,realm,focus,state,height){
  const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,r=geography[realm],frame=localFrame(realm,focus);
  const colonies=localPlaces(realm),point=locator(canvas,frame);
  c.clearRect(0,0,w,h);
  const sea=c.createLinearGradient(0,0,w,h);
  sea.addColorStop(0,realm==='sky'?'#d5d8f2':'#a5d9db');
  sea.addColorStop(.5,realm==='sky'?'#ced7eb':'#d2ebdb');
  sea.addColorStop(1,realm==='sky'?'#bfbbea':'#83c7d0');
  c.fillStyle=sea;c.fillRect(0,0,w,h);
  const [grass,sunlit,shadeColor,water]=paletteFor(realm);
  const ratio=w/650;
  const rand=seeded(340+realm.length*29);
  c.strokeStyle=realm==='sky'?'#e9e5f0':'#91b6b6';c.lineWidth=1;
  for(let i=0;i<150;i++){
    const x=rand()*w,y=rand()*h,s=5+rand()*8;
    c.beginPath();c.moveTo(x-s,y);c.quadraticCurveTo(x,y+2,x+s,y);c.stroke();
  }
  c.save();
  const localBounds={x:0,z:0,rx:r.rx,rz:r.rz};
  coastline(c,point,localBounds,realm,colonies.map(([,p])=>p));
  const land=c.createLinearGradient(0,h,w,0);
  land.addColorStop(0,shadeColor);
  land.addColorStop(.37,grass);
  land.addColorStop(1,sunlit);
  c.fillStyle=land;c.fill();
  c.strokeStyle='#fff3cd';c.lineWidth=8*ratio;c.stroke();c.clip();

  if(realm!=='hogwarts') for(const [,place] of colonies){
    const [px,py]=point(place.x,place.z);
    const radius=w/(focus?3.8:7.1);
    const district=c.createRadialGradient(px,py,0,px,py,radius);
    district.addColorStop(0,(place.color??sunlit)+'a8');
    district.addColorStop(1,(place.color??sunlit)+'00');
    c.fillStyle=district;c.fillRect(px-radius,py-radius,radius*2,radius*2);
  }
  const step=Math.max(1,Math.round(4.8*ratio));
  for(let py=0;py<h;py+=step)for(let px=0;px<w;px+=step){
    const x=frame.x+(px/w-.5)*frame.rx*2,z=frame.z+(py/h-.5)*frame.rz*2;
    const y=height?.(realm,x,z)??Math.sin(x*.1+z*.18);
    const next=height?.(realm,x+1.3,z+1);
    const gradient=Number.isFinite(next)?next-y:Math.sin(x*.2)*.17;
    const band=Math.sin(y*1.9);
    c.fillStyle=gradient>.09?shadeColor:band>.24?'#fff4ce':sunlit;
    c.globalAlpha=(gradient>.09?.18:.12)+Math.min(.24,Math.abs(gradient)*.15)+rand()*.031;
    c.fillRect(px,py,step,step);
  }
  c.globalAlpha=1;
  drawContours(c,frame,realm,height,w,h,shadeColor,ratio);

  if(realm==='silverrun'){
    const {west,east,north,south}=silverrunWalls;
    const [u,v]=point(west,north),[right,bottom]=point(east,south);
    c.fillStyle='#eed1aeaa';c.fillRect(u,v,right-u,bottom-v);
    c.strokeStyle='#956b80';c.lineWidth=2.5*ratio;c.strokeRect(u,v,right-u,bottom-v);
    c.beginPath();
    for(let i=-59;i<=59;i++) {
      const p=point(riverCenter(i)-riverWidth,i);
      if(i===-59)c.moveTo(...p);else c.lineTo(...p);
    }
    for(let i=59;i>=-59;i--) c.lineTo(...point(riverCenter(i)+riverWidth,i));
    c.closePath();c.fillStyle='#69b4c1';c.fill();
  }

  if(realm==='silvercoast'){
    c.beginPath();c.moveTo(...point(-59,59));c.lineTo(...point(59,59));
    for(let x=59;x>=-59;x--) c.lineTo(...point(x,shoreZ(x)-2));
    c.closePath();c.fillStyle='#78bfcb';c.fill();c.strokeStyle='#c2e2d6';c.lineWidth=2.4*ratio;c.stroke();
    c.beginPath();
    for(let z=-59;z<=33;z++){
      const p=point(coastRiverX(z)-riverWidth,z);
      if(z===-59)c.moveTo(...p);else c.lineTo(...p);
    }
    for(let z=33;z>=-59;z--) c.lineTo(...point(coastRiverX(z)+riverWidth,z));
    c.closePath();c.fillStyle='#78bfcb';c.fill();
    for(const {x,from,to,width} of piers){
      const [u,v]=point(x-width*.5,from),[r,b]=point(x+width*.5,to);
      c.fillStyle='#c18e70';c.fillRect(u,v,r-u,b-v);
    }
    c.beginPath();c.moveTo(...point(gangplank.from,gangplank.z));c.lineTo(...point(gangplank.to,gangplank.z));
    c.strokeStyle='#b58266';c.lineWidth=4*ratio;c.stroke();
  }

  if(realm==='valley'||realm==='coast'||realm==='delta'||realm==='hogwarts'){
    const bodies=realm==='valley'?[[lake.x,lake.z,lake.rx,lake.rz]]
      :realm==='hogwarts'?[[-39,0,9.8,15.8]]
      :colonies.map(([,p],i)=>[p.x+(realm==='coast'?3:1),p.z-8,
        realm==='coast'?4.8+i:6.35,realm==='coast'?4.8+i:4.77]);
    for(const [x,z,rx,rz] of bodies){
      c.beginPath();c.ellipse(...point(x,z),rx*w/(frame.rx*2),rz*h/(frame.rz*2),0,0,Math.PI*2);
      const [u,v]=point(x,z);
      const waves=c.createLinearGradient(u-rx,v-rz,u+rx,v+rz);
      waves.addColorStop(0,'#c5ecde');waves.addColorStop(.43,water);waves.addColorStop(1,'#3597b5');
      c.fillStyle=waves;c.fill();c.strokeStyle='#e4ecd3';c.lineWidth=2.7*ratio;c.stroke();
    }
  }

  const basin=townWater(realm);
  if(basin){
    const [u,v]=point(basin.x,basin.z);
    c.beginPath();c.ellipse(u,v,basin.rx*w/(frame.rx*2),basin.rz*h/(frame.rz*2),0,0,Math.PI*2);
    c.fillStyle='#78b9c0';c.fill();c.strokeStyle='#bce0d6';c.lineWidth=2*ratio;c.stroke();
  }
  if(realm==='sky'){
    for(const [id,dx,dz,rx,rz] of [['waterveil',.9,-8,4.72,2.65],['pearlfoam',0,-7,3.93,2.72]]){
      const where=regions[id];
      const [u,v]=point(where.x+dx,where.z+dz);
      c.beginPath();c.ellipse(u,v,rx*w/(frame.rx*2),rz*h/(frame.rz*2),0,0,Math.PI*2);
      c.fillStyle='#90c7d4';c.fill();c.strokeStyle='#dbe8e6';c.lineWidth=2;c.stroke();
    }
  }
  const district=townsByPlace[focus];
  if(district){
    for(const [x,z,width,depth] of townPavement(district)){
      const [u,v]=point(x-width/2,z-depth/2),[ru,rv]=point(x+width/2,z+depth/2);
      c.fillStyle='#efdbc0d9';c.fillRect(u,v,ru-u,rv-v);
    }
    for(const {x,z,yaw,width,depth,kind} of district.buildings){
      c.beginPath();
      const cos=Math.cos(yaw),sin=Math.sin(yaw);
      for(const [i,[lx,lz]] of [[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2]].entries()){
        const [u,v]=point(x+cos*lx+sin*lz,z-sin*lx+cos*lz);
        if(i===0)c.moveTo(u,v);else c.lineTo(u,v);
      }
      c.closePath();
      c.fillStyle=kind==='home'?'#b48f7bbd':'#a87484cc';
      c.strokeStyle='#fff1c9dd';c.lineWidth=1.02*ratio;c.fill();c.stroke();
    }
  }
  const trails=realm==='sky'?colonies.map(([,p])=>Array.from({length:29},(_,i)=>{
    const a=i/28*Math.PI*2,r=11.5+Math.sin(a*3)*1.1;
    return [p.x+Math.cos(a)*r,p.z+Math.sin(a)*r];
  })):routeLines(realm);
  for(let i=0;i<100;i++){
    const x=frame.x+(rand()-.5)*frame.rx*2,z=frame.z+(rand()-.5)*frame.rz*2;
    if(i%4===0||colonies.some(([,p])=>Math.hypot(x-p.x,z-p.z)<5)) continue;
    const [u,v]=point(x,z);
    c.strokeStyle='#fff2c797';c.fillStyle=shadeColor;c.lineWidth=.85*ratio;
    mark(c,u,v,(2.4+rand()*2.5)*ratio,['frost','mesa','cinder'].includes(realm)?'mountain':'tree');
  }
  for(const walk of trails){
    smoothPath(c,walk,point);c.lineCap='round';c.lineJoin='round';
    c.strokeStyle='#fff0c6';c.lineWidth=5*ratio;c.stroke();
    c.strokeStyle='#94675b';c.lineWidth=1.6*ratio;c.setLineDash([4*ratio,4.5*ratio]);c.stroke();c.setLineDash([]);
  }
  c.restore();

  const signals=realm==='hogwarts'?allCampusLandmarks:realm==='sky'&&focus?aeryLandmarks(focus):colonies.map(([,p])=>[p.name,p.x,p.z,
    realm==='sky'?'wind':realm==='frost'?'mountain':realm==='woods'?'tree':'hall']);
  if(focus){
    if(realm==='silverrun') signals.push(...(silverrunLandmarks[focus]??[]));
    if(realm==='silvercoast') signals.push(...(coastLandmarks[focus]??[]));
    for(const marker of townServicesForPlace(focus)) signals.push([marker.name,marker.x,marker.z,
      marker.kind==='garden'?'tree':marker.kind==='lookout'?'mountain':'hall']);
  }
  c.font='800 '+Math.round(12*ratio)+'px Nunito, sans-serif';c.textAlign='center';
  const usedLabels=[];
  for(const [name,x,z,type] of signals){
    const [u,v]=point(x,z);
    if(u<18||u>w-18||v<18||v>h-25)continue;
    c.lineWidth=1.6*ratio;c.strokeStyle='#f8efd6';c.fillStyle={water:'#3389ab',tree:'#316d59',hall:'#8a5369',bridge:'#86546a'}[type]??'#7b5b93';
    mark(c,u,v,5.5*ratio,type);
    if(!focus&&realm!=='hogwarts')continue;
    if(focus&&realm!=='hogwarts'&&regions[focus]?.name===name)continue;
    const textWidth=Math.min(w*.22,c.measureText(name).width);
    const box=[u-textWidth*.5-3*ratio,u+textWidth*.5+3*ratio,v+6*ratio,v+21*ratio];
    if(usedLabels.some(([x1,x2,y1,y2])=>box[0]<x2&&box[1]>x1&&box[2]<y2&&box[3]>y1))continue;
    usedLabels.push(box);
    c.strokeStyle='#fff2ddd9';c.lineWidth=2.9*ratio;c.lineJoin='round';
    c.strokeText(name,u,v+17*ratio,w*.22);c.fillStyle='#4b3948';c.fillText(name,u,v+17*ratio,w*.22);
  }

  for(const v of villagers.filter(v=>(v.realm??'valley')===realm)){
    const [x,z]=point(v.x,v.z);c.beginPath();c.arc(x,z,3.2*ratio,0,Math.PI*2);
    c.fillStyle='#b67c9a';c.fill();c.strokeStyle='#f8e9db';c.lineWidth=1;c.stroke();
  }
  if(state.realm===realm){
    const [x,z]=point(state.player.x,state.player.z);
    if(x>0&&x<w&&z>0&&z<h){
      c.beginPath();c.arc(x,z,5.6*ratio,0,Math.PI*2);c.fillStyle='#38645d';c.fill();
      c.lineWidth=2;c.strokeStyle='#fff1d0';c.stroke();
    }
  }
  compassRose(c,w-31*ratio,39*ratio,9*ratio);
}

export function mapPinStyle(realm,place,focus){
  const t=localFrame(realm,focus);
  return {x:50+(place.x-t.x)/t.rx*50,y:50+(place.z-t.z)/t.rz*50};
}

function aeryLandmarks(id){
  const p=regions[id];
  const [name,x,z,type]={
    sail:['Cliff sails',-7,-5,'wind'],
    waterveil:['Hanging springs',.9,-8,'water'],
    orchid:['Giant orchids',-10,-1,'tree'],
    moonrise:['High roost',0,-7.8,'hall']
  }[id]??skyIslands[id].landmark;
  return [[name,p.x+x,p.z+z,type],
    ...(skyIslands[id]?[[skyIslands[id].shop,...skyCounterPoint(p),'hall']]:[]),
    ['Ferry arch',p.x-6,p.z+6,'hall'],
    ['Trail marker',...p.marker,'wind']];
}

export function mapFeatures(realm,place){
  if(realm==='hogwarts') return allCampusLandmarks.map(([name])=>name);
  if(realm==='sky'&&place) return aeryLandmarks(place).map(([name])=>name);
  if(realm==='silverrun'&&silverrunLandmarks[place]) return silverrunLandmarks[place].map(([name])=>name);
  if(realm==='silvercoast'&&coastLandmarks[place]) return coastLandmarks[place].map(([name])=>name);
  const region=regions[place];
  const points=townServicesForPlace(place);
  const land=townProfiles[realm]?.feature;
  return [region?.note??atlas[realm].tagline,...(land?[land]:feature[realm]??[]),...points.map(t=>t.name)];
}
