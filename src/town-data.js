import {townRealmLayout} from './overworld.js';
import {newRegions} from './new-regions.js';
import {regionalDesigns} from './regional-designs.js';
import {buildRegionalInterior} from './regional-interiors.js';
import {wardWorkshops} from './ward-workshops.js';
import {inRoom} from './spirehaven-rooms.js';

export const townServiceNames={
  hall:'Town Hall',market:'Market Hall',inn:'Inn',workshop:'Workshop',
  garden:'Community Garden',post:'Post Office',lookout:'Lookout'
};

const chapterProfiles={
  bellport:{
    center:[-7,7], wilderness:[34,-32], layout:'harbor', architecture:'gabled', palette:['#91b9b3','#b8ddd1','#4d778b','#f7b997'],
    elevation:1.18, biome:'coast', feature:'Wind-bent dunes, stone piers and an old buoy field',
    greeting:'Unloading the fish baskets', afternoon:'Checking harbor floats', evening:'Closing the harbor stalls'
  },
  fennel:{
    center:[4,8], wilderness:[-29,-28], layout:'village', architecture:'cottage', palette:['#b2c07e','#e2db9d','#889c68','#e5a68f'],
    elevation:1.4, biome:'orchards', feature:'Wind-bent fennel, dry stone walls and rolling sheep meadows',
    greeting:'Baking for the market', afternoon:'Checking the hedgerows', evening:'Putting the ovens out'
  },
  gloam:{
    center:[6,2], wilderness:[-34,-30], layout:'village', architecture:'gabled', palette:['#9b86a8','#cbb9cc','#686183','#d1b5ec'],
    elevation:1.6, biome:'woods', feature:'Lavender forest hollows and stumps full of fireflies',
    greeting:'Trimming lantern wicks', afternoon:'Sorting forest finds', evening:'Lighting the lanes'
  },
  linen:{
    center:[-4,10], wilderness:[29,-30], layout:'terrace', architecture:'row', palette:['#c89eb0','#ecd2c4','#a67488','#aac3a6'],
    elevation:1.8, biome:'heath', feature:'Linen fields and terraced dye ponds',
    greeting:'Hanging fresh-dyed cloth', afternoon:'Mending a shuttle', evening:'Folding the cloth'
  },
  larkspur:{
    center:[1,9], wilderness:[-29,-33], layout:'terrace', architecture:'cottage', palette:['#b9c3d7','#dee6ed','#8795bb','#b7aee4'],
    elevation:3.08, biome:'frost', feature:'Alpine larkspur, steep pale snowbanks and spring-fed steps',
    greeting:'Clearing the stone steps', afternoon:'Tuning a mountain bell', evening:'Feeding the stove'
  },
  tamarack:{
    center:[3,6], wilderness:[30,-31], layout:'village', architecture:'gabled', palette:['#97b3ad','#d1ddd0','#5b8987','#edcaa2'],
    elevation:1.95, biome:'woods', feature:'Tamarack groves, mica glades and a kettle lake',
    greeting:'Stacking wood for the stove', afternoon:'Measuring the lake level', evening:'Repairing a lantern'
  },
  windmere:{
    center:[-7,12], wilderness:[33,-29], layout:'highstreet', architecture:'row', palette:['#d5b68b','#eddbb3','#ad8771','#88a7ac'],
    elevation:1.8, biome:'meadow', feature:'Tall oatgrass, cloth windmills and low grass ridges',
    greeting:'Checking the mill sails', afternoon:'Spreading grain to dry', evening:'Rolling up the sails'
  },
  safflower:{
    center:[4,5], wilderness:[-29,-26], layout:'courtyard', architecture:'adobe', palette:['#ce9e82','#e8c5a0','#bd775d','#a6a36e'],
    elevation:2.05, biome:'mesa', feature:'Painted gullies and deep red plateaus planted with dye flowers',
    greeting:'Cooling the dye vats', afternoon:'Opening the shade screens', evening:'Checking water jars'
  },
  seabloom:{
    center:[-5,9], wilderness:[32,-24], layout:'harbor', architecture:'adobe', palette:['#7fb6a4','#bbdccc','#559b9c','#f1b99f'],
    elevation:1.1, biome:'coast', feature:'A coral-green coast with raised boardwalks and shell terraces',
    greeting:'Mending fish nets', afternoon:'Opening the shell stalls', evening:'Lighting the boardwalk'
  },
  amberfen:{
    center:[2,3], wilderness:[-33,-30], layout:'courtyard', architecture:'row', palette:['#a8af80','#d4d4a1','#7d967b','#deb593'],
    elevation:1.2, biome:'delta', feature:'Reed beds, amber water and abandoned lock gates',
    greeting:'Opening the water gates', afternoon:'Reed weaving', evening:'Tying up the evening boats'
  }
};

