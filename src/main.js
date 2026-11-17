import './frontier-ui.css';
import './property-map.css';
import './property-walk.css';
import './property-entry.css';
import './item-tracking.css';
import './map-item-route.css';
import './town-life.css';
import './fieldbook.css';
import './festival-visual.css';
import './combat.css';
import {createUI} from './ui.js';
import {makeAudio} from './audio.js';
import {items,recipes,species,regions,villagers,SAVE_KEY,restTimes,newGame,canAfford,questReady,regionAt} from './content.js';

import {sideConversations} from './dialogue.js';
import {wardrobe,defaultLook} from './wardrobe.js';
import {atlas,homeland,houses,spells} from './horizons.js';
import {loadGame,readSaveFile,downloadSave} from './save-files.js';
import {home,currencies,cropFood,workHomestead,propertyArea,nearHomestead} from './homestead.js';
import {makeHomestead} from './homestead-art.js';
import {transact} from './market.js';
import {trackingDistance} from './item-tracking.js';
import {trackingSelection} from './quest-tracking.js';
import {townServices,townServiceAt} from './town-data.js';
import {caches,kitchen,markTownVisit,takeBlessing,townLifeAction} from './town-life.js';
import {ownsGameWindow,onGameWindowClose} from './game-window.js';

const loaded=loadGame();
const state=loaded??newGame();
const audio=makeAudio(()=>state.sound);
const buildTypes=Object.keys(recipes).filter(id=>recipes[id].build);
const currentRegion={id:'village'};
const keyPanels={i:'bag',c:'companions',k:'craft',j:'journal',m:'map',o:'wardrobe',
  p:'care',t:'spells',v:'atlas',l:'market',u:'homestead',y:'bounties',n:'activities'};
