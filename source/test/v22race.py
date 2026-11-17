from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={'width':960,'height':540}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(2000)
    E=pg.evaluate
    E("document.getElementById('btnStart').click()"); pg.wait_for_timeout(300); E("window.__DL.UI.closeModal()")
    E("(()=>{const D=window.__DL; const c=D.SAVE.newCar('hb_fd'); c.look.hlCol='purple'; D.SAVE.data.cars.push(c); D.SAVE.data.boosts={coin:{mult:2,end:Date.now()+900000}}; window._c=c;})()")
    E("window.__DL.UI.launch({mode:'free',mapId:'jumppark',weather:'clear',time:'night',laps:1,carInst:window._c,rivals:[]})")
    pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000)
    E("window.__DL.Input && (window.__DL.Input.keys = window.__DL.Input.keys||{})")
    pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(5000)
    print('lights', E("window.__DL.game.lightsOn"), 'spot', E("JSON.stringify(window.__DL.R.spot.col)"), 'rpm', E("Math.round(window.__DL.game.veh.rpm||0)"), 'gear', E("window.__DL.game.veh.gear"))
    print('hudBoost', E("document.getElementById('hudBoost').innerText"))
    pg.screenshot(path='test/v22race.png'); pg.keyboard.up('ArrowUp')
    print(errs[:5]); b.close()
