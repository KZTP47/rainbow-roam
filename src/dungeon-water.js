import * as T from 'three';
import {dungeonCell,dungeonTile} from './dungeons.js';

export function tileVariation(x,z,salt=0){
  const n=Math.sin(x*91.012+z*31.723+salt*61.713)*9273.172;
  return n-Math.floor(n);
}

const half=dungeonTile/2;
const bedLevel=-.80,waterLevel=-.08;

// Distance to walkable dry ground gives both sides of a tile seam the same bank.
export function channelBed(layout,cell,x,z){
  if(!cell?.flooded)return 0;
  let distance=half;
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
    const neighbor=dungeonCell(layout,cell.x+dx,cell.z+dz);
    if(!neighbor||neighbor.flooded)continue;
    const ax=Math.max(0,Math.abs(x-neighbor.wx)-half);
    const az=Math.max(0,Math.abs(z-neighbor.wz)-half);
    distance=Math.min(distance,Math.hypot(ax,az));
  }
  const width=.89+.16*Math.sin(z*2.1+x*.8)+.11*Math.cos(x*2.4-z*.6);
  // A gently shelving lip stays visible even when looking down a long passage.
  const beach=T.MathUtils.smoothstep(distance,0,width*.72);
  const drop=T.MathUtils.smoothstep(distance,width*.62,width*1.08);
  return -.12*beach+(bedLevel+.12)*drop;
}

function dryBank(buffer,layout,cell,floorColor){
  const neighbors=[];
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
    const tile=dungeonCell(layout,cell.x+dx,cell.z+dz);
    if(tile?.flooded)neighbors.push(tile);
  }
  if(!neighbors.length)return;
  const base=new T.Color(floorColor),sand=new T.Color('#a18a75'),color=new T.Color();
  const {bed,colors,indices}=buffer,steps=6,offset=bed.length/3;
  for(let j=0;j<=steps;j++)for(let i=0;i<=steps;i++){
    const x=cell.wx-half+dungeonTile*i/steps,z=cell.wz-half+dungeonTile*j/steps;
    const distance=Math.min(...neighbors.map(tile=>Math.hypot(
      Math.max(0,Math.abs(x-tile.wx)-half),Math.max(0,Math.abs(z-tile.wz)-half))));
    const edge=1-T.MathUtils.smoothstep(distance,0,.8+.24*Math.sin(4*x+2*z));
    color.copy(base).lerp(sand,edge);
    bed.push(x,0,z);colors.push(color.r,color.g,color.b);
    if(i===steps||j===steps)continue;
    const a=offset+j*(steps+1)+i,b=a+steps+1;
    indices.push(a,b,b+1,a,b+1,a+1);
  }

}

export function floodedChannels(scene,layout){
  const bed=[],surface=[],depth=[],colors=[],indices=[];
  const sand=new T.Color('#a18a75'),silt=new T.Color('#487277'),color=new T.Color();
  const divisions=8;
  for(const cell of layout.tiles){
    if(!cell?.flooded)continue;
    const start=depth.length;
    for(let iz=0;iz<=divisions;iz++)for(let ix=0;ix<=divisions;ix++){
      const x=cell.wx-half+dungeonTile*ix/divisions,z=cell.wz-half+dungeonTile*iz/divisions;
      const y=channelBed(layout,cell,x,z);
      bed.push(x,y,z);surface.push(x,waterLevel,z);depth.push(waterLevel-y);
      color.copy(sand).lerp(silt,y/bedLevel).multiplyScalar(.97+.03*Math.sin(x*4+z*3));
      colors.push(color.r,color.g,color.b);
      if(ix===divisions||iz===divisions)continue;
      const a=start+iz*(divisions+1)+ix,b=a+divisions+1;
      indices.push(a,b,b+1,a,b+1,a+1);
    }
  }
  if(!depth.length)return null;
  const bedIndices=indices.slice();
  const buffer={bed,colors,indices:bedIndices};
  for(const cell of layout.tiles){
    if(!cell||cell.flooded)continue;
    dryBank(buffer,layout,cell,layout.floor[Math.floor(tileVariation(cell.x,cell.z)*layout.floor.length)]);
  }
  function mesh(vertices,material,faces){
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
    geometry.setIndex(faces);
    const object=new T.Mesh(geometry,material);
    object.userData.undergroundOwned=true;
    scene.add(object);
    return geometry;
  }
  const floor=mesh(bed,new T.MeshStandardMaterial({vertexColors:true,roughness:1}),bedIndices);
  floor.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  floor.computeVertexNormals();
  const material=new T.ShaderMaterial({
    transparent:true,depthWrite:false,fog:true,
    uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{time:{value:0}}]),
    vertexShader:`#include <fog_pars_vertex>
      attribute float waterDepth;
      varying float depth;
      varying vec2 water;
      void main(){
        water=position.xz;depth=waterDepth;
        vec4 mvPosition=modelViewMatrix*vec4(position,1.);
        gl_Position=projectionMatrix*mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader:`#include <fog_pars_fragment>
      uniform float time;
      varying float depth;
      varying vec2 water;
      void main(){
        float deep=smoothstep(0.,.56,depth);
        float swell=sin(water.y*3.+water.x*1.3-time*1.1+sin(water.x*2.+time*.4));
        float ripple=smoothstep(.80,.99,swell)*smoothstep(.1,.95,cos(water.x*3.-water.y+time*.6));
        vec3 color=mix(vec3(.13,.38,.34),vec3(.023,.16,.19),deep);
        float shoal=(1.-smoothstep(.02,.16,depth))*smoothstep(-.25,.8,swell);
        color+=vec3(.13,.20,.17)*ripple+vec3(.16,.18,.13)*shoal;
        float edge=smoothstep(0.,.055,depth);
        gl_FragColor=vec4(color,edge*mix(.36,.74,deep));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`
  });
  mesh(surface,material,indices).setAttribute('waterDepth',new T.Float32BufferAttribute(depth,1));
  return material;
}
