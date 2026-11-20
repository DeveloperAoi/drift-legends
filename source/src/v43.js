// =====================================================================
// v43.js — 新マップ「大阪 住之江・南港口」
//   ユーザー提供の地図（住之江区 南港口〜平林）をもとに道路・建物を配置。
//   ニュートラム（南港ポートタウン線）の南港口駅・平林駅、平林貯木場の池、大和川、
//   阪神高速4号湾岸線、府立高校、団地、コンビニ、ガソリンスタンド、物流倉庫、工場など。
//   座標は提供画像のピクセル（1px ≒ 0.85m）。
// =====================================================================
const NK = (() => {
  const S = 0.85;
  // 走るルート（時計回り）：南港口の大通り → 平林へ斜めに → 南へ → 大和川沿いを西へ → 北へ
  const path = [[240, 440], [1000, 440], [2030, 816], [1952, 1238], [1400, 1045], [950, 895], [620, 738], [240, 736]];
  const rad = [26, 70, 26, 24, 90, 70, 70, 26];
  const P = path.map(([x, y]) => [x * S, y * S]); const out = [];
  const n = P.length; const corners = [];
  for (let i = 0; i < n; i++) { const a = P[(i - 1 + n) % n], b = P[i], c = P[(i + 1) % n];
    const u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]], lu = Math.hypot(...u), lv = Math.hypot(...v); u[0] /= lu; u[1] /= lu; v[0] /= lv; v[1] /= lv;
    const ang = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1]))), t = rad[i] / Math.tan(ang / 2);
    const p1 = [b[0] + u[0] * t, b[1] + u[1] * t], p2 = [b[0] + v[0] * t, b[1] + v[1] * t];
    const bis = [u[0] + v[0], u[1] + v[1]], lb = Math.hypot(...bis); const ctr = [b[0] + bis[0] / lb * rad[i] / Math.sin(ang / 2), b[1] + bis[1] / lb * rad[i] / Math.sin(ang / 2)];
    corners.push({ p1, p2, ctr, r: rad[i] }); }
  for (let i = 0; i < n; i++) { const c = corners[i], nx = corners[(i + 1) % n];
    let a0 = Math.atan2(c.p1[1] - c.ctr[1], c.p1[0] - c.ctr[0]), a1 = Math.atan2(c.p2[1] - c.ctr[1], c.p2[0] - c.ctr[0]); let da = a1 - a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
    const m = Math.max(2, Math.ceil(Math.abs(da) * c.r / 4)); for (let k = 0; k <= m; k++) { const a = a0 + da * k / m; out.push([c.ctr[0] + Math.cos(a) * c.r, c.ctr[1] + Math.sin(a) * c.r]); }
    const L = Math.hypot(nx.p1[0] - c.p2[0], nx.p1[1] - c.p2[1]), ms = Math.ceil(L / 7); for (let k = 1; k < ms; k++) out.push([c.p2[0] + (nx.p1[0] - c.p2[0]) * k / ms, c.p2[1] + (nx.p1[1] - c.p2[1]) * k / ms]); }
  // スタート地点（南港口の大通り x=330px あたり）を先頭に
  let si = 0, bd = 1e9; out.forEach((p, i) => { const d = Math.hypot(p[0] - 330 * S, p[1] - 440 * S); if (d < bd) { bd = d; si = i; } });
  const pts = out.slice(si).concat(out.slice(0, si)); let cx = 0, cz = 0; pts.forEach(p => { cx += p[0] / pts.length; cz += p[1] / pts.length; });
  return { S, off: [cx, cz], ctrl: pts.map(p => [p[0] - cx, 0, p[1] - cz]) };
})();
MAPS.push({ id: 'nanko', name: 'OSAKA SUMINOE NANKOGUCHI', jp: '大阪 住之江・南港口', cat: 'city', env: 'city', seed: 7404, R: 700, N: 40, ctrl: NK.ctrl, harm: [[2, 0]], hp: [], H: 0, width: 12, diff: 2, time: 'day', weather: 'clear',
  custom: 'nanko', start: true, unlock: null, isNew: '3.5',
  desc: '大阪市住之江区の南港口〜平林がモデル。ニュートラムの高架が走る大通りから、平林貯木場の池のあいだを抜けて平林へ。帰りは大和川と阪神高速湾岸線に沿って走り、府立高校と団地の横を戻る。',
  feats: ['ニュートラムの高架・南港口駅/平林駅', '平林貯木場の池', '大和川・阪神高速湾岸線', '団地・高校・コンビニ', '物流倉庫・工場', '信号・横断歩道'] });
