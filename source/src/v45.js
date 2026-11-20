// =====================================================================
// v45.js — ストアの縦スワイプページ（左のレールで切り替え）・パーツ/スタイル/プロフィールパックを別ページへ
//          ボタンの効果音・押したときのアニメーション（波紋・色の変化）・商品タップのハイライト・購入完了の演出と効果音
// =====================================================================
// ---------------- 縦スワイプのページ ----------------
UI._vp = UI._vp || {};
function vpHTML(key, pages) { const cur = Math.min(UI._vp[key] || 0, pages.length - 1);
  return `<div class="vp" data-vp="${key}" style="--np:${pages.length}"><div class="vp-rail"><button class="vp-arr" data-a="vpGo" data-v="${key}:-1" ${cur === 0 ? 'disabled' : ''}>︿</button><div class="vp-dots">${pages.map((p, i) => `<button class="vp-dot ${i === cur ? 'on' : ''}" data-a="vpGo" data-v="${key}:=${i}" title="${esc(p.title)}"></button>`).join('')}</div><span class="vp-title">${esc(pages[cur].title)}</span><button class="vp-arr" data-a="vpGo" data-v="${key}:1" ${cur === pages.length - 1 ? 'disabled' : ''}>﹀</button></div>
    <div class="vp-view">${pages.map((p, i) => `<section class="vp-page" data-i="${i}" data-t="${esc(p.title)}"><div class="vp-ph"><b>${esc(p.title)}</b>${p.sub ? `<small>${esc(p.sub)}</small>` : ''}${i < pages.length - 1 ? `<span class="vp-hint">︾ 上にスワイプで「${esc(pages[i + 1].title)}」</span>` : ''}</div><div class="vp-body">${p.html}</div></section>`).join('')}</div></div>`; }
function vpBind() { document.querySelectorAll('.vp').forEach(vp => { if (vp._b) return; vp._b = 1; const key = vp.dataset.vp, view = vp.querySelector('.vp-view'), cur = UI._vp[key] || 0;
    const pg = view.querySelectorAll('.vp-page'); if (pg[cur]) view.scrollTop = pg[cur].offsetTop - pg[0].offsetTop;
    let t = null; view.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(() => { const i = Math.round(view.scrollTop / Math.max(1, view.clientHeight)); if (i === UI._vp[key]) return; UI._vp[key] = i; AUDIO.vpSwipe && AUDIO.vpSwipe();
        vp.querySelectorAll('.vp-dot').forEach((d, k) => d.classList.toggle('on', k === i)); const tt = vp.querySelector('.vp-title'); if (tt && pg[i]) { tt.textContent = pg[i].dataset.t; tt.classList.remove('pop'); void tt.offsetWidth; tt.classList.add('pop'); }
        const ar = vp.querySelectorAll('.vp-arr'); if (ar[0]) ar[0].disabled = i === 0; if (ar[1]) ar[1].disabled = i === pg.length - 1; }, 90); }, { passive: true }); }); }
