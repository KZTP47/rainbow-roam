import {items,recipes,regions,resourceSpots,villagers,regionAt} from './content.js';
import {atlas,horizonResources,homeland} from './horizons.js';
import {geography,worldPoint} from './overworld.js';
import {skyWalkRadius} from './sky-islands.js';
import {townServices} from './town-data.js';
import {marketAtPlace,marketStalls} from './market.js';
import {home,crops,plots} from './homestead.js';
import {caches,kitchen} from './town-life.js';
import {BANDITS} from './combat.js';

const position=(realm,x,z,kind,label,id)=>({realm,x,z,kind,label,id});
const resourceLabel='Forage';
const serviceStops=townServices.filter(station=>station.kind==='market');
const counters=[
  ...serviceStops,
  ...marketStalls()
].map(({realm,place,x,z})=>{
  const {name,goods}=marketAtPlace(realm,place);
  return {goods,target:position(realm,x,z,'shop',name,place)};
});
const kitchenStops=townServices.filter(s=>['garden','market','inn'].includes(s.kind)).map(s=>
  position(s.realm,s.x,s.z,'kitchen',s.name,s.place));
const residentCoords=Object.groupBy(villagers,v=>v.realm??homeland);
const resourceCoords=Object.entries({...horizonResources,[homeland]:resourceSpots}).flatMap(([realm,spots])=>
  spots.flatMap(([id,x,z],i)=>{
    const land=geography[realm];
    if(Math.abs(x)>=land.rx-(realm==='valley'?2:1)||Math.abs(z)>=land.rz-(realm==='valley'?2:1)||
      (realm==='coast'&&x<=-47)||(realm===homeland&&Math.hypot(x,z-10)<2.9)||
      (realm==='sky'&&!Object.values(regions).some(r=>r.realm===realm&&Math.hypot(x-r.x,z-r.z)<skyWalkRadius))||
      residentCoords[realm]?.some(v=>Math.hypot(x-v.x,z-v.z)<1.25)) return [];
    return [{...position(realm,x,z,'resource',resourceLabel,id),key:realm===homeland?'r'+i:realm+'-r'+i}];
  }));
const byResource=Object.groupBy(resourceCoords,s=>s.id);
const homeDoor=position(homeland,home.x,home.z+2.85,'farm','Clover Cottage',null);
const farmGate=position(homeland,19,26.05,'farm','Kitchen garden','garden');

export function trackingDistance(state,target){
  const start=worldPoint(state.realm,state.player.x,state.player.z);
  const end=worldPoint(target.realm,target.x,target.z);
  const altitude=id=>geography[id].altitude??0;
  return Math.hypot(end.x-start.x,end.z-start.z,(altitude(target.realm)-altitude(state.realm))*2);
}

export function closest(state,candidates){
  let best=null,distance=Infinity;
  for(const target of candidates){
    const range=trackingDistance(state,target);
    if(range<distance){distance=range;best=target;}
  }
  return best;
}

export function findItemTarget(state,id,localResources=null,now=Date.now(),seen=new Set()){
  if(!Object.hasOwn(items,id)||seen.has(id)) return null;
  seen=new Set(seen).add(id);
  const local=localResources===null?null:
    localResources.filter(r=>r.id===id).map(r=>({...position(state.realm,r.x,r.z,'resource',resourceLabel,id),key:r.key}));
  const forage=[...(byResource[id]??[]).filter(r=>local===null||r.realm!==state.realm),...(local??[])]
    .filter(r=>!(state.harvested[r.key]>now));
  const loot=(state.loot??[]).filter(drop=>drop.items[id]>0).map(drop=>
    position(drop.realm,drop.x,drop.z,'loot','Bandit loot',drop.id));
  const shops=counters.filter(counter=>counter.goods.some(([stock])=>stock===id)).map(counter=>counter.target);
  const chart=caches[state.townLife.chart];
  const dig=chart?.items[id]>0?[position(chart.realm,chart.x,chart.z,'cache',chart.name,state.townLife.chart)]:[];
  const seed=Object.keys(crops).find(key=>crops[key].crop===id);
  const beds=seed&&state.homestead.owned?state.homestead.plots.flatMap((plot,i)=>
    plot?.seed===seed&&plot.readyAt<=now?[position(homeland,...plots[i],'harvest','Kitchen garden',i)]:[]):[];
  const direct=closest(state,[...forage,...loot,...shops,...dig,...beds]);
  if(direct) return direct;

  if(seed){
    if(!state.homestead.owned) return {...homeDoor,label:'Buy Clover Cottage to grow '+items[id][0].toLowerCase()};
    if(state.homestead.plots.some(p=>p?.seed===seed)||state.inventory[seed]>0)
      return {...farmGate,label:'Grow '+items[id][0].toLowerCase()};
    const target=findItemTarget(state,seed,localResources,now,seen);
    if(target) return {...target,ingredient:seed};
  }
  const recipe=recipes[id]??kitchen[id];
  if(recipe){
    const missing=Object.keys(recipe.cost).filter(part=>(state.inventory[part]??0)<recipe.cost[part]);
    if(missing.length){
      const ingredientTargets=missing.flatMap(part=>{
        const target=findItemTarget(state,part,localResources,now,seen);
        return target?[{...target,ingredient:target.ingredient??part}]:[];
      });
      if(ingredientTargets.length) return closest(state,ingredientTargets);
    }
    return Object.hasOwn(kitchen,id)?closest(state,[...kitchenStops,...(state.homestead.owned?[{...homeDoor,kind:'kitchen'}]:[])]):
      position(state.realm,state.player.x,state.player.z,'craft','Crafting bench',id);
  }

  if(id==='trailMapScrap'){
    const captured=Object.keys(state.bounties.captured).length;
    const wanted=BANDITS.filter(b=>!state.bounties.captured[b.id]&&(captured===0||b.badges>=3||(captured+1)%4===0));
    const bounty=closest(state,wanted);
    if(bounty) return position(bounty.realm,bounty.x,bounty.z,'bounty',bounty.name,bounty.id);
  }
  const quest=closest(state,villagers.flatMap(npc=>npc.reward[id]>0&&state.quests[npc.id]!=='done'?
    [position(npc.realm??homeland,npc.x,npc.z,'quest',npc.name,npc.id)]:[]));
  return quest;
}

export function trackingText(target){
  if(!target) return 'No available destination';
  const lead=target.ingredient?'Find '+items[target.ingredient][0].toLowerCase()+' · ':'';
  return [target.note,lead+target.label].filter(Boolean).join(' · ');
}

export function trackingRegion(target){
  return target.realm==='sky'?regions[regionAt(target.x,target.z,'sky')].name:atlas[target.realm].name;
}
