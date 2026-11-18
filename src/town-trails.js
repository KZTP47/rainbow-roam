import {wards} from './city-wards.js';
import {newRegions} from './new-regions.js';
import {regionalDesigns} from './regional-designs.js';

// The inn's eyewitness identifies a mark that can be matched at the landmark.
const mysteries={
  opalreach:['The Missing Spectrum','split sun','A cutter saw the white beam separate into two suns.','Prismatic Sundial'],
  hushsnow:['Footprints in the Whiteout','three bootprints','The shelter runner took three steps before the snow covered the trail.','Snowbell Brooch'],
  brambleglass:['The Keeper’s Way Home','paired flames','Two grove tenders hung their lamps side by side that night.','Twin Wick Lantern'],
  pearldrift:['The Last Crossing','white pennant','The last ferry carried a white pennant on its stern.','Pearl Ferryman’s Token'],
  shellmirror:['A Tide That Stayed','crescent shell','The pool left a crescent on the shell collector’s sleeve.','Moonwash Cameo'],
  windspool:['The Mender’s Signature','crossed spindles','The seamstress signed her work with two crossed spindles.','Sailmaker’s Shuttle'],
  claycup:['The Potter’s First Firing','cracked cup','The apprentice kept a cracked cup from her first firing.','First Glaze Teacup'],
  thornpost:['A Letter on the Wind','forked kite tail','The courier’s kite had a fork in its tail that morning.','Kitepost Wind Rose'],
  coppercap:['A Light Under Copper','spotted cap','The lamplighter sketched white spots beneath a copper cap.','Coppercap Nightlight'],
  belltarn:['The Bell With No Clapper','silent bell','A traveler heard every bell except the one without a clapper.','Tarn Echo Chime'],
  sunhammer:['An Apprentice’s Proof','hammer and sun','The smith struck a hammer mark through a sun on her first ingot.','Dawnforge Medallion'],
  inkroot:['The Unnumbered Page','folded leaf','The missing leaf of the ledger was folded at one corner.','Inkroot Ex Libris'],
  goldgraft:['The Orchard’s Eldest Branch','double apple','Two apples grew from one stem on the oldest tree.','Golden Grafting Knife'],
  reedwatch:['The High-Water Ledger','three ripples','The ferry hand cut three ripples into the old flood gauge.','Reedwatch Plumb Line'],
  honeywarden:['The Queen’s First Garden','six petals','The first swarm settled beside a flower with six petals.','Honeywarden Wax Seal'],
  stellarcairn:['A Chart for Cloudy Nights','crooked crown','The night porter saw five stars bent into a crooked crown.','Northern Pocket Astrolabe'],
  redfan:['The Last Cool Seat','folded fan','The artisan marked the coolest seat with a folded fan.','Painted Shade Fan'],
  rainchain:['A Measure of Rain','brimming cup','The gauge keeper remembered a cup filled just to its lip.','Brass Raindrop Vial'],
  saltbanner:['The Signal Before Dawn','striped sail','The harbor watch recorded a striped sail at first light.','Leeward Signal Pin'],
  fernwick:['The Spring That Returned','curled fern','A curled fern broke through the stones before the water returned.','Fernwick Spring Stone']
};
const requests={
  opalreach:['The cutter’s old sundial has lost its inlay. There is a sketch of the missing face in the inn ledger.','The restored dial casts a little violet line across the counter.'],
  hushsnow:['A shelter runner failed to sign out after the last whiteout. Find the entry from the traveler who came down after her.','The boot marks lead to the lower shelter. The runner got everyone inside.'],
  brambleglass:['One of the two grove lamps came home without its keeper’s tag. The night porter kept a list of the returning pairs.','The keepers can finally hang their lamps side by side again.'],
  pearldrift:['The ferryman left a pearl token for the passenger on the last crossing. Check who signed in after the ferry docked.','The last passenger recognizes the flag and asks you to keep the token.'],
  shellmirror:['A shell collector drew yesterday’s tide before it went out. One corner of the drawing is missing. Check her entry at the inn.','The collector lines up the two drawings. The lost corner shows her favorite pool.'],
  windspool:['A patched sail came back without its maker’s label. The traveling menders signed the guestbook with their own marks.','The signature fits the patch. The mender is credited on the sail at last.'],
  claycup:['The kiln shed has its first ever glaze sample, but the name wore away. Its apprentice stayed at the inn.','The potters put the apprentice’s name back on the display.'],
  thornpost:['A letter drifted down without an address. Someone at the inn saw which kite let it loose.','The letter goes back to the kite courier with its seal intact.'],
  coppercap:['A brass lamp shade fits none of the shop’s lamps. The mushroom gatherer drew its original shape at the inn.','The repaired shade throws a neat circle under the mushroom lamps.'],
  belltarn:['The maker’s ledger lists one more bell than anyone remembers hearing. Read the watchman’s account at the inn.','The quiet bell was a memorial. Its place is marked again.'],
  sunhammer:['A first-year smith’s proof has gone missing from the display. The smith described the impression at supper.','The recovered mark earns the apprentice a place in the guild ledger.'],
  inkroot:['A page slipped out before the archivist could number it. A reader at the inn recorded its unusual binding mark.','The loose page slides between two entries that finally make sense together.'],
  goldgraft:['The orchard needs the parent tree of an old graft. A picker drew the fruit beside her entry in the guestbook.','A fresh label hangs on the oldest branch before the next pruning.'],
  reedwatch:['The flood ledger lost a leaf in spring. A ferry hand sleeping at the inn copied the old gauge.','The boatwright restores the high-water line before the reeds hide it again.'],
  honeywarden:['A queen swarm has left its box. Find the inn guest who saw its first resting place.','The keeper prepares the same flowers beside a fresh hive.'],
  stellarcairn:['Clouds covered the last line on a survey chart. The night porter made a sketch just before the sky closed.','The new chart will guide travelers even when the summit disappears in cloud.'],
  redfan:['A traveling fan maker promised a cool seat to the next apprentice. His last direction is in the inn ledger.','The apprentice finds the shaded seat just as the noon bell rings.'],
  rainchain:['Two measures disagree after a storm. The inn kept the gauge keeper’s original calibration sketch.','The brass measure agrees with the oldest gauge again.'],
  saltbanner:['The harbor book lost its dawn signal in a splash of salt water. A lookout copied it before breakfast.','The missing signal returns to the harbor book beside the lookout’s name.'],
  fernwick:['The springhouse floor hides the first warm vent. A gardener described where it broke through.','The bath steward sets the stone beside the reopened vent.']
};
export const stops=['market','inn','landmark','market','inn'];
export const trails=Object.fromEntries(Object.entries(mysteries).map(([id,[title,mark,witness,reward]],i)=>{
  const town=newRegions[id],venue=regionalDesigns[id];
  const marks=Object.values(mysteries).map(row=>row[1]);
  const choices=[mark,marks[(i+7)%marks.length],marks[(i+13)%marks.length]];
  choices.push(...choices.splice(0,i%3));
  const directions=[
    'Read the shopkeeper’s note at '+venue.shop+'.',
    'Look in the guestbook at '+venue.inn+' for the eyewitness account.',
    'Find '+town.landmark+' and match a carving. Your clue: '+witness,
    'Bring the rubbing to '+venue.shop+' and reproduce its pattern at the note stand.',
    'Take the restored pattern to the guestbook at '+venue.inn+'.'
  ];
  return [id,{title,mark,witness,reward,choices,directions,story:requests[id],item:'keepsake-'+id}];
}));

