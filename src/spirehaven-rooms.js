const quarter=Math.PI/2;

// Positive local Z points out through the door.
export const spirehavenRooms={
  griffin:{
    name:'The Gilded Griffin',x:19.48,z:27.52,yaw:-quarter,width:8.35,depth:4.45,
    roof:'#765a81',wall:'#efd0a8',stories:3,sign:'griffin',
    goods:[['honeyStew',8],['berryCompote',5],['picnicBun',5]],
    fixtures:[['counter',1.87,-1.22,2.38,.63],['table',-2.72,-.62,1.16,.82],['table',2.85,.92,1.22,.75],
      ['hearth',-3.36,-1.91,1.16,.49],['shelf',.06,-1.93,1.42,.38]],
    people:[[-2.78,-1.38,'#aa785f','#8b7c9f'],[1.8,-1.75,'#e3ac81','#ad777f'],[3.16,1.68,'#c28e77','#608e88']],
    stations:[
      {id:'supper',kind:'market',x:1.72,z:-.50,label:'Order at the bar',hint:'Stew, compote and buns'},
      {id:'rest',kind:'rest',x:-2.49,z:-.04,label:'Rest by the hearth',hint:'Choose when to get up'}
    ]
  },
  bakery:{
    name:'The Honeycrust Bakery',x:3,z:24.6,yaw:quarter,width:4.35,depth:4.15,
    roof:'#598e92',wall:'#f7d6a5',stories:2,sign:'bread',
    goods:[['picnicBun',5],['treat',3],['berryCompote',5]],
    fixtures:[['counter',.40,-.76,2.05,.70],['oven',-1.40,-1.23,.83,1.17],['shelf',.40,-1.76,2.19,.40]],
    people:[[.43,-1.41,'#b9795f','#c6856c']],
    stations:[{id:'buy',kind:'market',x:.4,z:-.10,label:'Shop at the bakery',hint:'Fresh buns and meadow biscuits'}]
  },
  apothecary:{
    name:'The Copper Kettle',x:1.25,z:5.15,yaw:0,width:4.65,depth:4.17,
    roof:'#826f9b',wall:'#eec79f',stories:3,sign:'bottle',
    goods:[['glowtea',7],['hpPotion',6],['petal',3],['crystal',8]],
    fixtures:[['counter',-.44,-.75,2.17,.70],['shelf',-.55,-1.73,2.41,.40],['kettle',1.49,-1.2,.78,.78]],
    people:[[-.48,-1.4,'#dba482','#778996']],
    stations:[{id:'buy',kind:'market',x:-.44,z:-.11,label:'Shop at the apothecary',hint:'Glowing tea, petals and starglass'}]
  },
  bookshop:{
    name:'The Dog-Eared Dragon',x:5.96,z:4.55,yaw:0,width:4.28,depth:4.10,
    roof:'#668b88',wall:'#e3bbab',stories:2,sign:'book',
    goods:[['trailMapScrap',9],['lantern',9],['crystal',8]],
    fixtures:[['counter',.89,-.89,1.53,.68],['shelf',0,-1.72,3.53,.38],['lectern',-1.16,.22,.57,.51]],
    people:[[.94,-1.44,'#a97763','#92799d']],
    stations:[
      {id:'buy',kind:'market',x:.86,z:-.22,label:'Shop at the bookshop',hint:'Trail maps and reading lanterns'},
      {id:'read',kind:'read',x:-1.13,z:.68,label:'Read The Wayfarer’s Almanac',hint:'Notes for travelers in Silverrun'}
    ]
  },
  starMap:{
    name:'Hall of the Star-Map',x:20.6,z:-10.6,yaw:0,width:4.52,depth:4.64,
    wall:'#d5c5d8',sign:'star',
    fixtures:[['lectern',-.57,1.13,.54,.46],['armillary',0,-1.26,1.20,.93],
      ['dial',-1.49,-.33,.54,.54],['dial',-.93,-1.43,.49,.49],['dial',1.49,-.33,.54,.54]],
    people:[],
    stations:[
      {id:'read',kind:'read',x:-.55,z:1.56,label:'Read the star chart',hint:'Instructions for the three dials'},
      {id:'west',kind:'dial',x:-1.05,z:-.22,label:'Turn the west dial'},
      {id:'north',kind:'dial',x:-.79,z:-.96,label:'Turn the north dial'},
      {id:'east',kind:'dial',x:1.05,z:-.22,label:'Turn the east dial'}
    ]
  }
};

export const rooms=Object.entries(spirehavenRooms).map(([id,room],index)=>Object.assign(room,{id,layer:index+1}));
export const dialFaces=['Sun','Moon','Star'];
export const starDials=['west','north','east'];
const alignment=[2,0,1];

export function turnStarDial(progress,id){
  if(progress.aligned||!starDials.includes(id)) return false;
  progress.dials[id]=((progress.dials[id]??0)+1)%dialFaces.length;
  progress.aligned=starDials.every((dial,i)=>(progress.dials[dial]??0)===alignment[i]);
  return progress.aligned;
}

export function roomPoint(room,x,z){
  const c=Math.cos(room.yaw),s=Math.sin(room.yaw);
  return [room.x+c*x+s*z,room.z-s*x+c*z];
}

export function inRoom(room,x,z){
  const dx=x-room.x,dz=z-room.z,c=Math.cos(room.yaw),s=Math.sin(room.yaw);
  return Math.abs(c*dx-s*dz)<room.width/2-.03&&Math.abs(s*dx+c*dz)<room.depth/2-.03;
}

export function spirehavenRoomAt(x,z){
  return rooms.find(room=>inRoom(room,x,z));
}

export const roomDoorWidth=1.48;
export const roomWall=.26;
export const roomFloorOffset=.06;

export function roomWalls(room){
  const w=room.width,d=room.depth;
  const jamb=(w-(room.doorWidth??roomDoorWidth))/2;
  return [
    [-w/2,0,roomWall,d+.09],[w/2,0,roomWall,d+.09],[0,-d/2,w,roomWall],
    [-w/2+jamb/2,d/2,jamb,roomWall],[w/2-jamb/2,d/2,jamb,roomWall]
  ];
}

export function roomBlockers(room,includeWalls=true){
  const c=Math.abs(Math.cos(room.yaw)),s=Math.abs(Math.sin(room.yaw));
  const furniture=room.fixtures.map(([,x,z,w,d])=>[x,z,w,d]);
  return [...(includeWalls?roomWalls(room):[]),...furniture].map(([x,z,w,d])=>[
    ...roomPoint(room,x,z), (c*w+s*d)/2+.08,(s*w+c*d)/2+.08
  ]);
}
