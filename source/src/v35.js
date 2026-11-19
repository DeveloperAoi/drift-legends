// =====================================================================
// v35.js — v3.01：リプレイ（自分・ランキング上位）・新ストア（オファー／バンドル／BOX／ダイヤ両替）
//          カードパックの新デザイン・開封演出と効果音の強化
// =====================================================================

// ---------------- リプレイ ----------------
const RP = {
  HZ: 15,
  enc(fr) { // fr: [[x,y,z,hd,kmh,rp,rl]...] → 差分を整数で
    const sc = [20, 20, 20, 1000, 10, 10, 100]; let prev = sc.map(() => 0), out = [];
    for (const f of fr) { const q = f.map((v, i) => Math.round((v || 0) * sc[i])); out.push(q.map((v, i) => (v - prev[i]).toString(36)).join(',')); prev = q; }
    return out.join(';'); },
  dec(s) { const sc = [20, 20, 20, 1000, 10, 10, 100]; let prev = sc.map(() => 0); return s.split(';').map(row => { const q = row.split(',').map((v, i) => prev[i] + parseInt(v, 36)); prev = q; return q.map((v, i) => v / sc[i]); }); },
  pack(g) { const inst = g.carInst; return { v: 1, map: g.cfg.mapId, time: g.cfg.time, weather: g.cfg.weather, mode: g.cfg.mode, car: { id: inst.id, look: inst.look, tune: { engine: inst.tune.engine, height: inst.tune.height, wheelIn: inst.tune.wheelIn, tireW: inst.tune.tireW, camber: inst.tune.camber, track: inst.tune.track } },
    rival: g.rivals && g.rivals[0] && !g.rivals[0].net ? g.rivals[0].def : null, t: g.raceT, d: this.enc(g._rec || []), date: Date.now(), name: (window.DL_FB && DL_FB.profile && DL_FB.profile.name) || SAVE.data.settings.nick || 'プレイヤー' }; }
};
{
  const GP = Game.prototype;
  const _st = GP.start; GP.start = function (cfg) { this._rec = []; this._recT = 0; this._rpT = 0; this._rpEnd = false; const r = _st.apply(this, arguments); if (cfg && cfg.replay) setTimeout(() => UI.replayHud(true), 50); else UI.replayHud(false); return r; };
  const _up = GP.update; GP.update = function (dt) {
    const cfg = this.cfg || {};
    if (cfg.replay && this.active) { this.countdown = 0; this.started = true; }
    _up.call(this, dt);
    if (!this.active) return;
    if (cfg.replay) { RP_play(this, dt); return; }
    if (this.started && !this.finished && this.veh && !this.paused) { this._recT += dt; if (this._recT >= 1 / RP.HZ) { this._recT -= 1 / RP.HZ; const v = this.veh, r = this.rivals && this.rivals[0];
        if (this._rec.length < RP.HZ * 60 * 12) this._rec.push([v.x, v.y, v.z, v.heading, (v.speed || 0) * 3.6, r ? r.prog : 0, r ? r.lat : 0]); } }
  };
  const _fin = GP.finish; GP.finish = function (reason) { if (this.cfg && this.cfg.replay) return; if (!this.finished && this._rec && this._rec.length > 20) { try { UI.lastReplay = RP.pack(this); UI.lastReplay._frames = this._rec.slice(); } catch (e) { } } return _fin.apply(this, arguments); };
}
function RP_play(g, dt) {
  const rp = g.cfg.replay, F = rp._frames || (rp._frames = RP.dec(rp.d)); if (!F.length) return;
  if (!UI.rpPause) g._rpT += dt * (UI.rpSpeed || 1);
  const fi = g._rpT * RP.HZ, i = Math.min(F.length - 2, Math.floor(fi)), k = clamp(fi - i, 0, 1), a = F[i], b = F[i + 1] || a;
  const L = (p, q) => p + (q - p) * k; const v = g.veh; const x = L(a[0], b[0]), y = L(a[1], b[1]), z = L(a[2], b[2]); let dh = b[3] - a[3]; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI;
  const hd = a[3] + dh * k, sp = L(a[4], b[4]) / 3.6;
  v.x = x; v.y = y; v.z = z; v.heading = hd; const mv = Math.hypot(b[0] - a[0], b[2] - a[2]) * RP.HZ; const dir = Math.atan2(b[0] - a[0], b[2] - a[2]); v.vx = Math.sin(dir) * mv; v.vz = Math.cos(dir) * mv; if ('rpm' in v) v.rpm = clamp(1200 + sp * 95 % 5200 + sp * 12, 900, (g.spec && g.spec.redline) || 7500);
  try { g.loc = g.track.locate(x, z, g.loc.i); } catch (e) { }
  const r = g.rivals && g.rivals[0]; if (r && a[5]) { r.prog = L(a[5], b[5]); r.lat = L(a[6], b[6]); }
  const el = document.getElementById('rpTime'); if (el) el.textContent = fmtTime(Math.min(g._rpT, rp.t || g._rpT)) + ' / ' + fmtTime(rp.t || F.length / RP.HZ);
  const bar = document.getElementById('rpBar'); if (bar) bar.style.width = Math.min(100, fi / F.length * 100) + '%';
  if (fi >= F.length - 1 && !g._rpEnd) { g._rpEnd = true; UI.rpPause = true; UI.replayEnd(); }
}
Object.assign(UI, {
  rpSpeed: 1, rpPause: false,
  playReplay(rp, back) { if (!rp || !rp.d) return this.toast('リプレイがありません'); const car = rp.car; const inst = Object.assign(SAVE.newCar(car.id), { uid: 'replay' }); Object.assign(inst.look, car.look || {}); Object.assign(inst.tune, car.tune || {});
    this.rpBack = back || null; this.rpSpeed = 1; this.rpPause = false; this.closeModal(); this.paused = false; if (this.game.active) this.game.exit();
    this.launch({ mode: 'free', mapId: rp.map, weather: rp.weather || 'clear', time: rp.time || 'night', laps: 99, carInst: inst, rivals: rp.rival ? [rp.rival] : [], replay: rp }); },
  replayHud(on) { let h = document.getElementById('rpHud'); if (!on) { if (h) h.remove(); document.body.classList.remove('replaying'); return; }
    const rp = this.game.cfg.replay; if (!h) { h = document.createElement('div'); h.id = 'rpHud'; document.body.appendChild(h); h.addEventListener('click', e => { const b = e.target.closest('[data-rp]'); if (b) { AUDIO.click && AUDIO.click(); this.rpCmd(b.dataset.rp); } }); }
    document.body.classList.add('replaying');
    h.innerHTML = `<div class="rp-top"><span class="rp-rec">● REPLAY</span><b class="noi18n">${esc(rp.name || '')}</b><small>${esc((CAR_BY_ID[rp.car.id] || {}).name || '')} ・ ${esc((MAP_BY_ID[rp.map] || {}).jp || '')}</small><span id="rpTime"></span></div><div class="rp-prog"><i id="rpBar"></i></div>
      <div class="rp-ctl"><button data-rp="back">⏪ 5秒</button><button data-rp="pause">${this.rpPause ? '▶' : '❚❚'}</button><button data-rp="speed">x${this.rpSpeed}</button><button data-rp="cam">🎥 カメラ</button><button data-rp="exit">✕ 終了</button></div>`; },
  rpCmd(c) { const g = this.game; if (c === 'pause') { this.rpPause = !this.rpPause; if (g._rpEnd && !this.rpPause) { g._rpT = 0; g._rpEnd = false; } }
    if (c === 'speed') this.rpSpeed = { 1: 2, 2: 0.5, 0.5: 1 }[this.rpSpeed] || 1;
    if (c === 'back') { g._rpT = Math.max(0, g._rpT - 5); g._rpEnd = false; }
    if (c === 'cam') { const cams = [0, 4, 5, 1, 2, 3]; g.camMode = cams[(cams.indexOf(g.camMode) + 1) % cams.length]; g._finA = 0; }
    if (c === 'exit') return this.exitReplay();
    this.replayHud(true); },
  replayEnd() { this.replayHud(true); const h = document.getElementById('rpHud'); if (h) h.insertAdjacentHTML('beforeend', `<div class="rp-end"><b>REPLAY END</b><div><button data-rp="pause">↻ もう一度</button><button data-rp="exit">終了</button></div></div>`); },
  exitReplay() { this.replayHud(false); this.paused = false; if (this.game.active) this.game.exit(); this.goMenu(); if (this.rpBack) this.open(this.rpBack[0], this.rpBack[1]); },
  a_resReplay() { const rp = this.lastReplay; if (!rp) return this.toast('リプレイがありません'); $('overlay').classList.remove('res-dim'); this.playReplay(rp, null); },
  async a_lbReplay(v) { const [wk, board, uid] = v.split('|'); try { this.toast('リプレイを読み込み中…'); await DL_FB.ready(); const s = await DL_FB.db().ref(`replays/${wk}/${board}/${uid}`).get(); const rp = s.val(); if (!rp) return this.toast('このプレイヤーのリプレイはまだありません'); this.playReplay(rp, ['ranking']); } catch (e) { this.toast('読み込めませんでした'); } }
});
// リザルトに「リプレイを見る」
{ const _sr = UI.showResults; UI.showResults = function (res) { _sr.call(this, res); const b = document.querySelector('#overlay .res-modal .btns'); if (b && this.lastReplay && res.mode !== 'online') b.insertAdjacentHTML('afterbegin', `<button class="btn rp-btn" data-a="resReplay">▶ リプレイ</button>`); }; }
// ランキング：自己ベスト更新時にリプレイをアップロード／各行に再生ボタン
function rpHookFB() { if (!window.DL_FB || DL_FB._rpHooked) return; DL_FB._rpHooked = true; const _ls = DL_FB.lbSubmit.bind(DL_FB);
  DL_FB.lbSubmit = async function (board, v, mode) { const better = await _ls(board, v, mode); try { if (better && UI.lastReplay && (board.startsWith('ta_') || board === 'drift')) { const u = DL_FB.user; const rp = Object.assign({}, UI.lastReplay); delete rp._frames; rp.v = v; if (rp.d.length < 280000) await DL_FB.db().ref(`replays/${DL_FB.weekKey()}/${board}/${u.uid}`).set(rp); } } catch (e) { console.warn('replay upload', e); } return better; }; }
