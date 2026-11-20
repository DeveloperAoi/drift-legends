import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,name,touch in [((1280,720),'d',False),((390,844),'p',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch)
      errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      await pg.evaluate("()=>{const UI=window.__DL.UI;UI.stTab='packs';UI.open('store')}");await pg.wait_for_timeout(500)
      await pg.evaluate("()=>window.__DL.UI.a_vpGo('packs:=4')");await pg.wait_for_timeout(900)
      t=pg.locator('[data-a=ccPrev]').first; await t.scroll_into_view_if_needed()
      if touch: await t.tap()
      else: await t.click()
      await pg.wait_for_timeout(1200); a=await pg.evaluate("()=>document.body.classList.contains('ccpv')")
      btn=pg.locator('.cpv-x')
      if touch: await btn.tap()
      else: await btn.click()
      await pg.wait_for_timeout(800)
      r=await pg.evaluate("()=>[document.body.classList.contains('ccpv'),!!document.getElementById('ccPv'),getComputedStyle(document.getElementById('panelBody')).visibility]")
      print(name,'opened',a,'after back',r,errs)
    await b.close()
asyncio.run(main())
