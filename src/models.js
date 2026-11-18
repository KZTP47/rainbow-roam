import * as T from 'three';
import {celMaterial,inkSilhouette} from './cel.js';

const palette = new Map();
const sphere = new T.SphereGeometry(1, 16, 12);
const softSphere = new T.SphereGeometry(1, 12, 8);
const lowSphere = new T.SphereGeometry(1, 9, 6);
const fineSphere = new T.SphereGeometry(1, 24, 16);
const cube = new T.BoxGeometry(1,1,1);
const diamond = new T.OctahedronGeometry(1);
const cyl = new T.CylinderGeometry(1,1,1,12);
const cone = new T.CylinderGeometry(.03,1,1,14);
const white = '#fff7e6';
const ink = '#33243d';

export function material(color, options) {
  if (options) return new T.MeshStandardMaterial({color, roughness:.86, ...options});
  if (!palette.has(color)) palette.set(color,celMaterial(color));
  return palette.get(color);
}

export function part(parent, shape, color, x,y,z,sx,sy,sz, rx=0,ry=0,rz=0) {
  const geometry = {sphere, soft:softSphere, low:lowSphere, fine:fineSphere, cube, diamond, cyl, cone}[shape];
  const mesh = new T.Mesh(geometry, typeof color === 'string' ? material(color) : color);
  mesh.position.set(x,y,z); mesh.scale.set(sx,sy,sz); mesh.rotation.set(rx,ry,rz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function branch(parent, color, start, end, radius, taper = 1) {
  const from = new T.Vector3(...start);
  const to = new T.Vector3(...end);
  const p = from.clone().add(to).multiplyScalar(.5);
  const twig = part(parent, taper === 1 ? 'cyl' : 'cone',color,p.x,p.y,p.z,radius,from.distanceTo(to),radius);
  twig.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),to.sub(from).normalize());
  return twig;
}

function eyes(parent, x,y,z, size, side = false) {
  for (const sign of [-1,1]) {
    const ex = x*sign;
    part(parent,'fine','#61405a',ex,y,z,size*(side?.76:1.12),size*1.25,size*.72,0,sign*.37);
    part(parent,'fine',ink,ex+sign*.005,y+.004,z+.033,size*.78,size*.96,size*.54,0,sign*.37);
    part(parent,'sphere','#ffffff',ex-sign*size*.21,y+size*.37,z+size*.47,size*.28,size*.31,size*.15);
    part(parent,'sphere','#f5b1bc',ex*1.19,y-size*.99,z-size*.05,size*.63,size*.3,size*.37,0,sign*.64);
  }
}

