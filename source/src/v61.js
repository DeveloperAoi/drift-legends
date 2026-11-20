// =====================================================================
// v61.js — v4.2：エアフレッシュナー（香りのエフェクト・専用パック）・ガレージの模様替え（専用パック）・
//          ダッシュボード飾りの実績・フレンドへのプレゼント
// =====================================================================
// ---------------- エアフレッシュナー ----------------
const FRESH = [
  ['pine', 'パイン', 'Pine', 'C', 'tree', '#2fbf71', [0.3, 0.9, 0.45]], ['vanilla', 'バニラ', 'Vanilla', 'C', 'tree', '#f4e2b0', [1, 0.92, 0.7]], ['citrus', 'シトラス', 'Citrus', 'C', 'circle', '#ffcf3d', [1, 0.85, 0.2]],
  ['ocean', 'オーシャン', 'Ocean Breeze', 'C', 'tree', '#3ac8ff', [0.3, 0.75, 1]], ['cherry', 'チェリー', 'Cherry', 'U', 'cherry', '#e0102a', [1, 0.2, 0.3]], ['lavender', 'ラベンダー', 'Lavender', 'U', 'tree', '#b07aff', [0.7, 0.5, 1]],
  ['mint', 'ミント', 'Mint', 'U', 'leaf', '#7ae8c8', [0.5, 1, 0.85]], ['sakura', 'さくら', 'Sakura', 'U', 'flower', '#ffb0c8', [1, 0.7, 0.82]], ['cola', 'コーラ', 'Cola', 'R', 'can', '#8a2a10', [0.65, 0.3, 0.15]],
  ['coffee', 'コーヒー', 'Coffee', 'U', 'circle', '#6a4020', [0.55, 0.35, 0.2]], ['berry', 'ストロベリー', 'Strawberry', 'R', 'heart', '#ff4a6a', [1, 0.35, 0.5]], ['peach', 'ピーチ', 'Peach', 'R', 'heart', '#ffa080', [1, 0.65, 0.5]],
  ['blackice', 'ブラックアイス', 'Black Ice', 'R', 'tree', '#18181c', [0.6, 0.85, 1]], ['newcar', '新車の香り', 'New Car Smell', 'E', 'car', '#c8ccd2', [0.9, 0.92, 0.98]], ['yuzu', 'ゆず', 'Yuzu', 'E', 'circle', '#f4d020', [1, 0.95, 0.3]],
  ['matcha', '抹茶', 'Matcha', 'E', 'leaf', '#5a9a2a', [0.5, 0.8, 0.3]], ['bubble', 'バブルガム', 'Bubblegum', 'E', 'star', '#ff7ad8', [1, 0.5, 0.9]], ['gold', 'ゴールドラッシュ', 'Gold Rush', 'L', 'star', '#ffcf3d', [1, 0.85, 0.3]],
  ['rainbow', 'レインボー', 'Rainbow', 'L', 'tree', 'url(#frRb)', null], ['galaxy', 'ギャラクシー', 'Galaxy', 'L', 'star', '#5a2aff', [0.6, 0.4, 1]]
];
const FRESH_BY = {}; for (const [id, nm, en, r, sh, col, rgb] of FRESH) { FRESH_BY[id] = { id, nm, sh, col, rgb }; mkItem({ id: 'frs_' + id, type: 'fresh', freshX: id, name: 'エアフレッシュナー「' + nm + '」', en: 'Air Freshener "' + en + '"', rarity: r, lim: 1, desc: 'ミラーに吊るすエアフレッシュナー。レース中、車のまわりに香りのエフェクトが出る（「飾り・小物」の「エアフレッシュナー」タブから）' }); }
ITEM_TYPES.fresh = 'エアフレッシュナー';
function freshSvg(id, s = 40) { const F = FRESH_BY[id] || FRESH_BY.pine, c = F.col, dk = 'rgba(0,0,0,.25)'; const body = {
  tree: `<path d="M24 8 L36 24 H31 L40 38 H33 L42 52 H6 L15 38 H8 L17 24 H12z" fill="${c}" stroke="${dk}" stroke-width="1.5"/><rect x="21" y="52" width="6" height="6" fill="${dk}"/>`,
  circle: `<circle cx="24" cy="34" r="17" fill="${c}" stroke="${dk}" stroke-width="1.5"/><circle cx="24" cy="34" r="11" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2"/>`,
  cherry: `<path d="M24 14 q-2 12 -10 22 M24 14 q4 14 12 20" stroke="#2a8a3a" stroke-width="2.5" fill="none"/><circle cx="14" cy="42" r="10" fill="${c}"/><circle cx="34" cy="40" r="10" fill="${c}"/><circle cx="11" cy="38" r="2.5" fill="#fff" opacity=".6"/>`,
  leaf: `<path d="M24 12 C42 20 42 46 24 56 C6 46 6 20 24 12z" fill="${c}" stroke="${dk}" stroke-width="1.5"/><path d="M24 14 V54" stroke="rgba(255,255,255,.5)" stroke-width="1.5"/>`,
  flower: [0, 72, 144, 216, 288].map(a => `<ellipse cx="24" cy="24" rx="7" ry="11" fill="${c}" transform="rotate(${a} 24 34)"/>`).join('') + '<circle cx="24" cy="34" r="5" fill="#ff5a8a"/>',
  can: `<rect x="14" y="14" width="20" height="40" rx="4" fill="${c}"/><rect x="14" y="26" width="20" height="12" fill="#fff"/><text x="24" y="35" font-size="7" font-weight="900" text-anchor="middle" fill="${c}">COLA</text>`,
  heart: `<path d="M24 54 L8 36 a9 9 0 0 1 16 -12 a9 9 0 0 1 16 12z" fill="${c}" stroke="${dk}" stroke-width="1.5"/>`,
  car: `<path d="M6 42 l5 -10 h10 l5 -7 h12 l6 10 v7z" fill="${c}" stroke="${dk}" stroke-width="1.5"/><circle cx="14" cy="44" r="4" fill="#222"/><circle cx="36" cy="44" r="4" fill="#222"/><text x="24" y="56" font-size="6" font-weight="900" text-anchor="middle" fill="#ddd">NEW CAR</text>`,
  star: `<path d="M24 14 l6 13 14 1 -11 9 4 14 -13 -8 -13 8 4 -14 -11 -9 14 -1z" fill="${c}" stroke="${dk}" stroke-width="1.5"/>`
}[F.sh] || ''; return `<svg viewBox="0 0 48 60" width="${s}" height="${s * 1.25}"><defs><linearGradient id="frRb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3a3a"/><stop offset=".25" stop-color="#ffd21a"/><stop offset=".5" stop-color="#3adc5a"/><stop offset=".75" stop-color="#2a9aff"/><stop offset="1" stop-color="#b05aff"/></linearGradient></defs><path d="M24 0 V12" stroke="#ddd" stroke-width="1.5"/><circle cx="24" cy="12" r="2" fill="#ddd"/>${body}</svg>`; }
{ const _ic = itemIconSvg; itemIconSvg = function (it, size = 34) { if (it) { if (it.type === 'fresh') return freshSvg(it.freshX, size * 0.85); if (['gfloor', 'gwall', 'glight'].includes(it.type)) return gstyleSvg(it, size); } return _ic(it, size); }; }
// レース中：ミラーの左に吊るす（UI）＋車のまわりに香りのパーティクル
const FRS = { el: null, ang: 0, vel: 0, acc: 0 };
{ const GP = Game.prototype, _up = GP.update; GP.update = function (dt) { _up.call(this, dt); try { const d = SAVE.data, id = d.fresh && invHas('frs_' + d.fresh) ? d.fresh : null;
    if (!FRS.el) { FRS.el = document.createElement('div'); FRS.el.id = 'freshUI'; document.body.appendChild(FRS.el); }
    const show = id && this.active && !(this.cfg && this.cfg.replay) && this.camMode !== 5 && !document.body.classList.contains('photo') && !document.querySelector('#overlay:not(.hidden) .modal') && d.settings.freshUI !== false; FRS.el.style.display = show ? '' : 'none';
    if (show) { if (FRS.el.dataset.id !== id) { FRS.el.dataset.id = id; FRS.el.innerHTML = `<i class="fr-str"></i><div class="fr-tag">${freshSvg(id, 30)}</div>`; } const step = Math.min(0.05, dt || 0.016), v = this.veh; const lat = (typeof MIRROR !== 'undefined' ? MIRROR.ang : 0); FRS.vel += (-FRS.ang * 22 - FRS.vel * 2 + lat * 14) * step; FRS.ang = clamp(FRS.ang + FRS.vel * step, -1, 1); FRS.el.style.transform = `rotate(${(FRS.ang * 50).toFixed(1)}deg)`; }
    if (id && this.active && this.smoke && !(this.cfg && this.cfg.replay)) { const F = FRESH_BY[id], v = this.veh; FRS.acc += (dt || 0.016) * 7; while (FRS.acc > 1) { FRS.acc--; const c = F.rgb || [[1, 0.3, 0.3], [1, 0.85, 0.2], [0.3, 1, 0.4], [0.3, 0.6, 1], [0.7, 0.4, 1]][(Math.random() * 5) | 0], a = Math.random() * Math.PI * 2, r = 0.6 + Math.random() * 0.8;
        this.smoke.spawn({ x: v.x + Math.cos(a) * r, y: (v.y || 0) + 1.0 + Math.random() * 0.4, z: v.z + Math.sin(a) * r, vx: v.vx * 0.9 + Math.cos(a) * 0.3, vy: 0.4 + Math.random() * 0.4, vz: v.vz * 0.9 + Math.sin(a) * 0.3, life: 0, max: 1.2 + Math.random() * 0.8, size: 0.18, grow: 0.5, r: c[0], g: c[1], b: c[2], a: 0.32, drag: 1.2, fadeIn: true }); } } } catch (e) { } }; }
{ const _gm = UI.goMenu; UI.goMenu = function () { if (FRS.el) FRS.el.style.display = 'none'; return _gm.apply(this, arguments); }; }

