// =====================================================================
// v46.js — v3.7「ムービー」アップデート
//   期間限定ムービーパック（開発者メニューで期間を設定可）・映画モチーフのオリジナル車
//   CHRONO WING（ガルウイングのタイムマシン風）専用：クロノナビUI・特別ブースト（炎＋効果音）・専用メーター
//   NIGHT AGENT（AIを積んだ追跡車風）専用：AIパートナーUI（波形・スキャナー）・専用メーター
//   映画アイテム（リバリー・ステッカー・ペイント・メーター・プロフィール）・映画スタジオのマップ・期間限定イベント
//   ※実在の映画・ドラマ・車種名は使わず、オリジナルのデザインにしています
// =====================================================================
// ---------------- 期間（開発者メニューで変更可能） ----------------
const MOVIE = { start: JST('2026-11-20T00:00:00'), end: JST('2026-12-25T23:59:59'), srv: null };
const movieWin = () => MOVIE.srv && MOVIE.srv.end ? MOVIE.srv : MOVIE;
function movieOpen() { const w = movieWin(), t = SRV.now(); return t >= w.start && t <= w.end; }
{ const _st = ADM.start; ADM.start = async function () { const r = await _st.apply(this, arguments); try { if (window.DL_FB) { await DL_FB.ready(); DL_FB.db().ref('admin/movie').on('value', s => { MOVIE.srv = s.val(); }, () => { }); } } catch (e) { } return r; }; }

// ---------------- 車 ----------------
BODY_TYPES.wedge80 = { nose: .40, hood: .52, deck: .60, ws: .70, rf: .55, rr: .42, rb: .14 };
BODY_TYPES.agent80 = { nose: .36, hood: .54, deck: .62, ws: .62, rf: .50, rr: .30, rb: .10 };
[['mv_chrono', 'CINEMA', 'CHRONO WING', 'ムービーパック限定・ステンレスボディのガルウイング・タイムマシン（カード限定）', 'RR', 300, 350, 1230, 250, 5, 6500, 0, 80, 78, 78, 0, 'wedge80', 4.27, 1.86, 1.14, '#b9bec4', 1, 'v6', 2.41, 0.42, { chest: 1, cards: 1 }],
 ['mv_agent', 'CINEMA', 'NIGHT AGENT', 'ムービーパック限定・AIパートナーを積んだ黒い追跡車（カード限定）', 'FR', 360, 430, 1450, 285, 5, 6000, 0, 86, 80, 84, 0, 'agent80', 4.85, 1.8, 1.24, '#0b0b0e', 1, 'v8', 2.56, 0.53, { chest: 1, cards: 1 }],
 ['mv_nebula', 'CINEMA', 'NEBULA RACER', 'ムービーパック限定・宇宙SF映画風のハイパーカー（カード限定）', 'MR', 720, 760, 1300, 340, 7, 9000, 1, 92, 76, 94, 0, 'super', 4.6, 2.02, 1.12, '#6a2aff', 0, 'v12', 2.7, 0.44, { chest: 1, cards: 1 }],
 ['mv_cab', 'CINEMA', 'CITY CAB 77', '1977 直6・映画の街を走るイエローキャブ', 'FR', 180, 260, 1550, 190, 4, 5500, 0, 66, 70, 64, 1200000, 'sedan', 5.0, 1.85, 1.45, '#f2c200', 0, 'i6', 2.9, 0.53, null],
 ['mv_pursuit', 'CINEMA', 'PURSUIT V8', '1973 V8スーパーチャージャー・荒野の追跡マシン', 'FR', 450, 560, 1500, 260, 4, 6500, 1, 74, 88, 74, 6800000, 'coupe80', 4.6, 1.85, 1.32, '#141414', 0, 'v8', 2.7, 0.55, null],
 ['mv_stallion', 'CINEMA', 'THUNDER STALLION', '1968 V8・カーチェイス映画の主役マッスルカー', 'FR', 390, 600, 1480, 240, 4, 6000, 0, 70, 86, 70, 5200000, 'coupe90', 4.7, 1.82, 1.32, '#2e4a2e', 0, 'v8', 2.75, 0.55, null],
 ['mv_mystery', 'CINEMA', 'MYSTERY VAN', '1969 フラット4・謎解き旅のワンボックス', 'RR', 70, 120, 1300, 130, 4, 5000, 0, 58, 62, 58, 1500000, 'van', 4.3, 1.72, 1.95, '#2a9d8f', 0, 'flat4', 2.4, 0.5, null],
 ['mv_spy', 'CINEMA', 'SILVER SPY GT', '1964 直6・スパイ映画風の英国グランツーリスモ（オリジナル）', 'FR', 330, 400, 1450, 250, 5, 6200, 0, 80, 74, 78, 9800000, 'gt', 4.6, 1.75, 1.3, '#c0c4c8', 0, 'i6', 2.6, 0.5, null],
 ['mv_noir', 'CINEMA', 'NOIR SEDAN 48', '1948 直8・フィルムノワールの黒いセダン', 'RR', 150, 280, 1700, 170, 3, 4200, 0, 60, 64, 56, 2400000, 'sedan', 5.2, 1.9, 1.6, '#151515', 0, 'i6', 3.1, 0.52, null],
 ['mv_stunt', 'CINEMA', 'STUNT RALLY', '2020 直4ターボ・スタントチームの4WDマシン', '4WD', 340, 450, 1350, 245, 6, 7500, 1, 88, 84, 86, 4600000, 'rally', 4.3, 1.82, 1.42, '#ff6a00', 0, 'i4', 2.6, 0.58, null]
].forEach(r => { const c = addCar(r); c.isNew = '3.7'; });
Object.assign(CAR_BY_ID.mv_chrono, { fixedMeter: 'mt_chrono', hero: 'chrono' }); Object.assign(CAR_BY_ID.mv_agent, { fixedMeter: 'mt_agent', hero: 'agent' });
Object.assign(CAR_CARDS, { mv_chrono: { need: 40, movie: 1 }, mv_agent: { need: 40, movie: 1 }, mv_nebula: { need: 30, movie: 1 } });
for (const car of ['mv_chrono', 'mv_agent', 'mv_nebula']) for (const [n, r] of [[1, 'R'], [3, 'E'], [10, 'L']]) { const c = CAR_BY_ID[car]; addItem({ id: `cc_${car}_${n}`, type: 'carcard', car, cards: n, rarity: r, lim: 1, movie: 1, name: `${c.name} カード ×${n}`, en: `${c.name} card x${n}` }); }

