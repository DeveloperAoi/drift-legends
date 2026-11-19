from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1100,'height':620}); errs=[]; pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); E=pg.evaluate
    E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI._newsShown=true; window.__DL.UI._logChk=true"); pg.click('#btnStart'); pg.wait_for_timeout(1200); E("window.__DL.UI.closeModal()")
    print('menu pills', E("[...document.querySelectorAll('#menuList [data-m]')].map(e=>e.dataset.m).filter(k=>['chest','diamond','store'].includes(k))"))
    pg.click('.nm-pill[data-m=store]'); pg.wait_for_timeout(400)
    for t in ['packs','daily','diamond','col','bg','offers']:
        pg.click(f'.st-tabs.top [data-v={t}]'); pg.wait_for_timeout(500)
        print(t, E("document.getElementById('panelTitle').textContent"), E("document.getElementById('panelBody').innerText.replace(/\\s+/g,' ').slice(60,140)"))
        if t in ('packs','diamond'): pg.screenshot(path=f'test/v36_{t}.png')
    pg.click('.st-tabs.top [data-v=diamond]'); pg.wait_for_timeout(300); pg.click('[data-a=setTab][data-v=races]'); pg.wait_for_timeout(300); print('dia races tab', E("window.__DL.UI.screen"), E("document.querySelector('[data-a=setTab][data-v=races]').classList.contains('on')"))
    E("window.__DL.UI.open('chest')"); print('open chest ->', E("window.__DL.UI.screen+':'+window.__DL.UI.stTab"))
    print(errs[:4]); b.close()
