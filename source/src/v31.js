// =====================================================================
// v31.js — v3.1：プロフィール カスタマイズ（アイコン/フレーム/エフェクト/バナー/称号/ひとこと）
//          専用カードパック（ビークルカードパック / プロフィールパック）・カードパック限定車の追加
// 既存のセーブデータは変更しない（d.prof を新しく追加するだけ）
// =====================================================================
ITEM_TYPES.picon = 'プロフィールアイコン'; ITEM_TYPES.pframe = 'プロフィールフレーム'; ITEM_TYPES.peffect = 'プロフィールエフェクト'; ITEM_TYPES.pbanner = 'プロフィールバナー';
const PROF_TYPES = ['picon', 'pframe', 'peffect', 'pbanner', 'title'];
{
  const R6 = ['C', 'U', 'R', 'E', 'L'];
  // フレーム 24種
  [['solid', '#e8e8ea', 'シルバーリング', 'Silver Ring', 'C'], ['solid', '#ff3a3a', 'レッドリング', 'Red Ring', 'C'], ['solid', '#2fdc7a', 'グリーンリング', 'Green Ring', 'C'], ['double', '#ffcf3d', 'ゴールドダブル', 'Gold Double', 'U'],
   ['double', '#5ad1ff', 'アイスダブル', 'Ice Double', 'U'], ['dash', '#ffffff', 'ピットライン', 'Pit Line', 'C'], ['grad', '#ff3a6a', 'サンセット', 'Sunset', 'U', '#ffb300'], ['grad', '#5ad1ff', 'オーシャン', 'Ocean', 'U', '#7a3aff'],
   ['neon', '#ff2ad4', 'ネオンピンク', 'Neon Pink', 'R'], ['neon', '#2affea', 'ネオンシアン', 'Neon Cyan', 'R'], ['checker', '#ffffff', 'チェッカーフラッグ', 'Checkered Flag', 'R'], ['spikes', '#ff5a1a', 'スパイク', 'Spikes', 'R'],
   ['gear', '#c0c6d0', 'ギア', 'Gear', 'R'], ['tire', '#30333a', 'タイヤ', 'Tire', 'U'], ['flames', '#ff6a1a', 'フレイム', 'Flames', 'E', '#ffd23a'], ['flames', '#3a8cff', 'ブルーフレイム', 'Blue Flames', 'E', '#9ad8ff'],
   ['wings', '#ffffff', 'エンジェルウイング', 'Angel Wings', 'E'], ['wings', '#2a2a30', 'ダークウイング', 'Dark Wings', 'E'], ['crown', '#ffcf3d', 'キングクラウン', 'King Crown', 'L'], ['sakura', '#ffb7d5', 'サクラ', 'Sakura', 'R'],
   ['laurel', '#e8c45a', 'ローレル', 'Laurel', 'E'], ['hex', '#9a5aff', 'ヘキサゴン', 'Hexagon', 'R'], ['stars', '#ffe27a', 'スターダスト', 'Stardust', 'E'], ['circuit', '#2fdc7a', 'サーキットボード', 'Circuit Board', 'L']]
    .forEach(([k, c, nm, en, r, c2], i) => addItem({ id: 'pf_' + i, type: 'pframe', name: 'フレーム「' + nm + '」', en: 'Frame "' + en + '"', rarity: r, fk: k, c1: c, c2: c2 || c, desc: 'アイコンのまわりのフレーム' }));
  // エフェクト 16種
  [['pulse', '#ff3a3a', 'レッドパルス', 'Red Pulse', 'U'], ['pulse', '#5ad1ff', 'ブルーパルス', 'Blue Pulse', 'U'], ['spin', '#ffcf3d', 'ゴールドスピン', 'Gold Spin', 'R'], ['spin', '#ff2ad4', 'ネオンスピン', 'Neon Spin', 'R'],
   ['sparkle', '#ffffff', 'キラキラ', 'Sparkle', 'R'], ['sparkle', '#ffcf3d', 'ゴールドスパーク', 'Gold Spark', 'E'], ['flame', '#ff6a1a', 'バーンアウト', 'Burnout', 'E'], ['flame', '#3a8cff', 'ブルーバーン', 'Blue Burn', 'E'],
   ['snow', '#ffffff', 'スノーフォール', 'Snowfall', 'R'], ['snow', '#ffb7d5', '花びら', 'Petals', 'R'], ['orbit', '#2affea', 'オービット', 'Orbit', 'E'], ['orbit', '#ffcf3d', 'ゴールドオービット', 'Gold Orbit', 'L'],
   ['rainbow', '#ffffff', 'レインボー', 'Rainbow', 'L'], ['glitch', '#2affea', 'グリッチ', 'Glitch', 'E'], ['smoke', '#c8ccd4', 'タイヤスモーク', 'Tire Smoke', 'U'], ['bolt', '#ffe600', 'サンダー', 'Thunder', 'L']]
    .forEach(([k, c, nm, en, r], i) => addItem({ id: 'pe_' + i, type: 'peffect', name: 'エフェクト「' + nm + '」', en: 'Effect "' + en + '"', rarity: r, ek: k, c1: c, desc: 'アイコンの動く演出' }));
  // バナー 16種
  [['grad', '#2a0a12', '#e8202a', 'レーシングレッド', 'Racing Red', 'C'], ['grad', '#06142a', '#3a8cff', 'ミッドナイトブルー', 'Midnight Blue', 'C'], ['stripes', '#111', '#ffcf3d', 'ハザード', 'Hazard', 'U'], ['stripes', '#0b1a12', '#2fdc7a', 'グリーンストライプ', 'Green Stripes', 'U'],
   ['carbon', '#16171b', '#2a2c33', 'カーボン', 'Carbon', 'U'], ['checker', '#0d0d0f', '#e8e8ea', 'チェッカー', 'Checker', 'R'], ['grid', '#0a0618', '#ff2ad4', 'ネオングリッド', 'Neon Grid', 'R'], ['grid', '#020d12', '#2affea', 'サイバーグリッド', 'Cyber Grid', 'R'],
   ['sunset', '#2a0838', '#ff8a3a', '峠の夕焼け', 'Pass Sunset', 'E'], ['sunset', '#04122a', '#5ad1ff', '夜明け', 'Daybreak', 'E'], ['dots', '#1a0a20', '#ff6ae8', 'ポップドット', 'Pop Dots', 'U'], ['dots', '#0a1a10', '#ffcf3d', 'ゴールドドット', 'Gold Dots', 'R'],
   ['waves', '#04102a', '#3a8cff', '湾岸ナイト', 'Bayshore Night', 'E'], ['waves', '#200606', '#ff3a3a', 'レッドライン', 'Redline', 'E'], ['grad', '#1a1200', '#ffcf3d', 'チャンピオン', 'Champion', 'L'], ['grid', '#120020', '#b04dff', 'レジェンドグリッド', 'Legend Grid', 'L']]
    .forEach(([k, a, b, nm, en, r], i) => addItem({ id: 'pb_' + i, type: 'pbanner', name: 'バナー「' + nm + '」', en: 'Banner "' + en + '"', rarity: r, bk: k, c1: a, c2: b, desc: 'プロフィールカードの背景' }));
  // アイコン 12種
  [['carSide', '#ffffff', 'C'], ['flag', '#ffffff', 'C'], ['trophy', '#ffcf3d', 'U'], ['mountain', '#2fdc7a', 'U'], ['gem', '#9ad8ff', 'R'], ['nitro', '#5ad1ff', 'R'], ['turbo', '#ff6a1a', 'R'], ['tire', '#e8e8ea', 'U'],
   ['engine', '#ff3a3a', 'R'], ['wing', '#ffcf3d', 'E'], ['globe', '#2affea', 'E'], ['music', '#ff6ae8', 'U']]
    .forEach(([ic, c, r], i) => addItem({ id: 'pi_' + i, type: 'picon', name: 'アイコン「' + ic.toUpperCase() + '」', en: 'Icon "' + ic.toUpperCase() + '"', rarity: r, ic, c1: c, desc: 'プロフィールのアイコン' }));
  // 称号 10種（追加）
  [['ブレーキは飾り', 'Brakes Are Decor', 'U'], ['峠の主', 'Lord of the Pass', 'E'], ['都市高速ランナー', 'Expressway Runner', 'R'], ['ヘアピン職人', 'Hairpin Artisan', 'R'], ['0.001秒の男', 'Thousandth Hunter', 'E'],
   ['夜明けの走り屋', 'Dawn Racer', 'R'], ['カードコレクター', 'Card Collector', 'U'], ['フルカウンター', 'Full Counter', 'R'], ['伝説の始まり', 'A Legend Begins', 'C'], ['DRIFT KING', 'DRIFT KING', 'L']]
    .forEach(([nm, en, r], i) => addItem({ id: 'tt_' + (15 + i), type: 'title', name: '称号「' + nm + '」', en: 'Title "' + en + '"', rarity: r, title: nm, titleEn: en, desc: 'プロフィールとメニューに表示される称号' }));
}

