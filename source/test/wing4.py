from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':800,'height':450}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500); pg.click('#btnStart')
    pg.evaluate("const D=window.__DL; const c=D.SAVE.newCar('hk_zephyr'); c.look.wing=4; D.SAVE.data.cars.push(c); D.SAVE.data.current=c.uid; D.UI.launch({mode:'touge', mapId:'akigiri', weather:'clear', time:'night', laps:1, carInst:c, rivals:[]})")
    pg.wait_for_function("window.__DL.game.active", timeout=60000)
    r=pg.evaluate("""(()=>{const D=window.__DL,g=D.game; g.started=true; g.veh.gear=1; D.Input.read=()=>({throttle:1,brake:0,steer:0,analog:true,steerRate:3}); for(let k=0;k<300;k++) g.update(1/60); return [g.veh.speed*3.6, (D.SAVE.data.errLog||[]).length, g.spec.downR]})()""")
    print('speed after 5s', r); pg.wait_for_timeout(1000); pg.screenshot(path='wing4.png'); print(errs); b.close()
