import {riverCenter,riverLevel,riverWidth,roadDistance} from './silverrun.js';

export const silvercoast={
  name:'Silverrun Coast',entry:'saltwick',tagline:'Fishing terraces, a lighthouse, and the old corsair harbour',
  height:2,colors:['#b5b888','#ecd3a4','#829c9e','#dfad9f']
};

export const silvercoastPlaces={
  saltwick:{name:'Saltwick',note:'Fishing harbour at the mouth of the Silverrun',x:-27,z:12,color:'#8fc6bb',
    travel:[-26,14],yaw:Math.PI,gate:[-21,7],marker:[-47,19],discoverWithin:18},
  corsairCove:{name:'Corsair Cove',note:'A boatyard and galleon below the cliffs',x:28,z:13,color:'#d3a4b7',
    travel:[30,8],yaw:Math.PI,gate:[35,8],marker:[30,36],discoverWithin:17}
};

export const coastPaths=[
  [[11,-59],[11,-35],[11,-9],[6,-7],[-26,-7],[-26,8],[-26,17],[-26,29]],
  [[11,-9],[23,-3],[30,4],[30,19],[30,38]],
  [[-26,17],[-31,20],[-39,19],[-43,17],[-48,17],[-47,19]]
];
export const coastRoadDistance=(x,z)=>roadDistance(coastPaths,x,z);
export const saltBridge=-7;
export const seaHeight=.43;
export const coastRiverX=z=>riverCenter(59)-5*Math.max(0,(z+1)/37)**1.7+4*Math.sin((z+59)*.055);
export const coastRiverY=z=>riverLevel+(seaHeight-riverLevel)*Math.min(1,Math.max(0,(z-5)/25));
export const shoreZ=x=>32-10*Math.exp(-((x-30)**2)/210)-5*Math.exp(-((x+27)**2)/210)+3*Math.sin(x*.09);
export const piers=[{x:-26,from:21,to:33,width:3,y:1.85},{x:-33,from:22,to:32,width:2.4,y:1.62},
  {x:30,from:18,to:41,width:3.4,y:1.82}];
export const pierAt=(x,z)=>piers.find(p=>Math.abs(x-p.x)<p.width*.5&&z>=p.from&&z<=p.to);
export const coastBridge=(x,z)=>Math.abs(z-saltBridge)<1.65&&Math.abs(x-coastRiverX(z))<4.1;
export const inCoastRiver=(x,z)=>Math.abs(x-coastRiverX(z))<riverWidth&&!coastBridge(x,z)&&!pierAt(x,z);
export const coastRegionAt=(x,z)=>x<0?'saltwick':'corsairCove';

export const coastLandmarks={
  saltwick:[['Saltwick Bridge',coastRiverX(saltBridge),saltBridge,'bridge'],['Saltwick Quay',-26,25,'hall'],['Saltwick Light',-48,23,'hall']],
  corsairCove:[['The Boatyard',24,16,'hall'],['The Long Jetty',30,32,'bridge'],['The Black Marigold',34.8,44,'water'],['Needle’s Eye',46,34,'mountain']]
};

export const coastResidents=[
  {id:'marn-saltwick',region:'saltwick',name:'Marn',role:'Harbour keeper',x:-23,z:16,quest:'A light for the fishers',
    intro:'I promised to check the lighthouse bell before the first boats come in. Take the cliff path west and find the brass marker for me.',
    done:'The wind still rings it twice. Good. The little fishing boats know that sound by heart.',colors:['#bc846f','#6ba4a3','#604554']},
  {id:'olive-corsair',region:'corsairCove',name:'Olive',role:'Sailmaker',x:33.5,z:13,quest:'The Marigold’s mooring',
    intro:'The Black Marigold is waiting for a fresh sail. Check the brass marker on the long jetty. Then take the gangplank at the far end if you’d like to see her cargo hold.',
    done:'The line’s holding? Then I’ll bring out the plum canvas in the morning. She deserves a good sail.',colors:['#ad795e','#bd849a','#524450']}
].map(npc=>({...npc,realm:'silvercoast',after:npc.done,portrait:{style:5,morph:1,accessory:3},
  goal:{stamp:npc.region},find:'Survey the brass marker in '+silvercoastPlaces[npc.region].name,reward:{treat:2,berry:3}}));

export const coastResources=[
  ['wood',-35,10],['stone',-42,13],['berry',-44,21],['salt',-23,19],['salt',-35,21],['petal',-24,3],
  ['wood',23,23],['stone',42,19],['berry',36,4],['salt',34,18],['petal',18,9]
];
