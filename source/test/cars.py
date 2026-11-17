from playwright.sync_api import sync_playwright
ids=['ak_kiri','eu_furioso','hk_gt3','hb_r3','eu_quaranta','ak_raijin4','mk_9','hb_kaze','eu_veloce']
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':640,'height':400}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(600); pg.click('#btnStart'); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pg.evaluate("window.__DL.UI.screen='ad'; document.getElementById('s-menu').classList.remove('show')")
    for i,c in enumerate(ids):
        ok=pg.evaluate(f"(()=>{{const C=window.__DL; const car='{c}'; const s=C.SAVE.newCar ? null:null; return true}})()")
        pg.evaluate(f"""(()=>{{const D=window.__DL; const inst=D.SAVE.newCar('{c}'); if({i}===8){{inst.look.roof=inst.look.roof||0;}} D.show.setCar(inst,true); D.show.rot=0.75; D.show.elev=0.15; D.show.idle=0;}})()""")
        pg.wait_for_timeout(700); pg.screenshot(path=f'car_{i}.png')
    print(errs); b.close()
