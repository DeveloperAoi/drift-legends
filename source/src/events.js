// =====================================================================
// events.js — v2.9 期間限定イベント（UPCOMING / LIVE / ENDED）・年越し演出
// 日時はすべて日本時間（JST）。判定はサーバー時刻（SRV.now()）で行う
// =====================================================================
const JST = s => Date.parse(s + '+09:00');
const fmtJst = t => { const j = new Date(t + 9 * 3600000); const p = n => String(n).padStart(2, '0'); return `${j.getUTCFullYear()}/${p(j.getUTCMonth() + 1)}/${p(j.getUTCDate())} ${p(j.getUTCHours())}:${p(j.getUTCMinutes())}`; };
const fmtLeft2 = ms => { ms = Math.max(0, ms); const d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24, m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60, p = n => String(n).padStart(2, '0'); return (d ? d + '日 ' : '') + `${p(h)}:${p(m)}:${p(s)}`; };
const NY_MIDNIGHT = JST('2027-01-01T00:00:00');

// ---- 限定アイテム（イベント報酬専用：カードパックには出ない） ----
[{ id: 'ev_nye_dc', type: 'decal', name: '「LAST DRIVE 2026」ステッカー', en: '"LAST DRIVE 2026" sticker', rarity: 'E', kind: 'text', text: 'LAST DRIVE 2026', bg: '#05051a', fg: '#ffd76a', font: 'Arial' },
 { id: 'ev_nye_ne', type: 'neon', name: 'カウントダウンネオン', en: 'Countdown Neon', rarity: 'E', rgb: [1, 0.8, 0.3], rainbow: true },
 { id: 'ev_nye_tt', type: 'title', name: '称号「2026 ラストドライバー」', en: 'Title "2026 Last Driver"', rarity: 'E', title: '2026 ラストドライバー', titleEn: '2026 Last Driver' },
 { id: 'ev_ny_dc', type: 'decal', name: '「HAPPY NEW YEAR 2027」ステッカー', en: '"HAPPY NEW YEAR 2027" sticker', rarity: 'E', kind: 'text', text: 'HAPPY NEW YEAR 2027', bg: '#7a0010', fg: '#ffd700', font: 'Arial' },
 { id: 'ev_ny_dc2', type: 'decal', name: '「迎春 2027」ステッカー', en: '"New Spring 2027" sticker', rarity: 'R', kind: 'text', text: '迎春 2027', bg: '#ffffff', fg: '#c8102e', font: 'serif' },
 { id: 'ev_ny_pl', type: 'plate', name: '2027 ナンバープレート', en: '2027 License Plate', rarity: 'E', rgb: [1, 0.82, 0.3], plateText: '迎春 20-27' },
 { id: 'ev_ny_wh', type: 'wheel', name: '新春ゴールドホイール', en: 'New Year Gold Wheels', rarity: 'E', spokes: 10, deep: 1, rim: '#ffcc33' },
 { id: 'ev_ny_pt', type: 'paint', name: '初日の出オレンジ', en: 'First Sunrise Orange', rarity: 'E', color: '#ff7a2a', paint: 'pearl' },
 { id: 'ev_ny_tt', type: 'title', name: '称号「新春ドライバー2027」', en: 'Title "New Year Driver 2027"', rarity: 'L', title: '新春ドライバー2027', titleEn: 'New Year Driver 2027' }]
  .forEach(o => addItem(Object.assign({ lim: 'event' }, o)));
for (const it of ITEMS) { ITEM_BY_ID[it.id] = it; if (it.type === 'wheel' && !WHEEL_STYLES.some(w => w.id === it.id)) WHEEL_STYLES.push({ id: it.id, name: it.name, price: 0, spokes: it.spokes, deep: it.deep, rim: it.rim, chest: 1 }); if (it.type === 'decal' && !DECALS.some(x => x.id === it.id)) DECALS.push({ id: it.id, name: it.name, price: 0, chest: 1 }); }
{ const _ap = itemApply; itemApply = function (it, inst, on = true) { const r = _ap(it, inst, on); if (it.plateText) inst.look.plate = on ? it.plateText : inst.look.plate; return r; }; }

