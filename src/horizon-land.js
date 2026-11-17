import * as T from 'three';
import {part,branch,material,creature,animate} from './models.js';
import {celMaterial} from './cel.js';
import {atlas,houses,spells,horizonRegions,realmRegions} from './horizons.js';
import {seeded} from './map-data.js';
import {batchStatic,sky} from './landscape.js';
import {castleAnnex,blackLake,campusPlantClear,houseCrest} from './castle.js';
import {trimHeight} from './overworld.js';
import {townProfiles,townTerrain} from './town-data.js';
import {populateTown,populateTownLandscape} from './towns.js';
import {eveningLights} from './daylight.js';
import {frontierPlaces} from './frontier.js';
import {skyIslands,skyItemIslands,skyRim,skyWalkRadius} from './sky-islands.js';
import {buildSkyLandmark} from './sky-landmarks.js';
import {groundGrain,plantHabitats,terrainRelief} from './habitat.js';
import {arcanum,inRiver,overBridge,riverCenter,riverLevel,riverWidth,silverrunRoadDistance,silverrunWalls} from './silverrun.js';
import {populateSilverrun} from './silverrun-art.js';
import {coastBridge,coastRiverX,coastRiverY,coastRoadDistance,inCoastRiver,pierAt,piers,seaHeight,shoreZ} from './silvercoast.js';
import {populateSilvercoast} from './silvercoast-art.js';
import {onShip,shipHeight} from './marigold.js';

const TAU=Math.PI*2;
const rock='#858499', sandstone='#cc9578', timber='#84665f', gold='#e8b977';
const waterClock={value:0};
const waterMaterial=new T.ShaderMaterial({
  transparent:true,depthWrite:false,
  uniforms:{clock:waterClock,deep:{value:new T.Color('#498ea2')},shallow:{value:new T.Color('#9ad0ca')}},
  vertexShader:`varying vec3 vSea;
    void main() {
      vec4 point=vec4(position,1.0);
      #ifdef USE_INSTANCING
        point=instanceMatrix*point;
      #endif
      point=modelMatrix*point;
      vSea=point.xyz;
      gl_Position=projectionMatrix*viewMatrix*point;
    }`,
  fragmentShader:`varying vec3 vSea;
    uniform float clock;
    uniform vec3 deep, shallow;
    void main(){
      vec3 ray=normalize(cameraPosition-vSea);
      float grazing=pow(1.0-clamp(abs(ray.y),0.0,1.0),2.6);
      float waves=sin(vSea.x*1.57+vSea.z*.86+sin(vSea.z*.65-clock*.42)*1.1+clock*.74);
      float foamy=pow(max(0.0,waves),14.0) * (.22+.36*sin(vSea.x*.53+vSea.z*.15-clock*.38));
      vec3 color=mix(deep,shallow,clamp(.2+grazing*.58+waves*.05,0.0,1.0));
      color+=max(foamy,0.0)*vec3(.31,.45,.43);
      float haze=smoothstep(23.0,115.0,distance(cameraPosition,vSea));
      gl_FragColor=vec4(mix(color,shallow,haze*.62),.92);
      #include <colorspace_fragment>
    }`
});
const skies={
  coast:['#69b3d0','#b5dcd8','#ffdfaf'],woods:['#82b9a5','#bad8b2','#e5d8a8'],
  frost:['#7ba5d8','#cbdbed','#f3d5e4'],mesa:['#6cb5ce','#e3c5ab','#fbd6a0'],
  delta:['#74b5b4','#b2d4b8','#f7d4ad'],sky:['#5fa3d7','#a3bbdf','#fed0cf'],
  hogwarts:['#7a9bbd','#b4becb','#e2ceb3'],
  heath:['#82a7b6','#c2c6cf','#fbd8c2'],cinder:['#8ab6c5','#caadbf','#f6c59d'],
  reef:['#75bed2','#b5d9da','#f7d6bf'],verdigris:['#8aa7cf','#c7d4de','#fae1bc'],
  orchards:['#87bdd3','#c4d4bd','#ffe4a8'],
  silvercoast:['#71bbcf','#bce2da','#ffe3ae'],silverrun:['#7ebbdc','#c4dce8','#fde4b9']
};
const frontierHabitat={heath:'woods',cinder:'mesa',reef:'coast',verdigris:'woods',orchards:'woods'};
const torus=new T.TorusGeometry(1,.06,8,32);
const lantern=celMaterial('#ffe9a2',{emissive:'#ffd383',emissiveIntensity:.75});

export function voyageGate(realm,region){
  if(realm==='valley') return [5,14];
  if(realm==='hogwarts') return [-5,19];
  const place=horizonRegions[region];
  if(place.gate) return place.gate;
  return [place.x-6,place.z+6];
}

function nearestIsland(places,x,z){
  return places.reduce((best,place)=>
    Math.hypot(x-place.x,z-place.z)<Math.hypot(x-best.x,z-best.z)?place:best
  );
}

export function horizonTerrain(realm){
  const data=atlas[realm];
  const floating=realm==='sky';
  const places=realmRegions(realm).map(([,place])=>place);
  const level=place=>data.height+(place.lift??0);
  function height(x,z,bridgeDeck=true){
    if(floating){
      const place=nearestIsland(places,x,z);
      const d=Math.hypot(x-place.x,z-place.z);
      return d<skyRim+1?level(place)+.63*Math.cos(d*.18)+Math.sin(x*.31-z*.39)*.16+terrainRelief(realm,x,z):-30;
    }
    const noise=Math.sin(x*.103+z*.046)*.56+Math.cos(z*.085-x*.053)*.37;
    if(realm==='silverrun'){
      const d=Math.abs(x-riverCenter(z));
      const bank=1-T.MathUtils.smoothstep(d,riverWidth,riverWidth+2.15);
      const cityEdge=Math.max(silverrunWalls.west-x,x-silverrunWalls.east,silverrunWalls.north-z,z-silverrunWalls.south);
      const open= T.MathUtils.smoothstep(cityEdge,0,6);
      const downs=1.72*Math.exp(-(((x+43)/15)**2+((z-13)/21)**2));
      const hill=4.05*(1-T.MathUtils.smoothstep(Math.abs(x-arcanum.x),2.8,8.8))*
        T.MathUtils.smoothstep(-z,-4,8.3)*(1-T.MathUtils.smoothstep(-z,13.4,17.6));
      const ground=trimHeight(realm,x,z,data.height+hill+open*(noise*.95+downs));
      if(bridgeDeck&&d<4.3&&overBridge(z)) return T.MathUtils.lerp(data.height,ground,T.MathUtils.smoothstep(d,3,4.3));
      return T.MathUtils.lerp(ground,riverLevel-.77,bank);
    }
    if(realm==='silvercoast'){
      const ship=bridgeDeck?shipHeight(x,z,false,piers.at(-1).y):null;
      if(ship!==null) return ship;
      const pier=bridgeDeck&&pierAt(x,z);
      if(pier) return pier.y;
      const rise=2.75*Math.exp(-(((x+48)/10)**2+((z-23)/14)**2));
      const base=trimHeight(realm,x,z,data.height+noise*.49+rise);
      const shore=shoreZ(x)-z;
      const sand=T.MathUtils.lerp(-2.1,base,T.MathUtils.smoothstep(shore,-4.2,7.8));
      if(bridgeDeck&&coastBridge(x,z)) return T.MathUtils.lerp(2,sand,T.MathUtils.smoothstep(Math.abs(x-coastRiverX(z)),3.2,4.1));
      const bank=1-T.MathUtils.smoothstep(Math.abs(x-coastRiverX(z)),riverWidth,riverWidth+2.15);
      return Math.min(sand,T.MathUtils.lerp(sand,coastRiverY(z)-.8,bank));
    }
    if(realm==='hogwarts') {
      const buildings=campusPlantClear(x,z,1.5)?Math.min(1,Math.max(0,(Math.hypot(x*.88,z+9)-22)*.07)):0;
      const radius=Math.hypot((x-blackLake.x)/blackLake.rx,(z-blackLake.z)/blackLake.rz);
      const bridge=1-T.MathUtils.smoothstep(Math.abs(z-11),1.10,2.2);
      const cut=(1-T.MathUtils.smoothstep(radius,.78,1.18))*2.48*(1-bridge);
      return trimHeight(realm,x,z,data.height+(noise+terrainRelief(realm,x,z))*buildings-cut);
    }
    let y=data.height+noise+Math.sin(x*.182+z*.124)*Math.cos(z*.17-x*.1)*.51+terrainRelief(realm,x,z);
    const place=nearestIsland(places,x,z);
    const index=places.indexOf(place);
    if(realm==='heath'){
      y+=Math.cos(x*.092+z*.16)*1.46+Math.sin(z*.076)*.68;
    }else if(realm==='cinder'){
      const d=Math.hypot(x+23,z+24);
      y+=Math.exp(-((d-10)**2)/16)*3.15+Math.sin((x+z)*.12)*.78;
    }else if(realm==='reef'){
      y+=Math.sin(z*.084)*.9+Math.cos(x*.145+z*.23)*.42;
    }else if(realm==='verdigris'){
      y+=Math.sin((x-z)*.108)*2.6+Math.cos(z*.094)*1.02;
    }else if(realm==='orchards'){
      y+=Math.sin(z*.102)*1.34+Math.sin(z*.297+x*.053)*.39;
    }else if(realm==='coast'){
      const pool=Math.hypot(x-place.x-3,z-place.z+8)/(4.8+index);
      y-=1.77*(1-T.MathUtils.smoothstep(pool,.76,1.21));
      y-=3.1*(1-T.MathUtils.smoothstep(x,-53,-41));
    }else if(realm==='delta'){
      const pool=Math.hypot((x-place.x-1)/6.5,(z-place.z+8)/4.8);
      y-=1.24*(1-T.MathUtils.smoothstep(pool,.65,1.15));
    }
    return trimHeight(realm,x,z,townTerrain(realm,x,z,y));
  }
  return {
    height,places,level,waterLine:data.height-(realm==='coast'?.34:.18),
    walkable:(x,z)=>floating
      ? places.some(p=>Math.hypot(x-p.x,z-p.z)<skyWalkRadius)
      : Math.abs(x)<58 && Math.abs(z)<58 && (realm!=='coast'||x>-47) && (realm!=='silverrun'||!inRiver(x,z))
        && (realm!=='silvercoast'||(!inCoastRiver(x,z)&&height(x,z)>seaHeight+.14))
  };
}

