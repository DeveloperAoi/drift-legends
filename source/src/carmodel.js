// =====================================================================
// carmodel.js — 車両3Dモデル（プロファイル押し出し）＋リバリー
// 車体の +Z が前方、+X が車両左側
// =====================================================================
const BODY_TYPES = {
  coupe80: { nose: .47, hood: .615, deck: .655, ws: .63, rf: .52, rr: .24, rb: .09 },
  coupe90: { nose: .42, hood: .575, deck: .625, ws: .64, rf: .53, rr: .27, rb: .12 },
  gt: { nose: .43, hood: .585, deck: .655, ws: .6, rf: .49, rr: .25, rb: .12 },
  modern: { nose: .45, hood: .615, deck: .675, ws: .63, rf: .52, rr: .27, rb: .12 },
  sedan: { nose: .47, hood: .605, deck: .675, ws: .66, rf: .57, rr: .31, rb: .2 },
  hatch: { nose: .48, hood: .630, deck: .700, ws: .69, rf: .59, rr: .2, rb: .05, tailV: 1 },
  roadster: { nose: .45, hood: .580, deck: .650, ws: .62, rf: .55, rr: .42, rb: .36, open: 1 },
  rotary: { nose: .38, hood: .555, deck: .635, ws: .62, rf: .5, rr: .27, rb: .12 },
  rally: { nose: .48, hood: .625, deck: .675, ws: .67, rf: .58, rr: .3, rb: .2 },
  super: { nose: .32, hood: .450, deck: .650, ws: .72, rf: .58, rr: .37, rb: .2 },
  hatch80: { nose: .46, hood: .600, deck: .690, ws: .66, rf: .56, rr: .19, rb: .05, tailV: 1 },
  gs1: { nose: .47, hood: .600, deck: .670, ws: .655, rf: .550, rr: .300, rb: .190 },
  gs2: { nose: .45, hood: .585, deck: .665, ws: .645, rf: .540, rr: .280, rb: .170 },
  gs3: { nose: .46, hood: .600, deck: .690, ws: .655, rf: .545, rr: .290, rb: .180 },
  gs4: { nose: .43, hood: .590, deck: .700, ws: .640, rf: .530, rr: .330, rb: .170 },
  kei: { nose: .46, hood: .560, deck: .640, ws: .73, rf: .6, rr: .3, rb: .13 },
  fd: { nose: .33, hood: .500, deck: .600, ws: .645, rf: .53, rr: .31, rb: .15 },
  wedge: { nose: .22, hood: .350, deck: .500, ws: .760, rf: .520, rr: .380, rb: .10 },
  bus: { nose: .5, hood: .6, deck: .7, ws: .66, rf: .6, rr: .3, rb: .1 },
  van: { nose: .5, hood: .6, deck: .7, ws: .66, rf: .6, rr: .3, rb: .1 }
};

function hex2rgb(h) { h = String(h).replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
function drawDecalShape(g, d, look) {
    const it = typeof ITEM_BY_ID !== 'undefined' ? ITEM_BY_ID[d] : null;
    if (it && it.kind === 'text') { g.font = `bold ${it.text.length > 6 ? 13 : it.text.length > 2 ? 18 : 24}px ${it.font === 'serif' ? 'serif' : 'Arial'}`; const w = Math.max(30, g.measureText(it.text).width + 14); g.fillStyle = it.bg; g.fillRect(-w / 2, -12, w, 24); g.fillStyle = it.fg; g.fillText(it.text, 0, 1); }
    else if (it && it.kind === 'shape') drawShape(g, it.shape, it.color);
    if (d === 'touge') { g.fillStyle = '#fff'; g.fillRect(-26, -16, 52, 32); g.fillStyle = '#111'; g.font = 'bold 26px serif'; g.fillText('峠', 0, 2); }
    else if (d === 'legends') { g.fillStyle = '#e10600'; g.font = 'italic bold 16px Arial'; g.fillText('DRIFT LEGENDS', 0, 0); }
    else if (d === 'doraku') { g.fillStyle = '#fff'; g.font = 'bold 15px serif'; g.fillText('峠道楽', 0, 0); }
    else if (d === 'shoshin') { g.fillStyle = '#1bb34a'; g.beginPath(); g.moveTo(-12, -14); g.lineTo(0, -6); g.lineTo(0, 14); g.lineTo(-12, 6); g.fill(); g.fillStyle = '#ffd400'; g.beginPath(); g.moveTo(12, -14); g.lineTo(0, -6); g.lineTo(0, 14); g.lineTo(12, 6); g.fill(); }
    else if (d === 'kaze') { g.fillStyle = 'rgba(0,0,0,0.75)'; g.font = 'bold 22px serif'; g.fillText('風神', 0, 0); }
    else if (d === 'nightkids') { g.fillStyle = '#111'; g.fillRect(-40, -9, 80, 18); g.fillStyle = '#fff'; g.font = 'bold 11px Arial'; g.fillText('MIDNIGHT CLUB', 0, 1); }
    else if (d === 'snowman') { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 8, 12, 0, TAU); g.arc(0, -10, 8, 0, TAU); g.fill(); g.fillStyle = '#f80'; g.fillRect(0, -11, 8, 3); g.fillStyle = '#c00018'; g.fillRect(-9, -3, 18, 3); }
    else if (d === 'sponsor') { g.fillStyle = '#111'; g.fillRect(-44, -10, 88, 20); g.fillStyle = '#ffd400'; g.font = 'italic bold 13px Arial'; g.fillText('KAZE OIL', 0, 1); }
    else if (d === 'num') { g.fillStyle = '#fff'; g.fillRect(-22, -16, 44, 32); g.fillStyle = '#111'; g.font = 'bold 22px Arial'; g.fillText(String(look.number || 0), 0, 2); }
    else if (d === 'xmas') { g.fillStyle = '#c00018'; g.fillRect(-48, -10, 96, 20); g.fillStyle = '#fff'; g.font = 'bold 11px Arial'; g.fillText('MERRY DRIFTMAS', 0, 1); }
}
function drawLivery(look, car, W = 512, H = 128) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const col = look.color, c2 = look.color2;
  g.fillStyle = col; g.fillRect(0, 0, W, H);
  // UV: u=0 が後端(左側面では前端) → ここでは「前=右」で描き、左右面のUVで向きが揃う
  const lv = look.livery;
  g.save();
  if (lv === 'stripe') { g.fillStyle = c2; g.fillRect(0, H * 0.38, W, H * 0.1); g.fillRect(0, H * 0.52, W, H * 0.1); }
  else if (lv === 'side') { g.fillStyle = c2; g.beginPath(); g.moveTo(0, H * 0.55); g.lineTo(W, H * 0.45); g.lineTo(W, H * 0.52); g.lineTo(0, H * 0.64); g.fill(); }
  else if (lv === 'two') { g.fillStyle = c2; g.fillRect(0, H * 0.6, W, H * 0.4); }
  else if (lv === 'panda') { g.fillStyle = '#111114'; g.fillRect(0, H * 0.56, W, H * 0.44); g.fillStyle = '#f4f4f4'; g.fillRect(0, 0, W, H * 0.56); }
  else if (lv === 'fade') { const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, col); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  else if (lv === 'flame') { g.fillStyle = c2; for (let i = 0; i < 7; i++) { g.beginPath(); const y = H * 0.35 + i * 6; g.moveTo(W, y); g.quadraticCurveTo(W * 0.6, y - 25, W * (0.25 + (i % 3) * 0.07), y + 4); g.quadraticCurveTo(W * 0.6, y + 10, W, y + 18); g.fill(); } }
  else if (lv === 'race') { g.fillStyle = c2; g.fillRect(0, H * 0.45, W, H * 0.06); g.fillStyle = '#fff'; g.beginPath(); g.arc(W * 0.5, H * 0.52, 26, 0, TAU); g.fill(); g.fillStyle = '#111'; g.font = 'bold 34px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(look.number || 0), W * 0.5, H * 0.53); }
  else if (lv === 'candy') { g.save(); g.beginPath(); g.rect(0, H * 0.3, W, H * 0.45); g.clip(); for (let x = -H; x < W + H; x += 36) { g.fillStyle = (x / 36 | 0) % 2 ? '#c00018' : '#f4f4f4'; g.beginPath(); g.moveTo(x, H); g.lineTo(x + 18, H); g.lineTo(x + 18 + H, 0); g.lineTo(x + H, 0); g.fill(); } g.restore(); g.fillStyle = '#0f6b2f'; g.fillRect(0, H * 0.28, W, 4); g.fillRect(0, H * 0.75, W, 4); }
  else if (lv === 'carbon') { g.fillStyle = '#151517'; g.fillRect(0, H * 0.62, W, H * 0.38); g.strokeStyle = 'rgba(255,255,255,0.06)'; for (let x = 0; x < W; x += 6) { g.beginPath(); g.moveTo(x, H * 0.62); g.lineTo(x + 6, H); g.stroke(); } g.fillStyle = c2; g.fillRect(0, H * 0.6, W, 3); }
  else if (lv === 'tiger') { g.fillStyle = c2; for (let i = 0; i < 14; i++) { const x = i * W / 14; g.beginPath(); g.moveTo(x, H * 0.3); g.quadraticCurveTo(x + 18, H * 0.5, x + 4, H * 0.78); g.lineTo(x + 14, H * 0.78); g.quadraticCurveTo(x + 28, H * 0.5, x + 12, H * 0.3); g.fill(); } }
  else if (lv === 'snow') { g.fillStyle = 'rgba(255,255,255,0.9)'; const r = mulberry32(5); for (let i = 0; i < 40; i++) { const x = r() * W, y = H * 0.25 + r() * H * 0.5, s = 3 + r() * 6; g.save(); g.translate(x, y); for (let k = 0; k < 6; k++) { g.rotate(PI / 3); g.fillRect(-0.7, 0, 1.4, s); } g.restore(); } }
  g.restore();
  return c;
}
function drawShape(g, sh, col) {
  g.fillStyle = col; g.strokeStyle = '#111'; g.lineWidth = 1.5; g.beginPath();
  if (sh === 'star' || sh === 'crown') { if (sh === 'crown') { g.moveTo(-16, 10); g.lineTo(-16, -6); g.lineTo(-8, 2); g.lineTo(0, -12); g.lineTo(8, 2); g.lineTo(16, -6); g.lineTo(16, 10); } else for (let k = 0; k < 10; k++) { const r = k % 2 ? 7 : 16, a = k / 10 * TAU - PI / 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } }
  else if (sh === 'bolt') { g.moveTo(4, -16); g.lineTo(-10, 2); g.lineTo(-1, 2); g.lineTo(-5, 16); g.lineTo(10, -3); g.lineTo(1, -3); }
  else if (sh === 'heart') { g.moveTo(0, 12); g.bezierCurveTo(-22, -2, -10, -18, 0, -6); g.bezierCurveTo(10, -18, 22, -2, 0, 12); }
  else if (sh === 'circle') { g.fillStyle = '#fff'; g.fillRect(-20, -13, 40, 26); g.fillStyle = col; g.arc(0, 0, 8, 0, TAU); }
  else if (sh === 'flame') { for (let k = 0; k < 3; k++) { g.moveTo(-20, 8 - k * 6); g.quadraticCurveTo(0, -14 + k * 4, 20, -4 + k * 5); g.quadraticCurveTo(4, 2, -20, 12 - k * 6); } }
  else if (sh === 'sakura') { for (let k = 0; k < 5; k++) { const a = k / 5 * TAU - PI / 2; g.moveTo(0, 0); g.ellipse(Math.cos(a) * 8, Math.sin(a) * 8, 7, 4.5, a, 0, TAU); } }
  else if (sh === 'wing') { g.moveTo(0, 4); for (let k = 0; k < 4; k++) { g.lineTo(-6 - k * 5, -10 + k * 4); g.lineTo(-8 - k * 5, -4 + k * 4); } g.lineTo(0, 8); g.lineTo(0, 4); }
  else if (sh === 'diamond') { g.moveTo(0, -14); g.lineTo(12, -2); g.lineTo(0, 14); g.lineTo(-12, -2); }
  else if (sh === 'checker') { g.fillStyle = '#fff'; g.fillRect(-20, -12, 40, 24); g.fillStyle = '#111'; for (let y = 0; y < 3; y++) for (let x = 0; x < 5; x++) if ((x + y) % 2) g.fillRect(-20 + x * 8, -12 + y * 8, 8, 8); return; }
  else if (sh === 'paw') { g.arc(0, 4, 7, 0, TAU); for (const [x, y] of [[-8, -6], [-3, -10], [3, -10], [8, -6]]) { g.moveTo(x + 3, y); g.arc(x, y, 3, 0, TAU); } }
  else if (sh === 'skullx') { g.arc(0, -2, 11, 0, TAU); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(-4, -3, 3, 0, TAU); g.arc(4, -3, 3, 0, TAU); g.fill(); g.fillStyle = col; g.fillRect(-6, 6, 12, 6); return; }
  else if (sh === 'phoenix' || sh === 'dragon') { g.lineWidth = 3; g.strokeStyle = col; g.beginPath(); for (let k = 0; k <= 30; k++) { const t = k / 30; g.lineTo(-26 + t * 52, Math.sin(t * TAU * 1.5) * 9 * (sh === 'dragon' ? 1 : 0.6) - (sh === 'phoenix' ? t * 6 : 0)); } g.stroke(); g.beginPath(); g.arc(26, sh === 'dragon' ? 0 : -6, 5, 0, TAU); g.fill(); return; }
  g.closePath(); g.fill(); g.stroke();
}
function drawPlate(text) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#f4f4ee'; g.fillRect(0, 0, 128, 64); g.strokeStyle = '#2a7a3a'; g.lineWidth = 4; g.strokeRect(3, 3, 122, 58);
  g.fillStyle = '#2a7a3a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const t = String(text || '').slice(0, 12); const parts = t.split(' ');
  if (parts.length > 1) { g.font = 'bold 16px sans-serif'; g.fillText(parts[0], 64, 18); g.font = 'bold 26px sans-serif'; g.fillText(parts.slice(1).join(' '), 64, 44); }
  else { g.font = 'bold 26px sans-serif'; g.fillText(t, 64, 34); }
  return c;
}

const PAINT_MAT = { // PBR 風：metal=金属度 rough=粗さ clear=クリアコート flake=メタリックの粒
  gloss: { refl: 0.18, spec: 0.6, shin: 60, rough: 0.15, clear: 0.9 }, metallic: { refl: 0.32, spec: 0.9, shin: 90, metal: 0.35, rough: 0.25, clear: 1, flake: 0.55 },
  matte: { refl: 0.02, spec: 0.06, shin: 8, rough: 0.9, clear: 0 }, pearl: { refl: 0.42, spec: 1.2, shin: 130, metal: 0.2, rough: 0.12, clear: 1, flake: 0.35 },
  chrome: { refl: 0.92, spec: 2.0, shin: 180, metal: 1, rough: 0.03, clear: 0.3 }, candy: { refl: 0.45, spec: 1.3, shin: 120, metal: 0.5, rough: 0.08, clear: 1.2, flake: 0.4 }, diamond: { refl: 0.95, spec: 2.6, shin: 240, metal: 0.8, rough: 0.02, clear: 1, flake: 1 }
};

