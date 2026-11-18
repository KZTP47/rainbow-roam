
import {extensions,roomDecor,roomReady} from './homestead.js';
import {icon} from './icons.js';
import {createPropertyAvatar} from './property-avatar.js';
import {propertySize,propertySpots,projectProperty,propertyViewTitle,propertyBackground,propertySlotLabels} from './property-map.js';

const {width,height}=propertySize;
const sessions=new WeakMap();
export function resetPropertyWalk(state){sessions.delete(state.homestead);}
const boxByView={
  house:[.30,.45,7.31,5.84],garden:[.63,.67,7.86,6.57],
  ...Object.fromEntries(Object.keys(extensions).map(id=>[id,[.34,.43,6.20,5.53]]))
};
const obstacles={
  house:[[.16,3.49,.65,5.17],[5.1,.16,6.32,1.05],[3.46,5.65,4.16,6.19],[.92,5.39,1.38,5.95]],
  garden:[[.55,2.77,1.20,3.41],[7.10,.65,7.71,1.29],[6.82,4.79,7.90,5.90]],
  sunroom:[[.24,.51,1.98,1.25],[5.69,4.45,6.42,5.29]],
  workshop:[[.22,.54,1.99,1.49]],
  loft:[[1.85,.18,3.74,1.02]],
  kitchen:[[.26,.46,2.66,1.47]],
  companionNook:[[.28,.48,1.34,1.69],[4.91,.67,6.05,1.65]],
  wizardTower:[[2.60,.43,3.95,1.19]]
};
const entry={
  house:[3.84,4.83],garden:[4.19,5.91],
  ...Object.fromEntries(Object.keys(extensions).map(id=>[id,[3.29,4.55]]))
};
const connectors={
  garden:{point:[3.85,5.50],fromHouse:[4.12,5.89],returnPoint:[4.15,6.39],fromOther:[3.83,4.59]},
  sunroom:{point:[.56,2.90],fromHouse:entry.sunroom,returnPoint:[3.27,5.30],fromOther:[1.66,2.81]},
  workshop:{point:[7.02,2.89],fromHouse:entry.workshop,returnPoint:[3.27,5.30],fromOther:[5.84,2.92]},
  loft:{point:[3.81,.68],fromHouse:entry.loft,returnPoint:[3.27,5.30],fromOther:[3.84,1.70]},
  kitchen:{point:[7.03,1.39],fromHouse:entry.kitchen,returnPoint:[3.27,5.30],fromOther:[6.09,1.47]},
  companionNook:{point:[1.81,5.53],fromHouse:entry.companionNook,returnPoint:[3.27,5.30],fromOther:[2.20,4.92]},
  wizardTower:{point:[7.04,5.63],fromHouse:entry.wizardTower,returnPoint:[3.27,5.30],fromOther:[6.45,5.49]}
};
const keyDirection={
  ArrowUp:[-1,-1],KeyW:[-1,-1],ArrowDown:[1,1],KeyS:[1,1],
  ArrowLeft:[-1,1],KeyA:[-1,1],ArrowRight:[1,-1],KeyD:[1,-1]
};
const dpad=[['ArrowUp','Move up','chevron-up'],['ArrowLeft','Move left','chevron-left'],
  ['ArrowDown','Move down','chevron-down'],['ArrowRight','Move right','chevron-right']];
const gap=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);

export function propertyDoorways(homestead,view){
  if(view==='house') return Object.entries(connectors)
    .filter(([id])=>id==='garden'||homestead.extensions?.[id])
    .map(([id,door])=>({to:id,position:door.point,spawn:door.fromHouse}));
  const door=connectors[view];
  return door?[{to:'house',position:door.returnPoint,spawn:door.fromOther}]:[];
}

export function walkCanStand(homestead,view,x,y){
  const bounds=boxByView[view];
  if(!bounds||x<bounds[0]||y<bounds[1]||x>bounds[2]||y>bounds[3]) return false;
  if(obstacles[view].some(([a,b,c,d])=>x>=a&&x<=c&&y>=b&&y<=d)) return false;
  const items=roomDecor(homestead,view);
  const standOver=(sx,sy,i)=>{
    if(view==='garden') return x>=sx-.11&&x<=sx+1.37&&y>=sy-.10&&y<=sy+1.23;
    const item=items?.[i];
    if(!item||item==='patchRug') return false;
    if(item==='moonLamp') return Math.hypot(x-sx-.62,y-sy-.61)<.34;
    return x>=sx-.09&&x<=sx+1.39&&y>=sy-.10&&y<=sy+(item==='herbShelf'?.97:1.34);
  };
  return !propertySpots(view).some(([sx,sy],i)=>standOver(sx,sy,i));
}

