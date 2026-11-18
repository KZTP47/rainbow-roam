import * as T from 'three';
import {celMaterial} from './cel.js';
import {clearings} from './town-trails.js';
import {landmarkPoint,newRegions} from './new-regions.js';
import {branch,material,part} from './models.js';

const timber='#785b58',stone='#ada095',light='#eedac0',gold='#e8b477';
const lamp=celMaterial('#ffe2a4',{emissive:'#e9a969',emissiveIntensity:.66});
const pool=celMaterial('#93bfc6',{emissive:'#7fb7b5',emissiveIntensity:.22});
const TAU=Math.PI*2;
const box=(g,c,x,y,z,w,h,d,rx=0,ry=0,rz=0)=>part(g,'cube',c,x,y,z,w,h,d,rx,ry,rz);
const groupAt=(parent,x,y,z)=>{
  const group=new T.Group();
  group.position.set(x,y,z);
  parent.add(group);
  return group;
};

function paving(g,x,z,hue,r=2.3){
  part(g,'cyl',stone,x,.045,z,r,.11,r);
  part(g,'cyl',hue,x,.123,z,r*.91,.085,r*.91);
  for(let i=0;i<16;i++){
    const a=i*TAU/16;
    box(g,i%4===0?light:gold,x+Math.cos(a)*r*.93,.18,z+Math.sin(a)*r*.93,.13,.025,.24,0,-a);
  }
}

function lantern(g,x,y,z,tone=gold){
  box(g,timber,x,y,z,.26,.38,.26);
  box(g,lamp,x,y+.02,z+.021,.22,.27,.249);
  part(g,'cone',tone,x,y+.24,z,.20,.16,.20,0,Math.PI/4);
}

function awning(g,w,d,c,alt){
  for(const i of [-1,1])for(const j of [-1,1])
    box(g,timber,i*w*.45,1.27,j*d*.40,.14,2.54,.14);
  for(let i=0;i<9;i++){
    const x=(i-4)*w/9;
    box(g,i%2?c:alt,x,2.56,0,w/9+.01,.080,d,.15);
    box(g,i%2?c:alt,x,2.26,d*.49,w/9+.01,.20,.053,0,0,.04*Math.sin(i*8));
  }
}

function leaves(g,x,z,stem,petal,size){
  for(let i=0;i<6;i++){
    const a=i*TAU/6,dx=Math.cos(a),dz=Math.sin(a);
    branch(g,stem,[x,0,z],[x+dx*size*.34,size*.63,z+dz*size*.39],size*.034);
    part(g,'fine',petal,x+dx*size*.34,size*.67,z+dz*size*.39,size*.16,size*.065,size*.16);
  }
}

function sparkle(g,c,x,y,z,s){
  part(g,'diamond',c,x,y,z,s,s*1.6,s,.1,y*2,.28);
}

function rods(g,c){
  for(const side of [-1,1]){
    box(g,stone,side*1.8,.14,0,.76,.29,.70);
    box(g,c,side*1.8,1.36,0,.24,2.45,.28);
  }
  box(g,timber,0,2.48,0,3.87,.18,.27);
}

function waterBowl(g,x,z,r,palette){
  part(g,'cyl',palette,x,.16,z,r,.36,r);
  part(g,'cyl',pool,x,.37,z,r*.865,.075,r*.865);
  for(let i=0;i<12;i++){
    const a=i*TAU/12;
    const l=r*.94;
    box(g,i%3?light:stone,x+Math.sin(a)*l,.325,z+Math.cos(a)*l,.28,.17,.31,0,a);
  }
}

function orbRings(group){
  const rings=[];
  for(const [r,angle,c] of [[.75,.25,gold],[.91,1.3,light],[1.04,-.7,gold]]){
    const ring=new T.Mesh(new T.TorusGeometry(r,.048,6,30),material(c));
    ring.rotation.set(angle,angle*.7,0);group.add(ring);rings.push(ring);
  }
  sparkle(group,lamp,0,0,0,.29);
  return t=>{group.rotation.y=t*.41;rings[1].rotation.x=1.3+Math.sin(t)*.26;};
}

