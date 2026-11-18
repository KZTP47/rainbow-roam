import * as T from 'three';
import {material,part} from './models.js';
import {celMaterial} from './cel.js';

const wallStyles={
  prism:'leaded',crates:'planks',herbs:'garden',shells:'alcove',water:'basin',loom:'woven',
  kiln:'tiles',pots:'tiles',kite:'woven',lantern:'leaded',bells:'arched',anvil:'arched',
  folios:'library',press:'planks',hives:'tiles',orrery:'celestial',chart:'celestial',bunks:'planks'
};

const metal='#c99557', dark='#594857', light='#f8e1b3';
const water=celMaterial('#8bcaca',{emissive:'#548fa2',emissiveIntensity:.36});
const shine=celMaterial('#f4d994',{emissive:'#e6a754',emissiveIntensity:.64});

export function workpiece(root,room,[kind,x,z,w,d]){
  const scene=new T.Group();
  scene.position.set(x,0,z);
  scene.rotation.y=x<0?Math.PI/3:-Math.PI/3;
  root.add(scene);
  const wood=room.joinery,palette=[room.stockAccent,room.roof,light];
  const shape=(type,color,px,y,pz,sx,sy,sz,rx=0,ry=0,rz=0)=>
    part(scene,type,color,px,y,pz,sx,sy,sz,rx,ry,rz);
  const box=(color,px,y,pz,sx,sy,sz)=>shape('cube',color,px,y,pz,sx,sy,sz);
  const stand=(y,tone=wood)=>{
    box(tone,0,y,0,w*.92,.10,d*.83);
    for(const a of [-1,1]) for(const b of [-1,1]) box(wood,a*w*.35,y*.46,b*d*.29,.13,y*.95,.13);
  };
  const bars=(width=.83,y=.70,height=.86)=>{
    for(const side of [-1,1]) box(wood,side*width/2,y+height*.49,-.10,.085,height,.10);
    box(wood,0,y+height,-.10,width+.16,.10,.11);
  };
  switch(kind){
    case 'prism':
      stand(.71);
      box(dark,0,.82,0,.94,.12,.57);
      for(const [i,color] of palette.entries())
        shape('diamond',color,(i-1)*.31,1.00+Number(i===1)*.10,.02,.13,.20,.10,0,.14,i*.22);
      break;
    case 'crates':
      stand(.53);
      for(const [i,color] of palette.entries()){
        box(wood,(i-1)*.38,.73,0,.35,.34,.44);
        box(color,(i-1)*.38,.912,0,.29,.06,.35);
        box(light,(i-1)*.38,.76,.229,.12,.08,.017);
      }
      break;
    case 'herbs':
      stand(.69);
      for(const [i,color] of palette.entries()){
        const px=(i-1)*.33;
        shape('cyl',wood,px,.79,0,.12,.16,.116);
        for(let j=-1;j<=1;j++)
          shape('soft',j===0?color:'#7ba578',px+j*.055,.96-Math.abs(j)*.04,0,.043,.116,.036,0,0,j*.32);
      }
      break;
    case 'shells':
      stand(.64,'#b08497');
      for(const [i,color] of palette.entries()){
        const xx=(i-1)*.35;
        shape('cyl',metal,xx,.72,.04,.145,.046,.14);
        for(let j=-2;j<=2;j++)
          shape('soft',color,xx+j*.032,.789+.026*(2-Math.abs(j)),.06,.045,.095,.064,0,0,-j*.19);
      }
      break;
    case 'water':
      stand(.47);
      for(const [i,y] of [.58,.83,1.08].entries()){
        const xx=(i-1)*.30;
        shape('cyl',dark,xx,y-.10,0,.063,.30+i*.13,.063);
        shape('cyl',metal,xx,y,0,.153,.10,.142);
        shape('cyl',water,xx,y+.057,0,.129,.019,.12);
      }
      break;
    case 'loom':
      stand(.58);
      bars(.94,.61,.91);
      box(room.roof,0,.99,-.04,.87,.65,.042);
      for(let i=-4;i<=4;i++) box(i%2?light:room.stockAccent,i*.098,.99,.002,.031,.67,.018);
      box(metal,0,.85,.045,.96,.097,.05);
      break;
    case 'kiln':
      for(const y of [.15,.34,.53,.72]) shape('cyl',y===.53?metal:'#bf8065',0,y,0,.49,.19,.39);
      shape('soft','#c5856d',0,.85,0,.49,.27,.39);
      shape('cyl',wood,0,1.08,0,.16,.20,.15);
      box(dark,0,.45,.386,.47,.42,.045);
      shape('soft',shine,0,.43,.424,.15,.109,.036);
      break;
    case 'pots':
      stand(.63);
      for(const [i,color] of palette.entries()){
        const xx=(i-1)*.34,h=i===1?.23:.15;
        shape('soft',color,xx,.75+h*.36,0,.135,h,.134);
        shape('cyl',metal,xx,.77+h,0,.105,.038,.105);
        shape('cyl',dark,xx,.80+h,0,.043,.032,.043);
      }
      break;
    case 'kite':
      stand(.56);
      bars(.91,.59,.99);
      for(const [i,color] of palette.entries()){
        const xx=(i-1)*.29,tilt=i*.13-.13;
        shape('diamond',color,xx,1.17,.03,.19,.30,.05,0,0,tilt);
        shape('cube',metal,xx,.90,.07,.042,.27,.036,0,0,-tilt);
        shape('cube',color,xx+.047,.774,.075,.121,.044,.035,0,0,i*.32);
      }
      break;
    case 'lantern':
      stand(.58);
      for(const [i,color] of [room.roof,shine,room.stockAccent].entries()){
        const xx=(i-1)*.28;
        box(wood,xx,.68,0,.21,.092,.23);
        box(color,xx,.84,0,.15,.24,.16);
        shape('cone',metal,xx,1.01,0,.17,.16,.14);
        box(dark,xx,1.12,0,.061,.075,.059);
      }
      break;
    case 'bells':
      stand(.53);
      bars(1.09,.56,1.04);
      for(const i of [-1,0,1]){
        const xx=i*.32,r=.107+(i+1)*.018;
        box(dark,xx,1.46,0,.042,.29,.041);
        shape('cone',metal,xx,1.17,0,r,.25+i*.062,r);
        shape('cyl',i===0?light:'#935d46',xx,1.04-i*.025,0,r*1.05,.067,r*1.05);
      }
      break;
    case 'anvil':
      stand(.54);
      box(dark,0,.62,0,.51,.084,.32);
      box('#818093',0,.79,0,.30,.34,.28);
      box('#a3a0a2',-.13,.99,0,.65,.155,.30);
      shape('cone','#a3a0a2',.30,1,0,.143,.39,.143,0,0,-Math.PI/2);
      box(metal,-.53,.63,.12,.17,.046,.14);
      break;
    case 'folios':
      stand(.60);
      for(const [i,color] of palette.entries()){
        const yy=.69+i*.095;
        shape('cube',color,-.37,yy,0,.36,.065,.31,0,i*.24);
        shape('cube',light,-.37,yy+.035,0,.30,.035,.26,0,i*.24);
      }
      for(const side of [-1,1]){
        shape('cube',light,.28+side*.12,.80,0,.25,.046,.36,-.19,0,side*.15);
        for(const zz of [-.1,-.04,.02,.08])
          shape('cube',wood,.28+side*.12,.827+zz*.19,zz,.16,.011,.016,-.19,0,side*.15);
      }
      break;
    case 'press':
      stand(.48);
      bars(.84,.52,1.0);
      shape('cyl',wood,0,.77,0,.29,.46,.27);
      for(let i=0;i<9;i++){
        const a=i*Math.PI*2/9;
        shape('cube',metal,.275*Math.sin(a),.76,.256*Math.cos(a),.055,.43,.043,0,a);
      }
      shape('cyl',dark,0,1.22,0,.052,.46,.051);
      box(metal,0,1.36,.013,.7,.071,.095);
      break;
    case 'hives':
      stand(.58);
      for(const [i,color] of palette.entries()){
        const xx=(i-1)*.40;
        box(color,xx,.81,0,.35,.35,.37);
        box(wood,xx,1.018,0,.39,.10,.40);
        box(dark,xx,.773,.193,.21,.053,.03);
      }
      break;
    case 'orrery': {
      stand(.53);
      shape('cyl',metal,0,.75,0,.07,.43,.073);
      const ring=new T.Mesh(new T.TorusGeometry(.32,.031,6,24),material(metal));
      ring.position.set(0,1.08,0);ring.rotation.set(.42,.36,0);scene.add(ring);
      shape('cyl',room.roof,0,1.10,0,.11,.73,.10,.33,0,-1.04);
      shape('cyl',shine,.29,1.28,.07,.128,.078,.11,.33,0,-1.04);
      break;
    }
    case 'chart':
      stand(.59);
      shape('cube',dark,0,1.02,0,.96,.73,.07,-.29);
      shape('cube',light,0,1.02,.045,.83,.61,.035,-.29);
      for(const [i,[xx,dy]] of [[-.27,-.14],[-.13,.05],[.03,-.05],[.17,.11],[.30,.21]].entries()){
        shape('diamond',palette[i%3],xx,1.02+dy,.077-dy*.29,.048,.047,.030);
      }
      break;
    case 'bunks':
      for(const dx of [-.54,.54]) for(const dz of [-.37,.37]) box(wood,dx,.70,dz,.10,1.40,.12);
      for(const [i,y] of [.43,1.10].entries()){
        box(wood,0,y,0,w*.87,.13,d*.73);
        box(palette[i],0,y+.12,0,w*.78,.13,d*.67);
        box(light,-.34,y+.20,-.07,.38,.10,.40);
      }
      break;
  }
  const finished=new T.Group();
  finished.visible=false;
  scene.add(finished);
  if(kind==='prism'){
    // A frosted inlay catches the prism's final color across the work surface.
    const beam=part(finished,'cube',water,0,.895,.20,.075,.014,.41);
    const spot=part(finished,'diamond',shine,0,.89,.36,.151,.024,.10);
    beam.castShadow=spot.castShadow=false;
  }
  if(kind==='lantern'||kind==='orrery'||kind==='kiln'){
    const spark=part(finished,'soft',shine,0,kind==='orrery'?1.09:.91,.17,.14,.093,.14);
    spark.castShadow=false;
  }
  const marker=shape('diamond',shine,0,1.65,0,.082,.109,.081);
  marker.castShadow=false;
  marker.visible=false;
  return (time,steps)=>{
    finished.visible=marker.visible=steps===room.activity.steps.length;
    if(!marker.visible) return;
    marker.position.y=1.68+Math.sin(time*2.7)*.075;
    marker.rotation.y=time*1.35;
  };
}

