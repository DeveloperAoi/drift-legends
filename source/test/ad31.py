from playwright.sync_api import sync_playwright
import sys
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={'width':960,'height':540}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_TUNNEL' not in m.text else None)
    pg.goto('file:///home/claude/dl/dist/ad_v30full.html'); pg.wait_for_timeout(2500); pg.screenshot(path='test/a31_start.png'); pg.click('#adStart button')
    t0=pg.evaluate("performance.now()/1000")
    for t in [29,33,46.5]:
        pg.wait_for_function(f"performance.now()/1000>{t0+t}", timeout=120000, polling=100); pg.screenshot(path=f'test/a31_{t}.png')
    print(errs[:8]); b.close()