export function creature(spec) {
  const group = new T.Group();
  const model = new T.Group();
  group.add(model);
  const {kind,color,accent} = spec;
  const legs = [];
  const head = new T.Group();
  const tail = new T.Group();
  model.add(head,tail);
  if(kind==='belljelly'){
    head.position.y=.84;
    part(head,'fine',color,0,0,0,.48,.37,.46);
    part(head,'soft',accent,0,-.15,0,.48,.12,.45);
    part(head,'fine','#fff3de',-.12,.21,.19,.09,.035,.09,-.5);
    eyes(head,.16,.01,.40,.065);
    const frills=[];
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      const x=Math.sin(a)*.30,z=Math.cos(a)*.27;
      const strand=part(head,'soft',i%2?accent:color,x,-.39,z,.052,.23+(i%2)*.08,.061);
      frills.push(strand);
    }
    const pose=(time,moving)=>{
      const beat=time*(moving?4.5:2.7),pulse=Math.sin(beat);
      model.position.y=.26+.14*pulse;
      head.scale.set(1+.06*pulse,1-.10*pulse,1+.06*pulse);
      frills.forEach((f,i)=>{f.rotation.z=.24*Math.sin(beat+i*.7);f.rotation.x=.16*Math.cos(beat+i);});
    };
    inkSilhouette(model);return {group,model,legs,tail,head,kind,pose};
  }
  if (kind === 'unicorn') {
    part(model,'fine',color,0,.99,-.24,.5,.44,.7);
    part(model,'fine',color,0,1.25,.31,.35,.52,.35,-.24);
    part(model,'sphere','#ffdccb',0,1.05,.47,.25,.27,.2);
    head.position.set(0,1.61,.4);
    part(head,'fine',color,0,.07,.17,.44,.44,.4);
    part(head,'fine','#ffded5',0,-.105,.445,.342,.227,.265);
    eyes(head,.28,.083,.443,.107,true);
    for (const sign of [-1,1]) {
      part(head,'sphere','#aa6e78',sign*.114,-.09,.68,.024,.018,.014);
      part(head,'sphere',color,sign*.273,.42,.12,.116,.244,.1,-.15,0,sign*-.26);
      part(head,'sphere','#efa3b5',sign*.278,.438,.19,.056,.145,.045,-.15,0,sign*-.26);
    }
    const horn = part(head,'cone',material('#ffd177',{metalness:.28,roughness:.4}),0,.493,.38,.105,.44,.105,.28);
    for (let i=0;i<4;i++) {
      const ring = new T.Mesh(new T.TorusGeometry(.091-i*.018,.012,6,18),material('#fff3b1'));
      ring.rotation.x=Math.PI/2; ring.position.y=-.36+i*.182;
      ring.scale.set(1,1,2.6); horn.add(ring);
      ring.scale.x /= .105; ring.scale.y /= .105;
    }
    const mane = ['#f89db7',accent,'#ba9eea','#98dcc4','#ffd88c','#f5a0c7'];
    for (let i=0;i<8;i++) {
      part(head,'fine',mane[i%mane.length],-.28+Math.sin(i*.63)*.19,.27-i*.097,.27-i*.053,.135,.255,.119,.39,0,-.49+Math.sin(i)*.25);
    }
    for (let i=0;i<3;i++) part(head,'fine',mane[i],-.13+i*.113,.334,.412-i*.02,.11,.15,.145,.04,0,-.87);
    tail.position.set(0,1.17,-.79);
    for (let i=0;i<6;i++) part(tail,'sphere',mane[i],-.18+i*.064,-.18-Math.sin(i)*.07,-.31-i*.027,.109,.42,.13,.53,0,-.47+i*.09);
    for (const x of [-.29,.29]) for (const z of [-.59,.28]) {
      const leg = new T.Group(); leg.position.set(x,.91,z); model.add(leg); legs.push(leg);
      part(leg,'fine',color,0,-.37,0,.141,.44,.15);
      part(leg,'fine','#d8a7ab',0,-.741,.026,.15,.136,.157);
    }
  } else if(['silkskip','rollbud','pealfoot'].includes(kind)){
    let pose;
    if(kind==='silkskip'){
      part(model,'fine',color,0,.46,0,.33,.19,.59);
      head.position.set(0,.48,.36);
      part(head,'fine',color,0,0,.03,.33,.18,.26);eyes(head,.16,.05,.21,.059);
      const fins=[],ribbons=[];
      for(const side of [-1,1]){
        const fin=new T.Group();fin.position.set(side*.22,.47,-.04);model.add(fin);fins.push(fin);
        part(fin,'diamond',color,side*.37,0,-.08,.61,.095,.41,0,side*.29);
        part(fin,'diamond',accent,side*.72,.018,-.16,.30,.064,.17,0,side*.38);
        for(let j=0;j<3;j++)part(fin,'sphere',white,side*(.24+j*.13),.074,-.04-j*.034,.044,.018,.061);
        let parent=tail;
        for(let j=0;j<4;j++){
          const link=new T.Group();link.position.set(j?0:side*.12,j?0:.44,j?-.19:-.43);
          parent.add(link);part(link,'fine',j%2?accent:color,0,0,-.10,.074-j*.011,.037,.157);
          ribbons.push(link);parent=link;
        }
      }
      pose=(t,moving)=>{
        model.position.y=.55+.19*Math.sin(t*2.3);model.rotation.z=.12*Math.sin(t*1.7);
        fins.forEach((f,i)=>f.rotation.z=(i?1:-1)*(.12+.41*Math.sin(t*(moving?5:3.3))));
        ribbons.forEach((r,i)=>r.rotation.x=.26*Math.sin(t*4-i*.8));
      };
    }else if(kind==='rollbud'){
      part(model,'fine',color,0,.45,-.08,.40,.38,.61);
      head.position.set(0,.47,.44);part(head,'fine',color,0,0,.05,.28,.24,.33);
      part(head,'fine','#f0c598',0,-.04,.29,.18,.13,.23);part(head,'sphere',ink,0,-.012,.48,.064,.043,.043);
      eyes(head,.17,.06,.264,.054);
      const plates=[];
      for(let row=0;row<4;row++)for(const side of [-1,0,1]){
        const plate=part(model,'diamond',row%2?accent:'#a5b986',side*.25,.79-Math.abs(side)*.09-row*.021,.27-row*.21,.165,.14,.25,-.34,0,side*-.35);
        plates.push(plate);
      }
      tail.position.set(0,.42,-.56);
      for(let j=0;j<4;j++)part(tail,'diamond',j%2?accent:color,0,-j*.054,-j*.16,.23-j*.045,.17-j*.03,.25-j*.02);
      for(const x of [-.23,.23])for(const z of [-.34,.28]){
        const leg=new T.Group();leg.position.set(x,.32,z);model.add(leg);legs.push(leg);
        part(leg,'fine',color,0,-.11,.036,.11,.17,.14);
        for(const dx of [-.042,.034])part(leg,'cone',white,dx,-.218,.15,.025,.092,.025,1.42);
      }
      pose=(t,moving)=>{plates.forEach((p,i)=>p.rotation.x=-.34+.12*Math.sin(t*(moving?7:2)-Math.floor(i/3)*.8));tail.rotation.y=.43*Math.sin(t*3.7);};
    }else{
      part(model,'fine',color,0,.39,-.15,.46,.32,.42);head.position.set(0,.48,.15);
      part(head,'fine',color,0,0,.06,.41,.21,.31);
      const throat=part(head,'fine',accent,0,-.14,.23,.24,.13,.19);
      for(const side of [-1,1]){
        part(head,'sphere',color,side*.25,.18,.16,.15,.15,.14);
        part(head,'sphere',ink,side*.25,.20,.279,.081,.09,.038);
        part(head,'sphere',white,side*.25-.022,.225,.312,.027,.029,.012);
        part(model,'fine',color,side*.34,.24,-.27,.19,.19,.32,-.32,0,side*.26);
        for(const z of [-.38,.23])for(const n of [-1,0,1]){
          part(model,'fine',accent,side*(.34+n*.055),.086,z+.096,.034,.035,.15,0,n*.30);
        }
      }
      pose=(t,moving)=>{const hop=Math.max(0,Math.sin(t*(moving?6:2.4)));
        model.position.y=hop*hop*(moving?.47:.14);model.rotation.x=-hop*.18;
        throat.scale.y=.13+.093*(1+Math.sin(t*4));throat.scale.z=.19+.061*(1+Math.sin(t*4));};
    }
    inkSilhouette(model);return {group,model,legs,tail,head,kind,pose};
  } else if(kind==='snail'){
    part(model,'fine',color,0,.24,-.03,.38,.24,.73);
    part(model,'fine','#e3dba4',0,.14,.08,.36,.12,.64);
    part(model,'fine',accent,0,.66,-.21,.45,.49,.49);
    for(const side of [-1,1]){
      // Follow the curved surface of the shell so both profiles show a continuous spiral.
      const points=[];
      for(let i=0;i<=28;i++){
        const t=i/28,r=.035+t*.39,a=t*Math.PI*3.7;
        points.push(new T.Vector3(side*(.455*Math.sqrt(1-(r/.49)**2)),.66+r*Math.sin(a),-.21+r*Math.cos(a)));
      }
      model.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),32,.027,5,false),material('#f8cca2')));
    }
    for(let i=0;i<5;i++){
      const a=i*Math.PI*2/5;
      part(model,'fine','#fff2cd',.11*Math.cos(a),1.15,-.21+.11*Math.sin(a),.10,.05,.07,0,-a);
    }
    part(model,'sphere','#efb649',0,1.19,-.21,.064,.043,.064);
    head.position.set(0,.46,.46);
    part(head,'fine',color,0,.04,0,.285,.31,.266);
    eyes(head,.15,.064,.209,.062);
    for(const side of [-1,1]){
      branch(head,color,[side*.14,.20,.01],[side*.21,.48,.07],.036);
      part(head,'fine','#f3bf95',side*.21,.48,.07,.074,.08,.072);
    }
  } else if (kind === 'hare' || kind === 'fox') {
    const fox=kind==='fox';
    part(model,'fine',color,0,.48,-.15,.41,fox?.33:.42,fox?.62:.47);
    part(model,'fine',white,0,.4,.18,.3,.26,.25);
    head.position.set(0,fox?.69:.73,.23);
    part(head,'fine',color,0,.02,0,.431,.373,.369);
    part(head,'fine',accent,0,-.112,.261,.32,.181,.211);
    eyes(head,.223,.048,.289,.078);
    part(head,'sphere',ink,0,-.086,.461,.047,.034,.027);
    for (const sign of [-1,1]) {
      part(head,fox?'cone':'fine',color,sign*.235,fox?.33:.462,-.032,fox?.156:.116,fox?.36:.31,.106,0,0,sign*-.27);
      part(head,'fine','#efadc2',sign*.253,fox?.334:.482,.047,fox?.07:.057,fox?.09:.21,.052,0,0,sign*-.26);
    }
    tail.position.set(0,.54,-.51);
    part(tail,'fine',fox?color:accent,0,.12,fox?-.3:-.09,fox?.28:.22,fox?.264:.2,fox?.5:.235,-.37);
    if(fox) part(tail,'fine',accent,0,.2,-.63,.222,.225,.256,-.37);
    for (const x of [-.235,.235]) for (const z of [-.34,.24]) {
      const leg = new T.Group(); leg.position.set(x,.26,z); model.add(leg); legs.push(leg);
      part(leg,'fine',color,0,-.126,.035,.13,.145,.174);
    }
  } else if (kind==='gull'||kind==='crab') {
    const flying=kind==='gull';
    const wings=[];
    if(flying){
      part(model,'fine',color,0,.41,-.14,.25,.26,.44);
      head.position.set(0,.65,.21);
      part(head,'fine',color,0,.04,0,.214,.207,.198);
      eyes(head,.10,.053,.147,.045);
      part(head,'cone','#e7ad73',0,-.039,.276,.072,.211,.063,Math.PI/2);
      for(const s of [-1,1]){
        const wing=new T.Group();wing.position.set(s*.21,.49,-.11);model.add(wing);wings.push(wing);
        part(wing,'fine',color,s*.19,0,-.01,.296,.074,.173,0,0,s*.14);
        part(wing,'fine',accent,s*.385,.03,-.067,.242,.051,.133,0,s*.53,s*.19);
        part(wing,'fine',accent,s*.47,.03,-.13,.212,.043,.088,0,s*.64,s*.2);
        part(model,'fine','#e7ad73',s*.103,.145,.066,.053,.069,.103);
      }
      part(model,'fine',accent,0,.358,-.481,.162,.058,.229,.117);
    }else{
      part(model,'fine',color,0,.31,.014,.423,.252,.316);
      part(model,'fine',accent,0,.451,-.055,.317,.143,.255);
      head.position.set(0,.39,.203);
      for(const s of [-1,1]){
        branch(head,color,[s*.098,0,0],[s*.165,.19,.04],.041);
        part(head,'fine',ink,s*.165,.204,.067,.068,.068,.052);
        part(head,'sphere','#fff8eb',s*.157,.229,.098,.016,.018,.013);
        branch(model,color,[s*.25,.31,.152],[s*.48,.41,.337],.081);
        part(model,'fine',accent,s*.514,.44,.388,.13,.117,.149,0,0,s*.36);
        part(model,'cone',accent,s*.546,.452,.5,.088,.18,.076,1.4,0,s*.44);
        for(let i=0;i<3;i++){
          const foot=new T.Group();foot.position.set(s*.266,.234,-.197+i*.147);model.add(foot);legs.push(foot);
          branch(foot,color,[0,0,0],[s*.246,-.085,-.016],.039);
          branch(foot,accent,[s*.246,-.085,-.016],[s*.316,-.197,-.039],.032);
        }
      }
    }
    inkSilhouette(model);
    return {group,model,legs,tail,head,kind,wings,flying};
  } else if (['bee','moth','owl','dragon','mouse','hedgehog','turtle'].includes(kind)) {
    const flying=['bee','moth','owl'].includes(kind);
    const round=kind==='owl'||kind==='bee';
    const wide=kind==='turtle'||kind==='hedgehog';
    const base=round?.48:wide?.34:.43;
    part(model,'fine',color,0,base,-.21,wide?.48:.37,base*.85,round?.46:.56);
    head.position.set(0,base+(round?.29:.14),.28);
    const scale=kind==='turtle'?.67:1;
    head.scale.setScalar(scale);
    part(head,'fine',kind==='hedgehog'?accent:color,0,.025,0,.343,.305,.301);
    part(head,'fine',kind==='bee'?color:accent,0,-.105,.22,.243,.136,.148);
    eyes(head,.153,.056,.264,.067);
    if(kind==='owl'||kind==='dragon')
      part(head,'cone','#e9ad62',0,-.056,.32,.08,.17,.084,Math.PI/2);
    else part(head,'sphere',ink,0,-.059,.354,.042,.036,.03);
    const wings=[];
    for(const sign of [-1,1]) {
      if(flying||kind==='dragon') {
        const wing=new T.Group();
        wing.position.set(sign*.27,base+.13,-.32);
        model.add(wing); wings.push(wing);
        const wingShade=kind==='bee'?'#e2f3ee':accent;
        part(wing,'fine',wingShade,sign*.29,.089,.02,kind==='moth'?.38:.3,.07,.29,0,sign*.38,sign*.22);
        if(kind==='moth'||kind==='dragon') {
          part(wing,'fine',color,sign*.45,.137,-.03,.13,.045,.122);
          part(wing,'fine',wingShade,sign*.206,-.013,-.291,.257,.048,.214,0,sign*.27,sign*.27);
        }
      }
      if(kind==='bee'||kind==='moth') {
        branch(head,ink,[sign*.13,.22,-.04],[sign*.24,.46,-.04],.021);
        part(head,'sphere',accent,sign*.24,.46,-.04,.051,.059,.05);
      }
      if(kind==='mouse'||kind==='owl'||kind==='dragon') {
        const shape=kind==='mouse'?'fine':'cone';
        part(head,shape,color,sign*.251,.253,-.04,.128,.174,.081,0,0,sign*-.33);
        if(kind==='mouse') part(head,'fine','#edaaaa',sign*.255,.273,.031,.082,.1,.025);
      }
      if(!flying||kind==='owl') for(const z of wide?[-.43,.22]:[-.34,.14]) {
        const foot=new T.Group();
        foot.position.set(sign*(wide?.31:.23),.22,z); model.add(foot);legs.push(foot);
        part(foot,'fine',color,0,-.099,.029,.124,.128,.17);
      }
    }
    if(kind==='bee') for(const z of [-.47,-.22]) part(model,'fine',accent,0,base,z,.371,.367,.11);
    if(kind==='turtle') {
      part(model,'fine',accent,0,.454,-.225,.481,.294,.554);
      for(let i=0;i<6;i++){
        const a=i*Math.PI/3;
        part(model,'low',color,Math.cos(a)*.31,.646,-.225+Math.sin(a)*.34,.097,.063,.095,0,a);
      }
    }
    if(kind==='hedgehog') for(let i=0;i<22;i++){
      const a=i*2.39996, r=.11+(i%5)*.075;
      part(model,'cone',i%3?'#8f6456':'#c39577',Math.cos(a)*r,.63-r*.51,-.28+Math.sin(a)*r,.11,.24,.11,-.39,0,Math.cos(a)*-.47);
    }
    if(kind==='mouse'||kind==='dragon') {
      tail.position.set(0,.27,-.59);
      for(let i=0;i<6;i++) part(tail,'sphere',i===5?accent:color,i*.062,.01+i*i*.007,-i*.088,.096-i*.008,.089-i*.009,.105-i*.008);
    }
    inkSilhouette(model);
    return {group,model,legs,tail,head,kind,wings,flying};
  } else {
    const flying = kind==='sprite';
    part(model,'fine',color,0,.3,-.19,.35,.267,.6);
    head.position.set(0,.415,.217);
    part(head,'fine',color,0,.026,0,.482,.342,.34);
    part(head,'fine','#ffd8ea',0,-.102,.265,.29,.128,.14);
    eyes(head,.229,.061,.276,.079);
    for (const sign of [-1,1]) for (let i=0;i<3;i++) {
      const wing=part(head,'fine',i===1?accent:color,sign*(.46+i*.083),.15+i*.108,-.12-i*.035,.094,.2-i*.029,.067,0,0,sign*(-.83+i*.29));
      if (flying) wing.scale.multiplyScalar(1.2);
    }
    tail.position.set(0,.33,-.58);
    part(tail,'fine',accent,0,.035,-.28,.11,.16,.37,.31);
    for (const x of [-.34,.34]) for (const z of [-.35,.24]) {
      const leg = new T.Group(); leg.position.set(x,.18,z); model.add(leg); legs.push(leg);
      part(leg,'fine',color,0,-.08,.026,.118,.084,.156);
    }
  }
  inkSilhouette(model);
  return {group, model, legs, tail, head, kind};
}

