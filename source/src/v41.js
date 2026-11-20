// =====================================================================
// v41.js — v3.3：クリスマスプレゼントボックス／プレゼント配布システム（開発者）／クリスマス限定ショップ／
//          クリスマスイブイベント／カード・パック演出の3D化／パーツをガレージへ統合／バックパックUI刷新
// =====================================================================
// ---------------- プレゼントボックス（中身ランダム） ----------------
CHESTS.push({ id: 'giftbox', name: 'クリスマスプレゼントボックス', price: 1500000, odds: { C: 0, U: 30, R: 38, E: 22, L: 10 }, color: '#e8202a', pool: 'gift', hidden: 1 });
PACK_ART.giftbox = { a: '#7a0010', b: '#ffd23a', t: 'PRESENT' };
const GIFT_TYPES = ['cash', 'dia', 'ticket', 'carcard', 'paint', 'wheel', 'neon', 'caliper', 'plate', 'decal', 'title', 'kit', 'meter'];
{ const _pp = packPool; packPool = function (c, rar) { if (c.pool === 'gift') return ITEMS.filter(i => i.rarity === rar && !i.neon && !i.mythic && !PROF_TYPES.includes(i.type) && (i.xmas ? i.type === 'carcard' : GIFT_TYPES.includes(i.type) && (!i.lim || i.type === 'carcard'))); return _pp(c, rar); }; }
{ const hideGift = fn => function () { const i = CHESTS.findIndex(c => c.id === 'giftbox'); const s = i >= 0 ? CHESTS.splice(i, 1)[0] : null; try { return fn.apply(this, arguments); } finally { if (s) CHESTS.splice(i, 0, s); } };
  if (UI.packStoreHTML) UI.packStoreHTML = hideGift(UI.packStoreHTML); if (UI.boxCards) UI.boxCards = hideGift(UI.boxCards); if (UI.packChestHTML) UI.packChestHTML = hideGift(UI.packChestHTML); }
const giftBoxHTML = (s = 1, col = '#e8202a', rib = '#ffd23a') => `<div class="pk gbox" style="--gs:${s};--gc:${col};--gr:${rib}"><div class="gb-cube"><div class="gb-f gb-front"></div><div class="gb-f gb-back"></div><div class="gb-f gb-left"></div><div class="gb-f gb-right"></div><div class="gb-f gb-bottom"></div><div class="gb-lid"><div class="gb-f gb-ltop"></div><div class="gb-f gb-lfront"></div><div class="gb-f gb-lback"></div><div class="gb-f gb-lleft"></div><div class="gb-f gb-lright"></div><div class="gb-bow"><i></i><i></i><b></b></div></div><div class="gb-light"></div></div></div>`;
{ const _ph = packHTML; packHTML = function (c, size = 1) { if (c && c.id === 'giftbox') return giftBoxHTML(size); return _ph(c, size); }; }
{ const _pu = typeof packPouch === 'function' ? packPouch : null; if (_pu) packPouch = function (c, s) { if (c && c.id === 'giftbox') return `<div class="gb-pouch">${giftBoxHTML(s * 0.9)}</div>`; return _pu(c, s); }; }
{ const _tear = PACKFX.tear; PACKFX.tear = function () { if (!this.c || this.c.id !== 'giftbox') return _tear.call(this); if (this._torn) return; this._torn = true; setTimeout(() => this._torn = false, 3000); this.busy = true;
    const o = this.o, st = o.querySelector('.pfx-stage'), gb = st.querySelector('.gbox'), top = this.topRar(); st.style.setProperty('--gl', (this.cols(top) || ['#fff'])[0]);
    o.querySelector('.pfx-open').classList.add('hide'); const md = o.querySelector('.pfx-mode'); md && md.remove(); const g = st.querySelector('.pc-guide'); g && g.remove();
    gb.classList.remove('float', 'enter'); gb.classList.add('shake'); AUDIO.pkCharge && AUDIO.pkCharge();
    setTimeout(() => { gb.classList.remove('shake'); gb.classList.add('untie'); AUDIO.pkSelect && AUDIO.pkSelect(); }, 700);
    setTimeout(() => { gb.classList.add('lidoff', 'r-' + top); AUDIO.chestOpen ? AUDIO.chestOpen(top === 'L' ? 4 : 3) : AUDIO.pkTear && AUDIO.pkTear(); }, 1100);
    setTimeout(() => { gb.classList.add('drop'); this.deal(); }, 1800); }; }
{ const _open = PACKFX.open; PACKFX.open = function (c, res) { _open.call(this, c, res); if (c && c.id === 'giftbox') { const tip = this.o.querySelector('.pfx-tip'); if (tip) tip.textContent = 'ボタンを押してプレゼントを開けよう！'; const md = this.o.querySelector('.pfx-mode'); md && md.remove(); const g = this.o.querySelector('.pc-guide'); g && g.remove(); this.mode = 'gift'; } }; }

