import subprocess, pathlib
subprocess.run(['python3','build.py'],check=True,capture_output=True)
s=pathlib.Path('dist/index.html').read_text()
shim=pathlib.Path('src/fbshim.js').read_text()
s=s.replace('<head>','<head>\n<script>document.write(\'<script src="firebase-config.js?t=\' + Date.now() + \'"><\\/script>\');</script>\n<script>\n'+shim+'\n</script>',1)
out=pathlib.Path('gh_out'); out.mkdir(exist_ok=True)
(out/'index.html').write_text(s)
cfg=out/'firebase-config.js'
if not cfg.exists(): cfg.write_text('// Firebase の設定（オンライン対戦・クラウド保存用）\nwindow.FIREBASE_CONFIG = null;\n')
print('ok', len(s))
