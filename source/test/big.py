from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={'width':1280,'height':720}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_' not in m.text else None)
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(2500); E=pg.evaluate; U="window.__DL.UI"
    E("document.getElementById('btnStart').click()"); pg.wait_for_timeout(300); E(f"{U}.closeModal()")
    E("window.__DL.SAVE.data.money=900000000")
    # decals anywhere
    E("""(()=>{const c=window.__DL.SAVE.cur(); c.look.color='#1e5aff'; c.look.decals=['touge','dc_t2','dc_s0','dc_t23','dc_t8']; ['dc_t2','dc_s0','dc_t23','dc_t8'].forEach(i=>window.__DL.SAVE.data.inv[i]=1);
      c.look.decalPos={touge:{f:'L',x:0.5,y:0.5,s:1.2,r:0},dc_t2:{f:'R',x:0.45,y:0.5,s:1.4,r:-10},dc_s0:{f:'H',x:0.5,y:0.5,s:1.5,r:0},dc_t23:{f:'T',x:0.5,y:0.5,s:1.3,r:0},dc_t8:{f:'K',x:0.5,y:0.5,s:1,r:0}};
      window.__DL.UI.goMenu(); window.__DL.show.setCar(c,true);})()""")
    for i,rot in enumerate([-1.57, 1.57, 3.14*0.15, 3.14*0.85]):
        E(f"window.__DL.show.rot={rot}; window.__DL.show.elev={0.15 if i<2 else 0.6}; window.__DL.show.idle=-999"); pg.wait_for_timeout(500); pg.screenshot(path=f'bg_dec{i}.png', clip={'x':380,'y':120,'width':900,'height':500})
    # parts shop
    for tab in ['wheel','tire','body','engine','extra']:
        E(f"{U}.open('pshop'); {U}.a_setTab('{tab}')"); pg.wait_for_timeout(300); pg.screenshot(path=f'bg_ps_{tab}.png')
    E(f"{U}.a_setExtra('jet')"); print('extra', E("window.__DL.SAVE.cur().look.extra"), 'owned', E("window.__DL.SAVE.data.extras"))
    pg.wait_for_timeout(500); E("window.__DL.show.rot=3.14*0.85"); pg.wait_for_timeout(400); pg.screenshot(path='bg_jetcar.png')
    # race with jet
    E(f"{U}.launch({{mode:'free',mapId:'jumppark',weather:'clear',time:'evening',laps:1,carInst:window.__DL.SAVE.cur(),rivals:[]}})"); pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000)
    r=E("""(()=>{const D=window.__DL,g=D.game,tr=g.track; const p=tr.pointAt(200,0); g.veh.reset(p.x,p.z,p.y,p.hd); g.veh.vx=Math.sin(p.hd)*15; g.veh.vz=Math.cos(p.hd)*15; g.loc=tr.locate(p.x,p.z,-1); g.lastProg=g.loc.prog;
      let press=false; D.Input.read=()=>({throttle:1,brake:0,steer:0,hand:false,nitro:press,analog:true,steerRate:3});
      for(let k=0;k<60;k++) g.update(1/60); const s0=g.veh.speed; for(let k=0;k<60;k++) g.update(1/60); const s1=g.veh.speed;
      p2=tr.pointAt(200,0); g.veh.reset(p2.x,p2.z,p2.y,p2.hd); g.veh.vx=Math.sin(p2.hd)*15; g.veh.vz=Math.cos(p2.hd)*15; g.loc=tr.locate(p2.x,p2.z,-1);
      for(let k=0;k<60;k++) g.update(1/60); press=true; for(let k=0;k<60;k++) g.update(1/60); return [s1-s0, g.veh.speed - s0, g.veh.nitro, !!g.exActive];})()""")
    print('accel no-boost vs boost (m/s gained), energy, active:', r)
    pg.wait_for_timeout(300); pg.screenshot(path='bg_jetrace.png')
    E("window.__DL.game.exit(); window.__DL.UI.goMenu()")
    # hop on normal track
    E(f"{U}.a_setExtra('hop')"); E(f"{U}.launch({{mode:'free',mapId:'circuit',weather:'clear',time:'day',laps:1,carInst:window.__DL.SAVE.cur(),rivals:[]}})"); pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000)
    r=E("""(()=>{const D=window.__DL,g=D.game; let press=false; D.Input.read=()=>({throttle:1,brake:0,steer:0,hand:false,nitro:press,analog:true,steerRate:3}); for(let k=0;k<30;k++) g.update(1/60); press=true; g.update(1/60); press=false; let mx=0; for(let k=0;k<90;k++){ g.update(1/60); mx=Math.max(mx, g.veh.y - g.loc.y);} return [mx.toFixed(2), g.veh.air];})()""")
    print('hop max height, air after', r)
    E("window.__DL.game.exit(); window.__DL.UI.goMenu()")
    for ex in ['fireworks','horn','backfire','chute','smoke','rocket']:
        E(f"{U}.a_setExtra('{ex}')")
    E(f"{U}.launch({{mode:'free',mapId:'circuit',weather:'clear',time:'day',laps:1,carInst:window.__DL.SAVE.cur(),rivals:[]}})"); pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000)
    pg.keyboard.down('w'); pg.wait_for_timeout(1500); pg.keyboard.down('e'); pg.wait_for_timeout(1200); pg.screenshot(path='bg_rocket.png'); pg.keyboard.up('e'); pg.keyboard.up('w')
    E("window.__DL.game.exit(); window.__DL.UI.goMenu()")
    E(f"{U}.open('bag')"); pg.wait_for_timeout(300); pg.screenshot(path='bg_bag.png'); E(f"{U}.a_setTab('extra')"); pg.wait_for_timeout(200); pg.screenshot(path='bg_bag2.png')
    E("window.__DL.AUDIO.init(); window.__DL.AUDIO.resume(); window.__DL.AUDIO.play('t11')"); pg.wait_for_timeout(3000); print('track', E("window.__DL.AUDIO.music.track && window.__DL.AUDIO.music.track.id"))
    E(f"{U}.goMenu()"); pg.wait_for_timeout(400); pg.screenshot(path='bg_menu.png')
    print(errs[:8]); b.close()
