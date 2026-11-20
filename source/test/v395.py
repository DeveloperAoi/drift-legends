import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,name,touch in [((1280,720),'d',False),((390,844),'p',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      await pg.evaluate("()=>{const UI=window.__DL.UI;UI.stTab='packs';UI.open('store')}");await pg.wait_for_timeout(600)
      for i in [0,1,3]:
        await pg.evaluate(f"()=>window.__DL.UI.a_vpGo('packs:={i}')");await pg.wait_for_timeout(900);await pg.screenshot(path=f'/tmp/cv{i}_{name}.png')
      if name=='d':
        await pg.evaluate("()=>window.__DL.UI.a_openChest('legend:1')");await pg.wait_for_timeout(1500);await pg.screenshot(path='/tmp/cv_open.png')
      print(name,errs)
    await b.close()
asyncio.run(main())
