// =====================================================================
// v55.js — v3.96：特別なエンジン（エンジン音の置き換え・専用パック）・ミニゲーム（ルーレット／スクラッチくじ）
// =====================================================================
// ---------------- 特別なエンジン（エンジン音） ----------------
const ENGINES_X = [
  ['kei3', '軽3気筒ツイン', 'Kei Triple', 'C', 'i4', { h: [1, 0.7, 0.5, 0.2], hi: 0.12, sub: 0.1, rasp: 0.5, bright: 500, crackle: 0.2 }],
  ['i4high', '高回転ハイカム直4', 'High-Cam I4', 'C', 'i4', { hi: 0.4, hiMul: 3, rasp: 0.7, bright: 1100, crackle: 0.4 }],
  ['i6silk', 'シルキー直6', 'Silky I6', 'U', 'i6', { hi: 0.28, hiMul: 3, sub: 0.15, rasp: 0.25, bright: 700, crackle: 0.25 }],
  ['diesel', 'ディーゼルトラック', 'Diesel Truck', 'C', 'diesel', { sub: 0.65, lumpAmt: 0.3, bright: 100 }],
  ['boxer', '水平対向ドロドロ', 'Rumbling Boxer', 'U', 'flat4', { lumpy: 0.8, lumpAmt: 0.45, sub: 0.6, bright: 0 }],
  ['antilag', 'アンチラグ直4ターボ', 'Anti-Lag Turbo I4', 'R', 'i4', { rasp: 0.85, bright: 900, crackle: 1, intake: 0.15 }, 1],
  ['muscle', 'アメリカンV8', 'American V8', 'R', 'v8', { sub: 0.85, lumpy: 0.5, lumpAmt: 0.55, bright: -200, crackle: 0.7 }],
  ['flat6', 'フラット6サウンド', 'Flat-6 Wail', 'R', 'flat6', { hi: 0.3, hiMul: 3, lumpy: 0.2, bright: 800, rasp: 0.6 }],
  ['rotary3', '3ローターロータリー', 'Triple Rotor', 'E', 'rotary', { hi: 0.45, rasp: 0.85, bright: 1400, crackle: 0.8 }],
  ['v10', 'V10スクリーマー', 'V10 Screamer', 'E', 'v10', { hi: 0.5, hiMul: 3, rasp: 0.45, bright: 1500, crackle: 0.35 }],
  ['v12', 'V12グランツーリスモ', 'V12 Gran Turismo', 'E', 'v12', { hi: 0.4, sub: 0.15, bright: 1100, crackle: 0.3 }],
  ['twostroke', '2ストローク', 'Two-Stroke', 'U', 'i4', { h: [1, 0.8, 0.7, 0.6, 0.5, 0.45, 0.4, 0.3, 0.25], hi: 0.3, rasp: 0.95, sub: 0, bright: 1600, crackle: 0.15 }],
  ['ev', '電気モーター', 'Electric Motor', 'R', 'i4', { h: [1, 0.04], h2: [1], hi: 0.7, hiMul: 4, sub: 0, rasp: 0, intake: 0, bright: 2600, crackle: 0, lumpy: 0 }],
  ['turbine', 'ジェットタービン', 'Jet Turbine', 'L', 'v12', { h: [1, 0.12, 0.1, 0.05], h2: [1, 0.1], hi: 0.9, hiMul: 6, sub: 0.2, rasp: 0.12, intake: 0.2, bright: 3200, crackle: 0 }],
  ['w16', 'W16ハイパー', 'W16 Hyper', 'L', 'v12', { h: [1, 0.5, 0.4, 0.3, 0.25, 0.2, 0.15, 0.1], sub: 0.5, hi: 0.3, rasp: 0.55, bright: 600, crackle: 0.5 }, 1],
  ['formula', 'フォーミュラV10', 'Formula V10', 'L', 'v10', { hi: 0.65, hiMul: 4, rasp: 0.5, bright: 2200, sub: 0.05, crackle: 0.3 }],
  ['toy', 'おもちゃのエンジン', 'Toy Engine', 'U', 'i4', { h: [1, 0.2], h2: [1], hi: 0.5, hiMul: 5, sub: 0, rasp: 0.2, bright: 2800, crackle: 0 }],
  ['dragon', '龍のエンジン', 'Dragon Engine', 'L', 'v8', { h: [1, 0.9, 0.7, 0.5, 0.4, 0.3], sub: 1, rasp: 0.9, lumpy: 0.6, lumpAmt: 0.6, bright: -300, crackle: 1 }]
];
const ENGX_BY = {}; for (const [id, nm, en, r, base, snd, turbo] of ENGINES_X) { ENGX_BY[id] = { id, nm, base, snd, turbo: !!turbo }; mkItem({ id: 'eng_' + id, type: 'enginesnd', engX: id, name: '特別なエンジン「' + nm + '」', en: 'Special Engine "' + en + '"', rarity: r, lim: 1, desc: '車のエンジン音を置き換える特別なエンジン（性能は変わりません／「飾り・小物」から装着）' }); }
{ const _ce = AUDIO.createEngine.bind(AUDIO); AUDIO.createEngine = function (spec, isPlayer = true) { try { const id = spec && (spec.engX || (isPlayer && UI.game && UI.game.carInst && UI.game.carInst.look && UI.game.carInst.look.engX)); const X = id && ENGX_BY[id];
      if (X && (spec.engX || invHas('eng_' + id))) spec = Object.assign({}, spec, { sound: X.base, turbo: spec.turbo || X.turbo, car: Object.assign({}, spec.car || {}, { snd: X.snd }) }); } catch (e) { } return _ce(spec, isPlayer); }; }
