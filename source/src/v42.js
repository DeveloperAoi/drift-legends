// =====================================================================
// v42.js — 新マップ「眼鏡橋（千本松大橋）」
//   大阪・木津川に架かるループ橋（1973年）。両端が2階建てのらせん（720度ループ・直径約75m）、
//   橋の中央は水面から約36m、全長約323m。地元では両岸のループをメガネに見立てて「めがね橋」。
//   帰りは下流側の大きなアーチ橋（大正区側が3重ループ）で木津川を渡り直す周回コース。
// =====================================================================
const MEGANE = turtleCourse([
  ['S', 200, 0, 'start'],          // 0 大正区側の道路（スタート）
  ['A', 30, -90],                  // 1
  ['S', 120, 0, 'appr1'],          // 2 ループ橋へのアプローチ
  ['A', 40, -720, 36, 'loop1'],    // 3 大正区側ループ（2階建てらせん・上り）
  ['S', 320, 36, 'b1'],            // 4 千本松大橋（木津川の上・高さ約36m）
  ['A', 40, -720, 0, 'loop2'],     // 5 西成区側ループ（下り）
  ['S', 70, 0, 'nishi'],           // 6 南津守
  ['A', 30, -90],                  // 7
  ['S', 160, 0, 'bank'],           // 8 川沿いの道
  ['S', 330, 40, 'ramp'],          // 9 アーチ橋への急な上り坂
  ['A', 60, -90, 40],              // 10
  ['S', 420, 40, 'arch'],          // 11 下流のアーチ橋
  ['A', 46, -1080, 0, 'loop3'],    // 12 大正区側の3重ループ（下り）
  ['S', 110, 0, 'taisho'],         // 13 工場・倉庫街
  ['A', 30, -90]                   // 14
], [0, 2]);
{ const T = MEGANE.tags, L = MEGANE.len, f = (tag, off = 0) => T[tag][0][0] + off / L;
  MAPS.push({ id: 'megane', name: 'MEGANE BRIDGE (SENBONMATSU)', jp: '眼鏡橋（千本松大橋）', cat: 'city', env: 'city', seed: 7303, R: 500, N: 40, ctrl: MEGANE.ctrl, harm: [[2, 0]], hp: [], H: 0, width: 10, diff: 3, time: 'evening', weather: 'clear',
    stack: true, maxG: 0.11, custom: 'megane', start: true, unlock: null, isNew: '3.4', mtags: T, mlen: L,
    desc: '大阪・木津川に架かる「めがね橋」こと千本松大橋がモデル。2階建てのらせんループを720度ぐるぐる登って水面から約36mの橋を渡り、反対側のループを下る。帰りは急坂から下流のアーチ橋に上がり、3重ループで工場街へ。',
    feats: ['720度らせんループ ×2', '3重ループ', '高さ約36〜40mの橋', '木津川・船', '工場・倉庫街', '夕暮れの大阪湾岸'] });
  MAP_BY_ID.megane = MAPS[MAPS.length - 1]; }

