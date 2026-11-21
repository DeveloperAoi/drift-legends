import asyncio
from playwright.async_api import async_playwright
async def run(b, vw, tag, full):
  pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=vw[0]<900);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
  await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
  await E("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
  await pg.click('#btnStart');await pg.wait_for_timeout(1200);await E("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
  # fake online + capture writes
  await E("""()=>{const X=window.__DLX;X.DEV.owner=true;window.__W=[];window.DL_FB=window.DL_FB||{};DL_FB.user=DL_FB.user||{uid:'t'};
    X.ADM.write=async(p,v)=>{window.__W.push([p,v]);const D=JSON.parse(JSON.stringify(X.CU.data||{}));const k=p.replace('admin/custom/','').split('/');let o=D;for(let i=0;i<k.length-1;i++)o=o[k[i]]=o[k[i]]||{};if(v===null)delete o[k[k.length-1]];else o[k[k.length-1]]=v;X.CU.apply(D);};X.ADM.log=async()=>{};}""")
  await E("()=>{window.__DL.UI.open('devPanel')}");await pg.wait_for_timeout(600);await E("()=>document.querySelector('[data-a=setTab][data-v=creator]').click()");await pg.wait_for_timeout(600)
  # create stamp from image
  await pg.fill('#cuNm','にっこり');await pg.set_input_files('input[data-in=cuImg]','/tmp/cu/smile.png');await pg.wait_for_timeout(800)
  await E("()=>document.querySelector('[data-a=cuItemSave]').click()");await pg.wait_for_timeout(800)
  for t,nm in [('emoji','にこ絵文字'),('steerw','にこハンドル'),('fresh','にこ香り'),('charm','にこ飾り'),('pbanner','夜景'),('title','にこ王'),('paint','にこ色')]:
    await pg.select_option('#cuT',t);await pg.wait_for_timeout(300);await pg.fill('#cuNm',nm)
    if await pg.query_selector('input[data-in=cuImg]'): await pg.set_input_files('input[data-in=cuImg]','/tmp/cu/city.jpg' if t=='pbanner' else '/tmp/cu/smile.png');await pg.wait_for_timeout(700)
    await E("()=>document.querySelector('[data-a=cuItemSave]').click()");await pg.wait_for_timeout(500)
  await E("()=>{const l=document.querySelector('.cu-list');l&&l.scrollIntoView()}");await pg.wait_for_timeout(300)
  if full: await pg.screenshot(path=f'/tmp/t_{tag}_cuitem.png')
  n_items=await E("()=>Object.keys(window.__DLX.CU.data.items||{}).length")
  # section + pack + box
  await E("()=>document.querySelector('[data-a=cuSub][data-v=shop]').click()");await pg.wait_for_timeout(400)
  await pg.fill('#cuSt','にっこりコーナー');await pg.fill('#cuSs','スタッフおすすめ');await pg.fill('#cuSo','15')
  await E("()=>document.querySelector('[data-a=cuSecAdd]').click()");await pg.wait_for_timeout(500)
  sk=await E("()=>'cs_'+Object.keys(window.__DLX.CU.data.sections)[0]")
  await E("()=>document.querySelector('[data-a=cuSub][data-v=pack]').click()");await pg.wait_for_timeout(400)
  await pg.fill('#cuPn','にっこりパック');await pg.fill('#cuTag','SMILE');await pg.select_option('#cuCur','dia');await pg.fill('#cuPrice','30');await pg.select_option('#cuSec',sk)
  await pg.set_input_files('input[data-in=cuCover]','/tmp/cu/city.jpg');await pg.wait_for_timeout(700)
  await E("()=>document.querySelectorAll('[data-cuitem]').forEach(x=>x.checked=true)")
  await E("()=>document.querySelector('[data-a=cuPackSave]').click()");await pg.wait_for_timeout(500)
  await pg.fill('#cuPn','にっこりBOX');await pg.select_option('#cuBox','1');await pg.fill('#cuPrice','5000000')
  await E("()=>document.querySelectorAll('[data-cuitem]').forEach((x,i)=>x.checked=i<3)")
  await E("()=>document.querySelector('[data-a=cuPackSave]').click()");await pg.wait_for_timeout(500)
  await E("()=>{const l=[...document.querySelectorAll('.cu-list')].pop();l&&l.scrollIntoView()}");await pg.wait_for_timeout(300)
  if full: await pg.screenshot(path=f'/tmp/t_{tag}_cupack.png')
  # move gold pack into the new section
  await E("()=>document.querySelector('[data-a=cuSub][data-v=shop]').click()");await pg.wait_for_timeout(400)
  await pg.select_option('select[data-cuplace=gold]',sk);await E("()=>document.querySelector('[data-a=cuPlaceSave]').click()");await pg.wait_for_timeout(500)
  if full: await pg.screenshot(path=f'/tmp/t_{tag}_cushop.png',full_page=True)
  # store
  await E("()=>{const D=window.__DL;D.UI.stTab='packs';D.UI._vp.packs=0;D.UI.open('store')}");await pg.wait_for_timeout(1200)
  st=await E("()=>{const t=[...document.querySelectorAll('.vp-page')].map(p=>p.dataset.t);const pages=[...document.querySelectorAll('.vp-page')];const pg=pages.find(p=>p.textContent.includes('にっこりコーナー'));return [t.slice(0,4).join('/'),pg?pg.textContent.includes('にっこりパック'):null,pg?!!pg.querySelector('[data-v=gold],[data-id=gold]')||pg.textContent.includes('ゴールド')||pg.textContent.includes('GOLD'):null, document.body.innerHTML.includes('にっこりBOX')]}")
  await E("()=>{const D=window.__DL;D.UI._vp.packs=1;D.UI.render()}");await pg.wait_for_timeout(2000)
  st.append(await E("()=>{const p=document.querySelector('.vp-page[data-i=\"1\"]');return p?p.innerText.replace(/\\s+/g,' ').slice(0,300):''}"))
  if full: await pg.screenshot(path=f'/tmp/t_{tag}_store.png')
  print('W',await E("()=>window.__W.map(w=>w[0]).join(' ')"),st,await E("()=>window.__DLX.CHESTS.filter(c=>c.custom).map(c=>c.name)"))
  # pool + buy pack with dia
  pool=await E("()=>{const X=window.__DLX,c=X.CHESTS.find(x=>x.name==='にっこりパック');let n=0;for(const r of ['C','U','R','E','L','M'])n+=X.poolLive(c.id,r).length;let leak=0;for(const id of ['gold','legend','style','profpack']){const g=X.CHESTS.find(x=>x.id===id);if(g)for(const r of ['C','U','R','E','L','M'])leak+=X.poolLive(id,r).filter(i=>i.custom).length;}return [n,leak]}")
  # offers box
  await E("()=>{const D=window.__DL;D.SAVE.data.diamonds=999;D.SAVE.data.money=99999999;D.UI.stTab='offers';D.UI.open('store')}");await pg.wait_for_timeout(1000)
  bx=await E("()=>{const X=window.__DLX,c=X.CHESTS.find(x=>x.name==='にっこりBOX');return [!!document.querySelector(`[data-a=stBox][data-v=${c.id}]`),c.id]}")
  if full: await pg.screenshot(path=f'/tmp/t_{tag}_offers.png')
  m0=await E("()=>window.__DL.SAVE.data.money")
  await E(f"()=>window.__DL.UI.a_stBoxBuy('{bx[1]}:save')");await pg.wait_for_timeout(500)
  m1=await E("()=>[window.__DL.SAVE.data.money, window.__DL.SAVE.data.unopened?JSON.stringify(window.__DL.SAVE.data.unopened.boxes||{}).length:0]")
  # icons render
  ic=await E("()=>{const X=window.__DLX;return X.ITEMS.filter(i=>i.custom).map(i=>i.type+':'+(X.icon(i,30)||'').length).join(',')}")
  # persistence: reload uses cache
  await E("()=>window.__DLX.CU.cache(window.__DLX.CU.data)")
  await pg.reload();await pg.wait_for_timeout(2500)
  re=await E("()=>window.__DLX.ITEMS.filter(i=>i.custom).length")
  print(tag,'items',n_items,'store',st,'pool',pool,'box',bx[0],'money',m0,m1,'icons',ic,'reload',re,errs[:4])
  await pg.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    await run(b,(1280,720),'d',True); await run(b,(860,395),'l',True); await run(b,(390,844),'p',True)
    await b.close()
asyncio.run(main())
