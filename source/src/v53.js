// =====================================================================
// v53.js — v3.94：ナンバープレートのデザイン・ゴール演出・ガレージの飾り付け・クラクション（それぞれ専用パック）
// =====================================================================
const RCOL = r => (RARITY[r] || RARITY.C).color;
const mkItem = (o) => { addItem(o); ITEM_BY_ID[o.id] = o; return o; };

// ---------------- ナンバープレートのデザイン ----------------
const PLATES = [
  ['classic', 'クラシックグリーン', 'Classic Green', 'C', { bg: '#f4f4ee', bd: '#2a7a3a', fg: '#2a7a3a' }],
  ['yellow', 'イエロー', 'Yellow', 'C', { bg: '#ffd21a', bd: '#111', fg: '#111' }],
  ['black', 'ブラック', 'Black', 'C', { bg: '#141416', bd: '#e8e8e8', fg: '#f4f4f4' }],
  ['blue', 'ブルー', 'Blue', 'C', { bg: '#1e5aff', bd: '#fff', fg: '#fff' }],
  ['stripe', 'レーシングストライプ', 'Racing Stripe', 'U', { bg: '#fff', bd: '#e10600', fg: '#111', pat: 'stripe', pc: '#e10600' }],
  ['check', 'チェッカー', 'Checkered', 'U', { bg: '#fff', bd: '#111', fg: '#e10600', pat: 'check', pc: '#111' }],
  ['dots', 'ポップドット', 'Pop Dots', 'U', { bg: '#ffe0ec', bd: '#ff4a8a', fg: '#c8105a', pat: 'dots', pc: '#ff9ac0' }],
  ['carbon', 'カーボン', 'Carbon', 'U', { bg: '#1a1a1c', bd: '#555', fg: '#ffcf3d', pat: 'carbon', pc: '#2a2a2e' }],
  ['sunset', 'サンセット', 'Sunset', 'R', { bg: ['#ff5a3a', '#ffcf3d'], bd: '#fff', fg: '#fff', pat: 'grad' }],
  ['ocean', 'オーシャン', 'Ocean', 'R', { bg: ['#0a3aaa', '#2adcd0'], bd: '#fff', fg: '#fff', pat: 'grad' }],
  ['sakura', 'さくら', 'Sakura', 'R', { bg: '#fff0f5', bd: '#ff7aa0', fg: '#c8306a', pat: 'sakura', pc: '#ffb0c8' }],
  ['flame', 'フレイム', 'Flame', 'R', { bg: '#141416', bd: '#ff6a00', fg: '#fff', pat: 'flame', pc: '#ff6a00' }],
  ['camo', 'カモフラ', 'Camo', 'R', { bg: '#5a6a3a', bd: '#2a3018', fg: '#f4f0d8', pat: 'camo', pc: ['#3a4a22', '#7a8a52', '#2a3018'] }],
  ['zebra', 'ゼブラ', 'Zebra', 'R', { bg: '#fff', bd: '#111', fg: '#e10600', pat: 'zebra', pc: '#111' }],
  ['neon', 'ネオンナイト', 'Neon Night', 'E', { bg: '#0a0018', bd: '#ff2bd6', fg: '#00e5ff', pat: 'neon', pc: '#ff2bd6' }],
  ['gold', 'ゴールドプレート', 'Gold Plate', 'E', { bg: ['#fff2b0', '#d4a020'], bd: '#8a6000', fg: '#5a3a00', pat: 'grad' }],
  ['wave', '波しぶき', 'Wave', 'E', { bg: '#e8f6ff', bd: '#1e5aff', fg: '#0a3aaa', pat: 'wave', pc: '#5ab0ff' }],
  ['candy', 'キャンディ', 'Candy', 'E', { bg: '#fff', bd: '#ff4a8a', fg: '#ff2a6a', pat: 'candy', pc: '#ff9ac0' }],
  ['galaxy', 'ギャラクシー', 'Galaxy', 'L', { bg: ['#1a0040', '#0a0a2a'], bd: '#b07aff', fg: '#fff', pat: 'galaxy' }],
  ['rainbow', 'レインボー', 'Rainbow', 'L', { bg: '#fff', bd: '#111', fg: '#111', pat: 'rainbow' }],
  ['dragon', '龍のうろこ', 'Dragon Scale', 'L', { bg: '#0a3a1a', bd: '#ffcf3d', fg: '#ffcf3d', pat: 'scale', pc: '#1a6a3a' }],
  ['circuit', 'サイバー回路', 'Cyber Circuit', 'E', { bg: '#001a14', bd: '#2adc9a', fg: '#2adc9a', pat: 'circuit', pc: '#0a6a4a' }],
  ['xmas', 'クリスマス', 'Christmas', 'R', { bg: '#fff', bd: '#c8102e', fg: '#0a6a2a', pat: 'xmas', pc: '#c8102e' }],
  ['wood', 'ウッド', 'Wood', 'U', { bg: '#a86a3a', bd: '#5a3010', fg: '#fff4dc', pat: 'wood', pc: '#8a5020' }]
];
const PLATE_BY = {}; for (const [id, nm, en, r, st] of PLATES) { PLATE_BY[id] = Object.assign({ id, nm }, st); mkItem({ id: 'npd_' + id, type: 'platedesign', plateD: id, name: 'ナンバーデザイン「' + nm + '」', en: 'Plate Design "' + en + '"', rarity: r, lim: 1, desc: '車のナンバープレートの見た目（「飾り・小物」から装着）' }); }
function paintPlate(g, P, text, W = 128, H = 64) {
  if (Array.isArray(P.bg)) { const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, P.bg[0]); gr.addColorStop(1, P.bg[1]); g.fillStyle = gr; } else g.fillStyle = P.bg; g.fillRect(0, 0, W, H);
  const pc = P.pc; g.save();
  if (P.pat === 'stripe') { g.fillStyle = pc; g.fillRect(0, 22, W, 6); g.fillRect(0, 34, W, 3); }
  else if (P.pat === 'check') { g.fillStyle = pc; for (let x = 0; x < W; x += 8) for (let y = 0; y < 10; y += 5) if (((x / 8) + (y / 5)) % 2 === 0) { g.fillRect(x, y + 4, 8, 5); g.fillRect(x, H - 14 + y, 8, 5); } }
  else if (P.pat === 'dots') { g.fillStyle = pc; for (let x = 6; x < W; x += 14) for (let y = 6; y < H; y += 14) { g.beginPath(); g.arc(x + ((y / 14) % 2) * 7, y, 3, 0, 7); g.fill(); } }
  else if (P.pat === 'carbon') { g.fillStyle = pc; for (let x = 0; x < W; x += 6) for (let y = 0; y < H; y += 6) if ((x + y) / 6 % 2 === 0) g.fillRect(x, y, 6, 6); }
  else if (P.pat === 'sakura') { g.fillStyle = pc; for (const [x, y] of [[14, 14], [112, 50], [104, 12], [20, 52], [64, 8]]) for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283; g.beginPath(); g.ellipse(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3, 2, a, 0, 7); g.fill(); } }
  else if (P.pat === 'flame') { g.fillStyle = pc; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 12) { g.quadraticCurveTo(x + 3, H - 30 - (x % 24), x + 6, H - 10); g.quadraticCurveTo(x + 9, H - 22, x + 12, H); } g.fill(); g.fillStyle = '#ffcf3d'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 12) { g.quadraticCurveTo(x + 4, H - 16, x + 6, H - 4); g.quadraticCurveTo(x + 8, H - 12, x + 12, H); } g.fill(); }
  else if (P.pat === 'camo') { for (let k = 0; k < 18; k++) { g.fillStyle = pc[k % 3]; g.beginPath(); g.ellipse((k * 37) % W, (k * 23) % H, 10 + k % 4 * 3, 6 + k % 3 * 2, k, 0, 7); g.fill(); } }
  else if (P.pat === 'zebra') { g.fillStyle = pc; for (let x = -20; x < W; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 8, 0); g.lineTo(x + 22, H); g.lineTo(x + 14, H); g.fill(); } }
  else if (P.pat === 'neon') { g.shadowColor = pc; g.shadowBlur = 8; }
  else if (P.pat === 'wave') { g.strokeStyle = pc; g.lineWidth = 3; for (let y = 12; y < H; y += 14) { g.beginPath(); for (let x = 0; x <= W; x += 4) g.lineTo(x, y + Math.sin(x / 8) * 3); g.stroke(); } }
  else if (P.pat === 'candy') { g.fillStyle = pc; for (let x = -H; x < W; x += 14) { g.beginPath(); g.moveTo(x, H); g.lineTo(x + 7, H); g.lineTo(x + 7 + H, 0); g.lineTo(x + H, 0); g.fill(); } }
  else if (P.pat === 'galaxy') { for (let k = 0; k < 40; k++) { g.fillStyle = k % 5 ? '#fff' : '#ff9ad8'; g.fillRect((k * 53) % W, (k * 29) % H, k % 7 ? 1 : 2, k % 7 ? 1 : 2); } }
  else if (P.pat === 'rainbow') { const C = ['#ff3a3a', '#ff9a1a', '#ffe01a', '#3adc5a', '#2a9aff', '#9a5aff']; C.forEach((c, k) => { g.fillStyle = c; g.globalAlpha = 0.55; g.fillRect(0, k * H / 6, W, H / 6 + 1); }); g.globalAlpha = 1; }
  else if (P.pat === 'scale') { g.strokeStyle = pc; g.lineWidth = 2; for (let y = 0; y < H + 8; y += 8) for (let x = 0; x < W + 8; x += 12) { g.beginPath(); g.arc(x + ((y / 8) % 2) * 6, y, 6, 0, 3.14); g.stroke(); } }
  else if (P.pat === 'circuit') { g.strokeStyle = pc; g.lineWidth = 2; for (let k = 0; k < 10; k++) { const y = 6 + (k * 17) % (H - 10), x = (k * 41) % W; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 18, y); g.lineTo(x + 26, y + 8); g.stroke(); g.fillStyle = pc; g.fillRect(x + 25, y + 7, 3, 3); } }
  else if (P.pat === 'xmas') { g.fillStyle = pc; for (let x = 0; x < W; x += 10) { g.fillRect(x, 4, 5, 5); g.fillRect(x + 5, H - 9, 5, 5); } g.fillStyle = '#0a6a2a'; for (let x = 5; x < W; x += 10) { g.fillRect(x, 4, 5, 5); g.fillRect(x - 5, H - 9, 5, 5); } }
  else if (P.pat === 'wood') { g.strokeStyle = pc; g.lineWidth = 1.5; for (let y = 4; y < H; y += 7) { g.beginPath(); for (let x = 0; x <= W; x += 6) g.lineTo(x, y + Math.sin(x / 15 + y) * 1.5); g.stroke(); } }
  g.restore(); g.strokeStyle = P.bd; g.lineWidth = 4; g.strokeRect(3, 3, W - 6, H - 6);
  g.save(); if (P.pat === 'neon') { g.shadowColor = P.fg; g.shadowBlur = 10; } else if (['grad', 'galaxy', 'flame', 'camo', 'rainbow', 'scale'].includes(P.pat)) { g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 3; }
  g.fillStyle = P.fg; g.textAlign = 'center'; g.textBaseline = 'middle'; const t = String(text || '').slice(0, 12), parts = t.split(' ');
  if (parts.length > 1) { g.font = 'bold 16px sans-serif'; g.fillText(parts[0], W / 2, 18); g.font = 'bold 26px sans-serif'; g.fillText(parts.slice(1).join(' '), W / 2, 44); } else { g.font = 'bold 26px sans-serif'; g.fillText(t, W / 2, 34); }
  g.restore(); }
