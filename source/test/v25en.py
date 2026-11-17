from playwright.sync_api import sync_playwright
import re
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':900,'height':500}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(600)
    pg.evaluate("(()=>{const D=window.__DL; D.SAVE.data.settings.lang='en'; D.SAVE.data.tutDone=true; D.SAVE.save();})()"); pg.reload(); pg.wait_for_timeout(800)
    pg.click('#btnStart'); pg.wait_for_timeout(400); pg.evaluate("window.__DL.UI.closeModal()")
    U="window.__DL.UI"; JP=re.compile(r"[぀-ヿ一-鿿]+[^\n]{0,15}")
    print('menu', sorted(set(JP.findall(pg.evaluate("document.getElementById('menuList').innerText"))))[:12])
    for scr in ['story','drag','ach','codes','glv','friends','clan','news']:
        pg.evaluate(f"{U}.open('{scr}')"); pg.wait_for_timeout(500)
        t=pg.evaluate("document.getElementById('panelBody').innerText"); print(scr, sorted(set(JP.findall(t)))[:12])
    pg.evaluate(f"{U}.tutorial(true)"); pg.wait_for_timeout(300); print('tut', sorted(set(JP.findall(pg.evaluate("document.querySelector('.modal').innerText"))))[:8])
    pg.screenshot(path='test/v25en_tut.png')
    print(errs[:4]); b.close()
