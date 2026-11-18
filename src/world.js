import * as T from 'three';
import {animate,buildPiece,creature,person,part,material} from './models.js';
import {populate,resourceModel,homes,batchStatic,terrainHeight as valleyHeight,walkable as valleyWalkable,lakeValue} from './landscape.js';
import {horizonResource,horizonTerrain,populateHorizon,travelArch,voyageGate} from './horizon-land.js';
import {wards,relayPosts} from './city-wards.js';
import {atlas,homeland,horizonResources,realmRegions} from './horizons.js';
import {skyLight,sunDirection} from './daylight.js';
import {human,disposeHuman} from './human.js';
import {dailyActivity,residentRoutine,workTools,workPose,playStyle,playPosition} from './residents.js';
import {blackLake,campusSigns} from './castle.js';
import {streamLandscape} from './world-stream.js';
import {canFly,geography,worldPoint,regionPoint,groundRealmAt,nearestGround,worldBounds,oceanLevel} from './overworld.js';
import {traveler} from './traveler.js';
import {marketStalls} from './market.js';

import {home as cloverCottage,extensions,homesteadDoorHalfWidth,homesteadLayout,homesteadServicePoint,propertyArea,propertyDoors,towerDoorZ,wizardTowerPoint} from './homestead.js';
import {createCombat} from './combat.js';
import {nearbyLoot,pickUpLoot} from './loot.js';
import {landmarkPoint,newRegions} from './new-regions.js';
import {createLootArt} from './loot-art.js';
import {findItemTarget,trackingDistance} from './item-tracking.js';
import {findQuestTarget,trackingSelection} from './quest-tracking.js';
import {connectTrail,createItemTrail,trailPath} from './item-trail.js';
import {regionalRoomById,regionalRoomsFor,townServiceAt,townWater} from './town-data.js';
import {populateTown} from './towns.js';
import {icon} from './icons.js';
import {items,species,wildlife,villagers,resourceSpots,regionAt} from './content.js';
import {inRiver,riverLevel,silverrunWalls,spirehavenCitizens} from './silverrun.js';
import {coastRiverY,inCoastRiver,pierAt,seaHeight} from './silvercoast.js';
import {atStairs,canMoveOnShip,gangplank,inHold,marigold,onMarigold,onShip,stairs,switchDeck} from './marigold.js';
import {dialFaces,inRoom,roomFloorOffset,roomPoint,rooms} from './spirehaven-rooms.js';
import {caveObstructs,cavePoints,createDoorSignals,drawCave,roomDoorSignal} from './adventure-doors.js';
import {dungeonEntrances} from './dungeons.js';

const GRID=1.2;
const TAU=Math.PI*2;
const SCALE_MAX=1.5;
const v=new T.Vector3();
const scratch=new T.Vector3();
const up=new T.Vector3(0,1,0);
const deltaAngle=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));

