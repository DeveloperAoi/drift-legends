// =====================================================================
// game.js — 入力・レースセッション（カメラ/HUD/ミニマップ/AI/各モード）
// =====================================================================
// エラー記録（ゲームを止めずに記録し、設定画面から確認できる）
function logErr(where, e) {
  try { console.error(where, e); const d = SAVE.data; if (!d) return; d.errLog = d.errLog || []; const msg = where + ': ' + (e && e.message || String(e)) + ' @ ' + ((e && e.stack || '').split('\n')[1] || '').trim().slice(0, 160);
    if (d.errLog[0] && d.errLog[0].m === msg) { d.errLog[0].n++; return; } d.errLog.unshift({ m: msg, t: Date.now(), n: 1, v: navigator.userAgent.slice(0, 120) }); d.errLog.length = Math.min(d.errLog.length, 8); } catch (x) { }
}
const Input = {
  keys: {}, touch: {}, events: [], pad: null, active: false,
  init() {
    const map = { KeyW: 'gas', ArrowUp: 'gas', KeyS: 'brake', ArrowDown: 'brake', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right', Space: 'hand', KeyE: 'nitro', KeyX: 'nitro' };
    const ev = { ShiftLeft: 'up', ShiftRight: 'up', ControlLeft: 'down', ControlRight: 'down', KeyQ: 'down', KeyC: 'cam', KeyN: 'neutral', KeyR: 'reset', Escape: 'pause', KeyP: 'pause', KeyM: 'music' };
    window.addEventListener('keydown', e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (map[e.code]) { this.keys[map[e.code]] = true; if (this.active) e.preventDefault(); }
      if (ev[e.code] && !e.repeat) { this.events.push(ev[e.code]); if (this.active) e.preventDefault(); }
    });
    window.addEventListener('keyup', e => { if (map[e.code]) this.keys[map[e.code]] = false; });
    window.addEventListener('blur', () => { this.keys = {}; this.touch = {}; });
  },
  // タッチ操作: 端末標準の touch イベントで直接処理（iOS 等でポインターイベントが途切れる問題への対策）
  //            指をボタン間で滑らせても反応し、複数の指を同時に使える
  initTouch(root) {
    const hold = { tLeft: 'left', tRight: 'right', tGas: 'gas', tBrake: 'brake', tHand: 'hand', tNitro: 'nitro' }, tapEv = { tUp: 'up', tDown: 'down', tCam: 'cam' }, endEv = { tGyro: 'gyro', tCal: 'cal' };
    const active = new Map(); const S = () => (SAVE.data && SAVE.data.settings) || {}; this.padId = null; this.padSteer = 0;
    const knob = document.getElementById('tPadKnob'); const setKnob = () => { if (knob) knob.style.transform = `translateX(${this.padSteer * 60}%)`; };
    const btnAt = (x, y) => { const el = document.elementFromPoint(x, y); const b = el && el.closest ? el.closest('#touch .tbtn') : null; return b && b.offsetParent !== null ? b.id : null; };
    const refresh = () => {
      for (const k of Object.values(hold)) this.touch[k] = false; const s = S(), tog = s.accelMode === 'toggle';
      root.querySelectorAll('.tbtn.on').forEach(e => e.classList.remove('on'));
      for (const id of active.values()) { if (!id) continue; const el = document.getElementById(id); if (el) el.classList.add('on'); let k = hold[id]; if (!k || (tog && k === 'gas')) continue; if (s.mirror && k === 'left') k = 'right'; else if (s.mirror && k === 'right') k = 'left'; this.touch[k] = true; }
      const g = document.getElementById('tGas'); if (g) g.classList.toggle('latched', tog && this.gasLatch);
    };
    root.addEventListener('touchstart', e => {
      if (!e.target.closest || !e.target.closest('.tbtn')) return; e.preventDefault();
      for (const t of e.changedTouches) { const id = btnAt(t.clientX, t.clientY) || (e.target.closest('.tbtn') || {}).id;
        if (id === 'tPad') { this.padId = t.identifier; this.padX0 = t.clientX; this.padSteer = 0; setKnob(); active.set(t.identifier, null); document.getElementById('tPad').classList.add('on'); continue; }
        active.set(t.identifier, id); if (id && tapEv[id]) this.events.push(tapEv[id]);
        if (id === 'tGas' && S().accelMode === 'toggle') { this.gasLatch = !this.gasLatch; if (navigator.vibrate) try { navigator.vibrate(15); } catch (x) { } } }
      refresh();
    }, { passive: false });
    root.addEventListener('touchmove', e => {
      e.preventDefault(); let ch = false;
      for (const t of e.changedTouches) { if (t.identifier === this.padId) { const R = Math.max(40, innerWidth * (0.1 - (S().steerSens || 0.5) * 0.05)); this.padSteer = clamp((t.clientX - this.padX0) / R, -1, 1); setKnob(); continue; } if (!active.has(t.identifier)) continue; const prev = active.get(t.identifier); if (prev && !hold[prev]) continue; const id = btnAt(t.clientX, t.clientY); const nid = id && hold[id] ? id : null; if (nid !== prev) { active.set(t.identifier, nid); ch = true; } }
      if (ch) refresh();
    }, { passive: false });
    const end = e => {
      e.preventDefault();
      for (const t of e.changedTouches) { if (t.identifier === this.padId) { this.padId = null; this.padSteer = 0; setKnob(); const pe = document.getElementById('tPad'); if (pe) pe.classList.remove('on'); } const id = active.get(t.identifier); active.delete(t.identifier); if (e.type === 'touchend' && id && endEv[id] && this.onEndEv) this.onEndEv(endEv[id]); }
      refresh();
    };
    root.addEventListener('touchend', end, { passive: false }); root.addEventListener('touchcancel', end, { passive: false });
    window.addEventListener('blur', () => { active.clear(); this.padId = null; this.padSteer = 0; setKnob(); refresh(); });
    this.refreshTouch = refresh;
  },
  bindTouch(el, name, isEvent) {
    // マウス/ペン用（指の操作は initTouch の touch イベントで処理）
    const on = e => { if (e.pointerType === 'touch') return; e.preventDefault(); el.classList.add('on'); if (isEvent) this.events.push(name); else this.touch[name] = true; try { el.setPointerCapture(e.pointerId); } catch (x) { } };
    const off = e => { if (e.pointerType === 'touch') return; e.preventDefault(); el.classList.remove('on'); if (!isEvent) this.touch[name] = false; };
    el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off);
    el.addEventListener('contextmenu', e => e.preventDefault());
  },
  read(set) {
    const k = this.keys, t = this.touch; let steer = 0, analog = false;
    let gas = (k.gas || t.gas) ? 1 : 0, brake = (k.brake || t.brake) ? 1 : 0;
    steer = ((k.right || t.right) ? 1 : 0) - ((k.left || t.left) ? 1 : 0);
    let hand = !!(k.hand || t.hand), nitro = !!(k.nitro || t.nitro);
    try {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (const p of pads) {
        if (!p) continue; const ax = p.axes[0] || 0; if (Math.abs(ax) > 0.12) { steer = clamp((ax - Math.sign(ax) * 0.12) / 0.88, -1, 1); analog = true; }
        const b = i => p.buttons[i] ? (p.buttons[i].value || (p.buttons[i].pressed ? 1 : 0)) : 0;
        gas = Math.max(gas, b(7)); brake = Math.max(brake, b(6)); if (b(0) > 0.5) hand = true; if (b(1) > 0.5) nitro = true;
        const prev = this.pad || {}; const now = { up: b(5) > 0.5, down: b(4) > 0.5, cam: b(3) > 0.5, pause: b(9) > 0.5, reset: b(8) > 0.5 };
        for (const kk in now) if (now[kk] && !prev[kk]) this.events.push(kk); this.pad = now; break;
      }
    } catch (e) { }
    if (set && steer === 0 && !analog && this.padId !== null && set.steerMode === 'slide') { steer = this.padSteer; analog = true; }
    if (set && steer === 0 && !analog) { const gs = Gyro.steer(set); if (gs !== null) { steer = gs; analog = true; } }
    if (set && set.accelMode === 'auto' && !brake && !hand) gas = Math.max(gas, 1);
    if (set && set.accelMode === 'toggle' && this.gasLatch && !brake) gas = Math.max(gas, 1);
    return { throttle: gas, brake, steer, hand, nitro, analog, steerRate: set ? 1.6 + set.steerSens * 2.2 : 2.6 };
  },
  pop() { const e = this.events; this.events = []; return e; }
};

