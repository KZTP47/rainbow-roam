import {items,recipes,species,regions,villagers,newGame,SAVE_KEY} from './content.js';
import {atlas,homeland,houses,spells} from './horizons.js';
import {normalizeLook} from './wardrobe.js';
import {normalizeHomestead} from './homestead.js';
import {normalizeBounties} from './combat.js';
import {normalizeLoot} from './loot.js';
import {normalizeTownLife} from './town-life.js';
import {inHold} from './marigold.js';

const format='rainbow-roam-save';
const maxFileSize=2_000_000;
const isRecord=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const known=(record,id)=>typeof id==='string'&&Object.hasOwn(record,id);
const number=(value,fallback,min,max)=>Number.isFinite(value)?Math.min(max,Math.max(min,value)):fallback;
const counter=(value,fallback=0)=>Math.floor(number(value,fallback,0,1_000_000));
const filtered=(raw,keys,decode)=>Object.fromEntries(keys.flatMap(id=>{
  if(!isRecord(raw)||!Object.hasOwn(raw,id)) return [];
  const value=decode(raw[id],id);
  return value===undefined?[]:[[id,value]];
}));
const list=(raw,keys)=>Array.isArray(raw)?[...new Set(raw.filter(id=>known(keys,id)))]:[];
const speciesIds=Object.keys(species);
const itemIds=Object.keys(items);
const questIds=villagers.map(person=>person.id);
const regionIds=Object.keys(regions);
const levels=7;

export function normalizeSave(saved){
  if(!isRecord(saved)||saved.version!==1||!Number.isFinite(saved.player?.x)||
    !Number.isFinite(saved.player?.z)||!isRecord(saved.inventory)) throw new Error('This file is not a Rainbow Roam save.');
  const fresh=newGame();
  const companions=list(saved.companions,species);
  const bounties=normalizeBounties(saved.bounties);
  if(bounties.abducted&&!companions.includes(bounties.abducted.pet)) bounties.abducted=null;
  const realm=known(atlas,saved.realm)?saved.realm:homeland;
  const blocks=[],cells=new Set();
  if(Array.isArray(saved.blocks)){
    for(const block of saved.blocks.slice(0,800)){
      if(!isRecord(block)||!known(recipes,block.type)||!recipes[block.type].build||!
        [block.x,block.z,block.level,block.turn].every(Number.isInteger)) continue;
      const {x,z,level,type}=block;
      if(Math.max(Math.abs(x),Math.abs(z))>350||level<0||level>=levels) continue;
      const turn=(block.turn%4+4)%4,room=known(atlas,block.realm)?block.realm:homeland;
      const cell=[room,x,z,level].join(',');
      if(cells.has(cell)) continue;
      cells.add(cell);
      const construction={type,x,z,level,turn};
      if(room!==homeland||block.realm===homeland) construction.realm=room;
      blocks.push(construction);
    }
  }
  const discoveries=list(saved.discoveries,regions);
  if(!discoveries.includes('village')) discoveries.unshift('village');
  const spellIds=Object.keys(spells);
  const magic=saved.magic;
  const mode=saved.transit?.mode;
  const mount=saved.transit?.mount;
  const townLife=normalizeTownLife(saved.townLife,regions,species,companions);
  const active=companions.includes(saved.active)&&saved.active!==bounties.abducted?.pet&&saved.active!==townLife.trip?.pet?saved.active:null;
  return {
    ...fresh,realm,companions,active,blocks,discoveries,bounties,townLife,loot:normalizeLoot(saved.loot),
    player:{x:number(saved.player.x,0,-480,480),z:number(saved.player.z,10,-480,480),yaw:number(saved.player.yaw,0,-1e6,1e6),
      ...(realm==='silvercoast'&&!mode&&saved.player.belowDeck===true&&inHold(saved.player.x,saved.player.z)?{belowDeck:true}:{})},
    transit:['fly','swim'].includes(mode)&&Number.isFinite(saved.transit.y)
      ? {mode,y:number(saved.transit.y,0,-100,110),mount:companions.includes(mount)&&mount!==bounties.abducted?.pet&&mount!==townLife.trip?.pet?mount:null}
      : null,
    look:normalizeLook(saved.look),time:number(saved.time,8,0,24)%24,sound:saved.sound!==false,
    stamp:filtered(saved.stamp,regionIds,v=>v===true||v===1?true:undefined),
    care:filtered(saved.care,speciesIds,record=>isRecord(record)?{
      affinity:Math.min(12,counter(record.affinity)),resting:record.resting===true,
      ...filtered(record,['petAt','feedAt','playAt'],v=>number(v,0,0,Date.now()))
    }:undefined),
    magic:{house:known(houses,magic?.house)?magic.house:null,known:list(magic?.known,spells),
      mastered:filtered(magic?.mastered,spellIds,v=>v===true?true:undefined)},
    wallet:{coins:counter(saved.wallet?.coins,fresh.wallet.coins),badges:counter(saved.wallet?.badges)},
    inventory:filtered(saved.inventory,itemIds,counterValue),
    bonds:filtered(saved.bonds,speciesIds,counterValue),
    quests:isRecord(saved.quests)?filtered(saved.quests,questIds,v=>v==='active'||v==='done'?v:undefined):fresh.quests,
    crafted:filtered(saved.crafted,itemIds,counterValue),
    placed:filtered(saved.placed,itemIds,counterValue),
    harvested:filteredHarvests(saved.harvested),
    selected:known(recipes,saved.selected)&&recipes[saved.selected].build?saved.selected:fresh.selected,
    trackingItem:known(items,saved.trackingItem)?saved.trackingItem:null,
    trackingQuest:!known(items,saved.trackingItem)&&questIds.includes(saved.trackingQuest)&&saved.quests?.[saved.trackingQuest]!=='done'?saved.trackingQuest:null,
    homestead:normalizeHomestead(saved.homestead)
  };
}

function counterValue(value){
  return finiteNonnegative(value)?counter(value):undefined;
}

function finiteNonnegative(value){return Number.isFinite(value)&&value>=0;}

function filteredHarvests(raw){
  if(!isRecord(raw)) return {};
  const latest=Date.now()+180000;
  return Object.fromEntries(Object.entries(raw).filter(([id,value])=>
    /^(?:[a-z]+-)?r[0-9]{1,4}$/.test(id)&&Number.isFinite(value)&&value>Date.now()
  ).slice(0,3500).map(([id,value])=>[id,Math.min(value,latest)]));
}

export function loadGame(){
  try {
    const raw=localStorage.getItem(SAVE_KEY);
    return raw?normalizeSave(JSON.parse(raw)):null;
  } catch {return null;}
}

export function encodeSave(state){
  return JSON.stringify({format,version:1,exportedAt:new Date().toISOString(),progress:state},null,2)+'\n';
}

export function decodeSave(text){
  let data;
  try {data=JSON.parse(text.replace(/^\uFEFF/,''));}
  catch {throw new Error('The file contains invalid JSON.');}
  if(data?.format===format){
    if(data.version!==1) throw new Error('This save uses a newer file format.');
    return normalizeSave(data.progress);
  }
  return normalizeSave(data);
}

export async function readSaveFile(file){
  if(file.size>maxFileSize) throw new Error('Choose a Rainbow Roam JSON save under 2 MB.');
  return decodeSave(await file.text());
}

export function downloadSave(state){
  const url=URL.createObjectURL(new Blob([encodeSave(state)],{type:'application/json'}));
  const link=document.createElement('a');
  link.download='Rainbow-Roam-'+new Date().toISOString().slice(0,10)+'.json';
  link.href=url;
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),3000);
}
