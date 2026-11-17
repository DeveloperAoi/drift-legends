// ============ スピードメーターのデザイン ============
// kind: 'analog'（針）/ 'digital'（数字＋バー）
const METER_STYLES = {
  std: { name: 'スタンダード', kind: 'analog', free: 1 },
  digital: { name: 'デジタル', kind: 'digital', free: 1, look: 'ring', bg: 'rgba(0,0,0,.6)', c1: '#ffffff', c2: '#ffd040', c3: '#ff3030', digit: '#fff', glow: 0 },
  mt_classic: { kind: 'analog', face: '#f2efe6', faceText: '#111', tick: '#111', num: '#111', needle: '#ff6a00', arc: null, bezel: '#c0c0c8', red: '#c00', sub: '#555' },
  mt_carbon: { kind: 'analog', face: 'carbon', tick: '#fff', num: '#fff', needle: '#e10600', arc: ['#e10600', '#ff8a3d'], bezel: '#e10600', red: '#e10600' },
  mt_neon: { kind: 'analog', face: '#05060f', tick: '#5af0ff', num: '#5af0ff', needle: '#ff3ad0', arc: ['#00e5ff', '#ff3ad0'], bezel: '#00e5ff', glow: '#00e5ff', red: '#ff3ad0' },
  mt_gold: { kind: 'analog', face: '#14110a', tick: '#ffd76a', num: '#ffd76a', needle: '#fff2c0', arc: ['#b8860b', '#ffd76a'], bezel: 'gold', red: '#ff4a2a', glow: '#ffcf3d' },
  mt_sakura: { kind: 'analog', face: '#2a1420', tick: '#ffd0e4', num: '#ffd0e4', needle: '#ff6fae', arc: ['#ffb7d5', '#ff4fa0'], bezel: '#ffb7d5', red: '#ff2a6a', pattern: 'sakura' },
  mt_legend: { kind: 'analog', face: '#0a0a0f', tick: '#fff', num: '#fff', needle: '#fff', arc: 'rainbow', bezel: 'rainbow', red: '#ff3030', glow: '#fff' },
  mt_lcd: { kind: 'digital', look: 'bar', bg: '#0a1a0a', c1: '#2fdc7a', c2: '#c8ff3d', c3: '#ff4040', digit: '#6dff9c', glow: '#2fdc7a', lcd: 1 },
  mt_bar: { kind: 'digital', look: 'bar', bg: 'rgba(10,10,16,.85)', c1: '#3a8cff', c2: '#ffd040', c3: '#ff3030', digit: '#fff', glow: 0 },
  mt_retro: { kind: 'digital', look: 'bar', bg: '#120800', c1: '#ffb000', c2: '#ffb000', c3: '#ff5000', digit: '#ffb000', glow: '#ff9000', scan: 1, font: 'monospace' },
  mt_cyber: { kind: 'digital', look: 'ring', bg: '#0b0014', c1: '#00f0ff', c2: '#ff2bd6', c3: '#fff200', digit: '#fff', glow: '#ff2bd6', scan: 1 },
  mt_minimal: { kind: 'digital', look: 'thin', bg: 'rgba(0,0,0,.35)', c1: '#ffffff', c2: '#ffffff', c3: '#ff3030', digit: '#fff', glow: 0 },
  candy: { name: 'キャンディケイン', kind: 'analog', face: '#fff8f0', faceText: '#b0001a', tick: '#b0001a', num: '#b0001a', needle: '#0f7a3a', arc: ['#0f7a3a', '#2fdc7a'], bezel: 'candy', red: '#e10600', sub: '#0f7a3a', pattern: 'snow' },
  mt_snow: { kind: 'digital', look: 'ring', bg: '#0a1530', c1: '#bfe6ff', c2: '#ffffff', c3: '#ff5a5a', digit: '#ffffff', glow: '#9ad0ff', pattern: 'snow' },
  mt_champ: { kind: 'analog', face: '#0b0a05', tick: '#ffd700', num: '#fff', needle: '#ffd700', arc: 'rainbow', bezel: 'gold', red: '#ff3030', glow: '#ffd700', star: 1 },
  mt_holy: { kind: 'analog', face: '#08130e', tick: '#ffd76a', num: '#fff', needle: '#e10600', arc: ['#0f7a3a', '#e10600'], bezel: 'gold', red: '#e10600', glow: '#ffd76a', pattern: 'snow', star: 1 }
};
if (typeof GEN_METERS !== 'undefined') for (const [id, st] of GEN_METERS) METER_STYLES[id] = st;
METER_STYLES.mt_dia = { kind: 'analog', face: '#e8f4ff', faceText: '#123', tick: '#2a6aff', num: '#123', needle: '#00b0ff', arc: 'rainbow', bezel: 'rainbow', red: '#ff3a6a', glow: '#bfe9ff', star: 1, sub: '#456' };
METER_STYLES.mt_gold24 = { kind: 'analog', face: '#1a1200', tick: '#ffd700', num: '#ffe9a0', needle: '#fff', arc: ['#b8860b', '#fff2a0'], bezel: 'gold', red: '#ff4a2a', glow: '#ffd700', star: 1 };
for (const id in METER_STYLES) { const it = (typeof ITEM_BY_ID !== 'undefined') && ITEM_BY_ID[id]; if (!METER_STYLES[id].name) METER_STYLES[id].name = it ? it.name.replace(/^メーター「|」$/g, '') : id; }
// 所持判定
function meterOwned(id) { const m = METER_STYLES[id]; if (!m) return false; if (m.free) return true; if (id === 'candy') return hasItem('meter:candy'); return invHas(id); }
function meterRarity(id) { const it = ITEM_BY_ID[id]; return it ? it.rarity : id === 'candy' ? 'E' : null; }