// ---- イベント専用コース（イルミネーション・花火・夜景／初日の出） ----
{ const clone = (src, o) => { const m = Object.assign({}, MAP_BY_ID[src], o); MAPS.push(m); MAP_BY_ID[m.id] = m; return m; };
  clone('baylane', { id: 'ev_nye_bay', name: 'COUNTDOWN BAY 2026', jp: '年越しベイライン', cat: 'event', illum: true, fireworks: true, fwCols: [[1, 0.85, 0.3], [1, 0.4, 0.6], [0.5, 0.8, 1], [1, 1, 1]], time: 'night', weather: 'clear', desc: 'イルミネーションと花火に包まれた年越しの湾岸線。', unlock: null });
  clone('neon', { id: 'ev_nye_city', name: 'NEW YEAR\'S EVE CITY', jp: '大晦日の夜景シティ', cat: 'event', illum: true, fireworks: true, time: 'night', weather: 'clear', desc: '大晦日の夜景をめぐる限定ナイトドライブ。', unlock: null });
  clone('seaside', { id: 'ev_ny_sunrise', name: 'FIRST SUNRISE LINE', jp: '初日の出ライン', cat: 'event', illum: true, time: 'evening', weather: 'clear', desc: '海から昇る初日の出に向かって走る新年限定コース。', unlock: null }); }
TRACKS.push({ id: 't21', name: 'HAPPY NEW YEAR 2027', bpm: 160, key: 55, minor: 0, seed: 2027, prog: [0, 4, 5, 3], cat: 'newyear', bells: 1 }, { id: 't22', name: 'LAST DRIVE OF 2026', bpm: 154, key: 50, minor: 1, seed: 1231, prog: [0, 5, 3, 4], cat: 'newyear' });

