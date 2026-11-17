import * as T from 'three';
import {part} from './models.js';

const palette=['#ff2876','#ffa126','#ffe630','#17fb8b','#21d9ff','#6468ff','#d72eff'].map(color=>new T.Color(color));
const capacity=540;
const maxGather=22;
const maxLoot=15;
const angle=2.399963;
const nearReduced=typeof matchMedia==='undefined'?false:matchMedia('(prefers-reduced-motion: reduce)').matches;

function spoils(drop){
  const model=new T.Group();
  if(Object.keys(drop.items).length){
    part(model,'fine','#67448c',0,.25,0,.33,.28,.28);
    part(model,'fine','#a05fd9',-.09,.29,.052,.27,.225,.23,0,.3,.07);
    part(model,'fine','#9968bb',0,.54,.01,.147,.092,.145);
    part(model,'cyl','#e5a448',0,.454,.011,.171,.073,.17);
    part(model,'diamond',drop.items.trailMapScrap?'#62e7e1':'#f4bd87',0,.289,.269,.103,.118,.038,0,0,.13);
  }
  if(drop.coins){
    for(let i=0;i<3;i++){
      const a=i*2.31+.3,x=Math.cos(a)*.40,z=Math.sin(a)*.29;
      part(model,'cyl','#d49027',x,.104+i*.038,z,.15,.05,.15,.12, a,.2);
      part(model,'cyl','#ffcc55',x,.130+i*.038,z,.127,.033,.129,.12,a,.2);
      part(model,'diamond','#ffec95',x,.151+i*.038,z,.035,.016,.036,.12,a,.2);
    }
  }
  model.traverse(mesh=>{if(mesh.isMesh) mesh.castShadow=false;});
  return model;
}

