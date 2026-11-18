import * as T from 'three';
import {branch,material,part} from './models.js';

// The profiles are normalized to one half-width. Six of the roofs use a curved cap.
const profiles={
  mosaic:[[-1,.1],[-.73,.58],[-.39,1.02],[.39,1.02],[.73,.58],[1,.1]],
  alpine:[[-1,-.26],[0,1.78],[1,-.26]],
  leaning:[[-1,-.2],[-.27,1.24],[.17,1.08],[1,.12]],
  boathouse:[[-1,0],[-.73,.42],[-.35,.77],[.35,.77],[.73,.42],[1,0]],
  sawtooth:[[-1,0],[-.34,1.36],[-.24,.36],[.44,1.53],[.53,.46],[1,.15]],
  kite:[[-1.11,-.03],[-.48,.48],[.17,1.40],[.83,.13],[1.12,.24]],
  belfry:[[-1,-.08],[-.58,.55],[0,1.69],[.58,.55],[1,-.08]],
  forge:[[-1,0],[-.82,.84],[-.36,.84],[-.36,1.09],[.36,1.09],[.36,.84],[.82,.84],[1,0]],
  library:[[-1,0],[-.73,.49],[0,1.34],[.73,.49],[1,0]],
  barn:[[-1,.04],[-.65,1.12],[0,1.58],[.65,1.12],[1,.04]],
  reed:[[-1,-.28],[-.57,.25],[0,1.21],[.57,.25],[1,-.28]],
  fan:[[-1.04,.64],[-.60,.63],[0,.02],[.60,.63],[1.04,.64]],
  cistern:[[-1,.27],[-.85,.82],[.85,.82],[1,.27]],
  sail:[[-1.04,.37],[-.57,.28],[-.12,.61],[.70,1.42],[1.08,.75]]
};
const caps={
  shell:[[1.06,.03],[1.05,.33],[.94,.67],[.69,.99],[.30,1.26],[0,1.31]],
  kiln:[[1.02,.03],[.97,.42],[.76,.91],[.46,1.23],[.24,1.28],[0,1.29]],
  mushroom:[[1.16,.03],[1.06,.40],[.78,.77],[.53,.92],[.20,1.02],[0,1.04]],
  hive:[[1.01,.06],[.97,.35],[.87,.68],[.72,1.02],[.48,1.35],[.25,1.53],[0,1.60]],
  observatory:[[1.02,.09],[.99,.40],[.88,.75],[.73,1.09],[.43,1.41],[0,1.56]],
  bath:[[1.04,.04],[1.04,.27],[.87,.52],[.59,.76],[.24,.95],[0,.99]]
};
const capMeshes=new Map();
const box=(g,color,x,y,z,w,h,d,angle=0)=>part(g,'cube',color,x,y,z,w,h,d,0,0,angle);
const paper='#f9e6bf',dark='#62515c';

function capOf(form){
  if(!capMeshes.has(form)){
    const sides={shell:18,kiln:12,mushroom:16,hive:9,observatory:20,bath:14};
    capMeshes.set(form,new T.LatheGeometry(caps[form].map(([x,y])=>new T.Vector2(x,y)),sides[form]));
  }
  return capMeshes.get(form);
}

function straightRoof(base,design,w,d,y,scale){
  const {roof,roofColor,wood,light}=design;
  const points=profiles[roof].map(([x,h])=>[x*(w/2+.22),h*scale]);
  const shape=new T.Shape().moveTo(points[0][0],-.33);
  for(const [x,cy] of points) shape.lineTo(x,cy);
  shape.lineTo(points.at(-1)[0],-.33).closePath();
  const gable=new T.ShapeGeometry(shape);
  for(const sign of [-1,1]){
    const end=new T.Mesh(gable,material(design.walls==='stone'?'#b0a0ad':wood));
    end.rotation.y=sign<0?Math.PI:0;
    end.position.set(0,y,sign*(d/2+.07));end.castShadow=true;base.add(end);
  }
  for(let i=1;i<points.length;i++){
    const [ax,ay]=points[i-1],[bx,by]=points[i];
    const x=(ax+bx)/2,cy=y+(ay+by)/2,span=Math.hypot(bx-ax,by-ay),angle=Math.atan2(by-ay,bx-ax);
    box(base,roofColor,x,cy,0,span+.16,.19,d+.76,angle);
    for(const side of [-1,1]) box(base,light,x,cy,side*(d/2+.37),span+.18,.082,.080,angle);
    if(i%2===1) for(let j=1;j<=3;j++){
      box(base,wood,x,cy+.10,(j-2)*d*.25,span,.064,.044,angle);
    }
  }
  if(roof==='alpine') for(const side of [-1,1])
    box(base,'#faf0e4',side*w*.20,y+scale,0,w*.43,.093,d+.58,side*-.58);
}

