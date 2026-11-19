from playwright.sync_api import sync_playwright
import json
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':640,'height':400}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); pg.click('#btnStart'); pg.wait_for_timeout(1200)
    pg.evaluate("window.__DL.SAVE.data.tutDone=true; window.__DL.UI.closeModal(); window.__DL.UI.screen='ad'; document.getElementById('s-menu').classList.remove('show')")
    r=pg.evaluate("""(()=>{const D=window.__DL; const out=[]; for(const c of ['hk_sd1','hk_sd2','hk_sd3','hk_sd4']){ for(const slot of Object.keys(D.AERO)){ const n=D.AERO[slot].opts.length; for(let i=0;i<n;i+=1){ const inst=D.SAVE.newCar(c); inst.look[slot]=i; try{ D.show.setCar(inst,true);}catch(e){out.push(c+' '+slot+' '+i+' '+e.message);} } } } return out;})()""")
    print('errors', r[:5], len(r))
    k=0
    for c in ['hk_sd1','hk_sd2','hk_sd3','hk_sd4']:
        for rot in [0.45, 2.7]:
            pg.evaluate(f"(()=>{{const D=window.__DL; const inst=D.SAVE.newCar('{c}'); D.show.setCar(inst,true); D.show.rot={rot}; D.show.elev=0.12; D.show.idle=0; D.show.dist=5.8;}})()")
            pg.wait_for_timeout(700); pg.screenshot(path=f'test/gs_{k}.png'); k+=1
    print(errs[:5]); b.close()
