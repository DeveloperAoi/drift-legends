// =====================================================================
// v32.js — v3.2：軽トラ（ショップ）＋フルチューン版（パック限定）・フルチューンチケット
//          ストーリーのレース中セリフ・湾岸風の車選択画面・エンジン音の強化
// =====================================================================
addCar(['hk_kt', 'HOKUTO', 'MINI-TRUCK KT', '軽トラック（5MT・後輪駆動）', 'FR', 64, 90, 760, 135, 5, 6800, 0, 62, 70, 55, 900000, 'ktruck', 3.39, 1.47, 1.78, '#f4f4f2', 0, 'i4', 1.9, 0.55, null]);
addCar(['hk_kt_ft', 'HOKUTO', 'MINI-TRUCK KT "FULL TUNE"', '軽トラック フルチューン仕様（カードパック限定）', 'FR', 230, 260, 690, 215, 6, 9500, 1, 84, 92, 80, 0, 'ktruck', 3.39, 1.47, 1.70, '#e8202a', 0, 'i4', 1.9, 0.52, { chest: 1 }]);
CAR_BY_ID.hk_kt.isNew = '3.2'; CAR_BY_ID.hk_kt_ft.isNew = '3.2';
addItem({ id: 'car_hk_kt_ft', type: 'car', name: 'MINI-TRUCK KT "FULL TUNE"（軽トラ・フルチューン）', en: 'MINI-TRUCK KT "FULL TUNE" (kei truck)', rarity: 'E', car: 'hk_kt_ft' });
ITEM_TYPES.ticket = 'チケット';
addItem({ id: 'tk_full', type: 'ticket', name: 'フルチューンチケット', en: 'Full Tune Ticket', rarity: 'L', desc: '好きな車を1台フルチューンできる' });
for (const it of ITEMS) ITEM_BY_ID[it.id] = it;
{ const _has = invHas; invHas = function (id) { const it = ITEM_BY_ID[id]; if (it && it.type === 'ticket') return false; return _has(id); };
  const _g = grantChestItem; grantChestItem = function (it) { if (it && it.type === 'ticket') { const d = SAVE.data; d.tickets = d.tickets || {}; d.tickets[it.id] = (d.tickets[it.id] || 0) + 1; return { isNew: true, refund: 0 }; } return _g(it); };
  const _ds = dailyShop; dailyShop = function (k) { return _ds(k).filter(i => i.type !== 'ticket'); };
  const _ic = itemIconSvg; itemIconSvg = function (it, size = 34) { if (it && it.type === 'ticket') return `<svg width="${size}" height="${size}" viewBox="0 0 40 40"><path d="M4 12h32v5a3 3 0 0 0 0 6v5H4v-5a3 3 0 0 0 0-6z" fill="#ffb300" stroke="#7a4a00" stroke-width="1.5"/><path d="M14 13v14" stroke="#7a4a00" stroke-dasharray="2 2"/><text x="25" y="23.5" font-size="8" font-weight="900" text-anchor="middle" fill="#3a2000">FULL</text></svg>`; return _ic(it, size); };
  // チケットはパックから低い確率で（レジェンダリーのうち約1/4程度）
  const _rc = rollChest; rollChest = function (chest, rnd = Math.random) { const it = _rc(chest, rnd); const def = CHESTS.find(x => x.id === chest.id) || chest; if (!def.pool && it && it.rarity === 'L' && it.type !== 'ticket' && rnd() < 0.25) return ITEM_BY_ID.tk_full; if (it && it.type === 'ticket' && rnd() < 0.6) { const L = ITEMS.filter(i => i.rarity === 'L' && i.type !== 'ticket' && !i.lim && i.type !== 'carcard'); return L[Math.floor(rnd() * L.length)] || it; } return it; }; }