const ENG_PV = { e: null, t: null };
function previewEngine(id) { AUDIO.init(); AUDIO.resume && AUDIO.resume(); if (!AUDIO.ok) return; clearInterval(ENG_PV.t); if (ENG_PV.e) AUDIO.stopEngine(ENG_PV.e);
  const X = ENGX_BY[id]; const car = SAVE.cur() && CAR_BY_ID[SAVE.cur().id], red = 8000; const e = AUDIO.createEngine({ sound: X ? X.base : (car && car.sound) || 'i4', engX: id, redline: red, turbo: X ? X.turbo : false, boostMax: X && X.turbo ? 1 : 0, car: car || {}, mfType: 'sport' }, true); if (!e) return; ENG_PV.e = e;
  const T0 = performance.now(); ENG_PV.t = setInterval(() => { const t = (performance.now() - T0) / 1000; let rpm, thr; if (t < 0.6) { rpm = 900; thr = 0; } else if (t < 1.6) { rpm = 900 + (t - 0.6) * 6600; thr = 1; } else if (t < 2.0) { rpm = 7500 - (t - 1.6) * 6000; thr = 0; } else if (t < 2.7) { rpm = 5100 + (t - 2.0) * 3500; thr = 1; } else { rpm = Math.max(900, 7500 - (t - 2.7) * 8000); thr = 0; }
    try { AUDIO.updateEngine(e, { gear: 2, rpm, thr, boost: thr, slip: 0, speed: 0, redline: red, limiter: false }); } catch (x) { } if (t > 3.6) { clearInterval(ENG_PV.t); AUDIO.stopEngine(e); ENG_PV.e = null; } }, 30); }
