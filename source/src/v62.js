// =====================================================================
// v62.js — v4.3：アイテムを購入・入手したときの演出（CONGRATULATIONS!・ホログラムのパック出現・グリッチ・ワイプ）
// =====================================================================
Object.assign(AUDIO, {
  acqWhoosh() { if (!this.ok) return; this.noiseBurst(0.35, 900, 0.7, 0.1, 0, 'bandpass'); this.tone(220, 0.35, 'sine', 0.05, 0, 880); },
  acqFlash() { if (!this.ok) return; this.noiseBurst(0.5, 3000, 0.5, 0.08, 0, 'highpass'); this.tone(880, 0.5, 'triangle', 0.05, 0.02); this.tone(1320, 0.6, 'triangle', 0.04, 0.08); },
  acqGlitch() { if (!this.ok) return; for (let k = 0; k < 5; k++) this.tone(200 + Math.random() * 1600, 0.025, 'square', 0.035, k * 0.035); },
  acqScan() { if (!this.ok) return; this.tone(500, 0.5, 'sawtooth', 0.025, 0, 1500); },
  acqReveal() { if (!this.ok) return; [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.45, 'triangle', 0.05, i * 0.06)); this.noiseBurst(0.3, 6000, 0.5, 0.03, 0.1, 'highpass'); },
  acqWipe() { if (!this.ok) return; this.noiseBurst(0.25, 1800, 0.8, 0.08, 0, 'bandpass'); }
});
const ACQ = { el: null, busy: false, queue: [], T: [],
  root() { if (!this.el) { const o = document.createElement('div'); o.id = 'acqFx'; document.body.appendChild(o); o.addEventListener('click', e => this.onClick(e)); this.el = o; } return this.el; },
  later(ms, f) { this.T.push(setTimeout(f, ms)); },
  clear() { this.T.forEach(clearTimeout); this.T = []; },
  // パックが出てくる演出（ホログラム）→ 終わったら done()
  intro(c, done) { const o = this.root(); this.clear(); this.busy = true; this.mode = 'intro'; this.done = done;
    o.className = 'show'; o.innerHTML = `<div class="aq-bg"></div><div class="aq-pack">${packPouch(c, 1.1)}<i class="aq-holo"></i><i class="aq-scan s1"></i><i class="aq-scan s2"></i><i class="aq-spark"></i></div><div class="aq-glow"></div><i class="aq-line l1"></i><i class="aq-line l2"></i><i class="aq-line l3"></i><div class="aq-skip">画面をタップしてスキップ</div>`;
    const P = o.querySelector('.aq-pack'); AUDIO.acqWhoosh();
    this.later(30, () => P.classList.add('in'));
    this.later(380, () => { o.classList.add('flash1'); AUDIO.acqFlash(); });
    this.later(800, () => { P.classList.add('holo'); AUDIO.acqScan(); });
    this.later(1500, () => { P.classList.add('solid'); o.classList.remove('flash1'); AUDIO.acqGlitch(); });
    this.later(2100, () => this.finishIntro()); },
  finishIntro() { if (this.mode !== 'intro') return; this.clear(); this.mode = null; const o = this.el; o.className = ''; o.innerHTML = ''; this.busy = false; const d = this.done; this.done = null; if (d) d(); this.next(); },
  // CONGRATULATIONS! 獲得したもの
  show(cards, title) { if (!cards || !cards.length) return; if (this.busy || (UI.game && UI.game.active) || (PACKFX.o && PACKFX.o.classList.contains('show')) || document.querySelector('#cbFx.show')) { this.queue.push([cards, title]); return; }
    const o = this.root(); this.clear(); this.busy = true; this.mode = 'reveal';
    document.querySelectorAll('.buyfx').forEach(x => x.remove());
    o.className = 'show'; o.innerHTML = `<div class="aq-bg"></div><div class="aq-head"><b class="aq-congrats">CONGRATULATIONS!</b><small>${esc(title || '獲得したもの：')}</small><i class="aq-gb g1"></i><i class="aq-gb g2"></i></div>
      <div class="aq-emb"><svg viewBox="0 0 60 60" width="64" height="64"><defs><linearGradient id="aqE" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b07aff"/><stop offset="1" stop-color="#5a24c0"/></linearGradient></defs><rect x="4" y="4" width="52" height="52" rx="6" fill="#1a0a3a" stroke="url(#aqE)" stroke-width="3"/><path d="M18 42 L30 16 L42 42 M24 32 H36" stroke="#d8b8ff" stroke-width="5" fill="none" stroke-linejoin="round"/></svg><i class="aq-ebar b1"></i><i class="aq-ebar b2"></i></div>
      <i class="aq-line l1"></i><i class="aq-line l3"></i>
      <div class="aq-cards ${cards.length > 4 ? 'many' : cards.length === 1 ? 'one' : 'few'}">${cards.map((h, i) => `<div class="aq-card" style="--i:${i}">${h}</div>`).join('')}</div>
      <div class="aq-skip">画面をタップしてスキップ</div><button class="aq-next" data-q="next">次へ</button><div class="aq-wipe"></div>`;
    o.classList.add('flash2'); AUDIO.acqFlash();
    this.later(160, () => { o.classList.remove('flash2'); o.classList.add('st-head'); AUDIO.acqGlitch(); });
    this.later(520, () => { o.classList.add('st-emb'); });
    this.later(980, () => { o.classList.add('st-cards'); AUDIO.acqGlitch(); this.later(120, () => AUDIO.acqReveal()); });
    this.later(1600 + Math.min(8, cards.length) * 80, () => this.ready()); },
  ready() { if (this.mode !== 'reveal') return; this.clear(); const o = this.el; o.classList.remove('flash2'); o.classList.add('st-head', 'st-cards', 'st-ready'); o.classList.add('st-emb'); },
  close() { if (this.mode !== 'reveal' || this.closing) return; this.closing = true; const o = this.el; o.classList.add('wipe'); AUDIO.acqWipe();
    setTimeout(() => { o.className = ''; o.innerHTML = ''; this.mode = null; this.busy = false; this.closing = false; UI.refreshTop && UI.refreshTop(); this.next(); }, 520); },
  next() { if (this.busy || !this.queue.length) return; if ((UI.game && UI.game.active) || (PACKFX.o && PACKFX.o.classList.contains('show'))) return; const [c, t] = this.queue.shift(); this.show(c, t); },
  onClick(e) { e.stopPropagation(); const q = e.target.closest('[data-q]');
    if (this.mode === 'intro') return this.finishIntro();
    if (this.mode === 'reveal') { if (q && q.dataset.q === 'next') return this.close(); if (!this.el.classList.contains('st-ready')) return this.ready(); } }
};
setInterval(() => ACQ.next(), 1000);
// ---------- カードの見た目 ----------
const acqSimple = (icon, title, sub, col) => `<div class="fc aq-fc" style="--rc:${col}"><div class="fc-top"><span class="fc-kind">${esc(sub)}</span></div><div class="aq-fci">${icon}</div><div class="fc-bot"><b>${esc(title)}</b></div></div>`;
function acqCards(diff) { const out = [];
  for (const [id, n] of diff.items) { const it = ITEM_BY_ID[id]; if (!it) continue; let h = ''; try { h = featCard(it); } catch (e) { h = acqSimple(itemIconSvg(it, 60), it.name, ITEM_TYPES[it.type] || 'アイテム', (RARITY[it.rarity] || RARITY.C).color); } out.push(n > 1 ? h.replace('<div class="fc', `<div data-x="${n}" class="fc aq-mul`) : h); }
  for (const id of diff.cars) { const c = CAR_BY_ID[id]; if (c) out.push(acqSimple(packCarSvg(id, 120), c.name, '車', '#ffcf3d')); }
  for (const [id, n] of diff.cons) { const c = CONS_BY_ID[id]; if (c) out.push(acqSimple(consIcon(c, 64), `${c.name} ×${n}`, '消費アイテム', c.col || '#30d0ff')); }
  for (const [id, n] of diff.packs) { const c = CHESTS.find(x => x.id === id); if (c) out.push(acqSimple(packPouch(c, 0.5), `${c.name} ×${n}`, '未開封に保存', (PACK_ART[id] || {}).b || '#b07aff')); }
  if (diff.dia > 0) out.push(acqSimple(SICO.gem(60), `ダイヤ ×${diff.dia.toLocaleString()}`, 'ダイヤ', '#9ad8ff'));
  if (diff.money > 0) out.push(acqSimple(`<svg viewBox="0 0 48 48" width="60" height="60"><circle cx="24" cy="24" r="20" fill="#ffcf3d" stroke="#c88a00" stroke-width="3"/><text x="24" y="31" font-size="20" font-weight="900" text-anchor="middle" fill="#8a5a00">¥</text></svg>`, yen(diff.money), 'お金', '#ffcf3d'));
  return out; }
