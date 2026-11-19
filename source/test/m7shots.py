from playwright.sync_api import sync_playwright
import sys
shots=[('myojin',8,'night','p_start'),('myojin',None,'night','p_hp'),('myojin','park','evening','p_park'),('myojin','tun','day','p_tun'),('metrox',60,'night','x_gate'),('metrox','jct','night','x_jct'),('metrox','wall','night','x_wall'),('metrox','city','day','x_city')]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':800,'height':450}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800)
    pg.evaluate("window.__DL.SAVE.data.tutDone=true"); pg.click('#btnStart'); pg.wait_for_timeout(500); pg.evaluate("window.__DL.UI.closeModal&&window.__DL.UI.closeModal()")
    for m,sp,tm,name in shots:
        prog=pg.evaluate("""([m,sp])=>{const D=window.__DL,t=D.getTrack(m),S=D.STEP; if(sp===null){const c=t.corners.find(c=>c.type==='ヘアピン'); return (c.start-30)*S;} if(sp==='park') return (Math.floor(t.def.park[0]*t.n)-25)*S; if(sp==='tun'){let i=t.tunnel.indexOf(1); return (i-40)*S;} if(sp==='jct') return (t.jcts[0].i-60)*S; if(sp==='wall') return (t.def.walls[0][0]*t.n+30)*S; if(sp==='city') return (t.def.dense[0][0]*t.n+40)*S; return sp;}""",[m,sp])
        pg.evaluate("""([m,tm,prog])=>{const D=window.__DL; D.UI.launch({mode:'free',mapId:m,weather:'clear',time:tm,laps:1,carInst:D.SAVE.cur(),rivals:[],startProg:prog});}""",[m,tm,prog])
        pg.wait_for_timeout(2500)
        for k in range(20): pg.evaluate("window.__DL.game.update(1/30)")
        pg.wait_for_timeout(600); pg.screenshot(path=f'test/m7_{name}.png')
        pg.evaluate("window.__DL.game.exit(); window.__DL.UI.goMenu()"); pg.wait_for_timeout(300)
    print(errs[:5]); b.close()
