// =====================================================================
// final.js — v3.0 最終統合
//  ・車カード（カードパック限定車：カードを集めて交換） + 新車 HOKUTO GRANDBOX
//  ・リザルト画面の仕上げ（FINISHED表示・順位/自己ベスト・RETRY/MAIN MENU/CONTINUE・二重受取防止）
//  ・画面下部ナビゲーション / メニューBGM（MP3を後から追加できる）/ スマホ標準レイアウトC
//  ・開発者コントロールパネル（告知・メンテナンス・予約メンテ・アップデート情報）※権限は Firebase ルールで検証
// 既存のセーブデータは消さない・上書きしない（足りない項目だけ追加する）
// =====================================================================

// ---------------- 新車：HOKUTO GRANDBOX（オリジナルのワンボックス） ----------------
addCar(['hk_van', 'HOKUTO', 'GRANDBOX TURBO', '2026 ワンボックス・ディーゼルターボ（カードパック限定）', 'FR', 330, 520, 1950, 205, 6, 5200, 1, 62, 74, 64, 0, 'van', 4.70, 1.88, 1.98, '#f4f4f2', 0, 'diesel', 2.57, 0.52, { chest: 1, cards: 1 }]);
Object.assign(CAR_BY_ID.hk_van, { isNew: '3.0' });

// ---------------- 車カード ----------------
const CAR_CARDS = { hk_van: { need: 30 } };
for (const [car, n, r] of [['hk_van', 1, 'R'], ['hk_van', 3, 'E'], ['hk_van', 10, 'L']]) {
  const c = CAR_BY_ID[car]; const it = addItem({ id: `cc_${car}_${n}`, type: 'carcard', car, cards: n, rarity: r, name: `${c.name} カード ×${n}`, en: `${c.name} card x${n}` }); ITEM_BY_ID[it.id] = it;
}
function carCards(car) { const d = SAVE.data; return (d.carCards && d.carCards[car]) || 0; }
{ // カードは重複OK（換金しない）。所持判定は常に「未所持」扱いで、枚数を加算する
  const _has = invHas; invHas = function (id) { const it = ITEM_BY_ID[id]; if (it && it.type === 'carcard') return false; return _has(id); };
  const _grant = grantChestItem; grantChestItem = function (it) { if (it && it.type === 'carcard') { const d = SAVE.data; d.carCards = d.carCards || {}; d.carCards[it.car] = (d.carCards[it.car] || 0) + it.cards; return { isNew: true, refund: 0 }; } return _grant(it); };
  const _ds = dailyShop; dailyShop = function (key) { return _ds(key).filter(i => i.type !== 'carcard'); };
  const _icon = itemIconSvg; itemIconSvg = function (it, size = 34) {
    if (it && it.type === 'carcard') { const col = RARITY[it.rarity].color; return `<svg width="${size}" height="${size}" viewBox="0 0 40 40"><rect x="7" y="3" width="26" height="34" rx="3" fill="#15171e" stroke="${col}" stroke-width="2.5"/><path d="M11 24h18l-2-5h-4l-2-3h-6l-2 3h-2z" fill="${col}"/><circle cx="15" cy="25" r="2.2" fill="#fff"/><circle cx="25" cy="25" r="2.2" fill="#fff"/><text x="20" y="34" font-size="7" font-weight="900" text-anchor="middle" fill="#fff">×${it.cards}</text></svg>`; }
    return _icon(it, size); };
}
function carCardsHTML() {
  return Object.entries(CAR_CARDS).map(([id, cc]) => { const c = CAR_BY_ID[id], n = carCards(id), own = SAVE.data.cars.some(x => x.id === id), pct = Math.min(100, n / cc.need * 100);
    return `<div class="cc-row"><div class="cc-card">${itemIconSvg({ type: 'carcard', rarity: 'L', cards: n }, 46)}</div><div class="cc-info"><b>${c.name}</b><small>${c.maker} ・ カードパック限定車。カードを ${cc.need} 枚集めると車と交換できます</small><div class="cc-bar"><i style="width:${pct}%"></i><span>${n} / ${cc.need}</span></div></div>
      <div class="cc-act">${own ? '<span class="tag cur">所有中</span>' : ''}<button class="btn ${n >= cc.need ? 'pri' : ''}" data-a="ccTrade" data-v="${id}" ${n >= cc.need ? '' : 'disabled'}>交換</button><button class="btn" data-a="ccPrev" data-v="${id}">見る</button></div></div>`; }).join('');
}
Object.assign(UI, {
  a_ccPrev(id) { const c = CAR_BY_ID[id]; this.show.setCar({ id, tune: defaultTune(c), look: defaultLook(c) }); },
  a_ccTrade(id) { const cc = CAR_CARDS[id], d = SAVE.data; if (!cc || carCards(id) < cc.need || this._ccBusy) return; this._ccBusy = true;
    try { d.carCards[id] -= cc.need; const c = SAVE.newCar(id); c.paid = 0; d.cars.push(c); SAVE.save(); AUDIO.buy && AUDIO.buy(); this.toast(CAR_BY_ID[id].name + ' と交換しました！ガレージに追加されました'); } finally { this._ccBusy = false; } this.render(); }
});
{ const _rc = rollChest; rollChest = function (chest, rnd = Math.random) { const it = _rc(chest, rnd); if (it && it.type !== 'carcard' && chest.price > 0 && rnd() < 0.12) { const cc = ITEMS.find(i => i.type === 'carcard' && i.rarity === it.rarity); if (cc) return cc; } return it; }; }
{ const _pc = UI.packChestHTML; UI.packChestHTML = function () { return `<div class="h3">車カード</div>${carCardsHTML()}` + _pc.call(this); }; }

