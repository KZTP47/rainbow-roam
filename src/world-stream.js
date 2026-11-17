import * as T from 'three';
import {atlas,realmRegions} from './horizons.js';
import {terrainHeight as valleyHeight,homes} from './landscape.js';
import {horizonTerrain,populateHorizon} from './horizon-land.js';
import {celMaterial} from './cel.js';
import {part,branch} from './models.js';
import {geography,oceanLevel,worldBounds,worldPoint,regionPoint,groundRealmAt} from './overworld.js';
import {skyLight} from './daylight.js';
import {seeded,lake,paths} from './map-data.js';
import {townsByPlace} from './town-data.js';

export function streamLandscape(scene,realm,state){
  const terrain=Object.fromEntries(Object.keys(atlas).filter(id=>id!=='valley').map(id=>[id,horizonTerrain(id)]));
  const base=geography[realm];
  const altitude=base.altitude??0;
  const tints=new Map();
  const lamps=[];
  const outposts=new T.Group();
  scene.add(outposts);
  const valleyBelow=new T.Group();
  scene.add(valleyBelow);
  const tint=new T.Color(),warm=new T.Color('#e1be89'),waterColor=new T.Color('#689eb4');
  const rand=seeded(7920);
  const spark=new T.MeshBasicMaterial({color:'#ffe3a1',transparent:true,opacity:0,depthWrite:false,fog:false});
  const edges=axis=>[-worldBounds-40,worldBounds+40,...Object.entries(geography).filter(([id])=>id!=='sky')
    .flatMap(([,r])=>[r[axis]-r['r'+axis],r[axis]+r['r'+axis]])].sort((a,b)=>a-b);
  const xs=edges('x'),zs=edges('z'),sand=[];
  for(let i=1;i<xs.length;i++) for(let j=1;j<zs.length;j++){
    const tx=xs[i-1],tz=zs[j-1],x=xs[i],z=zs[j];
    if(x===tx||z===tz||groundRealmAt((x+tx)/2,(z+tz)/2))continue;
    const yy=oceanLevel-altitude;
    sand.push(tx-base.x,yy,tz-base.z,tx-base.x,yy,z-base.z,x-base.x,yy,tz-base.z,
      x-base.x,yy,tz-base.z,tx-base.x,yy,z-base.z,x-base.x,yy,z-base.z);
  }
  const seaGeometry=new T.BufferGeometry();
  seaGeometry.setAttribute('position',new T.Float32BufferAttribute(sand,3));
  seaGeometry.computeVertexNormals();
  const harborLights=valleyLights(scene,base,altitude);
  const seaMat=new T.ShaderMaterial({
    uniforms:{clock:{value:0},night:{value:0}},side:T.DoubleSide,
    vertexShader:'varying vec3 p;varying float range;void main(){p=position;vec4 v=modelViewMatrix*vec4(position,1.);range=length(v.xyz);gl_Position=projectionMatrix*v;}',
    fragmentShader:`varying vec3 p;varying float range;uniform float clock,night;
      void main(){float n=sin(p.x*.42+p.z*.27+sin(p.z*.12-clock*.9)*1.9+clock*.8);
        float spark=pow(max(0.,n),18.);
        vec3 col=mix(vec3(.13,.37,.44),vec3(.045,.10,.18),night);
        col+=spark*vec3(.048,.10,.12)*(1.-smoothstep(40.,180.,range));
        col=mix(col,mix(vec3(.37,.52,.57),vec3(.084,.111,.17),night),smoothstep(92.,280.,range));
        gl_FragColor=vec4(col,1.);
        #include <colorspace_fragment>
      }`
  });
  const farWater=new T.Mesh(seaGeometry,seaMat);scene.add(farWater);
  const islands=new T.Group();
  let skyPreview;
  if(realm!=='sky'){
    const s=geography.sky;
    islands.position.set(s.x-base.x,s.altitude-altitude,s.z-base.z);
    const nearby=terrain.sky.places.filter(p=>Math.hypot(s.x+p.x-base.x,s.z+p.z-base.z)<185);
    if(nearby.length){skyPreview=populateHorizon(islands,'sky',terrain.sky,state,true,nearby);scene.add(islands);}
  }

  function heightAt(id,x,z) {
    return id==='valley'?valleyHeight(x,z):terrain[id].height(x,z);
  }

  for(const [id,r] of Object.entries(geography)){
    if(id==='sky'||id===realm) continue;
    const relative=Math.hypot(r.x-base.x,r.z-base.z);
    if(realm!=='sky'&&relative>285)continue;
    const root=id==='valley'?valleyBelow:outposts;
    const group=new T.Group();group.position.set(r.x-base.x,-altitude,r.z-base.z);root.add(group);
    tints.set(id,new T.Color(r.tone));
    const meshDensity=id==='valley'?90:relative<150?36:19;
    const geo=new T.PlaneGeometry(r.rx*2,r.rz*2,meshDensity,meshDensity);
    geo.rotateX(-Math.PI/2);
    const p=geo.getAttribute('position'), colors=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),z=p.getZ(i),h=heightAt(id,x,z);
      p.setY(i,h);
      const noise=Math.sin(x*.26+z*.42)*Math.sin(z*.31-x*.23)*.5+.5;
      tint.copy(tints.get(id)).lerp(warm,noise*.24);
      if(id==='valley'&&Math.hypot((x-lake.x)/lake.rx,(z-lake.z)/lake.rz)<1.06)
        tint.copy(waterColor);
      tint.toArray(colors,i*3);
    }
    geo.setAttribute('color',new T.BufferAttribute(colors,3));geo.computeVertexNormals();
    const ground=new T.Mesh(geo,celMaterial('#fff',{vertexColors:true}));group.add(ground);
    for(const [,place] of realmRegions(id)){
      for(let j=0;j<6;j++){
        const a=rand()*Math.PI*2,d=5+rand()*14;
        const x=place.x+Math.sin(a)*d,z=place.z+Math.cos(a)*d,y=heightAt(id,x,z);
        part(group,'fine',r.tone,x,y+1.72,z,.88+rand(),1.9+rand(),1.14).castShadow=false;
      }
    }
    const town=townsByPlace[atlas[id].entry];
    if(town&&relative<220){
      const [wall,,roof]=atlas[id].colors??['#e5dabf','#e6c8a1','#888c9b'];
      for(const spec of town.buildings){
        const house=new T.Group();
        house.position.set(spec.x,heightAt(id,spec.x,spec.z),spec.z);
        house.rotation.y=spec.yaw;group.add(house);
        const h=spec.kind==='hall'?4.2:3.38;
        part(house,'cube',wall,0,h/2,0,spec.width,h,spec.depth).castShadow=false;
        for(const side of [-1,1])part(house,'cube',roof,side*spec.width*.25,h+.52,0,
          spec.width*.57,.22,spec.depth+.38,0,0,side*-.29).castShadow=false;
        lamps.push(part(house,'cube',spark,0,h*.57,spec.depth*.51,.52,.50,.036));
      }
    }
    if(id==='valley'){
      const lakeMesh=new T.Mesh(new T.CircleGeometry(1,48),celMaterial('#71bfcb'));
      lakeMesh.rotation.x=-Math.PI/2;lakeMesh.scale.set(lake.rx,lake.rz,1);
      lakeMesh.position.set(lake.x,-.38,lake.z);group.add(lakeMesh);
      for(const [x,z,yaw,roof,wall,s] of homes){
        const house=new T.Group();house.position.set(x,heightAt(id,x,z),z);house.rotation.y=yaw;group.add(house);
        part(house,'cube',wall,0,1.35*s,0,5*s,2.7*s,4.4*s).castShadow=false;
        for(const k of [-1,1]) part(house,'cube',roof,k*1.25*s,3.22*s,0,3.2*s,.21,5.1*s,0,0,k*-.54).castShadow=false;
        for(const k of [-1,1]) lamps.push(part(house,'cube',spark,k*1.5*s,1.51*s,2.23*s,.64,.6,.04));
      }
      for(const [x,z] of [[1.9,8],[-3.6,1],[2.3,-7],[-4.2,-13],[2,-20],[-22,-12],[-35,-15],[14,-5],
        [-25,56],[60,10],[-55,32],[13,60],[35,-44],[0,34],[-55,-34],[10,-48],[-17,-51],[43,31]]){
        const y=heightAt(id,x,z);
        branch(group,'#886f68',[x,y,z],[x,y+2,z],.07).castShadow=false;
        lamps.push(part(group,'sphere',spark,x,y+2,z,.37,.25,.37));
      }
      for(let j=0;j<105;j++){
        const x=(rand()-.5)*139,z=(rand()-.5)*139;
        if(Math.hypot(x,z)<12||Math.hypot((x-lake.x)/lake.rx,(z-lake.z)/lake.rz)<1.38)continue;
        const y=heightAt(id,x,z);
        part(group,'fine',j%3?'#a5a888':'#d39db2',x,y+2.8,z,1.9,1.7,1.66).castShadow=false;
      }
    }
  }
  return {
    update(time,elapsed){
      seaMat.uniforms.clock.value=elapsed;skyPreview?.update(elapsed);
      const night=skyLight(time).night;
      spark.opacity=night*.99;seaMat.uniforms.night.value=night;
      harborLights.uniforms.night.value=night;
      for(const lamp of lamps) lamp.visible=night>.03;
    },
    groundHeight(x,z){
      const local=worldPoint(realm,x,z);
      const id=groundRealmAt(local.x,local.z);
      if(!id) return -5-altitude;
      const point=regionPoint(id,local.x,local.z);
      return heightAt(id,point.x,point.z)-altitude;
    },
    terrain
  };
}

