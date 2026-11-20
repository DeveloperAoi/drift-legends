from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1280,'height':700}); errs=[]; pg.on('pageerror', lambda e: errs.append('PAGE '+str(e)))
    pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); E=pg.evaluate
    E("window.__DL.SAVE.data.tutDone=true; window.__DL.UI._newsShown=true; window.__DL.UI._logChk=true"); pg.click('#btnStart'); pg.wait_for_timeout(1200); E("window.__DL.UI.closeModal(); window.__DL.SAVE.data.money=9e9")
    print('packs', E("[...new Set(window.__DLX.packPool?[]:[])].length"), E("(()=>{const D=window.__DL;return D.ITEMS.filter(i=>i.rarity==='M').length})()"))
    # simulate rolls via opening many packs and reading log
    stats=E("""(()=>{const D=window.__DL,U=D.UI,out={}; for(const id of ['free','bronze','silver','parts','style','gold','legend','mythic','profpack']){ const r={}; let cards=0,prize=0; for(let k=0;k<20;k++){ if(id==='free') D.SAVE.data.chest.freeDate=''; U.a_openChest(id+':10'); const P=document.getElementById('packFx'); P.className=''; P.innerHTML=''; const L=D.SAVE.data.packLog[0].items; for(const x of L){ const it=D.ITEMS.find(i=>i.id===x[0]); r[it.rarity]=(r[it.rarity]||0)+1; if(it.type==='carcard')cards++; if(it.type==='cash'||it.type==='dia')prize++; } } out[id]=JSON.stringify(r)+' cards:'+cards+' prize:'+prize;} return out;})()""")
    for k,v in stats.items(): print(k, v)
    E("window.__DL.UI.open('store')"); pg.wait_for_timeout(300); E("window.__DL.UI.a_stTab('packs')"); pg.wait_for_timeout(500)
    print('carpack gone', not E("!!document.querySelector('.ps-card[data-v=carpack]')"), E("[...document.querySelectorAll('.ps-card')].map(e=>e.dataset.v).join(',')"))
    pg.click('.ps-card[data-v=mythic]'); pg.wait_for_timeout(800); print('rows', E("[...document.querySelectorAll('.pr-h b')].map(e=>e.textContent).join(',')")); pg.screenshot(path='test/v38_detail.png')
    E("window.__DL.UI.closeModal()")
    # force a mythic reveal
    E("""(()=>{const D=window.__DL; const it=D.ITEMS.find(i=>i.id==='mp_0'), it2=D.ITEMS.find(i=>i.id==='cash_L'); window.__res=[{it:it2,g:{isNew:true}},{it,g:{isNew:true}}];})()""")
    E("(()=>{const D=window.__DL; const c={id:'mythic',name:'ミシックカードパック',price:1,odds:{M:100},color:'#ff2a7a'}; D.UI.a_openChest; window.__PF && 0; })()")
    E("window.__DL.UI.a_openChest('mythic:10')"); pg.wait_for_timeout(800)
    # replace result to mythic for test: click open, then step
    pg.click('#packFx [data-p=open]'); pg.wait_for_timeout(2600)
    for k in range(10):
        top=E("(()=>{const c=document.querySelector('#packFx .cardx.focus');return c?c.className:''})()")
        if 'r-M' in top or 'r-L' in top: break
        pg.click('#packFx', position={'x':640,'y':350}); pg.wait_for_timeout(1500)
    pg.wait_for_timeout(1300); pg.screenshot(path='test/v38_reveal.png'); print('focused', E("(document.querySelector('#packFx .cardx.focus')||{}).className"), 'btn3d', E("!!document.querySelector('.cx-3d')"))
    if E("!!document.querySelector('.cx-3d')"):
        pg.click('.cx-3d', force=True); pg.wait_for_timeout(1200); pg.screenshot(path='test/v38_3d.png'); print('3d view', E("!!document.getElementById('card3d')"))
    print(errs[:5]); b.close()
