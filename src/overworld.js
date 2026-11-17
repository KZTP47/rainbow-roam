import {skyOrigin,skyIslands,skyRim} from './sky-islands.js';

export const oceanLevel=.43;
export const worldBounds=569;
export const frontierLayout={
  heath:{x:-155,z:-118,rx:59,rz:59,title:'Heatherheart Moor',tone:'#a2b48f'},
  cinder:{x:155,z:-118,rx:59,rz:59,title:'Cinderglen',tone:'#bf8d72'},
  reef:{x:-273,z:118,rx:59,rz:59,title:'Pearlbreak Coast',tone:'#80b6ae'},
  verdigris:{x:273,z:0,rx:59,rz:59,title:'Verdigris Highlands',tone:'#8aab91'},
  orchards:{x:0,z:273,rx:59,rz:59,title:'Ciderwild Orchards',tone:'#a9b77a'}
};
export const townRealmLayout={
  bellport:{x:-391,z:118,rx:59,rz:59,title:'Bellweather Coast',tone:'#86b8b7'},
  fennel:{x:-273,z:236,rx:59,rz:59,title:'Fennel Downs',tone:'#aec184'},
  gloam:{x:-273,z:0,rx:59,rz:59,title:'Gloam Forest',tone:'#9781ac'},
  linen:{x:-273,z:-118,rx:59,rz:59,title:'Linnet Vale',tone:'#cba1b6'},
  larkspur:{x:-155,z:-236,rx:59,rz:59,title:'Larkspur Alps',tone:'#acb9d3'},
  tamarack:{x:0,z:-273,rx:59,rz:59,title:'Tamarack Basin',tone:'#91abaa'},
  windmere:{x:155,z:-236,rx:59,rz:59,title:'Windmere Steppe',tone:'#d3b386'},
  safflower:{x:273,z:-118,rx:59,rz:59,title:'Safflower Badlands',tone:'#c58f78'},
  seabloom:{x:273,z:118,rx:59,rz:59,title:'Seabloom Reach',tone:'#80b6a4'},
  amberfen:{x:155,z:236,rx:59,rz:59,title:'Amberfen Wetlands',tone:'#a6b083'}
};
export const geography={
  valley:{x:0,z:0,rx:96,rz:96,title:'Blossom Valley',tone:'#9eb386'},
  woods:{x:-155,z:0,rx:59,rz:59,title:'Elderwood',tone:'#7e9e79'},
  mesa:{x:155,z:0,rx:59,rz:59,title:'Painted Mesa',tone:'#d2ab80'},
  frost:{x:0,z:-155,rx:59,rz:59,title:'Winterglass Range',tone:'#c6d9e5'},
  hogwarts:{x:0,z:155,rx:59,rz:59,title:'Hogwarts',tone:'#8fa291'},
  coast:{x:-155,z:118,rx:59,rz:59,title:'Saltwind Coast',tone:'#99b8a3'},
  delta:{x:155,z:118,rx:59,rz:59,title:'Lotus Delta',tone:'#87ad98'},
  ...frontierLayout,
  ...townRealmLayout,
  silverrun:{x:0,z:391,rx:59,rz:59,title:'Silverrun',tone:'#aab987'},
  silvercoast:{x:0,z:509,rx:59,rz:59,title:'Silverrun Coast',tone:'#c2bb91'},
  sky:{...skyOrigin,rx:Math.ceil(Math.max(...Object.values(skyIslands).map(i=>Math.abs(i.world[0]-skyOrigin.x)))+skyRim+8),
    rz:Math.ceil(Math.max(...Object.values(skyIslands).map(i=>Math.abs(i.world[1]-skyOrigin.z)))+skyRim+8),title:'The Aerie',tone:'#a4b2c6'}
};
const ground=Object.entries(geography).filter(([id])=>id!=='sky');

export function groundRealmAt(x,z){
  return ground.find(([,r])=>Math.abs(x-r.x)<=r.rx&&Math.abs(z-r.z)<=r.rz)?.[0]??null;
}

export function nearestGround(x,z){
  let closest=null,range=Infinity;
  for(const [id,r] of ground){
    const distance=Math.hypot(Math.max(0,Math.abs(x-r.x)-r.rx),Math.max(0,Math.abs(z-r.z)-r.rz));
    if(distance<range){range=distance;closest=id;}
  }
  return closest;
}

export function worldPoint(id,x,z){
  const origin=geography[id];
  return {x:x+origin.x,z:z+origin.z};
}

export function regionPoint(id,x,z){
  const origin=geography[id];
  return {x:x-origin.x,z:z-origin.z};
}

export function trimHeight(id,x,z,height){
  const {rx,rz}=geography[id];
  const edge=Math.min(rx-Math.abs(x),rz-Math.abs(z));
  const t=Math.max(0,Math.min(1,edge/11));
  return .89+(height-.89)*t*t*(3-2*t);
}

export function canFly(spec){
  return ['gull','owl','bee','moth','dragon','sprite'].includes(spec?.kind);
}