// ---------------- メーター（専用・アイテム） ----------------
Object.assign(METER_STYLES, {
  mt_chrono: { name: 'クロノ専用', kind: 'digital', look: 'bar', bg: 'rgba(20,22,26,.85)', c1: '#ffb000', c2: '#ff5a1f', c3: '#ff2020', digit: '#ffcf6a', glow: '#ff8a00', fixed: 1 },
  mt_agent: { name: 'エージェント専用', kind: 'digital', look: 'ring', bg: 'rgba(0,0,0,.85)', c1: '#00e5ff', c2: '#3a8cff', c3: '#ff3a6a', digit: '#9af6ff', glow: '#00e5ff', fixed: 1 },
  mt_mv_reel: { kind: 'analog', face: '#1a1a1a', tick: '#e8e2d0', num: '#e8e2d0', needle: '#ffcf3d', arc: ['#ffcf3d', '#ff6a00'], bezel: '#c0c0c8', red: '#ff3a2a', glow: '#ffcf3d' },
  mt_mv_marquee: { kind: 'digital', look: 'ring', bg: 'rgba(30,0,10,.8)', c1: '#ffd84a', c2: '#ff9a2a', c3: '#ff2a4a', digit: '#fff3c0', glow: '#ffcf3d' },
  mt_mv_scifi: { kind: 'analog', face: '#05030f', tick: '#b48aff', num: '#d8c8ff', needle: '#5af0ff', arc: ['#6a2aff', '#5af0ff'], bezel: '#6a2aff', glow: '#8a5aff', red: '#ff3ad0' },
  mt_mv_noir: { kind: 'analog', face: '#e8e4da', faceText: '#111', tick: '#111', num: '#111', needle: '#c00', arc: null, bezel: '#333', red: '#c00', sub: '#555' }
});
[['mt_mv_reel', 'フィルムリール', 'Film Reel', 'E'], ['mt_mv_marquee', 'シアターネオン', 'Theater Marquee', 'E'], ['mt_mv_scifi', 'スペースオペラ', 'Space Opera', 'L'], ['mt_mv_noir', 'ノワール', 'Noir', 'R']]
  .forEach(([id, nm, en, r]) => { addItem({ id, type: 'meter', name: 'メーター「' + nm + '」', en: 'Meter "' + en + '"', rarity: r, meter: id, lim: 1, movie: 1 }); METER_STYLES[id].name = nm; });
{ const _dt = UI.drawTacho; UI.drawTacho = function (g) { const car = g.carInst && CAR_BY_ID[g.carInst.id], fm = car && car.fixedMeter; let saved; if (fm) { saved = g.carInst.look.meter; g.carInst.look.meter = fm; } try { return _dt.call(this, g); } finally { if (fm) g.carInst.look.meter = saved; MVHUD.update(g); } }; }
{ const _sm = UI.a_setMeter; UI.a_setMeter = function (id) { const car = CAR_BY_ID[this.tuneInst().id]; if (car && car.fixedMeter) return this.toast('この車は専用メーターのため変更できません'); return _sm.call(this, id); }; }
{ const _mo = typeof meterOwned === 'function' ? meterOwned : null; if (_mo) meterOwned = function (id) { if (METER_STYLES[id] && METER_STYLES[id].fixed) return false; return _mo(id); }; }

