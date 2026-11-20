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
      await pg.evaluate("()=>window.__DL.UI.a_vpGo('packs:=2')");await pg.wait_for_timeout(700);await pg.screenshot(path=f'/tmp/y_veh_{name}.png')
      tops=await pg.evaluate("()=>[...document.querySelectorAll('.vp-page')].map(p=>[...p.querySelectorAll('.ps-card .ps-price')].map(e=>Math.round(e.getBoundingClientRect().bottom - e.closest('.ps-card').getBoundingClientRect().bottom)))")
      print('price offsets',tops)
      await pg.evaluate("()=>window.__DL.UI.a_vpGo('packs:=4')");await pg.wait_for_timeout(700)
      await pg.evaluate("()=>{const t=document.querySelector('[data-a=ccPrev]');t&&t.click()}");await pg.wait_for_timeout(1500);await pg.screenshot(path=f'/tmp/y_pv_{name}.png')
      await pg.evaluate("()=>{const t=document.querySelector('[data-a=ccPvClose]');t&&t.click()}");await pg.wait_for_timeout(500)
      if name=='d':
        r=await pg.evaluate("""()=>{const X=window.__DLX;const e=X.EVENTS.find(x=>x.id==='cinema2026');const o=e.end;X.PERIODS.srv['ev_cinema2026']={start:e.start,end:o+86400000*10};X.applyPeriods();const a=e.end-o;delete X.PERIODS.srv['ev_cinema2026'];X.applyPeriods();return [a/86400000,e.end===o,X.periodTargets().length,X.CHARMS.length]}""");print(r)
      print(name,errs)
    await b.close()
asyncio.run(main())
