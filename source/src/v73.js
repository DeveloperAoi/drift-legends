// =====================================================================
// v73.js — v5.4：開発者オリジナルパーツ
//   ・開発者が作った車（カスタム車）には通常のカスタマイズパーツを付けられない（色だけ変更可）
//   ・開発者はパーツエディターで OBJ からオリジナルのパーツ（バンパー・ウイング・ボンネット…・タイヤ/ホイール）を作れる
//   ・作ったパーツはカスタマイズメニューで販売（お金／ダイヤ・値段は開発者が変更可）したり、パック・バンドルに入れたりできる
// =====================================================================
ITEM_TYPES.cupart = 'オリジナルパーツ';
// [名前, 取り付け位置（幅・高さ・長さに対する割合）, 左右対称に複製するか, 自動フィットの大きさ（W/L/m）]
const CP_SLOTS = { front: ['フロントバンパー', [0, 0.22, 0.5], 0, ['W', 1]], rear: ['リアバンパー', [0, 0.22, -0.5], 0, ['W', 1]], side: ['サイドスカート', [0.5, 0.12, 0], 1, ['L', 0.55]], fender: ['オーバーフェンダー', [0.5, 0.3, 0], 1, ['L', 0.8]],
  wing: ['リアウイング', [0, 0.95, -0.44], 0, ['W', 0.95]], trunk: ['トランク・ダックテール', [0, 0.78, -0.42], 0, ['W', 0.85]], hood: ['ボンネット', [0, 0.74, 0.3], 0, ['W', 0.8]], roof: ['ルーフ', [0, 1, -0.05], 0, ['W', 0.6]],
  mirror: ['サイドミラー', [0.5, 0.74, 0.12], 1, ['m', 0.28]], exhaust: ['マフラー', [0, 0.16, -0.5], 0, ['m', 0.5]], head: ['ヘッドライト', [0, 0.55, 0.5], 0, ['W', 0.85]], tail: ['テールランプ', [0, 0.6, -0.5], 0, ['W', 0.85]],
  canard: ['カナード・ディフューザー', [0, 0.2, 0.45], 0, ['W', 0.9]], acc: ['その他の飾り', [0, 1, 0], 0, ['m', 0.6]], tire: ['タイヤ・ホイール', [0, 0, 0], 0, ['m', 1]] };
const CP_HIDE = { front: 'front', rear: 'rear', side: 'side', fender: 'fender', wing: 'wing', trunk: 'trunk', hood: 'hood', roof: 'roof', mirror: 'mirror', exhaust: 'exhaust' };
const CP_MAXTRI = 8000, CP_BY = {}, CP_GEO = {};
const cpFits = (p, car) => !!car && (p.fit === 'all' || !!car.cuCar);

// ---------------- パーツの登録（admin/custom/items の t:'part'） ----------------
{ const _ap = CU.apply; CU.apply = function (data) { _ap.call(this, data); const D = this.data || {}; for (const k of Object.keys(CP_BY)) if (k !== 'cu_prev') delete CP_BY[k];
    for (const [k, v] of Object.entries(D.items || {})) { if (!v || v.t !== 'part' || !v.geo || !CP_SLOTS[v.slot]) continue; const id = 'cu_' + k, nm = String(v.nm || 'オリジナルパーツ').slice(0, 30), en = v.en || nm;
      mkItem({ id, type: 'cupart', slot: v.slot, rarity: RARITY[v.r] ? v.r : 'R', name: CP_SLOTS[v.slot][0] + '「' + nm + '」', en: 'Part "' + en + '"', desc: 'オリジナルの' + CP_SLOTS[v.slot][0] + (v.fit === 'all' ? '（すべての車に装着可）' : '（オリジナル車専用）'), custom: 1, cuKey: k, cuImg: v.img }); this.added.items.push(id);
      const gk = k + (v.at || 0); CP_BY[id] = { id, k, nm, slot: v.slot, fit: v.fit || 'cu', xf: v.xf || {}, dup: !!v.dup, shop: v.shop || {}, img: v.img, r: v.r, geo: () => CP_GEO[gk] || (CP_GEO[gk] = cmDec(v.geo)) }; (v.geo.tx || []).forEach(cmImg); }
    try { if (UI.screen === 'tuning') UI.render(); } catch (e) { } }; }
{ const _ic = itemIconSvg; itemIconSvg = function (it, size = 34) { if (it && it.type === 'cupart' && it.cuImg) return `<svg viewBox="0 0 64 64" width="${size}" height="${size}"><image href="${it.cuImg}" x="0" y="0" width="64" height="64" preserveAspectRatio="xMidYMid meet"/></svg>`; return _ic.apply(this, arguments); }; }

