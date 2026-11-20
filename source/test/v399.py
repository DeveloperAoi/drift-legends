import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,name,touch in [((1280,720),'d',False),((860,395),'l',True),((390,844),'p',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true;D.SAVE.data.money=9e9;D.SAVE.data.diamonds=1000;D.SAVE.data.settings.xmasTheme=false}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      hidden=await pg.evaluate("()=>{const U=window.__DL.UI;U.stTab='packs';U.open('store');const a=document.querySelectorAll('[data-v=newyearpack]').length;U.open('charm');const t=!!document.querySelector('[data-v=ny]');return [a,t]}")
      await pg.evaluate("()=>{const X=window.__DLX;X.NEWYEAR.public=true;X.applyNY()}")
      shown=await pg.evaluate("()=>{const U=window.__DL.UI;U.stTab='packs';U.open('store');const a=document.querySelectorAll('[data-v=newyearpack]').length;U.open('charm');const t=!!document.querySelector('[data-v=ny]');return [a,t]}")
      await pg.evaluate("()=>{const UI=window.__DL.UI;UI.stTab='packs';UI.open('store');UI.a_vpGo('packs:=0')}");await pg.wait_for_timeout(900);await pg.screenshot(path=f'/tmp/y_lim_{name}.png')
      await pg.evaluate("()=>{const UI=window.__DL.UI;UI.stTab='cons';UI.render()}");await pg.wait_for_timeout(500);await pg.screenshot(path=f'/tmp/y_cons_{name}.png')
      await pg.evaluate("()=>{const D=window.__DL,X=window.__DLX;for(const t of ['rimglow','pet','nypart'])for(const it of Object.values(X.ITEM_BY_ID).filter(i=>i.type===t))X.grant(it);const U=D.UI;U.open('charm');U.a_cmTab('rim');U.a_setRimX('neon');U.a_cmTab('ny');U.a_setNy('roof:kadomatsu');U.a_setNy('front:shimenawa');U.a_setNy('antenna:hagoita');U.a_cmTab('pet');U.a_setPet('shiba')}");await pg.wait_for_timeout(400);await pg.screenshot(path=f'/tmp/y_pet_{name}.png')
      if name=='d':
        r=await pg.evaluate("""()=>{const X=window.__DLX;return ['rimpack','petpack','newyearpack','smokepack','gold'].map(id=>{const c=X.CHESTS.find(x=>x.id===id);return id+':'+['C','U','R','E','L'].map(r=>X.packPool(c,r).filter(i=>['rimglow','pet','nypart'].includes(i.type)).length).join('/')})}""");print(r)
        await pg.evaluate("()=>{const U=window.__DL.UI;U.goMenu();document.getElementById('menuList').style.visibility='hidden';U.show.rot=0.9;U.show.dist=7.5;U.show.idle=0}");await pg.wait_for_timeout(1500);await pg.screenshot(path='/tmp/y_garage1.png')
        await pg.evaluate("()=>{const U=window.__DL.UI;U.show.rot=2.6;U.show.idle=0}");await pg.wait_for_timeout(1200);await pg.screenshot(path='/tmp/y_garage2.png')
        for pid in ['dragon','penguin','unicorn','robot']:
          await pg.evaluate(f"()=>{{const D=window.__DL;D.SAVE.data.pet='{pid}';D.UI.show.rot=0.6;D.UI.show.dist=6;D.UI.show.idle=0}}");await pg.wait_for_timeout(900);await pg.screenshot(path=f'/tmp/y_p_{pid}.png')
        await pg.evaluate("()=>{const D=window.__DL;D.UI.a_ctrlTest()}");await pg.wait_for_timeout(4000)
        petInRace=await pg.evaluate("()=>window.__DL.UI.game.active")
        await pg.evaluate("()=>{const g=window.__DL.UI.game;g.camMode=0}");await pg.screenshot(path='/tmp/y_race.png')
      print(name,'hidden',hidden,'shown',shown,errs)
    await b.close()
asyncio.run(main())
