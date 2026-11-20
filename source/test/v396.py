import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'])
    for vw,name,touch in [((1280,720),'d',False),((860,395),'l',True),((390,844),'p',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true;D.SAVE.data.diamonds=500}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      await pg.evaluate("()=>{document.querySelector('#menuList').scrollTop=9999}");await pg.wait_for_timeout(300);await pg.screenshot(path=f'/tmp/m_menu_{name}.png')
      await pg.click('[data-m=minigame]');await pg.wait_for_timeout(600);await pg.screenshot(path=f'/tmp/m_rl0_{name}.png')
      d0=await pg.evaluate("()=>window.__DL.SAVE.data.diamonds")
      await pg.click('[data-a=rlSpin]');await pg.wait_for_timeout(2000);await pg.screenshot(path=f'/tmp/m_rl1_{name}.png');await pg.wait_for_timeout(3000)
      d1=await pg.evaluate("()=>[window.__DL.SAVE.data.diamonds,JSON.stringify(window.__DL.SAVE.data.unopened||{})]")
      await pg.evaluate("()=>window.__DL.UI.a_mgTab('scratch')");await pg.wait_for_timeout(400)
      await pg.click('[data-a=scBuy]');await pg.wait_for_timeout(600)
      box=await pg.locator('#scCv').bounding_box()
      for y in range(0,int(box['height']),25):
        await pg.mouse.move(box['x']+5,box['y']+y);await pg.mouse.down();await pg.mouse.move(box['x']+box['width']*0.5,box['y']+y,steps=6);await pg.mouse.up()
      await pg.wait_for_timeout(300);await pg.screenshot(path=f'/tmp/m_sc1_{name}.png')
      await pg.evaluate("()=>window.__DL.UI.a_scAll()");await pg.wait_for_timeout(900);await pg.screenshot(path=f'/tmp/m_sc2_{name}.png')
      sc=await pg.evaluate("()=>{const S=window.__DLX.MG.scr;const c={};S.grid.forEach(k=>c[k]=(c[k]||0)+1);return [S.win,Math.max(...Object.values(c)),S.done]}")
      if name=='d':
        stats=await pg.evaluate("""()=>{const D=window.__DL,U=D.UI,X=window.__DLX;let win=0,bad=0;for(let i=0;i<2000;i++){D.SAVE.data.diamonds=100;X.MG.scr=null;U.a_scBuy();const S=X.MG.scr;const c={};S.grid.forEach(k=>c[k]=(c[k]||0)+1);const mx=Math.max(...Object.values(c));if(S.win)win++;if((S.win&&(c[S.win]!==3||Object.entries(c).some(([k,v])=>k!==S.win&&v>=3)))||(!S.win&&mx>=3))bad++;S.done=true}return [win/2000,bad]}""");print('scratch winrate,bad',stats)
        await pg.evaluate("()=>{const D=window.__DL,X=window.__DLX;for(const it of Object.values(X.ITEM_BY_ID).filter(i=>i.type==='enginesnd'))X.grant(it);const U=D.UI;U.open('charm');U.a_cmTab('engine')}");await pg.wait_for_timeout(500);await pg.screenshot(path='/tmp/m_eng.png')
        await pg.evaluate("()=>window.__DL.UI.a_setEngX('turbine')");await pg.wait_for_timeout(1500)
        r=await pg.evaluate("()=>{const D=window.__DL;D.UI.a_ctrlTest();return 1}");await pg.wait_for_timeout(4000)
        e=await pg.evaluate("()=>{const g=window.__DL.UI.game;return g.engine?[g.engine.sound,JSON.stringify(g.engine.P).slice(0,80)]:'noengine'}");print('engine',e)
      print(name,'dia',d0,d1,'scratch',sc,errs)
    await b.close()
asyncio.run(main())