// ---------------- 3Dモデルの組み立て ----------------
function cpMeshes(R, m, geo, T, look, car, A, mir) { const gl = R.gl, I = geo.idx, nt = I.length / 3, nv = T.length / 3, UV = geo.uv; if (mir) { T = Float32Array.from(T); for (let i = 0; i < T.length; i += 3) T[i] = -T[i]; }
  const FN = new Float32Array(nt * 3); for (let t = 0; t < nt; t++) { const a = I[t * 3] * 3, b = I[t * 3 + 1] * 3, c = I[t * 3 + 2] * 3, ux = T[b] - T[a], uy = T[b + 1] - T[a + 1], uz = T[b + 2] - T[a + 2], vx = T[c] - T[a], vy = T[c + 1] - T[a + 1], vz = T[c + 2] - T[a + 2]; let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1, f = mir ? -1 : 1; FN[t * 3] = nx / l * f; FN[t * 3 + 1] = ny / l * f; FN[t * 3 + 2] = nz / l * f; }
  const st = new Uint32Array(nv + 1); for (let i = 0; i < I.length; i++) st[I[i] + 1]++; for (let i = 0; i < nv; i++) st[i + 1] += st[i]; const fl = new Uint32Array(I.length), fill = st.slice(0, nv); for (let i = 0; i < I.length; i++) fl[fill[I[i]]++] = (i / 3) | 0;
  const G = {}, out = [], paint = hexToRgb(look.color || car.color || '#888888');
  for (const g of geo.groups) { if (g.role === 'hide') continue; const tex = g.tex ? cmTexGL(R, g.tex) : null, key = tex ? 'tx' + out.length + g.n : g.role, gb = G[key] || (G[key] = new GB()), us = g.us || 1, useObj = g.uvm === 'obj' && UV; if (tex) out.push([gb, g, tex]);
    const col = g.role === 'body' ? paint : g.role === 'color' ? hexToRgb(g.col || '#888888') : (CM_ROLE[g.role] || CM_ROLE.dark)[1] || [0.5, 0.5, 0.5];
    for (let t = g.s / 3; t < (g.s + g.c) / 3; t++) { const fx = FN[t * 3], fy = FN[t * 3 + 1], fz = FN[t * 3 + 2];
      const corner = k => { const v = I[t * 3 + k]; let nx = 0, ny = 0, nz = 0; for (let j = st[v]; j < st[v + 1]; j++) { const f = fl[j]; if (FN[f * 3] * fx + FN[f * 3 + 1] * fy + FN[f * 3 + 2] * fz > 0.72) { nx += FN[f * 3]; ny += FN[f * 3 + 1]; nz += FN[f * 3 + 2]; } } const l = Math.hypot(nx, ny, nz) || 1; let u = 0, w = 0;
        if (tex) { if (useObj) { u = UV[v * 2]; w = UV[v * 2 + 1]; } else { const ax = Math.abs(fx), ay = Math.abs(fy), az = Math.abs(fz), X = T[v * 3], Y = T[v * 3 + 1], Z = T[v * 3 + 2]; if (ax >= ay && ax >= az) { u = fx > 0 ? -Z : Z; w = Y; } else if (ay >= az) { u = X; w = fy > 0 ? -Z : Z; } else { u = fz > 0 ? X : -X; w = Y; } u = u * us * 2 + 0.5; w = w * us * 2 + 0.5; } }
        gb.v(T[v * 3], T[v * 3 + 1], T[v * 3 + 2], nx / l, ny / l, nz / l, tex && g.tm !== 'tint' ? [1, 1, 1] : col, u, w); };
      if (mir) { corner(0); corner(2); corner(1); } else { corner(0); corner(1); corner(2); } } }
  const res = [], RM = { body: { refl: 0.3, spec: 1, shin: 80, clear: 1, metal: 0.2 }, color: { spec: 0.5, shin: 50 }, dark: { spec: 0.25, shin: 30 }, chrome: { refl: 0.85, spec: 2, shin: 160, metal: 1 }, glass: { refl: 0.7, spec: 2, shin: 160 } };
  for (const [key, gb] of Object.entries(G)) { if (!gb.a.length) continue; const tx = out.find(o => o[0] === gb); let mat;
    if (tx) mat = Mat(Object.assign({ spec: 0.5, shin: 50 }, RM[tx[1].role] || {}, { tex: tx[2], texMode: tx[1].tm === 'tint' ? 2 : 1 }, A)); else if (key === 'head') mat = m.headMat; else if (key === 'tail') mat = m.brakeMat; else if (key === 'glass') mat = m.glassMat || Mat(Object.assign({}, RM.glass, A)); else mat = Mat(Object.assign({}, RM[key] || RM.dark, A));
    const me = new Mesh(gl, gb.a); m.meshes.push(me); res.push([me, mat]); }
  return res; }
// ボディのパーツ：取り付け位置（車の大きさに合わせる）＋パーツ自身の移動・拡大
function cpBodyT(p, car) { const geo = p.geo(), S = CP_SLOTS[p.slot], a = S[1], T = cmXfPos(geo, p.xf), W = car.W || 1.8, H = car.H || 1.3, L = car.L || 4.5, ax = a[0] * W, ay = a[1] * H, az = a[2] * L;
  for (let i = 0; i < T.length; i += 3) { T[i] += ax; T[i + 1] += ay; T[i + 2] += az; } return T; }
