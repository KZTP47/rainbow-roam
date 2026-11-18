import * as T from 'three';
import {animate,part,branch,creature} from './models.js';
import {human,disposeHuman} from './human.js';
import {geography} from './overworld.js';
import {leaveBanditLoot} from './loot.js';

const wanted=[
  ['bramble','Dell Bramble','Apple Road Tollkeeper','valley',-19,34,'sabre',22,'Look for the old apple baskets where Sunseed Fields meets the western footpath.'],
  ['needle','Iona Needle','The Rosewood Marksman','valley',-50,-12,'bow',26,'Follow the line of fallen pink petals west of Blushwood. The last tree has a cut ribbon.'],
  ['jess','Copper Jess','Keeper of the Bog Bridge','valley',-44,57,'guard',30,'Someone patched the footbridge with copper strips southwest of the valley.'],
  ['pike','Ash Pike','The Quarry Runner','valley',49,-37,'rush',27,'Look above the eastern bank of Mirrormere, where the hillside is mottled with pale rock.'],
  ['gorse','Mara Gorse','Keeper of Borrowed Keys','woods',-39,19,'sabre',28,'A tiny key is tied to a branch west of the lower Elderwood trails.'],
  ['fen','Bram Fen','The Lantern Collector','woods',37,23,'guard',31,'Walk past the lantern path to the east edge. The lantern keeper did not hang that last light.'],
  ['spindle','Spindle Vale','Crow on the Canopy','woods',28,-38,'bow',33,'The high trail north of the canopy has no birdsong. Listen for a bowstring.'],
  ['bluff','Orla Bluff','The Chalk Rider','mesa',39,16,'rush',29,'Keep the red escarpment on your left until the pale slope drops away.'],
  ['sable','Nyx Sable','The Pottery Tax','mesa',-36,24,'guard',33,'Find the side trail west of the southern settlements. A chipped blue pot marks the camp.'],
  ['kiln','Rowan Kiln','Last Light at the Kiln','mesa',17,-40,'sabre',34,'Tracks wander north from the painted stones. Look for a charcoal stain on the path.'],
  ['nettles','Esther Nettles','The Pass Watcher','frost',36,-24,'bow',32,'Look for the clear stretch east of the glacier past the pines.'],
  ['flint','Ezra Flint','The Snow Toll','frost',-39,17,'guard',34,'The western trail rises out of the snow to a shelf where travelers stop to shake out their boots.'],
  ['floe','Anwen Floe','The Thaw Runner','frost',18,39,'rush',35,'The southern foot of the range has a shelf where the snow recedes first.'],
  ['sixknots','Miro Sixknots','The Ropewalk Keeper','coast',-33,24,'sabre',31,'Head toward the sea west of the lower villages. A frayed six-knot rope hangs near camp.'],
  ['gannet','Perri Gannet','The Clifftop Lookout','coast',35,-19,'bow',33,'Stay on the inland side of the northern tidal pool and look across the grasses.'],
  ['islet','Cass Islet','The Shell Collector','coast',18,42,'rush',36,'Along the southern fields there is a shell pile high above the tide line.'],
  ['shin','Lian Shin','The Reed Rat','delta',-35,22,'rush',32,'Watch the reeds on the west approach to Inkreed Landing for a gap above the water.'],
  ['reed','Pip Reed','Borrower of Boats','delta',38,22,'sabre',34,'A ferry was dragged inland on the east bank. Follow the scrape marks uphill.'],
  ['silt','Sera Silt','The Lilypad Lookout','delta',21,-37,'bow',35,'The high northern meadow gives a clear shot over the reed beds.'],
  ['cant','Ivo Cant','Hare of the Long Moor','heath',-38,22,'rush',35,'The west edge of Heatherheart Moor has a hollow by an old heather bank.'],
  ['rose','Lin Rose','The Thornlayer','heath',38,-19,'bow',36,'On the eastern footpath, look behind the thorn hedge for crushed purple blooms.'],
  ['bell','Carmine Bell','The Silent Bellkeeper','heath',20,39,'guard',42,'Head south where the long grass stops. Someone wrapped the distant bell in wool.'],
  ['coals','Tess Coals','The Kiln Keeper','cinder',36,22,'guard',38,'A scuffed kiln door leans against a stone on the east side of Cinderglen.'],
  ['embervein','Lark Embervein','The Ash Sketcher','cinder',-36,20,'bow',40,'Look west of the cinder paths. The ash diagrams on the rocks point uphill.'],
  ['sedge','Tal Sedge','The Cinder Stepper','cinder',20,-38,'sabre',42,'From the northern trail, cross the hard-packed ash toward the highest bare rock.'],
  ['coral','Nell Coral','The Pearldiver','reef',-34,25,'rush',40,'Above the tide on the western shore, leave the rock pools behind and look for a pile of coral-colored stones.'],
  ['brine','Dima Brine','Keeper of the Chalk Sail','reef',39,-19,'guard',42,'A square of white sailcloth is tied low on the inland side of Pearlbreak Coast.'],
  ['kite','Sumi Kite','Lady of the Sand Bar','reef',18,40,'bow',44,'Go south of the reef where the bluffs level out into a windy shelf.'],
  ['verdant','Avi Verdant','Borrower of Green Copper','verdigris',-37,23,'guard',44,'The west highland trail has a pile of blue-green scrap between weathered stones.'],
  ['larch','Ina Larch','The Tarn Runner','verdigris',38,21,'rush',46,'Look between the low hills on the eastern approach, below the rocky shoulder.'],
  ['mintglass','Vik Mintglass','The Green Ridge Scout','verdigris',19,-39,'bow',48,'Take the uphill path past the northern ridge and look for the green glass tied to a high twig.'],
  ['pom','Juniper Pom','The Borrowed Harvest','orchards',-37,24,'sabre',43,'Follow the empty baskets down the western rows of Ciderwild.'],
  ['peel','Will Peel','The Cider Barrel Guard','orchards',37,21,'guard',46,'The eastern orchards have a loose barrel hoop in the grass where the trees thin out.'],
  ['tart','Tova Tart','The Blossom Strings','orchards',19,-39,'bow',50,'Look north beyond the orchard rows for a string of paper blossoms.'],
  ['silks','Ana Silks','The Wind Ferry Stowaway','sky',-34,25,'sabre',39,'On Sailsong Island, follow the rim west until the sail shadows cut across the path.'],
  ['alden','Alden Moth','The Cloudwatch Archer','sky',29,-27,'bow',55,'Hide behind a giant orchid and watch the northeast rim of Orchid Aerie.']
];

