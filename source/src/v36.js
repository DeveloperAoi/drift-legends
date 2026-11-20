// =====================================================================
// v36.js — ミシック（Mythic）レア度・新カードパック（パーツ／スタイル／ミシック）・パックからダイヤとお金
//          パック詳細にレア度別の出現アイテム一覧・レジェンダリー/ミシックの豪華演出と3Dカードビュー
// =====================================================================
RARITY.M = { name: 'ミシック', color: '#ff2a7a', dup: 12000000, shop: 25000000 }; RAR_ORDER.push('M');
// ---- ミシックアイテム ----
{ const M = (o) => { const it = addItem(Object.assign({ rarity: 'M', mythic: 1 }, o)); return it; };
  [['オーロラクローム', 'Aurora Chrome', '#c8f0ff', 'chrome'], ['ブラックホール', 'Black Hole', '#07070c', 'pearl'], ['ネビュラパープル', 'Nebula Purple', '#5a1aa8', 'pearl'], ['プリズムホワイト', 'Prism White', '#ffffff', 'diamond'],
   ['ドラゴンスケール', 'Dragon Scale', '#0a6a3a', 'metallic'], ['ゴールドラッシュ', 'Gold Rush', '#e8b030', 'chrome'], ['マグマレッド', 'Magma Red', '#b8100a', 'pearl'], ['アイスファントム', 'Ice Phantom', '#bfe9ff', 'diamond']]
    .forEach(([nm, en, c, p], i) => M({ id: 'mp_' + i, type: 'paint', name: nm, en, color: c, paint: p, desc: 'ミシック限定カラー' }));
  [['ギャラクシー', 'Galaxy', [0.6, 0.3, 1], 1], ['フェニックス', 'Phoenix', [1, 0.35, 0.05]], ['プラズマ', 'Plasma', [0.2, 0.9, 1]], ['ブラッドムーン', 'Blood Moon', [1, 0.02, 0.1]]]
    .forEach(([nm, en, rgb, rb], i) => M({ id: 'mn_' + i, type: 'neon', name: nm + 'ネオン', en: en + ' Neon', rgb, rainbow: !!rb }));
  [['神速', '#000', '#ff2a7a', 'serif'], ['天下無双', '#1a0030', '#ffd400', 'serif'], ['MYTHIC', '#ff2a7a', '#fff', 'Arial'], ['龍', '#0a0a0a', '#e8b030', 'serif']]
    .forEach(([t, bg, fg, font], i) => M({ id: 'md_' + i, type: 'decal', name: '「' + t + '」ミシックステッカー', en: '"' + t + '" mythic sticker', kind: 'text', text: t, bg, fg, font }));
  [['crown', '#ff2a7a', 'ミシッククラウン', 'Mythic Crown', '#ffd400'], ['flames', '#ff2a7a', '神炎', 'Divine Flame', '#ffd400'], ['wings', '#ffd400', '天使の翼・金', 'Golden Angel Wings'], ['neon', '#ff2a7a', 'ミシックネオン', 'Mythic Neon']]
    .forEach(([k, c, nm, en, c2], i) => M({ id: 'mpf_' + i, type: 'pframe', name: 'フレーム「' + nm + '」', en: 'Frame "' + en + '"', fk: k, c1: c, c2: c2 || c, desc: 'ミシックのフレーム' }));
  [['rainbow', '#ffffff', '神々の虹', 'Divine Rainbow'], ['bolt', '#ff2a7a', 'ミシックサンダー', 'Mythic Thunder'], ['orbit', '#ff2a7a', 'ミシックオービット', 'Mythic Orbit']]
    .forEach(([k, c, nm, en], i) => M({ id: 'mpe_' + i, type: 'peffect', name: 'エフェクト「' + nm + '」', en: 'Effect "' + en + '"', ek: k, c1: c, desc: 'ミシックのエフェクト' }));
  [['grid', '#1a0010', '#ff2a7a', 'ミシックグリッド', 'Mythic Grid'], ['sunset', '#1a0030', '#ff2a7a', '神域の夕焼け', 'Divine Dusk']]
    .forEach(([k, a, b, nm, en], i) => M({ id: 'mpb_' + i, type: 'pbanner', name: 'バナー「' + nm + '」', en: 'Banner "' + en + '"', bk: k, c1: a, c2: b, desc: 'ミシックのバナー' }));
  [['伝説を超えし者', 'Beyond Legend'], ['峠の神', 'God of the Pass'], ['MYTHIC DRIVER', 'MYTHIC DRIVER']].forEach(([nm, en], i) => M({ id: 'mtt_' + i, type: 'title', name: '称号「' + nm + '」', en: 'Title "' + en + '"', title: nm, titleEn: en, desc: 'ミシックの称号' }));
  addCar(['my_kirin', 'LEGEND', 'KIRIN AURORA "MYTHIC"', 'ミシック限定・虹色に輝くハイパーカー（カード限定）', '4WD', 1200, 1100, 1350, 380, 8, 9200, 1, 98, 92, 97, 0, 'super', 4.7, 2.0, 1.12, '#c8f0ff', 0, 'v12', 2.8, 0.5, { chest: 1, cards: 1 }]); CAR_BY_ID.my_kirin.isNew = '3.01';
  CAR_CARDS.my_kirin = { need: 40 }; for (const [n, r] of [[1, 'L'], [3, 'M'], [8, 'M']]) M({ id: `cc_my_kirin_${n}`, type: 'carcard', car: 'my_kirin', cards: n, rarity: r, name: `KIRIN AURORA カード ×${n}`, en: `KIRIN AURORA card x${n}` });
}
// ---- パックから出るダイヤ・お金 ----
const PRIZE = { C: [50000, 5], U: [150000, 15], R: [500000, 40], E: [1500000, 100], L: [5000000, 300], M: [15000000, 800] };
for (const r of Object.keys(PRIZE)) { addItem({ id: 'cash_' + r, type: 'cash', rarity: r, amount: PRIZE[r][0], name: yen(PRIZE[r][0]), en: yen(PRIZE[r][0]), mythic: r === 'M' ? 1 : 0 }); addItem({ id: 'dia_' + r, type: 'dia', rarity: r, amount: PRIZE[r][1], name: 'ダイヤ ×' + PRIZE[r][1], en: 'Diamonds x' + PRIZE[r][1], mythic: r === 'M' ? 1 : 0 }); }
ITEM_TYPES.cash = 'お金'; ITEM_TYPES.dia = 'ダイヤ';
for (const it of ITEMS) ITEM_BY_ID[it.id] = it;
{ const _has = invHas; invHas = function (id) { const it = ITEM_BY_ID[id]; if (it && (it.type === 'cash' || it.type === 'dia')) return false; return _has(id); };
  const _g = grantChestItem; grantChestItem = function (it) { if (it && it.type === 'cash') { SAVE.addMoney(it.amount); return { isNew: true, refund: 0 }; } if (it && it.type === 'dia') { const d = SAVE.data; d.diamonds = (d.diamonds || 0) + it.amount; return { isNew: true, refund: 0 }; } return _g(it); };
  const _ic = itemIconSvg; itemIconSvg = function (it, size = 34) { if (it && it.type === 'cash') return `<span class="pz">${SICO.yen(size)}</span>`; if (it && it.type === 'dia') return `<span class="pz">${SICO.gem(size)}</span>`; return _ic(it, size); };
  const _ds = dailyShop; dailyShop = function (k) { return _ds(k).filter(i => !i.mythic && i.type !== 'cash' && i.type !== 'dia' && i.rarity !== 'M'); }; }

