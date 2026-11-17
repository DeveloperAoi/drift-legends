from playwright.sync_api import sync_playwright
BOT="""(secs)=>{const D=window.__DL,g=D.game;const wrapAngle=D.wrapAngle,clamp=D.clamp;
 for(let k=0;k<secs*60;k++){ if(g.finished) break; const v=g.veh,tr=g.track,L=tr.locate(v.x,v.z,g.loc.i);const a=tr.pointAt(L.prog+Math.max(5,v.speed*0.6),0);
 const err=wrapAngle(Math.atan2(a.x-v.x,a.z-v.z)-v.heading);const steer=clamp(-err*3.2-L.lat*0.12,-1,1);const vmax=tr.vmax[(L.i+Math.floor(v.speed*1.2))%tr.n]*0.8;
 const bot={throttle:v.speed<vmax?1:0,brake:v.speed>vmax+3?1:0,steer,analog:true,steerRate:3};D.Input.read=()=>bot;g.update(1/60);}
 return {fin:g.finished, laps:g.laps.map(l=>l.t.toFixed(2)), ghost:!!g.ghost};}"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':960,'height':540}); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_TUNNEL' not in m.text else None)
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(300); pg.click('#btnStart')
    for run in range(2):
        pg.evaluate("window.__DL.UI.launch({mode:'time', mapId:'x_park', weather:'snow', time:'night', laps:2, carInst:window.__DL.SAVE.cur(), rivals:[]})")
        pg.wait_for_function("window.__DL.game.active && !window.__DL.UI.paused", timeout=60000); pg.wait_for_timeout(500)
        print(pg.evaluate(BOT, 300))
        pg.wait_for_timeout(2800); pg.screenshot(path=f'ghost{run}.png')
        pg.evaluate("document.querySelector('[data-a=resNext]')?.click()")
    print('ghost stored', pg.evaluate("!!window.__DL.SAVE.loadGhost('x_park')"), 'rec', pg.evaluate("JSON.stringify(window.__DL.SAVE.data.records.ta)")[:200])
    print('ERR', errs[:10]); b.close()
