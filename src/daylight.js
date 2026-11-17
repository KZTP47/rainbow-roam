import * as T from 'three';
import {part,branch,material} from './models.js';
import {celMaterial} from './cel.js';

const TAU=Math.PI*2;
const {smoothstep}=T.MathUtils;
export function skyLight(time){
  const phase=(time-6)*TAU/24;
  const altitude=Math.sin(phase);
  const day=smoothstep(altitude,-.15,.24);
  return {phase,altitude,day,night:1-smoothstep(altitude,-.32,.01),
    twilight:(1-smoothstep(Math.abs(altitude-.015),.015,.37))*.92};
}

export function sunDirection(time,out=new T.Vector3()){
  const phase=(time-6)*TAU/24;
  return out.set(-Math.cos(phase)*.81,Math.sin(phase)*.84,-.56).normalize();
}

export const celestialFragment = `
  uniform float shimmer;
  vec3 starField(vec3 ray){
    vec2 coord=vec2(atan(ray.z,ray.x),asin(ray.y))*115.;
    vec2 cell=floor(coord);
    float hash=rnd(cell);
    vec2 center=vec2(rnd(cell+1.),rnd(cell-2.))*.58+.21;
    vec2 fromCenter=abs(fract(coord)-center);
    float size=mix(.045,.127,rnd(cell+5.));
    float core=1.-smoothstep(size*.19,size,length(fromCenter));
    float flare=0.;
    if(hash>.988){
      float width=.046+.013*cos(shimmer+hash*45.);
      vec2 glow=exp(-fromCenter*vec2(8.3,8.3));
      flare=(glow.x*(1.-smoothstep(.005,width,fromCenter.y))+
        glow.y*(1.-smoothstep(.005,width,fromCenter.x)))*.55;
    }
    float hue=rnd(cell-3.);
    vec3 tint=mix(vec3(.41,.94,1.),vec3(.75,.51,1.),smoothstep(.10,.53,hue));
    tint=mix(tint,vec3(1.,.61,.44),smoothstep(.61,.86,hue));
    tint=mix(tint,vec3(1.,.88,.56),smoothstep(.89,1.,hue));
    float twinkle=.52+.48*pow(.5+.5*sin(shimmer*(1.55+hash*1.23)+hue*45.),2.);
    return (tint*(core*.83+flare)+vec3(.16)*core)*twinkle*step(.935,hash);
  }
  vec3 planet(vec3 ray,vec3 center,vec3 bright,vec3 dark,float radius,float tilt,bool rings){
    if(dot(ray,center)<.984) return vec3(0.);
    vec3 right=normalize(cross(vec3(0.,1.,0.),center));
    vec3 vertical=cross(center,right);
    vec2 xy=vec2(dot(ray,right),dot(ray,vertical))/radius;
    float distance=length(xy);
    float edge=1.-smoothstep(.954,1.026,distance);
    float halo=exp(-2.4*distance)*.42;
    vec3 surface=vec3(xy,sqrt(max(0.,1.-dot(xy,xy))));
    float daylight=max(.08,dot(surface,normalize(vec3(-.56,.43,.66))));
    float belt=sin(xy.y*16.+xy.x*1.7)+.45*cos(xy.y*38.-xy.x*2.);
    vec3 shaded=mix(dark,bright,clamp(.48+daylight*.48+belt*.085,0.,1.));
    float ringGlow=0.;
    if(rings){
      vec2 ringXY=mat2(cos(tilt),sin(tilt),-sin(tilt),cos(tilt))*xy;
      float band=length(ringXY*vec2(1.,3.36));
      float outerBand=smoothstep(1.61,1.67,band)*(1.-smoothstep(1.95,2.02,band));
      float innerBand=smoothstep(1.23,1.32,band)*(1.-smoothstep(1.53,1.57,band));
      float visible=max(1.-edge,smoothstep(-.015,.021,-ringXY.y));
      ringGlow=(outerBand*.47+innerBand*.72)*visible;
    }
    return bright*halo+shaded*edge*.77+mix(bright,vec3(.95,.73,.51),.42)*ringGlow;
  }
`;

let haloTexture;
function lightHalo(){
  if(haloTexture) return haloTexture;
  const pixels=new Uint8Array(64*64*4);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    const r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5),i=(y*64+x)*4;
    pixels[i]=pixels[i+1]=pixels[i+2]=255;
    pixels[i+3]=Math.round(230*Math.max(0,1-r)**2.6);
  }
  haloTexture=new T.DataTexture(pixels,64,64);
  haloTexture.magFilter=T.LinearFilter;
  haloTexture.needsUpdate=true;
  return haloTexture;
}