const makers={
  prism(g,m,[tone,pale,deep,accent],rng){
    paving(g,0,0,tone);
    for(let i=0;i<5;i++){
      const a=i*TAU/5;
      part(g,'low',i%2?deep:pale,Math.sin(a)*1.38,.31,Math.cos(a)*1.38,.67,.46,.51,0,a);
    }
    const core=groupAt(m,0,1.38,0);
    for(let i=0;i<3;i++) sparkle(core,[accent,pale,lamp][i],(i-1)*.49,i%2*.56,0,.41+i%2*.21);
    return t=>{core.rotation.y=t*.42;core.position.y=1.38+.19*Math.sin(t*1.6);};
  },
  shelter(g,m,[tone,pale,deep,accent]){
    paving(g,0,0,deep);
    for(const x of [-1.45,1.45])for(const z of [-.82,.82]) box(g,timber,x,1.15,z,.26,2.30,.24);
    for(const i of [-1,1]){
      box(g,deep,i*.82,2.43,0,1.91,.22,2.71,0,0,i*-.33);
      box(g,pale,i*.79,2.57,0,1.92,.11,2.73,0,0,i*-.33);
      box(g,accent,i*.95,.49,-.28,.50,.31,1.64);
    }
    const chime=groupAt(m,0,2.40,-.60);
    part(chime,'cyl',gold,0,-.49,0,.049,.88,.048);
    part(chime,'cone',gold,0,-.93,0,.34,.43,.34);
    return t=>{chime.rotation.x=.11*Math.sin(t*1.6);};
  },
  lanterns(g,m,[tone,pale,deep,accent],rng){
    for(const [i,x] of [-1.31,.14,1.46].entries()){
      const z=.51*Math.sin(i*2.2);
      branch(g,timber,[x,0,z],[x-.33,3.1+i*.21,z],.173);
      for(let j=0;j<4;j++){
        const a=j*TAU/4;
        part(g,'low',j%2?deep:tone,x+Math.sin(a)*.65,3.0+i*.27+Math.sin(j)*.34,z+Math.cos(a)*.45,.77,.61,.75);
      }
      lantern(g,x-.42,1.92+i*.17,z+.43,accent);
    }
    const sparks=Array.from({length:8},()=>part(m,'sphere',lamp,0,0,0,.049,.049,.049));
    return t=>sparks.forEach((p,i)=>p.position.set(Math.sin(t*.65+i*3.8)*1.9,.68+Math.sin(t*.9+i)*.42+i*.18,Math.cos(t*.63+i*2.3)*1.5));
  },
  ferry(g,m,[tone,pale,deep,accent]){
    for(let i=0;i<13;i++) box(g,i%2?'#aa8a6c':'#c4a480',(i-6)*.31,.06,-.5,.30,.17,3.16);
    for(const side of [-1,1]){
      box(g,timber,side*1.73,.29,.56,.18,.82,.21);
      lantern(g,side*1.73,1.17,.56,deep);
    }
    const boat=groupAt(m,0,.23,-2.98);
    part(boat,'soft',deep,0,0,0,.76,.27,1.69);
    part(boat,'soft',pale,0,.19,0,.62,.076,1.49);
    box(boat,accent,0,.18,.43,1.31,.13,.31);
    box(boat,timber,0,.63,-.48,.087,1.15,.086);
    box(boat,accent,.34,.88,-.48,.69,.37,.045,0,.24);
    return t=>{boat.rotation.z=.12*Math.sin(t*1.31);boat.position.y=.23+.12*Math.sin(t*1.7);};
  },
  tide(g,m,[tone,pale,deep,accent]){
    for(const [x,z,r] of [[-1.5,.36,.93],[1.23,.56,1.0],[.24,-1.62,1.12]]) waterBowl(g,x,z,r,pale);
    const pearls=[];
    for(let i=0;i<6;i++){
      const a=i*TAU/6;
      part(g,'soft',accent,Math.sin(a)*2.29,.15,Math.cos(a)*.92-.78,.37,.19,.26,0,a);
      pearls.push(part(m,'sphere',lamp,Math.sin(a)*1.15,.47,Math.cos(a)*.92-.42,.069,.069,.069));
    }
    return t=>pearls.forEach((orb,i)=>{orb.position.y=.53+.28*Math.sin(t*1.2+i);});
  },
  spindle(g,m,[tone,pale,deep,accent]){
    paving(g,0,0,tone,2.0);
    part(g,'cyl',pale,0,1.24,-.42,1.13,2.48,1.13);
    part(g,'cone',deep,0,3.05,-.42,1.28,1.43,1.27);
    box(g,timber,0,.62,.70,.54,1.22,.11);
    const blades=groupAt(m,0,2.47,1.04);
    for(let i=0;i<4;i++){
      const vane=groupAt(blades,0,0,0);
      vane.rotation.z=i*TAU/4;
      box(vane,timber,0,.92,0,.096,1.84,.10);
      box(vane,i%2?accent:light,.23,1.27,.011,.47,1.13,.064);
      for(let j=0;j<3;j++)box(vane,deep,.24,.85+j*.38,.057,.45,.027,.032);
    }
    return t=>{blades.rotation.z=-t*.54;};
  },
  kiln(g,m,[tone,pale,deep,accent]){
    paving(g,0,0,tone);
    part(g,'soft',deep,-.50,.83,-.47,1.27,1.12,.85);
    box(g,timber,-.50,.52,.355,.89,1.02,.11);
    box(g,lamp,-.50,.47,.430,.52,.63,.06);
    box(g,pale,-.87,2.11,-.61,.43,1.20,.43);
    box(g,deep,-.87,2.74,-.61,.53,.12,.56);
    for(let i=0;i<4;i++){
      part(g,'cyl',i%2?accent:gold,1.14,.25+i*.02,-.8+i*.51,.23,.44,.24);
      part(g,'cyl',pale,1.14,.48+i*.02,-.8+i*.51,.26,.065,.26);
    }
    const puffs=Array.from({length:4},()=>part(m,'soft','#dfbfae',-.87,2.8,-.61,.21,.21,.21));
    return t=>puffs.forEach((p,i)=>{
      const d=(t*.67+i*.28)%1;
      p.position.set(-.87+d*.64,2.91+d*1.05,-.61+d*.42);p.scale.setScalar(.10+d*.36);
    });
  },
  kites(g,m,[tone,pale,deep,accent]){
    for(const side of [-1,1]){
      box(g,timber,side*1.9,1.2,.6,.12,2.4,.13);
      lantern(g,side*1.9,2.72,.6,deep);
    }
    const kites=Array.from({length:4},(_,i)=>{
      const wing=groupAt(m,(i-1.5)*1.18,2.48+.38*Math.sin(i),.1);
      part(wing,'diamond',i%2?accent:pale,0,.08,-.15,.41,.65,.046,.25,.12,.27);
      branch(wing,deep,[.10,-.38,-.05],[.45,-.98,.28],.043);
      branch(wing,light,[.45,-.98,.28],[.14,-1.27,.15],.032);
      return wing;
    });
    return t=>kites.forEach((wing,i)=>{wing.rotation.x=.27*Math.sin(t*1.7+i);wing.position.y=2.61+.29*Math.sin(t+i);});
  },
  caps(g,m,[tone,pale,deep,accent],rng){
    for(let i=0;i<7;i++){
      const angle=i*2.39996,r=.91+i*.18,x=Math.sin(angle)*r,z=Math.cos(angle)*r;
      const h=.62+rng()*1.55,s=.41+h*.26;
      part(g,'cyl',pale,x,h*.46,z,.105+h*.11,h,.105+h*.11);
      part(g,'soft',i%2?accent:tone,x,h,z,s,.31+s*.22,s);
      for(let j=0;j<4;j++)part(g,'fine',light,x+Math.sin(j*2)*s*.61,h+.26,z+Math.cos(j*2)*s*.60,.091,.065,.092);
    }
    const drops=Array.from({length:7},()=>part(m,'sphere',lamp,0,0,0,.049,.052,.049));
    return t=>drops.forEach((drop,i)=>drop.position.set(Math.cos(t*.28+i*2.9)*1.52,.16+((i*.13+t*.25)%1),Math.sin(t*.28+i*2.9)*1.52));
  },
  bells(g,m,[tone,pale,deep,accent]){
    paving(g,0,0,pale);
    rods(g,deep);
    const bells=[-.91,0,.91].map((x,i)=>{
      const frame=groupAt(m,x,2.4,0);
      box(frame,timber,0,-.27,0,.054,.53,.055);
      part(frame,'cone',i%2?accent:gold,0,-.70,0,.31+i*.03,.42,.31+i*.03);
      part(frame,'sphere',deep,0,-.95,0,.098,.115,.098);
      return frame;
    });
    return t=>bells.forEach((bell,i)=>{bell.rotation.x=Math.sin(t*1.23+i*.72)*.18;});
  },
  forge(g,m,[tone,pale,deep,accent]){
    paving(g,0,0,tone);
    awning(g,3.9,2.9,deep,pale);
    box(g,stone,.72,.62,-.79,1.31,1.24,.78);
    box(g,timber,.72,1.32,-.79,1.34,.21,.81);
    box(g,accent,-.77,.35,.12,.72,.71,.68);
    box(g,deep,-.77,.80,.12,1.11,.23,.54);
    part(g,'cone',deep,-1.28,.81,.12,.19,.58,.16,0,0,Math.PI/2);
    const embers=Array.from({length:9},()=>part(m,'sphere',lamp,0,0,0,.049,.049,.049));
    return t=>embers.forEach((p,i)=>{
      const r=(t*.82+i*.31)%1;
      p.position.set(.75+r*Math.sin(i*3.3)*.63,1.44+r*1.48,-.77+r*Math.cos(i*3.3)*.49);
    });
  },
  archive(g,m,[tone,pale,deep,accent]){
    awning(g,4.23,3.14,tone,pale);
    for(const x of [-1.35,1.35]){
      box(g,timber,x,1.02,-1.05,1.14,2.05,.40);
      for(let i=0;i<3;i++){
        box(g,pale,x,.43+i*.52,-.82,1.02,.10,.43);
        for(let j=0;j<6;j++) box(g,[tone,accent,deep,gold][(i+j)%4],x-.41+j*.15,.65+i*.52,-.67,.101,.30,.17,0,0,j%4*.035);
      }
    }
    box(g,timber,0,.65,.15,1.3,.21,.61);
    const book=groupAt(m,0,.79,.15);
    for(const i of [-1,1])box(book,pale,i*.26,.04,0,.5,.05,.47,0,0,i*.19);
    return t=>{book.rotation.y=.16*Math.sin(t*.96);};
  },
  orchard(g,m,[tone,pale,deep,accent]){
    paving(g,0,0,pale);
    box(g,timber,0,.40,-.46,2.83,.73,1.13);
    box(g,timber,0,2.44,-.71,2.96,.16,.26);
    for(const x of [-1.38,1.38])box(g,timber,x,1.52,-.71,.19,1.92,.24);
    for(let j=0;j<6;j++)part(g,'fine',j%2?accent:gold,-.87+j*.34,.82,-.40,.20,.16,.18);
    const lever=groupAt(m,0,2.3,-.56);
    branch(lever,deep,[0,0,.1],[0,-.93,.73],.074);
    branch(lever,gold,[-.65,-.93,.73],[.65,-.93,.73],.072);
    return t=>{lever.rotation.x=.24+.22*Math.sin(t*1.3);};
  },
  bridge(g,m,[tone,pale,deep,accent]){
    for(let i=0;i<11;i++)box(g,i%2?pale:tone,(i-5)*.37,.08,-.25,.351,.20,2.36);
    for(const x of [-1.92,1.92]){
      box(g,stone,x,.93,-1.12,.51,1.87,.54);
      lantern(g,x,2.05,-1.16,accent);
    }
    const rail=groupAt(m,0,1.68,-1.10);
    box(rail,deep,0,0,0,3.30,.131,.15);
    for(let i=0;i<7;i++) box(rail,gold,(i-3)*.43,-.46,0,.093,1.04,.105);
    return t=>{rail.position.y=1.77+Math.sin(t*.79)*.26;};
  },
  apiary(g,m,[tone,pale,deep,accent]){
    paving(g,0,0,tone);
    for(const [i,x] of [-1.29,0,1.29].entries()){
      const h=.88+i*.13,z=.23*Math.sin(i*3);
      box(g,timber,x,.19,z,.88,.37,.69);
      box(g,pale,x,h*.5+.26,z,.73,h,.57);
      for(let j=0;j<4;j++)box(g,i%2?accent:gold,x,h*j*.23+.39,z+.28,.76,.08,.087);
      box(g,deep,x,h+.35,z,.89,.18,.70);
    }
    const bees=Array.from({length:5},()=>part(m,'fine',gold,0,0,0,.095,.063,.082));
    return t=>bees.forEach((bee,i)=>{
      const a=t*(1+i*.18)+i*7;
      bee.position.set(Math.cos(a)*1.97,.83+Math.sin(a+1.9)*.37+i*.12,Math.sin(a)*.94);
    });
  },
  orbits(g,m,[tone,pale,deep,accent]){
    paving(g,0,0,tone);
    part(g,'cyl',deep,0,.36,0,.74,.57,.74);
    part(g,'cyl',pale,0,.72,0,.51,.24,.51);
    for(let i=0;i<7;i++){
      const a=i*TAU/7;
      sparkle(g,i%2?pale:accent,Math.cos(a)*1.68,.48,Math.sin(a)*1.68,.12);
    }
    return orbRings(groupAt(m,0,1.82,0));
  },
  fans(g,m,[tone,pale,deep,accent]){
    awning(g,4.30,2.96,pale,accent);
    box(g,stone,0,.36,-1,3.38,.72,.38);
    const fans=Array.from({length:3},(_,i)=>{
      const fan=groupAt(m,(i-1)*1.24,.94,-.72);
      for(let j=-3;j<=3;j++){
        const a=j*.27;
        part(fan,'diamond',j%2?deep:pale,Math.sin(a)*.56,Math.cos(a)*.56,0,.21,.36,.035,0,0,-a);
        branch(fan,timber,[0,0,.03],[Math.sin(a)*.77,Math.cos(a)*.77,.03],.018);
      }
      return fan;
    });
    return t=>fans.forEach((fan,i)=>{fan.rotation.y=Math.sin(t*.86+i)*.53;});
  },
  chains(g,m,[tone,pale,deep,accent]){
    waterBowl(g,0,.42,1.55,pale);
    rods(g,deep);
    const drops=[];
    for(const x of [-.85,0,.85]){
      for(let j=0;j<6;j++){
        part(g,'cone',gold,x,2.23-j*.26,.01,.116,.21,.115,0,0,Math.PI);
        drops.push(part(m,'sphere',pool,x,2.20-j*.26,.028,.059,.079,.058));
      }
    }
    return t=>drops.forEach((drop,i)=>{drop.position.y=2.32-((t*.89+i*.37)%1)*1.88;});
  },
  pennants(g,m,[tone,pale,deep,accent]){
    paving(g,0,0,tone);
    for(const x of [-1.26,1.26]){
      box(g,stone,x,1.33,-.31,.22,2.66,.25);
      lantern(g,x,2.95,-.31,deep);
    }
    box(g,timber,0,2.21,-.31,2.55,.17,.19);
    const arm=groupAt(m,0,3.08,-.30);
    box(arm,deep,0,0,0,3.14,.077,.086);
    for(const x of [-1.04,1.04]) part(arm,'diamond',x<0?accent:pale,x,-.32,0,.41,.52,.055);
    return t=>{arm.rotation.z=.29*Math.sin(t*.77);};
  },
  springs(g,m,[tone,pale,deep,accent]){
    paving(g,0,0,tone);
    waterBowl(g,0,.38,1.59,pale);
    for(const x of [-1.23,1.23]){
      box(g,deep,x,.39,-1.03,.28,.84,.31);
      box(g,pale,x,.94,-1.03,.38,.24,.39);
      lantern(g,x,1.24,-1.04,accent);
    }
    const vapor=Array.from({length:5},()=>part(m,'soft','#d7e8d8',0,0,0,.14,.18,.13));
    return t=>vapor.forEach((p,i)=>{
      const rise=(t*.41+i*.26)%1;
      p.position.set(Math.sin(i*4.2)*.96+rise*.26,.44+rise*.92,Math.cos(i*4.5)*.81);
      p.scale.setScalar(.10+rise*.19);
    });
  }
};

