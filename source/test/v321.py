from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1280,'height':680}); errs=[]; pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500); E=pg.evaluate
    E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI._newsShown=true; window.__DL.UI._logChk=true"); pg.click('#btnStart'); pg.wait_for_timeout(1500); E("window.__DL.UI.closeModal(); window.__DL.SAVE.data.money=2e8")
    for mode in ['cut','back']:
        E(f"window.__DL.SAVE.data.packFxMode='{mode}'; window.__DL.UI.a_openChest('gold:1')"); pg.wait_for_timeout(1200); pg.screenshot(path=f'test/v321_{mode}0.png')
        if mode=='cut':
            r=E("(()=>{const r=document.querySelector('.pfx-stage').getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()")
            y=r[1]+r[3]*0.14; pg.mouse.move(r[0]+r[2]*0.08,y); pg.mouse.down(); 
            for k in range(1,12): pg.mouse.move(r[0]+r[2]*(0.08+k*0.08),y)
            pg.mouse.up()
        else: pg.click('.pfx-open')
        for t in [350,600,500]:
            pg.wait_for_timeout(t); pg.screenshot(path=f'test/v321_{mode}_{t}.png')
        pg.wait_for_timeout(1500); print(mode, 'cards', E("document.querySelectorAll('.cardx').length"), E("window.__DLX.PACKFX.i"))
        E("window.__DLX.PACKFX.summary(true); window.__DLX.PACKFX.close()"); pg.wait_for_timeout(300)
    print(errs[:4]); b.close()
