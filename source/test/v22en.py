from playwright.sync_api import sync_playwright
import re
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':900,'height':500}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(600)
    pg.evaluate("(()=>{const D=window.__DL; D.SAVE.data.settings.lang='en'; D.SAVE.save();})()"); pg.reload(); pg.wait_for_timeout(800)
    pg.click('#btnStart'); pg.wait_for_timeout(300); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pg.evaluate("(()=>{const D=window.__DL; D.SAVE.data.cons={energy:2,charm:1}; D.SAVE.data.boosts={coin:{mult:1.5,end:Date.now()+600000}};})()")
    U="window.__DL.UI"; JP=re.compile(r"[぀-ヿ一-鿿]+[^\n]{0,20}")
    for scr,tab in [('pshop','cons'),('pshop','body'),('bag','cons'),('diamond','shop'),('news',None),('carshop',None)]:
        try: pg.evaluate(f"{U}.open('{scr}'); {U}.tab={repr(tab) if tab else 'null'}; {U}.render()")
        except Exception as e: print(scr,'ERR',e); continue
        pg.wait_for_timeout(500)
        t=pg.evaluate("document.getElementById('panelBody').innerText")
        print(scr,tab, sorted(set(JP.findall(t)))[:15])
    pg.evaluate(f"{U}.open('news'); {U}.render()"); pg.wait_for_timeout(300); pg.screenshot(path='test/v22en_news.png')
    print(errs[:5]); b.close()
