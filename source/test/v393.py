import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,name,touch in [((1280,720),'d',False),((860,395),'l',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true;D.SAVE.data.carCards=D.SAVE.data.carCards||{};D.SAVE.data.carCards.mv_candy=40}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      await pg.evaluate("()=>{const U=window.__DL.UI;U.stTab='packs';U.open('store')}");await pg.wait_for_timeout(400)
      await pg.evaluate("()=>window.__DL.UI.a_vpGo('packs:=4')");await pg.wait_for_timeout(800);await pg.screenshot(path=f'/tmp/z_cc_{name}.png')
      await pg.evaluate("()=>window.__DL.UI.a_ccTrade('mv_candy')");await pg.wait_for_timeout(800)
      own=await pg.evaluate("()=>window.__DL.SAVE.data.cars.some(c=>c.id==='mv_candy')")
      await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){};const D=window.__DL;const c=D.SAVE.data.cars.find(c=>c.id==='mv_candy');D.SAVE.data.cur=c.uid}")
      await pg.evaluate("()=>{const D=window.__DL;const inst=D.SAVE.data.cars.find(c=>c.id==='mv_candy');D.UI.launch({mode:'free',mapId:'akigiri',weather:'clear',time:'day',laps:1,carInst:inst,rivals:[]})}");await pg.wait_for_timeout(5000)
      await pg.keyboard.down('ArrowUp');await pg.wait_for_timeout(2500);await pg.keyboard.down('ArrowLeft');await pg.wait_for_timeout(1200)
      await pg.screenshot(path=f'/tmp/z_race_{name}.png');await pg.keyboard.up('ArrowLeft');await pg.keyboard.up('ArrowUp')
      sp=await pg.evaluate("()=>{const g=window.__DL.UI.game;return [g.carInst.id,Math.round(g.veh.speed*3.6)]}")
      print(name,'owned',own,sp,errs)
    await b.close()
asyncio.run(main())
