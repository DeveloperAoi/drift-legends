from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':800,'height':450}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(1500)
    E=pg.evaluate; E("document.getElementById('btnStart').click()"); pg.wait_for_timeout(300); E("window.__DL.UI.closeModal()")
    E("window.__DL.UI.launch({mode:'free',mapId:'driftpark',weather:'clear',time:'day',laps:1,carInst:window.__DL.SAVE.cur(),rivals:[]})")
    pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000)
    E("window.__DL.game.camMode=2; window.__DL.game.smoke.spawn=()=>{}"); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(3000); pg.screenshot(path='test/ck_a.png')
    E("const g=window.__DL.game; const o=g.updateCamera.bind(g); g.updateCamera=dt=>{o(dt); window.__DL.R.cam.near=0.15;}"); pg.wait_for_timeout(400); pg.screenshot(path='test/ck_b.png')
    E("window.__DL.game.camMode=1"); pg.wait_for_timeout(400); pg.screenshot(path='test/ck_c.png')
    print(E("(()=>{const m=window.__DL.game.model; return JSON.stringify([m.needles.tach.rot, m._tachA, m._spdA, Array.from(m.cockpit.world).slice(12), Array.from(m.needles.tach.world).slice(0,4), window.__DL.game.veh.rpm])})()"))
    print(E("JSON.stringify([window.__DL.R.cam.pos, window.__DL.game.veh.y, window.__DL.game.veh.pitch])"))
    print(errs[:4]); b.close()