function valleyLights(scene,base,altitude){
  const positions=[],size=[];
  function add(x,z,y,scale){
    positions.push(x-base.x,y-altitude,z-base.z);
    size.push(scale);
  }
  for(const [x,z,,,,s] of homes){
    add(x-1.3*s,z+1.9*s,valleyHeight(x,z)+2.1*s,1.35);
    add(x+1.3*s,z+1.9*s,valleyHeight(x,z)+2.1*s,1.35);
  }
  for(const path of paths){
    for(let i=1;i<path.length;i++){
      const [x,z]=path[i-1],[endX,endZ]=path[i];
      const dx=endX-x,dz=endZ-z,length=Math.hypot(dx,dz);
      for(let d=4;d<length;d+=6){
        const px=x+dx*d/length-dz*.063,pz=z+dz*d/length+dx*.063;
        add(px,pz,valleyHeight(px,pz)+1.6,.95);
      }
    }
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('size',new T.Float32BufferAttribute(size,1));
  const material=new T.ShaderMaterial({
    uniforms:{night:{value:0},valleyY:{value:-altitude}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,
    vertexShader:`uniform float valleyY;attribute float size;varying float strength;
      void main(){vec4 v=modelViewMatrix*vec4(position,1.);
        strength=smoothstep(16.,34.,cameraPosition.y-valleyY)*(1.-smoothstep(175.,285.,length(v.xyz)));
        gl_PointSize=clamp(size*690./max(1.,-v.z),4.,17.);
        gl_Position=projectionMatrix*v;}`,
    fragmentShader:`uniform float night;varying float strength;
      void main(){float r=2.*length(gl_PointCoord-.5);
        float flame=1.-smoothstep(.06,.36,r);
        float halo=max(0.,1.-r);
        gl_FragColor=vec4(mix(vec3(1.,.45,.16),vec3(1.,.93,.59),flame),
          night*strength*(flame*.84+halo*halo*.42));}`
  });
  scene.add(new T.Points(geometry,material));
  return material;
}
