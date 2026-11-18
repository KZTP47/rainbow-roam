import {activityItems,newTownLife} from './town-life.js';
import {withDialogue} from './dialogue.js';
import {newItems,newRecipes,newSpecies,newWildlife,newVillagers,newRegions,newResources} from './expansion.js';
import {atlas,homeland,horizonSpecies,horizonWildlife,horizonVillagers,horizonRegions,horizonRegionAt,horizonItems,horizonRecipes} from './horizons.js';
import {defaultLook} from './wardrobe.js';
import {farmItems,farmRecipes,newHomestead} from './homestead.js';
import {dungeonRelics} from './dungeon-habitats.js';
import {newDungeons} from './dungeons.js';

export const SAVE_KEY = 'rainbow-roam-celshade-v1';
export const restTimes={sunrise:6.35,sunset:18.05,night:22.15};
export const WORLD_LIMIT = 94;
export const START = { x: 0, z: 10, yaw: 0 };

export const items = {
  ...newItems,
  ...horizonItems,
  ...farmItems,
  ...activityItems,
  ...dungeonRelics,
  nautilusLocket:['Nautilus Locket','gem'],
  moonDial:['Moon-Tide Dial','compass'],
  tideCompass:['Saltglass Tide Compass','compass'],
  wood: ['Wood', 'trees'], stone: ['River stone', 'mountain'], petal: ['Bloom petal', 'flower-2'],
  berry: ['Sunberry', 'cherry'], crystal: ['Starglass', 'gem'], treat: ['Meadow biscuit', 'cookie'],
  charm: ['Rainbow charm', 'sparkles'], plank: ['Timber block', 'box'], brick: ['Stone block', 'brick-wall'],
  fence: ['Garden fence', 'fence'], lantern: ['Bloom lantern', 'lamp'], planter: ['Flower box', 'sprout'],
  roof: ['Rose roof', 'house'], stool: ['Wooden bench', 'armchair'],
  hpPotion:['Heartleaf potion','heart']
};

export const recipes = {
  treat: { cost: { berry: 2, petal: 1 }, count: 3 },
  charm: { cost: { crystal: 2, petal: 2 }, count: 2 },
  plank: { cost: { wood: 2 }, count: 4, build: true },
  brick: { cost: { stone: 2 }, count: 4, build: true },
  fence: { cost: { wood: 2 }, count: 3, build: true },
  lantern: { cost: { wood: 1, crystal: 1 }, count: 2, build: true },
  planter: { cost: { wood: 2, petal: 2 }, count: 2, build: true },
  roof: { cost: { wood: 2, petal: 1 }, count: 3, build: true },
  stool: { cost: { wood: 3 }, count: 1, build: true },
  ...newRecipes,
  ...horizonRecipes,
  ...farmRecipes,
  hpPotion:{cost:{berry:2,petal:1},count:1}
};