// ---------------- カードパック限定車（追加） ----------------
addCar(['pk_tank', 'IRONWORKS', 'TYPE-26 "TETSUJIN"', '戦車（キャタピラ・カードパック限定）', '4WD', 800, 2200, 4200, 110, 4, 3200, 1, 42, 58, 55, 0, 'tank', 6.6, 3.0, 2.3, '#5a6a3a', 0, 'diesel', 3.8, 0.5, { chest: 1, cards: 1 }]);
addCar(['pk_f1', 'VELOCE', 'FORMULA V-26', 'フォーミュラカー（オープンホイール・カードパック限定）', 'MR', 1000, 820, 800, 350, 8, 13000, 1, 99, 45, 99, 0, 'formula', 5.4, 2.0, 0.95, '#e8202a', 0, 'v6', 3.6, 0.45, { chest: 1, cards: 1 }]);
addCar(['pk_brick', 'BLOCKWORKS', 'BRICK RACER', 'ブロックで組んだ車（カードパック限定）', 'FR', 260, 300, 900, 215, 5, 7500, 0, 82, 88, 76, 0, 'brick', 3.9, 1.8, 1.55, '#ffcf00', 0, 'i4', 2.4, 0.5, { chest: 1, cards: 1 }]);
for (const id of ['pk_tank', 'pk_f1', 'pk_brick']) CAR_BY_ID[id].isNew = '3.1';
Object.assign(CAR_CARDS, { pk_tank: { need: 40 }, pk_f1: { need: 50 }, pk_brick: { need: 30 } });
for (const car of ['pk_tank', 'pk_f1', 'pk_brick']) for (const [n, r] of [[1, 'R'], [3, 'E'], [10, 'L']]) { const c = CAR_BY_ID[car]; addItem({ id: `cc_${car}_${n}`, type: 'carcard', car, cards: n, rarity: r, name: `${c.name} カード ×${n}`, en: `${c.name} card x${n}` }); }
for (const it of ITEMS) ITEM_BY_ID[it.id] = it;

