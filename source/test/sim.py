import sys, json
from playwright.sync_api import sync_playwright
mode=sys.argv[1]; mapid=sys.argv[2]; secs=int(sys.argv[3]) if len(sys.argv)>3 else 60
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':960,'height':540})
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_TUNNEL' not in m.text else None)
    pg.goto('file:///home/claude/dl/dist/index.html?vm='+(sys.argv[4] if len(sys.argv)>4 else '0.8')); pg.wait_for_timeout(400)
    pg.click('#btnStart'); pg.wait_for_timeout(200); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    rivals = "[{name:'TEST',team:'T',car:'hk_s1',color:'#f00',skill:0.70}]" if mode in ('story','event') else "[]"
    pg.evaluate(f"""(()=>{{const D=window.__DL; const m=MAP=null; D.UI.launch({{mode:'{mode}', story:1, mapId:'{mapid}', weather:'clear', time:'night', laps:1, carInst:D.SAVE.cur(), rivals:{rivals}}});}})()""")
    pg.wait_for_function("window.__DL.game.active", timeout=60000)
    res=pg.evaluate("""(secs)=>{
      const VM=parseFloat(new URLSearchParams(location.search).get('vm')||'0.8'); const D=window.__DL, g=D.game; const out=[]; let hits=0;
      const K=D.Input.keys; const wrapAngle=D.wrapAngle, clamp=D.clamp;
      for(let k=0;k<secs*60;k++){
        if(g.paused) break;
        const v=g.veh, tr=g.track, L=tr.locate(v.x,v.z,g.loc.i);
        const ahead=tr.pointAt(L.prog+Math.max(5,v.speed*0.6), 0);
        const want=Math.atan2(ahead.x-v.x, ahead.z-v.z); let err=wrapAngle(want-v.heading);
        const steer=clamp(-err*3.2 - L.lat*0.12,-1,1); // heading+ is left, steer+ is right
        const vmax=tr.vmax[(L.i+Math.floor(v.speed*1.2))%tr.n]*VM;
        const bot={throttle: v.speed<vmax?1:0, brake: v.speed>vmax+3?1:0, steer, hand:false, nitro:false, analog:true, steerRate:3};
        D.Input.read=()=>bot;
        g.update(1/60);
        if(k%300===0) out.push([+(k/60).toFixed(0), +(v.speed*3.6).toFixed(0), v.gear, +L.lat.toFixed(1), +g.totalDist.toFixed(0), g.lap, +g.damage.toFixed(0), g.rivals[0]?+g.rivals[0].prog.toFixed(0):null, g.drift.score]);
      }
      K.left=K.right=K.gas=K.brake=false;
      return {out, finished:g.finished, laps:g.laps.map(l=>l.t.toFixed(2)), reason:g.endReason};
    }""", secs)
    for r in res['out']: print(r)
    print('finished', res['finished'], res['laps'], res['reason'])
    pg.wait_for_timeout(3000)
    pg.screenshot(path=f'sim_{mode}_{mapid}.png')
    print('errors:', errs[:10])
    b.close()