// タイヤ：車軸を X に合わせて中心を原点に、半径 1 にそろえる
function cpTireT(p) { const geo = p.geo(), x = p.xf || {}, P = geo.pos, n = P.length / 3, T = new Float32Array(P.length);
  for (let i = 0; i < n; i++) { let X = P[i * 3], Y = P[i * 3 + 1], Z = P[i * 3 + 2]; if (x.axle === 'y') [X, Y] = [Y, -X]; else if (x.axle === 'z') [X, Z] = [Z, -X]; if (x.flipOut) X = -X; T[i * 3] = X; T[i * 3 + 1] = Y; T[i * 3 + 2] = Z; }
  const b = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9]; for (let i = 0; i < T.length; i += 3) for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], T[i + k]); b[k + 3] = Math.max(b[k + 3], T[i + k]); } const c = [(b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2];
  let r = 0; for (let i = 0; i < T.length; i += 3) { T[i] -= c[0]; T[i + 1] -= c[1]; T[i + 2] -= c[2]; r = Math.max(r, Math.hypot(T[i + 1], T[i + 2])); } r = r || 1; const tw = x.tw || 1; for (let i = 0; i < T.length; i += 3) { T[i] = T[i] / r * tw + (x.ox || 0); T[i + 1] /= r; T[i + 2] /= r; } return T; }
function cpAttach(R, m, car, look, p, opts) { const A = opts.ghost ? { blend: true, alpha: 0.35, depthWrite: false } : {}, geo = p.geo(); if (!geo || !geo.idx.length) return;
  if (p.slot === 'tire') { const T0 = cpTireT(p), cache = {}; for (const w of m.wheels) { const rr = car.cuCarObj ? 0.33 : (w.hub.pos[1] || 0.32), key = rr.toFixed(3); if (!cache[key]) { const T = Float32Array.from(T0); for (let i = 0; i < T.length; i++) T[i] *= rr * (p.xf.s || 1); cache[key] = cpMeshes(R, m, geo, T, look, car, A, false); } w.spin.parts = cache[key].map(([mesh, mat]) => ({ mesh, mat })); } return; }
  const T = cpBodyT(p, car); for (const [mesh, mat] of cpMeshes(R, m, geo, T, look, car, A, false)) m.body.addMesh(mesh, mat); if (p.dup) for (const [mesh, mat] of cpMeshes(R, m, geo, T, look, car, A, true)) m.body.addMesh(mesh, mat); }
{ const _bm = buildCarModel; buildCarModel = function (R, car, look, opts = {}) { const P = look && look.cuParts; if (!P || !car) return _bm.apply(this, arguments);
    const eq = Object.entries(P).map(([s, id]) => [s, CP_BY[id]]).filter(([s, p]) => p && p.slot === s && cpFits(p, car)); if (!eq.length) return _bm.apply(this, arguments);
    let lk = look; if (!car.cuCarObj) { lk = Object.assign({}, look, { kit: Object.assign({}, look.kit || {}) }); for (const [s] of eq) { const h = CP_HIDE[s]; if (h) { lk[h] = 0; delete lk.kit[h]; } } }
    const m = _bm.call(this, R, car, lk, opts); if (!m) return m; for (const [, p] of eq) { try { cpAttach(R, m, car, look, p, opts); } catch (e) { console.error(e); } } return m; }; }

