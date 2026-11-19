from playwright.sync_api import sync_playwright
import json,sys
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':320,'height':200}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(500)
    r=pg.evaluate("""()=>{const D=window.__DL,out=[]; for(const m of D.MAPS){ const t=new D.Track(m); const n=t.n; let fold=0,maxK=0,minC=1e9,maxS=0,minRelSep=1e9;
      for(let i=0;i<n;i++){const k=Math.abs(t.K[i]); maxK=Math.max(maxK,k); if(k*t.wall>0.75) fold++; minC=Math.min(minC,t.clearL[i],t.clearR[i]); maxS=Math.max(maxS,Math.abs(t.SL[i]));}
      // vertical overlap: points close in xz but far in index
      let ov=0; for(let i=0;i<n;i+=3) for(let j=i+60;j<n;j+=3){ if(n-(j-i)<60) continue; const dx=t.X[i]-t.X[j],dz=t.Z[i]-t.Z[j]; const d=Math.hypot(dx,dz); if(d<t.wall*2+1){ ov++; } }
      out.push([m.id,m.env,t.fallback?'FALLBACK':'ok',t.attempts,Math.round(t.length),fold,(1/maxK).toFixed(1),minC.toFixed(1),maxS.toFixed(3),ov,t.corners.length]);} return out;}""")
    for x in r: print(*x)
    print(errs[:3]); b.close()
