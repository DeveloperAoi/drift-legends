// =====================================================================
// physics.js — 車両物理（リアルタイム計算）
//  ・二輪モデル + 前後荷重移動 + 摩擦円 + Pacejka風タイヤカーブ
//  ・FR / FF / 4WD / MR / RR の駆動配分、LSD、サイドブレーキ、ターボラグ
//  座標: 前方 fwd=(sinθ,cosθ)  右 right=(-cosθ,sinθ)  ヨーレート r>0 で右旋回
// =====================================================================
const GRAV = 9.81;
function defaultTune(car) {
  return {
    engine: 'stock', ecu: 0, intercooler: 0, intake: 0, muffler: 0, reinforce: 0, susp: 0, brake: 0, diff: 'open', trans: 0, final: 1.0,
    tire: 'street', tireW: 0, track: 0, wheelIn: 17, height: 0, camber: -1.0, toeF: 0, toeR: 0.1,
    cam: 0, piston: 0, fuel: 0, flywheel: 0, clutch: 0, nos: 0, stab: 0, strut: 0, knuckle: 0, weight: 0,
    owned: { engine: ['stock'], diff: ['open'], tire: ['street'], ecu: 0, intercooler: 0, intake: 0, muffler: 0, reinforce: 0, susp: 0, brake: 0, trans: 0, cam: 0, piston: 0, fuel: 0, flywheel: 0, clutch: 0, nos: 0, stab: 0, strut: 0, knuckle: 0, weight: 0 }
  };
}
function defaultLook(car) {
  return {
    color: car.color, paint: 'metallic', color2: '#111114', wheel: car.stockWheel || 'stock', wheelColor: '#c8c8cc', tint: 0.35,
    front: 0, rear: 0, side: 0, wing: car.body === 'rally' ? 2 : 0, hood: 0, exhaust: 0, fender: 0, mirror: 0, roof: 0, head: 0, tail: 0, acc: 'none', glow: 'none', caliper: '#cc1010', livery: 'none', number: 86, decals: [], plate: '峠 ' + String(Math.floor(10 + (car.id.length * 7) % 89)) + '-' + String(1000 + car.hp * 3).slice(-4),
    owned: { paint: ['metallic', 'gloss'], wheel: ['stock'].concat(car.stockWheel ? [car.stockWheel] : []), front: [0], rear: [0], side: [0], wing: [0, car.body === 'rally' ? 2 : 0], hood: [0], exhaust: [0], fender: [0], mirror: [0], roof: [0], head: [0], tail: [0], glow: ['none'], livery: ['none'], decals: [] }
  };
}
function tireOpt(id) { return PARTS.tire.opts.find(o => o.id === id) || PARTS.tire.opts[0]; }

