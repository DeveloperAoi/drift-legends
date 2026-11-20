from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1280,'height':680}); errs=[]; pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(300); pg.screenshot(path='test/v310_title.png')
    E=pg.evaluate
    E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI._newsShown=true; window.__DL.UI._logChk=true"); pg.click('#btnStart'); pg.wait_for_timeout(1500); E("window.__DL.UI.closeModal(); window.__DL.SAVE.data.money=5e7; window.__DL.SAVE.data.diamonds=3000; window.__DL.UI.goMenu()")
    pg.wait_for_timeout(600); pg.screenshot(path='test/v310_menu.png'); print('duo', E("!!document.querySelector('.nm-duo .nm-pass')"))
    X="window.__DLX"
    print('season', E(X+".curSeason().id+' '+new Date(window.__DLX.curSeason().end).toISOString()"), E(X+".passSeasons ? 1:0"))
    pg.click('.nm-pass'); pg.wait_for_timeout(700); pg.screenshot(path='test/v310_pass.png')
    print('cells', E("document.querySelectorAll('.lp-cell').length"))
    E("window.__DL.UI.a_passStage()"); pg.wait_for_timeout(200); print('lv after stage', E(X+".passData().xp"))
    pg.click('.lp-cell.free.ready'); pg.wait_for_timeout(300); print('cf', E(X+".passData().cf"))
    E("window.__DL.UI.a_passBuy()"); pg.wait_for_timeout(200); pg.click('[data-a=passBuyGo]'); pg.wait_for_timeout(300); print('prem', E(X+".passData().prem"), E("window.__DL.SAVE.data.diamonds"))
    pg.click('.lp-cell.prem.ready'); pg.wait_for_timeout(300); print('cp', E(X+".passData().cp"))
    pg.click('[data-a=passMis]'); pg.wait_for_timeout(300); pg.screenshot(path='test/v310_mis.png'); print('mis', E("document.querySelectorAll('.pm-row').length"))
    E("window.__DL.SAVE.data.stats.finishes=(window.__DL.SAVE.data.stats.finishes||0)+30; window.__DL.UI.a_passMis()"); pg.wait_for_timeout(200)
    ids=E(X+".passMissions().filter(m=>m.ok).map(m=>m.id)"); print('ok', ids)
    for i in ids: E(f"window.__DL.UI.a_passMisClaim('{i}')")
    print('xp', E(X+".passData().xp")); E("window.__DL.UI.closeModal()")
    # all season rewards valid labels
    print('rw', E("(()=>{const S=[...Array(2)].map((_,i)=>i);return ['s1','s2'].map(()=>0)})()"))
    E("window.__DL.UI.open('devent')"); pg.wait_for_timeout(800); pg.screenshot(path='test/v310_dev.png'); print('dev', E(X+".dailyEvents().map(e=>e.id+':'+e.map+':'+e.goal)"))
    E("window.__DL.UI.open('store')"); pg.wait_for_timeout(300); pg.click('.st-tabs.top [data-v=daily]'); pg.wait_for_timeout(700); pg.screenshot(path='test/v310_shop.png')
    n1=E("[...document.querySelectorAll('.ds-grid .ds-nm')].map(e=>e.textContent).join('|')")
    pg.click('[data-a=dsRefresh]'); pg.wait_for_timeout(400); n2=E("[...document.querySelectorAll('.ds-grid .ds-nm')].map(e=>e.textContent).join('|')")
    print('refresh changed', n1!=n2, E(X+".dsState().n"), E("document.querySelector('.ds-reft').textContent"))
    pg.click('.ds-grid .ds-price:not([disabled])'); pg.wait_for_timeout(300); print('sold', E("document.querySelectorAll('.ds-card.sold').length"))
    pg.click('.ds-side .ds-price'); pg.wait_for_timeout(300)
    # events list
    E("window.__DL.UI.open('events')"); pg.wait_for_timeout(600); pg.screenshot(path='test/v310_events.png')
    # pack pools
    print('pools', E("(()=>{const r={};for(const id of ['free','bronze','silver','gold']){const c=window.__DL.CHESTS?window.__DL.CHESTS.find(x=>x.id===id):null; r[id]=c?new Set(window.__DLX.packPool(c,'C').concat(window.__DLX.packPool(c,'R')).map(i=>i.type)).size:'?'};return r})()"))
    # daily event race run
    E("window.__DL.UI.a_devGo(1)"); pg.wait_for_timeout(3000); E("const g=window.__DL.game; g.drift.score=40000; g.finish('goal')"); pg.wait_for_timeout(3500); pg.screenshot(path='test/v310_res.png'); print('res', E("(document.querySelector('.dv-res')||{}).textContent"), E(X+".devData().done"))
    print(errs[:5]); b.close()
