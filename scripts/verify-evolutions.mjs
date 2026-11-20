import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {mkdir} from 'node:fs/promises';
import {Box3,Vector3} from 'three';
import {chromium} from 'playwright';
import {items,newGame,questReady,SAVE_KEY,species,villagers} from '../src/content.js';
import {currentFriend,evolutionIds,evolutionRequirement,evolveFriend,friendForm} from '../src/evolutions.js';
import {creature} from '../src/models.js';
import {decodeSave,encodeSave,normalizeSave} from '../src/save-files.js';

const baseIds=Object.keys(species);
assert.deepEqual(evolutionIds.toSorted(),baseIds.toSorted());
const names=new Set(baseIds.map(id=>species[id].name.toLowerCase()));
const designs=new Set();
for (const id of baseIds) {
  const state=newGame(), base=species[id], actors=[creature(base)];
  assert.equal(evolveFriend(state,id,1),null,'A wild companion cannot evolve');
  state.companions=[id];state.active=id;
  state.care[id]={affinity:0};
  for (const stage of [1,2]) {
    const form=friendForm(id,stage);
    assert(!names.has(form.name.toLowerCase()),form.name+' must be unique');
    names.add(form.name.toLowerCase());
    assert.equal(form.kind,base.kind);
    assert.equal(form.family,base.family);
    assert.equal(form.favorite,base.favorite);
    assert(form.lore.length>=25);
    const signature=[form.kind,form.evolution.motif,form.accent].join('/');
    assert(!designs.has(signature),'Duplicate visual design '+signature);
    designs.add(signature);
    const actor=creature(form);
    const earlier=actors.at(-1);
    assert.equal(actor.kind,earlier.kind);
    assert.equal(actor.legs.length,earlier.legs.length);
    assert.equal(actor.wings?.length,earlier.wings?.length);
    assert(actor.group.getObjectByName('evolution-detail'),form.name+' needs geometry');
    assert(actor.group.scale.x>earlier.group.scale.x,form.name+' needs larger proportions');
    const size=new Box3().setFromObject(actor.group).getSize(new Vector3());
    assert([size.x,size.y,size.z].every(n=>Number.isFinite(n)&&n>0),form.name+' needs valid bounds');
    actors.push(actor);

    const {item,count,affinity}=evolutionRequirement(state,id,stage);
    assert(items[item]&&count>0);
    assert.equal(evolveFriend(state,id,stage),null);
    state.inventory[item]=count+1;
    assert.equal(evolveFriend(state,id,stage),null,'Friendship must be earned');
    state.care[id].affinity=affinity;
    state.inventory[item]=count-1;
    assert.equal(evolveFriend(state,id,stage),null,'Offering must be affordable');
    state.inventory[item]=count+1;
    state.townLife.trip={pet:id};
    assert.equal(evolveFriend(state,id,stage),null,'Friend must be present');
    state.townLife.trip=null;
    state.bounties.abducted={pet:id};
    assert.equal(evolveFriend(state,id,stage),null,'Missing friends cannot evolve');
    state.bounties.abducted=null;
    assert.equal(evolveFriend(state,id,stage).name,form.name);
    assert.equal(state.inventory[item],1);
    assert.equal(evolveFriend(state,id,stage),null,'Repeated action must be inert');
    assert.equal(state.inventory[item],1);
    assert.equal(currentFriend(decodeSave(encodeSave(state)),id).name,form.name);
    assert.equal(state.active,id);
    assert.deepEqual(state.companions,[id]);
  }
  assert.equal(evolveFriend(state,id,3),null);
}
const old=newGame();
old.companions=['pearly'];old.active='pearly';
delete old.evolutions;
assert.equal(currentFriend(normalizeSave(old),'pearly').name,'Pearlyspark');
assert.deepEqual(normalizeSave({...old,evolutions:{pearly:3,dawn:2}}).evolutions,{});
const pearly=newGame();
pearly.companions=['pearly'];pearly.care.pearly={affinity:12};pearly.inventory.charm=2;
assert.equal(evolveFriend(pearly,'pearly',2),null,'Cannot skip the middle form');
assert(questReady(villagers.find(person=>person.id==='poppy'),pearly));
console.log('EVOLUTION_ROSTER_VERIFIED',baseIds.length+' lineages, '+designs.size+' evolved forms');

if(process.argv.includes('--browser')) await playtest();

