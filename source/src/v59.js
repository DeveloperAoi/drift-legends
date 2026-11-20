// =====================================================================
// v59.js — v4.0：フレンド・クランメンバーの免許証とプロフィールを見られるように
// 自分の公開カードを profiles/{uid}/card に保存（本人だけ書き込み可・ログイン中のプレイヤーが読み取り可）
// =====================================================================
function myCard() { const d = SAVE.data, p = profData(), L = licData(), ttl = d.title && ITEM_BY_ID[d.title], inst = SAVE.cur(), st = d.stats || {};
  const fav = L.fav && CAR_BY_ID[L.fav] ? L.fav : inst.id;
  return { v: 1, name: String((window.DL_FB && DL_FB.profile && DL_FB.profile.name) || d.settings.nick || 'プレイヤー').slice(0, 20), lv: lvInfo(d.xp).lv, glv: garageLevel(d).lv,
    title: ttl ? String(ttl.title || '').slice(0, 24) : '', bio: String(p.bio || '').slice(0, 60),
    prof: { icon: p.icon || '', frame: p.frame || '', effect: p.effect || '', banner: p.banner || '' },
    lic: { bg: L.bg && invHas('lbg_' + L.bg) ? L.bg : '', mark: L.mark && invHas('lmk_' + L.mark) ? L.mark : '', fav, home: L.home || '', style: String(L.style || '').slice(0, 20), bday: String(L.bday || '').slice(0, 10), motto: String(L.motto || '').slice(0, 30) },
    car: { id: inst.id, color: (inst.look && inst.look.color) || '' }, pet: d.pet && invHas('pet_' + d.pet) ? d.pet : '',
    stats: { races: st.races || 0, wins: st.wins || 0, drifts: st.drifts || 0, cars: d.cars.length, km: Math.round((st.dist || st.km || 0) / (st.dist ? 1000 : 1)) || 0, ach: Object.keys(d.ach || {}).length },
    t: Date.now() }; }
function renderLicense(c) { const L = c.lic || {}, B = LICBG_BY[L.bg] || LICBG_BY.std, g = c.glv || 0, cls = g >= 100 ? 'S' : g >= 60 ? 'A' : g >= 30 ? 'B' : g >= 15 ? 'C' : g >= 5 ? 'D' : 'F';
  const fav = CAR_BY_ID[L.fav] || CAR_BY_ID[(c.car || {}).id] || CARS[0], home = L.home && MAP_BY_ID[L.home], mk = LICMK_BY[L.mark] ? L.mark : '';
  const no = (() => { const s = String(c.uid || c.name || 'x'); let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return String(h).padStart(10, '0').replace(/(\d{4})(\d{4})(\d{2})/, '$1-$2-$3'); })();
  return `<div class="lic" style="background:${B.bg};color:${B.fg}"><div class="lic-h"><b>DRIFT LEGENDS</b><span>運転免許証 ・ DRIVER LICENSE</span></div>
    <div class="lic-b"><div class="lic-ph"><div class="lic-av">${profAvatarHTML(64, c.prof || {}, c.name)}</div><div class="lic-car">${packCarSvg(fav.id, 92)}</div></div>
      <div class="lic-f"><div class="lic-nm"><small>氏名</small><b class="noi18n">${esc(c.name || 'プレイヤー')}</b></div>${c.title ? `<div><small>称号</small><span>${esc(c.title)}</span></div>` : ''}
        <div class="lic-row"><div><small>レベル</small><span>Lv.${c.lv || 1}</span></div><div><small>免許クラス</small><span class="lic-cls">${cls}</span></div>${L.bday ? `<div><small>誕生日</small><span class="noi18n">${esc(L.bday)}</span></div>` : ''}</div>
        <div><small>愛車</small><span>${esc(fav.name)}</span></div><div class="lic-row"><div><small>ホームコース</small><span>${home ? esc(home.jp || home.name) : '—'}</span></div><div><small>スタイル</small><span>${esc(L.style || '—')}</span></div></div>
        ${L.motto ? `<div class="lic-mo noi18n">「${esc(L.motto)}」</div>` : ''}</div></div>
    <div class="lic-ft"><span>No. ${no}</span><span>有効期限：無期限</span></div>${mk ? `<div class="lic-mk">${licMarkSvg(mk, 58)}</div>` : ''}<i class="lic-holo"></i></div>`; }