setTimeout(rpHookFB, 1200);
{ const _rr = UI.r_ranking; UI.r_ranking = function () { let h = _rr.call(this); const F = window.DL_FB; if (!F) return h; const isTA = this.tab === 'ta'; const board = isTA ? 'ta_' + this.lbMap : this.tab; if (!isTA && board !== 'drift') return h;
    const wk = F.weekKey(this.lbWeek === 0 ? 0 : -1), data = (this.lbCache || {})[wk + '/' + board]; if (!data || !data.list) return h; let i = 0;
    h = h.replace(/(<div class="lb-row [^"]*"><span class="rk">[\s\S]*?<span class="vl">[^<]*<\/span>)<\/div>/g, (m, a) => { const r = data.list[i++]; return r ? `${a}<button class="lb-rp" data-a="lbReplay" data-v="${wk}|${board}|${r.uid}" title="リプレイ">▶</button></div>` : m; });
    return h.replace('<div class="note">' , '<div class="note rp-note">▶ を押すと、そのプレイヤーの走りをリプレイで見られます（記録を更新したときに保存されたもの）。</div><div class="note">'); }; }

// ---------------- カードパックの新デザイン＆演出 ----------------
packHTML = function (c, size = 1) { const A = PACK_ART[c.id] || PACK_ART.silver; const rare = c.odds && (c.odds.L || 0) >= 8 ? 'LEGENDARY CHANCE UP' : c.daily ? 'FREE DAILY' : c.pool ? 'SPECIAL' : 'CARD PACK';
  return `<div class="pk pk2 pk-${c.id}" style="--pa:${A.a};--pb:${A.b};--ps:${size}"><div class="pk-tear"></div><div class="pk2-holo"></div><div class="pk-foil"></div><div class="pk2-crimp t"></div><div class="pk2-crimp b"></div>
    <div class="pk2-in"><div class="pk2-brand">DRIFT<b>LEGENDS</b></div><div class="pk2-emb">${chestIcon(c, 70)}</div><div class="pk2-name">${A.t}</div><div class="pk2-sub">${esc(c.name)}</div><div class="pk2-tag">${rare}</div></div><div class="pk2-edge"></div></div>`; };
{ // 効果音を重ねてリアルに：フィルムのカサカサ音・破れる音・カードを引き抜く音
  const crinkle = (dur = 0.35) => { try { for (let k = 0; k < 6; k++) AUDIO.noiseBurst(0.03 + Math.random() * 0.04, 2500 + Math.random() * 4000, 3, 0.08, k * dur / 6 + Math.random() * 0.02, 'highpass'); } catch (e) { } };
  const rip = () => { try { const c = AUDIO.ctx, t = c.currentTime, n = c.createBufferSource(), len = c.sampleRate * 0.45, buf = c.createBuffer(1, len, c.sampleRate), ch = buf.getChannelData(0); for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (Math.random() < 0.3 ? 1 : 0.25);
      n.buffer = buf; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.4; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(5200, t + 0.4); const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32 * (AUDIO.vol.sfx ?? 0.8), t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.44); n.connect(f); f.connect(g); g.connect(AUDIO.sfxBus || c.destination); n.start(t); } catch (e) { } };
  const slide = () => { try { AUDIO.noiseBurst(0.18, 1800, 0.8, 0.12, 0, 'bandpass'); AUDIO.tone(320, 0.12, 'sine', 0.04, 0, 600); } catch (e) { } };
  const wrap = (k, extra) => { const o = AUDIO[k]; if (typeof o === 'function') AUDIO[k] = function () { const r = o.apply(this, arguments); extra(); return r; }; };
  wrap('pkSelect', () => crinkle(0.3)); wrap('pkCharge', () => crinkle(0.6)); wrap('pkTear', rip); wrap('pkCardOut', slide); wrap('pkFlip', () => { try { AUDIO.noiseBurst(0.06, 3000, 1.5, 0.08, 0, 'bandpass'); } catch (e) { } });
  wrap('pkReveal', () => { try { AUDIO.tone(1320, 0.5, 'sine', 0.04, 0.05); AUDIO.tone(1980, 0.6, 'sine', 0.03, 0.12); } catch (e) { } });
}