export function regionalPanel(panel,room,length,back){
  const style=wallStyles[room.feature];
  const trim=room.joinery,a=room.stockAccent,b=room.roof;
  const box=(color,x,y,z,w,h,d,roll=0)=>part(panel,'cube',color,x,y,z,w,h,d,0,0,roll);
  const gem=(color,x,y,w,h,roll=0,z=.207)=>part(panel,'diamond',color,x,y,z,w,h,.024,0,0,roll);
  const dist=length*.15;
  box(b,0,.69,.145,length,.55,.04);
  box(trim,0,.92,.171,length,.07,.051);
  box(light,0,1.14,.154,length,.041,.041);
  for(let i=-2;i<=2;i++){
    const x=i*dist;
    if(style==='tiles'||style==='leaded'){
      for(let j=-1;j<=1;j++) gem((i+j)%2?a:light,x+j*.115,.67+Math.abs(j)*.038,.064,.083,Math.PI/4);
    }else if(style==='woven'||style==='library'){
      for(let j=-1;j<=1;j++) box(j===0?a:light,x+j*.10,.66,.181,.042,.28,.028,j*.25);
    }else{
      box(trim,x,.68,.179,.075,.53,.040);
      box(a,x,.82,.20,.045,.18,.024);
    }
  }
  if(!back) return;
  const wing=length*.28;
  const glass=style==='garden'||style==='basin'?water:shine;
  if(style==='celestial'){
    box(trim,0,1.20,.171,1.35,.70,.074);
    box(b,0,1.2,.217,1.24,.61,.04);
    for(const [i,[x,y]] of [[-.47,1.12],[-.26,1.27],[0,1.11],[.19,1.37],[.45,1.44]].entries()){
      gem(shine,x,y,.031+i*.009,.044+i*.005,0,.253);
      box(a,x,y,.246,.055,.018,.018,i*.46);
    }
  }else if(style==='arched'||style==='alcove'||style==='basin'){
    for(const x of [-.54,.54]){
      box(trim,x,1.17,.181,.71,.67,.061);
      box(glass,x,1.16,.218,.56,.54,.044);
      part(panel,'soft',trim,x,1.47,.202,.36,.15,.051);
      part(panel,'soft',glass,x,1.445,.223,.275,.113,.044);
      box(trim,x,1.16,.247,.038,.58,.041);
    }
  }else if(style==='library'){
    for(const x of [-.39,.39]){
      box(trim,x,1.19,.181,.65,.64,.083);
      for(let j=0;j<4;j++){
        box(j%2?a:light,x-.22+j*.141,1.16,.234,.092,.38+(j%3)*.037,.058,j%2?.12:-.04);
      }
      box(trim,x,.96,.26,.65,.058,.09);
    }
  }else{
    box(trim,0,1.21,.181,1.32,.63,.081);
    for(let i=-2;i<=2;i++){
      const x=i*.232;
      if(style==='leaded') gem(i%2?glass:a,x,1.21,.105,.25,0,.235);
      else box(i%2?glass:light,x,1.21,.23,.192,.477,.048);
    }
    if(style!=='leaded') box(trim,0,1.22,.257,1.21,.043,.037);
  }
  for(const x of [-wing,wing]){
    box(trim,x,1.51,.18,.61,.063,.075);
    box(style==='woven'?a:b,x,1.23,.176,.48,.51,.041);
    if(style==='woven'||style==='planks'){
      for(let j=-2;j<=2;j++) box(j%2?light:a,x+j*.074,1.23,.207,.031,.44,.034);
    }else{
      gem(a,x,1.26,.14,.17,Math.PI/4);
      gem(light,x,1.26,.075,.092,Math.PI/4,.224);
    }
  }
}