// ---------------- 専用カードパック ----------------
CHESTS.push({ id: 'carpack', name: 'ビークルカードパック', price: 3000000, odds: { C: 0, U: 0, R: 62, E: 30, L: 8 }, color: '#ff6a3a', pool: 'car' });
CHESTS.push({ id: 'profpack', name: 'プロフィールパック', price: 1000000, odds: { C: 30, U: 34, R: 22, E: 11, L: 3 }, color: '#5ad1ff', pool: 'prof' });
Object.assign(PACK_ART, { carpack: { a: '#3a1206', b: '#ff6a3a', t: 'VEHICLE' }, profpack: { a: '#061a2e', b: '#5ad1ff', t: 'PROFILE' } });
{
  const _rc = rollChest; rollChest = function (chest, rnd = Math.random) {
    const def = CHESTS.find(x => x.id === chest.id) || chest;
    if (def.pool) { let x = rnd() * 100, rar = 'R'; for (const r of RAR_ORDER) { const p = (chest.odds || def.odds)[r] || 0; if (x < p) { rar = r; break; } x -= p; }
      const ok = i => def.pool === 'car' ? i.type === 'carcard' : PROF_TYPES.includes(i.type) && !i.lim;
      let pool = ITEMS.filter(i => ok(i) && i.rarity === rar); if (!pool.length) pool = ITEMS.filter(ok); return pool[Math.floor(rnd() * pool.length)]; }
    const it = _rc(chest, rnd);
    if (it && it.type === 'carcard') { const cs = ITEMS.filter(i => i.type === 'carcard' && i.rarity === it.rarity); return cs[Math.floor(rnd() * cs.length)] || it; } // 限定車カードはランダムな車に
    return it; };
}

