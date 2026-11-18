import {frontierChapters,frontierPlaces} from './frontier.js';
import {townResidents} from './town-data.js';
import {skyOrigin,skyIslands} from './sky-islands.js';
import {seeded} from './map-data.js';
import {silverrun,silverrunPlaces,silverrunRegionAt,silverrunResidents,silverrunResources} from './silverrun.js';
import {silvercoast,silvercoastPlaces,coastRegionAt,coastResidents,coastResources} from './silvercoast.js';

import {wardWorkshops} from './ward-workshops.js';
import {wards,wardPetPoint} from './city-wards.js';
import {clearings,trails} from './town-trails.js';

export const homeland='valley';

const quadrants=[[-23,22],[24,22],[24,-23],[-23,-23]];
const chapters={
  ...frontierChapters,
  coast:{
    name:'Saltwind Coast', tagline:'Sea arches and tide pools', material:'salt', supply:['Tide salt','gem','lilac'],
    food:'saltcrisp', treat:['Seafoam crisp','cookie','green'], colors:['#83b6ab','#efd19c','#4c95ac','#eadbc8'], height:1.6,
    places:[
      ['brine','Brinewatch Quay','Harbor lookout','Noor','The missing bell','The ferry bell sank in last week’s storm. Tide salt carries sound farther than brass. Could you fill a new clapper with it?','Now the boats can hear us from beyond the point.','Skimmerkin','gull','#f4ece0','#729fb3'],
      ['scallop','Apricot Tidepools','Warm rock pools','Nessa','A visitor below the ripples','The tide left a little crab in the shallow pools. It hides when I bring my bucket, but it comes out for seafoam crisps.','It showed you its blue claw! I’ll draw it for the harbor ledger.','Peacheshell','crab','#eca28a','#806da3'],
      ['glass','Seaglass Strand','The green glass shore','Marin','The green line','Follow the shells to the tide arch and mark the highest line the sea reached. My grandfather’s marks stopped halfway up the old rock.','The sea reached farther than he thought it would. We can move the nest boxes tomorrow.','Glasswake','turtle','#7fb7bb','#e1cd98'],
      ['lanternkey','Lantern Key','Signal station','Fia','All lights accounted for','Noor, Nessa and Marin are keeping the signal records. When their entries are ready, I’ll light the old station and send our first night ferry home.','There it goes. A single light for an entire boat of people.','Beaconwhirl','unicorn','#dae4ed','#dcaa67']
    ]
  },
  woods:{
    name:'Elderwood', tagline:'Ancient trees and living libraries', material:'caplace', supply:['Lacecap','sprout','pink'],
    food:'woodcake', treat:['Lacecap bun','cookie','ochre'], colors:['#809e77','#b3ca89','#786486','#e7a1be'], height:1.2,
    places:[
      ['books','Barkbound Library','Books in the roots','Elowen','A book left open','The paper moths read the newest pages before I do. A little lacecap paste will close the loose binding on their favorite book.','I added a leaf-shaped bookmark. I wonder if they’ll use it.','Marginalia','moth','#ddbded','#e8c3a0'],
      ['hazel','Hazel Lantern Walk','Silken orchard paths','Sable','The keeper of warm things','Thimblefox checks each lantern on the lane. Share a lacecap bun and see if it will introduce you to the others.','It always shows its friends the lantern under the bent branch.','Thimblefox','fox','#b46f6f','#efd4b0'],
      ['fallen','The Fallen Crown','Heart of the fallen tree','Ren','Rings of rain','The old tree broke after a wet year. Take a rubbing at the rings so Elowen can date the storms.','I count seventeen wet years. Suddenly my boots feel very temporary.','Ringshell','hedgehog','#8f706d','#f2c5b6'],
      ['canopy','Rainspindle Canopy','Where rain bends','Mora','The hollow-tree archive','The archive is ready for a new shelf. Help the librarian, lantern keeper, and tree reader before I arrange the new pages.','Three small records gave me a whole forest’s history.','Rainspindle','dragon','#a1bd9b','#ba85af']
    ]
  },
  frost:{
    name:'Winterglass Range', tagline:'Snowfields and hot springs', material:'rime', supply:['Rime blossom','flower-2','lilac'],
    food:'rimepop', treat:['Frost plum pop','cookie','lilac'], colors:['#c5dae7','#dfedf1','#8c99c7','#efc8eb'], height:3.2,
    places:[
      ['sled','Bellrunner Pass','High sled road','Rurik','Warmth for the sled shed','The sled ropes have iced over. Rime blossom softens the resin when it melts. Can you find enough for a batch?','The first runners can leave at dawn. I’ll put a blanket on the spare sled.','Blizzlet','hare','#edf4fc','#b9a1d5'],
      ['opal','Opal Warmbanks','Springs beneath snow','Yuki','The steam dancer','Little Steamfin rests wherever the water meets snow. Try a frost plum pop when it stops moving.','It puffs three times when it’s happy. I finally heard the third.','Steamfin','axolotl','#edbaab','#a8bbeb'],
      ['aurora','Aurora Cairns','The aurora listening stones','Mina','North by the small stones','Find the cairn with the three pale stones. The people who built it put the smallest stone on top so a child could finish it.','There’s a small handprint in the frost. I’d like to leave one too.','Polarsong','owl','#cee0e9','#7f90bd'],
      ['winterglass','Winterglass Observatory','The winter lens','Siri','The thaw almanac','Collect the work from the pass, the banks and the cairns. Once it’s in the almanac, the valley can plan for its first thaw.','I left a blank column for the years we haven’t lived yet.','Nightskein','unicorn','#d1c4f1','#6baad2']
    ]
  },
  mesa:{
    name:'Painted Mesa', tagline:'Red cliffs and desert gardens', material:'ochregrass', supply:['Suncup seed','sprout','ochre'],
    food:'sunwafer', treat:['Suncup wafer','cookie','ochre'], colors:['#d6ae7b','#eed49e','#be7867','#bbd080'], height:2.5,
    places:[
      ['caravan','Saffron Waystation','Caravan market','Safiya','Tea for late arrivals','When the tents go quiet I leave a pot on for late arrivals. Could you bring suncup seeds to steep in it?','There’s exactly enough for everyone from the last caravan.','Teakettle','mouse','#c79474','#f3c06a'],
      ['arches','Redwhistle Arches','Sandstone whistles','Amir','Whistle back','Little Whistlewing can repeat the note the wind makes in the largest arch. Offer a wafer and listen close.','There’s a trill at the end. I never heard it from the other side.','Whistlewing','gull','#dfb577','#f1e4ad'],
      ['cactus','Blue Agave Steps','The sky cactus garden','Solana','A blueprint in clay','My aunt carved the old irrigation route into the garden marker. Find it before the shade moves off the steps.','She marked where we were allowed to splash. I forgot that part.','Spinebloom','hedgehog','#76a68c','#ead591'],
      ['sunwell','Sunwell Terrace','The high cistern','Nadim','First water','Help the waystation, the wind recorder, and the garden keeper. Our terrace opening needs something from all three.','Listen to the cistern. It always sounds like someone setting a table.','Duneflare','dragon','#dd9770','#d8b87f']
    ]
  },
  delta:{
    name:'Lotus Delta', tagline:'Reeds, bridges and violet waterways', material:'reedpearl', supply:['Reed pearl','gem','green'],
    food:'lotusroll', treat:['Lotus rice roll','cookie','green'], colors:['#79b49d','#b6d59c','#5ba2ac','#e4a5c3'], height:.75,
    places:[
      ['ink','Inkreed Landing','Boat-letter exchange','Lien','Letters to the far bank','The boat courier keeps losing the wax seals to humidity. Reed pearls make good weights. Could you spare three?','This bundle will make it through the afternoon rain.','Inkspot','crab','#859abd','#e6d0af'],
      ['lotus','Lantern Lotus','Garden of giant lilies','Mali','A lily for two','Pondwink comes ashore for lotus rice rolls. Sit on its side of the flowers if you want to make a friend.','It followed you without getting its feet wet. I didn’t know it could do that.','Pondwink','axolotl','#c2a6e4','#e28cae'],
      ['stones','Skipping Stone Bend','A bend in the reed maze','Asha','Five circles','The marker by the stepping stones is where my dad taught me to skip rocks. Could you find it and count the circles cut into the stone?','Five circles. Coincidentally the most skips he ever managed.','Rippleback','turtle','#78a994','#b4d098'],
      ['song','Heron Song House','Pavilion above the reeds','Bao','The river’s third verse','Hear the stories from Lien, Mali, and Asha. The old song has room for three new verses this year.','We’ll sing the first two verses on the way out and all three on the way back.','Reedsong','gull','#c1e3e5','#686f9f']
    ]
  },
  sky:{
    name:'The Aerie', tagline:'Ten floating islands above the mainland, linked by wind ferries', material:'skyfloss', supply:['Skyfloss','sparkles','lilac'],
    food:'skymeringue', treat:['Skyfloss meringue','cookie','lilac'], colors:['#9bbdd1','#c1ddb7','#7689ae','#e4a8c7'], height:24,
    places:[
      ['sail','Sailsong Island','Cliff sails and wind sparrows','Lyra','Stitches in the wind','I’m repairing the sails before the gusts return. Skyfloss twists without pulling itself to pieces. Bring me a handful.','One sail will catch the morning wind now. I’ll finish the rest at first light.','Skyskip','gull','#d8edf9','#7b9ed1'],
      ['waterveil','Waterveil Isle','Hanging springs and cloud lilies','Neri','Water over the edge','Cloudfin lives at the lip of the waterfall. It might follow a meringue back to the shallow pool.','It came all the way back with you! I’ll make the little pool a bit deeper.','Cloudfin','axolotl','#a3d9ec','#ea99ca'],
      ['orchid','Orchid Aerie','The humming orchid nursery','Vesper','A bridge made of roots','Find the survey marker under the giant orchids. They’ve grown over part of it. I want to know how much farther the roots can reach.','One day they’re going to need their own island.','Orchidlume','moth','#e2b9eb','#89b9cb'],
      ['moonrise','Moonrise Roost','High nest above the cloud sea','Aurel','The four wind routes','Help the other three island keepers. We can chart a dependable ferry circuit once their work is done.','Then it’s settled. No keeper has to spend a storm alone again.','Cloudcrown','dragon','#adb4ed','#f3c18f']
    ]
  }
};

