// =====================================================================
// main.js — ショールーム（メニュー背景の3D車両）・メインループ・起動
// =====================================================================
class Showroom {
  constructor(R) {
    this.R = R; this.model = null; this.sig = ''; this.rot = 0.7; this.elev = 0.22; this.dist = 7.6; this.idle = 0; this.active = true; this.t = 0;
    this.env = Object.assign(makeEnv('night', 'clear'), { zenith: [0.55, 0.56, 0.6], horizon: [0.28, 0.29, 0.32], groundCol: [0.05, 0.05, 0.06], skyCol: [0.32, 0.32, 0.36], sunCol: [0.9, 0.9, 0.95], sunDir: [0.3, 0.85, 0.42], fogCol: [0.02, 0.02, 0.025], fogDen: 0.018, stars: 0, night: 1 });
    { const l = Math.hypot(...this.env.sunDir); this.env.sunDir = this.env.sunDir.map(v => v / l); }
    this.snow = new Particles(R.gl, 400, false, true); this.glow = new Particles(R.gl, 220, true, true);
    this.rebuildStudio();
    const cv = R.canvas; let drag = null, pinch = null; const pts = new Map();
    cv.addEventListener('pointerdown', e => { if (!this.active) return; pts.set(e.pointerId, [e.clientX, e.clientY]); drag = [e.clientX, e.clientY]; this.idle = 0; try { cv.setPointerCapture(e.pointerId); } catch (x) { } });
    cv.addEventListener('pointermove', e => {
      if (!this.active || !pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) this.dist = clamp(this.dist * pinch / d, 4.5, 12); pinch = d; return; }
      if (drag) { this.rot -= (e.clientX - drag[0]) * 0.008; this.elev = clamp(this.elev + (e.clientY - drag[1]) * 0.004, 0.02, 0.8); drag = [e.clientX, e.clientY]; this.idle = 0; }
    });
    const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) drag = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { if (!this.active) return; this.dist = clamp(this.dist * (1 + Math.sign(e.deltaY) * 0.08), 4.5, 12); e.preventDefault(); }, { passive: false });
  }
  rebuildStudio() {
    const R = this.R; if (this.studio) this.studio.forEach(m => m.mesh.dispose());
    const xm = typeof xmasThemeOn === 'function' && SAVE.data ? xmasThemeOn() : false; this.xmas = xm;
    const TH = (typeof BG_THEMES !== 'undefined' && BG_THEMES[SAVE.data && SAVE.data.settings.bg]) || (typeof BG_THEMES !== 'undefined' ? BG_THEMES.garage : null) || { floor: [0.07, 0.07, 0.08], wall: [0.08, 0.08, 0.09], strip: [[0.9, 0.05, 0.03]], zen: [0.55, 0.56, 0.6], hor: [0.28, 0.29, 0.32], fog: [0.02, 0.02, 0.025], fx: 'none' };
    this.theme = TH; const isGarage = !SAVE.data || !SAVE.data.settings.bg || SAVE.data.settings.bg === 'garage';
    Object.assign(this.env, { zenith: TH.zen, horizon: TH.hor, fogCol: TH.fog }); const fl = TH.floor, fl2 = fl.map(v => v * 1.08);
    const floor = new GB(), wall = new GB(), em = new GB();
    for (let k = 0; k < 48; k++) { const a0 = k / 48 * TAU, a1 = (k + 1) / 48 * TAU; floor.tri([0, 0, 0], [Math.cos(a1) * 18, 0, Math.sin(a1) * 18], [Math.cos(a0) * 18, 0, Math.sin(a0) * 18], k % 2 ? fl : fl2); }
    for (let k = 0; k < 48; k++) { const a0 = k / 48 * TAU, a1 = (k + 1) / 48 * TAU; floor.quad([Math.cos(a0) * 4.2, 0.005, Math.sin(a0) * 4.2], [Math.cos(a1) * 4.2, 0.005, Math.sin(a1) * 4.2], [Math.cos(a1) * 4.35, 0.005, Math.sin(a1) * 4.35], [Math.cos(a0) * 4.35, 0.005, Math.sin(a0) * 4.35], [0.5, 0.05, 0.04]); }
    for (let k = 0; k < 48; k++) { const a0 = k / 48 * TAU, a1 = (k + 1) / 48 * TAU, r = 18; wall.quad([Math.cos(a0) * r, 0, Math.sin(a0) * r], [Math.cos(a1) * r, 0, Math.sin(a1) * r], [Math.cos(a1) * r, 9, Math.sin(a1) * r], [Math.cos(a0) * r, 9, Math.sin(a0) * r], TH.wall); }
    em.e = 1; for (let k = 0; k < 48; k++) { const a0 = k / 48 * TAU, a1 = (k + 1) / 48 * TAU, r = 17.9; em.quad([Math.cos(a0) * r, 1.1, Math.sin(a0) * r], [Math.cos(a1) * r, 1.1, Math.sin(a1) * r], [Math.cos(a1) * r, 1.18, Math.sin(a1) * r], [Math.cos(a0) * r, 1.18, Math.sin(a0) * r], xm && isGarage ? (k % 2 ? [0.1, 0.8, 0.3] : [0.9, 0.1, 0.1]) : TH.strip[k % TH.strip.length]); }
    for (const [x, z] of [[0, 0], [-3, 0], [3, 0]]) em.box(x, 8.5, z, 1.4, 0.05, 6, [0.9, 0.9, 0.95]);
    em.e = 0;
    // 背景テーマの小物
    if (TH.prop === 'sakura' || TH.prop === 'trees') for (let k = 0; k < 9; k++) { const a = k / 9 * TAU + 0.3, r = 17 + (k % 3); const x = Math.cos(a) * r, z = Math.sin(a) * r; wall.cylY(x, 0, z, 0.25, 0.2, 2, 6, [0.3, 0.2, 0.12]); const cc = TH.prop === 'sakura' ? [1, 0.7, 0.82] : TH === BG_THEMES.autumn ? [0.85, 0.35, 0.1] : [0.08, 0.3, 0.14]; if (TH.prop === 'sakura') wall.sphere(x, 3.2, z, 1.6, cc, 5); else { wall.cylY(x, 1.6, z, 1.8, 0, 3.6, 7, cc); wall.cylY(x, 3.4, z, 1.3, 0, 2.8, 7, cc); } }
    if (TH.prop === 'neon') { em.e = 1; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, r = 16; em.box(Math.cos(a) * r, 4.5, Math.sin(a) * r, 0.25, 9, 0.25, TH.strip[k % 2]); } em.e = 0; }
    if (xm && isGarage) { // クリスマス仕様
      const tx = -7, tz = 9; wall.cylY(tx, 0, tz, 0.4, 0.35, 1.2, 8, [0.35, 0.22, 0.12]);
      for (let k = 0; k < 4; k++) wall.cylY(tx, 1 + k * 1.4, tz, 2.6 - k * 0.55, 0.2, 2.4, 10, [0.06, 0.34, 0.15]);
      em.e = 1; em.sphere(tx, 7.0, tz, 0.35, [1, 0.85, 0.2], 4); for (let k = 0; k < 18; k++) { const a = k * 2.4, h = 1.2 + (k % 6) * 0.9, r = 2.4 - h * 0.33; em.sphere(tx + Math.cos(a) * r, h, tz + Math.sin(a) * r, 0.12, [[1, .1, .1], [1, .8, .1], [.2, .6, 1]][k % 3], 3); } em.e = 0;
      for (let k = 0; k < 5; k++) wall.box(tx + 2 + k * 0.7, 0.3, tz - 1.5 + (k % 2) * 0.6, 0.55, 0.55, 0.55, [[0.8, 0.1, 0.1], [0.1, 0.5, 0.2], [0.9, 0.8, 0.2]][k % 3]);
    }
    this.studio = [{ mesh: new Mesh(R.gl, floor.a), mat: Mat({ refl: 0.28, spec: 0.6, shin: 60 }) }, { mesh: new Mesh(R.gl, wall.a), mat: Mat({ spec: 0.05 }) }, { mesh: new Mesh(R.gl, em.a), mat: Mat({ emis: 1.2 }) }];
    this.glow.clear(); if (xm && isGarage) { const cols = [[1, .1, .1], [.1, 1, .3], [1, .85, .2], [.3, .6, 1]]; for (let k = 0; k < 120; k++) { const a = k / 120 * TAU; this.glow.p.push({ x: Math.cos(a) * 17.5, y: 3.2 + Math.sin(k * 0.9) * 0.4, z: Math.sin(a) * 17.5, vx: 0, vy: 0, vz: 0, life: 0, max: 1e9, size: 0.9, grow: 0, r: cols[k % 4][0], g: cols[k % 4][1], b: cols[k % 4][2], a: 1 }); } }
  }
  setCar(inst, force) {
    const car = CAR_BY_ID[inst.id]; if (!car) return; const t = inst.tune || defaultTune(car), lk = inst.look || defaultLook(car);
    const sig = JSON.stringify([inst.id, lk, t.height, t.wheelIn, t.tireW, t.camber]); if (sig === this.sig && !force && this.model) return; if (sig === this.sig && this.model) return;
    try { const m = buildCarModel(this.R, car, lk, { height: t.height, wheelIn: t.wheelIn, tireW: t.tireW, camber: t.camber, track: t.track }); if (this.model) this.model.dispose(); this.model = m; this.sig = sig; this.model.setLights(!car.popup); } catch (e) { console.error(e); }
  }
  stageShift() {
    const W = innerWidth, H = innerHeight; let cx = 0.5, cy = 0.5;
    if (UI.screen === 'menu') { if (W > H) { cx = 0.66; cy = 0.52; } else { cx = 0.5; cy = 0.26; } }
    else { const st = document.getElementById('stage'); if (st && st.offsetParent) { const r = st.getBoundingClientRect(); if (r.width > 20) { cx = (r.left + r.width / 2) / W; cy = (r.top + r.height / 2) / H; } } }
    return [cx * 2 - 1, -(cy * 2 - 1)];
  }
  update(dt) {
    this.t += dt; this.idle += dt; if (this.idle > 2.5) this.rot += dt * 0.25;
    const fx = this.theme && this.theme.fx; const R2 = () => (Math.random() - .5);
    if (fx && fx !== 'none' && !(this.xmas && fx === 'snow')) {
      const P = this.snow, n = fx === 'star' ? 1 : 2;
      for (let k = 0; k < n; k++) {
        if (fx === 'petal' || fx === 'leaf') P.spawn({ x: R2() * 30, y: 9, z: R2() * 30, vx: R2() * 1.2, vy: -0.7 - Math.random() * 0.4, vz: R2() * 1.2, life: 0, max: 12, size: 0.16, grow: 0, r: fx === 'petal' ? 1 : 1, g: fx === 'petal' ? 0.7 : 0.45, b: fx === 'petal' ? 0.85 : 0.1, a: 0.95 });
        else if (fx === 'snow') P.spawn({ x: R2() * 30, y: 9, z: R2() * 30, vx: R2() * 0.5, vy: -0.9, vz: R2() * 0.5, life: 0, max: 10, size: 0.12, grow: 0, r: 1, g: 1, b: 1, a: 0.85 });
        else if (fx === 'star') P.spawn({ x: R2() * 34, y: 2 + Math.random() * 7, z: R2() * 34, vx: 0, vy: 0, vz: 0, life: 0, max: 3 + Math.random() * 3, size: 0.1, grow: 0, r: 0.8, g: 0.9, b: 1, a: 1, fadeIn: true });
        else if (fx === 'firefly') P.spawn({ x: R2() * 26, y: 0.5 + Math.random() * 3, z: R2() * 26, vx: R2() * 0.6, vy: R2() * 0.3, vz: R2() * 0.6, life: 0, max: 4, size: 0.12, grow: 0, r: 0.8, g: 1, b: 0.3, a: 1, fadeIn: true });
        else if (fx === 'ember') P.spawn({ x: R2() * 26, y: 0, z: R2() * 26, vx: R2() * 0.5, vy: 1 + Math.random(), vz: R2() * 0.5, life: 0, max: 6, size: 0.11, grow: 0, r: 1, g: 0.45, b: 0.1, a: 1 });
        else if (fx === 'bubble') P.spawn({ x: R2() * 26, y: 0, z: R2() * 26, vx: R2() * 0.3, vy: 0.8 + Math.random() * 0.5, vz: R2() * 0.3, life: 0, max: 9, size: 0.18, grow: 0.02, r: 0.5, g: 0.9, b: 1, a: 0.5 });
        else if (fx === 'confetti') { const cs = [[1, 0.8, 0.2], [1, 1, 1], [1, 0.6, 0.1]][k % 3]; P.spawn({ x: R2() * 30, y: 9, z: R2() * 30, vx: R2() * 1.5, vy: -1.2, vz: R2() * 1.5, life: 0, max: 8, size: 0.13, grow: 0, r: cs[0], g: cs[1], b: cs[2], a: 1 }); }
      }
      P.update(dt);
    }
    if (this.xmas) { for (let k = 0; k < 3; k++) this.snow.spawn({ x: (Math.random() - .5) * 30, y: 9, z: (Math.random() - .5) * 30, vx: (Math.random() - .5) * 0.5, vy: -0.9 - Math.random() * 0.5, vz: (Math.random() - .5) * 0.5, life: 0, max: 10, size: 0.12, grow: 0, r: 1, g: 1, b: 1, a: 0.85 }); this.snow.update(dt); }
  }
  render(dt) {
    const R = this.R; R.env = this.env; const c = R.cam; const hide = UI.screen === 'maps';
    const [sx, sy] = this.stageShift(); c.shiftX = sx * 0.95; c.shiftY = sy * 0.95;
    const asp = innerWidth / Math.max(1, innerHeight);
    const msc = this.model && this.model.dims ? clamp(this.model.dims.L / 4.5, 1, 1.9) : 1; const d = this.dist * msc * (asp < 1 ? clamp(0.95 / asp, 1, 2.3) : 1);
    c.pos = [Math.sin(this.rot) * Math.cos(this.elev) * d, 0.6 + Math.sin(this.elev) * d, Math.cos(this.rot) * Math.cos(this.elev) * d]; c.target = [0, 0.55 * msc, 0]; c.fov = 40; c.near = 0.1; c.far = 120;
    R.setLights([{ p: [4, 4, 4], r: 14, c: [0.9, 0.9, 1] }, { p: [-4, 4, -3], r: 14, c: [0.8, 0.85, 1] }, { p: [0, 3, -6], r: 12, c: [1, 0.3, 0.25] }, { p: [0, 5, 6], r: 12, c: [0.6, 0.6, 0.65] }]);
    R.spot = { pos: [0, 8, 0.01], pos2: [0, -999, 0], dir: [0, -1, 0], col: [1.1, 1.1, 1.15] };
    R.begin(); const I = M4.create();
    for (const s of this.studio) R.drawMesh(s.mesh, s.mat, I, false);
    if (this.model && !hide) { const m = this.model; m.node.pos = [0, 0, 0]; m.node.rot = [0, 0, 0]; m.update(dt, { wheelSpeed: 0, delta: 0.25 * Math.sin(this.t * 0.3), steer: 0 }); m.node.update(null); for (const p of m.node.parts) p.mat.sunScale = 1; R.drawNode(m.node); }
    R.flushTransparent();
    if (this.xmas) { this.glow.upload(); R.drawPoints(this.glow, 1); }
    if (this.xmas || (this.theme && this.theme.fx !== 'none')) { this.snow.add = this.theme && ['ember', 'firefly', 'star', 'confetti'].includes(this.theme.fx); this.snow.upload(); R.drawPoints(this.snow, 1); }
    c.shiftX = 0; c.shiftY = 0;
  }
}

