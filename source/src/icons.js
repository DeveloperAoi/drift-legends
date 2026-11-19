// ============ オリジナルアイコン（SVG） ============
let _icoN = 0;
const ICO_PATHS = {
  shop: `<path d="M8 20h32v20H8z" fill="#1a1c22" stroke="currentColor" stroke-width="2.5"/><path d="M6 10h36l3 10H3z" fill="currentColor"/><path d="M11 10l-2 10M19 10l-1 10M29 10l1 10M37 10l2 10" stroke="#111" stroke-width="3" opacity=".35"/><path d="M14 40V28h9v12" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M28 27h8v6h-8z" fill="currentColor" opacity=".6"/>`,
  collection: `<rect x="13" y="6" width="22" height="30" rx="3" fill="currentColor" opacity=".35" transform="rotate(10 24 21)"/><rect x="13" y="8" width="22" height="30" rx="3" fill="currentColor" opacity=".6" transform="rotate(-6 24 23)"/><rect x="12" y="11" width="24" height="32" rx="3" fill="#1a1c22" stroke="currentColor" stroke-width="2.5"/><path d="M24 19l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="currentColor"/>`,
  image: `<rect x="5" y="9" width="38" height="30" rx="3" fill="#1a1c22" stroke="currentColor" stroke-width="2.5"/><circle cx="33" cy="18" r="3.5" fill="currentColor"/><path d="M7 36l11-13 8 9 5-5 10 9z" fill="currentColor" opacity=".8"/>`,
  lock: `<path d="M15 21v-5a9 9 0 0118 0v5" fill="none" stroke="currentColor" stroke-width="4"/><rect x="10" y="21" width="28" height="21" rx="3" fill="currentColor"/><circle cx="24" cy="30" r="3" fill="#111"/><path d="M23 31h2v6h-2z" fill="#111"/>`,
  trophy: `<path d="M14 7h20v10a10 10 0 01-20 0z" fill="currentColor"/><path d="M14 10H7c0 7 4 10 8 10M34 10h7c0 7-4 10-8 10" fill="none" stroke="currentColor" stroke-width="3"/><path d="M21 26h6v7h-6z" fill="currentColor"/><path d="M14 35h20v6H14z" fill="currentColor"/><path d="M19 11v8" stroke="#fff" stroke-width="2.5" opacity=".5"/>`,
  gem: `<path d="M12 8h24l8 11-20 23L4 19z" fill="currentColor"/><path d="M4 19h40M12 8l6 11 6-11 6 11 6-11M18 19l6 23 6-23" fill="none" stroke="#111" stroke-width="1.6" opacity=".45"/>`,
  wrench: `<path d="M30 5a10 10 0 00-9 14L6 34a4 4 0 006 6l15-15a10 10 0 0014-9l-6 4-6-2-2-6 6-6c-1 0-2-1-3-1z" fill="currentColor"/>`,
  gear: `<path d="M21 4h6l1 5 4 2 4-3 4 4-3 4 2 4 5 1v6l-5 1-2 4 3 4-4 4-4-3-4 2-1 5h-6l-1-5-4-2-4 3-4-4 3-4-2-4-5-1v-6l5-1 2-4-3-4 4-4 4 3 4-2z" fill="currentColor"/><circle cx="24" cy="24" r="7" fill="#1a1c22"/>`,
  engine: `<path d="M8 18h6l3-4h12l2 4h5v5h4v-4h3v14h-3v-4h-4v6l-5 5H17l-4-5H8z" fill="currentColor"/><path d="M20 7h8v7h-8z" fill="currentColor" opacity=".7"/><path d="M4 22h4v8H4z" fill="currentColor"/><path d="M27 21l-6 8h5l-3 6 7-9h-5z" fill="#1a1c22"/>`,
  turbo: `<circle cx="22" cy="26" r="15" fill="currentColor"/><circle cx="22" cy="26" r="8" fill="#1a1c22"/><path d="M22 18v8l6 5M22 26l-7 3M22 26l1-8" stroke="currentColor" stroke-width="2.5"/><path d="M33 16h11v8H35" fill="currentColor"/>`,
  chip: `<rect x="12" y="12" width="24" height="24" rx="3" fill="currentColor"/><rect x="18" y="18" width="12" height="12" fill="#1a1c22"/><path d="M17 5v7M24 5v7M31 5v7M17 36v7M24 36v7M31 36v7M5 17h7M5 24h7M5 31h7M36 17h7M36 24h7M36 31h7" stroke="currentColor" stroke-width="3"/>`,
  drive: `<circle cx="16" cy="18" r="10" fill="currentColor"/><circle cx="16" cy="18" r="4" fill="#1a1c22"/><circle cx="32" cy="32" r="12" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="4 3.2"/><circle cx="32" cy="32" r="6" fill="currentColor"/>`,
  susp: `<path d="M24 3v8M24 37v8" stroke="currentColor" stroke-width="4"/><path d="M16 11h16v4H16zM16 33h16v4H16z" fill="currentColor"/><path d="M17 15l14 3-14 3 14 3-14 3 14 3-14 3" fill="none" stroke="currentColor" stroke-width="3"/>`,
  brake: `<circle cx="22" cy="26" r="16" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="22" cy="26" r="5" fill="currentColor"/><g fill="currentColor"><circle cx="22" cy="15" r="1.6"/><circle cx="12" cy="29" r="1.6"/><circle cx="30" cy="33" r="1.6"/></g><path d="M30 6c10 3 15 12 13 22l-8-2c1-6-2-11-8-13z" fill="currentColor" opacity=".85"/>`,
  tire: `<circle cx="24" cy="24" r="19" fill="currentColor"/><circle cx="24" cy="24" r="11" fill="#1a1c22"/><circle cx="24" cy="24" r="4" fill="currentColor"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.5 10.5l4 4M33.5 33.5l4 4M37.5 10.5l-4 4M14.5 33.5l-4 4" stroke="#1a1c22" stroke-width="2.5"/>`,
  sliders: `<path d="M10 6v36M24 6v36M38 6v36" stroke="currentColor" stroke-width="3" opacity=".5"/><rect x="5" y="26" width="10" height="7" rx="2" fill="currentColor"/><rect x="19" y="12" width="10" height="7" rx="2" fill="currentColor"/><rect x="33" y="30" width="10" height="7" rx="2" fill="currentColor"/>`,
  spray: `<rect x="14" y="16" width="16" height="27" rx="3" fill="currentColor"/><path d="M17 10h10v6H17z" fill="currentColor" opacity=".7"/><path d="M19 6h6v4h-6z" fill="currentColor"/><g fill="currentColor" opacity=".7"><circle cx="33" cy="6" r="1.5"/><circle cx="37" cy="9" r="1.5"/><circle cx="34" cy="12" r="1.5"/><circle cx="40" cy="5" r="1.5"/></g><path d="M17 22h10" stroke="#fff" stroke-width="2" opacity=".5"/>`,
  flag: `<path d="M8 4v40" stroke="currentColor" stroke-width="3"/><path d="M10 6h30v22H10z" fill="#1a1c22" stroke="currentColor" stroke-width="2"/><path d="M10 6h7.5v5.5H10zM25 6h7.5v5.5H25zM17.5 11.5H25V17h-7.5zM32.5 11.5H40V17h-7.5zM10 17h7.5v5.5H10zM25 17h7.5v5.5H25zM17.5 22.5H25V28h-7.5zM32.5 22.5H40V28h-7.5z" fill="currentColor"/>`,
  sticker: `<path d="M8 8h32v20L28 40H8z" fill="currentColor"/><path d="M40 28H31a3 3 0 00-3 3v9z" fill="#fff" opacity=".55"/><path d="M15 17l4 9 3-6 3 6 5-9" fill="none" stroke="#1a1c22" stroke-width="3" stroke-linejoin="round"/>`,
  carFront: `<path d="M6 30l3-10 6-8h18l6 8 3 10v8h-5v4h-6v-4H17v4h-6v-4H6z" fill="currentColor"/><path d="M14 20l4-5h12l4 5z" fill="#1a1c22"/><rect x="8" y="25" width="8" height="4" rx="1" fill="#1a1c22"/><rect x="32" y="25" width="8" height="4" rx="1" fill="#1a1c22"/><path d="M18 32h12" stroke="#1a1c22" stroke-width="2.5"/>`,
  carSide: `<path d="M3 30v-5l7-2 8-8h13l8 8 6 2v5z" fill="currentColor"/><path d="M19 17l-5 6h9v-6zM26 17v6h10l-5-6z" fill="#1a1c22"/><circle cx="13" cy="31" r="5" fill="#1a1c22" stroke="currentColor" stroke-width="2.5"/><circle cx="36" cy="31" r="5" fill="#1a1c22" stroke="currentColor" stroke-width="2.5"/>`,
  wing: `<path d="M4 14h40v6H4z" fill="currentColor"/><path d="M4 12h4v12H4zM40 12h4v12h-4z" fill="currentColor"/><path d="M14 20l-2 14h6l2-14zM34 20l2 14h-6l-2-14z" fill="currentColor" opacity=".7"/><path d="M6 36h36v5H6z" fill="currentColor" opacity=".5"/>`,
  neon: `<path d="M4 26v-5l7-2 7-7h12l7 7 7 2v5z" fill="currentColor"/><circle cx="13" cy="27" r="4.5" fill="#1a1c22" stroke="currentColor" stroke-width="2"/><circle cx="35" cy="27" r="4.5" fill="#1a1c22" stroke="currentColor" stroke-width="2"/><ellipse cx="24" cy="38" rx="20" ry="4" fill="currentColor" opacity=".55"/><ellipse cx="24" cy="38" rx="12" ry="2.2" fill="#fff" opacity=".7"/>`,
  window: `<path d="M6 34l6-20h24l6 20z" fill="#1a1c22" stroke="currentColor" stroke-width="3"/><path d="M14 30l4-12h4l-4 12zM24 30l4-12h2l-4 12z" fill="currentColor" opacity=".6"/><rect x="14" y="38" width="20" height="6" rx="1" fill="currentColor"/>`,
  tree: `<path d="M24 3l9 12h-5l9 11h-6l9 12H8l9-12h-6l9-11h-5z" fill="currentColor"/><path d="M21 38h6v7h-6z" fill="#8a5a2a"/><circle cx="19" cy="22" r="1.8" fill="#ffd400"/><circle cx="29" cy="30" r="1.8" fill="#ff4040"/><circle cx="25" cy="15" r="1.6" fill="#40c0ff"/>`,
  gift: `<rect x="6" y="18" width="36" height="8" fill="currentColor"/><rect x="9" y="26" width="30" height="17" fill="currentColor" opacity=".8"/><path d="M21 18h6v25h-6z" fill="#fff" opacity=".85"/><path d="M24 18c-4-8-12-9-12-4s8 4 12 4c4 0 12 1 12-4s-8-4-12 4z" fill="none" stroke="currentColor" stroke-width="3"/>`,
  sun: `<circle cx="24" cy="24" r="9" fill="currentColor"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M38 10l-4 4M14 34l-4 4" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>`,
  rain: `<path d="M12 28a8 8 0 010-16 11 11 0 0121-2 8 8 0 013 18z" fill="currentColor"/><path d="M16 33l-3 8M25 33l-3 8M34 33l-3 8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
  snow: `<path d="M24 4v40M7 14l34 20M7 34l34-20" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path d="M19 7l5 5 5-5M19 41l5-5 5 5M7 20l7-2-2-7M41 28l-7 2 2 7M7 28l7 2-2 7M41 20l-7-2 2-7" fill="none" stroke="currentColor" stroke-width="2.5"/>`,
  fog: `<path d="M6 16h30M10 24h34M4 32h28M14 40h26" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
  feather: `<path d="M40 6C24 6 10 18 10 34l-4 8 3 1 4-8c16 0 27-14 27-29z" fill="currentColor"/><path d="M12 38L32 14" stroke="#1a1c22" stroke-width="2"/>`,
  nitro: `<rect x="14" y="12" width="20" height="32" rx="7" fill="currentColor"/><path d="M20 4h8v8h-8z" fill="currentColor" opacity=".75"/><path d="M14 22h20v8H14z" fill="#1a1c22" opacity=".5"/><text x="24" y="29" font-size="7" font-family="Orbitron,Arial" font-weight="900" text-anchor="middle" fill="#fff">NOS</text>`,
  gauge: `<path d="M6 34a18 18 0 1136 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M10 34h4M34 34h4M24 12v4M13 19l3 3M35 19l-3 3" stroke="currentColor" stroke-width="2.5"/><path d="M24 34l9-12" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><circle cx="24" cy="34" r="3.5" fill="currentColor"/><rect x="16" y="38" width="16" height="6" rx="1.5" fill="currentColor" opacity=".6"/>`,
  clock: `<circle cx="24" cy="26" r="17" fill="none" stroke="currentColor" stroke-width="4"/><path d="M24 15v11l7 5" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M19 4h10v4H19z" fill="currentColor"/><path d="M38 9l4 4" stroke="currentColor" stroke-width="4"/>`,
  mountain: `<path d="M2 42l14-24 7 10 7-14 16 28z" fill="currentColor"/><path d="M30 14l-4 8 4-2 4 3z" fill="#fff" opacity=".8"/><path d="M8 42c6-6 10-4 14-8s8-4 10-10" fill="none" stroke="#1a1c22" stroke-width="2.5" stroke-dasharray="3 2"/>`,
  globe: `<circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M5 24h38M24 5c-7 6-7 32 0 38M24 5c7 6 7 32 0 38M9 14h30M9 34h30" fill="none" stroke="currentColor" stroke-width="2.5"/>`,
  calendar: `<rect x="5" y="9" width="38" height="34" rx="4" fill="currentColor"/><rect x="5" y="9" width="38" height="9" rx="3" fill="#1a1c22" opacity=".35"/><path d="M14 4v9M34 4v9" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><g fill="#1a1c22"><rect x="10" y="22" width="6" height="5"/><rect x="21" y="22" width="6" height="5"/><rect x="32" y="22" width="6" height="5"/><rect x="10" y="32" width="6" height="5"/><rect x="21" y="32" width="6" height="5"/></g><path d="M35 31l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z" fill="#fff"/>`,
  garage: `<path d="M4 20L24 6l20 14v22H4z" fill="currentColor"/><rect x="10" y="22" width="28" height="20" fill="#1a1c22"/><path d="M10 26h28M10 30h28M10 34h28" stroke="currentColor" stroke-width="1.5" opacity=".5"/><path d="M13 40v-3l3-1 3-3h10l3 3 3 1v3z" fill="currentColor"/>`,
  music: `<path d="M18 36V10l22-5v26" fill="none" stroke="currentColor" stroke-width="3.5"/><ellipse cx="13" cy="37" rx="6" ry="5" fill="currentColor"/><ellipse cx="35" cy="32" rx="6" ry="5" fill="currentColor"/>`,
  coin: `<circle cx="24" cy="24" r="18" fill="currentColor"/><circle cx="24" cy="24" r="13" fill="none" stroke="#1a1c22" stroke-width="2" opacity=".4"/><path d="M17 14l7 10 7-10M24 24v12M18 25h12M18 30h12" fill="none" stroke="#1a1c22" stroke-width="3"/>`
};
// アイコン: ICO('shop', '#ffcf3d', 22)
function ICO(name, color, size = 22, extra = '') {
  const p = ICO_PATHS[name] || ICO_PATHS.gem;
  return `<svg class="ico" viewBox="0 0 48 48" width="${size}" height="${size}" style="color:${color || 'currentColor'};vertical-align:middle;flex:0 0 auto${extra}" aria-hidden="true">${p}</svg>`;
}
// 宝箱（カードパック）アイコン：色ごとにグラデーションと宝石
function chestIcon(c, size = 44) {
  const id = 'cg' + (++_icoN), col = c.color, gem = { free: '#7dffb0', bronze: '#ff9a4a', silver: '#9ad0ff', gold: '#ff3a3a', legend: '#ffd400' }[c.id] || '#fff';
  return `<svg class="ico" viewBox="0 0 64 64" width="${size}" height="${size}" style="flex:0 0 auto"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
    <radialGradient id="${id}g"><stop offset="0" stop-color="${gem}" stop-opacity=".9"/><stop offset="1" stop-color="${gem}" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="32" cy="58" rx="24" ry="3.5" fill="#000" opacity=".45"/>
    <path d="M8 26h48v28a3 3 0 01-3 3H11a3 3 0 01-3-3z" fill="${col}"/><path d="M8 26h48v28a3 3 0 01-3 3H11a3 3 0 01-3-3z" fill="url(#${id})"/>
    <path d="M8 26c0-12 8-18 24-18s24 6 24 18z" fill="${col}"/><path d="M12 22c2-7 9-10 20-10" stroke="#fff" stroke-width="2.5" fill="none" opacity=".45" stroke-linecap="round"/>
    <path d="M8 26h48v5H8z" fill="#1a1c22" opacity=".55"/>
    <path d="M18 8.8v48M46 8.8v48" stroke="#1a1c22" stroke-width="4" opacity=".4"/>
    <circle cx="32" cy="32" r="13" fill="url(#${id}g)"/>
    <path d="M26 26h12v12l-6 5-6-5z" fill="#1a1c22"/><path d="M32 29l4 4-4 5-4-5z" fill="${gem}"/>
    ${c.id === 'legend' ? `<path d="M22 8l3-6 4 5 3-6 3 6 4-5 3 6z" fill="#ffd400"/>` : ''}${c.daily ? `<path d="M30 8h4v18h-4zM8 40h48v4H8z" fill="#fff" opacity=".8"/>` : ''}</svg>`;
}
// デカールのプレビュー画像（実際の貼り付けと同じ描画）
const _decalCache = {};
function decalPreview(it, size) {
  if (!_decalCache[it.id]) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 96; const g = cv.getContext('2d'); g.translate(48, 48);
    try {
      if (it.kind === 'text') { const t = it.text, big = t.length <= 2; g.font = `900 ${big ? 46 : Math.max(14, 130 / t.length)}px ${it.font === 'serif' ? 'serif' : 'Arial Black, Arial'}`; const w = Math.min(88, g.measureText(t).width + 16), h = big ? 64 : 36;
        g.fillStyle = it.bg; g.beginPath(); g.roundRect ? g.roundRect(-w / 2, -h / 2, w, h, 6) : g.rect(-w / 2, -h / 2, w, h); g.fill(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.stroke();
        g.fillStyle = it.fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, 0, 2, 80); }
      else { g.scale(2.3, 2.3); drawShape(g, it.shape, it.color); }
    } catch (e) { }
    _decalCache[it.id] = cv.toDataURL();
  }
  return `<img src="${_decalCache[it.id]}" width="${size}" height="${size}" style="vertical-align:middle" alt="">`;
}
// ホイールアイコン（スポーク数・リム色を反映）
function wheelIcon(it, size) {
  const n = it.spokes || 6, col = it.rim || '#ccc'; let sp = '';
  for (let k = 0; k < n; k++) { const a = k / n * 360; sp += `<path d="M22.5 24h3l1 -13h-5z" fill="${col}" transform="rotate(${a} 24 24)"/>`; }
  return `<svg class="ico" viewBox="0 0 48 48" width="${size}" height="${size}"><circle cx="24" cy="24" r="22" fill="#151517"/><circle cx="24" cy="24" r="16.5" fill="#2a2c30" stroke="${col}" stroke-width="${it.deep ? 3.5 : 2}"/>${sp}<circle cx="24" cy="24" r="4.5" fill="${col}"/><circle cx="24" cy="24" r="1.8" fill="#151517"/></svg>`;
}
function paintIcon(it, size) {
  const id = 'pg' + (++_icoN), c = it.color, gl = { chrome: 0.95, pearl: 0.7, candy: 0.8, gloss: 0.6, metallic: 0.5, matte: 0.12 }[it.paint] || 0.5;
  return `<svg class="ico" viewBox="0 0 48 48" width="${size}" height="${size}"><defs><radialGradient id="${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity="${gl}"/><stop offset=".35" stop-color="${c}"/><stop offset="1" stop-color="#000"/></radialGradient></defs><circle cx="24" cy="24" r="19" fill="${c}"/><circle cx="24" cy="24" r="19" fill="url(#${id})" stroke="rgba(255,255,255,.6)" stroke-width="1.5"/></svg>`;
}
function caliperIcon(it, size) {
  return `<svg class="ico" viewBox="0 0 48 48" width="${size}" height="${size}"><circle cx="22" cy="26" r="17" fill="#3a3c42"/><circle cx="22" cy="26" r="14" fill="none" stroke="#60636a" stroke-width="1" stroke-dasharray="2 3"/><circle cx="22" cy="26" r="5" fill="#1a1c22"/><path d="M28 6c10 3 16 12 14 23l-9-2c1-6-2-11-7-13z" fill="${it.color}" stroke="#111" stroke-width="1.5"/><path d="M33 13l4 3" stroke="#fff" stroke-width="2" opacity=".6"/></svg>`;
}
function neonIcon(it, size) {
  const c = it.rainbow ? 'url(#rbw' + (++_icoN) + ')' : `rgb(${it.rgb.map(v => Math.round(v * 255)).join(',')})`;
  const defs = it.rainbow ? `<defs><linearGradient id="rbw${_icoN}"><stop offset="0" stop-color="#f33"/><stop offset=".33" stop-color="#ff3"/><stop offset=".66" stop-color="#3f9"/><stop offset="1" stop-color="#39f"/></linearGradient></defs>` : '';
  return `<svg class="ico" viewBox="0 0 48 48" width="${size}" height="${size}">${defs}<ellipse cx="24" cy="36" rx="22" ry="7" fill="${c}" opacity=".5"/><ellipse cx="24" cy="36" rx="15" ry="3.5" fill="${c}"/><path d="M4 30v-5l7-2 7-7h12l7 7 7 2v5z" fill="#2a2c32" stroke="#555" stroke-width="1"/><path d="M19 17l-4 6h8v-6zM25 17v6h8l-4-6z" fill="#111"/><circle cx="13" cy="31" r="4.5" fill="#111"/><circle cx="35" cy="31" r="4.5" fill="#111"/></svg>`;
}
function bgIcon(it, size) {
  const T = BG_THEMES[it.bg] || BG_THEMES.garage, h = v => '#' + v.map(x => Math.round(Math.min(1, x) * 255).toString(16).padStart(2, '0')).join(''); const id = 'bg' + (++_icoN);
  const s = T.strip[0], fxc = { petal: '#ffb7d5', snow: '#fff', star: '#fff', firefly: '#d0ff60', ember: '#ff7020', bubble: '#90e8ff', confetti: '#ffd040', leaf: '#ff8030' }[T.fx];
  let dots = ''; if (fxc) for (let k = 0; k < 7; k++) dots += `<circle cx="${6 + (k * 37) % 38}" cy="${8 + (k * 23) % 22}" r="1.3" fill="${fxc}"/>`;
  return `<svg class="ico" viewBox="0 0 48 48" width="${size}" height="${size}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${h(T.zen)}"/><stop offset="1" stop-color="${h(T.hor)}"/></linearGradient></defs><rect x="3" y="6" width="42" height="36" rx="3" fill="url(#${id})"/><path d="M3 30h42v9a3 3 0 01-3 3H6a3 3 0 01-3-3z" fill="${h(T.floor.map(v => v * 2.2))}"/><path d="M3 29h42" stroke="${h(s)}" stroke-width="2"/>${dots}<path d="M15 34l2-4h12l3 4z" fill="#ddd" opacity=".85"/><rect x="3" y="6" width="42" height="36" rx="3" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.5"/></svg>`;
}
function tuneIcon(it, size) {
  const f = it.fx || {}; const col = RARITY[it.rarity].color;
  const k = f.nitro ? 'nitro' : f.slide || f.steer ? 'drive' : f.lsd ? 'gear' : f.mass && !f.hp ? 'feather' : f.grip && !f.hp ? 'tire' : f.lag ? 'turbo' : f.hp >= 1.1 ? 'engine' : f.hp ? 'chip' : 'wrench';
  return ICO(k, col, size);
}
function legendCarIcon(it, size) {
  const id = 'lc' + (++_icoN), col = RARITY[it.rarity].color;
  return `<svg class="ico" viewBox="0 0 48 48" width="${size}" height="${size}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="${col}"/><stop offset="1" stop-color="#5a3a00"/></linearGradient></defs><path d="M2 33v-4l7-3 11-7h10l10 7 6 1.5V33z" fill="url(#${id})"/><path d="M20 21l-6 5h10v-5zM26 21v5h11l-6-5z" fill="#111"/><path d="M40 26h6v-4l-6 1z" fill="${col}"/><path d="M2 27h44" stroke="#fff" stroke-width="1" opacity=".5"/><circle cx="12" cy="33" r="5" fill="#111" stroke="${col}" stroke-width="2"/><circle cx="36" cy="33" r="5" fill="#111" stroke="${col}" stroke-width="2"/><path d="M38 4l1.5 4.5L44 10l-4.5 1.5L38 16l-1.5-4.5L32 10l4.5-1.5z" fill="#fff"/><path d="M12 9l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill="${col}"/></svg>`;
}
function plateIcon(it, size) {
  const id = 'pl' + (++_icoN); const c = it.rainbow ? `url(#${id})` : `rgb(${it.rgb.map(v => Math.round(v * 255)).join(',')})`;
  const defs = it.rainbow ? `<defs><linearGradient id="${id}"><stop offset="0" stop-color="${it.aurora ? '#3bff9a' : '#f33'}"/><stop offset=".5" stop-color="${it.aurora ? '#3bc8ff' : '#3f9'}"/><stop offset="1" stop-color="${it.aurora ? '#b05bff' : '#39f'}"/></linearGradient></defs>` : '';
  return `<svg class="ico" viewBox="0 0 48 48" width="${size}" height="${size}">${defs}<rect x="5" y="14" width="38" height="20" rx="3" fill="none" stroke="${c}" stroke-width="3.5" style="filter:drop-shadow(0 0 3px ${it.rainbow ? '#fff' : c})"/><rect x="9" y="18" width="30" height="12" rx="1.5" fill="#f4f4ee"/><text x="24" y="27.5" font-size="8" font-family="Orbitron,Arial" font-weight="900" text-anchor="middle" fill="#123">86-86</text></svg>`;
}
function medalIcon(k, size) {
  const c = { g: ['#fff3a0', '#ffd700', '#b8860b'], s: ['#ffffff', '#c8ccd4', '#7a7f88'], b: ['#ffd0a0', '#cd7f32', '#7a4a1a'] }[k] || ['#fff', '#aaa', '#555']; const id = 'md' + (++_icoN);
  return `<svg class="ico" viewBox="0 0 48 48" width="${size}" height="${size}"><defs><radialGradient id="${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></radialGradient></defs><path d="M14 2h8l4 12h-8zM34 2h-8l-4 12h8z" fill="${k === 'g' ? '#c8102e' : k === 's' ? '#1e5aff' : '#2f8a55'}"/><circle cx="24" cy="30" r="15" fill="url(#${id})" stroke="${c[2]}" stroke-width="2"/><circle cx="24" cy="30" r="10.5" fill="none" stroke="${c[2]}" stroke-width="1.2" opacity=".6"/><text x="24" y="35" font-size="13" font-family="Orbitron,Arial" font-weight="900" text-anchor="middle" fill="${c[2]}">${{ g: 1, s: 2, b: 3 }[k] || ''}</text></svg>`;
}
function extraIcon(e, size) {
  const c = e.col ? `rgb(${e.col.map(v => Math.round(v * 255)).join(',')})` : '#fff';
  const body = { thrust: `<rect x="6" y="18" width="26" height="12" rx="4" fill="#aab"/><path d="M32 20l10-4v16l-10-4z" fill="${c}"/><path d="M42 18l5 6-5 6" fill="${c}" opacity=".6"/>${e.twin ? '<rect x="6" y="6" width="22" height="9" rx="3" fill="#aab"/><path d="M28 7l8-3v13l-8-3z" fill="' + c + '"/>' : ''}`,
    hop: `<path d="M10 34l4-4h20l4 4z" fill="#aab"/><path d="M14 38l-4 8M34 38l4 8M24 38v8" stroke="${c}" stroke-width="3"/><path d="M24 4l8 10h-5v10h-6V14h-5z" fill="${c}"/>`,
    chute: `<path d="M6 22a18 14 0 0136 0z" fill="#e10600"/><path d="M6 22l18 20 18-20M15 22l9 20M33 22l-9 20" stroke="#fff" stroke-width="1.5" fill="none"/>`,
    fireworks: `<circle cx="24" cy="18" r="3" fill="${c}"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M24 18l${(Math.cos(a * Math.PI / 180) * 14).toFixed(1)} ${(Math.sin(a * Math.PI / 180) * 14).toFixed(1)}" stroke="${['#ff4040', '#40a0ff', '#ffd040', '#40ff80'][a / 45 % 4]}" stroke-width="2.5" stroke-linecap="round"/>`).join('')}<path d="M24 46V30" stroke="#aaa" stroke-width="2"/>`,
    backfire: `<rect x="4" y="20" width="18" height="8" rx="3" fill="#aab"/><path d="M22 18c8-6 12 0 22-4-4 6-4 8 0 12-10-2-14 4-22-2z" fill="${c}"/>`,
    horn: `<path d="M6 20h8l14-10v28L14 28H6z" fill="#ffcf3d"/><path d="M34 16c4 4 4 12 0 16M39 11c7 7 7 19 0 26" stroke="#ffcf3d" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    smoke: `<circle cx="16" cy="28" r="9" fill="#ff5a5a"/><circle cx="26" cy="22" r="10" fill="#5aff8a" opacity=".85"/><circle cx="34" cy="30" r="9" fill="#5ab0ff" opacity=".85"/>` }[e.kind] || '';
  return `<svg class="ico" viewBox="0 0 48 48" width="${size}" height="${size}">${body}</svg>`;
}
// アイテム種類ごとのアイコン
function itemIconSvg(it, size = 34) {
  switch (it.type) {
    case 'decal': return decalPreview(it, size);
    case 'paint': return paintIcon(it, size);
    case 'wheel': return wheelIcon(it, size);
    case 'neon': return neonIcon(it, size);
    case 'caliper': return caliperIcon(it, size);
    case 'tune': return tuneIcon(it, size);
    case 'bg': return bgIcon(it, size);
    case 'car': return legendCarIcon(it, size);
    case 'meter': return meterPreview(it.meter, size);
    case 'plate': return plateIcon(it, size);
    case 'music': return ICO('music', RARITY[it.rarity] ? RARITY[it.rarity].color : '#ff8ad8', size);
    case 'kit': return `<span style="display:inline-flex;position:relative">${ICO(it.slot === 'wing' || it.slot === 'trunk' ? 'wing' : it.slot === 'front' ? 'carFront' : 'carSide', `rgb(${it.fin.map(v => Math.round(v * 255)).join(',')})`, size)}</span>`;
  }
  return ICO('gem', '#fff', size);
}

