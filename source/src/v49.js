// =====================================================================
// v49.js — v3.9：車の星（ランク）とクラス（F〜S）・車両パック・ミラーと吊り下げ飾り（飾りパック）
//          カードのホロ（テカテカ）コーティングと流れる光・ダイヤ両替の新デザイン・絵文字パックの表紙・新アイテム
// =====================================================================
// ---------------- クラス（F, D, C, B, A, S）と最大の星 ----------------
const CLS = ['F', 'D', 'C', 'B', 'A', 'S'];
const isLimitedCar = c => !!(c.unlock && (c.unlock.event || c.unlock.chest || c.unlock.cards)) || ['EVENT', 'CINEMA'].includes(c.maker) && !c.price;
function carClass(c) { if (!c) return 'F'; if (c.cls) return c.cls; const pt = c.hp / Math.max(500, c.kg) * 1000 + (c.handling || 70) * 0.6; let k = pt < 190 ? 0 : pt < 216 ? 1 : pt < 240 ? 2 : pt < 275 ? 3 : pt < 400 ? 4 : 5; if (isLimitedCar(c) && k < 3) k = 3; return (c.cls = CLS[k]); }
function carMaxStars(c) { const k = CLS.indexOf(carClass(c)); if (k >= 5) return 8; if (k <= 1 && !isLimitedCar(c)) return 3; return 5; }
const STAR_NEED = [0, 0, 5, 10, 20, 30, 50, 70, 100]; // ★n に上げるのに必要なカード
const STAR_COST = n => n * 250000;
const carStars = id => { const d = SAVE.data; d.carStars = d.carStars || {}; return d.carStars[id] || 1; };
const starCards = id => ((SAVE.data.starCards || {})[id] || 0);
const starHTML = (n, max) => `<span class="stars">${Array.from({ length: max }, (_, k) => `<i class="${k < n ? 'on' : ''}">★</i>`).join('')}</span>`;
const clsBadge = c => { const k = carClass(c); return `<span class="cls cls-${k}">${k}</span>`; };
{ const _cl = UI.carLine; UI.carLine = function (c) { return `${clsBadge(c)} <span class="cl-max">★${carMaxStars(c)}</span> ・ ` + _cl.call(this, c); }; }
// ガレージ：星・カード・★アップ
{ const _g = UI.r_garage; UI.r_garage = function (a) { let h = _g.call(this, a); if (this.gTab === 'parts') return h; const d = SAVE.data, inst = d.cars.find(c => c.uid === this.sel) || SAVE.cur(), car = CAR_BY_ID[inst.id]; if (!car) return h;
    h = h.replace(/data-a="selG" data-v="([^"]+)"><div class="grow"><div class="t">/g, (m, uid) => { const c = d.cars.find(x => String(x.uid) === uid), cd = c && CAR_BY_ID[c.id]; return cd ? m + starHTML(carStars(cd.id), carMaxStars(cd)) + ' ' : m; });
    const s = carStars(car.id), mx = carMaxStars(car), have = starCards(car.id), need = s < mx ? STAR_NEED[s + 1] : 0, ok = s < mx && have >= need;
    const panel = `<div class="st-panel"><div class="sp-top">${clsBadge(car)}<div class="sp-stars">${starHTML(s, mx)}<small>星 ${s} / ${mx}${s >= mx ? '（最大）' : ''}</small></div></div>${s < mx ? `<div class="sp-bar"><i style="width:${Math.min(100, have / need * 100)}%"></i><span>車両カード ${have} / ${need}</span></div><div class="sp-perk">★${s + 1}：ガレージ経験値 +150・エキストラ ${starExtraCount(car, s + 1)} 種類が装着可能 ・ 費用 ${yen(STAR_COST(s + 1))}</div><button class="btn ${ok ? 'pri' : ''}" data-a="starUp" data-v="${car.id}" ${ok ? '' : 'disabled'}>${ok ? `★${s + 1} にアップ` : 'カードが足りません'}</button><button class="btn ghost" data-a="goVehPack">車両パックへ</button>` : '<div class="sp-perk">最大ランクです。これ以上のカードはお金に変換されます。</div>'}</div>`;
    return h.replace(`<div class="h3">${car.name}</div>`, `<div class="h3">${car.name}</div>${panel}`); }; }
