import {icon} from './icons.js';
import {items,recipes,species} from './content.js';
import {atlas} from './horizons.js';
import {home,nearHomestead,roomReady,crops,cropFood,furnishings,currencies,sellPrice} from './homestead.js';
import {marketAt} from './market.js';
import {BANDITS} from './combat.js';
import {propertyMap} from './property-map.js';
import {propertyWalk} from './property-walk.js';
import {propertyEntryPicker} from './property-entry.js';
import {kitchen} from './town-life.js';

const categoryByItem=Object.fromEntries(Object.keys(items).map(id=>[id,
  Object.hasOwn(crops,id)||cropFood.includes(id)?'garden':
  recipes[id]?.build||Object.hasOwn(furnishings,id)?'building':
  items[id][1]==='cookie'||Object.values(species).some(spec=>spec.favorite===id)?'treats':'supplies']));
const storageTabs=[['all','All'],['supplies','Supplies'],['treats','Treats'],['garden','Garden'],['building','Decor']];
const money=(price,id='coins')=>price+' '+(price===1?currencies[id].singular:currencies[id].name);
const tabRow=(group,choices,active)=>`<div class="tab-row">${choices.map(([id,label])=>
  `<button data-action="${group}:${id}" aria-pressed="${active===id}">${label}</button>`).join('')}</div>`;

