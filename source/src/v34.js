// =====================================================================
// v34.js — 新メインメニュー・クリスマスカードパック（期間限定）・音楽リスト（MP3をいつでも再生）
//          プロフィール用アイテムはカードパック限定に
// =====================================================================

// ---------------- プロフィール用アイテム：カードパックからのみ入手 ----------------
{ const PT = ['picon', 'pframe', 'peffect', 'pbanner', 'title'];
  const _ds = dailyShop; dailyShop = function (k) { return _ds(k).filter(i => !PT.includes(i.type)); };
  UI.a_pshopBuy = function () { this.toast('プロフィール用アイテムはカードパック限定です'); };
  const _rc = UI.r_chest; UI.r_chest = function () { if (this.tab === 'prof') this.tab = 'chest'; let h = _rc.call(this); return h.replace(/<button class="tab[^"]*" data-a="setTab" data-v="prof">[\s\S]*?<\/button>/, ''); };
  const _pe = UI.r_profEdit; UI.r_profEdit = function () { return _pe.call(this).replace('持っていないものはショップ（プロフィールタブ・日替わり）やカードパック（プロフィールパック）で手に入ります。', '持っていないものはカードパック（プロフィールパック・クリスマスカードパックなど）からだけ手に入ります。'); };
  const _ps = UI.a_pfSet; UI.a_pfSet = function (v) { const id = v.split(':')[1]; if (id && !invHas(id)) { AUDIO.locked && AUDIO.locked(); return this.toast('まだ持っていません（カードパックから入手）'); } return _ps.call(this, v); }; }

// ---------------- クリスマスカードパック（期間限定） ----------------
addCar(['xc_frost', 'EVENT', 'FROST KAISER GT', 'クリスマス限定・氷の4WDツインターボGT（カード限定）', '4WD', 720, 780, 1560, 320, 6, 8000, 1, 88, 82, 90, 0, 'gt', 4.6, 1.92, 1.3, '#dff2ff', 0, 'v8', 2.7, 0.52, { chest: 1, cards: 1 }]);
addCar(['xc_candy', 'EVENT', 'CANDY CANE ROADSTER', 'クリスマス限定・紅白のライトウェイト（カード限定）', 'FR', 320, 330, 980, 250, 6, 8600, 0, 95, 96, 86, 0, 'roadster', 3.95, 1.74, 1.22, '#e8202a', 0, 'i4', 2.31, 0.5, { chest: 1, cards: 1 }]);
for (const id of ['xc_frost', 'xc_candy']) CAR_BY_ID[id].isNew = '3.0';
Object.assign(CAR_CARDS, { xc_frost: { need: 30, xmas: 1 }, xc_candy: { need: 25, xmas: 1 } });
for (const car of ['xc_frost', 'xc_candy']) for (const [n, r] of [[1, 'R'], [3, 'E'], [10, 'L']]) { const c = CAR_BY_ID[car]; addItem({ id: `cc_${car}_${n}`, type: 'carcard', car, cards: n, rarity: r, lim: 1, xmas: 1, name: `${c.name} カード ×${n}`, en: `${c.name} card x${n}` }); }
// クリスマス限定のプロフィール用アイテム
[['snow', '#dff2ff', 'スノーフレーク', 'Snowflake', 'R'], ['holly', '#2fdc7a', 'ヒイラギ', 'Holly', 'E'], ['candy', '#e8202a', 'キャンディケイン', 'Candy Cane', 'E'], ['lights', '#ffcf3d', 'イルミネーション', 'String Lights', 'L']]
  .forEach(([k, c, nm, en, r], i) => addItem({ id: 'pfx_' + i, type: 'pframe', name: 'フレーム「' + nm + '」', en: 'Frame "' + en + '"', rarity: r, fk: k, c1: c, c2: c, lim: 1, xmas: 1, desc: 'クリスマス限定のフレーム' }));
[['snow', '#ffffff', '聖夜の雪', 'Holy Night Snow', 'R'], ['sparkle', '#ff3a3a', 'クリスマススパーク', 'Christmas Spark', 'E'], ['orbit', '#2fdc7a', 'ツリーオービット', 'Tree Orbit', 'L']]
  .forEach(([k, c, nm, en, r], i) => addItem({ id: 'pex_' + i, type: 'peffect', name: 'エフェクト「' + nm + '」', en: 'Effect "' + en + '"', rarity: r, ek: k, c1: c, lim: 1, xmas: 1, desc: 'クリスマス限定のエフェクト' }));
[['grad', '#0a2a14', '#c8202a', 'メリークリスマス', 'Merry Christmas', 'R'], ['dots', '#0a1430', '#ffffff', 'スノーナイト', 'Snow Night', 'E']]
  .forEach(([k, a, b, nm, en, r], i) => addItem({ id: 'pbx_' + i, type: 'pbanner', name: 'バナー「' + nm + '」', en: 'Banner "' + en + '"', rarity: r, bk: k, c1: a, c2: b, lim: 1, xmas: 1, desc: 'クリスマス限定のバナー' }));
[['サンタの弟子', "Santa's Apprentice", 'R'], ['聖夜のドリフター', 'Holy Night Drifter', 'E'], ['MERRY DRIFTMAS', 'MERRY DRIFTMAS', 'L']]
  .forEach(([nm, en, r], i) => addItem({ id: 'ttx_' + i, type: 'title', name: '称号「' + nm + '」', en: 'Title "' + en + '"', rarity: r, title: nm, titleEn: en, lim: 1, xmas: 1, desc: 'クリスマス限定の称号' }));
for (const it of ITEMS) ITEM_BY_ID[it.id] = it;
// クリスマス用フレームの絵柄
{ const _fs = frameSvg; frameSvg = function (f, S) { if (!f || !['snow', 'holly', 'candy', 'lights'].includes(f.fk)) return _fs(f, S); const c = f.c1, R = 50; const around = (n, fn) => Array.from({ length: n }, (_, i) => fn(i * 360 / n, i)).join(''); let g = '';
    if (f.fk === 'snow') g = `<circle cx="60" cy="60" r="${R}" fill="none" stroke="${c}" stroke-width="3"/>` + around(8, a => `<g transform="rotate(${a} 60 60) translate(60 ${60 - R})">${[0, 60, 120].map(b => `<path d="M0 -7V7" stroke="${c}" stroke-width="1.6" transform="rotate(${b})"/>`).join('')}</g>`);
    if (f.fk === 'holly') g = `<circle cx="60" cy="60" r="${R}" fill="none" stroke="#1a7a3a" stroke-width="5"/>` + around(10, (a, i) => `<g transform="rotate(${a} 60 60) translate(60 ${60 - R})"><ellipse rx="3" ry="7" fill="#2fdc7a" transform="rotate(50)"/><ellipse rx="3" ry="7" fill="#1fa35a" transform="rotate(-50)"/>${i % 2 ? '<circle r="2.6" fill="#ff2a2a"/>' : ''}</g>`);
    if (f.fk === 'candy') g = around(32, (a, i) => `<path d="M60 ${60 - R - 3}v7" stroke="${i % 2 ? '#fff' : '#e8202a'}" stroke-width="10.5" transform="rotate(${a} 60 60)"/>`);
    if (f.fk === 'lights') g = `<circle cx="60" cy="60" r="${R}" fill="none" stroke="#2a3a2a" stroke-width="2"/>` + around(16, (a, i) => `<circle cx="60" cy="${60 - R}" r="3.4" fill="${['#ff3a3a', '#ffcf3d', '#2fdc7a', '#3a8cff'][i % 4]}" style="filter:drop-shadow(0 0 3px ${['#ff3a3a', '#ffcf3d', '#2fdc7a', '#3a8cff'][i % 4]})" transform="rotate(${a} 60 60)"/>`);
    return `<svg class="pav-fr" viewBox="-10 -10 140 140" width="${S * 1.4}" height="${S * 1.4}">${g}</svg>`; }; }
CHESTS.push({ id: 'xmaspack', name: 'クリスマスカードパック', price: 2000000, odds: { C: 0, U: 0, R: 60, E: 30, L: 10 }, color: '#e8202a', pool: 'xmas', limited: 'xmas' });
PACK_ART.xmaspack = { a: '#0a3a1a', b: '#ff3a3a', t: 'CHRISTMAS' };
function xmasPackOpen() { try { const e = EVENTS.find(x => x.id === 'xmas2026'); return e ? evState(e) === 'live' : eventActive(); } catch (x) { return eventActive(); } }
{ // プール：xmas は限定アイテム（車カード含む）。限定アイテムは通常パック・ビークルパックからは出ない
  const _rc = rollChest; rollChest = function (chest, rnd = Math.random) {
    const def = CHESTS.find(x => x.id === chest.id) || chest;
    if (def.pool === 'xmas') { let x = rnd() * 100, rar = 'R'; for (const r of RAR_ORDER) { const p = (chest.odds || def.odds)[r] || 0; if (x < p) { rar = r; break; } x -= p; }
      let pool = ITEMS.filter(i => i.xmas && i.rarity === rar); if (!pool.length) pool = ITEMS.filter(i => i.xmas); return pool[Math.floor(rnd() * pool.length)]; }
    let it = _rc(chest, rnd); let guard = 0; while (it && it.xmas && guard++ < 8) it = _rc(chest, rnd); return it; };
  const _pc = UI.packChestHTML; UI.packChestHTML = function () { const hide = !xmasPackOpen(), i = CHESTS.findIndex(c => c.id === 'xmaspack'); let saved = null; if (hide && i >= 0) saved = CHESTS.splice(i, 1)[0];
    try { let h = _pc.call(this); if (!hide) h = `<div class="xp-ban">${ICO('tree', '#2fdc7a', 26)}<span><b>期間限定：クリスマスカードパック</b><small>クリスマス限定車「FROST KAISER GT」「CANDY CANE ROADSTER」のカード、限定フレーム・エフェクト・バナー・称号が入っています（12/31まで）</small></span></div>` + h; return h; } finally { if (saved) CHESTS.splice(i, 0, saved); } };
  const _oc = UI.a_openChest; UI.a_openChest = function (v) { if (String(v).startsWith('xmaspack') && !xmasPackOpen()) return this.toast('クリスマスカードパックは期間限定です'); return _oc.call(this, v); };
}

// ---------------- 音楽リスト：追加したMP3をいつでも再生 ----------------
{ const _mp = UI.musicPlayerHTML; UI.musicPlayerHTML = function () { const h = _mp.call(this), L = AUDIO.mp3.list || [], cur = AUDIO.mp3.cur;
    const add = `<div class="h3">追加した曲（MP3）</div>${L.length ? `<div class="list">${L.map(t => `<button class="item ${cur && cur.id === t.id ? 'sel' : ''}" data-a="mSelMp3" data-v="${esc(t.file)}"><div class="grow"><div class="t">${ICO('music', '#ff6ae8', 14)} ${esc(t.name)}</div><div class="s">${{ xmasRace: 'クリスマスイベント専用曲', menu: 'メインメニュー', race: 'レース' }[t.cat] || 'MP3'}・タップで再生（終わると次の追加曲へ）</div></div></button>`).join('')}</div>` : '<div class="note">音楽ファイルは公開版（GitHub Pages）で読み込まれます。</div>'}`;
    return h + add; };
  UI.a_mSelMp3 = function (f) { const t = (AUDIO.mp3.list || []).find(x => x.file === f); if (!t) return; AUDIO.music.cat = 'mp3all'; AUDIO.music.paused = false; AUDIO.playMp3(t); this.refreshMusic && this.refreshMusic(); this.render(); };
  const _pc = AUDIO.playCat.bind(AUDIO); AUDIO.playCat = function (cat, force = false) { if (cat === 'mp3all') { const L = this.mp3.list || []; if (L.length) { const i = L.indexOf(this.mp3.cur); return this.playMp3(L[(i + 1) % L.length]); } cat = 'menu'; } return _pc(cat, force); }; }

// ---------------- 新しいメインメニュー ----------------
{ const _mi = UI.menuItems; UI.menuItems = function () {
    _mi.call(this); const el = $('menuList'); if (!el) return; const d = SAVE.data;
    const badge = {}; el.querySelectorAll('[data-m]').forEach(b => { const i = b.querySelector('i.mbadge, .mt-badge, i'); if (i && i.textContent.trim() && !i.closest('.mt-ic')) badge[b.dataset.m] = i.textContent.trim(); });
    const has = k => !!el.querySelector(`[data-m="${k}"]`), acc = el.querySelector('.mm-acc'), lv = el.querySelector('.lvbar'), stats = el.querySelector('#mmStats'), ban = el.querySelector('.mm-ban');
    const card = (k, ic, jp, en, col) => has(k) ? `<button class="nm-card" data-m="${k}" style="--c:${col}"><span class="nm-ic">${ICO(ic, col, 26)}</span><b>${jp}</b><small>${en}</small>${badge[k] ? `<i class="nm-b">${esc(badge[k])}</i>` : ''}</button>` : '';
    const pill = (k, ic, jp, col = '#cfd3dc') => has(k) ? `<button class="nm-pill" data-m="${k}">${ICO(ic, col, 18)}<span>${jp}</span>${badge[k] ? `<i class="nm-b">${esc(badge[k])}</i>` : ''}</button>` : '';
    const sc = d.story.cleared.length, st = STORY.length;
    let h = `<div class="nm-head">${acc ? acc.outerHTML : ''}${lv ? lv.outerHTML : ''}${stats ? stats.outerHTML : ''}</div>`;
    if (ban) h += ban.outerHTML.replace('mm-ban', 'mm-ban nm-ban');
    h += `<button class="nm-hero" data-m="story"><span class="nm-hero-bg"></span><span class="nm-hero-tx"><small>STORY MODE</small><b>ストーリー</b><em>シーズン1〜3 ・ ${sc} / ${st} クリア</em><span class="nm-prog"><i style="width:${Math.round(sc / st * 100)}%"></i></span></span><span class="nm-play">PLAY ▶</span></button>`;
    h += `<div class="nm-sec"><b>RACE</b><span>モードを選ぶ</span></div><div class="nm-cards">${card('race', 'flag', 'レース', 'RACE', '#ff4a4a')}${card('time', 'clock', 'タイムアタック', 'TIME ATTACK', '#ffcf3d')}${card('touge', 'mountain', 'ドリフトチャレンジ', 'DRIFT', '#2fdc7a')}${card('free', 'carSide', 'フリーラン', 'FREE RUN', '#5ad1ff')}${card('drag', 'flag2', 'ドラッグ', 'DRAG 0-400m', '#ff6a3a')}${card('practice', 'drift', '練習場', 'PRACTICE', '#9ad8ff')}${card('online', 'globe', 'オンライン', 'ONLINE', '#5ad1ff')}${card('ranking', 'trophy', 'ランキング', 'RANKING', '#ffcf3d')}</div>`;
    h += `<div class="nm-sec"><b>GARAGE & SHOP</b><span>クルマを育てる</span></div><div class="nm-pills">${pill('garage', 'garage', 'ガレージ')}${pill('tuning', 'wrench', 'チューニング')}${pill('shop', 'shop', 'カーショップ')}${pill('pshop', 'gear', 'パーツ')}${pill('bag', 'collection', 'バックパック')}</div>`;
    h += `<div class="nm-sec"><b>MORE</b><span>イベント・その他</span></div><div class="nm-pills">${pill('events', 'tree', 'イベント', '#2fdc7a')}${pill('advent', 'calendar', 'アドベント', '#ffd76a')}${pill('ach', 'medal2', '実績', '#ffcf3d')}${pill('codes', 'code', 'コード')}${pill('news', 'calendar', 'アップデート情報', '#5ad1ff')}${pill('tutorial', 'book', '遊び方')}${pill('settings', 'gear', '設定')}${pill('devPanel', 'globe', '管理画面', '#ffcf3d')}${pill('dev', 'wrench', '開発者', '#ffcf3d')}</div>`;
    el.innerHTML = h; el.classList.add('nm');
  }; }
window.__DLX = Object.assign(window.__DLX || {}, { xmasPackOpen });