// ---- カードパックのラインナップ ----
{ const i = CHESTS.findIndex(c => c.id === 'carpack'); if (i >= 0) CHESTS.splice(i, 1); }
for (const b of BUNDLES) b.items = b.items.map(x => x[0] === 'pack' && x[1] === 'carpack' ? ['pack', 'gold', x[2]] : x); BUNDLES.find(b => b.id === 'b_full').desc = 'フルチューンチケット×2 ＋ ゴールドパック×1';
const PACK_TYPES = { parts: ['wheel', 'kit', 'tune', 'caliper', 'muffler'], style: ['paint', 'decal', 'neon', 'plate', 'meter', 'bg', 'music'] };
CHESTS.splice(CHESTS.findIndex(c => c.id === 'gold'), 0, { id: 'parts', name: 'パーツカードパック', price: 1200000, odds: { C: 30, U: 35, R: 24, E: 9, L: 2 }, color: '#ff8a2a', pool: 'parts' }, { id: 'style', name: 'スタイルカードパック', price: 1200000, odds: { C: 30, U: 35, R: 24, E: 9, L: 2 }, color: '#2affd0', pool: 'style' });
CHESTS.push({ id: 'mythic', name: 'ミシックカードパック', price: 15000000, odds: { C: 0, U: 0, R: 40, E: 35, L: 18, M: 7 }, color: '#ff2a7a', pool: 'mythic' });
Object.assign(PACK_ART, { parts: { a: '#3a1806', b: '#ff8a2a', t: 'PARTS' }, style: { a: '#06302a', b: '#2affd0', t: 'STYLE' }, mythic: { a: '#2a0018', b: '#ff2a7a', t: 'MYTHIC' } });
const CARD_PACKS = ['gold', 'legend', 'mythic', 'xmaspack']; // 車カードが入るパック
function packPool(c, rar) { const p = c.pool, ok = i => i.rarity === rar;
  if (p === 'prof') return ITEMS.filter(i => ok(i) && PROF_TYPES.includes(i.type) && !i.lim && !i.mythic);
  if (p === 'xmas') return ITEMS.filter(i => ok(i) && i.xmas);
  if (p === 'parts' || p === 'style') return ITEMS.filter(i => ok(i) && PACK_TYPES[p].includes(i.type) && !i.lim && !i.mythic).concat(ITEMS.filter(i => ok(i) && (i.type === 'cash' || i.type === 'dia')));
  const cards = CARD_PACKS.includes(c.id);
  return ITEMS.filter(i => ok(i) && !i.xmas && !i.lim && (p === 'mythic' || !i.mythic) && (cards || i.type !== 'carcard')); }
