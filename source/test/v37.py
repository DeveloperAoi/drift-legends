from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1280,'height':680}); errs=[]; pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); E=pg.evaluate
    E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI._newsShown=true; window.__DL.UI._logChk=true"); pg.click('#btnStart'); pg.wait_for_timeout(1200); E("window.__DL.UI.closeModal(); window.__DL.SAVE.data.money=5e7")
    E("window.__DL.UI.open('store')"); pg.wait_for_timeout(300); pg.click('.st-tabs.top [data-v=packs]'); pg.wait_for_timeout(900); pg.screenshot(path='test/v37_packs.png')
    print('tabs', E("[...document.querySelectorAll('.st-tabs.top button')].map(b=>b.dataset.v+(b.classList.contains('on')?'*':'')).join(' ')"), 'timers', E("[...document.querySelectorAll('.ps-timer')].map(e=>e.textContent)"))
    pg.click('.ps-card[data-v=xmaspack]'); pg.wait_for_timeout(900); pg.screenshot(path='test/v37_detail.png')
    pg.click('[data-a=psOdds]'); pg.wait_for_timeout(200); print('odds shown', E("!!document.querySelector('.pd-note .odds')"))
    m=E("window.__DL.SAVE.data.money"); pg.click('[data-a=psBuy][data-v=\"xmaspack:5\"]'); pg.wait_for_timeout(600); print('bought 5', m-E("window.__DL.SAVE.data.money"), E("window.__DL.SAVE.data.packLog[0].items.length"))
    E("(()=>{const P=document.getElementById('packFx'); P.className=''; P.innerHTML='';})()")
    pg.click('.st-tabs.top [data-v=offers]'); pg.wait_for_timeout(300); print('box in offers', E("!!document.querySelector('[data-a=stBox]')"))
    print(errs[:4]); b.close()