// ---------------- リザルト画面の仕上げ ----------------
{
  const _show = UI.showResults, _launch = UI.launch;
  UI._runId = 0;
  UI.launch = function (cfg) { this._runId++; this._resRun = -1; return _launch.call(this, cfg); };
  UI.showResults = function (res) {
    if (this._resRun === this._runId) return; this._resRun = this._runId; // 1レースにつき1回だけ（報酬の二重受取防止）
    const g = this.game, d = SAVE.data, prevTa = d.records.ta[res.mapId] ? d.records.ta[res.mapId].best : null, prevDrift = d.records.touge[res.mapId] ? d.records.touge[res.mapId].best : 0;
    const money0 = d.money, xp0 = d.xp;
    _show.call(this, res);
    const box = document.querySelector('#overlay .modal'); if (!box) return; box.classList.add('res-modal'); $('overlay').classList.add('res-dim');
    const fin = res.reason === 'goal' || res.reason === 'lose' || res.mode === 'touge';
    const head = res.mode === 'time' ? 'TIME ATTACK FINISHED' : res.mode === 'touge' ? 'DRIFT CHALLENGE' : res.mode === 'drag' ? 'DRAG RACE FINISHED' : 'RACE FINISHED';
    const h2 = box.querySelector('h2'); if (h2) h2.insertAdjacentHTML('beforebegin', `<div class="res-head">${head}</div>`);
    // 追加情報
    const drift = res.mode === 'touge' ? res.score || 0 : (g.drift ? g.drift.score || 0 : 0), dist = g.totalDist || 0, combo = g.drift ? g.drift.maxCombo || 0 : 0;
    let extra = '';
    if (res.mode === 'time') { const best = res.laps && res.laps.length ? Math.min(...res.laps.map(l => l.t)) : null; const diff = best != null && prevTa ? best - prevTa : null;
      extra += `<div>自己ベスト（前回まで）</div><div>${prevTa ? fmtTime(prevTa) : '--'}</div><div>自己ベストとの差</div><div class="${diff != null && diff < 0 ? 'res-up' : 'res-dn'}">${diff == null ? '初記録' : (diff < 0 ? '-' : '+') + Math.abs(diff).toFixed(3) + 's'}</div>`; }
    else if (res.mode === 'story' || res.mode === 'event' || res.mode === 'drag') extra += `<div>順位</div><div>${res.win ? '1' : '2'} / ${1 + (g.rivals ? g.rivals.length : 1)}</div>`;
    if (res.mode !== 'touge') extra += `<div>ドリフトスコア</div><div>${Math.round(drift).toLocaleString()} pts</div>`;
    extra += `<div>走行距離</div><div>${(dist / 1000).toFixed(2)} km</div><div>最大コンボ</div><div>${combo ? 'x' + combo : '-'}${res.mode !== 'touge' && drift > 0 ? ` <small style="color:#9ad">（ボーナス +${Math.round(drift / 50)} XP）</small>` : ''}</div>`;
    const grid = box.querySelector('.res-grid'); if (grid) grid.insertAdjacentHTML('beforeend', extra);
    const pbTa = res.mode === 'time' && res.laps && res.laps.length && (!prevTa || Math.min(...res.laps.map(l => l.t)) < prevTa), pbDr = res.mode === 'touge' && (res.score || 0) > prevDrift;
    if (pbTa || pbDr) { box.querySelector('.res-big') && box.querySelector('.res-big').insertAdjacentHTML('afterend', '<div class="res-pb">NEW PERSONAL BEST!</div>'); setTimeout(() => AUDIO.levelUp && AUDIO.levelUp(), 700); }
    // 獲得額カウントアップ
    const gotM = d.money - money0, gotX = d.xp - xp0; const cells = grid ? [...grid.children] : [];
    for (let k = 0; k < cells.length - 1; k++) { const t = cells[k].textContent; if (t === '獲得賞金') this.countUp(cells[k + 1], gotM, v => yen(v)); if (t === '経験値') this.countUp(cells[k + 1], gotX, v => '+' + Math.round(v) + ' XP'); }
    // ボタン
    const btns = box.querySelector('.btns'); if (btns && res.mode !== 'online') {
      const cont = res.mode === 'story' || (res.mode === 'event' && !res.cfg.evRace) ? '次へ' : 'CONTINUE';
      btns.innerHTML = `<button class="btn" data-a="resRetry">↻ RETRY</button><button class="btn" data-a="resMenu">MAIN MENU</button><button class="btn pri" data-a="resNext">${cont} ▶</button>`;
    }
  };
  Object.assign(UI, {
    countUp(el, to, fmt) { if (!el || !(to > 0)) return; const t0 = performance.now(), dur = 1200; el.textContent = fmt(0); const st = () => { const k = Math.min(1, (performance.now() - t0) / dur), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = fmt(v); if (k < 1) requestAnimationFrame(st); else el.textContent = fmt(to); }; setTimeout(() => requestAnimationFrame(st), 350); },
    a_resRetry() { AUDIO.confirm && AUDIO.confirm(); $('overlay').classList.remove('res-dim'); this.a_restart(); },
    a_resMenu() { AUDIO.cancel && AUDIO.cancel(); $('overlay').classList.remove('res-dim'); const res = this.lastRes; this.closeModal(); this.paused = false; AUDIO.applyVol(); this.game.exit(); if (res && res.mode === 'online') NET.publishLobby({ race: null }); this.goMenu(); }
  });
  const _next = UI.a_resNext; UI.a_resNext = function () { AUDIO.confirm && AUDIO.confirm(); $('overlay').classList.remove('res-dim'); const res = this.lastRes;
    if (res && !res.cfg.quick && !res.cfg.evRace && !res.cfg.evId && !res.cfg.eventTask && ['time', 'touge', 'free'].includes(res.mode)) { this.closeModal(); this.paused = false; AUDIO.applyVol(); this.game.exit(); this.goMenu(); this.open('maps', { mode: res.mode }); return; }
    return _next.call(this); };
}

