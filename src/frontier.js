import {frontierLayout} from './overworld.js';
import {townChapters,townProfiles} from './town-data.js';
import {newRegions} from './new-regions.js';

const colorSets={
  heath:['#a2b48f','#d9bbd0','#81768b','#eeeea4'],
  cinder:['#bf8d72','#e6b080','#915f76','#e7a0a4'],
  reef:['#80b6ae','#bde7d1','#5d8caa','#f0ae9d'],
  verdigris:['#8aab91','#bedccc','#6d7b9d','#aac1df'],
  orchards:['#a9b77a','#ebc379','#817e5d','#e99e9d']
};
const localFamilies={
  heath:['Letter bee','Kettlefen axolotl','Moorland hare','Storm-lace moth'],
  cinder:['Kiln fox','Coal crab','Resin mouse','Crater dragon'],
  reef:['Foam gull','Tidewall turtle','Coral hedgehog','Cave axolotl'],
  verdigris:['Chiming fox','Tarn owl','Briar hare','Brass unicorn'],
  orchards:['Press mouse','Damson fox','Graft mouse','Dancing sprite']
};
const chapters={
  heath:[
    'Bee paths, kettle bogs and a radio for storms',1.45,
    'Thimble honey shortbread','Heather honey',
    [
      ['heatherpost','Heatherpost','Moorland letter stop','Ida Fen','Dry letters','Heather wax','Ida’s Stamp Table','gem','ochre',
        'I can read the address on Mr. Finch’s letter. The rain has taken everything else. Bring me three scraps of heather wax; waxed envelopes might get his reply over the ridge.',
        'His new address is still legible. Just. Tomorrow I’m putting six coats on the postbox.',
        'I spent all morning in a dry letter room and still brought my raincoat.',
        'Flossbee','bee','#f8d6aa','#eaa2c7','It hovers at each mailbox until the flag has been lowered.'],
      ['kettlefen','Kettlefen','Shallow moor pools','Lowri Bell','A clean pair of boots','Bog mint','The Mudlark’s Pocket','sprout','green',
        'The print outside my tent looks exactly like one of my boots. It’s coming from the pond. Take a shortbread and sit on that flat stone with the dry corner.',
        'A newt in my old boot! Well. I said the thief could keep it if they had a good reason.',
        'I put a rolled sock under the heel. Seemed drafty in there.',
        'Bootbutton','axolotl','#a2cfbe','#e6aec4','It sleeps in a lost boot with its nose pointed uphill.'],
      ['shepherdsteps','Shepherd’s Steps','Upland grazing stones','Euan Pike','Count the empty niches','Rose moorstone','Pike’s Bell Shed','mountain','pink',
        'My brother moved one of the bells when he changed pastures. Walk up to the iron marker and take a rubbing of the new notch. I’m going deaf and I want to know which gate will sound.',
        'Ah, the upper gate. Let it ring three times before you go through. That’s our old signal to come home.',
        'The flock can hear me count. They always move on two.',
        'Tuffwhistle','hare','#bd9baf','#f3ddba','It lifts one ear for the wind and the other for sheep bells.'],
      ['rainradio','Rainwire Station','The storm listening post','Sev North','A voice under the weather','Copper Rainwire','Rainwire Supply Room','sparkles','ochre',
        'The last voice I heard was my mum telling me to bring the washing in. I want the set to carry the post, the pool readings and the pasture calls. Ask around; nobody here has the whole weather.',
        'There’s Lowri now. She’s reading the boot size over the radio. I’m keeping that in the log.',
        'If the tea goes quiet, come over and turn the big knob half a notch left.',
        'Wickstatic','moth','#bfafd2','#e1eeb4','The little scallops on its wings brighten before thunder.']
    ]
  ],
  cinder:[
    'Warm stone, orchard kilns and a soot-black canal',2.55,
    'Ashpear tart','Ashpear',
    [
      ['embercross','Embercross','Volcanic clay ovens','Mara Kiln','A pie that leaves the tin','Cinder clay','Mara’s Kiln Shelf','brick-wall','pink',
        'My father’s pie tin stuck in the kiln again. High heat hasn’t made him patient. Bring three pieces of cinder clay and I can make a dish that cools evenly.',
        'It slid right out. I’m going to let him think the new tin was his idea.',
        'Dad has had the third slice already. He says he’s checking the middle.',
        'Pepperwhisk','fox','#e4a48e','#f1dabb','It curls up to the warm side of a clay cooling rack.'],
      ['coalcanal','Coal Canal','Old lock and soot barges','Mick Bade','One passenger, four feet','Smokeglass tile','Lockkeeper’s Locker','gem','lilac',
        'I can see little claw marks on my last clean deck board. Take a tart across the lock and see who comes after it. The boat can carry one more as long as they stop chewing the rope.',
        'We named the barge for a crab. The crab picked the old barge. I can live with that sort of paperwork.',
        'I’m lowering the rail a little. He can see the water now, but only standing on the bucket.',
        'Sootsnip','crab','#9a85a6','#e6ac8d','It clicks its claws along the grain of the boat deck.'],
      ['cinderpines','Cinderpine Walk','Tall black-bark pines','Tess Rowe','The sap tally','Amber pine resin','Tess’s Sap Bench','trees','ochre',
        'I count the living pines every spring. That’s easy up close and impossible halfway down the ravine. Copy the join mark at the north stump so I can finish the map from here.',
        'I thought that stump was the limit. There are roots on both sides of it. I’ll need another page.',
        'Keep to the side if it rains. The middle of the trail is all pine needles.',
        'Resintail','mouse','#c38e60','#eed5a3','It sticks pine kernels inside empty knots instead of burying them.'],
      ['firewatch','Firewatch Crater','Ring of warm basalt','Omar Flint','We can all see it','Crater opal','Firewatch Window','gem','pink',
        'All I see up here is smoke. Mara cooks with heat, Mick runs under it, and Tess knows what grows after it. Can you bring me their accounts before I decide what to shut down?',
        'I’ll put up a red flag for a bad wind. On clear days there’s no reason to take the ovens away.',
        'The clear-weather flags are drying on the line. Take the steps that don’t smell of dye.',
        'Basaltspark','dragon','#b77f88','#ffbb7d','It lounges on warm rock until its tail slips down the slope.']
    ]
  ],
  reef:[
    'Pearled cliffs, shell beds and crooked coastal railings',1.34,
    'Dapplefin bun','Dapple algae',
    [
      ['pearlbreak','Pearlbreak Pier','Shell fishing harbor','Cai Wren','A bad day for knots','Foamlace shell','Cai’s Net and Needle','gem','green',
        'My aunt ties these knots with her eyes shut. I make a mess with mine open. Bring me three foamlace shells and I can use the slots to keep each line apart.',
        'She checked the net and didn’t say anything. That’s the good kind of didn’t say anything.',
        'If you bring a basket next time, take the dry stack of shells. Those are the ones you can hear through.',
        'Frothsail','gull','#f9edea','#80bad4','It steals loose line to tie tiny loops around its perch.'],
      ['abalone','Abalone Garden','Tidewall beds','Nim Teal','Eat at the edge','Abalone chip','Under the Tidewall','gem','lilac',
        'Bun crumbs keep floating out of the shallow beds. I can’t tell whether the little turtle is quick or the tide is. Take a dapplefin bun and feed it above the water.',
        'Oh, the crumbs lodge in the wall. She’s been coming back at low tide to get the rest.',
        'I put a saucer up there. Give it a few minutes; she works her way around the edge.',
        'Pebbleplate','turtle','#76c4bb','#ecbcc1','It takes the longest route to any lunch and always gets there.'],
      ['fancliff','Fancliff','Fan coral bluffs','Shai Dorn','A quiet marker','Blush coral flake','Fancliff Dry Goods','flower-2','pink',
        'The old lookout used to have a whistle on a cord. Last winter the cord went. Go read the stone marker and see whose watch it was; I’m cutting a replacement.',
        'My grandmother’s initials. I recognized the backwards D. She wrote them that way on my shoes too.',
        'You can hear the new whistle almost anywhere except where I’m standing. That’s a good lookout whistle.',
        'Blushpin','hedgehog','#dfabac','#faf0c9','The ridge of its quills fans out like a hand of coral.'],
      ['starfoam','Starfoam Caves','Lamp-lit limestone sea caves','Enid Shore','The long absence','Moonshale bead','Enid’s Grotto Market','mountain','lilac',
        'Cai’s aunt vanished for a whole afternoon last year. No drama; the tide just cut her off. I’d rather the pier, the garden and the lookout used the same tide clock. Take each of them the question first.',
        'Same clock, three different colored marks. No more sending a boat for someone having a perfectly nice sandwich.',
        'The floor on my side of the cave stays dry at high tide. I’ve tested it with my good stockings.',
        'Glowscale','axolotl','#a8dbe7','#a98ce0','It shelters under a shelf of rock and glows like a distant lamp.']
    ]
  ],
  verdigris:[
    'Alpine tarns, brass instruments and sweet-thorn hedges',2.68,
    'Bluebell rice cake','Bluebell nectar',
    [
      ['bellfoundry','Bellfoundry','Weathered bell workshop','Inez Vale','Ring on the low side','Verdigris leaf','Vale Bell & Twine','sprout','green',
        'The bell that brings in the goats has gone flat. Before I cast a new one, bring me three verdigris leaves to clean the seam. I’d rather they kept the sound they know.',
        'There’s the low note. All our goats used to sit down for it. We never found out why.',
        'I hung the bell low. The short ones can ring it with their noses.',
        'Chimekit','fox','#beb98e','#b0d7b4','It bumps unmoving bells and listens for the smallest note.'],
      ['silvertarn','Silver Tarns','Cold hillside bathing pools','Alba Reed','Breakfast for a guest','Tarn silver','Silver Tarns Tea Tent','gem','lilac',
        'Something has been climbing the clean towels every morning. Bring a bluebell rice cake and put it on the low railing. Sit here if your legs get cold.',
        'A real alpine owl, and she came for rice! She left a little hole in my best towel.',
        'People ask how to know she’s gotten here. Check the towel’s other corner.',
        'Frostbutton','owl','#bfd2df','#baacd9','Its tiny feet are wonderful at finding the least convenient foothold.'],
      ['briarwatch','Briarwatch','Sweet-thorn hedge maze','Nadi Glass','A way for short legs','Sweet-thorn tip','The Thorn Gate','trees','pink',
        'My grandmother took this path with a stool tied to her back. That meant the steps could never be too high. Read the little post at the middle gate; I’m putting the first step back where she measured it.',
        'Knee-high for me, waist-high for her. I’ll leave it where she put it and add a lower one beside it.',
        'The hedge has caught the roof again. I’m trying to make a case for keeping it.',
        'Nestpuff','hare','#e1c4a4','#daf1c6','It pushes little bramble leaves over the bare patches of its nest.'],
      ['brasshaven','Brasshaven','Hilltop wind instruments','Peri Moss','A sound that travels','Brass reed','Peri’s Reed Loft','sparkles','ochre',
        'I’m making an instrument you can hear in wind, fog and the usual neighbor quarrel. Bring me Inez’s bell note, Alba’s pool report, and Nadi’s distance to the middle gate. I have the solder ready.',
        'One little reed. I thought I’d need to build a tower to hear it down there.',
        'I left an old reed by the bench if you’d like to try a less respectable sound.',
        'Bramblehorn','unicorn','#c5d7a5','#92acd7','Its horn looks like dull brass until it hears another creature call.']
    ]
  ],
  orchards:[
    'Fruit terraces, old presses and a harvest stage',1.42,
    'Apple blossom bun','Crabapple blossom',
    [
      ['tumblepress','Tumblepress','Orchard cider press','Henri Oak','Save the small apples','Greengold apple','The Press Window','cherry','ochre',
        'The big apples go in first, and I spend the rest of the afternoon picking the little ones out of the grate. Bring me three greengolds and I’ll adjust the basket to their size.',
        'I’m bottling the small ones first this year. My brother won’t notice until the big baskets come out.',
        'If the press squeaks a little, I’m letting it. The other orchard can have a quiet press.',
        'Pipsqueak','mouse','#dfaf87','#edca9e','It hoards bruised apples in a cellar crack near the press.'],
      ['bramblefair','Bramble Fair','Seasonal produce stalls','Polly June','An honest sample','Damson jam','Polly’s Jam Stand','cookie','pink',
        'I promised a sample to every creature that stuck around while I changed the tablecloth. There’s only one that did. Could you offer it an apple blossom bun?',
        'A fox with more patience than my whole queue. I owe it a proper place on the sign.',
        'It prefers the end of the counter I’m not serving. I like it over there too.',
        'Jamwhisk','fox','#c58398','#f4ceb3','It sits perfectly still around a full counter of jars.'],
      ['seventrees','Seven Trees Terrace','Heirloom fruit terrace','Leif Hug','The missing seventh tree','Old graftwood','Leif’s Graft Box','trees','green',
        'The list says seven. I have six stumps and one miserable fig in my pocket. Check the marked stone under the upper row; the last cultivar must have been written on the back.',
        'A damson, of course. I thought I was looking for an apple because everyone sent me in from the apple lane.',
        'The new stake is a bit crooked. Come back next year and tell me whether the tree minded.',
        'Knothopper','mouse','#b99d76','#cde1a8','It sits on old grafts to inspect the leaves from the bottom up.'],
      ['harveststage','Harvest Stage','Orchard bandstand','Bo Chanter','Room for a third chair','Harvest rosette','Festival Dye Cart','flower-2','pink',
        'There used to be two chairs and a jug, which was exactly enough for a song. Help the press, the stalls and the upper terrace, then tell me if anyone remembers who sang the third verse.',
        'It was Leif, then. He’s getting a chair at the front where he can’t wriggle out of it.',
        'They finished the verse and started it again. We’re quite confident they mean to stop eventually.',
        'Satinstep','sprite','#eda8b0','#e8e8af','It copies dancing feet half a beat late and happily keeps up.']
    ]
  ]
};

