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
import {items,recipes,species,regions,villagers,restTimes,newGame,canAfford,questReady,regionAt} from './content.js';

import {sideConversations} from './dialogue.js';
import {wardrobe,defaultLook} from './wardrobe.js';
import {atlas,homeland,houses,spells} from './horizons.js';
import {loadGame,saveGame,readSaveFile,downloadSave} from './save-files.js';
import {currentFriend,evolveFriend} from './evolutions.js';
import {breedPet,catchWildPet,playPetTurn,startPetBattle,startWildPetBattle} from './pet-club.js';
import {home,currencies,cropFood,extensions,workHomestead,propertyArea,propertyArrival,nearHomestead,wizardTowerPoint} from './homestead.js';
import {makeHomestead} from './homestead-art.js';
import {marketAtPlace,transact} from './market.js';
import {trackingDistance} from './item-tracking.js';
import {trackingSelection} from './quest-tracking.js';
import {townServices,townServiceAt} from './town-data.js';
import {caches,kitchen,markTownVisit,takeBlessing,townLifeAction} from './town-life.js';
import {ownsGameWindow,onGameWindowClose} from './game-window.js';
import {spirehavenCitizens} from './silverrun.js';
import {dialFaces,roomPoint,turnStarDial} from './spirehaven-rooms.js';
import {wards,wardPetPoint} from './city-wards.js';
import {createTrailGames,friendHabitats} from './town-trails.js';
import {answerRoomActivity} from './regional-interiors.js';
import {dungeonEntrances,enterDungeon} from './dungeons.js';

const loaded=loadGame();
const state=loaded??newGame();
const app=document.querySelector('#app');
const audio=makeAudio(()=>state.sound);
const buildTypes=Object.keys(recipes).filter(id=>recipes[id].build);
const currentRegion={id:'village'};
const keyPanels={i:'bag',c:'companions',k:'craft',j:'journal',m:'map',o:'wardrobe',
  p:'care',t:'spells',v:'atlas',l:'market',u:'homestead',y:'bounties',n:'activities'};
