import asyncio
from playwright.async_api import async_playwright
SETUP="""()=>{const D=window.__DL,X=window.__DLX,soc0=0;const soc=X.SOC;soc.avail=()=>true;soc.on=true;soc.uid='me';soc.name='ME';soc.friends={u1:'タロウ',u2:'Hana'};soc.reqs={u3:{n:'Ken'}};soc.inv={};soc.clanId='c1';soc.clan={name:'峠クラブ',owner:'u1',open:true,ownerName:'タロウ',members:{u1:{n:'タロウ'},me:{n:'ME'},u4:{n:'Yuki'}}};soc.chat=[{u:'u1',n:'タロウ',m:'こんにちは',t:Date.now()},{u:'me',n:'ME',m:'hi',t:Date.now()}];soc.isOnline=u=>u==='u1';
 const base=X.myCard();const mk=(uid,o)=>({v:Object.assign({},base,{uid,has:true},o),at:Date.now()+1e9});
 X.CARD.cache.u1=mk('u1',{name:'タロウ',lv:42,glv:61,title:'峠の王',bio:'毎晩秋霧峠にいます',prof:{icon:'',frame:'',effect:'',banner:''},lic:{bg:'galaxy',mark:'dragon',fav:'mv_candy',home:'akigiri',style:'ドリフト派',bday:'1月2日',motto:'ドリフトは芸術'},car:{id:'mv_shade'},pet:'shiba',stats:{races:320,wins:120,drifts:5400,cars:28,ach:44}});
 X.CARD.cache.u2=mk('u2',{name:'Hana',lic:{bg:'sakura',style:'グリップ派'},pet:'cat'});X.CARD.cache.u3=mk('u3',{name:'Ken'});X.CARD.cache.u4=mk('u4',{name:'Yuki',has:false});}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for vw,name,touch in [((1280,720),'d',False),((390,844),'p',True)]:
      pg=await b.new_page(viewport={'width':vw[0],'height':vw[1]},has_touch=touch);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
      await pg.click('#btnStart');await pg.wait_for_timeout(1200);await pg.evaluate("()=>{try{window.__DL.UI.closeModal()}catch(e){}}")
      ok=await pg.evaluate("()=>!!window.__DLX.SOC")
      if not ok: print('no SOC export');break
      await pg.evaluate(SETUP)
      await pg.evaluate("()=>{const U=window.__DL.UI;U.tab='list';U.open('friends')}");await pg.wait_for_timeout(500);await pg.screenshot(path=f'/tmp/f_list_{name}.png')
      n=await pg.evaluate("()=>document.querySelectorAll('[data-a=pfView]').length")
      await pg.click('button.btn[data-a=pfView]');await pg.wait_for_timeout(700);await pg.screenshot(path=f'/tmp/f_lic_{name}.png')
      await pg.click('[data-a=pvTab][data-v^=prof]');await pg.wait_for_timeout(700);await pg.screenshot(path=f'/tmp/f_prof_{name}.png')
      await pg.evaluate("()=>window.__DL.UI.closeModal()")
      await pg.evaluate("()=>{const U=window.__DL.UI;U.tab='req';U.render()}");await pg.wait_for_timeout(300);nr=await pg.evaluate("()=>document.querySelectorAll('[data-a=pfView]').length")
      await pg.evaluate("()=>{const U=window.__DL.UI;U.tab=null;U.open('clan')}");await pg.wait_for_timeout(500);await pg.screenshot(path=f'/tmp/f_clan_{name}.png')
      nc=await pg.evaluate("()=>[document.querySelectorAll('.clan-cols [data-a=pfView]').length,document.querySelectorAll('.msg-nm').length]")
      await pg.evaluate("()=>{const b=[...document.querySelectorAll('.clan-cols button.btn[data-a=pfView]')].find(x=>x.dataset.v.startsWith('u4'));b&&b.click()}");await pg.wait_for_timeout(700);await pg.screenshot(path=f'/tmp/f_old_{name}.png')
      card=await pg.evaluate("()=>{const c=window.__DLX.myCard();return [Object.keys(c).join(','),JSON.stringify(c).length]}")
      print(name,'friend btns',n,'req',nr,'clan',nc,'card',card,errs)
    await b.close()
asyncio.run(main())
