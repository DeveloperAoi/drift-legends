// =====================================================================
// ui.js — セーブ / メニュー / ガレージ / ショップ / チューニング / 設定 / イベント / ストーリー / HUD
// =====================================================================
const yen = n => '¥' + Math.round(n).toLocaleString('ja-JP');
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const IS_TOUCH = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window && navigator.maxTouchPoints > 0);

// ---------------- セーブ ----------------
const SAVE = {
  key: 'driftlegends_save_v1', mem: {}, data: null,
  newCar(id) { const car = CAR_BY_ID[id]; const o = this._newCar(id, car); if (car.panda) { o.look.livery = 'panda'; if (!o.look.owned.livery.includes('panda')) o.look.owned.livery.push('panda'); } return o; },
  _newCar(id, car) { return { uid: 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36), id, fav: false, tune: defaultTune(car), look: defaultLook(car), paid: car.price, spent: 0 }; },
  defaults() {
    const c = this.newCar('ak_kiri');
    return { v: 1, seenVersion: GAME_VERSION, money: 1000000, xp: 0, cars: [c], current: c.uid, story: { cleared: [] }, records: { ta: {}, touge: {} }, ach: {}, stats: { parts: 0, races: 0, wins: 0, nightDist: 0, drifts: 0, playSec: 0 }, event: { done: {}, items: [], best: {} },
      inv: {}, exSlot2: false, cons: {}, boosts: {}, diamonds: 0, diaCh: {}, extras: [], medals: { g: 0, s: 0, b: 0 }, medalLog: [], lbClaim: {}, advent: { y: 0, open: [] }, chest: { freeDate: '' }, shopBuy: { date: '', ids: [] }, settings: { lang: 'ja', ctrlPreset: 'standard', accelMode: 'hold', steerMode: 'buttons', autoHand: false, autoNitro: false, btnScale: 1, btnAlpha: 1, mirror: false, bg: 'garage', bgm: 0.6, sfx: 0.8, mute: false, quality: IS_TOUCH ? 1 : 2, camera: 0, trans: 'AT', assist: 2, steerSens: 0.5, autoAccel: false, layout: 'C', showFps: false, xmasTheme: 'auto', touchUI: 'auto', aiLevel: 1, nick: 'プレイヤー', gyro: false, gyroSens: 0.5, gyroInvert: false }, created: Date.now() };
  },
  ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); return true; } catch (e) { if (v === undefined) return this.mem[k] ?? null; this.mem[k] = v; return false; } },
  load() {
    let d = null; try { const s = this.ls(this.key); if (s) d = JSON.parse(s); } catch (e) { d = null; }
    const def = this.defaults();
    if (!d || !Array.isArray(d.cars) || !d.cars.length) d = def;
    // 欠損項目を補完
    for (const k in def) if (d[k] === undefined) d[k] = def[k];
    const _old = d.settings || {}; d.settings = Object.assign(def.settings, _old); if (!('accelMode' in _old) && _old.autoAccel) d.settings.accelMode = 'auto'; d.inv = d.inv || {}; d.diamonds = d.diamonds || 0; d.diaCh = d.diaCh || {}; d.extras = d.extras || []; d.medals = Object.assign({ g: 0, s: 0, b: 0 }, d.medals); d.medalLog = d.medalLog || []; d.lbClaim = d.lbClaim || {}; d.advent = Object.assign({ y: 0, open: [] }, d.advent); d.chest = Object.assign({ freeDate: '' }, d.chest); d.shopBuy = Object.assign({ date: '', ids: [] }, d.shopBuy); d.records = Object.assign({ ta: {}, touge: {} }, d.records); d.event = Object.assign({ done: {}, items: [], best: {} }, d.event); d.stats = Object.assign(def.stats, d.stats);
    d.cars = d.cars.filter(c => CAR_BY_ID[c.id]).map(c => { const car = CAR_BY_ID[c.id]; c.tune = Object.assign(defaultTune(car), c.tune || {}); c.tune.owned = Object.assign(defaultTune(car).owned, c.tune.owned || {}); c.look = Object.assign(defaultLook(car), c.look || {}); c.look.owned = Object.assign(defaultLook(car).owned, c.look.owned || {}); return c; });
    if (!d.cars.length) { const c = this.newCar('ak_kiri'); d.cars.push(c); d.current = c.uid; }
    if (!d.cars.find(c => c.uid === d.current)) d.current = d.cars[0].uid;
    this.data = d; return d;
  },
  _last: '',
  save(force) {
    try { const d = this.data; const at = d.savedAt; d.savedAt = 0; const body = JSON.stringify(d); d.savedAt = at;
      if (!force && body === this._last) return; this._last = body; d.savedAt = Date.now();
      const str = JSON.stringify(d); this.ls(this.key, str); IDB.put(this.key, str); CLOUD.queue(); UI.saveStatus && UI.saveStatus(); } catch (e) { }
  },
  adopt(d) { try { const str = JSON.stringify(d); this.ls(this.key, str); IDB.put(this.key, str); } catch (e) { } this.load(); this._last = ''; },
  loadGhost(map) { try { const s = this.ls('dl_ghost_' + map); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
  saveGhost(map, g) { try { const s = JSON.stringify(g); this.ls('dl_ghost_' + map, s); IDB.put('dl_ghost_' + map, s); CLOUD.ghost(map, s); } catch (e) { } },
  exportCode() { try { return btoa(unescape(encodeURIComponent(JSON.stringify(this.data)))); } catch (e) { return ''; } },
  importCode(s) { try { const d = JSON.parse(decodeURIComponent(escape(atob(s.trim())))); if (!d || !d.cars) throw 0; this.ls(this.key, JSON.stringify(d)); this.load(); return true; } catch (e) { return false; } },
  reset() { this.data = this.defaults(); this.save(); },
  cur() { return this.data.cars.find(c => c.uid === this.data.current) || this.data.cars[0]; },
  level() { return 1 + Math.floor(this.data.xp / 1500); },
  addMoney(n) { this.data.money = Math.max(0, Math.round(this.data.money + n)); },
  spend(n) { if (UI._sim) return true; if (UI._gate && !UI._ok && (DEV.inf() || this.data.money >= n)) { UI._pend = { price: n, cur: 'yen' }; return false; } if (DEV.inf()) return true; if (this.data.money < n) { UI.toast('所持金が足りません'); AUDIO.error(); return false; } this.data.money -= n; return true; }
};
// ---- IndexedDB（ブラウザ内の予備保存） ----
const IDB = {
  db: null, ready: null,
  open() { if (this.ready) return this.ready; this.ready = new Promise(res => { try { const r = indexedDB.open('driftlegends', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => res(null); } catch (e) { res(null); } }); return this.ready; },
  async put(k, v) { const db = await this.open(); if (!db) return; try { db.transaction('kv', 'readwrite').objectStore('kv').put(v, k); } catch (e) { } },
  async get(k) { const db = await this.open(); if (!db) return null; return new Promise(res => { try { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); } catch (e) { res(null); } }); }
};
// ---- クラウド保存（claude.ai アカウントに紐づく自動保存） ----
const CLOUD = {
  db: null, doc: null, uid: null, state: 'local', writing: false, pending: false, t: 0, lastSaved: 0,
  async init(preferCloud) {
    // ブラウザ予備保存の方が新しければ採用
    try { const s = await IDB.get(SAVE.key); if (s) { const d = JSON.parse(s); if ((d.savedAt || 0) > (SAVE.data.savedAt || 0) && d.cars) { SAVE.adopt(d); UI.afterLoad(); } } } catch (e) { }
    try {
      if (!window.claude || typeof window.claude.use !== 'function') return this.set('local');
      this.set('connecting');
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      const id = user ? await user.id() : null; if (!db || !id) return this.set('local');
      this.db = db; this.uid = id; this.doc = db.doc('data/users/' + id + '/save');
      const snap = await Promise.race([this.doc.get(), new Promise((_, rj) => setTimeout(() => rj({ code: 'timeout' }), 10000))]);
      const body = snap.exists ? snap.data() : null; let cd = null; try { cd = body && body.json ? JSON.parse(body.json) : null; } catch (e) { }
      if (cd && cd.cars && (preferCloud || (cd.savedAt || 0) > (SAVE.data.savedAt || 0)) && !UI.game.active) { SAVE.adopt(cd); UI.afterLoad(); UI.toast('☁ クラウドのセーブデータを読み込みました'); this.set('synced'); }
      else { this.pending = true; await this.flush(); }
      // ゴースト復元
      for (const m in SAVE.data.records.ta) { if (!SAVE.loadGhost(m)) { try { const g = await db.doc('data/users/' + id + '/ghost_' + m).get(); if (g.exists && g.data().json) SAVE.ls('dl_ghost_' + m, g.data().json); } catch (e) { } } }
    } catch (e) { this.set(this.doc ? 'error' : 'local'); }
  },
  queue() { if (!this.doc) return; this.pending = true; clearTimeout(this.t); this.t = setTimeout(() => this.flush(), 2500); },
  async flush() {
    if (!this.doc || this.writing || !this.pending) return; clearTimeout(this.t); this.writing = true; this.pending = false; this.set('saving');
    try { await this.doc.set({ json: JSON.stringify(SAVE.data), savedAt: SAVE.data.savedAt || Date.now(), v: 1 }); this.lastSaved = Date.now(); this.set('synced'); }
    catch (e) { if (e && (e.code === 'invalid_argument' || e.code === 'revoked' || e.code === 'not_granted' || e.code === 'capability_disabled')) { this.doc = null; this.set('local'); } else if (e && e.code === 'quota_exceeded') { this.set('error'); } else { this.pending = true; this.set('error'); setTimeout(() => this.flush(), 8000 + Math.random() * 4000); } }
    this.writing = false; if (this.pending && this.doc) this.queue();
  },
  async ghost(map, str) { if (!this.db || !this.uid || str.length > 250000) return; try { await this.db.doc('data/users/' + this.uid + '/ghost_' + map).set({ json: str }); } catch (e) { } },
  set(st) { this.state = st; UI.saveStatus && UI.saveStatus(); }
};
// ---- 開発者モード（このページの所有者にだけ表示） ----
const DEV = { owner: false, why: '確認中', async init() { try { if (!window.claude || typeof window.claude.use !== 'function') { this.why = 'この環境では開発者の確認ができません'; return; } const u = await window.claude.use('user'); if (!u) { this.why = 'アカウントに接続できませんでした'; return; } this.owner = !!(await u.isOwner()); this.why = this.owner ? '有効' : (window.DL_FB && !window.DL_FB.isGoogle() ? 'Googleでログインしていません（ゲスト）' : 'このアカウントは開発者に登録されていません'); if (UI.screen === 'settings' || UI.screen === 'dev') UI.render(); if (UI.screen === 'menu') UI.menuItems(); } catch (e) { this.owner = false; this.why = '確認中にエラー: ' + (e && e.message); } },
  inf() { return this.owner && SAVE.data.settings.devInfinite; } };
function saveLabel() {
  const st = CLOUD.state; const t = SAVE.data && SAVE.data.savedAt ? new Date(SAVE.data.savedAt) : null; const hm = t ? t.getHours() + ':' + String(t.getMinutes()).padStart(2, '0') : '';
  return { synced: '☁ 保存済み ' + hm, saving: '☁ 保存中…', connecting: '☁ 接続中…', error: '⚠ クラウド再試行中（端末には保存済み）', local: '端末に自動保存 ' + hm }[st] || '';
}
function mapUnlocked(m) { const u = m.unlock; if (!u) return true; const d = SAVE.data; if (u.story) return d.story.cleared.includes(u.story); if (u.level) return SAVE.level() >= u.level; if (u.event) return eventActive(); return true; }
function mapLockText(m) { const u = m.unlock; if (!u) return ''; if (u.story) return `ストーリー第${u.story}話クリアで解放`; if (u.level) return `Lv.${u.level}で解放`; if (u.event) return 'クリスマスイベント期間限定'; return ''; }
function carBuyable(c) { const u = c.unlock; if (!u) return true; if (u.event || u.chest) return false; if (u.story) return SAVE.data.story.cleared.includes(u.story); if (u.level) return SAVE.level() >= u.level; return true; }
function carLockText(c) { const u = c.unlock; if (!u) return ''; if (u.chest) return 'カードパック限定'; if (u.event) return 'イベント報酬限定'; if (u.story) return `ストーリー第${u.story}話クリアで販売`; if (u.level) return `Lv.${u.level}で販売`; return ''; }
function eventActive() { if (typeof DEV !== 'undefined' && DEV.owner && SAVE.data && SAVE.data.settings.devEvent) return true; const now = new Date(); const s = new Date(XMAS_EVENT.start + 'T00:00:00+09:00'), e = new Date(XMAS_EVENT.end + 'T23:59:59+09:00'); return now >= s && now <= e; }
function xmasThemeOn() { const t = SAVE.data.settings.xmasTheme; return t === 'on' || (t === 'auto' && eventActive()); }
const TRACK_CACHE = {};
function qrPrize(m) { return 150000 + (m.diff || 2) * 50000; }
function getTrack(id) { if (!TRACK_CACHE[id]) TRACK_CACHE[id] = new Track(MAP_BY_ID[id]); return TRACK_CACHE[id]; }
function recordFor(mapId) { const tr = getTrack(mapId); return tr.length / 1000 * (RECORD_PACE[tr.env] || 30); }
function hasItem(it) { return SAVE.data.event.items.includes(it); }
function invHas(id) { const it = ITEM_BY_ID[id]; if (it && it.type === 'car') return SAVE.data.cars.some(c => c.id === it.car); return (SAVE.data.inv[id] || 0) > 0; }
// ---- 消費アイテム（ブースト） ----
const BOOST_CAP = 3 * 3600000;
function boostActive(t) { const b = (SAVE.data.boosts || {})[t]; return b && b.end > Date.now() ? b : null; }
function boostMult(t) { let m = 1; const b = boostActive(t); if (b) m = b.mult; const a = boostActive('all'); if (a && t !== 'xmas') m = Math.max(m, a.mult); return m; }
function giveCons(id, n = 1) { const d = SAVE.data; d.cons = d.cons || {}; d.cons[id] = (d.cons[id] || 0) + n; }
function randCons(rnd = Math.random, cheap = false) { const pool = CONSUMABLES.filter(c => cheap ? (c.price && c.price <= 500000) : c.price); return pool[Math.floor(rnd() * pool.length)]; }
function useCons(id) { const d = SAVE.data, c = CONS_BY_ID[id]; d.boosts = d.boosts || {}; if (!c || !(d.cons[id] > 0)) return { ok: false, msg: 'アイテムを持っていません' };
  if (c.type === 'luck') { if ((d.boosts.luck || 0) >= 50) return { ok: false, msg: 'これ以上ためられません（最大50回）' }; d.boosts.luck = Math.min(50, (d.boosts.luck || 0) + c.uses); }
  else { const now = Date.now(), b = boostActive(c.type);
    if (b && b.mult > c.mult) return { ok: false, msg: 'もっと強いブーストが使用中です' };
    if (b && b.mult === c.mult) { if (b.end - now >= BOOST_CAP - 60000) return { ok: false, msg: 'これ以上延長できません（最大3時間）' }; b.end = Math.min(now + BOOST_CAP, b.end + c.mins * 60000); }
    else d.boosts[c.type] = { mult: c.mult, end: now + c.mins * 60000 }; }
  d.cons[id]--; if (!d.cons[id]) delete d.cons[id]; SAVE.save(); return { ok: true }; }
const BOOST_INFO = { coin: ['can', '#ffd23a', '賞金'], dia: ['candy', '#9ad8ff', 'ダイヤ'], xp: ['cup', '#e0c090', 'XP'], xmas: ['cookie', '#ff5a5a', 'Xmas'], all: ['can', '#ff6ae8', 'ALL'] };
function boostChips() { const d = SAVE.data, out = []; for (const t of Object.keys(BOOST_INFO)) { const b = boostActive(t); if (!b) continue; const [ic, col, nm] = BOOST_INFO[t], left = b.end - Date.now(), mm = Math.floor(left / 60000), ss = Math.floor(left / 1000) % 60;
    out.push(`<span class="bchip" style="--bc:${col}">${consIcon({ icon: ic, col }, 18)}<b>${nm} ×${b.mult}</b><i>${mm >= 60 ? Math.floor(mm / 60) + ':' + String(mm % 60).padStart(2, '0') + ':' + String(ss).padStart(2, '0') : mm + ':' + String(ss).padStart(2, '0')}</i></span>`); }
  if ((d.boosts || {}).luck > 0) out.push(`<span class="bchip" style="--bc:#2fdc7a">${consIcon({ icon: 'charm', col: '#2fdc7a' }, 18)}<b>LUCK</b><i>${d.boosts.luck}</i></span>`);
  return out.join(''); }
setInterval(() => { try { const h = boostChips(); for (const id of ['boostBar', 'hudBoost']) { const e = document.getElementById(id); if (e && e.innerHTML !== h) e.innerHTML = h; } } catch (e) {} }, 1000);
function grantChestItem(it) { // 新規なら付与、重複なら¥に換金
  const d = SAVE.data; if (invHas(it.id)) { const ref = RARITY[it.rarity].dup; SAVE.addMoney(ref); d.inv[it.id] = (d.inv[it.id] || 1) + 1; return { isNew: false, refund: ref }; }
  d.inv[it.id] = 1; if (it.type === 'car') { const c = SAVE.newCar(it.car); c.paid = 3000000; d.cars.push(c); }
  return { isNew: true, refund: 0 };
}

// =====================================================================

// ---------------- ロード画面 ----------------
const LOADER = {
  tips: ['コーナー手前でサイドブレーキを一瞬引くと、きっかけを作りやすい。', 'ドリフト中はアクセルを抜きすぎないこと。角度はアクセルで、向きはハンドルで調整。', 'ニトロはコーナー立ち上がりで使うと最も効果的。', 'カードパックで出る限定チューンは、1台に1つだけ装着できる。', '日替わりショップは毎日0:00（日本時間）に入れ替わる。', 'デイリーカードパックは毎日1回無料で開けられる。', 'デカールは「貼り付け位置」で位置・大きさ・回転を自由に変えられる。', 'ホーム背景はカードパック画面の「ホーム背景」タブから変更できる。', '重複したアイテムはレア度に応じて¥に換金される。', 'LSDを強めると、ドリフトの維持がしやすくなる。', '雪や雨の日はグリップが落ちる。早めのブレーキを。', '峠チャレンジは路肩に触れずに走り切るとボーナス。', 'オンライン対戦は友達と同じ部屋コードを入力するだけ。', 'スマホならジャイロ操作も使える（設定から）。', 'ウイングを付けると高速コーナーで安定する。', 'データは自動で保存される。', 'ドリフトアシストは設定で強さを変えられる。慣れたら弱めてみよう。', 'カメラ切替でボンネット視点や車内視点も楽しめる。'],
  scenes: ['night', 'sunset', 'snow', 'neon', 'sakura', 'dawn'],
  draw(cv, sc) {
    const W = cv.width = cv.clientWidth * Math.min(2, devicePixelRatio || 1) || 800, H = cv.height = cv.clientHeight * Math.min(2, devicePixelRatio || 1) || 450; const g = cv.getContext('2d'); const r = mulberry32((Math.random() * 1e9) | 0);
    const P = { night: ['#050816', '#1b2550', '#0a0d1a', '#ffd27a'], sunset: ['#2a0f3a', '#ff6a3d', '#1a0d14', '#ffd27a'], snow: ['#1a2235', '#8aa0c0', '#dfe8f5', '#fff2c0'], neon: ['#0a0018', '#3a0a5a', '#08060f', '#ff3ad0'], sakura: ['#2a1a3a', '#e8a0c0', '#1a1020', '#ffe0f0'], dawn: ['#0d1a33', '#f0a060', '#141a22', '#ffe6b0'] }[sc];
    const sky = g.createLinearGradient(0, 0, 0, H * 0.7); sky.addColorStop(0, P[0]); sky.addColorStop(1, P[1]); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    if (sc === 'night' || sc === 'neon' || sc === 'snow') { g.fillStyle = '#fff'; for (let i = 0; i < 120; i++) { g.globalAlpha = r() * 0.8; g.fillRect(r() * W, r() * H * 0.5, 1.5, 1.5); } g.globalAlpha = 1; }
    if (sc === 'sunset' || sc === 'dawn') { g.fillStyle = sc === 'sunset' ? '#ffcf6a' : '#ffe0a0'; g.beginPath(); g.arc(W * 0.7, H * 0.55, H * 0.12, 0, TAU); g.fill(); }
    else { g.fillStyle = 'rgba(255,255,240,.9)'; g.beginPath(); g.arc(W * 0.78, H * 0.18, H * 0.05, 0, TAU); g.fill(); }
    for (let l = 0; l < 3; l++) { g.fillStyle = `rgba(0,0,0,${0.35 + l * 0.2})`; g.beginPath(); g.moveTo(0, H); let y = H * (0.45 + l * 0.08); for (let x = 0; x <= W; x += W / 24) { y += (r() - 0.5) * H * 0.06; g.lineTo(x, Math.min(H * 0.75, Math.max(H * 0.3, y))); } g.lineTo(W, H); g.fill(); }
    // 峠道（カーブする道路）
    g.fillStyle = P[2]; g.beginPath(); g.moveTo(-W * 0.1, H); g.bezierCurveTo(W * 0.3, H * 0.75, W * 0.2, H * 0.62, W * 0.55, H * 0.6); g.lineTo(W * 0.62, H * 0.61); g.bezierCurveTo(W * 0.4, H * 0.68, W * 0.7, H * 0.8, W * 0.75, H); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.setLineDash([W * 0.02, W * 0.02]); g.lineWidth = Math.max(2, W * 0.003); g.beginPath(); g.moveTo(W * 0.32, H); g.bezierCurveTo(W * 0.4, H * 0.78, W * 0.35, H * 0.66, W * 0.58, H * 0.605); g.stroke(); g.setLineDash([]);
    // 車のシルエットとテールランプ・タイヤスモーク
    const s = Math.min(W, H * 1.8) * 0.075, cx = W * 0.42, cy = H * 0.72; g.save(); g.translate(cx, cy); g.rotate(-0.18);
    g.fillStyle = 'rgba(220,220,230,.18)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(-s * 1.1 - r() * s * 1.8, -r() * s * 0.5, s * (0.1 + r() * 0.25), 0, TAU); g.fill(); }
    g.fillStyle = '#0a0a0c'; g.beginPath(); g.moveTo(-s, 0); g.lineTo(-s, -s * 0.3); g.lineTo(-s * 0.55, -s * 0.36); g.lineTo(-s * 0.3, -s * 0.58); g.lineTo(s * 0.25, -s * 0.58); g.lineTo(s * 0.55, -s * 0.34); g.lineTo(s, -s * 0.28); g.lineTo(s, 0); g.fill();
    g.fillStyle = P[3]; g.shadowColor = P[3]; g.shadowBlur = 20; g.fillRect(s * 0.92, -s * 0.25, s * 0.08, s * 0.06); g.fillStyle = '#ff2a1a'; g.shadowColor = '#ff2a1a'; g.fillRect(-s * 1.02, -s * 0.26, s * 0.08, s * 0.07); g.shadowBlur = 0;
    g.fillStyle = '#000'; g.beginPath(); g.arc(-s * 0.6, 0, s * 0.17, 0, TAU); g.arc(s * 0.6, 0, s * 0.17, 0, TAU); g.fill(); g.restore();
    if (sc === 'snow') { g.fillStyle = '#fff'; for (let i = 0; i < 160; i++) { g.globalAlpha = 0.4 + r() * 0.6; g.beginPath(); g.arc(r() * W, r() * H, 1 + r() * 2.5, 0, TAU); g.fill(); } g.globalAlpha = 1; }
    if (sc === 'sakura') { for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,${180 + r() * 40 | 0},${210 + r() * 30 | 0},${0.5 + r() * 0.5})`; g.beginPath(); g.ellipse(r() * W, r() * H, 3 + r() * 3, 2 + r() * 2, r() * 3, 0, TAU); g.fill(); } }
    if (sc === 'neon') { for (let i = 0; i < 14; i++) { const x = r() * W, h = H * (0.15 + r() * 0.3); g.fillStyle = ['#ff3ad0', '#3ad0ff', '#ffd23a'][i % 3]; g.shadowColor = g.fillStyle; g.shadowBlur = 16; g.fillRect(x, H * 0.62 - h, 3, h); } g.shadowBlur = 0; }
  },
  names: { night: 'MIDNIGHT TOUGE', sunset: 'SUNSET RUN', snow: 'WINTER PASS', neon: 'NEON HIGHWAY', sakura: 'SAKURA HILL', dawn: 'DAWN PATROL' },
  show(text) {
    const el = $('loading'); el.classList.remove('hidden'); const sc = this.scenes[(Math.random() * this.scenes.length) | 0];
    try { this.draw($('loadBg'), sc); } catch (e) { } $('loadScene').textContent = this.names[sc];
    $('loadText').textContent = text || 'LOADING'; this.t0 = performance.now(); this.setP(0.05); this.nextTip();
    clearInterval(this._ti); this._ti = setInterval(() => this.nextTip(), 3200);
    clearInterval(this._pi); this._pi = setInterval(() => { this.p = Math.min(0.9, (this.p || 0) + 0.04); $('loadBar').style.width = (this.p * 100) + '%'; }, 120);
  },
  nextTip() { let i; do i = (Math.random() * this.tips.length) | 0; while (i === this._lt && this.tips.length > 1); this._lt = i; $('loadTip').textContent = this.tips[i]; },
  setP(p) { this.p = p; $('loadBar').style.width = (p * 100) + '%'; },
  hide(min = 1400) { const wait = Math.max(0, min - (performance.now() - (this.t0 || 0))); this.setP(0.95); clearInterval(this._pi);
    setTimeout(() => { this.setP(1); setTimeout(() => { $('loading').classList.add('hidden'); clearInterval(this._ti); }, 180); }, wait); }
};
// ---- アドベントカレンダーの日付計算（日本時間） ----
function adventInfo() {
  const j = new Date(Date.now() + 9 * 3600000), Y = j.getUTCFullYear(), M = j.getUTCMonth() + 1, D = j.getUTCDate();
  let day = M === 12 && D <= 25 ? D : 0; if (DEV.owner && SAVE.data.settings.devAdvent) day = 25;
  return { Y, M, D, day };
}
function adventSync() { const A = adventInfo(), d = SAVE.data, dev = DEV.owner && SAVE.data.settings.devAdvent, key = dev ? 'dev' + A.Y : A.Y; if ((A.M === 12 || dev) && d.advent.y !== key) d.advent = { y: key, open: [] }; }
const jstMidnight = (y, m, dd) => Date.UTC(y, m - 1, dd) - 9 * 3600000;
function fmtLeft(ms) { ms = Math.max(0, ms); const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return (d ? `<b>${d}</b>日 ` : '') + `<b>${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}</b>`; }
function adventCountdown() {
  const A = adventInfo(), now = Date.now();
  if (DEV.owner && SAVE.data.settings.devAdvent) return `<span class="adv-dev">開発者テスト中（12/25扱い）</span>`;
  if (A.M === 12 && A.D <= 25) { const nx = A.D < 25 ? `次の扉まで ${fmtLeft(jstMidnight(A.Y, 12, A.D + 1) - now)}` : '最後の扉が開きました！'; return `<span>${nx}</span><span>${A.D < 25 ? `クリスマスまで あと <b>${25 - A.D}</b>日` : '<b>メリークリスマス！</b>'}</span>`; }
  const y = A.M === 12 ? A.Y + 1 : A.Y; return `<span>開始まで ${fmtLeft(jstMidnight(y, 12, 1) - now)}</span><span>12/1 0:00（日本時間）スタート</span>`;
}
function adventRewardLabel(rw, long) { if (!rw) return ''; if (rw.t === 'money') return yen(rw.v); if (rw.t === 'pts') return 'クリスマスポイント ' + rw.v.toLocaleString() + 'pt'; if (rw.t === 'chest') return (CHESTS.find(c => c.id === rw.v) || {}).name || 'カードパック'; const it = ITEM_BY_ID[rw.v]; return it ? it.name : rw.v; }
function adventRewardIcon(rw, size) { if (rw.t === 'money') return ICO('coin', '#ffcf3d', size); if (rw.t === 'pts') return ICO('tree', '#2fdc7a', size); if (rw.t === 'chest') return chestIcon(CHESTS.find(c => c.id === rw.v), size); return itemIconSvg(ITEM_BY_ID[rw.v], size); }
// ---- 週間ランキングの種目 ----
const LB_BOARDS = [
  { id: 'drift', name: '峠ドリフト', desc: '峠チャレンジ1回の最高スコア（今週の自己ベストが記録されます）', fmt: v => Math.round(v).toLocaleString() + ' pt' },
  { id: 'jump', name: '最長ジャンプ', desc: 'ジャンプ台での1回の最長飛距離（スカイランプ・パークなど）', fmt: v => (+v).toFixed(1) + ' m' },
  { id: 'dist', name: '走行距離', desc: '今週走った距離の合計（どのモードでもOK）', fmt: v => (+v).toFixed(1) + ' km' }
];
function lbWeekDist() { const F = window.DL_FB, d = SAVE.data; if (!F) return null; const k = F.weekKey(); if (!d.wk || d.wk.k !== k) d.wk = { k, m: 0 }; return d.wk; }
const EX_SLOT2_COST = 150;
const SND_NAV = /^(setTab|season|achCat|psType|shopTab|selStory|selMap|selShop|exSlot|trPick|dragOpp|clanOpenSet|cat|tcat|tmode|garageSel|setCar)$/;
const SND_OK = /^(buyConfirm|storyGo|dragGo|resNext|restart|tutNext|frOk|frSend|trAccept|clanCreate|clanJoin|clanJoinCode|redeem|achClaim|achAll|glvClaim|glvAll|ftClaim|go|start|launch|xGo|diaGo|useCons)$/;
const SND_NG = /^(buyCancel|closeModal|closeChest|tutSkip|tutPrev|trCancel|tradeClose|frNo|frDel|clanLeave|clanDisband|back)$/;
const SIM_ACTS = new Set(['tuneLv', 'tuneOpt', 'lookOpt', 'buyKit', 'hlCol', 'mfType', 'lookGlow', 'lookWheel', 'lookPaint', 'lookLivery', 'lookDecal']);
const GATED_ACTS = new Set([...SIM_ACTS, 'setExtra', 'buyItem', 'buyMusic', 'buyCons', 'buyDia', 'shopBuy', 'openChest']);
function lbBlocked(inst, game) { const ex = inst && inst.look && EXTRA_BY_ID[inst.look.extra], ex2 = inst && inst.look && SAVE.data.exSlot2 && EXTRA_BY_ID[inst.look.extra2]; if ((ex && ex.perf) || (ex2 && ex2.perf)) return 'extra'; if (typeof DEV !== 'undefined' && DEV.owner && (SAVE.data.settings.devNitro || SAVE.data.settings.devGhostCar)) return 'dev'; return ''; }
function lbBoardName(id) { if (id.startsWith('ta_')) { const m = MAP_BY_ID[id.slice(3)]; return 'タイムアタック ' + (m ? m.jp : id.slice(3)); } const b = LB_BOARDS.find(x => x.id === id); return b ? b.name : id; }
function lbFmt(id, v) { if (id.startsWith('ta_')) return fmtLap(v); const b = LB_BOARDS.find(x => x.id === id); return b ? b.fmt(v) : String(v); }
function fmtLap(t) { const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(3); }
function lbSendDist() { const w = lbWeekDist(); if (w && w.m > 50) window.DL_FB.lbSubmit('dist', Math.round(w.m / 100) / 10, 'set'); }
// ---- ダイヤ（新しい通貨）とダイヤレース（毎週入れ替わる期間限定レース） ----
function weekKeyLocal(off = 0) { const j = new Date(Date.now() + 9 * 3600000); const dow = (j.getUTCDay() + 6) % 7; const mon = new Date(Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate() - dow + off * 7)); return 'w' + mon.toISOString().slice(0, 10).replace(/-/g, ''); }
function weekEndLocal() { const j = new Date(Date.now() + 9 * 3600000); const dow = (j.getUTCDay() + 6) % 7; return Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate() - dow + 7) - 9 * 3600000; }
function lapEstimate(mapId) { try { const tr = getTrack(mapId); let t = 0; for (let i = 0; i < tr.n; i++) t += STEP / Math.max(8, tr.vmax[i] * 0.62); return t; } catch (e) { return 120; } }
function diaRaces() {
  const wk = weekKeyLocal(); if (UI._diaWk === wk && UI._dia) return UI._dia;
  let h = 0; for (const c of wk) h = (h * 31 + c.charCodeAt(0)) | 0; const rnd = mulberry32(h);
  const pool = [['touge', 'akigiri', 15000], ['touge', 'kuremine', 20000], ['touge', 'tsuzura', 12000], ['touge', 'harukaze', 16000], ['touge', 'hakoya', 22000], ['jump', 'jumppark', 32], ['jump', 'jumppark', 38], ['time', 'circuit', 0], ['time', 'akigiri', 0], ['time', 'jumppark', 0], ['time', 'kuremine', 0]];
  const picks = []; const used = new Set(); while (picks.length < 3) { const i = Math.floor(rnd() * pool.length); if (used.has(i)) continue; used.add(i); picks.push(pool[i]); }
  UI._diaWk = wk; UI._dia = picks.map(([t, map, g], k) => ({ id: wk + '_' + k, t, map, goal: t === 'time' ? Math.round(lapEstimate(map) * 1.15 * 10) / 10 : g, reward: [30, 40, 60][k] }));
  return UI._dia;
}
function diaClaim(ch) { const d = SAVE.data; if (d.diaCh[ch.id]) return false; d.diaCh[ch.id] = 1; d.diamonds = (d.diamonds || 0) + ch.reward; SAVE.save(); AUDIO.fanfare(); UI.refreshTop(); return true; }
const CTRL_PRESETS = [
  { id: 'standard', name: '標準', desc: '初期設定。左手でハンドル、右手でアクセル・ブレーキ', v: { accelMode: 'hold', steerMode: 'buttons', autoHand: false, autoNitro: false, assist: 2, layout: 'C', mirror: false, trans: 'AT' } },
  { id: 'easy', name: 'かんたん', desc: 'アクセル自動＋ドリフトとニトロもおまかせ', v: { accelMode: 'auto', steerMode: 'buttons', autoHand: true, autoNitro: true, assist: 3, layout: 'A', mirror: false, trans: 'AT' } },
  { id: 'toggle', name: 'アクセル切替', desc: 'GASをタップでON/OFF。指が疲れにくい', v: { accelMode: 'toggle', steerMode: 'buttons', autoHand: false, autoNitro: false, assist: 2, layout: 'A', mirror: false, trans: 'AT' } },
  { id: 'slide', name: 'スライド', desc: '左手でなぞってハンドル。細かく切れる', v: { accelMode: 'hold', steerMode: 'slide', autoHand: false, autoNitro: false, assist: 2, layout: 'B', mirror: false, trans: 'AT' } },
  { id: 'onehand', name: '片手でらくらく', desc: 'アクセル自動＋スライド操作＋アシスト全開', v: { accelMode: 'auto', steerMode: 'slide', autoHand: true, autoNitro: true, assist: 3, layout: 'B', mirror: false, trans: 'AT' } },
  { id: 'tilt', name: '傾き操作', desc: 'スマホを傾けてハンドル。アクセル自動', v: { accelMode: 'auto', steerMode: 'gyro', autoHand: false, autoNitro: false, assist: 3, layout: 'A', mirror: false, trans: 'AT' } },
  { id: 'pro', name: '上級者', desc: 'アシストOFF・マニュアル。腕で勝負', v: { accelMode: 'hold', steerMode: 'buttons', autoHand: false, autoNitro: false, assist: 0, layout: 'A', mirror: false, trans: 'MT' } }
];
const priceTag2 = (owned, price) => `<span class="pr ${owned ? 'own' : ''}">${owned ? '所有' : yen(price)}</span>`;
const mufRow = (lk) => { lk.owned.mf = lk.owned.mf || ['stock']; return `<div class="h3">マフラーの音</div><div class="opt-row">${MUFFLER_TYPES.filter(m => !m[3] || invHas(m[3])).map(([id, nm, pr]) => `<button class="opt ${(lk.mfType || 'stock') === id ? 'on' : ''}" data-a="mfType" data-v="${id}">${nm}${priceTag2(lk.owned.mf.includes(id), pr)}</button>`).join('')}</div>`; };
const hlColRow = (lk) => { lk.owned.hlCol = lk.owned.hlCol || ['white']; return `<div class="h3">ヘッドライトの色</div><div class="opt-row">${HL_COLORS.map(([id, nm, c]) => `<button class="opt ${(lk.hlCol || 'white') === id ? 'on' : ''}" data-a="hlCol" data-v="${id}"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:4px;vertical-align:-1px;background:${id === 'rainbow' ? 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' : 'rgb(' + c.map(v => Math.round(v * 255)).join(',') + ')'}"></span>${nm}${priceTag2(lk.owned.hlCol.includes(id), id === 'rainbow' ? 300000 : 50000)}</button>`).join('')}</div>`; };
const STYLES = [['stock', '純正', '工場出荷時の姿'], ['street', 'ストリート', '街乗り仕様'], ['widebody', 'ワイドボディ', '迫力のワイド'], ['timeattack', 'レーシング', 'サーキット仕様'], ['drift', 'ドリフト', '峠のドリフト仕様']];
const styleRow = (lk) => `<div class="h3">スタイル</div><div class="style-row">${STYLES.map(([id, nm, sub]) => `<button class="style-b" data-a="${id === 'stock' ? 'stockAll' : 'buyKit'}" data-v="${id}"><b>${nm}</b><small>${sub}</small></button>`).join('')}</div>`;
const kitRow = (lk) => `<div class="h3">ボディキット（セット）</div><div class="note">フロント・サイド・リア・ウイングなどをまとめて装着。持っていないパーツだけセット価格で購入できます。</div><div class="opt-row">${BODY_KITS.map(k => { const own = Object.entries(k.set).every(([sl, i]) => (lk.owned[sl] || [0]).includes(i)); const on = Object.entries(k.set).every(([sl, i]) => (lk[sl] || 0) === i); return `<button class="opt ${on ? 'on' : ''}" data-a="buyKit" data-v="${k.id}">${k.name}${priceTag2(own, k.price)}</button>`; }).join('')}</div>`;

const UI = {
  init(R, game, show) {
    this.R = R; this.game = game; this.show = show; this.screen = 'title'; this.stack = [];
    document.body.classList.toggle('touch', this.touchUI());
    document.body.classList.add('lay' + (SAVE.data.settings.layout || 'A')); this.applyCtrl();
    $('btnStart').onclick = () => { AUDIO.init(); AUDIO.resume(); { const S = SAVE.data.settings; AUDIO.setVol({ bgm: S.bgm, sfx: S.sfx, ui: S.ui ?? 0.8, engine: S.engine ?? 0.9, tire: S.tire ?? 0.8, mute: S.mute }); } AUDIO.confirm(); AUDIO.playCat(xmasThemeOn() ? 'xmas' : 'menu'); this.goMenu(); if (SAVE.data.firstRunShown !== true) { SAVE.data.firstRunShown = true; SAVE.save(); this.welcome(); } };
    $('btnBack').onclick = () => { AUDIO.cancel(); this.back(); };
    // ---- タップ反応の改善：指を離した瞬間に反応（スクロール中の微妙なズレで押せない問題を防ぐ） ----
    { let down = null, last = null; const SEL = 'button, [data-a], [data-m]';
      document.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; const el = e.target.closest && e.target.closest(SEL); down = el && !el.closest('#touch') ? { el, x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId } : null; }, true);
      document.addEventListener('pointercancel', e => { if (down && down.id === e.pointerId) down = null; }, true);
      document.addEventListener('pointerup', e => {
        if (!down || down.id !== e.pointerId) return; const d = down; down = null;
        if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 14 || performance.now() - d.t > 900 || !d.el.isConnected || d.el.disabled) return;
        const under = document.elementFromPoint(e.clientX, e.clientY); if (!under || !(d.el === under || d.el.contains(under))) return;
        last = { el: d.el, t: performance.now() }; d.el.click();
      }, true);
      document.addEventListener('click', e => { if (e.isTrusted && last && performance.now() - last.t < 700) { e.stopPropagation(); e.preventDefault(); last = null; } }, true);
    }
    // ---- スマホ/ブラウザの「戻る」操作でも1つ前の画面へ ----
    try { history.pushState({ dl: 1 }, ''); window.addEventListener('popstate', () => {
      if (!$('overlay').classList.contains('hidden')) this.closeModal();
      else if (this.game.active) { if (!this.paused) this.pause(); }
      else if (this.screen !== 'menu' && this.screen !== 'title') this.back();
      else return; // メニューでは通常どおり
      history.pushState({ dl: 1 }, '');
    }); } catch (e) { }
    $('btnProfile').onclick = () => { AUDIO.nav(); this.open('profile'); };
    $('btnPause').onclick = () => this.pause();
    $('btnRotOk').onclick = () => { this.rotDismiss = true; $('rotateHint').classList.add('hidden'); };
    $('panelBody').addEventListener('click', e => this.onAction(e));
    $('overlay').addEventListener('click', e => this.onAction(e));
    $('panelBody').addEventListener('input', e => this.onInput(e)); $('panelBody').addEventListener('change', e => { if (e.target.tagName === 'SELECT') this.onInput(e); });
    $('overlay').addEventListener('input', e => this.onInput(e));
    for (const [id, nm, ev] of [['tLeft', 'left'], ['tRight', 'right'], ['tGas', 'gas'], ['tBrake', 'brake'], ['tHand', 'hand'], ['tNitro', 'nitro'], ['tUp', 'up', 1], ['tDown', 'down', 1], ['tCam', 'cam', 1]]) Input.bindTouch($(id), nm, !!ev);
    const gb = $('tGyro'); gb.addEventListener('click', e => { e.preventDefault(); AUDIO.click(); Gyro.toggle(); });
    $('tCal').addEventListener('click', e => { e.preventDefault(); AUDIO.click(); Gyro.calibrate(); this.toast('現在の傾きを中央にしました'); });
    Input.initTouch($('touch'));
    Input.onEndEv = k => { AUDIO.click(); if (k === 'gyro') Gyro.toggle(); else if (k === 'cal') { Gyro.calibrate(); this.toast('現在の傾きを中央にしました'); } };
    this.gyroChanged();
    AUDIO.listeners.push(tr => { const el = $('musicToast'); el.textContent = '♪ ' + tr.name; el.style.opacity = 1; clearTimeout(this._mt); this._mt = setTimeout(() => el.style.opacity = 0, 3500); if (this.screen === 'settings' && this.tab === 'sound') this.render(); });
    document.addEventListener('touchmove', e => { if (!e.target.closest || !e.target.closest('.panel,.modal,.menu-col')) e.preventDefault(); }, { passive: false });
    window.addEventListener('resize', () => this.checkRotate());
    this.menuItems();
  },
  gyroChanged() { this.applyCtrl(); const b = $('tGyro'); if (b) { b.innerHTML = '<span>GYRO<br>' + (Gyro.on ? 'ON' : 'OFF') + '</span>'; b.classList.toggle('act', Gyro.on); } if (this.paused) this.pause(true); else if (this.screen === 'settings' && this.tab === 'control') this.render(); },
  a_gyroToggle() { Gyro.toggle(); },
  // ---- タッチ操作の設定 ----
  applyCtrl() {
    const s = SAVE.data && SAVE.data.settings; if (!s) return; const B = document.body.classList;
    B.toggle('accAuto', s.accelMode === 'auto'); B.toggle('accToggle', s.accelMode === 'toggle'); B.toggle('steerSlide', s.steerMode === 'slide'); B.toggle('mirror', !!s.mirror);
    const t = $('touch'); if (t) { t.style.setProperty('--tbs', s.btnScale || 1); t.style.setProperty('--tbo', s.btnAlpha || 1); }
    const L = $('tLeft'), R = $('tRight'); if (L && R) { L.firstChild.textContent = s.mirror ? '▶' : '◀'; R.firstChild.textContent = s.mirror ? '◀' : '▶'; }
    const g = $('tGas'); if (g) g.firstChild.innerHTML = s.accelMode === 'toggle' ? 'GAS<br><small>タップでON/OFF</small>' : 'GAS';
    if (Input.refreshTouch) Input.refreshTouch();
  },
  ctrlPresetMatch() { const s = SAVE.data.settings; return (CTRL_PRESETS.find(p => Object.keys(p.v).every(k => String(s[k]) === String(p.v[k]))) || {}).id || 'custom'; },
  a_ctrlPreset(id) {
    const p = CTRL_PRESETS.find(x => x.id === id); if (!p) return; const s = SAVE.data.settings; Object.assign(s, p.v); s.ctrlPreset = id; SAVE.save();
    if (s.steerMode === 'gyro' && !Gyro.on) Gyro.enable(); else if (s.steerMode !== 'gyro' && Gyro.on) Gyro.disable();
    if (this.game.active) this.game.veh.auto = s.trans !== 'MT';
    for (const k of ['A', 'B', 'C']) document.body.classList.toggle('lay' + k, s.layout === k);
    this.applyCtrl(); this.toast('操作プリセット「' + p.name + '」にしました'); this.render();
  },
  a_ctrlTest() { const inst = SAVE.cur(); this.launch({ mode: 'free', mapId: 'akigiri', weather: 'clear', time: 'day', laps: 1, carInst: inst, rivals: [] }); },
  a_gyroCal() { if (!Gyro.on) return this.toast('ジャイロ操作がOFFです'); Gyro.calibrate(); this.toast('現在の傾きを中央にしました'); },
  saveStatus() { const t = saveLabel(); for (const id of ['saveSt', 'saveSt2']) { const e = $(id); if (e) { e.textContent = t; e.classList.toggle('warn', CLOUD.state === 'error'); } } },
  afterLoad() { if (this.screen === 'menu') this.goMenu(); else if (this.screen !== 'title' && this.screen !== 'race') this.render(); this.refreshTop(); },
  a_devMoney(v) { if (!DEV.owner) return; SAVE.addMoney(+v); SAVE.save(); AUDIO.buy(); this.toast(yen(+v) + ' を追加しました'); this.render(); },
  a_devAdvReset() { if (!DEV.owner) return; SAVE.data.advent = { y: 0, open: [] }; adventSync(); SAVE.save(); this.toast('アドベントカレンダーをリセットしました'); },
  a_devLevel() { if (!DEV.owner) return; SAVE.data.xp += 7500; SAVE.save(); this.toast('Lv.' + SAVE.level() + ' になりました'); this.render(); },
  a_devStory() { if (!DEV.owner) return; SAVE.data.story.cleared = STORY.map(s => s.id); SAVE.save(); this.toast('全話クリア扱いにしました（コース・車両が解放）'); this.render(); },
  showErr(title, e) {
    const msg = ((e && e.message) || String(e)) + '\n' + ((e && e.stack) || '').split('\n').slice(0, 3).join('\n');
    this.modal(`<h2>${esc(title)}</h2><div class="note" style="font-size:13px;line-height:1.8">エラーが発生しました。もう一度試すか、設定 → データ の「エラー情報」をコピーして送ってください。</div><textarea readonly style="height:70px">${esc(msg)}</textarea><div class="btns"><button class="btn pri" data-a="closeModal">OK</button></div>`);
  },
  a_copyErr() { const t = $('errLogText'); try { navigator.clipboard.writeText(t.value).then(() => this.toast('コピーしました'), () => { t.select(); this.toast('選択しました。手動でコピーしてください'); }); } catch (e) { t.select(); } },
  a_clearErr() { SAVE.data.errLog = []; SAVE.save(); this.render(); },
  a_lookChestPaint(id) { const it = ITEM_BY_ID[id]; if (!it || !invHas(id)) return; const inst = this.tuneInst(); inst.look.color = it.color; inst.look.paint = it.paint; if (!inst.look.owned.paint.includes(it.paint)) inst.look.owned.paint.push(it.paint); this.afterTune(); },
  a_setSpecial(id) { const inst = this.tuneInst(); if (id && !invHas(id)) return; inst.tune.special = id; this.toast(id ? ITEM_BY_ID[id].name + ' を装着しました' : '限定チューンを外しました'); this.afterTune(); },
  in_decalPos(val, el) { const inst = this.tuneInst(); const lk = inst.look; const id = el.dataset.id, k = el.dataset.k; lk.decalPos = lk.decalPos || {}; const di = lk.decals.indexOf(id); lk.decalPos[id] = Object.assign({ f: 'L', x: 0.2 + di * 0.18, y: 0.55, s: 1, r: 0 }, lk.decalPos[id] || {}, { [k]: +val });
    el.nextElementSibling.textContent = k === 'r' ? val + '°' : Math.round(val * 100) + '%'; SAVE.save(); clearTimeout(this._slT); this._slT = setTimeout(() => this.show.setCar(inst, true), 90); },
  a_decalFace(v) { const [id, f] = v.split(':'); const inst = this.tuneInst(); const lk = inst.look; lk.decalPos = lk.decalPos || {}; const di = lk.decals.indexOf(id); const cur = Object.assign({ x: 0.2 + di * 0.18, y: 0.55, s: 1, r: 0 }, lk.decalPos[id] || {}); cur.f = f; if (f !== 'L' && f !== 'R') { cur.x = 0.5; cur.y = 0.5; } else if (cur.y < 0.15) cur.y = 0.55; lk.decalPos[id] = cur; this.afterTune(); },
  a_decalReset(id) { const inst = this.tuneInst(); if (inst.look.decalPos) delete inst.look.decalPos[id]; this.afterTune(); },
  async a_fbLogin() { try { this.toast('ログイン画面を開いています…'); await window.DL_FB.google(); await window.DL_FB.loadProfile(); if (!window.DL_FB.profile.name) { this.toast('ログインしました！ユーザーネームを決めましょう'); this.open('account'); } else this.render(); } catch (e) { if (e && e.code === 'auth/popup-closed-by-user') return this.toast('ログインをキャンセルしました'); logErr('Googleログイン', e); this.toast('ログインできませんでした: ' + (e.code || e.message)); } },
  async a_fbLogout() { try { await window.DL_FB.logout(); this.toast('ログアウトしました（データはこの端末に残ります）'); } catch (e) { this.toast('ログアウトできませんでした'); } },
  a_netRetry() { NET.room = undefined; this.render(); },
  a_saveNow() { SAVE.save(true); CLOUD.flush(); this.toast('保存しました'); },
  touchUI() { const t = SAVE.data.settings.touchUI; return t === 'on' || (t === 'auto' && IS_TOUCH); },
  welcome() {
    this.modal(`<h2>ようこそ、DRIFT LEGENDSへ</h2><div class="note" style="font-size:13px;line-height:1.9">
      峠の走り屋として、各地のライバルに挑もう。<br>
      ・<b>STORY MODE</b> でライバルと峠バトル<br>・<b>TOUGE CHALLENGE</b> でドリフトスコアに挑戦<br>・<b>TIME ATTACK</b> でゴーストと競う<br>・賞金でチューニング＆新しい車を購入<br><br>
      ${IS_TOUCH ? 'スマホ：画面左右のボタンでハンドル、右下アクセル、左下ブレーキ。' : 'PC：W/S アクセル・ブレーキ、A/D ハンドル、Space サイドブレーキ、E ニトロ、C カメラ、Esc ポーズ。'}<br>
      ドリフトのコツ：コーナー手前でサイドブレーキ→アクセルを踏みながらカウンター。設定でドリフトアシストを調整できます。</div>
      <div class="btns"><button class="btn pri" data-a="closeModal">はじめる</button></div>`);
  },
  checkRotate() { const portrait = innerHeight > innerWidth; const racing = this.game.active; $('rotateHint').classList.toggle('hidden', !(racing && portrait && IS_TOUCH && !this.rotDismiss)); },
  // ---------------- 画面遷移 ----------------
  hideAll() { this.clearBuy(false); document.querySelectorAll('.screen').forEach(s => s.classList.remove('show')); },
  goMenu() {
    this.hideAll(); $('s-menu').classList.add('show'); this.screen = 'menu'; this.stack = []; $('hud').classList.add('hidden'); $('touch').classList.add('hidden'); document.body.classList.remove('racing');
    this.refreshTop(); const c = SAVE.cur(); this.show.setCar(c); this.show.active = true; this.show.region = 'menu';
    $('menuCarName').textContent = CAR_BY_ID[c.id].name; $('menuCarSub').textContent = CAR_BY_ID[c.id].maker + ' ・ ' + CAR_BY_ID[c.id].era;
    AUDIO.playCat(xmasThemeOn() ? 'xmas' : 'menu');
    this.menuItems();
    if (!SAVE.data.tutDone && (SAVE.data.stats.races || 0) === 0 && !this._tutShown) { this._tutShown = true; setTimeout(() => this.tutorial(false), 900); }
    this.socialPoll && this.socialPoll();
    if (SAVE.data.seenVersion !== GAME_VERSION && !this._newsShown) { this._newsShown = true; setTimeout(() => { if (this.screen === 'menu' && $('overlay').classList.contains('hidden')) this.open('news'); else this._newsShown = false; }, 700); }
  },
  menuItems() {
    const d = SAVE.data, A = adventInfo(); adventSync(); const xm = eventActive();
    const advOpen = A.day > 0 && Array.from({ length: A.day }, (_, k) => k + 1).some(k => !d.advent.open.includes(k));
    const freeChest = d.chest.freeDate !== jstDateKey();
    const T = (k, ic, jp, en, opt = {}) => `<button class="mt ${opt.cls || ''}" data-m="${k}"><span class="mt-ic">${ICO(ic, opt.col || '#ffcf3d', opt.big ? 34 : 26)}</span><span class="mt-tx"><b>${jp}</b><small>${en}</small>${opt.sub ? `<em>${opt.sub}</em>` : ''}</span>${opt.badge ? `<i class="mt-bd ${opt.bdc || ''}">${opt.badge}</i>` : ''}</button>`;
    let h = this.menuAccountHTML() + this.menuStatsHTML();
    if (xm || A.M === 12 || A.M === 11) h += `<button class="mm-ban" data-m="${advOpen ? 'advent' : xm ? 'events' : 'advent'}">${ICO(advOpen ? 'calendar' : 'tree', '#ffd76a', 30)}<span><b>${advOpen ? 'アドベントカレンダー：扉が開けられます！' : xm ? 'クリスマスイベント開催中' : 'アドベントカレンダー 12/1スタート'}</b><small>${A.M === 12 && A.D <= 25 ? `クリスマスまで あと${25 - A.D}日` : A.M === 12 ? 'メリークリスマス！' : '限定アイテムが毎日もらえる'}</small></span></button>`;
    h += `<div class="mm-sec">PLAY</div><div class="mm-grid">`;
    h += T('story', 'flag', 'ストーリー', 'STORY MODE  SEASON 1-3', { cls: 'hero', big: true, sub: `${d.story.cleared.length} / ${STORY.length} レベルクリア`, badge: 'S3' });
    h += T('time', 'clock', 'タイムアタック', 'TIME ATTACK') + T('touge', 'mountain', '峠チャレンジ', 'TOUGE CHALLENGE') + T('free', 'carSide', 'フリードライブ', 'FREE RUN') + T('race', 'flag', 'レース', 'RACE vs RIVAL', { col: '#ff4a4a', badge: 'NEW' }) + T('drag', 'flag2', 'ドラッグレース', 'DRAG RACE 0-400m', { col: '#ff6a3a', badge: 'NEW' }) + T('practice', 'drift', 'ドリフト練習場', 'DRIFT PRACTICE', { col: '#2fdc7a', badge: 'NEW' });
    if (!window.DL_STANDALONE) h += T('online', 'globe', 'オンライン対戦', 'ONLINE BATTLE', { col: '#5ad1ff' });
    if (window.DL_FB) h += T('ranking', 'trophy', '週間ランキング', 'WEEKLY RANKING', { col: '#ffcf3d', badge: 'NEW' });
    h += `</div><div class="mm-sec">CAR</div><div class="mm-grid">`;
    h += T('garage', 'garage', 'ガレージ', 'GARAGE') + T('tuning', 'wrench', 'チューニング', 'TUNING & CUSTOM') + T('shop', 'shop', 'カーショップ', 'CAR SHOP') + T('pshop', 'gear', 'パーツショップ', 'PARTS & EXTRAS', { badge: 'NEW' }) + T('diamond', 'gem', 'ダイヤ', 'DIAMOND SHOP & RACES', { col: '#9ad8ff', badge: diaRaces().some(c => !SAVE.data.diaCh[c.id]) ? 'RACE' : '' }) + T('bag', 'collection', 'バックパック', 'BACKPACK', { badge: (SAVE.data.medals.g + SAVE.data.medals.s + SAVE.data.medals.b) ? 'MEDAL' : '', bdc: 'g' }) + T('chest', 'gift', 'カードパック・ショップ', 'CARD PACKS & SHOP', { badge: freeChest ? 'FREE' : '', bdc: 'g' });
    h += `</div><div class="mm-sec">EVENT</div><div class="mm-grid">`;
    h += T('events', 'tree', 'イベント', 'EVENTS', { col: '#2fdc7a', badge: xm ? '開催中' : '' , bdc: 'g' }) + T('advent', 'calendar', 'アドベント', 'ADVENT CALENDAR', { col: '#ffd76a', badge: advOpen ? 'OPEN' : '' });
    h += T('ach', 'medal2', '実績', 'ACHIEVEMENTS', { col: '#ffcf3d', badge: achClaimable() ? '受取' : '' }) + T('codes', 'code', 'コード入力', 'REDEEM CODE', { col: '#9ad8ff' }) + T('tutorial', 'book', 'チュートリアル', 'HOW TO PLAY', { col: '#aab' });
    h += T('news', 'calendar', 'アップデート情報', 'UPDATE LOG  v' + GAME_VERSION, { col: '#5ad1ff', badge: SAVE.data.seenVersion !== GAME_VERSION ? 'NEW' : '' });
    h += `</div>` + T('settings', 'gear', '設定', 'SETTINGS', { cls: 'wide', col: '#aab' });
    if (DEV.owner) h += T('dev', 'wrench', '開発者メニュー', 'DEVELOPER MENU', { cls: 'wide dev', col: '#ffcf3d' });
    const el = $('menuList'); el.innerHTML = h;
    el.onclick = e => { const b = e.target.closest('[data-m]'); if (!b) return; AUDIO.nav(); const k = b.dataset.m; if (['time', 'touge', 'free', 'race'].includes(k)) this.open('maps', { mode: k }); else if (k === 'practice') this.startPractice(); else if (k === 'tutorial') this.tutorial(true); else this.open(k); };
  },
  menuAccountHTML() {
    const F = window.DL_FB; if (!F) return '';
    if (!F.isGoogle()) return `<button class="mm-acc" data-m="account">${ICO('globe', '#fff', 22)}<span><b>Googleでログイン</b><small>ランキングに参加・ユーザーネームを決めよう</small></span><i>LOGIN</i></button>`;
    const nm = F.profile && F.profile.name; const ttl = SAVE.data.title && ITEM_BY_ID[SAVE.data.title];
    if (!nm) return `<button class="mm-acc warn" data-m="account">${ICO('trophy', '#ffcf3d', 22)}<span><b>ユーザーネームを決めよう</b><small>決めるとランキングに参加できます</small></span><i>設定</i></button>`;
    return `<button class="mm-acc on" data-m="account">${ICO('trophy', '#ffcf3d', 22)}<span><b class="noi18n">${esc(nm)}</b><small>${ttl ? `<span class="ttl-badge">${esc(ttl.title)}</span> ` : ''}ランキング参加中 ・ タップで名前を変更</small></span><i>変更</i></button>`;
  },
  menuStatsHTML() {
    const st = SAVE.data.stats, ps = st.playSec || 0, mine = `<div class="ms-me">${ICO('clock', '#9aa0aa', 13)}<span>あなた：プレイ時間 <b>${Math.floor(ps / 3600)}時間${Math.floor(ps % 3600 / 60)}分</b> ・ レース <b>${(st.races || 0).toLocaleString()}</b>回</span></div>`;
    if (!window.DL_FB) return `<div class="mm-stats" id="mmStats">${mine}</div>`;
    const S = window.DL_FB.stats, n = v => v === null || v === undefined ? '—' : Number(v).toLocaleString();
    return `<div class="mm-stats" id="mmStats"><div class="ms-t">${ICO('globe', '#5ad1ff', 14)} みんなのプレイ状況</div><div class="ms-g"><div><b>${n(S.plays)}</b><small>プレイ回数</small></div><div><b>${n(S.players)}</b><small>プレイヤー</small></div><div><b>${n(S.races)}</b><small>レース回数</small></div><div class="on"><b>${n(S.online)}</b><small>いまオンライン</small></div></div>${mine}</div>`;
  },
  refreshMenuStats() { const e = $('mmStats'); if (e && this.screen === 'menu') e.outerHTML = this.menuStatsHTML(); },
  refreshTop() { const d = SAVE.data; const m = DEV.inf() ? '¥∞' : yen(d.money); $('tbMoney').textContent = m; $('tbMoney2').textContent = m; for (const id of ['tbDia', 'tbDia2']) { const e = $(id); if (e) e.innerHTML = ICO('gem', '#9ad8ff', 15) + ' ' + (d.diamonds || 0).toLocaleString(); } $('tbLevel').textContent = 'Lv.' + SAVE.level(); $('tbXp').style.width = ((d.xp % 1500) / 15) + '%'; },
  open(name, arg, push = true) {
    if (push && this.screen !== 'menu' && this.screen !== 'title') this.stack.push([this.screen, this.arg]);
    this.hideAll(); $('s-panel').classList.add('show'); this.screen = name; this.arg = arg; this.tab = null; this.sel = null; this.show.active = true; if (name === 'tuning') { this.tmode = null; this.tcat = null; }
    $('panelBody').scrollTop = 0; this.render(); this.refreshTop();
    if (name === 'garage' || name === 'tuning') AUDIO.playCat(xmasThemeOn() ? 'xmas' : 'garage');
  },
  back() { if (this.stack.length) { const [s, a] = this.stack.pop(); this.open(s, a, false); } else this.goMenu(); },
  render() {
    const fn = this['r_' + this.screen]; if (!fn) return; const body = $('panelBody'); const st = body.scrollTop;
    $('panelBody').classList.toggle('wide', false); $('stageInfo').innerHTML = '';
    try { body.innerHTML = fn.call(this, this.arg); } catch (e) { console.error(e); body.innerHTML = '<div class="note">表示エラーが発生しました。BACKで戻ってください。</div>'; }
    body.scrollTop = st; this.refreshTop();
  },
  onAction(e) {
    const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a, v = b.dataset.v;
    if (b.disabled || (a === 'noop' && b.closest('.lock,.locked'))) { AUDIO.locked(); return; }
    if (a !== 'noop') { if (SND_NAV.test(a)) AUDIO.nav(); else if (SND_OK.test(a)) AUDIO.confirm(); else if (SND_NG.test(a)) AUDIO.cancel(); else AUDIO.click(); }
    const fn = this['a_' + a]; if (fn) { try { if (GATED_ACTS.has(a)) this.runGated(a, v, b); else fn.call(this, v, b); } catch (err) { this._sim = null; this._gate = false; console.error(err); this.toast('エラー: ' + err.message); } }
  },
  // ---- 購入前のプレビューと購入確定 ----
  runGated(a, v, b) {
    const fn = this['a_' + a]; this._pend = null; this._gate = true; try { fn.call(this, v, b); } finally { this._gate = false; }
    const p = this._pend; this._pend = null; if (!p) return;
    let name = ''; if (b) { const c = b.cloneNode(true); c.querySelectorAll('.pr,.pc-pr,small,svg').forEach(x => x.remove()); name = c.textContent.replace(/\s+/g, ' ').trim(); }
    let preview = null;
    if (SIM_ACTS.has(a)) { const sim = JSON.parse(JSON.stringify(this.tuneInst())); this._sim = sim; try { fn.call(this, v, b); } finally { this._sim = null; } preview = sim; }
    else if (a === 'buyItem' && ITEM_BY_ID[v] && typeof itemApply === 'function') { const sim = JSON.parse(JSON.stringify(SAVE.cur())); itemApply(ITEM_BY_ID[v], sim, true); preview = sim; }
    else if (a === 'setExtra') { const sim = JSON.parse(JSON.stringify(this.tuneInst())); sim.look[this.exSlot === 2 && SAVE.data.exSlot2 ? 'extra2' : 'extra'] = v || ''; preview = sim; }
    this.confirmBuy({ name, price: p.price, cur: p.cur, preview, go: () => { this._ok = true; try { fn.call(this, v, b); } finally { this._ok = false; } } });
  },
  payDia(n) { const d = SAVE.data; if ((d.diamonds || 0) < n && !DEV.inf()) { AUDIO.error(); this.toast('ダイヤが足りません'); return false; } if (this._gate && !this._ok) { this._pend = { price: n, cur: 'dia' }; return false; } if (!DEV.inf()) d.diamonds -= n; return true; },
  confirmBuy(o) {
    this.pv = o; let bar = $('buyBar'); if (!bar) { bar = document.createElement('div'); bar.id = 'buyBar'; document.body.appendChild(bar); bar.addEventListener('click', e => this.onAction(e)); }
    const price = o.cur === 'dia' ? ICO('gem', '#9ad8ff', 16) + ' ' + o.price.toLocaleString() : yen(o.price);
    bar.innerHTML = `<div class="bb-l">${o.preview ? '<em>プレビュー中</em>' : '<em>購入の確認</em>'}<b>${esc(o.name || '')}</b>${o.desc ? `<small>${esc(o.desc)}</small>` : ''}</div><div class="bb-p ${o.cur === 'dia' ? 'dm' : ''}">${price}</div><button class="btn" data-a="buyCancel">キャンセル</button><button class="btn pri" data-a="buyConfirm">購入確定</button>`;
    bar.classList.add('show'); if (o.preview) this.show.setCar(o.preview, true);
  },
  clearBuy(restore = true) { const had = this.pv && this.pv.preview; this.pv = null; const bar = $('buyBar'); if (bar) bar.classList.remove('show'); if (had && restore) try { this.show.setCar(this.tuneInst(), true); } catch (e) { } },
  a_buyConfirm() { const o = this.pv; if (!o) return; this.clearBuy(false); o.go(); },
  a_buyCancel() { this.clearBuy(); },
  onInput(e) { const t = e.target; const a = t.dataset.in; if (!a) return; const fn = this['in_' + a]; if (fn) try { fn.call(this, t.type === 'checkbox' ? t.checked : t.value, t); } catch (err) { console.error(err); } },
  toast(t) { if (this._sim || (this._gate && this._pend)) return; const el = $('toast'); el.textContent = t; el.style.opacity = 1; clearTimeout(this._tt); this._tt = setTimeout(() => el.style.opacity = 0, 1800); },
  modal(html) { const o = $('overlay'); o.innerHTML = `<div class="modal">${html}</div>`; o.classList.remove('hidden'); },
  closeModal() { $('overlay').classList.add('hidden'); $('overlay').innerHTML = ''; },
  a_closeModal() { this.closeModal(); },
  stageInfo(html) { $('stageInfo').innerHTML = html; },
  // ---------------- 共通: ステータス表示 ----------------
  statBars(spec, base) {
    const s = spec.stats, b = base ? base.stats : null;
    const row = (lab, val, max, unit, bval, inv) => { const pct = clamp(val / max * 100, 0, 100); const bp = bval != null ? clamp(bval / max * 100, 0, 100) : pct; const diff = bval != null ? val - bval : 0; const good = inv ? diff < 0 : diff > 0;
      return `<div class="stat"><span>${lab}</span><span class="bar"><i style="width:${Math.min(pct, bp)}%"></i>${bval != null && Math.abs(diff) > 0.001 ? `<b style="left:${Math.min(pct, bp)}%;width:${Math.abs(pct - bp)}%;background:${good ? 'var(--green)' : '#ff5050'}"></b>` : ''}</span><span class="v ${diff ? (good ? 'up' : 'dn') : ''}">${typeof val === 'number' ? (unit === 's' ? val.toFixed(1) : Math.round(val)) : val}${unit && unit !== 's' ? unit : unit === 's' ? 's' : ''}</span></div>`; };
    const acc = `<div class="stat"><span>加速 0-100</span><span class="bar"><i style="width:${clamp((16 - s.accel) / 13 * 100, 2, 100)}%"></i></span><span class="v ${b && b.accel - s.accel > 0.05 ? 'up' : b && s.accel - b.accel > 0.05 ? 'dn' : ''}">${s.accel.toFixed(1)}s</span></div>`;
    return row('最高速度', s.top, 360, 'km/h', b && b.top) + acc
      + row('出力', s.power, 800, 'PS', b && b.power) + row('トルク', s.torque, 800, 'Nm', b && b.torque) + row('車両重量', s.weight, 1900, 'kg', b && b.weight, true)
      + row('ハンドリング', s.handling, 100, '', b && b.handling) + row('ドリフト性能', s.driftScore, 100, '', b && b.driftScore) + row('ブレーキ', s.brake, 100, '', b && b.brake)
      + `<div class="kv" style="margin-top:6px"><div>駆動方式</div><div>${s.drive}</div><div>ギア数</div><div>${s.gears}速</div></div>`;
  },
  instSpec(inst) { const car = CAR_BY_ID[inst.id]; return computeSpec(car, Object.assign({}, inst.tune, { _look: inst.look })); },
  carLine(c) { return `${c.maker} ・ ${c.era} ・ ${c.drive}`; },
  // ---------------- マップ選択 ----------------
  r_maps(arg) {
    const mode = arg.mode; $('panelTitle').textContent = { time: 'TIME ATTACK', touge: 'DRIFT CHALLENGE', free: 'FREE RUN', race: 'RACE', event: 'EVENT' }[mode];
    $('panelBody').classList.add('wide'); this.show.active = false;
    const all = MAPS.filter(m => (mode === 'free' || m.cat !== 'free') && m.cat !== 'drag' && m.cat !== 'event' && (m.cat !== 'xmas' || eventActive()));
    const MCAT = { all: [() => true, 'すべて'], new: [m => !!m.isNew, 'NEW'], touge: [m => m.env === 'mountain' && m.cat !== 'xmas', '峠'], highway: [m => m.env === 'highway', '高速道路'], city: [m => ['city', 'port', 'industrial', 'coast'].includes(m.env), '市街地・海沿い'], circuit: [m => m.env === 'circuit' || m.env === 'lot', 'サーキット・広場'], xmas: [m => m.cat === 'xmas', 'クリスマス'] };
    if (!this.mapCat || !MCAT[this.mapCat]) this.mapCat = 'all'; if (!this.mapSort) this.mapSort = 'new';
    let maps = all.filter(MCAT[this.mapCat][0]); if (!maps.length) { this.mapCat = 'all'; maps = all.slice(); }
    const idx = m => MAPS.indexOf(m); maps.sort(this.mapSort === 'new' ? (a, b) => idx(b) - idx(a) : this.mapSort === 'diff' ? (a, b) => a.diff - b.diff || idx(b) - idx(a) : this.mapSort === 'len' ? (a, b) => getTrack(b.id).length - getTrack(a.id).length : (a, b) => a.name.localeCompare(b.name));
    if (!this.sel || !maps.find(m => m.id === this.sel)) this.sel = maps.find(mapUnlocked).id;
    const m = MAP_BY_ID[this.sel];
    if (!this.mopt || this.mopt.map !== m.id) this.mopt = { map: m.id, weather: m.weather, time: m.time, laps: 3 };
    const tr = getTrack(m.id); const rec = SAVE.data.records;
    const best = mode === 'time' ? (rec.ta[m.id] ? fmtTime(rec.ta[m.id].best) : '--') : mode === 'touge' ? (rec.touge[m.id] ? rec.touge[m.id].best.toLocaleString() + ' pts' : '--') : '';
    const wx = { clear: ICO('sun', '#ffcf3d', 14) + ' 晴れ', rain: ICO('rain', '#9ad0ff', 14) + ' 雨', snow: ICO('snow', '#fff', 14) + ' 雪', fog: ICO('fog', '#aaa', 14) + ' 霧' }, tm = { day: '昼', evening: '夕方', night: '夜' };
    let html = `<div class="mode-tabs">${[['free', 'FREE RUN', 'フリー走行'], ['time', 'TIME ATTACK', 'タイムアタック'], ['race', 'RACE', 'ライバルと対戦'], ['touge', 'DRIFT CHALLENGE', '峠チャレンジ']].map(([k, a, b]) => `<button class="${k === mode ? 'on' : ''}" data-a="mapMode" data-v="${k}"><b>${a}</b><small>${b}</small></button>`).join('')}</div><div class="map-filter"><div class="mf-cats">${Object.entries(MCAT).filter(([k, v]) => all.some(v[0])).map(([k, v]) => `<button class="${this.mapCat === k ? 'on' : ''}" data-a="mapCat" data-v="${k}">${v[1]} <i>${all.filter(v[0]).length}</i></button>`).join('')}</div><div class="mf-sort">${[['new', '新しい順'], ['diff', '難易度順'], ['len', '距離が長い順'], ['name', '名前順']].map(([k, l]) => `<button class="${this.mapSort === k ? 'on' : ''}" data-a="mapSort" data-v="${k}">${l}</button>`).join('')}</div></div><div style="display:flex;gap:12px;flex-wrap:wrap"><div style="flex:2 1 320px;min-width:0"><div class="mapgrid">`;
    for (const mp of maps) {
      const un = mapUnlocked(mp); const t = TRACK_CACHE[mp.id];
      html += `<button class="mapcard ${mp.id === this.sel ? 'sel' : ''}" data-a="selMap" data-v="${mp.id}"><canvas width="160" height="120" data-thumb="${mp.id}"></canvas>${mp.isNew ? '<i class="map-new">NEW</i>' : ''}<span class="map-env">${{ mountain: '峠', highway: '高速', city: '市街地', port: '港', industrial: '工業', coast: '海沿い', circuit: 'サーキット', lot: '広場' }[mp.env] || ''}</span><div class="mn">${mp.jp}</div><div class="me">${mp.name}</div><div class="stars">${'★'.repeat(mp.diff)}${'☆'.repeat(5 - mp.diff)}</div>${un ? '' : `<div class="lock">${ICO('lock', '#fff', 26)}<br>${mapLockText(mp)}</div>`}</button>`;
    }
    html += `</div></div><div style="flex:1 1 260px;min-width:240px"><div class="h3">${m.jp} / ${m.name}</div><div class="note">${m.desc}</div>
      <div class="kv" style="margin:8px 0"><div>難易度</div><div class="stars">${'★'.repeat(m.diff)}${'☆'.repeat(5 - m.diff)}</div><div>距離</div><div>${(tr.length / 1000).toFixed(2)} km</div><div>コーナー数</div><div>${tr.corners.length}（ヘアピン ${tr.corners.filter(c => c.type === 'ヘアピン').length}）</div><div>標準天候</div><div>${wx[m.weather]} / ${tm[m.time]}</div><div>高低差</div><div>${Math.round(tr.maxY - tr.minY)} m</div>${best ? `<div>ベスト記録</div><div>${best}</div>` : ''}${mode === 'time' ? `<div>コースレコード</div><div>${fmtTime(Math.min(recordFor(m.id), rec.ta[m.id] ? rec.ta[m.id].best : 1e9))}</div>` : ''}</div>`;
    { const pb = rec.ta[m.id] ? fmtTime(rec.ta[m.id].best) : '--', pd = rec.touge[m.id] ? rec.touge[m.id].best.toLocaleString() + ' pts' : '--';
      const fe = m.feats || [tr.corners.filter(c => c.type === 'ヘアピン').length ? `ヘアピン ${tr.corners.filter(c => c.type === 'ヘアピン').length}` : '', tr.hasTunnel ? 'トンネル' : '', (tr.maxY - tr.minY) > 25 ? `高低差 約${Math.round((tr.maxY - tr.minY) / 10) * 10}m` : '', { mountain: '峠道', highway: '高速道路', city: '市街地', port: '港湾', industrial: '工業地帯', coast: '海沿い', circuit: 'サーキット', lot: '広場' }[m.env]].filter(Boolean);
      html += `<div class="map-chips">${fe.map(f => `<span>${f}</span>`).join('')}</div><div class="map-modes">${['FREE RUN', 'TIME ATTACK', 'RACE', 'DRIFT CHALLENGE'].map(x => `<span>${x}</span>`).join('')}</div><div class="kv" style="margin:6px 0"><div>ベストタイム</div><div>${pb}</div><div>ベストドリフト</div><div>${pd}</div></div>`; }
    if (mapUnlocked(m)) {
      html += `<div class="h3">天候</div><div class="opt-row">${Object.entries(wx).map(([k, l]) => `<button class="opt ${this.mopt.weather === k ? 'on' : ''}" data-a="mopt" data-v="weather:${k}">${l}</button>`).join('')}</div>
      <div class="h3">時間帯</div><div class="opt-row">${Object.entries(tm).map(([k, l]) => `<button class="opt ${this.mopt.time === k ? 'on' : ''}" data-a="mopt" data-v="time:${k}">${l}</button>`).join('')}</div>`;
      if (mode === 'time' || mode === 'race') html += `<div class="h3">周回数</div><div class="opt-row">${[1, 3, 5].map(n => `<button class="opt ${this.mopt.laps === n ? 'on' : ''}" data-a="mopt" data-v="laps:${n}">${n} LAP</button>`).join('')}</div>`;
      if (mode === 'touge') html += `<div class="note">エンドレス形式。ドリフトでポイントを稼ぎ、壁に当たるとダメージが蓄積。ダメージ100%または停止で終了。</div>`;
      if (mode === 'race') html += `<div class="note">ライバル1台と対戦。勝利で ${yen(qrPrize(m))}＋XP。</div>`;
      html += `<div class="btns"><button class="btn pri" data-a="toCarSel" style="flex:1">PLAY ▶ 車両選択へ</button></div>`;
    } else html += `<div class="note" style="color:#ff8080">${ICO('lock', '#ff8080', 14)} ${mapLockText(m)}</div>`;
    html += `</div></div>`;
    setTimeout(() => this.drawThumbs(), 0);
    return html;
  },
  drawThumbs() {
    const cvs = [...document.querySelectorAll('canvas[data-thumb]')]; let i = 0;
    const next = () => { if (i >= cvs.length) return; const cv = cvs[i++]; if (!cv.isConnected) return next(); this.drawThumb(cv, cv.dataset.thumb); setTimeout(next, 0); };
    next();
  },
  drawThumb(cv, id) {
    const tr = getTrack(id), m = MAP_BY_ID[id], g = cv.getContext('2d'); const W = cv.width, H = cv.height;
    const bg = { mountain: ['#0d2014', '#16301e'], highway: ['#0b0d18', '#141a2c'], city: ['#120b1a', '#1d1430'], port: ['#08141e', '#0f2232'], industrial: ['#15110a', '#251c10'], coast: ['#08182a', '#103050'], circuit: ['#0d1e10', '#183018'], lot: ['#141414', '#222'] }[m.env];
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, bg[0]); gr.addColorStop(1, bg[1]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (m.xmas) { g.fillStyle = 'rgba(255,255,255,.6)'; for (let k = 0; k < 40; k++) g.fillRect((k * 37) % W, (k * 53) % H, 1.5, 1.5); }
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9; for (let k = 0; k < tr.n; k += 4) { mnx = Math.min(mnx, tr.X[k]); mxx = Math.max(mxx, tr.X[k]); mnz = Math.min(mnz, tr.Z[k]); mxz = Math.max(mxz, tr.Z[k]); }
    const sc = Math.min((W - 20) / (mxx - mnx), (H - 20) / (mxz - mnz)); const ox = (W - (mxx - mnx) * sc) / 2, oz = (H - (mxz - mnz) * sc) / 2;
    g.lineJoin = 'round'; g.beginPath(); for (let k = 0; k <= tr.n; k += 3) { const j = k % tr.n; const x = ox + (tr.X[j] - mnx) * sc, y = oz + (tr.Z[j] - mnz) * sc; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath();
    g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 6; g.stroke(); g.strokeStyle = m.xmas ? '#ff5a5a' : '#e8e8ea'; g.lineWidth = 2.5; g.stroke();
    const sx = ox + (tr.X[0] - mnx) * sc, sy = oz + (tr.Z[0] - mnz) * sc; g.fillStyle = '#e10600'; g.beginPath(); g.arc(sx, sy, 4, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.font = 'bold 10px Orbitron, sans-serif'; g.fillText((tr.length / 1000).toFixed(1) + 'km', 6, H - 6);
  },
  a_selMap(v) { this.sel = v; this.render(); },
  a_mopt(v) { const [k, val] = v.split(':'); this.mopt[k] = k === 'laps' ? +val : val; this.render(); },
  a_mapMode(v) { this.arg.mode = v; this.render(); },
  a_mapCat(v) { this.mapCat = v; AUDIO.nav && AUDIO.nav(); this.render(); },
  a_mapSort(v) { this.mapSort = v; AUDIO.nav && AUDIO.nav(); this.render(); },
  a_toCarSel() { this.open('carsel', { mode: this.arg.mode, mapId: this.sel, weather: this.mopt.weather, time: this.mopt.time, laps: this.mopt.laps }); },
  // ---------------- 車両選択 ----------------
  r_carsel(cfg) {
    $('panelTitle').textContent = 'SELECT CAR'; const d = SAVE.data;
    if (!this.sel) this.sel = d.current; const inst = d.cars.find(c => c.uid === this.sel) || SAVE.cur(); this.show.setCar(inst);
    const spec = this.instSpec(inst); const car = CAR_BY_ID[inst.id];
    let html = `<div class="note">コース: <b>${MAP_BY_ID[cfg.mapId].jp}</b></div><div class="list" style="margin-top:8px">`;
    for (const c of this.sortedCars()) { const cd = CAR_BY_ID[c.id]; html += `<button class="item ${c.uid === inst.uid ? 'sel' : ''}" data-a="selCarSel" data-v="${c.uid}"><div class="grow"><div class="t">${cd.name}${c.fav ? '<span class="tag fav">★</span>' : ''}${c.uid === d.current ? '<span class="tag cur">使用中</span>' : ''}</div><div class="s">${this.carLine(cd)}</div></div><div class="p">${Math.round(this.instSpec(c).hp)}PS</div></button>`; }
    html += `</div><div class="h3">${car.name}</div>${this.statBars(spec)}<div class="btns"><button class="btn pri" data-a="startRace" style="flex:1">START ▶</button></div>`;
    this.stageInfo(`<div class="car-name">${car.name}</div><div class="car-sub">${this.carLine(car)}</div>`);
    return html;
  },
  sortedCars() { return SAVE.data.cars.slice().sort((a, b) => (b.fav - a.fav)); },
  a_selCarSel(v) { this.sel = v; this.render(); },
  a_startRace() {
    const cfg = this.arg; const inst = SAVE.data.cars.find(c => c.uid === this.sel) || SAVE.cur(); SAVE.data.current = inst.uid; SAVE.save();
    if (cfg.mode === 'race') { const m = MAP_BY_ID[cfg.mapId]; const names = ['峠の 白い影', '高架の 流星', '夜明けの 稲妻', '湾岸の 黒い風']; const rv = { name: names[(m.seed || 0) % names.length], team: 'RIVAL', car: inst.id, color: '#20232a', skill: Math.min(0.93, 0.76 + m.diff * 0.03) };
      return this.launch({ mode: 'event', quick: true, evRace: { title: 'RACE ・ ' + m.jp, prize: qrPrize(m) }, mapId: cfg.mapId, weather: cfg.weather, time: cfg.time, laps: cfg.laps || 1, carInst: inst, rivals: [rv] }); }
    this.launch({ mode: cfg.mode, mapId: cfg.mapId, weather: cfg.weather, time: cfg.time, laps: cfg.mode === 'time' ? cfg.laps : 1, carInst: inst, rivals: [] });
  },
  launch(cfg) {
    if (window.DL_FB && !cfg._retry) window.DL_FB.countRace();
    this.closeModal(); if (!cfg._retry) LOADER.show('LOADING ' + MAP_BY_ID[cfg.mapId].name);
    this.lastCfg = cfg;
    setTimeout(() => {
      try { this.show.active = false; this.game.start(cfg); }
      catch (e) {
        logErr('コース読込(' + cfg.mode + '/' + cfg.mapId + ')', e); try { this.game.exit(); } catch (x) { }
        // 端末のメモリ不足などに備え、軽量設定で自動的にもう一度試す
        const s = SAVE.data.settings;
        if (!cfg._retry && s.quality > 0) { cfg._retry = true; s.quality = 0; SAVE.save(); $('loadText').textContent = '軽量モードで再読み込み中…'; return setTimeout(() => this.launch(cfg), 50); }
        LOADER.hide(0); this.goMenu(); this.showErr('コースを読み込めませんでした', e); return;
      }
      LOADER.hide(); if (cfg._retry) this.toast('画質を「低」にして読み込みました');
    }, 120);
  },

  // ---------------- カードパック・日替わりショップ ----------------
  r_chest() {
    $('panelTitle').textContent = 'CARD PACKS & SHOP'; const d = SAVE.data; if (!this.tab) this.tab = 'chest'; this.show.setCar(SAVE.cur());
    const tabs = [['chest', ICO('gift', '#ffcf3d', 16) + ' カードパック'], ['shop', ICO('shop', '#ffcf3d', 16) + ' 日替わり'], ['col', ICO('collection', '#ffcf3d', 16) + ' コレクション'], ['bg', ICO('image', '#ffcf3d', 16) + ' ホーム背景']];
    let html = `<div class="tabs">${tabs.map(([k, n]) => `<button class="tab ${this.tab === k ? 'on' : ''}" data-a="setTab" data-v="${k}">${n}</button>`).join('')}</div>`;
    const rb = r => `<span class="rar" style="background:${RARITY[r].color}">${RARITY[r].name}</span>`;
    if (this.tab === 'chest') { html += this.packChestHTML(); } if (false) {
      const today = jstDateKey(); const freeOk = d.chest.freeDate !== today;
      html += `<div class="note">カードパックを開けると、限定のデカール・カラー・ホイール・ネオン・キャリパー・チューニングパーツ・ホーム背景・特別な限定車のどれか1つが出ます。すでに持っているアイテムが出た場合はレア度に応じて¥に換金されます。</div>`;
      for (const c of CHESTS) {
        const can = c.daily ? freeOk : true;
        html += `<div class="chest" style="--cc:${c.color}"><div class="ch-top"><div class="ch-ic">${chestIcon(c, 50)}</div><div class="ch-nm">${c.name}<small>${c.daily ? (freeOk ? '本日 1回無料' : '明日 0:00（日本時間）に再び開けられます') : yen(c.price)}</small></div>
          ${c.daily ? `<button class="btn pri" data-a="openChest" data-v="${c.id}:1" ${can ? '' : 'disabled'}>${freeOk ? '無料で開ける' : '受取済み'}</button>` : ''}</div>${c.daily ? '' : `<div class="ch-multi">${[1, 3, 5, 10].map(n => `<button class="btn ${n === 10 ? 'gold' : 'pri'}" data-a="openChest" data-v="${c.id}:${n}"><b>×${n}</b><small>${yen(c.price * n)}</small></button>`).join('')}</div>`}
          <table class="odds"><tr>${RAR_ORDER.map(r => `<th style="color:${RARITY[r].color}">${RARITY[r].name}</th>`).join('')}</tr><tr>${RAR_ORDER.map(r => `<td>${c.odds[r] || 0}%</td>`).join('')}</tr></table></div>`;
      }
      const cnt = {}; ITEMS.forEach(i => cnt[i.rarity] = (cnt[i.rarity] || 0) + 1);
      html += `<div class="h3">提供割合について</div><div class="note">上の表は各カードパックでそのレア度が出る確率です。レア度が決まった後、そのレア度のアイテムの中から均等な確率で1つ選ばれます。<br>${RAR_ORDER.map(r => `${RARITY[r].name}: ${cnt[r]}種類（1種あたり最大 ${(Math.max(...CHESTS.map(c => c.odds[r] || 0)) / cnt[r]).toFixed(2)}%）・重複時 ${yen(RARITY[r].dup)}`).join('<br>')}</div>`;
    }
    if (this.tab === 'shop') {
      const key = srvDateKey(); if (d.shopBuy.date !== key) { d.shopBuy = { date: key, ids: [] }; }
      const items = dailyShop(key); const left = srvMsToMidnight(); clearInterval(this._shopT); this._shopT = setInterval(() => { const el = document.getElementById('shopLeft'); if (!el) return clearInterval(this._shopT); const l = srvMsToMidnight(); el.textContent = `${Math.floor(l / 3600000)}:${String(Math.floor(l / 60000) % 60).padStart(2, '0')}:${String(Math.floor(l / 1000) % 60).padStart(2, '0')}`; if (l < 1500) setTimeout(() => this.render(), 1600); }, 1000);
      html += `<div class="note">毎日 0:00（日本時間）に品揃えが入れ替わります。次の更新まで <b id="shopLeft">${Math.floor(left / 3600000)}時間${Math.floor(left / 60000) % 60}分</b></div><div class="shop-grid">`;
      for (const it of items) { const bought = d.shopBuy.ids.includes(it.id) || invHas(it.id); const pr = RARITY[it.rarity].shop;
        html += `<div class="sitem" style="border-color:${RARITY[it.rarity].color}"><div class="si-ic">${this.itemIcon(it, 52)}</div><div class="si-nm">${esc(it.name)}</div>${rb(it.rarity)}<div class="si-ty">${ITEM_TYPES[it.type]}${it.desc ? '・' + it.desc : ''}</div><button class="btn ${bought ? '' : 'pri'}" data-a="shopBuy" data-v="${it.id}" ${bought ? 'disabled' : ''}>${bought ? '所持済み' : yen(pr)}</button></div>`; }
      html += `</div>`;
    }
    if (this.tab === 'col') {
      const own = ITEMS.filter(i => invHas(i.id)).length;
      html += `<div class="note">コレクション ${own} / ${ITEMS.length}</div>`;
      for (const t of Object.keys(ITEM_TYPES)) { const list = ITEMS.filter(i => i.type === t); const o = list.filter(i => invHas(i.id)).length;
        html += `<div class="h3">${ITEM_TYPES[t]}（${o}/${list.length}）</div><div class="col-grid">${list.map(i => { const h = invHas(i.id); return `<div class="citem ${h ? '' : 'lock'}" style="border-color:${RARITY[i.rarity].color}" title="${esc(i.name)}"><div class="si-ic">${h ? this.itemIcon(i, 36) : ICO('lock', '#555', 26)}</div><div class="ci-nm">${h ? esc(i.name) : '未入手'}</div></div>`; }).join('')}</div>`; }
    }
    if (this.tab === 'bg') {
      const cur = d.settings.bg || 'garage';
      html += `<div class="note">ホーム画面（ガレージ）の背景を変更できます。限定背景はカードパックや日替わりショップで入手できます。</div><div class="opt-row">`;
      html += Object.keys(BG_THEMES).map(k => { const it = ITEM_BY_ID['bg_' + k]; const h = k === 'garage' || (it && invHas(it.id)); return `<button class="opt ${cur === k ? 'on' : ''}" data-a="setBg" data-v="${k}" ${h ? '' : 'disabled'}>${it ? bgIcon(it, 30) : bgIcon({ bg: 'garage' }, 30)} ${h ? '' : ICO('lock', '#888', 14)}${BG_THEMES[k].name || 'ガレージ'}${it ? `<span class="pr" style="color:${RARITY[it.rarity].color}">${RARITY[it.rarity].name}</span>` : '<span class="pr">標準</span>'}</button>`; }).join('');
      html += `</div>`;
    }
    return html;
  },
  itemIcon(it, size) {
    return itemIconSvg(it, arguments[1] || 34);
  },
  a_openChest(v) {
    const [id, ns] = String(v).split(':'); const n = Math.max(1, Math.min(10, +ns || 1)); const c = CHESTS.find(x => x.id === id); const d = SAVE.data; if (!c) return;
    if (c.daily) { if (d.chest.freeDate === jstDateKey()) return this.toast('本日の無料カードパックは受取済みです'); d.chest.freeDate = jstDateKey(); }
    else if (!SAVE.spend(c.price * n)) return;
    const res = [], bonus = []; d.boosts = d.boosts || {}; for (let k = 0; k < (c.daily ? 1 : n); k++) { let cc = c; if (d.boosts.luck > 0) { d.boosts.luck--; const o = Object.assign({}, c.odds); const take = (o.C || 0) * 0.5 + (o.U || 0) * 0.3; o.C = (o.C || 0) * 0.5; o.U = (o.U || 0) * 0.7; const hiSum = RAR_ORDER.filter(r => r !== 'C' && r !== 'U').reduce((s, r) => s + (o[r] || 0), 0) || 1; for (const r of RAR_ORDER) if (r !== 'C' && r !== 'U') o[r] = (o[r] || 0) + take * (o[r] || 0) / hiSum; cc = Object.assign({}, c, { odds: o }); } const it = rollChest(cc); res.push({ it, g: grantChestItem(it) }); if (c.daily || Math.random() < 0.2) { const cn = randCons(Math.random, !!c.daily); giveCons(cn.id); bonus.push(cn); } }
    if (bonus.length) setTimeout(() => this.toast('おまけ：' + bonus.map(b => b.name).join('・') + ' をバックパックに追加'), 1600);
    d.stats.chests = (d.stats.chests || 0) + res.length; SAVE.save(); this.refreshTop(); const hi = Math.max(...res.map(r => RAR_ORDER.indexOf(r.it.rarity))); AUDIO.chestOpen(hi);
    if (res.length === 1) { const { it, g } = res[0], rc = RARITY[it.rarity].color;
      this.modal(`<div class="chest-open" style="--rc:${rc}"><div class="co-box">${chestIcon(c, 120)}</div><div class="co-res"><div class="co-ic">${this.itemIcon(it, 72)}</div><div class="co-rar" style="color:${rc}">${RARITY[it.rarity].name}</div><div class="co-nm">${esc(it.name)}</div><div class="co-ty">${ITEM_TYPES[it.type]}${it.desc ? '・' + it.desc : ''}</div><div class="co-new">${g.isNew ? 'NEW!' : `重複 → ${yen(g.refund)} に換金`}</div></div></div>
        <div class="btns"><button class="btn" data-a="closeChest">OK</button>${c.daily ? '' : `<button class="btn pri" data-a="openChest" data-v="${c.id}:1">もう1回（${yen(c.price)}）</button>`}</div>`); }
    else { const refund = res.reduce((s, r) => s + (r.g.refund || 0), 0), news = res.filter(r => r.g.isNew).length;
      this.modal(`<h2>${chestIcon(c, 32)} ${esc(c.name)} ×${n}</h2><div class="multi-res">${res.map((r, k) => `<div class="mr" style="--rc:${RARITY[r.it.rarity].color};animation-delay:${0.9 + k * 0.12}s">${this.itemIcon(r.it, 40)}<b>${esc(r.it.name)}</b><small>${RARITY[r.it.rarity].name}${r.g.isNew ? ' ・ NEW!' : ''}</small></div>`).join('')}</div><div class="note" style="text-align:center">新しいアイテム ${news}個${refund ? ` ・ 重複の換金 ${yen(refund)}` : ''}</div><div class="btns"><button class="btn" data-a="closeChest">OK</button><button class="btn pri" data-a="openChest" data-v="${c.id}:${n}">もう${n}回（${yen(c.price * n)}）</button></div>`); }
    if (res.some(r => r.it.type === 'car')) this.toast('ガレージに限定車が追加されました！');
  },
  a_closeChest() { this.closeModal(); this.render(); },
  a_shopBuy(id) {
    const it = ITEM_BY_ID[id]; const d = SAVE.data; if (!it || invHas(id) || d.shopBuy.ids.includes(id)) return;
    if (!SAVE.spend(RARITY[it.rarity].shop)) return; grantChestItem(it); d.shopBuy.ids.push(id); SAVE.save(); AUDIO.buy ? AUDIO.buy() : 0; this.toast(it.name + ' を購入しました'); this.render();
  },
  a_setBg(k) { if (k !== 'garage' && !invHas('bg_' + k)) return; SAVE.data.settings.bg = k; SAVE.save(); this.show.rebuildStudio(); this.toast('ホーム背景を「' + (BG_THEMES[k].name || 'ガレージ') + '」に変更しました'); this.render(); },
  // ---------------- パーツショップ ----------------
  r_pshop() {
    $('panelTitle').textContent = 'PARTS SHOP'; const inst = SAVE.cur(), car = CAR_BY_ID[inst.id], lk = inst.look, t = inst.tune; this.show.setCar(inst);
    if (!this.tab) this.tab = 'wheel';
    const tabs = [['wheel', 'ホイール'], ['tire', 'タイヤ'], ['body', 'ボディキット'], ['engine', 'エンジン'], ['extra', 'エキストラ'], ['cons', '消費アイテム'], ['items', 'カスタムアイテム'], ['music', '音楽']];
    let h = `<div class="note">「${esc(car.name)}」に取り付けます（ガレージで車を変えると、その車のパーツになります）。購入済みのパーツは無料で付け替えできます。</div>`;
    h += `<div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${this.tab === k ? 'on' : ''}" data-a="setTab" data-v="${k}">${l}</button>`).join('')}</div>`;
    const card = (on, owned, icon, name, sub, price, act, val) => `<button class="pcard ${on ? 'on' : ''}" data-a="${act}" data-v="${val}"><span class="pc-ic">${icon}</span><span class="pc-tx"><b>${name}</b><small>${sub || ''}</small></span><span class="pc-pr">${on ? '装着中' : owned ? '購入済み' : yen(price)}</span></button>`;
    if (this.tab === 'wheel') {
      const ws = WHEEL_STYLES.filter(w => !w.xmas && !w.chest && (!w.only || car.series === w.only));
      h += `<div class="pgrid">${ws.map(w => card(lk.wheel === w.id, lk.owned.wheel.includes(w.id), wheelIcon({ spokes: w.spokes || 5, rim: w.rim || '#c8c8cc', deep: w.deep }, 40), w.name, (w.spokes ? w.spokes + '本スポーク' : 'スチール') + (w.deep ? '・深リム' : ''), w.price, 'lookWheel', w.id)).join('')}</div>`;
      h += `<div class="note">ホイールの色はカスタマイズ画面で変えられます。限定ホイールはカードパック・イベントで手に入ります。</div>`;
    }
    if (this.tab === 'tire') {
      h += `<div class="pgrid">${PARTS.tire.opts.map(o => card(t.tire === o.id, t.owned.tire.includes(o.id), ICO('tire', '#ffcf3d', 36), o.name, `グリップ ${Math.round(o.mu * 100)} ・ 滑りやすさ ${Math.round(o.slide * 100)} ・ 雨 ${Math.round(o.wet * 100)} ・ 雪 ${Math.round(o.snow * 100)}`, o.price, 'tuneOpt', 'tire:' + o.id)).join('')}</div>`;
    }
    if (this.tab === 'body') {
      h += styleRow(lk) + kitRow(lk) + hlColRow(lk);
      for (const k of ['wing', 'front', 'rear', 'side', 'hood', 'roof', 'trunk', 'fender', 'hl']) { const A = AERO[k]; lk.owned[k] = lk.owned[k] || [0];
        h += `<div class="h3">${A.label}</div><div class="pgrid">${A.opts.map(([nm, pr, o2], i) => (o2 && o2.only && car.series !== o2.only) ? '' : card((lk[k] || 0) === i, lk.owned[k].includes(i), ICO(k === 'wing' ? 'wing' : k === 'front' || k === 'hl' ? 'carFront' : k === 'roof' || k === 'hood' ? 'carSide' : 'carSide', '#ffcf3d', 32), nm, '', pr, 'lookOpt', k + ':' + i)).join('')}</div>`; }
    }
    if (this.tab === 'cons') { const d = SAVE.data;
      h += `<div class="note">買ったアイテムはバックパックの「消費アイテム」から使えます。効果は時間制（リアルタイム）です。</div><div class="pgrid">${CONSUMABLES.filter(c => c.price).map(c => `<button class="pcard" data-a="buyCons" data-v="${c.id}:money"><span class="pc-ic">${consIcon(c, 40)}</span><span class="pc-tx"><b>${esc(c.name)}${(d.cons || {})[c.id] ? ' <small>（所持 ' + d.cons[c.id] + '）</small>' : ''}</b><small>${esc(c.desc)}</small></span><span class="pc-pr">${yen(c.price)}</span></button>`).join('')}</div>`;
    }
    if (this.tab === 'engine') {
      h += `<div class="pgrid">${PARTS.engine.opts.map(o => card(t.engine === o.id, t.owned.engine.includes(o.id), ICO(o.id.includes('turbo') ? 'turbo' : o.id.includes('super') || o.id === 'twin' ? 'gear' : 'engine', '#ffcf3d', 36), o.name, o.id === 'stock' ? '' : 'ランキング対象（通常のエンジン強化）', o.price, 'tuneOpt', 'engine:' + o.id)).join('')}</div>`;
      h += `<div class="note">ECUや吸排気などの細かい強化はチューニング画面から。</div>`;
    }
    if (this.tab === 'extra') {
      const d = SAVE.data, sl = this.exSlot === 2 && d.exSlot2 ? 2 : 1, key = sl === 2 ? 'extra2' : 'extra', cur = lk[key] || '', other = lk[sl === 2 ? 'extra' : 'extra2'] || '';
      h += `<div class="note" style="color:#ffcf3d">エキストラは<b>2つ</b>まで装着できます（2つ目のスロットはダイヤで解放）。レース中は<b>ブースト（NITRO）ボタン</b>で両方が同時に作動します。<br>${ICO('lock', '#ff8a8a', 12)} マークのもの（ジェット・ロケットなど）を装着中は、<b>週間ランキングに記録されません</b>。</div>`;
      h += `<div class="exslots">${[1, 2].map(n => { const id = lk[n === 2 ? 'extra2' : 'extra'], e = EXTRA_BY_ID[id]; const locked = n === 2 && !d.exSlot2; return `<button class="exslot ${sl === n ? 'on' : ''} ${locked ? 'lock' : ''}" data-a="${locked ? 'unlockExSlot' : 'exSlot'}" data-v="${n}"><small>スロット${n}</small>${locked ? `${ICO('lock', '#9ad8ff', 22)}<b>${ICO('gem', '#9ad8ff', 13)} ${EX_SLOT2_COST} で解放</b>` : e ? `${extraIcon(e, 30)}<b>${esc(e.name)}</b>` : '<b>なし</b>'}</button>`; }).join('')}</div>`;
      h += `<div class="pgrid">${card(!cur, true, ICO('gear', '#888', 32), 'なし', sl === 1 ? 'ブーストボタンは通常のニトロになります' : 'スロット2を空にする', 0, 'setExtra', '')}${EXTRAS.filter(e => (!e.dia || d.extras.includes(e.id)) && e.id !== other).map(e => card(cur === e.id, d.extras.includes(e.id), extraIcon(e, 40), (e.perf ? ICO('lock', '#ff8a8a', 12) + ' ' : '') + e.name, e.desc, e.price, 'setExtra', e.id)).join('')}</div>`;
    }
    if (this.tab === 'items') {
      const types = ['kit', 'wheel', 'neon', 'paint', 'decal', 'meter', 'plate', 'caliper']; if (!this.psType || !types.includes(this.psType)) this.psType = 'kit';
      h += `<div class="opt-row">${types.map(t => `<button class="opt ${this.psType === t ? 'on' : ''}" data-a="psType" data-v="${t}">${ITEM_TYPES[t]}</button>`).join('')}</div>`;
      const list = ITEMS.filter(i => i.type === this.psType && !i.lim).sort((a, b) => RAR_ORDER.indexOf(a.rarity) - RAR_ORDER.indexOf(b.rarity));
      h += `<div class="note">ショップで買ったアイテムはカスタマイズ画面で装着できます（カードパックからも出ます）。</div><div class="pgrid">${list.map(i => { const own = invHas(i.id); return `<button class="pcard ${own ? 'on' : ''}" data-a="${own ? 'noop' : 'buyItem'}" data-v="${i.id}"><span class="pc-ic">${this.itemIcon(i, 38)}</span><span class="pc-tx"><b>${esc(i.name)}</b><small style="color:${RARITY[i.rarity].color}">${RARITY[i.rarity].name}${i.desc ? ' ・ ' + esc(i.desc) : ''}</small></span><span class="pc-pr">${own ? '所持済み' : yen(Math.round(RARITY[i.rarity].shop * 0.9))}</span></button>`; }).join('')}</div>`;
    }
    if (this.tab === 'music') {
      h += `<div class="note">買った曲はレース中のBGMに加わり、ミュージックプレイヤー（設定 → サウンド）で選べます。カードパック限定・ダイヤ限定の曲もあります。</div><div class="pgrid">${MUSIC_SHOP.map(([id, pr]) => { const it = ITEM_BY_ID[id], own = invHas(id); return `<button class="pcard ${own ? 'on' : ''}" data-a="${own ? 'playItemMusic' : 'buyMusic'}" data-v="${id}"><span class="pc-ic">${ICO('music', '#ff8ad8', 34)}</span><span class="pc-tx"><b>${esc(it.name)}</b><small>${own ? 'タップで再生' : 'ショップ限定曲'}</small></span><span class="pc-pr">${own ? '所持済み' : yen(pr)}</span></button>`; }).join('')}</div>`;
      const ch = ITEMS.filter(i => i.type === 'music' && !i.lim); h += `<div class="h3">カードパック限定の曲</div><div class="pgrid">${ch.map(i => `<div class="pcard ${invHas(i.id) ? 'on' : ''}"><span class="pc-ic">${ICO('gift', '#ffcf3d', 30)}</span><span class="pc-tx"><b>${esc(i.name)}</b><small style="color:${RARITY[i.rarity].color}">${RARITY[i.rarity].name}</small></span><span class="pc-pr">${invHas(i.id) ? '所持済み' : 'カードパック限定'}</span></div>`).join('')}</div>`;
    }
    this.stageInfo(`<div class="car-name">${car.name}</div><div class="car-sub">${[lk.extra, SAVE.data.exSlot2 ? lk.extra2 : ''].filter(x => x && EXTRA_BY_ID[x]).map(x => EXTRA_BY_ID[x].name).join(' ＋ ') ? 'エキストラ: ' + [lk.extra, SAVE.data.exSlot2 ? lk.extra2 : ''].filter(x => x && EXTRA_BY_ID[x]).map(x => EXTRA_BY_ID[x].name).join(' ＋ ') : ''}</div>`);
    return h;
  },
  a_psType(t) { this.psType = t; this.render(); },
  a_buyItem(id) { const it = ITEM_BY_ID[id]; if (!it || it.lim || invHas(id)) return; if (!SAVE.spend(Math.round(RARITY[it.rarity].shop * 0.9))) return; grantChestItem(it); SAVE.save(); AUDIO.buy(); this.toast(it.name + ' を購入しました'); this.render(); },
  a_buyMusic(id) { const e = MUSIC_SHOP.find(x => x[0] === id); if (!e || invHas(id)) return; if (!SAVE.spend(e[1])) return; grantChestItem(ITEM_BY_ID[id]); SAVE.save(); AUDIO.buy(); this.toast(ITEM_BY_ID[id].name + ' を購入しました'); this.a_playItemMusic(id); this.render(); },
  a_playItemMusic(id) { const it = ITEM_BY_ID[id]; if (it && it.track && invHas(id)) { AUDIO.play(it.track); this.toast('♪ ' + it.name); } },
  a_exSlot(n) { this.exSlot = +n; this.render(); },
  a_unlockExSlot() { const d = SAVE.data; if (d.exSlot2) return; if ((d.diamonds || 0) < EX_SLOT2_COST && !DEV.inf()) { AUDIO.error(); return this.toast('ダイヤが足りません（' + EX_SLOT2_COST + '必要）'); }
    this.confirmBuy({ name: 'エキストラ スロット2', price: EX_SLOT2_COST, cur: 'dia', desc: 'エキストラを2つ同時に装着できるようになります（全車共通）', go: () => { if (!DEV.inf()) d.diamonds -= EX_SLOT2_COST; d.exSlot2 = true; this.exSlot = 2; SAVE.save(); AUDIO.chestOpen(4); this.toast('スロット2を解放しました！'); this.render(); } }); },
  a_setExtra(id) {
    const d = SAVE.data, inst = this.tuneInst(); if (id && !d.extras.includes(id)) { const e = EXTRA_BY_ID[id]; if (!e || e.dia || !SAVE.spend(e.price)) return; d.extras.push(id); AUDIO.buy(); this.toast(e.name + ' を購入しました'); }
    const key = this.exSlot === 2 && d.exSlot2 ? 'extra2' : 'extra'; if (id && inst.look[key === 'extra' ? 'extra2' : 'extra'] === id) return this.toast('もう片方のスロットに装着済みです'); inst.look[key] = id || ''; SAVE.save(); this.show.setCar(inst, true); if (id) this.toast((EXTRA_BY_ID[id].perf ? '装着しました（ランキング対象外になります）' : '装着しました')); this.render();
  },
  // ---------------- バックパック ----------------
  a_useCons(id) { const r = useCons(id); if (!r.ok) { AUDIO.error && AUDIO.error(); return this.toast(r.msg); } SAVE.data.stats.consUsed = (SAVE.data.stats.consUsed || 0) + 1; AUDIO.buy ? AUDIO.buy() : 0; this.toast(CONS_BY_ID[id].name + ' を使いました！'); this.render(); },
  a_buyCons(v) { const [id, cur] = v.split(':'); const c = CONS_BY_ID[id], d = SAVE.data; if (!c) return; if (cur === 'dia') { if (!this.payDia(c.dia)) return; } else if (!SAVE.spend(c.price)) return; giveCons(id); SAVE.save(); AUDIO.buy ? AUDIO.buy() : 0; this.refreshTop(); this.toast(c.name + ' を購入しました（バックパックで使えます）'); this.render(); },
  r_bag() {
    $('panelTitle').textContent = 'BACKPACK'; const d = SAVE.data; if (!this.tab) this.tab = 'items'; this.show.setCar(SAVE.cur());
    const tabs = [['items', 'インベントリ'], ['log', '開封履歴'], ['medal', 'メダル'], ['cons', '消費アイテム'], ['extra', 'エキストラ'], ['wallet', '所持品']];
    let h = `<div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${this.tab === k ? 'on' : ''}" data-a="setTab" data-v="${k}">${l}</button>`).join('')}</div>`;
    if (this.tab === 'medal') {
      const M = d.medals; h += `<div class="medals">${[['g', '金メダル', '1位'], ['s', '銀メダル', '2位'], ['b', '銅メダル', '3位']].map(([k, nm, r]) => `<div class="medal ${k}">${medalIcon(k, 64)}<b>${M[k] || 0}</b><small>${nm}（${r}）</small></div>`).join('')}</div>`;
      h += `<div class="note">週間ランキングで1〜3位になるともらえます。何枚でも集められます。</div><div class="h3">獲得の記録</div>`;
      h += d.medalLog.length ? `<div class="lb-list">${d.medalLog.slice().reverse().slice(0, 40).map(m => `<div class="lb-row"><span class="rk">${m.r ? medalIcon(['', 'g', 's', 'b'][m.r], 24) : ICO('gift', '#aaa', 18)}</span><span class="nm">${esc(lbBoardName(m.b))}<small style="display:block;font-size:10px;color:#999;font-weight:400">${m.w.slice(1, 5)}/${m.w.slice(5, 7)}/${m.w.slice(7, 9)} の週 ・ ${m.r ? m.r + '位' : '参加賞'}</small></span><span class="vl">${m.item ? esc((ITEM_BY_ID[m.item] || {}).name || '') : m.money ? yen(m.money) : ''}</span></div>`).join('')}</div>` : `<div class="note">まだ記録がありません。週間ランキングに参加してみよう！</div>`;
    }
    if (this.tab === 'cons') {
      const ch = boostChips(); h += `<div class="h3">使用中のブースト</div>` + (ch ? `<div class="boostbar big">${ch}</div>` : `<div class="note">使用中のブーストはありません。</div>`);
      const own = CONSUMABLES.filter(c => (d.cons || {})[c.id] > 0);
      h += `<div class="h3">持っている消費アイテム</div>` + (own.length ? `<div class="pgrid">${own.map(c => `<div class="pcard"><span class="pc-ic">${consIcon(c, 40)}</span><span class="pc-tx"><b>${esc(c.name)} ×${d.cons[c.id]}</b><small>${esc(c.desc)}</small></span><button class="btn pri" data-a="useCons" data-v="${c.id}">使う</button></div>`).join('')}</div>` : `<div class="note">パーツショップ・ダイヤショップ・カードパックのおまけ・毎日の無料カードパック・ダイヤレースで手に入ります。</div>`);
      h += `<div class="note">同じ効果のアイテムを使うと時間が延長されます（最大3時間）。時間はゲームを閉じていても進みます。ランキングのスコアには影響しません。</div>`;
    }
    if (this.tab === 'items') h += this.invHTML();
    if (this.tab === 'log') h += this.logHTML();
    if (false) {
      const own = ITEMS.filter(i => invHas(i.id));
      h += `<div class="note">持っているアイテム ${own.length}種類（重複は ×数 で表示）</div>`;
      for (const ty of Object.keys(ITEM_TYPES)) { const list = own.filter(i => i.type === ty); if (!list.length) continue;
        h += `<div class="h3">${ITEM_TYPES[ty]}（${list.length}）</div><div class="col-grid">${list.map(i => `<div class="citem" style="border-color:${RARITY[i.rarity].color}"><div class="si-ic">${this.itemIcon(i, 36)}</div><div class="ci-nm">${esc(i.name)}${(d.inv[i.id] || 1) > 1 ? ' ×' + d.inv[i.id] : ''}</div></div>`).join('')}</div>`; }
      if (!own.length) h += `<div class="note">カードパックやアドベントカレンダー、ランキングの報酬で手に入ります。</div>`;
    }
    if (this.tab === 'extra') {
      const list = EXTRAS.filter(e => d.extras.includes(e.id));
      h += list.length ? `<div class="pgrid">${list.map(e => `<div class="pcard"><span class="pc-ic">${extraIcon(e, 40)}</span><span class="pc-tx"><b>${e.name}</b><small>${e.desc}</small></span><span class="pc-pr">${e.perf ? 'ランキング対象外' : ''}</span></div>`).join('')}</div>` : `<div class="note">まだエキストラを持っていません。パーツショップで買えます。</div>`;
      h += `<div class="btns"><button class="btn gold" data-a="goPshop">パーツショップへ</button></div>`;
    }
    if (this.tab === 'wallet') {
      const ps = d.stats.playSec || 0;
      h += `<div class="dv-stat"><span>所持金</span><b>${DEV.inf() ? '∞' : yen(d.money)}</b><span>ダイヤ</span><b>${(d.diamonds || 0).toLocaleString()}</b><span>クリスマスポイント</span><b>${(d.event.points || 0).toLocaleString()} pt</b><span>所持車両</span><b>${d.cars.length} 台</b><span>アイテム</span><b>${ITEMS.filter(i => invHas(i.id)).length} / ${ITEMS.length}</b><span>エキストラ</span><b>${d.extras.length} / ${EXTRAS.length}</b><span>アドベント</span><b>${d.advent.open.length} / 25</b><span>プレイ時間</span><b>${Math.floor(ps / 3600)}時間${Math.floor(ps % 3600 / 60)}分</b><span>レース回数</span><b>${d.stats.races}</b></div>`;
    }
    return h;
  },
  a_goPshop() { this.open('pshop'); this.tab = 'extra'; this.render(); },
  // ---- 先週のランキング報酬を受け取る ----
  async lbClaimRewards() {
    const F = window.DL_FB, d = SAVE.data; if (!F || !F.isGoogle() || !F.profile.name || this._claiming) return; const wk = F.weekKey(-1); if (d.lbClaim[wk]) return; this._claiming = true;
    try {
      const boards = LB_BOARDS.map(b => b.id).concat(MAPS.map(m => 'ta_' + m.id)); const res = []; const me = F.user.uid;
      for (const b of boards) { const mine = await F.lbMine(wk, b); if (!mine) continue; const top = await F.lbTop(wk, b, 3); const r = top.findIndex(x => x.uid === me) + 1; res.push({ b, r: r >= 1 && r <= 3 ? r : 0, v: mine.v }); }
      d.lbClaim[wk] = true; if (!res.length) { SAVE.save(); return; }
      const lines = []; let anyPart = false;
      for (const x of res) {
        if (x.r) { const k = ['', 'g', 's', 'b'][x.r]; d.medals[k] = (d.medals[k] || 0) + 1; const pool = RANK_POOLS[x.r].filter(id => !invHas(id)); let item = null, money = 0;
          if (pool.length) { item = pool[(Math.random() * pool.length) | 0]; grantChestItem(ITEM_BY_ID[item]); } else { money = [0, 5000000, 3000000, 1500000][x.r]; SAVE.addMoney(money); }
          d.medalLog.push({ w: wk, b: x.b, r: x.r, item, money }); lines.push(`${medalIcon(k, 22)} ${esc(lbBoardName(x.b))}：<b>${x.r}位</b> → ${item ? esc(ITEM_BY_ID[item].name) : yen(money)}`); }
        else anyPart = true;
      }
      if (anyPart) { const pool = ITEMS.filter(i => !i.lim && ['decal', 'paint', 'wheel', 'neon', 'caliper', 'plate', 'meter'].includes(i.type)); const un = pool.filter(i => !invHas(i.id)); const it = (un.length ? un : pool)[(Math.random() * (un.length ? un : pool).length) | 0]; const g = grantChestItem(it);
        d.medalLog.push({ w: wk, b: res.find(x => !x.r).b, r: 0, item: it.id }); lines.push(`${ICO('gift', '#2fdc7a', 20)} 参加賞：<b>${esc(it.name)}</b>${g.isNew ? '' : `（重複 → ${yen(g.refund)}）`}`); }
      SAVE.save(); this.refreshTop();
      this.modal(`<h2>${ICO('trophy', '#ffcf3d', 26)} 先週のランキング結果</h2><div class="note">参加ありがとうございました！報酬を受け取りました。</div><div class="lb-list">${lines.map(l => `<div class="lb-row" style="display:block;line-height:1.7">${l}</div>`).join('')}</div><div class="btns"><button class="btn pri" data-a="closeModal">OK</button><button class="btn" data-a="openBag">バックパックを見る</button></div>`);
      AUDIO.fanfare(); if (this.screen === 'menu') this.menuItems();
    } catch (e) { console.warn('claim', e); } finally { this._claiming = false; }
  },
  a_openBag() { this.closeModal(); this.open('bag'); },
  // ---------------- アカウント・ユーザーネーム ----------------
  r_account() {
    $('panelTitle').textContent = 'ACCOUNT'; const F = window.DL_FB; this.show.setCar(SAVE.cur());
    if (!F) return `<div class="note">この版ではアカウント機能を使えません（GitHub版で使えます）。</div>`;
    let h = `<div class="acc-box">${ICO('globe', '#5ad1ff', 30)}<div><b class="${F.isGoogle() ? 'noi18n' : ''}">${esc(F.label())}</b><small>${F.isGoogle() ? 'Googleでログイン中（セーブデータもクラウドに保存されます）' : 'ゲスト（この端末だけ）'}</small></div></div>`;
    if (!F.isGoogle()) return h + `<div class="note" style="font-size:13px;line-height:1.8">週間ランキングに参加するには、Googleアカウントでのログインが必要です。<br>ログインすると、今のセーブデータを引き継いだままクラウドに保存され、スマホとPCで同じデータを使えます。</div><div class="btns"><button class="btn pri" data-a="fbLogin" style="flex:1">Googleでログイン</button></div>`;
    const nm = F.profile.name;
    h += `<div class="h3">ユーザーネーム</div><div class="note">ランキングに表示される名前です。2〜12文字（英数字・ひらがな・カタカナ・漢字・_ -）。ほかの人が使っている名前は使えません。</div>`;
    h += `<div class="row"><label>${nm ? '今の名前' : '名前'}</label><input type="text" id="unameIn" maxlength="12" placeholder="例：峠の龍" value="${esc(this.unameDraft ?? nm ?? '')}" data-in="unameDraft"></div><div class="note" id="unameMsg" style="min-height:1.4em;color:#ff8a8a">${esc(this.unameMsg || '')}</div>`;
    h += `<div class="btns"><button class="btn pri" data-a="setName" style="flex:1">${nm ? '名前を変更する' : 'この名前に決める'}</button></div>`;
    h += `<div class="h3">ランキング</div><div class="btns"><button class="btn gold" data-a="openRanking" style="flex:1">週間ランキングを見る ▶</button></div>`;
    h += `<div class="h3">ログアウト</div><div class="btns"><button class="btn" data-a="fbLogout">ログアウト</button></div>`;
    return h;
  },
  in_unameDraft(v) { this.unameDraft = v; const m = $('unameMsg'); if (m) { const bad = window.DL_FB.checkName(v); m.textContent = v && bad ? bad : ''; m.style.color = '#ff8a8a'; } },
  async a_setName() {
    const F = window.DL_FB; const v = (($('unameIn') || {}).value || '').trim(); const m = $('unameMsg');
    const bad = F.checkName(v); if (bad) { if (m) m.textContent = bad; return; } if (m) { m.style.color = '#aaa'; m.textContent = '確認しています…'; }
    try { await F.setName(v); this.unameDraft = null; this.unameMsg = ''; this.toast('ユーザーネームを「' + v + '」にしました'); AUDIO.buy();
      for (const id of LB_BOARDS.map(b => b.id).concat(MAPS.map(m => 'ta_' + m.id))) { try { const mine = await F.lbMine(F.weekKey(), id); if (mine) await F.lbSubmit(id, mine.v, id.startsWith('ta_') ? 'min' : 'max'); } catch (e) { } }
      this.lbSync(); this.render(); }
    catch (e) { const msg = e.code === 'taken' ? 'その名前はほかの人が使っています。別の名前にしてください' : e.code === 'bad' ? e.message : e.code === 'login' ? 'Googleでログインしてください' : '保存できませんでした（通信を確認してください）'; this.unameMsg = msg; if (m) { m.style.color = '#ff8a8a'; m.textContent = msg; } AUDIO.error(); }
  },
  a_openRanking() { this.open('ranking'); },
  // ---------------- 週間ランキング ----------------
  r_ranking() {
    $('panelTitle').textContent = 'WEEKLY RANKING'; const F = window.DL_FB; this.show.setCar(SAVE.cur());
    if (!F) return `<div class="note">ランキングはGitHub版で使えます。</div>`;
    if (!this.tab) this.tab = 'drift'; if (this.lbWeek === undefined) this.lbWeek = 0; if (!this.lbMap) this.lbMap = 'akigiri';
    const isTA = this.tab === 'ta'; const B = isTA ? { id: 'ta_' + this.lbMap, name: 'タイムアタック', desc: 'タイムアタックの最速ラップ（コースごと・速い順）', fmt: fmtLap } : (LB_BOARDS.find(b => b.id === this.tab) || LB_BOARDS[0]);
    const wk = F.weekKey(this.lbWeek === 0 ? 0 : -1), key = wk + '/' + B.id; const data = (this.lbCache || {})[key];
    let h = `<div class="lb-head">${ICO('trophy', '#ffcf3d', 30)}<div><b>週間ランキング</b><small>毎週月曜 0:00（日本時間）にリセット</small></div><div class="lb-cd" id="lbCd">${this.lbWeek === 0 ? 'リセットまで ' + fmtLeft(F.weekEnd() - Date.now()) : '先週の結果'}</div></div>`;
    h += `<div class="tabs">${LB_BOARDS.map(b => `<button class="tab ${b.id === this.tab ? 'on' : ''}" data-a="setTab" data-v="${b.id}">${b.name}</button>`).join('')}<button class="tab ${isTA ? 'on' : ''}" data-a="setTab" data-v="ta">タイムアタック</button></div>`;
    if (isTA) h += `<div class="row"><label>コース</label><select data-in="lbMap">${MAPS.map(m => `<option value="${m.id}" ${m.id === this.lbMap ? 'selected' : ''}>${esc(m.jp)}</option>`).join('')}</select></div>`;
    h += `<div class="note" style="font-size:11px;color:#ffcf3d">1〜3位には金・銀・銅メダルと限定報酬、それ以外の参加者にも参加賞（ランダムなカスタマイズパーツ）がもらえます。ジェット・ロケットなど性能が変わるエキストラを付けた記録は対象外です。</div>`;
    h += `<div class="seg" style="margin-bottom:6px"><button class="${this.lbWeek === 0 ? 'on' : ''}" data-a="lbWeek" data-v="0">今週</button><button class="${this.lbWeek === 1 ? 'on' : ''}" data-a="lbWeek" data-v="1">先週</button></div><div class="note">${B.desc}</div>`;
    if (!F.isGoogle() || !F.profile.name) h += `<button class="mm-acc warn" data-a="goAccount">${ICO('trophy', '#ffcf3d', 22)}<span><b>${F.isGoogle() ? 'ユーザーネームを決めて参加しよう' : 'Googleでログインして参加しよう'}</b><small>見るだけならログインなしでもOK</small></span><i>参加</i></button>`;
    if (!data) { this.lbLoad(wk, B.id, key); h += `<div class="note">読み込み中…</div>`; }
    else if (data.err) h += `<div class="note" style="color:#ff8a8a">ランキングを読み込めませんでした（${esc(data.err)}）</div><div class="btns"><button class="btn" data-a="lbReload">再読み込み</button></div>`;
    else {
      const me = F.user && F.user.uid; const rows = data.list;
      if (!rows.length) h += `<div class="note" style="text-align:center;padding:20px">まだ記録がありません。一番乗りを目指そう！</div>`;
      h += `<div class="lb-list">${rows.map((r, i) => `<div class="lb-row ${r.uid === me ? 'me' : ''} ${i < 3 ? 'top' + (i + 1) : ''}"><span class="rk">${i < 3 ? ICO('trophy', ['#ffd700', '#c8ccd4', '#cd7f32'][i], 20) : i + 1}</span><span class="nm"><span class="noi18n">${esc(r.n)}</span>${r.uid === me ? ' <em>あなた</em>' : ''}</span><span class="vl">${B.fmt(r.v)}</span></div>`).join('')}</div>`;
      if (data.mine && !rows.some(r => r.uid === me)) h += `<div class="lb-row me"><span class="rk">圏外</span><span class="nm"><span class="noi18n">${esc(data.mine.n)}</span> <em>あなた</em></span><span class="vl">${B.fmt(data.mine.v)}</span></div>`;
      h += `<div class="btns"><button class="btn" data-a="lbReload">更新</button></div>`;
    }
    clearInterval(this._lbT); this._lbT = setInterval(() => { if (this.screen !== 'ranking') return clearInterval(this._lbT); const e = $('lbCd'); if (e && this.lbWeek === 0) e.innerHTML = 'リセットまで ' + fmtLeft(F.weekEnd() - Date.now()); }, 1000);
    return h;
  },
  async lbLoad(wk, board, key) {
    const F = window.DL_FB; this.lbCache = this.lbCache || {}; if (this.lbCache[key] && this.lbCache[key].loading) return; this.lbCache[key] = { loading: true };
    try { const [list, mine] = await Promise.all([F.lbTop(wk, board, 50), F.lbMine(wk, board)]); this.lbCache[key] = { list, mine }; } catch (e) { this.lbCache[key] = { err: (e && (e.code || e.message)) || 'error' }; }
    if (this.screen === 'ranking') this.render();
  },
  a_lbWeek(v) { this.lbWeek = +v; this.render(); },
  in_lbMap(v) { this.lbMap = v; this.render(); },
  a_lbReload() { this.lbCache = {}; this.render(); },
  a_goAccount() { this.open('account'); },
  lbSync() { this.lbCache = {}; if (this.screen === 'menu') this.menuItems(); },
  // ---------------- ダイヤ（ショップ・ダイヤレース） ----------------
  r_diamond() {
    $('panelTitle').textContent = 'DIAMOND'; const d = SAVE.data; if (!this.tab) this.tab = 'shop'; this.show.setCar(SAVE.cur());
    let h = `<div class="dm-head">${ICO('gem', '#bfe9ff', 34)}<div><b>${(d.diamonds || 0).toLocaleString()} ダイヤ</b><small>ストーリーやイベントで勝つ・ダイヤレースを達成するともらえます</small></div></div>`;
    h += `<div class="tabs">${[['shop', 'ダイヤショップ'], ['races', 'ダイヤレース'], ['how', '入手方法']].map(([k, l]) => `<button class="tab ${this.tab === k ? 'on' : ''}" data-a="setTab" data-v="${k}">${l}</button>`).join('')}</div>`;
    if (this.tab === 'shop') {
      h += `<div class="note">ダイヤでしか買えない、ピカピカのダイヤ・ゴールドの車やパーツです。</div><div class="pgrid">`;
      for (const [id, pr] of DIA_ITEMS) { const isEx = id.startsWith('ex_'); const it = isEx ? EXTRA_BY_ID[id.slice(3)] : ITEM_BY_ID[id]; if (!it) continue; const own = isEx ? d.extras.includes(it.id) : invHas(id);
        const icon = isEx ? extraIcon(it, 40) : this.itemIcon(it, 40); const sub = isEx ? 'エキストラ' + (it.perf ? '（ランキング対象外）' : '') : ITEM_TYPES[it.type];
        h += `<button class="pcard dmc ${own ? 'on' : ''}" data-a="${own ? 'noop' : 'buyDia'}" data-v="${id}"><span class="pc-ic">${icon}</span><span class="pc-tx"><b>${esc(it.name)}</b><small>${sub}</small></span><span class="pc-pr dm">${own ? '所持済み' : ICO('gem', '#9ad8ff', 13) + ' ' + pr}</span></button>`; }
      h += `</div><div class="h3">消費アイテム（ダイヤ）</div><div class="pgrid">${CONSUMABLES.filter(c => c.dia).map(c => `<button class="pcard dmc" data-a="buyCons" data-v="${c.id}:dia"><span class="pc-ic">${consIcon(c, 40)}</span><span class="pc-tx"><b>${esc(c.name)}${(d.cons || {})[c.id] ? ' <small>（所持 ' + d.cons[c.id] + '）</small>' : ''}</b><small>${esc(c.desc)}</small></span><span class="pc-pr dm">${ICO('gem', '#9ad8ff', 13)} ${c.dia}</span></button>`).join('')}</div>`;
    }
    if (this.tab === 'races') {
      const left = weekEndLocal() - Date.now();
      h += `<div class="note">毎週月曜 0:00（日本時間）に3つのレースが入れ替わります。次の入れ替えまで ${fmtLeft(left)}</div>`;
      for (const ch of diaRaces()) { const done = !!d.diaCh[ch.id]; const m = MAP_BY_ID[ch.map];
        const goal = ch.t === 'touge' ? `峠チャレンジで ${ch.goal.toLocaleString()}点以上` : ch.t === 'jump' ? `1回のジャンプで ${ch.goal}m 以上飛ぶ` : `タイムアタックで ${fmtLap(ch.goal)} 以内のラップ`;
        h += `<div class="dm-race ${done ? 'done' : ''}"><div class="dr-l">${ICO(ch.t === 'touge' ? 'mountain' : ch.t === 'jump' ? 'flag' : 'clock', '#9ad8ff', 30)}</div><div class="dr-m"><b>${esc(m ? m.jp : ch.map)}</b><small>${goal}</small></div><div class="dr-r"><span>${ICO('gem', '#9ad8ff', 14)} ${ch.reward}</span>${done ? '<em>達成済み</em>' : `<button class="btn pri" data-a="diaGo" data-v="${ch.id}">挑戦する</button>`}</div></div>`; }
    }
    if (this.tab === 'how') {
      h += `<div class="lb-list">${[['ストーリー・イベントのバトルに勝つ', 10], ['ダイヤレース（毎週3つ）を達成', '30〜60'], ['峠チャレンジで 30,000点以上', 8], ['峠チャレンジで 10,000点以上', 3], ['タイムアタックを完走', 2]].map(([a, b]) => `<div class="lb-row"><span class="nm">${a}</span><span class="vl">${ICO('gem', '#9ad8ff', 13)} ${b}</span></div>`).join('')}</div>`;
    }
    return h;
  },
  a_buyDia(id) {
    const d = SAVE.data, e = DIA_ITEMS.find(x => x[0] === id); if (!e) return; const pr = e[1];
    if (!this.payDia(pr)) return;
    if (id.startsWith('ex_')) { const x = EXTRA_BY_ID[id.slice(3)]; if (!d.extras.includes(x.id)) d.extras.push(x.id); this.toast(x.name + ' を手に入れました'); }
    else { const it = ITEM_BY_ID[id]; grantChestItem(it); this.toast(it.name + ' を手に入れました' + (it.type === 'car' ? '（ガレージに追加）' : '')); }
    SAVE.save(); AUDIO.chestOpen(4); this.refreshTop(); this.render();
  },
  a_diaGo(id) {
    const ch = diaRaces().find(x => x.id === id); if (!ch) return; const inst = SAVE.cur();
    const mode = ch.t === 'touge' ? 'touge' : ch.t === 'time' ? 'time' : 'free'; const m = MAP_BY_ID[ch.map];
    this.toast('ダイヤレース開始！'); this.launch({ mode, mapId: ch.map, weather: 'clear', time: m ? m.time : 'day', laps: 1, carInst: inst, rivals: [], diaCh: ch.id });
  },
  // ---------------- アップデート情報 ----------------
  r_news() {
    $('panelTitle').textContent = 'UPDATE LOG'; this.show.setCar(SAVE.cur()); const d = SAVE.data; const fresh = d.seenVersion !== GAME_VERSION;
    if (fresh) { d.seenVersion = GAME_VERSION; SAVE.save(); }
    const L = CHANGELOG[0];
    let h = `<div class="nw-hero"><div class="nw-tag">${fresh ? 'NEW UPDATE' : '最新アップデート'}</div><div class="nw-v">version ${L.v}</div><div class="nw-t">${esc(L.title)}</div><ul>${L.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
    h += `<div class="mm-sec" style="margin-top:12px">過去のアップデート</div>`;
    h += CHANGELOG.slice(1).map(c => `<div class="nw-old"><div class="nw-oh"><b>v${c.v}</b><span>${esc(c.title)}</span></div><ul>${c.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('');
    h += `<div class="note" style="text-align:center;margin:10px 0">DRIFT LEGENDS 現在のバージョン：v${GAME_VERSION}</div>`;
    return h;
  },
  // ---------------- アドベントカレンダー ----------------
  r_advent() {
    $('panelTitle').textContent = 'ADVENT CALENDAR'; const A = adventInfo(), d = SAVE.data; adventSync(); this.show.setCar(SAVE.cur());
    let html = `<div class="adv-head"><div class="adv-t">${ICO('calendar', '#ffd76a', 34)}<div><b>アドベントカレンダー</b><small>12月1日〜25日、毎日1つずつ扉を開けて限定アイテムをゲット！</small></div></div><div class="adv-cd" id="advCd">${adventCountdown()}</div></div>`;
    html += `<div class="adv-grid">`;
    for (let k = 1; k <= 25; k++) {
      const rw = ADVENT[k], opened = d.advent.open.includes(k), can = !opened && A.day >= k, today = A.day === k && !opened;
      const icon = opened ? adventRewardIcon(rw, 34) : can ? ICO('gift', today ? '#ffd76a' : '#ff9a9a', 30) : ICO('lock', '#666', 22);
      html += `<button class="door ${k === 25 ? 'big' : ''} ${opened ? 'opened' : ''} ${can ? 'can' : ''} ${today ? 'today' : ''}" data-a="${can ? 'advOpen' : 'advPeek'}" data-v="${k}"><span class="dn">${k}</span><span class="di">${icon}</span><span class="dl">${opened ? esc(adventRewardLabel(rw, true)) : can ? (today ? 'きょうの扉！' : '開けられます') : '12/' + k}</span></button>`;
    }
    html += `</div><div class="note">・その日の扉は12/25まで開けられます（開け忘れた扉も25日までならOK）。<br>・アドベント限定アイテムは、カードパックや日替わりショップには出ません。<br>・12/25の扉には特別な限定車が入っています。</div>`;
    clearInterval(this._advT); this._advT = setInterval(() => { if (this.screen !== 'advent') return clearInterval(this._advT); const e = $('advCd'); if (e) e.innerHTML = adventCountdown(); if (adventInfo().day !== A.day) this.render(); }, 1000);
    return html;
  },
  a_advPeek(k) { const A = adventInfo(); if (SAVE.data.advent.open.includes(+k)) return this.toast(k + '日目：' + adventRewardLabel(ADVENT[k], true)); this.toast(A.day === 0 && A.M !== 12 ? '12月1日から開けられます' : A.day === 0 ? '今年のアドベントカレンダーは終了しました' : `12月${k}日になると開けられます`); },
  a_advOpen(k) {
    k = +k; const A = adventInfo(), d = SAVE.data; adventSync(); if (d.advent.open.includes(k) || A.day < k) return;
    const rw = ADVENT[k]; d.advent.open.push(k); let res = null, label = adventRewardLabel(rw, true), it = null, extra = '';
    if (rw.t === 'money') SAVE.addMoney(rw.v);
    else if (rw.t === 'pts') d.event.points = (d.event.points || 0) + rw.v;
    else if (rw.t === 'chest') { const c = CHESTS.find(x => x.id === rw.v); it = rollChest(c); res = grantChestItem(it); label = it.name; extra = c.name + 'から出ました' + (res.isNew ? '' : `（重複 → ${yen(res.refund)}）`); }
    else if (rw.t === 'item') { it = ITEM_BY_ID[rw.v]; res = grantChestItem(it); label = it.name; if (rw.bonus) { SAVE.addMoney(rw.bonus); extra = '＋ ' + yen(rw.bonus); } if (!res.isNew) extra = `持っていたので ${yen(res.refund)} に換金`; }
    SAVE.save(); this.refreshTop(); const rc = it ? RARITY[it.rarity].color : '#ffd76a';
    this.modal(`<div class="chest-open" style="--rc:${rc}"><div class="co-box">${ICO('calendar', '#ffd76a', 110)}</div><div class="co-res"><div class="co-ic">${it ? this.itemIcon(it, 72) : adventRewardIcon(rw, 72)}</div>${it ? `<div class="co-rar" style="color:${rc}">${RARITY[it.rarity].name}</div>` : `<div class="co-rar" style="color:#ffd76a">${k}日目</div>`}<div class="co-nm">${esc(label)}</div><div class="co-ty">${it ? ITEM_TYPES[it.type] + (it.lim ? '・アドベント限定' : '') : 'アドベントカレンダー'}</div>${extra ? `<div class="co-new">${esc(extra)}</div>` : (res && res.isNew ? '<div class="co-new">NEW!</div>' : '')}</div></div><div class="btns"><button class="btn pri" data-a="closeChest">OK</button></div>`);
    AUDIO.tone(523, 0.15, 'triangle', 0.2); setTimeout(() => { AUDIO.fanfare(); }, 800); if (it && it.type === 'car') this.toast('ガレージに ' + it.name + ' が追加されました！');
  },
  // ---------------- 開発者メニュー（所有者のみ） ----------------
  a_openDev() { if (DEV.owner) this.open('dev'); },
  a_devRecheck() { DEV.owner = false; DEV.why = '確認中'; this.render(); DEV.init().then(() => this.render()); },
  async a_devMakeCode() {
    if (!DEV.owner) return; if (!window.DL_FB) return this.toast('オンライン版でのみ作成できます'); const g = id => String((document.getElementById(id) || {}).value || '').trim();
    const code = g('dcCode').toUpperCase().replace(/[^0-9A-Z_-]/g, ''); if (code.length < 3) return this.toast('コードは3文字以上');
    const r = {}; if (+g('dcMoney')) r.money = Math.floor(+g('dcMoney')); if (+g('dcDia')) r.dia = Math.floor(+g('dcDia')); if (g('dcChest')) r.chest = g('dcChest'); if (g('dcUntil')) r.until = g('dcUntil'); if (g('dcNote')) r.note = g('dcNote');
    if (!r.money && !r.dia && !r.chest) return this.toast('報酬を1つ以上入力してください');
    try { await DL_FB.ready(); await DL_FB.db().ref('codes/' + code).set(r); this.toast('コード「' + code + '」を作成しました'); } catch (e) { this.toast('作成できませんでした（ルールを確認）'); }
  },
  r_dev() {
    $('panelTitle').textContent = 'DEVELOPER'; if (!DEV.owner) return `<div class="note">開発者モードが無効です（${esc(DEV.why)}）。</div>`;
    const d = SAVE.data, s = d.settings; if (!this.tab) this.tab = 'money'; this.show.setCar(SAVE.cur());
    const tabs = [['money', 'お金・レベル'], ['unlock', '解放・入手'], ['event', 'イベント'], ['race', 'レース'], ['codes', 'コード作成'], ['data', 'データ']];
    const tg = (k, l, desc) => `<div class="dv-row"><div><b>${l}</b>${desc ? `<small>${desc}</small>` : ''}</div><button class="tgl ${s[k] ? 'on' : ''}" data-a="devToggle" data-v="${k}"><i></i></button></div>`;
    const bt = (a, l, v, cls) => `<button class="btn ${cls || ''}" data-a="${a}"${v !== undefined ? ` data-v="${v}"` : ''}>${l}</button>`;
    let h = `<div class="dv-head">${ICO('wrench', '#ffcf3d', 26)}<div><b>開発者メニュー</b><small>あなたのアカウントにだけ表示されます。ここでの変更はこの端末とクラウドのセーブに反映されます。</small></div></div>`;
    h += `<div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${this.tab === k ? 'on' : ''}" data-a="setTab" data-v="${k}">${l}</button>`).join('')}</div>`;
    if (this.tab === 'money') {
      h += `<div class="dv-stat"><span>所持金</span><b>${DEV.inf() ? '∞' : yen(d.money)}</b><span>レベル</span><b>Lv.${SAVE.level()}</b><span>クリスマスpt</span><b>${(d.event.points || 0).toLocaleString()}</b></div>`;
      h += tg('devInfinite', '無限マネー', '買い物をしてもお金が減りません');
      h += `<div class="h3">お金を追加</div><div class="btns">${[1e6, 1e7, 1e8, 1e9].map(n => bt('devMoney', '+' + yen(n), n, 'gold')).join('')}</div><div class="btns">${bt('devMoneyZero', '所持金を ¥0 にする')}</div>`;
      h += `<div class="h3">ダイヤを追加</div><div class="btns">${[100, 1000, 10000].map(n => bt('devDia', '+' + n.toLocaleString() + ' ダイヤ', n)).join('')}</div>`;
      h += `<div class="h3">レベル</div><div class="btns">${bt('devLevel', 'レベル +5')}${bt('devLevelMax', 'レベル 50 にする')}</div>`;
    }
    if (this.tab === 'unlock') {
      const ownItems = ITEMS.filter(i => invHas(i.id)).length, carsAll = CARS.length, carsOwn = new Set(d.cars.map(c => c.id)).size;
      h += `<div class="dv-stat"><span>アイテム</span><b>${ownItems} / ${ITEMS.length}</b><span>車両</span><b>${carsOwn} / ${carsAll}</b><span>ストーリー</span><b>${d.story.cleared.length} / ${STORY.length}</b></div>`;
      h += `<div class="h3">まとめて解放</div><div class="btns">${bt('devStory', 'ストーリー全話クリア扱い（コース・車も解放）')}</div><div class="btns">${bt('devAllItems', 'カードパック・アドベントのアイテムを全部入手', undefined, 'gold')}</div><div class="btns">${bt('devAllXmas', 'クリスマスショップのアイテムを全部入手')}</div><div class="btns">${bt('devAllCars', '全車両をガレージに追加（限定車も）', undefined, 'gold')}</div>`;
      h += `<div class="note">全車両を追加すると、ガレージの台数がかなり増えます。</div>`;
    }
    if (this.tab === 'event') {
      h += tg('devEvent', 'クリスマスイベントを強制開催', '期間外でもイベントコース・クリスマスショップ・装飾が使えます');
      h += tg('devAdvent', 'アドベントカレンダーのテスト', '12/25扱いで全部の扉を開けられます（本番の12月には持ち越しません）');
      h += `<div class="btns">${bt('devAdvReset', 'アドベントの開けた扉をリセット')}</div>`;
      h += `<div class="h3">クリスマスポイント</div><div class="btns">${[1000, 10000, 100000].map(n => bt('devPts', '+' + n.toLocaleString() + 'pt', n)).join('')}</div>`;
      h += `<div class="h3">カードパック・ショップ</div><div class="btns">${bt('devFreeChest', 'デイリーカードパックをもう一度無料にする')}${bt('devShopReset', '日替わりショップの購入をリセット')}</div>`;
    }
    if (this.tab === 'race') {
      h += tg('devNitro', 'ニトロ無限', 'レース中ニトロが減りません');
      h += tg('devGhostCar', 'ライバルを遅くする', 'ストーリー・イベントのライバルの速さを半分にします（テスト用）');
      h += tg('showFps', 'FPS表示', '画面の動きの滑らかさ（フレームレート）を表示します');
      h += `<div class="h3">すぐに試す</div><div class="btns">${bt('devTest', 'ジャンプ台コースで試し走り', 'jumppark')}${bt('devTest', '峠で試し走り', 'akigiri')}</div>`;
    }
    if (this.tab === 'data') {
      h += `<div class="h3">セーブデータの書き出し・読み込み</div><div class="note">バックアップや別の端末への引っ越しに使えます。</div><textarea id="devSave" style="height:90px" placeholder="ここにセーブデータを貼り付けて「読み込む」"></textarea><div class="btns">${bt('devExport', '書き出す（コピー）')}${bt('devImport', '貼り付けたデータを読み込む', undefined, 'gold')}</div>`;
      h += `<div class="h3">エラー情報</div><div class="note">記録されたエラー: ${(d.errLog || []).length}件（設定 → データで確認できます）</div>`;
      h += `<div class="h3">危険な操作</div><div class="btns">${bt('devWipe', 'セーブデータを最初からにする', undefined, 'danger')}</div>`;
    }
    if (this.tab === 'codes') { h += `<div class="note">ここで作ったコードはオンライン（GitHub版）の全プレイヤーが使えます。1人1回まで。</div><div class="clan-form"><input id="dcCode" placeholder="コード（英数字・例 SUMMER2027）" maxlength="24"><input id="dcMoney" type="number" placeholder="お金（例 1000000）"><input id="dcDia" type="number" placeholder="ダイヤ（例 50）"><input id="dcChest" placeholder="カードパック（bronze/silver/gold/legend・空欄可）"><input id="dcUntil" placeholder="有効期限（例 2027-01-31・空欄なら無期限）"><input id="dcNote" placeholder="メッセージ（例 いつも遊んでくれてありがとう！）" maxlength="40"><button class="btn pri big" data-a="devMakeCode">コードを作成</button></div><div class="h3">ゲーム内に最初からあるコード</div><div class="note">${Object.keys(REDEEM_CODES).join(' / ')}</div>`; }
    return h;
  },
  a_devToggle(k) { if (!DEV.owner) return; const s = SAVE.data.settings; s[k] = !s[k]; SAVE.save(); if (k === 'showFps') $('fps').classList.toggle('hidden', !s[k]); if (k === 'devEvent') this.show.rebuildStudio(); this.refreshTop(); this.render(); },
  a_devDia(n) { if (!DEV.owner) return; SAVE.data.diamonds = (SAVE.data.diamonds || 0) + +n; SAVE.save(); this.refreshTop(); this.render(); },
  a_devMoneyZero() { if (!DEV.owner) return; SAVE.data.money = 0; SAVE.save(); this.render(); },
  a_devLevelMax() { if (!DEV.owner) return; SAVE.data.xp = Math.max(SAVE.data.xp, 49 * 1500); SAVE.save(); this.toast('Lv.' + SAVE.level() + ' になりました'); this.render(); },
  a_devPts(n) { if (!DEV.owner) return; SAVE.data.event.points = (SAVE.data.event.points || 0) + +n; SAVE.save(); this.toast('クリスマスポイント +' + (+n).toLocaleString()); this.render(); },
  a_devAllItems() { if (!DEV.owner) return; let k = 0; for (const it of ITEMS) { if (it.type === 'car') continue; if (!invHas(it.id)) { SAVE.data.inv[it.id] = 1; k++; } } SAVE.save(); this.toast(k + '個のアイテムを入手しました'); this.render(); },
  a_devAllXmas() { if (!DEV.owner) return; for (const it of XMAS_SHOP) grantItem(it.item); SAVE.save(); this.toast('クリスマスショップのアイテムを全部入手しました'); this.render(); },
  a_devAllCars() { if (!DEV.owner) return; const d = SAVE.data; let k = 0; for (const c of CARS) if (!d.cars.some(x => x.id === c.id)) { const n = SAVE.newCar(c.id); n.paid = c.price || 0; d.cars.push(n); k++; } SAVE.save(); this.toast(k + '台を追加しました'); this.render(); },
  a_devFreeChest() { if (!DEV.owner) return; SAVE.data.chest.freeDate = ''; SAVE.save(); this.toast('デイリーカードパックをもう一度開けられます'); },
  a_devShopReset() { if (!DEV.owner) return; SAVE.data.shopBuy = { date: '', ids: [] }; SAVE.save(); this.toast('日替わりショップの購入をリセットしました'); },
  a_devTest(map) { if (!DEV.owner) return; this.launch({ mode: 'free', mapId: map, weather: 'clear', time: 'evening', laps: 1, carInst: SAVE.cur(), rivals: [] }); },
  a_devExport() { const t = $('devSave'); t.value = JSON.stringify(SAVE.data); t.select(); try { navigator.clipboard.writeText(t.value).then(() => this.toast('コピーしました'), () => this.toast('選択しました。手動でコピーしてください')); } catch (e) { this.toast('選択しました。手動でコピーしてください'); } },
  a_devImport() { if (!DEV.owner) return; let o; try { o = JSON.parse($('devSave').value); } catch (e) { return this.toast('データの形式が正しくありません'); } if (!o || !Array.isArray(o.cars) || !o.cars.length) return this.toast('セーブデータではないようです'); o.savedAt = Date.now(); SAVE.adopt(o); SAVE.save(); this.afterLoad(); this.toast('読み込みました'); this.render(); },
  a_devWipe() { if (!DEV.owner) return; this.modal(`<h2>セーブデータを最初からにしますか？</h2><div class="note">所持金・車両・アイテム・記録がすべて消えます（開発者の設定は残ります）。元に戻せません。</div><div class="btns"><button class="btn" data-a="closeModal">やめる</button><button class="btn danger" data-a="devWipeYes">最初からにする</button></div>`); },
  a_devWipeYes() { if (!DEV.owner) return; const keep = { devInfinite: SAVE.data.settings.devInfinite }; const n = SAVE.defaults(); Object.assign(n.settings, SAVE.data.settings, keep); n.savedAt = Date.now(); SAVE.adopt(n); SAVE.save(); this.closeModal(); this.afterLoad(); this.toast('セーブデータを最初からにしました'); this.goMenu(); },
  // ---------------- ガレージ ----------------
  r_garage() {
    $('panelTitle').textContent = 'GARAGE'; const d = SAVE.data;
    if (!this.sel || !d.cars.find(c => c.uid === this.sel)) this.sel = d.current;
    const inst = d.cars.find(c => c.uid === this.sel); const car = CAR_BY_ID[inst.id]; this.show.setCar(inst);
    const spec = this.instSpec(inst); const sell = this.sellPrice(inst);
    let html = `<div class="note">所持車両 ${d.cars.length}台</div><div class="list" style="margin-top:6px">`;
    for (const c of this.sortedCars()) { const cd = CAR_BY_ID[c.id]; html += `<button class="item ${c.uid === inst.uid ? 'sel' : ''}" data-a="selG" data-v="${c.uid}"><div class="grow"><div class="t">${cd.name}${c.fav ? '<span class="tag fav">★</span>' : ''}${c.uid === d.current ? '<span class="tag cur">使用中</span>' : ''}</div><div class="s">${this.carLine(cd)}</div></div><div class="p">${Math.round(this.instSpec(c).hp)}PS</div></button>`; }
    html += `</div><div class="h3">${car.name}</div>${this.statBars(spec)}
      <div class="btns"><button class="btn pri" data-a="useCar" ${inst.uid === d.current ? 'disabled' : ''}>使用する</button><button class="btn" data-a="goTune" data-v="engine">チューニング</button><button class="btn" data-a="goTune" data-v="aero">カスタマイズ</button>
      <button class="btn" data-a="testDrive" data-v="${inst.uid}">試乗</button><button class="btn" data-a="favCar">${inst.fav ? '★ お気に入り解除' : '☆ お気に入り'}</button><button class="btn" data-a="compare">車両比較</button>
      <button class="btn" data-a="sellCar" ${d.cars.length <= 1 ? 'disabled' : ''}>売却 (${yen(sell)})</button></div>`;
    this.stageInfo(`<div class="car-name">${car.name}</div><div class="car-sub">${this.carLine(car)}</div>`);
    return html;
  },
  sellPrice(inst) { return Math.round((inst.paid * 0.55 + inst.spent * 0.3) / 1000) * 1000; },
  a_selG(v) { this.sel = v; this.render(); },
  a_useCar() { SAVE.data.current = this.sel; SAVE.save(); this.toast('使用車両を変更しました'); this.render(); },
  a_goTune(tab) { SAVE.data.current = this.sel || SAVE.data.current; SAVE.save(); this.open('tuning', { uid: this.sel, tab }); },
  a_favCar() { const c = SAVE.data.cars.find(c => c.uid === this.sel); c.fav = !c.fav; SAVE.save(); this.render(); },
  a_sellCar() {
    const c = SAVE.data.cars.find(c => c.uid === this.sel); const p = this.sellPrice(c);
    this.modal(`<h2>車両売却</h2><div class="note" style="font-size:14px">${CAR_BY_ID[c.id].name} を ${yen(p)} で売却しますか？<br>装着パーツも一緒に手放します。</div><div class="btns"><button class="btn pri" data-a="sellYes">売却する</button><button class="btn" data-a="closeModal">キャンセル</button></div>`);
  },
  a_sellYes() { const d = SAVE.data; const c = d.cars.find(c => c.uid === this.sel); if (!c || d.cars.length <= 1) return this.closeModal(); SAVE.addMoney(this.sellPrice(c)); d.cars = d.cars.filter(x => x !== c); if (d.current === c.uid) d.current = d.cars[0].uid; this.sel = d.current; SAVE.save(); AUDIO.buy(); this.closeModal(); this.toast('売却しました'); this.render(); },
  a_compare() {
    const d = SAVE.data; const a = d.cars.find(c => c.uid === this.sel); this.cmpA = a.uid; this.cmpB = this.cmpB && d.cars.find(c => c.uid === this.cmpB) && this.cmpB !== a.uid ? this.cmpB : (d.cars.find(c => c.uid !== a.uid) || a).uid;
    this.showCompare();
  },
  showCompare(shopCarId) {
    const d = SAVE.data; const A = shopCarId ? { id: shopCarId, tune: defaultTune(CAR_BY_ID[shopCarId]), look: defaultLook(CAR_BY_ID[shopCarId]) } : d.cars.find(c => c.uid === this.cmpA);
    const B = d.cars.find(c => c.uid === this.cmpB) || SAVE.cur();
    const sa = this.instSpec(A).stats, sb = this.instSpec(B).stats;
    const rows = [['最高速度', 'top', 'km/h'], ['0-100km/h', 'accel', 's', 1], ['出力', 'power', 'PS'], ['トルク', 'torque', 'Nm'], ['車両重量', 'weight', 'kg', 1], ['ハンドリング', 'handling', ''], ['ドリフト性能', 'driftScore', ''], ['ブレーキ', 'brake', ''], ['駆動方式', 'drive', ''], ['ギア数', 'gears', '速']];
    const fmt = (v, u) => typeof v === 'number' ? (u === 's' ? v.toFixed(1) : Math.round(v)) + u : v;
    let html = `<h2>車両比較</h2><div class="res-grid" style="grid-template-columns:1fr 1fr 1fr"><div></div><div style="text-align:center;font-weight:900">${CAR_BY_ID[A.id].name}</div><div style="text-align:center;font-weight:900">${CAR_BY_ID[B.id].name}</div>`;
    for (const [l, k, u, low] of rows) { const va = sa[k], vb = sb[k]; const better = typeof va === 'number' ? (low ? va < vb : va > vb) : false, worse = typeof va === 'number' ? (low ? va > vb : va < vb) : false; html += `<div style="color:#9aa0aa;font-family:inherit;text-align:left">${l}</div><div style="text-align:center;color:${better ? 'var(--green)' : worse ? '#ff6060' : '#fff'}">${fmt(va, u)}</div><div style="text-align:center;color:${worse ? 'var(--green)' : better ? '#ff6060' : '#fff'}">${fmt(vb, u)}</div>`; }
    html += `</div><div class="h3">比較対象を変更</div><div class="opt-row">${d.cars.filter(c => shopCarId || c.uid !== this.cmpA).map(c => `<button class="opt ${c.uid === B.uid ? 'on' : ''}" data-a="cmpB" data-v="${c.uid}${shopCarId ? '|' + shopCarId : ''}">${CAR_BY_ID[c.id].name}</button>`).join('')}</div><div class="btns"><button class="btn pri" data-a="closeModal">閉じる</button></div>`;
    this.modal(html);
  },
  a_cmpB(v) { const [uid, shop] = v.split('|'); this.cmpB = uid; this.showCompare(shop); },
  a_testDrive(v) {
    let inst; if (v.startsWith('shop:')) { const id = v.slice(5); inst = { uid: 'test', id, tune: defaultTune(CAR_BY_ID[id]), look: defaultLook(CAR_BY_ID[id]) }; } else inst = SAVE.data.cars.find(c => c.uid === v);
    this.returnTo = [this.screen, this.arg, this.sel];
    this.launch({ mode: 'free', mapId: 'lot', weather: 'clear', time: 'day', carInst: inst, rivals: [], testDrive: true });
  },
  // ---------------- ショップ ----------------
  r_shop() {
    $('panelTitle').textContent = 'CAR SHOP';
    const makers = Object.keys(MAKERS).filter(k => k !== 'EVENT' && k !== 'LEGEND'); if (!this.tab) this.tab = 'AKATSUKI';
    let html = `<div class="tabs">${makers.map(m => `<button class="tab ${this.tab === m ? 'on' : ''}" data-a="shopTab" data-v="${m}">${m}</button>`).join('')}<button class="tab ${this.tab === 'PARTS' ? 'on' : ''}" data-a="shopTab" data-v="PARTS">パーツ</button></div>`;
    if (this.tab === 'PARTS') {
      const c = SAVE.cur(); this.show.setCar(c);
      html += `<div class="note" style="font-size:13px;line-height:1.8">エンジン・足回り・タイヤ・エアロ・ペイントなどの各種パーツは、使用中の車両に装着して購入します。<br>使用中: <b>${CAR_BY_ID[c.id].name}</b></div><div class="btns">${[['engine', 'エンジン'], ['chassis', '足回り'], ['tire', 'タイヤ'], ['aero', '外装'], ['paint', 'ペイント']].map(([k, l]) => `<button class="btn" data-a="goTuneCur" data-v="${k}">${l}パーツ</button>`).join('')}</div>`;
      return html;
    }
    const list = CARS.filter(c => c.maker === this.tab);
    if (!this.sel || !list.find(c => c.id === this.sel)) this.sel = list[0].id;
    const car = CAR_BY_ID[this.sel]; this.show.setCar({ id: car.id, tune: defaultTune(car), look: defaultLook(car) });
    html += `<div class="note">${MAKERS[this.tab].jp} ・ ${MAKERS[this.tab].desc}</div><div class="list" style="margin-top:6px">`;
    for (const c of list) { const own = SAVE.data.cars.filter(x => x.id === c.id).length; const ok = carBuyable(c); html += `<button class="item ${c.id === this.sel ? 'sel' : ''} ${ok ? '' : 'locked'}" data-a="selShop" data-v="${c.id}"><div class="grow"><div class="t">${c.name}${own ? `<span class="tag own">所有 ${own}</span>` : ''}</div><div class="s">${c.era} ・ ${c.drive} ・ ${c.hp}PS${ok ? '' : ' ・ ' + ICO('lock', '#ff8080', 12) + carLockText(c)}</div></div><div class="p">${yen(c.price)}</div></button>`; }
    const spec = computeSpec(car); const ok = carBuyable(car);
    html += `</div><div class="h3">${car.name}</div>${this.statBars(spec)}<div class="btns"><button class="btn gold" data-a="buyCar" ${ok ? '' : 'disabled'} style="flex:1">${ok ? '購入 ' + yen(car.price) : ICO('lock', '#111', 14) + ' ' + carLockText(car)}</button><button class="btn" data-a="testDrive" data-v="shop:${car.id}">試乗</button><button class="btn" data-a="cmpShop">比較</button></div>`;
    this.stageInfo(`<div class="car-name">${car.name}</div><div class="car-sub">${this.carLine(car)}</div><div class="money" style="display:inline-block;margin-top:6px">${yen(car.price)}</div>`);
    return html;
  },
  a_shopTab(v) { this.tab = v; this.sel = null; this.render(); },
  a_selShop(v) { this.sel = v; this.render(); },
  a_goTuneCur(tab) { this.open('tuning', { uid: SAVE.data.current, tab }); },
  a_cmpShop() { this.cmpB = SAVE.data.current; this.showCompare(this.sel); },
  a_buyCar() { const car = CAR_BY_ID[this.sel]; this.modal(`<h2>車両購入</h2><div class="note" style="font-size:14px">${car.name} を ${yen(car.price)} で購入しますか？<br>所持金: ${yen(SAVE.data.money)}</div><div class="btns"><button class="btn gold" data-a="buyYes">購入する</button><button class="btn" data-a="closeModal">キャンセル</button></div>`); },
  a_buyYes() { const car = CAR_BY_ID[this.sel]; this.closeModal(); if (!SAVE.spend(car.price)) return; const c = SAVE.newCar(car.id); SAVE.data.cars.push(c); SAVE.data.current = c.uid; SAVE.save(); AUDIO.buy(); this.toast(car.name + ' を購入しました！'); checkAch(); this.render(); },
  // ---------------- チューニング ----------------
  tuneInst() { if (this._sim) return this._sim; return SAVE.data.cars.find(c => c.uid === (this.arg && this.arg.uid)) || SAVE.cur(); },
  r_tuningOld(arg) {
    const inst = this.tuneInst(); const car = CAR_BY_ID[inst.id]; const t = inst.tune, lk = inst.look;
    $('panelTitle').textContent = 'TUNING'; if (!this.tab) this.tab = (arg && arg.tab) || 'engine';
    this.show.setCar(inst);
    const tabs = [['engine', 'エンジン'], ['chassis', '足回り'], ['tire', 'タイヤ'], ['aero', '外装'], ['paint', 'ペイント/リバリー']];
    const spec = this.instSpec(inst); if (!this.baseSpec || this.baseSpec.car.id !== car.id) this.baseSpec = computeSpec(car);
    let html = `<div class="note">${car.name}　<span class="badge">${Math.round(spec.hp)}PS</span>　費用合計 ${yen(inst.spent)}</div><div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${this.tab === k ? 'on' : ''}" data-a="tuneTab" data-v="${k}">${l}</button>`).join('')}</div>`;
    const priceTag = (owned, price) => `<span class="pr ${owned ? 'own' : ''}">${owned ? '所有' : yen(price)}</span>`;
    const lvRow = key => { const P = PARTS[key]; return `<div class="h3">${P.label}</div><div class="opt-row">${P.lv.map((p, i) => `<button class="opt ${(t[key] || 0) === i ? 'on' : ''}" data-a="tuneLv" data-v="${key}:${i}">${P.names[i]}${priceTag(i <= (t.owned[key] || 0), p)}</button>`).join('')}</div>`; };
    const optRow = key => { const P = PARTS[key]; return `<div class="h3">${P.label}</div><div class="opt-row">${P.opts.map(o => `<button class="opt ${t[key] === o.id ? 'on' : ''}" data-a="tuneOpt" data-v="${key}:${o.id}">${o.name}${priceTag(t.owned[key].includes(o.id), o.price)}</button>`).join('')}</div>`; };
    const slider = (key, label, min, max, step, unit, en = true) => `<div class="row"><label>${label}</label><input type="range" min="${min}" max="${max}" step="${step}" value="${t[key] ?? 0}" data-in="tuneSl" data-k="${key}" ${en ? '' : 'disabled'}><span class="val" id="sv_${key}">${(+(t[key] ?? 0)).toFixed(step < 1 ? (step < 0.1 ? 2 : 1) : 0)}${unit}</span></div>`;
    if (this.tab === 'engine') { html += optRow('engine') + ['ecu', 'intercooler', 'intake', 'muffler', 'cam', 'piston', 'fuel', 'flywheel', 'clutch', 'reinforce', 'nos'].map(lvRow).join(''); html += `<div class="note">ターボ/大型ターボは高回転でパワーが出る代わりにターボラグが増加。スーパーチャージャーはラグなし。インタークーラーは過給機付きの時のみ効果。</div>`; }
    if (this.tab === 'chassis') {
      html += lvRow('susp') + lvRow('stab') + lvRow('strut') + lvRow('brake') + optRow('diff') + lvRow('knuckle') + lvRow('trans') + lvRow('weight');
      const adj = t.susp >= 2; html += `<div class="h3">セッティング ${adj ? '' : '<span class="tag">車高調以上で調整可</span>'}</div>` + slider('height', '車高 (mm)', -60, 20, 5, 'mm', adj) + slider('camber', 'キャンバー角', -5, 0, 0.5, '°', adj) + slider('toeF', 'フロント トー角', -0.5, 0.5, 0.1, '°', adj) + slider('toeR', 'リア トー角', -0.5, 0.5, 0.1, '°', adj) + slider('final', 'ファイナルギア比', 0.85, 1.15, 0.01, 'x', t.trans >= 1);
      html += `<div class="note">LSDは駆動輪の空転を抑えドリフトを持続しやすくします（2WAYは減速時も効く）。キャンバーは-2.5°前後で横グリップ最大。リアのトーアウトはオーバーステア傾向。</div>`;
    }
    if (this.tab === 'tire') {
      html += optRow('tire'); html += `<div class="h3">サイズ</div>` + slider('tireW', 'タイヤ幅', -1, 2, 1, '') + slider('track', 'トレッド幅（左右）', -2, 4, 1, ' cm') + slider('wheelIn', 'ホイール (インチ)', 15, 19, 1, '"');
      html += `<div class="note">ドリフトタイヤは滑り出しが穏やかで角度を保ちやすい。ウェットタイヤは雨・雪で効果大。タイヤ幅を広げるとグリップ向上。</div>`;
    }
    if (this.tab === 'aero') {
      html += styleRow(lk) + kitRow(lk);
      for (const k of ['front', 'rear', 'side', 'fender', 'wing', 'hood', 'roof', 'trunk', 'mirror', 'exhaust', 'hl', 'head', 'tail']) { const A = AERO[k]; html += `<div class="h3">${A.label}</div><div class="opt-row">${A.opts.map(([nm, p, o2], i) => (o2 && o2.only && (CAR_BY_ID[inst.id] || {}).series !== o2.only) ? '' : `<button class="opt ${(lk[k] || 0) === i ? 'on' : ''}" data-a="lookOpt" data-v="${k}:${i}">${nm}${priceTag((lk.owned[k] || [0]).includes(i), p)}</button>`).join('')}</div>`; }
      html += hlColRow(lk) + mufRow(lk);
      html += `<div class="h3">ホイール</div><div class="opt-row">${WHEEL_STYLES.filter(w => (!w.xmas || hasItem('wheel:' + w.id)) && (!w.chest || invHas(w.id)) && (!w.only || (CAR_BY_ID[inst.id] || {}).series === w.only)).map(w => `<button class="opt ${lk.wheel === w.id ? 'on' : ''}" data-a="lookWheel" data-v="${w.id}">${w.name}${priceTag(lk.owned.wheel.includes(w.id), w.price)}</button>`).join('')}</div>`;
      html += `<div class="h3">ホイールカラー</div><div class="swatches">${['#c8c8cc', '#1a1a1a', '#d4af37', '#ffffff', '#d01020', '#1e5aff', '#ff6a00', '#5a5f6a'].map(c => `<button class="sw ${lk.wheelColor === c ? 'on' : ''}" style="background:${c}" data-a="lookSet" data-v="wheelColor:${c}"></button>`).join('')}</div>`;
      html += `<div class="h3">ブレーキキャリパー色</div><div class="swatches">${['#cc1010', '#f0c000', '#1e5aff', '#1a1a1a', '#c8c8cc'].concat(hasItem('caliper:gold') ? ['#d4af37'] : []).concat(ITEMS.filter(i => i.type === 'caliper' && invHas(i.id)).map(i => i.color)).map(c => `<button class="sw ${(lk.caliper || '#cc1010') === c ? 'on' : ''}" style="background:${c}" data-a="lookSet" data-v="caliper:${c}"></button>`).join('')}</div>`;
      const glows = ITEMS.filter(i => i.type === 'neon' && invHas(i.id)).map(i => [i.id, i.name + ' ★', 0]).concat([['none', 'なし', 0]]); glows.push(...[ ['red', 'レッド', 60000], ['blue', 'ブルー', 60000], ['green', 'グリーン', 60000], ['purple', 'パープル', 60000], ['white', 'ホワイト', 60000]].concat(hasItem('glow:xmas') ? [['xmas', 'クリスマス (限定)', 0]] : []));
      html += `<div class="h3">アンダーネオン</div><div class="opt-row">${glows.map(([id, nm, p]) => `<button class="opt ${(lk.glow || 'none') === id ? 'on' : ''}" data-a="lookGlow" data-v="${id}">${nm}${priceTag((lk.owned.glow || ['none']).includes(id) || p === 0, p)}</button>`).join('')}</div>`;
      const accs = [['none', 'なし']].concat([['hat', 'サンタ帽'], ['antler', 'トナカイの角'], ['tree', 'ミニツリー']].filter(([id]) => hasItem('acc:' + id)));
      if (accs.length > 1) html += `<div class="h3">ルーフ飾り（クリスマス限定）</div><div class="opt-row">${accs.map(([id, nm]) => `<button class="opt ${(lk.acc || 'none') === id ? 'on' : ''}" data-a="lookSet" data-v="acc:${id}">${nm}</button>`).join('')}</div>`;
      if (CAR_BY_ID[inst.id] && CAR_BY_ID[inst.id].body === 'sleigh') html += `<div class="h3">トナカイ（そり専用）</div><div class="opt-row">${[['on', 'あり（5頭・先頭は赤鼻）'], ['off', 'なし']].map(([v, nm]) => `<button class="opt ${(lk.reindeer || 'on') === v ? 'on' : ''}" data-a="lookSet" data-v="reindeer:${v}">${nm}</button>`).join('')}</div>`;
      { const kits = ITEMS.filter(i => i.type === 'kit' && invHas(i.id)); lk.kit = lk.kit || {};
        html += `<div class="h3">ボディパーツ（仕上げ色つき）</div>` + (kits.length ? ['wing', 'front', 'rear', 'side', 'hood', 'roof', 'trunk'].map(sl => { const ks = kits.filter(k => k.slot === sl); if (!ks.length) return ''; return `<div class="note" style="margin-top:6px">${AERO[sl].label}</div><div class="opt-row"><button class="opt ${!lk.kit[sl] ? 'on' : ''}" data-a="unequipKit" data-v="${sl}">なし</button>${ks.map(k => `<button class="opt ${lk.kit[sl] === k.id ? 'on' : ''}" data-a="equipKit" data-v="${k.id}"><span style="display:inline-block;width:12px;height:12px;background:rgb(${k.fin.map(v => Math.round(v * 255)).join(',')});border:1px solid #fff;margin-right:4px;vertical-align:middle"></span>${esc(k.name)}</button>`).join('')}</div>`; }).join('') : `<div class="note">パーツショップ（カスタムアイテム）・カードパック・ダイヤショップで手に入ります。</div>`); }
      if (hasItem('wacc:antler')) html += `<div class="h3">窓飾り（クリスマス限定）</div><div class="opt-row">${[['none', 'なし'], ['antler', 'トナカイの角（左右の窓）']].map(([id, nm]) => `<button class="opt ${(lk.wacc || 'none') === id ? 'on' : ''}" data-a="lookSet" data-v="wacc:${id}">${nm}</button>`).join('')}</div>`;
      { const pls = [['none', 'なし', null]].concat(hasItem('pglow:xmas') ? [['xmas', 'クリスマス（赤×緑）', 'E']] : []).concat(ITEMS.filter(i => i.type === 'plate' && invHas(i.id)).map(i => [i.id, i.name.replace(/^光るナンバー「|」$/g, ''), i.rarity]));
        html += `<div class="h3">光るナンバー</div>` + `<div class="opt-row">${pls.map(([id, nm, r]) => `<button class="opt ${(lk.plateGlow || 'none') === id ? 'on' : ''}" data-a="lookSet" data-v="plateGlow:${id}">${id !== 'none' && id !== 'xmas' ? plateIcon(ITEM_BY_ID[id], 22) + ' ' : ''}${nm}${r ? `<span class="pr" style="color:${RARITY[r].color}">${RARITY[r].name}</span>` : ''}</button>`).join('')}</div>` + (pls.length < 2 ? `<div class="note">カードパック・日替わりショップ・クリスマスショップで入手できます。</div>` : ''); }
      { const cur = lk.meter || 'std'; const ms = Object.keys(METER_STYLES).filter(meterOwned);
        html += `<div class="h3">スピードメーター</div><div class="note">レース中に表示されるメーターのデザイン（この車に設定されます）。カードパック・日替わりショップ・イベントで種類が増えます（所持 ${ms.length} / ${Object.keys(METER_STYLES).length}）。</div><div class="meter-grid">${Object.keys(METER_STYLES).map(id => { const M = METER_STYLES[id], own = meterOwned(id), r = meterRarity(id); return `<button class="mcard ${cur === id ? 'on' : ''} ${own ? '' : 'lock'}" data-a="${own ? 'setMeter' : 'noop'}" data-v="${id}">${own ? meterPreview(id, 64) : ICO('lock', '#555', 30)}<b>${esc(M.name)}</b><small>${M.kind === 'digital' ? 'デジタル' : 'アナログ'}${r ? ` ・ <span style="color:${RARITY[r].color}">${RARITY[r].name}</span>` : ' ・ 標準'}</small></button>`; }).join('')}</div>`; }
      html += `<div class="h3">ウィンドウ / ナンバー</div><div class="row"><label>ウィンドウの色</label><input type="range" min="0" max="0.95" step="0.05" value="${lk.tint}" data-in="lookTint"><span class="val">${Math.round(lk.tint * 100)}%</span></div><div class="row"><label>ナンバープレート</label><input type="text" maxlength="12" value="${esc(lk.plate)}" data-in="lookPlate"></div>`;
      html += `<div class="note">ウイング・エアロは高速域のダウンフォース（グリップ）を増やし、わずかに空気抵抗が増えます。カーボンボンネットは軽量化。</div>`;
    }
    if (this.tab === 'paint') {
      html += `<div class="h3">塗装タイプ</div><div class="opt-row">${PAINT_TYPES.map(([id, nm, p]) => `<button class="opt ${lk.paint === id ? 'on' : ''}" data-a="lookPaint" data-v="${id}">${nm}${priceTag(lk.owned.paint.includes(id), p)}</button>`).join('')}</div>`;
      const pal = PALETTE.concat(hasItem('xmas:colors') || eventActive() ? XMAS_PALETTE : []);
      html += `<div class="h3">ボディカラー</div><div class="swatches">${pal.map(c => `<button class="sw ${lk.color === c ? 'on' : ''}" style="background:${c}" data-a="lookSet" data-v="color:${c}"></button>`).join('')}</div><div class="row"><label>カスタムカラー</label><input type="color" value="${lk.color}" data-in="lookColor" data-k="color" style="width:60px;height:34px;border:0;background:none"></div>`;
      html += `<div class="h3">リバリー（パターン）</div><div class="opt-row">${LIVERIES.filter(l => !l.xmas || hasItem('livery:' + l.id)).map(l => `<button class="opt ${lk.livery === l.id ? 'on' : ''}" data-a="lookLivery" data-v="${l.id}">${l.name}${priceTag(lk.owned.livery.includes(l.id), l.price)}</button>`).join('')}</div>`;
      html += `<div class="h3">サブカラー</div><div class="swatches">${pal.map(c => `<button class="sw ${lk.color2 === c ? 'on' : ''}" style="background:${c}" data-a="lookSet" data-v="color2:${c}"></button>`).join('')}</div><div class="row"><label>ゼッケン番号</label><input type="number" min="0" max="999" value="${lk.number}" data-in="lookNum"></div>`;
      html += `<div class="h3">デカール・ステッカー</div><div class="opt-row">${DECALS.filter(d => (!d.xmas || hasItem('decal:' + d.id)) && (!d.chest || invHas(d.id))).map(d => `<button class="opt ${lk.decals.includes(d.id) ? 'on' : ''}" data-a="lookDecal" data-v="${d.id}">${d.name}${priceTag(lk.owned.decals.includes(d.id), d.price)}</button>`).join('')}</div><div class="note">デカールはタップで装着/取り外し（購入済みは無料）。最大3枚。</div>`;
      // 限定カラー（カードパック）
      const cps = ITEMS.filter(i => i.type === 'paint' && invHas(i.id));
      html += `<div class="h3">限定カラー</div>` + (cps.length ? `<div class="opt-row">${cps.map(i => `<button class="opt ${lk.color === i.color && lk.paint === i.paint ? 'on' : ''}" data-a="lookChestPaint" data-v="${i.id}"><span style="display:inline-block;width:14px;height:14px;background:${i.color};border:1px solid #fff;vertical-align:middle;margin-right:4px"></span>${i.name}<span class="pr" style="color:${RARITY[i.rarity].color}">${RARITY[i.rarity].name}</span></button>`).join('')}</div>` : `<div class="note">カードパックや日替わりショップで手に入る特別なカラーです。</div>`);
      // デカールの貼り付け位置
      html += `<div class="h3">貼り付け位置</div>` + (lk.decals.length ? lk.decals.map((id, di) => { const d = DECALS.find(x => x.id === id) || { name: id }; const ps = Object.assign({ f: 'L', x: 0.2 + di * 0.18, y: 0.55, s: 1, r: 0 }, (lk.decalPos || {})[id] || {});
        const sl = (k, lab, min, max, step, val, f) => `<div class="row"><label>${lab}</label><input type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-in="decalPos" data-id="${id}" data-k="${k}"><span class="val">${f(val)}</span></div>`;
        const face = ps.f || 'L', side = face === 'L' || face === 'R'; const faces = [['L', '左側面'], ['R', '右側面'], ['H', 'ボンネット'], ['T', 'ルーフ'], ['K', 'トランク']];
        return `<div class="part" style="border-left-color:#3a8cff"><div class="ph">${esc(d.name)}</div><div class="opt-row">${faces.map(([f, nm]) => `<button class="opt ${face === f ? 'on' : ''}" data-a="decalFace" data-v="${id}:${f}">${nm}</button>`).join('')}</div>${sl('x', '前後位置', 0, 1, 0.01, ps.x, v => Math.round(v * 100) + '%')}${sl('y', side ? '高さ' : '左右位置', side ? 0.15 : 0, side ? 0.95 : 1, 0.01, ps.y, v => Math.round(v * 100) + '%')}${sl('s', '大きさ', 0.4, 2.5, 0.05, ps.s, v => Math.round(v * 100) + '%')}${sl('r', '回転', -180, 180, 5, ps.r, v => v + '°')}<div class="btns"><button class="btn" data-a="decalReset" data-v="${id}">位置をリセット</button></div></div>`; }).join('') : `<div class="note">デカールを装着すると、ここで位置・大きさ・回転を自由に調整できます。</div>`);
    }
    if (this.tab === 'engine') {
      const sps = ITEMS.filter(i => i.type === 'tune' && invHas(i.id)); const cur = inst.tune.special || '';
      html += `<div class="h3">限定チューン</div><div class="note">カードパック限定の特別なパーツ（1台に1つ装着可能）</div>` + `<div class="opt-row"><button class="opt ${!cur ? 'on' : ''}" data-a="setSpecial" data-v="">なし</button>${sps.map(i => `<button class="opt ${cur === i.id ? 'on' : ''}" data-a="setSpecial" data-v="${i.id}">${i.name}<span class="pr" style="color:${RARITY[i.rarity].color}">${RARITY[i.rarity].name}・${i.desc}</span></button>`).join('')}</div>` + (sps.length ? '' : `<div class="note">カードパックや日替わりショップで入手できます。</div>`);
    }
    html += `<div class="h3">性能（純正比）</div>${this.statBars(spec, this.baseSpec)}`;
    this.stageInfo(`<div class="car-name">${car.name}</div><div class="car-sub">${Math.round(spec.hp)}PS ・ ${spec.stats.top}km/h ・ ${spec.stats.accel.toFixed(1)}s</div>`);
    return html;
  },
  // ===== チューニング / カスタマイズ（カテゴリ式の新UI） =====
  TCATS: {
    tune: [
      { id: 'eng', icon: 'engine', name: 'エンジン本体', tab: 'engine', keys: ['engine', 'reinforce', 'piston', 'cam'] },
      { id: 'air', icon: 'turbo', name: '吸排気・過給', tab: 'engine', keys: ['intake', 'muffler', 'intercooler'] },
      { id: 'ecu', icon: 'chip', name: '制御・燃料・ニトロ', tab: 'engine', keys: ['ecu', 'fuel', 'nos'] },
      { id: 'drv', icon: 'drive', name: '駆動系', tab: 'engine', keys: ['flywheel', 'clutch'], keys2: ['trans', 'diff'] },
      { id: 'sus', icon: 'susp', name: 'サスペンション', tab: 'chassis', keys: ['susp', 'stab', 'strut', 'knuckle'] },
      { id: 'brk', icon: 'brake', name: 'ブレーキ・軽量化', tab: 'chassis', keys: ['brake', 'weight'] },
      { id: 'tir', icon: 'tire', name: 'タイヤ', tab: 'tire', keys: ['tire'], extra: ['サイズ'] },
      { id: 'set', icon: 'sliders', name: 'セッティング', tab: 'chassis', keys: [], extra: ['セッティング'] },
      { id: 'spc', icon: 'gem', name: '限定チューン', tab: 'engine', keys: [], extra: ['限定チューン'] }
    ],
    custom: [
      { id: 'col', icon: 'spray', name: 'ボディカラー', tab: 'paint', extra: ['塗装タイプ', 'ボディカラー', '限定カラー'] },
      { id: 'liv', icon: 'flag', name: 'リバリー', tab: 'paint', extra: ['リバリー（パターン）', 'サブカラー'] },
      { id: 'dec', icon: 'sticker', name: 'デカール', tab: 'paint', extra: ['デカール・ステッカー', '貼り付け位置'] },
      { id: 'frt', icon: 'carFront', name: 'フロント', tab: 'aero', akeys: ['front', 'hood', 'head'] },
      { id: 'sid', icon: 'carSide', name: 'サイド', tab: 'aero', akeys: ['side', 'fender', 'mirror'] },
      { id: 'rea', icon: 'wing', name: 'リア', tab: 'aero', akeys: ['rear', 'wing', 'tail', 'exhaust'] },
      { id: 'whl', icon: 'wheelI', name: 'ホイール', tab: 'aero', extra: ['ホイール', 'ホイールカラー', 'ブレーキキャリパー色'] },
      { id: 'acc', icon: 'neon', name: 'ネオン・ルーフ', tab: 'aero', akeys: ['roof'], extra: ['アンダーネオン', 'ルーフ飾り', '窓飾り', 'トナカイ（そり専用）'] },
      { id: 'mtr', icon: 'gauge', name: 'スピードメーター', tab: 'aero', extra: ['スピードメーター'] },
      { id: 'kit', icon: 'wing', name: 'ボディパーツ', tab: 'aero', extra: ['ボディパーツ（仕上げ色つき）'] },
      { id: 'win', icon: 'window', name: 'ウィンドウ・ナンバー', tab: 'aero', extra: ['ウィンドウ / ナンバー', '光るナンバー'] }
    ]
  },
  tuneSections(tab, arg) {
    const prev = this.tab; this.tab = tab; let full = ''; try { full = this.r_tuningOld(arg); } finally { this.tab = prev; }
    const out = {}; const parts = full.split('<div class="h3">'); parts.shift();
    for (const chunk of parts) { const i = chunk.indexOf('</div>'); const label = chunk.slice(0, i).replace(/<[^>]+>/g, '').trim(); out[label] = chunk.slice(i + 6); }
    return out;
  },
  r_tuning(arg) {
    const inst = this.tuneInst(); const car = CAR_BY_ID[inst.id]; const t = inst.tune, lk = inst.look;
    if (!this.tmode) { const tb = arg && arg.tab; this.tmode = tb === 'aero' || tb === 'paint' ? 'custom' : 'tune'; }
    $('panelTitle').textContent = this.tmode === 'tune' ? 'TUNING' : 'CUSTOMIZE';
    this.show.setCar(inst);
    const spec = this.instSpec(inst); if (!this.baseSpec || this.baseSpec.car.id !== car.id) this.baseSpec = computeSpec(car);
    const S = spec.stats, B = this.baseSpec.stats; const dv = (a, b, unit, low, f = 0) => { const d = a - b; const good = low ? d < 0 : d > 0; return `<b>${typeof a === 'number' ? a.toFixed(f) : a}</b><small>${unit}</small>${Math.abs(d) > (f ? 0.05 : 0.5) ? `<i class="${good ? 'up' : 'dn'}">${d > 0 ? '+' : ''}${d.toFixed(f)}</i>` : ''}`; };
    let html = `<div class="seg"><button class="${this.tmode === 'tune' ? 'on' : ''}" data-a="tMode" data-v="tune">${ICO('gear', 'currentColor', 15)} チューニング<small>性能アップ</small></button><button class="${this.tmode === 'custom' ? 'on' : ''}" data-a="tMode" data-v="custom">${ICO('spray', 'currentColor', 15)} カスタマイズ<small>見た目</small></button></div>`;
    html += `<div class="sum"><div class="sum-h"><span>${car.name}</span><span class="note">費用合計 ${yen(inst.spent)}</span></div><div class="sum-g"><div><span>出力</span>${dv(S.power, B.power, 'PS')}</div><div><span>最高速</span>${dv(S.top, B.top, 'km/h')}</div><div><span>0-100</span>${dv(S.accel, B.accel, 's', true, 1)}</div><div><span>重量</span>${dv(S.weight, B.weight, 'kg', true)}</div><div><span>ハンドリング</span>${dv(S.handling, B.handling, '')}</div><div><span>ドリフト</span>${dv(S.driftScore, B.driftScore, '')}</div></div></div>`;
    const cats = this.TCATS[this.tmode];
    const cat = cats.find(c => c.id === this.tcat);
    if (!cat) {
      html += `<div class="cat-grid">`;
      for (const c of cats) { const st = this.catStatus(c, t, lk); html += `<button class="cat" data-a="tCat" data-v="${c.id}"><span class="ic">${c.icon === 'wheelI' ? wheelIcon({ spokes: 6, rim: '#ffcf3d' }, 30) : ICO(c.icon, '#ffcf3d', 30)}</span><span class="nm">${c.name}</span><span class="st">${st}</span></button>`; }
      html += `</div><div class="note" style="margin-top:8px">カテゴリを選ぶとパーツが表示されます。購入済みのパーツはいつでも無料で付け替えできます。</div>`;
    } else {
      html += `<div class="cat-head"><button class="btn" data-a="tCatBack">◀ 一覧</button><div><span class="ic">${cat.icon === 'wheelI' ? wheelIcon({ spokes: 6, rim: '#ffcf3d' }, 22) : ICO(cat.icon, '#ffcf3d', 22)}</span> ${cat.name}</div></div>`;
      const secs = this.tuneSections(cat.tab, arg);
      const labels = []; (cat.keys || []).concat(cat.keys2 || []).forEach(k => PARTS[k] && labels.push(PARTS[k].label)); (cat.akeys || []).forEach(k => AERO[k] && labels.push(AERO[k].label)); (cat.extra || []).forEach(l => labels.push(l));
      let any = false;
      for (const l of labels) { const key = Object.keys(secs).find(x => x === l || x.startsWith(l)); if (!key) continue; any = true; html += `<div class="part"><div class="ph">${key}</div>${secs[key]}</div>`; }
      if (!any) html += `<div class="note">このカテゴリのパーツはありません。</div>`;
    }
    if (this.tmode === 'tune') html += `<div class="h3">性能（純正比）</div>${this.statBars(spec, this.baseSpec)}`;
    this.stageInfo(`<div class="car-name">${car.name}</div><div class="car-sub">${Math.round(spec.hp)}PS ・ ${S.top}km/h ・ ${S.accel.toFixed(1)}s</div>`);
    $('panelTitle').textContent = this.tmode === 'tune' ? 'TUNING' : 'CUSTOMIZE';
    return html;
  },
  catStatus(c, t, lk) {
    const names = [];
    for (const k of (c.keys || []).concat(c.keys2 || [])) { const P = PARTS[k]; if (!P) continue; if (P.lv) { const v = t[k] || 0; if (v > 0) names.push(P.names[v]); } else if (P.opts) { const o = P.opts.find(o => o.id === t[k]); if (o && o !== P.opts[0]) names.push(o.name); } }
    for (const k of (c.akeys || [])) { const A = AERO[k]; const v = lk[k] || 0; if (A && v > 0 && A.opts[v]) names.push(A.opts[v][0]); }
    if (c.id === 'col') names.push((PAINT_TYPES.find(p => p[0] === lk.paint) || [, 'メタリック'])[1]);
    if (c.id === 'liv' && lk.livery !== 'none') names.push((LIVERIES.find(l => l.id === lk.livery) || {}).name || '');
    if (c.id === 'dec' && lk.decals.length) names.push(lk.decals.length + '枚装着');
    if (c.id === 'whl') names.push((WHEEL_STYLES.find(w => w.id === lk.wheel) || {}).name || '');
    if (c.id === 'tir') names.push((PARTS.tire.opts.find(o => o.id === t.tire) || {}).name || '');
    if (c.id === 'set' && t.susp < 2) names.push('車高調で解放');
    if (c.id === 'mtr') names.push((METER_STYLES[lk.meter || 'std'] || METER_STYLES.std).name);
    if (c.id === 'win' && lk.plateGlow && lk.plateGlow !== 'none') names.push('光るナンバー');
    if (c.id === 'spc' && t.special && ITEM_BY_ID[t.special]) names.push(ITEM_BY_ID[t.special].name);
    return names.length ? esc(names.slice(0, 2).join('・')) + (names.length > 2 ? ` 他${names.length - 2}` : '') : '<span style="color:#777">純正</span>';
  },
  a_tMode(v) { this.tmode = v; this.tcat = null; $('panelBody').scrollTop = 0; this.render(); },
  a_tCat(v) { this.tcat = v; $('panelBody').scrollTop = 0; this.render(); },
  a_tCatBack() { this.tcat = null; $('panelBody').scrollTop = 0; this.render(); },
  a_tuneTab(v) { this.tab = v; $('panelBody').scrollTop = 0; this.render(); },
  buyPart(inst, price) { if (this._sim) return true; if (!SAVE.spend(price)) return false; inst.spent += price; SAVE.data.stats.parts++; AUDIO.buy(); checkAch(); return true; },
  afterTune() { if (this._sim) return; SAVE.save(); this.show.setCar(this.tuneInst(), true); this.render(); },
  a_tuneLv(v) { const [k, l] = v.split(':'); const lv = +l; const inst = this.tuneInst(); const t = inst.tune; if (lv > (t.owned[k] || 0)) { if (!this.buyPart(inst, PARTS[k].lv[lv])) return; t.owned[k] = lv; this.toast(PARTS[k].names[lv] + ' を装着しました'); } t[k] = lv; this.afterTune(); },
  a_tuneOpt(v) { const [k, id] = v.split(':'); const inst = this.tuneInst(); const t = inst.tune; const o = PARTS[k].opts.find(o => o.id === id); if (!t.owned[k].includes(id)) { if (!this.buyPart(inst, o.price)) return; t.owned[k].push(id); this.toast(o.name + ' を装着しました'); } t[k] = id; this.afterTune(); },
  in_tuneSl(val, el) { const inst = this.tuneInst(); const k = el.dataset.k; inst.tune[k] = +val; const sv = $('sv_' + k); if (sv) sv.textContent = (+val).toFixed(+el.step < 1 ? (+el.step < 0.1 ? 2 : 1) : 0) + ({ height: 'mm', camber: '°', toeF: '°', toeR: '°', final: 'x', wheelIn: '"' }[k] || ''); SAVE.save(); clearTimeout(this._slT); this._slT = setTimeout(() => { this.show.setCar(inst, true); this.render(); }, 250); },
  a_lookOpt(v) { const [k, i] = v.split(':'); const idx = +i; const inst = this.tuneInst(); const lk = inst.look; lk.owned[k] = lk.owned[k] || [0]; if (!lk.owned[k].includes(idx)) { if (!this.buyPart(inst, AERO[k].opts[idx][1])) return; lk.owned[k].push(idx); } lk[k] = idx; this.afterTune(); },
  a_mfType(id) { const inst = this.tuneInst(), lk = inst.look, m = MUFFLER_TYPES.find(x => x[0] === id); if (!m) return; lk.owned.mf = lk.owned.mf || ['stock']; if (!lk.owned.mf.includes(id) && !invHas('mf_' + id)) { if (!this.buyPart(inst, m[2])) return; lk.owned.mf.push(id); } lk.mfType = id; this.afterTune(); if (!this._sim) this.revSample(id); },
  revSample(id) { try { const car = CAR_BY_ID[this.tuneInst().id], e = AUDIO.createEngine(Object.assign({}, computeSpec(car, this.tuneInst().tune), { car, mfType: id, sound: car.sound }), true); if (!e) return; let r = 1000, up = true; const it = setInterval(() => { r += up ? 380 : -500; if (r > car.redline * 0.95) up = false; AUDIO.updateEngine(e, { rpm: r, thr: up ? 1 : 0, boost: up ? 0.6 : 0, slip: 0, speed: 0, redline: car.redline, gear: 1 }); if (!up && r < 1300) { clearInterval(it); AUDIO.stopEngine(e); } }, 50); } catch (x) { } },
  a_stockAll() { const inst = this.tuneInst(), lk = inst.look; for (const k of ['front', 'rear', 'side', 'wing', 'hood', 'roof', 'trunk', 'fender', 'hl']) lk[k] = (k === 'wing' && CAR_BY_ID[inst.id].body === 'rally') ? 2 : 0; lk.kit = {}; this.afterTune(); this.toast('純正スタイルに戻しました（買ったパーツはそのまま所有）'); },
  a_buyKit(id) { const k = BODY_KITS.find(x => x.id === id); if (!k) return; const inst = this.tuneInst(); const lk = inst.look; const own = Object.entries(k.set).every(([sl, i]) => (lk.owned[sl] || [0]).includes(i)); if (!own) { if (!this.buyPart(inst, k.price)) return; } for (const [sl, i] of Object.entries(k.set)) { lk.owned[sl] = lk.owned[sl] || [0]; if (!lk.owned[sl].includes(i)) lk.owned[sl].push(i); lk[sl] = i; } this.afterTune(); this.toast(k.name + ' を装着しました'); },
  a_hlCol(id) { const inst = this.tuneInst(); const lk = inst.look; lk.owned.hlCol = lk.owned.hlCol || ['white']; if (!lk.owned.hlCol.includes(id)) { if (!this.buyPart(inst, id === 'rainbow' ? 300000 : 50000)) return; lk.owned.hlCol.push(id); } lk.hlCol = id; this.afterTune(); },
  a_lookGlow(id) { const inst = this.tuneInst(); const lk = inst.look; lk.owned.glow = lk.owned.glow || ['none']; if (!lk.owned.glow.includes(id) && id !== 'xmas' && !(ITEM_BY_ID[id] && invHas(id))) { if (!this.buyPart(inst, 60000)) return; lk.owned.glow.push(id); } lk.glow = id; this.afterTune(); },
  a_lookWheel(id) { const inst = this.tuneInst(); const lk = inst.look; const w = WHEEL_STYLES.find(w => w.id === id); if (!lk.owned.wheel.includes(id)) { if (!this.buyPart(inst, w.price)) return; lk.owned.wheel.push(id); } lk.wheel = id; this.afterTune(); },
  a_setMeter(id) { if (!meterOwned(id)) return; const inst = this.tuneInst(); inst.look.meter = id; SAVE.save(); this.toast('メーター「' + METER_STYLES[id].name + '」にしました'); this.render(); },
  a_equipKit(id) { const k = ITEM_BY_ID[id]; if (!k || !invHas(id)) return; const inst = this.tuneInst(); inst.look.kit = inst.look.kit || {}; inst.look.kit[k.slot] = id; inst.look[k.slot] = k.shape; this.afterTune(); },
  a_unequipKit(sl) { const inst = this.tuneInst(); if (inst.look.kit) delete inst.look.kit[sl]; inst.look[sl] = 0; this.afterTune(); },
  a_lookSet(v) { const [k, c] = v.split(':'); const inst = this.tuneInst(); inst.look[k] = c; this.afterTune(); },
  in_lookColor(val) { const inst = this.tuneInst(); inst.look.color = val; SAVE.save(); clearTimeout(this._slT); this._slT = setTimeout(() => this.show.setCar(inst, true), 120); },
  in_lookTint(val, el) { const inst = this.tuneInst(); inst.look.tint = +val; el.nextElementSibling.textContent = Math.round(val * 100) + '%'; SAVE.save(); clearTimeout(this._slT); this._slT = setTimeout(() => this.show.setCar(inst, true), 150); },
  in_lookPlate(val) { const inst = this.tuneInst(); inst.look.plate = val.slice(0, 12); SAVE.save(); clearTimeout(this._slT); this._slT = setTimeout(() => this.show.setCar(inst, true), 400); },
  in_lookNum(val) { const inst = this.tuneInst(); inst.look.number = clamp(parseInt(val) || 0, 0, 999); SAVE.save(); clearTimeout(this._slT); this._slT = setTimeout(() => this.show.setCar(inst, true), 400); },
  a_lookPaint(id) { const inst = this.tuneInst(); const lk = inst.look; const p = PAINT_TYPES.find(x => x[0] === id); if (!lk.owned.paint.includes(id)) { if (!this.buyPart(inst, p[2])) return; lk.owned.paint.push(id); } lk.paint = id; this.afterTune(); },
  a_lookLivery(id) { const inst = this.tuneInst(); const lk = inst.look; const l = LIVERIES.find(x => x.id === id); if (!lk.owned.livery.includes(id)) { if (!this.buyPart(inst, l.price)) return; lk.owned.livery.push(id); } lk.livery = id; this.afterTune(); },
  a_lookDecal(id) { const inst = this.tuneInst(); const lk = inst.look; const d = DECALS.find(x => x.id === id); if (lk.decals.includes(id)) { lk.decals = lk.decals.filter(x => x !== id); return this.afterTune(); } if (lk.decals.length >= 6) { this.toast('デカールは最大6枚までです'); return; } if (!lk.owned.decals.includes(id)) { if (!this.buyPart(inst, d.price)) return; lk.owned.decals.push(id); } lk.decals.push(id); this.afterTune(); },
  // ---------------- 設定 ----------------
  r_settings() {
    $('panelTitle').textContent = 'SETTINGS'; const s = SAVE.data.settings; if (!this.tab) this.tab = 'sound';
    const tabs = [['sound', 'サウンド'], ['control', '操作'], ['graphics', 'グラフィック'], ['data', 'データ']].concat(DEV.owner ? [['dev', '開発者']] : []);
    if (this.tab === 'dev' && !DEV.owner) this.tab = 'sound';
    let html = `<div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${this.tab === k ? 'on' : ''}" data-a="setTab" data-v="${k}">${l}</button>`).join('')}</div>`;
    if (this.tab === 'control') html += `<button class="btn pri" style="width:100%;margin:6px 0 10px" data-a="tutorial">${ICO('book', '#111', 16)} チュートリアル（操作方法）を見る</button>`;
    const opt = (key, list) => `<div class="opt-row">${list.map(([v, l]) => `<button class="opt ${String(s[key]) === String(v) ? 'on' : ''}" data-a="setOpt" data-v="${key}:${v}">${l}</button>`).join('')}</div>`;
    if (this.tab === 'sound') {
      html += `<div class="h3 noi18n">言語 / Language</div><div class="opt-row noi18n"><button class="opt ${(s.lang || 'ja') === 'ja' ? 'on' : ''}" data-a="setLang" data-v="ja">日本語</button><button class="opt ${s.lang === 'en' ? 'on' : ''}" data-a="setLang" data-v="en">English</button></div>`;
      html += `<div class="row"><label>BGM 音量</label><input type="range" min="0" max="1" step="0.05" value="${s.bgm}" data-in="setVol" data-k="bgm"><span class="val">${Math.round(s.bgm * 100)}</span></div>` + [['ui', 'UI効果音 音量', 0.8], ['engine', 'エンジン音量', 0.9], ['tire', 'タイヤ音量', 0.8], ['sfx', 'その他の効果音 音量', 0.8]].map(([k, l, d]) => `<div class="row"><label>${l}</label><input type="range" min="0" max="1" step="0.05" value="${s[k] ?? d}" data-in="setVol" data-k="${k}"><span class="val">${Math.round((s[k] ?? d) * 100)}</span></div>`).join('');
      html += `<div class="h3">ミュート</div>` + opt('mute', [[false, 'OFF'], [true, 'ON']]);
      html += this.musicPlayerHTML();
      html += `<div class="note">BGMはゲーム内で生成するオリジナル曲に加えて、追加した音楽ファイル（MP3）も通常レース・タイムアタック・ストーリーでランダムに流れます。クリスマスイベントのレースでは専用曲が流れます。PCではレース中に M キーで曲を変更できます。</div>`;
    }
    if (this.tab === 'control') {
      const pm = this.ctrlPresetMatch();
      html += `<div class="h3">スマホの操作プリセット</div><div class="note">操作が苦手な人向けの設定もあります。選んだあとに下の項目で細かく変更できます（変更すると「カスタム」になります）。</div><div class="preset-grid">${CTRL_PRESETS.map(p => `<button class="preset ${pm === p.id ? 'on' : ''}" data-a="ctrlPreset" data-v="${p.id}"><b>${p.name}</b><small>${p.desc}</small></button>`).join('')}<div class="preset ${pm === 'custom' ? 'on' : ''} ro"><b>カスタム</b><small>自分で細かく設定した状態</small></div></div>`;
      html += `<div class="h3">ライバルの強さ（ストーリー・イベント）</div>` + opt('aiLevel', [[0, 'やさしい'], [1, 'ふつう'], [2, 'むずかしい']]);
      html += `<div class="h3">トランスミッション</div>` + opt('trans', [['AT', 'オートマ (AT)'], ['MT', 'マニュアル (MT)']]);
      html += `<div class="h3">ドリフトアシスト（自動カウンター）</div>` + opt('assist', [[0, 'OFF'], [1, '弱'], [2, '標準'], [3, '強']]);
      html += `<div class="row"><label>ステアリング感度</label><input type="range" min="0" max="1" step="0.05" value="${s.steerSens}" data-in="setNum" data-k="steerSens"><span class="val">${Math.round(s.steerSens * 100)}</span></div><div class="note">ハンドルはボタン/キーを押している時間に応じて切れ角が増えます。感度を上げると早く切れます。</div>`;
      html += `<div class="h3">アクセル</div>` + opt('accelMode', [['hold', '押している間'], ['toggle', 'タップでON/OFF'], ['auto', '自動（ブレーキで減速）']]) + `<div class="note">「タップでON/OFF」はGASボタンを1回タップすると踏みっぱなしになり、もう1回で離します（ブレーキ中は自動で離します）。「自動」はGASボタンが消えて常にアクセルON。</div>`;
      html += `<div class="h3">ハンドル</div>` + opt('steerMode', [['buttons', '◀ ▶ ボタン'], ['slide', 'スライド操作'], ['gyro', '傾き（ジャイロ）']]) + `<div class="note">「スライド操作」は左側のエリアに指を置いて左右になぞると、なぞった量だけハンドルが切れます（細かく調整しやすい）。</div>`;
      html += `<div class="h3">操作アシスト</div>` + `<div class="row"><label>オートサイドブレーキ</label></div>` + opt('autoHand', [[false, 'OFF'], [true, 'ON（きついコーナーで自動でドリフトのきっかけ）']]) + `<div class="row"><label>オートニトロ</label></div>` + opt('autoNitro', [[false, 'OFF'], [true, 'ON（直線で自動で使う）']]);
      html += `<div class="h3">ボタン</div>` + opt('layout', [['C', 'スマホ標準（左：ハンドル／右：アクセル・ブレーキ）'], ['A', 'レイアウトA（左右ハンドル）'], ['B', 'レイアウトB（左手ハンドル）']]) + opt('mirror', [[false, '左右 通常'], [true, '左右 入れ替え（アクセルを左手に）']])
        + `<div class="row"><label>ボタンの大きさ</label><input type="range" min="0.7" max="1.3" step="0.05" value="${s.btnScale}" data-in="setNum" data-k="btnScale"><span class="val">${Math.round(s.btnScale * 100)}</span></div>`
        + `<div class="row"><label>ボタンの濃さ</label><input type="range" min="0.3" max="1" step="0.05" value="${s.btnAlpha}" data-in="setNum" data-k="btnAlpha"><span class="val">${Math.round(s.btnAlpha * 100)}</span></div>`
        + `<div class="row"><label>タッチボタンの表示</label></div>` + opt('touchUI', [['auto', '自動'], ['on', '常に表示'], ['off', '非表示']]) + `<div class="btns"><button class="btn" data-a="ctrlTest">試し走りで確認する</button></div>`;
      html += `<div class="h3">ジャイロの細かい設定</div><div class="opt-row"><button class="opt ${!Gyro.on ? 'on' : ''}" data-a="${Gyro.on ? 'gyroToggle' : 'noop'}">OFF</button><button class="opt ${Gyro.on ? 'on' : ''}" data-a="${Gyro.on ? 'noop' : 'gyroToggle'}">ON</button><button class="opt" data-a="gyroCal">現在の傾きを中央に</button></div>`
        + `<div class="row"><label>ジャイロ感度</label><input type="range" min="0" max="1" step="0.05" value="${s.gyroSens}" data-in="setNum" data-k="gyroSens"><span class="val">${Math.round(s.gyroSens * 100)}</span></div>` + opt('gyroInvert', [[false, '左右 通常'], [true, '左右 反転']])
        + `<div class="note">ONにすると ◀ ▶ ボタンが消え、端末の傾きでハンドルを切れます（傾けた角度に比例してアナログに切れます）。レース中は画面の GYRO ボタンでもON/OFFでき、CENTER ボタンで中央を補正できます。<br>※ claude.ai 上の表示ではモーションセンサーがブラウザ側で制限され、使えない場合があります。その場合は理由を表示して自動でOFFに戻ります。</div>`;
      html += `<div class="h3">PC キーボード</div><div class="keys"><kbd>W / ↑</kbd><span>アクセル</span><kbd>S / ↓</kbd><span>ブレーキ（停止中長押しでバック）</span><kbd>A / ←</kbd><span>左ハンドル</span><kbd>D / →</kbd><span>右ハンドル</span><kbd>Space</kbd><span>サイドブレーキ</span><kbd>E / X</kbd><span>ニトロ</span><kbd>Shift</kbd><span>ギアアップ</span><kbd>Ctrl / Q</kbd><span>ギアダウン（Ctrl+W 等はブラウザの機能が優先されるためQも使えます）</span><kbd>C</kbd><span>カメラ切り替え</span><kbd>N</kbd><span>ニュートラル</span><kbd>R</kbd><span>リセット（コースに戻す）</span><kbd>M</kbd><span>曲を変更</span><kbd>Esc / P</kbd><span>ポーズメニュー</span></div>`;
      html += `<div class="h3">スマートフォン</div><div class="keys"><kbd>◀ ▶</kbd><span>ハンドル左 / 右（押している時間で切れ角が増加）</span><kbd>GAS</kbd><span>アクセル（右下）</span><kbd>BRAKE</kbd><span>ブレーキ（左下）</span><kbd>E-BRAKE</kbd><span>サイドブレーキ</span><kbd>NITRO</kbd><span>ニトロ</span><kbd>▲ ▼</kbd><span>ギアアップ / ダウン</span><kbd>CAM</kbd><span>カメラ切り替え</span><kbd>GYRO</kbd><span>ジャイロ操作 ON/OFF</span><kbd>CENTER</kbd><span>ジャイロの中央補正（ジャイロON時）</span><kbd>II</kbd><span>ポーズ</span></div>`;
      html += `<div class="h3">ゲームパッド</div><div class="note">左スティック: ハンドル / RT: アクセル / LT: ブレーキ / A: サイドブレーキ / B: ニトロ / RB・LB: シフト / Y: カメラ / START: ポーズ</div>`;
    }
    if (this.tab === 'graphics') {
      html += `<div class="h3">画質</div>` + opt('quality', [[0, '低（軽量）'], [1, '中'], [2, '高']]) + `<div class="note">スマートフォンで重い場合は「低」を選んでください。次のレースから景観の密度に反映されます。</div>`;
      html += `<div class="h3">初期カメラ</div>` + opt('camera', [[0, '三人称'], [1, 'ボンネット'], [2, 'コックピット'], [3, 'バンパー'], [4, 'ドリフト追従']]);
      html += `<div class="h3">FPS表示</div>` + opt('showFps', [[false, 'OFF'], [true, 'ON']]);
      html += `<div class="h3">クリスマステーマ（ガレージ装飾）</div>` + opt('xmasTheme', [['auto', '自動（イベント期間）'], ['on', 'ON'], ['off', 'OFF']]);
    }
    if (this.tab === 'dev' && DEV.owner) {
      html += `<div class="note" style="color:var(--gold)">${ICO('wrench', '#ffcf3d', 15)} 開発者モード（このページの所有者にだけ表示されます）</div><div class="btns"><button class="btn gold" data-a="openDev" style="flex:1">開発者メニューを開く ▶</button></div>`;
      html += `<div class="h3">無限マネー</div>` + opt('devInfinite', [[false, 'OFF'], [true, 'ON（購入しても減らない）']]);
      html += `<div class="h3">お金を追加</div><div class="btns">${[1e6, 1e7, 1e8, 1e9].map(n => `<button class="btn gold" data-a="devMoney" data-v="${n}">+${yen(n)}</button>`).join('')}</div><div class="note">現在: ${yen(SAVE.data.money)}</div>`;
      html += `<div class="h3">アドベントカレンダーのテスト</div>` + opt('devAdvent', [[false, 'OFF（本来の日付）'], [true, 'ON（12/25扱いで全部開けられる）']]) + `<div class="btns"><button class="btn" data-a="devAdvReset">開けた扉をリセット</button></div>`;
      html += `<div class="h3">その他</div><div class="btns"><button class="btn" data-a="devLevel">レベル+5</button><button class="btn" data-a="devStory">ストーリー全話クリア扱い</button></div>`;
    }
    if (this.tab === 'data') {
      html += `<div class="h3">自動セーブ</div><div class="note" style="font-size:13px;color:#fff">状態: ${saveLabel()}</div><div class="note" style="font-size:12px;line-height:1.8">進行状況（所持金・車両・カスタマイズ・チューニング・ストーリー・記録・解放マップ・設定・実績）は、変更があるたびに自動で保存されます。<br>・端末のブラウザ内（2か所に二重保存）<br>${window.DL_FIREBASE ? '・クラウドにも自動保存（Googleでログインすると、別の端末でも続きから遊べます）' : '・claude.ai にサインインしていて保存が許可されている場合は、アカウントのクラウドにも保存（別の端末でも続きから遊べます）'}<br>レース中も30秒ごと、アプリを閉じる/切り替える時にも保存します。</div><div class="btns"><button class="btn pri" data-a="saveNow">今すぐ保存</button></div>`;
      if (window.DL_FIREBASE) { const F = window.DL_FB; const g = F.isGoogle();
        html += `<div class="h3">アカウント</div><div class="note" style="font-size:13px;color:#fff"><span class="${g ? 'noi18n' : ''}">${esc(F.label())}</span>${g && F.user && F.user.email && F.user.email !== F.label() ? `<br><small style="color:#aaa">${esc(F.user.email)}</small>` : ''}</div><div class="note" style="font-size:12px;line-height:1.8">${g ? 'このGoogleアカウントにセーブデータを保存しています。別の端末でも同じアカウントでログインすると続きから遊べます。' : 'Googleでログインすると、今のデータを引き継いだままクラウドに保存され、スマホとPCで同じデータを使えます。<br>※すでに別の端末でログインしたことがあるアカウントの場合は、そのアカウントのデータが読み込まれます。'}</div>
          <div class="btns">${g ? `<button class="btn" data-a="fbLogout">ログアウト</button>` : `<button class="btn pri" data-a="fbLogin" style="flex:1">Googleでログイン</button>`}</div>${g && F.user ? `<div class="note" style="font-size:10px;color:#666;word-break:break-all">ユーザーID: ${esc(F.user.uid)}</div>` : ''}<div class="note" style="font-size:12px">開発者モード: <b style="color:${DEV.owner ? '#2fdc7a' : '#ff8a8a'}">${esc(DEV.why)}</b>${DEV.owner ? '' : ' <button class="btn" data-a="devRecheck" style="padding:3px 8px;font-size:11px">再確認</button>'}</div>`; }
      const el = SAVE.data.errLog || [];
      html += `<div class="h3">エラー情報</div>` + (el.length ? `<textarea id="errLogText" readonly>${esc(el.map(x => new Date(x.t).toLocaleString('ja-JP') + ' ×' + x.n + ' ' + x.m + ' [' + x.v + ']').join('\n'))}</textarea><div class="btns"><button class="btn" data-a="copyErr">エラー情報をコピー</button><button class="btn" data-a="clearErr">消去</button></div>` : `<div class="note">記録されたエラーはありません。</div>`);
      html += `<div class="h3">バックアップコード</div><textarea id="saveCode" readonly>${SAVE.exportCode()}</textarea><div class="btns"><button class="btn" data-a="copyCode">コードをコピー</button></div>`;
      html += `<div class="h3">コードから復元</div><textarea id="importCode" placeholder="バックアップコードを貼り付け"></textarea><div class="btns"><button class="btn" data-a="importCode">復元する</button></div>`;
      html += `<div class="h3">リセット</div><div class="btns"><button class="btn" data-a="resetAsk" style="border-color:#a00">セーブデータを初期化</button></div>`;
    }
    return html;
  },
  musicPlayerHTML() {
    const tr = AUDIO.music.track; return `<div class="h3">ミュージックプレイヤー</div><div class="player"><button class="btn" data-a="mPrev">⏮</button><button class="btn" data-a="mPlay">${AUDIO.music.paused || !AUDIO.music.playing ? '▶' : '❚❚'}</button><button class="btn" data-a="mNext">⏭</button><div class="nm">♪ ${tr ? tr.name : '---'}</div></div><div class="note" style="font-size:11px">${TRACKS.filter(t => !AUDIO.unlocked(t)).length ? ICO('lock', '#888', 12) + ' カードパック・ショップで手に入る曲：あと' + TRACKS.filter(t => !AUDIO.unlocked(t)).length + '曲' : ''}</div><div class="list">${TRACKS.filter(t => AUDIO.unlocked(t)).map(t => `<button class="item ${tr && tr.id === t.id ? 'sel' : ''}" data-a="mSel" data-v="${t.id}"><div class="grow"><div class="t">${t.name}</div><div class="s">${t.lock ? '限定曲' : { race: '峠レース', menu: 'メニュー', garage: 'ガレージ', story: 'ストーリー', xmas: 'クリスマス' }[t.cat]} ・ ${t.bpm} BPM</div></div></button>`).join('')}</div>`;
  },
  a_setTab(v) { this.clearBuy(); this.tab = v; this.render(); },
  a_setLang(v) { const s = SAVE.data.settings; if ((s.lang || 'ja') === v) return; s.lang = v; SAVE.save(); try { CLOUD.flush(); } catch (e) { } this.toast(v === 'en' ? 'Switching to English…' : '日本語に切り替えています…'); setTimeout(() => location.reload(), 400); },
  a_setOpt(v) {
    const [k, raw] = v.split(':'); const s = SAVE.data.settings; let val = raw === 'true' ? true : raw === 'false' ? false : isNaN(+raw) ? raw : +raw; s[k] = val; SAVE.save();
    if (k === 'mute') AUDIO.setVol({ mute: val }); if (k === 'layout') this.applyLayoutClass();
    if (k === 'touchUI') document.body.classList.toggle('touch', this.touchUI());
    if (k === 'xmasTheme') { this.show.rebuildStudio(); AUDIO.playCat(xmasThemeOn() ? 'xmas' : 'menu'); }
    if (k === 'showFps') $('fps').classList.toggle('hidden', !val);
    if (k === 'devInfinite') { if (!DEV.owner) { s.devInfinite = false; } this.refreshTop(); }
    if (k === 'trans' && this.game.active) this.game.veh.auto = val !== 'MT';
    if (k === 'steerMode') { if (val === 'gyro' && !Gyro.on) Gyro.enable(); else if (val !== 'gyro' && Gyro.on) Gyro.disable(); }
    if (['accelMode', 'steerMode', 'mirror', 'layout'].includes(k)) this.applyCtrl();
    this.render();
  },
  in_setVol(val, el) { const k = el.dataset.k; SAVE.data.settings[k] = +val; AUDIO.setVol({ [k]: +val }); el.nextElementSibling.textContent = Math.round(val * 100); SAVE.save(); },
  in_setNum(val, el) { SAVE.data.settings[el.dataset.k] = +val; el.nextElementSibling.textContent = Math.round(val * 100); SAVE.save(); if (['btnScale', 'btnAlpha'].includes(el.dataset.k)) this.applyCtrl(); },
  a_mPrev() { AUDIO.nextTrack(-1); this.refreshMusic(); }, a_mNext() { AUDIO.nextTrack(1); this.refreshMusic(); },
  a_mPlay() { if (!AUDIO.music.playing) AUDIO.playCat(AUDIO.music.cat || 'menu', true); else AUDIO.togglePause(); this.refreshMusic(); },
  a_mSel(id) { AUDIO.play(id); this.refreshMusic(); },
  refreshMusic() { if (this.paused) this.pause(true); else if (this.screen === 'settings') this.render(); },
  a_copyCode() { const t = $('saveCode'); try { navigator.clipboard.writeText(t.value).then(() => this.toast('コピーしました'), () => { t.select(); this.toast('テキストを選択しました。手動でコピーしてください'); }); } catch (e) { t.select(); this.toast('テキストを選択しました。手動でコピーしてください'); } },
  a_importCode() { const v = $('importCode').value; if (!v.trim()) return this.toast('コードを入力してください'); if (SAVE.importCode(v)) { this.toast('復元しました'); this.goMenu(); } else { AUDIO.error(); this.toast('コードが正しくありません'); } },
  a_resetAsk() { this.modal(`<h2>データ初期化</h2><div class="note" style="font-size:14px">すべての進行状況が消去されます。よろしいですか？</div><div class="btns"><button class="btn pri" data-a="resetYes">初期化する</button><button class="btn" data-a="closeModal">キャンセル</button></div>`); },
  a_resetYes() { SAVE.reset(); try { for (const m of MAPS) localStorage.removeItem('dl_ghost_' + m.id); } catch (e) { } this.closeModal(); this.toast('初期化しました'); this.goMenu(); },
  // ---------------- プロフィール / 実績 ----------------
  r_profile() {
    $('panelTitle').textContent = 'PROFILE'; const d = SAVE.data; const st = d.stats;
    let html = `<div class="kv" style="font-size:13px"><div>レベル</div><div>Lv.${SAVE.level()} (${d.xp.toLocaleString()} XP)</div><div>所持金</div><div>${yen(d.money)}</div><div>所持車両</div><div>${d.cars.length}台</div><div>ストーリー</div><div>${d.story.cleared.length} / ${STORY.length}話</div><div>レース数 / 勝利</div><div>${st.races} / ${st.wins}</div><div>購入パーツ</div><div>${st.parts}</div><div>夜間走行</div><div>${(st.nightDist / 1000).toFixed(1)} km</div></div>`;
    html += `<div class="h3">実績</div>` + ACHIEVEMENTS.map(a => `<div class="ach ${d.ach[a.id] ? 'on' : ''}"><div class="ic">${d.ach[a.id] ? ICO('trophy', '#ffcf3d', 26) : ICO('lock', '#555', 22)}</div><div><b>${a.name}</b><div class="note">${a.desc}</div></div></div>`).join('');
    html += `<div class="h3">タイムアタック記録</div><div class="kv">` + MAPS.filter(m => d.records.ta[m.id]).map(m => `<div>${m.jp}</div><div>${fmtTime(d.records.ta[m.id].best)}</div>`).join('') + `</div>`;
    html += `<div class="h3">峠チャレンジ記録</div><div class="kv">` + MAPS.filter(m => d.records.touge[m.id]).map(m => `<div>${m.jp}</div><div>${(+(d.records.touge[m.id].best || 0)).toLocaleString()} pts</div>`).join('') + `</div>`;
    return html;
  },
  // ---------------- ストーリー ----------------
  r_story() {
    $('panelTitle').textContent = 'STORY MODE'; const cl = SAVE.data.story.cleared;
    const nextIdx = STORY.findIndex(s => !cl.includes(s.id)); if (!this.sel) this.sel = STORY[nextIdx >= 0 ? nextIdx : STORY.length - 1].id;
    const ch = STORY.find(s => s.id === this.sel); const rc = CAR_BY_ID[ch.rival.car];
    this.show.setCar({ id: rc.id, tune: defaultTune(rc), look: Object.assign(defaultLook(rc), { color: ch.rival.color }) });
    let html = `<div class="list">`;
    STORY.forEach((s, i) => { const done = cl.includes(s.id), open = i === 0 || cl.includes(STORY[i - 1].id); html += `<button class="item ${s.id === this.sel ? 'sel' : ''} ${open ? '' : 'locked'}" data-a="selStory" data-v="${s.id}"><div class="grow"><div class="t">${s.title}${done ? '<span class="tag own">CLEAR</span>' : ''}${s.boss ? '<span class="tag cur">BOSS</span>' : ''}</div><div class="s">VS ${s.rival.name}（${s.rival.team}） ・ ${MAP_BY_ID[s.map].jp}</div></div><div class="p">${open ? yen(s.reward) : ICO('lock', '#888', 16)}</div></button>`; });
    const idx = STORY.indexOf(ch), open = idx === 0 || cl.includes(STORY[idx - 1].id);
    html += `</div><div class="h3">${ch.title}</div><div class="kv"><div>ライバル</div><div>${ch.rival.name}</div><div>チーム</div><div>${ch.rival.team}</div><div>ライバル車両</div><div>${rc.name}</div><div>コース</div><div>${MAP_BY_ID[ch.map].jp}（${{ day: '昼', evening: '夕方', night: '夜' }[MAP_BY_ID[ch.map].time]}）</div><div>形式</div><div>1周バトル（先着勝利）</div><div>報酬</div><div>${yen(ch.reward)} / ${ch.xp} XP</div></div>`;
    html += `<div class="note" style="margin-top:6px">使用車両: <b>${CAR_BY_ID[SAVE.cur().id].name}</b>（ガレージで変更）</div><div class="btns"><button class="btn pri" data-a="storyGo" ${open ? '' : 'disabled'} style="flex:1">${open ? 'バトル開始 ▶' : ICO('lock', '#111', 14) + ' 前の話をクリア'}</button></div>`;
    this.stageInfo(`<div class="car-name">${rc.name}</div><div class="car-sub">${ch.rival.name} の愛車</div>`);
    return html;
  },
  a_selStory(v) { this.sel = +v; this.render(); },
  a_storyGo() { const ch = STORY.find(s => s.id === this.sel); this.runStory(ch); },
  runStory(ch, isEvent) {
    const m = MAP_BY_ID[ch.map]; AUDIO.playCat(isEvent ? 'xmasRace' : 'story');
    const startRace = () => { this.vsScreen(ch, () => this.launch({ mode: isEvent ? 'event' : 'story', story: isEvent ? null : ch.id, eventTask: isEvent ? ch.id : null, mapId: ch.map, weather: m.weather, time: m.time, laps: 1, carInst: SAVE.cur(), rivals: [ch.rival] })); };
    this.dialog(ch.pre || [], ch.rival, startRace);
  },
  portrait(name, color, isPlayer) {
    const c = document.createElement('canvas'); c.width = 160; c.height = 200; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 200); gr.addColorStop(0, isPlayer ? '#3a0505' : '#101318'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(0, 0, 160, 200);
    g.fillStyle = isPlayer ? '#e10600' : color; g.globalAlpha = 0.25; g.fillRect(0, 140, 160, 60); g.globalAlpha = 1;
    g.fillStyle = '#0a0a0c'; g.beginPath(); g.arc(80, 80, 38, 0, TAU); g.fill(); g.beginPath(); g.ellipse(80, 200, 70, 62, 0, PI, 0); g.fill();
    g.strokeStyle = isPlayer ? '#e10600' : color; g.lineWidth = 3; g.beginPath(); g.arc(80, 80, 38, 0, TAU); g.stroke(); g.beginPath(); g.ellipse(80, 200, 70, 62, 0, PI, 0); g.stroke();
    g.fillStyle = '#fff'; g.font = 'bold 44px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name[0] || '?', 80, 82);
    return c;
  },
  dialog(lines, rival, done) {
    this.hideAll(); this.show.active = true; let i = 0; const o = $('overlay'); o.classList.remove('hidden'); o.style.background = 'transparent';
    if (!lines.length) { o.classList.add('hidden'); o.style.background = ''; return done(); }
    const draw = () => {
      const [who, text] = lines[i]; const isP = who === 'あなた';
      o.innerHTML = `<div class="dlg" id="dlgBox"><div id="pt"></div><div class="box"><div class="nm">${esc(isP ? 'あなた' : who)}${!isP && rival ? ` <span style="color:#999;font-size:11px">${esc(rival.team)}</span>` : ''}</div><div class="tx" id="dlgTx"></div><div class="next">タップで次へ ▶</div></div></div><button class="btn" style="position:absolute;right:12px;top:calc(12px + var(--safe-t));pointer-events:auto" id="dlgSkip">SKIP ▶▶</button>`;
      $('pt').appendChild(this.portrait(isP ? 'あ' : who, rival ? rival.color : '#888', isP));
      let k = 0; const tx = $('dlgTx'); clearInterval(this._ty); this._ty = setInterval(() => { k++; tx.textContent = text.slice(0, k); if (k >= text.length) clearInterval(this._ty); }, 28);
      $('dlgBox').onclick = () => { AUDIO.click(); if (k < text.length) { k = text.length; tx.textContent = text; clearInterval(this._ty); return; } i++; if (i >= lines.length) finish(); else draw(); };
      $('dlgSkip').onclick = e => { e.stopPropagation(); AUDIO.click(); finish(); };
    };
    const finish = () => { clearInterval(this._ty); o.classList.add('hidden'); o.innerHTML = ''; o.style.background = ''; done(); };
    draw();
  },
  vsScreen(ch, done) {
    const o = $('overlay'); o.classList.remove('hidden'); const me = CAR_BY_ID[SAVE.cur().id], rc = CAR_BY_ID[ch.rival.car];
    o.innerHTML = `<div class="vs"><div class="side">あなた<small>${me.name}</small></div><div class="v">VS</div><div class="side">${esc(ch.rival.name)}<small>${rc.name}</small></div></div>`;
    AUDIO.tone(110, 0.6, 'sawtooth', 0.2, 0, 2); setTimeout(() => { o.classList.add('hidden'); o.innerHTML = ''; done(); }, 1800);
  },
  // ---------------- オンライン対戦 ----------------
  r_online() {
    $('panelTitle').textContent = 'ONLINE BATTLE'; const st = NET.status; const d = SAVE.data; this.show.setCar(SAVE.cur());
    if (!this.netOpt) this.netOpt = { map: 'akigiri', time: 'night', weather: 'clear', laps: 1 };
    let html = '';
    if (NET.room === undefined) { NET.ensure().then(() => { if (this.screen === 'online') this.render(); }); return '<div class="note">接続を確認しています…</div>'; }
    if ((!NET.room || st === 'unavailable') && window.DL_FIREBASE) return html + `<div class="note" style="font-size:13px;line-height:1.9">オンラインサーバーに接続できませんでした。通信状況を確認して、ページを再読み込みしてください。</div><div class="btns"><button class="btn pri" data-a="netRetry">再接続</button></div>`;
    if (!NET.room || st === 'unavailable') return html + `<div class="note" style="font-size:13px;line-height:1.9">この表示ではオンライン対戦に接続できません。<br>・claude.ai にサインインした状態でこのページを開いてください<br>・対戦相手には、このページを<b>メールアドレスで招待して共有</b>してください（同じ組織のメンバーも参加できます）<br>・一般公開のリンクから開いた人は、claude.ai の仕組み上オンライン部屋に接続できません</div>`;
    if (!NET.named) {
      html += `<div class="note" style="font-size:13px;line-height:1.8">相手と同じ「部屋コード」を入力すると、同じ部屋に入って対戦できます（最大4人）。</div>`;
      html += `<div class="row"><label>ニックネーム</label><input type="text" maxlength="16" value="${esc(d.settings.nick || 'プレイヤー')}" data-in="nick"></div>`;
      html += `<div class="row"><label>部屋コード</label><input type="text" id="netCode" maxlength="12" placeholder="例: touge86" value="${esc(this.netCodeDraft || '')}" data-in="netCode" style="text-transform:lowercase"></div>`;
      html += `<div class="btns"><button class="btn" data-a="netRand">ランダムコードを作る</button><button class="btn pri" data-a="netJoin" style="flex:1">部屋に入る ▶</button></div><div class="note">コードは英小文字と数字で3〜12文字。お互いに同じコードを入力してください。</div>`;
      if (st === 'error') html += `<div class="note" style="color:#ff8080">${esc(NET.err)}</div>`;
      html += `<div class="note">使用車両: <b>${CAR_BY_ID[SAVE.cur().id].name}</b>（ガレージで変更）</div>`;
      return html;
    }
    const peers = NET.sorted(); const host = NET.isHost(); const o = this.netOpt;
    html += `<div style="text-align:center;margin:6px 0"><div class="note">部屋コード</div><div style="font-family:Orbitron;font-size:34px;font-weight:900;letter-spacing:.15em;color:var(--gold)">${esc(NET.code)}</div><div class="note">${NET.connected === false ? '⚠ 再接続中…' : '相手にこのコードを伝えてください'}</div></div>`;
    html += `<div class="h3">参加者（${peers.length}/4）</div><div class="list">${peers.slice(0, 4).map((p, i) => { const pr = p.presence || {}; const c = CAR_BY_ID[pr.car]; return `<div class="item"><div class="grow"><div class="t">${i === 0 ? ICO('trophy', '#ffcf3d', 14) + ' ' : ''}<span class="noi18n">${esc(String(pr.nm || 'プレイヤー').slice(0, 16))}</span>${p.sameTab ? '<span class="tag cur">あなた</span>' : ''}${p.guest ? '<span class="tag">ゲスト</span>' : ''}</div><div class="s">${c ? c.name : '---'}</div></div><div class="p" style="color:${pr.rd ? 'var(--green)' : '#888'}">${pr.rd ? 'READY' : '準備中'}</div></div>`; }).join('')}</div>`;
    if (peers.length > 4) html += `<div class="note">5人目以降は観戦扱いになります。</div>`;
    const maps = MAPS.filter(m => m.cat !== 'free' && m.cat !== 'drag' && m.cat !== 'event' && (m.cat !== 'xmas' || eventActive()));
    html += `<div class="h3">レース設定 ${host ? '（ホスト）' : '（ホストが決定）'}</div>`;
    if (host) {
      html += `<div class="row"><label>コース</label><select data-in="netMap" style="flex:1;background:#111;color:#fff;border:1px solid #333;padding:8px">${maps.map(m => `<option value="${m.id}" ${o.map === m.id ? 'selected' : ''}>${m.jp}（${m.name}）</option>`).join('')}</select></div>`;
      html += `<div class="opt-row">${[['day', '昼'], ['evening', '夕方'], ['night', '夜']].map(([k, l]) => `<button class="opt ${o.time === k ? 'on' : ''}" data-a="netOpt" data-v="time:${k}">${l}</button>`).join('')}${[['clear', '晴れ'], ['rain', '雨'], ['snow', '雪'], ['fog', '霧']].map(([k, l]) => `<button class="opt ${o.weather === k ? 'on' : ''}" data-a="netOpt" data-v="weather:${k}">${l}</button>`).join('')}</div>`;
      html += `<div class="opt-row">${[1, 2, 3].map(n => `<button class="opt ${o.laps === n ? 'on' : ''}" data-a="netOpt" data-v="laps:${n}">${n} LAP</button>`).join('')}</div>`;
    } else html += `<div class="kv"><div>コース</div><div>${(MAP_BY_ID[o.map] || {}).jp || '-'}</div><div>時間/天候</div><div>${{ day: '昼', evening: '夕方', night: '夜' }[o.time] || '-'} / ${{ clear: '晴れ', rain: '雨', snow: '雪', fog: '霧' }[o.weather] || '-'}</div><div>周回</div><div>${o.laps} LAP</div></div>`;
    const allReady = peers.length >= 2 && peers.slice(0, 4).every(p => p.presence && p.presence.rd);
    html += `<div class="btns"><button class="btn ${NET.ready ? '' : 'pri'}" data-a="netReady">${NET.ready ? 'READY 解除' : 'READY'}</button>${host ? `<button class="btn gold" data-a="netGo" ${allReady ? '' : 'disabled'} style="flex:1">レース開始 ▶</button>` : '<div class="note" style="align-self:center">ホストの開始を待っています…</div>'}<button class="btn" data-a="netLeave">退出</button></div>`;
    if (host && !allReady) html += `<div class="note">${peers.length < 2 ? '相手の参加を待っています…' : '全員が READY になると開始できます'}</div>`;
    return html;
  },
  in_nick(v) { SAVE.data.settings.nick = v.slice(0, 16); SAVE.save(); if (NET.named) NET.publishLobby(); },
  in_netCode(v) { this.netCodeDraft = v.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12); },
  in_netMap(v) { this.netOpt.map = v; NET.publishLobby(); },
  a_netRand() { const c = 'abcdefghjkmnpqrstuvwxyz23456789'; let r = ''; for (let i = 0; i < 6; i++) r += c[Math.floor(Math.random() * c.length)]; this.netCodeDraft = r; this.render(); },
  async a_netJoin() { const code = (this.netCodeDraft || '').toLowerCase().replace(/[^a-z0-9]/g, ''); if (code.length < 3) { AUDIO.error(); return this.toast('部屋コードは3文字以上にしてください'); } try { await NET.join(code); } catch (e) { } this.render(); },
  a_netOpt(v) { const [k, val] = v.split(':'); this.netOpt[k] = k === 'laps' ? +val : val; NET.publishLobby(); this.render(); },
  a_netReady() { NET.ready = !NET.ready; NET.publishLobby(); this.render(); },
  a_netGo() { if (!NET.isHost()) return; const st = Object.assign({ seq: Date.now() % 1e9 + Math.floor(Math.random() * 1000) }, this.netOpt); NET.publishLobby({ start: st }); },
  async a_netLeave() { await NET.leave(); this.render(); },
  netChanged() { if (this.screen === 'online') { clearTimeout(this._nr); this._nr = setTimeout(() => { if (this.screen === 'online' && !document.activeElement.matches('input,select')) this.render(); }, 200); } },
  netStart(st) {
    if (this.game.active || !NET.me()) return; const m = MAP_BY_ID[st.map]; if (!m) return;
    const peers = NET.sorted().slice(0, 4); const gi = Math.max(0, peers.findIndex(p => p.sameTab)); if (peers.findIndex(p => p.sameTab) < 0) return this.toast('満員のため観戦できません');
    NET.ready = false; NET.publishLobby({ rd: false });
    this.launch({ mode: 'online', seq: st.seq, grid: gi, mapId: st.map, time: st.time, weather: st.weather, laps: st.laps || 1, carInst: SAVE.cur(), rivals: [] });
  },
  // ---------------- イベント ----------------
  r_xmas() {
    $('panelTitle').textContent = 'WINTER LEGENDS'; const ev = XMAS_EVENT, d = SAVE.data, act = eventActive();
    const end = new Date(ev.end + 'T23:59:59+09:00'); const days = Math.max(0, Math.ceil((end - new Date()) / 86400000));
    const xc = CAR_BY_ID.xm_reindeer; this.show.setCar({ id: xc.id, tune: defaultTune(xc), look: Object.assign(defaultLook(xc), { livery: 'snow', color2: '#ffffff', wheel: 'candy' }) });
    let html = `<div style="background:linear-gradient(90deg,#5a0010,#0f4a25);padding:12px;border:1px solid #2fbf71"><div style="font-family:Orbitron;font-weight:900;font-size:20px">${ICO('tree', '#2fdc7a', 22)} ${ev.title}</div><div class="note" style="color:#eee">${ev.jp} ・ 期間 ${ev.start} 〜 ${ev.end} ${act ? `（残り${days}日）` : '（期間外）'}</div></div>`;
    if (!act) { html += `<div class="note" style="margin-top:10px">現在イベント期間外です。次回の開催をお楽しみに。</div>`; return html; }
    const pts = d.event.points || 0;
    html += `<div style="display:flex;align-items:center;gap:10px;margin:10px 0"><div style="font-family:Orbitron;font-size:26px;color:var(--gold);white-space:nowrap;flex:0 0 auto">${ICO('tree', '#2fdc7a', 26)} ${pts.toLocaleString()} pt</div><div class="note">クリスマスポイント：クリスマスコースを走るたびに何度でも獲得（バトル勝利400 / 敗北120・峠チャレンジはスコア÷30・タイムアタックは1周150）</div></div>`;
    html += `<div class="h3">イベントタスク（何回でも挑戦可能）</div><div class="list">`;
    for (const t of ev.tasks) { const done = d.event.done[t.id];
      html += `<div class="item" style="flex-wrap:wrap"><div class="grow"><div class="t">${t.name}${done ? '<span class="tag own">達成</span>' : ''}</div><div class="s">${t.desc}</div><div class="s" style="color:var(--gold)">${done ? '毎回ポイント獲得' : `初回: ${yen(t.reward.money)} ＋ 500pt ＋ 限定アイテム`}</div></div><button class="btn pri" data-a="evGo" data-v="${t.id}">${done ? '再挑戦' : '挑戦'}</button></div>`; }
    html += `</div><div class="h3">${ICO('gift', '#e10600', 18)} クリスマスショップ</div><div class="list">`;
    for (const it of XMAS_SHOP) { const own = hasItem(it.item) || (it.item.startsWith('car:') && d.cars.some(c => c.id === it.item.slice(4)));
      html += `<div class="item"><div class="grow"><div class="t">${it.name}${own ? '<span class="tag own">所有</span>' : ''}</div></div>${own ? '' : `<button class="btn gold" data-a="xBuy" data-v="${it.item}" ${pts < it.cost ? 'disabled' : ''}>${it.cost.toLocaleString()} pt</button>`}</div>`; }
    html += `</div><div class="note">購入したホイール・リバリー・デカール・ルーフ飾り・窓飾り・ネオン・光るナンバー・キャリパー・メーターはカスタマイズ画面で装着できます。</div>`;
    html += `<div class="h3">イベントコースでフリー走行</div><div class="btns">${MAPS.filter(m => m.xmas).map(m => `<button class="btn" data-a="xFree" data-v="${m.id}">${m.jp}</button>`).join('')}</div>`;
    html += `<div class="h3">イベントランキング（雪道ドリフト）</div>${this.rankingHTML('x_park')}`;
    html += `<div class="h3">クリスマス仕様のガレージ</div><div class="opt-row">${[['auto', '自動'], ['on', 'ON'], ['off', 'OFF']].map(([v, l]) => `<button class="opt ${d.settings.xmasTheme === v ? 'on' : ''}" data-a="setOpt" data-v="xmasTheme:${v}">${l}</button>`).join('')}</div>`;
    this.stageInfo(`<div class="car-name">${xc.name}</div><div class="car-sub">イベント限定車両</div>`);
    return html;
  },
  a_xBuy(item) { const it = XMAS_SHOP.find(x => x.item === item); const d = SAVE.data; if (!it || (d.event.points || 0) < it.cost) { AUDIO.error(); return this.toast('ポイントが足りません'); } d.event.points -= it.cost; const notes = []; grantItem(item, notes); SAVE.save(); AUDIO.buy(); this.toast(notes[0] || '購入しました'); this.render(); },
  a_xFree(id) { const m = MAP_BY_ID[id]; this.launch({ mode: 'free', mapId: id, weather: m.weather, time: m.time, laps: 1, carInst: SAVE.cur(), rivals: [] }); },
  rankingHTML(mapId) {
    const rec = SAVE.data.records.touge[mapId]; const mine = (rec && rec.list || []).map(e => ({ n: 'YOU', s: e.score, me: 1 }));
    const npc = ['SANTA_DRIFT', 'RUDOLPH_RS', 'SNOW_KING', 'FROST_86', 'ICE_ANGEL', 'HOLLY_NIGHT', 'GIFT_RUNNER'].map((n, i) => ({ n, s: 42000 - i * 5200 }));
    const all = npc.concat(mine).sort((a, b) => b.s - a.s).slice(0, 10);
    return `<div class="kv">${all.map((e, i) => `<div style="color:${e.me ? 'var(--gold)' : '#bbb'}">${i + 1}. ${e.n}</div><div style="font-family:Orbitron;color:${e.me ? 'var(--gold)' : '#fff'}">${e.s.toLocaleString()}</div>`).join('')}</div>`;
  },
  a_evGo(id) {
    const t = XMAS_EVENT.tasks.find(x => x.id === id); const m = MAP_BY_ID[t.map];
    if (t.type === 'race') return this.runStory({ id: t.id, map: t.map, rival: t.rival, pre: [['サンタ・ドリフター', 'ホッホッホー！ 聖夜の峠で、わしのトナカイ号に勝てるかな？'], ['あなた', 'プレゼントは自分の手で掴み取る！']] }, true);
    this.launch({ mode: t.type === 'touge' ? 'touge' : 'time', eventTask: t.id, mapId: t.map, weather: m.weather, time: m.time, laps: 1, carInst: SAVE.cur(), rivals: [] });
  },
  // =====================================================================
  // HUD
  // =====================================================================
  showHUD(cfg) {
    this.hideAll(); this.closeModal(); $('hud').classList.remove('hidden'); document.body.classList.add('racing');
    $('touch').classList.toggle('hidden', !this.touchUI());
    $('tougePanel').classList.toggle('hidden', cfg.mode !== 'touge'); $('damageBar').classList.toggle('hidden', cfg.mode !== 'touge');
    $('fps').classList.toggle('hidden', !SAVE.data.settings.showFps);
    ['cdText', 'flash', 'driftPop', 'cornerPop', 'splitPop'].forEach(k => $(k).style.opacity = 0);
    this.screen = 'race'; this.paused = false; this.checkRotate();
    const mm = $('minimap'), tc = $('tacho'), dpr = Math.min(2, devicePixelRatio || 1);
    for (const c of [mm, tc]) { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr; }
  },
  countdown(t) { const el = $('cdText'); el.textContent = t; el.style.opacity = 1; clearTimeout(this._cd); this._cd = setTimeout(() => el.style.opacity = 0, t === 'GO!' ? 900 : 700); },
  flash(t, cls, dur = 1.5) { const el = $('flash'); el.textContent = t; el.className = cls; el.style.opacity = 1; clearTimeout(this._fl); this._fl = setTimeout(() => el.style.opacity = 0, dur * 1000); },
  driftPop(rank, pts, cls) { const el = $('driftPop'); el.innerHTML = pts ? `${rank} <span style="color:#fff">+${pts.toLocaleString()}</span>` : rank; el.className = cls; el.style.opacity = 1; clearTimeout(this._dp); this._dp = setTimeout(() => el.style.opacity = 0, 1400); },
  cornerPop(label, pts) { const el = $('cornerPop'); const r = pts > 2500 ? 'EXCELLENT' : pts > 1200 ? 'GREAT' : 'GOOD'; el.textContent = `コーナー ${label}  ${pts.toLocaleString()} pts  ${r}`; el.style.opacity = 1; clearTimeout(this._cp); this._cp = setTimeout(() => el.style.opacity = 0, 1600); },
  sectorSplit(n, t, best) { const el = $('splitPop'); const d = best != null ? t - best : null; el.innerHTML = `SECTOR ${n}  ${t.toFixed(3)}${d != null ? ` <span style="color:${d <= 0 ? 'var(--green)' : '#ff5050'}">${d <= 0 ? '' : '+'}${d.toFixed(3)}</span>` : ''}`; el.style.opacity = 1; clearTimeout(this._sp); this._sp = setTimeout(() => el.style.opacity = 0, 2000); },
  updateHUD(g) {
    const cfg = g.cfg, v = g.veh, tr = g.track; let h = '';
    const lapT = g.raceT - g.lapStart; const L = tr.length;
    if (cfg.mode === 'story' || cfg.mode === 'event') {
      const r = g.rivals[0]; const myD = g.totalDist; const gap = r ? r.prog - 4 - myD : 0; const pos = gap > 0 ? 2 : 1;
      const remain = Math.max(0, L * (cfg.laps || 1) - myD);
      h += `<div class="big">${pos}<small>/2</small></div><div class="l">POSITION</div><div class="v ${pos === 1 ? 'good' : 'bad'}">${pos === 1 ? '後方 ' : '前方 '}${Math.abs(gap).toFixed(0)} m</div><div class="l">VS ${r ? esc(r.def.name) : ''}</div><div class="l">TIME</div><div class="v">${fmtTime(g.raceT)}</div><div class="l">残り距離</div><div class="v">${(remain / 1000).toFixed(2)} km</div>`;
    } else if (cfg.mode === 'online') {
      const others = g.rivals.filter(r => r.net); const myD = g.totalDist; const ranked = [{ me: 1, d: g.myFinish ? 1e9 - g.myFinish : myD }].concat(others.map(r => ({ r, d: r.finished ? 1e9 - r.finishT : r.d }))).sort((a, b) => b.d - a.d);
      const pos = ranked.findIndex(x => x.me) + 1; const remain = Math.max(0, L * (cfg.laps || 1) - myD);
      h += `<div class="big">${pos}<small>/${ranked.length}</small></div><div class="l">ONLINE ・ LAP ${Math.min(g.lap + 1, cfg.laps || 1)}/${cfg.laps || 1}</div>${others.map(r => `<div class="v ${r.d > myD ? 'bad' : 'good'}" style="font-size:13px">${esc(r.def.name)} ${r.finished ? 'GOAL' : (r.d > myD ? '前方 ' : '後方 ') + Math.abs(r.d - myD).toFixed(0) + 'm'}</div>`).join('')}<div class="l">TIME</div><div class="v">${fmtTime(g.raceT)}</div><div class="l">残り距離</div><div class="v">${(remain / 1000).toFixed(2)} km</div>`;
    } else if (cfg.mode === 'time') {
      const rec = SAVE.data.records.ta[cfg.mapId]; const last = g.laps.length ? g.laps[g.laps.length - 1].t : null;
      h += `<div class="big">${Math.min(g.lap + 1, cfg.laps)}<small>/${cfg.laps} LAP</small></div><div class="l">LAP TIME</div><div class="v">${fmtTime(g.started ? lapT : 0)}</div><div class="l">TOTAL</div><div class="v">${fmtTime(g.raceT)}</div><div class="l">BEST</div><div class="v">${rec ? fmtTime(rec.best) : '--:--.---'}</div>${last ? `<div class="l">LAST</div><div class="v">${fmtTime(last)}</div>` : ''}<div class="l">残り距離</div><div class="v">${(Math.max(0, L * cfg.laps - g.totalDist) / 1000).toFixed(2)} km</div>`;
    } else if (cfg.mode === 'touge') {
      h += `<div class="l">TIME</div><div class="v">${fmtTime(g.raceT)}</div><div class="l">走行距離</div><div class="v">${(Math.max(0, g.totalDist) / 1000).toFixed(2)} km</div><div class="l">BEST</div><div class="v">${((SAVE.data.records.touge[cfg.mapId] || {}).best || 0) ? (+SAVE.data.records.touge[cfg.mapId].best).toLocaleString() : '-'}</div>`;
      const d = g.drift; $('tougePanel').innerHTML = `<div class="sc">${(d.score + (d.on ? Math.round(d.pts) : 0)).toLocaleString()}</div><div class="cb">${d.combo > 0 ? 'COMBO x' + d.combo : '&nbsp;'}</div><div class="sm">DRIFTS ${d.count} ・ MAX COMBO ${d.maxCombo}</div>`;
      $('damageBar').firstElementChild.style.width = g.damage + '%';
    } else {
      h += `<div class="big">${g.lap + 1}<small> LAP</small></div><div class="l">TIME</div><div class="v">${fmtTime(lapT)}</div><div class="l">最高速度</div><div class="v">${Math.round(g.maxSpeed)} km/h</div>${cfg.testDrive ? '<div class="l" style="color:var(--gold)">試乗中（ポーズで終了）</div>' : ''}`;
    }
    $('raceInfo').innerHTML = h;
    $('nitroBar').firstElementChild.style.width = (v.nitro * 100) + '%';
    // 次のコーナー
    if (tr.env !== 'lot' && tr.corners.length) {
      const i = g.loc.i; let best = null, bd = 1e9; for (const c of tr.corners) { let d = (c.start - i + tr.n) % tr.n; if (tr.cornerAt[i] >= 0 && tr.corners[tr.cornerAt[i]] === c) d = 0; if (d < bd) { bd = d; best = c; } }
      let jg = ''; for (const J of tr.jcts || []) { const dj = (J.i - i + tr.n) % tr.n; if (dj * STEP < 650 && dj > 0) jg = `<span class="jct-g">JCT ${Math.round(dj * STEP)}m ・ ${J.side > 0 ? '右' : '左'}：${J.to} ／ 本線直進：${J.main}</span>`; }
      $('nextCorner').innerHTML = jg + (best ? (bd === 0 ? `▶ <b>${best.label}</b> ${Math.round(best.deg)}°` : `NEXT ▶ <b>${best.label}</b> ${Math.round(bd * STEP)}m`) : '');
    } else $('nextCorner').innerHTML = '';
    // ドリフト表示
    const dl = $('driftLive'); const d = g.drift;
    if (d.on && (cfg.mode === 'touge' || cfg.mode === 'free') && d.t > 0.25) { dl.style.opacity = 1; dl.innerHTML = `<div class="p">${Math.round(d.pts).toLocaleString()}</div><div class="m">${d.combo > 0 ? 'x' + (1 + d.combo * 0.15).toFixed(2) + ' ' : ''}${d.prox > 1.2 ? '壁際ボーナス ' : ''}${d.spd > 1.6 ? 'スピードボーナス' : ''}</div><div class="a">ANGLE ${Math.round(d.angle || 0)}°</div>`; } else dl.style.opacity = 0;
    if (SAVE.data.settings.showFps) $('fps').textContent = (this.fps || 0).toFixed(0) + ' FPS / ' + this.R.stats.draws + ' draws';
  },
  drawTacho(g) {
    const c = $('tacho'), x = c.getContext('2d'), W = c.width, H = c.height; if (!W) return; const v = g.veh, S = g.spec;
    const mid = (g.carInst && g.carInst.look && g.carInst.look.meter) || 'std';
    if (mid !== 'std' && METER_STYLES[mid]) return drawMeter(x, W, H, mid, { rpm: v.rpm, speed: v.speed, redline: S.redline, gear: v.gear, limiter: v.limiter, auto: v.auto, boost: v.boost, turbo: S.turbo || S.super, nitro: v.nitroOn, t: performance.now() / 1000 });
    x.clearRect(0, 0, W, H); if (![v.rpm, v.speed, S.redline].every(isFinite)) return; const cx = W / 2, cy = H / 2, R = W * 0.44; const red = S.redline, max = Math.ceil((red + 1000) / 1000) * 1000;
    const a0 = PI * 0.75, a1 = PI * 2.25, ang = r => a0 + (a1 - a0) * clamp(r / max, 0, 1);
    x.fillStyle = 'rgba(0,0,0,.55)'; x.beginPath(); x.arc(cx, cy, R * 1.08, 0, TAU); x.fill();
    x.lineWidth = R * 0.07; x.strokeStyle = 'rgba(255,255,255,.12)'; x.beginPath(); x.arc(cx, cy, R * 0.92, a0, a1); x.stroke();
    x.strokeStyle = '#e10600'; x.beginPath(); x.arc(cx, cy, R * 0.92, ang(red), a1); x.stroke();
    const rg = x.createLinearGradient(0, 0, W, 0); rg.addColorStop(0, '#fff'); rg.addColorStop(1, v.rpm > red * 0.9 ? '#ff3030' : '#ffd040');
    x.strokeStyle = rg; x.beginPath(); x.arc(cx, cy, R * 0.92, a0, ang(v.rpm)); x.stroke();
    x.fillStyle = '#ccc'; x.font = `bold ${R * 0.13}px Orbitron`; x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let r = 0; r <= max; r += 1000) { const a = ang(r); x.fillText(r / 1000, cx + Math.cos(a) * R * 0.72, cy + Math.sin(a) * R * 0.72); x.strokeStyle = r >= red ? '#e10600' : '#fff'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx + Math.cos(a) * R * 0.82, cy + Math.sin(a) * R * 0.82); x.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); x.stroke(); }
    const a = ang(v.rpm); x.strokeStyle = '#ff2a2a'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * R * 0.95, cy + Math.sin(a) * R * 0.95); x.stroke();
    x.fillStyle = '#fff'; x.font = `900 ${R * 0.42}px Orbitron`; x.fillText(Math.round(v.speed * 3.6), cx, cy + R * 0.05);
    x.font = `bold ${R * 0.12}px Orbitron`; x.fillStyle = '#aaa'; x.fillText('km/h', cx, cy + R * 0.32);
    const gear = v.gear === 0 ? 'N' : v.gear === -1 ? 'R' : String(v.gear);
    x.font = `900 ${R * 0.3}px Orbitron`; x.fillStyle = v.limiter > 0 ? '#ff3030' : '#ffd040'; x.fillText(gear, cx, cy + R * 0.62);
    x.font = `bold ${R * 0.1}px Orbitron`; x.fillStyle = '#888'; x.fillText((v.auto ? 'AT' : 'MT') + ' ×1000rpm', cx, cy - R * 0.38);
    if (S.turbo || S.super) { x.fillStyle = '#5ad1ff'; x.fillText('BOOST ' + (v.boost * 1.2).toFixed(1), cx, cy - R * 0.24); }
    if (v.nitroOn) { x.fillStyle = '#5ad1ff'; x.font = `900 ${R * 0.14}px Orbitron`; x.fillText('NITRO', cx, cy - R * 0.55); }
  },
  drawMinimap(g) {
    const c = $('minimap'), x = c.getContext('2d'), W = c.width, H = c.height; if (!W) return; const v = g.veh, tr = g.track;
    x.clearRect(0, 0, W, H); x.save(); x.beginPath(); x.arc(W / 2, H / 2, W / 2 - 1, 0, TAU); x.clip();
    const sc = W / 520; const hd = v.heading, fx = Math.sin(hd), fz = Math.cos(hd), rx = -fz, rz = fx; const cx = W / 2, cy = H * 0.58;
    const P = (px, pz) => { const dx = px - v.x, dz = pz - v.z; return [cx + (dx * rx + dz * rz) * sc, cy - (dx * fx + dz * fz) * sc]; };
    if (tr.env === 'lot') { x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 2; x.beginPath(); const S = tr.open; [[-S, -S], [S, -S], [S, S], [-S, S], [-S, -S]].forEach((p, i) => { const q = P(p[0], p[1]); i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.stroke(); }
    x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath(); const pts = g.mmPts; for (let k = 0; k <= pts.length; k++) { const p = pts[k % pts.length]; const q = P(p[0], p[1]); k ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }
    x.strokeStyle = 'rgba(0,0,0,.7)'; x.lineWidth = Math.max(5, tr.def.width * sc + 4); x.stroke(); x.strokeStyle = tr.def.xmas ? '#ffdddd' : '#e8e8ea'; x.lineWidth = Math.max(3, tr.def.width * sc); x.stroke();
    // 進行方向矢印
    x.fillStyle = 'rgba(255,200,61,.8)'; for (let k = 1; k <= 3; k++) { const p = tr.pointAt(g.loc.prog + k * 45); const q = P(p.x, p.z); x.beginPath(); x.arc(q[0], q[1], 2.2 * (W / 170), 0, TAU); x.fill(); }
    // 次のコーナー
    if (tr.env !== 'lot') { const i = g.loc.i; let best = null, bd = 1e9; for (const cc of tr.corners) { const d = (cc.apex - i + tr.n) % tr.n; if (d < bd && d > 0) { bd = d; best = cc; } } if (best) { const q = P(tr.X[best.apex], tr.Z[best.apex]); x.strokeStyle = '#ffc83d'; x.lineWidth = 2; x.beginPath(); x.arc(q[0], q[1], 6 * (W / 170), 0, TAU); x.stroke(); } }
    // ゴール
    { const q = P(tr.X[0], tr.Z[0]); x.fillStyle = '#fff'; x.fillRect(q[0] - 5, q[1] - 5, 10, 10); x.fillStyle = '#000'; x.fillRect(q[0] - 5, q[1] - 5, 5, 5); x.fillRect(q[0], q[1], 5, 5); }
    // ライバル・ゴースト
    for (const r of g.rivals) { const q = P(r.x, r.z); x.fillStyle = '#ff3030'; x.beginPath(); x.arc(q[0], q[1], 5 * (W / 170), 0, TAU); x.fill(); }
    if (g.ghost && g.ghost.node.pos) { const q = P(g.ghost.node.pos[0], g.ghost.node.pos[2]); x.fillStyle = 'rgba(128,192,255,.8)'; x.beginPath(); x.arc(q[0], q[1], 4 * (W / 170), 0, TAU); x.fill(); }
    // プレイヤー
    x.fillStyle = '#2fdc7a'; x.strokeStyle = '#000'; x.lineWidth = 1.5; const s = 7 * (W / 170); x.beginPath(); x.moveTo(cx, cy - s * 1.3); x.lineTo(cx + s, cy + s); x.lineTo(cx, cy + s * 0.5); x.lineTo(cx - s, cy + s); x.closePath(); x.fill(); x.stroke();
    x.restore();
  },
  // ---------------- ポーズ ----------------
  pause(refresh) {
    const g = this.game; if (!g.active) return; g.paused = true; this.paused = true; AUDIO.applyVol(); if (AUDIO.ok) AUDIO.sfxBus.gain.value = 0;
    const cams = ['三人称視点', 'ボンネット視点', 'コックピット視点', 'バンパー視点', 'ドリフト追従カメラ'];
    this.modal(`<h2>PAUSE</h2><div class="btns" style="flex-direction:column"><button class="btn pri" data-a="resume">再開</button>${g.cfg.testDrive || g.cfg.mode === 'online' ? '' : '<button class="btn" data-a="restart">リスタート</button>'}<button class="btn" data-a="pCam">カメラ: ${cams[g.camMode]}</button><button class="btn" data-a="pTrans">変速: ${g.veh.auto ? 'AT' : 'MT'}</button><button class="btn" data-a="pAssist">ドリフトアシスト: ${['OFF', '弱', '標準', '強'][SAVE.data.settings.assist]}</button><button class="btn" data-a="pAi">ライバルの強さ: ${['やさしい', 'ふつう', 'むずかしい'][SAVE.data.settings.aiLevel ?? 1]}</button><button class="btn" data-a="gyroToggle">ジャイロ操作: ${Gyro.on ? 'ON' : 'OFF'}</button>${Gyro.on ? '<button class="btn" data-a="gyroCal">ジャイロ中央補正</button>' : ''}<button class="btn" data-a="pControls">操作方法</button><button class="btn" data-a="quit">${g.cfg.testDrive ? '試乗終了' : 'メニューへ戻る'}</button></div>
      <div class="row"><label>BGM 音量</label><input type="range" min="0" max="1" step="0.05" value="${SAVE.data.settings.bgm}" data-in="setVol" data-k="bgm"><span class="val">${Math.round(SAVE.data.settings.bgm * 100)}</span></div>
      ${this.musicPlayerHTML().replace('<div class="list">', '<div class="list" style="max-height:30vh;overflow:auto">')}`);
  },
  a_resume() { this.closeModal(); this.paused = false; this.game.paused = false; AUDIO.applyVol(); Input.pop(); },
  a_restart() { this.closeModal(); this.paused = false; AUDIO.applyVol(); const c = this.lastCfg; c.carInst = c.carInst.uid === 'test' ? c.carInst : (SAVE.data.cars.find(x => x.uid === c.carInst.uid) || SAVE.cur()); this.launch(c); },
  a_pCam() { const g = this.game; g.camMode = (g.camMode + 1) % 5; this.pause(true); },
  a_pTrans() { const g = this.game; g.veh.auto = !g.veh.auto; SAVE.data.settings.trans = g.veh.auto ? 'AT' : 'MT'; SAVE.save(); this.pause(true); },
  a_pAssist() { SAVE.data.settings.assist = (SAVE.data.settings.assist + 1) % 4; SAVE.save(); this.pause(true); },
  a_pAi() { SAVE.data.settings.aiLevel = ((SAVE.data.settings.aiLevel ?? 1) + 1) % 3; SAVE.save(); this.pause(true); },
  a_pControls() { const prev = this.tab; this.tab = 'control'; const html = this.r_settings(); this.tab = prev; this.modal(`<h2>操作方法</h2>${html.replace(/<div class="tabs">[\s\S]*?<\/div>/, '')}<div class="btns"><button class="btn pri" data-a="pBack">戻る</button></div>`); },
  a_pBack() { this.pause(true); },
  a_quit() { this.closeModal(); this.paused = false; AUDIO.applyVol(); const test = this.game.cfg.testDrive, online = this.game.cfg.mode === 'online'; this.game.exit(); if (online) { NET.publishLobby({ race: null }); this.goMenu(); this.open('online'); return; } if (test && this.returnTo) { const [s, a, sel] = this.returnTo; this.returnTo = null; this.goMenu(); this.open(s, a, false); this.sel = sel; this.render(); } else this.goMenu(); },
  // ---------------- リザルト ----------------
  showResults(res) {
    if (window.DL_FB && !lbBlocked(this.game.carInst, this.game)) {
      if (res.mode === 'touge' && res.score > 0) window.DL_FB.lbSubmit('drift', Math.round(res.score)).then(b => { if (b) this.toast('ランキングの自己ベストを更新！'); });
      if (res.mode === 'time' && res.laps && res.laps.length && res.reason !== 'crash') { const best = Math.min(...res.laps.map(l => l.t).filter(x => isFinite(x) && x > 5)); if (isFinite(best)) window.DL_FB.lbSubmit('ta_' + res.mapId, Math.round(best * 1000) / 1000, 'min').then(b => { if (b) this.toast('タイムアタック ランキングの自己ベストを更新！'); }); }
      lbSendDist(); }
    const d = SAVE.data, cfg = res.cfg, m = MAP_BY_ID[res.mapId]; const tr = this.game.track; let html = '', money = 0, xp = 0; const notes = [];
    d.stats.races++; d.stats.nightDist += res.nightDist || 0;
    if (res.maxSpeed >= 250) unlockAch('speed250');
    const evTask = cfg.eventTask ? XMAS_EVENT.tasks.find(t => t.id === cfg.eventTask) : null;
    if (cfg.evRace) { d.stats.races = d.stats.races; if (res.win) { d.stats.wins++; } money = res.win ? cfg.evRace.prize : Math.round(cfg.evRace.prize * 0.15); xp = res.win ? 900 : 250;
      html += `<div class="res-big ${res.win ? 'win' : 'lose'}">${res.win ? 'YOU WIN!' : 'YOU LOSE'}</div><div class="res-grid"><div>イベント</div><div>${esc(cfg.evRace.title)}</div><div>タイム</div><div>${fmtTime(res.time)}</div><div>最高速度</div><div>${Math.round(res.maxSpeed)} km/h</div>`;
    } else if (res.mode === 'story' || res.mode === 'event') {
      const ch = res.mode === 'story' ? STORY.find(s => s.id === cfg.story) : null;
      const reward = ch ? ch.reward : evTask.reward.money, xpR = ch ? ch.xp : 1200;
      if (res.win) { money = reward; xp = xpR; d.stats.wins++; unlockAch('first_win'); } else { money = Math.round(reward * 0.1 / 1000) * 1000; xp = Math.round(xpR * 0.3); }
      html += `<div class="res-big ${res.win ? 'win' : 'lose'}">${res.win ? 'YOU WIN!' : 'YOU LOSE'}</div><div class="res-grid"><div>タイム</div><div>${fmtTime(res.time)}</div><div>${res.win ? 'ライバルとの差' : 'ライバルのタイム'}</div><div>${res.win ? (res.rivalTime ? '+' + (res.rivalTime - res.time).toFixed(2) + 's' : Math.round(Math.max(0, -res.gap)) + ' m') : fmtTime(res.rivalTime)}</div><div>最高速度</div><div>${Math.round(res.maxSpeed)} km/h</div>`;
      if (ch && res.win && !d.story.cleared.includes(ch.id)) {
        d.story.cleared.push(ch.id); const u = STORY_UNLOCKS[ch.id] || { maps: [], cars: [] };
        u.maps.forEach(id => notes.push('新しいコース解放: ' + MAP_BY_ID[id].jp)); u.cars.forEach(id => notes.push('ショップに新車入荷: ' + CAR_BY_ID[id].name));
        if (ch.id === 9) { unlockAch('legend'); notes.push('シーズン1クリア！ あなたは DRIFT LEGEND だ！ シーズン2が解放されました'); }
        if (ch.id === 112) notes.push('シーズン2クリア！ シーズン3が解放されました');
        if (ch.id === 212) notes.push('シーズン3クリア！ 全国制覇おめでとう！');
        if (ch.bonus) notes.push('レベル報酬: ' + grantBonus(ch.bonus));
      }
      if (evTask && res.win) this.eventReward(evTask, notes);
    } else if (res.mode === 'online') {
      const g = this.game; const rows = [{ nm: 'あなた', t: res.myTime, me: 1 }].concat(g.rivals.filter(r => r.net).map(r => ({ nm: r.def.name, t: r.finished ? r.finishT : null, d: r.d })));
      rows.sort((a, b) => (a.t == null ? 1e9 - (a.d || 0) / 1e4 : a.t) - (b.t == null ? 1e9 - (b.d || 0) / 1e4 : b.t));
      const pos = rows.findIndex(x => x.me) + 1; const win = pos === 1; money = win ? 200000 : 50000; xp = win ? 300 : 100; if (win) d.stats.wins++;
      html += `<div class="res-big ${win ? 'win' : 'lose'}">${win ? 'YOU WIN!' : pos + '位'}</div><div class="res-grid">${rows.map((r, i) => `<div style="color:${r.me ? 'var(--gold)' : '#ddd'}">${i + 1}. ${esc(r.nm)}</div><div>${r.t != null ? fmtTime(r.t) : '走行中'}</div>`).join('')}<div>最高速度</div><div>${Math.round(res.maxSpeed)} km/h</div>`;
      notes.push('相手がまだ走行中の場合、順位はその時点のものです');
    } else if (res.mode === 'time') {
      const laps = res.laps; const best = Math.min(...laps.map(l => l.t)); const rec = d.records.ta[res.mapId] || { best: null, sectors: [null, null, null], list: [] };
      const prevBest = rec.best; const newPB = !prevBest || best < prevBest; const courseRec = recordFor(res.mapId); const beatRec = best < courseRec && (!prevBest || prevBest >= courseRec);
      d.stats.taRuns = (d.stats.taRuns || 0) + 1; if (newPB && prevBest) d.stats.pbs = (d.stats.pbs || 0) + 1; if (newPB) rec.best = best; laps.forEach(l => l.s.forEach((s, k) => { if (s > 0 && (!rec.sectors[k] || s < rec.sectors[k])) rec.sectors[k] = s; }));
      rec.list = (rec.list || []).concat([{ t: best, car: res.car, date: Date.now() }]).sort((a, b) => a.t - b.t).slice(0, 10); d.records.ta[res.mapId] = rec;
      money = Math.round(tr.length / 1000 * 18000 * laps.length * clamp(courseRec / best, 0.5, 1.4) / 1000) * 1000 + (newPB ? 50000 : 0) + (beatRec ? 300000 : 0); xp = 120 * laps.length + (newPB ? 200 : 0);
      if (beatRec) unlockAch('record');
      html += `<div class="res-big win">FINISH</div><div class="res-grid"><div>トータルタイム</div><div>${fmtTime(res.time)}</div><div>ベストラップ</div><div>${fmtTime(best)} ${newPB ? '<span class="newrec">NEW!</span>' : ''}</div>${laps.map((l, i) => `<div>LAP ${i + 1}</div><div>${fmtTime(l.t)} <span style="color:#888;font-size:11px">${l.s.map(s => s.toFixed(2)).join(' / ')}</span></div>`).join('')}<div>ベストセクター</div><div>${rec.sectors.map(s => s ? s.toFixed(2) : '-').join(' / ')}</div><div>コースレコード</div><div>${fmtTime(Math.min(courseRec, rec.best))} ${beatRec ? '<span class="newrec">更新！</span>' : ''}</div><div>最高速度</div><div>${Math.round(res.maxSpeed)} km/h</div>`;
      // ランキング
      const devs = DEV_NAMES.slice(0, 6).map((n, i) => ({ n, t: courseRec * (1 + i * 0.035) })); const mine = rec.list.slice(0, 5).map(e => ({ n: 'YOU (' + CAR_BY_ID[e.car].name + ')', t: e.t, me: 1 }));
      const rank = devs.concat(mine).sort((a, b) => a.t - b.t).slice(0, 8);
      html += `</div><div class="h3">ランキング</div><div class="kv">${rank.map((e, i) => `<div style="color:${e.me ? 'var(--gold)' : '#bbb'}">${i + 1}. ${e.n}</div><div style="font-family:Orbitron;color:${e.me ? 'var(--gold)' : '#fff'}">${fmtTime(e.t)}</div>`).join('')}`;
      if (evTask) this.eventReward(evTask, notes);
    } else if (res.mode === 'drag') {
      d.stats.drags = (d.stats.drags || 0) + 1; if (res.win) { d.stats.dragWins = (d.stats.dragWins || 0) + 1; d.stats.wins++; }
      const et = res.time, pb = !d.stats.dragBest || et < d.stats.dragBest; if (pb) d.stats.dragBest = et;
      money = res.win ? 300000 + Math.round(Math.max(0, 14 - et) * 50000) : 60000; xp = res.win ? 300 : 80;
      html += `<div class="res-big ${res.win ? 'win' : 'lose'}">${res.win ? 'YOU WIN!' : 'YOU LOSE'}</div>${pb ? '<div style="text-align:center" class="newrec">自己ベスト更新！</div>' : ''}<div class="res-grid"><div>0-400m タイム</div><div>${et.toFixed(3)} 秒</div><div>到達速度</div><div>${Math.round(res.trap)} km/h</div><div>ライバル</div><div>${res.rivalTime ? res.rivalTime.toFixed(3) + ' 秒' : '未完走'}</div><div>自己ベスト</div><div>${d.stats.dragBest.toFixed(3)} 秒</div>`;
    } else if (res.mode === 'touge') {
      const rec = d.records.touge[res.mapId] || { best: 0, list: [] }; const newB = res.score > rec.best; if (newB) rec.best = res.score;
      rec.list = (rec.list || []).concat([{ score: res.score, car: res.car, date: Date.now() }]).sort((a, b) => b.score - a.score).slice(0, 10); d.records.touge[res.mapId] = rec;
      money = Math.round(res.score / 20 / 100) * 100 + Math.round(res.dist / 1000 * 8000); xp = Math.round(res.score / 25 + res.dist / 20);
      if (res.score >= 10000) unlockAch('drift10k'); if (res.score >= 50000) unlockAch('drift50k'); if (res.maxCombo >= 10) unlockAch('combo10');
      d.stats.drifts += res.drifts;
      html += `<div class="res-big ${newB ? 'win' : ''}">${res.score.toLocaleString()} <span style="font-size:.4em">PTS</span></div>${newB ? '<div style="text-align:center" class="newrec">ベスト記録更新！</div>' : ''}<div class="res-grid"><div>終了理由</div><div>${{ crash: '走行不能（ダメージ）', stuck: '停止', goal: '-' }[res.reason] || '-'}</div><div>最終スコア</div><div>${res.score.toLocaleString()}</div><div>走行距離</div><div>${(res.dist / 1000).toFixed(2)} km</div><div>生存時間</div><div>${fmtTime(res.survive)}</div><div>ドリフト回数</div><div>${res.drifts}</div><div>最大コンボ</div><div>${res.maxCombo}</div><div>最高速度</div><div>${Math.round(res.maxSpeed)} km/h</div><div>ベスト記録</div><div>${rec.best.toLocaleString()}</div>`;
      if (evTask && res.score >= evTask.target) this.eventReward(evTask, notes); else if (evTask) notes.push(`目標 ${evTask.target.toLocaleString()} 点に届きませんでした`);
    }
    const xp_ = Math.round(xmasPointsFor(res) * boostMult('xmas')); if (xp_ > 0 && eventActive()) { d.event.points = (d.event.points || 0) + xp_; notes.push(`クリスマスポイント +${xp_.toLocaleString()}（合計 ${d.event.points.toLocaleString()}）`); }
    if (d.stats.nightDist >= 10000) unlockAch('night10'); d.stats.topSpeed = Math.max(d.stats.topSpeed || 0, Math.round(res.maxSpeed || 0)); if (res.mode === 'story' && res.win) { const ch2 = STORY.find(s => s.id === cfg.story); if (ch2 && ch2.season > 1) d.diamonds = (d.diamonds || 0) + 5; }
    { let dia = 0; if ((res.mode === 'story' || res.mode === 'event') && res.win) dia += 10; if (res.mode === 'time' && res.laps && res.laps.length && res.reason !== 'crash') dia += 2; if (res.mode === 'touge') dia += res.score >= 30000 ? 8 : res.score >= 10000 ? 3 : 0;
      dia = Math.round(dia * boostMult('dia')); if (dia) { d.diamonds = (d.diamonds || 0) + dia; notes.push(`ダイヤ +${dia}（合計 ${d.diamonds.toLocaleString()}）`); }
      const ch = res.cfg && res.cfg.diaCh && diaRaces().find(x => x.id === res.cfg.diaCh);
      if (ch) { let ok = false; if (ch.t === 'touge') ok = (res.score || 0) >= ch.goal; if (ch.t === 'time' && res.laps && res.laps.length) ok = Math.min(...res.laps.map(l => l.t)) <= ch.goal;
        if (ok) { const got = diaClaim(ch); if (got) { giveCons('energy'); notes.push(`ダイヤレース達成！ ダイヤ +${ch.reward} ＋ エナジードリンク`); } } else if (ch.t !== 'jump') notes.push('ダイヤレースの目標に届きませんでした。もう一度挑戦しよう！'); } }
    { const cm = boostMult('coin'), xm = boostMult('xp'); if (cm > 1 && money > 0) { money = Math.round(money * cm / 100) * 100; notes.push(`ブースト使用中：賞金 ×${cm}`); } if (xm > 1 && xp > 0) { xp = Math.round(xp * xm); notes.push(`ブースト使用中：経験値 ×${xm}`); } }
    try { evOnResult(res, this.game); } catch (e) { console.warn(e); }
    try { fwkAdd(this.game ? this.game.totalDist : 0, res.mode === 'touge' ? res.score : (this.game && this.game.drift ? this.game.drift.score : 0), (res.win ? 1 : 0)); } catch (e) { }
    { const fin = res.reason !== 'crash' && res.reason !== 'stuck' && res.reason !== 'quit'; if (fin) d.stats.finishes = (d.stats.finishes || 0) + 1; d.stats.totalDist = (d.stats.totalDist || 0) + Math.max(0, Math.min(200000, this.game ? this.game.totalDist : 0)); d.stats.driftTotal = (d.stats.driftTotal || 0) + (res.mode === 'touge' ? (res.score || 0) : (this.game && this.game.drift ? this.game.drift.score || 0 : 0)); if (res.mode !== 'touge' && this.game && this.game.drift && this.game.drift.score > 0) xp += Math.round(this.game.drift.score / 50); }
    const lvBefore = lvInfo(d.xp); SAVE.addMoney(money); addXp(xp, res.mode); const lvAfter = lvInfo(d.xp); checkAch(); try { const nw = achNewlyDone(); if (nw.length) notes.push('実績達成：' + nw.map(a => a.name).join('、') + '（実績画面で報酬を受け取れます）'); } catch (e) { } SAVE.save();
    html += `<div>獲得賞金</div><div style="color:var(--gold)">${yen(money)}</div><div>経験値</div><div>+${xp} XP</div></div>`;
    html += `<div class="res-lv" data-from="${lvBefore.lv === lvAfter.lv ? lvBefore.cur / lvBefore.need * 100 : 0}" data-to="${lvAfter.cur / lvAfter.need * 100}">${lvBarHTML('lvbR')}</div>`;
    if (notes.length) html += `<div class="h3">お知らせ</div>${notes.map(n => `<div class="note" style="color:#fff">・${esc(n)}</div>`).join('')}`;
    const isStory = res.mode === 'story' || (res.mode === 'event' && evTask && evTask.type === 'race');
    html += res.mode === 'online' ? `<div class="btns"><button class="btn pri" data-a="resNext">ロビーへ戻る</button></div>` : `<div class="btns"><button class="btn pri" data-a="resNext">${isStory ? '次へ' : 'メニューへ'}</button><button class="btn" data-a="restart">リトライ</button></div>`;
    this.lastRes = res; this.paused = true; this.game.paused = true;
    this.modal(`<h2>RESULT ・ ${m.jp}</h2>${html}`);
    { const box = document.querySelector('.res-lv'); const bar = box && box.querySelector('.lv-bar i'); if (bar) { bar.style.transition = 'none'; bar.style.width = box.dataset.from + '%'; requestAnimationFrame(() => setTimeout(() => { bar.style.transition = 'width 1.4s cubic-bezier(.2,.9,.3,1)'; bar.style.width = box.dataset.to + '%'; }, 300)); } }
    if (this._lvUps && this._lvUps.length) setTimeout(() => this.showLvUps(), 1500);
  },
  eventReward(t, notes) {
    const d = SAVE.data; if (d.event.done[t.id]) { notes.push('タスク達成済み（初回報酬は受け取り済み）'); return; }
    d.event.done[t.id] = true; SAVE.addMoney(t.reward.money); d.event.points = (d.event.points || 0) + 500; notes.push(`初回達成報酬 ${yen(t.reward.money)} ＋ 500 クリスマスポイント`);
    grantItem(t.reward.item, notes); unlockAch('xmas');
  },
  a_resNext() {
    const res = this.lastRes; this.closeModal(); this.paused = false; AUDIO.applyVol(); this.game.exit();
    if ((res.mode === 'story' || res.mode === 'event') && !res.cfg.evRace) {
      const ch = res.mode === 'story' ? STORY.find(s => s.id === res.cfg.story) : null;
      const lines = ch ? (res.win ? ch.win : ch.lose) : res.win ? [['サンタ・ドリフター', 'ホッホー！見事じゃ！ メリー・ドリフトマス！']] : [['サンタ・ドリフター', 'まだまだじゃな。また来年…いや、また挑戦しておいで！']];
      const rv = ch ? ch.rival : XMAS_EVENT.tasks[0].rival; const rc = CAR_BY_ID[rv.car]; this.show.setCar({ id: rc.id, tune: defaultTune(rc), look: Object.assign(defaultLook(rc), { color: rv.color }) });
      this.dialog(lines, rv, () => { this.goMenu(); this.open(res.mode === 'story' ? 'story' : 'xmas'); });
    } else if (res.mode === 'online') { NET.publishLobby({ race: null }); this.goMenu(); this.open('online'); }
    else if (res.mode === 'drag') { this.goMenu(); this.open('drag'); }
    else if (res.cfg.quick) { this.goMenu(); this.open('maps', { mode: 'race' }); }
    else if (res.cfg.evRace || res.cfg.evId) { this.goMenu(); this.open('evDetail', { id: res.cfg.evId }); }
    else if (res.cfg.eventTask) { this.goMenu(); this.open('xmas'); }
    else { this.goMenu(); }
  }
};
function grantItem(item, notes) {
  const d = SAVE.data; if (!d.event.items.includes(item)) d.event.items.push(item);
  const [k, id] = item.split(':');
  if (k === 'car' && !d.cars.some(c => c.id === id)) { const c = SAVE.newCar(id); c.paid = 1500000; c.look.livery = 'snow'; c.look.owned.livery.push('snow'); c.look.color2 = '#ffffff'; c.look.wheel = 'candy'; c.look.owned.wheel.push('candy'); if (!d.event.items.includes('wheel:candy')) d.event.items.push('wheel:candy'); if (!d.event.items.includes('livery:snow')) d.event.items.push('livery:snow'); d.cars.push(c); notes && notes.push('限定車両 ' + CAR_BY_ID[id].name + ' がガレージに届きました！'); }
  else if (notes) notes.push('限定アイテム「' + ((XMAS_SHOP.find(x => x.item === item) || {}).name || item) + '」を獲得');
}
function xmasPointsFor(res) {
  const m = MAP_BY_ID[res.mapId]; if (!m || !m.xmas) return 0;
  if (res.mode === 'event' || (res.mode === 'story' && false)) return res.win ? 400 : 120;
  if (res.mode === 'touge') return Math.min(2500, Math.floor((res.score || 0) / 30));
  if (res.mode === 'time') return 150 * (res.laps ? res.laps.length : 1);
  return 0;
}
function unlockAch(id) { const d = SAVE.data; if (d.ach[id]) return; d.ach[id] = Date.now(); const a = ACHIEVEMENTS.find(x => x.id === id); if (a) setTimeout(() => UI.toast('実績解除: ' + a.name), 400); }
function checkAch() { const d = SAVE.data; if (d.cars.length >= 5) unlockAch('garage5'); if (d.money >= 10000000) unlockAch('rich'); if (d.stats.parts >= 10) unlockAch('tuner'); }