function stoneGate(g,x,y,z,s,stone=rock){
  const base=new T.Group();base.position.set(x,y,z);base.scale.setScalar(s);g.add(base);
  for(const a of [-1,1]){
    part(base,'cube',stone,a*1.15,1.15,0,.54,2.31,.83);
    part(base,'cube',stone,a*1.15,.22,0,.72,.43,.97);
  }
  for(let i=0;i<12;i++){
    const angle=Math.PI*i/11;
    part(base,'cube',i%4===0?'#d4c0af':stone,Math.cos(angle)*1.15,2.1+Math.sin(angle)*1.33,0,.52,.56,.8,0,0,angle-Math.PI*.5);
  }
  return base;
}

function finial(g,x,y,z,s,body,trim){
  part(g,'cyl',body,x,y+s*.56,z,s*.32,s*1.1,s*.32);
  part(g,'cyl',trim,x,y+s*1.08,z,s*.36,s*.17,s*.36);
  part(g,'cone',trim,x,y+s*1.61,z,s*.4,s*.93,s*.40);
  part(g,'sphere',gold,x,y+s*2.10,z,s*.052,s*.052,s*.052);
}

function coloredGround(scene,realm,land,places){
  const [primary,light,shade,accent]=atlas[realm].colors.map(c=>new T.Color(c));
  const color=new T.Color(),ground=[];
  const pavers=new T.Color('#d5c1ad'), riverbank=new T.Color('#bcb99d');
  const localColor=new Map(land.places.map(p=>[p,new T.Color(p.color)]));
  for(const place of realm==='sky'?places:[null]){
    const geo=place?null:new T.PlaneGeometry(118,118,130,130);
    if(place) {
      const positions=[],indices=[];
      const count=60,rings=20;
      for(let i=0;i<=rings;i++) for(let j=0;j<count;j++){
        const a=j/count*TAU,r=i/rings*(skyRim+.37*Math.sin(a*5)+.16*Math.cos(a*9));
        positions.push(place.x+Math.sin(a)*r,0,place.z+Math.cos(a)*r);
        const n=i*count+j,m=i*count+(j+1)%count;
        if(i) indices.push(n,m,n-count,m,m-count,n-count);
      }
      const surface=new T.BufferGeometry();
      surface.setAttribute('position',new T.Float32BufferAttribute(positions,3));surface.setIndex(indices);
      ground.push(surface);
    } else {
      geo.rotateX(-Math.PI/2);ground.push(geo);
    }
  }
  return ground.map(geo=>{
    const p=geo.getAttribute('position'), colors=new Float32Array(p.count*3), uv=new Float32Array(p.count*2);
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),z=p.getZ(i),place=nearestIsland(land.places,x,z);
      const n=.5+.5*Math.sin(x*.306+Math.sin(z*.224))*Math.sin(z*.305-x*.117);
      const district=land.places.indexOf(place);
      p.setY(i,land.height(x,z,false));
      color.copy(primary).lerp(light,n*.36).lerp(shade,(1-n)*.19);
      if(realm!=='hogwarts'){
        const local=Math.hypot(x-place.x,z-place.z);
        if(realm==='sky'&&district>=4) color.copy(localColor.get(place)).lerp(light,n*.22).lerp(shade,(1-n)*.11);
        else color.lerp(localColor.get(place),Math.max(0,1-local/35)*.43);
        const angle=Math.atan2(z-place.z,x-place.x);
        const road=realm==='sky'?Math.abs(local-11.5-Math.sin(angle*3)*1.1)
          :Math.min(Math.abs(x-place.x),Math.abs(z-place.z));
        color.lerp(light,(1-T.MathUtils.smoothstep(road,.9,2.6))*.38);
        if(district===1||district===3) color.lerp(accent,n*.12);
      }
      if(realm==='silverrun'){
        const road=silverrunRoadDistance(x,z);
        const square=Math.max(Math.abs(x-13)-11,Math.abs(z-14)-7.4);
        color.lerp(pavers,(1-T.MathUtils.smoothstep(Math.min(road-1.3,square),0,1.05))*.92);
        const bank=Math.abs(x-riverCenter(z));
        color.lerp(riverbank,(1-T.MathUtils.smoothstep(bank,2.5,5.2))*.65);
      }
      if(realm==='silvercoast'){
        const road=coastRoadDistance(x,z);
        const beach=1-T.MathUtils.smoothstep(shoreZ(x)-z,4,16);
        color.lerp(pavers,Math.max(beach,1-T.MathUtils.smoothstep(road,.95,2.45))*.93);
      }
      const speck=(Math.sin(x*1.11-z*.78)*Math.sin(z*.94+x*.68))*.5+.5;
      color.lerp(shade,Math.max(0,.087*(speck-.30)));
      color.toArray(colors,i*3);
      uv[i*2]=x*.26;uv[i*2+1]=z*.26;
    }
    geo.setAttribute('color',new T.BufferAttribute(colors,3));
    geo.setAttribute('uv',new T.BufferAttribute(uv,2));
    geo.computeVertexNormals();
    const mesh=new T.Mesh(geo,celMaterial('#ffffff',{map:groundGrain,vertexColors:true,side:realm==='sky'?T.DoubleSide:T.FrontSide}));
    mesh.receiveShadow=true;scene.add(mesh);
    return mesh;
  });
}

