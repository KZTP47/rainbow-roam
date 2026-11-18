export const currencies={
  coins:{name:'Suncoins',singular:'Suncoin',icon:'sun'},
  badges:{name:'Ranger badges',singular:'Ranger badge',icon:'sparkles'}
};
export const home={name:'Clover Cottage',price:24,x:12,z:23,arrival:[12,29]};
export const crops={
  cloverSeed:{name:'Sweet clover seeds',crop:'sweetClover',time:12000,price:3,color:'#91b382'},
  carrotSeed:{name:'Honey carrot seeds',crop:'honeyCarrot',time:20000,price:5,color:'#ed9e6b'},
  strawberrySeed:{name:'Cloudberry seeds',crop:'cloudberry',time:26000,price:6,color:'#e3879d'}
};
export const furnishings={
  patchRug:{name:'Patchwork rug',icon:'heart',color:'#d88ba1',price:10},
  moonLamp:{name:'Moonflower lamp',icon:'lamp',color:'#b6a4cf',price:13},
  herbShelf:{name:'Herb shelf',icon:'sprout',color:'#90ac83',price:11},
  cloudBed:{name:'Cloud quilt bed',icon:'armchair',color:'#9dbacd',price:18}
};
export const rooms=['By the window','Beside the hearth','Under the eaves','Reading corner'];
export const extensions={
  sunroom:{name:'Sunroom',icon:'sprout',color:'#a2c68c',offset:4,spots:['Potting bench side','Under the glass'],cost:{coins:12,wood:5,petal:3},
    summary:'A glass-roofed room for seedlings.',service:'Take clover cuttings'},
  workshop:{name:'Workshop',icon:'hammer',color:'#d6a583',offset:6,spots:['By the workbench','Tool-wall corner'],cost:{coins:14,wood:6,stone:4},
    summary:'A workbench that saves materials when you make rugs.',service:'Sew a patchwork rug'},
  loft:{name:'Reading loft',icon:'book',color:'#b0a6c9',offset:8,spots:['Loft window','Bookshelf nook'],cost:{coins:16,wood:7,petal:4},
    summary:'A reading retreat where you can rest while the garden grows.',service:'Rest in the loft'},
  kitchen:{name:'Hearth kitchen',icon:'cookie',color:'#d5a070',offset:10,spots:['Pantry alcove','Beside the oven'],cost:{coins:13,wood:5,stone:5},
    summary:'Cook honey carrot stew with one honey carrot and one sunberry.',service:'Cook honey carrot stew'},
  companionNook:{name:'Companion nook',icon:'paw',color:'#8bac98',offset:12,spots:['By the cushions','Along the low window'],cost:{coins:12,wood:5,petal:4},
    summary:'Spend time with your active companion to build affinity.',service:'Sit with your companion'},
  wizardTower:{name:'Wizard Tower',icon:'sparkles',color:'#a999d4',offset:14,spots:['Starglass window','Chart table'],cost:{coins:18,stone:7,crystal:2},
    summary:'Link your homestead to wizard towers built in dungeons.',service:'Travel by wizard tower'}
};
export const homesteadLayout={
  sunroom:{x:-4.34,z:-.18,halfWidth:1.46,halfDepth:1.55,door:{side:'east',offset:0},join:'west'},
  workshop:{x:1.42,z:-3.60,halfWidth:1.32,halfDepth:1.51,door:{side:'south',offset:0},join:'north'},
  loft:{x:-1.57,z:-3.83,halfWidth:1.26,halfDepth:1.74,door:{side:'south',offset:0},join:'north'},
  kitchen:{x:4.19,z:.12,halfWidth:1.31,halfDepth:1.64,door:{side:'west',offset:0},join:'east'},
  companionNook:{x:-4.63,z:3.57,halfWidth:1.45,halfDepth:1.31,door:{side:'south',offset:0}},
  wizardTower:{x:-4.63,z:7.78,halfWidth:1.48,halfDepth:1.45,door:{side:'south',offset:0}}
};
export const homesteadDoorHalfWidth=.66;
export function homesteadServicePoint(id){
  const room=Object.hasOwn(homesteadLayout,id)?homesteadLayout[id]:null;
  return room?[home.x+room.x,home.z+room.z]:undefined;
}
export const wizardTowerPoint=homesteadServicePoint('wizardTower');