// ---------------- 専用HUD（クロノナビ・AIパートナー） ----------------
const MVHUD = {
  el: null, kind: null, charge: 0, warpT: 0, msgT: 0, msg: '', yr: 2026,
  ensure(kind) { if (!this.el) { this.el = document.createElement('div'); this.el.id = 'mvHud'; document.body.appendChild(this.el); }
    if (this.kind !== kind) { this.kind = kind; this.charge = 0; this.el.className = 'mv-' + kind;
      this.el.innerHTML = kind === 'chrono' ? `<div class="cn-panel"><div class="cn-h"><b>CHRONO NAV</b><i class="cn-led"></i></div><div class="cn-row"><span>NOW</span><b id="cnNow">2026.11.20</b></div><div class="cn-row tgt"><span>TARGET</span><b id="cnTgt">----.--.--</b></div><div class="cn-bar"><i id="cnCh"></i><em id="cnPct">0%</em></div><small id="cnSt">スピードを上げてチャージ</small></div><div class="cn-warp" id="cnWarp"><b>TIME WARP</b></div>`
        : `<div class="ag-scan"><i></i></div><div class="ag-panel"><div class="ag-h"><b>A.I. PARTNER</b><span id="agSt">ONLINE</span></div><div class="ag-wave">${Array.from({ length: 18 }, (_, k) => `<i style="--k:${k}"></i>`).join('')}</div><div class="ag-msg" id="agMsg">システム起動。いつでもどうぞ。</div><div class="ag-chips"><span id="agTb">TURBO</span><span id="agPur">PURSUIT</span><span id="agScan">SCAN</span></div></div>`; }
    return this.el; },
  hide() { if (this.el) this.el.style.display = 'none'; this.kind = null; },
  update(g) { const car = g && g.carInst && CAR_BY_ID[g.carInst.id]; if (!g || !g.active || !car || !['chrono', 'agent'].includes(car.hero) || g.cfg.replay) return this.hide(); const el = this.ensure(car.hero); el.style.display = ''; const v = g.veh, kmh = v.speed * 3.6, now = performance.now();
    if (car.hero === 'chrono') { const tgt = 140; this.charge = Math.max(0, Math.min(100, this.charge + ((kmh > tgt ? 1 : -0.6) * (kmh / tgt)) * 0.9 + (v.nitroOn ? 1.2 : 0)));
      const pct = Math.round(this.charge); el.querySelector('#cnCh').style.width = pct + '%'; el.querySelector('#cnPct').textContent = pct + '%'; const d = new Date(SRV.now() + 9 * 3600000); el.querySelector('#cnNow').textContent = `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}`;
      if (now - (this._yt || 0) > 140 && pct > 20) { this._yt = now; this.yr = 1900 + Math.floor(Math.random() * 300); el.querySelector('#cnTgt').textContent = `${this.yr}.${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}.${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}`; }
      el.querySelector('#cnSt').textContent = pct >= 100 ? (v.nitroOn ? 'WARP!' : 'ブーストでタイムワープ！') : v.nitroOn ? 'ブースト中' : 'スピードを上げてチャージ'; el.classList.toggle('full', pct >= 100);
      if (pct >= 100 && v.nitroOn && now - this.warpT > 4000) { this.warpT = now; this.charge = 30; const w = el.querySelector('#cnWarp'); w.classList.remove('go'); void w.offsetWidth; w.classList.add('go'); AUDIO.timeWarp && AUDIO.timeWarp(); } }
    else { el.querySelectorAll('.ag-wave i').forEach((b, k) => { const a = (Math.sin(now / 90 + k * 0.9) * 0.5 + 0.5) * (0.25 + Math.min(1, kmh / 160) * 0.75) + (v.nitroOn ? 0.4 : 0); b.style.transform = `scaleY(${0.15 + a})`; });
      el.querySelector('#agTb').classList.toggle('on', !!v.nitroOn); el.querySelector('#agPur').classList.toggle('on', kmh > 120); el.querySelector('#agScan').classList.toggle('on', Math.floor(now / 600) % 2 === 0);
      el.querySelector('#agSt').textContent = v.nitroOn ? 'TURBO BOOST' : kmh > 120 ? 'PURSUIT MODE' : 'ONLINE';
      if (now - this.msgT > 5200) { this.msgT = now; const c = g.track && g.track.corners ? g.track.corners.find(c => c.start * STEP > (g.totalDist || 0) % g.track.length) : null;
        const L = [v.nitroOn ? 'ターボブースト、作動中。しっかりつかまって。' : '', kmh > 150 ? '速度が上がっています。この先も油断しないで。' : '', c ? `前方 ${Math.round(c.start * STEP - (g.totalDist || 0) % g.track.length)}m に「${c.label || 'コーナー'}」。` : '', 'エンジン、タイヤともに正常。', 'ライバルの位置を追跡しています。', 'いい走りです。この調子で。'].filter(Boolean);
        el.querySelector('#agMsg').textContent = L[Math.floor(Math.random() * L.length)]; AUDIO.agentBeep && AUDIO.agentBeep(); } } }
};
{ const _gm = UI.goMenu; UI.goMenu = function () { MVHUD.hide(); return _gm.apply(this, arguments); }; }
Object.assign(AUDIO, {
  chronoFire() { if (!this.ctx) return; this.noiseBurst && this.noiseBurst(0.35, 900, 0.8, 0.16, 0, 'lowpass'); this.tone(90, 0.3, 'sawtooth', 0.12, 0, 0.6); },
  timeWarp() { if (!this.ctx) return; this.tone(220, 0.6, 'sawtooth', 0.12, 0, 6); this.tone(440, 0.5, 'square', 0.06, 0.05, 5); this.noiseBurst && this.noiseBurst(0.7, 4000, 1.2, 0.18, 0.05, 'bandpass'); [1760, 2637, 3520].forEach((f, i) => this.tone(f, 0.25, 'sine', 0.08, 0.35 + i * 0.06)); },
  agentBeep() { if (!this.uiOk || !this.uiOk()) return; this.tone(1320, 0.05, 'sine', 0.05, 0, 0, this.uiBus); this.tone(1760, 0.05, 'sine', 0.05, 0.07, 0, this.uiBus); }
});
// 特別ブースト（後ろから炎）・スキャナーライト
{ const GP = Game.prototype, _up = GP.update; GP.update = function (dt) { _up.call(this, dt); const car = this.active && this.carInst && CAR_BY_ID[this.carInst.id]; if (!car || !car.hero || !this.veh || !this.sparks) return; const v = this.veh;
    if (car.hero === 'chrono' && v.nitroOn) { if (!this._cnF) { this._cnF = true; AUDIO.chronoFire(); } const fx = Math.sin(v.heading), fz = Math.cos(v.heading), lx = Math.cos(v.heading), lz = -Math.sin(v.heading), L = (this.model && this.model.dims && this.model.dims.L) || 4.3;
      for (const s of [-0.42, 0.42]) { const p = [v.x - fx * (L / 2 + 0.1) + lx * s, v.y + 0.42, v.z - fz * (L / 2 + 0.1) + lz * s]; for (let k = 0; k < 6; k++) this.sparks.spawn({ x: p[0] + (Math.random() - .5) * 0.2, y: p[1] + (Math.random() - .5) * 0.15, z: p[2] + (Math.random() - .5) * 0.2, vx: v.vx * 0.4 - fx * (5 + Math.random() * 7), vy: 0.4 + Math.random() * 1.2, vz: v.vz * 0.4 - fz * (5 + Math.random() * 7), life: 0, max: 0.2 + Math.random() * 0.16, size: 0.42, grow: 1.6, r: 1, g: 0.35 + Math.random() * 0.4, b: 0.05, a: 1, grav: -1, drag: 1 }); } }
    else this._cnF = false; }; }
{ const GP = Game.prototype, _rd = GP.render; GP.render = function (dt) { if (this.lightsP && !this.lightsP._mv) { const lp = this.lightsP, _cl = lp.clear.bind(lp), self = this; lp._mv = true; lp.clear = function () { _cl(); try { const car = self.carInst && CAR_BY_ID[self.carInst.id], v = self.veh; if (!car || !v) return;
        const fx = Math.sin(v.heading), fz = Math.cos(v.heading), lx = Math.cos(v.heading), lz = -Math.sin(v.heading), L = (self.model && self.model.dims && self.model.dims.L) || 4.5, t = performance.now() / 1000;
        if (car.hero === 'agent') { const pos = Math.sin(t * 3.2) * 0.55; for (let k = 0; k < 4; k++) { const o = pos - Math.sign(Math.cos(t * 3.2)) * k * 0.09; lp.p.push({ x: v.x + fx * (L / 2 + 0.05) + lx * o, y: v.y + 0.55, z: v.z + fz * (L / 2 + 0.05) + lz * o, vx: 0, vy: 0, vz: 0, life: 0, max: 1e9, size: 0.5 - k * 0.09, grow: 0, r: 1, g: 0.55, b: 0.1, a: 1 - k * 0.22 }); } }
        if (car.hero === 'chrono' && v.nitroOn) for (const s of [-0.42, 0.42]) lp.p.push({ x: v.x - fx * (L / 2 + 0.3) + lx * s, y: v.y + 0.45, z: v.z - fz * (L / 2 + 0.3) + lz * s, vx: 0, vy: 0, vz: 0, life: 0, max: 1e9, size: 1.6, grow: 0, r: 1, g: 0.5, b: 0.1, a: 0.9 }); } catch (e) { } }; } return _rd.call(this, dt); }; }

