from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={'width':1280,'height':720}); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_TUNNEL' not in m.text else None)
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500); pg.click('#btnStart'); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    E=pg.evaluate
    for m in ['momiji','kirisame','yukimi','kazan','tanada','damu','bridge','downtown','airport','x_forest']:
        r=E(f"(()=>{{const D=window.__DL; const t0=performance.now(); D.game.start({{mode:'free', mapId:'{m}', weather:'clear', time:'day', laps:1, carInst:D.SAVE.cur(), rivals:[]}}); const tr=D.game.track; return [Math.round(performance.now()-t0), (tr.length/1000).toFixed(2), tr.corners.length, tr.corners.filter(c=>c.type==='ヘアピン').length]; }})()")
        print(m, r)
    E("window.__DL.game.exit(); window.__DL.UI.goMenu()")
    E("window.__DL.AUDIO.play('t10')"); pg.wait_for_timeout(2500); print('music', E("window.__DL.AUDIO.music.track.name"), E("window.__DL.AUDIO.music.step"))
    # xmas points + shop
    E("window.__DL.SAVE.data.event.points=20000; window.__DL.UI.open('events')"); pg.wait_for_timeout(400)
    for it in ['car:xm_sleigh','acc:antler','glow:xmas','wheel:star','livery:candy','caliper:gold','xmas:colors']: E(f"document.querySelector('[data-a=xBuy][data-v=\"{it}\"]').click()")
    print('points left', E("window.__DL.SAVE.data.event.points"), 'cars', E("window.__DL.SAVE.data.cars.map(c=>c.id)"))
    pg.screenshot(path='xshop.png', full_page=False)
    E("window.__DL.SAVE.data.money=50000000; const c=window.__DL.SAVE.data.cars.find(c=>c.id==='xm_sleigh'); window.__DL.SAVE.data.current=c.uid; window.__DL.UI.open('tuning',{uid:c.uid,tab:'aero'})"); pg.wait_for_timeout(400)
    for sel in ['[data-a=lookOpt][data-v="fender:2"]','[data-a=lookOpt][data-v="wing:4"]','[data-a=lookOpt][data-v="roof:2"]','[data-a=lookSet][data-v="acc:antler"]','[data-a=lookGlow][data-v=xmas]','[data-a=lookWheel][data-v=star]','[data-a=lookSet][data-v="caliper:#d4af37"]','[data-a=lookOpt][data-v="tail:1"]']: E(f"document.querySelector('{sel}').click()"); pg.wait_for_timeout(150)
    E("window.__DL.UI.tab='paint'; window.__DL.UI.render()"); E("document.querySelector('[data-a=lookLivery][data-v=candy]').click()")
    pg.wait_for_timeout(900); pg.screenshot(path='xtuned.png')
    E("window.__DL.UI.tab='engine'; window.__DL.UI.render()"); pg.wait_for_timeout(300); pg.screenshot(path='tune_engine.png')
    E("window.__DL.UI.launch({mode:'free', mapId:'x_forest', weather:'snow', time:'night', laps:1, carInst:window.__DL.SAVE.cur(), rivals:[]})"); pg.wait_for_function("window.__DL.game.active"); pg.wait_for_timeout(4000); pg.screenshot(path='xforest.png')
    print('ERR', errs[:10]); b.close()
