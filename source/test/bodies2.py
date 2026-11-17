from playwright.sync_api import sync_playwright
import json
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':640,'height':400}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); pg.click('#btnStart'); pg.wait_for_timeout(300); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pg.evaluate("window.__DL.UI.screen='ad'; document.getElementById('s-menu').classList.remove('show')")
    L=[('hk_s1',{'hood':6,'front':4,'wing':2},0.6,0.3),('hb_r3',{'hood':3,'roof':3},0.5,0.35),('ak_raijin4',{'hood':9,'fender':2,'wing':14},0.9,0.3),('mk_6',{'hood':4,'trunk':3},2.4,0.3),('ak_hachi',{},0.7,0.12),('hk_r32',{'hood':10},0.7,0.12)]
    for i,(c,look,rot,el) in enumerate(L):
        pg.evaluate(f"(()=>{{const D=window.__DL; const inst=D.SAVE.newCar('{c}'); Object.assign(inst.look,{json.dumps(look)}); D.show.setCar(inst,true); D.show.rot={rot}; D.show.elev={el}; D.show.idle=0; D.show.dist=5.6;}})()")
        pg.wait_for_timeout(700); pg.screenshot(path=f'test/b2_{i}.png')
    print(errs[:3]); b.close()
