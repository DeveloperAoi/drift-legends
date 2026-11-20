import asyncio
from playwright.async_api import async_playwright
MOCK="""()=>{const X=window.__DLX,s=X.SOC;s.avail=()=>true;s.on=true;s.uid='me';s.name='ME';s.friends={u1:'タロウ'};s.reqs={};s.inv={};s.isOnline=()=>true;
 s.db=()=>({ref:p=>({push:async v=>{window._pushed=[p,v]},remove:async()=>{window._removed=p},on(){},off(){},get:async()=>({val:()=>null})})});
 X.FGIFT.inbox={g1:{from:'u1',n:'タロウ',k:'pack',id:'gold',c:1,msg:'いつもありがとう',t:Date.now()},g2:{from:'u1',n:'タロウ',k:'cons',id:'ramen',c:1,t:Date.now()-5}};}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,name,touch in [((1280,720),'d',False),((860,395),'l',True),((390,844),'p',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true;D.SAVE.data.settings.xmasTheme=false}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      await pg.evaluate("()=>{const D=window.__DL,X=window.__DLX;for(const t of ['fresh','gfloor','gwall','glight'])for(const it of Object.values(X.ITEM_BY_ID).filter(i=>i.type===t))X.grant(it);const U=D.UI;U.open('charm');U.a_cmTab('gsty');U.a_setGsty('gfloor:checker');U.a_setGsty('gwall:brick');U.a_setGsty('glight:purple');U.a_cmTab('fresh');U.a_setFresh('cherry')}");await pg.wait_for_timeout(400);await pg.screenshot(path=f'/tmp/g_fresh_{name}.png')
      if name=='d':
        await pg.evaluate("()=>{const U=window.__DL.UI;U.goMenu();document.getElementById('menuList').style.visibility='hidden';U.show.rot=0.8;U.show.dist=9;U.show.idle=0}");await pg.wait_for_timeout(1500);await pg.screenshot(path='/tmp/g_garage.png')
        await pg.evaluate("()=>{document.getElementById('menuList').style.visibility='';const U=window.__DL.UI;U.achCat='dash';U.open('ach')}");await pg.wait_for_timeout(400);await pg.screenshot(path='/tmp/g_ach.png')
        na=await pg.evaluate("()=>document.querySelectorAll('.ach, .ach-row, [data-a=achClaim]').length")
      await pg.evaluate(MOCK)
      await pg.evaluate("()=>{const D=window.__DL,u=D.SAVE.data;u.unopened=u.unopened||{boxes:{},packs:{}};u.unopened.packs.silver=2;u.cons=u.cons||{};u.cons.energy=3;const U=D.UI;U.open('friends');U.a_setTab('gifts')}");await pg.wait_for_timeout(400);await pg.screenshot(path=f'/tmp/g_inbox_{name}.png')
      await pg.evaluate("()=>window.__DL.UI.a_fgClaim('g1')");await pg.wait_for_timeout(300)
      cl=await pg.evaluate("()=>[window.__DL.SAVE.data.unopened.packs.gold,window._removed]")
      await pg.evaluate("()=>{const U=window.__DL.UI;U.tab='list';U.render();U.a_fgOpen('u1')}");await pg.wait_for_timeout(400);await pg.screenshot(path=f'/tmp/g_send_{name}.png')
      await pg.evaluate("()=>window.__DL.UI.a_fgSend('pack:silver')");await pg.wait_for_timeout(300)
      sent=await pg.evaluate("()=>[window.__DL.SAVE.data.unopened.packs.silver,window._pushed&&window._pushed[0],window._pushed&&window._pushed[1].id,window.__DL.SAVE.data.stats.giftSent]")
      await pg.evaluate("()=>{window.__DL.UI.closeModal();window.__DL.UI.a_ctrlTest()}");await pg.wait_for_timeout(4500)
      await pg.keyboard.down('ArrowUp');await pg.wait_for_timeout(2000);await pg.keyboard.down('ArrowLeft');await pg.wait_for_timeout(900);await pg.screenshot(path=f'/tmp/g_race_{name}.png');await pg.keyboard.up('ArrowLeft');await pg.keyboard.up('ArrowUp')
      print(name,'claim',cl,'sent',sent,errs)
    await b.close()
asyncio.run(main())