UI.a_vpGo = function (v) { const [key, d] = v.split(':'), vp = document.querySelector(`.vp[data-vp="${key}"]`); if (!vp) return; const view = vp.querySelector('.vp-view'), pg = view.querySelectorAll('.vp-page'), cur = UI._vp[key] || 0;
  const i = d[0] === '=' ? +d.slice(1) : Math.max(0, Math.min(pg.length - 1, cur + +d)); if (pg[i]) view.scrollTo({ top: pg[i].offsetTop - pg[0].offsetTop, behavior: 'smooth' }); };
{ const _ps = UI.packStoreHTML; UI.packStoreHTML = function () { const h = _ps.apply(this, arguments); const cards = h.match(/<button class="ps-card"[\s\S]*?<\/button>/g) || []; const id = c => (c.match(/data-v="([^"]+)"/) || [])[1];
    const SPECIAL = ['parts', 'style', 'profpack', 'emojipack', 'charmpack', 'platepack', 'goalpack', 'gdecopack', 'hornpack', 'enginepack', 'smokepack', 'stamppack', 'hudpack', 'licensepack', 'xmaspartspack', 'rimpack', 'petpack', 'dashpack', 'freshpack', 'gstylepack'], VEH = CHESTS.filter(c => c.vehicle).map(c => c.id), limIds = CHESTS.filter(c => c.limited || c.daily).map(c => c.id);
    const KEYP = ['keypack', 'keychainpack']; const lim = cards.filter(c => limIds.includes(id(c))), sp = cards.filter(c => SPECIAL.includes(id(c))), veh = cards.filter(c => VEH.includes(id(c))), kp = cards.filter(c => KEYP.includes(id(c))), reg = cards.filter(c => !limIds.includes(id(c)) && !SPECIAL.includes(id(c)) && !VEH.includes(id(c)) && !KEYP.includes(id(c)));
    const row = L => `<div class="ps-row vp-row">${L.join('')}</div>`; const pages = [];
    if (lim.length) pages.push({ title: '期間限定パック', sub: '限定車のカードや期間限定アイテムが手に入る', html: row(lim) });
    pages.push({ title: 'カードパック', sub: 'ブロンズからミシックまで。上のパックほどレアが出やすい', html: row(reg) });
    if (veh.length) pages.push({ title: '車両パック', sub: '車のカードで星（ランク）を上げよう', html: row(veh) });
    pages.push({ title: 'パーツ・スタイル・プロフィール', sub: '絵文字・飾りなど、ほしいジャンルにしぼったパック', html: row(sp) });
    if (kp.length) pages.push({ title: 'キー・キーチェーン', sub: 'エンジンを始動するキーと、キーにつける飾り', html: row(kp) });
    pages.push({ title: '車カード交換', sub: '集めたカードで限定車と交換', html: carCardsHTML() });
    setTimeout(vpBind, 0); return vpHTML('packs', pages); }; }
{ const _rs = UI.r_store; UI.r_store = function () { let h = _rs.apply(this, arguments); if (this.stTab !== 'offers') { setTimeout(vpBind, 0); return h; }
    const spot = (h.match(/<section class="of-sec">[\s\S]*?<\/section>/) || [])[0] || '', secs = h.match(/<section class="st-sec"[\s\S]*?<\/section>/g) || [];
    if (!secs.length) return h; let out = h; if (spot) out = out.replace(spot, ''); secs.forEach(s => { out = out.replace(s, ''); });
    const pages = []; if (spot) pages.push({ title: 'スポットライト', sub: '期間限定の限定車オファー', html: spot });
    const nm = s => (s.match(/<div class="st-sh">[\s\S]*?<b>([^<]*)<\/b>/) || [])[1] || 'オファー'; secs.forEach(s => pages.push({ title: nm(s), html: `<div class="st-row vp-strow">${s}</div>` }));
    out = out.replace('<div class="st-row">', '<div class="st-row st-vp">' + vpHTML('offers', pages)); setTimeout(vpBind, 0); return out; }; }