// ---------- 何を手に入れたかを前後の差分で調べる ----------
const ACQ_SKIP = new Set(['openChest', 'psBuy', 'psOpen', 'stBox', 'stBoxBuy', 'bxxBuy', 'bxxGo', 'invBoxOpen', 'invPackOpen', 'invOpen', 'rlSpin', 'scBuy', 'scAll', 'stDia', 'dxFree', 'fgSend', 'ccTrade', 'starUp', 'useCons', 'resume', 'restart', 'xsGo', 'giftOpen', 'ofOpen', 'tradeStart', 'tradeAccept', 'tradeConfirm']);
function acqSnap() { const d = SAVE.data, u = (d.unopened && d.unopened.packs) || {}; return { inv: Object.assign({}, d.inv || {}), cons: Object.assign({}, d.cons || {}), cars: d.cars.map(c => c.id), packs: Object.assign({}, u), dia: d.diamonds || 0, money: d.money || 0 }; }
function acqDiff(a, b) { const items = [], cons = [], packs = [], cars = []; for (const k in b.inv) { const n = (b.inv[k] || 0) - (a.inv[k] || 0); if (n > 0) items.push([k, n]); } for (const k in b.cons) { const n = (b.cons[k] || 0) - (a.cons[k] || 0); if (n > 0) cons.push([k, n]); } for (const k in b.packs) { const n = (b.packs[k] || 0) - (a.packs[k] || 0); if (n > 0) packs.push([k, n]); }
  const left = a.cars.slice(); for (const id of b.cars) { const i = left.indexOf(id); if (i >= 0) left.splice(i, 1); else cars.push(id); }
  return { items, cons, packs, cars, dia: b.dia - a.dia, money: b.money - a.money, any: items.length + cons.length + packs.length + cars.length > 0 }; }
{ const _oa = UI.onAction; UI.onAction = function (e) { const b = e.target && e.target.closest && e.target.closest('[data-a]'), a = b && b.dataset.a; if (!a || ACQ_SKIP.has(a) || !SAVE.data) return _oa.apply(this, arguments);
    const s0 = acqSnap(); const r = _oa.apply(this, arguments);
    const check = () => { if (ACQ.mode === 'intro' || (PACKFX.o && PACKFX.o.classList.contains('show'))) return true; if (document.querySelector('#cbFx.show')) return true; const s1 = acqSnap(), d = acqDiff(s0, s1); if (!d.any && !(d.dia > 0 && /Claim|claim|Rw|rw|ach|code|gift|Gift/.test(a))) return false;
      const items = d.items.filter(([id]) => { const it = ITEM_BY_ID[id]; return it && !['ticket'].includes(it.type); }); d.items = items; const cards = acqCards(d); if (cards.length) ACQ.show(cards); return true; };
    setTimeout(() => { if (!check()) setTimeout(check, 700); }, 60); return r; }; }
// ---------- パックを開けるとき：ホログラムのパック出現 → いつものパック開封 ----------
{ const _open = PACKFX.open; PACKFX.open = function (c, res) { if (ACQ._noIntro || !c || c.id === 'giftbox') return _open.call(this, c, res); const self = this; ACQ.intro(c, () => _open.call(self, c, res)); }; }
{ const _cs = CBFX.onClick.bind(CBFX); CBFX.onClick = function (e) { ACQ._noIntro = true; try { return _cs(e); } finally { ACQ._noIntro = false; } }; }
window.__DLX = Object.assign(window.__DLX || {}, { ACQ, acqSnap, acqDiff });