function cliff(scene,place,land,index){
  const positions=[],colors=[],indices=[];
  const face=new T.Color(), a=new T.Color('#7e79a0'), b=new T.Color('#a89abc').lerp(new T.Color(place.color),.32);
  const y=land.level(place),rand=seeded(index+918);
  for(const [j,radius,height] of [[0,19.25,-.15],[1,17,-4],[2,12.5,-9],[3,7,-14],[4,.9,-20]]){
    for(let i=0;i<30;i++){
      const angle=i/30*TAU;
      const contour=.37*Math.sin(angle*5)+.16*Math.cos(angle*9);
      const r=j===0?19.18+contour:radius*(.91+rand()*.18)+contour;
      const x=place.x+Math.sin(angle)*r+j*.26,z=place.z+Math.cos(angle)*r+j*.13;
      const h=j===0?land.height(x,z)-.035:y+height+rand()*.91;
      positions.push(x,h,z);
      face.copy(a).lerp(b,j===0?.67:rand()*.86);
      if(j===0) face.lerp(new T.Color('#a3b29d'),.58);
      colors.push(face.r,face.g,face.b);
      if(j<4){
        const k=j*30+i,m=j*30+(i+1)%30;
        indices.push(k,k+30,m,m,k+30,m+30);
      }
    }
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geo.setIndex(indices);geo.computeVertexNormals();
  const shelf=new T.Mesh(geo,celMaterial('#ffffff',{vertexColors:true,side:T.DoubleSide}));
  shelf.receiveShadow=true;scene.add(shelf);
}

function willow(g,x,y,z,s,trunk,leaf){
  branch(g,trunk,[x,y,z],[x+.29*s,y+2.93*s,z],.32*s);
  for(let i=0;i<5;i++){
    const a=i*2.39996;
    const dx=Math.cos(a)*1.19*s,dz=Math.sin(a)*1.19*s;
    branch(g,trunk,[x,y+1.6*s,z],[x+dx,y+(2.62+i*.29)*s,z+dz],.13*s);
    part(g,'fine',leaf,x+dx,y+(2.84+i*.28)*s,z+dz,1.21*s,1.13*s,1.13*s,0,a,Math.sin(a)*.22);
  }
}

function reed(g,x,y,z,s,color,bloom){
  for(let i=0;i<3;i++){
    const dx=(i-1)*s*.15, h=s*(.39+i*.31);
    branch(g,color,[x,y,z],[x+dx,y+h,z+dx*.75],.022*s);
    part(g,'fine',bloom,x+dx,y+h,z+dx*.75,s*.086,s*.13,s*.079,0,0,-dx);
  }
}

function blossom(g,x,y,z,s,color,center){
  branch(g,'#698d71',[x,y,z],[x,y+s,z],.052*s);
  for(let i=0;i<5;i++){
    const a=TAU*i/5;
    part(g,'fine',color,x+Math.sin(a)*s*.29,y+s,z+Math.cos(a)*s*.29,s*.22,s*.079,s*.29,0,a);
  }
  part(g,'fine',center,x,y+s+.035,z,.14*s,.089*s,.14*s);
}

function buildBiome(g,data,realm,land,rng,blockers){
  const {x,z}=data, y=land.height(x,z);
  const slot=land.places.indexOf(data);
  const [base,light,shade,accent]=atlas[realm].colors;
  const floor=(x2,z2)=>land.height(x+x2,z+z2);
  const anchor=new T.Group();anchor.position.set(x,y,z);g.add(anchor);
  const box=(color,ox,oy,oz,a,b,c,rx=0,ry=0,rz=0)=>part(anchor,'cube',color,ox,oy,oz,a,b,c,rx,ry,rz);
  switch(realm){
    case 'coast': {
      const water=new T.Mesh(new T.CircleGeometry(4.8+slot,40),waterMaterial);
      water.rotation.x=-Math.PI/2;
      water.position.set(3,land.waterLine-y,-8);anchor.add(water);
          blockers.push([x+3,z-8,4.65+slot]);
      if(slot===0||slot===3){
        const dock=Math.max(land.waterLine,floor(-5,-5),floor(-5,-3),floor(-5,-8))-y;
        box(timber,-5,dock+.09,-5,3.04,.42,7);
        for(let k=0;k<9;k++) box(k%2?'#c79b7b':'#b78469',-5,dock+.319,-8+k*.73,3.11,.08,.61);
        if(slot===3) finial(anchor,-7,floor(-7,-8)-y,-8,3.25,'#e2d3c4','#b87570');
        else for(let i=0;i<5;i++) {
          const xx=-8+i*.67;
          box('#dfb891',xx,floor(xx,-3)-y+.53,-3,.53,1.07,.48,0,.18*i);
        }
      }else stoneGate(anchor,2,.08,-12,slot===1?2:3.3,slot===1?'#cab8a7':'#7da8ab');
      break;
    }
    case 'woods': {
      for(const [dx,dz,s] of [[-7,-7,2.25],[7,-7,2.32],[-9,1,1.55],[9,5,1.43]]){
        willow(anchor,dx,floor(dx,dz)-y,dz,s,timber,slot%2?base:shade);
        blockers.push([x+dx,z+dz,s*.35]);
      }
      if(slot===2){
        const fallen=part(anchor,'cyl','#8f6d64',.4,1.41,-8,1.62,11.7,1.63,0,0,Math.PI*.5);
        for(let i=0;i<5;i++){
          const ring=new T.Mesh(torus,material(i%2?'#b98a68':'#bc9b70'));
          ring.scale.setScalar(.28+i*.24);ring.position.set(6.33,1.42,-8);ring.rotation.y=Math.PI*.5;anchor.add(ring);
        }
        fallen.castShadow=true;blockers.push([x,z-8,3]);
      } else{
        box(timber,0,.72,-8,4.2,1.44,.74);
        for(let i=0;i<12;i++){
          const h=.42+(i%4)*.18;
          box([accent,light,'#c7896e','#9187ac'][i%4],-1.81+i*.323,1.64+h*.5,-8,.25,h,.47,0,0,(i%3-1)*.08);
        }
        for(let i=0;i<5;i++){
          part(anchor,'fine',lantern,-4+i*2.04,2.81+(i%2)*.4,-4.8,.15,.19,.15);
        }
      }
      break;
    }
    case 'frost': {
      for(let i=0;i<9;i++){
        const a=i*2.4,r=6+(i%3)*3;
        const xx=Math.sin(a)*r,zz=Math.cos(a)*r-7;
        const h=2+(i%4)*.8;
        part(anchor,'diamond',i%3===0?accent:shade,xx,floor(xx,zz)-y+h*.49,zz,h*.36,h,h*.45,.22,a,a*.08);
      }
      if(slot===1){
        part(anchor,'cyl','#c4d0df',1,.08,-6,4.26,.4,3.76);
        part(anchor,'cyl','#7ecacc',1,.29,-6,3.91,.064,3.4);
        blockers.push([x+1,z-6,3.45]);
      }else if(slot===3){
        finial(anchor,1,0,-8,3.7,'#9bacca','#6878a6');
        const lens=new T.Mesh(torus,material('#d5bcdb'));
        lens.position.set(1,4.14,-8);lens.scale.setScalar(1.39);anchor.add(lens);
        blockers.push([x+1,z-8,1.4]);
      } else stoneGate(anchor,0,.16,-8,2.2,'#a9b7ce');
      break;
    }
    case 'mesa': {
      for(const [dx,dz,s] of [[-8,-11,2.7],[7,-11,3],[11,0,1.29]]) {
        for(let layer=0;layer<6;layer++){
          part(anchor,'cyl',layer%2?shade:sandstone,dx,floor(dx,dz)-y+layer*s*.47,dz,s*(1-layer*.075),s*.51,s*(.82-layer*.048),0,.1*layer,.03);
        }
        blockers.push([x+dx,z+dz,s]);
      }
      if(slot===1) stoneGate(anchor,0,.18,-10,3.12,'#ba7965');
      else if(slot===3){
        for(let i=0;i<3;i++) part(anchor,'cyl',['#a87969','#c0937b','#61a7a2'][i],0,.1+i*.26,-8,3.8-i*.48,.36,3.6-i*.49);
        blockers.push([x,z-8,2.9]);
      } else{
        for(let i=0;i<4;i++){
          const dx=-6+i*3.2;
          box(timber,dx,1.08,-8,.13,2.2,.13);
          box(i%2?accent:'#edbb82',dx+.87,1.84,-8,1.8,.08,2,0,0,.24);
        }
      }
      break;
    }
    case 'delta': {
      const pool=new T.Mesh(new T.CircleGeometry(1,36),waterMaterial);
      pool.scale.set(6.35,4.77,1);pool.rotation.x=-Math.PI/2;
      pool.position.set(1,land.waterLine-y,-8);anchor.add(pool);
      blockers.push([x+1,z-8,4.2]);
      for(let i=0;i<9;i++){
        const a=i*2.4,xx=1+Math.sin(a)*(i%4+1)*1.1,zz=-8+Math.cos(a)*(1+i%4);
        part(anchor,'fine',base,xx,.205,zz,.62,.079,.54);
        blossom(anchor,xx,.18,zz,.54+i%3*.26,i%2?'#f6aace':'#ddaee6','#f4c785');
      }
      if(slot===3){
        for(const xx of [-4,4]) for(const zz of [-8,-3]) box(timber,xx,2.03,zz,.32,4.11,.32);
        box('#b47191',0,4.27,-5.5,9,.53,5.8);
        box('#f2cd95',0,.14,-5.26,8.7,.37,6.1);
      } else for(let i=0;i<7;i++) box(timber,-4+i*.91,.30,-3.5,.85,.17,1.5);
      break;
    }
    case 'sky': {
      for(let i=0;i<7;i++){
        const a=i*2.39996,r=8+i%3;
        const xx=Math.cos(a)*r,zz=Math.sin(a)*r-1;
        if(slot===2||slot===1) blossom(anchor,xx,floor(xx,zz)-y,zz,1.9+i%3*.43,i%2?accent:light,gold);
        else if(slot===3) part(anchor,'diamond',i%2?shade:'#988dcd',xx,1.02+i%3*.4,zz,1,1.4,.84,0,a,.22);

      }
      if(slot===3) stoneGate(anchor,0,-.1,-7.8,2.15,'#9b9ac9');
      if(slot===1){
        part(anchor,'cyl','#c3d7da',.9,.166,-8,5.2,.29,3.1);
        part(anchor,'cyl','#76c9d1',.9,.329,-8,4.72,.027,2.65);
        blockers.push([x+.9,z-8,3.4]);
      }
      break;
    }
    default:frontierVillage(anchor,realm,slot,x,z,y,floor,rng,blockers);
  }
  for(let i=0;i<84;i++){
    const a=rng()*TAU,r=4+Math.sqrt(rng())*12;
    const dx=Math.cos(a)*r,dz=Math.sin(a)*r;
    if(Math.abs(dx)<2 || r>16 || !land.walkable(x+dx,z+dz)) continue;
    const fy=floor(dx,dz)-y;
    if(blockers.some(([px,pz,rr])=>Math.hypot(px-x-dx,pz-z-dz)<rr+.55)) continue;
    if(realm==='mesa') {
      const h=.23+rng()*.85;
      part(anchor,'cyl',i%5===0?'#a5be88':'#779f86',dx,fy+h*.48,dz,.075+h*.16,h,.09+h*.12);
      if(i%4===0) part(anchor,'fine',gold,dx,fy+h,dz,.14,.093,.13);
    } else if(realm==='delta'||realm==='coast') reed(anchor,dx,fy,dz,.52+rng()*1.17,base,i%4===0?accent:light);
    else if(realm==='woods'&&i%10===0) willow(anchor,dx,fy,dz,.72+rng()*.39,timber,i%2?base:light);
    else if(realm==='frost'&&i%5===0){
      part(anchor,'diamond',i%2?shade:'#b6cde2',dx,fy+.33,dz,.21,.51,.3,0,a,.23);
    } else blossom(anchor,dx,fy,dz,.22+rng()*.51,i%3===0?accent:light,gold);
  }
}

function frontierVillage(g,realm,slot,x,z,y,floor,rng,blockers){
  const [base,pale,deep,accent]=atlas[realm].colors;
  const at=(px,pz)=>floor(px,pz)-y;
  const box=(tone,px,py,pz,dx,dy,dz,rx=0,ry=0,rz=0)=>part(g,'cube',tone,px,py,pz,dx,dy,dz,rx,ry,rz);
  const wood='#917063';
  const counterY=at(-4,-3.15);
  for(const [ax,az] of [[-5.65,-4.49],[-2.35,-4.49],[-5.65,-2.33],[-2.35,-2.33]])
    branch(g,wood,[ax,counterY-.25,az],[ax,counterY+(az<-3?2.72:2.38),az],.096);
  box('#c39977',-4,counterY+.74,-3.55,3.31,.51,1.04);
  box('#e0b987',-4,counterY+1.02,-3.51,3.58,.16,1.23);
  box('#ad836d',-4,counterY+1.99,-4.43,3.2,.14,.33);
  box(deep,-4,counterY+2.47,-3.37,3.9,.11,2.57,.166);
  for(let i=0;i<8;i++){
    const xx=-5.71+i*.49;
    box(i%2?accent:pale,xx,counterY+2.52,-3.37,.47,.08,2.58,.166);
    box(i%2?accent:pale,xx,counterY+2.268,-2.13,.47,.23,.10);
  }
  for(let i=0;i<5;i++){
    const px=-5.18+i*.59;
    const hue=[pale,accent,base,'#f3c893',accent][(i+slot)%5];
    if(realm==='cinder'||realm==='orchards'){
      part(g,'cyl',hue,px,counterY+1.29,-3.52,.129,.38,.13);
      part(g,'cyl',pale,px,counterY+1.52,-3.52,.141,.06,.145);
    }else{
      part(g,'fine',hue,px,counterY+1.18,-3.42,.185,.15,.144,0,i*.81);
      part(g,'fine',pale,px,counterY+1.22,-3.81,.129,.102,.126,0,i*.54);
    }
  }
  blockers.push([x-4,z-3.56,1.76,.82]);
  const landmarkX=3,landmarkZ=-6,ground=at(landmarkX,landmarkZ);
  if(realm==='heath'){
    if(slot===0){
      for(const px of [1.4,4.8]){
        box(wood,px,at(px,-7)+1.2,-7,.18,2.4,.18);
        box(deep,px,at(px,-7)+1.64,-7,1.04,.8,.59);
        box(pale,px,at(px,-7)+1.74,-6.67,.6,.09,.09);
        box(accent,px+.46,at(px,-7)+2.03,-7,.11,.59,.107);
      }
    }else if(slot===1){
      for(let i=0;i<5;i++){
        const px=1+i*1.12,pz=-6.4+Math.sin(i)*1.21;
        part(g,'fine',deep,px,at(px,pz)+.08,pz,.70,.18,.71,0,i);
      }
    }else if(slot===2){
      for(let i=0;i<9;i++){
        const px=.5+i*.71,pz=-7+Math.sin(i*.48)*.85;
        part(g,'fine',i%3?pale:deep,px,at(px,pz)+.81,pz,.37,.79,.44,0,i,.14);
      }
    }else{
      for(const sign of [-1,1]){
        const px=landmarkX+sign*1.25;
        branch(g,deep,[landmarkX,ground+4.4,-6],[px,ground,-6],.13);
        branch(g,deep,[px,ground+3.05,-6],[px,ground+4.3,-6],.055);
      }
      for(let i=0;i<4;i++) box(wood,landmarkX,ground+.72+i*.83,-6,2.65-i*.56,.12,.18);
      part(g,'sphere',lantern,landmarkX,ground+4.42,-6,.20,.19,.2);
    }
    for(let i=0;i<82;i++){
      const a=i*2.4,d=5+Math.sqrt(rng())*12;
      const px=Math.cos(a)*d,pz=Math.sin(a)*d;
      if(Math.abs(px)<1.6||Math.abs(pz)<1.4)continue;
      reed(g,px,at(px,pz),pz,.68+rng()*.59,'#85846e',i%3?'#c69ac3':'#e2becf');
    }
  }else if(realm==='cinder'){
    if(slot===0){
      part(g,'fine',deep,landmarkX,ground+1.23,landmarkZ,2.4,1.42,1.92);
      part(g,'fine','#443e43',landmarkX,ground+.86,-4.30,.96,.76,.16);
      part(g,'fine',lantern,landmarkX,ground+.80,-4.12,.52,.27,.12);
      box(wood,landmarkX,ground+2.62,-6.63,.49,1.82,.56);
      blockers.push([x+3,z-6,1.8]);
    }else if(slot===1){
      const bottom=at(3,-7)+.15;
      box('#77a5ac',3,bottom,-7,5.88,.07,3.67);
      for(const sign of [-1,1]) box(deep,3+sign*3.02,bottom+.49,-7,.34,.96,4.23);
      for(let i=0;i<8;i++) box(i%2?wood:'#a47f67',.06+i*.83,bottom+.46,-5.37,.78,.16,1.10);
    }else if(slot===2){
      for(let i=0;i<11;i++){
        const px=1.65+Math.sin(i*2.4)*(5+i*.2),pz=-7.4+Math.cos(i*2.4)*6;
        if(Math.abs(px)<1.2) continue;
        const gy=at(px,pz),h=2.8+rng()*2.05;
        part(g,'cyl','#6e5652',px,gy+h*.42,pz,.23,h*.84,.24);
        for(let tier=0;tier<4;tier++)
          part(g,'cone',tier%2?'#745f6b':'#8f7174',px,gy+h*(.57+tier*.17),pz,h*(.29-tier*.045),h*.42,h*.23,0,i);
        blockers.push([x+px,z+pz,.52]);
      }
    }else{
      for(let i=0;i<19;i++){
        const px=Math.sin(i*2.4)*(2.7+rng()*6),pz=-9+Math.cos(i*2.4)*(3.2+rng()*5);
        const gy=at(px,pz),h=1.04+rng()*1.65;
        part(g,'diamond',i%4===0?'#f6ae87':i%2?deep:wood,px,gy+h*.39,pz,h*.49,h,h*.39,.2,i);
      }
    }
  }else if(realm==='reef'){
    if(slot===0){
      for(let i=0;i<12;i++) box(i%2?wood:'#c9a885',2.6,at(2.6,-5-i*.56)+.18,-5-i*.56,3.7,.27,.52);
      for(const sign of [-1,1]) for(let i=0;i<4;i++){
        const xx=2.6+sign*1.74,zz=-5-i*2,gy=at(xx,zz);
        box(wood,xx,gy+.61,zz,.20,1.37,.19);
        if(i) box(wood,xx,gy+.99,zz+.91,.10,.13,2);
      }
    }else if(slot===1){
      for(let i=0;i<13;i++){
        const px=-.5+i*.54,pz=-8+Math.sin(i*.6)*.94,gy=at(px,pz);
        part(g,'fine',i%2?pale:deep,px,gy+.27,pz,.43,.42,.49,0,i*.52,.21);
        part(g,'fine',accent,px+.14,gy+.58,pz,.25,.095,.24);
      }
    }else if(slot===2){
      stoneGate(g,2.8,at(2.8,-9),-9,2.3,pale);
      for(let i=0;i<18;i++){
        const px=Math.sin(i*2.4)*(4.9+rng()*3.5),pz=-9.3+Math.cos(i*2.4)*4.3;
        if(Math.abs(px)<1.7)continue;
        const gy=at(px,pz);
        for(let k=0;k<4;k++)branch(g,k%2?'#e4b0a3':accent,[px,gy,pz],[px+(k-1.5)*.25,gy+.58+k*.25,pz+k*.15],.094);
      }
    }else{
      stoneGate(g,2.7,at(2.7,-9),-9,2.64,deep);
      for(const side of [-1,1]) for(let i=0;i<4;i++){
        const px=2.7+side*(3.5+i*.48),pz=-9-i*.67,gy=at(px,pz);
        part(g,'fine',i%2?pale:deep,px,gy+1.4,pz,1.26,2.24,1.62,0,i,.27);
        part(g,'fine',lantern,px-side*.46,gy+.8,pz+1,.2,.23,.20);
      }
    }
  }else if(realm==='verdigris'){
    if(slot===0||slot===3){
      for(let i=0;i<6;i++){
        const px=.14+i*1.21,pz=-8+Math.sin(i*.45)*1.6,gy=at(px,pz);
        branch(g,wood,[px,gy,pz],[px,gy+3.04,pz],.14);
        if(slot===0){
          part(g,'cone',pale,px,gy+2.65,pz,.32,.58,.34);
          part(g,'cyl','#c3a878',px,gy+2.42,pz,.43,.11,.43);
        }else{
          part(g,'cyl','#c3aa79',px,gy+(2.8+i*.28)*.54,pz,.32,2.8+i*.28,.31,0,0,.11);
        }
      }
    }else if(slot===1){
      const yy=at(2,-8);
      part(g,'cyl',deep,2,yy+.22,-8,3.35,.49,2.47);
      part(g,'cyl','#94bcc5',2,yy+.47,-8,3.02,.047,2.12);
      blockers.push([x+2,z-8,2.03]);
    }else{
      for(const sign of [-1,1]) for(let i=0;i<10;i++){
        const px=sign*(2.5+Math.sin(i*.44)*.71),pz=-3-i*.77;
        part(g,'fine',i%3?base:accent,px,at(px,pz)+.64,pz,.69,.87,.72);
        blockers.push([x+px,z+pz,.55]);
      }
    }
  }else if(realm==='orchards'){
    if(slot===0){
      box(wood,3,ground+.46,-6,4.4,.93,2.7);
      for(const sign of [-1,1])box(wood,3+sign*1.34,ground+2.1,-6,.31,3.4,.34);
      box(wood,3,ground+3.62,-6,3.4,.28,.49);
      part(g,'cyl',deep,3,ground+1.9,-6,1.05,1.22,1.08);
      blockers.push([x+3,z-6,2.08,1.4]);
    }else if(slot===1){
      marketCrates(g,floor,y,accent,pale);
    }else if(slot===3){
      box(wood,3,ground+.45,-7,6.85,.68,4.1);
      for(const sign of [-1,1]) for(const zz of [-8.8,-5.26]) box(wood,3+sign*3.15,ground+2.8,zz,.23,4.83,.27);
      box(accent,3,ground+4.92,-7,6.95,.21,4.2);
      for(let i=0;i<8;i++)part(g,'diamond',i%2?accent:pale,.1+i*.8,ground+4.63,-4.81,.23,.44,.075);
    }
    for(let i=0;i<(slot===2?7:4);i++){
      const px=-8+(i%4)*4.2,pz=-8-Math.floor(i/4)*4.35;
      if(Math.abs(px)<1.4)continue;
      const gy=at(px,pz);
      willow(g,px,gy,pz,1.04,wood,base);
      for(let j=0;j<9;j++){
        const a=j*2.39;
        part(g,'sphere',j%2?'#de8e92':'#e8b775',px+Math.sin(a)*1.16,gy+2.49+(j%3)*.31,pz+Math.cos(a)*1.1,.12,.14,.13);
      }
      blockers.push([x+px,z+pz,.59]);
    }
  }
}

function marketCrates(g,floor,origin,accent,pale){
  for(let i=0;i<6;i++){
    const xx=.3+(i%3)*1.2,zz=-8-Math.floor(i/3)*1.47,yy=floor(xx,zz)-origin;
    part(g,'cube','#af8770',xx,yy+.41,zz,.92,.82,1.04);
    for(let fruit=0;fruit<5;fruit++)
      part(g,'sphere',fruit%2?accent:pale,xx+Math.sin(fruit*2.4)*.26,yy+.87,zz+Math.cos(fruit*2.4)*.29,.13,.16,.14);
  }
}

export function travelArch(group,height,x,z,sky=false){
  const g=stoneGate(group,x,height(x,z),z,.92,sky?'#a5a1cd':'#a48a83');
  for(const s of [-1,1]){
    part(g,'diamond',lantern,s*1.15,2.63,.5,.13,.24,.11);
  }
  part(g,'diamond','#e6c393',0,3.58,0,.23,.32,.12);
  part(g,'cyl','#c4a99e',0,-.065,0,1.49,.15,1.1);
  return g;
}

function schoolGrounds(g,scene,land,blockers){
  const stone='#92919b', pale='#c5b7ab', slate='#616781';
  const hallY=land.height(0,-13);
  const hall=new T.Group();hall.position.y=hallY;g.add(hall);
  const box=(color,x,y,z,a,b,c,rx=0,ry=0,rz=0)=>part(hall,'cube',color,x,y,z,a,b,c,rx,ry,rz);
  const pavement='#aaa399';
  for(let i=0;i<15;i++){
    const z=19-i*3.3;
    box(i%3===0?'#bdb2a6':pavement,0,.055,z,6.6,.16,3.2);
  }
  for(let i=0;i<7;i++) for(let j=0;j<11;j++){
    box((i+j)%5===0?'#bdafa2':'#a79d96',i*3.13-9.39,.064,-8-j*1.93,3.04,.14,1.88);
  }
  blockers.push([0,-29,11.1,.5]);
  for(const s of [-1,1]){
    blockers.push([s*6.99,-7.44,4.33,.36],[s*11.2,-18.38,.37,10.8]);
    for(const [x,z,factor] of [[s*11.4,-8,4.65],[s*13.6,-26,5.8],[s*19,-30,3.9]]){
      finial(hall,x,.05,z,factor,stone,slate);
      blockers.push([x,z,factor*.35]);
      for(let i=0;i<4;i++) box('#efc888',x,(i+1)*1.45,z+factor*.3,.35,.61,.1,0,0,.02);
    }
    for(let i=0;i<5;i++){
      const z=-8-i*4.98;
      box(pale,s*10.95,2.15,z,.68,4.3,.78);
      box(stone,s*11.25,1.7,z-2.44,.64,3.4,4.5);
      box('#716c88',s*11.32,3.64,z,.72,.34,2.1);
      if(i<4) for(let k=0;k<3;k++){
        const t=(k-1)*.43;
        box(['#ae87a1','#849cd0','#deaa72'][k],s*11.24,4.2,z-2.11+t,.47,1.62-Math.abs(t)*1.34,.34);
      }
      blockers.push([s*11.12,z-1.59,1.26]);
    }
    for(let i=0;i<2;i++){
      const x=s*(3.4+i*3.7);
      box(timber,x,.89,-19,1.18,.23,10.1);
      blockers.push([x,-19,.57,4.92]);
      for(let j=0;j<5;j++){
        const z=-14.8-j*1.94;
        box('#785b50',x,.53,z,.28,.9,.2);
        box('#b38c73',x+.91,.38,z,.45,.17,1.7);
        part(hall,'fine',creamColor,x,1.018,z,.26,.045,.27);
        part(hall,'cyl',gold,x-.31,1.12,z,.10,.19,.10);
        part(hall,'cyl','#b98258',x-.31,1.231,z,.057,.085,.057);
        if(j<4){
          const end=z-.83;
          part(hall,'fine',j%2?'#d6ae78':'#b38c91',x,1.023,end,.49,.09,.45);
          for(let bite=0;bite<4;bite++){
            const a=bite*TAU/4+i;
            const tone=j%2?(bite%2?'#b37251':'#d89965'):(bite%2?'#a67386':'#a7a471');
            part(hall,'fine',tone,x+Math.cos(a)*.26,1.11,end+Math.sin(a)*.24,
              .145+(bite%2)*.05,.087+(bite%2)*.035,.13);
          }
        }
      }
    }
    const [houseA,houseB]=s<0?['gryffindor','hufflepuff']:['ravenclaw','slytherin'];
    for(const [j,house] of [houseA,houseB].entries()){
      const color=houses[house][1],z=-26.75, x=s*(2.36+j*4.15);
      box(color,x,5.23,z,1.72,3.43,.15);
      houseCrest(hall,house,x,5.42,z+.091,1.5);
      box('#ebc37e',x,3.87,z+.11,1.6,.16,.045);
    }
  }
  const naveLight=new T.PointLight('#ffdfa5',9,19,.85);
  naveLight.position.set(0,hallY+5.9,-18);scene.add(naveLight);
  const backLight=new T.PointLight('#ffd7a7',6,14,.8);
  backLight.position.set(0,hallY+5.55,-26);scene.add(backLight);
  const roofSpan=12.28, roofTilt=.58;
  const ceiling=new T.MeshBasicMaterial({color:'#252941',side:T.DoubleSide});
  for(const s of [-1,1]){
    const panel=box(ceiling,s*5.115,8.88,-18.08,roofSpan,.28,22.28,0,0,-s*roofTilt);
    panel.castShadow=false;
    box(slate,s*5.115,9.14,-18.08,roofSpan,.27,22.50,0,0,-s*roofTilt).castShadow=false;
    for(let j=0;j<7;j++){
      const z=-7.5-j*3.48;
      box('#63546b',s*5.36,8.55,z,11.89,.21,.32,0,0,-s*roofTilt);
    }
  }
  const skyStar=new T.MeshBasicMaterial({color:'#f2ce91'});
  const seeds=seeded(229);
  for(let i=0;i<205;i++){
    const x=(seeds()-.5)*19.8,z=-7.8-seeds()*20.94;
    const y=12.04-Math.abs(x)*.645;
    const s=.021+seeds()*.044;
    const star=part(hall,'low',skyStar,x,y,z,s,s,s);
    star.castShadow=false;
  }
  for(let i=0;i<9;i++){
    const x=(i-4)*.371,h=1.18+Math.cos((i-4)*.26)*1.42;
    box(['#bca6c9','#e1b481','#87a5d0'][i%3],x,6.09+h*.36,-28.42,.271,h,.059);
  }
  for(const s of [-1,1]){
    box(stone,s*6.99,4.8,-7.44,8.7,4.41,.66);
    box(pale,s*7.18,2.08,-7.02,2.78,4.14,.22);
    for(let k=0;k<3;k++){
      const x=s*(6.55+k*.54);
      box(['#9badd1','#d3a5b8','#dcae7b'][k],x,4.81,-7.01,.29,2.21-Math.abs(k-1)*.54,.24);
    }
  }
  for(const z of [-7.4,-28.91]){
    for(let i=0;i<14;i++){
      const y=7.12+i*.36,span=20.7-(i*.36)*2.96;
      if(span>.18) box(stone,0,y,z,span,.36,.56);
    }
    box(slate,0,11.97,z,.62,.32,.74);
  }
  box(stone,0,2.8,-29,22.3,5.6,.89);
  box(slate,0,5.34,-29,22.9,.39,1.33);
  stoneGate(hall,0,.12,-7.1,2.4,pale);
  stoneGate(hall,0,.13,-27.9,2.3,pale);
  box('#cfafa0',0,.385,-25.8,10,.58,2.51);
  box(timber,0,1.03,-24.9,4.15,.32,.68);
  part(hall,'cone','#806856',0,1.56,-24.9,.43,.79,.38,0,.18,-.34);
  const floatCandles=[];
  for(let i=0;i<25;i++){
    const x=(i%5-2)*3.48+(seeds()-.5)*1.1,z=-9.2-Math.floor(i/5)*3.63+(seeds()-.5)*.81;
    const height=4.9+seeds()*1.22;
    const candle=new T.Group();candle.position.set(x,height,z);scene.add(candle);
    candle.position.y+=hallY;
    part(candle,'cyl','#ddcaa7',0,0,0,.114,.41,.114).castShadow=false;
    part(candle,'diamond',lantern,0,.276,0,.067,.119,.068).castShadow=false;
    floatCandles.push([candle,hallY+height]);
  }
  part(hall,'cyl','#b1a287',-22,.14,9,3.3,.31,2.88);
  part(hall,'cyl','#b9997f',-23.7,1.76,8.1,2.13,3.34,2.1);
  part(hall,'cone','#736878',-23.7,4.09,8.1,2.79,2.61,2.81);
  box('#785a50',-23,1.01,10.04,.81,1.81,.17);
  blockers.push([-23.7,8.1,1.7]);
  for(const [x,z] of [[-17,2],[-22,-2],[-15,4],[-17,9],[-20,5]]){
    box(timber,x,.22,z,2.7,.43,1.22,0,.18);
    for(let i=0;i<4;i++) blossom(hall,x+(i-1.5)*.58,.37,z,.54,'#d9a9bd','#f1ce8b');
  }
  finial(hall,25.7,0,-17,3.45,stone,slate);
  blockers.push([25.7,-17,1.3]);
  for(const [x,z] of [[-31,-17],[30,-27],[19,17],[22,25],[-13,24],[-25,18],[-35,-25]]){
    if(!campusPlantClear(x,z,4.7)) continue;
    willow(hall,x,land.height(x,z)-hallY,z,1.51,timber,'#78977f');
    blockers.push([x,z,.54]);
  }
  for(let i=0;i<3;i++){
    const x=20+i*4,z=5-i*2;
    branch(hall,timber,[x,0,z],[x,3.8+i*.65,z],.087);
    const ring=new T.Mesh(torus,material(gold));
    ring.position.set(x,3.9+i*.65,z);ring.scale.setScalar(.68);hall.add(ring);
  }
  for(let i=0;i<108;i++){
    const a=seeds()*TAU,r=12+Math.sqrt(seeds())*35;
    const x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(Math.abs(x)<13||z<-11&&Math.abs(x)<15||!campusPlantClear(x,z,3.4)) continue;
    const base=land.height(x,z)-hallY;
    if(i%8===0) willow(hall,x,base,z,.64+seeds()*.46,timber,'#799684');
    else if(i%4===0) part(hall,'fine','#829579',x,base+.28,z,.36+seeds()*.56,.38,.54);
    else blossom(hall,x,base,z,.23+seeds()*.4,i%3?'#c0a1a6':'#d4ba89','#e5c690');
  }
  const stand=new T.Group();
  const [lx,lz]=spells.lumos.target;
  stand.position.set(lx,land.height(lx,lz),lz);g.add(stand);
  part(stand,'cyl',stone,0,.58,0,.12,1.16,.12);
  part(stand,'diamond',lantern,0,1.32,0,.18,.23,.18);
  const [fx,fz]=spells.levitate.target;
  const feather=new T.Group();scene.add(feather);
  feather.position.set(fx,hallY+1.24,fz);
  part(feather,'fine','#f3e8d5',0,.04,0,.114,.344,.026,0,0,-.46);
  branch(feather,'#c4a6a0',[-.135,-.28,.015],[.125,.22,.015],.011);
  const [rx,rz]=spells.reparo.target;
  part(hall,'cyl',rock,rx,.37,rz,.48,.74,.48);
  const rook=new T.Group();scene.add(rook);
  rook.position.set(rx+.46,hallY+.30,rz+.28);
  part(rook,'cyl','#e5d7bd',0,0,0,.31,.24,.31);
  for(let i=0;i<4;i++){
    const a=i*TAU/4;
    part(rook,'cube','#e5d7bd',Math.sin(a)*.22,.18,Math.cos(a)*.22,.17,.17,.17);
  }
  return (t,state)=>{
    for(const [i,[candle,y]] of floatCandles.entries()) candle.position.y=y+Math.sin(t*1.31+i*.83)*.13;
    const floated=Boolean(state.magic.mastered.levitate);
    feather.position.y=hallY+1.24+(floated?1.38+Math.sin(t*2.3)*.22:0);
    feather.rotation.z=.37+Math.sin(t*1.2)*(floated?.19:.025);
    const repaired=Boolean(state.magic.mastered.reparo);
    rook.position.set(rx+(repaired?0:.46),hallY+(repaired?.93:.30),rz+(repaired?0:.28));
    rook.rotation.z=repaired?0:1.12;
  };
}

const creamColor='#f0e0cf';
export function populateHorizon(scene,realm,land,state,preview=false,visiblePlaces=land.places){
  const profile=townProfiles[realm];
  const skyColors=skies[realm]??(profile?.biome==='frost'?skies.frost:profile?.biome==='coast'?skies.coast:
    profile?.biome==='mesa'?skies.mesa:profile?.biome==='woods'?skies.woods:skies.orchards);
  const setDay=preview?null:sky(scene,{colors:skyColors,rainbow:realm==='sky'||realm==='coast'||profile?.biome==='coast'});
  const ground=coloredGround(scene,realm,land,visiblePlaces);
  const group=new T.Group(), blockers=[],rand=seeded(realm.length*179);
  const floating=realm==='sky', campus=realm==='hogwarts';
  const silverrun=realm==='silverrun';
  const silvercoast=realm==='silvercoast';
  const waterfalls=[],sails=[],flocks=[];
  let updateSchool,updateCampus;
  const town=campus||floating?null:populateTown(group,atlas[realm].entry,land.height,atlas[realm].colors);
  const animateFrontier=populateTownLandscape(group,scene,realm,land.height,rand,blockers,waterMaterial);
  const animateSilverrun=silverrun?populateSilverrun(group,scene,land.height,blockers,waterMaterial):null;
  if(silvercoast) populateSilvercoast(group,scene,land.height,blockers,waterMaterial);
  if(campus) {
    updateSchool=schoolGrounds(group,scene,land,blockers);
    updateCampus=castleAnnex(group,scene,land,blockers);
  }
  const regionIds=realmRegions(realm).map(([id])=>id);
  for(const place of visiblePlaces){
    const index=land.places.indexOf(place),id=regionIds[index],island=skyIslands[id];
    if(!campus){
      if(!silverrun&&!silvercoast) buildBiome(group,place,realm,land,rand,blockers);
      if(island) buildSkyLandmark(group,place,island,land.height,blockers);
      const [sx,sz]=place.marker;
      const y=land.height(sx,sz);
      part(group,'cyl','#a78570',sx,y+.66,sz,.104,1.34,.104);
      part(group,'diamond',lantern,sx,y+1.47,sz,.18,.25,.17);
    }
    const [x,z]=voyageGate(realm,id);
    travelArch(group,land.height,x,z,floating);
    if(floating){
      cliff(scene,place,land,index);
      if(index===0) for(let i=0;i<6;i++){
        const a=i*2.4;
        const x=place.x+Math.cos(a)*9.4,z=place.z+Math.sin(a)*8.1;
        const size=3.2+i%3*.44,y=land.height(x,z);
        branch(group,'#9b8485',[x,y,z],[x,y+size+.2,z],.078);
        const geometry=new T.PlaneGeometry(1,1,12,9);
        const sail=new T.Mesh(geometry,celMaterial(i%2?'#e5a6af':'#ded8f2',{side:T.DoubleSide}));
        sail.position.set(x,y+1.85,z);
        scene.add(sail);sails.push({sail,size,phase:i*1.9});
      }
      const water=new T.Group();
      const angle=[-2.1,-.9,2.2,1.02][index%4];
      water.position.set(place.x+Math.sin(angle)*18.85,land.level(place)-9,place.z+Math.cos(angle)*18.85);
      for(let i=0;i<5;i++){
        const stream=part(water,'fine',new T.MeshBasicMaterial({
          color:i%2?'#b1ecf1':'#64bad2',transparent:true,opacity:.54,depthWrite:false
        }),i*.26-.52,-i*.31,0,.19+i*.018,9.2+i*.15,.127,.03,0,.018*i);
        stream.castShadow=false;
      }
      if(!island||island.biome==='shell'||island.biome==='terrace'){scene.add(water);waterfalls.push(water);}
      if(island) for(let i=0;i<7;i++){
        const a=i*2.39996,n=13+i%3*5;
        const cloud=part(group,'fine','#e5dfef',place.x+Math.sin(a)*n,land.level(place)-10+i%3*2.1,
          place.z+Math.cos(a)*n,3.4+i%3*1.6,.82+i%2*.5,2.8+i%3*.8);
        cloud.castShadow=false;
      }
    }
  }
  if(!floating) {
    const [,,rim]=atlas[realm].colors;
    const ridges=new T.BufferGeometry(),points=[],indices=[];
    const segs=200,rings=7;
    const distance=realm==='coast'?98:73;
    for(let row=0;row<=rings;row++) for(let col=0;col<segs;col++){
      const a=col/segs*TAU;
      const crags=Math.max(.04,.38+Math.sin(a*7+.8)*.31+Math.sin(a*13)*.24+Math.cos(a*23+2)*.11);
      const radius=distance+row*7.8+Math.sin(a*9)*3.5;
      const flank=Math.sin(row/rings*Math.PI)**1.45;
      const west=Math.sin(a);
      const coastMask=realm==='coast'?T.MathUtils.smoothstep(west,-.92,-.26):
        silvercoast?1-T.MathUtils.smoothstep(Math.cos(a),.13,.61):1;
      const height=-.9+flank*(1+32*crags)*coastMask;
      points.push(Math.sin(a)*radius,height,Math.cos(a)*radius);
      if(row){
        const i=row*segs+col,j=row*segs+(col+1)%segs;
        indices.push(i,j,i-segs,j,j-segs,i-segs);
      }
    }
    ridges.setAttribute('position',new T.Float32BufferAttribute(points,3));
    ridges.setIndex(indices);ridges.computeVertexNormals();
    const silhouette=new T.Mesh(ridges,celMaterial(rim,{side:T.DoubleSide}));
    scene.add(silhouette);
    if(realm==='coast'){
      const ocean=new T.Mesh(new T.PlaneGeometry(150,260,1,1),waterMaterial);
      ocean.position.set(-118,.48,0);ocean.rotation.x=-Math.PI/2;scene.add(ocean);
    }
  }else{
    const cloudMat=celMaterial('#f0edfa',{emissive:'#beb7d5',emissiveIntensity:.28});
    for(let i=0;i<23;i++){
      const a=i*2.39996,r=35+rand()*78;
      const x=Math.sin(a)*r,z=Math.cos(a)*r,y=-4+rand()*10;
      for(let j=0;j<3;j++){
        const puff=part(group,'fine',cloudMat,x+j*3,y+Math.sin(j)*1.2,z,5.6+rand()*3,1.2+rand(),3.9+rand()*2);
        puff.castShadow=false;
      }
    }
  }
  if(!preview&&['coast','delta','sky','reef','silvercoast'].includes(realm)){
    const tint=realm==='sky'?'#d6b8e4':'#ccd6e0';
    const bird={kind:'gull',color:'#f7eee4',accent:tint};
    for(let i=0;i<7;i++){
      const actor=creature(bird);
      actor.group.scale.setScalar(.78+i%3*.13);
      scene.add(actor.group);flocks.push(actor);
    }
  }
  const isClear=(x,z)=>!town?.blocks(x,z)&&blockers.every(([px,pz,r,depth])=>
    depth?Math.abs(x-px)>r||Math.abs(z-pz)>depth:Math.hypot(x-px,z-pz)>r);
  const reserved=realmRegions(realm).flatMap(([id,place])=>[place.travel,voyageGate(realm,id),...(place.marker?[place.marker]:[])]);
  const habitat=silverrun?'woods':silvercoast?'coast':frontierHabitat[realm]??(profile&&(['heath','meadow','orchards'].includes(profile.biome)?'woods':profile.biome))??realm;
  const animateGrass=preview?null:plantHabitats(scene,group,habitat,land,(x,z)=>isClear(x,z)&&!town?.isPaved(x,z)&&
    (!silvercoast||(land.walkable(x,z)&&!pierAt(x,z)&&!onShip(x,z)&&coastRoadDistance(x,z)>2.5))&&(!silverrun||
    (land.walkable(x,z)&&silverrunRoadDistance(x,z)>2.6&&
      !(x>silverrunWalls.west&&x<silverrunWalls.east&&z>silverrunWalls.north&&z<silverrunWalls.south)&&
      !(x>-42&&x<-27&&z>29&&z<37))),reserved);
  batchStatic(scene,group);


  if(preview) return { update(t){
    for(const [i,water] of waterfalls.entries()) water.scale.x=1+Math.sin(t*2.15+i)*.13;
  }};
  const trailLights=land.places.flatMap(place=>{
    if(campus) return [[-3,12],[3,4],[-4,-5],[7,-3],[15,9],[-18,7]];
    return [[place.x+2.6,place.z+7],[place.x-4,place.z+2],[place.x+2.7,place.z-5]]
      .filter(([x,z])=>isClear(x,z)&&land.walkable(x,z));
  });
  const lightTrails=eveningLights(scene,trailLights.map(([x,z])=>[x,land.height(x,z),z]));
  const pollenCount=floating?114:76;
  const coords=new Float32Array(pollenCount*3);
  const positions=Array.from({length:pollenCount},(_,i)=>{
    const place=land.places[i%land.places.length];
    const x=place.x+(rand()-.5)*28,z=place.z+(rand()-.5)*28;
    return [x,land.height(x,z)+.41+rand()*4,z,rand()*TAU];
  });
  const flecks=new T.BufferGeometry();
  const attribute=new T.BufferAttribute(coords,3);attribute.setUsage(T.DynamicDrawUsage);
  flecks.setAttribute('position',attribute);
  const cloud=new T.Points(flecks,new T.PointsMaterial({color:realm==='frost'?'#fff8f4':'#fff0bd',size:.10,opacity:.71,transparent:true,depthWrite:false}));
  cloud.frustumCulled=false;scene.add(cloud);

  return {
    ground:ground[0],setDay,
    isClear,
    update(t,player){
      updateSchool?.(t,state);
      updateCampus?.(t);
      town?.update(state.time);animateFrontier(t);
      animateSilverrun?.(t);
      lightTrails(state.time,player);
      waterClock.value=t;
      animateGrass(t);
      for(const [i,water] of waterfalls.entries()) water.scale.x=1+Math.sin(t*2.15+i)*.13;
      for(const {sail,size,phase} of sails){
        sail.visible=Math.hypot(player.x-sail.position.x,player.z-sail.position.z)<40;
        if(!sail.visible) continue;
        const positions=sail.geometry.getAttribute('position');
        for(let col=0;col<positions.count;col++){
          const u=col%13/12,v=Math.floor(col/13)/9;
          const width=(1.13-v*.63)*size*.7;
          positions.setXYZ(col,u*width,(.5-v)*size*.59,Math.sin(u*2+v*1.4+t*2+phase)*u*.37);
        }
        positions.needsUpdate=true;
        sail.geometry.computeVertexNormals();
      }
      for(const [i,actor] of flocks.entries()){
        const route=land.places[i%land.places.length],radius=15+i%3*4.4;
        const phase=t*.32+i*2.4;
        const x=route.x+Math.sin(phase)*radius,z=route.z+Math.cos(phase)*radius;
        const lift=floating?land.level(route):atlas[realm].height;
        actor.group.position.set(x,lift+3.2+i%3+Math.sin(phase*2)*.73,z);
        actor.group.rotation.set(0,phase+Math.PI*.5,.12);
        actor.group.visible=Math.hypot(player.x-x,player.z-z)<64;
        if(actor.group.visible) animate(actor,t+i,false);
      }
      for(let i=0;i<pollenCount;i++){
        const [x,y,z,phase]=positions[i];
        coords[i*3]=x+Math.sin(t*.4+phase)*2.1;
        coords[i*3+1]=y+Math.sin(t*.77+phase)*.64;
        coords[i*3+2]=z+Math.cos(t*.32+phase)*1.73;
      }
      attribute.needsUpdate=true;
    }
  };
}

export function horizonResource(realm,id,variant){
  const local=frontierPlaces[id.replace(/-merch$/,'')];
  const island=skyItemIslands[id];
  if(id!==atlas[realm].material&&!local&&!island) return null;
  const g=new T.Group();
  const [base,light,shade,accent]=atlas[realm].colors;
  if(island){
    const [, ,kind,color]=island.item;
    for(let i=0;i<4;i++){
      const a=i*TAU/4+variant,xx=Math.cos(a)*.18,zz=Math.sin(a)*.19;
      if(kind==='sprout'||kind==='flower-2') blossom(g,xx,0,zz,.28+i*.06,color,gold);
      else if(kind==='gem') part(g,id==='mistPearl'?'fine':'diamond',i%2?color:'#ecf7fa',xx,.13+i*.03,zz,.123,.23,.133,.21,a+.4,.2);
      else part(g,'fine',color,xx,.15,zz,.072,.24,.078,0,a,.44);
    }
  }else if(local){
    const kind=local.item[2];
    for(let i=0;i<4;i++){
      const a=i*TAU/4,xx=Math.cos(a)*.17,zz=Math.sin(a)*.19;
      if(kind==='sprout'||kind==='flower-2') blossom(g,xx,0,zz,.28+i*.06,i%2?accent:light,gold);
      else if(kind==='trees') branch(g,shade,[xx,.02,zz],[xx+.19,.12+i*.04,zz+.18],.069);
      else if(kind==='gem'||kind==='sparkles'||kind==='mountain')
        part(g,'diamond',i%2?accent:light,xx,.13+i*.03,zz,.123,.24,.133,.21,a+.4,.2);
      else part(g,'fine',i%2?accent:gold,xx,.14,zz,.142,.125,.145,0,a);
    }
  }else if(realm==='coast'||realm==='delta'){
    for(let i=0;i<4;i++){
      const a=i*TAU/4;
      const x=Math.sin(a)*.18,z=Math.cos(a)*.17;
      part(g,'fine',realm==='coast'?'#d9e8e5':'#bfadd8',x,.18+i*.013,z,.12,.105,.111);
      part(g,'fine','#fff4df',x,.244+i*.014,z,.045,.042,.052);
    }
  } else if(realm==='woods'){
    for(let i=0;i<3;i++){
      const x=(i-1)*.16,z=Math.sin(i*2)*.12,h=.23+i*.058;
      part(g,'cyl',light,x,h*.49,z,.043,h,.043);
      part(g,'fine',accent,x,h,z,.128,.081,.129);
      part(g,'fine','#f4dcce',x,h+.07,z,.037,.021,.033);
    }
  } else if(realm==='frost'||realm==='sky'){
    for(let i=0;i<3;i++) blossom(g,(i-1)*.15,0,Math.sin(i*2.3)*.16,.33+i*.089,realm==='sky'?accent:'#d7c6f0',gold);
  } else reed(g,0,0,0,1.13,shade,light);
  g.rotation.y=variant;
  return g;
}