export const BANDITS=wanted.map(([id,name,title,realm,x,z,style,coins,clue],index)=>({
  id,name,title,realm,x,z,style,coins,clue,badges:coins>=43?3:coins>=32?2:1,
  coat:['#985477','#5e7598','#9b665f','#6f7e58','#794e6e','#537c83','#975b51'][index%7],
  accessory:index%8,skin:['#c19b81','#c88169','#dbac86','#986956','#b57563','#e7bd9b'][index%6],
  hair:['#4d3949','#735454','#a6755d','#37354e','#a68177'][Math.floor(index/4)%5]
}));
const lookup=Object.fromEntries(BANDITS.map(record=>[record.id,record]));
const isBandit=id=>typeof id==='string'&&Object.hasOwn(lookup,id);
export const outlawStyle={
  sabre:{hearts:7,speed:3.25,windup:.81,reach:2.7,damage:1.0,label:'Blade sweep'},
  guard:{hearts:9,speed:2.7,windup:1.02,reach:2.95,damage:1.4,label:'Shield charge'},
  rush:{hearts:6,speed:4.4,windup:.75,reach:3.4,damage:1.0,label:'Running slash'},
  bow:{hearts:7,speed:3.25,windup:1.13,reach:13,damage:1.0,label:'Arrow volley'}
};
export function normalizeBounties(raw){
  const captured=Object.fromEntries(Object.keys(raw?.captured??{}).filter(id=>isBandit(id)&&raw.captured[id]===true).map(id=>[id,true]));
  const a=raw?.abducted;
  const abducted=a&&isBandit(a.bandit)&&Object.hasOwn(geography,a.realm)&&
    typeof a.pet==='string'&&a.pet.length<100&&Number.isFinite(a.x)&&Number.isFinite(a.z)&&
    Math.abs(a.x)<=geography[a.realm].rx&&Math.abs(a.z)<=geography[a.realm].rz
    ?{pet:a.pet,bandit:a.bandit,realm:a.realm,x:a.x,z:a.z}:null;
  return {target:isBandit(raw?.target)&&!captured[raw.target]?raw.target:null,captured,abducted,
    raidClock:Number.isFinite(raw?.raidClock)?Math.max(0,Math.min(150,raw.raidClock)):0};
}

const pool=['#ebcc91','#f1a6ab','#bdc6ec'];
const angleDistance=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const grabWarning='Grab your companion';
const sweepAngle=1.51;
const flatAngle=(a,b)=>Math.atan2(b.x-a.x,b.z-a.z);
const actions=[
  ['attack','Strike','Strike','Z','M4 20l5-5m-2-3 5 5m-2-2 9-9 1-4-4 1-9 9'],
  ['bow','Loose an arrow','Bow','H','M5 3c10-2 18 6 16 16M5 3l16 16M3 21 18 6m-6 0h6v6'],
  ['guard','Guard','Guard','G','M12 2l8 3v6c0 6-4 9-8 11-4-2-8-5-8-11V5l8-3zm0 4v12'],
  ['dodge','Dodge','Dodge','X','M8 4 2 12l6 8m0-8h9m-4-5h7m-7 10h7'],
  ['lock','Lock on','Lock','Q','M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M12 10v4m-2-2h4']
];
const glyph=path=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="'+path+'"/></svg>';
const hostileGlyph=glyph('M12 2l8 4v11l-8 5-8-5V6l8-4zm-4 13 8-7m-8 0 8 7');
const arrowGlyph=glyph('M12 4v15m-6-9 6-6 6 6');
const actionStyle={
  attack:{wind:.115,total:.37,energy:8,reach:2.72},
  bow:{wind:.135,total:.60,energy:13,reach:24}
};
const makeWeapon=target=>{
  const h=new T.Group();target.add(h);
  part(h,'cyl','#7e573e',0,0,0,.049,.33,.052);
  part(h,'cube','#e1b272',0,-.24,0,.22,.048,.078);
  part(h,'diamond','#c9d8e5',0,-.49,0,.082,.24,.039);
  return h;
};

function makeBow(parent){
  const bow=new T.Group();
  parent.add(bow);bow.position.set(0,-.59,.17);
  const points=[[0,-.35,-.03],[0,-.23,.105],[0,0,.16],[0,.23,.105],[0,.35,-.03]];
  for(let i=1;i<points.length;i++)branch(bow,'#9b7256',points[i-1],points[i],.029);
  branch(bow,'#e8d2b9',points[0],points[4],.009);
  return bow;
}

