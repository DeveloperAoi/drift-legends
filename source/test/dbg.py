from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1280,'height':720}); logs=[]
    pg.on('console', lambda m: logs.append(m.text))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500); pg.click('#btnStart')
    E=pg.evaluate
    E("window.__DL.SAVE.data.event.items.push('livery:candy'); window.__DL.UI.open('tuning',{tab:'paint'})"); pg.wait_for_timeout(300)
    print(E("document.getElementById('panelBody').innerText.slice(0,300)")); print([l for l in logs if 'rror' in l][:5])
    b.close()
