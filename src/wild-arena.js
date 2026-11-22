import * as T from 'three';
import {animate,creature,material,part} from './models.js';

const ringRadius=6.15;
const fighterGap=2.25;
const turnDurations={strike:.58,counter:.73,jab:.49,heavy:.66,guard:.43,focus:.65,brace:.43};
const attacks=new Set(['strike','counter','jab','heavy']);
const gold='#ffe4a4', mint='#b6ffe0', lilac='#e2cbff';
const ease=t=>t*t*(3-2*t);
const clamp=T.MathUtils.clamp;

export function createWildArena(pet,rival,{sprout=false,reducedMotion=false}={}) {
  const scene=new T.Scene(), camera=new T.PerspectiveCamera(40,1,.1,125);
  const owned=[];
  let width=0,height=0,time=0,turn=null;
  function own(asset){
    owned.push(asset);
    return asset;
  }
  const surface=(geometry,color,y)=>{
    const mesh=new T.Mesh(own(geometry),material(color));
    mesh.position.y=y;
    mesh.receiveShadow=true;
    scene.add(mesh);
    return mesh;
  };
  const floorRing=(inner,outer,color,y,x=0)=>{
    const mesh=surface(new T.RingGeometry(inner,outer,72),color,y);
    mesh.rotation.x=-Math.PI/2;
    mesh.position.x=x;
  };

  scene.background=new T.Color('#bcdde2');
  scene.fog=new T.FogExp2('#c6e1e0',.019);
  scene.add(new T.HemisphereLight('#fff3dc','#9694a9',1.65));
  const sun=new T.DirectionalLight('#fff0cd',2.55);
  sun.position.set(-5,10,6);
  sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:27});
  sun.shadow.normalBias=.035;
  sun.shadow.bias=-.0002;
  scene.add(sun);

  surface(new T.CylinderGeometry(44,44,.5,64),'#8eb489',-1.13);
  surface(new T.CylinderGeometry(6.82,7.06,.5,72),'#829a80',-.65);
  surface(new T.CylinderGeometry(6.53,6.62,.3,72),'#d9c7a5',-.30);
  surface(new T.CylinderGeometry(ringRadius,6.45,.15,72),'#e6cc9a',-.075);
  floorRing(5.46,5.51,'#fff1c9',.009);
  floorRing(5.74,5.88,'#a79e77',.008);
  floorRing(.99,1.025,'#fff3ce',.009,-fighterGap);
  floorRing(.99,1.025,'#fff3ce',.009,fighterGap);
  floorRing(.38,.965,'#ecd8ae',.008,-fighterGap);
  floorRing(.38,.965,'#ecd8ae',.008,fighterGap);

  const scenery=new T.Group();
  scene.add(scenery);
  for(let i=0;i<7;i++){
    const angle=i/7*Math.PI*2;
    part(scenery,'low','#e7ae91',Math.cos(angle)*.39,.012,Math.sin(angle)*.39,.24,.017,.11,0,-angle);
  }
  part(scenery,'low','#fff3ce',0,.016,0,.16,.024,.16);
  for(let i=0;i<34;i++){
    const a=i/34*Math.PI*2;
    const x=Math.cos(a)*6.27,z=Math.sin(a)*6.27;
    part(scenery,'low',i%4===0?'#d2bb95':'#e9d9b7',x,-.078,z,.27,.17,.25,0,a);
  }
  for(const [x,z] of [[-5.8,-3.75],[-3.15,-6.1],[3.15,-6.1],[5.8,-3.75]]){
    part(scenery,'cube','#879d86',x,-.52,z,.87,.32,.85);
    part(scenery,'cyl','#a7b49a',x,.01,z,.25,1.05,.25);
    part(scenery,'cube','#e6d2ac',x,.54,z,.66,.18,.66,0,.13);
    part(scenery,'diamond','#ffd191',x,.84,z,.21,.34,.21);
    part(scenery,'cone','#9f7d84',x,1.18,z,.34,.41,.34,0,.13);
  }
  for(let i=0;i<13;i++){
    const x=(i-6)*3.6,z=-11-(i%3)*2.65;
    const size=1.95+(i%4)*.39;
    part(scenery,'low',i%2?'#87b5ad':'#a3c3ad',x,-.85,z-12,6,2.7+(i%3)*1.03,5.8,0,i);
    part(scenery,'cyl','#987485',x,.58,z,.23,2.97,.23,0,0,(i%3-1)*.13);
    part(scenery,'low','#81a880',x,-.54,z,1.08,.40,.94,0,i);
    for(let j=0;j<4;j++){
      const a=j*1.6+i;
      part(scenery,'soft',['#dfa6b9','#e9b8c6','#cba6c2','#f2c6c5'][j],
        x+Math.cos(a)*.74,2.45+Math.sin(a)*.57,z+Math.sin(a)*.83,size*.68,size*.49,size*.61,0,a);
    }
  }
  for(let i=0;i<62;i++){
    const a=i*2.39996, radius=7+(i%9)*.48;
    const x=Math.cos(a)*radius,z=Math.sin(a)*radius;
    const high=.18+(i%5)*.066;
    part(scenery,'low',i%3?'#7fa679':'#a1be8c',x,-.72,z,.52,.35,.38,0,a);
    part(scenery,'cyl','#7f9e72',x,-.63+high/2,z,.023,high,.023,0,0,.17);
    part(scenery,'soft',['#f1b1be','#e9c3dd','#fff1b3'][i%3],x-.02,-.64+high,z,.13,.057,.11,0,a);
  }
  scenery.traverse(mesh=>{
    if(mesh.isMesh) mesh.castShadow=mesh.receiveShadow=false;
  });

  const fighter=(spec,name,side,young=false)=>{
    const actor=creature(spec);
    const bounds=new T.Box3().setFromObject(actor.group);
    const height=bounds.max.y-bounds.min.y;
    const scale=clamp(2/height,.89,1.54)*(young?.87:1);
    actor.group.name=name;
    actor.group.scale.setScalar(scale);
    actor.group.rotation.y=-side*Math.PI/2;
    actor.group.position.x=side*fighterGap;
    scene.add(actor.group);
    return {actor,side,defeated:false,down:0,scale,reach:bounds.max.z*scale,
      tailReach:-bounds.min.z*scale,hitHeight:height*scale*.58};
  };
  const player=fighter(pet,'arena-companion',-1,sprout);
  const opponent=fighter(rival,'arena-wild',1);
  const halfWidth=fighterGap+Math.max(player.tailReach,opponent.tailReach)+.66;

  const effects=new T.Group();
  effects.name='arena-effects';
  scene.add(effects);
  const effectMaterial=own(new T.MeshBasicMaterial({color:gold,transparent:true,opacity:0,depthWrite:false}));
  const haloGeometry=own(new T.TorusGeometry(1,.024,9,44));
  const halo=new T.Mesh(haloGeometry,effectMaterial);
  effects.add(halo);
  const moteGeometry=own(new T.OctahedronGeometry(.115));
  const motes=Array.from({length:9},()=>{
    const mesh=new T.Mesh(moteGeometry,effectMaterial);
    effects.add(mesh);
    return mesh;
  });

  function pose(fighter,dt){
    const {actor,side,scale}=fighter;
    fighter.down=fighter.defeated?Math.min(1,fighter.down+dt*5):0;
    animate(actor,(reducedMotion?0:time)+side,false);
    actor.group.position.set(side*fighterGap,0,0);
    actor.group.rotation.z=side*.32*fighter.down;
    actor.model.scale.y=1-.36*fighter.down;
    actor.model.position.y*=1-.68*fighter.down;
    actor.head.rotation.x=.24*fighter.down;
    actor.group.scale.setScalar(scale);
  }

  function showEffect(fighter,kind,amount){
    if(amount<=0) return;
    const protectedMove=kind==='guard', restoring=kind==='focus';
    effects.visible=true;
    effects.position.copy(fighter.actor.group.position);
    effects.position.y+=restoring?.24:fighter.hitHeight;
    halo.rotation.set(restoring?Math.PI/2:0,protectedMove?fighter.side*.6:0,0);
    halo.scale.setScalar((protectedMove?.93:.72)+.47*amount);
    effectMaterial.color.set(protectedMove?lilac:restoring?mint:gold);
    effectMaterial.opacity=.72*amount;
    for(let i=0;i<motes.length;i++){
      const angle=i/motes.length*Math.PI*2;
      const spread=.52+(1-amount)*.85;
      motes[i].position.set(Math.cos(angle)*spread,restoring?.16+(1-amount)*1.8:Math.sin(angle)*spread,restoring?Math.sin(angle)*spread:.12);
      motes[i].rotation.set(time*2+i,time*1.3+i,0);
      motes[i].scale.setScalar(.52+.66*amount);
    }
  }

  function drawTurn(step,progress){
    const source=step.actor==='player'?player:opponent;
    const target=source===player?opponent:player;
    const {move}=step,attack=attacks.has(move);
    const {actor,side}=source;
    const pulse=Math.sin(Math.PI*progress);
    if(attack){
      const push=progress<.2?-.22*Math.sin(progress/.2*Math.PI):
        progress<.51?ease((progress-.2)/.31):1-ease((progress-.51)/.49);
      const reach=2*fighterGap-source.reach-target.reach+(move==='heavy'?.22:.06);
      if(!reducedMotion){
        animate(actor,time,true);
        actor.group.position.x-=side*reach*push;
        actor.group.position.y=.34*Math.max(0,push);
        actor.group.rotation.z=side*.18*push;
        actor.head.rotation.x=-.16*push;
      }
      if(move==='counter'&&progress<.24) showEffect(source,'guard',Math.sin(progress/.24*Math.PI));
      if(progress>=.48){
        const force=1-clamp((progress-.48)/.5,0,1);
        if(!reducedMotion&&!step.guarded){
          target.actor.group.position.x+=target.side*force*.32;
          target.actor.group.rotation.z-=target.side*force*.21;
        }
        showEffect(target,step.guarded?'guard':'hit',force);
      }
    } else {
      if(!reducedMotion){
        actor.model.scale.y*=1+(move==='focus'?.15:-.16)*pulse;
        actor.group.position.y=move==='focus'?.20*pulse:0;
        actor.head.rotation.x=(move==='focus'?-.18:.38)*pulse;
      }
      showEffect(source,move==='focus'?'focus':'guard',pulse);
    }
  }

  function frame(renderer,dt,w,h){
    if(w!==width||h!==height){
      width=w;height=h;
      camera.aspect=w/h;
      const distance=Math.max(11.7,halfWidth/(Math.tan(T.MathUtils.degToRad(camera.fov/2))*camera.aspect));
      camera.position.set(distance*.115,.88+distance*.305,distance*.95);
      camera.lookAt(0,.66,0);
      camera.updateProjectionMatrix();
    }
    time+=dt;
    pose(player,dt);pose(opponent,dt);
    effects.visible=false;
    if(turn){
      const step=turn.steps[turn.index];
      turn.time+=dt;
      const progress=Math.min(1,turn.time/(reducedMotion?.22:turnDurations[step.move]));
      if(!turn.hit&&progress>=.48){
        turn.hit=true;
        player.defeated=step.hp===0;
        opponent.defeated=step.rivalHP===0;
        turn.onImpact(step);
      }
      drawTurn(step,progress);
      renderer.render(scene,camera);
      if(progress===1){
        turn.index++;
        turn.time=0;turn.hit=false;
        if(turn.index<turn.steps.length) turn.onStep(turn.steps[turn.index]);
        else {
          const {onComplete}=turn;
          turn=null;
          onComplete();
        }
      }
      return;
    }
    renderer.render(scene,camera);
  }

  return {
    frame,
    play(steps,onStep,onImpact,onComplete){
      turn={steps,onStep,onImpact,onComplete,index:0,time:0,hit:false};
      onStep(steps[0]);
    },
    dispose(){
      sun.shadow.dispose();
      for(const asset of owned) asset.dispose();
    }
  };
}