function packFeatPool(c, rar) { const L = packPool(c, rar); const rank = i => (i.type === 'carcard' || i.type === 'car') ? 0 : i.type === 'ticket' ? 1 : (i.type === 'cash' || i.type === 'dia') ? 3 : 2; const seen = new Set(); return L.slice().sort((a, b) => rank(a) - rank(b)).filter(i => { const k = i.type === 'carcard' ? i.car : i.id; if (seen.has(k)) return false; seen.add(k); return true; }); }
{ let boxCnt = 0, boxHit = false; const _rc = rollChest;
  rollChest = function (chest, rnd = Math.random) { const def = CHESTS.find(x => x.id === chest.id) || chest; const odds = chest.odds || def.odds;
    let x = rnd() * 100, rar = 'C'; for (const r of RAR_ORDER) { const p = odds[r] || 0; if (x < p) { rar = r; break; } x -= p; }
    if (UI._boxGuar) { boxCnt++; if (rar === 'E' || rar === 'L' || rar === 'M') boxHit = true; if (boxCnt >= 10) { if (!boxHit) rar = rnd() < 0.85 ? 'E' : 'L'; boxCnt = 0; boxHit = false; UI._boxGuar = false; } }
    let pool = packPool(def, rar); if (!pool.length) { for (const r of ['L', 'E', 'R', 'U', 'C']) { pool = packPool(def, r); if (pool.length) break; } }
    const cards = pool.filter(i => i.type === 'carcard'), prizes = pool.filter(i => i.type === 'cash' || i.type === 'dia'), tk = pool.filter(i => i.type === 'ticket'), rest = pool.filter(i => !cards.includes(i) && !prizes.includes(i) && !tk.includes(i));
    const y = rnd(); // 種類ごとの出やすさ
    if (cards.length && y < 0.14) return cards[Math.floor(rnd() * cards.length)];
    if (prizes.length && y < 0.26) return prizes[Math.floor(rnd() * prizes.length)];
    if (tk.length && y < 0.32) return tk[0];
    const L = rest.length ? rest : pool; return L[Math.floor(rnd() * L.length)]; }; }
PACKFX.cols = (function (o) { return function (r) { return r === 'M' ? ['#ff2a7a', '#ff9ad0', '#b04dff', '#ffd400', '#ffffff'] : o.call(this, r); }; })(PACKFX.cols);

// ---- パック詳細：レア度ごとの出現アイテム一覧（横スクロール） ----
{ const _fc = featCard; featCard = function (it) { if (it.type === 'cash' || it.type === 'dia') { const R = RARITY[it.rarity]; return `<div class="fc" style="--rc:${R.color}"><span class="fc-main">${it.type === 'cash' ? 'お金' : 'ダイヤ'}</span><div class="fc-top"><span class="fc-kind">報酬</span></div><div class="fc-it">${itemIconSvg(it, 64)}</div><div class="fc-bot"><span class="fc-r">${it.rarity}</span><b>${esc(it.name)}</b><small>${R.name}</small></div></div>`; } return _fc(it); }; }
UI.a_psOpen = (function (orig) { return function (id) { orig.call(this, id); const c = CHESTS.find(x => x.id === id), box = document.querySelector('.pd-cards'); if (!c || !box) return;
  const groups = [...RAR_ORDER].reverse().filter(r => (c.odds[r] || 0) > 0).map(r => { const L = packFeatPool(c, r), R = RARITY[r]; if (!L.length) return '';
    return `<div class="pr-grp" style="--rc:${R.color}"><div class="pr-tag"><b>${R.name}</b><span>${c.odds[r]}%</span><small>${L.length}種類</small></div>${L.slice(0, 30).map(featCard).join('')}${L.length > 30 ? `<div class="pr-more">ほか ${L.length - 30} 種類</div>` : ''}</div>`; }).join('');
  const rows = `<div class="pr-scroll one">${groups}</div><div class="pr-legend">← ${RARITY[[...RAR_ORDER].reverse().find(r => (c.odds[r] || 0) > 0)].name}　　　　${RARITY[RAR_ORDER.find(r => (c.odds[r] || 0) > 0)].name} →</div>`;
  box.outerHTML = `<div class="pr-list">${rows}</div>`; const m = document.querySelector('.pd-modal'); if (m) m.classList.add('pd-wide'); }; })(UI.a_psOpen);

