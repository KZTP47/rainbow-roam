// Positions are fractions of the available space so bars stay reachable after rotation or resizing.
export function movableHotbar(bar,id){
  const parent=bar.offsetParent??bar.parentElement;
  const key='rainbowRoam.hotbar.'+id;
  const grip=document.createElement('button');
  grip.type='button';grip.className='hotbar-grip';grip.textContent='⠿';
  grip.title='Drag to move · Arrow keys to adjust · Home or double-click to reset';
  grip.setAttribute('aria-label','Move '+id+' hotbar');
  bar.prepend(grip);
  let position=null,drag=null;
  try{
    const saved=JSON.parse(localStorage.getItem(key));
    if(Array.isArray(saved)&&saved.length===2&&saved.every(Number.isFinite)) position=saved;
  }catch{}
  const clamp=n=>Math.min(1,Math.max(0,n));
  function limits(){return [Math.max(0,parent.clientWidth-bar.offsetWidth),Math.max(0,parent.clientHeight-bar.offsetHeight)];}
  function apply(){
    if(!position)return;
    const [w,h]=limits();
    Object.assign(bar.style,{left:clamp(position[0])*w+'px',top:clamp(position[1])*h+'px',right:'auto',bottom:'auto',transform:'none'});
  }
  function save(){try{if(position)localStorage.setItem(key,JSON.stringify(position));else localStorage.removeItem(key);}catch{}}
  function reset(){position=null;for(const prop of ['left','top','right','bottom','transform'])bar.style.removeProperty(prop);save();}
  function move(x,y){const [w,h]=limits();position=[w?clamp(x/w):0,h?clamp(y/h):0];apply();}
  function offset(){const rect=bar.getBoundingClientRect(),base=parent.getBoundingClientRect();return [rect.left-base.left,rect.top-base.top];}
  grip.onpointerdown=e=>{
    if(e.button!==0)return;
    const [x,y]=offset();drag=[e.clientX-x,e.clientY-y];grip.setPointerCapture(e.pointerId);
    e.stopPropagation();
  };
  grip.onpointermove=e=>{if(drag){move(e.clientX-drag[0],e.clientY-drag[1]);e.stopPropagation();}};
  grip.onlostpointercapture=()=>{if(drag)save();drag=null;};
  grip.ondblclick=reset;
  grip.onkeydown=e=>{
    const delta={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[e.key];
    if(!delta&&e.key!=='Home')return;
    e.preventDefault();e.stopPropagation();
    if(delta){const [x,y]=offset();move(x+delta[0],y+delta[1]);save();}else reset();
  };
  const resize=new ResizeObserver(apply);resize.observe(parent);resize.observe(bar);apply();
  return ()=>resize.disconnect();
}
