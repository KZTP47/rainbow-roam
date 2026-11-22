export const petRivals = Object.freeze({
  clover: {name:'Cloverfoot', portrait:'mint', bracket:'Meadow', hp:42, damage:9, coins:8, moves:['jab','heavy','brace']},
  mischief: {name:'Copperwhisk', portrait:'ember', bracket:'Grove', hp:56, damage:11, coins:14, previous:'clover', moves:['brace','jab','heavy','jab']},
  comet: {name:'Cometstride', portrait:'nebula', bracket:'Starlight', hp:70, damage:13, coins:22, previous:'mischief', moves:['heavy','jab','brace','heavy','jab']}
});

export const petMoves = Object.freeze({
  strike: ['Strike','sword','Deal damage. Braced rivals take less.'],
  guard: ['Guard','lock','Reduce damage and counter a big attack.'],
  focus: ['Focus','sparkles','Recover health and power up the next strike once.']
});

export const rivalCues = {
  jab:'A quick attack is coming.',
  heavy:'A big attack is coming.',
  brace:'Your rival is bracing. This is a good time to Focus.'
};

const breedingCost = 2;
const maxOffspring = 64;

export function newPetClub() {
  return {offspring:{}, wins:{}};
}

function offspringId(first,second) {
  return 'nest-'+[first,second].sort().join('~');
}

export function normalizePetClub(raw,species,companions) {
  const club=newPetClub();
  const owned=new Set(companions);
  for(const [id,parents] of Object.entries(raw?.offspring??{})){
    if(Object.keys(club.offspring).length>=maxOffspring) break;
    if(!Array.isArray(parents)||parents.length!==2) continue;
    const [first,second]=parents;
    if(typeof first!=='string'||typeof second!=='string'||first===second||
       !owned.has(first)||!owned.has(second)||!Object.hasOwn(species,first)||!Object.hasOwn(species,second)||
       id!==offspringId(first,second)) continue;
    club.offspring[id]=[first,second];
  }
  for(const id of Object.keys(petRivals)) if(raw?.wins?.[id]===true) club.wins[id]=true;
  return club;
}

export function inheritedPet(state,species,id) {
  const parents=state.petClub?.offspring?.[id];
  if(!Array.isArray(parents)) return null;
  const [body,accent]=parents.map(parent=>species[parent]);
  const name=body.name.split(' ')[0].slice(0,4)+accent.name.split(' ')[0].slice(-4).toLowerCase()+' Sprout';
  return {...body,name,accent:accent.accent,place:'Pet Nursery',
    lore:'Inherits its coat from '+body.name+' and its markings from '+accent.name+'.'};
}

export function availablePets(state) {
  return state.companions.filter(id=>id!==state.bounties?.abducted?.pet&&id!==state.townLife?.trip?.pet);
}

export function breedingParents(state,species) {
  return availablePets(state).filter(id=>Object.hasOwn(species,id));
}

export function breedPet(state,species,first,second) {
  const club=state.petClub;
  const available=breedingParents(state,species);
  if(first===second||!available.includes(first)||!available.includes(second)) return {error:'Choose two different available parents.'};
  const id=offspringId(first,second);
  if(Object.hasOwn(club.offspring,id)) return {error:'This pair already has a Sprout.'};
  if(Object.keys(club.offspring).length>=maxOffspring) return {error:'The nursery is full.'};
  if((state.inventory.treat??0)<breedingCost) return {error:'Bring two Meadow biscuits to breed this pair.'};
  state.inventory.treat-=breedingCost;
  club.offspring[id]=[first,second];
  state.companions.push(id);
  return {id};
}

export function startPetBattle(state,pet,rival) {
  if(!Object.hasOwn(petRivals,rival)) return null;
  const opponent=petRivals[rival];
  if(opponent.previous&&!state.petClub.wins[opponent.previous]) return null;
  return createBattle(state,pet,rival,opponent);
}

export function startWildPetBattle(state,species,pet,rival) {
  if(!Object.hasOwn(species,rival)||state.companions.includes(rival)) return null;
  const {name,kind,trust}=species[rival];
  const moves=kind==='unicorn'||kind==='fox'?['jab','heavy','brace']:
    kind==='snail'||kind==='axolotl'?['brace','jab','heavy']:['jab','brace','heavy'];
  return createBattle(state,pet,rival,{name,portrait:rival,hp:30+trust*10,damage:7+trust*2,moves},true);
}

function createBattle(state,pet,rival,opponent,wild=false) {
  if(!availablePets(state).includes(pet)) return null;
  const stage=state.evolutions?.[pet]??0;
  const friendship=state.care?.[pet]?.affinity??0;
  const maxHP=53+friendship+stage*5;
  return {pet,rival,opponent,wild,maxHP,hp:maxHP,rivalHP:opponent.hp,power:15+stage*2,turn:0,focus:false,result:null,log:''};
}

export function catchWildPet(state,species,battle) {
  if(!battle?.wild||battle.result!=='won'||!Object.hasOwn(species,battle.rival)||state.companions.includes(battle.rival)) return false;
  state.companions.push(battle.rival);
  state.bonds[battle.rival]=species[battle.rival].trust;
  return true;
}

export function rivalMove(battle) {
  const moves=battle.opponent.moves;
  return moves[battle.turn%moves.length];
}

export function playPetTurn(state,battle,move,steps) {
  if(!battle||battle.result||!Object.hasOwn(petMoves,move)) return false;
  const opponent=battle.opponent, intent=rivalMove(battle);
  const incoming=intent==='brace'?0:opponent.damage+(intent==='heavy'?14:0);
  const events=[];
  if(move==='focus'){
    if(battle.focus) events.push('Your next strike is already powered up.');
    else {
      const healed=Math.min(12,battle.maxHP-battle.hp);
      battle.hp+=healed;battle.focus=true;
      events.push(healed?'Recovered '+healed+' HP and focused.':'Ready to power up the next strike.');
    }
  }
  const counter=move==='guard'&&intent==='heavy';
  if(move==='strike'||counter){
    let damage=counter?13:battle.power+(battle.focus?10:0);
    if(intent==='brace') damage=Math.ceil(damage*.4);
    if(move==='strike') battle.focus=false;
    battle.rivalHP=Math.max(0,battle.rivalHP-damage);
    events.push((counter?'Countered for ':'Landed ')+damage+' damage.');
  }
  steps?.push({actor:'player',move:counter?'counter':move,guarded:move==='strike'&&intent==='brace',
    hp:battle.hp,rivalHP:battle.rivalHP});
  if(battle.rivalHP===0){
    battle.result='won';
    if(!battle.wild&&!state.petClub.wins[battle.rival]){
      state.petClub.wins[battle.rival]=true;
      state.wallet.coins+=opponent.coins;
      state.inventory.treat=(state.inventory.treat??0)+1;
      events.push('Earned '+opponent.coins+' Suncoins and a Meadow biscuit.');
    }
  } else {
    const damage=move==='guard'?Math.floor(incoming*.25):incoming;
    battle.hp=Math.max(0,battle.hp-damage);
    if(damage) events.push('Took '+damage+' damage.');
    if(intent==='brace') events.push(opponent.name+' braced.');
    if(!battle.hp) battle.result='lost';
    steps?.push({actor:'rival',move:intent,guarded:move==='guard',hp:battle.hp,rivalHP:battle.rivalHP});
  }
  battle.turn++;
  battle.log=events.join(' ');
  return true;
}
