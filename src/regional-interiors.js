// Each room has a workpiece, a floor plan and a short local errand.
// Positions run left/right, from the back wall to the entrance.
const plans={
  gallery:['R0','R2','L1','L0'],
  atelier:['L0','R2','R1','L2'],
  window:['L1','L2','R0','R2'],
  alcove:['R1','R0','L0','L2'],
  study:['L0','R0','R2','L1'],
  hearth:['R0','L0','L2','R1'],
  longroom:['L1','R0','L0','R2'],
  snug:['R1','L2','L1','R0'],
  taproom:['L0','L2','R1','R0'],
  lodge:['R0','R2','L0','L1'],
  island:['L1','R2','L2','C0'],
  showcase:['R2','L1','R1','C0']
};

function step(instruction,answer,alternative,retry,reverse=false){
  return {instruction,choices:reverse?[alternative,answer]:[answer,alternative],answer,retry};
}

function room(plan,feature,rug,title,label,brief,steps,done){
  return {plan,feature,rug,activity:{title,label,brief,steps,done}};
}

export const regionalInteriors={
  opalreach:[
    room('island','prism','ring','A Clean Beam','Align the display prism','The Singing Prism sends a sliver of light through this window. Use the shop’s display prism to land it on the empty tile.',[
      step('The wedge is throwing the beam toward the wall. Its straight face redirects light toward the floor.','Turn the flat face toward the window','Turn the point toward the window','The colored line still runs up the wall. Try the face that angles it down.',true),
      step('The beam lands in the blank cradle. Of the two loose tiles, only the frosted one holds a visible beam.','Set in the frosted tile','Set in the polished tile','The polished tile sends the light back out the window.')
    ],'A stripe of violet holds steady on the floor. The cutter leaves an opal shaving for your pocket.'),
    room('study','lantern','stars','The Colored Window','Set the evening lantern','The inn’s lantern paints a little sunset on the shutters even when the sky is grey.',[
      step('The blue pane is already in place. The old shade has a slot over it for rose glass.','Slide the rose pane over blue','Put an amber pane beside it','An amber pane makes a separate patch. The innkeeper wants the colors to overlap.')
    ],'Violet light falls across the low reading bench. The innkeeper sets aside a snack.')
  ],
  hushsnow:[
    room('window','crates','runner','Before the Pass Closes','Pack the shelter crate','The pantry keeps a crate for travelers stranded at the Snow Bell Shelter.',[
      step('A wool lining keeps the bottles from freezing. The straps hold everything against that lining.','Put the wool lining in first','Tighten the straps first','There needs to be something beneath the straps.',true),
      step('The last parcel must last a week on the pass. The fresh greens wilt by tomorrow.','Pack the dried thaw reed','Pack the fresh greens','Save the fresh greens for tonight’s supper.')
    ],'The crate is packed and tagged for the next shelter run.'),
    room('lodge','bunks','runner','A Bed for Cold Boots','Make up the bunk','The bottom bunk is reserved for a traveler coming off the pass with wet gear.',[
      step('The blanket chest has thick felt and fine linen. Put the warmer layer down for the cold traveler.','Lay out the thick felt','Lay out the fine linen','The fine linen can go on after the felt.',true)
    ],'The bunk is ready and there’s a cleared spot for the wet boots.')
  ],
  brambleglass:[
    room('atelier','herbs','patch','A Bramble Without Barbs','Gather display cuttings','The counter has a tray of glassbramble slips for the town’s lantern-tenders.',[
      step('The curled slips want to snag on gloves. Set aside the smooth, straight slips for the cuttings tray.','Sort the straight slips into the tray','Sort the curled slips into the tray','A barb catches your sleeve. Leave the curled slips here.')
    ],'The lantern-tenders have a neat tray of slips they can pick up in heavy gloves.'),
    room('snug','lantern','ring','The Paired Lamps','Set the two grove lamps','The innkeeper takes a pair of colored lamps on the grove round.',[
      step('The round starts by the root bridge. The old route tag gives the bridge lamp amber glass.','Fit amber glass to the bridge lamp','Fit green glass to the bridge lamp','Green marks the far turn. Amber goes at the bridge.',true),
      step('One lamp goes ahead and one stays at the gate so the pair can find each other.','Leave the green lamp at the gate','Carry both lamps ahead','The last tender needs a lamp to walk toward.')
    ],'Both lamps catch. The innkeeper sets a second cup by the door for the other tender.')
  ],
  pearldrift:[
    room('alcove','shells','stripes','The Pearl Tally','Sort the ferry pearls','The shop weighs a pouch of loose beads against the ferry ledger.',[
      step('The ledger lists drilled beads for sewing. Undrilled beads belong in the weigh pan.','Lift the drilled beads out','Lift the undrilled beads out','Only the undrilled beads go on the scale.')
    ],'The small balance comes level and the tally agrees with the ledger.'),
    room('longroom','chart','stripes','The Last Ferry Flag','Ready the signal board','A ferry hand left the night signals pinned beside the door.',[
      step('The west landing uses a white pennant for the last crossing. Find it among the storm signals.','Set aside the white pennant','Set aside the red pennant','The red pennant calls off the crossing.',true)
    ],'The ferryman can collect the white pennant on his way down.')
  ],
  shellmirror:[
    room('gallery','water','ring','Matching the Moon Pool','Match a shell to the pool','Moonwash Shells has a shallow tray of water that catches the same colors as the lowest tide pool.',[
      step('This tray shows a violet fringe. The rough white shell throws a silver fringe and the lilac shell throws violet.','Set the lilac shell in the tray','Set the rough white shell in the tray','The white shell throws silver, even underwater.',true)
    ],'The violet fringes meet across the surface of the tray.'),
    room('window','shells','patch','The Quiet Table','Lay the tide-watch place','The inn keeps a low seat for the guest who watches the last of the tide.',[
      step('The guest likes to hear the water. Set a soft shell mat under the crockery to quiet the table.','Put down the shell mat','Put down the stone board','The crockery rings on the stone board.')
    ],'The bowl sits quietly on the shell mat as the tide turns.')
  ],
  windspool:[
    room('atelier','loom','stripes','The Inside Seam','Mend the spindle sail','The exchange has an offcut from an alternating-color spindle sail.',[
      step('The dark patch on the inner edge marks the tear. Fold that edge back to reach it.','Fold back the marked inner edge','Cut off the pale outer edge','The pale outer edge is sound.',true),
      step('A loose pass flexes in a gust. A tight pass pulls out the next stitch.','Sew a loose running stitch','Sew a tight straight stitch','The tight thread puckers the sail.')
    ],'The seam bends freely when you hold the finished sail up to the window.'),
    room('taproom','bunks','patch','No Rattle Tonight','Pad the bobbin rack','The Loose Bobbin puts its spare loom bobbins to bed before the guests.',[
      step('The short spindles slip through the wide hooks. The deep felt tray will hold them all.','Put the short spindles in the felt tray','Hang the short spindles from the hooks','A short spindle drops straight through.')
    ],'The wind lifts a shutter. For once the bobbins stay quiet.')
  ],
  claycup:[
    room('showcase','kiln','patch','The Little Test Tile','Check the test glaze','The potter wants to know which tile should come out of the warming kiln.',[
      step('A finished test glaze goes glossy. One tile still looks powdery.','Lift out the glossy tile with the tongs','Lift out the powdery tile with the tongs','The powdery glaze still needs heat.',true)
    ],'The glossy tile goes onto the cooling board without a chip.'),
    room('hearth','pots','stripes','Toasty Crocks','Warm the supper crocks','The Warm Tile keeps soup warm in crocks that sit beside the coals.',[
      step('The pots are cold. Sudden heat cracks clay, so slide them onto the warm ledge away from the fire.','Start them on the warm ledge','Put them directly on the coals','The clay needs time to warm through.'),
      step('The cook wants steam to escape while the crocks warm.','Set the lids slightly ajar','Seal the lids tightly','A sealed lid traps the steam.',true)
    ],'The serving crocks are warm, dry, and ready for supper.')
  ],
  thornpost:[
    room('window','kite','stars','A Tail for the Gusts','Balance the shop kite','A small test kite above the bench keeps diving in sudden gusts.',[
      step('A longer tail will steady it. The extra ribbon belongs at the bottom tip.','Tie it to the bottom tip','Tie it to the top spar','The top spar pulls the kite farther off balance.')
    ],'The kite holds steady in the draft through the door.'),
    room('lodge','crates','runner','Ribbons Before Rain','Stow the square’s ribbons','The inn takes in the spare ribbons whenever rain blows in over the square.',[
      step('The longest ribbons are damp. The airing rack dries them without creasing.','Spread them on the airing rack','Fold the damp ribbons into the trunk','The trunk would keep them damp.',true)
    ],'Four ribbons hang neatly above the bench with space between them.')
  ],
  coppercap:[
    room('study','herbs','ring','Underneath the Caps','Prepare the mushroom tray','The basket-maker keeps an assortment of local mushrooms for the dusk lamps.',[
      step('Only the pale-gilled caps reflect light back down. Turn each cap over to check before you sort.','Set out the pale-gilled caps','Set out the brown-gilled caps','The brown gills stay dark under lamplight.')
    ],'The tray glows a little when you carry it past the wall lantern.'),
    room('snug','lantern','patch','A Cap for Each Seat','Shade the supper lamps','Under the Cap uses copper shades to keep the light out of people’s eyes.',[
      step('The low table needs the broadest shade. The narrow one throws a bright point right at eye level.','Fit the broad shade over the low table','Fit the narrow shade over the low table','There’s still a bright point in every guest’s eyes.',true)
    ],'A pool of copper light settles on the table without reaching the seats.')
  ],
  belltarn:[
    room('atelier','bells','runner','Back Through the Mist','Test the three tarn bells','A bellmaker has hung three small copies of the tarn bells at the bench.',[
      step('The smallest bell marks the town path. Start with its high note.','Ring the small bell','Ring the large bell','That low note is for the far shore.',true),
      step('The answer bell is the middle pitch. Leave the low bell silent so no one starts down to the water.','Ring the middle bell','Ring the large bell','The large bell would send them to the far shore.')
    ],'High and middle answer each other. You can hear both notes all the way by the door.'),
    room('hearth','bells','stripes','The Supper Chime','Set the hearth chimes','The inn’s pair of soft chimes tells the cook when the far table is ready.',[
      step('The peg for a single chime means tea. Supper calls for two chimes on the paired hook.','Hang both chimes on the paired hook','Leave one chime on the tea peg','One chime brings the kettle, and the table is already set for stew.',true)
    ],'A soft double note carries to the kitchen and bowls start coming out.')
  ],
  sunhammer:[
    room('alcove','anvil','stripes','Cool Enough to Stamp','Stamp the forge token','The smith leaves warm copper tokens on a row of colored pads.',[
      step('A red token will smear under the stamp. A dark token is ready to take an imprint.','Stamp the dark token','Stamp the red token','The red copper is still too hot to keep a clean imprint.')
    ],'The sunburst stamp comes away clean.'),
    room('longroom','lantern','runner','The Banked Fire','Bank the evening hearth','The inn keeps a little heat under the ashes for breakfast.',[
      step('Banking a fire means covering the embers loosely with dry ash. Water puts them out.','Rake dry ash over the embers','Pour water over the embers','The innkeeper needs the embers to last till morning.',true)
    ],'The stove goes quiet with a little red heat still showing under the ash.')
  ],
  inkroot:[
    room('study','folios','stars','The Leaf in the Ledger','Mend a loose folio','A loose page from the outdoor archive has blown into the binder’s shop.',[
      step('Its edge has a line of stitching holes. The binder can use those holes without puncturing the paper again.','Thread the existing holes','Punch new holes across the edge','The old holes will hold a new thread.',true),
      step('A ribbon across a closed cover marks a finished copy. A book left open is still being copied.','Close it and lay a ribbon across it','Leave it open on the lectern','An open book tells the archivist you’re still copying.')
    ],'The mended folio can go straight back to the outdoor shelf.'),
    room('alcove','folios','patch','The Reading Nook','Set out a dry reading copy','The Dry Page keeps an evening copy ready in case a wanderer arrives in the rain.',[
      step('A damp sleeve leaves a mark. Put the reading copy on the raised stand where sleeves can’t brush it.','Prop it on the reading stand','Lay it on the bench by the door','Wet sleeves will pass right over that bench.')
    ],'The stand is dry and the page is open at the town’s oldest story.')
  ],
  goldgraft:[
    room('window','crates','patch','A Branch for Spring','Match a graft to its tag','The Grafting Shed sorts branch cuttings before the orchard wakes.',[
      step('The keeper needs a sweet-apple graft. Its cuttings wear gold tags above the first bud.','Pick the gold-tagged cutting','Pick the green-tagged cutting','The green tags are for the tart apples.')
    ],'The sweet-apple cutting is bundled with the right rootstock.'),
    room('island','press','stripes','First Pour at the Press','Try the small cider press','The inn lets guests work a tabletop press beside the long table.',[
      step('The cloth catches pips and skins. Fit it inside the press basket before adding chopped fruit.','Line the basket with cloth','Pack in the fruit first','Without the cloth the pips go straight into the cup.',true),
      step('The channel in the board slopes toward the spout. It needs a cup underneath.','Place a cup beneath the spout','Place a cup beneath the handle','The handle is uphill of the juice.')
    ],'The first clear trickle of cider fills your cup.')
  ],
  reedwatch:[
    room('longroom','loom','stripes','A Dry Punt Seat','Weave the spare seat','The boatwright is weaving a replacement seat for the ferry punt.',[
      step('The last strip went over. The next one has to pass under to lock the weave.','Thread the next reed under','Thread the next reed over','Two over in a row leave that strip free to slide.',true)
    ],'The seat holds taut when you press a palm against it.'),
    room('lodge','chart','runner','Above the High-Water Mark','Reset the marks board','There are three old flood marks on the inn’s stair board.',[
      step('The board calls for dry bedding above the highest recorded water. The bottom shelf flooded twice.','Mark the top shelf for dry bedding','Mark the bottom shelf for dry bedding','The old stair board has two high-water marks above that shelf.')
    ],'The bedding is stowed above every mark on the board.')
  ],
  honeywarden:[
    room('gallery','hives','patch','Swarm Colors','Sort the hive markers','The counter has painted markers from the newest swarm’s hive boxes.',[
      step('The keeper’s key gives the newest swarm the sunflower-yellow box. Find the matching marker.','Set out the sunflower-yellow marker','Set out the brown marker','Brown goes on an older box.',true)
    ],'The keepers can spot the newest hive from the path without opening it.'),
    room('snug','herbs','ring','A Quiet Bedtime Brew','Steep the inn’s honey tea','This blend needs gentler water than the usual breakfast brew.',[
      step('Boiling water bruises the fresh blossoms. The little kettle has just stopped steaming hard.','Pour the slightly cooled water','Boil the water again','The blossoms darken at a full boil.'),
      step('The honey goes in after the blossoms come out so the strainer stays clear.','Lift the strainer, then stir in honey','Push the honey through the strainer','The honey sticks to the blossoms and clogs the mesh.',true)
    ],'The tea tastes of fresh blossoms and the strainer is clean.')
  ],
  stellarcairn:[
    room('showcase','orrery','stars','Bring a Star Into Focus','Focus the small telescope','The lensmaker has set an observatory copy on the bench.',[
      step('The widest setting shows the whole sky. Find the brightest point with that setting first.','Start with the wide lens','Start with the narrow lens','At close range you can’t find the bright point to center it.',true),
      step('The star is centered. Change to the narrow lens to bring out the points around it.','Fit the narrow lens now','Turn the telescope away','Keep the centered point inside the ring.')
    ],'Four faint points come into focus around the bright star.'),
    room('study','chart','stars','A String of Stars','Trace the Northern Window','The inn’s chart shows the little route used to find the north star from this window.',[
      step('The route starts at the two stars on the edge of the drawn bowl. Find the pair that point out of the bowl.','Trace from the rim pair','Trace from the middle of the bowl','The line must leave from the two stars on the rim.')
    ],'Your thread ends at the north star above the window.')
  ],
  redfan:[
    room('atelier','kite','stripes','The Noon Fold','Fit a fan rib','The artist has left one unfinished shade fan on the rack.',[
      step('The inner rib moves at the hinge. Keep the waxed end at that hinge so the fan folds cleanly.','Fit the waxed end at the hinge','Fit the waxed end along the outer edge','An unwaxed hinge catches when you fold it.')
    ],'The fan opens and shuts in one smooth movement.'),
    room('window','loom','runner','Beneath the Long Shade','Arrange the cool place','A corner of the inn is set aside for people arriving at noon.',[
      step('The shade fan casts its longest shadow down the window wall. Put the drink tray there.','Take the tray along the window wall','Leave the tray in the sunlit doorway','The doorway is still bright through noon.',true)
    ],'The drink tray sits fully in the long shadow.')
  ],
  rainchain:[
    room('alcove','water','ring','Measure What Fell','Calibrate the rain gauge','The shop uses three bowls at different heights to test its brass measures.',[
      step('Run water into the highest bowl first. An open chain will send its overflow down to the others.','Pour into the highest bowl','Pour into the lowest bowl','Water cannot rise to the two empty bowls.',true),
      step('The scratched mark is level with the sill. Read it straight on to avoid a slanted reading.','Read at eye level','Read from above the rim','Looking from above shifts the mark against the waterline.')
    ],'All three measures agree with the scratch on the wall.'),
    room('showcase','water','patch','A Different Drip','Quiet the rain cup','The inn’s water chain drips into a resonant cup when it rains.',[
      step('A little water in the cup softens each falling drop. The empty brass rings.','Add water to the cup','Empty the cup completely','The next drop rings even louder.')
    ],'The drops fall into water with a gentle plink.')
  ],
  saltbanner:[
    room('longroom','kite','stripes','A Pennant for Heavy Air','Fold the harbor pennant','The harbormaster takes a short flag out when the sea wind picks up.',[
      step('Fold the spare pennant lengthwise so it still shows two colored edges.','Fold the pennant lengthwise','Roll it up from the tip','A roll hides the colored edges.',true)
    ],'The short flag still shows the harbor colors from both sides.'),
    room('lodge','lantern','runner','The Lamp on the Lee','Hang the lantern out of the wind','The inn keeps a beacon where sailors can see it from the leeward walk.',[
      step('Wind is rattling the seaward shutter. The opposite hook is sheltered by the thick stair wall.','Hang it on the sheltered hook','Hang it on the seaward hook','The seaward hook shivers in each gust.')
    ],'The beacon burns steadily on the sheltered side of the inn.')
  ],
  fernwick:[
    room('study','herbs','patch','A Flask for Foamleaf','Mix a bath sachet','The spring keeper wants a sachet that scents the water without leaving bits of leaf behind.',[
      step('Foamleaf belongs in a cloth bag. Crushed leaf poured loose gets caught in the drain.','Tie the foamleaf into a cloth bag','Pour crushed leaf in loose','Loose leaf would need fishing out of the drain.',true)
    ],'The finished sachet perfumes the tray without leaving leaves in the water.'),
    room('hearth','bunks','ring','After the Warm Spring','Set up the drying bench','The inn’s warm bench is for travelers just back from the baths.',[
      step('A slatted rack lets air reach both sides of a damp towel. The solid bench will hold the moisture.','Hang the towels across the slats','Pile the towels on the solid bench','The bottom towel is still damp.',true),
      step('Clean folded towels belong on the dry end, clear of the rack.','Put the clean towels at the dry end','Put the clean towels beneath the rack','Damp towels drip directly below the rack.')
    ],'There’s a dry stack for the next guests and air between every damp towel.')
  ]
};

