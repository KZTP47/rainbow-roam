export const activityItems={
  trailMapScrap:['Trail map scrap','map'],
  picnicBun:['Clover picnic bun','cookie'],
  berryCompote:['Sunberry compote','cookie'],
  honeyStew:['Honey carrot stew','cookie']
};

export const activities=[
  ['errands','Notice board','book','Fill a shopkeeper’s order.','#e8bb8e'],
  ['surveys','Trail passport','compass','Follow a route and stamp each stop.','#a9c69c'],
  ['study','Field notes','paw','Record nearby wildlife in its habitat.','#d7add3'],
  ['kitchen','Trail kitchen','cookie','Cook a picnic for your companion.','#ebad93'],
  ['expeditions','Companion expeditions','trees','Send a friend out to forage.','#b7c793'],
  ['album','Postcard album','mountain','Keep photos of places you visit.','#a8c7d7'],
  ['courier','Post office','pin','Carry a parcel between settlements.','#deb49a'],
  ['shrines','Trail shrines','sparkles','Make an offering for a temporary boon.','#bca7d8'],
  ['salvage','Salvage bench','hammer','Break down old goods for supplies.','#dfba9b'],
  ['treasure','Treasure charts','map','Follow a scrap to a buried cache.','#e8c77c']
];

export const errands={
  bouquets:{place:'village',title:'Flowers for the windows',item:'petal',amount:3,coins:15,reward:{berry:2}},
  winterwood:{place:'heatherpost',title:'Dry shelves for the post',item:'wood',amount:4,coins:20,reward:{'heath-bake':1}},
  quayPosts:{place:'bellwharf',title:'Repair the wharf cleats',item:'plank',amount:4,coins:26,reward:{lantern:1}},
  bakeOvens:{place:'fennelsquare',title:'Wood for the morning bake',item:'wood',amount:4,coins:20,reward:{berryCompote:1}},
  lampFacets:{place:'gloamcross',title:'Light the last lane',item:'crystal',amount:2,coins:24,reward:{lantern:1}},
  indigoWash:{place:'linnetloom',title:'Petals for the dye bath',item:'petal',amount:4,coins:22,reward:{patchRug:1}},
  stoneSteps:{place:'larkmarket',title:'Stones for the spring steps',item:'stone',amount:5,coins:23,reward:{treat:2}},
  winterGauge:{place:'tamarackgreen',title:'Repair the lake gauge',item:'plank',amount:3,coins:23,reward:{moonLamp:1}},
  millFrame:{place:'windmerequay',title:'A spare frame for the sail',item:'wood',amount:6,coins:27,reward:{honeyStew:1}},
  coveredKiln:{place:'safflowergate',title:'Tile the dye yard',item:'brick',amount:4,coins:29,reward:{herbShelf:1}},
  shellSound:{place:'seabloomstrand',title:'A lantern for the shell buyers',item:'lantern',amount:2,coins:29,reward:{crystal:1}},
  lockhouse:{place:'amberfenlock',title:'Build the lock watch a bench',item:'stool',amount:1,coins:25,reward:{cloverSeed:2}}
};

export const routes={
  valley:{name:'Valley hedgerows',stops:['village','grove','fields'],coins:22,reward:{treat:2}},
  frontier:{name:'Moor and orchard circuit',stops:['heatherpost','shepherdsteps','bramblefair','harveststage'],coins:40,reward:{crystal:3}}
};

export const deliveries={
  thimble:{title:'The seed catalogue',from:'village',to:'fields',coins:16},
  pressed:{title:'A letter for Luma',from:'grove',to:'lake',coins:20},
  ferry:{title:'The ferrymaster’s receipt',from:'bellwharf',to:'windmerequay',coins:46},
  needles:{title:'The needle case',from:'linnetloom',to:'gloamcross',coins:31},
  licorice:{title:'The midwinter cake order',from:'tamarackgreen',to:'larkmarket',coins:34},
  gloves:{title:'The lock keeper’s gloves',from:'amberfenlock',to:'seabloomstrand',coins:34}
};

export const kitchen={
  berryCompote:{cost:{berry:3,petal:1},bonus:2},
  picnicBun:{cost:{sweetClover:2,berry:1},bonus:2},
  honeyStew:{cost:{honeyCarrot:2,cloudberry:1},bonus:3}
};

export const salvage={
  plank:{amount:2,yields:{wood:1}},
  brick:{amount:2,yields:{stone:1}},
  lantern:{amount:2,yields:{crystal:1}},
  patchRug:{amount:1,yields:{petal:2,wood:1}},
  moonLamp:{amount:1,yields:{wood:1,crystal:1}},
  cloudBed:{amount:1,yields:{wood:3,petal:1}}
};

export const blessings={
  forage:{name:'Forager’s light',item:'crystal',charges:4,text:'+1 material on your next four gathers'},
  trade:{name:'Market luck',item:'petal',charges:3,text:'+2 Suncoins on your next three sales'}
};