// ---------------------------------------------------------------------
(function boot() {
  const fatal = msg => { const f = document.getElementById('fatal'); f.classList.remove('hidden'); f.innerHTML = msg; };
  let R;
  try { SAVE.load(); } catch (e) { SAVE.data = SAVE.defaults(); }
  try { I18N.init(); } catch (e) { console.warn('i18n', e); }
  try { LOADER.show('STARTING'); } catch (e) { }
  try { R = new Renderer(document.getElementById('gl')); }
  catch (e) { fatal('この端末/ブラウザでは3D表示（WebGL）が利用できません。<br>最新の Chrome / Safari / Edge でお試しください。<br><small>' + esc(e.message) + '</small>'); return; }
  Input.init();
  const game = new Game(R, UI); const show = new Showroom(R);
  UI.init(R, game, show);
  try { LOADER.hide(1600); } catch (e) { }
  // 自動セーブ: 定期・画面切替/終了時
  setInterval(() => SAVE.save(), 30000);
  const flushAll = () => { SAVE.save(); CLOUD.flush(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) flushAll(); });
  window.addEventListener('pagehide', flushAll);
  setTimeout(() => { CLOUD.init(); DEV.init(); }, 50);
  if (window.DL_FB) { window.DL_FB.onStats(() => UI.refreshMenuStats()); setTimeout(() => window.DL_FB.startStats(), 800); }
  // プレイ時間（画面が表示されている間だけ数える）
  setInterval(() => { if (!document.hidden && SAVE.data && SAVE.data.stats) { SAVE.data.stats.playSec = (SAVE.data.stats.playSec || 0) + 10; if (UI.screen === 'menu') UI.refreshMenuStats(); } }, 10000);
  if (window.DL_FB) { window.DL_FB.loadProfile().then(() => { UI.lbSync(); setTimeout(() => UI.lbClaimRewards(), 2500); }); window.DL_FB.onUser(() => window.DL_FB.loadProfile().then(() => { UI.lbSync(); if (UI.screen === 'account') UI.render(); setTimeout(() => UI.lbClaimRewards(), 1500); })); }
  if (window.DL_FB) window.DL_FB.onUser((u, changed) => { if (u && changed) { CLOUD.doc = null; CLOUD.init(!u.isAnonymous); } DEV.owner = false; DEV.init(); if (UI.screen === 'settings') UI.render(); });
  UI.saveStatus();
  window.addEventListener('error', e => { console.error(e.error || e.message); });
  window.addEventListener('unhandledrejection', e => { console.error(e.reason); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (game.active && !game.paused && !UI.paused) UI.pause(); try { AUDIO.ctx && AUDIO.ctx.suspend(); } catch (e) { } } else { try { AUDIO.ctx && AUDIO.ctx.resume(); } catch (e) { } } });
  R.gl.canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); fatal('グラフィックスがリセットされました。ページを再読み込みしてください。'); });
  let last = performance.now(), errs = 0, fpsAcc = 0, fpsN = 0, slowT = 0; let pr = 1;
  const basePR = () => { const q = SAVE.data.settings.quality, d = devicePixelRatio || 1; return q === 2 ? Math.min(d, 2) : q === 1 ? Math.min(d, 1.5) : Math.min(d, 1); };
  pr = basePR(); let lastQ = SAVE.data.settings.quality;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    fpsAcc += dt; fpsN++; if (fpsAcc > 0.5) { UI.fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0;
      if (SAVE.data.settings.quality !== lastQ) { lastQ = SAVE.data.settings.quality; pr = basePR(); }
      if (game.active && !game.paused) { if (UI.fps < 40) slowT += 0.5; else slowT = Math.max(0, slowT - 0.5); if (slowT > 3 && pr > 0.75) { pr = Math.max(0.75, pr - 0.15); slowT = 0; } } }
    try {
      R.resize(pr);
      if (game.active) { game.update(dt); game.render(dt); }
      else { show.update(dt); show.render(dt); }
      errs = Math.max(0, errs - dt * 0.2);
    } catch (e) {
      errs++; logErr(game.active ? 'レース中' : 'メニュー', e);
      if (errs > 40 && game.active && !UI.paused) { errs = 0; try { UI.pause(); } catch (x) { } UI.showErr('レース中にエラーが続いています（ポーズしました）', e); }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__DL = { game, show, UI, SAVE, R, Input, wrapAngle, clamp, AUDIO, LOADER, AERO, CARS, CAR_BY_ID, ITEMS, MAPS, MAP_BY_ID, getTrack, Track, STEP };
})();