export function person(colors, lead=false, variant=0, look=null) {
  const [skin,coat,hair]=colors;
  const group=new T.Group();
  const model=new T.Group(); group.add(model);
  const head=new T.Group(); head.position.y=1.66; model.add(head);
  const legs=[], arms=[];
  part(model,'fine',coat,0,1.02,0,.309,.43,.236);
  part(model,'fine',lead?'#f0ac81':'#fff4db',0,1.23,.158,.263,.11,.147);
  part(model,'fine',lead?'#f5bb8a':'#efe0b5',0,.985,.226,.136,.164,.047);
  part(model,'sphere','#f5c881',0,1.066,.271,.035,.035,.021);
  if (lead) {
    part(model,'fine','#cb895f',0,1.03,-.299,.266,.32,.192);
    part(model,'fine','#f0bb71',0,1.121,-.446,.238,.154,.058);
    part(model,'sphere','#954e54',0,.996,-.493,.047,.076,.021);
  }
  part(head,'fine',hair,0,.088,-.089,.351,.371,.32);
  part(head,'fine',skin,0,0,.075,.316,.309,.298);
  part(head,'sphere',skin,0,-.028,.375,.055,.044,.039);
  eyes(head,.13,.045,.34,.046);
  part(head,'sphere','#ab5b67',0,-.113,.348,.043,.013,.018);
  for (const sign of [-1,1]) {
    part(head,'sphere',skin,sign*.31,-.01,.05,.064,.095,.055);
    part(head,'fine',hair,sign*.222,.202,.156,.16,.157,.203,0,0,sign*.46);
    const arm=new T.Group(); arm.position.set(sign*.285,1.246,0); model.add(arm); arms.push(arm);
    part(arm,'fine',coat,sign*.047,-.21,0,.116,.233,.118,0,0,sign*.13);
    part(arm,'sphere',skin,sign*.069,-.416,.013,.086,.094,.089);
    const leg=new T.Group(); leg.position.set(sign*.128,.778,0); model.add(leg); legs.push(leg);
    part(leg,'fine',lead?'#625c82':'#665570',0,-.27,0,.105,.302,.105);
    part(leg,'fine','#684857',0,-.63,.052,.134,.137,.195);
    part(leg,'fine','#e9bf9a',0,-.708,.073,.134,.037,.187);
  }
  const style=look?.style??variant%3;
  if (style===1) {
    part(head,'fine',hair,.09,.329,-.157,.198,.174,.173);
  } else if (style===2) {
    for(const side of [-1,1]) for(let i=0;i<4;i++){
      part(head,'fine',i===3?coat:hair,side*(.303-i*.015),.064-i*.135,-.094,.103-i*.009,.112,.12,0,0,side*.12);
    }
  } else if (style===3) {
    for(let i=0;i<9;i++){
      const angle=.21+i*.377;
      part(head,'fine',hair,Math.cos(angle)*.28,.124+Math.sin(angle)*.223,.139,.119,.129,.125);
    }
  }
  const accessory=look?.accessory??(variant%3===0?0:variant%3===1?2:3);
  if (accessory===0) {
    const hat=lead?'#e3a970':'#efd49d';
    part(head,'fine',hat,0,.337,.013,.46,.072,.418,.045,0,-.077);
    part(head,'fine',hat,0,.432,-.007,.326,.164,.286,.02,0,-.077);
    part(head,'fine',lead?'#c7677d':coat,0,.361,.003,.334,.054,.297,.03,0,-.075);
    part(head,'sphere','#ffe391',.292,.411,.158,.047,.051,.033);
  } else if (accessory===1) {
    for(let i=0;i<9;i++){
      const angle=i*Math.PI*2/9;
      part(head,'fine',['#fec0ba','#fff0a5','#bd9ce8'][i%3],Math.cos(angle)*.325,.311+Math.sin(angle)*.022,Math.sin(angle)*.28,.075,.059,.073);
    }
  } else if (accessory===2) {
    part(head,'diamond','#ffe58c',-.255,.234,.258,.077,.08,.028);
    part(head,'sphere','#fff5bf',-.255,.234,.285,.031,.033,.012);
  }
  inkSilhouette(model);
  return {group,model,head,legs,arms,kind:'person'};
}

