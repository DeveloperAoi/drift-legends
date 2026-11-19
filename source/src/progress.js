// =====================================================================
// progress.js — v2.8 レベル・XP・レベル報酬・プロフィール・実績追加・セーブ保護
// =====================================================================
const LV_MAX = 200;
const lvReq = L => 1000 + 150 * (L - 1);                          // L → L+1 に必要なXP（段階的に増える）
const lvCum = L => { L = Math.max(1, L); return 1000 * (L - 1) + 75 * (L - 1) * (L - 2); }; // Lv.L に到達する累計XP
function lvInfo(xp) { xp = Math.max(0, xp || 0); let lv = 1; while (lv < LV_MAX && xp >= lvCum(lv + 1)) lv++; const cur = xp - lvCum(lv), need = lv >= LV_MAX ? 1 : lvReq(lv); return { lv, cur: lv >= LV_MAX ? need : cur, need, next: lv >= LV_MAX ? 0 : need - cur, max: lv >= LV_MAX }; }
SAVE.level = function () { return lvInfo(this.data.xp).lv; };
// 旧方式（1500XPごとに1レベル）からの移行：レベルと途中経過をそのまま引き継ぐ
function migrateXp(d) { if (!d || d.xpv === 2) return; const old = 1 + Math.floor((d.xp || 0) / 1500), frac = ((d.xp || 0) % 1500) / 1500; d.xp = lvCum(Math.min(old, LV_MAX)) + Math.round(frac * lvReq(Math.min(old, LV_MAX))); d.xpv = 2; d.lvClaim = d.lvClaim || {}; for (let L = 2; L <= old; L++) d.lvClaim[L] = 1; }
{ const _load = SAVE.load.bind(SAVE); SAVE.load = function () { _load(); migrateXp(this.data); }; migrateXp(SAVE.data);
  // セーブ保護：壊れたデータでは上書きしない・直前のセーブをバックアップ
  const _save = SAVE.save.bind(SAVE); SAVE.save = function (force) { const d = this.data; if (!d || !Array.isArray(d.cars) || !d.cars.length || !isFinite(d.money) || !isFinite(d.xp)) { console.warn('save skipped: invalid data'); return; } try { const prev = this.ls(this.key); if (prev && Math.random() < 0.2) this.ls(this.key + '_bak', prev); } catch (e) { } return _save(force); }; }

// ---- レベル報酬（全プレイヤー共通・決まった中身） ----
function lvPick(type, n) { const L = ITEMS.filter(i => i.type === type && !i.lim).sort((a, b) => a.id < b.id ? -1 : 1); return L.length ? L[n % L.length] : null; }
function lvReward(L) { const r = { money: 30000 + L * 20000 }, items = [];
  if (L % 5 === 0) items.push(lvPick('decal', L / 5));
  if (L % 10 === 0) items.push(lvPick('title', L / 10));
  if (L % 15 === 0) items.push(lvPick('bg', L / 15));
  if (L % 20 === 0) items.push(lvPick('kit', L / 20));
  if (L % 25 === 0) r.dia = 25 + L / 5;
  r.items = items.filter(Boolean).map(i => i.id); r.cars = CARS.filter(c => c.unlock && c.unlock.level === L).map(c => c.id); return r; }
function lvRewardLabel(r) { return [r.money ? yen(r.money) : '', r.dia ? 'ダイヤ ' + r.dia : ''].concat((r.items || []).map(id => ITEM_BY_ID[id] ? ITEM_BY_ID[id].name : '')).concat((r.cars || []).map(id => 'ショップに「' + CAR_BY_ID[id].name + '」入荷')).filter(Boolean).join('、'); }
// ---- XP 加算（レベルアップ報酬は1レベルにつき1回だけ） ----
function addXp(n, why) { const d = SAVE.data; n = Math.max(0, Math.round(n || 0)); if (!n) return []; const before = lvInfo(d.xp).lv; d.xp = Math.min(lvCum(LV_MAX), (d.xp || 0) + n); const after = lvInfo(d.xp).lv; d.lvClaim = d.lvClaim || {}; const ups = [];
  for (let L = before + 1; L <= after; L++) { if (d.lvClaim[L]) continue; d.lvClaim[L] = Date.now(); const r = lvReward(L); if (r.money) SAVE.addMoney(r.money); if (r.dia) d.diamonds = (d.diamonds || 0) + r.dia; for (const id of r.items) if (ITEM_BY_ID[id]) grantChestItem(ITEM_BY_ID[id]); ups.push({ L, r }); }
  d.xpLog = [{ t: Date.now(), n, why: why || '' }].concat(d.xpLog || []).slice(0, 30); SAVE.save(); if (ups.length) UI._lvUps = (UI._lvUps || []).concat(ups); UI.refreshTop(); return ups; }

