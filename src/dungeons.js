import {undertowReef} from './undertow-reef.js';
import {skyIslands} from './sky-islands.js';
import {atlas} from './horizons.js';
import {dungeonHabitat} from './dungeon-habitats.js';
import {dungeonSites} from './dungeon-sites.js';
import {lowerFloorPlans,runeAnswerMatches,runePuzzle} from './dungeon-depths.js';

const styles=['mossvault','prismfault','bellhollow'];
const caveNames=['Rootways','Crystal Grotto','Echo Vault'];
function siteSeed(place){
  let value=2166136261;
  for(const letter of place)value=Math.imul(value^letter.charCodeAt(0),16777619);
  return value>>>0;
}
export const dungeonEntrances=Object.freeze([
  {id:'mossvault',name:'Mossvault Burrows',realm:'valley',x:-34,z:-18,yaw:0},
  {id:'prismfault',name:'Prismfault Caverns',realm:'valley',x:36,z:-34,yaw:0},
  {id:'bellhollow',name:'Bellhollow Depths',realm:'silverrun',x:-42,z:-13,yaw:0},
  ...dungeonSites.map(([place,label,realm,x,z,yaw])=>{
    const seed=siteSeed(place),style=seed%styles.length;
    const name=place==='corsairCove'?'Smuggler’s Undertow':label+' '+caveNames[style];
    return {id:'deep-'+place,name,place,realm,x,z,yaw,seed,style:styles[style]};
  })
]);

export const dungeonTowerCost=Object.freeze({crystal:5,coins:18});
export const dungeonMaxHealth=100;
export const dungeonPotionHealth=45;
export const dungeonTile=2.45;

const themes={
  mossvault:{
    seed:3467169,span:13,loops:19,
    stone:['#526468','#65777b','#708975','#536d60','#78837c'],floor:['#4c6662','#58756a','#668176'],
    accent:'#9eea91',secondary:'#ffe4a8',ambient:'#bfdec3',fog:'#162d33',torch:'#a1f1a4',
    motto:'Follow the lantern mushrooms where old roots split the stone.',
    chambers:['Fern Landing','Root Chapel','Lichen Gallery','Mossbell Pool','The Low Crown','Buried Orchard'],
    guardian:'Brambleback',treasures:['Rootkeeper’s Stash','Green Lantern Cache','Orchard Reliquary'],foes:['mossling','mossling','spirit']
  },
  prismfault:{
    seed:5731294,span:15,loops:26,
    stone:['#5b566e','#676281','#777795','#565274','#82758a'],floor:['#52516e','#5e5b79','#666584'],
    accent:'#b1a9fe',secondary:'#86e5f6',ambient:'#d5d5ff',fog:'#222237',torch:'#bdb1ff',
    motto:'The quartz crests change color as you pass the fault.',
    chambers:['Glass Step','Mirror Archive','Sunken Prism','The Split Lens','Lilac Rift','Starshard Vault'],
    guardian:'The Facet Warden',treasures:['Surveyor’s Case','Moon Lens Chest','Starglass Coffer'],foes:['spirit','sentinel','spirit']
  },
  bellhollow:{
    seed:9274213,span:16,loops:35,
    stone:['#6c5f75','#7d6e79','#806972','#67637a','#958174'],floor:['#665765','#716371','#75656e'],
    accent:'#ffd393',secondary:'#b5d1f5',ambient:'#f0d0e0',fog:'#2b2435',torch:'#ffc792',
    motto:'Listen for the tower bells. Their echoes carry through two different tunnels.',
    chambers:['Pilgrim’s Arch','Bellfounders’ Court','Echo Stair','The Quiet Bower','Blue Vesper Gate','The Last Bell'],
    guardian:'The Bronze Echo',treasures:['Ringer’s Locker','Pilgrim’s Offering','The Last Bell Casket'],foes:['sentinel','mossling','sentinel']
  }
};