export function banditModel(data){
  const actor=human([data.skin,data.coat,data.hair],
    {morph:data.accessory%2,style:[2,6,5,7,9,4,1,8][data.accessory],
      outfit:[2,0,3,2,0,3,1,2][data.accessory],accessory:[3,2,3,3,0,2,3,4][data.accessory]});
  const neckerchief=part(actor.model,'fine','#9b3b4d',0,1.443,.151,.19,.064,.139);
  neckerchief.castShadow=false;
  const scarfPoint=part(actor.model,'diamond','#bd5960',.034,1.307,.266,.053,.141,.034,0,0,.15);
  scarfPoint.castShadow=false;
  const badge=part(actor.model,'diamond',pool[data.badges-1],-.108,1.32,.241,.035,.069,.019);
  badge.castShadow=false;
  if(data.style==='bow') makeBow(actor.arms[0]);
  else {
    const blade=makeWeapon(actor.arms[0]);
    blade.position.set(0,-.65,.065);
  }
  if(data.style==='guard'){
    const buckler=part(actor.arms[1],'cyl','#9a7a98',.04,-.5,.12,.25,.08,.26,Math.PI/2);
    part(buckler,'diamond','#e4bb87',0,.5,0,.31,.19,.31);
  }
  return actor;
}

export function createCombat({scene,container,state,species,realm,terrainHeight,walkable,report}){
  state.bounties=normalizeBounties(state.bounties);
  state.wallet??={coins:0,badges:0};
  const progress=state.bounties;
  let active=true,paused=false,enemy=null,lock=false,guard=false,guardHeld=false,stamina=100;
  state.health??=5;
  let dodgeTime=0,blockTime=-5,relief=0,t=0,playerArrow=null,enemyArrow=null,regenAt=0;
  let currentMove=null,queued=null,hit=null,steer=null,dodgeHeading=null,aim=null,lastSwing=-5,swingCount=0;
  let tool=null,bow=null,shield=null,camp=null,rescueModel=null,noticeTimer=0,notice='',noticeTone='neutral';
  const p=state.player;
  const hud=document.createElement('section');
  hud.className='roam-combat';hud.hidden=true;
  hud.setAttribute('aria-label','Combat');
  hud.innerHTML=`<div class="combat-health">
    <div class="combat-identity"><i>${hostileGlyph}</i><div><small data-combat-kind>Hostile bandit</small>
      <strong data-combat-name></strong></div><span data-combat-distance></span></div>
    <meter data-combat-enemy min="0" aria-label="Bandit resolve"></meter>
    <div class="combat-reading"><span data-combat-plan></span><span data-combat-hint></span></div>
    <div class="combat-wind" aria-hidden="true" hidden><i></i></div>
  </div>
  <div class="combat-player"><div><small>Health</small><span data-combat-hearts aria-label="Health"></span></div>
    <div><small>Stamina</small><meter data-combat-stamina min="0" max="100" aria-label="Stamina"></meter></div></div>
  <div data-combat-clue></div>
  <div class="combat-controls" aria-label="Combat controls">${actions.map(([id,label,verb,key,path])=>
    '<button type="button" data-combat-button="'+id+'" aria-label="'+label+'" title="'+label+' · '+key+'">'+
    glyph(path)+'<span>'+verb+'</span><kbd>'+key+'</kbd></button>').join('')}</div>`;
  const marker=document.createElement('div');
  marker.className='combat-marker';marker.hidden=true;
  marker.innerHTML=`<i>${hostileGlyph}</i><span><strong>Bandit</strong><small></small></span>`;
  const direction=document.createElement('div');
  direction.className='combat-direction';direction.hidden=true;
  direction.innerHTML=`<i>${arrowGlyph}</i><span></span>`;
  const popup=document.createElement('div');
  popup.className='combat-impact';popup.hidden=true;
  container.append(marker,direction,popup,hud);
  const life=hud.querySelector('[data-combat-hearts]');
  const meter=hud.querySelector('[data-combat-stamina]');
  const danger=hud.querySelector('[data-combat-enemy]');
  const name=hud.querySelector('[data-combat-name]');
  const kindLabel=hud.querySelector('[data-combat-kind]');
  const distanceLabel=hud.querySelector('[data-combat-distance]');
  const planner=hud.querySelector('[data-combat-plan]');
  const prompt=hud.querySelector('[data-combat-hint]');
  const wind=hud.querySelector('.combat-wind');
  const windFill=wind.firstElementChild;
  const clue=hud.querySelector('[data-combat-clue]');
  const fightStatus=hud.querySelector('.combat-health');
  const inputs=hud.querySelector('.combat-controls');
  const playerStatus=hud.querySelector('.combat-player');
  const guardButton=inputs.querySelector('[data-combat-button="guard"]');
  const lockButton=inputs.querySelector('[data-combat-button="lock"]');
  const temp=new T.Vector3();
  const cameraPoint=new T.Vector3();
  const ring=new T.Mesh(new T.RingGeometry(.78,.85,40).rotateX(-Math.PI/2),
    new T.MeshBasicMaterial({color:'#fcaa81',transparent:true,opacity:.9,depthWrite:false}));
  ring.visible=false;scene.add(ring);
  const sweepArea=new T.RingGeometry(.83,1,36,1,Math.PI*1.5-sweepAngle,sweepAngle*2).rotateX(-Math.PI/2);
  const grabArea=new T.RingGeometry(.83,1,36).rotateX(-Math.PI/2);
  const dangerPool=new T.Mesh(sweepArea,
    new T.MeshBasicMaterial({color:'#ffd193',transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
  const shotLane=new T.Mesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),
    new T.MeshBasicMaterial({color:'#ffd193',transparent:true,opacity:.34,depthWrite:false,side:T.DoubleSide}));
  dangerPool.visible=shotLane.visible=false;
  scene.add(dangerPool,shotLane);
  const projectiles=[0,1].map(i=>{
    const a=new T.Group();
    branch(a,i?'#a5d9ed':'#ffb89a',[0,0,-.4],[0,0,.25],.023);
    part(a,'diamond',i?'#e3f7f2':'#fbe1b4',0,0,.22,.052,.133,.042,Math.PI/2);
    a.visible=false;scene.add(a);return a;
  });
  for(const button of hud.querySelectorAll('button')){
    const id=button.dataset.combatButton;
    if(id==='guard'){
      button.addEventListener('pointerdown',e=>{
        e.preventDefault();button.setPointerCapture(e.pointerId);action('guard-on');
      });
      for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>action('guard-off'));
      button.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')action('guard-on');});
      button.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')action('guard-off');});
    }else button.addEventListener('click',()=>action(id));
  }
  const say=(title,detail,icon)=>report?.({title,detail,icon});
  function markDirection(where){
    const compass=['N','NE','E','SE','S','SW','W','NW'];
    const direction=compass[(Math.round(Math.atan2(where.x-p.x,p.z-where.z)/(Math.PI/4))+8)%8];
    return ' · '+direction+' '+Math.round(distance(p,where))+' m';
  }
  const hints=()=>{
    const missing=progress.abducted;
    const tracked=lookup[progress.target];
    if(missing) return 'Rescue '+(species[missing.pet]?.name??'your friend')+' · '+geography[missing.realm].title+
      (missing.realm===realm?markDirection(missing):'');
    if(tracked) return 'Wanted · '+tracked.name+' · '+geography[tracked.realm].title+
      (tracked.realm===realm?markDirection(tracked):'');
    return '';
  };
  const setText=(element,text)=>{if(element.textContent!==text)element.textContent=text;};
  function encounterKind(e){
    return e.mode==='raid'?'Companion thief':e.mode==='rescue'?'Bandit hideout':'Hostile bandit';
  }
  function hudUpdate(){
    const hunt=hints(),fighting=Boolean(enemy);
    hud.hidden=!active||paused||(!fighting&&!hunt);
    fightStatus.hidden=!fighting;inputs.hidden=!fighting;playerStatus.hidden=!fighting;
    clue.hidden=!hunt||fighting;setText(clue,hunt);
    container.classList.toggle('combat-in-progress',fighting&&active&&!paused);
    if(!fighting) return;
    const d=distance(p,enemy),warning=enemy.wind>0&&enemy.stun<=0;
    setText(kindLabel,encounterKind(enemy));
    setText(name,enemy.data.name);
    setText(distanceLabel,Math.round(d)+' m');
    name.title=enemy.data.title;
    setText(planner,warning?enemy.label:noticeTimer>0?notice:enemy.stun>0?'Opening':d>3.5?'Keeping distance':'In sword reach');
    const hint=warning?(enemy.grab?'Strike to interrupt':enemy.data.style==='bow'?'Dodge the arrow':'Guard or dodge'):
      guard?'Holding guard':queued?'Next action queued':d>3.5?'Bow or move closer':lock?'Target locked':'Lock on to track';
    setText(prompt,hint);
    planner.dataset.warn=String(warning);
    fightStatus.dataset.phase=warning?'danger':noticeTimer>0?noticeTone:enemy.stun>0?'opening':'ready';
    wind.hidden=!warning;
    if(warning) windFill.style.transform='scaleX('+clamp(1-enemy.wind/enemy.windLength,0,1)+')';
    danger.max=enemy.profile.hearts;danger.value=enemy.hp;
    const whole=Math.ceil(state.health);
    setText(life,'♥'.repeat(whole)+'♡'.repeat(5-whole));
    life.setAttribute('aria-label',Math.round(state.health*10)/10+' of five hearts');
    meter.value=stamina;
    guardButton.setAttribute('aria-pressed',String(guard));
    lockButton.setAttribute('aria-pressed',String(lock));
    hud.dataset.guarding=String(guard);hud.dataset.locked=String(lock);
    hud.dataset.action=currentMove?.kind??(dodgeTime>0?'dodge':'');
  }
  function screenEffects(camera){
    if(!active||paused||!enemy){marker.hidden=direction.hidden=popup.hidden=true;return;}
    const e=enemy;
    temp.copy(e.actor.group.position);temp.y+=2.48;
    cameraPoint.copy(temp).applyMatrix4(camera.matrixWorldInverse);
    temp.project(camera);
    const visible=cameraPoint.z<0&&Math.abs(temp.x)<.84&&Math.abs(temp.y)<.79&&temp.z<1;
    const warning=e.wind>0&&e.stun<=0;
    marker.hidden=!visible;
    direction.hidden=visible;
    if(visible){
      marker.style.left=(50+temp.x*50)+'%';marker.style.top=(50-temp.y*50)+'%';
      setText(marker.querySelector('strong'),e.mode==='raid'?'Companion thief':'Hostile bandit');
      setText(marker.querySelector('small'),e.data.name);
      marker.dataset.phase=warning?'danger':'ready';
      marker.dataset.locked=String(lock);
    }else {
      const centeredBehind=cameraPoint.z>=0&&Math.abs(cameraPoint.x)<.26;
      const dx=cameraPoint.z<0?temp.x:centeredBehind?0:Math.sign(cameraPoint.x)*1.1;
      const dy=cameraPoint.z<0?-temp.y:centeredBehind?.72:.38;
      direction.style.left=(50+clamp(dx,-.73,.73)*50)+'%';
      direction.style.top=(50+clamp(dy,-.48,.72)*50)+'%';
      direction.style.setProperty('--threat-angle',Math.atan2(dx,-dy)+'rad');
      direction.dataset.phase=warning?'danger':'ready';
      setText(direction.querySelector('span'),warning?e.label:centeredBehind?'Bandit behind you':encounterKind(e));
    }
    popup.hidden=!hit||!visible;
    if(!popup.hidden){
      popup.style.left=(50+temp.x*50)+'%';popup.style.top=(51-temp.y*50)+'%';
      popup.style.setProperty('--rise',((t-hit.at)*33)+'px');
      setText(popup,hit.text);
    }
  }
  function flash(text,tone='neutral'){notice=text;noticeTone=tone;noticeTimer=.83;}
  function clearEnemy(){
    if(enemy){disposeHuman(enemy.actor.group);scene.remove(enemy.actor.group);}
    if(rescueModel) scene.remove(rescueModel.group);
    if(camp)scene.remove(camp);
    enemy=rescueModel=camp=null;
    lock=guard=guardHeld=false;currentMove=queued=hit=dodgeHeading=null;dodgeTime=0;
    marker.hidden=direction.hidden=popup.hidden=true;
    ring.visible=dangerPool.visible=shotLane.visible=false;projectiles.forEach(arrow=>arrow.visible=false);
    playerArrow=enemyArrow=null;
    if(tool) tool.visible=false;
    if(bow) bow.visible=false;
    if(shield) shield.visible=false;
  }
  function walkPoint(x,z){
    for(let j=0;j<18;j++){
      const angle=j*2.39996,r=j*.43;
      const xx=x+Math.sin(angle)*r,zz=z+Math.cos(angle)*r;
      if(walkable(xx,zz)) return {x:xx,z:zz};
    }
    return null;
  }
  function start(data,location,mode){
    const where=walkPoint(location.x,location.z);
    if(!where) return;
    const profile=outlawStyle[data.style];
    const actor=banditModel(data);
    actor.group.scale.setScalar(1.17);scene.add(actor.group);
    enemy={data,actor,profile,...where,mode,hp:profile.hearts,wind:0,windLength:0,label:'',stun:0,
      attackWait:1.1,guarded:data.style==='guard',grab:false,heading:flatAngle(where,p)};
    actor.group.position.set(where.x,terrainHeight(where.x,where.z),where.z);
    if(mode!=='raid'){
      camp=new T.Group();camp.position.set(where.x,terrainHeight(where.x,where.z),where.z);
      branch(camp,'#8d6b5e',[1.8,0,-.2],[1.8,1.68,-.2],.046);
      part(camp,'cube',data.coat,2.06,1.29,-.20,.55,.49,.032,0,0,-.13);
      part(camp,'diamond','#d0b28a',2.08,1.28,-.18,.115,.14,.019,0,0,-.13);
      part(camp,'fine','#8a6e78',1.27,.14,.81,.24,.16,.28,.03,.25,.10);
      part(camp,'cube','#a5816b',1.75,.16,.81,.39,.29,.43,0,-.19);
      part(camp,'cube','#d6b68d',1.74,.31,.81,.44,.062,.45,0,-.19);
      scene.add(camp);
    }
    if(mode==='rescue'&&species[progress.abducted?.pet]){
      rescueModel=creature(species[progress.abducted.pet]);scene.add(rescueModel.group);
      rescueModel.group.scale.setScalar(.78);
      const x=where.x-1.85,z=where.z+.47;
      rescueModel.group.position.set(x,terrainHeight(x,z),z);
      const pen=new T.Group();pen.position.copy(rescueModel.group.position);scene.add(pen);camp.attach(pen);
      for(const side of [-1,1]){
        for(const at of [-.8,.8])part(pen,'cyl','#ac8374',side*.75,.43,at,.076,.86,.076);
        for(const y of [.27,.57])part(pen,'cube','#ba8d79',side*.75,y,0,.071,.09,1.55);
      }
      part(pen,'cube','#ba8d79',0,.4,-.78,1.46,.11,.08);
      part(pen,'fine','#cb7f81',.72,.84,.77,.092,.085,.09);
      part(pen,'fine','#cac8aa',-.72,.84,.77,.092,.085,.09);
    }
    lock=true;
    say(mode==='raid'?'Companion thief nearby':mode==='rescue'?'Your friend is close':'Wanted bandit sighted',
      data.name+' · '+data.title,mode==='raid'?'paw':'pin');
  }
  function spend(amount){
    if(stamina<amount){flash('Low stamina','danger');return false;}
    stamina-=amount;regenAt=t+.40;return true;
  }
  function faceTarget(){
    if(!enemy)return;
    const d=flatAngle(p,enemy);
    actorSource?.group.rotation.set(0,d,0);
  }
  let actorSource=null;
  function findTool(actor){
    if(actor!==actorSource){
      if(tool)tool.removeFromParent();
      if(shield)shield.removeFromParent();
      if(bow)bow.removeFromParent();
      actorSource=actor;tool=shield=bow=null;
    }
    if(!tool){
      tool=makeWeapon(actor.arms[0]);tool.position.set(0,-.66,.07);
      bow=makeBow(actor.arms[1]);
      shield=part(actor.arms[1],'cyl','#607c98',0,-.52,.17,.25,.076,.27,Math.PI/2);
      part(shield,'diamond','#e4c68c',0,.5,0,.23,.21,.27);
    }
  }
  function finish(){
    const {data,mode}=enemy, missing=progress.abducted;
    const rescue=missing?.bandit===data.id&&missing.realm===realm;
    const bounty=!progress.captured[data.id]&&(mode==='bounty'||progress.target===data.id);
    if(bounty){progress.captured[data.id]=true;progress.target=null;}
    if(rescue){
      state.active=state.companions.includes(missing.pet)?missing.pet:null;
      progress.abducted=null;
    }
    const coins=bounty?data.coins:Math.round(data.coins*.45),badges=bounty?data.badges:0;
    leaveBanditLoot(state,enemy,realm,coins,bounty);
    state.wallet.badges=(state.wallet.badges??0)+badges;
    progress.raidClock=0;
    clearEnemy();relief=15;
    say(rescue?(species[missing.pet]?.name??'Your friend')+' is safe':bounty?'Bounty captured':'Thief chased off',
      'Pick up the sparkling spoils nearby'+(badges?' · +'+badges+' Ranger '+(badges===1?'badge':'badges'):''),rescue?'paw':'check');
  }
  function strike(damage,canGuard=true){
    if(!enemy)return;
    const shielded=enemy.guarded&&canGuard&&enemy.stun<=0&&enemy.wind<=0;
    const amount=shielded?.35:damage;
    enemy.hp=Math.max(0,enemy.hp-amount);
    hit={at:t,text:shielded?'Shielded':'−'+amount};
    if(shielded) flash('Bandit guarded','danger');
    else{
      if(enemy.wind>0) enemy.attackWait=Math.max(.55,enemy.attackWait);
      enemy.stun=damage>=2.4?.61:.29;enemy.wind=0;enemy.grab=false;
      flash(damage>=2?'Clean hit':'Hit landed','opening');
    }
    if(enemy.hp<=0)finish();
  }
  function loseHeart(damage,byArrow=false){
    if(dodgeTime>.08){flash('Evaded','opening');return;}
    const facing=actorSource?.group.rotation.y??(p.yaw+Math.PI);
    const ready=guard&&stamina>=17&&(!enemy||Math.abs(angleDistance(facing,flatAngle(p,enemy)))<1.24);
    if(ready){
      if(t-blockTime<.24&&enemy){
        spend(9);enemy.stun=1.65;enemy.attackWait=1.83;flash('Perfect guard','opening');return;
      }
      spend(17);flash('Blocked','opening');return;
    }
    if(guard)guard=guardHeld=false;
    currentMove=queued=null;
    state.health=Math.max(0,state.health-damage);flash(byArrow?'Arrow hit':'Took a hit','danger');
    if(state.health<=0){
      clearEnemy();state.health=5;stamina=100;relief=24;progress.raidClock=0;
      say('You caught your breath','Your satchel is safe. You can return to the trail.','heart');
    }
  }
  function launchArrow(from,to,player){
    const x=to.x-from.x,z=to.z-from.z,d=Math.hypot(x,z);
    if(d<.1) return null;
    return {x:from.x,z:from.z,y:terrainHeight(from.x,from.z)+1.04,
      dx:x/d,dz:z/d,dy:(terrainHeight(to.x,to.z)-terrainHeight(from.x,from.z))/d,
      life:player?1.25:.93};
  }
  function tickArrow(arrow,dt,mesh,player){
    if(!arrow){mesh.visible=false;return null;}
    const speed=player?26:19;
    const travel=dt*speed;
    const x=arrow.x+arrow.dx*travel,z=arrow.z+arrow.dz*travel;
    arrow.life-=dt;
    mesh.position.set(x,arrow.y+arrow.dy*travel,z);mesh.rotation.y=Math.atan2(arrow.dx,arrow.dz);
    mesh.visible=true;
    const target=player?enemy:p;
    if(!target||arrow.life<=0||terrainHeight(x,z)>mesh.position.y+.05){mesh.visible=false;return null;}
    const along=clamp((target.x-arrow.x)*arrow.dx+(target.z-arrow.z)*arrow.dz,0,travel);
    const gap=distance({x:arrow.x+arrow.dx*along,z:arrow.z+arrow.dz*along},target);
    if(gap<.79&&Math.abs(mesh.position.y-terrainHeight(target.x,target.z)-1)<1.1){
      mesh.visible=false;
      if(player)strike(2.1);
      else loseHeart(enemy?.profile.damage??1,true);
      return null;
    }
    arrow.x=x;arrow.z=z;arrow.y=mesh.position.y;
    return arrow;
  }
  function beginMove(kind){
    const spec=actionStyle[kind];
    if(!spend(spec.energy)) return;
    const direction=actorSource?.group.rotation.y??(p.yaw+Math.PI);
    const heading=lock?flatAngle(p,enemy):kind==='bow'&&aim!==null?aim:direction;
    const d=distance(p,enemy);
    currentMove={kind,elapsed:0,fired:false,heading,step:kind==='attack'&&lock&&d>2.4&&d<3.55?Math.min(.95,d-2.48):0};
    if(actorSource) actorSource.group.rotation.y=heading;
  }
  function resolveMove(move){
    const d=distance(p,enemy);
    if(move.kind==='attack'){
      if(d>actionStyle.attack.reach){flash('Step closer');return;}
      if(!lock&&Math.abs(angleDistance(move.heading,flatAngle(p,enemy)))>1.13){
        flash('Turn toward the bandit');return;
      }
      swingCount=t-lastSwing<.96?swingCount%3+1:1;lastSwing=t;
      strike(swingCount===3?2.9:swingCount===2?2.05:1.75,swingCount!==3);
      return;
    }
    if(d>actionStyle.bow.reach&&lock){flash('Beyond bow range');return;}
    const to=lock?enemy:{x:p.x+Math.sin(move.heading)*12,z:p.z+Math.cos(move.heading)*12};
    playerArrow=launchArrow(p,to,true);
    flash('Arrow away');
  }
  function applyQueued(){
    if(guardHeld&&!guard){
      guard=true;blockTime=t;queued=null;
    }else if(!guard&&queued){
      const order=queued;queued=null;
      if(order.until>=t) beginMove(order.kind);
    }
  }
  function action(verb,id){
    if(verb==='potion'){
      if(!active||paused||state.transit||state.health>=5||!(state.inventory.hpPotion>0)) return false;
      state.inventory.hpPotion--;
      state.health=Math.min(5,state.health+2.5);
      say('Heartleaf potion','Restored up to two and a half hearts.','heart');hudUpdate();return true;
    }
    if(verb==='track'){
      if(!isBandit(id)||progress.captured[id]) return false;
      if(enemy?.mode==='bounty'&&enemy.data.id!==id) clearEnemy();
      progress.target=id;
      say('Bounty tracked',lookup[id].name+' · '+lookup[id].clue,'pin');hudUpdate();return true;
    }
    if(verb==='untrack'){progress.target=null;hudUpdate();return true;}
    if(verb==='guard-off'){guard=guardHeld=false;return true;}
    if(!active||paused||!enemy||state.transit) return false;
    if(verb==='lock'){
      lock=!lock;
      flash(lock?'Target locked':'Free aim');
      return true;
    }
    if(verb==='guard-on'){
      guardHeld=true;
      if(dodgeTime<=0&&(!currentMove||currentMove.fired)){
        currentMove=queued=null;
        applyQueued();
      }
      return true;
    }
    if(verb==='dodge'){
      if(dodgeTime>0||!spend(16)) return true;
      currentMove=queued=null;guard=false;
      dodgeTime=.32;
      dodgeHeading=steer??flatAngle(enemy,p);
      if(enemy.wind>0&&enemy.wind<.26&&distance(p,enemy)<enemy.profile.reach+.9){
        enemy.wind=0;enemy.grab=false;enemy.stun=1.17;enemy.attackWait=1.20;
        flash('Perfect dodge','opening');
      }else flash('Dodged');
      return true;
    }
    if(!Object.hasOwn(actionStyle,verb)) return false;
    if(guardHeld){flash('Release guard to attack');return true;}
    if(currentMove||dodgeTime>0){
      queued={kind:verb,until:t+.28};
      return true;
    }
    beginMove(verb);
    return true;
  }
  function moveMultiplier(){
    return dodgeTime>0?0:guard?.59:currentMove?.kind==='bow'?.66:1;
  }
  function movementImpulse(dt,tryMove){
    const heading=dodgeTime>0?dodgeHeading:currentMove?.heading;
    if(heading===null||heading===undefined) return;
    const step=dodgeTime>0?7.8*dt:Math.min(currentMove.step,dt*8.8);
    if(step<=0) return;
    const x=p.x+Math.sin(heading)*step,z=p.z+Math.cos(heading)*step;
    if(tryMove(x,z)){p.x=x;p.z=z;}
    if(currentMove) currentMove.step-=step;
  }
  function windUp(e,time,label,target){
    e.wind=e.windLength=time;e.label=label;
    e.heading=flatAngle(e,target);
    e.windAim={x:target.x,z:target.z};
  }
  function advance(dt,buddy,eligible){
    relief=Math.max(0,relief-dt);
    if(!enemy&&eligible&&!state.transit&&relief<=0){
      const missing=progress.abducted;
      const wanted=lookup[progress.target];
      if(missing?.realm===realm&&distance(p,missing)<25) start(lookup[missing.bandit],missing,'rescue');
      else if(wanted?.realm===realm&&distance(p,wanted)<25) start(wanted,wanted,'bounty');
      else if(realm!=='hogwarts'&&state.active&&!missing&&!(realm==='valley'&&Math.hypot(p.x,p.z-10)<45)){
        progress.raidClock+=dt;
        if(progress.raidClock>24&&Math.random()<dt*(progress.raidClock>61?.6:.13)){
          const local=BANDITS.filter(b=>b.realm===realm&&!progress.captured[b.id]);
          const candidate=local[Math.floor(Math.random()*local.length)];
          if(candidate){
            const yaw=p.yaw+Math.PI+(Math.random()-.5)*2.0;
            start(candidate,{x:p.x+8*Math.sin(yaw),z:p.z+8*Math.cos(yaw)},'raid');
          }
          progress.raidClock=0;
        }
      }
    }
    if(!enemy) return;
    if(distance(p,enemy)>41||state.transit){clearEnemy();relief=14;return;}
    const e=enemy;
    e.attackWait-=dt;e.stun=Math.max(0,e.stun-dt);
    const gap=distance(p,e);
    const theta=flatAngle(e,p);
    const aim=e.grab&&buddy?buddy:p;
    const aimGap=distance(aim,e);
    if(e.wind>0){
      e.wind-=dt;
      if(e.wind<=0){
        if(e.grab){
          if(buddy&&state.active&&aimGap<=2.7&&!progress.abducted){
            const stolen=state.active;state.active=null;
            const hideout=walkPoint(e.data.x,e.data.z)??{x:e.x,z:e.z};
            progress.abducted={pet:stolen,bandit:e.data.id,realm,x:hideout.x,z:hideout.z};
            clearEnemy();relief=13;
            say((species[stolen]?.name??'Your friend')+' was taken','Follow the rescue trail shown on the bounty board.','paw');
            return;
          }
          e.grab=false;
        }else if(e.data.style==='bow'){
          enemyArrow=launchArrow(e,e.windAim,false);
        }else if(gap<e.profile.reach&&Math.abs(angleDistance(e.heading,theta))<sweepAngle){
          loseHeart(e.profile.damage);
        }else flash('Bandit missed','opening');
        if(enemy!==e) return;
        e.attackWait=Math.max(e.attackWait,1.15+Math.random()*.4);
      }
    }else if(e.stun<=0){
      const raiding=e.mode==='raid'&&buddy&&state.active&&!progress.abducted;
      if(e.attackWait<=0&&raiding&&distance(buddy,e)<2.35){
        e.grab=true;windUp(e,1.29,grabWarning,buddy);
      }else if(e.attackWait<=0&&gap<e.profile.reach-.25&&(!raiding||gap<1.95)){
        windUp(e,e.profile.windup,e.profile.label,p);
      }else{
        const chase=raiding?buddy:p;
        const delta=distance(e,chase);
        if(delta>(raiding?1.9:e.data.style==='bow'?7.2:1.82)){
          const speed=e.profile.speed*dt,c=flatAngle(e,chase);
          for(const dir of [c,c+.64,c-.64]){
            const x=e.x+Math.sin(dir)*speed,z=e.z+Math.cos(dir)*speed;
            if(walkable(x,z)){e.x=x;e.z=z;break;}
          }
        }
      }
    }
    e.actor.group.position.set(e.x,terrainHeight(e.x,e.z),e.z);
    const heading=e.wind>0?e.heading:e.grab&&buddy?flatAngle(e,buddy):theta;
    e.actor.group.rotation.y+=angleDistance(heading,e.actor.group.rotation.y)*Math.min(1,dt*14);
    animate(e.actor,t,e.stun<=0&&e.wind<=0&&gap>2.2);
    if(e.wind>0)e.actor.arms[0].rotation.x=-1.1-(1-Math.min(1,e.wind))*.55;
    if(e.stun>0)e.actor.model.rotation.z=.13*Math.sin(e.stun*22);
    else e.actor.model.rotation.z=0;
    ring.visible=true;ring.position.set(e.x,terrainHeight(e.x,e.z)+.056,e.z);
    ring.material.color.set(e.wind>0?'#ffbd75':e.stun>0?'#ace6d7':'#d8a9c4');
    ring.material.opacity=e.wind>0?.74+.23*Math.sin(t*24):.78;
    ring.scale.setScalar(e.wind>0?1.25+.12*Math.sin(t*17):1);
    const bowThreat=e.wind>0&&e.data.style==='bow'&&!e.grab;
    dangerPool.visible=e.wind>0&&!bowThreat;
    if(dangerPool.visible){
      const amount=1-e.wind/e.windLength;
      dangerPool.position.copy(ring.position);
      dangerPool.geometry=e.grab?grabArea:sweepArea;
      dangerPool.rotation.y=e.heading;
      dangerPool.scale.setScalar((e.grab?2.7:e.profile.reach)*(.87+.13*amount));
      dangerPool.material.opacity=.35+.40*amount;
    }
    shotLane.visible=bowThreat;
    if(bowThreat){
      const x=(e.x+e.windAim.x)/2,z=(e.z+e.windAim.z)/2;
      shotLane.position.set(x,terrainHeight(x,z)+.08,z);
      shotLane.rotation.y=e.heading;
      shotLane.scale.set(.29,1,distance(e,e.windAim));
    }
    if(rescueModel)animate(rescueModel,t,false);
  }
  function update(dt,{actor,buddy,camera,eligible}){
    t+=dt;
    noticeTimer=Math.max(0,noticeTimer-dt);
    if(hit&&t-hit.at>.76) hit=null;
    const previousDodge=dodgeTime;
    dodgeTime=Math.max(0,dodgeTime-dt);
    if(t>regenAt&&!guard&&!currentMove&&dodgeTime<=0)stamina=Math.min(100,stamina+dt*27);
    if(!enemy)state.health=Math.min(5,state.health+dt*.65);
    advance(dt,buddy,eligible);
    if(enemy){
      findTool(actor);
      if(lock&&dodgeTime<=0&&!currentMove)faceTarget();
      if(currentMove){
        const move=currentMove,style=actionStyle[move.kind];
        move.elapsed+=dt;
        if(!move.fired&&move.elapsed>=style.wind){move.fired=true;resolveMove(move);}
        if(enemy&&currentMove&&move.elapsed>=style.total){currentMove=null;applyQueued();}
      }else if(previousDodge>0&&dodgeTime<=0)applyQueued();
      if(enemy){
        bow.visible=currentMove?.kind==='bow';
        tool.visible=currentMove?.kind==='attack'||(!guard&&!bow.visible);
        shield.visible=guard;
        if(currentMove?.kind==='attack'){
          const phase=currentMove.elapsed/actionStyle.attack.total;
          const swing=Math.sin(Math.min(1,phase)*Math.PI)*2-.58;
          actor.arms[0].rotation.x=-swing;
          actor.arms[0].rotation.z=Math.sin(phase*Math.PI*1.4)*.56;
          actor.model.rotation.y=.31*Math.sin(phase*Math.PI*2);
        }else actor.model.rotation.y=0;
        if(guard||bow.visible)actor.arms[1].rotation.x=-1.06;
        if(dodgeTime>0){
          actor.group.rotation.y=dodgeHeading;
          actor.model.rotation.x=.36*Math.sin(dodgeTime/.32*Math.PI);
        }else actor.model.rotation.x=0;
      }
    }
    enemyArrow=tickArrow(enemyArrow,dt,projectiles[0],false);
    playerArrow=tickArrow(playerArrow,dt,projectiles[1],true);
    screenEffects(camera);
    hudUpdate();
  }
  function resetInput(){
    guard=guardHeld=false;queued=null;
  }
  return{
    action,update,moveMultiplier,movementImpulse,
    direction(angle){steer=angle;},
    aim(angle){aim=angle;},
    get target(){return lock?enemy:null;},
    isFighting:()=>Boolean(enemy),
    setActive(value){active=value;if(!active){resetInput();marker.hidden=direction.hidden=popup.hidden=true;}hudUpdate();},
    setPaused(value){
      paused=value;
      if(paused){resetInput();marker.hidden=direction.hidden=popup.hidden=true;}
      hudUpdate();
    },
    destroy(){
      clearEnemy();hud.remove();marker.remove();direction.remove();popup.remove();
      for(const mesh of [ring,dangerPool,shotLane]){
        mesh.removeFromParent();mesh.material.dispose();
      }
      for(const geometry of [ring.geometry,shotLane.geometry,sweepArea,grabArea]) geometry.dispose();
      projectiles.forEach(arrow=>arrow.removeFromParent());
      container.classList.remove('combat-in-progress');
    }
  };
}
