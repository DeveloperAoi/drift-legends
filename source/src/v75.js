// =====================================================================
// v75.js — v6.1：起動〜スタートメニューの流れ（アーケード風・オリジナルデザイン）
//   1. ローディング（Initializing.）
//   2. タイトル（ゲーム内のレース映像がデモとして流れる・PRESS START）
//   3. データ選択（ゲストで遊ぶ／セーブデータで遊ぶ・カウントダウン）
//   4. 確認（免許証データを表示して「このデータで遊びますか？」）
//   5. 報酬一覧（受け取っていないプレゼントがあれば）
//   6. START MENU（ショップ・ガレージ・モード選択・コンフィグ・プレイデータ・チーム）
//   ※ゲストプレイはデータを一切保存しません（既存のセーブデータには触れない）
// =====================================================================
const FLOW = { on: () => ARC.on() && (!navigator.webdriver || window.__DL_FLOW), done: false };

// ---------------- 1. ローディング ----------------
{ const b = document.createElement('div'); b.id = 'bootFx'; b.innerHTML = `<div class="bt-panel"><div class="bt-wm"><b>DRIFT</b><b>LEGENDS</b></div><div class="bt-msg">Initializing<span class="bt-dots"><i>.</i><i>.</i><i>.</i></span></div></div><div class="bt-foot"><span class="bt-st">●</span> FREE PLAY</div>`; document.body.appendChild(b);
  if (!FLOW.on()) b.remove(); else setTimeout(() => { b.classList.add('out'); setTimeout(() => b.remove(), 600); }, 1700); }

// ---------------- 2. タイトル（デモ走行） ----------------
const ATT = { running: false,
  start() { if (this.running || !FLOW.on() || SAVE.data.settings.attractDemo === false || FLOW.done) return; const T = $('s-title'); if (!T || !T.classList.contains('show')) return;
    try { const maps = MAPS.filter(m => !m.cat || !['event', 'drag', 'free'].includes(m.cat)).filter(m => m.env !== 'lot' && getTrack(m.id)); const m = maps[Math.floor(Math.random() * maps.length)] || MAPS[0];
      const pool = CARS.filter(c => !c.cuCar && !c.unlock && c.body !== 'sleigh' && c.body !== 'semi'), rc = pool[Math.floor(Math.random() * pool.length)] || CARS[0], my = SAVE.cur();
      this.running = true; document.body.classList.add('att-demo'); UI.launch({ mode: 'free', demo: true, _retry: true, mapId: m.id, weather: 'clear', time: m.time || 'night', laps: 99, carInst: my, rivals: [{ name: 'DEMO', team: 'DEMO', car: rc.id, color: rc.color, skill: 0.93 }] });
      $('attMap') && ($('attMap').textContent = m.jp); } catch (e) { this.running = false; document.body.classList.remove('att-demo'); } },
  stop() { if (!this.running) return; this.running = false; document.body.classList.remove('att-demo'); try { UI.game.exit(); } catch (e) { } try { AUDIO.stopAllEngines && AUDIO.stopAllEngines(); } catch (e) { } $('hud') && $('hud').classList.add('hidden'); $('touch') && $('touch').classList.add('hidden'); UI.show.active = true; } };