for(const entrance of dungeonEntrances){
  if(!entrance.style)continue;
  const original=themes[entrance.style];
  themes[entrance.id]={...original,seed:entrance.seed,span:16+entrance.seed%3,loops:23+entrance.seed%17,
    chambers:[entrance.name+' Landing',...original.chambers.slice(1)],
    treasures:[original.treasures[0],original.treasures[1],entrance.name+' Reliquary']};
}

export const dungeonFoes=Object.freeze({
  mossling:{name:'Mossling',hp:42,damage:9,speed:1.55,reach:1.26},
  spirit:{name:'Lantern Wisp',hp:34,damage:12,speed:1.90,reach:2.20},
  sentinel:{name:'Stone Sentinel',hp:58,damage:15,speed:1.44,reach:1.55},
  guardian:{name:'Vault Guardian',hp:114,damage:19,speed:1.48,reach:1.74}
});

const cardinal=[[-1,0],[1,0],[0,-1],[0,1]];
const cache=new Map();

function seeded(seed){
  return ()=>{
    seed=(seed*1664525+1013904223)>>>0;
    return seed/4294967296;
  };
}

export function dungeonCell(layout,x,z){
  return x<0||z<0||x>=layout.width||z>=layout.height?null:layout.tiles[z*layout.width+x];
}

export function dungeonCellAt(layout,x,z){
  return dungeonCell(layout,Math.round(x/dungeonTile),Math.round(z/dungeonTile));
}

export function dungeonPassableCell(layout,x,z){
  const cell=dungeonCell(layout,x,z);
  return cell&&cell.index!==layout.blockedGate?cell:null;
}

export function dungeonDistanceField(layout,start){
  const field=new Int16Array(layout.tiles.length).fill(-1);
  if(!start) return field;
  const queue=[start];
  field[start.index]=0;
  for(let i=0;i<queue.length;i++){
    const cell=queue[i],distance=field[cell.index]+1;
    for(const [dx,dz] of cardinal){
      const next=dungeonPassableCell(layout,cell.x+dx,cell.z+dz);
      if(!next||field[next.index]>=0) continue;
      field[next.index]=distance;
      queue.push(next);
    }
  }
  return field;
}

export function dungeonStep(layout,cell,field){
  if(!cell||field[cell.index]<=0) return null;
  for(const [dx,dz] of cardinal){
    const next=dungeonPassableCell(layout,cell.x+dx,cell.z+dz);
    if(next&&field[next.index]===field[cell.index]-1) return next;
  }
  return null;
}

export function dungeonCanStand(layout,x,z,radius=.41){
  const open=(px,pz)=>dungeonPassableCell(layout,Math.round(px/dungeonTile),Math.round(pz/dungeonTile));
  return Boolean(open(x,z)&&open(x-radius,z-radius)&&open(x+radius,z+radius)&&
    open(x-radius,z+radius)&&open(x+radius,z-radius));
}

