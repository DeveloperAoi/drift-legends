import sys
from playwright.sync_api import sync_playwright
mobile=len(sys.argv)>1
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    ctx=b.new_context(viewport={'width':844,'height':390} if mobile else {'width':1280,'height':720}, has_touch=mobile, is_mobile=mobile, device_scale_factor=2 if mobile else 1)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500); pg.click('#btnStart'); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pg.evaluate("window.__DL.SAVE.data.money=90000000"); pre='m' if mobile else 'd'
    E=lambda js: pg.evaluate(js)
    E("window.__DL.UI.open('tuning')"); pg.wait_for_timeout(900); pg.screenshot(path=f'tu_{pre}_1.png')
    E("document.querySelector('[data-a=tCat][data-v=eng]').click()"); pg.wait_for_timeout(300)
    E("document.querySelector('[data-a=tuneOpt][data-v=\"engine:turbo\"]').click()"); pg.wait_for_timeout(700); pg.screenshot(path=f'tu_{pre}_2.png')
    print('hp', E("Math.round(window.__DL.UI.instSpec(window.__DL.SAVE.cur()).hp)"))
    E("document.querySelector('[data-a=tCatBack]').click()"); E("document.querySelector('[data-a=tCat][data-v=set]').click()"); pg.wait_for_timeout(300)
    print('sliders', E("document.querySelectorAll('[data-in=tuneSl]').length"))
    E("document.querySelector('[data-a=tMode][data-v=custom]').click()"); pg.wait_for_timeout(600); pg.screenshot(path=f'tu_{pre}_3.png')
    for c in ['col','liv','dec','frt','sid','rea','whl','acc','win','x']:
        if c=='x': break
        E(f"document.querySelector('[data-a=tCat][data-v={c}]').click()"); pg.wait_for_timeout(150)
        n=E("document.querySelectorAll('.part').length"); print(c, n, end='; ')
        if c=='rea': E("document.querySelector('[data-a=lookOpt][data-v=\"wing:2\"]').click()"); pg.wait_for_timeout(700); pg.screenshot(path=f'tu_{pre}_4.png')
        E("document.querySelector('[data-a=tCatBack]').click()")
    print(); print('ERR', errs); b.close()
