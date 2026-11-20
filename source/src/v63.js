// =====================================================================
// v63.js — v4.4：ハイパー車両パック限定の新車「AURELION VORTEX 16」（W16クアッドターボのハイパーカー）
//          車のアンロック演出（全車両）・星アップ演出（空ぶかし音つき）
//          エンジンの手動始動（キーを差して回す）・キー/キーチェーンのパック・始動音の設定・メインメニューでエンジンON/OFF
// =====================================================================
WHEEL_STYLES.push({ id: 'aurex', name: 'ヴォルテックス 鍛造ターボ10本', price: 0, spokes: 10, deep: 1, rim: '#c4c8d0' });
{ const c = addCar(['hy_aurex', 'AURELION', 'VORTEX 16', 'ハイパー車両パック限定・8.0L W16クアッドターボ、1500馬力の大陸横断ハイパーカー（カード限定）', 'AWD', 1500, 1600, 1995, 420, 7, 6700, 1, 90, 72, 97, 0, 'super', 4.54, 2.04, 1.21, '#1d3f8f', 0, 'v12', 2.71, 0.43, { chest: 1, cards: 1 }]);
  Object.assign(c, { isNew: '4.4', stockWheel: 'aurex', hero: 'aurex', cls: 'S', defColor2: '#0b0f1c', face: 1, cabB: 0.86, cabT: 0.6, prof: { nose: .30, hood: .48, deck: .70, ws: .68, rf: .545, rr: .43, rb: .2 } });
  CAR_CARDS.hy_aurex = { need: 30, hyper: 1 };
  for (const [n, r] of [[1, 'R'], [3, 'E'], [5, 'L']]) mkItem({ id: `cc_hy_aurex_${n}`, type: 'carcard', car: 'hy_aurex', cards: n, rarity: r, lim: 1, hyperveh: 1, name: `${c.name} カード ×${n}`, en: `${c.name} card x${n}` });
  for (const n of [1, 3]) mkItem({ id: `sc_hy_aurex_${n}`, type: 'starcard', car: 'hy_aurex', cards: n, rarity: n === 3 ? 'L' : 'E', lim: 1, starcard: 1, name: `${c.name} 車両カード ×${n}`, en: `${c.name} vehicle card x${n}` });
  if (typeof VP_CARS !== 'undefined') VP_CARS.vp_hyper = ['hy_aurex', 'S']; }
// ハイパー車両パックにだけ「交換用カード」を入れる（ほかのパック・デイリーショップには出ない）
{ const _pp = packPool; packPool = function (c, rar) { const r = _pp(c, rar).filter(i => !i.hyperveh); if (c.id === 'vp_hyper') return r.concat(ITEMS.filter(i => i.hyperveh && i.rarity === rar)); return r; }; }
if (typeof dsCards === 'function') { const _ds = dsCards; dsCards = function () { return _ds.apply(this, arguments).filter(c => !(CAR_CARDS[c.car] || {}).hyper); }; }
{ const _dl = defaultLook; defaultLook = function (car) { const l = _dl.apply(this, arguments); if (car && car.hero === 'aurex') { l.color2 = l.color2 && l.color2 !== '#111114' ? l.color2 : car.defColor2; l.caliper = l.caliper || '#1a1a1e'; } return l; }; }