const settlementNames={
  bellport:['bellwharf','Bellwharf'],fennel:['fennelsquare','Fennel Square'],
  gloam:['gloamcross','Gloamcross'],linen:['linnetloom','Linnet Loom'],
  larkspur:['larkmarket','Larkspur Market'],tamarack:['tamarackgreen','Tamarack Green'],
  windmere:['windmerequay','Windmere Quay'],safflower:['safflowergate','Safflower Gate'],
  seabloom:['seabloomstrand','Seabloom Strand'],amberfen:['amberfenlock','Amberfen Lock']
};

export const townProfiles={
  ...Object.fromEntries(Object.entries(chapterProfiles).map(([realm,p])=>[
    realm,{...p,title:townRealmLayout[realm].title,place:settlementNames[realm][0],name:settlementNames[realm][1]}
  ])),
  ...newRegions
};

const legacyCenters=[
  ['valley','village','Petalwick',0,-7,'village','cottage'],
  ['coast','brine','Brinewatch Quay',-23,22,'harbor','gabled'],
  ['woods','books','Barkbound Library',-23,22,'village','gabled'],
  ['frost','sled','Bellrunner Pass',-23,22,'terrace','cottage'],
  ['mesa','caravan','Saffron Waystation',-23,22,'courtyard','adobe'],
  ['delta','ink','Inkreed Landing',-23,22,'harbor','row'],
  ['heath','heatherpost','Heatherpost',-23,22,'highstreet','cottage'],
  ['cinder','embercross','Embercross',-23,22,'courtyard','adobe'],
  ['reef','pearlbreak','Pearlbreak Pier',-23,22,'harbor','gabled'],
  ['verdigris','bellfoundry','Bellfoundry',-23,22,'terrace','row'],
  ['orchards','tumblepress','Tumblepress',-23,22,'village','cottage']
];

const servicePlan=[
  ['hall',0,-15,0,7.65,6.1],
  ['post',-10,-15,0,5.0,4.2],
  ['inn',10,-15,0,6.45,5.4],
  ['market',16,-5,-Math.PI/2,6.4,4.8],
  ['workshop',16,5,-Math.PI/2,5.4,4.4],
  ['garden',16,14,-Math.PI/2,5.75,4.25],
  ['lookout',-16,-7,Math.PI/2,4.6,4.45],
  ['home',-16,3,Math.PI/2,5.4,4.2],
  ['home',-16,12,Math.PI/2,5.6,4.6],
  ['home',-7,16,Math.PI,5.45,4.55],
  ['home',6,16,Math.PI,5.1,4.45]
];

const petalwickPlan=[
  ['hall',13,-12,0,6.75,5.2],['post',12,6,-Math.PI/2,4.6,3.8],
  ['inn',-20,-16,0,5.9,4.45],['market',15,1,0,5.1,3.9],
  ['workshop',-15,14,Math.PI/2,4.7,4.0],['garden',10,15,0,5.2,3.9],
  ['lookout',-8,10,0,4.4,3.7]
];

const legacyPlan=servicePlan.map(([kind,x,z,yaw,w,d])=>
  [kind,x+(x<0?-2:x>0?2:0),z+(z<-11?-2:0),yaw,w,d]);

const newStreets={
  // The positions correspond to the town services and homes in servicePlan.
  harbor:[[0,-19],[-11,-13],[11,-18],[17,-5],[18,5],[18,15],[-16,-8],[-17,3],[-16,14],[-8,18],[10,19]],
  terrace:[[-2,-18],[-13,-16],[11,-12],[16,-8],[18,3],[15,14],[-18,-6],[-15,3],[-18,13],[-8,17],[8,19]],
  courtyard:[[0,-16],[-12,-15],[11,-18],[15,-6],[16,4],[15,13],[-15,-8],[-17,2],[-15,11],[-9,17],[8,16]],
  highstreet:[[12,-21],[-12,-20],[13,-13],[12,-5],[14,4],[13,13],[-13,-10],[-13,1],[-14,12],[-9,20],[9,21]],
  village:[[-5,-18],[-15,-14],[11,-16],[18,-5],[17,7],[13,16],[-19,-6],[-17,5],[-15,14],[-7,18],[7,20]]
};

