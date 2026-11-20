// =====================================================================
// v52.js — v3.93：ムービーパック限定のお菓子の車「COOKIE CRUISER」（クッキーのタイヤ）
// =====================================================================
BODY_TYPES.candy = { nose: .5, hood: .6, deck: .7, ws: .66, rf: .6, rr: .3, rb: .1 };
WHEEL_STYLES.push({ id: 'cookie', name: 'チョコチップクッキー', price: 0, spokes: 0, cookie: 1, rim: '#ff4a8a' });
{ const c = addCar(['mv_candy', 'CINEMA', 'COOKIE CRUISER', 'ムービーパック限定・お菓子の国の映画から飛び出したスイーツカー（カード限定）', 'RR', 280, 300, 980, 230, 5, 7600, 0, 90, 92, 82, 0, 'candy', 4.1, 1.86, 1.62, '#ff8ac8', 0, 'i4', 2.5, 0.42, { chest: 1, cards: 1 }]);
  Object.assign(c, { isNew: '3.93', stockWheel: 'cookie', hero: 'candy' });
  CAR_CARDS.mv_candy = { need: 40, movie: 1 };
  for (const [n, r] of [[1, 'R'], [3, 'E'], [10, 'L']]) addItem({ id: `cc_mv_candy_${n}`, type: 'carcard', car: 'mv_candy', cards: n, rarity: r, lim: 1, movie: 1, name: `${c.name} カード ×${n}`, en: `${c.name} card x${n}` });
  for (const n of [1, 3]) addItem({ id: `sc_mv_candy_${n}`, type: 'starcard', car: 'mv_candy', cards: n, rarity: n === 3 ? 'L' : 'E', lim: 1, starcard: 1, name: `${c.name} 車両カード ×${n}`, en: `${c.name} vehicle card x${n}` });
  // お菓子のアイテム（ムービーパック）
  addItem({ id: 'mvc_paint_frost', type: 'paint', name: 'ストロベリーフロスティング', en: 'Strawberry Frosting', rarity: 'E', color: '#ff8ac8', paint: 'pearl', movie: 1 });
  addItem({ id: 'mvc_paint_mint', type: 'paint', name: 'ミントチョコ', en: 'Mint Chocolate', rarity: 'R', color: '#7ae8c8', paint: 'gloss', movie: 1 });
  addItem({ id: 'mvc_paint_lemon', type: 'paint', name: 'レモンキャンディ', en: 'Lemon Candy', rarity: 'R', color: '#ffe85a', paint: 'candy', movie: 1 });
  addItem({ id: 'mvc_dc_sweet', type: 'decal', name: '「SWEET RIDE」ステッカー', rarity: 'R', kind: 'text', text: 'SWEET RIDE', bg: '#ff8ac8', fg: '#fff', font: 'Arial', movie: 1 });
  addItem({ id: 'mvc_title', type: 'title', name: '称号「お菓子の国のレーサー」', en: 'Title "Candyland Racer"', rarity: 'E', title: 'お菓子の国のレーサー', titleEn: 'Candyland Racer', movie: 1, desc: 'プロフィールとメニューに表示される称号' });
  for (const it of ITEMS) ITEM_BY_ID[it.id] = it; }
