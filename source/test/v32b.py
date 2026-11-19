from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={'width':1000,'height':600}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); E=pg.evaluate
    E("window.__DL.SAVE.data.tutDone=true"); pg.click('#btnStart'); pg.wait_for_timeout(1200); E("window.__DL.UI.closeModal()"); pg.wait_for_timeout(300); pg.screenshot(path='test/v32_menu.png')
    E("window.__DL.UI.open('maps',{mode:'time'})"); pg.wait_for_timeout(300); pg.click('[data-a=mapCat][data-v=touge]'); pg.wait_for_timeout(1200)
    print('touge maps first', E("[...document.querySelectorAll('[data-a=selMap]')].slice(0,3).map(e=>e.dataset.v)"))
    pg.screenshot(path='test/v32_maps.png')
    pg.click('[data-a=mapSort][data-v=diff]'); print('diff sort', E("[...document.querySelectorAll('[data-a=selMap]')].slice(0,2).map(e=>e.dataset.v)"))
    # kei truck in shop
    print('kt buyable', E("(()=>{const c=window.__DL.CAR_BY_ID.hk_kt;return [c.price, !c.unlock]})()"), 'ft item', E("!!window.__DL.ITEMS.find(i=>i.id==='car_hk_kt_ft')"))
    # ticket
    E("(()=>{const D=window.__DL;D.SAVE.data.tickets={tk_full:1};D.UI.open('garage');})()"); pg.wait_for_timeout(300)
    print('ticket bar', E("!!document.querySelector('.tk-bar')")); pg.click('[data-a=useTicket]'); pg.wait_for_timeout(200); pg.click('[data-a=useTicketGo]'); pg.wait_for_timeout(300)
    print('fulltuned', E("(()=>{const t=window.__DL.SAVE.cur().tune;return [t.ecu,t.susp,t.weight,t.engine,t.diff,window.__DL.SAVE.data.tickets.tk_full]})()"))
    # car select
    E("window.__DL.UI.open('carsel',{mode:'time',mapId:'kaminari',weather:'clear',time:'evening',laps:1})"); pg.wait_for_timeout(800); pg.screenshot(path='test/v32_carsel.png')
    # story talk
    E("(()=>{const D=window.__DL; const ch=1; D.UI.launch({mode:'story',story:1,mapId:'akigiri',weather:'clear',time:'night',laps:1,carInst:D.SAVE.cur(),rivals:[{name:'黒沢 ジン',team:'AKIGIRI SPEEDSTARS',car:'hk_s1',color:'#b0b8c0',skill:0.7}]});})()")
    pg.wait_for_timeout(5000); E("(()=>{const g=window.__DL.game;g.countdown=0;g.started=true;})()"); pg.wait_for_timeout(11500); print('state', E("(()=>{const g=window.__DL.game;return [g.active,g.started,Math.round(g.raceT),g.cfg.mode,g.cfg.story,!!g._talk, JSON.stringify(g._talk)]})()")); print('talk shown', E("(document.getElementById('rvTalk')||{}).className"), E("(document.querySelector('#rvTalk p')||{}).textContent"))
    pg.screenshot(path='test/v32_talk.png')
    import sys; pg.screenshot(path='test/v32_talk.png'); print(errs[:3]); sys.exit()
    # kei truck + ft render
    for car in ['hk_kt','hk_kt_ft']:
        E("window.__DL.game.exit(); window.__DL.UI.goMenu()")
        E(f"(()=>{{const D=window.__DL; D.UI.launch({{mode:'free',mapId:'kaminari',weather:'clear',time:'day',laps:1,carInst:Object.assign(D.SAVE.newCar('{car}'),{{uid:'test'}}),rivals:[],startProg:80}});}})()"); pg.wait_for_timeout(2800)
        E("(()=>{const g=window.__DL.game;g.camMode=5;g.finished=true;g._finA=0.8;})()"); pg.wait_for_timeout(600); pg.screenshot(path=f'test/v32_{car}.png')
    print(errs[:5]); b.close()
