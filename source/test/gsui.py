from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':900,'height':500}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); pg.click('#btnStart'); pg.wait_for_timeout(1200)
    E=pg.evaluate; U="window.__DL.UI"
    E("(()=>{const D=window.__DL; D.SAVE.data.tutDone=true; D.UI.closeModal(); D.SAVE.data.money=90000000; const c=D.SAVE.newCar('hk_sd3'); D.SAVE.data.cars.push(c); D.SAVE.data.current=c.uid;})()")
    E(f"{U}.open('pshop'); {U}.tab='body'; {U}.render()"); pg.wait_for_timeout(500)
    print('exclusive shown', E("[...document.querySelectorAll('[data-a=lookOpt]')].some(b=>b.textContent.includes('紫電'))"))
    E(f"{U}._ok=true; {U}.a_lookOpt('wing:19'); {U}.a_lookOpt('front:15'); {U}._ok=false"); pg.wait_for_timeout(600); pg.screenshot(path='test/gsui_a.png')
    c2=E("(()=>{const D=window.__DL; const c=D.SAVE.newCar('ak_kiri'); D.SAVE.data.cars.push(c); D.SAVE.data.current=c.uid; return 1})()")
    E(f"{U}.open('pshop'); {U}.tab='body'; {U}.render()"); pg.wait_for_timeout(300)
    print('exclusive hidden on other car', not E("[...document.querySelectorAll('[data-a=lookOpt]')].some(b=>b.textContent.includes('紫電'))"))
    E(f"{U}.open('tuning'); {U}.render()"); pg.wait_for_timeout(300); pg.screenshot(path='test/gsui_b.png')
    print(errs[:4]); b.close()
