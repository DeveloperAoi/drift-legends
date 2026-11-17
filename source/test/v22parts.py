from playwright.sync_api import sync_playwright
import json
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':640,'height':400}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); pg.click('#btnStart'); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pg.evaluate("window.__DL.UI.screen='ad'; document.getElementById('s-menu').classList.remove('show')")
    r=pg.evaluate("""(()=>{const D=window.__DL; const out=[]; const cars=['ak_hachi','hb_fd','hb_fc','hk_onevia','ts_sup','hk_r32','ak_kiri','xm_santa','eu_furioso'];
      for(const c of cars){ for(const slot of Object.keys(D.AERO)){ const n=D.AERO[slot].opts.length; for(let i=0;i<n;i++){ const inst=D.SAVE.newCar(c); inst.look[slot]=i; inst.look.hlCol='rainbow'; try{ D.show.setCar(inst,true);}catch(e){out.push(c+' '+slot+' '+i+' '+e.message); } } } }
      return out;})()""")
    print('build errors', r[:10], len(r))
    for i,(c,look) in enumerate([('ak_hachi',{}),('hb_fd',{}),('hb_fd',{'lights':1}),('ts_sup',{'wing':14,'front':8,'side':6,'fender':3,'hl':4,'hlCol':'blue'}),('hk_r32',{'wing':17,'fender':5,'hood':6,'roof':6,'hl':11}),('hk_onevia',{'wing':9,'rear':11,'trunk':3,'hl':6,'hlCol':'purple'})]):
        pg.evaluate(f"""(()=>{{const D=window.__DL; const inst=D.SAVE.newCar('{c}'); Object.assign(inst.look,{json.dumps(look)}); D.show.setCar(inst,true); D.show.rot=0.6; D.show.elev=0.15; D.show.idle=0; if({json.dumps(look)}.lights) D.show.model&&D.show.model.setLights&&D.show.model.setLights(true);}})()""")
        pg.wait_for_timeout(900); pg.screenshot(path=f'test/v22_{i}.png')
    print(errs[:5]); b.close()
