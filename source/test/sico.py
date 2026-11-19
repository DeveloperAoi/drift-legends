from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1280,'height':680},device_scale_factor=2); errs=[]; pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); E=pg.evaluate
    E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI._newsShown=true; window.__DL.UI._logChk=true"); pg.click('#btnStart'); pg.wait_for_timeout(1200); E("window.__DL.UI.closeModal(); window.__DL.SAVE.data.diamonds=1200")
    E("window.__DL.UI.open('store')"); pg.wait_for_timeout(900)
    pg.locator('.st-head').screenshot(path='test/sico_head.png'); pg.locator('.st-tabs.top').screenshot(path='test/sico_tabs.png'); pg.screenshot(path='test/sico_full.png')
    print('emoji left', E("/[\\u{1F300}-\\u{1FAFF}]/u.test(document.getElementById('panelBody').innerText)"), errs[:3]); b.close()
