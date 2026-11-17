import * as T from 'three';
import {part,material,branch} from './models.js';
import {paintedFace} from './anime-face.js';

const TAU=Math.PI*2;
const colors=['#52658f','#718b70','#837282','#594c73','#943e51','#ac875c','#2e344d','#558b76'];
const black='#302738';
const cream='#f0e1c8';

function surface(parent,color,rows,sides,sample) {
  const positions=[],indices=[];
  for(let row=0;row<=rows;row++) for(let col=0;col<sides;col++){
    const p=sample(row/rows,col/sides*TAU);
    positions.push(...p);
    if(row===rows) continue;
    const a=row*sides+col,b=row*sides+(col+1)%sides;
    indices.push(a,b,a+sides,b,b+sides,a+sides);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  geometry.userData.avatarOwned=true;
  const mesh=new T.Mesh(geometry,material(color));
  mesh.castShadow=mesh.receiveShadow=true;
  parent.add(mesh);
  return mesh;
}

function profile(parent,color,rings,sides=32){
  return surface(parent,color,rings.length-1,sides,(t,a)=>{
    const [y,xRadius,zRadius,front=0]=rings[Math.round(t*(rings.length-1))];
    return [Math.sin(a)*xRadius,y,Math.cos(a)*zRadius+front];
  });
}

function lock(parent,color,points,width,depth){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
  const p=new T.Vector3(), tangent=new T.Vector3(), a=new T.Vector3(), b=new T.Vector3(), depthAxis=new T.Vector3(0,0,1);
  return surface(parent,color,10,10,(t,angle)=>{
    curve.getPoint(t,p);
    curve.getTangent(t,tangent);
    a.crossVectors(depthAxis,tangent).normalize();
    b.crossVectors(tangent,a).normalize();
    const taper=Math.sin(Math.PI*(.11+t*.885))**.65;
    return p.addScaledVector(a,Math.sin(-angle)*width*taper)
      .addScaledVector(b,Math.cos(angle)*depth*taper).toArray();
  });
}

function makeHair(head,hair,style,feminine) {
  const side=style===5?-1:1;
  const sweep=style===4?.07:style===6?.052:.032;
  const cropped=style===10||style===4;
  surface(head,hair,18,40,(t,a)=>{
    const start=(Math.cos(a)+1)*.5;
    const lowest=(cropped?2.04:2.17)-start*.90+Math.sin(a*2)*sweep;
    const lat=lowest*(1-t)+.008;
    const puff=1+(style===3||style===7?.045*Math.cos(a*10)*Math.sin(lat*3):0);
    return [Math.sin(a)*Math.sin(lat)*.239*puff,.035+Math.cos(lat)*.294,Math.cos(a)*Math.sin(lat)*.228-.04];
  });
  const front=(x,y,tip,w)=>lock(head,hair,[[x*.24,.258,.036],[x*.6,.241,.151],[x,.175,.179],[tip,y,.155]],w,.035);
  if(style===3||style===7||style===10){
    for(let i=0;i<8;i++){
      const a=i*2.39996;
      part(head,'fine',hair,Math.cos(a)*(.16+i*.008),.21+Math.sin(a)*.068,Math.sin(a)*.159-.02,.108,.105,.107);
    }
  }else if(style===6){
    for(let i=0;i<5;i++) front(i*.095-.2,.095+(i%2)*.038,i*.097-.244,.072);
  }else if(style===8){
    for(let i=0;i<5;i++) front(i*.077-.15,.016+Math.abs(i-2)*.015,i*.092-.184,.059);
  }else if(!cropped){
    front(side*.19,.059,side*.232,.109);
    front(-side*.104,.115,-side*.2,.082);
  }
  if(style===1||style===9){
    const y=style===1?.294:.127;
    part(head,'fine',hair,0,y,-.188,.115,.109,.12);
    if(style===9) lock(head,hair,[[0,.163,-.211],[-.047,.003,-.29],[-.148,-.285,-.235]],.091,.074);
  }
  if([2,5,7,8,11].includes(style)){
    for(const s of [-1,1]){
      const end=style===5?-.22:style===11?-.47:style===2?-.39:-.35;
      const spread=style===7?.29:.22;
      if(style===2||style===11){
        const amount=style===11?9:7;
        for(let i=0;i<amount;i++){
          const t=i/(amount-1);
          part(head,'fine',hair,s*(.222+(i%2)*.037+t*.026),.013+(end-.013)*t,-.074+t*.08,.063*(1-t*.38),.071,.063);
        }
        part(head,'sphere','#ddad91',s*.259,end,.02,.042,.028,.041);
      }else for(let i=0;i<4;i++) {
        lock(head,hair,[[s*.16,.133,-.137],[s*spread,.032,-.112-i*.021],[s*(spread-.008),-.146,-.085-i*.029],[s*(spread-.041-i*.008),end+i*.018,-.016-i*.03]],.076,.047);
      }
    }
  }
  if(feminine&&style===4) part(head,'sphere',hair,0,.206,-.166,.091,.098,.094);
}

export function human(colorset,look,lead=false){
  const [skin,coat,hair]=colorset;
  const {morph=0,style=0,accessory=0,outfit=0,eyes=0,beard=0}=look;
  const feminine=morph===1, strong=beard===2;
  const group=new T.Group(),model=new T.Group(), head=new T.Group();
  const legs=[],arms=[];
  const skirt=feminine&&[1,3].includes(outfit);
  const robes=outfit===4;
  const shoulders=(feminine?.248:.278)+(strong?.045:0);
  const waist=(feminine?.157:.184)+(strong?.025:0);
  const legWidth=feminine?.088:.103;
  const coatColor=robes?'#3e394c':coat;
  const trim=colors[outfit%colors.length];
  group.add(model);model.add(head);
  head.position.set(0,1.845,0);
  profile(model,coatColor,[
    [.91,.19,.139,-.018],[.98,waist+.017,.148,-.005],[1.108,waist,.125],[1.256,shoulders-.057,.14,.009],
    [1.407,shoulders,.144],[1.49,shoulders-.058,.108],[1.525,.095,.085],[1.538,.076,.074]
  ]);
  if(skirt||robes) profile(model,coatColor,[
    [skirt?.64:.36,skirt?.295:.24,.163],[.73,skirt?.262:.219,.16],[.94,.205,.146],[1.103,waist+.015,.134],[1.132,waist,.126]
  ],32);
  part(model,'cube',outfit===2?'#deb681':trim,0,1.105,.139,waist*1.54,.071,.027);
  part(model,'cube','#c5a27e',.029,1.112,.161,.071,.066,.03);
  profile(model,skin,[[1.49,.089,.078],[1.54,.075,.072],[1.615,.076,.075],[1.653,.10,.089]],28);

  const jaw=feminine?.149:strong?.164:.157;
  const rings=[
    [-.236,.005,.008,.024],[-.229,.071,.075,.02],[-.212,.113,.118,.014],[-.187,jaw,.150,.009],
    [-.145,.185,.171,.006],[-.092,.215,.183,.004],[-.033,.225,.191,.0],
    [.031,.227,.195,-.006],[.093,.217,.189,-.015],[.144,.201,.177,-.024],
    [.193,.182,.152,-.035],[.235,.144,.123,-.041],[.267,.099,.089,-.047],
    [.285,.055,.057,-.046],[.292,.005,.007,-.045]
  ];
  profile(head,skin,rings,64);
  const expression=paintedFace(head,rings,feminine,eyes);
  if(beard){
    profile(head,hair,[
      [strong?-.386:-.262,.002,.008,.056],[-.244,.091,.089,.06],
      [-.222,jaw+.008,.122,.042],[-.192,jaw+.012,.14,.019],[-.174,jaw+.01,.141,.007]
    ],40);
  }
  for(const sign of [-1,1]){
    part(head,'fine',skin,sign*.218,-.064,-.011,.041,.061,.036,0,0,sign*-.12);
    part(head,'fine','#c08882',sign*.234,-.066,.014,.019,.033,.009);
  }

  makeHair(head,hair,style,feminine);
  if(accessory===0){
    part(head,'fine','#b98d5b',0,.226,-.017,.302,.043,.273,.09,0,-.075);
    part(head,'fine','#dcb582',0,.293,-.028,.221,.108,.21,.09,0,-.075);
    part(head,'fine',coat,0,.254,-.018,.225,.027,.213,.09,0,-.075);
  }else if(accessory===1){
    for(let i=0;i<10;i++){
      const a=i*TAU/10;
      const x=Math.sin(a)*.232,z=Math.cos(a)*.205;
      const bloom=['#ef959c','#f5d382','#b5a2d6'][i%3];
      for(let j=0;j<5;j++){
        const b=j*TAU/5;
        part(head,'fine',bloom,x+Math.cos(b)*.025,.22+Math.sin(b)*.025,z,.022,.021,.021);
      }
      part(head,'sphere','#e6bc79',x,.22,z+.021,.019,.017,.012);
    }
  }else if(accessory===2 || accessory===6){
    for(let i=0;i<(accessory===6?2:1);i++){
      part(head,'diamond',accessory===6?'#b991dc':'#e5ba65',accessory===6?(i===0?-.19:.19):-.19,.123,.142,.056,.049,.021);
    }
  }else if(accessory===4 || accessory===5){
    const c=accessory===4?'#cf7f95':'#7089a8';
    for(const s of [-1,1]){
      part(head,'fine',c,s*.165,.178,-.063,.091,.04,.049,0,0,s*.51);
      part(head,'diamond',c,s*.185,.111,-.068,.047,.085,.027,0,0,s*.23);
    }
  }else if(accessory===7){
    part(head,'fine','#342d41',0,.23,-.013,.309,.044,.25,0,0,-.14);
    part(head,'cone','#42374e',-.038,.379,-.019,.202,.351,.168,0,0,.27);
  }
  if(look.glasses){
    const geometry=new T.TorusGeometry(.072,.0075,8,28);
    geometry.userData.avatarOwned=true;
    for(const s of [-1,1]){
      const ring=new T.Mesh(geometry,material('#362f41'));
      ring.position.set(s*.097,.025,.215); ring.scale.y=.83;head.add(ring);
    }
    branch(head,black,[-.031,.032,.219],[.031,.032,.219],.006);
  }
  if(look.scar) lock(head,'#a96a62',[[.056,.158,.151],[.036,.131,.174],[.06,.13,.171],[.041,.1,.189]],.008,.004);

  const trousers=robes?'#4a414f':['#62647f','#5e526d','#55665d','#5d4a68'][outfit%4];
  for(const s of [-1,1]){
    const arm=new T.Group(),leg=new T.Group();
    arm.position.set(s*(shoulders-.032),1.395,0);leg.position.set(s*.105,.984,-.005);
    model.add(arm,leg);arms.push(arm);legs.push(leg);
    profile(arm,coatColor,[[-.45,.059,.059,.015],[-.383,.066,.061,.016],[-.266,.072,.069],[-.198,.086,.081],[-.075,.098,.09],[.019,.092,.081],[.073,.039,.042]],22);
    part(arm,'fine',skin,0,-.489,.023,.064,.107,.046);
    part(arm,'fine',skin,-s*.048,-.466,.064,.027,.06,.023,0,0,-s*.21);
    profile(leg,trousers,[[-.84,.049,.049],[-.74,.067,.063],[-.53,.069,.065],[-.414,.076,.075],[-.233,legWidth,.085],[-.069,legWidth+.016,.105],[.045,.078,.085]],24);
    profile(leg,lead?'#765253':'#664d54',[[-.98,.074,.109,.06],[-.953,.091,.137,.064],[-.896,.086,.126,.056],[-.852,.072,.089,.016],[-.723,.064,.064]],28);
    part(leg,'fine','#c5a489',0,-.963,.058,.091,.022,.132);
  }
  if(lead && outfit!==4){
    part(model,'fine','#a87959',0,1.22,-.198,.164,.235,.11);
    part(model,'fine','#c5996f',0,1.278,-.294,.149,.117,.035);
    const hardware='#d8b47e';
    for(const s of [-1,1]) {
      lock(model,hardware,[[s*.12,1.072,.128],[s*.164,1.31,.13],[s*.162,1.491,.024],[s*.14,1.398,-.211]],.027,.021);
    }
  }
  if(robes){
    part(model,'diamond',coat,.116,1.347,.153,.049,.056,.015);
    part(model,'cube',coat,0,1.411,.145,.068,.135,.027,0,0,-.16);
  }else if(outfit===3){
    part(model,'fine','#d1a0af',0,1.484,.065,.123,.061,.099);
    part(model,'fine','#cc8da4',.104,1.393,.141,.056,.117,.021,0,0,.42);
  }else{
    for(const s of [-1,1]) part(model,'cube','#e3c7b3',s*.047,1.459,.139,.04,.119,.018,0,0,s*.35);
  }
  return {group,model,head,legs,arms,expression,kind:'person'};
}

export function disposeHuman(model){
  const owned=new Set();
  model.traverse(mesh=>{if(mesh.geometry?.userData.avatarOwned) owned.add(mesh.geometry);});
  for(const geometry of owned) geometry.dispose();
}