function marketCorner(group,scene,height,region){
  const [cx,cz]=region.center;
  const [base,pale,deep,accent]=region.palette;
  const sx=cx-4.85,sz=cz-3.72;
  const g=groupAt(group,sx,height(sx,sz),sz);
  awning(g,3.19,1.98,deep,accent);
  box(g,timber,0,.55,-.26,2.87,1.1,.64);
  box(g,pale,0,1.08,-.26,2.93,.12,.78);
  for(let i=0;i<6;i++){
    const x=-1.10+i*.44,y=1.18+.07*(i%3),z=-.31+.11*(i%2);
    if(region.stock.icon==='gem'||region.stock.icon==='mountain') sparkle(g,i%2?accent:pale,x,y,z,.12);
    else if(region.stock.icon==='trees'||region.stock.icon==='sprout')
      branch(g,i%2?deep:base,[x-.06,y-.06,z],[x+.12,y+.11,z-.05],.063);
    else part(g,'fine',i%2?accent:gold,x,y,z,.14,.13,.14);
  }
  lantern(g,-1.32,2.13,.87);
  for(const side of [-1,1]){
    const px=cx+side*7.0,pz=cz+5.9,y=height(px,pz);
    const flowerBed=groupAt(group,px,y,pz);
    box(flowerBed,pale,0,.102,0,2.03,.23,.65);
    for(let i=0;i<5;i++) leaves(flowerBed,-.79+i*.4,0,deep,i%2?accent:base,.47);
  }
  const windSign=groupAt(scene,sx+1.36,height(sx,sz)+2.29,sz+.82);
  box(windSign,timber,0,-.16,-.04,.48,.39,.095);
  part(windSign,'diamond',gold,0,-.16,.028,.129,.135,.075);
  return {block:[sx,sz-.25,1.53,.52],update:t=>{windSign.rotation.x=.15*Math.sin(t*1.5);}};
}