export const species = {
  lanternbell:{reefIcon:'jellyfish',name:'Lanternbell',family:'Pearl jelly',kind:'belljelly',color:'#c79be6',accent:'#ffe3a4',favorite:'petal',trust:1,place:'Undertow · Pearl Nursery',lore:'Its bell lights up at the touch of a petal. Hatchlings bob together in the shelter of the wreck.'},
  pennyglide:{reefIcon:'skate',name:'Pennyglide',family:'Copper skate',kind:'silkskip',color:'#dd9568',accent:'#a4e8d3',favorite:'berry',trust:1,place:'Undertow · Copper Gardens',lore:'This palm-sized ray sifts copper pennies out of the sand and stacks them beneath its favorite fan coral.'},
  dewbutton:{name:'Dewbutton',family:'Blossom snail',kind:'snail',color:'#a8c781',accent:'#d98a91',favorite:'berry',trust:1,place:'Petalwick',lore:'It carries a tiny daisy garden on its spiral shell and stretches up to sniff sunberries.'},
  pearly: { name: 'Pearlyspark', family: 'Rainbow unicorn', kind: 'unicorn', color: '#fff2df', accent: '#ee83ab', favorite: 'treat', trust: 1, place: 'Petalwick', lore: 'Tiny rainbows follow it through the dew. It always circles back for friends.' },
  dawn: { name: 'Dawnwhirl', family: 'Rainbow unicorn', kind: 'unicorn', color: '#ffe1bb', accent: '#fa9a77', favorite: 'treat', trust: 2, place: 'Sunseed Fields', lore: 'It races the first rays of morning and naps wherever it loses.' },
  nebula: { name: 'Nebulamane', family: 'Rare rainbow unicorn', kind: 'unicorn', color: '#e5d5ff', accent: '#ae8af8', favorite: 'charm', trust: 2, place: 'Starglass Ridge', lore: 'The prismatic glow in its mane is brightest when it hums.' },
  mint: { name: 'Mintskip', family: 'Clover hare', kind: 'hare', color: '#bcebad', accent: '#e3f8ca', favorite: 'berry', trust: 1, place: 'Blushwood', lore: 'A curious little hare with ears as soft as new clover.' },
  peach: { name: 'Peachpuff', family: 'Cloud hare', kind: 'hare', color: '#ffc9ad', accent: '#fff1dd', favorite: 'berry', trust: 1, place: 'Petalwick', lore: 'It stuffs fallen petals into its burrow to make the floor smell sweet.' },
  moss: { name: 'Mossmallow', family: 'Moss fox', kind: 'fox', color: '#91c692', accent: '#fff0cf', favorite: 'treat', trust: 1, place: 'Blushwood', lore: 'The white tip of its tail bobs between trees like a tiny lantern.' },
  ember: { name: 'Emberbun', family: 'Honey fox', kind: 'fox', color: '#ea9960', accent: '#fff1d9', favorite: 'berry', trust: 2, place: 'Sunseed Fields', lore: 'It curls up beside campfires and listens to people tell stories.' },
  ripple: { name: 'Ripplefin', family: 'Pond axolotl', kind: 'axolotl', color: '#f895c0', accent: '#f65a9e', favorite: 'berry', trust: 1, place: 'Mirrormere', lore: 'It collects round stones and occasionally shares them with passing ducks.' },
  dew: { name: 'Dewdrop', family: 'Glimmer axolotl', kind: 'axolotl', color: '#91dee3', accent: '#b587ed', favorite: 'treat', trust: 2, place: 'Mirrormere', lore: 'When it shakes its frills, they scatter drops that look like stars.' },
  thimble: { name: 'Thimblewing', family: 'Meadow sprite', kind: 'sprite', color: '#c8aff0', accent: '#ffc5ec', favorite: 'petal', trust: 2, place: 'Starglass Ridge', lore: 'This shy little sprite lands on anything the same color as its wings.' },
  ...newSpecies,
  ...horizonSpecies
};

export const wildlife = [
  ['pearly', 3.78, 4.7, .40], ['peach', -8, 2, 2], ['mint', -29, -11, 3],
  ['moss', -42, -25, 3], ['ripple', 14, -12, 1], ['dew', 32, 4, 2],
  ['dawn', -22, 37, 3], ['ember', 17, 42, 3], ['thimble', 27, -46, 3], ['nebula', 43, -54, 2],
  ...newWildlife,
  ['dewbutton', -2.8, 4.65, .46],
  ...horizonWildlife
];