function curvedRoof(base,design,w,d,y,scale,tall){
  const {roof,roofColor,wood,light}=design;
  box(base,wood,0,y+.02,0,w+.52,.24,d+.44);
  box(base,light,0,y+.19,0,w+.42,.17,d+.37);
  const cap=new T.Mesh(capOf(roof),material(roofColor));
  cap.position.y=y+.23;cap.scale.set(w*.51,scale,d*.56);
  cap.castShadow=cap.receiveShadow=true;base.add(cap);
  const edges=caps[roof];
  for(const [i,[r,ry]] of edges.entries()){
    if(i%2===1&&r>0.25){
      const band=part(base,'cyl',i===1?light:wood,0,y+.23+ry*scale,0,w*r*.515,.065,d*r*.565);
      band.castShadow=false;
    }
  }
  if(roof==='observatory'||roof==='bath'||roof==='kiln'||tall){
    const height=edges.at(-1)[1]*scale+y+.26;
    part(base,'cyl',wood,0,height+.19,0,.25,.48,.25);
    part(base,'cone',light,0,height+.53,0,.39,.55,.39);
  }
}

export function regionalRoof(base,design,w,d,top,kind){
  const tall=kind==='hall'||kind==='inn'||kind==='lookout';
  const scale=kind==='hall'?1.79:kind==='inn'?1.25:kind==='lookout'?1.12:.90;
  if(caps[design.roof]) curvedRoof(base,design,w,d,top+.11,scale,tall);
  else straightRoof(base,design,w,d,top+.12,scale);
  const {wood,light,roof,roofColor}=design;
  const edge=d/2;
  for(const side of [-1,1]){
    box(base,wood,side*(w/2+.06),top-.21,0,.22,.28,d+.38);
    for(let i=-1;i<=1;i++) box(base,light,side*(w/2+.14),top-.33,i*d*.33,.32,.22,.15);
  }
  if(roof==='belfry'||roof==='cistern'||roof==='forge'){
    const y=top+(kind==='hall'?3.1:1.46);
    part(base,'cyl',wood,w*.28,y-.21,-edge*.48,.39,1.38,.39);
    part(base,'cyl',light,w*.28,y+.40,-edge*.48,.46,.16,.46);
    part(base,'cone',roofColor,w*.28,y+.71,-edge*.48,.41,.67,.41);
  }
  if(roof==='kite'||roof==='sail'||roof==='sawtooth'){
    const x=kind==='hall'?0:-w*.27,y=top+scale*1.5+.65,z=-d*.19;
    branch(base,wood,[x,y-1.6,z],[x,y+.32,z],.058);
    part(base,'diamond',light,x+.31,y+.03,z,.33,.37,.042,0,.16,.24);
  }
  if((roof==='mosaic'||roof==='library'||roof==='alpine'||roof==='barn')&&kind==='hall'){
    part(base,'cyl',light,0,top+scale*.67,edge+.10,.39,.11,.39,Math.PI/2);
    part(base,'cyl',roofColor,0,top+scale*.67,edge+.17,.31,.06,.31,Math.PI/2);
  }
}

export function regionalFacade(base,design,w,d,top,doorWidth,kind){
  const {walls,wood,light,roofColor}=design,side=d/2;
  for(const direction of [-1,1]){
    const x=direction*(w/2+.12);
    const plank=walls==='logs'||walls==='boards', stone=walls==='stone'||walls==='bands';
    if(plank||stone){
      const gap=walls==='logs'?.40:walls==='boards'?.30:.53;
      for(let y=.38;y<top-.12;y+=gap){
        if(stone) for(let i=0;i<4;i++){
          box(base,i%2?wood:light,x,y,(i-1.5)*d*.22,.053,.070,.245*d);
        }else box(base,wood,x,y,0,.071,.064,d-.15);
      }
    }else{
      for(const z of [-d*.30,0,d*.30]){
        box(base,wood,x,top*.46,z,.085,top*.88,.095);
        if(walls==='lattice') part(base,'cube',light,x,1.64,z,.064,1.15,.082,.58);
      }
      box(base,light,x,.60,0,.087,.18,d-.18);
    }
    const edgeX=direction*(doorWidth*.50+.15);
    box(base,wood,edgeX,1.13,side+.18,.16,2.20,.105);
    box(base,light,edgeX,2.22,side+.21,.30,.16,.15);
    if(kind!=='home'||walls==='lattice'||walls==='timber'){
      const span=w*.50-doorWidth*.50;
      if(span<.80) continue;
      const xx=direction*(w*.50-span*.51);
      if(walls==='tiles'||walls==='bands'){
        for(let y of [.44,.64,2.19]) for(let i=-1;i<=1;i++)
          box(base,i%2?light:roofColor,xx+i*span*.26,y,side+.235,span*.16,.11,.045,(y===.64?.38:0));
      }else{
        for(const s of [-1,1]) box(base,s<0?wood:roofColor,xx+s*span*.28,1.65,side+.244,.154,.84,.078);
      }
    }
  }
  box(base,roofColor,0,top-.51,side+.16,w+.03,.18,.14);
  box(base,light,0,top-.50,side+.249,w-.08,.059,.049);
}