function fitStand(home,view,point){
  if(walkCanStand(home,view,...point)) return [...point];
  for(let radius=.18;radius<2;radius+=.17){
    for(let i=0;i<12;i++){
      const phi=i*Math.PI/6,x=point[0]+Math.cos(phi)*radius,y=point[1]+Math.sin(phi)*radius;
      if(walkCanStand(home,view,x,y)) return [x,y];
    }
  }
  return [...entry[view]];
}

function reachable(home,view,a,b){
  const steps=Math.max(1,Math.ceil(gap(a,b)*11));
  for(let i=1;i<=steps;i++){
    const t=i/steps;
    if(!walkCanStand(home,view,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t)) return false;
  }
  return true;
}

export function propertyPath(homestead,view,start,target){
  const goal=fitStand(homestead,view,target);
  if(reachable(homestead,view,start,goal)) return [goal];
  const spacing=.27, size=32;
  const grid=Array.from({length:size*size},(_,i)=>[(i%size)*spacing,Math.floor(i/size)*spacing]);
  const possible=grid.map(p=>walkCanStand(homestead,view,...p));
  const queue=[],prev=new Map();
  for(const [i,p] of grid.entries()){
    if(possible[i]&&gap(start,p)<spacing*1.75&&reachable(homestead,view,start,p)){
      prev.set(i,-1);queue.push(i);
    }
  }
  const steps=[1,-1,size,-size];
  let finish=-1;
  for(let at=0;at<queue.length;at++){
    const i=queue[at],p=grid[i];
    if(gap(p,goal)<spacing*1.85&&reachable(homestead,view,p,goal)){
      finish=i;break;
    }
    for(const offset of steps){
      const id=i+offset;
      if(!possible[id]||prev.has(id)||gap(p,grid[id])>spacing*1.05||!reachable(homestead,view,p,grid[id])) continue;
      prev.set(id,i);queue.push(id);
    }
  }
  if(finish===-1) return [];
  const path=[goal];
  for(let i=finish;i>=0;i=prev.get(i)) path.unshift(grid[i]);
  const clear=[start];
  let i=0;
  while(i<path.length){
    let j=i+1;
    while(j<path.length&&reachable(homestead,view,clear.at(-1),path[j])) j++;
    clear.push(path[j-1]);
    i=j;
  }
  return clear.slice(1);
}

export function propertyWalk(state,{action}){
  if(!state.homestead.owned) return '';
  return `<section class="property-workspace property-walk">
    <div class="walk-toolbar">
      <div><span class="walk-live">${icon('compass',18)} Walking</span><strong data-walk-room></strong></div>
      <div>${action('Change view','property-mode:choose','compass','','small-action')}<button type="button" class="small-action" data-walk-edit-plan>${icon('map',17)} <span>Edit floor plan</span></button>
      ${action('Back outside','close','chevron-left','','small-action')}</div>
    </div>
    <div class="walk-layout">
      <div class="walk-viewport"><div class="walk-stage" tabindex="0" aria-label="Isometric walking map">
        <img class="property-landscape" alt="">
        <canvas width="${width}" height="${height}" aria-hidden="true"></canvas>
        <div class="walk-portals"></div>
      </div></div>
      <aside class="walk-help">
        <h3>Roam the homestead</h3>
        <p>Use <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or arrow keys to move, or select a floor spot. Step onto a doorway to change rooms. <kbd>E</kbd> opens the nearby furnishing spot or bed.</p>
        <div class="walk-dpad" aria-label="Walking controls">${dpad.map(([key,label,symbol])=>
          `<button type="button" data-walk-key="${key}" aria-label="${label}">${icon(symbol,20)}</button>`).join('')}</div>
        <div class="walk-interaction"><button class="small-action" type="button" data-walk-edit>${icon('armchair',17)} <span>Edit this area</span></button>
          <button class="small-action" type="button" data-walk-service hidden></button></div>
      </aside>
    </div>
  </section>`;
}

