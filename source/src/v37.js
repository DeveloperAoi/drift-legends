// =====================================================================
// v37.js — 本物みたいなパックBOX（3Dの箱・開封アニメーション）、未開封のBOX／パックをインベントリに保存
// =====================================================================
function unopened() { const d = SAVE.data; d.unopened = d.unopened || { boxes: {}, packs: {} }; d.unopened.boxes = d.unopened.boxes || {}; d.unopened.packs = d.unopened.packs || {}; return d.unopened; }
function boxHTML(c, size = 1, open = false) { const A = PACK_ART[c.id] || PACK_ART.silver;
  const packs = Array.from({ length: 10 }, (_, k) => `<i style="--k:${k}"></i>`).join('');
  return `<div class="bx-scene" style="--s:${size};--pa:${A.a};--pb:${A.b}"><div class="bx ${open ? 'open' : ''}">
    <div class="bx-f bx-front"><div class="bx-art"><div class="bx-logo">DRIFT<b>LEGENDS</b></div><div class="bx-packs">${packPouch(c, 0.42)}${packPouch(c, 0.42)}</div><div class="bx-name">${A.t}</div><div class="bx-cnt">10 PACKS</div></div><div class="bx-perf"></div></div>
    <div class="bx-f bx-back"></div><div class="bx-f bx-right"><div class="bx-side">${A.t} ・ BOX</div></div><div class="bx-f bx-left"></div><div class="bx-f bx-bottom"></div>
    <div class="bx-f bx-tray"><div class="bx-tops">${packs}</div></div>
    <div class="bx-lid"><div class="bx-lid-out"><div class="bx-logo s">DRIFT<b>LEGENDS</b></div><div class="bx-name s">${A.t} BOX</div></div><div class="bx-lid-in"><div class="bx-hdr">${packPouch(c, 0.5)}<div><b>${A.t}</b><small>CARD PACK ・ 10パック入り</small></div></div></div></div>
  </div></div>`; }
