from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1000,'height':600}); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800)
    E=pg.evaluate
    E("window.__DL.SAVE.data.tutDone=true"); pg.click('#btnStart'); pg.wait_for_timeout(400); E("window.__DL.UI.closeModal()"); pg.wait_for_timeout(250); pg.screenshot(path='test/v31_menuanim.png')
    print('prof items', E("(()=>{const I=window.__DL.ITEMS;const c=t=>I.filter(i=>i.type===t).length;return {frame:c('pframe'),effect:c('peffect'),banner:c('pbanner'),icon:c('picon'),title:c('title')}})()"))
    # give some items
    E("(()=>{const D=window.__DL;D.SAVE.data.money=5e7; for(const id of ['pf_18','pe_12','pb_8','pi_9','tt_24','pf_14','pe_6']) D.SAVE.data.inv[id]=1; D.SAVE.save();})()")
    E("window.__DL.UI.open('profEdit')"); pg.wait_for_timeout(300)
    for v in ['pframe:pf_18','peffect:pe_12','picon:pi_9','pbanner:pb_8','title:tt_24']: E(f"window.__DL.UI.a_pfSet('{v}')")
    E("window.__DL.UI.a_pfSet('pframe:pf_23')"); print('locked blocked', E("window.__DL.SAVE.data.prof.frame"))
    E("window.__DL.UI.tab='bio';window.__DL.UI.render()"); pg.fill('#pfBio','峠で会おう！'); pg.click('[data-a=pfSaveBio]'); pg.wait_for_timeout(200)
    E("window.__DL.UI.tab='pframe';window.__DL.UI.render()"); pg.wait_for_timeout(500); pg.screenshot(path='test/v31_edit.png')
    E("window.__DL.UI.open('profile')"); pg.wait_for_timeout(400); pg.screenshot(path='test/v31_prof.png')
    E("window.__DL.UI.open('chest')"); E("window.__DL.UI.tab='shop';window.__DL.UI.render()"); pg.wait_for_timeout(500); pg.screenshot(path='test/v31_shop.png')
    E("window.__DL.UI.tab='prof';window.__DL.UI.render()"); pg.wait_for_timeout(300)
    m=E("window.__DL.SAVE.data.money"); E("window.__DL.UI.a_pshopBuy('pf_3')"); print('prof shop buy', m-E("window.__DL.SAVE.data.money"), E("!!window.__DL.SAVE.data.inv.pf_3"))
    E("window.__DL.UI.a_pshopBuy('pf_18')"); 
    pg.screenshot(path='test/v31_pshop.png')
    # packs
    E("window.__DL.UI.tab='chest';window.__DL.UI.render()")
    E("window.__DL.UI.a_openChest('carpack:10')"); pg.wait_for_timeout(500)
    log=E("window.__DL.SAVE.data.packLog[0].items.map(x=>x[0])"); print('carpack', log)
    E("(()=>{const o=document.getElementById('packFx'); window.__DL.UI && 0})()"); E("document.getElementById('packFx').click()"); pg.wait_for_timeout(300)
    E("(()=>{const P=document.getElementById('packFx'); P.className=''; P.innerHTML='';})()")
    E("window.__DL.UI.a_openChest('profpack:10')"); pg.wait_for_timeout(500); print('profpack', E("window.__DL.SAVE.data.packLog[0].items.map(x=>x[0])"))
    E("(()=>{const P=document.getElementById('packFx'); P.className=''; P.innerHTML='';})()")
    print('cards', E("JSON.stringify(window.__DL.SAVE.data.carCards)"))
    E("window.__DL.UI.goMenu()"); pg.wait_for_timeout(500); print('menu avatar', E("!!document.querySelector('.mm-acc .pav')"))
    # cars
    for car in ['pk_tank','pk_f1','pk_brick']:
        E(f"(()=>{{const D=window.__DL; D.UI.launch({{mode:'free',mapId:'circuit',weather:'clear',time:'day',laps:1,carInst:Object.assign(D.SAVE.newCar('{car}'),{{uid:'test'}}),rivals:[],startProg:100}});}})()"); pg.wait_for_timeout(2800)
        E("(()=>{const g=window.__DL.game;g.camMode=5;g.finished=true;g._finA=0.7;})()"); pg.wait_for_timeout(700); pg.screenshot(path=f'test/v31_{car}.png'); E("window.__DL.game.exit(); window.__DL.UI.goMenu()")
    print(errs[:5]); b.close()