// ---------------- 画面下部ナビゲーション ----------------
const BNAV = [['home', 'garage', 'HOME', 'ホーム'], ['garage', 'carSide', 'GARAGE', 'ガレージ'], ['race', 'flag', 'RACE', 'レース'], ['shop', 'shop', 'SHOP', 'ショップ'], ['events', 'tree', 'EVENTS', 'イベント'], ['profile', 'trophy', 'PROFILE', 'プロフィール']];
const BNAV_OF = { menu: 'home', garage: 'garage', tuning: 'garage', maps: 'race', carsel: 'race', story: 'race', drag: 'race', online: 'race', shop: 'shop', pshop: 'shop', chest: 'shop', bag: 'shop', diamond: 'shop', events: 'events', evDetail: 'events', xmas: 'events', advent: 'events', profile: 'profile', ach: 'profile' };
{
  const nav = document.createElement('nav'); nav.id = 'bnav';
  nav.innerHTML = BNAV.map(([k, ic, en, jp]) => `<button data-nav="${k}">${ICO(ic, '#fff', 20)}<b>${en}</b></button>`).join('');
  document.body.appendChild(nav);
  nav.addEventListener('click', e => { const b = e.target.closest('[data-nav]'); if (!b) return; AUDIO.nav && AUDIO.nav(); const k = b.dataset.nav;
    if (k === 'home') UI.goMenu(); else if (k === 'race') { UI.goMenu(); UI.open('maps', { mode: 'race' }); } else if (k === 'shop') { UI.goMenu(); UI.open('shop'); } else { UI.goMenu(); UI.open(k); } });
  const upd = () => { const racing = UI.game && UI.game.active, pk = document.getElementById('packFx'), pkOn = pk && pk.classList.contains('show'), ov = $('overlay'), res = ov && !ov.classList.contains('hidden') && ov.querySelector('.res-modal');
    const vis = !racing && !pkOn && !res && UI.screen && UI.screen !== 'title' && !document.getElementById('maintFx');
    nav.classList.toggle('show', !!vis); document.body.classList.toggle('has-bnav', !!vis);
    const cur = BNAV_OF[UI.screen] || ''; for (const b of nav.children) b.classList.toggle('on', b.dataset.nav === cur); };
  setInterval(upd, 250);
}

// ---------------- メニューBGM：music/ に menu で始まるMP3を置くとメニューで流れる ----------------
{
  const _lp = AUDIO.loadPlaylist.bind(AUDIO);
  AUDIO.loadPlaylist = async function () { await _lp(); for (const t of this.mp3.list) if (/^(menu|main_?menu)/i.test(t.file)) t.cat = 'menu'; };
  const _for = AUDIO.mp3For.bind(AUDIO); AUDIO.mp3For = function (cat) { if (cat === 'menu') return this.mp3.list.filter(t => t.cat === 'menu'); return _for(cat); };
  const _pc = AUDIO.playCat.bind(AUDIO);
  AUDIO.playCat = function (cat, force = false) { if (cat === 'menu') { const m = this.mp3For('menu'); if (m.length) { this.music.cat = 'menu'; if (!force && this.mp3.cur && this.mp3.cur.cat === 'menu' && this.mp3.el && !this.mp3.el.paused) return; return this.playMp3(m[Math.floor(Math.random() * m.length)]); } } return _pc(cat, force); };
}

