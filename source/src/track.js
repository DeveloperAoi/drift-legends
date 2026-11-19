// =====================================================================
// track.js — コース生成（パラメトリック）・景観構築・位置クエリ
// =====================================================================
const STEP = 2.0;      // サンプル間隔 (m)
const CHUNK = 64;      // チャンク単位のサンプル数

class Track {
  constructor(def) {
    this.def = def; this.env = def.env; this.open = def.open || 0;
    this.halfW = def.width / 2;
    let ok = false, scale = 1;
    for (let attempt = 0; attempt < 14 && !ok; attempt++) {
      const ctrl = this.controlPoints(scale);
      const pts = relaxCurvature(sampleCR(ctrl, STEP), 12);
      if (this.validate(pts)) { this.finalize(pts); ok = true; this.attempts = attempt + 1; } else scale *= 0.86;
    }
    this.fallback = !ok;
    if (!ok) { const ctrl = []; for (let i = 0; i < 32; i++) { const t = i / 32 * TAU; ctrl.push([Math.cos(t) * this.def.R, 0, Math.sin(t) * this.def.R]); } this.finalize(sampleCR(ctrl, STEP)); }
    this.setupWalls(); this.findCorners(); this.speedProfile();
    this.jcts = (def.jct || []).map(j => { const i = Math.floor(j.at * this.n); return Object.assign({ i, side: this.innerRight[i] ? -1 : 1 }, j); });
    if (def.jumps) this.setupRamps();
  }
  // ---- ジャンプ台 ----
  setupRamps() {
    const n = this.n, K = this.K, m = Math.round(13 / STEP), tn = 1; const flat = i => { for (let k = -18; k <= m + tn + 26; k++) if (Math.abs(K[(i + k + n) % n]) > 1 / 450) return false; return true; };
    this.ramps = [];
    for (const f of this.def.jumps) {
      const base = Math.floor(f * n); let found = -1;
      for (let d = 0; d < n / 5 && found < 0; d++) for (const s0 of [base + d, base - d]) { const i = ((s0 % n) + n) % n; if (i < 45 || i > n - 40) continue; if (flat(i) && !this.ramps.some(r => { const g = Math.abs(r.i - i); return Math.min(g, n - g) < 70; })) { found = i; break; } }
      if (found >= 0) this.ramps.push({ i: found, m, tn, h: this.def.jumpH || 1.6 });
    }
  }
  rampH(prog, lat) {
    if (!this.ramps || Math.abs(lat) > this.halfW + 0.4) return 0; const f = prog / STEP, n = this.n;
    for (const r of this.ramps) { let d = f - r.i; if (d < -n / 2) d += n; if (d > n / 2) d -= n; if (d >= 0 && d < r.m) return r.h * d / r.m; if (d >= r.m && d < r.m + r.tn) return r.h; }
    return 0;
  }
  controlPoints(scale) {
    const d = this.def, rng = mulberry32(d.seed), N = d.N;
    if (d.ctrl) return d.ctrl.map(q => [q[0], q[1], q[2]]);
    const ph = d.harm.map(() => rng() * TAU), hph = [rng() * TAU, rng() * TAU, rng() * TAU];
    const flat = ['city', 'port', 'industrial', 'lot'].includes(d.env);
    const rBase = th => { let r = 1; d.harm.forEach((h, j) => r += h[1] * scale * Math.sin(h[0] * th + ph[j])); return r * d.R; };
    const yAt = th => flat ? 0 : d.H * (0.62 * Math.sin(th + hph[0]) + 0.28 * Math.sin(2 * th + hph[1]) + 0.1 * Math.sin(3 * th + hph[2]));
    const P = (th, r) => [Math.cos(th) * r, yAt(th), Math.sin(th) * r];
    // 多角形ベース（市街地・サーキット）: 頂点をフィレットで丸める
    if (d.poly) {
      const M = d.poly, V = [];
      for (let i = 0; i < M; i++) { const th = (i + (rng() - 0.5) * 0.5) / M * TAU; V.push([th, rBase(th) * (1 + (rng() - 0.5) * 0.35 * scale)]); }
      const pts = [];
      for (let i = 0; i < M; i++) {
        const a = P(...V[(i - 1 + M) % M]), b = P(...V[i]), c = P(...V[(i + 1) % M]);
        const lab = Math.hypot(a[0] - b[0], a[2] - b[2]), lbc = Math.hypot(c[0] - b[0], c[2] - b[2]);
        const f = d.fillet[0] + rng() * (d.fillet[1] - d.fillet[0]);
        const t1 = Math.min(0.42, f / lab), t2 = Math.min(0.42, f / lbc);
        const q1 = [lerp(b[0], a[0], t1), lerp(b[1], a[1], t1), lerp(b[2], a[2], t1)], q2 = [lerp(b[0], c[0], t2), lerp(b[1], c[1], t2), lerp(b[2], c[2], t2)];
        const mid = [(q1[0] + q2[0]) / 2 * 0.3 + b[0] * 0.7, (q1[1] + q2[1]) / 2, (q1[2] + q2[2]) / 2 * 0.3 + b[2] * 0.7];
        pts.push(q1, mid, q2);
        const m2 = [lerp(b[0], c[0], 0.5), lerp(b[1], c[1], 0.5), lerp(b[2], c[2], 0.5)]; pts.push(m2);
      }
      return pts;
    }
    // 通常（峠など）: 極座標の周回 + ヘアピン群（つづら折り）
    const zones = (d.hp || []).map(hp => {
      const thC = hp.at * TAU, rIn = rBase(thC) * (1 - hp.amp * scale), dPhi = 40 / rIn;
      const span = dPhi * (hp.n + 1); return { a: thC - span / 2, b: thC + span / 2, hp, dPhi };
    });
    const pts = [];
    for (let i = 0; i < N; i++) {
      const th = i / N * TAU;
      const z = zones.find(z => th >= z.a - 0.02 && th <= z.b + 0.02); if (z) { if (!z.done) { z.done = true; emitZone(z); } continue; }
      pts.push(P(th, rBase(th)));
    }
    return pts;
    function emitZone(z) {
      const { hp, dPhi } = z; const rb = rBase((z.a + z.b) / 2); const rLo = rb * (1 - hp.amp * scale), rHi = rb * (1 + hp.amp * scale * 0.25);
      pts.push(P(z.a, rb));
      for (let k = 0; k <= hp.n; k++) {
        const phi = z.a + (k + 0.5) * dPhi;
        const rEnd = k === hp.n ? null : (k % 2 === 0 ? rLo : rHi); const rStart = k === 0 ? rb : (k % 2 === 1 ? rLo : rHi);
        if (rEnd === null) { pts.push(P(phi, (rStart + rb) / 2)); break; }
        pts.push(P(phi, (rStart + rEnd) / 2)); pts.push(P(phi, rEnd));
        const bulge = dPhi * rEnd * 0.42 * (rEnd === rLo ? -1 : 1);
        pts.push(P(phi + dPhi / 2, rEnd + bulge));
        pts.push(P(phi + dPhi, rEnd));
      }
      pts.push(P(z.b, rb));
    }
  }
  validate(pts) {
    const n = pts.length, minSep = this.def.width + 9, cell = 30, grid = new Map();
    const key = (x, z) => (Math.floor(x / cell) + 5000) * 10000 + (Math.floor(z / cell) + 5000);
    for (let i = 0; i < n; i++) { const k = key(pts[i][0], pts[i][2]); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i); }
    for (let i = 0; i < n; i += 2) {
      const [x, , z] = pts[i]; const cx = Math.floor(x / cell), cz = Math.floor(z / cell);
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
        const arr = grid.get((cx + a + 5000) * 10000 + (cz + b + 5000)); if (!arr) continue;
        for (const j of arr) { let di = Math.abs(i - j); di = Math.min(di, n - di); if (di < 45) continue; const dx = pts[j][0] - x, dz = pts[j][2] - z; if (dx * dx + dz * dz < minSep * minSep) return false; }
      }
    }
    // 最小旋回半径
    for (let i = 0; i < n; i++) {
      const a = pts[(i - 3 + n) % n], b = pts[i], c = pts[(i + 3) % n];
      const h1 = Math.atan2(b[0] - a[0], b[2] - a[2]), h2 = Math.atan2(c[0] - b[0], c[2] - b[2]);
      const k = Math.abs(wrapAngle(h2 - h1)) / (3 * STEP); if (k > 1 / 8) return false;
    }
    return true;
  }
  finalize(pts) {
    let n = pts.length; this.n = n; this.length = n * STEP;
    const X = new Float32Array(n), Y = new Float32Array(n), Z = new Float32Array(n);
    pts.forEach((p, i) => { X[i] = p[0]; Y[i] = p[1]; Z[i] = p[2]; });
    // 勾配制限＆スムージング
    const maxG = this.env === 'mountain' ? 0.11 : 0.06;
    for (let pass = 0; pass < 6; pass++) {
      const T = Float32Array.from(Y);
      for (let i = 0; i < n; i++) { let s = 0; for (let k = -6; k <= 6; k++) s += T[(i + k + n) % n]; Y[i] = s / 13; }
      for (let i = 1; i < n * 2; i++) { const a = (i - 1) % n, b = i % n; Y[b] = clamp(Y[b], Y[a] - maxG * STEP, Y[a] + maxG * STEP); }
    }
    const TX = new Float32Array(n), TZ = new Float32Array(n), HD = new Float32Array(n), K = new Float32Array(n), SL = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = (i - 1 + n) % n, b = (i + 1) % n; let tx = X[b] - X[a], tz = Z[b] - Z[a]; const l = Math.hypot(tx, tz) || 1; TX[i] = tx / l; TZ[i] = tz / l; HD[i] = Math.atan2(TX[i], TZ[i]);
      SL[i] = (Y[b] - Y[a]) / (2 * STEP);
    }
    for (let i = 0; i < n; i++) { const a = (i - 2 + n) % n, b = (i + 2) % n; K[i] = wrapAngle(HD[b] - HD[a]) / (4 * STEP); }
    const Ks = new Float32Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let k = -4; k <= 4; k++) s += K[(i + k + n) % n]; Ks[i] = s / 9; }
    Object.assign(this, { X, Y, Z, TX, TZ, HD, K: Ks, SL });
    this.RX = TZ.map(v => -v); this.RZ = TX.slice();
    let mn = 1e9, mx = -1e9, minR = 1e9, maxR = 0; for (let i = 0; i < n; i++) { mn = Math.min(mn, Y[i]); mx = Math.max(mx, Y[i]); const r = Math.hypot(X[i], Z[i]); minR = Math.min(minR, r); maxR = Math.max(maxR, r); }
    this.minY = mn; this.maxY = mx; this.minR = minR; this.maxR = maxR;
    this.tunnel = new Uint8Array(n);
    for (const tu of (this.def.tunnels || (this.def.tunnel ? [this.def.tunnel] : []))) { const s = Math.floor(tu[0] * n), c = Math.floor(tu[1] / STEP); for (let k = 0; k < c; k++) this.tunnel[(s + k) % n] = 1; }
    this.hasTunnel = this.tunnel.some(v => v);
    // 左右の空き距離（地形の張り出し制限）
    this.clearL = new Float32Array(n).fill(200); this.clearR = new Float32Array(n).fill(200);
    const cell = 50, grid = new Map(); const key = (a, b) => (a + 5000) * 10000 + (b + 5000);
    for (let i = 0; i < n; i += 2) { const k = key(Math.floor(X[i] / cell), Math.floor(Z[i] / cell)); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i); }
    for (let i = 0; i < n; i += 2) {
      const cx = Math.floor(X[i] / cell), cz = Math.floor(Z[i] / cell);
      for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) {
        const arr = grid.get(key(cx + a, cz + b)); if (!arr) continue;
        for (const j of arr) {
          let di = Math.abs(i - j); di = Math.min(di, n - di); if (di < 40) continue;
          const dx = X[j] - X[i], dz = Z[j] - Z[i], d = Math.hypot(dx, dz); const side = dx * this.RX[i] + dz * this.RZ[i];
          const free = d - this.halfW - 4;
          if (side > 0) this.clearR[i] = Math.min(this.clearR[i], free); else this.clearL[i] = Math.min(this.clearL[i], free);
        }
      }
      if (i + 1 < n) { this.clearL[i + 1] = this.clearL[i]; this.clearR[i + 1] = this.clearR[i]; }
    }
    for (let i = 0; i < n; i++) { this.clearL[i] = Math.max(2, this.clearL[i]); this.clearR[i] = Math.max(2, this.clearR[i]); }
  }
  setupWalls() {
    const e = this.env, hw = this.halfW;
    const conf = { mountain: [0.9, 0.9, 0.72], highway: [0.7, 0.7, 0.8], city: [1.6, 1.6, 0.8], port: [1.8, 1.8, 0.75], industrial: [1.6, 1.6, 0.75], coast: [0.9, 0.9, 0.72], circuit: [9, 9, 0.5], lot: [100, 100, 1] }[e];
    this.shoulder = conf[0]; this.wall = hw + conf[0]; this.offGrip = conf[2];
    // 内側（中心側）判定
    this.innerRight = new Int8Array(this.n);
    for (let i = 0; i < this.n; i++) this.innerRight[i] = (-this.X[i] * this.RX[i] - this.Z[i] * this.RZ[i]) > 0 ? 1 : 0;
    // 区間リストで作った峠（明神峠など）：中心方向ではなく「カーブの内側」を山側（岩壁）にする
    if (this.def.ctrl && e === 'mountain') { const n = this.n, W = 70; let acc = 0; for (let k = -W; k <= W; k++) acc += this.K[(k + n) % n];
      for (let i = 0; i < n; i++) { if (Math.abs(acc) > 1e-4) this.innerRight[i] = acc < 0 ? 1 : 0; else this.innerRight[i] = i ? this.innerRight[i - 1] : 0; acc += this.K[(i + W + 1) % n] - this.K[(i - W + n) % n]; } }
  }
  findCorners() {
    const n = this.n, K = this.K, th = 1 / 350; const cs = [];
    let i = 0; while (i < n && Math.abs(K[i]) > th) i++;
    const start0 = i; let cur = null;
    for (let s = 0; s <= n; s++) {
      const j = (start0 + s) % n, k = K[j], on = Math.abs(k) > th;
      if (on && (!cur || Math.sign(k) !== cur.dir)) { if (cur) cs.push(cur); cur = { start: j, end: j, dir: Math.sign(k), ang: 0, maxK: 0, apex: j }; }
      if (on) { cur.end = j; cur.ang += k * STEP; if (Math.abs(k) > cur.maxK) { cur.maxK = Math.abs(k); cur.apex = j; } }
      else if (cur) { cs.push(cur); cur = null; }
    }
    if (cur) cs.push(cur);
    this.corners = cs.filter(c => Math.abs(c.ang) > 0.3).sort((a, b) => a.start - b.start).map((c, idx) => {
      const a = Math.abs(c.ang) / DEG, R = 1 / c.maxK;
      const type = a > 120 && R < 45 ? 'ヘアピン' : R < 60 ? 'タイト' : R < 150 ? 'ミドル' : '高速';
      return Object.assign(c, { idx: idx + 1, deg: a, R, type, label: (c.dir > 0 ? '左' : '右') + type });
    });
    this.cornerAt = new Int16Array(n).fill(-1);
    this.corners.forEach((c, k) => { let j = c.start; for (let g = 0; g < n; g++) { this.cornerAt[j] = k; if (j === c.end) break; j = (j + 1) % n; } });
  }
  speedProfile() {
    const n = this.n, v = new Float32Array(n);
    for (let i = 0; i < n; i++) { const k = Math.max(Math.abs(this.K[i]), 1e-4); v[i] = Math.min(95, Math.sqrt(1.05 * 9.81 / k)); }
    const dec = 8.5;
    for (let pass = 0; pass < 2; pass++) for (let s = n * 2; s > 0; s--) { const i = s % n, j = (s + 1) % n; v[i] = Math.min(v[i], Math.sqrt(v[j] * v[j] + 2 * dec * STEP)); }
    this.vmax = v;
  }
  // ---- 位置クエリ ----
  locate(x, z, hint = -1) {
    const n = this.n, X = this.X, Z = this.Z; let best = -1, bd = 1e18;
    if (hint >= 0) { for (let k = -40; k <= 40; k++) { const i = (hint + k + n) % n; const dx = X[i] - x, dz = Z[i] - z, d = dx * dx + dz * dz; if (d < bd) { bd = d; best = i; } } }
    if (best < 0 || bd > 40 * 40) { for (let i = 0; i < n; i++) { const dx = X[i] - x, dz = Z[i] - z, d = dx * dx + dz * dz; if (d < bd) { bd = d; best = i; } } }
    let i = best, dx = x - X[i], dz = z - Z[i]; let t = (dx * this.TX[i] + dz * this.TZ[i]) / STEP;
    if (t < 0) { i = (i - 1 + n) % n; dx = x - X[i]; dz = z - Z[i]; t = (dx * this.TX[i] + dz * this.TZ[i]) / STEP; }
    t = clamp(t, 0, 1); const j = (i + 1) % n;
    const rx = lerp(this.RX[i], this.RX[j], t), rz = lerp(this.RZ[i], this.RZ[j], t);
    const lat = dx * rx + dz * rz - 0; const y = lerp(this.Y[i], this.Y[j], t);
    return { i, t, lat, y, prog: (i + t) * STEP, rx, rz, tx: lerp(this.TX[i], this.TX[j], t), tz: lerp(this.TZ[i], this.TZ[j], t), slope: this.SL[i] };
  }
  pointAt(prog, lat = 0) {
    const n = this.n; let f = ((prog / STEP) % n + n) % n; const i = Math.floor(f), j = (i + 1) % n, t = f - i;
    const rx = lerp(this.RX[i], this.RX[j], t), rz = lerp(this.RZ[i], this.RZ[j], t);
    return { x: lerp(this.X[i], this.X[j], t) + rx * lat, y: lerp(this.Y[i], this.Y[j], t), z: lerp(this.Z[i], this.Z[j], t) + rz * lat, hd: this.HD[i] + wrapAngle(this.HD[j] - this.HD[i]) * t, i, k: lerp(this.K[i], this.K[j], t) };
  }
}

