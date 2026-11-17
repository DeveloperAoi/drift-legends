from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    ctx=b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True, device_scale_factor=2)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(600)
    pg.tap('#btnStart'); pg.wait_for_timeout(400); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pg.evaluate("window.__DL.UI.launch({mode:'free', mapId:'circuit', weather:'clear', time:'day', laps:1, carInst:window.__DL.SAVE.cur(), rivals:[]})")
    pg.wait_for_function("window.__DL.game.active", timeout=60000); pg.wait_for_timeout(1500)
    box=pg.locator('#tGas').bounding_box(); print('gas box', box)
    x,y=box['x']+box['width']/2, box['y']+box['height']/2
    print('element at point:', pg.evaluate(f"(()=>{{const e=document.elementFromPoint({x},{y}); return e? (e.id||e.className||e.tagName):null}})()"))
    cdp=ctx.new_cdp_session(pg)
    cdp.send('Input.dispatchTouchEvent', {'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':1}]})
    pg.wait_for_timeout(1500)
    print('touch.gas', pg.evaluate("window.__DL.Input.touch.gas"), 'class', pg.evaluate("document.getElementById('tGas').className"), 'speed', pg.evaluate("window.__DL.game.veh.speed*3.6"))
    cdp.send('Input.dispatchTouchEvent', {'type':'touchEnd','touchPoints':[]})
    pg.wait_for_timeout(300); print('after release', pg.evaluate("window.__DL.Input.touch.gas"))
    print('ERR', errs); b.close()
