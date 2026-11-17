import './style.css';
import {openGameWindow} from './game-window.js';

const app=document.querySelector('#app');
app.innerHTML='<main class="session-wait"><h1>Rainbow Roam</h1><p role="status">Opening your game…</p></main>';
const status=message=>{
  const text=app.querySelector('.session-wait p');
  if(text) text.textContent=message;
};

openGameWindow(()=>import('./main.js'),status);