const stationSlots={
  L0:[-1,-.33],R0:[1,-.33],
  L1:[-1,-.015],R1:[1,-.015],
  L2:[-1,.30],R2:[1,.30],C0:[0,-.33]
};

const displays={
  prism:[1.15,.87],crates:[1.37,.85],herbs:[1.20,.70],shells:[1.25,.73],water:[1.25,.80],
  loom:[1.50,.94],kiln:[1.38,.94],pots:[1.25,.72],kite:[1.18,.62],lantern:[.99,.69],
  bells:[1.48,.72],anvil:[1.37,.77],folios:[1.53,.77],press:[1.48,.92],hives:[1.45,.79],
  orrery:[1.25,.93],chart:[1.23,.72],bunks:[1.42,1.16]
};

function interiorLayout(spec,width,depth,inn){
  const props=[
    ['counter',1.62,.66],
    inn?['hearth',1.21,.56]:['shelf',1.57,.48],
    ['lectern',.62,.47],
    [spec.feature,...displays[spec.feature]]
  ];
  const fixtures=[],approaches=[];
  for(const [i,slot] of plans[spec.plan].entries()){
    const [side,row]=stationSlots[slot];
    const [kind,w,d]=props[i];
    const x=side*(width*.316+(spec.rug==='stripes'?.11:0));
    const z=row*depth+(spec.rug==='ring'?.12:spec.rug==='runner'?-.08:0);
    fixtures.push([kind,x,z,w,d]);
    approaches.push(side?[x-side*(w*.5+.28),z]:[x,z+d*.5+.31]);
  }
  const [counterSlot,hearthSlot]=plans[spec.plan];
  const openSlots=Object.keys(stationSlots).filter(slot=>slot!=='C0'&&!plans[spec.plan].includes(slot));
  const [counterSide,counterRow]=stationSlots[counterSlot];
  const clerkSlot=openSlots.find(slot=>slot[0]===counterSlot[0]);
  const clerk=[counterSide*width*.318,(clerkSlot?stationSlots[clerkSlot][1]:counterRow)*depth+(clerkSlot?0:.65)];
  if(inn){
    const extraSlot=openSlots.find(slot=>slot!==clerkSlot);
    const [side,row]=stationSlots[extraSlot];
    const kind=['hearth','taproom','longroom'].includes(spec.plan)?'table':'bench';
    fixtures.push([kind,side*width*.345,row*depth,kind==='table'?1.16:1.36,kind==='table'?.83:.52]);
  }
  const [hearthSide,hearthRow]=stationSlots[hearthSlot];
  const guest=[hearthSide*width*.388,hearthRow*depth+(hearthRow<.15?.63:-.62)];
  const stations=approaches.map(([x,z],i)=>({
    id:['stock', 'rest', 'notes','activity'][i],kind:['market','rest','read','activity'][i],x,z,
    label:[inn?'Order local food':'Browse local goods','Rest at the inn',inn?'Read the guestbook':'Read the shopkeeper’s note',spec.activity.label][i],
    hint:[inn?'Buy a snack or a hot meal':'Trade at the counter','Choose when to get up',null,'A local activity'][i]
  })).filter(station=>inn||station.id!=='rest');
  return {fixtures,stations,people:inn?[clerk,guest]:[clerk]};
}

