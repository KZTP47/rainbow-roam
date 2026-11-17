import {part} from './models.js';
import {townProfiles} from './town-data.js';

const routineNames={
  coast:['Checking the shore','Taking a break','Watching the tide'],
  woods:['Tending plants','Reading','Inspecting the lanterns'],
  frost:['Checking the trail','Warming up','Watching the peaks'],
  mesa:['Tending plants','Taking a break','Checking the supplies'],
  delta:['Tending plants','Reading','Watching the water'],
  sky:['Checking the sails','Taking a break','Watching the clouds'],
  hogwarts:['Reading','Taking a break','Checking the hall'],
  heath:['Sorting post','Checking moor paths','Watching the rain','At the post'],
  cinder:['Checking the kiln','Working the lock','Cooling the ovens','At the kiln'],
  reef:['Mending nets','Checking the tide','Setting lamps','At the pier'],
  verdigris:['Tuning instruments','Checking the tarn','Closing the loft','At the loft'],
  orchards:['Picking fruit','At the market','Packing baskets','At the press'],
  valley:['Tending plants','Taking a break','On an evening walk']
};

export function dailyActivity(time){
  if(time<10.5) return 0;
  if(time<14.7) return 1;
  if(time<18.9) return 2;
  return 3;
}

function reachable(ax,az,bx,bz,isClear){
  for(let i=0;i<=12;i++){
    const t=i/12;
    if(!isClear(ax+(bx-ax)*t,az+(bz-az)*t)) return false;
  }
  return true;
}

export function residentRoutine(data,realm,index,isClear){
  const profile=townProfiles[realm];
  const names=data.shifts??(profile?[profile.greeting,profile.afternoon,profile.evening]:routineNames[realm]);
  const shifts=realm==='hogwarts'?1.4:realm==='valley'&&index<8?2.2:5.8;
  const start=[data.x,data.z],stops=[start];
  for(let slot=1;slot<3;slot++){
    let target=start;
    for(let step=0;step<10;step++){
      const a=slot*2.07+index*1.3+step*2.39996;
      const x=data.x+Math.cos(a)*shifts,z=data.z+Math.sin(a)*shifts*.83;
      if(!isClear(x,z)||!stops.every(([px,pz])=>reachable(px,pz,x,z,isClear))) continue;
      if(stops.some(([px,pz])=>Math.hypot(px-x,pz-z)<shifts*.55)) continue;
      target=[x,z];break;
    }
    stops.push(target);
  }
  return [...stops,start].map(([x,z],slot)=>({x,z,activity:names?.[slot]??'Resting'}));
}

export function workTools(look){
  const arm=look.arms[0];
  const book=part(arm,'cube','#976991',.02,-.466,.12,.145,.033,.126);
  part(book,'cube','#f0ddc0',0,.34,.04,.82,.80,.85);
  const can=part(arm,'cyl','#84a99a',.028,-.57,.055,.075,.115,.076);
  // The can and its spout move together with the hand.
  const spout=part(can,'cyl','#bdc8a0',.40,.05,.76,.24,.79,.25,1.1,0,-.51);
  spout.castShadow=false;
  const cup=part(arm,'cyl','#dca57e',.022,-.53,.069,.054,.09,.055);
  const result={book,can,cup};
  for(const mesh of Object.values(result)) mesh.visible=false;
  return result;
}

export function workPose(actor,moving,elapsed){
  const {look,tools,activity}=actor;
  const right=look.arms[0];
  const gardening=activity==='Tending plants'||activity==='Tending the window boxes';
  const reading=activity==='Reading'||activity==='Sorting forest finds'||activity==='Measuring the lake level';
  const breakTime=activity==='Taking a break'||activity==='Warming up';
  tools.can.visible=!moving&&gardening;
  tools.book.visible=!moving&&reading;
  tools.cup.visible=!moving&&breakTime;
  if(!moving&&gardening){
    right.rotation.x=-.67+Math.sin(elapsed*1.55)*.28;
    look.head.rotation.x=.17+Math.sin(elapsed*1.55)*.09;
  } else if(!moving&&reading){
    right.rotation.x=-1.1;
    look.head.rotation.x=.23;
  } else if(!moving&&breakTime){
    right.rotation.x=-.68+.22*Math.sin(elapsed*1.29);
  }
}

export function playStyle(elapsed,seed){
  const period=(elapsed+seed)%17.5;
  if(period<4) return {kind:'Greeting',t:period};
  if(period<10) return {kind:'Playing chase',t:period-4};
  if(period<13.1) return {kind:'Resting together',t:period-10};
  return {kind:'Foraging',t:period-13.1};
}

export function playPosition(style,slot,center){
  const {kind,t}=style;
  const sign=slot===0?-1:1;
  if(kind==='Playing chase'){
    const angle=t*1.35+slot*1.35+center.angle;
    return [center.x+Math.cos(angle)*1.83,center.z+Math.sin(angle)*1.58];
  }
  if(kind==='Greeting')
    return [center.x+Math.cos(center.angle)*sign*.78,center.z+Math.sin(center.angle)*sign*.78];
  if(kind==='Resting together')
    return [center.x+Math.cos(center.angle)*sign*1.14,center.z+Math.sin(center.angle)*sign*1.14];
  return [center.x+Math.cos(center.angle)*sign*(1.55+t*.12),center.z+Math.sin(center.angle)*sign*1.68];
}