function fullTune(inst) {
  const t = inst.tune; t.owned = t.owned || {};
  for (const [k, p] of Object.entries(PARTS)) {
    if (p.lv) { const m = p.lv.length - 1; t[k] = m; t.owned[k] = Math.max(t.owned[k] || 0, m); }
    else if (k === 'engine' || k === 'diff') { const best = k === 'engine' ? (p.opts.find(o => o.id === 'twin') || p.opts[p.opts.length - 1]) : (p.opts.find(o => o.id === '2way') || p.opts[p.opts.length - 1]); t[k] = best.id; t.owned[k] = t.owned[k] || ['stock', 'open']; if (!t.owned[k].includes(best.id)) t.owned[k].push(best.id); }
  }
  inst.fullTuned = true;
}
Object.assign(UI, {
  a_useTicket() { const d = SAVE.data, n = (d.tickets || {}).tk_full || 0, inst = SAVE.cur(); if (!n) return this.toast('フルチューンチケットを持っていません');
    this.modal(`<h2>フルチューンチケット</h2><div class="note">「${esc(CAR_BY_ID[inst.id].name)}」のエンジン・吸排気・足まわり・ブレーキ・軽量化などをすべて最高レベルにします（エンジンはツインチャージャー、デフは2WAY）。<br>チケットを1枚使います（残り ${n} 枚）。</div><div class="btns"><button class="btn" data-a="closeModal">やめる</button><button class="btn pri" data-a="useTicketGo">フルチューンする</button></div>`); },
  a_useTicketGo() { const d = SAVE.data; if (!((d.tickets || {}).tk_full > 0) || this._tkBusy) return; this._tkBusy = true; try { d.tickets.tk_full--; fullTune(SAVE.cur()); SAVE.save(); AUDIO.levelUp && AUDIO.levelUp(); } finally { this._tkBusy = false; }
    this.closeModal(); this.toast('フルチューン完了！'); this.show.setCar(SAVE.cur(), true); this.render(); },
  a_closeModal() { this.closeModal(); }
});
{ const _g = UI.r_garage; UI.r_garage = function (a) { const h = _g.call(this, a); const n = (SAVE.data.tickets || {}).tk_full || 0; return n ? `<div class="tk-bar">${itemIconSvg(ITEM_BY_ID.tk_full, 30)}<span><b>フルチューンチケット ×${n}</b><small>選択中の車を一瞬でフルチューン</small></span><button class="btn pri" data-a="useTicket">使う</button></div>` + h : h; }; }

// ---------------- ストーリー：レース中のライバルのセリフ（オリジナルの台詞） ----------------
const TALK = {
  start: ['…ついて来られるなら、来てみろ。', 'この道は、速さだけじゃ走れない。', '今夜の空気は悪くない。全開でいく。', 'オレの後ろが、一番いい景色だろう？', '迷いがあるうちは、この道に置いていかれるぜ。'],
  passed: ['…抜かれた？ 面白い。', 'そのライン…どこで覚えた。', 'まだだ。勝負はこの先にある。', 'クルマが応えてる…お前、本気だな。'],
  lead: ['取り返したぞ。', '一瞬の迷いが、命取りになる。', 'ここからはオレの道だ。', 'アクセルを抜いたな。見えてるぞ。'],
  far: ['見えなくなるのも時間の問題だ。', '速いクルマは、ドライバーを選ぶ。', 'お前のクルマは、まだ眠ってる。'],
  close: ['背中が熱い…いいプレッシャーだ。', 'その距離、悪くない。', 'ミラーにずっと映ってるな。'],
  final: ['ラストだ。全部出し切れ！', '答えはゴールにある。', 'この一瞬のために走ってきた。']
};
const STALK = { on: false, el: null, show(rv, text) { try { text = I18N.tr(text); } catch (e) { } let el = document.getElementById('rvTalk'); if (!el) { el = document.createElement('div'); el.id = 'rvTalk'; el.classList.add('noi18n'); document.getElementById('hud').appendChild(el); }
    const col = rv.color || '#888'; el.innerHTML = `<div class="rt-av" style="--rc:${col}">${esc((rv.name || '?').trim()[0])}</div><div class="rt-m"><b>${esc(rv.name)}</b><small>${esc(rv.team || '')}</small><p></p></div>`; el.className = 'noi18n show';
    const p = el.querySelector('p'); let i = 0; clearInterval(this._ti); clearTimeout(this._to); this._ti = setInterval(() => { p.textContent = text.slice(0, ++i); if (i % 2 === 0 && AUDIO.talkBlip) AUDIO.talkBlip(); if (i >= text.length) clearInterval(this._ti); }, 45);
    this._to = setTimeout(() => { el.className = 'noi18n'; }, 2600 + text.length * 45); },
  hide() { const el = document.getElementById('rvTalk'); if (el) el.className = ''; clearInterval(this._ti); }
};
AUDIO.talkBlip = function () { if (!this.ok) return; try { const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.type = 'square'; o.frequency.value = 520 + Math.random() * 120; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05 * (this.vol.ui ?? 0.8), t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); o.connect(g); g.connect(this.uiBus || this.sfxBus || c.destination); o.start(t); o.stop(t + 0.06); } catch (e) { } };
{ const _u = Game.prototype.update; Game.prototype.update = function (dt) { _u.call(this, dt); try { storyTalk(this); } catch (e) { } };
  const _s = Game.prototype.start; Game.prototype.start = function (cfg) { this._talk = { said: {}, next: 0, ahead: null }; STALK.hide(); return _s.apply(this, arguments); }; }