MAP_BY_ID.nanko = MAPS[MAPS.length - 1];
{ const _fin = Track.prototype.finalize; Track.prototype.finalize = function (pts) { _fin.call(this, pts); if (this.def.custom === 'nanko') { this.clearL.fill(2); this.clearR.fill(2); } }; }

CUSTOM_SCENE.nanko = function (S) {
  const { track, ch, G, water, addGlow, lamps, groundY: gy, rng, night, vary, wallOff, n, building, tree, X, Z } = S;
  const s = NK.S, W = (px, py) => [px * s - NK.off[0], py * s - NK.off[1]];
  const near = (x, z) => { let bi = 0, bd = 1e18; for (let i = 0; i < n; i += 4) { const d = (X[i] - x) ** 2 + (Z[i] - z) ** 2; if (d < bd) { bd = d; bi = i; } } return bi; };
  const dist = (x, z) => { let bd = 1e18; for (let i = 0; i < n; i += 2) bd = Math.min(bd, (X[i] - x) ** 2 + (Z[i] - z) ** 2); return Math.sqrt(bd); };
  const poly = (gb, ps, y, col) => { const q = ps.map(p => { const w = W(p[0], p[1]); return [w[0], y, w[1]]; }); for (let k = 1; k + 1 < q.length; k++) gb.tri(q[0], q[k], q[k + 1], col); };
  const quadR = (gb, ps, y, col) => { const q = ps.map(p => { const w = W(p[0], p[1]); return [w[0], y, w[1]]; }); gb.quad(q[0], q[1], q[2], q[3], col); };
  const occ = []; const box = (px, py, wpx, dpx, h, col, yaw = 0, top, y0 = 0) => { const [x, z] = W(px, py); if (y0 < 1 && dist(x, z) < Math.hypot(wpx, dpx) * s / 2 + wallOff + 2) return; if (y0 < 1) occ.push([x, z, Math.hypot(wpx, dpx) * s / 2]); G.box(x, gy + y0 + h / 2, z, wpx * s, h, dpx * s, col, yaw, top); };
  const bldg = (px, py, wpx, dpx, h, col, yaw = 0) => { const [x, z] = W(px, py); if (dist(x, z) < Math.hypot(wpx, dpx) * s / 2 + wallOff + 2) return; occ.push([x, z, Math.hypot(wpx, dpx) * s / 2]); building(ch(near(x, z)).bld, x, gy, z, wpx * s, dpx * s, h, yaw, col); };
  const free = (px, py, r) => { const [x, z] = W(px, py); return dist(x, z) > r * 1.2 + wallOff + 3; };
  const diagYaw = Math.atan2(1206, 440); // ニュートラム斜め区間の向き（画像座標）
  const TY = x => x <= 1000 ? 440 : 440 + (x - 1000) * 0.3648; // 大通り（ニュートラム）の中心線
  // ---------------- 水面：大和川・平林貯木場 ----------------
  const river = [[-600, 893], [920, 893], [980, 930], [1420, 1080], [1960, 1295], [2800, 1600]];
  for (let k = 0; k + 1 < 6; k++) quadR(water, [river[k], river[k + 1], [river[k + 1][0], 2600], [river[k][0], 2600]], gy + 0.12, [0.1, 0.2, 0.26]);
  // 河川敷の土手
  for (let k = 0; k + 1 < 5; k++) { const a = W(...river[k]), b = W(...river[k + 1]); G.quad([a[0], gy + 0.15, a[1]], [b[0], gy + 0.15, b[1]], [b[0], gy + 1.6, b[1] - 3], [a[0], gy + 1.6, a[1] - 3], [0.42, 0.5, 0.3]); }
  const ponds = [[[1185, 25], [1495, 40], [1480, TY(1480) - 32], [1160, TY(1160) - 32]], [[1150, TY(1150) + 34], [1445, TY(1445) + 34], [1430, 790], [1140, 762]],
    [[1700, 145], [2000, 200], [1972, TY(1972) - 32], [1662, TY(1662) - 32]], [[1640, TY(1640) + 34], [1950, TY(1950) + 34], [1925, 1040], [1620, 1000]], [[2165, -200], [2700, -200], [2700, TY(2700) - 32], [2150, TY(2150) - 32]]];
  for (const p of ponds) { quadR(G, p, gy + 0.1, [0.07, 0.09, 0.08]); quadR(water, p, gy + 0.11, [0.03, 0.05, 0.05]); // 護岸
    for (let k = 0; k < 4; k++) { const a = W(...p[k]), b = W(...p[(k + 1) % 4]); G.quad([a[0], gy + 0.1, a[1]], [b[0], gy + 0.1, b[1]], [b[0], gy + 1.2, b[1]], [a[0], gy + 1.2, a[1]], [0.5, 0.5, 0.48]); } }
  for (let k = 0; k < 14; k++) { const p = ponds[k % 4], u = 0.2 + rng() * 0.6, v = 0.2 + rng() * 0.6, a = W(p[0][0] + (p[1][0] - p[0][0]) * u, p[0][1] + (p[3][1] - p[0][1]) * v); G.box(a[0], gy + 0.25, a[1], 1.2, 0.6, 8 + rng() * 6, [0.35, 0.26, 0.16], rng() * 3); }
  // ---------------- 一般道路（コースにしていない道） ----------------
  const road = (a, b, w, mark = true) => { const A = W(...a), B = W(...b), dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz), nx = -dz / L * w / 2, nz = dx / L * w / 2;
    G.quad([A[0] - nx, gy + 0.04, A[1] - nz], [A[0] + nx, gy + 0.04, A[1] + nz], [B[0] + nx, gy + 0.04, B[1] + nz], [B[0] - nx, gy + 0.04, B[1] - nz], [0.27, 0.27, 0.29]);
    if (mark) { const m = Math.floor(L / 9); for (let k = 0; k < m; k += 2) { const t0 = k / m, t1 = (k + 1) / m; const p0 = [A[0] + dx * t0, A[1] + dz * t0], p1 = [A[0] + dx * t1, A[1] + dz * t1], ex = -dz / L * 0.08, ez = dx / L * 0.08; G.quad([p0[0] - ex, gy + 0.06, p0[1] - ez], [p0[0] + ex, gy + 0.06, p0[1] + ez], [p1[0] + ex, gy + 0.06, p1[1] + ez], [p1[0] - ex, gy + 0.06, p1[1] - ez], [0.9, 0.9, 0.88]); } }
    for (const e of [-1, 1]) G.quad([A[0] + e * nx, gy + 0.05, A[1] + e * nz], [A[0] + e * nx * 1.35, gy + 0.18, A[1] + e * nz * 1.35], [B[0] + e * nx * 1.35, gy + 0.18, B[1] + e * nz * 1.35], [B[0] + e * nx, gy + 0.05, B[1] + e * nz], [0.6, 0.6, 0.58]); };
  road([-500, 440], [215, 440], 16); road([2060, TY(2060)], [2800, TY(2800)], 16); road([240, -300], [240, 415], 10); road([240, 760], [240, 1000], 8, false);
  road([780, 380], [1080, 380], 8); road([1120, -200], [1080, 420], 9); road([1002, 465], [985, 780], 8); road([1610, -200], [1585, TY(1585) - 15], 9); road([1580, TY(1580) + 15], [1500, 1045], 9);
  road([2120, -200], [2045, TY(2045) - 15], 9); road([2110, TY(2110) + 15], [2050, 1090], 8); road([1880, -120], [2800, 140], 10); road([380, -200], [490, 415], 8); road([560, 190], [780, 360], 7); road([0, 225], [560, 225], 7, false);
  road([-500, 470], [215, 470], 6, false); road([270, 470], [990, 470], 6, false);
  // 横断歩道（交差点）
  const zebra = (px, py, yaw) => { const [x, z] = W(px, py); for (let k = -4; k <= 4; k++) G.box(x + Math.cos(yaw) * k * 1.4, gy + 0.08, z - Math.sin(yaw) * k * 1.4, 0.7, 0.04, 4, [0.92, 0.92, 0.9], yaw); };
  for (const [x, y] of [[1000, 440], [1080, 440]]) { zebra(x - 14, y, Math.PI / 2); zebra(x + 14, y, Math.PI / 2); }
  zebra(1583, TY(1583) - 16, 0); zebra(1585, TY(1585) + 16, 0); zebra(240, 455, 0);
  // ---------------- ニュートラム（高架の案内軌条） ----------------
  const tram = [[-500, 440], [1000, 440], [2800, TY(2800)]], TO = -(wallOff + 5) / s; // 北側にずらす
  const tramPt = t => { const L1 = 1500, L2 = Math.hypot(1800, TY(2800) - 440); const d = t * (L1 + L2); if (d < L1) return [-500 + d, 440 + TO, 0]; const f = (d - L1) / L2; return [1000 + 1800 * f, 440 + (TY(2800) - 440) * f + TO * Math.cos(diagYaw - Math.PI / 2), diagYaw - Math.PI / 2]; };
  for (let k = 0; k < 300; k++) { const a = tramPt(k / 300), b = tramPt((k + 1) / 300), A = W(a[0], a[1]), B = W(b[0], b[1]); const dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz), nx = -dz / L * 3.4, nz = dx / L * 3.4, h = 9;
    G.quad([A[0] - nx, gy + h, A[1] - nz], [A[0] + nx, gy + h, A[1] + nz], [B[0] + nx, gy + h, B[1] + nz], [B[0] - nx, gy + h, B[1] - nz], [0.72, 0.72, 0.7]);
    G.quad([A[0] - nx, gy + h - 1.4, A[1] - nz], [B[0] - nx, gy + h - 1.4, B[1] - nz], [B[0] + nx, gy + h - 1.4, B[1] + nz], [A[0] + nx, gy + h - 1.4, A[1] + nz], [0.5, 0.5, 0.5]);
    for (const e of [-1, 1]) { G.quad([A[0] + e * nx, gy + h - 1.4, A[1] + e * nz], [B[0] + e * nx, gy + h - 1.4, B[1] + e * nz], [B[0] + e * nx, gy + h + 0.9, B[1] + e * nz], [A[0] + e * nx, gy + h + 0.9, A[1] + e * nz], [0.82, 0.82, 0.8]); }
    if (k % 3 === 0) { G.box(A[0], gy + (h - 1.4) / 2, A[1], 1.4, h - 1.4, 1.4, [0.66, 0.66, 0.64], Math.atan2(dx, dz)); } }
  // 駅（南港口・平林）
  const station = (px, nm) => { const py = TY(px) + TO, yaw = px > 1000 ? diagYaw - Math.PI / 2 : 0; box(px, py, 70, 14, 1.2, [0.7, 0.7, 0.72], yaw + Math.PI / 2, null, 8.2); box(px, py, 64, 12, 0.4, [0.3, 0.45, 0.7], yaw + Math.PI / 2, null, 13.5);
    for (const k of [-28, -14, 0, 14, 28]) { const [x, z] = W(px + Math.cos(yaw) * k / s, py - Math.sin(yaw) * k / s); for (const e of [-5, 5]) G.box(x + Math.sin(yaw) * e, gy + 11, z + Math.cos(yaw) * e, 0.4, 5, 0.4, [0.8, 0.8, 0.82], yaw); }
    box(px - 20, py - 18, 10, 14, 9, [0.82, 0.82, 0.8], yaw); box(px - 20, py - 18, 10.5, 14.5, 0.5, [0.25, 0.4, 0.68], yaw, null, 9); const sg = W(px - 20, py - 26); G.e = 1; G.box(sg[0], gy + 6.5, sg[1], 6, 1.4, 0.2, [0.15, 0.3, 0.75], yaw); G.e = 0; addGlow([sg[0], gy + 6.5, sg[1]], 3, [0.4, 0.6, 1], 0.4); };
  station(960, '南港口'); station(1985, '平林');
  // ---------------- 阪神高速 湾岸線（高架） ----------------
  const ex = [[-600, 690], [620, 696], [940, 850], [1400, 1000], [1800, 1178], [2800, 1530]];
  for (let k = 0; k + 1 < ex.length; k++) { const a = ex[k], b = ex[k + 1], m = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 20);
    for (let j = 0; j < m; j++) { const A = W(a[0] + (b[0] - a[0]) * j / m, a[1] + (b[1] - a[1]) * j / m), B = W(a[0] + (b[0] - a[0]) * (j + 1) / m, a[1] + (b[1] - a[1]) * (j + 1) / m); const dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz), nx = -dz / L * 13, nz = dx / L * 13, h = 12;
      G.quad([A[0] - nx, gy + h, A[1] - nz], [A[0] + nx, gy + h, A[1] + nz], [B[0] + nx, gy + h, B[1] + nz], [B[0] - nx, gy + h, B[1] - nz], [0.3, 0.3, 0.32]);
      G.quad([A[0] - nx, gy + h - 2, A[1] - nz], [B[0] - nx, gy + h - 2, B[1] - nz], [B[0] + nx, gy + h - 2, B[1] + nz], [A[0] + nx, gy + h - 2, A[1] + nz], [0.45, 0.45, 0.46]);
      for (const e of [-1, 1]) G.quad([A[0] + e * nx, gy + h - 2, A[1] + e * nz], [B[0] + e * nx, gy + h - 2, B[1] + e * nz], [B[0] + e * nx * 1.01, gy + h + 3, B[1] + e * nz * 1.01], [A[0] + e * nx * 1.01, gy + h + 3, A[1] + e * nz * 1.01], [0.62, 0.66, 0.68]);
      if (j % 2 === 0) { const yaw = Math.atan2(dx, dz); for (const e of [-0.5, 0.5]) G.box(A[0] + nx * e, gy + (h - 2) / 2, A[1] + nz * e, 2.4, h - 2, 2.4, [0.6, 0.6, 0.6], yaw); G.box(A[0], gy + h - 2.6, A[1], 26, 1.2, 2.4, [0.55, 0.55, 0.56], yaw + Math.PI / 2); }
      if (j % 6 === 3) { G.e = 1; addGlow([A[0] + nx * 0.9, gy + h + 6, A[1] + nz * 0.9], 3.5, [1, 0.75, 0.45], 0.7); G.e = 0; } } }
  // ---------------- 建物 ----------------
  const concrete = [[0.78, 0.77, 0.74], [0.7, 0.7, 0.68], [0.82, 0.8, 0.76], [0.66, 0.68, 0.7]], roofs = [[0.62, 0.66, 0.7], [0.44, 0.58, 0.72], [0.55, 0.55, 0.57], [0.36, 0.5, 0.62], [0.7, 0.42, 0.32]];
  // 府立高校（校舎・グラウンド2面・プール・体育館）
  quadR(G, [[255, 540], [470, 540], [470, 665], [255, 665]], gy + 0.06, [0.72, 0.62, 0.44]); quadR(G, [[480, 545], [575, 545], [575, 645], [480, 645]], gy + 0.06, [0.7, 0.6, 0.42]);
  for (const [x1, y1, x2, y2] of [[255, 540, 470, 665], [480, 545, 575, 645]]) for (const [a, b] of [[[x1, y1], [x2, y1]], [[x2, y1], [x2, y2]], [[x2, y2], [x1, y2]], [[x1, y2], [x1, y1]]]) { const A = W(...a), B = W(...b); G.quad([A[0], gy, A[1]], [B[0], gy, B[1]], [B[0], gy + 3, B[1]], [A[0], gy + 3, A[1]], [0.35, 0.5, 0.35]); }
  bldg(380, 498, 170, 26, 15, [0.86, 0.85, 0.8]); bldg(560, 500, 60, 40, 15, [0.84, 0.83, 0.78]); box(610, 600, 50, 70, 11, [0.8, 0.82, 0.84], 0, [0.5, 0.6, 0.66]); quadR(water, [[262, 505], [292, 505], [292, 528], [262, 528]], gy + 0.9, [0.3, 0.7, 0.9]); box(277, 516, 34, 27, 0.8, [0.85, 0.85, 0.85]);
  for (let k = 0; k < 18; k++) { const [x, z] = W(250 + k * 22, 672); tree(G, x, gy, z, 0.7); } for (let k = 0; k < 8; k++) { const [x, z] = W(600 + (k % 2) * 20, 480 + k * 25); tree(G, x, gy, z, 0.65); }
  // 団地（中層住宅の列）
  for (const cx of [668, 706, 744, 790, 828, 880, 918, 956]) for (const [y0, len] of [[485, 95], [595, 100]]) { if (cx > 860 && y0 > 590) continue; const h = 15 + Math.floor(rng() * 3) * 3; bldg(cx, y0 + len / 2, 20, len, h, vary(concrete[Math.floor(rng() * 4)], 0.05)); }
  bldg(905, 650, 70, 22, 33, [0.86, 0.84, 0.8]); for (let k = 0; k < 10; k++) { const [x, z] = W(650 + k * 34, 590); tree(G, x, gy, z, 0.55); }
  // コンビニ（オリジナルデザイン）・駐車場
  { const [x, z] = W(680, 368); G.box(x, gy + 2.6, z, 22, 5.2, 14, [0.95, 0.95, 0.93], 0, [0.6, 0.6, 0.6]); G.e = 1; G.box(x, gy + 4.6, z + 7.05, 22, 1.0, 0.1, [0.95, 0.35, 0.1], 0); G.box(x, gy + 2, z + 7.05, 16, 2.6, 0.08, [0.9, 0.95, 1], 0); G.e = 0; addGlow([x, gy + 4.6, z + 7.4], 5, [1, 0.6, 0.3], 0.4);
    quadR(G, [[650, 380], [712, 380], [712, 412], [650, 412]], gy + 0.05, [0.33, 0.33, 0.35]); for (let k = 0; k < 6; k++) { const [px, pz] = W(655 + k * 10, 396); G.box(px, gy + 0.07, pz, 0.12, 0.02, 5, [0.9, 0.9, 0.9], 0); }
    const sp = W(718, 400); G.cylY(sp[0], gy, sp[1], 0.2, 0.2, 7, 6, [0.5, 0.5, 0.5], true); G.e = 1; G.box(sp[0], gy + 7.5, sp[1], 2.6, 1.6, 0.4, [0.95, 0.4, 0.12], 0); G.e = 0; }
  // ガソリンスタンド（オリジナルデザイン）
  { const [x, z] = W(625, 135); G.box(x, gy + 5.6, z, 24, 0.8, 16, [0.95, 0.95, 0.95], 0.4, [0.9, 0.2, 0.2]); G.e = 1; G.box(x, gy + 5.6, z + 8.05, 24, 0.5, 0.1, [0.9, 0.15, 0.15], 0.4); G.e = 0; for (const a of [-7, 7]) for (const b of [-4, 4]) { G.box(x + a * Math.cos(0.4) + b * Math.sin(0.4), gy + 2.6, z - a * Math.sin(0.4) + b * Math.cos(0.4), 0.5, 5.2, 0.5, [0.85, 0.85, 0.85], 0.4); }
    for (const a of [-5, 5]) G.box(x + a * Math.cos(0.4), gy + 0.8, z - a * Math.sin(0.4), 1.2, 1.6, 0.7, [0.95, 0.95, 0.95], 0.4); bldg(650, 112, 18, 14, 4, [0.92, 0.92, 0.9], 0.4); }
  // 物流倉庫（大型）
  box(925, 145, 170, 240, 32, [0.84, 0.84, 0.82], 0, roofs[0]); for (let k = 1; k < 4; k++) box(925, 270, 172, 6, 0.6, [0.4, 0.4, 0.42], 0, null, k * 8); box(1005, 280, 30, 30, 8, [0.7, 0.7, 0.72], 0);
  for (let k = 0; k < 8; k++) box(845 + k * 20, 285, 3, 10, 4, [0.55, 0.55, 0.6], 0);
  // 大型倉庫・工場
  box(110, 575, 210, 185, 15, [0.82, 0.82, 0.8], 0, [0.94, 0.94, 0.94]); box(30, 815, 60, 110, 12, concrete[1], 0, roofs[2]); box(183, 820, 105, 120, 13, concrete[0], 0, roofs[1]); box(275, 815, 50, 110, 9, concrete[2], 0, roofs[3]); box(440, 825, 100, 110, 12, concrete[3], 0, roofs[0]); box(560, 835, 120, 90, 14, concrete[0], 0, roofs[2]);
  box(850, 835, 100, 90, 16, [0.88, 0.86, 0.8], 0, roofs[4]); for (let k = 0; k < 6; k++) { const [x, z] = W(760 + k * 12, 800 + (k % 2) * 14); tree(G, x, gy, z, 0.7); }
  box(1270, 850, 240, 150, 14, [0.78, 0.8, 0.82], 0.08, [0.6, 0.74, 0.86]);
  // 池のあいだ・周辺の会社や工場（自動配置）
  const zones = [[1440, 0, 1660, 1050], [1960, 0, 2160, 1250], [0, 0, 560, 420], [560, 0, 840, 430], [1020, 0, 1170, 430], [1430, 650, 1650, 1080], [2140, 860, 2600, 1300], [1720, 1060, 1960, 1230], [-500, -300, 230, 420], [250, 900, 900, 1000]];
  for (const [x1, y1, x2, y2] of zones) for (let k = 0; k < 26; k++) { const px = x1 + rng() * (x2 - x1), py = y1 + rng() * (y2 - y1), w = 30 + rng() * 60, d = 24 + rng() * 50, r = Math.max(w, d) * s * 0.6;
    if (!free(px, py, r) || ponds.some(p => px > Math.min(p[0][0], p[3][0]) - 10 && px < Math.max(p[1][0], p[2][0]) + 10 && py > Math.min(p[0][1], p[1][1]) - 10 && py < Math.max(p[2][1], p[3][1]) + 10)) continue;
    if (Math.abs(py - TY(px)) < 60) continue; if (py > 880 && px < 1960) continue; const t = rng();
    if (t < 0.55) box(px, py, w, d, 7 + rng() * 9, vary(concrete[Math.floor(rng() * 4)], 0.06), px > 1000 && px < 2100 ? 0.05 : 0, roofs[Math.floor(rng() * roofs.length)]);
    else if (t < 0.85) bldg(px, py, w * 0.5, d * 0.5, 9 + rng() * 15, vary(concrete[Math.floor(rng() * 4)], 0.08));
    else { const [x, z] = W(px, py); G.cylY(x, gy, z, 6 + rng() * 3, 6, 10 + rng() * 6, 12, [0.8, 0.82, 0.8], true); } }
  // マンション（高層）
  for (const [px, py, h] of [[2080, 400, 42], [2140, 600, 36], [120, 120, 39], [330, 330, 30], [1540, 300, 27]]) if (free(px, py, 20)) bldg(px, py, 32, 22, h, vary([0.86, 0.84, 0.8], 0.05));

  // ---------------- 沿道の建物（商店・小さなマンション・事務所）と電柱 ----------------
  const toPx = (x, z) => [(x + NK.off[0]) / s, (z + NK.off[1]) / s];
  const inZone = (px, py) => (px > 245 && px < 645 && py > 465 && py < 675) || (px > 645 && px < 990 && py > 465 && py < 705) || (px > 835 && px < 1015 && py > 15 && py < 295) || ponds.some(p => px > Math.min(p[0][0], p[3][0]) - 8 && px < Math.max(p[1][0], p[2][0]) + 8 && py > Math.min(p[0][1], p[1][1]) - 8 && py < Math.max(p[2][1], p[3][1]) + 8) || py > 885 - (px > 920 ? -(px - 920) * 0.38 : 0) - 6;
  const nearEx = (px, py) => { for (let k = 0; k + 1 < ex.length; k++) { const a = ex[k], b = ex[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy))); if (Math.hypot(px - a[0] - dx * t, py - a[1] - dy * t) < 26) return true; } return false; };
  const shopCols = [[0.9, 0.86, 0.78], [0.8, 0.82, 0.86], [0.92, 0.9, 0.86], [0.7, 0.74, 0.78], [0.86, 0.8, 0.72]], awn = [[0.85, 0.2, 0.15], [0.15, 0.45, 0.75], [0.2, 0.6, 0.35], [0.9, 0.6, 0.1]];
  for (let i = 0; i < n; i += 9) for (const sd of [-1, 1]) { if (rng() > 0.82) continue; const w = 9 + rng() * 14, d = 9 + rng() * 12, off = wallOff + 4 + d / 2 + rng() * 4, x = X[i] + track.RX[i] * sd * off, z = Z[i] + track.RZ[i] * sd * off, [px, py] = toPx(x, z), r = Math.hypot(w, d) / 2;
    if (inZone(px, py) || nearEx(px, py) || Math.abs(py - TY(px) + TO) < 14 + r / s) continue; if (dist(x, z) < r + wallOff + 1.5) continue; if (occ.some(o => Math.hypot(o[0] - x, o[1] - z) < o[2] + r)) continue;
    occ.push([x, z, r]); const yaw = track.HD[i], t = rng();
    if (t < 0.4) { const h = 6 + Math.floor(rng() * 2) * 3; G.box(x, gy + h / 2, z, w, h, d, vary(shopCols[Math.floor(rng() * 5)], 0.06), yaw, [0.45, 0.45, 0.47]); const fx = x - track.RX[i] * sd * (d / 2 + 0.05), fz = z - track.RZ[i] * sd * (d / 2 + 0.05); G.box(fx - track.RX[i] * sd * 0.6, gy + 3.1, fz - track.RZ[i] * sd * 0.6, w * 0.9, 0.2, 1.2, awn[Math.floor(rng() * 4)], yaw + Math.PI / 2 * 0); G.e = 1; G.box(fx, gy + 1.5, fz, w * 0.7, 2.2, 0.08, [0.85, 0.92, 1], yaw); G.e = 0; }
    else if (t < 0.8) building(ch(i).bld, x, gy, z, w, d, 10 + Math.floor(rng() * 6) * 3, yaw, vary(shopCols[Math.floor(rng() * 5)], 0.06));
    else G.box(x, gy + 4, z, w * 1.4, 8, d * 1.3, vary([0.72, 0.72, 0.74], 0.08), yaw, [0.5, 0.6, 0.7]); }
  // 電柱と電線（日本の街並み）
  let prevTop = null; for (let i = 0; i < n; i += 15) { const sd = 1, x = X[i] + track.RX[i] * (wallOff + 1.8) * sd, z = Z[i] + track.RZ[i] * (wallOff + 1.8) * sd, [px, py] = toPx(x, z); if (nearEx(px, py) && false) continue;
    G.cylY(x, gy, z, 0.16, 0.13, 10, 6, [0.62, 0.6, 0.56], true); G.box(x, gy + 9.2, z, 1.8, 0.12, 0.12, [0.4, 0.4, 0.4], track.HD[i] + Math.PI / 2); G.box(x, gy + 8.4, z, 0.4, 0.6, 0.4, [0.5, 0.5, 0.52], 0);
    const top = [x, gy + 9.3, z]; if (prevTop && Math.hypot(top[0] - prevTop[0], top[2] - prevTop[2]) < 45) for (const e of [-0.8, 0.8]) { const ax = prevTop[0] + Math.cos(track.HD[i]) * e, az = prevTop[2] - Math.sin(track.HD[i]) * e, bx = top[0] + Math.cos(track.HD[i]) * e, bz = top[2] - Math.sin(track.HD[i]) * e; G.quad([ax, top[1], az], [bx, top[1], bz], [bx, top[1] - 0.04, bz], [ax, top[1] - 0.04, az], [0.08, 0.08, 0.08]); G.quad([ax, top[1] - 0.04, az], [bx, top[1] - 0.04, bz], [bx, top[1], bz], [ax, top[1], az], [0.08, 0.08, 0.08]); } prevTop = top; }
  // 自動販売機（コンビニ・駅の近く）
  for (const [px, py] of [[712, 365], [716, 372], [940, 470], [1975, 840]]) { const [x, z] = W(px, py); G.box(x, gy + 0.9, z, 1.0, 1.8, 0.8, [0.92, 0.92, 0.95], 0); G.e = 1; G.box(x, gy + 1.2, z + 0.41, 0.8, 0.9, 0.02, [0.85, 0.95, 1], 0); G.e = 0; }
  // 信号機
  const signal = (px, py, yaw) => { const [x, z] = W(px, py); G.cylY(x, gy, z, 0.12, 0.12, 6, 6, [0.5, 0.5, 0.52], true); G.box(x + Math.cos(yaw) * 3, gy + 5.6, z - Math.sin(yaw) * 3, 6, 0.2, 0.2, [0.5, 0.5, 0.52], yaw); const hx = x + Math.cos(yaw) * 5, hz = z - Math.sin(yaw) * 5; G.box(hx, gy + 5.6, hz, 1.6, 0.5, 0.35, [0.25, 0.25, 0.26], yaw);
    const col = [[0.1, 1, 0.5], [1, 0.75, 0.1], [1, 0.15, 0.1]][Math.floor(rng() * 3)]; G.e = 1; G.box(hx + Math.cos(yaw) * (col[0] > 0.5 ? 0.5 : col[1] > 0.5 ? 0 : -0.5), gy + 5.6, hz - Math.sin(yaw) * (col[0] > 0.5 ? 0.5 : -0.5), 0.36, 0.36, 0.38, col, yaw); G.e = 0; addGlow([hx, gy + 5.6, hz], 1.2, col, 0.7); };
  for (const [x, y, yw] of [[985, 455, Math.PI], [1015, 425, 0], [1065, 455, Math.PI], [1095, 425, 0], [1570, TY(1570) + 18, Math.PI], [1600, TY(1600) - 18, 0], [255, 455, -Math.PI / 2], [2015, 830, Math.PI]]) signal(x, y, yw);
  // バス停
  { const [x, z] = W(560, 457); G.box(x, gy + 1.2, z, 0.15, 2.4, 0.15, [0.5, 0.5, 0.5], 0); G.e = 1; G.box(x, gy + 2.5, z, 0.7, 0.7, 0.08, [0.95, 0.95, 0.95], 0); G.e = 0; G.box(x + 4, gy + 2.6, z, 5, 0.12, 2, [0.6, 0.62, 0.64], 0); }
};
window.__DLX = Object.assign(window.__DLX || {}, { NK });
