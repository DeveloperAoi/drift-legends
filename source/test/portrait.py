from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    ctx=b.new_context(viewport={'width':390,'height':844}, has_touch=True, is_mobile=True, device_scale_factor=2)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500); pg.screenshot(path='p_title.png')
    pg.click('#btnStart'); pg.wait_for_timeout(300); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()"); pg.wait_for_timeout(600)
    pg.screenshot(path='p_menu.png')
    pg.evaluate("window.__DL.UI.open('tuning')"); pg.wait_for_timeout(900); pg.screenshot(path='p_tuning.png')
    pg.evaluate("window.__DL.UI.open('story')"); pg.wait_for_timeout(300); pg.evaluate("document.querySelector('[data-a=storyGo]').click()"); pg.wait_for_timeout(700); pg.screenshot(path='p_dialog.png')
    print(errs); b.close()
