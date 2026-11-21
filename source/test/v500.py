import asyncio
from playwright.async_api import async_playwright
async def run(b, vw, tag, full):
  pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=vw[0]<900);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
  await E("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
  await pg.click('#btnStart');await pg.wait_for_timeout(1200);await E("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
  cnt=await E("()=>[window.__DLX.V50, window.__DLX.XMK_N]")
  # truck
  await E("()=>window.__DL.UI.open('truck')");await pg.wait_for_timeout(800)
  await E("()=>document.querySelector('[data-a=truckGet]').click()");await pg.wait_for_timeout(5500);await E("()=>{const o=document.getElementById('carFx');o&&o.click()}");await pg.wait_for_timeout(1500);await E("()=>{const n=document.querySelector('#acqFx .aq-next');n&&n.click()}");await pg.wait_for_timeout(900);print('fx',await E("()=>[window.__DLX.CARFX.busy, window.__DLX.CINE.lock, document.getElementById('carFx').className]"))
  await E("()=>{const X=window.__DLX;X.grant(X.ITEM_BY_ID.trl_soda);window.__DL.UI.a_setTrailer('soda')}");await pg.wait_for_timeout(1200);await pg.screenshot(path=f'/tmp/t_{tag}_truck.png')
  await E("()=>document.querySelector('[data-a=truckGo]').click()");await pg.wait_for_function("window.__DL.game.active",timeout=90000);await pg.wait_for_timeout(3500)
  await pg.screenshot(path=f'/tmp/t_{tag}_race.png')
  if full:
    await E("()=>{window.__DL.game.camMode=0}");
    for i,(k) in enumerate(['Space']): pass
  await E("()=>{const g=window.__DL.game;g.started=true;g.laps=[{t:240,s:[]}];g._wallHits=2;g.finish('goal')}");await pg.wait_for_selector('#overlay .res-modal',timeout=15000);await pg.wait_for_timeout(800)
  note=await E("()=>[...document.querySelectorAll('.dv-res')].map(e=>e.textContent).join('|')")
  await E("()=>window.__DL.UI.a_resNext()");await pg.wait_for_timeout(800)
  # market pack contents
  pk=await E("()=>{const X=window.__DLX,c=X.CHESTS.find(x=>x.id==='xmkpack');let n=0;for(const r of ['U','R','E','L'])n+=X.packPool(c,r).length;const t=X.CHESTS.find(x=>x.id==='trailerpack');let m=0;for(const r of ['C','U','R','E','L'])m+=X.packPool(t,r).length;return [n,m]}")
  await E("()=>{const D=window.__DL;D.UI.stTab='packs';D.UI._vp.packs=0;D.UI.open('store')}");await pg.wait_for_timeout(1200)
  if full: await pg.screenshot(path=f'/tmp/t_{tag}_store.png')
  print(tag,cnt,note[:120],pk,errs[:4])
  await pg.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    await run(b,(1280,720),'d',True); await run(b,(860,395),'l',False); await run(b,(390,844),'p',False)
    await b.close()
asyncio.run(main())