CHESTS.push({ id: 'enginepack', name: '特別なエンジンパック', price: 2000000, odds: { C: 30, U: 33, R: 22, E: 11, L: 4 }, color: '#ff3a3a', pool: 'enginesnd' });
PACK_ART.enginepack = { a: '#2a0606', b: '#ff4a3a', t: 'ENGINES' }; PACK_TIER.enginepack = 3; NEWPOOL.enginesnd = 'enginesnd'; ITEM_TYPES.enginesnd = '特別なエンジン';
COVER_SVG.enginepack = `<rect x="22" y="30" width="56" height="34" rx="4" fill="#9aa0a8" stroke="#555" stroke-width="2.5"/>${[0, 1, 2, 3].map(k => `<rect x="${28 + k * 12}" y="18" width="9" height="14" rx="2" fill="#e10600" stroke="#7a0000" stroke-width="1.5"/>`).join('')}<rect x="26" y="34" width="48" height="6" fill="#c8ccd2"/><text x="50" y="56" font-size="9" font-weight="900" text-anchor="middle" fill="#fff" font-family="Arial">V-MAX</text><path d="M78 40 h10 v14 h-10" fill="#6a6e76"/><path d="M12 46 q-6 6 0 12 M8 42 q-10 10 0 20" stroke="#ffcf3d" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M88 44 q8 4 10 -2 M88 52 q10 2 12 -6" stroke="#ff6a00" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="30" y="64" width="40" height="8" rx="2" fill="#333"/>`;
const engSvg = (s, c = '#ff4a3a') => `<svg viewBox="0 0 48 48" width="${s}" height="${s}"><circle cx="24" cy="24" r="22" fill="${c}" opacity=".15"/><rect x="10" y="18" width="28" height="18" rx="3" fill="#9aa0a8" stroke="#555" stroke-width="2"/>${[0, 1, 2].map(k => `<rect x="${13 + k * 8}" y="11" width="6" height="8" rx="1.5" fill="${c}"/>`).join('')}<path d="M38 22 h6 v10 h-6" fill="#6a6e76"/><path d="M6 24 q-3 3 0 6" stroke="#ffcf3d" stroke-width="2" fill="none"/></svg>`;
{ const _ic = itemIconSvg; itemIconSvg = function (it, size = 34) { if (it && it.type === 'enginesnd') return engSvg(size, RCOL(it.rarity)); return _ic(it, size); }; }
{ const _sh = UI.packStoreHTML; UI.packStoreHTML = function () { let h = _sh.apply(this, arguments); return h.replace(/(data-v="enginepack"[\s\S]*?<span class="ps-kind">)[^<]*/, '$1エンジン音の置き換え'); }; }
// 「飾り・小物」にエンジン音タブ
CM_TABS.push(['engine', 'エンジン音']);
{ const _rc = UI.r_charm; UI.r_charm = function () { if (this.cmTab !== 'engine') return _rc.apply(this, arguments); $('panelTitle').textContent = 'CUSTOM'; const inst = SAVE.cur(), car = CAR_BY_ID[inst.id]; this.show.setCar(inst); const cur = (inst.look || {}).engX || '';
    const tabs = `<div class="cm-tabs">${CM_TABS.map(([k, n]) => `<button class="tab ${k === 'engine' ? 'on' : ''}" data-a="cmTab" data-v="${k}">${n}</button>`).join('')}</div>`;
    const all = ITEMS.filter(i => i.type === 'enginesnd'), own = all.filter(i => invHas(i.id));
    return tabs + `<div class="cm-hero"><div class="gf-cover">${engSvg(66)}</div><div><b>特別なエンジン</b><small>いま乗っている車（${esc(car.name)}）のエンジン音を置き換えます。性能は変わりません。▶ で空ぶかしの音を試し聞きできます。</small><button class="btn" data-a="goPackSp" data-v="enginepack">特別なエンジンパックへ</button></div></div>
      <div class="h3">${own.length} / ${all.length} 所持</div><div class="cm-grid"><button class="cm-it ${!cur ? 'on' : ''}" data-a="setEngX" data-v=""><span class="cm-none">純正</span><b>純正エンジン（${esc(car.sound || '')}）</b><span class="cm-pv" data-a="pvEngX" data-v="">▶</span></button>${all.map(it => { const o = invHas(it.id); return `<button class="cm-it ${cur === it.engX ? 'on' : ''} ${o ? '' : 'lock'}" data-a="${o ? 'setEngX' : 'cmLocked'}" data-v="${it.engX}" style="--rc:${RCOL(it.rarity)}">${engSvg(44, RCOL(it.rarity))}<b>${esc(it.name.replace(/^[^「]*「|」$/g, ''))}</b><small>${RARITY[it.rarity].name}</small>${o ? `<span class="cm-pv" data-a="pvEngX" data-v="${it.engX}">▶</span>` : ''}</button>`; }).join('')}</div>`; }; }
