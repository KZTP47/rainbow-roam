import {items,species} from './content.js';
import {regionalMonster} from './dungeon-fauna.js';
import {movableHotbar} from './hotbar-layout.js';
import * as T from 'three';
import {animate,branch,creature,part} from './models.js';
import {defaultLook,normalizeLook} from './wardrobe.js';
import {traveler} from './traveler.js';
import {disposeHuman} from './human.js';
import {icon} from './icons.js';
import {
  buildDungeonTower,changeDiveDepth,changeDungeonFloor,drinkDungeonPotion,dungeonCanStand,dungeonCell,dungeonCellAt,dungeonDistanceField,
  dungeonEntrances,dungeonFoes,dungeonLayer,dungeonMaxHealth,dungeonPassableCell,dungeonStep,dungeonTile,dungeonTowerCost,openDungeonSeal
} from './dungeons.js';
import {runeSymbols} from './dungeon-depths.js';
import {channelBed,floodedChannels,tileVariation as cellNoise} from './dungeon-water.js';
import './dungeon-view.css';

const directions=[[-1,0],[1,0],[0,-1],[0,1]];
const hotbar=[
  {id:'blade',key:'1',name:'Blade',symbol:'sword',cooldown:.43},
  {id:'bolt',key:'2',name:'Arc bolt',symbol:'sparkles',cooldown:.94},
  {id:'ward',key:'3',name:'Ward',symbol:'lock',cooldown:2.35},
  {id:'potion',key:'4',name:'HP potion',symbol:'heart',cooldown:.50}
];
const lampTints=['#ffdd9a','#9be8cf','#bdaaff','#90d2ff'];
const tint=(value)=>new T.Color(value);
const glow=(color)=>new T.MeshBasicMaterial({color});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

function zoneName(layout,area){
  return Number.isInteger(layout.depth)?'Floor '+(layout.depth+1)+' · '+area:area;
}

function markup(layout){
  const buttons=hotbar.map(({id,key,name,symbol})=>
    '<button type="button" data-underground="'+id+'" aria-label="'+name+'">'+icon(symbol,21)+
    '<span>'+name+'</span><kbd>'+key+'</kbd><i data-slot-count hidden></i></button>').join('');
  const touch=[
    ['w','chevron-up','Walk forward'],['a','chevron-left','Move left'],
    ['s','chevron-down','Walk backward'],['d','chevron-right','Move right']
  ].map(([key,symbol,name])=>'<button type="button" data-underground-move="'+key+'" aria-label="'+name+'">'+icon(symbol,20)+'</button>').join('');
  return '<section class="underground" aria-label="'+layout.name+'" tabindex="-1">'+
    '<div class="underground-stage"></div><div class="underground-edge" aria-hidden="true"></div>'+
    '<header class="underground-head"><div class="underground-title">'+icon('mountain',27)+
    '<div><h1>'+layout.name+'</h1><p data-underground-zone>'+zoneName(layout,layout.chambers[0])+'</p></div></div>'+
    '<div class="underground-tools"><button type="button" data-underground="view" aria-label="First-person view" title="First-person view (V)">'+icon('eye',20)+'<span>First person</span><kbd>V</kbd></button>'+
    '<button type="button" data-underground="help" aria-label="Dungeon controls">'+icon('compass',20)+'</button></div></header>'+
    '<button class="underground-minimap" data-underground="map" type="button" aria-label="Open dungeon map" title="Open dungeon map (M)">'+
    '<canvas width="240" height="240" aria-hidden="true"></canvas><span>N</span><kbd>M</kbd></button>'+
    '<div class="underground-reticle" hidden aria-hidden="true"></div>'+
    '<div class="underground-health"><div>'+icon('heart',18)+'<strong data-underground-hp>100 / 100</strong></div>'+
    '<progress max="100" value="100" aria-label="Dungeon health"></progress></div>'+
    '<div class="underground-target" hidden><strong></strong><progress aria-label="Monster health"></progress></div>'+
    '<div class="underground-toast" role="status" hidden></div>'+
    '<div class="underground-touch" aria-label="Dungeon movement">'+touch+'</div>'+
    '<button class="underground-interact" type="button" data-underground="interact" hidden><kbd>E</kbd><span></span></button>'+
    '<div class="underground-hotbar" aria-label="Dungeon hotbar">'+buttons+'</div>'+
    '<section class="underground-overlay" hidden></section></section>';
}

function instance(scene,geometry,records){
  const batches=new Map();
  for(const record of records){
    const chunk=Math.floor(record.p[0]/15)+'/'+Math.floor(record.p[2]/15);
    const key=record.color+'/'+chunk;
    if(!batches.has(key)) batches.set(key,[]);
    batches.get(key).push(record);
  }
  const probe=new T.Object3D();
  const materials=new Map();
  for(const rows of batches.values()){
    const color=rows[0].color;
    if(!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color,flatShading:true,roughness:.95}));
    const mesh=new T.InstancedMesh(geometry,materials.get(color),rows.length);
    for(const [i,entry] of rows.entries()){
      probe.position.set(...entry.p);probe.scale.set(...entry.s);
      probe.rotation.set(0,entry.r??0,0);probe.updateMatrix();
      mesh.setMatrixAt(i,probe.matrix);
    }
    mesh.instanceMatrix.needsUpdate=true;
    mesh.userData.undergroundOwned=true;
    scene.add(mesh);
  }
}

function batchDecor(scene,decor){
  const batches=new Map();
  decor.updateMatrixWorld(true);
  decor.traverse(mesh=>{
    if(!mesh.isMesh) return;
    const key=mesh.geometry.id+'/'+mesh.material.id;
    if(!batches.has(key)) batches.set(key,{geometry:mesh.geometry,material:mesh.material,matrices:[]});
    batches.get(key).matrices.push(mesh.matrixWorld);
  });
  for(const {geometry,material,matrices} of batches.values()){
    const mesh=new T.InstancedMesh(geometry,material,matrices.length);
    matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));
    scene.add(mesh);
  }
}