function getBuildings(town){
  const {realm,place,center,layout,legacy}=town;
  const plan=realm==='valley'?petalwickPlan:legacy?legacyPlan:servicePlan;
  return plan.map(([kind,x,z,yaw,width,depth],index)=>{
    if(town.design){
      [x,z]=newStreets[layout][index];
      if(layout==='highstreet'&&(kind==='hall'||kind==='inn')) yaw=-Math.PI/2;
      if(layout==='highstreet'&&kind==='post') yaw=Math.PI/2;
      if(kind==='home'){
        const n=town.design.length+index;
        width*=.88+(n%3)*.11;
        depth*=.87+(n%4)*.086;
      }
    }else if(!legacy){
      if(layout==='harbor') {x*=1.06;z+=(x<-7?2:x>7?-1:0);}
      if(layout==='terrace') {z+=Math.round(x/7)*1.3;}
      if(layout==='highstreet') {x*=.83;z*=1.09;}
      if(layout==='courtyard') {x*=.83;z*=.88;}
    }
    const [baseX,baseZ]=center;
    const px=baseX+x,pz=baseZ+z;
    const threshold=depth/2+(kind==='market'?.95:1.38);
    return {kind,index,x:px,z:pz,yaw,width,depth,
      stop:kind==='home'?null:{id:place+'-'+kind,realm,place,kind,name:townServiceNames[kind],
        x:px+Math.sin(yaw)*threshold,z:pz+Math.cos(yaw)*threshold}};
  });
}

export const townsByPlace={
  ...Object.fromEntries(legacyCenters.map(([realm,place,name,x,z,layout,architecture])=>
    [place,{realm,place,name,center:[x,z],layout,architecture,legacy:true}])),
  ...Object.fromEntries(Object.entries(townProfiles).map(([realm,profile])=>[profile.place,{...profile,realm}]))
};
for(const town of Object.values(townsByPlace)) town.buildings=getBuildings(town);

const regionalRoomList=Object.values(townsByPlace).filter(town=>town.design).flatMap(town=>{
  const design=regionalDesigns[town.realm];
  return ['inn','market'].map((kind,index)=>{
    const {x,z,yaw,width,depth,stop}=town.buildings.find(building=>building.kind===kind);
    const inn=kind==='inn';
    const style=inn?'griffin':town.realm==='inkroot'?'bookshop':design.plaza==='pools'?'apothecary':
      design.plaza==='orchard'||design.plaza==='pots'?'bakery':'wares';
    const {people,stations,...interior}=buildRegionalInterior(town.realm,width,depth,inn);
    stations.find(station=>station.kind==='read').hint='A note about '+town.landmark;
    const [tone,pale,accent]=[town.palette[0],town.palette[1],town.palette[3]];
    return {id:stop.id,name:inn?design.inn:design.shop,realm:town.realm,place:town.place,kind:'regional',service:kind,
      town:town.name,landmark:town.landmark,note:design.note,x,z,yaw,width,depth,layer:index+1,style,
      wall:pale,roof:design.roofColor,rug:design.roofColor,floorStyle:design.walls,joinery:design.wood,...interior,
      stockTone:tone,stockAccent:accent,stockIcon:town.stock.icon,
      doorWidth:inn?1.90:2.34,stations,
      people:people.map(([px,pz],index)=>[px,pz,index?'#d3a381':'#ba8166',index?accent:tone])};
  });
});
regionalRoomList.push(...Object.values(wardWorkshops));
const regionalRoomIndex=new Map(regionalRoomList.map(room=>[room.id,room]));
const roomsByRealm=new Map();
for(const room of regionalRoomList){
  if(!roomsByRealm.has(room.realm)) roomsByRealm.set(room.realm,[]);
  roomsByRealm.get(room.realm).push(room);
}
export const regionalRoomsFor=realm=>roomsByRealm.get(realm)??[];
export const regionalRoomById=id=>regionalRoomIndex.get(id);
export const regionalRoomAt=(realm,x,z)=>regionalRoomsFor(realm).find(room=>inRoom(room,x,z));

export const townServices=Object.values(townsByPlace).flatMap(town=>
  town.buildings.flatMap(b=>b.stop?[b.stop]:[]));

export function townServicesForPlace(place){return townServices.filter(t=>t.place===place);}

export function townServiceAt(realm,x,z,range=2.5){
  let nearest=null,best=range*range;
  for(const station of townServices){
    if(station.realm!==realm) continue;
    const distance=(station.x-x)**2+(station.z-z)**2;
    if(distance<=best){nearest=station;best=distance;}
  }
  return nearest;
}