function createLayout(entrance,theme){
  const random=seeded(theme.seed),size=theme.span*2+1;
  const tiles=Array(size**2).fill(null),layout={...entrance,...theme,width:size,height:size,tiles};
  function carve(x,z,zone){
    const index=z*size+x;
    const tile=tiles[index]??={x,z,index,wx:x*dungeonTile,wz:z*dungeonTile,zone:null};
    if(zone!==undefined) tile.zone=zone;
    return tile;
  }
  const startX=3,startZ=size-2;
  const stack=[carve(startX,startZ)];
  while(stack.length){
    const last=stack[stack.length-1];
    const options=cardinal.map(([dx,dz])=>[last.x+dx*2,last.z+dz*2])
      .filter(([x,z])=>x>0&&z>0&&x<size-1&&z<size-1&&!dungeonCell(layout,x,z));
    if(!options.length){stack.pop();continue;}
    const [x,z]=options[Math.floor(random()*options.length)];
    carve((last.x+x)/2,(last.z+z)/2);
    stack.push(carve(x,z));
  }
  const walls=[];
  for(let z=1;z<size-1;z++) for(let x=1;x<size-1;x++){
    if(dungeonCell(layout,x,z)||x%2===z%2) continue;
    const alongX=x%2===0;
    const a=dungeonCell(layout,x-(alongX?1:0),z-(alongX?0:1));
    const b=dungeonCell(layout,x+(alongX?1:0),z+(alongX?0:1));
    if(a&&b) walls.push([x,z]);
  }
  for(let i=0;i<theme.loops;i++){
    const [[x,z]]=walls.splice(Math.floor(random()*walls.length),1);
    carve(x,z);
  }
  const entry=carve(startX,startZ-1,0),exit=carve(startX,startZ,0);
  const chamberPoints=[
    [startX,startZ],[size-4,size-4],[size-10,Math.floor(size/2)|1],
    [3,Math.floor(size/2)|1],[5,3],[size-4,3]
  ];
  for(const [i,[x,z]] of chamberPoints.entries()){
    const rx=i===2||i===5?2:1,rz=i===0?1:i===5?2:1;
    for(let dz=-rz;dz<=rz;dz++) for(let dx=-rx;dx<=rx;dx++){
      if(x+dx>0&&z+dz>0&&x+dx<size-1&&z+dz<size-1) carve(x+dx,z+dz,i);
    }
  }
  for(let z=startZ-4;z<startZ-1;z++) carve(startX,z,z===startZ-2?0:null);
  const tower=carve(...chamberPoints[2],2);
  const distances=dungeonDistanceField(layout,entry);
  const [vx,vz]=chamberPoints[5];
  const [gx,gz]=chamberPoints[4];
  const chests=[
    {id:'supplies',name:theme.treasures[0],cell:carve(startX+1,startZ-1,0),rewards:{hpPotion:1,coins:4}},
    {id:'casket',name:theme.treasures[1],cell:carve(gx+1,gz,4),rewards:{hpPotion:2,crystal:4,coins:11}},
    {id:'vault',name:theme.treasures[2],cell:carve(vx,vz-1,5),guard:'guardian',rewards:{hpPotion:2,crystal:7,coins:28}}
  ];
  const enemies=[];
  for(const [i,[x,z]] of chamberPoints.entries()){
    if(i===0||i===2) continue;
    const isGuardian=i===5;
    const cell=carve(x,z,i);
    enemies.push({id:isGuardian?'guardian':'chamber-'+i,kind:isGuardian?'guardian':theme.foes[i%theme.foes.length],cell});
    if(i===3||i===4) enemies.push({id:'watch-'+i,kind:theme.foes[(i+1)%theme.foes.length],cell:carve(x+1,z-1,i)});
  }
  for(let i=0;i<6;i++){
    const possible=tiles.filter(tile=>tile&&tile.zone===null&&distances[tile.index]>10&&
      enemies.every(enemy=>Math.hypot(enemy.cell.x-tile.x,enemy.cell.z-tile.z)>5));
    if(!possible.length) break;
    const cell=possible[Math.floor(random()*possible.length)];
    enemies.push({id:'patrol-'+i,kind:theme.foes[i%theme.foes.length],cell});
  }
  const habitat=dungeonHabitat(entrance),region=atlas[entrance.realm];
  layout.accent=habitat.color;layout.secondary=habitat.trim;
  layout.chambers=[...layout.chambers];layout.chambers[3]=habitat.landmark;
  // Keep the three original guardians and chest names familiar to returning players.
  if(entrance.place){
    layout.guardian=habitat.boss;
    chests[1].name=habitat.landmark+' Cache';
    chests[2].name=habitat.boss+'’s Hoard';
  }
  const cargo=skyIslands[entrance.place]?.item[0]??region.material??(habitat.family==='tide'?'salt':'wood');
  chests[1].rewards[cargo]=(chests[1].rewards[cargo]??0)+3;
  chests[2].rewards['relic-'+habitat.family]=1;
  if(entrance.place==='corsairCove'){
    layout.chambers=['The Rope Landing','Stolen Cargo','Beacon Room','The Ballast Lock','Keelhaul Steps','The Drowned Treasury'];
    layout.motto='Follow the tide marks to the drowned treasury. Mermaids swim quickly through the channels.';
    layout.guardian='The Keelbreaker';chests[2].name='Captain’s Pay Chest';
    for(const cell of tiles){
      if(!cell||cell.zone!==null)continue;
      const depth=distances[cell.index];
      cell.flooded=depth>=2&&(depth<=12||Math.floor(depth/9)%3!==0);
    }
    layout.diveMouth=dungeonCell(layout,entry.x,entry.z-2);
    layout.reef=undertowReef({...layout,habitat},dungeonTile);
    const locker=tiles.find(cell=>cell?.flooded&&distances[cell.index]===8);
    if(locker)chests.splice(1,0,{id:'tide-locker',name:'Shipwright’s Sunken Locker',cell:locker,rewards:{salt:4,'tideCompass':1}});
  }
  const approach=carve(4,startZ,0);
  layout.height+=6;
  tiles.length=layout.width*layout.height;
  tiles.fill(null,size**2);
  const gate=carve(4,size-1,null);
  const chest=carve(4,size,6);
  for(let z=size+1;z<=size+4;z++) for(let x=3;x<=5;x++) carve(x,z,6);
  const descent=carve(4,size+3,6);
  const puzzle={...runePuzzle(theme.seed,0),gate,approach,orientation:1};
  layout.chambers.push('The Lantern Stair');
  chests.splice(-1,0,{id:'seal-cache',name:'Lantern Stair Chest',cell:chest,sealed:true,rewards:{hpPotion:1,treat:2,coins:9}});
  return {...layout,habitat,entry,exit,tower,chests,enemies,puzzle,descent,depth:0};
}