Object.assign(UI, {
  a_setEngX(id) { const inst = SAVE.cur(); inst.look = inst.look || defaultLook(CAR_BY_ID[inst.id]); inst.look.engX = id || ''; SAVE.save(); previewEngine(id); this.render(); },
  a_pvEngX(id) { previewEngine(id); }
});
{ const _gm = UI.goMenu; UI.goMenu = function () { clearInterval(ENG_PV.t); if (ENG_PV.e) { AUDIO.stopEngine(ENG_PV.e); ENG_PV.e = null; } return _gm.apply(this, arguments); }; }

// ---------------- ミニゲーム ----------------
const ROUL_COST = 5, SCR_COST = 3;
const ROULETTE = [
  { t: '¥100,000', k: 'money', a: 100000, w: 26, c: '#2a8aff' }, { t: 'ダイヤ ×3', k: 'dia', a: 3, w: 16, c: '#9ad8ff' },
  { t: '¥500,000', k: 'money', a: 500000, w: 16, c: '#2adc7a' }, { t: 'ブロンズパック', k: 'pack', a: 'bronze', w: 12, c: '#c87a3a' },
  { t: '¥1,500,000', k: 'money', a: 1500000, w: 9, c: '#ffcf3d' }, { t: 'エンジンパック', k: 'pack', a: 'enginepack', w: 6, c: '#ff4a3a' },
  { t: 'ダイヤ ×20', k: 'dia', a: 20, w: 6, c: '#b07aff' }, { t: 'ゴールドパック', k: 'pack', a: 'gold', w: 5, c: '#ffd84a' },
  { t: '¥5,000,000', k: 'money', a: 5000000, w: 2.5, c: '#ff7ad8' }, { t: 'JACKPOT ダイヤ ×100', k: 'dia', a: 100, w: 1.5, c: '#ff2a5a', jp: 1 }
];
const SCR_SYM = { coin: { t: '¥300,000', k: 'money', a: 300000, w: 22 }, clover: { t: '¥1,000,000', k: 'money', a: 1000000, w: 10 }, star: { t: 'シルバーパック', k: 'pack', a: 'silver', w: 9 }, gem: { t: 'ダイヤ ×10', k: 'dia', a: 10, w: 6 }, car: { t: 'ゴールドパック', k: 'pack', a: 'gold', w: 4 }, crown: { t: 'ダイヤ ×50', k: 'dia', a: 50, w: 1.2 } };
const SCR_LOSE_W = 47;
const symSvg = (k, s = 40) => ({
  coin: `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><circle cx="20" cy="20" r="16" fill="#ffcf3d" stroke="#c88a00" stroke-width="3"/><text x="20" y="26" font-size="16" font-weight="900" text-anchor="middle" fill="#a06a00">¥</text></svg>`,
  clover: `<svg viewBox="0 0 40 40" width="${s}" height="${s}">${[0, 90, 180, 270].map(a => `<circle cx="20" cy="12" r="7" fill="#2adc7a" transform="rotate(${a} 20 20)"/>`).join('')}<path d="M20 20 q4 10 8 16" stroke="#1a8a4a" stroke-width="3" fill="none"/></svg>`,
  star: `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><path d="M20 3 l5 11 12 1 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1z" fill="#d8dee6" stroke="#7a828c" stroke-width="2"/></svg>`,
  gem: `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><path d="M10 14 L20 4 L30 14 L20 36z" fill="#9ad8ff" stroke="#2a8aff" stroke-width="2"/><path d="M10 14 h20" stroke="#fff" stroke-width="1.5"/></svg>`,
  car: `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><path d="M4 26 l4 -8 h8 l4 -6 h10 l6 8 v6z" fill="#ffd84a" stroke="#a06a00" stroke-width="2"/><circle cx="12" cy="28" r="4" fill="#222"/><circle cx="30" cy="28" r="4" fill="#222"/></svg>`,
  crown: `<svg viewBox="0 0 40 40" width="${s}" height="${s}"><path d="M6 30 L8 10 L15 20 L20 6 L25 20 L32 10 L34 30z" fill="#ffcf3d" stroke="#c88a00" stroke-width="2"/><circle cx="20" cy="6" r="3" fill="#ff3a5a"/></svg>`
})[k] || '';
const wpick = arr => { const tot = arr.reduce((a, b) => a + b.w, 0); let r = Math.random() * tot; for (const x of arr) { if ((r -= x.w) < 0) return x; } return arr[arr.length - 1]; };
function grantPrize(p) { const d = SAVE.data; if (p.k === 'money') SAVE.addMoney(p.a); else if (p.k === 'dia') d.diamonds = (d.diamonds || 0) + p.a; else if (p.k === 'pack') { const u = unopened(); u.packs[p.a] = (u.packs[p.a] || 0) + 1; } SAVE.save(); }
const prizeMsg = p => p.k === 'pack' ? `${p.t} を手に入れました（ストア → 未開封 から開けられます）` : `${p.t} を手に入れました！`;
const MG = { spinning: false, angle: 0, scr: null };
Object.assign(UI, {
  r_minigame() { $('panelTitle').textContent = 'MINI GAMES'; this.show.setCar(SAVE.cur()); const tab = this.mgTab || 'roulette', d = SAVE.data, dia = d.diamonds || 0;
    let h = `<div class="cm-tabs"><button class="tab ${tab === 'roulette' ? 'on' : ''}" data-a="mgTab" data-v="roulette">ルーレット</button><button class="tab ${tab === 'scratch' ? 'on' : ''}" data-a="mgTab" data-v="scratch">スクラッチくじ</button></div><div class="mg-bal">${SICO.gem(16)} 所持ダイヤ <b>${dia.toLocaleString()}</b></div>`;
    if (tab === 'roulette') { const n = ROULETTE.length, seg = 360 / n;
      const wheel = `<svg viewBox="-110 -110 220 220" class="rl-svg">${ROULETTE.map((p, i) => { const a0 = (i * seg - 90) * Math.PI / 180, a1 = ((i + 1) * seg - 90) * Math.PI / 180, mid = (i + 0.5) * seg; return `<path d="M0 0 L${Math.cos(a0) * 100} ${Math.sin(a0) * 100} A100 100 0 0 1 ${Math.cos(a1) * 100} ${Math.sin(a1) * 100}z" fill="${p.c}" stroke="#111" stroke-width="1.5"/><g transform="rotate(${mid}) translate(0 -62) rotate(90)"><text font-size="${p.t.length > 9 ? 7 : 8.5}" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="${['#ffcf3d', '#ffd84a', '#9ad8ff', '#2adc7a'].includes(p.c) ? '#111' : '#fff'}">${esc(p.t)}</text></g>`; }).join('')}<circle r="16" fill="#111" stroke="#ffcf3d" stroke-width="3"/><text font-size="8" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="#ffcf3d">DL</text></svg>`;
      h += `<div class="rl-wrap"><div class="rl-ptr"></div><div class="rl-wheel" id="rlWheel" style="transform:rotate(${MG.angle}deg)">${wheel}</div>${Array.from({ length: 16 }, (_, k) => `<i class="rl-bulb" style="--a:${k * 22.5}deg;--k:${k}"></i>`).join('')}</div>
        <button class="mg-go" data-a="rlSpin" ${dia >= ROUL_COST ? '' : 'disabled'}>${SICO.gem(18)} ${ROUL_COST} で回す</button><div class="mg-odds"><b>景品と確率</b>${ROULETTE.map(p => `<span><i style="background:${p.c}"></i>${esc(p.t)} <em>${(p.w / ROULETTE.reduce((a, b) => a + b.w, 0) * 100).toFixed(1)}%</em></span>`).join('')}</div>`; }
    else { const S = MG.scr;
      h += `<div class="sc-card"><div class="sc-head"><b>SCRATCH & WIN</b><small>同じマークが3つそろえば当たり！</small></div><div class="sc-area" id="scArea">${S ? `<div class="sc-grid">${S.grid.map(k => `<div class="sc-cell ${S.win && k === S.win ? 'hit' : ''}">${symSvg(k, 38)}</div>`).join('')}</div><canvas id="scCv"></canvas>` : `<div class="sc-empty">${SICO.gem(28)}<b>${SCR_COST} ダイヤで1枚</b><small>指やマウスでけずってね</small></div>`}</div>
        ${S ? `<div class="sc-res" id="scRes">${S.done ? (S.win ? `<b class="ok">当たり！ ${esc(SCR_SYM[S.win].t)}</b>` : '<b>ざんねん… はずれ</b>') : 'けずってみよう！'}</div><div class="btns"><button class="btn" data-a="scAll" ${S.done ? 'disabled' : ''}>全部けずる</button><button class="btn pri" data-a="scBuy" ${dia >= SCR_COST && S.done ? '' : 'disabled'}>${SICO.gem(14)} ${SCR_COST} でもう1枚</button></div>` : `<button class="mg-go" data-a="scBuy" ${dia >= SCR_COST ? '' : 'disabled'}>${SICO.gem(18)} ${SCR_COST} でくじを買う</button>`}</div>
        <div class="mg-odds"><b>当たりのマーク</b>${Object.entries(SCR_SYM).map(([k, p]) => `<span>${symSvg(k, 20)} ×3 → ${esc(p.t)}</span>`).join('')}</div>`;
      if (S && !S.done) setTimeout(() => this.scBind(), 30); }
    if (dia < Math.min(ROUL_COST, SCR_COST)) h += `<div class="note">ダイヤが足りません。ストアの「ダイヤ」で手に入ります。</div>`;
    return h; },
  a_mgTab(k) { this.mgTab = k; this.render(); },
  a_rlSpin() { if (MG.spinning) return; const d = SAVE.data; if ((d.diamonds || 0) < ROUL_COST) return this.toast('ダイヤが足りません'); d.diamonds -= ROUL_COST; const p = wpick(ROULETTE), i = ROULETTE.indexOf(p); grantPrize(p); this.refreshTop(); MG.spinning = true;
    const seg = 360 / ROULETTE.length, target = 360 - (i + 0.5) * seg + (Math.random() - 0.5) * seg * 0.6; MG.angle = MG.angle - (MG.angle % 360) + 360 * 6 + target; const w = $('rlWheel'); AUDIO.click && AUDIO.click();
    const btn = document.querySelector('[data-a=rlSpin]'); if (btn) btn.disabled = true; if (w) { w.style.transition = 'transform 4.2s cubic-bezier(.12,.6,.1,1)'; w.style.transform = `rotate(${MG.angle}deg)`; }
    let ticks = 0; const tk = setInterval(() => { if (++ticks > 34) return clearInterval(tk); AUDIO.tone && AUDIO.tone(1400 - ticks * 25, 0.03, 'square', 0.05); }, 40 + 0);
    setTimeout(() => { MG.spinning = false; if (p.jp) { GFX.play('rays'); AUDIO.fanfare && AUDIO.fanfare(); } else if (p.w <= 6) { GFX.play('confetti'); AUDIO.buy && AUDIO.buy(); } else AUDIO.buy && AUDIO.buy(); this.toast(prizeMsg(p)); if (this.screen === 'minigame' || (this.screen === 'store' && this.stTab === 'mini')) this.render(); }, 4400); },
  a_scBuy() { const d = SAVE.data; if ((d.diamonds || 0) < SCR_COST) return this.toast('ダイヤが足りません'); if (MG.scr && !MG.scr.done) return; d.diamonds -= SCR_COST;
    const opts = Object.entries(SCR_SYM).map(([k, p]) => ({ k, w: p.w })).concat([{ k: null, w: SCR_LOSE_W }]), r = wpick(opts), keys = Object.keys(SCR_SYM); let grid;
    for (let tries = 0; tries < 200; tries++) { const cnt = {}; grid = []; if (r.k) { grid.push(r.k, r.k, r.k); cnt[r.k] = 3; } while (grid.length < 9) { const k = keys[(Math.random() * keys.length) | 0]; if (k === r.k || (cnt[k] || 0) >= 2) continue; cnt[k] = (cnt[k] || 0) + 1; grid.push(k); } grid.sort(() => Math.random() - 0.5); break; }
    MG.scr = { grid, win: r.k, done: false }; if (r.k) grantPrize(SCR_SYM[r.k]); SAVE.save(); this.refreshTop(); AUDIO.click && AUDIO.click(); this.render(); },
  scBind() { const cv = $('scCv'), area = $('scArea'); if (!cv || !area || cv._b) return; cv._b = 1; const r = area.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); cv.width = r.width * dpr; cv.height = r.height * dpr; const g = cv.getContext('2d');
    const gr = g.createLinearGradient(0, 0, cv.width, cv.height); gr.addColorStop(0, '#c8ccd2'); gr.addColorStop(0.5, '#eef1f5'); gr.addColorStop(1, '#a8aeb6'); g.fillStyle = gr; g.fillRect(0, 0, cv.width, cv.height);
    g.fillStyle = 'rgba(90,96,104,.5)'; g.font = `900 ${18 * dpr}px Arial`; g.textAlign = 'center'; for (let y = 30; y < r.height; y += 46) for (let x = 40; x < r.width; x += 96) g.fillText('SCRATCH', x * dpr, y * dpr);
    g.globalCompositeOperation = 'destination-out'; let down = false, last = null, n = 0;
    const pt = e => { const b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * dpr, (e.clientY - b.top) * dpr]; };
    const draw = e => { const p = pt(e); g.lineWidth = 34 * dpr; g.lineCap = 'round'; g.beginPath(); g.moveTo(...(last || p)); g.lineTo(...p); g.stroke(); last = p; if (++n % 8 === 0) { AUDIO.noiseBurst && AUDIO.noiseBurst(0.05, 3000, 1, 0.03); this.scCheck(g, cv); } };
    cv.addEventListener('pointerdown', e => { down = true; last = null; try { cv.setPointerCapture(e.pointerId); } catch (x) { } draw(e); e.preventDefault(); });
    cv.addEventListener('pointermove', e => { if (down) { draw(e); e.preventDefault(); } }); const up = () => { down = false; last = null; this.scCheck(g, cv); }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); },
  scCheck(g, cv) { if (!MG.scr || MG.scr.done) return; const data = g.getImageData(0, 0, cv.width, cv.height).data; let clear = 0, tot = 0; for (let i = 3; i < data.length; i += 64) { tot++; if (data[i] < 40) clear++; } if (clear / tot > 0.6) this.a_scAll(); },
  a_scAll() { const S = MG.scr; if (!S || S.done) return; S.done = true; const cv = $('scCv'); if (cv) { cv.style.transition = 'opacity .5s'; cv.style.opacity = 0; } setTimeout(() => { if (S.win) { const p = SCR_SYM[S.win]; GFX.play(S.win === 'crown' ? 'rays' : 'coins'); AUDIO.buy && AUDIO.buy(); this.toast(prizeMsg(p)); } else AUDIO.error && AUDIO.error(); if (this.screen === 'minigame' || (this.screen === 'store' && this.stTab === 'mini')) this.render(); }, 450); }
});
{ const _mi = UI.menuItems; UI.menuItems = function () { _mi.apply(this, arguments); const el = $('menuList'), pills = el && el.querySelectorAll('.nm-pills')[0]; if (pills && !pills.querySelector('[data-m="minigame"]')) pills.insertAdjacentHTML('beforeend', `<button class="nm-pill" data-m="minigame"><span class="nmc-ic">${symSvg('crown', 20)}</span><span>ミニゲーム</span></button>`); }; }
BNAV_OF.minigame = 'shop';
window.__DLX = Object.assign(window.__DLX || {}, { packPool, ENGX_BY, previewEngine, MG, ROULETTE, SCR_SYM });
{ const _po = UI.a_psOpen; UI.a_psOpen = function (id) { const r = _po.apply(this, arguments); const lg = document.querySelector('.pr-legend'); if (lg && !lg.children.length) { const parts = lg.textContent.split(/　+/).filter(Boolean); if (parts.length === 2) lg.innerHTML = `<span>${esc(parts[0])}</span><span>${esc(parts[1])}</span>`; } return r; }; }
