const lockName='rainbow-roam-save-window';
let owner=false, beforeRelease, release;

export const ownsGameWindow=()=>owner;
export function onGameWindowClose(handler){beforeRelease=handler;}

export async function openGameWindow(load,status){
  if(!navigator.locks){
    status('This browser cannot coordinate game windows here. Open the standalone HTML file or use a browser with Web Locks on HTTPS.');
    return;
  }
  const pending=new AbortController();
  window.addEventListener('pagehide',()=>{
    pending.abort();
    try{beforeRelease?.();}
    finally{owner=false;release?.();}
  },{once:true});
  window.addEventListener('pageshow',event=>{
    if(event.persisted) location.reload();
  });
  const play=async lock=>{
    if(!lock||pending.signal.aborted) return false;
    owner=true;
    const untilClose=new Promise(resolve=>{release=resolve;});
    try{
      await load();
      await untilClose;
      return true;
    }finally{owner=false;}
  };
  try{
    if(await navigator.locks.request(lockName,{ifAvailable:true},play)||pending.signal.aborted) return;
    status('Rainbow Roam is open in another window. Close that window to continue here with your latest save.');
    await navigator.locks.request(lockName,{signal:pending.signal},play);
  }catch(error){
    if(pending.signal.aborted) return;
    console.error(error);
    status('Rainbow Roam could not open a game session. Reload this page to try again.');
  }
}
