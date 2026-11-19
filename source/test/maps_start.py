from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':320,'height':200}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500); pg.click('#btnStart')
    pg.evaluate("window.__DL.UI.open('maps',{mode:'free'})"); pg.wait_for_timeout(300)
    ids=['kaminari','myojin','metrox','tengu','hakoya']
    pg.evaluate("window.__DL.UI.goMenu()")
    bad=pg.evaluate("""(ids)=>{const D=window.__DL,out=[]; for(const m of ids) for(const w of ['clear','rain','snow','fog']) for(const t of ['day','night']) for (const q of [0,2]) { D.SAVE.data.settings.quality=q;
      try{ D.game.start({mode:'touge',mapId:m,weather:w,time:t,laps:1,carInst:D.SAVE.cur(),rivals:[]}); for(let k=0;k<3;k++){D.game.update(1/60);D.game.render(1/60);} D.game.exit(); } catch(e){ out.push(m+' '+w+' '+t+' q'+q+': '+e.message+' @ '+(e.stack||'').split('\\n').slice(1,3).join(' ')); try{D.game.exit()}catch(x){} } } return out;}""", ids)
    print(len(ids), 'maps; failures:', len(bad)); print('\n'.join(bad[:12])); print(errs[:3]); b.close()