// 配列から安全に値を取り出す（範囲外は最後の値、不正値は0番目）
function pick(arr, i) { i = Math.round(+i || 0); return arr[clamp(i, 0, arr.length - 1)]; }
function computeSpec(car, tune) {
  // 欠けた/不正な値は既定値で補う（古いセーブや途中のデータでもNaNにならないように）
  { const dflt = defaultTune(car), src = tune || {}; const m = Object.assign({}, dflt, src);
    for (const k in dflt) { if (typeof dflt[k] === 'number') { const v = +m[k]; m[k] = isFinite(v) ? v : dflt[k]; } else if (typeof dflt[k] === 'string' && typeof m[k] !== 'string') m[k] = dflt[k]; }
    m._look = src._look || {}; m.special = typeof src.special === 'string' ? src.special : ''; tune = m; }
  const forcedBase = car.turbo; const e = tune.engine;
  let pm = 1, lag = car.turbo ? 0.45 : 0, forced = forcedBase, sound = car.sound, hpBase = car.hp;
  if (e === 'turbo') { pm *= forcedBase ? 1.15 : 1.32; lag = forcedBase ? 0.5 : 0.55; forced = true; }
  else if (e === 'bigturbo') { pm *= forcedBase ? 1.4 : 1.58; lag = 0.95; forced = true; }
  else if (e === 'super') { pm *= forcedBase ? 1.12 : 1.36; lag = 0.05; forced = true; }
  else if (e === 'super2') { pm *= forcedBase ? 1.24 : 1.5; lag = 0.08; forced = true; }
  else if (e === 'twin') { pm *= forcedBase ? 1.42 : 1.64; lag = 0.3; forced = true; }
  else if (e === 'swap') { hpBase = Math.max(car.hp * 1.25, 460); lag = 0; sound = 'v8'; }
  pm *= 1 + tune.ecu * (forced ? 0.05 : 0.03);
  if (forced) pm *= 1 + tune.intercooler * 0.035;
  pm *= 1 + tune.intake * 0.03; pm *= 1 + tune.muffler * 0.025; pm *= 1 + tune.reinforce * 0.02;
  pm *= 1 + (tune.cam || 0) * 0.035 + (tune.fuel || 0) * 0.02 + (tune.flywheel || 0) * 0.01 + (tune.piston || 0) * (forced ? 0.06 : 0.025);
  const hp = hpBase * pm;
  const redline = car.redline + tune.reinforce * 250 + (e === 'swap' ? -car.redline + 7200 : 0);
  const look = tune._look || {};
  const mass = (car.kg * (1 - [0, 0.03, 0.06, 0.09][tune.weight || 0])) + 75 + (e === 'swap' ? 60 : 0) - ((look.hood || 0) > 0 ? 12 : 0) + ((look.wing || 0) >= 2 ? 6 : 0) - (tune.susp === 3 ? 8 : 0) + (look.fender === 2 ? 15 : 0);
  const P = hp * 745.7 * 0.92;
  const omegaRed = redline * TAU / 60;
  const Tpeak = P / (0.9286 * omegaRed);
  const n = car.gears; const r1 = 3.55, rtop = n >= 8 ? 0.66 : n === 7 ? 0.72 : n === 6 ? 0.8 : 0.86;
  const ratios = []; for (let i = 0; i < n; i++) ratios.push(r1 * Math.pow(rtop / r1, i / (n - 1)));
  const wheelR = 0.31;
  const vTopStock = car.top / 3.6;
  let final = omegaRed * wheelR / (vTopStock * 1.05 * rtop);
  if (tune.trans) final *= tune.final;
  const Pstock = car.hp * 745.7 * 0.92;
  const dragK = Pstock * 0.74 / Math.pow(vTopStock, 3) * (1 + (look.wing || 0) * 0.025);
  const tire = tireOpt(tune.tire);
  const wfac = 1 + tune.tireW * 0.025;
  const cam = Math.abs(tune.camber);
  const latCam = 1 + 0.022 * Math.min(cam, 2.5) - 0.035 * Math.max(0, cam - 2.5);
  const lonCam = 1 - 0.012 * cam;
  const susp = tune.susp;
  let mu = tire.mu * wfac * (1 + pick([0, 1, 2, 2.6, 2, 2.9, 0, 1.4], look.fender || 0) * 0.018) * (1 + (tune.track || 0) * 0.004);
  const fb = car.fb, wb = car.wb; const a = wb * (1 - fb), b = wb * fb; // a: CG→前軸, b: CG→後軸
  const cgH = 0.5 - (-tune.height) * 0.0012 - susp * 0.01;
  const diffLsd = { open: car.drift >= 84 ? 0.45 : 0.22, '1way': 0.62, '15way': 0.76, '2way': 0.9 }[tune.diff] ?? 0.3;
  const slide = clamp(tire.slide + (car.drift - 70) / 100 * 0.08, 0.6, 0.92);
  const C = 2 - 2 * Math.asin(slide) / PI;
  const B = Math.tan(PI / (2 * C)) / 0.12;
  const muF = mu * latCam * (0.92 + car.handling / 100 * 0.12) * (1 - tune.toeF * 0.04) * (1 + (tune.strut || 0) * 0.015);
  const muR = mu * latCam * (1.02 - car.drift / 100 * 0.06) * (1 + tune.toeR * 0.15);
  const spec = {
    car, hp, torqueDisp: car.torque * pm * (e === 'swap' ? hpBase / car.hp : 1), mass, a, b, wb, cgH, I: mass * a * b * 1.05,
    P, Tpeak, redline, idle: 900, ratios, final, wheelR, drive: car.drive, dragK, roll: 12 + mass * 0.012,
    muF, muR, lon: mu * lonCam, B, C, slide, tire,
    brakeMax: mass * GRAV * 1.25 * (car.brake / 70) * (1 + tune.brake * 0.12),
    lsd: diffLsd, lsd2way: tune.diff === '2way', turbo: forced && e !== 'swap', turboLag: lag, super: e === 'super' || e === 'super2' || e === 'twin',
    steerMax: 0.6 * (0.92 + car.handling / 100 * 0.14) * (1 - tune.toeF * 0.05) * (tune.knuckle ? 1.22 : 1), counterMax: tune.knuckle ? 0.9 : 0.7, transfer: 5 + susp * 2.5 + (tune.stab || 0) * 1.2, rollK: 1 / (1 + susp * 0.35 + (tune.stab || 0) * 0.25),
    shiftTime: 0.16 - (tune.clutch || 0) * 0.035, nosPow: 1.35 + (tune.nos || 0) * 0.1, nosCap: 1 + (tune.nos || 0) * 0.6,
    downF: pick([0, 0.08, 0.14, 0.2, 0.26, 0.05, 0.16, 0.24, 0.32, 0.06, 0.04, 0.1, 0.2, 0, 0.04], look.front) + ((look.side || 0) ? 0.03 : 0), downR: pick([0, 0.15, 0.42, 0.68, 0.85, 0.95, 1.02, 0.3, 0.2, 0.95, 0.8, 0.6, 0.25, 0.7, 1.1, 0.12, 0.5, 1.0, 0.9], look.wing) + pick([0, 0.04, 0.08], look.rear),
    sound, muffler: tune.muffler, rotary: sound === 'rotary', yawDamp: 0.1 + (tune.toeR > 0 ? tune.toeR * 0.4 : tune.toeR * 0.6)
  };
  // カードパック限定チューニングパーツの効果
  const SP = typeof ITEM_BY_ID !== 'undefined' && tune.special ? ITEM_BY_ID[tune.special] : null;
  if (SP && SP.fx) { const f = SP.fx;
    if (f.hp) { spec.hp *= f.hp; spec.P *= f.hp; spec.Tpeak *= f.hp; spec.torqueDisp *= f.hp; }
    if (f.mass) { spec.mass = Math.max(500, spec.mass + f.mass); spec.I = spec.mass * spec.a * spec.b * 1.05; }
    if (f.grip) { spec.muF *= f.grip; spec.muR *= f.grip; spec.lon *= f.grip; }
    if (f.lsd) spec.lsd = Math.min(0.98, spec.lsd + f.lsd);
    if (f.steer) spec.steerMax *= f.steer;
    if (f.lag) spec.turboLag *= f.lag;
    if (f.nitro) spec.nosCap = (spec.nosCap || 1) * f.nitro;
    if (f.slide) { spec.slide = Math.min(0.94, spec.slide + f.slide); spec.C = 2 - 2 * Math.asin(spec.slide) / PI; spec.B = Math.tan(PI / (2 * spec.C)) / 0.12; }
  }
  for (const k in spec) if (typeof spec[k] === 'number' && !isFinite(spec[k])) { spec[k] = { downF: 0, downR: 0, yawDamp: 0.1 }[k] ?? 1; }
  spec.stats = statsFor(spec);
  return spec;
}

