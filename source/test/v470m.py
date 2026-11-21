import asyncio
from playwright.async_api import async_playwright
FAKE = """()=>{const store={};const get=p=>p.split('/').filter(Boolean).reduce((o,k)=>o&&o[k],store);const subs=[];const fire=()=>subs.forEach(f=>f());
 const set=(p,v)=>{const ks=p.split('/').filter(Boolean);let o=store;for(let i=0;i<ks.length-1;i++){o[ks[i]]=o[ks[i]]||{};o=o[ks[i]];}if(v===null||v===undefined)delete o[ks[ks.length-1]];else o[ks[ks.length-1]]=JSON.parse(JSON.stringify(v));fire();};let n=0;
 const ref=p=>({key:p.split('/').pop(),orderByChild(){return this},limitToLast(){return this},on(e,cb){const f=()=>cb({val:()=>{const v=get(p);return v?JSON.parse(JSON.stringify(v)):null}});subs.push(f);f();},off(){},
   push(){const k='k'+(++n);return ref(p+'/'+k)},async set(v){set(p,v)},async remove(){set(p,null)},async update(o){for(const k in o)set(p+'/'+k,o[k])},
   async transaction(fn){const cur=get(p);const r=fn(cur===undefined?null:cur);if(r===undefined)return{committed:false};set(p,r);return{committed:true}}});
 const S=window.__DLX.SOC; S.on=true; S.uid='u1'; S.name='Seller'; S.db=()=>({ref}); window.__DLX.MKT.start(); return true}"""
async def run(b, vw, tag):
  pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=vw[0]<900);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
  await E("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
  await pg.click('#btnStart');await pg.wait_for_timeout(1200);await E("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
  await E(FAKE)
  await E("()=>{const D=window.__DL;const c=D.SAVE.newCar('hy_aurex');D.SAVE.data.cars.push(c);D.UI.mkTab='sell';D.UI.open('market')}");await pg.wait_for_timeout(800);await pg.screenshot(path=f'/tmp/m_{tag}_sell.png')
  await E("()=>{const b=[...document.querySelectorAll('[data-a=mktSell]')].pop();b.click()}");await pg.wait_for_timeout(500)
  await E("()=>{document.getElementById('mktP').value='25000000';window.__DL.UI.a_mktSellGo()}");await pg.wait_for_timeout(800)
  a=await E("()=>[window.__DL.SAVE.data.cars.length, Object.keys(window.__DLX.MKT.list).length]")
  await pg.screenshot(path=f'/tmp/m_{tag}_listed.png')
  # buyer
  await E("()=>{const S=window.__DLX.SOC;S.uid='u2';S.name='Buyer';const D=window.__DL;D.SAVE.data.money=30000000;D.UI.mkTab='buy';D.UI.render()}");await pg.wait_for_timeout(500);await pg.screenshot(path=f'/tmp/m_{tag}_buy.png')
  await E("()=>document.querySelector('[data-a=mktView]').click()");await pg.wait_for_timeout(400)
  await E("()=>window.__DL.UI.a_mktBuy()");await pg.wait_for_timeout(800)
  bb=await E("()=>[window.__DL.SAVE.data.money, window.__DL.SAVE.data.cars.filter(c=>c.id==='hy_aurex').length, JSON.stringify(Object.values(window.__DLX.MKT.list).map(x=>x.b))]")
  # seller collects
  await E("()=>{const S=window.__DLX.SOC;S.uid='u1';window.__DL.SAVE.data.money=0;window.__DLX.MKT.collect()}");await pg.wait_for_timeout(800)
  cc=await E("()=>[window.__DL.SAVE.data.money, Object.keys(window.__DLX.MKT.list).length]")
  # cancel flow
  await E("()=>{const D=window.__DL;const c=D.SAVE.newCar('hk_sd3');D.SAVE.data.cars.push(c);window.__DL.UI._mkSell=c.uid;D.UI.modal('<input id=mktP value=500000>');D.UI.a_mktSellGo()}");await pg.wait_for_timeout(600)
  await E("()=>{const id=Object.keys(window.__DLX.MKT.list)[0];window.__DL.UI.a_mktCancel(id)}");await pg.wait_for_timeout(600)
  dd=await E("()=>[window.__DL.SAVE.data.cars.some(c=>c.id==='hk_sd3'), Object.keys(window.__DLX.MKT.list).length]")
  await E("()=>{window.__DL.UI.mkTab='hist';window.__DL.UI.render()}");await pg.wait_for_timeout(400);await pg.screenshot(path=f'/tmp/m_{tag}_hist.png')
  print(tag,'listed',a,'bought',bb,'collect',cc,'cancel',dd,errs[:3])
  await pg.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    await run(b,(1280,720),'d'); await run(b,(390,844),'p')
    await b.close()
asyncio.run(main())