export function frontierPanels(state,{action,itemBadge,wantedBadge,propertyPreview,trackItem}){
  const selected={bag:'all',item:null,market:'buy',home:'garden',homeMode:'choose',bounty:'open',filedIn:'all',posting:null};
  let farmSignature='',lastMarket=null,marketPlace=null;
  const propertySelection={house:0,garden:0,sunroom:0,workshop:0,loft:0};
  const purse=()=>`<div class="purse" aria-label="Wallet">${Object.entries(currencies).map(([id,currency])=>
    `<span class="purse-${id}">${icon(currency.icon,16)} <strong>${state.wallet[id]}</strong> ${currency.name}</span>`).join('')}</div>`;

  function bag(){
    const tabs=[...storageTabs,['finder','Find items']];
    if(selected.bag==='finder') return purse()+tabRow('bag-tab',tabs,'finder')+
      `<label class="item-find-label">Find any item <input type="search" data-item-search placeholder="Search items and materials"></label>
      <div class="folio-grid item-find-grid">${Object.keys(items).toSorted((a,b)=>items[a][0].localeCompare(items[b][0])).map(id=>
        `<article data-item-result="${items[id][0].toLowerCase()}">${itemBadge(id)}<strong>${items[id][0]}</strong>${trackItem(id)}</article>`).join('')}</div>
      <p class="folio-empty" data-item-empty hidden>No items match that search.</p>`;
    const stock=Object.keys(items).filter(id=>state.inventory[id]>0&&(selected.bag==='all'||selected.bag===categoryByItem[id]));
    const chosen=stock.includes(selected.item)?selected.item:stock[0];
    const description=chosen?items[chosen][0]:'Select a slot';
    const category=chosen?storageTabs.find(([id])=>id===categoryByItem[chosen])[1]:'';
    const vacancies=Math.max(0,24-stock.length);
    return purse()+tabRow('bag-tab',tabs,selected.bag)+
      `<div class="satchel-grid" aria-label="Item slots">${stock.map(id=>
        `<button class="satchel-slot" data-action="bag-select:${id}" aria-pressed="${chosen===id}"
          title="${items[id][0]}" aria-label="${items[id][0]}, ${state.inventory[id]} in stock">
          ${itemBadge(id)}<span>${state.inventory[id]}</span></button>`).join('')}
        ${Array.from({length:vacancies},()=>'<span class="satchel-slot empty" aria-hidden="true"></span>').join('')}</div>
      <div class="satchel-inspect">${chosen?itemBadge(chosen):''}<div><strong>${description}</strong>
        <small>${chosen?category+' · '+state.inventory[chosen]+' in stock':'Gather or craft something to fill your satchel.'}</small></div>
        ${chosen?trackItem(chosen):''}${state.active&&(cropFood.includes(chosen)||Object.hasOwn(kitchen,chosen))?action('Feed friend','feed-crop:'+chosen,'heart','','small-action'):''}</div>`;
  }


  function market(){
    const store=marketAt(state,marketPlace);
    if(lastMarket!==store.name){lastMarket=store.name;selected.market='buy';}
    const buy=selected.market==='buy';
    const stock=buy?store.goods:Object.keys(items).filter(id=>state.inventory[id]>0).map(id=>[id,sellPrice(id)+(state.townLife.blessings.trade>0?2:0),'coins']);
    const featured=store.goods.find(([id])=>Object.hasOwn(items,id))?.[0];
    return `<div class="folio-feature market-cover">${featured?itemBadge(featured):''}
      <div><h3>${store.name}</h3><p>${store.goods.length} local goods · Suncoins and Ranger badges in your wallet.</p></div>${purse()}</div>`+
      tabRow('market-tab',[['buy','Buy'],['sell','Sell']],selected.market)+
      `${state.transit?'<p class="folio-empty">Land before trading.</p>':''}
      <div class="folio-grid market-grid">${stock.filter(([id])=>Object.hasOwn(items,id)).map(([id,price,currency='coins'])=>{
        const [name]=items[id];
        const available=!state.transit&&(!buy||state.wallet[currency]>=price);
        return `<article class="market-goods">${itemBadge(id)}<strong>${name}</strong>
          <small>${money(price,currency)} · ${state.inventory[id]??0} owned</small>
          <div class="item-market-actions">${trackItem(id)}${action(buy?'Buy':'Sell',(buy?'buy-stock:':'sell-stock:')+id,'',
            (available?'':'disabled ')+'aria-label="'+(buy?'Buy ':'Sell ')+name+'"','small-action')}</div></article>`;
      }).join('')||'<p class="folio-empty">Your satchel is empty.</p>'}</div>`;
  }

  function farmState(){
    const beds=state.homestead.plots.map(p=>p&&(p.readyAt<=Date.now()?2:1)).join(',');
    return beds+'|'+Object.keys(state.homestead.extensions??{}).map(id=>Number(roomReady(state,id))).join(',');
  }
  function homestead(){
    farmSignature=farmState();
    const h=state.homestead;
    if(!nearHomestead(state)) return purse()+`<div class="property-letter"><strong>Clover Cottage</strong>
      <p>On the south path from Petalwick, before Sunseed Fields. Visit the cottage to buy it, tend its garden, or arrange furniture.</p>
      ${action('Visit Clover Cottage','visit-home','pin','','small-action')}</div>`;
    if(!h.owned) return purse()+`<div class="property-letter"><strong>A cottage of your own</strong>
      <p>Six garden beds, a hearth, and four spaces for the furniture you choose. Includes two clover seed packets.</p>
      ${action('Buy Clover Cottage · '+money(home.price),'homestead-buy','house',state.wallet.coins<home.price?'disabled':'','primary')}</div>`;
    if(selected.homeMode==='choose') return propertyEntryPicker(state,selected.home,propertyPreview(selected.home));
    if(selected.homeMode==='walk') return propertyWalk(state,{action,itemBadge});
    return propertyMap(state,{action,itemBadge,trackItem},selected.home,propertySelection[selected.home]);
  }


  const fightingStyles={sabre:['Sword','hammer'],guard:['Shield','lock'],rush:['Rush','sparkles'],bow:['Bow','compass']};
  function bountyPrize(target){
    return `<span class="bounty-prize">${icon('sun',15)}${target.coins}<span class="sr-money"> Suncoins</span>
      ${icon('sparkles',15)}${target.badges}<span class="sr-money"> Ranger badges</span></span>`;
  }
  function bounties(){
    const data=state.bounties,missing=data.abducted;
    const active=BANDITS.find(b=>b.id===data.target);
    const matching=BANDITS.filter(b=>selected.bounty==='captured'?data.captured[b.id]:!data.captured[b.id]);
    const list=matching.filter(b=>selected.filedIn==='all'||b.realm===selected.filedIn);
    const posting=list.find(b=>b.id===selected.posting);
    const caseFile=posting??active??BANDITS.find(b=>b.id===missing?.bandit);
    const caseStatus=caseFile&&(data.captured[caseFile.id]?'Captured':caseFile===active?'Tracking':'Wanted bandit');
    return `<div class="folio-feature bounty-cover">
      <span class="chapter-illustration">${icon('compass',36)}</span>
      <div><strong>Find a bandit</strong><p>Read a poster for their last known location. Bring them in to collect Suncoins and Ranger badges.</p></div>${purse()}</div>
      ${missing?`<div class="wanted-note"><strong>${species[missing.pet].name} is missing</strong><p>Capture ${BANDITS.find(b=>b.id===missing.bandit)?.name??'the bandit'} to rescue your friend.</p></div>`:''}
      ${caseFile?`<section class="bounty-dossier" aria-label="Bounty details">
        ${wantedBadge(caseFile.id)}<div><small>${caseStatus} · ${atlas[caseFile.realm]?.name??'Blossom Valley'}</small>
          <h3>${caseFile.name}</h3><p>${caseFile.clue}</p>${bountyPrize(caseFile)}</div>
        ${caseFile===active?action('Stop tracking','clear-bounty','x','','small-action'):
          caseStatus==='Captured'?'':action('Track','track-bounty:'+caseFile.id,'pin','aria-label="Track '+caseFile.name+' from case file"','small-action')}
      </section>`:''}
      <div class="bounty-controls">${tabRow('bounty-tab',[['open','Wanted'],['captured','Captured']],selected.bounty)}
        <div class="bounty-region"><label for="bounty-region">Region</label><select id="bounty-region" data-folio-filter="bounty-realm"><option value="all">All regions</option>
        ${Object.entries(atlas).filter(([id])=>matching.some(b=>b.realm===id)).map(([id,realm])=>
          `<option value="${id}" ${id===selected.filedIn?'selected':''}>${realm.name}</option>`).join('')}</select></div></div>
      <div class="folio-grid bounty-grid">${list.map(b=>{
        const [style,styleIcon]=fightingStyles[b.style];
        return `<article class="wanted-card wanted-poster" style="--coat:${b.coat}">
          <button data-action="bounty-file:${b.id}" aria-label="Read poster for ${b.name}" aria-pressed="${posting===b}" class="poster-picture">
          ${wantedBadge(b.id)}<span class="poster-style">${icon(styleIcon,14)}${style}</span></button>
          <div class="poster-copy"><strong>${b.name}</strong><small>${atlas[b.realm]?.name??'Blossom Valley'}</small>${bountyPrize(b)}</div>
          ${selected.bounty==='open'?action(active===b?'Tracking':'Track','track-bounty:'+b.id,'pin','aria-label="Track '+b.name+'"','small-action'):''}
        </article>`;
      }).join('')||'<p class="folio-empty">No postings in this region.</p>'}</div>`;
  }

  return {
    views:{bag,market,homestead,bounties},
    openMarket(place){marketPlace=place;},
    marketPlace:()=>marketPlace,
    openProperty(view){
      selected.home=Object.hasOwn(propertySelection,view)?view:'house';
      selected.homeMode='choose';
    },
    farmChanged:()=>farmState()!==farmSignature,
    propertyView:()=>selected.home,
    editProperty(view,slot){
      if(!Object.hasOwn(propertySelection,view)) return;
      selected.homeMode='edit';selected.home=view;
      if(Number.isInteger(slot)) propertySelection[view]=slot;
    },
    select(key,id){
      if(key==='bounty-file'){selected.posting=selected.posting===id?null:id;return true;}
      if(key==='bounty-realm'){selected.filedIn=id;selected.posting=null;return true;}
      if(key==='property-mode'){
        if(['choose','walk','edit'].includes(id)) selected.homeMode=id;
        return true;
      }
      if(key==='property-tile'){
        propertySelection[selected.home]=Number(id);return true;
      }
      const field={'bag-tab':'bag','bag-select':'item','market-tab':'market','home-tab':'home','bounty-tab':'bounty'}[key];
      if(!field) return false;
      selected[field]=id;
      if(field==='bag') selected.item=null;
      if(field==='bounty'){selected.filedIn='all';selected.posting=null;}
      return true;
    }
  };
}