// 表示用ステータス（0-100は実際に物理シミュレーションで計測）
const _statCache = new Map();
function statsFor(spec) {
  const key = [spec.car.id, spec.hp.toFixed(1), spec.mass.toFixed(1), spec.final.toFixed(3), spec.muR.toFixed(3), spec.muF.toFixed(3), spec.steerMax.toFixed(3), spec.drive].join('|');
  if (_statCache.has(key)) return _statCache.get(key);
  const v = new Vehicle(spec); v.reset(0, 0, 0, 0); let t = 0, t100 = 99, vmax = 0;
  const inp = { throttle: 1, brake: 0, steer: 0, hand: 0, nitro: 0 };
  for (let k = 0; k < 60 * 70; k++) { v.step(1 / 60, inp, { grip: 1, slope: 0, offroad: 0, assist: 0 }); t += 1 / 60; const kmh = v.speed * 3.6; if (kmh >= 100 && t100 === 99) t100 = t; vmax = Math.max(vmax, kmh); }
  const top = Math.min(vmax, spec.car.top * 1.25);
  const s = {
    top: Math.round(top), accel: t100, power: Math.round(spec.hp), torque: Math.round(spec.torqueDisp), weight: Math.round(spec.mass - 75),
    handling: Math.round(clamp(spec.car.handling + (spec.muF - 1) * 120 + spec.steerMax * 10 - 6, 0, 100)),
    driftScore: Math.round(clamp(spec.car.drift + (spec.slide - 0.72) * 120 + (spec.lsd - 0.4) * 20 + (spec.drive === 'FR' ? 4 : spec.drive === '4WD' ? -6 : 0), 0, 100)),
    brake: Math.round(clamp(spec.car.brake * (spec.brakeMax / (spec.mass * GRAV * 1.25 * spec.car.brake / 70)) * (0.8 + spec.lon * 0.2), 0, 100)),
    drive: spec.drive, gears: spec.ratios.length
  };
  _statCache.set(key, s); return s;
}