// ---- イベント定義 ----
const EVENTS = [
  { id: 'xmas2026', title: 'WINTER LEGENDS 2026', jp: 'ウィンターレジェンズ', start: JST(XMAS_EVENT.start + 'T00:00:00'), end: JST(XMAS_EVENT.end + 'T23:59:59'), art: 'xmas', screen: 'xmas',
    desc: 'クリスマスのイベントタスクに挑戦して、クリスマスポイントで限定車やパーツを手に入れよう。', cond: 'だれでも参加できます', rewards: ['限定車 SAKURA "REINDEER"', '限定ホイール・メーター・ナンバー'] },
  { id: 'nye2026', title: "NEW YEAR'S EVE 2026", jp: '2026年最後のドライブ', start: JST('2026-12-31T00:00:00'), end: JST('2027-01-01T23:59:59'), art: 'nye',
    desc: 'イルミネーションと花火に包まれた夜景の中で、2026年最後のドライブを。1月1日 0:00（日本時間）には全員そろって年越しのカウントダウン！', cond: 'だれでも参加できます（参加ボタンを押してから走った分がミッションに数えられます）',
    rewardItems: ['ev_nye_dc', 'ev_nye_ne', 'ev_nye_tt'],
    missions: [{ id: 'r3', name: 'イベント期間中に3レース完走', key: 'races', goal: 3, rw: { money: 500000, xp: 500 } }, { id: 'dist', name: '合計 20km 走行', key: 'dist', goal: 20000, unit: v => (v / 1000).toFixed(1) + ' km', rw: { item: 'ev_nye_dc' } }, { id: 'win', name: '年越しナイトランで勝利', key: 'evWins', goal: 1, rw: { item: 'ev_nye_ne' } }, { id: 'drift', name: 'ドリフトスコア合計 50,000点', key: 'drift', goal: 50000, rw: { item: 'ev_nye_tt', dia: 30 } }],
    races: [{ k: 'race', title: '年越しナイトラン', sub: '夜景の湾岸線でライバルと1周バトル', map: 'ev_nye_bay', rival: { name: '大晦日の 走り屋', team: 'COUNTDOWN', car: 'hk_sd3', color: '#101018', skill: 0.86 }, prize: 800000 }, { k: 'free', title: 'カウントダウン・ドライブ', sub: '大晦日の夜景シティを自由に走る', map: 'ev_nye_city' }] },
  { id: 'ny2027', title: 'NEW YEAR 2027', jp: '2027年、新しい走りの始まり', start: JST('2027-01-01T00:00:00'), end: JST('2027-01-15T23:59:59'), art: 'ny',
    desc: '初日の出のコースで新年限定レースとタイムアタック。参加中は獲得XPが1.5倍！ 2027年限定のデカール・ナンバー・ホイール・カラー・称号を集めよう。', cond: 'だれでも参加できます（参加中は XP 1.5倍ボーナス）', xpBonus: 1.5,
    rewardItems: ['ev_ny_dc', 'ev_ny_dc2', 'ev_ny_pl', 'ev_ny_wh', 'ev_ny_pt', 'ev_ny_tt'],
    missions: [{ id: 'r3', name: '新年に3レース完走', key: 'races', goal: 3, rw: { item: 'ev_ny_dc2', xp: 500 } }, { id: 'pb', name: '自己ベストを更新', key: 'pb', goal: 1, rw: { item: 'ev_ny_pl' } }, { id: 'dist', name: '合計 50km 走行', key: 'dist', goal: 50000, unit: v => (v / 1000).toFixed(1) + ' km', rw: { item: 'ev_ny_wh' } }, { id: 'drift', name: 'ドリフトスコア合計 100,000点', key: 'drift', goal: 100000, rw: { item: 'ev_ny_pt' } }, { id: 'win', name: '新年限定レースで勝利', key: 'evWins', goal: 1, rw: { item: 'ev_ny_dc', dia: 30 } }, { id: 'all', name: 'ほかのミッションをすべて達成', key: 'allDone', goal: 1, rw: { item: 'ev_ny_tt', dia: 50 } }],
    races: [{ k: 'race', title: '新年限定レース', sub: '初日の出ラインでライバルと1周バトル', map: 'ev_ny_sunrise', rival: { name: '初詣の 疾風', team: 'NEW YEAR 2027', car: 'hk_sd4', color: '#e8e8ea', skill: 0.88 }, prize: 1000000 }, { k: 'time', title: '新年タイムアタック', sub: '初日の出ラインで自己ベストに挑戦', map: 'ev_ny_sunrise' }] }
];
const evState = e => { const t = SRV.now(); return t < e.start ? 'upcoming' : t > e.end ? 'ended' : 'live'; };
const evData = id => { const d = SAVE.data; d.ev = d.ev || {}; return d.ev[id] = d.ev[id] || { joined: 0, prog: {}, claimed: {}, got: [] }; };
function evMissionProg(e, m) { const D = evData(e.id); if (m.key === 'allDone') return e.missions.filter(x => x.key !== 'allDone').every(x => D.claimed[x.id]) ? 1 : 0; return D.prog[m.key] || 0; }
// レース結果をイベントに反映（開催中・参加済みのイベントだけ）
function evOnResult(res, game) { const d = SAVE.data; for (const e of EVENTS) { if (!e.missions || evState(e) !== 'live') continue; const D = evData(e.id); if (!D.joined) continue;
    const fin = res.reason !== 'crash' && res.reason !== 'stuck'; if (fin) D.prog.races = (D.prog.races || 0) + 1;
    D.prog.dist = (D.prog.dist || 0) + Math.max(0, Math.min(200000, game ? game.totalDist : 0)); D.prog.drift = (D.prog.drift || 0) + (res.mode === 'touge' ? res.score || 0 : (game && game.drift ? game.drift.score || 0 : 0));
    if (D.pbBase === undefined) D.pbBase = d.stats.pbs || 0; D.prog.pb = Math.max(0, (d.stats.pbs || 0) - D.pbBase);
    if (res.cfg && res.cfg.evId === e.id && res.cfg.evRace && res.win) D.prog.evWins = (D.prog.evWins || 0) + 1; } }
