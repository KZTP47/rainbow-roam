import * as T from 'three';
import {branch, material, part} from './models.js';
import {resourceSpots,WORLD_LIMIT} from './content.js';
import {newRegions} from './expansion.js';
import {celMaterial} from './cel.js';
import {plantHabitats} from './habitat.js';
import {skyLight,sunDirection,eveningLights,celestialFragment} from './daylight.js';
import {trimHeight} from './overworld.js';
import {lake,paths,seeded} from './map-data.js';
import {home as cloverCottage} from './homestead.js';

const tau = Math.PI*2;
const cottageGarden=(x,z)=>Math.hypot((x-cloverCottage.x-3)*.80,(z-cloverCottage.z)*1.08)<8.9;
const cottageClearing=(x,z)=>Math.hypot((x-cloverCottage.x-2)*.89,(z-cloverCottage.z-4)*.61)<11.7;
const districtGround=Object.values(newRegions).map(r=>({...r,tint:new T.Color(r.color)}));
const nativePalette={
  spore:['#dc805f','#fff1ce'], silk:['#75aa8d','#f8e0ca'], bell:['#9da4e6','#f5dfb7'],
  shell:['#d2eef0','#da96af'], honey:['#efb855','#ae7359'], ribbon:['#cb7fb5','#f5bd84'],
  jade:['#71c5a5','#bee9b7'], glow:['#91a4ce','#fff0a1']
};

const ridge = [
  [-63,-83,24,25],[-41,-96,31,27],[-17,-93,17,22],[4,-96,20,25],[28,-96,30,24],[57,-88,32,23],[69,-76,22,18],
  [76,-47,27,19],[-80,-44,22,20],[-83,1,25,21],[90,-8,26,22],[94,38,28,23],[-84,43,24,26],
  [51,-25,15,18],[49,-57,13,21],[-60,-55,17,18],[71,67,23,26],[-36,85,18,22]
];

export const homes = [
  [-8,-15,0.1,'#aa788f','#ffe0a4',1.07],
  [7,-17,-.22,'#cc817d','#f9dcac',.91],
  [-3,-23,.14,'#6c9f9e','#ffda9d',.88],
  [-13,-8,.33,'#aa829c','#f4cba1',.72],
  [-28,-16,.31,'#8e789f','#fbe2af',.76],
  [-5,36,-.14,'#d49970','#ffdfad',.83],
  [36,-45,.24,'#8289ad','#e7d4aa',.74]
];



export function lakeValue(x,z) {
  const a=(x-lake.x)/lake.rx,b=(z-lake.z)/lake.rz;
  return Math.hypot(a,b)+Math.sin(a*6+b*4)*.033+Math.sin(b*11)*.019;
}

export function terrainHeight(x,z) {
  const d = lakeValue(x,z);
  const quiet = T.MathUtils.smoothstep(Math.hypot(x,z*.72),9,39);
  let y = Math.sin(x*.09+z*.035)*.86 + Math.cos(z*.12-x*.04)*.71-.26;
  y += (Math.sin(x*.23+z*.11)*Math.sin(z*.185-x*.028)*.8+Math.cos(x*.035-z*.018)*1.2)*quiet;
  for(const [px,pz,h,w] of ridge) {
    const a=Math.atan2(z-pz,x-px), jag=1+Math.sin(a*4+px)*.12+Math.cos(a*7+pz)*.09;
    const dist=Math.hypot(x-px,z-pz)/w*jag;
    y+=h*Math.pow(Math.max(0,1-dist),1.3);
  }
  if(d<1.5) y=T.MathUtils.lerp(-2.6,y,T.MathUtils.smoothstep(d,.67,1.27));
  if(x>35&&x<53&&z>-30&&z<-15) y+=Math.max(0,1-Math.hypot((x-44)/10,(z+23)/8))*3.5;
  const cottageSlope=Math.hypot((x-cloverCottage.x-2.7)*.74,(z-cloverCottage.z)*1.16);
  y=T.MathUtils.lerp(.63,y,T.MathUtils.smoothstep(cottageSlope,5.6,11.8));
  return trimHeight('valley',x,z,y);
}

export function walkable(x,z) {
  if (lakeValue(x,z)<.96 || Math.abs(x)>WORLD_LIMIT-1 || Math.abs(z)>WORLD_LIMIT-1) return false;
  if (homes.some(([px,pz,,, ,s])=>Math.abs(x-px)<2.65*s && Math.abs(z-pz)<2.37*s)) return false;
  return Math.hypot(
    terrainHeight(x+.6,z)-terrainHeight(x-.6,z),
    terrainHeight(x,z+.6)-terrainHeight(x,z-.6)
  )<1.75;
}

function pathDistance(x,z) {
  let result=200;
  for(const route of paths) for(let i=1;i<route.length;i++) {
    const [ax,az]=route[i-1],[bx,bz]=route[i];
    const dx=bx-ax,dz=bz-az;
    const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));
    result=Math.min(result,Math.hypot(x-ax-t*dx,z-az-t*dz));
  }
  return result;
}

function terrain(scene) {
  const geo=new T.PlaneGeometry(192,192,224,224);
  geo.rotateX(-Math.PI/2);
  const pos=geo.getAttribute('position'), rgb=new Float32Array(pos.count*3);
  const grass=new T.Color('#86ad6d'), pale=new T.Color('#b7cc82'), low=new T.Color('#598866');
  const sand=new T.Color('#d3ad79'), stone=new T.Color('#778fa6'), snow=new T.Color('#e2e7eb');
  const c=new T.Color();
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),z=pos.getZ(i);
    const y=terrainHeight(x,z);
    pos.setY(i,y);
    const n=(Math.sin(x*.16+z*.3)*Math.sin(z*.14-x*.17)+Math.sin(z*.61+x*.35)*.13)*.5+.5;
    const gold=T.MathUtils.smoothstep(z,18,43)*.32;
    c.copy(grass).lerp(pale,n*.48+gold).lerp(low,(1-n)*.25);
    for(const district of districtGround) {
      const distance=Math.hypot(x-district.x,z-district.z);
      c.lerp(district.tint,(1-T.MathUtils.smoothstep(distance,district.radius*.25,district.radius+7))*(.38+n*.22));
    }
    const distance=pathDistance(x,z)+Math.sin(x*1.44)*.15+Math.cos(z*1.4+x)*.15;
    c.lerp(sand,(1-T.MathUtils.smoothstep(distance,.84,1.95))*.87);
    const d=lakeValue(x,z);
    c.lerp(sand,(1-T.MathUtils.smoothstep(Math.abs(d-.99),.045,.15))*.69);
    c.lerp(stone,T.MathUtils.smoothstep(y,5,19)*.94);
    c.lerp(snow,T.MathUtils.smoothstep(y+Math.sin(x*.61)*1.25+Math.sin(z*.59)*1.25,19,27));
    c.multiplyScalar(.95+Math.sin(x*13+z*29)*.029);
    c.toArray(rgb,i*3);
  }
  geo.setAttribute('color',new T.BufferAttribute(rgb,3));
  geo.computeVertexNormals();
  const mesh=new T.Mesh(geo,celMaterial('#ffffff',{vertexColors:true,map:groundTexture()}));
  mesh.receiveShadow=true;
  scene.add(mesh);
  return mesh;
}

