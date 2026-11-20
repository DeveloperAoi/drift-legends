from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1280,'height':680}); errs=[]; pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500); E=pg.evaluate; X="window.__DLX"
    E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI._newsShown=true; window.__DL.UI._logChk=true"); pg.click('#btnStart'); pg.wait_for_timeout(1500); E("window.__DL.UI.closeModal(); window.__DL.SAVE.data.money=2e8; window.__DL.SAVE.data.diamonds=5000")
    print('items', E("window.__DL.ITEMS.length"), 'neon open', E(X+".neonOpen()"))
    E("window.__DL.UI.open('store')"); pg.wait_for_timeout(900); pg.screenshot(path='test/v320_offers.png'); print('offer cards', E("document.querySelectorAll('.of-card').length"), 'bundles', E("document.querySelectorAll('[data-a=stBundle]').length"))
    pg.click('.of-card:nth-child(2) .of-buy'); pg.wait_for_timeout(500); pg.screenshot(path='test/v320_offer_md.png')
    pg.click('[data-a=ofBuy]'); pg.wait_for_timeout(600); print('oni cards', E("window.__DL.SAVE.data.carCards.nn_oni"), 'cnt', E(X+".offerCnt(window.__DLX.OFFERS[1])"))
    E("(()=>{const P=document.getElementById('packFx'); if(P){P.className=''; P.innerHTML='';}})()")
    E("window.__DL.UI.a_ofOpen('o_relay')"); pg.wait_for_timeout(200); pg.click('[data-a=ofBuy]'); pg.wait_for_timeout(800); print('relay packfx', E("document.getElementById('packFx').className"))
    E("(()=>{const P=document.getElementById('packFx'); if(P){P.className=''; P.innerHTML='';}})()")
    # neon pack pool
    print('neon pool', E("(()=>{const c=window.__DLX.CHESTS.find(x=>x.id==='neonpack');const r={};['R','E','L'].forEach(k=>r[k]=window.__DLX.packPool(c,k).length);return r})()"), 'gold has neon', E("(()=>{const c=window.__DLX.CHESTS.find(x=>x.id==='gold');return ['C','U','R','E','L'].some(k=>window.__DLX.packPool(c,k).some(i=>i.neon))})()"))
    E("window.__DL.UI.stTab='packs';window.__DL.UI.render()"); pg.wait_for_timeout(700); pg.screenshot(path='test/v320_packs.png'); print('neon in store', E("!!document.querySelector('.ps-card[data-v=neonpack]')"))
    pg.click('.ps-card[data-v=neonpack]'); pg.wait_for_timeout(700); pg.screenshot(path='test/v320_neondetail.png')
    E("window.__DL.UI.closeModal()")
    # tuning preview
    E("window.__DL.UI.open('tuning'); window.__DL.UI.tmode='tune'; window.__DL.UI.tcat=null; window.__DL.UI.render()"); pg.wait_for_timeout(500)
    pg.click('.cat-grid .cat'); pg.wait_for_timeout(500); print('tags', E("document.querySelectorAll('.tp-d').length")); pg.screenshot(path='test/v320_tune.png')
    m=E("window.__DL.SAVE.data.money"); print('first', E("(()=>{const b=[...document.querySelectorAll('[data-a=tuneLv],[data-a=tuneOpt]')].find(x=>x.querySelector('.tp-d'));const v=b.dataset.v;b.click();return v})()")); pg.wait_for_timeout(400); pg.screenshot(path='test/v320_tp.png'); print('modal', E("!!document.querySelector('.tp-tbl')"), 'spent before', m-E("window.__DL.SAVE.data.money"))
    pg.click('[data-a=tpGo]'); pg.wait_for_timeout(400); print('spent', m-E("window.__DL.SAVE.data.money"), E("JSON.stringify(window.__DL.SAVE.cur().tune.owned).slice(0,120)"))
    # car shop
    E("window.__DL.UI.closeModal(); window.__DL.UI.open('shop')"); pg.wait_for_timeout(600); print('new cars', E("['ka_tenma','hk_koma','nn_oni'].map(id=>!!window.__DL.CAR_BY_ID[id])"))
    print(errs[:5]); b.close()