// ---- 消費アイテムのアイコン ----
function consIcon(c, size = 34) { const k = c.col || '#30d0ff', S = size; let b = '';
  if (c.icon === 'can') b = `<rect x="11" y="6" width="18" height="28" rx="4" fill="${k}"/><rect x="11" y="6" width="18" height="4" rx="2" fill="#ddd"/><rect x="11" y="30" width="18" height="4" rx="2" fill="#aaa"/><path d="M22 13 L16 22 H20 L18 29 L25 19 H21 Z" fill="#fff"/>`;
  else if (c.icon === 'candy') b = `<path d="M6 14 L12 20 L6 26 Z M34 14 L28 20 L34 26 Z" fill="${k}" opacity=".7"/><polygon points="20,8 30,16 26,32 14,32 10,16" fill="${k}"/><polygon points="20,8 24,16 20,32 16,16" fill="#fff" opacity=".5"/>`;
  else if (c.icon === 'cup') b = `<path d="M9 13 H27 L25 33 H11 Z" fill="${k}"/><path d="M27 17 Q34 17 33 23 Q32 28 26 27" stroke="${k}" stroke-width="3" fill="none"/><path d="M14 4 Q12 8 15 10 M19 4 Q17 8 20 10" stroke="#ccc" stroke-width="2" fill="none"/><text x="18" y="27" font-size="8" font-weight="900" text-anchor="middle" fill="#fff" font-family="Arial">XP</text>`;
  else if (c.icon === 'cookie') b = `<circle cx="20" cy="20" r="13" fill="#c98a4a"/><circle cx="15" cy="16" r="2" fill="#5a3010"/><circle cx="24" cy="14" r="2" fill="#5a3010"/><circle cx="22" cy="24" r="2" fill="#5a3010"/><path d="M12 22 Q20 30 28 22" stroke="${k}" stroke-width="2.5" fill="none"/><path d="M10 14 Q20 6 30 14" stroke="#fff" stroke-width="2" fill="none"/>`;
  else if (c.icon === 'charm') b = `<path d="M20 10 C14 2 4 8 10 16 L20 26 L30 16 C36 8 26 2 20 10 Z" fill="${k}" transform="translate(0 4)"/><circle cx="20" cy="6" r="3" fill="none" stroke="#ddd" stroke-width="2"/><path d="M20 18 L22 23 L27 23 L23 26 L24.5 31 L20 28 L15.5 31 L17 26 L13 23 L18 23 Z" fill="#fff" opacity=".85" transform="translate(0 -4) scale(1)"/>`;
  else b = `<rect x="9" y="9" width="22" height="24" rx="3" fill="${k}"/><path d="M9 14 H31" stroke="#fff" stroke-width="2"/><circle cx="16" cy="22" r="2.5" fill="#fff"/><circle cx="24" cy="26" r="2.5" fill="#fff"/><circle cx="23" cy="19" r="2" fill="#fff"/>`;
  return `<svg width="${S}" height="${S}" viewBox="0 0 40 40">${b}</svg>`; }
