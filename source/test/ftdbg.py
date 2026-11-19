from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(); pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800)
    print(pg.evaluate("(()=>{const D=window.__DL,U=D.UI;const b=D.SAVE.newCar('ak_kiri');const s=U.instSpec(b);const s2=U.instSpec(D.SAVE.cur());return [s.power,s.top,s2.power,Object.keys(s).filter(k=>typeof s[k]==='number'&&!isFinite(s[k])).join(),JSON.stringify(b.tune).slice(0,300)]})()"))
    print(pg.evaluate("""(()=>{const D=window.__DL,U=D.UI; const out=[]; const base=D.SAVE.newCar('ak_kiri'); const P=Object.keys(base.tune);
      const inst=JSON.parse(JSON.stringify(base)); window.__DLX.fullTune(inst); const diff=Object.keys(inst.tune).filter(k=>JSON.stringify(inst.tune[k])!==JSON.stringify(base.tune[k]));
      for(const k of diff){ const c=JSON.parse(JSON.stringify(base)); c.tune[k]=inst.tune[k]; const s=U.instSpec(c); if(!isFinite(s.power)) out.push(k+'='+JSON.stringify(inst.tune[k])); }
      return [diff.join(','), out.join(' | ')];})()"""))
    b.close()