function tireCurve(alpha, B, C) { const s = alpha < 0 ? -1 : 1; return s * Math.sin(C * Math.atan(B * Math.abs(alpha))); }

class Vehicle {
  constructor(spec) { this.spec = spec; this.auto = true; this.reset(0, 0, 0, 0); }
  reset(x, z, y, heading) { this.air = false; this.vy = 0;
    Object.assign(this, { x, z, y, heading, vx: 0, vz: 0, r: 0, steer: 0, delta: 0, gear: 1, rpm: 900, shiftT: 0, boost: 0, spinR: 0, spinF: 0, ax: 0, ay: 0, axF: 0, nitro: 1, nitroOn: false, limiter: 0, speed: 0, vLong: 0, vLat: 0, slipR: 0, slipF: 0, beta: 0, revT: 0, pitch: 0, roll: 0, lastShift: 0, blowoff: 0, throttleOut: 0, braking: 0, handOn: 0 });
  }
  setSpec(spec) { this.spec = spec; }
  engineTorque(rpm, thr) {
    const S = this.spec, nn = clamp(rpm / S.redline, 0.08, 1.05);
    let f = (0.55 + 0.9 * nn - 0.65 * nn * nn) / 0.8615;
    if (S.rotary) f = 0.75 + 0.35 * nn - 0.1 * nn * nn;
    let T = S.Tpeak * f;
    if (S.turbo && !S.super) T *= 0.62 + 0.38 * this.boost; else if (S.super) T *= 0.85 + 0.15 * nn;
    if (this.nitroOn) T *= this.spec.nosPow || 1.35;
    if (thr < 0.02) return -S.Tpeak * 0.16 * (rpm / S.redline);
    return T * thr;
  }
  shift(d) {
    const n = this.spec.ratios.length;
    if (this.shiftT > 0) return false;
    const g = clamp(this.gear + d, -1, n); if (g === this.gear) return false;
    this.gear = g; this.shiftT = this.spec.shiftTime || 0.16; this.lastShift = d; return true;
  }
  step(dt, inp, surf) {
    const S = this.spec, m = S.mass;
    const fwdX = Math.sin(this.heading), fwdZ = Math.cos(this.heading), rgtX = -fwdZ, rgtZ = fwdX;
    let vx = this.vx * fwdX + this.vz * fwdZ, vy = this.vx * rgtX + this.vz * rgtZ;
    const spd = Math.hypot(vx, vy);
    // --- 入力（ステア角は押している時間で増加） ---
    const steerRate = (inp.steerRate || 2.6);
    const target = clamp(inp.steer, -1, 1);
    const rate = (Math.sign(target) !== Math.sign(this.steer) && Math.abs(this.steer) > 0.02) || Math.abs(target) < 0.01 ? steerRate * 2.2 : steerRate;
    this.steer += clamp(target - this.steer, -rate * dt, rate * dt);
    if (inp.analog) this.steer = target;
    const vxe = Math.max(Math.abs(vx), 2.5);
    const maxSteer = S.steerMax / (1 + Math.max(0, spd - 8) / 32) + 0.06;
    let delta = this.steer * maxSteer;
    const beta = Math.atan2(vy, vxe); this.beta = beta;
    const assist = surf.assist || 0;
    if (assist > 0 && spd > 6 && vx > 0) {
      const k = assist * clamp((Math.abs(beta) - 0.04) / 0.18, 0, 1);
      const counter = clamp(beta + this.steer * 0.38, -(S.counterMax || 0.7), S.counterMax || 0.7);
      delta = lerp(delta, counter, k);
    }
    this.delta = delta;
    // --- ギア・エンジン ---
    let thr = clamp(inp.throttle, 0, 1), brk = clamp(inp.brake, 0, 1);
    if (this.gear === -1) { const t = thr; thr = brk; brk = t; }
    if (this.auto) {
      if (this.gear > 0 && brk > 0.3 && spd < 0.8 && thr < 0.05) { this.revT += dt; if (this.revT > 0.35) { this.gear = -1; this.revT = 0; } }
      else if (this.gear === -1 && inp.throttle > 0.3 && Math.abs(vx) < 1) { this.gear = 1; }
      else this.revT = 0;
    }
    this.shiftT = Math.max(0, this.shiftT - dt);
    const nG = S.ratios.length;
    const gearRatio = this.gear > 0 ? S.ratios[this.gear - 1] : this.gear === -1 ? -3.3 : 0;
    const driveR = S.drive === 'FF' ? 0 : S.drive === '4WD' ? 0.62 : 1; // 後輪配分
    const spin = driveR > 0.5 ? this.spinR : this.spinF;
    let wheelOmega = Math.abs(vx) / S.wheelR * (1 + spin);
    let rpm;
    if (this.gear === 0) { rpm = damp(this.rpm, S.idle + thr * (S.redline - S.idle), thr > 0.05 ? 7 : 3, dt); }
    else {
      rpm = wheelOmega * Math.abs(gearRatio) * S.final * 60 / TAU;
      const launch = S.idle + thr * (S.redline * 0.42 - S.idle);
      if (rpm < launch) rpm = lerp(rpm, launch, clamp(1 - Math.abs(vx) / 8, 0, 1));
      rpm = Math.max(rpm, S.idle * (0.9 + thr * 0.2));
      if (this.shiftT > 0) rpm = damp(this.rpm, rpm, 18, dt);
    }
    this.limiter = Math.max(0, this.limiter - dt);
    if (rpm >= S.redline) { this.limiter = 0.07; rpm = S.redline + 60; }
    this.rpm = rpm;
    // ターボ
    if (S.turbo || S.super) {
      const tgt = thr > 0.1 ? clamp((rpm - 2200) / 2400, 0, 1) * thr : 0;
      const prev = this.boost;
      this.boost = damp(this.boost, tgt, tgt > this.boost ? (S.super ? 30 : 1 / Math.max(0.08, S.turboLag)) : 6, dt);
      if (prev > 0.55 && thr < 0.1 && !S.super) this.blowoff = 1;
    }
    // ニトロ
    this.nitroOn = !!inp.nitro && this.nitro > 0.01 && thr > 0.3 && this.gear > 0;
    if (this.nitroOn) this.nitro = Math.max(0, this.nitro - dt * 0.22 / (S.nosCap || 1)); else this.nitro = Math.min(1, this.nitro + dt * 0.025);
    let Tq = (this.shiftT > 0 || this.gear === 0 || this.limiter > 0) ? (this.limiter > 0 && this.gear !== 0 ? 0 : 0) : this.engineTorque(rpm, thr);
    if (this.gear === 0 || this.shiftT > 0) Tq = 0;
    const driveF = Tq * gearRatio * S.final * 0.86 / S.wheelR;
    this.throttleOut = thr;
    // --- 荷重 ---
    const L = S.wb, h = S.cgH;
    this.axF = damp(this.axF, this.ax, S.transfer, dt);
    const down = 0.6 * spd * spd; // 1/2ρA 近似
    let Wf = m * GRAV * S.b / L - m * this.axF * h / L + down * S.downF;
    let Wr = m * GRAV * S.a / L + m * this.axF * h / L + down * S.downR;
    Wf = Math.max(Wf, m * GRAV * 0.12); Wr = Math.max(Wr, m * GRAV * 0.12);
    const Wf0 = m * GRAV * S.b / L, Wr0 = m * GRAV * S.a / L;
    const g = surf.grip * (surf.offroad ? surf.offGrip || 0.7 : 1);
    const muF = S.muF * g * (1 - 0.1 * (Wf / Wf0 - 1)), muR = S.muR * g * (1 - 0.1 * (Wr / Wr0 - 1));
    const FmaxF = muF * Wf, FmaxR = muR * Wr;
    // --- スリップ角 ---
    const cd = Math.cos(delta), sd = Math.sin(delta);
    const fLat = -vx * sd + (vy + this.r * S.a) * cd, fLon = vx * cd + (vy + this.r * S.a) * sd;
    const aF = Math.atan2(fLat, Math.max(Math.abs(fLon), 2.5));
    const aR = Math.atan2(vy - this.r * S.b, vxe);
    this.slipF = aF; this.slipR = aR;
    let FyF = -FmaxF * tireCurve(aF, S.B, S.C), FyR = -FmaxR * tireCurve(aR, S.B, S.C);
    // --- 縦力（駆動・制動） ---
    const sgn = vx >= 0 ? 1 : -1;
    let FxF = driveF * (1 - driveR), FxR = driveF * driveR;
    const bf = brk * S.brakeMax;
    if (brk > 0 && Math.abs(vx) > 0.3) { FxF -= sgn * bf * 0.62; FxR -= sgn * bf * 0.38 * (S.lsd2way ? 1.15 : 1); }
    if (inp.hand && Math.abs(vx) > 0.5) { FxR = -sgn * FmaxR * 0.88; this.handOn = 1; } else this.handOn = 0;
    // 摩擦円
    const lim = (Fx, Fy, Fmax, driven) => {
      let spinT = 0; const cap = Fmax;
      if (Math.abs(Fx) > cap) { const over = Math.abs(Fx) / cap; Fx = Math.sign(Fx) * cap * 0.9; spinT = driven && Fx * sgn > 0 ? Math.min(1.6, (over - 1) * 0.7 + 0.25) : 0; }
      const fyLim = Math.sqrt(Math.max(0, cap * cap - Fx * Fx)) * (spinT > 0 ? (1.3 - 0.55 * S.lsd) : 1);
      Fy = clamp(Fy, -fyLim, fyLim); return [Fx, Fy, spinT];
    };
    // スロットルスライド: 後輪が滑っている時にアクセルを踏むとホイールスピンで横グリップが抜け、前に押し出す
    if (driveR > 0 && Math.abs(aR) > 0.12 && thr > 0.25 && this.gear > 0 && !inp.hand && vx > 3) {
      const pw = clamp((S.hp / (m / 1000)) / 190, 0.55, 1.35) * (0.65 + 0.6 * S.lsd);
      const k = clamp((Math.abs(aR) - 0.12) / 0.15, 0, 1) * thr * driveR;
      FyR *= 1 - k * clamp(pw * 0.42, 0.15, 0.55);
      FxR = Math.max(FxR, FmaxR * 0.72 * k * Math.min(1.1, pw));
      this.spinR = Math.max(this.spinR, k * 0.6);
    }
    let sT; [FxF, FyF, sT] = lim(FxF, FyF, FmaxF, driveR < 1); this.spinF = damp(this.spinF, sT, sT > this.spinF ? 8 : 4, dt);
    [FxR, FyR, sT] = lim(FxR, FyR, FmaxR, driveR > 0); if (inp.hand) sT = Math.max(sT, 0); this.spinR = damp(this.spinR, sT, sT > this.spinR ? 8 : 4, dt);
    // --- 合力 ---
    const vwx = this.vx, vwz = this.vz;
    let Fx = FxF * cd - FyF * sd + FxR, Fy = FxF * sd + FyF * cd + FyR;
    Fx += -m * GRAV * (surf.slope || 0);
    if (surf.offroad) { Fx -= sgn * Math.min(Math.abs(vx) * m * 0.25, m * 3); }
    let torque = S.a * (FxF * sd + FyF * cd) - S.b * FyR - S.yawDamp * m * this.r * 0.4;
    if (assist > 0 && spd > 4) torque += assist * m * 9 * (beta - clamp(beta, -0.62, 0.62)) - (Math.abs(beta) > 0.7 ? assist * this.r * S.I * 0.6 : 0);
    // 空気抵抗・転がり
    const dragFx = -S.dragK * spd * vx - S.roll * vx * 0.02 - Math.sign(vx) * Math.min(Math.abs(vx) * 30, S.roll * 9.0);
    const dragFy = -S.dragK * spd * vy;
    Fx += dragFx; Fy += dragFy;
    const axL = Fx / m, ayL = Fy / m;
    this.ax = axL; this.ay = ayL;
    // ワールド積分
    this.vx += (axL * fwdX + ayL * rgtX) * dt; this.vz += (axL * fwdZ + ayL * rgtZ) * dt;
    this.r += torque / S.I * dt;
    // 低速安定化
    const nv = Math.hypot(this.vx, this.vz);
    if (nv < 0.6 && thr < 0.05 && (brk > 0 || this.gear === 0 || inp.hand)) { this.vx *= 0.8; this.vz *= 0.8; this.r *= 0.8; }
    if (nv < 1.5) this.r *= Math.exp(-dt * 6 * (1.5 - nv));
    this.r = clamp(this.r, -4, 4);
    this.heading -= this.r * dt;
    this.x += this.vx * dt; this.z += this.vz * dt;
    // 状態
    const fx2 = Math.sin(this.heading), fz2 = Math.cos(this.heading);
    this.vLong = this.vx * fx2 + this.vz * fz2; this.vLat = this.vx * -fz2 + this.vz * fx2; this.speed = Math.hypot(this.vx, this.vz);
    this.braking = brk;
    // 自動変速
    if (this.auto && this.gear > 0 && this.shiftT <= 0 && (Math.abs(beta) < 0.22 || rpm > S.redline * 0.985 || rpm < S.redline * 0.26)) {
      const up = this.gear < nG && rpm > S.redline * 0.94 && this.spinR < 0.5 && this.spinF < 0.5;
      const dnRpm = this.gear > 1 ? (Math.abs(vx) / S.wheelR) * S.ratios[this.gear - 2] * S.final * 60 / TAU : 1e9;
      const dn = this.gear > 1 && dnRpm < S.redline * 0.86 && (rpm < S.redline * (brk > 0.2 ? 0.58 : 0.4));
      if (up) this.shift(1); else if (dn) this.shift(-1);
    }
    // 車体の姿勢（見た目）
    this.pitch = damp(this.pitch, clamp(-axL * 0.006, -0.06, 0.06), 6, dt);
    this.roll = damp(this.roll, clamp(-ayL * 0.0075 * S.rollK, -0.07, 0.07), 6, dt);
  }
}