function terrain(scene,layout){
  const cube=[],stone=[],rocks=[];
  const glowing=glow(layout.accent),pollen=glow(layout.secondary);
  const decor=new T.Group(),lanterns=lampTints.map(glow);
  function add(list,color,p,s,r){
    list.push({color,p,s,r});
  }
  for(const cell of layout.tiles){
    if(!cell) continue;
    const {x,z,wx,wz,zone}=cell;
    const n=cellNoise(x,z);
    const color=layout.floor[Math.floor(n*layout.floor.length)];
    if(!cell.flooded)add(cube,color,[wx,-.13,wz],[dungeonTile,.25,dungeonTile]);
    if(!cell.flooded)for(const side of [-1,1]){
      const offset=side*(.54+n*.13);
      const tileTint=layout.floor[(Math.floor(n*15)+side+4)%layout.floor.length];
      add(cube,tileTint,[wx+offset,.015,wz-offset],[.83+n*.3,.035,.83+n*.3],(n-.5)*.3);
    }
    if(cell.flooded){
      for(const [dx,dz] of directions){
        const neighbor=dungeonCell(layout,x+dx,z+dz);
        if(!neighbor||neighbor.flooded)continue;
        for(let i=0;i<6;i++){
          const noise=cellNoise(x+i,z,17+dx+2*dz);
          const along=(i-2.5)*.39+(noise-.5)*.15;
          const inset=dungeonTile/2-.15-noise*.62;
          const px=wx+dx*inset+dz*along,pz=wz+dz*inset+dx*along;
          const size=.09+noise*.16;
          add(rocks,layout.stone[(i+1)%layout.stone.length],[px,channelBed(layout,cell,px,pz)+.03,pz],
            [size*1.5,size*.58,size],noise*6);
        }
      }
    }
    if(zone===null){
      add(cube,layout.stone[0],[wx,3.93,wz],[dungeonTile,.31,dungeonTile]);
      if(n>.79){
        const height=.53+.32*n;
        part(decor,'cone',layout.stone[2],wx+(n-.72)*2.1,3.81-height*.50,wz+.32,.28,height,.32,Math.PI,.15);
        part(decor,'cone',layout.stone[3],wx-.49,3.53,wz-.51,.20,.55,.22,Math.PI,.72);
      }
    }
    for(const [dx,dz] of directions){
      if(dungeonCell(layout,x+dx,z+dz)) continue;
      const coordX=wx+dx*dungeonTile*.52,coordZ=wz+dz*dungeonTile*.52;
      const yaw=dx?Math.PI*.5:0;
      const shade=Math.floor(cellNoise(x+dx,z+dz,2)*layout.stone.length);
      add(cube,layout.stone[shade],[coordX,cell.flooded?1.60:1.97,coordZ],[dungeonTile,cell.flooded?4.94:4.2,.59],yaw);
      const sdx=dz,sdz=dx;
      for(let row=0;row<3;row++){
        for(let col=0;col<2;col++){
          const rand=cellNoise(x+row*.27,z+col*.31,shade+row);
          const shift=(col?1:-1)*(.53+rand*.07)+(row%2?-.13:.08);
          add(stone,layout.stone[(shade+row+col+1)%layout.stone.length],
            [coordX+sdx*shift-dx*.22,.43+1.12*row+rand*.17,coordZ+sdz*shift-dz*.22],
            [1.05+rand*.27,1.07+rand*.1,.34+rand*.14],yaw+rand*.10-.05);
        }
      }
      if(n>.69||zone!==null&&n>.41){
        const ox=coordX-dx*.56,oz=coordZ-dz*.56;
        add(rocks,layout.stone[(shade+2)%layout.stone.length],[ox,.20,oz],[.66,.39,.60],n*2.7);
        if(!layout.underwater&&(n>.92||zone!==null&&n>.54)){
          const lamp=lanterns[(zone??Math.floor(n*17))%lanterns.length];
          part(decor,'cube',layout.stone[1],ox,1.12,oz,.23,.66,.23,0,.4);
          part(decor,'diamond',lamp,ox,1.55,oz,.13,.24,.13,0,n);
          part(decor,'cyl',layout.stone[0],ox,1.76,oz,.16,.08,.16);
        }
        if(layout.underwater){
          const coral=zone===1?'#dd99ae':zone===2?'#db9c72':'#89cbb8';
          for(let j=-1;j<=1;j++){
            const stemX=ox+sdx*j*.16,stemZ=oz+sdz*j*.16,h=.42+n*.50-Math.abs(j)*.15;
            branch(decor,coral,[ox,.08,oz],[stemX,h,stemZ],.054);
            for(const side of [-1,1]){
              const tx=stemX+sdx*side*.13,tz=stemZ+sdz*side*.13;
              branch(decor,coral,[stemX,h*.65,stemZ],[tx,h+.08,tz],.035);
              part(decor,'soft',pollen,tx,h+.10,tz,.047,.058,.047);
            }
          }
        }else if(layout.habitat.family==='tide'){
          for(let j=0;j<3;j++){
            const offset=(j-1)*.22;
            part(decor,'soft',j===1?'#7baf91':'#567d76',ox+sdx*offset,.36,oz+sdz*offset,.064,.38+j*.09,.085,0,n,j*.24);
          }
          if(n>.88)part(decor,'soft','#d7b69b',ox,.15,oz,.24,.12,.17,.32,n);
        }else if((layout.style??layout.id)==='mossvault'){
          for(let j=0;j<3;j++){
            const xx=ox+sdx*(j-1)*.27,zz=oz+sdz*(j-1)*.27,yy=.18+j*.10;
            part(decor,'cyl','#b3c4ab',xx,yy*.52,zz,.052,yy,.052);
            part(decor,'soft',j===1?pollen:glowing,xx,yy,zz,.155,.077,.142);
          }
        }else if((layout.style??layout.id)==='prismfault'){
          for(let j=0;j<3;j++){
            part(decor,'diamond',j===1?pollen:glowing,ox+sdx*(j-1)*.22,.23+j*.13,oz+sdz*(j-1)*.22,.11+j*.028,.25+j*.1,.12,0,n*8,j*.16);
          }
        }else if(n>.79){
          part(decor,'cyl','#d6a17b',ox,.24,oz,.135,.36,.135);
          part(decor,'soft',layout.secondary,ox,.44,oz,.172,.077,.145);
        }
      }
    }
  }
  const stoneBlock=new T.IcosahedronGeometry(.66,0);
  const flatRock=new T.DodecahedronGeometry(.71,0);
  instance(scene,new T.BoxGeometry(1,1,1),cube);
  instance(scene,stoneBlock,stone);
  instance(scene,flatRock,rocks);
  batchDecor(scene,decor);
}

function pointCirclet(parent,radius,color){
  const ring=new T.Mesh(new T.RingGeometry(radius*.91,radius,36),glow(color));
  ring.rotation.x=-Math.PI/2;ring.position.y=.04;
  ring.userData.undergroundOwned=true;
  parent.add(ring);
  return ring;
}

function sceneGroup(scene,cell){
  const group=new T.Group();
  group.position.set(cell.wx,0,cell.wz);scene.add(group);
  return group;
}

function sealArt(scene,layout){
  const {gate,approach,orientation}=layout.puzzle;
  const frame=sceneGroup(scene,gate),door=new T.Group();
  frame.add(door);
  frame.position.z-=orientation*.28;
  for(const side of [-1,1]){
    part(frame,'cube',layout.stone[1],side*1.01,1.50,0,.26,3,.54);
    part(frame,'diamond',glow(layout.accent),side*1.01,2.36,-orientation*.28,.12,.24,.10);
  }
  part(frame,'cube',layout.stone[3],0,2.85,0,2.25,.32,.58);
  part(door,'cube',layout.stone[0],0,1.42,0,2.05,2.60,.32);
  part(door,'cube','#665365',0,1.55,-orientation*.17,1.57,1.98,.04);
  const shine=glow(layout.secondary);
  for(let i=-1;i<=1;i++){
    const x=i*.39;
    part(door,'diamond',shine,x,1.60,-orientation*.23,.11,.16,.055,0,.2);
  }
  const plate=sceneGroup(scene,approach);
  pointCirclet(plate,.64,layout.accent);
  return door;
}

function passageArt(scene,cell,kind,ascending,layout){
  const group=sceneGroup(scene,cell);
  pointCirclet(group,.94,layout.accent);
  if(kind==='stairs'){
    group.rotation.y=ascending?Math.PI:0;
    for(let i=0;i<5;i++){
      const rise=(i+1)*.125;
      part(group,'cube',layout.stone[2],0,rise/2,(i-2)*.32,1.47,rise,.34);
      part(group,'cube',glow(layout.secondary),0,rise+.018,(i-2)*.32-.15,1.20,.028,.022);
    }
    for(const side of [-1,1]){
      part(group,'cube',layout.stone[3],side*.84,.45,0,.15,.9,1.69);
      part(group,'diamond',glow(layout.accent),side*.84,.99,.63,.11,.18,.11);
    }
    return null;
  }
  const center=new T.Group();center.position.y=1.16;group.add(center);
  const material=new T.MeshBasicMaterial({color:layout.accent,transparent:true,opacity:.35,side:T.DoubleSide,depthWrite:false});
  const veil=new T.Mesh(new T.CircleGeometry(.77,36),material);
  veil.userData.undergroundOwned=true;center.add(veil);
  for(const [radius,width,color] of [[.88,.095,layout.stone[2]],[.80,.032,layout.secondary]]){
    const ring=new T.Mesh(new T.TorusGeometry(radius,width,8,48),glow(color));
    ring.userData.undergroundOwned=true;center.add(ring);
  }
  const sparks=Array.from({length:10},()=>part(center,'diamond',glow(layout.secondary),0,0,.05,.045,.068,.045));
  return elapsed=>{
    material.opacity=.22+Math.sin(elapsed*3)*.08;
    for(const [i,spark] of sparks.entries()){
      const angle=elapsed*1.9+i*1.34,radius=.18+i*.055;
      spark.position.x=Math.cos(angle)*radius;
      spark.position.y=Math.sin(angle)*radius;
      spark.rotation.z=angle;
    }
  };
}

function exitArch(scene,layout){
  const group=sceneGroup(scene,layout.entry);
  const arch=new T.Group();
  arch.position.z=dungeonTile+.56;
  group.add(arch);
  for(const side of [-1,1]){
    part(arch,'cube','#ac8f77',side*.73,1.13,0,.24,2.31,.37);
    part(arch,'diamond',glow(layout.accent),side*.73,2.33,0,.15,.24,.16,0,.6);
  }
  part(arch,'cube','#c5a386',0,2.28,0,1.71,.28,.41);
  part(arch,'cube','#eed1a6',0,2.49,0,.86,.24,.27);
  part(arch,'diamond',glow('#fff0d2'),0,2.50,-.20,.13,.11,.045,0,0,Math.PI/4);
  const marker=new T.Group(),bright=glow(layout.secondary);
  marker.position.set(0,2.87,-.28);arch.add(marker);
  part(marker,'cube',bright,0,.12,0,.081,.24,.06);
  part(marker,'cube',bright,-.063,-.015,0,.076,.17,.06,0,0,Math.PI/4);
  part(marker,'cube',bright,.063,-.015,0,.076,.17,.06,0,0,-Math.PI/4);
  pointCirclet(group,.57,layout.accent);
  return marker;
}

