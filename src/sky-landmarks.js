import * as T from 'three';
import {branch,part} from './models.js';
import {celMaterial} from './cel.js';
import {skyCounterPoint} from './sky-islands.js';

const brass='#d4a16d',wood='#8a6869',cream='#fff0c9';
const blueGlass=celMaterial('#9ae0ec',{emissive:'#658bc8',emissiveIntensity:.25});
const lantern=celMaterial('#ffc573',{emissive:'#ffc170',emissiveIntensity:.65});
const jade=celMaterial('#74bcab',{emissive:'#91d7ae',emissiveIntensity:.18});

export function buildSkyLandmark(parent,place,island,height,blockers){
  const site=new T.Group();
  const x=place.x,z=place.z-7;
  site.position.set(x,height(x,z),z);parent.add(site);
  const y=(a,b)=>height(x+a,z+b)-site.position.y;
  function cylinder(color,x,y,z,rx,h,rz=rx){part(site,'cyl',color,x,y,z,rx,h,rz);}
  function block(radius){blockers.push([x,z,radius]);}
  if(island.biome==='ice'){
    for(let i=0;i<12;i++){
      const a=i*2.4,r=i<3?1.1+i*.55:4.1+i%3*.35,dx=Math.cos(a)*r,dz=Math.sin(a)*r;
      const h=i<3?2.9+i*.68:.72+(i%4)*.37;
      part(site,'diamond',i%3?blueGlass:'#c2bbeb',dx,y(dx,dz)+h*.55,dz,h*.26,h,h*.22,0,a,.15*Math.sin(a));
      part(site,'fine','#e9f3ed',dx,y(dx,dz)+.05,dz,h*.42,.15,h*.32);
    }
    for(let i=0;i<22;i++){
      const a=i/21*Math.PI-.1;
      part(site,'fine',i<10?'#b6edd8':'#c4cfef',Math.cos(a)*4.7,1.9+Math.sin(a)*3.85,-2+i*.03,.34,.18,.16,0,0,a);
    }
    block(2.2);
  }else if(island.biome==='willow'){
    for(let i=0;i<8;i++){
      const a=i*2.4,dx=Math.sin(a)*(1.9+i%3*.55),dz=Math.cos(a)*(2.1+i%3*.63);
      branch(site,wood,[0,.28,0],[dx,y(dx,dz)+.13,dz],.32);
      branch(site,'#8e6f6a',[0,.4,0],[dx,3.5+i%3,dz],.23);
      part(site,'fine',i%2?'#7eaf8a':'#a8c58b',dx,3.9+i%3,dz,1.7,1.18,1.59);
      for(let k=0;k<3;k++){
        const xx=dx+(k-1)*.54,zz=dz+.81;
        branch(site,'#8ca283',[xx,3.86+i%3,zz],[xx+.1,2.4+i%3-k*.22,zz],.034);
        if(k===1) part(site,'diamond',lantern,xx+.1,2.32+i%3-k*.22,zz,.15,.32,.15);
      }
    }
    cylinder(wood,0,1.58,0,.44,3.16);
    block(1.22);
  }else if(island.biome==='sandstone'){
    for(let i=0;i<7;i++){
      const dx=(i-3)*.69,dz=Math.cos(i*.7)*.7, h=2.3+Math.sin(i*.53)*2.35;
      cylinder(i%2?brass:'#c38171',dx,y(dx,dz)+h*.5,dz,.25,h);
      cylinder('#f0cb91',dx,y(dx,dz)+h,dz,.35,.22);
      part(site,'fine','#6f575e',dx,y(dx,dz)+h+.109,dz,.19,.025,.19);
    }
    part(site,'cube','#dbaa8e',0,.15,0,5.6,.29,2.73);
    for(let i=0;i<9;i++){
      const a=i*2.4,r=3.7+i%3*.52,dx=Math.sin(a)*r,dz=Math.cos(a)*r;
      for(let k=0;k<6;k++)part(site,'fine','#86aa88',dx+Math.cos(k)*.19,y(dx,dz)+.35,dz+Math.sin(k)*.19,.12,.64,.14,.33,k,.5);
    }
    block(2.1);
  }else if(island.biome==='shell'){
    cylinder('#b0c7b5',0,.16,0,4.35,.42,3.1);
    cylinder(blueGlass,0,.391,0,3.93,.048,2.72);
    for(let i=0;i<15;i++){
      const a=i*2.4,dx=Math.sin(a)*(3.6+i%4*.33),dz=Math.cos(a)*(2.85+i%3*.37);
      for(let k=0;k<5;k++)part(site,'fine',i%2?'#edc5bc':'#b4dbd2',dx+k*.089,y(dx,dz)+.14+k*.058,dz,.37-k*.029,.18,.21,0,a,k*.12);
      if(i%3===0)part(site,'fine','#fff3db',dx,y(dx,dz)+.48,dz,.20,.18,.21);
    }
    block(3.1);
  }else if(island.biome==='roost'){
    for(const side of [-1,1]){
      cylinder('#aaa2b3',side*1.52,1.58,0,.39,3.15);
      part(site,'cube','#6f668d',side*.86,3.36,0,2.24,.22,2.7,0,0,side*-.48);
      part(site,'cube','#b69ca0',side*1.12,1.08,0,.83,.18,1.55);
    }
    part(site,'cube','#c3b4c3',0,.16,0,4.06,.31,2.97);
    branch(site,wood,[-1.54,2.7,.81],[1.54,2.7,.81],.063);
    for(let i=0;i<6;i++)part(site,'cube',i%2?'#ead2ab':'#dfb9c8',(i-2.5)*.4,2.46-Math.sin(i*.6)*.12,.85,.29,.39,.052,0,0,(i-3)*.085);
    block(1.55);
  }else{
    for(let i=0;i<3;i++){
      const dx=(i-1)*2.58,dz=-i*.59,h=.3+i*.44;
      part(site,'cube','#d6be9a',dx,y(dx,dz)+h/2,dz,2.49,h,3.4);
      part(site,'cube','#7db198',dx,y(dx,dz)+h,dz,2.35,.19,3.14);
      branch(site,wood,[dx,y(dx,dz)+h,dz],[dx,y(dx,dz)+h+2.3,dz],.081);
      branch(site,wood,[dx-.63,y(dx,dz)+h+2.25,dz],[dx+.65,y(dx,dz)+h+2.25,dz],.052);
      for(const s of [-1,1])cylinder(jade,dx+s*.51,y(dx,dz)+h+1.78,dz,.207,.45);
    }
    block(2.1);
  }

  for(let i=0;i<18;i++){
    const a=i*2.39996,r=8.7+i%5*1.52,dx=Math.cos(a)*r,dz=Math.sin(a)*r+7;
    if(Math.abs(dx)<3||Math.hypot(dx,dz-7)>15.9||Math.hypot(dx+4.8,dz-5.35)<3||
       Math.hypot(dx-7,dz-6)<2) continue;
    const floor=y(dx,dz),height=.54+i%4*.15;
    if(island.biome==='ice'){
      for(let j=0;j<4;j++){
        const load=1-j*.16;
        part(site,'cone',j%2?'#adc8d9':'#d4e4e9',dx,floor+height*.52+j*.33,dz,.58*load,.83*load,.51*load,0,a);
      }
    }else if(island.biome==='sandstone'||island.biome==='roost'){
      for(let j=0;j<3;j++)part(site,'fine',j%2?island.color:island.item[3],dx+j*.28,floor+height*.33+j*.035,dz-j*.08,.37-j*.064,height*.42-j*.053,.34-j*.036,0,a,.11);
    }else{
      for(let j=0;j<7;j++){
        const angle=j/7*Math.PI*2;
        const tx=dx+Math.sin(angle)*.29,tz=dz+Math.cos(angle)*.29;
        part(site,'fine',j%2?'#6eae89':island.color,tx,floor+height*.37,tz,.13,height*.53,.16,.35,angle,.2);
        if(j%2===0)part(site,'fine',i%2?island.item[3]:'#f3cca5',tx,floor+height*.77,tz,.11,.15,.11,0,angle,.36);
      }
    }
  }

  const [cx,cz]=skyCounterPoint(place);
  const shop=new T.Group();shop.position.set(cx,height(cx,cz),cz-.92);parent.add(shop);
  for(const sign of [-1,1]){
    branch(shop,wood,[sign*.94,0,0],[sign*.94,1.87,0],.077);
    part(shop,'fine',lantern,sign*1.06,1.43,.39,.11,.19,.11);
  }
  part(shop,'cube','#ad837b',0,.57,0,1.96,1.14,.81);
  part(shop,'cube','#dfb08e',0,1.15,.08,2.12,.13,.99);
  for(let i=0;i<7;i++)part(shop,'cube',i%2?island.color:cream,(i-3)*.34,1.90,.12,.34,.07,1.43,-.17);
  for(let i=0;i<4;i++)part(shop,'fine',i%2?island.item[3]:cream,(i-1.5)*.34,1.27,.14,.13,.11,.12);
  blockers.push([cx,cz-.92,1.03,.46]);
}
