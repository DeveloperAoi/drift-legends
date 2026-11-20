import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,name,touch in [((1280,720),'d',False),((860,395),'l',True),((390,844),'p',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      bad={}
      for pid in ['platepack','gdecopack','gold','enginepack','moviepack','charmpack']:
        await pg.evaluate("()=>{const UI=window.__DL.UI;UI.stTab='packs';UI.open('store')}");await pg.wait_for_timeout(300)
        await pg.evaluate(f"()=>window.__DL.UI.a_psOpen('{pid}')");await pg.wait_for_timeout(700)
        ov=await pg.evaluate("""()=>{const els=[...document.querySelectorAll('.pr-scroll .pr-tag, .pr-scroll .fc, .pr-scroll .pr-more')].map(e=>e.getBoundingClientRect());let n=0;for(let i=1;i<els.length;i++){if(els[i].left < els[i-1].right-1)n++}return n}""")
        bad[pid]=ov
        if pid in ['platepack','gdecopack']: await pg.screenshot(path=f'/tmp/pd_{pid}_{name}.png')
        await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      print(name,'overlaps',bad,errs)
    await b.close()
asyncio.run(main())