function entranceLandmark(scene,layout){
  const group=sceneGroup(scene,layout.entry);
  group.position.z-=dungeonTile+.38;
  const shining=glow(layout.accent),gold=glow(layout.secondary);
  if(layout.place==='corsairCove'){
    for(const side of [-1,1]){
      part(group,'cube','#89694f',side*1.03,1.55,0,.22,3.1,.26,0,0,side*.06);
      for(let i=0;i<4;i++)part(group,'cyl','#c6ad83',side*.99,1.08+i*.095,0,.175,.065,.17);
      part(group,'cyl','#786253',side*.91,.39,-.68,.32,.78,.32);
      for(const y of [.17,.60])part(group,'cyl','#5b6470',side*.91,y,-.68,.33,.066,.33);
    }
    part(group,'cube','#947458',0,3.08,0,2.45,.23,.30);
    part(group,'diamond',gold,0,2.77,.01,.11,.20,.11);
  }else if((layout.style??layout.id)==='mossvault'){
    const root=['#664b56','#846755'];
    for(const side of [-1,1]){
      const x=side*.95;
      const knots=[[x,.16,.16],[x*.96,1.11,.10],[x*.81,2.44,.09],[x*.51,3.18,0],[x*.06,3.48,-.07]];
      for(let i=1;i<knots.length;i++) branch(group,root[i%2],knots[i-1],knots[i],.13-i*.012,.88);
      for(let i=0;i<6;i++){
        const y=3.32-i*.075,dx=side*(.32+i*.09);
        part(group,'low',i%3?'#7c9e63':shining,dx,y,.19,.13,.073,.097,0,0,side*.26);
      }
    }
  }else if((layout.style??layout.id)==='prismfault'){
    for(const side of [-1,1]){
      part(group,'diamond','#aaa4d0',side*.90,1.85,.12,.24,1.37,.26,0,1.3,side*.10);
      part(group,'diamond',side<0?shining:gold,side*.87,2.05,.05,.12,1.17,.14,0,1.2,side*.10);
      part(group,'diamond',side<0?gold:shining,side*.65,2.93,.13,.10,.21,.10,0,.8);
    }
  }else{
    part(group,'cube','#977887',0,3.39,.09,2.28,.15,.22);
    for(const side of [-1,1]){
      for(let i=0;i<3;i++) part(group,'cyl','#bc90a5',side*.79,3.18-i*.17,.10,.038,.14,.038,0,0,i%2?.54:0);
      part(group,'cone','#caa678',side*.79,2.64,.11,.20,.37,.20);
      part(group,'cyl','#e4bb83',side*.79,2.47,.11,.22,.074,.22);
      part(group,'sphere',gold,side*.79,2.39,.11,.050,.050,.050);
    }
  }
}

function treasureArt(scene,chest,layout){
  const group=sceneGroup(scene,chest.cell);
  if(chest.id==='provisions'){
    const bottle=new T.Group();group.add(bottle);bottle.rotation.z=-.52;
    part(bottle,'fine','#81cac3',0,.32,0,.29,.37,.28);
    part(bottle,'cyl','#9dddd0',0,.67,0,.135,.21,.13);
    part(bottle,'cyl','#ae815b',0,.80,0,.11,.09,.11);
    part(bottle,'sphere','#edcad0',0,.33,.25,.14,.13,.033);
    const mote=part(group,'diamond',glow(layout.secondary),0,.91,0,.07,.13,.07);
    pointCirclet(group,.49,layout.accent);
    return {group,mote};
  }
  part(group,'cube','#764e4f',0,.23,0,.80,.39,.56);
  part(group,'cube','#bc8e61',0,.45,0,.85,.13,.59);
  part(group,'cube','#e4b364',0,.32,.294,.21,.25,.037);
  for(const side of [-1,1]) part(group,'cube','#c7966e',side*.23,.27,0,.057,.46,.60);
  const mote=part(group,'diamond',glow(layout.secondary),0,.81,0,.09,.15,.09);
  pointCirclet(group,.55,layout.secondary);
  return {group,mote};
}

function bubbleColumn(scene,cell){
  const group=sceneGroup(scene,cell),pearl=glow('#b5f4eb');
  const bubbles=[];
  pointCirclet(group,.77,'#9fffe0');
  for(let i=0;i<17;i++){
    const size=.03+(i%5)*.016;
    bubbles.push(part(group,'low',pearl,0,0,0,size,size,size));
  }
  return time=>bubbles.forEach((bubble,i)=>{
    const angle=i*2.4+time*.55;
    bubble.position.set(Math.sin(angle)*.52,(i*.19+time*.58)%3.1,Math.cos(angle)*.49);
  });
}

function reefLight(scene,layout){
  // A sheet just above the sand catches the wavering light from the chimney.
  const positions=[];
  const half=dungeonTile/2;
  for(const cell of layout.tiles.filter(Boolean)){
    for(const [dx,dz] of [[-1,-1],[-1,1],[1,1],[-1,-1],[1,1],[1,-1]])
      positions.push(cell.wx+dx*half,.043,cell.wz+dz*half);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  const light=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0}},
    vertexShader:`varying vec2 sand;void main(){sand=position.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 sand;uniform float time;
      void main(){vec2 p=sand*2.;float t=time*.60;
      float a=sin(p.x+sin(p.y+t))+cos(p.y*1.3-t);
      float line=1.-smoothstep(.025,.20,abs(a));
      gl_FragColor=vec4(.60,.98,.91,line*.25);}`});
  const mesh=new T.Mesh(geometry,light);mesh.userData.undergroundOwned=true;scene.add(mesh);
  return light;
}

function reefWreck(scene,layout){
  const keel=layout.tiles.find(c=>c?.zone===3);
  const ribs=sceneGroup(scene,keel);
  for(const side of [-1,1])for(let i=0;i<4;i++){
    const z=i*.40-.90;
    branch(ribs,'#785e50',[side*.59,.02,z],[side*1.02,1.05+i*.13,z],.10);
    part(ribs,'low','#e1b497',side*.82,.68,z,.13,.12,.11);
  }
  part(ribs,'cube','#735b52',0,.08,0,1.4,.12,2.6,0,.08);
}

function towerArt(scene,layout){
  const plinth=sceneGroup(scene,layout.tower),tower=new T.Group();
  plinth.add(tower);
  part(plinth,'cyl','#897d92',0,.082,0,.80,.17,.80);
  part(plinth,'cyl','#bcacba',0,.193,0,.65,.11,.65);
  pointCirclet(plinth,.94,layout.accent);
  const summit=part(tower,'diamond',glow(layout.secondary),0,2.97,0,.28,.41,.28);
  part(tower,'cyl','#b7a3b3',0,1.18,0,.51,2.01,.51);
  part(tower,'cone',layout.stone[2],0,2.39,0,.71,.83,.71);
  part(tower,'cyl','#d9bd8d',0,2.10,0,.67,.107,.67);
  for(const side of [-1,1]){
    part(tower,'cube',glow(layout.accent),0,1.38,side*.49,.19,.49,.032);
    part(tower,'cube',glow(layout.accent),side*.49,1.38,0,.032,.49,.19);
  }
  return {tower,summit};
}

function monsterArt(scene,layout,entry){
  const group=sceneGroup(scene,entry.cell),body=new T.Group();
  group.add(body);
  let flap;
  if(entry.kind==='spirit'){
    part(body,'diamond',layout.habitat.color,0,.74,0,.30,.50,.29);
    part(body,'soft',glow(layout.secondary),0,.97,.05,.23,.22,.24);
    for(const side of [-1,1]){
      part(body,'sphere','#423d67',side*.088,1.03,.255,.039,.046,.037);
      part(body,'diamond',layout.accent,side*.34,.77,0,.24,.16,.11,0,0,-side*.38);
    }
  }else flap=regionalMonster(body,layout.habitat,entry.kind==='guardian');
  if(entry.kind==='guardian') body.scale.setScalar(1.38);
  const warning=pointCirclet(group,entry.kind==='guardian'?1.06:.72,'#f39a90');
  warning.visible=false;
  return {group,body,warning,flap};
}

