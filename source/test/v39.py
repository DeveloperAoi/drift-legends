from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1280,'height':700}); errs=[]; pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); E=pg.evaluate
    E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI._newsShown=true; window.__DL.UI._logChk=true"); pg.click('#btnStart'); pg.wait_for_timeout(1200); E("window.__DL.UI.closeModal(); window.__DL.SAVE.data.money=9e9")
    E("window.__DL.UI.open('store')"); pg.wait_for_timeout(300); E("window.__DL.UI.a_stTab('packs')"); pg.wait_for_timeout(400)
    pg.click('.ps-card[data-v=silver]'); pg.wait_for_timeout(800); print('order', E("[...document.querySelectorAll('.pr-tag b')].map(e=>e.textContent).join(' > ')")); pg.screenshot(path='test/v39_detail.png'); E("window.__DL.UI.closeModal()")
    # deterministic mythic reveal via PACKFX directly
    E("""(()=>{const D=window.__DL,X=window.__DLX; const it=D.ITEMS.find(i=>i.id==='mp_0'); const c=D.ITEMS&&{id:'mythic',name:'ミシックカードパック',odds:{M:100}}; X.PACKFX.open(c,[{it,g:{isNew:true,refund:0}}]);})()""")
    pg.wait_for_timeout(1200); pg.click('#packFx [data-p=open]'); pg.wait_for_timeout(5200); pg.screenshot(path='test/v39_reveal.png')
    print('btn', E("!!document.querySelector('.cx-3d')")); pg.click('.cx-3d', force=True); pg.wait_for_timeout(1500); pg.screenshot(path='test/v39_3d.png'); print('3d', E("!!document.getElementById('card3d')"))
    print(errs[:5]); b.close()