export const caches={
  stone:{name:'Under a split stone',realm:'valley',place:'village',x:7,z:11,coins:21,items:{crystal:2,moonLamp:1},
    clue:'Walk southeast from the Petalwick trail fork. Search the meadow east of the cottage path.'},
  moor:{name:'The moorland strongbox',realm:'heath',place:'heatherpost',x:-15,z:29,coins:28,items:{'heatherpost-merch':2,herbShelf:1},
    clue:'Look east of the road into Heatherpost, near the end of the pasture.'},
  salt:{name:'Below the tide mark',realm:'coast',place:'brine',x:-14,z:27,coins:30,items:{salt:4,treat:2},
    clue:'Search east of the Saltwind landing, before the path drops toward the sea.'}
};

export const photoLimit=8;
export const isPostcard=photo=>typeof photo==='string'&&photo.length>=256&&photo.length<=120000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(photo);
const has=(obj,id)=>typeof id==='string'&&Object.hasOwn(obj,id);
const number=(value,max)=>Number.isInteger(value)?Math.max(0,Math.min(max,value)):0;
const validTime=value=>Number.isFinite(value)&&value>0&&value<Date.now()+3600000;
const currentOnly=(raw,record)=>Object.fromEntries(Object.keys(record).filter(id=>raw?.[id]===true).map(id=>[id,true]));

export function newTownLife(){
  return {errands:{},survey:null,circuits:{},notes:{},trip:null,photos:[],courier:null,parcels:{},
    blessings:{forage:0,trade:0},chart:null,treasures:{}};
}

export function normalizeTownLife(raw,regions,species,companions){
  const fresh=newTownLife();
  const route=has(routes,raw?.survey?.id)?routes[raw.survey.id]:null;
  const completed=route?raw.survey.step:0;
  const trip=raw?.trip;
  return {
    ...fresh,
    errands:Object.fromEntries(Object.keys(errands).filter(id=>['posted','done'].includes(raw?.errands?.[id])).map(id=>[id,raw.errands[id]])),
    survey:route?{id:raw.survey.id,step:number(completed,route.stops.length)}:null,
    circuits:currentOnly(raw?.circuits,routes),
    notes:currentOnly(raw?.notes,species),
    trip:trip&&companions.includes(trip.pet)&&has(regions,trip.place)&&validTime(trip.readyAt)
      ?{pet:trip.pet,place:trip.place,readyAt:trip.readyAt}:null,
    photos:Array.isArray(raw?.photos)?raw.photos.filter(p=>p&&has(regions,p.place)&&isPostcard(p.image)&&validTime(p.date))
      .slice(0,photoLimit).map(({place,image,date})=>({place,image,date})):[],
    courier:has(deliveries,raw?.courier)?raw.courier:null,
    parcels:currentOnly(raw?.parcels,deliveries),
    blessings:Object.fromEntries(Object.keys(blessings).map(id=>[id,number(raw?.blessings?.[id],blessings[id].charges)])),
    chart:has(caches,raw?.chart)&&raw?.treasures?.[raw.chart]!==true?raw.chart:null,
    treasures:currentOnly(raw?.treasures,caches)
  };
}

export function markTownVisit(state,place){
  const survey=state.townLife.survey;
  if(survey&&routes[survey.id].stops[survey.step]===place){
    survey.step++;
    return survey.step===routes[survey.id].stops.length?'Route ready to file':'Passport stamped';
  }
  return null;
}

export function takeBlessing(state,id){
  if(!state.townLife.blessings[id]) return 0;
  state.townLife.blessings[id]--;
  return id==='trade'?2:1;
}

export const ownsStock=(state,cost)=>Object.entries(cost).every(([id,count])=>(state.inventory[id]??0)>=count);
const add=(state,goods,sign=1)=>Object.entries(goods).forEach(([id,n])=>{state.inventory[id]=(state.inventory[id]??0)+n*sign;});
export const cacheDistance=(state,chart)=>chart&&state.realm===chart.realm?Math.hypot(state.player.x-chart.x,state.player.z-chart.z):Infinity;