// ---------------- 映画アイテム ----------------
ITEM_TYPES.livery = 'リバリー';
const MOVIE_LIV = { filmstrip: 'フィルムストリップ', clapper: 'カチンコ', scifi: 'SFサーキット', starwalk: 'スターロード' };
for (const [id, nm] of Object.entries(MOVIE_LIV)) LIVERIES.push({ id, name: nm + '（ムービー）', price: 0, xmas: 1 });
[['filmstrip', 'R'], ['clapper', 'E'], ['scifi', 'L'], ['starwalk', 'E']].forEach(([id, r]) => addItem({ id: 'mvl_' + id, type: 'livery', liv: id, name: 'リバリー「' + MOVIE_LIV[id] + '」', en: 'Livery "' + id + '"', rarity: r, lim: 1, movie: 1, desc: 'カスタマイズのリバリーで使える' }));
{ const _g = grantChestItem; grantChestItem = function (it) { const r = _g(it); if (it && it.type === 'livery' && it.liv) { const ev = SAVE.data.event; ev.items = ev.items || []; if (!ev.items.includes('livery:' + it.liv)) ev.items.push('livery:' + it.liv); } return r; }; }
{ const _dl = drawLivery; drawLivery = function (look, car, W = 512, H = 128) { const c = _dl(look, car, W, H), lv = look.livery; if (!MOVIE_LIV[lv]) return c; const g = c.getContext('2d'), c2 = look.color2 || '#111';
    if (lv === 'filmstrip') { g.fillStyle = '#111'; g.fillRect(0, H * 0.42, W, H * 0.22); g.fillStyle = '#eee'; for (let x = 6; x < W; x += 16) { g.fillRect(x, H * 0.44, 8, 5); g.fillRect(x, H * 0.59, 8, 5); } g.fillStyle = 'rgba(255,220,120,.6)'; for (let x = 20; x < W; x += 64) g.fillRect(x, H * 0.49, 44, H * 0.08); }
    if (lv === 'clapper') { g.save(); g.beginPath(); g.rect(0, H * 0.36, W, H * 0.16); g.clip(); for (let x = -40; x < W + 40; x += 28) { g.fillStyle = (x / 28 | 0) % 2 ? '#f4f4f4' : '#111'; g.beginPath(); g.moveTo(x, H * 0.36); g.lineTo(x + 28, H * 0.36); g.lineTo(x + 14, H * 0.52); g.lineTo(x - 14, H * 0.52); g.fill(); } g.restore(); }
    if (lv === 'scifi') { g.strokeStyle = '#5af0ff'; g.lineWidth = 3; g.shadowColor = '#5af0ff'; g.shadowBlur = 8; for (let k = 0; k < 6; k++) { const y = H * (0.35 + k * 0.06); g.beginPath(); g.moveTo(0, y); for (let x = 0; x < W; x += 40) g.lineTo(x + 20, y + ((x / 40 | 0) % 2 ? 6 : -6)); g.stroke(); } g.shadowBlur = 0; }
    if (lv === 'starwalk') { g.fillStyle = '#b01020'; g.fillRect(0, H * 0.55, W, H * 0.12); g.fillStyle = '#ffcf3d'; for (let x = 24; x < W; x += 48) { g.save(); g.translate(x, H * 0.61); g.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, r = k % 2 ? 4 : 9; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); g.restore(); } }
    return c; }; }
{ const _ic = itemIconSvg; itemIconSvg = function (it, size = 34) { if (it && it.type === 'livery') { const col = { filmstrip: '#111', clapper: '#f4f4f4', scifi: '#5af0ff', starwalk: '#b01020' }[it.liv] || '#888';
      return `<svg viewBox="0 0 60 40" width="${size}" height="${size * 2 / 3}"><path d="M4 28 L10 20 L24 17 L32 10 L46 10 L54 18 L58 22 L58 30 L4 30Z" fill="#c8ccd2"/><rect x="4" y="22" width="54" height="5" fill="${col}"/><circle cx="16" cy="30" r="5" fill="#222"/><circle cx="46" cy="30" r="5" fill="#222"/></svg>`; } return _ic(it, size); }; }
const MV = (o) => addItem(Object.assign({ lim: 1, movie: 1 }, o));
[['シルバースクリーン', 'Silver Screen', '#d8dce0', 'chrome', 'L'], ['フィルムノワール', 'Film Noir', '#141414', 'matte', 'R'], ['テクニカラーレッド', 'Technicolor Red', '#e01020', 'candy', 'E'], ['ポップコーン', 'Popcorn', '#ffe28a', 'pearl', 'R'], ['スペースパープル', 'Space Purple', '#5a2aff', 'diamond', 'E'], ['ステンレス', 'Stainless', '#b9bec4', 'metallic', 'R']]
  .forEach(([nm, en, c, p, r], i) => MV({ id: 'mvp_' + i, type: 'paint', name: nm, en, rarity: r, color: c, paint: p }));