function createWorld(stage,layout,state){
  const scene=new T.Scene(),renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(1.4,window.devicePixelRatio||1));
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.36;
  renderer.domElement.setAttribute('aria-label','3D dungeon. Drag to look around.');
  stage.append(renderer.domElement);
  scene.background=tint(layout.fog);scene.fog=new T.FogExp2(layout.fog,.079);
  const camera=new T.PerspectiveCamera(63,1,.055,29);
  const sky=new T.HemisphereLight(layout.ambient,layout.stone[1],2.85);
  const moon=new T.DirectionalLight(layout.torch,2.03);
  moon.position.set(-2,8,5);
  const lantern=new T.PointLight('#ffe7be',10,13,1.6);
  scene.add(sky,moon,lantern);
  terrain(scene,layout);
  const tide=layout.underwater?reefLight(scene,layout):floodedChannels(scene,layout);
  const exitMarker=layout.underwater||layout.depth?null:exitArch(scene,layout);
  const seal=layout.puzzle?sealArt(scene,layout):null;
  const portals=[];
  if(layout.descent) portals.push(passageArt(scene,layout.descent,layout.depth===0?'stairs':'portal',false,layout));
  if(layout.depth) portals.push(passageArt(scene,layout.exit,layout.depth===1?'stairs':'portal',true,layout));
  if(layout.underwater)reefWreck(scene,layout);
  else if(!layout.depth) entranceLandmark(scene,layout);
  const bubbles=layout.underwater||layout.diveMouth?bubbleColumn(scene,layout.diveMouth??layout.exit):null;
  const friends=(layout.friends??[]).map(({id,cell})=>{
    const actor=creature(species[id]);
    actor.group.position.set(cell.wx,.36,cell.wz);
    actor.group.scale.setScalar(.92);
    scene.add(actor.group);
    return {id,actor,cell};
  });
  const player=traveler(normalizeLook(state.look??defaultLook));
  player.group.scale.setScalar(.79);scene.add(player.group);
  const railPoint=sceneGroup(scene,layout.entry);
  const bolt=part(railPoint,'diamond',glow('#fff5c3'),0,0,0,.11,.13,.11);
  railPoint.visible=false;
  const strike=new T.Mesh(new T.TorusGeometry(.80,.054,6,37,Math.PI*.79),glow('#ffedbe'));
  strike.rotation.x=-Math.PI/2;strike.visible=false;strike.userData.undergroundOwned=true;scene.add(strike);
  const wardRing=pointCirclet(scene,.89,'#a6dff4');wardRing.visible=false;
  const chestArts=layout.chests.map(chest=>{
    const art=treasureArt(scene,chest,layout);
    if(chest.cell.flooded)art.group.position.y=channelBed(layout,chest.cell,chest.cell.wx,chest.cell.wz);
    return art;
  });
  const blade=new T.Group();
  part(blade,'cyl','#785261',0,-.07,0,.024,.15,.024);
  part(blade,'cube','#cba06f',0,0,0,.16,.034,.046);
  part(blade,'diamond','#c1d4d3',0,.19,0,.042,.21,.018);
  part(blade,'diamond','#f3ca89',0,-.15,0,.033,.039,.028);
  blade.scale.setScalar(.76);
  camera.add(blade);scene.add(camera);
  const tower=layout.tower?towerArt(scene,layout):null;
  const enemies=layout.enemies.map(entry=>({
    ...entry,...dungeonFoes[entry.kind],...monsterArt(scene,layout,entry),
    name:entry.kind==='spirit'?layout.habitat.wisp:layout.habitat.hunter,
    speed:dungeonFoes[entry.kind].speed*layout.habitat.pace,
    x:entry.cell.wx,z:entry.cell.wz,attackTime:0,windup:0,blink:0,move:false
  }));
  const observed=new ResizeObserver(()=>{
    const {clientWidth,clientHeight}=stage;
    if(!clientWidth||!clientHeight) return;
    renderer.setSize(clientWidth,clientHeight,false);
    camera.aspect=clientWidth/clientHeight;camera.updateProjectionMatrix();
  });
  observed.observe(stage);
  return {scene,renderer,camera,player,blade,tide,friends,bubbles,lantern,railPoint,bolt,strike,wardRing,chestArts,tower,enemies,exitMarker,seal,portals,cleanup(){
    observed.disconnect();
    disposeHuman(player.group);
    const geos=new Set(),materials=new Set();
    scene.traverse(object=>{
      if(object.userData.undergroundOwned) geos.add(object.geometry);
      if(object.userData.undergroundOwned||object.material?.isMeshBasicMaterial) materials.add(object.material);
    });
    geos.forEach(item=>item.dispose());materials.forEach(item=>item.dispose());
    renderer.dispose();renderer.forceContextLoss();
  }};
}

function visibleBetween(layout,a,b){
  const d=distance(a,b);
  const steps=Math.ceil(d/.37);
  for(let i=1;i<steps;i++){
    const t=i/steps;
    const x=T.MathUtils.lerp(a.x,b.x,t),z=T.MathUtils.lerp(a.z,b.z,t);
    if(!dungeonPassableCell(layout,Math.round(x/dungeonTile),Math.round(z/dungeonTile))) return false;
  }
  return true;
}

function advance(layout,body,dx,dz,radius=.41){
  const startX=body.x,startZ=body.z;
  if(dungeonCanStand(layout,body.x+dx,body.z,radius)) body.x+=dx;
  if(dungeonCanStand(layout,body.x,body.z+dz,radius)) body.z+=dz;
  return body.x!==startX||body.z!==startZ;
}

function clearCameraArm(layout,position,offset){
  const steps=Math.ceil(offset.length()/.12);
  for(let step=1;step<=steps;step++){
    const fraction=step/steps;
    if(!dungeonCanStand(layout,position.x+offset.x*fraction,position.z+offset.y*fraction,.38)){
      return (step-1)/steps;
    }
  }
  return 1;
}

function drawExploredMap(canvas,layout,visited){
  const ctx=canvas.getContext('2d'),pixel=canvas.width/layout.width;
  ctx.fillStyle='#262335';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(const index of visited){
    const cell=layout.tiles[index];
    if(!cell)continue;
    const left=cell.x*pixel,top=cell.z*pixel;
    ctx.fillStyle=cell.flooded?'#498d99':cell.zone===null?'#746a80':'#9a879e';
    ctx.fillRect(left,top,pixel,pixel);
    // Trace the perimeter of discovered space, leaving joined room tiles open.
    ctx.strokeStyle=cell.flooded?'#95d5d2':'#d6bbbd';ctx.lineWidth=1.6;
    ctx.beginPath();
    for(const [dx,dz] of directions){
      const adjacent=dungeonCell(layout,cell.x+dx,cell.z+dz);
      if(adjacent&&visited.has(adjacent.index))continue;
      const x=left+(dx+1)*pixel/2,z=top+(dz+1)*pixel/2;
      ctx.moveTo(x-dz*pixel/2,z-dx*pixel/2);ctx.lineTo(x+dz*pixel/2,z+dx*pixel/2);
    }
    ctx.stroke();
  }
  function marker(cell,color){
    if(!cell||!visited.has(cell.index)) return;
    ctx.fillStyle=color;
    ctx.beginPath();ctx.arc((cell.x+.5)*pixel,(cell.z+.5)*pixel,pixel*.37,0,Math.PI*2);
    ctx.fill();
  }
  marker(layout.exit,'#9ceac0');
  marker(layout.diveMouth,'#8df5f4');
  marker(layout.puzzle?.approach,'#f0aade');
  marker(layout.descent,'#9ceac0');
  for(const friend of layout.friends??[])marker(friend.cell,'#f3aeca');
  marker(layout.tower,'#d5c5ff');
  for(const chest of layout.chests) marker(chest.cell,'#ffe0ac');
}

function drawHeading(ctx,cx,cz,yaw,pixel){
  ctx.save();ctx.translate(cx,cz);ctx.rotate(-yaw);
  ctx.fillStyle='#fff2cf';ctx.strokeStyle='#6f4867';ctx.lineWidth=1.35;
  ctx.beginPath();ctx.moveTo(0,pixel*.67);ctx.lineTo(-pixel*.45,-pixel*.47);ctx.lineTo(0,-pixel*.28);ctx.lineTo(pixel*.45,-pixel*.47);
  ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}

function dungeonPrompt(layout,position,progress,expedition,state){
  const near=cell=>distance(position,{x:cell.wx,z:cell.wz})<1.46;
  if(layout.underwater){
    if(near(layout.exit))return {kind:'surface',label:'Surface at the bubble chimney'};
    const friend=layout.friends.find(f=>near(f.cell)&&!state.companions.includes(f.id));
    if(friend){
      const spec=species[friend.id];
      return {kind:'befriend',friend,label:'Offer '+items[spec.favorite][0]+' to '+spec.name};
    }
  }
  if(layout.diveMouth&&near(layout.diveMouth)&&state.look?.morph===5)
    return {kind:'dive',label:'Dive through the bubbles'};
  if(layout.puzzle&&!expedition.seal&&near(layout.puzzle.approach)) return {kind:'seal',label:'Inspect '+layout.puzzle.title};
  if(layout.descent&&expedition.seal&&near(layout.descent)) return {kind:'descend',label:layout.depth?'Enter the swirling portal':'Take the stairs down'};
  if(layout.depth&&near(layout.exit)) return {kind:'ascend',label:layout.depth===1?'Take the stairs up':'Return through the portal'};
  if(!layout.depth&&(near(layout.entry)||near(layout.exit))) return {kind:'exit',label:'Return to the cave mouth'};
  if(layout.tower&&near(layout.tower)){
    return progress.towers[layout.id]?{kind:'travel',label:'Use Wizard Tower'}:{kind:'build',label:'Raise a Wizard Tower'};
  }
  const chest=layout.chests.find(entry=>near(entry.cell)&&(!entry.sealed||expedition.seal)&&!expedition.opened.includes(entry.id));
  if(!chest) return null;
  return {kind:'chest',chest,label:'Open '+chest.name};
}

