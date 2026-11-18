import * as T from 'three';
import {part,branch} from './models.js';
import {townsByPlace,townProfiles,townWater,townPavement,regionalRoomById} from './town-data.js';
import {regionalDesigns} from './regional-designs.js';
import {regionalFacade,regionalPlaza,regionalRoof} from './regional-architecture.js';

const timber='#806353';
const cream='#eee1bb';
const pathColors=['#d8c6a3','#e7d2b0','#d1b899','#dfc3a1'];
const dryStone=['#b6ada2','#c5bcad','#9f9e98','#bfb7aa'];
const serviceColors={hall:'#b38699',market:'#d28f84',inn:'#8ab795',workshop:'#be966d',garden:'#829f78',post:'#a482a4',lookout:'#8da7bc'};
const gleam=new T.MeshBasicMaterial({color:'#f7d59d',toneMapped:false});
const box=(parent,color,x,y,z,w,h,d,rx=0,ry=0,rz=0)=>part(parent,'cube',color,x,y,z,w,h,d,rx,ry,rz);

function floorAt(height,parent,x,z,w,d,palette,pattern){
  const stripes=Math.ceil(d/1.35),columns=Math.ceil(w/1.8);
  for(let a=0;a<columns;a++)for(let b=0;b<stripes;b++){
    const px=x+(a+.5-columns/2)*w/columns,pz=z+(b+.5-stripes/2)*d/stripes;
    const dx=w/columns-.022,dz=d/stripes-.025;
    box(parent,palette[(a*3+b*7+pattern)%palette.length],px,height(px,pz)+.026,pz,dx,.065,dz);
  }
}

function pavedTown(parent,town,height){
  const palette=town.design?[pathColors[0],dryStone[1],town.palette[1],new T.Color(town.palette[0]).lerp(new T.Color('#f2e5d1'),.52).getStyle()]:
    town.layout==='harbor'?['#c6ac95','#b19a82','#d3bc9f','#d6c4a9']:town.layout==='courtyard'?pathColors:dryStone;
  const runs=townPavement(town);
  runs.forEach(([x,z,w,d],i)=>floorAt(height,parent,x,z,w,d,palette,i));
  return runs;
}

function windowBox(group,x,y,z,w,h,trim,glow){
  box(group,trim,x,y,z,w+.13,h+.13,.09);
  box(group,glow,x,y,z+.052,w,h,.06);
  box(group,trim,x,y,z+.088,.062,h,.043);
  box(group,trim,x,y+.07,z+.088,w,.055,.055);
  box(group,trim,x,y-h/2-.047,z+.1,w+.16,.075,.18);
}

function featureAtDoor(g,kind,edge,accent){
  if(kind==='home') return;
  const y=2.77;
  box(g,timber,0,y,edge+.15,.83,.55,.12);
  box(g,accent,0,y,edge+.22,.70,.43,.09);
  if(kind==='workshop'){
    branch(g,cream,[-.21,y-.09,edge+.29],[.19,y+.14,edge+.29],.037);
    box(g,cream,.18,y+.10,edge+.29,.13,.25,.06,0,0,.48);
  }else if(kind==='garden'){
    part(g,'fine',cream,-.11,y,edge+.29,.14,.083,.043,0,0,-.43);
    part(g,'fine',cream,.11,y+.065,edge+.29,.14,.085,.043,0,0,.52);
  }else if(kind==='market'){
    box(g,cream,0,y-.07,edge+.29,.40,.20,.055);
    box(g,cream,0,y+.12,edge+.29,.47,.064,.057);
  }else if(kind==='post'){
    box(g,cream,0,y,edge+.29,.43,.24,.055);
    branch(g,accent,[-.20,y+.095,edge+.329],[0,y-.023,edge+.329],.021);
    branch(g,accent,[0,y-.023,edge+.329],[.20,y+.095,edge+.329],.021);
  }else{
    part(g,'diamond',cream,0,y,edge+.28,.18,.136,.036,0,0,.38);
  }
}

