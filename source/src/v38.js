// =====================================================================
// v38.js — v3.1：レジェンズパス（シーズン制バトルパス）・デイリーイベント・スペシャルイベント
//          新デイリーショップ（ダイヤで更新 1日3回）・新ロード画面・コモン系パックの中身を整理
// =====================================================================
const jstKey = (t = SRV.now()) => new Date(t + 9 * 3600000).toISOString().slice(0, 10);
const jstWeek = (t = SRV.now()) => { const j = new Date(t + 9 * 3600000), dow = (j.getUTCDay() + 6) % 7; return new Date(Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate() - dow)).toISOString().slice(0, 10); };
const msToJstMidnight = () => { const t = SRV.now(), j = new Date(t + 9 * 3600000); return Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate() + 1) - 9 * 3600000 - t; };

// ---------------- コモン系パックの中身を整理 ----------------
{ const LOW = { free: ['decal', 'paint', 'neon', 'caliper', 'plate', 'cash', 'dia'], bronze: ['decal', 'paint', 'neon', 'caliper', 'plate', 'meter', 'cash', 'dia'], silver: ['decal', 'paint', 'neon', 'caliper', 'plate', 'meter', 'wheel', 'bg', 'muffler', 'cash', 'dia', 'title'] };
  const _pp = packPool; packPool = function (c, rar) { const L = _pp(c, rar); const allow = LOW[c.id]; return allow ? L.filter(i => allow.includes(i.type)) : L; }; }

// ---------------- レジェンズパス ----------------
const PASS_LV = 30, PASS_XP = 1000, PASS_PREM = 950, PASS_STAGE = 128;
function passSeasons() {
  const S = [{ id: 's1', name: 'SEASON 1', title: 'LEGENDS RISING', start: JST('2026-11-01T00:00:00'), end: JST('2026-11-30T23:59:59'), theme: 'rise' },
    { id: 's2', name: 'SEASON 2', title: 'WINTER LEGENDS', start: JST('2026-12-01T00:00:00'), end: JST('2026-12-31T23:59:59'), theme: 'xmas' }];
  // 2027年以降は毎月自動で新シーズン
  const names = ['NEW HORIZON', 'NEON NIGHTS', 'SAKURA DRIFT', 'MOUNTAIN KINGS', 'SUMMER HEAT', 'MIDNIGHT EXPRESS', 'TYPHOON', 'GOLDEN HOUR', 'HARVEST RUN', 'AUTUMN PASS', 'FROST LINE', 'WINTER LEGENDS'];
  for (let k = 0; k < 24; k++) { const y = 2027 + Math.floor(k / 12), m = k % 12, st = Date.UTC(y, m, 1) - 9 * 3600000, en = Date.UTC(y, m + 1, 1) - 9 * 3600000 - 1000; S.push({ id: `s${y}${String(m + 1).padStart(2, '0')}`, name: `SEASON ${3 + k}`, title: names[m], start: st, end: en, theme: m === 11 ? 'xmas' : ['rise', 'neon', 'sakura'][k % 3] }); }
  return S; }
