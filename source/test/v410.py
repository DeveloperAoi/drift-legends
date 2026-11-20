import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,name,touch in [((1280,720),'d',False),((860,395),'l',True),((390,844),'p',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true;D.SAVE.data.money=9e9;D.SAVE.data.diamonds=1000}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      await pg.evaluate("()=>{const U=window.__DL.UI;U.a_bxxGo('bxm_mix:open')}");await pg.wait_for_timeout(900);await pg.screenshot(path=f'/tmp/b_box0_{name}.png')
      st=await pg.locator('.cb-stage').bounding_box()
      for k in range(5):
        x=st['x']+st['width']/2;y=st['y']+st['height']
        await pg.mouse.move(x,y);await pg.mouse.down();await pg.mouse.move(x,y-st['height']*0.9,steps=10);await pg.mouse.up();await pg.wait_for_timeout(120)
        if k==1: await pg.screenshot(path=f'/tmp/b_box1_{name}.png')
      await pg.wait_for_timeout(1300);await pg.screenshot(path=f'/tmp/b_box2_{name}.png');await pg.wait_for_timeout(1000)
      stt=await pg.evaluate("()=>[window.__DLX.CBFX.state,window.__DLX.CBFX.p]")
      await pg.screenshot(path=f'/tmp/b_box3_{name}.png')
      if stt[0]==2: await pg.click('[data-b=save]');await pg.wait_for_timeout(300)
      u=await pg.evaluate("()=>JSON.stringify(window.__DL.SAVE.data.unopened.packs)")
      # pack save toggle
      await pg.evaluate("()=>{const U=window.__DL.UI;U.stTab='packs';U.open('store');U.a_psOpen('gold')}");await pg.wait_for_timeout(500)
      await pg.evaluate("()=>{const c=document.querySelector('.pk-save input');c.click()}");m0=await pg.evaluate("()=>window.__DL.SAVE.data.money")
      await pg.evaluate("()=>window.__DL.UI.a_psBuy('gold:5')");await pg.wait_for_timeout(300)
      ps=await pg.evaluate(f"()=>[{m0}-window.__DL.SAVE.data.money,window.__DL.SAVE.data.unopened.packs.gold]")
      await pg.evaluate("()=>{const D=window.__DL,X=window.__DLX;for(const it of Object.values(X.ITEM_BY_ID).filter(i=>i.type==='dashorn'))X.grant(it);D.SAVE.data.dash='cup';D.UI.pkSave=false;D.UI.a_ctrlTest()}");await pg.wait_for_timeout(4500)
      await pg.keyboard.down('ArrowUp');await pg.wait_for_timeout(2500);await pg.keyboard.down('ArrowLeft');await pg.wait_for_timeout(1500)
      await pg.screenshot(path=f'/tmp/b_race_{name}.png');await pg.keyboard.up('ArrowLeft');await pg.keyboard.up('ArrowUp')
      w=await pg.evaluate("()=>[+window.__DLX.DSH.water.toFixed(2),window.__DLX.DSH.spills,document.getElementById('dashUI').style.display]")
      if name=='d':
        for oid in ['bobdog','hula','globe','maneki']:
          await pg.evaluate(f"()=>{{window.__DL.SAVE.data.dash='{oid}'}}");await pg.keyboard.down('ArrowRight');await pg.wait_for_timeout(700);await pg.keyboard.up('ArrowRight');await pg.screenshot(path=f'/tmp/b_o_{oid}.png',clip={'x':700,'y':0,'width':300,'height':160})
      print(name,'box',stt,'unopened',u,'packsave',ps,'cup',w,errs)
    await b.close()
asyncio.run(main())