let _carbonPat = null;
function carbonPattern(x) {
  if (!_carbonPat) { const c = document.createElement('canvas'); c.width = c.height = 8; const g = c.getContext('2d'); g.fillStyle = '#16171b'; g.fillRect(0, 0, 8, 8); g.fillStyle = '#26282e'; g.fillRect(0, 0, 4, 4); g.fillRect(4, 4, 4, 4); _carbonPat = c; }
  return x.createPattern(_carbonPat, 'repeat');
}
function rainbowGrad(x, cx, cy, t) {
  if (x.createConicGradient) { const g = x.createConicGradient(t || 0, cx, cy); ['#ff3b3b', '#ffb000', '#f0ff3b', '#3bff7a', '#3bc8ff', '#8a5bff', '#ff3bd0', '#ff3b3b'].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c)); return g; }
  const g = x.createLinearGradient(cx - 50, 0, cx + 50, 0); g.addColorStop(0, '#ff3b3b'); g.addColorStop(0.5, '#3bff7a'); g.addColorStop(1, '#3bc8ff'); return g;
}
function snowDeco(x, W, H, alpha) { x.save(); x.globalAlpha = alpha; x.strokeStyle = '#fff'; x.lineWidth = Math.max(1, W * 0.006); const r = mulberry32(7); for (let i = 0; i < 9; i++) { const px = r() * W, py = r() * H, s = W * (0.02 + r() * 0.03); x.beginPath(); for (let k = 0; k < 3; k++) { const a = k * PI / 3; x.moveTo(px - Math.cos(a) * s, py - Math.sin(a) * s); x.lineTo(px + Math.cos(a) * s, py + Math.sin(a) * s); } x.stroke(); } x.restore(); }