// ---------------- ガレージの模様替え（床・壁・照明） ----------------
const GSTY = {
  gfloor: [['concrete', 'コンクリート', 'Concrete', 'C', [0.32, 0.32, 0.34], [0.28, 0.28, 0.3]], ['checker', 'チェッカー床', 'Checkered Floor', 'U', [0.42, 0.42, 0.44], [0.05, 0.05, 0.06]], ['redtile', 'レッドタイル', 'Red Tile', 'U', [0.5, 0.06, 0.06], [0.38, 0.04, 0.04]],
    ['epoxy', 'ブルーエポキシ', 'Blue Epoxy', 'R', [0.06, 0.18, 0.42], [0.05, 0.14, 0.34]], ['wood', 'フローリング', 'Wood Floor', 'R', [0.45, 0.28, 0.14], [0.38, 0.23, 0.11]], ['carbon', 'カーボン床', 'Carbon Floor', 'R', [0.1, 0.1, 0.11], [0.15, 0.15, 0.16]],
    ['tatami', 'たたみ', 'Tatami', 'E', [0.6, 0.62, 0.36], [0.54, 0.56, 0.3]], ['neon', 'ネオンフロア', 'Neon Floor', 'E', [0.25, 0.02, 0.3], [0.02, 0.15, 0.3]], ['gold', 'ゴールドフロア', 'Gold Floor', 'L', [0.6, 0.45, 0.12], [0.5, 0.36, 0.08]]],
  gwall: [['white', 'ホワイト', 'White', 'C', [0.55, 0.55, 0.56]], ['brick', 'レンガ', 'Brick', 'U', [0.42, 0.16, 0.1]], ['navy', 'ネイビー', 'Navy', 'U', [0.05, 0.08, 0.2]], ['concrete', 'コンクリート壁', 'Concrete Wall', 'C', [0.36, 0.36, 0.37]],
    ['wood', 'ウッド壁', 'Wood Wall', 'R', [0.35, 0.22, 0.12]], ['black', 'マットブラック', 'Matte Black', 'U', [0.02, 0.02, 0.025]], ['mint', 'ミント', 'Mint', 'R', [0.4, 0.7, 0.6]], ['pink', 'ピンク', 'Pink', 'R', [0.75, 0.4, 0.55]], ['racing', 'レーシングレッド', 'Racing Red', 'E', [0.55, 0.03, 0.03]]],
  glight: [['white', 'ホワイトLED', 'White LED', 'C', [[1, 1, 1]], [1, 1, 1]], ['warm', '電球色', 'Warm Light', 'C', [[1, 0.7, 0.35]], [1, 0.85, 0.65]], ['red', 'レッド', 'Red', 'U', [[1, 0.08, 0.05]], [1, 0.6, 0.6]], ['blue', 'ブルー', 'Blue', 'U', [[0.1, 0.4, 1]], [0.65, 0.75, 1]],
    ['green', 'グリーン', 'Green', 'U', [[0.1, 1, 0.3]], [0.7, 1, 0.75]], ['purple', 'ネオンパープル', 'Neon Purple', 'R', [[0.7, 0.1, 1]], [0.85, 0.65, 1]], ['police', 'ポリス', 'Police', 'E', [[1, 0.05, 0.05], [0.1, 0.3, 1]], [0.9, 0.8, 1]], ['rainbow', 'レインボー', 'Rainbow', 'L', [[1, 0.1, 0.1], [1, 0.6, 0.05], [1, 1, 0.1], [0.1, 1, 0.3], [0.1, 0.5, 1], [0.6, 0.1, 1]], [1, 1, 1]]]
};
const GSTY_BY = {}; const GLAB = { gfloor: ['床', 'Floor'], gwall: ['壁', 'Wall'], glight: ['照明', 'Lighting'] };
for (const [type, list] of Object.entries(GSTY)) for (const [id, nm, en, r, a, b] of list) { const key = type + ':' + id; GSTY_BY[key] = { type, id, nm, a, b }; mkItem({ id: 'gst_' + type + '_' + id, type, gsty: id, name: `ガレージの${GLAB[type][0]}「${nm}」`, en: `Garage ${GLAB[type][1]} "${en}"`, rarity: r, lim: 1, desc: 'メニューのガレージの模様替え（「飾り・小物」の「模様替え」タブから）' }); }
Object.assign(ITEM_TYPES, { gfloor: 'ガレージの床', gwall: 'ガレージの壁', glight: 'ガレージの照明' });
const rgbC = c => `rgb(${c.map(v => Math.round(Math.min(1, v) * 255)).join(',')})`;
function gstyleSvg(it, s = 40) { const G = GSTY_BY[it.type + ':' + it.gsty]; if (!G) return ''; if (it.type === 'gfloor') return `<svg viewBox="0 0 48 48" width="${s}" height="${s}"><path d="M4 30 L24 20 L44 30 L24 40z" fill="${rgbC(G.a)}" stroke="#555"/>${[0, 1, 2, 3].map(k => `<path d="M${9 + k * 5} ${32.5 - k * 2.5} L${14 + k * 5} ${30 - k * 2.5} L${19 + k * 5} ${32.5 - k * 2.5} L${14 + k * 5} ${35 - k * 2.5}z" fill="${rgbC(G.b)}"/>`).join('')}</svg>`;
  if (it.type === 'gwall') return `<svg viewBox="0 0 48 48" width="${s}" height="${s}"><rect x="6" y="8" width="36" height="32" fill="${rgbC(G.a)}" stroke="#555"/>${it.gsty === 'brick' ? [0, 1, 2, 3].map(r => `<path d="M6 ${16 + r * 8} h36" stroke="rgba(0,0,0,.35)"/>`).join('') : ''}<rect x="6" y="36" width="36" height="4" fill="#222"/></svg>`;
  const C = G.a.map(rgbC); return `<svg viewBox="0 0 48 48" width="${s}" height="${s}"><rect x="4" y="18" width="40" height="8" rx="4" fill="#222"/>${Array.from({ length: 8 }, (_, k) => `<circle cx="${8 + k * 4.6}" cy="22" r="2" fill="${C[k % C.length]}" style="filter:drop-shadow(0 0 2px ${C[k % C.length]})"/>`).join('')}<path d="M12 28 L6 44 M24 28 V44 M36 28 L42 44" stroke="${C[0]}" stroke-width="3" opacity=".35"/></svg>`; }