function building(group,home,arch,palette,nightGlass,height,blockers,design){
  const {kind,index,x,z,yaw,width:w,depth:d}=home;
  const [wall,light,roof,accent]=palette;
  const base=new T.Group();
  base.name=(kind==='home'?'Residence':kind)+' '+index;group.add(base);
  base.position.set(x,height(x,z),z);base.rotation.y=yaw;
  const tall=kind==='hall'||kind==='inn'||kind==='lookout';
  const color=kind==='home'&&index%2?light:wall;
  const a=serviceColors[kind]??accent;
  const front=d/2,half=w/2;
  const top=tall?4.2:3.38,door=tall?1.9:1.64;
  const skirt=Math.max(.35,...[[-half,-front],[half,front],[-half,front],[half,-front]].map(([dx,dz])=>{
    const wx=x+Math.cos(yaw)*dx+Math.sin(yaw)*dz,wz=z-Math.sin(yaw)*dx+Math.cos(yaw)*dz;
    return height(x,z)-height(wx,wz)+.22;
  }));
  const wide=kind==='garden'||kind==='market';
  const gate=wide?door+.7:door;
  const room=regionalRoomById(home.stop?.id);
  const wallH=top+.22;
  box(base,'#ad947d',0,-skirt/2,0,w+.22,skirt+.03,d+.19);
  if(!room) box(base,kind==='garden'?'#c6bc94':'#d9b58f',0,.03,0,w-.22,.082,d-.19);
  box(base,color,0,top/2,-front,w,wallH,.25);
  for(const side of [-1,1]){
    box(base,color,side*half,top/2,0,.22,wallH,d-.17);
    box(base,light,side*half,top-.17,0,.31,.13,d+.13);
    for(const end of [-1,1]) box(base,timber,side*half,top*.50,end*(front+.038),.22,top+.20,.22);
    box(base,color,side*(half+gate*.5)/2,top*.5,front,half-gate*.5,wallH,.24);
    box(base,light,side*(gate/2+.10),1.14,front+.082,.18,2.30,.242);
    if(half-gate*.5>1.00){
      const wx=side*(half+gate*.5)/2;
      windowBox(base,wx,1.62,front+.145,Math.min(1.13,half-gate*.5-.44),1.04,timber,nightGlass);
      if(kind==='home'||kind==='inn'){
        box(base,a,wx,.97,front+.31,1.01,.15,.40);
        for(let i=0;i<3;i++)part(base,'fine',i===1?'#e2b4a3':'#a8b483',wx+(i-1)*.24,1.065,front+.44,.16,.12,.091);
      }
      if(tall) windowBox(base,wx,3.20,front+.145,.82,.63,timber,nightGlass);
    }
  }
  box(base,color,0,(top+2.38)*.5,front,gate,top-2.33,.245);
  box(base,timber,0,2.35,front+.10,gate+.46,.182,.26);

  if(design&&kind!=='garden'){
    regionalRoof(base,design,w,d,top,kind);
    regionalFacade(base,design,w,d,top,gate,kind);
  }else if(arch==='adobe'||kind==='garden'){
    box(base,arch==='adobe'?light:'#99b4ad',0,top+.12,0,w+.23,.31,d+.29);
    for(const side of [-1,1]){
      const fr=front+.12;
      box(base,wall,side*half,top+.35,0,.17,.34,d+.18);
      box(base,wall,0,top+.31,side*fr,w+.19,.24,.16);
      for(let i=0;i<4;i++)box(base,roof,side*(half+.02),top+.49,(i-1.5)*d*.255,.23,.11,.34);
    }
  }else if(arch==='row'){
    const slope=.27;
    for(const side of [-1,1]){
      const yy=top+.55;
      box(base,roof,side*w*.25,yy,0,w*.59,.19,d+.54,0,0,side*-slope);
      for(let j=0;j<7;j++){
        const zz=(j-3)*d/6.5;
        box(base,j%2?a:roof,side*w*.255,yy+.109,zz,w*.58,.06,.071,0,0,side*-slope);
      }
    }
  }else{
    const rise=arch==='gabled'?.96:.77;
    for(let i=0;i<5;i++){
      const t=i/5,ww=(w+.13)*(1-t);
      box(base,light,0,top+.12+rise*t,front,ww,rise/5+.045,.22);
      box(base,light,0,top+.12+rise*t,-front,ww,rise/5+.045,.22);
    }
    const angle=Math.atan2(rise,w*.5);
    for(const side of [-1,1]){
      box(base,roof,side*w*.267,top+.21+rise*.51,0,w*.59,.20,d+.58,0,0,side*-angle);
      for(let i=0;i<6;i++)box(base,i%2?roof:a,side*w*.275,top+.305+rise*.51,(i-2.5)*d/5.75,w*.565,.035,.043,0,0,side*-angle);
    }
    box(base,roof,0,top+.28+rise,0,.30,.19,d+.61);
    if(kind==='inn'||kind==='home'||kind==='workshop'){
      box(base,timber,w*.28,top+.77,-d*.21,.62,1.18,.53);
      box(base,light,w*.28,top+1.39,-d*.21,.75,.17,.64);
    }
  }
  const silhouette=design?0:kind==='hall'?5.7:kind==='lookout'?5.35:0;
  if(silhouette){
    part(base,'cyl',light,0,silhouette-.53,-front*.74,.61,1.21,.61);
    part(base,'cone',roof,0,silhouette+.37,-front*.74,.92,1.5,.92);
    part(base,'sphere','#e9be83',0,silhouette+1.18,-front*.74,.13,.13,.13);
  }

  featureAtDoor(base,kind,front,a);
  box(base,'#a9947e',0,.055,front+.40,gate+.63,.17,.94);
  if(kind==='market'){
    for(const sign of [-1,1]){
      branch(base,timber,[sign*(half-.3),0,front+1.23],[sign*(half-.3),2.57,front+1.23],.079);
      if(!room){
        const start=sign*(gate*.6+.28);
        box(base,'#b4876c',start,.67,front-.61,.75,1.22,1.22);
        for(let i=0;i<3;i++)part(base,'fine',i%2?'#ddae88':'#e5cba2',start,.335+(i===1?.72:.44),front-1.04+i*.34,.22,.13,.22);
      }
    }
    for(let i=0;i<10;i++)
      box(base,i%2?a:cream,(i-4.5)*(w-.40)/10,2.62,front+.66,(w-.33)/10,.06,1.63,.12);
  }else if(kind==='garden'){
    for(const sign of [-1,1]){
      box(base,'#986e5a',sign*(half-.55),.32,-.66,.62,.49,Math.min(2.18,d*.58));
      for(let i=0;i<5;i++){
        const pz=(i-2)*.37-.58;
        part(base,'fine',i%2?'#84ad86':'#bec490',sign*(half-.55),.75,pz,.20,.25,.18);
        if(i%2)part(base,'fine','#e8b0b2',sign*(half-.55),.925,pz,.12,.088,.084);
      }
    }
  }else if(!room){
    const wx=half-.67;
    if(kind!=='home') box(base,'#a07864',wx,.82,-.75,1.0,.18,1.95);
    for(let i=0;i<3;i++)box(base,kind==='post'?'#dbbf96':a,wx,.965,-1.25+i*.45,.37,.13,.29);
    box(base,'#a18572',-wx,.24,-.63,.47,.39,1.35);
  }

  const addBlock=(lx,lz,rx,rz)=>{
    const cos=Math.cos(yaw),sin=Math.sin(yaw);
    const px=x+cos*lx+sin*lz,pz=z-sin*lx+cos*lz;
    blockers.push([px,pz,Math.abs(cos)*rx+Math.abs(sin)*rz,Math.abs(sin)*rx+Math.abs(cos)*rz]);
  };
  for(const side of [-1,1]){
    addBlock(side*half,0,.20,front+.08);
    addBlock(side*(half+gate*.5)/2,front,(half-gate*.5)/2,.212);
  }
  addBlock(0,-front,half,.20);
}

