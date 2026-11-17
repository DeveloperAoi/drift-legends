from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':900,'height':500}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(1200); pg.click('#btnStart'); pg.wait_for_timeout(400)
    E=pg.evaluate; U="window.__DL.UI"; E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI.closeModal()")
    E(f"{U}.open('drag')"); E(f"{U}.a_dragGo()"); pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000)
    pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(3000); E("window.__DL.game.totalDist=401.9"); pg.wait_for_timeout(5000); pg.keyboard.up('ArrowUp')
    print('res', E("document.querySelector('.modal') && document.querySelector('.modal').innerText.slice(0,200)"))
    E(f"{U}.a_resNext()"); pg.wait_for_timeout(800); print('screen', E(f"{U}.screen"))
    # story S2 level 1 win
    E("window.__DL.SAVE.data.story.cleared=[1,2,3,4,5,6,7,8,9,101,102]")
    E(f"{U}.showResults({{mode:'story', mapId:'kirisame', car:'ak_kiri', time:90, laps:[], maxSpeed:150, reason:'goal', cfg:{{mode:'story', story:103, mapId:'kirisame'}}, win:true, rivalTime:95, gap:0}})")
    pg.wait_for_timeout(500); print('story', E("document.querySelector('.modal').innerText.replace(/\\n/g,' ').slice(0,400)"))
    print(errs[:5]); b.close()
