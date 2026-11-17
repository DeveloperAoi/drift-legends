from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':700,'height':450}); pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500); pg.click('#btnStart'); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pg.evaluate("window.__DL.UI.screen='ad'; document.getElementById('s-menu').classList.remove('show')")
    for i,(el,rot) in enumerate([(0.75,0.75),(0.1,1.57),(0.3,2.6)]):
        pg.evaluate(f"(()=>{{const D=window.__DL; const inst=D.SAVE.newCar('hk_s3'); inst.look.color='#ffd000'; D.show.setCar(inst,true); D.show.rot={rot}; D.show.elev={el}; D.show.dist=6; D.show.idle=0;}})()")
        pg.wait_for_timeout(600); pg.screenshot(path=f'top{i}.png')
    print(pg.evaluate("(()=>{const m=window.__DL.show.model; return m.body.children.map(c=>c.parts.map(p=>p.mesh.count))})()"))
    b.close()