export function mountPropertyWalk(host,state,{start='house',edit,renderer}={}){
  if(!host||!state.homestead.owned) return ()=>{};
  const home=state.homestead;
  const safeStart=Object.hasOwn(boxByView,start)&&(start==='house'||start==='garden'||home.extensions?.[start])?start:'house';
  let session=sessions.get(home);
  if(!session||session.start!==safeStart||!(session.view==='house'||session.view==='garden'||home.extensions?.[session.view])){
    session={view:safeStart,point:[...entry[safeStart]],start:safeStart};
    sessions.set(home,session);
  }
  session.point=fitStand(home,session.view,session.point);
  const keys=new Set(),presses=new Map();
  const stage=host.querySelector('.walk-stage'),canvas=stage.querySelector('canvas');
  const background=stage.querySelector('img'),portals=stage.querySelector('.walk-portals');
  const room=host.querySelector('[data-walk-room]'),inspect=host.querySelector('[data-walk-edit]'),service=host.querySelector('[data-walk-service]');
  const ctx=canvas.getContext('2d');
  const avatar=createPropertyAvatar(state.look,renderer);
  const controller=new AbortController(),settings={signal:controller.signal};
  let path=[],aim=null,frame,last=0,step=0,facing=-1,delay=0,doors=[],dirty=true,wasMoving=false;
  function label(){
    const {view,point}=session,slots=propertySpots(view);
    const distances=slots.map(([x,y])=>gap(point,[x+.6,y+.52]));
    const near=distances.indexOf(Math.min(...distances));
    const slot=distances[near]<1.55?near:null;
    const text=slot===null?'Edit this area':view==='garden'?'Tend plot '+(slot+1):'Edit '+propertySlotLabels(view)[slot].toLowerCase();
    if(inspect.dataset.slot!==String(slot)||inspect.lastElementChild.textContent!==text){
      inspect.dataset.slot=String(slot);
      inspect.lastElementChild.textContent=text;
    }
  }
  function updateRoom(){
    const {view}=session;
    room.textContent=propertyViewTitle(view);
    background.src=propertyBackground(state,view);
    background.alt='Isometric walking map of '+propertyViewTitle(view);
    host.dataset.walkArea=view;
    doors=propertyDoorways(home,view);dirty=true;
    const addition=extensions[view];
    service.hidden=!addition;
    if(addition){
      service.dataset.action='homestead-service:'+view;
      service.innerHTML=icon(addition.icon,17)+'<span>'+addition.service+'</span>';
      service.disabled=!roomReady(state,view);
    }
    portals.innerHTML=doors.map(({to,position})=>{
      const [x,y]=projectProperty(view,...position);
      return '<button type="button" data-walk-door="'+to+'" style="--at-x:'+(x/width*100).toFixed(2)+
        '%;--at-y:'+(y/height*100).toFixed(2)+'%" aria-label="Walk to '+propertyViewTitle(to)+'">'+
        icon(to==='garden'?'sprout':to==='loft'?'chevron-up':'chevron-right',14)+
        '<span>'+propertyViewTitle(to)+'</span></button>';
    }).join('');
    label();
  }
  function queue(point){
    path=propertyPath(home,session.view,session.point,point);
    aim=path.length?path.at(-1):null;dirty=true;
  }
  function move(dx,dy){
    const p=session.point,view=session.view;
    const x=p[0]+dx,y=p[1]+dy;
    if(walkCanStand(home,view,x,y)){session.point=[x,y];return true;}
    if(dx&&walkCanStand(home,view,x,p[1])){session.point=[x,p[1]];return true;}
    if(dy&&walkCanStand(home,view,p[0],y)){session.point=[p[0],y];return true;}
    return false;
  }
  function draw(moving){
    const p=session.point;
    ctx.clearRect(0,0,width,height);
    for(const {position} of doors){
      const [x,y]=projectProperty(session.view,...position);
      ctx.fillStyle='#fee49a87';ctx.strokeStyle='#fff3bb';ctx.lineWidth=1.7;
      ctx.beginPath();ctx.ellipse(x,y,17,8,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    }
    if(aim){
      const [x,y]=projectProperty(session.view,...aim);
      ctx.strokeStyle='#fbf6bf';ctx.lineWidth=2.4;
      ctx.beginPath();ctx.ellipse(x,y,11,5.6,0,0,Math.PI*2);ctx.stroke();
    }
    avatar.draw(ctx,...projectProperty(session.view,...p),facing,step,moving);
    host.dataset.walkX=p[0].toFixed(2);
    host.dataset.walkY=p[1].toFixed(2);
  }
  function tick(now){
    const dt=Math.min(.046,last?(now-last)/1000:0);
    last=now;delay=Math.max(0,delay-dt);
    if(!service.hidden) service.disabled=!roomReady(state,session.view);
    let dx=0,dy=0;
    for(const key of keys){
      dx+=keyDirection[key][0];dy+=keyDirection[key][1];
    }
    let target=null;
    if(dx||dy){path=[];aim=null;}
    else if(path.length){
      target=path[0];
      dx=target[0]-session.point[0];dy=target[1]-session.point[1];
    }
    const distance=Math.hypot(dx,dy);
    const stride=Math.min(target?distance:Infinity,dt*3.32);
    const moving=distance>.004&&stride>0&&move(dx/distance*stride,dy/distance*stride);
    if(moving){
      step+=dt*16;
      facing=Math.round(Math.atan2(dx-dy,dx+dy)/(Math.PI/4));
    }
    if(target&&gap(session.point,target)<.035) path.shift();
    if(!path.length) aim=null;
    if(delay===0){
      const door=doors.find(({position})=>gap(session.point,position)<.28);
      if(door){
        session.view=door.to;
        session.point=fitStand(home,door.to,door.spawn);
        path=[];aim=null;delay=.42;
        updateRoom();
      }
    }
    if(moving||wasMoving||dirty){
      label();draw(moving);dirty=false;
    }
    wasMoving=moving;
    frame=requestAnimationFrame(tick);
  }
  host.addEventListener('click',event=>{
    const door=event.target.closest('[data-walk-door]');
    if(door){
      queue(doors.find(entry=>entry.to===door.dataset.walkDoor).position);
      return;
    }
    if(event.target.closest('[data-walk-edit],[data-walk-edit-plan]')){
      const slot=event.target.closest('[data-walk-edit-plan]')?0:Number(inspect.dataset.slot);
      edit?.(session.view,Number.isInteger(slot)?slot:0);
    }
  },settings);
  stage.addEventListener('click',event=>{
    if(event.target.closest('button')) return;
    const r=stage.getBoundingClientRect();
    const [ox,oy]=projectProperty(session.view,0,0);
    const dx=((event.clientX-r.left)/r.width*width-ox)/46;
    const dy=((event.clientY-r.top)/r.height*height-oy)/24;
    queue([(dx+dy)/2,(dy-dx)/2]);
  },settings);
  window.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey) return;
    if(event.code==='KeyE'&&!event.repeat){inspect.click();return;}
    if(!Object.hasOwn(keyDirection,event.code)) return;
    event.preventDefault();keys.add(event.code);
  },settings);
  window.addEventListener('keyup',event=>keys.delete(event.code),settings);
  window.addEventListener('blur',()=>{keys.clear();presses.clear();},settings);
  for(const button of host.querySelectorAll('[data-walk-key]')){
    const key=button.dataset.walkKey;
    button.addEventListener('pointerdown',event=>{
      button.setPointerCapture(event.pointerId);
      presses.set(key,{id:event.pointerId,at:performance.now()});keys.add(key);
    },settings);
    for(const type of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(type,event=>{
      const press=presses.get(key);
      if(press?.id!==event.pointerId) return;
      presses.delete(key);keys.delete(key);
      if(type==='pointerup'&&performance.now()-press.at<160){
        const v=keyDirection[key];
        queue([session.point[0]+v[0]*.42,session.point[1]+v[1]*.42]);
      }
    },settings);
    button.addEventListener('click',event=>{
      if(event.detail===0){
        const v=keyDirection[key];
        queue([session.point[0]+v[0]*.52,session.point[1]+v[1]*.52]);
      }
    },settings);
  }
  updateRoom();draw(false);
  frame=requestAnimationFrame(tick);
  return ()=>{cancelAnimationFrame(frame);controller.abort();avatar.destroy();};
}