export const townChapters={
  bellport:['Salt-kissed boardwalks and fog bells', 'Rock samphire', 'Sailor’s sesame bun',[
    ['bellwharf','Bellwharf','Harbor chandlery','Anwen Bell','A bell you can hear in fog','Brass bell shavings','Bellwharf Chandlery','gem','ochre',
      'Three boats missed the fog bell this week. Bring me three handfuls of brass shavings; we can weigh the clapper before the next tide.',
      'Hear that low note? The fishing crews will hear it through a shut cabin door.',
      'I carry a spare clapper on the dock now. It weighs as much as a really unimpressive fish.',
      'Buoywhistle','gull','#eed9c3','#74a8b6','Harbor gull','It cries when a buoy turns over in the current.'],
    ['skerrylight','Skerry Light','Outer lighthouse trail','Milo Tern','A visitor to the light','Porthole glass','Skerry Glass Stall','sparkles','blue',
      'There’s a seal-shaped turtle on the cape. It waits until the lighthouse beam swings past before trying a sesame bun.',
      'It followed you all the way up? I’ll leave the keeper’s gate open when the lamp turns.',
      'The turtle found out the lamp is warm. I have been demoted from keeper to cushion.',
      'Roundlight','turtle','#59939b','#e8cb98','Skerry turtle','It naps on the steps between sweeps of the lighthouse.']
  ]],
  fennel:['Sheep paths and warm bakery windows','Meadow fennel','Sugar-fennel twist',[
    ['fennelsquare','Fennel Square','Village bakery','Mae Greave','Something for the evening shift','Oven fennel','Greave’s Bakehouse','sprout','green',
      'Elias keeps the flock out past supper. Bring three bunches of oven fennel and I’ll bake him something he can carry in his coat.',
      'I wrapped it in the old slate tally. If he forgets to eat it, the sheep certainly won’t.',
      'He brought the slate back with butter on it. That answers my question.',
      'Pockets','mouse','#c7a27a','#e7d4a2','Bakehouse mouse','It stows a single fennel seed behind each shutter hinge.'],
    ['chalkgate','Chalkgate Pasture','Grazing gates and chalk streams','Elias Wold','Please mind the latch','Soft chalk pebble','Chalkgate Wool Stand','mountain','green',
      'The chalk hare knows how to lift the gate with its nose. A fennel twist should keep it busy while we trade the latch for a proper one.',
      'It likes you. If you ever need twenty sheep quietly moved across a road, you have a friend who can arrange that.',
      'The new latch works. Now the hare taps it until I open it myself.',
      'Chalkfoot','hare','#ece4d5','#aabb92','Chalk hare','It can follow a faint chalk seam through an entire hillside.']
  ]],
  gloam:['Old timber lanes and firefly hollows','Glow lichen','Violet oatcake',[
    ['gloamcross','Gloamcross','Crossroads lamplighters','Rina Ash','A reason to light the lamps','Wick resin','Gloamcross Wick Shop','lamp','lilac',
      'I light the east lane even when I’m the only one on it. Three lumps of wick resin will keep the lamps from blowing out before breakfast.',
      'Someone came up that lane last night and turned the smallest lamp toward the road. I didn’t see their face.',
      'I’ve started leaving two cups on the landing. One of them has a moth in it.',
      'Wickcurl','moth','#bba1db','#e9c392','Lantern moth','When a lamp goes out it fans the last ember with both wings.'],
    ['violethollow','Violet Hollow','Firefly grove at the cut stumps','Pim Vale','Waiting in the dark','Violet cap','The Hollow Mushroom Counter','flower-2','lilac',
      'The grove fox avoids lantern light. Leave an oatcake on the dark side of a stump and then look at your shoes.',
      'I used to think the streak of purple in its tail was a shadow. You got to see it properly.',
      'It comes to the gate now, as long as I remember to turn my porch light off.',
      'Nightseam','fox','#77648f','#d5a6ce','Gloam fox','It keeps a paw between its eyes and the nearest lamp.']
  ]],
  linen:['Cloth drying racks over rose-colored dye ponds','Flax bunch','Mulberry pocket cake',[
    ['linnetloom','Linnet Loom','Dyers and frame makers','Tessa Reed','Color on both sides','Dyer’s mulberry','The Linnet Loom Shop','cherry','pink',
      'I dyed the wedding ribbon from one side and it came out striped. Can you bring three mulberries? I’ll try both ends at once.',
      'Both ends match. I made a little spare strip in case someone still wants the stripes.',
      'They chose the striped strip. I’m thinking about quietly becoming an expert in stripes.',
      'Shuttlebell','bee','#e3b58c','#ca879e','Loom bee','It follows the shuttle from one end of the loom to the other.'],
    ['dyepond','Rosewater Terraces','The old soaking pools','Oona Finch','The blue edge','Pressed flax stem','Rosewater Basket Stand','sprout','green',
      'Something keeps carrying blue thread down to the settling pool. Mulberry cake might tempt it onto the bank where we can see it.',
      'We thought the blue whiskers were thread too. Tell it the dye yard appreciates the advertisement.',
      'There’s a line for it on the drying rack now. No one else is allowed to use it.',
      'Bluewhisk','axolotl','#b5adc9','#8d9fc4','Dyepond axolotl','It drifts beside the submerged edge of the dye vats.']
  ]],
  larkspur:['Snow terraces under a line of copper bells','Ice larkspur','Bramble ice bun',[
    ['larkmarket','Larkspur Market','Winter outfitter','Mara Pine','A small cupboard for the pass','Bell felt','Pine’s Pass Supplies','mountain','blue',
      'Someone keeps taking blankets out of the pass cupboard and leaving them by the bells. Bring three pads of bell felt and we’ll make real covers.',
      'That quietened the brass. We still have enough blankets for the hikers.',
      'The bell covers have tiny neat bite marks. At least someone is inspecting my stitchwork.',
      'Feltwing','owl','#dde9e8','#a8a0c4','Alpine owl','It carries an odd scrap of fabric to every snowy perch.'],
    ['bluecleft','Bluecleft Spring','Warm alpine trickle','Iona Frost','Blue toes at the warm pool','Spring slate','The Pass Tea Window','gem','lilac',
      'The ice hare likes hot water on its feet. A bun will convince it to hold still while I check the lookout drain.',
      'All the water runs through. Now we can wash boots on this side of the pass.',
      'It knows the moment I fetch a clean bucket. That’s the richest little hare on the mountain.',
      'Steamtoes','hare','#c9d5ec','#eba6b3','Spring hare','It puts one foot in the warm water and the other three in the snow.']
  ]],
  tamarack:['Lantern workshops around a cold kettle lake','Tamarack cones','Mica honey biscuit',[
    ['tamarackgreen','Tamarack Green','Lakeside lamp workshop','Kest Bell','Through the thin mica','Lampshade mica','The Green Lamp Bench','gem','blue',
      'I can finally see the light through a thin sheet. Bring three pieces of mica and I’ll make a lamp that doesn’t blow out when the kettle lake freezes.',
      'That will let us see both hands when we lift the lake gauge.',
      'It goes amber in fog and green in frost. I’ll let the children decide what blue means.',
      'Glassmote','sprite','#a8d4c1','#f2d1a4','Mica sprite','Seen from the right angle, you can look straight through its wings.'],
    ['kettlelake','Kettlewater Bank','Glacial lake and mica glade','Jori Moss','Shapes under the gauge','Amber lake reed','Kettlewater Reed Cart','sprout','ochre',
      'The otter-shaped fox keeps pulling leaves out from under the lake gauge. Share a biscuit so I can read the markings while it is eating.',
      'Turns out the leaves were a dock. I’ll make a new one where it can reach the bank.',
      'It sleeps on the new dock. I wonder where I can have my lunch now.',
      'Rillpaw','fox','#758d84','#e5b88f','Lake fox','It carries wet leaves up to the bank and presses them flat with its paws.']
  ]],
  windmere:['Crosswind lanes and giant oatgrass','Paper oatgrass','Oat and quince cake',[
    ['windmerequay','Windmere Quay','Millwright row','Ada Reed','A sail in both winds','Mill seam thread','The Four Sails Counter','trees','ochre',
      'The west sail rolls itself around the hook when the wind changes. Bring three coils of seam thread so I can double the corner.',
      'I can hear two mills from the house now. Before this, that meant one of them had flown away.',
      'Come after tea when they spin in opposite directions. The whole street hums.',
      'Windwicket','gull','#c2c9b9','#81a3ab','Windmill gull','It stands on the lowest beam until the sails start to turn.'],
    ['oatcliff','Oatcliff Millfields','The broad oatgrass ridge','Finn Quill','Less haste at the new mill','Wild quince','Oatcliff Mill Cart','cherry','ochre',
      'The field sprite can race the whole blade around and leave you dizzy. Offer it cake while you’re standing downwind.',
      'It will remember that. Stand on the stone wall any windy morning and you’ll see a circle where it plays.',
      'I mark which mill has a sprite visiting before we start the gears. Most days it’s ours.',
      'Sailjig','sprite','#e9bd9b','#9dbbc8','Oatgrass sprite','It makes loops in dry oatgrass without disturbing a single stalk.']
  ]],
  safflower:['Adobe lanes and dye flowers along red gullies','Dye safflower','Rose seed flatbread',[
    ['safflowergate','Safflower Gate','Dye-street courtyard','Amal Clay','Red pots for the shade','Dye earth','The Safflower Pot Counter','gem','pink',
      'Dye from the shade comes out warmer. Bring three handfuls of red earth so my sister can see how different the two batches are.',
      'Red on the shelf, rose at the window. She wins either way. That was my plan.',
      'We move the pots every morning. The western wall knows more about red than I ever will.',
      'Ochrecap','hedgehog','#d2897c','#f1c798','Dye-yard hedgehog','Its spines stay red after every roll in the dust.'],
    ['rosecut','Rosecut Gully','Safflower banks and clay steps','Sael Rust','An afternoon visitor','Safflower curl','Rosecut Shade Stall','flower-2','pink',
      'The little dragon walks under the clay steps where it’s cool. A piece of flatbread will bring it out for a moment.',
      'There’s a tiny yellow footprint on the side of my dye pot. It was worth waiting for.',
      'It can fly higher than the ridge. When it wants bread, it always walks.',
      'Rosetalon','dragon','#e19a92','#e9ba79','Gully dragon','It draws perfect circles on walls after stepping through dye.']
  ]],
  seabloom:['Raised boardwalks across shell-green coastal meadows','Silver sorrel','Seafoam seed roll',[
    ['seabloomstrand','Seabloom Strand','Boardwalk shell market','Nori Kel','A quieter walk home','Hollow shell','Kel’s Tidal Goods','gem','green',
      'Shells snap underfoot at the end of the boardwalk. Bring three hollow ones so I can sound each step before we mend the path.',
      'The hollow notes came from two loose boards. I can get home without waking the oyster sellers now.',
      'The neighbors say they sleep better. My boots are heavier than I thought.',
      'Noodleclaw','crab','#76a594','#e5afaa','Boardwalk crab','It checks every board seam with the smallest claw.'],
    ['coralshelf','Coral Shelf','Raised shell beds','Pell Cove','Three green bubbles','Blown shell chip','Coral Shelf Tackle','sparkles','pink',
      'There’s a turtle under the highest two steps. Bring a seed roll and look for three bubbles, all the same size.',
      'I’ve put a green peg in the rail. From there you can see its shell before it goes back under.',
      'Its babies are quiet. Not one has learned the third bubble.',
      'Bubbletide','turtle','#83bdab','#f0ae8c','Coral turtle','It floats beneath the boardwalk until the first lantern comes on.']
  ]],
  amberfen:['Lock houses and low reed paths across warm water','Amber reed','Reed sugar dumpling',[
    ['amberfenlock','Amberfen Lock','The old lockhouses','Dima Sedge','Woven under the waterline','Old gate fibre','Sedge’s Mooring Bench','trees','green',
      'Our spare ropes burn through in spring. Bring three gate fibres. They were soaking below the waterline when my mother used them.',
      'We can shut the second gate now and still open it before lunch. My mother would ask why we waited.',
      'This rope is the same yellow as it was when I was eight. I tie it with the knot she taught me.',
      'Lockberry','mouse','#cbb585','#88a880','Lockhouse mouse','It counts the rope loops before leaping from one bollard to another.'],
    ['sedgeglass','Sedgeglass Pools','The amber water beds','Orrin Wick','Brighter on the far side','Amber stone bead','A Basket of Amber','gem','ochre',
      'The fen axolotl catches the last light better than any lamp. Try a dumpling on the far side of the lower pool.',
      'That’s the light I remember. We can plan the new doorstep where it catches its reflection.',
      'I moved the spare plank so it can see itself on darker evenings too.',
      'Glintgill','axolotl','#e5be87','#98b596','Amber axolotl','It turns to catch the thinnest edge of the sunset.']
  ]]
};