function findEnemy(layout,enemies,position,defeated,radius=9,cone=false){
  const fx=Math.sin(position.yaw),fz=Math.cos(position.yaw);
  let found=null,closest=radius;
  for(const enemy of enemies){
    if(defeated.has(enemy.id)||enemy.hp<=0) continue;
    const d=distance(enemy,position);
    if(d>closest||!visibleBetween(layout,position,enemy)) continue;
    if(cone&&d>1.32&&((enemy.x-position.x)*fx+(enemy.z-position.z)*fz)/d<.26) continue;
    closest=d;found=enemy;
  }
  return found;
}

function moveEnemy(layout,enemy,position,field,dt,elapsed){
  const current=dungeonCellAt(layout,enemy.x,enemy.z);
  if(!current||field[current.index]<0||field[current.index]>8){
    enemy.windup=0;return false;
  }
  const range=distance(enemy,position),visible=visibleBetween(layout,enemy,position);
  if(enemy.windup){
    if(elapsed<enemy.windup) return false;
    enemy.windup=0;enemy.attackTime=elapsed+1.35;
    return range<enemy.reach+.16&&visible;
  }
  if(range<enemy.reach&&visible){
    if(elapsed>=enemy.attackTime) enemy.windup=elapsed+(enemy.kind==='guardian'?.74:.50);
    return false;
  }
  const step=dungeonStep(layout,current,field);
  const offset=Math.hypot(enemy.x-current.wx,enemy.z-current.wz);
  const target=visible?position:offset>.18?{x:current.wx,z:current.wz}:step?{x:step.wx,z:step.wz}:null;
  if(!target) return false;
  const d=distance(enemy,target);
  if(d<.01) return false;
  const pace=Math.min(dt*enemy.speed,d);
  enemy.move=advance(layout,enemy,(target.x-enemy.x)/d*pace,(target.z-enemy.z)/d*pace,.21);
  return false;
}

function showPanel(overlay,title,body){
  overlay.hidden=false;
  overlay.innerHTML='<div class="underground-sheet" role="dialog" aria-label="'+title+'"><header><h2>'+title+'</h2>'+
    '<button type="button" data-underground="close" aria-label="Close">'+icon('x',21)+'</button></header>'+body+'</div>';
  overlay.querySelector('button')?.focus();
}

export function mountDungeon(host,state,callbacks={}){
  let cleanup;
  function mountLayer(){
    cleanup?.();
    cleanup=mountDungeonLayer(host,state,callbacks,mountLayer);
  }
  mountLayer();
  return ()=>cleanup?.();
}

