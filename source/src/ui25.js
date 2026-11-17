// =====================================================================
// ui25.js — v2.5 の画面：ストーリー（シーズン）・ドラッグ・実績・コード・ガレージレベル・
//            チュートリアル・フレンド・クラン（チャット）・トレード
// =====================================================================
Object.assign(ICO_PATHS, {
  users: `<circle cx="17" cy="16" r="7" fill="currentColor"/><path d="M4 40c0-8 6-13 13-13s13 5 13 13z" fill="currentColor"/><circle cx="33" cy="14" r="6" fill="currentColor" opacity=".7"/><path d="M30 26c7 0 14 4 14 12H33" fill="currentColor" opacity=".7"/>`,
  shield: `<path d="M24 4l16 6v12c0 11-7 18-16 22C15 40 8 33 8 22V10z" fill="currentColor"/><path d="M24 12l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L15 19l6-1z" fill="#1a1c22"/>`,
  chat: `<path d="M6 8h36v24H20l-9 8v-8H6z" fill="currentColor"/><circle cx="16" cy="20" r="2.5" fill="#1a1c22"/><circle cx="24" cy="20" r="2.5" fill="#1a1c22"/><circle cx="32" cy="20" r="2.5" fill="#1a1c22"/>`,
  trade: `<path d="M8 16h26l-6-6M40 32H14l6 6" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  code: `<rect x="5" y="12" width="38" height="24" rx="4" fill="currentColor"/><path d="M12 20h4M12 28h4M20 20h16M20 28h10" stroke="#1a1c22" stroke-width="3" stroke-linecap="round"/>`,
  book: `<path d="M6 8c7-2 13-1 18 3v30c-5-4-11-5-18-3z" fill="currentColor"/><path d="M42 8c-7-2-13-1-18 3v30c5-4 11-5 18-3z" fill="currentColor" opacity=".7"/>`,
  medal2: `<path d="M14 4h8l4 12h-8zM34 4h-8l-4 12h8z" fill="currentColor" opacity=".7"/><circle cx="24" cy="30" r="13" fill="currentColor"/><path d="M24 22l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="#1a1c22"/>`,
  flag2: `<path d="M6 40h36" stroke="currentColor" stroke-width="3"/><rect x="8" y="28" width="12" height="8" rx="2" fill="currentColor"/><rect x="26" y="20" width="14" height="16" rx="2" fill="currentColor" opacity=".8"/><path d="M8 24l10-12 6 6 8-10" fill="none" stroke="currentColor" stroke-width="3"/>`,
  drift: `<path d="M8 36c8-2 12-10 20-12s10 2 14-2" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><rect x="26" y="8" width="16" height="10" rx="3" transform="rotate(-25 34 13)" fill="currentColor"/><circle cx="10" cy="38" r="3" fill="currentColor" opacity=".5"/><circle cx="16" cy="34" r="2" fill="currentColor" opacity=".4"/>`,
  glv: `<path d="M6 22L24 8l18 14v18H6z" fill="currentColor"/><rect x="14" y="26" width="20" height="14" fill="#1a1c22"/><path d="M17 30h14M17 34h14" stroke="currentColor" stroke-width="2"/>`
});
const isTouchDev = () => ('ontouchstart' in window) || (window.matchMedia && matchMedia('(pointer:coarse)').matches);

// ---- 報酬の付与（ストーリーのレベル報酬・コード・ガレージレベル・実績で共通） ----
function grantReward(r) {
  const d = SAVE.data, out = [];
  if (r.money) { SAVE.addMoney(r.money); out.push(yen(r.money)); }
  if (r.dia) { d.diamonds = (d.diamonds || 0) + r.dia; out.push('ダイヤ ' + r.dia); }
  if (r.cons) for (const [id, n] of Object.entries(r.cons)) { giveCons(id, n); out.push((CONS_BY_ID[id] ? CONS_BY_ID[id].name : id) + ' ×' + n); }
  if (r.chest) { const c = CHESTS.find(x => x.id === r.chest); if (c) { const it = rollChest(c); const g = grantChestItem(it); out.push(c.name + '：' + it.name + (g.isNew ? '' : '（重複→' + yen(g.refund) + '）')); } }
  if (r.item && ITEM_BY_ID[r.item]) { const it = ITEM_BY_ID[r.item], g = grantChestItem(it); out.push(it.name + (g.isNew ? '' : '（重複→' + yen(g.refund) + '）')); }
  if (r.car && CAR_BY_ID[r.car]) { const c = SAVE.newCar(r.car); c.paid = 0; d.cars.push(c); out.push(CAR_BY_ID[r.car].name + '（ガレージに追加）'); }
  if (r.randItem) { const pool = ITEMS.filter(i => !i.lim && i.type !== 'car'); const it = pool[Math.floor(Math.random() * pool.length)]; const g = grantChestItem(it); out.push(it.name + (g.isNew ? '' : '（重複→' + yen(g.refund) + '）')); }
  SAVE.save(); UI.refreshTop(); return out.join('、');
}
function grantBonus(b) { return grantReward(b.t === 'dia' ? { dia: b.v } : b.t === 'item' ? { item: b.v } : b.t === 'chest' ? { chest: b.v } : b.t === 'car' ? { car: b.v } : { money: b.v }); }
function bonusLabel(b) { if (!b) return ''; if (b.t === 'dia') return 'ダイヤ ' + b.v; if (b.t === 'chest') { const c = CHESTS.find(x => x.id === b.v); return (c ? c.name : 'チェスト') + 'の中身 1つ'; } if (b.t === 'item') return ITEM_BY_ID[b.v] ? ITEM_BY_ID[b.v].name : 'アイテム'; if (b.t === 'car') return b.name || (CAR_BY_ID[b.v] ? CAR_BY_ID[b.v].name : '車'); return yen(b.v); }
function rewardLabel(r) { const a = []; if (r.money) a.push(yen(r.money)); if (r.dia) a.push(ICO('gem', '#9ad8ff', 12) + ' ' + r.dia); if (r.chest) { const c = CHESTS.find(x => x.id === r.chest); a.push(c ? c.name : 'チェスト'); } if (r.cons) a.push(Object.entries(r.cons).map(([id, n]) => (CONS_BY_ID[id] ? CONS_BY_ID[id].name : id) + '×' + n).join('・')); if (r.randItem) a.push('ランダムなアイテム'); if (r.item && ITEM_BY_ID[r.item]) a.push(ITEM_BY_ID[r.item].name); return a.join(' ＋ '); }

// ---- 実績 ----
function achProgress(a, d) { if (!a.get) return d.ach[a.id] ? [1, 1] : [0, 1]; const cur = Math.max(0, +a.get(d) || 0); return [Math.min(cur, a.goal), a.goal]; }
function achDone(a, d) { const [c, g] = achProgress(a, d); return c >= g || !!d.ach[a.id]; }
function achNewlyDone() { const d = SAVE.data; d.achDone = d.achDone || {}; const out = []; for (const a of ACHIEVEMENTS) if (!d.achDone[a.id] && achDone(a, d)) { d.achDone[a.id] = Date.now(); d.ach[a.id] = d.ach[a.id] || Date.now(); out.push(a); } return out; }
function achClaimable() { try { const d = SAVE.data; d.achClaim = d.achClaim || {}; return ACHIEVEMENTS.some(a => achDone(a, d) && !d.achClaim[a.id]); } catch (e) { return false; } }

// ---- フレンドタスク用の週間記録 ----
function fwkAdd(dist, drift, win) { const d = SAVE.data, w = weekKeyLocal(); if (!d.fwk || d.fwk.w !== w) d.fwk = { w, km: 0, drift: 0, wins: 0 }; d.fwk.km += Math.max(0, Math.min(50000, dist || 0)); d.fwk.drift += Math.max(0, drift || 0); d.fwk.wins += win ? 1 : 0; }
const FTASKS = [{ id: 'km', name: '2人で合計 50km 走る', goal: 50000, unit: m => (m / 1000).toFixed(1) + ' km', rw: { dia: 15, money: 300000 } }, { id: 'drift', name: '2人で合計 200,000 ドリフトポイント', goal: 200000, unit: v => Math.round(v).toLocaleString() + ' pt', rw: { dia: 20 } }, { id: 'wins', name: '2人で合計 10勝', goal: 10, unit: v => v + ' 勝', rw: { dia: 15, cons: { energy: 1 } } }];

