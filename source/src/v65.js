// =====================================================================
// v65.js — v4.6：車を選ぶ画面をカードのグリッドに（ガレージ・レースの車選択・カーショップ）
//          プロフィールハブ（プロフィール／記録／新コンテンツ／お知らせ）・受け取り忘れの自動通知
//          開発者からのギフト・お詫び・お知らせ（メッセージ＋写真は任意）
// =====================================================================
// ---------------- 車カード（グリッド） ----------------
const carPR = st => Math.round((st.power || 0) * 1.6 + (st.top || 0) * 3 + (st.handling || 0) * 9 + (st.drift || 0) * 4 + (st.brake || 0) * 4);
UI.cfCls = UI.cfCls || 'all'; UI.cfSort = UI.cfSort || 'def';
function carTile(o) { const cd = o.car, S = o.spec && o.spec.stats ? o.spec.stats : (computeSpec(cd).stats || {}), pr = carPR(S), prMax = carPR(Object.assign({}, S, { power: (S.power || 0) * 1.35, top: (S.top || 0) * 1.12, handling: Math.min(100, (S.handling || 0) * 1.1) }));
  const s = carStars(cd.id), mx = carMaxStars(cd), sc = starCards(cd.id), need = s < mx ? STAR_NEED[s + 1] : 0, k = carClass(cd);
  return `<button class="ct ${o.sel ? 'sel' : ''} ${o.locked ? 'lock' : ''} cls-bg-${k}" data-a="${o.act}" data-v="${esc(o.v)}">
    <span class="ct-pr"><b>${pr.toLocaleString()}</b><em>/${(o.own ? prMax : pr).toLocaleString()}</em></span>${o.tag ? `<span class="ct-tag ${o.tagCls || ''}">${o.tag}</span>` : ''}
    <span class="ct-stars">${Array.from({ length: mx }, (_, i) => `<i class="${i < s && o.own ? 'on' : ''}">★</i>`).join('')}</span>
    <span class="ct-car">${packCarSvg(cd.id, 150)}</span>
    <span class="ct-bp"><small>${o.own ? '車両カード' : 'クラス'}</small><span class="ct-bpi">${packCarSvg(cd.id, 62)}</span><b class="cls cls-${k}">${k}</b>${o.own && need ? `<em class="ct-bpn">${sc}/${need}</em>` : ''}<span class="ct-bpm">${esc(cd.maker)}<br><b>${esc(cd.name)}</b></span></span>
    <span class="ct-nm"><small>${esc(cd.maker)}</small><b>${esc(cd.name)}</b></span><span class="ct-note">${o.note || ''}</span>${o.locked ? `<span class="ct-lk">${ICO('lock', '#fff', 16)}<b>${esc(o.lockText || 'ロック中')}</b></span>` : ''}</button>`; }
function ctFilter(list, getCar) { const c = UI.cfCls; let L = list.filter(x => c === 'all' || carClass(getCar(x)) === c);
  if (UI.cfSort === 'ps') L = L.slice().sort((a, b) => getCar(b).hp - getCar(a).hp); else if (UI.cfSort === 'cls') L = L.slice().sort((a, b) => CLS.indexOf(carClass(getCar(b))) - CLS.indexOf(carClass(getCar(a)))); else if (UI.cfSort === 'name') L = L.slice().sort((a, b) => getCar(a).name.localeCompare(getCar(b).name)); return L; }
const ctBar = n => `<div class="ct-bar"><span class="ct-cnt">${n} 台</span><button class="ct-fb" data-a="ctSort">${ICO('flag', '#111', 16)}<span>${{ def: '標準', ps: '馬力順', cls: 'クラス順', name: '名前順' }[UI.cfSort]}</span></button><button class="ct-fb" data-a="ctCls"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 4h18l-7 9v6l-4 2v-8z" fill="#111"/></svg><span>${UI.cfCls === 'all' ? 'すべてのクラス' : UI.cfCls + ' クラス'}</span><b>›</b></button></div>`;
Object.assign(UI, { a_ctSort() { const L = ['def', 'ps', 'cls', 'name']; this.cfSort = L[(L.indexOf(this.cfSort) + 1) % L.length]; this.render(); }, a_ctCls() { const L = ['all'].concat(CLS.slice().reverse()); this.cfCls = L[(L.indexOf(this.cfCls) + 1) % L.length]; this.render(); } });
const ownedTiles = (sel, act) => { const d = SAVE.data, L = ctFilter(UI.sortedCars(), c => CAR_BY_ID[c.id]).filter(c => CAR_BY_ID[c.id]);
  return ctBar(L.length) + `<div class="ct-grid">${L.map(c => { const cd = CAR_BY_ID[c.id], tuned = c.tune && c.tune.engine && c.tune.engine !== 'stock'; return carTile({ car: cd, spec: UI.instSpec(c), own: 1, sel: c.uid === sel, act, v: c.uid, tag: c.uid === d.current ? '使用中' : c.fav ? '★ お気に入り' : '', tagCls: c.uid === d.current ? 'cur' : 'fav', note: tuned ? 'チューン済み' : '' }); }).join('')}</div>`; };