export const houses={
  gryffindor:['Gryffindor','#a84456','Courage'],
  hufflepuff:['Hufflepuff','#d8a94c','Loyalty'],
  ravenclaw:['Ravenclaw','#6483bb','Curiosity'],
  slytherin:['Slytherin','#54896e','Ambition']
};

export const spells={
  lumos:{name:'Lumos',teacher:'harry',description:'Carry a light. Practice at the lantern stand in the castle courtyard.',target:[-9,9], label:'Courtyard lantern stand'},
  levitate:{name:'Wingardium Leviosa',teacher:'hermione',description:'Float the practice feather at the Great Hall tables.',target:[7,-17], label:'Practice feather'},
  reparo:{name:'Reparo',teacher:'ron',description:'Repair the broken chess rook on the stone terrace.',target:[14,9],label:'Broken chess rook'}
};

export const atlas={
  valley:{name:'Blossom Valley',entry:'village',tagline:'Home and the original thirteen regions'},
  ...Object.fromEntries(Object.entries(chapters).map(([id,ch])=>[id,{...ch,entry:ch.places[0][0]}])),
  ...Object.fromEntries(Object.entries(wards).map(([realm,w])=>[realm,{name:w.name,entry:w.place,height:2.2,
    tagline:'Spirehaven · '+w.landmark,colors:w.colors,food:'berry',material:'wood'}])),
  silverrun,
  silvercoast,
  hogwarts:{name:'Hogwarts',entry:'hogwarts',tagline:'Castle grounds, Great Hall and magical lessons',height:1.65,colors:['#819789','#acbc9e','#7b7e95','#efc47a']}
};