[['スポットライト', [1, 0.95, 0.8], 'R'], ['レッドカーペット', [1, 0.1, 0.15], 'E'], ['ホログラム', [1, 1, 1], 'L', 1]].forEach(([nm, rgb, r, rb], i) => MV({ id: 'mvn_' + i, type: 'neon', name: nm + 'ネオン', rarity: r, rgb, rainbow: !!rb }));
MV({ id: 'mvpl_0', type: 'plate', name: '光るナンバー「プレミア」', rarity: 'E', rgb: [1, 0.8, 0.3] });
[['ACTION!', '#111', '#ffcf3d'], ['CUT!', '#fff', '#c00'], ['TAKE 1', '#111', '#fff'], ['PREMIERE', '#5a0010', '#ffd84a'], ['NOW SHOWING', '#111', '#ff3a3a'], ['DIRECTOR', '#2a2a2a', '#fff'], ['STUNT CREW', '#ff6a00', '#111'], ['SCI-FI', '#05030f', '#5af0ff'], ['銀幕', '#111', '#e8e2d0', 'serif'], ['主演', '#5a0010', '#ffcf3d', 'serif'], ['撮影中', '#c00', '#fff', 'serif'], ['監督', '#111', '#ffd84a', 'serif']]
  .forEach(([t, bg, fg, font], i) => MV({ id: 'mvd_' + i, type: 'decal', name: '「' + t + '」ステッカー', rarity: ['R', 'R', 'R', 'E', 'E', 'R', 'R', 'E', 'E', 'E', 'R', 'L'][i], kind: 'text', text: t, bg, fg, font: font || 'Arial' }));
[['フィルムリール', 'Film Reel', 5, 1, '#d8dce0', 'E'], ['ハリウッドゴールド', 'Studio Gold', 10, 0, '#d4af37', 'R']].forEach(([nm, en, sp, deep, rim, r], i) => MV({ id: 'mvw_' + i, type: 'wheel', name: nm, en, rarity: r, spokes: sp, deep, rim }));
// プロフィール（フレームは専用の絵柄「film」）
MV({ id: 'mvf_0', type: 'pframe', name: 'フレーム「フィルムストリップ」', en: 'Frame "Film Strip"', rarity: 'E', fk: 'film', c1: '#e8e2d0', c2: '#111', desc: 'ムービーパック限定のフレーム' });
MV({ id: 'mvf_1', type: 'pframe', name: 'フレーム「レッドカーペット」', en: 'Frame "Red Carpet"', rarity: 'L', fk: 'film', c1: '#ffcf3d', c2: '#b01020', desc: 'ムービーパック限定のフレーム' });
MV({ id: 'mve_0', type: 'peffect', name: 'エフェクト「スポットライト」', en: 'Effect "Spotlight"', rarity: 'E', ek: 'sparkle', c1: '#fff3c0', desc: 'ムービーパック限定のエフェクト' });
MV({ id: 'mve_1', type: 'peffect', name: 'エフェクト「タイムワープ」', en: 'Effect "Time Warp"', rarity: 'L', ek: 'bolt', c1: '#5af0ff', desc: 'ムービーパック限定のエフェクト' });
MV({ id: 'mvb_0', type: 'pbanner', name: 'バナー「プレミアナイト」', en: 'Banner "Premiere Night"', rarity: 'R', bk: 'grad', c1: '#1a0a00', c2: '#ffb000', desc: 'ムービーパック限定のバナー' });
MV({ id: 'mvb_1', type: 'pbanner', name: 'バナー「フィルムロール」', en: 'Banner "Film Roll"', rarity: 'E', bk: 'stripes', c1: '#111', c2: '#e8e2d0', desc: 'ムービーパック限定のバナー' });
MV({ id: 'mvi_0', type: 'picon', name: 'アイコン「MUSIC SCORE」', en: 'Icon "MUSIC SCORE"', rarity: 'R', ic: 'music', c1: '#ffcf3d', desc: 'ムービーパック限定のアイコン' });
[['名監督', 'Master Director', 'E'], ['スタントドライバー', 'Stunt Driver', 'R'], ['主演ドライバー', 'Leading Driver', 'E'], ['銀幕のスター', 'Silver Screen Star', 'L'], ['時をかけるドライバー', 'Time-Traveling Driver', 'L']].forEach(([nm, en, r], i) => MV({ id: 'mvt_' + i, type: 'title', name: '称号「' + nm + '」', en: 'Title "' + en + '"', rarity: r, title: nm, titleEn: en, desc: 'ムービーパック限定の称号' }));
{ const _fs = frameSvg; frameSvg = function (f, S) { if (!f || f.fk !== 'film') return _fs(f, S); const R = 50, around = (n, fn) => Array.from({ length: n }, (_, i) => fn(i * 360 / n, i)).join('');
    const g = `<circle cx="60" cy="60" r="${R}" fill="none" stroke="${f.c2}" stroke-width="12"/>` + around(20, a => `<rect x="57" y="${60 - R - 3}" width="6" height="6" rx="1" fill="${f.c1}" transform="rotate(${a} 60 60)"/>`);
    return `<svg class="pav-fr" viewBox="-10 -10 140 140" width="${S * 1.4}" height="${S * 1.4}">${g}</svg>`; }; }
// イベント限定アイテム
addItem({ id: 'ev_cn_tt', type: 'title', name: '称号「プレミア上映」', en: 'Title "Premiere Screening"', rarity: 'E', title: 'プレミア上映', titleEn: 'Premiere Screening', lim: 1, desc: 'シネマナイト限定の称号' });
addItem({ id: 'ev_cn_dc', type: 'decal', name: '「CINEMA NIGHT」ステッカー', rarity: 'R', kind: 'text', text: 'CINEMA NIGHT', bg: '#1a0a00', fg: '#ffcf3d', font: 'Arial', lim: 1 });
addItem({ id: 'ev_cn_pt', type: 'paint', name: 'プレミアゴールド', en: 'Premiere Gold', rarity: 'E', color: '#d4a017', paint: 'chrome', lim: 1 });
addItem({ id: 'ev_cn_fr', type: 'pframe', name: 'フレーム「シネマナイト」', en: 'Frame "Cinema Night"', rarity: 'E', fk: 'film', c1: '#5af0ff', c2: '#1a0a2a', lim: 1, desc: 'シネマナイト限定のフレーム' });
addItem({ id: 'ev_cn_lv', type: 'livery', liv: 'starwalk', name: 'リバリー「スターロード」（イベント）', rarity: 'E', lim: 1, desc: 'シネマナイト限定' });
for (const it of ITEMS) ITEM_BY_ID[it.id] = it;