// ---------------- カスタマイズメニュー ----------------
const cpOwned = id => invHas(id);
const cpPrice = s => s.cur === 'dia' ? `${SICO.gem(14)} ${(+s.price || 0).toLocaleString()}` : yen(+s.price || 0);
{ const _rt = UI.r_tuning; UI.r_tuning = function (arg) { if (!this.tmode) { const tb = arg && arg.tab; this.tmode = tb === 'aero' || tb === 'paint' ? 'custom' : 'tune'; } if (this.tmode !== 'custom') return _rt.apply(this, arguments); const inst = this.tuneInst(), car = inst && CAR_BY_ID[inst.id]; if (!car) return _rt.apply(this, arguments);
    const cu = !!car.cuCar, list = Object.values(CP_BY).filter(p => p.id !== 'cu_prev' && cpFits(p, car)), base = this.TCATS.custom; let cats = cu ? base.filter(c => c.id === 'col') : base.slice();
    if (cu || list.length) cats = cats.concat([{ id: 'cpt', icon: 'wing', name: 'オリジナルパーツ', tab: 'aero', extra: [] }]); this.TCATS.custom = cats; let h;
    try { h = _rt.apply(this, arguments); } finally { this.TCATS.custom = base; }
    if (cu && !this.tcat) h = h.replace('<div class="cat-grid">', '<div class="note cp-lock">この車は開発者が作ったオリジナル車なので、<b>通常のカスタマイズパーツは付けられません</b>。ボディカラーと「オリジナルパーツ」でカスタマイズできます。</div><div class="cat-grid">');
    if (this.tcat === 'cpt') { const lk = inst.look, eqp = lk.cuParts || {}, slots = Object.keys(CP_SLOTS).filter(s => list.some(p => p.slot === s));
      const body = slots.map(s => `<div class="part"><div class="ph">${CP_SLOTS[s][0]}${eqp[s] && CP_BY[eqp[s]] ? `<button class="btn cp-off" data-a="cpOff" data-v="${s}">外す</button>` : ''}</div><div class="cp-grid">${list.filter(p => p.slot === s).map(p => { const own = cpOwned(p.id), on = eqp[s] === p.id, it = ITEM_BY_ID[p.id] || {};
          return `<div class="cp-card ${on ? 'on' : ''}" style="--rc:${(RARITY[it.rarity] || {}).color || '#888'}"><img src="${p.img || ''}" alt="" width="72" height="72"><b>${esc(p.nm)}</b><small>${(RARITY[it.rarity] || {}).name || ''}</small>${on ? '<span class="cp-st">装着中</span>' : own ? `<button class="btn pri" data-a="cpEquip" data-v="${p.id}">装着する</button>` : p.shop.on ? `<button class="btn gold" data-a="cpBuy" data-v="${p.id}">${cpPrice(p.shop)}</button>` : '<span class="cp-st off">パックで入手</span>'}</div>`; }).join('')}</div></div>`).join('');
      h = h.replace('<div class="note">このカテゴリのパーツはありません。</div>', body || `<div class="note">まだオリジナルパーツはありません${cu ? '（開発者がパーツを追加すると、ここに並びます）' : ''}。</div>`); }
    return h; }; }
{ const _cs = UI.catStatus; UI.catStatus = function (c, t, lk) { if (c.id === 'cpt') { const n = Object.values(lk.cuParts || {}).filter(id => CP_BY[id]).length; return n ? n + '個装着中' : ''; } return _cs.apply(this, arguments); }; }
Object.assign(UI, {
  a_cpEquip(id) { const inst = this.tuneInst(), p = CP_BY[id]; if (!p || !cpOwned(id) || !cpFits(p, CAR_BY_ID[inst.id])) return; inst.look.cuParts = Object.assign({}, inst.look.cuParts || {}, { [p.slot]: id }); SAVE.save(); this.show.sig = ''; this.show.setCar(inst, true); AUDIO.buy && AUDIO.buy(); this.render(); },
  a_cpOff(slot) { const inst = this.tuneInst(); if (inst.look.cuParts) { delete inst.look.cuParts[slot]; SAVE.save(); } this.show.sig = ''; this.show.setCar(inst, true); this.render(); },
  a_cpBuy(id) { const p = CP_BY[id], d = SAVE.data; if (!p || !p.shop.on || cpOwned(id)) return; const pr = Math.max(0, +p.shop.price || 0);
    if (p.shop.cur === 'dia') { if ((d.diamonds || 0) < pr) return this.toast('ダイヤが足りません'); d.diamonds -= pr; } else if (!SAVE.spend(pr)) return; d.inv[id] = 1; SAVE.save(); this.refreshTop(); this.toast(p.nm + ' を購入しました'); this.a_cpEquip(id); }
});
// オリジナル車には通常のパーツを付けられない（画面を経由しない操作もブロック）
for (const a of ['a_lookOpt', 'a_lookWheel', 'a_lookGlow', 'a_lookDecal', 'a_lookLivery', 'a_equipKit', 'a_buyKit', 'a_stockAll', 'a_hlCol', 'a_lookSet']) { const f = UI[a]; if (typeof f !== 'function') continue;
  UI[a] = function (v) { try { const inst = this.tuneInst(), car = inst && CAR_BY_ID[inst.id]; if (car && car.cuCar && this.screen === 'tuning' && !(a === 'a_lookSet' && /^(color|color2|paint):/.test(String(v)))) return this.toast('オリジナル車には通常のパーツは付けられません'); } catch (e) { } return f.apply(this, arguments); }; }

// ---------------- 開発者：パーツエディター ----------------
function cpThumb(geo, T, look) { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'), I = geo.idx, ya = -0.75, pa = 0.42, cy = Math.cos(ya), sy = Math.sin(ya), cp = Math.cos(pa), sp = Math.sin(pa), Q = [];
  for (let i = 0; i < T.length; i += 3) { const x = T[i] * cy + T[i + 2] * sy, z = -T[i] * sy + T[i + 2] * cy, y = T[i + 1] * cp - z * sp, d = T[i + 1] * sp + z * cp; Q.push(x, y, d); }
  let b = [1e9, 1e9, -1e9, -1e9]; for (let i = 0; i < Q.length; i += 3) { b[0] = Math.min(b[0], Q[i]); b[1] = Math.min(b[1], Q[i + 1]); b[2] = Math.max(b[2], Q[i]); b[3] = Math.max(b[3], Q[i + 1]); } const sc = 112 / Math.max(b[2] - b[0], b[3] - b[1], 1e-6), ox = 64 - (b[0] + b[2]) / 2 * sc, oy = 64 + (b[1] + b[3]) / 2 * sc;
  const tris = []; for (const gr of geo.groups) { if (gr.role === 'hide') continue; const base = gr.role === 'body' ? hexToRgb(look.color || '#e10600') : gr.role === 'color' ? hexToRgb(gr.col || '#888888') : (CM_ROLE[gr.role] || CM_ROLE.dark)[1] || [0.5, 0.5, 0.5];
    for (let t = gr.s; t < gr.s + gr.c; t += 3) { const a = I[t] * 3, bb = I[t + 1] * 3, c = I[t + 2] * 3, ux = Q[bb] - Q[a], uy = Q[bb + 1] - Q[a + 1], vx = Q[c] - Q[a], vy = Q[c + 1] - Q[a + 1]; const ux3 = T[bb] - T[a], uy3 = T[bb + 1] - T[a + 1], uz3 = T[bb + 2] - T[a + 2], vx3 = T[c] - T[a], vy3 = T[c + 1] - T[a + 1], vz3 = T[c + 2] - T[a + 2]; let nx = uy3 * vz3 - uz3 * vy3, ny = uz3 * vx3 - ux3 * vz3, nz = ux3 * vy3 - uy3 * vx3; const l = Math.hypot(nx, ny, nz) || 1;
      const sh = 0.4 + 0.6 * Math.abs((nx * 0.4 + ny * 0.8 + nz * 0.45) / l); tris.push([(Q[a + 2] + Q[bb + 2] + Q[c + 2]) / 3, a, bb, c, base.map(v => Math.round(Math.min(1, v * sh) * 255))]); void ux; void uy; void vx; void vy; } }
  tris.sort((p, q) => q[0] - p[0]); for (const [, a, bb, c, col] of tris) { g.fillStyle = g.strokeStyle = `rgb(${col})`; g.lineWidth = 0.5; g.beginPath(); g.moveTo(ox + Q[a] * sc, oy - Q[a + 1] * sc); g.lineTo(ox + Q[bb] * sc, oy - Q[bb + 1] * sc); g.lineTo(ox + Q[c] * sc, oy - Q[c + 1] * sc); g.closePath(); g.fill(); g.stroke(); }
  return cv.toDataURL('image/png'); }