// 参加中のイベントの XP ボーナス
{ const _ax = addXp; addXp = function (n, why) { let m = 1; for (const e of EVENTS) if (e.xpBonus && evState(e) === 'live' && evData(e.id).joined) m = Math.max(m, e.xpBonus); return _ax(Math.round(n * m), why); }; }

// ---- イベントのビジュアル（SVG） ----
function evArt(kind, w = 640, h = 200) {
  const car = (x, y, s, col) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 30 L18 18 L60 12 L92 0 L150 0 L180 14 L210 18 L222 30 L222 40 L0 40 Z" fill="${col}"/><path d="M98 4 L146 4 L168 15 L84 15 Z" fill="#9ad0ff" opacity=".55"/><circle cx="48" cy="40" r="13" fill="#111"/><circle cx="178" cy="40" r="13" fill="#111"/><circle cx="48" cy="40" r="6" fill="#888"/><circle cx="178" cy="40" r="6" fill="#888"/><rect x="214" y="22" width="9" height="5" fill="#fff8c0"/><rect x="0" y="22" width="8" height="5" fill="#ff3030"/></g>`;
  let r = (s => () => (s = (s * 9301 + 49297) % 233280) / 233280)(kind.length * 77 + 3), b = '';
  if (kind === 'nye') { b += `<defs><linearGradient id="gN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050520"/><stop offset="1" stop-color="#1a1040"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#gN)"/>`;
    for (let i = 0; i < 60; i++) b += `<circle cx="${r() * w}" cy="${r() * h * 0.5}" r="${r() * 1.2 + 0.3}" fill="#fff" opacity="${0.4 + r() * 0.6}"/>`;
    for (const [cx, cy, c] of [[w * 0.2, 50, '#ffd76a'], [w * 0.55, 38, '#ff6ab0'], [w * 0.82, 58, '#6ad0ff']]) for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; b += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a) * 30}" y2="${cy + Math.sin(a) * 30}" stroke="${c}" stroke-width="2" stroke-linecap="round" opacity=".9"/><circle cx="${cx + Math.cos(a) * 34}" cy="${cy + Math.sin(a) * 34}" r="2" fill="${c}"/>`; }
    for (let i = 0; i < 26; i++) { const bw = 14 + r() * 30, bh = 30 + r() * 70, x = i * (w / 26); b += `<rect x="${x}" y="${h - 40 - bh}" width="${bw}" height="${bh}" fill="#0b0b20"/>`; for (let k = 0; k < 6; k++) if (r() < 0.6) b += `<rect x="${x + 3 + r() * (bw - 6)}" y="${h - 40 - bh + 4 + r() * (bh - 8)}" width="2.5" height="2.5" fill="#ffd76a" opacity=".8"/>`; }
    for (let i = 0; i < 40; i++) b += `<circle cx="${i * w / 40 + 6}" cy="${h - 46 + Math.sin(i) * 4}" r="2.2" fill="${['#ff4040', '#40ff80', '#ffd040', '#40a0ff', '#fff'][i % 5]}"/>`;
    b += `<rect y="${h - 40}" width="${w}" height="40" fill="#111122"/>` + car(w * 0.36, h - 60, 0.95, '#1e2a60');
  } else if (kind === 'ny') { b += `<defs><linearGradient id="gY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3a80"/><stop offset=".55" stop-color="#ff9a5a"/><stop offset="1" stop-color="#ffd27a"/></linearGradient><radialGradient id="gS"><stop offset="0" stop-color="#fff6c0"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#gY)"/>`;
    b += `<circle cx="${w / 2}" cy="${h - 40}" r="120" fill="url(#gS)"/><circle cx="${w / 2}" cy="${h - 40}" r="34" fill="#fff1b0"/>`;
    for (let k = 0; k < 14; k++) { const a = Math.PI + k / 13 * Math.PI; b += `<line x1="${w / 2}" y1="${h - 40}" x2="${w / 2 + Math.cos(a) * 300}" y2="${h - 40 + Math.sin(a) * 300}" stroke="#fff4c0" stroke-width="3" opacity=".25"/>`; }
    b += `<rect y="${h - 40}" width="${w}" height="40" fill="#1a2a5a" opacity=".85"/><text x="${w / 2}" y="${h * 0.38}" font-family="Orbitron,Arial" font-weight="900" font-size="64" fill="#fff" text-anchor="middle" opacity=".92" letter-spacing="6">2027</text>` + car(w * 0.08, h - 60, 0.95, '#ff5a2a');
  } else { b += `<rect width="${w}" height="${h}" fill="#0a2a18"/><rect width="${w}" height="${h}" fill="url(#gX)"/>`; for (let i = 0; i < 70; i++) b += `<circle cx="${r() * w}" cy="${r() * h}" r="${r() * 2 + 0.5}" fill="#fff" opacity=".8"/>`;
    b += `<polygon points="${w * 0.8},20 ${w * 0.72},${h - 40} ${w * 0.88},${h - 40}" fill="#0f6a34"/><circle cx="${w * 0.8}" cy="20" r="6" fill="#ffd700"/><rect y="${h - 40}" width="${w}" height="40" fill="#e8f0ff"/>` + car(w * 0.15, h - 60, 0.95, '#c8102e'); }
  return `<svg class="ev-art" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${b}</svg>`;
}