export function regionalCarpet(root,room){
  const boards=(color,x,z,w,d,angle=0)=>
    part(root,'cube',color,x,.022,z,w,.034,d,0,angle).castShadow=false;
  const [tone,accent]=[room.rug,room.stockAccent];
  const length=room.depth*.75;
  if(room.carpet==='ring'){
    const circular=(color,r,y)=>{
      const mat=material(color);
      const disk=new T.Mesh(new T.CircleGeometry(r,32).rotateX(-Math.PI/2),mat);
      disk.position.set(0,y,.28);disk.receiveShadow=true;root.add(disk);
    };
    circular(tone,1.03,.024);circular(light,.91,.025);circular(tone,.86,.026);
    for(let i=0;i<7;i++){
      const radians=i*Math.PI*2/7;
      boards(accent,Math.cos(radians)*.68,Math.sin(radians)*.68+.28,.13,.13,Math.PI/4-radians);
    }
    return;
  }
  if(room.carpet==='stripes'){
    boards(tone,0,.12,1.73,length);
    for(let i=-3;i<=3;i++) boards(i%2?accent:light,0,i*.43+.12,1.63,.063);
    return;
  }
  if(room.carpet==='patch'){
    for(let row=0;row<4;row++) for(let col=0;col<3;col++)
      boards([tone,accent,light][(row+2*col)%3],(col-1)*.57,(row-1.5)*.51+.23,.551,.491);
    return;
  }
  const runner=room.carpet==='runner';
  boards(tone,0,runner?.08:.13,runner?1.12:1.92,runner?length:2.48);
  if(runner){
    for(const side of [-1,1]) boards(light,side*.47,.08,.035,length-.19);
    for(let i=-2;i<=2;i++) boards(accent,0,i*.52,.19,.19,Math.PI/4);
  }else{
    for(const [x,z,s] of [[.48,.74,.15],[-.36,-.71,.12],[.46,-.37,.22],[-.59,.43,.17],[-.08,.02,.27]]){
      boards(light,x,z,s,.034);
      boards(accent,x,z,.030,s);
    }
  }
}
