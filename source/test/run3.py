from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1280,'height':900})
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500)
    pg.evaluate("window.__DL.SAVE.data.story.cleared=[1,2,3,4,5,6,7,8,9]; window.__DL.SAVE.data.xp=20000")
    pg.click('#btnStart'); pg.wait_for_timeout(300); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pg.click('[data-m=free]'); pg.wait_for_timeout(9000)
    pg.screenshot(path='maps_all.png', full_page=True)
    pg.evaluate("document.getElementById('panelBody').scrollTop=600"); pg.wait_for_timeout(500); pg.screenshot(path='maps_all2.png')
    print(errs)
    b.close()