export const horizonRegions={};
export const horizonSpecies={};
export const horizonWildlife=[];
export const horizonVillagers=[];
export const horizonItems=Object.fromEntries(Object.values(wardWorkshops).map(({reward:[id,name,icon]})=>[id,[name,icon]]));
export const horizonRecipes={};
export const horizonResources={};

for(const [realm,ch] of Object.entries(chapters)){
  const sky=realm==='sky';
  horizonItems[ch.material]=ch.supply;
  horizonItems[ch.food]=ch.treat;
  horizonRecipes[ch.food]={cost:{[ch.material]:1,berry:1},count:3};
  horizonResources[realm]=[];
  const placeIds=ch.places.map(p=>p[0]);
  ch.places.forEach((place,index)=>{
    const [id,name,theme,npc,quest,intro,done,animal,kind,color,accent]=place;
    const local=frontierPlaces[id], merch=local?.item[0];
    if(local) horizonItems[merch]=local.item.slice(1);
    const [x,z]=(ch.positions??quadrants)[index];
    const traveler='guide-'+id;
    const companion='pet-'+id;
    const marker=[x+7,z-1];
    const travel=local?.travel??[x,z+6];
    const questType=local?.task?{item:0,bond:1,stamp:2}[local.task]:index;
    const goal=[
      {item:merch??ch.material,count:3},{bond:companion},{stamp:id},{quests:placeIds.slice(0,3).map(p=>'guide-'+p)}
    ][questType];
    const find=[
      'Bring 3 '+(local?.item[1]??ch.supply[0]).toLowerCase()+' to '+npc,
      'Befriend '+animal,
      'Survey the trail marker in '+name,
      'Finish the first three '+ch.name+' stories'
    ][questType];
    horizonRegions[id]={name,note:theme,x,z,travel,realm,color:ch.colors[index],marker,sky,
      ...(local?.yaw!==undefined?{yaw:local.yaw}:{}),...(sky?{lift:[0,5,11,4][index]}:{}),...(local?{shop:local.shop}:{})};
    horizonSpecies[companion]={
      name:animal,family:local?.family??theme+' '+kind,kind,color,accent,place:name,
      favorite:local?.favorite??(index%2?ch.food:merch??ch.material),trust:index===3?2:1,
      lore:local?.lore??['It remembers familiar footsteps and comes closer each time.','It likes to wait beside the shore path after a good meal.','You sometimes find tiny marks where it has been playing.','It takes visitors to its favorite part of the valley.'][index]
    };
    horizonWildlife.push([companion,x+5,z+3,1.25,realm]);
    horizonVillagers.push({
      id:traveler,name:npc,role:local?.role??theme,x:x-3,z:z-1,realm,region:id,
      colors:[['#a96e57','#e8ac83','#9b614b','#d9ab91'][index],ch.colors[(index+1)%4],['#52404a','#904b41','#3c384e','#674b47'][index]],
      portrait:{morph:(index+1)%2,style:(index+4)%12,accessory:[0,3,6,4][index],outfit:index===3?3:0},
      quest,find,goal,reward:{[ch.food]:3,berry:4,...(local&&questType>0?{[merch]:2}:{})},
      ...(local?.shifts?{shifts:local.shifts}:{}),intro,done,after:local?.after??done
    });
    for(let i=0;i<22;i++){
      const a=(i+.4)*2.39996,r=3.3+i*.39;
      const type=i%3===1?['berry','petal','wood','stone','crystal'][i%5]:(local&&i%2===0)?merch:ch.material;
      horizonResources[realm].push([type,x+Math.cos(a)*r,z+Math.sin(a)*r]);
    }
  });
}