// デモ中はレース画面にしない（タイトルを表示したまま）
{ const _sh = UI.showHUD; UI.showHUD = function (cfg) { if (cfg && cfg.demo) { $('hud').classList.add('hidden'); $('touch').classList.add('hidden'); return; } return _sh.apply(this, arguments); }; }
// デモのカメラ：ライバル車をいろいろな角度から映す
{ const _uc = Game.prototype.updateCamera; Game.prototype.updateCamera = function (dt) { const r = this.cfg && this.cfg.demo && this.rivals && this.rivals[0]; if (!r) return _uc.apply(this, arguments);
    const c = this.R.cam; this._dmT = (this._dmT || 0) + dt; const shot = Math.floor(this._dmT / 6) % 4, hd = r.hd || 0, fx = Math.sin(hd), fz = Math.cos(hd), sx = Math.cos(hd), sz = -Math.sin(hd), ry = r.y || 0;
    let eye; if (shot === 0) eye = [r.x - fx * 7, ry + 2.2, r.z - fz * 7]; else if (shot === 1) eye = [r.x + sx * 4.2 + fx * 1.5, ry + 0.8, r.z + sz * 4.2 + fz * 1.5]; else if (shot === 2) eye = [r.x + fx * 8 - sx * 3, ry + 1.2, r.z + fz * 8 - sz * 3]; else { const a = hd + this._dmT * 0.5; eye = [r.x + Math.sin(a) * 9, ry + 3.5, r.z + Math.cos(a) * 9]; }
    this._dmEye = this._dmEye ? this._dmEye.map((v, i) => v + (eye[i] - v) * Math.min(1, dt * 4)) : eye; if (shot !== this._dmShot) { this._dmShot = shot; this._dmEye = eye; }
    c.pos = this._dmEye; c.target = [r.x + fx * 1.5, ry + 0.7, r.z + fz * 1.5]; c.fov = shot === 2 ? 42 : 55; c.near = 0.15; c.far = 2400; }; }
