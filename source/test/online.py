from playwright.sync_api import sync_playwright
MOCK = r"""
(()=>{const me='p'+Math.random().toString(36).slice(2,8);
window.claude={use:async(n)=>{ if(n==='user') return {id:async()=>'u_'+me, isOwner:()=>false};
 if(n==='room') return { join: async(name)=>{ const bc=new BroadcastChannel('mock-'+name); const peers={}; let mine={}; const subs=[];
   const emitP=()=>{const list=Object.entries(peers).map(([peer,pr])=>Object.freeze({peer,by:null,isMe:peer===me,sameTab:peer===me,kind:'viewer',guest:false,presence:pr,updatedAt:Date.now()})); room._list=Object.freeze(list); subs.forEach(f=>f({peers:list,joined:[],left:[],updated:[]}));};
   peers[me]=mine;
   bc.onmessage=e=>{const m=e.data; if(m.t==='p'){peers[m.peer]=m.pr; emitP();} if(m.t==='hello'){bc.postMessage({t:'p',peer:me,pr:mine});} if(m.t==='bye'){delete peers[m.peer]; emitP();}};
   const room={ name, _list:[], presence:async(patch)=>{ mine=Object.assign({},mine,patch); for(const k in patch) if(patch[k]===null) delete mine[k]; peers[me]=mine; bc.postMessage({t:'p',peer:me,pr:mine}); emitP(); },
     peers:()=>room._list, onPeers:(f)=>{subs.push(f); setTimeout(emitP,0); return ()=>{}}, onConnection:(f)=>{setTimeout(()=>f(true),0); return ()=>{}}, connected:()=>true,
     leave:async()=>{bc.postMessage({t:'bye',peer:me}); bc.close();}, emit:async()=>{}, on:()=>()=>{} };
   bc.postMessage({t:'hello'}); setTimeout(emitP,0); return room; } };
 return null; }};})();
"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    ctx=b.new_context(viewport={'width':960,'height':540}); errs=[]
    pages=[]
    for i in range(2):
        pg=ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_TUNNEL' not in m.text else None)
        pg.add_init_script(MOCK); pg.goto('file:///home/claude/dl/dist/index.html'); pg.wait_for_timeout(800); pg.click('#btnStart'); pg.evaluate("document.querySelector('[data-a=closeModal]')?.click()")
        pg.evaluate("window.__DL.UI.open('online')"); pg.wait_for_timeout(1200); pages.append(pg)
    for pg in pages:
        pg.evaluate("(()=>{const i=document.getElementById('netCode'); i.value='touge86'; i.dispatchEvent(new Event('input',{bubbles:true}));})()")
        pg.evaluate("document.querySelector('[data-a=netJoin]').click()"); pg.wait_for_timeout(1200)
    for pg in pages: pg.evaluate("window.__DL.UI.render()")
    pg=pages[0]; pg.wait_for_timeout(500); pages[0].screenshot(path='ol_lobby0.png'); pages[1].screenshot(path='ol_lobby1.png')
    print('peers', [p.evaluate("window.__DL.UI && document.querySelectorAll('.list .item').length") for p in pages])
    for p2 in pages: p2.evaluate("document.querySelector('[data-a=netReady]').click()"); p2.wait_for_timeout(600)
    for p2 in pages: p2.evaluate("window.__DL.UI.render()")
    hosts=[p2.evaluate("!!document.querySelector('[data-a=netGo]')") for p2 in pages]; print('host flags', hosts)
    h=pages[hosts.index(True)]; h.evaluate("document.querySelector('[data-a=netGo]').click()")
    for p2 in pages: p2.wait_for_function("window.__DL.game.active", timeout=60000)
    pages[0].wait_for_timeout(5000)
    print('rivals', [p2.evaluate("window.__DL.game.rivals.map(r=>[!!r.net, r.def&&r.def.name, Math.round(r.x), Math.round(r.z)])") for p2 in pages])
    print('me', [p2.evaluate("[Math.round(window.__DL.game.veh.x), Math.round(window.__DL.game.veh.z)]") for p2 in pages])
    pages[0].keyboard.down('KeyW'); pages[0].wait_for_timeout(5000); pages[0].keyboard.up('KeyW')
    print('after drive me0', pages[0].evaluate("[Math.round(window.__DL.game.veh.x), Math.round(window.__DL.game.veh.z), Math.round(window.__DL.game.totalDist)]"), 'seen by 1', pages[1].evaluate("window.__DL.game.rivals.map(r=>[Math.round(r.x), Math.round(r.z), r.prog])"))
    pages[1].screenshot(path='ol_race1.png'); pages[0].screenshot(path='ol_race0.png')
    pages[0].evaluate("const g=window.__DL.game; g.finish('goal')"); pages[0].wait_for_timeout(2800); pages[0].screenshot(path='ol_res0.png')
    html=pages[0].evaluate("document.getElementById('panelBody').innerHTML"); 
    import re; print('actions:', sorted(set(re.findall(r'data-a="([a-zA-Z]+)"', html))), 'inputs:', re.findall(r'data-in="([a-zA-Z]+)"', html))
    print('ERR so far', errs[:5])
    b.close()
