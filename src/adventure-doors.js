import * as T from 'three';
import {part} from './models.js';
import {roomPoint} from './spirehaven-rooms.js';

const arrowShape=new T.Shape().moveTo(-.13,.42).lineTo(.13,.42).lineTo(.13,-.02)
  .lineTo(.39,-.02).lineTo(0,-.47).lineTo(-.39,-.02).lineTo(-.13,-.02).closePath();
const arrowGeometry=new T.ShapeGeometry(arrowShape);
const arrowOutline=new T.MeshBasicMaterial({color:'#664258',side:T.DoubleSide});
const arrowFace=new T.MeshBasicMaterial({color:'#ffdd80',side:T.DoubleSide});
const caveMouth=new T.Shape().moveTo(-1.08,0).lineTo(-1.16,.86).lineTo(-.92,1.68)
  .lineTo(-.49,2.13).lineTo(.36,2.27).lineTo(.92,1.83).lineTo(1.13,1.02).lineTo(1.07,0).closePath();
const shadowedMouth=new T.ShapeGeometry(caveMouth);
const mouthMaterial=new T.MeshBasicMaterial({color:'#272035',side:T.DoubleSide});

export function roomDoorSignal(room,height){
  const [forward,lift]=['cask','orbit'].includes(room.work)?[2.48,2.38]:room.service==='market'?[2.10,1.90]:[1.58,2.58];
  const [x,z]=roomPoint(room,0,room.depth/2+forward);
  return {x,z,y:height(room.x,room.z)+lift,radius:27};
}

export function createDoorSignals(scene){
  const markers=[];
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function add({x,y,z,radius=31,enabled=()=>true}){
    const group=new T.Group();
    const edge=new T.Mesh(arrowGeometry,arrowOutline);
    edge.scale.set(1.16,1.12,1);edge.position.z=-.025;
    const face=new T.Mesh(arrowGeometry,arrowFace);
    group.add(edge,face);group.position.set(x,y,z);
    scene.add(group);markers.push({group,y,radius,enabled});
  }
  return {add,update(t,player,camera){
    for(const [i,{group,y,radius,enabled}] of markers.entries()){
      const distance=Math.hypot(player.x-group.position.x,player.z-group.position.z);
      group.visible=distance<radius&&enabled();
      if(!group.visible) continue;
      const pulse=still?0:Math.sin(t*3.15+i*.74);
      group.position.y=y+pulse*.22;
      group.scale.setScalar(1+pulse*.15);
      // Keep the arrow upright and outside the lintel even when the camera pitches down.
      group.rotation.y=Math.atan2(camera.position.x-group.position.x,camera.position.z-group.position.z);
    }
  }};
}

export function cavePoints(entrance,x,z){
  const c=Math.cos(entrance.yaw??0),s=Math.sin(entrance.yaw??0);
  return [entrance.x+c*x+s*z,entrance.z-s*x+c*z];
}

export function caveObstructs(entrance,x,z){
  const dx=x-entrance.x,dz=z-entrance.z,c=Math.cos(entrance.yaw??0),s=Math.sin(entrance.yaw??0);
  const across=c*dx-s*dz,depth=s*dx+c*dz;
  return Math.abs(across)<3.1&&depth>-4.75&&depth<-.27||
    Math.abs(across)>.98&&Math.abs(across)<2.55&&depth>=-.27&&depth<.43;
}

export function drawCave(scene,entrance,height){
  const root=new T.Group();
  root.position.set(entrance.x,height(entrance.x,entrance.z),entrance.z);
  root.rotation.y=entrance.yaw??0;
  scene.add(root);
  const stone=['#9b8c99','#a99ba2','#82798a','#beb0ac','#786b80'];
  const style=entrance.style??entrance.id;
  const tag=style==='prismfault'?'#bd9cdb':style==='bellhollow'?'#e0b477':'#a9c6a2';
  const rock=(color,x,y,z,a,b,c,angle)=>part(root,'low',color,x,y,z,a,b,c,.18,angle,-.13);
  for(const [x,y,z,a,b,c] of [
    [-2.17,.76,-.12,1.10,1.32,1.14],[2.08,.81,-.23,1.04,1.34,1.19],
    [-1.52,1.65,-.50,.89,1.14,1.22],[1.62,1.53,-.47,.89,1.16,1.13],
    [-.74,2.25,-.57,1.13,.71,1.15],[.64,2.24,-.52,1.14,.71,1.22],
    [0,2.82,-1.74,1.69,1.01,1.35],[-1.52,1.90,-2.32,1.41,1.44,1.57],
    [1.55,1.66,-2.64,1.43,1.53,1.67],[0,1.06,-3.55,2.01,1.42,1.12]
  ]){
    const i=Math.round((x+3)*7+z*9);
    rock(stone[Math.abs(i)%stone.length],x,y,z,a,b,c,i*.23);
  }
  const mouth=new T.Mesh(shadowedMouth,mouthMaterial);
  mouth.position.set(0,-.05,.20);root.add(mouth);
  for(const [i,x,z] of [[0,-2.8,.7],[1,2.7,1.38],[2,-1.51,.28],[3,1.65,.72]]){
    const [wx,wz]=cavePoints(entrance,x,z),y=height(wx,wz)-root.position.y;
    rock(stone[(i+1)%stone.length],x,y+.1,z,.36+i%2*.15,.27,.37,i);
    part(root,'diamond',tag,x,y+.39,z+.12,.086,.23,.12,0,i,.18-i*.1);
  }
  for(const side of [-1,1]){
    const x=side*1.38,z=.54;
    const [wx,wz]=cavePoints(entrance,x,z),y=height(wx,wz)-root.position.y;
    part(root,'cyl','#76566a',x,y+.76,z,.058,1.51,.062);
    part(root,'cube','#f4ce91',x,y+1.52,z,.20,.29,.20);
    part(root,'cone','#856e83',x,y+1.73,z,.20,.16,.20);
  }
}