// ---- 年越しカウントダウンと HAPPY NEW YEAR 演出（サーバー時刻で全員同時） ----
const NYFX = {
  tick() { const t = SRV.now(), d = SAVE.data; if (!d) return; const left = NY_MIDNIGHT - t;
    if (left > 0 && left <= 10500 && !this.cd) this.countdown();
    if (left <= 0 && left > -30 * 60000 && !d.nyShown2027) this.show(); },
  ensure() { let o = document.getElementById('nyFx'); if (!o) { o = document.createElement('div'); o.id = 'nyFx'; document.body.appendChild(o); o.addEventListener('click', e => { if (e.target.closest('[data-ny]')) this.close(); }); } return o; },
  countdown() { this.cd = true; const o = this.ensure(); o.className = 'show cd'; o.innerHTML = `<div class="ny-cd" id="nyCd"></div><small class="ny-sub">2026 → 2027 カウントダウン（日本時間）</small>`;
    const step = () => { const left = Math.ceil((NY_MIDNIGHT - SRV.now()) / 1000); const el = document.getElementById('nyCd'); if (!el) return; if (left <= 0) return this.show(); el.textContent = left; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); AUDIO.tone(left <= 3 ? 880 : 660, 0.2, 'square', 0.12); setTimeout(step, ((NY_MIDNIGHT - SRV.now()) % 1000 + 1000) % 1000 || 1000); }; step(); },
  show() { const d = SAVE.data; if (this.on) return; this.on = true; d.nyShown2027 = Date.now(); SAVE.save(); const o = this.ensure(); o.className = 'show party';
    o.innerHTML = `<canvas id="nyCv"></canvas><div class="ny-box"><div class="ny-t">HAPPY NEW YEAR</div><div class="ny-y">2027!</div><small>あけましておめでとうございます！ 今年も最高の走りを。</small><button class="btn pri big" data-ny="1">OK</button></div>`;
    AUDIO.duckMusic(0.2, 1); AUDIO.play('t21'); AUDIO.fanfare(); this.cv = o.querySelector('#nyCv'); this.cv.width = innerWidth; this.cv.height = innerHeight; this.parts = []; this.loop(); this.fw = setInterval(() => this.firework(), 420); this.firework(); },
  firework() { if (!this.cv) return; const W = this.cv.width, H = this.cv.height, x = W * (0.15 + Math.random() * 0.7), y = H * (0.15 + Math.random() * 0.35), c = ['#ffd76a', '#ff6ab0', '#6ad0ff', '#7dff9a', '#ffffff', '#ff8a3a'][Math.floor(Math.random() * 6)];
    for (let k = 0; k < 70; k++) { const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 4; this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, c }); }
    AUDIO.noiseBurst(0.5, 500, 0.6, 0.3, 0, 'lowpass'); AUDIO.noiseBurst(0.9, 4000, 0.8, 0.06, 0.05); },
  loop() { if (!this.on || !this.cv) return; const g = this.cv.getContext('2d'); g.fillStyle = 'rgba(0,0,10,0.22)'; g.fillRect(0, 0, this.cv.width, this.cv.height); g.globalCompositeOperation = 'lighter';
    this.parts = this.parts.filter(p => p.l > 0); for (const p of this.parts) { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.vx *= 0.985; p.l -= 0.011; g.globalAlpha = p.l; g.fillStyle = p.c; g.fillRect(p.x, p.y, 2.4, 2.4); }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; requestAnimationFrame(() => this.loop()); },
  close() { clearInterval(this.fw); this.on = false; this.cd = false; const o = document.getElementById('nyFx'); if (o) { o.className = ''; o.innerHTML = ''; } }
};
setInterval(() => { try { NYFX.tick(); } catch (e) { } }, 500);

