import assert from 'node:assert/strict';
import {access, mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {join} from 'node:path';
import {chromium} from 'playwright';
import {villagers, wildlife, SAVE_KEY, items, regions} from '../src/content.js';
import {walkable} from '../src/landscape.js';
import {trails} from '../src/town-trails.js';
import {wardWorkshops} from '../src/ward-workshops.js';

const origin='http://127.0.0.1:4176';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4176','--strictPort'],{stdio:['ignore','pipe','pipe'],windowsHide:true});
let serverLog='';
server.stdout.on('data',chunk=>{serverLog+=chunk;});
server.stderr.on('data',chunk=>{serverLog+=chunk;});
let browser;
const errors=[];

async function browserPath() {
  if(process.env.ROAM_BROWSER) return process.env.ROAM_BROWSER;
  if(process.platform==='win32') {
    const candidates=[
      [process.env.ProgramFiles,'Google','Chrome','Application','chrome.exe'],
      [process.env['ProgramFiles(x86)'],'Microsoft','Edge','Application','msedge.exe']
    ];
    for(const [folder,...segments] of candidates) {
      if(!folder) continue;
      const path=join(folder,...segments);
      try {await access(path);return path;} catch { /* Use the next candidate. */ }
    }
  }
  return undefined;
}
async function waitForServer() {
  for(let i=0;i<60;i++){
    try {if((await fetch(origin)).ok) return;} catch { /* Vite is starting. */ }
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  throw Error('Vite did not start. '+serverLog);
}
async function openPage(viewport, touch=false) {
  const page=await browser.newPage({viewport,deviceScaleFactor:1,isMobile:touch,hasTouch:touch});
  page.setDefaultTimeout(25000);
  page.on('pageerror',err=>errors.push(err.message));
  page.on('console',line=>{if(line.type()==='error') errors.push(line.text());});
  await page.goto(origin);
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('#cover-art').evaluate(async img=>{
    await img.decode();
    if(img.naturalWidth<1000) throw Error('Missing high-resolution cover art');
  });
  return page;
}
async function snapshot(page,name){
  await page.screenshot({path:'screenshots/'+name+'.png',timeout:75000,animations:'disabled'});
}
async function start(page, continuation=false) {
  await page.getByRole('button',{name:continuation?'Continue roaming':'Begin adventure'}).click();
  await page.locator('#region').filter({hasText:/\S/}).waitFor({timeout:45000});
}
const saved=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
const press=(page,key)=>page.keyboard.press(key);
const prompt=page=>page.locator('#interact:not([hidden])');

async function holdUntil(page,keys,selector) {
  for(const key of keys) await page.keyboard.down(key);
  try {await selector.waitFor({timeout:18000});}
  finally {for(const key of keys) await page.keyboard.up(key);}
}
async function persisted(page,condition) {
  await page.waitForFunction(([key,source])=>new Function('state','return ('+source+')(state)')(JSON.parse(localStorage.getItem(key))),[SAVE_KEY,condition.toString()]);
  return saved(page);
}
async function clickCenter(page,button='left') {
  const {width,height}=page.viewportSize();
  await page.mouse.click(width/2,height/2,{button});
}

try {
  await waitForServer();
  await mkdir('screenshots',{recursive:true});
  browser=await chromium.launch({
    executablePath:await browserPath(),
    args:process.env.ROAM_SOFTWARE==='1'?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--enable-unsafe-swiftshader']
  });

  const page=await openPage({width:1440,height:900});
  await snapshot(page,'title');
  await start(page);
  assert.equal(await page.locator('#region').textContent(),'Petalwick');
  assert(await page.locator('#view canvas').evaluate(canvas=>Boolean(canvas.getContext('webgl2'))));
  await prompt(page).getByText('Talk to Poppy').waitFor();
  await page.locator('.world-name').filter({hasText:'Pearlyspark'}).waitFor();
  await snapshot(page,'petalwick');
  console.log('WebGL opening and villager prompt verified');

  await press(page,'e');
  await page.getByRole('heading',{name:'Poppy',exact:true}).waitFor();
  assert.match(await page.locator('.dialog p').innerText(),/meadow biscuit.*Pearlyspark/i);
  await page.getByRole('button',{name:'See you soon'}).click();
  await holdUntil(page,['w','d'],prompt(page).getByText('Gather river stone'));
  await press(page,'e');
  const gathered=await persisted(page,s=>s.inventory.stone>=2);
  assert.equal(gathered.inventory.stone,2);
  assert.equal(Object.keys(gathered.harvested).length,1);
  await holdUntil(page,['w','d'],prompt(page).getByText('Offer meadow biscuit'));
  await press(page,'e');
  const bonded=await persisted(page,s=>s.companions.includes('pearly'));
  assert.equal(bonded.inventory.treat,0);
  assert.equal(bonded.active,'pearly');
  assert(bonded.player.x>1&&bonded.player.z<9);
  await page.locator('#buddy').getByText('Pearlyspark').waitFor();
  await press(page,'m');
  await page.getByRole('button',{name:'Local map',exact:true}).click();
  await page.getByRole('button',{name:'Petalwick',exact:true}).click();
  await prompt(page).getByText('Talk to Poppy').waitFor();
  await press(page,'e');
  await page.getByRole('button',{name:'Complete quest'}).click();
  assert.equal((await saved(page)).quests.poppy,'done');
  await press(page,'c');
  await page.getByRole('heading',{name:'Field guide'}).waitFor();
  const pearly=page.locator('.companion-card').filter({hasText:'Pearlyspark'});
  await pearly.getByRole('button',{name:'Send to rest'}).click();
  assert.equal((await saved(page)).active,null);
  await pearly.getByRole('button',{name:'Roam together'}).click();
  assert.equal((await saved(page)).active,'pearly');
  await press(page,'Escape');
  console.log('Movement, gathering, dialogue, first bond, companion switch, and first quest verified');

  await press(page,'k');
  const bench=page.getByRole('heading',{name:'Crafting bench'});
  await bench.waitFor();
  const timber=page.locator('.recipe').filter({hasText:'Timber block'});
  const before=(await saved(page)).inventory.wood;
  await timber.getByRole('button',{name:'Craft',exact:true}).click();
  await bench.waitFor();
  const crafted=await saved(page);
  assert.equal(crafted.inventory.wood,before-2);
  assert.equal(crafted.inventory.plank,4);
  await snapshot(page,'crafting');
  await page.getByRole('button',{name:'Enter build mode'}).click();
  await page.locator('#reticle.valid').waitFor();
  await press(page,'r');
  await clickCenter(page);
  const placed=await persisted(page,s=>s.blocks.length===1);
  assert.equal(placed.blocks[0].turn,1);
  assert.equal(placed.inventory.plank,3);

  const {width,height}=page.viewportSize();
  let stacked=false;
  for(const dy of [47,58,68,78,90,29]){
    const prior=(await saved(page)).blocks.length;
    await page.mouse.click(width/2,height/2-dy);
    const after=await saved(page);
    if(after.blocks.length>prior) {
      if(after.blocks.at(-1).level===1) {
        stacked=true;
        assert.equal(after.blocks.at(-1).x,after.blocks[0].x);
        assert.equal(after.blocks.at(-1).z,after.blocks[0].z);
        await page.waitForTimeout(440);
        await snapshot(page,'building');
        await page.mouse.click(width/2,height/2-dy,{button:'right'});
        await persisted(page,s=>s.blocks.length===1);
        break;
      }
      await page.mouse.click(width/2,height/2-dy,{button:'right'});
      await persisted(page,s=>s.blocks.length===1);
    }
  }
  assert(stacked,'The top face should accept the same grid column at level one');
  await clickCenter(page,'right');
  const removed=await persisted(page,s=>s.blocks.length===0);
  assert.equal(removed.inventory.plank,4);
  await clickCenter(page);
  await persisted(page,s=>s.blocks.length===1);
  await press(page,'b');
  console.log('Recipe costs, crafting yield, rotation, stacking, placement and removal verified');

  await press(page,'j');
  await page.getByRole('heading',{name:'Quest journal'}).waitFor();
  await page.getByRole('button',{name:'All stories',exact:true}).click();
  const journalTitles=[
    ...villagers.map(villager=>villager.quest),
    ...Object.values(trails).map(trail=>trail.title),
    ...Object.values(wardWorkshops).map(workshop=>workshop.activity.title)
  ];
  assert.deepEqual((await page.locator('.journal-entry strong').allTextContents()).sort(),journalTitles.sort());
  assert.match(await page.locator('.quest-done').innerText(),/A little hello/);
  await press(page,'Escape');
  await press(page,'m');
  await page.getByRole('button',{name:'Local map',exact:true}).click();
  assert.equal(await page.locator('.map-regions button').count(),Object.values(regions).filter(r=>!r.realm).length);
  await snapshot(page,'map');
  await page.getByRole('button',{name:'Petalwick',exact:true}).click();
  assert.equal((await saved(page)).player.z,10);

  const expected=await saved(page);
  await page.reload();
  await start(page,true);
  assert.deepEqual((await saved(page)).blocks,expected.blocks);
  assert.deepEqual((await saved(page)).companions,expected.companions);
  assert.deepEqual((await saved(page)).quests,expected.quests);
  assert.deepEqual((await saved(page)).inventory,expected.inventory);
  await press(page,'b');
  await page.locator('#reticle').waitFor();
  await press(page,'b');
  await holdUntil(page,['s'],page.locator('#region').getByText('Sunseed Fields',{exact:true}));
  assert((await saved(page)).discoveries.includes('fields'));
  await press(page,'m');
  await page.getByRole('button',{name:'Local map',exact:true}).click();
  await page.getByRole('button',{name:'Petalwick',exact:true}).click();
  console.log('Journal, region discovery on foot, fast travel and browser reload verified');

  async function seedAtTitle(edit,value) {
    await press(page,'Escape');
    await page.getByRole('button',{name:'Title screen'}).click();
    await page.evaluate(([key,source,value])=>{
      const data=JSON.parse(localStorage.getItem(key));
      new Function('data','value','('+source+')(data,value)')(data,value);
      localStorage.setItem(key,JSON.stringify(data));
    },[SAVE_KEY,edit.toString(),value]);
    await page.reload();
    await start(page,true);
  }
  const tested=new Set(['poppy']);
  for(const npc of villagers.slice(1,8)){
    assert(walkable(npc.x,npc.z));
    await seedAtTitle((save,npc)=>Object.assign(save.player,{x:npc.x,z:npc.z+1.1,yaw:0}),npc);
    await prompt(page).getByText('Talk to '+npc.name,{exact:true}).waitFor({timeout:17500});
    await press(page,'e');
    await page.getByRole('heading',{name:npc.name,exact:true}).waitFor();
    await page.getByRole('button',{name:'I’ll help'}).click();
    assert.equal((await saved(page)).quests[npc.id],'active');
    tested.add(npc.id);
    if(npc.id==='fern') {
      await press(page,'e');
      await page.getByRole('button',{name:'Complete quest'}).click();
      assert.equal((await saved(page)).quests.fern,'done');
    }
    if(npc.id==='luma') {
      await page.mouse.move(820,330);
      await page.mouse.down();
      await page.mouse.move(884,330,{steps:8});
      await page.mouse.up();
      await snapshot(page,'mirrormere');
    }
  }
  assert.equal(tested.size,8);
  for(const [id,x,z] of wildlife.filter(entry=>!entry[4])) assert(walkable(x,z),id+' should spawn on accessible land');
  console.log('All eight NPC quest starters and the construction quest turn-in verified');

  const rare=wildlife.find(([id])=>id==='nebula');
  await seedAtTitle((save,[,x,z])=>{
    Object.assign(save.player,{x,z:z+1.25,yaw:0});
    Object.assign(save.inventory,{crystal:2,petal:2});
    save.time=21.5;
  },rare);
  await press(page,'k');
  await page.locator('.recipe').filter({hasText:'Rainbow charm'}).getByRole('button',{name:'Craft',exact:true}).click();
  await press(page,'Escape');
  await prompt(page).getByText('Offer '+items.charm[0].toLowerCase()).waitFor();
  await press(page,'e');
  const warming=await persisted(page,s=>s.bonds.nebula===1);
  await prompt(page).getByText('Nebulamane · 1/2 trust').waitFor();
  assert(!warming.companions.includes('nebula'));
  await press(page,'e');
  await persisted(page,s=>s.companions.includes('nebula'));
  assert.equal((await saved(page)).inventory.charm,0);
  await page.locator('#interact').waitFor({state:'hidden'});
  await snapshot(page,'starglass-ridge');
  await page.close();
  console.log('Rare two-offering unicorn and its recipe verified');

  const mobile=await openPage({width:390,height:844},true);
  await snapshot(mobile,'mobile-title');
  await start(mobile);
  await mobile.getByRole('button',{name:'Move up',exact:true}).waitFor();
  await mobile.locator('#interact:not([hidden])').getByText('Talk to Poppy').waitFor();
  await snapshot(mobile,'mobile-petalwick');
  await mobile.locator('#interact').tap();
  await mobile.getByRole('heading',{name:'Poppy',exact:true}).waitFor();
  await mobile.getByRole('button',{name:'See you soon'}).tap();
  const move=await mobile.getByRole('button',{name:'Move up',exact:true}).boundingBox();
  const cdp=await mobile.context().newCDPSession(mobile);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:move.x+move.width/2,y:move.y+move.height/2}]});
  await mobile.waitForTimeout(600);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await mobile.getByRole('button',{name:'Settings',exact:true}).tap();
  await mobile.getByRole('button',{name:'Save progress'}).tap();
  assert((await saved(mobile)).player.z<9.5);
  await mobile.getByRole('button',{name:'Close panel'}).tap();
  await mobile.locator('#toolbar').getByRole('button',{name:/Craft/}).tap();
  await mobile.getByRole('heading',{name:'Crafting bench'}).waitFor();
  await snapshot(mobile,'mobile-crafting');
  assert(await mobile.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
  await mobile.close();
  assert.deepEqual(errors,[]);
  console.log('RAINBOW_ROAM_PLAYTEST_PASSED');
} finally {
  await browser?.close();
  server.kill();
}
