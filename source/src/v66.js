// =====================================================================
// v66.js — v4.7：中古車マーケット（プレイヤー同士の売買）・警察チェイスモード
//          ミステリーキー（限定車のデイリーイベント：お試しドライブ→限定車パックで星を上げ★5でキー→アンロック）
//          限定車パック・チューニングパック・マネーパック
// =====================================================================

// =====================================================================
// ミステリーキーの限定車
// =====================================================================
const MK_CARS = [
  ['mk_phantom', 'NOCTIS', 'PHANTOM RS', 'ミステリーキー限定・夜の街に現れる幻のハイパーGT（キー限定）', '4WD', 820, 900, 1450, 360, 7, 8200, 1, 92, 80, 94, 0, 'super', 4.6, 2.0, 1.18, '#5a2aff', 0, 'v8', 2.7, 0.42, { chest: 1, mystery: 1 }, { nose: .28, hood: .44, deck: .64, ws: .70, rf: .52, rr: .36, rb: .14 }, 'neon'],
  ['mk_kaiju', 'TOKAI', 'KAIJU GT', 'ミステリーキー限定・峠をゆらす怪物GT（キー限定）', '4WD', 760, 820, 1520, 330, 6, 8000, 1, 88, 88, 90, 0, 'gt', 4.7, 1.95, 1.3, '#2adc5a', 0, 'i6', 2.75, 0.5, { chest: 1, mystery: 1 }, null, 'tengu'],
  ['mk_zero', 'ZERO DYNAMICS', 'ZERO ONE', 'ミステリーキー限定・未来から来たウェッジ型スーパーカー（キー限定）', 'RR', 900, 850, 1300, 370, 7, 9000, 1, 94, 78, 96, 0, 'wedge', 4.5, 2.05, 1.1, '#ff3a1a', 0, 'v12', 2.65, 0.4, { chest: 1, mystery: 1 }, null, 'baylane']
];
const MK = {}; for (const r of MK_CARS) { const c = addCar(r.slice(0, 26)); Object.assign(c, { isNew: '4.7', cls: 'S', mystery: 1, mkMap: r[27] }); if (r[26]) c.prof = r[26]; MK[c.id] = c;
  for (const [n, rr] of [[1, 'C'], [2, 'U'], [3, 'R'], [5, 'E'], [10, 'L']]) mkItem({ id: `mks_${c.id}_${n}`, type: 'starcard', car: c.id, cards: n, rarity: rr, lim: 1, starcard: 1, mystery: 1, name: `${c.name} カード ×${n}`, en: `${c.name} card x${n}` });
  mkItem({ id: 'mkey_' + c.id, type: 'mkey', car: c.id, rarity: 'L', lim: 1, mystery: 1, name: `ミステリーキー「${c.name}」`, en: `Mystery Key "${c.name}"`, desc: `限定車「${c.name}」をアンロックするキー（★5にするか、スペシャルイベントで手に入る）` });
  CHESTS.push({ id: 'mkp_' + c.id, name: `${c.name} 限定車パック`, price: 0, odds: { C: 30, U: 30, R: 24, E: 12, L: 4 }, color: c.color, pool: 'mk:' + c.id, reward: 1 }); PACK_ART['mkp_' + c.id] = { a: '#1a0630', b: c.color, t: 'MYSTERY' }; PACK_TIER['mkp_' + c.id] = 4; PACK_CAR['mkp_' + c.id] = c.id; }
ITEM_TYPES.mkey = 'ミステリーキー';
{ const SIL = { mk_phantom: 'M6 58 C6 50 12 46 26 44 L62 38 C74 28 86 22 104 22 C122 22 138 30 150 38 L172 42 C180 44 182 50 182 56 L182 62 L6 62 Z', mk_kaiju: 'M6 58 C6 48 12 44 30 42 L56 36 C66 26 80 22 100 22 C120 22 134 28 144 36 L170 40 C180 42 182 48 182 54 L182 62 L6 62 Z', mk_zero: 'M4 58 L8 50 L60 40 L92 22 L128 24 L150 36 L178 40 C182 42 184 48 184 54 L184 62 L4 62 Z' };
  const _pc = packCarSvg; packCarSvg = function (car, s = 120) { const c = MK && MK[car]; if (!c) return _pc(car, s); const id = 'mks' + car + s, col = c.color;
    return `<svg class="pk-car" viewBox="0 0 186 84" width="${s}" height="${s * 84 / 186}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="${col}"/><stop offset="1" stop-color="#0a0a10"/></linearGradient></defs><ellipse cx="93" cy="75" rx="86" ry="5" fill="#000" opacity=".45"/><path d="${SIL[car]}" fill="url(#${id})"/>
      <path d="${car === 'mk_zero' ? 'M70 38 L94 25 L124 26 L140 37 Z' : 'M68 37 C80 28 92 25 104 25 C116 25 128 30 138 37 Z'}" fill="#9ad0ff" opacity=".85"/><path d="M14 56 h${car === 'mk_zero' ? 160 : 156}" stroke="${col}" stroke-width="2" opacity=".8"/>${car === 'mk_kaiju' ? '<rect x="150" y="32" width="28" height="4" rx="2" fill="#111"/><path d="M160 36 v6 M172 36 v6" stroke="#111" stroke-width="2"/>' : car === 'mk_phantom' ? '<path d="M120 46 C130 44 140 48 144 54" stroke="#e8ecf2" stroke-width="2" fill="none"/>' : '<path d="M150 38 L182 36" stroke="#111" stroke-width="3"/>'}
      <rect x="176" y="44" width="6" height="8" rx="1" fill="#ff2a2a"/><path d="M8 50 q3 -4 12 -5" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>${[40, 148].map(x => `<circle cx="${x}" cy="60" r="14" fill="#0a0a0c"/><circle cx="${x}" cy="60" r="9.5" fill="#9aa0a8"/>${Array.from({ length: 6 }, (_, k) => `<path d="M${x} 60 L${x + Math.cos(k * 1.047) * 9} ${60 + Math.sin(k * 1.047) * 9}" stroke="#3a3c42" stroke-width="2"/>`).join('')}<circle cx="${x}" cy="60" r="2.4" fill="${col}"/>`).join('')}</svg>`; }; }
