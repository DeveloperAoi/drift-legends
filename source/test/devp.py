from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':900,'height':560}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800)
    pg.evaluate("window.__DL.SAVE.data.tutDone=true"); pg.click('#btnStart'); pg.wait_for_timeout(600); pg.evaluate("window.__DL.UI.closeModal()")
    pg.evaluate("""(()=>{ const ref={get:()=>Promise.resolve({val:()=>({a:{act:'announce',t:Date.now(),by:'Zde9C8Lc',detail:'test'}})}),limitToLast(){return this}}; window.DL_FB={db:()=>({ref:()=>ref}),user:{uid:'x'}}; })()""")
    out=[]
    for t in ['ann','srv','maint','reset','upd','hist']:
        pg.evaluate(f"(()=>{{const U=window.__DL.UI; window.__DLX.DEV.owner=true; U.open('devPanel'); }})()")
        r=pg.evaluate(f"(()=>{{const U=window.__DL.UI; U.tab='{t}'; U.render(); return document.getElementById('panelBody').innerText.slice(0,60).replace(/\\n/g,' ')}})()")
        out.append(t+': '+r)
    print('\n'.join(out)); pg.screenshot(path='test/devp.png')
    print(errs[:3]); b.close()
