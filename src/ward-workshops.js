import {wards} from './city-wards.js';

const designs={
  dyeward:{
    name:'The Selvedge Dyehouse',x:-12,z:-9,yaw:Math.PI,wall:'#efcfc0',rug:'#a55981',floorStyle:'tiles',
    title:'A ribbon for the east gate',reward:['madderRibbon','Eastgate Silk Rosette','flower-2'],
    apparatus:['dye bath','drying frame'],feature:'silk',
    order:'The east gate needs a ribbon for lantern night. Mara unrolls a sample: rose-red with an undyed stripe. “The chalk line needs to stay white.”',
    steps:[
      ['Mix the madder bath','The jars are marked madder (rose), woad (blue) and weld (yellow). Which root matches the gate ribbon?',['Weld','Madder','Woad'],1,'Mara holds up the rose sample again.'],
      ['Tie and dip the silk','How will you keep dye off the chalk line?',['Untie the skein before dipping','Dip the entire loose ribbon','Bind the stripe, dip, then rinse'],2,'Wrap the stripe tightly before the cloth goes into the bath.']
    ],done:'Mara hangs the striped ribbon above the gate and pins a rosette from the last length of silk to your satchel.'
  },
  cooperward:{
    name:'The Great Barrel Hall',x:0,z:-5,yaw:0,wall:'#cda479',rug:'#8f644f',floorStyle:'boards',
    title:'The ferryman’s leaky cask',reward:['cooperCup','Silver-Hooped Cooper’s Cup','hammer'],
    apparatus:['stave horse','hooping stand'],feature:'cask',
    order:'A ferryman needs a watertight cask before the tide turns. Orris shows you the old one: a split stave lets water run around the hoop.',
    steps:[
      ['Shape a new stave','Orris lays a curved template on the horse. Which blank will bend to the belly without splitting?',['Straight-grained oak','A cross-grained offcut','A stave with a deep knot'],0,'Look for long, unbroken grain from end to end.'],
      ['Seat the iron hoop','The new stave sits flush. How will you draw the staves together evenly?',['Hammer one side all the way down','Tap opposite sides in turn','Drive out the wooden head'],1,'Move across the circle after each tap so the hoop stays level.']
    ],done:'Orris rolls the cask on dry shavings. They stay dry. The ferryman waves from the quay and Orris hands you a little silver-hooped cup.'
  },
  starward:{
    name:'Meridian Orrery',x:0,z:-5,yaw:0,wall:'#d1cce0',rug:'#665b8b',floorStyle:'stone',
    title:'The missing evening star',reward:['meridianDial','Pocket Meridian Dial','compass'],
    apparatus:['sighting scope','planet rings'],feature:'orbit',
    order:'Tonight’s star sheet shows an empty space. Tavi hands you the last observation: “The fixed star is north; the evening star was low in the west.”',
    steps:[
      ['Sight the fixed star','The fixed star holds still while the sky wheels around it. Which mark on the scope should face it?',['East horizon','West horizon','North meridian'],2,'Use the north mark to set the axis first.'],
      ['Set the evening ring','The fixed axis is set. Where did the observer last see the missing light?',['Low in the west','Directly overhead','High in the east'],0,'Read the last observation: low, just after sunset.']
    ],done:'The brass rings carry a bright bead into the empty space on the chart. Tavi gives you a pocket dial set to the same meridian.'
  }
};

export const wardWorkshops=Object.fromEntries(Object.entries(designs).map(([realm,d])=>{
  const [first,second]=d.apparatus;
  const stations=[
    {id:'order',x:0,z:1.52,label:'Read the work order'},
    {id:'first',x:-1.30,z:-.58,label:d.steps[0][0]},
    {id:'second',x:1.30,z:-.58,label:d.steps[1][0]}
  ].map(s=>({...s,kind:'activity',hint:d.title}));
  const steps=[
    {station:'order',instruction:d.order,choices:['Take the commission'],answer:'Take the commission'},
    ...d.steps.map(([label,instruction,choices,correct,retry],i)=>({station:stations[i+1].id,instruction,choices,answer:choices[correct],retry})),
    {station:'order',instruction:'The work is ready. Sign the order to deliver it to '+wards[realm].keeper+'.',choices:['Deliver the commission'],answer:'Deliver the commission'}
  ];
  return [realm,{id:realm+'-workshop',kind:'workshop',realm,place:wards[realm].place,town:wards[realm].name,
    name:d.name,x:d.x,z:d.z,yaw:d.yaw,width:5.8,depth:5.4,layer:1,wall:d.wall,rug:d.rug,roof:wards[realm].colors[2],floorStyle:d.floorStyle,
    reward:d.reward,work:d.feature,sign:d.feature,
    fixtures:[['tool-one',-1.65,-1.55,1.40,1.02],['tool-two',1.65,-1.55,1.4,1.02],['order-board',-1.04,1.57,.63,.45]],
    people:[],stations,activity:{title:d.title,done:d.done,steps,
      directions:['Read the work order inside '+d.name+'.','Use the '+first+'.','Use the '+second+'.','Sign the finished order by the door.']}}];
}));
