import http.server, threading, functools, os, shutil
from playwright.sync_api import sync_playwright
os.makedirs('/tmp/ghs2/music', exist_ok=True)
shutil.copy('gh_out/index.html','/tmp/ghs2/index.html')
for f in os.listdir('/home/claude/drift-legends/music'): shutil.copy('/home/claude/drift-legends/music/'+f,'/tmp/ghs2/music/'+f)
open('/tmp/ghs2/firebase-config.js','w').write('window.FIREBASE_CONFIG=null;')
H=functools.partial(http.server.SimpleHTTPRequestHandler, directory='/tmp/ghs2'); H.log_message=lambda *a: None
srv=http.server.ThreadingHTTPServer(('127.0.0.1',8767),H); threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={'width':900,'height':500}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:8767/index.html'); pg.wait_for_timeout(1500); pg.click('#btnStart'); pg.wait_for_timeout(1500)
    E=pg.evaluate; E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI.closeModal()")
    print('playlist', E("JSON.stringify(window.__DL.AUDIO.mp3.list.map(t=>[t.file,t.cat]))"))
    picks=[]
    for i in range(8): E("window.__DL.AUDIO.playCat('race', true)"); picks.append(E("window.__DL.AUDIO.music.track && (window.__DL.AUDIO.music.track.file || window.__DL.AUDIO.music.track.id)"))
    print('race picks', picks)
    E("window.__DL.AUDIO.playCat('xmasRace', true)"); pg.wait_for_timeout(1500); print('xmas', E("window.__DL.AUDIO.mp3.cur && window.__DL.AUDIO.mp3.cur.file"), 'playing', E("!!window.__DL.AUDIO.mp3.el && !window.__DL.AUDIO.mp3.el.paused"), 't', E("window.__DL.AUDIO.mp3.el && window.__DL.AUDIO.mp3.el.currentTime"))
    E("window.__DL.AUDIO.playCat('menu')"); print('menu', E("window.__DL.AUDIO.music.track.id"), 'mp3 stopped', E("!window.__DL.AUDIO.mp3.el"))
    E("window.__DL.UI.open('settings'); window.__DL.UI.a_setTab('sound')"); pg.wait_for_timeout(300); print('sliders', E("[...document.querySelectorAll('[data-in=setVol]')].map(x=>x.dataset.k).join(',')"))
    E("const c=window.__DL.SAVE.newCar('hb_fd'); window.__DL.SAVE.data.cars.push(c); window.__DL.SAVE.data.current=c.uid")
    E("window.__DL.UI.launch({mode:'time',mapId:'circuit',weather:'clear',time:'day',laps:1,carInst:window.__DL.SAVE.cur(),rivals:[]})")
    pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000)
    pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(3000); E("window.__DL.game.camMode=2"); pg.wait_for_timeout(1000); pg.keyboard.up('ArrowUp'); pg.wait_for_timeout(800)
    print('engine', E("(()=>{const e=window.__DL.game.engine; return e && [e.sound, e.turbo, e.MF.lvl, e.P.whistle]})()"), 'race music', E("window.__DL.AUDIO.music.track && (window.__DL.AUDIO.music.track.file||window.__DL.AUDIO.music.track.name)"))
    E("window.__DL.game.finish('goal')"); pg.wait_for_timeout(1500); print('fade', E("window.__DL.AUDIO.musicFade.gain.value.toFixed(2)"))
    print(errs[:5]); b.close()