export function propertyDoors(homestead){
  if(!homestead?.owned) return [];
  return [['house',home.x,home.z+2.18],...Object.entries(homesteadLayout).flatMap(([id,room])=>{
    if(!homestead.extensions?.[id]) return [];
    const {side}=room.door;
    const shiftX=side==='east'?room.halfWidth:side==='west'?-room.halfWidth:0;
    const shiftZ=side==='south'?room.halfDepth:side==='north'?-room.halfDepth:0;
    return [[id,home.x+room.x+shiftX,home.z+room.z+shiftZ]];
  })];
}
export const plots=Array.from({length:6},(_,i)=>[18+i%2*2.1,21+Math.floor(i/2)*1.8]);
export const farmItems={
  ...Object.fromEntries(Object.entries(crops).map(([id,crop])=>[id,[crop.name,'sprout']])),
  sweetClover:['Sweet clover','flower-2'],honeyCarrot:['Honey carrot','sprout'],cloudberry:['Cloudberry','cherry'],
  ...Object.fromEntries(Object.entries(furnishings).map(([id,f])=>[id,[f.name,f.icon]]))
};
export const farmRecipes={
  patchRug:{cost:{petal:3,wood:1},count:1},
  moonLamp:{cost:{crystal:1,wood:2},count:1},
  herbShelf:{cost:{wood:3,petal:1},count:1},
  cloudBed:{cost:{wood:5,petal:3},count:1}
};

export const cropFood=Object.values(crops).map(c=>c.crop);
export const supplies=[
  ['cloverSeed',3],['carrotSeed',5],['strawberrySeed',6],['treat',5],['wood',2],
  ['patchRug',10],['moonLamp',13],['herbShelf',11],['cloudBed',18],['charm',2,'badges']
];
export const starterMarket={name:'Petalwick Supply Cart',goods:supplies};
export const sellPrice=id=>cropFood.includes(id)?5:Object.hasOwn(furnishings,id)?3:1;

export function newHomestead(){
  return {owned:false,plots:Array(plots.length).fill(null),decor:Array(rooms.length).fill(null),extensions:{}};
}

export function normalizeHomestead(raw){
  if(raw?.owned!==true) return newHomestead();
  return {
    owned:true,
    plots:plots.map((_,i)=>{
      const row=raw.plots?.[i];
      return Object.hasOwn(crops,row?.seed)&&Number.isFinite(row.readyAt)&&row.readyAt>0
        ? {seed:row.seed,readyAt:row.readyAt,watered:row.watered===true}:null;
    }),
    decor:rooms.map((_,i)=>Object.hasOwn(furnishings,raw.decor?.[i])?raw.decor[i]:null),
    extensions:Object.fromEntries(Object.entries(extensions).flatMap(([id,room])=>{
      const built=raw.extensions?.[id];
      if(!built||!Object.hasOwn(raw.extensions,id)||typeof built!=='object') return [];
      const next=Number.isFinite(built.next)?Math.max(0,Math.min(built.next,Date.now()+120000)):0;
      return [[id,{next,decor:room.spots.map((_,i)=>Object.hasOwn(furnishings,built.decor?.[i])?built.decor[i]:null)}]];
    }))
  };
}

export function roomDecor(homestead,view){
  if(view==='house') return homestead.decor;
  return Object.hasOwn(extensions,view)?homestead.extensions?.[view]?.decor:undefined;
}

export function roomReady(state,id,now=Date.now()){
  const built=state.homestead.extensions?.[id];
  if(!built) return false;
  if(id==='workshop') return state.inventory.wood>=1&&state.inventory.petal>=1;
  if(id==='kitchen') return state.inventory.honeyCarrot>=1&&state.inventory.berry>=1;
  if(id==='companionNook') return Boolean(state.active&&state.companions?.includes(state.active))&&now>=built.next;
  return now>=built.next;
}

export function canExpand(state,id){
  if(!Object.hasOwn(extensions,id)||!state.homestead.owned||state.homestead.extensions?.[id]) return false;
  return Object.entries(extensions[id].cost).every(([item,n])=>(item==='coins'?state.wallet.coins:state.inventory[item]??0)>=n);
}

function slotLocation(homestead,index){
  if(index<rooms.length) return {name:rooms[index],decor:homestead.decor,local:index};
  for(const [id,room] of Object.entries(extensions)){
    const local=index-room.offset;
    if(local>=0&&local<room.spots.length&&homestead.extensions?.[id]){
      return {name:room.name+' · '+room.spots[local],decor:homestead.extensions[id].decor,local};
    }
  }
  return null;
}

export const nearHomestead=state=>state.realm==='valley'&&!state.transit&&
  Math.hypot(state.player.x-home.x,state.player.z-home.z)<14;

export function propertyArea(player,realm,homestead){
  if(realm!=='valley') return null;
  if(Math.abs(player.x-home.x)<2.65&&Math.abs(player.z-home.z)<1.8) return 'house';
  for(const [id,room] of Object.entries(homesteadLayout)){
    if(homestead?.owned&&homestead.extensions?.[id]&&
      Math.abs(player.x-home.x-room.x)<room.halfWidth-.10&&Math.abs(player.z-home.z-room.z)<room.halfDepth-.10) return id;
  }
  if(player.x>17.05&&player.x<21.35&&player.z>19.65&&player.z<25.83) return 'garden';
  return null;
}