function plaza(parent,town,height,blockers){
  if(town.legacy) return;
  const [x,z]=town.center;
  const colors=town.palette;
  const cx=x+(town.layout==='courtyard'?-3.6:3.4),cz=z+4.2;
  const y=height(cx,cz);
  const design=regionalDesigns[town.realm];
  if(design){
    regionalPlaza(parent,cx,y,cz,design);
    if(['pools','prisms','pots','orchard'].includes(design.plaza)) blockers.push([cx,cz,1.27,1.07]);
  }else if(town.layout==='harbor'){
    for(let i=0;i<5;i++){
      const xx=cx+(i-2)*.74;
      part(parent,'cyl','#947c69',xx,y+.43,cz,.16,.88,.16);
      part(parent,'fine',colors[3],xx,y+.85,cz,.17,.077,.17);
    }
  }else if(town.realm==='gloam'){
    for(let i=0;i<4;i++){
      const sense=i*Math.PI*.5+.25;
      const xx=cx+Math.sin(sense)*.69,zz=cz+Math.cos(sense)*.69;
      branch(parent,'#846d68',[cx,y,cz],[xx,y+3.6+i%2*.5,zz],.19);
      part(parent,'fine',i%2?colors[2]:colors[0],xx,y+4.1+i%2*.5,zz,1.35,.92,1.27);
      const ex=cx+Math.sin(sense)*1.27,ez=cz+Math.cos(sense)*1.23;
      branch(parent,cream,[xx,y+3.8+i%2*.5,zz],[ex,y+2.7,ez],.022);
      part(parent,'fine',gleam,ex,y+2.55,ez,.18,.25,.17);
      part(parent,'cone',colors[2],ex,y+2.79,ez,.22,.20,.20);
    }
    blockers.push([cx,cz,.72,.72]);
  }else if(town.realm==='larkspur'){
    for(let i=0;i<3;i++){
      const xx=cx+(i-1)*.69;
      branch(parent,'#958276',[xx,y,cz],[xx,y+2.33,cz],.073);
      branch(parent,'#958276',[xx,y+2.30,cz],[xx,y+2.30,cz+.38],.050);
      part(parent,'cone','#d6af7f',xx,y+1.95,cz+.38,.22,.48,.22);
      part(parent,'fine','#e5bd88',xx,y+1.68,cz+.38,.085,.073,.082);
    }
  }else{
    part(parent,'cyl','#ae9d91',cx,y+.16,cz,1.34,.38,1.34);
    part(parent,'cyl','#70aab8',cx,y+.371,cz,1.12,.056,1.12);
    part(parent,'cyl','#d3c1a9',cx,y+.57,cz,.22,.51,.22);
    part(parent,'fine','#a0d8d6',cx,y+.916,cz,.25,.15,.25);
    blockers.push([cx,cz,1.31,1.31]);
  }
  if(town.layout==='courtyard'){
    const zz=z+7.5,yl=height(x,zz)+4.16;
    for(const sx of [-1,1])branch(parent,timber,[x+sx*5.8,height(x+sx*5.8,zz),zz],[x+sx*5.8,yl,zz],.11);
    for(let i=0;i<9;i++){
      const ax=x-5.8+i*11.6/9, bx=ax+11.6/9;
      const ay=yl-.52*Math.sin(i*Math.PI/9),by=yl-.52*Math.sin((i+1)*Math.PI/9);
      branch(parent,timber,[ax,ay,zz],[bx,by,zz],.022);
      part(parent,'cone',i%2?colors[3]:colors[2],(ax+bx)/2,(ay+by)/2-.19,zz,.27,.45,.056,0,0,Math.PI);
    }
  }
  for(const side of [-1,1]){
    const px=x+side*8.4,pz=z+8.4,hy=height(px,pz);
    box(parent,colors[2],px,hy+.24,pz,1.2,.43,.51);
    for(let i=0;i<4;i++)part(parent,'fine',i%2?colors[3]:'#a0b280',px+(i-1.5)*.25,hy+.53,pz,.19,.18,.14);
    const lx=x+side*7.0,lz=z-7.0,ly=height(lx,lz);
    branch(parent,timber,[lx,ly,lz],[lx,ly+2.7,lz],.075);
    branch(parent,timber,[lx,ly+2.61,lz],[lx+side*.37,ly+2.61,lz],.07);
    box(parent,gleam,lx+side*.37,ly+2.41,lz,.23,.32,.23);
    part(parent,'cone',colors[2],lx+side*.37,ly+2.66,lz,.23,.18,.23);
  }
}