// ---- 追加の実績（進行システム） ----
{ const S = d => d.stats || {}; const A = (id, cat, name, desc, goal, get, rw) => ({ id, cat, name, desc, goal, get, rw });
  ACHIEVEMENTS.push(
    A('first_race', 'race', 'FIRST RACE', '初めてレースを完走する', 1, d => S(d).finishes || 0, { money: 100000, xp: 200 }),
    A('first_ta', 'race', 'FIRST TIME ATTACK', '初めてタイムアタックを走る', 1, d => S(d).taRuns || 0, { money: 100000, xp: 200 }),
    A('first_pb', 'race', 'PERSONAL BEST', '初めて自己ベストを更新する', 1, d => S(d).pbs || 0, { money: 150000, xp: 300 }),
    A('fin100', 'race', '100 RACES', 'レースを100回完走する', 100, d => S(d).finishes || 0, { dia: 50, xp: 2000 }),
    A('km100', 'race', '100 KM', '総走行距離100km', 100000, d => S(d).totalDist || 0, { dia: 30, xp: 1500 }),
    A('km1000', 'race', '1000 KM', '総走行距離1,000km', 1000000, d => S(d).totalDist || 0, { dia: 150, xp: 8000 }),
    A('driftmaster', 'drift', 'DRIFT MASTER', 'ドリフトスコア累計 1,000,000点', 1000000, d => S(d).driftTotal || 0, { dia: 60, xp: 3000 }),
    A('lv10', 'collect', 'LEVEL 10', 'レベル10に到達', 10, d => lvInfo(d.xp).lv, { money: 500000 }),
    A('lv50', 'collect', 'LEVEL 50', 'レベル50に到達', 50, d => lvInfo(d.xp).lv, { dia: 100 }),
    A('lv100', 'collect', 'LEVEL 100', 'レベル100に到達', 100, d => lvInfo(d.xp).lv, { dia: 300 })); }

// ---- 効果音：レベルアップ ----
AUDIO.levelUp = function () { this.duckMusic(0.25, 2.5); this.tone(98, 0.8, 'sine', 0.3, 0, 2); [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.22, 'square', 0.09, 0.1 + i * 0.09)); [784, 1046, 1318, 1568].forEach(f => this.tone(f, 1.4, 'triangle', 0.07, 0.5)); this.noiseBurst(1.2, 7000, 0.4, 0.07, 0.45, 'highpass'); };

// ---- 表示部品 ----
function lvBarHTML(id = 'lvb', big = false) { const I = lvInfo(SAVE.data.xp); return `<div class="lvbar ${big ? 'big' : ''}" id="${id}"><div class="lv-n"><small>LEVEL</small><b>${I.lv}</b></div><div class="lv-m"><span class="lv-t">XP ${I.cur.toLocaleString()} / ${I.need.toLocaleString()}</span><span class="lv-bar"><i style="width:${I.cur / I.need * 100}%"></i></span><span class="lv-nx">${I.max ? 'MAX LEVEL' : 'NEXT LEVEL ' + I.next.toLocaleString() + ' XP'}</span></div></div>`; }