horizonWildlife.push(['silkskip',49,15,1.3,'silverrun'],['rollbud',-33,-27.7,1.2,'silverrun'],['pealfoot',29,37,1.15,'silverrun']);
for(const [realm,w] of Object.entries(wards)){
  const [id,name,family,color,accent,favorite,lore]=w.pet;
  horizonRegions[w.place]={name:w.square,realm,x:0,z:8,travel:[-19,12],gate:[-17,14],marker:[2,-13],color:w.colors[0],note:'Spirehaven · '+w.name};
  horizonResources[realm]=[[favorite,-31,15],['stone',24,-16],['wood',-19,32],['petal',1,-13]];
  horizonSpecies[id]={name,family,kind:id,color,accent,favorite,lore,trust:2,place:w.square};
  horizonWildlife.push([id,...wardPetPoint,1.15,realm]);
  const apprentices={dyeward:['Ada Skein','Silk winder','Counting skeins','Hanging silk','Rolling the dyed cloth'],
    cooperward:['Birch Hazel','Hoop fitter','Shaping staves','Setting barrel hoops','Counting the casks'],
    starward:['Lune Vesper','Star recorder','Polishing lenses','Reading the sundial','Charting the stars']};
  const [apprentice,role,...shifts]=apprentices[realm];
  horizonVillagers.push({id:'apprentice-'+realm,name:apprentice,realm,region:w.place,role,x:27,z:-17,shifts,
    colors:['#c69983',w.colors[3],'#604753'],portrait:{style:5},quest:'A snack for '+w.pet[1],goal:{item:favorite,count:2},
    find:'Bring two '+(favorite==='berry'?'sunberries':'petals'),reward:{treat:2},
    intro:w.pet[1]+' comes this way before the lamps are lit. Could you spare a snack for it?',
    done:'Two for the trail! Take these treats for your own companion.',after:'Watch the roadside when you leave the square.'});
  horizonVillagers.push({id:'keeper-'+realm,name:w.keeper,realm,region:w.place,role:w.trade,x:4,z:9,colors:['#bc8b72',w.colors[2],'#61464c'],
    shifts:['Opening the workshop','Checking the lanterns','Counting the evening takings'],portrait:{morph:0,style:4,accessory:3,outfit:1},quest:'Light for '+w.square,goal:{stamp:w.place},reward:{berry:3,treat:1},
    find:'Survey the marker at '+w.landmark,intro:'Follow the avenue to '+w.landmark+'. Check the brass survey mark for our night watch.',
    done:'The mark is clear. Our lantern runners can follow it after dusk.',after:'Look for the ribboned lanterns along the road. The watch pays for a quick round.'});
}
for(const trail of Object.values(trails)) horizonItems[trail.item]=[trail.reward,'sparkles','ochre'];
for(const [realm,g] of Object.entries(clearings)){
  horizonRegions[g.id]={name:g.name,note:'Wildflower clearing',x:g.x,z:g.z,travel:[g.x,g.z+3],realm,color:g.flower,marker:[g.x+4,g.z+2]};
  const id='pet-'+g.id;
  horizonSpecies[id]={name:g.pet,kind:g.kind,color:g.color,accent:g.accent,place:g.name,family:'Wildflower '+g.kind,favorite:g.food,trust:2,lore:g.lore};
  horizonWildlife.push([id,g.x+1,g.z,1.2,realm]);
  horizonResources[realm].push([g.food,g.x-2.8,g.z+1.6]);
}