function storyTalk(g) {
  if (!g.active || !g.cfg || g.cfg.mode !== 'story' || !g.rivals || !g.rivals[0] || g.finished || !g.started) return;
  const T = g._talk || (g._talk = { said: {}, next: 0, ahead: null }), rv = g.rivals[0], ch = STORY.find(s => s.id === g.cfg.story); if (!ch) return;
  const rdef = ch.rival, t = g.raceT, pick = k => { const L = (ch.talk && ch.talk[k]) || TALK[k]; return L[Math.floor(Math.random() * L.length)]; };
  const say = (k, once = true) => { if (t < T.next || (once && T.said[k])) return false; T.said[k] = (T.said[k] || 0) + 1; T.next = t + 7; STALK.show(rdef, pick(k)); return true; };
  if (t > 1.5 && !T.said.start) return say('start');
  const gap = g.totalDist - rv.prog, ahead = gap > 0;
  if (T.ahead !== null && ahead !== T.ahead && Math.abs(gap) > 2 && t > 5) { T.ahead = ahead; return say(ahead ? 'passed' : 'lead', false); }
  T.ahead = ahead;
  const laps = g.cfg.laps || 1, total = g.track.length * laps, left = total - g.totalDist;
  if (left < 450 && left > 0) return say('final');
  if (!ahead && -gap > 160) return say('far');
  if (ahead && gap < 25 && t > 20) return say('close');
}

// ---------------- 湾岸風の車選択画面 ----------------
{ const _cs = UI.r_carsel; UI.r_carsel = function (cfg) {
    _cs.call(this, cfg); $('panelTitle').textContent = 'SELECT CAR'; $('panelBody').classList.add('wide'); const d = SAVE.data, inst = d.cars.find(c => c.uid === this.sel) || SAVE.cur(), spec = this.instSpec(inst).stats, car = CAR_BY_ID[inst.id], m = MAP_BY_ID[cfg.mapId];
    const seg = (v, max, n = 20) => { const k = Math.round(clamp(v / max, 0, 1) * n); return `<span class="ws-seg">${Array.from({ length: n }, (_, i) => `<i class="${i < k ? 'on' : ''}${i < k && i >= n * 0.75 ? ' hot' : ''}"></i>`).join('')}</span>`; };
    let h = `<div class="ws-wrap"><div class="ws-course"><small>COURSE</small><b>${m.jp}</b><span>${m.name} ・ ${{ time: 'TIME ATTACK', touge: 'DRIFT CHALLENGE', free: 'FREE RUN', race: 'RACE' }[cfg.mode] || ''}</span></div><div class="ws-list">`;
    for (const c of this.sortedCars()) { const cd = CAR_BY_ID[c.id]; h += `<button class="ws-car ${c.uid === inst.uid ? 'on' : ''}" data-a="selCarSel" data-v="${c.uid}"><span class="ws-nm">${cd.name}</span><span class="ws-sub">${cd.maker} ・ ${cd.drive}</span><span class="ws-ps">${c.tune && c.tune.engine !== 'stock' ? '<small>TUNED </small>' : ''}${Math.round(cd.hp)}<small>PS</small></span>${c.uid === d.current ? '<i class="ws-cur">使用中</i>' : ''}${c.fav ? '<i class="ws-fav">★</i>' : ''}</button>`; }
    h += `</div><div class="ws-plate"><div class="ws-mk">${car.maker}</div><div class="ws-big">${car.name}</div><div class="ws-era">${car.era}</div>
      <div class="ws-specs"><div><label>POWER</label>${seg(spec.power, 900)}<b>${Math.round(spec.power)} PS</b></div><div><label>TORQUE</label>${seg(spec.torque, 900)}<b>${Math.round(spec.torque)} Nm</b></div><div><label>TOP SPEED</label>${seg(spec.top, 380)}<b>${Math.round(spec.top)} km/h</b></div><div><label>HANDLING</label>${seg(spec.handling, 100)}<b>${Math.round(spec.handling)}</b></div><div><label>DRIFT</label>${seg(spec.driftScore, 100)}<b>${Math.round(spec.driftScore)}</b></div><div><label>WEIGHT</label>${seg(2000 - spec.weight, 1500)}<b>${Math.round(spec.weight)} kg</b></div></div>
      <button class="ws-start" data-a="startRace"><span>START</span><small>このクルマで走る</small></button></div></div>`;
    this.stageInfo(`<div class="ws-stage"><small>${car.maker}</small><b>${car.name}</b></div>`);
    return h; };
  const _sel = UI.a_selCarSel; UI.a_selCarSel = function (v) { AUDIO.carSelect && AUDIO.carSelect(); return _sel.call(this, v); };
  const _st = UI.a_startRace; UI.a_startRace = function () { AUDIO.carStart && AUDIO.carStart(); return _st.call(this); };
}
AUDIO.carSelect = function () { if (!this.ok) return; try { const c = this.ctx, t = c.currentTime; const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.12); f.type = 'lowpass'; f.frequency.value = 2400; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06 * (this.vol.ui ?? 0.8), t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); o.connect(f); f.connect(g); g.connect(this.uiBus || c.destination); o.start(t); o.stop(t + 0.2); } catch (e) { } };
AUDIO.carStart = function () { if (!this.ok) return; try { const c = this.ctx, t = c.currentTime; for (const [fr, d] of [[440, 0], [660, 0.09], [990, 0.18]]) { const o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = fr; g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.09 * (this.vol.ui ?? 0.8), t + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.35); o.connect(g); g.connect(this.uiBus || c.destination); o.start(t + d); o.stop(t + d + 0.4); } this.noiseBurst && this.noiseBurst(0.35, 600, 1, 0.06); } catch (e) { } };