// タイトル画面の見た目（PRESS START）
{ const T = document.querySelector('#s-title .title-wrap'); if (T) { T.insertAdjacentHTML('beforeend', `<div class="att-bar"><span class="att-fp"><i>●</i> FREE PLAY</span><span class="att-map" id="attMap"></span><span class="att-ver">Ver.${GAME_VERSION}</span></div>`); } }
const ATT_SKIP = () => { const s = $('btnStart'); if (s) s.textContent = FLOW.on() ? 'PRESS START' : 'TAP TO START'; };
// ---------------- 3〜5. データ選択・確認・報酬一覧 ----------------
const DS = { el: null, step: '', sel: 1, t: 0, timer: null, next: null,
  hadSave: () => SAVE.data && SAVE.data.firstRunShown === true,
  open(next) { this.next = next; if (!this.el) { this.el = document.createElement('div'); this.el.id = 'dsFx'; document.body.appendChild(this.el); this.el.addEventListener('click', e => { const b = e.target.closest('[data-ds]'); if (b) { AUDIO.click && AUDIO.click(); this.act(b.dataset.ds); } }); }
    this.el.classList.add('show'); this.go('select'); },
  close() { clearInterval(this.timer); if (this.el) this.el.classList.remove('show'); },
  count(n, fn) { clearInterval(this.timer); this.t = n; const tick = () => { const e = this.el && this.el.querySelector('.ds-cd b'); if (e) e.textContent = String(Math.max(0, this.t)).padStart(2, '0'); if (this.t <= 0) { clearInterval(this.timer); fn(); } this.t--; }; tick(); this.timer = setInterval(tick, 1000); },
  go(step) { this.step = step; const E = this.el; E.dataset.step = step;
    if (step === 'select') { const has = this.hadSave(); this.sel = 1;
      E.innerHTML = `<div class="ds-bg"></div><div class="ds-cd"><small>TIME</small><b>30</b></div><div class="ds-ttl">PLAYER SELECT</div>
        <div class="ds-two"><button class="ds-opt g ${this.sel === 0 ? 'on' : ''}" data-ds="pick0"><span class="ds-k"><b>ゲストで遊ぶ</b><small>GUEST PLAY</small></span><span class="ds-btn">START</span><em>※データは保存されません（今のセーブデータはそのまま）</em></button>
          <button class="ds-opt d ${this.sel === 1 ? 'on' : ''}" data-ds="pick1"><span class="ds-k"><b>${has ? 'セーブデータで遊ぶ' : '新しくはじめる'}</b><small>${has ? 'DRIVER DATA PLAY' : 'NEW DRIVER DATA'}</small></span><span class="ds-btn">START</span><em>${has ? 'この端末（ログイン中はアカウント）のデータを読み込みます' : 'ドライバーデータを作って、車の改造や記録を保存します'}</em></button></div>
        <div class="ds-hint">◀▶ で選んで決定 ・ 時間になると「${has ? 'セーブデータで遊ぶ' : '新しくはじめる'}」で始まります</div>`;
      this.count(30, () => this.act('ok')); }
    else if (step === 'confirm') { clearInterval(this.timer); const d = SAVE.data, F = window.DL_FB, name = (F && F.profile && F.profile.name) || d.settings.nick || 'プレイヤー', lv = ARC.lv(), [rk, st] = ARC.rank(lv), lic = (typeof licData === 'function' ? licData() : d.license || {}), home = lic.home && MAP_BY_ID[lic.home] ? MAP_BY_ID[lic.home].jp : '未設定', car = CAR_BY_ID[(SAVE.cur() || {}).id];
      const md = [['TIME', Object.keys(d.records.ta || {}).length, '#3aa0ff'], ['STORY', ((d.story || {}).cleared || []).length, '#2fe08a'], ['DRIFT', Object.keys(d.records.touge || {}).length, '#ffb020'], ['EVENT', Object.keys((d.event || {}).done || {}).length, '#ff5ad0'], ['ONLINE', (d.stats || {}).onlineWins || 0, '#22d3ee']];
      let av = ''; try { av = profAvatarHTML(120); } catch (e) { }
      E.innerHTML = `<div class="ds-bg"></div><div class="ds-cd"><small>TIME</small><b>20</b></div><div class="ds-box"><div class="ds-lic"><div class="dl-h"><b>DRIFT LEGENDS　免許証データ</b><i>SEASON ${Math.max(1, Math.ceil(lv / 25))}</i></div>
          <div class="dl-b"><div class="dl-av">${av}</div><div class="dl-r"><div class="dl-nm noi18n">${esc(name)}</div><div class="dl-rk r-${rk}"><b>${rk}</b><i>${st}</i></div><div class="dl-md">${md.map(([k, n, c]) => `<span class="${n ? 'on' : ''}" style="--mc:${c}"><i>${k}</i><b>${n}</b></span>`).join('')}</div></div></div>
          <div class="dl-f"><div><small>ホームコース</small><b>${esc(home)}</b></div><div><small>愛車</small><b>${car ? esc(car.name) : '-'}</b></div><div><small>レベル</small><b>Lv.${lv}</b></div></div></div>
        <div class="ds-q">このデータで遊びますか？</div><div class="ds-yn"><button class="ds-y ${this.sel === 1 ? 'on' : ''}" data-ds="yes">はい</button><button class="ds-n ${this.sel === 0 ? 'on' : ''}" data-ds="no">いいえ</button></div></div>
        <div class="ds-hint">${F && F.user ? 'プレイヤーID：<span class="noi18n">' + esc(F.user.uid.slice(0, 10)) + '…</span>' : 'オフライン（この端末のデータ）'}</div>`;
      this.sel = 1; this.count(20, () => this.act('yes')); }
    else if (step === 'reward') { clearInterval(this.timer); const G = typeof giftsPending === 'function' ? giftsPending() : [], rows = []; for (const g of G) for (const r of giftItemsNorm(g.items).filter(giftValid)) rows.push([g, r]);
      if (!rows.length) return this.finish();
      E.innerHTML = `<div class="ds-bg"></div><div class="ds-cd"><small>TIME</small><b>30</b></div><div class="ds-box rw"><div class="rw-h"><small>R E W A R D　L I S T</small><b>報酬一覧</b><span><b>${rows.length}</b>個受け取ります</span></div>
        <div class="rw-list">${rows.map(([g, r]) => `<div class="rw-it"><span class="rw-ic">${rwArt(r, 46)}</span><div><b>${esc(rwLabel(r))}</b><small>${esc(g.title || 'プレゼント')}</small></div></div>`).join('')}</div>
        <div class="rw-f">パック・BOXは「ストア → 未開封」から開けられます</div><div class="ds-yn"><button class="ds-y on" data-ds="claim">受け取って次へ ▶</button></div></div>`;
      this.count(30, () => this.act('claim')); } },
  act(k) { if (k === 'pick0' || k === 'pick1') { const i = +k.slice(-1); if (this.sel === i) return this.act('ok'); this.sel = i; this.el.querySelectorAll('.ds-opt').forEach((b, j) => b.classList.toggle('on', j === i)); return; }
    if (this.step === 'select' && k === 'ok') { if (this.sel === 0) { GUEST.enter(); return this.finish(); } return this.hadSave() ? this.go('confirm') : this.finish(); }
    if (this.step === 'confirm') { if (k === 'yes' || (k === 'ok' && this.sel === 1)) return this.go('reward'); if (k === 'no' || k === 'ok') return this.go('select'); }
    if (this.step === 'reward' && (k === 'claim' || k === 'ok')) { const ids = (typeof giftsPending === 'function' ? giftsPending() : []).map(g => g.id); for (const id of ids) { try { UI.a_giftClaim(id); } catch (e) { } } return this.finish(); } },
  key(e) { if (!this.el || !this.el.classList.contains('show')) return false; if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { if (this.step === 'select') this.act('pick' + (e.key === 'ArrowLeft' ? 0 : 1)); else if (this.step === 'confirm') { this.sel = e.key === 'ArrowLeft' ? 1 : 0; this.el.querySelector('.ds-y').classList.toggle('on', this.sel === 1); this.el.querySelector('.ds-n').classList.toggle('on', this.sel === 0); } AUDIO.nav && AUDIO.nav(); }
    else if (e.key === 'Enter') this.act(this.step === 'confirm' ? (this.sel === 1 ? 'yes' : 'no') : this.step === 'reward' ? 'claim' : 'ok'); else return false; e.preventDefault(); return true; },
  finish() { this.close(); FLOW.done = true; const n = this.next; this.next = null; ARC.wipe(() => { if (n) n(); }); } };
