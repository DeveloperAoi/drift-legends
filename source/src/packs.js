// =====================================================================
// packs.js — v2.7 カードパック（開封演出）・インベントリ・デイリーショップ（サーバー時刻）
// =====================================================================
// ---- サーバー時刻（Firebase の serverTimeOffset。なければ端末時刻） ----
const SRV = { off: 0, ok: false, now() { return Date.now() + this.off; },
  async sync() { try { if (!window.DL_FB) return; await DL_FB.ready(); DL_FB.db().ref('.info/serverTimeOffset').on('value', s => { this.off = +s.val() || 0; this.ok = true; }); } catch (e) { } } };
SRV.sync();
const srvDateKey = () => jstDateKey(new Date(SRV.now()));
const srvMsToMidnight = () => { const j = SRV.now() + 9 * 3600000; return 86400000 - (j % 86400000); };

// ---- 装着・取り外し（アイテムの種類ごと） ----
function itemEquipped(it, inst) { const lk = inst.look, d = SAVE.data;
  switch (it.type) { case 'wheel': return lk.wheel === it.id; case 'paint': return lk.color === it.color && lk.paint === it.paint; case 'decal': return (lk.decals || []).includes(it.id); case 'neon': return lk.glow === it.id; case 'plate': return lk.plateGlow === it.id;
    case 'caliper': return lk.caliper === it.color; case 'meter': return lk.meter === (it.meter || it.id); case 'kit': return (lk.kit || {})[it.slot] === it.id; case 'bg': return d.settings.bg === it.bg; case 'tune': return inst.tune.special === it.id;
    case 'title': return d.title === it.id; case 'muffler': return lk.mfType === it.mf; case 'car': return CAR_BY_ID[inst.id] && inst.id === it.car; }
  return false; }
const EQUIPPABLE = ['wheel', 'paint', 'decal', 'neon', 'plate', 'caliper', 'meter', 'kit', 'bg', 'tune', 'title', 'muffler'];
function itemApply(it, inst, on = true) { const lk = inst.look, d = SAVE.data, car = CAR_BY_ID[inst.id]; lk.owned = lk.owned || {};
  const own = (k, v) => { lk.owned[k] = lk.owned[k] || []; if (!lk.owned[k].includes(v)) lk.owned[k].push(v); };
  switch (it.type) {
    case 'wheel': lk.wheel = on ? it.id : (car.stockWheel || 'stock'); if (on) own('wheel', it.id); break;
    case 'paint': if (on) { lk.color = it.color; lk.paint = it.paint; own('paint', it.paint); } else { lk.color = car.color; lk.paint = 'metallic'; } break;
    case 'decal': lk.decals = (lk.decals || []).filter(x => x !== it.id); if (on) { if (lk.decals.length >= 6) return 'デカールは最大6枚までです'; lk.decals.push(it.id); own('decals', it.id); } break;
    case 'neon': lk.glow = on ? it.id : 'none'; break; case 'plate': lk.plateGlow = on ? it.id : 'none'; break; case 'caliper': lk.caliper = on ? it.color : '#cc1010'; break;
    case 'meter': lk.meter = on ? (it.meter || it.id) : 'std'; break;
    case 'kit': lk.kit = lk.kit || {}; if (on) { lk.kit[it.slot] = it.id; lk[it.slot] = it.shape; } else { delete lk.kit[it.slot]; lk[it.slot] = 0; } break;
    case 'bg': d.settings.bg = on ? it.bg : 'garage'; break; case 'tune': inst.tune.special = on ? it.id : ''; break; case 'title': d.title = on ? it.id : ''; break;
    case 'muffler': lk.mfType = on ? it.mf : 'stock'; if (on) own('mf', it.mf); break;
  }
  return null; }