// 中心付きCatmull-Rom（centripetal）閉曲線 → 等間隔サンプル
function sampleCR(ctrl, step) {
  const n = ctrl.length, dense = [];
  for (let i = 0; i < n; i++) {
    const p0 = ctrl[(i - 1 + n) % n], p1 = ctrl[i], p2 = ctrl[(i + 1) % n], p3 = ctrl[(i + 2) % n];
    const td = (a, b) => Math.pow(Math.hypot(b[0] - a[0], b[2] - a[2]) + 1e-4, 0.5);
    const t0 = 0, t1 = t0 + td(p0, p1), t2 = t1 + td(p1, p2), t3 = t2 + td(p2, p3);
    const M = 40;
    for (let s = 0; s < M; s++) {
      const t = t1 + (t2 - t1) * s / M; const out = [0, 0, 0];
      for (let c = 0; c < 3; c++) {
        const A1 = (t1 - t) / (t1 - t0) * p0[c] + (t - t0) / (t1 - t0) * p1[c];
        const A2 = (t2 - t) / (t2 - t1) * p1[c] + (t - t1) / (t2 - t1) * p2[c];
        const A3 = (t3 - t) / (t3 - t2) * p2[c] + (t - t2) / (t3 - t2) * p3[c];
        const B1 = (t2 - t) / (t2 - t0) * A1 + (t - t0) / (t2 - t0) * A2;
        const B2 = (t3 - t) / (t3 - t1) * A2 + (t - t1) / (t3 - t1) * A3;
        out[c] = (t2 - t) / (t2 - t1) * B1 + (t - t1) / (t2 - t1) * B2;
      }
      dense.push(out);
    }
  }
  return resample(dense, step);
}
function resample(dense, step) {
  const res = []; let acc = 0; res.push(dense[0]);
  const m = dense.length; let need = step;
  for (let i = 0; i < m; i++) {
    const a = dense[i], b = dense[(i + 1) % m]; let seg = Math.hypot(b[0] - a[0], b[2] - a[2]); let pos = 0;
    while (acc + seg - pos >= need) {
      const take = need - acc; pos += take; const t = pos / seg; res.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]); acc = 0; need = step;
    }
    acc += seg - pos;
  }
  if (res.length > 2) { const f = res[0], l = res[res.length - 1]; if (Math.hypot(f[0] - l[0], f[2] - l[2]) < step * 0.5) res.pop(); }
  return res;
}
// 急すぎるカーブを局所スムージングで緩める（最小半径 minR）
function relaxCurvature(pts, minR) {
  const n = pts.length; let changed = false;
  for (let it = 0; it < 400; it++) {
    let bad = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[(i - 3 + n) % n], b = pts[i], c = pts[(i + 3) % n];
      const h1 = Math.atan2(b[0] - a[0], b[2] - a[2]), h2 = Math.atan2(c[0] - b[0], c[2] - b[2]);
      const k = Math.abs(wrapAngle(h2 - h1)) / (3 * STEP);
      if (k > 1 / minR) { bad++; for (let j = -5; j <= 5; j++) { const q = (i + j + n) % n, p0 = pts[(q - 1 + n) % n], p1 = pts[(q + 1) % n], p = pts[q]; p[0] += ((p0[0] + p1[0]) / 2 - p[0]) * 0.5; p[2] += ((p0[2] + p1[2]) / 2 - p[2]) * 0.5; } }
    }
    if (!bad) break; changed = true;
  }
  return changed ? resample(pts, STEP) : pts;
}

// =====================================================================
// 景観構築
// =====================================================================
let WINDOW_TEX = null;
function windowTexture(R) {
  if (WINDOW_TEX) return WINDOW_TEX;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const im = g.createImageData(128, 128), d = im.data, rng = mulberry32(77);
  for (let i = 0; i < d.length; i += 4) { d[i] = d[i + 1] = d[i + 2] = 235; d[i + 3] = 255; }
  for (let cy = 0; cy < 8; cy++) for (let cx = 0; cx < 8; cx++) {
    const lit = rng() < 0.42, tone = 60 + rng() * 40;
    for (let y = cy * 16 + 4; y < cy * 16 + 13; y++) for (let x = cx * 16 + 3; x < cx * 16 + 13; x++) { const o = (y * 128 + x) * 4; d[o] = tone; d[o + 1] = tone + 10; d[o + 2] = tone + 30; d[o + 3] = lit ? 110 : 255; }
  }
  g.putImageData(im, 0, 0); WINDOW_TEX = R.texFromCanvas(c, null, false, true); return WINDOW_TEX;
}

