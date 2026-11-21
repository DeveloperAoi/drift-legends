// =====================================================================
// v71.js — v5.2
//   ・車のカードが集まったら「スターアップできます」演出（今すぐ／あとで を選べる）
//   ・開発者：オリジナルバンドル・デカール・タイヤスモーク・ペイントのプレビュー・アイテムエディター（お絵かき）
//   ・開発者：カスタム車メーカー（OBJ を読み込んでタイヤ・ボディの位置を調整し、ゲームの車として追加）
// =====================================================================

// ---------------- スターアップ演出 ----------------
const SU = {
  busy() { try { if (UI.game && UI.game.active) return true; if (typeof CINE !== 'undefined' && CINE.lock) return true; if (typeof CARFX !== 'undefined' && CARFX.busy) return true; } catch (e) { }
    const ov = $('overlay'); if (ov && !ov.classList.contains('hidden')) return true;
    return ['packFx', 'boxFx', 'carFx', 'acqFx', 'starFx2', 'cbFx', 'goalFx', 'nyFx', 'maintFx', 'suFx', 'imgEd'].some(id => { const e = document.getElementById(id); return e && e.classList.contains('show'); }); },
  ready(id) { const car = CAR_BY_ID[id]; if (!car) return 0; const s = carStars(id), mx = carMaxStars(car); return s < mx && starCards(id) >= STAR_NEED[s + 1] ? s + 1 : 0; },
  next() { const d = SAVE.data; if (!d || !d.cars) return null; const ask = d.suAsk || {}, seen = new Set();
    for (const c of d.cars) { if (seen.has(c.id)) continue; seen.add(c.id); if (typeof MK !== 'undefined' && MK[c.id]) continue; const n = this.ready(c.id); if (n && ask[c.id] !== n) return [c.id, n]; } return null; },
  tick() { try { if (!SAVE.data || !SAVE.data.tutDone || !UI.screen || UI.screen === 'title' || UI.screen === 'devPanel' || SAVE.data.suOff) return; if (SU.busy()) return; const nx = SU.next(); if (nx) SU.show(nx[0], nx[1]); } catch (e) { } },
  show(id, n) { const car = CAR_BY_ID[id]; if (!car || !CINE.begin(id)) return; const d = SAVE.data, mx = carMaxStars(car), have = starCards(id), need = STAR_NEED[n], cost = STAR_COST(n), red = car.redline || 7500;
    let o = document.getElementById('suFx'); if (!o) { o = document.createElement('div'); o.id = 'suFx'; document.body.appendChild(o); }
    const S = UI.show, T0 = performance.now(); let closed = false, raf = 0, eng = null; const T = [], at = (ms, f) => T.push(setTimeout(f, ms));
    o.className = 'show'; o.innerHTML = `<div class="su-bg"></div><div class="su-beam"></div><div class="su-top"><small>STAR UP READY</small><b>${esc(car.name)}</b></div>
      <div class="su-cards">${Array.from({ length: 7 }, (_, k) => `<i style="--k:${k}">${itemIconSvg({ type: 'carcard', rarity: 'L', car: id }, 46)}</i>`).join('')}</div>
      <div class="su-panel"><div class="su-stars">${Array.from({ length: mx }, (_, k) => `<i class="${k < n - 1 ? 'on' : k === n - 1 ? 'tgt' : ''}">★</i>`).join('')}</div>
        <div class="su-bar"><i></i><span>車両カード ${have} / ${need}</span></div><div class="su-msg">カードが集まりました！<b>★${n}</b> にスターアップできます</div>
        <div class="su-perk"><span>ガレージ経験値 +150</span><span>装着できるエキストラ ${starExtraCount(car, n)} 種類</span><span>費用 ${yen(cost)}</span></div>
        <div class="su-btns"><button class="btn pri big" data-su="now">今すぐスターアップ</button><button class="btn big" data-su="later">あとで</button></div><small class="su-note">「あとで」を選んでも、ガレージの車の画面からいつでもスターアップできます</small></div>`;
    const cam = () => { const t = (performance.now() - T0) / 1000; S.idle = -999; S.dist = 9 - 2 * Math.min(1, t / 1.4); S.rot = 0.4 + t * 0.25; S.elev = 0.1; CINE.shiftY = window.innerWidth > window.innerHeight ? 0 : 0.12; CINE.shake = eng ? Math.max(0, (eng.rpm - 1000) / red) * 2 : 0; if (!closed) raf = requestAnimationFrame(cam); };
    raf = requestAnimationFrame(cam); try { AUDIO.cfxWhoosh(0.7); S.model.setLights(true); } catch (e) { }
    at(60, () => o.classList.add('s1')); at(700, () => { o.classList.add('s2'); try { AUDIO.starFly(); } catch (e) { } });
    at(1500, () => { o.classList.add('s3'); try { AUDIO.cfxShine(); eng = mkEng(id); if (eng) eng.play(REV_SCRIPT(red)); } catch (e) { } });
    const close = (go) => { if (closed) return; closed = true; T.forEach(clearTimeout); cancelAnimationFrame(raf); if (eng) try { eng.stop(true); } catch (e) { } CINE.shake = 0; d.suAsk = d.suAsk || {}; d.suAsk[id] = n; SAVE.save(); o.classList.add('out');
      setTimeout(() => { CINE.end(); o.className = ''; o.innerHTML = ''; if (go) { if ((d.money || 0) < cost) return UI.toast(`お金が足りません（${yen(cost)} 必要）。ガレージからあとでスターアップできます`); UI.a_starUp(id); } else UI.toast('ガレージの車の画面からいつでもスターアップできます'); }, 420); };
    o.onclick = e => { const b = e.target.closest('[data-su]'); if (b) close(b.dataset.su === 'now'); else ['s1', 's2', 's3'].forEach(c => o.classList.add(c)); }; }
};
setInterval(SU.tick, 1500);

// ---------------- デカール・タイヤスモーク・プレビュー ----------------
{ const _dd = drawDecalShape; drawDecalShape = function (g, d, look) { const it = ITEM_BY_ID[d]; if (it && it.kind === 'cuimg') { const im = CU_IMG[d]; if (im && im.complete && im.naturalWidth) g.drawImage(im, -50, -25, 100, 50); return; } return _dd.apply(this, arguments); }; }
{ const _ic = itemIconSvg; itemIconSvg = function (it, size = 34) { if (it && it.kind === 'cuimg' && it.cuImg) return `<svg viewBox="0 0 96 48" width="${size * 1.4}" height="${size * 0.7}"><image href="${it.cuImg}" width="96" height="48" preserveAspectRatio="xMidYMid meet"/></svg>`; return _ic.apply(this, arguments); }; }
UI.a_cuPreview = function () { this.cuKeep(); const F = this.cuF, inst = SAVE.cur(); if (!inst || !this.show) return; const look = JSON.parse(JSON.stringify(inst.look || defaultLook(CAR_BY_ID[inst.id])));
  if (F.t === 'paint') { look.color = F.col || '#e10600'; look.paint = F.fin || 'metallic'; }
  else if (F.t === 'decal') { if (!F.img) return this.toast('画像を選ぶか、エディターで描いてください'); const pid = 'cu_prev_decal'; ITEM_BY_ID[pid] = { id: pid, type: 'decal', kind: 'cuimg', cuImg: F.img }; const im = new Image(); im.src = F.img; CU_IMG[pid] = im; look.decals = [pid]; look.decalPos = Object.assign({}, look.decalPos, { [pid]: { f: 'L', x: 0.45, y: 0.55, s: 1.6, r: 0 } }); }
  const go = () => { this.show.sig = ''; this.show.setCar({ id: inst.id, tune: inst.tune, look }, true); this.toast('ショールームの車でプレビュー中（保存はされません）'); };
  if (F.t === 'decal') CU_IMG.cu_prev_decal.onload = go; else go(); };
UI.a_cuDraw = function () { this.cuKeep(); const F = this.cuF, T = CU_TYPES[F.t]; const w = F.t === 'pbanner' ? 320 : T[1], h = F.t === 'pbanner' ? 200 : T[3] || T[1];
  IMGED.open({ w, h, src: F.img, fmt: F.t === 'pbanner' ? 'jpeg' : 'png', title: T[0] }, url => { F.img = url; this.render(); }); };

