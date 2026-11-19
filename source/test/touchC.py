from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    ctx=b.new_context(viewport={'width':844,'height':390},has_touch=True,is_mobile=True,device_scale_factor=1)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800)
    print('new-save layout', pg.evaluate("window.__DL.SAVE.data.settings.layout"))
    pg.evaluate("window.__DL.SAVE.data.tutDone=true"); pg.tap('#btnStart'); pg.wait_for_timeout(600); pg.evaluate("window.__DL.UI.closeModal()")
    pg.evaluate("(()=>{const D=window.__DL;D.UI.launch({mode:'free',mapId:'myojin',weather:'clear',time:'day',laps:1,carInst:D.SAVE.cur(),rivals:[],startProg:60});})()"); pg.wait_for_timeout(3000)
    rects=pg.evaluate("Object.fromEntries(['tLeft','tRight','tGas','tBrake','tHand','tNitro','tUp','tDown','tCam'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return [id,[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]]}))")
    print(rects)
    ov=[]; ks=list(rects)
    for i in range(len(ks)):
        for j in range(i+1,len(ks)):
            a=rects[ks[i]]; c=rects[ks[j]]
            if a[0]<c[2] and c[0]<a[2] and a[1]<c[3] and c[1]<a[3]: ov.append((ks[i],ks[j]))
    print('overlaps',ov, 'inside', all(r[0]>=0 and r[1]>=0 and r[2]<=844 and r[3]<=390 for r in rects.values()))
    cdp=ctx.new_cdp_session(pg)
    c=lambda k:[(rects[k][0]+rects[k][2])/2,(rects[k][1]+rects[k][3])/2]
    def touch(typ,pts): cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in pts]})
    st=lambda: pg.evaluate("(()=>{const t=window.__DL.Input.touch;return ['left','right','gas','brake'].filter(k=>t[k]).join('+')})()")
    touch('touchStart',[(1,c('tGas'))]); print('gas', st())
    touch('touchStart',[(1,c('tGas')),(2,c('tLeft'))]); print('gas+left', st())
    pg.wait_for_timeout(4000)
    print('moving', round(pg.evaluate("window.__DL.game.veh.speed"),1), 'steer', round(pg.evaluate("window.__DL.game.veh.steer||0"),2))
    touch('touchEnd',[(1,c('tGas'))]); print('left only after gas release', st())
    touch('touchStart',[(2,c('tLeft')),(3,c('tBrake'))]); print('left+brake', st())
    touch('touchEnd',[(2,c('tLeft'))]); touch('touchStart',[(3,c('tBrake')),(4,c('tRight')),(5,c('tGas'))]); print('right+gas+brake', st())
    touch('touchEnd',[(3,c('tBrake')),(4,c('tRight')),(5,c('tGas'))]); print('all released', repr(st()))
    pg.screenshot(path='test/touchC.png'); print(errs[:3]); b.close()