function groundTexture() {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=128;
  const ctx=canvas.getContext('2d'), rand=seeded(819);
  ctx.fillStyle='#f6f3e8';ctx.fillRect(0,0,128,128);
  for(let i=0;i<1500;i++){
    const x=rand()*128,y=rand()*128;
    ctx.fillStyle=i%3===0?'#b8bd9d36':'#fff8dd75';
    ctx.fillRect(x,y,.5+rand()*2,.5+rand()*2.7);
  }
  const texture=new T.CanvasTexture(canvas);
  texture.colorSpace=T.SRGBColorSpace;
  texture.wrapS=texture.wrapT=T.RepeatWrapping;
  texture.repeat.set(63,63);
  return texture;
}

export function sky(scene,theme={}) {
  const g=new T.SphereGeometry(190,36,20);
  const lighting={value:1};
  const night=[new T.Color('#161f44'),new T.Color('#26375e'),new T.Color('#5f5d83')];
  const daylight=(theme.colors??['#65b4e6','#add9e9','#ffe5ba']).map(color=>new T.Color(color));
  const dusk=[new T.Color('#62689a'),new T.Color('#ab81a7'),new T.Color('#f5aa87')];
  const sun=new T.Vector3(),moon=new T.Vector3();
  const darkness={value:0},twilight={value:0},shimmer={value:0};
  const m=new T.ShaderMaterial({
    side:T.BackSide, depthWrite:false,
    uniforms:{high:{value:daylight[0].clone()},middle:{value:daylight[1].clone()},
      horizon:{value:daylight[2].clone()},lighting,darkness,twilight,shimmer,sun:{value:sun},moon:{value:moon}},
    vertexShader:'varying vec3 vDir; void main(){vDir=position;gl_Position=projectionMatrix*vec4(mat3(viewMatrix)*position,1.);}',
    fragmentShader:`varying vec3 vDir; uniform vec3 high,middle,horizon,sun,moon; uniform float lighting,darkness,twilight;
      float rnd(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      ${celestialFragment}
      void main(){
        vec3 d=normalize(vDir);
        vec3 color=mix(horizon,middle,smoothstep(-.07,.22,d.y));
        color=mix(color,high,smoothstep(.12,.65,d.y));
        float sunDot=dot(d,sun);
        float sunset=pow(max(sunDot,0.),8.)*twilight;
        color=mix(color,vec3(1.,.37,.19),sunset*.37);
        color+=vec3(1.,.64,.29)*pow(max(sunDot,0.),42.)*(lighting*.14+twilight*.34);
        color+=vec3(1.,.75,.39)*smoothstep(.99972,.99990,sunDot)*max(lighting,twilight);
        if(darkness>.005){
          float fade=darkness*smoothstep(.012,.21,d.y);
          float halo=pow(max(dot(d,moon),0.),82.);
          float disc=smoothstep(.99967,.99981,dot(d,moon));
          float crescent=disc*(1.-smoothstep(.99964,.99977,dot(d,normalize(moon+vec3(.013,.009,.001)))));
          float nebula=pow(max(0.,1.-abs(dot(d,normalize(vec3(-.41,.67,.37))))),9.);
          color+=mix(vec3(.063,.022,.112),vec3(.024,.089,.130),smoothstep(-.5,.48,d.x))*nebula*fade*.39;
          color+=starField(d)*fade;
          color+=planet(d,normalize(vec3(.13,.378,-.916)),vec3(.93,.54,.60),vec3(.23,.082,.24),.032,-.40,true)*fade;
          color+=planet(d,normalize(vec3(-.31,.36,-.88)),vec3(.46,.91,.92),vec3(.055,.20,.28),.023,.30,false)*fade;
          color+=planet(d,normalize(vec3(.73,.35,.60)),vec3(1.,.75,.39),vec3(.29,.11,.15),.029,0.,false)*fade;
          color+=vec3(.68,.83,1.)*(halo*darkness*.17+crescent*darkness*.93);
        }
        gl_FragColor=vec4(color,1.);
        #include <colorspace_fragment>
      }`
  });
  const sk=new T.Mesh(g,m);
  sk.renderOrder=-20; scene.add(sk);
  sk.onBeforeRender=()=>{shimmer.value=(performance.now()*.001)%900;};
  const rand=seeded(11);
  const cloudGeo = new T.SphereGeometry(1,18,12);
  const cloudM=new T.MeshLambertMaterial({color:'#fff0df',emissive:'#9c9bb0',emissiveIntensity:.35,fog:false});
  const cloud=new T.InstancedMesh(cloudGeo,cloudM,49);
  const dummy=new T.Object3D();
  for(let i=0;i<7;i++){
    const x=-132+i*40, z=-100-rand()*26, y=20+rand()*13;
    for(let j=0;j<7;j++){
      dummy.position.set(x+j*2.8+rand()*4,y+Math.sin(j*.55)*4+rand()*2,z+rand()*7);
      dummy.scale.set(4+rand()*6,1.2+rand()*3.3,3+rand()*4);
      dummy.updateMatrix(); cloud.setMatrixAt(i*7+j,dummy.matrix);
    }
  }
  scene.add(cloud);
  const rainbow=new T.Mesh(new T.RingGeometry(30,34.3,128,1,0,Math.PI),new T.ShaderMaterial({
    side:T.DoubleSide,transparent:true,depthWrite:false,uniforms:{lighting},
    vertexShader:'varying vec2 p; void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 p; uniform float lighting; void main(){
      float f=(length(p)-30.)/4.3; vec3 c=mix(vec3(.60,.47,1.),vec3(.40,.88,1.),smoothstep(.0,.36,f));
      c=mix(c,vec3(.95,1.,.49),smoothstep(.34,.65,f)); c=mix(c,vec3(1.,.47,.52),smoothstep(.63,1.,f));
      float a=smoothstep(0.,.09,f)*(1.-smoothstep(.87,1.,f))*smoothstep(3.,13.,p.y)*.49*lighting;
      gl_FragColor=vec4(c,a);
      #include <colorspace_fragment>
      }`
  }));
  if(theme.rainbow!==false){rainbow.position.set(6,2,-68);rainbow.scale.setScalar(.84);scene.add(rainbow);}
  const cloudDay=new T.Color('#fff0df'),cloudNight=new T.Color('#7379a5'),cloudDusk=new T.Color('#e4a4af');
  const updates=['high','middle','horizon'];
  return (day,t)=>{
    const light=skyLight(t);
    lighting.value=day;darkness.value=light.night;twilight.value=light.twilight;
    sunDirection(t,sun);
    const drift=(t>=18?t-22:t+2)*.038;
    moon.set(-.37+drift,.19+Math.cos(drift*3)*.055,-.91).normalize();
    for(const [i,layer] of updates.entries())
      m.uniforms[layer].value.copy(night[i]).lerp(daylight[i],day).lerp(dusk[i],light.twilight);
    cloudM.color.copy(cloudNight).lerp(cloudDay,day).lerp(cloudDusk,light.twilight*.75);
    cloudM.emissiveIntensity=.08+day*.24+light.twilight*.11;
  };
}

function cottage(parent, [x,z,rotation,roof,wall,s]) {
  const g=new T.Group(); parent.add(g);
  g.position.set(x,terrainHeight(x,z)-.18,z); g.rotation.y=rotation; g.scale.setScalar(s);
  const wood='#936751',trim='#eab780',shingle=new T.Color(roof);
  const box=(color,x,y,z,a,b,c,rx=0,ry=0,rz=0)=>part(g,'cube',color,x,y,z,a,b,c,rx,ry,rz);
  box('#b4a09a',0,.18,0,5.55,.52,4.94);
  box(wall,0,1.7,0,5.2,2.82,4.52);
  const face=new T.Shape().moveTo(-2.6,0).lineTo(2.6,0).lineTo(0,2.05).closePath();
  for(const side of [-1,1]){
    const end=new T.Mesh(new T.ShapeGeometry(face),material(wall)); end.position.set(0,3.1,side*2.277); end.rotation.y=side===1?0:Math.PI; g.add(end);
    box(wood,0,3.06,side*2.29,5.35,.18,.12);
    for(const i of [-1,1]) box(wood,i*1.304,4.11,side*2.31,3.38,.19,.18,0,0,i*-.664);
  }
  for(const side of [-1,1]) {
    box(roof,side*1.4,4.04,0,3.67,.2,5.47,0,0,-side*.666);
    for(let col=0;col<7;col++) for(let row=0;row<10;row++){
      const dx=.18+col*.448;
      const hex='#'+shingle.clone().multiplyScalar(.92+((row*9+col*5)%7)*.032).getHexString();
      box(hex,dx*side,5.285-dx*.78,-2.46+row*.55,.61,.105,.56,0,0,-side*.666);
    }
    for(const zz of [-2.33,2.33]) box(wood,side*2.53,1.63,zz,.205,2.91,.17);
    box(wood,side*2.64,1.09,0,.13,.14,4.67);
    box(wood,side*2.64,2.8,0,.13,.16,4.67);
  }
  box(trim,0,5.25,0,.2,.17,5.66);
  box('#af8178',1.58,4.69,-.98,.59,1.49,.65);
  for(const y of [4.52,4.81,5.1]) box('#d1a18b',1.58,y,-.98,.62,.06,.676);
  box('#946d70',1.58,5.45,-.98,.74,.18,.77);
  box(wood,0,.997,2.34,1.2,1.81,.23);
  part(g,'sphere',wood,0,1.89,2.344,.59,.49,.115);
  box('#aa774e',0,.97,2.467,.92,1.65,.12);
  part(g,'sphere','#aa774e',0,1.75,2.486,.46,.413,.103);
  for(const bx of [-.3,-.1,.1,.3]) box('#c7986e',bx,.89,2.541,.021,1.31,.015);
  part(g,'sphere','#f7cc78',.272,1.03,2.58,.069,.069,.048);
  const glass=material('#ffd891',{emissive:'#ffbb68',emissiveIntensity:.24});
  for(const wx of [-1.65,1.65]) {
    box(wood,wx,1.93,2.329,1.02,1.11,.14);
    box(glass,wx,1.94,2.428,.79,.87,.05);
    box(trim,wx,1.94,2.464,.077,.87,.042);
    box(trim,wx,1.94,2.466,.79,.071,.042);
    box(wood,wx,1.41,2.46,1.11,.13,.26);
    box('#a97660',wx,1.31,2.52,.97,.24,.32);
    for(let i=0;i<6;i++) part(g,'sphere',i%2?'#d8839d':'#9bb778',wx+(i-2.5)*.146,1.47+(i%2)*.066,2.59,.12,.112,.093);
  }
  part(g,'cyl',wood,0,4.1,2.296,.43,.14,.43,Math.PI/2);
  part(g,'cyl',glass,0,4.1,2.383,.32,.05,.32,Math.PI/2);
  box(trim,0,4.1,2.42,.059,.58,.037); box(trim,0,4.1,2.42,.59,.059,.037);
  box('#998c85',0,.11,2.91,1.91,.22,.67);
  box('#b0a18e',0,.22,2.62,1.76,.2,.43);
  return g;
}

function tree(parent,x,z,scale,tone,pine,rand) {
  const g=new T.Group(); parent.add(g);
  g.position.set(x,terrainHeight(x,z)-.13,z); g.scale.setScalar(scale);
  g.rotation.y=rand()*tau;
  if(pine) {
    branch(g,'#796958',[0,0,0],[.06,5.2,0],.23);
    for(let i=0;i<4;i++){
      const y=1.76+i*.93;
      const mesh=part(g,'cone',tone[i%tone.length],0,y,0,1.45-i*.237,2.3-i*.16,1.48-i*.25,0,i*.21);
      mesh.castShadow=scale>1;
    }
  } else {
    const brown='#8c655a';
    branch(g,brown,[0,0,0],[.1,2.65,.035],.33);
    branch(g,brown,[.1,2.25,.035],[-.22,4.18,-.03],.24,true);
    for(let i=0;i<6;i++){
      const a=i*2.399+rand()*.3,d=.63+rand()*.9;
      const ex=Math.cos(a)*d,ez=Math.sin(a)*d,y=3.44+rand()*1.28;
      branch(g,brown,[.09,2.17+rand()*.48,0],[ex,y,ez],.15,true);
      part(g,'soft',tone[i%tone.length],ex,y,ez,1.15+rand()*.53,.77+rand()*.39,1.02+rand()*.42,0,a);
      part(g,'soft',tone[(i+1)%tone.length],ex*1.22,y+.3,ez*1.2,.66,.59,.63).castShadow=false;
    }
    part(g,'soft',tone[2],-.22,4.7,.27,1.28,.92,1.2);
    for(let i=0;i<11;i++){
      const angle=i*2.399, r=1.35+rand()*.84, yy=3.63+rand()*1.4;
      const size=.25+rand()*.39;
      part(g,'low',tone[(i+2)%tone.length],Math.cos(angle)*r,yy,Math.sin(angle)*r,size,size*.7,size*.89,0,angle).castShadow=false;
    }
    for(let i=0;i<5;i++){
      const a=i*2.399;
      const slash=part(g,'low','#996f62',Math.cos(a)*.295,.47+i*.33,Math.sin(a)*.295,.15,.033,.064,0,-a,.3);
      slash.castShadow=false;
    }
    for(const a of [0,2.1,4.2]) branch(g,brown,[0,.46,0],[Math.cos(a)*.64,.04,Math.sin(a)*.64],.11,true);
  }
}

function flower(parent,x,z,h,petal,rand) {
  const y=terrainHeight(x,z);
  const bend=rand()*.18-.09;
  const cast=Math.hypot(x,z-3)<19;
  branch(parent,'#658d53',[x,y,z],[x+bend,y+h,z],.02).castShadow=cast;
  part(parent,'low','#83a459',x-.05,y+h*.44,z,.108,.04,.055,0,0,-.49).castShadow=cast;
  for(let i=0;i<5;i++){
    const a=i*tau/5;
    part(parent,'low',petal,x+bend+Math.cos(a)*h*.23,y+h,z+Math.sin(a)*h*.23,h*.23,h*.106,h*.18,0,-a).castShadow=cast;
  }
  part(parent,'low','#f9d784',x+bend,y+h+.028,z,h*.13,h*.1,h*.13).castShadow=cast;
}

function grass(parent,rand) {
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute([-.08,0,0,.08,0,0,.055,.34,0,-.043,0,.055,.055,0,.093,-.11,.265,.04,-.058,0,-.043,.058,0,-.07,.13,.235,-.11],3));
  geo.computeVertexNormals();
  const count=23000, blade=new T.InstancedMesh(geo,new T.MeshLambertMaterial({color:'white',side:T.DoubleSide}),count);
  const dummy=new T.Object3D();
  let i=0;
  const colors=['#8ea761','#71965b','#a8b96f','#9bbd74','#c3c486'];
  for(let n=0;n<count*2&&i<count;n++) {
    const near=n<count*.47;
    const x=(rand()-.5)*(near?45:175), z=(rand()-.49)*(near?52:169);
    const y=terrainHeight(x,z);
    const path=pathDistance(x,z);
    if(cottageGarden(x,z)||path<1.45 || lakeValue(x,z)<1.04 || y>13 || !walkable(x,z)) continue;
    const s=.5+rand()*1.13;
    dummy.position.set(x,y-.012,z); dummy.rotation.y=rand()*tau;
    dummy.scale.set(s,s*(.7+rand()*.6),s);
    dummy.updateMatrix(); blade.setMatrixAt(i,dummy.matrix);
    blade.setColorAt(i,new T.Color(colors[Math.floor(rand()*colors.length)])); i++;
  }
  blade.count=i;
  parent.add(blade);
}

export function batchStatic(scene,source) {
  source.updateMatrixWorld(true);
  const sets=new Map();
  source.traverse((mesh)=>{
    if (!mesh.isMesh) return;
    const key=mesh.geometry.id+':'+mesh.material.id+':'+mesh.castShadow;
    if(!sets.has(key)) sets.set(key,{geometry:mesh.geometry, mat:mesh.material, matrices:[], shadow:false});
    const set=sets.get(key);
    set.shadow ||= mesh.castShadow;
    set.matrices.push(mesh.matrixWorld.clone());
  });
  for(const {geometry,mat,matrices,shadow} of sets.values()) {
    const instance=new T.InstancedMesh(geometry,mat,matrices.length);
    for(let i=0;i<matrices.length;i++) instance.setMatrixAt(i,matrices[i]);
    instance.castShadow=shadow; instance.receiveShadow=true; scene.add(instance);
  }
}

function water(scene) {
  const g=new T.CircleGeometry(1,108);
  g.rotateX(-Math.PI/2);
  const time={value:0};
  const liquid=new T.ShaderMaterial({
    side:T.DoubleSide,
    uniforms:{time,sea:{value:new T.Color('#4dabb2')},foam:{value:new T.Color('#ceeece')},light:{value:new T.Color('#79cfc1')}},
    vertexShader:`varying vec2 uvw; varying vec3 pw;
      void main(){uvw=uv*2.-1.; pw=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(pw,1.);}`,
    fragmentShader:`varying vec2 uvw; varying vec3 pw; uniform float time; uniform vec3 sea,foam,light;
      void main() {
        float r=length(uvw);
        float f=sin(pw.z*2.5+sin(pw.x*.78+time*.5)*1.6+time*1.75);
        float f2=sin(pw.x*1.8+pw.z*.83+time*.82)*cos(pw.z*1.63-time*.53);
        float thin=pow(max(0.,f*.72+f2*.28),13.);
        float banks=smoothstep(.79,1.,r);
        vec3 col=mix(sea,light,banks*.64+f*.065+f2*.11);
        col=mix(col,foam,thin*.37+smoothstep(.96,.992,r+sin(atan(uvw.y,uvw.x)*25.+time)*.023)*.27);
        col=mix(col,vec3(.68,.78,.76),smoothstep(44.,100.,distance(pw,cameraPosition))*.5);
        gl_FragColor=vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const mesh=new T.Mesh(g,liquid);
  mesh.position.set(lake.x,-.43,lake.z); mesh.scale.set(13,1,13.8);
  scene.add(mesh);
  const waterfall=new T.ShaderMaterial({
    side:T.DoubleSide,transparent:true,depthWrite:false,uniforms:{time},
    vertexShader:'varying vec2 p; void main(){p=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 p; uniform float time; void main(){
      float a=sin(p.x*58.+sin(p.y*7.+time*3.)*.8)*.15+sin(p.x*143.)*.07;
      float v=sin(p.y*23.+time*8.+p.x*12.)*.08;
      float mask=smoothstep(0.,.13,p.x)*(1.-smoothstep(.84,1.,p.x));
      gl_FragColor=vec4(.62+a+v,.89+a*.3,1.,mask*(.78+a));
      #include <colorspace_fragment>
    }`
  });
  const falls=new T.Mesh(new T.PlaneGeometry(2.9,7.5),waterfall);
  falls.position.set(31.1,3.29,-21.3); falls.rotation.y=-.36; scene.add(falls);
  const foamRings=new T.Group();scene.add(foamRings);
  for(let i=0;i<4;i++){
    const ring=new T.Mesh(new T.RingGeometry(.93,1,52).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:'#dbf5e6',transparent:true,depthWrite:false,opacity:.3,side:T.DoubleSide}));
    ring.position.set(31.05,-.412+i*.001,-21.26);foamRings.add(ring);
  }
  return {time,update(t){
    for(let i=0;i<foamRings.children.length;i++){
      const ring=foamRings.children[i],phase=(t*.48+i*.25)%1;
      ring.scale.set(1.02+phase*2.3,1,.28+phase*.73);
      ring.material.opacity=Math.sin(phase*Math.PI)*.31;
    }
  }};
}

export function resourceModel(type, variation=0) {
  const g=new T.Group();
  if(type==='wood') {
    for(let i=0;i<3;i++){
      const x=(i-1)*.16;
      branch(g,'#a77b51',[x-.21,.08,.26],[x+.22,.16,-.24],.085);
      part(g,'cyl','#ebbf82',x-.22,.079,.27,.08,.022,.08,1.24,0,.63);
    }
  } else if(type==='stone') {
    for(let i=0;i<3;i++) part(g,'diamond',i%2?'#aaa5af':'#9c9fb0',i*.16-.15,.14+i*.026,Math.sin(i*3)*.14,.27-i*.042,.22-i*.022,.25-i*.026,0,i*.8,.3);
  } else if(type==='petal') {
    for(let i=0;i<5;i++){
      const a=i*tau/5;
      part(g,'fine','#f3a3c2',Math.cos(a)*.19,.24,Math.sin(a)*.19,.21,.099,.14,0,-a);
    }
    branch(g,'#74935c',[.07,0,0],[0,.23,0],.045);
    part(g,'sphere','#ffdc81',0,.279,0,.12,.08,.12);
  } else if(type==='berry') {
    part(g,'fine','#70a475',0,.24,0,.43,.3,.34);
    for(let i=0;i<5;i++){
      const a=i*tau/5;
      part(g,'fine','#ef8e69',Math.cos(a)*.27,.37+(i%2)*.14,Math.sin(a)*.235,.104,.114,.105);
      part(g,'sphere','#ffbd87',Math.cos(a)*.28-.026,.41+(i%2)*.14,Math.sin(a)*.235+.074,.041,.031,.022);
    }
  } else if(nativePalette[type]) {
    const [color,accent]=nativePalette[type];
    for(let i=0;i<3;i++){
      const angle=i*tau/3;
      const x=Math.cos(angle)*.17,z=Math.sin(angle)*.17,h=.25+i*.105;
      if(type==='spore') {
        part(g,'cyl',accent,x,h*.4,z,.042,h*.8,.043);
        part(g,'fine',color,x,h,z,.128,.069,.127,0,0,.16);
        part(g,'sphere',accent,x-.036,h+.058,z+.027,.025,.018,.025);
      } else if(type==='shell'||type==='jade') {
        part(g,type==='jade'?'diamond':'fine',color,x,h*.53,z,.127,h*.53,.137,.37,angle,.19);
        part(g,'fine',accent,x+.021,h*.62,z+.08,.064,.039,.027,.25,angle,.3);
      } else if(type==='honey') {
        part(g,'fine',color,x,h*.59,z,.13,.129,.129);
        part(g,'cyl',accent,x,h*.86,z,.143,.032,.143);
      } else {
        branch(g,'#6a956c',[x*.6,0,z*.6],[x,h,z],.023);
        part(g,type==='ribbon'?'diamond':'fine',color,x+.05,h,z,.125,.059,.058,0,angle,.27);
        part(g,'sphere',accent,x+.08,h-.019,z+.016,.049,.081,.046,0,angle,.2);
      }
    }
  } else {
    for(let i=0;i<4;i++){
      const color=['#ac91ef','#bda5ed','#8bd9dd'][i%3];
      part(g,'diamond',material(color,{emissive:color,emissiveIntensity:.19,roughness:.38}),i*.16-.23,.35-i*.055,i%2*.16,.133,.42-i*.064,.125,i*.16,variation,i*.2-.2);
    }
  }
  return g;
}

function districtLandmarks(parent, scene, blockers) {
  const flyingKites=[];
  const ring=new T.TorusGeometry(1,.065,8,36);
  function hoop(group,color,x,y,z,r,tilt=0) {
    const mesh=new T.Mesh(ring,material(color));
    mesh.position.set(x,y,z);
    mesh.scale.setScalar(r);
    mesh.rotation.x=tilt;
    mesh.castShadow=true;
    group.add(mesh);
  }
  function anchor(x,z,r) {
    const group=new T.Group();
    group.position.set(x,terrainHeight(x,z),z);
    parent.add(group);
    if(r) blockers.push([x,z,r]);
    return group;
  }
  for(const [x,z,size] of [[-58,-41,2.25],[-59,-43,1.4],[-53,-39,1.32],[-61,-34,1.64],[-51,-43,1.21],[-56,-31,.77]]){
    const g=anchor(x,z,.29*size);
    part(g,'fine','#efd6ad',0,.95*size,0,.27*size,1.03*size,.26*size,0,0,.13);
    part(g,'fine','#c66c67',-.15*size,1.93*size,0,1.18*size,.53*size,1.08*size,0,0,.13);
    part(g,'fine','#fac589',-.15*size,1.77*size,0,1.09*size,.13*size,.96*size,0,0,.13);
    for(let i=0;i<12;i++){
      const a=i*2.4,r=(.27+i%4*.15)*size;
      part(g,'fine','#ffe2ae',-.15*size+Math.cos(a)*r,(1.94+.53*Math.sqrt(1-(r/size)**2))*size,Math.sin(a)*r,.092*size,.037*size,.077*size);
    }
  }
  for(const [x,z,size] of [[-22,-52,1.32],[-13,-53,1],[-19,-58,1.16]]){
    const g=anchor(x,z,.48*size);
    g.scale.setScalar(size);
    branch(g,'#776459',[0,0,0],[.36,3.8,0],.42);
    for(let i=0;i<11;i++){
      const a=i*2.4,r=1.2+i%3*.42;
      const dx=Math.cos(a)*r,dz=Math.sin(a)*r,y=3.25+i%4*.26;
      branch(g,'#927d66',[.16,2.4,0],[dx,y,dz],.11);
      part(g,'fine',i%2?'#8cb99b':'#72a488',dx,y-.54,dz,.67,1.43,.75,.09,a,.22);
      if(i%2) part(g,'diamond','#f7dca0',dx,y-1.73,dz,.081,.167,.081,a);
    }
  }
  for(const [x,z,size] of [[10,-52,1.6],[13,-53,1.06],[7,-53,.84]]){
    const g=anchor(x,z,.66*size);
    g.scale.setScalar(size);
    part(g,'cyl','#9aa5c3',0,.29,0,.69,.58,.69);
    for(const sign of [-1,1]) part(g,'cyl','#d4d6e7',sign*.53,1.18,0,.15,2.3,.15,0,0,sign*-.10);
    hoop(g,'#b5b7dc',0,2.11,0,.64);
    part(g,'cone','#e8b879',0,1.93,0,.33,.5,.32,Math.PI);
    part(g,'sphere','#fcdfa5',0,1.64,0,.119,.118,.119);
  }
  const court=anchor(61,7,0);
  part(court,'cyl','#f0d7ad',0,-.22,0,4,.62,4);
  part(court,'cyl','#95cbca',0,.111,0,3.51,.065,3.51);
  for(let i=0;i<14;i++) {
    const a=i*tau/14,x=Math.cos(a)*3.45,z=Math.sin(a)*3.45;
    part(court,'fine','#f4e6ce',x,.16,z,.36,.088,.23,0,-a);
  }
  for(const [x,z] of [[59,6],[64,8],[62,12]]) {
    const g=anchor(x,z,.64);
    part(g,'cyl','#e6bdad',0,.35,0,.57,.69,.57);
    for(let i=-3;i<=3;i++) part(g,'fine',i%2?'#ffede0':'#efb1b4',i*.235,1.13+Math.cos(i*.37)*.31,0,.181,.81,.22,0,0,-i*.24);
    part(g,'sphere','#fbf3cf',0,.92,.28,.245,.246,.247);
  }
  for(const [x,z,i] of [[43,33,0],[45,32,1],[43,36,2],[46,33,3],[39,36,4],[41,37,5]]){
    const g=anchor(x,z,.44);
    g.rotation.y=i*.41;
    part(g,'cube','#8b6658',0,.28,0,.68,.56,.62);
    for(let j=0;j<5;j++) part(g,'cyl',j%2?'#eec684':'#f6d58b',0,.58+j*.18,0,.61-j*j*.015,.17,.53-j*j*.015);
    part(g,'cone','#c88663',0,1.55,0,.61,.52,.61,0,Math.PI/4);
    part(g,'cube','#543e49',0,.74,.52,.21,.095,.04);
  }
  for(const [x,z,i] of [[15,63,0],[18,62,1],[14,66,2],[22,66,3],[12,62,4]]){
    const g=new T.Group();
    g.position.set(x,terrainHeight(x,z),z);
    scene.add(g);
    blockers.push([x,z,.14]);
    flyingKites.push(g);
    const h=3.3+i%3*.82,d=i%2?1:-1,a=i*.45;
    g.rotation.y=a;
    branch(g,'#8f7166',[0,0,0],[0,1.45,0],.037);
    branch(g,'#e6d6b1',[0,1.35,0],[d*1.54,h,0],.018);
    part(g,'diamond',['#efaf76','#ce86b9','#869bd7'][i%3],d*1.54,h,0,.76,1,.051,0,0,d*.32);
    branch(g,'#f6d8ab',[d*.79,h-.23,.058],[d*2.12,h+.22,.058],.019);
    for(let j=0;j<6;j++) part(g,'fine',j%2?'#f4c68b':'#da93bd',d*(1.25-j*.115),h-.92-j*.24,0,.147,.046,.062,0,0,d*.44);
  }
  for(const [x,z,r] of [[-27,63,2.2],[-24,61,1.17],[-29,67,1.42]]){
    const g=anchor(x,z,r*.86);
    part(g,'fine','#84ab9c',0,.21,0,r,.43,r*.72);
    part(g,'fine','#64bab8',0,.535,0,r*.88,.14,r*.63);
    hoop(g,'#b1e0c7',0,.625,0,r*.65,Math.PI/2);
    for(let j=0;j<10;j++){
      const a=j*tau/10;
      part(g,'low',j%2?'#a5ba98':'#d9cfa1',Math.cos(a)*r*.99,.321,Math.sin(a)*r*.72,.33,.28,.30,0,a);
    }
  }
  const firelight=celMaterial('#ffe69f',{emissive:'#ffd879',emissiveIntensity:.54});
  for(const [x,z,i] of [[-55,29,0],[-58,30,1],[-57,34,2],[-53,34,3],[-58,26,4],[-61,29,5],[-55,33,6],[-51,28,7]]){
    const g=anchor(x,z,.15);
    const h=1.05+i%4*.39;
    branch(g,'#657f7b',[0,0,0],[.21,h,0],.06);
    hoop(g,'#7674a0',.2,h+.02,0,.127);
    part(g,'fine','#a29acb',.2,h+.24,0,.18,.233,.178,0,0,.1);
    part(g,'diamond',firelight,.22,h+.258,.12,.083,.117,.082);
    part(g,'cyl','#766e8b',.19,h+.447,0,.144,.08,.14);
    for(let j=0;j<3;j++) part(g,'sphere',firelight,Math.cos(j*2.4)*.56,h+.37+j*.132,Math.sin(j*2.4)*.62,.038,.033,.038);
  }

  const marsh=newRegions.moon;
  const fireflyCount=48, positions=new Float32Array(fireflyCount*3), colors=new Float32Array(fireflyCount*3);
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.BufferAttribute(positions,3));
  geometry.setAttribute('color',new T.BufferAttribute(colors,3));
  const lanternColor=new T.Color('#ffe3a0');
  const fireflies=new T.Points(geometry,new T.PointsMaterial({
    size:.15,vertexColors:true,transparent:true,opacity:.92,depthWrite:false,blending:T.AdditiveBlending
  }));
  fireflies.frustumCulled=false;
  scene.add(fireflies);
  const rand=seeded(132);
  const homes=Array.from({length:fireflyCount},()=>{
    const x=marsh.x+(rand()-.5)*17,z=marsh.z+(rand()-.5)*14;
    return [x,terrainHeight(x,z)+.35+rand()*1.72,z,rand()*tau];
  });

  return (t,player,time)=>{
    const kitewind=newRegions.kite;
    const seeKites=Math.hypot(player.x-kitewind.x,player.z-kitewind.z)<48;
    flyingKites.forEach((kite,i)=>{
      kite.visible=seeKites;
      if(seeKites) {
        kite.rotation.z=Math.sin(t*1.7+i*2.1)*.09;
        kite.rotation.x=Math.cos(t*1.12+i)*.05;
      }
    });
    const dark=1-T.MathUtils.smoothstep(Math.sin((time-6)*Math.PI/12),-.15,.32);
    fireflies.visible=dark>.04&&Math.hypot(player.x-marsh.x,player.z-marsh.z)<38;
    if(!fireflies.visible) return;
    fireflies.material.opacity=dark*.85;
    for(let i=0;i<homes.length;i++){
      const [x,y,z,p]=homes[i];
      const j=i*3;
      positions[j]=x+Math.sin(t*.64+p)*1.23;
      positions[j+1]=y+Math.sin(t*1.04+p)*.37;
      positions[j+2]=z+Math.cos(t*.58+p)*1.14;
      const glow=.18+.82*Math.pow(Math.sin(t*.89+p)*.5+.5,4);
      colors[j]=lanternColor.r*glow;
      colors[j+1]=lanternColor.g*glow;
      colors[j+2]=lanternColor.b*glow;
    }
    geometry.attributes.position.needsUpdate=true;
    geometry.attributes.color.needsUpdate=true;
  };
}

export function populate(scene) {
  const ground=terrain(scene);
  const setDay=sky(scene);
  const trailLights=[[1.9,8],[-3.6,1],[2.3,-7],[-4.2,-13],[2,-20],[-22,-12],[-35,-15],[14,-5],
    [-25,56],[60,10],[-55,32],[13,60],[35,-44],[0,34],[-55,-34],[10,-48],[-17,-51],[43,31]];
  const windows=homes.flatMap(([x,z,yaw,roof,wall,s])=>[-1,1].map(side=>{
    const dx=side*1.64*s,dz=2.52*s;
    return [x+dx*Math.cos(yaw)+dz*Math.sin(yaw),terrainHeight(x,z)+s*1.85,
      z+dz*Math.cos(yaw)-dx*Math.sin(yaw),false];
  }));
  const lightTrails=eveningLights(scene,[...trailLights.map(([x,z])=>[x,terrainHeight(x,z),z]),...windows]);
  const liquid=water(scene);
  const rand=seeded(3721), staticSet=new T.Group(), trunks=[];
  for(const home of homes) cottage(staticSet,home);
  const pink=['#df9eb7','#ecaec7','#f3bed2','#ca8fae','#ffd0d9','#d697b7'];
  const apricot=['#dca877','#edb88f','#f3c7a2','#cf9e80','#ffd5a3'];
  const green=['#729d77','#80ab78','#a8bd83','#80aa85','#92b77d'];
  const ever=['#608d7f','#719e8b','#81a68d','#91b097'];
  const landmarks=[
    [-6.9,4,1.24,pink],[-12,-13,1.66,pink],[-6,-21,1.58,pink],[10,-14,1.26,pink],
    [8,-4,.91,apricot],[-14,5,1.14,apricot],[-18,-9,1.27,pink],[13,5,1.12,green],
    [12,-18,1.03,pink],[20,-26,1.3,green],[-23,-19,1.61,pink],[37,-5,1.14,pink],
    [7,19,1.4,pink],[-5,17,1,green],[-8,-3,.89,green]
  ];
  const discarded=new T.Group();
  function plantTree(x,z,s,tone,conifer){
    if(cottageClearing(x,z)){
      tree(discarded,x,z,s,tone,conifer,rand);discarded.clear();return;
    }
    tree(staticSet,x,z,s,tone,conifer,rand);
    trunks.push([x,z,s*(conifer?.23:.33)+.22]);
  }
  for(const [x,z,s,tone] of landmarks) plantTree(x,z,s,tone,false);
  for(let i=0;i<580;i++){
    const x=(rand()-.5)*180,z=(rand()-.53)*166;
    const y=terrainHeight(x,z);
    if(y>18 || pathDistance(x,z)<3.2 || lakeValue(x,z)<1.15 || !walkable(x,z)) continue;
    if(Math.hypot(x,z*.81)<19 || resourceSpots.some(([,rx,rz])=>Math.hypot(x-rx,z-rz)<1.6)) continue;
    const conifer=z<-30 || Math.abs(x)>53 || rand()<.15;
    plantTree(x,z,.49+rand()*.69,conifer?ever:x<-17?pink:z>24?apricot:green,conifer);
  }
  for(let i=0;i<37;i++) {
    const a=i*tau/37,rad=1.1+rand()*.08;
    const x=lake.x+Math.cos(a)*lake.rx*rad,z=lake.z+Math.sin(a)*lake.rz*rad;
    const s=.25+rand()*1.13;
    part(staticSet,'diamond',i%3?'#9da6ad':'#a8b4a6',x,terrainHeight(x,z)+s*.17,z,s,s*.54,s*.81,rand(),rand()*tau,.23);
    if(i%2) for(let j=0;j<7;j++) {
      const dx=(rand()-.5)*.85,dz=(rand()-.5)*.51,h=.32+rand()*.59;
      const y=terrainHeight(x+dx,z+dz);
      branch(staticSet,'#73935e',[x+dx,y,z+dz],[x+dx+.12,y+h,z+dz-.06],.026);
      part(staticSet,'sphere','#b09170',x+dx+.11,y+h,z+dz-.057,.054,.13,.042);
    }
  }
  for(let i=0;i<25;i++) {
    const x=29.1+rand()*5.2,z=-22.8-rand()*2.5,y=rand()*6.6;
    const s=.7+rand()*2.2;
    part(staticSet,'diamond',i%3?'#849498':'#9faca5',x,y,z,s,s*.89,s*.82,rand(),rand()*tau,.3);
  }
  for(let i=0;i<31;i++) {
    const a=rand()*tau,r=.15+rand()*.76;
    const x=lake.x+Math.cos(a)*radial(r,lake.rx),z=lake.z+Math.sin(a)*radial(r,lake.rz);
    part(staticSet,'cyl','#75a578',x,-.396,z,.25+rand()*.21,.048,.27+rand()*.21);
    if(i%3===0) part(staticSet,'sphere','#eeb3c3',x,-.296,z,.155,.11,.145);
  }
  for(let cluster=0;cluster<9;cluster++){
    const x=34.0+rand()*15.3,z=-56.6+rand()*11.2;
    if(!walkable(x,z)) continue;
    for(let i=0;i<5;i++){
      const a=i*2.399+cluster,h=.53+rand()*1.46,s=.12+h*.19;
      const px=x+Math.cos(a)*(.25+i*.17),pz=z+Math.sin(a)*(.25+i*.17);
      part(staticSet,'diamond',i%3?'#b3a0db':'#8dcdd2',px,terrainHeight(px,pz)+h*.57,pz,s,h,s,Math.sin(a)*.27,a,Math.cos(a)*.26);
    }
  }
  const flowers=['#eb98aa','#ffc58d','#fff2c5','#c5a2dc','#f4b8ce','#eab663'];
  for(let i=0;i<1500;i++){
    const x=(rand()-.5)*112,z=(rand()-.5)*118;
    if(cottageGarden(x,z)||lakeValue(x,z)<1.05 || pathDistance(x,z)<1.5 || !walkable(x,z) || terrainHeight(x,z)>7) continue;
    if(Math.abs(x)>28&&rand()<.42) continue;
    flower(staticSet,x,z,.19+rand()*.49,flowers[i%flowers.length],rand);
  }
  for(let i=0;i<147;i++){
    const z=-19+rand()*34,x=(rand()<.5?-1:1)*(1.95+rand()*5);
    if(pathDistance(x,z)>1.62&&walkable(x,z))
      flower(staticSet,x,z,.33+rand()*.46,flowers[i%flowers.length],rand);
  }
  for(let i=0;i<11;i++){
    const z=-17+i*2.1,x=-4.3+Math.sin(i*.46)*.55,y=terrainHeight(x,z);
    branch(staticSet,'#ae8565',[x,y,z],[x,y+.79,z],.086);
    if(i>0) {
      const zz=z-2.1,xx=-4.3+Math.sin((i-1)*.46)*.55;
      branch(staticSet,'#b78f6b',[x,y+.52,z],[xx,terrainHeight(xx,zz)+.52,zz],.064);
    }
  }
  for(let i=0;i<205;i++){
    const z=-29+rand()*48,x=(rand()-.5)*9+Math.sin(z*.17)*.6;
    const d=pathDistance(x,z);
    if(d<.65||d>1.97||!walkable(x,z)) continue;
    const w=.025+rand()*.103;
    part(staticSet,'low',i%3?'#b5a488':'#d6bc8f',x,terrainHeight(x,z)+.026,z,w,.028+rand()*.037,w*.74,0,rand()*tau).castShadow=false;
  }
  const pier=new T.Group(); staticSet.add(pier); pier.position.set(17.95,terrainHeight(17.95,-4)-.13,-4); pier.rotation.y=-.45;
  for(let i=0;i<12;i++){
    const x=.25+i*.26;
    part(pier,'cube',i%2?'#aa7d62':'#b98c69',x,.24,0,.248,.118,1.49);
    if(i%4===0) for(const z of [-.63,.63]){
      part(pier,'cyl','#886b58',x,.31,z,.092,1.39,.092);
      part(pier,'sphere','#c59c70',x,1.01,z,.105,.07,.105);
    }
  }
  for(const z of [-.63,.63]) part(pier,'cube','#9c735b',1.29,.8,z,2.63,.109,.108);
  const sign=new T.Group(); staticSet.add(sign);
  sign.position.set(-2.3,terrainHeight(-2.3,1),1); sign.rotation.y=.14;
  part(sign,'cube','#957558',0,.86,0,.16,1.8,.16);
  part(sign,'cube','#c49169',0,1.55,.12,1.15,.33,.13,0,0,.08);
  part(sign,'cube','#d4a47b',0,1.18,.12,.85,.27,.13,0,0,-.08);
  for(let i=0;i<4;i++){
    part(sign,'sphere','#f8d792',-.37+i*.2,1.58,.2,.057,.049,.018);
    part(sign,'sphere','#f3d3a0',-.25+i*.15,1.18,.2,.04,.032,.015);
  }
  const updateDistricts=districtLandmarks(staticSet,scene,trunks);
  for(const district of districtGround) {
    const scatter=seeded(Math.abs(district.x*71+district.z*127));
    for(let i=0;i<80;i++){
      const a=scatter()*tau,r=Math.sqrt(scatter())*district.radius*.91;
      const x=district.x+Math.cos(a)*r,z=district.z+Math.sin(a)*r;
      if(!walkable(x,z)||pathDistance(x,z)<1.85) continue;
      flower(staticSet,x,z,.2+scatter()*.38,i%5===0?'#f6d9a7':district.color,scatter);
    }
  }
  const districtPalette={mushroom:'woods',willow:'woods',cloud:'frost',shell:'coast',
    amber:'mesa',kite:'coast',fernbank:'delta',moon:'sky'};
  const clearPlants=(x,z)=>pathDistance(x,z)>1.63&&trunks.every(([px,pz,r])=>Math.hypot(x-px,z-pz)>r+.19);
  const animateDistrictPlants=Object.entries(newRegions).map(([id,place])=>plantHabitats(
    scene,staticSet,districtPalette[id],{
      places:[place],height:terrainHeight,walkable:(x,z)=>walkable(x,z)&&Math.hypot(x-place.x,z-place.z)<place.radius+2
    },clearPlants,[place.travel],true
  ));
  batchStatic(scene,staticSet);
  grass(scene,rand);

  const moteCount=105, motes=new Float32Array(moteCount*3);
  const seeds=Array.from({length:moteCount},()=>[(rand()-.5)*105,rand()*10,(rand()-.47)*96,rand()*tau]);
  const geo=new T.BufferGeometry(); geo.setAttribute('position',new T.BufferAttribute(motes,3));
  const c=document.createElement('canvas'); c.width=c.height=48;
  const ctx=c.getContext('2d'),grad=ctx.createRadialGradient(24,24,1,24,24,23);
  grad.addColorStop(0,'#fff7d0');grad.addColorStop(.23,'#fff1cfeb');grad.addColorStop(1,'#fff1cf00');
  ctx.fillStyle=grad;ctx.fillRect(0,0,48,48);
  const texture=new T.CanvasTexture(c);
  const stars=new T.Points(geo,new T.PointsMaterial({map:texture,color:'#fff4d1',size:.31,transparent:true,opacity:.77,depthWrite:false}));
  stars.frustumCulled=false; scene.add(stars);
  return {ground,setDay,isClear:(x,z)=>trunks.every(([px,pz,r])=>(x-px)**2+(z-pz)**2>r*r),update(t,player,time){
    updateDistricts(t,player,time);
    lightTrails(time,player);
    for(const animatePlants of animateDistrictPlants) animatePlants(t);
    liquid.time.value=t;liquid.update(t);
    for(let i=0;i<seeds.length;i++){
      const [x,y,z,p]=seeds[i];
      motes[i*3]=x+Math.sin(p+t*.37)*1.6;
      motes[i*3+1]=y+Math.sin(p+t*.63)*.85+.6;
      motes[i*3+2]=z+Math.cos(p+t*.29)*1.3;
    }
    geo.attributes.position.needsUpdate=true;
  }};
}

function radial(r,n){return r*n;}