Object.assign(UI, {
  a_starUp(id) { const car = CAR_BY_ID[id], d = SAVE.data, s = carStars(id), mx = carMaxStars(car); if (!car || s >= mx) return; const need = STAR_NEED[s + 1]; if (starCards(id) < need) return this.toast('カードが足りません'); if (!SAVE.spend(STAR_COST(s + 1))) return;
    d.starCards[id] -= need; d.carStars[id] = s + 1; SAVE.save(); AUDIO.levelUp && AUDIO.levelUp(); this.starFx(car, s + 1); this.refreshTop(); this.render(); },
  starFx(car, n) { const el = document.createElement('div'); el.className = 'starfx'; el.innerHTML = `<div class="sf-in">${packCarSvg(car.id, 200)}<div class="sf-stars">${starHTML(n, carMaxStars(car))}</div><b>${esc(car.name)}</b><small>★${n} にランクアップ！ ガレージ経験値 +150</small></div>${Array.from({ length: 16 }, (_, k) => `<i style="--a:${k * 22.5}deg"></i>`).join('')}`; document.body.appendChild(el); el.onclick = () => el.remove(); setTimeout(() => el.classList.add('out'), 2200); setTimeout(() => el.remove(), 2700); },
  a_goVehPack() { this.stTab = 'packs'; UI._vp.packs = CHESTS.some(c => c.limited && (c.limited !== 'winter' || winterOpen())) ? 2 : 1; this.open('store'); }
});
{ const _gp = carGaragePts; carGaragePts = function (c) { return _gp(c) + (carStars(c.id) - 1) * 150; }; }
// 星でエキストラが増える
const EX_STAR = {}; EXTRAS.slice().sort((a, b) => (a.price || 0) - (b.price || 0)).forEach((e, i, A) => { EX_STAR[e.id] = 1 + Math.floor(i / A.length * 5); });
const exReq = (car, e) => Math.min(EX_STAR[e.id] || 1, carMaxStars(car));
const starExtraCount = (car, s) => EXTRAS.filter(e => exReq(car, e) <= s).length;
{ const _se = UI.a_setExtra; UI.a_setExtra = function (id) { const car = CAR_BY_ID[this.tuneInst().id], e = EXTRA_BY_ID[id]; if (e && car && exReq(car, e) > carStars(car.id)) { AUDIO.error && AUDIO.error(); return this.toast(`この車が ★${exReq(car, e)} になると装着できます`); } return _se.call(this, id); }; }
{ const _ps = UI.r_pshop; UI.r_pshop = function () { let h = _ps.apply(this, arguments); if (this.tab !== 'extra') return h; const car = CAR_BY_ID[SAVE.cur().id]; if (!car) return h; const s = carStars(car.id);
    h = h.replace(/<button class="pcard([^"]*)" data-a="setExtra" data-v="([^"]+)">/g, (m, cls, id) => { const e = EXTRA_BY_ID[id]; if (!e) return m; const r = exReq(car, e); return r > s ? `<button class="pcard${cls} star-lock" data-a="setExtra" data-v="${id}"><span class="ex-star">★${r}</span>` : m.replace('>', `><span class="ex-star ok">★${r}</span>`); });
    return `<div class="note">この車：${clsBadge(car)} ${starHTML(s, carMaxStars(car))}　星を上げると装着できるエキストラが増えます（★${s}：${starExtraCount(car, s)} / ${EXTRAS.length} 種類）</div>` + h; }; }

// ---------------- 車両パック（車のカード＝星アップ用） ----------------
const STAR_R = { F: 'C', D: 'U', C: 'U', B: 'R', A: 'E', S: 'L' };
for (const c of CARS.slice()) { if (!c || c.retired) continue; const k = carClass(c); for (const n of [1, 3]) addItem({ id: `sc_${c.id}_${n}`, type: 'starcard', car: c.id, cards: n, rarity: n === 3 ? ({ C: 'U', U: 'R', R: 'E', E: 'L', L: 'L' })[STAR_R[k]] : STAR_R[k], lim: 1, starcard: 1, name: `${c.name} 車両カード ×${n}`, en: `${c.name} vehicle card x${n}` }); }
for (const it of ITEMS) ITEM_BY_ID[it.id] = it;
ITEM_TYPES.starcard = '車両カード';
CHESTS.push({ id: 'vp_street', name: 'ストリート車両パック', price: 900000, odds: { C: 45, U: 40, R: 13, E: 2, L: 0 }, color: '#5ad1ff', pool: 'veh', vehicle: 1, vcls: ['F', 'D', 'C'] },
  { id: 'vp_sport', name: 'スポーツ車両パック', price: 3000000, odds: { C: 0, U: 45, R: 40, E: 13, L: 2 }, color: '#ff8a2a', pool: 'veh', vehicle: 1, vcls: ['C', 'B', 'A'] },
  { id: 'vp_hyper', name: 'ハイパー車両パック', price: 9000000, odds: { C: 0, U: 0, R: 50, E: 38, L: 12 }, color: '#ff2a7a', pool: 'veh', vehicle: 1, vcls: ['B', 'A', 'S'] });
Object.assign(PACK_ART, { vp_street: { a: '#06202a', b: '#5ad1ff', t: 'STREET CARS' }, vp_sport: { a: '#2a1006', b: '#ff8a2a', t: 'SPORT CARS' }, vp_hyper: { a: '#2a0018', b: '#ff2a7a', t: 'HYPER CARS' } });
Object.assign(PACK_TIER, { vp_street: 2, vp_sport: 3, vp_hyper: 5 }); const VP_CARS = { vp_street: ['hk_s1', 'F'], vp_sport: ['hk_sd3', 'B'], vp_hyper: ['ka_tenma', 'S'] };
{ const _pp = packPool; packPool = function (c, rar) { if (c.pool === 'veh') return ITEMS.filter(i => i.starcard && i.rarity === rar && c.vcls.includes(carClass(CAR_BY_ID[i.car]))); return _pp(c, rar).filter(i => !i.starcard && !i.charm); }; }
{ const _g = grantChestItem; grantChestItem = function (it) { if (!it || it.type !== 'starcard') return _g(it); const d = SAVE.data, car = CAR_BY_ID[it.car]; d.starCards = d.starCards || {}; d.carStars = d.carStars || {};
    const s = carStars(it.car), mx = carMaxStars(car), remain = Math.max(0, STAR_NEED.slice(s + 1, mx + 1).reduce((a, b) => a + b, 0) - (d.starCards[it.car] || 0));
    if (s >= mx || remain <= 0) { const refund = it.cards * ({ F: 20000, D: 30000, C: 50000, B: 80000, A: 120000, S: 200000 })[carClass(car)]; SAVE.addMoney(refund); return { isNew: false, refund }; }
    d.starCards[it.car] = (d.starCards[it.car] || 0) + it.cards; return { isNew: true, refund: 0 }; }; }
{ const _ic = itemIconSvg; itemIconSvg = function (it, size = 34) { if (it && it.type === 'starcard') { const c = CAR_BY_ID[it.car]; return `<span class="sc-ic" style="--s:${size}px">${packCarSvg(it.car, size * 1.3)}<b class="cls cls-${carClass(c)}">${carClass(c)}</b><em>×${it.cards}</em></span>`; } return _ic(it, size); }; }
{ const _fc = featCard; featCard = function (it) { if (it && it.type === 'starcard') { const c = CAR_BY_ID[it.car], R = RARITY[it.rarity]; return `<div class="fc" style="--rc:${R.color}"><span class="fc-main">車両カード</span><div class="fc-top"><span class="fc-kind">${clsBadge(c)} 星アップ</span><b class="fc-x">x${it.cards}</b></div><div class="fc-car">${packCarSvg(c.id, 120)}</div><div class="fc-bot"><span class="fc-r">${it.rarity}</span><b>${esc(c.name)}</b><small>${c.maker} ・ 最大★${carMaxStars(c)}</small></div></div>`; } return _fc(it); }; }

