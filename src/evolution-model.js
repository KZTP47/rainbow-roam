import {Group, Mesh, TorusGeometry} from 'three';

const ring = new TorusGeometry(1, .115, 6, 20);
const crescent = new TorusGeometry(1, .23, 6, 20, Math.PI * 1.35);
const cream = '#fff2d2';

// These mounts sit on the feature that defines the creature's silhouette.
const mounts = {
  unicorn: ['head', 0, .62, -.06, .43],
  fox: ['tail', 0, .36, -.53, .38],
  hare: ['head', 0, .48, -.035, .31],
  mouse: ['head', 0, .31, .027, .25],
  axolotl: ['head', .47, .16, -.11, .30],
  sprite: ['head', .52, .21, -.16, .31],
  turtle: ['model', 0, .69, -.24, .41],
  hedgehog: ['model', 0, .69, -.30, .41],
  snail: ['model', 0, 1.08, -.22, .39],
  crab: ['model', 0, .57, -.065, .34],
  rollbud: ['model', 0, .85, -.13, .41],
  pealfoot: ['head', 0, .21, .03, .25],
  belljelly: ['head', 0, .28, -.015, .42]
};

function decoration(group, motif, color, old, stage, part, material, branch) {
  const add = (shape, c, x, y, z, sx, sy, sz, rz=0) =>
    part(group, shape, c, x, y, z, sx, sy, sz, 0, 0, rz);
  const loop = (geo, c, x, y, z, sx, sy, rz=0) => {
    const mesh = new Mesh(geo, material(c));
    mesh.position.set(x,y,z);
    mesh.rotation.z = rz;
    mesh.scale.set(sx,sy,.29);
    group.add(mesh);
  };

  switch (motif) {
    case 'clover': case 'petals': case 'bloom': case 'rosette': {
      const count = {clover:4, petals:3, bloom:6, rosette:8}[motif];
      for (let i=0; i<count; i++) {
        const a = motif==='petals' ? (i-1)*.7 : i*Math.PI*2/count;
        const y = motif==='petals' ? .23 : .37;
        add('fine',i%3===1?old:color,Math.sin(a)*.27,y+Math.cos(a)*.25,.03,
          motif==='clover'?.20:.14,.27,.10,-a);
      }
      add('sphere',motif==='clover'?'#d5eda2':cream,0,.35,.1,.13,.13,.11);
      if (motif==='rosette') loop(ring,old,0,.35,.12,.225,.225);
      break;
    }
    case 'prism': case 'kite': case 'paper': case 'spark': {
      const folded = motif==='paper';
      const angles = motif==='spark' ? [-.81,.2,.84] : [-.56,0,.56];
      angles.forEach((a,i)=>{
        const h = i===1 ? .47 : .32;
        add(folded?'cube':'diamond',i===1?color:old,a*.59,h*.68,i===1?.055:-.05,
          folded?.28:.205,h,folded?.052:.135,-a);
        if (motif==='kite') add('diamond',cream,a*.59,h*.68,.10,.09,h*.80,.042,-a);
      });
      break;
    }
    case 'moon': case 'orbit': case 'curl': case 'weave': case 'wave': {
      const geo = ['moon','curl','wave'].includes(motif) ? crescent : ring;
      loop(geo,color,0,.38,0,motif==='wave'?.64:.43,.39,motif==='wave'?.53:-.2);
      const crossed = motif==='weave';
      if (motif!=='moon') {
        loop(geo,old,.20,.24,-.04,crossed?.31:.40,crossed?.22:.24,crossed?-1.1:.46);
        if (stage===2) loop(geo,cream,-.27,.24,.06,.24,.19,-.42);
      }
      break;
    }
    case 'star': case 'sun': case 'frost': case 'flare': case 'fan': {
      const radial = ['star','sun','frost'].includes(motif);
      const n = motif==='sun'?9:motif==='frost'?6:5;
      const radius = radial?.34:.29;
      for (let i=0;i<n;i++){
        const a = radial?i*Math.PI*2/n:(i-2)*.40;
        const height = motif==='frost'?.22:.33;
        add(motif==='fan'?'fine':'diamond',i%2?old:color,Math.sin(a)*radius,
          Math.cos(a)*radius+.32,0,motif==='fan'?.105:.1,height,.085,-a);
        if (motif==='frost') for(const s of [-1,1])
          add('diamond',cream,Math.sin(a)*.38+s*Math.cos(a)*.085,Math.cos(a)*.38+.32-s*Math.sin(a)*.085,.03,.052,.14,.046,-a+s*.65);
      }
      add('sphere',motif==='sun'?cream:color,0,.32,.025,.21,.19,.10);
      break;
    }
    case 'leaf': case 'quill': case 'reed': case 'ribbon': case 'silk': case 'shell': {
      const wide = ['ribbon','silk','shell'].includes(motif);
      const n = motif==='reed'?5:wide?4:3;
      for(let i=0;i<n;i++){
        const d=i-(n-1)/2;
        const h=.46-Math.abs(d)*.065+(motif==='quill'?.10:0);
        const w=wide?.15:motif==='reed'?.056:.103;
        add('fine',i%2?old:color,d*.205,h*.57,-Math.abs(d)*.04,w,h,.083,-d*(wide?.35:.22));
        if(wide) add('fine',i%2?color:cream,d*.25,h*.28,-.16,w*.73,h*.68,.084,d*.40);
      }
      break;
    }
    case 'coral': case 'bramble': {
      for (const side of [-1,0,1]){
        const tip=[side*.36,side?.54:.77,0];
        branch(group,color,[side*.14,.02,0],tip,.066,.68);
        branch(group,old,[side*.19,.27,.02],[side*.27-.16,.50,.08],.043,.63);
        add(motif==='coral'?'sphere':'diamond',color,...tip,.083,.105,.075);
      }
      break;
    }
    case 'bell': case 'chime': case 'lantern': case 'key': {
      const lantern = motif==='lantern', key = motif==='key';
      for(const [i,x] of [-.32,0,.32].entries()){
        const h = i===1?.48:.32;
        if (key) {
          loop(ring,i===1?color:old,x,h+.15,0,i===1?.15:.095,i===1?.15:.095);
          add('cube',color,x,h*.47,0,.092,h*.72,.11);
          add('cube',old,x+.07,h*.38,.025,.17,.065,.11);
        } else if (lantern) {
          add('fine',cream,x,h,.012,.123,.19,.13);
          add('diamond',color,x,h+.19,0,.157,.11,.14);
          add('fine',old,x,h-.18,0,.15,.063,.14);
        } else {
          add(motif==='bell'?'cone':'fine',color,x,h,0,.14,h*.92,.14,x*.34);
          add('fine',old,x,h-.14,.012,.155,.053,.153);
          add('sphere',cream,x,h-.195,.015,.05,.052,.052);
        }
      }
      break;
    }
    case 'coin': case 'gear': case 'comb': case 'lens': case 'seal': {
      const flat = motif!=='lens';
      for(const [i,x] of [-.25,0,.25].entries()){
        const y=i===1?.44:.26;
        if(flat) part(group,'cyl',color,x,y,0,i===1?.24:.18,.14,i===1?.24:.18,Math.PI/2);
        else add('fine',color,x,y,.04,.23,.24,.11);
        loop(ring,i===1?cream:old,x,y,.12,.133,.133);
        add(motif==='comb'?'diamond':'sphere',old,x,y,.13,.091,.091,.064);
        if(motif==='gear'&&i===1) for(let n=0;n<8;n++){
          const a=n*Math.PI/4;
          add('cube',color,x+Math.sin(a)*.25,y+Math.cos(a)*.25,0,.086,.087,.11,-a);
        }
      }
      break;
    }
    default: {
      const shapes={amber:[.15,.32,.13,'diamond'],bead:[.11,.18,.13,'sphere'],berry:[.18,.21,.18,'fine'],
        cloud:[.24,.22,.19,'fine'],cone:[.21,.23,.18,'diamond'],drop:[.14,.30,.13,'fine'],
        pearl:[.16,.16,.16,'sphere'],pebble:[.23,.14,.20,'low'],seed:[.128,.25,.15,'fine']};
      const [sx,sy,sz,shape]=shapes[motif];
      for(const [i,x] of [-.30,0,.30].entries()){
        const y=i===1 ?.44 :.22;
        add(shape,i===1?color:old,x,y,0,sx,sy*(i===1?1.15:.83),sz,x*.85);
        if(motif==='berry'||motif==='cone') add('diamond',i===1?old:color,x,y+sy*.81,0,.10,.13,.10,.36);
        if(motif==='cloud'||motif==='bead') add('sphere',cream,x+.13,y-.10,.075,sx*.63,sy*.69,sz*.62);
        if(motif==='drop'||motif==='pearl') add('sphere',cream,x-.033,y+.075,sz*.77,.048,.061,.044);
      }
    }
  }
}

