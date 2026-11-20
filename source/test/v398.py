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
      await pg.evaluate("()=>{const UI=window.__DL.UI;UI.stTab='mini';UI.open('store')}");await pg.wait_for_timeout(600);await pg.screenshot(path=f'/tmp/n_mini_{name}.png')
      await pg.click('[data-a=rlSpin]');await pg.wait_for_timeout(5000)
      still=await pg.evaluate("()=>[window.__DL.UI.screen,window.__DL.UI.stTab,!!document.querySelector('.rl-wrap')]")
      await pg.evaluate("()=>{const UI=window.__DL.UI;UI.stTab='cons';UI.render()}");await pg.wait_for_timeout(500);await pg.screenshot(path=f'/tmp/n_cons_{name}.png')
      await pg.evaluate("()=>{const U=window.__DL.UI;U._ok=true;U.a_buyCons('mystery:money');U._ok=false}");await pg.wait_for_timeout(300)
      await pg.evaluate("()=>{document.querySelector('[data-a=useCons][data-v=\"mystery\"]').click()}");await pg.wait_for_timeout(600)
      cons=await pg.evaluate("()=>JSON.stringify(window.__DL.SAVE.data.cons)")
      await pg.evaluate("()=>{const D=window.__DL,X=window.__DLX;for(const t of ['licbg','licmark','xpart'])for(const it of Object.values(X.ITEM_BY_ID).filter(i=>i.type===t))X.grant(it);const L=D.SAVE.data.license={};L.bg='galaxy';L.mark='dragon';L.style='ドリフト派';L.motto='峠は今日も攻めます';L.home='akigiri';L.bday='8月6日';D.UI.open('license')}");await pg.wait_for_timeout(600);await pg.screenshot(path=f'/tmp/n_lic_{name}.png')
      if name=='d':
        r=await pg.evaluate("""()=>{const X=window.__DLX;return ['conspack','licensepack','xmaspartspack','gold','bronze'].map(id=>{const c=X.CHESTS.find(x=>x.id===id);return id+':'+['C','U','R','E','L'].map(r=>X.packPool(c,r).filter(i=>['consitem','licbg','licmark','xpart'].includes(i.type)).length).join('/')})}""");print(r)
        await pg.evaluate("()=>window.__DL.UI.a_openChest('conspack:1')");await pg.wait_for_timeout(1500);await pg.click('.pfx-open');await pg.wait_for_timeout(3000);await pg.evaluate("()=>{const s=document.querySelector('[data-pa=skip],.pfx-skip');s&&s.click()}");await pg.wait_for_timeout(1000)
        print('cons after pack',await pg.evaluate("()=>JSON.stringify(window.__DL.SAVE.data.cons)"))
        await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
        await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
        await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
        for combo,shot in [(("star","antlers","nose"),'a'),(("cane","santa_hat","wreath"),'b'),(("snowman","tree","nose"),'c'),(("bell","lights","wreath"),'e')]:
          await pg.evaluate(f"()=>{{const D=window.__DL,X=window.__DLX;for(const it of Object.values(X.ITEM_BY_ID).filter(i=>i.type==='xpart'))X.grant(it);const U=D.UI;U.open('charm');U.a_cmTab('xmas');U.a_setXpart('xAntenna:{combo[0]}');U.a_setXpart('xRoof:{combo[1]}');U.a_setXpart('xFront:{combo[2]}');U.goMenu();document.getElementById('menuList').style.visibility='hidden';U.show.rot=2.4;U.show.dist=6.2;U.show.idle=0}}");await pg.wait_for_timeout(1500);await pg.screenshot(path=f'/tmp/n_xp_{shot}.png')
      print(name,still,cons,errs)
    await b.close()
asyncio.run(main())
