import sys, time, json
from playwright.sync_api import sync_playwright
url='file:///home/claude/dl/dist/index.html'
mode=sys.argv[1] if len(sys.argv)>1 else 'free'; mapid=sys.argv[2] if len(sys.argv)>2 else 'akigiri'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1280,'height':720})
    logs=[]
    pg.on('console', lambda m: logs.append(f'{m.type}: {m.text}') if m.type in ('error','warning') and 'GL Driver' not in m.text and 'ERR_TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: logs.append(f'PAGEERROR: {e}'))
    pg.goto(url); pg.wait_for_timeout(800)
    pg.click('#btnStart'); pg.wait_for_timeout(500)
    pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    pg.click(f'[data-m={mode}]'); pg.wait_for_timeout(1500)
    pg.screenshot(path=f'r_{mode}_maps.png')
    pg.evaluate(f"document.querySelector('[data-a=selMap][data-v={mapid}]').click()"); pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('[data-a=toCarSel]').click()"); pg.wait_for_timeout(600)
    pg.screenshot(path=f'r_{mode}_car.png')
    t0=time.time()
    pg.evaluate("document.querySelector('[data-a=startRace]').click()"); 
    pg.wait_for_function("window.__DL.game.active", timeout=60000)
    print('load time', round(time.time()-t0,2))
    pg.wait_for_timeout(4500)
    pg.screenshot(path=f'r_{mode}_start.png')
    pg.keyboard.down('KeyW'); pg.wait_for_timeout(5000)
    pg.screenshot(path=f'r_{mode}_run1.png')
    st=pg.evaluate("(()=>{const g=window.__DL.game;return {spd:g.veh.speed*3.6, gear:g.veh.gear, rpm:g.veh.rpm, lat:g.loc.lat, prog:g.loc.prog, fps:window.__DL.UI.fps, draws:window.__DL.R.stats.draws}})()")
    print(json.dumps(st))
    pg.keyboard.down('KeyD'); pg.keyboard.down('Space'); pg.wait_for_timeout(500); pg.keyboard.up('Space'); pg.wait_for_timeout(900)
    pg.screenshot(path=f'r_{mode}_drift.png')
    pg.keyboard.up('KeyD'); pg.keyboard.press('KeyC'); pg.wait_for_timeout(600); pg.screenshot(path=f'r_{mode}_cam1.png')
    pg.keyboard.press('KeyC'); pg.wait_for_timeout(600); pg.screenshot(path=f'r_{mode}_cam2.png')
    pg.keyboard.press('KeyC'); pg.keyboard.press('KeyC'); pg.wait_for_timeout(1500); pg.screenshot(path=f'r_{mode}_cam4.png')
    pg.keyboard.up('KeyW')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(500); pg.screenshot(path=f'r_{mode}_pause.png')
    print('\n'.join(logs[:30]))
    b.close()