export function addEvolutionShape(actor, spec, part, material, branch) {
  if (!spec.evolution) return;
  const {stage,motif,originalAccent} = spec.evolution;
  const {group,model,kind,head,tail,wings} = actor;
  const size = stage===1 ? 1.12 : 1.24;
  group.scale.setScalar(size);
  for (const wing of wings??[]) wing.scale.set(1+stage*.18,1+stage*.11,1+stage*.15);
  const mount = mounts[kind];
  const positions = mount
    ? (['axolotl','sprite'].includes(kind) ? [1,-1] : [1]).map(side=>[actor[mount[0]],side*mount[1],mount[2],mount[3],mount[4],side])
    : wings.map((wing,i)=>[wing,(i?1:-1)*(kind==='gull'?.54:kind==='silkskip'?.73:.46),.09,-.12,.40,i?1:-1]);
  const adorn = (parent,x,y,z,span,side) => {
    const feature = new Group();
    feature.name = 'evolution-detail';
    feature.position.set(x,y,z);
    const scale = span*(stage===1?.95:1.35);
    feature.scale.set(scale*side,scale,scale);
    if (wings?.includes(parent)) {
      feature.rotation.z = side*-.82;
      feature.rotation.x = -.55;
    }
    parent.add(feature);
    decoration(feature,motif,spec.accent,originalAccent,stage,part,material,branch);
  };
  positions.forEach(position=>adorn(...position));

  if(kind==='unicorn') {
    // The four legs, one spiral horn and equine head are inherited at both stages.
    for(const child of actor.head.children){
      if(child.geometry?.type==='CylinderGeometry'&&child.children.length===4){
        child.scale.y *= 1+stage*.19;
        child.position.y += stage*.04;
      }
    }
    const lift=stage*.11;
    for(const body of model.children) {
      body.position.y+=lift;
      if(body.isMesh) body.scale.z*=1+stage*.09;
    }
    head.scale.set(1-stage*.032,1-stage*.014,1+stage*.057);
    tail.position.z-=stage*.065;
    tail.scale.set(1+stage*.10,1+stage*.12,1+stage*.21);
    for(const leg of actor.legs){
      leg.position.z*=1+stage*.11;
      leg.scale.y=(.91+lift)/.91;
      part(leg,'fine',spec.accent,0,-.60,-.053,.158,.153,.16,-.3);
    }
  }
  if(kind==='fox') {
    tail.scale.set(1+stage*.15,1+stage*.17,1+stage*.25);
    head.scale.z=1+stage*.08;
  }
  if(kind==='silkskip') tail.scale.set(1,1,1+stage*.22);
  if(kind==='dragon') tail.scale.set(1+stage*.14,1+stage*.12,1+stage*.22);
  if(kind==='turtle'||kind==='crab'||kind==='rollbud') model.scale.x=1+stage*.12;
  if(kind==='belljelly') {
    const fringe=model.children[0];
    for(const child of fringe.children)
      if(child.isMesh&&child.position.y<-.3) child.scale.y *= 1+stage*.23;
  }
}
