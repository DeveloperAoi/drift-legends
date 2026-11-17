from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':960,'height':540}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(2500)
    E=pg.evaluate
    E("document.getElementById('btnStart').click()"); pg.wait_for_timeout(300); E("window.__DL.UI.closeModal()")
    E("window.__DL.UI.launch({mode:'free',mapId:'jumppark',weather:'clear',time:'evening',laps:1,carInst:window.__DL.SAVE.cur(),rivals:[{name:'R',team:'',car:'hk_s3',color:'#d01020',skill:0.9}]})")
    pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000)
    print('ramps', E("JSON.stringify(window.__DL.game.track.ramps)"), 'n', E("window.__DL.game.track.n"))
    # stop real loop control: place car before ramp 0 and simulate with fixed dt via game.update
    E("""(()=>{const D=window.__DL,g=D.game,tr=g.track,r=tr.ramps[0]; const s=(r.i-30)*2; const p=tr.pointAt(s,0); g.veh.reset(p.x,p.z,p.y,p.hd); g.veh.vx=Math.sin(p.hd)*30; g.veh.vz=Math.cos(p.hd)*30; g.veh.gear=4; g.loc=tr.locate(p.x,p.z,-1); g.lastProg=g.loc.prog;
      D.Input.read=()=>({throttle:1,brake:0,steer:0,hand:false,nitro:false,analog:true,steerRate:3}); window.__log=[]; g.paused=false;
      for(let k=0;k<240;k++){ g.update(1/60); if(k%6==0) window.__log.push([k, +g.veh.y.toFixed(2), +(g._gnd||0).toFixed(2), g.veh.air?1:0, +(g.veh.speed*3.6).toFixed(0)]); } })()""")
    log=E("window.__log"); print(log)
    pg.screenshot(path='jp_after.png')
    for stop,name in [(95,'jp_ramp'),(160,'jp_air')]:
        E("""(()=>{const D=window.__DL,g=D.game,tr=g.track,r=tr.ramps[1]; const s=(r.i-30)*2; const p=tr.pointAt(s,0); g.veh.reset(p.x,p.z,p.y,p.hd); g.veh.vx=Math.sin(p.hd)*30; g.veh.vz=Math.cos(p.hd)*30; g.veh.gear=4; g.loc=tr.locate(p.x,p.z,-1); g.lastProg=g.loc.prog; g.paused=false; g.camMode=0; g.camDir=[Math.sin(p.hd),Math.cos(p.hd)];
          for(let k=0;k<%d;k++) g.update(1/60); g.paused=true; window.__air=g.veh.air;})()""" % stop)
        pg.wait_for_timeout(700); pg.screenshot(path=name+'.png'); print(name, 'air', E("window.__air"))
    print('toast', E("document.getElementById('toast').textContent"), errs)
    b.close()