// ---------------- アイテムエディター（お絵かき） ----------------
const IMGED = {
  open(o, done) { const k = 2, W = Math.round(o.w * k), H = Math.round(o.h * k); this.o = o; this.done = done; this.W = W; this.H = H; this.tool = 'pen'; this.col = this.col || '#ff3a3a'; this.size = this.size || 8; this.op = 1; this.fillOn = true; this.undo = []; this.redo = [];
    let el = document.getElementById('imgEd'); if (!el) { el = document.createElement('div'); el.id = 'imgEd'; document.body.appendChild(el); }
    const TL = [['pen', 'ペン', '✏️'], ['eraser', '消しゴム', '🧽'], ['fill', '塗りつぶし', '🪣'], ['line', '直線', '／'], ['rect', '四角', '▭'], ['ellipse', '丸', '◯'], ['star', '星', '★'], ['heart', 'ハート', '♥'], ['text', '文字', 'A'], ['pick', 'スポイト', '💧']];
    const PAL = ['#000000', '#ffffff', '#ff3a3a', '#ff8a1a', '#ffd21a', '#3adc5a', '#2fbf71', '#3ad8ff', '#2a6aff', '#8a4dff', '#ff4fd8', '#8a5a2a', '#9aa0a8', '#14151a'];
    el.className = 'show'; el.innerHTML = `<div class="ie-box"><div class="ie-top"><b>アイテムエディター</b><small>${esc(o.title || '')}　${o.w}×${o.h}${o.fmt === 'png' ? '（透明OK）' : ''}</small><span class="sp"></span><button class="btn" data-ie="cancel">キャンセル</button><button class="btn pri" data-ie="done">完成</button></div>
      <div class="ie-main"><div class="ie-tools">${TL.map(([t, l, i]) => `<button class="ie-t ${t === this.tool ? 'on' : ''}" data-tool="${t}" title="${l}"><i>${i}</i><span>${l}</span></button>`).join('')}</div>
      <div class="ie-stage"><div class="ie-wrap ${o.fmt === 'png' ? 'chk' : ''}"><canvas class="ie-cv" width="${W}" height="${H}"></canvas><canvas class="ie-ov" width="${W}" height="${H}"></canvas></div></div>
      <div class="ie-side"><div class="ie-row"><input type="color" class="ie-col" value="${this.col}"><div class="ie-pal">${PAL.map(c => `<button style="background:${c}" data-pal="${c}"></button>`).join('')}</div></div>
        <label class="ie-row">太さ <input type="range" class="ie-size" min="1" max="60" value="${this.size}"><b class="ie-sv">${this.size}</b></label>
        <label class="ie-row">不透明度 <input type="range" class="ie-op" min="0.1" max="1" step="0.05" value="1"></label>
        <label class="ie-row"><input type="checkbox" class="ie-fill" checked> 図形を塗りつぶす</label>
        <label class="ie-row">文字 <input class="ie-txt" maxlength="20" placeholder="例：DRIFT" value="DRIFT"></label>
        <div class="ie-row ie-btns"><button class="btn" data-ie="undo">↶ 戻す</button><button class="btn" data-ie="redo">↷ やり直す</button><button class="btn" data-ie="flip">↔ 左右反転</button><button class="btn" data-ie="clear">全部消す</button>
          <label class="btn">画像を読み込む<input type="file" accept="image/*" class="ie-file" style="display:none"></label>${o.fmt === 'png' ? '' : '<button class="btn" data-ie="bg">背景を塗る</button>'}</div>
        <small class="ie-hint">キャンバスをドラッグして描きます。Ctrl+Z で戻す。</small></div></div></div>`;
    this.el = el; this.cv = el.querySelector('.ie-cv'); this.g = this.cv.getContext('2d'); this.ov = el.querySelector('.ie-ov'); this.og = this.ov.getContext('2d');
    if (o.fmt !== 'png') { this.g.fillStyle = o.bg || '#14151a'; this.g.fillRect(0, 0, W, H); }
    if (o.src) { const im = new Image(); im.onload = () => this.g.drawImage(im, 0, 0, W, H); im.src = o.src; }
    el.onclick = e => this.click(e); el.oninput = e => this.input(e); el.onchange = e => { if (e.target.classList.contains('ie-file')) this.load(e.target); };
    this.ov.onpointerdown = e => this.down(e); this.ov.onpointermove = e => this.move(e); this.ov.onpointerup = this.ov.onpointercancel = e => this.up(e);
    this.fitWrap = () => { const st = el.querySelector('.ie-stage'), wr = el.querySelector('.ie-wrap'); if (!st || !wr) return; const r = st.getBoundingClientRect(), sc = Math.min((r.width - 24) / W, (r.height - 24) / H); wr.style.width = Math.max(40, W * sc) + 'px'; wr.style.height = Math.max(20, H * sc) + 'px'; };
    requestAnimationFrame(this.fitWrap); window.addEventListener('resize', this.fitWrap);
    this._key = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); this.doUndo(); } }; document.addEventListener('keydown', this._key); },
  close() { this.el.className = ''; this.el.innerHTML = ''; document.removeEventListener('keydown', this._key); window.removeEventListener('resize', this.fitWrap); },
  snap() { this.undo.push(this.g.getImageData(0, 0, this.W, this.H)); if (this.undo.length > 30) this.undo.shift(); this.redo = []; },
  doUndo() { if (!this.undo.length) return; this.redo.push(this.g.getImageData(0, 0, this.W, this.H)); this.g.putImageData(this.undo.pop(), 0, 0); },
  doRedo() { if (!this.redo.length) return; this.undo.push(this.g.getImageData(0, 0, this.W, this.H)); this.g.putImageData(this.redo.pop(), 0, 0); },
  click(e) { const t = e.target.closest('[data-tool],[data-pal],[data-ie]'); if (!t) return; const g = this.g;
    if (t.dataset.tool) { this.tool = t.dataset.tool; this.el.querySelectorAll('.ie-t').forEach(b => b.classList.toggle('on', b === t)); return; }
    if (t.dataset.pal) { this.col = t.dataset.pal; this.el.querySelector('.ie-col').value = this.col; return; }
    const a = t.dataset.ie;
    if (a === 'cancel') return this.close();
    if (a === 'done') { const o = this.o, c = document.createElement('canvas'); c.width = o.w; c.height = o.h; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; if (o.fmt !== 'png') { x.fillStyle = o.bg || '#14151a'; x.fillRect(0, 0, o.w, o.h); } x.drawImage(this.cv, 0, 0, o.w, o.h);
      const url = c.toDataURL(o.fmt === 'png' ? 'image/png' : 'image/jpeg', 0.85); if (url.length > 200000) return UI.toast('画像が大きすぎます（色数を減らしてください）'); this.close(); this.done && this.done(url); return; }
    if (a === 'undo') return this.doUndo(); if (a === 'redo') return this.doRedo();
    this.snap();
    if (a === 'clear') { g.clearRect(0, 0, this.W, this.H); if (this.o.fmt !== 'png') { g.fillStyle = this.o.bg || '#14151a'; g.fillRect(0, 0, this.W, this.H); } }
    if (a === 'bg') { g.save(); g.globalCompositeOperation = 'destination-over'; g.fillStyle = this.col; g.fillRect(0, 0, this.W, this.H); g.restore(); }
    if (a === 'flip') { const c = document.createElement('canvas'); c.width = this.W; c.height = this.H; c.getContext('2d').drawImage(this.cv, 0, 0); g.clearRect(0, 0, this.W, this.H); g.save(); g.translate(this.W, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); g.restore(); } },
  input(e) { const t = e.target; if (t.classList.contains('ie-col')) this.col = t.value; if (t.classList.contains('ie-size')) { this.size = +t.value; this.el.querySelector('.ie-sv').textContent = t.value; } if (t.classList.contains('ie-op')) this.op = +t.value; if (t.classList.contains('ie-fill')) this.fillOn = t.checked; },
  load(inp) { const f = inp.files && inp.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { const im = new Image(); im.onload = () => { this.snap(); const s = Math.min(this.W / im.width, this.H / im.height), w = im.width * s, h = im.height * s; this.g.drawImage(im, (this.W - w) / 2, (this.H - h) / 2, w, h); }; im.src = rd.result; }; rd.readAsDataURL(f); inp.value = ''; },
  pt(e) { const r = this.ov.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * this.W, (e.clientY - r.top) / r.height * this.H]; },
  style(g) { g.globalAlpha = this.op; g.strokeStyle = g.fillStyle = this.col; g.lineWidth = this.size; g.lineCap = g.lineJoin = 'round'; },
  down(e) { e.preventDefault(); this.ov.setPointerCapture(e.pointerId); const p = this.pt(e), g = this.g, t = this.tool; this.p0 = p; this.last = p; this.drag = true;
    if (t === 'pick') { const d = g.getImageData(p[0] | 0, p[1] | 0, 1, 1).data; this.col = '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join(''); this.el.querySelector('.ie-col').value = this.col; this.drag = false; return; }
    this.snap();
    if (t === 'fill') { this.flood(p[0] | 0, p[1] | 0); this.drag = false; return; }
    if (t === 'text') { const s = this.el.querySelector('.ie-txt').value || 'DRIFT'; g.save(); this.style(g); g.font = `900 ${this.size * 4}px Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, p[0], p[1]); g.restore(); this.drag = false; return; }
    if (t === 'pen' || t === 'eraser') { g.save(); this.style(g); if (t === 'eraser') { g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 1; } g.beginPath(); g.arc(p[0], p[1], this.size / 2, 0, Math.PI * 2); g.fill(); g.restore(); } },
  move(e) { if (!this.drag) return; const p = this.pt(e), t = this.tool, g = this.g;
    if (t === 'pen' || t === 'eraser') { g.save(); this.style(g); if (t === 'eraser') { g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 1; } g.beginPath(); g.moveTo(this.last[0], this.last[1]); g.lineTo(p[0], p[1]); g.stroke(); g.restore(); this.last = p; return; }
    const o = this.og; o.clearRect(0, 0, this.W, this.H); this.shape(o, this.p0, p); },
  up(e) { if (!this.drag) return; this.drag = false; const t = this.tool; if (['line', 'rect', 'ellipse', 'star', 'heart'].includes(t)) { this.og.clearRect(0, 0, this.W, this.H); this.shape(this.g, this.p0, this.pt(e)); } },
  shape(g, a, b) { const t = this.tool, x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = Math.abs(b[0] - a[0]), h = Math.abs(b[1] - a[1]), cx = x + w / 2, cy = y + h / 2; g.save(); this.style(g); g.beginPath();
    if (t === 'line') { g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.restore(); return; }
    if (t === 'rect') g.rect(x, y, w, h);
    if (t === 'ellipse') g.ellipse(cx, cy, w / 2 || 1, h / 2 || 1, 0, 0, Math.PI * 2);
    if (t === 'star') for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.45 : 1, an = -Math.PI / 2 + i * Math.PI / 5, px = cx + Math.cos(an) * w / 2 * r, py = cy + Math.sin(an) * h / 2 * r; i ? g.lineTo(px, py) : g.moveTo(px, py); }
    if (t === 'heart') { g.moveTo(cx, y + h * 0.3); g.bezierCurveTo(cx, y, x, y, x, y + h * 0.3); g.bezierCurveTo(x, y + h * 0.6, cx, y + h * 0.8, cx, y + h); g.bezierCurveTo(cx, y + h * 0.8, x + w, y + h * 0.6, x + w, y + h * 0.3); g.bezierCurveTo(x + w, y, cx, y, cx, y + h * 0.3); }
    g.closePath(); this.fillOn ? g.fill() : g.stroke(); g.restore(); },
  flood(x, y) { const W = this.W, H = this.H; if (x < 0 || y < 0 || x >= W || y >= H) return; const id = this.g.getImageData(0, 0, W, H), d = id.data, i0 = (y * W + x) * 4, tg = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]];
    const n = parseInt(this.col.slice(1), 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255, Math.round(this.op * 255)]; const m = i => Math.abs(d[i] - tg[0]) + Math.abs(d[i + 1] - tg[1]) + Math.abs(d[i + 2] - tg[2]) + Math.abs(d[i + 3] - tg[3]) <= 60;
    const seen = new Uint8Array(W * H), st = [x, y];
    while (st.length) { const py = st.pop(), px = st.pop(); let l = px; while (l >= 0 && !seen[py * W + l] && m((py * W + l) * 4)) l--; l++; let up = false, dn = false;
      for (let xx = l; xx < W; xx++) { const p = py * W + xx; if (seen[p] || !m(p * 4)) break; seen[p] = 1;
        if (py > 0) { const q = p - W, ok = !seen[q] && m(q * 4); if (ok && !up) { st.push(xx, py - 1); up = true; } else if (!ok) up = false; }
        if (py < H - 1) { const q = p + W, ok = !seen[q] && m(q * 4); if (ok && !dn) { st.push(xx, py + 1); dn = true; } else if (!ok) dn = false; } } }
    for (let p = 0; p < W * H; p++) if (seen[p]) { const q = p * 4; d[q] = c[0]; d[q + 1] = c[1]; d[q + 2] = c[2]; d[q + 3] = c[3]; } this.g.putImageData(id, 0, 0); }
};
// パックの表紙もエディターで描ける
UI.a_cuCoverDraw = function () { this.cuKeep(); const F = this.cuF; IMGED.open({ w: 200, h: 180, src: F.cover, fmt: 'jpeg', title: 'パックの表紙' }, url => { F.cover = url; this.render(); }); };
{ const _dp = UI.r_devPanel; UI.r_devPanel = function () { let h = _dp.call(this); if (this.tab === 'creator' && (this.cuSub || 'item') === 'pack') h = h.replace('<input type="file" accept="image/*" data-in="cuCover" style="display:none"></label>', '<input type="file" accept="image/*" data-in="cuCover" style="display:none"></label><button class="btn" data-a="cuCoverDraw">エディターで描く</button>'); return h; }; }

// ---------------- オリジナルバンドル ----------------
const CB_KINDS = [['money', 'お金'], ['dia', 'ダイヤ'], ['pack', 'パック'], ['item', 'アイテム'], ['car', '車'], ['star', '車両カード（スターアップ用）'], ['card', '限定車カード（交換用）'], ['ticket', 'フルチューンチケット']];
{ const _ap = CU.apply; CU.apply = function (data) { _ap.call(this, data); const D = this.data || {};
    for (let i = BUNDLES.length - 1; i >= 0; i--) if (BUNDLES[i].custom) BUNDLES.splice(i, 1);
    cuApplyCars(D.cars || {});
    for (const [k, v] of Object.entries(D.bundles || {})) { if (!v || !v.items) continue; const items = v.items.filter(x => x && (['car', 'star', 'card'].includes(x[0]) ? CAR_BY_ID[x[1]] : x[0] === 'pack' ? CHESTS.find(c => c.id === x[1]) : x[0] === 'item' ? ITEM_BY_ID[x[1]] : true));
      if (!items.length) continue; const price = Math.max(0, +v.price || 0);
      BUNDLES.unshift({ id: 'cb_' + k, name: String(v.nm || 'オリジナルバンドル').slice(0, 30), desc: String(v.desc || '').slice(0, 60) || items.map(cbLabel).join(' ＋ '), items, cur: v.cur === 'dia' ? 'dia' : 'yen', price, old: Math.max(price, +v.old || 0), tag: String(v.tag || 'NEW').slice(0, 8), col: v.col || '#ff6a2a', custom: 1, lim: v.lim || 'week', end: +v.end || 0, cover: v.cover }); }
    try { if (UI.screen === 'store') UI.render(); } catch (e) { } }; }
function cbLabel(x) { const [k, a, n] = x; if (k === 'money') return yen(a); if (k === 'dia') return 'ダイヤ ×' + a; if (k === 'ticket') return 'フルチューンチケット ×' + a; if (k === 'pack') { const c = CHESTS.find(c => c.id === a); return (c ? c.name : a) + ' ×' + (n || 1); }
  if (k === 'item') { const it = ITEM_BY_ID[a]; return (it ? it.name : a) + ((n || 1) > 1 ? ' ×' + n : ''); } const car = CAR_BY_ID[a]; if (k === 'car') return car ? car.name : a; return (car ? car.name : a) + (k === 'star' ? ' 車両カード' : ' カード') + ' ×' + (n || 1); }
{ const _bb = bundleBought; bundleBought = function (b) { if (b && b.custom) { const v = (SAVE.data.bundles || {})[b.id]; if (b.lim === 'none') return false; if (b.lim === 'once') return !!v; } return _bb(b); }; }
{ const _bf = BUNDLES.filter; BUNDLES.filter = function (fn, t) { return _bf.call(this, (b, i, a) => !(b.custom && b.end && SRV.now() > b.end) && fn.call(t, b, i, a)); }; }
{ const _gb = grantBundle; grantBundle = function (b) { const d = SAVE.data, mine = b.items.filter(x => ['dia', 'item', 'star'].includes(x[0])), r = _gb(Object.assign({}, b, { items: b.items.filter(x => !mine.includes(x)) }));
    for (const [k, a, n] of mine) { if (k === 'dia') { d.diamonds = (d.diamonds || 0) + a; r.out.push('ダイヤ ×' + a); }
      if (k === 'item') { const it = ITEM_BY_ID[a]; if (it) { for (let i = 0; i < (n || 1); i++) grantChestItem(it); r.out.push(cbLabel([k, a, n])); } }
      if (k === 'star') { d.starCards = d.starCards || {}; d.starCards[a] = (d.starCards[a] || 0) + (n || 1); r.out.push(cbLabel([k, a, n])); } } return r; }; }
{ const _ba = UI.bundleArt; UI.bundleArt = function (b) { if (!b.custom) return _ba.apply(this, arguments); if (b.cover) return `<img class="cb-cover" src="${b.cover}" alt="">`;
    return b.items.slice(0, 3).map(([k, a, n]) => { let ic = ''; if (k === 'car' || k === 'star' || k === 'card') ic = packCarSvg(a, 64); else if (k === 'pack') { const c = CHESTS.find(c => c.id === a); ic = c ? packPouch(c, 0.26) : ''; } else if (k === 'item') ic = itemIconSvg(ITEM_BY_ID[a], 40); else if (k === 'dia') ic = SICO.gem(30); else if (k === 'money') ic = '<b class="cb-yen">¥</b>'; else ic = '<b class="cb-yen">🎫</b>';
      const q = k === 'money' ? yen(a) : k === 'dia' || k === 'ticket' ? '×' + a : k === 'car' ? '' : '×' + (n || 1); return `<span class="st-chip">${ic}${q ? `<em>${q}</em>` : ''}</span>`; }).join(''); }; }
{ const _rs = UI.r_store; UI.r_store = function () { let h = _rs.apply(this, arguments); if (typeof h !== 'string') return h;
    for (const b of BUNDLES) { if (!b.custom) continue; const at = h.indexOf(`data-a="stBundle" data-v="${b.id}"`); if (at < 0) continue;
      const lab = b.lim === 'none' ? '何回でも' : b.lim === 'once' ? '1回' : '今週1回'; h = h.slice(0, at) + h.slice(at).replace(/(<\/button><span class="st-bubble">)[^<]*/, '$1' + lab).replace('購入済み（今週）', b.lim === 'once' ? '購入済み' : '購入済み（今週）');
      if (b.old <= b.price) { const cs = h.lastIndexOf('<div class="st-card"', at); if (cs >= 0) { let seg = h.slice(cs, at); seg = seg.replace(/<span class="st-badge sale">[^<]*<\/span>/, ''); const os = seg.indexOf('<div class="st-old">'); if (os >= 0) { const oe = seg.indexOf('</div>', os); seg = seg.slice(0, os) + seg.slice(oe + 6); } h = h.slice(0, cs) + seg + h.slice(at); } } }
    return h; }; }

// ---------------- 開発者メニュー：バンドル／カスタム車メーカー ----------------
const cbNew = () => ({ nm: '', desc: '', tag: 'NEW', col: '#ff6a2a', cur: 'yen', price: 3000000, old: 0, lim: 'week', end: 0, rows: [['money', 1000000, 1]] });
const dtv = t => t ? new Date(t + 9 * 3600000).toISOString().slice(0, 16) : '';
UI.cuExtra = function (sub, D, online) { const dis = online ? '' : 'disabled';
  if (sub === 'bundle') { const F = this.cbF || (this.cbF = cbNew()), list = Object.entries(D.bundles || {});
    const packs = CHESTS.filter(c => !c.daily && !c.reward), cars = CARS.filter(c => c.id !== 'cu_car_prev'), cuItems = Object.entries(D.items || {}).map(([k, v]) => [CU.itemId(k, v), v.nm]);
    const opt = (L, cur) => L.map(([v, l]) => `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('');
    const arg = (r, i) => { const [k, a, n] = r; if (k === 'pack') return `<select id="cbA${i}">${opt(packs.map(c => [c.id, c.name]), a)}</select><input id="cbN${i}" type="number" min="1" max="50" value="${n || 1}" class="cb-n">`;
      if (k === 'car') return `<select id="cbA${i}">${opt(cars.map(c => [c.id, c.name]), a)}</select>`;
      if (k === 'star' || k === 'card') return `<select id="cbA${i}">${opt(cars.map(c => [c.id, c.name]), a)}</select><input id="cbN${i}" type="number" min="1" max="200" value="${n || 1}" class="cb-n">`;
      if (k === 'item') return `<input id="cbA${i}" list="cbItems" placeholder="アイテムID（例 tt_24）" value="${esc(a || '')}"><input id="cbN${i}" type="number" min="1" max="50" value="${n || 1}" class="cb-n">`;
      return `<input id="cbA${i}" type="number" min="1" value="${a || (k === 'money' ? 1000000 : k === 'dia' ? 100 : 1)}">`; };
    return `<div class="cu-form"><div class="row"><label>名前</label><input id="cbNm" maxlength="30" value="${esc(F.nm)}" placeholder="例：スターター スーパーセット"></div><div class="row"><label>説明（空なら中身から自動）</label><input id="cbDs" maxlength="60" value="${esc(F.desc)}"></div>
      <div class="row"><label>ラベル</label><input id="cbTg" maxlength="8" value="${esc(F.tag)}" placeholder="HOT"><input type="color" id="cbCl" value="${F.col}"></div>
      <div class="row"><label>画像（任意）</label><label class="btn">画像を選ぶ<input type="file" accept="image/*" data-in="cbCover" style="display:none"></label><button class="btn" data-a="cbDraw">エディターで描く</button>${F.cover ? `<img class="cu-img" src="${F.cover}" width="64" height="58" alt=""><button class="btn" data-a="cbCoverDel">画像を外す</button>` : '<small class="set-note">なければ中身のアイコンを表示</small>'}</div>
      <div class="row"><label>お金／ダイヤ</label><select id="cbCu"><option value="yen" ${F.cur !== 'dia' ? 'selected' : ''}>お金</option><option value="dia" ${F.cur === 'dia' ? 'selected' : ''}>ダイヤ</option></select></div>
      <div class="row"><label>値段</label><input id="cbPr" type="number" min="0" value="${F.price}"></div><div class="row"><label>元の値段（任意・セール表示）</label><input id="cbOl" type="number" min="0" value="${F.old || ''}" placeholder="なしならセール表示なし"></div>
      <div class="row"><label>購入回数</label><select id="cbLm">${opt([['week', '1週間に1回'], ['once', '1回だけ'], ['none', '何回でも']], F.lim)}</select></div><div class="row"><label>販売終了（任意・日本時間）</label><input id="cbEn" type="datetime-local" value="${dtv(F.end)}"></div>
      <div class="h3">中身</div><datalist id="cbItems">${cuItems.map(([id, nm]) => `<option value="${id}">${esc(nm || '')}</option>`).join('')}</datalist>
      ${F.rows.map((r, i) => `<div class="cb-row"><select data-in="cbK" data-i="${i}">${opt(CB_KINDS, r[0])}</select>${arg(r, i)}<button class="btn" data-a="cbDel" data-v="${i}">✕</button></div>`).join('')}
      <div class="btns"><button class="btn" data-a="cbAdd">＋ 中身を追加</button></div>
      <div class="btns"><button class="btn pri" data-a="cbSave" ${dis}>${F.edit ? '変更を保存' : 'バンドルを作ってショップに並べる'}</button>${F.edit ? '<button class="btn" data-a="cbNewF">新しく作る</button>' : ''}</div><small class="set-note">ショップの「オファー」→「期間限定バンドル」に並びます。</small></div>
      <div class="h3">作ったバンドル（${list.length}）</div><div class="cu-list">${list.map(([k, v]) => `<div class="cu-it"><span class="cu-pv">${v.cover ? `<img class="cu-img" src="${v.cover}" width="50" height="45" alt="">` : `<i class="cb-sw" style="background:${v.col}"></i>`}</span><b>${esc(v.nm || '')}</b><small>${v.cur === 'dia' ? 'ダイヤ ' + v.price : yen(v.price || 0)} ・ ${{ week: '週1回', once: '1回', none: '何回でも' }[v.lim] || ''} ・ ${(v.items || []).length}点${v.end ? ' ・ 〜' + dtv(v.end).replace('T', ' ') : ''}</small><div><button class="btn" data-a="cbEdit" data-v="${k}">編集</button><button class="btn" data-a="cbDelB" data-v="${k}" ${dis}>削除</button></div></div>`).join('') || '<div class="note">まだありません</div>'}</div>`; }
  if (sub === 'car') return CM.html(D, online);
  return ''; };
Object.assign(UI, {
  cbKeep() { const F = this.cbF; if (!F || !$('cbNm')) return; const v = id => ($(id) || {}).value; Object.assign(F, { nm: v('cbNm'), desc: v('cbDs'), tag: v('cbTg'), col: v('cbCl'), cur: v('cbCu'), price: +v('cbPr') || 0, old: +v('cbOl') || 0, lim: v('cbLm'), end: this._dt('cbEn') });
    F.rows = F.rows.map((r, i) => { const a = $('cbA' + i), n = $('cbN' + i); const A = a ? (['money', 'dia', 'ticket'].includes(r[0]) ? +a.value || 0 : a.value.trim()) : r[1]; return [r[0], A, n ? Math.max(1, +n.value || 1) : 1]; }); },
  in_cbK(v, el) { this.cbKeep(); const i = +el.dataset.i; this.cbF.rows[i] = [v, v === 'money' ? 1000000 : v === 'dia' ? 100 : v === 'ticket' ? 1 : '', 1]; this.render(); },
  a_cbAdd() { this.cbKeep(); if (this.cbF.rows.length >= 8) return this.toast('中身は8つまでです'); this.cbF.rows.push(['pack', 'gold', 1]); this.render(); },
  a_cbDel(i) { this.cbKeep(); this.cbF.rows.splice(+i, 1); this.render(); },
  async in_cbCover(v, el) { const f = el.files && el.files[0]; if (!f) return; this.cbKeep(); try { this.cbF.cover = await cuResize(f, 0, 'jpeg', 240, 216); } catch (e) { return this.toast('画像を読み込めませんでした'); } this.render(); },
  a_cbDraw() { this.cbKeep(); IMGED.open({ w: 240, h: 216, src: this.cbF.cover, fmt: 'jpeg', title: 'バンドルの画像' }, url => { this.cbF.cover = url; this.render(); }); },
  a_cbCoverDel() { this.cbKeep(); this.cbF.cover = ''; this.render(); },
  a_cbNewF() { this.cbF = cbNew(); this.render(); },
  a_cbEdit(k) { const v = ((CU.data || {}).bundles || {})[k]; if (!v) return; this.cbF = { nm: v.nm, desc: v.desc || '', tag: v.tag || 'NEW', col: v.col || '#ff6a2a', cover: v.cover, cur: v.cur, price: v.price, old: v.old || 0, lim: v.lim || 'week', end: v.end || 0, rows: (v.items || []).map(x => x.slice()), edit: k }; this.render(); },
  a_cbDelB(k) { if (!confirm('このバンドルを削除しますか？')) return; this.cuWrite('bundles/' + k, null, 'バンドルを削除しました'); },
  a_cbSave() { this.cbKeep(); const F = this.cbF; if (!String(F.nm).trim()) return this.toast('名前を入れてください'); const rows = F.rows.filter(r => r[1] !== '' && r[1] !== 0); if (!rows.length) return this.toast('中身を1つ以上入れてください');
    for (const r of rows) { if (r[0] === 'item' && !ITEM_BY_ID[r[1]]) return this.toast('アイテムIDが見つかりません：' + r[1]); if (['car', 'star', 'card'].includes(r[0]) && !CAR_BY_ID[r[1]]) return this.toast('車が見つかりません'); }
    const k = F.edit || cuNewId(), v = { nm: F.nm.trim(), desc: (F.desc || '').trim(), tag: F.tag || 'NEW', col: F.col, cur: F.cur === 'dia' ? 'dia' : 'yen', price: Math.round(F.price), old: Math.round(F.old || 0), lim: F.lim, end: F.end || 0, items: rows, at: Date.now() }; if (F.cover) v.cover = F.cover;
    this.cuWrite('bundles/' + k, v, F.edit ? 'バンドルを更新しました（全員に反映）' : 'バンドルを作ってショップに並べました（全員に反映）'); this.cbF = cbNew(); }
});

// =====================================================================
// カスタム車メーカー
// =====================================================================
BODY_TYPES.cuobj = Object.assign({}, BODY_TYPES.coupe90); CUSTOM_BODY.cuobj = 1;
const CU_GEO = {}, CM_MAXTRI = 24000;
const cmB64 = buf => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const cmUnB64 = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u.buffer; };
function cmParseObj(txt) { const V = [], groups = new Map(); let o = '', g = '', mtl = '', cur = null; const lines = txt.split(/\r?\n/);
  for (let ln of lines) { ln = ln.trim(); if (!ln || ln[0] === '#') continue; const sp = ln.indexOf(' '), tag = sp < 0 ? ln : ln.slice(0, sp), rest = sp < 0 ? '' : ln.slice(sp + 1).trim();
    if (tag === 'v') { const p = rest.split(/\s+/); V.push(+p[0] || 0, +p[1] || 0, +p[2] || 0); }
    else if (tag === 'o') { o = rest; cur = null; } else if (tag === 'g') { g = rest; cur = null; } else if (tag === 'usemtl') { mtl = rest; cur = null; }
    else if (tag === 'f') { const nv = V.length / 3, ix = rest.split(/\s+/).map(p => { const i = parseInt(p, 10); return i < 0 ? nv + i : i - 1; }); if (ix.some(i => !(i >= 0 && i < nv))) continue;
      if (!cur) { const key = (o || g || 'part') + (mtl ? ' / ' + mtl : ''); cur = groups.get(key); if (!cur) { cur = { n: key, t: [] }; groups.set(key, cur); } }
      for (let k = 1; k < ix.length - 1; k++) cur.t.push(ix[0], ix[k], ix[k + 1]); } }
  const remap = new Int32Array(V.length / 3).fill(-1), pos = [], idx = [], out = [];
  for (const gg of groups.values()) { if (!gg.t.length) continue; const s = idx.length; for (const v of gg.t) { if (remap[v] < 0) { remap[v] = pos.length / 3; pos.push(V[v * 3], V[v * 3 + 1], V[v * 3 + 2]); } idx.push(remap[v]); }
    const nm = gg.n.toLowerCase(); const role = /wheel|tire|tyre|rim|タイヤ|ホイール/.test(nm) ? 'hide' : /glass|window|windshield|ガラス|窓/.test(nm) ? 'glass' : /head|ヘッドライト/.test(nm) && /light|lamp|ライト/.test(nm) ? 'head' : /tail|brake|テール/.test(nm) ? 'tail' : /chrome|metal|silver|メッキ/.test(nm) ? 'chrome' : /black|rubber|grill|interior|seat|dark/.test(nm) ? 'dark' : 'body';
    out.push({ n: gg.n.slice(0, 40), s, c: idx.length - s, role, col: '#888888' }); }
  return { pos: new Float32Array(pos), idx: new Uint32Array(idx), groups: out }; }