// ---------------- 3Dモデル：W16ハイパーカーの造形（ホースシュー型グリル・Cライン・センターフィン・LEDライトバー） ----------------
const AUREX = {
  build(m, car, look) {
    const S = m.shape; if (!S) return; const { topAt, widthAt, beltAt, T, Z } = S, L = car.L, W = car.W, H = car.H, hw0 = W / 2, A = S.A || {}, gl = m.gl;
    const body = hexToRgb(look.color || car.color), c2 = hexToRgb(look.color2 || car.defColor2 || '#0b0f1c'), chromeC = [0.95, 0.96, 0.98], dark = [0.025, 0.025, 0.03], carbon = [0.07, 0.07, 0.08];
    const gP = new GB(), gC = new GB(), gD = new GB(), gK = new GB(), gH = new GB(), gT = new GB(), g2 = new GB();
    const dbl = (g, a, b, c, n, col) => { g.triN(a, b, c, n, col); g.triN(a, c, b, n.map(v => -v), col); };
    const q2 = (g, a, b, c, d, n, col) => { dbl(g, a, b, c, n, col); dbl(g, a, c, d, n, col); };
    const smst = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const fOf = z => (z + L / 2) / L, clr = 0.135;
    // 側面のX（高さ y の位置の車体側面）
    const sideX = (f, y) => { const hw = widthAt(f), bot = clr, top = topAt(f), u = (y - bot) / Math.max(0.05, top - bot);
      if (y > top) { const roof = H, t = Math.max(0, Math.min(1, (y - top) / (roof - top))); return lerp(hw * 0.86, hw * 0.6, t); }
      const K = [[0, .92], [.16, .985], [.42, 1], [.62, .996], [.66, .972], [.88, .958], [1, .9]]; for (let i = 0; i < K.length - 1; i++) if (u <= K[i + 1][0]) return hw * lerp(K[i][1], K[i + 1][1], (u - K[i][0]) / (K[i + 1][0] - K[i][0])); return hw * 0.9; };
    const roofY = f => H + 0.018 * Math.sin(Math.max(0, Math.min(1, (f - T.rr) / (T.rf - T.rr))) * PI);
    // ---- ホースシュー型グリル（フロント中央） ----
    { const zf = L / 2 + 0.014, cy = 0.31, w = 0.4, h = 0.42, P = []; const N = 26; for (let k = 0; k <= N; k++) { const a = -0.78 * PI + k / N * 1.56 * PI; P.push([Math.sin(a) * w / 2, cy - h / 2 + h / 2 + Math.cos(a) * h / 2]); }
      const cen = [0, cy - 0.02, zf - 0.02]; for (let k = 0; k < N; k++) { dbl(gD, cen, [P[k][0], P[k][1], zf - 0.015], [P[k + 1][0], P[k + 1][1], zf - 0.015], [0, 0, 1], dark); }
      dbl(gD, cen, [P[N][0], P[N][1], zf - 0.015], [P[0][0], P[0][1], zf - 0.015], [0, 0, 1], dark);
      const ring = P.concat([P[0]]); for (let k = 0; k < ring.length - 1; k++) { const a = ring[k], b = ring[k + 1], na = [a[0] * 1.13, cy + (a[1] - cy) * 1.1], nb = [b[0] * 1.13, cy + (b[1] - cy) * 1.1];
        q2(gC, [a[0], a[1], zf], [b[0], b[1], zf], [nb[0], nb[1], zf + 0.004], [na[0], na[1], zf + 0.004], [0, 0, 1], chromeC); }
      for (let k = 1; k < 6; k++) { const y = cy - h / 2 + k * h / 6 + 0.02, hx = w / 2 * Math.sqrt(Math.max(0, 1 - ((y - cy) / (h / 2)) ** 2)) * 0.92; gC.box(0, y, zf - 0.008, hx * 2, 0.006, 0.01, [0.45, 0.46, 0.5]); }
      gC.box(0, cy, zf - 0.008, 0.008, h * 0.9, 0.01, [0.45, 0.46, 0.5]); }
    // フロント下部の大きなインテーク（左右）とスプリッター
    for (const s of [-1, 1]) { const x0 = s * 0.3, x1 = s * (hw0 - 0.12), zf = L / 2 + 0.006;
      q2(gD, [x0, 0.18, zf], [x1, 0.17, zf - 0.04], [x1, 0.36, zf - 0.07], [x0, 0.3, zf], [0, 0, 1], dark);
      q2(gC, [x0, 0.3, zf + 0.002], [x1, 0.36, zf - 0.068], [x1, 0.375, zf - 0.07], [x0, 0.315, zf + 0.002], [0, 0, 1], [0.55, 0.56, 0.6]); }
    gK.box(0, 0.12, L / 2 - 0.02, W - 0.22, 0.025, 0.16, carbon);
    // ---- 4連LEDヘッドライト（左右） ----
    for (const s of [-1, 1]) { const f0 = 0.955, f1 = 0.99;
      for (let k = 0; k < 4; k++) { const x = s * hw0 * (0.5 + k * 0.095), f = lerp(f1, f0, k / 3) - 0.004, y = topAt(f) + 0.004 - k * 0.01;
        gD.box(x, y, Z(f), 0.075, 0.03, 0.07, dark); gH.box(x, y + 0.012, Z(f) + 0.004, 0.052, 0.012, 0.048, [1, 1, 1]); }
      // ライトの上のまゆ（シグネチャーライン）
      for (let k = 0; k < 8; k++) { const t = k / 7, x = s * hw0 * lerp(0.46, 0.84, t), f = lerp(0.993, 0.948, t), y = topAt(f) + 0.024 - t * 0.03; gH.box(x, y, Z(f), hw0 * 0.055, 0.006, 0.012, [0.85, 0.92, 1]); } }
    // ---- ボンネット中央の峰（フロントからフロントガラスまで） ----
    for (let k = 0; k < 24; k++) { const f = lerp(T.ws + 0.01, 0.985, k / 23), f2 = lerp(T.ws + 0.01, 0.985, (k + 1) / 23), y1 = topAt(f) + 0.016, y2 = topAt(f2) + 0.016;
      gP.hexa([[-0.018, y1 - 0.02, Z(f)], [0.018, y1 - 0.02, Z(f)], [0.018, y2 - 0.02, Z(f2)], [-0.018, y2 - 0.02, Z(f2)], [-0.008, y1, Z(f)], [0.008, y1, Z(f)], [0.008, y2, Z(f2)], [-0.008, y2, Z(f2)]], body); }
    // ---- ルーフ中央のライン・リアのセンターフィン ----
    { const pts = []; for (let k = 0; k <= 20; k++) { const f = lerp(T.rf - 0.01, T.rr, k / 20); pts.push([f, roofY(f) + 0.012]); }
      for (let k = 1; k <= 16; k++) { const t = k / 16, f = lerp(T.rr, T.rb, t); pts.push([f, lerp(roofY(T.rr), beltAt(T.rb), Math.pow(t, 1.2)) + 0.03 + 0.03 * Math.sin(t * PI)]); }
      for (let k = 1; k <= 14; k++) { const f = lerp(T.rb, 0.035, k / 14); pts.push([f, topAt(f) + 0.06 * (1 - k / 14) + 0.012]); }
      for (let i = 0; i < pts.length - 1; i++) { const [fa, ya] = pts[i], [fb, yb] = pts[i + 1], wa = fa < T.rr ? 0.012 : 0.02, wb = fb < T.rr ? 0.012 : 0.02, ba = fa < T.rr + 0.001 ? (fa < T.rb ? topAt(fa) : lerp(roofY(T.rr), beltAt(T.rb), (T.rr - fa) / (T.rr - T.rb))) : ya - 0.014, bb = fb < T.rr + 0.001 ? (fb < T.rb ? topAt(fb) : lerp(roofY(T.rr), beltAt(T.rb), (T.rr - fb) / (T.rr - T.rb))) : yb - 0.014;
        gP.hexa([[-wa, ba, Z(fa)], [wa, ba, Z(fa)], [wb, bb, Z(fb)], [-wb, bb, Z(fb)], [-0.005, ya, Z(fa)], [0.005, ya, Z(fa)], [0.005, yb, Z(fb)], [-0.005, yb, Z(fb)]], fa > T.rr ? chromeC : body); } }
    // エンジンフードの吸気口（フィンの左右）・ルーバー
    for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const f = lerp(0.07, 0.115, k / 4); gD.box(s * 0.26, topAt(f) + 0.003, Z(f), 0.34, 0.012, 0.035, dark); }
    // ---- Cライン（クロームの大きなC字・後ろ側に吸気口） ----
    { const C = [], fc = T.rr + 0.005, fWF = (car.wb / 2 + 0.04 + L / 2) / L, top = roofY(fc) - 0.04, yB = 0.3, yc = (top + yB) / 2, ry = (top - yB) / 2, rz = 0.115;
      for (let k = 0; k <= 14; k++) { const f = lerp(T.rf - 0.03, fc, k / 14); C.push([f, roofY(f) - 0.04]); }
      const arc = (a, o = 0) => [fc - Math.sin(a) * (rz + o), yc + Math.cos(a) * ry];
      for (let k = 1; k <= 22; k++) C.push(arc(k / 22 * PI));
      for (let k = 1; k <= 12; k++) { const f = lerp(fc, fWF - 0.12, k / 12); C.push([f, yB + 0.01 * Math.sin(k / 12 * PI)]); }
      const P3 = (f, y, s, o = 0.016) => [s * (sideX(f, y) + o), y, Z(f)];
      for (const s of [-1, 1]) { for (let i = 0; i < C.length - 1; i++) { const [fa, ya] = C[i], [fb, yb] = C[i + 1]; const dz = (fb - fa) * L, dy = yb - ya, ln = Math.hypot(dz, dy) || 1, nz = -dy / ln * 0.022, ny = dz / ln * 0.022;
          const a0 = P3(fa - nz / L, ya - ny, s), a1 = P3(fa + nz / L, ya + ny, s), b0 = P3(fb - nz / L, yb - ny, s), b1 = P3(fb + nz / L, yb + ny, s); q2(gC, a0, b0, b1, a1, [s, 0, 0], chromeC); }
        // C字の後ろ側の大きな吸気口
        for (let k = 0; k < 14; k++) { const a0 = lerp(0.42, 0.97, k / 14) * PI, a1 = lerp(0.42, 0.97, (k + 1) / 14) * PI, o0 = arc(a0, 0.02), o1 = arc(a1, 0.02), i0 = arc(a0, 0.02 + 0.075 * Math.sin(a0) ** 0.6), i1 = arc(a1, 0.02 + 0.075 * Math.sin(a1) ** 0.6);
          q2(gD, P3(o0[0], o0[1], s, 0.01), P3(i0[0], i0[1], s, 0.006), P3(i1[0], i1[1], s, 0.006), P3(o1[0], o1[1], s, 0.01), [s, 0, 0], dark); }
        // サイドシル（カーボン）
        for (let k = 0; k < 10; k++) { const f = lerp(0.3, 0.7, k / 10), f2 = lerp(0.3, 0.7, (k + 1) / 10); q2(gK, P3(f, 0.16, s, 0.006), P3(f2, 0.16, s, 0.006), P3(f2, 0.22, s, 0.006), P3(f, 0.22, s, 0.006), [s, 0, 0], carbon); } } }
    // ---- リア：LEDライトバー・黒いメッシュパネル・ディフューザー・4本出しマフラー・可変リアウイング ----
    { const zr = -L / 2, yT = topAt(0.004) - 0.07;
      gD.box(0, yT - 0.02, zr + 0.012, W * 0.9, 0.12, 0.03, dark);
      gT.box(0, yT, zr + 0.002, W * 0.86, 0.03, 0.02, [1, 0.04, 0.03]);
      for (let k = 0; k < 41; k++) gT.box(-W * 0.42 + k * W * 0.84 / 40, yT - 0.022, zr + 0.002, 0.012, 0.008, 0.016, [1, 0.12, 0.08]);
      gD.box(0, 0.36, zr + 0.03, W * 0.78, 0.2, 0.05, [0.04, 0.04, 0.045]);
      for (let k = 0; k < 14; k++) gK.box(-W * 0.37 + k * W * 0.74 / 13, 0.36, zr + 0.003, 0.008, 0.18, 0.01, [0.12, 0.12, 0.13]);
      gK.box(0, 0.17, zr - 0.04, W * 0.84, 0.03, 0.22, carbon);
      for (let k = 0; k < 7; k++) gK.box(-W * 0.36 + k * W * 0.72 / 6, 0.21, zr - 0.06, 0.012, 0.09, 0.2, carbon);
      const ringZ = (cx, cy, r, z, len) => { const N = 14; for (let k = 0; k < N; k++) { const a0 = k / N * TAU, a1 = (k + 1) / N * TAU, p = (a, rr, zz) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, zz];
          q2(gC, p(a0, r, z), p(a1, r, z), p(a1, r, z + len), p(a0, r, z + len), [Math.cos(a0), Math.sin(a0), 0], chromeC); q2(gC, p(a0, r, z), p(a1, r, z), p(a1, r * 0.8, z), p(a0, r * 0.8, z), [0, 0, -1], chromeC); dbl(gD, [cx, cy, z + 0.02], p(a0, r * 0.8, z + 0.02), p(a1, r * 0.8, z + 0.02), [0, 0, -1], [0.01, 0.01, 0.01]); } };
      for (const [x, y] of [[-0.075, 0.27], [0.075, 0.27], [-0.075, 0.185], [0.075, 0.185]]) ringZ(x, y, 0.042, zr - 0.02, 0.08);
      // リアウイング（エアブレーキ）
      const fw = 0.055, yw = topAt(fw) + 0.12;
      gP.box(0, yw + 0.012, Z(fw), W * 0.84, 0.024, 0.3, body); gK.box(0, yw - 0.006, Z(fw), W * 0.84, 0.012, 0.3, carbon);
      for (const s of [-1, 1]) { gK.box(s * W * 0.22, (yw + topAt(fw)) / 2, Z(fw), 0.03, yw - topAt(fw), 0.08, carbon); gP.box(s * W * 0.42, yw + 0.03, Z(fw), 0.012, 0.07, 0.3, body); } }
    const add = (g, mat) => { if (!g.count) return; const mesh = new Mesh(gl, g.a); m.meshes.push(mesh); m.body.addMesh(mesh, mat); };
    add(gP, Mat(Object.assign({ refl: 0.32, spec: 0.9, shin: 90, metal: 0.35, rough: 0.25, clear: 1, flake: 0.5 }, A))); add(g2, Mat(Object.assign({ refl: 0.3, spec: 0.9, shin: 90, metal: 0.3, clear: 1 }, A)));
    add(gC, Mat(Object.assign({ refl: 0.88, spec: 2, shin: 170, metal: 1, rough: 0.05 }, A))); add(gD, Mat(Object.assign({ spec: 0.2, shin: 20 }, A))); add(gK, Mat(Object.assign({ spec: 0.6, shin: 50, refl: 0.15 }, A)));
    if (gH.count) { const mesh = new Mesh(gl, gH.a); m.meshes.push(mesh); m.body.addMesh(mesh, m.headMat); } if (gT.count) { const mesh = new Mesh(gl, gT.a); m.meshes.push(mesh); m.body.addMesh(mesh, m.brakeMat); }
  }
};
{ const _bm = buildCarModel; buildCarModel = function (R, car, look, opts = {}) { const m = _bm.apply(this, arguments); try { if (car && car.hero === 'aurex') AUREX.build(m, car, look || {}); } catch (e) { console.error(e); } return m; }; }
{ const _pc = packCarSvg; packCarSvg = function (car, s = 120) { if (car !== 'hy_aurex') return _pc(car, s); const id = 'ax' + s;
    return `<svg class="pk-car" viewBox="0 0 186 84" width="${s}" height="${s * 84 / 186}"><defs><linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a66d8"/><stop offset=".55" stop-color="#1d3f8f"/><stop offset="1" stop-color="#0b1a44"/></linearGradient><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9ad0ff"/><stop offset="1" stop-color="#1a2a44"/></linearGradient></defs>
      <ellipse cx="93" cy="75" rx="86" ry="5" fill="#000" opacity=".45"/>
      <path d="M6 58 C6 50 12 46 26 44 L60 38 C72 28 84 22 104 21 C122 21 138 30 152 38 L172 42 C180 44 182 50 182 56 L182 62 L6 62 Z" fill="url(#${id}b)"/>
      <path d="M66 37 C78 27 90 24 104 24 C116 24 128 30 138 37 Z" fill="url(#${id}g)" opacity=".9"/><path d="M104 24 L104 37" stroke="#0b1a44" stroke-width="2"/>
      <path d="M70 36 C88 22 120 20 134 30 C146 38 146 54 128 58 L62 58" fill="none" stroke="#e8ecf2" stroke-width="3" stroke-linecap="round"/>
      <path d="M137 40 C142 46 140 54 131 56 L136 56 C146 52 147 44 140 39 Z" fill="#05070c"/>
      <rect x="150" y="34" width="26" height="3" rx="1.5" fill="#1d3f8f"/><rect x="176" y="44" width="5" height="9" rx="1" fill="#ff2a2a"/>
      <path d="M8 50 q3 -4 10 -5" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M6 54 h8 v6 h-8z" fill="#05070c"/><path d="M7 55 q3 -2 6 0 v4 h-6z" fill="none" stroke="#e8ecf2" stroke-width="1"/>
      ${[42, 148].map(x => `<circle cx="${x}" cy="60" r="15" fill="#0a0a0c"/><circle cx="${x}" cy="60" r="10.5" fill="#b8bcc4"/>${Array.from({ length: 10 }, (_, k) => `<path d="M${x} 60 L${x + Math.cos(k * 0.628) * 10} ${60 + Math.sin(k * 0.628) * 10}" stroke="#4a4e56" stroke-width="1.6"/>`).join('')}<circle cx="${x}" cy="60" r="2.4" fill="#2a2c30"/>`).join('')}</svg>`; }; }
window.__DLX = Object.assign(window.__DLX || {}, { AUREX });

