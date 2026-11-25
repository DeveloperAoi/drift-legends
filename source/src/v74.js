// =====================================================================
// v74.js — v6.0：アーケードレーシングUI
//   ゲームセンターのレースゲームのような画面デザイン（オリジナル）
//   ・共通：左上のプレイヤープレート（ランク）・右上の大きなレベル表示・下のドライバーコンソール（所持金・ダイヤ・操作ガイド）
//   ・MODE SELECT（新画面）：大きなモードビジュアル＋下の横並びカード
//   ・COURSE SELECT / CAR SELECT / TUNING / DRESS UP / STORY SELECT / ONLINE を同じデザインに
//   ・リザルト：大きな順位・タイム・NEW 演出
//   既存の機能（コース・車・チューニング・ストーリー・オンライン・報酬）はそのまま使い、見た目と画面のつながりを変更
// =====================================================================
const ARC = { screens: new Set(['amode', 'maps', 'carsel', 'tuning', 'story', 'online', 'garage']), on: () => !!(SAVE.data && SAVE.data.settings && SAVE.data.settings.arcUI !== false),
  rank(lv) { const T = [[1, 'E'], [10, 'D'], [20, 'C'], [35, 'B'], [55, 'A'], [80, 'S'], [120, 'SS']]; let r = T[0]; for (const t of T) if (lv >= t[0]) r = t; const nx = T[T.indexOf(r) + 1], span = nx ? nx[0] - r[0] : 40, step = Math.min(9, 1 + Math.floor((lv - r[0]) / Math.max(1, span / 9))); return [r[1], step]; },
  lv() { try { return (typeof playerLevel === 'function' ? playerLevel() : null) || (SAVE.data.level || 0) || +(($('tbLevel') || {}).textContent || '').replace(/\D/g, '') || 1; } catch (e) { return 1; } } };
// レベルは上のバーの表示（Lv.n）から読むのが確実
ARC.lv = function () { const t = (($('tbLevel') || {}).textContent || '').match(/\d+/); return t ? +t[0] : 1; };

// ---------------- 共通パーツ（プレート・レベル・コンソール） ----------------
{ const plate = document.createElement('div'); plate.id = 'arcPlate'; document.body.appendChild(plate);
  const big = document.createElement('div'); big.id = 'arcBig'; document.body.appendChild(big);
  const con = document.createElement('div'); con.id = 'arcCon'; document.body.appendChild(con);
  con.addEventListener('click', e => { const b = e.target.closest('[data-arc]'); if (!b) return; AUDIO.click && AUDIO.click(); const k = b.dataset.arc; if (k === 'back') UI.back(); else if (k === 'ok') ARC.ok(); else if (k === 'home') UI.goMenu(); else if (k === 'l') ARC.move(-1); else if (k === 'r') ARC.move(1); }); }
ARC.paint = function () { const d = SAVE.data || {}, F = window.DL_FB, name = (F && F.profile && F.profile.name) || (d.settings && d.settings.nick) || 'プレイヤー', lv = this.lv(), [rk, st] = this.rank(lv), home = (d.license && d.license.home && MAP_BY_ID[d.license.home]) ? MAP_BY_ID[d.license.home].jp : (d.cars || []).length ? (CAR_BY_ID[(SAVE.cur() || {}).id] || {}).name || '' : '';
  const key = [name, lv, home, d.money, d.diamonds, (d.cars || []).length, UI.screen].join('|'); if (key === this._k) return; this._k = key;
  let av = ''; try { av = profAvatarHTML(52); } catch (e) { }
  $('arcPlate').innerHTML = `<div class="ap-av">${av}</div><div class="ap-m"><b class="noi18n">${esc(name)}</b><small>${home ? '愛車・' + esc(home) : 'DRIFT LEGENDS'}</small></div><div class="ap-rk r-${rk}"><b>${rk}</b><i>${st}</i></div>`;
  $('arcBig').innerHTML = `<small>LEVEL</small><b>${lv}</b>`;
  const touch = matchMedia('(pointer:coarse)').matches;
  $('arcCon').innerHTML = `<div class="ac-l"><span class="ac-ttl">DRIVER CONSOLE</span><div class="ac-row"><span class="ac-ic y">¥</span><b>${(d.money || 0).toLocaleString()}</b></div><div class="ac-row2"><span>${SICO.gem(14)} <b>${(d.diamonds || 0).toLocaleString()}</b></span><span>${ICO('carSide', '#cfd6e4', 14)} <b>${(d.cars || []).length}</b></span><span class="ac-rk r-${rk}">${rk}${st}</span></div></div>
    <div class="ac-r"><button class="ac-g" data-arc="l">◀▶<span>選択</span></button><button class="ac-g ok" data-arc="ok"><i>${touch ? 'TAP' : 'ENTER'}</i><span>決定</span></button><button class="ac-g bk" data-arc="back"><i>${touch ? 'BACK' : 'ESC'}</i><span>戻る</span></button><button class="ac-g hm" data-arc="home"><i>${ICO('garage', '#fff', 14)}</i><span>ホーム</span></button><div class="ac-logo"><b>DRIFT</b><b>LEGENDS</b></div></div>`; };