export function populateTown(parent,place,height,paletteOverride){
  const town=townsByPlace[place];
  if(!town) return null;
  const root=new T.Group();root.name=town.name+' settlement';parent.add(root);
  const blockers=[];
  const palette=paletteOverride??town.palette??['#ddbd9e','#e5ccac','#a68a9d','#a6be99'];
  const glass=new T.MeshBasicMaterial({color:'#d6c2a7'});
  const paved=pavedTown(root,town,height);
  const design=regionalDesigns[town.realm];
  town.buildings.forEach(spec=>{
    const tint=t=>new T.Color(palette[1]).lerp(new T.Color(t),.48).getStyle();
    const home=town.design&&spec.kind!=='hall';
    const wall=home?tint(palette[(spec.index+town.design.length)%4]):palette[1];
    const arch=home&&spec.index%4===1?town.layout==='courtyard'?'row':'gabled':town.architecture;
    const roof=home&&spec.index%3===0?new T.Color(palette[2]).lerp(new T.Color(palette[3]),.54).getStyle():palette[2];
    building(root,spec,arch,[wall,new T.Color(wall).lerp(new T.Color('#fff0d0'),.46).getStyle(),roof,palette[3]],
      glass,height,blockers,design);
  });
  plaza(root,town.palette?town:{...town,palette},height,blockers);
  const blocks=(x,z)=>blockers.some(([px,pz,rx,rz])=>Math.abs(x-px)<rx&&Math.abs(z-pz)<rz);
  return {root,blocks,isPaved:(x,z)=>paved.some(([px,pz,w,d])=>Math.abs(x-px)<w/2&&Math.abs(z-pz)<d/2),
    update(time){
      const night=1-T.MathUtils.smoothstep(Math.sin((time-6)*Math.PI/12),-.42,.17);
      glass.color.set('#bad3cf').lerp(new T.Color('#ffd494'),night);
    }};
}