function cmSimplify(geo, max) { if (geo.idx.length / 3 <= max) return geo; const P = geo.pos, n = P.length / 3; let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], P[i * 3 + a]); mx[a] = Math.max(mx[a], P[i * 3 + a]); }
  let cell = Math.hypot(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) / 500, out = geo;
  for (let it = 0; it < 16; it++) { const map = new Map(), rm = new Int32Array(n), sum = []; for (let i = 0; i < n; i++) { const key = Math.floor((P[i * 3] - mn[0]) / cell) + ',' + Math.floor((P[i * 3 + 1] - mn[1]) / cell) + ',' + Math.floor((P[i * 3 + 2] - mn[2]) / cell); let j = map.get(key); if (j === undefined) { j = sum.length / 4; map.set(key, j); sum.push(0, 0, 0, 0); } rm[i] = j; sum[j * 4] += P[i * 3]; sum[j * 4 + 1] += P[i * 3 + 1]; sum[j * 4 + 2] += P[i * 3 + 2]; sum[j * 4 + 3]++; }
    const pos = new Float32Array(sum.length / 4 * 3); for (let j = 0; j < sum.length / 4; j++) for (let a = 0; a < 3; a++) pos[j * 3 + a] = sum[j * 4 + a] / sum[j * 4 + 3];
    const idx = [], groups = []; for (const g of geo.groups) { const s = idx.length; for (let t = g.s; t < g.s + g.c; t += 3) { const a = rm[geo.idx[t]], b = rm[geo.idx[t + 1]], c = rm[geo.idx[t + 2]]; if (a !== b && b !== c && a !== c) idx.push(a, b, c); } if (idx.length > s) groups.push(Object.assign({}, g, { s, c: idx.length - s })); }
    out = { pos, idx: new Uint32Array(idx), groups }; if (idx.length / 3 <= max) break; cell *= 1.3; }
  return out; }