export const villagers = [
  { id:'poppy', name:'Poppy', role:'Valley ranger', x:-1.95, z:7.25, colors:['#ef9b78','#587c54','#7b4439'], quest:'A little hello', find:'Befriend Pearlyspark in the meadow', goal:{ bond:'pearly' }, reward:{ berry:5, petal:2 }, intro:'Hello! I saved you a meadow biscuit. Pearlyspark is the little unicorn to the east. We’ve been putting out a biscuit every morning, and today it waited for someone to sit with it.', done:'It usually trots away after its biscuit. See how it’s waiting for you? I think it’s been gathering up the courage to leave the meadow.', after:'I used to keep a list of every place I’d seen Pearlyspark. Now I suppose you’ll have to tell me where it goes.' },
  { id:'fern', name:'Fern', role:'Carpenter', x:-7, z:-10, colors:['#c7825f','#4e9290','#4e3743'], quest:'Room to grow', find:'Craft and place a timber block', goal:{ place:'plank' }, reward:{ wood:6, stone:4 }, intro:'I grew up in a traveling wagon. Funny how badly I want a place that stays put now. Try a timber block in your meadow. A house starts with exactly one decision.', done:'You put the first piece down! That took me three years. Come borrow my good wood anytime.', after:'If you aim at the side of a block, the next one snaps beside it. Aim at the top and you can build another story.' },
  { id:'mimi', name:'Mimi', role:'Seed keeper', x:6, z:-12, colors:['#d69777','#e290a5','#8a5168'], quest:'Petals by post', find:'Bring Mimi 3 bloom petals', goal:{ item:'petal', count:3 }, reward:{ berry:5, wood:3 }, intro:'My sister moved beyond the ridge. She wrote that spring smells different there. Could you find three bloom petals for her letter? I want her to open it and be home for a second.', done:'Oh, these smell like the lane outside our old house. I’ll slip them into the envelope while they’re still fresh.', after:'She wrote back! She says the petals fell all over her kitchen floor. I think that means she liked them.' },
  { id:'jun', name:'Jun', role:'Tinkerer', x:-1.5, z:-16, colors:['#c4876d','#ac7fbd','#373653'], quest:'A light of our own', find:'Craft and place a bloom lantern', goal:{ place:'lantern' }, reward:{ crystal:3, treat:2 }, intro:'I’m afraid of the deep woods after sunset. I invent things instead of admitting it. Try building one of my bloom lanterns. Bring the recipe into the world so I know it works.', done:'It looks like a star you can leave by the door. I’m going to put one at the turn in the forest trail.', after:'I walked as far as the lantern last night. Tomorrow I’m going to try the next bend.' },
  { id:'luma', name:'Luma', role:'Pond naturalist', x:14, z:-7, colors:['#e0ad8b','#69afc3','#416179'], quest:'A ripple in the reeds', find:'Befriend Ripplefin at Mirrormere', goal:{ bond:'ripple' }, reward:{ stone:5, crystal:1 }, intro:'Every afternoon Ripplefin leaves one round pebble by my boots. I’ve never seen where it finds them. Try offering a sunberry when it comes to the bank.', done:'So that’s where the smooth pebbles are! If it brings you one, put it someplace you can see it first thing in the morning.', after:'I’m making a sketchbook of all the pebbles. Today’s is shaped exactly like a potato.' },
  { id:'tansy', name:'Tansy', role:'Herbalist', x:-25, z:-11, colors:['#aa6b4b','#d6a94f','#4c3742'], quest:'Biscuits for the woods', find:'Craft meadow biscuits at least once', goal:{ craft:'treat' }, reward:{ petal:5, berry:4 }, intro:'My gran made biscuits on the windowsill because the kitchen was too hot. The foxes came for the smell. Try her recipe. Two sunberries and a bloom petal will make a batch.', done:'You got the smell exactly right. I might have to open the windows and see who comes by.', after:'Mossmallow will pretend it doesn’t want one. Wait a moment. It always does.' },
  { id:'sol', name:'Sol', role:'Orchard keeper', x:-8, z:31, colors:['#c58a63','#ca825b','#573957'], quest:'Breakfast at sunrise', find:'Befriend Dawnwhirl in Sunseed Fields', goal:{ bond:'dawn' }, reward:{ wood:8, treat:4 }, intro:'Dawnwhirl used to meet my dad at the orchard gate. I still set out a biscuit there. If you make friends with it, tell me how the little thing is doing.', done:'You saw it do that funny sideways hop? Dad said it only did that when it was happy. I’m glad it’s still got it in it.', after:'I’m planting another row of sunberries. There’s no such thing as too many breakfast guests.' },
  { id:'orion', name:'Orion', role:'Stargazer', x:31, z:-42, colors:['#dbac8d','#677db4','#e4cfad'], quest:'Where the rainbow lands', find:'Befriend Nebulamane on Starglass Ridge', goal:{ bond:'nebula' }, reward:{ crystal:6, charm:2 }, intro:'I came here thinking I could measure the end of a rainbow. All I found was a set of little hoofprints. Bring two rainbow charms if you go looking. Nebulamane likes the way starglass sings.', done:'I’ve spent years looking through a telescope for that little face. Here it is, happy to come say hello at ground level.', after:'I packed away the telescope for the afternoon. We can watch the sky with our own eyes for once.' },
  ...newVillagers,
  ...horizonVillagers
].map(withDialogue);