// =====================================================================
// 効果音（アンロック・星アップ・キー・始動）
// =====================================================================
Object.assign(AUDIO, {
  cfxBoom() { if (!this.ok) return; this.duckMusic(0.25, 3); this.tone(58, 1.2, 'sine', 0.5, 0, -0.5); this.tone(116, 0.5, 'triangle', 0.18, 0, -0.6); this.noiseBurst(1.2, 220, 0.7, 0.45, 0, 'lowpass'); },
  cfxWhoosh(d = 0.7) { if (!this.ok) return; this.noiseBurst(d, 900, 0.8, 0.22, 0, 'bandpass'); this.noiseBurst(d * 0.7, 3200, 1.2, 0.08, d * 0.25, 'bandpass'); this.tone(240, d, 'sine', 0.05, 0, 2.2); },
  cfxShine() { if (!this.ok) return; [1568, 2093, 2637, 3136, 4186].forEach((f, i) => this.tone(f, 0.5, 'sine', 0.06, i * 0.06)); },
  cfxSlam() { if (!this.ok) return; this.tone(70, 0.6, 'sine', 0.45, 0, -0.5); this.noiseBurst(0.35, 500, 0.8, 0.4, 0, 'lowpass'); this.noiseBurst(0.18, 5000, 1, 0.12, 0, 'highpass'); [523, 784, 1046, 1568].forEach((f, i) => this.tone(f, 0.9, 'triangle', 0.07, 0.02 + i * 0.01)); },
  cfxTick() { if (!this.ok) return; this.tone(2400, 0.02, 'square', 0.025); },
  starFly() { if (!this.ok) return; this.noiseBurst(0.5, 2400, 1.5, 0.12, 0, 'bandpass'); this.tone(500, 0.5, 'sine', 0.08, 0, 3); },
  starHit() { if (!this.ok) return; this.duckMusic(0.3, 2); this.tone(62, 0.7, 'sine', 0.5, 0, -0.5); this.noiseBurst(0.3, 600, 0.8, 0.35, 0, 'lowpass'); [1046, 1318, 1568, 2093].forEach((f, i) => this.tone(f, 0.8, 'triangle', 0.08, i * 0.05)); this.tone(3136, 0.6, 'sine', 0.05, 0.25); },
  keyIn() { if (!this.ok) return; this.noiseBurst(0.18, 4200, 3, 0.08, 0, 'bandpass'); this.noiseBurst(0.05, 1500, 2, 0.15, 0.17, 'bandpass'); this.tone(1800, 0.03, 'square', 0.06, 0.17); },
  keyTurn() { if (!this.ok) return; this.noiseBurst(0.04, 2200, 2, 0.14, 0, 'bandpass'); this.tone(900, 0.03, 'square', 0.05); },
  dashChime() { if (!this.ok) return; this.tone(1318, 0.25, 'sine', 0.08); this.tone(1046, 0.35, 'sine', 0.07, 0.18); },
  btnPress() { if (!this.ok) return; this.noiseBurst(0.05, 900, 1, 0.2, 0, 'lowpass'); this.tone(160, 0.06, 'sine', 0.15); this.tone(1200, 0.04, 'triangle', 0.04, 0.02); },
  cardSlide() { if (!this.ok) return; this.noiseBurst(0.3, 3000, 2, 0.08, 0, 'bandpass'); this.tone(1400, 0.03, 'square', 0.05, 0.3); },
  coverFlip() { if (!this.ok) return; this.noiseBurst(0.06, 1800, 2, 0.14, 0); this.tone(700, 0.05, 'square', 0.05, 0.02); },
  crank(dur = 0.9) { if (!this.ok || SAVE.data.settings.startSnd === false) return; const n = Math.round(dur / 0.085); for (let i = 0; i < n; i++) { this.tone(48 + (i % 2) * 9, 0.08, 'sawtooth', 0.11, i * 0.085); this.noiseBurst(0.06, 260 + (i % 3) * 40, 1.2, 0.12, i * 0.085, 'bandpass'); } this.tone(1900, dur, 'sine', 0.012, 0); },
  catchFire() { if (!this.ok || SAVE.data.settings.startSnd === false) return; this.noiseBurst(0.45, 320, 0.9, 0.35, 0, 'lowpass'); this.tone(65, 0.4, 'sawtooth', 0.12, 0, 0.6); }
});
{ const _st = AUDIO.starter.bind(AUDIO); AUDIO.starter = function () { if (SAVE.data && SAVE.data.settings && SAVE.data.settings.startSnd === false) return; return _st(); }; }

// エンジン音の再生ヘルパー（メニュー・演出用）
function mkEng(carId) { AUDIO.init(); AUDIO.resume && AUDIO.resume(); if (!AUDIO.ok) return null; const car = CAR_BY_ID[carId]; if (!car) return null; const inst = SAVE.data.cars.find(c => c.id === carId) || {}; const lk = inst.look || {};
  const e = AUDIO.createEngine({ sound: car.sound || 'i4', engX: lk.engX && invHas('eng_' + lk.engX) ? lk.engX : undefined, redline: car.redline || 7500, turbo: !!car.turbo, boostMax: car.turbo ? 1 : 0, car, mfType: lk.mfType || 'sport' }, true); if (!e) return null;
  const o = { e, rpm: 900, thr: 0, tgt: 900, tthr: 0, red: car.redline || 7500, script: null, t0: 0, dead: false,
    set(rpm, thr) { this.tgt = rpm; this.tthr = thr; },
    play(list, cb) { this.script = list; this.t0 = performance.now(); this.cb = cb; },
    stop(fade) { if (this.dead) return; this.dead = true; clearInterval(this.iv); if (fade) { let r = this.rpm; const iv = setInterval(() => { r = Math.max(0, r - 120); try { AUDIO.updateEngine(e, { gear: 1, rpm: Math.max(200, r), thr: 0, boost: 0, slip: 0, speed: 0, redline: o.red, limiter: false }); } catch (x) { } if (r <= 200) { clearInterval(iv); AUDIO.stopEngine(e); } }, 30); } else AUDIO.stopEngine(e); } };
  o.iv = setInterval(() => { if (o.script) { const t = (performance.now() - o.t0) / 1000; let k = o.script.length - 1; for (let i = 0; i < o.script.length; i++) if (o.script[i][0] > t) { k = i - 1; break; } if (k < 0) k = 0; const a = o.script[k], b = o.script[k + 1];
      if (b) { const u = (t - a[0]) / (b[0] - a[0]); o.tgt = a[1] + (b[1] - a[1]) * u; o.tthr = a[2]; } else { o.tgt = a[1]; o.tthr = a[2]; const cb = o.cb; o.script = null; o.cb = null; cb && cb(); } }
    o.rpm += (o.tgt - o.rpm) * 0.35; o.thr += (o.tthr - o.thr) * 0.4; const rpm = Math.max(600, Math.min(o.red * 1.02, o.rpm + (o.tgt < 1100 ? Math.sin(performance.now() / 90) * 25 : 0)));
    try { AUDIO.updateEngine(e, { gear: 1, rpm, thr: o.thr, boost: o.thr, slip: 0, speed: 0, redline: o.red, limiter: rpm >= o.red }); } catch (x) { } }, 30);
  return o; }
const REV_SCRIPT = red => [[0, 900, 0], [0.12, red * 0.72, 1], [0.5, 1300, 0], [0.9, 1100, 0], [1.02, red * 0.98, 1], [1.5, red, 1], [1.62, 1400, 0], [2.2, 950, 0]];
const FIRE_SCRIPT = () => [[0, 400, 0.4], [0.15, 2600, 0.6], [0.5, 1500, 0], [1.1, 950, 0]];

// =====================================================================
// シネマ演出の土台（ショールームのカメラ・車を一時的に借りる）
// =====================================================================
const CINE = { lock: false, prev: null, pend: null, cam: null,
  begin(carId) { const S = UI.show; if (!S) return false; this.cam = { rot: S.rot, elev: S.elev, dist: S.dist }; this.prev = { model: S.model, sig: S.sig }; this.pend = null;
    S.model = null; S.sig = ''; const inst = SAVE.data.cars.find(c => c.id === carId) || SAVE.newCar(carId); this.lock = false; S.setCar(inst, true); this.lock = true; try { S.model && S.model.setLights(false); } catch (e) { } document.body.classList.add('cine'); return true; },
  end() { const S = UI.show; if (!S) return; this.lock = false; document.body.classList.remove('cine'); try { if (S.model && S.model !== this.prev.model) S.model.dispose(); } catch (e) { } S.model = this.prev.model; S.sig = this.prev.sig; Object.assign(S, this.cam || {}); S.idle = 0; this.prev = null;
    if (this.pend) { const [i, f] = this.pend; this.pend = null; S.setCar(i, f); } }
};
setTimeout(() => { if (typeof Showroom === 'undefined') return; const P = Showroom.prototype, _sc = P.setCar, _ss = P.stageShift, _r = P.render;
  P.setCar = function (inst, force) { if (CINE.lock) { CINE.pend = [inst, force]; return; } return _sc.call(this, inst, force); };
  P.stageShift = function () { if (CINE.lock) return [0, CINE.shiftY || 0]; return _ss.call(this); };
  P.render = function (dt) { const m = this.model, sh = (CINE.lock && CINE.shake) || (MENUENG.on && !CINE.lock ? 1 : 0); if (!m || !sh) return _r.call(this, dt); const u = m.update; const k = CINE.lock ? CINE.shake : 0.25 + MENUENG.revAmt() * 0.9;
    m.update = function (d, st) { u.call(this, d, st); const t = performance.now() / 1000; this.body.pos = [0, this.body.pos[1] + Math.sin(t * 61) * 0.0025 * k, 0]; this.body.rot = [0, Math.sin(t * 47) * 0.002 * k - 0.006 * Math.max(0, k - 0.6), Math.sin(t * 53) * 0.003 * k]; };
    try { _r.call(this, dt); } finally { m.update = u; } }; }, 0);