// ---- ソーシャル（Firebase 版のみ） ----
const SOC = {
  on: false, uid: null, name: null, friends: {}, reqs: {}, clanId: null, clan: null, chat: [], inv: {}, online: {}, offs: [], trade: null, tradeOff: null,
  avail() { return !!(window.DL_FB && DL_FB.isGoogle() && DL_FB.profile && DL_FB.profile.name); },
  db() { return DL_FB.db(); },
  async start() {
    if (!this.avail()) return false; await DL_FB.ready(); const uid = DL_FB.user.uid; if (this.on && this.uid === uid) return true;
    this.stop(); this.on = true; this.uid = uid; this.name = DL_FB.profile.name; const db = this.db();
    const L = (path, fn) => { const r = db.ref(path); const cb = s => { try { fn(s.val()); } catch (e) { console.warn(e); } }; r.on('value', cb, () => { }); this.offs.push(() => r.off('value', cb)); };
    L('friends/' + uid, v => { this.friends = v || {}; SAVE.data.stats.friends = Object.keys(this.friends).length; this.changed('friends'); });
    L('freq/' + uid, v => { this.reqs = v || {}; this.changed('friends'); });
    L('tradeInv/' + uid, v => { this.inv = v || {}; this.changed('friends'); });
    L('clanOf/' + uid, v => { if (v !== this.clanId) this.watchClan(v || null); });
    L('online', v => { this.online = v || {}; this.changed('online'); });
    try { db.ref('profiles/' + uid).update({ gl: garageLevel(SAVE.data).lv, cars: SAVE.data.cars.length, t: Date.now() }); } catch (e) { }
    return true;
  },
  stop() { this.offs.forEach(f => f()); this.offs = []; if (this.clanOffs) this.clanOffs.forEach(f => f()); this.clanOffs = []; this.on = false; },
  watchClan(cid) {
    if (this.clanOffs) this.clanOffs.forEach(f => f()); this.clanOffs = []; this.clanId = cid; this.clan = null; this.chat = []; if (!cid) { this.changed('clan'); return; }
    const db = this.db(); const r1 = db.ref('clans/' + cid), r2 = db.ref('clanChat/' + cid).limitToLast(60);
    const c1 = s => { this.clan = s.val(); if (!this.clan) { db.ref('clanOf/' + this.uid).remove().catch(() => { }); } else SAVE.data.stats.clanJoined = 1; this.changed('clan'); };
    const c2 = s => { const a = []; s.forEach(x => { a.push(x.val()); }); this.chat = a; this.changed('chat'); };
    r1.on('value', c1, () => { }); r2.on('value', c2, () => { }); this.clanOffs.push(() => r1.off('value', c1), () => r2.off('value', c2));
  },
  changed(what) {
    try {
      const nReq = Object.keys(this.reqs).length + Object.keys(this.inv).filter(k => this.inv[k] && this.inv[k].from !== this.uid).length;
      const bf = document.getElementById('btnFriends'); if (bf) bf.dataset.badge = nReq ? String(nReq) : '';
      if (what === 'chat' && UI.screen === 'clan') { const el = document.getElementById('chatLog'); if (el) { el.innerHTML = UI.chatHTML(); el.scrollTop = el.scrollHeight; return; } }
      if ((what === 'friends' || what === 'online') && UI.screen === 'friends') UI.render();
      if ((what === 'clan' || what === 'online') && UI.screen === 'clan') UI.render();
    } catch (e) { }
  },
  isOnline(uid) { return !!this.online[uid]; },
  pairKey(a, b) { return [a, b].sort().join('_'); }
};

