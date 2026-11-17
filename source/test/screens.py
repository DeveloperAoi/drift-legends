import sys
from playwright.sync_api import sync_playwright
mobile = len(sys.argv)>1 and sys.argv[1]=='m'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    ctx=b.new_context(viewport={'width':844,'height':390} if mobile else {'width':1280,'height':720}, has_touch=mobile, is_mobile=mobile, device_scale_factor=2 if mobile else 1)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500)
    pg.click('#btnStart'); pg.wait_for_timeout(400)
    pg.screenshot(path=f'ui_{"m" if mobile else "d"}_welcome.png')
    pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pre='m' if mobile else 'd'
    for scr,extra in [('garage',None),('shop',None),('tuning',None),('settings',None),('events',None),('story',None)]:
        pg.evaluate(f"window.__DL.UI.open('{scr}')"); pg.wait_for_timeout(1200)
        pg.screenshot(path=f'ui_{pre}_{scr}.png')
    pg.evaluate("window.__DL.UI.tab='paint'; window.__DL.UI.open('tuning',{tab:'paint'})"); pg.wait_for_timeout(1000); pg.screenshot(path=f'ui_{pre}_paint.png')
    pg.evaluate("window.__DL.UI.goMenu()"); pg.wait_for_timeout(800); pg.screenshot(path=f'ui_{pre}_menu.png')
    # race HUD
    pg.evaluate("window.__DL.UI.launch({mode:'touge', mapId:'kuremine', weather:'rain', time:'evening', laps:1, carInst:window.__DL.SAVE.cur(), rivals:[]})")
    pg.wait_for_function("window.__DL.game.active", timeout=60000); pg.wait_for_timeout(6000)
    pg.screenshot(path=f'ui_{pre}_race.png')
    print(errs)
    b.close()