// ---------------- エンジン音の強化（排気の共鳴・負荷による歪み・回転の微妙な揺らぎ） ----------------
{
  const curve = (() => { const n = 1024, a = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; a[i] = Math.tanh(x * 2.6) / Math.tanh(2.6); } return a; })();
  const RES = { i4: [2.0, 0.22, 4], i6: [1.5, 0.18, 5], v6: [1.0, 0.24, 4], v8: [0.5, 0.36, 3], v12: [1.0, 0.16, 6], diesel: [0.5, 0.2, 2.5], rotary: [1.0, 0.3, 5], flat4: [0.5, 0.32, 3], flat6: [0.75, 0.24, 4], v10: [1.0, 0.2, 5] };
  const _ce = AUDIO.createEngine.bind(AUDIO);
  AUDIO.createEngine = function (spec, isPlayer = true) { const e = _ce(spec, isPlayer); if (!e || !this.ctx) return e; try { const c = this.ctx;
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = (RES[e.sound] || RES.i4)[2]; const sh = c.createWaveShaper(); sh.curve = curve; sh.oversample = '2x'; const rg = c.createGain(); rg.gain.value = 0;
      const pk = c.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 160; pk.Q.value = 1.2; pk.gain.value = 0;
      e.eg.connect(bp); bp.connect(sh); sh.connect(rg); rg.connect(e.pan || e.out); e.lp.disconnect(); e.lp.connect(pk); pk.connect(e.eg);
      Object.assign(e, { xbp: bp, xrg: rg, xpk: pk, jit: 0 }); } catch (x) { } return e; };
  const _ue = AUDIO.updateEngine.bind(AUDIO);
  AUDIO.updateEngine = function (e, s) { _ue(e, s); if (!e || !e.xbp || !this.ok) return; try { const t = this.ctx.currentTime, R = RES[e.sound] || RES.i4, nr = clamp((s.rpm || 0) / (s.redline || 7000), 0, 1.1);
      const fire = (s.rpm || 0) / 60 * (e.cyl || 4) * (e.sound === 'rotary' ? 1.0 : 0.5);
      this.sp(e.xbp.frequency, clamp(fire * R[0] * 2, 70, 1400), t, 0.03);
      const load = clamp((s.thr || 0) * (0.5 + nr * 0.7), 0, 1), distAtt = e.player ? 1 : clamp(1 / (1 + Math.pow((s.dist || 0) / 18, 1.5)), 0, 1);
      this.sp(e.xrg.gain, R[1] * (0.25 + load) * (e.shiftT > 0 ? 0.3 : 1) * (s.interior ? 0.6 : 1) * distAtt * (s.mute ? 0 : 1), t, 0.04);
      this.sp(e.xpk.frequency, clamp(fire * 0.5, 50, 400), t, 0.05); this.sp(e.xpk.gain, 4 + load * 5, t, 0.08);
      e.jit = e.jit * 0.9 + (Math.random() - 0.5) * 6; e.o1.detune.setTargetAtTime(e.jit * (1.2 - nr), t, 0.02); } catch (x) { } };
}
window.__DLX = Object.assign(window.__DLX || {}, { fullTune, STALK, storyTalk });
// v3.0 に追加した内容を、すでに v3.0 のお知らせを見た人にももう一度表示する
{ const _gm = UI.goMenu; UI.goMenu = function () { const d = SAVE.data; if (d && !this._logChk) { this._logChk = true; const n = CHANGELOG[0].items.length; if (d.seenVersion === GAME_VERSION && d.seenLogN !== n) d.seenVersion = GAME_VERSION + '*'; } return _gm.apply(this, arguments); };
  const _rn = UI.r_news; if (_rn) UI.r_news = function () { const r = _rn.apply(this, arguments); try { SAVE.data.seenLogN = CHANGELOG[0].items.length; SAVE.data.seenVersion = GAME_VERSION; SAVE.save(); } catch (e) { } return r; }; }