setTimeout(() => { const SP = Showroom.prototype, _rb = SP.rebuildStudio; SP.rebuildStudio = function () { const d = SAVE.data, g = BG_THEMES.garage, keep = { floor: g.floor, wall: g.wall, strip: g.strip }, isG = !d || !d.settings.bg || d.settings.bg === 'garage', gs = (d && d.gstyle) || {};
    const pick = t => gs[t] && invHas('gst_' + t + '_' + gs[t]) ? GSTY_BY[t + ':' + gs[t]] : null;
    if (isG) { const f = pick('gfloor'), w = pick('gwall'), l = pick('glight'); if (f) g.floor = f.a; if (w) g.wall = w.a; if (l) g.strip = l.a; this._flB = f ? f.b : null; this._lt = l ? l.b : null; } else { this._flB = null; this._lt = null; }
    try { return _rb.apply(this, arguments); } finally { Object.assign(g, keep); } };
  const _rd = SP.render; SP.render = function (dt) { const lt = this._lt, R = this.R; if (!lt) return _rd.apply(this, arguments); const os = R.setLights; R.setLights = function (L) { return os.call(R, L.map(x => Object.assign({}, x, { c: x.c.map((v, i) => v * lt[i]) }))); }; try { return _rd.apply(this, arguments); } finally { R.setLights = os; } };
  try { if (UI.show && SAVE.data && SAVE.data.gstyle) UI.show.rebuildStudio(); } catch (e) { } }, 0);