document.addEventListener('keydown', e => { if (DS.key(e)) e.stopImmediatePropagation(); }, true);

// ---------------- ゲストプレイ（保存しない） ----------------
const GUEST = { on: false,
  enter() { if (this.on) return; this.on = true; const real = SAVE.data, d = SAVE.defaults(); d.firstRunShown = true; d.tutDone = true; d.settings = Object.assign(d.settings, real.settings || {}); SAVE.data = d;
    SAVE.save = function () { }; SAVE.saveGhost = function () { }; SAVE.adopt = function () { }; SAVE.importCode = function () { UI.toast('ゲストプレイでは読み込みできません'); return false; }; SAVE.reset = function () { };
    try { CLOUD.queue = function () { }; CLOUD.flush = function () { }; } catch (e) { }
    try { const P = firebase.database.Reference.prototype; for (const m of ['set', 'update', 'push', 'transaction', 'remove', 'setWithPriority']) if (P[m]) P[m] = function () { return Promise.reject(new Error('guest')); }; } catch (e) { }
    document.body.classList.add('guest'); const b = document.createElement('div'); b.id = 'guestBar'; b.innerHTML = 'GUEST PLAY ・ データは保存されません <button data-guestend>終了</button>'; document.body.appendChild(b);
    b.addEventListener('click', e => { if (e.target.closest('[data-guestend]')) UI.a_guestEnd(); }); }
};
UI.a_guestEnd = function () { this.modal(`<h2>ゲストプレイを終了</h2><div class="note">タイトル画面に戻ります。ゲストプレイの内容は保存されません（セーブデータはそのままです）。</div><div class="btns"><button class="btn" data-a="closeModal">やめる</button><button class="btn pri" data-a="guestEndOk">終了する</button></div>`); };
UI.a_guestEndOk = function () { location.reload(); };
{ const _op = UI.open; UI.open = function (name) { if (GUEST.on && ['online', 'market', 'friends', 'clan', 'account'].includes(name)) return this.toast('ゲストプレイではオンライン機能は使えません'); return _op.apply(this, arguments); }; }