// メーター描画  d = { rpm, speed(m/s), redline, gear, limiter, auto, boost, turbo, nitro, t }
function drawMeter(x, W, H, id, d) {
  const M = METER_STYLES[id] || METER_STYLES.std; x.clearRect(0, 0, W, H);
  if (![d.rpm, d.speed, d.redline].every(isFinite)) return;
  if (id === 'std' || !METER_STYLES[id]) return drawMeterStd(x, W, H, d);
  return M.kind === 'digital' ? drawMeterDigital(x, W, H, M, d) : drawMeterAnalog(x, W, H, M, d);
}
function gearText(d) { return d.gear === 0 ? 'N' : d.gear === -1 ? 'R' : String(d.gear); }
function drawMeterStd(x, W, H, d) {
  const cx = W / 2, cy = H / 2, R = W * 0.44; const red = d.redline, max = Math.ceil((red + 1000) / 1000) * 1000;
  const a0 = PI * 0.75, a1 = PI * 2.25, ang = r => a0 + (a1 - a0) * clamp(r / max, 0, 1);
  x.fillStyle = 'rgba(0,0,0,.55)'; x.beginPath(); x.arc(cx, cy, R * 1.08, 0, TAU); x.fill();
  x.lineWidth = R * 0.07; x.strokeStyle = 'rgba(255,255,255,.12)'; x.beginPath(); x.arc(cx, cy, R * 0.92, a0, a1); x.stroke();
  x.strokeStyle = '#e10600'; x.beginPath(); x.arc(cx, cy, R * 0.92, ang(red), a1); x.stroke();
  const rg = x.createLinearGradient(0, 0, W, 0); rg.addColorStop(0, '#fff'); rg.addColorStop(1, d.rpm > red * 0.9 ? '#ff3030' : '#ffd040');
  x.strokeStyle = rg; x.beginPath(); x.arc(cx, cy, R * 0.92, a0, ang(d.rpm)); x.stroke();
  x.fillStyle = '#ccc'; x.font = `bold ${R * 0.13}px Orbitron`; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (let r = 0; r <= max; r += 1000) { const a = ang(r); x.fillText(r / 1000, cx + Math.cos(a) * R * 0.72, cy + Math.sin(a) * R * 0.72); x.strokeStyle = r >= red ? '#e10600' : '#fff'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx + Math.cos(a) * R * 0.82, cy + Math.sin(a) * R * 0.82); x.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); x.stroke(); }
  const a = ang(d.rpm); x.strokeStyle = '#ff2a2a'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * R * 0.95, cy + Math.sin(a) * R * 0.95); x.stroke();
  centerText(x, cx, cy, R, d, '#fff', '#aaa', d.limiter > 0 ? '#ff3030' : '#ffd040', '#888', 'Orbitron');
}
function centerText(x, cx, cy, R, d, cSpeed, cUnit, cGear, cSub, font) {
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = cSpeed; x.font = `900 ${R * 0.42}px ${font}`; x.fillText(Math.round(d.speed * 3.6), cx, cy + R * 0.05);
  x.font = `bold ${R * 0.12}px ${font}`; x.fillStyle = cUnit; x.fillText('km/h', cx, cy + R * 0.32);
  x.font = `900 ${R * 0.3}px ${font}`; x.fillStyle = cGear; x.fillText(gearText(d), cx, cy + R * 0.62);
  x.font = `bold ${R * 0.1}px ${font}`; x.fillStyle = cSub; x.fillText((d.auto ? 'AT' : 'MT') + ' ×1000rpm', cx, cy - R * 0.38);
  if (d.turbo) { x.fillStyle = '#5ad1ff'; x.fillText('BOOST ' + (d.boost * 1.2).toFixed(1), cx, cy - R * 0.24); }
  if (d.nitro) { x.fillStyle = '#5ad1ff'; x.font = `900 ${R * 0.14}px ${font}`; x.fillText('NITRO', cx, cy - R * 0.55); }
}
function drawMeterAnalog(x, W, H, M, d) {
  const cx = W / 2, cy = H / 2, R = W * 0.44; const red = d.redline, max = Math.ceil((red + 1000) / 1000) * 1000;
  const a0 = PI * 0.75, a1 = PI * 2.25, ang = r => a0 + (a1 - a0) * clamp(r / max, 0, 1); const t = d.t || 0;
  // 文字盤
  x.save(); x.beginPath(); x.arc(cx, cy, R * 1.06, 0, TAU); x.fillStyle = M.face === 'carbon' ? carbonPattern(x) : M.face; x.fill();
  const sh = x.createRadialGradient(cx, cy - R * 0.4, R * 0.1, cx, cy, R * 1.1); sh.addColorStop(0, 'rgba(255,255,255,.12)'); sh.addColorStop(1, 'rgba(0,0,0,.35)'); x.fillStyle = sh; x.fill();
  x.clip(); if (M.pattern === 'snow') snowDeco(x, W, H, 0.18); if (M.pattern === 'sakura') { x.fillStyle = 'rgba(255,183,213,.18)'; const r = mulberry32(3); for (let i = 0; i < 10; i++) { x.beginPath(); x.ellipse(r() * W, r() * H, W * 0.03, W * 0.018, r() * 3, 0, TAU); x.fill(); } }
  x.restore();
  // ベゼル
  x.lineWidth = R * 0.08; x.strokeStyle = M.bezel === 'rainbow' ? rainbowGrad(x, cx, cy, t) : M.bezel === 'gold' ? (() => { const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#fff2b0'); g.addColorStop(0.5, '#b8860b'); g.addColorStop(1, '#ffe08a'); return g; })() : M.bezel === 'candy' ? '#fff' : M.bezel;
  x.beginPath(); x.arc(cx, cy, R * 1.06, 0, TAU); x.stroke();
  if (M.bezel === 'candy') { x.strokeStyle = '#d0001e'; x.setLineDash([R * 0.18, R * 0.18]); x.beginPath(); x.arc(cx, cy, R * 1.06, t * 0.3, t * 0.3 + TAU); x.stroke(); x.setLineDash([]); }
  // 回転弧
  if (M.arc) {
    x.lineWidth = R * 0.07; x.strokeStyle = 'rgba(255,255,255,.08)'; x.beginPath(); x.arc(cx, cy, R * 0.9, a0, a1); x.stroke();
    let st; if (M.arc === 'rainbow') st = rainbowGrad(x, cx, cy, t); else { st = x.createLinearGradient(0, H, W, 0); st.addColorStop(0, M.arc[0]); st.addColorStop(1, M.arc[1]); }
    if (M.glow) { x.shadowColor = M.glow; x.shadowBlur = R * 0.15; }
    x.strokeStyle = st; x.beginPath(); x.arc(cx, cy, R * 0.9, a0, ang(d.rpm)); x.stroke(); x.shadowBlur = 0;
  }
  x.lineWidth = R * 0.05; x.strokeStyle = M.red; x.beginPath(); x.arc(cx, cy, R * 0.98, ang(red), a1); x.stroke();
  // 目盛り
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `bold ${R * 0.13}px Orbitron`;
  for (let r = 0; r <= max; r += 500) { const a = ang(r), big = r % 1000 === 0; x.strokeStyle = r >= red ? M.red : M.tick; x.lineWidth = big ? 2.5 : 1.2; const r0 = big ? 0.8 : 0.86; x.beginPath(); x.moveTo(cx + Math.cos(a) * R * r0, cy + Math.sin(a) * R * r0); x.lineTo(cx + Math.cos(a) * R * 0.97, cy + Math.sin(a) * R * 0.97); x.stroke(); if (big) { x.fillStyle = r >= red ? M.red : M.num; x.fillText(r / 1000, cx + Math.cos(a) * R * 0.68, cy + Math.sin(a) * R * 0.68); } }
  if (M.star) { x.fillStyle = '#ffd76a'; x.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? R * 0.05 : R * 0.12, a = k / 10 * TAU - PI / 2; x.lineTo(cx + Math.cos(a) * rr, cy - R * 0.74 + Math.sin(a) * rr); } x.fill(); }
  // 針
  const a = ang(d.rpm); if (M.glow) { x.shadowColor = M.needle; x.shadowBlur = R * 0.1; }
  x.strokeStyle = M.needle; x.lineWidth = R * 0.035; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx - Math.cos(a) * R * 0.12, cy - Math.sin(a) * R * 0.12); x.lineTo(cx + Math.cos(a) * R * 0.94, cy + Math.sin(a) * R * 0.94); x.stroke(); x.shadowBlur = 0; x.lineCap = 'butt';
  x.fillStyle = M.needle; x.beginPath(); x.arc(cx, cy, R * 0.06, 0, TAU); x.fill();
  const txt = M.faceText || '#fff';
  centerText(x, cx, cy, R, d, txt, M.sub || 'rgba(255,255,255,.6)', d.limiter > 0 ? M.red : (M.faceText ? M.needle : '#ffd040'), M.sub || 'rgba(255,255,255,.5)', 'Orbitron');
}
function drawMeterDigital(x, W, H, M, d) {
  const red = d.redline, max = Math.ceil((red + 1000) / 1000) * 1000, f = clamp(d.rpm / max, 0, 1), font = M.font || 'Orbitron';
  const col = r => r >= red * 0.98 ? M.c3 : r > red * 0.75 ? M.c2 : M.c1;
  x.save(); const pad = W * 0.04; const rr = W * 0.08;
  x.fillStyle = M.bg; x.beginPath(); if (x.roundRect) x.roundRect(pad, pad, W - pad * 2, H - pad * 2, rr); else x.rect(pad, pad, W - pad * 2, H - pad * 2); x.fill();
  x.strokeStyle = M.glow || 'rgba(255,255,255,.25)'; x.lineWidth = Math.max(1.5, W * 0.01); x.stroke(); x.clip();
  if (M.pattern === 'snow') snowDeco(x, W, H, 0.25);
  x.textAlign = 'center'; x.textBaseline = 'middle';
  if (M.look === 'ring') {
    const cx = W / 2, cy = H / 2, R = W * 0.4, a0 = PI * 0.75, a1 = PI * 2.25, n = 30;
    for (let i = 0; i < n; i++) { const r = (i + 0.5) / n * max, on = (i + 0.5) / n <= f, aa = a0 + (a1 - a0) * i / n, ab = a0 + (a1 - a0) * (i + 0.75) / n; x.strokeStyle = on ? col(r) : 'rgba(255,255,255,.08)'; if (on && M.glow) { x.shadowColor = col(r); x.shadowBlur = W * 0.04; } x.lineWidth = R * 0.14; x.beginPath(); x.arc(cx, cy, R, aa, ab); x.stroke(); x.shadowBlur = 0; }
    digits(x, W, H, M, d, font, cx, cy + H * 0.02, W * 0.26);
  } else if (M.look === 'thin') {
    const cx = W / 2, cy = H / 2, R = W * 0.4; x.lineWidth = W * 0.012; x.strokeStyle = 'rgba(255,255,255,.2)'; x.beginPath(); x.arc(cx, cy, R, PI * 0.75, PI * 2.25); x.stroke();
    x.strokeStyle = col(d.rpm); x.lineWidth = W * 0.022; x.beginPath(); x.arc(cx, cy, R, PI * 0.75, PI * 0.75 + PI * 1.5 * f); x.stroke();
    digits(x, W, H, M, d, font, cx, cy, W * 0.3);
  } else { // bar
    const n = 16, bx = W * 0.12, bw = W * 0.76, by = H * 0.18, bh = H * 0.12, gw = bw / n;
    for (let i = 0; i < n; i++) { const r = (i + 0.5) / n * max, on = (i + 0.5) / n <= f; const hh = bh * (0.55 + 0.45 * i / n); x.fillStyle = on ? col(r) : 'rgba(255,255,255,.07)'; if (on && M.glow) { x.shadowColor = col(r); x.shadowBlur = W * 0.04; } x.fillRect(bx + i * gw + 1, by + bh - hh, gw - 2, hh); x.shadowBlur = 0; }
    x.font = `bold ${W * 0.055}px ${font}`; x.fillStyle = M.digit; x.globalAlpha = 0.7; x.fillText('RPM ×1000  ' + (d.rpm / 1000).toFixed(1), W / 2, by + bh + H * 0.06); x.globalAlpha = 1;
    digits(x, W, H, M, d, font, W / 2, H * 0.6, W * 0.27);
  }
  if (M.scan) { x.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < H; y += 3) x.fillRect(0, y, W, 1); }
  x.restore();
}
function digits(x, W, H, M, d, font, cx, cy, size) {
  if (M.glow) { x.shadowColor = M.glow; x.shadowBlur = size * 0.25; }
  if (M.lcd) { x.fillStyle = 'rgba(109,255,156,.12)'; x.font = `900 ${size}px ${font}`; x.fillText('8'.repeat(String(Math.round(d.speed * 3.6)).length), cx, cy); }
  x.fillStyle = M.digit; x.font = `900 ${size}px ${font}`; x.fillText(Math.round(d.speed * 3.6), cx, cy); x.shadowBlur = 0;
  x.font = `bold ${size * 0.26}px ${font}`; x.globalAlpha = 0.75; x.fillText('km/h', cx, cy + size * 0.55); x.globalAlpha = 1;
  x.font = `900 ${size * 0.5}px ${font}`; x.fillStyle = d.limiter > 0 ? M.c3 : M.c2; x.fillText(gearText(d), cx + size * 1.05, cy + size * 0.1);
  x.font = `bold ${size * 0.2}px ${font}`; x.fillStyle = M.digit; x.globalAlpha = 0.6; x.fillText(d.auto ? 'AT' : 'MT', cx - size * 1.05, cy + size * 0.1); x.globalAlpha = 1;
  if (d.nitro) { x.fillStyle = '#5ad1ff'; x.font = `900 ${size * 0.28}px ${font}`; x.fillText('NITRO', cx, cy - size * 0.75); }
  else if (d.turbo) { x.fillStyle = '#5ad1ff'; x.font = `bold ${size * 0.2}px ${font}`; x.fillText('BOOST ' + (d.boost * 1.2).toFixed(1), cx, cy - size * 0.72); }
}
// プレビュー画像（アイコン・選択画面用）
const _meterCache = {};
function meterPreview(id, size) {
  if (!_meterCache[id]) { const c = document.createElement('canvas'); c.width = c.height = 160; try { drawMeter(c.getContext('2d'), 160, 160, id, { rpm: 6200, speed: 38.9, redline: 7800, gear: 4, limiter: 0, auto: true, boost: 0, turbo: false, nitro: false, t: 0.5 }); } catch (e) { } _meterCache[id] = c.toDataURL(); }
  return `<img src="${_meterCache[id]}" width="${size}" height="${size}" style="vertical-align:middle" alt="">`;
}
