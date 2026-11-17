from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={'width':1280,'height':720}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(2500); E=pg.evaluate; U="window.__DL.UI"
    E("document.getElementById('btnStart').click()"); pg.wait_for_timeout(300); E(f"{U}.closeModal()"); E(f"{U}.closeModal()")
    print('items', E("Object.keys(window.__DL.SAVE.data).length"), )
    E("window.__DL.SAVE.data.money=5e9; window.__DL.SAVE.data.diamonds=5000")
    E(f"{U}.open('chest')"); pg.wait_for_timeout(300); pg.screenshot(path='/tmp/v_chest.png')
    E(f"{U}.a_openChest('gold:10')"); pg.wait_for_timeout(2500); pg.screenshot(path='/tmp/v_chest10.png'); E(f"{U}.a_closeChest()")
    for k in range(30): E(f"{U}.a_openChest('legend:10')")
    E(f"{U}.a_closeChest()")
    print('owned items', E("Object.keys(window.__DL.SAVE.data.inv).length"))
    E(f"{U}.open('pshop'); {U}.a_setTab('items')"); pg.wait_for_timeout(300); pg.screenshot(path='/tmp/v_items.png')
    E(f"{U}.a_setTab('music')"); pg.wait_for_timeout(300); pg.screenshot(path='/tmp/v_music.png'); E(f"{U}.a_buyMusic('mu_tb5')")
    E(f"{U}.open('diamond')"); pg.wait_for_timeout(500); pg.screenshot(path='/tmp/v_dia.png')
    E(f"{U}.a_buyDia('car_dm_crystal'); {U}.a_buyDia('pt_dia'); {U}.a_buyDia('kit_gold_wing'); {U}.a_buyDia('ex_goldjet')"); print('dia left', E("window.__DL.SAVE.data.diamonds"))
    E(f"{U}.a_setTab('races')"); pg.wait_for_timeout(500); pg.screenshot(path='/tmp/v_races.png')
    # kit + diamond car
    E("""(()=>{const D=window.__DL,d=D.SAVE.data; const c=d.cars.find(x=>x.id==='dm_crystal'); d.current=c.uid; c.look.paint='diamond'; c.look.color='#f4fbff'; c.look.kit={wing:'kit_gold_wing'}; c.look.wing=6; d.inv.kit_0_0=1; c.look.kit.front='kit_3_1'; d.inv.kit_3_1=1; c.look.front=4; c.look.trunk=2; c.look.extra='goldjet'; D.UI.goMenu();})()""")
    pg.wait_for_timeout(800); E("window.__DL.show.rot=3.14*0.8"); pg.wait_for_timeout(600); pg.screenshot(path='/tmp/v_diacar.png')
    # sleigh
    E("""(()=>{const D=window.__DL,d=D.SAVE.data; const c=D.SAVE.newCar('xm_santa'); d.cars.push(c); d.current=c.uid; D.UI.goMenu();})()"""); pg.wait_for_timeout(900); E("window.__DL.show.rot=0.9; window.__DL.show.dist=9"); pg.wait_for_timeout(700); pg.screenshot(path='/tmp/v_sleigh.png')
    E("window.__DL.SAVE.cur().look.reindeer='off'; window.__DL.show.setCar(window.__DL.SAVE.cur(),true)"); pg.wait_for_timeout(600); pg.screenshot(path='/tmp/v_sleigh2.png')
    E(f"{U}.launch({{mode:'free',mapId:'x_city',weather:'snow',time:'night',laps:1,carInst:window.__DL.SAVE.cur(),rivals:[]}})"); pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000)
    E("window.__DL.SAVE.cur().look.reindeer='on'"); pg.keyboard.down('w'); pg.wait_for_timeout(2500); pg.keyboard.up('w'); pg.screenshot(path='/tmp/v_sleighrace.png'); E("window.__DL.game.exit(); window.__DL.UI.goMenu()")
    E(f"{U}.open('tuning',{{uid:window.__DL.SAVE.data.cars.find(x=>x.id==='dm_crystal').uid}}); {U}.a_tMode('custom'); {U}.a_tCat('kit')"); pg.wait_for_timeout(500); pg.screenshot(path='/tmp/v_kit.png')
    E(f"{U}.goMenu()"); pg.wait_for_timeout(500); pg.screenshot(path='/tmp/v_menu.png')
    print(errs[:6]); b.close()