// ---------------- パック ----------------
CHESTS.push({ id: 'freshpack', name: 'エアフレッシュナーパック', price: 800000, odds: { C: 34, U: 32, R: 20, E: 10, L: 4 }, color: '#2fbf71', pool: 'fresh' },
  { id: 'gstylepack', name: 'ガレージ模様替えパック', price: 1300000, odds: { C: 30, U: 34, R: 22, E: 10, L: 4 }, color: '#ff8a2a', pool: 'gsty' });
Object.assign(PACK_ART, { freshpack: { a: '#062a14', b: '#2fbf71', t: 'FRESH' }, gstylepack: { a: '#2a1406', b: '#ff8a2a', t: 'REMODEL' } }); Object.assign(PACK_TIER, { freshpack: 2, gstylepack: 3 }); NEWPOOL.fresh = 'fresh';
{ const _pp = packPool; packPool = function (c, rar) { if (c.pool === 'gsty') return ITEMS.filter(i => ['gfloor', 'gwall', 'glight'].includes(i.type) && i.rarity === rar); return _pp(c, rar).filter(i => !['gfloor', 'gwall', 'glight'].includes(i.type)); }; }
Object.assign(COVER_SVG, { freshpack: `<path d="M50 4 V16" stroke="#ddd" stroke-width="2"/>${freshSvg('pine', 46).replace('<svg ', '<svg x="8" y="10" ')}${freshSvg('cherry', 36).replace('<svg ', '<svg x="54" y="22" ')}${[[30, 70], [62, 74], [76, 60], [20, 50]].map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="${4 + k}" fill="${['#2fbf71', '#ff4a6a', '#ffcf3d', '#3ac8ff'][k]}" opacity=".5"/>`).join('')}`,
  gstylepack: `<path d="M6 60 L50 40 L94 60 L50 82z" fill="#e8e8e8"/>${[0, 1, 2, 3, 4, 5].map(k => `<path d="M${12 + k * 7} ${63 - k * 3.2} L${19 + k * 7} ${60 - k * 3.2} L${26 + k * 7} ${63 - k * 3.2} L${19 + k * 7} ${66 - k * 3.2}z" fill="#111"/>`).join('')}<path d="M6 60 V20 L50 4 V40z" fill="#8a3010"/><path d="M50 4 L94 20 V60 L50 40z" fill="#a83a14"/>${[0, 1, 2, 3, 4, 5, 6].map(k => `<circle cx="${12 + k * 6}" cy="${22 - k * 2.2}" r="2" fill="${['#ff3a3a', '#ffd21a', '#3adc5a', '#2a9aff'][k % 4]}"/>`).join('')}` });
{ const _sh = UI.packStoreHTML; UI.packStoreHTML = function () { let h = _sh.apply(this, arguments); for (const [id, k] of [['freshpack', 'エアフレッシュナー（香り）'], ['gstylepack', 'ガレージの床・壁・照明']]) h = h.replace(new RegExp(`(data-v="${id}"[\\s\\S]*?<span class="ps-kind">)[^<]*`), `$1${k}`); return h; }; }
CM_TABS.push(['fresh', 'エアフレッシュナー'], ['gsty', '模様替え']);
{ const _rc = UI.r_charm; UI.r_charm = function () { const tab = this.cmTab; if (tab !== 'fresh' && tab !== 'gsty') return _rc.apply(this, arguments); $('panelTitle').textContent = 'CUSTOM'; const d = SAVE.data; this.show.setCar(SAVE.cur());
    const tabs = this.nyTabFix(`<div class="cm-tabs">${CM_TABS.map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-a="cmTab" data-v="${k}">${n}</button>`).join('')}</div>`);
    const grid = (items, cur, act, icon, none) => `<div class="cm-grid"><button class="cm-it ${!cur ? 'on' : ''}" data-a="${act}" data-v="${none[0]}"><span class="cm-none">なし</span><b>${none[1]}</b></button>${items.map(it => { const o = invHas(it.id), v = it.freshX || it.gsty; return `<button class="cm-it ${cur === v ? 'on' : ''} ${o ? '' : 'lock'}" data-a="${o ? act : 'cmLocked'}" data-v="${act === 'setGsty' ? it.type + ':' + v : v}" style="--rc:${RCOL(it.rarity)}">${icon(it)}<b>${esc(it.name.replace(/^[^「]*「|」$/g, ''))}</b><small>${RARITY[it.rarity].name}</small></button>`; }).join('')}</div>`;
    if (tab === 'fresh') { const all = ITEMS.filter(i => i.type === 'fresh'); return tabs + `<div class="cm-hero"><div class="gf-cover">${freshSvg(d.fresh && invHas('frs_' + d.fresh) ? d.fresh : 'pine', 54)}</div><div><b>エアフレッシュナー</b><small>レース中、ミラーの横に吊るされて揺れ、車のまわりにその香りの色のエフェクトがふわっと出ます。</small><label class="cm-chk"><input type="checkbox" data-in="freshUITog" ${d.settings.freshUI !== false ? 'checked' : ''}> レース画面に吊るしたエアフレッシュナーを表示</label><button class="btn" data-a="goPackSp" data-v="freshpack">エアフレッシュナーパックへ</button></div></div><div class="h3">${all.filter(i => invHas(i.id)).length} / ${all.length} 所持</div>` + grid(all, d.fresh || '', 'setFresh', it => freshSvg(it.freshX, 36), ['', 'なし']); }
    const gs = d.gstyle || {}; let h = tabs + `<div class="cm-hero"><div class="gf-cover">${COVER_SVG.gstylepack ? `<svg viewBox="0 0 100 90" width="70" height="63">${COVER_SVG.gstylepack}</svg>` : ''}</div><div><b>ガレージの模様替え</b><small>メニューの背景のガレージの床・壁・照明を変えられます（ホーム背景が「ガレージ（標準）」のとき）。ガレージの飾りと組み合わせて使えます。</small><button class="btn" data-a="goPackSp" data-v="gstylepack">ガレージ模様替えパックへ</button></div></div>`;
    for (const t of ['gfloor', 'gwall', 'glight']) { const all = ITEMS.filter(i => i.type === t); h += `<div class="h3">${GLAB[t][0]}（${all.filter(i => invHas(i.id)).length} / ${all.length}）</div>` + grid(all, gs[t] || '', 'setGsty', it => gstyleSvg(it, 42), [t + ':', '標準']); }
    return h; }; }