// ---------------- ストア（オファー・バンドル・BOX・ダイヤ両替） ----------------
const BUNDLES = [
  { id: 'b_touge', name: '峠デビュー セット', desc: 'SAKURA S-I ＋ フルチューンチケット ＋ ¥500,000', items: [['car', 'hk_s1'], ['ticket', 1], ['money', 500000]], cur: 'yen', price: 1980000, old: 3600000, tag: 'STARTER', col: '#2fdc7a' },
  { id: 'b_cards', name: '限定車カード バンドル', desc: '戦車カード×10 ＋ フォーミュラカード×10', items: [['card', 'pk_tank', 10], ['card', 'pk_f1', 10]], cur: 'yen', price: 6000000, old: 11000000, tag: 'HOT', col: '#ff6a3a' },
  { id: 'b_full', name: 'フルチューン パック', desc: 'フルチューンチケット×2 ＋ ビークルパック×1', items: [['ticket', 2], ['pack', 'carpack', 1]], cur: 'dia', price: 450, old: 900, tag: 'BEST', col: '#ffcf3d' },
  { id: 'b_packs', name: 'カードパック 詰め合わせ', desc: 'ゴールドパック×3 ＋ プロフィールパック×3', items: [['pack', 'gold', 3], ['pack', 'profpack', 3]], cur: 'yen', price: 8500000, old: 10500000, tag: 'VALUE', col: '#5ad1ff' },
  { id: 'b_brick', name: 'ブロックカー セット', desc: 'BRICK RACER カード×15 ＋ ¥1,000,000', items: [['card', 'pk_brick', 15], ['money', 1000000]], cur: 'dia', price: 600, old: 1100, tag: 'NEW', col: '#ffcf00' },
  { id: 'b_xmas', name: 'クリスマス バンドル', desc: 'クリスマスカードパック×5 ＋ FROST KAISER カード×5', items: [['pack', 'xmaspack', 5], ['card', 'xc_frost', 5]], cur: 'yen', price: 9800000, old: 15000000, tag: 'XMAS', col: '#ff3a3a', xmas: 1 }
];
const DIA_EX = [[50, 0], [200, 5], [500, 10], [1500, 20]]; const DIA_RATE = 10000;
function weekId() { try { return DL_FB ? DL_FB.weekKey() : srvDateKey().slice(0, 8); } catch (e) { return new Date(SRV.now() + 9 * 3600000).toISOString().slice(0, 8); } }
function weekLeft() { const j = new Date(SRV.now() + 9 * 3600000); const dow = (j.getUTCDay() + 6) % 7; return Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate() - dow + 7) - 9 * 3600000 - SRV.now(); }
function bundleBought(b) { const d = SAVE.data; return (d.bundles || {})[b.id] === weekId(); }
function grantBundle(b) { const d = SAVE.data, out = [], packs = [];
  for (const it of b.items) { const [k, a, n] = it;
    if (k === 'car') { const c = SAVE.newCar(a); c.paid = 0; d.cars.push(c); out.push(CAR_BY_ID[a].name); }
    if (k === 'ticket') { d.tickets = d.tickets || {}; d.tickets.tk_full = (d.tickets.tk_full || 0) + a; out.push('フルチューンチケット ×' + a); }
    if (k === 'money') { SAVE.addMoney(a); out.push(yen(a)); }
    if (k === 'card') { d.carCards = d.carCards || {}; d.carCards[a] = (d.carCards[a] || 0) + n; out.push(CAR_BY_ID[a].name + ' カード ×' + n); }
    if (k === 'pack') packs.push([a, n]); }
  return { out, packs }; }