// ---------------- ムービーパック ----------------
CHESTS.push({ id: 'moviepack', name: 'ムービーカードパック', price: 2500000, odds: { C: 0, U: 0, R: 55, E: 32, L: 13 }, color: '#ffb000', pool: 'movie', limited: 'movie' });
PACK_ART.moviepack = { a: '#1a0a00', b: '#ffb000', t: 'MOVIE' }; CARD_PACKS.push('moviepack'); PACK_CAR.moviepack = 'mv_chrono'; PACK_TIER.moviepack = 4;
{ const _pp = packPool; packPool = function (c, rar) { if (c.pool === 'movie') return ITEMS.filter(i => i.rarity === rar && i.movie); return _pp(c, rar).filter(i => !i.movie); }; }
{ const _pt = packTimer; packTimer = function (c) { if (c.limited === 'movie') return { t: Math.max(0, movieWin().end - SRV.now()) }; return _pt(c); }; }
{ const _oc = UI.a_openChest; UI.a_openChest = function (v) { if (String(v).startsWith('moviepack') && !movieOpen()) return this.toast('ムービーカードパックは期間限定です'); return _oc.call(this, v); }; }
{ const _ps = UI.packStoreHTML; UI.packStoreHTML = function () { if (movieOpen()) return _ps.apply(this, arguments); const i = CHESTS.findIndex(c => c.id === 'moviepack'); const s = i >= 0 ? CHESTS.splice(i, 1)[0] : null; try { return _ps.apply(this, arguments); } finally { if (s) CHESTS.splice(i, 0, s); } }; }
// 開発者メニュー：ムービーパックの期間
{ const _dp = UI.r_devPanel; UI.r_devPanel = function () { let h = _dp.call(this); if (!DEV.owner || !window.DL_FB) return h; h = h.replace('</div><div class="note">', `<button class="tab ${this.tab === 'movie' ? 'on' : ''}" data-a="setTab" data-v="movie">MOVIE PACK</button></div><div class="note">`); if (this.tab !== 'movie') return h;
    const w = movieWin(), f = t => new Date(t + 9 * 3600000).toISOString().slice(0, 16);
    return h + `<div class="kv dev-kv"><div>現在の期間</div><div>${new Date(w.start).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} 〜 ${new Date(w.end).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}（${movieOpen() ? '<span class="ok">販売中</span>' : '販売していません'}）</div><div>設定元</div><div>${MOVIE.srv && MOVIE.srv.end ? 'サーバー（開発者が設定）' : 'ゲーム内の初期値'}</div></div>
      <div class="dev-form"><label>開始（日本時間）<input id="mvS" type="datetime-local" value="${f(w.start)}"></label><label>終了（日本時間）<input id="mvE" type="datetime-local" value="${f(w.end)}"></label><div class="btns"><button class="btn pri" data-a="mvSave">期間を保存</button><button class="btn" data-a="mvNow" data-v="7">今から7日間</button><button class="btn" data-a="mvNow" data-v="30">今から30日間</button><button class="btn" data-a="mvStop">今すぐ終了</button><button class="btn" data-a="mvReset">初期値に戻す</button></div></div><div class="note">保存すると全プレイヤーのストアにすぐ反映されます（ムービーパックの販売・残り時間表示）。</div>`; }; }
Object.assign(UI, {
  mvWrite(st, en, msg) { this._adm(async () => { await ADM.write('admin/movie', { start: st, end: en, by: DL_FB.user.uid }); await ADM.log('movie-pack', new Date(st).toISOString() + ' - ' + new Date(en).toISOString()); MOVIE.srv = { start: st, end: en }; this.render(); }, msg); },
  a_mvSave() { const st = this._dt('mvS'), en = this._dt('mvE'); if (!st || !en || en <= st) return this.toast('開始と終了を正しく入力してください'); this.mvWrite(st, en, 'ムービーパックの期間を保存しました'); },
  a_mvNow(d) { const st = SRV.now(); this.mvWrite(st, st + (+d) * 86400000, `今から${d}日間に設定しました`); },
  a_mvStop() { const t = SRV.now(); this.mvWrite(Math.min(movieWin().start, t - 1000), t - 1000, 'ムービーパックの販売を終了しました'); },
  a_mvReset() { this._adm(async () => { await ADM.write('admin/movie', null); await ADM.log('movie-pack', 'reset'); MOVIE.srv = null; this.render(); }, '初期値に戻しました'); }
});

