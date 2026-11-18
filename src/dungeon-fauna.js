import {part,branch} from './models.js';

export function regionalMonster(body,habitat,boss){
  const {form,color,trim}=habitat;
  const torso=(shape,x,y,z,a,b,c,rx=0,ry=0,rz=0)=>part(body,shape,color,x,y,z,a,b,c,rx,ry,rz);
  const detail=(shape,x,y,z,a,b,c,rx=0,ry=0,rz=0)=>part(body,shape,trim,x,y,z,a,b,c,rx,ry,rz);
  let eyeY=.60,eyeZ=.40,eyeX=.15;
  const fins=[];
  if(form==='crab'){
    torso('low',0,.43,0,.48,.28,.34);
    eyeY=.68;eyeZ=.20;eyeX=.24;
    for(const s of [-1,1]){
      for(let j=0;j<3;j++)branch(body,color,[s*.33,.36,.17-j*.17],[s*.65,.12,.24-j*.18],.057);
      detail('soft',s*.53,.52,.28,.19,.15,.18);
      for(const j of [-1,1])detail('cone',s*.54+j*.085,.69,.32,.064,.22,.06,0,0,-j*.20);
      torso('cyl',s*.24,.59,.16,.045,.22,.045);
    }
  }else if(['bee','moth','bat','ray'].includes(form)){
    torso('fine',0,.66,0,.24,.24,.43);eyeY=.73;eyeZ=.35;
    for(const s of [-1,1]){
      const wing=detail(form==='bat'||form==='ray'?'diamond':'fine',s*.44,.73,-.02,.43,form==='moth'?.24:.07,.26,0,s*.27,s*.20);
      fins.push(wing);
      if(form==='bee')torso('cyl',0,.65,s*.12,.234,.08,.222,Math.PI/2);
      if(form==='moth'||form==='bee')branch(body,trim,[s*.10,.79,.24],[s*.21,1.02,.31],.022);
      if(form==='bat')detail('cone',s*.14,.92,.19,.082,.27,.074);
    }
    if(form==='ray')branch(body,color,[0,.65,-.32],[0,.53,-.92],.046);
  }else if(form==='golem'){
    torso('cube',0,.80,0,.65,.67,.45);detail('cube',0,1.31,.04,.46,.42,.40);eyeY=1.37;eyeZ=.25;
    for(const s of [-1,1]){
      torso('cyl',s*.43,.76,0,.16,.59,.17);detail('cube',s*.17,.25,0,.24,.42,.30);
      detail('sphere',s*.24,.96,.23,.053,.053,.038);
    }
  }else{
    torso('fine',0,.45,-.04,.34,.29,.48);torso('soft',0,.55,.31,.25,.21,.23);eyeY=.61;eyeZ=.50;
    for(const s of [-1,1])for(const z of [-.28,.23])detail('soft',s*.24,.21,z,.14,.14,.21);
    if(form==='beetle'){
      for(const s of [-1,1])detail('low',s*.15,.63,-.11,.18,.17,.39);
      detail('cone',0,.75,.40,.075,.36,.10,.36);
    }else if(form==='turtle'){
      detail('low',0,.66,-.12,.43,.25,.46);
      for(const s of [-1,1])torso('soft',s*.19,.84,-.19,.14,.06,.15);
    }else if(form==='newt'){
      detail('cone',0,.28,-.62,.17,.72,.15,-1.35);
      for(const s of [-1,1])for(let j=0;j<3;j++)detail('diamond',s*(.24+j*.04),.56+j*.058,.30-j*.08,.15,.052,.07,0,0,s*.32);
    }else{
      for(const s of [-1,1])detail('fine',s*.13,.78,.26,.074,form==='hare'?.30:.105,.085,0,0,s*.18);
      torso('fine',0,.40,-.57,.11,.13,form==='stoat'?.40:.14,-.26);
    }
  }
  for(const s of [-1,1]){
    part(body,'sphere','#382e47',s*eyeX,eyeY,eyeZ,.055,.070,.043);
    part(body,'sphere','#fff5dc',s*eyeX-.012,eyeY+.025,eyeZ+.036,.015,.017,.009);
    if(boss)detail('diamond',s*.18,eyeY+.26,eyeZ-.14,.08,.19,.08,0,0,s*-.24);
  }
  return t=>fins.forEach((wing,i)=>{wing.rotation.z=(i?1:-1)*(.17+Math.sin(t*(form==='bee'?17:4))*.36);});
}