// ---- 新しい獲得アイテム：称号・マフラー ----
{ const R3 = ['C', 'U', 'R', 'E', 'L'];
  [['峠の新人', 'Touge Rookie', 'C'], ['夜の走り屋', 'Night Racer', 'C'], ['ドリフト職人', 'Drift Artisan', 'U'], ['ヘアピンの魔術師', 'Hairpin Wizard', 'U'], ['湾岸の帝王', 'Bayshore King', 'R'], ['ゼロヨンの鬼', 'Quarter-Mile Demon', 'R'], ['ロータリーの申し子', 'Child of the Rotary', 'R'], ['カウンターステアの達人', 'Countersteer Master', 'E'], ['峠の伝説', 'Legend of the Pass', 'E'], ['無敗の王者', 'Undefeated Champion', 'L'], ['DRIFT GOD', 'DRIFT GOD', 'L'], ['コレクター', 'Collector', 'U'], ['チューニングの鬼', 'Tuning Fiend', 'R'], ['ナイトキング', 'Night King', 'E'], ['ゴールデンドライバー', 'Golden Driver', 'L']]
    .forEach(([nm, en, r], i) => addItem({ id: 'tt_' + i, type: 'title', name: '称号「' + nm + '」', en: 'Title "' + en + '"', rarity: r, title: nm, titleEn: en, desc: 'プロフィールとメニューに表示される称号' }));
  [['sport', 'スポーツマフラー', 'Sport Muffler', 'U'], ['big', '大径マフラー', 'Big-Bore Muffler', 'R'], ['race', '競技用マフラー', 'Race Muffler', 'E'], ['titanium', 'チタンマフラー', 'Titanium Muffler', 'E'], ['straight', 'ストレートパイプ', 'Straight Pipe', 'L']]
    .forEach(([mf, nm, en, r]) => addItem({ id: 'mf_' + mf, type: 'muffler', name: nm, en, rarity: r, mf, desc: 'マフラーの音が変わる（全車で使える）' }));
  if (typeof MUFFLER_SOUND !== 'undefined') MUFFLER_SOUND.straight = { lvl: 3, vol: 1.35, rasp: 1.8, sub: 1.3, bright: 1.3, crackle: 3 };
  if (typeof MUFFLER_TYPES !== 'undefined') MUFFLER_TYPES.push(['straight', 'ストレート', 0, 'mf_straight']);
  Object.assign(ITEM_TYPES, { title: '称号', muffler: 'マフラー', kit: 'エアロパーツ', bg: 'ガレージ装飾' });
  // 後から追加したアイテム（items3 以降）も一覧・ホイール・デカールに登録する
  for (const it of ITEMS) { ITEM_BY_ID[it.id] = it; if (it.type === 'wheel' && !WHEEL_STYLES.some(w => w.id === it.id)) WHEEL_STYLES.push({ id: it.id, name: it.name, price: 0, spokes: it.spokes, deep: it.deep, rim: it.rim, chest: 1 }); if (it.type === 'decal' && !DECALS.some(x => x.id === it.id)) DECALS.push({ id: it.id, name: it.name, price: 0, chest: 1 }); }
}
// 称号・マフラーのアイコン
const _iconOld = itemIconSvg;
itemIconSvg = function (it, size = 34) { if (it.type === 'title') return `<svg width="${size}" height="${size}" viewBox="0 0 40 40"><path d="M6 12h28l-3 18H9z" fill="${RARITY[it.rarity].color}"/><path d="M6 12l7 7 7-11 7 11 7-7" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/><rect x="9" y="30" width="22" height="4" rx="1" fill="#fff" opacity=".8"/></svg>`;
  if (it.type === 'muffler') return `<svg width="${size}" height="${size}" viewBox="0 0 40 40"><rect x="4" y="15" width="22" height="10" rx="3" fill="#8a8d94"/><ellipse cx="30" cy="20" rx="7" ry="8" fill="${it.mf === 'titanium' ? '#7a8aff' : it.mf === 'straight' ? '#ffb300' : '#c8ccd4'}"/><ellipse cx="30" cy="20" rx="4" ry="5" fill="#111"/></svg>`;
  return _iconOld(it, size); };

// ---- パックのデザイン ----
const PACK_ART = { free: { a: '#0b3a22', b: '#2fdc7a', t: 'DAILY' }, bronze: { a: '#3a1e08', b: '#e08a3a', t: 'BRONZE' }, silver: { a: '#1c2028', b: '#d8dde6', t: 'SILVER' }, gold: { a: '#3a2600', b: '#ffcf3d', t: 'GOLD' }, legend: { a: '#1a0630', b: '#c06bff', t: 'LEGEND' } };
function packHTML(c, size = 1) { const A = PACK_ART[c.id] || PACK_ART.silver; return `<div class="pk pk-${c.id}" style="--pa:${A.a};--pb:${A.b};--ps:${size}"><div class="pk-tear"></div><div class="pk-foil"></div><div class="pk-in"><small>DRIFT LEGENDS</small><div class="pk-ic">${chestIcon(c, 64)}</div><b>${A.t}</b><em>${c.name}</em><span class="pk-stripes"></span></div></div>`; }

