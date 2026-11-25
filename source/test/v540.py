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
  # custom car
  await E("()=>document.querySelector('[data-a=cuSub][data-v=car]').click()");await pg.wait_for_timeout(300)
  await pg.set_input_files('input[data-in=cmObj]','/tmp/cu/car.obj');await pg.wait_for_timeout(1500);await pg.fill('#cmNm','PART TEST GT')
  await E("()=>document.querySelector('[data-a=cmSave]').click()");await pg.wait_for_timeout(700)
  car=await E("()=>window.__DL.CARS.find(c=>c.cuCar&&c.name==='PART TEST GT').id")
  await E(f"()=>{{const D=window.__DL,c=D.SAVE.newCar('{car}');D.SAVE.data.cars.push(c);D.SAVE.data.current=c.uid;D.SAVE.save()}}")
  await pg.wait_for_timeout(6000)
  for i in range(4): await E("()=>{const o=document.getElementById('carFx');o&&o.click();const s=document.getElementById('starFx2');s&&s.click();document.querySelectorAll('#acqFx button,#acqFx').forEach(b=>b.click())}");await pg.wait_for_timeout(1200)
  await E("()=>{const U=window.__DL.UI;U.open('devPanel')}");await pg.wait_for_timeout(500);await E("()=>document.querySelector('[data-a=setTab][data-v=creator]').click()");await pg.wait_for_timeout(400)
  # wing part
  await E("()=>document.querySelector('[data-a=cuSub][data-v=part]').click()");await pg.wait_for_timeout(400)
  await pg.select_option('select[data-in=cpSlot]','wing');await pg.set_input_files('input[data-in=cpObj]','/tmp/cu/wing.obj');await pg.wait_for_timeout(1500)
  await pg.fill('#cpNm','ストームウイング');await pg.fill('#cpPr','300000')
  await pg.screenshot(path=f'/tmp/t_{tag}_cped.png')
  pv=await E("()=>{const m=window.__DL.UI.show.model;return [window.__DL.UI.show.sig.includes('cu_prev'), m.meshes.length]}")
  await E("()=>document.querySelector('[data-a=cpSave]').click()");await pg.wait_for_timeout(600)
  # tire part (diamonds)
  await pg.select_option('select[data-in=cpSlot]','tire');await pg.wait_for_timeout(300);await pg.set_input_files('input[data-in=cpObj]','/tmp/cu/tire.obj');await pg.wait_for_timeout(1500)
  roles=await E("()=>window.__DL.UI.cpF.geo.groups.map(g=>g.n+'='+g.role).join(',')")
  await pg.fill('#cpNm','メッシュタイヤ');await pg.select_option('#cpCur','dia');await pg.fill('#cpPr','20');await pg.wait_for_timeout(800)
  await pg.screenshot(path=f'/tmp/t_{tag}_cptire.png')
  await E("()=>document.querySelector('[data-a=cpSave]').click()");await pg.wait_for_timeout(600)
  # front bumper for all cars, pack only
  await pg.select_option('select[data-in=cpSlot]','front');await pg.set_input_files('input[data-in=cpObj]','/tmp/cu/wing.obj');await pg.wait_for_timeout(1200)
  await pg.select_option('select[data-in=cpFit]','all');await pg.wait_for_timeout(300);await pg.fill('#cpNm','全車バンパー');await E("()=>{document.getElementById('cpShop').checked=false}")
  await E("()=>document.querySelector('[data-a=cpSave]').click()");await pg.wait_for_timeout(600)
  parts=await E("()=>Object.values(window.__DLX.CP_BY).map(p=>p.slot+':'+p.fit+':'+(p.shop.on?p.shop.cur+p.shop.price:'no')).join(',')")
  pick=await E("()=>{document.querySelector('[data-a=cuSub][data-v=pack]').click();return 0}");await pg.wait_for_timeout(400)
  pick=await E("()=>[...document.querySelectorAll('[data-cuitem]')].map(x=>x.dataset.cuitem).filter(x=>window.__DLX.CP_BY[x]).length")
  # customize menu on custom car
  await E("()=>{const U=window.__DL.UI;U.tcat=null;U.open('tuning',{uid:window.__DL.SAVE.data.current,tab:'aero'})}");await pg.wait_for_timeout(800)
  cats=await E("()=>[[...document.querySelectorAll('[data-a=tCat]')].map(e=>e.dataset.v).join(','),!!document.querySelector('.cp-lock')]")
  await pg.screenshot(path=f'/tmp/t_{tag}_cpcats.png')
  print('CATS',cats,await E("()=>{const U=window.__DL.UI,i=U.tuneInst();return [i.id,!!window.__DL.CAR_BY_ID[i.id].cuCar,U.tmode,window.__DL.SAVE.data.current,i.uid,Object.keys(window.__DLX.CP_BY).length]}"),flush=True)
  m0=await E("()=>window.__DL.UI.show.model.meshes.length")
  await E("()=>document.querySelector('[data-a=tCat][data-v=cpt]').click()");await pg.wait_for_timeout(500)
  await E("()=>{const D=window.__DL;D.SAVE.data.money=5000000;D.SAVE.data.diamonds=50}")
  wid=await E("()=>Object.values(window.__DLX.CP_BY).find(p=>p.slot==='wing').id");tid=await E("()=>Object.values(window.__DLX.CP_BY).find(p=>p.slot==='tire').id")
  await E(f"()=>document.querySelector('[data-a=cpBuy][data-v={wid}]').click()");await pg.wait_for_timeout(700)
  await E(f"()=>document.querySelector('[data-a=cpBuy][data-v={tid}]').click()");await pg.wait_for_timeout(900)
  st=await E("()=>{const D=window.__DL,c=D.SAVE.cur(),m=D.UI.show.model;return [D.SAVE.data.money,D.SAVE.data.diamonds,JSON.stringify(c.look.cuParts),m.meshes.length,m.wheels[0].spin.parts.length]}")
  await pg.screenshot(path=f'/tmp/t_{tag}_cpbuy.png')
  # guard normal parts
  await E("()=>window.__DL.UI.a_lookOpt('wing:2')");g=await E("()=>window.__DL.SAVE.cur().look.wing||0")
  # normal car with 'all' part
  fid=await E("()=>Object.values(window.__DLX.CP_BY).find(p=>p.slot==='front').id")
  await E(f"()=>{{const D=window.__DL,c=D.SAVE.data.cars.find(c=>!D.CAR_BY_ID[c.id].cuCar);D.SAVE.data.current=c.uid;D.SAVE.data.inv['{fid}']=1;c.look.front=3;D.UI.open('tuning',{{uid:c.uid,tab:'aero'}});D.UI.tcat='cpt';D.UI.render()}}")
  await pg.wait_for_timeout(700)
  nc=await E(f"()=>[!!document.querySelector('[data-a=cpEquip][data-v={fid}]'),!document.querySelector('[data-a=cpBuy][data-v={fid}]')]")
  await E(f"()=>document.querySelector('[data-a=cpEquip][data-v={fid}]').click()");await pg.wait_for_timeout(800)
  await pg.screenshot(path=f'/tmp/t_{tag}_cpnormal.png')
  nn=await E("()=>JSON.stringify(window.__DL.SAVE.cur().look.cuParts)")
  # drive custom car with parts
  await E("()=>{const D=window.__DL;D.SAVE.data.current=D.SAVE.data.cars.find(c=>D.CAR_BY_ID[c.id].cuCar).uid;delete window.DL_FB}")
  await E("()=>window.__DL.UI.launch({mode:'free',mapId:'harbor',weather:'clear',time:'day',laps:1,carInst:window.__DL.SAVE.cur(),rivals:[]})")
  await pg.wait_for_function("window.__DL.game.active",timeout=60000);await pg.wait_for_timeout(2500);await pg.screenshot(path=f'/tmp/t_{tag}_cpdrive.png')
  print(tag,'pv',pv,'roles',roles,'parts',parts,'pick',pick,'cats',cats,'m0',m0,'st',st,'guard',g,'nc',nc,nn,errs[:4])
  await pg.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    import sys
    vs=[((1280,720),'d'),((860,395),'l'),((390,844),'p')]
    for v in vs[:int(sys.argv[1]) if len(sys.argv)>1 else 3]: await run(b,*v)
    await b.close()
asyncio.run(main())
