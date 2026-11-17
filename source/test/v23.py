from playwright.sync_api import sync_playwright
import json
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':900,'height':500}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); pg.click('#btnStart'); pg.wait_for_timeout(300); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    E=pg.evaluate; U="window.__DL.UI"
    print('items', E("window.__DL.ITEMS.length"), 'new', E("window.__DL.ITEMS.filter(i=>/^(dc3|pt3|wh3|ne3|cp3|pl3|mt3|kit3)_|^bg_.*3$/.test(i.id)).length"))
    E("window.__DL.UI.screen='ad'; document.getElementById('s-menu').classList.remove('show')")
    shots=[('ev_bus',{},0.6),('ev_bus',{},2.4),('eu_toro',{},0.6),('eu_toro',{},2.6),('eu_torino',{'lights':1},0.7),('eu_toro',{'extra':'jet','extra2':'fireworks'},2.5)]
    for i,(c,look,rot) in enumerate(shots):
        E(f"""(()=>{{const D=window.__DL; const inst=D.SAVE.newCar('{c}'); Object.assign(inst.look,{json.dumps(look)}); D.show.setCar(inst,true); D.show.rot={rot}; D.show.elev=0.12; D.show.idle=0; if({json.dumps(look)}.lights) D.show.model.setLights(true);}})()""")
        pg.wait_for_timeout(900); pg.screenshot(path=f'test/v23_{i}.png')
    print(errs[:5]); b.close()