// ---------------- タイトル → データ選択 → スタートメニュー ----------------
{ const hook = () => { const s = $('btnStart'); if (!s || !s.onclick || s._flow) return false; const orig = s.onclick; s._flow = true; ATT_SKIP();
    s.onclick = function (e) { if (!FLOW.on() || FLOW.done) { ATT.stop(); return orig.call(this, e); } try { AUDIO.init(); AUDIO.resume(); AUDIO.confirm && AUDIO.confirm(); } catch (x) { } ATT.stop(); DS.open(() => orig.call(s, e)); };
    const T = $('s-title'); if (T) T.addEventListener('click', e => { if (e.target.closest('button,a,input,select')) return; if (FLOW.on() && T.classList.contains('show')) s.click(); });
    setTimeout(() => ATT.start(), 2100); return true; };
  if (!hook()) { const iv = setInterval(() => { if (hook()) clearInterval(iv); }, 100); setTimeout(() => clearInterval(iv), 15000); } }
document.addEventListener('keydown', e => { const T = $('s-title'); if (FLOW.on() && T && T.classList.contains('show') && (e.key === 'Enter' || e.key === ' ') && !(DS.el && DS.el.classList.contains('show'))) { e.preventDefault(); $('btnStart').click(); } });

// ---------------- 6. START MENU ----------------
ARC.screens.add('start');
const SM_ITEMS = [
  { id: 'shop', en: 'SHOP', jp: 'ショップ', ic: 'shop', c1: '#3a0a12', c2: '#ff4a6a', go: () => UI.open('store') },
  { id: 'garage', en: 'GARAGE & CUSTOMIZE', jp: 'ガレージ＆カスタマイズ', ic: 'garage', c1: '#2a2205', c2: '#ffcf3d', go: () => UI.open('garage') },
  { id: 'mode', en: 'MODE SELECT', jp: 'モード選択', ic: 'flag', c1: '#2a1a05', c2: '#ffb020', go: () => UI.open('amode') },
  { id: 'config', en: 'CONFIG', jp: 'コンフィグ', ic: 'sliders', c1: '#08223a', c2: '#3aa0ff', go: () => UI.open('settings') },
  { id: 'data', en: 'PLAY DATA', jp: 'プレイデータ', ic: 'trophy', c1: '#0c2a1e', c2: '#2fe08a', go: () => UI.open('profile') },
  { id: 'team', en: 'TEAM', jp: 'チーム', ic: 'flag', c1: '#2a2a06', c2: '#d6f53a', go: () => UI.open('clan') },
  { id: 'menu', en: 'ALL MENU', jp: 'すべての機能', ic: 'gear', c1: '#1c1d22', c2: '#c9ced8', go: () => { UI._classic = true; try { UI.goMenu(); } finally { UI._classic = false; } } }];
