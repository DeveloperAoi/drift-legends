import asyncio
from playwright.async_api import async_playwright
SETUP=open('/home/claude/dl/test/v520.py').read().split('SETUP="""')[1].split('"""')[0]
async def run(b, vw, tag):
  pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=vw[0]<900);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
  await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
  await E("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
  await pg.click('#btnStart');await pg.wait_for_timeout(1200);await E("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
  await E(SETUP);await E("()=>window.__DL.UI.open('devPanel')");await pg.wait_for_timeout(500);await E("()=>document.querySelector('[data-a=setTab][data-v=creator]').click()");await pg.wait_for_timeout(400)
  await E("()=>document.querySelector('[data-a=cuSub][data-v=car]').click()");await pg.wait_for_timeout(400)
  await pg.set_input_files('input[data-in=cmObj]','/tmp/cu/uvcar.obj');await pg.wait_for_timeout(1500)
  uv=await E("()=>{const g=window.__DL.UI.cmF.geo;return [!!g.uv, g.uv&&g.uv.length, g.groups.map(x=>x.n+'='+x.role).join(',')]}")
  await pg.set_input_files('input[data-in=cmTex][data-i="0"]','/tmp/cu/checker.png');await pg.wait_for_timeout(2500)
  t0=await E("()=>{const g=window.__DL.UI.cmF.geo.groups[0];const m=window.__DL.UI.show.model;return [g.uvm,(g.tex||'').slice(0,15),m.body.parts?m.body.parts.filter(p=>p.mat&&p.mat.tex).length:'?']}")
  # second part: auto box mapping + tint
  await pg.set_input_files('input[data-in=cmTex][data-i="1"]','/tmp/cu/smile.png');await pg.wait_for_timeout(1500)
  await pg.select_option('select[data-in=cmUvm][data-i="1"]','auto');await pg.wait_for_timeout(800);await pg.select_option('select[data-in=cmTm][data-i="0"]','tint');await pg.wait_for_timeout(1500)
  await E("()=>{const l=document.querySelector('.cm-parts');l&&l.scrollIntoView()}")
  await pg.screenshot(path=f'/tmp/t_{tag}_tex.png')
  t1=await E("()=>{const m=window.__DL.UI.show.model;return m.body.parts.filter(p=>p.mat&&p.mat.tex).map(p=>p.mat.texMode).join(',')}")
  await pg.fill('#cmNm','TEX TEST');await E("()=>document.querySelector('[data-a=cmSave]').click()");await pg.wait_for_timeout(800)
  rt=await E("()=>{const X=window.__DLX,v=Object.values(X.CU.data.cars)[0],g=X.cmDec(v.geo);return [ (v.geo.tx||[]).length, !!g.uv, g.groups.map(x=>(x.tex?1:0)+x.tm+'/'+x.uvm).join(','), Math.round(JSON.stringify(v).length/1024)+'KB']}")
  car=await E("()=>window.__DL.CARS.find(c=>c.cuCar&&c.name==='TEX TEST').id")
  await E(f"()=>{{const D=window.__DL;D.UI.open('garage')}}");await pg.wait_for_timeout(300)
  await E(f"()=>{{const D=window.__DL,c=D.SAVE.newCar('{car}');D.SAVE.data.cars.push(c);D.SAVE.data.curCar=c.uid;D.SAVE.data.cur=c.uid;D.UI.show.sig='';D.UI.show.setCar(c,true)}}");await pg.wait_for_timeout(2000)
  await pg.screenshot(path=f'/tmp/t_{tag}_texcar.png')
  print(tag,'uv',uv,'t0',t0,'t1',t1,'rt',rt,errs[:4])
  await pg.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for v in [((1280,720),'d'),((860,395),'l'),((390,844),'p')]: await run(b,*v)
    await b.close()
asyncio.run(main())