for(const [id,island] of Object.entries(skyIslands)){
  const [worldX,worldZ]=island.world,x=worldX-skyOrigin.x,z=worldZ-skyOrigin.z;
  const [item,name,symbol]=island.item,[npc,role]=island.resident,[animal,kind,color,accent]=island.pet;
  const [quest,task,intro,done]=island.task;
  const companion='pet-'+id;
  horizonRegions[id]={name:island.name,note:role+' · '+atlas[island.below].name+' below',x,z,realm:'sky',sky:true,
    lift:island.lift,color:island.color,travel:[x,z+6],marker:[x+7,z-1],shop:island.shop};
  horizonItems[item]=[name,symbol];
  horizonSpecies[companion]={name:animal,family:role+'’s '+kind,kind,color,accent,place:island.name,
    favorite:task==='bond'?'skymeringue':item,trust:2,lore:'It circles '+island.name+' at first light, then settles near '+island.landmark[0].toLowerCase()+'.'};
  horizonWildlife.push([companion,x+4.2,z+4.6,2.1,'sky']);
  const [goal,find]=task==='bond'?[{bond:companion},'Befriend '+animal]:
    task==='stamp'?[{stamp:id},'Survey the marker at '+island.landmark[0].toLowerCase()]:
    [{item,count:3},'Bring 3 '+name.toLowerCase()+' to '+npc];
  horizonVillagers.push({id:'guide-'+id,name:npc,role,x:x-2.6,z:z+1.1,realm:'sky',region:id,
    colors:[['#e9b295','#ac7458','#bc8565','#995e46','#cf9e7b','#976350'][Object.keys(skyIslands).indexOf(id)],island.color,'#584655'],
    portrait:{morph:0,style:5,accessory:3,outfit:0},quest,find,goal,intro,done,
    after:done,
    reward:{skymeringue:3,[item]:2}});
  const rand=seeded(Math.floor(worldX*317+worldZ*93+103721));
  for(let n=0;n<18;n++){
    const a=n*2.39996+.34,r=5+n*.54+rand()*.6;
    horizonResources.sky.push([n%5===0?'skyfloss':n%6===0?'berry':item,x+Math.cos(a)*r,z+Math.sin(a)*r]);
  }
}

