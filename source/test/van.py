from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':900,'height':500}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800)
    pg.evaluate("window.__DL.SAVE.data.tutDone=true"); pg.click('#btnStart'); pg.wait_for_timeout(600); pg.evaluate("window.__DL.UI.closeModal()")
    pg.evaluate("(()=>{const D=window.__DL,c=D.CAR_BY_ID.hk_van; D.UI.launch({mode:'free',mapId:'myojin',weather:'clear',time:'day',laps:1,carInst:{uid:'test',id:'hk_van',tune:{},look:{color:'#f4f4f2'}},rivals:[],startProg:300});})()")
    pg.wait_for_timeout(3000)
    for a in [0.6,2.6]:
        pg.evaluate(f"(()=>{{const g=window.__DL.game;g.camMode=5;g.finished=true;g._finA={a};}})()"); pg.wait_for_timeout(700); pg.screenshot(path=f'test/van_{a}.png')
    print(errs[:4]); b.close()