function cmEnc(geo) { const P = geo.pos, n = P.length / 3, bb = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9]; for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) { bb[a] = Math.min(bb[a], P[i * 3 + a]); bb[a + 3] = Math.max(bb[a + 3], P[i * 3 + a]); }
  const q = new Int16Array(n * 3); for (let i = 0; i < n * 3; i++) { const a = i % 3, e = bb[a + 3] - bb[a] || 1; q[i] = Math.round((P[i] - bb[a]) / e * 65535) - 32768; }
  const w = n < 65536 ? 2 : 4, I = w === 2 ? Uint16Array.from(geo.idx) : geo.idx; return { v: cmB64(q.buffer), i: cmB64(I.buffer), w, bb, g: geo.groups.map(g => [g.n, g.s, g.c, g.role, g.col || '#888888']) }; }
function cmDec(e) { try { const q = new Int16Array(cmUnB64(e.v)), bb = e.bb, pos = new Float32Array(q.length); for (let i = 0; i < q.length; i++) { const a = i % 3; pos[i] = bb[a] + (q[i] + 32768) / 65535 * (bb[a + 3] - bb[a]); }
    const ib = cmUnB64(e.i), idx = e.w === 2 ? Uint32Array.from(new Uint16Array(ib)) : new Uint32Array(ib); return { pos, idx, groups: (e.g || []).map(g => ({ n: g[0], s: g[1], c: g[2], role: g[3], col: g[4] })) }; } catch (err) { return { pos: new Float32Array(0), idx: new Uint32Array(0), groups: [] }; } }
