import asyncio
from playwright.async_api import async_playwright
async def run(b, vw, tag, full):
  ctx=await b.new_context(viewport={'width':vw[0],'height':vw[1]},has_touch=vw[0]<900);pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  await pg.add_init_script("window.__DL_FLOW=1")
  # existing save
  await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(600)
  if full: await pg.screenshot(path=f'/tmp/f_{tag}_boot.png')
  await E("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.SAVE.data.firstRunShown=true;D.SAVE.data.money=4321000;D.SAVE.save(true);D.UI._newsShown=true;D.UI._logChk=true}")
  await pg.wait_for_timeout(5500)
  demo=await E("()=>[document.body.classList.contains('att-demo'),!!(window.__DL.game&&window.__DL.game.active),window.__DL.game&&window.__DL.game.cfg&&window.__DL.game.cfg.demo,(document.getElementById('btnStart')||{}).textContent]")
  if full: await pg.screenshot(path=f'/tmp/f_{tag}_title.png')
  # gift pending
  await E("()=>{const X=window.__DLX;}")
  await pg.click('#btnStart');await pg.wait_for_timeout(700)
  ds=await E("()=>[document.getElementById('dsFx').dataset.step,document.querySelectorAll('.ds-opt').length,!(window.__DL.game&&window.__DL.game.active),document.body.classList.contains('att-demo')]")
  if full: await pg.screenshot(path=f'/tmp/f_{tag}_select.png')
  await E("()=>document.querySelector('.ds-opt.d').click()");await pg.wait_for_timeout(500)
  cf=await E("()=>[document.getElementById('dsFx').dataset.step,(document.querySelector('.dl-nm')||{}).textContent,!!document.querySelector('.dl-rk')]")
  if full: await pg.screenshot(path=f'/tmp/f_{tag}_confirm.png')
  await E("()=>document.querySelector('[data-ds=yes]').click()");await pg.wait_for_timeout(1200)
  st=await E("()=>[window.__DL.UI.screen,document.body.classList.contains('arc'),document.querySelectorAll('.sm-rail .am-card').length,window.__DL.SAVE.data.money,document.getElementById('dsFx').classList.contains('show')]")
  if full: await pg.screenshot(path=f'/tmp/f_{tag}_start.png')
  # start menu -> mode select via enter
  await E("()=>window.__DL.UI.a_smOk()");await pg.wait_for_timeout(700)
  ms=await E("()=>window.__DL.UI.screen")
  await E("()=>window.__DL.UI.goMenu()");await pg.wait_for_timeout(500);hm=await E("()=>window.__DL.UI.screen")
  await E("()=>{const U=window.__DL.UI;U.smI=6;U.a_smOk()}");await pg.wait_for_timeout(700);cl=await E("()=>[window.__DL.UI.screen,document.getElementById('s-menu').classList.contains('show')]")
  await ctx.close()
  # guest path
  ctx=await b.new_context(viewport={'width':vw[0],'height':vw[1]},has_touch=vw[0]<900);pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  await pg.add_init_script("window.__DL_FLOW=1")
  await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
  await E("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.SAVE.data.firstRunShown=true;D.SAVE.data.money=7777777;D.SAVE.save(true)}")
  before=await E("()=>localStorage.getItem(window.__DL.SAVE.key)")
  await pg.click('#btnStart');await pg.wait_for_timeout(500)
  await E("()=>document.querySelector('.ds-opt.g').click()");await pg.wait_for_timeout(300);await E("()=>document.querySelector('.ds-opt.g').click()");await pg.wait_for_timeout(1200)
  g=await E("()=>[window.__DLX.GUEST.on,window.__DL.SAVE.data.money,!!document.getElementById('guestBar'),window.__DL.UI.screen]")
  await E("()=>{const D=window.__DL;D.SAVE.data.money=1;D.SAVE.save(true)}")
  after=await E("()=>localStorage.getItem(window.__DL.SAVE.key)")
  await E("()=>window.__DL.UI.open('online')");await pg.wait_for_timeout(300);on=await E("()=>window.__DL.UI.screen")
  if full: await pg.screenshot(path=f'/tmp/f_{tag}_guest.png')
  await ctx.close()
  print(tag,'demo',demo,'ds',ds,'cf',cf,'start',st,'mode',ms,'home',hm,'classic',cl,'guest',g,'unchanged',before==after,'online-blocked',on,errs[:4])
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for v in [((1280,720),'d',True),((860,395),'l',True),((390,844),'p',True)]: await run(b,*v)
    await b.close()
asyncio.run(main())
