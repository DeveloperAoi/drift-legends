import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,name,touch in [((1280,720),'d',False),((390,844),'p',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch)
      errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL,X=window.__DLX;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true;X.grant(X.ITEM_BY_ID.ch_maneki);D.SAVE.data.charm='maneki'}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200)
      await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      await pg.evaluate("()=>{document.querySelector('#menuList').scrollTop=9999}");await pg.wait_for_timeout(300);await pg.screenshot(path=f'/tmp/w_menu_{name}.png')
      await pg.evaluate("()=>window.__DL.UI.a_ctrlTest()");await pg.wait_for_timeout(5000)
      await pg.keyboard.down('ArrowUp');await pg.wait_for_timeout(3000);await pg.keyboard.down('ArrowRight');await pg.wait_for_timeout(600)
      await pg.screenshot(path=f'/tmp/w_race_{name}.png')
      print(name,errs, await pg.evaluate("()=>{const m=document.getElementById('mirrorUI');return [m.style.display,window.__DLX.MIRROR.ang.toFixed(2)]}"))
    await b.close()
asyncio.run(main())
