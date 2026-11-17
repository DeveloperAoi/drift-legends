import sys, time
from playwright.sync_api import sync_playwright
url='file:///home/claude/dl/dist/index.html'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={'width':1280,'height':720})
    logs=[]
    pg.on('console', lambda m: logs.append(f'{m.type}: {m.text}'))
    pg.on('pageerror', lambda e: logs.append(f'PAGEERROR: {e}'))
    pg.goto(url); pg.wait_for_timeout(1500)
    pg.screenshot(path='s1_title.png')
    pg.click('#btnStart'); pg.wait_for_timeout(1500)
    pg.screenshot(path='s2_menu.png')
    # close welcome
    pg.evaluate("document.querySelector('[data-a=closeModal]') && document.querySelector('[data-a=closeModal]').click()")
    pg.wait_for_timeout(800); pg.screenshot(path='s3_menu2.png')
    print('\n'.join(logs[:40]))
    b.close()