export function animate(model,t,moving) {
  const pace = moving? 10 : 2.9;
  const phase=t*pace;
  model.model.position.y=((model.kind==='sprite'||model.flying)?.49+Math.sin(t*2.7)*.15:0) + (moving?Math.abs(Math.sin(phase))*.082:Math.sin(t*2.6)*.022);
  for (let i=0;i<model.legs.length;i++) {
    const sign=model.legs.length===2?(i===0?1:-1):(i===0||i===3?1:-1);
    model.legs[i].rotation.x= Math.sin(phase)*sign*(moving?.52:.035);
  }
  model.arms?.forEach((arm,i) => {
    arm.rotation.x=Math.sin(phase)*(i===0?-1:1)*(moving?.46:.051);
    arm.rotation.z=i===0?-.065:.065;
  });
  model.wings?.forEach((wing,i)=>{wing.rotation.z=Math.sin(t*(model.kind==='bee'?24:11))*(i===0?.52:-.52);});
  if(model.tail) model.tail.rotation.y=Math.sin(t*4.5)*.22;
  model.head.rotation.z=Math.sin(t*1.65)*.042;
  model.pose?.(t,moving);
  if(model.expression){
    const {face,open,closed}=model.expression;
    face.material=Math.abs(t%4.17-3.88)<.075?closed:open;
  }
}