const waterShapes={
  bellport:[2,-7,8.1,5.4],linen:[-2,-7,6.2,3.8],larkspur:[3,-6,5.6,3.55],
  tamarack:[-1,-7,10.25,6.1],seabloom:[3,-7,7.7,6],amberfen:[-1,-6,8.25,5.55],
  pearldrift:[-3,-7,9.4,5.9],shellmirror:[5,-6,7,5],reedwatch:[-3,-5,8.4,5.5],
  saltbanner:[1,-9,7.8,4.75],fernwick:[-1,-6,7.1,4.8]
};
export function townWater(realm){
  const shape=waterShapes[realm];
  if(!shape) return null;
  const p=townProfiles[realm], [dx,dz,rx,rz]=shape;
  return {x:p.wilderness[0]+dx,z:p.wilderness[1]+dz,rx,rz,level:p.elevation-.14};
}

export function townTerrain(realm,x,z,initial){
  const r=townProfiles[realm];
  if(!r) return initial;
  const [cx,cz]=r.center;
  let y=initial;
  const ridge=Math.sin(x*.206)*Math.cos(z*.142);
  if(r.biome==='coast'){
    y+=.95*Math.sin(x*.147+z*.095)+.58*Math.cos(z*.107);
  }else if(r.biome==='orchards'){
    y+=2.1*Math.cos(x*.098)*Math.sin(z*.087)+.48*Math.sin(x*.30+z*.20);
  }else if(r.biome==='woods'){
    y+=1.24*Math.sin(z*.107+x*.045)+1.4*Math.cos(Math.hypot(x+19,z+12)*.154)*Math.max(.28,ridge);
  }else if(r.biome==='heath'){
    y+=.83*Math.sin(x*.09+z*.162)+.37*Math.round(Math.sin(x*.078-z*.125)*3);
  }else if(r.biome==='frost'){
    y+=2.65*Math.cos((x-z)*.103)+.9*ridge;
  }else if(r.biome==='mesa'){
    y+=1.50*Math.round(Math.sin((x+z)*.099)*3)+.56*ridge;
  }else if(r.biome==='delta'){
    y+=.62*Math.sin(x*.081+z*.174)+.55*Math.cos(z*.13);
  }else{
    y+=1.15*Math.sin(x*.127+z*.097)+1.02*Math.cos(x*.063+z*.087);
  }
  const edge=Math.max(Math.abs(x-cx)-19,Math.abs(z-cz)-19);
  const t=Math.max(0,Math.min(1,edge/12));
  y=r.elevation+(y-r.elevation)*t*t*(3-2*t);
  const p=townWater(realm);
  if(p){
    const q=Math.max(0,Math.min(1,(Math.hypot((x-p.x)/p.rx,(z-p.z)/p.rz)-.66)/.62));
    y=p.level-2.12+(y-p.level+2.12)*q*q*(3-2*q);
  }
  return y;
}

