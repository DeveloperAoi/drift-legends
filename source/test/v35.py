from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1100,'height':620}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); E=pg.evaluate
    E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI._newsShown=true; window.__DL.UI._logChk=true"); pg.click('#btnStart'); pg.wait_for_timeout(1200); E("window.__DL.UI.closeModal()")
    # store
    E("window.__DL.UI.open('store')"); pg.wait_for_timeout(900); pg.screenshot(path='test/v35_store.png')
    E("(()=>{const d=window.__DL.SAVE.data; d.diamonds=2000; d.money=5e7;})()")
    m0=E("window.__DL.SAVE.data.money"); E("window.__DL.UI.a_stDia('200')"); print('dia exch', E("window.__DL.SAVE.data.diamonds"), E("window.__DL.SAVE.data.money")-m0)
    E("window.__DL.UI.a_stBundle('b_cards')"); pg.wait_for_timeout(200); E("window.__DL.UI.a_stBundleGo('b_cards')"); print('bundle', E("JSON.stringify(window.__DL.SAVE.data.carCards)"), 'again blocked', E("(()=>{const m=window.__DL.SAVE.data.money; window.__DL.UI.a_stBundleGo('b_cards'); return m===window.__DL.SAVE.data.money})()"))
    E("window.__DL.UI.a_stBundleGo('b_packs')"); pg.wait_for_timeout(600); print('bundle packs fx', E("document.getElementById('packFx').className"), E("window.__DL.SAVE.data.packLog[0].items.length"))
    pg.screenshot(path='test/v35_packfx.png'); E("(()=>{const P=document.getElementById('packFx'); P.className=''; P.innerHTML='';})()")
    m0=E("window.__DL.SAVE.data.money"); E("window.__DL.UI.a_stBoxGo('gold')"); pg.wait_for_timeout(400); print('box spent', m0-E("window.__DL.SAVE.data.money"), 'E+ in box', E("window.__DL.SAVE.data.packLog[0].items.some(x=>['E','L'].includes((window.__DL.ITEMS.find(i=>i.id===x[0])||{}).rarity))"), E("window.__DL.SAVE.data.packLog[0].items.length"))
    E("(()=>{const P=document.getElementById('packFx'); P.className=''; P.innerHTML='';})()")
    E("window.__DL.UI.stTab='box';window.__DL.UI.render()"); pg.wait_for_timeout(500); pg.screenshot(path='test/v35_box.png')
    E("window.__DL.UI.open('chest')"); pg.wait_for_timeout(500); pg.screenshot(path='test/v35_packs.png')
    # replay
    E("(()=>{const D=window.__DL;D.UI.launch({mode:'time',mapId:'myojin',weather:'clear',time:'night',laps:1,carInst:D.SAVE.cur(),rivals:[]});})()"); pg.wait_for_timeout(3000)
    E("(()=>{const g=window.__DL.game;g.countdown=0;g.started=true;window.__DL.Input.touch.gas=true;})()"); pg.wait_for_timeout(7000)
    E("(()=>{const g=window.__DL.game;g.laps=[{t:g.raceT,s:[1,1,1]}];g.finish('goal');})()"); pg.wait_for_timeout(2600)
    print('replay frames', E("window.__DL.UI.lastReplay && window.__DL.UI.lastReplay._frames.length"), 'btn', E("!!document.querySelector('[data-a=resReplay]')"))
    E("window.__DL.Input.touch.gas=false"); pg.click('[data-a=resReplay]'); pg.wait_for_timeout(3500)
    print('replay active', E("(()=>{const g=window.__DL.game;return [g.active,!!g.cfg.replay,Math.round(g._rpT*10)/10,!!document.getElementById('rpHud')]})()"))
    pg.wait_for_timeout(1500); pg.screenshot(path='test/v35_replay.png')
    E("window.__DL.UI.rpCmd('exit')"); pg.wait_for_timeout(500); print('exit', E("window.__DL.UI.screen"), not E("!!document.getElementById('rpHud')"))
    print(errs[:5]); b.close()