function createLowerLayout(surface,depth){
  const plan=lowerFloorPlans[depth-1];
  const width=plan[0].length,height=plan.length;
  const layout={...surface,depth,width,height,tiles:[],entry:null,exit:null,tower:null,diveMouth:null,reef:null,
    name:surface.name,chambers:depth===1?['Lantern Cellar','The Spiral Landing']:['Wishing Hollow','The Rune Treasury'],
    enemies:[],chests:[],descent:null};
  let gate,chest;
  const gateRow=plan.findIndex(row=>row.includes('G'));
  for(const [z,row] of plan.entries()){
    for(const [x,mark] of [...row].entries()){
      const index=z*width+x;
      if(mark==='#'){layout.tiles.push(null);continue;}
      const cell={x,z,index,wx:x*dungeonTile,wz:z*dungeonTile,zone:z===gateRow?null:z>gateRow?0:1};
      layout.tiles.push(cell);
      if(mark==='U') layout.exit=cell;
      if(mark==='E') layout.entry=cell;
      if(mark==='D') layout.descent=cell;
      if(mark==='G') gate=cell;
      if(mark==='C') chest=cell;
    }
  }
  const approach=dungeonCell(layout,gate.x,gate.z+1);
  layout.puzzle={...runePuzzle(surface.seed,depth),gate,approach,orientation:-1};
  layout.chests.push({id:'seal-cache',name:depth===1?'Spiral Landing Chest':'Rune Treasury Chest',cell:chest,sealed:true,
    rewards:depth===1?{hpPotion:2,crystal:3,coins:16}:{charm:2,crystal:6,coins:25,['relic-'+surface.habitat.family]:1}});
  return layout;
}

