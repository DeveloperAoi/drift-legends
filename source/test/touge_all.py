from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':800,'height':450}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e))); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type=='error' and 'ERR_TUNNEL' not in m.text else None)
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500); pg.click('#btnStart'); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pg.evaluate("window.__DL.SAVE.data.story.cleared=[1,2,3,4,5,6,7,8,9]; window.__DL.SAVE.data.xp=99999")
    # via UI
    pg.click('[data-m=touge]'); pg.wait_for_timeout(800)
    pg.evaluate("document.querySelector('[data-a=toCarSel]').click()"); pg.wait_for_timeout(500)
    pg.evaluate("document.querySelector('[data-a=startRace]').click()"); pg.wait_for_timeout(4000)
    print('ui path: active', pg.evaluate("window.__DL.game.active"), 'screen', pg.evaluate("window.__DL.UI.screen"), errs[:5]); errs.clear()
    maps=pg.evaluate("MAPS_IDS=null; (()=>{try{return null}catch(e){}})()")
    pg.evaluate("window.__DL.game.exit(); window.__DL.UI.goMenu(); window.__DL.UI.open('maps',{mode:'touge'})"); pg.wait_for_timeout(500)
    ids=pg.evaluate("Array.from(document.querySelectorAll('[data-a=selMap]')).map(e=>e.dataset.v)")
    pg.evaluate("window.__DL.UI.goMenu()")
    BOT='''(()=>{const D=window.__DL,g=D.game;const wrapAngle=D.wrapAngle,clamp=D.clamp; g.started=true; g.countdown=0; g.veh.gear=2;
 for(let k=0;k<60*25;k++){ if(!g.active||g.paused) break; const v=g.veh,tr=g.track,L=tr.locate(v.x,v.z,g.loc.i);const a=tr.pointAt(L.prog+Math.max(5,v.speed*0.6),0);
 const err=wrapAngle(Math.atan2(a.x-v.x,a.z-v.z)-v.heading);const kk=Math.abs(tr.K[(L.i+8)%tr.n]);const vmax=tr.vmax[(L.i+Math.floor(v.speed*1.2))%tr.n]*0.9;
 const bot={throttle:v.speed<vmax?1:0.5,brake:v.speed>vmax+5?1:0,steer:clamp(-err*3.2-L.lat*0.12,-1,1),hand:kk>1/50&&v.speed>10,analog:true,steerRate:3};D.Input.read=()=>bot;g.update(1/60); if(k%10===0) g.render(1/60);}
 return [Math.round(g.totalDist), g.drift.score, Math.round(g.damage)];})()'''
    for m in ids:
        pg.evaluate(f"window.__DL.UI.launch({{mode:'touge', mapId:'{m}', weather:'clear', time:'day', laps:1, carInst:window.__DL.SAVE.cur(), rivals:[]}})")
        pg.wait_for_timeout(1800)
        try: r=pg.evaluate(BOT)
        except Exception as e: r=str(e)[:300]
        ok=pg.evaluate("window.__DL.game.active")
        print(m, r, 'active', ok, errs[:3]); errs.clear()
        pg.evaluate("window.__DL.game.exit()")
    print('done maps', len(ids))
    b.close()