// ---------------- スキッドマーク ----------------
// ---------------- ジャイロ（端末の傾き）ステアリング ----------------
const Gyro = {
  on: false, ok: false, cur: 0, offset: 0, last: 0, listening: false,
  raw(e) { const so = screen.orientation; const ang = so && typeof so.angle === 'number' ? so.angle : (window.orientation || 0); let t = ang === 90 ? e.beta : (ang === -90 || ang === 270) ? -e.beta : e.gamma; return t || 0; },
  listen() { if (this.listening) return; this.listening = true; window.addEventListener('deviceorientation', e => { if (e.beta == null && e.gamma == null) return; this.cur = this.raw(e); this.last = performance.now(); this.ok = true; }); },
  async enable() {
    try { if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') { const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') return this.fail('モーションセンサーの使用が許可されませんでした'); } }
    catch (e) { return this.fail('モーションセンサーの許可を求められませんでした（この表示環境では制限されています）'); }
    if (typeof DeviceOrientationEvent === 'undefined') return this.fail('この端末/ブラウザはジャイロに対応していません');
    this.listen(); const t0 = performance.now();
    await new Promise(r => setTimeout(r, 1500));
    if (!this.ok || this.last < t0) return this.fail('ジャイロのデータを取得できません（この表示環境ではモーションセンサーが制限されている可能性があります）');
    this.on = true; this.calibrate(); SAVE.data.settings.gyro = true; SAVE.data.settings.steerMode = 'gyro'; SAVE.save(); document.body.classList.add('gyro'); UI.toast('ジャイロ操作 ON（現在の傾きを中央に設定）'); UI.gyroChanged(); return true;
  },
  disable() { this.on = false; SAVE.data.settings.gyro = false; if (SAVE.data.settings.steerMode === 'gyro') SAVE.data.settings.steerMode = 'buttons'; SAVE.save(); document.body.classList.remove('gyro'); UI.toast('ジャイロ操作 OFF'); UI.gyroChanged(); },
  toggle() { return this.on ? this.disable() : this.enable(); },
  fail(msg) { this.on = false; SAVE.data.settings.gyro = false; if (SAVE.data.settings.steerMode === 'gyro') SAVE.data.settings.steerMode = 'buttons'; SAVE.save(); document.body.classList.remove('gyro'); UI.toast(msg); AUDIO.error(); UI.gyroChanged(); return false; },
  calibrate() { this.offset = this.cur; },
  steer(set) {
    if (!this.on || !this.ok || performance.now() - this.last > 1000) return null;
    const maxT = 10 + (1 - (set.gyroSens ?? 0.5)) * 30; let d = wrapAngleDeg(this.cur - this.offset); if (set.gyroInvert) d = -d;
    const dz = 1.5; d = Math.abs(d) < dz ? 0 : d - Math.sign(d) * dz; return clamp(d / maxT, -1, 1);
  }
};
function wrapAngleDeg(a) { while (a > 180) a -= 360; while (a < -180) a += 360; return a; }

class SkidMarks {
  constructor(gl, max = 1600) { this.gl = gl; this.max = max; this.data = new Float32Array(max * 6 * VSTRIDE); this.buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.DYNAMIC_DRAW); this.head = 0; this.count = 0; this.dirtyFrom = -1; this.dirtyTo = -1; this.mesh = { buf: this.buf, count: 0, center: [0, 0, 0], radius: 1e6 }; }
  add(a0, a1, b0, b1, alpha) {
    const o = this.head * 6 * VSTRIDE, d = this.data; const c = alpha;
    const P = [a0, a1, b1, a0, b1, b0];
    for (let k = 0; k < 6; k++) { const p = P[k], q = o + k * VSTRIDE; d[q] = p[0]; d[q + 1] = p[1]; d[q + 2] = p[2]; d[q + 3] = 0; d[q + 4] = 1; d[q + 5] = 0; d[q + 6] = c; d[q + 7] = c; d[q + 8] = c; d[q + 9] = 0; d[q + 10] = 1; d[q + 11] = 0; d[q + 12] = 0; }
    if (this.dirtyFrom < 0) this.dirtyFrom = this.head; this.dirtyTo = this.head;
    this.head = (this.head + 1) % this.max; this.count = Math.min(this.max, this.count + 1); this.mesh.count = this.count * 6;
    if (this.head === 0) { this.dirtyFrom = 0; this.dirtyTo = this.max - 1; }
  }
  flush() {
    if (this.dirtyFrom < 0) return; const gl = this.gl; gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    const a = Math.min(this.dirtyFrom, this.dirtyTo), b = Math.max(this.dirtyFrom, this.dirtyTo);
    gl.bufferSubData(gl.ARRAY_BUFFER, a * 6 * VSTRIDE * 4, this.data.subarray(a * 6 * VSTRIDE, (b + 1) * 6 * VSTRIDE)); this.dirtyFrom = -1;
  }
  dispose() { this.gl.deleteBuffer(this.buf); }
}

