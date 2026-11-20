import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,name,touch in [((1280,720),'d',False),((860,395),'l',True),((390,844),'p',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true;D.SAVE.data.money=9e8}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      if name=='d':
        r=await pg.evaluate("""()=>{const X=window.__DLX;return ['platepack','goalpack','gdecopack','hornpack','bronze','gold','charmpack'].map(id=>{const c=X.CHESTS.find(x=>x.id===id);return id+':'+['C','U','R','E','L'].map(r=>{const p=X.packPool(c,r);return p.length+(p.some(i=>['platedesign','goalfx','gdeco','horn'].includes(i.type))&&!['platepack','goalpack','gdecopack','hornpack'].includes(id)?'!LEAK':'')}).join('/')})}""");print(r)
        # grant all
        await pg.evaluate("()=>{const D=window.__DL,X=window.__DLX;for(const k of ['platedesign','goalfx','gdeco','horn'])for(const it of Object.values(X.ITEM_BY_ID).filter(i=>i.type===k))X.grant(it);}")
      await pg.evaluate("()=>{const UI=window.__DL.UI;UI.stTab='packs';UI.open('store')}");await pg.wait_for_timeout(500)
      await pg.evaluate("()=>window.__DL.UI.a_vpGo('packs:=3')");await pg.wait_for_timeout(800);await pg.screenshot(path=f'/tmp/q_ps_{name}.png')
      if name=='d':
        await pg.evaluate("()=>window.__DL.UI.a_openChest('goalpack:10')");await pg.wait_for_timeout(1500);await pg.click('.pfx-open');await pg.wait_for_timeout(3500);await pg.screenshot(path='/tmp/q_open.png')
        await pg.evaluate("()=>{try{window.__DLX.PACKFX&&0}catch(e){}}")
        await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
        await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
        await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
        await pg.evaluate("()=>{const D=window.__DL,X=window.__DLX;for(const k of ['platedesign','goalfx','gdeco','horn'])for(const it of Object.values(X.ITEM_BY_ID).filter(i=>i.type===k))X.grant(it);}")
      for tab in ['plate','goal','gdeco','horn']:
        await pg.evaluate(f"()=>{{const U=window.__DL.UI;U.open('charm');U.a_cmTab('{tab}')}}");await pg.wait_for_timeout(400)
        if tab=='plate': await pg.evaluate("()=>window.__DL.UI.a_setPlateD('galaxy')");await pg.wait_for_timeout(1500)
        if tab=='gdeco': await pg.evaluate("()=>{const U=window.__DL.UI;for(const id of ['neon_drift','arcade','poster_touge','vending','trophy','torii','statue','lantern'])U.a_togGdeco(id)}");await pg.wait_for_timeout(1500)
        if tab=='horn': await pg.evaluate("()=>window.__DL.UI.a_setHorn('train')")
        if tab=='goal': await pg.evaluate("()=>window.__DL.UI.a_setGoalFx('dragon')")
        await pg.screenshot(path=f'/tmp/q_{tab}_{name}.png')
      if name=='d':
        await pg.evaluate("()=>{const U=window.__DL.UI;U.goMenu();U.show.rot=1.6;U.show.dist=11}");await pg.wait_for_timeout(1500);await pg.screenshot(path='/tmp/q_garage_menu.png')
        for gid in ['fireworks','dragon','rainbow','coins']:
          await pg.evaluate(f"()=>window.__DLX.GFX.play('{gid}')");await pg.wait_for_timeout(1400);await pg.screenshot(path=f'/tmp/q_fx_{gid}.png')
        await pg.wait_for_timeout(3000)
        await pg.evaluate("()=>window.__DL.UI.a_ctrlTest()");await pg.wait_for_timeout(4500)
        await pg.keyboard.press('h');await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/q_race.png')
        await pg.evaluate("()=>window.__DL.UI.game.finish('goal')");await pg.wait_for_timeout(1600);await pg.screenshot(path='/tmp/q_finish.png')
      print(name,errs)
    await b.close()
asyncio.run(main())