// =====================================================================
// 車のアンロック演出（全車両：交換・購入・パック・報酬など新しく車を手に入れたとき）
// =====================================================================
const CARFX = { q: [], busy: false, seen: null, d: null,
  root() { let o = document.getElementById('carFx'); if (!o) { o = document.createElement('div'); o.id = 'carFx'; document.body.appendChild(o); } return o; },
  queue(ids, done) { for (const id of ids) if (CAR_BY_ID[id]) this.q.push(id); if (done) this.q.push(done); this.next(); },
  next() { if (this.busy || !this.q.length) return; const x = this.q.shift(); if (typeof x === 'function') { x(); return this.next(); } this.play(x, () => { this.busy = false; this.next(); }); },
  play(id, done) { const car = CAR_BY_ID[id]; if (!car || !CINE.begin(id)) return done(); this.busy = true; const S = UI.show, o = this.root(), red = car.redline || 7500;
    const hp = car.hp, top = car.top, kg = car.kg, bar = (v, mx) => Math.min(100, v / mx * 100);
    o.className = 'show'; o.innerHTML = `<div class="cf-bars"><i></i><i></i></div><div class="cf-vig"></div><div class="cf-beam b1"></div><div class="cf-beam b2"></div><div class="cf-beam b3"></div><div class="cf-scan"></div><div class="cf-flash"></div>
      <div class="cf-top"><i></i><small>NEW CAR UNLOCKED</small><i></i></div>
      <div class="cf-info"><span class="cf-mk">${esc(car.maker)}</span><b class="cf-nm">${esc(car.name)}</b><div class="cf-row">${clsBadge(car)}${starHTML(carStars(id), carMaxStars(car))}<span class="cf-drv">${esc(car.drive || '')}</span></div>
        <div class="cf-stats">${[['最高出力', hp, ' PS', 1600], ['最高速度', top, ' km/h', 430], ['車両重量', kg, ' kg', 2400]].map(([n, v, u, mx]) => `<div class="cf-st"><small>${n}</small><b data-v="${v}">0</b><em>${u}</em><span><i style="--w:${bar(v, mx)}%"></i></span></div>`).join('')}</div></div>
      <div class="cf-stamp"><span>UNLOCKED</span></div><div class="cf-tap">画面をタップして続ける</div><div class="cf-sp">${Array.from({ length: 22 }, (_, k) => `<i style="--a:${k * 16.4}deg;--d:${(k % 5) * 0.04}s"></i>`).join('')}</div>`;
    const r0 = S.rot, T0 = performance.now(), st = c => o.classList.add(c); let ready = false, eng = null, raf = 0, closed = false;
    const ease = x => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
    const cam = () => { const t = (performance.now() - T0) / 1000; S.idle = -999; S.dist = 13.5 - 7.2 * ease((t - 0.6) / 3.2); S.rot = 0.72 + 2.5 * (1 - ease((t - 0.2) / 3.6)) + (t > 4 ? (t - 4) * 0.1 : 0); S.elev = 0.03 + 0.15 * ease((t - 0.6) / 3.2); CINE.shiftY = window.innerWidth > window.innerHeight ? 0 : 0.18; if (!closed) raf = requestAnimationFrame(cam); };
    raf = requestAnimationFrame(cam); AUDIO.cfxBoom(); AUDIO.cfxWhoosh(1.1);
    const T = []; const at = (ms, f) => T.push(setTimeout(f, ms));
    at(40, () => st('s1'));
    at(900, () => { st('s2'); try { S.model && S.model.setLights(true); } catch (e) { } AUDIO.dashChime(); AUDIO.crank(0.55); });
    at(1500, () => { AUDIO.catchFire(); eng = mkEng(id); if (eng) eng.play([[0, 500, 0.5], [0.15, red * 0.6, 1], [0.55, 1200, 0], [1.3, 1000, 0], [1.45, red * 0.95, 1], [1.95, 1300, 0], [2.6, 950, 0]]); CINE.shake = 0.9; });
    at(1700, () => { st('s3'); AUDIO.cfxWhoosh(0.5); });
    at(2500, () => { st('s4'); o.querySelectorAll('.cf-st b').forEach(b => { const v = +b.dataset.v, t0 = performance.now(); const f = () => { const u = Math.min(1, (performance.now() - t0) / 900); b.textContent = Math.round(v * ease(u)).toLocaleString(); if (u < 1) requestAnimationFrame(f); }; f(); }); for (let k = 0; k < 6; k++) setTimeout(() => AUDIO.cfxTick(), k * 120); });
    at(3600, () => { st('s5'); AUDIO.cfxSlam(); AUDIO.cfxShine(); CINE.shake = 0.4; });
    at(4300, () => { st('ready'); ready = true; });
    const close = () => { if (closed) return; closed = true; T.forEach(clearTimeout); cancelAnimationFrame(raf); AUDIO.acqWipe ? AUDIO.acqWipe() : AUDIO.cfxWhoosh(0.4); o.classList.add('out'); if (eng) eng.stop(true); CINE.shake = 0;
      setTimeout(() => { CINE.end(); o.className = ''; o.innerHTML = ''; done(); }, 520); };
    o.onclick = () => { if (ready) return close(); // スキップ：最後の状態へ
      T.forEach(clearTimeout); ['s1', 's2', 's3', 's4', 's5', 'ready'].forEach(st); try { S.model && S.model.setLights(true); } catch (e) { } o.querySelectorAll('.cf-st b').forEach(b => b.textContent = (+b.dataset.v).toLocaleString()); ready = true; if (!eng) { eng = mkEng(id); eng && eng.play(FIRE_SCRIPT()); } }; },
  // どこから手に入れても新しい車を検知する
  poll() { const d = SAVE.data; if (!d || !d.cars) return; if (this.d !== d) { this.d = d; this.seen = d.cars.map(c => c.id); return; }
    const ids = d.cars.map(c => c.id), left = this.seen.slice(), fresh = []; for (const id of ids) { const i = left.indexOf(id); if (i >= 0) left.splice(i, 1); else fresh.push(id); }
    if (!fresh.length) { this.seen = ids; this.since = 0; return; }
    if (!this.since) { this.since = performance.now(); return; } if (performance.now() - this.since < 900) return;
    if (fresh.length > 3 || UI.screen === 'title' || UI.screen === 'dev') { this.seen = ids; return; }
    if ((UI.game && UI.game.active) || ACQ.busy || ACQ.mode === 'intro' || this.busy || (PACKFX.o && PACKFX.o.classList.contains('show')) || document.querySelector('#cbFx.show') || document.querySelector('.ign.show')) return;
    this.seen = ids; this.since = 0; this.queue(fresh); }
};
setInterval(() => { try { CARFX.poll(); } catch (e) { } }, 500);
// 獲得演出（CONGRATULATIONS）の前にアンロック演出を流す
{ const _ac = acqCards; acqCards = function (d) { ACQ._cars = (d && d.cars || []).slice(); return _ac.apply(this, arguments); };
  const _sh = ACQ.show; ACQ.show = function (cards, title) { const cars = (this._cars || []).filter(id => CAR_BY_ID[id]); this._cars = null;
    if (cars.length && !this.busy && !(UI.game && UI.game.active)) { CARFX.seen = SAVE.data.cars.map(c => c.id); CARFX.d = SAVE.data; CARFX.queue(cars, () => _sh.call(ACQ, cards, title)); return; } return _sh.apply(this, arguments); }; }

// =====================================================================
// 星アップの演出（空ぶかし＋カメラの揺れ＋星が飛んでくる）
// =====================================================================
UI.starFx = function (car, n) { if (!car) return; if (CINE.lock || CARFX.busy) return setTimeout(() => UI.starFx(car, n), 400); const id = car.id, mx = carMaxStars(car), red = car.redline || 7500; if (!CINE.begin(id)) return;
  let o = document.getElementById('starFx2'); if (!o) { o = document.createElement('div'); o.id = 'starFx2'; document.body.appendChild(o); }
  const S = UI.show, r0 = S.rot, T0 = performance.now(); let closed = false, ready = false, eng = null, raf = 0; const T = [], at = (ms, f) => T.push(setTimeout(f, ms));
  o.className = 'show'; o.innerHTML = `<div class="sx-bg"></div><div class="sx-ring"></div><div class="sx-flash"></div><div class="sx-top"><small>STAR UP</small><b>${esc(car.name)}</b></div>
    <div class="sx-stars">${Array.from({ length: mx }, (_, k) => `<i class="${k < n - 1 ? 'on' : k === n - 1 ? 'tgt' : ''}">★</i>`).join('')}</div><div class="sx-fly">★</div>
    <div class="sx-rank"><b>★${n}</b><span>RANK UP!</span></div><div class="sx-perk"><span>ガレージ経験値 +150</span><span>装着できるエキストラ ${starExtraCount(car, n)} 種類</span></div><div class="sx-tap">画面をタップして閉じる</div>`;
  const cam = () => { const t = (performance.now() - T0) / 1000; S.idle = -999; S.dist = 8.5 - 2.6 * Math.min(1, t / 1.2); S.rot = r0 * 0 + 0.55 + Math.sin(t * 0.4) * 0.15; S.elev = 0.12; CINE.shiftY = window.innerWidth > window.innerHeight ? 0 : 0.1;
    CINE.shake = eng ? Math.max(0, (eng.rpm - 1000) / red) * 3 : 0; if (!closed) raf = requestAnimationFrame(cam); };
  raf = requestAnimationFrame(cam); AUDIO.cfxWhoosh(0.8); try { S.model.setLights(true); } catch (e) { }
  at(60, () => o.classList.add('s1'));
  at(350, () => { eng = mkEng(id); if (eng) eng.play(REV_SCRIPT(red)); else AUDIO.levelUp && AUDIO.levelUp(); });
  at(2300, () => { o.classList.add('s2'); AUDIO.starFly(); });
  at(2750, () => { o.classList.add('s3'); AUDIO.starHit(); });
  at(3300, () => { o.classList.add('s4'); AUDIO.cfxShine(); });
  at(3800, () => { o.classList.add('ready'); ready = true; });
  const close = () => { if (closed) return; closed = true; T.forEach(clearTimeout); cancelAnimationFrame(raf); if (eng) eng.stop(true); CINE.shake = 0; o.classList.add('out'); setTimeout(() => { CINE.end(); o.className = ''; o.innerHTML = ''; }, 450); };
  o.onclick = () => { if (ready) return close(); T.forEach(clearTimeout); ['s1', 's2', 's3', 's4', 'ready'].forEach(c => o.classList.add(c)); ready = true; }; };