Object.assign(UI, {
  a_setFresh(id) { SAVE.data.fresh = id || ''; SAVE.save(); AUDIO.confirm && AUDIO.confirm(); this.render(); },
  in_freshUITog(v, el) { SAVE.data.settings.freshUI = !!el.checked; SAVE.save(); },
  a_setGsty(v) { const [t, id] = v.split(':'), d = SAVE.data; d.gstyle = d.gstyle || {}; d.gstyle[t] = id || ''; if (d.settings.bg && d.settings.bg !== 'garage') { d.settings.bg = 'garage'; this.toast('ホーム背景をガレージ（標準）に戻しました'); } SAVE.save(); this.show.rebuildStudio(); AUDIO.confirm && AUDIO.confirm(); this.render(); }
});

// ---------------- ダッシュボード飾りの実績 ----------------
mkItem({ id: 'tt42_wet', type: 'title', name: '称号「ずぶぬれドライバー」', en: 'Title "Soaked Driver"', rarity: 'R', title: 'ずぶぬれドライバー', titleEn: 'Soaked Driver', desc: 'プロフィールとメニューに表示される称号' });
mkItem({ id: 'tt42_gift', type: 'title', name: '称号「プレゼントの達人」', en: 'Title "Gift Master"', rarity: 'E', title: 'プレゼントの達人', titleEn: 'Gift Master', desc: 'プロフィールとメニューに表示される称号' });
{ const S = d => d.stats || {}, own = t => d => ITEMS.filter(i => i.type === t && (d.inv || {})[i.id] > 0).length, A = (id, name, desc, goal, get, rw, cat = 'dash') => ({ id, cat, name, desc, goal, get, rw });
  ACHIEVEMENTS.push(
    A('dcup1', '静かなる走り', 'コップの水を一滴もこぼさずにゴール', 1, d => S(d).cupPerfect || 0, { dia: 10 }),
    A('dcup10', '水をこぼさない者', 'コップの水を一滴もこぼさずに10回ゴール', 10, d => S(d).cupPerfect || 0, { item: 'tt41_1', dia: 30 }),
    A('dcup50', '豆腐屋の配達人', 'コップの水を一滴もこぼさずに50回ゴール', 50, d => S(d).cupPerfect || 0, { item: 'tt41_0', dia: 100 }),
    A('dspill1', 'あっ…', '壁にぶつかってコップの水をこぼす', 1, d => S(d).spills || 0, { money: 50000 }),
    A('dspill50', 'ずぶぬれドライバー', 'コップの水を合計50回こぼす', 50, d => S(d).spills || 0, { item: 'tt42_wet' }),
    A('drace10', 'ダッシュボードのおともに', 'ダッシュボードの飾りを付けて10回レース', 10, d => S(d).dashRaces || 0, { cons: { energy: 2 } }),
    A('drace100', 'いつもいっしょ', 'ダッシュボードの飾りを付けて100回レース', 100, d => S(d).dashRaces || 0, { chest: 'dashpack', dia: 40 }),
    A('dcol5', '飾りコレクター', 'ダッシュボードの飾りを5種類集める', 5, own('dashorn'), { dia: 15 }),
    A('dcol20', 'ダッシュボード博物館', 'ダッシュボードの飾りを20種類すべて集める', 20, own('dashorn'), { dia: 150 }),
    A('fcol10', 'いい香り', 'エアフレッシュナーを10種類集める', 10, own('fresh'), { dia: 20 }, 'collect'),
    A('gift1', 'はじめてのプレゼント', 'フレンドにプレゼントを贈る', 1, d => S(d).giftSent || 0, { dia: 5 }, 'social'),
    A('gift20', 'プレゼントの達人', 'フレンドにプレゼントを20回贈る', 20, d => S(d).giftSent || 0, { item: 'tt42_gift', dia: 30 }, 'social'));
  if (window.ACH_CATS && !ACH_CATS.some(([k]) => k === 'dash')) ACH_CATS.push(['dash', 'ダッシュボード']); }
{ const _ds = dashSpill; dashSpill = function () { const d = SAVE.data; d.stats.spills = (d.stats.spills || 0) + 1; return _ds.apply(this, arguments); }; }
{ const GP = Game.prototype, _f = GP.finish; GP.finish = function (reason) { try { const d = SAVE.data; if (d.dash && invHas('dsh_' + d.dash) && !(this.cfg && this.cfg.replay)) d.stats.dashRaces = (d.stats.dashRaces || 0) + 1; } catch (e) { } return _f.apply(this, arguments); }; }

