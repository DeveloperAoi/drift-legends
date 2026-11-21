import asyncio
from playwright.async_api import async_playwright
SETUP="""()=>{const X=window.__DLX;X.DEV.owner=true;window.__W=[];window.DL_FB=window.DL_FB||{};DL_FB.user=DL_FB.user||{uid:'t'};
 X.ADM.write=async(p,v)=>{window.__W.push(p);const D=JSON.parse(JSON.stringify(X.CU.data||{}));const k=p.replace('admin/custom/','').split('/');let o=D;for(let i=0;i<k.length-1;i++)o=o[k[i]]=o[k[i]]||{};if(v===null)delete o[k[k.length-1]];else o[k[k.length-1]]=v;X.CU.apply(D);};X.ADM.log=async()=>{};}"""
async def run(b, vw, tag, full):
  pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=vw[0]<900);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
  await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
  await E("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
  await pg.click('#btnStart');await pg.wait_for_timeout(1200);await E("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
  # ---- star up prompt
  cid=await E("()=>{const D=window.__DL,id=D.SAVE.cur().id;D.SAVE.data.starCards=D.SAVE.data.starCards||{};D.SAVE.data.carStars=D.SAVE.data.carStars||{};D.SAVE.data.carStars[id]=1;D.SAVE.data.starCards[id]=5;D.SAVE.data.money=50000000;D.UI.open('garage');return id}")
  await pg.wait_for_timeout(3500); su1=await E("()=>!!document.querySelector('#suFx.show')")
  await pg.wait_for_timeout(1200)
  if full: await pg.screenshot(path=f'/tmp/t_{tag}_su.png')
  await E("()=>document.querySelector('[data-su=now]').click()");await pg.wait_for_timeout(1500)
  sx=await E("()=>!!document.querySelector('#starFx2.show')");await pg.wait_for_timeout(4500);await E("()=>{const o=document.getElementById('starFx2');o&&o.click();o&&o.click()}");await pg.wait_for_timeout(1200)
  st=await E(f"()=>window.__DL.SAVE.data.carStars['{cid}']")
  await E(f"()=>{{window.__DL.SAVE.data.starCards['{cid}']=10}}");await pg.wait_for_timeout(3500)
  su2=await E("()=>!!document.querySelector('#suFx.show')");await E("()=>document.querySelector('[data-su=later]').click()");await pg.wait_for_timeout(3500)
  su3=[await E("()=>!!document.querySelector('#suFx.show')"),await E(f"()=>window.__DL.SAVE.data.carStars['{cid}']")]
  # ---- creator: decal via editor
  await E(SETUP);await E("()=>window.__DL.UI.open('devPanel')");await pg.wait_for_timeout(500);await E("()=>document.querySelector('[data-a=setTab][data-v=creator]').click()");await pg.wait_for_timeout(500)
  await pg.select_option('#cuT','decal');await pg.wait_for_timeout(300);await pg.fill('#cuNm','テストデカール')
  await E("()=>document.querySelector('[data-a=cuDraw]').click()");await pg.wait_for_timeout(500)
  bb=await (await pg.query_selector('#imgEd .ie-ov')).bounding_box()
  await pg.mouse.move(bb['x']+bb['width']*0.1,bb['y']+bb['height']*0.5);await pg.mouse.down();await pg.mouse.move(bb['x']+bb['width']*0.9,bb['y']+bb['height']*0.5,steps=8);await pg.mouse.up()
  await E("()=>document.querySelector('#imgEd [data-tool=star]').click()")
  await pg.mouse.move(bb['x']+bb['width']*0.3,bb['y']+bb['height']*0.1);await pg.mouse.down();await pg.mouse.move(bb['x']+bb['width']*0.7,bb['y']+bb['height']*0.9,steps=5);await pg.mouse.up()
  await E("()=>document.querySelector('#imgEd [data-tool=fill]').click()");await E("()=>document.querySelector('#imgEd [data-pal=\"#3ad8ff\"]').click()")
  await pg.mouse.click(bb['x']+5,bb['y']+5)
  if full: await pg.screenshot(path=f'/tmp/t_{tag}_ed.png')
  await E("()=>document.querySelector('#imgEd [data-ie=done]').click()");await pg.wait_for_timeout(500)
  img=await E("()=>(window.__DL.UI.cuF.img||'').length")
  await E("()=>document.querySelector('[data-a=cuPreview]').click()");await pg.wait_for_timeout(1500)
  if full: await pg.screenshot(path=f'/tmp/t_{tag}_decalprev.png')
  await E("()=>document.querySelector('[data-a=cuItemSave]').click()");await pg.wait_for_timeout(400)
  await pg.select_option('#cuT','smoke');await pg.wait_for_timeout(300);await pg.fill('#cuNm','テストスモーク');await E("()=>document.querySelector('[data-a=cuItemSave]').click()");await pg.wait_for_timeout(400)
  items=await E("()=>window.__DLX.ITEMS.filter(i=>i.custom).map(i=>i.type+':'+i.id).join(',')")
  # ---- bundle
  await E("()=>document.querySelector('[data-a=cuSub][data-v=bundle]').click()");await pg.wait_for_timeout(400)
  await pg.fill('#cbNm','テストバンドル');await pg.select_option('#cbCu','dia');await pg.fill('#cbPr','50');await pg.fill('#cbOl','120');await pg.select_option('#cbLm','none')
  await E("()=>document.querySelector('[data-a=cbAdd]').click()");await pg.wait_for_timeout(200);await pg.select_option('select[data-in=cbK][data-i=\"1\"]','item');await pg.wait_for_timeout(200)
  did=await E("()=>window.__DLX.ITEMS.find(i=>i.custom&&i.type==='decal').id");await pg.fill('#cbA1',did)
  await E("()=>document.querySelector('[data-a=cbAdd]').click()");await pg.wait_for_timeout(200);await pg.select_option('select[data-in=cbK][data-i=\"2\"]','star');await pg.wait_for_timeout(200);await pg.fill('#cbN2','3')
  await E("()=>document.querySelector('[data-a=cbSave]').click()");await pg.wait_for_timeout(400)
  if full: await pg.screenshot(path=f'/tmp/t_{tag}_bundle.png')
  # ---- car maker
  await E("()=>document.querySelector('[data-a=cuSub][data-v=car]').click()");await pg.wait_for_timeout(400)
  await pg.set_input_files('input[data-in=cmObj]','/tmp/cu/car.obj');await pg.wait_for_timeout(2000)
  roles=await E("()=>window.__DL.UI.cmF.geo.groups.map(g=>g.n+'='+g.role).join(',')")
  await E("()=>{const r=document.querySelector('input[type=range][data-k=\"wh.tr\"]');r.value=0.36;r.dispatchEvent(new Event('input',{bubbles:true}))}");await pg.wait_for_timeout(800)
  prev=await E("()=>{const s=window.__DL.UI.show;return [!!window.__DL.CAR_BY_ID.cu_car_prev, s.model&&s.model.meshes.length, s.sig.slice(0,20)]}")
  if full: await pg.screenshot(path=f'/tmp/t_{tag}_car.png')
  await pg.fill('#cmNm','TEST OBJ GT');await pg.select_option('#cmSale','1');await pg.fill('#cmPr','3000000')
  await E("()=>document.querySelector('[data-a=cmSave]').click()");await pg.wait_for_timeout(800)
  car=await E("()=>{const c=window.__DL.CARS.find(c=>c.cuCar);return c?[c.id,c.name,c.L,c.W,c.wb.toFixed(2),!c.unlock,(c.cuThumb||'').length]:null}")
  # ---- store offers bundle
  await E("()=>{const D=window.__DL;D.SAVE.data.diamonds=500;D.UI.stTab='offers';D.UI.open('store')}");await pg.wait_for_timeout(1000)
  bid=await E("()=>window.__DLX.BUNDLES_LIVE().find(b=>b.custom).id")
  shown=await E(f"()=>!!document.querySelector('[data-a=stBundle][data-v={bid}]')")
  await E(f"()=>{{window.__DL.UI.a_stBundleGo('{bid}')}}");await pg.wait_for_timeout(1500);await E("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
  await E(f"()=>{{window.__DL.UI.a_stBundleGo('{bid}')}}");await pg.wait_for_timeout(800)
  dia=await E("()=>window.__DL.SAVE.data.diamonds")
  await E(f"()=>{{const D=window.__DL;D.UI.stTab='offers';D.UI._vp.offers=1;D.UI.open('store')}}");await pg.wait_for_timeout(1500)
  if full: await pg.screenshot(path=f'/tmp/t_{tag}_offers.png')
  # ---- drive custom car
  await E(f"()=>{{const D=window.__DL,c=D.SAVE.newCar('{car[0]}');D.SAVE.data.cars.push(c);D.SAVE.data.curCar=c.uid;D.SAVE.data.cur=c.uid}}")
  await E("()=>{delete window.DL_FB}")
  await E(f"()=>window.__DL.UI.launch({{mode:'free', mapId:'harbor', weather:'clear', time:'day', laps:1, carInst:window.__DL.SAVE.data.cars.find(c=>c.id==='{car[0]}'), rivals:[]}})")
  await pg.wait_for_function("window.__DL.game.active",timeout=60000);await pg.wait_for_timeout(2500)
  await pg.keyboard.down('ArrowUp');await pg.wait_for_timeout(1500);await pg.keyboard.up('ArrowUp')
  if full: await pg.screenshot(path=f'/tmp/t_{tag}_drive.png')
  spd=await E("()=>{const g=window.__DL.game;return g.veh?Math.round((g.veh.speed||Math.hypot(g.veh.vx||0,g.veh.vz||0))*10)/10:null}")
  print(tag,'su',su1,sx,st,su2,su3,'img',img,'items',items,'roles',roles,'prev',prev,'car',car,'bundle',shown,dia,'spd',spd,errs[:5])
  await pg.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    import sys
    vs=[((1280,720),'d',True),((860,395),'l',True),((390,844),'p',True)]
    for v in vs[:int(sys.argv[1]) if len(sys.argv)>1 else 3]: await run(b,*v)
    await b.close()
asyncio.run(main())