// =====================================================================
// キー（エンジンの手動始動）・キーチェーン
// kind: blade=差して回す / flip=ブレードが飛び出す / classic=真鍮の鍵 / fob=スマートキー＋スタートボタン / card=カードキー / toggle=レース用スイッチ
// =====================================================================
const KEYS = [
  ['std', '標準キー', 'Standard Key', '', 'blade', '#3a3c44', '#9aa0a8'],
  ['red', 'レッドグリップキー', 'Red Grip Key', 'C', 'blade', '#c81a1a', '#ff6a5a'], ['blue', 'ブルーグリップキー', 'Blue Grip Key', 'C', 'blade', '#1a5ad0', '#6ab0ff'], ['brass', '真鍮のクラシックキー', 'Brass Classic Key', 'C', 'classic', '#c8a040', '#ffe28a'], ['green', 'グリーングリップキー', 'Green Grip Key', 'C', 'blade', '#1a9a4a', '#6ae08a'],
  ['flip', 'フリップキー', 'Flip Key', 'U', 'flip', '#1c1d22', '#8a8e96'], ['carbon', 'カーボンキー', 'Carbon Key', 'U', 'blade', '#141416', '#3a3c42'], ['fobsil', 'スマートキー（シルバー）', 'Smart Key (Silver)', 'U', 'fob', '#b8bcc4', '#5a5e66'], ['wood', 'ウッドグリップキー', 'Wood Grip Key', 'U', 'blade', '#8a5428', '#c88a50'],
  ['fobred', 'スマートキー（レッド）', 'Smart Key (Red)', 'R', 'fob', '#c8102e', '#ff6a7a'], ['card', 'カードキー', 'Card Key', 'R', 'card', '#1c1d22', '#5ad1ff'], ['neon', 'ネオンキー', 'Neon Key', 'R', 'blade', '#0a1a22', '#3af0ff'], ['flipgold', 'フリップキー（ゴールド）', 'Flip Key (Gold)', 'R', 'flip', '#2a2418', '#d4af37'],
  ['race', 'レーシングスイッチ', 'Racing Switch', 'E', 'toggle', '#e10600', '#ffcf3d'], ['crystal', 'クリスタルキー', 'Crystal Key', 'E', 'blade', '#9ad8ff', '#ffffff'], ['cardgold', 'ゴールドカードキー', 'Gold Card Key', 'E', 'card', '#d4af37', '#fff4c8'], ['fobcarbon', 'カーボンスマートキー', 'Carbon Smart Key', 'E', 'fob', '#18181b', '#ff8a2a'],
  ['royal', 'ロイヤルゴールドキー', 'Royal Gold Key', 'L', 'fob', '#d4af37', '#ff3a6a'], ['dragon', '龍のキー', 'Dragon Key', 'L', 'classic', '#2fbf71', '#ffcf3d'], ['hyper', 'ハイパーカーキー', 'Hypercar Key', 'L', 'fob', '#1d3f8f', '#e8ecf2'], ['racegold', 'チャンピオンスイッチ', 'Champion Switch', 'L', 'toggle', '#d4af37', '#ffffff']
];
const KEY_BY = {}; for (const [id, nm, en, r, kind, c1, c2] of KEYS) { KEY_BY[id] = { id, nm, en, r, kind, c1, c2 }; if (r) mkItem({ id: 'key_' + id, type: 'carkey', keyX: id, name: 'キー「' + nm + '」', en: 'Key "' + en + '"', rarity: r, lim: 1, desc: 'エンジンを手動で始動するときのキー（「飾り・小物」のキーで変更）' }); }
const KEYCH = [
  ['tag', 'レザータグ', 'Leather Tag', 'C'], ['tire', 'ミニタイヤ', 'Mini Tire', 'C'], ['plate', 'ナンバータグ', 'Plate Tag', 'C'], ['ring2', 'ダブルリング', 'Double Ring', 'C'],
  ['dice', 'ミニダイス', 'Mini Dice', 'U'], ['turbo', 'ミニタービン', 'Mini Turbine', 'U'], ['bear', 'くまのぬいぐるみ', 'Teddy Bear', 'U'], ['plug', 'スパークプラグ', 'Spark Plug', 'U'],
  ['piston', 'ピストン', 'Piston', 'R'], ['helmet', 'ミニヘルメット', 'Mini Helmet', 'R'], ['sakura', 'さくら', 'Sakura', 'R'], ['led', 'LEDライト', 'LED Light', 'R'],
  ['knob', 'シフトノブ', 'Shift Knob', 'E'], ['neko', 'まねきねこ', 'Lucky Cat', 'E'], ['wing', 'GTウイング', 'GT Wing', 'E'], ['flag', 'チェッカーフラッグ', 'Checkered Flag', 'E'],
  ['star', 'クリスタルスター', 'Crystal Star', 'L'], ['goldcar', '黄金のミニカー', 'Golden Mini Car', 'L']
];
const KEYCH_BY = {}; for (const [id, nm, en, r] of KEYCH) { KEYCH_BY[id] = { id, nm, en, r }; mkItem({ id: 'kc_' + id, type: 'keychain', kcX: id, name: 'キーチェーン「' + nm + '」', en: 'Keychain "' + en + '"', rarity: r, lim: 1, desc: 'キーにつけるキーチェーン（エンジン始動のときに揺れます）' }); }
Object.assign(ITEM_TYPES, { carkey: 'キー', keychain: 'キーチェーン' }); Object.assign(NEWPOOL, { carkey: 'carkey', keychain: 'keychain' });
CHESTS.push({ id: 'keypack', name: 'キーパック', price: 1500000, odds: { C: 32, U: 32, R: 22, E: 10, L: 4 }, color: '#d4af37', pool: 'carkey' },
  { id: 'keychainpack', name: 'キーチェーンパック', price: 700000, odds: { C: 34, U: 32, R: 20, E: 10, L: 4 }, color: '#ff6a3a', pool: 'keychain' });
Object.assign(PACK_ART, { keypack: { a: '#2a2006', b: '#d4af37', t: 'KEYS' }, keychainpack: { a: '#2a1006', b: '#ff6a3a', t: 'KEYCHAINS' } }); Object.assign(PACK_TIER, { keypack: 3, keychainpack: 2 });
const curKey = () => { const k = SAVE.data.keyX; return k && KEY_BY[k] && (k === 'std' || invHas('key_' + k)) ? KEY_BY[k] : KEY_BY.std; };
const curKch = () => { const k = SAVE.data.keyCh; return k && KEYCH_BY[k] && invHas('kc_' + k) ? k : ''; };

// キーの絵（正面：ヘッドが上、リングは下）
function keySvg(id, s = 60, full = false) { const K = KEY_BY[id] || KEY_BY.std, c1 = K.c1, c2 = K.c2, g = 'kg' + id + s; let b = '';
  const grad = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c2}"/><stop offset=".55" stop-color="${c1}"/><stop offset="1" stop-color="${c1}"/></linearGradient></defs>`;
  if (K.kind === 'blade' || K.kind === 'flip') { b = `${full ? `<path d="M26 4 h8 v34 h-8z" fill="#c8ccd2" stroke="#8a8e96"/><path d="M34 10 l4 3 -4 3 4 3 -4 3 4 3 -4 3" fill="none" stroke="#8a8e96" stroke-width="1.5"/>` : ''}<rect x="12" y="34" width="36" height="48" rx="${K.kind === 'flip' ? 10 : 16}" fill="url(#${g})" stroke="rgba(0,0,0,.45)" stroke-width="2"/>`
      + (K.kind === 'flip' ? `<circle cx="30" cy="50" r="5" fill="#2a2c30" stroke="${c2}"/><circle cx="30" cy="64" r="5" fill="#2a2c30" stroke="${c2}"/><rect x="40" y="38" width="4" height="10" rx="2" fill="${c2}"/>` : `<circle cx="30" cy="56" r="8" fill="none" stroke="${c2}" stroke-width="2.5" opacity=".9"/>${id === 'neon' ? `<rect x="12" y="34" width="36" height="48" rx="16" fill="none" stroke="#3af0ff" stroke-width="2" opacity=".9"/>` : ''}`)
      + `<circle cx="30" cy="76" r="3.6" fill="#0a0a0c"/>`; }
  else if (K.kind === 'classic') { b = `${full ? `<path d="M27 2 h6 v42 h-6z" fill="${c1}" stroke="rgba(0,0,0,.4)"/><path d="M33 8 h6 v4 h-6 M33 16 h4 v4 h-4" fill="${c1}" stroke="rgba(0,0,0,.4)"/>` : ''}<rect x="25" y="38" width="10" height="10" fill="${c1}" stroke="rgba(0,0,0,.4)"/><circle cx="30" cy="64" r="17" fill="none" stroke="url(#${g})" stroke-width="7"/><circle cx="30" cy="64" r="17" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1"/>${id === 'dragon' ? `<path d="M18 58 q12 -14 24 0 q-12 8 -24 0" fill="${c2}" opacity=".85"/><circle cx="30" cy="64" r="4" fill="#e10600"/>` : `<circle cx="30" cy="64" r="5" fill="${c2}" opacity=".7"/>`}<circle cx="30" cy="82" r="3.4" fill="#0a0a0c"/>`; }
  else if (K.kind === 'fob') { b = `<rect x="10" y="20" width="40" height="62" rx="18" fill="url(#${g})" stroke="rgba(0,0,0,.5)" stroke-width="2"/><rect x="16" y="30" width="28" height="40" rx="11" fill="rgba(0,0,0,.28)"/>${[38, 50, 62].map((y, k) => `<rect x="21" y="${y - 4}" width="18" height="8" rx="4" fill="#2a2c30" stroke="${c2}" stroke-width="1"/><path d="M${k === 0 ? '27 36 h6' : k === 1 ? '27 48 l3 -2 3 2' : '28 60 h4 v4 h-4z'}" stroke="${c2}" stroke-width="1.2" fill="none"/>`).join('')}${id === 'royal' ? `<circle cx="30" cy="26" r="3" fill="#ff3a6a"/><circle cx="22" cy="74" r="2" fill="#3ac8ff"/><circle cx="38" cy="74" r="2" fill="#3ac8ff"/>` : ''}${id === 'hyper' ? `<path d="M18 26 q12 -6 24 0" stroke="#e8ecf2" stroke-width="2" fill="none"/>` : ''}<circle cx="30" cy="80" r="3.4" fill="#0a0a0c"/>`; }
  else if (K.kind === 'card') { b = `<rect x="6" y="22" width="48" height="62" rx="6" fill="url(#${g})" stroke="rgba(0,0,0,.45)" stroke-width="2"/><rect x="14" y="32" width="16" height="12" rx="2" fill="#e8c860" stroke="#a08020"/><path d="M14 38 h16 M22 32 v12" stroke="#a08020" stroke-width=".8"/><path d="M14 56 h32 M14 62 h24" stroke="${c2}" stroke-width="2" opacity=".7"/><circle cx="44" cy="74" r="3" fill="#0a0a0c"/>`; }
  else { b = `<rect x="18" y="14" width="24" height="46" rx="5" fill="url(#${g})" stroke="rgba(0,0,0,.45)" stroke-width="2"/><rect x="22" y="20" width="16" height="6" fill="${c2}"/><text x="30" y="44" font-size="7" font-weight="900" text-anchor="middle" fill="${c2}" font-family="Arial" transform="rotate(-90 30 40)">RACE</text><path d="M30 60 v14" stroke="${c1}" stroke-width="4"/><circle cx="30" cy="78" r="4" fill="none" stroke="#c8ccd2" stroke-width="2"/>`; }
  return `<svg class="key-svg" viewBox="0 0 60 90" width="${s}" height="${s * 1.5}">${grad}${b}</svg>`; }