function buildWorld(track, R, opts) {
  const def = track.def, env = def.env, n = track.n, hw = track.halfW, rng = mulberry32(def.seed * 7 + 3);
  const { X, Y, Z, RX, RZ } = track; const snow = opts.weather === 'snow', wet = opts.weather === 'rain', night = opts.time === 'night', xmas = !!def.xmas || !!def.illum;
  const quality = opts.quality || 2; const dens = quality === 0 ? 0.45 : quality === 1 ? 0.7 : 1;
  const nch = Math.ceil(n / CHUNK);
  const chunks = []; for (let c = 0; c < nch; c++) chunks.push({ road: new GB(), scene: new GB(), bld: new GB() });
  const G = new GB(); // global
  const glow = []; const lamps = []; const tunnelLights = [];
  const P = (i, lat, h = 0) => { i = (i + n) % n; return [X[i] + RX[i] * lat, Y[i] + h, Z[i] + RZ[i] * lat]; };
  const ch = i => chunks[Math.floor(((i % n) + n) % n / CHUNK)];
  const vary = (c, a) => [c[0] * (1 + (rng() - .5) * a), c[1] * (1 + (rng() - .5) * a), c[2] * (1 + (rng() - .5) * a)];
  const addGlow = (p, size, c, a = 1) => glow.push(p[0], p[1], p[2], size, c[0], c[1], c[2], a);

  // 色
  let asphalt = snow ? [0.74, 0.76, 0.8] : wet ? [0.15, 0.15, 0.17] : [0.24, 0.24, 0.26];
  if (env === 'circuit' && !snow) asphalt = [0.2, 0.2, 0.22];
  const shoulderC = env === 'mountain' || env === 'coast' ? (snow ? [0.8, 0.82, 0.86] : [0.36, 0.33, 0.28]) : env === 'circuit' ? (snow ? [0.85, 0.86, 0.9] : [0.55, 0.5, 0.4]) : (snow ? [0.82, 0.84, 0.88] : [0.5, 0.5, 0.52]);
  const grass = snow ? [0.86, 0.88, 0.92] : def.autumn ? [0.42, 0.34, 0.16] : env === 'coast' ? [0.3, 0.42, 0.2] : [0.2, 0.34, 0.14];
  const rock = snow ? [0.7, 0.72, 0.76] : [0.36, 0.33, 0.29];
  const white = [0.92, 0.92, 0.9], yellow = [0.95, 0.72, 0.1];

  // ---------------- 路面 ----------------
  const wallOff = track.wall;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, g = ch(i).road; const inT = track.tunnel[i];
    g.s = inT ? 0.12 : 1;
    const c = vary(asphalt, 0.05);
    if (env !== 'lot') {
      g.quad(P(i, -hw), P(i, hw), P(j, hw), P(j, -hw), c);
      g.quad(P(i, -wallOff), P(i, -hw), P(j, -hw), P(j, -wallOff), shoulderC);
      g.quad(P(i, hw), P(i, wallOff), P(j, wallOff), P(j, hw), shoulderC);
      // ライン
      const L = (lat, w, col, h = 0.02) => g.quad(P(i, lat - w, h), P(i, lat + w, h), P(j, lat + w, h), P(j, lat - w, h), col);
      if (snow) { L(-hw * 0.5, 0.45, [0.5, 0.52, 0.56], 0.01); L(hw * 0.5, 0.45, [0.5, 0.52, 0.56], 0.01); }
      else {
        if (env !== 'circuit') { L(-hw + 0.25, 0.08, white); L(hw - 0.25, 0.08, white); }
        if (env === 'mountain' || env === 'coast') { if (track.cornerAt[i] >= 0 || (i % 6) < 3) L(0, 0.07, track.cornerAt[i] >= 0 ? yellow : white); }
        else if (env === 'highway') { const lanes = Math.round(def.width / 3.6); for (let l = 1; l < lanes; l++) if (i % 6 < 3) L(-hw + l * def.width / lanes, 0.07, white); }
        else if (env !== 'circuit') { if (i % 5 < 3) L(0, 0.08, white); }
      }
    }
    g.s = 1;
  }
  // スタートライン（チェッカー）
  { const g = ch(0).road; const cells = Math.round(def.width / 1); for (let r = 0; r < 2; r++) for (let k = 0; k < cells; k++) { const col = (k + r) % 2 ? [0.05, 0.05, 0.05] : [0.95, 0.95, 0.95]; const l0 = -hw + k * def.width / cells, l1 = l0 + def.width / cells; const a = r * 0.5, b = a + 0.5; g.quad(P(0, l0, 0.03).map((v, q) => v + (q !== 1 ? [track.TX[0], 0, track.TZ[0]][q] * a : 0)), P(0, l1, 0.03).map((v, q) => v + (q !== 1 ? [track.TX[0], 0, track.TZ[0]][q] * a : 0)), P(0, l1, 0.03).map((v, q) => v + (q !== 1 ? [track.TX[0], 0, track.TZ[0]][q] * b : 0)), P(0, l0, 0.03).map((v, q) => v + (q !== 1 ? [track.TX[0], 0, track.TZ[0]][q] * b : 0)), col); } }
  // スタートゲート
  if (env !== 'lot') {
    const g = ch(0).scene; const pl = P(0, -wallOff - 0.5), pr = P(0, wallOff + 0.5), yaw = track.HD[0];
    g.box(pl[0], pl[1] + 3.5, pl[2], 0.6, 7, 0.6, [0.15, 0.15, 0.17], yaw); g.box(pr[0], pr[1] + 3.5, pr[2], 0.6, 7, 0.6, [0.15, 0.15, 0.17], yaw);
    const cells = 16; for (let k = 0; k < cells; k++) { const lat = -wallOff - 0.5 + (k + 0.5) * (2 * wallOff + 1) / cells; const p = P(0, lat, 6.5); g.box(p[0], p[1], p[2], (2 * wallOff + 1) / cells, 1, 0.3, k % 2 ? [0.95, 0.95, 0.95] : [0.08, 0.08, 0.08], yaw); }
    for (let k = 0; k < 5; k++) { const p = P(0, -2 + k, 5.6); g.e = 1; g.box(p[0], p[1], p[2], 0.4, 0.4, 0.2, [1, 0.1, 0.05], yaw); g.e = 0; addGlow(p, 2, [1, 0.2, 0.1], 0.8); }
  }

  // ---------------- 環境別 ----------------
  const groundC = snow ? [0.82, 0.84, 0.88] : env === 'circuit' ? [0.24, 0.42, 0.18] : env === 'mountain' ? (def.autumn ? [0.3, 0.25, 0.14] : [0.16, 0.28, 0.12]) : env === 'coast' ? [0.25, 0.36, 0.18] : env === 'highway' ? [0.22, 0.22, 0.24] : [0.28, 0.28, 0.3];
  let groundY = track.minY - 0.08; let seaY = null;
  if (env === 'mountain') groundY = track.minY - 55;
  if (env === 'highway') groundY = track.minY - 14;
  if (env === 'coast') { seaY = track.minY - 9; groundY = seaY - 30; }
  if (env === 'port') seaY = -2.5;
  const ext = track.maxR + 3000;
  if (env !== 'port') { G.quad([-ext, groundY, -ext], [ext, groundY, -ext], [ext, groundY, ext], [-ext, groundY, ext], groundC); }
  const water = new GB();
  if (seaY !== null) water.quad([-ext, seaY, -ext], [ext, seaY, -ext], [ext, seaY, ext], [-ext, seaY, ext], [0.06, 0.18, 0.28]);
  if (def.lake) { const r = track.minR * 0.8; const ly = track.minY - 6; for (let k = 0; k < 40; k++) { const a0 = k / 40 * TAU, a1 = (k + 1) / 40 * TAU; water.tri([0, ly, 0], [Math.cos(a1) * r, ly, Math.sin(a1) * r], [Math.cos(a0) * r, ly, Math.sin(a0) * r], [0.08, 0.2, 0.3]); } }
  if (env === 'port') {
    // 島（陸地）: 中心から外側オフセットへの扇形
    const off = 60;
    for (let i = 0; i < n; i += 4) { const j = (i + 4) % n; const a = P(i, track.innerRight[i] ? -off : off, -0.06), b = P(j, track.innerRight[j] ? -off : off, -0.06); G.tri([0, -0.06, 0], a, b, groundC); }
  }

  // 中央の山 / 地形リボン
  const ribbonsFor = env === 'mountain' || env === 'coast';
  if (env === 'mountain' && !def.lake) { G.cylY(0, groundY, 0, track.minR * 0.72, track.minR * 0.05, track.maxY - groundY + 70, 18, snow ? [0.8, 0.82, 0.86] : vary(grass, 0.1)); }

  // 木
  const treeCols = def.autumn ? [[0.78, 0.26, 0.08], [0.9, 0.55, 0.1], [0.62, 0.14, 0.08], [0.2, 0.35, 0.14]] : env === 'coast' ? [[0.12, 0.3, 0.14], [0.16, 0.34, 0.12]] : [[0.1, 0.28, 0.12], [0.14, 0.34, 0.14], [0.08, 0.24, 0.1]];
  const tree = (g, x, y, z, s = 1) => {
    const c = treeCols[Math.floor(rng() * treeCols.length)];
    g.cylY(x, y - 0.3, z, 0.22 * s, 0.18 * s, 2.2 * s, 5, [0.3, 0.2, 0.12], false);
    g.cylY(x, y + 1.4 * s, z, 2.3 * s, 0, 4.6 * s, 6, snow ? mixc(c, [0.8, 0.82, 0.86], 0.35) : vary(c, 0.15));
    g.cylY(x, y + 3.6 * s, z, 1.6 * s, 0, 3.6 * s, 6, snow ? [0.88, 0.9, 0.94] : vary(c, 0.15));
    if (xmas && rng() < 0.25) { const cols = [[1, 0.1, 0.1], [1, 0.8, 0.1], [0.1, 0.6, 1], [0.2, 1, 0.3]]; for (let k = 0; k < 6; k++) { const a = rng() * TAU, h = 1.6 + rng() * 4, r = 2 * (1 - h / 8); addGlow([x + Math.cos(a) * r, y + h * s, z + Math.sin(a) * r], 1.0, cols[k % 4], 1); } }
  };

  if (ribbonsFor) {
    for (let i = 0; i < n; i += 2) {
      const j = (i + 2) % n; if (track.tunnel[i] && track.tunnel[j]) continue;
      for (const side of [-1, 1]) {
        const g = ch(i).scene; const inner = (side > 0) === !!track.innerRight[i];
        const clear = side > 0 ? track.clearR[i] : track.clearL[i], clearj = side > 0 ? track.clearR[j] : track.clearL[j];
        let offs, hs;
        const isSea = env === 'coast' && !inner;
        if (inner) { offs = [0, 0.7, 6, 18, 40]; hs = [0, 3.2, 6, 14, 26]; }
        else if (isSea) { offs = [0.3, 3, 9, 20, 34]; hs = [-0.3, -2, -6, -11, null]; }
        else { offs = [0.3, 3, 11, 26, 70]; hs = [-0.2, -2.5, -10, -24, null]; }
        const mk = (ii, cl) => offs.map((o, k) => { const lim = Math.max(1.5, cl * 0.5); const oo = k === 0 ? o : Math.min(o, lim * (o / offs[offs.length - 1]) + (k > 0 ? 0.6 * k : 0)); const sc = oo / Math.max(o, 0.01); let h = hs[k] === null ? (isSea ? seaY - 2 - Y[ii] : groundY - Y[ii]) : hs[k] * (inner ? Math.min(1, 0.4 + sc) : Math.min(1, 0.3 + sc)); if (inner && k === 1) h = 3.2; return P(ii, side * (wallOff + oo), h); });
        const A = mk(i, clear), B = mk(j, clearj);
        for (let k = 0; k < offs.length - 1; k++) {
          let col = k === 0 && inner ? rock : isSea && k >= 2 ? (snow ? [0.85, 0.85, 0.88] : [0.76, 0.7, 0.52]) : vary(grass, 0.12);
          if (k === 0 && !inner) col = shoulderC;
          if (side > 0) g.quad(A[k], A[k + 1], B[k + 1], B[k], col); else g.quad(A[k + 1], A[k], B[k], B[k + 1], col);
        }
        // 木
        if (rng() < (def.pass ? 0.85 : 0.62) * dens && !(def.park && side === (track.innerRight[i] ? -1 : 1) && ((i - Math.floor(def.park[0] * n) + n) % n) < def.park[1] / STEP + 8)) {
          const k = 1 + Math.floor(rng() * 2.6); const t = rng(); const a = A[k], b = A[Math.min(k + 1, offs.length - 1)];
          const p = [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
          const latp = Math.abs((p[0] - X[i]) * RX[i] + (p[2] - Z[i]) * RZ[i]);
          if (latp > wallOff + 3.5 && !(isSea && k >= 2)) tree(g, p[0], p[1], p[2], 0.8 + rng() * 0.6);
        }
      }
    }
  }

  // ガードレール・壁
  for (let i = 0; i < n; i += 2) {
    const j = (i + 2) % n, g = ch(i).scene; const inT = track.tunnel[i];
    if (env === 'lot') break;
    for (const side of [-1, 1]) {
      const inner = (side > 0) === !!track.innerRight[i];
      const lat = side * wallOff;
      if ((env === 'mountain' || env === 'coast') && inner && !inT) continue; // 岩壁側
      if (env === 'mountain' || env === 'coast') {
        // ガードレール
        const rc = snow ? [0.85, 0.86, 0.9] : [0.78, 0.8, 0.82];
        g.quad(P(i, lat, 0.45), P(j, lat, 0.45), P(j, lat, 0.78), P(i, lat, 0.78), rc);
        if (i % 4 === 0) { const p = P(i, lat + side * 0.08, 0.38); g.box(p[0], p[1], p[2], 0.1, 0.76, 0.1, [0.6, 0.62, 0.64], track.HD[i]); }
        if (i % 12 === 0) { const p = P(i, lat, 0.9); g.e = 1; g.box(p[0], p[1], p[2], 0.08, 0.12, 0.08, [1, 0.55, 0.1], track.HD[i]); g.e = 0; addGlow(p, 0.5, [1, 0.6, 0.15], 0.9); }
      } else if (env === 'highway' || env === 'city' || env === 'port' || env === 'industrial') {
        const hgt = env === 'highway' ? 1.1 : 0.9; const wc = env === 'highway' ? [0.62, 0.62, 0.6] : [0.55, 0.55, 0.56];
        g.quad(P(i, lat, 0), P(j, lat, 0), P(j, lat, hgt), P(i, lat, hgt), wc);
        g.quad(P(i, lat, hgt), P(j, lat, hgt), P(j, lat + side * 0.35, hgt), P(i, lat + side * 0.35, hgt), wc);
        if (env !== 'highway') g.quad(P(i, lat + side * 0.35, hgt), P(j, lat + side * 0.35, hgt), P(j, lat + side * 0.35, 0), P(i, lat + side * 0.35, 0), wc);
      } else if (env === 'circuit') {
        // タイヤバリア
        const c = (Math.floor(i / 6) % 2) ? [0.9, 0.9, 0.9] : [0.85, 0.1, 0.1];
        g.quad(P(i, lat, 0), P(j, lat, 0), P(j, lat, 1.0), P(i, lat, 1.0), [0.08, 0.08, 0.08]);
        g.quad(P(i, lat - side * 0.02, 0.6), P(j, lat - side * 0.02, 0.6), P(j, lat - side * 0.02, 0.85), P(i, lat - side * 0.02, 0.85), c);
        // 縁石（コーナー）
        if (track.cornerAt[i] >= 0) { const cc = (Math.floor(i / 2) % 2) ? [0.95, 0.95, 0.95] : [0.85, 0.08, 0.08]; const r = ch(i).road; r.quad(P(i, side * hw, 0.03), P(i, side * (hw + 1.2), 0.03), P(j, side * (hw + 1.2), 0.03), P(j, side * hw, 0.03), snow ? [0.8, 0.5, 0.5] : cc); }
      }
    }
  }
  // 高速道路: 橋脚・遮音壁・標識
  if (env === 'highway') {
    for (let i = 0; i < n; i += 15) { const p = P(i, 0, 0), g = ch(i).scene; const h = p[1] - groundY; g.box(p[0], groundY + h / 2 - 0.6, p[2], 2.2, h, 2.2, [0.5, 0.5, 0.5], track.HD[i]); g.box(p[0], p[1] - 0.6, p[2], def.width + 3, 1.0, 2.5, [0.48, 0.48, 0.48], track.HD[i]); }
    // 路面裏
    for (let i = 0; i < n; i += 2) { const j = (i + 2) % n, g = ch(i).scene; g.quad(P(i, -wallOff - 0.4, -0.5), P(j, -wallOff - 0.4, -0.5), P(j, wallOff + 0.4, -0.5), P(i, wallOff + 0.4, -0.5), [0.4, 0.4, 0.42]); for (const s of [-1, 1]) g.quad(P(i, s * (wallOff + 0.35), -0.5), P(j, s * (wallOff + 0.35), -0.5), P(j, s * (wallOff + 0.35), 1.1), P(i, s * (wallOff + 0.35), 1.1), [0.55, 0.55, 0.55]); }
    for (let i = 40; i < n; i += 220) { const g = ch(i).scene, yaw = track.HD[i]; const a = P(i, -wallOff, 0), b = P(i, wallOff, 0); g.box(a[0], a[1] + 3.5, a[2], 0.4, 7, 0.4, [0.4, 0.42, 0.45], yaw); g.box(b[0], b[1] + 3.5, b[2], 0.4, 7, 0.4, [0.4, 0.42, 0.45], yaw); const m = P(i, 0, 7.2); g.box(m[0], m[1], m[2], def.width * 0.8, 2.2, 0.15, [0.05, 0.4, 0.2], yaw); const m2 = P(i, -def.width * 0.2, 7.2); g.box(m2[0], m2[1], m2[2] - 0.0, def.width * 0.3, 0.25, 0.17, [0.95, 0.95, 0.95], yaw); }
  }

  // 街灯
  const lampEvery = { mountain: 70, highway: 25, city: 15, port: 22, industrial: 22, coast: 60, circuit: 0, lot: 0 }[env];
  const lampCol = env === 'highway' || env === 'industrial' || env === 'port' ? [1, 0.72, 0.4] : env === 'city' ? [0.9, 0.95, 1] : [1, 0.85, 0.6];
  if (lampEvery) {
    for (let i = 5; i < n; i += lampEvery) {
      if (env === 'mountain' && track.cornerAt[i] < 0 && rng() < 0.5) continue;
      if (track.tunnel[i]) continue;
      const g = ch(i).scene; const sides = env === 'city' || env === 'highway' ? [(Math.floor(i / lampEvery) % 2) ? 1 : -1] : [track.innerRight[i] ? -1 : 1];
      for (const side of sides) {
        const base = P(i, side * (wallOff + 0.6), 0);
        g.cylY(base[0], base[1], base[2], 0.13, 0.1, 8, 6, [0.4, 0.42, 0.45], true);
        const arm = P(i, side * (wallOff - 1.4), 8);
        g.box((base[0] + arm[0]) / 2, arm[1], (base[2] + arm[2]) / 2, 0.15, 0.15, 2.2, [0.4, 0.42, 0.45], track.HD[i] + PI / 2);
        g.e = 1; g.box(arm[0], arm[1] - 0.15, arm[2], 0.5, 0.18, 0.9, lampCol, track.HD[i]); g.e = 0;
        const lp = [arm[0], arm[1] - 0.4, arm[2]]; lamps.push({ p: lp, c: lampCol }); addGlow(lp, 5, lampCol, 0.85);
      }
    }
  }

  // トンネル
  if (track.hasTunnel) {
    let started = -1;
    for (let i = 0; i < n; i++) {
      if (!track.tunnel[i]) continue;
      const j = (i + 1) % n, g = ch(i).scene; g.s = 0.12; const tc = [0.5, 0.48, 0.45];
      for (const s of [-1, 1]) { g.quad(P(i, s * wallOff, 0), P(j, s * wallOff, 0), P(j, s * wallOff, 4.8), P(i, s * wallOff, 4.8), tc); g.quad(P(i, s * wallOff, 4.8), P(j, s * wallOff, 4.8), P(j, s * hw * 0.5, 6.6), P(i, s * hw * 0.5, 6.6), [0.35, 0.34, 0.33]); g.quad(P(i, s * wallOff, 0.0), P(j, s * wallOff, 0.0), P(j, s * wallOff, 0.9), P(i, s * wallOff, 0.9), [0.85, 0.75, 0.2]); }
      g.quad(P(i, -hw * 0.5, 6.6), P(j, -hw * 0.5, 6.6), P(j, hw * 0.5, 6.6), P(i, hw * 0.5, 6.6), [0.3, 0.3, 0.3]);
      g.s = 1;
      if (i % 6 === 0) for (const s of [-1, 1]) { const p = P(i, s * hw * 0.55, 6.3); g.e = 1; g.box(p[0], p[1], p[2], 0.3, 0.12, 1.4, [1, 0.62, 0.25], track.HD[i]); g.e = 0; addGlow(p, 1.6, [1, 0.6, 0.25], 0.9); if (i % 18 === 0 && s > 0) tunnelLights.push({ p: [p[0], p[1] - 1, p[2]], c: [1, 0.6, 0.28] }); }
      if (!track.tunnel[(i - 1 + n) % n] || !track.tunnel[j]) { // 坑口
        const yaw = track.HD[i]; const p = P(i, 0, 0); g.box(p[0], p[1] + 9, p[2], def.width + 14, 6, 2, [0.55, 0.53, 0.5], yaw);
        for (const s of [-1, 1]) { const q = P(i, s * (wallOff + 4), 0); g.box(q[0], q[1] + 4, q[2], 7, 9, 2, [0.55, 0.53, 0.5], yaw); }
        // 山の盛り上がり
        if (env !== 'highway') { const out = !track.tunnel[(i - 1 + n) % n] ? -1 : 1; for (const s of [-1, 1]) { const q = P(i, s * (wallOff + 9), 0); g.box(q[0], q[1] + 6, q[2], 14, 14, 3, rock, yaw); } const tp = P(i, 0, 12.5); g.box(tp[0], tp[1], tp[2], def.width + 34, 5, 3, rock, yaw); }
      }
    }
  }

  // トンネルの上の山（坑口をふさがないよう、トンネル区間の上だけに盛る）
  if (track.hasTunnel && env !== 'highway') for (let i = 0; i < n; i += 2) {
    const j = (i + 2) % n; if (!track.tunnel[i] || !track.tunnel[j]) continue; const g = ch(i).scene;
    const prof = [[-(wallOff + 60), -14], [-(wallOff + 22), 6], [-(wallOff + 4), 13], [0, 16], [wallOff + 4, 13], [wallOff + 22, 6], [wallOff + 60, -14]];
    for (let k = 0; k < prof.length - 1; k++) { const [l0, h0] = prof[k], [l1, h1] = prof[k + 1]; g.quad(P(i, l0, h0), P(i, l1, h1), P(j, l1, h1), P(j, l0, h0), k === 0 || k === prof.length - 2 ? vary(grass, 0.1) : vary(mixc(grass, rock, 0.3), 0.08)); }
    if (rng() < 0.5 * dens) { const lat = (rng() - 0.5) * 2 * (wallOff + 18); const q = P(i, lat, 16 - Math.abs(lat) * 0.15); tree(g, q[0], q[1], q[2], 0.8 + rng() * 0.5); }
  }
  // コーナー警告標識
  if (env === 'mountain' || env === 'coast' || env === 'highway') {
    for (const c of track.corners) {
      const i = (c.start - 25 + n) % n; const side = c.dir > 0 ? 1 : -1; // 左コーナー→外側は右
      if (track.tunnel[i]) continue;
      const g = ch(i).scene, p = P(i, side * (wallOff + 0.8), 0), yaw = track.HD[i] + PI;
      g.cylY(p[0], p[1], p[2], 0.05, 0.05, 1.8, 4, [0.5, 0.5, 0.5], false);
      g.box(p[0], p[1] + 2.0, p[2], 1.3, 0.7, 0.05, [0.98, 0.78, 0.05], yaw);
      g.e = 0.25;
      const f = [Math.sin(yaw) * 0.04, Math.cos(yaw) * 0.04];
      for (let k = -1; k <= 1; k++) { const ox = Math.cos(yaw) * k * 0.35, oz = -Math.sin(yaw) * k * 0.35; g.box(p[0] + ox + f[0], p[1] + 2.0, p[2] + oz + f[1], 0.08, 0.5, 0.02, [0.05, 0.05, 0.05], yaw + (c.dir > 0 ? -0.5 : 0.5)); }
      g.e = 0;
    }
    // 速度標識
    for (let i = 100; i < n; i += 300) { const g = ch(i).scene; const side = track.innerRight[i] ? -1 : 1; const p = P(i, side * (wallOff + 0.8), 0); g.cylY(p[0], p[1], p[2], 0.05, 0.05, 2.0, 4, [0.5, 0.5, 0.5], false); const yaw = track.HD[i] + PI; g.box(p[0], p[1] + 2.3, p[2], 0.75, 0.75, 0.04, [0.85, 0.1, 0.1], yaw); g.box(p[0] + Math.sin(yaw) * 0.03, p[1] + 2.3, p[2] + Math.cos(yaw) * 0.03, 0.55, 0.55, 0.02, [0.95, 0.95, 0.95], yaw); }
  }

  // ---- 都市・港・工業・サーキット・テスト場 ----
  const placeAlong = (spacing, fn) => {
    for (let i = 0; i < n; i += spacing) for (const side of [-1, 1]) {
      const clear = side > 0 ? track.clearR[i] : track.clearL[i]; fn(i, side, clear);
    }
  };
  const building = (g, cx, cy, cz, w, d, h, yaw, col) => {
    const co = Math.cos(yaw), si = Math.sin(yaw);
    const C = (x, z) => [cx + x * co + z * si, cz - x * si + z * co];
    const pts = [C(-w / 2, -d / 2), C(w / 2, -d / 2), C(w / 2, d / 2), C(-w / 2, d / 2)];
    const sz = [w, d, w, d]; const TS = 28;
    for (let k = 0; k < 4; k++) {
      const a = pts[k], b = pts[(k + 1) % 4]; const u1 = sz[k] / TS, v1 = h / TS; const o = rng();
      g.quad([a[0], cy, a[1]], [b[0], cy, b[1]], [b[0], cy + h, b[1]], [a[0], cy + h, a[1]], col, [o, 0, o + u1, 0, o + u1, v1, o, v1]);
    }
    g.quad([pts[0][0], cy + h, pts[0][1]], [pts[1][0], cy + h, pts[1][1]], [pts[2][0], cy + h, pts[2][1]], [pts[3][0], cy + h, pts[3][1]], mixc(col, [0.3, 0.3, 0.3], 0.5), [0, 0, 0, 0, 0, 0, 0, 0]);
  };
  if (env === 'city' || env === 'highway') {
    const baseY = env === 'highway' ? groundY : track.minY;
    const neonCols = [[1, 0.1, 0.5], [0.1, 0.9, 1], [1, 0.8, 0.1], [0.6, 0.2, 1], [0.2, 1, 0.4]];
    placeAlong(env === 'city' ? 9 : 14, (i, side, clear) => {
      if (rng() > 0.85 * dens + 0.1) return;
      const dist = (env === 'city' ? wallOff + 4 : wallOff + 10) + rng() * 6; const w = 12 + rng() * 16, d = 12 + rng() * 14;
      if (dist + d > clear + wallOff - 2) return;
      const p = P(i, side * (dist + d / 2), 0); const h = (env === 'city' ? 14 : 18) + rng() * rng() * 70;
      const col = [[0.62, 0.62, 0.64], [0.45, 0.5, 0.58], [0.7, 0.66, 0.58], [0.35, 0.38, 0.44], [0.8, 0.8, 0.82]][Math.floor(rng() * 5)];
      building(ch(i).bld, p[0], baseY, p[2], w, d, h, track.HD[i], col);
      if ((env === 'city' || xmas) && rng() < 0.55) { // ネオン/イルミ
        const g = ch(i).scene; const c = xmas ? [[1, 0.15, 0.15], [0.2, 1, 0.3], [1, 0.85, 0.3]][Math.floor(rng() * 3)] : neonCols[Math.floor(rng() * neonCols.length)];
        const q = P(i, side * (dist - 0.3), 6 + rng() * 10); g.e = 1; g.box(q[0], q[1], q[2], 0.4, 1.5 + rng() * 3, 3 + rng() * 4, c, track.HD[i]); g.e = 0; addGlow(q, 6, c, 0.5);
      }
    });
    if (env === 'city') { // 歩道の街路樹
      for (let i = 3; i < n; i += 12) for (const s of [-1, 1]) { const p = P(i, s * (wallOff + 1.6), 0); if (rng() < 0.5 * dens) tree(ch(i).scene, p[0], p[1], p[2], 0.55); }
    }
  }
  if (env === 'port') {
    const cc = [[0.75, 0.15, 0.1], [0.1, 0.3, 0.7], [0.15, 0.5, 0.25], [0.85, 0.5, 0.1], [0.5, 0.5, 0.52], [0.9, 0.9, 0.9]];
    placeAlong(8, (i, side, clear) => {
      if (rng() > 0.6 * dens) return; const dist = wallOff + 3 + rng() * 10; if (dist + 14 > clear + wallOff) return;
      const g = ch(i).scene, yaw = track.HD[i] + (rng() < 0.3 ? PI / 2 : 0); const p = P(i, side * (dist + 6), 0); const stack = 1 + Math.floor(rng() * 4);
      for (let s = 0; s < stack; s++) g.box(p[0], p[1] + 1.3 + s * 2.6, p[2], 2.44, 2.59, rng() < 0.5 ? 6.1 : 12.2, vary(cc[Math.floor(rng() * cc.length)], 0.1), yaw);
    });
    for (let i = 30; i < n; i += 180) { // クレーン
      const side = track.innerRight[i] ? -1 : 1; const p = P(i, side * (wallOff + 35), 0), g = ch(i).scene, yaw = track.HD[i]; const cr = [0.9, 0.35, 0.1];
      for (const a of [-6, 6]) for (const b of [-5, 5]) { const q = [p[0] + Math.cos(yaw) * a + Math.sin(yaw) * b, p[2] - Math.sin(yaw) * a + Math.cos(yaw) * b]; g.box(q[0], p[1] + 15, q[1], 1, 30, 1, cr, yaw); }
      g.box(p[0], p[1] + 30, p[2], 14, 2, 12, cr, yaw); const bm = P(i, side * (wallOff + 15), 31); g.box(bm[0], bm[1], bm[2], 2, 1.5, 55, cr, yaw + PI / 2);
      addGlow([p[0], p[1] + 32, p[2]], 3, [1, 0.1, 0.1], 0.9);
    }
  }
  if (env === 'industrial') {
    placeAlong(16, (i, side, clear) => {
      if (rng() > 0.7 * dens) return; const dist = wallOff + 5 + rng() * 8; const w = 20 + rng() * 25, d = 18 + rng() * 20; if (dist + d > clear + wallOff - 2) return;
      const g = ch(i).scene, p = P(i, side * (dist + d / 2), 0), yaw = track.HD[i], h = 8 + rng() * 14;
      g.box(p[0], p[1] + h / 2, p[2], w, h, d, vary([0.55, 0.55, 0.58], 0.15), yaw, [0.4, 0.42, 0.45]);
      if (rng() < 0.5) { const q = P(i, side * (dist + d * 0.3), 0); const hh = 30 + rng() * 30; g.cylY(q[0] + 4, q[1], q[2], 1.6, 1.2, hh, 8, [0.75, 0.75, 0.75]); g.cylY(q[0] + 4, q[1] + hh - 6, q[2], 1.35, 1.25, 3, 8, [0.85, 0.15, 0.1]); addGlow([q[0] + 4, q[1] + hh + 0.5, q[2]], 2.5, [1, 0.1, 0.1], 1); }
      if (rng() < 0.4) { const q = P(i, side * (dist + d + 8), 0); g.cylY(q[0], q[1], q[2], 7, 7, 12, 12, [0.8, 0.8, 0.78]); }
    });
    for (let i = 0; i < n; i += 2) { if ((Math.floor(i / 120) % 2)) continue; const j = (i + 2) % n, g = ch(i).scene; const s = track.innerRight[i] ? -1 : 1; for (const [o, h, c] of [[wallOff + 2, 3.2, [0.7, 0.6, 0.2]], [wallOff + 2.8, 3.6, [0.55, 0.55, 0.6]]]) { g.quad(P(i, s * o, h), P(j, s * o, h), P(j, s * o, h + 0.6), P(i, s * o, h + 0.6), c); } if (i % 10 === 0) { const p = P(i, s * (wallOff + 2.4), 1.6); g.box(p[0], p[1], p[2], 0.25, 3.2, 0.25, [0.4, 0.4, 0.4], track.HD[i]); } }
  }
  if (env === 'circuit') {
    // グラベル
    for (let i = 0; i < n; i += 2) { if (track.cornerAt[i] < 0) continue; const j = (i + 2) % n, r = ch(i).road; const c = track.corners[track.cornerAt[i]]; const s = c.dir > 0 ? 1 : -1; r.quad(P(i, s * (hw + 1.2), 0.02), P(i, s * (wallOff - 0.3), 0.02), P(j, s * (wallOff - 0.3), 0.02), P(j, s * (hw + 1.2), 0.02), snow ? [0.9, 0.9, 0.92] : [0.7, 0.62, 0.45]); }
    // グランドスタンド＆ピット
    for (let k = -8; k <= 12; k += 4) { const i = (k * 4 + n) % n; const s = track.innerRight[i] ? 1 : -1; const g = ch(i).scene, yaw = track.HD[i]; for (let r = 0; r < 6; r++) { const p = P(i, s * (wallOff + 4 + r * 1.6), r * 1.1); g.box(p[0], p[1] + 0.5, p[2], 1.6, 1.0 + r * 0.0, 8, r % 2 ? [0.7, 0.7, 0.75] : [0.6, 0.6, 0.66], yaw + PI / 2 * 0); } const roof = P(i, s * (wallOff + 8), 9); g.box(roof[0], roof[1], roof[2], 11, 0.4, 8.2, [0.9, 0.9, 0.92], yaw); const pit = P(i, -s * (wallOff + 8), 0); g.box(pit[0], pit[1] + 3, pit[2], 10, 6, 8.2, [0.85, 0.85, 0.88], yaw, [0.6, 0.1, 0.1]); }
    for (let i = 0; i < n; i += 9) for (const s of [-1, 1]) { const p = P(i, s * (wallOff + 12 + rng() * 30), 0); if (rng() < 0.25 * dens) tree(ch(i).scene, p[0], groundY, p[2], 1); }
    for (let i = 0; i < n; i += 60) { const s = track.innerRight[i] ? -1 : 1; const g = ch(i).scene, p = P(i, s * (wallOff + 2), 0); g.cylY(p[0], p[1], p[2], 0.2, 0.15, 14, 6, [0.5, 0.5, 0.5]); g.e = 1; g.box(p[0], p[1] + 14, p[2], 2.2, 1.2, 0.4, [1, 1, 0.95], track.HD[i]); g.e = 0; const lp = [p[0], p[1] + 13.5, p[2]]; lamps.push({ p: lp, c: [1, 1, 0.95] }); addGlow(lp, 7, [1, 1, 0.95], 0.8); }
  }
  if (env === 'lot') {
    const S = def.open, y = 0.0; const g = G;
    g.quad([-S, y, -S], [S, y, -S], [S, y, S], [-S, y, S], snow ? [0.78, 0.8, 0.84] : wet ? [0.15, 0.15, 0.17] : [0.27, 0.27, 0.29]);
    for (let x = -S + 20; x < S - 20; x += 3) for (const z of [-S + 15, S - 15]) g.quad([x, 0.02, z - 2.5], [x + 0.12, 0.02, z - 2.5], [x + 0.12, 0.02, z + 2.5], [x, 0.02, z + 2.5], white);
    for (let i = 0; i < n; i++) { if (i % 4 > 1) continue; const j = (i + 1) % n; ch(i).road.quad(P(i, -0.15, 0.02), P(i, 0.15, 0.02), P(j, 0.15, 0.02), P(j, -0.15, 0.02), yellow); }
    for (let k = 0; k < 64; k++) { const a = k / 64 * TAU, b = (k + 1) / 64 * TAU, r = 25; g.quad([110 + Math.cos(a) * r, 0.02, Math.sin(a) * r], [110 + Math.cos(b) * r, 0.02, Math.sin(b) * r], [110 + Math.cos(b) * (r + 0.3), 0.02, Math.sin(b) * (r + 0.3)], [110 + Math.cos(a) * (r + 0.3), 0.02, Math.sin(a) * (r + 0.3)], white); }
    for (let k = 0; k < 10; k++) { const x = -120 + k * 14, z = -120; g.cylY(x, 0, z, 0.3, 0.03, 0.75, 8, [1, 0.4, 0.05]); }
    for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const len = 2 * S; const cx = a * S, cz = b * S; g.box(cx, 1, cz, a ? 0.5 : len, 2, b ? 0.5 : len, [0.5, 0.5, 0.52]); }
    for (let k = 0; k < 6; k++) { const x = -S + 30 + k * 55; g.box(x, 9, -S - 25, 40, 18, 30, vary([0.6, 0.6, 0.62], 0.2), 0, [0.3, 0.3, 0.32]); }
    for (let k = 0; k < 8; k++) { const x = -S + 20 + k * 45, z = S - 5; g.cylY(x, 0, z, 0.15, 0.12, 10, 6, [0.45, 0.45, 0.5]); g.e = 1; g.box(x, 10, z - 0.8, 0.6, 0.2, 1.4, [1, 0.95, 0.85]); g.e = 0; lamps.push({ p: [x, 9.6, z - 1], c: [1, 0.95, 0.85] }); addGlow([x, 9.6, z - 1], 5, [1, 0.95, 0.85], 0.8); }
  }

  // ---- クリスマス装飾 ----
  if (xmas) {
    const cols = [[1, 0.1, 0.1], [0.1, 1, 0.3], [1, 0.85, 0.2], [0.3, 0.6, 1], [1, 1, 1]];
    for (let i = 0; i < n; i += 2) { // 道路沿いのイルミネーション
      for (const s of [-1, 1]) { const p = P(i, s * (wallOff + 0.2), 1.1 + 0.25 * Math.sin(i * 0.4)); addGlow(p, 0.7, cols[(i / 2 + (s > 0 ? 2 : 0)) % cols.length], 1); }
    }
    for (let i = 60; i < n; i += 160) { // 光のアーチ
      const g = ch(i).scene; for (let k = 0; k <= 24; k++) { const a = k / 24 * PI; const lat = Math.cos(a) * (wallOff + 0.5), h = Math.sin(a) * 6.5; const p = P(i, lat, h); g.e = 1; g.box(p[0], p[1], p[2], 0.3, 0.3, 0.3, cols[k % cols.length], track.HD[i]); g.e = 0; addGlow(p, 1.4, cols[k % cols.length], 1); }
    }
    if (def.xmas) {
    // 巨大クリスマスツリー
    const ti = Math.floor(n * 0.04); const side = track.innerRight[ti] ? -1 : 1; const tp = P(ti, side * (wallOff + 26), 0);
    const tg = G; tg.cylY(tp[0], tp[1] - 0.5, tp[2], 1.4, 1.2, 4, 8, [0.35, 0.22, 0.12]);
    for (let k = 0; k < 5; k++) tg.cylY(tp[0], tp[1] + 3 + k * 5.5, tp[2], 11 - k * 2, 0.5, 9, 12, k % 2 ? [0.06, 0.32, 0.14] : [0.08, 0.38, 0.16]);
    tg.e = 1; tg.sphere(tp[0], tp[1] + 33.5, tp[2], 1.6, [1, 0.85, 0.2], 5); tg.e = 0; addGlow([tp[0], tp[1] + 33.5, tp[2]], 14, [1, 0.85, 0.3], 1);
    for (let k = 0; k < 160; k++) { const h = rng() * 30, r = (11 - h / 3) * 0.95, a = rng() * TAU; addGlow([tp[0] + Math.cos(a) * r, tp[1] + 3 + h, tp[2] + Math.sin(a) * r], 1.8, cols[k % cols.length], 1); }
    lamps.push({ p: [tp[0], tp[1] + 10, tp[2]], c: [1, 0.7, 0.4] });
    // 雪だるま
    for (let k = 0; k < 6; k++) { const i = Math.floor(rng() * n); const s = track.innerRight[i] ? 1 : -1; const p = P(i, s * (wallOff + 3), 0); const g = ch(i).scene; g.sphere(p[0], p[1] + 0.7, p[2], 0.75, [0.95, 0.95, 0.98], 5); g.sphere(p[0], p[1] + 1.8, p[2], 0.5, [0.95, 0.95, 0.98], 5); g.box(p[0], p[1] + 1.8, p[2], 0.1, 0.1, 1.08, [1, 0.5, 0.1]); }
    }
  }

  // ================= v3.0 新マップ専用の景観 =================
  const yawAt = i => track.HD[((i % n) + n) % n];
  const outSide = i => track.innerRight[((i % n) + n) % n] ? -1 : 1;
  const sgn = (g, i, side, lat, h, w, hh, col, e = 0) => { const p = P(i, side * lat, h); g.e = e; g.box(p[0], p[1], p[2], w, hh, 0.06, col, yawAt(i) + PI); g.e = 0; return p; };
  if (def.pass) {
    // カーブミラー（タイトコーナーの外側、頂点の少し手前）
    for (const c of track.corners) {
      if (c.R > 75) continue; const i = (c.apex - 5 + n) % n; if (track.tunnel[i]) continue;
      const side = c.dir > 0 ? 1 : -1, g = ch(i).scene, b = P(i, side * (wallOff + 1.1), 0);
      g.cylY(b[0], b[1], b[2], 0.06, 0.06, 2.9, 5, [0.95, 0.45, 0.08], false);
      const yaw = yawAt(i) + PI - side * 0.6, f = [Math.sin(yaw) * 0.05, Math.cos(yaw) * 0.05];
      g.box(b[0], b[1] + 3.2, b[2], 0.95, 0.95, 0.08, [0.95, 0.45, 0.08], yaw);
      g.e = 0.35; g.box(b[0] + f[0], b[1] + 3.2, b[2] + f[1], 0.78, 0.78, 0.04, [0.62, 0.72, 0.8], yaw); g.e = 0;
      if (c.type === 'ヘアピン' && rng() < 0.6) { const b2 = P(c.apex + 4, side * (wallOff + 1.1), 0); g.cylY(b2[0], b2[1], b2[2], 0.06, 0.06, 2.9, 5, [0.95, 0.45, 0.08], false); g.box(b2[0], b2[1] + 3.2, b2[2], 0.95, 0.95, 0.08, [0.95, 0.45, 0.08], yawAt(c.apex + 4) + PI + side * 0.6); }
    }
    // 矢印板（ヘアピン・タイトコーナーの外側）
    for (const c of track.corners) {
      if (c.R > 50) continue; const side = c.dir > 0 ? 1 : -1;
      for (let i = c.start; ; i = (i + 5) % n) {
        if (!track.tunnel[i]) { const g = ch(i).scene, p = P(i, side * (wallOff + 0.35), 0), yaw = yawAt(i) + PI;
          g.box(p[0], p[1] + 0.55, p[2], 0.07, 1.1, 0.07, [0.55, 0.56, 0.58], yaw);
          g.e = night ? 0.45 : 0.1; g.box(p[0], p[1] + 1.35, p[2], 0.75, 0.55, 0.05, [0.08, 0.22, 0.7], yaw);
          const f = [Math.sin(yaw) * 0.04, Math.cos(yaw) * 0.04], cx = Math.cos(yaw), cz = -Math.sin(yaw);
          for (const o of [-0.16, 0.12]) { const q = [p[0] + f[0] + cx * o * side * -1, p[1] + 1.35, p[2] + f[1] + cz * o * side * -1]; g.box(q[0], q[1] + 0.1, q[2], 0.07, 0.26, 0.02, [0.95, 0.95, 0.95], yaw, null); g.box(q[0], q[1] - 0.1, q[2], 0.07, 0.26, 0.02, [0.95, 0.95, 0.95], yaw); }
          g.e = 0; }
        if (((c.end - i + n) % n) < 5) break;
      }
    }
    // スタート/ゴール：計測小屋・のぼり旗
    { const s = outSide(10), g = ch(10).scene; const b = P(14, s * (wallOff + 5), 0); g.box(b[0], b[1] + 1.4, b[2], 3.2, 2.8, 4, [0.85, 0.85, 0.82], yawAt(14)); g.box(b[0], b[1] + 2.95, b[2], 3.8, 0.3, 4.6, [0.25, 0.27, 0.3], yawAt(14));
      const w = P(14, s * (wallOff + 3.35), 1.7); g.e = 1; g.box(w[0], w[1], w[2], 0.05, 0.8, 2.6, [1, 0.9, 0.6], yawAt(14)); g.e = 0; addGlow(w, 3, [1, 0.85, 0.5], 0.6); lamps.push({ p: [w[0], w[1] + 1, w[2]], c: [1, 0.85, 0.6] });
      for (let k = -14; k <= 30; k += 6) for (const sd of [-1, 1]) { const q = P(k, sd * (wallOff + 1.6), 0); g.cylY(q[0], q[1], q[2], 0.04, 0.04, 3.4, 4, [0.6, 0.6, 0.6], false); const fl = P(k, sd * (wallOff + 1.6) , 2.6); g.box(fl[0], fl[1], fl[2], 0.03, 1.5, 0.6, (k / 6) % 2 ? [0.9, 0.12, 0.12] : [0.95, 0.95, 0.95], yawAt(k)); } }
    // 駐車場・展望台
    if (def.park) {
      const i0 = Math.floor(def.park[0] * n), m = Math.floor(def.park[1] / STEP), side = outSide(i0 + (m >> 1)); const L0 = wallOff + 0.5, L1 = wallOff + 24;
      track.parkZone = { i0, m, side };
      for (let k = 0; k < m; k += 2) {
        const i = i0 + k, j = i + 2, g = ch(i).scene; const a = side > 0 ? [L0, L1] : [-L1, -L0];
        g.quad(P(i, a[0], -0.05), P(i, a[1], -0.05), P(j, a[1], -0.05), P(j, a[0], -0.05), [0.2, 0.2, 0.22]);
        const e0 = P(i, side * L1, -0.05), e1 = P(j, side * L1, -0.05); g.quad(e0, e1, [e1[0], e1[1] - 7, e1[2]], [e0[0], e0[1] - 7, e0[2]], [0.45, 0.43, 0.4]);
        if (k > 4 && k < m - 6 && k % 4 === 0) { const c0 = P(i, side * (L0 + 4), 0.0), c1 = P(i, side * (L0 + 10), 0.0); g.quad([c0[0], c0[1] + 0.01, c0[2]], [c1[0], c1[1] + 0.01, c1[2]], [c1[0] + track.TX[i % n] * 0.15, c1[1] + 0.01, c1[2] + track.TZ[i % n] * 0.15], [c0[0] + track.TX[i % n] * 0.15, c0[1] + 0.01, c0[2] + track.TZ[i % n] * 0.15], white); }
        // 手すり（外周）
        const h0 = P(i, side * (L1 - 0.3), 1.0), h1 = P(j, side * (L1 - 0.3), 1.0); g.quad(h0, h1, [h1[0], h1[1] + 0.08, h1[2]], [h0[0], h0[1] + 0.08, h0[2]], [0.75, 0.75, 0.72]);
        if (k % 4 === 0) { const q = P(i, side * (L1 - 0.3), 0); g.box(q[0], q[1] + 0.5, q[2], 0.08, 1.0, 0.08, [0.6, 0.6, 0.6], yawAt(i)); }
      }
      const mid = i0 + (m >> 1), g = ch(mid).scene, yaw = yawAt(mid);
      // 休憩所・自販機
      const hut = P(i0 + 8, side * (wallOff + 17), 0); g.box(hut[0], hut[1] + 1.6, hut[2], 6, 3.2, 9, [0.72, 0.66, 0.56], yaw); g.box(hut[0], hut[1] + 3.35, hut[2], 7, 0.35, 10, [0.3, 0.22, 0.18], yaw);
      for (let v = 0; v < 3; v++) { const q = P(i0 + 14 + v * 0.7, side * (wallOff + 14.5), 0); const col = [[0.9, 0.1, 0.12], [0.1, 0.35, 0.85], [0.95, 0.95, 0.95]][v]; g.box(q[0], q[1] + 0.95, q[2], 0.9, 1.9, 0.8, col, yaw); const fq = P(i0 + 14 + v * 0.7, side * (wallOff + 14.05), 1.2); g.e = 1; g.box(fq[0], fq[1], fq[2], 0.05, 0.9, 0.6, [0.95, 0.97, 1], yaw); g.e = 0; addGlow(fq, 2.2, [0.85, 0.92, 1], 0.7); }
      // 展望デッキ・望遠鏡・案内板
      const dk = P(i0 + m - 10, side * (L1 - 3), 0); g.box(dk[0], dk[1] + 0.1, dk[2], 7, 0.2, 9, [0.48, 0.34, 0.22], yaw);
      for (const o of [-2, 2]) { const t = P(i0 + m - 10 + o, side * (L1 - 1.6), 0); g.cylY(t[0], t[1], t[2], 0.08, 0.08, 1.1, 5, [0.4, 0.4, 0.42], false); g.box(t[0], t[1] + 1.25, t[2], 0.25, 0.25, 0.6, [0.2, 0.45, 0.3], yaw + side * PI / 2); }
      const bd = P(i0 + 3, side * (wallOff + 2.5), 0); g.cylY(bd[0], bd[1], bd[2], 0.07, 0.07, 2.2, 4, [0.5, 0.5, 0.5], false); g.box(bd[0], bd[1] + 2.4, bd[2], 1.6, 1.0, 0.06, [0.1, 0.3, 0.8], yawAt(i0 + 3) + PI); g.e = 0.6; g.box(bd[0] + Math.sin(yawAt(i0 + 3) + PI) * 0.04, bd[1] + 2.4, bd[2] + Math.cos(yawAt(i0 + 3) + PI) * 0.04, 0.6, 0.6, 0.02, [0.95, 0.95, 0.95], yawAt(i0 + 3) + PI); g.e = 0;
      for (const k of [6, m - 16]) { const b = P(i0 + k, side * (wallOff + 9), 0); g.cylY(b[0], b[1], b[2], 0.12, 0.09, 7, 6, [0.4, 0.42, 0.45], true); const lp = [b[0], b[1] + 7, b[2]]; g.e = 1; g.box(lp[0], lp[1], lp[2], 0.5, 0.2, 0.5, [1, 0.9, 0.7], yaw); g.e = 0; addGlow(lp, 6, [1, 0.85, 0.6], 0.85); lamps.push({ p: [lp[0], lp[1] - 0.4, lp[2]], c: [1, 0.85, 0.6] }); }
    }
  }
  if (def.metro) {
    const inR = (i, rs) => rs && rs.some(r => { const f = i / n; return r[0] <= r[1] ? f >= r[0] && f <= r[1] : f >= r[0] || f <= r[1]; });
    // 遮音壁
    for (let i = 0; i < n; i += 2) {
      if (!inR(i, def.walls) || track.tunnel[i]) continue; const j = (i + 2) % n, g = ch(i).scene;
      for (const s of [-1, 1]) { const l = s * (wallOff + 0.15); g.quad(P(i, l, 1.1), P(j, l, 1.1), P(j, l + s * 0.25, 4.4), P(i, l + s * 0.25, 4.4), [0.52, 0.6, 0.64]); g.quad(P(i, l + s * 0.25, 4.4), P(j, l + s * 0.25, 4.4), P(j, l + s * 0.45, 4.5), P(i, l + s * 0.45, 4.5), [0.4, 0.42, 0.45]);
        if (i % 8 === 0) { const q = P(i, l + s * 0.12, 0); g.box(q[0], q[1] + 2.4, q[2], 0.22, 4.6, 0.22, [0.35, 0.36, 0.38], yawAt(i)); } }
    }
    // ゲート（料金所風）
    for (const gf of def.gates || []) {
      const i0 = Math.floor(gf * n), g = ch(i0).scene, yaw = yawAt(i0); const W = 2 * wallOff + 22; const c = P(i0, 0, 7.4);
      g.box(c[0], c[1], c[2], W, 0.9, 16, [0.82, 0.83, 0.85], yaw); g.box(c[0], c[1] + 0.6, c[2], W - 1, 0.3, 15, [0.3, 0.55, 0.85], yaw);
      g.e = 1; for (let k = -6; k <= 6; k += 3) { const q = P(i0 + k, 0, 6.9); g.box(q[0], q[1], q[2], W - 4, 0.08, 0.4, [0.95, 0.97, 1], yaw); addGlow(q, 7, [0.9, 0.95, 1], 0.5); } g.e = 0;
      for (const s of [-1, 1]) for (const k of [-6, 6]) { const q = P(i0 + k, s * (wallOff + 2), 0); g.box(q[0], q[1] + 3.5, q[2], 0.9, 7, 0.9, [0.7, 0.7, 0.72], yaw); }
      for (const s of [-1, 1]) for (const d of [5, 9.5]) { const q = P(i0, s * (wallOff + d), 0); g.box(q[0], q[1] + 1.3, q[2], 2.2, 2.6, 5.5, [0.88, 0.88, 0.86], yaw); const w = P(i0, s * (wallOff + d - 1.12), 1.6); g.e = 1; g.box(w[0], w[1], w[2], 0.05, 0.9, 3.4, [1, 0.92, 0.7], yaw); g.e = 0; }
      const lanes = Math.round(def.width / 3.6); for (let l = 0; l < lanes; l++) { const lat = -hw + (l + 0.5) * def.width / lanes; const q = P(i0 - 7, lat, 6.4); g.e = 1; g.box(q[0], q[1], q[2], 1.6, 0.7, 0.12, [0.55, 0.2, 0.85], yaw); const sg = P(i0 - 7, lat + 1.1, 5.7); g.box(sg[0], sg[1], sg[2], 0.3, 0.3, 0.15, [0.1, 1, 0.4], yaw); g.e = 0; addGlow(sg, 1.6, [0.2, 1, 0.45], 1); addGlow(q, 2.4, [0.6, 0.3, 1], 0.5); }
      for (let k = -24; k <= -12; k += 3) { const r = ch(i0 + k).road; r.quad(P(i0 + k, -hw + 0.4, 0.025), P(i0 + k, hw - 0.4, 0.025), P(i0 + k + 0.35, hw - 0.4, 0.025), P(i0 + k + 0.35, -hw + 0.4, 0.025), [0.85, 0.85, 0.85]); }
      lamps.push({ p: P(i0, 0, 6.6), c: [0.9, 0.95, 1] });
    }
    // JCT：分岐ランプ（本線は直進）と案内標識
    const greenSign = (g, i, lat, h, w, arrowDir) => { const p = P(i, lat, h), yaw = yawAt(i) + PI; g.e = night ? 0.45 : 0.2; g.box(p[0], p[1], p[2], w, 2.3, 0.14, [0.04, 0.42, 0.22], yaw); g.e = night ? 0.9 : 0.5;
      const f = [Math.sin(yaw) * 0.09, Math.cos(yaw) * 0.09], cx = Math.cos(yaw), cz = -Math.sin(yaw);
      for (let r = 0; r < 2; r++) { const q = [p[0] + f[0] - cx * 0.4, p[1] + 0.5 - r * 0.55, p[2] + f[1] - cz * 0.4]; g.box(q[0], q[1], q[2], w * 0.55, 0.22, 0.02, [0.95, 0.97, 0.95], yaw); }
      const a = [p[0] + f[0] + cx * (w * 0.33), p[1] - 0.15, p[2] + f[1] + cz * (w * 0.33)]; g.box(a[0], a[1], a[2], 0.18, 1.2, 0.02, [0.95, 0.97, 0.95], yaw); g.box(a[0] + cx * arrowDir * 0.18, a[1] + 0.45, a[2] + cz * arrowDir * 0.18, 0.16, 0.6, 0.02, [0.95, 0.97, 0.95], yaw + arrowDir * 0.7); g.e = 0; };
    (track.jcts || []).forEach((J, jn) => {
      const { i: i0, side } = J, m = Math.floor(J.len / STEP), ext = Math.floor(m * 1.7), hwB = 3.9, up = jn % 2 === 0 ? 1 : -0.6;
      const latC = k => side * (wallOff + 0.5 + hwB + Math.pow(k / m, 2) * 42), hB = k => up * Math.pow(k / m, 2) * 8;
      for (let k = 0; k < ext; k += 2) {
        const i = i0 + k, j = i0 + k + 2, g = ch(i).scene, r = ch(i).road; const c0 = latC(k), c1 = latC(k + 2), y0 = hB(k), y1 = hB(k + 2);
        r.quad(P(i, c0 - hwB, y0), P(i, c0 + hwB, y0), P(j, c1 + hwB, y1), P(j, c1 - hwB, y1), vary(asphalt, 0.04));
        for (const e of [-1, 1]) { const a0 = c0 + e * (hwB - 0.3), a1 = c1 + e * (hwB - 0.3); r.quad(P(i, a0 - 0.08, y0 + 0.02), P(i, a0 + 0.08, y0 + 0.02), P(j, a1 + 0.08, y1 + 0.02), P(j, a1 - 0.08, y1 + 0.02), white);
          const w0 = c0 + e * (hwB + 0.6), w1 = c1 + e * (hwB + 0.6); g.quad(P(i, w0, y0), P(j, w1, y1), P(j, w1, y1 + 1.1), P(i, w0, y0 + 1.1), [0.62, 0.62, 0.6]); }
        g.quad(P(i, c0 - hwB - 0.6, y0 - 0.5), P(j, c1 - hwB - 0.6, y1 - 0.5), P(j, c1 + hwB + 0.6, y1 - 0.5), P(i, c0 + hwB + 0.6, y0 - 0.5), [0.4, 0.4, 0.42]);
        if (k > 6 && k % 14 === 0) { const q = P(i, c0, y0); const hh = q[1] - groundY; g.box(q[0], groundY + hh / 2 - 0.6, q[2], 1.8, hh, 1.8, [0.5, 0.5, 0.5], yawAt(i)); }
        if (k < 26 && k % 4 === 0) { const q0 = P(i, c0 - side * hwB, y0 + 0.03), q1 = P(i + 2, c0 - side * (hwB - 2.2), y0 + 0.03); r.quad(q0, [q0[0] + (q1[0] - q0[0]) * 0.2, q0[1], q0[2] + (q1[2] - q0[2]) * 0.2], q1, [q1[0] - (q1[0] - q0[0]) * 0.2, q1[1], q1[2] - (q1[2] - q0[2]) * 0.2], white); }
        if (k % 25 === 0 && k > 0) { const q = P(i, c0 + side * (hwB + 0.8), y0); g.cylY(q[0], q[1], q[2], 0.1, 0.08, 7, 5, [0.4, 0.42, 0.45], true); const lp = P(i, c0 + side * (hwB - 1), y0 + 7); g.e = 1; g.box(lp[0], lp[1], lp[2], 0.5, 0.18, 0.9, lampCol, yawAt(i)); g.e = 0; addGlow(lp, 4.5, lampCol, 0.8); }
      }
      // 案内標識（300m前・100m前・分岐点）
      for (const back of [150, 50]) {
        const i = (i0 - back + n) % n, g = ch(i).scene, yaw = yawAt(i); for (const s of [-1, 1]) { const q = P(i, s * (wallOff + 0.6), 0); g.box(q[0], q[1] + 3.8, q[2], 0.35, 7.6, 0.35, [0.5, 0.52, 0.55], yaw); }
        const bm = P(i, 0, 7.4); g.box(bm[0], bm[1], bm[2], 2 * wallOff + 1.2, 0.3, 0.3, [0.5, 0.52, 0.55], yaw);
        greenSign(g, i, side * hw * 0.55, 6.1, 4.2, side); greenSign(g, i, -side * hw * 0.35, 6.1, 4.8, 0);
      }
      { const i = i0 + 4, g = ch(i).scene, p = P(i, side * (wallOff + 0.5), 0), yaw = yawAt(i) + PI; g.box(p[0], p[1] + 0.6, p[2], 1.2, 1.2, 0.12, [0.95, 0.72, 0.05], yaw); g.e = 0.6; g.box(p[0], p[1] + 0.6, p[2], 0.25, 0.9, 0.16, [0.1, 0.1, 0.1], yaw + 0.8 * side); g.e = 0; addGlow(P(i, side * (wallOff + 0.5), 1.4), 1.4, [1, 0.6, 0.1], 0.9); }
    });
    // 高層ビル群・屋上・ネオン看板
    const jctBlock = (i, side) => (track.jcts || []).some(J => J.side === side && ((i - J.i + n) % n) < J.len / STEP * 1.8 + 10);
    const neon = [[1, 0.1, 0.5], [0.1, 0.9, 1], [1, 0.75, 0.1], [0.6, 0.25, 1], [0.2, 1, 0.45], [1, 0.3, 0.1]];
    placeAlong(6, (i, side, clear) => {
      if (track.tunnel[i] || jctBlock(i, side)) return; const dense = inR(i, def.dense); if (rng() > (dense ? 0.95 : 0.6) * dens + 0.05) return;
      const dist = wallOff + (inR(i, def.walls) ? 5 : 3) + rng() * (dense ? 3 : 10), w = 10 + rng() * 14, d = 10 + rng() * 12;
      if (dist + d > clear + wallOff - 2) return;
      const p = P(i, side * (dist + d / 2), 0), yaw = yawAt(i); const h = (dense ? 40 : 22) + rng() * rng() * (dense ? 120 : 70) + (Y[i] - groundY);
      const col = [[0.62, 0.64, 0.68], [0.36, 0.42, 0.52], [0.72, 0.68, 0.6], [0.28, 0.3, 0.36], [0.82, 0.82, 0.84], [0.5, 0.56, 0.6]][Math.floor(rng() * 6)];
      building(ch(i).bld, p[0], groundY, p[2], w, d, h, yaw, col);
      const g = ch(i).scene, top = groundY + h;
      if (rng() < 0.5) g.cylY(p[0] + (rng() - 0.5) * w * 0.4, top, p[2] + (rng() - 0.5) * d * 0.4, 1.4, 1.4, 2.4, 8, [0.55, 0.55, 0.58]);
      if (rng() < 0.5) g.box(p[0], top + 1.2, p[2], w * 0.5, 2.4, d * 0.4, mixc(col, [0.2, 0.2, 0.2], 0.4), yaw);
      if (h > 60) { g.cylY(p[0], top, p[2], 0.15, 0.08, 9, 4, [0.6, 0.6, 0.6], false); addGlow([p[0], top + 9.2, p[2]], 2.8, [1, 0.08, 0.05], 1); if (rng() < 0.6) { g.e = 1; const c2 = rng() < 0.5 ? [0.95, 0.95, 1] : neon[Math.floor(rng() * neon.length)]; g.box(p[0], top - 1.2, p[2], w + 0.1, 0.5, d + 0.1, c2, yaw); g.e = 0; } }
      if (rng() < (dense ? 0.75 : 0.45)) { const c = neon[Math.floor(rng() * neon.length)], hh = Math.min(h - 4, Y[i] - groundY + 4 + rng() * 14); const q = P(i, side * (dist - 0.25), 0); q[1] = groundY + hh; g.e = 1; g.box(q[0], q[1], q[2], 0.3, 2 + rng() * 4, 4 + rng() * 6, c, yaw); g.e = 0; addGlow(q, 7, c, 0.55); }
    });
    // 地上の街明かり（高架下の一般道）
    for (let i = 0; i < n; i += 9) for (const s of [-1, 1]) { if (track.tunnel[i]) continue; const q = P(i, s * (wallOff + 2), 0); q[1] = groundY + 0.1; addGlow([q[0], groundY + 6, q[2]], 4, [1, 0.75, 0.45], 0.55); }
  }
  // トンネル内装（新マップ）：ジェットファン・非常口灯
  if (def.tunnels) for (let i = 0; i < n; i++) {
    if (!track.tunnel[i]) continue; const g = ch(i).scene;
    if (i % 50 === 0) { const q = P(i, 0, 6.0); g.cylY(q[0], q[1] - 0.6, q[2], 0.6, 0.6, 1.2, 8, [0.6, 0.62, 0.64]); }
    if (i % 40 === 20) for (const s of [-1, 1]) { const q = P(i, s * (wallOff - 0.05), 2.4); g.e = 1; g.box(q[0], q[1], q[2], 0.05, 0.4, 0.9, [0.1, 0.9, 0.4], yawAt(i)); g.e = 0; addGlow(q, 1.2, [0.2, 1, 0.45], 0.9); }
    if (i % 2 === 0) { const j = (i + 2) % n; for (const s of [-1, 1]) g.quad(P(i, s * wallOff, 1.6), P(j, s * wallOff, 1.6), P(j, s * wallOff, 1.75), P(i, s * wallOff, 1.75), [0.25, 0.55, 0.85]); }
  }

  // ---- メッシュ化 ----
  const out = { chunks: [], lamps, tunnelLights, groundY, seaY };
  // ジャンプ台
  if (track.ramps) for (const r of track.ramps) {
    const w = hw + 0.3, top = (k) => r.h * Math.min(1, k / r.m), last = r.m + r.tn; const yel = [0.95, 0.72, 0.05], blk = [0.08, 0.08, 0.09], wood = [0.45, 0.3, 0.16];
    for (let k = 0; k < last; k++) { const i0 = r.i + k, i1 = r.i + k + 1, h0 = top(k) + 0.02, h1 = top(k + 1) + 0.02; const c = k % 2 ? yel : blk;
      const a = P(i0, -w, h0), b = P(i0, w, h0), c1 = P(i1, w, h1), d = P(i1, -w, h1); G.quad(a, b, c1, d, c); G.quad(d, c1, b, a, c);
      for (const s of [-1, 1]) { const p0 = P(i0, s * w, 0), p1 = P(i1, s * w, 0), q1 = P(i1, s * w, h1), q0 = P(i0, s * w, h0); G.quad(p0, p1, q1, q0, wood); G.quad(q0, q1, p1, p0, wood); } }
    { const e = r.i + last, a = P(e, -w, 0), b = P(e, w, 0), c1 = P(e, w, r.h + 0.02), d = P(e, -w, r.h + 0.02); G.quad(a, b, c1, d, wood); G.quad(d, c1, b, a, wood); }
    for (const s of [-1, 1]) { const p = P(r.i - 4, s * (hw + 1.6), 0); G.box(p[0], p[1] + 1.6, p[2], 0.18, 3.2, 0.18, [0.9, 0.9, 0.9]); const q = P(r.i - 4, s * (hw + 1.6), 3.1); G.box(q[0], q[1], q[2], 1.2, 0.5, 0.12, [0.9, 0.1, 0.05], track.HD[(r.i - 4 + n) % n]); addGlow([q[0], q[1] + 0.4, q[2]], 0.8, [1, 0.6, 0.1]); }
  }
  const gmesh = new Mesh(R.gl, G.a);
  out.global = gmesh; out.water = water.count ? new Mesh(R.gl, water.a) : null;
  for (let c = 0; c < nch; c++) {
    const k = chunks[c]; const o = {};
    o.road = k.road.count ? new Mesh(R.gl, k.road.a) : null;
    o.scene = k.scene.count ? new Mesh(R.gl, k.scene.a) : null;
    o.bld = k.bld.count ? new Mesh(R.gl, k.bld.a) : null;
    out.chunks.push(o);
  }
  out.glow = new StaticPoints(R.gl, glow);
  out.mats = {
    road: Mat({ refl: wet ? 0.55 : snow ? 0.08 : 0.02, spec: wet ? 0.8 : 0.08, shin: wet ? 80 : 30 }),
    scene: Mat({ spec: 0.06, shin: 16 }),
    bld: Mat({ tex: windowTexture(R), texMode: 2, spec: 0.2, shin: 40, refl: 0.08, night: night ? 1 : 0 }),
    water: Mat({ refl: 0.85, spec: 1.2, shin: 120 }),
    global: Mat({ spec: 0.02 })
  };
  out.dispose = () => { gmesh.dispose(); if (out.water) out.water.dispose(); out.glow.dispose(); for (const c of out.chunks) for (const k of ['road', 'scene', 'bld']) if (c[k]) c[k].dispose(); };
  return out;
}