Object.assign(UI, {
  showLvUps() { const ups = this._lvUps || []; if (!ups.length) return; this._lvUps = []; const top = ups[ups.length - 1].L;
    let o = document.getElementById('lvUp'); if (!o) { o = document.createElement('div'); o.id = 'lvUp'; document.body.appendChild(o); o.addEventListener('click', e => { if (e.target.closest('[data-l]')) { o.className = ''; o.innerHTML = ''; } }); }
    o.className = 'show'; o.innerHTML = `<div class="lu-rays"></div><div class="lu-box"><div class="lu-t">LEVEL UP!</div><div class="lu-n"><small>LEVEL</small><b>${top}</b></div><div class="lu-r"><small>レベル報酬</small>${ups.map(u => `<div><b>Lv.${u.L}</b> ${esc(lvRewardLabel(u.r))}</div>`).join('')}</div><button class="btn pri big" data-l="1">OK</button></div>`;
    AUDIO.levelUp(); try { if (typeof PACKFX !== 'undefined' && PACKFX.cv) { } } catch (e) { } },
  r_profile() {
    $('panelTitle').textContent = 'PROFILE'; const d = SAVE.data, st = d.stats, I = lvInfo(d.xp); this.show.setCar(SAVE.cur()); $('panelBody').classList.add('wide');
    const name = (window.DL_FB && DL_FB.profile && DL_FB.profile.name) || d.settings.nick || 'プレイヤー', ttl = d.title && ITEM_BY_ID[d.title];
    const tas = Object.entries(d.records.ta || {}).filter(([k, v]) => v && v.best).sort((a, b) => a[1].best - b[1].best);
    const achDoneN = ACHIEVEMENTS.filter(a => achDone(a, d)).length, titles = ITEMS.filter(i => i.type === 'title' && invHas(i.id));
    const partsOwned = Object.keys(d.inv || {}).filter(k => d.inv[k] > 0).length + (st.parts || 0);
    let h = `<div class="pf-head"><div class="pf-av">${esc(name[0] || 'P')}</div><div class="pf-m"><b class="noi18n">${esc(name)}</b>${ttl ? `<span class="ttl-badge">${esc(ttl.title)}</span>` : '<small>称号なし（インベントリで装着できます）</small>'}</div></div>`;
    h += lvBarHTML('lvbP', true);
    const box = (k, v) => `<div><span>${k}</span><b>${v}</b></div>`;
    h += `<div class="pf-grid">${box('総レース数', (st.races || 0).toLocaleString())}${box('完走数', (st.finishes || 0).toLocaleString())}${box('勝利数', (st.wins || 0).toLocaleString())}${box('総走行距離', ((st.totalDist || 0) / 1000).toFixed(1) + ' km')}${box('総ドリフトスコア', Math.round(st.driftTotal || 0).toLocaleString())}${box('最高速度', (st.topSpeed || 0) + ' km/h')}${box('所有車両', d.cars.length + ' 台')}${box('所有パーツ・アイテム', partsOwned.toLocaleString())}${box('実績', achDoneN + ' / ' + ACHIEVEMENTS.length)}${box('称号', titles.length + ' 個')}${box('プレイ時間', Math.floor((st.playSec || 0) / 3600) + '時間' + Math.floor((st.playSec || 0) / 60) % 60 + '分')}${box('ドラッグ自己ベスト', st.dragBest ? st.dragBest.toFixed(3) + ' 秒' : '—')}</div>`;
    h += `<div class="h3">ベストタイム（タイムアタック）</div>` + (tas.length ? `<div class="lb-list">${tas.slice(0, 8).map(([k, v]) => `<div class="lb-row"><span class="nm">${esc((MAP_BY_ID[k] || {}).jp || k)}</span><span class="vl">${fmtLap(v.best)}</span></div>`).join('')}</div>` : '<div class="note">まだ記録がありません。</div>');
    const recent = ACHIEVEMENTS.filter(a => d.achDone && d.achDone[a.id]).sort((a, b) => d.achDone[b.id] - d.achDone[a.id]).slice(0, 6);
    h += `<div class="h3">最近解除した実績</div>` + (recent.length ? `<div class="fr-list">${recent.map(a => `<div class="fr">${ICO('medal2', '#ffcf3d', 22)}<b>${esc(a.name)}</b><small>${new Date(d.achDone[a.id]).toLocaleDateString()}</small></div>`).join('')}</div>` : '<div class="note">まだありません。</div>') + `<div class="btns"><button class="btn" data-a="goAch">実績をすべて見る</button><button class="btn" data-a="goInvTitle">称号を変更</button></div>`;
    if (titles.length) h += `<div class="h3">持っている称号</div><div class="chips" style="flex-wrap:wrap">${titles.map(t => `<span class="chip2 ${d.title === t.id ? 'on' : ''}">${esc(t.title)}</span>`).join('')}</div>`;
    return h;
  },
  a_goAch() { this.open('ach'); }, a_goInvTitle() { this.invCat = 'title'; this.invOwn = 'own'; this.open('bag'); this.tab = 'items'; this.render(); }
});
// HOME・GARAGE にレベル表示
{ const _ms = UI.menuStatsHTML; UI.menuStatsHTML = function () { return lvBarHTML('lvbH') + (_ms ? _ms.call(this) : ''); };
  const _g = UI.r_garage; UI.r_garage = function (a) { return lvBarHTML('lvbG') + _g.call(this, a); };
  const _rt = UI.refreshTop; UI.refreshTop = function () { _rt.call(this); try { const I = lvInfo(SAVE.data.xp); $('tbLevel').textContent = 'Lv.' + I.lv; $('tbXp').style.width = (I.cur / I.need * 100) + '%'; const g = document.getElementById('btnGlv'); if (g) g.dataset.lv = 'Lv.' + garageLevel(SAVE.data).lv; } catch (e) { } }; }
// 実績の報酬にXPを付ける（未設定なら +150 XP）
{ const _c = UI.a_achClaim; UI.a_achClaim = function (id) { const d = SAVE.data, a = ACHIEVEMENTS.find(x => x.id === id); const was = d.achClaim && d.achClaim[id]; _c.call(this, id); if (a && !was && d.achClaim[id]) { addXp((a.rw && a.rw.xp) || 150, '実績'); this.showLvUps(); } };
  const _all = UI.a_achAll; UI.a_achAll = function () { const d = SAVE.data, before = ACHIEVEMENTS.filter(a => achDone(a, d) && !(d.achClaim || {})[a.id]); _all.call(this); addXp(before.reduce((s, a) => s + ((a.rw && a.rw.xp) || 150), 0), '実績'); this.showLvUps(); }; }