export function createWorld(container,state,callback) {
  const realm=state.realm;
  const valley=realm===homeland;
  const land=valley?null:horizonTerrain(realm);
  const terrainHeight=land?.height??valleyHeight;
  const walkable=land?.walkable??valleyWalkable;
  const walkInRooms=realm==='silverrun'?rooms:regionalRoomsFor(realm);
  const roomAt=(x,z)=>walkInRooms.find(room=>inRoom(room,x,z))??null;
  const insideRoom=()=>state.transit?null:roomAt(state.player.x,state.player.z);
  const events=new AbortController();
  const options={signal:events.signal};
  const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,SCALE_MAX));
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.06;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFShadowMap;
  container.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','3D view. Drag to look around.');
  renderer.domElement.addEventListener('webglcontextlost',event=>{
    event.preventDefault();callback.lost(true);
  },options);
  renderer.domElement.addEventListener('webglcontextrestored',()=>callback.lost(false),options);

  const scene=new T.Scene();
  scene.fog=new T.FogExp2('#c5dce1',.0108);
  const camera=new T.PerspectiveCamera(56,1,.12,670);
  const hemi=new T.HemisphereLight('#fff3dc','#b0b0bc',2.1);
  scene.add(hemi);
  const sun=new T.DirectionalLight('#ffe6bd',2.23);
  sun.position.set(-17,30,11);
  sun.shadow.mapSize.set(1536,1536);
  sun.shadow.camera.left=sun.shadow.camera.bottom=-30;
  sun.shadow.camera.right=sun.shadow.camera.top=30;
  sun.shadow.camera.far=82;
  sun.shadow.normalBias=.038;
  sun.shadow.bias=-.00016;
  sun.castShadow=true;
  scene.add(sun,sun.target);
  const fill=new T.DirectionalLight('#d7e1ff',.55);fill.position.set(10,9,-18);scene.add(fill);
  const roomBackdrop=new T.Color('#bcb0c1');
  function indoorLayers(group){
    if(walkInRooms.length||valley){
      const count=valley?1+Object.keys(extensions).length:walkInRooms.length;
      group.traverse(node=>{for(let layer=1;layer<=count;layer++) node.layers.enable(layer);});
    }
  }
  if(walkInRooms.length||valley){
    const ambientRoom=new T.HemisphereLight('#ffecd6','#ae98b8',2.95);
    const windowLight=new T.DirectionalLight('#ffe4bb',1.55);
    windowLight.position.set(-3,9,6);
    for(const light of [ambientRoom,windowLight]){
      light.layers.disable(0);indoorLayers(light);scene.add(light);
    }
  }
  const landscape=valley?populate(scene):populateHorizon(scene,realm,land,state);
  const doorSignals=createDoorSignals(scene);
  const ward=wards[realm];
  let relayIndex=0,relayDeadline=0,lastRelayText='';
  const relayNames=['Market lantern','Survey lane','North corner','East arcade'];
  const course=realm==='cooperward'?[0,3,2,1,0]:realm==='starward'?[0,2,3,1,0]:[0,1,2,3,0];
  const relayHud=ward?document.createElement('div'):null;
  if(ward){
    relayHud.className='lantern-race';relayHud.hidden=true;container.append(relayHud);
    relayPosts.forEach(([x,z],i)=>doorSignals.add({x,z,y:terrainHeight(x,z)+3.14,radius:90,enabled:()=>course[relayIndex]===i}));
  }
  function lightLantern(){
    if(!ward||state.transit)return;
    const [x,z]=relayPosts[course[relayIndex]];
    if(Math.hypot(state.player.x-x,state.player.z-z)>=3)return;
    if(relayIndex===0)relayDeadline=elapsed+65;
    relayIndex++;
    if(relayIndex===course.length){
      relayIndex=0;relayHud.hidden=true;
      state.wallet.coins+=10;const food=ward.pet[5];state.inventory[food]=(state.inventory[food]??0)+2;
      callback.combatReport({title:'Lantern circuit complete',detail:'10 Suncoins and 2 '+items[food][0],icon:'sparkles'});
    }
  }
  function updateRelay(){
    if(!relayIndex)return;
    if(elapsed>=relayDeadline){
      relayIndex=0;relayHud.hidden=true;callback.relayTimeout();return;
    }
    const target=course[relayIndex],[x,z]=relayPosts[target];
    const meters=Math.round(Math.hypot(state.player.x-x,state.player.z-z));
    const text=relayNames[target]+' · '+meters+' m · '+Math.ceil(relayDeadline-elapsed)+' s';
    if(lastRelayText!==text){relayHud.textContent=text;lastRelayText=text;}
    relayHud.hidden=false;
  }
  const caves=dungeonEntrances.filter(entry=>entry.realm===realm);
  for(const cave of caves){
    drawCave(scene,cave,terrainHeight);
    const [x,z]=cavePoints(cave,0,1.42);
    doorSignals.add({x,z,y:terrainHeight(cave.x,cave.z)+3.00});
  }
  for(const room of walkInRooms)doorSignals.add(roomDoorSignal(room,terrainHeight));
  if(realm==='silverrun'){
    doorSignals.add({x:12,z:7.15,y:terrainHeight(12,7.15)+2.65,radius:23});
  }
  if(realm==='hogwarts'){
    for(const sign of campusSigns(terrainHeight)){
      if(sign.door) doorSignals.add({x:sign.x+Math.sin(sign.yaw)*1.24,z:sign.z+Math.cos(sign.yaw)*1.24,y:sign.y+1.05,radius:21});
    }
  }
  if(realm==='silvercoast'){
    doorSignals.add({x:gangplank.to,z:gangplank.z,y:marigold.deck+2.17,enabled:()=>!state.player.belowDeck});
    doorSignals.add({x:marigold.x,z:stairs.top+.44,y:marigold.deck+2.02,enabled:()=>!state.player.belowDeck});
  }
  if(valley){
    for(const [id,x,z] of propertyDoors({owned:true,extensions})){
      const side=homesteadLayout[id]?.door.side??'south';
      const approach={east:[1,0],west:[-1,0],south:[0,1],north:[0,-1]}[side];
      doorSignals.add({x:x+approach[0]*1.10,z:z+approach[1]*1.10,y:terrainHeight(x,z)+2.30,enabled:()=>state.homestead.owned&&
        (id==='house'||Boolean(state.homestead.extensions[id]))});
    }
  }
  const town=valley?populateTown(scene,'village',terrainHeight):null;
  if(town){batchStatic(scene,town.root);town.root.removeFromParent();}
  const stream=streamLandscape(scene,realm,state);
  const homestead=callback.makeHomestead?.(scene,realm,terrainHeight);
  const altitude=geography[realm].altitude??0;
  let flightMount=null,mountId=null,landing=false;
  const kite=new T.Group();
  scene.add(kite);kite.visible=false;
  for(const side of [-1,1]){
    const wing=part(kite,'cone',side<0?'#dda3be':'#a7bee3',side*1.05,.32,0,1.02,2.21,.15,0,0,side*1.42);
    wing.castShadow=false;
  }
  part(kite,'cyl','#947377',0,-.12,0,.054,1.53,.057,Math.PI*.5).castShadow=false;
  const wakeMesh=new T.Mesh(new T.RingGeometry(.81,1,35).rotateX(-Math.PI*.5),
    new T.MeshBasicMaterial({color:'#d8f4ef',transparent:true,depthWrite:false,opacity:.37}));
  scene.add(wakeMesh);wakeMesh.visible=false;
  if(valley) travelArch(scene,terrainHeight,...voyageGate(realm,atlas[realm].entry));
  const regionsHere=valley?[]:realmRegions(realm);
  const gates=(valley?[[atlas[realm].entry]]:regionsHere).map(([id])=>voyageGate(realm,id));
  const stores=marketStalls(realm);
  const landmarks=regionsHere.flatMap(([id,r])=>r.marker?[{id,name:r.name,point:r.marker}]:[]);

  let player=traveler(state.look);
  player.group.scale.setScalar(1.13);
  indoorLayers(player.group);
  scene.add(player.group);
  const shadowTexture=makeShadow();
  const playerShadow=addShadow(scene,shadowTexture,.84);
  indoorLayers(playerShadow);
  let cameraRoom=null,roomZoom=1;
  const coastal=realm==='silvercoast';
  let y=playerFloor(state.player.x,state.player.z),speedY=0,grounded=true;
  const inSpirehaven=({x,z})=>realm==='silverrun'&&x>silverrunWalls.west&&x<silverrunWalls.east&&z>silverrunWalls.north&&z<silverrunWalls.south;
  let pitch=inSpirehaven(state.player)?.08:.24, distance=9.6;
  let active=false, paused=false, contextLost=false, needsRender=true;
  let buddy=null,buddyId=null,followTarget=null;
  let building=false,selected=null,rotation=0,preview=null,previewType=null;
  let elapsed=0,lastFrame=0,prevUi=0,prevSun=0,freeLookUntil=0;
  let keys=new Set(),gesture=null, mouseAim=false;
  const target=new T.Vector3(),ideal=new T.Vector3();
  const ray=new T.Raycaster(),screen=new T.Vector2(0,0),pointer=new T.Vector2(0,0);
  const blockMap=new Map();
  const parcelGeometry=new T.BoxGeometry(1.195,1.2,1.195);
  const proxyMat=new T.MeshBasicMaterial({visible:false});
  const ghostGood=new T.MeshStandardMaterial({color:'#c9ed9f',transparent:true,opacity:.42,depthWrite:false,emissive:'#9ac98a',emissiveIntensity:.32});
  const ghostBad=new T.MeshStandardMaterial({color:'#ef9bc1',transparent:true,opacity:.44,depthWrite:false,emissive:'#bf7994',emissiveIntensity:.25});
  const edgeLines=new T.LineSegments(new T.EdgesGeometry(parcelGeometry),new T.LineBasicMaterial({color:'#fff2ca',transparent:true,opacity:.8,depthWrite:false}));
  edgeLines.visible=false;scene.add(edgeLines);
  const labels=document.querySelector('#world-labels');
  const safeGround=(x,z)=>walkable(x,z)&&landscape.isClear(x,z)&&!town?.blocks(x,z)&&!caves.some(cave=>caveObstructs(cave,x,z));
  if(!state.transit&&((walkInRooms.length&&!landscape.isClear(state.player.x,state.player.z))||
    caves.some(cave=>caveObstructs(cave,state.player.x,state.player.z))||
    homestead?.blocks?.(state.player.x,state.player.z))){
    const p=state.player,origin={x:p.x,z:p.z};
    search: for(let radius=.6;radius<9;radius+=.6){
      for(let i=0;i<16;i++){
        const angle=i*Math.PI/8,x=origin.x+Math.cos(angle)*radius,z=origin.z+Math.sin(angle)*radius;
        if(safeGround(x,z)&&!homestead?.blocks?.(x,z)){Object.assign(p,{x,z});break search;}
      }
    }
    y=playerFloor(p.x,p.z);
  }
  const combat=createCombat({scene,container,state,species,realm,terrainHeight,
    walkable:(x,z)=>safeGround(x,z)&&!homestead?.blocks?.(x,z)&&(realm==='sky'||waterSurface(x,z)===null),
    report:callback.combatReport});
  combat.setActive(false);
  const residents=villagers.filter(v=>(v.realm??homeland)===realm);
  if(realm==='silverrun') residents.push(...spirehavenCitizens);
  const agents=residents.map((data,i)=>{
    const look=data.portrait?human(data.colors,data.portrait):person(data.colors,false,i);
    const name=makeLabel(labels,data.name,i===0?'!':'·');
    scene.add(look.group);
    look.group.scale.setScalar(data.id==='hagrid'?1.47:1.01+(i%3)*.05);
    const stops=residentRoutine(data,realm,i,safeGround);
    const start=stops[dailyActivity(state.time)];
    return {data,look,name,stops,tools:workTools(look),x:start.x,z:start.z,activity:start.activity,seed:i*1.35};
  });
  const wild=wildlife.filter(entry=>(entry[4]??homeland)===realm).map(([id,x,z,radius],i)=>{
    const data=species[id],look=creature(data);
    const name=makeLabel(labels,data.name,null);
    const shadow=addShadow(scene,shadowTexture,data.kind==='unicorn'?.72:.51);
    scene.add(look.group);
    look.group.scale.setScalar(data.kind==='unicorn'?1.18:1);
    return {id,data,look,name,shadow,x,z,homeX:x,homeZ:z,radius,seed:i*1.71};
  });
  const locals=wild.flatMap((animal,i)=>{
    const {id,data,homeX:x,homeZ:z}=animal;
    if(id==='pearly'||id==='peach') return [];
    for(let j=0;j<8;j++){
      const angle=(i+j+1)*2.39996;
      const dx=Math.cos(angle),dz=Math.sin(angle);
      if(!safeGround(x+dx*3.2,z+dz*3.2)||!safeGround(x+dx,z+dz)) continue;
      const look=creature({...data,color:new T.Color(data.color)
        .lerp(new T.Color(data.accent),.26).getStyle()});
      look.group.scale.setScalar(data.kind==='unicorn'?.78:.82);
      scene.add(look.group);
      const shadow=addShadow(scene,shadowTexture,.38);
      const center={x:x+dx*.93,z:z+dz*.93,angle};
      animal.playmate={center,slot:0,seed:i*.29};
      return [{look,shadow,data,x:x+dx*2.12,z:z+dz*2.12,homeX:x+dx*2.12,homeZ:z+dz*2.12,
        radius:1.1,seed:i*.68,playmate:{center,slot:1,seed:i*.29},ambient:true,host:id}];
    }
    return [];
  });
  const resources=(valley?resourceSpots:horizonResources[realm]).flatMap(([id,x,z],i)=>{
    if(!safeGround(x,z)||(valley&&Math.hypot(x,z-10)<2.9)||residents.some(v=>Math.hypot(x-v.x,z-v.z)<1.25)) return [];
    const model=(valley?null:horizonResource(realm,id,i*.4))??resourceModel(id,i*.4);
    model.position.set(x,terrainHeight(x,z)-.01,z);
    model.rotation.y=i*2.399;
    scene.add(model);
    return [{id,x,z,key:valley?'r'+i:realm+'-r'+i,model}];
  });

  const lootArt=createLootArt(scene,state,realm,terrainHeight,resources);
  const trail=createItemTrail(scene);
  let tracking=null,trackedSource=null,trailRoute=null,trailChecked=-1;
  const livePosition=actor=>actor?{x:actor.x,z:actor.z}:null;

  function trackingTarget(){
    if(tracking?.kind==='quest') return findQuestTarget(state,tracking.id,{resources,
      resident:id=>livePosition(agents.find(a=>a.data.id===id)),
      creature:id=>livePosition(wild.find(a=>a.id===id))
    });
    return tracking?findItemTarget(state,tracking.id,resources):null;
  }

  function syncTracking(){
    tracking=trackingSelection(state);
    trailRoute=null;trailChecked=-1;
    trackedSource=trackingTarget();
    trail.draw([]);
    return trackedSource;
  }

  function guideTo(source,flight){
    const end=worldPoint(source.realm,source.x,source.z);
    const target=regionPoint(realm,end.x,end.z);
    const traversable=(x,z)=>tryDirection(x,z,flight);
    return {end,traversable,route:trailPath(state.player,target,traversable)};
  }

  function trackingJourney(){
    if(!tracking) return null;
    const source=trackingTarget();
    if(!source?.realm||source.kind==='craft') return {source};
    const {end,route}=guideTo(source,state.transit?.mode==='fly');
    return {source,end,points:route.map(p=>worldPoint(realm,p.x,p.z))};
  }

  function updateItemTrail(t){
    if(!tracking) return;
    trail.tick(t);
    const p=state.player,flight=state.transit?.mode==='fly';
    if(t-trailChecked>=.4||trailRoute&&trailRoute.flight!==flight){
      trailChecked=t;
      const next=trackingTarget();
      const changed=next?.kind!==trackedSource?.kind||next?.id!==trackedSource?.id||next?.x!==trackedSource?.x||next?.z!==trackedSource?.z||next?.realm!==trackedSource?.realm;
      trackedSource=next;
      const routed=next?.realm&&next.kind!=='craft';
      const requiresFlight=routed&&(realm==='sky'||next.realm==='sky')&&
        (realm!==next.realm||regionAt(p.x,p.z,realm)!==regionAt(next.x,next.z,next.realm));
      callback.trackingTrail(tracking,next,routed?trackingDistance(state,next):0,requiresFlight&&!flight);
      if(!routed) trailRoute=null;
      else if(changed||!trailRoute||trailRoute.flight!==flight||Math.hypot(p.x-trailRoute.x,p.z-trailRoute.z)>=1.45){
        const groundAtTarget=next.realm===homeland?valleyHeight:stream.terrain[next.realm].height;
        const goalHeight=groundAtTarget(next.x,next.z)+(geography[next.realm].altitude??0)-altitude;
        trailRoute={...guideTo(next,flight),x:p.x,z:p.z,flight,goalHeight,rises:requiresFlight||next.realm==='sky'};
      }
    }
    if(!trailRoute){trail.draw([]);return;}
    const {route,traversable,goalHeight,rises}=trailRoute;
    const connected=connectTrail(p,route,traversable);
    if(!connected.length&&route.length>1) trailRoute=null;
    trail.draw(connected,(x,z,distance)=>{
      const surface=motionFloor(x,z);
      const guideY=flight?Math.max(surface+2.6,rises?y+T.MathUtils.clamp(goalHeight+3-y,-distance*.26,distance*.42):y)
        :waterSurface(x,z)??surface;
      return T.MathUtils.lerp(y,guideY,T.MathUtils.smoothstep(distance,0,1.5));
    });
  }
  function collectLoot(id){
    if(!active||paused||building||combat.isFighting()) return null;
    return pickUpLoot(state,realm,id);
  }

  function studyNearby(seen={}){
    if(!active||state.transit) return null;
    let nearest=null,distance=6;
    for(const a of wild){
      if(seen[a.id]||state.companions.includes(a.id)||!a.look.group.visible) continue;
      const d=Math.hypot(a.x-state.player.x,a.z-state.player.z);
      if(d<distance){nearest=a.id;distance=d;}
    }
    return nearest;
  }

  function propertyPreview(view){
    if(!valley) return '';
    const garden=view==='garden',x=garden?19.2:cloverCottage.x,z=garden?23.2:cloverCottage.z;
    const y=terrainHeight(x,z),previewCamera=new T.PerspectiveCamera(43,16/9,.1,camera.far);
    previewCamera.position.set(x+(garden?5:4.9),y+(garden?5.4:3.55),z+(garden?7:8.2));
    previewCamera.lookAt(x,y+(garden?.2:1.9),z);
    return takePostcard(previewCamera);
  }

  function takePostcard(view=camera){
    if(!active||contextLost||!renderer.domElement.width) return null;
    const input=renderer.domElement,output=document.createElement('canvas');
    const ctx=output.getContext('2d');
    if(!ctx) return null;
    output.width=384;output.height=216;
    const width=Math.min(input.width,input.height*16/9),height=width*9/16;
    const formerAspect=view.aspect;
    if(view!==camera){
      view.aspect=input.width/input.height;
      view.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(view.fov/2))*input.height/height));
      view.updateProjectionMatrix();
    }
    renderer.render(scene,view);
    view.aspect=formerAspect;
    ctx.drawImage(input,(input.width-width)/2,(input.height-height)/2,width,height,0,0,384,216);
    return output.toDataURL('image/jpeg',.78);
  }

  function blockKey(x,z,level) {return x+','+z+','+level;}
  function blockBase(x,z,level) {return terrainHeight(x*GRID,z*GRID)+level*GRID;}
  function placeBlock(data) {
    const {type,x,z,level,turn}=data;
    const display=buildPiece(type);
    display.position.set(x*GRID,blockBase(x,z,level),z*GRID);
    display.rotation.y=turn*Math.PI/2;
    scene.add(display);
    const proxy=new T.Mesh(parcelGeometry,proxyMat);
    proxy.position.copy(display.position).addScaledVector(up,GRID*.5);
    proxy.userData.block=data;
    scene.add(proxy);
    proxy.updateMatrixWorld(true);
    blockMap.set(blockKey(x,z,level),{data,display,proxy});
  }
  function removeBlock(data) {
    const key=blockKey(data.x,data.z,data.level), object=blockMap.get(key);
    if(object) {
      scene.remove(object.display,object.proxy);
      blockMap.delete(key);
    }
  }
  for(const block of state.blocks) if((block.realm??homeland)===realm) placeBlock(block);

  function updateOutfit() {
    const next=traveler(state.look);
    next.group.position.copy(player.group.position);
    next.group.rotation.copy(player.group.rotation);
    next.group.scale.copy(player.group.scale);
    indoorLayers(next.group);
    scene.remove(player.group);
    disposeHuman(player.group);
    scene.add(next.group);
    player=next;
    needsRender=true;
  }

  let portraitTarget;
  function drawOutfit(canvas,framing) {
    if(contextLost || !canvas) return;
    const {width,height}=canvas;
    portraitTarget??=new T.WebGLRenderTarget(width,height,{colorSpace:T.SRGBColorSpace,samples:4});
    const studio=new T.Scene();
    studio.background=new T.Color('#e9e0ec');
    studio.add(new T.HemisphereLight('#fff2e6','#a6a6ca',1.8));
    const key=new T.DirectionalLight('#fff0d2',2.65);
    key.position.set(-2,3,2);
    studio.add(key);
    const avatar=traveler(state.look);
    avatar.group.rotation.y=-.22;
    studio.add(avatar.group);
    const lens=new T.PerspectiveCamera(32,width/height,.1,30);
    if(framing==='face'){
      const center=state.look.morph===3?1.50:1.91;
      lens.position.set(.12,center+.04,state.look.morph===3?2.15:1.74);
      lens.lookAt(0,center,.02);
    }else{
      lens.position.set(.08,1.34,4.77);
      lens.lookAt(0,1.21,0);
    }
    const lastTarget=renderer.getRenderTarget();
    renderer.setRenderTarget(portraitTarget);
    renderer.render(studio,lens);
    const pixels=new Uint8Array(width*height*4);
    renderer.readRenderTargetPixels(portraitTarget,0,0,width,height,pixels);
    renderer.setRenderTarget(lastTarget);
    disposeHuman(avatar.group);
    const context=canvas.getContext('2d');
    const image=context.createImageData(width,height);
    for(let y=0;y<height;y++){
      const start=(height-1-y)*width*4;
      image.data.set(pixels.subarray(start,start+width*4),y*width*4);
    }
    context.putImageData(image,0,0);
  }

  function resize() {
    const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight);
    renderer.setSize(w,h,false);
    needsRender=true;
    camera.aspect=w/h;
    camera.fov=w/h<.8?72:54;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize',resize,options);
  resize();

  function syncBuddy() {
    if(buddyId===state.active) return;
    if(buddy) scene.remove(buddy.look.group,buddy.shadow);
    buddy=null;petAction=null;
    buddyId=state.active;
    if(!buddyId) return;
    const data=species[buddyId],look=creature(data);
    const shadow=addShadow(scene,shadowTexture,data.kind==='unicorn'?.69:.51);
    scene.add(look.group);
    indoorLayers(look.group);indoorLayers(shadow);
    buddy={look,shadow,x:state.player.x+1.3,z:state.player.z+1.7,seed:103};
  }

  const ball=part(scene,'fine','#eec888',0,0,0,.104,.104,.104);
  ball.visible=false;
  const spark=new T.Mesh(new T.SphereGeometry(.096,18,12),new T.MeshBasicMaterial({color:'#fff6ba'}));
  spark.visible=false;scene.add(spark);
  const glow=new T.PointLight('#fff0b6',0,11,1.35);
  scene.add(glow);
  let petAction=null,spellAction=null,scout=null;
  const scoutLabel=makeLabel(labels,'',null);
  scoutLabel.hidden=true;

  function companionAction(kind) {
    syncBuddy();
    if(!buddy) return false;
    const p=state.player;
    const tx=p.x-Math.sin(p.yaw)*3.85,tz=p.z-Math.cos(p.yaw)*3.85;
    petAction={kind,at:elapsed,x:p.x,z:p.z};
    if(kind==='play'&&safeGround(tx,tz)) Object.assign(petAction,{tx,tz});
    return true;
  }

  function introduceBuddy(){
    syncBuddy();
    if(!buddy) return null;
    const p=state.player;
    const nearby=wild.filter(animal=>!state.companions.includes(animal.id)&&Math.hypot(p.x-animal.x,p.z-animal.z)<9)
      .sort((a,b)=>Math.hypot(p.x-a.x,p.z-a.z)-Math.hypot(p.x-b.x,p.z-b.z))[0];
    if(!nearby) return null;
    petAction={kind:'meet',at:elapsed,animal:nearby};
    return nearby.data.name;
  }

  function scoutNearby() {
    const p=state.player;
    const candidate=resources.filter(r=>r.model.visible&&Math.hypot(r.x-p.x,r.z-p.z)>2.2)
      .sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];
    if(!candidate) return null;
    scout={target:candidate,until:elapsed+35};
    scoutLabel.lastElementChild.textContent=items[candidate.id][0];
    companionAction('scout');
    return {item:candidate.id,x:candidate.x,z:candidate.z};
  }

  function castEffect(kind) {
    spellAction={kind,at:elapsed};
  }

  function updateEffects(t) {
    const action=spellAction, p=state.player;
    const phase=action?t-action.at:0;
    const age=action?.kind==='lumos'?48:2.15;
    spark.visible=Boolean(action&&phase<age);
    glow.intensity=spark.visible?(action.kind==='lumos'?9:4)*Math.min(1,(age-phase)*2):0;
    if(spark.visible){
      spark.position.set(p.x+.42+Math.sin(t*1.9)*.14,y+1.98+Math.sin(t*2.6)*.13,p.z+.26);
      glow.position.copy(spark.position);
    }
    scoutLabel.hidden=true;
    if(scout&&t<scout.until&&scout.target.model.visible){
      const {target}=scout;
      v.set(target.x,terrainHeight(target.x,target.z)+1.12,target.z).project(camera);
      if(Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z<1&&v.z>-1) {
        scoutLabel.hidden=false;scoutLabel.style.left=(v.x*.5+.5)*100+'%';
        scoutLabel.style.top=(.5-v.y*.5)*100+'%';
      }
    }
  }

  function playerFloor(x,z){
    const room=roomAt(x,z);
    if(room) return terrainHeight(room.x,room.z)+roomFloorOffset;
    if(coastal&&state.player.belowDeck&&inHold(x,z)&&!atStairs(x,z)) return marigold.hold;
    return terrainHeight(x,z);
  }

  function floor(x,z) {
    let ground=playerFloor(x,z);
    for(let level=0;level<7;level++){
      const block=blockMap.get(blockKey(Math.round(x/GRID),Math.round(z/GRID),level));
      if(!block||!['plank','brick'].includes(block.data.type)) continue;
      const top=blockBase(block.data.x,block.data.z,level)+GRID;
      if(y>=top-.23) ground=top;
    }
    return ground;
  }

  function clearPath(x,z,feet=y) {
    if(!safeGround(x,z)||homestead?.blocks?.(x,z)) return false;
    const gx=Math.round(x/GRID),gz=Math.round(z/GRID);
    for(let level=0;level<7;level++) {
      const block=blockMap.get(blockKey(gx,gz,level));
      if(!block || !['plank','brick','fence'].includes(block.data.type)) continue;
      const bottom=blockBase(gx,gz,level), top=bottom+GRID;
      if(feet<top-.21&&feet+1.48>bottom+.1) return false;
    }
    return true;
  }

  function waterSurface(x,z){
    const p=worldPoint(realm,x,z), owner=groundRealmAt(p.x,p.z);
    if(!owner) return oceanLevel-altitude;
    if(owner==='valley'&&lakeValue(p.x,p.z)<.91) return -.43-altitude;
    const local=regionPoint(owner,p.x,p.z);
    if(owner==='silverrun'&&inRiver(local.x,local.z)) return riverLevel-altitude;
    if(owner==='silvercoast'){
      if(inCoastRiver(local.x,local.z)) return coastRiverY(local.z)-altitude;
      if(stream.groundHeight(x,z)+altitude<=seaHeight+.14) return seaHeight-altitude;
    }
    const basin=townWater(owner);
    if(basin&&Math.hypot((local.x-basin.x)/basin.rx,(local.z-basin.z)/basin.rz)<.95&&
      stream.groundHeight(x,z)+altitude<basin.level-.24) return basin.level-altitude;
    if(owner==='coast'&&local.x<-47&&stream.groundHeight(x,z)<oceanLevel) return oceanLevel-altitude;
    if(owner==='hogwarts'&&Math.hypot((local.x-blackLake.x)/blackLake.rx,(local.z-blackLake.z)/blackLake.rz)<1&&
      stream.groundHeight(x,z)+altitude<blackLake.level-.30) return blackLake.level-altitude;
    if(owner==='coast'||owner==='delta'){
      const region=stream.terrain[owner];
      for(const [i,r] of region.places.entries()){
        const distance=owner==='coast'
          ? Math.hypot(local.x-r.x-3,local.z-r.z+8)/(4.8+i)
          : Math.hypot((local.x-r.x-1)/6.3,(local.z-r.z+8)/4.7);
        if(distance<.96&&stream.groundHeight(x,z)<region.waterLine-.26) return region.waterLine-altitude;
      }
    }
    return null;
  }

  function skyFloor(x,z){
    const p=worldPoint(realm,x,z),s=regionPoint('sky',p.x,p.z);
    const island=stream.terrain.sky;
    return island.walkable(s.x,s.z)?island.height(s.x,s.z)+geography.sky.altitude-altitude:null;
  }

  function motionFloor(x,z){
    if(realm==='sky'&&walkable(x,z)) return floor(x,z);
    const p=worldPoint(realm,x,z);
    if(groundRealmAt(p.x,p.z)===realm) return floor(x,z);
    return stream.groundHeight(x,z);
  }

  function tryDirection(x,z,flight){
    const p=worldPoint(realm,x,z);
    if(Math.abs(p.x)>worldBounds||Math.abs(p.z)>worldBounds) return false;
    if(flight) return true;
    if(coastal&&!canMoveOnShip(state.player,x,z,Boolean(pierAt(x,z)))) return false;
    if(realm==='sky') return clearPath(x,z);
    const owner=groundRealmAt(p.x,p.z);
    if(owner==='valley'&&lakeValue(p.x,p.z)<1.01) return true;
    if(waterSurface(x,z)!==null||owner!==realm) return true;
    const bounds=geography[realm];
    if(Math.abs(x)>bounds.rx-4||Math.abs(z)>bounds.rz-4) return true;
    if(walkInRooms.length){
      // Keep fast movement from skipping over a thin doorway jamb.
      const start=state.player;
      const steps=Math.ceil(Math.hypot(x-start.x,z-start.z)/.20);
      for(let i=1;i<steps;i++){
        const t=i/steps;
        if(!clearPath(T.MathUtils.lerp(start.x,x,t),T.MathUtils.lerp(start.z,z,t))) return false;
      }
    }
    return clearPath(x,z);
  }

  function atTowerDoor(){
    const {x,z}=state.player;
    return valley&&!state.transit&&state.homestead.owned&&state.homestead.extensions.wizardTower&&
      Math.abs(x-wizardTowerPoint[0])<1.06&&z>=towerDoorZ-.84&&z<=towerDoorZ+.19;
  }

  function leaveWizardTower(){
    if(!active||paused||building||state.transit||!valley||
      (propertyArea(state.player,realm,state.homestead)!=='wizardTower'&&!atTowerDoor()))return false;
    // A returning player's construction can occupy the porch. Find clear ground on the yard side.
    for(let depth=1.8;depth<=10;depth+=.6){
      for(const side of [0,-.7,.7,-1.4,1.4,-2.1,2.1]){
        const x=wizardTowerPoint[0]+side,z=towerDoorZ+depth;
        if(!clearPath(x,z,playerFloor(x,z))||waterSurface(x,z)!==null||propertyArea({x,z},realm,state.homestead))continue;
        // Frame the doorway from the yard so the tower wall cannot hide the player.
        Object.assign(state.player,{x,z,yaw:0});keys.clear();resetCamera();
        return true;
      }
    }
    return false;
  }

  function toggleFlight(){
    if(!active||paused||building||insideRoom()||homestead?.inside?.(state.player.x,state.player.z)) return;
    if(coastal&&state.player.belowDeck&&!state.transit) return;
    if(state.transit?.mode==='fly'){landing=!landing;return;}
    const owned=state.companions.includes(state.active)&&canFly(species[state.active]);
    state.transit={mode:'fly',y:y+1.2,mount:owned?state.active:null};
    landing=false;
    y=state.transit.y;grounded=false;
  }

  function movePlayer(dt,t) {
    const p=state.player;
    const zBefore=p.z;
    const flight=state.transit?.mode==='fly',swim=state.transit?.mode==='swim';
    let x=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
    let z=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
    const moving=Boolean(x||z);
    const yaw=p.yaw;
    const cx=Math.cos(yaw),sx=Math.sin(yaw);
    combat.direction(moving?Math.atan2(x*cx+z*sx,-x*sx+z*cx):null);
    if(moving) {
      const length=Math.hypot(x,z);
      const boost=keys.has('shift');
      const speed=(flight?(state.transit.mount?(boost?29:20):(boost?24:16)):swim?(boost?7:5):insideRoom()?3.55:boost?8.1:5.2)*dt*(state.transit?1:combat.moveMultiplier());
      x=x/length*speed;z=z/length*speed;
      const dx=x*cx+z*sx,dz=-x*sx+z*cx;
      if(tryDirection(p.x+dx,p.z,flight)) p.x+=dx;
      if(tryDirection(p.x,p.z+dz,flight)) p.z+=dz;
      else if(dz>0&&atTowerDoor()&&Math.abs(dx)<dz*.65){
        // Slide past the jamb when approaching the opening slightly off-centre.
        const offset=wizardTowerPoint[0]-p.x;
        if(Math.abs(offset)>=homesteadDoorHalfWidth){
          const toward=p.x+Math.sign(offset)*Math.min(Math.abs(offset),dz);
          if(tryDirection(toward,p.z,false))p.x=toward;
        }
      }
      if(!combat.target){
        const aim=Math.atan2(dx,dz);
        player.group.rotation.y+=deltaAngle(player.group.rotation.y,aim)*Math.min(dt*12,1);
      }
    }
    if(!flight&&!swim)combat.movementImpulse(dt,(x,z)=>tryDirection(x,z,false));
    if(coastal&&!flight&&!swim) switchDeck(p,zBefore);
    const point=worldPoint(realm,p.x,p.z),owner=groundRealmAt(point.x,point.z);
    const surface=waterSurface(p.x,p.z), f=motionFloor(p.x,p.z);
    const island=skyFloor(p.x,p.z);
    let arrived=null;
    if(flight){
      const before=y;
      const up=keys.has(' '),down=keys.has('x')||landing;
      if(up) landing=false;
      y+=((up?10.8:0)-(down?9.2:0))*dt;
      const base=surface===null?f:Math.max(surface,f);
      const buildingBelow=roomAt(p.x,p.z);
      const rooftop=buildingBelow&&(buildingBelow.kind==='regional'?base+8.6:buildingBelow.stories
        ?base+2.17+(buildingBelow.stories-1)*2.03+buildingBelow.width*.48+.55:base+22.5);
      if(island!==null&&before>=island-.16&&y<=island+.06&&down){
        y=island;grounded=true;landing=false;state.transit=null;
        if(realm!=='sky') arrived='sky';
      } else if(buildingBelow&&down&&y<rooftop){
        y=before;landing=false;state.transit.y=y;
      } else if(y<base+.42){
        y=base+(surface===null?0:-1.24);
        grounded=surface===null;landing=false;
        state.transit=surface===null?null:{mode:'swim',y};
      } else {
        y=Math.min(y,96-altitude);
        state.transit.y=y;
      }
      if(!arrived&&realm==='sky'&&
          (y+altitude<40 || Math.abs(p.x)>geography.sky.rx||Math.abs(p.z)>geography.sky.rz)) arrived=owner??nearestGround(point.x,point.z);
      if(!arrived&&realm!=='sky'&&owner&&owner!==realm) arrived=owner;
    } else if(realm!=='sky'&&surface!==null) {
      y=surface-1.24+Math.sin(t*5)*.045;
      state.transit={mode:'swim',y};
      grounded=false;speedY=0;
    } else {
      state.transit=null;
      if(swim){y=f;grounded=true;speedY=0;}
      if(grounded&&f>y-.27)y=f;
      else {
        speedY-=19*dt;y+=speedY*dt;grounded=false;
        if(y<=f){y=f;speedY=0;grounded=true;}
      }
    }
    if(!arrived&&!flight&&realm!=='sky'&&owner&&owner!==realm) arrived=owner;
    if(arrived){
      const local=regionPoint(arrived,point.x,point.z),nextAltitude=geography[arrived].altitude??0;
      const transit=state.transit?.mode==='fly'||state.transit?.mode==='swim'
        ? {...state.transit,y:y+altitude-nextAltitude}:null;
      callback.cross(arrived,{...p,...local},transit,[...keys],{pitch,distance});
      return true;
    }

    const inFlight=state.transit?.mode==='fly';
    const swimming=state.transit?.mode==='swim';
    wakeMesh.visible=swimming;
    if(swimming){
      wakeMesh.position.set(p.x,surface+.019,p.z);
      wakeMesh.scale.setScalar(.69+.13*Math.sin(t*5));
    }
    player.group.position.set(p.x,y,p.z);
    playerShadow.position.set(p.x,f+.022,p.z);
    playerShadow.material.opacity=inFlight||swimming?0:grounded?.28:.17;
    animate(player,t,moving&&grounded);
    for(const leg of player.legs) leg.rotation.z=0;
    if(swimming){
      player.arms.forEach((arm,index)=>{arm.rotation.x=-.75+Math.sin(t*5.5+index*Math.PI)*.65;});
    }
    if(inFlight&&state.transit.mount&&state.transit.mount!==mountId){
      if(flightMount) scene.remove(flightMount.group);
      mountId=state.transit.mount;
      flightMount=creature({...species[mountId],flight:true});
      flightMount.group.scale.setScalar(2.03);scene.add(flightMount.group);
    }
    if(flightMount) flightMount.group.visible=Boolean(inFlight&&state.transit.mount);
    if(flightMount?.group.visible){
      flightMount.group.position.set(p.x,y-.66,p.z);flightMount.group.rotation.y=player.group.rotation.y;
      animate(flightMount,t*1.7,true);
      player.group.position.y+=.60;
      for(const [i,leg] of player.legs.entries()){leg.rotation.x=-.52;leg.rotation.z=i===0?-.35:.35;}
      for(const arm of player.arms) arm.rotation.x=-.58;
    }
    player.angelWings?.forEach((wing,i)=>{
      const side=i===0?-1:1;
      wing.rotation.y=side*(inFlight?Math.sin(t*10)*.56:.27+Math.sin(t*1.9)*.10);
      wing.rotation.z=side*(inFlight?Math.cos(t*10)*.13:.20);
    });
    kite.visible=inFlight&&!state.transit.mount&&state.look.morph!==2;
    if(kite.visible){
      kite.position.set(p.x,y+2.32,p.z);
      kite.rotation.set(0,player.group.rotation.y,Math.sin(t*2.3)*.10);
      for(const arm of player.arms) arm.rotation.x=-1.85;
    }
    return false;
  }

  function cameraUpdate(dt,snap=false) {
    const p=state.player;
    const aspect=camera.aspect;
    const room=insideRoom()??(!building&&!state.transit?homestead?.cameraRoom?.(p.x,p.z):null)??null;
    if(room!==cameraRoom){
      cameraRoom=room;
      camera.layers.set(room?.layer??0);
      scene.background=room?roomBackdrop:null;
      renderer.domElement.setAttribute('aria-label',room
        ?'Cutaway room view. Drag to rotate. Scroll to zoom.'
        :'3D view. Drag to look around.');
      roomZoom=aspect<.76?.86:1;
      snap=true;
    }
    if(room){
      const delta=p.yaw-room.yaw,c=Math.abs(Math.cos(delta)),s=Math.abs(Math.sin(delta));
      const projectedWidth=room.width*c+room.depth*s;
      const projectedDepth=room.width*s+room.depth*c;
      const fit=Math.max(projectedWidth/Math.max(.38,aspect),projectedDepth*.88,room.kind==='homestead'?5.2:0);
      const distance=(fit*1.06+1.4)*(room.kind==='regional'?1.13:1)*roomZoom;
      const ground=terrainHeight(room.x,room.z);
      const tx=T.MathUtils.lerp(room.x,p.x,.13),tz=T.MathUtils.lerp(room.z,p.z,.13);
      ideal.set(tx+Math.sin(p.yaw)*distance*.38,ground+distance,tz+Math.cos(p.yaw)*distance*.38);
      camera.position.lerp(ideal,snap?1:1-Math.exp(-dt*12));
      camera.lookAt(tx,ground+.37,tz);camera.updateMatrixWorld();
      player.group.visible=true;
      if(buddy){
        const gap=Math.hypot(buddy.x-p.x,buddy.z-p.z);
        buddy.roomHidden=gap<(buddy.roomHidden?1.23:.96);
        const visible=inRoom(room,buddy.x,buddy.z)&&!buddy.roomHidden;
        buddy.look.group.visible=visible;buddy.shadow.visible=visible;
      }
      return;
    }
    const inFlight=state.transit?.mode==='fly';
    const shipInterior=coastal&&(p.belowDeck||atStairs(p.x,p.z))&&y<marigold.deck-.48;
    const interior=!inFlight&&(homestead?.inside?.(p.x,p.z)||shipInterior);
    const shipDeck=!inFlight&&coastal&&onMarigold(p.x,p.z);
    const fighting=combat.isFighting();
    const opponent=!inFlight&&!building&&elapsed>=freeLookUntil&&!gesture?combat.target:null;
    const meleeCamera=opponent?1-T.MathUtils.smoothstep(Math.hypot(opponent.x-p.x,opponent.z-p.z),1.8,4.4):0;
    if(opponent){
      const heading=Math.atan2(p.x-opponent.x,p.z-opponent.z);
      p.yaw+=deltaAngle(p.yaw,heading)*Math.min(1,dt*3.85);
    }
    const camDist=(shipInterior?2.45:interior?1.75:shipDeck?Math.min(distance,5.9):inFlight?distance*1.45:fighting?distance*.88:distance)*(aspect<.83?1.10:1);
    const angle=interior||shipDeck?Math.min(pitch,.22):building?Math.max(pitch,.37):inFlight?Math.max(pitch,.42):fighting?Math.max(pitch,.34+.13*meleeCamera):pitch;
    const horizontal=Math.cos(angle)*camDist;
    const sx=Math.sin(p.yaw),sz=Math.cos(p.yaw);
    const shoulder=shipInterior?.29:interior?0:building?(aspect<.85?1.05:1.93):fighting?.76+2.15*meleeCamera:0;
    const cityCamera=inSpirehaven(p)&&!building;
    const structureCamera=(realm==='silvercoast'||cityCamera||walkInRooms.some(room=>Math.hypot(p.x-room.x,p.z-room.z)<22))&&!building;
    let fraction=1;
    if(!inFlight&&(fighting||interior||valley&&!building||structureCamera)){
      for(let i=0;i<=(cityCamera?17:9);i++){
        const sample=cityCamera?.06+i*.055:.19+i*.09;
        const x=p.x+sx*horizontal*sample+sz*shoulder,z=p.z+sz*horizontal*sample-sx*shoulder;
        const cameraY=y+1.37+Math.sin(angle)*camDist*sample;
        const cottage=valley&&homes.some(([px,pz,,,,scale])=>
          Math.abs(x-px)<2.82*scale&&Math.abs(z-pz)<2.56*scale&&cameraY<terrainHeight(px,pz)+3.9*scale);
        const structure=structureCamera&&!landscape.isClear(x,z)&&cameraY<terrainHeight(x,z)+(cityCamera?7.4:6.25);
        if(cottage||structure||shipInterior&&!inHold(x,z)||homestead?.blocks?.(x,z)||fighting&&!interior&&!safeGround(x,z)){
          fraction=cityCamera?Math.max(.026,sample-.10):Math.max(.18,sample-.13);
          break;
        }
      }
    }
    const height=y+1.37+Math.sin(angle)*camDist*Math.max(.56,fraction);
    const camX=p.x+sx*horizontal*fraction+sz*shoulder,camZ=p.z+sz*horizontal*fraction-sx*shoulder;
    ideal.set(camX,shipInterior?Math.min(height,marigold.deck-.30):Math.max(height,terrainHeight(camX,camZ)+1.65),camZ);
    const lookAhead=interior?1.35:building?2.35:aspect<.85?1.75:3.25;
    const lookUp=interior||building||fighting?0:Math.max(0,-pitch)*18;
    const lookHeight=(inFlight?-1.5:interior?1.43:building?.68:fighting?1.64:2.08)+lookUp+
      (cityCamera&&!inFlight?1.62*Math.min(1,fraction*2.4):0);
    target.set(p.x-sx*lookAhead+sz*shoulder,y+lookHeight,p.z-sz*lookAhead-sx*shoulder);
    if(opponent){
      const gap=Math.hypot(opponent.x-p.x,opponent.z-p.z);
      const reach=Math.min(gap*.34,3.7);
      const toward=Math.atan2(opponent.x-p.x,opponent.z-p.z);
      const bias=shoulder*(1-.9*meleeCamera);
      target.set(p.x+Math.sin(toward)*reach+sz*bias,y+lookHeight,p.z+Math.cos(toward)*reach-sx*bias);
    }
    camera.position.lerp(ideal,snap?1:1-Math.exp(-dt*11));
    player.group.visible=!cityCamera||inFlight||Math.hypot(camera.position.x-p.x,camera.position.z-p.z)>1.7;
    camera.lookAt(target);
    camera.updateMatrixWorld();
  }

  function stepActor(actor,x,z,speed,dt){
    const dx=x-actor.x,dz=z-actor.z,d=Math.hypot(dx,dz);
    if(d<.13) return false;
    const step=Math.min(speed*dt,d);
    const nx=actor.x+dx*step/d,nz=actor.z+dz*step/d;
    if(!clearPath(nx,nz,terrainHeight(actor.x,actor.z))) return false;
    actor.x=nx;actor.z=nz;
    return true;
  }

  function updateActors(t,dt) {
    const p=state.player;
    for(const actor of agents) {
      const {look,seed,data,stops}=actor;
      const stop=stops[dailyActivity(state.time)];
      const distance=Math.hypot(p.x-actor.x,p.z-actor.z);
      const near=distance<4.3;
      look.group.visible=Math.min(distance,Math.hypot(p.x-stop.x,p.z-stop.z))<41;
      if(!look.group.visible) continue;
      const moving=!near&&stepActor(actor,stop.x,stop.z,1.42,dt);
      const orientation=near?Math.atan2(p.x-actor.x,p.z-actor.z):
        moving?Math.atan2(stop.x-actor.x,stop.z-actor.z):Math.sin(t*.45+seed)*.5;
      look.group.rotation.y+=deltaAngle(look.group.rotation.y,orientation)*Math.min(dt*6,1);
      look.group.position.set(actor.x,terrainHeight(actor.x,actor.z),actor.z);
      actor.activity=moving?'Walking to the next stop':stop.activity;
      if(!moving&&state.time<10.5&&realm==='valley'&&data.id==='poppy') actor.activity='Greeting travelers';
      animate(look,t+seed,moving);
      look.head.rotation.x=0;
      workPose(actor,moving,t+seed);
    }
    for(const animal of [...wild,...locals]) {
      const {id,look,shadow,seed,radius,homeX,homeZ,playmate,ambient}=animal;
      const visible=(ambient||!state.companions.includes(id))&&Math.hypot(p.x-homeX,p.z-homeZ)<39;
      look.group.visible=visible; shadow.visible=visible;
      if(!visible) continue;
      const meet=petAction?.kind==='meet'&&petAction.animal===animal&&t-petAction.at<5.2&&buddy;
      const close=meet||!ambient&&Math.hypot(p.x-animal.x,p.z-animal.z)<2.78;
      const partnerAvailable=playmate&&!(ambient&&state.companions.includes(animal.host));
      const style=partnerAvailable?playStyle(t,playmate.seed):null;
      const rest=!close&&style?.kind==='Resting together';
      let sx=homeX+Math.sin(t*.46+seed)*radius,sz=homeZ+Math.sin(t*.33+seed*.7)*radius*.68;
      if(style) [sx,sz]=playPosition(style,playmate.slot,playmate.center);
      const moving=!close&&stepActor(animal,sx,sz,style?.kind==='Playing chase'?3.15:1.55,dt);
      animal.activity=meet?'Greeting your companion':close?'Watching you':style?.kind??'Exploring';
      let aim=meet?Math.atan2(buddy.x-animal.x,buddy.z-animal.z):close?Math.atan2(p.x-animal.x,p.z-animal.z):Math.atan2(sx-animal.x,sz-animal.z);
      if(!close&&style?.kind==='Greeting'&&!moving) aim=Math.atan2(playmate.center.x-animal.x,playmate.center.z-animal.z);
      if(id==='pearly'&&t<8&&!close) aim=-.51;
      look.group.rotation.y+=deltaAngle(look.group.rotation.y,aim)*Math.min(dt*7,1);
      sitActor(animal,t,moving);
      look.model.scale.y=rest?.79:1;
      look.head.rotation.x=rest?.21:style?.kind==='Greeting'&&!moving?Math.sin(t*4+seed)*.12:0;
      if(meet&&t-petAction.at>2) look.model.position.y+=Math.max(0,Math.sin(t*5))*.26;
      if(!close&&style?.kind==='Playing chase'&&moving)
        look.model.position.y+=Math.max(0,Math.sin(t*6+seed))*.23;
    }
    ball.visible=false;
    if(buddy){
      buddy.look.group.visible=!state.transit||state.transit.mount!==buddyId;
      buddy.shadow.visible=buddy.look.group.visible;
      const history=state.care[buddyId];
      const resting=history?.resting;
      const dx=buddy.x-p.x,dz=buddy.z-p.z,range=Math.hypot(dx,dz);
      if(range>15) {buddy.x=p.x+1.3;buddy.z=p.z+1.7;}
      const side=building?-1.63:1.41;
      followTarget={x:p.x+Math.cos(p.yaw)*side+Math.sin(p.yaw)*1.65,z:p.z-Math.sin(p.yaw)*side+Math.cos(p.yaw)*1.65};
      if(!safeGround(followTarget.x,followTarget.z)){
        followTarget={x:p.x-Math.cos(p.yaw)*1.32,z:p.z+Math.sin(p.yaw)*1.32};
        if(!walkable(followTarget.x,followTarget.z)) followTarget={x:p.x,z:p.z};
      }
      const since=petAction?t-petAction.at:0;
      const fetch=petAction?.kind==='play'&&petAction.tx!==undefined&&since<2.35;
      if(resting) followTarget={x:buddy.x,z:buddy.z};
      else if(fetch) {
        const {x,z,tx,tz}=petAction;
        const fly=Math.min(1,since/.54);
        followTarget={x:tx,z:tz};
        ball.visible=true;
        ball.position.set(x+(tx-x)*fly,terrainHeight(tx,tz)+.15+Math.sin(fly*Math.PI)*1.28,z+(tz-z)*fly);
      }else if(petAction?.kind==='meet'&&since<5.2&&!state.companions.includes(petAction.animal.id)){
        const friend=petAction.animal;
        const distance=Math.max(.001,Math.hypot(p.x-friend.x,p.z-friend.z));
        const x=friend.x+(p.x-friend.x)/distance*1.08,z=friend.z+(p.z-friend.z)/distance*1.08;
        if(safeGround(x,z)) followTarget={x,z};
      }else if(petAction&&since<1.8&&['pet','feed'].includes(petAction.kind)){
        followTarget={x:p.x+.87,z:p.z+.72};
      }
      const gap=Math.hypot(followTarget.x-buddy.x,followTarget.z-buddy.z);
      const step=Math.min(dt*7.5,gap);
      if(gap>.23){
        const angle=Math.atan2(followTarget.x-buddy.x,followTarget.z-buddy.z);
        buddy.x+=Math.sin(angle)*step;buddy.z+=Math.cos(angle)*step;
        buddy.look.group.rotation.y+=deltaAngle(buddy.look.group.rotation.y,angle)*Math.min(dt*8,1);
      }else buddy.look.group.rotation.y+=deltaAngle(buddy.look.group.rotation.y,player.group.rotation.y)*Math.min(dt*3,1);
      sitActor(buddy,t,gap>.46);
      if(resting){
        buddy.look.model.position.y*=.44;
        buddy.look.model.scale.y=.76;
        buddy.look.head.rotation.x=.17;
      } else {
        buddy.look.model.scale.y=1;
        buddy.look.head.rotation.x=petAction&&since<1.8?Math.sin(since*5)*.20:0;
        if(petAction?.kind==='meet'&&since<5.2&&since>2&&gap<.62){
          const friend=petAction.animal;
          buddy.look.group.rotation.y+=deltaAngle(buddy.look.group.rotation.y,Math.atan2(friend.x-buddy.x,friend.z-buddy.z))*Math.min(dt*8,1);
          buddy.look.model.position.y+=Math.max(0,Math.sin(t*5+1.8))*.28;
        }
        if(petAction&&since<1.15&&['pet','play'].includes(petAction.kind))
          buddy.look.model.position.y+=Math.abs(Math.sin(since*5))*Math.max(0,.31-since*.12);
      }
    }
  }

  function sitActor(actor,t,moving) {
    const y=terrainHeight(actor.x,actor.z);
    actor.look.group.position.set(actor.x,y,actor.z);
    actor.shadow.position.set(actor.x,y+.035,actor.z);
    animate(actor.look,t+actor.seed,moving);
  }

  function interaction() {
    if(!active || paused || building || combat.isFighting() || state.transit?.mode==='fly') return null;
    const p=state.player;
    const distance=(x,z)=>Math.hypot(x-p.x,z-p.z);
    const room=insideRoom();
    if(room){
      const candidates=room.stations.flatMap(station=>{
        const d=distance(...roomPoint(room,station.x,station.z));
        if(d>1.18||(station.kind==='dial'&&state.spirehaven.aligned)) return [];
        const hint=station.kind==='dial'?'Set to '+dialFaces[state.spirehaven.dials[station.id]??0]:station.hint;
        const completed=station.kind==='activity'&&(state.roomActivities[room.id]??0)===room.activity.steps.length;
        return [{d,kind:'walk-in-room',room,station,label:station.label,hint:completed?'Completed':hint}];
      });
      return candidates.sort((a,b)=>a.d-b.d)[0]??null;
    }
    const candidates=[];
    if(ward){
      const target=course[relayIndex],[x,z]=relayPosts[target];
      if(distance(x,z)<3)candidates.push({d:-2,kind:'ward-relay',label:relayIndex?'Light the '+relayNames[target].toLowerCase():'Start the lantern run',
        hint:relayIndex?ward.title:'Light four lanterns in 65 seconds · 10 Suncoins'});
    }
    if(state.trails[realm]===2&&newRegions[realm]){
      const region=newRegions[realm];
      if(distance(...landmarkPoint(region))<5.4) candidates.push({d:-.9,kind:'trail-landmark',label:'Examine the carvings',hint:region.landmark});
    }
    for(const cave of caves){
      const d=distance(...cavePoints(cave,0,.8));
      if(d<2) candidates.push({d:d*.24,kind:'dungeon',id:cave.id,label:'Enter '+cave.name,hint:'Explore the underground passages'});
    }
    const homeRoom=valley&&propertyArea(p,realm,state.homestead);
    if(atTowerDoor())return {kind:'tower-exit',label:'Leave tower',hint:'Cottage yard'};
    if(homeRoom&&Object.hasOwn(extensions,homeRoom)){
      const room=extensions[homeRoom];
      const d=distance(...homesteadServicePoint(homeRoom));
      if(d<1.6) candidates.push({d:d*.21,kind:'homestead-room',id:homeRoom,label:room.service,hint:room.name});
    }
    const loot=nearbyLoot(state,realm);
    if(loot) candidates.push({d:-2,kind:'loot',id:loot.id,label:'Pick up bandit loot',
      hint:[loot.coins?loot.coins+' Suncoins':'',...Object.entries(loot.items).map(([item,count])=>count+'× '+items[item]?.[0])].filter(Boolean).join(' · ')});
    const source=trackedSource?.realm===realm?trackedSource:null;
    const stock=source?.stock??source?.ingredient??(tracking?.kind==='item'?tracking.id:null);
    if(source?.kind==='spell'&&distance(source.x,source.z)<4.3&&state.magic.known.includes(source.id)){
      candidates.push({d:-3,kind:'tracking-spell',id:source.id,label:'Cast '+source.label,hint:'Practice the tracked spell'});
    }
    if(source?.kind==='harvest'&&distance(source.x,source.z)<1.9){
      candidates.push({d:-.8,kind:'tracked-crop',id:source.id,label:'Tend this garden bed',hint:items[stock][0]});
    }
    if(source?.kind==='shop'&&distance(source.x,source.z)<1.8){
      candidates.push({d:-.8,kind:'store',id:source.id,label:'Browse '+source.label,hint:'Stocks '+items[stock][0].toLowerCase()});
    }
    if(source&&['farm','kitchen'].includes(source.kind)&&distance(source.x,source.z)<2.2){
      candidates.push({d:-.8,kind:'tracking-'+source.kind,id:source.id,label:source.kind==='kitchen'?'Open the kitchen':'Open the homestead',hint:source.label});
    }
    const cache=callback.cacheAt?.(p,realm);
    if(cache) candidates.push({d:-1,...cache});
    const station=townServiceAt(realm,p.x,p.z,2.25);
    if(station&&!regionalRoomById(station.id)) candidates.push({d:.24+distance(station.x,station.z)*.24,
      kind:'town',id:station.id,label:'Enter '+station.name,hint:'Use this town service'});
    for(const a of agents) {
      const d=distance(a.x,a.z);
      if(d<3.48){
        const tracked=source?.kind==='quest-npc'&&source.id===a.data.id;
        candidates.push({d:tracked?-3:d<1.62?d*.12:d,kind:'npc',id:a.data.id,label:'Talk to '+a.data.name,
          hint:tracked&&source.phase==='turn-in'?'Ready to turn in · '+tracking.title:a.activity+' · '+a.data.role});
      }
    }
    for(const a of wild) {
      if(state.companions.includes(a.id)) continue;
      const d=distance(a.x,a.z);
      if(d<3.15) candidates.push({d:source?.kind==='creature'&&source.id===a.id?-3:d,kind:'wild',id:a.id,label:'Offer '+items[a.data.favorite][0].toLowerCase(),hint:a.data.name+' · '+(state.bonds[a.id]??0)+'/'+a.data.trust+' trust'});
    }
    for(const [x,z] of gates){
      const d=distance(x,z);
      if(d<2.75) candidates.push({d,kind:'gate',label:realm==='sky'?'Board the wind ferry':'Open voyage atlas',hint:'Travel to another destination'});
    }
    for(const {x,z,name,place:id} of stores){
      const d=distance(x,z);
      if(d<1.85) candidates.push({d:d*.30,kind:'store',id,label:'Browse '+name,hint:'Buy supplies or sell stock'});
    }
    if(valley){
      const d=distance(cloverCottage.x+2.02,cloverCottage.z+4.5);
      if(d<2.25) candidates.push({d:d*.45,kind:'homestead',label:'Open '+cloverCottage.name,hint:'Furnish your home and tend your garden'});
    }
    for(const {id,name,point} of landmarks){
      const d=distance(...point);
      if(d<2.4&&!state.stamp[id]) candidates.push({d:source?.kind==='survey'&&source.id===id?-3:d,kind:'survey',id,label:'Survey trail marker',hint:name});
    }
    for(const a of resources) {
      const d=distance(a.x,a.z);
      if(d<2.15 && a.model.visible) candidates.push({d:source?.key===a.key?-.8:d+.21,kind:'resource',id:a.id,key:a.key,label:'Gather '+items[a.id][0].toLowerCase(),hint:'Add to your satchel'});
    }
    return candidates.sort((a,b)=>a.d-b.d)[0]??null;
  }

  function drawLabels() {
    const p=state.player;
    for(const actor of [...agents,...wild]) {
      const wildActor=Boolean(actor.id);
      const d=Math.hypot(actor.x-p.x,actor.z-p.z);
      if(paused||building||cameraRoom||!actor.look.group.visible||d>(wildActor?13:19)){
        actor.name.hidden=true;continue;
      }
      v.copy(actor.look.group.position);
      v.y+=wildActor?(actor.data.kind==='unicorn'?2.63:actor.data.kind==='sprite'?1.61:1.4):2.41*actor.look.group.scale.y;
      scratch.copy(v).sub(camera.position);
      camera.getWorldDirection(upDirection);
      if(scratch.dot(upDirection)<=0){actor.name.hidden=true;continue;}
      v.project(camera);
      actor.name.hidden=Math.abs(v.x)>1.1||Math.abs(v.y)>1.1||v.z>1;
      if(!actor.name.hidden) {
        actor.name.dataset.activity=actor.activity??'';
        actor.name.title=actor.activity??'';
        actor.name.style.left=(v.x*.5+.5)*100+'%';
        actor.name.style.top=(.5-v.y*.5)*100+'%';
        if (!wildActor) {
          const status=state.quests[actor.data.id];
          const mark=actor.name.firstElementChild;
          mark.textContent=status==='done'?'✓':status?'!':'·';
        }
      }
    }
  }
  const upDirection=new T.Vector3();

  const keyDirection=new T.Vector3();
  const dayBlue=new T.Color('#eaf1ff'),nightBlue=new T.Color('#abb8fa'),sunsetPeach=new T.Color('#ffc6a3');
  const warmDay=new T.Color('#ffe9c9'),moonBlue=new T.Color('#c2cdff'),goldenHour=new T.Color('#ffbd87');
  const fogDay=new T.Color('#c5dce1'),fogNight=new T.Color('#586283'),fogDusk=new T.Color('#cc9da8');
  function updateLighting() {
    const {time:t,player:p}=state;
    const {day,night,twilight}=skyLight(t);
    landscape.setDay(day,t);town?.update(t);
    hemi.intensity=.88+day*.63+twilight*.11;
    hemi.color.copy(nightBlue).lerp(dayBlue,day).lerp(sunsetPeach,twilight*.46);
    sun.intensity=.47+day*2.46+twilight*.31;
    sun.color.copy(moonBlue).lerp(warmDay,day).lerp(goldenHour,twilight*.77);
    sun.target.position.set(Math.round(p.x/4)*4,Math.round(y/4)*4,Math.round(p.z/4)*4);
    sunDirection(t,keyDirection);
    keyDirection.y=Math.max(.28,keyDirection.y);
    keyDirection.lerp(v.set(-.35,.62,-.72),night*.94).normalize();
    sun.position.copy(sun.target.position).addScaledVector(keyDirection,39);
    scene.fog.color.copy(fogNight).lerp(fogDay,day).lerp(fogDusk,twilight*.57);
  }

  function findPlacement(aim=screen) {
    ray.setFromCamera(aim,camera);
    const hits=ray.intersectObjects(Array.from(blockMap.values(),b=>b.proxy),false);
    const origin=ray.ray.origin,direction=ray.ray.direction;
    let prior=0, groundHit=null;
    for(let step=.35;step<28;step+=.35){
      const x=origin.x+direction.x*step,z=origin.z+direction.z*step;
      if(origin.y+direction.y*step<=terrainHeight(x,z)){
        let lo=prior,hi=step;
        for(let i=0;i<7;i++){
          const mid=(lo+hi)*.5;
          ray.ray.at(mid,scratch);
          if(scratch.y>terrainHeight(scratch.x,scratch.z)) lo=mid; else hi=mid;
        }
        groundHit={distance:hi,point:ray.ray.at(hi,new T.Vector3()),object:landscape.ground};
        break;
      }
      prior=step;
    }
    if(groundHit) {
      hits.push(groundHit);
      hits.sort((a,b)=>a.distance-b.distance);
    }
    const p=state.player;
    const hit=hits.find(h=>Math.hypot(h.point.x-p.x,h.point.z-p.z)<8.25 && h.point.y<y+7.3);
    if(!hit) return {place:null,block:null,valid:false};
    const block=hit.object.userData.block??null;
    let place;
    if(block) {
      const normal=hit.face.normal;
      place={x:block.x+Math.round(normal.x),z:block.z+Math.round(normal.z),level:block.level+Math.round(normal.y)};
    }else {
      place={x:Math.round(hit.point.x/GRID),z:Math.round(hit.point.z/GRID),level:0};
    }
    const xx=place.x*GRID,zz=place.z*GRID;
    const below=place.level>0&&blockMap.get(blockKey(place.x,place.z,place.level-1));
    const valid=place.level>=0&&place.level<=6&&safeGround(xx,zz)&&!roomAt(xx,zz)&&!(coastal&&onShip(xx,zz))
      &&(place.level===0||below&&['plank','brick'].includes(below.data.type))
      &&!blockMap.has(blockKey(place.x,place.z,place.level))
      &&Math.hypot(xx-p.x,zz-p.z)>.94
      &&(state.inventory[selected]??0)>0;
    return {place,block,valid:Boolean(valid)};
  }

  function buildPreview() {
    if(!building||paused){
      if(preview) preview.visible=false;
      edgeLines.visible=false;return;
    }
    if(previewType!==selected) {
      if(preview) scene.remove(preview);
      preview=buildPiece(selected);
      preview.traverse(o=>{if(o.isMesh) {o.material=ghostGood;o.castShadow=false;o.receiveShadow=false;}});
      scene.add(preview);previewType=selected;
    }
    const aim=mouseAim?pointer:screen;
    const {place,valid}=findPlacement(aim);
    preview.visible=Boolean(place&&place.level>=0);
    edgeLines.visible=preview.visible;
    if(preview.visible){
      preview.rotation.y=rotation*Math.PI/2;
      preview.position.set(place.x*GRID,blockBase(place.x,place.z,place.level),place.z*GRID);
      edgeLines.position.copy(preview.position).addScaledVector(up,.6);
      preview.traverse(o=>{if(o.isMesh) o.material=valid?ghostGood:ghostBad;});
      edgeLines.material.color.set(valid?'#f8ffbf':'#f2bbcd');
    }
    callback.aim(valid,50+aim.x*50,50-aim.y*50);
  }

  function tryBlock(remove,aim=screen) {
    if(!building||paused) return;
    const {place,block,valid}=findPlacement(aim);
    if(remove) {
      if(!block) return;
      const above=blockMap.has(blockKey(block.x,block.z,block.level+1));
      if(above) callback.blockError('Remove the piece above it first.');
      else callback.remove(block);
    } else if(valid) callback.place({...place,type:selected,turn:rotation,...(valley?{}:{realm})});
    else if(!(state.inventory[selected]>0)) callback.blockError('Craft more at your bench first.');
  }

  let frameId;
  function frame(ms) {
    frameId=requestAnimationFrame(frame);
    if(!active||contextLost) {lastFrame=ms;return;}
    if(ms-lastFrame<13 || paused&&!needsRender) return;
    const dt=Math.min((ms-lastFrame)/1000,.11)||.016;
    lastFrame=ms;
    if(!paused){
      elapsed+=dt;updateRelay();
      state.time=(state.time+dt*.038)%24;
      if(movePlayer(dt,elapsed)) return;
      if(!building&&!state.transit&&grounded&&!combat.isFighting()){
        callback.inspectProperty?.(state.player,realm);
        if(paused) return;
      }
      syncBuddy();
      updateActors(elapsed,dt);
      const now=Date.now();
      const p=state.player;
      for(const a of resources) {
        a.model.visible=!(state.harvested[a.key]>now)&&Math.hypot(p.x-a.x,p.z-a.z)<32;
      }
      cameraUpdate(dt);
      doorSignals.update(elapsed,p,camera);
      homestead?.update?.();
      combat.update(dt,{actor:player,buddy,camera,eligible:!building&&grounded});
      lootArt.update(elapsed,p,camera,combat.isFighting());
      updateItemTrail(elapsed);
      landscape.update(elapsed,p,state.time);
      stream.update(state.time,elapsed);
      updateEffects(elapsed);
      const region=regionAt(p.x,p.z,realm);
      callback.region(region);
    }
    if(elapsed-prevSun>.42){prevSun=elapsed;updateLighting();}
    if(elapsed-prevUi>.085||paused){
      prevUi=elapsed;drawLabels();
      callback.update(interaction(),elapsed,landing,cameraRoom);
    }
    buildPreview();
    renderer.render(scene,camera);
    needsRender=false;
  }

  function resetCamera() {
    const p=state.player;
    y=state.transit?.y??playerFloor(p.x,p.z); grounded=!state.transit;speedY=0;
    player.group.position.set(p.x,y,p.z);
    player.group.rotation.y=p.yaw+Math.PI;
    cameraUpdate(.016,true); updateLighting();
  }
  resetCamera();
  frameId=requestAnimationFrame(frame);
  const canvas=renderer.domElement;
  const fightKeys={z:'attack',h:'bow',q:'lock',g:'guard-on',x:'dodge'};
  window.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.metaKey||e.altKey||e.repeat||e.target.closest?.('input,textarea,select,[contenteditable]')||building) return;
    const action=fightKeys[e.key.toLowerCase()];
    if(action&&combat.action(action))e.preventDefault();
  },options);
  window.addEventListener('keyup',e=>{if(e.key.toLowerCase()==='g') combat.action('guard-off');},options);
  window.addEventListener('blur',()=>combat.action('guard-off'),options);
  canvas.addEventListener('pointerdown',e=>{
    if(!active||paused||e.button>2) return;
    gesture={id:e.pointerId,x:e.clientX,y:e.clientY,travel:0,button:e.button};
    canvas.setPointerCapture(e.pointerId);
  },options);
  function readPointer(e) {
    const rect=canvas.getBoundingClientRect();
    pointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);
  }
  canvas.addEventListener('pointermove',e=>{
    if(!paused&&e.pointerType==='mouse'&&(building||combat.isFighting())){
      readPointer(e);
      if(building) mouseAim=true;
      else{
        ray.setFromCamera(pointer,camera);
        combat.aim(Math.atan2(ray.ray.direction.x,ray.ray.direction.z));
      }
    }
    if(!gesture||e.pointerId!==gesture.id||paused) return;
    const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
    gesture.x=e.clientX;gesture.y=e.clientY;gesture.travel+=Math.abs(dx)+Math.abs(dy);
    if(gesture.button===2||gesture.travel>3){
      state.player.yaw=(state.player.yaw-dx*.006)%TAU;
      freeLookUntil=elapsed+.72;
      pitch=T.MathUtils.clamp(pitch+dy*.005,-.54,1.09);
    }
  },options);
  canvas.addEventListener('pointerup',e=>{
    if(!gesture||e.pointerId!==gesture.id) return;
    const rect=canvas.getBoundingClientRect();
    pointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);
    if(gesture.travel<6){
      if(building) tryBlock(gesture.button===2,pointer);
      else if(e.pointerType==='mouse'){
        if(gesture.button===0) combat.action('attack');
        if(gesture.button===2) combat.action('lock');
      }
    }
    gesture=null;
  },options);
  canvas.addEventListener('pointercancel',()=>{gesture=null;mouseAim=false;},options);
  canvas.addEventListener('pointerleave',()=>{mouseAim=false;combat.aim(null);},options);
  function zoomRoom(delta){
    if(cameraRoom) roomZoom=T.MathUtils.clamp(roomZoom+delta,.65,1.35);
  }
  canvas.addEventListener('wheel',e=>{
    if(active&&!paused){
      e.preventDefault();
      if(cameraRoom) zoomRoom(e.deltaY*.001);
      else distance=T.MathUtils.clamp(distance+e.deltaY*.009,5.8,17);
    }
  },{...options,passive:false});
  return {
    get renderer(){return renderer;},
    insideRoom,
    zoomRoom,leaveWizardTower,
    toggleFlight,lightLantern,
    combat:combat.action,
    inCombat:combat.isFighting,
    syncTracking,trackingJourney,
    refreshHomestead(){homestead?.refresh?.();},
    mapHeight:(id,x,z)=>id==='valley'?valleyHeight(x,z):stream.terrain[id].height(x,z),
    resume(keysHeld,view){
      pitch=view.pitch;distance=view.distance;
      keys=new Set(keysHeld);resetCamera();
    },
    companionAction,introduceBuddy,scoutNearby,castEffect,collectLoot,studyNearby,takePostcard,propertyPreview,
    destroy(){
      relayHud?.remove();cancelAnimationFrame(frameId);events.abort();
      for(const actor of [...agents,...wild]) actor.name.remove();
      scoutLabel.remove();
      combat.destroy();lootArt.destroy();trail.destroy();
      disposeHuman(scene);
      portraitTarget?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
    setActive(value) {active=value;combat.setActive(value);if(value) resetCamera();else keys.clear();},
    setPaused(value) {paused=value;combat.setPaused(value);needsRender=true;keys.clear();gesture=null;},
    setLost(value) {contextLost=value;},
    setKey(key,on){if(on) keys.add(key);else keys.delete(key);},
    clearKeys(){keys.clear();},
    jump(){if(active&&!paused&&grounded){grounded=false;speedY=7.0;}},
    resetCamera,interaction,placeBlock,removeBlock,updateOutfit,drawOutfit,
    syncLighting(){updateLighting();needsRender=true;},
    canWalk:safeGround,
    setBuild(value,type) {if(value!==building) mouseAim=false;building=value;selected=type;},
    rotate(){rotation=(rotation+1)%4;},
    tryBlock
  };
}

function makeLabel(parent,name,mark) {
  const tag=document.createElement('div');tag.className='world-name'+(mark?'':' wild');
  tag.innerHTML=mark?`<span class="npc-dot">${mark}</span><span>${name}</span>`:`${icon('paw',12)}<span>${name}</span>`;
  tag.hidden=true;parent.append(tag);
  return tag;
}

function makeShadow() {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=40;
  const ctx=canvas.getContext('2d'), g=ctx.createRadialGradient(20,20,2,20,20,20);
  g.addColorStop(0,'#292b3bcc');g.addColorStop(.45,'#292b3b96');g.addColorStop(1,'#292b3b00');
  ctx.fillStyle=g;ctx.fillRect(0,0,40,40);
  return new T.CanvasTexture(canvas);
}
function addShadow(scene,texture,size) {
  const mesh=new T.Mesh(new T.PlaneGeometry(size*2,size*2),new T.MeshBasicMaterial({map:texture,transparent:true,opacity:.28,depthWrite:false}));
  mesh.rotation.x=-Math.PI/2;scene.add(mesh);return mesh;
}











