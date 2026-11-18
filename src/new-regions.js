// Each entry describes one atlas region and the settlement at its heart.
const entries=[
  ['opalreach','Opalreach','Prismmarket',[-509,-236],'mesa','courtyard','adobe',
    ['#c9a6a2','#f2d3bb','#987aa3','#83c9bc'],'prism','The Singing Prism',
    ['Mina Facet','Stone tuner','Notes in a stone','item'],
    ['Opal shaving','gem','Prism fudge','Opal syrup'],
    ['Sheenwhisk','fox','#cfb4a2','#b5d9df','It naps inside patches of colored light.'],
    'The prism went sharp after the last storm. Bring me three opal shavings and I’ll make a matching wedge.',
    'There’s the old note. Listen when the wind turns through the south arch.'],
  ['hushsnow','Hushsnow','Blanket Hollow',[-509,-118],'frost','terrace','cottage',
    ['#9ebfca','#dae9df','#5e7b9e','#e1a7ae'],'shelter','The Snow Bell Shelter',
    ['Asta Thaw','Winter steward','A place out of the wind','bond'],
    ['Thaw reed','sprout','Snowberry oatcake','Snow oats'],
    ['Flurrytuft','hare','#eee5df','#a4b9ce','It kicks snow over the footprints of its friends.'],
    'There’s a shy hare near the bell shelter. The wind scares it more than people do. Sit low and offer an oatcake.',
    'It came all the way out! I’ll leave a dry patch under the shelter for both of you.'],
  ['brambleglass','Brambleglass','Lanternbough',[-509,0],'woods','village','gabled',
    ['#708d74','#d9cfb5','#536f74','#d9a2bd'],'lanterns','The Hanging Lantern Grove',
    ['Elo Sedge','Grove keeper','The wick-cutters’ mark','stamp'],
    ['Glassbramble leaf','flower-2','Bramble cake','Bramble honey'],
    ['Glowdarn','moth','#cdc4ad','#e8a6cd','Its wings warm old lantern glass without leaving soot.'],
    'My aunt trimmed every wick in the grove to the same height. Check her old trail marker before I cut the new batch.',
    'That little notch tells me exactly where to cut. Her lamps always outlasted mine.'],
  ['pearldrift','Pearldrift','Whitewake Harbor',[-509,118],'coast','harbor','row',
    ['#72a5aa','#c3ddd3','#497788','#f0ae99'],'ferry','The Whitewake Ferry Dock',
    ['Tavi Pearl','Ferry carpenter','A float for the evening boat','item'],
    ['Pearlwood peg','trees','Saltberry pretzel','Pearlwood sap'],
    ['Wispfin','gull','#f2e8cf','#79afc6','It sleeps on the stern while the ferry bobs.'],
    'The stern rail floats away every time I try to set it. Three pearlwood pegs will let me fasten it from the dock.',
    'It held. The first thing we’re taking across is a basket of fresh pretzels.'],
  ['shellmirror','Shellmirror','Moonwash Beach',[-509,236],'coast','harbor','gabled',
    ['#83bbb3','#d2e1cc','#6e8f9b','#eac9ac'],'tide','The Mirror Tidepools',
    ['Nami Crest','Shell listener','A tidepool visitor','bond'],
    ['Moon shell','gem','Moonmint roll','Sea mint'],
    ['Bufferclick','crab','#bd8881','#d6caeb','It taps once to greet you, then three times if you stay.'],
    'One pool has a resident who clicks back when I sing. Take a moonmint roll, but approach just one pool at a time.',
    'I heard the taps from here. Three means yes, or that it wants a second roll.'],
  ['windspool','Windspool','Spindle Commons',[-391,-236],'meadow','highstreet','row',
    ['#b7b07b','#e5d9a5','#9a7c88','#87b4b6'],'spindle','The Threadwind Mill',
    ['Yara Wick','Thread spinner','Where the spindle stops','stamp'],
    ['Spindle flax','sprout','Flaxseed twist','Flax sugar'],
    ['Thistlekite','bee','#f0cd79','#e9a5be','Its antennae turn just before a sudden gust.'],
    'The mill should stop just before its counterweight reaches the blue chalk. Find the old survey mark so I know where to paint it again.',
    'The blue mark is back. We can spin linen even while the gusts are uneven.'],
  ['claycup','Claycup','Glazehearth',[-391,-118],'mesa','courtyard','adobe',
    ['#b98a70','#e4c4a2','#996d78','#91b8a3'],'kiln','The Honeyglaze Kiln',
    ['Rafi Hands','Potter','Clay for the small cups','item'],
    ['Honey clay','mountain','Kilnfruit tart','Kilnfruit mash'],
    ['Turnipcoil','hedgehog','#a78370','#e3c097','It curls into newly fired bowls before the glaze cools.'],
    'My smallest bowls always split before I can cool them. Three lumps of honey clay should soften the mix.',
    'The new cups came out whole. Take the one with the crooked handle. It pours better.'],
  ['thornpost','Thornpost','Kitepost Square',[-391,0],'heath','highstreet','cottage',
    ['#a69b8f','#d1c2ba','#765f83','#a3bc86'],'kites','The Kite Post',
    ['Merle Linn','Kite courier','Quiet under the line','bond'],
    ['Bramble silk','sparkles','Kitesilk wafer','Bramble sugar'],
    ['Skrindle','mouse','#bc9476','#f5c4b0','It tucks fallen kite tails behind its whiskers.'],
    'A mouse has been untying the repaired tails. Sit under the lines with a wafer and see if it will bring one back.',
    'That was my favorite stripe. We’ll make a smaller kite for it out of the scraps.'],
  ['coppercap','Coppercap','Cap Lanterns',[-391,236],'woods','village','gabled',
    ['#8c9b72','#e5d6ad','#6f776b','#cb996f'],'caps','The Coppercap Colony',
    ['Nori Cap','Fungus grower','Spores after the rain','stamp'],
    ['Coppercap fleck','sprout','Honeycap biscuit','Cap nectar'],
    ['Beadfoot','sprite','#bcbd90','#ffc292','It jumps from cap to cap and shakes dew off its shoes.'],
    'My mushrooms changed the course of the rain. Check the old marker before I move the next batch of baskets.',
    'No wonder the western basket grew first. I’ll leave a whole row for the sprites.'],
  ['belltarn','Belltarn','Tarn Bell Market',[-273,-236],'frost','terrace','gabled',
    ['#91b5c1','#e2ddd3','#71829a','#d5ad87'],'bells','The Thaw Chimes',
    ['Una Ring','Bell founder','A bell no louder than snow','item'],
    ['Tarn bronze','gem','Tarnberry cracker','Tarnberry jam'],
    ['Tinkowl','owl','#cfddde','#ab98c6','It answers the bell in the gap between two notes.'],
    'The smallest chime needs three pieces of tarn bronze, so you can hear the thaw without startling the owls.',
    'That’s quiet enough. Wait a moment and listen for the answer.'],
  ['sunhammer','Sunhammer','Sunstrike Bazaar',[391,-236],'mesa','courtyard','adobe',
    ['#cd9771','#f3cf9b','#8d5d6a','#c4bf80'],'forge','The Sunstrike Forge',
    ['Paz Bellows','Smith','A copper shadow','stamp'],
    ['Sun copper','mountain','Date-crust pastry','Sun dates'],
    ['Cinderdot','dragon','#d49877','#f8c677','It turns its belly toward warm shade stones after the fires go out.'],
    'My summer shade panel has a shadow line that only shows up near the old marker. Survey it before I move the awning posts.',
    'That line reaches the water jar at noon. We’ll have cool water even in the hottest week.'],
  ['inkroot','Inkroot','Quillwood Walk',[391,-118],'woods','village','row',
    ['#7b898e','#d7d6ca','#636489','#bbb5df'],'archive','The Open-Air Archive',
    ['Iri Fern','Archivist','A moth in the margins','bond'],
    ['Quill bark','trees','Inkplum bun','Inkplum preserve'],
    ['Pagemoth','moth','#bce0dc','#c0b0e6','It rests where two pages meet, with its wings folded like a bookmark.'],
    'Someone has been pressing tiny shapes into the damp paper. Offer an inkplum bun and watch which book it chooses.',
    'A reader after all. I’ll leave that one outside on dry evenings.'],
  ['goldgraft','Goldgraft','Amber Press',[391,0],'orchards','terrace','cottage',
    ['#aaa05f','#eee0ad','#858e71','#e2ac7f'],'orchard','The Goldgraft Press',
    ['Oren Splice','Graft keeper','Apples for a light pressing','item'],
    ['Gilt apple','cherry','Golden peel turnover','Peel syrup'],
    ['Pipcurl','mouse','#c7a678','#ece0a7','It hides a separate pile of seeds for winter planting.'],
    'The wooden press is set too hard for the gilt apples. Bring three and I’ll set the spring by hand.',
    'The peel stayed in one piece. I’ll candy the next lot for the market.'],
  ['reedwatch','Reedwatch','Stiltmarket',[391,118],'delta','harbor','row',
    ['#8daa80','#e0ddb2','#678482','#d5a3a3'],'bridge','The Reedwatch Drawbridge',
    ['Lio Cleat','Bridge attendant','The longest reed','stamp'],
    ['Watch reed','sprout','Reedflower dumpling','Reedflower mash'],
    ['Puddleknob','axolotl','#c5b98f','#e9a5ab','It counts drips by rocking gently from side to side.'],
    'My grandmother measured the river by reed lengths. The marked stone has her high-water figures. I’d like to compare this spring.',
    'It’s two reeds lower. We can leave the short bridge in place for another week.'],
  ['honeywarden','Honeywarden','Amberveil Market',[391,236],'meadow','village','cottage',
    ['#a8b47e','#e6daa5','#9c9275','#efbb99'],'apiary','The Honeyveil Apiary',
    ['Moss Vale','Beekeeper','One more worker','bond'],
    ['Ambercomb sliver','gem','Amber honey knot','Ambercomb honey'],
    ['Nectarstitch','bee','#eac585','#dca9b1','It can repair a torn hive curtain with loose fibers and patience.'],
    'The hive curtain has a new seam that nobody here can sew. If you bring a honey knot, you might meet the repairer.',
    'Nectarstitch earned a reserved peg by the hive. We’ll keep a honey knot there when you travel.'],
  ['stellarcairn','Stellarcairn','Starwell Steps',[509,-236],'frost','terrace','gabled',
    ['#9998b8','#e4e0ea','#686995','#a6d1e4'],'orbits','The Starwell Observatory',
    ['Runa Lens','Map keeper','The last line of the sky map','stamp'],
    ['Star mica','sparkles','Mica sugar wafer','Star anise ice'],
    ['Seleneknot','unicorn','#e2daee','#8dc8dd','Its horn dims whenever clouds cover the stars.'],
    'Our chart and the old survey post disagree by one star. Go read the inscription before I scratch a new line into the brass.',
    'We were reading the shadow backwards. I’ll make a second chart from the opposite side.'],
  ['redfan','Redfan','Shadefan Court',[509,-118],'mesa','courtyard','adobe',
    ['#c07f70','#ebbe9d','#8d626f','#91ae91'],'fans','The Redfan Arcade',
    ['Dara Fold','Fan maker','Shade you can fold','item'],
    ['Fan palm rib','trees','Fanleaf cracker','Fan palm sugar'],
    ['Dustkip','dragon','#caa484','#89b09c','It follows the smallest moving shadow from one wall to the next.'],
    'Someone left a fan outside overnight and the ribs curled. Bring three fresh palm ribs so I can finish one before midday.',
    'The shade folds flat now. Tell the baker to keep the first one by the oven.'],
  ['rainchain','Rainchain','Cistern Parade',[509,0],'heath','highstreet','row',
    ['#a38db3','#d6c3d5','#72688b','#a6cdc4'],'chains','The Singing Rain Chains',
    ['Sae Cup','Water collector','A welcome rain','bond'],
    ['Rainchain bead','gem','Cupberry biscuit','Cupberry cordial'],
    ['Rainskip','hare','#d6b8c9','#9ec9bf','It races the water down the row of little cups.'],
    'The old cup chain has a visitor who sits under the dry rung. Share a biscuit before the next shower comes through.',
    'I’ll keep the dry rung on the new chain. We haven’t had a proper cup inspector before.'],
  ['saltbanner','Saltbanner','Pennant Quay',[509,118],'coast','harbor','gabled',
    ['#83aaa1','#c3dddc','#648692','#eaa78f'],'pennants','The Tide Banner Tower',
    ['Cora Line','Signal maker','A flag high enough','stamp'],
    ['Signal twine','trees','Sea-plum scone','Sea-plum glaze'],
    ['Canvascrest','gull','#e6ded0','#af98bd','It balances on the flag hinge while waiting for a wind change.'],
    'The new pennant looks fine from the dock. Walk to the survey marker and check whether the tower still hides its lower corner.',
    'Raise it half a rung, then. Now the northbound boats can read both colors.'],
  ['fernwick','Fernwick','Fernwick Baths',[273,236],'delta','terrace','gabled',
    ['#94b394','#d6dfbc','#688786','#dfafa4'],'springs','The Fernwick Springhouse',
    ['Jori Pool','Bath steward','A basket of warm stones','item'],
    ['Spring pumice','mountain','Hotpool bun','Watermint cream'],
    ['Mossbath','turtle','#95bb9d','#d5b498','It tests the water by lowering exactly one toe.'],
    'The cooling basin could use three pieces of spring pumice. The old rocks hold heat longer than anyone here likes.',
    'You can put a whole foot in now. The turtle has been testing it for us since dawn.']
];