// ---------------- 効果音 ----------------
Object.assign(AUDIO, {
  tap() { if (!this.uiOk || !this.uiOk()) return; const n = performance.now(); if (n - (this._tapT || 0) < 45) return; this._tapT = n; this.tone(1500, 0.025, 'square', 0.035, 0, 0.6, this.uiBus); this.tone(760, 0.05, 'sine', 0.05, 0.005, 0.8, this.uiBus); },
  vpSwipe() { if (!this.uiOk || !this.uiOk()) return; this.noiseBurst && this.noiseBurst(0.12, 2600, 2.5, 0.04, 0, 'bandpass', this.uiBus); this.tone(420, 0.1, 'sine', 0.05, 0, 1.6, this.uiBus); },
  buyOk() { if (!this.uiOk || !this.uiOk()) return; this.duckMusic && this.duckMusic(0.5, 0.8); this.noiseBurst && this.noiseBurst(0.06, 6000, 1.5, 0.06, 0, 'highpass', this.uiBus);
    [[1318, 0], [1568, 0.06], [2093, 0.12], [2637, 0.2]].forEach(([f, w]) => this.tone(f, 0.22, 'triangle', 0.11, w, 0, this.uiBus)); [[3136, 0.28], [3951, 0.33]].forEach(([f, w]) => this.tone(f, 0.12, 'sine', 0.05, w, 0, this.uiBus)); this.tone(196, 0.25, 'sine', 0.12, 0, 0.5, this.uiBus); }
});
{ const _buy = AUDIO.buy.bind(AUDIO); AUDIO.buy = function () { if (this.buyOk) { this.buyOk(); UI.buyFx && UI.buyFx(); } else _buy(); }; }
// ---------------- ボタンの押下アニメーション・商品のハイライト ----------------
const TAP_ITEM = '.ps-card, .of-card, .st-card, .xs-card, .ds-card, .dv-card, .lp-cell, .mx-bg, .gf-row, .sitem, .cc-card, .pcard, .inv-it, .nm-hero, .nm-pass, .nm-dev, .nm-gift, .nm-pill, .cat, .bp-tabs button';
const RIPPLE = '.btn, .st-buy, .of-buy, .xs-buy, .ds-price, .ds-refb, .ps-price, .lp-buy, .lp-buy2, .lp-stage, .lp-mis, .of-pay, .pd-buy, [data-a="psBuy"], .vp-arr, .tab, .st-tabs button';
let _lastPress = null;
document.addEventListener('pointerdown', e => { const t = e.target; if (!t.closest || t.closest('#touch') || t.closest('#packFx') && !t.closest('button')) return;
  const b = t.closest('button, [data-a], [data-m]'); if (b && !b.disabled && !(UI.game && UI.game.active && !document.querySelector('#overlay:not(.hidden)'))) AUDIO.tap && AUDIO.tap();
  const it = t.closest(TAP_ITEM); if (it) { const r = it.getBoundingClientRect(); it.style.setProperty('--hx', (e.clientX - r.left) + 'px'); it.style.setProperty('--hy', (e.clientY - r.top) + 'px'); it.classList.add('tapglow'); }
  const rb = t.closest(RIPPLE); if (rb && !rb.disabled) { _lastPress = rb; rb.classList.add('pressing'); const r = rb.getBoundingClientRect(), sz = Math.max(r.width, r.height) * 2.2, sp = document.createElement('span'); sp.className = 'rpl'; sp.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - r.left - sz / 2}px;top:${e.clientY - r.top - sz / 2}px`; if (getComputedStyle(rb).position === 'static') rb.style.position = 'relative'; rb.classList.add('has-rpl'); rb.appendChild(sp); setTimeout(() => sp.remove(), 620); } }, true);
const _tapEnd = () => { document.querySelectorAll('.tapglow').forEach(el => { el.classList.add('tapout'); el.classList.remove('tapglow'); setTimeout(() => el.classList.remove('tapout'), 350); }); document.querySelectorAll('.pressing').forEach(el => el.classList.remove('pressing')); };
for (const ev of ['pointerup', 'pointercancel', 'pointerleave', 'scroll']) document.addEventListener(ev, _tapEnd, true);
UI.buyFx = function () { const el = document.createElement('div'); el.className = 'buyfx'; el.innerHTML = `<svg viewBox="0 0 80 80" width="74" height="74"><circle cx="40" cy="40" r="34" class="bf-c"/><path d="M24 41 L35 52 L57 29" class="bf-k"/></svg><b>購入完了！</b>${Array.from({ length: 10 }, (_, k) => `<i style="--a:${k * 36}deg"></i>`).join('')}`; document.body.appendChild(el); setTimeout(() => el.classList.add('out'), 1000); setTimeout(() => el.remove(), 1400);
  const b = _lastPress; if (b && document.body.contains(b)) { b.classList.add('bought'); setTimeout(() => b.classList.remove('bought'), 900); } };
