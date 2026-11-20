from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1100,'height':600}); errs=[]; pg.on('pageerror', lambda e: errs.append('PAGE '+str(e))); E=pg.evaluate
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500)
    E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI._newsShown=true; window.__DL.UI._logChk=true"); pg.click('#btnStart'); pg.wait_for_timeout(1500); E("window.__DL.UI.closeModal(); window.__DL.SAVE.data.money=2e8")
    print('movie open', E("window.__DLX.movieOpen()"), 'pool', E("(()=>{const c=window.__DLX.CHESTS.find(x=>x.id==='moviepack');return ['R','E','L'].map(k=>window.__DLX.packPool(c,k).length)})()"))
    for car,nm in [('mv_chrono','chrono'),('mv_agent','agent')]:
        E(f"(()=>{{const D=window.__DL,S=D.SAVE,c=S.newCar('{car}');S.data.cars.push(c);S.data.curCar=S.data.cars.length-1; D.UI.launch({{mode:'free',mapId:'cinema',weather:'clear',time:'night',laps:1,carInst:c,rivals:[],startProg:60}});}})()"); pg.wait_for_timeout(3500)
        E("(()=>{const g=window.__DL.game;g.countdown=0;g.started=true;g.veh.speed=50;})()")
        E("(()=>{const g=window.__DL.game;for(let i=0;i<60;i++){g.veh.speed=50;g.veh.nitroOn=true;window.__DLX.MVHUD.charge=100;g.update(1/30);window.__DL.UI.drawTacho(g);} })()"); pg.wait_for_timeout(500)
        pg.screenshot(path=f'test/v37_{nm}.png'); print(nm, 'hud', E("document.getElementById('mvHud') && document.getElementById('mvHud').className"), 'meter', E("window.__DL.game.carInst.look.meter"))
        E("window.__DL.game.exit(); window.__DL.UI.goMenu()"); pg.wait_for_timeout(400)
    print('hud hidden', E("document.getElementById('mvHud').style.display"))
    E("window.__DL.UI.open('store'); window.__DL.UI.stTab='packs'; window.__DL.UI.render()"); pg.wait_for_timeout(900); pg.screenshot(path='test/v37_store.png')
    E("window.__DL.UI.a_openChest('moviepack:5')"); pg.wait_for_timeout(1200); pg.screenshot(path='test/v37_pack.png'); E("window.__DLX.PACKFX.summary(true)"); pg.wait_for_timeout(500); pg.screenshot(path='test/v37_sum.png'); E("window.__DLX.PACKFX.close()")
    E("window.__DL.UI.open('evDetail',{id:'cinema2026'})"); pg.wait_for_timeout(600); pg.screenshot(path='test/v37_event.png')
    E("window.__DLX.DEV.owner=true; window.DL_FB=window.DL_FB||{user:{uid:'x'}}; window.__DL.UI.open('devPanel'); window.__DL.UI.tab='movie'; window.__DL.UI.render()"); pg.wait_for_timeout(500); pg.screenshot(path='test/v37_dev.png')
    print(errs[:5]); b.close()