export function advanceTrail(state,realm,stop,stage){
  const trail=trails[realm];
  if(!trail||stage!==(state.trails[realm]??0)||stops[stage]!==stop) return false;
  state.trails[realm]=stage+1;
  if(stage+1===stops.length) state.inventory[trail.item]=(state.inventory[trail.item]??0)+1;
  return true;
}

export const clearings={
  hushsnow:{id:'frostfern',name:'Frostfern Hollow',x:32,z:27,flower:'#a3c8f5',pet:'Rimewhisk',kind:'hare',color:'#e4ecfa',accent:'#97add3',food:'berry',lore:'It curls up beneath blue frostferns and listens for berries falling on the snow.'},
  brambleglass:{id:'emberbells',name:'Emberbell Glade',x:-31,z:27,flower:'#ffac86',pet:'Cinderwing',kind:'moth',color:'#b26c75',accent:'#ffce83',food:'petal',lore:'Its warm wing spots look like lanterns drifting between the bellflowers.'},
  stellarcairn:{id:'starcups',name:'Starcup Terrace',x:33,z:26,flower:'#bda1ea',pet:'Nebble',kind:'fox',color:'#82799f',accent:'#dec8ec',food:'berry',lore:'It follows the pale starcups until their tips catch the last light.'}
};

export const friendHabitats={...Object.fromEntries(Object.values(wards).map(w=>[w.pet[0],w.place])),dewbutton:'village',...Object.fromEntries(
  Object.values(clearings).map(g=>['pet-'+g.id,g.id]))};

