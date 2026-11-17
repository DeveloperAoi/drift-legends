from playwright.sync_api import sync_playwright
MOCK="""window.__store={}; window.claude={use:async(n)=>{ if(n==='user') return {id:async()=>'u123'}; if(n==='db') return {doc:(p)=>({get:async()=>({exists:!!window.__store[p], data:()=>window.__store[p]}), set:async(d)=>{window.__store[p]=JSON.parse(JSON.stringify(d));}})}; return null;}};"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    ctx=b.new_context(viewport={'width':1280,'height':720}); errs=[]
    pg=ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script(MOCK)
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(1500)
    pg.click('#btnStart'); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()"); pg.wait_for_timeout(500)
    pg.evaluate("window.__DL.SAVE.data.money=7777777; window.__DL.SAVE.save()"); pg.wait_for_timeout(3500)
    print('status:', pg.evaluate("document.getElementById('saveSt').textContent"))
    store=pg.evaluate("Object.keys(window.__store)"); print('cloud keys', store, 'cloud money', pg.evaluate("JSON.parse(window.__store['data/users/u123/save'].json).money"))
    cloud=pg.evaluate("window.__store")
    # new device: empty local, cloud has newer data
    ctx2=b.new_context(viewport={'width':1280,'height':720}); pg2=ctx2.new_page(); pg2.on('pageerror', lambda e: errs.append(str(e)))
    import json
    pg2.add_init_script(MOCK.replace("window.__store={}", "window.__store="+json.dumps(cloud)))
    pg2.goto('file:///home/claude/dl/dist/index.html'); pg2.wait_for_timeout(2000)
    print('device2 money', pg2.evaluate("window.__DL.SAVE.data.money"))
    pg2.click('#btnStart'); pg2.wait_for_timeout(600); pg2.evaluate("window.__DL.UI.open('settings'); window.__DL.UI.tab='data'; window.__DL.UI.render()"); pg2.wait_for_timeout(400); pg2.screenshot(path='save_settings.png')
    print('ERR', errs); b.close()