const neighborNames={
  village:['Peregrine Potts','Edda Pim'],brine:['June Kite','Lowry Salt'],books:['Cora Curl','Ari Nettle'],
  sled:['Iver Frost','Vera Tallow'],caravan:['Nila Oat','Hadi Loom'],ink:['Devi Dyer','Binh Nettle'],
  heatherpost:['Pip Haw','Delyth Wren'],embercross:['Nell Tallow','Ilya Gorse'],pearlbreak:['Bram Alder','Clio Wave'],
  bellfoundry:['Indra Root','Reed Linn'],tumblepress:['Aster Quint','Jasper Vale'],
  bellwharf:['Merrin Quill','Siri Gill'],fennelsquare:['Uma Lime','Hollis Weald'],
  gloamcross:['Ginny Tallow','Reva Hem'],linnetloom:['Averil Stane','Nell Brook'],
  larkmarket:['Ivy Snow','Alva Knell'],tamarackgreen:['Gus Wold','Vina Moone'],
  windmerequay:['Rowan Stout','Meriel Reed'],safflowergate:['Tavi Flint','Rima Shell'],
  seabloomstrand:['Aisha Pike','Otis Fern'],amberfenlock:['Dreet Rose','Ziva Quill']
};
const neighborEntries=[
  ['Sunberries for the tables','berry','sunberries','The market crew never breaks together before noon. I can put out a bowl if you bring two handfuls of sunberries.',
    'They’re still talking at the table. I should put fruit out more often.','Looking over the market stalls'],
  ['A prop for the awning','wood','pieces of wood','The little counter needs a leg. No one has lost anything off it yet. Bring two pieces of wood before that changes.',
    'The counter sits level. The crates underneath can stop doing two jobs.','Checking the awnings'],
  ['Two paving repairs','stone','river stones','The wagon wheels catch the same two gaps in the paving. Bring me a pair of river stones and I’ll fill them in before the mail comes.',
    'I walked back for my tools and the mail cart rolled right over. I only heard the horse.','Checking the paving'],
  ['Flowers for the windows','petal','bloom petals','Our new window boxes are all soil and no color. Can you bring me two bloom petals? I’ll grow something from them.',
    'That front wanted a little green. Thank you for doing something we can all see.','Tending the window boxes']
];

