export const newRegions = {
  mushroom: {name:'Chanterelle Hollow', note:'THE LANTERN MUSHROOMS', x:-56, z:-38, color:'#dc876f', radius:15, travel:[-53,-32]},
  willow: {name:'Whisperwillow', note:'THE MOTH ORCHARD', x:-18, z:-53, color:'#95c1a4', radius:14, travel:[-17,-47]},
  cloud: {name:'Cloudbell Steps', note:'THE WIND GARDENS', x:10, z:-52, color:'#b4b9e5', radius:14, travel:[9,-46]},
  shell: {name:'Seashell Court', note:'THE PEARL TERRACES', x:61, z:7, color:'#75c9ce', radius:16, travel:[54,7]},
  amber: {name:'Amber Apiary', note:'THE HONEY GARDENS', x:43, z:32, color:'#eac57c', radius:15, travel:[38,30]},
  kite: {name:'Kitewind Bluff', note:'THE KITE FESTIVAL', x:16, z:62, color:'#d6a5d2', radius:15, travel:[15,55]},
  fernbank: {name:'Fernbank Springs', note:'THE JADE SPRINGS', x:-27, z:62, color:'#86c4b0', radius:15, travel:[-25,55]},
  moon: {name:'Moonjar Marsh', note:'THE FIREFLY MEADOW', x:-56, z:30, color:'#a2a8d0', radius:16, travel:[-50,30]}
};

export const trails = [
  [[-42,-20],[-50,-25],[-53,-32],[-56,-38]],
  [[-28,-12],[-24,-12],[-24,-29],[-17,-47],[-18,-53],[0,-52],[9,-46],[10,-52]],
  [[14,-34],[10,-40],[9,-46]],
  [[29,5],[42,8],[54,7],[61,7]],
  [[42,8],[44,19],[38,30],[43,32]],
  [[-7,33],[0,32],[6,40],[13,49],[15,55],[16,62]],
  [[-25,35],[-24,46],[-25,55],[-27,62]],
  [[-41,41],[-46,36],[-50,30],[-56,30],[-57,15],[-53,-4],[-53,-20]]
];

export const newItems = {
  spore:['Lantern cap','sprout','ochre'], silk:['Willow silk','trees','green'],
  bell:['Cloudbell','flower-2','lilac'], shell:['Pearl shell','gem','lilac'],
  honey:['Wild honey','cookie','ochre'], ribbon:['Wind ribbon','sparkles','pink'],
  jade:['Spring jade','gem','green'], glow:['Glow reed','sprout','lilac'],
  mooncake:['Mooncap cake','cookie','pink'], nougat:['Honey nougat','cookie','ochre'],
  cloudcake:['Cloud puff','cookie','lilac'], pearlsnack:['Pearl crunch','cookie','green'],
  silkwrap:['Silk-wrapped berry','cherry','pink'], glowtea:['Glow tea','sparkle','lilac'],
  kitebiscuit:['Kite biscuit','cookie','pink'], jadejelly:['Jade jelly','gem','green'],
  stoolpet:['Cushion perch','armchair','pink'], mushroomlamp:['Cap lamp','lamp','ochre'],
  windchime:['Wind chime','sparkles','lilac'], shellmosaic:['Shell mosaic','box','green'],
  honeybox:['Bee house','house','ochre'], pennant:['Festival pennant','pin','pink'],
  springpot:['Spring basin','gem','green'], moonjar:['Firefly jar','lamp','lilac']
};

