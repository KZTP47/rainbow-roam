import {icon} from './icons.js';
import {crops,furnishings,rooms,plots,farmItems,extensions,roomDecor,canExpand,roomReady} from './homestead.js';

export const propertySize={width:870,height:538};
const {width:W,height:H}=propertySize;
const artCache=new Map();
const houseSpots=[[1.08,4.08],[4.74,1.02],[1.08,1.08],[5.49,4.15]];
const gardenSpots=plots.map((_,i)=>[2.2+i%2*2.72,1.03+Math.floor(i/2)*1.96]);
const mapConfig={
  house:{origin:[391,138],spots:houseSpots,title:'Cottage',hint:'Choose a floor spot to place or put away furniture.'},
  garden:{origin:[398,125],spots:gardenSpots,title:'Garden',hint:'Choose a bed to plant, water, or harvest.'},
  sunroom:{origin:[397,142],spots:[[1.04,3.45],[4.65,1.03]],title:extensions.sunroom.name,hint:'Propagate clover at the potting bench.'},
  workshop:{origin:[397,142],spots:[[2.08,1.18],[4.74,3.77]],title:extensions.workshop.name,hint:'Use the workbench to sew a rug.'},
  loft:{origin:[397,142],spots:[[4.71,1.15],[.89,3.89]],title:extensions.loft.name,hint:'Rest upstairs to give crops time to grow.'}
};

export const propertySpots=view=>mapConfig[view].spots;
export const propertyViewTitle=view=>mapConfig[view].title;
export const propertySlotLabels=view=>view==='house'?rooms:extensions[view]?.spots;

export function projectProperty(view,x,y,z=0){
  const [ox,oy]=mapConfig[view].origin;
  return [ox+(x-y)*46,oy+(x+y)*24-z];
}

