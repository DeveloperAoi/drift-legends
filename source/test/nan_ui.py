from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={'width':900,'height':500}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text[:200]) if m.type=='error' and 'ERR_TUNNEL' not in m.text else None)
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500); pg.click('#btnStart'); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pg.evaluate("const c=window.__DL.SAVE.cur(); c.tune.ecu=undefined; c.tune.camber=NaN; window.__DL.SAVE.data.settings.steerSens=undefined;")
    pg.evaluate("window.__DL.UI.launch({mode:'touge', mapId:'akigiri', weather:'rain', time:'night', laps:1, carInst:window.__DL.SAVE.cur(), rivals:[]})")
    pg.wait_for_timeout(6000); pg.keyboard.down('KeyW'); pg.wait_for_timeout(6000)
    print('active', pg.evaluate("window.__DL.game.active"), 'audio', pg.evaluate("window.__DL.AUDIO.ok"), 'engine', pg.evaluate("!!window.__DL.game.engine"), 'rpm', pg.evaluate("window.__DL.game.veh.rpm"), 'errlog', pg.evaluate("JSON.stringify((window.__DL.SAVE.data.errLog||[]).map(e=>e.m))"))
    print('ERR', errs[:5]); b.close()
