from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={'width':960,'height':540}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_TUNNEL' not in m.text else None)
    pg.goto('file:///home/claude/dl/dist/ad3d.html'); pg.wait_for_timeout(800); pg.screenshot(path='ad_start.png'); pg.click('#adStart button')
    t0=pg.evaluate("performance.now()/1000")
    for t in [9,15.5,17.5,19.5,30]:
        pg.wait_for_function(f"performance.now()/1000>{t0+t}", timeout=90000); pg.screenshot(path=f'ad_{t}.png')
    print('audio', pg.evaluate("[window.__DL.AUDIO.ok, window.__DL.AUDIO.music.track&&window.__DL.AUDIO.music.track.name]"), errs[:8]); b.close()
