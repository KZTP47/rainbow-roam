import * as T from 'three';
import {human} from './human.js';
import {wardrobe,outfitColors} from './wardrobe.js';
import {part,material,branch} from './models.js';
import {celMaterial} from './cel.js';

const hoop=new T.TorusGeometry(1,.055,10,40);
const heart=new T.Shape();
heart.moveTo(0,-1);
heart.bezierCurveTo(-2,.31,-.72,1.61,0,.62);
heart.bezierCurveTo(.72,1.61,2,.31,0,-1);
const heartGeo=new T.ShapeGeometry(heart,24);
const ink='#4b3547';

function teddy(look){
  const fur=wardrobe.fur.choices[look.fur??0][1];
  const coat=wardrobe.coat.choices[look.coat][1];
  const soft=new T.Color(fur).lerp(new T.Color('#ffe9cc'),.69).getStyle();
  const group=new T.Group(),model=new T.Group(),head=new T.Group();
  const arms=[],legs=[];
  group.add(model);model.add(head);head.position.set(0,1.49,.009);
  part(model,'fine',fur,0,.82,0,.43,.57,.32);
  part(model,'fine',look.toy===2?coat:soft,0,.83,.259,.297,.34,.086);
  part(head,'fine',fur,0,.06,0,.512,.434,.357);
  for(const side of [-1,1]){
    const upright=look.ears===1;
    const xx=side*(look.ears===2?.35:.385),yy=look.ears===2?.29:.361;
    part(head,'fine',fur,xx,yy,-.014,.185,upright?.249:.177,.108,0,0,side*.22);
    part(head,'fine',soft,xx,yy+.01,.071,.11,upright?.157:.111,.046,0,0,side*.22);
    part(head,'fine',ink,side*.164,.053,.324,.046,.059,.026);
    part(head,'sphere','#fff0df',side*.164-.013,.077,.349,.013,.015,.008);
    part(head,'fine','#eab5b1',side*.271,-.048,.295,.064,.033,.018,0,side*.24);
    const arm=new T.Group(), leg=new T.Group();
    arm.position.set(side*.36,1.01,0);leg.position.set(side*.205,.51,0);
    model.add(arm,leg);arms.push(arm);legs.push(leg);
    part(arm,'fine',fur,side*.065,-.185,0,.157,.32,.152,0,0,side*.13);
    part(arm,'fine',soft,side*.067,-.34,.109,.084,.112,.045);
    part(leg,'fine',fur,side*.017,-.203,.015,.162,.268,.155);
    part(leg,'fine',soft,side*.016,-.37,.14,.136,.124,.15);
  }
  part(head,'fine',soft,0,-.117,.297,.215,.13,.091);
  part(head,'fine',ink,0,-.066,.367,.067,.046,.033);
  for(const side of [-1,1]){
    branch(head,'#76525e',[0,-.101,.394],[side*.044,-.147,.384],.008);
    branch(head,'#76525e',[side*.044,-.147,.384],[side*.074,-.13,.376],.007);
  }
  if(look.toy===1){
    const patch=new T.Mesh(heartGeo,material('#d9809b'));
    patch.position.set(0,.85,.359);patch.scale.setScalar(.125);model.add(patch);
  }else if(look.toy===2){
    part(model,'fine',coat,0,.96,-.01,.448,.42,.332);
    part(model,'fine','#e7bc89',0,1.06,.29,.242,.071,.07);
    part(model,'diamond','#ffd68c',0,.89,.34,.079,.089,.024);
  }else{
    for(const side of [-1,1])
      part(model,'fine',coat,side*.109,1.186,.231,.15,.083,.046,0,0,side*.28);
    part(model,'fine',soft,0,1.18,.276,.056,.054,.028);
    for(let n=0;n<5;n++)part(model,'cube','#b29178',-.046,.69+n*.054,.351,.033,.009,.009,0,0,(n%2?1:-1)*.32);
  }
  return {group,model,head,legs,arms,kind:'person'};
}

function moonling(look){
  const skin=wardrobe.glowSkin.choices[look.glowSkin??0][1],coat=wardrobe.coat.choices[look.coat][1];
  const iris=wardrobe.eyes.choices[look.eyes][1];
  const group=new T.Group(),model=new T.Group(),head=new T.Group(),arms=[],legs=[];
  group.add(model);model.add(head);head.position.y=1.32;
  part(model,'fine',coat,0,.77,0,.34,.47,.26);
  part(model,'fine','#f6dfb4',0,1.06,.02,.33,.11,.26);
  part(model,'diamond','#c8fbdf',0,.87,.258,.09,.12,.045);
  part(head,'fine',skin,0,.09,0,.50,.44,.33);
  for(const side of [-1,1]){
    part(head,'fine','#2e354a',side*.20,.11,.27,.14,.177,.077,0,side*.30,side*-.22);
    part(head,'fine',iris,side*.20,.082,.326,.10,.095,.034);
    part(head,'sphere','#fff5da',side*.20-.026,.167,.341,.036,.043,.018);
    part(head,'soft','#efa8a7',side*.33,-.028,.239,.077,.044,.033);
    branch(head,skin,[side*.22,.43,0],[side*.34,.69,-.04],.032);
    part(head,'soft','#ffe3a3',side*.34,.70,-.04,.083,.089,.081);
    const arm=new T.Group(),leg=new T.Group();model.add(arm,leg);arms.push(arm);legs.push(leg);
    arm.position.set(side*.30,.97,0);leg.position.set(side*.14,.43,0);
    part(arm,'fine',skin,side*.065,-.19,0,.098,.25,.095,0,0,side*.15);
    part(leg,'fine',skin,0,-.16,0,.107,.20,.11);
    part(leg,'fine',coat,0,-.34,.05,.126,.078,.16);
  }
  branch(head,ink,[-.056,-.065,.314],[0,-.085,.319],.009);
  branch(head,ink,[0,-.085,.319],[.056,-.065,.314],.009);
  return {group,model,head,arms,legs,kind:'person'};
}

