import * as T from 'three';

const stride=1.2;
const range=24;
const offsets=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]];
const color=['#ff4f9a','#ffc760','#eeff8a','#48f6cb','#7cdcff','#d7a3ff'].map(hex=>new T.Color(hex));
const separation=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

function clearSegment(start,end,walk){
  const count=Math.ceil(separation(start,end)/.42);
  for(let i=1;i<=count;i++){
    if(!walk(T.MathUtils.lerp(start.x,end.x,i/count),T.MathUtils.lerp(start.z,end.z,i/count))) return false;
  }
  return true;
}

export function trailPath(start,target,walk){
  const distance=separation(start,target);
  if(distance<.18) return [start];
  const ratio=Math.min(1,range/distance);
  const end={x:T.MathUtils.lerp(start.x,target.x,ratio),z:T.MathUtils.lerp(start.z,target.z,ratio)};
  if(clearSegment(start,end,walk)) return [start,end];

  const key=(col,row)=>col+':'+row;
  const origin={...start,col:0,row:0,g:0,h:separation(start,end),parent:null};
  const open=[origin], visited=new Map([[key(0,0),origin]]);
  let best=origin;
  while(open.length&&visited.size<2100){
    let bestIndex=0;
    for(let i=1;i<open.length;i++){
      if(open[i].g+open[i].h*1.1<open[bestIndex].g+open[bestIndex].h*1.1) bestIndex=i;
    }
    const current=open.splice(bestIndex,1)[0];
    if(current!==visited.get(key(current.col,current.row))) continue;
    if(current.h<best.h) best=current;
    if(current.h<stride*1.6&&clearSegment(current,end,walk)){
      best={...end,parent:current};break;
    }
    for(const [dx,dz] of offsets){
      const col=current.col+dx,row=current.row+dz;
      if(Math.abs(col)>21||Math.abs(row)>21) continue;
      const x=start.x+col*stride,z=start.z+row*stride;
      const g=current.g+Math.hypot(dx,dz)*stride,k=key(col,row);
      if(g>=(visited.get(k)?.g??Infinity)||!clearSegment(current,{x,z},walk)) continue;
      const next={x,z,col,row,g,h:separation({x,z},end),parent:current};
      visited.set(k,next);open.push(next);
    }
  }

  const path=[];
  for(let node=best;node;node=node.parent) path.unshift(node);
  const waypoints=[path[0]];
  for(let i=0;i<path.length-1;){
    let next=path.length-1;
    while(next>i+1&&!clearSegment(path[i],path[next],walk)) next--;
    waypoints.push(path[next]);i=next;
  }
  return waypoints;
}

export function connectTrail(start,path,walk){
  let nearest=null,segment=0,best=Infinity;
  for(let i=1;i<path.length;i++){
    const a=path[i-1],b=path[i],dx=b.x-a.x,dz=b.z-a.z,length=dx*dx+dz*dz;
    if(!length) continue;
    const t=T.MathUtils.clamp(((start.x-a.x)*dx+(start.z-a.z)*dz)/length,0,1);
    const point={x:a.x+t*dx,z:a.z+t*dz};
    const gap=separation(start,point);
    if(gap<=best&&clearSegment(start,point,walk)){
      nearest=point;segment=i;best=gap;
    }
  }
  if(!nearest) return [];
  const ahead=path.slice(segment);
  if(separation(start,ahead[0])<.06) return [start,...ahead.slice(1)];
  if(clearSegment(start,ahead[0],walk)) return [start,...ahead];
  return clearSegment(nearest,ahead[0],walk)?[start,nearest,...ahead]:[];
}

