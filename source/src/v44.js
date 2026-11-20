// =====================================================================
// v44.js — カードパックの表紙をオリジナルのエンブレムに（チェストのアイコンを廃止）
//          期間限定の車カード入りパックは、その限定車のアイコンを表紙に
// =====================================================================
const PACK_CAR = { xmaspack: 'xc_frost', neonpack: 'nn_oni' };
const PACK_TIER = { free: 1, bronze: 1, silver: 2, parts: 2, style: 2, profpack: 2, gold: 3, legend: 4, mythic: 5, xmaspack: 4, neonpack: 4 };
function packCarSvg(car, s = 120) { const c = CAR_BY_ID[car] || { color: '#ccc', body: 'gt' }, col = c.color, b = c.body, id = 'pc' + car + s;
  const body = b === 'fd' ? 'M8 56 L22 46 L52 40 L74 28 L118 26 L142 38 L170 42 L178 52 L178 60 L8 60 Z' : b === 'gs4' ? 'M6 56 L18 44 L50 40 L70 26 L124 24 L146 38 L172 42 L180 52 L180 60 L6 60 Z' : 'M4 56 L16 44 L48 40 L66 26 L120 24 L148 38 L176 42 L182 50 L182 60 L4 60 Z';
  const win = b === 'fd' ? 'M78 31 L116 30 L132 40 L66 41 Z' : 'M72 29 L118 28 L138 39 L62 40 Z';
  return `<svg class="pk-car" viewBox="0 0 186 84" width="${s}" height="${s * 84 / 186}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="${col}"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient></defs>
    <ellipse cx="93" cy="72" rx="86" ry="7" fill="#000" opacity=".45"/>${[0, 1, 2].map(k => `<path d="M${-6 - k * 10} ${44 + k * 5} h${-30 + k * 6}" stroke="${col}" stroke-width="${3 - k * 0.7}" stroke-linecap="round" opacity="${0.7 - k * 0.2}"/>`).join('')}
    <path d="${body}" fill="url(#${id})" stroke="#0008" stroke-width="1.5"/><path d="${win}" fill="#0c1220" opacity=".9"/><path d="M80 31 L96 30 L90 40 L74 40Z" fill="#fff" opacity=".18"/>
    <path d="M150 44 L176 46" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".9"/><path d="M8 50 L20 49" stroke="#ff3a3a" stroke-width="3" stroke-linecap="round"/>
    ${[44, 146].map(x => `<circle cx="${x}" cy="60" r="12" fill="#111" stroke="#2a2a2a" stroke-width="2"/><circle cx="${x}" cy="60" r="7" fill="none" stroke="#cfd3dc" stroke-width="2.5"/><circle cx="${x}" cy="60" r="2" fill="#cfd3dc"/>`).join('')}</svg>`; }
function packEmblem(c, s = 80) { const A = PACK_ART[c.id] || PACK_ART.silver, col = A.b, t = PACK_TIER[c.id] || 2, id = 'pe' + c.id + s;
  const stars = Array.from({ length: t }, (_, k) => { const x = 50 + (k - (t - 1) / 2) * 13; return `<path transform="translate(${x} 86) scale(.55)" d="M0 -9 L2.6 -2.8 L9 -2.8 L3.8 1.2 L5.8 8 L0 4 L-5.8 8 L-3.8 1.2 L-9 -2.8 L-2.6 -2.8Z" fill="${col}"/>`; }).join('');
  return `<svg class="pk-emb2" viewBox="0 0 100 100" width="${s}" height="${s}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".45" stop-color="${col}"/><stop offset="1" stop-color="${col}" stop-opacity=".55"/></linearGradient></defs>
    <path d="M50 6 L86 24 L86 58 Q86 80 50 94 Q14 80 14 58 L14 24 Z" fill="#0008" stroke="url(#${id})" stroke-width="4"/>
    <path d="M50 14 L78 28 L78 57 Q78 74 50 86 Q22 74 22 57 L22 28 Z" fill="url(#${id})" opacity=".18"/>
    <path d="M30 70 C34 52, 60 58, 56 42 C53 30, 66 26, 72 22" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".9"/><path d="M30 70 C34 52, 60 58, 56 42 C53 30, 66 26, 72 22" fill="none" stroke="#1a1d26" stroke-width="5" stroke-linecap="round"/><path d="M30 70 C34 52, 60 58, 56 42 C53 30, 66 26, 72 22" fill="none" stroke="${col}" stroke-width="1.2" stroke-dasharray="3 3"/>
    <path d="M14 34 L4 30 L10 40 L2 42 L14 48Z M86 34 L96 30 L90 40 L98 42 L86 48Z" fill="url(#${id})" opacity=".85"/>
    <text x="50" y="62" font-family="Orbitron,sans-serif" font-size="13" font-weight="900" font-style="italic" fill="#fff" text-anchor="middle" stroke="#000" stroke-width=".6">DL</text>${stars}</svg>`; }
{ const _ph = packHTML; packHTML = function (c, size = 1) { const h = _ph(c, size); if (!c || c.id === 'giftbox') return h; const a = h.indexOf('<div class="pk2-emb">'), b = h.indexOf('</div><div class="pk2-name">', a); if (a < 0 || b < 0) return h;
    const car = PACK_CAR[c.id], emb = car ? `<div class="pk2-emb pk2-carEmb">${packCarSvg(car, 118)}<span class="pk2-lim">LIMITED CAR</span><b class="pk2-carNm">${esc(CAR_BY_ID[car].name)}</b></div>` : `<div class="pk2-emb">${packEmblem(c, 82)}</div>`;
    return h.slice(0, a) + emb + h.slice(b + 6); }; }
window.__DLX = Object.assign(window.__DLX || {}, { packEmblem, packCarSvg });
{ const _pu = packPouch; packPouch = function (c, size = 1) { const h = _pu(c, size); if (!c || c.id === 'giftbox') return h; const a = h.indexOf('<div class="pp-logo">'), b = h.indexOf('</div><div class="pp-name">', a); if (a < 0 || b < 0) return h;
    const car = PACK_CAR[c.id], emb = car ? `<div class="pp-logo pp-carLogo">${packCarSvg(car, Math.round(96 * size))}<span class="pk2-lim">LIMITED CAR</span></div>` : `<div class="pp-logo">${packEmblem(c, Math.round(62 * size))}</div>`;
    return h.slice(0, a) + emb + h.slice(b + 6); }; }