Object.assign(UI, {
  // ---------------- トップバーのボタン ----------------
  initTopIcons() {
    const set = (id, ic, col, fn) => { const b = document.getElementById(id); if (!b || b._init) return; b._init = 1; b.innerHTML = ICO(ic, col, 22); b.onclick = () => { AUDIO.click(); fn(); }; };
    set('btnGlv', 'glv', '#ffcf3d', () => this.open('glv')); set('btnFriends', 'users', '#5ad1ff', () => this.open('friends')); set('btnClan', 'shield', '#2fdc7a', () => this.open('clan'));
    const g = document.getElementById('btnGlv'); if (g) g.dataset.lv = 'Lv.' + garageLevel(SAVE.data).lv;
  },
  socialPoll() { this.initTopIcons(); if (window.DL_FB) SOC.start().catch(() => { }); },
  needLogin(what) {
    if (!window.DL_FB) return `<div class="empty-card">${ICO('globe', '#5ad1ff', 46)}<b>${what}はオンライン版（GitHub 版）で使えます</b><small>この表示ではサーバーにつながらないため利用できません。</small></div>`;
    return `<div class="empty-card">${ICO('users', '#5ad1ff', 46)}<b>${what}を使うには Google ログインとユーザーネームが必要です</b><small>ログインするとフレンド・クラン・トレードが使えるようになります。</small><button class="btn pri" data-a="goAccount">ログイン / ユーザーネーム設定へ</button></div>`;
  },
  a_goAccount() { this.open('account'); },

  // ---------------- ストーリー（シーズン選択つき・モダンUI） ----------------
  r_story() {
    $('panelTitle').textContent = 'STORY MODE'; const cl = SAVE.data.story.cleared; $('panelBody').classList.add('wide');
    const seasonDone = n => STORY.filter(s => s.season === n).every(s => cl.includes(s.id)), seasonOpen = n => n === 1 || seasonDone(n - 1);
    if (!this.season) { this.season = 1; for (const n of [2, 3]) if (seasonOpen(n)) this.season = n; }
    const list = STORY.filter(s => s.season === this.season);
    const isOpen = s => seasonOpen(s.season) && (s.lv === 1 || cl.includes(list[s.lv - 2] && list[s.lv - 2].id));
    if (!this.sel || !list.some(s => s.id === this.sel)) { const nx = list.find(s => !cl.includes(s.id) && isOpen(s)); this.sel = (nx || list[0]).id; }
    const ch = STORY.find(s => s.id === this.sel), rc = CAR_BY_ID[ch.rival.car], m = MAP_BY_ID[ch.map];
    this.show.setCar({ id: rc.id, tune: defaultTune(rc), look: Object.assign(defaultLook(rc), { color: ch.rival.color }) });
    let h = `<div class="ss-tabs">${STORY_SEASONS.map(S => { const op = seasonOpen(S.n), n = STORY.filter(s => s.season === S.n), c = n.filter(s => cl.includes(s.id)).length; return `<button class="ss-tab s${S.n} ${this.season === S.n ? 'on' : ''} ${op ? '' : 'lock'}" data-a="${op ? 'season' : 'noop'}" data-v="${S.n}"><small>SEASON ${S.n}</small><b>${S.title}</b><span class="ss-bar"><i style="width:${c / n.length * 100}%"></i></span><em>${op ? `${c} / ${n.length} クリア` : ICO('lock', '#aaa', 12) + ' 前のシーズンをクリア'}</em></button>`; }).join('')}</div>`;
    h += `<div class="ss-path">${list.map(s => { const done = cl.includes(s.id), op = isOpen(s); return `<button class="ss-node ${s.id === this.sel ? 'sel' : ''} ${done ? 'done' : ''} ${op ? '' : 'lock'} ${s.boss ? 'boss' : ''}" data-a="selStory" data-v="${s.id}"><b>${s.lv}</b>${s.bonus ? `<i class="ss-gift">${ICO('gift', '#ffcf3d', 14)}</i>` : ''}${done ? `<i class="ss-ok">✓</i>` : ''}${!op ? `<i class="ss-lk">${ICO('lock', '#888', 12)}</i>` : ''}</button>`; }).join('')}</div>`;
    const op = isOpen(ch), done = cl.includes(ch.id);
    h += `<div class="ss-detail"><div class="ss-dh"><small>SEASON ${ch.season} ・ LEVEL ${ch.lv}${ch.boss ? ' ・ BOSS' : ''}</small><b>${esc(ch.title.replace(/^S\d-\d+　/, ''))}</b></div>
      <div class="ss-grid"><div><span>ライバル</span><b>${esc(ch.rival.name)}</b><small>${esc(ch.rival.team)}</small></div><div><span>ライバル車両</span><b>${esc(rc.name)}</b><small>強さ ${'★'.repeat(Math.round(ch.rival.skill * 10 - 5))}</small></div><div><span>コース</span><b>${esc(m.jp)}</b><small>${{ day: '昼', evening: '夕方', night: '夜' }[m.time]} ・ ${{ clear: '晴れ', rain: '雨', snow: '雪', fog: '霧' }[m.weather] || ''}</small></div><div><span>クリア報酬</span><b>${yen(ch.reward)}</b><small>${ch.xp} XP${ch.season > 1 ? ' ＋ ダイヤ 5' : ''}</small></div></div>
      ${ch.bonus ? `<div class="ss-bonus ${done ? 'got' : ''}">${ICO('gift', '#ffcf3d', 26)}<div><small>レベル報酬（初回クリア時）</small><b>${esc(bonusLabel(ch.bonus))}</b></div>${done ? '<em>受取済み</em>' : ''}</div>` : ''}
      <div class="note">使用車両: <b>${CAR_BY_ID[SAVE.cur().id].name}</b>（ガレージで変更）</div>
      <button class="btn pri big" data-a="storyGo" ${op ? '' : 'disabled'}>${op ? (done ? 'もう一度バトル ▶' : 'バトル開始 ▶') : ICO('lock', '#111', 14) + ' 前のレベルをクリア'}</button></div>`;
    this.stageInfo(`<div class="car-name">${rc.name}</div><div class="car-sub">${esc(ch.rival.name)} の愛車</div>`);
    return h;
  },
  a_season(v) { this.season = +v; this.sel = null; this.render(); },

  // ---------------- ドラッグレース ----------------
  r_drag() {
    $('panelTitle').textContent = 'DRAG RACE'; const d = SAVE.data, st = d.stats; this.show.setCar(SAVE.cur());
    const opp = DRAG_OPP; if (!this.dragOpp) this.dragOpp = opp[0].id;
    let h = `<div class="drag-head">${ICO('flag2', '#ff6a3a', 40)}<div><b>0-400m ドラッグレース</b><small>スタートの合図で全開！ まっすぐ 400m を先に走り切った方の勝ち。シフトアップのタイミングが勝負。</small></div></div>`;
    h += `<div class="stat-row"><div><span>自己ベスト</span><b>${st.dragBest ? st.dragBest.toFixed(3) + ' 秒' : '—'}</b></div><div><span>勝利数</span><b>${st.dragWins || 0}</b></div><div><span>出走数</span><b>${st.drags || 0}</b></div></div>`;
    h += `<div class="h3">対戦相手を選ぶ</div><div class="opp-grid">${opp.map(o => { const c = CAR_BY_ID[o.car]; return `<button class="opp ${this.dragOpp === o.id ? 'on' : ''}" data-a="dragOpp" data-v="${o.id}" style="--oc:${o.col}"><small>${o.tier}</small><b>${esc(o.name)}</b><span>${esc(c.name)}</span><em>${c.hp}PS ・ 賞金 ${yen(o.prize)}</em></button>`; }).join('')}</div>`;
    h += `<div class="note">使用車両: <b>${CAR_BY_ID[SAVE.cur().id].name}</b>（ガレージで変更）。勝つと賞金、タイムが速いほどボーナス。</div><button class="btn pri big" data-a="dragGo">スタートラインへ ▶</button>`;
    return h;
  },
  a_dragOpp(v) { this.dragOpp = v; this.render(); },
  a_dragGo() { const o = DRAG_OPP.find(x => x.id === this.dragOpp) || DRAG_OPP[0]; AUDIO.playCat('race'); this.launch({ mode: 'drag', mapId: 'dragstrip', weather: 'clear', time: 'night', laps: 1, carInst: SAVE.cur(), rivals: [{ name: o.name, team: o.tier, car: o.car, color: o.col, skill: o.skill }] }); },
  startPractice() { this.launch({ mode: 'free', mapId: 'driftpark', weather: 'clear', time: 'day', laps: 1, carInst: SAVE.cur(), rivals: [] }); },

  // ---------------- 実績 ----------------
  r_ach() {
    $('panelTitle').textContent = 'ACHIEVEMENTS'; const d = SAVE.data; d.achClaim = d.achClaim || {}; achNewlyDone(); this.show.setCar(SAVE.cur());
    const all = ACHIEVEMENTS, done = all.filter(a => achDone(a, d)).length, cats = ACH_CATS.filter(([k]) => all.some(a => a.cat === k)); if (!this.achCat) this.achCat = 'all';
    let h = `<div class="ach-head"><div class="ach-ring" style="--p:${done / all.length * 100}"><b>${done}</b><small>/ ${all.length}</small></div><div><b>実績</b><small>条件を満たすと達成。報酬は「受け取る」で受け取れます。</small>${achClaimable() ? `<button class="btn pri" data-a="achAll">まとめて受け取る</button>` : ''}</div></div>`;
    h += `<div class="chips">${[['all', 'すべて']].concat(cats).map(([k, l]) => `<button class="chip2 ${this.achCat === k ? 'on' : ''}" data-a="achCat" data-v="${k}">${l}</button>`).join('')}</div>`;
    const list = all.filter(a => this.achCat === 'all' || a.cat === this.achCat).sort((a, b) => (achDone(b, d) && !d.achClaim[b.id]) - (achDone(a, d) && !d.achClaim[a.id]) || achDone(a, d) - achDone(b, d));
    h += `<div class="ach-list">${list.map(a => { const [c, g] = achProgress(a, d), ok = achDone(a, d), got = d.achClaim[a.id]; const pct = Math.min(100, c / g * 100); const big = g >= 1000;
      return `<div class="ach ${ok ? 'ok' : ''} ${got ? 'got' : ''}"><div class="ach-ic">${ICO(ok ? 'medal2' : 'lock', ok ? '#ffcf3d' : '#666', 30)}</div><div class="ach-m"><b>${esc(a.name)}</b><small>${esc(a.desc)}</small><span class="ach-bar"><i style="width:${ok ? 100 : pct}%"></i></span><em>${ok ? '達成！' : (big ? Math.round(c).toLocaleString() + ' / ' + g.toLocaleString() : c + ' / ' + g)}</em></div><div class="ach-r"><small>${rewardLabel(a.rw || {})}</small>${ok && !got ? `<button class="btn pri" data-a="achClaim" data-v="${a.id}">受け取る</button>` : got ? '<em>受取済み</em>' : ''}</div></div>`; }).join('')}</div>`;
    return h;
  },
  a_achCat(v) { this.achCat = v; this.render(); },
  a_achClaim(id) { const d = SAVE.data, a = ACHIEVEMENTS.find(x => x.id === id); if (!a || !achDone(a, d) || d.achClaim[id]) return; d.achClaim[id] = Date.now(); const s = grantReward(a.rw || { money: 100000 }); AUDIO.chestOpen(2); this.toast('実績報酬: ' + s); this.render(); },
  a_achAll() { const d = SAVE.data; let n = 0; for (const a of ACHIEVEMENTS) if (achDone(a, d) && !d.achClaim[a.id]) { d.achClaim[a.id] = Date.now(); grantReward(a.rw || { money: 100000 }); n++; } AUDIO.chestOpen(3); this.toast(n + '個の実績報酬を受け取りました'); this.render(); },

  // ---------------- コード入力 ----------------
  r_codes() {
    $('panelTitle').textContent = 'REDEEM CODE'; const d = SAVE.data; d.codes = d.codes || {}; this.show.setCar(SAVE.cur());
    let h = `<div class="code-box">${ICO('code', '#9ad8ff', 44)}<b>コードを入力して報酬を受け取ろう</b><small>公式のお知らせやイベントで配られるコードを入力してください。1つのコードは1回だけ使えます。</small><div class="code-in"><input id="codeIn" type="text" maxlength="24" placeholder="例：WELCOME" autocomplete="off" autocapitalize="characters"><button class="btn pri" data-a="redeem">受け取る</button></div></div>`;
    const used = Object.entries(d.codes).sort((a, b) => b[1].t - a[1].t);
    h += `<div class="h3">使ったコード</div>` + (used.length ? `<div class="lb-list">${used.map(([k, v]) => `<div class="lb-row"><span class="nm">${esc(k)}<small style="display:block;font-size:10px;color:#999;font-weight:400">${new Date(v.t).toLocaleDateString()}</small></span><span class="vl" style="font-size:11px">${esc(v.got || '')}</span></div>`).join('')}</div>` : `<div class="note">まだコードを使っていません。</div>`);
    return h;
  },
  async a_redeem() {
    const el = document.getElementById('codeIn'); const code = String(el && el.value || '').trim().toUpperCase().replace(/\s+/g, ''); const d = SAVE.data; d.codes = d.codes || {};
    if (!code) return this.toast('コードを入力してください'); if (d.codes[code]) { AUDIO.error(); return this.toast('このコードは使用済みです'); }
    let r = REDEEM_CODES[code];
    if (!r && window.DL_FB) { try { await DL_FB.ready(); const s = await DL_FB.db().ref('codes/' + code.replace(/[.#$\[\]\/]/g, '_')).get(); r = s.val(); } catch (e) { } }
    if (!r) { AUDIO.error(); return this.toast('コードが見つかりません'); }
    if (r.until && Date.now() > new Date(r.until + 'T23:59:59+09:00').getTime()) { AUDIO.error(); return this.toast('このコードの有効期限は終了しました'); }
    const got = grantReward(r); d.codes[code] = { t: Date.now(), got }; SAVE.save(); AUDIO.chestOpen(3);
    this.modal(`<div class="code-ok">${ICO('gift', '#ffcf3d', 64)}<h2>コード「${esc(code)}」</h2>${r.note ? `<div class="note" style="text-align:center">${esc(r.note)}</div>` : ''}<div class="code-got">${esc(got)}</div><div class="btns"><button class="btn pri" data-a="closeModal">OK</button></div></div>`); this.render();
  },

  // ---------------- ガレージレベル ----------------
  r_glv() {
    $('panelTitle').textContent = 'GARAGE LEVEL'; const d = SAVE.data; d.glClaim = d.glClaim || {}; const G = garageLevel(d); this.show.setCar(SAVE.cur());
    const pct = Math.min(100, (G.pts - G.cur) / Math.max(1, G.next - G.cur) * 100);
    let h = `<div class="glv-head"><div class="glv-badge"><small>GARAGE</small><b>${G.lv}</b></div><div class="glv-m"><b>ガレージレベル ${G.lv}${G.lv >= GARAGE_MAX ? '（MAX＋' + G.extra + '）' : ''}</b><small>車を集めるとポイントが増えてレベルが上がります（所持 ${d.cars.length} 台 ・ ${G.pts.toLocaleString()} pt）。高い車ほどポイントが多い。</small><span class="ach-bar big"><i style="width:${pct}%"></i></span><em>次のレベルまで ${(G.next - G.pts).toLocaleString()} pt</em></div></div>`;
    const maxShow = Math.max(G.lv + 5, 20), claimable = [];
    for (let lv = 1; lv <= G.lv; lv++) if (!d.glClaim[lv]) claimable.push(lv);
    if (claimable.length) h += `<button class="btn pri big" data-a="glvAll">受け取れる報酬 ${claimable.length}件をまとめて受け取る</button>`;
    h += `<div class="glv-list">`;
    for (let lv = 1; lv <= Math.min(maxShow, G.lv >= GARAGE_MAX ? G.lv + 5 : GARAGE_MAX); lv++) { const r = garageReward(lv), ok = lv <= G.lv, got = d.glClaim[lv]; h += `<div class="glv-row ${ok ? 'ok' : ''} ${got ? 'got' : ''} ${lv % 10 === 0 ? 'big' : ''}"><b>Lv.${lv}</b><span>${rewardLabel(r)}${lv > GARAGE_MAX ? '（100以降の報酬）' : ''}</span>${ok ? (got ? '<em>受取済み</em>' : `<button class="btn pri" data-a="glvClaim" data-v="${lv}">受け取る</button>`) : `<em class="lk">${ICO('lock', '#777', 12)}</em>`}</div>`; }
    h += `</div>`; if (G.lv < GARAGE_MAX) h += `<div class="note">レベル ${GARAGE_MAX} まで報酬があり、${GARAGE_MAX} を超えるとレベルごとにコインかランダムなアイテムがもらえます。</div>`;
    return h;
  },
  a_glvClaim(v) { const d = SAVE.data, lv = +v; d.glClaim = d.glClaim || {}; if (d.glClaim[lv] || lv > garageLevel(d).lv) return; d.glClaim[lv] = 1; const s = grantReward(garageReward(lv)); AUDIO.chestOpen(2); this.toast('Lv.' + lv + ' 報酬: ' + s); this.render(); },
  a_glvAll() { const d = SAVE.data; d.glClaim = d.glClaim || {}; const G = garageLevel(d); let n = 0; for (let lv = 1; lv <= G.lv; lv++) if (!d.glClaim[lv]) { d.glClaim[lv] = 1; grantReward(garageReward(lv)); n++; } AUDIO.chestOpen(3); this.toast(n + '件の報酬を受け取りました'); this.render(); },

  // ---------------- チュートリアル ----------------
  tutorial(manual) {
    const touch = isTouchDev(); const key = k => `<kbd>${k}</kbd>`;
    const pages = [
      { ic: 'flag', t: 'DRIFT LEGENDS へようこそ！', b: '峠を攻めてライバルに勝ち、車を集めてチューニングする走り屋ゲームです。まずは基本の操作を覚えましょう。' },
      touch ? { ic: 'carSide', t: 'スマホの操作', b: `画面左下の <b>◀ ▶</b> でハンドル、右下の <b>アクセル</b> と <b>ブレーキ</b> で加速・減速します。<br><b>サイド</b>（サイドブレーキ）を押すと後輪が滑ってドリフトのきっかけになります。<b>NITRO</b> は一時的な加速です。<br>右上の <b>カメラ</b> ボタンで視点を切り替え（運転席視点もあります）。` }
        : { ic: 'carSide', t: 'キーボードの操作', b: `${key('↑')} アクセル ・ ${key('↓')} ブレーキ ・ ${key('←')}${key('→')} ハンドル<br>${key('Space')} サイドブレーキ（ドリフト） ・ ${key('Shift')} ニトロ<br>${key('C')} カメラ切り替え（運転席視点ではハンドルとメーターが動きます） ・ ${key('Esc')} ポーズ<br>ゲームパッドにも対応しています。` },
      touch ? { ic: 'gear', t: '操作方法の変え方（スマホ）', b: `<b>設定 → 操作</b> を開くと、操作のプリセットを選べます。<br>・<b>アクセル自動</b>：アクセルを押し続けなくても進みます<br>・<b>スライド操作</b>：画面をなぞってハンドル<br>・<b>ジャイロ</b>：スマホを傾けてハンドル<br>・ボタンの大きさも変更できます。苦手な人はまず「かんたん」プリセットがおすすめ！` } : null,
      { ic: 'drift', t: 'ドリフトのコツ', b: 'コーナーの手前でブレーキ → ハンドルを切りながらサイドブレーキ → 滑り出したらカウンター（逆ハンドル）とアクセルで角度を保ちます。<br><b>ドリフト練習場</b>で何度でも練習できます。' },
      { ic: 'trophy', t: '遊べるモード', b: '<b>ストーリー</b>（シーズン1〜3）・<b>タイムアタック</b>・<b>峠チャレンジ</b>・<b>ドラッグレース</b>・<b>オンライン対戦</b>。勝つとお金・ダイヤ・アイテムがもらえます。' },
      { ic: 'users', t: 'みんなと遊ぶ', b: '上のボタンから <b>ガレージレベル</b>・<b>フレンド</b>・<b>クラン</b> を開けます。フレンドとはトレードやフレンドタスクができます（オンライン版・Googleログインが必要）。' },
      { ic: 'book', t: 'いつでも見直せます', b: 'このチュートリアルはメニューの <b>チュートリアル</b>、または <b>設定</b> からいつでも見られます。それでは、良い走りを！' }
    ].filter(Boolean);
    let i = 0; const draw = () => { const p = pages[i]; this.modal(`<div class="tut"><div class="tut-ic">${ICO(p.ic, '#ffcf3d', 54)}</div><small>HOW TO PLAY ・ ${i + 1} / ${pages.length}</small><h2>${p.t}</h2><div class="tut-b">${p.b}</div><div class="tut-dots">${pages.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div><div class="btns">${i > 0 ? '<button class="btn" data-a="tutPrev">戻る</button>' : '<button class="btn" data-a="tutSkip">スキップ</button>'}<button class="btn pri" data-a="tutNext">${i === pages.length - 1 ? 'はじめる！' : '次へ ▶'}</button></div></div>`); };
    this._tut = { next: () => { if (i < pages.length - 1) { i++; draw(); } else this.a_tutSkip(); }, prev: () => { if (i > 0) { i--; draw(); } } }; draw();
  },
  a_tutNext() { this._tut && this._tut.next(); }, a_tutPrev() { this._tut && this._tut.prev(); },
  a_tutSkip() { SAVE.data.tutDone = true; SAVE.save(); this.closeModal(); },
  a_tutorial() { this.tutorial(true); },

  // ---------------- フレンド ----------------
  r_friends() {
    $('panelTitle').textContent = 'FRIENDS'; this.show.setCar(SAVE.cur()); if (!SOC.avail()) return this.needLogin('フレンド');
    if (!SOC.on) { SOC.start().then(() => this.render()); return `<div class="note">接続中…</div>`; }
    if (!this.tab) this.tab = 'list'; const fr = Object.entries(SOC.friends), rq = Object.entries(SOC.reqs), tv = Object.entries(SOC.inv).filter(([k, v]) => v);
    let h = `<div class="tabs">${[['list', `フレンド（${fr.length}）`], ['req', `申請${rq.length ? '（' + rq.length + '）' : ''}`], ['add', '追加'], ['task', 'フレンドタスク'], ['trades', `トレード${tv.length ? '（' + tv.length + '）' : ''}`]].map(([k, l]) => `<button class="tab ${this.tab === k ? 'on' : ''}" data-a="setTab" data-v="${k}">${l}</button>`).join('')}</div>`;
    if (this.tab === 'list') h += fr.length ? `<div class="fr-list">${fr.map(([u, n]) => `<div class="fr"><span class="dot ${SOC.isOnline(u) ? 'on' : ''}"></span><b class="noi18n">${esc(n)}</b><small>${SOC.isOnline(u) ? 'オンライン' : 'オフライン'}</small><button class="btn" data-a="tradeStart" data-v="${u}">${ICO('trade', '#ffcf3d', 14)} トレード</button><button class="btn ghost" data-a="frDel" data-v="${u}">削除</button></div>`).join('')}</div>` : `<div class="empty-card">${ICO('users', '#5ad1ff', 40)}<b>まだフレンドがいません</b><small>「追加」タブからユーザーネームで申請しよう。</small></div>`;
    if (this.tab === 'req') h += rq.length ? `<div class="fr-list">${rq.map(([u, v]) => `<div class="fr"><span class="dot ${SOC.isOnline(u) ? 'on' : ''}"></span><b class="noi18n">${esc(v.n)}</b><small>フレンド申請</small><button class="btn pri" data-a="frOk" data-v="${u}">承認</button><button class="btn ghost" data-a="frNo" data-v="${u}">拒否</button></div>`).join('')}</div>` : `<div class="note">届いている申請はありません。</div>`;
    if (this.tab === 'add') h += `<div class="code-box">${ICO('users', '#5ad1ff', 40)}<b>ユーザーネームでフレンド申請</b><small>相手のユーザーネーム（アカウント画面で設定した名前）を入力してください。あなたのユーザーネーム：<b class="noi18n">${esc(SOC.name)}</b></small><div class="code-in"><input id="frName" type="text" maxlength="12" placeholder="ユーザーネーム" autocomplete="off"><button class="btn pri" data-a="frSend">申請する</button></div></div>`;
    if (this.tab === 'task') { h += `<div class="note">フレンドと協力する週替わりのタスクです（毎週月曜にリセット）。2人の合計で達成すると、それぞれが報酬を受け取れます。</div>`; h += fr.length ? `<div id="ftBox">${this.ftHTML()}</div>` : `<div class="note">フレンドができると挑戦できます。</div>`; if (fr.length) this.loadFt(); }
    if (this.tab === 'trades') h += tv.length ? `<div class="fr-list">${tv.map(([tid, v]) => `<div class="fr"><span class="dot on"></span><b class="noi18n">${esc(v.n)}</b><small>${v.from === SOC.uid ? 'あなたが開始' : '相手から'}のトレード</small><button class="btn pri" data-a="tradeOpen" data-v="${tid}">開く</button></div>`).join('')}</div>` : `<div class="note">進行中のトレードはありません。フレンド一覧の「トレード」から始められます。</div>`;
    return h;
  },
  async a_frSend() {
    const n = String((document.getElementById('frName') || {}).value || '').trim(); if (!n) return this.toast('ユーザーネームを入力してください'); const db = SOC.db();
    try { const s = await db.ref('unames/' + n.toLowerCase()).get(); const u = s.val(); if (!u) { AUDIO.error(); return this.toast('そのユーザーが見つかりません'); } if (u === SOC.uid) return this.toast('自分には申請できません'); if (SOC.friends[u]) return this.toast('すでにフレンドです');
      if (SOC.reqs[u]) return this.a_frOk(u); await db.ref('freq/' + u + '/' + SOC.uid).set({ n: SOC.name, t: Date.now() }); this.toast(n + ' さんにフレンド申請しました'); } catch (e) { AUDIO.error(); this.toast('送信できませんでした（' + (e.code || e.message) + '）'); }
  },
  async a_frOk(u) { const v = SOC.reqs[u]; const up = {}; up['friends/' + SOC.uid + '/' + u] = v ? v.n : '?'; up['friends/' + u + '/' + SOC.uid] = SOC.name; up['freq/' + SOC.uid + '/' + u] = null; try { await SOC.db().ref().update(up); this.toast('フレンドになりました！'); } catch (e) { this.toast('承認できませんでした'); } },
  async a_frNo(u) { await SOC.db().ref('freq/' + SOC.uid + '/' + u).remove().catch(() => { }); },
  async a_frDel(u) { if (!confirm('フレンドを削除しますか？')) return; const up = {}; up['friends/' + SOC.uid + '/' + u] = null; up['friends/' + u + '/' + SOC.uid] = null; await SOC.db().ref().update(up).catch(() => { }); },
  ftHTML() {
    const d = SAVE.data, w = weekKeyLocal(); d.ftClaim = d.ftClaim || {}; const data = this._ft || {};
    return Object.entries(SOC.friends).map(([u, n]) => { const key = SOC.pairKey(SOC.uid, u), mine = (d.fwk && d.fwk.w === w) ? d.fwk : { km: 0, drift: 0, wins: 0 }, them = (data[u] || {});
      return `<div class="ft-card"><b class="noi18n">${esc(n)}</b><small>と協力</small>${FTASKS.map(t => { const sum = (mine[t.id] || 0) + (them[t.id] || 0), ok = sum >= t.goal, ck = key + w + t.id, got = d.ftClaim[ck];
        return `<div class="ft-row"><div><b>${t.name}</b><span class="ach-bar"><i style="width:${Math.min(100, sum / t.goal * 100)}%"></i></span><small>${t.unit(sum)} / ${t.unit(t.goal)}（あなた ${t.unit(mine[t.id] || 0)}）</small></div><div class="ach-r"><small>${rewardLabel(t.rw)}</small>${ok && !got ? `<button class="btn pri" data-a="ftClaim" data-v="${u}:${t.id}">受け取る</button>` : got ? '<em>受取済み</em>' : ''}</div></div>`; }).join('')}</div>`; }).join('');
  },
  async loadFt() {
    if (this._ftLoading) return; this._ftLoading = true; const d = SAVE.data, w = weekKeyLocal(), db = SOC.db(); const mine = (d.fwk && d.fwk.w === w) ? d.fwk : { km: 0, drift: 0, wins: 0 }; this._ft = this._ft || {};
    try { for (const u of Object.keys(SOC.friends)) { const key = SOC.pairKey(SOC.uid, u); db.ref('ftask/' + key + '/' + w + '/' + SOC.uid).set({ km: Math.round(mine.km), drift: Math.round(mine.drift), wins: mine.wins }).catch(() => { }); const s = await db.ref('ftask/' + key + '/' + w + '/' + u).get(); this._ft[u] = s.val() || {}; } } catch (e) { }
    this._ftLoading = false; const el = document.getElementById('ftBox'); if (el) el.innerHTML = this.ftHTML();
  },
  a_ftClaim(v) { const [u, tid] = v.split(':'); const d = SAVE.data, w = weekKeyLocal(), t = FTASKS.find(x => x.id === tid); const ck = SOC.pairKey(SOC.uid, u) + w + tid; d.ftClaim = d.ftClaim || {}; if (d.ftClaim[ck] || !t) return; d.ftClaim[ck] = 1; d.stats.ftasks = (d.stats.ftasks || 0) + 1; const s = grantReward(t.rw); AUDIO.chestOpen(2); this.toast('フレンドタスク報酬: ' + s); const el = document.getElementById('ftBox'); if (el) el.innerHTML = this.ftHTML(); },

  // ---------------- クラン ----------------
  r_clan() {
    $('panelTitle').textContent = 'CLAN'; this.show.setCar(SAVE.cur()); if (!SOC.avail()) return this.needLogin('クラン');
    if (!SOC.on) { SOC.start().then(() => this.render()); return `<div class="note">接続中…</div>`; }
    const d = SAVE.data, c = SOC.clan;
    if (!SOC.clanId || !c) {
      let h = `<div class="clan-hero">${ICO('shield', '#2fdc7a', 50)}<div><b>クランに参加しよう</b><small>仲間とグループを作って、メンバー一覧とグループチャットが使えます。</small></div></div>`;
      h += `<div class="h3">コードで参加</div><div class="code-in"><input id="clanCode" type="text" maxlength="8" placeholder="参加コード（6文字）" autocomplete="off" autocapitalize="characters"><button class="btn pri" data-a="clanJoinCode">参加</button></div>`;
      h += `<div class="h3">公開クランを探す</div><div id="clanList"><div class="note">読み込み中…</div></div>`; this.loadClans();
      const owned = !!d.clanOwned;
      h += `<div class="h3">クランを作る（ダイヤ ${CLAN_COST}）</div>` + (owned ? `<div class="note">クランは1人1つまで作れます（作成済み）。</div>` : `<div class="clan-form"><input id="clanName" type="text" maxlength="16" placeholder="クラン名（2〜16文字）" autocomplete="off"><div class="seg"><button class="${this.clanOpen !== false ? 'on' : ''}" data-a="clanOpenSet" data-v="1">公開（誰でも参加）</button><button class="${this.clanOpen === false ? 'on' : ''}" data-a="clanOpenSet" data-v="0">コードが必要</button></div><button class="btn pri big" data-a="clanCreate">${ICO('gem', '#111', 14)} ${CLAN_COST} で作成する</button></div>`);
      return h;
    }
    const mem = Object.entries(c.members || {}), own = c.owner === SOC.uid;
    let h = `<div class="clan-hero in">${ICO('shield', '#2fdc7a', 50)}<div><b class="noi18n">${esc(c.name)}</b><small>${c.open ? '公開クラン' : 'コードが必要なクラン'} ・ メンバー ${mem.length}人 ・ リーダー <span class="noi18n">${esc(c.ownerName || '')}</span></small>${c.code ? `<em>参加コード：<b class="noi18n">${esc(c.code)}</b></em>` : ''}</div></div>`;
    h += `<div class="clan-cols"><div><div class="h3">メンバー</div><div class="fr-list">${mem.sort((a, b) => (b[0] === c.owner) - (a[0] === c.owner)).map(([u, v]) => `<div class="fr"><span class="dot ${SOC.isOnline(u) ? 'on' : ''}"></span><b class="noi18n">${esc(v.n)}</b><small>${u === c.owner ? 'リーダー' : 'メンバー'}</small>${u !== SOC.uid && !SOC.friends[u] ? `<button class="btn ghost" data-a="frAddUid" data-v="${u}:${esc(v.n)}">フレンド申請</button>` : ''}</div>`).join('')}</div></div>
      <div><div class="h3">${ICO('chat', '#5ad1ff', 16)} グループチャット</div><div class="chat-log" id="chatLog">${this.chatHTML()}</div><div class="code-in"><input id="chatIn" type="text" maxlength="120" placeholder="メッセージを入力" autocomplete="off"><button class="btn pri" data-a="chatSend">送信</button></div></div></div>`;
    h += `<div class="btns">${own ? `<button class="btn ghost" data-a="clanDisband">クランを解散</button>` : `<button class="btn ghost" data-a="clanLeave">クランを抜ける</button>`}</div>`;
    setTimeout(() => { const el = document.getElementById('chatLog'); if (el) el.scrollTop = el.scrollHeight; const ci = document.getElementById('chatIn'); if (ci && !ci._k) { ci._k = 1; ci.addEventListener('keydown', e => { if (e.key === 'Enter') this.a_chatSend(); }); } }, 30);
    return h;
  },
  chatHTML() { return SOC.chat.length ? SOC.chat.map(m => `<div class="msg ${m.u === SOC.uid ? 'me' : ''}"><b class="noi18n">${esc(m.n || '?')}</b><span class="noi18n">${esc(m.m || '')}</span><small>${new Date(m.t || 0).toLocaleTimeString().slice(0, 5)}</small></div>`).join('') : '<div class="note">まだメッセージはありません。あいさつしてみよう！</div>'; },
  a_clanOpenSet(v) { this.clanOpen = v === '1'; this.render(); },
  async loadClans() { try { const s = await SOC.db().ref('clans').orderByChild('open').equalTo(true).limitToFirst(30).get(); const a = []; s.forEach(x => { const v = x.val(); if (v) a.push([x.key, v]); }); const el = document.getElementById('clanList'); if (el) el.innerHTML = a.length ? `<div class="fr-list">${a.map(([k, v]) => `<div class="fr"><span class="dot on"></span><b class="noi18n">${esc(v.name)}</b><small>${Object.keys(v.members || {}).length}人</small><button class="btn pri" data-a="clanJoin" data-v="${k}">参加</button></div>`).join('')}</div>` : '<div class="note">公開クランはまだありません。作ってみよう！</div>'; } catch (e) { const el = document.getElementById('clanList'); if (el) el.innerHTML = '<div class="note">読み込めませんでした（データベースのルール更新が必要な場合があります）。</div>'; } },
  async a_clanCreate() {
    const d = SAVE.data, name = String((document.getElementById('clanName') || {}).value || '').trim(); if (d.clanOwned) return this.toast('クランは1人1つまでです');
    if (name.length < 2 || name.length > 16 || /[.#$\[\]\/\\]/.test(name)) { AUDIO.error(); return this.toast('クラン名は2〜16文字（. # $ [ ] / は使えません）'); }
    if ((d.diamonds || 0) < CLAN_COST && !DEV.inf()) { AUDIO.error(); return this.toast('ダイヤが足りません（' + CLAN_COST + '必要）'); }
    const open = this.clanOpen !== false;
    this.confirmBuy({ name: 'クラン「' + name + '」を作成', price: CLAN_COST, cur: 'dia', desc: open ? '公開クラン（誰でも参加できる）' : '参加にコードが必要なクラン', go: async () => {
      const db = SOC.db(); try { const ex = await db.ref('clanNames/' + name.toLowerCase()).get(); if (ex.exists()) { AUDIO.error(); return this.toast('そのクラン名は使われています'); }
        const cid = db.ref('clans').push().key, code = Math.random().toString(36).slice(2, 8).toUpperCase(); const up = {};
        up['clans/' + cid] = { name, owner: SOC.uid, ownerName: SOC.name, open, code: open ? null : code, created: Date.now(), members: { [SOC.uid]: { n: SOC.name, t: Date.now() } } };
        up['clanNames/' + name.toLowerCase()] = cid; up['clanCodes/' + code] = cid; up['clanOf/' + SOC.uid] = cid; if (open) up['clans/' + cid].code = code;
        await db.ref().update(up); if (!DEV.inf()) d.diamonds -= CLAN_COST; d.clanOwned = cid; d.stats.clanJoined = 1; SAVE.save(); this.refreshTop(); AUDIO.chestOpen(4); this.toast('クラン「' + name + '」を作成しました！');
      } catch (e) { AUDIO.error(); this.toast('作成できませんでした（' + (e.code || e.message) + '）'); } } });
  },
  async a_clanJoin(cid) { const db = SOC.db(); try { const up = {}; up['clans/' + cid + '/members/' + SOC.uid] = { n: SOC.name, t: Date.now() }; up['clanOf/' + SOC.uid] = cid; await db.ref().update(up); this.toast('クランに参加しました！'); } catch (e) { AUDIO.error(); this.toast('参加できませんでした'); } },
  async a_clanJoinCode() { const code = String((document.getElementById('clanCode') || {}).value || '').trim().toUpperCase(); if (!code) return this.toast('コードを入力してください'); try { const s = await SOC.db().ref('clanCodes/' + code).get(); if (!s.val()) { AUDIO.error(); return this.toast('コードが見つかりません'); } this.a_clanJoin(s.val()); } catch (e) { this.toast('参加できませんでした'); } },
  async a_clanLeave() { if (!confirm('クランを抜けますか？')) return; const up = {}; up['clans/' + SOC.clanId + '/members/' + SOC.uid] = null; up['clanOf/' + SOC.uid] = null; await SOC.db().ref().update(up).catch(() => { }); },
  async a_clanDisband() { if (!confirm('クランを解散しますか？（元に戻せません）')) return; const c = SOC.clan, cid = SOC.clanId, up = {}; up['clans/' + cid] = null; up['clanChat/' + cid] = null; up['clanNames/' + String(c.name).toLowerCase()] = null; if (c.code) up['clanCodes/' + c.code] = null; up['clanOf/' + SOC.uid] = null; await SOC.db().ref().update(up).catch(() => { }); this.toast('クランを解散しました'); },
  async a_chatSend() { const el = document.getElementById('chatIn'); const m = String(el && el.value || '').trim().slice(0, 120); if (!m || !SOC.clanId) return; el.value = ''; try { await SOC.db().ref('clanChat/' + SOC.clanId).push({ u: SOC.uid, n: SOC.name, m, t: Date.now() }); SAVE.data.stats.chats = (SAVE.data.stats.chats || 0) + 1; } catch (e) { this.toast('送信できませんでした'); } },
  async a_frAddUid(v) { const [u, n] = v.split(':'); await SOC.db().ref('freq/' + u + '/' + SOC.uid).set({ n: SOC.name, t: Date.now() }).catch(() => { }); this.toast((n || '') + ' さんにフレンド申請しました'); },

  // ---------------- トレード（フレンドのみ） ----------------
  async a_tradeStart(u) {
    if (!SOC.friends[u]) return this.toast('トレードはフレンドとだけできます'); const db = SOC.db(); const tid = db.ref('trades').push().key; const now = Date.now();
    const up = {}; up['trades/' + tid] = { a: SOC.uid, b: u, an: SOC.name, bn: SOC.friends[u], st: 'open', t: now, acc: { a: false, b: false } }; up['tradeInv/' + u + '/' + tid] = { from: SOC.uid, n: SOC.name, t: now }; up['tradeInv/' + SOC.uid + '/' + tid] = { from: SOC.uid, n: SOC.friends[u], t: now };
    try { await db.ref().update(up); this.open('trade', { tid }); } catch (e) { AUDIO.error(); this.toast('トレードを開始できませんでした'); }
  },
  a_tradeOpen(tid) { this.open('trade', { tid }); },
  r_trade(arg) {
    $('panelTitle').textContent = 'TRADE'; this.show.setCar(SAVE.cur()); if (!SOC.avail() || !SOC.on) return this.needLogin('トレード');
    const tid = arg && arg.tid; if (!tid) return '<div class="note">トレードが見つかりません。</div>';
    if (!SOC.trade || SOC.trade.tid !== tid) { if (SOC.tradeOff) SOC.tradeOff(); const r = SOC.db().ref('trades/' + tid); const cb = s => { const v = s.val(); SOC.trade = { tid, v }; this.onTrade(); }; r.on('value', cb, () => { }); SOC.tradeOff = () => r.off('value', cb); SOC.trade = { tid, v: null }; return '<div class="note">読み込み中…</div>'; }
    const t = SOC.trade.v; if (!t) return '<div class="note">このトレードは終了しました。</div>';
    const side = t.a === SOC.uid ? 'a' : 'b', other = side === 'a' ? 'b' : 'a', mine = (t.offer || {})[side] || {}, theirs = (t.offer || {})[other] || {}, acc = t.acc || {};
    if (t.st === 'done') return `<div class="trade-done">${ICO('trade', '#2fdc7a', 60)}<h2>トレード成立！</h2><div class="note" style="text-align:center">受け取った物はガレージ・バックパックに追加されました。</div><button class="btn pri big" data-a="tradeClose">閉じる</button></div>`;
    if (t.st === 'cancel') return `<div class="trade-done">${ICO('trade', '#ff6a6a', 60)}<h2>トレードはキャンセルされました</h2><button class="btn pri big" data-a="tradeClose">閉じる</button></div>`;
    const offerHTML = (o, editable) => { const it = (o.items || []).map(id => ITEM_BY_ID[id]).filter(Boolean), cars = o.cars || [];
      return `<div class="tr-money"><span>${yen(o.money || 0)}</span><span>${ICO('gem', '#9ad8ff', 13)} ${o.dia || 0}</span></div>${editable ? `<div class="tr-in"><input id="trMoney" type="number" min="0" step="10000" placeholder="お金" value="${o.money || ''}"><input id="trDia" type="number" min="0" placeholder="ダイヤ" value="${o.dia || ''}"><button class="btn" data-a="trSetNum">反映</button></div>` : ''}
        <div class="tr-items">${it.map(i => `<div class="tr-it" style="border-color:${RARITY[i.rarity].color}">${this.itemIcon(i, 30)}<b>${esc(i.name)}</b>${editable ? `<button data-a="trDelItem" data-v="${i.id}">×</button>` : ''}</div>`).join('')}${cars.map(c => `<div class="tr-it car">${ICO('carSide', '#ffcf3d', 30)}<b>${esc(CAR_BY_ID[c.id] ? CAR_BY_ID[c.id].name : c.id)}</b>${editable ? `<button data-a="trDelCar" data-v="${c.uid}">×</button>` : ''}</div>`).join('')}${!it.length && !cars.length ? '<div class="note">アイテム・車なし</div>' : ''}</div>`; };
    const both = acc.a && acc.b, left = both && t.accT ? Math.max(0, 5 - (Date.now() - t.accT) / 1000) : null;
    let h = `<div class="tr-head">${ICO('trade', '#ffcf3d', 30)}<div><b>トレード：<span class="noi18n">${esc(side === 'a' ? t.bn : t.an)}</span> さんと</b><small>出す物を選んで「了承」。2人とも了承すると5秒後に成立します（内容を変えると了承は取り消されます）。何も受け取らずにあげるだけでもOK。</small></div></div>`;
    h += `<div class="tr-cols"><div class="tr-col me ${acc[side] ? 'acc' : ''}"><div class="h3">あなたが出す</div>${offerHTML(mine, !acc[side])}${!acc[side] ? `<div class="btns"><button class="btn" data-a="trPick" data-v="items">アイテムを追加</button><button class="btn" data-a="trPick" data-v="cars">車を追加</button></div>` : ''}${acc[side] ? '<em class="tr-ok">了承済み</em>' : ''}</div>
      <div class="tr-col ${acc[other] ? 'acc' : ''}"><div class="h3">相手が出す</div>${offerHTML(theirs, false)}${acc[other] ? '<em class="tr-ok">了承済み</em>' : '<em class="tr-wait">相手の了承待ち</em>'}</div></div>`;
    if (this.trPickMode) h += this.trPickHTML(mine);
    h += `<div class="tr-cd" id="trCd">${left !== null ? `成立まで <b>${Math.ceil(left)}</b> 秒…` : ''}</div><div class="btns"><button class="btn ghost" data-a="trCancel">トレードをやめる</button><button class="btn pri big" data-a="trAccept">${acc[side] ? '了承を取り消す' : '了承する'}</button></div>`;
    return h;
  },
  trPickHTML(mine) {
    const d = SAVE.data; if (this.trPickMode === 'items') { const own = ITEMS.filter(i => i.type !== 'car' && (d.inv[i.id] || 0) > 0 && !(mine.items || []).includes(i.id)); return `<div class="h3">出すアイテムを選ぶ <button class="btn ghost" data-a="trPick" data-v="">閉じる</button></div><div class="tr-pick">${own.slice(0, 200).map(i => `<button class="tr-it" data-a="trAddItem" data-v="${i.id}" style="border-color:${RARITY[i.rarity].color}">${this.itemIcon(i, 28)}<b>${esc(i.name)}</b></button>`).join('') || '<div class="note">出せるアイテムがありません。</div>'}</div>`; }
    const cars = d.cars.filter(c => !(mine.cars || []).some(x => x.uid === c.uid)); return `<div class="h3">出す車を選ぶ <button class="btn ghost" data-a="trPick" data-v="">閉じる</button></div><div class="tr-pick">${cars.map(c => `<button class="tr-it car" data-a="trAddCar" data-v="${c.uid}">${ICO('carSide', '#ffcf3d', 28)}<b>${esc(CAR_BY_ID[c.id].name)}</b>${c.uid === d.current ? '<small>使用中</small>' : ''}</button>`).join('')}</div><div class="note">車は最低1台は手元に残ります。</div>`;
  },
  onTrade() {
    const T = SOC.trade; if (!T) return; const t = T.v; if (this.screen === 'trade' && this.arg && this.arg.tid === T.tid) this.render();
    if (!t) return; const side = t.a === SOC.uid ? 'a' : 'b';
    if (t.st === 'done') this.applyTrade(T.tid, t, side);
    clearInterval(this._trT); if (t.st === 'open' && t.acc && t.acc.a && t.acc.b && t.accT) { this._trT = setInterval(() => { const left = 5 - (Date.now() - t.accT) / 1000; const el = document.getElementById('trCd'); if (el) el.innerHTML = left > 0 ? `成立まで <b>${Math.ceil(left)}</b> 秒…` : '成立処理中…'; if (left <= 0) { clearInterval(this._trT); this.tradeFinalize(T.tid); } }, 200); }
  },
  async trWrite(mut) { const T = SOC.trade; if (!T || !T.v) return; const t = T.v, side = t.a === SOC.uid ? 'a' : 'b'; const o = Object.assign({ money: 0, dia: 0, items: [], cars: [] }, (t.offer || {})[side] || {}); o.items = (o.items || []).slice(); o.cars = (o.cars || []).slice(); mut(o);
    const up = {}; up['trades/' + T.tid + '/offer/' + side] = o; up['trades/' + T.tid + '/acc'] = { a: false, b: false }; up['trades/' + T.tid + '/accT'] = null; await SOC.db().ref().update(up).catch(e => this.toast('更新できませんでした')); },
  a_trPick(v) { this.trPickMode = v || null; this.render(); },
  a_trSetNum() { const d = SAVE.data; const m = Math.max(0, Math.min(d.money, Math.floor(+((document.getElementById('trMoney') || {}).value) || 0))), di = Math.max(0, Math.min(d.diamonds || 0, Math.floor(+((document.getElementById('trDia') || {}).value) || 0))); this.trWrite(o => { o.money = m; o.dia = di; }); },
  a_trAddItem(id) { this.trWrite(o => { if (!o.items.includes(id) && o.items.length < 30) o.items.push(id); }); },
  a_trDelItem(id) { this.trWrite(o => { o.items = o.items.filter(x => x !== id); }); },
  a_trAddCar(uid) { const d = SAVE.data, c = d.cars.find(x => x.uid === uid); if (!c) return; this.trWrite(o => { if (o.cars.length >= d.cars.length - 1) { this.toast('車は最低1台残してください'); return; } if (!o.cars.some(x => x.uid === uid)) o.cars.push(JSON.parse(JSON.stringify(c))); }); },
  a_trDelCar(uid) { this.trWrite(o => { o.cars = o.cars.filter(x => x.uid !== uid); }); },
  async a_trAccept() {
    const T = SOC.trade; if (!T || !T.v) return; const t = T.v, side = t.a === SOC.uid ? 'a' : 'b', other = side === 'a' ? 'b' : 'a', acc = Object.assign({ a: false, b: false }, t.acc || {});
    const mine = (t.offer || {})[side] || {}, d = SAVE.data;
    if (!acc[side]) { if ((mine.money || 0) > d.money || (mine.dia || 0) > (d.diamonds || 0) || (mine.items || []).some(id => !(d.inv[id] > 0)) || (mine.cars || []).some(c => !d.cars.some(x => x.uid === c.uid))) { AUDIO.error(); return this.toast('出す物が手元にありません。内容を確認してください'); } }
    acc[side] = !acc[side]; const up = {}; up['trades/' + T.tid + '/acc'] = acc; up['trades/' + T.tid + '/accT'] = acc.a && acc.b ? Date.now() : null; await SOC.db().ref().update(up).catch(() => { });
  },
  async tradeFinalize(tid) { const r = SOC.db().ref('trades/' + tid); try { await r.transaction(t => { if (!t || t.st !== 'open' || !t.acc || !t.acc.a || !t.acc.b || !t.accT || Date.now() - t.accT < 4900) return; t.st = 'done'; t.doneT = Date.now(); return t; }); } catch (e) { } },
  applyTrade(tid, t, side) {
    const d = SAVE.data; d.tradesDone = d.tradesDone || {}; if (d.tradesDone[tid]) return; d.tradesDone[tid] = Date.now(); const other = side === 'a' ? 'b' : 'a', mine = (t.offer || {})[side] || {}, theirs = (t.offer || {})[other] || {};
    d.money = Math.max(0, d.money - Math.min(d.money, mine.money || 0)); d.diamonds = Math.max(0, (d.diamonds || 0) - Math.min(d.diamonds || 0, mine.dia || 0));
    for (const id of mine.items || []) if (d.inv[id] > 0) { d.inv[id]--; if (!d.inv[id]) delete d.inv[id]; }
    for (const c of mine.cars || []) { if (d.cars.length <= 1) break; d.cars = d.cars.filter(x => x.uid !== c.uid); if (d.current === c.uid) d.current = d.cars[0].uid; }
    d.money += theirs.money || 0; d.diamonds = (d.diamonds || 0) + (theirs.dia || 0);
    for (const id of theirs.items || []) if (ITEM_BY_ID[id]) d.inv[id] = (d.inv[id] || 0) + 1;
    for (const c of theirs.cars || []) if (CAR_BY_ID[c.id]) { const nc = JSON.parse(JSON.stringify(c)); nc.uid = 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36); nc.fav = false; d.cars.push(nc); }
    d.stats.trades = (d.stats.trades || 0) + 1; SAVE.save(); this.refreshTop(); AUDIO.chestOpen(3); this.toast('トレード成立！');
    SOC.db().ref('tradeInv/' + SOC.uid + '/' + tid).remove().catch(() => { }); SOC.db().ref('trades/' + tid + '/applied/' + side).set(true).catch(() => { });
  },
  async a_trCancel() { const T = SOC.trade; if (!T) return; await SOC.db().ref('trades/' + T.tid + '/st').set('cancel').catch(() => { }); SOC.db().ref('tradeInv/' + SOC.uid + '/' + T.tid).remove().catch(() => { }); },
  a_tradeClose() { const T = SOC.trade; if (T) SOC.db().ref('tradeInv/' + SOC.uid + '/' + T.tid).remove().catch(() => { }); if (SOC.tradeOff) SOC.tradeOff(); SOC.trade = null; this.trPickMode = null; this.back(); }
});
const CLAN_COST = 300;
const DRAG_OPP = [
  { id: 'rookie', tier: 'ROOKIE', name: '新人 タクミ', car: 'ak_altair', col: '#2050c0', skill: 0.7, prize: 300000 },
  { id: 'street', tier: 'STREET', name: '夜の ゼロヨン族', car: 'hk_s3', col: '#ff7a00', skill: 0.85, prize: 400000 },
  { id: 'pro', tier: 'PRO', name: 'プロ ドラッガー', car: 'hk_gtx', col: '#7a7f88', skill: 0.95, prize: 600000 },
  { id: 'legend', tier: 'LEGEND', name: '湾岸の 怪物', car: 'eu_veloce', col: '#f0f0f0', skill: 1.0, prize: 900000 }
];
