from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1280,'height':680}); errs=[]; pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500); E=pg.evaluate; X="window.__DLX"
    E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI._newsShown=true; window.__DL.UI._logChk=true"); pg.click('#btnStart'); pg.wait_for_timeout(1500); E("window.__DL.UI.closeModal(); window.__DL.SAVE.data.money=2e8; window.__DL.SAVE.data.diamonds=9000")
    print('gift pool', E("(()=>{const c=window.__DLX.CHESTS.find(x=>x.id==='giftbox');const r={};['U','R','E','L'].forEach(k=>r[k]=window.__DLX.packPool(c,k).length);return r})()"))
    E("window.__DL.UI.open('store'); window.__DL.UI.stTab='xmas'; window.__DL.UI.render()"); pg.wait_for_timeout(900); pg.screenshot(path='test/v330_xshop.png'); print('xs cards', E("document.querySelectorAll('.xs-card').length"), 'xmas tab', E("!!document.querySelector('.st-xmas')"), 'gift in packs list?')
    pg.click('[data-a=xsBuy][data-v=xs1]'); pg.wait_for_timeout(300); pg.click('[data-a=xsGo][data-v=\"xs1:open\"]'); pg.wait_for_timeout(1500); pg.screenshot(path='test/v330_gift0.png')
    pg.mouse.move(900,200); pg.wait_for_timeout(300); pg.click('.pfx-open'); 
    for t in [500,500,400,500]: pg.wait_for_timeout(t); pg.screenshot(path=f'test/v330_gift_{t}_{int(pg.evaluate("Date.now()")%1000)}.png')
    pg.wait_for_timeout(1500); pg.mouse.move(300,500); pg.wait_for_timeout(300); pg.screenshot(path='test/v330_card3d.png'); print('cards', E("document.querySelectorAll('.cardx').length"))
    E("window.__DLX.PACKFX.summary(true); window.__DLX.PACKFX.close()"); pg.wait_for_timeout(300)
    E("window.__DL.UI.stTab='packs'; window.__DL.UI.render()"); pg.wait_for_timeout(500); print('giftbox hidden in packs', not E("!!document.querySelector('.ps-card[data-v=giftbox]')"))
    # gifts with time shift
    E("(()=>{const S=window.__DLX.SRV; S._now=S.now; S.now=()=>Date.parse('2026-12-25T10:00:00+09:00');})()")
    print('pending', E(X+".giftsPending().map(g=>g.id)"))
    E("window.__DL.UI.goMenu()"); pg.wait_for_timeout(1800); pg.screenshot(path='test/v330_menu_gift.png'); print('popup', E("!!document.querySelector('.gf-pop')"), 'banner', E("!!document.querySelector('.nm-gift')"))
    E("(window.__DLX.ACQ&&window.__DLX.ACQ.close&&window.__DLX.ACQ.close(),document.getElementById('acqFx')&&document.getElementById('acqFx').remove(),0)"); pg.click('[data-a=giftClaim]'); pg.wait_for_timeout(400); print('unopened gift', E("window.__DL.SAVE.data.unopened.packs.giftbox"), 'pending', E(X+".giftsPending().length"))
    # server gift simulation
    E("window.__DLX.GIFTS.srv={g1:{title:'テスト配布',msg:'hi',items:[{k:'money',a:500000,n:1},{k:'dia',a:50,n:1},{k:'cards',a:'nn_oni',n:5}],start:Date.parse('2026-12-24T00:00:00+09:00'),end:Date.parse('2026-12-30T00:00:00+09:00'),active:true}}")
    E("window.__DL.UI.open('gifts')"); pg.wait_for_timeout(1200); E("window.__DL.UI.closeModal()"); pg.wait_for_timeout(300); pg.screenshot(path='test/v330_gifts.png'); m=E("window.__DL.SAVE.data.money"); E("(window.__DLX.ACQ&&window.__DLX.ACQ.close&&window.__DLX.ACQ.close(),document.getElementById('acqFx')&&document.getElementById('acqFx').remove(),0)"); pg.click('[data-a=giftClaim]'); pg.wait_for_timeout(300); print('srv gift money', E("window.__DL.SAVE.data.money")-m, E("window.__DL.SAVE.data.carCards.nn_oni"))
    # eve event
    E("(()=>{const S=window.__DLX.SRV; S.now=()=>Date.parse('2026-12-24T10:00:00+09:00');})()"); print('eve', E("window.__DLX.evState(window.__DLX.EVENTS.find(e=>e.id==='xmaseve2026'))"))
    E("window.__DL.UI.open('evDetail',{id:'xmaseve2026'})"); pg.wait_for_timeout(600); pg.screenshot(path='test/v330_eve.png')
    E("(()=>{const S=window.__DLX.SRV; S.now=S._now;})()")
    # garage parts
    E("window.__DL.UI.open('garage')"); pg.wait_for_timeout(400); pg.click('[data-a=gTab][data-v=parts]'); pg.wait_for_timeout(500); pg.screenshot(path='test/v330_garage.png'); print('parts in garage', E("document.getElementById('panelTitle').textContent"), E("document.querySelectorAll('.pcard').length"))
    E("window.__DL.UI.open('pshop')"); pg.wait_for_timeout(300); print('pshop redirect', E("window.__DL.UI.screen"), E("window.__DL.UI.gTab"))
    E("window.__DL.UI.goMenu()"); pg.wait_for_timeout(400); print('pshop pill gone', E("!document.querySelector('#menuList [data-m=pshop]')"))
    E("window.__DL.UI.open('bag')"); pg.wait_for_timeout(700); pg.screenshot(path='test/v330_bag.png'); pg.click('.bp-tabs [data-v=cons]'); pg.wait_for_timeout(400); pg.screenshot(path='test/v330_bag2.png')
    print(errs[:5]); b.close()