function bloomClearing(group,scene,land,realm,patch,preview){
  const {x,z,flower}=patch;
  const green=realm==='hushsnow'?'#648f8a':realm==='stellarcairn'?'#697694':'#618063';
  for(let i=0;i<35;i++){
    const a=i*2.39996,r=2.5+Math.sqrt(i/35)*6;
    const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
    const sprig=groupAt(group,px,land.height(px,pz),pz);
    sprig.rotation.y=a;
    const h=.46+(i%5)*.11;
    branch(sprig,green,[0,0,0],[.08,h,0],.028);
    for(const side of [-1,1]){
      part(sprig,'low',green,side*.105,h*.40,0,.16,.048,.065,0,.2,side*.53);
    }
    if(realm==='hushsnow'){
      for(let j=0;j<4;j++) for(const side of [-1,1])
        part(sprig,'diamond',j%2?flower:'#cde9ec',side*(.17-j*.025),h*(.53+j*.14),0,.062,.19-j*.024,.038,0,0,-side*.69);
    }else if(realm==='brambleglass'){
      for(const side of [-1,1]){
        part(sprig,'cone',flower,side*.10,h,.02,.14,.26,.14,0,0,side*.29);
        part(sprig,'soft',gold,side*.10,h-.135,.02,.054,.051,.053);
      }
    }else{
      for(let k=0;k<5;k++){
        const theta=k*TAU/5;
        part(sprig,'diamond',flower,.08+.121*Math.cos(theta),h,.121*Math.sin(theta),.152,.055,.066,0,-theta);
      }
      part(sprig,'soft',lamp,.08,h+.04,0,.073,.055,.073);
    }
  }
  if(preview) return ()=>{};
  const insects=Array.from({length:6},(_,i)=>{
    const bug=groupAt(scene,x,0,z);
    part(bug,'low',gold,0,0,0,.039,.048,.091);
    const wings=[-1,1].map(side=>part(bug,'diamond',i%2?flower:light,side*.077,.025,0,.088,.024,.086));
    return {bug,wings};
  });
  const y=land.height(x,z);
  return t=>insects.forEach(({bug,wings},i)=>{
    const a=i*2.4+t*.26,r=2.2+i*.49;
    bug.position.set(x+Math.cos(a)*r,y+1.22+.39*Math.sin(t*1.6+i),z+Math.sin(a)*r);
    bug.rotation.y=-a;
    wings.forEach((w,j)=>{w.rotation.z=(j?1:-1)*Math.sin(t*13+i)*.74;});
  });
}