export function dungeonLayout(id,depth=0){
  if(!Object.hasOwn(themes,id)||!Number.isInteger(depth)||depth<0||depth>lowerFloorPlans.length) return null;
  if(!cache.has(id)) cache.set(id,createLayout(dungeonEntrances.find(entry=>entry.id===id),themes[id]));
  if(!depth) return cache.get(id);
  const key=id+'/'+depth;
  if(!cache.has(key)) cache.set(key,createLowerLayout(cache.get(id),depth));
  return cache.get(key);
}

function atCell(cell){
  return {x:cell.wx,z:cell.wz,yaw:Math.PI};
}

export function newDungeons(){
  return {active:null,firstPerson:false,health:dungeonMaxHealth,towers:{},expeditions:{}};
}

function newExpedition(layout){
  return {position:atCell(layout.entry),visited:[],opened:[],defeated:[],...(layout.puzzle?{seal:false}:{})};
}

function normalizeExpedition(layout,expedition){
  const filter=(list,allowed)=>Array.isArray(list)?[...new Set(list.filter(id=>allowed.has(id)))]:[];
  const position=expedition.position;
  const seal=layout.puzzle&&expedition.seal===true;
  const blocked=layout.puzzle&&!seal;
  // Legacy floor-one tile indices stay unchanged when the new wing is appended.
  const beyond=cell=>blocked&&(cell.z-layout.puzzle.gate.z)*layout.puzzle.orientation>=0;
  const standing=dungeonCellAt(layout,position?.x,position?.z);
  const walkable=blocked?{...layout,blockedGate:layout.puzzle.gate.index}:layout;
  const safe=Number.isFinite(position?.x)&&Number.isFinite(position?.z)&&dungeonCanStand(walkable,position.x,position.z)&&!beyond(standing);
  return {
    position:safe?{x:position.x,z:position.z,yaw:Number.isFinite(position.yaw)?position.yaw%(Math.PI*2):Math.PI}:atCell(layout.entry),
    visited:filter(expedition.visited,new Set(layout.tiles.filter(cell=>cell&&!beyond(cell)).map(cell=>cell.index))),
    opened:filter(expedition.opened,new Set(layout.chests.filter(chest=>seal||!chest.sealed).map(chest=>chest.id))),
    defeated:filter(expedition.defeated,new Set(layout.enemies.map(enemy=>enemy.id))),
    ...(layout.puzzle?{seal}: {})
  };
}

export function normalizeDungeons(raw){
  const clean=newDungeons();
  clean.firstPerson=raw?.firstPerson===true;
  if(Number.isFinite(raw?.health)) clean.health=Math.min(dungeonMaxHealth,Math.max(0,Math.floor(raw.health)));
  for(const {id} of dungeonEntrances){
    const expedition=raw?.expeditions?.[id];
    if(!expedition||typeof expedition!=='object') continue;
    const layout=dungeonLayout(id);
    const surface=clean.expeditions[id]=normalizeExpedition(layout,expedition);
    let previous=surface;
    for(let depth=1;depth<=lowerFloorPlans.length&&previous.seal;depth++){
      const savedFloor=expedition.floors?.[depth];
      if(!savedFloor||typeof savedFloor!=='object') break;
      (surface.floors??={})[depth]=previous=normalizeExpedition(dungeonLayout(id,depth),savedFloor);
    }
    if(raw.active===id&&Number.isInteger(expedition.depth)&&Object.hasOwn(surface.floors??{},expedition.depth)){
      surface.depth=expedition.depth;
    }
    if(layout.reef&&expedition.reef&&typeof expedition.reef==='object'){
      surface.reef=normalizeExpedition(layout.reef,expedition.reef);
      surface.diving=raw.active===id&&!surface.depth&&expedition.diving===true;
    }
    if(raw?.towers?.[id]===true) clean.towers[id]=true;
  }
  if(typeof raw?.active==='string'&&Object.hasOwn(clean.expeditions,raw.active)) clean.active=raw.active;
  return clean;
}