ARC.sync = function () { const show = this.on() && this.screens.has(UI.screen) && $('s-panel') && $('s-panel').classList.contains('show') && !(UI.game && UI.game.active);
  document.body.classList.toggle('arc', !!show); document.body.dataset.arc = show ? UI.screen : ''; if (show) this.paint(); };
setInterval(() => { try { ARC.sync(); } catch (e) { } }, 300);
// 左右・決定（画面ごと）
ARC.move = function (dir) { const s = UI.screen; if (s === 'amode') return UI.amMove(dir); const L = [...document.querySelectorAll(s === 'maps' ? '.arc-rail .mapcard' : s === 'carsel' ? '.arc-rail .ct' : s === 'story' ? '.ss-path .ss-node:not(.lock)' : '.arc-rail .opt')]; if (!L.length) return;
  let i = L.findIndex(e => e.classList.contains('sel') || e.classList.contains('on')); i = Math.max(0, Math.min(L.length - 1, (i < 0 ? 0 : i) + dir)); L[i].click(); };
ARC.ok = function () { const s = UI.screen; if (s === 'amode') return UI.a_amGo(); const b = document.querySelector(s === 'maps' ? '#panelBody [data-a=toCarSel]' : s === 'carsel' ? '#panelBody [data-a=startRace]' : s === 'story' ? '#panelBody [data-a=storyGo]' : null); if (b) b.click(); };
document.addEventListener('keydown', e => { if (!document.body.classList.contains('arc') || UI.game && UI.game.active) return; const ov = $('overlay'); if (ov && !ov.classList.contains('hidden')) return; if (/INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName || '')) return;
  if (e.key === 'ArrowLeft') { ARC.move(-1); e.preventDefault(); } else if (e.key === 'ArrowRight') { ARC.move(1); e.preventDefault(); } else if (e.key === 'Enter') { ARC.ok(); e.preventDefault(); } else if (e.key === 'Escape' || e.key === 'Backspace') { UI.back(); e.preventDefault(); } });