export const newRecipes = {
  mooncake:{cost:{spore:1,berry:2},count:3},
  nougat:{cost:{honey:1,berry:1},count:3},
  cloudcake:{cost:{bell:1,petal:2},count:3},
  pearlsnack:{cost:{shell:1,berry:1},count:3},
  silkwrap:{cost:{silk:1,berry:1},count:3},
  glowtea:{cost:{glow:1,petal:1},count:3},
  kitebiscuit:{cost:{ribbon:1,berry:1},count:3},
  jadejelly:{cost:{jade:1,petal:1},count:3},
  stoolpet:{cost:{silk:2,wood:2},count:1,build:true},
  mushroomlamp:{cost:{spore:2,wood:1},count:2,build:true},
  windchime:{cost:{bell:2,wood:1},count:2,build:true},
  shellmosaic:{cost:{shell:2,stone:1},count:3,build:true},
  honeybox:{cost:{honey:2,wood:2},count:1,build:true},
  pennant:{cost:{ribbon:2,wood:1},count:2,build:true},
  springpot:{cost:{jade:2,stone:2},count:1,build:true},
  moonjar:{cost:{glow:2,crystal:1},count:2,build:true}
};

const creatures = [
  ['button','Buttoncap','Lantern mouse','mouse','#d19269','#ffe1a9','mooncake',1,'mushroom',-56,-34,'It sleeps beneath the smallest cap so its whiskers can poke out.'],
  ['bramble','Brambleback','Basket hedgehog','hedgehog','#98716b','#ffdfbd','spore',2,'mushroom',-60,-39,'Lantern caps stick to its quills. It brings a few home every evening.'],
  ['ochre','Ochredis','Autumn unicorn','unicorn','#ffe6c0','#e87069','mooncake',2,'mushroom',-54,-43,'Its hoofprints are the color of autumn leaves.'],
  ['velvet','Velvetveil','Willow moth','moth','#e3afda','#f4d396','silkwrap',2,'willow',-20,-49,'It folds its wings like a letter when rain starts.'],
  ['acorn','Acornock','Willow mouse','mouse','#c69c7b','#ecb78b','silk',1,'willow',-22,-55,'It can hear the roots creak when a willow drinks.'],
  ['drift','Driftwing','Paper moth','moth','#f2dfb6','#88cba7','silkwrap',1,'willow',-14,-57,'It sails in the wake of bigger wings.'],
  ['cirrus','Cirrus','Cloud unicorn','unicorn','#dcf5fd','#7aabd7','cloudcake',2,'cloud',10,-56,'It sneezes a little cloud whenever it tries to be serious.'],
  ['puffin','Puffinbell','Bell owl','owl','#b0a9ed','#ffe1a4','cloudcake',1,'cloud',14,-48,'The bells teach it a different song each time the wind turns.'],
  ['whistle','Whistletuft','Snow hare','hare','#f6f1eb','#a8c6ef','bell',1,'cloud',5,-49,'It whistles in its sleep, just barely louder than snow.'],
  ['pebble','Pebblesnap','Pearl turtle','turtle','#82b9ae','#efd6a5','pearlsnack',1,'shell',57,4,'It collects shiny shells and keeps the dull ones too.'],
  ['frill','Frillberry','Coral axolotl','axolotl','#ef997f','#ffcc89','pearlsnack',2,'shell',63,11,'It tries to count pearls and forgets the number whenever it blinks.'],
  ['marble','Marbletoe','Shellback turtle','turtle','#a3c3db','#bd8ddb','shell',2,'shell',65,2,'The swirls on its shell look like the path home.'],
  ['bumbles','Bumbles','Honey bee','bee','#ffcb5e','#594653','nougat',1,'amber',41,28,'It hovers patiently while other bees finish their sentences.'],
  ['toast','Toastquill','Honey hedgehog','hedgehog','#ad7a5d','#f5c480','nougat',2,'amber',46,35,'It combs its quills with a twig after every snack.'],
  ['tawny','Tawnybee','Amber bee','bee','#eaae6a','#823e47','honey',1,'amber',48,30,'Its favorite flower is whichever one opened today.'],
  ['zig','Zigzag','Ribbon dragon','dragon','#d2a6ec','#ffd3a7','kitebiscuit',2,'kite',12,59,'Its tail tangles in kite strings whenever it gets excited.'],
  ['bobbin','Bobbin','Festival fox','fox','#de817f','#ffd7ae','kitebiscuit',1,'kite',21,63,'It fetches any kite that the wind drops.'],
  ['tassel','Tasselwing','Dusk owl','owl','#bd85a8','#f8cf9a','ribbon',2,'kite',18,68,'It waits until the last kite comes down before going to bed.'],
  ['pearljade','Jadepearl','Spring unicorn','unicorn','#c5efde','#60cbbb','jadejelly',2,'fernbank',-25,64,'It dips its horn in warm water and makes perfect circles.'],
  ['mottle','Mottle','Fernback turtle','turtle','#97c36e','#688c5c','jade',1,'fernbank',-30,59,'Ferns sprout where it rests for three days.'],
  ['dewdrake','Dewdrake','Spring dragon','dragon','#8dd3be','#f0d694','jadejelly',1,'fernbank',-31,66,'It dries its wings on the sunniest rock.'],
  ['jar','Jarbright','Firefly moth','moth','#a1a4e8','#f7eb89','glowtea',1,'moon',-54,27,'It always flies back to the friend who first lit its lantern.'],
  ['hush','Hush','Marsh owl','owl','#8d92c3','#e8c2d0','glow',2,'moon',-59,32,'It spends the entire evening looking like it knows a secret.'],
  ['lune','Luneflower','Marsh unicorn','unicorn','#dcd6f2','#8faacf','glowtea',2,'moon',-54,35,'Its mane dims when it wants to be left alone and lights when it sees a friend.']
];

