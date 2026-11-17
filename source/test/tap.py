from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    ctx=b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True, device_scale_factor=2)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(2500); E=pg.evaluate
    cdp=ctx.new_cdp_session(pg); T=lambda typ, pts: cdp.send('Input.dispatchTouchEvent', {'type':typ,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in pts]})
    def tap(sel, jitter=0):
        pg.locator(sel).first.scroll_into_view_if_needed(); pg.wait_for_timeout(150); bb=pg.locator(sel).first.bounding_box(); x,y=bb['x']+bb['width']/2, bb['y']+bb['height']/2
        T('touchStart',[(1,(x,y))]); 
        if jitter: T('touchMove',[(1,(x+jitter,y+jitter/2))])
        pg.wait_for_timeout(60); T('touchEnd',[]); pg.wait_for_timeout(500)
    tap('#btnStart'); E("window.__DL.UI.closeModal()"); pg.wait_for_timeout(300)
    E("window.__DL.__clicks=0; document.addEventListener('click',()=>window.__DL.__clicks++)")
    tap('[data-m=shop]', 6); print('screen', E("window.__DL.UI.screen"))
    tab=E("[...document.querySelectorAll('[data-a=shopTab]')][2].dataset.v"); tap(f'[data-a=shopTab][data-v="{tab}"]', 9); print('tab', E("window.__DL.UI.tab"), 'expected', tab)
    tap('#btnBack', 5); print('after back', E("window.__DL.UI.screen"), 'clicks', E("window.__DL.__clicks"))
    # money button double check: dev money not available; test buy flow does not double fire: open chest daily twice
    tap('[data-m=chest]'); m0=E("window.__DL.SAVE.data.money"); tap('[data-a=openChest][data-v=bronze]', 4); pg.wait_for_timeout(1200)
    print('bronze opened once:', (m0-E("window.__DL.SAVE.data.money")) in (300000, 300000-50000, 300000-150000, 300000-400000, 300000-1200000, 300000-4000000), m0-E("window.__DL.SAVE.data.money"))
    tap('[data-a=closeChest]'); tap('#btnBack'); print('menu', E("window.__DL.UI.screen"))
    # browser back
    tap('[data-m=garage]'); E("history.back()"); pg.wait_for_timeout(600); print('history back ->', E("window.__DL.UI.screen"))
    print(errs); b.close()