// ---------------- フレンドへのプレゼント ----------------
const FGIFT = { inbox: {}, off: null, DAILY: 10 };
{ const _ss = SOC.start.bind(SOC); SOC.start = async function () { const r = await _ss.apply(this, arguments); try { if (r && !FGIFT.off) { const ref = SOC.db().ref('fgift/' + SOC.uid), cb = s => { FGIFT.inbox = s.val() || {}; try { const n = Object.keys(FGIFT.inbox).length; if (n && !FGIFT._told) { FGIFT._told = 1; UI.toast(`フレンドからプレゼントが ${n} 件届いています（フレンド → プレゼント）`); } if (UI.screen === 'friends') UI.render(); } catch (e) { } }; ref.on('value', cb, () => { }); FGIFT.off = () => ref.off('value', cb); } } catch (e) { } return r; }; }
const fgDay = () => { const d = SAVE.data, k = jstKey(); d.fgSent = d.fgSent && d.fgSent.k === k ? d.fgSent : { k, n: 0 }; return d.fgSent; };
const giftable = () => { const u = unopened(), d = SAVE.data, L = []; for (const [id, n] of Object.entries(u.packs || {})) { const c = CHESTS.find(x => x.id === id); if (c && n > 0 && !c.daily && id !== 'giftbox') L.push({ k: 'pack', id, n, nm: c.name, ic: packPouch(c, 0.32) }); } for (const [id, n] of Object.entries(d.cons || {})) { const c = CONS_BY_ID[id]; if (c && n > 0) L.push({ k: 'cons', id, n, nm: c.name, ic: consIcon(c, 34) }); } return L; };
{ const _rf = UI.r_friends; UI.r_friends = function () { let h = _rf.apply(this, arguments); if (!SOC.on) return h; const n = Object.keys(FGIFT.inbox).length;
    h = h.replace(/(<div class="tabs">)/, `$1<button class="tab ${this.tab === 'gifts' ? 'on' : ''}" data-a="setTab" data-v="gifts">プレゼント${n ? `<i class="fg-badge">${n}</i>` : ''}</button>`);
    h = h.replace(/(<button class="btn" data-a="tradeStart" data-v="([^"]+)">)/g, `<button class="btn" data-a="fgOpen" data-v="$2">${giftBoxSvgMini()} 贈る</button>$1`);
    if (this.tab === 'gifts') { const rows = Object.entries(FGIFT.inbox).sort((a, b) => (b[1].t || 0) - (a[1].t || 0)); const body = rows.length ? `<div class="fr-list">${rows.map(([gid, g]) => { const c = g.k === 'pack' ? CHESTS.find(x => x.id === g.id) : CONS_BY_ID[g.id], nm = c ? c.name : '?'; return `<div class="fr fg-row"><span class="fg-ic">${g.k === 'pack' && c ? packPouch(c, 0.32) : c ? consIcon(c, 34) : ''}</span><div class="fg-tx"><b class="noi18n">${esc(g.n || '?')}</b><small>から「${esc(nm)}」${g.c > 1 ? ' ×' + g.c : ''}</small>${g.msg ? `<small class="noi18n">「${esc(g.msg)}」</small>` : ''}</div><button class="btn pri" data-a="fgClaim" data-v="${gid}">受け取る</button></div>`; }).join('')}</div>${rows.length > 1 ? '<div class="btns"><button class="btn" data-a="fgClaimAll">すべて受け取る</button></div>' : ''}` : `<div class="empty-card">${giftBoxSvgMini(40)}<b>届いたプレゼントはありません</b><small>フレンドの「贈る」から、持っているパックや消費アイテムを贈れます（1日 ${FGIFT.DAILY} 回まで）。</small></div>`;
      h += body; } return h; }; }
