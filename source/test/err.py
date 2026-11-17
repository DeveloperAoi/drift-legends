from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':900,'height':500}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500); pg.click('#btnStart'); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pg.evaluate("window.__DL.SAVE.data.records.touge.akigiri={list:[]}")
    pg.evaluate("window.__DL.UI.launch({mode:'touge', mapId:'akigiri', weather:'clear', time:'night', laps:1, carInst:window.__DL.SAVE.cur(), rivals:[]})")
    pg.wait_for_timeout(6000); print('touge w/ broken record active:', pg.evaluate("window.__DL.game.active"), 'best:', pg.evaluate("document.getElementById('raceInfo').innerText.replace(/\\n/g,' ')"))
    pg.evaluate("window.__DL.game.exit(); window.__DL.UI.goMenu()")
    # forced load failure -> retry then modal
    pg.evaluate("window.__DL.SAVE.data.settings.quality=2; const g=window.__DL.game; const o=g.start.bind(g); window.__n=0; g.start=(c)=>{window.__n++; throw new Error('test failure '+window.__n)}; window.__DL.UI.launch({mode:'touge', mapId:'akigiri', weather:'clear', time:'night', laps:1, carInst:window.__DL.SAVE.cur(), rivals:[]})")
    pg.wait_for_timeout(1500); print('attempts', pg.evaluate("window.__n"), 'quality now', pg.evaluate("window.__DL.SAVE.data.settings.quality"), 'modal:', pg.evaluate("document.getElementById('overlay').innerText.slice(0,80)"))
    pg.evaluate("document.querySelector('[data-a=closeModal]').click(); window.__DL.UI.open('settings'); window.__DL.UI.tab='data'; window.__DL.UI.render()"); pg.wait_for_timeout(300)
    print('errlog:', pg.evaluate("(document.getElementById('errLogText')||{}).value"))
    print('ERR', errs); b.close()
