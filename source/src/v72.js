// =====================================================================
// v72.js — v5.3
//   ・みんなが最もプレイしているコース（全プレイヤーに表示：コース選択の「人気コース」・人気順・人気バッジ）
//   ・開発者：プレイヤーのお金・ダイヤの一覧（PLAYERS タブ）
//   ・開発者：プレイヤーIDを追加してその人を開発者にできる（Googleログインなしでも可）
// =====================================================================

// ---------------- 人気コース ----------------
const POP = { c: {}, load() { try { this.c = JSON.parse(localStorage.getItem('dl_popMaps') || '{}') || {}; } catch (e) { this.c = {}; } },
  set(v) { this.c = v || {}; try { localStorage.setItem('dl_popMaps', JSON.stringify(this.c)); } catch (e) { } if (UI.screen === 'maps') { clearTimeout(this._r); this._r = setTimeout(() => { try { UI.render(); } catch (e) { } }, 300); } },
  n(id) { return +this.c[id] || 0; },
  top(list) { return list.filter(m => this.n(m.id) > 0).sort((a, b) => this.n(b.id) - this.n(a.id)); } };
POP.load();
const fbDb = () => (window.DL_FB && DL_FB.db && DL_FB.user) ? DL_FB.db() : null;
{ const _ln = UI.launch; UI.launch = function (cfg) { try { if (cfg && cfg.mapId && !cfg._retry && MAP_BY_ID[cfg.mapId]) { const db = fbDb(); if (db) db.ref('stats/maps/' + cfg.mapId).transaction(v => (v || 0) + 1).catch(() => { }); } } catch (e) { } return _ln.apply(this, arguments); }; }
const popPlays = n => n >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, '') + '万回' : n.toLocaleString() + '回';
{ const _rm = UI.r_maps; UI.r_maps = function (arg) { if (this.mapSort === 'pop' && !POP.top(MAPS).length) this.mapSort = 'new'; const sortPop = this.mapSort === 'pop'; if (sortPop) this.mapSort = 'name';
    let h; try { h = _rm.apply(this, arguments); } finally { if (sortPop) this.mapSort = 'pop'; }
    const vis = [...h.matchAll(/data-a="selMap" data-v="([^"]+)"/g)].map(x => MAP_BY_ID[x[1]]).filter(Boolean), top = POP.top(MAPS), rank = {}; top.forEach((m, i) => rank[m.id] = i + 1);
    // 並び替えボタンに「人気順」
    h = h.replace(/(<button class="[^"]*" data-a="mapSort" data-v="new">)/, `<button class="${sortPop ? 'on' : ''}" data-a="mapSort" data-v="pop">人気順</button>$1`); if (sortPop) h = h.replace(/<button class="on" data-a="mapSort" data-v="name">/, '<button class="" data-a="mapSort" data-v="name">');
    // 人気順に並べ替え
    if (sortPop) { const cards = [...h.matchAll(/<button class="mapcard[^"]*" data-a="selMap" data-v="([^"]+)">[\s\S]*?<\/button>(?=<button class="mapcard|<\/div>)/g)]; if (cards.length > 1) { const first = cards[0].index, last = cards[cards.length - 1].index + cards[cards.length - 1][0].length; const sorted = cards.slice().sort((a, b) => POP.n(b[1]) - POP.n(a[1])); h = h.slice(0, first) + sorted.map(c => c[0]).join('') + h.slice(last); } }
    // 人気バッジ（上位3つ）
    h = h.replace(/(<button class="mapcard[^"]*" data-a="selMap" data-v="([^"]+)"><canvas[^>]*><\/canvas>)/g, (s, a, id) => rank[id] && rank[id] <= 3 ? a + `<i class="map-pop r${rank[id]}">人気 ${rank[id]}位</i>` : s);
    // 人気コース TOP5（全プレイヤー共通）
    const T = top.filter(m => vis.includes(m)).slice(0, 5);
    if (T.length) { const strip = `<div class="pop-strip"><div class="pop-h"><b>みんなが走っている人気コース</b><small>全プレイヤーのプレイ回数</small></div><div class="pop-row">${T.map((m, i) => `<button class="pop-c ${m.id === this.sel ? 'sel' : ''}" data-a="selMap" data-v="${m.id}"><span class="pop-r r${i + 1}">${i + 1}</span><span class="pop-t"><b>${esc(m.jp)}</b><small>${popPlays(POP.n(m.id))}</small></span></button>`).join('')}</div></div>`;
      const at = h.indexOf('<div class="map-filter'); h = at >= 0 ? h.slice(0, at) + strip + h.slice(at) : strip + h; }
    // 選択中のコースのプレイ回数
    const m = MAP_BY_ID[this.sel]; if (m && POP.n(m.id)) h = h.replace('<div>難易度</div>', `<div>みんなのプレイ</div><div>${popPlays(POP.n(m.id))}${rank[m.id] ? `（人気 ${rank[m.id]}位）` : ''}</div><div>難易度</div>`);
    return h; }; }

// ---------------- 開発者の追加（admins/<uid>） ----------------
const DEVS = { list: {}, extra: false };
{ const _di = DEV.init; DEV.init = async function () { await _di.apply(this, arguments); if (this.owner) return; try { const db = fbDb(); if (!db) return; await DL_FB.ready(); const s = await db.ref('admins/' + DL_FB.user.uid).once('value'); if (s.val() === true) { this.owner = true; DEVS.extra = true; this.why = '追加された開発者アカウント'; try { UI.menuItems && UI.screen === 'menu' && UI.render(); } catch (e) { } } } catch (e) { } }; }
// 追加された開発者は Google ログインなしでも開発者メニューの操作ができる（サーバー側は admins/<uid> で許可）
{ const _ad = UI._adm; UI._adm = async function (fn, okMsg) { if (DEVS.extra && DEV.owner && window.DL_FB && DL_FB.user && DL_FB.user.isAnonymous) { try { await fn(); ADM.perm = true; this.toast(okMsg); } catch (e) { const perm = /permission/i.test((e && (e.code || e.message)) || ''); this.toast('失敗しました：' + (perm ? 'サーバーが拒否しました（ルール未更新か、開発者から外されています）' : ((e && e.message) || 'エラー'))); } return this.render(); } return _ad.apply(this, arguments); }; }
// 開発者ステータスはアカウントが変わったら確認し直す
setTimeout(() => { try { if (!DEV.owner) DEV.init(); } catch (e) { } }, 4000);

// ---------------- お金・ダイヤの一覧用（自分の分だけ wealth/<uid> に送る） ----------------
const WEALTH = { last: '', t: 0,
  snap() { const d = SAVE.data || {}, F = window.DL_FB; return { m: Math.round(d.money || 0), d: Math.round(d.diamonds || 0), nm: String((F && F.profile && F.profile.name) || (d.settings && d.settings.nick) || 'プレイヤー').slice(0, 24), cars: (d.cars || []).length, g: F && F.user && !F.user.isAnonymous ? 1 : 0 }; },
  push(force) { try { const db = fbDb(); if (!db) return; const s = this.snap(), k = JSON.stringify(s); if (!force && k === this.last) return; if (!force && Date.now() - this.t < 60000) return; this.last = k; this.t = Date.now(); s.t = firebase.database.ServerValue.TIMESTAMP; db.ref('wealth/' + DL_FB.user.uid).set(s).catch(() => { }); } catch (e) { } } };
setInterval(() => WEALTH.push(false), 20000); setTimeout(() => WEALTH.push(true), 8000);
document.addEventListener('visibilitychange', () => { if (document.hidden) WEALTH.push(false); });

// 人気コースを受け取る
{ const _st = ADM.start; ADM.start = async function () { const r = await _st.apply(this, arguments); try { if (window.DL_FB) { await DL_FB.ready(); DL_FB.db().ref('stats/maps').on('value', s => POP.set(s.val() || {}), () => { }); } } catch (e) { } return r; }; }

// ---------------- 開発者メニュー：PLAYERS / DEVELOPERS ----------------
const fmtAgo = t => { if (!t) return '-'; const s = (Date.now() - t) / 1000; return s < 3600 ? Math.max(1, Math.round(s / 60)) + '分前' : s < 86400 ? Math.round(s / 3600) + '時間前' : Math.round(s / 86400) + '日前'; };
{ const _dp = UI.r_devPanel; UI.r_devPanel = function () { let h = _dp.call(this); if (!DEV.owner) return h;
    h = h.replace('</div><div class="note">', `<button class="tab ${this.tab === 'players' ? 'on' : ''}" data-a="setTab" data-v="players">PLAYERS</button><button class="tab ${this.tab === 'devs' ? 'on' : ''}" data-a="setTab" data-v="devs">DEVELOPERS</button></div><div class="note">`);
    if (this.tab === 'players') { const W = this.wl, q = (this.wlQ || '').toLowerCase(), so = this.wlS || 'm';
      let b = `<div class="note">プレイヤーが持っているお金・ダイヤです（各プレイヤーのゲームが開いている時に、自動で最新の値が送られます）。この画面は開発者にしか見えません。</div><div class="btns"><button class="btn pri" data-a="wlLoad">${W ? '最新にする' : '読み込む'}</button></div>`;
      if (W === 'err') b += `<div class="note"><b>読み込めませんでした。</b>Firebase のルールを更新したか確認してください。</div>`;
      else if (W) { const all = Object.entries(W).map(([uid, v]) => Object.assign({ uid }, v || {})), L = all.filter(x => !q || x.uid.toLowerCase().includes(q) || String(x.nm || '').toLowerCase().includes(q)).sort((a, b) => so === 't' ? (b.t || 0) - (a.t || 0) : (b[so] || 0) - (a[so] || 0));
        const sm = all.reduce((a, x) => a + (x.m || 0), 0), sd = all.reduce((a, x) => a + (x.d || 0), 0);
        b += `<div class="wl-sum"><div><small>プレイヤー</small><b>${all.length.toLocaleString()}人</b></div><div><small>お金の合計</small><b>${yen(sm)}</b></div><div><small>ダイヤの合計</small><b>${SICO.gem(16)} ${sd.toLocaleString()}</b></div><div><small>平均</small><b>${yen(Math.round(sm / (all.length || 1)))} ・ ${SICO.gem(14)} ${Math.round(sd / (all.length || 1)).toLocaleString()}</b></div></div>
          <div class="row"><input id="wlQ" placeholder="名前・プレイヤーIDで検索" value="${esc(this.wlQ || '')}" data-in="wlQ"><select data-in="wlS">${[['m', 'お金が多い順'], ['d', 'ダイヤが多い順'], ['t', '最近遊んだ順'], ['cars', '車が多い順']].map(([k, l]) => `<option value="${k}" ${so === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="wl-tbl"><div class="wl-r wl-hd"><span>#</span><span>プレイヤー</span><span>お金</span><span>ダイヤ</span><span>車</span><span>更新</span></div>${L.slice(0, 300).map((x, i) => `<div class="wl-r"><span>${i + 1}</span><span><b class="noi18n">${esc(x.nm || '?')}</b><small class="noi18n">${esc(x.uid)}${x.g ? ' ・ Google' : ''}${DEVS.list[x.uid] ? ' ・ 開発者' : ''}</small></span><span>${yen(x.m || 0)}</span><span>${SICO.gem(13)} ${(x.d || 0).toLocaleString()}</span><span>${x.cars || 0}</span><span>${fmtAgo(x.t)}</span></div>`).join('') || '<div class="note">見つかりません</div>'}</div>${L.length > 300 ? `<div class="note">上位300人を表示しています（全${L.length}人）</div>` : ''}`; }
      return h + `<div class="cu">${b}</div>`; }
    if (this.tab === 'devs') { const me = window.DL_FB && DL_FB.user ? DL_FB.user.uid : '', D = this.devL;
      let b = `<div class="note">プレイヤーIDを追加すると、その人が<b>開発者</b>になります（Googleにログインしていないプレイヤーでも可）。追加された人はゲームを開き直すと「開発者メニュー」が使えるようになります。プレイヤーIDは、その人の「プロフィール」画面に表示されています（先頭の10文字だけでもOK）。</div>
        <div class="cu-form"><div class="row"><label>プレイヤーID</label><input id="dvId" placeholder="例：Abc123XyZ9…" maxlength="40"><input id="dvMemo" placeholder="メモ（名前など・任意）" maxlength="24"><button class="btn pri" data-a="dvAdd">開発者にする</button></div><small class="set-note">注意：Googleにログインしていないプレイヤーは、ブラウザのデータを消すとプレイヤーIDが変わります（そのときは新しいIDを追加し直してください）。</small></div>
        <div class="row"><label>あなたのID</label><b class="noi18n" style="user-select:all">${esc(me)}</b></div><div class="btns"><button class="btn" data-a="dvLoad">${D ? '最新にする' : '開発者の一覧を読み込む'}</button></div>`;
      if (D === 'err') b += `<div class="note"><b>読み込めませんでした。</b>Firebase のルールを更新したか確認してください。</div>`;
      else if (D) { const L = Object.entries(D).filter(([, v]) => v === true), M = this.devM || {}; b += `<div class="h3">追加した開発者（${L.length}）</div><div class="cu-list">${L.map(([uid]) => `<div class="cu-it"><span class="cu-pv">${ICO('globe', '#ffcf3d', 22)}</span><b class="noi18n">${esc((M[uid] && M[uid].memo) || (this.wl && this.wl[uid] && this.wl[uid].nm) || 'プレイヤー')}</b><small class="noi18n">${esc(uid)}${uid === me ? ' ・ あなた' : ''}</small><div><button class="btn" data-a="dvDel" data-v="${uid}">外す</button></div></div>`).join('') || '<div class="note">まだいません</div>'}</div><div class="note">メインの開発者アカウント（Google）は外せません。</div>`; }
      return h + `<div class="cu">${b}</div>`; }
    return h; }; }
Object.assign(UI, {
  async a_wlLoad() { const db = fbDb(); if (!db) return this.toast('オフラインです'); try { const s = await db.ref('wealth').once('value'); this.wl = s.val() || {}; } catch (e) { this.wl = 'err'; } try { const s = await db.ref('admins').once('value'); DEVS.list = s.val() || {}; } catch (e) { } this.render(); },
  in_wlQ(v) { this.wlQ = v; clearTimeout(this._wq); this._wq = setTimeout(() => { this.render(); const el = $('wlQ'); if (el) { el.focus(); el.setSelectionRange(v.length, v.length); } }, 350); },
  in_wlS(v) { this.wlS = v; this.render(); },
  async a_dvLoad() { const db = fbDb(); if (!db) return this.toast('オフラインです'); try { const s = await db.ref('admins').once('value'); this.devL = DEVS.list = s.val() || {}; const m = await db.ref('adminMeta').once('value'); this.devM = m.val() || {}; } catch (e) { if (this.devL == null) this.devL = 'err'; } this.render(); },
  async a_dvAdd() { const db = fbDb(); if (!db) return this.toast('オフラインです'); let id = (($('dvId') || {}).value || '').trim(); const memo = (($('dvMemo') || {}).value || '').trim(); if (!id) return this.toast('プレイヤーIDを入れてください'); if (!/^[A-Za-z0-9_-]{6,40}$/.test(id)) return this.toast('プレイヤーIDの形が正しくありません');
    if (id.length < 20) { const found = new Set(); try { const w = (await db.ref('wealth').orderByKey().startAt(id).endAt(id + '').limitToFirst(3).once('value')).val() || {}; Object.keys(w).forEach(k => found.add(k)); } catch (e) { } try { const p = (await db.ref('profiles').orderByKey().startAt(id).endAt(id + '').limitToFirst(3).once('value')).val() || {}; Object.keys(p).forEach(k => found.add(k)); } catch (e) { }
      if (found.size === 0) return this.toast('そのIDのプレイヤーが見つかりません（相手にゲームを一度開いてもらってください）'); if (found.size > 1) return this.toast('同じ文字で始まるプレイヤーが複数います。もっと長くIDを入れてください'); id = [...found][0]; }
    this._adm(async () => { await ADM.write('admins/' + id, true); if (memo) await ADM.write('adminMeta/' + id, { memo, at: Date.now() }); await ADM.log('dev-add', id + (memo ? ' ' + memo : '')); const s = await db.ref('admins').once('value'); this.devL = DEVS.list = s.val() || {}; const m = await db.ref('adminMeta').once('value'); this.devM = m.val() || {}; }, '開発者に追加しました（相手がゲームを開き直すと使えます）'); },
  a_dvDel(id) { if (!confirm('この人を開発者から外しますか？')) return; const db = fbDb(); this._adm(async () => { await ADM.write('admins/' + id, null); await ADM.write('adminMeta/' + id, null); await ADM.log('dev-remove', id); const s = await db.ref('admins').once('value'); this.devL = DEVS.list = s.val() || {}; }, '開発者から外しました'); },
  a_copyPid() { const F = window.DL_FB, id = F && F.user ? F.user.uid : (SAVE.data.pid || ''); try { navigator.clipboard.writeText(id).then(() => this.toast('プレイヤーIDをコピーしました'), () => this.toast(id)); } catch (e) { this.toast(id); } }
});
// プロフィールのプレイヤーIDは全部表示＋コピー
{ const _ph = UI.r_profile; UI.r_profile = function () { const r = _ph.apply(this, arguments); setTimeout(() => { const el = document.querySelector('.ph-id'); const F = window.DL_FB; if (el && F && F.user && !el.dataset.full) { el.dataset.full = 1; el.textContent = F.user.uid; el.insertAdjacentHTML('afterend', '<button class="btn ph-cp" data-a="copyPid">IDをコピー</button>'); } }, 0); return r; }; }
window.__DLX = Object.assign(window.__DLX || {}, { POP, WEALTH, DEVS });