// ---- 効果音（カードパック専用。その他の効果音バスに流す） ----
Object.assign(AUDIO, {
  pkSelect() { this.tone(520, 0.06, 'triangle', 0.08); this.tone(780, 0.08, 'triangle', 0.07, 0.05); },
  pkButton() { this.tone(330, 0.12, 'square', 0.08); this.tone(660, 0.14, 'square', 0.08, 0.08); this.noiseBurst(0.2, 1200, 1, 0.06, 0.05); },
  pkCharge() { this.tone(110, 0.9, 'sawtooth', 0.06, 0, 4); this.noiseBurst(0.9, 800, 0.8, 0.08, 0, 'lowpass'); },
  pkTear() { this.noiseBurst(0.35, 4000, 0.6, 0.25, 0, 'highpass'); this.noiseBurst(0.25, 1500, 1.5, 0.15, 0.05); this.tone(90, 0.3, 'sine', 0.25, 0, 0.5); },
  pkCardOut(i = 0) { this.noiseBurst(0.18, 2600 + i * 200, 2, 0.1, 0, 'bandpass'); },
  pkFlip() { this.noiseBurst(0.12, 3200, 3, 0.08); this.tone(1200, 0.05, 'sine', 0.04, 0.05); },
  pkReveal(r) { this.duckMusic(r === 'L' ? 0.2 : 0.5, r === 'L' ? 3 : 1.2);
    if (r === 'C') this.tone(880, 0.15, 'triangle', 0.08);
    else if (r === 'U') { this.tone(880, 0.12, 'triangle', 0.09); this.tone(1175, 0.18, 'triangle', 0.09, 0.08); }
    else if (r === 'R') [784, 988, 1319].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.1, i * 0.07));
    else if (r === 'E') { [659, 831, 988, 1319, 1661].forEach((f, i) => this.tone(f, 0.35, 'sawtooth', 0.06, i * 0.06)); this.noiseBurst(0.8, 6000, 0.5, 0.06, 0.1, 'highpass'); this.tone(165, 0.6, 'sine', 0.2, 0, 0.5); }
    else { this.tone(55, 1.2, 'sine', 0.35, 0, 0.6); [523, 659, 784, 1046, 1318, 1568, 2093].forEach((f, i) => this.tone(f, 0.6, 'square', 0.07, 0.15 + i * 0.08)); [1046, 1318, 1568].forEach(f => this.tone(f, 1.6, 'triangle', 0.08, 0.8)); this.noiseBurst(1.5, 8000, 0.4, 0.08, 0.2, 'highpass'); } },
  pkDone() { [523, 784, 1046].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.1, i * 0.08)); }
});