// ガレージ
{ const _g = UI.r_garage; UI.r_garage = function () { let h = _g.apply(this, arguments); if (this.gTab === 'parts') return h; const i = h.indexOf('<div class="list" style="margin-top:6px">'); if (i < 0) return h; const j = h.indexOf('</div><div class="h3">', i); if (j < 0) return h;
    $('panelBody').classList.add('wide'); return h.slice(0, i) + ownedTiles(this.sel, 'selG') + h.slice(j + 6); }; }
// レースの車選択
{ const _c = UI.r_carsel; UI.r_carsel = function (cfg) { let h = _c.apply(this, arguments); const i = h.indexOf('<div class="ws-list">'); if (i < 0) return h; let j = h.indexOf('<div class="ws-plate">', i); if (j < 0) return h; j = h.lastIndexOf('</div>', j);
    return h.slice(0, i) + `<div class="ws-list ct-wrap">${ownedTiles(this.sel || SAVE.data.current, 'selCarSel')}</div>` + h.slice(j + 6); }; }
// カーショップ
{ const _s = UI.r_shop; UI.r_shop = function () { let h = _s.apply(this, arguments); if (this.tab === 'PARTS') return h; const i = h.indexOf('<div class="list" style="margin-top:6px">'); if (i < 0) return h; const j = h.indexOf('</div><div class="h3">', i); if (j < 0) return h;
    const L = ctFilter(CARS.filter(c => c.maker === this.tab), c => c); $('panelBody').classList.add('wide');
    const grid = ctBar(L.length) + `<div class="ct-grid">${L.map(c => { const own = SAVE.data.cars.filter(x => x.id === c.id).length, ok = carBuyable(c); return carTile({ car: c, sel: c.id === this.sel, act: 'selShop', v: c.id, tag: own ? `所有中${own > 1 ? ' ×' + own : ''}` : '', tagCls: 'cur', note: ok ? yen(c.price) : '', locked: !ok && !own, lockText: carLockText(c) }); }).join('')}</div>`;
    return h.slice(0, i) + grid + h.slice(j + 6); }; }

