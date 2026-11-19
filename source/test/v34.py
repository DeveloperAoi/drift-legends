from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    errs=[]
    for vw,vh,nm in [(1280,720,'pc'),(844,390,'phone')]:
        pg=b.new_page(viewport={'width':vw,'height':vh}); pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
        pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); E=pg.evaluate
        E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI._newsShown=true; window.__DL.UI._logChk=true"); pg.click('#btnStart'); pg.wait_for_timeout(1500); E("window.__DL.UI.closeModal()"); pg.wait_for_timeout(600)
        pg.screenshot(path=f'test/v34_menu_{nm}.png')
        if nm=='pc':
            pg.click('.nm-card[data-m=race]'); pg.wait_for_timeout(300); print('race card ->', E("window.__DL.UI.screen+':'+window.__DL.UI.arg.mode")); E("window.__DL.UI.goMenu()"); pg.wait_for_timeout(300)
            pg.click('.nm-hero'); pg.wait_for_timeout(300); print('hero ->', E("window.__DL.UI.screen")); E("window.__DL.UI.goMenu()"); pg.wait_for_timeout(300)
            pg.click('.nm-pill[data-m=chest]'); pg.wait_for_timeout(500); print('xmas pack visible', E("!!document.querySelector('.xp-ban')"), E("[...document.querySelectorAll('[data-a=openChest]')].map(e=>e.dataset.v).filter(v=>v.startsWith('xmas')).length"))
            print('prof tab gone', not E("!!document.querySelector('[data-a=setTab][data-v=prof]')"))
            E("window.__DL.SAVE.data.money=1e8"); E("window.__DL.UI.a_openChest('xmaspack:10')"); pg.wait_for_timeout(400); print('xmas pack items', E("window.__DL.SAVE.data.packLog[0].items.map(x=>x[0])"))
            E("(()=>{const P=document.getElementById('packFx'); P.className=''; P.innerHTML='';})()")
            E("window.__DL.UI.a_openChest('legend:10')"); pg.wait_for_timeout(300); print('legend has xmas?', E("window.__DL.SAVE.data.packLog[0].items.some(x=>/x_|pfx|pex|pbx|ttx|xc_/.test(x[0]))"))
            E("(()=>{const P=document.getElementById('packFx'); P.className=''; P.innerHTML='';})()")
            print('daily has prof', E("(()=>{let n=0;for(let d=1;d<28;d++){const k='2026-12-'+String(d).padStart(2,'0'); n+=window.__DL.ITEMS && 0;} return n})()"))
            E("window.__DL.UI.open('settings'); window.__DL.UI.tab='sound'; window.__DL.UI.render()"); pg.wait_for_timeout(300); print('mp3 section', E("document.getElementById('panelBody').innerText.includes('追加した曲')"))
            E("(()=>{window.__DL.SAVE.data.inv.pfx_3=1; window.__DL.SAVE.data.prof={frame:'pfx_3'}; window.__DL.UI.open('profile')})()"); pg.wait_for_timeout(500); pg.screenshot(path='test/v34_prof.png')
        pg.close()
    print(errs[:5]); b.close()
