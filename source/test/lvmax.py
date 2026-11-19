from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':900,'height':500}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800)
    pg.evaluate("window.__DL.SAVE.data.tutDone=true"); pg.click('#btnStart'); pg.wait_for_timeout(600); pg.evaluate("window.__DL.UI.closeModal()")
    print(pg.evaluate("(()=>{const D=window.__DL,X=window.__DLX; D.SAVE.data.xp=3154150-10; D.SAVE.data.lvClaim={}; for(let i=1;i<=200;i++) D.SAVE.data.lvClaim[i]=1; const u=X.addXp(80000,'t'); D.SAVE.save(); return [D.SAVE.level(), JSON.stringify(u).slice(0,80)]})()"))
    pg.evaluate("window.__DL.UI.open('profile')"); pg.wait_for_timeout(500); pg.screenshot(path='test/lvmax.png')
    pg.reload(); pg.wait_for_timeout(1200); print('after reload', pg.evaluate("window.__DL.SAVE.level()"))
    print(errs[:3]); b.close()
