import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,name,touch in [((1280,720),'d',False),((860,395),'l',True),((390,844),'p',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch)
      errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true;D.SAVE.data.money=9e8}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200)
      await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      await pg.evaluate("()=>{const UI=window.__DL.UI;UI.stTab='packs';UI.open('store')}");await pg.wait_for_timeout(500)
      await pg.evaluate("()=>window.__DL.UI.a_vpGo('packs:=2')");await pg.wait_for_timeout(700);await pg.screenshot(path=f'/tmp/x_veh_{name}.png')
      await pg.evaluate("()=>window.__DL.UI.a_vpGo('packs:=3')");await pg.wait_for_timeout(700);await pg.screenshot(path=f'/tmp/x_ps_{name}.png')
      if name=='d':
        r=await pg.evaluate("""()=>{const X=window.__DLX;const mp=X.CHESTS.find(c=>c.id==='moviepack'),vh=X.CHESTS.find(c=>c.id==='vp_hyper');return [['R','E','L'].map(r=>X.packPool(mp,r).filter(i=>i.car==='mv_shade').length), ['R','E','L'].map(r=>X.packPool(vh,r).filter(i=>i.car==='mv_shade').length), ['bronze','gold'].map(id=>{const c=X.CHESTS.find(x=>x.id===id);return c?['C','U','R','E','L'].some(r=>X.packPool(c,r).some(i=>i.car==='mv_shade')):'-'}), X.carClass(X.CAR_BY_ID.mv_shade), X.carMaxStars(X.CAR_BY_ID.mv_shade)]}""");print(r)
        await pg.evaluate("()=>{const D=window.__DL;D.UI.a_ccPrev('mv_shade')}");await pg.wait_for_timeout(1500);await pg.screenshot(path='/tmp/x_car.png')
      print(name,errs)
    await b.close()
asyncio.run(main())