export function createLootArt(scene,state,realm,terrainHeight,resources){
  const position=new Float32Array(capacity*3),rgb=new Float32Array(capacity*3);
  const brightness=new Float32Array(capacity),size=new Float32Array(capacity);
  const geometry=new T.BufferGeometry();
  function dynamic(name,data,width){
    geometry.setAttribute(name,new T.BufferAttribute(data,width).setUsage(T.DynamicDrawUsage));
  }
  dynamic('position',position,3);dynamic('tint',rgb,3);dynamic('strength',brightness,1);dynamic('diameter',size,1);
  const pixelRatio=Math.min(globalThis.devicePixelRatio||1,1.5);
  const material=new T.ShaderMaterial({
    uniforms:{pixelRatio:{value:pixelRatio}},
    depthWrite:false,
    transparent:true,
    toneMapped:false,
    vertexShader:`
      uniform float pixelRatio;
      attribute vec3 tint;
      attribute float strength,diameter;
      varying vec3 starColor;
      varying float glow;
      void main(){
        vec4 p=modelViewMatrix*vec4(position,1.);
        float perspective=clamp(17./max(-p.z,1.),.35,1.32);
        gl_Position=projectionMatrix*p;
        gl_PointSize=diameter*perspective*pixelRatio;
        starColor=tint;
        glow=strength;
      }
    `,
    fragmentShader:`
      varying vec3 starColor;
      varying float glow;
      void main(){
        vec2 p=abs(gl_PointCoord-.5);
        float arm=(sqrt(p.x)+sqrt(p.y));
        float radial=length(p);
        float outline=(1.-smoothstep(.71,.85,arm))*.61;
        float star=1.-smoothstep(.61,.745,arm);
        float halo=(1.-smoothstep(.02,.50,radial))*.44;
        float core=(1.-smoothstep(.12,.50,arm))*.8;
        vec3 hue=mix(starColor,vec3(1.,1.,.94),core);
        vec3 ink=mix(starColor*.22,hue,max(star,.42*halo));
        gl_FragColor=vec4(ink,max(max(star,outline),halo)*glow);
        #include <colorspace_fragment>
      }
    `
  });
  const points=new T.Points(geometry,material);points.frustumCulled=false;
  geometry.setDrawRange(0,0);
  scene.add(points);
  const projection=new T.Matrix4(),point=new T.Vector3(),frustum=new T.Frustum();
  const drops=new Map();
  const gatherables=resources.map((r,i)=>({source:r,home:terrainHeight(r.x,r.z),seed:i*1.81}));
  let used=0;
  let shownResources=[],shownDrops=[],refreshAt=0,lastDrops=0;

  function updateSelection(elapsed,p,camera){
    projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projection);
    const nearby=(x,y,z,range)=>Math.hypot(x-p.x,z-p.z)<range&&frustum.containsPoint(point.set(x,y+.84,z));
    shownResources=gatherables.filter(({source,home})=>source.model.visible&&nearby(source.x,home,source.z,21))
      .sort((a,b)=>Math.hypot(a.source.x-p.x,a.source.z-p.z)-Math.hypot(b.source.x-p.x,b.source.z-p.z)).slice(0,maxGather);
    const records=(state.loot??[]).filter(row=>row.realm===realm);
    const current=new Set(records.map(row=>row.id));
    for(const [id,entry] of drops) if(!current.has(id)){
      entry.model.removeFromParent();drops.delete(id);
    }
    for(const entry of drops.values()) entry.model.visible=false;
    shownDrops=records.map(row=>({row,home:terrainHeight(row.x,row.z)}))
      .filter(({row,home})=>nearby(row.x,home,row.z,73))
      .sort((a,b)=>Math.hypot(a.row.x-p.x,a.row.z-p.z)-Math.hypot(b.row.x-p.x,b.row.z-p.z)).slice(0,maxLoot)
      .map(({row,home})=>{
        if(!drops.has(row.id)){
          const model=spoils(row);
          model.position.set(row.x,home+.03,row.z);
          scene.add(model);
          drops.set(row.id,{model,row,home,seed:(row.x+row.z)*1.61});
        }
        const entry=drops.get(row.id);entry.model.visible=true;
        return entry;
      });
    refreshAt=elapsed+.09;lastDrops=state.loot?.length??0;
  }

  function sparkle(x,y,z,colorIndex,intensity,diameter){
    if(used>=capacity) return;
    const offset=used*3,color=palette[colorIndex%palette.length];
    position[offset]=x;position[offset+1]=y;position[offset+2]=z;
    rgb[offset]=color.r;rgb[offset+1]=color.g;rgb[offset+2]=color.b;
    brightness[used]=intensity;size[used]=diameter;used++;
  }

  function scatter(x,y,z,elapsed,seed,bundle){
    const count=bundle?24:9,radius=bundle?.72:.43;
    const rise=bundle?2.85:1.32;
    const show=nearReduced?Math.min(5,count):count;
    for(let i=0;i<show;i++){
      const age=((elapsed*(bundle?.51:.39)+i/count+seed*.015)%1+1)%1;
      const a=angle*i+elapsed*(bundle?2.20:1.10)+seed;
      const twinkle=.75+.25*Math.sin(elapsed*10+i*5.35+seed);
      const r=radius*(.39+.61*age)*(.85+.15*Math.cos(i*3.47));
      const lift=age*rise+(bundle?.30:.49);
      const fade=Math.sin(age*Math.PI)**.33*twinkle;
      sparkle(x+Math.cos(a)*r,y+lift,z+Math.sin(a)*r,i+(bundle?2:0),fade*(bundle?1:.86),bundle?16+(i%5===0?9:0):11+(i%4===0?5:0));
    }
  }

  return {
    update(elapsed,player,camera,combatActive){
      if(elapsed>=refreshAt||lastDrops!==(state.loot?.length??0)) updateSelection(elapsed,player,camera);
      const t=nearReduced?.25:elapsed;
      used=0;
      if(!combatActive) for(const {source,home,seed} of shownResources)
        if(source.model.visible)scatter(source.x,home,source.z,t,seed,false);
      for(const {row,home,model,seed} of shownDrops){
        model.position.y=home+.11+Math.sin(t*2.15+seed)*.075;
        model.rotation.y=t*.78+seed;
        scatter(row.x,home,row.z,t,seed,true);
      }
      for(const attribute of Object.values(geometry.attributes)) attribute.needsUpdate=true;
      geometry.setDrawRange(0,used);
    },
    destroy(){
      geometry.dispose();material.dispose();points.removeFromParent();
      for(const {model} of drops.values()) model.removeFromParent();
      drops.clear();
    }
  };
}