// ---- レジェンダリー／ミシックの豪華演出と3Dカードビュー ----
PACKFX.next = (function (orig) { return function () { const i = this.i + 1, r = this.res[i] && this.res[i].it.rarity; let saved = null;
  if (r === 'M') { saved = this.res[i].it; this.res[i] = Object.assign({}, this.res[i], { it: Object.assign({}, saved, { rarity: 'L' }) }); }
  orig.call(this); if (saved) this.res[i] = Object.assign({}, this.res[i], { it: saved });
  if (r === 'L' || r === 'M') this.deluxe(i, r); }; })(PACKFX.next);
PACKFX.deluxe = function (i, r) { const o = this.o, el = o.querySelectorAll('.cardx')[i]; if (!el) return; const M = r === 'M';
  o.classList.add('shake'); setTimeout(() => o.classList.remove('shake'), 700);
  const ban = document.createElement('div'); ban.className = 'pfx-ban ' + (M ? 'm' : 'l'); ban.innerHTML = `<b>${M ? 'MYTHIC!!' : 'LEGENDARY!'}</b><small>${M ? 'ミシック' : 'レジェンダリー'}</small>`; o.appendChild(ban); setTimeout(() => ban.classList.add('in'), 950); setTimeout(() => ban.remove(), 3600);
  [1000, 1350, 1700, 2100].forEach((t, k) => setTimeout(() => { this.burst(M ? 70 : 45, this.cols(r), [0.15, 0.85][k % 2], 0.3 + Math.random() * 0.3, 1.1); }, t));
  setTimeout(() => { try { const notes = M ? [523, 659, 784, 1046, 1318, 1568] : [523, 659, 784, 1046]; notes.forEach((f, k) => AUDIO.tone(f, 0.5, 'triangle', 0.08, k * 0.09)); AUDIO.tone(M ? 130 : 98, 1.4, 'sawtooth', 0.06, 0, 0.5); AUDIO.noiseBurst(1.2, 6000, 0.6, 0.12, 0.05, 'highpass'); } catch (e) { } }, 980);
  setTimeout(() => { el.classList.add('c3d', M ? 'cm' : 'cl'); if (!el.querySelector('.cx-3d')) el.insertAdjacentHTML('beforeend', `<button class="cx-3d" data-p="view3d" data-i="${i}">3Dで見る</button>`); }, 1000); };
PACKFX.onClick = (function (orig) { return function (e) { const b = e.target.closest('[data-p="view3d"]'); if (b) { e.stopPropagation(); return this.view3d(+b.dataset.i); } return orig.call(this, e); }; })(PACKFX.onClick);
PACKFX.view3d = function (i) { const r = this.res[i]; if (!r) return; const it = r.it, R = RARITY[it.rarity], M = it.rarity === 'M'; const card = this.o.querySelectorAll('.cardx')[i]; const front = card ? card.querySelector('.cx-front') : null;
  const v = document.createElement('div'); v.id = 'card3d'; v.innerHTML = `<div class="c3-stage"><div class="c3-card ${M ? 'm' : 'l'}" style="--rc:${R.color}"><div class="c3-face c3-front">${front ? front.innerHTML : itemIconSvg(it, 120)}<div class="c3-holo"></div></div><div class="c3-face c3-back"><div class="cx-logo">DL</div><small>DRIFT LEGENDS</small></div></div></div><div class="c3-tip">ドラッグで回転 ・ タップで閉じる</div>`;
  document.body.appendChild(v); AUDIO.pkFlip && AUDIO.pkFlip(); const cardEl = v.querySelector('.c3-card'); let ry = -18, rx = 8, drag = null, moved = false, auto = true, last = performance.now();
  const set = () => { cardEl.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; cardEl.style.setProperty('--hx', (50 + Math.sin(ry * Math.PI / 180) * 50) + '%'); };
  const tick = t => { if (!v.isConnected) return; const dt = (t - last) / 1000; last = t; if (auto) ry += dt * 28; set(); requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  v.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY, ry, rx]; moved = false; auto = false; v.setPointerCapture(e.pointerId); });
  v.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag[0], dy = e.clientY - drag[1]; if (Math.abs(dx) + Math.abs(dy) > 6) moved = true; ry = drag[2] + dx * 0.6; rx = clamp(drag[3] - dy * 0.4, -40, 40); });
  v.addEventListener('pointerup', () => { if (!moved) v.remove(); drag = null; setTimeout(() => { auto = true; }, 1800); }); };
window.__DLX = Object.assign(window.__DLX || {}, { packPool, PRIZE, PACKFX });