// =====================================================================
// お知らせ（受け取り忘れの自動通知＋開発者からのメッセージ）
// =====================================================================
function autoNotices() { const d = SAVE.data, N = [], add = (id, ic, col, title, text, go, n) => N.push({ id, ic, col, title, text, go, n: n || 1, auto: 1 });
  try { const p = giftsPending().filter(g => !g.kind || g.kind === 'gift'); if (p.length) add('gift', 'gift', '#ff6a8a', 'プレゼントが届いています', `${p.length}件のプレゼントがまだ受け取られていません。`, 'inbox', p.length); } catch (e) { }
  try { const P = passData(), L = passLevel(), R = passRewards(curSeason()); let n = 0; for (let k = 1; k <= L; k++) { if (!P.cf.includes(k) && R.F[k - 1]) n++; if (P.prem && !P.cp.includes(k) && R.P[k - 1]) n++; } if (n) add('pass', 'trophy', '#ffcf3d', 'レジェンズパスの報酬', `受け取っていない報酬が ${n} 個あります。`, 'pass', n); } catch (e) { }
  try { const P = passData(), m = passMissions().filter(x => x.ok && !P.mdone[x.id]); if (m.length) add('pmis', 'flag', '#ffcf3d', 'パスミッション達成', `達成したミッションが ${m.length} 個あります。受け取ってパスを進めよう！`, 'pass', m.length); } catch (e) { }
  try { d.achClaim = d.achClaim || {}; const n = ACHIEVEMENTS.filter(a => achDone(a, d) && !d.achClaim[a.id]).length; if (n) add('ach', 'trophy', '#ffcf3d', '実績の報酬', `達成した実績の報酬が ${n} 個受け取られていません。`, 'ach', n); } catch (e) { }
  try { const D = devData(), L = dailyEvents(); if (L.every(e => D.done[e.id]) && !D.bonus) add('devb', 'calendar', '#2fdc7a', 'デイリーチャレンジのボーナス', '3つすべてクリアのボーナス（ダイヤ ×30）を受け取ろう。', 'deventOld'); } catch (e) { }
  try { d.stkRw = d.stkRw || []; const pct = bookPct(), n = BOOK_RW.filter(([p]) => pct >= p && !d.stkRw.includes(p)).length; if (n) add('sticker', 'sticker', '#ff6ae8', 'ステッカー帳の報酬', `集めた割合の報酬が ${n} 個あります。`, 'stkbook', n); } catch (e) { }
  try { const n = Object.keys(FGIFT.inbox || {}).length; if (n) add('fg', 'gift', '#5ad1ff', 'フレンドからのプレゼント', `フレンドから ${n} 件のプレゼントが届いています。`, 'friends', n); } catch (e) { }
  try { const u = unopened(), n = Object.values(u.packs || {}).reduce((a, b) => a + b, 0) + Object.values(u.boxes || {}).reduce((a, b) => a + b, 0); if (n) add('unop', 'collection', '#ff8a2a', '未開封のパック・BOX', `開けていないパック・BOXが ${n} 個あります（ストア → 未開封）。`, 'unopened', n); } catch (e) { }
  try { const A = adventInfo(); if (A.day > 0 && !d.advent.open.includes(A.day)) add('adv', 'calendar', '#ffd76a', 'アドベントカレンダー', `今日（${A.day}日目）の扉がまだ開いていません。`, 'advent'); } catch (e) { }
  try { const ec = Object.keys(CAR_CARDS).filter(id => carCards(id) >= CAR_CARDS[id].need && !d.cars.some(c => c.id === id)).length; if (ec) add('cc', 'carSide', '#3a9aff', '車と交換できます', `カードが集まって交換できる車が ${ec} 台あります。`, 'cctrade', ec); } catch (e) { }
  return N; }
const dmList = () => { try { return giftList(); } catch (e) { return []; } };
const inboxUnread = () => { const d = SAVE.data; d.dmRead = d.dmRead || {}; return autoNotices().length + dmList().filter(g => !d.giftGot[g.id] && !d.dmRead[g.id]).length; };
const DM_KIND = { gift: ['ギフト', '#ff6a8a'], apology: ['お詫び', '#ffb400'], notice: ['お知らせ', '#4ac8ff'] };

// ---------------- プロフィールハブ ----------------
UI.phTab = UI.phTab || 'profile';
{ const _rp = UI.r_profile; UI.r_profile = function () { const tab = this.phTab || 'profile', n = inboxUnread(); const base = _rp.apply(this, arguments); $('panelTitle').textContent = 'PROFILE';
    const tabs = `<div class="ph-tabs">${[['profile', 'プレイヤープロフィール'], ['stats', '記録'], ['new', '新コンテンツ'], ['inbox', 'お知らせ']].map(([k, l]) => `<button class="${k === tab ? 'on' : ''}" data-a="phTab" data-v="${k}">${l}${k === 'inbox' && n ? `<i>${n}</i>` : ''}</button>`).join('')}</div>`;
    if (tab === 'profile') return tabs + this.phHero() + base; if (tab === 'stats') return tabs + this.phStats(); if (tab === 'new') return tabs + this.phNew(); return tabs + this.phInbox(); }; }