function cmXfPos(geo, xf) { const P = geo.pos, n = P.length / 3, T = new Float32Array(P.length), a = (xf.yaw || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), sc = xf.s || 1;
  for (let i = 0; i < n; i++) { let x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2]; if (xf.zup) { const t = y; y = z; z = -t; } if (xf.mir) x = -x; const X = x * c + z * s, Z = -x * s + z * c; T[i * 3] = X * sc + (xf.ox || 0); T[i * 3 + 1] = y * sc + (xf.oy || 0); T[i * 3 + 2] = Z * sc + (xf.oz || 0); } return T; }
const CM_ROLE = { body: ['ボディ（塗装の色）'], color: ['好きな色'], dark: ['黒い部品', [0.04, 0.04, 0.05]], chrome: ['メッキ', [0.85, 0.87, 0.9]], glass: ['ガラス', [0.08, 0.1, 0.13]], head: ['ヘッドライト', [1, 1, 1]], tail: ['テールライト', [1, 0.1, 0.1]], hide: ['表示しない'] };
function cmMeshes(R, m, C, look, opts, car) { const geo = C.geo; if (!geo || !geo.idx.length) return; const gl = R.gl, A = opts.ghost ? { blend: true, alpha: 0.35, depthWrite: false } : {}, T = cmXfPos(geo, C.xf), I = geo.idx, nt = I.length / 3, nv = T.length / 3, flip = C.xf.flip ? -1 : 1;
  const FN = new Float32Array(nt * 3); for (let t = 0; t < nt; t++) { const a = I[t * 3] * 3, b = I[t * 3 + 1] * 3, c = I[t * 3 + 2] * 3, ux = T[b] - T[a], uy = T[b + 1] - T[a + 1], uz = T[b + 2] - T[a + 2], vx = T[c] - T[a], vy = T[c + 1] - T[a + 1], vz = T[c + 2] - T[a + 2]; let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; FN[t * 3] = nx / l * flip; FN[t * 3 + 1] = ny / l * flip; FN[t * 3 + 2] = nz / l * flip; }
  const st = new Uint32Array(nv + 1); for (let i = 0; i < I.length; i++) st[I[i] + 1]++; for (let i = 0; i < nv; i++) st[i + 1] += st[i]; const fl = new Uint32Array(I.length), fill = st.slice(0, nv); for (let i = 0; i < I.length; i++) fl[fill[I[i]]++] = (i / 3) | 0;
  const G = {}, paint = hexToRgb(look.color || car.color); for (const g of geo.groups) { if (g.role === 'hide') continue; const gb = G[g.role] || (G[g.role] = new GB()), col = g.role === 'body' ? paint : g.role === 'color' ? hexToRgb(g.col || '#888888') : CM_ROLE[g.role][1];
    for (let t = g.s / 3; t < (g.s + g.c) / 3; t++) { const fx = FN[t * 3], fy = FN[t * 3 + 1], fz = FN[t * 3 + 2]; const corner = k => { const v = I[t * 3 + k]; let nx = 0, ny = 0, nz = 0; for (let j = st[v]; j < st[v + 1]; j++) { const f = fl[j]; const d = FN[f * 3] * fx + FN[f * 3 + 1] * fy + FN[f * 3 + 2] * fz; if (d > 0.72) { nx += FN[f * 3]; ny += FN[f * 3 + 1]; nz += FN[f * 3 + 2]; } } const l = Math.hypot(nx, ny, nz) || 1; gb.v(T[v * 3], T[v * 3 + 1], T[v * 3 + 2], nx / l, ny / l, nz / l, col, 0, 0); };
      if (flip > 0) { corner(0); corner(1); corner(2); } else { corner(0); corner(2); corner(1); } } }
  const add = (g, mat) => { if (!g || !g.count) return; const me = new Mesh(gl, g.a); m.meshes.push(me); m.body.addMesh(me, mat); };
  add(G.body, Mat(Object.assign({ refl: 0.3, spec: 1, shin: 80, clear: 1, metal: 0.2 }, A))); add(G.color, Mat(Object.assign({ spec: 0.5, shin: 50 }, A))); add(G.dark, Mat(Object.assign({ spec: 0.25, shin: 30 }, A))); add(G.chrome, Mat(Object.assign({ refl: 0.85, spec: 2, shin: 160, metal: 1 }, A)));
  add(G.glass, m.glassMat || Mat(Object.assign({ refl: 0.7, spec: 2, shin: 160 }, A))); add(G.head, m.headMat); add(G.tail, m.brakeMat);
  const wh = C.wh || {}; for (const w of m.wheels) { w.hub.visible = wh.show !== 0; const tr = wh.tr || 0.33; w.hub.scale = tr / 0.33; w.hub.pos = [w.side * (wh.trk || 1.5) / 2, tr + (wh.wy || 0), w.front ? (wh.axF || 1.3) : (wh.axR || -1.3)]; w.x = w.hub.pos[0]; w.z = w.hub.pos[2]; } }
{ const _bm = buildCarModel; buildCarModel = function (R, car, look, opts = {}) { const m = _bm.apply(this, arguments); if (!car || !car.cuCarObj || !m) return m;
    try { m.body.parts.length = 0; m.body.children.length = 0; cmMeshes(R, m, car.cuCarObj, look || {}, opts, car); } catch (e) { console.error(e); } return m; }; }