export function enterDungeon(state,id,{atTower=false}={}){
  const layout=dungeonLayout(id);
  if(!layout) return false;
  const progress=state.dungeons??=newDungeons();
  if(atTower&&!progress.towers[id]) return false;
  const expedition=progress.expeditions[id]??=newExpedition(layout);
  if(expedition.reef)expedition.diving=false;
  delete expedition.depth;
  expedition.position=atCell(atTower?layout.tower:layout.entry);
  if(atTower) expedition.position.z+=1.12;
  progress.active=id;
  return true;
}

export function changeDiveDepth(state){
  const progress=state.dungeons,layout=dungeonLayout(progress.active);
  const surface=progress.expeditions[progress.active];
  if(!layout?.reef||!surface||surface.depth)return false;
  const leaving=surface.diving===true;
  if(!leaving&&state.look?.morph!==5)return false;
  const position=leaving?surface.reef.position:surface.position;
  const mouth=leaving?layout.reef.exit:layout.diveMouth;
  if(Math.hypot(position.x-mouth.wx,position.z-mouth.wz)>=1.46)return false;
  if(!leaving){
    surface.reef??=newExpedition(layout.reef);
    surface.reef.position=atCell(layout.reef.entry);
  }
  surface.diving=!leaving;
  return true;
}

export function dungeonLayer(state){
  const progress=state.dungeons,id=progress.active,trip=progress.expeditions[id];
  if(!trip) return {};
  const depth=trip.depth??0;
  if(trip.diving&&state.look?.morph===5) return {layout:dungeonLayout(id).reef,expedition:trip.reef,diving:true};
  return {layout:dungeonLayout(id,depth),expedition:depth?trip.floors?.[depth]:trip,diving:false};
}

function nearCell(position,cell){
  return cell&&Math.hypot(position.x-cell.wx,position.z-cell.wz)<1.46;
}

export function openDungeonSeal(state,answer){
  const {layout,expedition}=dungeonLayer(state);
  if(!layout?.puzzle||!expedition||expedition.seal||!nearCell(expedition.position,layout.puzzle.approach)||
     !runeAnswerMatches(layout.puzzle,answer)) return false;
  expedition.seal=true;
  return true;
}

export function changeDungeonFloor(state,direction){
  const {layout,expedition,diving}=dungeonLayer(state);
  if(!layout||!expedition||diving||![1,-1].includes(direction))return false;
  const {active:id,expeditions}=state.dungeons,trip=expeditions[id];
  const depth=layout.depth+direction;
  const next=dungeonLayout(id,depth);
  if(!next)return false;
  if(direction===1){
    if(!expedition.seal||!nearCell(expedition.position,layout.descent))return false;
    const floor=(trip.floors??={})[depth]??=newExpedition(next);
    floor.position=atCell(next.entry);
    trip.depth=depth;
  } else {
    if(!nearCell(expedition.position,layout.exit))return false;
    const floor=depth?trip.floors[depth]:trip;
    floor.position={...atCell(next.descent),yaw:layout.depth===1?Math.PI:0};
    if(depth)trip.depth=depth;
    else delete trip.depth;
  }
  return true;
}

export function buildDungeonTower(state,id){
  if(!dungeonLayout(id)||state.dungeons.active!==id||state.dungeons.expeditions[id]?.depth||state.dungeons.towers[id]||
    (state.inventory.crystal??0)<dungeonTowerCost.crystal||state.wallet.coins<dungeonTowerCost.coins) return false;
  state.wallet.coins-=dungeonTowerCost.coins;
  state.inventory.crystal-=dungeonTowerCost.crystal;
  state.dungeons.towers[id]=true;
  return true;
}

export function drinkDungeonPotion(state){
  const progress=state.dungeons;
  if(progress.health<=0||progress.health>=dungeonMaxHealth||!(state.inventory.hpPotion>0)) return false;
  state.inventory.hpPotion--;
  progress.health=Math.min(dungeonMaxHealth,progress.health+dungeonPotionHealth);
  return true;
}
