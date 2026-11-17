from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg = b.new_page()
    pg.set_content("<canvas id=c></canvas>")
    print(pg.evaluate("(()=>{const c=document.getElementById('c');const g=c.getContext('webgl2');return g?('webgl2 '+g.getParameter(g.VERSION)):'none'})()"))
    b.close()
