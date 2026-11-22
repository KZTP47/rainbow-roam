import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {chromium} from 'playwright';
import {preview} from 'vite';
import {newGame,SAVE_KEY,species,wildlife} from '../src/content.js';
import {breedPet,catchWildPet,playPetTurn,rivalMove,startPetBattle,startWildPetBattle} from '../src/pet-club.js';
import {normalizeSave} from '../src/save-files.js';

const target='pearly';
const targetName=species[target].name;
const seed=()=>{
  const state=newGame();
  const [,x,z]=wildlife.find(([id])=>id===target);
  state.player={x:x-2.05,z:z+1.75,yaw:-.56};
  state.companions=['peach','mint'];
  state.active='peach';
  state.trackingQuest='poppy';
  state.sound=false;
  return state;
};

function verifyRules(){
  const state=seed();
  assert.equal(startWildPetBattle(state,species,'unknown',target),null);
  assert.equal(startWildPetBattle(state,species,'mint','unknown'),null);
  assert.equal(startWildPetBattle(state,species,'mint','peach'),null);
  state.bounties.abducted={pet:'mint'};
  state.townLife.trip={pet:'peach'};
  assert.equal(startWildPetBattle(state,species,'mint',target),null);
  assert.equal(startWildPetBattle(state,species,'peach',target),null);
  state.bounties.abducted=null;
  state.townLife.trip=null;

  state.inventory.treat=2;
  const {id:offspring}=breedPet(state,species,'peach','mint');
  assert(startWildPetBattle(state,species,offspring,target));
  const inventory={...state.inventory},coins=state.wallet.coins;
  const defeat=startWildPetBattle(state,species,'mint',target);
  assert.equal(catchWildPet(state,species,defeat),false);
  for(let i=0;i<12&&!defeat.result;i++) assert(playPetTurn(state,defeat,'focus'));
  assert.equal(defeat.result,'lost');
  assert.equal(catchWildPet(state,species,defeat),false);

  for(const [wild] of wildlife){
    if(state.companions.includes(wild)) continue;
    const bout=startWildPetBattle(state,species,'mint',wild);
    assert.equal(bout.opponent.name,species[wild].name);
    assert.equal(playPetTurn(state,bout,'invalid'),false);
    for(let i=0;i<12&&!bout.result;i++){
      const intent=rivalMove(bout);
      const move=intent==='heavy'?'guard':intent==='brace'&&!bout.focus?'focus':'strike';
      assert(playPetTurn(state,bout,move));
    }
    assert.equal(bout.result,'won',wild);
    assert.equal(playPetTurn(state,bout,'strike'),false);
    assert(catchWildPet(state,species,bout));
    assert.equal(catchWildPet(state,species,bout),false);
    assert.equal(startWildPetBattle(state,species,'mint',wild),null);
  }
  assert.deepEqual(state.inventory,inventory);
  assert.equal(state.wallet.coins,coins);
  assert.deepEqual(state.petClub.wins,{});
  const loaded=normalizeSave(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(loaded.companions.toSorted(),state.companions.toSorted());
  assert.equal(loaded.bonds[target],species[target].trust);
  assert.equal(loaded.active,'peach');

  const arena=startPetBattle(state,'mint','clover');
  for(let i=0;i<12&&!arena.result;i++){
    assert(playPetTurn(state,arena,rivalMove(arena)==='heavy'?'guard':'strike'));
  }
  assert.equal(arena.result,'won');
  assert.equal(catchWildPet(state,species,arena),false);
  assert.equal(state.petClub.wins.clover,true);
  assert.equal(state.wallet.coins,coins+8);
  assert.equal(state.inventory.treat,inventory.treat+1);
  console.log('WILD_BATTLE_RULES_PASSED');
}

function browserPath(){
  if(process.env.ROAM_BROWSER) return process.env.ROAM_BROWSER;
  const candidates=[
    [process.env.ProgramFiles,'BraveSoftware','Brave-Browser','Application','brave.exe'],
    [process.env.ProgramFiles,'Google','Chrome','Application','chrome.exe'],
    [process.env['ProgramFiles(x86)'],'Microsoft','Edge','Application','msedge.exe']
  ];
  return candidates.filter(([folder])=>folder).map(parts=>join(...parts)).find(existsSync);
}

async function verifyBrowser(){
  const offline=process.argv.includes('--offline');
  const hosted=process.argv.find(arg=>arg.startsWith('--url='))?.slice(6);
  const server=offline||hosted?null:await preview({preview:{host:'127.0.0.1',port:4295,strictPort:true},logLevel:'error'});
  const url=hosted??(offline?new URL('../Rainbow Roam.html',import.meta.url).href:'http://127.0.0.1:4295/');
  const directory=join('screenshots','wild-battles',hosted?'live':offline?'offline':'local');
  const errors=[];
  let browser;
  try {
    await mkdir(directory,{recursive:true});
    browser=await chromium.launch({executablePath:browserPath(),args:['--enable-unsafe-swiftshader']});
    const button=(page,name)=>page.getByRole('button',{name,exact:true});
    const label=page=>page.locator('#world-labels .wild').getByText(targetName,{exact:true}).locator('..');
    const encounter=page=>page.getByRole('dialog',{name:targetName,exact:true});
    const capture=(page,name)=>page.screenshot({path:join(directory,name+'.png'),animations:'disabled'});
    const saved=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
    const start=async page=>{
      await button(page,'Continue roaming').click();
      await page.locator('#view canvas').waitFor();
    };
    const open=async (state,mobile=false)=>{
      const page=await browser.newPage({
        viewport:mobile?{width:390,height:844}:{width:1360,height:840},
        deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile,offline
      });
      page.setDefaultTimeout(18000);
      page.on('pageerror',error=>errors.push(error.message));
      page.on('console',message=>{if(message.type()==='error') errors.push(message.text());});
      if(offline) page.on('request',request=>{if(/^https?:/.test(request.url())) errors.push(request.url());});
      await page.addInitScript(({key,state})=>{
        if(!localStorage.getItem(key)) localStorage.setItem(key,JSON.stringify(state));
      },{key:SAVE_KEY,state});
      await page.goto(url);
      await start(page);
      return page;
    };
    const atCreature=async page=>{
      await label(page).waitFor();
      const box=await label(page).boundingBox();
      return {x:box.x+box.width/2,y:box.y+box.height+48};
    };
    const win=async (page,press='click')=>{
      for(const move of ['Strike','Guard','Focus','Strike']) await button(page,move)[press]();
      await page.getByText('Victory!',{exact:true}).waitFor();
      assert.equal(await page.locator('.wild-matchup progress').nth(1).getAttribute('value'),'0');
    };
    const verifyCatch=async (page,before)=>{
      const after=await saved(page);
      assert.equal(after.companions.filter(id=>id===target).length,1);
      assert.equal(after.bonds[target],species[target].trust);
      assert.equal(after.active,before.active);
      assert.deepEqual(after.inventory,before.inventory);
      assert.deepEqual(after.petClub,before.petClub);
      assert.equal(after.wallet.coins,before.wallet.coins);
      await encounter(page).waitFor({state:'hidden'});
      await label(page).waitFor({state:'hidden'});
    };

    const empty=await open({...seed(),companions:[],active:null});
    const first=await atCreature(empty);
    await capture(empty,'wild-overworld');
    await empty.mouse.click(first.x,first.y);
    await encounter(empty).getByText('Offer a treat to a wild friend first', {exact:false}).waitFor();
    assert.equal(await encounter(empty).getByRole('button',{name:'Start battle'}).count(),0);
    await button(empty,'Leave').click();
    await empty.locator('#interact').filter({hasText:targetName}).waitFor();
    await empty.keyboard.press('KeyE');
    assert((await saved(empty)).companions.includes(target),'The offering interaction should still work');
    await empty.close();

    const desktop=await open(seed());
    const point=await atCreature(desktop);
    await desktop.mouse.click(150,320);
    await desktop.mouse.click(point.x,point.y,{button:'right'});
    assert.equal(await encounter(desktop).count(),0);
    await desktop.mouse.move(point.x,point.y);
    await desktop.mouse.down();
    await desktop.mouse.move(point.x+10,point.y);
    await desktop.mouse.move(point.x,point.y);
    await desktop.mouse.up();
    assert.equal(await encounter(desktop).count(),0);
    const updated=await atCreature(desktop);
    await desktop.mouse.click(updated.x,updated.y);
    await encounter(desktop).waitFor();
    await capture(desktop,'desktop-select');
    const select=encounter(desktop).getByRole('combobox');
    await select.waitFor();
    assert.deepEqual(await select.locator('option').allTextContents(),['Peachpuff','Mintskip']);
    assert.equal(await select.inputValue(),'peach');
    await select.selectOption('mint');
    const before=await saved(desktop);
    await button(desktop,'Start battle').click();
    await desktop.getByRole('progressbar',{name:'Mintskip health'}).waitFor();
    assert.equal(await button(desktop,'Catch '+targetName).count(),0);
    await capture(desktop,'desktop-battle');
    await desktop.keyboard.press('Escape');
    await encounter(desktop).waitFor({state:'hidden'});
    assert.deepEqual((await saved(desktop)).companions,before.companions);

    await desktop.keyboard.press('Shift+KeyE');
    await button(desktop,'Start battle').click();
    for(let i=0;i<12&&await button(desktop,'Focus').count();i++) await button(desktop,'Focus').click();
    await desktop.getByText('Your companion is ready to rest',{exact:true}).waitFor();
    assert.equal(await button(desktop,'Catch '+targetName).count(),0);
    await button(desktop,'Try again').click();
    await select.selectOption('mint');
    await button(desktop,'Start battle').click();
    await win(desktop);
    assert.equal(await button(desktop,'Catch '+targetName).evaluate(node=>document.activeElement===node),true);
    assert.deepEqual((await saved(desktop)).companions,before.companions);
    await capture(desktop,'desktop-catch');
    await button(desktop,'Catch '+targetName).click();
    await verifyCatch(desktop,before);
    await desktop.reload();
    await start(desktop);
    await desktop.keyboard.press('KeyC');
    await desktop.locator('.companion-card').getByText(targetName,{exact:true}).waitFor();
    await desktop.close();

    const phone=await open(seed(),true);
    const tap=await atCreature(phone);
    await capture(phone,'mobile-overworld');
    await phone.touchscreen.tap(tap.x,tap.y);
    await encounter(phone).waitFor();
    await capture(phone,'mobile-select');
    const mobileBefore=await saved(phone);
    await button(phone,'Start battle').tap();
    await phone.getByRole('progressbar',{name:'Peachpuff health'}).waitFor();
    await capture(phone,'mobile-battle');
    await win(phone,'tap');
    await capture(phone,'mobile-catch');
    await button(phone,'Catch '+targetName).tap();
    await verifyCatch(phone,mobileBefore);
    assert.deepEqual(errors,[]);
    console.log('WILD_BATTLE_BROWSER_PASSED',hosted?'live':offline?'offline':'local');
  } finally {
    await browser?.close();
    server?.httpServer.close();
  }
}

if(process.argv[2]==='rules') verifyRules();
else if(process.argv[2]==='browser') await verifyBrowser();
else throw new Error('Choose rules or browser.');
