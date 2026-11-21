import asyncio
from playwright.async_api import async_playwright
FAKE = """()=>{const store={};const get=p=>p.split('/').filter(Boolean).reduce((o,k)=>o&&o[k],store);const set=(p,v)=>{const ks=p.split('/').filter(Boolean);let o=store;for(let i=0;i<ks.length-1;i++){o[ks[i]]=o[ks[i]]||{};o=o[ks[i]];}if(v===null||v===undefined)delete o[ks[ks.length-1]];else o[ks[ks.length-1]]=JSON.parse(JSON.stringify(v));fire();};
 const subs=[];const fire=()=>subs.forEach(f=>f());let n=0;
 const ref=p=>({key:p.split('/').pop(),orderByChild(){return this},limitToLast(){return this},on(e,cb){const f=()=>cb({val:()=>get(p)||null});subs.push(f);f();},off(){},
   push(){const k='k'+(++n);return ref(p+'/'+k)},async set(v){set(p,v)},async remove(){set(p,null)},async update(o){for(const k in o)set(p+'/'+k,o[k])},
   async transaction(fn){const cur=get(p);const r=fn(cur===undefined?null:cur);if(r===undefined)return{committed:false};set(p,r);return{committed:true}}});
 window.__FAKE=store; const S=window.__DLX.SOC||window.SOC; return !!S}"""
async def run(b, vw, tag, full):
  pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=vw[0]<900);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
  await E("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
  await pg.click('#btnStart');await pg.wait_for_timeout(1200);await E("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
  await pg.screenshot(path=f'/tmp/n_{tag}_menu.png')
  # mystery
  await E("()=>{window.__DL.UI.ev2=null;window.__DL.UI.open('devent')}");await pg.wait_for_timeout(700)
  if full: await pg.screenshot(path=f'/tmp/n_{tag}_evlist.png')
  await E("()=>document.querySelector('[data-a=mkOpen]').click()");await pg.wait_for_timeout(700);await pg.screenshot(path=f'/tmp/n_{tag}_mk.png')
  await E("()=>document.querySelector('[data-a=mkGo]').click()");await pg.wait_for_function("window.__DL.game.active",timeout=60000);await pg.wait_for_timeout(2500)
  await E("()=>{const g=window.__DL.game;g._nitroT=6;g.maxSpeed=210;g.started=true;g.laps=[{t:30,s:[]}];g.finish('goal')}");await pg.wait_for_selector('#overlay .res-modal',timeout=15000);await pg.wait_for_timeout(1000)
  await pg.screenshot(path=f'/tmp/n_{tag}_mkres.png')
  u=await E("()=>JSON.stringify(window.__DL.SAVE.data.unopened.packs)")
  await E("()=>window.__DL.UI.a_resNext()");await pg.wait_for_timeout(900)
  # give cards -> stars -> key -> unlock
  car=await E("()=>window.__DLX.mkEvent().car")
  await E(f"()=>{{const X=window.__DLX;for(let i=0;i<8;i++)X.grant(X.ITEM_BY_ID['mks_{car}_10'])}}");await pg.wait_for_timeout(300)
  mk=await E(f"()=>{{const D=window.__DL;return [D.SAVE.data.carStars['{car}'], !!window.__DLX.ITEM_BY_ID['mkey_{car}'] && window.__DL.SAVE.data.inv['mkey_{car}']]}}")
  await E("()=>window.__DL.UI.render()");await pg.wait_for_timeout(400)
  if full: await pg.screenshot(path=f'/tmp/n_{tag}_mkkey.png')
  await E(f"()=>window.__DL.UI.a_mkUnlock('{car}')");await pg.wait_for_timeout(600)
  own=await E(f"()=>window.__DL.SAVE.data.cars.some(c=>c.id==='{car}')")
  await pg.wait_for_timeout(6000); await E("()=>{const o=document.getElementById('carFx');o&&o.click();o&&o.click()}");await pg.wait_for_timeout(1200)
  print(tag,'mystery',u,mk,own)
  # chase
  await E("()=>window.__DL.UI.open('chase')");await pg.wait_for_timeout(800);await pg.screenshot(path=f'/tmp/n_{tag}_chase.png')
  await E("()=>document.querySelector('[data-a=chaseGo]').click()");await pg.wait_for_function("window.__DL.game.active",timeout=60000);await pg.wait_for_timeout(4500)
  await pg.screenshot(path=f'/tmp/n_{tag}_chaserace.png')
  ch=await E("()=>{const g=window.__DL.game;return [g.rivals.length, g.rivals.map(r=>Math.round(r.prog-g.totalDist)).join(','), !!g.rivals[0].model.police, !!document.getElementById('chaseHud')]}")
  await E("()=>{const g=window.__DL.game;g._bust=3}");await pg.wait_for_timeout(1500)
  await pg.wait_for_selector('#overlay .res-modal',timeout=15000);await pg.wait_for_timeout(800)
  note=await E("()=>[...document.querySelectorAll('.dv-res')].map(e=>e.textContent).join('|')")
  await E("()=>window.__DL.UI.a_resNext()");await pg.wait_for_timeout(800)
  print(tag,'chase',ch,note[:80])
  # market with fake db
  await E(FAKE.replace("return !!S}","")+"}") if False else None
  await E(FAKE)
  await E("""()=>{const D=window.__DL;const X=window.__DLX;const fk=window.__FAKE;const S=X.SOC;}""") if False else None
  ok=await E("""()=>{try{const S=window.__DLX.SOC; if(!S) return 'noSOC'; const st={}; return 'ok'}catch(e){return String(e)}}""")
  print(tag,'soc',ok,'errs',errs[:4])
  await pg.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    await run(b,(1280,720),'d',True); await run(b,(860,395),'l',False); await run(b,(390,844),'p',False)
    await b.close()
asyncio.run(main())
