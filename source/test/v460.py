import asyncio
from playwright.async_api import async_playwright
async def run(b, vw, tag, full):
  pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=vw[0]<900);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
  await E("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
  await pg.click('#btnStart');await pg.wait_for_timeout(1200);await E("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
  await E("()=>{const D=window.__DL;['hy_aurex','hk_sd3','ka_tenma','mv_candy'].forEach(id=>{const c=D.SAVE.newCar(id);D.SAVE.data.cars.push(c)});D.UI.open('garage')}");await pg.wait_for_timeout(900);await pg.screenshot(path=f'/tmp/g_{tag}_garage.png')
  n1=await E("()=>document.querySelectorAll('.ct-grid .ct').length")
  await E("()=>document.querySelectorAll('.ct-grid .ct')[2].click()");await pg.wait_for_timeout(500)
  sel=await E("()=>[window.__DL.UI.sel, !!document.querySelector('.ct.sel')]")
  await E("()=>document.querySelector('[data-a=ctCls]').click()");await pg.wait_for_timeout(300)
  n2=await E("()=>document.querySelectorAll('.ct-grid .ct').length")
  await E("()=>{window.__DL.UI.cfCls='all';window.__DL.UI.open('shop')}");await pg.wait_for_timeout(900);await pg.screenshot(path=f'/tmp/g_{tag}_shop.png')
  n3=await E("()=>document.querySelectorAll('.ct-grid .ct').length")
  await E("()=>window.__DL.UI.open('maps',{mode:'race'})");await pg.wait_for_timeout(700)
  await E("()=>window.__DL.UI.a_toCarSel()");await pg.wait_for_timeout(900)
  scr=await E("()=>window.__DL.UI.screen")
  if full: await pg.screenshot(path=f'/tmp/g_{tag}_maps.png')
  # profile
  await E("()=>{const X=window.__DLX;window.__DL.SAVE.data.unopened=window.__DL.SAVE.data.unopened||{};window.__DL.UI.phTab='profile';window.__DL.UI.open('profile')}");await pg.wait_for_timeout(900);await pg.screenshot(path=f'/tmp/p_{tag}_prof.png')
  for t in ['stats','new','inbox']:
    await E(f"()=>window.__DL.UI.a_phTab('{t}')");await pg.wait_for_timeout(400)
    if full or t=='inbox': await pg.screenshot(path=f'/tmp/p_{tag}_{t}.png')
  ib=await E("()=>[window.__DLX.autoNotices().map(n=>n.id).join(','), window.__DLX.inboxUnread()]")
  print(tag,'tiles',n1,sel,n2,n3,scr,'inbox',ib,'errs',errs[:4])
  await pg.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    await run(b,(1280,720),'d',True); await run(b,(860,395),'l',False); await run(b,(390,844),'p',False)
    await b.close()
asyncio.run(main())
