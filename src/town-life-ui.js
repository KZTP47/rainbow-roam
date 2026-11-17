
import {icon} from './icons.js';
import {items,species,regions} from './content.js';
import {townServicesForPlace} from './town-data.js';
import {activities,errands,routes,deliveries,kitchen,salvage,blessings,caches,cacheDistance,ownsStock,photoLimit} from './town-life.js';

const location=id=>regions[id]?.name??id;
const name=id=>items[id]?.[0]??id;
const servicePanel={hall:'errands',post:'courier',workshop:'salvage',garden:'kitchen',lookout:'shrines',market:'market',inn:'time'};
const serviceIcons={hall:'book',post:'pin',workshop:'hammer',garden:'sprout',lookout:'sparkles',market:'bag',inn:'moon'};
const activityById=Object.fromEntries(activities.map(([id,...info])=>[id,info]));
const length=record=>Object.keys(record).length;

export function createTownPanel(state,{action,itemBadge,trackItem,fieldBadge,activityContext}){
  let current=null,ready=false;
  const run=(label,verb,id,symbol,ok=true)=>
    action(label,'activity-run:'+verb+(id===undefined?'':'.'+id),symbol,
      ok&&(!state.transit||verb==='postcard'||verb==='discard-card')?'':'disabled','small-action');
  const chips=(stock,check=false)=>`<div class="activity-stock">${Object.entries(stock).map(([id,n])=>
    `<span class="${check&&(state.inventory[id]??0)<n?'short':''}">${itemBadge(id)} ${n} ${name(id)} ${trackItem(id)}</span>`).join('')}</div>`;
  const reward=coins=>`<span class="town-reward">${icon('sun',15)}${coins} Suncoins</span>`;
  const drawCard=(title,body,buttons='',art='')=>`<article class="town-card">${art}<div><h3>${title}</h3>${body}</div>${buttons?'<footer>'+buttons+'</footer>':''}</article>`;
  const note=text=>'<p class="town-note">'+text+'</p>';
  const cards=contents=>'<div class="town-results">'+contents+'</div>';
  const unavailable=kind=>note('Visit '+kind+' to use this service. Petalwick offers an early stop.');

  function directory(ctx){
    const services=townServicesForPlace(ctx.place);
    return `<div class="town-heading"><span>${icon('house',28)}</span><div><h3>${location(ctx.place)}</h3>
      <p>${services.length?'Choose a town service or open your traveling tools.':'Use your traveling tools here and find more services in town.'}</p></div></div>
      ${services.length?`<div class="town-services" aria-label="Local services">${services.map(service=>
        {
          const dx=service.x-state.player.x,dz=service.z-state.player.z,distance=Math.hypot(dx,dz);
          const bearing=['N','NE','E','SE','S','SW','W','NW'][Math.round(Math.atan2(dx,-dz)/(Math.PI/4)+8)%8];
          const here=distance<3.5?'Nearby':Math.round(distance)+' m '+bearing;
          const panel=servicePanel[service.kind],command=['market','time'].includes(panel)?panel:'town-tab:'+panel;
          return `<button class="town-service" data-action="${command}" title="${service.name} · ${here}">
            ${icon(serviceIcons[service.kind],16)}<span>${service.name}</span><small>${here}</small></button>`;
        }).join('')}</div>`:''}
      <div class="activity-directory">${activities.map(([id,title,symbol,guide,color])=>
        `<button data-action="town-tab:${id}" class="activity-tile" style="--activity:${color}">
          <span>${icon(symbol,26)}</span><strong>${title}</strong><small>${guide}</small></button>`).join('')}</div>`;
  }
  function board(ctx){
    const reports=Object.entries(errands).filter(([id,e])=>e.place===ctx.place||state.townLife.errands[id]==='posted');
    if(!reports.length) return note('No requests at this stop. Visit a town hall to see its orders.');
    return cards(reports.map(([id,e])=>{
      const status=state.townLife.errands[id],local=ctx.place===e.place;
      return drawCard(e.title,`<p>${location(e.place)} · ${status==='done'?'Delivered':status?'Pinned':'Request available'}</p>
        ${chips({[e.item]:e.amount},true)}${reward(e.coins)}`,status==='done'?'':status?
        run('Deliver supplies','finish-errand',id,'check',local&&ownsStock(state,{[e.item]:e.amount})):
        run('Pin errand','accept-errand',id,'pin',local),itemBadge(e.item));
    }).join(''));
  }
  function surveys(ctx){
    const {survey,circuits}=state.townLife;
    return cards(Object.entries(routes).map(([id,r])=>{
      const progress=survey?.id===id?survey.step:0,done=circuits[id],started=survey?.id===id;
      const stops=`<ol class="passport-stops">${r.stops.map((stop,i)=>
        `<li class="${done||i<progress?'stamped':i===progress&&started?'next-stop':''}">${icon(done||i<progress?'check':'pin',14)} ${location(stop)}</li>`).join('')}</ol>`;
      const buttons=done?note('Filed in your passport.'):started?
        run('File completed route','file-survey',undefined,'check',progress===r.stops.length)+run('Set aside','cancel-survey',undefined,'x'):
        run('Start route','start-survey',id,'compass',!survey&&ctx.place===r.stops[0]);
      return drawCard(r.name,stops+reward(r.coins),buttons);
    }).join(''));
  }
  function study(ctx){
    const local=ctx.nearby?.(),notes=Object.keys(state.townLife.notes);
    return `<div class="activity-callout">${local?fieldBadge(local):icon('paw',27)}<div><strong>${local?species[local].name+' is close enough to observe':'Look for a wild creature nearby'}</strong>
      <p>${notes.length} field records · Every four records earn a Ranger badge.</p></div>
      ${run('Record observation','observe',undefined,'book',Boolean(local))}</div>
      <div class="field-notes-grid">${notes.map(id=>`<article>${fieldBadge(id)} <strong>${species[id].name}</strong><small>${species[id].place}</small></article>`).join('')}</div>`;
  }
  function cookhouse(ctx){
    return (ctx.kitchen?'':unavailable('an inn, market, garden counter, or your cottage'))+cards(Object.entries(kitchen).map(([id,dish])=>
      drawCard(name(id),`${chips(dish.cost,true)}<p>Serve in Companion Care for +${dish.bonus} friendship.</p>`,
        run('Cook '+name(id),'cook',id,'cookie',ctx.kitchen&&ownsStock(state,dish.cost))+trackItem(id),itemBadge(id))).join(''));
  }
  function expeditions(ctx){
    const trip=state.townLife.trip;
    ready=Boolean(trip&&trip.readyAt<=Date.now());
    if(trip) return (ctx.post?'':unavailable('a post office'))+cards(drawCard(species[trip.pet].name,
      `<p>${ready?'Back from '+location(trip.place):'Foraging near '+location(trip.place)}</p><p>${ready?'Collect the supplies at a post office.':'Your friend will return soon with local supplies.'}</p>`,
      run('Collect expedition supplies','collect-trip',undefined,'bag',ctx.post&&ready),fieldBadge(trip.pet)));
    const eligible=state.companions.filter(id=>id!==state.active&&id!==state.bounties.abducted?.pet);
    if(!eligible.length) return note('Befriend a creature, then use Send to rest in the Field Guide to make them available for a trip.');
    return (ctx.post?'':unavailable('a post office'))+note('Bring one meadow biscuit and choose a friend who stayed behind.')+
      cards(eligible.map(id=>drawCard(species[id].name,`<p>${name('treat')} · Forages for about 20 seconds. ${trackItem('treat')}</p>`,
        run('Send '+species[id].name,'send',id,'paw',ctx.post&&ownsStock(state,{treat:1})),fieldBadge(id))).join(''));
  }
  function album(){
    const photos=state.townLife.photos;
    return `<div class="activity-callout">${icon('mountain',26)}<div><strong>${photos.length} of ${photoLimit} postcards</strong><p>Capture your current view. Download a postcard to keep a copy.</p></div>
      ${run('Take postcard','postcard',undefined,'mountain',photos.length<photoLimit)}</div><div class="postcard-grid">
      ${photos.map((card,i)=>`<article><img src="${card.image}" alt="Postcard from ${location(card.place)}">
        <h3>${location(card.place)}</h3><footer>${action('Download','download-postcard:'+i,'arrow-right','','small-action')}
        ${run('Remove','discard-card',i,'x')}</footer></article>`).join('')}</div>`;
  }
  function courier(ctx){
    const picked=state.townLife.courier;
    return cards(Object.entries(deliveries).map(([id,d])=>{
      const done=state.townLife.parcels[id],active=picked===id;
      return drawCard(d.title,`<p>${location(d.from)} ${icon('arrow-right',13)} ${location(d.to)}</p>
        ${reward(d.coins)}${done?note('Signed for.'):active?note('In your satchel.'):''}`,done?'':
        active?run('Hand over parcel','deliver-parcel',undefined,'check',ctx.place===d.to):
        run('Collect parcel','take-parcel',id,'pin',!picked&&ctx.place===d.from));
    }).join(''));
  }
  function shrines(ctx){
    return (ctx.lookout?'':unavailable('a lookout'))+cards(Object.entries(blessings).map(([id,b])=>{
      const charges=state.townLife.blessings[id];
      return drawCard(b.name,`<p>${b.text}.</p>${chips({[b.item]:1},true)}${charges?note(charges+' uses remaining.'):''}`,
        run('Offer for '+b.name,'blessing',id,'sparkles',ctx.lookout&&!charges&&ownsStock(state,{[b.item]:1})),itemBadge(b.item));
    }).join(''));
  }
  function workshop(ctx){
    return (ctx.workshop?'':unavailable('a workshop or your cottage workshop'))+cards(Object.entries(salvage).map(([id,r])=>
      drawCard(name(id),`<p>Break down ${r.amount} · You have ${state.inventory[id]??0}</p>${chips(r.yields)}`,
        run('Salvage '+name(id),'salvage',id,'hammer',ctx.workshop&&ownsStock(state,{[id]:r.amount}))+trackItem(id),itemBadge(id))).join(''));
  }
  function treasure(){
    const active=state.townLife.chart,chart=caches[active];
    const available=Object.keys(caches).length>length(state.townLife.treasures);
    if(!chart) return cards(drawCard('Unfold a trail map scrap',`<p>${available?'Find map scraps in bandit loot. Each scrap leads to a buried cache.':'Every known cache has been dug up.'}</p>
      ${chips({trailMapScrap:1},true)}`,run('Unfold chart','unfold-chart',undefined,'map',available&&ownsStock(state,{trailMapScrap:1})),itemBadge('trailMapScrap')));
    const distance=cacheDistance(state,chart);
    return cards(drawCard(chart.name,`<p>${location(chart.place)} · ${chart.clue}</p>
      ${Number.isFinite(distance)?note(distance<=3.8?'The cache is within reach.':Math.round(distance)+' m from the cache.'):''}
      ${reward(chart.coins)}${chips(chart.items)}`,run('Dig up cache','dig',undefined,'gem',distance<=3.8),itemBadge('trailMapScrap')));
  }
  const pages={errands:board,surveys,study,kitchen:cookhouse,expeditions,album,courier,shrines,salvage:workshop,treasure};

  return {
    show(id){current=Object.hasOwn(pages,id)?id:null;},
    needsUpdate(){return current==='expeditions'&&Boolean(state.townLife.trip&&state.townLife.trip.readyAt<=Date.now())!==ready;},
    render(){
      const context=activityContext();
      if(!current) return directory(context);
      const [title,symbol,guide,color]=activityById[current];
      return `<div class="town-page"><div class="town-heading" style="--activity:${color}"><span>${icon(symbol,28)}</span>
        <div><h3>${title}</h3><p>${guide}</p></div>${action('All activities','town-tab:directory','chevron-left','','small-action')}</div>
        ${state.transit&&current!=='album'?note('Reach dry ground to use this activity.'):''}
        ${pages[current](context)}</div>`;
    }
  };
}