function mermaid(look){
  const avatar=human(outfitColors(look),{...look,outfit:0,morph:1},false);
  for(const leg of avatar.legs)leg.visible=false;
  const color=wardrobe.scales.choices[look.scales??0][1];
  const tail=new T.Group();avatar.model.add(tail);tail.position.set(0,1.00,0);
  const rings=[[.09,.178,.126,0],[-.06,.218,.165,-.01],[-.23,.211,.157,-.035],[-.44,.167,.131,-.085],
    [-.64,.115,.098,-.16],[-.78,.08,.070,-.27],[-.86,.055,.050,-.38]];
  const positions=[],indices=[],sides=24;
  for(const [i,[y,rx,rz,z]] of rings.entries()){
    for(let j=0;j<sides;j++){
      const angle=j*Math.PI*2/sides;
      positions.push(rx*Math.sin(angle),y,z+rz*Math.cos(angle));
      if(i){const a=(i-1)*sides+j,b=(i-1)*sides+(j+1)%sides;indices.push(a,a+sides,b,b,a+sides,b+sides);}
    }
  }
  const mesh=new T.BufferGeometry();mesh.setAttribute('position',new T.Float32BufferAttribute(positions,3));mesh.setIndex(indices);mesh.computeVertexNormals();
  const body=new T.Mesh(mesh,material(color));body.castShadow=true;tail.add(body);
  for(let row=0;row<3;row++)for(let j=0;j<7;j++){
    const angle=j*Math.PI*2/7+row*.34;
    part(tail,'soft',j%2?color:'#a9d5c7',(.205-row*.014)*Math.sin(angle),-.13-row*.10,
      -.032-row*.017+(.15-row*.009)*Math.cos(angle),.044,.054,.029,0,angle);
  }
  const fin=new T.Group();tail.add(fin);fin.position.set(0,-.83,-.34);
  for(const side of [-1,1]){
    const lobe=new T.Shape();
    lobe.moveTo(0,0);lobe.bezierCurveTo(.10,.055,.28,.037,.38,.19);
    lobe.bezierCurveTo(.36,.023,.31,-.096,.19,-.12);lobe.quadraticCurveTo(.09,-.14,0,-.045);
    const fluke=new T.Mesh(new T.ExtrudeGeometry(lobe,{depth:.042,bevelEnabled:false,curveSegments:12}),material(color));
    fluke.scale.x=side;fluke.rotation.x=.45;fin.add(fluke);
    branch(fin,'#afdcd4',[side*.045,-.016,.052],[side*.24,.012,.065],.011);
    for(let j=0;j<5;j++)part(avatar.model,'soft','#ebbdad',side*(.105+j*.012),1.38+.024*Math.cos(j*.6),.13,.025,.074,.031,0,0,side*(j-2)*.21);
  }
  avatar.pose=(t,moving)=>{tail.rotation.x=.12+.13*Math.sin(t*(moving?7:2));fin.rotation.x=.27*Math.sin(t*(moving?7:2)-.6);};
  return avatar;
}

export function traveler(look){
  if(look.morph===5)return mermaid(look);
  if(look.morph===4) return moonling(look);
  if(look.morph===3) return teddy(look);
  const avatar=human(outfitColors(look),look,true);
  if(look.morph!==2) return avatar;
  const feathers=wardrobe.feather.choices[look.feather??0][1];
  const gold=wardrobe.halo.choices[look.halo??0][1];
  const wings=[];
  for(const side of [-1,1]){
    const wing=new T.Group();wing.position.set(side*.17,1.37,-.23);
    avatar.model.add(wing);wings.push(wing);
    const length=look.wingShape===1?1.19:look.wingShape===2?.70:.91;
    for(let i=0;i<8;i++){
      const u=i/7;
      part(wing,'fine',i%3===0?'#fff2de':feathers,side*(.21+u*.52)*length,.10-u*.31,
        -.03-u*.053,(.13+u*.042)*length,(.31-u*.112)*length,.055,0,side*.18,side*(-.86-u*.36));
    }
    part(wing,'fine',feathers,side*.28,.104,-.024,.321,.185,.071,0,0,side*.42);
  }
  const glow=new T.Mesh(hoop,celMaterial(gold,{emissive:gold,emissiveIntensity:.35}));
  glow.position.set(0,.455,-.026);glow.rotation.x=Math.PI/2.48;
  glow.scale.setScalar(.235);
  avatar.head.add(glow);
  avatar.angelWings=wings;
  return avatar;
}