function mountDungeonLayer(host,state,{save=()=>{},onExit=()=>{},onTravel=()=>{},onBefriend},remount){
  const progress=state.dungeons,trip=progress.expeditions[progress.active];
  const {layout:floor,expedition,diving}=dungeonLayer(state);
  if(trip?.diving&&!diving)trip.diving=false;
  if(!floor||!expedition) throw new Error('No active expedition');
  const layout={...floor,blockedGate:expedition.seal?null:floor.puzzle?.gate.index};
  host.innerHTML=markup(layout);
  const shell=host.firstElementChild;
  const get=selector=>shell.querySelector(selector);
  const bar=get('.underground-hotbar');
  bar.hidden=Boolean(diving);
  const releaseBar=diving?()=>{}:movableHotbar(bar,'dungeon');
  const mini=get('.underground-minimap canvas'),reticle=get('.underground-reticle');
  const viewButton=get('[data-underground="view"]');
  const chart=document.createElement('canvas');
  const mapScale=20;
  chart.width=layout.width*mapScale;chart.height=layout.height*mapScale;
  const stage=get('.underground-stage');
  const world=createWorld(stage,layout,state);
  if(world.seal&&expedition.seal) world.seal.visible=false;
  const {camera,renderer,scene,player,enemies,chestArts,tower}=world;
  const overlay=get('.underground-overlay'),control=get('.underground-interact');
  const health=get('[data-underground-hp]'),life=get('.underground-health progress');
  const targetBadge=get('.underground-target'),toast=get('.underground-toast'),zoneLabel=get('[data-underground-zone]');
  const keys=new Set(),cooldowns=new Map(),visited=new Set(expedition.visited),defeated=new Set(expedition.defeated);
  const moveKeys=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift']);
  const start=expedition.position;
  const cameraAim=new T.Vector3(),boltStart=new T.Vector3(),boltEnd=new T.Vector3();
  const cameraOffset=new T.Vector2(),cameraGoal=new T.Vector2(),cameraStep=new T.Vector2();
  const options=new AbortController(),listener={signal:options.signal};
  let elapsed=0,last=performance.now(),frame=0,guardUntil=0,bulletUntil=0,strikeUntil=0,toastUntil=0;
  let cell=null,field=dungeonDistanceField(layout,null),area=layout.chambers[0],activePanel=null;
  let grabbed=null,lookHeight=0,eyePitch=-.12,eyeHeight=null,following=false,actorYaw=start.yaw,flashUntil=0;
  let prompt=null,dead=false,closed=false,runeSequence=[];

  let chartDirty=true,lastMiniX,lastMiniZ,lastMiniYaw;
  const rooms=new Map();
  for(const tile of layout.tiles){
    if(tile?.zone==null)continue;
    if(!rooms.has(tile.zone))rooms.set(tile.zone,[]);
    rooms.get(tile.zone).push(tile.index);
  }
  function reveal(index){
    if(visited.has(index))return;
    visited.add(index);expedition.visited.push(index);chartDirty=true;
  }
  // A single visited tile in an older save is evidence of entering its room.
  for(const room of rooms.values())if(room.some(index=>visited.has(index)))room.forEach(reveal);

  function paintMap(expanded){
    const {x,z,yaw}=expedition.position;
    if(!expanded&&!chartDirty&&x===lastMiniX&&z===lastMiniZ&&yaw===lastMiniYaw)return;
    if(chartDirty){drawExploredMap(chart,layout,visited);chartDirty=false;}
    const cx=(x/dungeonTile+.5)*mapScale,cz=(z/dungeonTile+.5)*mapScale;
    if(expanded){
      expanded.width=chart.width;expanded.height=chart.height;
      const ctx=expanded.getContext('2d');
      ctx.drawImage(chart,0,0);drawHeading(ctx,cx,cz,yaw,mapScale);
      return;
    }
    const ctx=mini.getContext('2d'),half=mini.width/2;
    ctx.fillStyle='#262335';ctx.fillRect(0,0,mini.width,mini.height);
    ctx.drawImage(chart,half-cx,half-cz);
    drawHeading(ctx,half,half,yaw,mapScale*1.28);
    lastMiniX=x;lastMiniZ=z;lastMiniYaw=yaw;
  }

  function persist(){
    save();
  }

  function notify(message){
    toast.textContent=message;
    toast.hidden=false;toastUntil=elapsed+3.1;
  }

  function reportHealth(){
    health.textContent=progress.health+' / '+dungeonMaxHealth;life.value=progress.health;
    const stock=get('[data-underground="potion"] [data-slot-count]');
    stock.hidden=false;stock.textContent=state.inventory.hpPotion??0;
    get('[data-underground="potion"]').setAttribute('aria-label','HP potion');
  }

  function applyPerspective(){
    viewButton.setAttribute('aria-pressed',String(progress.firstPerson));
    reticle.hidden=!progress.firstPerson;
    world.blade.visible=progress.firstPerson&&!diving;
  }

  function togglePerspective(){
    if(activePanel||dead)return;
    progress.firstPerson=!progress.firstPerson;
    following=false;
    applyPerspective();persist();
  }

  function closePanel(){
    if(dead) return;
    overlay.hidden=true;overlay.replaceChildren();activePanel=null;keys.clear();
    shell.focus({preventScroll:true});
  }

  function openPanel(type,title,content){
    activePanel=type;keys.clear();grabbed=null;
    showPanel(overlay,title,content);
  }

  function showMap(){
    if(activePanel==='map'){closePanel();return;}
    openPanel('map','Explored passages','<canvas width="512" height="512" data-underground-chart aria-label="Map of your explored passages"></canvas>'+
      '<p class="underground-legend"><span>● '+(diving?'Bubble chimney':layout.depth?'Stair or portal':'Cave mouth or stairs')+'</span>'+
      (diving?'<span>● Sea friend</span>':layout.tower?'<span>● Tower site</span>':'')+
      (layout.puzzle?'<span class="rune-legend">● Rune seal</span>':'')+'<span>● Chest</span></p>');
    paintMap(get('[data-underground-chart]'));
  }

  function showHelp(){
    openPanel('help','Dungeon controls','<dl><div><dt>WASD or arrows</dt><dd>Move in the direction you see on screen.</dd></div>'+
      '<div><dt>Look</dt><dd>Drag the view or hold Shift and press ← or → to turn.</dd></div>'+
      '<div><dt>V</dt><dd>Switch first-person view on or off. Drag to aim. Click or press 1 to swing your blade.</dd></div>'+
      '<div><dt>E</dt><dd>Open a chest, inspect a rune seal, or use a stairway, portal or exit.</dd></div>'+
      (layout.diveMouth||diving?'<div><dt>E</dt><dd>Mermaids dive and surface at rising bubbles. Bring petals and sunberries for reef friends.</dd></div>':'')+
      (diving?'':'<div><dt>1–4</dt><dd>Use your blade, arc bolt, ward or HP potion.</dd></div>')+
      '<div><dt>M</dt><dd>See the passages you have explored.</dd></div></dl>'+
      '<button class="underground-primary" type="button" data-underground="close">Keep exploring</button>');
  }

  function openTower(){
    const destinations=dungeonEntrances.filter(entry=>progress.towers[entry.id]&&entry.id!==layout.id)
      .map(entry=>({id:entry.id,name:entry.name}));
    if(state.homestead?.extensions?.wizardTower) destinations.unshift({id:'home',name:'Homestead Wizard Tower'});
    const rows=destinations.map(entry=>'<button type="button" data-underground="travel" data-destination="'+entry.id+'">'+
      icon('sparkles',18)+'<span>'+entry.name+'</span>'+icon('arrow-right',16)+'</button>').join('');
    openPanel('travel','Wizard Tower',rows?'<div class="underground-travel">'+rows+'</div>':
      '<p>Raise a tower at your homestead or in another dungeon to link it here.</p>');
  }

  function openBuild(){
    const {coins,crystal}=dungeonTowerCost;
    const ready=state.wallet.coins>=coins&&(state.inventory.crystal??0)>=crystal;
    openPanel('build','Raise a Wizard Tower','<p>Link this chamber to your other built towers.</p>'+
      '<p class="underground-cost"><span>'+(state.inventory.crystal??0)+' / '+crystal+' Starglass</span>'+
      '<span>'+state.wallet.coins+' / '+coins+' Suncoins</span></p>'+
      '<button class="underground-primary" type="button" data-underground="build" '+(ready?'':'disabled')+'>Build Wizard Tower</button>');
  }

  function showSeal(){
    runeSequence=[];
    const runes=Object.entries(runeSymbols).map(([id,[name,symbol]])=>
      '<button type="button" data-underground="rune" data-rune="'+id+'">'+icon(symbol,22)+'<span>'+name+'</span></button>').join('');
    openPanel('seal',layout.puzzle.title,'<p>'+layout.puzzle.clue+'</p><div class="underground-runes">'+runes+'</div>'+
      '<p class="rune-feedback" role="status">Choose three runes in order.</p>'+
      '<button type="button" class="underground-primary" data-underground="rune-reset">Clear runes</button>');
  }

  function chooseRune(id){
    if(!Object.hasOwn(runeSymbols,id)) return;
    runeSequence.push(id);
    const feedback=get('.rune-feedback');
    if(runeSequence.length<layout.puzzle.order.length){
      feedback.textContent=runeSequence.map(rune=>runeSymbols[rune][0]).join(' → ');
      return;
    }
    if(openDungeonSeal(state,runeSequence)){
      layout.blockedGate=null;
      field=dungeonDistanceField(layout,cell);
      closePanel();renderPrompt();notify('The seal opens.');persist();
      return;
    }
    feedback.textContent=runeSequence.map(rune=>runeSymbols[rune][0]).join(' → ')+' did not open the door. Try again.';
    runeSequence=[];
  }

  function interact(){
    const current=dungeonPrompt(layout,expedition.position,progress,expedition,state);
    if(!current||activePanel||dead) return;
    if(current.kind==='seal'){showSeal();return;}
    if(current.kind==='descend'||current.kind==='ascend'){
      if(changeDungeonFloor(state,current.kind==='descend'?1:-1)){persist();remount();}
      return;
    }
    if(current.kind==='dive'||current.kind==='surface'){
      if(changeDiveDepth(state)){persist();remount();}
      return;
    }
    if(current.kind==='befriend'){
      const id=current.friend.id,spec=species[id];
      if(!(state.inventory[spec.favorite]>0)){notify('Bring '+items[spec.favorite][0]+' · Look inside the Drift Bottle.');return;}
      onBefriend(id);
      notify(spec.name+' joined your Friends!');
      return;
    }
    if(current.kind==='exit'){
      persist();onExit();return;
    }
    if(current.kind==='build'){openBuild();return;}
    if(current.kind==='travel'){openTower();return;}
    const {chest}=current;
    if(chest.guard&&!defeated.has(chest.guard)){
      notify('Defeat '+layout.guardian+' to open the vault.');
      return;
    }
    for(const [id,n] of Object.entries(chest.rewards)){
      if(id==='coins') state.wallet.coins+=n;
      else state.inventory[id]=(state.inventory[id]??0)+n;
    }
    expedition.opened.push(chest.id);
    const rewards=Object.entries(chest.rewards).map(([id,n])=>n+' '+(id==='coins'?'Suncoins':items[id]?.[0]??id));
    notify(chest.name+' · '+rewards.join(' · '));reportHealth();persist();
  }

  function dealDamage(enemy,amount){
    enemy.hp=Math.max(0,enemy.hp-amount);enemy.blink=elapsed+.21;
    if(enemy.hp>0) return;
    defeated.add(enemy.id);expedition.defeated.push(enemy.id);
    const coins=enemy.kind==='guardian'?11:3;
    state.wallet.coins+=coins;
    if(enemy.kind==='guardian') state.inventory.crystal=(state.inventory.crystal??0)+2;
    notify((enemy.kind==='guardian'?layout.guardian:enemy.name)+' defeated · +'+coins+' Suncoins');
    persist();
  }

  const sight=new T.Ray(),aimCenter=new T.Vector3(),aimOffset=new T.Vector3();
  function combatTarget(range){
    const p=expedition.position;
    if(!progress.firstPerson)return findEnemy(layout,enemies,p,defeated,range,true);
    sight.origin.set(p.x,eyeHeight??1.45,p.z);
    sight.direction.set(Math.sin(p.yaw)*Math.cos(eyePitch),Math.sin(eyePitch),Math.cos(p.yaw)*Math.cos(eyePitch));
    let nearest=null,nearestDepth=Infinity;
    for(const enemy of enemies){
      if(enemy.hp<=0||defeated.has(enemy.id)||distance(enemy,p)>range||!visibleBetween(layout,p,enemy))continue;
      const guardian=enemy.kind==='guardian',radius=guardian?.90:.57;
      aimCenter.set(enemy.x,enemy.group.position.y+(guardian?1.05:.78),enemy.z);
      const front=aimOffset.subVectors(aimCenter,sight.origin).dot(sight.direction);
      if(front<=0||front>=nearestDepth||sight.distanceSqToPoint(aimCenter)>radius*radius)continue;
      nearest=enemy;nearestDepth=front;
    }
    return nearest;
  }

  function useSlot(id){
    if(diving||activePanel||dead||elapsed<(cooldowns.get(id)??0)) return;
    const slot=hotbar.find(entry=>entry.id===id);
    const p=expedition.position;
    if(id==='potion'){
      if(!drinkDungeonPotion(state)){
        notify(state.inventory.hpPotion?'Your health is full.':'You are out of HP potions.');return;
      }
      notify('HP restored');reportHealth();persist();
    }else if(id==='ward'){
      guardUntil=elapsed+1.34;
      notify('Ward raised');
    }else{
      actorYaw=p.yaw;
      const target=combatTarget(id==='blade'?2.02:8.6);
      if(id==='blade'){
        strikeUntil=elapsed+.27;
        if(target) dealDamage(target,29);
      }else{
        boltStart.set(p.x+Math.sin(p.yaw)*.48,.97,p.z+Math.cos(p.yaw)*.48);
        boltEnd.set(target?.x??p.x+Math.sin(p.yaw)*3.5,.87,target?.z??p.z+Math.cos(p.yaw)*3.5);
        if(progress.firstPerson){
          sight.at(.26,boltStart);boltStart.y-=.12;
          if(target)boltEnd.set(target.x,target.group.position.y+(target.kind==='guardian'?1.05:.78),target.z);
          else{
            boltEnd.copy(boltStart);
            for(let step=.35;step<=8.6;step+=.20){
              sight.at(step,aimCenter);
              const tile=dungeonCellAt(layout,aimCenter.x,aimCenter.z);
              if(!tile||aimCenter.y<channelBed(layout,tile,aimCenter.x,aimCenter.z)||(tile.zone===null&&aimCenter.y>3.77))break;
              boltEnd.copy(aimCenter);
            }
          }
        }
        bulletUntil=elapsed+.31;
        if(target) dealDamage(target,23);
      }
    }
    cooldowns.set(id,elapsed+slot.cooldown);
    get('[data-underground="'+id+'"]').style.setProperty('--underground-recharge','1');
  }

  function collapse(){
    dead=true;
    openPanel('fallen','Your lantern went out','<p>Catch your breath at '+(layout.depth?'this floor’s entrance':'the cave mouth')+'. Your finds and towers are safe.</p>'+
      '<button class="underground-primary" type="button" data-underground="wake">Wake at the entrance</button>');
  }

  function wake(){
    progress.health=dungeonMaxHealth;
    Object.assign(expedition.position,{x:layout.entry.wx,z:layout.entry.wz,yaw:Math.PI});
    actorYaw=expedition.position.yaw;
    for(const enemy of enemies){
      enemy.x=enemy.cell.wx;enemy.z=enemy.cell.wz;
      enemy.windup=0;enemy.attackTime=elapsed+1.6;
      if(!defeated.has(enemy.id)) enemy.hp=dungeonFoes[enemy.kind].hp;
    }
    dead=false;guardUntil=0;flashUntil=0;following=false;
    closePanel();reportHealth();persist();
  }

  function renderPrompt(){
    const candidate=dungeonPrompt(layout,expedition.position,progress,expedition,state);
    const label=candidate?.label??null;
    if(label===prompt) return;
    prompt=label;control.hidden=!label;
    if(label) control.lastElementChild.textContent=label;
  }

  function activate(id,source){
    if(id==='wake'){if(dead) wake();return;}
    if(dead) return;
    if(id==='close'){closePanel();return;}
    if(id==='map'&&(!activePanel||activePanel==='map')){showMap();return;}
    if(id==='help'&&!activePanel){showHelp();return;}
    if(id==='view'){togglePerspective();return;}
    if(id==='interact'){interact();return;}
    if(activePanel==='seal'&&id==='rune'){chooseRune(source.dataset.rune);return;}
    if(activePanel==='seal'&&id==='rune-reset'){
      runeSequence=[];get('.rune-feedback').textContent='Choose three runes in order.';return;
    }
    if(id==='build'&&activePanel==='build'){
      if(buildDungeonTower(state,layout.id)){
        closePanel();notify('Wizard Tower raised');persist();
      }
      return;
    }
    if(id==='travel'&&activePanel==='travel'){
      const target=source.dataset.destination;
      const available=target==='home'?state.homestead?.extensions?.wizardTower:progress.towers[target];
      if(available){persist();onTravel(target);}
      return;
    }
    if(hotbar.some(slot=>slot.id===id)) useSlot(id);
  }

  function keydown(event){
    if(event.altKey||event.ctrlKey||event.metaKey) return;
    const key=event.key.toLowerCase();
    if(key==='tab'||event.target.closest?.('.hotbar-grip')&&(key==='home'||key.startsWith('arrow'))) return;
    if(activePanel&&['enter',' '].includes(key)&&event.target.closest('button')) return;
    // The surface game stays paused behind the dungeon and should not receive its controls.
    event.stopImmediatePropagation();
    if(activePanel&&key==='escape'){event.preventDefault();closePanel();return;}
    if(moveKeys.has(key)){
      event.preventDefault();if(!activePanel) keys.add(key);return;
    }
    if(event.repeat) return;
    const bar=hotbar.find(slot=>slot.key===key);
    if(bar){event.preventDefault();useSlot(bar.id);}
    else if(key==='v'){event.preventDefault();togglePerspective();}
    else if(key==='e'){event.preventDefault();interact();}
    else if(key==='m'&&(!activePanel||activePanel==='map')){event.preventDefault();showMap();}
    else if(key==='escape'&&!activePanel){event.preventDefault();showHelp();}
  }

  function keyup(event){
    const key=event.key.toLowerCase();
    if(moveKeys.has(key)&&keys.delete(key)){event.stopImmediatePropagation();persist();}
  }

  function walk(dt){
    const p=expedition.position;
    const right=keys.has('arrowright'),left=keys.has('arrowleft');
    const turning=keys.has('shift');
    if(turning) p.yaw=(p.yaw-dt*(Number(right)-Number(left))*1.85)%(Math.PI*2);
    const held=(key,arrow)=>Number(keys.has(key)||keys.has('touch:'+key)||arrow);
    const forward=held('w',keys.has('arrowup'))-held('s',keys.has('arrowdown'));
    const side=held('d',!turning&&right)-held('a',!turning&&left);
    const d=Math.hypot(forward,side);
    if(!d) return false;
    const lx=(Math.sin(p.yaw)*forward-Math.cos(p.yaw)*side)/d;
    const lz=(Math.cos(p.yaw)*forward+Math.sin(p.yaw)*side)/d;
    const flooded=dungeonCellAt(layout,p.x,p.z)?.flooded;
    const speed=diving?5.4:flooded?(state.look?.morph===5?6.3:3.05):4.85;
    const moving=advance(layout,p,lx*dt*speed,lz*dt*speed);
    if(moving) actorYaw=Math.atan2(lx,lz);
    return moving;
  }

  function discover(){
    const p=expedition.position,next=dungeonCellAt(layout,p.x,p.z);
    if(next===cell) return;
    cell=next;
    if(!cell) return;
    if(!visited.has(cell.index)){
      if(cell.zone==null)reveal(cell.index);
      else rooms.get(cell.zone).forEach(reveal);
    }
    field=dungeonDistanceField(layout,cell);
    const nextArea=diving?'Diving · '+layout.chambers[cell.zone]:cell.flooded?(state.look?.morph===5?'Swimming · Smuggler’s Channel':'Wading · Smuggler’s Channel'):cell.zone===null?'Connecting passages':layout.chambers[cell.zone];
    if(nextArea!==area){area=nextArea;zoneLabel.textContent=zoneName(layout,area);}
  }

  function drawTarget(){
    const target=activePanel?null:combatTarget(8.6);
    reticle.classList.toggle('on-target',Boolean(target));
    targetBadge.hidden=!target;
    if(!target) return;
    targetBadge.firstElementChild.textContent=target.kind==='guardian'?layout.guardian:target.name;
    const bar=targetBadge.lastElementChild;
    bar.max=dungeonFoes[target.kind].hp;bar.value=target.hp;
  }

  function fight(dt){
    const p=expedition.position;
    for(const enemy of enemies){
      enemy.group.visible=!defeated.has(enemy.id)&&distance(p,enemy)<21;
      if(!enemy.group.visible) continue;
      const before={x:enemy.x,z:enemy.z};
      enemy.move=false;
      if(moveEnemy(layout,enemy,p,field,dt,elapsed)){
        const amount=elapsed<guardUntil?Math.max(1,Math.floor(enemy.damage*.23)):enemy.damage;
        progress.health=Math.max(0,progress.health-amount);flashUntil=elapsed+.25;
        reportHealth();persist();
        if(progress.health<=0){collapse();return;}
      }
      enemy.group.position.set(enemy.x,channelBed(layout,dungeonCellAt(layout,enemy.x,enemy.z),enemy.x,enemy.z),enemy.z);
      const fx=enemy.move?enemy.x-before.x:p.x-enemy.x;
      const fz=enemy.move?enemy.z-before.z:p.z-enemy.z;
      enemy.group.rotation.y=Math.atan2(fx,fz);
      enemy.flap?.(elapsed+enemy.cell.index);
      enemy.body.position.y=Math.sin(elapsed*(enemy.move?9:3.1)+enemy.cell.index)*.064+(enemy.kind==='spirit'?.15:0);
      enemy.body.rotation.z=elapsed<enemy.blink?.16:enemy.windup?Math.sin(elapsed*31)*.074:0;
      enemy.warning.visible=Boolean(enemy.windup);
      if(enemy.warning.visible) enemy.warning.scale.setScalar(1+Math.sin(elapsed*20)*.14);
    }
  }

  function followCamera(position,direction,bodyY,dt){
    cameraGoal.set(-direction.x,-direction.z).multiplyScalar(3.83);
    cameraGoal.multiplyScalar(clearCameraArm(layout,position,cameraGoal));
    if(!following){
      cameraOffset.copy(cameraGoal);
      following=true;
    }else{
      const maxStep=dt*9;
      cameraStep.copy(cameraGoal).sub(cameraOffset).multiplyScalar(1-Math.exp(-dt*12));
      cameraStep.clampLength(0,maxStep).add(cameraOffset);
      if(clearCameraArm(layout,position,cameraStep)===1) cameraOffset.copy(cameraStep);
      else{
        // Pull back along the current sightline before swinging past a corner.
        cameraOffset.multiplyScalar(clearCameraArm(layout,position,cameraOffset));
        cameraOffset.setLength(Math.max(0,cameraOffset.length()-maxStep));
      }
    }
    const distance=cameraOffset.length();
    const open=T.MathUtils.smoothstep(distance,.30,1.85);
    const height=1.60+bodyY*.65+distance*.17+(1-open)*.95;
    const ahead=T.MathUtils.lerp(.15,3,open);
    const aimHeight=T.MathUtils.lerp(1.10,1.34,open)+bodyY*.65+lookHeight*T.MathUtils.lerp(.22,1,open);
    camera.position.set(position.x+cameraOffset.x,height,position.z+cameraOffset.y);
    cameraAim.set(position.x+direction.x*ahead,aimHeight,position.z+direction.z*ahead);
    camera.lookAt(cameraAim);
  }

  function view(dt,moving){
    const p=expedition.position;
    const direction={x:Math.sin(p.yaw),z:Math.cos(p.yaw)};
    const swimming=diving||cell?.flooded&&state.look?.morph===5;
    const ground=channelBed(layout,cell,p.x,p.z);
    const bodyY=diving?.72+Math.sin(elapsed*2.6)*.10:swimming?Math.max(ground,-.50)+Math.sin(elapsed*3)*.045:ground;
    if(progress.firstPerson){
      const eye=bodyY+(swimming?.99:1.44);
      eyeHeight=T.MathUtils.damp(eyeHeight??eye,eye,14,dt);
      camera.position.set(p.x,eyeHeight,p.z);
      camera.rotation.set(eyePitch,p.yaw+Math.PI,0,'YXZ');
      player.group.visible=false;
      const swing=Math.sin(Math.PI*T.MathUtils.clamp((strikeUntil-elapsed)/.27,0,1));
      const handWidth=Math.min(1,camera.aspect/1.12);
      world.blade.position.set((.237-swing*.35)*handWidth,-.26+swing*.06,-.53);
      world.blade.rotation.set(-.39-swing*.45,-.24,.19+swing*1.35+(guardUntil>elapsed?.52:0));
      reticle.classList.toggle('warded',guardUntil>elapsed);
    }else{
      followCamera(p,direction,bodyY,dt);
      player.group.visible=true;
    }
    const pitch=swimming?(moving?1.00:.55):0;
    player.model.rotation.x=T.MathUtils.damp(player.model.rotation.x,pitch,8,dt);
    player.group.position.set(p.x,bodyY,p.z);
    player.group.rotation.y=actorYaw;
    if(world.tide)world.tide.uniforms.time.value=elapsed;
    animate(player,elapsed,moving);
    world.lantern.position.set(p.x,2.34,p.z);
    world.wardRing.visible=elapsed<guardUntil;
    if(world.wardRing.visible) world.wardRing.position.set(p.x,.05,p.z);
    world.railPoint.visible=elapsed<bulletUntil;
    if(world.railPoint.visible){
      const phase=Math.max(0,1-(bulletUntil-elapsed)/.31);
      world.railPoint.position.lerpVectors(boltStart,boltEnd,phase);
      world.bolt.rotation.y+=dt*10;
    }
    world.strike.visible=elapsed<strikeUntil;
    if(world.strike.visible){
      world.strike.position.set(p.x,1.0,p.z);
      world.strike.rotation.set(-Math.PI/2,0,Math.PI/2-actorYaw-(strikeUntil-elapsed)*6);
    }
    for(const [i,art] of chestArts.entries()){
      art.group.visible=!expedition.opened.includes(layout.chests[i].id);
      art.mote.position.y=.81+Math.sin(elapsed*2.7+i)*.10;
      art.mote.rotation.y=elapsed*.94;
    }
    if(tower){
      tower.tower.visible=Boolean(progress.towers[layout.id]);
      tower.summit.rotation.y=elapsed*.8;
    }
    if(world.seal?.visible&&expedition.seal){
      world.seal.position.y=T.MathUtils.damp(world.seal.position.y,3.1,8,dt);
      if(world.seal.position.y>2.9) world.seal.visible=false;
    }
    for(const swirl of world.portals) swirl?.(elapsed);
    if(world.exitMarker){
      world.exitMarker.position.y=2.87+Math.sin(elapsed*3.0)*.12;
      world.exitMarker.scale.setScalar(1.02+Math.sin(elapsed*3.0)*.11);
    }
    world.bubbles?.(elapsed);
    for(const {actor,cell:home} of world.friends){
      const space=1.15*(1-T.MathUtils.smoothstep(Math.hypot(p.x-home.wx,p.z-home.wz),.55,2.4));
      // Slip alongside an approaching swimmer so the offering is visible over their shoulder.
      const offsetX=space*Math.cos(p.yaw)+.12*Math.sin(elapsed+home.index);
      const offsetZ=-space*Math.sin(p.yaw)+.10*Math.cos(elapsed+home.index);
      const pos=actor.group.position;
      pos.x=T.MathUtils.damp(pos.x,home.wx+offsetX,6,dt);
      pos.z=T.MathUtils.damp(pos.z,home.wz+offsetZ,6,dt);
      actor.group.rotation.y=Math.atan2(p.x-pos.x,p.z-pos.z);
      animate(actor,elapsed+home.index,false);
    }
    renderer.render(scene,camera);
  }

  function tick(now){
    if(closed) return;
    const dt=T.MathUtils.clamp((now-last)/1000,0,.075);
    last=now;
    const moving=!activePanel&&!dead&&walk(dt);
    if(!activePanel&&!dead){
      elapsed+=dt;discover();fight(dt);renderPrompt();drawTarget();
      if(!toast.hidden&&elapsed>=toastUntil) toast.hidden=true;
      shell.classList.toggle('underground-hit',elapsed<flashUntil);
      for(const {id,cooldown} of hotbar){
        const remain=Math.max(0,(cooldowns.get(id)??0)-elapsed);
        get('[data-underground="'+id+'"]').style.setProperty('--underground-recharge',String(remain/cooldown));
      }
    }
    paintMap();
    view(dt,moving);
    frame=requestAnimationFrame(tick);
  }

  window.addEventListener('keydown',keydown,{...listener,capture:true});
  window.addEventListener('keyup',keyup,{...listener,capture:true});
  window.addEventListener('blur',()=>{keys.clear();grabbed=null;persist();},listener);
  shell.addEventListener('click',event=>{
    const button=event.target.closest('[data-underground]');
    if(button) activate(button.dataset.underground,button);
  },listener);
  const canvas=renderer.domElement;
  canvas.addEventListener('contextmenu',event=>event.preventDefault(),listener);
  canvas.addEventListener('pointerdown',event=>{
    if(activePanel||dead) return;
    grabbed={id:event.pointerId,x:event.clientX,y:event.clientY,d:0};
    canvas.setPointerCapture(event.pointerId);
  },listener);
  canvas.addEventListener('pointermove',event=>{
    if(!grabbed||grabbed.id!==event.pointerId) return;
    const dx=event.clientX-grabbed.x,dy=event.clientY-grabbed.y;
    expedition.position.yaw=(expedition.position.yaw-dx*.0064)%(Math.PI*2);
    if(progress.firstPerson)eyePitch=T.MathUtils.clamp(eyePitch-dy*.005,-1.12,1.12);
    else lookHeight=T.MathUtils.clamp(lookHeight-dy*.014,-1.40,1.44);
    Object.assign(grabbed,{x:event.clientX,y:event.clientY,d:grabbed.d+Math.abs(dx)+Math.abs(dy)});
  },listener);
  canvas.addEventListener('pointerup',event=>{
    if(!grabbed||grabbed.id!==event.pointerId) return;
    if(grabbed.d<4&&event.pointerType==='mouse') useSlot('blade');
    grabbed=null;persist();
  },listener);
  canvas.addEventListener('pointercancel',()=>{grabbed=null;},listener);
  for(const button of shell.querySelectorAll('[data-underground-move]')){
    const key='touch:'+button.dataset.undergroundMove;
    button.addEventListener('pointerdown',event=>{
      if(activePanel||dead) return;
      event.preventDefault();button.setPointerCapture(event.pointerId);keys.add(key);
    },listener);
    for(const type of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(type,()=>{
      if(keys.delete(key)) persist();
    },listener);
  }
  applyPerspective();discover();paintMap();reportHealth();
  if(progress.health<=0) collapse();
  else shell.focus({preventScroll:true});
  frame=requestAnimationFrame(tick);
  return ()=>{
    if(closed) return;
    closed=true;options.abort();cancelAnimationFrame(frame);
    releaseBar();world.cleanup();shell.remove();
  };
}
