(function(){
if (window.firebase) return;
const bc = new BroadcastChannel('fbmock'); let store = JSON.parse(localStorage.getItem('fbmock_store')||'{}');
const listeners = []; const TS = {'.sv':'timestamp'};
const parts = p => p.split('/').filter(Boolean);
function getAt(p){ let o=store; for(const k of parts(p)){ if(o==null||typeof o!=='object') return null; o=o[k]; } return o===undefined?null:o; }
function resolve(v){ if(v&&typeof v==='object'){ if(v['.sv']) return Date.now(); const o=Array.isArray(v)?[]:{}; for(const k in v){ const r=resolve(v[k]); if(r!==null&&r!==undefined) o[k]=r; } return Object.keys(o).length?o:null; } return v; }
function setAt(p,v,remote){ store=JSON.parse(localStorage.getItem('fbmock_store')||'{}'); const ks=parts(p); if(!ks.length){store=v||{};} else { let o=store; for(let i=0;i<ks.length-1;i++){ if(typeof o[ks[i]]!=='object'||o[ks[i]]===null) o[ks[i]]={}; o=o[ks[i]]; } if(v===null||v===undefined) delete o[ks[ks.length-1]]; else o[ks[ks.length-1]]=v; }
  localStorage.setItem('fbmock_store',JSON.stringify(store)); if(!remote) bc.postMessage({p,v}); fire(); }
bc.onmessage = e => { store = JSON.parse(localStorage.getItem('fbmock_store')||'{}'); fire(); };
function fire(){ for(const l of listeners){ const v=JSON.stringify(getAt(l.p)); if(v!==l.last){ l.last=v; const val=getAt(l.p); setTimeout(()=>l.cb(snap(val)),0);} } }
const snap = (v,ord) => ({ forEach:cb=>{ const o=v&&typeof v==='object'?v:{}; let ks=Object.keys(o); if(ord) ks.sort((a,b)=>(o[a]&&o[a][ord]||0)-(o[b]&&o[b][ord]||0)); for(const k of ks){ const c=snap(o[k]); c.key=k; if(cb(c)===true) break; } }, numChildren:()=>v&&typeof v==='object'?Object.keys(v).length:0, exists:()=>v!==null&&v!==undefined, val:()=>v===undefined?null:JSON.parse(JSON.stringify(v)) });
const discos = [];
window.addEventListener('pagehide',()=>discos.forEach(p=>setAt(p,null)));
function ref(p){ p=p||''; return {
  child:k=>ref(p+'/'+k), key: parts(p).slice(-1)[0],
  push:(v)=>{ const k='-k'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); const r=ref(p+'/'+k); if(v!==undefined) r.set(v); return r; },
  limitToLast:n=>{ const lim=v=>{ if(!v||typeof v!=='object') return v; const ks=Object.keys(v).sort().slice(-n); const o={}; ks.forEach(k=>o[k]=v[k]); return o; }; const subs=[]; return { on:(ev,cb)=>{ const w=s=>cb(snap(lim(s.val()))); subs.push([cb,w]); return ref(p).on(ev,w); }, off:(ev,cb)=>{ const x=subs.find(q=>q[0]===cb); if(x) ref(p).off(ev,x[1]); }, get:async()=>snap(lim(getAt(p))) }; }, orderByChild:k=>({ equalTo:val=>({ limitToFirst:n=>({ get:async()=>{ const o=getAt(p)||{}; const r={}; Object.keys(o).filter(x=>o[x]&&o[x][k]===val).slice(0,n).forEach(x=>r[x]=o[x]); return snap(r); } }) }), limitToFirst:n=>({ get:async()=>{ const o=getAt(p)||{}; const ks=Object.keys(o).sort((a,b)=>(o[a][k]||0)-(o[b][k]||0)).slice(0,n); const r={}; ks.forEach(x=>r[x]=o[x]); return snap(r,k); } }), limitToLast:n=>({ get:async()=>{ const o=getAt(p)||{}; const ks=Object.keys(o).sort((a,b)=>(o[a][k]||0)-(o[b][k]||0)).slice(-n); const r={}; ks.forEach(x=>r[x]=o[x]); return snap(r,k); } }) }), toString:()=>p, transaction:async fn=>{ const nv=fn(getAt(p)); if(nv===undefined) return {committed:false}; setAt(p,resolve(nv)); return {committed:true}; }, get:async()=>snap(getAt(p)), set:async v=>setAt(p,resolve(v)),
  update:async o=>{ for(const k in o) setAt(p+'/'+k,resolve(o[k])); }, remove:async()=>setAt(p,null),
  on:(ev,cb)=>{ if(p==='.info/connected'){ setTimeout(()=>cb(snap(true)),10); return cb;} const l={p,cb,last:undefined}; listeners.push(l); fire(); return cb; },
  off:(ev,cb)=>{ const i=listeners.findIndex(l=>l.p===p&&l.cb===cb); if(i>=0) listeners.splice(i,1); },
  onDisconnect:()=>({ remove:async()=>{ if(!discos.includes(p)) discos.push(p);}, cancel:async()=>{ const i=discos.indexOf(p); if(i>=0) discos.splice(i,1);} })
};}
const uidKey='fbmock_uid_'+(sessionStorage.getItem('tab')||(()=>{const t=Math.random().toString(36).slice(2,6); sessionStorage.setItem('tab',t); return t;})());
let user=null; const authCbs=[];
const mkUser=(uid,anon,name)=>({uid,isAnonymous:anon,displayName:name,email:anon?null:'test@example.com',
  linkWithPopup:async()=>{ user=mkUser('g_'+(sessionStorage.getItem('tab')),false,'テストユーザー'); authCbs.forEach(f=>f(user)); return {user}; } });
if(localStorage.getItem('fbmock_google')) user=mkUser('gUser1',false,'テスト');
const auth={ get currentUser(){return user;}, setPersistence:async()=>{}, getRedirectResult:async()=>null,
  onAuthStateChanged:f=>{ authCbs.push(f); setTimeout(()=>f(user),0); return ()=>{ const i=authCbs.indexOf(f); if(i>=0) authCbs.splice(i,1);}; },
  signInAnonymously:async()=>{ user=mkUser('anon'+Math.random().toString(36).slice(2,10),true); authCbs.forEach(f=>f(user)); return {user}; },
  signInWithPopup:async()=>{ user=mkUser('g_'+(sessionStorage.getItem('tab')),false,'テストユーザー'); authCbs.forEach(f=>f(user)); return {user}; },
  signOut:async()=>{ user=null; authCbs.forEach(f=>f(null)); } };
const authFn=()=>auth; authFn.Auth={Persistence:{LOCAL:'local'}}; authFn.GoogleAuthProvider=function(){};
const dbFn=()=>({ref}); dbFn.ServerValue={TIMESTAMP:TS};
window.firebase={ initializeApp:c=>({c}), auth:authFn, database:dbFn };
})();