// Only the current table round is transient. Clues and prizes use the regular save.
export function createTrailGames(state,{menu,persist,play,inside}){
  let round=null;
  const runes=['Leaf','Moon','Star','Shell'];
  const roll=n=>Math.floor(Math.random()*n);
  const current=()=>state.trails[state.realm]??0;
  function show(name,text,choices=[],note=null){
    const region=newRegions[state.realm];
    menu('dialog',{npc:{name,role:region.name,colors:['',region.palette[2]]},text,note,
      choices:choices.length?choices:null,button:'Close',command:'close'});
  }
  const option=(label,id)=>({label,command:'town-trail:'+id});
  function visit(stop){
    const trail=trails[state.realm],stage=current();
    if(stop!==stops[stage]) return;
    if(stage===2){
      show(trail.title,'Three old carvings are visible on the landmark. Which matches the eyewitness account?',
        trail.choices.map((label,i)=>option(label,'mark/'+i)));
      return;
    }
    if(stage===3){startGame('memory',true);return;}
    if(!advanceTrail(state,state.realm,stop,stage)) return;
    persist();
    const messages=[
      trail.story[0],
      trail.witness+' A margin note says the same mark was cut into the town landmark.',
      '', '', trail.story[1]+' The innkeeper gives you the '+trail.reward+' to keep.'
    ];
    show(trail.title,messages[stage],[],trail.directions[stage+1]);
    play(stage===4?'success':'gather');
  }
  function startGame(type,quest=false){
    const room=inside();
    const service=type==='memory'?'market':'inn';
    if(room?.service!==service||room.realm!==state.realm) return;
    round={room:room.id,type,quest,picks:[]};
    if(type==='memory'){
      round.sequence=Array.from({length:4},()=>roll(runes.length));
      show('Pattern Press','Memorize the four stamps from left to right.',
        [option('Cover the pattern','cover')],round.sequence.map(i=>runes[i]).join(' · '));
    }else{
      round.weights=[1,2,3,4].map((n,i)=>n*2+roll(2));
      const a=roll(4),b=(a+1+roll(3))%4;
      round.target=round.weights[a]+round.weights[b];
      draw();
    }
  }
  function draw(){
    if(round.type==='memory'){
      show('Pattern Press','Stamp the pattern from memory. Impression '+(round.picks.length+1)+' of 4.',
        runes.map((label,i)=>option(label,'pick/'+i)),round.picks.map(i=>runes[i]).join(' · '));
    }else{
      show('Pantry Scales','Balance '+round.target+' ounces using exactly two weights.',
        round.weights.flatMap((w,i)=>round.picks.includes(i)?[]:[option(w+' oz','pick/'+i)]),
        round.picks.length?'On the pan: '+round.weights[round.picks[0]]+' oz':'The pan is empty.');
    }
  }
  function act(id){
    const trail=trails[state.realm];
    if(!trail) return;
    const [verb,arg]=id.split('/');
    if(verb==='visit'){if(inside()?.service===arg) visit(arg);return;}
    if(verb==='mark'){
      if(current()!==2||inside()) return;
      if(trail.choices[Number(arg)]!==trail.mark){
        show(trail.title,'The lines do not match the drawing.',[option('Examine the carvings again','inspect')],trail.witness);
        return;
      }
      advanceTrail(state,state.realm,'landmark',2);persist();play('gather');
      show(trail.title,'You press paper over the '+trail.mark+' and lift a clear rubbing.',[],trail.directions[3]);return;
    }
    if(verb==='inspect'){visit('landmark');return;}
    if(verb==='memory'||verb==='scale'){startGame(verb);return;}
    if(!round||round.room!==inside()?.id) return;
    if(verb==='cover'){round.covered=true;draw();return;}
    if(verb!=='pick'||!['0','1','2','3'].includes(arg)) return;
    const pick=Number(arg),memory=round.type==='memory';
    if(memory&&!round.covered||!memory&&round.picks.includes(pick)) return;
    round.picks.push(pick);
    const wrong=memory?pick!==round.sequence[round.picks.length-1]:
      round.picks.length===2&&round.picks.reduce((n,i)=>n+round.weights[i],0)!==round.target;
    if(!wrong&&round.picks.length<(memory?4:2)){draw();return;}
    const quest=round.quest,type=round.type;
    round=null;
    if(wrong){
      show(memory?'A slipped stamp':'The pans tip','Try a fresh round.',
        [option('Try again',quest?'visit/market':type)]);return;
    }
    if(quest) advanceTrail(state,state.realm,'market',3);
    state.wallet.coins+=3;persist();play('success');
    show(memory?'A perfect impression':'Perfect balance','You earned 3 Suncoins.',[],quest?trail.directions[4]:null);
  }
  function roomChoices(room){
    const stage=current(),options=[];
    if(stops[stage]===room.service) options.push(option((stage?'Follow clue · ':'Start trail · ')+trails[state.realm].title,'visit/'+room.service));
    options.push(room.service==='market'?option('Play Pattern Press','memory'):option('Play Pantry Scales','scale'));
    return options;
  }
  return {act,visit,roomChoices};
}
