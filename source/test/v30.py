from playwright.sync_api import sync_playwright
import json
def E(pg,js): return pg.evaluate(js)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':900,'height':500}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800)
    E(pg,"window.__DL.SAVE.data.tutDone=true"); pg.click('#btnStart'); pg.wait_for_timeout(600); E(pg,"window.__DL.UI.closeModal()")
    print('nav on menu', E(pg,"document.getElementById('bnav').classList.contains('show')"))
    pg.click('[data-nav=garage]'); pg.wait_for_timeout(400); print('nav garage', E(pg,"window.__DL.UI.screen"), E(pg,"document.querySelector('#bnav .on').dataset.nav"))
    pg.click('[data-nav=profile]'); pg.wait_for_timeout(400); print('nav profile', E(pg,"window.__DL.UI.screen"))
    pg.click('[data-nav=race]'); pg.wait_for_timeout(400); print('nav race', E(pg,"window.__DL.UI.screen+':'+window.__DL.UI.arg.mode"))
    # time attack, real finish via forcing lap complete
    E(pg,"(()=>{const D=window.__DL;D.UI.launch({mode:'time',mapId:'metrox',weather:'clear',time:'night',laps:1,carInst:D.SAVE.cur(),rivals:[]});})()"); pg.wait_for_timeout(2500)
    print('nav hidden in race', not E(pg,"document.getElementById('bnav').classList.contains('show')"))
    m0=E(pg,"window.__DL.SAVE.data.money")
    E(pg,"(()=>{const g=window.__DL.game;g.countdown=0;g.started=true;g.raceT=150;g.laps=[{t:150,s:[50,50,50]}];g.finish('goal');})()"); pg.wait_for_timeout(500)
    print('cam5', E(pg,"window.__DL.game.camMode")); pg.wait_for_timeout(2400)
    txt=E(pg,"document.querySelector('#overlay .modal').innerText")
    print('head', 'TIME ATTACK FINISHED' in txt, 'RETRY' in txt, 'MAIN MENU' in txt, 'CONTINUE' in txt, '自己ベスト' in txt, '走行距離' in txt)
    print('nav hidden on result', not E(pg,"document.getElementById('bnav').classList.contains('show')"))
    m1=E(pg,"window.__DL.SAVE.data.money")
    E(pg,"window.__DL.UI.showResults(window.__DL.UI.lastRes)"); m2=E(pg,"window.__DL.SAVE.data.money")
    print('paid once', m1>m0, m2==m1)
    pg.wait_for_timeout(1500); pg.screenshot(path='test/v30_res.png')
    pg.click('[data-a=resRetry]'); pg.wait_for_timeout(2500)
    print('retry reset', E(pg,"(()=>{const g=window.__DL.game;return [g.active,g.finished,Math.round(g.raceT),g.camMode,g.lap]})()"))
    E(pg,"(()=>{const g=window.__DL.game;g.countdown=0;g.started=true;g.raceT=140;g.laps=[{t:140,s:[45,45,50]}];g.finish('goal');})()"); pg.wait_for_timeout(2700)
    print('PB shown', E(pg,"!!document.querySelector('.res-pb')"))
    pg.click('[data-a=resNext]'); pg.wait_for_timeout(500); print('continue ->', E(pg,"window.__DL.UI.screen+':'+(window.__DL.UI.arg||{}).mode"))
    # cards
    E(pg,"(()=>{const D=window.__DL; for(let k=0;k<3;k++) D.UI.game; })()")
    r=E(pg,"""(()=>{const X=window.__DLX,D=window.__DL; const it=D.ITEMS.find(i=>i.id==='cc_hk_van_10'); 
      const g1=window.__DLX; const res=[]; for(let k=0;k<3;k++){ res.push(JSON.stringify(window.__DLgrant?1:0)); }
      return [X.carCards('hk_van'), !!it];})()"""); print('cards before', r)
    E(pg,"window.__DL.UI.open('chest')"); pg.wait_for_timeout(400)
    print('card ui', E(pg,"!!document.querySelector('.cc-row') && document.querySelector('[data-a=ccTrade]').disabled"))
    E(pg,"window.__DL.SAVE.data.carCards={hk_van:31}; window.__DL.UI.render()"); pg.wait_for_timeout(200)
    nb=E(pg,"window.__DL.SAVE.data.cars.length"); pg.click('[data-a=ccTrade]'); pg.wait_for_timeout(300)
    print('trade', E(pg,"window.__DL.SAVE.data.cars.length")-nb, E(pg,"window.__DL.SAVE.data.carCards.hk_van"))
    pg.click('[data-a=ccPrev]'); pg.wait_for_timeout(800); pg.screenshot(path='test/v30_van.png')
    # pack roll with cards
    print('roll cards', E(pg,"(()=>{let c=0;const ch={price:1,odds:{C:0,U:0,R:40,E:40,L:20}}; for(let k=0;k<2000;k++){ /* rollChest is internal */ } return 'n/a'})()"))
    # dev panel w/o firebase
    E(pg,"(()=>{window.__DL.UI.goMenu();})()"); errs2=len(errs)
    # maintenance simulation
    E(pg,"window.__DLX.ADM.maint={on:true,reason:'テスト',until:Date.now()+3600000}; window.__DLX.ADM.tick()"); pg.wait_for_timeout(300)
    print('maint shown', E(pg,"!!document.getElementById('maintFx')")); pg.screenshot(path='test/v30_maint.png')
    E(pg,"window.__DLX.ADM.maint={on:false}; window.__DLX.ADM.tick()"); print('maint off', not E(pg,"!!document.getElementById('maintFx')"))
    E(pg,"window.__DLX.ADM.update={version:'3.1',title:'テスト',at:Date.now()+90000000}; window.__DLX.ADM.tick()"); print('countdown', E(pg,"(document.getElementById('updCd')||{}).innerText"))
    E(pg,"window.__DLX.ADM.ann={a1:{title:'お知らせテスト',msg:'本文',type:'important',start:Date.now()-1000,end:Date.now()+60000,dev:'Dev'}}; window.__DLX.ADM.check(); window.__DLX.ADM.check()")
    pg.wait_for_timeout(500); print('ann popups', E(pg,"document.querySelectorAll('.ann-pop').length")); pg.screenshot(path='test/v30_ann.png'); E(pg,"document.querySelectorAll('.ann-pop').forEach(e=>e.remove())")
    print(errs[:6]); b.close()
