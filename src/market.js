import {atlas} from './horizons.js';
import {takeBlessing} from './town-life.js';
import {frontierStores} from './frontier.js';
import {regionalRoomAt,regionalRoomById,townServiceAt} from './town-data.js';
import {items,regionAt,regions} from './content.js';
import {skyCounterPoint,skyShops} from './sky-islands.js';
import {spirehavenRoomAt,spirehavenRooms} from './spirehaven-rooms.js';

const physicalStalls={...frontierStores,...skyShops};
export function marketStalls(realm){
  return Object.entries(physicalStalls).flatMap(([place,store])=>{
    const region=regions[place];
    if(realm&&region.realm!==realm) return [];
    const [x,z]=region.realm==='sky'?skyCounterPoint(region):[region.x-4.8,region.z-1.65];
    return [{place,realm:region.realm,x,z,...store}];
  });
}
import {starterMarket,supplies,currencies,sellPrice} from './homestead.js';

export function marketAtPlace(realmId,place){
  const room=regionalRoomById(place);
  if(room?.realm===realmId){
    const stock=room.service==='inn'?[[atlas[realmId].food,6],['honeyStew',8],['berryCompote',5]]:
      physicalStalls[room.place].goods;
    return {name:room.name,goods:stock};
  }
  if(realmId==='silverrun'&&Object.hasOwn(spirehavenRooms,place)&&spirehavenRooms[place].goods) return spirehavenRooms[place];
  if(Object.hasOwn(physicalStalls,place)) return physicalStalls[place];
  const realm=atlas[realmId],native=realm.material;
  if(realmId==='valley') return starterMarket;
  return {
    name:realm.name+' trading cart',
    goods:[...(native?[[native,4],[realm.food,7]]:[]),...supplies.slice(0,4),['lantern',9]]
  };
}

export function marketAt(state,atPlace){
  if(atPlace) return marketAtPlace(state.realm,atPlace);
  const station=townServiceAt(state.realm,state.player.x,state.player.z,2.25);
  const place=station?.kind==='market'?station.place:regionAt(state.player.x,state.player.z,state.realm);
  return marketAtPlace(state.realm,place);
}

export function transact(state,type,id,atPlace){
  if(!Object.hasOwn(items,id)||state.transit) return null;
  if(regionalRoomById(atPlace)&&regionalRoomAt(state.realm,state.player.x,state.player.z)?.id!==atPlace) return null;
  if(atPlace&&Object.hasOwn(spirehavenRooms,atPlace)&&
    (state.realm!=='silverrun'||spirehavenRoomAt(state.player.x,state.player.z)?.id!==atPlace)) return null;
  const inventory=state.inventory;
  if(type==='sell'){
    if(!(inventory[id]>0)) return null;
    const price=sellPrice(id)+takeBlessing(state,'trade');
    inventory[id]--;
    state.wallet.coins+=price;
    return {name:items[id][0],price,currency:'coins'};
  }
  const listing=marketAt(state,atPlace).goods.find(([stock])=>stock===id);
  if(!listing) return null;
  const [,price,currency='coins']=listing;
  if(!Object.hasOwn(currencies,currency)||!Number.isSafeInteger(price)||price<1||state.wallet[currency]<price) return null;
  state.wallet[currency]-=price;
  inventory[id]=(inventory[id]??0)+1;
  return {name:items[id][0],price,currency};
}
