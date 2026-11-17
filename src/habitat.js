import * as T from 'three';
import {part,branch,material} from './models.js';
import {celMaterial} from './cel.js';
import {seeded} from './map-data.js';

const TAU=Math.PI*2;
const wind={value:0};
const grassMaterial=new T.MeshLambertMaterial({side:T.DoubleSide});
grassMaterial.onBeforeCompile=shader=>{
  shader.uniforms.roamWind=wind;
  shader.vertexShader='uniform float roamWind;\n'+shader.vertexShader.replace('#include <begin_vertex>',`
    #include <begin_vertex>
    #ifdef USE_INSTANCING
      vec3 stem=instanceMatrix[3].xyz;
      float gust=sin(roamWind*1.9+stem.x*.49+stem.z*.58);
      transformed.x+=gust*pow(position.y,1.35)*.14;
      transformed.z+=sin(roamWind*1.17+stem.z*.72)*position.y*.16;
    #endif
  `);
};
const blade=new T.BufferGeometry();
blade.setAttribute('position',new T.Float32BufferAttribute([
  -.044,0,0, .044,0,0, -.037,.44,.025, .026,.45,.025, -.027,.73,.07, .016,.75,.07, -.077,1,.13
],3));
blade.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,4,5,6]);blade.computeVertexNormals();

const rockGeo=new T.IcosahedronGeometry(1,2);
const vertices=rockGeo.attributes.position,normal=rockGeo.attributes.normal;
for(let i=0;i<vertices.count;i++){
  const x=vertices.getX(i),y=vertices.getY(i),z=vertices.getZ(i);
  const lump=1+.114*Math.sin(x*4.6+y*5.7)*Math.cos(z*4.2-x*2.1)+.061*Math.cos(x*9.1+z*5.8);
  vertices.setXYZ(i,x*lump,y*lump,z*lump);
  normal.setXYZ(i,x,y,z);
}
const colors={
  coast:{ground:['#b5be8a','#929e6f','#a9b483','#d7c492'],stone:['#b5b0a1','#d1c7b3','#83a39b'],leaf:'#829d73',tip:'#ddce9f',flower:'#f3dac8'},
  woods:{ground:['#638a65','#829e6a','#9ab27b','#a7b67c'],stone:['#727f71','#8e9a77','#a5ab86'],leaf:'#698f69',tip:'#96b37d',flower:'#d1a4d1'},
  frost:{ground:['#a9bfba','#bac9c6','#d8ded5','#c7bbbd'],stone:['#b7c1cd','#dce5e9','#9eaebe'],leaf:'#799a93',tip:'#c7dfd7',flower:'#ded0e6'},
  mesa:{ground:['#a2a270','#c4ad77','#b9bc83','#9da780'],stone:['#c49878','#ad826f','#d2ac86'],leaf:'#728e78',tip:'#abc68f',flower:'#eac17a'},
  delta:{ground:['#61947d','#79a27b','#91b783','#a2bf81'],stone:['#849e8d','#94ac9a','#b4bd9d'],leaf:'#63957c',tip:'#acbe85',flower:'#ecafc8'},
  sky:{ground:['#83a79a','#a2bdb3','#b0c8b8','#a7aeca'],stone:['#939bb1','#a8b0ba','#a4b7ab'],leaf:'#7fa6a3',tip:'#adc9ba',flower:'#d3acd8'},
  hogwarts:{ground:['#7d956c','#9fa682','#91aa83','#b2b887'],stone:['#8f958d','#aaab9e','#9f9e8d'],leaf:'#76886d',tip:'#a0b58b',flower:'#d6aaa9'}
};

function soilTexture(){
  const rand=seeded(7051),pixels=new Uint8Array(128*128*4);
  for(let y=0;y<128;y++) for(let x=0;x<128;x++){
    const a=TAU*x/128,b=TAU*y/128;
    const grain=rand()**1.8;
    const n=Math.sin(a*5+Math.cos(b*3)*2)*Math.cos(b*4+Math.sin(a*2));
    const value=238+n*6-grain*18+(rand()>.965?-14:0);
    const i=(y*128+x)*4;
    pixels[i]=value;pixels[i+1]=value;pixels[i+2]=value*.987;pixels[i+3]=255;
  }
  const texture=new T.DataTexture(pixels,128,128);
  texture.wrapS=texture.wrapT=T.RepeatWrapping;
  texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearMipmapLinearFilter;
  texture.generateMipmaps=true;texture.colorSpace=T.SRGBColorSpace;texture.needsUpdate=true;
  return texture;
}
export const groundGrain=soilTexture();

