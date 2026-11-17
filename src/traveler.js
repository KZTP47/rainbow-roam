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

export function traveler(look){
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