horizonRegions.hogwarts={
  name:'Hogwarts',note:'School of Witchcraft and Wizardry',x:0,z:-2,travel:[0,19],
  realm:'hogwarts',color:'#d4ad78'
};
horizonResources.hogwarts=[
  ['petal',-17,3],['petal',-19,7],['petal',-14,-1],['berry',-24,14],
  ['berry',-25,17],['wood',-16,16],['wood',-20,13],['crystal',18,-10]
];
horizonSpecies.hedwig={name:'Hedwig',family:'Snowy owl',kind:'owl',color:'#f4f1eb',accent:'#bfc9d9',favorite:'treat',trust:2,place:'Hogwarts',lore:'She knows every route between the Owlery and the castle windows.'};
horizonWildlife.push(['hedwig',32,-31,1.2,'hogwarts']);

const school=[
  ['mcgonagall','Professor McGonagall','Transfiguration professor',0,-12,['#ddad90','#44765f','#3e3949'],{morph:1,style:1,accessory:7,outfit:4},'The Sorting Ceremony','Choose a house in the Great Hall',{house:true},'Welcome to Hogwarts. The Sorting Hat is waiting. Which house feels like it might become home?','Your house has a place for you at its table. Three of our students can help you with your first charms.'],
  ['harry','Harry Potter','Lumos practice',-8,13,['#e6ac8c','#754053','#2c2938'],{morph:0,style:6,accessory:3,outfit:4,glasses:true,scar:true},'A light in the courtyard','Cast Lumos by the courtyard lantern stand',{spell:'lumos'},'I learned to keep a little light handy. Try Lumos at the lantern stand near the entrance. You can use it anywhere after I show you.','Good work. Sometimes a light is the most useful bit of magic you can know.'],
  ['hermione','Hermione Granger','Charms practice',7,-13,['#dba77e','#754053','#714229'],{morph:1,style:7,accessory:3,outfit:4},'As light as a feather','Levitate the feather at the Great Hall tables',{spell:'levitate'},'The feather is on the east table. Try Wingardium Leviosa when you’re close enough to see it. Take your time with the movement.','That’s quite high enough. Shall I write down what worked so we can teach someone else?'],
  ['ron','Ron Weasley','Repair charm practice',13,13,['#efb38f','#754053','#9b4835'],{morph:0,style:4,accessory:3,outfit:4},'A missing rook','Repair the broken chess rook on the terrace',{spell:'reparo'},'The rook took a tumble and lost its top. I promised nobody would find out. Reparo should put it together again.','Brilliant. If anyone asks, it was always standing there.'],
  ['hagrid','Rubeus Hagrid','Keeper of keys and grounds',-23,8,['#cc9475','#9a7455','#493334'],{morph:0,style:7,accessory:3,outfit:2,beard:2},'A perch for Hedwig','Befriend Hedwig at the Owlery',{bond:'hedwig'},'Hedwig’s taken to the Owlery ledge. Two meadow biscuits and a quiet approach might persuade her to try a new perch.','Knew she’d take to you. There’s a clean perch down by my hut whenever you need it.'],
  ['luna','Luna Lovegood','Care of magical creatures',23,-8,['#edc1ad','#637dac','#ba9b6f'],{morph:1,style:7,accessory:6,outfit:4},'Field notes after dusk','Bring Luna 3 bloom petals',{item:'petal',count:3},'I leave petals by the Owlery after dusk. You can tell who visited from how the petals are moved. Would you bring me three?','Thank you. The blue notebook is for tracks. The silver one is for things the tracks can’t explain.'],
  ['dumbledore','Professor Dumbledore','Headmaster',0,-23,['#d5a899','#827da9','#d0c6d2'],{morph:0,style:7,accessory:7,outfit:4,beard:2,glasses:true},'Three small wonders','Finish the lessons with Harry, Hermione and Ron',{quests:['harry','hermione','ron']},'A light, a feather and a repaired chess piece. Three ordinary things that changed because you learned to pay attention. Come tell me how your lessons went.','Well done. Take those three small wonders home with you, and see what else you notice along the way.']
];
for(const [id,name,role,x,z,colors,portrait,quest,find,goal,intro,done] of school){
  horizonVillagers.push({id,name,role,x,z,colors,portrait,quest,find,goal,intro,done,after:done,
    realm:'hogwarts',region:'hogwarts',reward:{crystal:2,treat:3}});
}

