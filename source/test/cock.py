from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':800,'height':450}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(1500)
    E=pg.evaluate; E("document.getElementById('btnStart').click()"); pg.wait_for_timeout(300); E("window.__DL.UI.closeModal()")
    E("window.__DL.UI.launch({mode:'free',mapId:'driftpark',weather:'clear',time:'day',laps:1,carInst:window.__DL.SAVE.cur(),rivals:[]})")
    pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000)
    pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(2500)
    E("window.__DL.game.camMode=2"); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(900); pg.screenshot(path='test/ck_left.png'); pg.keyboard.up('ArrowLeft')
    pg.keyboard.down('ArrowRight'); pg.wait_for_timeout(900); pg.screenshot(path='test/ck_right.png'); pg.keyboard.up('ArrowRight')
    E("window.__DL.game.camMode=0"); pg.wait_for_timeout(800); pg.screenshot(path='test/ck_out.png')
    E("window.__DL.game.camMode=1"); pg.wait_for_timeout(500); pg.screenshot(path='test/ck_hood.png')
    pg.keyboard.up('ArrowUp'); print(errs[:4]); b.close()
