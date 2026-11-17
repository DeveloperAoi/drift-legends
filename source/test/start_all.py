from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':400,'height':240}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500); pg.click('#btnStart')
    r=pg.evaluate("""(()=>{const D=window.__DL, out=[]; const ids=Object.keys(D.SAVE.data.cars.length?{}:{});
      const cars=window.__CARS||null; return null})()""")
    res=pg.evaluate("""(()=>{const D=window.__DL, out=[];
      const allCars = D.UI.game && (typeof CAR_BY_ID!=='undefined') ? null : null;
      return 'ok'})()""")
    # get ids through shop data via UI internals
    ids=pg.evaluate("(()=>{const D=window.__DL; D.UI.open('shop'); const t=[]; for(const m of ['AKATSUKI','HOKUTO','TSUBASA','HIBANA','MIKAZUKI','SEIUN','KAMINARI','EUROPA']){D.UI.tab=m; D.UI.sel=null; D.UI.render(); document.querySelectorAll('[data-a=selShop]').forEach(e=>t.push(e.dataset.v));} return t})()")
    ids += ['xm_reindeer','xm_sleigh']
    print('cars', len(ids))
    bad=pg.evaluate("""(ids)=>{const D=window.__DL, out=[]; for(const id of ids){ const inst=D.SAVE.newCar(id);
       // max out every look/tune option
       for (const [k,v] of Object.entries({front:3,rear:2,side:2,wing:3,hood:2,exhaust:3,fender:2,mirror:2,roof:2,head:2,tail:2,glow:'xmas',acc:'tree',livery:'candy',paint:'chrome'})) inst.look[k]=v;
       inst.look.decals=['touge','xmas','legends'];
       for (const [k,v] of Object.entries({engine:'swap',ecu:3,susp:3,diff:'2way',tire:'stud',weight:3,nos:2})) inst.tune[k]=v;
       try { D.game.start({mode:'touge', mapId:'akigiri', weather:'snow', time:'night', laps:1, carInst:inst, rivals:[]}); for(let k=0;k<5;k++){D.game.update(1/60); D.game.render(1/60);} D.game.exit(); } catch(e){ out.push(id+': '+e.message+' | '+(e.stack||'').split('\\n')[1]); try{D.game.exit()}catch(x){} } }
       return out;}""", ids)
    print('car failures', bad[:10])
    print('page errors', errs[:5]); b.close()