export function eveningLights(scene,locations){
  const glow=new T.SpriteMaterial({map:lightHalo(),color:'#ffc477',opacity:0,
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
  const flame=celMaterial('#f4c47b',{emissive:'#ff9d50',emissiveIntensity:.15});
  const lightPositions=locations.map(([x,y,z,post=true])=>{
    const height=post?2.0:0;
    if(post){
      branch(scene,'#83665f',[x,y,z],[x,y+2.16,z],.071);
      part(scene,'cyl','#8b7172',x,y+.15,z,.19,.28,.19);
      part(scene,'cube','#796072',x,y+1.82,z,.29,.065,.258);
      part(scene,'cube',flame,x,y+height,z,.216,.285,.208).castShadow=false;
      part(scene,'cone','#775c73',x,y+2.21,z,.233,.177,.226);
    }
    const p=new T.Vector3(x,y+height,z);
    const halo=new T.Sprite(glow);
    halo.position.copy(p);
    halo.scale.setScalar(post?1.95:1.35);
    scene.add(halo);
    return p;
  });
  const lamps=[new T.PointLight('#ffc489',0,10,1.5),new T.PointLight('#ffb573',0,8,1.65)];
  scene.add(...lamps);
  return (clock,player)=>{
    const strength=smoothstep(skyLight(clock).night,.04,.75);
    glow.opacity=strength*.78;
    flame.emissiveIntensity=.13+strength*1.29;
    if(strength<=0){
      lamps.forEach(l=>{l.intensity=0;});return;
    }
    let first,second,near=Infinity,next=Infinity;
    for(const p of lightPositions){
      const distance=(p.x-player.x)**2+(p.z-player.z)**2;
      if(distance<near){second=first;next=near;first=p;near=distance;}
      else if(distance<next){second=p;next=distance;}
    }
    [first,second].forEach((p,i)=>{
      lamps[i].intensity=p?strength*(i===0?25:14):0;
      if(p) lamps[i].position.copy(p);
    });
  };
}

export function distantAerie(scene){
  const group=new T.Group();
  scene.add(group);
  const points=[
    [22,31,-94,9.8,1], [40,41,-105,8.1,1],
    [7,39,-114,6.4,0], [57,32,-109,6.3,0]
  ];
  const rock=['#777594','#9685a7','#847890'];
  const grass=['#84a98d','#a3ba92','#88a7a0','#b4b988'];
  const glow=new T.SpriteMaterial({map:lightHalo(),color:'#ffcc8b',opacity:0,transparent:true,
    depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
  const beacon=celMaterial('#e0bc8f',{emissive:'#ffbc71',emissiveIntensity:.06,fog:false});
  const water=new T.MeshBasicMaterial({color:'#a2e0ed',transparent:true,opacity:.70,depthWrite:false});
  for(const [i,[x,y,z,r,fall]] of points.entries()){
    const shelf=new T.Group();shelf.position.set(x,y,z);group.add(shelf);
    const verts=[],indices=[],layers=[[1,0],[.91,-.17],[.66,-.44],[.38,-.73],[.07,-1.10]];
    for(const [j,[width,depth]] of layers.entries())for(let k=0;k<24;k++){
      const a=k*TAU/24,edge=1+Math.sin(a*5+i)*.09+Math.cos(a*3)*.085;
      verts.push(Math.cos(a)*r*edge*width+j*.19,depth*r+Math.sin(a*4+i)*.35,Math.sin(a)*r*.65*width);
      if(j){
        const c=j*24+k,d=j*24+(k+1)%24;
        indices.push(c-24,c,d-24,d-24,c,d);
      }
    }
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();
    const stone=new T.Mesh(geo,celMaterial(rock[i%3],{side:T.DoubleSide,fog:false}));
    shelf.add(stone);
    const top=part(shelf,'fine',celMaterial(grass[i],{fog:false}),0,.09,0,r*.97,1.08,r*.61);
    top.castShadow=false;
    for(let k=0;k<5;k++){
      const a=k*2.39996,dx=Math.cos(a)*r*.59,dz=Math.sin(a)*r*.37;
      part(shelf,'cyl',material('#795f65'),dx,.96,dz,.11,1.9,.11).castShadow=false;
      part(shelf,'fine',celMaterial(k%2?'#beb096':'#a98ab4',{fog:false}),dx,1.96,dz,1.04+(k%2)*.39,.71,1).castShadow=false;
      const light=new T.Sprite(glow);
      light.position.set(dx,.79,dz+.24);
      light.scale.setScalar(2.5);
      shelf.add(light);
    }
    for(const [dx,rz] of [[-1.1,-1],[1.1,1]]){
      part(shelf,'cyl','#ded0c9',dx,2,-.4,.22,3.24,.22).castShadow=false;
      part(shelf,'diamond','#c3adde',dx,3.9,-.4,.34,.53,.34,0,0,rz*.21).castShadow=false;
    }
    for(const [xx,zz] of [[-.47,.46],[0,.57],[.45,.41]]){
      const light=new T.Sprite(glow);
      light.position.set(xx*r,1.22,zz*r);
      light.scale.setScalar(2.8);
      shelf.add(light);
      part(shelf,'sphere',beacon,xx*r,1.23,zz*r,.21,.24,.21).castShadow=false;
    }
    if(fall){
      for(let k=0;k<4;k++)
        part(shelf,'fine',water,r*.31+k*.23,-r*.72,r*.59,.25,r*.76,.17,0,0,k*.013).castShadow=false;
    }
  }
  return (t,time)=>{
    const {night}=skyLight(time);
    glow.opacity=night*.99;
    beacon.emissiveIntensity=.06+night*1.35;
    water.opacity=.50+(1-night)*.16+Math.sin(t*1.6)*.06;
  };
}
