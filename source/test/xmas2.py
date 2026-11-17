from playwright.sync_api import sync_playwright
import datetime
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    errs=[]
    for tag,vp,when in [('m',{'width':844,'height':390},'2026-12-05T10:00:00+09:00'),('d',{'width':1280,'height':720},'2026-11-16T20:00:00+09:00')]:
        ctx=b.new_context(viewport=vp, device_scale_factor=2 if tag=='m' else 1, has_touch=(tag=='m'), is_mobile=(tag=='m'))
        pg=ctx.new_page(); pg.on('pageerror', lambda e: errs.append(tag+' '+str(e)))
        pg.clock.install(time=datetime.datetime.fromisoformat(when)); 
        pg.goto('file:///home/claude/dl/dist/index.html'); pg.clock.run_for(3000); pg.wait_for_timeout(2500)
        E=pg.evaluate
        E("document.getElementById('btnStart').click()"); pg.wait_for_timeout(300); E("window.__DL.UI.closeModal()"); pg.wait_for_timeout(400)
        pg.screenshot(path=f'x2_{tag}_menu.png')
        E("window.__DL.UI.open('advent')"); pg.wait_for_timeout(600); pg.screenshot(path=f'x2_{tag}_adv.png')
        if tag=='m':
            for k in [1,3,5,6]: E(f"window.__DL.UI.a_advOpen({k})"); E("window.__DL.UI.a_closeChest()")
            E("window.__DL.UI.a_advOpen(4)"); pg.wait_for_timeout(1500); pg.screenshot(path='x2_m_advopen.png'); E("window.__DL.UI.a_closeChest()")
            print('opened', E("JSON.stringify(window.__DL.SAVE.data.advent)"), 'inv dc_adv2', E("window.__DL.SAVE.data.inv.dc_adv2"))
            pg.wait_for_timeout(300); pg.screenshot(path='x2_m_adv2.png')
        # xmas shop items & customize
        E("(()=>{const d=window.__DL.SAVE.data; d.event.items.push('wacc:antler','pglow:xmas','meter:candy'); d.inv.mt_neon=1; d.inv.mt_cyber=1; d.inv.mt_lcd=1; d.inv.pl_6=1; d.inv.mt_holy=1; const c=window.__DL.SAVE.cur(); c.look.wacc='antler'; c.look.plateGlow='pl_6'; c.look.meter='mt_neon';})()")
        E("window.__DL.UI.open('tuning',{uid:window.__DL.SAVE.data.current}); window.__DL.UI.a_tMode('custom'); window.__DL.UI.a_tCat('mtr')"); pg.wait_for_timeout(800); pg.screenshot(path=f'x2_{tag}_meter.png')
        if tag=='d':
            E("window.__DL.UI.a_tCatBack(); window.__DL.UI.a_tCat('win')"); pg.wait_for_timeout(600); E("window.__DL.show.rot=Math.PI*0.9"); pg.wait_for_timeout(600); pg.screenshot(path='x2_d_plate.png')
            E("window.__DL.show.rot=-Math.PI*0.35"); pg.wait_for_timeout(600); pg.screenshot(path='x2_d_antler.png')
            for mid in ['mt_neon','mt_cyber','mt_lcd','candy','mt_holy']:
                E(f"window.__DL.SAVE.cur().look.meter='{mid}'")
                E("window.__DL.UI.launch({mode:'free',mapId:'jumppark',weather:'clear',time:'night',laps:1,carInst:window.__DL.SAVE.cur(),rivals:[]})")
                pg.wait_for_function("window.__DL.game.active && window.__DL.game.started", timeout=90000); pg.keyboard.down('w'); pg.wait_for_timeout(1800); pg.keyboard.up('w')
                pg.screenshot(path=f'x2_hud_{mid}.png', clip={'x':1000,'y':440,'width':280,'height':280}); E("window.__DL.game.exit(); window.__DL.UI.goMenu()")
            E("window.__DL.UI.open('events')"); pg.wait_for_timeout(400); E("document.getElementById('panelBody').scrollTop=9999"); pg.wait_for_timeout(300); pg.screenshot(path='x2_d_xshop.png')
        ctx.close()
    print(errs)