const layouts={
  harbor:[[0,8],[31,-29],[2.7,8.5,.17]],
  terrace:[[2,7],[-30,-31],[-2.85,7.7,-.13]],
  courtyard:[[-2,5],[29,-27],[.25,7.1,0]],
  highstreet:[[-4,9],[-31,-26],[2.85,9.5,.26]],
  village:[[4,4],[32,-29],[-2.4,8.7,-.09]]
};
const elevations={coast:1.27,mesa:2.04,frost:2.88,woods:1.50,delta:1.24,meadow:1.61,heath:1.68,orchards:1.50};
const profiles={
  prism:['Checking the tuning wedge','Polishing crystal faces','Covering the prisms'],
  shelter:['Sweeping the snow','Checking the blanket hooks','Banking the fire'],
  lanterns:['Trimming lantern wicks','Sorting forest finds','Lighting the lanes'],
  ferry:['Loading the ferry','Checking harbor floats','Tying up the evening boats'],
  tide:['Checking the tide pools','Sorting shell baskets','Closing the harbor stalls'],
  spindle:['Checking the mill sails','Spreading grain to dry','Rolling up the sails'],
  kiln:['Firing the cups','Checking the glaze','Cooling the kilns'],
  kites:['Tending the kite lines','Folding paper sails','Taking the kites down'],
  caps:['Tending plants','Sorting forest finds','Checking the lanterns'],
  bells:['Tuning the little bells','Listening for the thaw','Closing the bell shed'],
  forge:['Opening the shade screens','Checking the bellows','Banking the forge'],
  archive:['Reading','Cutting book ribbons','Covering the shelves'],
  orchard:['Picking fruit','Packing baskets','At the press'],
  bridge:['Opening the water gates','Reed weaving','Tying up the evening boats'],
  apiary:['Tending plants','Checking the hive curtains','Collecting honey jars'],
  orbits:['Reading','Cleaning the observation lens','Checking the star chart'],
  fans:['Opening the shade screens','Cutting palm ribs','Folding the fans'],
  chains:['Tending the rain cups','Cleaning the cistern rim','Checking water jars'],
  pennants:['Opening the harbor stalls','Checking signal lines','Lighting the quay'],
  springs:['Sweeping the bathing steps','Measuring the pool level','Folding towels']
};

