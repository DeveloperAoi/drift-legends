from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    ctx=b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True, device_scale_factor=2)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(2500)
    pg.tap('#btnStart'); pg.wait_for_timeout(400); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()"); pg.wait_for_timeout(300)
    pg.screenshot(path='ct_menu0.png')
    # menu scroll by touch
    cdp=ctx.new_cdp_session(pg); T=lambda typ, pts: cdp.send('Input.dispatchTouchEvent', {'type':typ,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in pts]})
    info=pg.evaluate("(()=>{const m=document.getElementById('menuList'); return [m.scrollHeight, m.clientHeight, m.scrollTop]})()"); print('menu', info)
    T('touchStart',[(1,(120,300))]); 
    for k in range(10): T('touchMove',[(1,(120,300-k*20))]); pg.wait_for_timeout(30)
    T('touchEnd',[]); pg.wait_for_timeout(600)
    print('menu after swipe scrollTop', pg.evaluate("document.getElementById('menuList').scrollTop")); pg.screenshot(path='ct_menu1.png')
    # settings screen
    pg.evaluate("window.__DL.UI.open('settings'); window.__DL.UI.a_setTab('control')"); pg.wait_for_timeout(400); pg.screenshot(path='ct_set.png')
    print('preset', pg.evaluate("window.__DL.UI.ctrlPresetMatch()"))
    c=lambda sel: (lambda bb: (bb['x']+bb['width']/2, bb['y']+bb['height']/2))(pg.locator(sel).bounding_box())
    def race():
        pg.evaluate("window.__DL.UI.launch({mode:'free', mapId:'circuit', weather:'clear', time:'day', laps:1, carInst:window.__DL.SAVE.cur(), rivals:[]})")
        pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000); pg.wait_for_timeout(500)
    def quit(): pg.evaluate("window.__DL.game.exit(); window.__DL.UI.goMenu()"); pg.wait_for_timeout(300)
    # toggle preset
    pg.evaluate("window.__DL.UI.a_ctrlPreset('toggle')"); race()
    gx,gy=c('#tGas'); T('touchStart',[(1,(gx,gy))]); T('touchEnd',[]); pg.wait_for_timeout(2500)
    print('toggle on: latch', pg.evaluate("window.__DL.Input.gasLatch"), 'speed', round(pg.evaluate("window.__DL.game.veh.speed*3.6")))
    pg.screenshot(path='ct_toggle.png')
    T('touchStart',[(1,(gx,gy))]); T('touchEnd',[]); pg.wait_for_timeout(300); print('toggle off latch', pg.evaluate("window.__DL.Input.gasLatch"), 'thr', pg.evaluate("window.__DL.Input.read(window.__DL.SAVE.data.settings).throttle"))
    quit()
    # slide/onehand preset
    pg.evaluate("window.__DL.UI.a_ctrlPreset('onehand')"); race()
    px,py=c('#tPad'); T('touchStart',[(2,(px,py))]); 
    for k in range(6): T('touchMove',[(2,(px+k*10,py))]); pg.wait_for_timeout(40)
    pg.wait_for_timeout(400)
    print('slide: padSteer', round(pg.evaluate("window.__DL.Input.padSteer"),2), 'read', pg.evaluate("JSON.stringify(window.__DL.Input.read(window.__DL.SAVE.data.settings))"))
    pg.screenshot(path='ct_slide.png'); T('touchEnd',[]); pg.wait_for_timeout(1500)
    print('auto accel speed', round(pg.evaluate("window.__DL.game.veh.speed*3.6")), 'gas hidden', pg.evaluate("getComputedStyle(document.getElementById('tGas')).display"))
    quit()
    # mirror + scale
    pg.evaluate("window.__DL.UI.a_ctrlPreset('standard'); const s=window.__DL.SAVE.data.settings; s.mirror=true; s.btnScale=1.25; s.btnAlpha=0.6; window.__DL.UI.applyCtrl()"); race()
    gx,gy=c('#tGas'); lx,ly=c('#tLeft'); print('mirror gas x', round(gx), 'left btn x', round(lx), 'label', pg.evaluate("document.getElementById('tLeft').textContent"))
    T('touchStart',[(3,(lx,ly))]); pg.wait_for_timeout(200); print('mirror tLeft ->', pg.evaluate("JSON.stringify(window.__DL.Input.touch)")); T('touchEnd',[])
    pg.screenshot(path='ct_mirror.png'); quit()
    print('preset now', pg.evaluate("window.__DL.UI.ctrlPresetMatch()"))
    print('ERR', errs); b.close()
