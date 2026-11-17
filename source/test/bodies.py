from playwright.sync_api import sync_playwright
import sys
cars=sys.argv[1].split(',') ; tag=sys.argv[2]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':640,'height':400}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); pg.click('#btnStart'); pg.wait_for_timeout(300); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pg.evaluate("window.__DL.UI.screen='ad'; document.getElementById('s-menu').classList.remove('show')")
    for i,c in enumerate(cars):
        for j,rot in enumerate([0.75, 1.5708]):
            pg.evaluate(f"(()=>{{const D=window.__DL; const inst=D.SAVE.newCar('{c}'); D.show.setCar(inst,true); D.show.rot={rot}; D.show.elev={0.18 if j==0 else 0.02}; D.show.idle=0; D.show.dist=6.4;}})()")
            pg.wait_for_timeout(700); pg.screenshot(path=f'test/b_{tag}_{i}_{j}.png')
    print(errs[:3]); b.close()
