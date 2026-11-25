import asyncio
from playwright.async_api import async_playwright
async def run(b, vw, tag):
  pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=vw[0]<900);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
  await E("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
  await pg.click('#btnStart');await pg.wait_for_timeout(1200);await E("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
  m0=await E("()=>!!document.querySelector('.mm-arc')")
  await E("()=>document.querySelector('.mm-arc').click()");await pg.wait_for_timeout(700)
  a=await E("()=>[window.__DL.UI.screen,document.body.classList.contains('arc'),document.querySelectorAll('.am-card').length,(document.querySelector('.am-name b')||{}).textContent,!!document.querySelector('#arcCon .ac-row b')]")
  if vw[0]>=900:
    await pg.keyboard.press('ArrowRight');await pg.wait_for_timeout(400)
  else:
    await E("()=>document.querySelector('.am-arw.r').click()");await pg.wait_for_timeout(400)
  k=await E("()=>(document.querySelector('.am-name b')||{}).textContent")
  # pick LOCAL BATTLE (coming soon) -> stays
  await E("()=>{const U=window.__DL.UI;U.amI=window.__DLX.AM_MODES.findIndex(m=>m.id==='local');U.render()}");await E("()=>window.__DL.UI.a_amGo()");await pg.wait_for_timeout(500)
  soon=await E("()=>[window.__DL.UI.screen,!!document.querySelector('.am-go[disabled]')]")
  # TIME ATTACK -> maps -> car select -> confirm -> race
  await E("()=>{const U=window.__DL.UI;U.amI=0;U.render()}");await E("()=>document.querySelector('.am-go').click()");await pg.wait_for_timeout(900)
  mp=await E("()=>[window.__DL.UI.screen,!!document.querySelector('.arc-rail .mapcard.sel'),!!document.querySelector('.mp-view canvas'),!!document.querySelector('.mp-info')]")
  await pg.screenshot(path=f'/tmp/t_{tag}_amaps.png')
  await E("()=>{const c=[...document.querySelectorAll('.arc-rail .mapcard')].find(x=>!x.querySelector('.lock')&&!x.classList.contains('sel'));c&&c.click()}");await pg.wait_for_timeout(500)
  mp2=await E("()=>[window.__DL.UI.sel,!!document.querySelector('.arc-rail .mapcard.sel')]")
  await E("()=>{const U=window.__DL.UI;U.sel='metrox';U.render()}");await pg.wait_for_timeout(300)
  go=await E("()=>{window.__DLX.ARC.ok();return window.__DL.UI.screen}")
  await E("()=>window.__DL.UI.open('carsel',{mode:'time',mapId:'metrox',weather:'clear',time:'day',laps:1})");await pg.wait_for_timeout(700)
  cs=await E("()=>[!!document.querySelector('.ct-rail .ct.sel'),!!document.querySelector('[data-a=startRace]')]")
  await E("()=>document.querySelector('[data-a=startRace]').click()");await pg.wait_for_timeout(400)
  cf=await E("()=>!!document.querySelector('#overlay .arc-cf')")
  await pg.screenshot(path=f'/tmp/t_{tag}_acf.png')
  await E("()=>document.querySelector('[data-a=arcCarOk]').click()")
  await pg.wait_for_function("window.__DL.game.active",timeout=90000);await pg.wait_for_timeout(2000)
  hud=await E("()=>[document.body.classList.contains('arc'),getComputedStyle(document.getElementById('arcCon')).display]")
  await E("()=>{const g=window.__DL.game;g.started=true;g.laps=[{t:101.2,s:[]},{t:99.876,s:[]}];g._wallHits=0;g.finish('goal')}");await pg.wait_for_selector('#overlay .res-modal',timeout=15000);await pg.wait_for_timeout(1200)
  rs=await E("()=>[!!document.querySelector('.arc-res'),(document.querySelector('.arc-time b')||{}).textContent,document.querySelectorAll('.arc-laps span').length,!!document.querySelector('.res-pb.arc-new')]")
  await pg.screenshot(path=f'/tmp/t_{tag}_ares.png')
  await E("()=>window.__DL.UI.a_resMenu()");await pg.wait_for_timeout(800)
  # tuning / dress up layout
  await E("()=>{const U=window.__DL.UI;U.open('tuning',{uid:window.__DL.SAVE.data.current});U.tmode='custom';U.tcat='rea';U.render()}");await pg.wait_for_timeout(700)
  tn=await E("()=>[!!document.querySelector('.tn-left'),document.querySelectorAll('.tn-parts .opt').length,document.querySelectorAll('.arc-eq').length]")
  # buy flow still works: pick a wing option -> preview/confirm path
  await E("()=>{const o=[...document.querySelectorAll('.tn-parts [data-a=lookOpt]')].find(x=>x.dataset.v.startsWith('wing:2'));o&&o.click()}");await pg.wait_for_timeout(500)
  buy=await E("()=>[JSON.stringify(window.__DL.SAVE.cur().look.owned.wing),window.__DL.SAVE.cur().look.wing,window.__DL.SAVE.data.money]")
  await E("()=>{try{window.__DL.UI.closeModal()}catch(e){};const U=window.__DL.UI;U._sim=null}")
  # story, online
  await E("()=>window.__DL.UI.open('story')");await pg.wait_for_timeout(500);st=await E("()=>[!!document.querySelector('.ss-rail .ss-tab'),!!document.querySelector('[data-a=storyGo]')]")
  await E("()=>window.__DL.UI.open('online')");await pg.wait_for_timeout(500);ob=await E("()=>!!document.querySelector('.ob-hero')")
  # settings toggle off
  await E("()=>{window.__DL.UI.open('settings');window.__DL.UI.a_arcTog();window.__DL.UI.goMenu();window.__DL.UI.open('maps',{mode:'time'})}");await pg.wait_for_timeout(600)
  off=await E("()=>[document.body.classList.contains('arc'),!!document.querySelector('.arc-rail'),!!document.querySelector('.mm-arc')]")
  await E("()=>window.__DL.UI.a_arcTog()")
  print(tag,'menu',m0,'am',a,k,'soon',soon,'maps',mp,mp2,go,'car',cs,cf,'hud',hud,'res',rs,'tune',tn,buy,'story',st,'online',ob,'off',off,errs[:4])
  await pg.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for v in [((1280,720),'d'),((860,395),'l'),((390,844),'p')]: await run(b,*v)
    await b.close()
asyncio.run(main())