const BOXFX = {
  show(c) { this.c = c; this.state = 0; let o = document.getElementById('boxFx'); if (!o) { o = document.createElement('div'); o.id = 'boxFx'; document.body.appendChild(o); o.addEventListener('click', e => this.onClick(e)); }
    o.className = 'show'; o.innerHTML = `<div class="bf-rays"></div><div class="bf-stage">${boxHTML(c, 1.5)}</div><div class="bf-tip">タップしてBOXを開ける</div><div class="bf-btns"></div><button class="bf-x" data-b="close">✕</button>`; this.o = o; AUDIO.pkSelect && AUDIO.pkSelect(); },
  onClick(e) { const b = e.target.closest('[data-b]'), a = b ? b.dataset.b : 'tap'; e.stopPropagation();
    if (a === 'close') { if (this.state === 2) return; return this.hide(); }
    if (a === 'openall') { this.hide(); return UI.openPacksFree(this.c.id, 10, true); }
    if (a === 'save') { const u = unopened(); u.packs[this.c.id] = (u.packs[this.c.id] || 0) + 10; u.guar = u.guar || {}; u.guar[this.c.id] = (u.guar[this.c.id] || 0) + 1; SAVE.save(); this.hide(); UI.toast('10パックをインベントリに保存しました（ストア → 未開封）'); if (UI.screen === 'store') UI.render(); return; }
    if (a === 'tap' && this.state === 0) this.open(); },
  open() { this.state = 1; const o = this.o, bx = o.querySelector('.bx'); o.querySelector('.bf-tip').textContent = '';
    AUDIO.pkCharge && AUDIO.pkCharge(); bx.classList.add('wobble');
    setTimeout(() => { bx.classList.remove('wobble'); bx.classList.add('perf'); AUDIO.pkTear && AUDIO.pkTear(); }, 650);
    setTimeout(() => { bx.classList.add('open'); o.querySelector('.bf-rays').classList.add('on'); try { AUDIO.noiseBurst(0.25, 400, 1, 0.12, 0, 'lowpass'); AUDIO.tone(660, 0.4, 'triangle', 0.06, 0.1); AUDIO.tone(990, 0.5, 'triangle', 0.05, 0.22); } catch (x) { } }, 1150);
    setTimeout(() => { bx.classList.add('rise'); for (let k = 0; k < 10; k++) setTimeout(() => AUDIO.pkCardOut && AUDIO.pkCardOut(k), k * 60); }, 1900);
    setTimeout(() => { this.state = 3; o.querySelector('.bf-tip').textContent = 'パックをどうしますか？'; o.querySelector('.bf-btns').innerHTML = `<button class="bf-btn pri" data-b="openall">10パックすべて開ける</button><button class="bf-btn" data-b="save">インベントリに保存（あとで開ける）</button>`; }, 2700); },
  hide() { const o = this.o; if (!o) return; o.className = ''; o.innerHTML = ''; UI.refreshTop && UI.refreshTop(); }
};
Object.assign(UI, {
  openPacksFree(id, n, guar) { const c = CHESTS.find(x => x.id === id); if (!c) return; const d = SAVE.data, res = []; if (guar) this._boxGuar = true;
    for (let k = 0; k < n; k++) { const it = rollChest(c); res.push({ it, g: grantChestItem(it) }); } this._boxGuar = false;
    d.packLog = [{ id: 'x' + SRV.now().toString(36) + Math.random().toString(36).slice(2, 5), pack: c.id, t: SRV.now(), items: res.map(r => [r.it.id, r.g.isNew ? 1 : 0, r.g.refund || 0]) }].concat(d.packLog || []).slice(0, 60);
    d.stats.chests = (d.stats.chests || 0) + res.length; SAVE.save(); this.refreshTop(); PACKFX.open(c, res); },
  a_stBox(id) { const c = CHESTS.find(x => x.id === id); if (!c) return; const p = Math.round(c.price * 10 * 0.8 / 1000) * 1000;
    this.modal(`<div class="bxm"><div class="bxm-art">${boxHTML(c, 1)}</div><div><h2>${esc(c.name)} BOX</h2><div class="note">10パック入り（通常 ${yen(c.price * 10)} → <b>${yen(p)}</b>）。BOXには<b>エピック以上が1枚以上</b>確定。</div><div class="note">買ったBOXは今すぐ開けるか、インベントリ（ストア → 未開封）に保存してあとで開けられます。</div>
      <div class="btns" style="flex-direction:column"><button class="btn pri" data-a="stBoxBuy" data-v="${id}:open">購入して今すぐ開ける</button><button class="btn" data-a="stBoxBuy" data-v="${id}:save">購入してインベントリに保存</button><button class="btn" data-a="closeModal">やめる</button></div></div></div>`); },
  a_stBoxBuy(v) { const [id, how] = v.split(':'), c = CHESTS.find(x => x.id === id); if (!c || this._stBusy) return; const p = Math.round(c.price * 10 * 0.8 / 1000) * 1000; this.closeModal();
    if (!SAVE.spend(p)) return; AUDIO.buy && AUDIO.buy(); this.refreshTop();
    if (how === 'save') { const u = unopened(); u.boxes[id] = (u.boxes[id] || 0) + 1; SAVE.save(); this.toast('BOXをインベントリに保存しました（ストア → 未開封）'); return this.render(); }
    SAVE.save(); BOXFX.show(c); },
  a_invBoxOpen(id) { const u = unopened(); if (!(u.boxes[id] > 0)) return; u.boxes[id]--; if (!u.boxes[id]) delete u.boxes[id]; SAVE.save(); this.render(); BOXFX.show(CHESTS.find(x => x.id === id)); },
  a_invPackOpen(v) { const [id, ns] = v.split(':'), u = unopened(), have = u.packs[id] || 0, n = Math.min(have, ns === 'all' ? have : +ns); if (!n) return;
    u.packs[id] = have - n; if (!u.packs[id]) delete u.packs[id]; let guar = false; u.guar = u.guar || {}; const m = Math.min(n, 30); if (u.guar[id] > 0 && m >= 10) { guar = true; u.guar[id]--; }
    SAVE.save(); this.render(); this.openPacksFree(id, m, guar); if (n > 30) { u.packs[id] = (u.packs[id] || 0) + (n - 30); SAVE.save(); } },
  stInvHTML() { const u = unopened(), B = Object.entries(u.boxes).filter(([, n]) => n > 0), P = Object.entries(u.packs).filter(([, n]) => n > 0);
    let h = `<div class="mx-hero inv"><div class="mx-hero-ic">${SICO.box(54)}</div><div><b>UNOPENED</b><small>保存したBOXとパック。好きなときに開けられます</small></div></div>`;
    if (!B.length && !P.length) return h + `<div class="note" style="text-align:center;padding:24px">未開封のBOX・パックはありません。オファーの「パックBOX」から買えます。</div>`;
    if (B.length) h += `<div class="h3">BOX</div><div class="inv-boxes">${B.map(([id, n]) => { const c = CHESTS.find(x => x.id === id); return c ? `<div class="inv-box"><div class="inv-bart">${boxHTML(c, 0.62)}</div><b>${esc(c.name)} BOX</b><small>×${n}</small><button class="st-buy" data-a="invBoxOpen" data-v="${id}">開ける</button></div>` : ''; }).join('')}</div>`;
    if (P.length) h += `<div class="h3">パック</div><div class="inv-boxes">${P.map(([id, n]) => { const c = CHESTS.find(x => x.id === id); return c ? `<div class="inv-box"><div class="inv-part">${packPouch(c, 0.9)}<span class="inv-n">×${n}</span></div><b>${esc(c.name)}</b><div class="inv-btns"><button class="st-buy" data-a="invPackOpen" data-v="${id}:1">1パック開ける</button>${n > 1 ? `<button class="st-buy alt" data-a="invPackOpen" data-v="${id}:all">まとめて開ける（${Math.min(n, 30)}）</button>` : ''}</div></div>` : ''; }).join('')}</div>`;
    return h; }
});
// ストア：BOXカードを本物の箱に・「未開封」タブ
{ const _bc = UI.boxCards; UI.boxCards = function (all) { let h = _bc.call(this, all); return h.replace(/<div class="st-art st-boxart">[\s\S]*?<span class="st-x10">×10<\/span><\/div>/g, m => m).replace(/<div class="st-card box" style="--cc:([^;]+);animation-delay:([^"]+)"><div class="st-ct">([^<]+)<\/div>/g, (m) => m); };
  const _bc2 = UI.boxCards; UI.boxCards = function (all) { const xm = typeof xmasPackOpen === 'function' && xmasPackOpen(); return CHESTS.filter(c => !c.daily && (c.id !== 'xmaspack' || xm)).slice(0, all ? 99 : 6).map((c, i) => { const full = c.price * 10, p = Math.round(full * 0.8 / 1000) * 1000;
    return `<div class="st-card box" style="--cc:${(PACK_ART[c.id] || {}).b};animation-delay:${i * 0.06}s"><div class="st-ct">${esc(c.name.replace('カードパック', ''))} BOX</div><div class="st-cd">10パック入り・エピック以上確定</div><span class="st-badge sale">SALE 20%</span><div class="st-art bx-art">${boxHTML(c, 0.6)}</div><div class="st-old">${yen(full)}</div><button class="st-buy" data-a="stBox" data-v="${c.id}">${yen(p)}</button><span class="st-bubble">10</span></div>`; }).join(''); }; }
{ const _rs = UI.r_store; UI.r_store = function () { const inv = this.stTab === 'inv'; if (inv) this.stTab = 'bg'; let h = _rs.call(this); const u = unopened(), cnt = Object.values(u.boxes).reduce((a, b) => a + b, 0) + Object.values(u.packs).reduce((a, b) => a + b, 0);
    h = h.replace(/(<div class="st-tabs top">)/, `$1`).replace(/(<button class="[^"]*" data-a="stTab" data-v="packs">)/, `<button class="${inv ? 'on' : ''}" data-a="stTab" data-v="inv">${SICO.box(22)}<span>未開封${cnt ? `<i class="st-cnt">${cnt}</i>` : ''}</span></button>$1`);
    if (inv) { this.stTab = 'inv'; h = h.replace(/(<button class=")on(" data-a="stTab" data-v="bg">)/, '$1$2').replace(/<div class="st-inner[^"]*">[\s\S]*$/, '') + `<div class="st-inner mx">${this.stInvHTML()}</div>`; }
    return h; }; }
window.__DLX = Object.assign(window.__DLX || {}, { BOXFX, unopened });