export function buildRegionalInterior(realm,width,depth,inn){
  const spec=regionalInteriors[realm][Number(inn)];
  return {...interiorLayout(spec,width,depth,inn),feature:spec.feature,carpet:spec.rug,activity:spec.activity};
}

import {wardWorkshops} from './ward-workshops.js';

export function normalizeRoomActivities(raw){
  const entries=[];
  for(const [realm,specs] of Object.entries(regionalInteriors)){
    for(const [index,spec] of specs.entries()){
      const id=realm+'town-'+(index?'inn':'market');
      const value=raw?.[id];
      if(Number.isInteger(value)&&value>0&&value<=spec.activity.steps.length) entries.push([id,value]);
    }
  }
  for(const room of Object.values(wardWorkshops)){
    const value=raw?.[room.id];
    if(Number.isInteger(value)&&value>0&&value<=room.activity.steps.length)entries.push([room.id,value]);
  }
  return Object.fromEntries(entries);
}

export function answerRoomActivity(ledger,room,choice){
  const progress=ledger[room.id]??0;
  const step=room.activity.steps[progress];
  if(!step||!Object.hasOwn(step.choices,choice)) return null;
  if(step.choices[choice]!==step.answer) return {retry:step.retry};
  ledger[room.id]=progress+1;
  return {done:ledger[room.id]===room.activity.steps.length};
}