function curSeason() { const t = SRV.now(); return passSeasons().find(s => t >= s.start && t <= s.end) || passSeasons()[0]; }
function passRewards(s) { const xm = s.theme === 'xmas', F = [], P = [], rng = mulberry32([...s.id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
  const cardCar = xm ? 'xc_frost' : ['pk_f1', 'pk_tank', 'pk_brick', 'hk_van'][Math.floor(rng() * 4)], pk = xm ? 'xmaspack' : 'gold';
  for (let L = 1; L <= PASS_LV; L++) {
    const f = L % 5 === 0 ? ['pack', L >= 20 ? 'gold' : 'silver', 1] : L % 3 === 0 ? ['dia', 10 + Math.floor(L / 3) * 2] : ['money', 30000 + L * 10000];
    let p = L === PASS_LV ? ['cards', cardCar, 20] : L % 10 === 0 ? ['box', pk] : L % 5 === 0 ? ['cards', cardCar, 5] : L % 4 === 0 ? ['ticket', 1] : L % 3 === 0 ? ['dia', 30 + L] : L % 2 === 0 ? ['pack', xm ? 'xmaspack' : (L > 15 ? 'legend' : 'gold'), 1] : ['money', 150000 + L * 20000];
    if (xm && L === 15) p = ['item', 'pfx_3']; if (xm && L === 25) p = ['item', 'ttx_2']; if (!xm && L === 15) p = ['item', 'pf_18']; if (!xm && L === 25) p = ['item', 'tt_24'];
    F.push(f); P.push(p); }
  return { F, P }; }
function passData() { const d = SAVE.data, s = curSeason(); if (!d.pass || d.pass.sid !== s.id) d.pass = { sid: s.id, xp: 0, prem: false, cf: [], cp: [], snap: {}, mdone: {} }; return d.pass; }
const passLevel = () => Math.min(PASS_LV, Math.floor(passData().xp / PASS_XP));
function rwLabel(r) { const [k, a, n] = r; if (k === 'money') return yen(a); if (k === 'dia') return 'ダイヤ ×' + a; if (k === 'pack') return ((CHESTS.find(c => c.id === a) || {}).name || a) + ' ×' + n; if (k === 'box') return ((CHESTS.find(c => c.id === a) || {}).name || a).replace('カードパック', '') + ' BOX'; if (k === 'cards') return (CAR_BY_ID[a] || {}).name + ' カード ×' + n; if (k === 'ticket') return 'フルチューンチケット ×' + a; if (k === 'item') return (ITEM_BY_ID[a] || {}).name || a; return ''; }
function rwArt(r, s = 64) { const [k, a, n] = r; if (k === 'money') return SICO.yen(s); if (k === 'dia') return SICO.gem(s); if (k === 'pack') { const c = CHESTS.find(x => x.id === a); return c ? packPouch(c, s / 120) : ''; } if (k === 'box') { const c = CHESTS.find(x => x.id === a); return c ? boxHTML(c, s / 150) : ''; }
  if (k === 'cards') return itemIconSvg({ type: 'carcard', rarity: 'L', cards: n }, s); if (k === 'ticket') return itemIconSvg(ITEM_BY_ID.tk_full, s); if (k === 'item') { const it = ITEM_BY_ID[a]; return it ? (profItemPreview(it, s * 0.7) || itemIconSvg(it, s)) : ''; } return ''; }
function grantRw(r) { const d = SAVE.data, [k, a, n] = r, u = unopened();
  if (k === 'money') SAVE.addMoney(a); if (k === 'dia') d.diamonds = (d.diamonds || 0) + a; if (k === 'pack') u.packs[a] = (u.packs[a] || 0) + n; if (k === 'box') u.boxes[a] = (u.boxes[a] || 0) + 1;
  if (k === 'cards') { d.carCards = d.carCards || {}; d.carCards[a] = (d.carCards[a] || 0) + n; } if (k === 'ticket') { d.tickets = d.tickets || {}; d.tickets.tk_full = (d.tickets.tk_full || 0) + a; } if (k === 'item') { const it = ITEM_BY_ID[a]; if (it) grantChestItem(it); } }
// ミッション（統計の差分で進行を計算）
const STATK = { races: s => s.finishes || 0, wins: s => s.wins || 0, dist: s => s.totalDist || 0, drift: s => s.driftTotal || 0, ta: s => s.taRuns || 0, packs: s => s.chests || 0 };
const PM_DAY = [['races', 3, '3レース完走', 300], ['wins', 2, '2回勝利する', 300], ['dist', 15000, '合計15km走る', 300], ['drift', 30000, 'ドリフトスコア合計30,000点', 300], ['ta', 2, 'タイムアタックを2回走る', 300], ['packs', 3, 'カードパックを3パック開ける', 300]];
const PM_WEEK = [['races', 20, '20レース完走', 1200], ['wins', 10, '10回勝利する', 1200], ['dist', 100000, '合計100km走る', 1200], ['drift', 300000, 'ドリフトスコア合計300,000点', 1200], ['packs', 20, 'カードパックを20パック開ける', 1200]];
function passMissions() { const P = passData(), st = SAVE.data.stats, dk = jstKey(), wk = jstWeek();
  const snap = (per, key) => { if (!P.snap[per] || P.snap[per].k !== key) P.snap[per] = { k: key, s: Object.fromEntries(Object.entries(STATK).map(([n, f]) => [n, f(st)])) }; return P.snap[per]; };
  const sd = snap('day', dk), sw = snap('week', wk); const r = mulberry32([...dk].reduce((a, c) => a * 31 + c.charCodeAt(0), 3)); const day = PM_DAY.slice().sort(() => r() - 0.5).slice(0, 3);
  const mk = (per, S, list, key) => list.map(([k, goal, name, xp]) => { const id = per + ':' + key + ':' + k, cur = Math.max(0, STATK[k](st) - S.s[k]); return { id, per, name, goal, cur: Math.min(cur, goal), xp, done: !!P.mdone[id], ok: cur >= goal, unit: k === 'dist' ? v => (v / 1000).toFixed(1) + 'km' : v => Math.round(v).toLocaleString() }; });
  return mk('d', sd, day, dk).concat(mk('w', sw, PM_WEEK.slice(0, 4), wk)); }
function passFmtLeft(ms) { const d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24; return d ? `${d}日${String(h).padStart(2, '0')}時間` : `${h}時間${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}分`; }
Object.assign(UI, {
  r_pass() { $('panelTitle').textContent = 'LEGENDS PASS'; $('panelBody').classList.add('wide'); this.show.setCar(SAVE.cur()); const s = curSeason(), P = passData(), R = passRewards(s), lv = passLevel(), inLv = P.xp - lv * PASS_XP, d = SAVE.data;
    const ms = passMissions(), unclaimedM = ms.filter(m => m.ok && !m.done).length;
    let h = `<div class="lp theme-${s.theme}"><div class="lp-head"><div><small>${s.name}</small><b>${s.title}</b></div><div class="lp-left">終了まで：<b>${passFmtLeft(s.end - SRV.now())}</b></div></div><div class="lp-main">
      <div class="lp-promo ${P.prem ? 'own' : ''}"><div class="lp-badge">${this.passBadge(64)}</div><b>${P.prem ? 'プレミアムパス 購入済み' : 'プレミアムパス'}</b><small>${P.prem ? '上の列の報酬もすべて受け取れます' : '上の列の豪華な報酬（ボックス・限定車カード・限定アイテムなど）が受け取れるようになります'}</small>${P.prem ? '' : `<button class="lp-buy" data-a="passBuy">${SICO.gem(18)} ${PASS_PREM} で購入</button>`}</div>
      <div class="lp-col lp-lab"><div class="lp-cell prem"><div class="lp-crest">${this.passBadge(44)}</div><b>プレミアム</b></div><div class="lp-cell free"><b>無料パス</b></div><div class="lp-num">ステージ</div></div><div class="lp-track">`;
    for (let L = 1; L <= PASS_LV; L++) { const got = L <= lv, fc = P.cf.includes(L), pc = P.cp.includes(L);
      const cell = (r, kind, claimed, locked) => `<button class="lp-cell ${kind} ${claimed ? 'got' : ''} ${locked ? 'lock' : ''} ${!claimed && !locked && got ? 'ready' : ''}" data-a="passClaim" data-v="${kind}:${L}" ${claimed || locked || !got ? 'disabled' : ''}>${claimed ? '<i class="lp-chk">✓</i>' : locked ? `<i class="lp-lock">${ICO('lock', '#ffcf3d', 14)}</i>` : ''}<div class="lp-art">${rwArt(r, 56)}</div><small>${esc(rwLabel(r))}</small></button>`;
      h += `<div class="lp-col ${L === lv + 1 ? 'next' : ''}">${cell(R.P[L - 1], 'prem', pc, !P.prem)}${cell(R.F[L - 1], 'free', fc, false)}<div class="lp-num"><span class="lp-bar"><i style="width:${got ? 100 : L === lv + 1 ? inLv / PASS_XP * 100 : 0}%"></i></span><b>${String(L).padStart(2, '0')}</b></div></div>`; }
    h += `</div></div><div class="lp-foot"><button class="lp-mis" data-a="passMis">ミッション${unclaimedM ? `<i class="nm-b">${unclaimedM}</i>` : ''}</button><div class="lp-next">${lv >= PASS_LV ? 'すべてのステージをクリア！' : `あと <b>${PASS_XP - inLv}</b> パスポイントで次の報酬`}</div>${lv < PASS_LV ? `<button class="lp-stage" data-a="passStage">ステージを購入 <b>${String(lv + 1).padStart(2, '0')}</b> ${SICO.gem(16)} ${PASS_STAGE}</button>` : ''}${P.prem ? '' : `<button class="lp-buy2" data-a="passBuy">${this.passBadge(30)} パスを購入</button>`}</div></div>`;
    setTimeout(() => { const t = document.querySelector('.lp-track'), n = document.querySelector('.lp-col.next'); if (t && n) t.scrollLeft = n.offsetLeft - 260; }, 30);
    return h; },
  passBadge(s) { return `<svg width="${s}" height="${s}" viewBox="0 0 64 64"><defs><linearGradient id="pbg${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe58a"/><stop offset="1" stop-color="#c98a00"/></linearGradient></defs><path d="M32 3l24 10v18c0 15-10 25-24 30C18 56 8 46 8 31V13z" fill="url(#pbg${s})" stroke="#5a3a00" stroke-width="2.5"/><path d="M32 10l18 8v13c0 11-7 19-18 23-11-4-18-12-18-23V18z" fill="#1a1d26"/><path d="M32 18l4 9 10 1-7.5 6.5 2.3 9.5L32 39l-8.8 5 2.3-9.5L18 28l10-1z" fill="url(#pbg${s})"/><text x="32" y="58" font-size="7" font-weight="900" text-anchor="middle" fill="#5a3a00">LP</text></svg>`; },
  a_passClaim(v) { const [kind, ls] = v.split(':'), L = +ls, P = passData(), R = passRewards(curSeason()); if (L > passLevel()) return; const arr = kind === 'prem' ? P.cp : P.cf; if (arr.includes(L) || (kind === 'prem' && !P.prem)) return;
    arr.push(L); const r = (kind === 'prem' ? R.P : R.F)[L - 1]; grantRw(r); SAVE.save(); AUDIO.pkReveal && AUDIO.pkReveal(kind === 'prem' ? 'E' : 'R'); this.toast('獲得：' + rwLabel(r) + (r[0] === 'pack' || r[0] === 'box' ? '（ストア → 未開封）' : '')); this.refreshTop(); this.render(); },
  a_passBuy() { const d = SAVE.data, P = passData(); if (P.prem) return; if ((d.diamonds || 0) < PASS_PREM) return this.toast(`ダイヤが足りません（${PASS_PREM}必要）`);
    this.modal(`<h2>プレミアムパス</h2><div class="note">${curSeason().name}「${curSeason().title}」のプレミアムパスを ${PASS_PREM} ダイヤで購入しますか？ いままでのステージ分のプレミアム報酬もさかのぼって受け取れます。</div><div class="btns"><button class="btn" data-a="closeModal">やめる</button><button class="btn pri" data-a="passBuyGo">購入する</button></div>`); },
  a_passBuyGo() { const d = SAVE.data, P = passData(); this.closeModal(); if (P.prem || (d.diamonds || 0) < PASS_PREM) return; d.diamonds -= PASS_PREM; P.prem = true; SAVE.save(); AUDIO.levelUp && AUDIO.levelUp(); this.toast('プレミアムパスを購入しました！'); this.refreshTop(); this.render(); },
  a_passStage() { const d = SAVE.data, P = passData(); if (passLevel() >= PASS_LV) return; if ((d.diamonds || 0) < PASS_STAGE) return this.toast(`ダイヤが足りません（${PASS_STAGE}必要）`); d.diamonds -= PASS_STAGE; P.xp = (passLevel() + 1) * PASS_XP; SAVE.save(); AUDIO.buy && AUDIO.buy(); this.refreshTop(); this.render(); },
  a_passMis() { const ms = passMissions(); const row = m => `<div class="pm-row ${m.done ? 'done' : ''}"><div class="pm-t"><b>${esc(m.name)}</b><span class="mx-bar"><i style="width:${m.cur / m.goal * 100}%"></i></span><small>${m.unit(m.cur)} / ${m.unit(m.goal)}</small></div><span class="pm-xp">+${m.xp} PP</span>${m.done ? '<span class="pm-ok">受取済み</span>' : `<button class="btn ${m.ok ? 'pri' : ''}" data-a="passMisClaim" data-v="${m.id}" ${m.ok ? '' : 'disabled'}>受け取る</button>`}</div>`;
    this.modal(`<h2>パスミッション</h2><div class="note">ミッションをクリアしてパスポイント（PP）を集めよう。${PASS_XP} PPごとにステージが1つ進みます。</div><div class="h3">デイリー（毎日 0:00 更新・あと ${passFmtLeft(msToJstMidnight())}）</div>${ms.filter(m => m.per === 'd').map(row).join('')}<div class="h3">ウィークリー（毎週月曜 0:00 更新）</div>${ms.filter(m => m.per === 'w').map(row).join('')}<div class="btns"><button class="btn pri" data-a="closeModal">閉じる</button></div>`); },
  a_passMisClaim(id) { const P = passData(), m = passMissions().find(x => x.id === id); if (!m || !m.ok || P.mdone[id]) return; P.mdone[id] = 1; const before = passLevel(); P.xp += m.xp; SAVE.save(); AUDIO.confirm && AUDIO.confirm(); if (passLevel() > before) this.toast(`パスのステージが ${passLevel()} に上がりました！`); this.a_passMis(); }
});

// ---------------- デイリーイベント（お金・ダイヤがもらえるレース） ----------------
function dailyEvents() { const k = jstKey(), r = mulberry32([...k].reduce((a, c) => a * 37 + c.charCodeAt(0), 11)); const pick = L => L[Math.floor(r() * L.length)];
  const touge = MAPS.filter(m => m.env === 'mountain' && m.cat === 'touge' && !m.xmas), other = MAPS.filter(m => ['highway', 'city', 'coast', 'circuit'].includes(m.env) && !m.xmas && m.cat !== 'event');
  const m1 = pick(touge), m2 = pick(touge.filter(m => m !== m1)), m3 = pick(other);
  return [{ id: 'ta', kind: 'time', map: m1.id, title: 'タイムアタック', goal: Math.round(recordFor(m1.id) * 1.12 * 10) / 10, rw: [['money', 300000], ['dia', 10]], desc: g => `1周 ${fmtLap(g)} 以内で走る` },
    { id: 'dr', kind: 'touge', map: m2.id, title: 'ドリフトチャレンジ', goal: 25000, rw: [['money', 250000], ['dia', 8]], desc: g => `${g.toLocaleString()} 点以上を出す` },
    { id: 'rc', kind: 'race', map: m3.id, title: 'デイリーレース', goal: 1, rw: [['money', 400000], ['dia', 15]], desc: () => 'ライバルに勝つ' }]; }
function devData() { const d = SAVE.data, k = jstKey(); if (!d.devt || d.devt.k !== k) d.devt = { k, done: {}, bonus: false }; return d.devt; }
Object.assign(UI, {
  r_devent() { $('panelTitle').textContent = 'DAILY EVENT'; $('panelBody').classList.add('wide'); const D = devData(), L = dailyEvents(), all = L.every(e => D.done[e.id]);
    let h = `<div class="mx-hero dev"><div class="mx-hero-ic">${SICO.daily(54)}</div><div><b>DAILY EVENT</b><small>毎日3つのレースに挑戦して、お金とダイヤをゲット！</small></div><div class="mx-cd"><small>次の更新まで</small><b>${passFmtLeft(msToJstMidnight())}</b></div></div><div class="dv-grid">`;
    L.forEach((e, i) => { const m = MAP_BY_ID[e.map], done = D.done[e.id]; h += `<div class="dv-card ${done ? 'done' : ''}" style="animation-delay:${i * 0.06}s"><canvas width="220" height="110" data-thumb="${e.map}"></canvas><span class="dv-kind">${e.title}</span><b>${esc(m.jp)}</b><small>${e.desc(e.goal)}</small><div class="dv-rw">${e.rw.map(r => `<span>${rwArt(r, 20)} ${r[0] === 'money' ? yen(r[1]) : r[1]}</span>`).join('')}</div>${done ? '<span class="dv-ok">CLEAR ✓</span>' : `<button class="st-buy" data-a="devGo" data-v="${i}">挑戦する</button>`}</div>`; });
    h += `</div><div class="dv-bonus ${all ? 'ok' : ''}">${SICO.gem(28)}<div><b>3つすべてクリアでボーナス ダイヤ ×30</b><small>${L.filter(e => D.done[e.id]).length} / 3 クリア</small></div>${all ? (D.bonus ? '<span class="dv-ok">受取済み</span>' : '<button class="st-buy" data-a="devBonus">受け取る</button>') : ''}</div>`;
    setTimeout(() => this.drawThumbs && this.drawThumbs(), 0); return h; },
  a_devGo(i) { const e = dailyEvents()[+i], m = MAP_BY_ID[e.map], inst = SAVE.cur(); if (!e || devData().done[e.id]) return; const base = { mapId: e.map, weather: 'clear', time: m.time, laps: 1, carInst: inst, dailyEv: e.id };
    if (e.kind === 'race') return this.launch(Object.assign(base, { mode: 'event', evRace: { title: 'デイリーレース ・ ' + m.jp, prize: 0 }, rivals: [{ name: 'デイリーの 刺客', team: 'DAILY EVENT', car: inst.id, color: '#3a3f4a', skill: 0.82 }] }));
    this.launch(Object.assign(base, { mode: e.kind, rivals: [] })); },
  a_devBonus() { const D = devData(); if (D.bonus || !dailyEvents().every(e => D.done[e.id])) return; D.bonus = true; SAVE.data.diamonds = (SAVE.data.diamonds || 0) + 30; SAVE.save(); this.toast('ボーナス：ダイヤ ×30'); this.refreshTop(); this.render(); }
});
{ const _sr = UI.showResults; UI.showResults = function (res) { _sr.call(this, res); const id = res.cfg && res.cfg.dailyEv; if (!id) return; const e = dailyEvents().find(x => x.id === id), D = devData(); if (!e) return;
    let ok = false; if (e.kind === 'time') ok = res.laps && res.laps.length && Math.min(...res.laps.map(l => l.t)) <= e.goal && res.reason !== 'crash'; if (e.kind === 'touge') ok = (res.score || 0) >= e.goal; if (e.kind === 'race') ok = !!res.win;
    let note = ''; if (ok && !D.done[e.id]) { D.done[e.id] = 1; for (const r of e.rw) grantRw(r); SAVE.save(); note = `デイリーイベント クリア！ ${e.rw.map(rwLabel).join(' ＋ ')}`; } else if (!ok) note = `デイリーイベント：目標（${e.desc(e.goal)}）に届きませんでした`;
    const box = document.querySelector('#overlay .res-modal .btns'); if (box && note) box.insertAdjacentHTML('beforebegin', `<div class="dv-res ${ok ? 'ok' : ''}">${note}</div>`); }; }
{ const _rn = UI.a_resNext; UI.a_resNext = function () { const res = this.lastRes; if (res && res.cfg && res.cfg.dailyEv) { $('overlay').classList.remove('res-dim'); this.closeModal(); this.paused = false; AUDIO.applyVol(); this.game.exit(); this.goMenu(); return this.open('devent'); } return _rn.call(this); }; }

// ---------------- スペシャルイベント ----------------
EVENTS.push({ id: 'sp_dkc', title: 'SPECIAL EVENT', jp: 'ドリフトキング杯', start: JST('2026-11-20T00:00:00'), end: JST('2026-12-06T23:59:59'), art: 'sp', music: 'race',
  desc: '峠のドリフト王を決めるスペシャルイベント。雷鳴峠のライバル戦と明神峠のタイムアタックに挑み、ミッションを達成して豪華報酬をゲットしよう！', cond: 'だれでも参加できます（参加ボタンを押してから走った分がミッションに数えられます）',
  rewardItems: ['tt_24'],
  missions: [{ id: 'r5', name: '5レース完走', key: 'races', goal: 5, rw: { money: 800000, xp: 600 } }, { id: 'drift', name: 'ドリフトスコア合計 80,000点', key: 'drift', goal: 80000, rw: { dia: 40 } }, { id: 'dist', name: '合計 30km 走行', key: 'dist', goal: 30000, unit: v => (v / 1000).toFixed(1) + ' km', rw: { money: 1500000 } }, { id: 'win', name: 'ドリフトキング決定戦で勝利', key: 'evWins', goal: 1, rw: { item: 'tt_24', dia: 60 } }],
  races: [{ k: 'race', title: 'ドリフトキング決定戦', sub: '雷鳴峠で峠の王とバトル', map: 'kaminari', rival: { name: '峠の王 龍崎', team: 'DRIFT KINGS', car: 'hk_sd3', color: '#c8102e', skill: 0.9 }, prize: 1500000 }, { k: 'time', title: 'キング・タイムアタック', sub: '明神峠で自己ベストに挑戦', map: 'myojin' }] });
{ const _ea = evArt; evArt = function (kind, w = 640, h = 200) { if (kind !== 'sp') return _ea(kind, w, h);
    return `<svg viewBox="0 0 640 200" width="100%" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="spg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a0010"/><stop offset=".6" stop-color="#7a0a1a"/><stop offset="1" stop-color="#ff6a1a"/></linearGradient></defs><rect width="640" height="200" fill="url(#spg)"/>${Array.from({ length: 14 }, (_, k) => `<path d="M${-80 + k * 60} 200 L${k * 60 + 40} 0" stroke="#ffffff10" stroke-width="18"/>`).join('')}<path d="M0 170 Q160 120 300 150 T640 120 L640 200 L0 200z" fill="#100006"/><path d="M380 120 l40 -28 h70 l30 20 h30 l10 16 v10 h-190z" fill="#c8102e"/><circle cx="420" cy="140" r="12" fill="#111"/><circle cx="510" cy="140" r="12" fill="#111"/>${Array.from({ length: 18 }, (_, k) => `<circle cx="${330 - k * 14}" cy="${130 - Math.sin(k) * 10}" r="${6 + k}" fill="#ffffff${(30 - k).toString(16).padStart(2, '0')}"/>`).join('')}<text x="34" y="80" font-family="Orbitron,sans-serif" font-size="40" font-weight="900" font-style="italic" fill="#ffd400">DRIFT KING CUP</text><text x="36" y="108" font-size="16" font-weight="900" fill="#fff">SPECIAL EVENT</text></svg>`; }; }

// ---------------- 新デイリーショップ（ダイヤで更新 1日3回） ----------------
const DS_REF_MAX = 3, DS_REF_COST = 20;
function dsState() { const d = SAVE.data, k = jstKey(); if (!d.dsRef || d.dsRef.k !== k) d.dsRef = { k, n: 0 }; return d.dsRef; }
{ const _ds = dailyShop; dailyShop = function (key) { const S = dsState(); return _ds((key || srvDateKey()) + (S.n ? '#' + S.n : '')); }; }
function dsCards() { const S = dsState(), r = mulberry32([...(jstKey() + '#' + S.n)].reduce((a, c) => a * 41 + c.charCodeAt(0), 5)); const cars = Object.keys(CAR_CARDS).filter(id => !CAR_CARDS[id].xmas || (typeof xmasPackOpen === 'function' && xmasPackOpen()));
  return [0, 1].map(k => { const car = cars[Math.floor(r() * cars.length)], n = 1 + Math.floor(r() * 3); return { id: 'dsc' + k, car, n, price: 40 * n + Math.floor(r() * 3) * 10 }; }); }
Object.assign(UI, {
  stDailyHTML() { const d = SAVE.data, key = srvDateKey(), S = dsState(); d.shopBuy = d.shopBuy || {}; if (d.shopBuy.date !== key + '#' + S.n) d.shopBuy = { date: key + '#' + S.n, ids: [] }; const items = dailyShop(key), left = msToJstMidnight();
    clearInterval(this._dlT); this._dlT = setInterval(() => { const el = document.getElementById("dsLeft"); if (!el) return clearInterval(this._dlT); el.textContent = passFmtLeft(msToJstMidnight()); }, 30000);
    const tag = it => it.type === 'car' ? '車' : it.type === 'carcard' ? '車カード' : (ITEM_TYPES[it.type] || 'アイテム');
    let h = `<div class="ds"><div class="ds-main"><div class="ds-head"><div class="ds-title">${SICO.daily(34)}<b>デイリーショップ</b></div><div class="ds-ref"><div class="ds-reft"><span>新しいアイテムまであと：<b id="dsLeft">${passFmtLeft(left)}</b></span><span>今すぐ更新：<b>${DS_REF_MAX - S.n}/${DS_REF_MAX}</b></span></div><button class="ds-refb" data-a="dsRefresh" ${S.n >= DS_REF_MAX ? 'disabled' : ''}>${SICO.gem(22)} ${DS_REF_COST}</button></div></div><div class="ds-grid">`;
    items.forEach((it, i) => { const bought = d.shopBuy.ids.includes(it.id) || invHas(it.id), R = RARITY[it.rarity], useDia = it.rarity === 'E' || it.rarity === 'L', pr = useDia ? Math.round(R.shop / 30000) : R.shop;
      h += `<div class="ds-card ${bought ? 'sold' : ''}" style="--rc:${R.color};animation-delay:${i * 0.05}s"><div class="ds-it"><span class="ds-kind">${tag(it)}</span><div class="ds-ic">${this.itemIcon(it, 70)}</div><span class="ds-r">${it.rarity}</span><b class="ds-nm">${esc(it.name)}</b></div><div class="ds-info"><span class="ds-rar">${R.name}</span><b>${tag(it)}</b><small>${esc(it.desc || ITEM_TYPES[it.type] || '')}</small></div><button class="ds-price" data-a="dsBuy" data-v="${it.id}:${useDia ? 'dia' : 'yen'}" ${bought ? 'disabled' : ''}>${bought ? '購入済み' : (useDia ? SICO.gem(20) : SICO.yen(20)) + ' ' + pr.toLocaleString()}</button></div>`; });
    h += `</div></div><div class="ds-side"><div class="ds-sideh">${SICO.packs(30)}<b>車カードショップ</b></div>`;
    for (const c of dsCards()) { const car = CAR_BY_ID[c.car], have = carCards(c.car), need = (CAR_CARDS[c.car] || {}).need || 30, got = d.shopBuy.ids.includes(c.id);
      h += `<div class="ds-card side ${got ? 'sold' : ''}" style="--rc:#ffb300"><div class="ds-it">${featCard({ type: 'carcard', car: c.car, cards: c.n, rarity: 'E', name: car.name })}</div><div class="ds-info"><span class="ds-rar">エピック</span><b>車カード</b><span class="ds-prog"><i style="width:${Math.min(100, have / need * 100)}%"></i></span><small>${have}/${need}</small></div><button class="ds-price" data-a="dsCard" data-v="${c.id}" ${got ? 'disabled' : ''}>${got ? '購入済み' : SICO.gem(20) + ' ' + c.price}</button></div>`; }
    return h + `</div></div>`; },
  a_dsRefresh() { const S = dsState(), d = SAVE.data; if (S.n >= DS_REF_MAX) return this.toast('今日の更新回数を使い切りました'); if ((d.diamonds || 0) < DS_REF_COST) return this.toast('ダイヤが足りません'); d.diamonds -= DS_REF_COST; S.n++; SAVE.save(); AUDIO.pkSelect && AUDIO.pkSelect(); this.toast('品揃えを更新しました'); this.refreshTop(); this.render(); },
  a_dsBuy(v) { const [id, cur] = v.split(':'), it = ITEM_BY_ID[id], d = SAVE.data; if (!it || invHas(id) || d.shopBuy.ids.includes(id)) return; const R = RARITY[it.rarity];
    if (cur === 'dia') { const p = Math.round(R.shop / 30000); if ((d.diamonds || 0) < p) return this.toast('ダイヤが足りません'); d.diamonds -= p; } else if (!SAVE.spend(R.shop)) return;
    d.shopBuy.ids.push(id); grantChestItem(it); SAVE.save(); AUDIO.buy && AUDIO.buy(); this.toast(it.name + ' を購入しました'); this.refreshTop(); this.render(); },
  a_dsCard(id) { const c = dsCards().find(x => x.id === id), d = SAVE.data; if (!c || d.shopBuy.ids.includes(id)) return; if ((d.diamonds || 0) < c.price) return this.toast('ダイヤが足りません'); d.diamonds -= c.price; d.carCards = d.carCards || {}; d.carCards[c.car] = (d.carCards[c.car] || 0) + c.n; d.shopBuy.ids.push(id); SAVE.save(); AUDIO.buy && AUDIO.buy(); this.toast(`${CAR_BY_ID[c.car].name} カード ×${c.n}`); this.refreshTop(); this.render(); }
});

// ---------------- メニュー：パス・デイリーイベント ----------------
{ const _mi = UI.menuItems; UI.menuItems = function () { _mi.call(this); const el = $('menuList'); if (!el || !el.querySelector('.nm-hero')) return; const P = passData(), lv = passLevel(), s = curSeason(), D = devData(), dn = dailyEvents().filter(e => D.done[e.id]).length;
    el.querySelector('.nm-hero').insertAdjacentHTML('afterend', `<div class="nm-duo"><button class="nm-pass theme-${s.theme}" data-m="pass"><span class="nmp-ic">${this.passBadge(40)}</span><span class="nmp-tx"><small>LEGENDS PASS ・ ${s.name}</small><b>${s.title}</b><em>ステージ ${lv} / ${PASS_LV}　残り ${passFmtLeft(s.end - SRV.now())}</em><span class="nm-prog"><i style="width:${lv / PASS_LV * 100}%"></i></span></span></button><button class="nm-dev" data-m="devent">${SICO.daily(34)}<span><small>DAILY EVENT</small><b>デイリーイベント</b><em>${dn} / 3 クリア</em></span>${dn < 3 ? '<i class="nm-b">NEW</i>' : ''}</button></div>`); }; }
BNAV_OF.pass = 'events'; BNAV_OF.devent = 'race';

// ---------------- 新しいロード画面 ----------------
(function () { const L = document.getElementById('loading'); if (!L) return; L.classList.add('ld31'); L.insertAdjacentHTML('beforeend', `<div class="ld31-lines">${Array.from({ length: 18 }, (_, k) => `<i style="--k:${k}"></i>`).join('')}</div><div class="ld31-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="r0"/><circle cx="60" cy="60" r="52" class="r1" id="ld31Arc"/></svg><b id="ld31Pct">0%</b></div><div class="ld31-ver">VERSION ${GAME_VERSION}</div>`);
  const bar = document.getElementById('loadBar'); if (bar && window.MutationObserver) new MutationObserver(() => { const w = parseFloat(bar.style.width) || 0, a = document.getElementById('ld31Arc'), p = document.getElementById('ld31Pct'); if (a) a.style.strokeDashoffset = 327 * (1 - w / 100); if (p) p.textContent = Math.round(w) + '%'; }).observe(bar, { attributes: true, attributeFilter: ['style'] });
  const T = document.querySelector('#s-title .title-wrap'); if (T && !T.querySelector('.t31-ver')) T.insertAdjacentHTML('beforeend', `<div class="t31-ver">VERSION ${GAME_VERSION} ・ LEGENDS PASS 登場</div>`); document.getElementById('s-title') && document.getElementById('s-title').classList.add('t31'); })();
window.__DLX = Object.assign(window.__DLX || {}, { CHESTS, packPool, passSeasons, curSeason, passData, passRewards, passMissions, dailyEvents, devData, dsState });
