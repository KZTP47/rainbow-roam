export function makeAudio(enabled) {
  let context, master, interval, step=0;
  const melody=[0,4,7,11,9,7,4,2,0,2,4,7,9,4,2,null,5,9,12,14,12,9,7,5,4,7,11,12,11,7,4,null];
  function tone(midi, t, length, volume, shape='sine') {
    if(!context || !master) return;
    const wave=context.createOscillator();
    const gain=context.createGain();
    wave.type=shape; wave.frequency.value=440*2**((midi-69)/12);
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(volume,t+.022);
    gain.gain.exponentialRampToValueAtTime(.0001,t+length);
    wave.connect(gain);gain.connect(master);
    wave.start(t);wave.stop(t+length+.025);
  }
  function tick() {
    if(!context||context.state!=='running'||document.hidden) return;
    const note=melody[step%melody.length], t=context.currentTime+.046;
    if(note!==null) tone(65+note,t,1.12,.041);
    if(step%4===0) {
      const roots=[53,57,50,55,58,57,55,53];
      const r=roots[(step/4)%roots.length]; tone(r,t,2.75,.04); tone(r+7,t+.20,2.3,.025);
    }
    step++;
  }
  function sync() {
    if(!context) return;
    const on=enabled();
    master.gain.setTargetAtTime(on?.53:.0001,context.currentTime,.055);
    if(on&&!interval) interval=setInterval(tick,595);
    else if(!on&&interval) {clearInterval(interval);interval=null;}
  }
  function unlock() {
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio) return;
    if(!context) {
      context=new Audio(); master=context.createGain();
      master.gain.value=.001; master.connect(context.destination);
    }
    if(context.state==='suspended') context.resume().catch(()=>{});
    sync();
  }
  function play(kind) {
    if(!context || !enabled()) return;
    const tunes={gather:[72,79],craft:[65,72,76],talk:[69],success:[72,76,79,84],place:[53,60],remove:[61,53],travel:[67,72,79]};
    const t=context.currentTime+.012;
    (tunes[kind]??[72]).forEach((note,i)=>tone(note,t+i*.078,.34+i*.034,.10,i===0&&kind==='place'?'triangle':'sine'));
  }
  return {unlock,sync,play};
}

