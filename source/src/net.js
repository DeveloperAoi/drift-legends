// =====================================================================
// net.js — オンライン対戦（部屋コード制 / claude.ai の room 機能を使用）
// 各プレイヤーは自分の状態を presence に載せ、他プレイヤーの presence を描画する。
// =====================================================================
const NET = {
  room: undefined, named: null, code: '', ready: false, seenSeq: null, lastSend: 0, unsubs: [], status: 'idle', err: '',
  async ensure() {
    if (this.room !== undefined) return this.room;
    try { this.room = (window.claude && typeof window.claude.use === 'function') ? await window.claude.use('room') : null; } catch (e) { this.room = null; }
    return this.room;
  },
  async join(code) {
    const r = await this.ensure(); if (!r) { this.status = 'unavailable'; throw new Error('unavailable'); }
    await this.leave(); this.status = 'joining';
    try { this.named = await r.join('dl-' + code); }
    catch (e) { this.status = 'error'; this.err = e && e.code === 'not_permitted' ? 'この表示ではオンライン部屋に参加できません（招待された人のみ参加できます）' : e && e.code === 'limit_reached' ? '部屋がいっぱいか、混雑しています。少し待ってから試してください' : '接続できませんでした'; throw e; }
    this.code = code; this.ready = false; this.seenSeq = null; this.status = 'joined';
    this.unsubs.push(this.named.onPeers(() => this.onPeers(), () => { this.status = 'error'; this.err = '接続が切れました'; UI.netChanged(); }));
    this.unsubs.push(this.named.onConnection(c => { this.connected = c; UI.netChanged(); }, () => { }));
    this.publishLobby();
  },
  async leave() { for (const u of this.unsubs) try { u(); } catch (e) { } this.unsubs = []; if (this.named) { try { await this.named.leave(); } catch (e) { } } this.named = null; this.code = ''; this.status = 'idle'; },
  peers() { try { return this.named ? this.named.peers().filter(p => p.kind === 'viewer') : []; } catch (e) { return []; } },
  sorted() { return this.peers().slice().sort((a, b) => a.peer < b.peer ? -1 : a.peer > b.peer ? 1 : 0); },
  me() { return this.peers().find(p => p.sameTab); },
  host() { return this.sorted()[0]; },
  isHost() { const h = this.host(); return !!(h && h.sameTab); },
  set(patch) { if (this.named) this.named.presence(patch).catch(() => { }); },
  lookOf(inst) { const l = inst.look; const o = {}; for (const k of ['color', 'color2', 'paint', 'livery', 'wing', 'front', 'rear', 'side', 'hood', 'fender', 'roof', 'wheel', 'wheelColor', 'glow', 'acc', 'number', 'mirror', 'head', 'tail']) if (l[k] !== undefined) o[k] = l[k]; return o; },
  publishLobby(extra) {
    const inst = SAVE.cur(); const p = { nm: String(SAVE.data.settings.nick || 'プレイヤー').slice(0, 16), car: inst.id, lk: this.lookOf(inst), rd: this.ready, race: null };
    if (this.isHost() && UI.netOpt) p.opt = UI.netOpt;
    this.set(Object.assign(p, extra || {}));
  },
  onPeers() {
    const h = this.host();
    if (h && !h.sameTab && h.presence && h.presence.opt) UI.netOpt = Object.assign({}, h.presence.opt);
    const st = h && h.presence && h.presence.start;
    if (this.seenSeq === null) this.seenSeq = st ? st.seq : 0;
    else if (st && st.seq !== this.seenSeq) { this.seenSeq = st.seq; UI.netStart(st); }
    UI.netChanged();
  },
  sendRace(game, force) {
    const now = performance.now(); if (!force && now - this.lastSend < 66) return; this.lastSend = now;
    const v = game.veh, r2 = x => Math.round(x * 100) / 100;
    this.set({ race: { s: game.cfg.seq, p: [r2(v.x), r2(v.y), r2(v.z), Math.round(v.heading * 1000) / 1000, r2(v.speed), r2(v.delta), v.braking > 0.1 ? 1 : 0, r2(Math.abs(v.beta))], d: Math.round(game.totalDist), l: game.lap, f: game.finished && game.myFinish ? Math.round(game.myFinish * 1000) / 1000 : 0 } });
  }
};