export function buildPiece(type) {
  const g=new T.Group();
  const box=(color,x,y,z,sx,sy,sz)=>part(g,'cube',color,x,y,z,sx,sy,sz);
  if(type==='plank') {
    for(let i=0;i<4;i++) box(['#b77b51','#ce9562','#d6a374','#c0875b'][i],0,.146+i*.3,0,1.18,.286,1.18);
  } else if(type==='brick') {
    box('#a2a2b1',0,.6,0,1.19,1.2,1.19);
    for(let i=0;i<3;i++) {
      box(i%2?'#c0baca':'#b3afc6',0,.2+i*.4,.604,1.153,.357,.028);
      box('#9c99ae',.608,.2+i*.4,0,.025,.356,1.16);
      box('#8d8d9f',i%2?.22:-.22,.2+i*.4,.621,.022,.36,.014);
    }
  } else if(type==='fence') {
    for(const x of [-.49,.49]) box('#b07a55',x,.50,0,.16,1.0,.16);
    for(const y of [.37,.72]) box('#dbac7c',0,y,0,1.15,.12,.13);
  } else if(type==='lantern') {
    box('#9d734f',0,.09,0,.49,.17,.49);
    box('#9d734f',0,.47,0,.105,.81,.105);
    part(g,'diamond',material('#ffd181',{emissive:'#f6a856',emissiveIntensity:.45}),0,.94,0,.28,.36,.28);
    part(g,'cone','#a66074',0,1.192,0,.33,.24,.33);
  } else if(type==='planter') {
    box('#9f7154',0,.17,0,1.07,.34,.69);
    box('#694e45',0,.347,0,1.0,.035,.61);
    for(let i=0;i<8;i++) {
      const x=(i%4-1.5)*.225,z=i<4?-.17:.17,y=.55+.12*(i%3);
      branch(g,'#5e955f',[x,.32,z],[x,y,z],.023);
      part(g,'fine',['#f5a1ac','#f6cf67','#ae93e1'][i%3],x,y,z,.116,.071,.116);
    }
  } else if(type==='roof') {
    for(let i=0;i<5;i++) box(['#b86a82','#c37b91'][i%2],0,.12+i*.18,.48-i*.22,1.193,.235,.245);
  } else if(type==='stool') {
    for(const x of [-.43,.43]) for(const z of [-.21,.21]) box('#a46d50',x,.23,z,.13,.46,.14);
    box('#d59b64',0,.49,0,1.14,.105,.58);
    box('#d59b64',0,.76,-.25,1.14,.21,.08);
  }
  else if(type==='stoolpet') {
    for(const x of [-.32,.32]) for(const z of [-.29,.29]) box('#86605a',x,.18,z,.13,.36,.13);
    part(g,'fine','#ba8cac',0,.405,0,.55,.16,.43);
    part(g,'fine','#ffb9cc',0,.52,0,.49,.118,.38);
  } else if(type==='mushroomlamp') {
    part(g,'cyl','#edcfaa',0,.39,0,.085,.74,.085);
    part(g,'fine','#dd8162',0,.83,0,.48,.239,.48);
    part(g,'fine',celMaterial('#ffe6a4',{emissive:'#fbb46a',emissiveIntensity:.54}),0,.739,0,.39,.052,.391);
    for(let i=0;i<5;i++) part(g,'fine','#ffe1b5',Math.cos(i*1.25)*.31,.999,Math.sin(i*1.25)*.31,.055,.018,.055);
  } else if(type==='windchime') {
    box('#786164',-.43,.52,0,.086,1.04,.086);
    box('#a57666',-.08,1.05,0,.77,.084,.086);
    for(let i=0;i<4;i++){
      const x=i*.163-.335;
      box('#86748a',x,.86,0,.017,.35,.017);
      part(g,'cyl',['#b1abed','#8cc8d2'][i%2],x,.64+i*.047,0,.055,.26,.055);
    }
  } else if(type==='shellmosaic') {
    box('#709791',0,.05,0,1.16,.105,1.16);
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6;
      part(g,'fine',i%2?'#f1bdac':'#e3eccb',Math.cos(a)*.374,.109,Math.sin(a)*.374,.14,.037,.072,0,-a);
    }
    part(g,'diamond','#f4d086',0,.12,0,.157,.094,.157);
  } else if(type==='honeybox') {
    box('#826154',0,.21,0,.57,.42,.47);
    for(let i=0;i<4;i++) box(i%2?'#e4ac56':'#e8be72',0,.38+i*.12,0,.86,.106,.62);
    part(g,'cone','#ad7067',0,.88,0,.61,.44,.51,0,Math.PI/4);
    box('#57434e',0,.47,.32,.19,.08,.02);
  } else if(type==='pennant') {
    box('#9a6557',-.42,.6,0,.075,1.2,.071);
    for(let i=0;i<4;i++){
      const x=i*.225-.31;
      part(g,'cone',['#dc8a9e','#e6bd77','#9fa8d7','#82c4ae'][i],x,1.01-i*.096,0,.136,.3,.035,Math.PI);
    }
    branch(g,'#af8779',[-.42,1.15,0],[.51,.755,0],.023);
  } else if(type==='springpot') {
    part(g,'cyl','#638f83',0,.24,0,.115,.44,.115);
    part(g,'fine','#98bdac',0,.52,0,.492,.145,.492);
    part(g,'fine','#61c6ca',0,.598,0,.398,.072,.398);
    part(g,'low','#e0d6af',.19,.673,.078,.118,.064,.09);
  } else if(type==='moonjar') {
    part(g,'fine','#ad9bd4',0,.385,0,.307,.368,.307);
    part(g,'cyl','#62547f',0,.692,0,.187,.095,.187);
    const glow=celMaterial('#fff29b',{emissive:'#ffdd81',emissiveIntensity:.62});
    for(let i=0;i<7;i++) part(g,'diamond',glow,Math.cos(i*2.4)*.245,.31+(i%4)*.095,Math.sin(i*2.4)*.25,.042,.048,.041);
  }
  return g;
}