function fieldTree(g,x,y,z,r,palette,cold=false){
  const s=.85+r*.56;
  branch(g,'#8e7361',[x,y,z],[x+.10,y+2.8*s,z-.12],.13*s);
  if(cold){
    for(let i=0;i<3;i++)part(g,'cone',i%2?palette[1]:palette[2],x+.10,y+(1.7+i*.57)*s,z-.12,
      (1.04-i*.16)*s,1.45*s,(1.00-i*.14)*s);
  }else{
    const colors=[palette[2],palette[0],palette[1]];
    for(let i=0;i<5;i++){
      const a=i*2.39996,d=.64*s;
      part(g,'low',colors[i%3],x+Math.sin(a)*d,y+(2.55+i*.16)*s,z+Math.cos(a)*d,.71*s,.59*s,.73*s);
    }
  }
}

function windmill(group,x,z,height,colors,rotors,phase){
  const y=height(x,z);
  part(group,'cyl','#ded1ba',x,y+1.89,z,1.34,3.78,1.34);
  part(group,'cone',colors[2],x,y+4.40,z,1.55,1.66,1.55);
  box(group,'#977163',x,y+1.02,z+1.31,.68,1.99,.13);
  box(group,cream,x-.44,y+2.42,z+1.25,.34,.42,.13);
  const sail=new T.Group();sail.position.set(x,y+3.46,z+1.68);group.add(sail);
  for(let blade=0;blade<4;blade++){
    const arm=new T.Group();arm.rotation.z=blade*Math.PI*.5;sail.add(arm);
    box(arm,'#937e6c',0,1.31,0,.09,3.0,.11);
    box(arm,blade%2?cream:colors[3],.27,1.67,.07,.54,1.71,.092);
    for(let stitch=0;stitch<3;stitch++)
      box(arm,'#b6997f',.27,1.07+stitch*.54,.129,.54,.047,.036);
  }
  part(sail,'cyl','#a78766',0,0,.11,.19,.24,.19,Math.PI*.5);
  rotors.push([sail,phase]);
}

