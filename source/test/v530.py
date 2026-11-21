import asyncio
from playwright.async_api import async_playwright
FAKE="""()=>{const S={wealth:{AbcDEF1234xyzLONGUID001:{m:52000000,d:340,nm:'たろう',cars:7,t:Date.now()-60000},QwErTy0987zzLONGUID0002:{m:1200000,d:12,nm:'Hanako',cars:2,t:Date.now()-7200000,g:1}},admins:{devuid:true},adminMeta:{},stats:{maps:{}}};window.__S=S;
 const get=p=>p.split('/').filter(Boolean).reduce((o,k)=>o==null?undefined:o[k],S);const put=(p,v)=>{const k=p.split('/').filter(Boolean);let o=S;for(let i=0;i<k.length-1;i++)o=o[k[i]]=o[k[i]]||{};if(v===null)delete o[k[k.length-1]];else o[k[k.length-1]]=v;};
 const ref=p=>{const q={_s:null,_e:null,once:async()=>{let v=get(p);if(v&&q._s!=null){v=Object.fromEntries(Object.entries(v).filter(([k])=>k>=q._s&&k<=q._e));}return {val:()=>v==null?null:JSON.parse(JSON.stringify(v))}},set:async v=>{if(v&&v.t&&typeof v.t==='object')v.t=Date.now();put(p,v)},transaction:async f=>put(p,f(get(p))),on:(e,cb)=>cb({val:()=>get(p)}),orderByKey:()=>q,startAt:s=>(q._s=s,q),endAt:e=>(q._e=e,q),limitToFirst:()=>q};return q};
 window.DL_FB=Object.assign(window.DL_FB||{},{user:{uid:'devuid',isAnonymous:true},db:()=>({ref}),ready:async()=>{},countRace:()=>{},onUser:()=>{},weekKey:()=>'w1'});window.firebase=window.firebase||{database:{ServerValue:{TIMESTAMP:{'.sv':'timestamp'}}}};
 const X=window.__DLX;X.ADM.write=async(p,v)=>put(p,v);X.ADM.log=async()=>{};}"""
async def run(b, vw, tag):
  pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=vw[0]<900);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
  await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
  await E("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
  await pg.click('#btnStart');await pg.wait_for_timeout(1200);await E("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
  await E(FAKE)
  # popular courses
  await E("()=>window.__DL.UI.open('maps',{mode:'free'})");await pg.wait_for_timeout(600)
  ids=await E("()=>[...document.querySelectorAll('.mapcard')].map(e=>e.dataset.v)")
  await E("(ids)=>{const c={};ids.forEach((id,i)=>c[id]=[5,120,3400,12,60000,7][i%6]*(i<6?1:0));window.__DLX.POP.set(c)}",ids)
  await pg.wait_for_timeout(800)
  r1=await E("()=>[document.querySelectorAll('.pop-c').length,[...document.querySelectorAll('.map-pop')].map(e=>e.textContent).join('/'),(document.querySelector('.pop-c b')||{}).textContent]")
  await E("()=>document.querySelector('[data-a=mapSort][data-v=pop]').click()");await pg.wait_for_timeout(600)
  r2=await E("()=>[...document.querySelectorAll('.mapcard')].slice(0,3).map(e=>window.__DLX.POP.n(e.dataset.v)).join(',')")
  await E("()=>document.querySelector('.pop-c').click()");await pg.wait_for_timeout(500)
  r3=await E("()=>[...document.querySelectorAll('.kv div')].slice(0,2).map(e=>e.textContent).join(':')")
  await pg.screenshot(path=f'/tmp/t_{tag}_pop.png')
  # extra developer via admins
  await E("()=>{window.__DLX.DEV.owner=false}");await E("()=>window.__DLX.DEV.init()");await pg.wait_for_timeout(800)
  own=await E("()=>[window.__DLX.DEV.owner,window.__DLX.DEVS.extra]")
  # wealth push
  await E("()=>{window.__DL.SAVE.data.money=777000;window.__DLX.WEALTH.push(true)}");await pg.wait_for_timeout(300)
  me=await E("()=>JSON.stringify(window.__S.wealth.devuid)")
  # players tab
  await E("()=>window.__DL.UI.open('devPanel')");await pg.wait_for_timeout(500);await E("()=>document.querySelector('[data-a=setTab][data-v=players]').click()");await pg.wait_for_timeout(400)
  await E("()=>document.querySelector('[data-a=wlLoad]').click()");await pg.wait_for_timeout(600)
  pl=await E("()=>[document.querySelectorAll('.wl-r:not(.wl-hd)').length,(document.querySelector('.wl-r:not(.wl-hd) b')||{}).textContent,(document.querySelector('.wl-sum')||{}).innerText]")
  await E("()=>{const t=document.querySelector('.wl-tbl');t&&t.scrollIntoView()}");await pg.screenshot(path=f'/tmp/t_{tag}_players.png')
  # devs tab: add by prefix
  await E("()=>document.querySelector('[data-a=setTab][data-v=devs]').click()");await pg.wait_for_timeout(400)
  await pg.fill('#dvId','QwErTy0987');await pg.fill('#dvMemo','はなこ');await E("()=>document.querySelector('[data-a=dvAdd]').click()");await pg.wait_for_timeout(800)
  ad=await E("()=>JSON.stringify(window.__S.admins)")
  await pg.screenshot(path=f'/tmp/t_{tag}_devs.png')
  await E("()=>document.querySelector('[data-a=dvDel][data-v=QwErTy0987zzLONGUID0002]').click()");await pg.wait_for_timeout(600)
  ad2=await E("()=>JSON.stringify(window.__S.admins)")
  # profile full id
  await E("()=>window.__DL.UI.open('profile')");await pg.wait_for_timeout(700)
  pid=await E("()=>[(document.querySelector('.ph-id')||{}).textContent,!!document.querySelector('.ph-cp')]")
  # launch counts
  await E("()=>{window.__DL.UI.launch({mode:'free',mapId:'metrox',weather:'clear',time:'day',laps:1,carInst:window.__DL.SAVE.cur(),rivals:[]})}");await pg.wait_for_timeout(1500)
  cnt=await E("()=>JSON.stringify(window.__S.stats.maps)")
  await E("()=>{try{window.__DL.game.exit&&window.__DL.game.exit()}catch(e){}}");await pg.wait_for_timeout(1500)
  print(tag,'pop',r1,r2,r3,'cnt',cnt,'own',own,'me',me,'pl',pl,'ad',ad,ad2,'pid',pid,errs[:4])
  await pg.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for v in [((1280,720),'d'),((860,395),'l'),((390,844),'p')]: await run(b,*v)
    await b.close()
asyncio.run(main())