// =====================================================================
class Game {
  constructor(R, ui) { this.R = R; this.ui = ui; this.active = false; this.paused = false; this.camMode = 0; this.tmpM = M4.create(); }
  start(cfg) {
    Input.gasLatch = false; if (Input.refreshTouch) Input.refreshTouch();
    this.cleanup();
    this.cfg = cfg; const R = this.R; const set = SAVE.data.settings;
    if (window.DL_FB && lbBlocked(cfg.carInst, null)) setTimeout(() => this.active && this.ui.toast('エキストラ装着中（またはテスト機能ON）のため、週間ランキングには記録されません'), 4200);
    { const L = (cfg.carInst && cfg.carInst.look) || {}, ids = [L.extra, L.extra2].filter((x, i, a) => x && a.indexOf(x) === i); this.extras = typeof EXTRA_BY_ID !== 'undefined' ? ids.map(id => EXTRA_BY_ID[id]).filter(Boolean) : []; } this.extra = this.extras[0] || null; this.smokeEx = this.extras.find(e => e.kind === 'smoke') || null; this.exActive2 = null; this.vert = this.extras.some(e => e.kind === 'hop'); this._exPrev = false; this.exActive = null; this._exWas = false; this._lbWarned = false;
    const def = MAP_BY_ID[cfg.mapId];
    this.track = new Track(def);
    this.env = makeEnv(cfg.time, cfg.weather); R.env = this.env;
    this.world = buildWorld(this.track, R, { weather: cfg.weather, time: cfg.time, quality: set.quality });
    this.night = cfg.time === 'night' ? 1 : cfg.time === 'evening' ? 0.4 : 0;
    this.lightsOn = cfg.time !== 'day' || cfg.weather === 'rain' || cfg.weather === 'fog' || cfg.weather === 'snow';
    // 粒子
    this.smoke = new Particles(R.gl, set.quality === 0 ? 260 : 600, false, true);
    this.sparks = new Particles(R.gl, 200, true, false);
    this.weatherP = new Particles(R.gl, cfg.weather === 'rain' ? 1100 : cfg.weather === 'snow' ? 900 : 1, false, cfg.weather === 'snow');
    this.lightsP = new Particles(R.gl, 160, true, true);
    this.skids = new SkidMarks(R.gl);
    this.skidMat = Mat({ blend: true, alpha: 0.55, depthWrite: false, emis: 0, spec: 0 });
    // プレイヤー
    const inst = cfg.carInst; this.carInst = inst; const car = CAR_BY_ID[inst.id];
    const tune = Object.assign({}, inst.tune, { _look: inst.look });
    this.spec = computeSpec(car, tune);
    this.veh = new Vehicle(this.spec); this.veh.auto = set.trans !== 'MT';
    this.model = buildCarModel(R, car, inst.look, { height: inst.tune.height, wheelIn: inst.tune.wheelIn, tireW: inst.tune.tireW, camber: inst.tune.camber });
    this.model.setLights(this.lightsOn);
    let startProg = cfg.mode === 'touge' || cfg.mode === 'free' ? 6 : 4, startLat = cfg.rivals && cfg.rivals.length ? 2.2 : 0;
    if (cfg.mode === 'online') { const gi = cfg.grid || 0; startProg = 4 - Math.floor(gi / 2) * 9; startLat = gi % 2 ? 2.2 : -2.2; }
    if (cfg.mode === 'drag') { startProg = 4; startLat = 3.2; }
    this.startProg = startProg;
    const sp = this.track.pointAt(startProg, startLat);
    this.veh.reset(sp.x, sp.z, sp.y, sp.hd);
    this.loc = this.track.locate(sp.x, sp.z, -1);
    // ライバル
    this.rivals = (cfg.rivals || []).map((rv, k) => {
      const rc = CAR_BY_ID[rv.car]; const rlook = Object.assign(defaultLook(rc), { color: rv.color || rc.color, livery: rv.livery || 'none', wing: rc.body === 'rally' ? 2 : (rv.wing || 0) });
      const spec = computeSpec(rc); const model = buildCarModel(R, rc, rlook, {}); model.setLights(this.lightsOn);
      return { def: rv, car: rc, spec, model, prog: startProg, lat: cfg.mode === 'drag' ? -3.2 : -2.2 - k * 0, v: 0, lapDist: 0, finished: false, finishT: 0, engine: null, smokeAcc: 0, drift: 0, hd: sp.hd, x: 0, y: 0, z: 0, wheelSpin: 0 };
    });
    // ゴースト
    this.ghost = null; this.ghostRec = []; this.ghostData = null;
    if (cfg.mode === 'time') {
      const g = SAVE.loadGhost(cfg.mapId); if (g && g.frames && g.frames.length > 10) { this.ghostData = g; const gc = CAR_BY_ID[g.car] || car; this.ghost = buildCarModel(R, gc, Object.assign(defaultLook(gc), { color: '#80c0ff' }), { ghost: true }); }
    }
    // 状態
    Object.assign(this, {
      t: 0, raceT: 0, countdown: cfg.mode === 'free' ? 0 : 3.6, started: cfg.mode === 'free', finished: false, lap: 0, lapStart: 0, laps: [], sector: 0, sectorTimes: [], curSectors: [], lastProg: this.loc.prog, totalDist: 0,
      maxSpeed: 0, damage: 0, wrongT: 0, stuckT: 0, msgQ: [], camShake: 0, nightDist: 0,
      drift: { on: false, pts: 0, t: 0, off: 0, combo: 0, maxCombo: 0, count: 0, score: 0, lastEnd: 0, corner: -1, cornerPts: 0 },
      camPos: null, camDir: [Math.sin(sp.hd), Math.cos(sp.hd)], fovCur: 60, lastCD: 4, crashCool: 0, hudT: 0, lightT: 0, endReason: ''
    });
    this.camMode = set.camera || 0;
    if (cfg.mode !== 'free') this.veh.gear = 0;
    this.myFinish = 0; this.netGone = {};
    // サウンド
    AUDIO.stopAllEngines(); AUDIO.starter();
    setTimeout(() => { if (this.active) { this.engine = AUDIO.createEngine(this.spec, true); this.rivals.forEach(r => r.engine = AUDIO.createEngine(r.spec, false)); } }, 700);
    AUDIO.playCat(def.xmas ? 'xmas' : cfg.mode === 'story' ? 'story' : 'race', true);
    // ミニマップ準備
    this.prepMinimap();
    this.active = true; this.paused = false; Input.active = true;
    this.ui.showHUD(cfg);
  }
  cleanup() {
    if (!this.world) return;
    try { this.world.dispose(); this.model.dispose(); this.rivals.forEach(r => r.model.dispose()); if (this.ghost) this.ghost.dispose(); this.skids.dispose(); } catch (e) { }
    AUDIO.stopAllEngines(); this.engine = null; this.world = null; this.active = false; Input.active = false;
  }
  exit() { try { if (window.DL_FB && this.active !== false) lbSendDist(); } catch (e) { } this.cleanup(); }
  prepMinimap() {
    const tr = this.track; this.mmPts = []; for (let i = 0; i < tr.n; i += 3) this.mmPts.push([tr.X[i], tr.Z[i]]);
  }
  msg(text, cls = '', dur = 1.6) { this.ui.flash(text, cls, dur); }
  // -------------------------------------------------------------
  update(dt) {
    if (!this.active || this.paused) return;
    dt = Math.min(dt, 0.05); this.t += dt;
    const set = SAVE.data.settings, tr = this.track, v = this.veh, cfg = this.cfg;
    // イベント
    for (const e of Input.pop()) {
      if (e === 'pause') { this.ui.pause(); return; }
      if (e === 'cam') { this.camMode = (this.camMode + 1) % 5; this.ui.toast(['三人称視点', 'ボンネット視点', 'コックピット視点', 'バンパー視点', 'ドリフト追従カメラ'][this.camMode]); }
      if (e === 'music') AUDIO.nextTrack(1);
      if (!this.started) continue;
      if (e === 'up') { if (v.gear === 0) v.gear = 1; else v.shift(1); }
      if (e === 'down') v.shift(-1);
      if (e === 'neutral') { v.gear = v.gear === 0 ? 1 : 0; this.ui.toast(v.gear === 0 ? 'ニュートラル' : 'ギア: 1'); }
      if (e === 'reset') this.resetCar();
    }
    const inp = Input.read(set);
    for (const k in inp) if (typeof inp[k] === 'number' && !isFinite(inp[k])) inp[k] = k === 'steerRate' ? 2.6 : 0;
    // カウントダウン
    if (!this.started) {
      this.countdown -= dt; const n = Math.ceil(this.countdown - 0.6);
      if (n !== this.lastCD && n <= 3 && n >= 0) { this.lastCD = n; if (n > 0) { AUDIO.countdown(n); this.ui.countdown(String(n)); } }
      if (this.countdown <= 0.6) { this.started = true; v.gear = 1; AUDIO.countdown(0); this.ui.countdown('GO!'); this.raceT = 0; this.lapStart = 0; }
      else { inp.brake = 1; inp.hand = 1; inp.steer = 0; v.gear = 0; }
    }
    // エキストラ（ブーストボタンで作動）
    const exs = (this.extras || []).filter(e => e.kind !== 'smoke');
    if (exs.length) {
      const press = !!inp.nitro && this.started && !this.finished; inp.nitro = false; const edge = press && !this._exPrev; this._exPrev = press;
      const hold = exs.filter(e => e.kind === 'thrust' || e.kind === 'backfire' || e.kind === 'chute'), tap = exs.filter(e => !hold.includes(e)); let acts = [];
      if (hold.length && press && v.nitro > 0.02) { acts = hold; v.nitro -= Math.max(...hold.map(e => e.drain)) * dt; }
      for (const ex of tap) if (edge && v.nitro >= ex.drain) { v.nitro -= ex.drain; this.extraFire(ex); }
      if (!acts.length) v.nitro += Math.max(...exs.map(e => e.rech || 0.1)) * dt;
      v.nitro = clamp(v.nitro, 0, 1); this.exActive = acts[0] || null; this.exActive2 = acts[1] || null; const ex = acts[0];
      if (ex && !this._exWas) { if (acts.some(e => e.kind === 'thrust')) { AUDIO.nitroBurst(); if (acts.some(e => e.id === 'rocket')) AUDIO.tone(45, 1.2, 'sawtooth', 0.25, 0, 0.6); } if (acts.some(e => e.kind === 'backfire')) AUDIO.pop && AUDIO.pop(); if (acts.some(e => e.kind === 'chute')) AUDIO.noiseBurst(0.5, 600, 0.6, 0.3, 0, 'bandpass'); }
      this._exWas = !!ex;
    }
    // 操作アシスト（オートサイドブレーキ / オートニトロ）
    if (this.started && !this.finished && set && tr.K) {
      if (set.autoHand) { this._ahT = (this._ahT || 0) - dt; const k = Math.abs(tr.K[(this.loc.i + 6 + Math.floor(v.speed * 0.5)) % tr.n] || 0);
        if (this._ahT <= 0 && k > 1 / 45 && v.speed > 14 && Math.abs(v.beta) < 0.22 && Math.abs(inp.steer) > 0.45) { this._ahT = 1.4; this._ahOn = 0.16; }
        if (this._ahOn > 0) { this._ahOn -= dt; inp.hand = true; } }
      if (set.autoNitro && !inp.brake) { const k = Math.abs(tr.K[(this.loc.i + 12) % tr.n] || 0); if (v.speed > 16 && k < 1 / 260 && Math.abs(v.beta) < 0.2) inp.nitro = true; }
    }
    if (this.finished) { inp.throttle = 0; inp.brake = 0.4; inp.steer = 0; inp.nitro = 0; }
    // 物理（サブステップ）
    const loc0 = this.loc;
    const offroad = Math.abs(loc0.lat) > tr.halfW + 0.4 && tr.env !== 'lot';
    const fx = Math.sin(v.heading), fz = Math.cos(v.heading);
    const slopeAlong = tr.env === 'lot' ? 0 : loc0.slope * (fx * loc0.tx + fz * loc0.tz);
    const surf = { grip: this.env.grip * (this.cfg.weather === 'rain' ? this.spec.tire.wet / 0.78 : this.cfg.weather === 'snow' ? this.spec.tire.snow / 0.58 : 1), slope: slopeAlong, offroad, offGrip: tr.offGrip, assist: [0, 0.35, 0.6, 0.85][set.assist ?? 2] };
    if (v.air) { surf.grip *= 0.03; surf.assist = 0; }
    const n = Math.min(8, Math.ceil(dt / (1 / 120))), h = dt / n;
    for (let k = 0; k < n; k++) v.step(h, inp, surf);
    // 非数値（NaN）を検出したら原因を記録して車をコースに戻す（ゲームは止めない）
    if (![v.x, v.z, v.vx, v.vz, v.heading, v.r, v.rpm, v.boost, v.nitro, v.speed].every(isFinite)) {
      const S = this.spec, badSpec = Object.keys(S).filter(k => typeof S[k] === 'number' && !isFinite(S[k]));
      const badIn = Object.keys(inp).filter(k => typeof inp[k] === 'number' && !isFinite(inp[k])), badSurf = Object.keys(surf).filter(k => typeof surf[k] === 'number' && !isFinite(surf[k]));
      logErr('物理NaN', new Error('spec[' + badSpec.join(',') + '] input[' + badIn.join(',') + '] surf[' + badSurf.join(',') + '] car=' + this.carInst.id + ' map=' + this.cfg.mapId + ' weather=' + this.cfg.weather));
      const p = this.track.pointAt(this.loc.prog, 0); v.reset(p.x, p.z, p.y, p.hd); v.gear = this.started ? 1 : 0;
    }
    if (DEV.owner && set.devNitro) v.nitro = 1;
    for (const e of [this.exActive, this.exActive2]) if (e) { if (e.kind === 'thrust') { const a = e.F / this.spec.mass * dt; v.vx += Math.sin(v.heading) * a; v.vz += Math.cos(v.heading) * a; } else if (e.kind === 'chute' && v.speed > 3) { const k = Math.min(0.5, 1.1 * dt); v.vx *= 1 - k; v.vz *= 1 - k; } }
    if (v.blowoff) { v.blowoff = 0; AUDIO.blowoff(); }
    if (this.started) this.raceT += dt;
    // 位置・壁
    this.collide(dt);
    for (const r of this.rivals) if (!r.net) this.updateRival(r, dt);
    if (cfg.mode === 'online') this.updateNet(dt);
    this.collideRivals();
    const loc = this.loc = tr.locate(v.x, v.z, this.loc.i);
    if (!tr.ramps && !this.vert) v.y = tr.env === 'lot' ? 0 : loc.y;
    else { // ジャンプ（空中の上下運動）
      const gnd = (tr.env === 'lot' ? 0 : loc.y) + (tr.ramps ? tr.rampH(loc.prog, loc.lat) : 0); this._gnd = gnd; if (!isFinite(v.y)) v.y = gnd; v.vy = v.vy || 0;
      if (!v.air) {
        const pred = v.y + v.vy * dt - 4.9 * dt * dt;
        if (gnd < pred - 0.04 && v.speed > 6) { v.air = true; v.airT = 0; v.airX = v.x; v.airZ = v.z; v.y = pred; v.vy -= 9.81 * dt; }
        else { v.vy = clamp((gnd - v.y) / Math.max(dt, 1e-3), -25, 25); v.y = gnd; }
      } else {
        v.vy -= 9.81 * dt; v.y += v.vy * dt; v.airT += dt;
        if (v.y <= gnd || v.airT > 6) {
          const imp = Math.max(0, -v.vy); v.y = gnd; v.air = false; v.vy = 0; this._air2 = false;
          if (imp > 1.5) { AUDIO.land(Math.min(1, imp / 9)); this.camShake = Math.min(1, this.camShake + imp / 14); }
          if (v.airT > 0.35 && this.started) { const dist = Math.hypot(v.x - v.airX, v.z - v.airZ); this.jumps = (this.jumps || 0) + 1; this.bestJump = Math.max(this.bestJump || 0, dist); this.ui.toast(`JUMP! ${dist.toFixed(1)}m（${v.airT.toFixed(2)}秒）`);
            if (this.drift && (cfg.mode === 'free' || cfg.mode === 'touge')) this.drift.total = (this.drift.total || 0) + Math.round(dist * 20);
            if (cfg.diaCh) { const ch = diaRaces().find(x => x.id === cfg.diaCh); if (ch && ch.t === 'jump' && dist >= ch.goal && diaClaim(ch)) this.ui.toast(`ダイヤレース達成！ ダイヤ +${ch.reward}`); }
            if (window.DL_FB && cfg.mode !== 'online' && !lbBlocked(this.carInst, this)) window.DL_FB.lbSubmit('jump', Math.round(dist * 10) / 10).then(b => { if (b) this.ui.toast(`JUMP! ${dist.toFixed(1)}m ランキング自己ベスト更新！`); }); }
        }
      }
    }
    // 進行・ラップ
    this.progress(dt);
    // ドリフト・峠
    this.updateDrift(dt);
    // ゴースト
    if (cfg.mode === 'time' && this.started && !this.finished) {
      const lt = this.raceT - this.lapStart; if (!this.ghostRec.length || lt - this.ghostRec[this.ghostRec.length - 1][0] >= 0.1) this.ghostRec.push([+lt.toFixed(2), +v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(2), +v.heading.toFixed(3)]);
    }
    // 統計
    const kmh = v.speed * 3.6; this.maxSpeed = Math.max(this.maxSpeed, kmh);
    if (this.night > 0.9) this.nightDist += v.speed * dt;
    // 演出
    this.effects(dt);
    // サウンド
    if (this.engine) {
      const slip = clamp(Math.max(Math.abs(v.slipR) * 2.2 - 0.25, v.spinR * 0.9, v.handOn ? 0.8 : 0, (Math.abs(v.slipF) * 2 - 0.35)) * clamp(v.speed / 6, 0, 1), 0, 1);
      if (v.nitroOn && !this._nitroWas) AUDIO.nitroBurst(); this._nitroWas = v.nitroOn;
      AUDIO.updateEngine(this.engine, { gear: v.gear, nitro: v.nitroOn || !!(this.exActive && this.exActive.kind === 'thrust'), rpm: v.rpm, thr: v.throttleOut, boost: v.boost, slip, speed: v.speed, redline: this.spec.redline, limiter: v.limiter > 0, snow: this.cfg.weather === 'snow' });
      if (v.lastShift) { v.lastShift = 0; AUDIO.shiftSfx(); }
    }
    this.rivals.forEach(r => { if (r.engine) { const dx = r.x - v.x, dz = r.z - v.z; const d = Math.hypot(dx, dz); const rx = -Math.cos(v.heading), rz = Math.sin(v.heading); AUDIO.updateEngine(r.engine, { rpm: r.rpm || 3000, thr: r.thr || 0.7, boost: 0.5, slip: r.drift > 0.15 ? r.drift * 1.5 : 0, speed: r.v, redline: r.spec.redline, dist: d, panX: (dx * rx + dz * rz) / Math.max(d, 1) }); } });
    // HUD
    this.hudT -= dt;
    if (this.hudT <= 0) { this.hudT = 1 / 20; try { this.ui.updateHUD(this); } catch (e) { logErr('HUD', e); } }
    try { this.ui.drawTacho(this); } catch (e) { logErr('タコメーター', e); }
    try { this.ui.drawMinimap(this); } catch (e) { logErr('ミニマップ', e); }
  }
  resetCar() {
    const tr = this.track, v = this.veh; const p = tr.pointAt(this.loc.prog, 0);
    v.reset(p.x, p.z, p.y, p.hd); v.gear = 1; this.loc = tr.locate(p.x, p.z, this.loc.i);
    if (this.cfg.mode === 'touge') { this.damage = Math.min(100, this.damage + 20); this.breakDrift('リセット'); }
    this.msg('リセット', 'warn', 1);
  }
  collide(dt) {
    const tr = this.track, v = this.veh; this.crashCool -= dt;
    if (tr.env === 'lot') {
      const S = tr.open - 1.5; for (const [ax, lim] of [['x', S], ['z', S]]) { const p = v[ax]; if (Math.abs(p) > lim) { const nrm = Math.sign(p); v[ax] = nrm * lim; const vk = ax === 'x' ? 'vx' : 'vz'; const vn = v[vk] * nrm; if (vn > 0) { v[vk] -= 1.3 * vn * nrm; this.impact(vn, ax === 'x' ? [-nrm, 0] : [0, -nrm]); } } }
      return;
    }
    const loc = tr.locate(v.x, v.z, this.loc.i); const lim = tr.wall - 0.95;
    if (Math.abs(loc.lat) > lim) {
      const s = Math.sign(loc.lat), nx = loc.rx * s, nz = loc.rz * s; const over = Math.abs(loc.lat) - lim;
      v.x -= nx * over; v.z -= nz * over;
      const vn = v.vx * nx + v.vz * nz;
      if (vn > 0) {
        v.vx -= 1.25 * vn * nx; v.vz -= 1.25 * vn * nz;
        const tf = clamp(1 - vn * 0.03, 0.55, 0.98); v.vx *= tf; v.vz *= tf;
        // 衝突でヨー
        const fx = Math.sin(v.heading), fz = Math.cos(v.heading); const along = fx * nx + fz * nz; v.r += clamp(along * vn * 0.08, -1.5, 1.5) * -s * 0.6; v.r *= 0.7;
        this.impact(vn, [-nx, -nz]);
      }
      // 擦り火花
      const vt = Math.hypot(v.vx, v.vz);
      if (vt > 5 && Math.random() < 0.6) { const px = v.x + nx * 0.9, pz = v.z + nz * 0.9; for (let k = 0; k < 3; k++) this.sparks.spawn({ x: px, y: v.y + 0.4, z: pz, vx: v.vx * 0.6 + (Math.random() - .5) * 4, vy: 1 + Math.random() * 3, vz: v.vz * 0.6 + (Math.random() - .5) * 4, life: 0, max: 0.3 + Math.random() * 0.3, size: 0.25, grow: -0.3, r: 1, g: 0.6, b: 0.2, a: 1, grav: 1, drag: 1 }); if (Math.random() < 0.08) AUDIO.scrape(0.6); }
    }
  }
  impact(vn, n) {
    if (vn < 1.2) return;
    if (this.crashCool <= 0) { AUDIO.crash(clamp(vn / 15, 0.1, 1)); this.crashCool = 0.25; }
    this.camShake = Math.min(1, this.camShake + vn / 12);
    if (this.cfg.mode === 'touge' && this.started) {
      const d = Math.max(0, vn - 2.2) * 5.5; if (d > 0) { this.damage = Math.min(100, this.damage + d); if (vn > 4) this.breakDrift('CRASH!'); }
    }
  }
  updateNet(dt) {
    const tr = this.track, seq = this.cfg.seq; const peers = NET.peers().filter(p => !p.sameTab && p.presence && p.presence.race && p.presence.race.s === seq);
    const seen = {};
    for (const p of peers) {
      seen[p.peer] = 1; let r = this.rivals.find(x => x.net && x.peer === p.peer); const rc = CAR_BY_ID[p.presence.car] || CAR_BY_ID.ak_kiri;
      if (!r) {
        const look = Object.assign(defaultLook(rc), p.presence.lk || {}); const spec = computeSpec(rc); const model = buildCarModel(this.R, rc, look, {}); model.setLights(this.lightsOn);
        r = { net: true, peer: p.peer, def: { name: String(p.presence.nm || 'プレイヤー').slice(0, 16) }, car: rc, spec, model, prog: 0, lat: 0, v: 0, drift: 0, hd: 0, x: 0, y: 0, z: 0, wheelSpin: 0, finished: false, finishT: 0, engine: AUDIO.ok ? AUDIO.createEngine(spec, false) : null, init: false, d: 0 };
        this.rivals.push(r);
      }
      const st = p.presence.race, q = st.p; if (!q) continue;
      const age = clamp((Date.now() - p.updatedAt) / 1000, 0, 0.35);
      const tx = q[0] + Math.sin(q[3]) * q[4] * age, tz = q[2] + Math.cos(q[3]) * q[4] * age;
      if (!r.init || Math.hypot(tx - r.x, tz - r.z) > 25) { r.x = tx; r.z = tz; r.y = q[1]; r.hd = q[3]; r.init = true; }
      else { r.x = damp(r.x, tx, 12, dt); r.z = damp(r.z, tz, 12, dt); r.y = damp(r.y, q[1], 12, dt); r.hd += wrapAngle(q[3] - r.hd) * (1 - Math.exp(-12 * dt)); }
      r.v = q[4]; r.drift = q[7] > 0.17 ? Math.min(0.6, q[7]) : 0; r.thr = q[6] ? 0.2 : 0.8; r.d = st.d || 0; r.lap = st.l || 0;
      if (st.f && !r.finished) { r.finished = true; r.finishT = st.f; }
      const L = tr.locate(r.x, r.z, r.li ?? -1); r.li = L.i; r.prog = L.prog; r.wheelSpin += r.v / 0.31 * dt;
      r.rpm = clamp(1500 + r.v * 90, 1200, r.spec.redline);
    }
    for (const r of this.rivals.slice()) if (r.net && !seen[r.peer]) { if (!this.netGone[r.peer]) { this.netGone[r.peer] = 1; this.ui.toast(r.def.name + ' が退出しました'); } r.model.dispose(); if (r.engine) AUDIO.stopEngine(r.engine); this.rivals.splice(this.rivals.indexOf(r), 1); }
    NET.sendRace(this);
  }
  updateRival(r, dt) {
    const tr = this.track, v = this.veh; if (!this.started) { const p = tr.pointAt(r.prog, r.lat); Object.assign(r, { x: p.x, y: p.y, z: p.z, hd: p.hd }); r.rpm = 1500 + Math.random() * 500; return; }
    const skill = r.def.skill; const i = Math.floor(((r.prog / STEP) % tr.n + tr.n) % tr.n);
    const playerDist = this.totalDist; const gap = r.prog - playerDist;
    // ラバーバンド: 前に出すぎたら大きく減速、離されすぎたら少しだけ追い上げ
    let rubber = gap > 200 ? 0.8 : gap > 80 ? 0.88 : gap > 25 ? 0.95 : gap < -250 ? 1.04 : 1;
    rubber *= [0.88, 1, 1.12][SAVE.data.settings.aiLevel ?? 1];
    const ahead = Math.floor(clamp(r.v * 0.25, 4, 16));
    let target = tr.vmax[(i + ahead) % tr.n] * skill * 0.8 * rubber * Math.sqrt(this.env.grip);
    if (this.cfg.mode === 'drag') target = r.spec.car.top / 3.6 * (0.9 + skill * 0.1);
    if (DEV.owner && SAVE.data.settings.devGhostCar) target *= 0.5;
    target = Math.min(target, r.spec.car.top / 3.6 * 0.97);
    if (r.finished) target = Math.min(target, 12);
    const pw = r.spec.P / (r.spec.mass * Math.max(r.v, 4)); const aMax = Math.min(pw * 0.5, 5 * this.env.grip) - r.spec.dragK * r.v * r.v / r.spec.mass;
    if (r.v < target) r.v = Math.min(target, r.v + Math.max(0.5, aMax) * dt); else r.v = Math.max(target, r.v - 10 * this.env.grip * dt);
    // ライン取り
    const kA = tr.K[(i + 15) % tr.n]; let latT = this.cfg.mode === 'drag' ? -3.2 : -Math.sign(kA) * Math.min(1, Math.abs(kA) * 90) * (tr.halfW - 1.4) * 0.8;
    // プレイヤー回避
    const pdx = v.x - r.x, pdz = v.z - r.z; const along = pdx * Math.sin(r.hd) + pdz * Math.cos(r.hd);
    if (along > -3 && along < 14) { const plat = this.loc.lat; if (Math.abs(plat - r.lat) < 2.6) latT = plat > 0 ? Math.max(-tr.halfW + 1.2, plat - 3) : Math.min(tr.halfW - 1.2, plat + 3); }
    r.lat = damp(r.lat, clamp(latT, -tr.halfW + 1.1, tr.halfW - 1.1), 1.2, dt);
    r.prog += r.v * dt;
    const p = tr.pointAt(r.prog, r.lat);
    const latAcc = r.v * r.v * Math.abs(p.k); const dr = clamp((latAcc / 9.81 - 0.5) * 0.9, 0, 0.55) * (r.spec.car.drift / 90) * (r.spec.drive === '4WD' ? 0.6 : r.spec.drive === 'FF' ? 0.3 : 1);
    r.drift = damp(r.drift, dr, 3, dt);
    if (tr.ramps) p.y += tr.rampH(r.prog, r.lat);
    Object.assign(r, { x: p.x, y: p.y, z: p.z, hd: p.hd + Math.sign(p.k) * r.drift });
    const gr = r.spec.ratios; let g = 1; const wo = r.v / r.spec.wheelR; for (let k = 0; k < gr.length; k++) { const rpm = wo * gr[k] * r.spec.final * 60 / TAU; if (rpm < r.spec.redline * 0.92) { g = k + 1; break; } g = k + 1; }
    r.rpm = clamp(wo * gr[g - 1] * r.spec.final * 60 / TAU * (1 + r.drift * 0.5), 1200, r.spec.redline); r.thr = r.v < target - 0.5 ? 1 : 0.35; r.gear = g;
    // 完走
    if (!r.finished && r.prog >= tr.length * (this.cfg.laps || 1) + 4) { r.finished = true; r.finishT = this.raceT; }
    if (this.cfg.mode === 'drag' && !r.finished && r.prog - (this.startProg || 4) >= 402) { r.finished = true; r.finishT = this.raceT; r.trap = r.v * 3.6; }
    r.wheelSpin += r.v / 0.31 * dt;
  }
  collideRivals() {
    const v = this.veh;
    for (const r of this.rivals) {
      const pc = [[v.x + Math.sin(v.heading) * 1.1, v.z + Math.cos(v.heading) * 1.1], [v.x - Math.sin(v.heading) * 1.1, v.z - Math.cos(v.heading) * 1.1]];
      const rc = [[r.x + Math.sin(r.hd) * 1.1, r.z + Math.cos(r.hd) * 1.1], [r.x - Math.sin(r.hd) * 1.1, r.z - Math.cos(r.hd) * 1.1]];
      for (const a of pc) for (const b of rc) {
        const dx = a[0] - b[0], dz = a[1] - b[1], d = Math.hypot(dx, dz); const minD = 1.9;
        if (d < minD && d > 0.001) {
          const nx = dx / d, nz = dz / d, over = minD - d; v.x += nx * over * 0.8; v.z += nz * over * 0.8;
          const rvx = Math.sin(r.hd) * r.v, rvz = Math.cos(r.hd) * r.v; const relN = (v.vx - rvx) * nx + (v.vz - rvz) * nz;
          if (relN < 0) { v.vx -= relN * nx * 1.1; v.vz -= relN * nz * 1.1; r.v = Math.max(0, r.v + relN * 0.35); this.impact(-relN, [nx, nz]); }
          r.lat += clamp(-(nx * this.loc.rx + nz * this.loc.rz) * over, -0.5, 0.5);
        }
      }
    }
  }
  progress(dt) {
    const tr = this.track, L = tr.length, loc = this.loc, v = this.veh, cfg = this.cfg;
    let dp = loc.prog - this.lastProg; if (dp < -L / 2) dp += L; if (dp > L / 2) dp -= L;
    this.lastProg = loc.prog;
    if (!this.started) return;
    this.totalDist += dp; if (dp > 0 && dp < 50 && this.started && window.DL_FB && !lbBlocked(this.carInst, this)) { const w = lbWeekDist(); if (w) w.m += dp; }
    // 逆走判定
    const vt = v.vx * loc.tx + v.vz * loc.tz;
    this.wrongT = vt < -4 ? this.wrongT + dt : 0;
    if (this.wrongT > 1.5 && Math.floor(this.t * 2) % 2 === 0) this.ui.flash('逆走しています！', 'warn', 0.4);
    // セクター
    const lapDist = this.totalDist - this.lap * L;
    const sec = Math.floor(lapDist / (L / 3));
    if (sec > this.sector && sec < 3 && sec >= 1) {
      const lt = this.raceT - this.lapStart; this.curSectors[sec - 1] = lt - (this.curSectors.slice(0, sec - 1).reduce((a, b) => a + b, 0));
      this.sector = sec; if (cfg.mode === 'time') this.ui.sectorSplit(sec, this.curSectors[sec - 1], this.bestSector(sec - 1));
    }
    // ラップ
    if (lapDist >= L) {
      const lt = this.raceT - this.lapStart; this.curSectors[2] = lt - this.curSectors[0] - this.curSectors[1];
      this.laps.push({ t: lt, s: this.curSectors.slice() }); this.lap++; this.lapStart = this.raceT; this.sector = 0;
      if (cfg.mode === 'time') { this.ui.sectorSplit(3, this.curSectors[2], this.bestSector(2)); this.onLapTA(lt); }
      this.curSectors = [];
      const totalLaps = cfg.laps || 1;
      if ((cfg.mode === 'time' || cfg.mode === 'story' || cfg.mode === 'event' || cfg.mode === 'online') && this.lap >= totalLaps) this.finish('goal');
      else if (cfg.mode === 'free' || cfg.mode === 'touge') this.msg('LAP ' + (this.lap + 1), '', 1.2);
      else this.msg('FINAL LAP', '', 1.4);
    }
    // バトル: ライバルがゴールして一定時間経過
    if (cfg.mode === 'drag' && this.started && !this.finished && this.totalDist >= 402) { this.dragTrap = v.speed * 3.6; this.finish('goal'); }
    if (cfg.mapId === 'driftpark' && this.started && !this.finished) { const st = SAVE.data.stats; st.practiceSec = (st.practiceSec || 0) + dt; }
    if ((cfg.mode === 'story' || cfg.mode === 'event') && !this.finished && this.rivals[0] && this.rivals[0].finished && this.raceT > this.rivals[0].finishT + 30) this.finish('lose');
    // 峠: 停止・走行不能
    if (cfg.mode === 'touge' && !this.finished) {
      this.stuckT = v.speed < 1 ? this.stuckT + dt : 0;
      if (this.damage >= 100) this.finish('crash'); else if (this.stuckT > 6) this.finish('stuck');
    }
  }
  bestSector(k) { const rec = SAVE.data.records.ta[this.cfg.mapId]; return rec && rec.sectors ? rec.sectors[k] : null; }
  onLapTA(lt) {
    const rec = SAVE.data.records.ta[this.cfg.mapId];
    if (!rec || !rec.best || lt < rec.best) {
      this.msg('自己ベスト更新！ ' + fmtTime(lt), 'good', 2.2);
      SAVE.saveGhost(this.cfg.mapId, { car: this.carInst.id, t: lt, frames: this.ghostRec });
      this.ghostData = { car: this.carInst.id, t: lt, frames: this.ghostRec };
      if (!this.ghost) { const gc = CAR_BY_ID[this.carInst.id]; this.ghost = buildCarModel(this.R, gc, Object.assign(defaultLook(gc), { color: '#80c0ff' }), { ghost: true }); }
    }
    this.ghostRec = [];
  }
  breakDrift(reason) { const d = this.drift; if (d.on || d.pts > 0) { this.ui.driftPop(reason, 0, 'bad'); } d.on = false; d.pts = 0; d.t = 0; d.combo = 0; d.cornerPts = 0; }
  updateDrift(dt) {
    const v = this.veh, d = this.drift, tr = this.track, kmh = v.speed * 3.6;
    const ang = Math.abs(v.beta) / DEG;
    const drifting = this.started && !this.finished && kmh > 25 && ang > 10 && ang < 100 && v.vLong > 2 && !(Math.abs(this.loc.lat) > tr.halfW + 0.4 && tr.env !== 'lot');
    const wallDist = tr.env === 'lot' ? 99 : tr.wall - Math.abs(this.loc.lat) - 0.95;
    if (drifting) {
      if (!d.on) { d.on = true; d.pts = 0; d.t = 0; if (this.t - d.lastEnd > 3.5) d.combo = 0; }
      d.off = 0; d.t += dt;
      const af = clamp((ang - 10) / 35, 0.15, 1.4), sf = clamp(kmh / 60, 0.4, 2.2), prox = wallDist < 2.2 ? 1 + (2.2 - Math.max(0, wallDist)) / 2.2 : 1;
      const mult = 1 + d.combo * 0.15;
      const p = dt * 120 * af * sf * prox * mult; d.pts += p; this.drift.angle = ang; this.drift.prox = prox; this.drift.spd = sf;
      const ci = tr.cornerAt[this.loc.i]; if (ci >= 0) { if (d.corner !== ci) { this.cornerEnd(); d.corner = ci; d.cornerPts = 0; } d.cornerPts += p; }
      if (this.cfg.mode === 'touge') v.nitro = Math.min(1, v.nitro + p * 0.00003);
    } else if (d.on) {
      d.off += dt;
      if (d.off > 0.6) { // ドリフト終了 → 加算
        d.on = false; const pts = Math.round(d.pts);
        if (d.t > 0.5 && pts > 30) { d.score += pts; d.count++; d.combo++; d.maxCombo = Math.max(d.maxCombo, d.combo); d.lastEnd = this.t; const rank = pts > 3000 ? 'LEGENDARY!' : pts > 1500 ? 'EXCELLENT!' : pts > 700 ? 'GREAT!' : 'GOOD'; if (this.cfg.mode === 'touge' || this.cfg.mode === 'free') this.ui.driftPop(rank, pts, 'good'); }
        d.pts = 0;
      }
    }
    if (d.corner >= 0 && tr.cornerAt[this.loc.i] !== d.corner) this.cornerEnd();
    if (!d.on && this.t - d.lastEnd > 3.5 && d.combo > 0) { d.combo = 0; }
  }
  cornerEnd() {
    const d = this.drift; if (d.corner < 0) return; const c = this.track.corners[d.corner]; const pts = Math.round(d.cornerPts);
    if (this.cfg.mode === 'touge' && pts > 200) this.ui.cornerPop(`#${c.idx} ${c.label}`, pts);
    d.corner = -1; d.cornerPts = 0;
  }
  finish(reason) {
    if (this.finished) return; this.finished = true; this.endReason = reason;
    const cfg = this.cfg, d = this.drift; if (d.on && d.pts > 0) { d.score += Math.round(d.pts); d.count++; }
    const res = { mode: cfg.mode, mapId: cfg.mapId, car: this.carInst.id, time: this.raceT, laps: this.laps, maxSpeed: this.maxSpeed, reason, cfg, nightDist: this.nightDist };
    if (cfg.mode === 'drag') { const r = this.rivals[0]; res.win = !r || !r.finished || r.finishT > this.raceT; res.rivalTime = r && r.finished ? r.finishT : null; res.trap = this.dragTrap || 0; res.rivalTrap = r && r.trap; }
    if (cfg.mode === 'story' || cfg.mode === 'event') {
      const r = this.rivals[0]; res.win = !r || !r.finished || r.finishT > this.raceT; res.rivalTime = r && r.finished ? r.finishT : null; res.gap = r ? (r.prog - this.totalDist) : 0;
    }
    if (cfg.mode === 'online') { this.myFinish = this.raceT; NET.sendRace(this, true); res.myTime = this.raceT; }
    if (cfg.mode === 'touge') { Object.assign(res, { score: d.score, dist: this.totalDist, survive: this.raceT, drifts: d.count, maxCombo: d.maxCombo }); }
    if (reason === 'crash') this.msg('走行不能！', 'bad', 2.5); else if (reason === 'stuck') this.msg('走行不能（停止）', 'bad', 2.5); else this.msg('FINISH!', 'good', 2.5);
    AUDIO.fanfare();
    setTimeout(() => { if (this.active) this.ui.showResults(res); }, 2200);
  }
  extraFire(ex) {
    const v = this.veh;
    if (ex.kind === 'hop') { if (!v.air || (ex.air2 && !this._air2)) { if (v.air) this._air2 = true; else this._air2 = false; v.air = true; v.airT = 0; v.airX = v.x; v.airZ = v.z; v.vy = ex.vy || 7.5; AUDIO.noiseBurst(0.35, 300, 0.7, 0.4, 0, 'lowpass'); AUDIO.tone(220, 0.25, 'square', 0.12, 0, 2); } }
    else if (ex.kind === 'fireworks') { const cols = ex.fwCols || [[1, 0.3, 0.3], [0.3, 0.7, 1], [1, 0.9, 0.3], [0.4, 1, 0.5], [1, 0.4, 1]];
      for (let b = 0; b < 3; b++) setTimeout(() => { if (!this.active) return; const c = cols[(Math.random() * cols.length) | 0], cx = v.x + (Math.random() - .5) * 8, cy = v.y + (ex.low ? 2.5 : 9 + Math.random() * 5), cz = v.z + (Math.random() - .5) * 8;
        for (let k = 0; k < 60; k++) { const a = Math.random() * TAU, e = Math.acos(2 * Math.random() - 1), sp = 5 + Math.random() * 3; this.sparks.spawn({ x: cx, y: cy, z: cz, vx: Math.sin(e) * Math.cos(a) * sp, vy: Math.cos(e) * sp, vz: Math.sin(e) * Math.sin(a) * sp, life: 0, max: 1.1 + Math.random() * 0.5, size: 0.35, grow: -0.1, r: c[0], g: c[1], b: c[2], a: 1, grav: 0.4, drag: 1 }); }
        AUDIO.noiseBurst(0.5, 700, 0.6, 0.4, 0, 'lowpass'); AUDIO.noiseBurst(0.9, 4000, 0.8, 0.08, 0.05); }, b * 280); AUDIO.tone(500, 0.4, 'sine', 0.08, 0, 3); }
    else if (ex.kind === 'horn') { const seq = ex.tune === 1 ? [[523, 0], [659, 0.12], [784, 0.24], [1046, 0.36], [784, 0.6], [1046, 0.72]] : ex.tune === 2 ? [[1318, 0], [1046, 0.15], [1568, 0.3], [1318, 0.45], [2093, 0.6]] : [[659, 0], [784, 0.14], [880, 0.28], [784, 0.42], [988, 0.56], [880, 0.84]]; seq.forEach(([f, w]) => { AUDIO.tone(f, 0.13, ex.tune === 2 ? 'sine' : ex.tune === 1 ? 'sawtooth' : 'square', 0.12, w); if (ex.tune !== 2) AUDIO.tone(f / 2, 0.13, 'sawtooth', 0.06, w); }); }
  }
  // -------------------------------------------------------------
  effects(dt) {
    const v = this.veh, m = this.model, tr = this.track, wet = this.cfg.weather === 'rain', snow = this.cfg.weather === 'snow';
    const fx = Math.sin(v.heading), fz = Math.cos(v.heading), lx = Math.cos(v.heading), lz = -Math.sin(v.heading);
    const W = (x, z, y = 0.05) => [v.x + fx * z + lx * x, v.y + y, v.z + fz * z + lz * x];
    const d = m.dims, tx = d.W / 2 - 0.12;
    const rearSlip = clamp(Math.max(Math.abs(v.slipR) * 2.4 - 0.3, v.spinR, v.handOn * 0.9), 0, 1.4) * clamp(v.speed / 5, 0, 1);
    const frontSlip = clamp(Math.max(Math.abs(v.slipF) * 2.2 - 0.4, v.spinF), 0, 1.2) * clamp(v.speed / 5, 0, 1);
    const emit = (p, amt) => {
      if (amt < 0.08 || v.air) return; const cnt = amt * dt * (snow ? 70 : 55); let n = Math.floor(cnt) + (Math.random() < cnt % 1 ? 1 : 0);
      for (let k = 0; k < n; k++) this.smoke.spawn({ x: p[0] + (Math.random() - .5) * 0.4, y: p[1] + 0.15, z: p[2] + (Math.random() - .5) * 0.4, vx: v.vx * 0.12 + (Math.random() - .5) * 1.2, vy: 0.4 + Math.random() * 0.8, vz: v.vz * 0.12 + (Math.random() - .5) * 1.2, life: 0, max: snow ? 1.1 : wet ? 0.8 : 1.8 + Math.random(), size: snow ? 1.4 : 1.0, grow: snow ? 2.4 : 3.2, ...(this.smokeEx && this.smokeEx.smokeCol ? { r: this.smokeEx.smokeCol[0], g: this.smokeEx.smokeCol[1], b: this.smokeEx.smokeCol[2] } : this.smokeEx ? (() => { const h = (performance.now() / 600 + Math.random() * 0.3) % 1, q = k => 0.5 + 0.5 * Math.cos(TAU * (h + k)); return { r: q(0), g: q(0.33), b: q(0.66) }; })() : { r: snow ? 0.95 : 0.86, g: snow ? 0.96 : 0.86, b: snow ? 1 : 0.88 }), a: (snow ? 0.6 : wet ? 0.25 : 0.42) * Math.min(1, amt), drag: 1.4, fadeIn: true });
    };
    const rl = W(tx, d.zR), rr = W(-tx, d.zR), fl = W(tx, d.zF), fr = W(-tx, d.zF);
    for (const e of [this.exActive, this.exActive2]) if (e && (e.kind === 'thrust' || e.kind === 'backfire')) { const c = e.col, n = e.kind === 'thrust' ? (e.id === 'rocket' ? 14 : 8) : 4, xs = e.twin ? [-0.35, 0.35] : e.kind === 'backfire' ? [0.45, -0.45] : [0];
      for (const xo of xs) { const p = e.kind === 'thrust' ? W(xo, d.zR - 0.35, 0.68) : W(xo, d.zR - 0.15, 0.25); for (let k = 0; k < n; k++) this.sparks.spawn({ x: p[0] + (Math.random() - .5) * 0.15, y: p[1] + (Math.random() - .5) * 0.15, z: p[2], vx: v.vx * 0.5 - fx * (6 + Math.random() * 6), vy: (Math.random() - .5) * 1.5, vz: v.vz * 0.5 - fz * (6 + Math.random() * 6), life: 0, max: 0.18 + Math.random() * 0.15, size: e.kind === 'thrust' ? 0.5 : 0.3, grow: 1.5, r: c[0], g: c[1] * (0.7 + Math.random() * 0.4), b: c[2], a: 1, grav: 0, drag: 1 }); } }
    emit(rl, rearSlip); emit(rr, rearSlip); if (frontSlip > 0.2) { emit(fl, frontSlip * 0.6); emit(fr, frontSlip * 0.6); }
    if (wet && v.speed > 12) { emit(rl, 0.3); emit(rr, 0.3); }
    // スキッドマーク
    const markOn = (rearSlip > 0.35 || v.braking > 0.8 && v.speed > 8) && !snow && !v.air;
    if (markOn && this.lastMark) {
      const w = 0.11; const lxw = lx * w, lzw = lz * w;
      for (const [k, p] of [[0, rl], [1, rr]]) { const q = this.lastMark[k]; const a0 = [q[0] - lxw, q[1] - 0.03, q[2] - lzw], a1 = [q[0] + lxw, q[1] - 0.03, q[2] + lzw], b0 = [p[0] - lxw, p[1] - 0.03, p[2] - lzw], b1 = [p[0] + lxw, p[1] - 0.03, p[2] + lzw]; this.skids.add(a0, a1, b0, b1, 0.03); }
    }
    this.lastMark = markOn ? [rl, rr] : null;
    // ライバルの煙
    for (const r of this.rivals) if (r.drift > 0.15 && r.v > 8) { const rfx = Math.sin(r.hd), rfz = Math.cos(r.hd); for (const s of [-1, 1]) { const p = [r.x - rfx * 1.2 + Math.cos(r.hd) * s * 0.75, r.y + 0.05, r.z - rfz * 1.2 - Math.sin(r.hd) * s * 0.75]; const keep = { vx: v.vx, vz: v.vz }; const amt = r.drift * 1.6; const cnt = amt * dt * 40; for (let k = 0; k < Math.floor(cnt) + (Math.random() < cnt % 1 ? 1 : 0); k++) this.smoke.spawn({ x: p[0], y: p[1] + 0.15, z: p[2], vx: rfx * r.v * 0.1 + (Math.random() - .5), vy: 0.6, vz: rfz * r.v * 0.1 + (Math.random() - .5), life: 0, max: 1.8, size: 1, grow: 3, r: 0.86, g: 0.86, b: 0.88, a: 0.38, drag: 1.4, fadeIn: true }); } }
    // 天候
    const cp = this.R.cam.pos;
    if (wet || snow) {
      const target = wet ? 1000 : 800, P = this.weatherP; const need = target - P.p.length; const sp = wet ? 22 : 2.2;
      for (let k = 0; k < Math.min(need, 120); k++) P.spawn({ x: cp[0] + (Math.random() - .5) * 70 + v.vx * 1.2, y: cp[1] + Math.random() * 25 - 3, z: cp[2] + (Math.random() - .5) * 70 + v.vz * 1.2, vx: snow ? (Math.random() - .5) * 1.5 : 0, vy: -sp * (0.8 + Math.random() * 0.4), vz: snow ? (Math.random() - .5) * 1.5 : 0, life: 0, max: wet ? 1.4 : 9, size: wet ? 0.1 : 0.17, grow: 0, r: wet ? 0.7 : 1, g: wet ? 0.75 : 1, b: wet ? 0.85 : 1, a: wet ? 0.55 : 0.9 });
    }
    this.smoke.update(dt); this.sparks.update(dt, -9.8); this.weatherP.update(dt);
    this.camShake = Math.max(0, this.camShake - dt * 2.5);
  }
  // -------------------------------------------------------------
  updateCamera(dt) {
    const v = this.veh, R = this.R, m = this.model, c = R.cam, kmh = v.speed * 3.6;
    const fx = Math.sin(v.heading), fz = Math.cos(v.heading);
    const sh = this.camShake * 0.25; const shx = (Math.random() - .5) * sh, shy = (Math.random() - .5) * sh;
    const mode = this.camMode; let fov = 60 + clamp(kmh - 40, 0, 200) * 0.07 + (v.nitroOn ? 6 : 0);
    if (mode === 0 || mode === 4) {
      let dx = fx, dz = fz;
      if (mode === 4 && v.speed > 3) { const vx = v.vx / v.speed, vz = v.vz / v.speed; dx = lerp(fx, vx, 0.65); dz = lerp(fz, vz, 0.65); const l = Math.hypot(dx, dz); dx /= l; dz /= l; }
      const rate = mode === 4 ? 3.2 : 6;
      this.camDir[0] = damp(this.camDir[0], dx, rate, dt); this.camDir[1] = damp(this.camDir[1], dz, rate, dt); const l = Math.hypot(this.camDir[0], this.camDir[1]) || 1;
      const cdx = this.camDir[0] / l, cdz = this.camDir[1] / l;
      const csc = clamp(this.model.dims.L / 4.4, 1, 2), dist = (mode === 4 ? 7.2 : 5.9 + clamp(kmh / 200, 0, 1) * 0.8) * csc, hgt = (mode === 4 ? 2.7 : 2.1) * (0.5 + csc / 2);
      let cy = v.y; if (this.track.ramps) { const want = v.air && this._gnd !== undefined ? lerp(this._gnd, v.y, 0.35) : v.y; this._camY = this._camY === undefined ? want : damp(this._camY, want, v.air ? 2.5 : 8, dt); cy = this._camY; }
      const tgt = [v.x + fx * 1.5, (cy + v.y) / 2 + 1.1, v.z + fz * 1.5];
      const eye = [v.x - cdx * dist + shx, cy + hgt + shy, v.z - cdz * dist];
      const gy = this.track.env === 'lot' ? 0 : this.track.locate(eye[0], eye[2], this.loc.i).y; eye[1] = Math.max(eye[1], gy + 1.0);
      c.pos = eye; c.target = tgt; if (mode === 4) fov += 6;
    } else {
      m.node.update(null);
      const W = m.body.world; const tp = (x, y, z) => [W[0] * x + W[4] * y + W[8] * z + W[12], W[1] * x + W[5] * y + W[9] * z + W[13], W[2] * x + W[6] * y + W[10] * z + W[14]];
      const d = m.dims;
      let e, t;
      if (mode === 1) { e = tp(0, d.hood + 0.42, d.ws + 0.35); t = tp(0, d.hood + 0.2, d.ws + 25); }
      else if (mode === 2) { e = tp(-0.36, d.hood + 0.36, d.ws - 1.02); t = tp(-0.36, d.hood + 0.22, d.ws + 25); fov += 2; }
      else { e = tp(0, 0.42, d.L / 2 + 0.15); t = tp(0, 0.35, d.L / 2 + 25); fov += 6; }
      c.pos = [e[0] + shx * 0.3, e[1] + shy * 0.3, e[2]]; c.target = t;
    }
    this.fovCur = damp(this.fovCur, fov, 4, dt); c.fov = this.fovCur; c.near = mode === 2 ? 0.2 : 0.15; c.far = 2400;
  }
  render(dt) {
    if (!this.active) return; const R = this.R, v = this.veh, m = this.model, gl = R.gl;
    this.updateCamera(dt);
    // 車体
    const tr = this.track;
    const slopeAlong = tr.env === 'lot' ? 0 : this.loc.slope * (Math.sin(v.heading) * this.loc.tx + Math.cos(v.heading) * this.loc.tz);
    let pitch = -Math.atan(slopeAlong); if (tr.ramps) { const tp = -Math.atan2(v.vy || 0, Math.max(v.speed, 6)) * (v.air ? 0.8 : 1); this._pitch = (this._pitch ?? tp) + (tp - (this._pitch ?? tp)) * (1 - Math.exp(-(v.air ? 3 : 14) * dt)); pitch = this._pitch; }
    m.node.pos = [v.x, v.y, v.z]; m.node.rot = [v.heading, pitch, 0];
    m.update(dt, { wheelSpeed: v.vLong * (1 + v.spinR * 0.6), delta: v.delta, steer: v.steer, pitch: v.pitch, roll: v.roll, rpm: v.rpm, kmh: v.speed * 3.6, redline: this.spec.redline });
    m.setBrake(v.braking > 0.1 && v.speed > 0.5);
    m.node.update(null);
    const inTunnel = this.track.tunnel[this.loc.i];
    const sunS = inTunnel ? 0.15 : 1;
    for (const p of m.node.parts) p.mat.sunScale = sunS;
    // ライト
    const lights = [];
    if (this.night > 0.2 || inTunnel) {
      const cp = R.cam.pos; const cand = (inTunnel ? this.world.tunnelLights : []).concat(this.world.lamps);
      const scored = []; for (const l of cand) { const dx = l.p[0] - cp[0], dz = l.p[2] - cp[2]; const d = dx * dx + dz * dz; if (d < 160 * 160) scored.push([d, l]); }
      scored.sort((a, b) => a[0] - b[0]); for (let k = 0; k < Math.min(6, scored.length); k++) lights.push({ p: scored[k][1].p, r: 26, c: scalec(scored[k][1].c, inTunnel ? 1.1 : 1.3 * Math.max(this.night, 0.5)) });
    }
    for (const r of this.rivals) { if (lights.length >= 8) break; if (this.lightsOn) { const d = Math.hypot(r.x - v.x, r.z - v.z); if (d < 80) lights.push({ p: [r.x + Math.sin(r.hd) * 6, r.y + 1, r.z + Math.cos(r.hd) * 6], r: 14, c: [0.9, 0.85, 0.7] }); } }
    R.setLights(lights);
    const fx = Math.sin(v.heading), fz = Math.cos(v.heading), lx = Math.cos(v.heading), lz = -Math.sin(v.heading);
    if (this.lightsOn) { const hb = this.night > 0.9 ? [2.2, 2.1, 1.85] : [1.0, 0.95, 0.85], tc = (this.model && this.model.hlCol) || [1, 0.97, 0.9]; const hc = hb.map((x, i) => x * (0.35 + 0.65 * tc[i] / 0.97)); R.spot = { pos: [v.x + fx * 2.1 + lx * 0.6, v.y + 0.75, v.z + fz * 2.1 + lz * 0.6], pos2: [v.x + fx * 2.1 - lx * 0.6, v.y + 0.75, v.z + fz * 2.1 - lz * 0.6], dir: [fx * 0.99, -0.12, fz * 0.99], col: inTunnel ? scalec(hc, 0.7) : hc }; }
    else R.spot = { pos: [0, -9999, 0], pos2: [0, -9999, 0], dir: [0, 1, 0], col: [0, 0, 0] };
    R.begin();
    const I = M4.create(); const camP = R.cam.pos; const far = Math.min([650, 950, 1500][SAVE.data.settings.quality] || 950, 3.2 / this.env.fogDen);
    const W = this.world;
    R.drawMesh(W.global, W.mats.global, I, false);
    if (W.water) R.drawMesh(W.water, W.mats.water, I, false);
    for (const ch of W.chunks) {
      const ref = ch.road || ch.scene || ch.bld; if (!ref) continue;
      const dx = ref.center[0] - camP[0], dz = ref.center[2] - camP[2]; if (Math.hypot(dx, dz) - ref.radius > far) continue;
      if (ch.road) R.drawMesh(ch.road, W.mats.road, I); if (ch.scene) R.drawMesh(ch.scene, W.mats.scene, I); if (ch.bld) R.drawMesh(ch.bld, W.mats.bld, I);
    }
    // スキッド
    this.skids.flush(); if (this.skids.count) R.drawMesh(this.skids.mesh, this.skidMat, I, false);
    // 車
    if (m.glassMat) m.glassMat.alpha = this.camMode === 2 ? 0.12 : m.glassAlpha;
    if (this.camMode !== 2 && this.camMode !== 3 && this.camMode !== 1) R.drawNode(m.node);
    else { // 一人称系: 車体外装を省略して内装のみ
      if (this.camMode === 2) { for (const p of m.body.parts) R.drawMesh(p.mesh, p.mat, m.body.world); R.drawNode(m.steerWheel); if (m.cockpit) R.drawNode(m.cockpit); }
    }
    for (const r of this.rivals) {
      const rm = r.model; rm.node.pos = [r.x, r.y, r.z]; rm.node.rot = [r.hd, 0, 0]; rm.wheelSpin = r.wheelSpin;
      rm.update(dt, { wheelSpeed: 0, delta: -r.drift * 0.6, steer: 0, pitch: 0, roll: clamp(-r.v * r.v * this.track.K[Math.floor(((r.prog / STEP) % this.track.n + this.track.n) % this.track.n)] * 0.004, -0.06, 0.06) });
      rm.setBrake(r.thr < 0.5); rm.node.update(null);
      const rt = this.track.tunnel[Math.floor(((r.prog / STEP) % this.track.n + this.track.n) % this.track.n)]; for (const p of rm.node.parts) p.mat.sunScale = rt ? 0.15 : 1;
      R.drawNode(rm.node);
    }
    // ゴースト
    if (this.ghost && this.ghostData && this.started && !this.finished) {
      const f = this.ghostData.frames, lt = this.raceT - this.lapStart; let lo = 0, hi = f.length - 1;
      if (lt <= f[hi][0]) {
        while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (f[mid][0] <= lt) lo = mid; else hi = mid; }
        const a = f[lo], b = f[hi], t = clamp((lt - a[0]) / Math.max(0.001, b[0] - a[0]), 0, 1);
        this.ghost.node.pos = [lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)]; this.ghost.node.rot = [a[4] + wrapAngle(b[4] - a[4]) * t, 0, 0]; this.ghost.update(dt, {}); this.ghost.node.update(null); R.drawNode(this.ghost.node);
      }
    }
    // グロー（街灯・テール・ヘッドライト）
    this.lightsP.clear();
    const addL = (p, s, c, a) => this.lightsP.p.push({ x: p[0], y: p[1], z: p[2], vx: 0, vy: 0, vz: 0, life: 0, max: 1e9, size: s, grow: 0, r: c[0], g: c[1], b: c[2], a });
    const carGlow = (x, y, z, hd, L, braking, lights) => {
      const f2 = [Math.sin(hd), Math.cos(hd)], l2 = [Math.cos(hd), -Math.sin(hd)];
      for (const s of [-1, 1]) {
        if (lights) addL([x + f2[0] * (L / 2 + 0.1) + l2[0] * s * 0.6, y + 0.65, z + f2[1] * (L / 2 + 0.1) + l2[1] * s * 0.6], 2.6, [1, 0.95, 0.85], 0.75);
        if (lights || braking) addL([x - f2[0] * (L / 2 + 0.05) + l2[0] * s * 0.62, y + 0.75, z - f2[1] * (L / 2 + 0.05) + l2[1] * s * 0.62], braking ? 1.3 : 0.8, [1, 0.1, 0.05], braking ? 0.75 : 0.5);
      }
    };
    carGlow(v.x, v.y, v.z, v.heading, m.dims.L, v.braking > 0.1, this.lightsOn && !(this.camMode >= 1 && this.camMode <= 3));
    const under = (x, y, z, hd, md) => { if (!md.glow || !(this.night > 0.2 || this.track.tunnel[this.loc.i])) return; const f2 = [Math.sin(hd), Math.cos(hd)]; for (const o of [-1.2, 0, 1.2]) addL([x + f2[0] * o, y + 0.08, z + f2[1] * o], 3.4, md.glow, 0.55); };
    under(v.x, tr.ramps && this._gnd !== undefined ? this._gnd : v.y, v.z, v.heading, m.dims); for (const r of this.rivals) under(r.x, r.y, r.z, r.hd, r.model.dims);
    for (const r of this.rivals) carGlow(r.x, r.y, r.z, r.hd, r.model.dims.L, r.thr < 0.5, this.lightsOn);
    if (v.nitroOn) { for (const s of [-1, 1]) addL([v.x - fx * (m.dims.L / 2 + 0.3) + lx * s * 0.5, v.y + 0.25, v.z - fz * (m.dims.L / 2 + 0.3) + lz * s * 0.5], 1.4, [0.3, 0.6, 1], 0.9); }
    R.flushTransparent();
    this.lightsP.upload();
    if (this.night > 0.2 || this.track.def.tunnel) { const gp = this.world.glow; gp.add = true; R.drawPoints(gp, 1); }
    R.drawPoints(this.lightsP, 1);
    this.smoke.upload(); R.drawPoints(this.smoke, 1);
    this.sparks.upload(); R.drawPoints(this.sparks, 1);
    this.weatherP.upload(); R.drawPoints(this.weatherP, 1);
  }
}
function fmtTime(t) { if (t == null || !isFinite(t)) return '--:--.---'; const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(3); }