let PLATE_CUR = null;
{ const _dp = drawPlate; drawPlate = function (text) { const P = PLATE_CUR && PLATE_BY[PLATE_CUR]; if (!P) return _dp(text); const c = document.createElement('canvas'); c.width = 128; c.height = 64; paintPlate(c.getContext('2d'), P, text); return c; }; }
{ const _bm = buildCarModel; buildCarModel = function (R, car, look) { PLATE_CUR = look && look.plateDesign; try { return _bm.apply(this, arguments); } finally { PLATE_CUR = null; } }; }
const plateImg = (() => { const cache = {}; return (id, text = '峠 86-86') => { const k = id + text; if (!cache[k]) { const c = document.createElement('canvas'); c.width = 128; c.height = 64; paintPlate(c.getContext('2d'), PLATE_BY[id], text); cache[k] = c.toDataURL(); } return cache[k]; }; })();

// ---------------- ゴール演出 ----------------
const GOALS = [
  ['confetti', '紙吹雪', 'Confetti', 'C', { k: 'fall', sh: 'rect', cols: ['#ff3a5a', '#ffd21a', '#3ac8ff', '#4ae07a', '#b07aff'] }],
  ['stars', 'スターシャワー', 'Star Shower', 'C', { k: 'fall', sh: 'star', cols: ['#ffd21a', '#fff38a', '#fff'] }],
  ['hearts', 'ハートの雨', 'Heart Rain', 'U', { k: 'fall', sh: 'heart', cols: ['#ff4a8a', '#ff9ac0', '#ff2a5a'] }],
  ['fireworks', '打ち上げ花火', 'Fireworks', 'U', { k: 'burst', cols: ['#ff3a5a', '#ffd21a', '#3ac8ff', '#4ae07a', '#ff9a1a'] }],
  ['sakura', '桜ふぶき', 'Sakura Storm', 'U', { k: 'drift', sh: 'petal', cols: ['#ffb0c8', '#ffd0e0', '#ff8ab0'] }],
  ['snow', 'ゆきふり', 'Snowfall', 'C', { k: 'drift', sh: 'circle', cols: ['#fff', '#e0f0ff'] }],
  ['coins', 'コインシャワー', 'Coin Shower', 'R', { k: 'fountain', sh: 'coin', cols: ['#ffcf3d', '#ffe58a'] }],
  ['candy', 'お菓子の雨', 'Candy Rain', 'R', { k: 'fall', sh: 'candy', cols: ['#ff4a8a', '#ffd21a', '#3ac8ff', '#7ae8c8'] }],
  ['notes', '音符のパレード', 'Music Notes', 'U', { k: 'rise', sh: 'note', cols: ['#ffcf3d', '#5ad1ff', '#ff7ad8'] }],
  ['bubbles', 'シャボン玉', 'Bubbles', 'C', { k: 'rise', sh: 'bubble', cols: ['#9ad8ff', '#d0b0ff', '#b0ffe0'] }],
  ['leaves', '紅葉', 'Autumn Leaves', 'U', { k: 'drift', sh: 'leaf', cols: ['#ff6a1a', '#e03a10', '#ffb01a'] }],
  ['champagne', 'シャンパンファイト', 'Champagne Spray', 'R', { k: 'fountain', sh: 'circle', cols: ['#fff8d0', '#ffe58a', '#fff'] }],
  ['lightning', 'イナズマ', 'Lightning', 'E', { k: 'bolt', cols: ['#9ad8ff', '#fff'], text: 'THUNDER!' }],
  ['rays', 'ゴールドレイ', 'Gold Rays', 'E', { k: 'rays', cols: ['#ffcf3d'], text: 'WINNER!' }],
  ['neonrays', 'ネオンレイ', 'Neon Rays', 'E', { k: 'rays', cols: ['#ff2bd6', '#00e5ff'], text: 'NICE RUN!' }],
  ['gg', 'GGバナー', 'GG Banner', 'R', { k: 'fall', sh: 'rect', cols: ['#ffcf3d', '#fff'], text: 'GG!' }],
  ['ring', 'ショックウェーブ', 'Shockwave', 'E', { k: 'ring', cols: ['#5ad1ff', '#fff'], text: 'FINISH!' }],
  ['dragon', '昇り龍', 'Rising Dragon', 'L', { k: 'dragon', cols: ['#2adc7a', '#ffcf3d'], text: '天下無双' }],
  ['galaxy', 'ギャラクシー', 'Galaxy', 'L', { k: 'burst', cols: ['#b07aff', '#5ad1ff', '#fff', '#ff7ad8'], stars: 1, text: 'LEGEND' }],
  ['rainbow', 'レインボーアーチ', 'Rainbow Arch', 'L', { k: 'rainbow', cols: [], text: 'PERFECT!' }],
  ['flames', 'バーニングフレイム', 'Burning Flames', 'E', { k: 'flame', cols: ['#ff3a00', '#ff9a1a', '#ffd21a'], text: 'ON FIRE!' }],
  ['drift', 'ドリフトキング', 'Drift King', 'R', { k: 'fall', sh: 'star', cols: ['#ffcf3d', '#ff3a5a'], text: 'DRIFT KING' }]
];
const GOAL_BY = {}; for (const [id, nm, en, r, st] of GOALS) { GOAL_BY[id] = Object.assign({ id, nm }, st); mkItem({ id: 'gfx_' + id, type: 'goalfx', goalfx: id, name: 'ゴール演出「' + nm + '」', en: 'Finish Effect "' + en + '"', rarity: r, lim: 1, desc: 'ゴールしたときに画面に出る演出（「飾り・小物」から装着）' }); }
const GFX = {
  play(id) { const G = GOAL_BY[id]; if (!G) return; this.stop(); const cv = document.createElement('canvas'); cv.id = 'goalFx'; document.body.appendChild(cv); const W = cv.width = innerWidth * Math.min(2, devicePixelRatio || 1), H = cv.height = innerHeight * Math.min(2, devicePixelRatio || 1), g = cv.getContext('2d'), S = W / innerWidth;
    const P = [], rnd = (a, b) => a + Math.random() * (b - a), col = () => G.cols[(Math.random() * G.cols.length) | 0], T0 = performance.now(), DUR = 4200; this.el = cv;
    const add = o => P.push(Object.assign({ rot: rnd(0, 6.28), vr: rnd(-4, 4), s: rnd(6, 13) * S, c: col(), life: 0, max: 99 }, o));
    if (['fall', 'drift'].includes(G.k)) for (let i = 0; i < 140; i++) add({ x: rnd(0, W), y: rnd(-H, 0), vx: rnd(-40, 40) * S, vy: rnd(G.k === 'drift' ? 50 : 150, G.k === 'drift' ? 120 : 320) * S });
    if (G.k === 'rise') for (let i = 0; i < 70; i++) add({ x: rnd(0, W), y: rnd(H, H * 1.6), vx: rnd(-20, 20) * S, vy: -rnd(80, 180) * S, s: rnd(10, 22) * S });
    let nextBurst = 0, fountainT = 0;
    const shape = (p) => { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.c; g.strokeStyle = p.c; const s = p.s;
      switch (p.sh || G.sh) {
        case 'rect': g.fillRect(-s / 2, -s / 4, s, s / 2); break;
        case 'circle': g.beginPath(); g.arc(0, 0, s / 2.5, 0, 7); g.fill(); break;
        case 'star': g.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? s * 0.25 : s * 0.6, a = k / 10 * 6.283; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); break;
        case 'heart': g.beginPath(); g.moveTo(0, s * 0.35); g.bezierCurveTo(-s * 0.7, -s * 0.2, -s * 0.3, -s * 0.7, 0, -s * 0.25); g.bezierCurveTo(s * 0.3, -s * 0.7, s * 0.7, -s * 0.2, 0, s * 0.35); g.fill(); break;
        case 'petal': case 'leaf': g.beginPath(); g.ellipse(0, 0, s * 0.5, s * 0.25, 0, 0, 7); g.fill(); break;
        case 'coin': g.beginPath(); g.ellipse(0, 0, s * 0.55 * Math.abs(Math.cos(p.rot * 2)) + 1, s * 0.55, 0, 0, 7); g.fill(); g.strokeStyle = '#c88a00'; g.lineWidth = 1.5 * S; g.stroke(); break;
        case 'candy': g.beginPath(); g.arc(0, 0, s * 0.4, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(-s * 0.06, -s * 0.4, s * 0.12, s * 0.8); g.fillStyle = p.c; g.beginPath(); g.moveTo(-s * 0.4, 0); g.lineTo(-s * 0.8, -s * 0.25); g.lineTo(-s * 0.8, s * 0.25); g.fill(); g.beginPath(); g.moveTo(s * 0.4, 0); g.lineTo(s * 0.8, -s * 0.25); g.lineTo(s * 0.8, s * 0.25); g.fill(); break;
        case 'note': g.rotate(-p.rot); g.beginPath(); g.ellipse(0, s * 0.3, s * 0.3, s * 0.22, -0.4, 0, 7); g.fill(); g.fillRect(s * 0.22, -s * 0.6, s * 0.1, s * 0.9); g.fillRect(s * 0.22, -s * 0.6, s * 0.35, s * 0.12); break;
        case 'bubble': g.rotate(-p.rot); g.globalAlpha = 0.6; g.lineWidth = 2 * S; g.beginPath(); g.arc(0, 0, s * 0.5, 0, 7); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(-s * 0.18, -s * 0.18, s * 0.1, 0, 7); g.fill(); break;
        case 'spark': g.globalCompositeOperation = 'lighter'; g.beginPath(); g.arc(0, 0, s * 0.3, 0, 7); g.fill(); break;
      } g.restore(); };
    const banner = (t, el) => { if (!G.text) return; const a = Math.min(1, t * 3) * (t > 3.4 ? Math.max(0, (4 - t) / 0.6) : 1), sc = 0.6 + Math.min(1, t * 4) * 0.4 + Math.sin(t * 6) * 0.02; g.save(); g.globalAlpha = a; g.translate(W / 2, H * 0.32); g.scale(sc, sc); g.font = `900 italic ${Math.round(Math.min(W, H * 1.6) * 0.1)}px Orbitron, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 8 * S; g.strokeStyle = 'rgba(0,0,0,.7)'; g.strokeText(G.text, 0, 0); const gr = g.createLinearGradient(0, -40 * S, 0, 40 * S); gr.addColorStop(0, '#fff'); gr.addColorStop(1, G.cols[0] || '#ffcf3d'); g.fillStyle = gr; g.fillText(G.text, 0, 0); g.restore(); };
    let last = T0; const step = now => { if (this.el !== cv) return; const t = (now - T0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now; g.clearRect(0, 0, W, H);
      if (G.k === 'burst' && t < 3.2 && t > nextBurst) { nextBurst = t + rnd(0.25, 0.5); const cx = rnd(W * 0.15, W * 0.85), cy = rnd(H * 0.12, H * 0.5), c = col(); for (let i = 0; i < 46; i++) { const a = i / 46 * 6.283, sp = rnd(160, 300) * S; add({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, c, sh: G.stars && i % 3 === 0 ? 'star' : 'spark', s: rnd(5, 9) * S, grav: 140 * S, drag: 1.6, max: rnd(1, 1.6) }); } }
      if (G.k === 'fountain' && t < 3 && t > fountainT) { fountainT = t + 0.03; for (const sx of [0.05, 0.95]) for (let i = 0; i < 3; i++) add({ x: W * sx, y: H, vx: (sx < 0.5 ? 1 : -1) * rnd(120, 360) * S, vy: -rnd(500, 820) * S, grav: 600 * S, max: 3 }); }
      if (G.k === 'flame' && t < 3.3) for (let i = 0; i < 6; i++) add({ x: rnd(0, W), y: H + 10, vx: rnd(-20, 20) * S, vy: -rnd(200, 420) * S, sh: 'spark', s: rnd(14, 30) * S, max: rnd(0.6, 1.2), fade: 1 });
      if (G.k === 'rays' || G.k === 'neonrays') { g.save(); g.translate(W / 2, H * 0.4); g.rotate(t * 0.5); const a = Math.min(1, t * 2) * (t > 3.4 ? Math.max(0, (4 - t) / 0.6) : 1); for (let k = 0; k < 16; k++) { g.rotate(6.283 / 16); g.fillStyle = G.cols[k % G.cols.length]; g.globalAlpha = 0.28 * a; g.beginPath(); g.moveTo(0, 0); g.lineTo(-W * 0.06, -Math.max(W, H)); g.lineTo(W * 0.06, -Math.max(W, H)); g.fill(); } g.restore(); if (t < 3) for (let i = 0; i < 2; i++) add({ x: W / 2 + rnd(-W * 0.3, W * 0.3), y: H * 0.4 + rnd(-H * 0.3, H * 0.3), vx: 0, vy: -20 * S, sh: 'star', s: rnd(6, 12) * S, max: 0.8, fade: 1 }); }
      if (G.k === 'bolt' && t < 3.2 && Math.random() < 0.12) { g.save(); g.strokeStyle = '#fff'; g.shadowColor = G.cols[0]; g.shadowBlur = 20 * S; g.lineWidth = 4 * S; let x = rnd(W * 0.1, W * 0.9), y = 0; g.beginPath(); g.moveTo(x, y); while (y < H) { x += rnd(-40, 40) * S; y += rnd(20, 60) * S; g.lineTo(x, y); } g.stroke(); g.restore(); g.fillStyle = 'rgba(200,230,255,.18)'; g.fillRect(0, 0, W, H); }
      if (G.k === 'ring' && t < 3) { for (let k = 0; k < 3; k++) { const tt = (t * 1.2 + k * 0.35) % 1.2; g.strokeStyle = G.cols[k % 2]; g.globalAlpha = Math.max(0, 1 - tt / 1.2); g.lineWidth = 8 * S * (1 - tt / 1.2) + 1; g.beginPath(); g.arc(W / 2, H * 0.45, tt * Math.max(W, H) * 0.7, 0, 7); g.stroke(); } g.globalAlpha = 1; }
      if (G.k === 'rainbow') { const C = ['#ff3a3a', '#ff9a1a', '#ffe01a', '#3adc5a', '#2a9aff', '#9a5aff'], p = Math.min(1, t / 1.2), a = t > 3.4 ? Math.max(0, (4 - t) / 0.6) : 1; g.save(); g.globalAlpha = 0.7 * a; C.forEach((c, k) => { g.strokeStyle = c; g.lineWidth = 16 * S; g.beginPath(); g.arc(W / 2, H * 0.95, Math.min(W, H * 1.5) * 0.55 - k * 16 * S, Math.PI, Math.PI + Math.PI * p); g.stroke(); }); g.restore(); if (t < 3) add({ x: rnd(0, W), y: rnd(0, H * 0.7), vx: 0, vy: 0, sh: 'star', c: '#fff', s: rnd(5, 10) * S, max: 0.6, fade: 1 }); }
      if (G.k === 'dragon' && t < 3.8) { const head = t / 3 * (H + 400 * S), pts = []; for (let k = 0; k < 60; k++) { const y = H + 60 * S - head + k * 14 * S, x = W / 2 + Math.sin(t * 3.5 - k * 0.22) * W * 0.2; pts.push([x, y]); }
        g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; for (let k = pts.length - 1; k > 0; k--) { const w = (44 - k * 0.6) * S; g.strokeStyle = G.cols[0]; g.lineWidth = w; g.beginPath(); g.moveTo(pts[k][0], pts[k][1]); g.lineTo(pts[k - 1][0], pts[k - 1][1]); g.stroke(); g.strokeStyle = 'rgba(0,60,20,.35)'; g.lineWidth = w * 0.35; g.stroke(); if (k % 3 === 0) { g.fillStyle = G.cols[1]; g.beginPath(); g.moveTo(pts[k][0] - 6 * S, pts[k][1]); g.lineTo(pts[k][0], pts[k][1] - w * 0.75); g.lineTo(pts[k][0] + 6 * S, pts[k][1]); g.fill(); } }
        const [hx, hy] = pts[0]; g.fillStyle = G.cols[0]; g.beginPath(); g.ellipse(hx, hy, 34 * S, 28 * S, 0, 0, 7); g.fill(); g.fillStyle = '#1a7a3a'; g.beginPath(); g.ellipse(hx, hy - 22 * S, 22 * S, 12 * S, 0, 0, 7); g.fill(); g.strokeStyle = G.cols[1]; g.lineWidth = 5 * S; g.beginPath(); g.moveTo(hx - 14 * S, hy - 22 * S); g.quadraticCurveTo(hx - 30 * S, hy - 50 * S, hx - 20 * S, hy - 68 * S); g.moveTo(hx + 14 * S, hy - 22 * S); g.quadraticCurveTo(hx + 30 * S, hy - 50 * S, hx + 20 * S, hy - 68 * S); g.stroke();
        g.fillStyle = '#fff'; for (const sx of [-1, 1]) { g.beginPath(); g.arc(hx + sx * 13 * S, hy - 6 * S, 7 * S, 0, 7); g.fill(); } g.fillStyle = '#e10600'; for (const sx of [-1, 1]) { g.beginPath(); g.arc(hx + sx * 13 * S, hy - 6 * S, 3.5 * S, 0, 7); g.fill(); } g.strokeStyle = G.cols[1]; g.lineWidth = 3 * S; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(hx + sx * 20 * S, hy + 10 * S); g.quadraticCurveTo(hx + sx * 60 * S, hy + 20 * S, hx + sx * 70 * S, hy - 10 * S); g.stroke(); } g.restore();
        if (Math.random() < 0.6) add({ x: hx + rnd(-60, 60) * S, y: hy + rnd(0, 200) * S, vx: rnd(-30, 30) * S, vy: 40 * S, sh: 'spark', c: G.cols[1], s: rnd(8, 16) * S, max: 1.2, fade: 1 }); }
      for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; p.life += dt; if (p.life > p.max || p.y > H + 60 || p.y < -H * 1.7) { P.splice(i, 1); continue; } p.vy += (p.grav || 0) * dt; if (p.drag) { p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt * 0.5; } if (G.k === 'drift') p.vx += Math.sin(t * 2 + p.y * 0.01) * 30 * S * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; g.globalAlpha = (p.fade ? Math.max(0, 1 - p.life / p.max) : 1) * (t > 3.6 ? Math.max(0, (4.2 - t) / 0.6) : 1); shape(p); }
      g.globalAlpha = 1; banner(t); if (now - T0 < DUR) requestAnimationFrame(step); else this.stop(); };
    requestAnimationFrame(step); },
  stop() { if (this.el) { this.el.remove(); this.el = null; } }
};
{ const GP = Game.prototype, _f = GP.finish; GP.finish = function (reason) { const r = _f.apply(this, arguments); try { const id = SAVE.data.goalFx; if (id && invHas('gfx_' + id) && reason !== 'crash' && reason !== 'stuck' && !(this.cfg && this.cfg.replay)) setTimeout(() => GFX.play(id), 250); } catch (e) { } return r; }; }

// ---------------- クラクション ----------------
const HORNS = [
  ['classic', 'クラシックホーン', 'Classic Horn', 'C', [[420, .45, 'square', .12], [525, .45, 'square', .1]]],
  ['compact', 'コンパクトカー', 'Compact Beep', 'C', [[640, .12, 'square', .12], [640, .14, 'square', .12, .18]]],
  ['dual', 'デュアルトーン', 'Dual Tone', 'C', [[350, .6, 'sawtooth', .08], [440, .6, 'sawtooth', .08]]],
  ['truck', 'エアホーン（トラック）', 'Truck Air Horn', 'U', [[150, 1.1, 'sawtooth', .14], [190, 1.1, 'sawtooth', .12], [226, 1.1, 'sawtooth', .08]], [[1.1, 400, 1, .05]]],
  ['train', '汽笛', 'Steam Whistle', 'R', [[523, 1.2, 'triangle', .12, 0, 494], [659, 1.2, 'triangle', .1, 0, 622], [784, 1.2, 'triangle', .08, 0, 740]], [[1.2, 2400, 2, .04]]],
  ['bell', 'じてんしゃベル', 'Bike Bell', 'C', [[2100, .35, 'sine', .14], [2650, .35, 'sine', .08], [2100, .4, 'sine', .14, .18], [2650, .4, 'sine', .08, .18]]],
  ['clown', 'ピエロのラッパ', 'Clown Horn', 'U', [[420, .18, 'square', .12, 0, 620], [620, .2, 'square', .12, .2, 380]]],
  ['duck', 'アヒル', 'Duck Quack', 'U', [[700, .14, 'sawtooth', .12, 0, 420], [700, .16, 'sawtooth', .12, .2, 400]]],
  ['laser', 'レーザー', 'Laser Blaster', 'R', [[1600, .3, 'square', .1, 0, 180], [1200, .3, 'square', .08, .32, 160]]],
  ['coin', 'レトロコイン', 'Retro Coin', 'U', [[988, .08, 'square', .1], [1319, .35, 'square', .1, .08]]],
  ['siren', 'サイレン', 'Siren', 'R', [[700, .3, 'sawtooth', .08, 0, 950], [950, .3, 'sawtooth', .08, .3, 700], [700, .3, 'sawtooth', .08, .6, 950], [950, .3, 'sawtooth', .08, .9, 700]]],
  ['cow', 'ウシ', 'Cow Moo', 'R', [[190, .9, 'sawtooth', .12, 0, 130]]],
  ['cat', 'ネコ', 'Cat Meow', 'R', [[620, .25, 'triangle', .12, 0, 900], [900, .35, 'triangle', .12, .25, 480]]],
  ['chime', 'ドアチャイム', 'Door Chime', 'U', [[784, .7, 'sine', .14], [622, .9, 'sine', .14, .45]]],
  ['taiko', '和太鼓', 'Taiko Drum', 'R', [[90, .35, 'sine', .3, 0, 50], [90, .35, 'sine', .3, .3, 50], [110, .5, 'sine', .3, .55, 55]], [[.2, 300, 1, .2, 0, 'lowpass'], [.2, 300, 1, .2, .3, 'lowpass']]],
  ['whistle', 'ホイッスル', 'Whistle', 'U', [[1900, .2, 'sine', .12], [1950, .5, 'sine', .12, .25, 1850]]],
  ['party', 'パーティーホーン', 'Party Horn', 'U', [[440, .12, 'sawtooth', .1], [440, .12, 'sawtooth', .1, .16], [440, .5, 'sawtooth', .1, .32, 520]]],
  ['fanfare', 'ミニファンファーレ', 'Mini Fanfare', 'E', [[523, .14, 'square', .08], [659, .14, 'square', .08, .14], [784, .14, 'square', .08, .28], [1046, .5, 'square', .08, .42]]],
  ['melody1', 'メロディ「ドライブ」', 'Melody "Drive"', 'E', [[659, .14, 'triangle', .14], [784, .14, 'triangle', .14, .15], [880, .14, 'triangle', .14, .3], [784, .14, 'triangle', .14, .45], [1046, .4, 'triangle', .14, .6]]],
  ['melody2', 'メロディ「ナイト」', 'Melody "Night"', 'E', [[440, .2, 'sine', .14], [523, .2, 'sine', .14, .22], [659, .2, 'sine', .14, .44], [587, .5, 'sine', .14, .66]]],
  ['ufo', 'UFO', 'UFO', 'E', [[300, 1, 'sine', .1, 0, 1200], [310, 1, 'sine', .08, 0, 1180]]],
  ['robot', 'ロボット', 'Robot', 'R', [[200, .1, 'square', .1], [300, .1, 'square', .1, .12], [150, .1, 'square', .1, .24], [400, .2, 'square', .1, .36]]],
  ['dragon', '龍の咆哮', 'Dragon Roar', 'L', [[110, 1.3, 'sawtooth', .16, 0, 70], [165, 1.3, 'sawtooth', .1, 0, 90]], [[1.3, 600, .8, .12, 0, 'lowpass']]],
  ['orchestra', 'オーケストラヒット', 'Orchestra Hit', 'L', [[262, .7, 'sawtooth', .1], [330, .7, 'sawtooth', .08], [392, .7, 'sawtooth', .08], [523, .7, 'sawtooth', .08]], [[.3, 1500, .7, .1]]]
];
const HORN_BY = {}; for (const [id, nm, en, r, tones, noise] of HORNS) { HORN_BY[id] = { id, nm, tones, noise: noise || [] }; mkItem({ id: 'hrn_' + id, type: 'horn', horn: id, name: 'クラクション「' + nm + '」', en: 'Horn "' + en + '"', rarity: r, lim: 1, desc: 'レース中にクラクションボタン（キーボードは H）で鳴らせる音（「飾り・小物」から装着）' }); }
function playHorn(id) { const H = HORN_BY[id] || HORN_BY.classic; if (!AUDIO.ok) return; for (const [f, d, ty, v, w = 0, sl = 0] of H.tones) AUDIO.tone(f, d, ty, v, w, sl); for (const [d, f, q, v, w = 0, ty = 'bandpass'] of H.noise) AUDIO.noiseBurst(d, f, q, v, w, ty); }
const HORN = { el: null, last: 0,
  honk() { const now = performance.now(); if (now - this.last < 450) return; this.last = now; const d = SAVE.data, id = d.horn && invHas('hrn_' + d.horn) ? d.horn : 'classic'; playHorn(id); if (this.el) { this.el.classList.remove('hit'); void this.el.offsetWidth; this.el.classList.add('hit'); } },
  ensure() { if (!this.el) { const b = document.createElement('button'); b.id = 'hornBtn'; b.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M3 10 h4 l6 -5 v14 l-6 -5 h-4z" fill="#fff"/><path d="M16 8 q3 4 0 8 M19 5 q5 7 0 14" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>'; b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); this.honk(); }); document.body.appendChild(b); this.el = b; } return this.el; } };
window.addEventListener('keydown', e => { if ((e.key === 'h' || e.key === 'H') && !e.repeat && UI.game && UI.game.active && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) HORN.honk(); });
{ const GP = Game.prototype, _up = GP.update; GP.update = function (dt) { _up.call(this, dt); const b = HORN.ensure(), show = this.active && !(this.cfg && this.cfg.replay) && !document.querySelector('#overlay:not(.hidden) .modal') && SAVE.data.settings.hornBtn !== false; b.style.display = show ? '' : 'none'; }; }
{ const _gm = UI.goMenu; UI.goMenu = function () { if (HORN.el) HORN.el.style.display = 'none'; GFX.stop(); return _gm.apply(this, arguments); }; }

// ---------------- ガレージの飾り付け ----------------
const GDECOS = [
  ['poster_drift', 'ポスター「DRIFT」', 'Poster "DRIFT"', 'C', { k: 'poster', t: 'DRIFT', bg: '#e10600', fg: '#fff' }],
  ['poster_touge', 'ポスター「峠」', 'Poster "TOUGE"', 'C', { k: 'poster', t: '峠', bg: '#111', fg: '#ffcf3d' }],
  ['poster_legend', 'ポスター「LEGENDS」', 'Poster "LEGENDS"', 'U', { k: 'poster', t: 'LEGENDS', bg: '#1e5aff', fg: '#fff' }],
  ['poster_retro', 'レトロポスター', 'Retro Poster', 'U', { k: 'poster', t: '1986', bg: '#ff7a3a', fg: '#2a1a40', stripes: 1 }],
  ['neon_open', 'ネオン「OPEN」', 'Neon "OPEN"', 'U', { k: 'neon', t: 'OPEN', c: '#ff2bd6' }],
  ['neon_drift', 'ネオン「DRIFT」', 'Neon "DRIFT"', 'R', { k: 'neon', t: 'DRIFT', c: '#00e5ff' }],
  ['neon_garage', 'ネオン「GARAGE」', 'Neon "GARAGE"', 'R', { k: 'neon', t: 'GARAGE', c: '#ffcf3d' }],
  ['neon_kanji', 'ネオン「走り屋」', 'Neon "HASHIRIYA"', 'E', { k: 'neon', t: '走り屋', c: '#ff3a3a' }],
  ['tires', 'タイヤの山', 'Tire Stack', 'C', { k: 'tires' }],
  ['cones', 'パイロン', 'Traffic Cones', 'C', { k: 'cones' }],
  ['drums', 'ドラム缶', 'Oil Drums', 'C', { k: 'drums', c: '#1e5aff' }],
  ['toolbox', 'ツールキャビネット', 'Tool Cabinet', 'U', { k: 'toolbox', c: '#e10600' }],
  ['bench', '作業台', 'Workbench', 'U', { k: 'bench' }],
  ['trophy', 'トロフィー棚', 'Trophy Shelf', 'R', { k: 'trophy' }],
  ['arcade', 'アーケードゲーム機', 'Arcade Cabinet', 'R', { k: 'arcade', c: '#5a2aff' }],
  ['vending', '自動販売機', 'Vending Machine', 'R', { k: 'vending', c: '#e10600' }],
  ['plant', '観葉植物', 'Potted Plant', 'C', { k: 'plant' }],
  ['sofa', 'レザーソファ', 'Leather Sofa', 'U', { k: 'sofa', c: '#6a2a10' }],
  ['flag', 'チェッカーフラッグ', 'Checkered Flags', 'U', { k: 'flag' }],
  ['lantern', 'ちょうちん', 'Paper Lanterns', 'R', { k: 'lantern' }],
  ['jukebox', 'ジュークボックス', 'Jukebox', 'E', { k: 'jukebox' }],
  ['engine', 'エンジン展示台', 'Engine Display', 'E', { k: 'engine' }],
  ['torii', 'ミニ鳥居', 'Mini Torii Gate', 'E', { k: 'torii' }],
  ['statue', 'ゴールドカー像', 'Gold Car Statue', 'L', { k: 'statue' }],
  ['dragon', '龍の掛け軸', 'Dragon Scroll', 'L', { k: 'scroll' }],
  ['lights', 'ストリングライト', 'String Lights', 'U', { k: 'lights' }]
];
const GDECO_BY = {}; for (const [id, nm, en, r, st] of GDECOS) { GDECO_BY[id] = Object.assign({ id, nm }, st); mkItem({ id: 'gdc_' + id, type: 'gdeco', gdeco: id, name: 'ガレージの飾り「' + nm + '」', en: 'Garage Decor "' + en + '"', rarity: r, lim: 1, desc: 'メニューの背景のガレージに置ける飾り（「飾り・小物」から設置、最大8個）' }); }
const GDECO_MAX = 8, GDECO_SLOTS = [0.5, -0.5, 1.4, -1.4, 2.2, -2.2, 2.85, -2.85].map(a => a + Math.PI / 2);
const decoTex = (D) => { const c = document.createElement('canvas'); c.width = 256; c.height = D.k === 'neon' ? 96 : 320; const g = c.getContext('2d');
  if (D.k === 'neon') { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, 256, 96); g.font = `900 ${D.t.length > 4 ? 52 : 64}px Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = D.c; g.shadowBlur = 18; g.fillStyle = '#fff'; for (let k = 0; k < 3; k++) g.fillText(D.t, 128, 50); g.strokeStyle = D.c; g.lineWidth = 3; g.strokeText(D.t, 128, 50); }
  else if (D.k === 'scroll') { g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, 256, 320); g.strokeStyle = '#2a8a4a'; g.lineWidth = 10; g.beginPath(); for (let k = 0; k < 40; k++) { const y = 30 + k * 6.5, x = 128 + Math.sin(k * 0.45) * 60; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.fillStyle = '#ffcf3d'; g.beginPath(); g.arc(128 + Math.sin(0) * 60, 30, 16, 0, 7); g.fill(); g.fillStyle = '#c8102e'; g.font = '900 34px serif'; g.textAlign = 'center'; g.fillText('龍', 210, 290); }
  else { g.fillStyle = D.bg; g.fillRect(0, 0, 256, 320); if (D.stripes) for (let k = 0; k < 5; k++) { g.fillStyle = ['#ffcf3d', '#ff3a6a', '#9a3aff', '#2a9aff', '#2adcd0'][k]; g.fillRect(0, 170 + k * 22, 256, 14); } g.strokeStyle = D.fg; g.lineWidth = 8; g.strokeRect(14, 14, 228, 292); g.fillStyle = D.fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 italic ${D.t.length > 4 ? 46 : 110}px Arial, sans-serif`; g.fillText(D.t, 128, D.stripes ? 100 : 150); g.font = '700 18px Arial'; g.fillText('DRIFT LEGENDS', 128, 280); }
  return c; };
function buildDeco(D, a, R) {
  const r = D.k === 'poster' || D.k === 'neon' || D.k === 'scroll' ? 15.5 : 11, cx = Math.cos(a) * r, cz = Math.sin(a) * r, yaw = Math.atan2(-Math.cos(a), -Math.sin(a)), rx = -Math.sin(a), rz = Math.cos(a), ix = -Math.cos(a), iz = -Math.sin(a);
  const Wp = (lx, lz) => [cx + rx * lx + ix * lz, cz + rz * lx + iz * lz], gN = new GB(), gE = new GB(); gE.e = 1; const out = [];
  const B = (g, lx, y, lz, sx, sy, sz, c) => { const [x, z] = Wp(lx, lz); g.box(x, y, z, sx, sy, sz, c, yaw); }, CY = (g, lx, y, lz, r0, r1, h, c, seg = 12) => { const [x, z] = Wp(lx, lz); g.cylY(x, y, z, r0, r1, h, seg, c); }, SP = (g, lx, y, lz, rr, c) => { const [x, z] = Wp(lx, lz); g.sphere(x, y, z, rr, c, 5); };
  const tex = (w, h, y, emis) => { const cv = decoTex(D), t = R.texFromCanvas(cv, null, true, true), gT = new GB(), [x0, z0] = Wp(-w / 2, 0.02), [x1, z1] = Wp(w / 2, 0.02); gT.quad([x0, y, z0], [x1, y, z1], [x1, y + h, z1], [x0, y + h, z0], [1, 1, 1], [0, 0, 1, 0, 1, 1, 0, 1]); out.push({ mesh: new Mesh(R.gl, gT.a), mat: Mat(emis ? { tex: t, texMode: 1, emis: 3, sunScale: 0, blend: true, depthWrite: false } : { tex: t, texMode: 1, spec: 0.1 }), tex: t }); };
  const hex = h => hexToRgb(h), dk = [0.08, 0.08, 0.09], metal = [0.6, 0.62, 0.66];
  switch (D.k) {
    case 'poster': B(gN, 0, 3.2, -0.02, 2.3, 2.9, 0.04, dk); tex(2.2, 2.75, 1.85); break;
    case 'scroll': B(gN, 0, 5.35, 0.02, 2.4, 0.12, 0.12, [0.4, 0.25, 0.1]); B(gN, 0, 1.85, 0.02, 2.4, 0.12, 0.12, [0.4, 0.25, 0.1]); tex(2.1, 3.4, 1.9); break;
    case 'neon': B(gN, 0, 4.0, -0.04, 3.4, 1.3, 0.05, [0.03, 0.03, 0.04]); tex(3.2, 1.2, 3.4, 1); break;
    case 'tires': for (let k = 0; k < 4; k++) CY(gN, 0, 0.27 * k, 0, 0.42, 0.42, 0.26, [0.06, 0.06, 0.07], 16); for (let k = 0; k < 3; k++) CY(gN, 1, 0.27 * k, 0.2, 0.42, 0.42, 0.26, [0.06, 0.06, 0.07], 16); CY(gN, 1, 0.81, 0.2, 0.25, 0.25, 0.02, metal); break;
    case 'cones': for (const [lx, lz] of [[-0.8, 0], [0, 0.4], [0.8, 0]]) { B(gN, lx, 0.03, lz, 0.5, 0.06, 0.5, dk); CY(gN, lx, 0.06, lz, 0.2, 0.04, 0.7, [1, 0.4, 0.05]); CY(gN, lx, 0.36, lz, 0.13, 0.11, 0.1, [0.95, 0.95, 0.95]); } break;
    case 'drums': for (const [lx, lz] of [[-0.45, 0], [0.45, 0], [0, 0.65]]) { CY(gN, lx, 0, lz, 0.32, 0.32, 0.95, hex(D.c), 14); for (const y of [0.3, 0.65]) CY(gN, lx, y, lz, 0.33, 0.33, 0.04, dk, 14); } break;
    case 'toolbox': B(gN, 0, 0.6, 0, 1.6, 1.2, 0.6, hex(D.c)); for (let k = 0; k < 5; k++) B(gN, 0, 0.18 + k * 0.22, 0.31, 1.45, 0.02, 0.02, metal); B(gN, 0, 1.25, 0, 1.6, 0.1, 0.65, [0.2, 0.2, 0.22]); B(gN, 0, 1.6, -0.25, 1.6, 0.7, 0.04, [0.15, 0.15, 0.16]); for (let k = 0; k < 6; k++) B(gN, -0.6 + k * 0.24, 1.6, -0.2, 0.05, 0.4, 0.04, metal); break;
    case 'bench': B(gN, 0, 0.9, 0, 2.2, 0.08, 0.8, [0.5, 0.32, 0.15]); for (const lx of [-1, 1]) for (const lz of [-0.35, 0.35]) B(gN, lx, 0.45, lz, 0.07, 0.9, 0.07, dk); B(gN, -0.6, 1.05, 0, 0.4, 0.22, 0.3, [0.9, 0.7, 0.1]); CY(gN, 0.5, 0.94, 0.1, 0.18, 0.18, 0.08, metal); B(gN, 0, 1.8, -0.38, 2.2, 1.6, 0.04, [0.25, 0.25, 0.27]); break;
    case 'trophy': B(gN, 0, 1.2, 0, 2.2, 2.4, 0.5, [0.3, 0.18, 0.08]); for (const y of [0.6, 1.4, 2.1]) B(gN, 0, y - 0.25, 0.05, 2.0, 0.05, 0.45, [0.2, 0.12, 0.05]); for (const [lx, y, c] of [[-0.6, 0.6, [1, 0.8, 0.2]], [0, 0.6, [0.8, 0.82, 0.86]], [0.6, 0.6, [0.8, 0.5, 0.25]], [-0.35, 1.4, [1, 0.8, 0.2]], [0.35, 1.4, [1, 0.8, 0.2]], [0, 2.1, [1, 0.85, 0.3]]]) { CY(gN, lx, y - 0.22, 0.05, 0.12, 0.12, 0.08, c); CY(gN, lx, y - 0.14, 0.05, 0.04, 0.04, 0.12, c); CY(gN, lx, y - 0.02, 0.05, 0.08, 0.15, 0.2, c); } break;
    case 'arcade': B(gN, 0, 0.9, 0, 0.9, 1.8, 0.8, hex(D.c)); B(gE, 0, 1.4, 0.38, 0.65, 0.5, 0.04, [0.2, 0.8, 1]); B(gN, 0, 0.95, 0.42, 0.85, 0.1, 0.3, [0.1, 0.1, 0.12]); SP(gE, -0.15, 1.02, 0.45, 0.05, [1, 0.2, 0.2]); SP(gE, 0.1, 1.02, 0.45, 0.05, [1, 0.9, 0.2]); B(gE, 0, 1.9, 0.38, 0.8, 0.18, 0.04, [1, 0.3, 0.8]); break;
    case 'vending': B(gN, 0, 0.95, 0, 1.1, 1.9, 0.8, hex(D.c)); B(gE, -0.12, 1.25, 0.41, 0.7, 1.0, 0.02, [0.85, 0.95, 1]); for (let k = 0; k < 3; k++) for (let j = 0; j < 4; j++) B(gN, -0.37 + j * 0.17, 0.95 + k * 0.3, 0.43, 0.1, 0.18, 0.02, [[0.2, 0.5, 1], [1, 0.5, 0.1], [0.2, 0.8, 0.3], [1, 0.9, 0.2]][j]); B(gN, 0.35, 1.2, 0.42, 0.18, 0.5, 0.02, [0.15, 0.15, 0.16]); B(gN, 0, 0.3, 0.42, 0.8, 0.16, 0.02, dk); break;
    case 'plant': CY(gN, 0, 0, 0, 0.32, 0.4, 0.55, [0.85, 0.85, 0.82]); CY(gN, 0, 0.55, 0, 0.05, 0.05, 0.6, [0.3, 0.2, 0.1]); for (let k = 0; k < 7; k++) { const aa = k * 0.9; SP(gN, Math.cos(aa) * 0.3, 1.1 + (k % 3) * 0.25, Math.sin(aa) * 0.3, 0.32, [0.15, 0.5 + (k % 3) * 0.08, 0.2]); } break;
    case 'sofa': B(gN, 0, 0.3, 0, 2.2, 0.4, 0.9, hex(D.c)); B(gN, 0, 0.75, -0.35, 2.2, 0.6, 0.22, hex(D.c)); for (const lx of [-1.05, 1.05]) B(gN, lx, 0.55, 0, 0.2, 0.5, 0.9, hex(D.c)); for (const lx of [-0.5, 0.5]) B(gN, lx, 0.55, 0.05, 0.95, 0.12, 0.75, [0.5, 0.22, 0.08]); break;
    case 'flag': for (const lx of [-0.7, 0.7]) { CY(gN, lx, 0, 0, 0.03, 0.03, 2.6, metal, 6); for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) B(gN, lx + (lx < 0 ? -1 : 1) * (0.12 + k * 0.2), 2.4 - j * 0.2, 0, 0.2, 0.2, 0.02, (k + j) % 2 ? [0.05, 0.05, 0.05] : [0.95, 0.95, 0.95]); } break;
    case 'lantern': B(gN, 0, 3.4, 0, 3.2, 0.03, 0.03, dk); for (let k = 0; k < 5; k++) { const lx = -1.4 + k * 0.7; CY(gE, lx, 2.8, 0, 0.22, 0.22, 0.5, k % 2 ? [1, 0.25, 0.15] : [1, 0.85, 0.5]); CY(gN, lx, 3.28, 0, 0.12, 0.12, 0.1, dk); CY(gN, lx, 2.74, 0, 0.12, 0.12, 0.08, dk); } break;
    case 'jukebox': B(gN, 0, 0.7, 0, 1.1, 1.4, 0.6, [0.5, 0.2, 0.1]); CY(gN, 0, 1.4, 0, 0.55, 0.55, 0.6, [0.5, 0.2, 0.1], 16); B(gE, 0, 1.15, 0.31, 0.75, 0.55, 0.02, [1, 0.8, 0.3]); for (let k = 0; k < 6; k++) B(gE, -0.5 + k * 0.2, 0.5, 0.31, 0.03, 0.6, 0.02, [[1, 0.2, 0.3], [1, 0.8, 0.1], [0.2, 0.8, 1]][k % 3]); break;
    case 'engine': B(gN, 0, 0.35, 0, 1.4, 0.7, 1.0, [0.2, 0.2, 0.22]); B(gN, 0, 0.95, 0, 0.9, 0.5, 0.7, [0.55, 0.56, 0.6]); for (let k = 0; k < 4; k++) CY(gN, -0.3 + k * 0.2, 1.2, 0, 0.07, 0.07, 0.15, [0.9, 0.1, 0.1]); B(gN, 0, 1.25, 0.3, 0.8, 0.12, 0.08, [0.75, 0.76, 0.8]); CY(gN, 0.5, 0.9, 0.3, 0.12, 0.12, 0.3, metal); break;
    case 'torii': for (const lx of [-0.9, 0.9]) CY(gN, lx, 0, 0, 0.11, 0.1, 2.6, [0.85, 0.15, 0.08], 10); B(gN, 0, 2.65, 0, 2.6, 0.18, 0.28, [0.1, 0.08, 0.08]); B(gN, 0, 2.5, 0, 2.3, 0.14, 0.2, [0.85, 0.15, 0.08]); B(gN, 0, 2.15, 0, 2.0, 0.12, 0.16, [0.85, 0.15, 0.08]); break;
    case 'statue': B(gN, 0, 0.4, 0, 1.6, 0.8, 1.0, [0.12, 0.12, 0.14]); B(gN, 0, 0.9, 0, 1.3, 0.2, 0.6, [1, 0.8, 0.25]); B(gN, -0.05, 1.1, 0, 0.7, 0.22, 0.52, [1, 0.8, 0.25]); for (const lx of [-0.42, 0.42]) for (const lz of [-0.3, 0.3]) CY(gN, lx, 0.8, lz, 0.1, 0.1, 0.04, [1, 0.8, 0.25]); B(gE, 0, 0.5, 0.51, 1.0, 0.12, 0.02, [1, 0.85, 0.4]); break;
    case 'lights': for (let k = 0; k < 24; k++) { const lx = -2.4 + k * 0.2, y = 3.6 - Math.sin(k / 23 * Math.PI) * 0.6; SP(gE, lx, y, 0, 0.06, [[1, 0.85, 0.4], [1, 0.4, 0.6], [0.4, 0.8, 1]][k % 3]); } break;
  }
  if (gN.count) out.push({ mesh: new Mesh(R.gl, gN.a), mat: Mat({ spec: 0.4, shin: 40, refl: 0.1 }) });
  if (gE.count) { for (let i = 0; i < gE.a.length; i += VSTRIDE) gE.a[i + 9] = 1; out.push({ mesh: new Mesh(R.gl, gE.a), mat: Mat({ emis: 1.3 }) }); }
  return out; }
setTimeout(() => { const SP = Showroom.prototype, _rb = SP.rebuildStudio; SP.rebuildStudio = function () { if (this._decoTex) { for (const t of this._decoTex) try { this.R.gl.deleteTexture(t); } catch (e) { } } this._decoTex = []; _rb.apply(this, arguments);
    try { const list = ((SAVE.data && SAVE.data.gdeco) || []).filter(id => GDECO_BY[id] && invHas('gdc_' + id)).slice(0, GDECO_MAX); list.forEach((id, i) => { for (const o of buildDeco(GDECO_BY[id], GDECO_SLOTS[i], this.R)) { this.studio.push(o); if (o.tex) this._decoTex.push(o.tex); } }); } catch (e) { console.warn(e); } }; try { if (UI.show && SAVE.data && (SAVE.data.gdeco || []).length) UI.show.rebuildStudio(); } catch (e) { } }, 0);

// ---------------- パック（4種類：スタイルの欄） ----------------
CHESTS.push({ id: 'platepack', name: 'ナンバーデザインパック', price: 900000, odds: { C: 34, U: 34, R: 21, E: 9, L: 2 }, color: '#2adcd0', pool: 'platedesign' },
  { id: 'goalpack', name: 'ゴール演出パック', price: 1500000, odds: { C: 30, U: 34, R: 22, E: 11, L: 3 }, color: '#ffcf3d', pool: 'goalfx' },
  { id: 'gdecopack', name: 'ガレージ飾りパック', price: 1200000, odds: { C: 32, U: 32, R: 22, E: 11, L: 3 }, color: '#ff8a2a', pool: 'gdeco' },
  { id: 'hornpack', name: 'クラクションパック', price: 800000, odds: { C: 32, U: 34, R: 21, E: 10, L: 3 }, color: '#5ad1ff', pool: 'horn' });
Object.assign(PACK_ART, { platepack: { a: '#062a28', b: '#2adcd0', t: 'PLATES' }, goalpack: { a: '#2a2006', b: '#ffcf3d', t: 'FINISH FX' }, gdecopack: { a: '#2a1406', b: '#ff8a2a', t: 'GARAGE' }, hornpack: { a: '#06202a', b: '#5ad1ff', t: 'HORNS' } });
Object.assign(PACK_TIER, { platepack: 2, goalpack: 3, gdecopack: 3, hornpack: 2 });
const NEWPOOL = { platedesign: 'platedesign', goalfx: 'goalfx', gdeco: 'gdeco', horn: 'horn' };
{ const _pp = packPool; packPool = function (c, rar) { if (NEWPOOL[c.pool]) { const r = ITEMS.filter(i => i.type === NEWPOOL[c.pool] && i.rarity === rar); return r; } return _pp(c, rar).filter(i => !NEWPOOL[i.type]); }; }
Object.assign(ITEM_TYPES, { platedesign: 'ナンバーデザイン', goalfx: 'ゴール演出', gdeco: 'ガレージの飾り', horn: 'クラクション' });
// アイコン
const hornSvg = (s, c = '#5ad1ff') => `<svg viewBox="0 0 48 48" width="${s}" height="${s}"><circle cx="24" cy="24" r="22" fill="${c}" opacity=".18"/><path d="M8 20 h7 l12 -9 v26 l-12 -9 h-7z" fill="${c}"/><path d="M32 16 q5 8 0 16 M37 11 q9 13 0 26" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
const goalSvg = (id, s) => { const G = GOAL_BY[id] || {}, C = G.cols && G.cols.length ? G.cols : ['#ff3a3a', '#ffd21a', '#3adc5a', '#2a9aff']; return `<svg viewBox="0 0 48 48" width="${s}" height="${s}"><rect x="4" y="8" width="40" height="32" rx="6" fill="#111"/>${Array.from({ length: 12 }, (_, k) => `<rect x="${8 + (k * 11) % 32}" y="${11 + (k * 7) % 24}" width="5" height="3" rx="1" fill="${C[k % C.length]}" transform="rotate(${k * 30} ${10 + (k * 11) % 32} ${12 + (k * 7) % 24})"/>`).join('')}<path d="M18 30 h12 M24 30 v-6" stroke="#ffcf3d" stroke-width="2"/><path d="M17 16 h14 v4 a7 7 0 0 1 -14 0z" fill="#ffcf3d"/></svg>`; };
const gdecoSvg = (id, s) => { const D = GDECO_BY[id] || {}, c = D.c || D.bg || '#ff8a2a'; return `<svg viewBox="0 0 48 48" width="${s}" height="${s}"><rect x="2" y="30" width="44" height="14" rx="2" fill="#2a2a30"/><path d="M4 30 L24 12 L44 30z" fill="#3a3a44"/><rect x="${D.k === 'poster' || D.k === 'scroll' ? 16 : 12}" y="${D.k === 'neon' ? 16 : 20}" width="${D.k === 'poster' || D.k === 'scroll' ? 16 : 24}" height="${D.k === 'neon' ? 8 : 18}" rx="2" fill="${c}" ${D.k === 'neon' ? `style="filter:drop-shadow(0 0 3px ${c})"` : ''}/>${D.t ? `<text x="24" y="${D.k === 'neon' ? 22 : 33}" font-size="${D.t.length > 4 ? 5 : 8}" font-weight="900" text-anchor="middle" fill="${D.fg || '#fff'}">${esc(D.t)}</text>` : ''}</svg>`; };
{ const _ic = itemIconSvg; itemIconSvg = function (it, size = 34) { if (it) { if (it.type === 'platedesign') return `<img class="pd-img" src="${plateImg(it.plateD)}" style="width:${size * 1.4}px;height:${size * 0.7}px">`; if (it.type === 'goalfx') return goalSvg(it.goalfx, size); if (it.type === 'gdeco') return gdecoSvg(it.gdeco, size); if (it.type === 'horn') return hornSvg(size); } return _ic(it, size); }; }
// パックの表紙
{ const art = c => c.id === 'platepack' ? `<div class="np-cover"><img src="${plateImg('neon', 'DL 86-86')}"><img src="${plateImg('sakura', '峠 77-77')}"><img src="${plateImg('gold', 'GG 1-1')}"></div>` : c.id === 'goalpack' ? `<div class="gf-cover">${goalSvg('fireworks', 76)}</div>` : c.id === 'gdecopack' ? `<div class="gf-cover">${gdecoSvg('neon_drift', 80)}</div>` : c.id === 'hornpack' ? `<div class="gf-cover">${hornSvg(72)}</div>` : null;
  const _ph = packHTML; packHTML = function (c, size = 1) { const h = _ph(c, size), a = c && art(c); if (!a) return h; const i = h.indexOf('<div class="pk2-emb'), j = h.indexOf('</div><div class="pk2-name">', i); return i < 0 || j < 0 ? h : h.slice(0, i) + `<div class="pk2-emb">${a}` + h.slice(j); };
  const _pu = packPouch; packPouch = function (c, size = 1) { const h = _pu(c, size), a = c && art(c); if (!a) return h; const i = h.indexOf('<div class="pp-logo'), j = h.indexOf('</div><div class="pp-name">', i); return i < 0 || j < 0 ? h : h.slice(0, i) + `<div class="pp-logo pp-cover" style="--cs2:${size}">${a}` + h.slice(j); }; }
{ const _sh = UI.packStoreHTML; UI.packStoreHTML = function () { let h = _sh.apply(this, arguments); for (const [id, k] of [['platepack', 'ナンバーのデザイン'], ['goalpack', 'ゴールの演出'], ['gdecopack', 'ガレージの飾り'], ['hornpack', 'クラクションの音']]) h = h.replace(new RegExp(`(data-v="${id}"[\\s\\S]*?<span class="ps-kind">)[^<]*`), `$1${k}`); return h; }; }

// ---------------- 「飾り・小物」画面（タブ） ----------------
const CM_TABS = [['charm', '飾り'], ['plate', 'ナンバー'], ['goal', 'ゴール演出'], ['gdeco', 'ガレージ'], ['horn', 'クラクション']];
{ const _rc = UI.r_charm; UI.r_charm = function () { const tab = this.cmTab || 'charm'; const tabs = `<div class="cm-tabs">${CM_TABS.map(([k, n]) => `<button class="tab ${tab === k ? 'on' : ''}" data-a="cmTab" data-v="${k}">${n}</button>`).join('')}</div>`;
    if (tab === 'charm') { const h = _rc.apply(this, arguments); $('panelTitle').textContent = 'CUSTOM'; return tabs + h; }
    $('panelTitle').textContent = 'CUSTOM'; this.show.setCar(SAVE.cur()); const d = SAVE.data;
    const grid = (type, key, cur, act, prev, icon, multi) => { const all = ITEMS.filter(i => i.type === type), own = all.filter(i => invHas(i.id)); return `<div class="h3">${own.length} / ${all.length} 所持</div><div class="cm-grid">${multi ? '' : `<button class="cm-it ${!cur ? 'on' : ''}" data-a="${act}" data-v=""><span class="cm-none">なし</span><b>${type === 'horn' ? '標準のクラクション' : type === 'platedesign' ? '標準のナンバー' : 'なし'}</b></button>`}${all.map(it => { const o = invHas(it.id), on = multi ? (cur || []).includes(it[key]) : cur === it[key]; return `<button class="cm-it ${on ? 'on' : ''} ${o ? '' : 'lock'}" data-a="${o ? act : 'cmLocked'}" data-v="${it[key]}" style="--rc:${RCOL(it.rarity)}">${icon(it)}<b>${esc(it.name.replace(/^[^「]*「|」$/g, ''))}</b><small>${RARITY[it.rarity].name}</small>${o && prev ? `<span class="cm-pv" data-a="${prev}" data-v="${it[key]}">▶</span>` : ''}</button>`; }).join('')}</div>`; };
    let h = tabs;
    if (tab === 'plate') { const inst = SAVE.cur(), cur = (inst.look || {}).plateDesign || ''; h += `<div class="cm-hero"><img class="pd-big" src="${plateImg(cur || 'classic', (inst.look && inst.look.plate) || '峠 86-86')}"><div><b>ナンバープレートのデザイン</b><small>いま乗っている車のナンバーに付きます。車の後ろでチェックしよう。</small><button class="btn" data-a="pdAll">全部の車に同じデザインを付ける</button> <button class="btn" data-a="goPackSp" data-v="platepack">ナンバーデザインパックへ</button></div></div>` + grid('platedesign', 'plateD', cur, 'setPlateD', null, it => `<img class="pd-img" src="${plateImg(it.plateD)}">`); }
    if (tab === 'goal') h += `<div class="cm-hero"><div class="gf-cover">${goalSvg(d.goalFx || 'confetti', 70)}</div><div><b>ゴール演出</b><small>レースやタイムアタックでゴールしたときに画面いっぱいに出る演出です。▶ で試しに見られます。</small><button class="btn" data-a="goPackSp" data-v="goalpack">ゴール演出パックへ</button></div></div>` + grid('goalfx', 'goalfx', d.goalFx || '', 'setGoalFx', 'pvGoalFx', it => goalSvg(it.goalfx, 46));
    if (tab === 'gdeco') { const on = (d.gdeco || []).filter(id => invHas('gdc_' + id)); h += `<div class="cm-hero"><div class="gf-cover">${gdecoSvg('neon_garage', 70)}</div><div><b>ガレージの飾り付け（${on.length} / ${GDECO_MAX}）</b><small>メニューの背景のガレージに飾りを置けます。タップで置く／片付ける。車をドラッグして回すと全体が見られます。</small><button class="btn" data-a="gdClear">全部片付ける</button> <button class="btn" data-a="goPackSp" data-v="gdecopack">ガレージ飾りパックへ</button></div></div>` + grid('gdeco', 'gdeco', on, 'togGdeco', null, it => gdecoSvg(it.gdeco, 46), true); }
    if (tab === 'horn') h += `<div class="cm-hero"><div class="gf-cover">${hornSvg(66)}</div><div><b>クラクション</b><small>レース中に画面のクラクションボタン（キーボードは H）で鳴らせます。▶ で試し聞きできます。</small><label class="cm-chk"><input type="checkbox" data-in="hornBtnTog" ${d.settings.hornBtn !== false ? 'checked' : ''}> レース中にクラクションボタンを表示</label><button class="btn" data-a="goPackSp" data-v="hornpack">クラクションパックへ</button></div></div>` + grid('horn', 'horn', d.horn || '', 'setHorn', 'pvHorn', () => hornSvg(42));
    return h; }; }
{ const _mi = UI.menuItems; UI.menuItems = function () { _mi.apply(this, arguments); const b = document.querySelector('#menuList [data-m="charm"] span:last-child'); if (b) b.textContent = '飾り・小物'; }; }
Object.assign(UI, {
  a_cmTab(k) { this.cmTab = k; this.render(); },
  a_cmLocked() { this.toast('スタイルの欄のパックから手に入ります'); },
  a_setPlateD(id) { const inst = SAVE.cur(); inst.look = inst.look || defaultLook(CAR_BY_ID[inst.id]); inst.look.plateDesign = id || ''; SAVE.save(); this.show.setCar(inst, true); this.show.rot = Math.PI + 0.35; AUDIO.confirm && AUDIO.confirm(); this.render(); },
  a_pdAll() { const inst = SAVE.cur(), id = (inst.look || {}).plateDesign || ''; for (const c of SAVE.data.cars) { c.look = c.look || defaultLook(CAR_BY_ID[c.id]); c.look.plateDesign = id; } SAVE.save(); this.toast('全部の車のナンバーを同じデザインにしました'); },
  a_setGoalFx(id) { SAVE.data.goalFx = id || ''; SAVE.save(); AUDIO.confirm && AUDIO.confirm(); this.render(); },
  a_pvGoalFx(id) { GFX.play(id); },
  a_togGdeco(id) { const d = SAVE.data; d.gdeco = (d.gdeco || []).filter(x => invHas('gdc_' + x)); const i = d.gdeco.indexOf(id); if (i >= 0) d.gdeco.splice(i, 1); else { if (d.gdeco.length >= GDECO_MAX) return this.toast(`飾りは ${GDECO_MAX} 個まで置けます`); d.gdeco.push(id); } SAVE.save(); this.show.rebuildStudio(); AUDIO.confirm && AUDIO.confirm(); this.render(); },
  a_gdClear() { SAVE.data.gdeco = []; SAVE.save(); this.show.rebuildStudio(); this.render(); },
  a_setHorn(id) { SAVE.data.horn = id || ''; SAVE.save(); playHorn(id || 'classic'); this.render(); },
  a_pvHorn(id) { playHorn(id); },
  in_hornBtnTog(v, el) { SAVE.data.settings.hornBtn = !!el.checked; SAVE.save(); },
  a_goPackSp(id) { this.stTab = 'packs'; this.open('store'); setTimeout(() => { const vp = document.querySelector('.vp[data-vp="packs"]'); if (!vp) return; const pg = [...vp.querySelectorAll('.vp-page')], i = pg.findIndex(p => p.querySelector(`[data-v="${id}"]`)); if (i >= 0) this.a_vpGo('packs:=' + i); }, 120); }
});
// ▶ ボタンは親のボタンより優先
{ const _oa = UI.onAction; UI.onAction = function (e) { const pv = e.target && e.target.closest && e.target.closest('.cm-pv'); if (pv) { e.stopPropagation(); e.preventDefault(); const f = this['a_' + pv.dataset.a]; if (f) f.call(this, pv.dataset.v); return; } return _oa.call(this, e); }; }
window.__DLX = Object.assign(window.__DLX || {}, { packPool, GFX, playHorn, HORN, PLATE_BY, GDECO_BY, GOAL_BY, HORN_BY, buildDeco });