// ---------------- MODE SELECT ----------------
const AM_MODES = [
  { id: 'time', en: 'TIME ATTACK', jp: 'タイムアタック', ic: 'timer', c1: '#0e2a52', c2: '#3aa0ff', desc: 'ひとりでコースを走り、自己ベストとランキングの記録に挑戦。ゴーストとセクションタイムで走りをみがこう。', go: () => UI.open('maps', { mode: 'time' }), info: () => { const n = Object.keys((SAVE.data.records || {}).ta || {}).length; return [['記録のあるコース', n + ' コース'], ['ランキング', '週間タイムアタック']]; } },
  { id: 'race', en: 'QUICK RACE', jp: 'クイックレース', ic: 'flag', c1: '#4a0d10', c2: '#ff4a3a', desc: '好きなコースを選んで、すぐにライバルとバトル。勝てば賞金と経験値がもらえる。', go: () => UI.open('maps', { mode: 'race' }), info: () => [['相手', 'ライバル 1台'], ['報酬', '賞金・経験値']] },
  { id: 'story', en: 'STORY MODE', jp: 'ストーリー', ic: 'book', c1: '#3b2405', c2: '#ffb020', desc: '峠の走り屋たちとのバトルを勝ち抜いて、伝説のドライバーを目指すストーリーモード。', go: () => UI.open('story'), info: () => [['形式', '1対1のバトル'], ['報酬', '賞金・限定アイテム']] },
  { id: 'event', en: 'SPECIAL EVENTS', jp: 'スペシャル', ic: 'star', c1: '#3a0b3c', c2: '#ff5ad0', desc: '期間限定イベントやデイリーイベント。ここでしか手に入らない報酬をゲットしよう。', go: () => UI.open('events'), info: () => [['開催中', '期間限定・デイリー'], ['報酬', '限定アイテム']] },
  { id: 'touge', en: 'DRIFT CHALLENGE', jp: 'ドリフトチャレンジ', ic: 'drift', c1: '#0c3a2a', c2: '#2fe08a', desc: 'エンドレスの峠でドリフトのポイントを稼ぐ。壁に当たるとダメージが溜まる。', go: () => UI.open('maps', { mode: 'touge' }), info: () => { const n = Object.keys((SAVE.data.records || {}).touge || {}).length; return [['記録のあるコース', n + ' コース'], ['ランキング', '週間ドリフト']]; } },
  { id: 'free', en: 'FREE RUN', jp: 'フリー走行', ic: 'road', c1: '#202733', c2: '#9fb4cc', desc: '時間制限なしで自由に走れる。コースの下見や車のテストに。', go: () => UI.open('maps', { mode: 'free' }), info: () => [['形式', '時間制限なし'], ['おすすめ', 'コースの下見']] },
  { id: 'local', en: 'LOCAL BATTLE', jp: '店内バトル', ic: 'users', c1: '#1d1d24', c2: '#6b7280', soon: 1, desc: '同じ画面でふたりで対戦するモード。現在準備中です。', go: () => UI.toast('店内バトルは準備中です（COMING SOON）'), info: () => [['状態', 'COMING SOON']] },
  { id: 'online', en: 'ONLINE BATTLE', jp: 'オンライン', ic: 'globe', c1: '#06243a', c2: '#22d3ee', desc: '全国のプレイヤーとオンラインで対戦。ルームを作るか、ルームに参加しよう。', go: () => UI.open('online'), info: () => { const F = window.DL_FB; return [['接続', F && F.user ? 'オンライン' : 'オフライン'], ['アカウント', F && F.user && !F.user.isAnonymous ? 'Google' : 'ゲスト']]; } },
  { id: 'garage', en: 'GARAGE', jp: 'ガレージ', ic: 'garage', c1: '#2a2a2a', c2: '#ffcf3d', desc: '車の選択・チューニング・ドレスアップ。自分だけの一台に仕上げよう。', go: () => UI.open('garage'), info: () => [['所有台数', (SAVE.data.cars || []).length + ' 台'], ['使用中', (CAR_BY_ID[(SAVE.cur() || {}).id] || {}).name || '-']] }];
function amArt(m, big) { const car = SAVE.cur(), cid = car ? car.id : CARS[0].id, W = big ? 760 : 200, H = big ? 300 : 96;
  return `<svg class="am-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="amg${m.id}${big ? 1 : 0}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m.c1}"/><stop offset="1" stop-color="#07080b"/></linearGradient><radialGradient id="amr${m.id}${big ? 1 : 0}" cx=".7" cy=".45" r=".6"><stop offset="0" stop-color="${m.c2}" stop-opacity=".55"/><stop offset="1" stop-color="${m.c2}" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#amg${m.id}${big ? 1 : 0})"/><rect width="${W}" height="${H}" fill="url(#amr${m.id}${big ? 1 : 0})"/>
    ${Array.from({ length: big ? 26 : 10 }, (_, i) => { const x = (i * 97 + 31) % W, l = (i * 53) % (W / 3) + W / 8; return `<line x1="${x}" y1="${(i * 41) % H}" x2="${x - l}" y2="${(i * 41) % H + l * 0.42}" stroke="${m.c2}" stroke-opacity="${0.08 + (i % 5) * 0.04}" stroke-width="${1 + (i % 3)}"/>`; }).join('')}
    <g opacity=".95" transform="translate(${big ? W * 0.08 : W * 0.06} ${big ? H * 0.12 : H * 0.12}) scale(${big ? 2.6 : 1.05})">${ICO(m.ic, m.c2, 40).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g></svg>
    <div class="am-car">${packCarSvg(cid, big ? 460 : 120)}</div>`; }