const teachers=[
  ['snape','Professor Snape','Potions master',27,-15,['#d8b393','#515569','#342c35'],
    'A spoonful of accuracy','Bring Professor Snape 3 river stones',{item:'stone',count:3},
    'Those shiny things on my bench are river stones. Before you ask, none belong in the cauldron. Run three under cold water and bring them here. You will find out what an inexpensive set of potion weights looks like.',
    'Quite usable. Next time bring stones from the same stretch of river. They’ll make a narrower range of errors.',
    'The test is whether the scale rests. Wait until it does before you insist you know the answer.'],
  ['sprout','Professor Sprout','Herbology professor',24,22,['#d69e76','#7a9672','#795f52'],
    'Put both hands in the soil','Bring Professor Sprout 3 bloom petals',{item:'petal',count:3},
    'A first-year has been carrying her dead mandrake around in the pot. I promised there’s still room to plant something cheerful in it. Bring me three bloom petals and I’ll show her how to take a cutting.',
    'She watered it before we planted anything. I like that in a gardener.',
    'If something grew overnight, lift the cover and take a look. It’s better to do it before the other pots start talking.'],
  ['flitwick','Professor Flitwick','Charms professor',44,1.5,['#dbb191','#846d92','#ced0c4'],
    'A smaller lift','Finish Hermione’s Charms lesson',{quests:['hermione']},
    'I heard Miss Granger has a feather waiting. Before you try to impress her with how high it goes, see if you can lift it by the width of one finger and keep it there.',
    'Look at that. Height only makes it harder to catch. Keep control and you’ll get all the height you need.',
    'If you drop anything in my classroom, please make certain it has finished falling before you try another charm.'],
  ['pomfrey','Madam Pomfrey','Hospital matron',16,-22,['#d5a28b','#9b847b','#7d6257'],
    'After a cold walk','Bring Madam Pomfrey 3 sunberries',{item:'berry',count:3},
    'Three first-years have cold ears and refuse to wear hats. I can’t issue three new heads, but a warm sunberry tea will get them out of the beds and back to class.',
    'Good berries. Leave the tea by the second bed; if you offer it directly they’ll all claim it’s medicine.',
    'Please knock if I’ve drawn the curtains. If you’ve come to borrow bandages for a flying lesson, please come back with the flying instructor.']
];
for(const [id,name,role,x,z,colors,quest,find,goal,intro,done,after] of teachers){
  horizonVillagers.push({id,name,role,x,z,colors,quest,find,goal,intro,done,after,
    realm:'hogwarts',region:'hogwarts',portrait:{morph:['sprout','pomfrey'].includes(id)?1:0,style:id==='snape'?7:4,outfit:4},
    reward:{treat:2,petal:3}});
}

horizonVillagers.push(...townResidents);
horizonVillagers.push(...silverrunResidents);
horizonResources.silverrun=silverrunResources;
for(const [id,place] of Object.entries(silverrunPlaces)) horizonRegions[id]={...place,realm:'silverrun'};
horizonVillagers.push(...coastResidents);
horizonResources.silvercoast=coastResources;
for(const [id,place] of Object.entries(silvercoastPlaces)) horizonRegions[id]={...place,realm:'silvercoast'};

export function realmRegions(realm){
  return Object.entries(horizonRegions).filter(([,place])=>place.realm===realm);
}

export function horizonRegionAt(realm,x,z){
  if(realm==='silverrun') return silverrunRegionAt(x,z);
  if(realm==='silvercoast') return coastRegionAt(x,z);
  return realmRegions(realm).reduce((closest,next)=>
    Math.hypot(x-next[1].x,z-next[1].z)<Math.hypot(x-closest[1].x,z-closest[1].z)?next:closest
  )[0];
}