export function populateTownLandscape(root,scene,realm,height,rng,blockers,waterMaterial){
  const profile=townProfiles[realm];
  if(!profile) return ()=>{};
  const {biome,palette:colors,wilderness:[x,z],center:[cx,cz]}=profile;
  const rotors=[];
  const basin=townWater(realm);
  if(basin){
    const mesh=new T.Mesh(new T.CircleGeometry(1,49),waterMaterial);
    mesh.rotation.x=-Math.PI/2;mesh.scale.set(basin.rx,basin.rz,1);
    mesh.position.set(basin.x,basin.level,basin.z);mesh.renderOrder=2;scene.add(mesh);
    for(let i=0;i<20;i++){
      const a=i*Math.PI/10;
      const x0=basin.x+Math.sin(a)*basin.rx*(1.06+rng()*.07),z0=basin.z+Math.cos(a)*basin.rz*(1.06+rng()*.07);
      const y=height(x0,z0),s=.24+rng()*.65;
      part(root,'low',i%2?colors[1]:'#958e96',x0,y+.12,z0,s,s*.44,s*.65);
      if(i%2===1){
        for(let j=0;j<3;j++){
          branch(root,colors[2],[x0+j*.14,y,z0],[x0+j*.15-.15,y+.29+j*.19,z0+.13],.018);
          part(root,'fine',colors[0],x0+j*.14,y+.27+j*.16,z0+.12,.11,.053,.098);
        }
      }
    }
  }
  if(realm==='bellport'||realm==='larkspur'){
    for(let i=0;i<3;i++){
      const px=x-3.5+i*3.2,pz=z-11-Math.cos(i*.8)*4.0,y=height(px,pz);
      part(root,'cyl',i===1?colors[1]:'#c3bcb0',px,y+2.1,pz,1.1,4.22,1.1);
      for(let stripe=1;stripe<=3;stripe++)
        part(root,'cyl',colors[2],px,y+stripe*1.17,pz,1.14,.17,1.14);
      part(root,'cyl',gleam,px,y+4.28,pz,.79,.59,.79);
      part(root,'cone',colors[2],px,y+5.04,pz,1.23,1.2,1.23);
      blockers.push([px,pz,.97,.97]);
    }
  }else if(realm==='windmere'){
    for(const [dx,dz,phase] of [[-3,-8,.7],[4.9,-13,2.4],[-10,-10,4.4]]) {
      windmill(scene,x+dx,z+dz,height,colors,rotors,phase);
      blockers.push([x+dx,z+dz,1.3,1.3]);
    }
  }else if(realm==='linen'){
    for(let i=0;i<5;i++){
      const px=x-6+i*2.6,pz=z-12,y=height(px,pz);
      branch(root,timber,[px-1.0,y,pz],[px-1.0,y+2.4,pz],.076);
      branch(root,timber,[px+1.05,y,pz],[px+1.05,y+2.4,pz],.076);
      box(root,colors[i%4],px,y+1.62,pz,.97,1.16,.07,.23,0,(i%2?1:-1)*.09);
      branch(root,cream,[px-1.05,y+2.17,pz],[px+1.05,y+2.32,pz],.024);
    }
  }else if(realm==='fennel'){
    for(let side of [-1,1])for(let i=0;i<19;i++){
      if(i>=8&&i<=10) continue;
      const px=x+(i-10)*.73,pz=z-9.9+side*2.9+Math.sin(.42*i)*.75,y=height(px,pz);
      part(root,'low',dryStone[i%4],px,y+.33,pz,.40,.35,.48);
      part(root,'fine',dryStone[(i+1)%4],px-.1,y+.11,pz,.47,.26,.46);
    }
  }else if(realm==='safflower'){
    for(let i=0;i<9;i++){
      const px=x+Math.cos(i*.84)*7.8,pz=z-8+Math.sin(i*.84)*3.1;
      for(let j=0;j<3;j++){
        const y=height(px,pz)+j*.35, w=(1.1-j*.19)*(i%2?.63:1.08);
        part(root,'low',i%2?colors[2]:colors[0],px,y,pz,w,.67,w*.79,0,j*.63,.15);
      }
    }
  }else if(basin){
    const px=basin.x,pz=basin.z+basin.rz*.72,y=Math.max(basin.level+.23,height(px,pz)+.09);
    for(let i=0;i<9;i++)box(root,i%2?'#bb9d79':'#ad8c74',px+(i-4)*.32,y,pz,.306,.16,2.8);
    for(const sx of [-1,1])for(const sz of [-1,1])
      branch(root,timber,[px+sx*1.41,y-.96,pz+sz*1.35],[px+sx*1.41,y+.66,pz+sz*1.35],.088);
  }

  for(let i=0;i<210;i++){
    const px=(rng()-.5)*108,pz=(rng()-.5)*108;
    if(Math.abs(px-cx)<22&&Math.abs(pz-cz)<22)continue;
    if(Math.hypot(px-x,pz-z)<5)continue;
    if(basin&&Math.hypot((px-basin.x)/basin.rx,(pz-basin.z)/basin.rz)<1.2)continue;
    const y=height(px,pz),alpine=biome==='frost'||realm==='tamarack';
    const dense=biome==='woods'&&i%2===0;
    if(dense||(alpine&&i%4===0)||((biome==='orchards'||biome==='heath')&&i%7===0)){
      fieldTree(root,px,y,pz,rng(),colors,alpine);
      blockers.push([px,pz,.23]);
    }else if(i%5===0){
      part(root,'low',i%2?colors[2]:colors[1],px,y+.16,pz,.37+rng()*.41,.27+rng()*.30,.43);
    }else{
      const a=rng()*6.28;
      for(let j=0;j<3;j++){
        const dx=Math.sin(a+j)*.25,dz=Math.cos(a+j)*.22,h=.21+rng()*.52;
        branch(root,colors[2],[px+dx,y,pz+dz],[px+dx-.13,y+h,pz+dz+.11],.021);
        part(root,'fine',j%2?colors[3]:colors[1],px+dx-.12,y+h,pz+dz+.11,
          .09,.048,.08,0,a,.23);
      }
    }
  }
  return elapsed=>{
    for(const [sail,phase] of rotors)sail.rotation.z=elapsed*(.65+phase*.13)+phase;
  };
}