export function createItemTrail(scene){
  const capacity=72;
  const geometry=new T.BufferGeometry();
  const coords=new Float32Array(capacity*3),tints=new Float32Array(capacity*3);
  const ribbonGeometry=new T.BufferGeometry();
  const ribbonPositions=new Float32Array(capacity*6*3),ribbonColors=new Float32Array(capacity*6*3);
  ribbonGeometry.setAttribute('position',new T.BufferAttribute(ribbonPositions,3).setUsage(T.DynamicDrawUsage));
  ribbonGeometry.setAttribute('color',new T.BufferAttribute(ribbonColors,3).setUsage(T.DynamicDrawUsage));
  const ribbonMaterial=new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.69,side:T.DoubleSide,depthWrite:false,toneMapped:false});
  const ribbon=new T.Mesh(ribbonGeometry,ribbonMaterial);
  ribbon.name='Item tracking ribbon';ribbon.frustumCulled=false;ribbon.visible=false;scene.add(ribbon);
  geometry.setAttribute('position',new T.BufferAttribute(coords,3).setUsage(T.DynamicDrawUsage));
  geometry.setAttribute('hue',new T.BufferAttribute(tints,3));
  for(let i=0;i<capacity;i++) color[Math.floor(i/2)%color.length].toArray(tints,i*3);
  const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const material=new T.ShaderMaterial({
    uniforms:{time:{value:0},density:{value:Math.min(devicePixelRatio||1,1.5)}},
    transparent:true,depthWrite:false,toneMapped:false,
    vertexShader:`
      attribute vec3 hue;
      uniform float time,density;
      varying vec3 tint;
      varying float shimmer;
      void main() {
        float pulse = sin(float(gl_VertexID)*.74-time*5.6);
        vec4 p = modelViewMatrix * vec4(position+vec3(0., pulse*.075, 0.),1.);
        gl_Position=projectionMatrix*p;
        gl_PointSize = clamp(205./max(1.,-p.z),5.,28.) * density * (.90+.17*pulse);
        tint=hue;
        shimmer=.73+.25*pulse;
      }`,
    fragmentShader:`
      varying vec3 tint;
      varying float shimmer;
      void main() {
        vec2 p=abs(gl_PointCoord-.5);
        float d=sqrt(p.x)+sqrt(p.y);
        float star=1.-smoothstep(.56,.69,d);
        float glow=1.-smoothstep(.05,.48,length(p));
        float core=1.-smoothstep(.1,.47,d);
        gl_FragColor=vec4(mix(tint,vec3(1.,1.,.91),core),max(star,glow*.67)*shimmer);
        #include <colorspace_fragment>
      }`
  });
  const points=new T.Points(geometry,material);
  points.name='Item tracking sparkles';points.frustumCulled=false;points.visible=false;scene.add(points);

  return {
    tick(time){material.uniforms.time.value=reduced?0:time;},
    draw(path,height){
      ribbon.visible=points.visible=path.length>1;
      if(!points.visible) return;
      let count=0,face=0,carry=0,passed=0,lastEdge=null;
      for(let i=1;i<path.length&&count<capacity;i++){
        const a=path[i-1],b=path[i],length=separation(a,b);
        if(length<.001) continue;
        for(;carry<=length&&count<capacity;carry+=.59){
          const t=carry/length,dx=(b.z-a.z)/length,dz=(a.x-b.x)/length;
          const x=T.MathUtils.lerp(a.x,b.x,t),z=T.MathUtils.lerp(a.z,b.z,t);
          const distance=passed+carry;
          const shift=Math.sin(distance*3.4)*.33*T.MathUtils.smoothstep(distance,.35,2);
          const y=height(x,z,passed+carry)+.35;
          coords.set([x+dx*shift,y+.28+Math.cos(count*1.6)*.17,z+dz*shift],count*3);
          const edge=[[x+dx*.075,y,z+dz*.075],[x-dx*.075,y,z-dz*.075]];
          if(lastEdge){
            const corners=[lastEdge[0],lastEdge[1],edge[0],edge[0],lastEdge[1],edge[1]];
            for(let j=0;j<corners.length;j++){
              const index=j===0||j===1||j===4?count-1:count;
              const offset=(face*6+j)*3;
              ribbonPositions.set(corners[j],offset);
              color[Math.floor(index/2)%color.length].toArray(ribbonColors,offset);
            }
            face++;
          }
          lastEdge=edge;count++;
        }
        carry-=length;passed+=length;
      }
      geometry.setDrawRange(0,count);
      geometry.attributes.position.needsUpdate=true;
      ribbonGeometry.setDrawRange(0,face*6);
      ribbonGeometry.attributes.position.needsUpdate=true;
      ribbonGeometry.attributes.color.needsUpdate=true;
    },
    destroy(){
      points.removeFromParent();geometry.dispose();material.dispose();
      ribbon.removeFromParent();ribbonGeometry.dispose();ribbonMaterial.dispose();
    }
  };
}