export const frontierPlaces={};
export const frontierStores={};
export const frontierChapters={};
for(const [realm,[tagline,height,foodName,materialName,entries]] of Object.entries(chapters)){
  const colors=colorSets[realm];
  const food=realm+'-bake',material=realm+'-base';
  const places=entries.map((entry,index)=>{
    const [id,name,note,npc,quest,merch,shop,icon,tint,intro,done,after,animal,kind,color,accent,lore]=entry;
    const item=id+'-merch';
    frontierPlaces[id]={item:[item,merch,icon,tint],after,lore,shop,family:localFamilies[realm][index]};
    frontierStores[id]={name:shop,goods:[[item,5+index*2,'coins'],[food,7+index,'coins'],[index%2?'treat':'berry',4,'coins']]};
    return [id,name,note,npc,quest,intro,done,animal,kind,color,accent];
  });
  frontierChapters[realm]={name:frontierLayout[realm].title,tagline,height,colors,material,food,
    supply:[materialName,'sprout','green'],treat:[foodName,'cookie','ochre'],places};
}

for(const [realm,[tagline,materialName,foodName,entries]] of Object.entries(townChapters)){
  const profile=townProfiles[realm],food=realm+'-bake',material=realm+'-base';
  const places=entries.map(([id,name,note,npc,quest,merch,shop,icon,tint,intro,done,after,animal,kind,color,accent,family,lore],index)=>{
    const item=id+'-merch';
    frontierPlaces[id]={item:[item,merch,icon,tint],after,lore,shop,family};
    frontierStores[id]={name:shop,goods:[[item,5+index*2,'coins'],[food,7+index,'coins'],[index?'treat':'berry',4,'coins']]};
    return [id,name,note,npc,quest,intro,done,animal,kind,color,accent];
  });
  frontierChapters[realm]={name:profile.title,tagline,height:profile.elevation,colors:profile.palette,material,food,
    supply:[materialName,'sprout','green'],treat:[foodName,'cookie','ochre'],places,
    positions:[profile.center,profile.wilderness]};
}

for(const region of Object.values(newRegions)){
  const {id,place,title,name,feature,elevation,palette,center,keeper,pet,stock}=region;
  const material=id+'-base',food=id+'-bake',item=place+'-merch';
  frontierPlaces[place]={
    item:[item,stock.material,stock.icon,'ochre'],lore:pet.lore,
    shop:name+' Provisioner',family:title+' '+pet.kind,task:keeper.task,role:keeper.role,
    after:'If you come back at dusk, there’s a good view of '+region.landmark.replace(/^The /,'the ')+' from the road.',
    shifts:[region.greeting,region.afternoon,region.evening,'Taking a break'],favorite:food,travel:region.arrival,yaw:region.yaw
  };
  frontierStores[place]={name:frontierPlaces[place].shop,goods:[[item,6,'coins'],[food,4,'coins'],['berry',3,'coins']]};
  frontierChapters[id]={
    name:title,tagline:feature,height:elevation,colors:palette,material,food,
    supply:[stock.supply,'sprout','green'],treat:[stock.food,'cookie','ochre'],positions:[center],
    places:[[place,name,keeper.role+' district',keeper.name,keeper.quest,keeper.intro,keeper.done,
      pet.animal,pet.kind,pet.color,pet.accent]]
  };
}