// キーチェーンの絵（48x48、上端の中央が吊り下げ点）
function kchSvg(id, s = 40) { const B = {
  tag: `<path d="M14 8 h20 l4 6 v26 a4 4 0 0 1 -4 4 h-20 a4 4 0 0 1 -4 -4 v-26z" fill="#8a4a20" stroke="#5a2a10" stroke-width="2"/><path d="M14 14 h20 v24 h-20z" fill="none" stroke="#c88a50" stroke-dasharray="2 2"/><text x="24" y="31" font-size="9" font-weight="900" text-anchor="middle" fill="#ffd8a0" font-family="Arial">DL</text>`,
  tire: `<circle cx="24" cy="26" r="17" fill="#141416"/>${Array.from({ length: 12 }, (_, k) => `<rect x="23" y="8" width="2" height="5" fill="#333" transform="rotate(${k * 30} 24 26)"/>`).join('')}<circle cx="24" cy="26" r="9" fill="#c8ccd2"/>${[0, 72, 144, 216, 288].map(a => `<path d="M24 26 V18" stroke="#6a6e76" stroke-width="3" transform="rotate(${a} 24 26)"/>`).join('')}`,
  plate: `<rect x="6" y="14" width="36" height="22" rx="3" fill="#f4f4ee" stroke="#2a7a3a" stroke-width="2.5"/><text x="24" y="30" font-size="11" font-weight="900" text-anchor="middle" fill="#2a7a3a" font-family="Arial">86-48</text>`,
  ring2: `<circle cx="18" cy="24" r="10" fill="none" stroke="#c8ccd2" stroke-width="3.5"/><circle cx="30" cy="30" r="10" fill="none" stroke="#e8c860" stroke-width="3.5"/>`,
  dice: `<rect x="6" y="12" width="20" height="20" rx="5" fill="#fff" stroke="#ccc" stroke-width="2"/><rect x="22" y="20" width="20" height="20" rx="5" fill="#e10600" stroke="#900" stroke-width="2"/>${[[11, 17], [21, 27], [16, 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#111"/>`).join('')}${[[27, 25], [37, 35], [27, 35], [37, 25]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`).join('')}`,
  turbo: `<circle cx="24" cy="26" r="17" fill="#b8bcc4" stroke="#6a6e76" stroke-width="2"/>${Array.from({ length: 8 }, (_, k) => `<path d="M24 26 q7 -5 3 -15" stroke="#4a4e56" stroke-width="2.5" fill="none" transform="rotate(${k * 45} 24 26)"/>`).join('')}<circle cx="24" cy="26" r="4" fill="#2a2c30"/>`,
  bear: `<circle cx="14" cy="12" r="6" fill="#a86a3a"/><circle cx="34" cy="12" r="6" fill="#a86a3a"/><circle cx="24" cy="20" r="12" fill="#c8884a"/><ellipse cx="24" cy="38" rx="12" ry="9" fill="#c8884a"/><circle cx="20" cy="18" r="1.8" fill="#222"/><circle cx="28" cy="18" r="1.8" fill="#222"/><ellipse cx="24" cy="24" rx="4" ry="3" fill="#f0d0a8"/><circle cx="24" cy="23" r="1.4" fill="#222"/><path d="M14 30 q10 6 20 0" stroke="#e10600" stroke-width="3" fill="none"/>`,
  plug: `<rect x="20" y="4" width="8" height="8" fill="#c8ccd2"/><rect x="16" y="12" width="16" height="18" rx="3" fill="#f4f0e8" stroke="#bbb" stroke-width="1.5"/><path d="M16 18 h16 M16 24 h16" stroke="#ccc"/><path d="M18 30 h12 l-1 6 h-10z" fill="#8a8e96"/><path d="M20 36 h8 v6 h-8z" fill="#b8bcc4"/><path d="M24 42 v4 h4" stroke="#6a6e76" stroke-width="2" fill="none"/>`,
  piston: `<rect x="10" y="8" width="28" height="20" rx="3" fill="#c8ccd2" stroke="#6a6e76" stroke-width="2"/><path d="M10 13 h28 M10 17 h28" stroke="#6a6e76" stroke-width="1.5"/><path d="M20 28 l-2 16 h12 l-2 -16" fill="#9aa0a8" stroke="#6a6e76" stroke-width="1.5"/><circle cx="24" cy="42" r="4" fill="none" stroke="#6a6e76" stroke-width="2"/>`,
  helmet: `<path d="M6 30 a18 18 0 0 1 36 0 v6 h-36z" fill="#2a6aff" stroke="#123a9a" stroke-width="2"/><path d="M14 26 h26 v8 h-26z" fill="#141a2a"/><path d="M6 20 h36" stroke="#fff" stroke-width="3"/>`,
  sakura: [0, 72, 144, 216, 288].map(a => `<ellipse cx="24" cy="12" rx="7" ry="10" fill="#ffb0c8" stroke="#ff7aa0" stroke-width="1" transform="rotate(${a} 24 25)"/>`).join('') + '<circle cx="24" cy="25" r="4" fill="#ff5a8a"/>',
  led: `<rect x="16" y="6" width="16" height="32" rx="6" fill="#2a2c30" stroke="#5a5e66" stroke-width="2"/><circle cx="24" cy="40" r="7" fill="#9af0ff"/><circle cx="24" cy="40" r="12" fill="#9af0ff" opacity=".3"/><rect x="21" y="14" width="6" height="6" rx="1" fill="#5a5e66"/>`,
  knob: `<path d="M22 22 h4 v22 h-4z" fill="#8a8e96"/><circle cx="24" cy="18" r="14" fill="#141416" stroke="#3a3c42" stroke-width="2"/>${[[19, 12], [29, 12], [19, 22], [29, 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#fff"/>`).join('')}<path d="M19 12 v10 M29 12 v10 M19 17 h10" stroke="#fff" stroke-width="1.2"/>`,
  neko: `<ellipse cx="24" cy="32" rx="15" ry="13" fill="#fff" stroke="#ddd" stroke-width="2"/><circle cx="24" cy="18" r="11" fill="#fff" stroke="#ddd" stroke-width="2"/><path d="M15 10 l2 -7 5 5z M33 10 l-2 -7 -5 5z" fill="#fff" stroke="#ddd" stroke-width="2"/><path d="M37 24 v-9 a3 3 0 0 1 5 0 v9" fill="#fff" stroke="#ddd" stroke-width="2"/><circle cx="20" cy="17" r="1.6" fill="#222"/><circle cx="28" cy="17" r="1.6" fill="#222"/><circle cx="24" cy="34" r="5" fill="#ffcf3d" stroke="#c88a00"/>`,
  wing: `<path d="M4 14 h40 v6 h-40z" fill="#141416" stroke="#3a3c42" stroke-width="1.5"/><path d="M4 10 v14 M44 10 v14" stroke="#e10600" stroke-width="3"/><path d="M14 20 v16 M34 20 v16" stroke="#3a3c42" stroke-width="3"/><path d="M8 36 h32" stroke="#8a8e96" stroke-width="3"/>`,
  flag: `<path d="M12 6 v40" stroke="#c8ccd2" stroke-width="2.5"/><path d="M12 8 h28 v20 h-28z" fill="#fff" stroke="#222" stroke-width="1.5"/>${[0, 1, 2, 3].map(x => [0, 1, 2].map(y => (x + y) % 2 ? `<rect x="${12 + x * 7}" y="${8 + y * 6.67}" width="7" height="6.67" fill="#111"/>` : '').join('')).join('')}`,
  star: `<path d="M24 4 l6 13 14 1 -11 9 4 14 -13 -8 -13 8 4 -14 -11 -9 14 -1z" fill="#bfe8ff" stroke="#fff" stroke-width="2"/><path d="M24 4 v34 M10 19 l28 10" stroke="#fff" stroke-width="1" opacity=".7"/>`,
  goldcar: `<path d="M4 32 q2 -8 10 -9 l6 -7 h12 l8 7 q6 1 6 9 v4 h-42z" fill="#d4af37" stroke="#8a6a10" stroke-width="1.6"/><path d="M21 17 h10 l5 6 h-20z" fill="#fff4c8" opacity=".8"/><circle cx="14" cy="36" r="5" fill="#2a2418" stroke="#d4af37" stroke-width="2"/><circle cx="36" cy="36" r="5" fill="#2a2418" stroke="#d4af37" stroke-width="2"/>`
  }[id] || ''; return `<svg viewBox="0 0 48 48" width="${s}" height="${s}"><path d="M24 0 v8" stroke="#a8acb4" stroke-width="2"/>${B}</svg>`; }
{ const _ic = itemIconSvg; itemIconSvg = function (it, size = 34) { if (it && it.type === 'carkey') return keySvg(it.keyX, size * 0.66, true); if (it && it.type === 'keychain') return kchSvg(it.kcX, size); return _ic(it, size); }; }
COVER_SVG.keypack = `<g transform="translate(14 6) rotate(-18 20 40)">${keySvg('fobred', 30).replace('<svg ', '<svg x="0" y="0" ')}</g><g transform="translate(46 4) rotate(14 20 40)">${keySvg('brass', 30, true).replace('<svg ', '<svg x="0" y="0" ')}</g><circle cx="50" cy="78" r="6" fill="none" stroke="#e8c860" stroke-width="3"/>`;
COVER_SVG.keychainpack = `<path d="M50 4 v10" stroke="#ddd" stroke-width="2"/><circle cx="50" cy="18" r="6" fill="none" stroke="#c8ccd2" stroke-width="3"/>${kchSvg('dice', 34).replace('<svg ', '<svg x="14" y="22" ')}${kchSvg('goldcar', 34).replace('<svg ', '<svg x="50" y="26" ')}${kchSvg('sakura', 26).replace('<svg ', '<svg x="36" y="52" ')}`;
{ const _sh = UI.packStoreHTML; UI.packStoreHTML = function () { let h = _sh.apply(this, arguments); for (const [id, k] of [['keypack', 'エンジン始動のキー'], ['keychainpack', 'キーにつける飾り']]) h = h.replace(new RegExp(`(data-v="${id}"[\\s\\S]*?<span class="ps-kind">)[^<]*`), `$1${k}`); return h; }; }

// ---------------- 始動のアニメーション（キーを差す・回す／ボタンを押す） ----------------
const IGN = { busy: false,
  html(K, kc) { const kind = K.kind, warn = ['batt', 'oil', 'eng', 'abs', 'belt', 'temp'].map(w => `<i class="ig-w w-${w}"></i>`).join('');
    const dash = `<div class="ig-dash"><div class="ig-tach"><svg viewBox="0 0 120 70"><path d="M10 64 A52 52 0 0 1 110 64" fill="none" stroke="#2a2c30" stroke-width="7"/><path d="M86 22 A52 52 0 0 1 110 64" fill="none" stroke="#e10600" stroke-width="7"/>${Array.from({ length: 9 }, (_, k) => { const a = Math.PI - k / 8 * Math.PI; return `<path d="M${60 + Math.cos(a) * 44} ${64 - Math.sin(a) * 44} L${60 + Math.cos(a) * 52} ${64 - Math.sin(a) * 52}" stroke="#ddd" stroke-width="2"/>`; }).join('')}</svg><i class="ig-needle"></i><b>x1000rpm</b></div><div class="ig-warn">${warn}</div></div>`;
    const kch = kc ? `<span class="ig-kch">${kchSvg(kc, 46)}</span>` : '';
    if (kind === 'blade' || kind === 'flip' || kind === 'classic') return `${dash}<div class="ig-pan cyl"><div class="ig-cyl"><span class="m m0">LOCK</span><span class="m m1">ACC</span><span class="m m2">ON</span><span class="m m3">START</span><i class="ig-slot"></i><div class="ig-key">${keySvg(K.id, 80)}${kch}</div></div></div>`;
    const btn = `<button class="ig-btn" tabindex="-1"><i></i><b>ENGINE</b><small>START<br>STOP</small></button>`;
    if (kind === 'fob') return `${dash}<div class="ig-pan push"><div class="ig-tray"><div class="ig-key fob">${keySvg(K.id, 54)}${kch}</div></div>${btn}</div>`;
    if (kind === 'card') return `${dash}<div class="ig-pan push"><div class="ig-cslot"><i></i><div class="ig-key card">${keySvg(K.id, 54)}${kch}</div></div>${btn}</div>`;
    return `${dash}<div class="ig-pan tsw"><div class="ig-plug"><i></i><div class="ig-key plug">${keySvg(K.id, 46)}${kch}</div></div><div class="ig-tog"><span class="ig-cover"></span><span class="ig-lever"></span><small>IGN</small></div>${btn}</div>`; },
  // mode: 'race' | 'menu' | 'try' | 'off'
  run(mode, carId, done) { if (this.busy) return; this.busy = true; const K = curKey(), kc = curKch(), o = document.createElement('div'); o.className = 'ign ' + mode + ' k-' + K.kind; document.body.appendChild(o);
    o.innerHTML = `<div class="ig-bg"></div><div class="ig-box"><div class="ig-head"><b>${mode === 'off' ? 'ENGINE STOP' : 'ENGINE START'}</b><small>${mode === 'off' ? '' : K.kind === 'fob' || K.kind === 'card' ? 'タップしてスタートボタンを押す' : K.kind === 'toggle' ? 'タップしてスイッチを入れる' : 'タップしてキーを差し込んで回す'}${mode === 'race' ? '（Enter / Space）' : ''}</small></div>${this.html(K, kc)}<div class="ig-name">${esc(K.nm)}${kc ? ' ・ ' + esc(KEYCH_BY[kc].nm) : ''}</div>${mode === 'menu' || mode === 'try' ? '<button class="ig-x" data-x="1">×</button>' : ''}</div>`;
    requestAnimationFrame(() => o.classList.add('show')); let started = false, eng = null; const T = [], at = (ms, f) => T.push(setTimeout(f, ms)); const st = c => o.classList.add(c);
    const finish = (ok) => { T.forEach(clearTimeout); document.removeEventListener('keydown', kd, true); o.classList.add('out'); setTimeout(() => { o.remove(); this.busy = false; }, 420); done && done(ok, eng); };
    const go = () => { if (started) return; started = true; st('go'); const kind = K.kind; let t = 0;
      if (mode === 'off') { if (kind === 'blade' || kind === 'flip' || kind === 'classic') { st('in'); st('p2'); at(120, () => { o.classList.remove('p2'); st('p0'); AUDIO.keyTurn(); }); } else { at(60, () => { st('press'); AUDIO.btnPress(); }); } at(650, () => finish(true)); return; }
      if (kind === 'blade' || kind === 'flip' || kind === 'classic') { if (kind === 'flip') { st('flip'); AUDIO.coverFlip(); t = 260; } at(t, () => { st('in'); AUDIO.keyIn(); }); at(t + 450, () => { st('p1'); AUDIO.keyTurn(); }); at(t + 750, () => { st('p2'); st('on'); AUDIO.keyTurn(); AUDIO.dashChime(); }); at(t + 1350, () => { st('p3'); AUDIO.keyTurn(); AUDIO.crank(0.85); }); t += 2200; }
      else if (kind === 'fob' || kind === 'card') { at(0, () => { st('in'); kind === 'card' ? AUDIO.cardSlide() : AUDIO.keyIn(); }); at(550, () => { st('on'); AUDIO.dashChime(); }); at(1050, () => { st('press'); AUDIO.btnPress(); AUDIO.crank(0.8); }); t = 1850; }
      else { at(0, () => { st('in'); AUDIO.keyIn(); }); at(420, () => { st('cov'); AUDIO.coverFlip(); }); at(760, () => { st('lev'); st('on'); AUDIO.keyTurn(); AUDIO.dashChime(); }); at(1250, () => { st('press'); AUDIO.btnPress(); AUDIO.crank(0.75); }); t = 2000; }
      at(t, () => { st('fire'); o.classList.remove('p3'); AUDIO.catchFire(); if (mode !== 'race') { eng = mkEng(carId); eng && eng.play(FIRE_SCRIPT()); } });
      at(t + 900, () => finish(true)); };
    const kd = e => { if (mode !== 'race' && e.key === 'Escape') { e.preventDefault(); finish(false); return; } if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') { e.preventDefault(); e.stopPropagation(); go(); } };
    document.addEventListener('keydown', kd, true);
    o.addEventListener('click', e => { if (e.target.dataset && e.target.dataset.x) { if (!started) finish(false); return; } go(); });
    if (mode === 'off') go(); }
};

// ---------------- フリードライブの手動始動（設定でON/OFF） ----------------
{ const GP = Game.prototype, _st = GP.start, _up = GP.update;
  GP.start = function (cfg) { const man = SAVE.data.settings.manualStart && cfg && cfg.mode === 'free' && !cfg.replay; MENUENG.off(true); let r; if (man) { const s0 = AUDIO.starter; AUDIO.starter = () => { }; try { r = _st.apply(this, arguments); } finally { AUDIO.starter = s0; } } else r = _st.apply(this, arguments);
    this._keyWait = !!man; if (man) { const g = this; setTimeout(() => { if (!g.active) return; IGN.run('race', g.carInst.id, () => { g._keyWait = false; if (!g.active) return; try { if (g.engine) AUDIO.stopEngine(g.engine); g.engine = AUDIO.createEngine(Object.assign({}, g.spec, { car: CAR_BY_ID[g.carInst.id], mfType: g.carInst.look.mfType || ['stock', 'sport', 'big', 'titanium'][g.carInst.tune.muffler || 0] }), true); } catch (e) { } }); }, 350); }
    return r; };
  GP.update = function (dt) { if (this._keyWait) { if (this.engine) { AUDIO.stopEngine(this.engine); this.engine = null; } if (this.started) { this.started = false; } this.countdown = Math.max(this.countdown, 3.6); this.lastCD = 99; } return _up.call(this, dt); }; }
// フリードライブは最初から started なので、キー待ちの間は止める
{ const GP = Game.prototype, _st = GP.start; GP.start = function (cfg) { const r = _st.apply(this, arguments); if (this._keyWait && this.started) { this.started = false; this.countdown = 3.6; } return r; }; }

// ---------------- メインメニューでエンジンON/OFF（レースとは別） ----------------
const MENUENG = { on: false, eng: null, car: null, rev: false,
  revAmt() { return this.eng ? Math.max(0, (this.eng.rpm - 900) / (this.eng.red || 7500)) : 0; },
  start() { if (this.on || IGN.busy) return; const id = SAVE.cur().id; IGN.run('menu', id, (ok, eng) => { if (!ok) { if (eng) eng.stop(); return; } this.on = true; this.car = id; this.eng = eng || mkEng(id); try { UI.show.model && UI.show.model.setLights(true); } catch (e) { } this.paint(); }); },
  off(silent) { if (!this.on) return; this.on = false; const e = this.eng; this.eng = null; this.rev = false; if (silent) { if (e) e.stop(); this.paint(); return; } IGN.run('off', this.car, () => {}); if (e) e.stop(true); this.paint(); },
  toggle() { this.on ? this.off() : this.start(); },
  setRev(v) { this.rev = v; if (this.eng) this.eng.set(v ? (this.eng.red || 7500) * 0.92 : 900, v ? 1 : 0); },
  paint() { const b = document.getElementById('engBtn'); if (!b) return; b.classList.toggle('on', this.on); b.querySelector('b').textContent = this.on ? 'ENGINE ON' : 'ENGINE OFF'; const r = document.getElementById('engRev'); if (r) r.style.display = this.on ? '' : 'none'; },
  mount() { const mc = document.querySelector('#s-menu .menu-car') || document.querySelector('.menu-car'); if (!mc || document.getElementById('engBtn')) return this.paint();
    mc.insertAdjacentHTML('afterbegin', `<div class="eng-ctl"><button id="engBtn" class="eng-btn"><i class="eng-ic"></i><b>ENGINE OFF</b><small>${esc(curKey().nm)}</small></button><button id="engRev" class="eng-rev" style="display:none">空ぶかし<small>長押し</small></button></div>`);
    document.getElementById('engBtn').addEventListener('click', e => { e.stopPropagation(); AUDIO.tap && AUDIO.tap(); this.toggle(); }); const r = document.getElementById('engRev'); const dn = e => { e.preventDefault(); this.setRev(true); }, up = () => this.setRev(false); r.addEventListener('pointerdown', dn); r.addEventListener('pointerup', up); r.addEventListener('pointerleave', up); r.addEventListener('pointercancel', up); this.paint(); }
};
UI.a_engToggle = function () { MENUENG.toggle(); };
{ const _mi = UI.menuItems; UI.menuItems = function () { const r = _mi.apply(this, arguments); try { MENUENG.mount(); const s = document.querySelector('#engBtn small'); if (s) s.textContent = curKey().nm; } catch (e) { } return r; }; }
setInterval(() => { if (!MENUENG.on) return; const cur = SAVE.cur(); if ((UI.game && UI.game.active) || !cur || cur.id !== MENUENG.car || document.hidden) MENUENG.off(true); }, 600);

// ---------------- 「飾り・小物」にキー・キーチェーンのタブ ----------------
CM_TABS.push(['key', 'キー'], ['keychain', 'キーチェーン']);
{ const _rc = UI.r_charm; UI.r_charm = function () { const tab = this.cmTab; if (tab !== 'key' && tab !== 'keychain') return _rc.apply(this, arguments); $('panelTitle').textContent = 'CUSTOM'; const d = SAVE.data; this.show.setCar(SAVE.cur());
    const tabs = (this.nyTabFix ? this.nyTabFix.bind(this) : x => x)(`<div class="cm-tabs">${CM_TABS.map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-a="cmTab" data-v="${k}">${n}</button>`).join('')}</div>`);
    const K = curKey(), kc = curKch(), s = d.settings;
    const hero = `<div class="cm-hero key-hero"><div class="kh-prev"><span class="kh-k">${keySvg(K.id, 56, true)}</span>${kc ? `<span class="kh-c">${kchSvg(kc, 44)}</span>` : ''}</div><div><b>${tab === 'key' ? 'キー' : 'キーチェーン'}</b><small>${tab === 'key' ? 'エンジンを手動で始動するときに使うキー。種類によって「差して回す」「スタートボタンを押す」「カードを差す」「スイッチを入れる」など始動の動きが変わります。' : 'キーにつける飾り。エンジン始動のときにキーと一緒に揺れます。'}</small>
      <label class="cm-chk"><input type="checkbox" data-in="manStartTog" ${s.manualStart ? 'checked' : ''}> フリードライブでキーを使ってエンジンを手動で始動する</label><label class="cm-chk"><input type="checkbox" data-in="startSndTog" ${s.startSnd !== false ? 'checked' : ''}> エンジンの始動音（セルの音）を鳴らす</label>
      <div class="kh-btns"><button class="btn pri" data-a="keyTry">始動を試す</button><button class="btn" data-a="goPackSp" data-v="${tab === 'key' ? 'keypack' : 'keychainpack'}">${tab === 'key' ? 'キーパックへ' : 'キーチェーンパックへ'}</button></div></div></div>`;
    if (tab === 'key') { const all = ITEMS.filter(i => i.type === 'carkey'); return tabs + hero + `<div class="h3">${all.filter(i => invHas(i.id)).length + 1} / ${all.length + 1} 所持</div><div class="cm-grid"><button class="cm-it ${K.id === 'std' ? 'on' : ''}" data-a="setKey" data-v="std">${keySvg('std', 30, true)}<b>標準キー</b><small>最初から</small></button>${all.map(it => { const o = invHas(it.id), k = KEY_BY[it.keyX]; return `<button class="cm-it ${K.id === it.keyX ? 'on' : ''} ${o ? '' : 'lock'}" data-a="${o ? 'setKey' : 'cmLocked'}" data-v="${it.keyX}" style="--rc:${RCOL(it.rarity)}">${keySvg(it.keyX, 30, true)}<b>${esc(k.nm)}</b><small>${RARITY[it.rarity].name}・${{ blade: '差して回す', flip: 'フリップ', classic: 'クラシック', fob: 'プッシュスタート', card: 'カード', toggle: 'スイッチ' }[k.kind]}</small></button>`; }).join('')}</div>`; }
    const all = ITEMS.filter(i => i.type === 'keychain'); return tabs + hero + `<div class="h3">${all.filter(i => invHas(i.id)).length} / ${all.length} 所持</div><div class="cm-grid"><button class="cm-it ${!kc ? 'on' : ''}" data-a="setKch" data-v=""><span class="cm-none">なし</span><b>なし</b></button>${all.map(it => { const o = invHas(it.id); return `<button class="cm-it ${kc === it.kcX ? 'on' : ''} ${o ? '' : 'lock'}" data-a="${o ? 'setKch' : 'cmLocked'}" data-v="${it.kcX}" style="--rc:${RCOL(it.rarity)}">${kchSvg(it.kcX, 40)}<b>${esc(KEYCH_BY[it.kcX].nm)}</b><small>${RARITY[it.rarity].name}</small></button>`; }).join('')}</div>`; }; }
