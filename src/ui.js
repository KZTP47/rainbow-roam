import {wardWorkshops} from './ward-workshops.js';
import {movableHotbar} from './hotbar-layout.js';
import {icon} from './icons.js';
import {items, recipes, species, villagers, regions, regionAt, canAfford, questReady} from './content.js';
import {wardrobe} from './wardrobe.js';
import {chartPins,localPlaces,mapPinStyle,paintRegion,mapFeatures,paintWorldChart} from './cartography.js';
import {geography,worldPoint,groundRealmAt} from './overworld.js';
import {mapItemRoute,mapTrackingCard} from './map-item-route.js';
import {atlas,homeland,houses,spells,realmRegions} from './horizons.js';
import {cropFood,furnishings,nearHomestead} from './homestead.js';
import {BANDITS} from './combat.js';
import {frontierPanels} from './frontier-panels.js';
import {createTownPanel} from './town-life-ui.js';
import {mountPropertyWalk,resetPropertyWalk} from './property-walk.js';
import {trackingText,trackingRegion} from './item-tracking.js';
import {trackingSelection} from './quest-tracking.js';
import {kitchen} from './town-life.js';
import {portraitIds} from './portrait-ids.js';
import {dungeonEntrances} from './dungeons.js';

const panels={
  journal:['book','Quest journal','Find leads and track active quests'],
  companions:['paw','Field guide','Offerings and friendship'],
  craft:['hammer','Crafting bench','Ingredients from your satchel'],
  bag:['bag','Satchel','Everything you’ve gathered and made'],
  map:['map','World atlas',Object.keys(regions).length+' places across '+Object.keys(atlas).length+' expeditions'],
  wardrobe:['shirt','Wardrobe','Change your look anytime'],
  atlas:['compass','Voyage atlas','Choose a destination'],
  care:['paw','Companion care','Spend time with your traveling companion'],
  sorting:['sparkles','The Sorting Ceremony','Join a Hogwarts house'],
  spells:['sparkles','Spellbook','Lessons and charms'],
  time:['moon','Time of day','Rest to a different time'],
  settings:['settings','Settings','Make yourself at home'],
  market:['bag','Market','Buy supplies or sell your harvest'],
  homestead:['house','Clover Cottage','Your cottage and kitchen garden'],
  wizardTower:['sparkles','Wizard Tower','Travel to a tower you’ve built underground'],
  activities:['house','Town life','Services, discoveries and traveling tools'],
  bounties:['compass','Ranger bounty board','Keep the trails safe for your friends']
};
const nav=[['bag','Bag','I'],['companions','Friends','C'],['craft','Craft','K'],['journal','Journal','J'],['map','Map','M']];
const quickSlots=[['attack','Strike','sword'],['bow','Bow','bow'],['dodge','Dodge','wind'],['potion','Heartleaf potion','heart']];
const itemIcon=(id)=>icon(items[id][1]);
const pictureSets={...portraitIds,wanted:BANDITS.map(b=>b.id)};
const newFriendIds=['dewbutton','pet-frostfern','pet-emberbells','pet-starcups','silkskip','rollbud','pealfoot'];
const friendPictures=typeof __ROAM_NEW_FRIENDS__==='string'
  ?__ROAM_NEW_FRIENDS__:new URL(import.meta.env.BASE_URL+'new-friends.webp',document.baseURI).href;
const fieldPictures=typeof __ROAM_FIELD_PICTURES__==='string'
  ?__ROAM_FIELD_PICTURES__:new URL(import.meta.env.BASE_URL+'field-portraits.webp',document.baseURI).href;
const itemPictures=typeof __ROAM_ITEM_PICTURES__==='string'
  ?__ROAM_ITEM_PICTURES__:new URL(import.meta.env.BASE_URL+'item-portraits.webp',document.baseURI).href;

const wantedPictures=typeof __ROAM_WANTED_PICTURES__==='string'
  ?__ROAM_WANTED_PICTURES__:new URL(import.meta.env.BASE_URL+'wanted-portraits.webp',document.baseURI).href;

function portrait(id,set,extra=''){
  const friendIndex=set==='field'?newFriendIds.indexOf(id):-1;
  if(friendIndex>=0) return `<span class="art-tile field-art ${extra}" aria-hidden="true" style="background-image:var(--new-friends);--art-c:${newFriendIds.length*100}%;--art-r:100%;--art-x:${friendIndex/(newFriendIds.length-1)*100}%;--art-y:0%"></span>`;
  const index=pictureSets[set].indexOf(id), columns=8;
  if(index<0){
    const symbol=set==='item'?items[id]?.[1]??'bag':species[id]?.reefIcon??'paw';
    return `<span class="art-tile art-icon ${extra}" aria-hidden="true">${icon(symbol,24)}</span>`;
  }
  const rows=Math.ceil(pictureSets[set].length/columns);
  const x=index%columns/(columns-1)*100,y=Math.floor(index/columns)/(rows-1)*100;
  return `<span class="art-tile ${set}-art ${extra}" aria-hidden="true"
    style="--art-x:${x}%;--art-y:${y}%;--art-c:${columns*100}%;--art-r:${rows*100}%"></span>`;
}

const cover = typeof __ROAM_OFFLINE_COVER__ === 'string'
  ? __ROAM_OFFLINE_COVER__
  : import.meta.env.BASE_URL + 'roam-cover.webp';

import {trails,friendHabitats} from './town-trails.js';

function logo() {
  return `<span class="brand-mark"><i></i><i></i><i></i>${icon('sparkle',13)}</span>`;
}

function itemBadge(id){return portrait(id,'item','item-icon');}
function action(label, action, symbol, extra='', klass='primary') {
  return `<button class="${klass}" data-action="${action}" ${extra}>${symbol?icon(symbol,17):''}<span>${label}</span></button>`;
}

function trackItem(id){
  return Object.hasOwn(items,id)?action('Track','track-item:'+id,'sparkles','aria-label="Track '+items[id][0]+'"','item-track-button'):'';
}