export const townResidents=Object.values(townsByPlace).flatMap((town,i)=>{
  const profile=townProfiles[town.realm], local=townServicesForPlace(town.place);
  return (profile?.neighbors??neighborNames[town.place]).map((name,j)=>{
    const k=(i+j*2)%neighborEntries.length;
    const [quest,item,label,intro,done,work]=neighborEntries[k];
    const service=local.find(s=>s.kind===(j?'post':'market'));
    const sx=profile?.design?town.center[0]+(j?8.4:-7.0):
      town.place==='village'?service.x+(j?.8:-1.35):town.place==='caravan'&&j?-37:service.x+(j?1.8:-3.75);
    const sz=profile?.design?town.center[1]+(j?8.9:1.7):
      town.place==='village'?service.z+(j?2.2:.86):town.place==='caravan'&&j?14.9:service.z+(j?2.7:.8);
    return {
      id:'neighbor-'+town.place+'-'+j,name,role:j?'Town caretaker':'Market assistant',realm:town.realm,
      region:town.place,x:sx,z:sz,shifts:[work,profile?.afternoon??'Visiting the square',profile?.evening??'Putting the tools away'],
      colors:[['#bd8e72','#dcb897','#9c6b51','#f0bc9f'][(i+j)%4],['#8e8eaa','#a2959b','#a8a36e','#82a0a4'][k],['#7d6668','#4e4549','#825e58'][(i+j)%3]],
      portrait:{morph:(i+j)%2,style:(i+j*7)%12,accessory:0,outfit:2},
      quest,find:'Bring 2 '+label+' to '+name,goal:{item,count:2},reward:{[j?'wood':'berry']:4},
      intro,done,after:'If I’m away from the window, look for me where the street joins the square.'
    };
  });
});