Object.assign(UI, {
  a_phTab(t) { this.phTab = t; AUDIO.nav && AUDIO.nav(); this.render(); },
  phHero() { const d = SAVE.data, F = window.DL_FB, name = (F && F.profile && F.profile.name) || d.settings.nick || 'プレイヤー', uid = (F && F.user && F.user.uid) || d.pid || (d.pid = 'u' + Math.random().toString(36).slice(2, 8)); const I = lvInfo(d.xp), G = garageLevel(d), on = !!(F && F.user);
    d.pfEmo = (d.pfEmo || ['e1', 'e2', 'e3', 'e4', 'e5']).filter(id => EMO_BY[id]); const c = (typeof SOC !== 'undefined' && SOC.clan) || null, mem = c ? Object.keys(c.members || {}).length : 0;
    const gNext = typeof garageNeed === 'function' ? garageNeed((G.lv || G) + 1) : 0, gPts = G.pts !== undefined ? G.pts : 0;
    return `<div class="ph-hero"><div class="ph-l"><span class="ph-on ${on ? '' : 'off'}">${on ? 'オンライン' : 'ゲスト'}</span><b class="ph-nm noi18n">${esc(name)}</b><div class="ph-line"></div><small>プレイヤーID</small><b class="ph-id noi18n">${esc(String(uid).slice(0, 10))}</b>
      <div class="ph-lv"><div><small>プレイヤーレベル</small><b>${ICO('trophy', '#ffcf3d', 22)} ${I.lv}</b></div><div><small>ガレージレベル</small><b>Lv${G.lv || G}</b>${gNext ? `<span class="ph-gbar"><i style="width:${Math.min(100, gPts / gNext * 100)}%"></i><em>${gPts.toLocaleString()}/${gNext.toLocaleString()}</em></span>` : ''}</div></div>
      <small>お気に入りの絵文字</small><div class="ph-emo">${d.pfEmo.map(id => emoSvg(id, 34)).join('')}</div></div>
      <div class="ph-r"><div class="ph-start"><span>週間ランキングに参加して<br>ライバルと競おう！</span><button class="ph-wb" data-a="phGo" data-v="lb">スタート</button></div>
      <div class="ph-clan">${c ? `<div class="ph-ct"><small>クラン名</small><b class="noi18n">${esc(c.name)}</b><span class="noi18n">${esc(c.ownerName || '')}</span></div><div class="ph-cs"><div><small>メンバー</small><b>${mem}</b></div><div><small>ロケーション</small><b class="ph-jp"><i></i></b></div><div><small>公開</small><b>${c.open ? '公開' : 'コード'}</b></div></div>` : `<div class="ph-ct"><small>クラン</small><b>未所属</b><span>クランに入って仲間と走ろう</span></div>`}${ICO('shield', '#2fdc7a', 70)}</div></div></div>
      <div class="ph-btns"><button class="ph-wb" data-a="phGo" data-v="clan">クラン</button><button class="ph-wb" data-a="phEmo">絵文字の編集</button><button class="ph-yb" data-a="phGo" data-v="account">名前の編集</button></div>`; },
  a_phGo(k) { if (k === 'lb') return this.open('lb'); if (k === 'cctrade') { this.stTab = 'packs'; this.open('store'); return setTimeout(() => { const n = document.querySelectorAll('.vp[data-vp="packs"] .vp-page').length; if (n) this.a_vpGo('packs:=' + (n - 1)); }, 300); } if (k === 'unopened') { this.stTab = 'inv'; return this.open('store'); } if (k === 'inbox') { this.phTab = 'inbox'; return this.render(); } this.open(k); },
  a_phEmo() { const d = SAVE.data, own = EMO.filter(e => emoOwned(e.id)); this._emoSel = (d.pfEmo || []).slice();
    this.modal(`<h2>絵文字の編集</h2><div class="note">プロフィールに表示する絵文字を5つまで選べます（持っている絵文字のみ）。</div><div class="ph-emosel">${own.map(e => `<button class="${this._emoSel.includes(e.id) ? 'on' : ''}" data-a="phEmoT" data-v="${e.id}">${emoSvg(e.id, 36)}</button>`).join('')}</div><div class="btns"><button class="btn" data-a="closeModal">やめる</button><button class="btn pri" data-a="phEmoOk">決定</button></div>`); },
  a_phEmoT(id) { const s = this._emoSel, i = s.indexOf(id); if (i >= 0) s.splice(i, 1); else { if (s.length >= 5) s.shift(); s.push(id); } document.querySelectorAll('.ph-emosel button').forEach(b => b.classList.toggle('on', s.includes(b.dataset.v))); },
  a_phEmoOk() { SAVE.data.pfEmo = this._emoSel.slice(0, 5); SAVE.save(); this.closeModal(); this.render(); },
  phStats() { const d = SAVE.data, st = d.stats || {}, row = (l, v) => `<div class="ph-st"><small>${l}</small><b>${v}</b></div>`;
    return `<div class="ph-stats">${row('レース数', (st.races || 0).toLocaleString())}${row('勝利数', (st.wins || 0).toLocaleString())}${row('走行距離', ((st.dist || 0) / 1000).toFixed(1) + ' km')}${row('最高速度', Math.round(st.topSpeed || st.maxSpeed || 0) + ' km/h')}${row('ドリフト合計', (st.drift || 0).toLocaleString() + ' 点')}${row('所有台数', d.cars.length + ' 台')}${row('アイテム', Object.keys(d.inv || {}).filter(k => d.inv[k] > 0).length.toLocaleString() + ' 個')}${row('実績', ACHIEVEMENTS.filter(a => achDone(a, d)).length + ' / ' + ACHIEVEMENTS.length)}${row('ステッカー帳', bookPct() + '%')}${row('プレイ時間', Math.floor((st.playSec || st.playTime || 0) / 3600) + ' 時間')}</div>`; },
  phNew() { const L = (typeof CHANGELOG !== 'undefined' ? CHANGELOG : []).slice(0, 4); return `<div class="ph-new">${L.map((c, i) => `<div class="ph-nc ${i ? '' : 'top'}"><span class="ph-nv">v${esc(c.v)}${i ? '' : ' NEW'}</span><b>${esc(c.title)}</b><ul>${c.items.slice(0, i ? 3 : 9).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div>`; },
  phInbox() { const d = SAVE.data, A = autoNotices(), M = dmList(); d.dmRead = d.dmRead || {}; const t = SRV.now();
    let h = `<div class="ph-ib"><div class="h3">受け取り忘れのお知らせ（自動）</div>`;
    h += A.length ? A.map(n => `<div class="ib-row auto" style="--ic:${n.col}"><span class="ib-ic">${ICO(n.ic, n.col, 24)}</span><div class="ib-tx"><b>${esc(n.title)}</b><small>${esc(n.text)}</small></div><button class="btn pri" data-a="phGo" data-v="${n.go}">受け取りへ</button></div>`).join('') : `<div class="note">受け取り忘れはありません。</div>`;
    h += `<div class="h3">運営からのメッセージ</div>`;
    h += M.length ? M.map(g => { const K = DM_KIND[g.kind || 'gift'] || DM_KIND.gift, items = giftItemsNorm(g.items).filter(giftValid), got = d.giftGot[g.id], unread = !got && !d.dmRead[g.id];
      return `<div class="ib-msg ${unread ? 'unread' : ''} ${got ? 'got' : ''}" style="--ic:${K[1]}"><div class="ib-mh"><span class="ib-kind">${K[0]}</span><b>${esc(g.title || '')}</b><small>${esc(g.from || 'DRIFT LEGENDS 運営')} ・ ${new Date(g.start).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })}</small></div>${g.img ? `<img class="ib-img" src="${esc(g.img)}" alt="">` : ''}<p>${esc(g.msg || '')}</p>${items.length ? `<div class="gf-items sm">${items.map(r => `<span>${rwArt(r, 22)}${esc(rwLabel(r))}</span>`).join('')}</div>` : ''}<div class="ib-f"><em>期限：${new Date(g.end).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</em>${items.length ? (got ? '<span class="tag cur">受取済み</span>' : `<button class="btn pri" data-a="giftClaim" data-v="${esc(g.id)}">受け取る</button>`) : (d.dmRead[g.id] ? '<span class="tag">既読</span>' : `<button class="btn" data-a="dmRead" data-v="${esc(g.id)}">既読にする</button>`)}</div></div>`; }).join('') : `<div class="note">メッセージはありません。</div>`;
    return h + '</div>'; },
  a_dmRead(id) { const d = SAVE.data; d.dmRead = d.dmRead || {}; d.dmRead[id] = Date.now(); SAVE.save(); this.render(); this.phBadge(); },
  phBadge() { const b = $('btnProfile'); if (!b) return; const n = inboxUnread(); let i = b.querySelector('.ph-badge'); if (!n) { if (i) i.remove(); return; } if (!i) { i = document.createElement('i'); i.className = 'ph-badge'; b.appendChild(i); } i.textContent = n > 99 ? '99+' : n; }
});
{ const _gc = UI.a_giftClaim; UI.a_giftClaim = function (id) { const r = _gc.apply(this, arguments); if (this.screen === 'profile') this.render(); this.phBadge(); return r; }; }
// 「お知らせ」タイプのメッセージ（アイテムなし）はポップアップで受け取りにしない
{ const _gp = UI.giftPopup; UI.giftPopup = function (g) { const items = giftItemsNorm(g.items).filter(giftValid); if (!items.length) { this.phTab = 'inbox'; this.toast((DM_KIND[g.kind] || DM_KIND.notice)[0] + '：' + (g.title || '') + '（プロフィール → お知らせ）'); return; } return _gp.apply(this, arguments); }; }
setInterval(() => { try { UI.phBadge(); } catch (e) { } }, 4000);
BNAV_OF.lb = BNAV_OF.lb || 'profile';

// ---------------- 開発者：ギフト・お詫び・お知らせ（写真は任意） ----------------
{ const _dp = UI.r_devPanel; UI.r_devPanel = function () { let h = _dp.call(this); if (!DEV.owner || !window.DL_FB || this.tab !== 'gift') return h; const kind = this.gfKind || 'gift';
    const kinds = `<div class="dev-kind"><b>種類</b>${Object.entries(DM_KIND).map(([k, [l, c]]) => `<button class="tab ${k === kind ? 'on' : ''}" data-a="gfKind" data-v="${k}" style="--kc:${c}">${l}</button>`).join('')}</div>`;
    const img = `<div class="dev-img"><b>写真（つけなくてもOK）</b>${this.gfImg ? `<img src="${this.gfImg}" alt=""><button class="btn" data-a="gfImgDel">写真を外す</button>` : `<label class="btn">写真を選ぶ<input type="file" accept="image/*" data-in="gfImgPick" style="display:none"></label>`}<small>自動で小さく（最大640px）してから送ります。</small></div>`;
    const DEF = { gift: ['プレゼントをお届けします！', 'いつも遊んでくれてありがとう！'], apology: ['不具合のお詫び', 'ご迷惑をおかけして申し訳ありません。お詫びとしてプレゼントをお届けします。'], notice: ['お知らせ', ''] }[kind];
    h = h.replace('value="プレゼントをお届けします！"', `value="${esc(this.gfT0 || DEF[0])}"`).replace('>いつも遊んでくれてありがとう！</textarea>', `>${esc(this.gfM0 !== undefined ? this.gfM0 : DEF[1])}</textarea>`);
    h = h.replace('<div class="dev-form">', `<div class="dev-form">${kinds}${img}`);
    if (kind === 'notice') h = h.replace('<div class="h3">配布するもの</div>', '<div class="h3">配布するもの（お知らせはアイテムなしでも送れます）</div>');
    return h.replace('全プレイヤーに配布する', kind === 'gift' ? '全プレイヤーにギフトを送る' : kind === 'apology' ? '全プレイヤーにお詫びを送る' : '全プレイヤーにお知らせを送る'); }; }
Object.assign(UI, {
  a_gfKind(k) { this.gfRows && this.gfRead && this.gfRead(); this.gfKind = k; this.gfT0 = ''; this.gfM0 = undefined; this.render(); },
  a_gfImgDel() { this.gfKeep(); this.gfImg = ''; this.render(); },
  gfKeep() { this.gfRows && this.gfRead && this.gfRead(); const t = $('gfT'), m = $('gfM'); if (t) this.gfT0 = t.value; if (m) this.gfM0 = m.value; },
  in_gfImgPick(v, el) { const f = el.files && el.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, 640 / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = Math.round(im.width * s); cv.height = Math.round(im.height * s); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); this.gfKeep(); this.gfImg = cv.toDataURL('image/jpeg', 0.72); this.render(); }; im.src = rd.result; }; rd.readAsDataURL(f); }
});
let GF_ALLOW0 = false, GF_PEND = null;
{ const _w = ADM.write; ADM.write = async function (path, val, mode) { if (GF_PEND && val && typeof val === 'object' && /^admin\/gifts$/.test(path)) { const P = GF_PEND; GF_PEND = null; val.kind = P.kind; if (P.img) val.img = P.img; if (P.kind === 'notice' && (!val.items || !val.items.length)) val.items = [{ k: 'money', a: 0, n: 1 }]; } return (ADM._raw || _w).apply(this, arguments); }; }
{ const _send = UI.a_gfSend; UI.a_gfSend = function () { const kind = this.gfKind || 'gift'; GF_ALLOW0 = kind === 'notice'; if (kind === 'notice') { this.gfRead(); if (!giftItemsNorm(this.gfRows).length) this.gfRows = [['money', 0]]; }
    GF_PEND = { kind, img: this.gfImg || '' }; try { return _send.apply(this, arguments); } finally { GF_ALLOW0 = false; setTimeout(() => { GF_PEND = null; }, 4000); this.gfImg = ''; } }; }
// giftItemsNorm は金額0を除外（お知らせ用のダミー）
{ const _gn = giftItemsNorm; giftItemsNorm = function (items) { if (GF_ALLOW0) return _gn(items); return _gn(items).filter(r => !((r[0] === 'money' || r[0] === 'dia') && !r[1])); }; }
window.__DLX = Object.assign(window.__DLX || {}, { autoNotices, inboxUnread, carTile });