function painter(ctx,view){
  const point=(x,y,z)=>projectProperty(view,x,y,z);
  function polygon(points,fill,stroke,line=1){
    ctx.beginPath();
    for(const [i,[x,y,z]] of points.entries()){
      const [px,py]=point(x,y,z);
      if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);
    }
    ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke();}
  }
  function line(a,b,color,width){
    ctx.beginPath();ctx.moveTo(...point(...a));ctx.lineTo(...point(...b));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  function oval(x,y,z,rx,ry,color,turn=0){
    const [px,py]=point(x,y,z);
    ctx.beginPath();ctx.ellipse(px,py,rx,ry,turn,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
  }
  function box(x,y,w,d,bottom,height,colors){
    const z=bottom+height, r=x+w,t=y+d;
    polygon([[x,t,bottom],[r,t,bottom],[r,t,z],[x,t,z]],colors[1]);
    polygon([[r,y,bottom],[r,t,bottom],[r,t,z],[r,y,z]],colors[2]);
    polygon([[x,y,z],[r,y,z],[r,t,z],[x,t,z]],colors[0]);
  }
  return {point,polygon,line,oval,box};
}

function tree(p,x,y,z,size){
  p.oval(x,y,z,27*size,13*size,'#365e4925');
  p.box(x-.052,y-.052,.104,.104,z,34*size,['#bf977a','#8d6c53','#745044']);
  p.oval(x,y,z+47*size,26*size,24*size,'#678e69',-.31);
  p.oval(x-.22,y,z+62*size,22*size,24*size,'#91b982',-.45);
  p.oval(x+.14,y-.18,z+75*size,18*size,21*size,'#b3ca8c',.32);
  p.oval(x-.2,y+.13,z+62*size,7*size,3*size,'#efd78b',-.4);
}

function pot(p,x,y,z,tint){
  p.box(x-.10,y-.10,.20,.20,z,11,['#edbd91','#bc846a','#a76b60']);
  for(const [j,[dx,dy,h]] of [[-.10,-.045,21],[0,0,26],[.12,-.045,18]].entries()){
    p.line([x,y,z+10],[x+dx,y+dy,z+h],'#678b66',2.1);
    p.oval(x+dx,y+dy,z+h,4,2.5,j===1?tint:'#9eb877',j%2?.4:-.45);
  }
}

function stoneTrail(p,start,n){
  for(let i=0;i<n;i++){
    const x=start[0]+(i%2)*.20,y=start[1]+i*.45;
    p.box(x,y,.23+(i%3)*.10,.32,0,3,['#f9e5b9','#d6c399','#d6b88e']);
  }
}

function roomFloor(p){
  p.oval(4.4,3.4,-34,331,117,'#62465312',-.04);
  p.box(0,0,7.65,6.15,-24,24,['#e8bb8a','#a97758','#8c6357']);
  const boards=['#edcca3','#e8bf92','#efca9a','#e1b589','#f2d3a8'];
  for(let row=0;row<12;row++){
    for(let col=0;col<4;col++){
      const offset=row%2===0?0:.28;
      const x=col*1.875+offset;
      const w=Math.min(1.852,7.57-x);
      p.box(x,row*.50+.02,w,.483,0,.52,[boards[(row*7+col*3)%5],'#ce9f77','#d9ad88']);
      if((row+col)%3===0){
        p.line([x+.12,row*.50+.24,1],[x+Math.min(w-.1,.86),row*.50+.24,1],'#b77c5021',1.2);
      }
    }
  }
  p.box(0,0,7.64,.17,0,96,['#f7dcbc','#d8a98f','#bd8b76']);
  p.box(0,0,.17,6.14,0,70,['#f8dcbc','#bc917e','#c79d87']);
  p.box(0,.17,7.64,.06,1,7,['#f1c496','#a97866','#af7860']);
  p.box(.17,0,.06,6.14,1,7,['#f1c496','#a97866','#af7860']);
  p.box(0,.10,7.65,.105,85,8,['#e5bc98','#a06e60','#956857']);
  p.box(.10,0,.105,6.15,59,8,['#e5bc98','#a06e60','#956857']);
  for(const x of [1.80,2.08,5.7,5.98])p.box(x,.17,.10,.055,8,72,['#e3b697','#c09984','#ab7e68']);
  const window=(x,w)=>{
    p.box(x,.175,w,.19,24,54,['#f3d4a6','#af795d','#956858']);
    p.box(x+.07,.36,w-.14,.045,28,45,['#e4ecbe','#9ec6b3','#95ac9d']);
    for(const d of [.12,w/2,w-.13])p.box(x+d,.412,.045,.045,28,45,['#fdf2c5','#f1d9af','#efc7a3']);
    p.box(x+.07,.415,w-.14,.035,50,2,['#fdf2c8','#f1d9af','#efc7a3']);
    p.box(x-.04,.32,w+.1,.25,22,3,['#f3d4a6','#bb896e','#9f7563']);
    pot(p,x+w-.13,.52,25,'#e3a397');
  };
  window(2.35,1.55);window(.43,1.09);
  p.box(5.12,.19,1.10,.55,0,66,['#d3a588','#c59a85','#b07e69']);
  p.box(5.06,.25,1.25,.57,66,6,['#e6bc98','#b98569','#9f7563']);
  p.box(5.35,.70,.64,.08,3,30,['#6f514e','#6b4b48','#7c5a52']);
  p.box(5.15,.68,1.06,.32,35,7,['#d19a77','#a77a65','#a37162']);
  p.box(5.15,.69,1.06,.34,0,5,['#dbaf8e','#a37765','#a97564']);
  p.oval(5.6,.99,18,9,9,'#f1b369',-.26);
  p.oval(5.67,1.01,16,6,7,'#ffdc95',.3);
  p.box(.20,3.48,.28,1.67,6,6,['#e3b38c','#9e735c','#a37160']);
  p.box(.20,3.78,.24,1.28,16,35,['#eac696','#b88f77','#8a8881']);
  for(let i=0;i<5;i++)p.box(.455,3.82+i*.23,.04,.18,20,27,['#d7dbc1','#d6c096','#a7bf9b']);
  p.box(3.15,6.14,1.29,.59,-11,11,['#dcb48b','#b08468','#926a62']);
  p.box(3.46,5.65,.70,.47,1,3,['#e5bf8c','#9e7964','#bc8e6b']);
}

function furniture(p,id,x,y){
  p.oval(x+.55,y+.55,0,37,14,'#75493726');
  if(id==='patchRug'){
    p.box(x-.04,y-.04,1.38,1.22,0,4,['#e4a9ac','#976a78','#a47986']);
    for(let row=0;row<3;row++)
      for(let col=0;col<4;col++)p.box(x+col*.33,y+row*.375,.31,.35,4,1,
        [['#fbd1bc','#df9cab','#f4cf8e','#c88eaa'][(row*2+col)%4],'#a47986','#a47986']);
    return;
  }
  if(id==='cloudBed'){
    p.box(x+.04,y+.02,1.20,1.20,0,15,['#a16865','#98675a','#795753']);
    p.box(x+.08,y+.02,1.12,1.15,15,8,['#f3ead5','#d6dac6','#bfd0c5']);
    p.box(x+.073,y+.47,1.15,.71,23,5,['#b9c8ed','#9ba7c9','#819bb3']);
    for(const d of [.57,.77,1.0])p.line([x+.10,y+d,29],[x+1.19,y+d,29],'#d0d7ea',3.2);
    p.box(x+.20,y+.1,.85,.29,23,7,['#fff1d7','#e2d0b7','#dcc6af']);
    p.box(x,y-.037,1.28,.14,0,51,['#d2a380','#bc8d76','#986663']);
    return;
  }
  if(id==='herbShelf'){
    for(const l of [.10,1.08])p.box(x+l,y+.27,.11,.61,0,55,['#ddb090','#ad826c','#8b6a5e']);
    for(const z of [3,25,49]){
      p.box(x+.10,y+.18,1.11,.72,z,5,['#d7aa87','#ac7c68','#967062']);
      for(const [j,q] of [.23,.55,.89].entries())pot(p,x+q,y+.31,z+5,['#e5ada7','#b5bd88','#eed48a'][j]);
    }
    return;
  }
  p.oval(x+.62,y+.62,3,19,9,'#c7958e');
  p.oval(x+.62,y+.62,5,16,8,'#eac7a4');
  p.box(x+.59,y+.57,.075,.077,5,48,['#dbb08a','#a97d64','#8a6272']);
  p.oval(x+.625,y+.59,60,31,24,'#efd49538');
  p.oval(x+.625,y+.59,59,19,15,'#b593bb');
  p.oval(x+.625,y+.59,59,14,14,'#d7b3d1',-.26);
  p.oval(x+.625,y+.59,55,9,10,'#ffe8ba',.11);
}

function drawFurnishingSpots(p,spots,decor,selected){
  for(const [i,[x,y]] of spots.entries()){
    const on=i===selected;
    p.polygon([[x-.10,y-.09,1],[x+1.41,y-.09,1],[x+1.41,y+1.29,1],[x-.10,y+1.29,1]],
      on?'#f8ecc9':'#f8e5bd7d',on?'#6b977d':'#bd9276',on?3:1.2);
    if(decor[i]) furniture(p,decor[i],x,y);
    else{
      p.oval(x+.63,y+.58,1,16,8,on?'#add0aa':'#d9b480');
      p.line([x+.51,y+.57,2],[x+.77,y+.57,2],on?'#547a61':'#ab7d61',1.6);
      p.line([x+.64,y+.43,2],[x+.64,y+.70,2],on?'#547a61':'#ab7d61',1.6);
    }
  }
}

function drawHouse(p,decor,selected){
  roomFloor(p);
  drawFurnishingSpots(p,houseSpots,decor,selected);
  pot(p,7.39,1.65,0,'#efbba4');pot(p,1.15,5.69,0,'#d492a8');
  stoneTrail(p,[3.57,6.87],3);
}


const annexFixtures={
  sunroom:{walls:['#dce8bd','#a9b995','#8ba88b'],floor:['#ead5a4','#bdac80','#99876e'],
    tiles:['#f2e2b7','#e2d4a7','#d8d2a3','#ece3bd']},
  workshop:{walls:['#e9c5a7','#c7987b','#ad7e6f'],floor:['#e7c0a0','#bf9177','#94705e'],
    tiles:['#ecd0a7','#ddb88e','#e2bf97','#edc8a5']},
  loft:{walls:['#e5d2e3','#b5a4bb','#9a8ba1'],floor:['#e1ccda','#b29ca7','#907a88'],
    tiles:['#e4d2d9','#e5cfc7','#d7c0c6','#eddeca']}
};

function drawAnnex(p,view,decor,selected){
  const {walls,floor,tiles}=annexFixtures[view];
  p.oval(3.7,3.4,-27,300,105,'#62465319');
  p.box(0,0,6.55,5.83,-22,22,floor);
  for(let row=0;row<11;row++){
    for(let col=0;col<5;col++){
      const x=col*1.30,y=row*.52;
      p.box(x+.018,y+.027,1.26,.48,0,.5,[tiles[(row*3+col)%4],floor[1],floor[2]]);
    }
  }
  p.box(0,0,6.56,.18,0,84,walls);
  p.box(0,0,.18,5.83,0,69,walls);
  p.box(0,.03,6.56,.18,80,7,[walls[0],floor[2],floor[1]]);
  p.box(.04,0,.18,5.83,65,7,[walls[0],floor[2],floor[1]]);
  for(const x of view==='sunroom'?[.55,2.53,4.52]:[.69,4.45]){
    const width=view==='sunroom'?1.52:1.28;
    p.box(x,.19,width,.18,22,51,['#f0dfb6','#a48d75','#9c8671']);
    p.box(x+.09,.38,width-.18,.041,27,40,['#deefd6',view==='loft'?'#b8b2cb':'#a3cbb2','#88a89d']);
    p.box(x+width*.5,.43,.05,.042,27,40,['#fbf3cf','#e2c9a3','#d3b295']);
    p.box(x+.11,.43,width-.22,.042,45,2,['#f8eecb','#e2c9a3','#d3b295']);
  }
  p.box(2.83,5.81,1.00,.42,-11,11,[tiles[0],floor[1],floor[2]]);
  if(view==='sunroom'){
    p.box(.30,.58,1.55,.58,6,30,['#d9c99d','#a9946e','#968863']);
    p.box(.28,.54,1.58,.66,35,5,['#f0d6a8','#b59872','#9d856d']);
    for(const [i,x] of [.50,.86,1.26,1.60].entries()) pot(p,x,.88,40,['#ba897e','#b6ab73','#d6ae85'][i%3]);
    for(const [i,y] of [1.38,2.17,2.96].entries()) pot(p,.43,y,0,['#c78085','#d7bc7e','#b7ba7f'][i%3]);
    p.box(5.76,4.53,.48,.68,0,12,['#a0c1a3','#6a9a85','#588b7c']);
    pot(p,6.08,4.83,12,'#edd68a');
  }else if(view==='workshop'){
    p.box(.37,.67,1.42,.70,5,32,['#d9b687','#947761','#816755']);
    p.box(.28,.61,1.62,.83,34,5,['#edc797','#b38266','#a7755e']);
    for(const [i,x] of [.41,.79,1.23].entries()){
      p.box(x,.86,.37,.30,39,4,['#c2a1b5','#a17483','#956d7c']);
      p.line([x+.14,1.0,43],[x+.25,1.0,43],i%2?'#f9ddd3':'#eed2ad',2);
    }
    p.box(.25,2.28,.26,1.74,13,38,['#d3ae83','#8f745f','#825b50']);
    for(let i=0;i<4;i++){
      const y=2.44+i*.39;
      p.box(.52,y,.07,.12,26,20,['#ad9baa','#866f71','#7b6068']);
      p.box(.54,y-.07,.07,.26,43,7,['#dfc9a9','#aa8b74','#9c816d']);
    }
  }else {
    p.box(1.92,.28,1.74,.61,3,58,['#e8c4b4','#ac8c83','#947679']);
    for(const z of [4,25,46]){
      p.box(1.92,.27,1.75,.64,z,4,['#f0ceb8','#b89384','#8c706d']);
      for(let i=0;i<6;i++)
        p.box(2.02+i*.24,.61,.18,.21,z+4,13+i%2*5,[['#dca396','#a2b5ba','#dec696'][i%3],'#a58b83','#8e8077']);
    }
    p.oval(5.56,4.82,1,37,19,'#c9b4d3');
    p.oval(5.56,4.82,2,30,15,'#d8c6e3');
    p.oval(5.56,4.82,3,19,9,'#e3d2e9');
  }
  drawFurnishingSpots(p,mapConfig[view].spots,decor,selected);
}
function fence(p,axis,fixed,start,end,z){
  for(let i=start;i<=end;i+=.62){
    const [x,y]=axis==='x'?[i,fixed]:[fixed,i];
    p.box(x,y,.074,.074,z,24,['#e8c28c','#ab865f','#987258']);
    p.box(x-.025,y-.025,.125,.125,z+21,4,['#f4d1a0','#c7a07b','#ad8568']);
  }
  for(const h of [7,15]){
    const [x,y]=axis==='x'?[start,fixed]:[fixed,start];
    p.box(x,y,axis==='x'?end-start:.093,axis==='x'?.093:end-start,z+h,3,['#d3aa7b','#ad876a','#a37e62']);
  }
}

function leafCluster(p,seed,status,x,y,z){
  const ready=status==='ready';
  const color=seed==='carrotSeed'?'#eb9e68':seed==='strawberrySeed'?'#e18ca2':'#e4ecaa';
  for(let i=0;i<6;i++){
    const xx=x+.21+(i%3)*.31,yy=y+.18+Math.floor(i/3)*.45;
    const height=ready?17+i%3*2:9+i%2*3;
    p.line([xx,yy,z],[xx,yy,z+height],'#658c60',2);
    p.oval(xx-.08,yy,z+height*.72,5,2.5,'#8fb36b',.40);
    p.oval(xx+.08,yy,z+height*.79,5.5,2.6,'#b6cc7c',-.44);
    if(ready){
      p.oval(xx,yy,z+height,4.8,4.0,color,seed==='carrotSeed'?.9:0);
      p.oval(xx-.02,yy-.02,z+height+1.2,2.0,1.2,'#fff2cf',-.19);
    }
  }
}

function drawGarden(p,records,selected){
  p.oval(4.4,3.8,-36,336,112,'#41654e1f',-.05);
  p.box(.35,.3,7.80,6.69,-24,24,['#b0c28a','#879969','#697c5b']);
  for(let i=0;i<120;i++){
    const x=.58+(i*53%735)*.01,y=.45+(i*79%626)*.01;
    p.oval(x,y,1,i%3+1.7,i%3===1?1.72:1.2,['#b8cc92','#d9d9a4','#91b078','#88ae77'][i%4],-.21);
  }
  p.box(.49,.69,1.18,5.64,1,1,['#cfc69b','#a6a475','#97a172']);
  p.box(3.66,.53,1.13,5.83,1,1,['#cfc69b','#a6a475','#97a172']);
  p.box(1.47,6.26,5.25,.43,1,1,['#cfc69b','#a6a475','#97a172']);
  for(let i=0;i<12;i++){
    const x=4.06+(i%2)*.125,y=.68+i*.46;
    p.box(x,y,.22,.26,2,1,['#e7ddaf','#c1b88e','#b5a47e']);
  }
  fence(p,'x',.43,.66,7.93,1);
  fence(p,'y',.47,.46,5.70,1);
  tree(p,7.36,.92,1,1.17);
  tree(p,.82,3.04,1,.76);
  stoneTrail(p,[3.88,6.95],3);
  p.box(6.91,4.92,.89,.84,0,19,['#ddb084','#a47a5f','#987355']);
  p.box(6.91,4.92,.89,.84,19,4,['#f0cba2','#a47a5f','#967258']);
  pot(p,7.5,5.28,23,'#efc58f');
  for(const [i,[x,y]] of gardenSpots.entries()){
    const active=i===selected;
    const rec=records[i];
    p.box(x-.19,y-.15,1.62,1.47,1,2,active?['#deedac','#9cb47b','#9caa77']:['#9bad78','#8d9c72','#8d9c72']);
    p.box(x,y,1.25,1.08,3,11,['#d5aa82','#a1725a','#916c57']);
    p.box(x+.075,y+.075,1.10,.92,14,2,[rec.watered?'#805f57':'#b48a65','#856454','#856454']);
    for(let m=0;m<3;m++){
      const xx=x+.20+m*.30;
      p.line([xx,y+.12,17],[xx,y+.94,17],rec.watered?'#997871':'#d7a77c',4);
    }
    if(rec.seed)leafCluster(p,rec.seed,rec.status,x,y,17);
    if(active)p.polygon([[x-.18,y-.15,4],[x+1.43,y-.15,4],[x+1.43,y+1.32,4],[x-.18,y+1.32,4]],null,'#629571',2.5);
  }
  for(let i=0;i<4;i++)pot(p,6.82+i*.28,6.24,1,i%2?'#e4a0ab':'#f1ce87');
}

function mapArt(view,records,selected){
  const key=JSON.stringify([view,records,selected]);
  if(artCache.has(key)) return artCache.get(key);
  const c=document.createElement('canvas');
  c.width=W*1.5;c.height=H*1.5;
  const ctx=c.getContext('2d');
  ctx.scale(1.5,1.5);
  const bg=ctx.createLinearGradient(0,0,W*.85,H);
  bg.addColorStop(0,view==='garden'?'#f3f4d9':'#fff3d8');
  bg.addColorStop(1,view==='garden'?'#cae4d0':'#e7dec4');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  for(let i=0;i<350;i++){
    const x=(i*523)%W,y=(i*113)%H;
    ctx.fillStyle=i%3?'#fff9e38a':'#627d6a1f';
    ctx.fillRect(x,y,1.4+i%2,1.5);
  }
  const p=painter(ctx,view);
  if(view==='garden') drawGarden(p,records,selected);
  else if(view==='house') drawHouse(p,records,selected);
  else drawAnnex(p,view,records,selected);
  const result=c.toDataURL('image/webp',.91);
  if(artCache.size>=12) artCache.delete(artCache.keys().next().value);
  artCache.set(key,result);
  return result;
}

function plotRecord(plot,now){
  return {seed:plot?.seed??null,watered:plot?.watered===true,
    status:!plot?'empty':plot.readyAt<=now?'ready':plot.watered?'watered':'growing'};
}

export function propertyBackground(state,view){
  const records=view==='garden'?state.homestead.plots.map(plot=>plotRecord(plot,Date.now())):roomDecor(state.homestead,view);
  return mapArt(view,records,-1);
}

const conditions={empty:'Empty',ready:'Ready',growing:'Growing',watered:'Watered'};
const spotLabels=['Window','Hearth','Eaves','Reading nook'];
const title=(id)=>farmItems[id][0];

function stockChoice({itemBadge,trackItem},label,command,id,count){
  return `<div class="property-stock-pair"><button class="property-stock-card" data-action="${command}" aria-label="${label}" title="${label}">
    ${itemBadge(id)}<small>${title(id)}</small><span>×${count}</span></button>${trackItem?.(id)??''}</div>`;
}

function houseInspector(state,helpers,slot,view){
  const current=roomDecor(state.homestead,view)[slot];
  const slotName=propertySlotLabels(view)[slot],globalSlot=(extensions[view]?.offset??0)+slot;
  const eligible=Object.keys(furnishings).filter(id=>state.inventory[id]>0&&id!==current);
  return `<h3>${slotName}</h3>
    <div class="property-item-detail">${current?helpers.itemBadge(current):`<span class="property-outline-icon">${icon('armchair',24)}</span>`}
      <div><strong>${current?title(current):'Open floor spot'}</strong><small>${current?'Placed in the cottage':'Select a piece from your satchel.'}</small></div></div>
    ${current?helpers.action('Put away','homestead-remove:'+globalSlot,'x','','small-action')+(helpers.trackItem?.(current)??''):''}
    <h4>Furniture in your satchel</h4>
    ${eligible.length?`<div class="property-stock">${eligible.map(id=>stockChoice(helpers,
      'Place '+title(id)+(view==='house'&&slot===3?' in the ':' ')+slotName.toLowerCase(),'homestead-decorate:'+globalSlot+'.'+id,id,state.inventory[id])).join('')}</div>`:
      '<p class="property-help">Craft furniture at the bench or buy it at the market.</p>'}`;
}

function gardenInspector(state,helpers,slot,record){
  const {seed,status}=record;
  if(status==='empty'){
    const eligible=Object.keys(crops).filter(id=>state.inventory[id]>0);
    return `<h3>Plot ${slot+1}</h3><div class="property-item-detail"><span class="property-outline-icon">${icon('sprout',24)}</span>
      <div><strong>Ready for seed</strong><small>One packet plants this bed.</small></div></div>
      <h4>Seeds in your satchel</h4>
      ${eligible.length?`<div class="property-stock">${eligible.map(id=>stockChoice(helpers,
        'Plant '+title(crops[id].crop)+' in plot '+(slot+1),'homestead-plant:'+slot+'.'+id,id,state.inventory[id])).join('')}</div>`:
        '<p class="property-help">Buy a seed packet at the market to plant here.</p>'}`;
  }
  const cropped=crops[seed].crop;
  const note=status==='ready'?(record.watered?'Yields three bundles':'Yields two bundles'):
    status==='watered'?'Watered · Growing':'Water once to grow faster and harvest more.';
  const operate=status==='ready'?helpers.action('Harvest','homestead-harvest:'+slot,'sparkles','aria-label="Harvest plot '+(slot+1)+'"','primary'):
    status==='growing'?helpers.action('Water','homestead-water:'+slot,'sprout','aria-label="Water plot '+(slot+1)+'"','primary'):'';
  return `<h3>Plot ${slot+1}</h3><div class="property-item-detail">${helpers.itemBadge(cropped)}<div>
    <strong>${status==='ready'?'Ready to harvest':title(cropped)}</strong>
    <small>${status==='ready'?title(cropped)+' · ':''}${note}</small></div></div>${operate}${helpers.trackItem?.(cropped)??''}${helpers.trackItem?.(seed)??''}`;
}


function additions(state,helpers){
  const hasRoom=Object.keys(state.homestead.extensions??{}).length;
  return `<details class="property-expansion"><summary>${icon('hammer',18)} Expand the homestead <span>${hasRoom} of 3 built</span></summary>
    <div class="property-expansion-grid">${Object.entries(extensions).map(([id,room])=>{
      const built=state.homestead.extensions?.[id];
      return `<article class="property-addition" style="--addition:${room.color}">
        <span class="addition-icon">${icon(room.icon,27)}</span><h3>${room.name}</h3><p>${room.summary}</p>
        <div class="addition-cost">${Object.entries(room.cost).map(([item,n])=>{
          const have=item==='coins'?state.wallet.coins:state.inventory[item]??0;
          return `<span data-affordable="${have>=n}" title="${have} available">${item==='coins'?icon('sun',14):helpers.itemBadge(item)}
            ${n} ${({coins:'Suncoins',wood:'wood',stone:'stone',petal:'bloom petals'})[item]} ${item==='coins'?'':helpers.trackItem?.(item)??''}</span>`;
        }).join('')}</div>
        ${built?helpers.action('Open '+room.name,'home-tab:'+id,room.icon,'','small-action'):
          helpers.action('Build '+room.name,'homestead-expand:'+id,'hammer',canExpand(state,id)?'':'disabled','small-action')}
      </article>`;
    }).join('')}</div></details>`;
}

export function propertyMap(state,helpers,view='garden',selected=0){
  if(!Object.hasOwn(mapConfig,view)||view!=='garden'&&!roomDecor(state.homestead,view)) view='house';
  const garden=view==='garden',config=mapConfig[view],{spots}=config;
  selected=Number.isInteger(selected)&&selected>=0&&selected<spots.length?selected:0;
  const records=garden?state.homestead.plots.map(p=>plotRecord(p,Date.now())):roomDecor(state.homestead,view);
  const art=mapArt(view,records,selected),room=extensions[view];
  const tabs=[['house','Cottage','house','Furnish'],['garden','Garden','sprout','Garden'],
    ...Object.entries(extensions).filter(([id])=>state.homestead.extensions?.[id]).map(([id,entry])=>[id,entry.name,entry.icon,entry.name])];
  return `<div class="property-workspace">
    <div class="property-tools"><div class="property-tabs" aria-label="Property area">
      ${tabs.map(([key,label,symbol,accessible])=>`<button class="property-tab" data-action="home-tab:${key}" aria-label="${accessible}" aria-pressed="${key===view}">${icon(symbol,18)}<span>${label}</span></button>`).join('')}
      </div><div class="property-views">${helpers.action('Change view','property-mode:choose','compass','','primary')}
      ${helpers.action('Back outside','close','chevron-left','','small-action property-exit')}</div></div>
    <div class="property-layout">
      <div class="property-stage"><img class="property-landscape" src="${art}" alt="${garden?'Isometric map of the cottage garden':view==='house'?'Isometric cutaway of Clover Cottage':'Isometric cutaway of the '+config.title}">
        ${spots.map(([x,y],i)=>{
          const [left,top]=projectProperty(view,x+(garden?.61:.65),y+(garden?.49:.64),garden?18:1);
          const item=records[i],status=garden?conditions[item.status]:item?'Placed':'Open';
          const name=garden?'Plot '+(i+1):propertySlotLabels(view)[i];
          const description=name+', '+(garden?status:item?title(item):'empty');
          return `<button class="property-hit" data-action="property-tile:${i}" aria-label="${description}" aria-pressed="${selected===i}"
            data-status="${garden?item.status:item?'placed':'empty'}" style="--at-x:${(left/W*100).toFixed(2)}%;--at-y:${(top/H*100).toFixed(2)}%;--mobile-x:${garden?(1-Math.floor(i/2))*11:0}px">
            <span>${view==='house'?spotLabels[i]:name}</span><small>${status}</small></button>`;
        }).join('')}
      </div>
      <aside class="property-inspector" aria-label="${garden?'Selected plot':'Selected furnishing spot'}">
        ${garden?gardenInspector(state,helpers,selected,records[selected]):houseInspector(state,helpers,selected,view)}
        ${room?`<div class="property-room-service"><h4>${room.name} service</h4>
          ${helpers.action(room.service,'homestead-service:'+view,room.icon,roomReady(state,view)?'':'disabled','small-action')}
          <p class="property-help">${view==='workshop'?'Uses 1 wood and 1 bloom petal.':roomReady(state,view)?room.summary:'Available again shortly.'}</p>
          ${view==='workshop'?(helpers.trackItem?.('wood')??'')+(helpers.trackItem?.('petal')??''):view==='sunroom'?helpers.trackItem?.('cloverSeed')??'':''}</div>`:''}
      </aside>
    </div>
    <p class="property-caption">${config.hint}</p>${additions(state,helpers)}
  </div>`;
}
