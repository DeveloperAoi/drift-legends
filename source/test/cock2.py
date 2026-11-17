from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':800,'height':450}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(1500)
    E=pg.evaluate; E("document.getElementById('btnStart').click()"); pg.wait_for_timeout(300); E("window.__DL.UI.closeModal()")
    E("window.__DL.UI.launch({mode:'free',mapId:'driftpark',weather:'clear',time:'day',laps:1,carInst:window.__DL.SAVE.cur(),rivals:[]})")
    pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000)
    E("window.__DL.game.camMode=2"); pg.wait_for_timeout(600)
    E("window._ck=window.__DL.game.model.cockpit; window.__DL.game.model.cockpit=null"); pg.wait_for_timeout(500); pg.screenshot(path='test/ck_a.png')
    E("window.__DL.game.model.cockpit=window._ck; const sw=window.__DL.game.model.steerWheel; window._swp=sw.parts.slice(); sw.parts.length=0"); pg.wait_for_timeout(500); pg.screenshot(path='test/ck_b.png')
    print(E("JSON.stringify(window.__DL.game.model.dims)"))
    print(errs[:4]); b.close()