// ---------------- 映画スタジオのマップ ----------------
const CINEMA = turtleCourse([
  ['S', 240, 0, 'start'], ['A', 35, -90], ['S', 200, 0, 'stages'], ['A', 28, 90], ['S', 70], ['A', 28, -90], ['S', 230, 0, 'western'], ['A', 40, -90],
  ['S', 160, 0, 'scifi'], ['A', 30, -45], ['A', 30, 45], ['S', 150, 0, 'city'], ['A', 35, -90], ['S', 300], ['A', 30, -90]
], [0, 12]);
{ const T = CINEMA.tags; MAPS.push({ id: 'cinema', name: 'CINEMA STUDIO BACKLOT', jp: '映画スタジオ・バックロット', cat: 'event', env: 'city', seed: 7505, R: 500, N: 40, ctrl: CINEMA.ctrl, harm: [[2, 0]], hp: [], H: 0, width: 11, diff: 2, time: 'night', weather: 'clear',
    custom: 'cinema', start: true, unlock: null, isNew: '3.7', mtags: T,
    desc: '巨大な撮影スタジオの敷地を走るムービーイベントのコース。レッドカーペットと巨大スクリーンのゲートから、サウンドステージ、西部劇の町、SF映画のセット、ニューヨーク風の街並みのセットを駆け抜ける。',
    feats: ['巨大スクリーン・レッドカーペット', 'サウンドステージ', '西部劇の町のセット', 'SF映画のセット', '街並みのセット', 'サーチライト'] }); MAP_BY_ID.cinema = MAPS[MAPS.length - 1]; }
{ const _fin = Track.prototype.finalize; Track.prototype.finalize = function (pts) { _fin.call(this, pts); if (this.def.custom === 'cinema') { this.clearL.fill(2); this.clearR.fill(2); } }; }
CUSTOM_SCENE.cinema = function (S) {
  const { track, def, ch, G, addGlow, lamps, groundY: gy, rng, vary, wallOff, n, building, tree, X, Z } = S; const T = def.mtags, idx = f => Math.round(f * n) % n, RX = track.RX, RZ = track.RZ, HD = track.HD;
  const at = (i, lat) => [X[i] + RX[i] * lat, Z[i] + RZ[i] * lat];
  const range = tag => { const a = idx(T[tag][0][0]), b = idx(T[tag][0][1]); const L = []; for (let i = a; i !== b; i = (i + 1) % n) L.push(i); return L; };
  // サウンドステージ（大きな建物・番号）
  range('stages').filter((_, k) => k % 26 === 0).forEach((i, k) => { for (const sd of [-1, 1]) { const [x, z] = at(i, sd * (wallOff + 22)); G.box(x, gy + 11, z, 40, 22, 30, vary([0.86, 0.8, 0.68], 0.05), HD[i], [0.55, 0.52, 0.46]); const [sx, sz] = at(i, sd * (wallOff + 6.9)); G.e = 0.6; G.box(sx, gy + 15, sz, 6, 6, 0.3, [0.9, 0.9, 0.85], HD[i]); G.e = 0; G.box(sx, gy + 3, sz, 8, 6, 0.4, [0.4, 0.3, 0.22], HD[i]); addGlow([sx, gy + 7, sz], 2, [1, 0.8, 0.5], 0.7); } });
  // 西部劇の町（木造の正面だけのセット・樽・水桶）
  range('western').filter((_, k) => k % 9 === 0).forEach(i => { for (const sd of [-1, 1]) { const [x, z] = at(i, sd * (wallOff + 8)), h = 7 + rng() * 5; G.box(x, gy + h / 2, z, 14, h, 0.6, vary([0.52, 0.34, 0.2], 0.15), HD[i]); G.box(x, gy + 3.4, z, 14, 0.25, 3, [0.4, 0.26, 0.15], HD[i]); for (const o of [-6, 6]) { const [px, pz] = at(i, sd * (wallOff + 6.6)); G.box(px + Math.sin(HD[i]) * o, gy + 1.7, pz + Math.cos(HD[i]) * o, 0.25, 3.4, 0.25, [0.36, 0.24, 0.14], 0); }
      const [wx, wz] = at(i, sd * (wallOff + 5)); G.cylY(wx, gy, wz, 0.45, 0.45, 1, 8, [0.45, 0.3, 0.18], true); G.e = 0.8; addGlow([x, gy + 4, z], 1.4, [1, 0.7, 0.3], 0.8); G.e = 0; } });
  // SFセット（ドーム・アンテナ・円盤）
  range('scifi').filter((_, k) => k % 20 === 0).forEach((i, k) => { const sd = k % 2 ? 1 : -1, [x, z] = at(i, sd * (wallOff + 18)); G.cylY(x, gy, z, 10, 2, 9, 16, [0.82, 0.86, 0.9], true); G.e = 1; G.cylY(x, gy + 3, z, 10.05, 10.05, 0.4, 16, [0.3, 0.9, 1], false); G.e = 0; addGlow([x, gy + 4, z], 6, [0.3, 0.9, 1], 0.6); const [ax, az] = at(i, -sd * (wallOff + 9)); G.cylY(ax, gy, az, 0.2, 0.1, 16, 6, [0.7, 0.7, 0.75], true); G.e = 1; addGlow([ax, gy + 16, az], 2, [1, 0.2, 0.2], 1); G.e = 0; });
  { const i = range('scifi')[40] || 0, [x, z] = at(i, wallOff + 34); G.cylY(x, gy + 14, z, 14, 4, 2.2, 20, [0.75, 0.78, 0.84], true); G.cylY(x, gy + 16.2, z, 4, 2, 2, 14, [0.5, 0.9, 1], true); G.cylY(x, gy, z, 0.6, 0.6, 14, 6, [0.4, 0.4, 0.42], true); for (let k = 0; k < 8; k++) addGlow([x + Math.cos(k / 8 * TAU) * 12, gy + 14, z + Math.sin(k / 8 * TAU) * 12], 1.4, [0.4, 1, 0.6], 0.9); }
  // 街並みのセット（ビル・非常階段・ネオン）
  range('city').filter((_, k) => k % 8 === 0).forEach(i => { for (const sd of [-1, 1]) { const w = 10 + rng() * 6, d = 10 + rng() * 6, [x, z] = at(i, sd * (wallOff + 6 + d / 2)); building(ch(i).bld, x, gy, z, w, d, 16 + rng() * 20, HD[i], vary([0.62, 0.42, 0.34], 0.15)); const [fx, fz] = at(i, sd * (wallOff + 5.6)); for (let f = 1; f < 5; f++) G.box(fx, gy + f * 3.4, fz, 3, 0.15, 1.2, [0.15, 0.15, 0.16], HD[i]); if (rng() < 0.6) { const c = [[1, 0.2, 0.4], [0.2, 0.9, 1], [1, 0.8, 0.2]][Math.floor(rng() * 3)]; G.e = 1; G.box(fx, gy + 6 + rng() * 4, fz, 0.3, 2.5, 4, c, HD[i]); G.e = 0; addGlow([fx, gy + 7, fz], 4, c, 0.6); } } });
  // スタート：巨大スクリーン・レッドカーペット・ゲート・サーチライト・給水塔
  const i0 = idx(T.start[0][0] + 0.004); { const [x, z] = at(i0, -(wallOff + 30)); G.box(x, gy + 14, z, 40, 22, 1.5, [0.1, 0.1, 0.12], HD[i0]); G.e = 1; G.box(x + Math.cos(HD[i0]) * 0, gy + 14, z, 37, 19, 1.6, [0.35, 0.55, 0.95], HD[i0]); G.e = 0; addGlow([x, gy + 14, z], 22, [0.4, 0.6, 1], 0.35); for (const o of [-14, 14]) G.box(x + Math.sin(HD[i0]) * o, gy + 1.5, z + Math.cos(HD[i0]) * o, 1.2, 3, 1.2, [0.2, 0.2, 0.22], HD[i0]); }
  range('start').slice(10, 110).forEach((i, k) => { if (k % 2) return; for (const sd of [-1, 1]) { const [x, z] = at(i, sd * (wallOff + 3)); G.box(x, gy + 0.03, z, 3.2, 0.06, 2.2, [0.65, 0.05, 0.1], HD[i]); if (k % 10 === 0) { const [px, pz] = at(i, sd * (wallOff + 4.8)); G.cylY(px, gy, pz, 0.1, 0.1, 1, 6, [0.85, 0.7, 0.2], true); } } });
  { const i = range('start')[60] || i0; for (const sd of [-1, 1]) { const [x, z] = at(i, sd * (wallOff + 1.5)); G.box(x, gy + 5, z, 1.6, 10, 1.6, [0.9, 0.85, 0.7], HD[i]); } const [cx, cz] = at(i, 0); G.box(cx, gy + 10.5, cz, 2 * wallOff + 5, 1.8, 1.6, [0.9, 0.85, 0.7], HD[i] + Math.PI / 2 * 0); G.e = 1; G.box(cx, gy + 10.5, cz, 2 * wallOff, 0.9, 1.7, [1, 0.8, 0.3], HD[i]); G.e = 0; addGlow([cx, gy + 10.5, cz], 6, [1, 0.8, 0.3], 0.6); }
  for (let k = 0; k < 6; k++) { const i = range('start')[20 + k * 16] || i0, sd = k % 2 ? 1 : -1, [x, z] = at(i, sd * (wallOff + 14)); G.cylY(x, gy, z, 0.9, 0.9, 1.4, 10, [0.25, 0.25, 0.28], true); for (let h = 1; h <= 12; h++) addGlow([x + Math.cos(k + h * 0.05) * h * 2.5 * sd, gy + 2 + h * 4, z + Math.sin(k) * h * 1.2], 1.6 + h * 0.25, [0.95, 0.95, 0.85], 0.35 - h * 0.02); }
  { const i = range('stages')[30] || 0, [x, z] = at(i, wallOff + 50); for (const a of [-3, 3]) for (const b of [-3, 3]) G.box(x + a, gy + 9, z + b, 0.5, 18, 0.5, [0.55, 0.55, 0.6], 0); G.cylY(x, gy + 18, z, 6, 6, 7, 16, [0.82, 0.84, 0.86], true); G.e = 0.5; G.cylY(x, gy + 20.5, z, 6.05, 6.05, 1.5, 16, [0.9, 0.2, 0.2], false); G.e = 0; }
  for (let i = 0; i < n; i += 40) { const [x, z] = at(i, (i / 40) % 2 ? wallOff + 9 : -(wallOff + 9)); tree(G, x, gy, z, 0.9); }
};
// ---------------- 期間限定イベント「シネマナイト」 ----------------
EVENTS.push({ id: 'cinema2026', title: 'CINEMA NIGHT', jp: 'シネマナイト', start: JST('2026-11-20T00:00:00'), end: JST('2026-12-14T23:59:59'), art: 'cinema', music: 'race',
  desc: '映画スタジオのバックロットを舞台にしたムービーイベント。スタントチームのライバルとのバトルや撮影セットのタイムアタックに挑んで、イベント限定のアイテムを手に入れよう！', cond: 'だれでも参加できます（参加ボタンを押してから走った分がミッションに数えられます）',
  rewardItems: ['ev_cn_tt', 'ev_cn_dc', 'ev_cn_pt', 'ev_cn_fr', 'ev_cn_lv'],
  missions: [{ id: 'r3', name: '3レース完走', key: 'races', goal: 3, rw: { money: 600000, item: 'ev_cn_dc' } }, { id: 'dist', name: '合計 25km 走行', key: 'dist', goal: 25000, unit: v => (v / 1000).toFixed(1) + ' km', rw: { item: 'ev_cn_pt' } }, { id: 'drift', name: 'ドリフトスコア合計 60,000点', key: 'drift', goal: 60000, rw: { item: 'ev_cn_fr', dia: 40 } }, { id: 'win', name: 'スタントバトルで勝利', key: 'evWins', goal: 1, rw: { item: 'ev_cn_tt', dia: 60 } }, { id: 'all', name: 'ほかのミッションをすべて達成', key: 'allDone', goal: 1, rw: { item: 'ev_cn_lv', xp: 1000 } }],
  races: [{ k: 'race', title: 'スタントバトル', sub: '撮影スタジオでスタントチームのエースと1周バトル', map: 'cinema', rival: { name: 'スタントマン 剛', team: 'STUNT CREW', car: 'mv_stunt', color: '#ff6a00', skill: 0.88 }, prize: 1600000 }, { k: 'time', title: 'セット・タイムアタック', sub: '撮影セットを1周、自己ベストに挑戦', map: 'cinema' }] });
{ const _ea = evArt; evArt = function (kind, w = 640, h = 200) { if (kind !== 'cinema') return _ea(kind, w, h);
    return `<svg viewBox="0 0 640 200" width="100%" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="cng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0418"/><stop offset="1" stop-color="#2a0a10"/></linearGradient></defs><rect width="640" height="200" fill="url(#cng)"/>${[90, 180, 460, 560].map((x, k) => `<path d="M${x} 200 L${x - 60 + k * 30} 0 L${x - 20 + k * 30} 0Z" fill="#fff6d0" opacity=".12"/>`).join('')}<rect x="20" y="150" width="600" height="14" fill="#111"/>${Array.from({ length: 40 }, (_, k) => `<rect x="${24 + k * 15}" y="153" width="8" height="8" fill="#e8e2d0" opacity=".8"/>`).join('')}<path d="M420 120 l60 -14 h80 l20 14 v14 h-160z" fill="#b9bec4"/><circle cx="450" cy="136" r="9" fill="#111"/><circle cx="560" cy="136" r="9" fill="#111"/><path d="M420 128 h-60" stroke="#ff8a00" stroke-width="5"/></svg>`; }; }
window.__DLX = Object.assign(window.__DLX || {}, { MOVIE, movieOpen, MVHUD });