const regularStreets=[
  [0,-7.0,25,3.8],[0,2.7,25,3.8],[0,11.4,26,3.45],[-10.6,2.4,3.35,20.5],
  [10.6,2.4,3.35,20.5],[-.15,1.5,4.1,25.3],[0,19.0,4.0,13.2]
];

export function townPavement(town){
  const [x,z]=town.center;
  const style=town.layout;
  let runs=[];
  if(town.place==='village') runs=[[7.6,8,1.45,18],[10.1,8.45,9.5,1.55],[-12,20,1.35,9]];
  else if(town.legacy) runs=[[4,-11.8,25,3.7],[13.0,1.1,3.1,23.0],[-13.2,1.2,3.15,22],[0,11.8,25,3.7]];
  else if(town.design&&style==='harbor') runs=[[1,11.9,29,4.7],[1,1,29,6.8],[-10,-1,3.55,23],[10.7,-1,3.5,23],[0,-8,8.1,17]];
  else if(town.design&&style==='terrace') runs=[[0,-11.8,22,3.3],[0,-1.9,29,3.95],[-2,8.1,27,3.7],[-7,1,4.2,26],[7.4,-3.7,3.2,22]];
  else if(town.design&&style==='highstreet') runs=[[0,-1.7,6.8,32],[0,-14,18.1,3.1],[0,4,19.3,3.7],[0,14,17,3.1],[-7.4,-1.45,2.6,21],[7.1,-1.2,2.7,25]];
  else if(town.design&&style==='village') runs=[[0,7.1,21,3.25],[-.15,2,3.3,26],[-9.7,-.7,2.8,22],[9.95,-.85,2.63,20],[-1,-10.4,18,2.8]];
  else if(style==='harbor') runs=[[0,-8.15,24,3.75],[0,.2,23,4.5],[0,13,30,4.4],[-10.5,1.4,3.22,21],[10.42,2,3.2,22],[0,16,4.1,20]];
  else if(style==='highstreet') runs=[[0,-9,24,3.7],[0,4.0,26,4.2],[0,14.0,23,3.5],[-8.34,3.1,4.25,25],[8.34,3.1,4.25,25],[0,5,4.3,40]];
  else if(style==='courtyard') runs=[[0,-7.3,20,3.35],[0,.0,20,7.6],[0,9.7,22,3.9],[-8.3,2,3.3,17],[8.3,2,3.3,17],[0,16.0,4.5,19.0]];
  else runs=regularStreets;
  return runs.map(([px,pz,w,d])=>[x+px,z+pz,w,d]);
}