licenseHTML = function () { return renderLicense(Object.assign(myCard(), { uid: (window.DL_FB && DL_FB.user && DL_FB.user.uid) || SAVE.data.created || 'local' })); };
// 公開カードの保存（変化があったときだけ・最短20秒おき）
const CARD = { last: '', lastT: 0, cache: {} };
function pushCard(force) { try { if (!window.DL_FB || !DL_FB.user || !DL_FB.user.uid) return; const c = myCard(), sig = JSON.stringify(Object.assign({}, c, { t: 0 })); if (!force && (sig === CARD.last || Date.now() - CARD.lastT < 20000)) return; CARD.last = sig; CARD.lastT = Date.now(); DL_FB.db().ref('profiles/' + DL_FB.user.uid + '/card').set(c).catch(() => { }); } catch (e) { } }
{ const _ss = SOC.start.bind(SOC); SOC.start = async function () { const r = await _ss.apply(this, arguments); if (r) pushCard(true); return r; }; }
{ const _sv = SAVE.save.bind(SAVE); SAVE.save = function () { const r = _sv.apply(this, arguments); if (SOC.on) setTimeout(() => pushCard(false), 50); return r; }; }
setInterval(() => { if (SOC.on) pushCard(false); }, 60000);
// 他のプレイヤーのカードを読む
async function fetchCard(uid) { const c = CARD.cache[uid]; if (c && Date.now() - c.at < 30000) return c.v; try { const s = await DL_FB.db().ref('profiles/' + uid).get(), v = s.val() || {}; const card = Object.assign({ name: v.name || '?', glv: v.gl || 0 }, v.card || {}, { uid, has: !!v.card }); CARD.cache[uid] = { v: card, at: Date.now() }; return card; } catch (e) { return null; } }
Object.assign(UI, {
  async a_pfView(v) { const [uid, nm] = String(v).split('|'); if (!uid) return; if (uid === SOC.uid) return this.open('license');
    this.modal(`<div class="pv-wrap"><div class="note">${esc(nm || '')} さんのプロフィールを読み込み中…</div></div>`); const c = await fetchCard(uid);
    if (!document.querySelector('#overlay:not(.hidden) .pv-wrap')) return;
    if (!c) return this.modal(`<div class="pv-wrap"><h2>プロフィール</h2><div class="note">読み込めませんでした。通信状況を確認してください。</div><div class="btns"><button class="btn" data-a="closeModal">閉じる</button></div></div>`);
    const bn = c.prof && c.prof.banner && ITEM_BY_ID[c.prof.banner], S = c.stats || {}, fr = !!SOC.friends[uid], car = CAR_BY_ID[(c.car || {}).id], pet = c.pet && PET_BY[c.pet];
    const stat = (k, v) => `<div class="pv-st"><b>${v}</b><small>${k}</small></div>`;
    this.modal(`<div class="pv-wrap"><div class="pv-top"><h2>プロフィール</h2><button class="pd-x" data-a="closeModal">✕</button></div>
      <div class="pv-tabs"><button class="tab ${this.pvTab !== 'prof' ? 'on' : ''}" data-a="pvTab" data-v="lic|${uid}">免許証</button><button class="tab ${this.pvTab === 'prof' ? 'on' : ''}" data-a="pvTab" data-v="prof|${uid}">プロフィール</button></div>
      ${this.pvTab === 'prof' ? `<div class="pcard2 big" style="${bannerCSS(bn)}"><div class="pcard2-sh"></div>${profAvatarHTML(76, c.prof || {}, c.name)}<div class="pcard2-m"><b class="noi18n">${esc(c.name)}</b>${c.title ? `<span class="ttl-badge">${esc(c.title)}</span>` : ''}${c.bio ? `<p class="noi18n">${esc(c.bio)}</p>` : ''}<small>Lv.${c.lv || 1} ・ ガレージLv.${c.glv || 0}</small></div></div>
        <div class="pv-stats">${stat('レース', S.races || 0)}${stat('勝利', S.wins || 0)}${stat('ドリフト', S.drifts || 0)}${stat('所有車', S.cars || 0)}${stat('実績', S.ach || 0)}</div>
        <div class="pv-row">${car ? `<div class="pv-box"><small>いま乗っている車</small>${packCarSvg(car.id, 130)}<b>${esc(car.name)}</b><span>${clsBadge(car)} ${esc(car.maker)}</span></div>` : ''}${pet ? `<div class="pv-box"><small>連れているペット</small>${petSvg(pet.id, 70)}<b>${esc(pet.nm)}</b></div>` : ''}</div>`
        : `<div class="lic-wrap">${renderLicense(c)}</div>`}
      ${c.has ? '' : '<div class="note">このプレイヤーはまだ新しいバージョンで遊んでいないため、一部の情報だけ表示しています。</div>'}
      <div class="btns">${fr ? `<button class="btn pri" data-a="pvDm" data-v="${uid}">${emoSvg('e1', 14)} チャット</button>` : uid !== SOC.uid ? `<button class="btn pri" data-a="frAddUid" data-v="${uid}:${esc(c.name)}">フレンド申請</button>` : ''}<button class="btn" data-a="closeModal">閉じる</button></div></div>`); },
  a_pvTab(v) { const [t, uid] = v.split('|'); this.pvTab = t; const c = CARD.cache[uid]; this.a_pfView(uid + '|' + (c ? c.v.name : '')); },
  a_pvDm(uid) { this.closeModal(); this.a_dmOpen(uid); }
});
// フレンド一覧・申請・クランメンバーに「プロフィール」ボタン
{ const _rf = UI.r_friends; UI.r_friends = function () { let h = _rf.apply(this, arguments);
    h = h.replace(/<div class="fr"><span class="dot[^"]*"><\/span><b class="noi18n">([^<]*)<\/b>([\s\S]*?)(<button class="btn pri" data-a="dmOpen" data-v="([^"]+)">)/g, (m, nm, mid, btn, uid) => m.replace('<b class="noi18n">', `<button class="fr-pf" data-a="pfView" data-v="${uid}|${nm}">${this.frAv(uid, nm)}</button><b class="noi18n fr-nm" data-a="pfView" data-v="${uid}|${nm}">`).replace(btn, `<button class="btn" data-a="pfView" data-v="${uid}|${nm}">プロフィール</button>` + btn));
    h = h.replace(/<div class="fr"><span class="dot[^"]*"><\/span><b class="noi18n">([^<]*)<\/b><small>フレンド申請<\/small><button class="btn pri" data-a="frOk" data-v="([^"]+)">/g, (m, nm, uid) => m.replace('</small>', `</small><button class="btn" data-a="pfView" data-v="${uid}|${nm}">プロフィール</button>`));
    return h; }; }
{ const _rc = UI.r_clan; UI.r_clan = function () { let h = _rc.apply(this, arguments); const c = SOC.clan; if (!c || !c.members) return h;
    for (const [u, v] of Object.entries(c.members)) { const nm = esc(v.n || '?'), re = new RegExp(`(<div class="fr"><span class="dot[^"]*"></span>)(<b class="noi18n">${nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</b><small>(?:リーダー|メンバー)</small>)`); h = h.replace(re, `$1<button class="fr-pf" data-a="pfView" data-v="${u}|${nm}">${this.frAv(u, v.n || '?')}</button>$2<button class="btn" data-a="pfView" data-v="${u}|${nm}">${u === SOC.uid ? '自分の免許証' : 'プロフィール'}</button>`); }
    return h; }; }
UI.frAv = function (uid, nm) { const c = CARD.cache[uid]; if (!c) { if (!this._frq) this._frq = {}; if (!this._frq[uid] && window.DL_FB && SOC.on) { this._frq[uid] = 1; fetchCard(uid).then(() => { this._frq[uid] = 0; if (['friends', 'clan'].includes(this.screen)) this.render(); }); } return profAvatarHTML(32, {}, nm); } return profAvatarHTML(32, c.v.prof || {}, nm); };
// チャットの名前をタップしてもプロフィールを開ける
{ const _ch = UI.chatHTML; UI.chatHTML = function () { const h = _ch.apply(this, arguments); let i = 0; const msgs = SOC.chat || []; return h.replace(/<div class="msg ?(me)?"><b class="noi18n">/g, (m, me) => { const msg = msgs[i++]; return msg && msg.u && !me ? `<div class="msg"><b class="noi18n msg-nm" data-a="pfView" data-v="${msg.u}|${esc(msg.n || '')}">` : m; }); }; }
window.__DL && (window.__DL.SOC = SOC); window.SOC_ = SOC; window.__DLX = Object.assign(window.__DLX || {}, { SOC, myCard, renderLicense, fetchCard, CARD, pushCard });