CHARMS.push({ id: 'cookie', nm: 'クッキー', en: 'Cookie', r: 'U', svg: '<circle cx="24" cy="26" r="20" fill="#d08a40" stroke="#a0602a" stroke-width="2"/>' + [[16, 18], [30, 16], [22, 30], [34, 30], [14, 32], [26, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#3a1a08"/>`).join('') });
addItem({ id: 'ch_cookie', type: 'charm', charm: 'cookie', name: '飾り「クッキー」', en: 'Charm "Cookie"', rarity: 'U', lim: 1, desc: 'レース中のミラーの下に吊り下げる飾り（メインメニューの「飾り」で変更）' });
ITEM_BY_ID.ch_cookie = ITEMS[ITEMS.length - 1];
// ムービーパック：この車の星アップカードを入れる（車両パックには入れない）
{ const _pp = packPool; packPool = function (c, rar) { const r = _pp(c, rar); if (c.pool === 'veh') return r.filter(i => i.car !== 'mv_candy'); if (c.pool === 'movie') return r.concat(ITEMS.filter(i => i.starcard && i.car === 'mv_candy' && i.rarity === rar)); return r; }; }
// カードの絵（お菓子の車の専用イラスト）
{ const _pc = packCarSvg; packCarSvg = function (car, s = 120) { if (car !== 'mv_candy') return _pc(car, s);
    const SP = ['#ff3a5a', '#ffd21a', '#3ac8ff', '#4ae07a', '#b07aff', '#fff'], spr = Array.from({ length: 18 }, (_, k) => `<rect x="${52 + (k * 37) % 78}" y="${18 + (k * 13) % 9}" width="${k % 2 ? 6 : 2}" height="${k % 2 ? 2 : 6}" rx="1" fill="${SP[k % 6]}"/>`).join('');
    const cookie = x => `<g transform="translate(${x} 60)"><circle r="14" fill="#d08a40" stroke="#8a5420" stroke-width="2"/>${[[-6, -5], [5, -7], [-2, 4], [7, 4], [-8, 6]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2" fill="#3a1a08"/>`).join('')}<circle r="5" fill="#fff4ec"/><circle r="2.4" fill="#ff4a8a"/></g>`;
    return `<svg class="pk-car" viewBox="0 0 186 84" width="${s}" height="${s * 84 / 186}"><ellipse cx="93" cy="74" rx="84" ry="6" fill="#000" opacity=".4"/>
      <rect x="14" y="40" width="160" height="20" rx="6" fill="#5a2c12" stroke="#2a1206" stroke-width="1.5"/>${[40, 66, 92, 118, 144].map(x => `<rect x="${x}" y="42" width="2" height="16" fill="#3a1a08"/>`).join('')}
      <rect x="42" y="18" width="104" height="24" rx="4" fill="#fbd99a"/><path d="M38 14 h112 a4 4 0 0 1 4 4 v6 h-120 v-6 a4 4 0 0 1 4 -4z" fill="#ff8ac8"/>${[46, 62, 78, 96, 112, 130].map((x, k) => `<rect x="${x}" y="22" width="6" height="${5 + (k * 3) % 7}" rx="3" fill="#ff8ac8"/>`).join('')}
      <rect x="60" y="26" width="30" height="12" rx="3" fill="#5ac8f0" opacity=".85"/><rect x="96" y="26" width="34" height="12" rx="3" fill="#5ac8f0" opacity=".85"/>${spr}
      <circle cx="96" cy="8" r="6" fill="#e0102a"/><path d="M97 3 q2 -5 6 -6" stroke="#3a7a1a" stroke-width="1.6" fill="none"/>
      <rect x="20" y="22" width="4" height="20" fill="#e0102a"/><rect x="20" y="26" width="4" height="4" fill="#fff"/><rect x="20" y="34" width="4" height="4" fill="#fff"/><rect x="12" y="18" width="28" height="5" rx="2" fill="#e0102a"/>
      <circle cx="176" cy="48" r="4" fill="#fff38a"/>${cookie(44)}${cookie(146)}</svg>`; }; }
// ニトロ・ドリフト中：カラフルなスプリンクルが飛び散る
{ const GP = Game.prototype, _up = GP.update; GP.update = function (dt) { _up.call(this, dt); const car = this.carInst && CAR_BY_ID[this.carInst.id]; if (!car || car.hero !== 'candy' || !this.active || !this.sparks) return; const v = this.veh; if (!v) return;
    const slip = this.drift && this.drift.active, n = v.nitroOn ? 3 : slip && v.speed > 8 ? 1 : 0; if (!n) return; const fx = Math.sin(v.heading), fz = Math.cos(v.heading), L = car.L || 4;
    const C = [[1, 0.25, 0.4], [1, 0.85, 0.15], [0.25, 0.8, 1], [0.35, 0.95, 0.45], [0.75, 0.45, 1], [1, 1, 1]];
    for (let k = 0; k < n; k++) { const c = C[(Math.random() * 6) | 0]; try { this.sparks.spawn({ x: v.x - fx * L / 2 + (Math.random() - .5), y: (v.y || 0) + 0.6, z: v.z - fz * L / 2 + (Math.random() - .5), vx: v.vx * 0.5 - fx * 3 + (Math.random() - .5) * 3, vy: 1.5 + Math.random() * 2, vz: v.vz * 0.5 - fz * 3 + (Math.random() - .5) * 3, life: 0, max: 0.6 + Math.random() * 0.4, size: 0.18, grow: 0, r: c[0], g: c[1], b: c[2], a: 1, grav: 1, drag: 1 }); } catch (e) { } } }; }
window.__DLX = Object.assign(window.__DLX || {}, { packPool });