export const regions = {
  village: { name:'Petalwick', note:'THE BLOSSOM VALLEY', x:0, z:-7, color:'#f0b3bd' },
  grove: { name:'Blushwood', note:'THE BLOSSOM FOREST', x:-35, z:-15, color:'#e2a1bc' },
  lake: { name:'Mirrormere', note:'THE WATERFALL BASIN', x:25, z:-13, color:'#a0d9d7' },
  ridge: { name:'Starglass Ridge', note:'THE PRISMATIC HIGHLANDS', x:37, z:-48, color:'#b7a7dc' },
  fields: { name:'Sunseed Fields', note:'THE GOLDEN MEADOWS', x:-7, z:38, color:'#e4c583' },
  ...newRegions,
  ...horizonRegions
};

export function regionAt(x,z,realm=homeland) {
  if(realm!==homeland) return horizonRegionAt(realm,x,z);
  const district=Object.entries(newRegions).find(([,r])=>Math.hypot(x-r.x,z-r.z)<r.radius);
  if(district) return district[0];
  if (z < -34) return 'ridge';
  if (z > 23) return 'fields';
  if (x < -19) return 'grove';
  if (x > 12) return 'lake';
  return 'village';
}

export const resourceSpots = [
  ['wood',-3,7],['wood',-5,4],['stone',3,7],['stone',9,5],['petal',-2,4],['petal',5,1],
  ['berry',7,8],['berry',-7,6],['crystal',9,0],['wood',-8,-4],['stone',8,-5],
  ...Object.values(regions).slice(0,5).flatMap(({x,z}, zone) => Array.from({length:26}, (_, i) => {
    const angle = i * 2.39996 + zone;
    const radius = 5 + i * .61;
    const type = ['wood','petal','berry','stone',zone === 2 || zone === 3 ? 'crystal' : 'berry'][i % 5];
    return [type, x + Math.cos(angle) * radius, z + Math.sin(angle) * radius];
  })),
  ...newResources
];

export function newGame() {
  return {
    version:1, realm:homeland, transit:null, stamp:{}, care:{}, magic:{house:null,known:[],mastered:{}}, look:{...defaultLook}, player:{...START}, inventory:{ treat:1, wood:4, berry:2 }, bonds:{},
    companions:[], evolutions:{}, active:null, quests:{poppy:'active'}, crafted:{}, placed:{}, blocks:[],
    wallet:{coins:30,badges:0},homestead:newHomestead(),loot:[],townLife:newTownLife(),bounties:{target:null,captured:{},abducted:null,raidClock:0},
    spirehaven:{dials:{},aligned:false},roomActivities:{},trails:{},dungeons:newDungeons(),health:5,
    discoveries:['village'], harvested:{}, selected:'plank', trackingItem:null, trackingQuest:null, sound:true, time:8
  };
}

export function canAfford(inventory, cost) {
  return Object.entries(cost).every(([id, count]) => (inventory[id] ?? 0) >= count);
}

export function questReady(quest, state) {
  const {bond, place, item, count, craft, stamp, quests, house, spell} = quest.goal;
  if (stamp) return Boolean(state.stamp[stamp]);
  if (quests) return quests.every(id=>state.quests[id]==='done');
  if (house) return Boolean(state.magic.house);
  if (spell) return Boolean(state.magic.mastered[spell]);
  if (bond) return state.companions.includes(bond);
  if (place) return (state.placed[place] ?? 0) > 0;
  if (craft) return (state.crafted[craft] ?? 0) > 0;
  return (state.inventory[item] ?? 0) >= count;
}