// ---- 画面 ----
Object.assign(UI, {
  r_events() {
    $('panelTitle').textContent = 'EVENTS'; this.show.setCar(SAVE.cur()); $('panelBody').classList.add('wide'); const tabs = [['live', 'LIVE 開催中'], ['upcoming', 'UPCOMING 開催予定'], ['ended', 'ENDED 終了']];
    if (!this.tab) this.tab = EVENTS.some(e => evState(e) === 'live') ? 'live' : 'upcoming';
    let h = `<div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${this.tab === k ? 'on' : ''}" data-a="setTab" data-v="${k}">${l}（${EVENTS.filter(e => evState(e) === k).length}）</button>`).join('')}</div>`;
    h += `<div class="note">日時はすべて日本時間（JST）です。カウントダウンはサーバーの時刻を基準にしています${SRV.ok ? '' : '（オフラインのため端末の時刻を使用中）'}。</div>`;
    const list = EVENTS.filter(e => evState(e) === this.tab);
    if (!list.length) h += `<div class="empty-card">${ICO('calendar', '#5ad1ff', 40)}<b>${this.tab === 'ended' ? '終了したイベントはまだありません' : this.tab === 'live' ? '開催中のイベントはありません' : '開催予定のイベントはありません'}</b><small>${this.tab === 'ended' ? 'イベントが終わると、ここで内容と受け取った報酬を確認できます。' : ''}</small></div>`;
    h += list.map(e => this.evCardHTML(e)).join('');
    clearInterval(this._evT); this._evT = setInterval(() => { const els = document.querySelectorAll('[data-evcd]'); if (!els.length) return clearInterval(this._evT); els.forEach(el => { const e = EVENTS.find(x => x.id === el.dataset.evcd); const st = evState(e); el.textContent = st === 'upcoming' ? '開始まで ' + fmtLeft2(e.start - SRV.now()) : st === 'live' ? '終了まで ' + fmtLeft2(e.end - SRV.now()) : '終了しました'; }); }, 1000);
    return h;
  },
  evCardHTML(e) { const st = evState(e), D = evData(e.id), lab = { live: 'LIVE', upcoming: 'UPCOMING', ended: 'ENDED' }[st];
    const done = e.missions ? e.missions.filter(m => D.claimed[m.id]).length : 0;
    return `<div class="ev-card ${st}"><div class="ev-vis">${evArt(e.art)}<span class="ev-st ${st}">${lab}</span></div><div class="ev-body"><small>${fmtJst(e.start)} 〜 ${fmtJst(e.end)}（JST）</small><b>${esc(e.title)}</b><em>${esc(e.jp)}</em><div class="ev-cd" data-evcd="${e.id}">${st === 'upcoming' ? '開始まで ' + fmtLeft2(e.start - SRV.now()) : st === 'live' ? '終了まで ' + fmtLeft2(e.end - SRV.now()) : '終了しました'}</div>
      <p>${esc(e.desc)}</p><div class="ev-cond">${ICO('users', '#9ad8ff', 14)} ${esc(e.cond)}</div>
      <div class="ev-rw">${(e.rewardItems || []).map(id => ITEM_BY_ID[id]).filter(Boolean).map(it => `<span class="ev-ri" style="--rc:${RARITY[it.rarity].color}" title="${esc(it.name)}">${itemIconSvg(it, 30)}${invHas(it.id) ? '<i>✓</i>' : ''}</span>`).join('') || (e.rewards || []).map(r => `<span class="chip2">${esc(r)}</span>`).join('')}</div>
      ${e.missions ? `<div class="ev-pr">ミッション ${done} / ${e.missions.length} 達成${D.joined ? ' ・ 参加中' : ''}</div>` : ''}
      <button class="btn ${st === 'live' ? 'pri' : ''} big" data-a="evOpen" data-v="${e.id}">${st === 'live' ? (e.screen ? 'イベントへ' : D.joined ? 'イベントへ' : '参加する') : st === 'upcoming' ? '詳細を見る' : '履歴を見る'}</button></div></div>`; },
  a_evOpen(id) { const e = EVENTS.find(x => x.id === id); if (!e) return; if (e.screen && evState(e) === 'live') return this.open(e.screen); this.open('evDetail', { id }); },
  r_evDetail(arg) { const e = EVENTS.find(x => x.id === (arg && arg.id)) || EVENTS[1]; const st = evState(e), D = evData(e.id); $('panelTitle').textContent = 'EVENT'; this.show.setCar(SAVE.cur()); $('panelBody').classList.add('wide');
    let h = `<div class="ev-hero">${evArt(e.art, 720, 220)}<div class="ev-hero-t"><span class="ev-st ${st}">${{ live: 'LIVE', upcoming: 'UPCOMING', ended: 'ENDED' }[st]}</span><b>${esc(e.title)}</b><em>${esc(e.jp)}</em><small>${fmtJst(e.start)} 〜 ${fmtJst(e.end)}（JST）</small><div class="ev-cd" data-evcd="${e.id}"></div></div></div><p class="note">${esc(e.desc)}</p>`;
    if (st === 'live' && !D.joined) h += `<button class="btn pri big" data-a="evJoin" data-v="${e.id}">このイベントに参加する</button>`;
    if (st === 'upcoming') h += `<div class="note" style="color:#ffcf3d">開催前のため、まだ参加・報酬の受け取りはできません。</div>`;
    if (st === 'ended') h += `<div class="note">このイベントは終了しました。受け取った報酬：${D.got.length ? D.got.map(id => ITEM_BY_ID[id] ? ITEM_BY_ID[id].name : id).join('、') : 'なし'}</div>`;
    if (e.races) h += `<div class="h3">限定レース</div><div class="ev-races">${e.races.map((r, i) => `<button class="ev-race" data-a="evRace" data-v="${e.id}:${i}" ${st === 'live' && D.joined ? '' : 'disabled'}><b>${esc(r.title)}</b><small>${esc(r.sub)}</small>${r.prize ? `<em>勝利で ${yen(r.prize)}</em>` : ''}</button>`).join('')}</div>`;
    if (e.missions) h += `<div class="h3">イベントミッション</div><div class="ach-list">${e.missions.map(m => { const p = evMissionProg(e, m), ok = p >= m.goal, got = D.claimed[m.id]; return `<div class="ach ${ok ? 'ok' : ''} ${got ? 'got' : ''}"><div class="ach-ic">${ICO(ok ? 'medal2' : 'flag', ok ? '#ffcf3d' : '#888', 28)}</div><div class="ach-m"><b>${esc(m.name)}</b><span class="ach-bar"><i style="width:${Math.min(100, p / m.goal * 100)}%"></i></span><em>${m.unit ? m.unit(p) + ' / ' + m.unit(m.goal) : Math.min(p, m.goal).toLocaleString() + ' / ' + m.goal.toLocaleString()}</em></div><div class="ach-r"><small>${esc(this.evRwLabel(m.rw))}</small>${ok && !got ? `<button class="btn pri" data-a="evClaim" data-v="${e.id}:${m.id}" ${st === 'live' ? '' : 'disabled'}>受け取る</button>` : got ? '<em>受取済み</em>' : ''}</div></div>`; }).join('')}</div>`;
    setTimeout(() => { const el = document.querySelector(`[data-evcd="${e.id}"]`); if (el) el.textContent = st === 'upcoming' ? '開始まで ' + fmtLeft2(e.start - SRV.now()) : st === 'live' ? '終了まで ' + fmtLeft2(e.end - SRV.now()) : '終了しました'; }, 0);
    if (DEV.owner) h += `<div class="h3">開発者テスト</div><div class="btns"><button class="btn" data-a="nyTest">年越し演出をテスト</button></div>`;
    return h; },
  evRwLabel(r) { return [r.money ? yen(r.money) : '', r.dia ? 'ダイヤ ' + r.dia : '', r.xp ? r.xp + ' XP' : '', r.item && ITEM_BY_ID[r.item] ? ITEM_BY_ID[r.item].name : ''].filter(Boolean).join(' ＋ '); },
  a_evJoin(id) { const e = EVENTS.find(x => x.id === id); if (!e || evState(e) !== 'live') return this.toast('イベント期間外です'); const D = evData(id); if (!D.joined) { D.joined = SRV.now(); D.pbBase = SAVE.data.stats.pbs || 0; } SAVE.save(); AUDIO.confirm(); this.toast(e.title + ' に参加しました！'); this.render(); },
  a_evClaim(v) { const [id, mid] = v.split(':'); const e = EVENTS.find(x => x.id === id), m = e && e.missions.find(x => x.id === mid), D = evData(id); if (!m || D.claimed[mid]) return;
    if (evState(e) !== 'live') return this.toast('イベント期間外のため受け取れません'); if (evMissionProg(e, m) < m.goal) return;
    D.claimed[mid] = SRV.now(); const r = m.rw; if (r.item) D.got.push(r.item); const s = grantReward({ money: r.money, dia: r.dia, item: r.item }); if (r.xp) addXp(r.xp, 'イベント'); SAVE.save(); AUDIO.chestOpen(3); this.toast('ミッション報酬：' + s); this.showLvUps && this.showLvUps(); this.render(); },
  a_evRace(v) { const [id, i] = v.split(':'); const e = EVENTS.find(x => x.id === id), r = e && e.races[+i]; if (!r || evState(e) !== 'live' || !evData(id).joined) return this.toast('イベント期間外です'); const m = MAP_BY_ID[r.map];
    const base = { mapId: r.map, weather: m.weather, time: m.time, laps: 1, carInst: SAVE.cur(), evId: id, music: e.music || 'newyear' };
    if (r.k === 'race') this.launch(Object.assign(base, { mode: 'event', evRace: { title: r.title, prize: r.prize }, rivals: [r.rival] }));
    else this.launch(Object.assign(base, { mode: r.k === 'time' ? 'time' : 'free', rivals: [] })); },
  a_nyTest() { NYFX.on = false; NYFX.show(); }
});
window.__DLX = { SRV, EVENTS, evState, evData, NYFX, addXp: (n, w) => addXp(n, w) };
