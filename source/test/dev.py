from playwright.sync_api import sync_playwright
def mock(owner): return "window.__store={}; window.claude={use:async(n)=>{ if(n==='user') return {id:async()=>'u1', isOwner:()=>%s}; if(n==='db') return {doc:(p)=>({get:async()=>({exists:!!window.__store[p], data:()=>window.__store[p]}), set:async(d)=>{window.__store[p]=d;}})}; return null;}};" % ('true' if owner else 'false')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    errs=[]
    for owner in [True, False]:
        ctx=b.new_context(viewport={'width':1280,'height':720}); pg=ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.add_init_script(mock(owner))
        pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(1200); pg.click('#btnStart'); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
        pg.evaluate("window.__DL.UI.open('settings')"); pg.wait_for_timeout(300)
        has=pg.evaluate("!!document.querySelector('[data-a=setTab][data-v=dev]')"); print('owner',owner,'dev tab',has)
        if has:
            pg.evaluate("document.querySelector('[data-a=setTab][data-v=dev]').click()"); pg.evaluate("document.querySelector('[data-a=devMoney][data-v=\"100000000\"]').click()")
            pg.evaluate("document.querySelector('[data-a=setOpt][data-v=\"devInfinite:true\"]').click()"); pg.wait_for_timeout(300); pg.screenshot(path='dev.png')
            m0=pg.evaluate("window.__DL.SAVE.data.money"); pg.evaluate("window.__DL.UI.open('shop'); window.__DL.UI.tab='EUROPA'; window.__DL.UI.sel='eu_tempesta'; window.__DL.UI.render(); window.__DL.UI.a_buyYes()")
            print('money before/after buying V12:', m0, pg.evaluate("window.__DL.SAVE.data.money"), 'top', pg.evaluate("document.getElementById('tbMoney2').textContent"))
    print('ERR', errs); b.close()
