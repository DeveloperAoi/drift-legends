import http.server, threading, functools, os, json
from playwright.sync_api import sync_playwright
os.makedirs('/tmp/ghsite', exist_ok=True)
open('/tmp/ghsite/index.html','w').write(open('gh_out/index.html').read())
open('/tmp/ghsite/firebase-config.js','w').write('window.FIREBASE_CONFIG={apiKey:"x",authDomain:"x",databaseURL:"https://x.firebaseio.com",projectId:"x"};')
H=functools.partial(http.server.SimpleHTTPRequestHandler, directory='/tmp/ghsite'); H.log_message=lambda *a: None
srv=http.server.ThreadingHTTPServer(('127.0.0.1',8766),H); threading.Thread(target=srv.serve_forever,daemon=True).start()
MOCK=open('/tmp/fbmock/mock2.js').read()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    ctx=b.new_context(viewport={'width':1000,'height':560})
    ctx.route("https://www.gstatic.com/**", lambda r: r.fulfill(status=200, content_type='application/javascript', body=MOCK if 'app-compat' in r.request.url else '/*noop*/'))
    errs=[]
    def page(nick):
        pg=ctx.new_page(); pg.on('pageerror', lambda e: errs.append(nick+' PAGE '+str(e)))
        pg.goto('http://127.0.0.1:8766/index.html'); pg.wait_for_timeout(2500)
        pg.evaluate("document.getElementById('btnStart').click()"); pg.wait_for_timeout(500); pg.evaluate("window.__DL.UI.closeModal(); window.__DL.SAVE.data.tutDone=true")
        pg.evaluate("window.DL_FB.google()"); pg.wait_for_timeout(800)
        pg.evaluate(f"window.DL_FB.setName('{nick}')"); pg.wait_for_timeout(500)
        pg.evaluate("window.__DL.SAVE.data.money=5000000; window.__DL.SAVE.data.diamonds=1000")
        return pg
    A=page('Aoi'); B=page('Ben'); E=lambda pg,js: pg.evaluate(js)
    print('names', E(A,"window.DL_FB.profile.name"), E(B,"window.DL_FB.profile.name"), E(A,"window.DL_FB.user.uid"), E(B,"window.DL_FB.user.uid"))
    E(A,"window.__DL.UI.open('friends'); window.__DL.UI.a_setTab('add')"); A.wait_for_timeout(800); A.fill('#frName','Ben'); E(A,"window.__DL.UI.a_frSend()"); A.wait_for_timeout(800)
    E(B,"window.__DL.UI.open('friends'); window.__DL.UI.a_setTab('req')"); B.wait_for_timeout(1000); B.screenshot(path='test/so_req.png')
    uidA=E(A,"window.DL_FB.user.uid"); E(B,f"window.__DL.UI.a_frOk('{uidA}')"); B.wait_for_timeout(1000)
    print('friendsA', E(A,"JSON.stringify(SOC.friends)") if False else E(A,"Object.values(window.SOC_dbg||{}).length"))
    E(A,"window.__DL.UI.a_setTab('list')"); A.wait_for_timeout(800); A.screenshot(path='test/so_list.png')
    # clan
    E(A,"window.__DL.UI.open('clan')"); A.wait_for_timeout(1000); A.fill('#clanName','NightRunners'); E(A,"window.__DL.UI.a_clanCreate()"); A.wait_for_timeout(300); E(A,"window.__DL.UI.a_buyConfirm()"); A.wait_for_timeout(1500)
    print('A dia after clan', E(A,"window.__DL.SAVE.data.diamonds"))
    E(B,"window.__DL.UI.open('clan')"); B.wait_for_timeout(1500); B.screenshot(path='test/so_clanlist.png')
    E(B,"document.querySelector('[data-a=clanJoin]') && window.__DL.UI.a_clanJoin(document.querySelector('[data-a=clanJoin]').dataset.v)"); B.wait_for_timeout(1500)
    B.fill('#chatIn','こんにちは！'); E(B,"window.__DL.UI.a_chatSend()"); B.wait_for_timeout(600)
    A.fill('#chatIn','ようこそ！'); E(A,"window.__DL.UI.a_chatSend()"); A.wait_for_timeout(1200); A.screenshot(path='test/so_clanA.png'); B.screenshot(path='test/so_clanB.png')
    # trade
    uidB=E(B,"window.DL_FB.user.uid"); E(A,f"window.__DL.UI.a_tradeStart('{uidB}')"); A.wait_for_timeout(1500)
    tid=E(A,"window.__DL.UI.arg && window.__DL.UI.arg.tid"); print('tid', tid)
    A.fill('#trMoney','123000'); E(A,"window.__DL.UI.a_trSetNum()"); A.wait_for_timeout(500)
    item=E(A,"(()=>{const d=window.__DL.SAVE.data; const it=window.__DL.ITEMS.find(i=>i.type!=='car'&&!i.lim); d.inv[it.id]=(d.inv[it.id]||0)+1; return it.id})()")
    E(A,f"window.__DL.UI.a_trAddItem('{item}')"); A.wait_for_timeout(600)
    E(B,f"window.__DL.UI.a_tradeOpen('{tid}')"); B.wait_for_timeout(1200)
    mA=E(A,"window.__DL.SAVE.data.money"); mB=E(B,"window.__DL.SAVE.data.money")
    E(A,"window.__DL.UI.closeModal()"); E(A,"window.__DL.UI.a_trAccept()"); A.wait_for_timeout(700); print('after A acc', E(A,f"JSON.stringify(JSON.parse(localStorage.getItem('fbmock_store')).trades['{tid}'].acc)"), E(A,"document.getElementById('toast').textContent")); E(B,"window.__DL.UI.a_trAccept()"); B.wait_for_timeout(1500); B.screenshot(path='test/so_trade.png')
    A.wait_for_timeout(6000)
    print('money A', mA, '->', E(A,"window.__DL.SAVE.data.money"), ' B', mB, '->', E(B,"window.__DL.SAVE.data.money"), 'B has item', E(B,f"window.__DL.SAVE.data.inv['{item}']"))
    print(errs[:6]); b.close()
