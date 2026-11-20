import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,name,touch in [((1280,720),'d',False),((860,395),'l',True),((390,844),'p',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true;D.SAVE.data.money=9e9;D.SAVE.data.diamonds=500}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      await pg.evaluate("()=>{const U=window.__DL.UI;U.stTab='cons';U.open('store')}");await pg.wait_for_timeout(500)
      await pg.locator('[data-a=buyCons][data-v="ramen:money"]').first.click();await pg.wait_for_timeout(300)
      await pg.locator('#buyBar [data-a=buyConfirm]').click()
      shots=[150,450,800,1300,2300]; t0=0
      for t in shots: await pg.wait_for_timeout(t-t0); t0=t; await pg.screenshot(path=f'/tmp/a_buy_{name}_{t}.png')
      st=await pg.evaluate("()=>[window.__DLX.ACQ.mode,document.querySelectorAll('#acqFx .aq-card').length]")
      await pg.click('#acqFx .aq-next');await pg.wait_for_timeout(250);await pg.screenshot(path=f'/tmp/a_wipe_{name}.png');await pg.wait_for_timeout(500)
      after=await pg.evaluate("()=>window.__DLX.ACQ.mode")
      # pack intro
      await pg.evaluate("()=>{const U=window.__DL.UI;U.stTab='packs';U.render();U.a_openChest('gold:1')}")
      for t in [100,500,1000,1700]: await pg.wait_for_timeout(t if t==100 else 400 if t==500 else 500 if t==1000 else 700); await pg.screenshot(path=f'/tmp/a_pk_{name}_{t}.png')
      await pg.wait_for_timeout(800);pk=await pg.evaluate("()=>[window.__DLX.ACQ.mode,!!(window.__DLX.PACKFX&&0),document.querySelector('.pfx-open')?1:0]")
      print(name,'buy',st,'after',after,'pack',pk,errs)
    await b.close()
asyncio.run(main())