Object.assign(UI, {
  a_setKey(id) { SAVE.data.keyX = id || 'std'; SAVE.save(); AUDIO.keyIn(); this.render(); },
  a_setKch(id) { SAVE.data.keyCh = id || ''; SAVE.save(); AUDIO.confirm && AUDIO.confirm(); this.render(); },
  a_keyTry() { if (MENUENG.on) MENUENG.off(true); IGN.run('try', SAVE.cur().id, (ok, eng) => { if (eng) setTimeout(() => eng.stop(true), 1600); }); },
  in_manStartTog(v, el) { SAVE.data.settings.manualStart = !!el.checked; SAVE.save(); },
  in_startSndTog(v, el) { SAVE.data.settings.startSnd = !!el.checked; SAVE.save(); },
  a_setTog(k) { const s = SAVE.data.settings; s[k] = k === 'startSnd' ? s[k] === false : !s[k]; SAVE.save(); AUDIO.confirm && AUDIO.confirm(); this.render(); }
});
// 設定：サウンドに始動音、操作に手動始動
{ const _st = UI.r_settings; UI.r_settings = function () { const h = _st.apply(this, arguments), s = SAVE.data.settings; const row = (lb, k, on, note) => `<div class="row"><label>${lb}${note ? `<small class="set-note">${note}</small>` : ''}</label><button class="btn ${on ? 'pri' : ''}" data-a="setTog" data-v="${k}">${on ? 'ON' : 'OFF'}</button></div>`;
    if (this.tab === 'sound') return h + `<div class="h3">エンジン</div>${row('エンジンの始動音', 'startSnd', s.startSnd !== false, 'キーを回したときのセルの音・かかった瞬間の音')}`;
    if (this.tab === 'control') return h + `<div class="h3">エンジンの始動</div>${row('フリードライブでエンジンを手動で始動', 'manualStart', !!s.manualStart, 'ONにすると、フリードライブの開始時にキーを差して回す（ボタンを押す）とエンジンがかかります。キーは「飾り・小物」で変更')}`;
    return h; }; }

