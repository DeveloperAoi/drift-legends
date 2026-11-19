from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':900,'height':520}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800)
    E=pg.evaluate
    # simulate old save: xp 31000 (old Lv.21), no xpv
    E("(()=>{const D=window.__DL; const d=D.SAVE.data; d.xp=31000; delete d.xpv; d.tutDone=true; localStorage.setItem(D.SAVE.key||'dl_save_v1', JSON.stringify(d)); })()")
    print('key', E("window.__DL.SAVE.key"))
    pg.reload(); pg.wait_for_timeout(900)
    print('migrated level', E("window.__DL.SAVE.level()"), E("JSON.stringify(lvInfo(window.__DL.SAVE.data.xp))") if False else E("window.__DL.SAVE.data.xp"), E("window.__DL.SAVE.data.xpv"))
    pg.click('#btnStart'); pg.wait_for_timeout(1200); E("window.__DL.UI.closeModal()")
    pg.screenshot(path='test/pg_home.png')
    lv0=E("window.__DL.SAVE.level()"); m0=E("window.__DL.SAVE.data.money")
    E("window.__DL.UI.launch({mode:'time',mapId:'circuit',weather:'clear',time:'day',laps:1,carInst:window.__DL.SAVE.cur(),rivals:[]})"); pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000)
    # finish a time attack via showResults
    E("window.__DL.UI.showResults({mode:'time', mapId:'circuit', car:'ak_kiri', time:95, laps:[{t:95,s:[30,30,35]}], maxSpeed:180, reason:'goal', cfg:{mode:'time', mapId:'circuit'}})")
    pg.wait_for_timeout(600); pg.screenshot(path='test/pg_res.png')
    E("window.__DL.UI.closeModal()")
    print('stats', E("JSON.stringify({f:window.__DL.SAVE.data.stats.finishes, ta:window.__DL.SAVE.data.stats.taRuns})"))
    ups=E("(()=>{ const u = addXp(60000,'test'); return u.map(x=>x.L) })()") if False else None
    E("window.__DL.UI._runId++; window.__DL.UI.showResults({mode:'touge', mapId:'akigiri', car:'ak_kiri', time:120, laps:[], maxSpeed:150, reason:'goal', score:1500000, dist:5000, drifts:300, maxCombo:12, cfg:{mode:'touge', mapId:'akigiri'}})")
    pg.wait_for_timeout(2600); pg.screenshot(path='test/pg_lvup.png')
    print('lvup shown', E("document.getElementById('lvUp') && document.getElementById('lvUp').classList.contains('show')"), 'level', lv0, '->', E("window.__DL.SAVE.level()"), 'claims', E("Object.keys(window.__DL.SAVE.data.lvClaim||{}).length"))
    E("document.querySelector('#lvUp [data-l]') && document.querySelector('#lvUp [data-l]').click()"); E("window.__DL.UI.closeModal()")
    E("window.__DL.UI.open('profile')"); pg.wait_for_timeout(500); pg.screenshot(path='test/pg_prof.png')
    E("window.__DL.UI.open('ach')"); pg.wait_for_timeout(300); E("window.__DL.UI.a_achAll()"); pg.wait_for_timeout(300)
    E("window.__DL.UI.open('garage')"); pg.wait_for_timeout(300); print('garage bar', E("!!document.getElementById('lvbG')"))
    xp1=E("window.__DL.SAVE.data.xp"); lv1=E("window.__DL.SAVE.level()"); E("window.__DL.SAVE.save(true)")
    pg.reload(); pg.wait_for_timeout(900)
    print('after reload', E("window.__DL.SAVE.data.xp")==xp1, E("window.__DL.SAVE.level()")==lv1, 'ach claimed', E("Object.keys(window.__DL.SAVE.data.achClaim||{}).length"))
    print(errs[:5]); b.close()
