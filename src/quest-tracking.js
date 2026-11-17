import {items,recipes,regions,species,villagers,wildlife,questReady} from './content.js';
import {homeland,spells} from './horizons.js';
import {closest,findItemTarget} from './item-tracking.js';

const people=new Map(villagers.map(npc=>[npc.id,npc]));
const creatures=new Map(wildlife.map(([id,x,z,,realm=homeland])=>[id,{realm,x,z}]));

export function trackingSelection(state){
  const quest=people.get(state.trackingQuest);
  if(quest&&state.quests[quest.id]!=='done') return {id:quest.id,kind:'quest',title:quest.quest};
  const id=state.trackingItem;
  return Object.hasOwn(items,id)?{id,kind:'item',title:items[id][0]}:null;
}

export function findQuestTarget(state,id,{resources=null,resident,creature}={}){
  const tracked=people.get(id);
  if(!tracked||state.quests[id]==='done') return null;
  const seen=new Set();
  function person(npc,phase){
    return {id:npc.id,kind:'quest-npc',realm:npc.realm??homeland,
      ...(resident?.(npc.id)??{x:npc.x,z:npc.z}),phase,
      label:(phase==='turn-in'?'Return to ':'Talk to ')+npc.name};
  }
  function stock(item,note){
    const source=findItemTarget(state,item,resources);
    return source?{...source,note,stock:source.ingredient??item}:null;
  }
  function step(npc){
    if(seen.has(npc.id)) return null;
    seen.add(npc.id);
    const goal=npc.goal;
    if((goal.house||goal.spell)&&!state.magic.house)
      return person(people.get('mcgonagall'),'start');
    if(state.quests[npc.id]!=='active') return person(npc,'start');
    if(questReady(npc,state)) return person(npc,'turn-in');
    if(goal.quests){
      const prerequisite=goal.quests.find(id=>state.quests[id]!=='done');
      const next=prerequisite&&people.get(prerequisite);
      return next?step(next):null;
    }
    if(goal.stamp){
      const place=regions[goal.stamp],[x,z]=place.marker;
      return {id:goal.stamp,kind:'survey',realm:place.realm??homeland,x,z,label:'Survey the trail marker at '+place.name};
    }
    if(goal.spell){
      const spell=spells[goal.spell],[x,z]=spell.target;
      return {id:goal.spell,kind:'spell',realm:'hogwarts',x,z,label:spell.name+' at the '+spell.label.toLowerCase()};
    }
    if(goal.bond){
      const spec=species[goal.bond];
      if(!(state.inventory[spec.favorite]>0)){
        const offering=stock(spec.favorite,'Bring an offering for '+spec.name);
        if(offering) return offering;
      }
      const site=creatures.get(goal.bond);
      return {id:goal.bond,kind:'creature',...site,...creature?.(goal.bond),label:'Befriend '+spec.name};
    }
    if(goal.item){
      const have=state.inventory[goal.item]??0;
      return stock(goal.item,items[goal.item][0]+' '+have+'/'+goal.count);
    }
    const piece=goal.place??goal.craft;
    if(goal.place&&state.inventory[piece]>0)
      return {id:piece,kind:'build',label:'Place '+items[piece][0].toLowerCase()+' on open ground'};
    const missing=Object.entries(recipes[piece].cost).filter(([item,count])=>(state.inventory[item]??0)<count);
    if(missing.length){
      const leads=missing.map(([item,count])=>stock(item,items[item][0]+' '+(state.inventory[item]??0)+'/'+count)).filter(Boolean);
      if(leads.length) return closest(state,leads);
    }
    return {id:piece,kind:'craft',label:'Craft '+items[piece][0].toLowerCase()};
  }
  return step(tracked);
}
