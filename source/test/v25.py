from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':900,'height':500}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('C:'+m.text) if m.type=='error' else None)
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(1200); pg.click('#btnStart'); pg.wait_for_timeout(1500)
    E=pg.evaluate; U="window.__DL.UI"
    print('tutorial shown', E("!!document.querySelector('.tut')")); pg.screenshot(path='test/v25_tut.png')
    E(f"{U}.a_tutSkip()"); E("document.querySelector('[data-a=closeModal]')?.click()"); pg.wait_for_timeout(300)
    pg.screenshot(path='test/v25_menu.png')
    E("window.__DL.SAVE.data.money=90000000; window.__DL.SAVE.data.diamonds=1000")
    for scr in ['story','drag','ach','codes','glv','friends','clan']:
        E(f"{U}.open('{scr}')"); pg.wait_for_timeout(500); pg.screenshot(path=f'test/v25_{scr}.png')
    E(f"{U}.open('codes')"); pg.fill('#codeIn','welcome'); E(f"{U}.a_redeem()"); pg.wait_for_timeout(500); print('code', E("JSON.stringify(window.__DL.SAVE.data.codes)"))
    E(f"{U}.closeModal()")
    # give cars for garage level
    E("(()=>{const D=window.__DL; for (const id of ['hk_s3','hb_fd','eu_veloce','hk_gtx','eu_toro']) D.SAVE.data.cars.push(D.SAVE.newCar(id));})()")
    E(f"{U}.open('glv')"); pg.wait_for_timeout(300); print('glv', E("JSON.stringify(garageLevel(window.__DL.SAVE.data))") if False else '')
    E(f"{U}.a_glvAll()"); pg.wait_for_timeout(300); pg.screenshot(path='test/v25_glv2.png')
    E(f"{U}.open('ach')"); pg.wait_for_timeout(300); E(f"{U}.a_achAll()"); pg.wait_for_timeout(300)
    # story S2 unlock by clearing S1
    E("window.__DL.SAVE.data.story.cleared=[1,2,3,4,5,6,7,8,9]"); E(f"{U}.season=null; {U}.sel=null; {U}.open('story')"); pg.wait_for_timeout(500); pg.screenshot(path='test/v25_story2.png')
    # drag race
    E(f"{U}.open('drag')"); pg.wait_for_timeout(200); E(f"{U}.a_dragGo()")
    pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000)
    pg.keyboard.down('ArrowUp')
    for k in range(90):
        pg.wait_for_timeout(1000)
        if E("window.__DL.game.finished"): break
        if k==8: pg.screenshot(path='test/v25_dragrun.png'); print('t8', E("JSON.stringify([window.__DL.game.totalDist, window.__DL.game.veh.speed*3.6, window.__DL.game.rivals[0].prog, window.__DL.game.raceT])"))
    pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(3000); pg.screenshot(path='test/v25_dragres.png')
    print('drag stats', E("JSON.stringify({d:window.__DL.SAVE.data.stats.drags, w:window.__DL.SAVE.data.stats.dragWins, b:window.__DL.SAVE.data.stats.dragBest, dist: window.__DL.game.totalDist})"))
    print(errs[:8]); b.close()