const motionKeys=new Set(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright','shift']);
const travelPoints={village:[0,10],grove:[-24,-10],lake:[14,-6],ridge:[29,-41],fields:[-5,29]};
const propertyView=()=>propertyArea(state.player,state.realm,state.homestead);
let world,createWorld,active=false,building=false,starting=false,importing=false,propertyEntry=propertyView();
let dungeonCleanup=null,dungeonLoading=false,physicalHome=false,autoPropertyView=null;
let saveMode,petBattle=null,wildEncounter=null;
const ui=createUI(app,state,{start,action,mapHeight:(realm,x,z)=>world?.mapHeight(realm,x,z),
  drawOutfit:(canvas,framing)=>world?.drawOutfit(canvas,framing),sproutPicture:spec=>world?.sproutPicture(spec),
  walkRenderer:()=>world?.renderer,propertyPreview:view=>world?.propertyPreview(view),
  trackingJourney:()=>world?.trackingJourney(),activityContext,importFile},Boolean(loaded));

const trailGames=createTrailGames(state,{menu,persist,play:kind=>audio.play(kind),inside:()=>world?.insideRoom()});

function persist(show=true) {
  if(!ownsGameWindow()) return null;
  const previous=saveMode;
  saveMode=saveGame(state);
  if(show||previous!==saveMode) ui.saveStatus(saveMode);
  return saveMode;
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
  if(state.dungeons.active) await openDungeon(state.dungeons.active,{resume:true});
  persist(); ui.refresh();
}

async function openDungeon(id,{atTower=false,resume=false}={}){
  if(dungeonLoading||!dungeonEntrances.some(entry=>entry.id===id)) return;
  const before=structuredClone(state.dungeons);
  dungeonLoading=true;
  menu(null);world.setPaused(true);
  const host=document.createElement('section');
  host.className='dungeon-host dungeon-loading';
  app.append(host);
  try{
    const {mountDungeon}=await import('./dungeon-view.js');
    if(!resume) enterDungeon(state,id,{atTower});
    if(state.dungeons.active!==id) throw new Error('Dungeon destination is unavailable.');
    const unmount=mountDungeon(host,state,{
      save:persist,onBefriend:bond,
      onExit:()=>leaveDungeon(),
      onTravel:target=>{if(target==='home') leaveDungeon(true);else if(state.dungeons.towers[target]) openDungeon(target,{atTower:true});}
    });
    dungeonCleanup?.();
    dungeonCleanup=()=>{unmount();host.remove();};
    app.classList.add('dungeon-mode');
    host.classList.remove('dungeon-loading');
    host.querySelector('[tabindex="-1"]')?.focus({preventScroll:true});
    if(!resume) audio.play('travel');
    persist();
  }catch(error){
    host.remove();Object.assign(state.dungeons,before);
    if(!dungeonCleanup){
      world.setPaused(false);
      ui.toast('The passage could not open','Your progress on the surface was kept.','compass');
    }
    console.error('Dungeon could not open',error);
  }finally{dungeonLoading=false;}
}

function leaveDungeon(goHome=false){
  if(dungeonLoading||!dungeonCleanup) return;
  const cave=dungeonEntrances.find(entry=>entry.id===state.dungeons.active);
  if(!cave||goHome&&!state.homestead.extensions.wizardTower) return;
  const angle=cave.yaw??0;
  const [x,z]=goHome?wizardTowerPoint:[cave.x+Math.sin(angle)*2.62,cave.z+Math.cos(angle)*2.62];
  const realm=goHome?homeland:cave.realm,yaw=goHome?0:(cave.yaw??0)+Math.PI;
  const before={realm:state.realm,player:state.player,transit:state.transit};
  Object.assign(state,{realm,player:{x,z,yaw},transit:null});
  if(before.realm!==realm){
    let destination;
    try{destination=mountWorld();}
    catch(error){Object.assign(state,before);console.error(error);return;}
    world.destroy();world=destination;
  }
  state.dungeons.active=null;
  dungeonCleanup();dungeonCleanup=null;
  app.classList.remove('dungeon-mode');
  physicalHome=goHome;propertyEntry=propertyView();
  regionReached(regionAt(x,z,state.realm));
  world.setActive(true);world.setPaused(false);
  ui.refresh();audio.play('travel');persist();
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
  const entered=propertyArea(player,realm,state.homestead), previous=propertyEntry;
  propertyEntry=entered;
  if(!nearHomestead(state)) physicalHome=false;
  if(!physicalHome&&(entered==='house'||entered==='garden')&&entered!==previous&&state.homestead.owned&&!ui.opened){
    menu('homestead',entered);autoPropertyView=entered;
  }
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
    relayTimeout(){ui.toast('The lanterns dimmed','Return to the market lantern to try again.','sparkles');},
    combatReport({title,detail,icon}){ui.toast(title,detail,icon);ui.refresh();persist();},
    update(candidate,elapsed,landing,room){ui.update(currentRegion.id,candidate,state.time,elapsed,landing,room);},
    aim:ui.setReticle,wildEncounter:meetWildPet,
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

function travel(id,allowUndiscovered=false,arrival=null) {
  const destination=regions[id];
  if(!destination||(!allowUndiscovered&&!state.discoveries.includes(id))) return;
  const realm=destination.realm??homeland;
  const [x,z]=arrival??travelPoints[id]??destination.travel;
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
  if(id!=='homestead') autoPropertyView=null;
  if(id!=='petArena'&&id!=='wildEncounter') petBattle=null;
  if(id!=='wildEncounter') wildEncounter=null;
  ui.showPanel(id,detail);
  world?.setPaused(Boolean(id));
}
function refresh() {
  ui.refresh();
  if(building) ui.renderBuild(true,false);
  persist();
}
function toggleBuild() {
  if(!world || !active||world.insideRoom()&&!building) return;
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
  if(!npc) {
    const citizen=spirehavenCitizens.find(person=>person.id===id);
    if(citizen){
      audio.play('talk');menu('dialog',{npc:citizen,text:citizen.intro,button:'See you soon',command:'close'});
    }
    return;
  }
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
function meetWildPet(id) {
  if(!active||building||ui.opened||dungeonCleanup||dungeonLoading||state.transit||
    !ownsGameWindow()||state.companions.includes(id)) return;
  wildEncounter=id;
  menu('wildEncounter',{id});
}

function interact(challenge=false) {
  if(ui.opened) return;
  const target=world?.interaction();
  if(!target) return;
  if(challenge){
    if(target.kind==='wild') meetWildPet(target.id);
    return;
  }
  if(target.kind==='npc') talk(target.id);
  else if(target.kind==='trail-landmark') trailGames.visit('landmark');
  else if(target.kind==='dungeon') openDungeon(target.id);
  else if(target.kind==='tower-exit') action('leave-tower');
  else if(target.kind==='homestead-room') action('homestead-service',target.id);
  else if(target.kind==='walk-in-room') useRoomStation(target.room,target.station);
  else if(target.kind==='ward-relay'){world.lightLantern();audio.play('gather');}
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
  else if(target.kind==='homestead') menu('homestead',propertyView()??'house');
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

function roomActivity(room,retry,station){
  const {activity}=room;
  const progress=state.roomActivities[room.id]??0;
  const step=activity.steps[progress];
  if(room.kind==='workshop'&&step&&station?.id!==step.station){
    menu('dialog',{npc:{name:activity.title,role:room.name,colors:['',room.rug]},
      text:activity.directions[progress],button:'Back to the workshop',command:'close'});
    return;
  }
  const npc={name:activity.title,role:room.name,colors:['',room.rug]};
  menu('dialog',{
    npc,
    text:room.kind==='workshop'?(step?.instruction??activity.done):(step?activity.brief:activity.done),
    note:room.kind==='workshop'?(retry??(step?'Commission reward · '+room.reward[1]:'Received · '+room.reward[1])):step?[retry,step.instruction].filter(Boolean).join(' '):null,
    choices:step?.choices.map((label,index)=>({label,command:'room-choice:'+room.id+'/'+progress+'/'+index})),
    button:step?'Come back later':'Done',command:'close'
  });
}

function answerRegionalActivity(id){
  if(ui.opened!=='dialog'||typeof id!=='string') return;
  const room=world?.insideRoom();
  const [roomId,stage,choice]=id.split('/');
  const progress=state.roomActivities[roomId]??0;
  if(!room?.activity||room.id!==roomId||String(progress)!==stage) return;
  const step=room.activity.steps[progress];
  if(!step)return;
  const station=room.stations.find(station=>station.kind==='activity'&&(!step.station||step.station===station.id));
  if(!station)return;
  const [x,z]=roomPoint(room,station.x,station.z);
  if(Math.hypot(x-state.player.x,z-state.player.z)>1.18) return;
  const result=answerRoomActivity(state.roomActivities,room,choice);
  if(!result) return;
  const bell=room.feature==='bells'
    ?result.retry?'bellLow':room.service==='inn'?'doubleChime':progress===0?'bellHigh':'bellMid'
    :null;
  if(result.done){
    const reward=room.reward?.[0]??marketAtPlace(room.realm,room.id).goods[0][0];
    gain(reward,1);
    ui.toast(room.activity.title,'Received '+items[reward][0],items[reward][1]);
    audio.play(bell??'success');
  }else{
    audio.play(bell??'talk');
  }
  if(!result.retry) persist();
  roomActivity(room,result.retry,station);
}

function useRoomStation(room,station){
  if(station.kind==='activity'){roomActivity(room,null,station);return;}
  if(station.kind==='market'){menu('market',room.id);return;}
  if(station.kind==='rest'){menu('time');return;}
  if(station.kind==='read'){
    const chart=room.id==='starMap';
    const title=room.kind==='regional'?(room.service==='inn'?'Guestbook':'Shopkeeper’s note'):
      chart?'The star chart':'The Wayfarer’s Almanac';
    const npc={name:title,role:room.name,colors:['',room.rug??'#927ca6']};
    const text=room.note??(chart
      ?'To wake the armillary, set the west dial to the Star, the north dial to the Sun, and the east dial to the Moon.'
      :'Cross Kingfisher Bridge for the quiet quay. At the foot of the Grand Stair, follow the lanterns up to the Arcanum. The star chart inside explains the three brass dials.');
    menu('dialog',{npc,text,choices:room.kind==='regional'?trailGames.roomChoices(room):null,button:'Put it back',command:'close'});
    return;
  }
  if(station.kind==='dial'&&!state.spirehaven.aligned){
    if(turnStarDial(state.spirehaven,station.id)){
      gain('crystal',3);
      ui.toast('Star map aligned','The armillary lit up · 3 Starglass','sparkles');
      audio.play('success');
    }else{
      ui.toast(dialFaces[state.spirehaven.dials[station.id]],'Dial turned','compass');
      audio.play('talk');
    }
    refresh();
  }
}
function feedCrop(item){
  const id=state.active,pet=currentFriend(state,id);
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
  const id=state.active, pet=currentFriend(state,id);
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
    propertyEntry=propertyView();
    state.active=state.bounties.abducted?.pet===state.active?null:state.active;
    showTracking(world?.trackingJourney()?.source);
    ui.setSaveAvailable();
    if(active) menu(null);
    if(active&&state.dungeons.active) await openDungeon(state.dungeons.active,{resume:true});
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
  return {place,local,regions,species,items,atlas,friendName:id=>currentFriend(state,id)?.name,
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
    case 'petArena':case 'petNursery':
      if(active&&ui.opened==='companions') menu(type);
      return;
    case 'pet-match': {
      if(!active||ui.opened!=='petArena'||!ownsGameWindow()) return;
      if(petBattle&&!petBattle.result) return;
      const [pet,rival]=id.split('/');
      petBattle=startPetBattle(state,pet,rival);
      if(petBattle) menu('petArena',petBattle);
      return;
    }
    case 'pet-turn':
      if(active&&['petArena','wildEncounter'].includes(ui.opened)&&ownsGameWindow()&&playPetTurn(state,petBattle,id)){
        ui.refresh();
        if(petBattle.result==='won'){
          audio.play('success');
          if(!petBattle.wild) persist();
        }
      }
      return;
    case 'pet-rematch':
      if(ui.opened==='petArena'&&petBattle?.result){petBattle=null;menu('petArena');}
      return;
    case 'wild-match':
      if(active&&ui.opened==='wildEncounter'&&ownsGameWindow()&&!petBattle){
        petBattle=startWildPetBattle(state,species,id,wildEncounter);
        if(petBattle) menu('wildEncounter',{id:wildEncounter,battle:petBattle});
      }
      return;
    case 'wild-rematch':
      if(ui.opened==='wildEncounter'&&petBattle?.result==='lost'){
        petBattle=null;
        menu('wildEncounter',{id:wildEncounter});
      }
      return;
    case 'wild-catch':
      if(active&&ui.opened==='wildEncounter'&&ownsGameWindow()&&catchWildPet(state,species,petBattle)){
        const {name}=species[petBattle.rival];
        menu(null);
        world.syncTracking();
        ui.toast(name+' joined your Friends!','Find your new companion in the Field Guide.','paw');
        audio.play('success');
        refresh();
      }
      return;
    case 'pet-pair': {
      if(!active||ui.opened!=='petNursery'||!ownsGameWindow()) return;
      const [first,second]=id.split('/');
      const birth=breedPet(state,species,first,second);
      menu('petNursery',birth);
      if(birth.id){audio.play('success');persist();}
      return;
    }
    case 'quick-slot':
      if(!building&&!ui.opened&&!dungeonCleanup) world?.combat(id);
      return;
    case 'wizard-travel':
      if(ui.opened==='wizardTower'&&nearHomestead(state)&&state.homestead.extensions.wizardTower&&state.dungeons.towers[id]){
        openDungeon(id,{atTower:true});
      }
      return;
    case 'visit-friend':
      if(active&&ui.opened==='companions'&&Object.hasOwn(friendHabitats,id)){
        const place=friendHabitats[id],habitat=regions[place];
        const arrival=wards[habitat.realm]?[wardPetPoint[0]+.7,wardPetPoint[1]+1]:place==='village'?[-3.5,5.7]:[habitat.x+1,habitat.z+1];
        travel(place,true,arrival);
      }
      return;
    case 'town-trail':trailGames.act(id);return;
    case 'room-choice':answerRegionalActivity(id);return;
    case 'room-zoom':world?.zoomRoom(id==='in'?-.16:.16);return;
    case 'leave-tower':
      if(!active||ui.opened||dungeonCleanup)return;
      if(world?.leaveWizardTower()){
        physicalHome=true;propertyEntry=null;persist();
      }else ui.toast('The yard is blocked','Clear some ground outside the tower.','house');
      return;
    case 'sound':
      state.sound=!state.sound;audio.unlock();audio.sync();ui.refresh();
      if(active||loaded) persist();
      return;
    case 'craft':
      if(id) {craft(id);return;}
      menu(ui.opened===type?null:type);return;
    case 'bag':case 'map':case 'companions':case 'journal':case 'settings':case 'wardrobe':case 'atlas':case 'care':case 'spells':case 'time':case 'market':case 'homestead':case 'bounties':case 'activities':
      menu(ui.opened===type?null:type,type==='homestead'?propertyView():null);return;
    case 'look':{
      const [part,value]=id.split('-');
      const choice=Number(value);
      if(!wardrobe[part]?.choices[choice]) return;
      state.look[part]=choice;
      if(part==='morph'){
        if(choice===0) Object.assign(state.look,{style:4,outfit:2,accessory:3,beard:0});
        if(choice===1) Object.assign(state.look,{style:7,outfit:1,accessory:1,beard:0});
        if(choice===5) Object.assign(state.look,{style:7,accessory:2,beard:0});
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
      const view=ui.opened==='homestead'&&autoPropertyView;
      if(view&&state.homestead.owned){
        const [x,z]=view==='garden'?[19,27.1]:home.arrival;
        Object.assign(state.player,{x,z});propertyEntry=null;world.resetCamera();persist();
      }
      menu(null);return;
    }
    case 'property-3d':{
      if(ui.opened!=='homestead'||!state.homestead.owned||!nearHomestead(state)) return;
      const view=id==='garden'||Object.hasOwn(extensions,id)&&state.homestead.extensions[id]?id:'house';
      if(propertyView()!==view){
        const [x,z]=propertyArrival(view,state.homestead);
        Object.assign(state.player,{x,z,yaw:0});world.resetCamera();
      }
      physicalHome=true;propertyEntry=view;menu(null);persist();return;
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
    case 'evolve-friend': {
      if(!active||!ownsGameWindow()||ui.opened!=='companions') return;
      const [friendId,next]=id.split('/');
      const previous=currentFriend(state,friendId);
      const form=evolveFriend(state,friendId,Number(next));
      if(form){
        ui.toast(previous.name+' evolved',form.name,'sparkles');
        audio.play('success');
        refresh();
      }
      return;
    }
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
      if(type==='homestead-service'&&id==='wizardTower'){
        if(nearHomestead(state)&&state.homestead.owned&&state.homestead.extensions.wizardTower) menu('wizardTower');
        return;
      }
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
    case 'save': {
      const saved=persist();
      if(saved==='browser') ui.toast('Progress saved','You can come back anytime.','cloud-check');
      if(saved==='tab') ui.toast('Checkpoint saved','Reload this tab to continue. Export progress before closing it.','cloud-check');
      return;
    }
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
  if(!active||dungeonCleanup||dungeonLoading||e.ctrlKey||e.altKey||e.metaKey) return;
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
  if(key==='e') interact(e.shiftKey);
  else if(key==='f'){e.preventDefault();action('flight');}
  else if(key==='b') action('build');
  else if(key==='r'&&building) world.rotate();
  else if(key===' '){e.preventDefault();world.jump();}
  else if(building&&/^[1-9]$/.test(key)) selectPiece(buildTypes[Number(key)-1]);
  else if(!building&&/^[1-4]$/.test(key)) action('quick-slot',['attack','bow','dodge','potion'][Number(key)-1]);
});
window.addEventListener('keyup',e=>{
  const key=e.key.toLowerCase();
  world?.setKey(key,false);
  if(active&&saveMode==='tab'&&(motionKeys.has(key)||key===' '||key==='x')) persist(false);
});
window.addEventListener('blur',()=>world?.clearKeys());
window.addEventListener('contextmenu',event=>{
  if(active) event.preventDefault();
},{capture:true});
onGameWindowClose(()=>{if(active)persist(false);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)persist(false);});
setInterval(()=>{if(active)persist();},3400);
setInterval(()=>{if(active&&saveMode==='tab')persist(false);},900);
document.querySelectorAll('[data-move]').forEach(button=>{
  button.addEventListener('pointerdown',event=>{
    event.preventDefault();button.setPointerCapture(event.pointerId);
    world?.setKey(button.dataset.move,true);
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(name,()=>{
    world?.setKey(button.dataset.move,false);
    if(active&&saveMode==='tab'&&name!=='lostpointercapture') persist(false);
  });
});




