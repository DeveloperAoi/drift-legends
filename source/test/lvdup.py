from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':900,'height':500}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800)
    pg.evaluate("window.__DL.SAVE.data.tutDone=true"); pg.click('#btnStart'); pg.wait_for_timeout(600); pg.evaluate("window.__DL.UI.closeModal()")
    for k in range(5): pg.evaluate("window.__DL.UI.refreshMenuStats()")
    pg.evaluate("window.__DL.UI.open('garage')"); pg.evaluate("window.__DL.UI.goMenu()"); pg.evaluate("window.__DL.UI.refreshMenuStats()")
    print('bars on menu:', pg.evaluate("document.querySelectorAll('#s-menu .lvbar').length"), errs[:2]); b.close()