export function propertyArrival(view,homestead){
  if(view==='house') return [home.x,home.z+1.5];
  if(view==='garden') return [19,25.25];
  if(homestead?.extensions?.[view]&&Object.hasOwn(homesteadLayout,view)) return homesteadServicePoint(view);
}

export function workHomestead(state,action,slot,item,now=Date.now()){
  if(!nearHomestead(state)) return null;
  const homestead=state.homestead, inventory=state.inventory;
  if(action==='buy'){
    if(homestead.owned||state.wallet.coins<home.price) return null;
    state.wallet.coins-=home.price;
    homestead.owned=true;
    inventory.cloverSeed=(inventory.cloverSeed??0)+2;
    return {title:'The keys are yours',detail:'Two sweet clover seed packets went into your satchel.'};
  }
  if(!homestead.owned) return null;
  if(action==='expand'){
    if(!canExpand(state,item)) return null;
    const room=extensions[item];
    const built=homestead.extensions??={};
    for(const [resource,amount] of Object.entries(room.cost)){
      if(resource==='coins') state.wallet.coins-=amount;
      else inventory[resource]-=amount;
    }
    built[item]={next:0,decor:room.spots.map(()=>null)};
    return {title:room.name+' built',detail:homesteadLayout[item].join
      ?'Follow the new doorway from the cottage.'
      :'Find the new entrance in the cottage yard.'};
  }
  if(action==='service'){
    if(!roomReady(state,item,now)) return null;
    const built=homestead.extensions[item];
    if(item==='sunroom'){
      inventory.cloverSeed=(inventory.cloverSeed??0)+2;
      built.next=now+90000;
      return {title:'Clover cuttings',detail:'Two seed packets added to your satchel.'};
    }
    if(item==='workshop'){
      inventory.wood--;inventory.petal--;
      inventory.patchRug=(inventory.patchRug??0)+1;
      state.crafted??={};
      state.crafted.patchRug=(state.crafted.patchRug??0)+1;
      return {title:'Patchwork rug sewn',detail:'One rug added to your satchel.'};
    }
    if(item==='loft'){
      state.time=(state.time+6)%24;
      homestead.plots.forEach(plot=>{if(plot&&plot.readyAt>now) plot.readyAt=now+(plot.readyAt-now)*.25;});
      built.next=now+45000;
      return {title:'Rested in the loft',detail:'Six in-game hours passed. Planted beds are closer to harvest.'};
    }
    if(item==='kitchen'){
      inventory.honeyCarrot--;inventory.berry--;
      inventory.honeyStew=(inventory.honeyStew??0)+1;
      return {title:'Honey carrot stew cooked',detail:'One bowl added to your satchel.'};
    }
    if(item==='companionNook'){
      state.care??={};
      const care=state.care[state.active]??={};
      care.affinity=Math.min(12,(care.affinity??0)+1);
      built.next=now+45000;
      return {title:'Time with your companion',detail:'Your companion gained one point of affinity.'};
    }
  }
  if(!Number.isInteger(slot)||slot<0) return null;
  if(action==='decorate'||action==='remove'){
    const location=slotLocation(homestead,slot);
    if(!location) return null;
    const {local,decor,name}=location,prior=decor[local];
    if(action==='remove'){
      if(!prior) return null;
      inventory[prior]=(inventory[prior]??0)+1;
      decor[local]=null;
      return {title:'Furniture put away',detail:furnishings[prior].name+' returned to your satchel.'};
    }
    if(!Object.hasOwn(furnishings,item)||!(inventory[item]>0)||prior===item) return null;
    if(prior) inventory[prior]=(inventory[prior]??0)+1;
    decor[local]=item;
    inventory[item]--;
    return {title:furnishings[item].name+' placed',detail:name};
  }
  if(slot>=plots.length) return null;
  const planted=homestead.plots[slot];
  if(action==='plant'){
    if(planted||!Object.hasOwn(crops,item)||!(inventory[item]>0)) return null;
    inventory[item]--;
    homestead.plots[slot]={seed:item,readyAt:now+crops[item].time,watered:false};
    return {title:'Seeds planted',detail:crops[item].name+'. Water once for a faster, larger harvest.'};
  }
  if(!planted) return null;
  const crop=crops[planted.seed];
  if(action==='water'&&!planted.watered&&planted.readyAt>now){
    planted.watered=true;
    planted.readyAt=now+(planted.readyAt-now)*.52;
    return {title:'Plot watered',detail:'This harvest will yield three bundles.'};
  }
  if(action==='harvest'&&planted.readyAt<=now){
    const count=planted.watered?3:2;
    inventory[crop.crop]=(inventory[crop.crop]??0)+count;
    homestead.plots[slot]=null;
    return {title:'Harvested '+count,detail:'Feed a bundle to a friend or sell it at a store.'};
  }
  return null;
}
