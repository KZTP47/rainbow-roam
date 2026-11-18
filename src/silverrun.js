import {rooms,spirehavenRooms} from './spirehaven-rooms.js';

export const silverrun = {
  name:'Silverrun', entry:'spirehaven', tagline:'A walled city, a riverside watermill and windmills on the downs',
  height:2.2, colors:['#9fbd82','#e1d49e','#858aaa','#efb4b9']
};

export const silverrunPlaces = {
  spirehaven:{name:'Spirehaven',note:'Walled city on the Silverrun',x:9,z:13,color:'#dab2c1',travel:[11,20],gate:[7,26.3],marker:[17,4]},
  millbrook:{name:'Millbrook',note:'Waterwheel village on the upper river',x:-10,z:-31,color:'#99c9ba',travel:[-10.5,-25],gate:[-5,-20.5],marker:[-22,-29]},
  windmereDowns:{name:'Windmere',note:'Windmills above the wheat fields',x:-38,z:20,color:'#ebca86',travel:[-38,25],gate:[-43,25],marker:[-42,14]}
};

export const silverrunWalls = {west:-25,east:34,north:-16,south:32};
export const arcanum={x:spirehavenRooms.starMap.x,z:spirehavenRooms.starMap.z};
export const kingfisherBridge = 1;
export const silverrunBridges = [-29,kingfisherBridge,14];
export const riverWidth = 2.7;
export const riverLevel = 1.13;
export const riverCenter = z => -15+4*Math.sin((z+9)*.04);
export const overBridge = z => silverrunBridges.some(bridge=>Math.abs(z-bridge)<1.72);
export const inRiver = (x,z) => Math.abs(x-riverCenter(z))<riverWidth && !overBridge(z);
export const silverrunRegionAt = (x,z) => z<-18?'millbrook':x<-28?'windmereDowns':'spirehaven';

export const silverrunPaths = [
  [[11,38],[11,23],[11,18],[17,14],[17,4],[16.4,-5],[11,-8],[11,-12],[11,-18],[4,-23],[1,-29],[-29,-29],[-34,-29],[-37,-17],[-38,3],[-38,24]],
  [[17,14],[14,16],[5,16],[2,14],[-25,14],[-31,19],[-38,20]],
  [[11,38],[31,38],[44,25],[43,-17],[39,-42],[29,-59]],
  [[11,38],[7,48],[11,59]],
  [[17,14],[37,14],[44,18],[53,14],[59,14]],
  [[17,4],[arcanum.x,3.4],[arcanum.x,-7.05]],
  [[-19,1],[-6.9,1],[-5.7,8],[-5.7,14]],
  [[17,9],[15.2,8.1],[12,8],[12,2.65]],
  [[24.5,14],[23.85,11.5],[23.85,7.75],[24.5,5],[25.2,1],[24.6,-3.1],[27.2,-7]]
];

export function silverrunRoadDistance(x,z){
  return roadDistance(silverrunPaths,x,z);
}

export function roadDistance(paths,x,z){
  let distance=Infinity;
  for(const route of paths) for(let i=1;i<route.length;i++){
    const [ax,az]=route[i-1],[bx,bz]=route[i];
    const dx=bx-ax,dz=bz-az;
    const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));
    distance=Math.min(distance,Math.hypot(x-ax-t*dx,z-az-t*dz));
  }
  return distance;
}

export const silverrunLandmarks = {
  spirehaven:[['South Gate',11,32,'hall'],['Griffin Fountain',11,12,'water'],
    ['Arcanum Spire',arcanum.x,arcanum.z,'hall'],['Grand Stair',arcanum.x,1,'hall'],['Clock Tower',26.2,9.55,'hall'],
    ['Lantern Quay',riverCenter(8)+5,8,'water'],['Old Bridge',riverCenter(14),14,'bridge'],
    ['Kingfisher Bridge',riverCenter(kingfisherBridge),kingfisherBridge,'bridge'],['Merchants’ Guildhall',12,3.3,'hall'],
    ['Market Stage',25,20.2,'hall'],['Crooked Tower',30.9,-6.6,'hall'],
    ['Moonpetal Court',28.15,-8.85,'tree'],['Stargazer Terrace',24.2,-5.25,'hall'],
    ...rooms.map(({name,x,z})=>[name,x,z,'hall'])],
  millbrook:[['Watermill',-13,-37,'hall'],['Millbrook Bridge',riverCenter(-29),-29,'bridge']],
  windmereDowns:[['Old Lady of Windmere',-43,11,'wind'],['Wheat terraces',-35,31,'tree']]
};

export const silverrunResidents = [
  ['spirehaven','iris-gate','Iris','Lantern keeper',15,18,'A ribbon for the spire',
    'The ribbon on our spire came loose last night. Visit the brass marker at the bottom of the hill and tell me which way the old ribbon points.',
    'Toward the market! I’ll tie the new one facing the same way.'],
  ['millbrook','alma-mill','Alma','Watermill keeper',-8,-32,'The miller’s mark',
    'The last flood left a line on the west bank. Can you find the brass marker across the bridge at Millbrook? I put it where the water stopped.',
    'Thank you. I’ll hang the spare flour sacks one shelf higher.'],
  ['windmereDowns','piper-downs','Piper','Sail mender',-36,17,'On the wind',
    'The Old Lady’s sails turn before anything else on this hill. Find the brass marker near her base and tell me if you can hear the canvas.',
    'That little flutter is the loose corner. I’ll mend it after the wheat is in.']
].map(([region,id,name,role,x,z,quest,intro,done],index)=>({
  realm:'silverrun',region,id,name,role,x,z,quest,intro,done,after:done,
  colors:[['#bb826b','#e7b698','#9f6754'][index],['#9f83bd','#72a69a','#d59a73'][index],'#534052'],
  portrait:{morph:index%2,style:4+index,accessory:3,outfit:0},
  goal:{stamp:region},find:'Survey the brass marker in '+silverrunPlaces[region].name,
  reward:{treat:2,berry:3}
}));

export const silverrunResources = [
  ['petal',19,8],['petal',7,22],['berry',29,-15],['wood',33,39],
  ['wood',-9,-42],['stone',-24,-33],['stone',-11,-19],['berry',-29,-38],['petal',-5,-32],
  ['petal',-37,28],['wood',-46,22],['berry',-30,27],['stone',-48,18],['berry',-34,9]
];

export const spirehavenCitizens = [
  ['scribe','Bramble','Guild scribe',12,3,'I keep the guild ledger under the loggia. Look up when you leave. The clock face catches the morning sun.'],
  ['boatkeeper','Wren','Boatkeeper',-6.55,4.5,'The little roofed bridge is Kingfisher. Cross it when the quay is busy and watch for birds over the water.'],
  ['gardener','Clover','Moonpetal gardener',27.25,-8.45,'The copper pipes on the Crooked Tower warm our garden wall. Come by at dusk and look for the moonpetals.'],
  ['stargazer','Lyra','Stargazer',22.65,-3.88,'The brass rings above the stair turn all day. Here on the terrace, we use the little armillary to follow their path.']
].map(([id,name,role,x,z,intro],index)=>({
  realm:'silverrun',id:'spirehaven-'+id,name,role,x,z,intro,
  colors:[['#c88d78','#aa7359','#e0a68b','#bb866e'][index],['#a888b9','#689092','#b77891','#758db8'][index],'#55405a'],
  shifts:[['Reading','Taking a break','Checking the ledger'],['Checking the moorings','Taking a break','Watching the river'],
    ['Tending plants','Reading','Tending the window boxes'],['Reading','Taking a break','Watching the spire']][index]
}));