// ---- 開封演出 ----
const PACKFX = {
  open(c, res) { // res: [{it, g}] は開始前に確定・保存済み
    this.c = c; this.res = res; this.i = -1; this.busy = true; this.done = false; clearTimeout(this._t);
    let o = document.getElementById('packFx'); if (!o) { o = document.createElement('div'); o.id = 'packFx'; document.body.appendChild(o); o.addEventListener('click', e => this.onClick(e)); o.addEventListener('touchmove', e => e.preventDefault(), { passive: false }); }
    o.className = 'show'; o.innerHTML = `<canvas id="pfxCv"></canvas><div class="pfx-rays"></div><div class="pfx-flash"></div><div class="pfx-stage">${packHTML(c, 1.25)}</div><div class="pfx-cards"></div><div class="pfx-ui"><button class="btn pri big pfx-open" data-p="open">OPEN PACK</button><div class="pfx-tip"></div></div><button class="pfx-skip" data-p="skip">SKIP ANIMATION ▶▶</button><div class="pfx-sum"></div>`;
    this.o = o; this.cv = o.querySelector('#pfxCv'); this.parts = []; this.fit(); this.loop();
    const pk = o.querySelector('.pk'); pk.classList.add('enter'); AUDIO.pkSelect();
    this._t = setTimeout(() => { pk.classList.remove('enter'); pk.classList.add('float'); this.busy = false; }, 800);
  },
  fit() { const d = window.devicePixelRatio > 1 ? 1.5 : 1; this.cv.width = innerWidth * d; this.cv.height = innerHeight * d; this.cv.style.width = '100%'; this.cv.style.height = '100%'; this.dpr = d; },
  burst(n, col, x = 0.5, y = 0.45, sp = 1) { const W = this.cv.width, H = this.cv.height; for (let k = 0; k < n; k++) { const a = Math.random() * Math.PI * 2, v = (2 + Math.random() * 7) * sp * this.dpr; this.parts.push({ x: W * x, y: H * y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2 * this.dpr, life: 1, col: col[Math.floor(Math.random() * col.length)], s: (2 + Math.random() * 4) * this.dpr }); } },
  loop() { if (!this.o || !this.o.classList.contains('show')) return; const g = this.cv.getContext('2d'); g.clearRect(0, 0, this.cv.width, this.cv.height); g.globalCompositeOperation = 'lighter';
    this.parts = this.parts.filter(p => p.life > 0); for (const p of this.parts) { p.x += p.vx; p.y += p.vy; p.vy += 0.12 * this.dpr; p.vx *= 0.985; p.life -= 0.012; g.globalAlpha = Math.max(0, p.life); g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, p.s * (0.5 + p.life), 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; requestAnimationFrame(() => this.loop()); },
  onClick(e) { const b = e.target.closest('[data-p]'); const act = b ? b.dataset.p : 'tap'; e.stopPropagation();
    if (act === 'skip') return this.summary(true); if (act === 'confirm') return this.close();
    if (this.busy || this.done) return;
    if (act === 'open' && this.i < 0) return this.tear();
    if (act === 'tap' && this.i >= 0) this.next(); },
  tear() { this.busy = true; const o = this.o, pk = o.querySelector('.pk'); o.querySelector('.pfx-open').classList.add('hide'); AUDIO.pkButton(); const top = this.topRar();
    setTimeout(() => { pk.classList.remove('float'); pk.classList.add('charge', 'r-' + top); AUDIO.pkCharge(); }, 150);
    setTimeout(() => { pk.classList.add('torn'); AUDIO.pkTear(); o.querySelector('.pfx-flash').className = 'pfx-flash go r-' + top; this.burst(top === 'L' ? 160 : top === 'E' ? 110 : 60, this.cols(top)); }, 1150);
    setTimeout(() => { pk.classList.add('away'); this.deal(); }, 1600); },
  topRar() { return this.res.reduce((m, r) => RAR_ORDER.indexOf(r.it.rarity) > RAR_ORDER.indexOf(m) ? r.it.rarity : m, 'C'); },
  cols(r) { return { C: ['#ffffff', '#b0b8c0'], U: ['#2fdc7a', '#bfffd8'], R: ['#3a8cff', '#9ad0ff', '#ffffff'], E: ['#b04dff', '#e0b0ff', '#ff6ae8'], L: ['#ffd700', '#fff1a8', '#ffb300', '#ffffff'] }[r]; },
  deal() { const box = this.o.querySelector('.pfx-cards'); box.innerHTML = this.res.map((r, k) => { const it = r.it, R = RARITY[it.rarity];
      return `<div class="cardx r-${it.rarity}" style="--rc:${R.color};--k:${k};--n:${this.res.length}"><div class="cx-in"><div class="cx-back"><div class="cx-logo">DL</div><small>DRIFT LEGENDS</small></div><div class="cx-front"><div class="cx-rar">${R.name}</div><div class="cx-ic">${itemIconSvg(it, 92)}</div><b>${esc(it.name)}</b><small>${esc(ITEM_TYPES[it.type] || '')}${it.desc ? '・' + esc(it.desc) : ''}</small><em>${r.g.isNew ? 'NEW!' : '重複 → ' + yen(r.g.refund)}</em></div></div></div>`; }).join('');
    [...box.children].forEach((el, k) => setTimeout(() => { el.classList.add('out'); AUDIO.pkCardOut(k); }, 80 + k * 110));
    setTimeout(() => { this.busy = false; this.next(); }, 260 + this.res.length * 110); },
  next() { const cards = [...this.o.querySelectorAll('.cardx')]; if (this.i >= 0 && cards[this.i]) cards[this.i].classList.add('gone'); this.i++;
    if (this.i >= cards.length) return this.summary(false);
    const el = cards[this.i], r = this.res[this.i].it.rarity; this.busy = true; el.classList.add('focus'); this.o.querySelector('.pfx-tip').textContent = `${this.i + 1} / ${cards.length}`;
    const legend = r === 'L', epic = r === 'E';
    if (legend) { this.o.querySelector('.pfx-rays').className = 'pfx-rays on'; AUDIO.tone(70, 1, 'sine', 0.25, 0, 0.7); }
    setTimeout(() => { el.classList.add('flip'); AUDIO.pkFlip(); }, legend ? 900 : epic ? 500 : 250);
    setTimeout(() => { el.classList.add('shown'); AUDIO.pkReveal(r); if (r !== 'C') this.burst(legend ? 200 : epic ? 120 : r === 'R' ? 60 : 25, this.cols(r), 0.5, 0.45, legend ? 1.4 : 1); if (legend) this.o.querySelector('.pfx-flash').className = 'pfx-flash go big r-L'; this.o.querySelector('.pfx-tip').textContent = this.i + 1 < cards.length ? 'タップで次のカードへ' : 'タップで結果へ'; this.busy = false; }, legend ? 1350 : epic ? 900 : 600);
    if (!legend) this.o.querySelector('.pfx-rays').className = 'pfx-rays'; },
  summary(skipped) { if (this.done) return; this.done = true; this.busy = true; clearTimeout(this._t); const o = this.o; o.classList.add('sum');
    const top = this.topRar(); if (skipped) AUDIO.pkReveal(top); else AUDIO.pkDone();
    const refund = this.res.reduce((s, r) => s + (r.g.refund || 0), 0);
    o.querySelector('.pfx-sum').innerHTML = `<h2>獲得アイテム</h2><div class="pfx-grid">${this.res.map(r => `<div class="pfx-it r-${r.it.rarity}" style="--rc:${RARITY[r.it.rarity].color}">${itemIconSvg(r.it, 48)}<b>${esc(r.it.name)}</b><small>${RARITY[r.it.rarity].name}${r.g.isNew ? ' ・ NEW!' : ' ・ 重複 → ' + yen(r.g.refund)}</small></div>`).join('')}</div>${refund ? `<div class="note" style="text-align:center">重複分 ${yen(refund)} を受け取りました</div>` : ''}<button class="btn pri big" data-p="confirm">CONFIRM</button>`; },
  close() { const o = this.o; if (!o) return; o.className = ''; o.innerHTML = ''; this.parts = []; UI.refreshTop(); if (UI.screen === 'chest' || UI.screen === 'bag') UI.render(); if (this.res && this.res.some(r => r.it.type === 'car')) UI.toast('ガレージに限定車が追加されました！'); }
};
addEventListener('resize', () => { if (PACKFX.cv && PACKFX.o && PACKFX.o.classList.contains('show')) PACKFX.fit(); });

Object.assign(UI, {
  // ---- カードパック → カードパック（報酬は演出の前に確定・保存） ----
  a_openChest(v) {
    const [id, ns] = String(v).split(':'); const n = Math.max(1, Math.min(10, +ns || 1)); const c = CHESTS.find(x => x.id === id); const d = SAVE.data; if (!c) return;
    if (PACKFX.o && PACKFX.o.classList.contains('show')) return; // 開封中の二重操作を防止
    if (c.daily) { if (d.chest.freeDate === srvDateKey()) return this.toast('本日の無料パックは受取済みです'); }
    else if (!SAVE.spend(c.price * n)) return;
    if (c.daily) d.chest.freeDate = srvDateKey();
    const res = [], bonus = []; d.boosts = d.boosts || {};
    for (let k = 0; k < (c.daily ? 1 : n); k++) { let cc = c; if (d.boosts.luck > 0) { d.boosts.luck--; const o = Object.assign({}, c.odds); const take = (o.C || 0) * 0.5 + (o.U || 0) * 0.3; o.C = (o.C || 0) * 0.5; o.U = (o.U || 0) * 0.7; const hiSum = RAR_ORDER.filter(r => r !== 'C' && r !== 'U').reduce((s, r) => s + (o[r] || 0), 0) || 1; for (const r of RAR_ORDER) if (r !== 'C' && r !== 'U') o[r] = (o[r] || 0) + take * (o[r] || 0) / hiSum; cc = Object.assign({}, c, { odds: o }); }
      const it = rollChest(cc); res.push({ it, g: grantChestItem(it) }); if (c.daily || Math.random() < 0.2) { const cn = randCons(Math.random, !!c.daily); giveCons(cn.id); bonus.push(cn); } }
    const pid = 'p' + SRV.now().toString(36) + Math.random().toString(36).slice(2, 6);
    d.packLog = [{ id: pid, pack: c.id, t: SRV.now(), items: res.map(r => [r.it.id, r.g.isNew ? 1 : 0, r.g.refund || 0]) }].concat(d.packLog || []).slice(0, 60);
    d.stats.chests = (d.stats.chests || 0) + res.length; SAVE.save(); this.refreshTop();
    try { if (window.DL_FB && DL_FB.isGoogle()) DL_FB.db().ref('packs/' + DL_FB.user.uid + '/' + pid).set({ pack: c.id, items: res.map(r => r.it.id), t: firebase.database.ServerValue.TIMESTAMP }).catch(() => { }); } catch (e) { }
    if (bonus.length) setTimeout(() => this.toast('おまけ：' + bonus.map(b => b.name).join('・') + ' をバックパックに追加'), 400);
    PACKFX.open(c, res);
  },
  packChestHTML() {
    const d = SAVE.data, today = srvDateKey(), freeOk = d.chest.freeDate !== today; let h = `<div class="note">カードパックを開けると、車・ホイール・エアロパーツ・スポイラー・ボンネット・マフラー・デカール・限定カラー・ガレージ装飾・称号などが出ます。結果は開封前に確定・保存されるので、演出をスキップしても受け取れます。</div><div class="pack-grid">`;
    for (const c of CHESTS) { const can = c.daily ? freeOk : true;
      h += `<div class="pack-card" style="--pa:${(PACK_ART[c.id] || {}).a};--pb:${(PACK_ART[c.id] || {}).b}">${packHTML(c, 0.62)}<div class="pc-info"><b>${c.name.replace('カードパック', 'パック')}</b><small>${c.daily ? (freeOk ? '本日 1回無料' : '明日 0:00 に再び開けられます') : yen(c.price) + ' / 1パック'}</small>
        <table class="odds"><tr>${RAR_ORDER.map(r => `<th style="color:${RARITY[r].color}">${RARITY[r].name}</th>`).join('')}</tr><tr>${RAR_ORDER.map(r => `<td>${c.odds[r] || 0}%</td>`).join('')}</tr></table>
        ${c.daily ? `<button class="btn pri" data-a="openChest" data-v="${c.id}:1" ${can ? '' : 'disabled'}>${freeOk ? '無料で開ける' : '受取済み'}</button>` : `<div class="ch-multi">${[1, 3, 5, 10].map(n => `<button class="btn ${n === 1 ? 'pri' : ''}" data-a="openChest" data-v="${c.id}:${n}">×${n}<small>${yen(c.price * n)}</small></button>`).join('')}</div>`}</div></div>`; }
    h += `</div><div class="h3">提供割合・重複のルール</div><div class="note">表の確率でレア度が決まり、そのレア度のアイテムから均等に1つ選ばれます。すでに持っているアイテムが出た場合は、レア度に応じたお金に変換されます：${RAR_ORDER.map(r => `<b style="color:${RARITY[r].color}">${RARITY[r].name}</b> ${yen(RARITY[r].dup)}`).join(' ／ ')}（所持数は増えます）。</div>`;
    return h;
  },
  // ---- インベントリ（バックパックのアイテム） ----
  invHTML() {
    const d = SAVE.data, inst = SAVE.cur(); const cats = ['all', 'car', 'wheel', 'kit', 'paint', 'decal', 'muffler', 'neon', 'caliper', 'plate', 'meter', 'tune', 'bg', 'title', 'music'];
    this.invCat = this.invCat || 'all'; this.invRar = this.invRar || 'all'; this.invOwn = this.invOwn || 'own';
    let list = ITEMS.filter(i => (this.invCat === 'all' || i.type === this.invCat) && (this.invRar === 'all' || i.rarity === this.invRar) && (this.invOwn === 'all' || invHas(i.id)) && !(i.lim && !invHas(i.id)));
    list.sort((a, b) => RAR_ORDER.indexOf(b.rarity) - RAR_ORDER.indexOf(a.rarity));
    const total = ITEMS.filter(i => !i.lim).length, own = ITEMS.filter(i => invHas(i.id)).length;
    let h = `<div class="inv-head"><b>${own}</b><small>/ ${total} 種類を所持</small><span class="ach-bar"><i style="width:${own / total * 100}%"></i></span></div>`;
    h += `<div class="chips">${cats.map(k => `<button class="chip2 ${this.invCat === k ? 'on' : ''}" data-a="invCat" data-v="${k}">${k === 'all' ? 'すべて' : ITEM_TYPES[k] || k}</button>`).join('')}</div>`;
    h += `<div class="chips">${['all'].concat(RAR_ORDER).map(r => `<button class="chip2 ${this.invRar === r ? 'on' : ''}" data-a="invRar" data-v="${r}" ${r !== 'all' ? `style="border-color:${RARITY[r].color}"` : ''}>${r === 'all' ? '全レア度' : RARITY[r].name}</button>`).join('')}<button class="chip2 ${this.invOwn === 'all' ? 'on' : ''}" data-a="invOwn" data-v="${this.invOwn === 'all' ? 'own' : 'all'}">${this.invOwn === 'all' ? '未所持も表示中' : '所持のみ表示中'}</button></div>`;
    h += `<div class="note">カードをタップすると、今の車（${esc(CAR_BY_ID[inst.id].name)}）に付けた状態をプレビューできます。装着状態は車ごとに保存されます。</div>`;
    h += `<div class="inv-grid">${list.slice(0, 240).map(it => { const has = invHas(it.id), eq = has && itemEquipped(it, inst), can = has && EQUIPPABLE.includes(it.type);
      return `<div class="inv-it ${has ? '' : 'lock'} ${eq ? 'eq' : ''}" style="--rc:${RARITY[it.rarity].color}" data-a="invPrev" data-v="${it.id}"><div class="ii-ic">${itemIconSvg(it, 44)}</div><b>${esc(it.name)}</b><small>${RARITY[it.rarity].name}${(d.inv[it.id] || 0) > 1 ? ' ・ ×' + d.inv[it.id] : ''}</small>${can ? `<button class="btn ${eq ? 'ghost' : 'pri'}" data-a="${eq ? 'invOff' : 'invOn'}" data-v="${it.id}">${eq ? '外す' : '装着'}</button>` : has ? '' : '<em>未所持</em>'}</div>`; }).join('') || '<div class="note">該当するアイテムがありません。</div>'}</div>`;
    return h;
  },
  logHTML() { const L = SAVE.data.packLog || []; if (!L.length) return '<div class="note">まだカードパックを開けていません。</div>';
    return `<div class="lb-list">${L.map(e => `<div class="lb-row" style="align-items:flex-start"><span class="rk">${ICO('gift', (PACK_ART[e.pack] || {}).b || '#ffcf3d', 22)}</span><span class="nm">${esc((CHESTS.find(c => c.id === e.pack) || {}).name || e.pack)} ×${e.items.length}<small style="display:block;font-size:10px;color:#999;font-weight:400">${new Date(e.t).toLocaleString()}</small><span style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${e.items.map(([id, nw]) => { const it = ITEM_BY_ID[id]; return it ? `<span class="log-chip" style="border-color:${RARITY[it.rarity].color}">${esc(it.name)}${nw ? ' <b>NEW</b>' : ''}</span>` : ''; }).join('')}</span></span></div>`).join('')}</div>`; },
  a_invCat(v) { this.invCat = v; this.render(); }, a_invRar(v) { this.invRar = v; this.render(); }, a_invOwn(v) { this.invOwn = v; this.render(); },
  a_invPrev(id) { const it = ITEM_BY_ID[id]; if (!it) return; if (it.type === 'car') { const c = CAR_BY_ID[it.car]; return this.show.setCar({ id: c.id, tune: defaultTune(c), look: defaultLook(c) }); } if (!['wheel', 'paint', 'decal', 'neon', 'plate', 'caliper', 'kit', 'muffler'].includes(it.type)) return; const sim = JSON.parse(JSON.stringify(SAVE.cur())); itemApply(it, sim, true); this.show.setCar(sim, true); },
  a_invOn(id) { const it = ITEM_BY_ID[id]; if (!it || !invHas(id)) return; const inst = SAVE.cur(); const err = itemApply(it, inst, true); if (err) return this.toast(err); SAVE.save(); this.show.setCar(inst, true); if (it.type === 'bg') this.show.rebuildStudio(); this.toast(it.name + ' を装着しました'); this.render(); },
  a_invOff(id) { const it = ITEM_BY_ID[id]; if (!it) return; const inst = SAVE.cur(); itemApply(it, inst, false); SAVE.save(); this.show.setCar(inst, true); if (it.type === 'bg') this.show.rebuildStudio(); this.toast(it.name + ' を外しました'); this.render(); }
});