const motionKeys=new Set(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright','shift']);
const travelPoints={village:[0,10],grove:[-24,-10],lake:[14,-6],ridge:[29,-41],fields:[-5,29]};
let world,createWorld,active=false,building=false,starting=false,importing=false,propertyEntry=propertyArea(state.player,state.realm);
const ui=createUI(document.querySelector('#app'),state,{start,action,mapHeight:(realm,x,z)=>world?.mapHeight(realm,x,z),drawOutfit:(canvas,framing)=>world?.drawOutfit(canvas,framing),walkRenderer:()=>world?.renderer,propertyPreview:view=>world?.propertyPreview(view),trackingJourney:()=>world?.trackingJourney(),activityContext,importFile},Boolean(loaded));

function persist(show=true) {
  if(!ownsGameWindow()) return false;
  try {
    localStorage.setItem(SAVE_KEY,JSON.stringify(state));
    if(show) ui.saveStatus(true);
    return true;
  } catch {
    ui.saveStatus(false);
    return false;
  }
}
function gain(id,amount) {state.inventory[id]=(state.inventory[id]??0)+amount;}

function regionReached(id) {
  currentRegion.id=id;
  const place=regions[id];
  if(place.discoverWithin&&Math.hypot(state.player.x-place.x,state.player.z-place.z)>place.discoverWithin) return;
  const stamp=markTownVisit(state,id);
  if(stamp){ui.toast(stamp,regions[id].name,'compass');persist();}
  if(!state.discoveries.includes(id)) {
    state.discoveries.push(id);
    state.wallet.coins+=4;
    ui.toast(regions[id].name,'Discovered · +4 Suncoins','pin');
    audio.play('travel');persist();
  }
}
async function start() {
  if(starting||importing) return;
  starting=true;
  const button=document.querySelector('#start');
  button.setAttribute('aria-busy','true');
  audio.unlock();
  if(!world) {
    try {
      ({createWorld}=await import('./world.js'));
      world=mountWorld();
    } catch(error) {
      console.error(error);
      ui.error('Rainbow Roam needs a browser with WebGL 2. Try enabling graphics acceleration and reloading.');
      starting=false;
      button.removeAttribute('aria-busy');
      return;
    }
  }
  active=true;starting=false;
  button.removeAttribute('aria-busy');
  ui.setSaveAvailable();ui.showGame(true); world.setActive(true); world.setPaused(false);
  persist(); ui.refresh();
}
function crossRealm(realm,player,transit,held,view){
  const previous=world;
  state.realm=realm;state.player=player;state.transit=transit;
  world=mountWorld();
  previous.destroy();
  building=false;ui.renderBuild(false,false);
  world.setActive(true);world.resume(held,view);
  persist();
}

function inspectProperty(player,realm){
  const entered=propertyArea(player,realm), previous=propertyEntry;
  propertyEntry=entered;
  if(entered&&entered!==previous&&state.homestead.owned&&!ui.opened) menu('homestead',entered);
}

function mountWorld() {
  const mounted=createWorld(ui.view,state,{
    region:regionReached,cross:crossRealm,inspectProperty,trackingTrail:ui.trackingTrail,
    cacheAt(player,realm){
      const entry=caches[state.townLife.chart];
      return entry?.realm===realm&&Math.hypot(player.x-entry.x,player.z-entry.z)<2.6
        ?{kind:'treasure',id:state.townLife.chart,label:'Search for the buried cache',hint:entry.name}:null;
    },
    makeHomestead:(scene,realm,height)=>makeHomestead(scene,realm,height,state),
    combatReport({title,detail,icon}){ui.toast(title,detail,icon);ui.refresh();persist();},
    update(candidate,elapsed,landing){ui.update(currentRegion.id,candidate,state.time,elapsed,landing);},
    aim:ui.setReticle,
    place:placeBlock,remove:removeBlock,
    lost(value){
      world?.setLost(value);
      document.querySelector('#game-alert').hidden=!value;
      if(value) ui.error('Graphics paused. Waiting for your browser to restore the world.');
    },
    blockError(text){ui.toast(text,'','hammer');}
  });
  mounted.syncTracking();
  return mounted;
}

function travel(id,allowUndiscovered=false) {
  const destination=regions[id];
  if(!destination||(!allowUndiscovered&&!state.discoveries.includes(id))) return;
  const realm=destination.realm??homeland;
  const [x,z]=travelPoints[id]??destination.travel;
  const yaw=destination.yaw??0;
  const previousTransit=state.transit;
  state.transit=null;
  if(realm===state.realm){
    if(!world.canWalk(x,z)) {state.transit=previousTransit;return;}
    Object.assign(state.player,{x,z,yaw});
    delete state.player.belowDeck;
  } else {
    const prior=world, previousRealm=state.realm, previousPosition={...state.player};
    Object.assign(state.player,{x,z,yaw});
    delete state.player.belowDeck;
    state.realm=realm;
    try { world=mountWorld(); }
    catch(error) {
      state.realm=previousRealm;state.player=previousPosition;state.transit=previousTransit;
      console.error(error);
      ui.toast('The voyage could not start','Your current location was kept.','compass');
      return;
    }
    prior.destroy();
    world.setActive(true);
  }
  if(building) { building=false;world.setBuild(false,state.selected);ui.renderBuild(false,false); }
  ui.clearToasts();
  regionReached(id);
  world.resetCamera();menu(null);audio.play('travel');persist();
}

function menu(id, detail) {
  ui.showPanel(id,detail);
  world?.setPaused(Boolean(id));
}
function refresh() {
  ui.refresh();
  if(building) ui.renderBuild(true,false);
  persist();
}
function toggleBuild() {
  if(!world || !active) return;
  if(ui.opened) {menu(null);building=true;}
  else building=!building;
  world.setBuild(building,state.selected);
  ui.renderBuild(building,false);
}
function selectPiece(type) {
  if(!buildTypes.includes(type)) return;
  state.selected=type;
  world.setBuild(building,type);
  ui.renderBuild(building,false);
  persist();
}
function placeBlock(data) {
  if(!(state.inventory[data.type]>0)) return;
  if(state.blocks.length>=800) {
    ui.toast('Your valley is full','Remove a piece to make room.','hammer');return;
  }
  gain(data.type,-1);
  state.blocks.push(data);
  state.placed[data.type]=(state.placed[data.type]??0)+1;
  world.placeBlock(data);audio.play('place');refresh();
}
function removeBlock(data) {
  const index=state.blocks.indexOf(data);
  if(index<0) return;
  state.blocks.splice(index,1); gain(data.type,1);
  world.removeBlock(data);audio.play('remove');refresh();
}
function craft(id) {
  const recipe=recipes[id];
  if(!recipe||!canAfford(state.inventory,recipe.cost)) return;
  for(const [material,count] of Object.entries(recipe.cost)) gain(material,-count);
  gain(id,recipe.count);state.crafted[id]=(state.crafted[id]??0)+recipe.count;
  ui.toast('Crafted '+items[id][0].toLowerCase(),'×'+recipe.count+' added to your satchel',items[id][1]);
  audio.play('craft');refresh();
}
function bond(id) {
  const spec=species[id], gift=spec.favorite;
  if(state.companions.includes(id)) return;
  if(!(state.inventory[gift]>0)) {
    ui.toast('You’re out of '+items[gift][0].toLowerCase(),'Gather or craft another offering.','paw');
    return;
  }
  gain(gift,-1);
  const trust=(state.bonds[id]??0)+1; state.bonds[id]=trust;
  if(trust>=spec.trust) {
    state.companions.push(id);state.active=id;
    ui.toast(spec.name+' joined you!','Choose who roams with you in the Field Guide.','paw');
    audio.play('success');
  } else {
    ui.toast(spec.name+' is warming up',trust+'/'+spec.trust+' trust','heart');
    audio.play('gather');
  }
  refresh();
}
function talk(id) {
  const npc=villagers.find(v=>v.id===id);
  if(!npc) return;
  if(npc.id==='mcgonagall'&&!state.magic.house) {menu('sorting');return;}
  if(npc.goal.spell&&!state.magic.house){
    menu('dialog',{npc,text:'You’re looking for a first lesson? McGonagall will want to see you in the Great Hall first. She’ll get your house sorted. Come back afterwards.',
      button:'See you soon',command:'close'});
    return;
  }
  const status=state.quests[id];
  const detail={npc,text:npc.intro,topic:sideConversations[id]?.[0],button:status?'See you soon':'I’ll help',command:status?'close':'accept:'+id};
  if(!status&&npc.goal.spell) detail.button='Learn '+spells[npc.goal.spell].name;
  if(status==='done') detail.text=npc.after;
  else if(status==='active' && questReady(npc,state)) {
    detail.text=npc.done;detail.button='Complete quest';detail.command='finish:'+id;
  }
  audio.play('talk');menu('dialog',detail);
}
function finishQuest(id) {
  const npc=villagers.find(v=>v.id===id);
  if(!npc||state.quests[id]!=='active'||!questReady(npc,state)) return;
  if(npc.goal.item) gain(npc.goal.item,-npc.goal.count);
  Object.entries(npc.reward).forEach(([item,count])=>gain(item,count));
  state.quests[id]='done';state.wallet.coins+=10;
  if(state.trackingQuest===id) clearTracking();
  menu(null);
  ui.toast('Quest complete',npc.quest+' · +10 Suncoins','check');
  audio.play('success');refresh();
}
function interact() {
  if(ui.opened) return;
  const target=world?.interaction();
  if(!target) return;
  if(target.kind==='npc') talk(target.id);
  else if(target.kind==='wild') bond(target.id);
  else if(target.kind==='gate') menu('atlas');
  else if(target.kind==='loot'){
    const dropped=world.collectLoot(target.id);
    if(!dropped) return;
    const names=Object.entries(dropped.items).map(([item,n])=>n+' '+items[item][0]);
    ui.toast('Loot collected',[dropped.coins?dropped.coins+' Suncoins':null,...names].filter(Boolean).join(' · '),'sparkles');
    audio.play('gather');refresh();
  }
  else if(target.kind==='town'){
    const station=townServices.find(service=>service.id===target.id);
    if(!station) return;
    if(station.kind==='market') menu('market',station.place);
    else if(station.kind==='inn') menu('time');
    else menu('activities',({hall:'errands',post:'courier',garden:'kitchen',workshop:'salvage',lookout:'shrines'})[station.kind]??null);
  }
  else if(target.kind==='treasure') useActivity('dig');
  else if(target.kind==='store') menu('market',target.id);
  else if(target.kind==='tracking-spell') cast(target.id);
  else if(target.kind==='tracked-crop') menu('homestead',{view:'garden',slot:target.id});
  else if(target.kind==='tracking-farm') menu('homestead',target.id);
  else if(target.kind==='tracking-kitchen') menu('activities','kitchen');
  else if(target.kind==='homestead') menu('homestead',propertyArea(state.player,state.realm)??'house');
  else if(target.kind==='survey') {
    state.stamp[target.id]=true;
    ui.toast('Field note recorded',regions[target.id].name,'book');
    audio.play('gather');refresh();
  } else {
    if(state.harvested[target.key]>Date.now()) return;
    state.harvested[target.key]=Date.now()+80000;
    const quantity=(target.id==='wood'||target.id==='berry'?3:2)+takeBlessing(state,'forage');
    gain(target.id,quantity);
    ui.toast('Gathered '+items[target.id][0].toLowerCase(),'×'+quantity+' added to your satchel',items[target.id][1]);
    audio.play('gather');refresh();
  }
}
function feedCrop(item){
  const id=state.active,pet=species[id];
  if(!pet||state.bounties.abducted?.pet===id||(!cropFood.includes(item)&&!Object.hasOwn(kitchen,item))||!(state.inventory[item]>0)) return;
  const history=state.care[id]??={affinity:0};
  const now=Date.now();
  if(history.resting||now-(history.feedAt??0)<9000){
    ui.toast(pet.name,'Give your friend a moment before the next snack.','paw');return;
  }
  const friendship=kitchen[item]?.bonus??1;
  gain(item,-1);history.affinity=Math.min(12,history.affinity+friendship);history.feedAt=now;
  world.companionAction('feed');menu(null);
  ui.toast(pet.name+' ate '+items[item][0].toLowerCase(),'+'+friendship+' friendship','heart');
  audio.play('gather');refresh();
}

function careAction(kind) {
  const id=state.active, pet=species[id];
  if(!pet||!['pet','feed','play','rest','scout','meet'].includes(kind)) return;
  const history=state.care[id]??={affinity:0};
  if(kind==='rest'){
    history.resting=!history.resting;
    menu(null);
    ui.toast(pet.name,history.resting?'Settled down for a nap.':'Ready to roam again.','paw');
    refresh();return;
  }
  if(history.resting) return;
  if(kind==='meet'){
    const neighbor=world.introduceBuddy();
    if(!neighbor) {ui.toast('No wildlife nearby','Walk closer to a wild creature and try again.','paw');return;}
    menu(null);ui.toast(pet.name+' meets '+neighbor,'Give them a moment to say hello.','heart');
    audio.play('gather');return;
  }
  if(kind==='scout'){
    if(history.affinity<3) return;
    const clue=world.scoutNearby();
    if(!clue) {ui.toast('No materials nearby','Try scouting in another clearing.','compass');return;}
    menu(null);
    const {x,z}=state.player;
    const direction=['north','northeast','east','southeast','south','southwest','west','northwest'][
      Math.round(Math.atan2(clue.x-x,z-clue.z)/(Math.PI/4)+8)%8
    ];
    ui.toast(pet.name+' found a trail',items[clue.item][0]+' · '+direction,'pin');
    return;
  }
  const now=Date.now();
  if(now-(history[kind+'At']??0)<9000) {
    ui.toast('Try another activity',pet.name+' needs a moment between repeats.','paw');return;
  }
  if(kind==='feed'){
    if(!(state.inventory[pet.favorite]>0)) {ui.toast('No favorite treats left',items[pet.favorite][0],'cookie');return;}
    gain(pet.favorite,-1);
  }
  history[kind+'At']=now;
  history.affinity=Math.min(12,history.affinity+1);
  world.companionAction(kind);
  menu(null);
  const response={pet:'Leans into your hand.',feed:'Finishes its favorite snack.',play:'Chases after the ball.'};
  ui.toast(pet.name,response[kind],'heart');
  if(history.affinity===3) ui.toast('Scouting unlocked',pet.name+' can sniff out nearby materials.','compass');
  audio.play('gather');refresh();
}

function cast(id){
  if(!state.magic.known.includes(id)) return;
  const spell=spells[id];
  const [x,z]=spell.target;
  const near=state.realm==='hogwarts'&&Math.hypot(state.player.x-x,state.player.z-z)<4.3;
  if(!near&&id!=='lumos'){
    ui.toast('Find the practice object',spell.label,'sparkles');return;
  }
  if(near&&!state.magic.mastered[id]){
    state.magic.mastered[id]=true;
    ui.toast(spell.name+' mastered','Return to your teacher to finish the lesson.','check');
  } else ui.toast(spell.name,id==='lumos'?'A soft light follows you.':spell.label,'sparkles');
  menu(null);world.castEffect(id);audio.play('success');refresh();
}

async function importFile(file){
  if(importing||starting) return;
  importing=true;
  try {
    const incoming=await readSaveFile(file);
    const previous={...state};
    const oldWorld=world;
    Object.assign(state,incoming);
    if(oldWorld){
      try {world=mountWorld();}
      catch(error){Object.assign(state,previous);throw error;}
      oldWorld.destroy();world.setActive(active);
      building=false;ui.renderBuild(false,false);
    }
    currentRegion.id=regionAt(state.player.x,state.player.z,state.realm);
    propertyEntry=propertyArea(state.player,state.realm);
    state.active=state.bounties.abducted?.pet===state.active?null:state.active;
    showTracking(world?.trackingJourney()?.source);
    ui.setSaveAvailable();
    if(active) menu(null);
    persist();
    ui.importStatus('Progress imported.','');
    ui.refresh();
  }catch(error){
    ui.importStatus(error instanceof Error?error.message:'Could not read the save file.','error');
  }finally{importing=false;}
}

function activityContext(){
  const {x,z}=state.player,local=townServiceAt(state.realm,x,z,4.2);
  const place=local?.place??regionAt(x,z,state.realm);
  const homeAccess=state.homestead.owned&&nearHomestead(state);
  return {place,local,regions,species,items,atlas,
    kitchen:place==='village'||homeAccess||['garden','inn','market'].includes(local?.kind),
    post:place==='village'||local?.kind==='post',
    lookout:place==='village'||local?.kind==='lookout',
    workshop:place==='village'||local?.kind==='workshop'||homeAccess&&state.homestead.extensions?.workshop,
    nearby:()=>world?.studyNearby?.(state.townLife.notes),photo:()=>world?.takePostcard?.()};
}

function useActivity(verb,id){
  const feedback=townLifeAction(state,verb,id,activityContext());
  if(feedback){
    ui.toast(feedback.title,feedback.detail,feedback.icon);
    audio.play('success');refresh();
  }
}

function showTracking(source){
  ui.trackingTrail(trackingSelection(state),source,source?.realm&&source.kind!=='craft'?trackingDistance(state,source):0);
}

function clearTracking(){
  state.trackingItem=null;state.trackingQuest=null;
  world?.syncTracking();showTracking(null);
}

function action(type,id) {
  switch(type) {
    case 'sound':
      state.sound=!state.sound;audio.unlock();audio.sync();ui.refresh();
      if(active||loaded) persist();
      return;
    case 'craft':
      if(id) {craft(id);return;}
      menu(ui.opened===type?null:type);return;
    case 'bag':case 'map':case 'companions':case 'journal':case 'settings':case 'wardrobe':case 'atlas':case 'care':case 'spells':case 'time':case 'market':case 'homestead':case 'bounties':case 'activities':
      menu(ui.opened===type?null:type,type==='homestead'?propertyArea(state.player,state.realm):null);return;
    case 'look':{
      const [part,value]=id.split('-');
      const choice=Number(value);
      if(!wardrobe[part]?.choices[choice]) return;
      state.look[part]=choice;
      if(part==='morph'){
        if(choice===0) Object.assign(state.look,{style:4,outfit:2,accessory:3,beard:0});
        if(choice===1) Object.assign(state.look,{style:7,outfit:1,accessory:1,beard:0});
        if(choice===2) Object.assign(state.look,{outfit:3,accessory:3,beard:0});
      }
      world.updateOutfit();refresh();
      return;
    }
    case 'reset-look':
      state.look={...defaultLook};world.updateOutfit();refresh();return;
    case 'track-item':{
      if(!Object.hasOwn(items,id)||!world) return;
      if(building) toggleBuild();
      state.trackingItem=id;state.trackingQuest=null;
      const source=world.syncTracking();
      if(source?.kind==='bounty'&&state.bounties.target!==source.id) world.combat('track',source.id);
      showTracking(source);
      menu(null);persist();return;
    }
    case 'track-quest':{
      if(!world||!villagers.some(v=>v.id===id)||state.quests[id]==='done') return;
      if(building) toggleBuild();
      state.trackingQuest=id;state.trackingItem=null;
      showTracking(world.syncTracking());
      menu(null);ui.refresh();persist();return;
    }
    case 'open-tracked-recipe':
      if(Object.hasOwn(recipes,id)) menu('craft',id);
      return;
    case 'prepare-quest-build':
      if(world?.trackingJourney()?.source?.kind==='build'&&recipes[id]?.build){
        selectPiece(id);if(!building) toggleBuild();
      }
      return;
    case 'clear-item-track':case 'clear-quest-track':
      clearTracking();ui.refresh();persist();return;
    case 'close':{
      const view=ui.opened==='homestead'&&propertyArea(state.player,state.realm);
      if(view&&state.homestead.owned){
        const [x,z]=view==='garden'?[19,27.1]:home.arrival;
        Object.assign(state.player,{x,z});propertyEntry=null;world.resetCamera();persist();
      }
      menu(null);return;
    }
    case 'property-3d':{
      if(ui.opened!=='homestead'||!state.homestead.owned||!nearHomestead(state)) return;
      const view=id==='garden'?'garden':'house';
      if(propertyArea(state.player,state.realm)!==view){
        const [x,z]=view==='garden'?[19,25.25]:[home.x,home.z+1.5];
        Object.assign(state.player,{x,z,yaw:0});world.resetCamera();
      }
      propertyEntry=view;menu(null);persist();return;
    }
    case 'npc-talk':talk(id);return;
    case 'npc-topic':{
      const npc=villagers.find(person=>person.id===id),topic=sideConversations[id];
      if(npc&&topic) menu('dialog',{npc,text:topic[1],button:'Back to our conversation',command:'npc-talk:'+id});
      return;
    }
    case 'sort':
      if(state.realm!=='hogwarts'||state.magic.house||!houses[id]) return;
      state.magic.house=id;state.quests.mcgonagall='done';
      if(state.trackingQuest==='mcgonagall') clearTracking();
      Object.assign(state.look,{outfit:4,coat:({gryffindor:7,hufflepuff:4,ravenclaw:0,slytherin:9})[id]});
      world.updateOutfit();menu(null);
      ui.toast('Welcome to '+houses[id][0],'Find Harry, Hermione or Ron to begin a lesson.','sparkles');
      audio.play('success');refresh();
      return;
    case 'rest-until':
      if(Object.hasOwn(restTimes,id)){
        state.time=restTimes[id];world.syncLighting();menu(null);persist();
      }
      return;
    case 'cast':cast(id);return;
    case 'pet-care':careAction(id);return;
    case 'voyage':
      if(atlas[id]) travel(atlas[id].entry,true);
      return;
    case 'ferry':
      if(regions[id]?.realm==='sky') travel(id,true);
      return;
    case 'title':
      persist();menu(null);active=false;world.setActive(false);building=false;world.setBuild(false,state.selected);
      ui.renderBuild(false,false);ui.showGame(false);
      return;
    case 'export-save':
      downloadSave(state);
      if(active) ui.toast('Save file exported','Keep the JSON to move your progress to another browser.','cloud-check');
      return;
    case 'import-save':ui.pickSaveFile();return;
    case 'buy-stock':case 'sell-stock':{
      const buying=type==='buy-stock',trade=transact(state,buying?'buy':'sell',id,ui.marketPlace());
      if(!trade) return;
      ui.toast(buying?'Purchased '+trade.name:'Sold '+trade.name,trade.price+' '+currencies[trade.currency].name,'bag');
      audio.play('success');refresh();return;
    }
    case 'visit-home':{
      if(state.realm!==homeland) travel('village',true);
      if(state.realm!==homeland) return;
      const [x,z]=home.arrival;
      if(!world?.canWalk(x,z)) return;
      state.transit=null;Object.assign(state.player,{x,z,yaw:0});
      world.resetCamera();propertyEntry=null;currentRegion.id=regionAt(x,z,homeland);menu(null);persist();
      ui.toast(home.name,'Walk through the front door or into the garden to choose a view.','house');return;
    }
    case 'activity-run':{
      const [verb,value]=(id??'').split('.');
      useActivity(verb,value);return;
    }
    case 'download-postcard':{
      const card=state.townLife.photos[Number(id)];
      if(!card) return;
      const link=document.createElement('a');
      link.download='Rainbow-Roam-'+card.place+'.jpg';link.href=card.image;link.click();return;
    }
    case 'homestead-expand':case 'homestead-service':{
      const event=workHomestead(state,type.slice(10),0,id);
      if(event){world.refreshHomestead();world.syncLighting();ui.toast(event.title,event.detail,'house');audio.play('success');refresh();}
      return;
    }
    case 'homestead-buy':case 'homestead-plant':case 'homestead-water':case 'homestead-harvest':case 'homestead-decorate':case 'homestead-remove':{
      const [number,item]=(id??'').split('.');
      const event=workHomestead(state,type.slice(10),Number(number),item);
      if(!event) return;
      world.refreshHomestead();ui.toast(event.title,event.detail,'sprout');audio.play('success');refresh();return;
    }
    case 'feed-crop':feedCrop(id);return;
    case 'track-bounty':
      world.combat('track',id);menu(null);persist();return;
    case 'clear-bounty':
      world.combat('untrack');ui.refresh();persist();return;
    case 'save':
      if(persist()) ui.toast('Progress saved','You can come back anytime.','cloud-check');return;
    case 'build':
      if(!world?.inCombat?.()||building) toggleBuild();
      return;
    case 'piece':selectPiece(id);return;
    case 'touch-place':world?.tryBlock(false);return;
    case 'touch-remove':world?.tryBlock(true);return;
    case 'touch-rotate':world?.rotate();return;
    case 'jump':world?.jump();return;
    case 'flight':world?.toggleFlight();return;
    case 'interact':interact();return;
    case 'care-for':
      if(state.companions.includes(id)&&state.bounties.abducted?.pet!==id&&state.townLife.trip?.pet!==id) {state.active=id;menu('care');persist();}
      return;
    case 'buddy':
      if(state.companions.includes(id)&&state.bounties.abducted?.pet!==id&&state.townLife.trip?.pet!==id) {state.active=state.active===id?null:id;refresh();}return;
    case 'accept':{
      const npc=villagers.find(v=>v.id===id);
      if(!npc||state.quests[id]) return;
      if(npc.goal.spell){
        if(!state.magic.house) return;
        if(!state.magic.known.includes(npc.goal.spell)) state.magic.known.push(npc.goal.spell);
        ui.toast('Learned '+spells[npc.goal.spell].name,'Open the spellbook with T to cast.','sparkles');
      }
      state.quests[id]='active';menu(null);ui.toast('Quest added',npc.quest,'book');refresh();return;
    }
    case 'finish':finishQuest(id);return;
    case 'travel':travel(id);return;
  }
}

window.addEventListener('keydown',e=>{
  if(!active||e.ctrlKey||e.altKey||e.metaKey) return;
  const key=e.key.toLowerCase();
  if(key==='escape') {
    e.preventDefault();
    if(ui.opened) action('close'); else if(building)toggleBuild(); else menu('settings');
    return;
  }
  if(ui.opened) return;
  if(state.transit?.mode==='fly'&&(key===' '||key==='x')){
    e.preventDefault();world.setKey(key,true);return;
  }
  if(key===' '&&e.target.closest?.('button')) return;
  if(motionKeys.has(key)) {
    e.preventDefault();world.setKey(key,true);return;
  }
  if(e.repeat) return;
  if(keyPanels[key]) {e.preventDefault();action(keyPanels[key]);return;}
  if(key==='e') interact();
  else if(key==='f'){e.preventDefault();action('flight');}
  else if(key==='b') action('build');
  else if(key==='r'&&building) world.rotate();
  else if(key===' '){e.preventDefault();world.jump();}
  else if(building&&/^[1-9]$/.test(key)) selectPiece(buildTypes[Number(key)-1]);
});
window.addEventListener('keyup',e=>world?.setKey(e.key.toLowerCase(),false));
window.addEventListener('blur',()=>world?.clearKeys());
onGameWindowClose(()=>{if(active)persist(false);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)persist(false);});
setInterval(()=>{if(active)persist();},3400);
document.querySelectorAll('[data-move]').forEach(button=>{
  button.addEventListener('pointerdown',event=>{
    event.preventDefault();button.setPointerCapture(event.pointerId);
    world?.setKey(button.dataset.move,true);
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(name,()=>world?.setKey(button.dataset.move,false));
});




