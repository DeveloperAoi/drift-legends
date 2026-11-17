from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':900,'height':500}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); pg.click('#btnStart'); pg.wait_for_timeout(300); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
    E=pg.evaluate; U="window.__DL.UI"
    E("window.__DL.SAVE.data.money=50000000; window.__DL.SAVE.data.diamonds=500; window.__DL.SAVE.data.tutDone=true"); pg.wait_for_timeout(1200); E("window.__DL.UI.closeModal()")
    E(f"{U}.open('pshop'); {U}.tab='body'; {U}.render()"); pg.wait_for_timeout(300)
    m0=E("window.__DL.SAVE.data.money")
    pg.click("[data-a=lookOpt][data-v='wing:14']"); pg.wait_for_timeout(700)
    print('bar shown', E("document.getElementById('buyBar').classList.contains('show')"), E("document.getElementById('buyBar').innerText.replace(/\\n/g,' | ')"))
    print('money unchanged', E("window.__DL.SAVE.data.money")==m0, 'look wing', E("window.__DL.SAVE.cur().look.wing"), 'preview wing', E("window.__DL.show.model && window.__DL.UI.pv && window.__DL.UI.pv.preview.look.wing"))
    pg.screenshot(path='test/v23u_prev.png')
    pg.click("#buyBar [data-a=buyCancel]"); pg.wait_for_timeout(300); print('after cancel wing', E("window.__DL.SAVE.cur().look.wing"), 'money', E("window.__DL.SAVE.data.money")==m0)
    pg.click("[data-a=lookOpt][data-v='wing:14']"); pg.wait_for_timeout(400); pg.click("#buyBar [data-a=buyConfirm]"); pg.wait_for_timeout(400)
    print('after confirm wing', E("window.__DL.SAVE.cur().look.wing"), 'spent', m0-E("window.__DL.SAVE.data.money"))
    # kit preview
    pg.click("[data-a=buyKit][data-v=gt]"); pg.wait_for_timeout(400); print('kit bar', E("document.getElementById('buyBar').innerText.replace(/\\n/g,' | ')")); pg.click("#buyBar [data-a=buyConfirm]"); pg.wait_for_timeout(300); print('kit wing', E("window.__DL.SAVE.cur().look.wing"))
    # extras
    E(f"{U}.tab='extra'; {U}.render()"); pg.wait_for_timeout(200)
    pg.click("[data-a=unlockExSlot]"); pg.wait_for_timeout(300); print('slot bar', E("document.getElementById('buyBar').innerText.replace(/\\n/g,' | ')")); pg.click("#buyBar [data-a=buyConfirm]"); pg.wait_for_timeout(300)
    print('slot2', E("window.__DL.SAVE.data.exSlot2"), 'dia', E("window.__DL.SAVE.data.diamonds"))
    E(f"{U}.exSlot=1; {U}.a_setExtra && 0"); pg.click("[data-a=exSlot][data-v='1']"); pg.wait_for_timeout(200)
    pg.click("[data-a=setExtra][data-v=jet]"); pg.wait_for_timeout(300); pg.click("#buyBar [data-a=buyConfirm]"); pg.wait_for_timeout(300)
    pg.click("[data-a=exSlot][data-v='2']"); pg.wait_for_timeout(200)
    pg.click("[data-a=setExtra][data-v=fireworks]"); pg.wait_for_timeout(300)
    if E("document.getElementById('buyBar').classList.contains('show')"): pg.click("#buyBar [data-a=buyConfirm]"); pg.wait_for_timeout(300)
    print('extras', E("JSON.stringify([window.__DL.SAVE.cur().look.extra, window.__DL.SAVE.cur().look.extra2])"))
    pg.screenshot(path='test/v23u_extra.png')
    # chest confirm
    E(f"{U}.open('chest'); {U}.render()"); pg.wait_for_timeout(200)
    E(f"{U}.onAction({{target: Object.assign(document.createElement('button'),{{dataset:{{a:'openChest',v:'gold:3'}}}})}})") if False else None
    # race with two extras
    E("window.__DL.UI.launch({mode:'free',mapId:'jumppark',weather:'clear',time:'day',laps:1,carInst:window.__DL.SAVE.cur(),rivals:[]})")
    pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000)
    print('game extras', E("window.__DL.game.extras.map(e=>e.id).join(',')"))
    pg.keyboard.down('ArrowUp'); pg.keyboard.down('Shift'); pg.wait_for_timeout(2500); pg.keyboard.up('Shift'); pg.keyboard.up('ArrowUp')
    print(errs[:5]); b.close()