function smArt(m) { return `<svg class="am-art" viewBox="0 0 200 96" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="smg${m.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m.c1}"/><stop offset="1" stop-color="#07080b"/></linearGradient></defs><rect width="200" height="96" fill="url(#smg${m.id})"/>${Array.from({ length: 9 }, (_, i) => `<line x1="${(i * 37) % 200}" y1="${(i * 23) % 96}" x2="${(i * 37) % 200 - 60}" y2="${(i * 23) % 96 + 26}" stroke="${m.c2}" stroke-opacity="${0.1 + (i % 3) * 0.06}" stroke-width="2"/>`).join('')}<g transform="translate(120 14) scale(1.6)" opacity=".85">${ICO(m.ic, m.c2, 40).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g></svg>`; }
UI.r_start = function () { $('panelTitle').textContent = 'START MENU'; $('panelBody').classList.add('wide'); this.show.active = true; const d = SAVE.data, cur = SAVE.cur(); try { this.show.setCar(cur); } catch (e) { } const i = this.smI == null ? 2 : this.smI, others = d.cars.filter(c => c.uid !== cur.uid).slice(0, 2);
  const carCard = (c, main) => { const car = CAR_BY_ID[c.id]; if (!car) return ''; return `<button class="sm-car ${main ? 'main' : ''}" data-a="${main ? 'smGo' : 'smCar'}" data-v="${main ? 'garage' : c.uid}">${packCarSvg(car.id, 150)}<span><b>${esc(car.name)}</b><small>${car.drive} ・ ${car.hp}PS${main ? ' ・ 使用中' : ''}</small></span></button>`; };
  const slots = [carCard(cur, 1)].concat(others.map(c => carCard(c))); while (slots.length < 3) slots.push(`<button class="sm-car empty" data-a="smGo" data-v="shop"><span>ショップ＆ガレージで車を追加できます</span></button>`);
  return `<div class="sm"><div class="sm-cars">${slots.join('')}</div><div class="sm-guide">メニューを選択してください</div>
    <div class="am-rail sm-rail"><button class="am-arw l" data-a="smMv" data-v="-1">◀</button><div class="am-track">${SM_ITEMS.map((x, k) => `<button class="am-card ${k === i ? 'sel' : ''}" data-a="smPick" data-v="${k}" style="--mc:${x.c2}"><span class="am-ca">${smArt(x)}</span><small>${x.en}</small><b>${esc(x.jp)}</b></button>`).join('')}${GUEST.on ? `<button class="am-card" data-a="guestEnd" style="--mc:#ff6a2a"><span class="am-ca">${smArt({ id: 'g', ic: 'lock', c1: '#3a1a08', c2: '#ff6a2a' })}</span><small>END GUEST</small><b>ゲスト終了</b></button>` : ''}</div><button class="am-arw r" data-a="smMv" data-v="1">▶</button></div></div>`; };
UI.a_smPick = function (v) { const k = +v; if (k === (this.smI == null ? 2 : this.smI)) return this.a_smOk(); this.smI = k; this.render(); ARC.center(); };
UI.a_smMv = function (v) { this.smI = ((((this.smI == null ? 2 : this.smI) + +v) % SM_ITEMS.length) + SM_ITEMS.length) % SM_ITEMS.length; AUDIO.nav && AUDIO.nav(); this.render(); ARC.center(); };
UI.a_smOk = function () { const m = SM_ITEMS[this.smI == null ? 2 : this.smI]; if (!m) return; AUDIO.confirm && AUDIO.confirm(); ARC.wipe(() => m.go()); };
UI.a_smGo = function (k) { const m = SM_ITEMS.find(x => x.id === k); if (m) m.go(); };
UI.a_smCar = function (uid) { const c = SAVE.data.cars.find(x => x.uid === uid); if (!c) return; SAVE.data.current = uid; SAVE.save(); this.toast((CAR_BY_ID[c.id] || {}).name + ' に乗り換えました'); this.render(); };
// 左右・決定キー
{ const _mv = ARC.move, _ok = ARC.ok; ARC.move = function (d) { if (UI.screen === 'start') return UI.a_smMv(d); return _mv.apply(this, arguments); }; ARC.ok = function () { if (UI.screen === 'start') return UI.a_smOk(); return _ok.apply(this, arguments); }; }
// ホームはスタートメニュー（アーケードUIのとき）
{ const _gm = UI.goMenu; UI.goMenu = function () { const r = _gm.apply(this, arguments); if (ARC.on() && !this._classic && !(this.game && this.game.active) && FLOW.started()) { this.open('start', null, false); } return r; }; }
FLOW.started = () => !$('s-title') || !$('s-title').classList.contains('show') || FLOW.done;
{ const _bk = ARC.paint; ARC.paint = function () { _bk.apply(this, arguments); const h = document.querySelector('#arcCon [data-arc=home]'); if (h) h.dataset.arc = 'home'; }; }
window.__DLX = Object.assign(window.__DLX || {}, { FLOW, DS, GUEST, ATT, SM_ITEMS, GIFTS });
