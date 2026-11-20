import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,name,touch in [((1280,720),'d',False),((860,395),'l',True),((390,844),'p',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true;D.SAVE.data.money=9e9}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      await pg.evaluate("()=>{const D=window.__DL,X=window.__DLX;for(const t of ['smoke','stamp','hudgadget'])for(const it of Object.values(X.ITEM_BY_ID).filter(i=>i.type===t))X.grant(it);const U=D.UI;U.open('charm');U.a_cmTab('hud');for(const id of ['gmeter_n','shift_p','graph'])U.a_togHudG(id);U.a_cmTab('smoke');U.a_setSmokeX('neon')}")
      await pg.wait_for_timeout(300);await pg.screenshot(path=f'/tmp/k_smoke_{name}.png')
      if name=='d':
        r=await pg.evaluate("""()=>{const X=window.__DLX,D=window.__DL;const out={};for(const id of ['smokepack','stamppack','hudpack','bronze','gold'])out[id]=['C','U','R','E','L'].map(r=>X.packPool(X.CHESTS.find(c=>c.id===id),r).filter(i=>['smoke','stamp','hudgadget'].includes(i.type)).length).join('/');
          // pity sim
          D.SAVE.data.pity={};const c=X.CHESTS.find(x=>x.id==='silver');let maxGap=0,gap=0,Ls=0;for(let i=0;i<3000;i++){const it=X.rollChest(c);gap++;if(it&&it.rarity==='L'){Ls++;maxGap=Math.max(maxGap,gap);gap=0}}out.pity=[X.PITY_N(c),maxGap,Ls];return out}""");print(r)
        await pg.evaluate("()=>{const U=window.__DL.UI;U.stTab='packs';U.open('store')}");await pg.wait_for_timeout(300)
        await pg.evaluate("()=>window.__DL.UI.a_psOpen('gold')");await pg.wait_for_timeout(600);await pg.screenshot(path='/tmp/k_pity.png');await pg.evaluate("()=>window.__DL.UI.closeModal()")
        await pg.evaluate("()=>window.__DL.UI.open('colbook')");await pg.wait_for_timeout(500);await pg.screenshot(path='/tmp/k_col.png')
        await pg.evaluate("()=>{const b=document.querySelector('.cb-r.ready');b&&b.click()}");await pg.wait_for_timeout(300)
        await pg.evaluate("()=>window.__DL.UI.a_cbType('paint')");await pg.wait_for_timeout(400);await pg.screenshot(path='/tmp/k_col2.png')
        h=await pg.evaluate("()=>{const U=window.__DL.UI;U.emoCat='stamp';return U.emoPickerHTML('chatIn').length}");print('picker',h)
        r=await pg.evaluate("()=>window.__DL.emoRender?1:0")
      await pg.evaluate("()=>window.__DL.UI.a_ctrlTest()");await pg.wait_for_timeout(4500)
      await pg.keyboard.down('ArrowUp');await pg.wait_for_timeout(2500);await pg.keyboard.down('ArrowLeft');await pg.keyboard.down('Space');await pg.wait_for_timeout(1500)
      await pg.screenshot(path=f'/tmp/k_race_{name}.png');await pg.keyboard.up('ArrowLeft');await pg.keyboard.up('ArrowUp');await pg.keyboard.up('Space')
      smk=await pg.evaluate("()=>{const g=window.__DL.UI.game;return [!!g.smokeEx, g.smoke&&g.smoke.p?g.smoke.p.slice(-3).map(p=>[p.r,p.g,p.b].map(x=>+(+x).toFixed(2))):null]}")
      await pg.evaluate("()=>{const b=document.getElementById('btnRotOk');if(b&&b.offsetParent)b.click()}");await pg.evaluate("()=>window.__DL.UI.pause()");await pg.wait_for_timeout(400);await pg.click('[data-a=photoOn]');await pg.wait_for_timeout(500)
      await pg.evaluate("()=>{const X=window.__DLX;X.PHOTO.yaw=0.8;X.PHOTO.pitch=0.4;X.PHOTO.dist=6}");await pg.click('[data-a=phFilter]');await pg.click('[data-a=phFrame]');await pg.wait_for_timeout(600);await pg.screenshot(path=f'/tmp/k_photo_{name}.png')
      await pg.click('[data-a=photoShot]');await pg.wait_for_timeout(1200);await pg.screenshot(path=f'/tmp/k_shot_{name}.png')
      shot=await pg.evaluate("()=>{const i=document.querySelector('#phPrev img');return i?[i.naturalWidth,i.src.length]:null}")
      await pg.evaluate("()=>{const p=document.getElementById('phPrev');p&&p.remove();window.__DL.UI.a_photoOff()}");await pg.wait_for_timeout(300)
      paused=await pg.evaluate("()=>[!!document.querySelector('#overlay:not(.hidden) .modal'),document.body.classList.contains('photo')]")
      print(name,'smoke',smk,'shot',shot,'after',paused,errs)
    await b.close()
asyncio.run(main())