function giftBoxSvgMini(s = 14) { return `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><rect x="3" y="9" width="18" height="12" rx="1.5" fill="#ff4a8a"/><rect x="2" y="6" width="20" height="5" rx="1.5" fill="#ff7aa8"/><rect x="10.5" y="6" width="3" height="15" fill="#ffcf3d"/><path d="M12 6 q-6 -6 -7 -1 q1 2 7 1 q6 1 7 -1 q-1 -5 -7 1z" fill="#ffcf3d"/></svg>`; }
Object.assign(UI, {
  a_fgOpen(uid) { const name = SOC.friends[uid] || '?', L = giftable(), day = fgDay(), left = FGIFT.DAILY - day.n; this._fgTo = uid;
    this.modal(`<div class="fg-m"><h2>${giftBoxSvgMini(22)} <span class="noi18n">${esc(name)}</span> さんにプレゼント</h2><div class="note">持っている未開封のパックや消費アイテムを1つずつ贈れます。今日あと <b>${Math.max(0, left)}</b> 回。</div>
      <input id="fgMsg" class="fg-msg" maxlength="30" placeholder="ひとこと（任意）例：いつもありがとう！">
      ${L.length ? `<div class="fg-grid">${L.map(x => `<button class="fg-it" data-a="fgSend" data-v="${x.k}:${x.id}" ${left > 0 ? '' : 'disabled'}><span class="fg-ic">${x.ic}</span><b>${esc(x.nm)}</b><small>所持 ${x.n}</small></button>`).join('')}</div>` : '<div class="note">贈れるものがありません。パックを「インベントリに保存」して買うか、消費アイテムを手に入れよう。</div>'}
      <div class="btns"><button class="btn" data-a="closeModal">閉じる</button></div></div>`); },
  async a_fgSend(v) { const [k, id] = v.split(':'), uid = this._fgTo, d = SAVE.data, day = fgDay(); if (!uid || !SOC.friends[uid]) return; if (day.n >= FGIFT.DAILY) return this.toast(`プレゼントは1日 ${FGIFT.DAILY} 回までです`);
    const u = unopened(); if (k === 'pack') { if (!(u.packs[id] > 0)) return; u.packs[id]--; if (!u.packs[id]) delete u.packs[id]; } else { if (!(d.cons[id] > 0)) return; d.cons[id]--; }
    const msg = String((document.getElementById('fgMsg') || {}).value || '').trim().slice(0, 30); SAVE.save();
    try { await SOC.db().ref('fgift/' + uid).push({ from: SOC.uid, n: SOC.name || 'フレンド', k, id, c: 1, msg: msg || null, t: Date.now() }); day.n++; d.stats.giftSent = (d.stats.giftSent || 0) + 1; SAVE.save(); AUDIO.buy && AUDIO.buy(); this.toast(`${SOC.friends[uid]} さんにプレゼントを贈りました！`); this.a_fgOpen(uid); }
    catch (e) { if (k === 'pack') u.packs[id] = (u.packs[id] || 0) + 1; else d.cons[id] = (d.cons[id] || 0) + 1; SAVE.save(); AUDIO.error && AUDIO.error(); this.toast('贈れませんでした（通信エラー）'); } },
  async a_fgClaim(gid) { const g = FGIFT.inbox[gid]; if (!g) return; try { await SOC.db().ref('fgift/' + SOC.uid + '/' + gid).remove(); } catch (e) { return this.toast('受け取れませんでした（通信エラー）'); }
    const n = Math.max(1, Math.min(10, g.c || 1)); if (g.k === 'pack' && CHESTS.find(x => x.id === g.id)) { const u = unopened(); u.packs[g.id] = (u.packs[g.id] || 0) + n; } else if (g.k === 'cons' && CONS_BY_ID[g.id]) giveCons(g.id, n);
    delete FGIFT.inbox[gid]; SAVE.save(); AUDIO.chestOpen && AUDIO.chestOpen(1); this.toast(`${g.n || 'フレンド'} さんからのプレゼントを受け取りました（${g.k === 'pack' ? 'ストア → 未開封' : '消費アイテム'}）`); this.render(); },
  async a_fgClaimAll() { for (const gid of Object.keys(FGIFT.inbox)) await this.a_fgClaim(gid); }
});
window.__DLX = Object.assign(window.__DLX || {}, { packPool, FGIFT, FRESH_BY, GSTY_BY, giftable, fgDay });
