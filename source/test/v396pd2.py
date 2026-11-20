import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,dpr,touch in [((1280,720),1,False),((1174,800),2,False),((1440,900),2,False),((1920,1080),1,False),((1024,700),2,False),((860,395),2,True),((390,844),3,True)]:
      ctx=await b.new_context(viewport={'width':vw[0],'height':vw[1]},device_scale_factor=dpr,has_touch=touch);pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      ids=await pg.evaluate("()=>window.__DLX.CHESTS.filter(c=>c.id!=='giftbox').map(c=>c.id)")
      bad={}
      for pid in ids:
        await pg.evaluate("()=>{const UI=window.__DL.UI;UI.stTab='packs';UI.open('store')}");await pg.wait_for_timeout(150)
        await pg.evaluate(f"()=>window.__DL.UI.a_psOpen('{pid}')");await pg.wait_for_timeout(350)
        r=await pg.evaluate("""()=>{const sc=document.querySelector('.pr-scroll');if(!sc)return 'noscroll';const els=[...sc.querySelectorAll('.pr-tag,.fc,.pr-more')].map(e=>e.getBoundingClientRect());let n=0;for(let i=1;i<els.length;i++)if(els[i].left<els[i-1].right-1)n++;const g=[...sc.querySelectorAll('.pr-grp')].filter(x=>x.scrollWidth>x.clientWidth+2).length;return n+g}""")
        if r: bad[pid]=r
        await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      if vw[0]==1174:
        await pg.evaluate("()=>{const UI=window.__DL.UI;UI.stTab='packs';UI.open('store')}");await pg.wait_for_timeout(200)
        await pg.evaluate("()=>window.__DL.UI.a_psOpen('goalpack')");await pg.wait_for_timeout(600);await pg.evaluate("()=>{document.querySelector('.pr-scroll').scrollLeft=420}");await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/pd2.png')
      print(vw,dpr,len(ids),'packs, problems:',bad,errs)
      await ctx.close()
    await b.close()
asyncio.run(main())
