export const marigold={x:35.5,z:44,length:16,width:2.87,deck:3.28,hold:.82};
export const gangplank={from:30.9,to:34.1,z:39.65,halfWidth:.72};
export const stairs={top:42,bottom:46.65,halfWidth:.76};

export function hullBreadth(t,width){
  return width*(.035+.965*Math.sin(Math.PI*t)**.57)*(.92+t*.14);
}

export function onMarigold(x,z){
  const t=(z-marigold.z)/marigold.length+.5;
  return t>.054&&t<.95&&Math.abs(x-marigold.x)<hullBreadth(t,marigold.width)-.11;
}

export const onGangplank=(x,z)=>x>=gangplank.from&&x<=gangplank.to&&Math.abs(z-gangplank.z)<=gangplank.halfWidth;
export const onShip=(x,z)=>onMarigold(x,z)||onGangplank(x,z);
export const atStairs=(x,z)=>Math.abs(x-marigold.x)<stairs.halfWidth&&z>=stairs.top&&z<=stairs.bottom;
export const inHold=(x,z)=>Math.abs(x-marigold.x)<1.78&&z>=40.5&&z<=49.15&&onMarigold(x,z);

export function shipHeight(x,z,belowDeck,jettyHeight){
  if(onGangplank(x,z)) return jettyHeight+(marigold.deck-jettyHeight)*(x-gangplank.from)/(gangplank.to-gangplank.from);
  if(atStairs(x,z)) return marigold.deck+(marigold.hold-marigold.deck)*(z-stairs.top)/(stairs.bottom-stairs.top);
  if(onMarigold(x,z)) return belowDeck?marigold.hold:marigold.deck;
  return null;
}

export function canMoveOnShip(player,x,z,onJetty){
  const climbing=atStairs(player.x,player.z),wantStairs=atStairs(x,z);
  if(climbing&&!wantStairs&&z>stairs.top&&z<stairs.bottom) return false;
  if(!climbing&&wantStairs&&(player.belowDeck?player.z<stairs.bottom:player.z>stairs.top)) return false;
  if(player.belowDeck) return inHold(x,z);
  if(onShip(player.x,player.z)) return onShip(x,z)||onJetty;
  return true;
}

export function switchDeck(player,zBefore){
  if(Math.abs(player.x-marigold.x)>=stairs.halfWidth) return;
  if(zBefore<=stairs.bottom&&zBefore>=stairs.top&&player.z>stairs.bottom) player.belowDeck=true;
  if(zBefore>=stairs.top&&zBefore<=stairs.bottom&&player.z<stairs.top) delete player.belowDeck;
}