const CPE = {
  newF() { return { geo: null, slot: 'wing', nm: '', en: '', r: 'R', dup: 0, fit: 'cu', shop: { on: 1, cur: 'yen', price: 500000 }, xf: { yaw: 0, zup: 0, mir: 0, flip: 0, s: 1, fs: 1, ox: 0, oy: 0, oz: 0, axle: 'x', flipOut: 0, tw: 1 }, car: '' }; },
  prevCar(F) { const c = CAR_BY_ID[F.car]; if (c && (F.fit === 'all' || c.cuCar)) return c; const cur = CAR_BY_ID[(SAVE.cur() || {}).id]; if (cur && (F.fit === 'all' || cur.cuCar)) return cur; return CARS.find(c => c.cuCar && c.id !== 'cu_car_prev') || cur; },
  rawT(F) { return cmXfPos(F.geo, F.xf); },
  fit(F) { const car = this.prevCar(F) || CARS[0], [k, f] = CP_SLOTS[F.slot][3]; F.xf.s = 1; F.xf.ox = F.xf.oy = F.xf.oz = 0; if (F.slot === 'tire') { F.xf.fs = 1; return; } let T = this.rawT(F), b = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
    for (let i = 0; i < T.length; i += 3) for (let a = 0; a < 3; a++) { b[a] = Math.min(b[a], T[i + a]); b[a + 3] = Math.max(b[a + 3], T[i + a]); } const tgt = k === 'W' ? (car.W || 1.8) * f : k === 'L' ? (car.L || 4.5) * f : f, cur = k === 'L' ? b[5] - b[2] : k === 'W' ? b[3] - b[0] : Math.max(b[3] - b[0], b[4] - b[1], b[5] - b[2]);
    const s = tgt / (cur || 1); F.xf.s = F.xf.fs = s; F.xf.ox = -(b[0] + b[3]) / 2 * s; F.xf.oy = -(b[1] + b[4]) / 2 * s; F.xf.oz = -(b[2] + b[5]) / 2 * s; if (CP_SLOTS[F.slot][2]) F.xf.ox = 0; },
  def(F) { const g = F.geo; return { id: 'cu_prev', k: 'prev', nm: F.nm, slot: F.slot, fit: F.fit, xf: F.xf, dup: !!F.dup, shop: F.shop, geo: () => g }; },
  preview() { clearTimeout(this._t); this._t = setTimeout(() => { const F = UI.cpF; if (!F || !F.geo || !UI.show) return; const car = this.prevCar(F); if (!car) return; CP_BY.cu_prev = this.def(F); const own = (SAVE.data.cars || []).find(c => c.id === car.id), look = Object.assign({}, own ? own.look : defaultLook(car)); if (car.cuCar && !own) look.color = car.color;
      look.cuParts = Object.assign({}, look.cuParts || {}, { [F.slot]: 'cu_prev' }); UI.show.sig = ''; UI.show.setCar({ id: car.id, look, tune: own ? own.tune : undefined }, true); }, 120); },
  sl(k, l, v, mn, mx, st) { return `<div class="row cm-sl"><label>${l}</label><input type="range" min="${mn}" max="${mx}" step="${st}" value="${v}" data-in="cpNum" data-k="${k}"><input type="number" class="cm-nv" step="${st}" value="${v}" data-in="cpNum" data-k="${k}"></div>`; },
  html(D, online) { const F = UI.cpF || (UI.cpF = this.newF()), dis = online ? '' : 'disabled', parts = Object.entries(D.items || {}).filter(([, v]) => v && v.t === 'part'), x = F.xf, tire = F.slot === 'tire';
    let h = `<div class="note">OBJファイルからオリジナルのパーツ（バンパー・ウイング・ボンネット・ミラー・マフラー・タイヤ/ホイールなど）を作れます。調整中のパーツは<b>ショールームの車</b>に付いた状態で表示されます。作ったパーツは<b>カスタマイズメニューで販売</b>したり、<b>パック・バンドル</b>に入れたりできます（パックの「中に入れるアイテム」に並びます）。</div>
      <div class="cu-form"><div class="row"><label>パーツの種類</label><select data-in="cpSlot">${Object.entries(CP_SLOTS).map(([k, v]) => `<option value="${k}" ${F.slot === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select></div>
      <div class="row"><label>OBJファイル</label><label class="btn pri">OBJを読み込む<input type="file" accept=".obj,text/plain" data-in="cpObj" style="display:none"></label>${F.geo ? `<small class="set-note">${(F.geo.idx.length / 3).toLocaleString()} ポリゴン ・ パーツ ${F.geo.groups.length}</small>` : `<small class="set-note">${CP_MAXTRI.toLocaleString()}ポリゴンより多いモデルは自動で軽くします</small>`}</div>`;
    if (F.geo) { const cars = CARS.filter(c => c.id !== 'cu_car_prev' && (F.fit === 'all' || c.cuCar)), pc = this.prevCar(F);
      h += `<div class="row"><label>付けられる車</label><select data-in="cpFit"><option value="cu" ${F.fit !== 'all' ? 'selected' : ''}>開発者が作った車だけ</option><option value="all" ${F.fit === 'all' ? 'selected' : ''}>すべての車（通常の車にも付けられる）</option></select></div>
        <div class="row"><label>プレビューする車</label><select data-in="cpCar">${cars.map(c => `<option value="${c.id}" ${pc && pc.id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>${!cars.length ? '<small class="set-note">先にカスタム車メーカーで車を作るか、「すべての車」を選んでください</small>' : ''}</div>
        <div class="h3">向き・大きさ・位置</div>`;
      if (tire) h += `<div class="row"><label>車軸の向き（OBJ）</label><select data-in="cpAxle">${[['x', 'X 軸'], ['y', 'Y 軸'], ['z', 'Z 軸']].map(([k, l]) => `<option value="${k}" ${x.axle === k ? 'selected' : ''}>${l}</option>`).join('')}</select><label class="cm-chk"><input type="checkbox" data-in="cpChk" data-k="flipOut" ${x.flipOut ? 'checked' : ''}> 表と裏を反転（ホイールの面を外側に）</label></div>
          <div class="note">タイヤは車のタイヤの大きさに自動で合わせます（高さ＝タイヤの直径）。</div>${this.sl('xf.s', '大きさ（倍）', +(+x.s).toFixed(3), 0.6, 1.5, 0.01)}${this.sl('xf.tw', 'タイヤの幅（倍）', +(+x.tw).toFixed(3), 0.3, 2.5, 0.01)}${this.sl('xf.ox', '内側・外側', +(+x.ox).toFixed(3), -0.6, 0.6, 0.005)}`;
      else h += `<div class="row"><label>向き</label><select data-in="cpYaw">${[0, 90, 180, 270].map(a => `<option value="${a}" ${x.yaw == a ? 'selected' : ''}>${a}°回転</option>`).join('')}</select><label class="cm-chk"><input type="checkbox" data-in="cpChk" data-k="zup" ${x.zup ? 'checked' : ''}> Z が上のモデル</label><label class="cm-chk"><input type="checkbox" data-in="cpChk" data-k="mir" ${x.mir ? 'checked' : ''}> 左右反転</label><label class="cm-chk"><input type="checkbox" data-in="cpDup" ${F.dup ? 'checked' : ''}> 反対側にも付ける（左右対称）</label></div>
          <div class="btns"><button class="btn" data-a="cpFit">車に合わせて自動フィット</button></div>${this.sl('xf.s', '拡大率', +(+x.s).toFixed(4), +(x.fs * 0.3).toFixed(4), +(x.fs * 2.5).toFixed(4), +(x.fs / 200).toFixed(5))}${this.sl('xf.ox', '左右', +(+x.ox).toFixed(3), -1.5, 1.5, 0.005)}${this.sl('xf.oy', '上下', +(+x.oy).toFixed(3), -1.5, 1.5, 0.005)}${this.sl('xf.oz', '前後', +(+x.oz).toFixed(3), -2.5, 2.5, 0.005)}`;
      h += `<div class="h3">色・テクスチャ（OBJのグループごと）</div><div class="cm-parts">${F.geo.groups.map((g, i) => `<div class="cm-p"><b title="${esc(g.n)}">${esc(g.n)}</b><small>${(g.c / 3).toLocaleString()}</small><select data-in="cpRole" data-i="${i}">${Object.entries(CM_ROLE).map(([k, v]) => `<option value="${k}" ${g.role === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select>${g.role === 'color' ? `<input type="color" value="${g.col || '#888888'}" data-in="cpCol" data-i="${i}">` : '<span></span>'}
          <div class="cm-tx">${g.tex ? `<img src="${g.tex}" width="34" height="34" alt="">` : ''}<label class="btn">${g.tex ? 'テクスチャを変更' : 'テクスチャを読み込む'}<input type="file" accept="image/*" data-in="cpTex" data-i="${i}" style="display:none"></label>${g.tex ? `<select data-in="cpTm" data-i="${i}"><option value="raw" ${g.tm !== 'tint' ? 'selected' : ''}>画像の色そのまま</option><option value="tint" ${g.tm === 'tint' ? 'selected' : ''}>パーツの色を掛ける</option></select><select data-in="cpUvm" data-i="${i}"><option value="auto" ${g.uvm !== 'obj' ? 'selected' : ''}>貼り方：自動（箱型）</option><option value="obj" ${g.uvm === 'obj' ? 'selected' : ''} ${F.geo.uv ? '' : 'disabled'}>貼り方：OBJのUV</option></select><button class="btn" data-a="cpTexDel" data-v="${i}">外す</button>` : ''}</div></div>`).join('')}</div>
        <div class="h3">名前・レア度・販売</div><div class="row"><label>パーツ名</label><input id="cpNm" maxlength="30" value="${esc(F.nm)}" placeholder="例：ストームGTウイング"></div><div class="row"><label>英語名（任意）</label><input id="cpEn" maxlength="40" value="${esc(F.en || '')}"></div>
        <div class="row"><label>レア度</label><select id="cpR">${['C', 'U', 'R', 'E', 'L', 'M'].filter(r => RARITY[r]).map(r => `<option value="${r}" ${F.r === r ? 'selected' : ''}>${RARITY[r].name}</option>`).join('')}</select></div>
        <div class="row"><label>カスタマイズメニューで販売</label><label class="cm-chk"><input type="checkbox" id="cpShop" ${F.shop.on ? 'checked' : ''}> 販売する</label><select id="cpCur"><option value="yen" ${F.shop.cur !== 'dia' ? 'selected' : ''}>お金</option><option value="dia" ${F.shop.cur === 'dia' ? 'selected' : ''}>ダイヤ</option></select><input id="cpPr" type="number" min="0" value="${F.shop.price}"><small class="set-note">販売しない場合はパック・バンドル・プレゼントでだけ手に入ります</small></div>
        <div class="btns"><button class="btn pri" data-a="cpSave" ${dis}>${F.k ? '変更を保存' : 'パーツを作る（全員に反映）'}</button><button class="btn" data-a="cpPrev">ショールームで見る</button><button class="btn" data-a="cpNew">最初から</button></div>`; }
    h += `</div><div class="h3">作ったパーツ（${parts.length}）</div><div class="cu-list">${parts.map(([k, v]) => `<div class="cu-it"><span class="cu-pv">${v.img ? `<img class="cu-img" src="${v.img}" width="44" height="44" alt="">` : ''}</span><b>${esc(v.nm || '')}</b><small>${(CP_SLOTS[v.slot] || [''])[0]} ・ ${v.fit === 'all' ? 'すべての車' : 'オリジナル車専用'} ・ ${v.shop && v.shop.on ? '販売中 ' + (v.shop.cur === 'dia' ? 'ダイヤ ' + v.shop.price : yen(v.shop.price || 0)) : '販売なし'} ・ ID cu_${k}</small><div><button class="btn" data-a="cpShopTog" data-v="${k}" ${dis}>${v.shop && v.shop.on ? '販売をやめる' : '販売する'}</button><button class="btn" data-a="cpEdit" data-v="${k}">編集</button><button class="btn" data-a="cuItemDel" data-v="${k}" ${dis}>削除</button></div></div>`).join('') || '<div class="note">まだありません</div>'}</div>`;
    return h; }
};
{ const _ce = UI.cuExtra; UI.cuExtra = function (sub, D, online) { if (sub === 'part') return CPE.html(D, online); return _ce ? _ce.apply(this, arguments) : ''; }; }
{ const _ed = UI.a_cuItemEdit; UI.a_cuItemEdit = function (k) { const v = ((CU.data || {}).items || {})[k]; if (v && v.t === 'part') { this.cuSub = 'part'; return this.a_cpEdit(k); } return _ed.apply(this, arguments); }; }
Object.assign(UI, {
  cpKeep() { const F = this.cpF; if (!F || !$('cpNm')) return; const v = id => ($(id) || {}).value; F.nm = v('cpNm'); F.en = v('cpEn'); F.r = v('cpR'); F.shop = { on: $('cpShop').checked ? 1 : 0, cur: v('cpCur') === 'dia' ? 'dia' : 'yen', price: Math.max(0, Math.round(+v('cpPr') || 0)) }; },
  in_cpSlot(v) { this.cpKeep(); const F = this.cpF; F.slot = v; F.dup = CP_SLOTS[v][2]; if (F.geo) { if (v === 'tire') for (const g of F.geo.groups) if (g.role === 'body') g.role = /rim|wheel|ホイール/i.test(g.n) ? 'chrome' : 'dark'; this.cpFitNow(); } this.render(); CPE.preview(); },
  cpFitNow() { CPE.fit(this.cpF); },
  in_cpObj(v, el) { const f = el.files && el.files[0]; if (!f) return; if (f.size > 40e6) return this.toast('ファイルが大きすぎます（40MBまで）'); this.cpKeep(); const rd = new FileReader();
    rd.onload = () => { try { let geo = cmParseObj(String(rd.result)); if (!geo.idx.length) return this.toast('ポリゴンが見つかりませんでした'); geo = cmSimplify(geo, CP_MAXTRI); const F = this.cpF = this.cpF || CPE.newF(); F.geo = geo;
        for (const g of geo.groups) { if (g.role === 'hide') g.role = F.slot === 'tire' ? (/rim|wheel|ホイール/i.test(g.n) ? 'chrome' : 'dark') : 'body'; if (F.slot === 'tire' && g.role === 'body') g.role = /rim|wheel|ホイール/i.test(g.n) ? 'chrome' : 'dark'; }
        if (!F.nm) F.nm = f.name.replace(/\.obj$/i, '').slice(0, 30); F.dup = CP_SLOTS[F.slot][2]; CPE.fit(F); this.render(); CPE.preview(); this.toast('読み込みました：' + (geo.idx.length / 3).toLocaleString() + ' ポリゴン'); } catch (e) { console.error(e); this.toast('OBJを読み込めませんでした'); } };
    rd.readAsText(f); el.value = ''; },
  in_cpNum(v, el) { const F = this.cpF; if (!F) return; const [, k] = el.dataset.k.split('.'), n = +v; if (!isFinite(n)) return; F.xf[k] = n; el.parentNode.querySelectorAll('[data-in=cpNum]').forEach(x => { if (x !== el) x.value = v; }); CPE.preview(); },
  in_cpChk(v, el) { this.cpKeep(); this.cpF.xf[el.dataset.k] = v ? 1 : 0; if (el.dataset.k !== 'flipOut') CPE.fit(this.cpF); this.render(); CPE.preview(); },
  in_cpDup(v) { this.cpF.dup = v ? 1 : 0; CPE.preview(); },
  in_cpYaw(v) { this.cpKeep(); this.cpF.xf.yaw = +v; CPE.fit(this.cpF); this.render(); CPE.preview(); },
  in_cpAxle(v) { this.cpKeep(); this.cpF.xf.axle = v; this.render(); CPE.preview(); },
  in_cpFit(v) { this.cpKeep(); this.cpF.fit = v === 'all' ? 'all' : 'cu'; this.render(); CPE.preview(); },
  in_cpCar(v) { this.cpKeep(); this.cpF.car = v; CPE.preview(); },
  in_cpRole(v, el) { this.cpKeep(); this.cpF.geo.groups[+el.dataset.i].role = v; this.render(); CPE.preview(); },
  in_cpCol(v, el) { this.cpF.geo.groups[+el.dataset.i].col = v; CPE.preview(); },
  async in_cpTex(v, el) { const f = el.files && el.files[0], i = +el.dataset.i; if (!f) return; this.cpKeep(); try { const url = await new Promise((ok, ng) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = ng; r.readAsDataURL(f); }); const g = this.cpF.geo.groups[i]; g.tex = await cmTexPrep(url); if (!g.uvm) g.uvm = this.cpF.geo.uv ? 'obj' : 'auto'; } catch (e) { return this.toast('画像を読み込めませんでした'); } el.value = ''; this.render(); CPE.preview(); },
  in_cpTm(v, el) { this.cpF.geo.groups[+el.dataset.i].tm = v; CPE.preview(); },
  in_cpUvm(v, el) { this.cpF.geo.groups[+el.dataset.i].uvm = v; CPE.preview(); },
  a_cpTexDel(i) { this.cpKeep(); this.cpF.geo.groups[+i].tex = null; this.render(); CPE.preview(); },
  a_cpFit() { this.cpKeep(); CPE.fit(this.cpF); this.render(); CPE.preview(); },
  a_cpPrev() { this.cpKeep(); CPE.preview(); },
  a_cpNew() { this.cpF = CPE.newF(); this.render(); },
  a_cpEdit(k) { const v = ((CU.data || {}).items || {})[k]; if (!v || v.t !== 'part') return; const F = CPE.newF(); Object.assign(F, { k, geo: cmDec(v.geo), slot: v.slot, nm: v.nm, en: v.en || '', r: v.r || 'R', dup: v.dup ? 1 : 0, fit: v.fit || 'cu', shop: Object.assign({ on: 0, cur: 'yen', price: 0 }, v.shop || {}) }); F.xf = Object.assign(F.xf, v.xf || {}); this.cpF = F; this.cuSub = 'part'; this.render(); CPE.preview(); },
  a_cpShopTog(k) { const v = ((CU.data || {}).items || {})[k]; if (!v) return; const on = !(v.shop && v.shop.on); this.cuWrite('items/' + k + '/shop', Object.assign({ cur: 'yen', price: 500000 }, v.shop || {}, { on: on ? 1 : 0 }), on ? '販売を始めました（全員に反映）' : '販売をやめました（全員に反映）'); },
  a_cpSave() { this.cpKeep(); const F = this.cpF; if (!F || !F.geo) return this.toast('先にOBJを読み込んでください'); if (!String(F.nm || '').trim()) return this.toast('パーツ名を入れてください');
    const T = F.slot === 'tire' ? cpTireT(CPE.def(F)) : cmXfPos(F.geo, F.xf), car = CPE.prevCar(F) || {}, img = cpThumb(F.geo, T, { color: car.color || '#e10600' }), k = F.k || cuNewId(), old = ((CU.data || {}).items || {})[k] || {};
    const v = { t: 'part', nm: F.nm.trim(), r: F.r, slot: F.slot, geo: cmEnc(F.geo), xf: F.xf, dup: F.dup ? 1 : 0, fit: F.fit, shop: F.shop, img, at: Date.now(), n: old.n != null ? old.n : Object.keys((CU.data || {}).items || {}).length }; if (F.en) v.en = F.en.trim();
    const size = JSON.stringify(v).length; if (size > 2e6) return this.toast('パーツが大きすぎます（' + Math.round(size / 1e6) + 'MB）'); delete CP_BY.cu_prev;
    this.cuWrite('items/' + k, v, F.k ? 'パーツを更新しました（全員に反映）' : 'パーツを作りました（全員に反映）・ID cu_' + k); this.cpF = CPE.newF(); }
});
window.__DLX = Object.assign(window.__DLX || {}, { CP_BY, CPE, cpTireT, cpThumb });
CU.load();
