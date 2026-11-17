import sys
from playwright.sync_api import sync_playwright
MOCK="""window.__store={}; window.claude={use:async(n)=>{ if(n==='user') return {id:async()=>'u1', isOwner:()=>true}; if(n==='db') return {doc:(p)=>({get:async()=>({exists:!!window.__store[p], data:()=>window.__store[p]}), set:async(d)=>{window.__store[p]=d;}})}; return null;}};"""
mobile=sys.argv[1]=='m'; mapid=sys.argv[2]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    ctx=b.new_context(viewport={'width':844,'height':390} if mobile else {'width':1000,'height':560}, has_touch=mobile, is_mobile=mobile)
    pg=ctx.new_page(); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e))); pg.on('console', lambda m: errs.append(m.text[:400]) if m.type=='error' and 'ERR_TUNNEL' not in m.text else None)
    pg.add_init_script(MOCK); pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(1200)
    pg.click('#btnStart'); pg.wait_for_timeout(300); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pg.evaluate("const D=window.__DL; D.SAVE.data.story.cleared=[1,2,3,4,5,6,7,8,9]; D.SAVE.data.xp=99999; D.SAVE.data.settings.devInfinite=true")
    pg.click('[data-m=touge]'); pg.wait_for_timeout(1500)
    pg.evaluate(f"document.querySelector('[data-a=selMap][data-v={mapid}]').click()"); pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('[data-a=toCarSel]').click()"); pg.wait_for_timeout(500)
    pg.evaluate("document.querySelector('[data-a=startRace]').click()"); pg.wait_for_timeout(9000)
    pg.keyboard.down('KeyW'); 
    for i in range(6):
        pg.keyboard.down('KeyD'); pg.keyboard.down('Space'); pg.wait_for_timeout(600); pg.keyboard.up('Space'); pg.wait_for_timeout(1500); pg.keyboard.up('KeyD'); pg.wait_for_timeout(800)
    print(mapid, 'active', pg.evaluate("window.__DL.game.active"), 'screen', pg.evaluate("window.__DL.UI.screen"), 'toast', pg.evaluate("document.getElementById('toast').textContent"))
    print('ERR', errs[:6]); pg.screenshot(path=f'tg_{mapid}.png'); b.close()
