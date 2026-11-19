from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1280,'height':720}); E=pg.evaluate
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800)
    E("window.__DL.SAVE.data.tutDone=true"); pg.click('#btnStart'); pg.wait_for_timeout(1500); E("window.__DL.UI.closeModal()")
    E("window.__DL.UI.open('maps',{mode:'race'})"); pg.wait_for_timeout(200); E("window.__DL.UI.goMenu()"); pg.wait_for_timeout(800)
    print(E("(()=>{const h=document.querySelector('.nm-hero');const r=h.getBoundingClientRect();const cs=getComputedStyle(h);return [r.x,r.y,r.width,r.height,cs.opacity,cs.display,getComputedStyle(document.getElementById('s-menu')).display, document.getElementById('menuList').children.length, document.getElementById('overlay').className]})()"))
    b.close()