UI.r_amode = function () { $('panelTitle').textContent = 'MODE SELECT'; $('panelBody').classList.add('wide'); this.show.active = false; const i = Math.max(0, Math.min(AM_MODES.length - 1, this.amI || 0)), m = AM_MODES[i];
  return `<div class="am"><div class="am-side"><div class="am-tag">${m.soon ? 'COMING SOON' : 'MODE'}</div><h3 class="am-sh">${esc(m.jp)}</h3><p>${esc(m.desc)}</p><div class="am-info">${m.info().map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(String(v))}</b></div>`).join('')}</div></div>
    <div class="am-hero ${m.soon ? 'soon' : ''}" style="--mc:${m.c2}">${amArt(m, true)}<div class="am-name"><small>${m.soon ? 'COMING SOON' : 'SELECT MODE'}</small><b>${m.en}</b><span>${esc(m.jp)}</span></div><button class="am-go" data-a="amGo" ${m.soon ? 'disabled' : ''}>${m.soon ? '準備中' : '決定 ▶'}</button></div>
    <div class="am-guide">モードを選択してください</div>
    <div class="am-rail"><button class="am-arw l" data-a="amMv" data-v="-1">◀</button><div class="am-track">${AM_MODES.map((x, k) => `<button class="am-card ${k === i ? 'sel' : ''} ${x.soon ? 'soon' : ''}" data-a="amPick" data-v="${k}" style="--mc:${x.c2}"><span class="am-ca">${amArt(x, false)}</span><small>${x.en}</small><b>${esc(x.jp)}</b>${x.soon ? '<em>SOON</em>' : ''}</button>`).join('')}</div><button class="am-arw r" data-a="amMv" data-v="1">▶</button></div></div>`; };
UI.amMove = function (d) { this.amI = (((this.amI || 0) + d) % AM_MODES.length + AM_MODES.length) % AM_MODES.length; AUDIO.nav && AUDIO.nav(); this.render(); ARC.center(); };
UI.a_amMv = function (v) { this.amMove(+v); };
UI.a_amPick = function (v) { const k = +v; if (k === (this.amI || 0)) return this.a_amGo(); this.amI = k; this.render(); ARC.center(); };
UI.a_amGo = function () { const m = AM_MODES[this.amI || 0]; if (!m || m.soon) return m && m.go(); AUDIO.confirm && AUDIO.confirm(); ARC.wipe(() => m.go()); };
ARC.center = function () { setTimeout(() => { const s = document.querySelector('.am-card.sel, .arc-rail .mapcard.sel, .arc-rail .ct.sel, .arc-rail .opt.on'); if (s && s.scrollIntoView) s.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }, 30); };
ARC.wipe = function (fn) { let w = $('arcWipe'); if (!w) { w = document.createElement('div'); w.id = 'arcWipe'; document.body.appendChild(w); } w.classList.remove('go'); void w.offsetWidth; w.classList.add('go'); setTimeout(fn, 180); };
// スワイプでモード切り替え
document.addEventListener('touchstart', e => { if (UI.screen !== 'amode' || !document.body.classList.contains('arc')) return; const t = e.touches[0]; ARC._sx = t.clientX; ARC._sy = t.clientY; }, { passive: true });
document.addEventListener('touchend', e => { if (UI.screen !== 'amode' || ARC._sx == null) return; const t = e.changedTouches[0], dx = t.clientX - ARC._sx, dy = t.clientY - ARC._sy; ARC._sx = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && !e.target.closest('.am-track')) UI.amMove(dx < 0 ? 1 : -1); }, { passive: true });
// 入口：下のナビの RACE とメインメニューのレースからモード選択へ
{ const nav = document.getElementById('bnav'); if (nav) nav.addEventListener('click', e => { const b = e.target.closest('[data-nav=race]'); if (!b || !ARC.on()) return; e.stopImmediatePropagation(); AUDIO.nav && AUDIO.nav(); UI.goMenu(); UI.open('amode'); }, true); }
{ const _mi = UI.menuItems; UI.menuItems = function () { _mi.apply(this, arguments); if (!ARC.on()) return; const el = $('menuList'); if (el && !el.querySelector('.mm-arc')) el.insertAdjacentHTML('afterbegin', `<button class="mm-arc" data-m="amode"><span class="mm-arc-t"><small>ARCADE</small><b>MODE SELECT</b></span><span class="mm-arc-s">タイムアタック・レース・ストーリー・オンライン・ガレージ</span><i>▶</i></button>`); }; }

// ---------------- 画面ごとのレイアウト（描画後に並べ替え） ----------------
{ const _r = UI.render; UI.render = function () { const r = _r.apply(this, arguments); try { if (ARC.on()) ARC.layout(); } catch (e) { console.error(e); } return r; }; }
ARC.layout = function () { const s = UI.screen, body = $('panelBody'); if (!body) return; body.classList.toggle('arc-body', this.screens.has(s)); body.dataset.arc = s;
  if (s === 'maps') this.layMaps(body); else if (s === 'carsel') this.layCar(body); else if (s === 'tuning') this.layTune(body); else if (s === 'story') this.layStory(body); else if (s === 'online') this.layOnline(body); };
ARC.rail = function (body, nodes, cls) { const r = document.createElement('div'); r.className = 'arc-rail ' + (cls || ''); r.innerHTML = '<button class="am-arw l" data-arcmv="-1">◀</button><div class="arc-track"></div><button class="am-arw r" data-arcmv="1">▶</button>'; const t = r.querySelector('.arc-track'); nodes.forEach(n => t.appendChild(n)); body.appendChild(r);
  r.addEventListener('click', e => { const b = e.target.closest('[data-arcmv]'); if (b) { e.stopPropagation(); t.scrollBy({ left: +b.dataset.arcmv * t.clientWidth * 0.7, behavior: 'smooth' }); } }); return r; };
ARC.layMaps = function (body) { const grid = body.querySelector('.mapgrid'); if (!grid || body.querySelector('.arc-rail')) return; const detail = grid.parentNode && grid.parentNode.nextElementSibling, wrap = grid.parentNode && grid.parentNode.parentNode;
  const top = document.createElement('div'); top.className = 'mp-top'; ['.mode-tabs', '.pop-strip', '.map-filter'].forEach(q => { const e = body.querySelector(q); if (e) top.appendChild(e); });
  const main = document.createElement('div'); main.className = 'mp-main'; const view = document.createElement('div'); view.className = 'mp-view'; const sel = UI.sel, m = MAP_BY_ID[sel];
  view.innerHTML = `<canvas class="mp-cv" width="560" height="340"></canvas><div class="mp-vn"><small>${m ? esc(m.name) : ''}</small><b>${m ? esc(m.jp) : ''}</b></div>`; if (detail) { detail.classList.add('mp-info'); main.appendChild(detail); } main.appendChild(view);
  body.insertBefore(top, body.firstChild); body.insertBefore(main, top.nextSibling); const cards = [...grid.children]; this.rail(body, cards, 'mp-rail'); if (wrap && wrap !== body && !wrap.querySelector('.mapcard')) wrap.remove();
  const cv = view.querySelector('canvas'); if (m) setTimeout(() => { try { UI.drawThumb(cv, sel); } catch (e) { } }, 0); body.insertAdjacentHTML('afterbegin', ''); this.center(); };
ARC.layCar = function (body) { const grid = body.querySelector('.ct-grid'); if (!grid || body.querySelector('.arc-rail')) return; const bar = body.querySelector('.ct-bar'); const cards = [...grid.children]; this.rail(body, cards, 'ct-rail'); if (bar) body.querySelector('.arc-rail').insertBefore(bar, body.querySelector('.arc-rail').firstChild); const list = body.querySelector('.ws-list'); if (list) list.remove(); this.center(); };
ARC.layTune = function (body) { if (body.querySelector('.arc-rail, .tn-left')) return; const left = document.createElement('div'); left.className = 'tn-left';
  const sum = body.querySelector('.sum'), tabs = body.querySelector('.tmode-tabs, .tm-tabs, .seg2'), grid = body.querySelector('.cat-grid'), head = body.querySelector('.cat-head');
  // 上部のモード切替（チューニング／カスタマイズ）は左のパネルの一番上
  const first = body.firstElementChild; if (first && first !== sum && first !== grid && first !== head) left.appendChild(first); if (sum) left.appendChild(sum);
  if (grid) { left.appendChild(grid); [...body.querySelectorAll(':scope > .note')].forEach(n => left.appendChild(n)); }
  else if (head) { left.appendChild(head); const parts = [...body.querySelectorAll(':scope > .part')]; const rail = document.createElement('div'); rail.className = 'tn-parts'; parts.forEach(p => { rail.appendChild(p); }); body.appendChild(rail);
    const rest = [...body.children].filter(c => c !== rail && c !== left); rest.forEach(c => left.appendChild(c)); }
  else [...body.children].forEach(c => left.appendChild(c));
  body.insertBefore(left, body.firstChild);
  // 性能グラフなど残りは右側のパネルに
  const rest = [...body.children].filter(c => c !== left && !c.classList.contains('tn-parts')); if (rest.length) { const right = document.createElement('div'); right.className = 'tn-right'; rest.forEach(c => right.appendChild(c)); body.appendChild(right); }
  // 装着中の表示
  body.querySelectorAll('.tn-parts .opt.on, .tn-parts .cp-card.on').forEach(o => { if (!o.querySelector('.arc-eq')) o.insertAdjacentHTML('beforeend', '<span class="arc-eq">装着中</span>'); });
  const on = body.querySelector('.tn-parts .opt.on'); if (on && on.scrollIntoView) setTimeout(() => on.scrollIntoView({ block: 'nearest', inline: 'center' }), 30); };
ARC.layStory = function (body) { const tabs = body.querySelector('.ss-tabs'); if (!tabs || body.querySelector('.arc-rail')) return; const cards = [...tabs.children]; tabs.remove(); this.rail(body, cards, 'ss-rail'); };
ARC.layOnline = function (body) { if (body.querySelector('.ob-hero')) return; const F = window.DL_FB, on = !!(F && F.user), lv = this.lv(), [rk, st] = this.rank(lv), wins = ((SAVE.data.stats || {}).onlineWins) || 0;
  body.insertAdjacentHTML('afterbegin', `<div class="ob-hero ${on ? 'on' : ''}"><div class="ob-radar"><i></i><i></i><i></i><span class="ob-sweep"></span></div><div class="ob-m"><small>ONLINE BATTLE</small><b>${on ? 'オンラインに接続しています' : 'オフラインです'}</b><span>あなたのランク <em class="r-${rk}">${rk}${st}</em>${wins ? ' ・ オンライン勝利 ' + wins : ''}</span></div></div>`); };

// ---------------- CAR SELECT：決定前の確認 ----------------
{ const _sr = UI.a_startRace; UI.a_startRace = function () { if (!ARC.on() || this._carOk) { this._carOk = false; return _sr.apply(this, arguments); } const inst = (SAVE.data.cars || []).find(c => c.uid === this.sel) || SAVE.cur(), car = inst && CAR_BY_ID[inst.id]; if (!car) return _sr.apply(this, arguments); let sp = null; try { sp = computeSpec(car, Object.assign({}, inst.tune, { _look: inst.look })); } catch (e) { }
    const mp = this.arg && MAP_BY_ID[this.arg.mapId];
    this.modal(`<div class="arc-cf"><div class="arc-cf-h">CAR SELECT</div><div class="arc-cf-car">${packCarSvg(car.id, 260)}</div><h2>${esc(car.name)}</h2><div class="arc-cf-s">${sp ? `<span>${Math.round(sp.hp)}<small>PS</small></span><span>${Math.round(car.kg)}<small>kg</small></span><span>${car.drive}</span>` : ''}${mp ? `<span>${esc(mp.jp)}</span>` : ''}</div><div class="note">この車で出走しますか？</div><div class="btns"><button class="btn" data-a="closeModal">やめる</button><button class="btn pri" data-a="arcCarOk">この車で決定 ▶</button></div></div>`); }; }
UI.a_arcCarOk = function () { this.closeModal(); this._carOk = true; ARC.wipe(() => this.a_startRace()); };

// ---------------- リザルト：大きな順位・タイム ----------------
{ const _sh = UI.showResults; UI.showResults = function (res) { const r = _sh.apply(this, arguments); try { if (!ARC.on()) return r; const box = document.querySelector('#overlay .res-modal'); if (!box || box.querySelector('.arc-res')) return r; box.classList.add('arc-rm');
      const n = 1 + (this.game && this.game.rivals ? this.game.rivals.length : 1), place = res.win === true ? 1 : res.win === false ? Math.min(n, 2) : null, sfx = p => p === 1 ? 'st' : p === 2 ? 'nd' : p === 3 ? 'rd' : 'th';
      const best = res.laps && res.laps.length ? Math.min(...res.laps.map(l => l.t)) : null, m = MAP_BY_ID[res.mapId], car = (res.cfg && res.cfg.carInst && CAR_BY_ID[res.cfg.carInst.id]) || CAR_BY_ID[(SAVE.cur() || {}).id];
      let big = ''; if (place && res.mode !== 'time' && res.mode !== 'touge' && res.mode !== 'free') big = `<div class="arc-place p${place}"><b>${place}</b><i>${sfx(place)}</i><small>/ ${n}</small></div>`; else if (best != null) big = `<div class="arc-time"><small>FINAL TIME</small><b>${fmtTime(best)}</b></div>`;
      const laps = res.laps && res.laps.length > 1 ? `<div class="arc-laps">${res.laps.map((l, i) => `<span class="${l.t === best ? 'b' : ''}"><small>LAP ${i + 1}</small>${fmtTime(l.t)}</span>`).join('')}</div>` : '';
      box.insertAdjacentHTML('afterbegin', `<div class="arc-res"><div class="arc-res-h">${m ? esc(m.jp) : ''}${res.cfg && res.cfg.weather ? ' ／ ' + ({ clear: '晴れ', rain: '雨', snow: '雪', fog: '霧' }[res.cfg.weather] || '') : ''}${res.cfg && res.cfg.time ? ' ／ ' + ({ day: '昼', evening: '夕方', night: '夜' }[res.cfg.time] || '') : ''}</div>${big}<div class="arc-res-car">${car ? packCarSvg(car.id, 300) : ''}<span>${car ? esc(car.name) : ''}</span></div>${laps}</div>`);
      const pb = box.querySelector('.res-pb'); if (pb) pb.classList.add('arc-new'); } catch (e) { console.error(e); } return r; }; }

// ---------------- 設定：アーケードUIのオン・オフ ----------------
{ const _rs = UI.r_settings; UI.r_settings = function () { const h = _rs.apply(this, arguments), on = ARC.on(); return h + `<div class="h3">画面デザイン</div><div class="row"><label>アーケードUI（MODE SELECT・斜めのパネル・下のコンソール）</label><button class="btn ${on ? 'pri' : ''}" data-a="arcTog">${on ? 'ON' : 'OFF'}</button></div>`; }; }
UI.a_arcTog = function () { const s = SAVE.data.settings; s.arcUI = s.arcUI === false ? true : false; SAVE.save(); this.render(); ARC.sync(); };
window.__DLX = Object.assign(window.__DLX || {}, { ARC, AM_MODES });