// 一覧などのアイコン
{ const _pc = packCarSvg; packCarSvg = function (car, s = 120) { const c = CAR_BY_ID[car]; if (c && c.cuThumb) return `<svg class="pk-car" viewBox="0 0 186 84" width="${s}" height="${s * 84 / 186}"><image href="${c.cuThumb}" width="186" height="84" preserveAspectRatio="xMidYMid meet"/></svg>`; return _pc.apply(this, arguments); }; }
function cmThumb(geo, xf, wh, look) { const cv = document.createElement('canvas'); cv.width = 372; cv.height = 168; const g = cv.getContext('2d'), T = cmXfPos(geo, xf), I = geo.idx; let z0 = 1e9, z1 = -1e9, y1 = -1e9;
  for (let i = 0; i < T.length; i += 3) { z0 = Math.min(z0, T[i + 2]); z1 = Math.max(z1, T[i + 2]); y1 = Math.max(y1, T[i + 1]); } const sc = Math.min(340 / ((z1 - z0) || 1), 140 / (y1 || 1)), ox = 186 - (z0 + z1) / 2 * sc, oy = 156, P = (z, y) => [ox + z * sc, oy - y * sc];
  const tris = []; for (const gr of geo.groups) { if (gr.role === 'hide') continue; const base = gr.role === 'body' ? hexToRgb(look.color) : gr.role === 'color' ? hexToRgb(gr.col) : CM_ROLE[gr.role][1];
    for (let t = gr.s; t < gr.s + gr.c; t += 3) { const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3; const ux = T[b] - T[a], uy = T[b + 1] - T[a + 1], uz = T[b + 2] - T[a + 2], vx = T[c] - T[a], vy = T[c + 1] - T[a + 1], vz = T[c + 2] - T[a + 2]; let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1;
      const sh = 0.45 + 0.55 * Math.abs((nx * 0.55 + ny * 0.75 + nz * 0.36) / l); tris.push([(T[a] + T[b] + T[c]) / 3, a, b, c, base.map(v => Math.round(Math.min(1, v * sh) * 255))]); } }
  tris.sort((p, q) => p[0] - q[0]); for (const [, a, b, c, col] of tris) { g.fillStyle = g.strokeStyle = `rgb(${col})`; g.lineWidth = 0.6; g.beginPath(); const pa = P(T[a + 2], T[a + 1]), pb = P(T[b + 2], T[b + 1]), pc = P(T[c + 2], T[c + 1]); g.moveTo(pa[0], pa[1]); g.lineTo(pb[0], pb[1]); g.lineTo(pc[0], pc[1]); g.closePath(); g.fill(); g.stroke(); }
  if (wh.show !== 0) for (const z of [wh.axF, wh.axR]) { const [x, y] = P(z, wh.tr), r = wh.tr * sc; g.fillStyle = '#0c0c0e'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.fillStyle = '#b8bcc4'; g.beginPath(); g.arc(x, y, r * 0.58, 0, Math.PI * 2); g.fill(); g.fillStyle = '#5a5e66'; g.beginPath(); g.arc(x, y, r * 0.2, 0, Math.PI * 2); g.fill(); }
  return cv.toDataURL('image/png'); }
const CM_STAT = ['drive', 'hp', 'torque', 'kg', 'top', 'gears', 'redline', 'turbo', 'handling', 'drift', 'brake', 'sound', 'fb', 'popup'];
function cmDef(id, v, geoGet) { const base = CAR_BY_ID[v.base] && !CAR_BY_ID[v.base].cuCar ? CAR_BY_ID[v.base] : CARS[0], def = CAR_BY_ID[id] || { id }; for (const k of CM_STAT) def[k] = base[k];
  const wh = v.wh || {}; Object.assign(def, { id, maker: String(v.maker || 'CUSTOM').slice(0, 20), name: String(v.nm || 'CUSTOM CAR').slice(0, 30), era: 'オリジナル', hp: +v.hp || base.hp, torque: Math.round(base.torque * (+v.hp || base.hp) / base.hp), kg: +v.kg || base.kg, top: +v.top || base.top, drive: v.drive || base.drive,
    price: Math.max(0, +v.price || 0), body: 'cuobj', L: +v.L || 4.5, W: +v.W || 1.8, H: +v.H || 1.3, color: v.col || '#e10600', popup: false, wb: Math.max(1, (wh.axF || 1.3) - (wh.axR || -1.3)), unlock: v.sale && !v.del ? undefined : { event: 1 }, cuCar: id.replace('cu_car_', ''), cuThumb: v.thumb, isNew: '5.2' });
  delete def.cls; def.cuCarObj = { get geo() { return geoGet(); }, xf: v.xf || {}, wh }; return def; }
function cuApplyCars(cars) { for (const [k, v] of Object.entries(cars)) { if (!v || !v.geo) continue; const id = 'cu_car_' + k; const geoGet = () => CU_GEO[k + v.at] || (CU_GEO[k + v.at] = cmDec(v.geo)); const def = cmDef(id, v, geoGet); if (!CAR_BY_ID[id] || !CARS.includes(CAR_BY_ID[id])) { CAR_BY_ID[id] = def; if (!CARS.includes(def)) CARS.push(def); } } }
// 持っているカスタム車のデータがまだ届いていない時の仮の車（エラーにならないように）
function cmPlaceholders() { try { for (const c of (SAVE.data && SAVE.data.cars) || []) if (String(c.id).startsWith('cu_car_') && !CAR_BY_ID[c.id]) { const def = Object.assign({}, CARS[0], { id: c.id, name: 'カスタムカー', unlock: { event: 1 }, isNew: '5.2' }); CAR_BY_ID[c.id] = def; CARS.push(def); } } catch (e) { } }
{ const _ld = SAVE.load; SAVE.load = function () { const r = _ld.apply(this, arguments); cmPlaceholders(); return r; }; } setInterval(cmPlaceholders, 2000);
// もう一度キャッシュを適用（v70 の読み込み時点では車の仕組みがまだ無かったため）
CU.load();