// ---------------- プロフィール表示 ----------------
function profData() { const d = SAVE.data; return d.prof || {}; }
function frameSvg(f, S) {
  if (!f) return ''; const c = f.c1, c2 = f.c2, R = 50, k = f.fk; let g = '';
  const ring = (r, w, col, extra = '') => `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${col}" stroke-width="${w}" ${extra}/>`;
  const around = (n, fn) => Array.from({ length: n }, (_, i) => fn(i * 360 / n, i)).join('');
  if (k === 'solid') g = ring(R, 6, c);
  else if (k === 'double') g = ring(R + 2, 3, c) + ring(R - 4, 2, c);
  else if (k === 'dash') g = ring(R, 5, c, 'stroke-dasharray="10 6"');
  else if (k === 'grad') g = `<defs><linearGradient id="fg${f.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>` + ring(R, 7, `url(#fg${f.id})`);
  else if (k === 'neon') g = ring(R, 4, c, `style="filter:drop-shadow(0 0 4px ${c}) drop-shadow(0 0 8px ${c})"`) + ring(R, 1.5, '#fff');
  else if (k === 'checker') g = around(24, (a, i) => `<path d="M60 ${60 - R - 4}v8" stroke="${i % 2 ? '#111' : c}" stroke-width="13.5" transform="rotate(${a} 60 60)"/>`);
  else if (k === 'spikes') g = ring(R, 4, c) + around(12, a => `<path d="M55 ${62 - R}l5 -12l5 12z" fill="${c}" transform="rotate(${a} 60 60)"/>`);
  else if (k === 'gear') g = ring(R, 6, c) + around(16, a => `<rect x="56" y="${60 - R - 8}" width="8" height="8" fill="${c}" transform="rotate(${a} 60 60)"/>`);
  else if (k === 'tire') g = ring(R + 1, 10, c) + around(28, a => `<rect x="58.5" y="${60 - R - 5}" width="3" height="10" fill="#55585f" transform="rotate(${a} 60 60)"/>`);
  else if (k === 'flames') g = ring(R, 4, c) + around(14, (a, i) => `<path d="M56 ${62 - R}q4 -${10 + (i % 3) * 4} 2 -${16 + (i % 3) * 4}q8 ${8} 6 ${16 + (i % 3) * 4}z" fill="${i % 2 ? c2 : c}" transform="rotate(${a} 60 60)"/>`);
  else if (k === 'wings') g = ring(R, 4, c) + [-1, 1].map(s => `<g transform="translate(60 60) scale(${s} 1)">${[0, 1, 2, 3].map(j => `<path d="M${R - 2} ${-12 + j * 9}q${16 + j * 3} -10 ${26 - j * 3} ${-2 + j * 2}q-12 4 -26 ${12}z" fill="${c}" stroke="#0006" stroke-width=".8"/>`).join('')}</g>`).join('');
  else if (k === 'crown') g = ring(R, 5, c) + `<path d="M38 ${62 - R}l6 -18l9 12l7 -16l7 16l9 -12l6 18z" fill="${c}" stroke="#7a5a00" stroke-width="1.5"/><circle cx="60" cy="${60 - R - 14}" r="3" fill="#ff3a3a"/>`;
  else if (k === 'sakura') g = ring(R, 3, c) + around(10, a => `<g transform="rotate(${a} 60 60) translate(60 ${60 - R})">${[0, 72, 144, 216, 288].map(b => `<ellipse cx="0" cy="-4" rx="2.6" ry="4.5" fill="${c}" transform="rotate(${b})"/>`).join('')}<circle r="1.4" fill="#fff6"/></g>`);
  else if (k === 'laurel') g = [-1, 1].map(s => `<g transform="translate(60 60) scale(${s} 1)">${Array.from({ length: 9 }, (_, j) => { const a = (110 - j * 22) * Math.PI / 180; return `<ellipse cx="${(R + 2) * Math.cos(a)}" cy="${(R + 2) * Math.sin(a)}" rx="3.5" ry="7" fill="${c}" transform="rotate(${110 - j * 22 + 90} ${(R + 2) * Math.cos(a)} ${(R + 2) * Math.sin(a)})"/>`; }).join('')}</g>`).join('');
  else if (k === 'hex') g = `<polygon points="${around(6, a => { const r = (a - 90) * Math.PI / 180; return `${60 + (R + 4) * Math.cos(r)},${60 + (R + 4) * Math.sin(r)} `; })}" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>`;
  else if (k === 'stars') g = ring(R, 2, c) + around(8, a => `<path d="M60 ${48 - R + 8}l2.4 5 5.4 .6-4 3.7 1.1 5.4-4.9-2.7-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" fill="${c}" transform="rotate(${a} 60 60)"/>`);
  else if (k === 'circuit') g = ring(R, 3, c) + around(12, (a, i) => `<g transform="rotate(${a} 60 60)"><path d="M60 ${60 - R}v-7h${i % 2 ? 6 : -6}" stroke="${c}" stroke-width="2" fill="none"/><circle cx="${60 + (i % 2 ? 6 : -6)}" cy="${53 - R}" r="2" fill="${c}"/></g>`);
  return `<svg class="pav-fr" viewBox="-10 -10 140 140" width="${S * 1.4}" height="${S * 1.4}">${g}</svg>`;
}
function bannerCSS(b) {
  if (!b) return 'background:linear-gradient(135deg,#1a1d26,#0c0d12)'; const a = b.c1, c = b.c2;
  return { grad: `background:linear-gradient(135deg,${a},${c})`, stripes: `background:repeating-linear-gradient(135deg,${a} 0 18px,${c} 18px 26px)`, carbon: `background:repeating-linear-gradient(45deg,${a} 0 4px,${c} 4px 8px),${a};background-blend-mode:multiply`,
    checker: `background:conic-gradient(${a} 25%,${c} 0 50%,${a} 0 75%,${c} 0) 0 0/28px 28px`, grid: `background:linear-gradient(${c}55 1px,transparent 1px) 0 0/22px 22px,linear-gradient(90deg,${c}55 1px,transparent 1px) 0 0/22px 22px,radial-gradient(circle at 70% 120%,${c}66,${a} 60%)`,
    sunset: `background:linear-gradient(180deg,${a} 0%,${c} 70%,#ffd27a 100%)`, dots: `background:radial-gradient(${c} 2px,transparent 2.5px) 0 0/16px 16px,${a}`, waves: `background:repeating-radial-gradient(circle at 80% 120%,${a} 0 14px,${c}44 14px 18px),${a}` }[b.bk] || `background:${a}`;
}
function profAvatarHTML(S = 64, p = profData(), name) {
  const ic = p.icon && ITEM_BY_ID[p.icon], fr = p.frame && ITEM_BY_ID[p.frame], fx = p.effect && ITEM_BY_ID[p.effect];
  name = name || (window.DL_FB && DL_FB.profile && DL_FB.profile.name) || SAVE.data.settings.nick || 'P';
  return `<div class="pav ${fx ? 'fx-' + fx.ek : ''}" style="--s:${S}px;--fc:${fx ? fx.c1 : '#fff'}">${fx ? '<i class="pav-fx"></i><i class="pav-fx2"></i>' : ''}<div class="pav-in">${ic ? ICO(ic.ic, ic.c1, Math.round(S * 0.55)) : `<b class="noi18n">${esc((name[0] || 'P').toUpperCase())}</b>`}</div>${frameSvg(fr, S)}</div>`;
}
function profCardHTML(big = true) {
  const d = SAVE.data, p = profData(), name = (window.DL_FB && DL_FB.profile && DL_FB.profile.name) || d.settings.nick || 'プレイヤー', ttl = d.title && ITEM_BY_ID[d.title], bn = p.banner && ITEM_BY_ID[p.banner], I = lvInfo(d.xp);
  return `<div class="pcard2 ${big ? 'big' : ''}" style="${bannerCSS(bn)}"><div class="pcard2-sh"></div>${profAvatarHTML(big ? 76 : 48, p, name)}<div class="pcard2-m"><b class="noi18n">${esc(name)}</b>${ttl ? `<span class="ttl-badge">${esc(ttl.title)}</span>` : ''}${p.bio ? `<p class="noi18n">${esc(p.bio)}</p>` : ''}<small>Lv.${I.lv}</small></div></div>`;
}
function profItemPreview(it, S = 46) {
  if (it.type === 'pframe') return profAvatarHTML(S, Object.assign({}, profData(), { frame: it.id, effect: null }));
  if (it.type === 'peffect') return profAvatarHTML(S, Object.assign({}, profData(), { effect: it.id }));
  if (it.type === 'picon') return profAvatarHTML(S, { icon: it.id });
  if (it.type === 'pbanner') return `<div class="pb-prev" style="${bannerCSS(it)};width:${S * 1.6}px;height:${S}px"></div>`;
  return null;
}
{ const _icon = itemIconSvg; itemIconSvg = function (it, size = 34) { if (it && ['pframe', 'peffect', 'picon', 'pbanner'].includes(it.type)) return `<span class="pi-wrap" style="width:${size}px;height:${size}px">${profItemPreview(it, Math.round(size * 0.66))}</span>`; return _icon(it, size); }; }
// インベントリから装着できるように
{ EQUIPPABLE.push('picon', 'pframe', 'peffect', 'pbanner');
  const key = { picon: 'icon', pframe: 'frame', peffect: 'effect', pbanner: 'banner' };
  const _eq = itemEquipped; itemEquipped = function (it, inst) { if (key[it.type]) return profData()[key[it.type]] === it.id; return _eq(it, inst); };
  const _ap = itemApply; itemApply = function (it, inst, on = true) { if (key[it.type]) { const d = SAVE.data; d.prof = d.prof || {}; d.prof[key[it.type]] = on ? it.id : null; return; } return _ap(it, inst, on); }; }

