import subprocess, pathlib
subprocess.run(['python3','build.py'],check=True,capture_output=True)
s=pathlib.Path('dist/index.html').read_text()
shim=pathlib.Path('src/fbshim.js').read_text()
s=s.replace('<head>','<head>\n<script>document.write(\'<script src="firebase-config.js?t=\' + Date.now() + \'"><\\/script>\');</script>\n<script>\n'+shim+'\n</script>',1)
import time, json
head='<link rel="manifest" href="manifest.webmanifest">\n<meta name="theme-color" content="#0c0d10">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="DRIFT LEGENDS">\n<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n'
s=s.replace('<head>','<head>\n'+head,1)
out=pathlib.Path('gh_out'); out.mkdir(exist_ok=True)
ver=time.strftime('%Y%m%d%H%M%S')
(out/'manifest.webmanifest').write_text(json.dumps({"name":"DRIFT LEGENDS","short_name":"DRIFT LEGENDS","description":"峠を攻めろ。伝説になれ。ブラウザで遊べる3Dドリフトレース","start_url":"./","scope":"./","display":"fullscreen","orientation":"any","background_color":"#0c0d10","theme_color":"#0c0d10","lang":"ja","icons":[{"src":"icons/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icons/icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icons/icon-512-mask.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},ensure_ascii=False,indent=1))
(out/'sw.js').write_text(pathlib.Path('src/sw.js').read_text().replace('__VER__',ver))
(out/'index.html').write_text(s)
cfg=out/'firebase-config.js'
if not cfg.exists(): cfg.write_text('// Firebase の設定（オンライン対戦・クラウド保存用）\nwindow.FIREBASE_CONFIG = null;\n')
print('ok', len(s))
