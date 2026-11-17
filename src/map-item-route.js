import {icon} from './icons.js';
import {chartLocation,mapPinStyle} from './cartography.js';
import {groundRealmAt,regionPoint} from './overworld.js';
import {trackingText,trackingRegion} from './item-tracking.js';

const visible=([x,y])=>x>=2&&x<=98&&y>=3&&y<=98;
const format=points=>points.map(coords=>coords.map(n=>n.toFixed(2)).join(',')).join(' ');
const gap=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const colors=['#ef56a2','#ff8a5a','#e4b127','#54b98b','#48aee5','#a47bf1'];

function glints(points){
  const sparks=[];
  let next=2.1;
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],distance=gap(a,b);
    for(;next<distance;next+=4.2){
      const x=a[0]+(b[0]-a[0])*next/distance,y=a[1]+(b[1]-a[1])*next/distance;
      if(visible([x,y])) sparks.push(`<use href="#item-map-glint" x="${x.toFixed(2)}" y="${y.toFixed(2)}" fill="${colors[sparks.length%colors.length]}" style="--twinkle:${(sparks.length%5)*-.26}s"/>`);
    }
    next-=distance;
  }
  return sparks.join('');
}

export function mapItemRoute(journey,tracking,realm,focus){
  if(!journey?.points?.length) return '';
  const {source,end,points}=journey;
  const project=realm?(point=>{
    const local=regionPoint(realm,point.x,point.z);
    const {x,y}=mapPinStyle(realm,local,focus);
    return [x,y];
  }):({x,z})=>chartLocation(x,z);
  const local=points.map(project),goal=project(end),first=local[0],last=local.at(-1);
  const needsOnward=gap(last,goal)>.16;
  const elevationChanged=source.realm==='sky'&&realm&&realm!=='sky';
  const pinHere=(!realm||realm===source.realm||elevationChanged&&groundRealmAt(end.x,end.z)===realm)&&visible(goal);
  const label='Tracked destination for '+tracking.title+' · '+trackingText(source);
  const [gx,gy]=goal;
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" class="map-item-path">
    <defs>${[['item-map-rainbow',first,last],['item-map-onward',last,goal]].map(([id,a,b])=>
      `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}">
        ${colors.map((color,i)=>`<stop offset="${i/(colors.length-1)*100}%" stop-color="${color}"/>`).join('')}
      </linearGradient>`).join('')}<path id="item-map-glint" d="M0-1.04C.12-.31.31-.12 1.04 0 .31.12.12.31 0 1.04-.12.31-.31.12-1.04 0-.31-.12-.12-.31 0-1.04Z"/></defs>
    ${needsOnward?`<polyline data-item-onward class="map-item-estimate-edge" points="${format([last,goal])}"/>
      <polyline class="map-item-estimate" points="${format([last,goal])}"/>`:''}
    <polyline data-item-route class="map-item-route-edge" points="${format(local)}"/>
    <polyline class="map-item-route-color" points="${format(local)}"/>
    ${glints(local)}
    ${visible(first)?`<ellipse cx="${first[0]}" cy="${first[1]}" rx=".61" ry="1" class="map-route-start"/>`:''}
  </svg>${pinHere?`<button type="button" class="map-item-pin" data-action="track-destination" data-source-realm="${source.realm}" data-phase="${source.phase??''}"
    style="--map-track-x:${gx}%;--map-track-y:${gy}%;" aria-label="${label}" title="${label}${elevationChanged?' · Above this region':''}">
    ${icon(source.phase==='turn-in'?'check':source.kind==='shop'?'bag':source.kind==='creature'?'paw':source.realm==='sky'?'rainbow':'pin',16)}
  </button>`:''}`;
}

export function mapTrackingCard(tracking,journey){
  if(!tracking) return '';
  const {kind,title}=tracking,source=journey?.source,where=trackingText(source);
  const hasDestination=journey?.points?.length;
  return `<aside class="map-tracking-card" aria-label="Tracked ${kind}" data-phase="${source?.phase??''}">
    <span class="map-tracking-icon">${icon(source?.phase==='turn-in'?'check':source?.kind==='shop'?'bag':'sparkles',20)}</span>
    <div><strong>${title}</strong><small>${where}${hasDestination?' · '+trackingRegion(source):''}</small></div>
    ${hasDestination?`<button type="button" class="small-action" data-action="track-destination">${icon('pin',15)} <span>View destination</span></button>`:''}
    <button type="button" class="item-track-stop" data-action="clear-${kind}-track" aria-label="Stop ${kind} tracking">${icon('x',17)}</button>
  </aside>`;
}
