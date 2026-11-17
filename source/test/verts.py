from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':960,'height':540}); pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(300); pg.click('#btnStart')
    for m in ['tsuzura','nanamagari','baylane','neon','x_city','hayate']:
        r=pg.evaluate(f"""(()=>{{const D=window.__DL; const t0=performance.now(); D.UI.game.start({{mode:'free', mapId:'{m}', weather:'clear', time:'night', laps:1, carInst:D.SAVE.cur(), rivals:[]}}); const ms=performance.now()-t0; const W=D.game.world; let v=W.global.count+(W.water?W.water.count:0); for(const c of W.chunks) for(const k of ['road','scene','bld']) if(c[k]) v+=c[k].count; return [Math.round(ms), v];}})()""")
        print(m, 'build ms', r[0], 'verts', r[1], 'MB', round(r[1]*52/1e6,1))
    b.close()
