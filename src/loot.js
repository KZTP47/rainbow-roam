import {geography} from './overworld.js';

const spoils={
  sabre:{wood:2,berry:1},
  bow:{petal:2,treat:1},
  guard:{stone:2,crystal:1},
  rush:{berry:2,wood:1}
};
const itemIds=new Set([...Object.values(spoils).flatMap(items=>Object.keys(items)),'trailMapScrap']);
const typeId=/^trail-[a-z0-9]{1,24}-[a-z0-9]{1,12}$/;
const maxDrops=1024;
const pickupRadius=2.48;
let serial=0;

export function normalizeLoot(raw){
  if(!Array.isArray(raw)) return [];
  const drops=[],seen=new Set();
  for(const row of raw.slice(0,maxDrops)){
    if(!row||typeof row.id!=='string'||!typeId.test(row.id)||seen.has(row.id)||
      typeof row.realm!=='string'||!Object.hasOwn(geography,row.realm)||
      !Number.isFinite(row.x)||!Number.isFinite(row.z)) continue;
    const bounds=geography[row.realm];
    if(Math.abs(row.x)>bounds.rx+1||Math.abs(row.z)>bounds.rz+1) continue;
    const coins=Number.isInteger(row.coins)?Math.max(0,Math.min(250,row.coins)):0;
    const items=Object.fromEntries([...itemIds].flatMap(id=>{
      const count=row.items?.[id];
      return Number.isInteger(count)&&count>0?[[id,Math.min(count,12)]]:[];
    }));
    if(!coins&&!Object.keys(items).length) continue;
    seen.add(row.id);drops.push({id:row.id,realm:row.realm,x:row.x,z:row.z,coins,items});
  }
  return drops;
}

export function leaveBanditLoot(state,enemy,realm,coins,bounty){
  const {data,x,z}=enemy,items={...spoils[data.style]};
  const captured=Object.keys(state.bounties?.captured??{}).length;
  if(bounty&&(captured===1||data.badges>=3||captured%4===0)) items.trailMapScrap=1;
  const drop={id:'trail-'+Date.now().toString(36)+'-'+(++serial).toString(36),realm,x,z,coins,items};
  const ground=state.loot??=[];
  if(ground.length>=maxDrops){
    const bundle=ground.find(row=>row.realm===realm)??ground[0];
    // Sent to the satchel when the physical drop limit is reached.
    award(state,bundle);
    ground.splice(ground.indexOf(bundle),1);
  }
  ground.push(drop);
  return drop;
}

function award(state,drop){
  state.wallet.coins+=drop.coins;
  for(const [id,count] of Object.entries(drop.items)) state.inventory[id]=(state.inventory[id]??0)+count;
}

export function nearbyLoot(state,realm,range=pickupRadius){
  if(state.transit?.mode==='fly') return null;
  let candidate=null,distance=range;
  const player=state.player;
  for(const drop of state.loot??[]){
    if(drop.realm!==realm) continue;
    const gap=Math.hypot(drop.x-player.x,drop.z-player.z);
    if(gap<distance){candidate=drop;distance=gap;}
  }
  return candidate;
}

export function pickUpLoot(state,realm,id){
  const loot=nearbyLoot(state,realm);
  if(!loot||loot.id!==id) return null;
  state.loot.splice(state.loot.indexOf(loot),1);
  award(state,loot);
  return {coins:loot.coins,items:loot.items};
}