// ---------------- アイテムを追加 ----------------
[['hy_paint_blue', 'paint', 'ヴォルテックスブルー', 'Vortex Blue', 'E', { color: '#1d3f8f', paint: 'metallic' }], ['hy_paint_noir', 'paint', 'ノクターンブラック', 'Nocturne Black', 'R', { color: '#0b0f1c', paint: 'pearl' }], ['hy_paint_champ', 'paint', 'シャンパンゴールド', 'Champagne Gold', 'E', { color: '#c8a868', paint: 'metallic' }],
  ['hy_paint_azure', 'paint', 'アズールパール', 'Azure Pearl', 'R', { color: '#5ab0e8', paint: 'pearl' }], ['hy_paint_rosso', 'paint', 'ロッソコルサ・メタル', 'Rosso Metal', 'U', { color: '#b0101e', paint: 'metallic' }], ['hy_paint_lime', 'paint', 'ライムフラッシュ', 'Lime Flash', 'U', { color: '#a8e01a', paint: 'gloss' }],
  ['hy_dc_w16', 'decal', '「W16」ステッカー', 'W16 Sticker', 'R', { kind: 'text', text: 'W16', bg: '#1d3f8f', fg: '#e8ecf2', font: 'Arial' }], ['hy_dc_1500', 'decal', '「1500PS」ステッカー', '1500PS Sticker', 'R', { kind: 'text', text: '1500PS', bg: '#111', fg: '#ffcf3d', font: 'Arial' }], ['hy_dc_key', 'decal', '「KEY ON」ステッカー', 'KEY ON Sticker', 'U', { kind: 'text', text: 'KEY ON', bg: '#d4af37', fg: '#111', font: 'Arial' }],
  ['tt44_hyper', 'title', '称号「ハイパーカーオーナー」', 'Title "Hypercar Owner"', 'L', { title: 'ハイパーカーオーナー', titleEn: 'Hypercar Owner', lim: 1, desc: 'プロフィールとメニューに表示される称号' }], ['tt44_key', 'title', '称号「キーコレクター」', 'Title "Key Collector"', 'E', { title: 'キーコレクター', titleEn: 'Key Collector', desc: 'プロフィールとメニューに表示される称号' }],
  ['tt44_start', 'title', '称号「一発始動」', 'Title "First-Try Starter"', 'R', { title: '一発始動', titleEn: 'First-Try Starter', desc: 'プロフィールとメニューに表示される称号' }], ['tt44_rev', 'title', '称号「空ぶかし職人」', 'Title "Rev Artisan"', 'U', { title: '空ぶかし職人', titleEn: 'Rev Artisan', desc: 'プロフィールとメニューに表示される称号' }]
].forEach(([id, type, nm, en, r, o]) => mkItem(Object.assign({ id, type, name: type === 'paint' ? 'ペイント「' + nm + '」' : nm, en: type === 'paint' ? 'Paint "' + en + '"' : en, rarity: r }, o)));
// 称号「ハイパーカーオーナー」：VORTEX 16 を手に入れるともらえる
setInterval(() => { try { const d = SAVE.data; if (d && d.cars && d.cars.some(c => c.id === 'hy_aurex') && !invHas('tt44_hyper')) grantChestItem(ITEM_BY_ID.tt44_hyper); } catch (e) { } }, 3000);
// キー・チャーム
[['carkey2', 'スマートキー', 'Smart Key', 'U', '<rect x="12" y="6" width="24" height="38" rx="11" fill="#2a2c30" stroke="#5a5e66" stroke-width="2"/><rect x="18" y="14" width="12" height="6" rx="3" fill="#5ad1ff"/><rect x="18" y="24" width="12" height="6" rx="3" fill="#8a8e96"/>'],
  ['ignition', 'イグニッション', 'Ignition', 'R', '<circle cx="24" cy="24" r="20" fill="#c8ccd2" stroke="#6a6e76" stroke-width="2"/><circle cx="24" cy="24" r="12" fill="#2a2c30"/><rect x="22" y="14" width="4" height="20" rx="2" fill="#8a8e96"/><text x="24" y="10" font-size="5" text-anchor="middle" fill="#2a2c30" font-family="Arial" font-weight="900">ON</text>'],
  ['startbtn', 'スタートボタン', 'Start Button', 'E', '<circle cx="24" cy="24" r="20" fill="#141416" stroke="#e10600" stroke-width="3"/><text x="24" y="22" font-size="7" font-weight="900" text-anchor="middle" fill="#fff" font-family="Arial">START</text><text x="24" y="31" font-size="6" font-weight="900" text-anchor="middle" fill="#aaa" font-family="Arial">STOP</text>']
].forEach(([id, nm, en, r, svg]) => { CHARMS.push({ id, nm, en, r, svg }); mkItem({ id: 'ch_' + id, type: 'charm', charm: id, name: '飾り「' + nm + '」', en: 'Charm "' + en + '"', rarity: r, lim: 1, desc: 'レース中のミラーの下に吊り下げる飾り（メインメニューの「飾り」で変更）' }); });
for (const it of ITEMS) ITEM_BY_ID[it.id] = it;
window.__DLX = Object.assign(window.__DLX || {}, { CARFX, CINE, IGN, MENUENG, KEY_BY, KEYCH_BY, mkEng, keySvg, kchSvg });
// 車カード交換はすぐにアンロック演出
{ const _tr = UI.a_ccTrade; UI.a_ccTrade = function (id) { const n0 = SAVE.data.cars.filter(c => c.id === id).length; const r = _tr.apply(this, arguments); if (SAVE.data.cars.filter(c => c.id === id).length > n0) { CARFX.seen = SAVE.data.cars.map(c => c.id); CARFX.d = SAVE.data; CARFX.since = 0; CARFX.queue([id]); } return r; }; }