Object.assign(UI, {
  r_profEdit() {
    $('panelTitle').textContent = 'EDIT PROFILE'; const d = SAVE.data; d.prof = d.prof || {}; $('panelBody').classList.add('wide'); if (!this.tab) this.tab = 'pframe';
    const T = [['pframe', 'フレーム'], ['peffect', 'エフェクト'], ['picon', 'アイコン'], ['pbanner', 'バナー'], ['title', '称号'], ['bio', 'ひとこと']];
    let h = profCardHTML(true) + `<div class="tabs" style="margin-top:10px">${T.map(([k, l]) => `<button class="tab ${this.tab === k ? 'on' : ''}" data-a="setTab" data-v="${k}">${l}</button>`).join('')}</div>`;
    if (this.tab === 'bio') { h += `<div class="dev-form"><label>ひとこと（40文字まで）<input id="pfBio" maxlength="40" value="${esc(d.prof.bio || '')}"></label><label>表示名（ニックネーム）<input id="pfNick" maxlength="16" value="${esc(d.settings.nick || '')}"></label><button class="btn pri" data-a="pfSaveBio">保存</button></div><div class="note">Googleでログインしてランキング用のユーザーネームを決めている場合は、そちらの名前が表示されます。</div>`; return h; }
    const list = ITEMS.filter(i => i.type === this.tab); const cur = this.tab === 'title' ? d.title : d.prof[{ picon: 'icon', pframe: 'frame', peffect: 'effect', pbanner: 'banner' }[this.tab]];
    const own = list.filter(i => invHas(i.id)).length;
    h += `<div class="note">所持 ${own} / ${list.length}　・　持っていないものはショップ（プロフィールタブ・日替わり）やカードパック（プロフィールパック）で手に入ります。</div><div class="pe-grid"><button class="pe-it ${!cur ? 'on' : ''}" data-a="pfSet" data-v="${this.tab}:"><div class="pe-pv">${this.tab === 'title' ? '<span class="ttl-badge">なし</span>' : this.tab === 'pbanner' ? `<div class="pb-prev" style="${bannerCSS(null)};width:74px;height:46px"></div>` : profAvatarHTML(46, Object.assign({}, d.prof, { [{ picon: 'icon', pframe: 'frame', peffect: 'effect' }[this.tab]]: null }))}</div><b>なし</b></button>`;
    for (const it of list) { const has = invHas(it.id); h += `<button class="pe-it ${cur === it.id ? 'on' : ''} ${has ? '' : 'locked'}" data-a="pfSet" data-v="${this.tab}:${it.id}" style="--rc:${RARITY[it.rarity].color}"><div class="pe-pv">${it.type === 'title' ? `<span class="ttl-badge">${esc(it.title)}</span>` : profItemPreview(it, 46)}</div><b>${esc(it.name.replace(/^.*?「|」$/g, ''))}</b><small style="color:${RARITY[it.rarity].color}">${RARITY[it.rarity].name}</small>${has ? '' : `<i class="pe-lock">${ICO('lock', '#fff', 14)}</i>`}</button>`; }
    return h + '</div>';
  },
  a_pfSet(v) { const [t, id] = v.split(':'); const d = SAVE.data; d.prof = d.prof || {}; if (id && !invHas(id)) { AUDIO.locked && AUDIO.locked(); return this.toast('まだ持っていません（ショップ・カードパックで入手）'); }
    if (t === 'title') d.title = id || null; else d.prof[{ picon: 'icon', pframe: 'frame', peffect: 'effect', pbanner: 'banner' }[t]] = id || null; AUDIO.confirm && AUDIO.confirm(); SAVE.save(); this.render(); },
  a_pfSaveBio() { const d = SAVE.data; d.prof = d.prof || {}; d.prof.bio = $('pfBio').value.trim().slice(0, 40); const nk = $('pfNick').value.trim().slice(0, 16); if (nk) d.settings.nick = nk; SAVE.save(); this.toast('保存しました'); this.render(); },
  a_pfEdit() { this.open('profEdit'); },
  a_pshopBuy(id) { const it = ITEM_BY_ID[id]; if (!it || invHas(id) || it.rarity === 'L') return; const pr = RARITY[it.rarity].shop;
    if (!SAVE.spend(pr)) return; grantChestItem(it); SAVE.save(); AUDIO.buy && AUDIO.buy(); this.toast(it.name + ' を購入しました'); this.refreshTop(); this.render(); }
});
// プロフィール画面の頭をカード表示に・編集ボタン
{ const _rp = UI.r_profile; UI.r_profile = function () { let h = _rp.call(this); const a = h.indexOf('<div class="pf-head">'), b = h.indexOf('<div class="lvbar'); if (a >= 0 && b > a) h = h.slice(0, a) + profCardHTML(true) + `<div class="btns" style="margin:8px 0"><button class="btn pri" data-a="pfEdit">${ICO('spray', '#111', 16)} プロフィールを編集</button></div>` + h.slice(b); return h; }; }
// メニューのアカウント欄にアバター
{ const _ma = UI.menuAccountHTML; UI.menuAccountHTML = function () { const h = _ma.call(this); return h.replace(/(<button class="mm-acc[^"]*" data-m="account">)<svg[\s\S]*?<\/svg>/, '$1' + profAvatarHTML(34)); }; }
// ショップに「プロフィール」タブ（L以外は定価で購入可能・Lはカードパック限定）＋ 日替わりショップのデザイン刷新
{ const _rc = UI.r_chest; UI.r_chest = function () { let h = _rc.call(this);
    h = h.replace(/(<button class="tab[^"]*" data-a="setTab" data-v="col">)/, `<button class="tab ${this.tab === 'prof' ? 'on' : ''}" data-a="setTab" data-v="prof">${ICO('trophy', '#ffcf3d', 16)} プロフィール</button>$1`);
    if (this.tab === 'prof') { const d = SAVE.data; h += `<div class="shop-head"><div><b>PROFILE SHOP</b><small>フレーム・エフェクト・アイコン・バナー・称号。レジェンダリーはプロフィールパック限定です</small></div><button class="btn" data-a="pfEdit">プロフィールを編集</button></div>`;
      for (const t of PROF_TYPES) { const list = ITEMS.filter(i => i.type === t && !i.lim); h += `<div class="h3">${ITEM_TYPES[t] || '称号'}</div><div class="shop-grid modern">${list.map(it => { const has = invHas(it.id), L = it.rarity === 'L';
        return `<div class="sitem m2" style="--rc:${RARITY[it.rarity].color}"><span class="si-rar">${RARITY[it.rarity].name}</span><div class="si-ic">${it.type === 'title' ? `<span class="ttl-badge">${esc(it.title)}</span>` : profItemPreview(it, 46)}</div><div class="si-nm">${esc(it.name)}</div><button class="btn ${has || L ? '' : 'pri'}" data-a="pshopBuy" data-v="${it.id}" ${has || L ? 'disabled' : ''}>${has ? '所持済み' : L ? 'パック限定' : yen(RARITY[it.rarity].shop)}</button></div>`; }).join('')}</div>`; } }
    if (this.tab === 'shop') { h = h.replace('<div class="shop-grid">', '<div class="shop-grid modern">').replace(/<div class="sitem" style="border-color:([^"]+)">/g, '<div class="sitem m2" style="--rc:$1">').replace(/(<div class="sitem m2" style="--rc:([^"]+)">)/g, '$1<span class="si-glow"></span>');
      h = h.replace(/<div class="note">毎日 0:00（日本時間）に品揃えが入れ替わります。次の更新まで <b id="shopLeft">([^<]*)<\/b><\/div>/, '<div class="shop-head"><div><b>DAILY SHOP</b><small>毎日 0:00（日本時間）に品揃えが入れ替わります</small></div><div class="shop-cd"><small>次の更新まで</small><b id="shopLeft">$1</b></div></div>'); }
    return h; }; }
window.__DLX = Object.assign(window.__DLX || {}, { profCardHTML, PROF_TYPES });