Object.assign(UI, {
  r_store() { $('panelTitle').textContent = 'STORE'; $('panelBody').classList.add('wide'); const d = SAVE.data; if (!this.stTab) this.stTab = 'offers'; this.show.setCar(SAVE.cur());
    const T = [['offers', '🔥 オファー'], ['box', '📦 パックBOX'], ['dia', '💎 ダイヤ両替'], ['daily', '🗓 日替わり']];
    let h = `<div class="st-wrap"><div class="st-head"><b>STORE</b><span class="st-cur"><i>💎 ${(d.diamonds || 0).toLocaleString()}</i><i>${yen(d.money)}</i></span></div><div class="st-row">`;
    const sec = (title, tag, timer, inner, col) => `<section class="st-sec" style="--sc:${col || '#ffcf3d'}"><div class="st-sh">${timer ? `<span class="st-timer">${timer}</span>` : ''}<b>${title}</b>${tag ? `<span class="st-new">${tag}</span>` : ''}</div><div class="st-cards">${inner}</div></section>`;
    const price = (cur, p) => cur === 'dia' ? `💎 ${p.toLocaleString()}` : yen(p);
    const left = weekLeft(), tl = Math.floor(left / 86400000) ? Math.floor(left / 86400000) + 'd' : Math.floor(left / 3600000) + 'h';
    if (this.stTab === 'offers') {
      const xm = typeof xmasPackOpen === 'function' && xmasPackOpen();
      h += sec('期間限定バンドル', 'NEW', tl, BUNDLES.filter(b => !b.xmas || xm).map((b, i) => { const got = bundleBought(b), off = Math.round((1 - b.price / b.old) * 100);
        return `<div class="st-card" style="--cc:${b.col};animation-delay:${i * 0.06}s"><div class="st-ct">${esc(b.name)}</div><div class="st-cd">${esc(b.desc)}</div><span class="st-badge new">${b.tag}</span><span class="st-badge sale">SALE ${off}%</span><div class="st-art">${this.bundleArt(b)}</div><div class="st-old">${price(b.cur, b.old)}</div><button class="st-buy ${got ? 'done' : ''}" data-a="stBundle" data-v="${b.id}" ${got ? 'disabled' : ''}>${got ? '購入済み（今週）' : price(b.cur, b.price)}</button><span class="st-bubble">${b.cur === 'dia' ? '1回' : '今週1回'}</span></div>`; }).join(''), '#ffcf3d');
      h += sec('パックBOX', '-20%', '', this.boxCards(), '#5ad1ff');
    }
    if (this.stTab === 'box') h += sec('カードパック BOX（10パック入り・20%オフ）', 'BOX', '', this.boxCards(true), '#5ad1ff');
    if (this.stTab === 'dia') h += sec('ダイヤをお金に両替', 'BONUS', '', DIA_EX.map(([n, b], i) => { const get = Math.round(n * DIA_RATE * (1 + b / 100)), can = (d.diamonds || 0) >= n;
      return `<div class="st-card dia" style="--cc:#9ad8ff;animation-delay:${i * 0.06}s"><div class="st-ct">💎 ${n} → ${yen(get)}</div><div class="st-cd">1ダイヤ = ${yen(DIA_RATE)}${b ? `　ボーナス +${b}%` : ''}</div>${b ? `<span class="st-badge sale">+${b}%</span>` : ''}<div class="st-art"><div class="st-gem">${'💎'.repeat(Math.min(5, 1 + i))}</div></div><button class="st-buy" data-a="stDia" data-v="${n}" ${can ? '' : 'disabled'}>${can ? '両替する' : 'ダイヤが足りません'}</button></div>`; }).join(''), '#9ad8ff');
    if (this.stTab === 'daily') { h += `</div></div>`; return h + `<div class="note">日替わりショップはカードパック画面の「日替わり」タブです。</div><div class="btns"><button class="btn pri" data-a="stGoDaily">日替わりショップを開く</button></div>`; }
    h += `</div><div class="st-tabs">${T.map(([k, l]) => `<button class="${this.stTab === k ? 'on' : ''}" data-a="stTab" data-v="${k}">${l}</button>`).join('')}</div></div>`;
    return h; },
  boxCards(all) { return CHESTS.filter(c => !c.daily && (c.id !== 'xmaspack' || (typeof xmasPackOpen === 'function' && xmasPackOpen()))).slice(0, all ? 99 : 4).map((c, i) => { const full = c.price * 10, p = Math.round(full * 0.8 / 1000) * 1000;
    return `<div class="st-card box" style="--cc:${(PACK_ART[c.id] || {}).b};animation-delay:${i * 0.06}s"><div class="st-ct">${esc(c.name)} BOX</div><div class="st-cd">10パック入り</div><span class="st-badge sale">SALE 20%</span><div class="st-art st-boxart">${packHTML(c, 0.36)}${packHTML(c, 0.36)}${packHTML(c, 0.36)}<span class="st-x10">×10</span></div><div class="st-old">${yen(full)}</div><button class="st-buy" data-a="stBox" data-v="${c.id}">${yen(p)}</button><span class="st-bubble">10</span></div>`; }).join(''); },
  bundleArt(b) { return b.items.slice(0, 3).map(([k, a, n]) => { if (k === 'car' || k === 'card') return `<span class="st-chip">${itemIconSvg({ type: 'carcard', rarity: k === 'car' ? 'L' : 'E', cards: n || 1 }, 44)}</span>`; if (k === 'ticket') return `<span class="st-chip">${itemIconSvg(ITEM_BY_ID.tk_full, 44)}<em>×${a}</em></span>`; if (k === 'money') return `<span class="st-chip st-yen">¥</span>`; if (k === 'pack') { const c = CHESTS.find(x => x.id === a); return c ? `<span class="st-chip">${packHTML(c, 0.26)}<em>×${n}</em></span>` : ''; } return ''; }).join(''); },
  a_stTab(v) { this.stTab = v; AUDIO.nav && AUDIO.nav(); this.render(); },
  a_stGoDaily() { this.open('chest'); this.tab = 'shop'; this.render(); },
  a_stDia(v) { const n = +v, d = SAVE.data, ex = DIA_EX.find(x => x[0] === n); if (!ex || (d.diamonds || 0) < n || this._stBusy) return; this._stBusy = true;
    try { d.diamonds -= n; const get = Math.round(n * DIA_RATE * (1 + ex[1] / 100)); SAVE.addMoney(get); SAVE.save(); AUDIO.buy && AUDIO.buy(); this.toast(`💎${n} を ${yen(get)} に両替しました`); } finally { this._stBusy = false; } this.refreshTop(); this.render(); },
  a_stBundle(id) { const b = BUNDLES.find(x => x.id === id), d = SAVE.data; if (!b || bundleBought(b) || this._stBusy) return;
    if (b.cur === 'dia') { if ((d.diamonds || 0) < b.price) return this.toast('ダイヤが足りません'); } else if (d.money < b.price) return this.toast('お金が足りません');
    this.modal(`<h2>${esc(b.name)}</h2><div class="note">${esc(b.desc)}</div><div class="note">価格：<b>${b.cur === 'dia' ? '💎 ' + b.price : yen(b.price)}</b>（通常 ${b.cur === 'dia' ? '💎 ' + b.old : yen(b.old)}）</div><div class="btns"><button class="btn" data-a="closeModal">やめる</button><button class="btn pri" data-a="stBundleGo" data-v="${b.id}">購入する</button></div>`); },
  a_stBundleGo(id) { const b = BUNDLES.find(x => x.id === id), d = SAVE.data; if (!b || bundleBought(b) || this._stBusy) return; this._stBusy = true; this.closeModal();
    try { if (b.cur === 'dia') { if ((d.diamonds || 0) < b.price) return; d.diamonds -= b.price; } else if (!SAVE.spend(b.price)) return;
      d.bundles = d.bundles || {}; d.bundles[b.id] = weekId(); const g = grantBundle(b); SAVE.save(); AUDIO.buy && AUDIO.buy(); this.toast('購入しました：' + g.out.join('・'));
      if (g.packs.length) this.openPackList(g.packs); } finally { this._stBusy = false; } this.refreshTop(); this.render(); },
  a_stBox(id) { const c = CHESTS.find(x => x.id === id); if (!c) return; const p = Math.round(c.price * 10 * 0.8 / 1000) * 1000;
    this.modal(`<h2>${esc(c.name)} BOX</h2><div class="note">10パックをまとめて購入します（通常 ${yen(c.price * 10)} → <b>${yen(p)}</b>）。BOXには<b>エピック以上が1枚以上</b>確定で入っています。</div><div class="btns"><button class="btn" data-a="closeModal">やめる</button><button class="btn pri" data-a="stBoxGo" data-v="${id}">購入して開ける</button></div>`); },
  a_stBoxGo(id) { const c = CHESTS.find(x => x.id === id); if (!c || this._stBusy) return; const p = Math.round(c.price * 10 * 0.8 / 1000) * 1000; this.closeModal(); if (SAVE.data.money < p) return this.toast('お金が足りません');
    this._stBusy = true; const op = c.price, oo = c.odds; try { c.price = p / 10; this._boxGuar = true; this.a_openChest(id + ':10'); } finally { c.price = op; this._stBusy = false; } },
  openPackList(list) { // バンドルのパックを順番に開封（1回の演出にまとめる）
    const d = SAVE.data, res = []; let first = null; for (const [id, n] of list) { const c = CHESTS.find(x => x.id === id); if (!c) continue; first = first || c; for (let k = 0; k < n; k++) { const it = rollChest(c); res.push({ it, g: grantChestItem(it) }); } }
    if (!first || !res.length) return; d.packLog = [{ id: 'b' + SRV.now().toString(36), pack: first.id, t: SRV.now(), items: res.map(r => [r.it.id, r.g.isNew ? 1 : 0, r.g.refund || 0]) }].concat(d.packLog || []).slice(0, 60); SAVE.save(); PACKFX.open(first, res); }
});
// BOX：エピック以上1枚確定
{ const _rc = rollChest; let cnt = 0, hit = false; rollChest = function (chest, rnd = Math.random) { if (!UI._boxGuar) return _rc(chest, rnd); cnt++; let it = _rc(chest, rnd); if (it && (it.rarity === 'E' || it.rarity === 'L')) hit = true;
    if (cnt === 10) { if (!hit) { const o = Object.assign({}, chest, { odds: { C: 0, U: 0, R: 0, E: 85, L: 15 } }); it = _rc(o, rnd); } cnt = 0; hit = false; UI._boxGuar = false; } return it; }; }
// メニュー・ナビからストアへ
{ const _mi = UI.menuItems; UI.menuItems = function () { _mi.call(this); const el = $('menuList'); const pills = el && el.querySelector('.nm-pills'); if (pills && !pills.querySelector('[data-m="store"]')) pills.insertAdjacentHTML('afterbegin', `<button class="nm-pill nm-store" data-m="store">${ICO('shop', '#ffcf3d', 18)}<span>ストア</span><i class="nm-b">SALE</i></button>`); }; }
BNAV_OF.store = 'shop';
window.__DLX = Object.assign(window.__DLX || {}, { RP, BUNDLES, grantBundle });
{ const _q = UI.a_quit; UI.a_quit = function () { this.replayHud(false); return _q.apply(this, arguments); }; const _gm = UI.goMenu; UI.goMenu = function () { if (!(this.game && this.game.active && this.game.cfg && this.game.cfg.replay)) this.replayHud(false); return _gm.apply(this, arguments); }; }
