import * as T from 'three';
import {traveler} from './traveler.js';
import {animate} from './models.js';
import {disposeHuman} from './human.js';

const size=168;
const phaseCount=6;

export function createPropertyAvatar(look,gameRenderer){
  const renderer=gameRenderer??new T.WebGLRenderer({alpha:true});
  if(!gameRenderer){
    renderer.outputColorSpace=T.SRGBColorSpace;
    renderer.toneMapping=T.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.06;
  }
  const target=new T.WebGLRenderTarget(size,size,{colorSpace:T.SRGBColorSpace,samples:4});
  const scene=new T.Scene();
  const avatar=traveler(look);
  const key=new T.DirectionalLight('#fff1d7',2.55);
  key.position.set(-3,4,4);
  scene.add(new T.HemisphereLight('#ffefe3','#b5abc6',1.8),key,avatar.group);
  const camera=new T.OrthographicCamera(-1.64,1.64,1.64,-1.64,.1,20);
  camera.position.set(0,3.8,6);
  camera.lookAt(0,1.02,0);
  camera.updateMatrixWorld();
  const origin=new T.Vector3().project(camera);
  const frames=new Map();
  const pixels=new Uint8Array(size*size*4);

  function sprite(direction,pose){
    const id=direction+':'+pose;
    if(frames.has(id)) return frames.get(id);
    avatar.group.rotation.y=direction*Math.PI/4;
    animate(avatar,pose<0?0:pose/phaseCount*Math.PI*2/10,pose>=0);
    const previousTarget=renderer.getRenderTarget(),alpha=renderer.getClearAlpha();
    try{
      renderer.setClearAlpha(0);
      renderer.setRenderTarget(target);
      renderer.render(scene,camera);
      renderer.readRenderTargetPixels(target,0,0,size,size,pixels);
    }finally{
      renderer.setRenderTarget(previousTarget);
      renderer.setClearAlpha(alpha);
    }
    const image=document.createElement('canvas');
    image.width=image.height=size;
    const ctx=image.getContext('2d'),data=ctx.createImageData(size,size);
    for(let row=0;row<size;row++){
      const offset=(size-1-row)*size*4;
      data.data.set(pixels.subarray(offset,offset+size*4),row*size*4);
    }
    ctx.putImageData(data,0,0);
    frames.set(id,image);
    return image;
  }

  return {
    draw(ctx,x,y,direction,step,moving){
      const extent=124;
      const phase=moving?Math.floor(step/(Math.PI*2)*phaseCount)%phaseCount:-1;
      const frame=sprite(direction,phase);
      ctx.fillStyle='#55413145';
      ctx.beginPath();ctx.ellipse(x,y+1,15,5.6,0,0,Math.PI*2);ctx.fill();
      ctx.drawImage(frame,x-(.5+origin.x*.5)*extent,y-(.5-origin.y*.5)*extent,extent,extent);
    },
    destroy(){
      disposeHuman(avatar.group);
      target.dispose();
      if(!gameRenderer){renderer.dispose();renderer.forceContextLoss();}
      frames.clear();
    }
  };
}