export function regionalPlaza(parent,x,y,z,design){
  const {plaza,wood,light,roofColor}=design;
  if(plaza==='moorings'){
    for(const i of [-1,0,1]) {
      part(parent,'cyl',wood,x+i*.92,y+.43,z,.16,.90,.16);
      part(parent,'sphere',light,x+i*.92,y+.90,z,.15,.12,.15);
      if(i<1) branch(parent,paper,[x+i*.92,y+.69,z],[x+(i+1)*.92,y+.69,z],.031);
    }
  }else if(plaza==='pools'){
    for(const [dx,dz,r] of [[-.63,0,.66],[.54,.48,.50]]){
      part(parent,'cyl',wood,x+dx,y+.14,z+dz,r,.30,r);
      part(parent,'cyl','#8ebdc5',x+dx,y+.31,z+dz,r*.84,.07,r*.84);
      part(parent,'low',light,x+dx,y+.35,z+dz,.13,.08,.17);
    }
  }else if(plaza==='prisms'){
    part(parent,'cyl',wood,x,y+.16,z,.94,.34,.94);
    for(const i of [-1,0,1]) part(parent,'diamond',i===0?roofColor:light,x+i*.55,y+.92,z,.21,.37+Math.abs(i-1)*.17,.22,.10,.2,i*.24);
  }else if(plaza==='pots'||plaza==='orchard'){
    for(const i of [-1,0,1]){
      const xx=x+i*.69,zz=z+(i===0?.43:0);
      part(parent,'soft',i===0?roofColor:wood,xx,y+.22,zz,.29,.32,.28);
      part(parent,'cyl',light,xx,y+.50,zz,.23,.075,.23);
      if(plaza==='orchard'){
        branch(parent,'#7c936f',[xx,y+.48,zz],[xx+.14,y+.83,zz],.023);
        part(parent,'soft',light,xx+.12,y+.84,zz,.20,.15,.16);
      }
    }
  }else{
    for(const side of [-1,1]){
      const px=x+side*.93;
      branch(parent,wood,[px,y,z],[px,y+2.75,z],.081);
      part(parent,'diamond',light,px,y+2.84,z,.12,.16,.13);
    }
    branch(parent,dark,[x-.93,y+2.62,z],[x+.93,y+2.62,z],.031);
    for(const i of [-1,0,1]){
      const px=x+i*.46;
      if(plaza==='bells'){
        part(parent,'cone',light,px,y+2.39,z,.12,.22,.12);
        part(parent,'low',wood,px,y+2.25,z,.042,.039,.042);
      }else{
        part(parent,plaza==='ribbons'?'diamond':'cube',i%2?light:roofColor,px,y+2.37,z,
          plaza==='ribbons'?.18:.21,.29,.067,0,.2,i*.2);
      }
    }
  }
}

export function regionalGate(parent,x,y,z,design){
  const gate=new T.Group();
  gate.position.set(x,y,z);parent.add(gate);
  const {wood,light,roofColor,plaza,roof}=design;
  for(const s of [-1,1]){
    const xx=s*1.45;
    box(gate,wood,xx,.16,0,.61,.32,.65);
    if(plaza==='prisms'||plaza==='bells'){
      for(let i=0;i<6;i++) box(gate,i%2?wood:light,xx,.42+i*.37,0,.43,.37,.43);
      box(gate,light,xx,2.71,0,.61,.18,.59);
    }else{
      branch(gate,wood,[xx,0,0],[s*1.42,2.74,0],.166);
      for(const h of [.67,1.30,2.29]) part(gate,'cyl',light,xx,h,0,.19,.11,.19);
    }
  }
  if(plaza==='prisms'){
    for(const s of [-1,1]){
      branch(gate,light,[s*1.45,2.70,0],[s*.76,3.38,0],.13);
      branch(gate,wood,[s*.76,3.38,0],[0,3.84,0],.11);
    }
    part(gate,'diamond',roofColor,0,3.40,.08,.30,.40,.16);
  }else if(plaza==='moorings'||plaza==='ribbons'){
    branch(gate,wood,[-1.51,2.71,0],[1.49,2.97,0],.066);
    for(const [i,p] of [-1.07,-.61,-.15,.31,.77].entries()){
      const h=2.66+p*.08;
      part(gate,'diamond',i%2?light:roofColor,p,h-.21,.035,.19,.25,.036,0,.18,i*.05-.12);
    }
    if(plaza==='moorings') for(const side of [-1,1])
      part(gate,'sphere',light,side*1.45,2.89,0,.20,.16,.20);
  }else{
    regionalRoof(gate,design,3.62,1.14,2.68,'gate');
    if(plaza==='lanterns'||plaza==='bells') for(const p of [-.89,0,.89]){
      branch(gate,wood,[p,2.71,0],[p,2.35,0],.023);
      part(gate,plaza==='bells'?'cone':'cube',light,p,2.24,0,.20,.23,.20);
      if(plaza==='bells') part(gate,'sphere',roofColor,p,2.13,0,.078,.048,.077);
    }
    if(roof==='bath'||roof==='shell') box(gate,light,0,2.68,.66,2.93,.19,.114);
  }
}