CHESTS.push({ id: 'tunepack', name: 'チューニングパック', price: 0, odds: { C: 34, U: 32, R: 21, E: 10, L: 3 }, color: '#ff8a2a', pool: 'parts', reward: 1 }, { id: 'moneypack', name: 'マネーパック', price: 0, odds: { C: 36, U: 30, R: 20, E: 10, L: 4 }, color: '#ffcf3d', pool: 'money', reward: 1 });
Object.assign(PACK_ART, { tunepack: { a: '#2a1404', b: '#ff8a2a', t: 'TUNING' }, moneypack: { a: '#2a2004', b: '#ffcf3d', t: 'MONEY' } }); Object.assign(PACK_TIER, { tunepack: 2, moneypack: 2 });
COVER_SVG.moneypack = `<circle cx="38" cy="46" r="22" fill="#ffcf3d" stroke="#a87a00" stroke-width="3"/><text x="38" y="54" font-size="22" font-weight="900" text-anchor="middle" fill="#7a5400" font-family="Arial">¥</text><circle cx="66" cy="34" r="16" fill="#ffe27a" stroke="#a87a00" stroke-width="3"/><text x="66" y="40" font-size="15" font-weight="900" text-anchor="middle" fill="#7a5400" font-family="Arial">¥</text><rect x="44" y="60" width="44" height="22" rx="3" fill="#3adc7a" stroke="#1a8a3a" stroke-width="2"/>`;
COVER_SVG.tunepack = `<path d="M30 70 l26 -26 M44 20 a14 14 0 1 0 14 14 l-8 -2 -4 -4 -2 -8z" stroke="#c8ccd2" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="64" cy="62" r="16" fill="none" stroke="#ff8a2a" stroke-width="6"/><circle cx="64" cy="62" r="5" fill="#ff8a2a"/>`;
{ const _pp = packPool; packPool = function (c, rar) { if (String(c.pool).startsWith('mk:')) { const id = c.pool.slice(3), card = ITEMS.filter(i => i.mystery && i.type === 'starcard' && i.car === id && i.rarity === rar); return card.concat(card, ITEMS.filter(i => (i.id === 'cash_' + rar || i.id === 'dia_' + rar))); }
    if (c.pool === 'money') return ITEMS.filter(i => i.id === 'cash_' + rar); return _pp(c, rar).filter(i => !i.mystery); }; }
// 報酬用パックはショップに並べない
{ const _ps = UI.packStoreHTML; UI.packStoreHTML = function () { const hid = CHESTS.filter(c => c.reward); hid.forEach(c => CHESTS.splice(CHESTS.indexOf(c), 1)); try { return _ps.apply(this, arguments); } finally { CHESTS.push(...hid); } }; }
// 限定車のカード：★5まで自動で星が上がり、★5でキー
const mkKey = id => invHas('mkey_' + id), mkOwned = id => SAVE.data.cars.some(c => c.id === id);
function mkStarCheck(id) { const d = SAVE.data; d.starCards = d.starCards || {}; d.carStars = d.carStars || {}; let s = carStars(id), up = 0;
  while (s < 5 && (d.starCards[id] || 0) >= STAR_NEED[s + 1]) { d.starCards[id] -= STAR_NEED[s + 1]; s++; up++; } if (up) { d.carStars[id] = s; UI.toast(`${MK[id].name} が ★${s} になりました！`); }
  if (s >= 5 && !mkKey(id)) { grantChestItem(ITEM_BY_ID['mkey_' + id]); setTimeout(() => UI.toast(`★5達成！ ミステリーキー「${MK[id].name}」を手に入れた！`), 600); } SAVE.save(); }
{ const _g = grantChestItem; grantChestItem = function (it) { const r = _g.apply(this, arguments); if (it && it.mystery && it.type === 'starcard') try { mkStarCheck(it.car); } catch (e) { } return r; }; }
{ const _ic = itemIconSvg; itemIconSvg = function (it, size = 34) { if (it && it.type === 'mkey') return `<span class="mk-kic" style="--c:${MK[it.car].color}">${keySvg('hyper', size * 0.6)}</span>`; return _ic(it, size); }; }

// ---------------- ミステリーキーのデイリーイベント（期間は開発者メニュー「EVENT PERIODS」で変更可） ----------------
const MK_EPOCH = Date.UTC(2026, 0, 4, 15), MK_DAYS = 7;
function mkEvent() { const D = MK_DAYS * 86400000, now = typeof SRV !== 'undefined' ? SRV.now() : Date.now(), o = (typeof PERIODS !== 'undefined' && PERIODS.srv && PERIODS.srv.mk_mystery) || null; let start, end, car, k;
  if (o && o.end && now <= o.end) { start = o.start; end = o.end; k = Math.floor((start - MK_EPOCH) / D); car = MK[o.car] ? o.car : null; } else { k = Math.floor((now - MK_EPOCH) / D); start = MK_EPOCH + k * D; end = start + D; }
  car = car || MK_CARS[((k % MK_CARS.length) + MK_CARS.length) % MK_CARS.length][0]; const c = MK[car], m = MAP_BY_ID[c.mkMap] ? c.mkMap : 'neon';
  const rec = typeof recordFor === 'function' ? recordFor(m) : 120, goal = Math.round((rec || 120) * 1.18 * 10) / 10, P = 'mkp_' + car;
  return { key: 'mk@' + start + '@' + car, start, end, open: now >= start && now <= end, car, map: m, goal, tk: 2, dev: !!(o && o.end && now <= o.end),
    // 車のカード（イベント期間中の回数制限あり）
    cards: [['fin', ['レースを完走'], 'mks_' + car + '_1', 1, 3], ['win', ['レースに勝利'], 'mks_' + car + '_1', 1, 5], ['nitro', ['ニトロを5秒以上使う'], 'mks_' + car + '_2', 2, 3]],
    // パック（何回でも・1レースにつき条件ごとに1個）
    packs: [['fin', ['レースを完走'], P], ['win', ['レースに勝利'], P], ['time', [`このタイムをクリア：${fmtLap(goal)}`, 'レースを完走'], P], ['nitro', ['ニトロを5秒以上使う'], P], ['drift', ['ドリフト：3,000点以上'], 'tunepack'], ['speed', ['最高速度：200km/h 以上'], 'moneypack']] }; }
