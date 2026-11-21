import asyncio
from playwright.async_api import async_playwright
async def run(b, vw, tag, full):
  pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=vw[0]<900);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
  await E("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
  await pg.click('#btnStart');await pg.wait_for_timeout(1200);await E("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
  # daily events
  await E("()=>{window.__DL.UI.ev2=null;window.__DL.UI.open('devent')}");await pg.wait_for_timeout(900);await pg.screenshot(path=f'/tmp/e_{tag}_list.png')
  await E("()=>document.querySelectorAll('[data-a=ev2Open]')[2].click()");await pg.wait_for_timeout(700);await pg.screenshot(path=f'/tmp/e_{tag}_detail.png')
  await E("()=>document.querySelector('[data-a=ev2Tab][data-v=rank]').click()");await pg.wait_for_timeout(400)
  if full: await pg.screenshot(path=f'/tmp/e_{tag}_rank.png')
  await E("()=>document.querySelector('[data-a=ev2Go]').click()")
  await pg.wait_for_function("window.__DL.game.active", timeout=60000);await pg.wait_for_timeout(2500)
  info=await E("()=>[window.__DL.game.cfg.mode, window.__DL.game.carInst.id, window.__DLX.evTk().n]")
  await E("()=>{const g=window.__DL.game;g.jumps=5;g.started=true;g.laps=[{t:62.5,s:[]}];g.finish('goal')}");await pg.wait_for_selector('#overlay .res-modal', timeout=15000);await pg.wait_for_timeout(1200)
  await pg.screenshot(path=f'/tmp/e_{tag}_res.png')
  note=await E("()=>[...document.querySelectorAll('.dv-res')].map(e=>e.textContent).join(' | ')")
  await E("()=>window.__DL.UI.a_resNext()");await pg.wait_for_timeout(1200)
  st=await E("()=>{const e=window.__DLX.evList().find(x=>x.id==='jump');const s=window.__DLX.ev2State(e);return [window.__DL.UI.screen, JSON.stringify(s.prog), s.runs, window.__DL.SAVE.data.cars.length]}")
  print(tag,'event',info,st,note[:200])
  # sticker book
  await E("()=>{window.__DL.UI.goMenu();}");await pg.wait_for_timeout(500)
  await E("()=>{const X=window.__DLX;X.grant(X.ITEM_BY_ID.bstk_dragon);X.grant(X.ITEM_BY_ID.bstk_koi);window.__DL.SAVE.data.stkBook={akigiri:16,kuremine:6,harukaze:1};document.querySelector('[data-m=stkbook]').click()}");await pg.wait_for_timeout(800);await pg.screenshot(path=f'/tmp/b_{tag}_book.png')
  # shop page
  await E("()=>{const D=window.__DL;D.UI.stTab='packs';D.UI._vp.packs=4;D.UI.open('store')}");await pg.wait_for_timeout(1500);await pg.screenshot(path=f'/tmp/b_{tag}_store.png')
  pages=await E("()=>[...document.querySelectorAll('.vp-page')].map(p=>p.dataset.t).join(',')")
  # charm tabs
  await E("()=>{const X=window.__DLX,D=window.__DL;['bf_blue','nf_rainbow','bov_chatter','lf_police','lf_train','knob_crystal','stw_yoke'].forEach(i=>X.grant(X.ITEM_BY_ID[i]));D.UI.cmTab='flame';D.UI.open('charm')}");await pg.wait_for_timeout(700)
  if full: await pg.screenshot(path=f'/tmp/b_{tag}_flame.png')
  for a in ["setFx2','bfX:blue","setFx2','nfX:rainbow","setFx2','bovX:chatter","setFx2','lfH:police","setFx2','lfT:train","setFx2','knobX:crystal","setFx2','swX:yoke"]:
    await E(f"()=>window.__DL.UI.a_{a.split(chr(39))[0]}('{a.split(chr(39))[-1]}')")
  await E("()=>{window.__DL.UI.cmTab='lights';window.__DL.UI.render()}");await pg.wait_for_timeout(400)
  if full: await pg.screenshot(path=f'/tmp/b_{tag}_lights.png')
  await E("()=>window.__DL.UI.a_buyLfx('pulse')")
  await E("()=>{window.__DL.UI.cmTab='gear';window.__DL.UI.render()}");await pg.wait_for_timeout(400);await pg.screenshot(path=f'/tmp/b_{tag}_gear.png')
  # race with knob + wheel
  await E("()=>{const D=window.__DL;D.SAVE.data.settings.knobUI=true;D.SAVE.data.settings.wheelUI=true;D.UI.launch({mode:'free', mapId:'harbor', weather:'clear', time:'night', laps:1, carInst:D.SAVE.cur(), rivals:[]})}")
  await pg.wait_for_function("window.__DL.game.active", timeout=60000);await pg.wait_for_timeout(2500)
  g0=await E("()=>window.__DL.game.veh.gear")
  box=await pg.locator('#knobUI .kn-body').bounding_box()
  await pg.mouse.click(box['x']+box['width']/2, box['y']+20);await pg.wait_for_timeout(400)
  g1=await E("()=>window.__DL.game.veh.gear")
  wb=await pg.locator('#wheelUI').bounding_box(); cx=wb['x']+wb['width']/2; cy=wb['y']+wb['height']/2
  await pg.mouse.move(cx, wb['y']+10); await pg.mouse.down(); await pg.mouse.move(cx+wb['width']/2-5, cy, steps=6); await pg.wait_for_timeout(300)
  steer=await E("()=>[window.__DLX.CTL.wheel.val, window.__DL.game.veh.steer]")
  await pg.screenshot(path=f'/tmp/r_{tag}_ctl.png'); await pg.mouse.up()
  # flames
  await E("()=>{const g=window.__DL.game;window.__DL.Input.keys.nitro=true;window.__DL.Input.keys.gas=true;g._bfT=0.2}");await pg.wait_for_timeout(900);await pg.screenshot(path=f'/tmp/r_{tag}_fx.png')
  await E("()=>{const g=window.__DL.game;window.__DL.Input.keys.nitro=false;window.__DL.Input.keys.gas=false;window.__DL.SAVE.data.settings.knobUI=false;window.__DL.SAVE.data.settings.wheelUI=false;g.started=true;g.finish('goal')}");await pg.wait_for_timeout(1500)
  print(tag,'store',pages,'gear',g0,g1,'steer',steer,'errs',errs[:4])
  await pg.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    await run(b,(1280,720),'d',True); await run(b,(860,395),'l',False); await run(b,(390,844),'p',False)
    await b.close()
asyncio.run(main())