// ---------------- プレゼント配布（受け取りボックス） ----------------
const XMAS_GIFT = { id: 'xmas2026', title: 'メリークリスマス！', msg: 'いつも DRIFT LEGENDS で遊んでくれてありがとう！ 全員にクリスマスプレゼントボックスをお届けします。中身はランダム！', items: [['pack', 'giftbox', 1]], start: JST('2026-12-25T00:00:00'), end: JST('2026-12-31T23:59:59'), from: 'DRIFT LEGENDS 運営' };
const GIFTS = { srv: {} };
function giftList() { const t = SRV.now(), d = SAVE.data; d.giftGot = d.giftGot || {}; const all = [XMAS_GIFT].concat(Object.entries(GIFTS.srv).map(([id, g]) => Object.assign({ id: 's_' + id }, g)));
  return all.filter(g => g && g.items && t >= (g.start || 0) && t <= (g.end || 0) && g.active !== false).sort((a, b) => (b.start || 0) - (a.start || 0)); }
const giftsPending = () => giftList().filter(g => !SAVE.data.giftGot[g.id]);
function giftItemsNorm(items) { return (Array.isArray(items) ? items : Object.values(items || {})).map(r => Array.isArray(r) ? r : [r.k, r.a, r.n]).filter(r => r && ['money', 'dia', 'pack', 'box', 'cards', 'ticket', 'item'].includes(r[0])).map(r => r[0] === 'money' || r[0] === 'dia' || r[0] === 'ticket' ? [r[0], Math.max(0, Math.min(r[0] === 'money' ? 1e9 : 100000, +r[1] || 0))] : r[0] === 'box' ? [r[0], r[1]] : r[0] === 'item' ? [r[0], r[1]] : [r[0], r[1], Math.max(1, Math.min(100, +r[2] || 1))]); }
function giftValid(r) { const [k, a] = r; if (k === 'pack' || k === 'box') return !!CHESTS.find(c => c.id === a); if (k === 'cards') return !!CAR_BY_ID[a]; if (k === 'item') return !!ITEM_BY_ID[a]; return true; }
{ const _st = ADM.start; ADM.start = async function () { const r = await _st.apply(this, arguments); try { if (window.DL_FB) { await DL_FB.ready(); DL_FB.db().ref('admin/gifts').limitToLast(30).on('value', s => { GIFTS.srv = s.val() || {}; UI.giftCheck && UI.giftCheck(); }, () => { }); } } catch (e) { } return r; }; }
Object.assign(UI, {
  giftCheck() { if (this.screen !== 'menu' || this.game && this.game.active) return; const p = giftsPending(); const b = document.querySelector('.nm-gift'); if (b) b.querySelector('em').textContent = p.length;
    this._giftShown = this._giftShown || {}; const g = p.find(x => !this._giftShown[x.id]); if (g && !document.querySelector('#overlay:not(.hidden) .modal') ) { this._giftShown[g.id] = 1; this.giftPopup(g); } },
  giftPopup(g) { const items = giftItemsNorm(g.items).filter(giftValid); AUDIO.levelUp && AUDIO.levelUp();
    this.modal(`<div class="gf-pop"><div class="gf-art">${giftBoxHTML(0.9)}</div><small>${esc(g.from || 'DRIFT LEGENDS 運営')} からのプレゼント</small><h2>${esc(g.title || 'プレゼント')}</h2><div class="note">${esc(g.msg || '')}</div><div class="gf-items">${items.map(r => `<span>${rwArt(r, 34)}<b>${esc(rwLabel(r))}</b></span>`).join('')}</div><div class="btns"><button class="btn" data-a="closeModal">あとで</button><button class="btn pri" data-a="giftClaim" data-v="${esc(g.id)}">受け取る</button></div></div>`); },
  a_giftClaim(id) { const g = giftList().find(x => x.id === id), d = SAVE.data; if (!g || d.giftGot[id]) return this.closeModal(); d.giftGot[id] = SRV.now(); const items = giftItemsNorm(g.items).filter(giftValid), out = [];
    for (const r of items) { if (r[0] === 'pack') { const u = unopened(); u.packs[r[1]] = (u.packs[r[1]] || 0) + r[2]; } else if (r[0] === 'box') { const u = unopened(); u.boxes[r[1]] = (u.boxes[r[1]] || 0) + 1; } else grantRw(r); out.push(rwLabel(r)); }
    SAVE.save(); this.closeModal(); AUDIO.confirm && AUDIO.confirm(); this.refreshTop(); this.toast('受け取りました：' + out.join('・') + (items.some(r => r[0] === 'pack' || r[0] === 'box') ? '（ストア → 未開封 から開けられます）' : ''));
    if (this.screen === 'gifts') this.render(); else if (this.screen === 'menu') this.menuItems(); },
  r_gifts() { $('panelTitle').textContent = 'PRESENT BOX'; const L = giftList(), d = SAVE.data; this.show.setCar(SAVE.cur());
    let h = `<div class="mx-hero gfh"><div class="mx-hero-ic">${giftBoxHTML(0.42)}</div><div><b>PRESENT BOX</b><small>運営からのプレゼントを受け取れます（受け取ったパック・BOXは ストア → 未開封 から開けられます）</small></div></div>`;
    h += L.length ? `<div class="gf-list">${L.map((g, i) => { const got = d.giftGot[g.id], items = giftItemsNorm(g.items).filter(giftValid); return `<div class="gf-row ${got ? 'got' : ''}" style="animation-delay:${i * 0.05}s"><div class="gf-ic">${giftBoxHTML(0.3)}</div><div class="gf-tx"><b>${esc(g.title || 'プレゼント')}</b><small>${esc(g.msg || '')}</small><div class="gf-items sm">${items.map(r => `<span>${rwArt(r, 22)}${esc(rwLabel(r))}</span>`).join('')}</div><em>受け取り期限：${new Date(g.end).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</em></div>${got ? '<span class="gf-ok">受取済み</span>' : `<button class="st-buy" data-a="giftClaim" data-v="${esc(g.id)}">受け取る</button>`}</div>`; }).join('')}</div>` : `<div class="note">いま受け取れるプレゼントはありません。12月25日にはクリスマスプレゼントが届きます！</div>`;
    return h; }
});
{ const _mi = UI.menuItems; UI.menuItems = function () { _mi.call(this); const el = $('menuList'); if (!el) return; const n = giftsPending().length; const hero = el.querySelector('.nm-hero');
    if (n && hero && !el.querySelector('.nm-gift')) hero.insertAdjacentHTML('beforebegin', `<button class="nm-gift" data-m="gifts"><span class="ngf-ic">${giftBoxHTML(0.26)}</span><span><b>プレゼントが届いています！</b><small>タップして受け取る</small></span><em>${n}</em></button>`);
    el.querySelectorAll('[data-m="pshop"]').forEach(b => b.remove()); setTimeout(() => this.giftCheck(), 900); }; }
BNAV_OF.gifts = 'home';
// 開発者：プレゼント配布
const GIFT_KINDS = [['money', 'お金'], ['dia', 'ダイヤ'], ['pack', 'カードパック（未開封）'], ['box', 'パックBOX（未開封）'], ['cards', '車カード'], ['ticket', 'フルチューンチケット'], ['item', 'アイテム（ID指定）']];
{ const _dp = UI.r_devPanel; UI.r_devPanel = function () { let h = _dp.call(this); if (!DEV.owner || !window.DL_FB) return h; h = h.replace('</div><div class="note">', `<button class="tab ${this.tab === 'gift' ? 'on' : ''}" data-a="setTab" data-v="gift">GIFTS</button></div><div class="note">`);
    if (this.tab !== 'gift') return h; this.gfRows = this.gfRows || [['pack', 'giftbox', 1]]; const t = SRV.now();
    const opts = k => k === 'pack' || k === 'box' ? CHESTS.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('') : k === 'cards' ? Object.keys(CAR_CARDS).map(id => `<option value="${id}">${esc(CAR_BY_ID[id].name)}</option>`).join('') : '';
    let f = `<div class="dev-form"><label>タイトル<input id="gfT" maxlength="60" value="プレゼントをお届けします！"></label><label>メッセージ<textarea id="gfM" rows="2" maxlength="300">いつも遊んでくれてありがとう！</textarea></label><label>差出人<input id="gfF" maxlength="30" value="DRIFT LEGENDS 運営"></label><div class="h3">配布するもの</div>`;
    this.gfRows.forEach(([k, a, n], i) => { f += `<div class="gf-dev"><select data-in="gfK" data-i="${i}">${GIFT_KINDS.map(([v, l]) => `<option value="${v}" ${v === k ? 'selected' : ''}>${l}</option>`).join('')}</select>${['pack', 'box', 'cards'].includes(k) ? `<select id="gfA${i}">${opts(k).replace(`value="${a}"`, `value="${a}" selected`)}</select>` : k === 'item' ? `<input id="gfA${i}" placeholder="アイテムID（例 tt_24）" value="${esc(a || '')}">` : `<input id="gfA${i}" type="number" min="1" value="${a || (k === 'money' ? 1000000 : k === 'dia' ? 100 : 1)}">`}${['pack', 'cards'].includes(k) ? `<input id="gfN${i}" type="number" min="1" max="100" value="${n || 1}" style="width:70px">` : ''}<button class="btn" data-a="gfDel" data-v="${i}">✕</button></div>`; });
    f += `<div class="btns"><button class="btn" data-a="gfAdd">＋ 追加</button><button class="btn" data-a="gfPreset" data-v="xmas">プリセット：プレゼントボックス</button><button class="btn" data-a="gfPreset" data-v="rich">プリセット：お金＋ダイヤ</button></div>
      <label>受け取り期間（日）<input id="gfDur" type="number" min="1" max="60" value="7"></label><label>開始日時（日本時間・空欄なら今すぐ）<input id="gfAt" type="datetime-local"></label><button class="btn pri" data-a="gfSend">全プレイヤーに配布する</button></div>`;
    f += `<div class="h3">配布中・配布済みのプレゼント</div>${Object.entries(GIFTS.srv).reverse().map(([id, g]) => `<div class="dev-row"><b>${esc(g.title || '')}</b><small>${g.end > t && g.active !== false ? '<span class="ok">配布中</span>' : '終了'} ・ ${new Date(g.start).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}〜${new Date(g.end).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</small><span>${giftItemsNorm(g.items).map(rwLabel).join('・')}</span>${g.end > t && g.active !== false ? `<button class="btn" data-a="gfStop" data-v="${id}">終了する</button>` : ''}</div>`).join('') || '<div class="note">まだありません。</div>'}<div class="note">12/25〜12/31 のクリスマスプレゼント（プレゼントボックス×1）はサーバーなしで自動配布されます。ここからは、いつでも好きなアイテム・お金・ダイヤを全プレイヤーに配れます（受け取りは1人1回）。</div>`;
    return h + f; }; }
Object.assign(UI, {
  gfRead() { this.gfRows = this.gfRows.map(([k], i) => { const a = ($('gfA' + i) || {}).value, n = ($('gfN' + i) || {}).value; return ['money', 'dia', 'ticket'].includes(k) ? [k, +a || 0] : k === 'box' || k === 'item' ? [k, (a || '').trim()] : [k, a, +n || 1]; }); },
  in_gfK(v, el) { this.gfRead(); const i = +el.dataset.i; this.gfRows[i] = [v, v === 'pack' || v === 'box' ? 'giftbox' : v === 'cards' ? Object.keys(CAR_CARDS)[0] : v === 'money' ? 1000000 : v === 'dia' ? 100 : v === 'item' ? '' : 1, 1]; this.render(); },
  a_gfAdd() { this.gfRead(); this.gfRows.push(['money', 1000000]); this.render(); },
  a_gfDel(i) { this.gfRead(); this.gfRows.splice(+i, 1); if (!this.gfRows.length) this.gfRows.push(['money', 1000000]); this.render(); },
  a_gfPreset(v) { this.gfRows = v === 'xmas' ? [['pack', 'giftbox', 1]] : [['money', 3000000], ['dia', 200]]; this.render(); },
  a_gfSend() { this.gfRead(); const items = giftItemsNorm(this.gfRows), bad = items.filter(r => !giftValid(r)); if (!items.length) return this.toast('配布するものを追加してください'); if (bad.length) return this.toast('存在しないID：' + bad.map(r => r[1]).join(', '));
    const title = $('gfT').value.trim() || 'プレゼント', msg = $('gfM').value.trim(), from = $('gfF').value.trim(), dur = Math.max(1, Math.min(60, +$('gfDur').value || 7)), st = this._dt('gfAt') || SRV.now();
    const g = { title, msg, from, items: items.map(r => ({ k: r[0], a: r[1], n: r[2] || 1 })), start: st, end: st + dur * 86400000, active: true, by: DL_FB.user.uid };
    this._adm(async () => { await ADM.write('admin/gifts', g, 'push'); await ADM.log('gift', title + '：' + items.map(rwLabel).join('・')); }, 'プレゼントを配布しました'); },
  a_gfStop(id) { this._adm(async () => { await ADM.write('admin/gifts/' + id + '/active', false); await ADM.log('gift-stop', id); }, '配布を終了しました'); }
});

// ---------------- クリスマス限定ショップ ----------------
const XSHOP_END = JST('2026-12-26T23:59:59'); const xshopOpen = () => SRV.now() <= XSHOP_END;
const XSHOP = [{ id: 'xs1', n: 1, cur: 'yen', price: 1500000, name: 'プレゼントボックス ×1' }, { id: 'xs5', n: 5, cur: 'yen', price: 6800000, old: 7500000, name: 'プレゼントボックス ×5' }, { id: 'xs10', n: 10, cur: 'dia', price: 1200, name: 'プレゼントボックス ×10', tag: 'エピック以上1つ確定' },
  { id: 'xsbag', n: 10, cur: 'dia', price: 2400, name: 'サンタの大袋', extra: [['cards', 'xc_frost', 10], ['pack', 'xmaspack', 3]], lim: 1, tag: '期間中1回' }];
Object.assign(UI, {
  xshopHTML() { const d = SAVE.data; d.xshop = d.xshop || {}; const left = fmtDH(Math.max(0, XSHOP_END - SRV.now()));
    let h = `<div class="xs"><div class="xs-head"><div class="xs-snow">${Array.from({ length: 24 }, (_, k) => `<i style="--k:${k}"></i>`).join('')}</div><div><small>CHRISTMAS LIMITED SHOP</small><b>クリスマス限定ショップ</b><span>⏱ 終了まで ${left}</span></div><div class="xs-hgift">${giftBoxHTML(0.62)}</div></div><div class="xs-grid">`;
    h += XSHOP.map((s, i) => { const out = s.lim && (d.xshop[s.id] || 0) >= s.lim; return `<div class="xs-card ${out ? 'out' : ''}" style="animation-delay:${i * 0.06}s">${s.tag ? `<span class="xs-tag">${s.tag}</span>` : ''}<div class="xs-art">${Array.from({ length: Math.min(3, s.n > 1 ? 3 : 1) }, (_, k) => `<span style="--k:${k}">${giftBoxHTML(s.n > 1 ? 0.42 : 0.52)}</span>`).join('')}${s.n > 1 ? `<em>×${s.n}</em>` : ''}</div><b>${esc(s.name)}</b><small>${s.extra ? s.extra.map(rwLabel).join(' ＋ ') + ' ＋ プレゼントボックス×' + s.n : '中身はランダム（お金・ダイヤ・限定車カード・パーツ・ペイントなど）'}</small>${s.old ? `<s>${yen(s.old)}</s>` : ''}<button class="xs-buy" data-a="xsBuy" data-v="${s.id}" ${out ? 'disabled' : ''}>${out ? '購入済み' : s.cur === 'dia' ? SICO.gem(18) + ' ' + s.price.toLocaleString() : yen(s.price)}</button></div>`; }).join('');
    h += `</div><div class="xs-odds"><b>プレゼントボックスの出現率</b>${Object.entries(CHESTS.find(c => c.id === 'giftbox').odds).filter(([, v]) => v).map(([r, v]) => `<span style="color:${RARITY[r].color}">${RARITY[r].name} ${v}%</span>`).join('')}</div></div>`; return h; },
  a_xsBuy(id) { const s = XSHOP.find(x => x.id === id), d = SAVE.data; if (!s || !xshopOpen() || this._stBusy) return; d.xshop = d.xshop || {}; if (s.lim && (d.xshop[id] || 0) >= s.lim) return;
    if (s.cur === 'dia') { if ((d.diamonds || 0) < s.price) return this.toast('ダイヤが足りません'); } else if (d.money < s.price) return this.toast('お金が足りません');
    this.modal(`<h2>${esc(s.name)}</h2><div class="gf-art sm">${giftBoxHTML(0.7)}</div><div class="note">${s.cur === 'dia' ? s.price.toLocaleString() + ' ダイヤ' : yen(s.price)} で購入しますか？</div><div class="btns"><button class="btn" data-a="closeModal">やめる</button><button class="btn" data-a="xsGo" data-v="${id}:save">買って未開封に保存</button><button class="btn pri" data-a="xsGo" data-v="${id}:open">買ってすぐ開ける</button></div>`); },
  a_xsGo(v) { const [id, how] = v.split(':'), s = XSHOP.find(x => x.id === id), d = SAVE.data; this.closeModal(); if (!s || this._stBusy) return; if (s.lim && (d.xshop[id] || 0) >= s.lim) return;
    if (s.cur === 'dia') { if ((d.diamonds || 0) < s.price) return; d.diamonds -= s.price; } else if (!SAVE.spend(s.price)) return; d.xshop[id] = (d.xshop[id] || 0) + 1;
    for (const r of s.extra || []) { if (r[0] === 'pack') { const u = unopened(); u.packs[r[1]] = (u.packs[r[1]] || 0) + r[2]; } else grantRw(r); }
    SAVE.save(); AUDIO.buy && AUDIO.buy(); this.refreshTop();
    if (how === 'save') { const u = unopened(); u.packs.giftbox = (u.packs.giftbox || 0) + s.n; SAVE.save(); this.toast(`プレゼントボックス ×${s.n} を未開封に保存しました`); return this.render(); }
    this.openPacksFree('giftbox', s.n, s.n >= 10); }
});
{ const _rs = UI.r_store; UI.r_store = function () { let h = _rs.apply(this, arguments); if (xshopOpen()) h = h.replace(/(<div class="st-tabs top">)/, `$1<button class="${this.stTab === 'xmas' ? 'on' : ''} st-xmas" data-a="stTab" data-v="xmas">🎄 クリスマス</button>`); if (this.stTab === 'xmas') h = h.replace('<div class="st-row">', '<div class="st-row xsrow">' + (xshopOpen() ? this.xshopHTML() : '<div class="note">クリスマス限定ショップは終了しました。</div>')); return h; }; }

// ---------------- クリスマスイブイベント ----------------
addItem({ id: 'ev_eve_tt', type: 'title', name: '称号「聖夜の走り屋」', en: 'Title "Holy Night Racer"', rarity: 'E', title: '聖夜の走り屋', titleEn: 'Holy Night Racer', lim: 1, desc: 'クリスマスイブ限定の称号' });
addItem({ id: 'ev_eve_dc', type: 'decal', name: '「HOLY NIGHT」ステッカー', rarity: 'R', kind: 'text', text: 'HOLY NIGHT', bg: '#0a1430', fg: '#ffd23a', font: 'Arial', lim: 1 });
addItem({ id: 'ev_eve_pl', type: 'plate', name: '光るナンバー「キャンドル」', rarity: 'E', rgb: [1, 0.75, 0.3], lim: 1 });
addItem({ id: 'ev_eve_pt', type: 'paint', name: 'スノーパール', en: 'Snow Pearl', rarity: 'E', color: '#f4fbff', paint: 'pearl', lim: 1 });
for (const it of ITEMS) ITEM_BY_ID[it.id] = it;
EVENTS.push({ id: 'xmaseve2026', title: 'CHRISTMAS EVE 2026', jp: '聖夜のナイトドライブ', start: JST('2026-12-24T00:00:00'), end: JST('2026-12-24T23:59:59'), art: 'eve', music: 'xmasRace',
  desc: 'クリスマスイブ限定の1日だけのイベント。雪の聖夜峠でサンタのライバルとバトルして、イルミネーションの街をドライブしよう。全ミッション達成でプレゼントボックスがもらえる！', cond: 'だれでも参加できます（12/24 の0:00〜23:59・日本時間）',
  rewardItems: ['ev_eve_tt', 'ev_eve_dc', 'ev_eve_pl', 'ev_eve_pt'],
  missions: [{ id: 'r3', name: 'イブに3レース完走', key: 'races', goal: 3, rw: { money: 800000, item: 'ev_eve_dc' } }, { id: 'dist', name: '合計 24km 走行', key: 'dist', goal: 24000, unit: v => (v / 1000).toFixed(1) + ' km', rw: { item: 'ev_eve_pl' } }, { id: 'drift', name: 'ドリフトスコア合計 50,000点', key: 'drift', goal: 50000, rw: { item: 'ev_eve_pt', dia: 40 } }, { id: 'win', name: 'サンタとのバトルで勝利', key: 'evWins', goal: 1, rw: { item: 'ev_eve_tt', dia: 60 } }, { id: 'all', name: 'ほかのミッションをすべて達成', key: 'allDone', goal: 1, rw: { gift: 3, xp: 1200 } }],
  races: [{ k: 'race', title: '聖夜のサンタバトル', sub: '雪の聖夜峠でサンタのライバルと1周バトル', map: 'x_pass', rival: { name: 'サンタ・ドリフター', team: 'NORTH POLE RACING', car: 'xc_frost', color: '#c8102e', skill: 0.9 }, prize: 2400000 }, { k: 'free', title: 'イルミネーション・ドライブ', sub: 'イルミネーションの街を自由に走る', map: 'x_city' }] });
{ const _ec = UI.a_evClaim; UI.a_evClaim = function (v) { const [id, mid] = v.split(':'), e = EVENTS.find(x => x.id === id), m = e && e.missions.find(x => x.id === mid), D = e && evData(id), had = D && D.claimed[mid];
    if (m && m.rw && m.rw.gift && !had && evMissionProg(e, m) >= m.goal && evState(e) === 'live') { const u = unopened(); u.packs.giftbox = (u.packs.giftbox || 0) + m.rw.gift; } const r = _ec.call(this, v);
    if (m && m.rw && m.rw.gift && !had && D.claimed[mid]) this.toast(`プレゼントボックス ×${m.rw.gift}（ストア → 未開封）`); return r; }; }
{ const _ea = evArt; evArt = function (kind, w = 640, h = 200) { if (kind !== 'eve') return _ea(kind, w, h);
    return `<svg viewBox="0 0 640 200" width="100%" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="evg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050a24"/><stop offset="1" stop-color="#1a2a5a"/></linearGradient></defs><rect width="640" height="200" fill="url(#evg)"/>${Array.from({ length: 60 }, (_, k) => `<circle cx="${(k * 97) % 640}" cy="${(k * 53) % 200}" r="${1 + k % 3}" fill="#fff" opacity="${0.3 + (k % 5) / 8}"/>`).join('')}<circle cx="540" cy="50" r="26" fill="#fff8d0"/><path d="M0 170 Q120 140 240 160 T480 150 T640 160 V200 H0z" fill="#e8f2ff"/>${[60, 120, 470, 590].map((x, k) => `<g transform="translate(${x} ${150 - k % 2 * 6})"><path d="M0 -60 L22 0 H-22z" fill="#0f5a34"/><path d="M0 -42 L18 4 H-18z" fill="#137a44"/>${[0, 1, 2, 3, 4].map(j => `<circle cx="${-12 + j * 6}" cy="${-20 + (j % 2) * 12}" r="2.5" fill="${['#ff3a3a', '#ffd23a', '#3a8cff'][j % 3]}"/>`).join('')}<path d="M0 -66 l3 6 h6 l-5 4 l2 6 l-6 -4 l-6 4 l2 -6 l-5 -4 h6z" fill="#ffd23a"/></g>`).join('')}<text x="200" y="86" font-family="Orbitron,sans-serif" font-size="36" font-weight="900" fill="#ffd23a">CHRISTMAS EVE</text><text x="202" y="114" font-size="16" font-weight="900" fill="#fff">聖夜のナイトドライブ ・ 12/24 限定</text></svg>`; }; }

// ---------------- 3D 演出（カード・パック） ----------------
{ const _open = PACKFX.open; PACKFX.open = function (c, res) { _open.call(this, c, res); const o = this.o; o.classList.add('p3d'); o.onpointermove = e => { const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5; o.style.setProperty('--tx', (x * 26).toFixed(1) + 'deg'); o.style.setProperty('--ty', (-y * 20).toFixed(1) + 'deg'); }; }; }
{ const _deal = PACKFX.deal; PACKFX.deal = function () { _deal.call(this); this.o.querySelectorAll('.cardx .cx-in').forEach(el => { if (!el.querySelector('.cx-edge')) el.insertAdjacentHTML('beforeend', '<div class="cx-edge"></div><div class="cx-glare"></div>'); }); }; }

// ---------------- パーツをガレージに統合 ----------------
{ const _g = UI.r_garage; UI.r_garage = function (a) { const seg = `<div class="seg g-seg"><button class="${this.gTab !== 'parts' ? 'on' : ''}" data-a="gTab" data-v="cars">${ICO('carSide', 'currentColor', 15)} マイカー<small>車の選択・売却</small></button><button class="${this.gTab === 'parts' ? 'on' : ''}" data-a="gTab" data-v="parts">${ICO('gear', 'currentColor', 15)} パーツを買う<small>ホイール・タイヤ・キットなど</small></button></div>`;
    if (this.gTab === 'parts') { const h = this.r_pshop(); $('panelTitle').textContent = 'GARAGE ・ PARTS'; return seg + h; } return seg + _g.call(this, a); };
  UI.a_gTab = function (v) { this.gTab = v; if (v === 'parts') this.tab = 'wheel'; $('panelBody').scrollTop = 0; AUDIO.nav && AUDIO.nav(); this.render(); };
  const _op = UI.open; UI.open = function (name, arg, push) { if (name === 'pshop') { const r = _op.call(this, 'garage', Object.assign({ keepTab: 1 }, arg || {}), push); this.gTab = 'parts'; this.tab = 'wheel'; this.render(); return r; } if (name === 'garage' && !(arg && arg.keepTab)) this.gTab = 'cars'; return _op.call(this, name, arg, push); };
  UI.a_goPshop = function () { this.open('pshop'); this.tab = 'extra'; this.render(); }; }

// ---------------- バックパックUI刷新 ----------------
{ const _b = UI.r_bag; const TABS = [['items', 'インベントリ', 'collection'], ['cons', '消費アイテム', 'nitro'], ['extra', 'エキストラ', 'gear'], ['medal', 'メダル', 'trophy'], ['log', '開封履歴', 'gift'], ['wallet', '所持品', 'gem']];
  UI.r_bag = function () { let h = _b.call(this); const d = SAVE.data; h = h.replace(/^<div class="tabs">[\s\S]*?<\/div>/, ''); $('panelTitle').textContent = 'BACKPACK'; $('panelBody').classList.add('wide');
    const own = ITEMS.filter(i => invHas(i.id)).length, total = ITEMS.filter(i => !i.lim).length, u = unopened(), unop = Object.values(u.packs).reduce((a, b) => a + b, 0) + Object.values(u.boxes).reduce((a, b) => a + b, 0);
    const hero = `<div class="bp-hero"><div class="bp-bag"><svg viewBox="0 0 64 64" width="58" height="58"><path d="M18 22c0-8 6-14 14-14s14 6 14 14" fill="none" stroke="#ffcf3d" stroke-width="4"/><rect x="10" y="20" width="44" height="38" rx="9" fill="#ff8a2a"/><rect x="10" y="20" width="44" height="14" rx="7" fill="#ffb04a"/><rect x="24" y="38" width="16" height="10" rx="3" fill="#7a3a00"/><circle cx="32" cy="43" r="2" fill="#ffcf3d"/></svg></div><div class="bp-tx"><small>BACKPACK</small><b>${esc((d.prof && d.prof.name) || 'あなた')} のバックパック</b><span class="bp-bar"><i style="width:${own / total * 100}%"></i></span><em>アイテム ${own} / ${total} 種類</em></div><div class="bp-stats"><div><span>${SICO.yen(18)}</span><b>${DEV.inf() ? '∞' : yen(d.money)}</b></div><div><span>${SICO.gem(18)}</span><b>${(d.diamonds || 0).toLocaleString()}</b></div><div><span>${ICO('carSide', '#9ad0ff', 16)}</span><b>${d.cars.length} 台</b></div><div class="bp-unop" data-a="bpUnop"><span>${ICO('gift', '#ffcf3d', 16)}</span><b>未開封 ${unop}</b></div></div></div>`;
    const tabs = `<div class="bp-tabs">${TABS.map(([k, l, ic], i) => `<button class="${this.tab === k ? 'on' : ''}" data-a="setTab" data-v="${k}" style="animation-delay:${i * 0.04}s">${ICO(ic, 'currentColor', 18)}<span>${l}</span></button>`).join('')}</div>`;
    return `<div class="bp">${hero}${tabs}<div class="bp-body" key="${this.tab}">${h}</div></div>`; };
  UI.a_bpUnop = function () { this.stTab = 'inv'; this.open('store'); }; }
window.__DLX = Object.assign(window.__DLX || {}, { giftList, giftsPending, GIFTS, XMAS_GIFT, XSHOP, packPool });