async function playtest() {
  const windowsBrowsers=[
    [process.env.ProgramFiles,'Google','Chrome','Application','chrome.exe'],
    [process.env.ProgramFiles,'BraveSoftware','Brave-Browser','Application','brave.exe']
  ].filter(([folder])=>folder).map(parts=>join(...parts));
  const executablePath=process.env.ROAM_BROWSER??windowsBrowsers.find(path=>existsSync(path));
  const target=process.argv.find(arg=>arg.startsWith('--url='))?.slice('--url='.length);
  const url=target??new URL('../Rainbow Roam.html',import.meta.url).href;
  const offline=!target;
  const browser=await chromium.launch({executablePath,args:['--enable-unsafe-swiftshader']});
  const errors=[],requests=[];
  const output='screenshots/evolutions';
  await mkdir(output,{recursive:true});
  async function open(mobile=false,seed=null){
    const page=await browser.newPage({offline,viewport:mobile?{width:393,height:852}:{width:1360,height:850},
      isMobile:mobile,hasTouch:mobile});
    page.setDefaultTimeout(20000);
    page.on('pageerror',error=>errors.push(error.message));
    page.on('request',request=>{if(/^https?:/.test(request.url())) requests.push(request.url());});
    if(seed) await page.addInitScript(({key,seed})=>{
      if(!localStorage.getItem(key)) localStorage.setItem(key,JSON.stringify(seed));
    },{key:SAVE_KEY,seed});
    await page.goto(url);
    await page.locator('#start').click();
    await page.locator('#region').filter({hasText:/\S/}).waitFor();
    return page;
  }
  const save=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
  const screenshot=(page,name)=>page.screenshot({path:output+'/'+name+'.png',animations:'disabled'});
  const button=(page,name)=>page.locator('#overlay').getByRole('button',{name,exact:true});
  const current=page=>page.locator('.evolution-stage[aria-current="step"] h4').textContent();
  const nav=page=>page.locator('#toolbar [data-action="companions"]');
  const chart=page=>button(page,'Evolution chart');
  try{
    const seed=newGame();
    seed.companions=['pearly'];seed.active='pearly';seed.sound=false;
    seed.care.pearly={affinity:3};seed.inventory={treat:8,charm:2};
    const page=await open(false,seed);
    await page.clock.install();
    await page.keyboard.press('c');
    await button(page,'All creatures').click();
    const cards=page.locator('.companion-card');
    assert.equal(await cards.count(),baseIds.length);
    const missingPictures=await cards.evaluateAll(async entries=>{
      const sheets=new Map();
      const missing=[];
      for(const entry of entries){
        const tile=entry.querySelector('.friend-plate .art-tile');
        const source=tile&&getComputedStyle(tile).backgroundImage.match(/^url\("([^"]+)"\)$/)?.[1];
        if(source&&!sheets.has(source)){
          const image=new Image();
          image.src=source;
          sheets.set(source,image.decode().then(()=>true,()=>false));
        }
        if(!source||!await sheets.get(source)) missing.push(entry.querySelector('.friend-description strong').textContent);
      }
      return missing;
    });
    assert.deepEqual(missingPictures,[],'Every base creature needs a loadable portrait');
    await button(page,'New friends').click();
    await screenshot(page,'desktop-new-friends');
    await chart(page).click();
    assert.equal(await page.locator('[data-evolution-row]').count(),baseIds.length);
    assert.equal(await current(page),'Pearlyspark');
    const middle=button(page,'Evolve into Prismtrot');
    assert(await middle.isDisabled());
    await button(page,'Companion care').click();
    await button(page,'Pet').click();
    assert.equal((await save(page)).care.pearly.affinity,4);
    await page.keyboard.press('c');
    await middle.click();
    assert.equal(await current(page),'Prismtrot');
    assert.equal((await save(page)).evolutions.pearly,1);
    assert.equal((await save(page)).inventory.treat,7);
    const final=button(page,'Evolve into Dewbow Regent');
    assert(await final.isDisabled());
    for(const care of ['Play fetch','Pet','Give meadow biscuit','Play fetch','Pet']){
      await page.clock.setSystemTime(await page.evaluate(()=>Date.now()+10000));
      await button(page,'Companion care').click();
      await button(page,care).click();
      await page.keyboard.press('c');
    }
    assert.equal((await save(page)).care.pearly.affinity,9);
    await final.click();
    assert.equal(await current(page),'Dewbow Regent');
    assert.equal((await save(page)).inventory.charm,1);
    assert.deepEqual((await save(page)).companions,['pearly']);
    assert.equal((await save(page)).active,'pearly');
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('.panel-body').evaluate(element=>element.scrollTop=0);
    await screenshot(page,'desktop-chart');
    await page.keyboard.press('Escape');
    await page.locator('#buddy').getByText('Dewbow Regent',{exact:true}).waitFor();
    await screenshot(page,'evolved-follower');
    await page.reload();
    await page.locator('#start').click();
    await page.locator('#buddy').getByText('Dewbow Regent',{exact:true}).waitFor();
    await nav(page).click();
    await chart(page).click();
    assert.equal(await current(page),'Dewbow Regent');
    await page.close();

    const phone=await open(true);
    await nav(phone).tap();
    await chart(phone).tap();
    const search=phone.getByRole('searchbox',{name:'Find an evolution line'});
    await search.fill('Galleonray');
    assert.equal(await phone.locator('[data-evolution-row]:visible').count(),1);
    await phone.locator('[data-action="show-lineage:pennyglide"]').tap();
    assert.deepEqual(await phone.locator('.evolution-stage h4').allTextContents(),
      ['Pennyglide','Halfcrown Skate','Galleonray']);
    assert.equal(await phone.locator('.evolution-button').count(),0);
    const layout=await phone.locator('.evolution-stages').evaluate(async element=>{
      const [first,second]=element.children;
      const art=getComputedStyle(first.querySelector('.evolution-art')).backgroundImage;
      const source=art.match(/^url\("([^"]+)"\)$/)?.[1];
      const image=new Image();
      image.src=source??'';
      await image.decode();
      return {portraitSheetLoaded:image.naturalWidth>0,stacked:second.offsetTop>first.offsetTop,
        noOverflow:element.scrollWidth<=element.clientWidth};
    });
    assert.deepEqual(layout,{portraitSheetLoaded:true,stacked:true,noOverflow:true});
    await phone.evaluate(()=>document.fonts.ready);
    await screenshot(phone,'phone-chart');
    await search.fill('no such magical creature');
    assert.equal(await phone.locator('[data-evolution-row]:visible').count(),0);
    assert.equal(await phone.locator('.evolution-results').textContent(),'No matching evolution lines');
    await phone.close();
    assert.deepEqual(errors,[]);
    if(offline) assert.deepEqual(requests,[]);
    else assert(requests.some(request=>new URL(request).pathname.endsWith('/evolution-portraits.webp')));
    console.log('EVOLUTION_BROWSER_VERIFIED', 'desktop progression and reload, mobile search and '+(offline?'offline':'served')+' portraits');
  } finally {
    await browser.close();
  }
}
