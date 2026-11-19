from playwright.sync_api import sync_playwright
import sys
cars=sys.argv[1].split(','); angs=[float(a) for a in sys.argv[2].split(',')]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1280,'height':720}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800)
    pg.evaluate("window.__DL.SAVE.data.tutDone=true"); pg.click('#btnStart'); pg.wait_for_timeout(500); pg.evaluate("window.__DL.UI.closeModal()")
    for car in cars:
        pg.evaluate(f"(()=>{{const D=window.__DL; D.UI.launch({{mode:'free',mapId:'lot',weather:'clear',time:'day',laps:1,carInst:Object.assign(D.SAVE.newCar('{car}'),{{uid:'test'}}),rivals:[]}});}})()"); pg.wait_for_timeout(2200)
        pg.evaluate("document.getElementById('hud').style.visibility='hidden'")
        for a in angs:
            pg.evaluate(f"(()=>{{const g=window.__DL.game;g.camMode=5;g.finished=true;g._finA={a};}})()"); pg.wait_for_timeout(450); pg.screenshot(path=f'test/c33_{car}_{a}.png')
        pg.evaluate("window.__DL.game.exit(); window.__DL.UI.goMenu(); document.getElementById('hud').style.visibility=''")
    print(errs[:4]); b.close()
