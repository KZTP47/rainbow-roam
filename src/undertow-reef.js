// Each symbol is a swimmable tile. The two side tunnels meet at the broken keel.
const reefChart=[
  '###############',
  '##.L.#####.D.##',
  '##...#####...##',
  '###.#######.###',
  '##.J..###..R.##',
  '##....###....##',
  '###.###K###.###',
  '###.........###',
  '#######.#######',
  '######.B.######',
  '######...######',
  '#######E#######',
  '###############'
];

export function undertowReef(surface,tileSize){
  const width=reefChart[0].length,tiles=[],marks={};
  const chambers=['The Bubble Chimney','Pearl Nursery','Copper Gardens','The Broken Keel'];
  for(const [z,row] of reefChart.entries())for(const [x,symbol] of [...row].entries()){
    const index=z*width+x;
    if(symbol==='#'){tiles.push(null);continue;}
    const zone=z>=8?0:x<7?1:x>7?2:3;
    const cell={x,z,index,wx:x*tileSize,wz:z*tileSize,zone};
    tiles.push(cell);
    if(symbol!=='.')marks[symbol]=cell;
  }
  return {id:surface.id,name:'The Keelward Reef',underwater:true,width,height:reefChart.length,tiles,
    entry:marks.E,exit:marks.E,chambers,habitat:surface.habitat,enemies:[],
    fog:'#124956',ambient:'#a7f9e8',torch:'#a4e8ff',accent:'#87f2de',secondary:'#ffe0a2',
    stone:['#35636d','#427b82','#4a7882','#395961','#608986'],floor:['#a19685','#a1a38f','#afae91'],
    friends:[{id:'lanternbell',cell:marks.J},{id:'pennyglide',cell:marks.R}],
    chests:[
      {id:'provisions',name:'Drift Bottle',cell:marks.B,rewards:{petal:2,berry:2}},
      {id:'pearl-safe',name:'Pearl Diver’s Strongbox',cell:marks.L,rewards:{nautilusLocket:1,coins:12}},
      {id:'dial-case',name:'Navigator’s Case',cell:marks.D,rewards:{moonDial:1,crystal:3}}
    ]
  };
}