function buildCarModel(R, car, look, opts = {}) {
  const T0 = BODY_TYPES[car.body] || BODY_TYPES.coupe90;
  // 実車らしいプロポーション：ボンネットとベルトラインを少し高く（ぺったんこ防止）
  const HB = { super: 0.025, wedge: 0.02, fd: 0.035, bus: 0, van: 0, sleigh: 0, kei: 0.03 }[car.body] ?? 0.045;
  const T = Object.assign({}, T0, { hood: T0.hood + HB, deck: T0.deck + HB * 0.8, nose: T0.nose + HB * 0.45 }); if (T.tailV && car.L > 4.25) { T.tailV = 0; T.rr = Math.max(T.rr, 0.24); T.rb = Math.max(T.rb, 0.07); }
  const L = car.L, W = car.W, H = car.H, z0 = -L / 2, clr = 0.135, hw0 = W / 2;
  const wide = pick([0, 1, 2, 2.6, 2, 2.9, 0, 1.4], look.fender || 0);
  const Z = f => z0 + f * L, Yh = f => f * H;
  const bodyCol = hexToRgb(look.color), col2 = hexToRgb(look.color2 || '#111114');
  const topCol = look.livery === 'panda' ? [0.95, 0.95, 0.95] : bodyCol;
  // ---- 形状関数 ----
  // フロントは実車のように厚みのあるバンパー面を持たせる（ノーズ高さに下限）
  const noseH = Math.max(T.nose + (car.body === 'super' ? 0.05 : 0.03), car.body === 'wedge' ? 0.3 : 0.4), hoodH = Math.max(T.hood, noseH + 0.06);
  const tp = [[0, T.deck - 0.07], [0.02, T.deck - 0.02], [0.05, T.deck], [T.rb, T.deck + 0.015], [T.ws, hoodH], [lerp(T.ws, 1, 0.5), lerp(hoodH, noseH + 0.04, 0.42)], [0.95, noseH + 0.025], [0.985, noseH], [1, noseH - 0.05]];
  const topAt = f => { for (let i = 0; i < tp.length - 1; i++) { const a = tp[i], b = tp[i + 1]; if (f <= b[0]) { const t = (f - a[0]) / Math.max(1e-6, b[0] - a[0]); const s = (1 - Math.cos(t * PI)) / 2; return Yh(lerp(a[1], b[1], s)); } } return Yh(tp[tp.length - 1][1]); };
  const botAt = f => clr + (f < 0.05 ? Math.pow((0.05 - f) / 0.05, 2) * 0.08 : f > 0.97 ? Math.pow((f - 0.97) / 0.03, 2) * 0.025 : 0);
  const smst = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  // フェンダーの張り出し（タイヤの上だけ少し膨らませる）
  const fWF = (car.wb / 2 + 0.04 - z0) / L, fWR = (-car.wb / 2 + 0.04 - z0) / L, fsg = 0.48 / L, FLA = ({ gs1: 0.03, gs2: 0.038, gs3: 0.045, gs4: 0.05 })[car.body] ?? (car.body === 'super' || car.body === 'wedge' || car.body === 'gt' || car.body === 'fd' ? 0.034 : car.body === 'bus' ? 0 : 0.022);
  const flare = f => FLA * (0.75 * Math.exp(-(((f - fWF) / fsg) ** 2)) + Math.exp(-(((f - fWR) / fsg) ** 2)));
  const widthAt = f => { const fr = f > 0.5, e = fr ? 1 - f : f, ec = fr ? 0.13 : 0.09, t0 = fr ? 0.8 : 0.85; const t = (e < ec ? t0 + (1 - t0) * Math.sin(e / ec * PI / 2) : 1) * (fr ? 1 - 0.025 * smst(0.55, 1, f) : 1); return hw0 * t * (car.body === 'super' && f < 0.45 ? 1 + 0.03 * (0.45 - f) / 0.45 : 1) + flare(f) * t; };
  // ボンネット・トランク左右のフェンダーの峰（中央はわずかに盛り上がり、両脇にフェンダーの稜線）
  const RG = car.body === 'bus' || car.body === 'van' ? 0 : car.body === 'super' || car.body === 'wedge' ? 0.045 : 0.034;
  const ridgeAt = f => RG * (smst(T.ws - 0.01, T.ws + 0.05, f) * (1 - smst(0.92, 0.993, f)) + 0.5 * smst(0.015, 0.06, f) * (1 - smst(T.rb - 0.02, T.rb + 0.04, f)));
  const sec = (hw, bot, top, f = 0.5) => { const h = top - bot, r = ridgeAt(f); return [[hw * 0.92, bot], [hw * 0.985, bot + h * 0.16], [hw, bot + h * 0.42], [hw * 0.996, bot + h * 0.62], [hw * 0.972, bot + h * 0.66], [hw * 0.958, top - h * 0.12 + r * 0.35], [hw * 0.9, top - 0.012 + r * 0.8], [hw * 0.8, top + r], [hw * 0.66, top + r * 0.3 - 0.003], [hw * 0.34, top + 0.009], [0, top + 0.013]]; };
  const mirrorSec = r => r.concat(r.slice(0, -1).reverse().map(p => [-p[0], p[1]]));
  const gbCab = new GB(), gbWin = new GB(), gbFrame = new GB(), gbSide = new GB(), gbBody = new GB(), gbGlass = new GB(), gbDark = new GB(), gbLight = new GB(), gbBrake = new GB(), gbChrome = new GB(), gbInt = new GB(), gbCarbon = new GB(), gbGlow = new GB();
  // ---- ロフト（滑らかな法線） ----
  let flatShade = true;
  const loft = (P, pick) => {
    const ni = P.length, nk = P[0].length, N = [];
    for (let i = 0; i < ni; i++) { N.push([]); for (let k = 0; k < nk; k++) {
      const a = P[Math.max(0, i - 1)][k], b = P[Math.min(ni - 1, i + 1)][k], c = P[i][Math.max(0, k - 1)], d = P[i][Math.min(nk - 1, k + 1)];
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - c[0], d[1] - c[1], d[2] - c[2]];
      let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; const l = Math.hypot(...n) || 1; n = n.map(x => x / l);
      const p = P[i][k]; if (n[0] * p[0] + n[1] * (p[1] - H * 0.4) < 0) n = n.map(x => -x); N[i].push(n); } }
    for (let i = 0; i < ni - 1; i++) for (let k = 0; k < nk - 1; k++) {
      const q = [[i, k], [i + 1, k], [i + 1, k + 1], [i, k + 1]]; const cx = q.reduce((s, [a, b]) => s + P[a][b][0], 0) / 4, cy = q.reduce((s, [a, b]) => s + P[a][b][1], 0) / 4;
      const nn = q.reduce((s, [a, b]) => [s[0] + N[a][b][0], s[1] + N[a][b][1], s[2] + N[a][b][2]], [0, 0, 0]).map(x => x / 4);
      const r = pick(i, k, cx, cy, nn); if (!r) continue; const { g, c, uv } = r;
      // 面法線（フラットシェーディング）
      const p0 = P[i][k], p1 = P[i + 1][k], p3 = P[i][k + 1]; const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2], vx = p3[0] - p0[0], vy = p3[1] - p0[1], vz = p3[2] - p0[2];
      let fn = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx]; const fl = Math.hypot(...fn); fn = fl > 1e-9 ? fn.map(x => x / fl) : nn; if (fn[0] * nn[0] + fn[1] * nn[1] + fn[2] * nn[2] < 0) fn = fn.map(x => -x);
      const V = ([a, b]) => { const p = P[a][b], n = flatShade ? fn : N[a][b]; let u = 0, w = 0; if (uv) { u = cx > 0 ? 1 - (p[2] - z0) / L : (p[2] - z0) / L; w = p[1] / H; } g.v(p[0], p[1], p[2], n[0], n[1], n[2], c, u, w); };
      V(q[0]); V(q[1]); V(q[2]); V(q[0]); V(q[2]); V(q[3]);
    }
    return P;
  };
  // ---- 下部ボディ ----
  const NB = 34, fs = []; for (let i = 0; i <= NB; i++) { const t = i / NB; fs.push(t < 0.5 ? 0.5 * Math.pow(t * 2, 1.6) : 1 - 0.5 * Math.pow((1 - t) * 2, 1.6)); }
  const RAKE_F = car.body === 'super' || car.body === 'wedge' ? 0.05 : 0.035, RAKE_R = T.tailV ? 0.015 : 0.03;
  const shapeZ = (f, x, y, bot, top) => { const h = Math.max(0.05, top - bot), u = clamp((y - bot) / h, 0, 1); let z = Z(f);
    if (f > 0.93) { const w = smst(0.93, 1, f); z -= w * (RAKE_F * Math.pow(Math.max(0, u - 0.55) / 0.45, 1.6) + 0.07 * Math.pow(Math.max(0, 0.3 - u) / 0.3, 1.5)); }
    if (f < 0.06) { const w = smst(0.06, 0, f); z += w * (RAKE_R * Math.pow(Math.max(0, u - 0.6) / 0.4, 1.6) + 0.06 * Math.pow(Math.max(0, 0.3 - u) / 0.3, 1.5)); }
    return z; };
  const PB = fs.map(f => { const b = botAt(f), t = topAt(f); return mirrorSec(sec(widthAt(f), b, t, f)).map(([x, y]) => [x, y, shapeZ(f, x, y, b, t)]); });
  const stripe = look.livery === 'stripe' || look.livery === 'race';
  loft(PB, (i, k, cx, cy, n) => {
    const f = fs[i];
    if (Math.abs(n[0]) > 0.62 && f > 0.015 && f < 0.985) return { g: gbSide, c: [1, 1, 1], uv: true };
    if (look.hood >= 1 && n[1] > 0.5 && f > T.ws + 0.025 && f < 0.93) return { g: gbCarbon, c: [0.08, 0.08, 0.09] };
    if (stripe && n[1] > 0.45 && Math.abs(cx) < 0.2) return { g: gbBody, c: col2 };
    return { g: gbBody, c: n[1] > 0.45 ? topCol : bodyCol };
  });
  // 端面と底
  for (const [i, sgn] of [[0, -1], [NB, 1]]) { const ring = PB[i]; const c = ring.reduce((s, p) => [s[0] + p[0] / ring.length, s[1] + p[1] / ring.length, s[2] + p[2] / ring.length], [0, 0, 0]); for (let k = 0; k < ring.length; k++) gbBody.triN(c, ring[k], ring[(k + 1) % ring.length], [0, 0, sgn], bodyCol); }
  for (let i = 0; i < NB; i++) { const a = PB[i], b = PB[i + 1]; const n = a.length - 1; gbDark.quad(a[n], a[0], b[0], b[n], [0.04, 0.04, 0.045]); }
  gbDark.box(0, clr + 0.02, 0, W - 0.16, 0.04, L - 0.4, [0.04, 0.04, 0.045]);
  // ---- キャビン ----
  const tint = clamp(look.tint ?? 0.35, 0, 0.95); const glassC = mixc([0.48, 0.6, 0.68], [0.03, 0.035, 0.04], Math.sqrt(tint));
  const beltAt = f => topAt(f) - 0.004;
  if (T.open) {
    const fw = T.ws, yb = beltAt(fw), wb = widthAt(fw) * 0.9, yt = H * 0.86, zt = Z(fw) - 0.32;
    gbGlass.quad([-wb, yb, Z(fw)], [wb, yb, Z(fw)], [wb * 0.82, yt, zt], [-wb * 0.82, yt, zt], glassC);
    gbBody.box(0, yt + 0.015, zt, wb * 1.68, 0.035, 0.05, bodyCol); for (const s of [-1, 1]) gbBody.hexa([[s * wb, yb, Z(fw)], [s * wb + s * 0.035, yb, Z(fw)], [s * wb + s * 0.035, yb, Z(fw) - 0.05], [s * wb, yb, Z(fw) - 0.05], [s * wb * 0.82, yt, zt + 0.02], [s * wb * 0.82 + s * 0.03, yt, zt + 0.02], [s * wb * 0.82 + s * 0.03, yt, zt - 0.03], [s * wb * 0.82, yt, zt - 0.03]], bodyCol);
    for (const sx of [-0.36, 0.36]) { gbInt.box(sx, beltAt(0.4) + 0.12, Z(T.rf) - 0.6, 0.46, 0.55, 0.14, [0.07, 0.07, 0.08]); gbInt.box(sx, beltAt(0.4) - 0.12, Z(T.rf) - 0.38, 0.46, 0.12, 0.5, [0.07, 0.07, 0.08]); gbChrome.cylY(sx, beltAt(0.35), Z(T.rb) + 0.2, 0.025, 0.025, 0.32, 6, [0.5, 0.5, 0.52]); }
  } else {
    const NC = 30, cf = []; for (let i = 0; i <= NC; i++) cf.push(lerp(T.rb, T.ws, i / NC));
    // ガラスはほぼ直線で傾け、ルーフとの境だけ丸める（実車のフロントガラス／リアガラス）
    const glassCurve = (t, rnd) => { t = clamp(t, 0, 1); const k = 1 - rnd; return t < k ? t / k * (1 - rnd * 0.5) : (1 - rnd * 0.5) + rnd * 0.5 * Math.sin((t - k) / rnd * PI / 2); };
    const roofCrown = f => 0.018 * Math.sin(clamp((f - T.rr) / (T.rf - T.rr), 0, 1) * PI);
    const roofAt = f => { if (f <= T.rr) { const t = (f - T.rb) / (T.rr - T.rb); return lerp(beltAt(f), H, T.tailV ? Math.sin(clamp(t, 0, 1) * PI / 2) ** 0.5 : glassCurve(t, 0.32)); } if (f >= T.rf) { const t = (T.ws - f) / (T.ws - T.rf); return lerp(beltAt(f), H, glassCurve(t, 0.26)); } return H + roofCrown(f); };
    const PC = cf.map(f => { const b = beltAt(f), r = Math.max(b + 0.02, roofAt(f)), hb = widthAt(f) * 0.925, ht = widthAt(f) * 0.745; const right = [[hb, b], [lerp(hb, ht, 0.42), b + (r - b) * 0.55], [ht, r - 0.03], [ht * 0.82, r - 0.004], [ht * 0.4, r + 0.006], [0, r + 0.008]]; return mirrorSec(right).map(([x, y]) => [x, y, Z(f)]); });
    const mid = (T.rr + T.rf) / 2;
    loft(PC, (i, k, cx, cy, n) => {
      const f = (cf[i] + cf[i + 1]) / 2, kk = k < 5 ? k : 9 - k; // 0..4 片側インデックス
      const roof = kk >= 3 && f > T.rr + 0.015 && f < T.rf - 0.015;
      const aPil = kk === 2 && f > T.rf - 0.01; const cPil = (kk === 2 || kk === 1) && f < T.rr + 0.02; const bPil = kk <= 2 && Math.abs(f - mid) < 0.013; const sill = kk === 0 && f > T.rr && f < T.rf && false;
      if (roof || aPil || cPil || bPil || sill) return { g: gbCab, c: roof && stripe && Math.abs(cx) < 0.2 ? col2 : (look.livery === 'panda' ? [0.95, 0.95, 0.95] : bodyCol) };
      // 窓のふち（黒いモール）
      const edge = (kk <= 1 && Math.abs(f - mid) < 0.024) || (kk === 0 && (f < T.rr + 0.03 || f > T.rf - 0.02));
      if (edge) return { g: gbFrame, c: [0.03, 0.03, 0.035] };
      return { g: gbWin, c: glassC };
    });
    // シート
    for (const sx of [-0.36, 0.36]) { gbInt.box(sx, beltAt(0.4) + 0.05, Z(mid) - 0.25, 0.46, 0.6, 0.14, [0.07, 0.07, 0.08]); gbInt.box(sx, beltAt(0.4) - 0.2, Z(mid) - 0.02, 0.46, 0.12, 0.5, [0.07, 0.07, 0.08]); }
    // ルーフアクセサリー土台位置
  }
  // ダッシュボード
  gbInt.box(0, beltAt(T.ws) - 0.06, Z(T.ws) - 0.25, W * 0.8, 0.16, 0.36, [0.05, 0.05, 0.06]);
  // ---- ライト ----
  const hlc = (typeof HL_COLORS !== 'undefined' && HL_COLORS.find(c => c[0] === (look.hlCol || (look.head === 1 ? 'yellow' : 'white')))) || ['white', '', [1, 0.97, 0.9]];
  const headTint = [1, 1, 1], hlTint = hlc[2].map(v => v * (look.head === 2 ? 0.6 : 1)), hlShape = look.hl || (car.popup ? 0 : (car.hlDef || 0)), popupOn = hlShape === 9 || (car.popup && !look.hl);
  const discZ = (g, cx, cy, cz, r, col, n = 14) => { for (let k = 0; k < n; k++) { const a0 = k / n * TAU, a1 = (k + 1) / n * TAU; g.v(cx, cy, cz, 0, 0, 1, col); g.v(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r, cz, 0, 0, 1, col); g.v(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, cz, 0, 0, 1, col); } };
  const tailLens = [[1, 0.06, 0.05], [1, 0.35, 0.3], [0.35, 0.03, 0.03]][look.tail || 0];
  const frontF = y => { for (let f = 1; f > 0.6; f -= 0.002) if (topAt(f) >= y) return f; return 0.97; };
  const rearF = y => { for (let f = 0; f < 0.4; f += 0.002) if (topAt(f) >= y) return f; return 0.03; };
  const yN = topAt(0.972) - 0.07, fN = frontF(yN + 0.05) + 0.004, xN = widthAt(0.972);
  // ヘッドライト（フロント面にハウジング＋レンズ＋ウインカー）
  const yF = topAt(0.995), yB = botAt(1), zF0 = Z(1), xF = widthAt(0.99);
  const slim = car.body === 'modern' || car.body === 'super', hh = slim ? 0.065 : 0.1, yH = yF - hh / 2 - 0.035;
  if (hlShape === 11) for (let k = 0; k < 4; k++) { const x = (k - 1.5) * 0.24, y = topAt(0.975) + 0.09, z = Z(0.975) + 0.04; gbDark.box(x, y, z - 0.03, 0.17, 0.17, 0.06, [0.03, 0.03, 0.035]); discZ(gbLight, x, y, z + 0.002, 0.07, headTint); }
  const faceOn = !!car.face && !look.hl;
  if (!popupOn && !faceOn) for (const s of [-1, 1]) {
    const xa = xF * 0.36, xb = xF * 0.93, cx = s * (xa + xb) / 2, wdt = xb - xa; const H0 = [0.03, 0.03, 0.035], zl = zF0 + 0.022;
    gbDark.box(cx, yH, zF0 - 0.05, wdt + 0.03, hh + 0.03, 0.12, H0);
    if (hlShape === 1) discZ(gbLight, cx, yH, zl, Math.min(0.085, hh * 0.75), headTint);
    else if (hlShape === 2) { discZ(gbLight, cx - s * wdt * 0.22, yH, zl, Math.min(0.06, hh * 0.6), headTint); discZ(gbLight, cx + s * wdt * 0.22, yH, zl, Math.min(0.06, hh * 0.6), headTint); }
    else if (hlShape === 3) gbLight.box(cx, yH, zF0 - 0.042, wdt * 0.62, hh * 1.05, 0.12, headTint);
    else if (hlShape === 4) { gbLight.box(cx, yH, zF0 - 0.045, wdt, hh, 0.12, [0.35, 0.35, 0.4]); discZ(gbChrome, cx - s * wdt * 0.18, yH, zl - 0.002, hh * 0.48, [0.8, 0.8, 0.85]); discZ(gbLight, cx - s * wdt * 0.18, yH, zl, hh * 0.34, headTint); discZ(gbLight, cx + s * wdt * 0.2, yH, zl, hh * 0.26, headTint); }
    else if (hlShape === 5) { gbLight.box(cx, yH + hh * 0.32, zF0 - 0.04, wdt, hh * 0.22, 0.12, headTint); gbLight.box(cx - s * wdt * 0.15, yH - hh * 0.1, zF0 - 0.044, wdt * 0.3, hh * 0.38, 0.12, [0.6, 0.6, 0.65]); }
    else if (hlShape === 6) { const xi = s * xa, xo = s * xb, y0 = yH - hh * 0.45, y1 = yH + hh * 0.1, y2 = yH + hh * 0.5; gbLight.hexa([[xi, y0, zF0 - 0.06], [xo, y1, zF0 - 0.06], [xo, y1, zl], [xi, y0, zl], [xi, y0 + hh * 0.35, zF0 - 0.06], [xo, y2, zF0 - 0.06], [xo, y2, zl], [xi, y0 + hh * 0.35, zl]], headTint); }
    else if (hlShape === 7) { gbLight.box(cx - s * wdt * 0.24, yH, zF0 - 0.042, wdt * 0.42, hh * 0.85, 0.12, headTint); gbLight.box(cx + s * wdt * 0.24, yH, zF0 - 0.042, wdt * 0.42, hh * 0.85, 0.12, headTint); }
    else if (hlShape === 10) gbLight.box(cx, yH + hh * 0.2, zF0 - 0.042, wdt, hh * 0.45, 0.12, headTint);
    else gbLight.box(cx, yH, zF0 - 0.042, wdt, hh, 0.12, headTint);
    if (hlShape === 8) { gbDark.box(s * xF * 0.62, yB + 0.11, zF0 - 0.01, 0.13, 0.08, 0.06, H0); discZ(gbLight, s * xF * 0.62, yB + 0.11, zF0 + 0.022, 0.04, [1, 0.85, 0.3]); }
    gbChrome.box(s * (xa + wdt * 0.3), yH, zF0 + 0.02, wdt * 0.28, hh * 0.7, 0.01, [0.85, 0.85, 0.9]);
    gbGlass.box(s * (xb - 0.04), yH - hh / 2 - 0.035, zF0 - 0.02, 0.1, 0.035, 0.06, [1, 0.55, 0.05]);
  }
  // グリル・インテーク
  if (!faceOn) gbDark.box(0, yH - 0.005, zF0 - 0.02, xF * 0.62, hh * 0.8, 0.06, [0.03, 0.03, 0.035]);
  gbDark.box(0, yB + Math.min(0.11, (yF - yB) * 0.3), zF0 - 0.02, xF * 1.15, Math.min(0.1, (yF - yB) * 0.25), 0.06, [0.03, 0.03, 0.035]);
  for (const s of [-1, 1]) gbDark.box(s * xF * 0.82, yB + 0.08, zF0 - 0.02, xF * 0.22, 0.07, 0.06, [0.03, 0.03, 0.035]);
  // テールランプ
  const yT = topAt(0.03) - 0.1, xT = widthAt(0.03), zTL = Z(rearF(yT + 0.06)) - 0.012;
  if (car.face) { } else if (car.body === 'gt' || car.body === 'rotary') { for (const s of [-1, 1]) for (const o of [0.25, 0.52]) { const g = new GB(); g.cylX(0, 0, 0, 0.065, 0.04, 12, tailLens); for (let q = 0; q < g.a.length; q += VSTRIDE) { const x = g.a[q], y = g.a[q + 1], z = g.a[q + 2]; gbBrake.a.push(s * xT * o + z, yT + y, zTL + x, g.a[q + 5], g.a[q + 4], g.a[q + 3], g.a[q + 6], g.a[q + 7], g.a[q + 8], 0, 1, 0, 0); } } }
  else if (car.body === 'modern') { gbBrake.box(0, yT + 0.02, zTL, xT * 1.7, 0.045, 0.03, tailLens); for (const s of [-1, 1]) gbBrake.box(s * xT * 0.72, yT, zTL, 0.32, 0.09, 0.03, tailLens); }
  else for (const s of [-1, 1]) gbBrake.box(s * xT * 0.62, yT, zTL, xT * 0.55, 0.11, 0.03, tailLens);
  if (!car.face) gbDark.box(0, yT, zTL + 0.012, xT * 1.9, 0.15, 0.02, [0.08, 0.02, 0.02]);
  // ---- 全車共通のディテール：ワイパー・エンブレム・サイドマーカー ----
  if (car.body !== 'bus' && car.body !== 'van' && car.body !== 'sleigh' && !T.open) { const wy = beltAt(T.ws + 0.012) + 0.012, wz = Z(T.ws + 0.012), wc = [0.03, 0.03, 0.035];
    for (const [x0, ln] of [[-0.05, 0.62], [0.42, 0.5]]) { gbDark.box(x0 - ln / 2 + 0.1, wy, wz - 0.01, ln, 0.012, 0.016, wc); gbDark.box(x0 + 0.1, wy - 0.005, wz + 0.01, 0.03, 0.02, 0.04, wc); }
    gbChrome.box(0, topAt(0.985) - 0.01, Z(0.985) + 0.03, 0.09, 0.035, 0.012, [0.85, 0.85, 0.9]); gbChrome.box(0, topAt(0.02) - 0.02, Z(0.02) - 0.01, 0.1, 0.035, 0.012, [0.85, 0.85, 0.9]);
    for (const s2 of [-1, 1]) gbGlass.box(s2 * (widthAt(0.9) + 0.004), botAt(0.9) + 0.2, Z(0.9), 0.012, 0.025, 0.07, [1, 0.55, 0.05]); }
  // ---- 紫電シリーズ（4世代）の専用造形 ----
  if (car.series === 'shiden') { const zFs = car.wb / 2 + 0.04, zRs = -car.wb / 2 + 0.04, deckYs = topAt(0.05), G = car.face, dk = [0.025, 0.025, 0.03], ch = [0.85, 0.86, 0.9], bc = bodyCol, cb = [0.07, 0.07, 0.08], red = [1, 0.06, 0.05], amb = [1, 0.55, 0.05];
    const fz = zF0 + 0.004, fyT = yF - 0.03, fyB = yB, fyM = (fyT + fyB) / 2, rz = Z(0) - 0.004, ryT = topAt(0.02) - 0.03, ryB = botAt(0) + 0.05, xw = xF, rw = widthAt(0.03);
    const mesh = (cx, cy, w, h, n) => { gbDark.box(cx, cy, fz - 0.01, w, h, 0.04, dk); for (let k = 0; k < n; k++) for (let j = 0; j < 3; j++) gbChrome.box(cx - w / 2 + (k + 0.5) * w / n, cy - h / 2 + (j + 0.5) * h / 3, fz + 0.012, w / n * 0.5, h / 3 * 0.45, 0.006, [0.25, 0.25, 0.28]); };
    if (faceOn) {
      if (G === 1) { // 第1世代：細いクロームのスラットグリル＋角型ヘッドライト＋回り込むコーナーランプ
        gbDark.box(0, fyT - 0.06, fz - 0.01, xw * 0.9, 0.09, 0.04, dk); for (let k = 0; k < 4; k++) gbChrome.box(0, fyT - 0.03 - k * 0.02, fz + 0.012, xw * 0.86, 0.006, 0.008, ch);
        for (const s2 of [-1, 1]) { gbDark.box(s2 * xw * 0.66, fyT - 0.06, fz - 0.005, xw * 0.5, 0.1, 0.05, dk); gbLight.box(s2 * xw * 0.66, fyT - 0.06, fz + 0.016, xw * 0.46, 0.08, 0.01, headTint); gbChrome.box(s2 * xw * 0.66, fyT - 0.06, fz + 0.022, 0.006, 0.07, 0.006, ch);
          gbGlass.box(s2 * (xw - 0.02), fyT - 0.07, fz - 0.06, 0.05, 0.07, 0.14, amb); }
        mesh(0, fyB + 0.1, xw * 0.6, 0.07, 10); }
      if (G === 2) { // 第2世代：楕円メッシュグリル＋丸みのある大型ライト（2連プロジェクター）
        for (let k = 0; k < 16; k++) { const a0 = k / 16 * TAU, a1 = (k + 1) / 16 * TAU, rx = xw * 0.3, ry = 0.055, cy = fyT - 0.07; gbDark.v(0, cy, fz, 0, 0, 1, dk); gbDark.v(Math.cos(a0) * rx, cy + Math.sin(a0) * ry, fz, 0, 0, 1, dk); gbDark.v(Math.cos(a1) * rx, cy + Math.sin(a1) * ry, fz, 0, 0, 1, dk); gbChrome.box(Math.cos(a0) * rx, cy + Math.sin(a0) * ry, fz + 0.004, 0.02, 0.012, 0.01, ch); }
        for (const s2 of [-1, 1]) { const cx = s2 * xw * 0.68; gbDark.box(cx, fyT - 0.065, fz - 0.005, xw * 0.44, 0.11, 0.05, dk); gbLight.box(cx, fyT - 0.065, fz + 0.012, xw * 0.4, 0.09, 0.01, [0.75, 0.78, 0.82]); discZ(gbChrome, cx - s2 * 0.08, fyT - 0.065, fz + 0.018, 0.04, [0.8, 0.8, 0.85]); discZ(gbLight, cx - s2 * 0.08, fyT - 0.065, fz + 0.02, 0.028, headTint); discZ(gbLight, cx + s2 * 0.07, fyT - 0.065, fz + 0.02, 0.03, headTint); gbGlass.box(cx + s2 * 0.15, fyT - 0.11, fz + 0.012, 0.08, 0.025, 0.01, amb); }
        mesh(0, fyB + 0.11, xw * 0.9, 0.11, 12); for (const s2 of [-1, 1]) gbDark.box(s2 * xw * 0.8, fyB + 0.1, fz - 0.005, 0.16, 0.08, 0.05, dk); }
      if (G === 3) { // 第3世代：つり上がったライト（プロジェクター＋LEDライン）＋ハニカムの大型インテーク
        for (const s2 of [-1, 1]) { const xi = s2 * xw * 0.36, xo = s2 * xw * 0.97, y0 = fyT - 0.12, y1 = fyT - 0.04;
          const q = [[xi, y0, fz], [xo, y1 - 0.02, fz], [xo, y1 + 0.03, fz], [xi, y0 + 0.07, fz]]; if (s2 > 0) { gbDark.quad(q[0], q[1], q[2], q[3], dk); } else { gbDark.quad(q[0], q[3], q[2], q[1], dk); }
          discZ(gbChrome, s2 * xw * 0.5, fyT - 0.085, fz + 0.006, 0.038, [0.8, 0.8, 0.85]); discZ(gbLight, s2 * xw * 0.5, fyT - 0.085, fz + 0.008, 0.026, headTint); discZ(gbLight, s2 * xw * 0.74, fyT - 0.07, fz + 0.008, 0.024, headTint);
          gbLight.box(s2 * xw * 0.66, fyT - 0.115, fz + 0.008, xw * 0.42, 0.008, 0.006, headTint); gbGlass.box(s2 * xw * 0.88, fyT - 0.1, fz + 0.008, 0.07, 0.016, 0.006, amb); }
        mesh(0, fyT - 0.075, xw * 0.5, 0.05, 8); mesh(0, fyB + 0.13, xw * 1.2, 0.15, 14); gbDark.box(0, fyB + 0.13, fz + 0.02, xw * 1.2, 0.02, 0.02, bc);
        for (const s2 of [-1, 1]) { mesh(s2 * xw * 0.82, fyB + 0.12, 0.16, 0.12, 3); }
        gbCarbon.box(0, fyB + 0.005, fz + 0.06, xw * 1.7, 0.016, 0.14, cb); }
      if (G === 4) { // 第4世代：台形の大型グリル＋ブーメラン型LEDライト＋縦型サイドインテーク
        const gw0 = xw * 0.95, gw1 = xw * 0.7, gy0 = fyB + 0.06, gy1 = fyT - 0.06; gbDark.quad([-gw0, gy0, fz], [gw0, gy0, fz], [gw1, gy1, fz], [-gw1, gy1, fz], dk); for (let k = 0; k < 6; k++) { const y = lerp(gy0, gy1, (k + 0.5) / 6), w = lerp(gw0, gw1, (k + 0.5) / 6); gbChrome.box(0, y, fz + 0.006, w * 1.9, 0.006, 0.006, [0.3, 0.3, 0.33]); }
        gbChrome.box(0, gy1 + 0.008, fz + 0.006, gw1 * 2, 0.012, 0.01, ch);
        for (const s2 of [-1, 1]) { const cx = s2 * xw * 0.72; gbDark.box(cx, fyT - 0.055, fz - 0.005, xw * 0.42, 0.075, 0.05, dk); gbLight.box(cx, fyT - 0.035, fz + 0.012, xw * 0.4, 0.01, 0.008, headTint); gbLight.box(cx + s2 * xw * 0.19, fyT - 0.06, fz + 0.012, 0.012, 0.05, 0.008, headTint); discZ(gbLight, cx - s2 * 0.04, fyT - 0.065, fz + 0.012, 0.025, headTint); discZ(gbLight, cx + s2 * 0.05, fyT - 0.065, fz + 0.012, 0.025, headTint);
          gbDark.box(s2 * xw * 0.9, fyB + 0.13, fz - 0.005, 0.1, 0.16, 0.05, dk); gbLight.box(s2 * xw * 0.9, fyB + 0.21, fz + 0.012, 0.09, 0.008, 0.006, headTint); } }
    }
    // テールランプ（世代ごと）
    if (G === 1) { gbDark.box(0, ryT - 0.07, rz, rw * 1.9, 0.12, 0.02, [0.06, 0.02, 0.02]); for (const s2 of [-1, 1]) { gbBrake.box(s2 * rw * 0.62, ryT - 0.07, rz - 0.006, rw * 0.6, 0.1, 0.01, red); for (let k = 0; k < 3; k++) gbDark.box(s2 * rw * 0.62, ryT - 0.1 + k * 0.03, rz - 0.012, rw * 0.6, 0.004, 0.004, [0.3, 0.02, 0.02]); } }
    if (G === 2) for (const s2 of [-1, 1]) for (let k = 0; k < 3; k++) { gbDark.box(s2 * rw * (0.42 + k * 0.2), ryT - 0.07, rz, 0.16, 0.11, 0.02, [0.06, 0.02, 0.02]); gbBrake.box(s2 * rw * (0.42 + k * 0.2), ryT - 0.07, rz - 0.006, 0.14, 0.09, 0.01, k === 0 ? [1, 0.75, 0.7] : red); }
    if (G === 3) { gbDark.box(0, ryT - 0.07, rz, rw * 0.7, 0.1, 0.02, cb); gbChrome.box(0, ryT - 0.07, rz - 0.008, rw * 0.6, 0.012, 0.006, ch);
      for (const s2 of [-1, 1]) { gbDark.box(s2 * rw * 0.68, ryT - 0.06, rz, rw * 0.58, 0.12, 0.02, [0.05, 0.02, 0.02]); gbBrake.box(s2 * rw * 0.68, ryT - 0.025, rz - 0.008, rw * 0.54, 0.018, 0.008, red); gbBrake.box(s2 * rw * 0.93, ryT - 0.07, rz - 0.008, 0.02, 0.09, 0.008, red); gbBrake.box(s2 * rw * 0.55, ryT - 0.09, rz - 0.008, rw * 0.22, 0.014, 0.008, red); } }
    if (G === 4) for (const s2 of [-1, 1]) { gbDark.box(s2 * rw * 0.66, ryT - 0.06, rz, rw * 0.6, 0.11, 0.02, [0.04, 0.03, 0.03]); for (let k = 0; k < 2; k++) gbBrake.box(s2 * rw * 0.66, ryT - 0.035 - k * 0.05, rz - 0.008, rw * 0.56, 0.012, 0.008, red); }
    // ボンネット（世代ごとのダクト・バルジ）
    if (!look.hood) { const hf = f0 => lerp(T.ws + 0.02, 0.93, f0);
      if (G === 2) for (const s2 of [-1, 1]) { const f0 = hf(0.6); gbDark.box(s2 * 0.25, topAt(f0) + 0.01, Z(f0), 0.12, 0.012, 0.22, dk); }
      if (G === 3) { const f0 = hf(0.45); gbCarbon.box(0, topAt(f0) + 0.012, Z(f0), 0.46, 0.02, 0.38, cb); for (let k = 0; k < 5; k++) gbDark.box(0, topAt(f0) + 0.024, Z(f0) - 0.15 + k * 0.075, 0.4, 0.008, 0.03, dk); }
      if (G === 4) for (const s2 of [-1, 1]) { const f0 = hf(0.5); gbBody.box(s2 * 0.24, topAt(f0) + 0.02, Z(f0), 0.2, 0.04, 0.6, bc); } }
    // フェンダー（世代ごとのアーチ・ダクト）
    for (const s2 of [-1, 1]) { const ff = (zFs - z0) / L;
      if (G === 1) for (const zz of [zFs, zRs]) gbDark.box(s2 * (widthAt((zz - z0) / L) + 0.006), clr + 0.04, zz, 0.012, 0.03, 0.9, dk);
      if (G === 3) { for (let k = 0; k < 3; k++) gbDark.box(s2 * (widthAt(ff - 0.08) + 0.006), clr + 0.32 + k * 0.035, zFs - 0.48, 0.012, 0.016, 0.14, dk); }
      if (G === 4) { gbDark.box(s2 * (widthAt(ff - 0.09) + 0.006), clr + 0.3, zFs - 0.5, 0.012, 0.12, 0.2, dk); gbChrome.box(s2 * (widthAt(ff - 0.09) + 0.008), clr + 0.3, zFs - 0.5, 0.006, 0.006, 0.18, ch); } }
    // 純正ウイング（世代ごと）
    if (!look.wing) { const wz = Z(0.07), dy = deckYs;
      if (G === 1) { for (const s2 of [-1, 1]) gbBody.box(s2 * (hw0 - 0.35), dy + 0.04, wz, 0.05, 0.08, 0.08, bc); gbBody.box(0, dy + 0.09, wz, (hw0 - 0.18) * 2, 0.03, 0.2, bc); }
      if (G === 2) { for (const s2 of [-1, 1]) gbBody.box(s2 * (hw0 - 0.32), dy + 0.08, wz, 0.05, 0.16, 0.1, bc); gbBody.box(0, dy + 0.17, wz, (hw0 - 0.12) * 2, 0.03, 0.24, bc); gbBody.box(0, dy + 0.19, wz - 0.11, (hw0 - 0.14) * 2, 0.04, 0.02, bc); }
      if (G === 3) { for (const s2 of [-1, 1]) { gbBody.box(s2 * (hw0 - 0.3), dy + 0.08, wz, 0.045, 0.16, 0.12, bc); gbBody.box(s2 * (hw0 - 0.08), dy + 0.17, wz, 0.02, 0.07, 0.26, bc); } gbBody.box(0, dy + 0.17, wz, (hw0 - 0.08) * 2, 0.03, 0.26, bc); gbDark.box(0, dy + 0.195, wz - 0.12, (hw0 - 0.1) * 2, 0.03, 0.01, dk); }
      if (G === 4) gbBody.hexa([[-hw0 + 0.15, deckYs, Z(0.02)], [hw0 - 0.15, deckYs, Z(0.02)], [hw0 - 0.15, deckYs, Z(0.1)], [-hw0 + 0.15, deckYs, Z(0.1)], [-hw0 + 0.15, deckYs + 0.05, Z(0.01)], [hw0 - 0.15, deckYs + 0.05, Z(0.01)], [hw0 - 0.15, deckYs + 0.01, Z(0.1)], [-hw0 + 0.15, deckYs + 0.01, Z(0.1)]], bc); }
    // 専用パーツ（紫電のみ）
    if (look.front === 15) { gbCarbon.box(0, fyB + 0.01, fz + 0.09, xw * 1.85, 0.018, 0.2, cb); for (const s2 of [-1, 1]) { gbCarbon.box(s2 * (xw + 0.04), fyB + 0.17, fz - 0.04, 0.2, 0.014, 0.14, cb); gbDark.box(s2 * xw * 0.75, fyB + 0.1, fz + 0.02, 0.22, 0.1, 0.02, dk); } }
    if (look.rear === 12) { for (let k = -3; k <= 3; k++) gbCarbon.box(k * 0.16, clr + 0.08, Z(0.04), 0.015, 0.16, 0.42, cb); gbCarbon.box(0, clr + 0.005, Z(0.04), W * 0.92, 0.014, 0.46, cb); }
    if (look.wing === 19) { const wz = Z(0.06); for (const s2 of [-1, 1]) { gbCarbon.box(s2 * (hw0 - 0.4), deckYs + 0.22, wz, 0.03, 0.44, 0.08, cb); gbCarbon.box(s2 * (hw0 + 0.03), deckYs + 0.44, wz, 0.014, 0.18, 0.4, cb); } gbCarbon.hexa([[-hw0, deckYs + 0.42, wz - 0.18], [hw0, deckYs + 0.42, wz - 0.18], [hw0, deckYs + 0.46, wz + 0.18], [-hw0, deckYs + 0.46, wz + 0.18], [-hw0, deckYs + 0.47, wz - 0.18], [hw0, deckYs + 0.47, wz - 0.18], [hw0, deckYs + 0.49, wz + 0.18], [-hw0, deckYs + 0.49, wz + 0.18]], cb); gbCarbon.box(0, deckYs + 0.5, wz - 0.17, hw0 * 2, 0.04, 0.012, cb); }
    if (look.hood === 11) { const f0 = lerp(T.ws + 0.02, 0.93, 0.5); gbCarbon.box(0, topAt(f0) + 0.008, Z(f0), 0.95, 0.014, 0.75, cb); for (const s2 of [-1, 1]) for (let k = 0; k < 6; k++) gbDark.box(s2 * 0.24, topAt(f0) + 0.018, Z(f0) - 0.2 + k * 0.07, 0.18, 0.008, 0.03, dk); }
  }
  // ボンネットの見切り線（パネルの隙間）
  if (car.body !== 'bus' && car.body !== 'van' && car.body !== 'sleigh') { const gapC = [0.02, 0.02, 0.025], N2 = 14, f0 = T.ws + 0.012, f1 = 0.972;
    for (let k = 0; k < N2; k++) { const fa = lerp(f0, f1, k / N2), fb = lerp(f0, f1, (k + 1) / N2); for (const s2 of [-1, 1]) { const xa = s2 * widthAt(fa) * 0.66, xb = s2 * widthAt(fb) * 0.66, ya = topAt(fa) + ridgeAt(fa) * 0.3 + 0.0015, yb2 = topAt(fb) + ridgeAt(fb) * 0.3 + 0.0015, w2 = 0.006; const q = [[xa - w2, ya, Z(fa)], [xb - w2, yb2, Z(fb)], [xb + w2, yb2, Z(fb)], [xa + w2, ya, Z(fa)]]; gbDark.quad(q[0], q[1], q[2], q[3], gapC); gbDark.quad(q[0], q[3], q[2], q[1], gapC); } }
    const yf = topAt(f1) + 0.003; gbDark.box(0, yf, Z(f1), widthAt(f1) * 1.32, 0.004, 0.012, gapC);
    // トランクの見切り線
    if (!T.open && T.rb > 0.06) { const fr0 = 0.03, fr1 = T.rb - 0.01; for (const s2 of [-1, 1]) { const x = s2 * widthAt(0.06) * 0.7; gbDark.box(x, (topAt(fr0) + topAt(fr1)) / 2 + 0.004, (Z(fr0) + Z(fr1)) / 2, 0.012, 0.004, Z(fr1) - Z(fr0), gapC); } }
  }
  // ドアライン・ハンドル・ミラー
  for (const s of [-1, 1]) {
    for (const f of [T.ws - 0.03, Math.max(T.rb + 0.06, T.rr - 0.02)]) { const x = s * (widthAt(f) + 0.002), y0 = botAt(f) + 0.05, y1 = beltAt(f) - 0.01; gbDark.quad([x, y0, Z(f) - 0.006], [x, y0, Z(f) + 0.006], [x, y1, Z(f) + 0.006], [x, y1, Z(f) - 0.006], [0.05, 0.05, 0.05]); }
    const fh = Math.max(T.rb + 0.08, T.rr) + 0.02; gbChrome.box(s * (widthAt(fh) + 0.01), beltAt(fh) - 0.1, Z(fh), 0.02, 0.025, 0.12, [0.6, 0.6, 0.62]);
    const fm = T.ws - 0.02, xm = s * (widthAt(fm) * 0.9 + 0.1), ym = beltAt(fm) + 0.07;
    gbBody.box(s * (widthAt(fm) * 0.9 + 0.04), ym - 0.03, Z(fm), 0.1, 0.025, 0.04, look.mirror === 2 ? [0.08, 0.08, 0.09] : bodyCol);
    if (look.mirror) gbBody.hexa([[xm - 0.06, ym - 0.04, Z(fm) - 0.05], [xm + 0.06, ym - 0.04, Z(fm) - 0.05], [xm + 0.04, ym - 0.04, Z(fm) + 0.05], [xm - 0.04, ym - 0.04, Z(fm) + 0.05], [xm - 0.06, ym + 0.03, Z(fm) - 0.05], [xm + 0.06, ym + 0.03, Z(fm) - 0.05], [xm + 0.04, ym + 0.03, Z(fm) + 0.05], [xm - 0.04, ym + 0.03, Z(fm) + 0.05]], look.mirror === 2 ? [0.08, 0.08, 0.09] : bodyCol);
    else gbBody.box(xm, ym, Z(fm), 0.16, 0.1, 0.11, bodyCol);
    gbGlass.box(xm, ym, Z(fm) - 0.058, 0.13, 0.075, 0.005, [0.5, 0.55, 0.6]);
  }
  // ---- ホイールアーチ ----
  const tireR = car.body === 'bus' ? 0.5 : car.body === 'van' ? 0.34 : car.body === 'kei' ? 0.3 : 0.33, zF = car.wb / 2 + 0.04, zR = -car.wb / 2 + 0.04;
  for (const zw of [zF, zR]) for (const s of [-1, 1]) {
    const f = (zw - z0) / L, r = tireR + 0.04;
    // アーチがボディ上面より上に浮かないように高さを制限し、側面の膨らみに沿わせる
    const cy = (z, y) => Math.min(y, topAt(clamp((z - z0) / L, 0, 1)) - 0.045);
    const sx = (z, y) => { const ff = clamp((z - z0) / L, 0, 1), b = botAt(ff), t = topAt(ff), h = t - b, q = clamp((y - b) / h, 0, 1); return s * (widthAt(ff) * (q < 0.44 ? 0.993 + 0.007 * q / 0.44 : 1 - (q - 0.44) * 0.08) + 0.004); };
    const AP = (a, rr) => { const z = zw + Math.cos(a) * rr, y = cy(z, tireR + Math.sin(a) * rr); return [sx(z, y), y, z]; };
    const x = sx(zw, tireR);
    for (let k = 0; k < 14; k++) { const a0 = k / 14 * PI, a1 = (k + 1) / 14 * PI; gbDark.tri([x, tireR, zw], AP(a0, r), AP(a1, r), [0.015, 0.015, 0.018]); }
    gbDark.quad([x, botAt(f) - 0.02, zw - r], [x, botAt(f) - 0.02, zw + r], [x, tireR, zw + r], [x, tireR, zw - r], [0.015, 0.015, 0.018]);
    const out = 0.012 + wide * 0.05, lip = 0.04 + wide * 0.02;
    for (let k = 0; k < 14; k++) { const a0 = k / 14 * PI, a1 = (k + 1) / 14 * PI; const P0 = AP(a0, r), P1 = AP(a1, r), P2 = AP(a1, r + lip), P3 = AP(a0, r + lip); P2[0] += s * out; P3[0] += s * out; if (P2[1] - P0[1] < 0.004 && P3[1] - P1[1] < 0.004 && P0[1] > tireR + 0.2) continue; gbBody.quad(P0, P1, P2, P3, bodyCol); }
  }
  // ---- バンパー ----
  { const classic = ['coupe80', 'gt', 'sedan', 'hatch', 'rally'].includes(car.body) && !/^(eu_|hk_gtx|ak_raijin5|ak_hayate)/.test(car.id);
    const fy = botAt(1) + 0.11, ry = botAt(0) + 0.12, fz = Z(1), rz = Z(0), bw = widthAt(0.99) * 2 + 0.04;
    if (classic) { gbChrome.box(0, fy, fz + 0.02, bw, 0.075, 0.07, [0.62, 0.62, 0.66]); for (const sd of [-1, 1]) gbChrome.box(sd * (bw / 2 - 0.03), fy, fz - 0.12, 0.06, 0.075, 0.28, [0.62, 0.62, 0.66]); gbChrome.box(0, ry, rz - 0.02, bw, 0.075, 0.07, [0.62, 0.62, 0.66]); }
    gbDark.box(0, botAt(1) + 0.025, fz - 0.03, bw - 0.08, 0.05, 0.1, [0.03, 0.03, 0.035]); gbDark.box(0, botAt(0) + 0.025, rz + 0.03, bw - 0.08, 0.05, 0.1, [0.03, 0.03, 0.035]);
    for (const sd of [-1, 1]) gbDark.quad([sd * (widthAt(0.5) * 0.93 + 0.003), clr, Z(0.22)], [sd * (widthAt(0.5) * 0.93 + 0.003), clr, Z(0.78)], [sd * (widthAt(0.5) * 0.985 + 0.004), clr + 0.06, Z(0.78)], [sd * (widthAt(0.5) * 0.985 + 0.004), clr + 0.06, Z(0.22)], [0.03, 0.03, 0.035]); }
  // ---- エアロ ----
  const dark = [0.05, 0.05, 0.06], carbon = [0.08, 0.08, 0.09], deckY = topAt(0.05);
  const kitOf = slot => { const id = look.kit && look.kit[slot]; const it = id && typeof ITEM_BY_ID !== 'undefined' ? ITEM_BY_ID[id] : null; return it && it.slot === slot ? it : null; };
  const KW = (slot, fn) => { const k = kitOf(slot); if (!k) return fn(gbBody, gbCarbon, gbDark, bodyCol, carbon, dark); return fn(gbChrome, gbChrome, gbChrome, k.fin, k.fin, k.fin.map(v => v * 0.55)); };
  KW('front', (gB, gC, gD, bc, cb, dk) => {
  if (look.front >= 1) gD.box(0, botAt(0.99) + 0.01, Z(0.985), W - 0.2, 0.04, 0.16, dk);
  if (look.front >= 2) { gB.box(0, botAt(1) + 0.05, Z(0.995), W * 0.88, 0.1, 0.12, bc); for (const s of [-1, 1]) gD.box(s * xN * 0.62, botAt(1) + 0.09, Z(1.0) + 0.01, 0.3, 0.07, 0.03, dk); }
  if (look.front >= 3) for (const s of [-1, 1]) gC.box(s * (xN + 0.01), botAt(0.97) + 0.12, Z(0.965), 0.18, 0.015, 0.16, cb);
  if (look.front >= 4) { gC.box(0, botAt(1) - 0.005, Z(1.0) + 0.06, W * 0.96, 0.02, 0.2, cb); for (const s of [-1, 1]) gC.box(s * W * 0.47, botAt(1) + 0.03, Z(1.0) + 0.1, 0.02, 0.07, 0.12, cb); }
  });
  KW('rear', (gB, gC, gD, bc, cb, dk) => {
  if (look.rear >= 1) for (let k = -2; k <= 2; k++) gD.box(k * 0.2, botAt(0.01) + 0.03, Z(0.02), 0.025, 0.08 + look.rear * 0.03, 0.3, dk);
  });
  KW('side', (gB, gC, gD, bc, cb, dk) => {
  if (look.side >= 1) for (const s of [-1, 1]) gB.box(s * (hw0 + 0.01 * look.side), clr + 0.05, (zF + zR) / 2, 0.05 + 0.025 * look.side, 0.09, car.wb - 0.75, bc);
  });
  KW('wing', (gB, gC, gD, bc, cb, dk) => {
  if (look.wing === 1) gB.hexa([[-hw0 + 0.12, deckY, Z(0.015)], [hw0 - 0.12, deckY, Z(0.015)], [hw0 - 0.12, deckY, Z(0.12)], [-hw0 + 0.12, deckY, Z(0.12)], [-hw0 + 0.12, deckY + 0.07, Z(0.0)], [hw0 - 0.12, deckY + 0.07, Z(0.0)], [hw0 - 0.12, deckY + 0.01, Z(0.12)], [-hw0 + 0.12, deckY + 0.01, Z(0.12)]], bc);
  if (look.wing >= 2) {
    const hgt = pick([0, 0, 0.26, 0.42, 0.5, 0.36, 0.44], look.wing), wz = Z(0.06), wcol = look.wing >= 2 ? cb : bc, span = look.wing === 4 || look.wing === 6 ? hw0 + 0.08 : hw0 - 0.06;
    if (look.wing === 5) gC.hexa([[-span, deckY + hgt + 0.13, wz - 0.12], [span, deckY + hgt + 0.13, wz - 0.12], [span, deckY + hgt + 0.15, wz + 0.1], [-span, deckY + hgt + 0.15, wz + 0.1], [-span, deckY + hgt + 0.18, wz - 0.12], [span, deckY + hgt + 0.18, wz - 0.12], [span, deckY + hgt + 0.17, wz + 0.1], [-span, deckY + hgt + 0.17, wz + 0.1]], cb);
    for (const s of [-1, 1]) gD.box(s * (hw0 - 0.45), deckY + hgt / 2, wz, 0.035, hgt, 0.12, dk);
    gC.hexa([[-span, deckY + hgt, wz - 0.17], [span, deckY + hgt, wz - 0.17], [span, deckY + hgt + 0.02, wz + 0.17], [-span, deckY + hgt + 0.02, wz + 0.17], [-span, deckY + hgt + 0.06, wz - 0.17], [span, deckY + hgt + 0.06, wz - 0.17], [span, deckY + hgt + 0.04, wz + 0.17], [-span, deckY + hgt + 0.04, wz + 0.17]], wcol);
    if (look.wing >= 3 && look.wing <= 6) for (const s of [-1, 1]) gD.box(s * span, deckY + hgt + 0.02, wz, 0.015, 0.24, 0.42, dk);
  }
  if (look.wing >= 7) { const WP = { 7: { h: 0.16, sp: hw0 - 0.1, ch: 0.3, el: 1 }, 8: { duck: 1 }, 9: { h: 0.3, sp: hw0 - 0.05, ch: 0.3, el: 3 }, 10: { h: 0.38, sp: hw0 + 0.02, ch: 0.36, el: 1, plate: 0.5 }, 11: { h: 0.3, sp: hw0 - 0.05, ch: 0.3, el: 1, split: 1 }, 12: { hatch: 1 }, 13: { h: 0.3, sp: hw0, ch: 0.34, el: 1, gurney: 1 }, 14: { h: 0.55, sp: hw0 + 0.05, ch: 0.5, el: 2, swan: 1, plate: 0.55 }, 15: { h: 0.1, sp: 0.35, ch: 0.2, el: 1 }, 16: { h: 0.7, sp: hw0 - 0.15, ch: 0.22, el: 1 }, 17: { h: 0.44, sp: hw0 + 0.12, ch: 0.38, el: 1, swan: 1, plate: 0.45 }, 18: { h: 0.48, sp: hw0 - 0.02, ch: 0.34, el: 2 } }[look.wing];
    if (WP && WP.duck) gC.hexa([[-hw0 + 0.1, deckY, Z(0.015)], [hw0 - 0.1, deckY, Z(0.015)], [hw0 - 0.1, deckY, Z(0.14)], [-hw0 + 0.1, deckY, Z(0.14)], [-hw0 + 0.1, deckY + 0.1, Z(-0.005)], [hw0 - 0.1, deckY + 0.1, Z(-0.005)], [hw0 - 0.1, deckY + 0.015, Z(0.14)], [-hw0 + 0.1, deckY + 0.015, Z(0.14)]], cb);
    else if (WP && WP.hatch) { const zz = Z(T.rr), yy = H + 0.01; gC.hexa([[-hw0 * 0.8, yy, zz + 0.04], [hw0 * 0.8, yy, zz + 0.04], [hw0 * 0.8, yy - 0.02, zz - 0.22], [-hw0 * 0.8, yy - 0.02, zz - 0.22], [-hw0 * 0.8, yy + 0.03, zz + 0.04], [hw0 * 0.8, yy + 0.03, zz + 0.04], [hw0 * 0.8, yy + 0.01, zz - 0.22], [-hw0 * 0.8, yy + 0.01, zz - 0.22]], cb); }
    else if (WP) { const wz = Z(0.06), sp = WP.sp, ch = WP.ch / 2;
      for (const s of [-1, 1]) { const px = s * Math.min(hw0 - 0.45, sp - 0.15); if (WP.swan) { gD.box(px, deckY + WP.h * 0.55, wz - 0.06, 0.03, WP.h * 1.1, 0.06, dk); gD.box(px, deckY + WP.h + 0.07, wz - 0.02, 0.03, 0.04, 0.16, dk); } else gD.box(px, deckY + WP.h / 2, wz, 0.035, WP.h, 0.12, dk); }
      const plane = (y, z, c, x0, x1) => gC.hexa([[x0, y, z - c], [x1, y, z - c], [x1, y + 0.02, z + c], [x0, y + 0.02, z + c], [x0, y + 0.05, z - c], [x1, y + 0.05, z - c], [x1, y + 0.035, z + c], [x0, y + 0.035, z + c]], cb);
      for (let e2 = 0; e2 < WP.el; e2++) { const y = deckY + WP.h + e2 * 0.075 + (WP.swan ? 0.04 : 0), z = wz - e2 * 0.09, c = ch * (1 - e2 * 0.25); if (WP.split) { plane(y, z, c, -sp, -0.1); plane(y, z, c, 0.1, sp); } else plane(y, z, c, -sp, sp); }
      if (WP.gurney) gD.box(0, deckY + WP.h + 0.07, wz - ch - 0.005, sp * 2, 0.04, 0.012, dk);
      const pl = WP.plate || (WP.el > 1 ? 0.3 : 0.2); for (const s of [-1, 1]) gD.box(s * sp, deckY + WP.h + 0.03 + (WP.el - 1) * 0.035, wz - (WP.el - 1) * 0.04, 0.015, pl * 0.3 + (WP.el - 1) * 0.06, Math.max(0.28, ch * 2.15), dk); }
  }
  });
  KW('hood', (gB, gC, gD, bc, cb, dk) => {
  if (look.hood === 2 || car.body === 'rally') { const hf = lerp(T.ws, 0.92, 0.45), hy = topAt(hf); gD.box(0, hy + 0.035, Z(hf), 0.5, 0.06, 0.36, look.hood === 2 ? cb : bc); gD.box(0, hy + 0.045, Z(hf) + 0.18, 0.42, 0.04, 0.015, [0.01, 0.01, 0.01]); }
  });
  KW('hood', (gB, gC, gD, bc, cb, dk) => {
  if (look.hood === 3) { gC.box(0, topAt(lerp(T.ws, 0.92, 0.5)) + 0.004, Z(lerp(T.ws, 0.92, 0.5)), 0.9, 0.012, 0.6, cb); for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const hf = lerp(T.ws, 0.92, 0.3 + k * 0.1); gD.box(s * 0.32, topAt(hf) + 0.012, Z(hf), 0.22, 0.018, 0.035, [0.02, 0.02, 0.02]); } }
  });
  KW('roof', (gB, gC, gD, bc, cb, dk) => {
  if (look.roof === 3 && !T.open) { const rf = lerp(T.rr, T.rf, 0.75); gB.box(0, H + 0.05, Z(rf), 0.36, 0.1, 0.32, bc); gD.box(0, H + 0.05, Z(rf) + 0.165, 0.3, 0.07, 0.01, [0.01, 0.01, 0.01]); }
  });
  KW('roof', (gB, gC, gD, bc, cb, dk) => {
  if (look.roof === 1 && !T.open) gB.box(0, H + 0.04, Z((T.rr + T.rf) / 2) + 0.15, 0.4, 0.06, 0.3, bc);
  });
  KW('roof', (gB, gC, gD, bc, cb, dk) => {
  if (look.roof === 2 && !T.open) gC.hexa([[-hw0 * 0.6, H - 0.01, Z(T.rr) + 0.02], [hw0 * 0.6, H - 0.01, Z(T.rr) + 0.02], [hw0 * 0.6, H, Z(T.rr) + 0.2], [-hw0 * 0.6, H, Z(T.rr) + 0.2], [-hw0 * 0.6, H + 0.04, Z(T.rr) - 0.05], [hw0 * 0.6, H + 0.04, Z(T.rr) - 0.05], [hw0 * 0.6, H + 0.02, Z(T.rr) + 0.2], [-hw0 * 0.6, H + 0.02, Z(T.rr) + 0.2]], cb);
  });
  KW('trunk', (gB, gC, gD, bc, cb, dk) => {
    if (look.trunk === 1) gB.box(0, deckY + 0.035, Z(0.015), W * 0.78, 0.045, 0.06, bc);
    if (look.trunk === 2) { const tf = lerp(0.02, T.rb, 0.5); gC.box(0, topAt(tf) + 0.01, Z(tf), W * 0.78, 0.014, Math.max(0.2, (T.rb - 0.03) * L * 0.9), cb); }
  });
  // ---- ウェッジ（スーパーカー）専用ディテール ----
  if (car.body === 'wedge') { const dk = [0.03, 0.03, 0.035], cb = [0.07, 0.07, 0.08];
    for (const s2 of [-1, 1]) { // 大型サイドインテーク（ドア後方の三角形の吸気口）
      const f0 = T.rr + 0.02, f1 = T.rf - 0.04, x0 = s2 * (widthAt(f0) + 0.004), x1 = s2 * (widthAt(f1) + 0.004), yb0 = botAt(f0) + 0.12, yt0 = beltAt(f0) - 0.02, yb1 = botAt(f1) + 0.1;
      const P = [[x0, yb0, Z(f0)], [x1, yb1, Z(f1)], [x0, yt0, Z(f0)]]; if (s2 > 0) gbDark.tri(P[0], P[1], P[2], dk); else gbDark.tri(P[0], P[2], P[1], dk);
      for (let k = 0; k < 3; k++) { const yy = lerp(yb0, yt0, 0.25 + k * 0.25); gbCarbon.box(s2 * (widthAt(f0 + 0.02) + 0.006), yy, Z(f0 + 0.03), 0.012, 0.012, 0.25 * (1 - k * 0.25), cb); }
      // Y字型デイライト
      const xL = s2 * xF * 0.66, yL = yH; gbLight.box(xL, yL + 0.02, zF0 - 0.035, xF * 0.5, 0.018, 0.1, [1, 1, 1]); gbLight.box(xL - s2 * 0.08, yL - 0.03, zF0 - 0.04, 0.018, 0.08, 0.1, [1, 1, 1]);
      // フロント下部の大型ダクト
      gbDark.box(s2 * W * 0.33, botAt(1) + 0.09, Z(1) + 0.005, W * 0.24, 0.12, 0.06, dk);
      // リアの六角形テール
      for (let k = 0; k < 2; k++) gbBrake.box(s2 * (W * 0.22 + k * 0.18), topAt(0.01) - 0.06, Z(0) - 0.012, 0.14, 0.05, 0.04, [1, 0.06, 0.05]);
    }
    // エンジンカバーのルーバー
    for (let k = 0; k < 6; k++) { const f0 = lerp(T.rb + 0.02, T.rr - 0.02, k / 5); gbDark.box(0, topAt(f0) + 0.012, Z(f0), W * 0.52, 0.014, 0.05, dk); }
    gbDark.box(0, botAt(0) + 0.07, Z(0) - 0.01, W * 0.86, 0.13, 0.05, dk); for (let k = -3; k <= 3; k++) gbDark.box(k * 0.15, clr + 0.06, Z(0.03), 0.015, 0.1, 0.4, dk);
    for (const x of [-0.12, 0.12]) gbChrome.box(x, botAt(0) + 0.16, Z(0) - 0.05, 0.13, 0.1, 0.12, [0.7, 0.7, 0.72]);
  }
  // ---- v2.2 新しいパーツ（形状を追加） ----
  const fW = widthAt(0.99), rW = widthAt(0.02), hf = f0 => lerp(T.ws + 0.02, 0.93, f0), rmid = (T.rr + T.rf) / 2;
  KW('front', (gB, gC, gD, bc, cb, dk) => { const fr = look.front || 0, yb = botAt(1), zf = Z(1);
    if (fr === 5) gD.box(0, yb + 0.005, zf + 0.01, W * 0.85, 0.03, 0.12, dk);
    if (fr === 6 || fr === 8 || fr === 12) gC.box(0, yb - 0.005, zf + (fr === 8 ? 0.12 : 0.06), W * (fr === 8 ? 1.0 : 0.9), 0.018, fr === 8 ? 0.34 : 0.2, cb);
    if (fr === 8) for (const s2 of [-1, 1]) { gC.box(s2 * W * 0.49, yb + 0.04, zf + 0.15, 0.018, 0.09, 0.28, cb); gC.box(s2 * (fW + 0.02), yb + 0.14, zf - 0.04, 0.22, 0.015, 0.18, cb); }
    if (fr === 7) for (const s2 of [-1, 1]) { gC.box(s2 * (fW + 0.01), yb + 0.16, zf - 0.04, 0.18, 0.015, 0.16, cb); gC.box(s2 * (fW + 0.02), yb + 0.08, zf - 0.02, 0.22, 0.015, 0.18, cb); }
    if (fr === 9) { gB.box(0, yb + 0.07, zf + 0.03, W * 0.94, 0.15, 0.12, bc); gD.box(0, yb + 0.09, zf + 0.092, W * 0.5, 0.05, 0.01, dk); }
    if (fr === 10) { gD.box(0, yb + 0.02, zf - 0.1, W * 0.62, 0.02, 0.42, [0.6, 0.6, 0.62]); for (const s2 of [-1, 1]) { gD.box(s2 * W * 0.25, yb + 0.16, zf + 0.05, 0.15, 0.15, 0.05, [0.03, 0.03, 0.035]); discZ(gbLight, s2 * W * 0.25, yb + 0.16, zf + 0.077, 0.06, [1, 1, 1]); } }
    if (fr === 11) { gB.box(0, yb + 0.06, zf + 0.025, W * 0.92, 0.12, 0.1, bc); for (const x of [-W * 0.3, 0, W * 0.3]) gD.box(x, yb + 0.08, zf + 0.077, x ? W * 0.24 : W * 0.2, 0.1, 0.01, dk); }
    if (fr === 12) for (const s2 of [-1, 1]) gD.box(s2 * W * 0.28, topAt(0.985) - 0.01, Z(0.985), 0.16, 0.012, 0.08, dk);
    if (fr === 13) { const bar = [0.18, 0.18, 0.2]; gD.box(0, yb + 0.3, zf + 0.12, W * 0.7, 0.05, 0.05, bar); gD.box(0, yb + 0.1, zf + 0.12, W * 0.7, 0.05, 0.05, bar); for (const s2 of [-1, 1]) gD.box(s2 * W * 0.33, yb + 0.2, zf + 0.12, 0.05, 0.25, 0.05, bar); }
    if (fr === 14) gD.box(0, yb + 0.005, zf + 0.02, W * 0.55, 0.025, 0.08, dk);
  });
  KW('rear', (gB, gC, gD, bc, cb, dk) => { const rr = look.rear || 0, yb = botAt(0.01), zr = Z(0.02);
    if (rr === 4) for (let k = -3; k <= 3; k++) gD.box(k * 0.13, yb + 0.05, zr, 0.02, 0.12, 0.32, dk);
    if (rr === 5) gC.box(0, botAt(0) + 0.05, Z(0) - 0.03, W * 0.85, 0.1, 0.04, cb);
    if (rr === 6) for (const s2 of [-1, 1]) gC.box(s2 * (rW + 0.01), botAt(0.02) + 0.13, Z(0.03), 0.16, 0.015, 0.14, cb);
    if (rr === 7) { gD.box(0, botAt(0) + 0.07, Z(0) - 0.02, 0.42, 0.14, 0.04, dk); for (const x of [-0.08, 0.08]) gbChrome.box(x, botAt(0) + 0.07, Z(0) - 0.07, 0.11, 0.11, 0.14, [0.7, 0.7, 0.72]); }
    if (rr === 8 || rr === 11) { const n = rr === 8 ? 2 : 2, hgt = rr === 8 ? 0.2 : 0.3; for (let k = -n; k <= n; k++) gD.box(k * 0.22, yb + hgt / 2, zr - 0.08, 0.02, hgt, 0.45, dk); gC.box(0, yb + 0.005, zr - 0.08, W * 0.9, 0.015, 0.5, cb); }
    if (rr === 9) gB.box(0, botAt(0) + 0.08, Z(0.01), W * 1.02, 0.16, 0.14, bc);
    if (rr === 10) for (const s2 of [-1, 1]) gD.box(s2 * (widthAt((zR - z0) / L) - 0.12), clr + 0.12, zR - 0.42, 0.24, 0.26, 0.012, [0.85, 0.1, 0.1]);
  });
  KW('side', (gB, gC, gD, bc, cb, dk) => { const sd = look.side || 0, zc = (zF + zR) / 2, ln = car.wb - 0.75;
    if (sd >= 4) for (const s2 of [-1, 1]) { const x = s2 * (hw0 + 0.02);
      if (sd === 4) { gB.box(x, clr + 0.05, zc, 0.08, 0.09, ln, bc); gC.box(x + s2 * 0.05, clr + 0.1, zc + ln * 0.4, 0.1, 0.012, 0.22, cb); }
      if (sd === 5) gB.box(x, clr + 0.03, zc, 0.07, 0.14, ln, bc);
      if (sd === 6) { gB.box(x, clr + 0.05, zc, 0.06, 0.08, ln, bc); gC.box(x + s2 * 0.05, clr - 0.005, zc, 0.12, 0.012, ln, cb); }
      if (sd === 7) gB.box(x + s2 * 0.01, clr + 0.07, zc, 0.1, 0.13, ln, bc);
      if (sd === 8) gD.box(x, clr + 0.05, zc, 0.06, 0.08, ln * 0.9, dk);
      if (sd === 9) gB.box(x + s2 * 0.04, clr + 0.11, zc, 0.14, 0.2, ln * 0.85, bc);
      if (sd === 10) gB.box(x - s2 * 0.01, clr + 0.04, zc, 0.04, 0.05, ln, bc); }
  });
  KW('hood', (gB, gC, gD, bc, cb, dk) => { const hd = look.hood || 0, hm = hf(0.5);
    if (hd === 4) gB.box(0, topAt(hm) + 0.03, Z(hm), 0.62, 0.06, 0.8, bc);
    if (hd === 5) for (let k = 0; k < 7; k++) { const f0 = hf(0.25 + k * 0.07); gD.box(0, topAt(f0) + 0.01, Z(f0), 0.7, 0.012, 0.035, dk); }
    if (hd === 6) { const f0 = hf(0.45); gB.box(0, topAt(f0) + 0.06, Z(f0), 0.42, 0.12, 0.5, bc); gD.box(0, topAt(f0) + 0.07, Z(f0) + 0.252, 0.34, 0.08, 0.01, dk); }
    if (hd === 7) for (const s2 of [-1, 1]) { const f0 = hf(0.9); gbChrome.box(s2 * 0.42, topAt(f0) + 0.015, Z(f0), 0.05, 0.03, 0.05, [0.8, 0.8, 0.85]); }
    if (hd === 8) for (const s2 of [-1, 1]) { const f0 = hf(0.55); gD.box(s2 * 0.26, topAt(f0) + 0.012, Z(f0), 0.22, 0.018, 0.32, dk); }
    if (hd === 9) { gC.box(0, topAt(hm) + 0.006, Z(hm), 0.9, 0.012, 0.7, cb); for (const s2 of [-1, 1]) gD.box(s2 * 0.3, topAt(hf(0.4)) + 0.014, Z(hf(0.4)), 0.16, 0.016, 0.24, dk); }
    if (hd === 10) { const f0 = hf(0.35); gC.box(0, topAt(f0) + 0.008, Z(f0), 0.78, 0.014, 0.42, cb); gD.box(0, topAt(f0) + 0.018, Z(f0), 0.6, 0.012, 0.32, dk); }
  });
  if (!T.open) KW('roof', (gB, gC, gD, bc, cb, dk) => { const rf = look.roof || 0, Hr = H + 0.012;
    if (rf === 4) gD.box(0, Hr + 0.045, Z(T.rr + 0.04), 0.04, 0.08, 0.2, dk);
    if (rf === 5) { for (const s2 of [-1, 1]) gD.box(s2 * hw0 * 0.55, Hr + 0.05, Z(rmid), 0.04, 0.04, (T.rf - T.rr) * L * 0.8, dk); for (const f0 of [0.3, 0.7]) gD.box(0, Hr + 0.08, Z(lerp(T.rr, T.rf, f0)), hw0 * 1.15, 0.03, 0.04, dk); }
    if (rf === 6) { const z = Z(T.rf - 0.02); gD.box(0, Hr + 0.07, z, hw0 * 1.3, 0.1, 0.08, [0.05, 0.05, 0.06]); for (let k = 0; k < 4; k++) discZ(gbLight, (k - 1.5) * hw0 * 0.32, Hr + 0.07, z + 0.042, 0.04, [1, 1, 1]); }
    if (rf === 7) gC.box(0, Hr + 0.004, Z(rmid), hw0 * 1.2, 0.01, (T.rf - T.rr) * L * 0.75, cb);
    if (rf === 8) for (let k = -3; k <= 3; k++) gD.box(k * 0.13, Hr + 0.03, Z(T.rr + 0.03), 0.012, 0.05, 0.08, dk);
    if (rf === 9) gC.hexa([[-hw0 * 0.75, Hr, Z(T.rr) + 0.05], [hw0 * 0.75, Hr, Z(T.rr) + 0.05], [hw0 * 0.75, Hr + 0.02, Z(T.rr) - 0.18], [-hw0 * 0.75, Hr + 0.02, Z(T.rr) - 0.18], [-hw0 * 0.75, Hr + 0.04, Z(T.rr) + 0.05], [hw0 * 0.75, Hr + 0.04, Z(T.rr) + 0.05], [hw0 * 0.75, Hr + 0.05, Z(T.rr) - 0.18], [-hw0 * 0.75, Hr + 0.05, Z(T.rr) - 0.18]], cb);
  });
  KW('trunk', (gB, gC, gD, bc, cb, dk) => { const tk = look.trunk || 0, tf = lerp(0.02, T.rb, 0.5);
    if (tk === 3) gB.hexa([[-hw0 + 0.1, deckY, Z(0.02)], [hw0 - 0.1, deckY, Z(0.02)], [hw0 - 0.1, deckY, Z(0.16)], [-hw0 + 0.1, deckY, Z(0.16)], [-hw0 + 0.1, deckY + 0.12, Z(0.0)], [hw0 - 0.1, deckY + 0.12, Z(0.0)], [hw0 - 0.1, deckY + 0.02, Z(0.16)], [-hw0 + 0.1, deckY + 0.02, Z(0.16)]], bc);
    if (tk === 4) { gC.box(0, topAt(tf) + 0.01, Z(tf), W * 0.78, 0.014, Math.max(0.2, (T.rb - 0.03) * L * 0.9), cb); gC.box(0, deckY + 0.035, Z(0.015), W * 0.78, 0.045, 0.06, cb); }
    if (tk === 5) { for (const s2 of [-1, 1]) gD.box(s2 * 0.35, deckY + 0.05, Z(0.05), 0.03, 0.1, 0.06, dk); gC.box(0, deckY + 0.1, Z(0.05), W * 0.62, 0.02, 0.18, cb); }
    if (tk === 6) gbBrake.box(0, deckY + 0.025, Z(0.03), W * 0.5, 0.03, 0.03, [1, 0.06, 0.05]);
    if (tk === 7) { gB.box(0, deckY + 0.035, Z(0.015), W * 0.78, 0.045, 0.06, bc); gB.box(0, deckY + 0.075, Z(0.03), W * 0.7, 0.03, 0.05, bc); }
  });
  KW('fender', (gB, gC, gD, bc, cb, dk) => { const fd = look.fender || 0;
    if (fd === 6) for (const zz of [zF, zR]) for (const s2 of [-1, 1]) gD.box(s2 * (widthAt((zz - z0) / L) - 0.12), clr + 0.1, zz - 0.4, 0.22, 0.22, 0.012, [0.08, 0.08, 0.09]);
    if (fd === 7) for (const zz of [zF]) for (const s2 of [-1, 1]) for (let k = 0; k < 3; k++) gD.box(s2 * (widthAt((zz - z0) / L) + 0.02), clr + 0.38 + k * 0.05, zz - 0.45, 0.02, 0.025, 0.18, dk);
    if (fd === 3) for (const zz of [zF, zR]) for (const s2 of [-1, 1]) for (let k = 0; k < 5; k++) { const a = PI * (0.15 + k * 0.17); gbChrome.box(s2 * (widthAt((zz - z0) / L) + 0.13), tireR + Math.sin(a) * (tireR + 0.06), zz + Math.cos(a) * (tireR + 0.06), 0.015, 0.025, 0.025, [0.75, 0.75, 0.78]); }
  });
  // ルーフアクセサリー（クリスマス限定）
  const rZ = Z((T.rr + T.rf) / 2), rY = T.open ? beltAt(0.4) + 0.4 : H + 0.015;
  if (look.acc === 'hat') { gbBody.cylY(0, rY, rZ, 0.32, 0.32, 0.08, 14, [0.95, 0.95, 0.95]); gbBody.cylY(0, rY + 0.08, rZ, 0.27, 0.0, 0.55, 14, [0.82, 0.05, 0.07]); gbBody.sphere(0, rY + 0.62, rZ, 0.07, [0.97, 0.97, 0.97], 4); }
  if (look.acc === 'antler') { for (const s of [-1, 1]) { const b = [0.45, 0.28, 0.12]; gbBody.box(s * 0.35, rY + 0.22, rZ + 0.1, 0.05, 0.45, 0.05, b); gbBody.box(s * 0.42, rY + 0.38, rZ + 0.1, 0.18, 0.04, 0.04, b); gbBody.box(s * 0.3, rY + 0.33, rZ + 0.05, 0.04, 0.04, 0.16, b); } gbGlow.sphere(0, botAt(1) + 0.3, Z(1) + 0.05, 0.09, [1, 0.1, 0.1], 4); }
  if (look.acc === 'tree') { gbBody.cylY(0, rY, rZ, 0.05, 0.05, 0.1, 6, [0.4, 0.25, 0.1]); for (let k = 0; k < 3; k++) gbBody.cylY(0, rY + 0.08 + k * 0.17, rZ, 0.3 - k * 0.08, 0.02, 0.28, 10, [0.06, 0.4, 0.15]); gbGlow.sphere(0, rY + 0.68, rZ, 0.06, [1, 0.85, 0.2], 4); for (let k = 0; k < 8; k++) { const a = k * 2.3, h = 0.15 + (k % 4) * 0.12, r = 0.26 - h * 0.35; gbGlow.sphere(Math.cos(a) * r, rY + h, rZ + Math.sin(a) * r, 0.03, [[1, .1, .1], [1, .8, .1], [.2, .6, 1]][k % 3], 3); } }
  // 窓からトナカイの角（運転席・助手席）
  if (look.wacc === 'antler' && !T.open) {
    const f = T.rf - 0.035, wy = beltAt(f) + 0.17, wz = Z(f), ww = widthAt(f) * 0.9, b = [0.46, 0.29, 0.13];
    for (const s of [-1, 1]) { const x0 = s * ww;
      gbBody.box(x0 + s * 0.09, wy, wz, 0.2, 0.045, 0.045, b);                        // 窓から出る棒
      gbBody.box(x0 + s * 0.2, wy + 0.2, wz, 0.05, 0.42, 0.05, b);                     // 主幹
      gbBody.box(x0 + s * 0.27, wy + 0.42, wz - 0.02, 0.16, 0.045, 0.045, b);          // 先端の枝
      gbBody.box(x0 + s * 0.31, wy + 0.5, wz - 0.02, 0.045, 0.16, 0.045, b);
      gbBody.box(x0 + s * 0.2, wy + 0.3, wz + 0.09, 0.045, 0.045, 0.16, b);            // 前向きの枝
      gbBody.box(x0 + s * 0.2, wy + 0.38, wz + 0.16, 0.045, 0.14, 0.045, b);
      gbBody.box(x0 + s * 0.26, wy + 0.16, wz - 0.06, 0.12, 0.04, 0.04, b);             // 小さい枝
      gbBody.box(x0 + s * 0.31, wy + 0.22, wz - 0.06, 0.04, 0.12, 0.04, b); }
  }
  // 光るナンバー（プレートのネオン枠）
  if (look.plateGlow && look.plateGlow !== 'none') {
    const it = typeof ITEM_BY_ID !== 'undefined' ? ITEM_BY_ID[look.plateGlow] : null; const py0 = Math.max(botAt(0) + 0.1, topAt(0) * 0.55), pz = Z(0) - 0.016, th = 0.02;
    const cols = look.plateGlow === 'xmas' ? [[1, 0.1, 0.1], [0.1, 1, 0.3]] : it && it.aurora ? [[0.3, 1, 0.6], [0.25, 0.8, 1], [0.7, 0.35, 1]] : it && it.rainbow ? [[1, 0.2, 0.2], [1, 0.8, 0.1], [0.2, 1, 0.4], [0.2, 0.6, 1], [0.8, 0.3, 1]] : [it ? it.rgb : [1, 1, 1]];
    const segs = 10; let k = 0;
    for (let i2 = 0; i2 < segs; i2++) { const x = -0.28 + (i2 + 0.5) * 0.56 / segs; gbGlow.box(x, py0 - 0.018, pz, 0.56 / segs, th, 0.012, cols[k++ % cols.length]); gbGlow.box(-x, py0 + 0.148, pz, 0.56 / segs, th, 0.012, cols[k++ % cols.length]); }
    for (const sx of [-1, 1]) for (let i2 = 0; i2 < 3; i2++) gbGlow.box(sx * 0.29, py0 - 0.01 + (i2 + 0.5) * 0.15 / 3, pz, th, 0.05, 0.012, cols[(k++) % cols.length]);
  }
  // エキストラ（ジェット・ロケット等）
  for (const [ex, exOff] of [[look.extra, 0], [look.extra2 !== look.extra ? look.extra2 : '', 1]]) if (ex) { const zb = Z(0.03) + exOff * 0.02, yb = deckY + 0.16 + exOff * 0.34;
    const EXD = typeof EXTRA_BY_ID !== 'undefined' ? EXTRA_BY_ID[ex] : null; const jetLike = EXD && EXD.kind === 'thrust' && !/rocket|saturn/.test(ex);
    if (jetLike) { const xs = EXD.twin ? [-0.35, 0.35] : [0], jc = EXD.gold ? [1, 0.82, 0.3] : EXD.col ? EXD.col.map(v => 0.45 + v * 0.4) : [0.62, 0.62, 0.66]; for (const x of xs) { gbChrome.box(x, yb, zb + 0.15, 0.3, 0.3, 0.75, jc); gbDark.box(x, yb, zb - 0.235, 0.24, 0.24, 0.02, [0.02, 0.02, 0.02]); gbGlow.box(x, yb, zb - 0.245, 0.16, 0.16, 0.01, EXD.col || [1, 0.5, 0.15]); gbDark.box(x, deckY + 0.04, zb + 0.15, 0.08, 0.06, 0.4, dark); } }
    else if (EXD && /rocket|saturn/.test(ex)) { const xs = EXD.twin ? [-0.3, 0.3] : [0]; for (const x of xs) { gbBody.box(x, yb + 0.02, zb + 0.25, 0.3, 0.3, ex === 'saturn' ? 1.15 : 0.95, [0.88, 0.88, 0.9]); gbBody.box(x, yb + 0.02, zb + (ex === 'saturn' ? 0.88 : 0.78), 0.2, 0.2, 0.14, [0.85, 0.1, 0.08]); gbGlow.box(x, yb + 0.02, zb - 0.23, 0.2, 0.2, 0.01, [1, 0.35, 0.05]); gbDark.box(x, deckY + 0.04, zb + 0.25, 0.1, 0.08, 0.5, dark); } }
    if (false) { const xs = ex === 'twinjet' ? [-0.35, 0.35] : [0]; for (const x of xs) { gbChrome.box(x, yb, zb + 0.15, 0.3, 0.3, 0.75, ex === 'plasma' ? [0.5, 0.6, 0.8] : [0.62, 0.62, 0.66]); gbDark.box(x, yb, zb - 0.235, 0.24, 0.24, 0.02, [0.02, 0.02, 0.02]); gbGlow.box(x, yb, zb - 0.245, 0.16, 0.16, 0.01, ex === 'plasma' ? [0.3, 0.6, 1] : [1, 0.5, 0.15]); gbDark.box(x, deckY + 0.04, zb + 0.15, 0.08, 0.06, 0.4, dark); } }
    if (false) { gbBody.box(0, yb + 0.02, zb + 0.25, 0.34, 0.34, 0.95, [0.85, 0.85, 0.88]); gbBody.box(0, yb + 0.02, zb + 0.78, 0.22, 0.22, 0.14, [0.85, 0.1, 0.08]); for (const s of [-1, 1]) gbBody.box(s * 0.22, yb + 0.02, zb - 0.1, 0.12, 0.02, 0.24, [0.85, 0.1, 0.08]); gbGlow.box(0, yb + 0.02, zb - 0.23, 0.22, 0.22, 0.01, [1, 0.35, 0.05]); gbDark.box(0, deckY + 0.04, zb + 0.25, 0.1, 0.08, 0.5, dark); }
    if (EXD && EXD.kind === 'hop') for (const s of [-1, 1]) for (const zz of [zF, zR]) gbChrome.box(s * (hw0 - 0.2), clr - 0.02, zz, 0.12, 0.06, 0.12, [0.55, 0.75, 0.95]);
    if (EXD && EXD.kind === 'chute') gbBody.box(0, deckY + 0.06, Z(0.02) + 0.05, 0.3, 0.12, 0.2, [0.9, 0.1, 0.1]);
    if (EXD && EXD.kind === 'fireworks') for (const s of [-1, 1]) for (let k = 0; k < 3; k++) gbBody.box(s * (0.2 + k * 0.12), deckY + 0.12, Z(0.07), 0.08, 0.2, 0.08, [[1, 0.2, 0.2], [0.2, 0.6, 1], [1, 0.85, 0.2]][k]);
  }
  // デカール（ステッカー）：側面・ボンネット・ルーフ・トランクの好きな場所に1枚ずつ
  const decalGB = new GB(); let decalCanvas = null;
  { const dl = (look.decals || []).slice(0, 8); if (dl.length) {
      const CW = 256, CH = 128; decalCanvas = document.createElement('canvas'); decalCanvas.width = CW * 4; decalCanvas.height = CH * 2; const g = decalCanvas.getContext('2d');
      dl.forEach((d, di) => {
        const cx = (di % 4) * CW, cy = Math.floor(di / 4) * CH; g.save(); g.beginPath(); g.rect(cx, cy, CW, CH); g.clip(); g.translate(cx + CW / 2, cy + CH / 2); g.scale(2.3, 2.3); g.textBaseline = 'middle'; g.textAlign = 'center'; drawDecalShape(g, d, look); g.restore();
        const ps = Object.assign({ f: 'L', x: 0.2 + di * 0.18, y: 0.55, s: 1, r: 0 }, (look.decalPos || {})[d] || {}); const face = ps.f || 'L';
        const w = 0.5 * clamp(ps.s, 0.3, 3), h = w / 2, rr = (ps.r || 0) * DEG; let C, U, Vv, Nn;
        if (face === 'L' || face === 'R') { const sg = face === 'R' ? 1 : -1, f = clamp(ps.x, 0.05, 0.95), yy = clamp(ps.y * H, botAt(f) + 0.06, beltAt(f) - 0.02); C = [sg * (widthAt(f) + 0.014), yy, Z(f)]; Nn = [sg, 0, 0]; U = [0, 0, -sg]; Vv = [0, 1, 0]; }
        else { const rng = face === 'H' ? [T.ws + 0.02, 0.95] : face === 'T' ? [T.rr + 0.02, T.rf - 0.02] : [0.03, T.rb - 0.01]; const f = lerp(rng[0], rng[1], clamp(ps.x, 0, 1)); const lat = (clamp(ps.y, 0, 1) - 0.5) * 2 * widthAt(f) * 0.75;
          const yy = (face === 'T' && !T.open ? H + 0.018 : topAt(f)) + 0.016, sl = face === 'T' ? 0 : (topAt(Math.min(1, f + 0.01)) - topAt(Math.max(0, f - 0.01))) / (0.02 * L); const nl = Math.hypot(1, sl);
          C = [lat, yy, Z(f)]; Nn = [0, 1 / nl, -sl / nl]; Vv = [0, sl / nl, 1 / nl]; U = [-1, 0, 0]; }
        const cr = Math.cos(rr), sr = Math.sin(rr); const u2 = U.map((v, k) => v * cr + Vv[k] * sr), v2 = Vv.map((v, k) => -U[k] * sr + v * cr);
        const P4 = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [C[0] + u2[0] * a * w / 2 + v2[0] * b * h / 2, C[1] + u2[1] * a * w / 2 + v2[1] * b * h / 2, C[2] + u2[2] * a * w / 2 + v2[2] * b * h / 2]);
        const u0 = (di % 4) / 4, u1 = u0 + 0.25, w0 = 1 - Math.floor(di / 4) / 2, w1 = w0 - 0.5; const UV = [[u0, w1], [u1, w1], [u1, w0], [u0, w0]];
        const vx = k => decalGB.v(P4[k][0], P4[k][1], P4[k][2], Nn[0], Nn[1], Nn[2], [1, 1, 1], UV[k][0], UV[k][1]);
        vx(0); vx(1); vx(2); vx(0); vx(2); vx(3); vx(0); vx(2); vx(1); vx(0); vx(3); vx(2);
      });
  } }
  // アンダーネオン
  const GLOW = { red: [1, 0.08, 0.1], blue: [0.1, 0.4, 1], green: [0.1, 1, 0.35], purple: [0.7, 0.15, 1], white: [0.9, 0.95, 1], xmas: null };
  const glowCol = look.glow && look.glow !== 'none' ? (look.glow === 'xmas' ? [1, 0.2, 0.2] : (GLOW[look.glow] || (typeof ITEM_BY_ID !== 'undefined' && ITEM_BY_ID[look.glow] ? ITEM_BY_ID[look.glow].rgb : null) || [1, 1, 1])) : null;
  if (glowCol) for (const s of [-1, 1]) for (let k = 0; k < 10; k++) { const z = lerp(zR, zF, k / 9); gbGlow.box(s * (hw0 - 0.12), clr - 0.02, z, 0.05, 0.02, 0.22, look.glow === 'xmas' ? (k % 2 ? [0.1, 1, 0.3] : [1, 0.1, 0.1]) : glowCol); }
  for (let i = 0; i < gbGlow.a.length; i += VSTRIDE) gbGlow.a[i + 9] = 1;
  // マフラー
  const exN = [1, 2, 1, 4][look.exhaust || 0], exR = look.exhaust === 2 ? 0.07 : 0.045, ey = botAt(0) + 0.06;
  for (let k = 0; k < exN; k++) { const x = exN === 1 ? -hw0 * 0.55 : exN === 2 ? (k ? -1 : 1) * hw0 * 0.55 : (k < 2 ? -1 : 1) * hw0 * 0.55 + (k % 2 ? 0.1 : -0.1); gbChrome.box(x, ey, Z(0.0) - 0.02, exR * 2, exR * 2, 0.16, [0.65, 0.65, 0.68]); gbDark.box(x, ey, Z(0.0) - 0.1, exR * 1.4, exR * 1.4, 0.01, [0.01, 0.01, 0.01]); }
  // ナンバープレート
  const py = Math.max(botAt(0) + 0.1, topAt(0) * 0.55);
  const gbPlate = new GB(); gbPlate.triN([0.26, py, Z(0) - 0.012], [-0.26, py, Z(0) - 0.012], [-0.26, py + 0.13, Z(0) - 0.012], [0, 0, -1], [1, 1, 1], [0, 0, 1, 0, 1, 1]); gbPlate.triN([0.26, py, Z(0) - 0.012], [-0.26, py + 0.13, Z(0) - 0.012], [0.26, py + 0.13, Z(0) - 0.012], [0, 0, -1], [1, 1, 1], [0, 0, 1, 1, 0, 1]);

  // ---- メッシュ・マテリアル ----
  const gl = R.gl; const node = new Node(); const body = new Node(); node.add(body);
  const pm = PAINT_MAT[look.paint] || PAINT_MAT.metallic;
  const livCanvas = drawLivery(look, car); const livTex = R.texFromCanvas(livCanvas, null, true, true);
  const plateTex = R.texFromCanvas(drawPlate(look.plate), null, true, false);
  const meshes = [];
  const add = (gb, mat, target = body) => { if (!gb.count) return null; const m = new Mesh(gl, gb.a); meshes.push(m); target.addMesh(m, mat); return mat; };
  const ghost = opts.ghost;
  const A = ghost ? { blend: true, alpha: 0.35, depthWrite: false } : {};
  add(gbSide, Mat(Object.assign({ tex: livTex, texMode: 1, refl: pm.refl, spec: pm.spec, shin: pm.shin, metal: pm.metal || 0, rough: pm.rough || 0, clear: pm.clear || 0, flake: pm.flake || 0 }, A)));
  const decalTex = decalCanvas ? R.texFromCanvas(decalCanvas, null, true, true) : null; if (decalTex) add(decalGB, Mat(Object.assign({ tex: decalTex, texMode: 3, spec: 0.3, shin: 30, refl: pm.refl * 0.5 }, A)));
  add(gbBody, Mat(Object.assign({ refl: pm.refl, spec: pm.spec, shin: pm.shin, metal: pm.metal || 0, rough: pm.rough || 0, clear: pm.clear || 0, flake: pm.flake || 0 }, A)));
  add(gbCarbon, Mat(Object.assign({ refl: 0.22, spec: 1.0, shin: 90, rough: 0.2, clear: 1.1, flake: 0.25 }, A)));
  const glassAlpha = ghost ? 0.35 : 0.7 + tint * 0.27; const glassMat = Mat({ refl: 0.6, spec: 1.4, shin: 160, clear: 0.6, blend: true, alpha: glassAlpha, depthWrite: !ghost }); add(gbGlass, glassMat);
  const cabin = new Node(); body.add(cabin);
  add(gbCab, Mat(Object.assign({ refl: pm.refl * 0.5, spec: pm.spec, shin: pm.shin, metal: pm.metal || 0, rough: pm.rough || 0, clear: pm.clear || 0, flake: pm.flake || 0 }, A)), cabin);
  add(gbFrame, Mat(Object.assign({ spec: 0.15, rough: 0.7 }, A)), cabin);
  add(gbWin, Mat(Object.assign({ refl: 0.55, spec: 1.6, shin: 180, clear: 0.7 }, A)), cabin);
  add(gbDark, Mat(Object.assign({ spec: 0.12, rough: 0.75 }, A)));
  add(gbChrome, Mat(Object.assign({ refl: 0.85, spec: 1.8, shin: 160, metal: 1, rough: 0.05 }, A)));
  add(gbInt, Mat(Object.assign({ spec: 0.05 }, A)));
  add(gbPlate, Mat(Object.assign({ tex: plateTex, texMode: 1, spec: 0.2 }, A)));
  add(gbGlow, Mat(Object.assign({ emis: 1.4 }, A)));
  const headMat = Mat(Object.assign({ emis: 0.15, spec: 1.2, shin: 80, refl: 0.3, tint: hlTint.slice() }, A));
  for (let i = 0; i < gbLight.a.length; i += VSTRIDE) gbLight.a[i + 9] = 1;
  for (let i = 0; i < gbBrake.a.length; i += VSTRIDE) gbBrake.a[i + 9] = 1;
  add(gbLight, headMat);
  const brakeMat = Mat(Object.assign({ emis: 0.25, spec: 1, shin: 60 }, A)); add(gbBrake, brakeMat);
  const headCol = headTint;
  // ポップアップライト
  const popups = [];
  if (popupOn) {
    for (const s of [-1, 1]) {
      const pn = new Node(); pn.pos = [s * xN * 0.62, topAt(0.93) - 0.015, Z(0.93)];
      const g = new GB(); g.box(0, 0.06, 0.1, 0.42, 0.11, 0.22, bodyCol); const gl2 = new GB(); gl2.box(0, 0.06, 0.215, 0.36, 0.08, 0.01, [1, 1, 1]); for (let i = 0; i < gl2.a.length; i += VSTRIDE) gl2.a[i + 9] = 1;
      const m1 = new Mesh(gl, g.a), m2 = new Mesh(gl, gl2.a); meshes.push(m1, m2);
      pn.addMesh(m1, Mat(Object.assign({ refl: pm.refl, spec: pm.spec, shin: pm.shin, metal: pm.metal || 0, rough: pm.rough || 0, clear: pm.clear || 0, flake: pm.flake || 0 }, A))); pn.addMesh(m2, headMat);
      body.add(pn); popups.push(pn);
    }
  }
  // ---- 運転席（ステアリング・メーター・ドライバー） ----
  const DX = -0.36, yBelt = beltAt(T.ws), zWS = Z(T.ws), sw = new Node(); sw.pos = [DX, yBelt + 0.02, zWS - 0.55]; sw.rot = [0, 0.38, 0];
  const cockpit = new Node(), driverNode = new Node(); const needles = {};
  { const g = new GB(), lea = [0.05, 0.05, 0.055], al = [0.55, 0.56, 0.6], glove = [0.12, 0.12, 0.13], sleeve = [0.1, 0.12, 0.2];
    for (let k = 0; k < 32; k++) { const a = k / 32 * TAU, a2 = (k + 1) / 32 * TAU, ri = 0.168, ro = 0.198, t = 0.016, c = k === 8 ? [0.85, 0.1, 0.08] : lea; const P = (an, r, z) => [Math.cos(an) * r, Math.sin(an) * r, z]; g.hexa([P(a, ri, -t), P(a2, ri, -t), P(a2, ro, -t), P(a, ro, -t), P(a, ri, t), P(a2, ri, t), P(a2, ro, t), P(a, ro, t)], c); }
    g.box(0, 0, 0.006, 0.09, 0.09, 0.04, lea); g.box(0, 0, -0.016, 0.05, 0.05, 0.01, al);
    for (const [a, w] of [[0, 0.17], [PI, 0.17], [-PI / 2, 0.15]]) { const cx = Math.cos(a) * 0.1, cy = Math.sin(a) * 0.1; g.box(cx, cy, 0.004, Math.abs(Math.cos(a)) * w + 0.035, Math.abs(Math.sin(a)) * w + 0.035, 0.022, al); }
    // ドライバーの手（9時と3時を握る）と前腕：ハンドルと一緒に回る
    for (const s2 of [-1, 1]) { const hx = s2 * 0.183; g.box(hx, 0.0, -0.012, 0.055, 0.085, 0.05, glove); g.box(hx - s2 * 0.022, 0.03, -0.03, 0.03, 0.03, 0.035, glove); }
    const m = new Mesh(gl, g.a); meshes.push(m); sw.addMesh(m, Mat({ spec: 0.35, shin: 30 })); }
  { const g = new GB(), dash = [0.06, 0.06, 0.065], trim = [0.12, 0.12, 0.13], face = [0.02, 0.02, 0.025], ring = [0.7, 0.72, 0.76], wht = [0.95, 0.95, 0.95];
    // ダッシュボード上面とメーターフード
    g.box(0, yBelt + 0.02, zWS - 0.3, W * 0.84, 0.06, 0.4, dash); g.box(DX, yBelt + 0.1, zWS - 0.36, 0.42, 0.04, 0.22, dash); g.box(DX, yBelt + 0.03, zWS - 0.47, 0.44, 0.15, 0.03, trim);
    g.box(0.05, yBelt - 0.12, zWS - 0.5, 0.28, 0.3, 0.06, trim); g.box(0.05, yBelt - 0.05, zWS - 0.53, 0.2, 0.08, 0.01, [0.1, 0.25, 0.35]); // センタークラスター＋画面
    for (const x of [0.25, 0.42]) g.box(x, yBelt - 0.01, zWS - 0.5, 0.08, 0.05, 0.02, face); // エアコン吹き出し口
    // メーター（タコ・スピード）
    const gau = [[DX - 0.075, 'tach'], [DX + 0.075, 'spd']];
    for (const [gx] of gau) { for (let k = 0; k < 20; k++) { const a = k / 20 * TAU, a2 = (k + 1) / 20 * TAU, r = 0.058; g.v(gx, yBelt + 0.04, zWS - 0.495, 0, 0, -1, face); g.v(gx + Math.cos(a2) * r, yBelt + 0.04 + Math.sin(a2) * r, zWS - 0.495, 0, 0, -1, face); g.v(gx + Math.cos(a) * r, yBelt + 0.04 + Math.sin(a) * r, zWS - 0.495, 0, 0, -1, face); }
      for (let k = 0; k < 24; k++) { const a = k / 24 * TAU, r = 0.062; g.box(gx + Math.cos(a) * r, yBelt + 0.04 + Math.sin(a) * r, zWS - 0.494, 0.012, 0.012, 0.006, ring); }
      for (let k = 0; k <= 8; k++) { const a = (225 - k * 33.75) * DEG, r = 0.046; g.box(gx + Math.cos(a) * r, yBelt + 0.04 + Math.sin(a) * r, zWS - 0.497, 0.006, 0.006, 0.004, k >= 7 ? [1, 0.15, 0.1] : wht); } }
    // コラム・シフトノブ・ルームミラー
    g.cylX ? 0 : 0; g.box(DX, yBelt - 0.02, zWS - 0.43, 0.06, 0.06, 0.2, dash);
    g.box(0.05, yBelt - 0.32, Z((T.rr + T.rf) / 2) + 0.15, 0.16, 0.1, 0.5, trim); g.box(0.05, yBelt - 0.2, Z((T.rr + T.rf) / 2) + 0.3, 0.02, 0.16, 0.02, al3()); g.box(0.05, yBelt - 0.11, Z((T.rr + T.rf) / 2) + 0.3, 0.045, 0.045, 0.045, [0.1, 0.1, 0.11]);
    if (!T.open) { g.box(0, H - 0.075, Z(T.rf) + 0.02, 0.2, 0.045, 0.015, face); g.box(0, H - 0.04, Z(T.rf) + 0.03, 0.015, 0.03, 0.015, face); }
    // ドライバー（胴体・頭・ヘルメット）— 外から見える。コックピット視点では描かない
    const gd = new GB();
    const zs = Z((T.rr + T.rf) / 2) - 0.15, ys = beltAt(0.4); gd.box(DX, ys - 0.02, zs, 0.38, 0.42, 0.24, [0.1, 0.12, 0.2]); gd.box(DX, ys + 0.24, zs + 0.02, 0.13, 0.08, 0.13, [0.85, 0.66, 0.52]);
    gd.sphere(DX, ys + 0.34, zs, 0.13, [0.92, 0.92, 0.95], 6); gd.box(DX, ys + 0.33, zs + 0.11, 0.18, 0.07, 0.04, [0.05, 0.05, 0.08]);
    for (const s2 of [-1, 1]) gd.hexa([[DX + s2 * 0.16, ys + 0.12, zs], [DX + s2 * 0.24, ys + 0.12, zs], [DX + s2 * 0.24, ys + 0.2, zs], [DX + s2 * 0.16, ys + 0.2, zs], [DX + s2 * 0.26, yBelt - 0.05, zWS - 0.85], [DX + s2 * 0.32, yBelt - 0.05, zWS - 0.85], [DX + s2 * 0.32, yBelt + 0.02, zWS - 0.85], [DX + s2 * 0.26, yBelt + 0.02, zWS - 0.85]], [0.1, 0.12, 0.2]);
    { const dm = new Mesh(gl, gd.a); meshes.push(dm); driverNode.addMesh(dm, Mat({ spec: 0.3, shin: 30 })); }
    const m = new Mesh(gl, g.a); meshes.push(m); cockpit.addMesh(m, Mat({ spec: 0.25, shin: 30 }));
    function al3() { return [0.55, 0.56, 0.6]; }
    for (const [gx, key] of gau) { const nd = new Node(); nd.pos = [gx, yBelt + 0.04, zWS - 0.5]; const ng = new GB(); ng.box(0, 0.022, 0, 0.006, 0.048, 0.004, [1, 0.25, 0.1]); ng.box(0, 0, 0, 0.014, 0.014, 0.006, [0.2, 0.2, 0.2]); const nm = new Mesh(gl, ng.a); meshes.push(nm); nd.addMesh(nm, Mat({ emis: 0.9, spec: 0 })); cockpit.add(nd); needles[key] = nd; }
  }
  body.add(sw); body.add(cockpit); if (car.body !== 'bus' && car.body !== 'van' && car.body !== 'sleigh') body.add(driverNode);
  const Yhood = beltAt(T.ws);
  // --- ホイール ---
  const ws = WHEEL_STYLES.find(w => w.id === look.wheel) || WHEEL_STYLES[0];
  const inch = opts.wheelIn || 17, rimR = inch * 0.0254 / 2 * 1.02, tireW = 0.21 + (opts.tireW || 0) * 0.02;
  const rimCol = ws.xmas ? [0.95, 0.95, 0.95] : hexToRgb(ws.rim || look.wheelColor || '#c8c8cc');
  const wg = new GB(); wg.cylX(0, 0, 0, tireR, tireW, 24, [0.06, 0.06, 0.065], true, [0.05, 0.05, 0.055]);
  for (let k = 0; k < 36; k++) { const a = k / 36 * TAU; for (const o of [-1, 1]) wg.box(o * tireW * 0.22, Math.cos(a) * (tireR + 0.002), Math.sin(a) * (tireR + 0.002), tireW * 0.32, 0.008, 0.03, [0.04, 0.04, 0.045]); } // トレッドのブロック
  const rg = new GB(); const fx = tireW / 2 + 0.003;
  if (ws.spokes === 0) { rg.cylX(fx - 0.015, 0, 0, rimR, 0.04, 16, [0.62, 0.62, 0.66]); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; rg.box(fx + 0.008, Math.cos(a) * rimR * 0.6, Math.sin(a) * rimR * 0.6, 0.01, 0.05, 0.05, [0.15, 0.15, 0.15]); } }
  else {
    rg.cylX(fx - 0.04, 0, 0, rimR, 0.06, 18, [0.12, 0.12, 0.13]); // 奥
    for (let k = 0; k < 18; k++) { const a0 = k / 18 * TAU, a1 = (k + 1) / 18 * TAU; const r0 = rimR * 0.92; rg.quad([fx, Math.cos(a0) * r0, Math.sin(a0) * r0], [fx, Math.cos(a1) * r0, Math.sin(a1) * r0], [fx, Math.cos(a1) * rimR, Math.sin(a1) * rimR], [fx, Math.cos(a0) * rimR, Math.sin(a0) * rimR], rimCol); }
    const sp = ws.spokes;
    for (let k = 0; k < sp; k++) {
      const a = k / sp * TAU; const ca = Math.cos(a), sa = Math.sin(a); const len = rimR * 0.85, wdt = ws.id === 'mesh' ? 0.018 : 0.045;
      const c = ws.xmas ? (k % 2 ? [0.9, 0.05, 0.08] : [0.97, 0.97, 0.97]) : rimCol;
      rg.hexa([[fx - (ws.deep ? 0.05 : 0.01), -sa * wdt, ca * wdt], [fx, -sa * wdt, ca * wdt], [fx, ca * len - sa * wdt * 0.6, sa * len + ca * wdt * 0.6], [fx - (ws.deep ? 0.05 : 0.01), ca * len - sa * wdt * 0.6, sa * len + ca * wdt * 0.6],
      [fx - (ws.deep ? 0.05 : 0.01), sa * wdt, -ca * wdt], [fx, sa * wdt, -ca * wdt], [fx, ca * len + sa * wdt * 0.6, sa * len - ca * wdt * 0.6], [fx - (ws.deep ? 0.05 : 0.01), ca * len + sa * wdt * 0.6, sa * len - ca * wdt * 0.6]], c);
    }
    rg.cylX(fx + 0.004, 0, 0, rimR * 0.18, 0.012, 10, [0.2, 0.2, 0.22]);
  }
  for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; rg.box(fx + 0.008, Math.cos(a) * rimR * 0.27, Math.sin(a) * rimR * 0.27, 0.016, 0.022, 0.022, [0.75, 0.76, 0.8]); } rg.box(fx + 0.012, 0, 0, 0.006, rimR * 0.12, rimR * 0.12, rimCol); // ナット・センターキャップ
  // ブレーキキャリパー
  const cg = new GB(); cg.box(fx - 0.06, rimR * 0.55, rimR * 0.35, 0.05, rimR * 0.45, rimR * 0.5, hexToRgb(look.caliper || '#cc1010'));
  cg.cylX(fx - 0.09, 0, 0, rimR * 0.85, 0.02, 20, [0.42, 0.42, 0.45], true); cg.cylX(fx - 0.085, 0, 0, rimR * 0.4, 0.03, 12, [0.3, 0.3, 0.33], true);
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; cg.box(fx - 0.079, Math.cos(a) * rimR * 0.62, Math.sin(a) * rimR * 0.62, 0.004, 0.014, 0.014, [0.12, 0.12, 0.13]); } // ドリルドローター
  const tireMesh = new Mesh(gl, wg.a), rimMesh = new Mesh(gl, rg.a), calMesh = new Mesh(gl, cg.a); meshes.push(tireMesh, rimMesh, calMesh);
  const tireMat = Mat(Object.assign({ spec: 0.04, rough: 0.95 }, A)), rimMat = Mat(Object.assign({ refl: 0.55, spec: 1.3, shin: 90, metal: 0.85, rough: 0.18, clear: 0.4 }, A)), calMat = Mat(Object.assign({ spec: 0.6, shin: 50, clear: 0.8 }, A));
  const wheels = []; const txAt = z => widthAt((z - z0) / L) - tireW / 2 + 0.035 + wide * 0.05 + (opts.track || 0) * 0.01;
  for (const [x, z, front] of [[txAt(zF), zF, 1], [-txAt(zF), zF, 1], [txAt(zR), zR, 0], [-txAt(zR), zR, 0]]) {
    const hub = new Node(); hub.pos = [x, tireR, z]; const side = x > 0 ? 1 : -1;
    const spin = new Node(); spin.rot = [side > 0 ? 0 : PI, 0, 0];
    spin.addMesh(tireMesh, tireMat).addMesh(rimMesh, rimMat);
    const cal = new Node(); cal.rot = [side > 0 ? 0 : PI, 0, 0]; cal.addMesh(calMesh, calMat);
    hub.add(cal); hub.add(spin); node.add(hub);
    wheels.push({ hub, spin, front, side, x, z });
  }
  // 影
  const sg = new GB(); const sh = 0.02; for (let k = 0; k < 4; k++) { const e = 0.92 + k * 0.08; sg.quad([-hw0 * e, sh, -L / 2 * e], [hw0 * e, sh, -L / 2 * e], [hw0 * e, sh, L / 2 * e], [-hw0 * e, sh, L / 2 * e], [0, 0, 0]); }
  const shadowMesh = new Mesh(gl, sg.a); meshes.push(shadowMesh);
  const shadow = new Node(); shadow.addMesh(shadowMesh, Mat({ blend: true, alpha: 0.16, depthWrite: false, emis: 0, sunScale: 0 })); node.add(shadow);
  // ---- サンタのそり（車体をそりに置き換え、トナカイは選択式） ----
  if (car.body === 'sleigh') {
    body.parts.length = 0; body.children.length = 0; for (const w of wheels) w.hub.visible = false;
    const red = look.color ? hex2rgb(look.color) : [0.78, 0.06, 0.12], gold = [1, 0.8, 0.3], wood = [0.35, 0.2, 0.1], green = [0.05, 0.35, 0.15], brown = [0.45, 0.28, 0.14], white = [0.95, 0.95, 0.95];
    const gS = new GB(), gG = new GB(), gW = new GB(), gN = new GB();
    // ランナー（そりの足）
    for (const x of [-0.72, 0.72]) { gG.box(x, 0.06, -0.2, 0.07, 0.06, 3.6, gold); gG.box(x, 0.2, 1.7, 0.07, 0.06, 0.4, gold); gG.box(x, 0.42, 1.92, 0.07, 0.06, 0.3, gold); gG.box(x, 0.68, 2.02, 0.07, 0.25, 0.07, gold); gG.box(x, 0.86, 1.94, 0.07, 0.07, 0.18, gold);
      for (const z of [-1.5, -0.3, 0.9]) gG.box(x, 0.24, z, 0.06, 0.32, 0.06, gold); }
    // 車体
    gS.box(0, 0.68, -0.3, 1.6, 0.56, 3.1, red);
    gS.hexa([[-0.8, 0.4, 1.25], [0.8, 0.4, 1.25], [0.8, 0.4, 1.7], [-0.8, 0.4, 1.7], [-0.8, 0.96, 1.25], [0.8, 0.96, 1.25], [0.7, 1.3, 1.85], [-0.7, 1.3, 1.85]], red);
    for (const x of [-0.81, 0.81]) { gG.box(x, 0.96, -0.3, 0.04, 0.05, 3.1, gold); gG.box(x, 0.45, -0.3, 0.04, 0.05, 3.1, gold); }
    gG.box(0, 1.31, 1.85, 1.42, 0.05, 0.06, gold);
    gS.box(0, 1.25, -1.62, 1.6, 0.7, 0.18, red); gG.box(0, 1.6, -1.62, 1.64, 0.05, 0.2, gold);
    gW.box(0, 1.0, -0.9, 1.4, 0.1, 1.1, green); gW.box(0, 1.15, -1.45, 1.4, 0.3, 0.12, green);
    // プレゼントの袋とプレゼント
    gW.sphere(0, 1.5, -1.95, 0.48, [0.55, 0.12, 0.1], 6); gG.box(0, 1.98, -1.95, 0.14, 0.12, 0.14, gold);
    [[0.45, 1.15, -1.95, [0.2, 0.5, 1]], [-0.48, 1.12, -1.9, [0.2, 0.8, 0.3]], [0.2, 1.2, -1.25, [1, 0.85, 0.2]]].forEach(([x, y, z, c]) => { gS.box(x, y, z, 0.28, 0.28, 0.28, c); gG.box(x, y, z, 0.3, 0.05, 0.05, white); gG.box(x, y, z, 0.05, 0.3, 0.05, white); });
    // トナカイ
    if (look.reindeer !== 'off') {
      const deer = (x, z, lead) => {
        gW.box(x, 1.0, z, 0.34, 0.4, 0.95, brown); gW.box(x, 1.3, z + 0.48, 0.2, 0.35, 0.22, brown); gW.box(x, 1.5, z + 0.66, 0.2, 0.2, 0.32, brown); gW.box(x, 1.02, z - 0.5, 0.12, 0.12, 0.08, white);
        for (const lx of [-0.12, 0.12]) for (const lz of [-0.35, 0.35]) gW.box(x + lx, 0.45, z + lz, 0.08, 0.75, 0.08, [0.3, 0.18, 0.09]);
        for (const s of [-1, 1]) { gW.box(x + s * 0.12, 1.72, z + 0.6, 0.04, 0.3, 0.04, wood); gW.box(x + s * 0.2, 1.86, z + 0.6, 0.18, 0.04, 0.04, wood); gW.box(x + s * 0.1, 1.8, z + 0.7, 0.04, 0.04, 0.14, wood); }
        if (lead) gN.sphere(x, 1.5, z + 0.84, 0.07, [1, 0.1, 0.1], 4); else gW.box(x, 1.5, z + 0.83, 0.07, 0.07, 0.04, [0.08, 0.05, 0.03]);
        gG.box(x, 1.12, z, 0.38, 0.06, 0.2, [0.85, 0.1, 0.1]);
      };
      deer(-0.42, 2.9, 0); deer(0.42, 2.9, 0); deer(-0.42, 4.5, 0); deer(0.42, 4.5, 0); deer(0, 6.1, 1);
      for (const x of [-0.42, 0.42]) gG.box(x, 1.05, 3.7, 0.03, 0.03, 4.4, [0.85, 0.1, 0.1]);
      gG.box(0, 1.05, 5.4, 0.84, 0.03, 0.03, gold);
    }
    for (let i = 0; i < gN.a.length; i += VSTRIDE) gN.a[i + 9] = 1;
    add(gS, Mat(Object.assign({ refl: 0.45, spec: 1.1, shin: 90 }, A))); add(gG, Mat(Object.assign({ refl: 0.85, spec: 2, shin: 160 }, A))); add(gW, Mat(Object.assign({ spec: 0.2, shin: 20 }, A))); add(gN, Mat(Object.assign({ spec: 0 }, A)));
  }
  if (car.body === 'bus') {
    body.parts.length = 0; body.children.length = 0;
    const c1 = hexToRgb(look.color || '#f2f2ee'), c2 = hexToRgb(look.color2 && look.color2 !== '#111114' ? look.color2 : '#1f8a4c'), dk = [0.04, 0.04, 0.05], glass = [0.06, 0.09, 0.12], chrome = [0.75, 0.76, 0.78];
    const gS = new GB(), gD = new GB(), gG = new GB(), gC = new GB(), gL = new GB(), gT = new GB(), gN = new GB();
    const hw = W / 2, zf = L / 2, zr = -L / 2, yb = 0.42, yt = H - 0.12;
    // 車体（角を少し丸めた箱）
    gS.box(0, (yb + yt) / 2, 0, W, yt - yb, L - 0.12, c1); gS.box(0, yt + 0.05, 0, W - 0.14, 0.1, L - 0.3, c1);
    gS.box(0, (yb + yt) / 2, zf - 0.06, W - 0.1, yt - yb, 0.12, c1); gS.box(0, (yb + yt) / 2, zr + 0.06, W - 0.1, yt - yb, 0.12, c1);
    // 帯（ツートン）
    for (const s2 of [-1, 1]) { gS.box(s2 * (hw + 0.004), 1.0, 0, 0.01, 0.38, L - 0.2, c2); gS.box(s2 * (hw + 0.004), 1.32, 0, 0.01, 0.05, L - 0.2, c2); }
    gS.box(0, 1.0, zf + 0.004, W - 0.12, 0.38, 0.01, c2); gS.box(0, 1.0, zr - 0.004, W - 0.12, 0.38, 0.01, c2);
    // 側面の窓（ピラー付き）
    const wy0 = 1.48, wy1 = yt - 0.32, wn = 7, wz0 = zr + 0.55, wz1 = zf - 1.35;
    for (const s2 of [-1, 1]) { for (let k = 0; k < wn; k++) { const a = lerp(wz0, wz1, k / wn) + 0.05, b = lerp(wz0, wz1, (k + 1) / wn) - 0.05; gG.box(s2 * (hw + 0.006), (wy0 + wy1) / 2, (a + b) / 2, 0.012, wy1 - wy0, b - a, glass); gD.box(s2 * (hw + 0.008), wy0 + 0.25, (a + b) / 2, 0.01, 0.015, b - a, dk); }
      gD.box(s2 * (hw + 0.009), wy0 - 0.03, (wz0 + wz1) / 2, 0.012, 0.04, wz1 - wz0 + 0.1, dk); gD.box(s2 * (hw + 0.009), wy1 + 0.03, (wz0 + wz1) / 2, 0.012, 0.04, wz1 - wz0 + 0.1, dk); }
    // ドア（右側：前扉と中扉、ガラス入り）
    for (const [zc, wd] of [[zf - 0.75, 0.95], [-0.2, 1.0]]) { const x = -(hw + 0.008); gD.box(x, (yb + 0.1 + wy1) / 2, zc, 0.012, wy1 - yb - 0.05, wd + 0.06, dk); for (const o of [-1, 1]) gG.box(x - 0.002, (yb + 0.35 + wy1) / 2, zc + o * wd / 4, 0.012, wy1 - yb - 0.45, wd / 2 - 0.06, glass); gC.box(x - 0.01, 1.2, zc, 0.012, 0.6, 0.025, chrome); }
    // 運転席側の小窓
    gG.box(hw + 0.006, (wy0 + wy1) / 2, zf - 0.75, 0.012, wy1 - wy0, 0.8, glass);
    // フロント：大きな窓・行先表示・ライト・バンパー
    gG.box(0, (1.25 + yt - 0.38) / 2, zf + 0.006, W - 0.22, yt - 0.38 - 1.25, 0.012, glass); gD.box(0, (1.25 + yt - 0.38) / 2, zf + 0.008, 0.04, yt - 0.38 - 1.25, 0.01, dk);
    gD.box(0, yt - 0.2, zf + 0.008, W - 0.5, 0.24, 0.012, dk); gN.box(0, yt - 0.2, zf + 0.012, W - 0.7, 0.14, 0.01, [1, 0.55, 0.1]);
    for (const s2 of [-1, 1]) { gD.box(s2 * (hw - 0.3), 0.72, zf + 0.008, 0.42, 0.2, 0.012, dk); for (const o of [-0.1, 0.1]) gL.box(s2 * (hw - 0.3) + o, 0.72, zf + 0.016, 0.15, 0.15, 0.012, [1, 1, 1]); gT.box(s2 * (hw - 0.12), 0.95, zf + 0.012, 0.1, 0.06, 0.01, [1, 0.6, 0.1]); }
    gD.box(0, 0.47, zf + 0.06, W + 0.02, 0.2, 0.1, dk); gC.box(0, 0.72, zf + 0.01, 0.7, 0.12, 0.01, chrome);
    // ミラー（ステーで前に張り出す）
    for (const s2 of [-1, 1]) { gD.box(s2 * (hw + 0.15), yt - 0.3, zf + 0.25, 0.03, 0.03, 0.5, dk); gD.box(s2 * (hw + 0.18), yt - 0.55, zf + 0.48, 0.05, 0.42, 0.18, dk); gG.box(s2 * (hw + 0.18), yt - 0.55, zf + 0.385, 0.04, 0.36, 0.01, [0.5, 0.6, 0.7]); }
    // リア：窓・テールランプ・エンジングリル・ナンバー
    gG.box(0, (wy0 + wy1) / 2 + 0.1, zr - 0.006, W - 0.5, wy1 - wy0 - 0.15, 0.012, glass); gD.box(0, 0.75, zr - 0.008, W - 0.6, 0.35, 0.012, dk);
    for (let k = 0; k < 6; k++) gS.box(0, 0.62 + k * 0.06, zr - 0.012, W - 0.7, 0.02, 0.01, [0.3, 0.3, 0.32]);
    for (const s2 of [-1, 1]) { gT.box(s2 * (hw - 0.14), 0.85, zr - 0.01, 0.16, 0.36, 0.012, [1, 0.06, 0.05]); gL.box(s2 * (hw - 0.14), 0.6, zr - 0.012, 0.12, 0.08, 0.01, [1, 1, 1]); }
    gD.box(0, 0.47, zr - 0.06, W + 0.02, 0.2, 0.1, dk);
    // ホイールアーチと下回り
    for (const zz of [zF, zR]) for (const s2 of [-1, 1]) gD.box(s2 * (hw + 0.002), 0.62, zz, 0.012, 0.42, 1.25, dk);
    gD.box(0, 0.33, 0, W - 0.3, 0.2, L - 1.2, dk);
    // 屋根のエアコンユニット
    gS.box(0, yt + 0.2, -0.6, W * 0.6, 0.2, 2.2, [0.85, 0.85, 0.84]); for (let k = 0; k < 4; k++) gD.box(0, yt + 0.31, -1.4 + k * 0.5, W * 0.5, 0.012, 0.25, dk);
    // 停留所ボタン風の車内灯（夜に光る）
    for (const s2 of [-1, 1]) for (let k = 0; k < wn; k++) gN.box(s2 * (hw - 0.05), wy1 - 0.05, lerp(wz0, wz1, (k + 0.5) / wn), 0.02, 0.02, 0.5, [1, 0.95, 0.8]);
    for (let i = 0; i < gN.a.length; i += VSTRIDE) gN.a[i + 9] = 1;
    add(gS, Mat(Object.assign({ refl: 0.35, spec: 1.0, shin: 70 }, A))); add(gD, Mat(Object.assign({ spec: 0.15 }, A))); add(gG, Mat(Object.assign({ refl: 0.7, spec: 2, shin: 160 }, A)));
    add(gC, Mat(Object.assign({ refl: 0.85, spec: 2, shin: 160 }, A))); add(gN, Mat(Object.assign({ spec: 0 }, A))); add(gL, headMat); add(gT, brakeMat);
  }

  if (car.body === 'van') { // オリジナルのワンボックス（キャブオーバー）
    body.parts.length = 0; body.children.length = 0;
    const c1 = hexToRgb(look.color || '#f4f4f2'), dk = [0.04, 0.04, 0.05], glass = [0.06, 0.09, 0.12], chrome = [0.75, 0.76, 0.78], tr2 = [0.18, 0.18, 0.2];
    const gS = new GB(), gD = new GB(), gG = new GB(), gC = new GB(), gL = new GB(), gT = new GB();
    const hw = W / 2, zf = L / 2, zr = -L / 2, yb = 0.6, yt = H - 0.03, yn = 1.02, zw = zf - 0.78;
    gS.box(0, (yb + yt) / 2, (zr + zw) / 2, W, yt - yb, zw - zr, c1); // 荷室〜キャビン
    gS.box(0, (yb + yn) / 2, (zw + zf) / 2 - 0.03, W - 0.02, yn - yb, zf - zw - 0.06, c1); // 短いノーズ
    gS.box(0, yn + 0.02, zf - 0.2, W - 0.12, 0.05, 0.3, c1);
    for (const s2 of [-1, 1]) { const x = s2 * hw; gS.tri([x, yn, zw], [x, yn, zf - 0.08], [x, yt, zw], c1); }
    // フロントガラス（傾斜）とピラー
    gG.quad([-hw + 0.07, yn + 0.04, zf - 0.1], [hw - 0.07, yn + 0.04, zf - 0.1], [hw - 0.09, yt - 0.06, zw + 0.02], [-hw + 0.09, yt - 0.06, zw + 0.02], glass);
    for (const s2 of [-1, 1]) gD.quad([s2 * (hw - 0.01), yn + 0.03, zf - 0.09], [s2 * (hw - 0.08), yn + 0.03, zf - 0.11], [s2 * (hw - 0.09), yt - 0.05, zw + 0.01], [s2 * (hw - 0.01), yt - 0.05, zw], dk);
    // 側面ガラス（運転席・スライドドア・後席）
    const wy0 = 1.12, wy1 = yt - 0.14;
    for (const s2 of [-1, 1]) { const x = s2 * (hw + 0.006);
      gG.box(x, (wy0 + wy1) / 2, zw - 0.33, 0.012, wy1 - wy0, 0.62, glass);
      for (const [a, b] of [[zw - 0.78, zw - 1.75], [zw - 1.85, zw - 2.75], [zw - 2.85, zr + 0.22]]) gG.box(x, (wy0 + wy1) / 2, (a + b) / 2, 0.012, wy1 - wy0, Math.abs(a - b), glass);
      gD.box(x + s2 * 0.002, (yb + wy1) / 2, zw - 0.72, 0.01, wy1 - yb, 0.02, dk); gD.box(x + s2 * 0.002, (yb + wy1) / 2, zw - 1.8, 0.01, wy1 - yb, 0.02, dk);
      gD.box(x + s2 * 0.003, wy0 - 0.02, (zr + zw) / 2, 0.01, 0.03, zw - zr, dk);
      gC.box(x + s2 * 0.01, 0.95, zw - 0.6, 0.02, 0.03, 0.18, chrome); gC.box(x + s2 * 0.01, 0.95, zw - 1.95, 0.02, 0.03, 0.18, chrome);
      gS.box(x + s2 * 0.004, 0.62, (zr + zf) / 2, 0.01, 0.06, L - 0.3, tr2); // サイドモール
      // ミラー
      gD.box(s2 * (hw + 0.1), 1.25, zw - 0.05, 0.16, 0.24, 0.1, dk); gG.box(s2 * (hw + 0.1), 1.25, zw - 0.105, 0.13, 0.2, 0.01, [0.5, 0.6, 0.7]); }
    // フロント：グリル・ヘッドライト・バンパー・エンブレム
    gD.box(0, 0.8, zf + 0.005, W - 0.9, 0.22, 0.012, dk); for (let k = 0; k < 3; k++) gC.box(0, 0.73 + k * 0.07, zf + 0.012, W - 0.95, 0.012, 0.01, chrome);
    gC.box(0, 0.8, zf + 0.016, 0.14, 0.1, 0.01, chrome);
    for (const s2 of [-1, 1]) { gD.box(s2 * (hw - 0.27), 0.82, zf + 0.006, 0.42, 0.2, 0.012, dk); gL.box(s2 * (hw - 0.25), 0.82, zf + 0.012, 0.34, 0.14, 0.012, [1, 1, 1]); gT.box(s2 * (hw - 0.07), 0.82, zf + 0.012, 0.08, 0.14, 0.01, [1, 0.6, 0.1]); }
    gS.box(0, 0.5, zf + 0.04, W + 0.02, 0.24, 0.12, tr2); gD.box(0, 0.42, zf + 0.09, W - 0.4, 0.06, 0.04, dk);
    // リア：大きなバックドア窓・縦長テール・バンパー
    gG.box(0, (wy0 + 0.04 + wy1) / 2, zr - 0.006, W - 0.3, wy1 - wy0 - 0.04, 0.012, glass); gD.box(0, (yb + yt) / 2, zr - 0.004, 0.012, 0.01, 0.01, dk);
    for (const s2 of [-1, 1]) { gT.box(s2 * (hw - 0.06), 0.88, zr - 0.01, 0.1, 0.5, 0.012, [1, 0.06, 0.05]); gL.box(s2 * (hw - 0.06), 0.58, zr - 0.012, 0.08, 0.08, 0.01, [1, 1, 1]); }
    gC.box(0, 0.98, zr - 0.012, 0.5, 0.04, 0.01, chrome); gS.box(0, 0.45, zr - 0.05, W + 0.02, 0.22, 0.1, tr2);
    // ルーフレール・ホイールアーチ・下回り
    for (const s2 of [-1, 1]) { gC.box(s2 * (hw - 0.12), yt + 0.05, (zr + zw) / 2, 0.04, 0.04, zw - zr - 0.3, chrome); for (const zz of [zr + 0.3, zw - 0.3]) gD.box(s2 * (hw - 0.12), yt + 0.025, zz, 0.06, 0.05, 0.06, dk); }
    for (const zz of [zF, zR]) for (const s2 of [-1, 1]) gD.box(s2 * (hw + 0.002), 0.74, zz, 0.012, 0.28, 0.92, dk);
    gD.box(0, 0.42, 0, W - 0.5, 0.3, L - 1.6, dk); for (const zz of [(zF + zR) / 2]) for (const s2 of [-1, 1]) gS.box(s2 * (hw - 0.02), 0.48, zz, 0.04, 0.26, zF - zR - 1.0, c1);
    add(gS, Mat(Object.assign({ refl: 0.35, spec: 1.0, shin: 70 }, A))); add(gD, Mat(Object.assign({ spec: 0.15 }, A))); add(gG, Mat(Object.assign({ refl: 0.7, spec: 2, shin: 160 }, A)));
    add(gC, Mat(Object.assign({ refl: 0.85, spec: 2, shin: 160 }, A))); add(gL, headMat); add(gT, brakeMat);
  }
  const model = {
    node, body, wheels, popups, steerWheel: sw, cockpit, needles, glassMat, glassAlpha, headMat, brakeMat, meshes, livTex, plateTex, shadow,
    dims: { L, W, H, tireR, zF, zR, hood: Yhood, ws: Z(T.ws), deck: Yh(T.deck), nose: Yh(T.nose), clr }, glow: glowCol,
    lightsOn: false, popT: 0, wheelSpin: 0,
    setBrake(v) { this.brakeMat.emis = v ? 1.6 : (this.lightsOn ? 0.7 : 0.25); },
    hlCol: hlTint, hlRainbow: hlc[0] === 'rainbow', setLights(on) { this.lightsOn = on; this.headMat.emis = on ? 2.2 : 0.15; },
    update(dt, st) { if (this.hlRainbow) { const h = (performance.now() / 1500) % 1, q = k => 0.55 + 0.45 * Math.cos(TAU * (h + k)); this.headMat.tint = [q(0), q(0.33), q(0.66)]; this.hlCol = this.headMat.tint; } // st: {speed, steer, pitch, roll, yaw..}
      this.popT = damp(this.popT, this.lightsOn ? 1 : 0, 6, dt);
      for (const p of this.popups) p.rot = [0, -this.popT * 1.1, 0];
      this.wheelSpin += (st.wheelSpeed || 0) / tireR * dt;
      for (const w of this.wheels) { w.hub.rot = [w.front ? -(st.delta || 0) : 0, 0, 0]; w.spin.rot = [w.side > 0 ? 0 : PI, (w.side > 0 ? 1 : -1) * this.wheelSpin, 0]; if (opts.camber) w.hub.rot[2] = (w.side > 0 ? 1 : -1) * opts.camber * DEG; }
      this.steerWheel.rot = [0, 0.38, -(st.steer || 0) * 2.4];
      if (this.needles.tach) { const rl = st.redline || 8000; this._tachA = damp(this._tachA || 0, clamp((st.rpm || 0) / (rl * 1.125), 0, 1), 14, dt); this._spdA = damp(this._spdA || 0, clamp((st.kmh || 0) / 320, 0, 1), 10, dt); this.needles.tach.rot = [0, 0, (135 - this._tachA * 270) * DEG]; this.needles.spd.rot = [0, 0, (135 - this._spdA * 270) * DEG]; }
      this.body.rot = [0, st.pitch || 0, st.roll || 0];
      this.body.pos = [0, (opts.height || 0) / 1000, 0];
    },
    dispose() { for (const m of this.meshes) m.dispose(); R.gl.deleteTexture(livTex); R.gl.deleteTexture(plateTex); if (decalTex) R.gl.deleteTexture(decalTex); }
  };
  model.setLights(false); model.setBrake(false);
  return model;
}
