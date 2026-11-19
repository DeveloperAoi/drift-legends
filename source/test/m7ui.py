from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1000,'height':560}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800)
    pg.evaluate("window.__DL.SAVE.data.tutDone=true"); pg.click('#btnStart'); pg.wait_for_timeout(500); pg.evaluate("window.__DL.UI.closeModal&&window.__DL.UI.closeModal()")
    pg.evaluate("window.__DL.UI.open('maps',{mode:'race'})"); pg.wait_for_timeout(300)
    pg.click('[data-v=myojin]'); pg.wait_for_timeout(1200); pg.screenshot(path='test/m7_sel.png')
    pg.click('[data-a=toCarSel]'); pg.wait_for_timeout(300); pg.click('[data-a=startRace]'); pg.wait_for_timeout(3000)
    r=pg.evaluate("(()=>{const g=window.__DL.game; return [g.cfg.mode,g.cfg.quick,g.rivals.length,g.track.def.id]})()")
    print(r)
    # simulate a finish
    pg.evaluate("(()=>{const g=window.__DL.game; g.countdown=0; g.started=true; g.finish('goal');})()"); pg.wait_for_timeout(2500)
    pg.screenshot(path='test/m7_res.png')
    print(pg.evaluate("document.querySelector('#modal')?.innerText.slice(0,300)"))
    print(errs[:5]); b.close()