const CM = {
  newF() { return { geo: null, xf: { yaw: 0, zup: 0, flip: 0, mir: 0, s: 1, fs: 1, ox: 0, oy: 0, oz: 0 }, wh: { show: 1, axF: 1.35, axR: -1.3, trk: 1.5, tr: 0.33, wy: 0 }, spec: { nm: '', maker: 'CUSTOM', base: (CARS.find(c => !c.cuCar && !c.unlock) || CARS[0]).id, hp: 0, kg: 0, top: 0, drive: '', col: '#e10600', sale: 0, price: 5000000, L: 4.5 }, W: 1.8, H: 1.3, tri: 0 }; },
  bbox(F) { const T = cmXfPos(F.geo, F.xf), b = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9]; for (let i = 0; i < T.length; i += 3) for (let a = 0; a < 3; a++) { b[a] = Math.min(b[a], T[i + a]); b[a + 3] = Math.max(b[a + 3], T[i + a]); } return b; },
  fit(F) { const L = +F.spec.L || 4.5; F.xf.s = 1; F.xf.ox = F.xf.oy = F.xf.oz = 0; let b = this.bbox(F); const s = L / ((b[5] - b[2]) || 1); F.xf.s = F.xf.fs = s; b = this.bbox(F); F.xf.ox = -(b[0] + b[3]) / 2; F.xf.oz = -(b[2] + b[5]) / 2; F.xf.oy = -b[1]; b = this.bbox(F);
    F.W = +(b[3] - b[0]).toFixed(2); F.H = +(b[4] - b[1]).toFixed(2); F.wh = { show: F.wh.show, axF: +(L * 0.32).toFixed(2), axR: +(-L * 0.31).toFixed(2), trk: +(F.W * 0.84).toFixed(2), tr: +Math.min(0.5, Math.max(0.24, F.H * 0.25)).toFixed(2), wy: 0 }; F.whAuto = this.wheels(F); },
  // OBJ のタイヤのパーツ（名前に wheel / tire など）から、ゲームのタイヤの位置と大きさを自動で合わせる
  wheels(F) { const gs = F.geo.groups.filter(g => /wheel|tire|tyre|rim|タイヤ|ホイール/i.test(g.n)); if (!gs.length) return false; const T = cmXfPos(F.geo, F.xf), I = F.geo.idx, Q = {};
    for (const g of gs) for (let t = g.s; t < g.s + g.c; t += 3) { let cx = 0, cz = 0; for (let k = 0; k < 3; k++) { cx += T[I[t + k] * 3]; cz += T[I[t + k] * 3 + 2]; } const key = (cx > 0 ? 'R' : 'L') + (cz > 0 ? 'F' : 'B'), b = Q[key] || (Q[key] = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9]);
      for (let k = 0; k < 3; k++) { const v = I[t + k] * 3; for (let a = 0; a < 3; a++) { b[a] = Math.min(b[a], T[v + a]); b[a + 3] = Math.max(b[a + 3], T[v + a]); } } }
    const C = Object.entries(Q).map(([k, b]) => ({ k, x: (b[0] + b[3]) / 2, y: (b[1] + b[4]) / 2, z: (b[2] + b[5]) / 2, r: Math.max(b[4] - b[1], b[5] - b[2]) / 2 })), fr = C.filter(c => c.k[1] === 'F'), rr = C.filter(c => c.k[1] === 'B'); if (!fr.length || !rr.length) return false;
    const avg = (L, f) => L.reduce((a, c) => a + f(c), 0) / L.length, tr = avg(C, c => c.r); if (!(tr > 0.08 && tr < 1.2)) return false;
    Object.assign(F.wh, { axF: +avg(fr, c => c.z).toFixed(3), axR: +avg(rr, c => c.z).toFixed(3), trk: +(avg(C, c => Math.abs(c.x)) * 2).toFixed(3), tr: +tr.toFixed(3), wy: +(avg(C, c => c.y) - tr).toFixed(3) }); return true; },
  dims(F) { const b = this.bbox(F); F.spec.L = +(b[5] - b[2]).toFixed(2); F.W = +(b[3] - b[0]).toFixed(2); F.H = +(b[4] - b[1]).toFixed(2); },
  val(F) { return { nm: F.spec.nm, maker: F.spec.maker, base: F.spec.base, hp: F.spec.hp, kg: F.spec.kg, top: F.spec.top, drive: F.spec.drive, col: F.spec.col, sale: F.spec.sale, price: F.spec.price, L: F.spec.L, W: F.W, H: F.H, xf: F.xf, wh: F.wh }; },
  preview() { clearTimeout(this._pt); this._pt = setTimeout(() => { const F = UI.cmF; if (!F || !F.geo || !UI.show) return; const g = F.geo, def = cmDef('cu_car_prev', this.val(F), () => g); CAR_BY_ID.cu_car_prev = def; UI.show.sig = ''; UI.show.setCar({ id: 'cu_car_prev', look: Object.assign(defaultLook(def), { color: F.spec.col }) }, true); }, 120); },
  sl(k, l, v, mn, mx, st) { return `<div class="row cm-sl"><label>${l}</label><input type="range" min="${mn}" max="${mx}" step="${st}" value="${v}" data-in="cmNum" data-k="${k}"><input type="number" class="cm-nv" step="${st}" value="${v}" data-in="cmNum" data-k="${k}"></div>`; },
  html(D, online) { const F = UI.cmF || (UI.cmF = this.newF()), dis = online ? '' : 'disabled', list = Object.entries(D.cars || {}).filter(([, v]) => v && !v.del);
    let h = `<div class="note">OBJファイル（3Dモデル）を読み込んで、ボディ・タイヤの位置や大きさを調整し、ゲームで走れる車として追加できます。調整中の車は<b>ショールーム</b>にそのまま表示されます。ポリゴンが多いモデルは自動で${CM_MAXTRI.toLocaleString()}ポリゴン以下に軽くします。</div>
      <div class="cu-form"><div class="row"><label>OBJファイル</label><label class="btn pri">OBJを読み込む<input type="file" accept=".obj,text/plain" data-in="cmObj" style="display:none"></label>${F.geo ? `<small class="set-note">${F.whAuto ? '✓ OBJのタイヤの位置にゲームのタイヤを合わせました ・ ' : ''}${(F.geo.idx.length / 3).toLocaleString()} ポリゴン ・ パーツ ${F.geo.groups.length}${F.tri > F.geo.idx.length / 3 ? `（元は ${F.tri.toLocaleString()} ポリゴン）` : ''}</small>` : '<small class="set-note">ブラウザで書き出した .obj に対応（.mtl の色は「パーツ」で設定します）</small>'}</div>`;
    if (F.geo) { const x = F.xf, w = F.wh, L = +F.spec.L || 4.5, cars = CARS.filter(c => !c.cuCar && c.id !== 'cu_car_prev');
      h += `<div class="h3">向き・大きさ</div><div class="row"><label>向き（車の前）</label><select data-in="cmYaw">${[0, 90, 180, 270].map(a => `<option value="${a}" ${x.yaw == a ? 'selected' : ''}>${a}°回転</option>`).join('')}</select>
          <label class="cm-chk"><input type="checkbox" data-in="cmChk" data-k="zup" ${x.zup ? 'checked' : ''}> Z が上のモデル</label><label class="cm-chk"><input type="checkbox" data-in="cmChk" data-k="mir" ${x.mir ? 'checked' : ''}> 左右反転</label><label class="cm-chk"><input type="checkbox" data-in="cmChk" data-k="flip" ${x.flip ? 'checked' : ''}> 面の向きを反転（暗く見える時）</label></div>
        <div class="row"><label>全長（m）</label><input id="cmLen" type="number" step="0.05" min="2" max="12" value="${L}"><button class="btn" data-a="cmFit">この長さで自動フィット</button><small class="set-note">幅 ${F.W}m ・ 高さ ${F.H}m</small></div>
        ${this.sl('xf.s', '拡大率', +x.s.toFixed(4), +(x.fs * 0.5).toFixed(4), +(x.fs * 1.6).toFixed(4), +(x.fs / 200).toFixed(5))}${this.sl('xf.ox', 'ボディ 左右', +x.ox.toFixed(3), -2, 2, 0.01)}${this.sl('xf.oy', 'ボディ 上下', +x.oy.toFixed(3), -1.5, 2, 0.01)}${this.sl('xf.oz', 'ボディ 前後', +x.oz.toFixed(3), -4, 4, 0.01)}
        <div class="h3">タイヤ</div><div class="row"><label>ゲームのタイヤ</label><label class="cm-chk"><input type="checkbox" data-in="cmChk" data-k="wh.show" ${w.show !== 0 ? 'checked' : ''}> 表示する（OBJのタイヤを使う時は外して、OBJのタイヤのパーツを「黒い部品」に）</label></div>
        ${this.sl('wh.axF', '前輪の位置（前後）', w.axF, 0, +(L * 0.7).toFixed(2), 0.01)}${this.sl('wh.axR', '後輪の位置（前後）', w.axR, -(L * 0.7).toFixed(2), 0, 0.01)}${this.sl('wh.trk', 'タイヤの左右の幅', w.trk, 0.6, 3.2, 0.01)}${this.sl('wh.tr', 'タイヤの大きさ（半径）', w.tr, 0.15, 0.9, 0.005)}${this.sl('wh.wy', 'タイヤの高さ', w.wy, -0.4, 0.4, 0.005)}
        <div class="h3">パーツ（OBJのグループ・マテリアル）</div><div class="cm-parts">${F.geo.groups.map((g, i) => `<div class="cm-p"><b title="${esc(g.n)}">${esc(g.n)}</b><small>${(g.c / 3).toLocaleString()}</small><select data-in="cmRole" data-i="${i}">${Object.entries(CM_ROLE).map(([k, v]) => `<option value="${k}" ${g.role === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select>${g.role === 'color' ? `<input type="color" value="${g.col || '#888888'}" data-in="cmCol" data-i="${i}">` : ''}</div>`).join('')}</div>
        <div class="h3">名前・性能・販売</div><div class="row"><label>車名</label><input id="cmNm" maxlength="30" value="${esc(F.spec.nm)}" placeholder="例：AOI ORIGINAL GT"></div><div class="row"><label>メーカー名</label><input id="cmMk" maxlength="20" value="${esc(F.spec.maker)}"></div>
        <div class="row"><label>性能のベースにする車</label><select id="cmBase" data-in="cmBase">${cars.map(c => `<option value="${c.id}" ${F.spec.base === c.id ? 'selected' : ''}>${esc(c.name)}（${carClass(c)}）</option>`).join('')}</select></div>
        <div class="row"><label>馬力・重量・最高速</label><input id="cmHp" type="number" min="50" max="3000" value="${F.spec.hp || ''}" placeholder="馬力"><input id="cmKg" type="number" min="300" max="20000" value="${F.spec.kg || ''}" placeholder="kg"><input id="cmTop" type="number" min="60" max="500" value="${F.spec.top || ''}" placeholder="km/h"><small class="set-note">空ならベースの車と同じ</small></div>
        <div class="row"><label>駆動</label><select id="cmDr"><option value="">ベースと同じ</option>${['FR', 'RR', 'MR', 'FF', '4WD'].map(k => `<option ${F.spec.drive === k ? 'selected' : ''}>${k}</option>`).join('')}</select></div>
        <div class="row"><label>ボディの色</label><input type="color" data-in="cmColor" value="${F.spec.col}"></div>
        <div class="row"><label>手に入れ方</label><select id="cmSale"><option value="0" ${!F.spec.sale ? 'selected' : ''}>バンドル・プレゼントのみ（ディーラーで売らない）</option><option value="1" ${F.spec.sale ? 'selected' : ''}>ディーラーで販売</option></select><input id="cmPr" type="number" min="0" value="${F.spec.price}" placeholder="価格"></div>
        <div class="btns"><button class="btn pri" data-a="cmSave" ${dis}>${F.k ? '変更を保存' : '車を追加（全員に反映）'}</button><button class="btn" data-a="cmPrev">ショールームで見る</button><button class="btn" data-a="cmNew">最初から</button></div>`; }
    h += `</div><div class="h3">作った車（${list.length}）</div><div class="cu-list">${list.map(([k, v]) => `<div class="cu-it"><span class="cu-pv">${v.thumb ? `<img src="${v.thumb}" width="64" height="29" alt="">` : ''}</span><b>${esc(v.nm || '')}</b><small>${v.sale ? 'ディーラー ' + yen(v.price || 0) : 'バンドル・プレゼントのみ'} ・ ID cu_car_${k}</small><div><button class="btn" data-a="cmEdit" data-v="${k}">編集</button><button class="btn" data-a="cmDel" data-v="${k}" ${dis}>削除</button></div></div>`).join('') || '<div class="note">まだありません</div>'}</div>`;
    return h; }
};
Object.assign(UI, {
  cmKeep() { const F = this.cmF; if (!F || !$('cmNm')) return; const v = id => ($(id) || {}).value; Object.assign(F.spec, { nm: v('cmNm'), maker: v('cmMk'), base: v('cmBase'), hp: +v('cmHp') || 0, kg: +v('cmKg') || 0, top: +v('cmTop') || 0, drive: v('cmDr'), sale: v('cmSale') === '1' ? 1 : 0, price: +v('cmPr') || 0, L: +v('cmLen') || F.spec.L }); },
  in_cmObj(v, el) { const f = el.files && el.files[0]; if (!f) return; if (f.size > 60e6) return this.toast('ファイルが大きすぎます（60MBまで）'); this.cmKeep(); this.toast('OBJを読み込み中…'); const rd = new FileReader();
    rd.onload = () => { try { let geo = cmParseObj(String(rd.result)); if (!geo.idx.length) return this.toast('ポリゴンが見つかりませんでした（OBJファイルを確認してください）'); const tri = geo.idx.length / 3; geo = cmSimplify(geo, CM_MAXTRI);
        const F = this.cmF = this.cmF || CM.newF(); F.geo = geo; F.tri = tri; F.k = F.k || null; if (!F.spec.nm) F.spec.nm = f.name.replace(/\.obj$/i, '').toUpperCase().slice(0, 30); CM.fit(F); this.render(); CM.preview(); this.toast('読み込みました：' + (geo.idx.length / 3).toLocaleString() + ' ポリゴン'); } catch (e) { console.error(e); this.toast('OBJを読み込めませんでした'); } };
    rd.readAsText(f); el.value = ''; },
  in_cmNum(v, el) { const F = this.cmF; if (!F) return; const [o, k] = el.dataset.k.split('.'), n = +v; if (!isFinite(n)) return; F[o][k] = n; el.parentNode.querySelectorAll('[data-in=cmNum]').forEach(x => { if (x !== el) x.value = v; }); if (o === 'xf') CM.dims(F); CM.preview(); },
  in_cmChk(v, el) { this.cmKeep(); const F = this.cmF, [o, k] = el.dataset.k.split('.'); if (o === 'wh') F.wh[k] = v ? 1 : 0; else { F.xf[o] = v ? 1 : 0; if (o !== 'flip') CM.fit(F); } this.render(); CM.preview(); },
  in_cmYaw(v) { this.cmKeep(); this.cmF.xf.yaw = +v; CM.fit(this.cmF); this.render(); CM.preview(); },
  in_cmRole(v, el) { this.cmKeep(); this.cmF.geo.groups[+el.dataset.i].role = v; this.render(); CM.preview(); },
  in_cmCol(v, el) { this.cmF.geo.groups[+el.dataset.i].col = v; CM.preview(); },
  in_cmColor(v) { this.cmF.spec.col = v; CM.preview(); },
  in_cmBase(v) { this.cmKeep(); const c = CAR_BY_ID[v]; if (c) Object.assign(this.cmF.spec, { base: v, hp: c.hp, kg: c.kg, top: c.top }); this.render(); },
  a_cmFit() { this.cmKeep(); CM.fit(this.cmF); this.render(); CM.preview(); },
  a_cmPrev() { this.cmKeep(); CM.preview(); },
  a_cmNew() { this.cmF = CM.newF(); this.render(); },
  a_cmEdit(k) { const v = ((CU.data || {}).cars || {})[k]; if (!v) return; const F = CM.newF(); F.k = k; F.geo = cmDec(v.geo); F.tri = F.geo.idx.length / 3; F.xf = Object.assign(F.xf, v.xf || {}); F.wh = Object.assign(F.wh, v.wh || {}); Object.assign(F.spec, { nm: v.nm, maker: v.maker, base: v.base, hp: v.hp, kg: v.kg, top: v.top, drive: v.drive || '', col: v.col, sale: v.sale, price: v.price, L: v.L }); F.W = v.W; F.H = v.H; this.cmF = F; this.render(); CM.preview(); },
  a_cmDel(k) { if (!confirm('この車を削除しますか？（すでに持っているプレイヤーはそのまま乗れます。ディーラーとこの一覧から消えます）')) return; this.cuWrite('cars/' + k + '/del', 1, '車を削除しました'); },
  a_cmSave() { this.cmKeep(); const F = this.cmF; if (!F || !F.geo) return this.toast('先にOBJを読み込んでください'); if (!String(F.spec.nm).trim()) return this.toast('車名を入れてください'); CM.dims(F);
    if (F.wh.axF <= F.wh.axR) return this.toast('前輪は後輪より前にしてください');
    const enc = cmEnc(F.geo), v = Object.assign(CM.val(F), { nm: F.spec.nm.trim(), geo: enc, thumb: cmThumb(F.geo, F.xf, F.wh, { color: F.spec.col }), at: Date.now() }); const size = JSON.stringify(v).length; if (size > 3e6) return this.toast('モデルが大きすぎます（' + Math.round(size / 1e6) + 'MB）');
    const k = F.k || cuNewId(); this.cuWrite('cars/' + k, v, F.k ? '車を更新しました（全員に反映）' : '車を追加しました（全員に反映）・ID cu_car_' + k); this.cmF = CM.newF(); }
});
window.__DLX = Object.assign(window.__DLX || {}, { SU, IMGED, CM, cmParseObj, cmSimplify, cmEnc, cmDec, cuApplyCars, BUNDLES_LIVE: () => BUNDLES });
