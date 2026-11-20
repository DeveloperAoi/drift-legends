from playwright.sync_api import sync_playwright
fr=[('start',0.01),('appr',0.15),('loop1',0.22),('b1',0.31),('b1b',0.345),('loop2',0.42),('ramp',0.6),('arch',0.69),('loop3',0.85),('taisho',0.97)]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':800,'height':450}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800)
    pg.evaluate("window.__DL.SAVE.data.tutDone=true; window.__DL.UI._newsShown=true; window.__DL.UI._logChk=true"); pg.click('#btnStart'); pg.wait_for_timeout(800); pg.evaluate("window.__DL.UI.closeModal&&window.__DL.UI.closeModal()")
    print(pg.evaluate("(()=>{const t=window.__DL.getTrack('megane');return {n:t.n,len:t.length,fb:t.fallback,att:t.attempts,minY:t.minY,maxY:t.maxY}})()"))
    for name,f in fr:
        pg.evaluate("""([f])=>{const D=window.__DL,t=D.getTrack('megane'); D.UI.launch({mode:'free',mapId:'megane',weather:'clear',time:'evening',laps:1,carInst:D.SAVE.cur(),rivals:[],startProg:f*t.length});}""",[f])
        pg.wait_for_timeout(2500)
        if errs: print(errs[:3]); break
        for k in range(20): pg.evaluate("window.__DL.game.update(1/30)")
        pg.wait_for_timeout(500); pg.screenshot(path=f'test/mg_{name}.png')
        print(name, pg.evaluate('''(()=>{const g=window.__DL.game,v=g.veh;if(!v)return 'noveh '+Object.keys(g).filter(k=>/veh|car/i.test(k)).join(',');const loc=g.track.locate(v.x,v.z,-1);return [v.x!=null?v.y:Object.keys(v).slice(0,10).join(','), loc.y]})()'''))
        pg.evaluate("window.__DL.game.exit(); window.__DL.UI.goMenu()"); pg.wait_for_timeout(300)
    print(errs[:5]); b.close()