const MK_W = { get start() { return mkEvent().start; }, get end() { return mkEvent().end; } };
const mkSt = E => { const d = SAVE.data; d.mkst = d.mkst || {}; for (const k in d.mkst) if (k !== E.key && !k.endsWith('@keep')) delete d.mkst[k]; return d.mkst[E.key] = d.mkst[E.key] || { cards: {}, packs: {}, best: 0, runs: 0 }; };
const mkPackArt = (id, s = 0.32) => { const c = CHESTS.find(x => x.id === id); return c ? packPouch(c, s) : ''; };
function mkBlueprint(id, n) { const c = MK[id], k = carClass(c); return `<div class="mk-bp" style="--mc:${c.color}"><span class="mk-bpl">設計図</span><b class="mk-bpx">x${n}</b><div class="mk-bpa">${packCarSvg(id, 150)}</div><span class="mk-bpc">${k}</span><div class="mk-bpn"><small>${esc(c.maker)}</small><b>${esc(c.name)}</b></div></div>`; }
Object.assign(UI, {
  r_mystery() { $('panelTitle').textContent = 'MYSTERY KEY'; $('panelBody').classList.add('wide'); const E = mkEvent(), c = MK[E.car], S = mkSt(E), s = carStars(c.id), sc = starCards(c.id), need = s < 5 ? STAR_NEED[s + 1] : 0, key = mkKey(c.id), own = mkOwned(c.id), u = unopened(), now = Date.now();
    const cardRw = E.cards.map(([k, tags, item, n, lim], i) => { const got = S.cards[i] || 0, max = got >= lim; return `<div class="ev2-rw mkr ${max ? 'got' : ''}"><div class="mkr-l">${mkBlueprint(c.id, n)}</div><div class="ev2-rwt"><div class="mkr-tags">${tags.map(t => `<span class="ev2-task">${esc(t)}</span>`).join('')}</div><span class="ev2-cnt">${max ? '✓ 上限まで受け取り済み' : `↻ ${got}/${lim}`}</span></div></div>`; }).join('');
    const packRw = E.packs.map(([k, tags, p], i) => `<div class="ev2-rw mkr"><div class="mkr-l mkr-pk">${mkPackArt(p, 0.62)}</div><div class="ev2-rwt"><div class="mkr-tags">${tags.map(t => `<span class="ev2-task">${esc(t)}</span>`).join('')}</div><span class="ev2-cnt">↻ ${S.packs[i] || 0} <small class="mkr-inf">何回でも</small></span></div></div>`).join('');
    const packs = ['mkp_' + c.id, 'tunepack', 'moneypack'].map(id => [id, (u.packs || {})[id] || 0]).filter(x => x[1]);
    return `<div class="ev2-dt mk-dt" style="--ea:color-mix(in srgb,${c.color} 55%,#1a0a3a)"><div class="ev2-dh"><div class="ev2-dhl"><h2 class="ev2-t">MYSTERY KEY: ${esc(c.maker)} ${esc(c.name)}</h2>${E.open ? `<span class="ev2-left">残り <b>${evLeft(E.end - now)}</b></span>` : `<span class="ev2-left">${now < E.start ? '開催前' : '終了'}</span>`}<span class="ev2-cost">${tkIco(16)} ${E.tk}</span></div>${this.evTop()}</div>
      <div class="mk-prog"><span class="mk-pa">${packCarSvg(c.id, 110)}</span><div class="mk-pi"><div class="mk-stars">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= s ? 'on' : ''}">★</i>`).join('')}<span class="mk-keyi ${key ? 'on' : ''}">${keySvg('hyper', 18)}</span></div>${s < 5 ? `<div class="mk-bar"><i style="width:${Math.min(100, sc / need * 100)}%"></i><span>★${s + 1} まで カード ${sc} / ${need}（★5でキー）</span></div>` : `<div class="mk-bar done"><i style="width:100%"></i><span>★5 達成！</span></div>`}</div>
        <div class="mk-ks">${own ? '<span class="tag cur">所有中</span>' : key ? `<button class="ev2-go sm" data-a="mkUnlock" data-v="${c.id}">キーでアンロック</button>` : `<span class="ev2-free">無料でお試し！</span>`}</div></div>
      <div class="ev2-tabs"><button class="on">ソロ報酬</button></div><div class="ev2-rws mk-rws">${cardRw}${packRw}</div>
      ${packs.length ? `<div class="mk-packs">${packs.map(([id, n]) => `<div class="mk-pk">${mkPackArt(id, 0.32)}<div><b>${esc(CHESTS.find(x => x.id === id).name)}</b><small>×${n}</small></div><button class="st-buy" data-a="invPackOpen" data-v="${id}:1">開ける</button>${n > 1 ? `<button class="st-buy alt" data-a="invPackOpen" data-v="${id}:all">まとめて</button>` : ''}</div>`).join('')}</div>` : ''}
      ${Object.values(MK).filter(x => x.id !== c.id && (mkKey(x.id) || carStars(x.id) > 1)).map(x => `<div class="mk-other"><span>${packCarSvg(x.id, 70)}</span><b>${esc(x.name)}</b><small>★${carStars(x.id)} ${mkOwned(x.id) ? '・所有中' : mkKey(x.id) ? '・キーあり' : ''}</small>${!mkOwned(x.id) && mkKey(x.id) ? `<button class="btn pri" data-a="mkUnlock" data-v="${x.id}">アンロック</button>` : ''}</div>`).join('')}
      <div class="ev2-foot"><div><small>ベストタイム</small><b>${S.best ? fmtLap(S.best) : '--'}</b></div><button class="ev2-go" data-a="mkGo" ${E.open ? '' : 'disabled'}>レース <em>${tkIco(16)} ${E.tk}</em></button></div></div>`; },
  a_mkUnlock(id) { if (!MK[id] || !mkKey(id) || mkOwned(id)) return; const c = SAVE.newCar(id); c.paid = 0; SAVE.data.cars.push(c); SAVE.save(); AUDIO.buyOk && AUDIO.buyOk(); this.render(); },
  a_mkGo() { const E = mkEvent(), T = evTk(); if (!E.open) return this.toast('このイベントはいま開催していません'); if (T.n < E.tk) return this.toast(`チケットが足りません（${EV_TK_MIN}分で1枚回復）`); T.n -= E.tk; SAVE.save(); const m = MAP_BY_ID[E.map], inst = Object.assign(SAVE.newCar(E.car), { uid: 'loan_' + E.car, loan: 1 });
    this.launch({ mode: 'event', mapId: E.map, weather: 'clear', time: m.time, laps: 1, carInst: inst, mystery: E.key, evRace: { title: 'MYSTERY KEY ・ ' + m.jp, prize: 0 }, rivals: [{ name: 'ミステリーの刺客', team: 'MYSTERY KEY', car: E.car, color: '#2a2c33', skill: 0.82 }] }); }
});
// 開発者メニュー（EVENT PERIODS）にミステリーキーを追加
{ const _po = UI.pdObj; UI.pdObj = function (k) { if (k === 'mk_mystery') return { key: 'mk:mystery', name: 'ミステリーキー（デイリーイベント）', obj: MK_W }; return _po.apply(this, arguments); }; }
{ const _dp = UI.r_devPanel; UI.r_devPanel = function () { let h = _dp.call(this); if (!DEV.owner || !window.DL_FB || this.tab !== 'periods') return h; const E = mkEvent(), f = t => t ? new Date(t + 9 * 3600000).toISOString().slice(0, 16) : '', fmt = t => new Date(t).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }), k = 'mk_mystery';
    const row = `<div class="pd-it ${E.open ? 'live' : ''}"><div class="pd-h"><b>ミステリーキー（デイリーイベント）・${esc(MK[E.car].name)}</b><span class="pd-st">${E.open ? '開催中' : '開催前/終了'}</span>${E.dev ? '<span class="pd-ov">開発者が変更</span>' : '<span class="pd-ov">自動（1週間ごと）</span>'}</div><small>${fmt(E.start)} 〜 ${fmt(E.end)}</small>
      <div class="pd-f"><label>開始<input type="datetime-local" id="pdS_${k}" value="${f(E.start)}"></label><label>終了<input type="datetime-local" id="pdE_${k}" value="${f(E.end)}"></label><label>限定車<select id="mkPdCar">${Object.values(MK).map(c => `<option value="${c.id}" ${c.id === E.car ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label></div>
      <div class="btns"><button class="btn pri" data-a="mkPdSave">保存</button><button class="btn" data-a="pdExt" data-v="${k}:1">+1日</button><button class="btn" data-a="pdExt" data-v="${k}:7">+7日</button><button class="btn" data-a="pdNow" data-v="${k}:7">今から7日間</button><button class="btn" data-a="pdEnd" data-v="${k}">今すぐ終了</button>${E.dev ? `<button class="btn" data-a="pdReset" data-v="${k}">自動に戻す</button>` : ''}</div></div>`;
    return h.replace('<div class="pd-list">', '<div class="pd-list">' + row); }; }
UI.a_mkPdSave = function () { const st = this._dt('pdS_mk_mystery'), en = this._dt('pdE_mk_mystery'), car = ($('mkPdCar') || {}).value; if (!(en > st)) return this.toast('開始と終了を正しく入力してください'); this._adm(async () => { const v = { start: st, end: en, car, by: DL_FB.user.uid }; await ADM.write('admin/periods/mk_mystery', v); await ADM.log('period', 'mk_mystery ' + car); PERIODS.srv.mk_mystery = v; this.render(); }, 'ミステリーキーの期間を保存しました（全員に反映）'); };
// イベント一覧にミステリーキーのカードを追加
{ const _rd = UI.r_devent; UI.r_devent = function () { const h = _rd.apply(this, arguments); if (this.ev2) return h; const E = mkEvent(), c = MK[E.car]; if (!E.open && Date.now() > E.end) return h;
    return h.replace('<div class="ev2-row">', `<div class="ev2-row"><button class="ev2-card mk-card" data-a="mkOpen" style="--mc:${c.color}"><div class="ev2-art mk-cart">${packCarSvg(c.id, 200)}</div><span class="ev2-time"><b>${E.open ? evLeft(E.end - Date.now()) : '開催前'}</b><em>${tkIco(12)} ${E.tk}</em></span><span class="ev2-free">無料でお試し！</span><span class="mk-badge">${keySvg('hyper', 14)} MYSTERY KEY</span><span class="ev2-nm"><b>${esc(c.name)}</b><small>限定車 ・ ★${carStars(c.id)} / 5</small></span></button>`); }; }
UI.a_mkOpen = function () { this.open('mystery'); };
// スペシャルイベントでもミステリーキーが手に入る
try { const sp = EVENTS.find(e => e.id === 'sp_dkc'); if (sp && !sp.missions.some(m => m.id === 'mkey')) sp.missions.push({ id: 'mkey', name: 'ドリフトキング決定戦で3勝', key: 'evWins', goal: 3, rw: { item: 'mkey_mk_kaiju' } }); } catch (e) { }
// レース中：ニトロを使った時間
{ const GP = Game.prototype, _up = GP.update; GP.update = function (dt) { _up.call(this, dt); if (this.active && this.started && !this.finished && this.veh && this.veh.nitroOn) this._nitroT = (this._nitroT || 0) + dt; }; }

// =====================================================================
// 警察チェイスモード
// =====================================================================
const CHASES = [
  { id: 'c_city', map: 'neon', jp: '夜の都市部チェイス', n: 2, lv: 1, skill: 0.86, rw: [['money', 500000]], first: [['dia', 15]] },
  { id: 'c_bay', map: 'baylane', jp: '湾岸ハイスピードチェイス', n: 3, lv: 2, skill: 0.9, rw: [['money', 800000], ['dia', 5]], first: [['dia', 25]] },
  { id: 'c_touge', map: 'tengu', jp: '天狗峠ダウンヒルチェイス', n: 3, lv: 3, skill: 0.93, rw: [['money', 1100000], ['dia', 8]], first: [['pack', 'gold', 1]] },
  { id: 'c_metro', map: 'metrox', jp: '首都高エスケープ', n: 4, lv: 4, skill: 0.97, rw: [['money', 1600000], ['dia', 12]], first: [['dia', 60]] }];
const POLICE_CARS = ['hk_sd3', 'ka_tenma', 'hk_s3'];
let CHASE_BUILD = false;
{ const _bm = buildCarModel; buildCarModel = function (R, car, look, opts = {}) { const m = _bm.apply(this, arguments); if (!CHASE_BUILD || !look || look.livery !== 'panda' || !m || !m.shape) return m;
    try { const S = m.shape, T = S.T, y = car.H + 0.05, z = S.Z((T.rr + T.rf) / 2), gR = new GB(), gB = new GB(), gK = new GB(); gK.box(0, y - 0.03, z, 0.95, 0.05, 0.24, [0.1, 0.1, 0.11]); gR.box(0.24, y + 0.03, z, 0.42, 0.09, 0.2, [1, 0.1, 0.1]); gB.box(-0.24, y + 0.03, z, 0.42, 0.09, 0.2, [0.15, 0.35, 1]);
      const mR = Mat({ emis: 0.4, spec: 1 }), mB = Mat({ emis: 0.4, spec: 1 }); for (const [g, mt] of [[gK, Mat({ spec: 0.3 })], [gR, mR], [gB, mB]]) { const me = new Mesh(m.gl, g.a); m.meshes.push(me); m.body.addMesh(me, mt); }
      const _u = m.update; m.update = function (dt, st) { _u.call(this, dt, st); const p = (performance.now() / 260 | 0) % 2; mR.emis = p ? 3 : 0.3; mB.emis = p ? 0.3 : 3; }; m.police = 1; } catch (e) { }
    return m; }; }
const CH = { siren: 0,
  hud(g) { let el = document.getElementById('chaseHud'); if (!el) { document.body.insertAdjacentHTML('beforeend', '<div id="chaseHud"><b class="ch-t">警察から逃げきれ！</b><div class="ch-row"><span class="ch-d"></span><span class="ch-b"><i></i><em>BUSTED</em></span></div></div>'); el = document.getElementById('chaseHud'); } return el; },
  hide() { const el = document.getElementById('chaseHud'); if (el) el.remove(); } };
{ const GP = Game.prototype, _st = GP.start; GP.start = function (cfg) { CHASE_BUILD = !!(cfg && cfg.chase); try { return _st.apply(this, arguments); } finally { CHASE_BUILD = false; if (cfg && cfg.chase) { this._bust = 0; this.rivals.forEach((r, k) => { r.prog = this.startProg - 26 - k * 14; r.lat = (k % 2 ? 1.6 : -1.6); r.police = 1; }); } } }; }
{ const GP = Game.prototype, _ur = GP.updateRival; GP.updateRival = function (r, dt) { _ur.call(this, r, dt); if (!this.cfg.chase || !r.police || !this.started || this.finished) return; const v = this.veh, gap = r.prog - this.totalDist, top = r.spec.car.top / 3.6;
    let want = gap < -60 ? v.speed * 1.18 + 6 : gap < -6 ? v.speed * 1.1 + 3 : gap < 2 ? v.speed * 1.02 : v.speed * 0.85; want = Math.min(Math.max(want, 8), top * 1.05) * (this.cfg.chaseSkill || 0.9) / 0.9;
    const dv = want - r.v; r.v += clamp(dv, -12 * dt, 7 * dt); r.prog += (r.v - (r._pv || r.v)) * dt * 0.5; r._pv = r.v;
    if (gap > -25 && gap < 6) r.lat = damp(r.lat, this.loc.lat, 2.2, dt); if (r.prog > this.totalDist + 4) r.prog = this.totalDist + 4; }; }
{ const GP = Game.prototype, _up = GP.update; GP.update = function (dt) { _up.call(this, dt); if (!this.cfg || !this.cfg.chase || !this.active) return; const v = this.veh, el = CH.hud(this);
    if (!this.started || this.finished) { el.style.display = this.finished ? 'none' : ''; return; } let near = 99; for (const r of this.rivals) if (r.police) near = Math.min(near, Math.hypot(r.x - v.x, r.z - v.z));
    this._bust = near < 4.6 ? (this._bust || 0) + dt * (v.speed < 6 ? 1.6 : 1) : Math.max(0, (this._bust || 0) - dt * 0.6);
    const L = this.track.length || this.track.len || 3000, left = Math.max(0, L * (this.cfg.laps || 1) - this.totalDist);
    el.querySelector('.ch-d').textContent = `ゴールまで ${(left / 1000).toFixed(2)} km ・ 最も近いパトカー ${near < 98 ? Math.round(near) + ' m' : '--'}`; el.querySelector('.ch-b i').style.width = Math.min(100, this._bust / 2.6 * 100) + '%'; el.classList.toggle('warn', this._bust > 0.4);
    if (performance.now() - CH.siren > 520 && near < 80) { CH.siren = performance.now(); const vol = clamp(1 - near / 80, 0.05, 1) * 0.07, hi = (CH.siren / 520 | 0) % 2; AUDIO.tone(hi ? 960 : 720, 0.48, 'triangle', vol, 0, 0, AUDIO.sfxBus); }
    if (this._bust >= 2.6) { this.finish('busted'); setTimeout(() => this.msg && this.msg('BUSTED!', 'bad', 3), 30); } }; }
{ const GP = Game.prototype, _ex = GP.exit; GP.exit = function () { CH.hide(); return _ex.apply(this, arguments); }; }
Object.assign(UI, {
  r_chase() { $('panelTitle').textContent = 'POLICE CHASE'; $('panelBody').classList.add('wide'); const d = SAVE.data; d.chase = d.chase || {};
    let h = `<div class="pc-hero"><div class="pc-lights"><i></i><i></i></div><div><b>警察チェイス</b><small>パトカーに追われながらゴールを目指せ！ パトカーに近づかれた状態が続くとメーターがたまり、いっぱいになると「BUSTED（逮捕）」。ゴールまで逃げきると報酬（初回はボーナスつき）。いま乗っている車で走ります。</small></div></div><div class="pc-grid">`;
    CHASES.forEach((c, i) => { const m = MAP_BY_ID[c.map] || {}, st = d.chase[c.id] || {}; h += `<button class="pc-card" data-a="chaseGo" data-v="${c.id}" style="animation-delay:${i * 0.05}s"><canvas width="220" height="110" data-thumb="${c.map}"></canvas><span class="pc-lv">${'★'.repeat(c.lv)}${'☆'.repeat(4 - c.lv)}</span><b>${esc(c.jp)}</b><small>${esc(m.jp || '')} ・ パトカー ${c.n}台</small><div class="pc-rw">${c.rw.map(r => `<span>${rwArt(r, 18)} ${esc(rwLabel(r))}</span>`).join('')}</div>${st.esc ? `<em class="pc-ok">逃げきり ${st.esc}回</em>` : `<em class="pc-first">初回ボーナス：${c.first.map(rwLabel).join('・')}</em>`}${st.bust ? `<em class="pc-bust">逮捕 ${st.bust}回</em>` : ''}</button>`; });
    setTimeout(() => this.drawThumbs && this.drawThumbs(), 0); return h + '</div>'; },
  a_chaseGo(id) { const c = CHASES.find(x => x.id === id), m = MAP_BY_ID[c.map]; if (!c || !m) return;
    this.launch({ mode: 'event', mapId: c.map, weather: 'clear', time: 'night', laps: 1, carInst: SAVE.cur(), chase: c.id, chaseSkill: c.skill, evRace: { title: '警察チェイス ・ ' + m.jp, prize: 0 }, rivals: Array.from({ length: c.n }, (_, k) => ({ name: ['パトカー 1号', 'パトカー 2号', '覆面パトカー', '高速隊'][k], team: 'POLICE', car: POLICE_CARS[k % POLICE_CARS.length], color: '#111114', livery: 'panda', skill: c.skill })) }); }
});

// ---------------- リザルト：チェイス・ミステリーキー ----------------
{ const _sr = UI.showResults; UI.showResults = function (res) { const g = this.game, cfg = res.cfg || {}; if (cfg.chase) res.win = res.reason === 'goal';
    const ext = { nitro: (g && g._nitroT) || 0, drift: (g && g.drift && (g.drift.score || g.drift.total)) || 0 }; _sr.call(this, res); const box = document.querySelector('#overlay .res-modal .btns'), note = (t, ok) => box && box.insertAdjacentHTML('beforebegin', `<div class="dv-res ${ok ? 'ok' : ''}">${t}</div>`), d = SAVE.data;
    if (cfg.chase) { const c = CHASES.find(x => x.id === cfg.chase); d.chase = d.chase || {}; const st = d.chase[c.id] = d.chase[c.id] || {}; if (res.win) { const first = !st.esc; st.esc = (st.esc || 0) + 1; const L = c.rw.concat(first ? c.first : []); L.forEach(grantRw); note(`🚓 逃げきった！ 報酬：${L.map(rwLabel).join(' ＋ ')}${first ? '（初回ボーナスつき）' : ''}`, 1); } else { st.bust = (st.bust || 0) + 1; note('🚨 BUSTED！ パトカーにつかまった… もう一度挑戦しよう'); } SAVE.save(); }
    if (cfg.mystery) { const E = mkEvent(); if (E.key !== cfg.mystery) { note('MYSTERY KEY：イベント期間が終わっていたため報酬はありません'); return; } const S = mkSt(E), u = unopened(), fin = res.reason !== 'crash' && res.reason !== 'stuck', lap = res.laps && res.laps.length ? Math.min(...res.laps.map(l => l.t)) : 1e9;
      const ok = { fin, win: !!res.win && fin, time: fin && lap <= E.goal, nitro: ext.nitro >= 5, drift: ext.drift >= 3000, speed: (res.maxSpeed || 0) >= 200 }, got = [], cardsGot = []; S.runs++; if (fin && lap < 1e9 && (!S.best || lap < S.best)) S.best = lap;
      E.cards.forEach(([k, tags, item, n, lim], i) => { if (ok[k] && (S.cards[i] || 0) < lim) { S.cards[i] = (S.cards[i] || 0) + 1; grantChestItem(ITEM_BY_ID[item]); cardsGot.push(n); } });
      E.packs.forEach(([k, tags, p], i) => { if (ok[k]) { u.packs[p] = (u.packs[p] || 0) + 1; S.packs[i] = (S.packs[i] || 0) + 1; got.push([tags[0], p]); } }); SAVE.save();
      note(`MYSTERY KEY：${cardsGot.length ? `${MK[E.car].name} カード ×${cardsGot.reduce((a, b) => a + b, 0)} ＋ ` : ''}${got.length ? `パック ${got.length}個 ゲット！` : 'パックの条件を満たせませんでした'}${got.length ? `<div class="mk-got">${got.map(([t, p]) => `<span>${mkPackArt(p, 0.22)}<small>${esc(t)}</small></span>`).join('')}</div>` : ''}<small class="mk-note">ニトロ ${ext.nitro.toFixed(1)}秒 ・ ドリフト ${Math.round(ext.drift).toLocaleString()}点 ・ 最高 ${Math.round(res.maxSpeed || 0)}km/h</small>`, got.length + cardsGot.length > 0); } }; }
{ const _rn = UI.a_resNext; UI.a_resNext = function () { const res = this.lastRes, c = res && res.cfg; if (c && (c.mystery || c.chase)) { $('overlay').classList.remove('res-dim'); this.closeModal(); this.paused = false; AUDIO.applyVol(); this.game.exit(); this.goMenu(); return this.open(c.mystery ? 'mystery' : 'chase'); } return _rn.call(this); }; }

// =====================================================================
// 中古車マーケット（Firebase：market/）
// =====================================================================
const MKT = { list: {}, off: null, FEE: 0.05, MAX: 5, busy: false,
  start() { if (this.off || !SOC.on || !SOC.db) return; const ref = SOC.db().ref('market').orderByChild('t').limitToLast(120), cb = s => { this.list = s.val() || {}; this.collect(); if (UI.screen === 'market') UI.render(); }; ref.on('value', cb, () => { }); this.off = () => ref.off('value', cb); },
  mine() { return Object.entries(this.list).filter(([id, x]) => x.s === SOC.uid); },
  // 売れた出品のお金を受け取る
  async collect() { const d = SAVE.data; d.mkt = d.mkt || { esc: {}, hist: [] }; for (const [id, x] of this.mine()) { if (!x.b || String(x.b).startsWith('cancel_') || (d.mkt.done && d.mkt.done[id])) continue; d.mkt.done = d.mkt.done || {}; d.mkt.done[id] = 1; const get = Math.floor(x.p * (1 - this.FEE)); SAVE.addMoney(get); delete d.mkt.esc[id];
      d.mkt.hist.unshift({ k: 'sold', car: x.car.id, p: x.p, get, who: x.bn || '', t: Date.now() }); d.mkt.hist.length = Math.min(d.mkt.hist.length, 40); SAVE.save(); UI.toast(`マーケット：${(CAR_BY_ID[x.car.id] || {}).name} が売れました！ ${yen(get)}`); try { await SOC.db().ref('market/' + id).remove(); } catch (e) { } } }
};
{ const _ss = SOC.start.bind(SOC); SOC.start = async function () { const r = await _ss.apply(this, arguments); try { if (r) MKT.start(); } catch (e) { } return r; }; }
Object.assign(UI, {
  r_market() { $('panelTitle').textContent = 'USED CAR MARKET'; $('panelBody').classList.add('wide'); const tab = this.mkTab || 'buy', d = SAVE.data; d.mkt = d.mkt || { esc: {}, hist: [] };
    const tabs = `<div class="ev2-tabs mk-tabs">${[['buy', '買う'], ['sell', '売る'], ['hist', '取引の記録']].map(([k, l]) => `<button class="${k === tab ? 'on' : ''}" data-a="mkTab" data-v="${k}">${l}</button>`).join('')}</div>`;
    const hero = `<div class="mkt-hero"><div class="mkt-ic">${ICO('carSide', '#ffcf3d', 40)}</div><div><b>中古車マーケット</b><small>ほかのプレイヤーが出品した車を買ったり、自分の車を売ったりできます。売れると代金から手数料 ${Math.round(MKT.FEE * 100)}% を引いた金額が入ります。チューニングと見た目もそのまま引き継がれます。</small></div></div>`;
    if (!SOC.on) return hero + `<div class="note">マーケットを使うにはGoogleでログインしてください（メニュー上の「Googleでログイン」）。</div><button class="btn pri" data-a="mktLogin">ログインする</button>`;
    if (tab === 'buy') { const L = Object.entries(MKT.list).filter(([id, x]) => !x.b && x.s !== SOC.uid && CAR_BY_ID[x.car && x.car.id]).sort((a, b) => b[1].t - a[1].t);
      return hero + tabs + (L.length ? `<div class="ct-grid">${L.map(([id, x]) => { const cd = CAR_BY_ID[x.car.id]; return carTile({ car: cd, spec: computeSpec(cd, x.car.tune || defaultTune(cd)), own: 0, act: 'mktView', v: id, tag: yen(x.p), tagCls: 'price', note: `出品：<span class="noi18n">${esc(x.sn || '?')}</span>` }); }).join('')}</div>` : `<div class="note">いまは出品されている車がありません。あとでまたのぞいてみよう。</div>`); }
    if (tab === 'sell') { const mine = MKT.mine(), can = d.cars.filter(c => c.uid !== d.current && !c.loan && CAR_BY_ID[c.id]);
      let h = hero + tabs + `<div class="h3">出品中（${mine.length} / ${MKT.MAX}）</div>` + (mine.length ? `<div class="mkt-mine">${mine.map(([id, x]) => `<div class="mkt-row"><span>${packCarSvg(x.car.id, 90)}</span><div><b>${esc((CAR_BY_ID[x.car.id] || {}).name || '?')}</b><small>${yen(x.p)} ・ ${x.b ? '売れました（受け取り中）' : '出品中'}</small></div>${x.b ? '' : `<button class="btn" data-a="mktCancel" data-v="${id}">出品をやめる</button>`}</div>`).join('')}</div>` : `<div class="note">出品中の車はありません。</div>`);
      h += `<div class="h3">出品する車を選ぶ</div><div class="note">いま使っている車は出品できません。出品中の車はガレージからいったん預けられ、出品をやめると戻ります。</div>`;
      return h + (can.length ? `<div class="ct-grid">${can.map(c => carTile({ car: CAR_BY_ID[c.id], spec: this.instSpec(c), own: 1, act: 'mktSell', v: c.uid, tag: '', note: '出品する' })).join('')}</div>` : `<div class="note">出品できる車がありません（2台以上持っていると、使っていない車を出品できます）。</div>`); }
    const H = d.mkt.hist || []; return hero + tabs + (H.length ? `<div class="mkt-mine">${H.map(x => `<div class="mkt-row"><span>${packCarSvg(x.car, 70)}</span><div><b>${x.k === 'sold' ? '売れた' : '買った'}：${esc((CAR_BY_ID[x.car] || {}).name || '?')}</b><small>${yen(x.p)}${x.k === 'sold' ? `（受け取り ${yen(x.get)}）` : ''} ・ ${new Date(x.t).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</small></div></div>`).join('')}</div>` : '<div class="note">まだ取引の記録はありません。</div>'); },
  a_mkTab(t) { this.mkTab = t; this.render(); },
  a_mktLogin() { this.open('account'); },
  a_mktSell(uid) { const c = SAVE.data.cars.find(x => x.uid === uid); if (!c) return; const cd = CAR_BY_ID[c.id], sug = Math.max(10000, Math.round((cd.price || 3000000) * 0.7 / 10000) * 10000); this._mkSell = uid;
    this.modal(`<h2>出品する</h2><div class="mkt-sm">${packCarSvg(c.id, 160)}<b>${esc(cd.name)}</b></div><div class="note">価格を決めてください（¥10,000〜¥999,999,999）。売れると ${Math.round((1 - MKT.FEE) * 100)}% が入ります。</div><div class="row"><label>価格</label><input id="mktP" type="number" min="10000" max="999999999" step="10000" value="${sug}"></div><div class="btns"><button class="btn" data-a="closeModal">やめる</button><button class="btn pri" data-a="mktSellGo">出品する</button></div>`); },
  async a_mktSellGo() { const d = SAVE.data, uid = this._mkSell, c = d.cars.find(x => x.uid === uid), p = Math.round(+($('mktP') || {}).value || 0); if (!c || MKT.busy) return; if (!(p >= 10000 && p <= 999999999)) return this.toast('価格は ¥10,000〜¥999,999,999 で入力してください'); if (MKT.mine().length >= MKT.MAX) return this.toast(`出品は${MKT.MAX}台までです`); if (uid === d.current) return this.toast('使っている車は出品できません');
    MKT.busy = true; try { const ref = SOC.db().ref('market').push(); const car = { id: c.id, tune: c.tune || null, look: c.look || null }; await ref.set({ s: SOC.uid, sn: SOC.name || 'プレイヤー', car: JSON.parse(JSON.stringify(car)), p, t: Date.now() });
      d.mkt = d.mkt || { esc: {}, hist: [] }; d.mkt.esc[ref.key] = c; d.cars.splice(d.cars.indexOf(c), 1); SAVE.save(); this.closeModal(); AUDIO.buyOk && AUDIO.buyOk(); this.toast('出品しました！'); } catch (e) { this.toast('出品できませんでした（通信を確認してください）'); } finally { MKT.busy = false; } this.render(); },
  async a_mktCancel(id) { const d = SAVE.data, x = MKT.list[id]; if (!x || x.b || MKT.busy) return; MKT.busy = true; try { const r = await SOC.db().ref('market/' + id + '/b').transaction(cur => cur ? undefined : 'cancel_' + SOC.uid); if (!r.committed) { this.toast('すでに売れていました'); return; }
      await SOC.db().ref('market/' + id).remove(); const c = d.mkt.esc[id] || Object.assign(SAVE.newCar(x.car.id), { tune: x.car.tune || undefined, look: x.car.look || undefined }); delete d.mkt.esc[id]; d.cars.push(c); SAVE.save(); this.toast('出品をやめました。車はガレージに戻りました'); } catch (e) { this.toast('通信エラー'); } finally { MKT.busy = false; } this.render(); },
  a_mktView(id) { const x = MKT.list[id]; if (!x) return; const cd = CAR_BY_ID[x.car.id]; this._mkBuy = id; this.show.setCar({ id: x.car.id, tune: x.car.tune || defaultTune(cd), look: x.car.look || defaultLook(cd) });
    this.modal(`<h2>${esc(cd.name)}</h2><div class="mkt-sm">${packCarSvg(cd.id, 180)}</div><div class="note">${esc(cd.maker)} ・ ${clsBadge(cd)} ・ 出品者：<span class="noi18n">${esc(x.sn || '?')}</span><br>チューニングと見た目もそのまま手に入ります。</div><div class="mkt-price">${yen(x.p)}</div><div class="btns"><button class="btn" data-a="closeModal">やめる</button><button class="btn pri" data-a="mktBuy">購入する</button></div>`); },
  async a_mktBuy() { const id = this._mkBuy, x = MKT.list[id], d = SAVE.data; if (!x || MKT.busy) return; if (x.s === SOC.uid) return this.toast('自分の車は買えません'); if ((d.money || 0) < x.p) return this.toast('お金が足りません');
    MKT.busy = true; try { const r = await SOC.db().ref('market/' + id + '/b').transaction(cur => cur ? undefined : SOC.uid); if (!r.committed) { this.closeModal(); this.toast('ほかの人に買われてしまいました'); return; }
      try { await SOC.db().ref('market/' + id).update({ bn: SOC.name || 'プレイヤー', bt: Date.now() }); } catch (e) { }
      if (!SAVE.spend(x.p)) { this.toast('お金が足りません'); return; } const cd = CAR_BY_ID[x.car.id], c = SAVE.newCar(x.car.id); if (x.car.tune) c.tune = Object.assign(defaultTune(cd), x.car.tune); if (x.car.look) c.look = Object.assign(defaultLook(cd), x.car.look); c.paid = x.p; d.cars.push(c);
      d.mkt = d.mkt || { esc: {}, hist: [] }; d.mkt.hist.unshift({ k: 'bought', car: x.car.id, p: x.p, t: Date.now() }); d.mkt.hist.length = Math.min(d.mkt.hist.length, 40); SAVE.save(); this.closeModal(); this.refreshTop(); } catch (e) { this.toast('購入できませんでした（通信を確認してください）'); } finally { MKT.busy = false; } this.render(); }
});

// ---------------- メインメニューに追加 ----------------
Object.assign(NM_META, { market: ['車を売り買い', '#ffb400', '中古車市場'], chase: ['パトカーから逃げろ', '#ff4a4a'], mystery: ['限定車のキーを集める', '#9a5aff'] });
const nmIco = { market: `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M3 15l2-5h14l2 5v3H3z" fill="none" stroke="#ffb400" stroke-width="2"/><circle cx="7.5" cy="18" r="2" fill="#ffb400"/><circle cx="16.5" cy="18" r="2" fill="#ffb400"/><path d="M14 3h6v6" stroke="#ffb400" stroke-width="2" fill="none"/><path d="M20 3l-7 7" stroke="#ffb400" stroke-width="2"/></svg>`,
  chase: `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M3 16l2-5h14l2 5v3H3z" fill="#1a1a1e" stroke="#fff" stroke-width="1.5"/><rect x="7" y="7" width="4" height="3" fill="#ff3a3a"/><rect x="13" y="7" width="4" height="3" fill="#3a6aff"/><circle cx="7.5" cy="19" r="1.8" fill="#fff"/><circle cx="16.5" cy="19" r="1.8" fill="#fff"/></svg>`,
  mystery: `<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="8" cy="15" r="5" fill="none" stroke="#b07aff" stroke-width="2.4"/><path d="M11.5 11.5L21 2M17 6l2 2M15 8l2 2" stroke="#b07aff" stroke-width="2.4" stroke-linecap="round"/><text x="8" y="18" font-size="7" font-weight="900" text-anchor="middle" fill="#fff" font-family="Arial">?</text></svg>` };
{ const _mi = UI.menuItems; UI.menuItems = function () { _mi.apply(this, arguments); const el = $('menuList'); if (!el) return; const P = el.querySelectorAll('.nm-pills'), add = (box, k, jp) => { if (box && !box.querySelector(`[data-m="${k}"]`)) box.insertAdjacentHTML('beforeend', `<button class="nm-pill" data-m="${k}">${nmIco[k]}<span>${jp}</span></button>`); };
    add(P[0], 'market', '中古車マーケット'); add(P[1], 'chase', '警察チェイス'); add(P[1], 'mystery', 'ミステリーキー'); nmTiles(); }; }
for (const it of ITEMS) ITEM_BY_ID[it.id] = it;
window.__DLX = Object.assign(window.__DLX || {}, { MK, mkEvent, mkStarCheck, MKT, CHASES });