export const newSpecies = Object.fromEntries(creatures.map(
  ([id,name,family,kind,color,accent,favorite,trust,zone,,,lore]) =>
    [id,{name,family,kind,color,accent,favorite,trust,place:newRegions[zone].name,lore}]
));
export const newWildlife = creatures.map(([id,,,,,,,,,x,z],i)=>[id,x,z,1.1+(i%3)*.23]);

const stories = [
  ['morel','Morel','Cap keeper',-52,-36,['#aa6a55','#cd8860','#563747'],'Cake by lantern light','Craft a mooncap cake',{craft:'mooncake'},{wood:5,spore:3},'My mother marked the wet path with lantern caps. One night I followed them all the way into her kitchen. Try a mooncap cake. The little mice like the crust best.','That smells just like her kitchen after a thunderstorm. Leave a crumb under the biggest cap.','I’ve started leaving my own lantern caps on the path. Even on clear days.'],
  ['nib','Nib','Basket mender',-60,-36,['#dca682','#aa6c80','#834c43'],'A prickly helper','Befriend Brambleback',{bond:'bramble'},{silk:4,honey:2},'I lost every cap I picked yesterday. Turned around and saw the whole lot riding off on Brambleback’s quills. I think it wanted to help.','Look at that. It still has the smallest cap balanced on its nose.','I’m making it a basket with holes for the quills.'],
  ['ossia','Ossia','Silk weaver',-15,-50,['#bc7b55','#619b87','#39354e'],'A place to land','Craft and place a cushion perch',{place:'stoolpet'},{silk:4,petal:4},'Moths used to land on my loom until I moved it inside. I miss seeing them in the morning. Would you put out a soft perch?','I saw the first moth touch down. It polished both antennae and went straight to sleep.','There are little footprints in the cushion now. How many moths do you think it can hold?'],
  ['wren','Wren','Bell tuner',8,-45,['#eeb896','#7e8cc1','#89545d'],'Something to listen for','Craft and place a wind chime',{place:'windchime'},{bell:4,petal:5},'We tuned the bells by ear when my little brother was here. Now I get them all just a little wrong. Try making one for the valley and tell me how it sounds.','Yours does that gentle little rattle before it rings. My brother always liked that part best.','I’ve stopped retuning the small one. I think I finally like it crooked.'],
  ['peri','Peri','Wind reader',15,-54,['#9e6347','#ac78a0','#543556'],'A cloud with feet','Befriend Cirrus',{bond:'cirrus'},{bell:4,crystal:2},'Cirrus tries to race the shadows. It forgets they’re still attached to the clouds. A cloud puff will get its attention for long enough to make friends.','It let you close enough to count the curls in its mane? Then you earned it.','Today the shadows won. Cirrus is being a very good sport about it.'],
  ['cora','Cora','Mosaic maker',55,9,['#e2a27d','#4c9c9f','#673947'],'The cracked courtyard','Craft and place a shell mosaic',{place:'shellmosaic'},{shell:4,stone:4},'My first mosaic cracked in a frost. I pried out all the shells and kept them. Could you try your own tile with some new ones?','The lines between the shells look like waves. I think we can leave the cracks in my old one, too.','The rain filled the little gaps. It looks like a pond from up here.'],
  ['kai','Kai','Shell sorter',63,5,['#aa725b','#598aaa','#333849'],'Every shell counts','Bring Kai 3 pearl shells',{item:'shell',count:3},{berry:6,pearlsnack:3},'My cousin will only use perfect shells for necklaces. I like the ones with chips. Bring me three and I’ll show you how the color changes along the edges.','This one’s chipped twice. A very good shell. I’ll give it the long string.','I sent my cousin the necklace. She asked for another.'],
  ['beatrix','Beatrix','Beekeeper',41,34,['#dfaa8b','#be8d50','#6d4834'],'One room for bees','Craft and place a bee house',{place:'honeybox'},{honey:5,wood:3},'The smallest bees are picky about what size hole they sleep in. My house has room for twelve. Can you build a house with room for a few more?','There’s a bee looking inside already. I think it’s checking the size of the bedroom.','They chose the east-facing holes first. I should have guessed.'],
  ['ida','Ida','Kite stitcher',16,57,['#a36f54','#ab75a2','#583453'],'Hold on to the string','Craft and place a festival pennant',{place:'pennant'},{ribbon:4,wood:3},'Every year I lose the first kite. This year I put ribbons on all the spools so I can tell which way the wind is going. Could you make a pennant to hang near home?','Good strong stitch on that edge. I used to sit beside my aunt and watch her fold it just like that.','I lost the first kite anyway. Bobbin brought it back wet but whole.'],
  ['sage','Sage','Spring keeper',-25,58,['#ba8668','#67997f','#664c56'],'Water for the birds','Craft and place a spring basin',{place:'springpot'},{jade:4,stone:4},'The birds wash in the springs in the morning. By noon the rocks get hot. Could you make them a smaller basin somewhere cool?','I found a wet feather on the rim. Someone got there before me.','Put a pebble in the bottom if it’s deep. It gives the small birds somewhere to stand.'],
  ['pond','Pond','Reed reader',-51,31,['#c99579','#8686ae','#4e4266'],'Save a little light','Craft and place a firefly jar',{place:'moonjar'},{glow:4,crystal:3},'I got lost here once because I mistook the fireflies for my porch light. My sister taught me to make a jar that glows with reeds. Could you make one for your own porch?','I can see it from the path. It will help somebody make the right turn.','Keep it lit even if you know the way. Someone else might need it.'],
  ['bie','Bie','Evening naturalist',-59,28,['#805545','#656e9e','#373348'],'A quiet cup','Befriend Luneflower',{bond:'lune'},{glowtea:3,petal:5},'Luneflower watches people from the grass and dims its mane if they come too fast. Make two cups of glow tea and wait quietly.','It followed you all the way here. I’ll speak softly so it stays for a while.','It came back at dusk. We sat until the fireflies came out.']
];
export const newVillagers = stories.map(([id,name,role,x,z,colors,quest,find,goal,reward,intro,done,after])=>
  ({id,name,role,x,z,colors,quest,find,goal,reward,intro,done,after}));

const nativeMaterials = ['spore','silk','bell','shell','honey','ribbon','jade','glow'];
export const newResources = Object.values(newRegions).flatMap(({x,z},zone) =>
  Array.from({length:24},(_,i)=>{
    const angle=i*2.39996+zone*.83;
    const radius=4+i*.39;
    const type=i%3===1 ? ['berry','petal','wood','stone','crystal'][i%5] : nativeMaterials[zone];
    return [type,x+Math.cos(angle)*radius,z+Math.sin(angle)*radius];
  })
);