// ---------------- 吊り下げ飾り（チャーム）・飾りパック ----------------
const CHARMS = [];
{ const C = (id, nm, en, r, svg) => { CHARMS.push({ id, nm, en, r, svg }); addItem({ id: 'ch_' + id, type: 'charm', charm: id, name: '飾り「' + nm + '」', en: 'Charm "' + en + '"', rarity: r, lim: 1, desc: 'レース中のミラーの下に吊り下げる飾り（メインメニューの「飾り」で変更）' }); };
  C('dice', 'ふわふわダイス', 'Fuzzy Dice', 'C', '<rect x="4" y="6" width="22" height="22" rx="5" fill="#f4f4f4" stroke="#ccc" stroke-width="2"/><rect x="22" y="14" width="22" height="22" rx="5" fill="#e10600" stroke="#a00" stroke-width="2"/>' + [[10, 12], [20, 22], [15, 17]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#111"/>`).join('') + [[28, 20], [38, 30], [28, 30], [38, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#fff"/>`).join(''));
  C('pine', 'ツリー型エアフレッシュナー', 'Tree Freshener', 'C', '<path d="M24 2 L36 18 H30 L40 32 H32 L42 46 H6 L16 32 H8 L18 18 H12z" fill="#2fbf71" stroke="#1a7a3a" stroke-width="2"/><rect x="21" y="46" width="6" height="6" fill="#1a7a3a"/>');
  C('omamori', 'お守り', 'Omamori', 'U', '<path d="M10 10 h28 v34 a14 6 0 0 1 -28 0z" fill="#c8102e" stroke="#ffcf3d" stroke-width="2"/><path d="M14 18 h20" stroke="#ffcf3d" stroke-width="2"/><text x="24" y="36" font-size="12" font-weight="900" text-anchor="middle" fill="#ffcf3d">安全</text>');
  C('tire', 'ミニタイヤ', 'Mini Tire', 'U', '<circle cx="24" cy="24" r="20" fill="#1a1a1a"/><circle cx="24" cy="24" r="11" fill="#c8ccd2"/>' + [0, 72, 144, 216, 288].map(a => `<path d="M24 24 V14" stroke="#666" stroke-width="3" transform="rotate(${a} 24 24)"/>`).join(''));
  C('maneki', 'まねきねこ', 'Lucky Cat', 'R', '<ellipse cx="24" cy="32" rx="16" ry="14" fill="#fff" stroke="#ddd" stroke-width="2"/><circle cx="24" cy="18" r="12" fill="#fff" stroke="#ddd" stroke-width="2"/><path d="M14 10 l2 -8 6 6z M34 10 l-2 -8 -6 6z" fill="#fff" stroke="#ddd" stroke-width="2"/><path d="M38 24 v-10 a4 4 0 0 1 6 0 v10" fill="#fff" stroke="#ddd" stroke-width="2"/><circle cx="19" cy="17" r="1.8" fill="#222"/><circle cx="29" cy="17" r="1.8" fill="#222"/><path d="M14 28 h20" stroke="#e10600" stroke-width="3"/><circle cx="24" cy="31" r="3" fill="#ffcf3d"/>');
  C('daruma', 'だるま', 'Daruma', 'R', '<ellipse cx="24" cy="27" rx="18" ry="20" fill="#e10600"/><ellipse cx="24" cy="21" rx="11" ry="10" fill="#fff4e0"/><circle cx="20" cy="20" r="3" fill="#fff" stroke="#111" stroke-width="1.5"/><circle cx="20" cy="20" r="1.5" fill="#111"/><circle cx="28" cy="20" r="3" fill="#fff" stroke="#111" stroke-width="1.5"/><path d="M18 40 q6 4 12 0" stroke="#ffcf3d" stroke-width="2.5" fill="none"/>');
  C('furin', '風鈴', 'Wind Chime', 'R', '<path d="M8 22 a16 16 0 0 1 32 0 v4 h-32z" fill="#bfe8ff" stroke="#7ab8e0" stroke-width="2" opacity=".9"/><path d="M14 18 q4 -6 8 0 M26 14 q4 -4 8 2" stroke="#e10600" stroke-width="2" fill="none"/><path d="M24 26 v8" stroke="#888" stroke-width="1.5"/><rect x="18" y="34" width="12" height="16" fill="#ffe28a" stroke="#c8a040" stroke-width="1.5"/>');
  C('teru', 'てるてる坊主', 'Teru Teru', 'U', '<circle cx="24" cy="16" r="12" fill="#fff" stroke="#ccc" stroke-width="2"/><path d="M14 22 l-6 24 h32 l-6 -24z" fill="#fff" stroke="#ccc" stroke-width="2"/><path d="M14 24 h20" stroke="#e10600" stroke-width="2"/><circle cx="20" cy="15" r="1.6" fill="#222"/><circle cx="28" cy="15" r="1.6" fill="#222"/><path d="M20 20 q4 3 8 0" stroke="#222" stroke-width="1.5" fill="none"/>');
  C('wakaba', 'わかばマーク', 'Beginner Mark', 'C', '<path d="M24 6 L40 18 V44 L24 34z" fill="#2fbf71" stroke="#fff" stroke-width="2"/><path d="M24 6 L8 18 V44 L24 34z" fill="#ffcf3d" stroke="#fff" stroke-width="2"/>');
  C('star', 'ゴールドスター', 'Gold Star', 'U', '<path d="M24 2 l6 14 15 1 -11 10 4 15 -14 -8 -14 8 4 -15 -11 -10 15 -1z" fill="#ffcf3d" stroke="#c88a00" stroke-width="2"/>');
  C('heart', 'ハートのクッション', 'Heart Cushion', 'C', '<path d="M24 44 L6 26 a10 10 0 0 1 18 -14 a10 10 0 0 1 18 14z" fill="#ff5a8a" stroke="#c8306a" stroke-width="2"/>');
  C('moon', 'みかづき', 'Crescent', 'U', '<path d="M30 4 a20 20 0 1 0 14 32 a16 16 0 0 1 -14 -32z" fill="#ffe28a" stroke="#c8a040" stroke-width="2"/>');
  C('turbo', 'ミニタービン', 'Mini Turbine', 'R', '<circle cx="24" cy="24" r="20" fill="#b8bcc4" stroke="#888" stroke-width="2"/>' + Array.from({ length: 8 }, (_, k) => `<path d="M24 24 q8 -6 4 -18" stroke="#555" stroke-width="2.5" fill="none" transform="rotate(${k * 45} 24 24)"/>`).join('') + '<circle cx="24" cy="24" r="4" fill="#333"/>');
  C('helmet', 'ミニヘルメット', 'Mini Helmet', 'E', '<path d="M6 30 a18 18 0 0 1 36 0 v6 h-36z" fill="#e10600" stroke="#900" stroke-width="2"/><path d="M14 26 h26 v8 h-26z" fill="#1a2a40"/><path d="M6 20 h36" stroke="#fff" stroke-width="3"/>');
  C('crystal', 'クリスタル', 'Crystal', 'E', '<path d="M24 2 L38 18 L24 46 L10 18z" fill="#9ad8ff" stroke="#fff" stroke-width="2" opacity=".9"/><path d="M10 18 h28 M24 2 v44" stroke="#fff" stroke-width="1.5" opacity=".7"/>');
  C('duck', 'おふろアヒル', 'Rubber Duck', 'U', '<ellipse cx="22" cy="32" rx="18" ry="12" fill="#ffd23a"/><circle cx="30" cy="16" r="10" fill="#ffd23a"/><path d="M38 16 l8 2 -8 3z" fill="#ff8a00"/><circle cx="32" cy="14" r="2" fill="#222"/>');
  C('coin', '幸運のコイン', 'Lucky Coin', 'R', '<circle cx="24" cy="24" r="18" fill="#ffcf3d" stroke="#c88a00" stroke-width="3"/><rect x="18" y="18" width="12" height="12" fill="#c88a00" transform="rotate(45 24 24)"/><circle cx="24" cy="24" r="3" fill="#ffcf3d"/>');
  C('sakura', 'さくらのかんざし', 'Sakura Pin', 'E', [0, 72, 144, 216, 288].map(a => `<ellipse cx="24" cy="12" rx="7" ry="10" fill="#ffb0c8" stroke="#ff7aa0" stroke-width="1" transform="rotate(${a} 24 24)"/>`).join('') + '<circle cx="24" cy="24" r="4" fill="#ff5a8a"/>');
  C('skull', 'スカル', 'Skull', 'R', '<path d="M8 22 a16 16 0 0 1 32 0 v10 l-6 4 v8 h-20 v-8 l-6 -4z" fill="#f4f0e8" stroke="#bbb" stroke-width="2"/><circle cx="18" cy="24" r="5" fill="#222"/><circle cx="30" cy="24" r="5" fill="#222"/><path d="M22 34 l2 -4 2 4z" fill="#222"/>');
  C('key', 'クラシックキー', 'Classic Key', 'U', '<circle cx="16" cy="16" r="11" fill="none" stroke="#d4af37" stroke-width="5"/><path d="M24 24 L42 42 M34 34 l5 -5 M38 38 l5 -5" stroke="#d4af37" stroke-width="5" stroke-linecap="round"/>');
  C('dragon', 'りゅうの鈴', 'Dragon Bell', 'L', '<circle cx="24" cy="30" r="14" fill="#ffcf3d" stroke="#c88a00" stroke-width="2"/><path d="M14 32 h20" stroke="#c88a00" stroke-width="2"/><circle cx="24" cy="38" r="3" fill="#5a3a00"/><path d="M6 18 q10 -16 18 -4 q8 -12 18 4" stroke="#2fbf71" stroke-width="4" fill="none"/>');
  C('neoncube', 'ネオンキューブ', 'Neon Cube', 'L', '<rect x="8" y="8" width="32" height="32" rx="6" fill="#120020" stroke="#ff2bd6" stroke-width="3"/><rect x="15" y="15" width="18" height="18" rx="3" fill="none" stroke="#00e5ff" stroke-width="3"/>');
  C('gg', 'GGプレート', 'GG Plate', 'C', '<rect x="4" y="10" width="40" height="26" rx="8" fill="#ffcf3d" stroke="#c88a00" stroke-width="2"/><text x="24" y="30" font-size="16" font-weight="900" text-anchor="middle" fill="#111">GG</text>');
  C('ramen', 'ラーメンストラップ', 'Ramen Strap', 'R', '<path d="M6 22 h36 a18 16 0 0 1 -36 0z" fill="#e10600"/><path d="M10 22 h28" stroke="#ffd060" stroke-width="4"/><path d="M34 2 L22 20 M40 4 L28 20" stroke="#a86a2a" stroke-width="2.5"/>');
}
for (const it of ITEMS) ITEM_BY_ID[it.id] = it;
ITEM_TYPES.charm = '飾り';
const charmSvg = (id, s = 48) => { const c = CHARMS.find(x => x.id === id); return c ? `<svg viewBox="0 0 48 52" width="${s}" height="${s * 52 / 48}">${c.svg}</svg>` : ''; };
{ const _ic = itemIconSvg; itemIconSvg = function (it, size = 34) { if (it && it.type === 'charm') return charmSvg(it.charm, size); return _ic(it, size); }; }
CHESTS.push({ id: 'charmpack', name: '飾りカードパック', price: 1200000, odds: { C: 34, U: 34, R: 21, E: 9, L: 2 }, color: '#ff8ac8', pool: 'charm' });
PACK_ART.charmpack = { a: '#2a0a20', b: '#ff8ac8', t: 'CHARMS' }; PACK_TIER.charmpack = 2;
{ const _pp = packPool; packPool = function (c, rar) { if (c.pool === 'charm') return ITEMS.filter(i => i.rarity === rar && i.type === 'charm'); return _pp(c, rar); }; }
// パックの表紙：絵文字パック・飾りパック
{ const art = c => VP_CARS[c.id] ? `<div class="vp-cover">${packCarSvg(VP_CARS[c.id][0], 96)}<span class="vp-cls">${CHESTS.find(x => x.id === c.id).vcls.map(k => `<b class="cls cls-${k}">${k}</b>`).join('')}</span></div>` : c.id === 'emojipack' ? `<div class="emo-cover">${emoSvg('e2', 70)}<span class="ec1">${emoSvg('e4', 30)}</span><span class="ec2">${emoSvg('e52', 30)}</span><span class="ec3">${emoSvg('e150', 28)}</span></div>` : c.id === 'charmpack' ? `<div class="charm-cover"><i></i>${charmSvg('maneki', 58)}</div>` : null;
  const _ph = packHTML; packHTML = function (c, size = 1) { const h = _ph(c, size), a = c && art(c); if (!a) return h; const i = h.indexOf('<div class="pk2-emb'), j = h.indexOf('</div><div class="pk2-name">', i); return i < 0 || j < 0 ? h : h.slice(0, i) + `<div class="pk2-emb">${a}` + h.slice(j); };
  const _pu = packPouch; packPouch = function (c, size = 1) { const h = _pu(c, size), a = c && art(c); if (!a) return h; const i = h.indexOf('<div class="pp-logo'), j = h.indexOf('</div><div class="pp-name">', i); return i < 0 || j < 0 ? h : h.slice(0, i) + `<div class="pp-logo pp-cover" style="--cs2:${size}">${a}` + h.slice(j); }; }

{ const _sh = UI.packStoreHTML; UI.packStoreHTML = function () { let h = _sh.apply(this, arguments); for (const [id, k] of [['charmpack', '吊り下げ飾り（専用）'], ['emojipack', 'チャット用の絵文字'], ['vp_street', '車両カード F〜C'], ['vp_sport', '車両カード C〜A'], ['vp_hyper', '車両カード B〜S']]) h = h.replace(new RegExp(`(data-v="${id}"[\\s\\S]*?<span class="ps-kind">)[^<]*`), `$1${k}`); return h; }; }
// ---------------- ミラーと飾り（レース中の画面上部） ----------------
const MIRROR = { el: null, ang: 0, vel: 0, lastHd: null, lastSp: 0 };
const mset = () => { const s = SAVE.data.settings; if (s.mirrorOn === undefined) s.mirrorOn = true; if (s.charmOn === undefined) s.charmOn = true; s.mirrorSize = s.mirrorSize || 1; s.charmSize = s.charmSize || 1; return s; };
function mirrorEl() { if (!MIRROR.el) { const el = document.createElement('div'); el.id = 'mirrorUI'; el.innerHTML = `<div class="mr-frame"><i class="mr-glare"></i></div><div class="mr-charm"><i class="mr-string"></i><div class="mr-ch"></div></div>`; document.body.appendChild(el); MIRROR.el = el; } return MIRROR.el; }
{ const GP = Game.prototype, _rd = GP.render; GP.render = function (dt) { _rd.call(this, dt); const s = mset(), el = mirrorEl(), d = SAVE.data, ch = d.charm && invHas('ch_' + d.charm) ? d.charm : null;
    const show = this.active && !document.body.classList.contains('photo') && !(this.cfg && this.cfg.replay) && this.camMode !== 5 && (s.mirrorOn || (s.charmOn && ch)) && !document.querySelector('#overlay:not(.hidden) .modal');
    el.style.display = show ? '' : 'none'; if (!show) return; el.style.setProperty('--ms', s.mirrorSize); el.style.setProperty('--cs', s.charmSize); el.classList.toggle('no-mirror', !s.mirrorOn);
    const chEl = el.querySelector('.mr-charm'); chEl.style.display = s.charmOn && ch ? '' : 'none'; if (ch && chEl.dataset.id !== ch) { chEl.dataset.id = ch; chEl.querySelector('.mr-ch').innerHTML = charmSvg(ch, 46); }
    // 飾りの揺れ（振り子）
    const v = this.veh; if (v && ch && s.charmOn) { const hd = v.heading, sp = v.speed || 0, step = Math.min(0.05, dt || 0.016); if (MIRROR.lastHd == null) MIRROR.lastHd = hd; const yaw = wrapAngle(hd - MIRROR.lastHd) / Math.max(0.001, step); MIRROR.lastHd = hd; const acc = (sp - MIRROR.lastSp) / Math.max(0.001, step); MIRROR.lastSp = sp;
      const lat = yaw * sp, force = clamp(lat * 0.045, -3, 3) + clamp(-acc * 0.01, -0.6, 0.6) * Math.sin(MIRROR.ang * 3); MIRROR.vel += (-MIRROR.ang * 26 - MIRROR.vel * 2.2 + force * 10) * step; MIRROR.ang = clamp(MIRROR.ang + MIRROR.vel * step, -1.1, 1.1);
      chEl.style.transform = `translateX(-50%) rotate(${(MIRROR.ang * 57).toFixed(1)}deg)`; }
    if (!s.mirrorOn) return; try { mirrorPass(this, el.querySelector('.mr-frame')); } catch (e) { } }; }
function mirrorPass(g, frame) { const R = g.R, gl = R.gl, cv = R.canvas, cr = cv.getBoundingClientRect(), fr = frame.getBoundingClientRect(); if (!cr.width || !fr.width) return; const sx = cv.width / cr.width, sy = cv.height / cr.height, pad = 5;
  const rx = Math.round((fr.left - cr.left + pad) * sx), rw = Math.round((fr.width - pad * 2) * sx), rh = Math.round((fr.height - pad * 2) * sy), ry = Math.round(cv.height - (fr.top - cr.top + pad) * sy - rh); if (rw < 20 || rh < 10) return;
  const cam = R.cam, sp = cam.pos, st = cam.target, sf = cam.fov, v = g.veh, fx = Math.sin(v.heading), fz = Math.cos(v.heading);
  cam.pos = [v.x + fx * 0.3, v.y + 1.3, v.z + fz * 0.3]; cam.target = [v.x - fx * 40, v.y + 0.9, v.z - fz * 40]; cam.fov = 30;
  const ovp = gl.viewport, osc = R.setupCamera; R.canvas = { width: rw, height: rh }; gl.viewport = function (x, y, w, h) { ovp.call(gl, x + rx, y + ry, w, h); };
  R.setupCamera = function () { osc.call(R); R.proj[0] *= -1; M4.multiply(R.vp, R.proj, R.view); M4.invert(R.inv, R.vp); };
  gl.enable(gl.SCISSOR_TEST); gl.scissor(rx, ry, rw, rh); gl.frontFace(gl.CW);
  try { R.begin(); const I = M4.create(), W = g.world; R.drawMesh(W.global, W.mats.global, I, false); if (W.water) R.drawMesh(W.water, W.mats.water, I, false);
    for (const ch of W.chunks) { const ref = ch.road || ch.scene || ch.bld; if (!ref) continue; const dx = ref.center[0] - cam.pos[0], dz = ref.center[2] - cam.pos[2]; if (Math.hypot(dx, dz) - ref.radius > 320) continue; if (ch.road) R.drawMesh(ch.road, W.mats.road, I); if (ch.scene) R.drawMesh(ch.scene, W.mats.scene, I); if (ch.bld) R.drawMesh(ch.bld, W.mats.bld, I); }
    for (const r of g.rivals) R.drawNode(r.model.node); R.flushTransparent(); R.drawPoints(g.lightsP, 1); }
  finally { gl.frontFace(gl.CCW); gl.disable(gl.SCISSOR_TEST); gl.viewport = ovp; R.setupCamera = osc; R.canvas = cv; cam.pos = sp; cam.target = st; cam.fov = sf; gl.viewport(0, 0, cv.width, cv.height); } }
{ const _gm = UI.goMenu; UI.goMenu = function () { if (MIRROR.el) MIRROR.el.style.display = 'none'; return _gm.apply(this, arguments); }; }
// メインメニュー「飾り」・飾りの画面
Object.assign(UI, {
  r_charm() { $('panelTitle').textContent = 'CHARMS'; const d = SAVE.data, s = mset(), own = CHARMS.filter(c => invHas('ch_' + c.id)); this.show.setCar(SAVE.cur());
    let h = `<div class="cm-hero"><div class="cm-prev"><div class="cm-mirror" style="--ms:${s.mirrorSize}"></div><div class="cm-hang" style="--cs:${s.charmSize}"><i></i>${d.charm && invHas('ch_' + d.charm) ? charmSvg(d.charm, 56) : '<span class="cm-none">なし</span>'}</div></div><div><b>レース中の飾り</b><small>ミラーの下に吊り下げる飾り。車の動きに合わせて揺れます。飾りは「飾りカードパック」から手に入ります。</small><button class="btn" data-a="goCharmPack">飾りカードパックへ</button></div></div>`;
    h += `<div class="h3">飾りを選ぶ（${own.length} / ${CHARMS.length}）</div><div class="cm-grid"><button class="cm-it ${!d.charm ? 'on' : ''}" data-a="setCharm" data-v=""><span class="cm-none">なし</span><b>飾りなし</b></button>${CHARMS.map(c => { const o = invHas('ch_' + c.id); return `<button class="cm-it ${d.charm === c.id ? 'on' : ''} ${o ? '' : 'lock'}" data-a="${o ? 'setCharm' : 'charmLocked'}" data-v="${c.id}" style="--rc:${RARITY[c.r].color}">${charmSvg(c.id, 46)}<b>${esc(c.nm)}</b><small>${RARITY[c.r].name}</small></button>`; }).join('')}</div>`;
    h += `<div class="h3">表示の設定</div>${this.mirrorSettingsHTML()}`; return h; },
  mirrorSettingsHTML() { const s = mset(); return `<div class="row"><label>ミラーを表示</label><button class="btn ${s.mirrorOn ? 'pri' : ''}" data-a="mirrorTog" data-v="mirrorOn">${s.mirrorOn ? 'ON' : 'OFF'}</button></div><div class="row"><label>ミラーの大きさ</label><input type="range" min="0.6" max="1.5" step="0.05" value="${s.mirrorSize}" data-in="mirrorSz" data-k="mirrorSize"><span class="val">${Math.round(s.mirrorSize * 100)}%</span></div>
      <div class="row"><label>飾りを表示</label><button class="btn ${s.charmOn ? 'pri' : ''}" data-a="mirrorTog" data-v="charmOn">${s.charmOn ? 'ON' : 'OFF'}</button></div><div class="row"><label>飾りの大きさ</label><input type="range" min="0.6" max="1.8" step="0.05" value="${s.charmSize}" data-in="mirrorSz" data-k="charmSize"><span class="val">${Math.round(s.charmSize * 100)}%</span></div><div class="note">ミラーは後ろの景色とライバルを映します（OFFにすると少し動作が軽くなります）。</div>`; },
  a_setCharm(id) { SAVE.data.charm = id || ''; SAVE.save(); AUDIO.confirm && AUDIO.confirm(); this.render(); },
  a_charmLocked(id) { const c = CHARMS.find(x => x.id === id); this.toast(`「${c ? c.nm : ''}」は飾りカードパックから手に入ります`); },
  a_goCharmPack() { this.stTab = 'packs'; this.open('store'); setTimeout(() => { const vp = document.querySelector('.vp[data-vp="packs"]'); if (!vp) return; const pg = [...vp.querySelectorAll('.vp-page')], i = pg.findIndex(p => p.querySelector('[data-v="charmpack"]')); if (i >= 0) this.a_vpGo('packs:=' + i); }, 120); },
  a_mirrorTog(k) { const s = mset(); s[k] = !s[k]; SAVE.save(); this.render(); },
  in_mirrorSz(v, el) { const s = mset(); s[el.dataset.k] = +v; const sp = el.parentElement.querySelector('.val'); if (sp) sp.textContent = Math.round(v * 100) + '%'; SAVE.save(); const p = document.querySelector(el.dataset.k === 'mirrorSize' ? '.cm-mirror' : '.cm-hang'); if (p) p.style.setProperty(el.dataset.k === 'mirrorSize' ? '--ms' : '--cs', v); }
});
{ const _st = UI.r_settings; UI.r_settings = function () { const h = _st.apply(this, arguments); return this.tab === 'graphics' ? h + `<div class="h3">ミラー・飾り</div>${this.mirrorSettingsHTML()}` : h; }; }
{ const _mi = UI.menuItems; UI.menuItems = function () { _mi.apply(this, arguments); const el = $('menuList'); const pills = el && el.querySelector('.nm-pills'); if (pills && !pills.querySelector('[data-m="charm"]')) pills.insertAdjacentHTML('beforeend', `<button class="nm-pill" data-m="charm"><span class="nmc-ic">${charmSvg(SAVE.data.charm && invHas('ch_' + SAVE.data.charm) ? SAVE.data.charm : 'maneki', 20)}</span><span>飾り</span></button>`); }; }
BNAV_OF.charm = 'garage';

// ---------------- ダイヤ両替（新デザイン） ----------------
Object.assign(UI, {
  diaExHTML() { const d = SAVE.data, dia = d.diamonds || 0; const gems = n => Array.from({ length: n }, (_, k) => `<span style="--k:${k}">${SICO.gem(26 + (k % 2) * 4)}</span>`).join('');
    let h = `<div class="dx"><div class="dx-hero"><div class="dx-bal"><small>所持ダイヤ</small><b>${SICO.gem(26)} ${dia.toLocaleString()}</b></div><div class="dx-arrow">⇄</div><div class="dx-bal"><small>所持金</small><b>${yen(d.money)}</b></div><div class="dx-rate">1 ${SICO.gem(14)} ＝ ${yen(DIA_RATE)}　まとめて両替するとボーナス！</div></div><div class="dx-grid">`;
    DIA_EX.forEach(([n, b], i) => { const get = Math.round(n * DIA_RATE * (1 + b / 100)), can = dia >= n; h += `<div class="dx-card ${can ? '' : 'off'} ${b >= 20 ? 'best' : ''}" style="animation-delay:${i * 0.06}s">${b ? `<span class="dx-bonus">+${b}%</span>` : ''}${b >= 20 ? '<span class="dx-tag">いちばんおトク</span>' : ''}<div class="dx-gems">${gems(Math.min(6, 1 + i * 2))}</div><b class="dx-n">${SICO.gem(18)} ${n.toLocaleString()}</b><div class="dx-to">↓</div><b class="dx-get">${yen(get)}</b>${b ? `<small>通常より ${yen(get - n * DIA_RATE)} おトク</small>` : '<small>ボーナスなし</small>'}<button class="dx-btn" data-a="stDia" data-v="${n}" ${can ? '' : 'disabled'}>${can ? '両替する' : 'ダイヤが足りません'}</button></div>`; });
    const mx = Math.max(1, dia); h += `</div><div class="dx-free"><b>好きな数だけ両替</b><div class="dx-sl"><input type="range" min="1" max="${mx}" value="${Math.min(10, mx)}" data-in="dxSl" ${dia ? '' : 'disabled'}><span id="dxOut">${SICO.gem(14)} ${Math.min(10, mx)} → ${yen(Math.min(10, mx) * DIA_RATE)}</span></div><button class="dx-btn" data-a="dxFree" ${dia ? '' : 'disabled'}>この数で両替</button><small>ボーナスはつきません</small></div></div>`; return h; },
  in_dxSl(v) { this._dx = +v; const o = document.getElementById('dxOut'); if (o) o.innerHTML = `${SICO.gem(14)} ${(+v).toLocaleString()} → ${yen(+v * DIA_RATE)}`; },
  a_dxFree() { const n = Math.floor(this._dx || Math.min(10, SAVE.data.diamonds || 0)), d = SAVE.data; if (!n || (d.diamonds || 0) < n) return this.toast('ダイヤが足りません'); d.diamonds -= n; SAVE.addMoney(n * DIA_RATE); SAVE.save(); AUDIO.buy && AUDIO.buy(); this.toast(`${n} ダイヤを ${yen(n * DIA_RATE)} に両替しました`); this.refreshTop(); this.render(); }
});
{ const _rs = UI.r_store; UI.r_store = function () { let h = _rs.apply(this, arguments); if (this.stTab !== 'dia') return h; const a = h.indexOf('<section class="st-sec"'), b = a >= 0 ? h.indexOf('</section>', a) : -1; return a >= 0 && b > 0 ? h.slice(0, a) + this.diaExHTML() + h.slice(b + 10) : h; }; }

// ---------------- カードのホロ加工と流れる光 ----------------
{ const _deal = PACKFX.deal; PACKFX.deal = function () { _deal.call(this); this.o.querySelectorAll('.cardx').forEach((el, k) => { const f = el.querySelector('.cx-front'); if (f && !f.querySelector('.cx-sweep')) f.insertAdjacentHTML('beforeend', `<i class="cx-holo"></i><i class="cx-sweep" style="animation-delay:${(k % 5) * 0.25}s"></i>`); }); }; }
// ---------------- 新しいアイテム ----------------
{ const RR6 = ['C', 'C', 'U', 'U', 'R', 'E'];
  [['TOUGE ATTACK', '#111', '#ff3a3a'], ['SMOKE KING', '#30333a', '#fff'], ['DRIFT SQUAD', '#ff2bd6', '#111'], ['MIDNIGHT CLUB', '#0a0a2a', '#9ad0ff'], ['HIGH REV', '#ffcf3d', '#111'], ['SIDE ATTACK', '#fff', '#1e5aff'], ['零', '#111', '#fff', 'serif'], ['龍', '#600000', '#ffcf3d', 'serif'], ['刃', '#0b1a3a', '#c8d8ff', 'serif'], ['魂', '#111', '#ff6a00', 'serif'], ['GRIP OR DRIFT', '#2fdc7a', '#111'], ['PIT CREW', '#e10600', '#fff']]
    .forEach(([t, bg, fg, font], i) => addItem({ id: 'dc39_' + i, type: 'decal', name: '「' + t + '」ステッカー', rarity: RR6[i % 6], kind: 'text', text: t, bg, fg, font: font || 'Arial' }));
  [['オーロラパール', 'Aurora Pearl', '#a8f0e0', 'pearl'], ['ブラッドオレンジ', 'Blood Orange', '#d8401a', 'candy'], ['スチールブルー', 'Steel Blue', '#4a6a8a', 'metallic'], ['マットサンド', 'Matte Sand', '#c8b090', 'matte'], ['ネオンライム', 'Neon Lime', '#c8ff2a', 'gloss'], ['ギャラクシーパープル', 'Galaxy Purple', '#3a1a6a', 'diamond']]
    .forEach(([nm, en, c, p], i) => addItem({ id: 'pt39_' + i, type: 'paint', name: nm, en, rarity: RR6[i % 6], color: c, paint: p }));
  [['クローム5本', 'Chrome 5-Spoke', 5, 0, '#e8eef6'], ['カッパー深リム', 'Copper Deep-Rim', 6, 1, '#b8733a'], ['ブラック16本', 'Black 16-Spoke', 16, 0, '#18181a'], ['シアン深リム', 'Cyan Deep-Rim', 8, 1, '#2adcd0']].forEach(([nm, en, sp, deep, rim], i) => addItem({ id: 'wh39_' + i, type: 'wheel', name: nm, en, rarity: RR6[(i + 2) % 6], spokes: sp, deep, rim }));
  [['サンセット', [1, 0.35, 0.15], 'R'], ['ミッドナイト', [0.25, 0.3, 1], 'U']].forEach(([nm, rgb, r], i) => addItem({ id: 'ne39_' + i, type: 'neon', name: nm + 'ネオン', rarity: r, rgb }));
  [['峠のスペシャリスト', 'Touge Specialist', 'R'], ['星を集める者', 'Star Collector', 'E'], ['フルスター', 'Full Star', 'L']].forEach(([nm, en, r], i) => addItem({ id: 'tt39_' + i, type: 'title', name: '称号「' + nm + '」', en: 'Title "' + en + '"', rarity: r, title: nm, titleEn: en, desc: 'プロフィールとメニューに表示される称号' }));
}
for (const it of ITEMS) ITEM_BY_ID[it.id] = it;
window.__DLX = Object.assign(window.__DLX || {}, { CARS, CAR_BY_ID, invHas: id => invHas(id), grant: it => grantChestItem(it), ITEM_BY_ID, carClass, carMaxStars, carStars, CHARMS, MIRROR, packPool });
