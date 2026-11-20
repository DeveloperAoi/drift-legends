from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1280,'height':700}); errs=[]; pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); E=pg.evaluate
    E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI._newsShown=true; window.__DL.UI._logChk=true"); pg.click('#btnStart'); pg.wait_for_timeout(1200); E("window.__DL.UI.closeModal(); window.__DL.SAVE.data.money=9e9")
    E("window.__DL.UI.open('store')"); pg.wait_for_timeout(900); pg.evaluate("document.querySelector('.st-row').scrollLeft=99999"); pg.wait_for_timeout(500); pg.screenshot(path='test/v40_store.png')
    E("window.__DL.UI.a_stBox('gold')"); pg.wait_for_timeout(500); pg.screenshot(path='test/v40_modal.png')
    pg.click('[data-a=stBoxBuy][data-v=\"gold:save\"]'); pg.wait_for_timeout(300); print('saved', E("JSON.stringify(window.__DLX.unopened())"))
    E("window.__DL.UI.a_stBox('legend')"); pg.wait_for_timeout(300); pg.click('[data-a=stBoxBuy][data-v=\"legend:open\"]'); pg.wait_for_timeout(1200); pg.screenshot(path='test/v40_fx1.png')
    pg.click('#boxFx', position={'x':640,'y':330}); pg.wait_for_timeout(1500); pg.screenshot(path='test/v40_fx2.png'); pg.wait_for_timeout(1700); pg.screenshot(path='test/v40_fx3.png')
    pg.click('[data-b=save]'); pg.wait_for_timeout(300); print('after save', E("JSON.stringify(window.__DLX.unopened())"))
    E("window.__DL.UI.a_stTab('inv')"); pg.wait_for_timeout(600); pg.screenshot(path='test/v40_inv.png')
    pg.click('[data-a=invPackOpen][data-v=\"legend:all\"]'); pg.wait_for_timeout(600); print('opened', E("window.__DL.SAVE.data.packLog[0].items.length"), E("document.getElementById('packFx').className"), E("JSON.stringify(window.__DLX.unopened())"))
    E("(()=>{const P=document.getElementById('packFx'); P.className=''; P.innerHTML='';})()")
    pg.click('[data-a=invBoxOpen][data-v=gold]'); pg.wait_for_timeout(900); print('box fx from inv', E("document.getElementById('boxFx').className"))
    print(errs[:4]); b.close()
