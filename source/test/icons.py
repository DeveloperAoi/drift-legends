from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    errs=[]
    for vp,tag in [({'width':1280,'height':720},'d'),({'width':844,'height':390},'m')]:
        pg=b.new_page(viewport=vp, device_scale_factor=2 if tag=='m' else 1)
        pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
        pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(2500)
        E=lambda js: pg.evaluate(js)
        E("document.getElementById('btnStart').click()"); pg.wait_for_timeout(300); E("window.__DL.UI.closeModal()")
        E("window.__DL.SAVE.data.money=2000000000")
        if tag=='d':
            for i in range(120): E("window.__DL.UI.a_openChest('legend')")
            for i in range(60): E("window.__DL.UI.a_openChest('bronze')")
            E("window.__DL.UI.a_closeChest()")
        E("window.__DL.UI.open('chest')"); pg.wait_for_timeout(500); pg.screenshot(path=f'ic_{tag}_chest.png')
        E("window.__DL.UI.a_openChest('gold')"); pg.wait_for_timeout(1700); pg.screenshot(path=f'ic_{tag}_open.png'); E("window.__DL.UI.a_closeChest()")
        E("window.__DL.UI.a_setTab('shop')"); pg.wait_for_timeout(400); pg.screenshot(path=f'ic_{tag}_shop.png')
        E("window.__DL.UI.a_setTab('col')"); pg.wait_for_timeout(400); pg.screenshot(path=f'ic_{tag}_col.png')
        if tag=='d':
            E("document.getElementById('panelBody').scrollTop=900"); pg.wait_for_timeout(200); pg.screenshot(path='ic_d_col2.png')
            E("window.__DL.UI.a_setTab('bg')"); pg.wait_for_timeout(300); pg.screenshot(path='ic_d_bg.png')
            E("window.__DL.UI.open('tuning',{uid:window.__DL.SAVE.data.current})"); E("window.__DL.UI.a_tMode('tune')"); pg.wait_for_timeout(400); pg.screenshot(path='ic_d_tune.png')
            E("window.__DL.UI.a_tMode('custom')"); pg.wait_for_timeout(400); pg.screenshot(path='ic_d_cust.png')
        pg.close()
    print(errs)