export function terrainRelief(realm,x,z){
  const noise=Math.sin(x*.172+z*.11)*Math.cos(z*.225-x*.055);
  const fine=Math.sin(x*.47-z*.29)*Math.sin(z*.38+x*.17);
  switch(realm){
    case 'coast':return noise*.73+fine*.09;
    case 'woods':return Math.sin(z*.098-x*.063)*1.35+noise*.84+fine*.16;
    case 'frost':return Math.cos(x*.143+z*.102)*1.44+noise*.71+fine*.11;
    case 'mesa':return Math.sin(x*.12-z*.14)*1.32+noise*.97;
    case 'delta':return noise*.42+fine*.08;
    case 'sky':return noise*.30+fine*.085;
    default:return noise*.68;
  }
}

function leafMesh(width,curve){
  const p=[],uv=[],index=[];
  for(let i=0;i<=10;i++){
    const t=i/10,span=(Math.sin(t*Math.PI)**.72)*width+.0005;
    for(const side of [-1,0,1]){
      p.push(side*span, t*(1-.36*t), t*t*curve);
      uv.push(.5+.5*side,t);
    }
    if(i<10){
      const a=i*3;
      index.push(a,a+1,a+3,a+1,a+4,a+3,a+1,a+2,a+4,a+2,a+5,a+4);
    }
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(p,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.setIndex(index);geo.computeVertexNormals();
  return geo;
}
const longLeaf=leafMesh(.09,.42), roundedLeaf=leafMesh(.145,.29);
const leafMaterials=new Map();

function leaf(group,geo,color,x,y,z,s,angle,tilt){
  if(!leafMaterials.has(color)) leafMaterials.set(color,celMaterial(color,{side:T.DoubleSide}));
  const mesh=new T.Mesh(geo,leafMaterials.get(color));
  mesh.position.set(x,y,z);mesh.rotation.set(tilt,angle,0,'YXZ');mesh.scale.setScalar(s);
  group.add(mesh);
}

function flower(group,x,y,z,s,mood,color){
  branch(group,mood.leaf,[x,y,z],[x+s*.13,y+s*.89,z],s*.025).castShadow=false;
  leaf(group,longLeaf,mood.tip,x,y+s*.19,z,s*.72,1.3,.56);
  for(let i=0;i<5;i++){
    const a=i*TAU/5;
    const petal=part(group,'fine',color,x+s*.13+Math.cos(a)*s*.14,y+s*.89+Math.sin(a)*.012,z+Math.sin(a)*s*.14,
      s*.16,s*.043,s*.11,0,-a,Math.cos(a)*.19);
    petal.castShadow=false;
  }
  part(group,'sphere','#efcb83',x+s*.13,y+s*.945,z,s*.085,s*.05,s*.078).castShadow=false;
}

function fern(group,x,y,z,s,mood){
  for(let i=0;i<5;i++){
    const a=i*TAU/5+z*.4,extent=.40+s*.21;
    const end=[x+Math.sin(a)*extent,y+s*.54,z+Math.cos(a)*extent];
    branch(group,mood.tip,[x,y,z],end,.015*s).castShadow=false;
    for(let j=2;j<6;j++){
      const t=j/6;
      for(const side of [-1,1]) leaf(group,roundedLeaf,j%2?mood.leaf:mood.tip,
        T.MathUtils.lerp(x,end[0],t),T.MathUtils.lerp(y,end[1],t),T.MathUtils.lerp(z,end[2],t),
        s*(.38-t*.23),a+side*.85,.73);
    }
  }
}

function shrub(group,x,y,z,s,mood,round){
  const count=round?11:8;
  for(let i=0;i<count;i++){
    const a=i*2.39996+x*.4, r=(i%3)*.055*s;
    const size=s*(.76+(i%4)*.082);
    leaf(group,round?roundedLeaf:longLeaf,i%3===0?mood.tip:mood.leaf,
      x+Math.cos(a)*r,y+(i%3)*.045*s,z+Math.sin(a)*r,size,a,.35+(i%5)*.178);
  }
}

function pebble(group,x,y,z,s,mood,index){
  const stone=new T.Mesh(rockGeo,material(mood.stone[index%3]));
  stone.position.set(x,y+s*.30,z);
  stone.scale.set(s,s*(.44+index%4*.089),s*(.66+(index%3)*.12));
  stone.rotation.set(.18*index,.91*index,.13);
  stone.castShadow=s>.48;
  stone.receiveShadow=true;group.add(stone);
  if(s>.55) for(let i=0;i<4;i++) leaf(group,roundedLeaf,mood.leaf,
    x+Math.cos(i*2.4)*s*.65,y+s*.42,z+Math.sin(i*2.4)*s*.64,s*.48,i*2.4,.76);
}

function cactus(group,x,y,z,s,mood){
  const stem=part(group,'fine',mood.leaf,x,y+s*.47,z,s*.22,s*.52,s*.18,0,0,.13);
  stem.castShadow=s>.85;
  for(const side of [-1,1]){
    const d=side*s*.23;
    part(group,'fine',mood.tip,x+d,y+s*.44,z,s*.135,s*.34,s*.105,.05,0,side*-.65).castShadow=false;
    part(group,'fine',mood.flower,x+d*1.55,y+s*.68,z,s*.101,s*.069,s*.089).castShadow=false;
  }
}

export function plantHabitats(scene,decor,realm,land,isClear,reserved=[],compact=false){
  const mood=colors[realm],rand=seeded(8602+realm.charCodeAt(0)*49+realm.length+Math.round(land.places[0].x*37));
  const centers=land.places, floating=realm==='sky';
  const count=compact?950:floating?2900:realm==='hogwarts'?2900:6900;
  const turf=new T.InstancedMesh(blade,grassMaterial,count);
  turf.name='Habitat ground cover';
  const dummy=new T.Object3D(), tint=mood.ground.map(color=>new T.Color(color));
  let index=0;
  const pathOffset=(x,z,place)=>Math.min(Math.abs(x-place.x),Math.abs(z-place.z));
  for(let i=0;i<count*2&&index<count;i++){
    const place=centers[i%centers.length],a=rand()*TAU;
    const r=(i%5===0?23:16)*Math.sqrt(rand());
    const x=place.x+Math.cos(a)*r,z=place.z+Math.sin(a)*r;
    if(!land.walkable(x,z)||!isClear(x,z)) continue;
    if(realm==='hogwarts'&&(Math.abs(x)<4||Math.abs(x)<12&&z>-30&&z<-6)) continue;
    const trail=pathOffset(x,z,place);
    if(trail<1.15&&rand()<.93) continue;
    const patch=Math.sin(x*.65+z*.19)*Math.cos(z*.43-x*.28);
    if(patch<-.23&&rand()<.77) continue;
    const h=(.14+rand()*.30)*(realm==='frost'?.78:realm==='mesa'?.82:1.05)*(.7+(patch+1)*.36);
    dummy.position.set(x,land.height(x,z)-.022,z);
    dummy.rotation.set(0,rand()*TAU,(rand()-.5)*.4);
    dummy.scale.set(.74+h*.58,h,.87);
    dummy.updateMatrix();
    turf.setMatrixAt(index,dummy.matrix);turf.setColorAt(index,tint[Math.floor(rand()*tint.length)]);
    index++;
  }
  turf.count=index;scene.add(turf);

  for(let i=0;i<centers.length;i++){
    const place=centers[i];
    const amount=compact?56:realm==='hogwarts'?74:realm==='woods'?118:94;
    for(let j=0;j<amount;j++){
      const a=rand()*TAU,r=3.6+Math.sqrt(rand())*(floating?12.3:17.9);
      const x=place.x+Math.cos(a)*r,z=place.z+Math.sin(a)*r;
      if(!land.walkable(x,z)||!isClear(x,z)||pathOffset(x,z,place)<1.45) continue;
      if(reserved.some(([xx,zz])=>Math.hypot(x-xx,z-zz)<2)) continue;
      if(realm==='hogwarts'&&(Math.abs(x)<4||Math.abs(x)<12&&z>-31&&z<-6)) continue;
      const s=.39+rand()*.80, y=land.height(x,z),slot=j%12;
      if(slot<3) pebble(decor,x,y,z,s*.67,mood,j);
      else if(realm==='woods'&&slot<7) fern(decor,x,y,z,s,mood);
      else if(realm==='mesa'&&slot<8) cactus(decor,x,y,z,s,mood);
      else if(slot<9) shrub(decor,x,y,z,s,mood,realm==='delta'||realm==='woods');
      else flower(decor,x,y,z,s*.77,mood,slot===11?mood.flower:'#f4dfab');
    }
    if(!compact&&(realm==='coast'||realm==='delta')){
      const yy=land.waterLine;
      const xx=place.x+(realm==='coast'?3:1), zz=place.z-8;
      for(let j=0;j<19;j++){
        const a=j*2.39996+i*.77;
        const rx=realm==='coast'?3.5+i*.86:4.4;
        const rz=realm==='coast'?rx:3.6;
        const x=xx+Math.sin(a)*rx*(.79+rand()*.28),z=zz+Math.cos(a)*rz*(.77+rand()*.27);
        const elev=land.height(x,z);
        if(realm==='delta'&&j%2===0&&elev<yy){
          const leaf=part(decor,'fine',mood.leaf,x,yy+.032,z,.31+rand()*.21,.05,.35+rand()*.17,0,a);
          leaf.castShadow=false;
          if(j%4===0) flower(decor,x,yy+.03,z,.31,mood,mood.flower);
        } else if(elev<yy+.25) pebble(decor,x,Math.max(yy-.13,elev),z,.19+rand()*.32,mood,j);
      }
    }
  }
  return t=>{wind.value=t;};
}