const assistants=[
  ['Perri Vane','Fiona Cleft'],['Kelda Burr','Bryn Stitch'],['Ollin Moss','Cass Willow'],
  ['Tova Quay','Demi Wake'],['Luka Pearl','Fenn Tide'],['Pelle Thread','Nessa Coil'],
  ['Suri Glaze','Dax Clay'],['Kestrel Penn','Rimi Haw'],['Tess Gill','Hollin Fern'],
  ['Vera Ring','Flynn Bell'],['Vela Copper','Arin Shade'],['Ari Paper','Wren Ink'],
  ['Aster Peel','Nell Core'],['Alba Moor','Danya Reed'],['Ollie Straw','Faye Honey'],
  ['Orla North','Beck Stars'],['Len Fold','Rina Frond'],['Ada Rill','Eris Gauge'],
  ['June Kite','Silva Flag'],['Isla Steam','Jae Wick']
];

export const newRegions=Object.fromEntries(entries.map(([
  id,title,name,coordinates,biome,layout,architecture,palette,design,landmark,keeper,stock,pet,intro,done
],index)=>{
  const [annex,wilderness,[dx,dz,yaw]]=layouts[layout];
  const center=[annex[0]+(index%3-1)*2,annex[1]+(index%4-1)];
  const [greeting,afternoon,evening]=profiles[design];
  const [nameOfKeeper,role,quest,task]=keeper;
  const [material,icon,food,supply]=stock;
  const [animal,kind,color,accent,lore]=pet;
  const place=id+'town';
  return [id,{
    id,title,name,place,landmark,coordinates,biome,layout,architecture,palette,design,center,wilderness,
    arrival:[center[0]+dx,center[1]+dz],yaw,
    elevation:elevations[biome],greeting,afternoon,evening,
    feature:landmark+' · '+role.toLowerCase()+' district',
    keeper:{name:nameOfKeeper,role,quest,task,intro,done},
    stock:{material,icon,food,supply},
    pet:{animal,kind,color,accent,lore},
    neighbors:assistants[index]
  }];
}));

export const newRealmLayouts=Object.fromEntries(Object.values(newRegions).map(({id,coordinates:[x,z],title,palette})=>[
  id,{x,z,rx:59,rz:59,title,tone:palette[0]}
]));

export function landmarkPoint(region){
  const [x,z]=region.center;
  return ['ferry','tide','bridge','springs'].includes(region.design)
    ?region.wilderness:[x+3.75,z-5.75];
}

export function regionalPath(region){
  const [cx,cz]=region.center,[x,z]=region.wilderness;
  return [[cx,cz+7],[cx,cz-7.8],[cx+4.65,cz-9.5],[cx+4.65,cz-22],[(cx+x)*.5,z+4.5],[x,z+2.4]];
}

export function pathDistance(path,x,z){
  let best=Infinity;
  for(let i=1;i<path.length;i++){
    const [ax,az]=path[i-1],[bx,bz]=path[i];
    const dx=bx-ax,dz=bz-az;
    const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));
    best=Math.min(best,Math.hypot(x-ax-dx*t,z-az-dz*t));
  }
  return best;
}
