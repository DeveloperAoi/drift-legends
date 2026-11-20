import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,name,touch in [((1280,720),'d',False),((390,844),'p',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch)
      errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true;D.SAVE.data.money=9e8;D.SAVE.data.diamonds=500}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200)
      await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      await pg.screenshot(path=f'/tmp/t_menu_{name}.png')
      await pg.evaluate("()=>{const UI=window.__DL.UI;UI.stTab='packs';UI.open('store')}");await pg.wait_for_timeout(600)
      for i in range(4):
        await pg.evaluate(f"()=>window.__DL.UI.a_vpGo('packs:={i}')");await pg.wait_for_timeout(700)
        await pg.screenshot(path=f'/tmp/t_pg{i}_{name}.png')
      if name=='d':
        await pg.evaluate("()=>window.__DL.UI.a_openChest('vp_hyper:10')");await pg.wait_for_timeout(5500)
        await pg.screenshot(path='/tmp/t_open1.png')
        await pg.mouse.click(640,400);await pg.wait_for_timeout(1500);await pg.screenshot(path='/tmp/t_open2.png')
        for k in range(14): await pg.mouse.click(640,400);await pg.wait_for_timeout(250)
        await pg.wait_for_timeout(800);await pg.screenshot(path='/tmp/t_open3.png')
        r=await pg.evaluate("()=>{const d=window.__DL.SAVE.data;return [d.starCards,d.money]}");print(r)
        await pg.evaluate("()=>{const D=window.__DL;D.UI.closeModal&&D.UI.closeModal();try{window.__DLX.PACKFX&&window.__DLX.PACKFX.close()}catch(e){};const d=D.SAVE.data;d.starCards=d.starCards||{};const id=D.SAVE.cur().id;d.starCards[id]=5;d.inv=d.inv||{};D.SAVE.addItem?0:0;d.charm='maneki'}")
        # give charm item
        await pg.evaluate("()=>{const D=window.__DL;try{window.__DLX.grantChestItem?0:0}catch(e){};const d=D.SAVE.data;(d.items=d.items||{})['ch_maneki']=1;}")
        await pg.evaluate("()=>window.__DL.UI.open('garage')");await pg.wait_for_timeout(600)
        await pg.evaluate("()=>{const UI=window.__DL.UI;UI.a_starUp(window.__DL.SAVE.cur().id)}");await pg.wait_for_timeout(700)
        await pg.screenshot(path='/tmp/t_starfx.png')
        print('stars',await pg.evaluate("()=>window.__DLX.carStars(window.__DL.SAVE.cur().id)"))
        print('hasCharm',await pg.evaluate("()=>{try{return invHas('ch_maneki')}catch(e){return 'x'}}"))
      print(name,errs)
    await b.close()
asyncio.run(main())