{ const _fin = Track.prototype.finalize; Track.prototype.finalize = function (pts) { _fin.call(this, pts); if (this.def.custom === 'megane') for (let i = 0; i < this.n; i++) if (this.Y[i] > 3) { this.clearL[i] = 2; this.clearR[i] = 2; } }; }
const CUSTOM_SCENE = {
  megane(S) {
    const { track, def, ch, P, G, water, addGlow, lamps, groundY, rng, night, vary, wallOff, hw, n, building, tree, X, Y, Z } = S;
    const T = def.mtags, idx = fr => Math.round(fr * n) % n;
    // 川の位置：千本松大橋の中点・向きから決める
    const ia = idx(T.b1[0][0]), ib = idx(T.b1[0][1]); const M = [(X[ia] + X[ib]) / 2, (Z[ia] + Z[ib]) / 2]; let D = [X[ib] - X[ia], Z[ib] - Z[ia]]; const dl = Math.hypot(D[0], D[1]); D = [D[0] / dl, D[1] / dl]; const N2 = [-D[1], D[0]];
    const RW = 105, RL = 1400, gy = groundY;
    const wp = (u, v, y) => [M[0] + D[0] * u + N2[0] * v, y, M[1] + D[1] * u + N2[1] * v];
    const proj = i => (X[i] - M[0]) * D[0] + (Z[i] - M[1]) * D[1];
    // 水面（地面より少し上に張る）
    water.quad(wp(-RW, -RL, gy + 0.12), wp(RW, -RL, gy + 0.12), wp(RW, RL, gy + 0.12), wp(-RW, RL, gy + 0.12), [0.08, 0.2, 0.3]);
    // 護岸（コンクリートの岸壁）
    for (const s of [-1, 1]) for (let v = -RL; v < RL; v += 40) { const a = wp(s * RW, v, gy), b = wp(s * RW, v + 40, gy), yaw = Math.atan2(D[0], D[1]);
      G.quad(a, b, [b[0], gy + 1.4, b[2]], [a[0], gy + 1.4, a[2]], [0.56, 0.55, 0.52]); const c = wp(s * (RW + 0.8), v, gy + 1.4), d = wp(s * (RW + 0.8), v + 40, gy + 1.4); G.quad([a[0], gy + 1.4, a[2]], [b[0], gy + 1.4, b[2]], d, c, [0.66, 0.65, 0.62]);
      if ((v / 40) % 3 === 0) { const q = wp(s * (RW + 3), v + 20, gy); G.cylY(q[0], gy + 1.4, q[2], 0.35, 0.3, 0.7, 6, [0.85, 0.82, 0.2], true); } }
    // 橋桁・橋脚
    const steel = [0.24, 0.52, 0.58], conc = [0.58, 0.58, 0.56], under = [0.36, 0.36, 0.38];
    const inR = (i, tag) => { const a = idx(T[tag][0][0]), b = idx(T[tag][0][1]); return a <= b ? i >= a && i <= b : i >= a || i <= b; };
    for (let i = 0; i < n; i += 2) { const j = (i + 2) % n, h = Y[i] - gy; if (h < 2.2) continue; const g = ch(i).scene, isB1 = inR(i, 'b1'), isArch = inR(i, 'arch'), col = isB1 ? steel : isArch ? [0.82, 0.83, 0.85] : conc;
      const dep = isB1 ? 2.6 : isArch ? 1.8 : 1.3;
      g.quad(P(i, -wallOff - 0.5, -dep), P(j, -wallOff - 0.5, -dep), P(j, wallOff + 0.5, -dep), P(i, wallOff + 0.5, -dep), under);
      for (const s of [-1, 1]) g.quad(P(i, s * (wallOff + 0.5), 0.02), P(j, s * (wallOff + 0.5), 0.02), P(j, s * (wallOff + 0.5), -dep), P(i, s * (wallOff + 0.5), -dep), col);
      const pr = proj(i), inRiver = Math.abs(pr) < RW + 2 && (isB1 || isArch);
      if (i % 12 === 0 && !inRiver) { for (const s of [-1, 1]) { const p = P(i, s * (wallOff + 1.6), 0); g.box(p[0], gy + (h - dep) / 2, p[2], 1.4, h - dep, 1.4, conc, track.HD[i]); } const c = P(i, 0, 0); g.box(c[0], c[1] - dep - 0.4, c[2], 2 * wallOff + 4.6, 0.8, 1.6, conc, track.HD[i] + Math.PI / 2 * 0); } }
    // 川の中の橋脚（千本松大橋）
    for (const u of [-58, 58]) { let best = -1, bd = 1e9; for (let i = ia; i !== ib; i = (i + 1) % n) { const d = Math.abs(proj(i) - u); if (d < bd) { bd = d; best = i; } } if (best < 0) continue; const p = P(best, 0, 0), h = Y[best] - gy, g = ch(best).scene;
      g.box(p[0], gy + (h - 2.6) / 2, p[2], 4, h - 2.6, 9, conc, track.HD[best] + Math.PI / 2); g.box(p[0], gy + 0.6, p[2], 7, 1.6, 14, [0.5, 0.5, 0.5], track.HD[best] + Math.PI / 2); }
    // アーチ（下流の橋）
    { const a0 = idx(T.arch[0][0]), a1 = idx(T.arch[0][1]); const span = 160, rise = 44; const pts = [];
      for (let i = a0; i !== a1; i = (i + 1) % n) { const pr = proj(i); if (Math.abs(pr) <= span) pts.push([i, pr]); }
      for (let k = 0; k + 1 < pts.length; k += 2) { const [i, pa] = pts[k], [j, pb] = pts[Math.min(k + 2, pts.length - 1)]; const ha = rise * (1 - (pa / span) ** 2), hb = rise * (1 - (pb / span) ** 2), g = ch(i).scene, wc = [0.9, 0.9, 0.92];
        for (const s of [-1, 1]) { const l = s * (wallOff + 0.9); g.quad(P(i, l - 0.6, ha), P(j, l - 0.6, hb), P(j, l - 0.6, hb + 2.2), P(i, l - 0.6, ha + 2.2), wc); g.quad(P(j, l + 0.6, hb), P(i, l + 0.6, ha), P(i, l + 0.6, ha + 2.2), P(j, l + 0.6, hb + 2.2), wc); g.quad(P(i, l - 0.6, ha + 2.2), P(j, l - 0.6, hb + 2.2), P(j, l + 0.6, hb + 2.2), P(i, l + 0.6, ha + 2.2), [0.95, 0.95, 0.96]); g.quad(P(j, l - 0.6, hb), P(i, l - 0.6, ha), P(i, l + 0.6, ha), P(j, l + 0.6, hb), [0.6, 0.6, 0.62]);
          if (k % 6 === 0 && ha > 3) { const q = P(i, l, ha / 2); g.box(q[0], q[1], q[2], 0.25, ha, 0.25, [0.75, 0.75, 0.78], track.HD[i]); } }
        if (k % 14 === 0 && ha > 12) { const q = P(i, 0, ha + 1.4); g.box(q[0], q[1], q[2], 2 * (wallOff + 0.9), 0.9, 0.9, [0.9, 0.9, 0.92], track.HD[i]); }
        if (night && k % 10 === 0) addGlow(P(i, wallOff + 0.9, ha + 2.4), 1.6, [1, 0.95, 0.85], 0.8); } }
    // 街灯（橋の上・ループ）
    for (let i = 0; i < n; i += 14) { if (Y[i] - gy < 6) continue; const s = (i / 14) % 2 ? 1 : -1, b = P(i, s * (wallOff + 0.3), 0), g = ch(i).scene; g.cylY(b[0], b[1], b[2], 0.1, 0.08, 7.5, 5, [0.45, 0.47, 0.5], true); const lp = P(i, s * (wallOff - 1.2), 7.5); g.e = 1; g.box(lp[0], lp[1], lp[2], 0.5, 0.18, 1.0, [1, 0.8, 0.5], track.HD[i]); g.e = 0; addGlow(lp, 4.5, [1, 0.75, 0.45], 0.85); lamps.push({ p: lp, c: [1, 0.72, 0.4] }); }
    // 道路からの距離（建物・木を置けるか）
    const cell = 40, grid = new Map(), key = (a, b) => a * 100000 + b; for (let i = 0; i < n; i += 3) { const k = key(Math.floor(X[i] / cell), Math.floor(Z[i] / cell)); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i); }
    const free = (x, z, r) => { const cx = Math.floor(x / cell), cz = Math.floor(z / cell); for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) { const L = grid.get(key(cx + a, cz + b)); if (L) for (const i of L) if (Math.hypot(X[i] - x, Z[i] - z) < r + hw + 6) return false; } return true; };
    const onRiver = (x, z, r) => Math.abs((x - M[0]) * D[0] + (z - M[1]) * D[1]) < RW + r + 4;
    // 千本松（川沿いの松並木）
    for (const s of [-1, 1]) for (let v = -260; v <= 260; v += 13) { const q = wp(s * (RW + 7), v + rng() * 4, gy); if (free(q[0], q[2], 3)) tree(G, q[0], gy, q[2], 0.8 + rng() * 0.3); }
    // 工場・倉庫・ガスタンク・クレーン
    const fac = [[0.62, 0.62, 0.64], [0.5, 0.56, 0.62], [0.72, 0.68, 0.6], [0.42, 0.46, 0.5], [0.76, 0.42, 0.3]];
    for (let k = 0; k < 140; k++) { const s = rng() < 0.5 ? -1 : 1, u = s * (RW + 30 + rng() * 520), v = (rng() - 0.5) * 1500, w = 18 + rng() * 34, d = 14 + rng() * 26, r = Math.max(w, d) * 0.6, q = wp(u, v, gy);
      if (!free(q[0], q[2], r) || onRiver(q[0], q[2], r)) continue; const h = 7 + rng() * 16, yaw = Math.atan2(D[0], D[1]) + (rng() < 0.5 ? 0 : Math.PI / 2);
      if (rng() < 0.75) { G.box(q[0], gy + h / 2, q[2], w, h, d, vary(fac[Math.floor(rng() * fac.length)], 0.12), yaw, [0.42, 0.44, 0.48]); if (rng() < 0.35) { G.cylY(q[0] + w * 0.3, gy, q[2], 1.3, 1.0, h + 18 + rng() * 14, 8, [0.78, 0.78, 0.78], true); } }
      else if (rng() < 0.5) { const R2 = 8 + rng() * 6; G.cylY(q[0], gy, q[2], R2, R2, R2 * 1.4, 14, [0.82, 0.84, 0.86], true); }
      else building(ch(0).bld, q[0], gy, q[2], w * 0.7, d * 0.7, 18 + rng() * 30, yaw, vary([0.6, 0.6, 0.62], 0.15)); }
    for (const [u, v] of [[RW + 24, -420], [-(RW + 24), 380], [RW + 24, 520]]) { const q = wp(u, v, gy), cr = [0.9, 0.4, 0.12], yaw = Math.atan2(D[0], D[1]); if (!free(q[0], q[2], 12)) continue;
      for (const a of [-5, 5]) for (const b of [-4, 4]) G.box(q[0] + D[0] * a + N2[0] * b, gy + 14, q[2] + D[1] * a + N2[1] * b, 0.9, 28, 0.9, cr, yaw); G.box(q[0], gy + 28.5, q[2], 12, 2, 10, cr, yaw); const bm = wp(u - Math.sign(u) * 26, v, gy + 30); G.box(bm[0], bm[1], bm[2], 52, 1.4, 2, cr, yaw); addGlow([q[0], gy + 31, q[2]], 2.5, [1, 0.1, 0.1], 0.9); }
    // 船：貨物船・タグボート・千本松渡船
    const ship = (v, u, L, Wd, col, house) => { const yaw = Math.atan2(N2[0], N2[1]), c = wp(u, v, gy); G.box(c[0], gy + 1.4, c[2], Wd, 2.6, L, col, yaw, [0.3, 0.3, 0.32]); G.box(c[0], gy + 2.9, c[2], Wd * 0.94, 0.4, L * 0.96, [0.55, 0.15, 0.12], yaw);
      if (house) { const h = wp(u, v - L * 0.36, gy); G.box(h[0], gy + 5.5, h[2], Wd * 0.8, 5, L * 0.16, [0.94, 0.94, 0.92], yaw); for (let k = 0; k < 4; k++) { const q = wp(u, v - L * 0.1 + k * L * 0.13, gy); G.box(q[0], gy + 4.4, q[2], Wd * 0.8, 2.6, L * 0.11, vary([[0.75, 0.15, 0.1], [0.1, 0.3, 0.7], [0.15, 0.5, 0.25]][k % 3], 0.1), yaw); } if (night) addGlow([h[0], gy + 8.5, h[2]], 1.5, [1, 0.95, 0.8], 0.9); } };
    ship(-330, 22, 78, 13, [0.15, 0.2, 0.32], true); ship(260, -40, 22, 6, [0.85, 0.85, 0.82], false); ship(-75, 8, 14, 5, [0.92, 0.92, 0.9], false);
    { const c = wp(8, -75, gy); G.box(c[0], gy + 4, c[2], 4, 2, 6, [0.95, 0.95, 0.95], Math.atan2(N2[0], N2[1])); }
    // 渡船場（両岸の小屋）
    for (const s of [-1, 1]) { const q = wp(s * (RW + 9), -75, gy); G.box(q[0], gy + 1.7, q[2], 6, 3.4, 9, [0.85, 0.82, 0.74], Math.atan2(D[0], D[1]), [0.25, 0.35, 0.55]); const pl = wp(s * (RW - 4), -75, gy); G.box(pl[0], gy + 0.9, pl[2], 8, 0.5, 5, [0.5, 0.48, 0.45], Math.atan2(D[0], D[1])); }
  }
};