export function buildNewRegion(group,scene,realm,land,random,blockers,preview=false){
  const region=newRegions[realm];
  if(!region) return ()=>{};
  const market=marketCorner(group,scene,land.height,region);
  const [x,z]=landmarkPoint(region),y=land.height(x,z);
  const landmark=groupAt(group,x,y,z);
  landmark.name=region.landmark;
  const motion=groupAt(scene,x,y,z);
  const vertical=['ferry','bridge','tide','springs'].includes(region.design)?1.12:
    ['prism','spindle','kiln','orbits','chains','pennants'].includes(region.design)?1.72:1.43;
  landmark.scale.y=motion.scale.y=vertical;
  const animateLandmark=makers[region.design](landmark,motion,region.palette,random);
  blockers.push(market.block,[x,z,region.design==='archive'?2.15:1.9,1.3]);
  const patch=clearings[realm];
  const flutter=patch?bloomClearing(group,scene,land,realm,patch,preview):null;
  const plaque=groupAt(group,x,land.height(x,z+2.05),z+2.05);
  box(plaque,timber,0,.44,0,.15,.88,.14);
  box(plaque,region.palette[2],0,.99,0,.97,.46,.13);
  for(let i=-1;i<=1;i++) part(plaque,'diamond',gold,i*.24,1,.089,.065,.104,.029,0,0,i*.31);
  const update=t=>{market.update(t);animateLandmark(t);flutter?.(t);};
  if(preview) update(.52);
  return update;
}