export function townLifeAction(state,verb,id,ctx){
  const data=state.townLife, now=ctx.now??Date.now(), place=ctx.place;
  if(state.transit&&verb!=='postcard'&&verb!=='discard-card') return null;
  const report=(title,detail='',icon='sparkles')=>({title,detail,icon});
  switch(verb){
    case 'accept-errand':{
      const entry=errands[id];
      if(!has(errands,id)||place!==entry.place||data.errands[id]) return null;
      data.errands[id]='posted';
      return report('Errand pinned',entry.title,'book');
    }
    case 'finish-errand':{
      const entry=errands[id];
      if(!has(errands,id)||entry.place!==place||data.errands[id]!=='posted'||!ownsStock(state,{[entry.item]:entry.amount})) return null;
      data.errands[id]='done';
      add(state,{[entry.item]:entry.amount},-1);add(state,entry.reward);
      state.wallet.coins+=entry.coins;
      return report('Order delivered','+'+entry.coins+' Suncoins','check');
    }
    case 'start-survey':{
      const route=routes[id];
      if(!has(routes,id)||data.survey||data.circuits[id]||place!==route.stops[0]||!route.stops.every(stop=>has(ctx.regions,stop))) return null;
      data.survey={id,step:1};
      return report('First stamp set','Head to '+ctx.regions[route.stops[1]].name+'.','compass');
    }
    case 'cancel-survey':
      if(!data.survey) return null;
      data.survey=null;
      return report('Route set aside','','compass');
    case 'file-survey':{
      const survey=data.survey,route=routes[survey?.id];
      if(!route||survey.step!==route.stops.length||data.circuits[survey.id]) return null;
      data.circuits[survey.id]=true;data.survey=null;
      add(state,route.reward);state.wallet.coins+=route.coins;
      return report('Passport route completed','+'+route.coins+' Suncoins','compass');
    }
    case 'observe':{
      const pet=ctx.nearby?.();
      if(!has(ctx.species,pet)||data.notes[pet]) return null;
      data.notes[pet]=true;state.wallet.coins+=3;
      const complete=Object.keys(data.notes).length%4===0;
      if(complete) state.wallet.badges++;
      return report(ctx.species[pet].name+' recorded',complete?'+3 Suncoins and a Ranger badge':'+3 Suncoins','paw');
    }
    case 'cook':{
      const dish=kitchen[id];
      if(!has(kitchen,id)||!ctx.kitchen||!ownsStock(state,dish.cost)) return null;
      add(state,dish.cost,-1);add(state,{[id]:1});
      return report(activityItems[id][0]+' cooked','Serve it from the Companion Care panel.','cookie');
    }
    case 'send':{
      if(!ctx.post||data.trip||!state.companions.includes(id)||state.active===id||
        state.bounties.abducted?.pet===id||!ownsStock(state,{treat:1})) return null;
      add(state,{treat:1},-1);data.trip={pet:id,place,readyAt:now+20000};
      return report(ctx.species[id].name+' set out','Return to the expedition counter when your friend is back.','paw');
    }
    case 'collect-trip':{
      const trip=data.trip;
      if(!trip||trip.readyAt>now||!ctx.post) return null;
      const supply=ctx.atlas[ctx.regions[trip.place].realm??'valley']?.material??'wood';
      const count=(state.care[trip.pet]?.affinity??0)>=3?5:3;
      data.trip=null;add(state,{[supply]:count});state.wallet.coins+=4;
      return report(ctx.species[trip.pet].name+' returned',count+' '+ctx.items[supply][0].toLowerCase()+' and 4 Suncoins.','paw');
    }
    case 'postcard':{
      if(data.photos.length>=photoLimit) return null;
      const image=ctx.photo?.();
      if(!isPostcard(image)) return null;
      data.photos.unshift({place,image,date:now});
      return report('Postcard saved',ctx.regions[place].name,'mountain');
    }
    case 'discard-card':{
      const index=Number(id);
      if(!Number.isInteger(index)||index<0||index>=data.photos.length) return null;
      data.photos.splice(index,1);
      return report('Postcard removed','','mountain');
    }
    case 'take-parcel':{
      const delivery=deliveries[id];
      if(!has(deliveries,id)||data.courier||data.parcels[id]||place!==delivery.from||!has(ctx.regions,delivery.to)) return null;
      data.courier=id;
      return report('Parcel packed',ctx.regions[delivery.to].name,'pin');
    }
    case 'deliver-parcel':{
      const entry=deliveries[data.courier];
      if(!entry||place!==entry.to||data.parcels[data.courier]) return null;
      data.parcels[data.courier]=true;data.courier=null;state.wallet.coins+=entry.coins;
      return report('Parcel signed for','+'+entry.coins+' Suncoins','check');
    }
    case 'blessing':{
      const blessing=blessings[id];
      if(!has(blessings,id)||!ctx.lookout||data.blessings[id]||!ownsStock(state,{[blessing.item]:1})) return null;
      add(state,{[blessing.item]:1},-1);data.blessings[id]=blessing.charges;
      return report(blessing.name,blessing.text,'sparkles');
    }
    case 'salvage':{
      const recipe=salvage[id];
      if(!has(salvage,id)||!ctx.workshop||!ownsStock(state,{[id]:recipe.amount})) return null;
      add(state,{[id]:recipe.amount},-1);add(state,recipe.yields);
      return report('Materials recovered',Object.entries(recipe.yields).map(([item,n])=>n+' '+ctx.items[item][0].toLowerCase()).join(', '),'hammer');
    }
    case 'unfold-chart':{
      if(data.chart||!ownsStock(state,{trailMapScrap:1})) return null;
      const next=Object.keys(caches).find(key=>!data.treasures[key]);
      if(!next) return null;
      add(state,{trailMapScrap:1},-1);data.chart=next;
      return report('A cache marked on the chart',caches[next].name,'map');
    }
    case 'dig':{
      const chart=caches[data.chart];
      if(!chart||cacheDistance(state,chart)>3.8) return null;
      data.treasures[data.chart]=true;data.chart=null;
      state.wallet.coins+=chart.coins;add(state,chart.items);
      return report('Cache unearthed','+'+chart.coins+' Suncoins and supplies','gem');
    }
    default:return null;
  }
}