export function createUI(root, state, actions, hasSave) {
  root.style.setProperty('--new-friends','url("'+friendPictures+'")');
  root.style.setProperty('--field-pictures','url("'+fieldPictures+'")');
  root.style.setProperty('--item-pictures','url("'+itemPictures+'")');
  root.style.setProperty('--wanted-pictures','url("'+wantedPictures+'")');
  root.innerHTML=`
    <div id="view" aria-label="Rainbow Roam game world"></div>
    <main id="welcome">
      <img id="cover-art" src="${cover}" alt="" fetchpriority="high" draggable="false">
      <div class="cover-top"><span class="cover-brand">${logo()}<span>RAINBOW ROAM</span></span><button class="cover-audio" id="cover-audio" aria-label="Toggle sound"></button></div>
      <div class="cover-copy">
        <div class="dedication">${icon('heart',15)} <span>A LITTLE OPEN-WORLD ADVENTURE</span></div>
        <h1>Rainbow<br><em>Roam</em><span class="title-star">${icon('sparkles',39)}</span></h1>
        <p>Follow the rainbow into Blossom Valley.<br>Set out for far shores and islands in the clouds.</p>
        <button class="start" id="start"><span>${hasSave?'Continue roaming':'Begin adventure'}</span>${icon('arrow-right',21)}</button>
        <div class="cover-save">${action('Import progress','import-save','cloud-check','','small-action')}
          <p id="title-import-status" role="status"></p></div>
        <div class="cover-controls">${icon('mouse',15)} <span>Keyboard & mouse or touch</span></div>
      </div>
      <div class="cover-bottom"><span>${icon('pin',16)} BLOSSOM VALLEY</span><span class="cover-note">FAR HORIZONS ${icon('sparkles',12)}</span></div>
    </main>
    <div id="hud" hidden>
      <div id="location"><span class="location-mark">${logo()}</span><div><small id="region-note"></small><strong id="region"></strong></div></div>
      <button id="clock" data-action="time" class="clock" aria-label="Time of day"></button>
      <div class="header-actions">
        <span id="save-status" title="Progress saves automatically"></span>
        <button data-action="sound" id="sound" class="round" aria-label="Toggle sound"></button>
        <button data-action="wardrobe" class="round" aria-label="Wardrobe" title="Wardrobe (O)">${icon('shirt',20)}</button>
        <button data-action="settings" class="round" aria-label="Settings">${icon('settings',21)}</button>
      </div>
      <button id="objective" data-action="journal" aria-label="Open quest journal"></button>
      <div id="intro-hint"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Move</span><span>${icon('mouse',17)} Drag to look</span><span><kbd>E</kbd> Interact</span><span><kbd>M</kbd> World atlas</span></div>
      <nav id="field-links" aria-label="Frontier tools">
        ${[['market','Market','L','bag'],['homestead','Homestead','U','house'],['bounties','Bounties','Y','compass'],['activities','Town life','N','book']].map(([id,label,key,symbol])=>
          action(label,id,symbol,'title="'+label+' ('+key+')"','field-tool')).join('')}
      </nav>
      <div id="world-labels" aria-hidden="true"></div>
      <div id="toast-stack" aria-live="polite"></div>
      <button id="interact" data-action="interact" hidden></button>
      <div id="adventure-hotbar" role="group" aria-label="Adventure hotbar">
        ${quickSlots.map(([id,label,symbol],index)=>`<button type="button" data-action="quick-slot:${id}" data-quick="${id}"
          aria-label="${label}" title="${label} (${index+1})"><kbd>${index+1}</kbd>${icon(symbol,17)}${id==='potion'?'<span data-quick-count></span>':''}</button>`).join('')}
      </div>
      <div id="flight-status" hidden></div>
      <div id="item-trail-status" hidden></div>
      <button id="flight-button" data-action="flight" class="round" aria-label="Take flight" title="Take flight (F)">${icon('rainbow',20)}</button>
      <div id="room-camera" role="group" aria-label="Room controls" hidden>
        <button id="leave-tower" class="pill" data-action="leave-tower" hidden>${icon('arrow-right',17)} Leave tower</button>
        <button class="round" data-action="room-zoom:in" aria-label="Zoom room in" title="Zoom in">${icon('plus',17)}</button>
        <button class="round" data-action="room-zoom:out" aria-label="Zoom room out" title="Zoom out"><span aria-hidden="true">−</span></button>
      </div>
      <div id="build-tip" hidden></div><div id="reticle" hidden></div>
      <div class="touch-controls" id="touch-controls">
        <div class="dpad" aria-label="Movement">
          ${['up','left','down','right'].map((dir,i)=>`<button aria-label="Move ${dir}" data-move="${['w','a','s','d'][i]}" class="dir-${dir}">${icon('chevron-'+dir,22)}</button>`).join('')}
        </div>
        <div class="touch-actions">
          <button class="round" data-action="touch-rotate" aria-label="Rotate piece" hidden>${icon('rotate')}</button>
          <button class="round" data-action="touch-remove" aria-label="Remove piece" hidden>${icon('x')}</button>
          <button class="round" data-action="touch-place" aria-label="Place piece" hidden>${icon('plus')}</button>
          <button class="round" data-move=" " data-flight aria-label="Climb" hidden>${icon('chevron-up')}</button>
          <button class="round" data-move="x" data-flight aria-label="Descend" hidden>${icon('chevron-down')}</button>
          <button class="round" data-action="jump" aria-label="Jump">${icon('chevron-up')}</button>
        </div>
      </div>
      <nav id="toolbar" aria-label="Game tools">
        ${nav.map(([id,label,key])=>`<button data-action="${id}" class="tool" title="${label} (${key})">${icon(panels[id][0],22)}<span>${label}</span><kbd>${key}</kbd></button>`).join('')}
        <i></i><button data-action="build" class="tool build" title="Build (B)">${icon('hammer',22)}<span>Build</span><kbd>B</kbd></button>
      </nav>
      <button id="spellbook-link" class="round" data-action="spells" title="Spellbook (T)" aria-label="Spellbook" hidden>${icon('sparkles',20)}</button>
      <button id="buddy" data-action="care" aria-label="Companion care" title="Companion care (P)" hidden></button>
    </div>
    <div id="overlay" hidden></div>
    <input id="save-file-picker" type="file" accept=".json,application/json" hidden>
    <div id="game-alert" class="game-alert" hidden role="alert"></div>`;

  const el=(id)=>root.querySelector('#'+id);
  const overlay=el('overlay'), hud=el('hud');
  let opened=null, detail=null, returnFocus=null;
  let saveMessage='',saveMessageKind='',propertyCleanup=null,entryPreviews={};
  const frontier=frontierPanels(state,{action,itemBadge,trackItem,propertyPreview:view=>entryPreviews[view]??=(actions.propertyPreview?.(view)??''),wantedBadge:id=>portrait(id,'wanted')});
  const town=createTownPanel(state,{action,itemBadge,trackItem,fieldBadge:id=>portrait(id,'field'),activityContext:actions.activityContext});
  let mini=null, prompt=null, dateText=null, regionKey=null, lastMap=0;
  let trackedMapSource=null;
  let mapTab='world',mapRealm=state.realm,mapPlace=null,craftTab='all',wardrobeTab='appearance',portraitView='full';
  const outfitSections={appearance:['morph','skin','eyes','beard'],hair:['style','hair'],clothes:['outfit','coat','accessory']};
  movableHotbar(el('toolbar'),'tools');
  movableHotbar(el('adventure-hotbar'),'adventure');
  const controls=[['W A S D','Move'],['Drag mouse','Look around'],['Shift','Run'],['Space','Jump'],['E','Talk, gather or offer a treat'],['B','Toggle build mode'],['Left click','Place in build mode or strike in combat'],['Right click','Retrieve a building piece or lock on in combat'],['R','Rotate a building piece'],['1–7','Select a building piece'],['I / C / K / J / M','Bag / Friends / Craft / Journal / Map'],['V / P / T','Voyage atlas / Companion care / Spellbook'],['L / U / Y / N','Market / Homestead / Bounties / Town life'],['Z / H / Q','Strike / Bow / Lock target'],['Hold G / X','Guard / Dodge on land'],['Esc','Close the current panel']];

  function sound() {
    for(const id of ['sound','cover-audio']) {
      el(id).innerHTML=icon(state.sound?'volume':'mute',20);
      el(id).setAttribute('aria-pressed',String(!state.sound));
    }
  }

  function toast(title,body='',symbol='sparkles') {
    const target=el('toast-stack');
    if(target.children.length>2) target.firstElementChild.remove();
    const card=document.createElement('div');
    card.className='toast';
    card.innerHTML=`<span>${icon(symbol,20)}</span><div><strong></strong><small></small></div>`;
    card.querySelector('strong').textContent=title; card.querySelector('small').textContent=body;
    target.append(card);
    setTimeout(()=>{card.classList.add('fading');setTimeout(()=>card.remove(),300);},3400);
  }

  function objective() {
    const here=state.realm??homeland;
    const found=villagers.find(v=>v.id===state.trackingQuest&&state.quests[v.id]!=='done') ??
      villagers.find(v=>(v.realm??homeland)===here&&state.quests[v.id]==='active');
    if(!found&&here!==homeland){
      const local=villagers.find(v=>v.region===regionKey&&!state.quests[v.id]);
      const label=here==='hogwarts'&&!state.magic.house?'Join a Hogwarts house':local?'Meet '+local.name:'Explore '+atlas[here].name;
      const hint=here==='hogwarts'&&!state.magic.house?'Talk to McGonagall in the Great Hall':local?.quest??'Open the journal to follow a local story';
      el('objective').innerHTML=`<span class="quest-icon">${icon('compass',18)}</span><span><small>${atlas[here].name}</small><strong>${label}</strong><em>${hint}</em></span>`;
      return;
    }
    if(!found && state.quests.poppy==='done' && !state.quests.fern) {
      el('objective').innerHTML=`<span class="quest-icon">${icon('hammer',18)}</span><span><small>PETALWICK</small><strong>Meet the carpenter</strong><em>Talk to Fern near the violet cottage</em></span>`;
      return;
    }
    if(!found) {
      el('objective').innerHTML=`<span class="quest-icon">${icon('compass',18)}</span><span><small>FREE ROAM</small><strong>Wander the valley</strong><em>Meet friends and discover new places</em></span>`;
      return;
    }
    const accepted=state.quests[found.id]==='active';
    const ready=accepted&&questReady(found,state);
    el('objective').innerHTML=`<span class="quest-icon">${icon(ready?'check':'sparkle',18)}</span><span><small>${ready?'READY TO TURN IN':found.id===state.trackingQuest?'TRACKED QUEST':'CURRENT QUEST'}</small><strong>${found.quest}</strong><em>${ready?'Return to '+found.name:accepted?found.find:'Meet '+found.name}</em></span>`;
  }

  function activeBuddy() {
    const id=state.active, buddy=el('buddy');
    buddy.hidden=!id;
    el('spellbook-link').hidden=!state.magic.known.length&&state.realm!=='hogwarts';
    buddy.innerHTML=id?`<span style="--buddy:${species[id].accent}">${icon('paw',20)}</span><div><small>COMPANION</small><strong>${species[id].name}</strong></div>`:'';
  }

  function crafting() {
    const tabs=[['all','All recipes'],['ready','Ready to craft'],['food','Treats'],['build','Building'],['decor','Furniture']];
    const category=(id,r)=>Object.hasOwn(furnishings,id)?'decor':r.build?'build':'food';
    const ready=Object.entries(recipes).filter(([,r])=>canAfford(state.inventory,r.cost)).length;
    const stock=Object.entries(recipes).filter(([id,r])=>craftTab==='all'||
      (craftTab==='ready'?canAfford(state.inventory,r.cost):craftTab===category(id,r)));
    return `<div class="folio-feature workbench-feature"><span class="feature-art" aria-hidden="true">${itemBadge('lantern')}${itemBadge('wood')}${itemBadge('treat')}</span>
      <div><strong>${ready} recipes ready</strong><p>Make treats for wildlife, build outdoors, or craft furniture for Clover Cottage.</p></div>
      ${action('Enter build mode','build','hammer','','small-action')}</div>
      <div class="tab-row folio-tabs">${tabs.map(([id,label])=>`<button data-action="craft-tab:${id}" aria-pressed="${craftTab===id}">${label}</button>`).join('')}</div>
      <div class="recipe-list folio-grid">${stock.map(([id,r])=>{
      const ok=canAfford(state.inventory,r.cost);
      return `<article class="recipe folio-recipe">
        ${itemBadge(id)}<div class="recipe-name"><strong>${items[id][0]} <small>×${r.count}</small></strong>
        <div class="cost" aria-label="Ingredients">${Object.entries(r.cost).map(([item,n])=>`<span class="ingredient-entry ${(state.inventory[item]??0)<n?'low':''}"
          title="${items[item][0]}" aria-label="${items[item][0]}, ${state.inventory[item]??0} of ${n}">
          ${portrait(item,'item','ingredient-art')} ${state.inventory[item]??0}/${n} ${trackItem(item)}</span>`).join('')}</div></div>
        <div class="item-recipe-actions">${trackItem(id)}<button class="small-action" data-action="craft:${id}" ${ok?'':'disabled'}>Craft</button></div>
      </article>`;
    }).join('')||'<p class="folio-empty">Gather ingredients or choose another recipe category.</p>'}</div>`;
  }

  const chapterIcon={valley:'flower-2',coast:'compass',woods:'trees',frost:'mountain',mesa:'sun',
    delta:'sprout',sky:'rainbow',hogwarts:'sparkles',heath:'flower-2',cinder:'lamp',reef:'gem',
    verdigris:'mountain',orchards:'cherry'};
  let journalScope='current';
  function journal() {
    const visible=villagers.filter(v=>journalScope==='all'||(journalScope==='active'?
      state.quests[v.id]==='active':(v.realm??homeland)===state.realm));
    const finished=Object.values(state.quests).filter(x=>x==='done').length;
    const commissions=Object.values(wardWorkshops).filter(room=>{
      const n=state.roomActivities[room.id]??0;
      return journalScope==='all'||(journalScope==='active'?n>0&&n<room.activity.steps.length:room.realm===state.realm);
    }).map(room=>{
      const n=state.roomActivities[room.id]??0;
      return `<article class="journal-entry folio-story"><span class="story-mark">${room.name} · ${n}/${room.activity.steps.length}</span><div><strong>${room.activity.title}</strong><p>${room.activity.directions[n]??'Completed · '+room.reward[1]}</p></div></article>`;
    }).join('');
    const chapter=atlas[state.realm],color=chapter.colors?.[0]??'#a9bb8e';
    return `<div class="folio-feature journal-cover" style="--chapter:${color}">
      <span class="chapter-illustration" aria-hidden="true">${icon(chapterIcon[state.realm],40)}</span>
      <div><strong>${chapter.name}</strong><p>${finished} of ${villagers.length} stories complete</p><progress max="${villagers.length}" value="${finished}" aria-label="Stories completed"></progress></div>
      ${action('View map','map','map','','small-action')}</div>
      <div class="tab-row folio-tabs">${[['active','Active quests'],['current','This expedition'],['all','All stories']].map(([id,label])=>
      `<button data-action="journal-scope:${id}" aria-pressed="${journalScope===id}">${label}</button>`).join('')}</div>
      <div class="journal-list folio-grid">${commissions}${Object.entries(trails).filter(([realm])=>journalScope==='all'||(journalScope==='active'?state.trails[realm]>0&&state.trails[realm]<5:realm===state.realm)).map(([realm,trail])=>{
        const stage=state.trails[realm]??0;
        return `<article class="journal-entry folio-story"><span class="story-mark">${atlas[realm].name} · ${stage}/5</span><div><strong>${trail.title}</strong><p>${trail.directions[stage]??'Completed · '+trail.reward}</p></div></article>`;
      }).join('')}${visible.map(v=>{
      const status=state.quests[v.id],ready=status==='active'&&questReady(v,state);
      const realm=v.realm??homeland,place=regions[v.region??regionAt(v.x,v.z,realm)];
      const rewards=Object.keys(v.reward).filter(id=>Object.hasOwn(items,id));
      const goalItem=v.goal.item??v.goal.craft??v.goal.place;
      const selected=state.trackingQuest===v.id;
      const kind=v.goal.bond?'paw':v.goal.spell||v.goal.house?'sparkles':v.goal.stamp?'map':v.goal.place||v.goal.craft?'hammer':'book';
      const label=status==='done'?'Completed':ready?'Return to '+v.name:status?v.find:'Meet '+v.name+' in '+place.name;
      return `<article class="journal-entry folio-story ${status==='done'?'quest-done':''}" style="--chapter:${atlas[realm].colors?.[0]??'#abc091'}">
       <span class="story-mark" title="${place.name}">${icon(status==='done'||ready?'check':kind,20)} ${place.name}</span>
       <div><strong>${v.quest}</strong><p>${label}</p></div>
       <div class="story-bottom">${rewards.map(id=>`<span class="item-story-reward" title="Reward: ${items[id][0]}">${itemBadge(id)}${trackItem(id)}</span>`).join('')}
       ${status==='active'&&goalItem?`<span class="item-story-reward" title="Required: ${items[goalItem]?.[0]}">${itemBadge(goalItem)}${trackItem(goalItem)}</span>`:''}
       ${status!=='done'?`<button data-action="${selected?'clear-quest-track':'track-quest:'+v.id}" class="track" aria-label="${selected?'Stop tracking ':'Track '}${v.quest}" aria-pressed="${selected}">${icon(selected?'x':'sparkles',16)} <span>${selected?'Stop tracking':'Track'}</span></button>`:''}</div>
      </article>`;
    }).join('')||(!commissions?'<p class="folio-empty">No active quests. Check this expedition for someone to meet.</p>':'')}</div>`;
  }

  let friendFilter='new';
  function companions() {
    const filters=[['new','New friends'],['local','Nearby'],['bonded','Befriended'],['all','All creatures']];
    const roster=Object.entries(species).filter(([id,spec])=>
      friendFilter==='all'||(friendFilter==='new'?spec.reefIcon||Object.hasOwn(friendHabitats,id):friendFilter==='local'?spec.place===regions[regionKey]?.name:state.companions.includes(id))
    );
    const active=state.active&&species[state.active];
    return `<div class="folio-feature field-guide-feature">
      ${active?portrait(state.active,'field','feature-specimen'):`<span class="chapter-illustration">${icon('paw',34)}</span>`}
      <div><strong>${active?active.name+' is roaming with you':'Friends of Far Horizons'}</strong>
      <p>${state.companions.length} of ${Object.keys(species).length} befriended · Check a creature’s favorite offering before approaching.</p></div>
      ${active?action('Companion care','care','heart','','small-action'):''}</div>
      <div class="tab-row folio-tabs">${filters.map(([id,label])=>`<button data-action="friend-filter:${id}" aria-pressed="${friendFilter===id}">${label}</button>`).join('')}</div>
      <div class="companion-list folio-grid">${roster.map(([id,spec])=>{
      const befriended=state.companions.includes(id),missing=state.bounties.abducted?.pet===id;
      const away=state.townLife.trip?.pet===id;
      return `<article class="companion-card folio-friend" style="--fur:${spec.color};--accent:${spec.accent}">
        <div class="friend-plate">${portrait(id,'field','specimen')}${befriended?`<span class="friend-attached">${icon(missing?'pin':'heart',14)}</span>`:''}</div>
        <div class="friend-description"><strong>${spec.name}</strong><small>${spec.family} · ${spec.place}</small>
        ${befriended?`<p>${spec.lore}</p>`:`<p class="offering">${portrait(spec.favorite,'item','ingredient-art')}
          Likes ${items[spec.favorite][0].toLowerCase()} · ${spec.trust} ${spec.trust===1?'offering':'offerings'} ${trackItem(spec.favorite)}</p>`}
        ${!befriended&&Object.hasOwn(friendHabitats,id)?action('Visit '+spec.place,'visit-friend:'+id,'map','','small-action'):''}
        ${missing?'<strong class="missing-friend">Missing · See the bounty board</strong>':away?'<strong>Out foraging · Check expeditions</strong>':befriended?`<div class="companion-actions"><button data-action="buddy:${id}" class="small-action companion-button" aria-label="${state.active===id?'Send to rest':'Roam together'}">${icon(state.active===id?'moon':'paw',14)} ${state.active===id?'Rest':'Roam'}</button>
          <button data-action="care-for:${id}" class="small-action" aria-label="Care for ${spec.name}">${icon('heart',14)} Care</button></div>`:''}</div></article>`;
    }).join('')||'<p class="folio-empty">No creatures are listed here. Try a different tab or explore another place.</p>'}</div>`;
  }

  function worldChart(journey,routeKey,tracking){
    const points=chartPins;
    const stamp={valley:'pin',coast:'compass',woods:'trees',frost:'mountain',
      mesa:'sun',delta:'sprout',sky:'rainbow',hogwarts:'sparkles'};
    const ordered=Object.keys(atlas);
    const placeEntries=id=>Object.entries(regions).filter(([,r])=>(r.realm??homeland)===id);
    return `<div class="world-chart" aria-label="World chart">
      <canvas id="worldchart" width="1040" height="620" aria-hidden="true"></canvas>
      ${mapItemRoute(journey,tracking)}
      ${Object.entries(points).map(([id,[x,y]])=>`<button data-action="inspect-map:${id}" aria-label="View map of ${atlas[id].name}"
        ${state.realm===id?'aria-current="location"':''} style="--wx:${x}%;--wy:${y}%;--realm:${atlas[id].colors?.[0]??'#c8bf94'}">
        ${icon(stamp[id]??'compass',16)}<span>${atlas[id].name}</span></button>`).join('')}</div>${routeKey}
      <div class="atlas-quick-links">${action('Visit Hogwarts','voyage:hogwarts','sparkles','','small-action')}
        ${action('Visit the floating islands','voyage:sky','rainbow','','small-action')}</div>
      <div class="atlas-index"><h3>All ${Object.keys(regions).length} places</h3>
        ${ordered.map(id=>{
          const entries=placeEntries(id);
          return `<details><summary><strong>${atlas[id].name}</strong><span>${entries.length} ${entries.length===1?'place':'places'}</span></summary>
            <p>${atlas[id].tagline}</p><div class="map-regions">${entries.map(([place,r])=>{
              const first=atlas[id].entry===place, ferry=id==='sky', unlocked=state.discoveries.includes(place);
              const command=ferry?'ferry:'+place:first?'voyage:'+id:'travel:'+place;
              return action(r.name,command,ferry?'rainbow':unlocked||first?'pin':'lock',
                unlocked||first||ferry?'':'disabled title="Discover on foot"','atlas-place');
            }).join('')}</div></details>`;
        }).join('')}</div>`;
  }

  function map() {
    const tabs=`<div class="tab-row map-tabs">${[['world','World atlas'],['local','Local map']].map(([id,label])=>
      `<button data-action="map-tab:${id}" aria-pressed="${mapTab===id}">${label}</button>`).join('')}</div>`;
    const tracking=trackingSelection(state);
    const journey=tracking?actions.trackingJourney():null;
    const tools=mapTrackingCard(tracking,journey);
    const routeKey=journey?.points?`<span class="map-route-key">${icon('sparkles',14)} Rainbow trail nearby · Dotted route onward</span>`:'';
    if(mapTab==='world') return tabs+tools+worldChart(journey,routeKey,tracking);
    const local=localPlaces(mapRealm);
    const focus=regions[mapPlace];
    const title=focus?.name??atlas[mapRealm].name;
    return tabs+tools+`<div class="atlas-actions">
       ${mapPlace?action('Full regional map','inspect-map:'+mapRealm,'map','','small-action'):''}
       ${mapRealm!==state.realm?action('Travel to '+atlas[mapRealm].name,'voyage:'+mapRealm,'compass','','small-action'):''}
       ${mapRealm==='hogwarts'||state.magic.known.length?action('Spellbook','spells','sparkles','','small-action'):''}</div>
      <h3 class="regional-map-title">${title}</h3>
      ${mapRealm==='sky'?'':`<div class="map-sky-adjacent">${realmRegions('sky').filter(([,p])=>{
        const below=worldPoint('sky',p.x,p.z);
        return groundRealmAt(below.x,below.z)===mapRealm;
      }).map(([id,p])=>action(p.name+' above','inspect-island:'+id,'rainbow','aria-label="View map of '+p.name+'"','small-action')).join('')}</div>`}
      <div class="regional-map">
        <canvas id="bigmap" width="1050" height="660" aria-label="Map of ${title}"></canvas>
        ${mapItemRoute(journey,tracking,mapRealm,mapPlace)}
        ${dungeonEntrances.filter(cave=>cave.realm===mapRealm&&(!mapPlace||regionAt(cave.x,cave.z,mapRealm)===mapPlace)).map(cave=>{
          const pin=mapPinStyle(mapRealm,cave,mapPlace);
          return `<span class="cave-map-pin" style="--mx:${pin.x}%;--my:${pin.y}%" title="${cave.name}">${icon('mountain',15)}<span>${cave.name}</span></span>`;
        }).join('')}
        ${!mapPlace&&mapRealm!=='hogwarts'?local.map(([id,r])=>{
          const pin=mapPinStyle(mapRealm,r,null);
          return `<button class="regional-pin" data-action="inspect-place:${id}" title="View map of ${r.name}" aria-label="View map of ${r.name}"
             style="--mx:${pin.x}%;--my:${pin.y}%;--map-pin:${r.color}">${icon('pin',14)}<span>${r.name}</span></button>`;
        }).join(''):''}
      </div>
      <div class="map-legend"><i></i> You <i></i> Quest giver <span>${journey?.points?routeKey:'Dashed lines mark trails'}</span></div>
      ${mapPlace||mapRealm==='hogwarts'?`<ul class="map-features">${mapFeatures(mapRealm,mapPlace).map(label=>`<li>${label}</li>`).join('')}</ul>`:''}
      <div class="map-regions">${local.map(([id,r])=>{
        const ferry=mapRealm==='sky';
        const reachable=state.discoveries.includes(id)||ferry;
        return `<button data-action="${ferry?'ferry':'travel'}:${id}" ${reachable?'':'disabled'}><i style="background:${r.color}"></i>${r.name}${icon(reachable?'pin':'lock',14)}</button>`;
      }).join('')}</div>`;
  }

  function voyageAtlas(){
    const skyStops=state.realm==='sky'?realmRegions('sky'):[];
    return `${skyStops.length?`<h3>Wind ferry stops</h3><div class="atlas-list">
      ${skyStops.map(([id,r])=>`<button data-action="ferry:${id}" style="--realm:${r.color}">
        <span>${icon('pin',19)}</span><div><strong>${r.name}</strong><small>${r.note}</small></div>${icon('arrow-right',17)}</button>`).join('')}
      </div><h3>Expeditions</h3>`:''}<div class="atlas-list voyage-cards">
      ${Object.entries(atlas).map(([id,r])=>{
        const visited=state.discoveries.filter(place=>(regions[place]?.realm??homeland)===id).length;
        const count=Object.values(regions).filter(place=>(place.realm??homeland)===id).length;
        return `<button data-action="voyage:${id}" style="--realm:${r.colors?.[0]??'#a5bb8e'}">
          <span>${icon(chapterIcon[id]??'compass',26)}</span>
          <div><strong>${r.name}</strong><small>${r.tagline}</small></div><em>${visited}/${count}</em>
        </button>`;
      }).join('')}</div>${action('Open world atlas','map','map','','panel-link')}`;
  }

  function companionCare(){
    const id=state.active,spec=species[id];
    if(!spec) return `<p class="muted">Choose a befriended creature to roam with you.</p>${action('Open field guide','companions','paw','','panel-link')}`;
    const history=state.care[id]??{affinity:0};
    const food=[...cropFood,...Object.keys(kitchen)].filter(id=>state.inventory[id]>0).map(id=>
      `<div class="item-inline-actions">${action('Feed '+items[id][0].toLowerCase(),'feed-crop:'+id,'sprout',history.resting?'disabled':'','small-action')}${trackItem(id)}</div>`).join('');
    const affinity=history.affinity,label=history.resting?'Taking a nap':affinity>=8?'Inseparable':affinity>=3?'Trusting you':'Getting to know you';
    return `<div class="care-profile" style="--pet:${spec.accent}">
      ${portrait(id,'field','care-art')}<div><strong>${spec.name}</strong><small>${label}</small></div>
      </div><div class="affinity"><label for="affinity-meter">Friendship</label><meter id="affinity-meter" min="0" max="12" value="${affinity}"></meter><span>${affinity} / 12</span></div>
      <div class="care-buttons">
        ${action('Pet','pet-care:pet','heart',history.resting?'disabled':'','small-action')}
        <div class="item-inline-actions">${action('Give '+items[spec.favorite][0].toLowerCase(),'pet-care:feed','cookie',history.resting||!state.inventory[spec.favorite]?'disabled':'','small-action')}${trackItem(spec.favorite)}</div>
        ${action('Play fetch','pet-care:play','sparkles',history.resting?'disabled':'','small-action')}
        ${action(history.resting?'Wake up':'Take a nap','pet-care:rest','moon','','small-action')}
        ${action('Scout for materials','pet-care:scout','compass',history.resting||affinity<3?'disabled':'','small-action')}
        ${action('Meet local wildlife','pet-care:meet','paw',history.resting?'disabled':'','small-action')}
        ${food}
      </div>${affinity<3?'<p class="muted">Reach 3 friendship to scout for nearby materials together.</p>':''}`;
  }

  function sorting(){
    return `<p class="house-intro">“You must be the traveler from the valley. Please step away from the end of the table. The Hat can hear you from the stool. If you have a preference, I suggest you tell it.”</p>
      <div class="atlas-list">${Object.entries(houses).map(([id,[name,color,trait]])=>`
        <button data-action="sort:${id}" style="--realm:${color}"><span>${icon('sparkles',20)}</span>
        <div><strong>${name}</strong><small>${trait}</small></div>${icon('arrow-right',17)}</button>
      `).join('')}</div>`;
  }

  function spellbook(){
    const house=houses[state.magic.house];
    return `<div class="progress-text">${house?house[0]+' · ':''}${Object.keys(state.magic.mastered).length} / 3 charms mastered</div>
      ${house?'':'<p class="muted">Speak to Professor McGonagall in the Great Hall to join a house and begin lessons.</p>'}
      <div class="spell-list">${Object.entries(spells).map(([id,spell])=>{
        const known=state.magic.known.includes(id);
        const teacher=villagers.find(v=>v.id===spell.teacher).name;
        return `<article><div><strong>${spell.name}</strong><small>${known?(state.magic.mastered[id]?'Mastered':'Practice with '+teacher):'Learn from '+teacher}</small><p>${spell.description}</p></div>
          ${action('Cast '+spell.name,'cast:'+id,'sparkles',known?'':'disabled','small-action')}</article>`;
      }).join('')}</div>`;
  }

  function dressingRoom() {
    const alien=state.look.morph===4,teddy=state.look.morph===3,angel=state.look.morph===2;
    const tabs=[['appearance','Features'],...(teddy||alien?[]:[['hair','Hair']]),['clothes','Outfit']];
    const sections=state.look.morph===5?{appearance:['morph','skin','eyes','scales'],hair:['style','hair'],clothes:['coat','accessory']}:alien?{appearance:['morph','glowSkin','eyes'],clothes:['coat']}:teddy?{appearance:['morph','fur','ears'],clothes:['toy','coat']}:angel
      ? {...outfitSections,appearance:['morph','skin','eyes','wingShape'],clothes:['outfit','coat','feather','halo']}
      : outfitSections;
    const visible=sections[wardrobeTab]??sections.appearance;
    return `<div class="outfit-preview"><canvas id="outfit-preview" width="284" height="328" aria-label="Preview of your traveler"></canvas>
      <div class="portrait-controls">
        <button class="small-action" data-action="portrait-view" aria-label="${portraitView==='full'?'Show face close-up':'Show full body'}">${portraitView==='full'?'View face':'Full body'}</button>
        <button class="small-action" data-action="reset-look">${icon('rotate',15)} Reset look</button>
      </div></div>
    <div class="tab-row wardrobe-tabs">${tabs.map(([id,name])=>`<button data-action="wardrobe-tab:${id}" aria-pressed="${id===wardrobeTab}">${name}</button>`).join('')}</div>
    <div class="outfit-choices">${visible.map(id=>[id,wardrobe[id]]).map(([id,{label,choices}])=>`
      <fieldset><legend>${label}</legend><div class="outfit-options ${choices[0][1]?'swatches':''}">
      ${choices.map(([name,color],i)=>`<button data-action="look:${id}-${i}" aria-pressed="${(state.look[id]??0)===i}"
        aria-label="${name}" title="${name}" ${color?`style="--swatch:${color}"`:''}>${color?`<span>${icon('check',15)}</span>`:name}</button>`).join('')}
      </div></fieldset>`).join('')}</div>`;
  }

  function timeOfDay(){
    return `<div class="atlas-list">
      ${[['sunrise','Sunrise','06:21','#e8b19c','sun'],['sunset','Sunset','18:03','#c49dad','sun'],
         ['night','Night','22:09','#8a9ac3','moon']].map(([id,label,time,color,symbol])=>
        `<button data-action="rest-until:${id}" aria-label="Rest until ${label.toLowerCase()}" style="--realm:${color}">
          <span>${icon(symbol,21)}</span><div><strong>Rest until ${label.toLowerCase()}</strong><small>${time}</small></div>
          ${icon('arrow-right',16)}</button>`).join('')}
      </div>`;
  }

  function wizardTower(){
    const linked=dungeonEntrances.filter(cave=>state.dungeons.towers[cave.id]);
    return linked.length?`<div class="atlas-list">${linked.map(cave=>`
      <button data-action="wizard-travel:${cave.id}" style="--realm:#c5b4e4">
        <span>${icon('sparkles',19)}</span><div><strong>${cave.name}</strong><small>Linked dungeon tower</small></div>${icon('arrow-right',17)}
      </button>`).join('')}</div>`
      :'<p class="muted">Find a tower foundation underground. Build a Wizard Tower there to link it to Clover Cottage.</p>';
  }

  function settings() {
    return `<div class="settings-actions">${action('Save progress','save','cloud-check','','small-action')}
      ${action(state.sound?'Mute sound':'Enable sound','sound',state.sound?'volume':'mute','','small-action')}
      ${action('Title screen','title','rainbow','','small-action')}</div>
      <h3>Progress files</h3><div class="settings-actions">
        ${action('Export progress','export-save','cloud-check','','small-action')}
        ${action('Import progress','import-save','bag','','small-action')}
      </div>
      <p id="settings-import-status" role="status" class="save-note"></p>
      <p class="muted">Importing replaces your current progress. Export a backup first to keep it.</p>
      <details class="controls-fold"><summary>Keyboard and mouse controls</summary><dl class="controls-list">${controls.map(([key,verb])=>`<div><dt>${verb}</dt><dd><kbd>${key}</kbd></dd></div>`).join('')}</dl></details>
      <p class="muted">Progress is saved in this browser.</p>`;
  }

  const views={...frontier.views,activities:()=>town.render(),craft:crafting,journal,companions,map,wardrobe:dressingRoom,settings,
    atlas:voyageAtlas,care:companionCare,sorting,spells:spellbook,time:timeOfDay,wizardTower};
  function refresh() {
    objective(); activeBuddy(); sound();
    if(opened) drawPanel();
  }

  function showPanel(id, info=null) {
    if(!id) {
      propertyCleanup?.();propertyCleanup=null;
      opened=null; detail=null; overlay.hidden=true; overlay.innerHTML=''; mini=null;
      hud.classList.remove('menu-open');
      document.querySelectorAll('.tool').forEach(btn=>btn.removeAttribute('aria-pressed'));
      returnFocus?.focus({preventScroll:true});returnFocus=null;
      return;
    }
    if(!opened&&document.activeElement instanceof HTMLButtonElement) returnFocus=document.activeElement;
    if(id==='craft'&&Object.hasOwn(recipes,info)) craftTab='all';
    if(id==='map'&&opened!==id) {mapTab='world';mapRealm=state.realm;mapPlace=null;}
    if(id==='homestead'){
      if(opened!==id){resetPropertyWalk(state);entryPreviews={};}
      frontier.openProperty(info?.view??info);
      if(info?.view) frontier.editProperty(info.view,info.slot);
    }
    if(id==='activities') town.show(info);
    if(id==='market') frontier.openMarket(info);
    opened=id; detail=info;
    overlay.hidden=false; hud.classList.add('menu-open');
    document.querySelectorAll('.tool').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.action===id)));
    drawPanel();
    overlay.querySelector('.close')?.focus({preventScroll:true});
    if(id==='craft'&&Object.hasOwn(recipes,info)){
      const target=overlay.querySelector('[data-action="craft:'+info+'"]');
      target?.closest('article')?.scrollIntoView({block:'center'});
      target?.focus({preventScroll:true});
    }
  }

  function drawPanel() {
    propertyCleanup?.();propertyCleanup=null;
    const oldScroll=overlay.querySelector('.panel-body')?.scrollTop??0;
    const expansionOpen=opened==='homestead'&&overlay.querySelector('.property-expansion')?.open;
    const focused=overlay.contains(document.activeElement)?document.activeElement.dataset.action:null;
    if(opened==='dialog') {
      const {npc,text,button,command,topic,note,choices}=detail;
      overlay.className='dialog-overlay';
      overlay.innerHTML=`<section role="dialog" aria-modal="true" aria-labelledby="dialog-title" class="dialog">
        <div class="dialog-head"><span class="portrait" style="--portrait:${npc.colors[1]}">${icon('message-circle',24)}</span>
        <div><small>${npc.role}</small><h2 id="dialog-title">${npc.name}</h2></div>
        <button class="round close" data-action="close" aria-label="Close dialogue">${icon('x',21)}</button></div>
        <p>${text}</p>${note?`<p class="dialog-note">${note}</p>`:''}
        ${choices?`<div class="dialog-choices">${choices.map(({label,command})=>action(label,command,null)).join('')}</div>`:''}
        <div class="dialog-actions">
          ${npc.goal?.item&&state.quests[npc.id]!=='done'?trackItem(npc.goal.item):''}
          ${topic?action(topic,'npc-topic:'+npc.id,'book','','small-action'):''}
          ${action(button,command,choices?null:'arrow-right','',choices?'small-action':'primary')}</div></section>`;
      return;
    }
    const [symbol,title,subtitle]=panels[opened];
    const property=opened==='homestead'&&state.homestead.owned&&nearHomestead(state);
    const folio=['craft','journal','companions','atlas','market','bounties','activities'].includes(opened);
    const mode=opened==='map'?'map':property?'property':folio?'folio':null;
    overlay.className='drawer-overlay'+(mode?' '+mode+'-overlay':'');
    overlay.innerHTML=`<aside role="dialog" aria-modal="true" aria-labelledby="panel-title" class="drawer${mode?' '+mode+'-drawer':''}" data-panel="${opened}">
      <header><span class="drawer-icon">${icon(symbol,24)}</span><div><h2 id="panel-title">${title}</h2><p>${subtitle}</p></div><button class="round close" data-action="close" aria-label="Close panel">${icon('x',21)}</button></header>
      <div class="panel-body">${views[opened]()}</div></aside>`;
    overlay.querySelector('.panel-body').scrollTop=oldScroll;
    if(expansionOpen){
      const expansion=overlay.querySelector('.property-expansion');
      if(expansion) expansion.open=true;
    }
    mini=el('bigmap');
    if(mini) paintRegion(mini,mapRealm,mapPlace,state,actions.mapHeight);
    const chart=el('worldchart');
    if(chart) paintWorldChart(chart);
    if(opened==='settings') renderSaveMessage();
    if(opened==='homestead'){
      const walk=overlay.querySelector('.property-walk');
      if(walk) propertyCleanup=mountPropertyWalk(walk,state,{start:frontier.propertyView(),renderer:actions.walkRenderer(),
        edit:(view,slot)=>{frontier.editProperty(view,slot);drawPanel();}});
    }
    if(opened==='wardrobe') actions.drawOutfit(el('outfit-preview'),portraitView);
    if(focused) [...overlay.querySelectorAll('button')].find(b=>b.dataset.action===focused&&!b.disabled)?.focus({preventScroll:true});
  }

  function renderBuild(building, valid) {
    el('adventure-hotbar').hidden=building;
    el('build-tip').hidden=!building; el('reticle').hidden=!building;
    el('toolbar').classList.toggle('build-active',building);
    const touch=el('touch-controls');
    touch.querySelectorAll('[data-action^="touch-"]').forEach(button=>button.hidden=!building);
    if(!building) return;
    const tip=el('build-tip');
    const stock=state.inventory[state.selected]??0;
    tip.innerHTML=`<div class="build-status">${icon('hammer',17)} <strong>Build mode</strong><button data-action="build" title="Exit build mode" aria-label="Exit build mode">${icon('x',16)}</button></div>
      <div class="block-picker">${Object.keys(recipes).filter(id=>recipes[id].build).map((id,i)=>`<button class="${state.selected===id?'active':''}" data-action="piece:${id}" title="${items[id][0]}" aria-label="Select ${items[id][0]}">${i<9?`<kbd>${i+1}</kbd>`:''}${itemIcon(id)}<small>${state.inventory[id]??0}</small></button>`).join('')}</div>
      <p>${items[state.selected][0]} · ${stock?'Aim at the ground or a block':'Craft more at the bench'} ${trackItem(state.selected)}</p>
      <div class="build-keys"><span>Click to place</span><span>Right-click to remove</span><span><kbd>R</kbd> Rotate</span></div>`;
    el('reticle').classList.toggle('valid',valid);
  }

  root.addEventListener('click',(event)=>{
    const button=event.target.closest('[data-action]');
    if(button) {
      const [key,id]=button.dataset.action.split(':');
      if(key==='map-tab') {mapTab=id;mapRealm=state.realm;mapPlace=null;drawPanel();return;}
      if(key==='inspect-map') {mapRealm=id;mapPlace=null;mapTab='local';overlay.querySelector('.panel-body').scrollTop=0;drawPanel();return;}
      if(key==='track-destination'||key==='inspect-island'){
        const target=key==='inspect-island'?regions[id]:actions.trackingJourney()?.source;
        if(!target?.realm||target.kind==='craft') return;
        mapRealm=target.realm;mapTab='local';
        mapPlace=key==='inspect-island'?id:regions[target.id]?.realm===target.realm?target.id:regionAt(target.x,target.z,target.realm);
        const where=mapPinStyle(mapRealm,target,mapPlace);
        if(where.x<4||where.x>96||where.y<5||where.y>95) mapPlace=null;
        overlay.querySelector('.panel-body').scrollTop=0;drawPanel();
        if(key==='track-destination') overlay.querySelector('.map-item-pin')?.scrollIntoView({block:'nearest'});
        return;
      }
      if(key==='inspect-place') {mapPlace=id;overlay.querySelector('.panel-body').scrollTop=0;drawPanel();return;}
      if(key==='wardrobe-tab') {wardrobeTab=id;drawPanel();return;}
      if(key==='portrait-view') {portraitView=portraitView==='full'?'face':'full';drawPanel();return;}
      if(key==='journal-scope') {journalScope=id;drawPanel();return;}
      if(key==='friend-filter') {friendFilter=id;drawPanel();return;}
      if(frontier.select(key,id)) {
        drawPanel();
        if(key==='bounty-file') overlay.querySelector('.bounty-dossier')?.scrollIntoView({block:'nearest'});
        return;
      }
      if(key==='craft-tab') {craftTab=id;drawPanel();return;}
      if(key==='town-tab'){town.show(id);overlay.querySelector('.panel-body').scrollTop=0;drawPanel();return;}
      actions.action(key,id);
    } else if(event.target===overlay) actions.action('close');
  });
  overlay.addEventListener('input',event=>{
    if(!event.target.matches('[data-item-search]')) return;
    const query=event.target.value.trim().toLowerCase();
    let matches=0;
    for(const result of overlay.querySelectorAll('[data-item-result]')){
      result.hidden=!result.dataset.itemResult.includes(query);
      if(!result.hidden) matches++;
    }
    overlay.querySelector('[data-item-empty]').hidden=matches>0;
  });
  overlay.addEventListener('change',event=>{
    if(frontier.select(event.target.dataset.folioFilter,event.target.value)){
      drawPanel();
      overlay.querySelector('[data-folio-filter]')?.focus({preventScroll:true});
    }
  });
  overlay.addEventListener('keydown',event=>{
    if(event.key!=='Tab') return;
    const focusable=[...overlay.querySelectorAll('button:not(:disabled),summary,select,input:not([hidden])')]
      .filter(element=>element.getClientRects().length);
    if(!focusable.length) return;
    const first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey && document.activeElement===first) {event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement===last) {event.preventDefault();first.focus();}
  });
  el('start').addEventListener('click',actions.start);
  el('cover-audio').addEventListener('click',()=>actions.action('sound'));
  const filePicker=el('save-file-picker');
  filePicker.addEventListener('change',()=>{
    const file=filePicker.files?.[0];
    filePicker.value='';
    if(file) actions.importFile(file);
  });
  function renderSaveMessage(){
    for(const id of ['title-import-status','settings-import-status']){
      const node=el(id);
      if(node){node.textContent=saveMessage;node.dataset.kind=saveMessageKind;}
    }
  }
  setInterval(()=>{
    if(opened==='homestead'&&overlay.querySelector('.property-workspace:not(.property-walk)')&&frontier.farmChanged()) drawPanel();
    if(opened==='activities'&&town.needsUpdate()) drawPanel();
  },600);
  sound(); objective(); activeBuddy();
  return {
    get opened(){return opened;},
    view:el('view'),
    pickSaveFile(){saveMessage='';renderSaveMessage();filePicker.click();},
    setSaveAvailable(){el('start').firstElementChild.textContent='Continue roaming';},
    importStatus(message,kind){saveMessage=message;saveMessageKind=kind;renderSaveMessage();
      if(!hud.hidden) toast(kind?'Import failed':'Save imported',message,kind?'lock':'cloud-check');},
    showPanel,refresh,toast,renderBuild,marketPlace:frontier.marketPlace,
    trackingTrail(tracking,source,distance=0,needsFlight=false){
      trackedMapSource=source??null;
      const panel=el('item-trail-status');
      panel.hidden=!tracking;
      if(!tracking){panel.dataset.readout='';panel.replaceChildren();return;}
      const {kind,title,id}=tracking;
      const where=trackingText(source);
      const hint=!source?.realm?'':source.kind==='craft'?'Crafting bench':needsFlight?'Take flight · '+trackingRegion(source):
        source.realm!==state.realm?trackingRegion(source)+' · '+Math.round(distance)+' m':distance<=2?'Within reach':Math.round(distance)+' m';
      const showBearing=source?.realm&&source.kind!=='craft'&&distance>2;
      if(showBearing){
        const start=worldPoint(state.realm,state.player.x,state.player.z),end=worldPoint(source.realm,source.x,source.z);
        const angle=Math.atan2(end.x-start.x,start.z-end.z)+state.player.yaw;
        panel.style.setProperty('--trail-turn',angle+'rad');
      }
      const readout=[id,kind,where,hint,source?.kind,source?.phase,showBearing].join('|');
      if(panel.dataset.readout===readout) return;
      panel.dataset.readout=readout;
      panel.dataset.phase=source?.phase??'';
      panel.innerHTML=`<span class="trail-icon${showBearing?' trail-bearing':''}">${icon(showBearing?'chevron-up':source?.phase==='turn-in'?'check':'sparkles',19)}</span><div><strong>${title}</strong>
        <small>${where}${hint&&hint!==where?' · '+hint:''}</small>
        ${source?.kind==='craft'?action('Open crafting','open-tracked-recipe:'+source.id,'hammer','','item-track-button'):''}
        ${source?.kind==='build'?action('Build here','prepare-quest-build:'+source.id,'hammer','','item-track-button'):''}</div>
        <button type="button" class="item-track-stop" data-action="clear-${kind}-track" title="Stop ${kind} tracking" aria-label="Stop ${kind} tracking">${icon('x',16)}</button>`;
    },
    clearToasts(){el('toast-stack').replaceChildren();},
    showGame(active) {
      el('welcome').hidden=active; hud.hidden=!active;
      if(!active) el('start').firstElementChild.textContent='Continue roaming';
      if(active) setTimeout(()=>el('intro-hint').classList.add('faded'),20000);
    },
    saveStatus(saved) {
      const status=el('save-status');
      const label=saved==='tab'?'Saved in this tab':saved?'Saved':'Save unavailable';
      status.title=saved==='tab'?'Progress restores when you reload this tab. Export progress before closing it.'
        :saved?'Progress saves automatically':'Export progress from Settings to keep a copy.';
      status.innerHTML=`${icon(saved?'cloud-check':'x',17)}<span>${label}</span>`;
    },
    error(message){
      el('game-alert').hidden=false; el('game-alert').textContent=message;
    },
    update(region, candidate, clock, now,landing,room) {
      const flight=state.transit?.mode==='fly';
      const swimming=state.transit?.mode==='swim';
      const launch=el('flight-button');
      launch.hidden=Boolean(room);
      el('room-camera').hidden=!room;
      el('leave-tower').hidden=room?.kind!=='homestead'||room.id!=='wizardTower';
      launch.setAttribute('aria-label',flight?(landing?'Cancel landing':'Land'):'Take flight');
      launch.title=launch.getAttribute('aria-label')+' (F)';
      const cue=el('flight-status');
      cue.hidden=!flight&&!swimming;
      if(!cue.hidden){
        const y=Math.round((state.transit.y??0)+(geography[state.realm].altitude??0));
        const p=worldPoint(state.realm,state.player.x,state.player.z);
        const named=trackedMapSource?.realm==='sky'?regionAt(trackedMapSource.x,trackedMapSource.z,'sky'):null;
        const stops=realmRegions('sky');
        const stop=named?regions[named]:stops.reduce((nearest,[,entry])=>{
          const distance=place=>Math.hypot(place.x+geography.sky.x-p.x,place.z+geography.sky.z-p.z);
          return distance(entry)<distance(nearest)?entry:nearest;
        },stops[0][1]);
        const target=worldPoint('sky',stop.x,stop.z);
        const bearing=['N','NE','E','SE','S','SW','W','NW'][
          Math.round(Math.atan2(target.x-p.x,p.z-target.z)/(Math.PI/4)+8)%8];
        const distance=Math.round(Math.hypot(p.x-target.x,p.z-target.z));
        const island=state.realm==='sky'&&!named?stop.name:stop.name+' · '+bearing+' · '+distance+' m';
        const text=swimming?'Swimming':
          (landing?'Descending':state.transit.mount?'Riding '+species[state.transit.mount].name:'Flying')+' · '+y+' m';
        if(cue.dataset.status!==text+'|'+island){
          cue.dataset.status=text+'|'+island;
          cue.innerHTML=`<strong>${text}</strong>${flight?`<small>${island}</small><em>Space climb · X descend</em>`:''}`;
        }
      }
      document.querySelectorAll('[data-flight]').forEach(button=>button.hidden=!flight);
      document.querySelector('[data-action="jump"]').hidden=Boolean(flight);
      if(regionKey!==region){
        regionKey=region;objective();
      }
      const label=el('region');
      const place=room?.name??regions[region].name;
      if(label.textContent!==place){
        label.textContent=place;
        el('region-note').textContent=room?.kind==='homestead'?'Inside the homestead':
          room?'Inside '+(room.town??'Spirehaven'):regions[region].note;
      }
      const hotbar=el('adventure-hotbar');
      const stock=state.inventory.hpPotion??0;
      const fighting=el('view').classList.contains('combat-in-progress');
      for(const button of hotbar.querySelectorAll('[data-quick]')){
        button.disabled=Boolean(state.transit)||(button.dataset.quick==='potion'?stock<1||state.health>=5:!fighting);
      }
      hotbar.querySelector('[data-quick-count]').textContent=stock;
      const text=`${String(Math.floor(clock)).padStart(2,'0')}:${String(Math.floor(clock%1*60)).padStart(2,'0')}`;
      if(dateText!==text){
        dateText=text; el('clock').innerHTML=`${icon(clock<6||clock>19?'moon':'sun',17)} ${text}`;
      }
      const target=el('interact');
      const identity=candidate?candidate.label+'|'+candidate.hint:null;
      if(prompt!==identity){
        prompt=identity; target.hidden=!candidate;
        if(candidate) target.innerHTML=`<kbd>E</kbd><span><strong>${candidate.label}</strong><small>${candidate.hint}</small></span>`;
      }
      if(mini && now-lastMap>.75){paintRegion(mini,mapRealm,mapPlace,state,actions.mapHeight);lastMap=now;}
    },
    setReticle(valid,x,y){const target=el('reticle');target.classList.toggle('valid',valid);target.style.left=x+'%';target.style.top=y+'%';}
  };
}