// ---------------- スマホ操作：レイアウトC（左：ステアリング／右：アクセル・ブレーキ） ----------------
UI.applyLayoutClass = function () { const L = SAVE.data.settings.layout || 'A'; for (const k of ['A', 'B', 'C']) document.body.classList.toggle('lay' + k, L === k); };
{ const _ac = UI.applyCtrl; UI.applyCtrl = function () { const r = _ac ? _ac.apply(this, arguments) : undefined; this.applyLayoutClass(); return r; }; }

// ---------------- 開発者コントロールパネル / 告知 / メンテナンス ----------------
// 権限：Firebase の admin/* への書き込みはルールで開発者UIDのみ許可（firebase-rules.json）。画面の表示制御は補助。
const ADM = {
  ann: {}, maint: null, reset: null, update: null, connected: false, online: null, started: false,
  seen() { try { return JSON.parse(localStorage.getItem('dl_seenAnn') || '[]'); } catch (e) { return []; } },
  markSeen(id) { try { const s = this.seen(); if (!s.includes(id)) { s.push(id); localStorage.setItem('dl_seenAnn', JSON.stringify(s.slice(-80))); } } catch (e) { } },
  now() { return SRV.now(); },
  async start() {
    if (this.started || !window.DL_FB) return; this.started = true;
    try { await DL_FB.ready(); const db = DL_FB.db();
      db.ref('.info/connected').on('value', s => { this.connected = !!s.val(); });
      db.ref('admin/announce').limitToLast(20).on('value', s => { this.ann = s.val() || {}; this.check(); }, () => { });
      db.ref('admin/maint').on('value', s => { this.maint = s.val(); this.check(); }, () => { });
      db.ref('admin/reset').on('value', s => { this.reset = s.val(); this.check(); }, () => { });
      db.ref('admin/update').on('value', s => { this.update = s.val(); this.check(); }, () => { });
      db.ref('online').on('value', s => { this.online = s.numChildren(); }, () => { });
    } catch (e) { }
    setInterval(() => this.tick(), 1000);
  },
  // メンテナンス中か（手動ON、または予約メンテの開始時刻を過ぎた）
  maintOn() { const m = this.maint, r = this.reset, t = this.now(); return !!((m && m.on) || (r && r.state === 'scheduled' && r.at <= t)); },
  maintInfo() { const m = this.maint || {}, r = this.reset || {}; return { reason: m.reason || r.reason || 'サーバーのメンテナンス中です', until: m.until || r.until || 0 }; },
  check() {
    const t = this.now(), lang = SAVE.data.settings.lang === 'en' ? 'en' : 'ja';
    for (const [id, a] of Object.entries(this.ann)) { if (!a || a.active === false || (a.end && a.end < t) || (a.start && a.start > t) || this.seen().includes(id)) continue; this.markSeen(id); this.showAnn(a, lang); }
    this.tick();
  },
  showAnn(a, lang) {
    const title = esc((lang === 'en' && a.titleEn) || a.title || ''), msg = esc((lang === 'en' && a.msgEn) || a.msg || '').replace(/\n/g, '<br>'), by = esc(a.dev || 'DEVELOPER');
    const ty = ['normal', 'important', 'emergency', 'update'].includes(a.type) ? a.type : 'normal'; AUDIO.confirm && AUDIO.confirm();
    if (ty === 'normal' || ty === 'emergency') { const el = document.createElement('div'); el.className = 'ann-ban ' + ty; el.innerHTML = `<b>${ty === 'emergency' ? '⚠ EMERGENCY' : 'NOTICE'}</b><div><strong>${title}</strong><span>${msg}</span><small>— ${by}</small></div><button aria-label="close">×</button>`; document.body.appendChild(el); el.querySelector('button').onclick = () => el.remove(); requestAnimationFrame(() => el.classList.add('in')); setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 500); }, Math.max(4, a.dur || (ty === 'emergency' ? 20 : 8)) * 1000); }
    else { const el = document.createElement('div'); el.className = 'ann-pop ' + ty; el.innerHTML = `<div class="ann-card"><div class="ann-tag">${ty === 'update' ? 'UPDATE' : 'IMPORTANT'}</div><h3>${title}</h3>${ty === 'update' && a.at ? `<div class="ann-at">開始予定：${new Date(a.at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}（日本時間）</div>` : ''}<p>${msg}</p><small>— ${by}</small><button class="btn pri">OK</button></div>`; document.body.appendChild(el); el.querySelector('button').onclick = () => el.remove(); requestAnimationFrame(() => el.classList.add('in')); }
  },
  tick() {
    const t = this.now(), dev = DEV.owner;
    // 予約メンテ／アップデートのカウントダウン
    let cd = ''; const r = this.reset, u = this.update;
    if (r && r.state === 'scheduled' && r.at > t) cd = `<b>メンテナンスまで</b> <i>${fmtLeft(r.at - t)}</i>${r.reason ? `<small>${esc(r.reason)}</small>` : ''}`;
    else if (u && u.at && u.at > t) cd = `<b>v${esc(u.version || '')} アップデートまで</b> <i>${fmtLeft(u.at - t)}</i>${u.title ? `<small>${esc(u.title)}</small>` : ''}`;
    let el = document.getElementById('updCd'); if (cd) { if (!el) { el = document.createElement('div'); el.id = 'updCd'; document.body.appendChild(el); } if (el.innerHTML !== cd) el.innerHTML = cd; } else if (el) el.remove();
    // メンテナンス画面（開発者は除外）
    const on = this.maintOn(); let mf = document.getElementById('maintFx');
    if (on && !dev) { if (!mf) { try { SAVE.save(); } catch (e) { } if (UI.game && UI.game.active && UI.game.cfg.mode === 'online') { try { UI.a_quit(); } catch (e) { } } mf = document.createElement('div'); mf.id = 'maintFx'; document.body.appendChild(mf); }
      const I = this.maintInfo(); const h = `<div class="mt-card"><div class="mt-ic">${ICO('wrench', '#ffcf3d', 44)}</div><h2>MAINTENANCE</h2><p>${esc(I.reason)}</p>${I.until ? `<div class="mt-until">再開予定：${new Date(I.until).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}（日本時間）${I.until > t ? `<br>あと ${fmtLeft(I.until - t)}` : ''}</div>` : '<div class="mt-until">再開予定は未定です</div>'}<small>プレイデータは端末に保存済みです。メンテナンスが終わると自動で再開します。</small></div>`; if (mf.dataset.h !== h) { mf.innerHTML = h; mf.dataset.h = h; } }
    else if (mf) { mf.remove(); UI.toast && UI.toast('メンテナンスが終了しました'); }
  },
  async write(path, val, how = 'set') { const db = DL_FB.db(); const r = db.ref(path); const res = how === 'push' ? await r.push(val) : how === 'update' ? await r.update(val) : await r.set(val); return res; },
  async testPerm() { try { await this.write('admin/log', { act: 'perm-test', detail: '', by: DL_FB.user.uid, t: firebase.database.ServerValue.TIMESTAMP }, 'push'); this.perm = true; } catch (e) { this.perm = false; this.permErr = (e && (e.code || '') + ' ' + (e.message || e)) + ' / auth:' + (window.firebase && firebase.auth && firebase.auth().currentUser ? firebase.auth().currentUser.uid.slice(0, 6) + (firebase.auth().currentUser.isAnonymous ? '(anon)' : '') : 'none'); } return this.perm; },
  async log(act, detail) { try { await this.write('admin/log', { act, detail: detail || '', by: DL_FB.user.uid, t: firebase.database.ServerValue.TIMESTAMP }, 'push'); } catch (e) { } }
};
function fmtLeft(ms) { ms = Math.max(0, ms); const s = Math.floor(ms / 1000), dd = Math.floor(s / 86400), hh = Math.floor(s / 3600) % 24, mm = Math.floor(s / 60) % 60, ss = s % 60; return (dd ? dd + '日 ' : '') + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0'); }
setTimeout(() => ADM.start(), 1500);

Object.assign(UI, {
  r_devPanel() {
    $('panelTitle').textContent = 'DEVELOPER CONTROL PANEL';
    if (!DEV.owner) return `<div class="note">開発者アカウントでログインしたときだけ使えます。</div>`;
    if (!window.DL_FB) return `<div class="note">この版（単体HTML）にはサーバーがないため、管理機能は GitHub Pages 版（Firebase）でのみ使えます。</div>`;
    if (!this.tab) this.tab = 'ann'; const T = [['ann', 'LIVE ANNOUNCEMENT'], ['srv', 'SERVER'], ['maint', 'MAINTENANCE'], ['reset', 'SERVER RESET'], ['upd', 'UPDATE INFO'], ['hist', 'HISTORY']];
    let h = `<div class="tabs dev-tabs">${T.map(([k, l]) => `<button class="tab ${this.tab === k ? 'on' : ''}" data-a="setTab" data-v="${k}">${l}</button>`).join('')}</div><div class="note">書き込みは Firebase のルールで開発者UIDだけに許可されています（画面を改ざんしても一般プレイヤーは実行できません）。</div><div class="dev-row"><small>あなたのUID</small><b class="noi18n" style="font-size:12px">${esc((DL_FB.user && DL_FB.user.uid) || '未ログイン')}</b><small>サーバー権限：${ADM.perm === true ? '<span style="color:#2fdc7a">OK</span>' : ADM.perm === false ? '<span style="color:#ff6060">なし</span><br><span class="noi18n" style="color:#ffb0b0;font-size:11px">' + esc(String(ADM.permErr || '')) + '</span>' : '未確認'}</small><button class="btn" data-a="admPerm">権限をテスト</button></div>${ADM.perm === false ? `<div class="note" style="color:#ffb0b0">サーバーが書き込みを拒否しました。Firebase コンソールの Realtime Database →「ルール」に最新の firebase-rules.json を貼り付けて「公開」したか確認してください。上のUIDがルール内の開発者UID（Zde9C8…）と違う場合は、ルールの UID をこのUIDに書き換えるか、データの admins/このUID に true を入れてください。</div>` : ''}`;
    const t = ADM.now(), fv = id => `id="${id}"`;
    if (this.tab === 'ann') h += `<div class="dev-form"><label>Announcement Title<input ${fv('anT')} maxlength="80"></label><label>Title (English・任意)<input ${fv('anTe')} maxlength="80"></label><label>Message<textarea ${fv('anM')} maxlength="600" rows="3"></textarea></label><label>Message (English・任意)<textarea ${fv('anMe')} maxlength="600" rows="2"></textarea></label>
      <label>Developer Name<input ${fv('anD')} maxlength="30" value="DriftLegends Dev"></label><label>Announcement Type<select ${fv('anTy')}><option value="normal">NORMAL（上部バナー）</option><option value="important">IMPORTANT（中央ポップアップ）</option><option value="emergency">EMERGENCY（緊急バナー）</option><option value="update">UPDATE（アップデート告知）</option></select></label>
      <label>Display Duration（配信期間・分）<input ${fv('anDur')} type="number" min="1" max="10080" value="60"></label><label>UPDATE の開始予定（任意）<input ${fv('anAt')} type="datetime-local"></label>
      <button class="btn pri" data-a="admAnn">配信する</button></div><div class="h3">配信中の告知</div>${Object.entries(ADM.ann).reverse().map(([id, a]) => `<div class="dev-row"><b>[${esc((a.type || '').toUpperCase())}] ${esc(a.title || '')}</b><small>${a.end > t && a.active !== false ? '配信中・残り ' + fmtLeft(a.end - t) : '終了'}</small>${a.end > t && a.active !== false ? `<button class="btn" data-a="admAnnStop" data-v="${id}">終了する</button>` : ''}</div>`).join('') || '<div class="note">なし</div>'}`;
    if (this.tab === 'srv') { const na = '取得できません（サーバーレス構成のため）';
      h += `<div class="kv dev-kv"><div>Server Status</div><div>${ADM.connected ? '<span class="ok">Firebase に接続中</span>' : '<span class="ng">未接続</span>'}</div><div>Online Players</div><div>${ADM.online != null ? ADM.online + ' 人（online ノードの件数）' : '取得中…'}</div><div>Current Version</div><div>v${GAME_VERSION}（このクライアント）</div><div>Maintenance Status</div><div>${ADM.maintOn() ? '<span class="ng">メンテナンス中</span>' : '通常運用'}</div><div>Server Uptime</div><div>${na}</div><div>Last Restart</div><div>${na}</div><div>Server Health</div><div id="admPing">${ADM.ping != null ? `応答 ${ADM.ping} ms` : '未計測'}</div></div><button class="btn" data-a="admPing">応答速度を計測</button>
      <div class="note">DriftLegends は GitHub Pages（静的ホスティング）＋ Firebase Realtime Database で動いています。再起動できる自前のゲームサーバーはないため、稼働時間・再起動時刻は存在せず、表示しません。</div>`; }
    if (this.tab === 'maint') { const m = ADM.maint || {};
      h += `<div class="kv dev-kv"><div>現在</div><div>${m.on ? '<span class="ng">ON</span>' : 'OFF'}</div></div><div class="dev-form"><label>メンテナンス理由<input ${fv('mtR')} maxlength="200" value="${esc(m.reason || 'アップデート作業のためメンテナンス中です')}"></label><label>再開予定（日本時間）<input ${fv('mtU')} type="datetime-local"></label>
        <div class="btns"><button class="btn pri" data-a="admMaint" data-v="1">メンテナンス ON</button><button class="btn" data-a="admMaint" data-v="0">メンテナンス OFF（終了告知を配信）</button></div></div><div class="note">ON の間：一般プレイヤーにメンテナンス画面を表示し、オンライン対戦のルーム作成・参加をサーバー側（ルール）で拒否します。開発者はこの画面を使えます。</div>`; }
    if (this.tab === 'reset') { const r = ADM.reset || {};
      h += `<div class="kv dev-kv"><div>予約状況</div><div>${r.state === 'scheduled' ? (r.at > t ? `予約中：あと ${fmtLeft(r.at - t)}` : '<span class="ng">メンテナンス実行中</span>') : 'なし'}</div></div>
        <div class="dev-form"><label>理由<input ${fv('rsR')} maxlength="200" value="アップデートのためのメンテナンス"></label><div class="btns"><button class="btn" data-a="admReset" data-v="0">即時</button><button class="btn" data-a="admReset" data-v="5">5分後</button><button class="btn" data-a="admReset" data-v="10">10分後</button></div>
        <label>予約日時（日本時間）<input ${fv('rsAt')} type="datetime-local"></label><div class="btns"><button class="btn" data-a="admReset" data-v="at">予約する</button><button class="btn" data-a="admResetCancel">キャンセル / 完了</button></div></div>
        <div class="note">実行すると全プレイヤーにカウントダウンを表示し、開始時刻になると各端末がプレイデータを保存してからメンテナンス画面に切り替わり、オンライン対戦は止まります。<br>このホスティング（GitHub Pages＋Firebase）には再起動できるサーバーがないため、「サーバーの再起動」は行いません。作業後に「キャンセル / 完了」を押すと再開し、再開の告知を配信します。プレイヤーのデータやインベントリは一切初期化しません。</div>`; }
    if (this.tab === 'upd') { const u = ADM.update || {};
      h += `<div class="dev-form"><label>Version<input ${fv('upV')} maxlength="12" value="${esc(u.version || '')}"></label><label>Update Title<input ${fv('upT')} maxlength="80" value="${esc(u.title || '')}"></label><label>Update Description<textarea ${fv('upD')} rows="2" maxlength="600">${esc(u.desc || '')}</textarea></label><label>Release Date（日本時間・カウントダウンに使用）<input ${fv('upAt')} type="datetime-local"></label>
        <label>Added Features（1行に1つ）<textarea ${fv('upA')} rows="3" maxlength="1500">${esc((u.added || []).join('\n'))}</textarea></label><label>Bug Fixes（1行に1つ）<textarea ${fv('upF')} rows="3" maxlength="1500">${esc((u.fixes || []).join('\n'))}</textarea></label>
        <div class="btns"><button class="btn pri" data-a="admUpd">保存</button><button class="btn" data-a="admUpdAnn">保存してアップデート告知を配信</button></div></div><div class="note">Release Date が未来なら、全プレイヤーのメニューに「アップデートまで」のカウントダウンが出ます。</div>`; }
    if (this.tab === 'hist') { if (!this._admHist) { this._admHist = 'loading'; DL_FB.db().ref('admin/log').limitToLast(40).get().then(s => { this._admHist = Object.values(s.val() || {}).reverse(); this.render(); }).catch(() => { this._admHist = []; this.render(); }); }
      h += Array.isArray(this._admHist) ? (this._admHist.map(e => `<div class="dev-row"><b>${esc(e.act)}</b><small>${new Date(e.t).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} ・ ${esc(String(e.by).slice(0, 8))}</small><span>${esc(e.detail || '')}</span></div>`).join('') || '<div class="note">履歴なし</div>') : '<div class="note">読み込み中…</div>'; h += `<button class="btn" data-a="admHistReload">再読み込み</button>`; }
    return h;
  },
  _dt(id) { const v = ($(id) || {}).value; if (!v) return 0; return new Date(v + ':00+09:00').getTime(); },
  async _adm(fn, okMsg) { if (!DEV.owner || !window.DL_FB) return; try { if (!DL_FB.user || DL_FB.user.isAnonymous) throw { message: 'Googleでログインしてください' }; await fn(); ADM.perm = true; this.toast(okMsg); } catch (e) { const perm = /permission/i.test((e && (e.code || e.message)) || ''); if (perm) { ADM.perm = false; ADM.permErr = (e.code || '') + ' ' + (e.message || ''); } this.toast('失敗しました：' + (perm ? 'サーバーが拒否しました（ルール未更新か UID 不一致）' : ((e && e.message) || 'エラー'))); } this.render(); },
  a_admPerm() { ADM.testPerm().then(ok => { this.toast(ok ? 'サーバー権限：OK' : 'サーバー権限なし：ルールを確認してください'); this.render(); }); },
  a_admAnn() { const title = $('anT').value.trim(), msg = $('anM').value.trim(); if (!title || !msg) return this.toast('タイトルとメッセージを入力してください');
    const ty = $('anTy').value, dur = Math.max(1, Math.min(10080, +$('anDur').value || 60)); if (!confirm(`「${title}」を全プレイヤーに配信しますか？（${ty.toUpperCase()}）`)) return;
    const t = ADM.now(); this._adm(async () => { await ADM.write('admin/announce', { title, msg, titleEn: $('anTe').value.trim() || null, msgEn: $('anMe').value.trim() || null, dev: $('anD').value.trim() || 'Dev', type: ty, start: t, end: t + dur * 60000, at: this._dt('anAt') || null, active: true, by: DL_FB.user.uid }, 'push'); await ADM.log('announce', `[${ty}] ${title}`); }, '配信しました'); },
  a_admAnnStop(id) { this._adm(async () => { await ADM.write('admin/announce/' + id + '/active', false); await ADM.log('announce-stop', id); }, '告知を終了しました'); },
  a_admPing() { const t0 = performance.now(); DL_FB.db().ref('admin/maint').get().then(() => { ADM.ping = Math.round(performance.now() - t0); this.render(); }).catch(() => { ADM.ping = null; this.toast('計測できませんでした'); }); },
  a_admMaint(v) { const on = v === '1'; if (!confirm(on ? 'メンテナンスモードを ON にしますか？一般プレイヤーは遊べなくなります。' : 'メンテナンスを終了しますか？')) return;
    this._adm(async () => { await ADM.write('admin/maint', { on, reason: $('mtR').value.trim(), until: this._dt('mtU') || null, by: DL_FB.user.uid, at: firebase.database.ServerValue.TIMESTAMP }); await ADM.log(on ? 'maint-on' : 'maint-off', $('mtR').value.trim());
      if (!on) { const t = ADM.now(); await ADM.write('admin/announce', { title: 'メンテナンス終了', msg: 'メンテナンスが終了しました。引き続き DRIFT LEGENDS をお楽しみください！', titleEn: 'Maintenance complete', msgEn: 'Maintenance is over. Enjoy DRIFT LEGENDS!', dev: 'DriftLegends Dev', type: 'normal', start: t, end: t + 30 * 60000, active: true, by: DL_FB.user.uid }, 'push'); } }, on ? 'メンテナンスを開始しました' : 'メンテナンスを終了しました'); },
  a_admReset(v) { const r = ADM.reset; if (r && r.state === 'scheduled') return this.toast('すでに予約されています（先にキャンセルしてください）'); const t = ADM.now(); const at = v === 'at' ? this._dt('rsAt') : t + (+v) * 60000; if (!at || at < t - 1000) return this.toast('日時を正しく入力してください');
    if (!confirm(`サーバーメンテナンスを ${new Date(at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} に実行します。よろしいですか？`)) return; if (!confirm('最終確認：全プレイヤーにカウントダウンと告知を配信します。実行しますか？')) return;
    const reason = $('rsR').value.trim();
    this._adm(async () => { await ADM.write('admin/reset', { state: 'scheduled', at, reason, by: DL_FB.user.uid, created: firebase.database.ServerValue.TIMESTAMP }); await ADM.write('admin/announce', { title: 'メンテナンスのお知らせ', msg: `${new Date(at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}（日本時間）からメンテナンスを行います。${reason}`, titleEn: 'Scheduled maintenance', msgEn: `Maintenance starts at ${new Date(at).toUTCString()}.`, dev: 'DriftLegends Dev', type: 'important', start: t, end: at + 3600000, active: true, by: DL_FB.user.uid }, 'push'); await ADM.log('reset-schedule', new Date(at).toISOString() + ' ' + reason); }, 'メンテナンスを予約しました'); },
  a_admResetCancel() { const r = ADM.reset; if (!r || r.state !== 'scheduled') return this.toast('予約はありません'); const started = r.at <= ADM.now(); if (!confirm(started ? 'メンテナンスを完了して再開しますか？（再開の告知を配信します）' : '予約をキャンセルしますか？')) return;
    this._adm(async () => { await ADM.write('admin/reset', Object.assign({}, r, { state: started ? 'done' : 'cancelled', closed: firebase.database.ServerValue.TIMESTAMP, closedBy: DL_FB.user.uid })); await ADM.log(started ? 'reset-done' : 'reset-cancel', ''); const t = ADM.now();
      await ADM.write('admin/announce', { title: started ? 'サービス再開' : 'メンテナンス中止', msg: started ? 'メンテナンスが完了しました。お待たせしました！' : '予定していたメンテナンスは中止になりました。', titleEn: started ? 'Service resumed' : 'Maintenance cancelled', msgEn: started ? 'Maintenance is complete. Thanks for waiting!' : 'The scheduled maintenance was cancelled.', dev: 'DriftLegends Dev', type: 'normal', start: t, end: t + 30 * 60000, active: true, by: DL_FB.user.uid }, 'push'); }, started ? '再開しました' : 'キャンセルしました'); },
  _updVal() { return { version: $('upV').value.trim(), title: $('upT').value.trim(), desc: $('upD').value.trim(), at: this._dt('upAt') || (ADM.update && ADM.update.at) || null, added: $('upA').value.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 30), fixes: $('upF').value.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 30), by: DL_FB.user.uid }; },
  a_admUpd() { const u = this._updVal(); if (!u.version) return this.toast('Version を入力してください'); this._adm(async () => { await ADM.write('admin/update', u); await ADM.log('update-info', 'v' + u.version); }, '保存しました'); },
  a_admUpdAnn() { const u = this._updVal(); if (!u.version || !confirm(`v${u.version} のアップデート告知を全プレイヤーに配信しますか？`)) return; const t = ADM.now();
    this._adm(async () => { await ADM.write('admin/update', u); await ADM.write('admin/announce', { title: `v${u.version} ${u.title}`, msg: [u.desc].concat(u.added.map(x => '・' + x), u.fixes.length ? ['修正：'].concat(u.fixes.map(x => '・' + x)) : []).filter(Boolean).join('\n').slice(0, 600), dev: 'DriftLegends Dev', type: 'update', at: u.at, start: t, end: Math.max(t + 3600000, (u.at || 0) + 3600000), active: true, by: DL_FB.user.uid }, 'push'); await ADM.log('update-announce', 'v' + u.version); }, '配信しました'); },
  a_admHistReload() { this._admHist = null; this.render(); }
});
// メインメニューの開発者メニューから開けるようにする
{ const _mi = UI.menuItems; UI.menuItems = function () { _mi.call(this); if (DEV.owner) { const el = $('menuList'); if (el && !el.querySelector('[data-m="devPanel"]')) el.insertAdjacentHTML('beforeend', `<button class="mt wide dev" data-m="devPanel"><span class="mt-ic">${ICO('globe', '#ffcf3d', 26)}</span><span class="mt-tx"><b>DEVELOPER CONTROL PANEL</b><small>告知・メンテナンス・アップデート管理</small></span></button>`); } }; }
window.__DLX = Object.assign(window.__DLX || {}, { ADM, CAR_CARDS, carCards, fmtLeft, DEV });
