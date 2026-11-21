// =====================================================================
// fbshim.js — GitHub Pages 版：Firebase で claude.ai の room / db / user 機能を再現する
// window.FIREBASE_CONFIG（firebase-config.js）が設定されているときだけ有効
// =====================================================================
(function () {
  const V = '10.12.2', BASE = 'https://www.gstatic.com/firebasejs/' + V + '/';
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || !cfg.databaseURL) { window.DL_STANDALONE = true; return; }
  window.DL_FIREBASE = true;
  const loadJs = src => new Promise((ok, ng) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => ng(new Error('load ' + src)); document.head.appendChild(s); });
  let readyP = null, app, auth, db;
  const FB = window.DL_FB = {
    user: null, listeners: [],
    ready() {
      if (readyP) return readyP;
      readyP = (async () => {
        if (navigator.onLine === false) await new Promise(r => window.addEventListener('online', r, { once: true }));
        await loadJs(BASE + 'firebase-app-compat.js');
        await Promise.all([loadJs(BASE + 'firebase-auth-compat.js'), loadJs(BASE + 'firebase-database-compat.js')]);
        app = firebase.initializeApp(cfg); auth = firebase.auth(); db = firebase.database();
        try { await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (e) { }
        try { await auth.getRedirectResult(); } catch (e) { console.warn(e); }
        await new Promise(res => { const un = auth.onAuthStateChanged(u => { un(); res(u); }); });
        if (!auth.currentUser) await auth.signInAnonymously();
        FB.user = auth.currentUser;
        auth.onAuthStateChanged(u => { const changed = (u && u.uid) !== (FB.user && FB.user.uid); FB.user = u; FB.listeners.forEach(f => { try { f(u, changed); } catch (e) { } }); });
        return true;
      })();
      readyP.catch(e => { console.error('Firebase', e); readyP = null; });
      return readyP;
    },
    onUser(f) { this.listeners.push(f); },
    isGoogle() { const u = this.user; return !!(u && !u.isAnonymous); },
    label() { const u = this.user; if (!u) return '未接続'; if (u.isAnonymous) return 'ゲスト（この端末だけ）'; return (u.displayName || u.email || 'Googleアカウント'); },
    async google() {
      await this.ready(); const prov = new firebase.auth.GoogleAuthProvider(); const cur = auth.currentUser;
      const usePopup = async fn => { try { return await fn(); } catch (e) { if (e && /popup-blocked|operation-not-supported|popup-closed-by-browser|web-storage-unsupported/.test(e.code || '')) { if (cur && cur.isAnonymous) return cur.linkWithRedirect(prov); return auth.signInWithRedirect(prov); } throw e; } };
      if (cur && cur.isAnonymous) {
        try { return await usePopup(() => cur.linkWithPopup(prov)); } // ゲストのデータをそのまま Google に引き継ぐ
        catch (e) { if (e && e.code === 'auth/credential-already-in-use' && e.credential) return auth.signInWithCredential(e.credential); throw e; }
      }
      return usePopup(() => auth.signInWithPopup(prov));
    },
    async logout() { await this.ready(); await auth.signOut(); await auth.signInAnonymously(); },
    db() { return db; }, auth() { return auth; },
    // ---- みんなのプレイ状況（全体カウンター） ----
    stats: { plays: null, players: null, races: null, online: null }, statCbs: [],
    async startStats() {
      try {
        await this.ready(); const inc = k => db.ref('stats/' + k).transaction(v => (v || 0) + 1).catch(() => { });
        inc('plays'); try { if (!localStorage.getItem('dl_counted')) { localStorage.setItem('dl_counted', '1'); inc('players'); } } catch (e) { }
        const fire = () => this.statCbs.forEach(f => { try { f(this.stats); } catch (e) { } });
        db.ref('stats').on('value', s => { const v = s.val() || {}; Object.assign(this.stats, { plays: v.plays || 0, players: v.players || 0, races: v.races || 0 }); fire(); }, () => { });
        db.ref('online').on('value', s => { this.stats.online = s.numChildren(); fire(); }, () => { });
        const goOnline = () => { const u = auth.currentUser; if (!u) return; const r = db.ref('online/' + u.uid); r.onDisconnect().remove(); r.set(firebase.database.ServerValue.TIMESTAMP).catch(() => { }); const path = 'online/' + u.uid; if (this._onPath && this._onPath !== path) db.ref(this._onPath).remove().catch(() => { }); this._onPath = path; };
        goOnline(); auth.onAuthStateChanged(() => goOnline()); db.ref('.info/connected').on('value', s => { if (s.val()) goOnline(); });
      } catch (e) { console.warn('stats', e); }
    },
    countRace() { if (!db) return; db.ref('stats/races').transaction(v => (v || 0) + 1).catch(() => { }); },
    onStats(f) { this.statCbs.push(f); },
    // ---- ユーザーネーム（重複禁止） ----
    profile: { name: null, loaded: false },
    async loadProfile() {
      await this.ready(); const u = auth.currentUser; this.profile = { name: null, loaded: false };
      if (!u || u.isAnonymous) { this.profile.loaded = true; return this.profile; }
      try { const s = await db.ref('profiles/' + u.uid + '/name').get(); this.profile = { name: s.val() || null, loaded: true }; } catch (e) { this.profile = { name: null, loaded: true }; }
      return this.profile;
    },
    checkName(n) { n = String(n || '').trim(); if (n.length < 2 || n.length > 12) return '2〜12文字で入力してください'; if (/[.#$\[\]\/\\\s]/.test(n)) return '使えない文字（空白 . # $ [ ] / \\）が入っています'; if (!/^[0-9A-Za-z_\-\u3041-\u3096\u30a1-\u30fa\u30fc\u4e00-\u9fff]+$/.test(n)) return '使えるのは英数字・ひらがな・カタカナ・漢字・_ - だけです'; return ''; },
    async setName(n) {
      await this.ready(); const u = auth.currentUser; if (!u || u.isAnonymous) throw { code: 'login' };
      n = String(n).trim(); const bad = this.checkName(n); if (bad) throw { code: 'bad', message: bad };
      const key = n.toLowerCase(), old = this.profile.name; if (old && old.toLowerCase() === key && old === n) return n;
      const cur = await db.ref('unames/' + key).get(); if (cur.exists() && cur.val() !== u.uid) throw { code: 'taken' };
      const up = {}; up['unames/' + key] = u.uid; up['profiles/' + u.uid + '/name'] = n; if (old && old.toLowerCase() !== key) up['unames/' + old.toLowerCase()] = null;
      try { await db.ref().update(up); } catch (e) { throw { code: /permission/i.test(e.code || e.message || '') ? 'taken' : 'net', message: e.message }; }
      this.profile.name = n; return n;
    },
    // ---- 週間ランキング ----
    weekKey(off = 0) { const j = new Date(Date.now() + 9 * 3600000); const dow = (j.getUTCDay() + 6) % 7; const mon = new Date(Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate() - dow + off * 7)); return 'w' + mon.toISOString().slice(0, 10).replace(/-/g, ''); },
    weekEnd() { const j = new Date(Date.now() + 9 * 3600000); const dow = (j.getUTCDay() + 6) % 7; return Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate() - dow + 7) - 9 * 3600000; },
    async lbSubmit(board, v, mode = 'max') {
      try { await this.ready(); const u = auth.currentUser; if (!u || u.isAnonymous || !this.profile.name || !isFinite(v) || v <= 0) return false;
        const ref = db.ref('lb/' + this.weekKey() + '/' + board + '/' + u.uid); const n = this.profile.name; let better = false;
        await ref.transaction(cur => { if (mode === 'max' && cur && cur.v >= v && cur.n === n) return; if (mode === 'min' && cur && cur.v <= v && cur.n === n) return; better = !cur || (mode === 'max' ? v > cur.v : mode === 'min' ? v < cur.v : true); const nv = mode === 'max' && cur && cur.v > v ? cur.v : mode === 'min' && cur && cur.v < v ? cur.v : v; return { n, v: nv, t: firebase.database.ServerValue.TIMESTAMP }; });
        return better; } catch (e) { console.warn('lb', e); return false; }
    },
    async lbTop(week, board, lim = 50) {
      await this.ready(); const asc = board.startsWith('ta_'); const q = db.ref('lb/' + week + '/' + board).orderByChild('v'); const s = await (asc ? q.limitToFirst(lim) : q.limitToLast(lim)).get(); const out = []; s.forEach(c => { const v = c.val(); if (v) out.push({ uid: c.key, n: v.n, v: v.v }); }); return asc ? out : out.reverse();
    },
    async lbMine(week, board) { await this.ready(); const u = auth.currentUser; if (!u || u.isAnonymous) return null; const s = await db.ref('lb/' + week + '/' + board + '/' + u.uid).get(); return s.val(); }
  };
  // ---- claude.use 互換 ----
  const wrapErr = e => { const x = new Error(e && e.message || 'error'); x.code = (e && /PERMISSION_DENIED|permission/i.test(e.code || e.message || '')) ? 'not_granted' : 'unavailable'; return x; };
  const dbCap = {
    doc(path) {
      const ref = () => db.ref(path.replace(/^data\/users\//, 'users/').replace(/[.#$\[\]]/g, '_'));
      return {
        async get() { try { const s = await ref().get(); return { exists: s.exists(), data: () => s.val() }; } catch (e) { throw wrapErr(e); } },
        async set(v) { try { await ref().set(v); } catch (e) { throw wrapErr(e); } }
      };
    }
  };
  const userCap = { async id() { await FB.ready(); return FB.user ? FB.user.uid : null; }, async isOwner() {
    await FB.ready(); const u = FB.user; if (!u || u.isAnonymous) return false;
    if ([].concat(cfg.ownerUids || []).includes(u.uid)) return true;
    const hs = [].concat(cfg.ownerEmailSha256 || []); const em = (u.email || (u.providerData || []).map(p => p && p.email).find(Boolean) || '').trim().toLowerCase();
    if (!hs.length || !em || !(window.crypto && crypto.subtle)) return false;
    try { const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(em)); const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''); return hs.includes(hex); } catch (e) { return false; }
  } };
  const tabId = Math.random().toString(36).slice(2, 8);
  const roomCap = {
    async join(name) {
      await FB.ready(); const code = String(name).replace(/^dl-/, '');
      if (!/^[a-z0-9]{3,12}$/.test(code)) { const e = new Error('bad code'); e.code = 'invalid_argument'; throw e; }
      const pid = FB.user.uid.slice(0, 10) + '_' + tabId; const peersRef = db.ref('rooms/' + code + '/peers'), me = peersRef.child(pid);
      let snap; try { snap = await peersRef.get(); } catch (e) { throw wrapErr(e); }
      const now = Date.now(); const live = snap.exists() ? Object.entries(snap.val()).filter(([k, v]) => k !== pid && v && now - (v._t || 0) < 45000) : [];
      if (live.length >= 4) { const e = new Error('full'); e.code = 'limit_reached'; throw e; }
      if (snap.exists()) Object.entries(snap.val()).forEach(([k, v]) => { if (k !== pid && (!v || now - (v._t || 0) > 45000)) peersRef.child(k).remove().catch(() => { }); });
      let mine = { _t: firebase.database.ServerValue.TIMESTAMP, _j: now };
      await me.onDisconnect().remove(); await me.set(mine);
      let list = [], peerCbs = [], connCbs = [], left = false;
      const hb = setInterval(() => { if (!left) me.update({ _t: firebase.database.ServerValue.TIMESTAMP }).catch(() => { }); }, 15000);
      const seenAt = {}, seenJs = {};
      const onVal = s => { const v = s.val() || {}; const t = Date.now();
        list = Object.entries(v).filter(([k, p]) => p && (k === pid || !p._t || t - p._t < 60000)).map(([k, p]) => { const js = JSON.stringify(p.race || p); if (js !== seenJs[k]) { seenJs[k] = js; seenAt[k] = t; }
          return { peer: (p._j || 0).toString(36).padStart(9, '0') + k, kind: 'viewer', sameTab: k === pid, presence: p, updatedAt: seenAt[k] }; });
        peerCbs.forEach(f => { try { f(list); } catch (e) { } }); };
      const onErr = e => peerCbs.forEach(() => { });
      peersRef.on('value', onVal, onErr);
      const connRef = db.ref('.info/connected'); const onConn = s => { const c = !!s.val(); if (c && !left) { me.onDisconnect().remove(); me.update(mine).catch(() => { }); } connCbs.forEach(f => { try { f(c); } catch (e) { } }); };
      connRef.on('value', onConn);
      return {
        peers: () => list,
        presence(patch) { if (left) return Promise.resolve(); const clean = {}; for (const k in patch) clean[k] = patch[k] === undefined ? null : patch[k]; Object.assign(mine, clean); return me.update(clean).catch(e => { throw wrapErr(e); }); },
        onPeers(cb, err) { peerCbs.push(cb); return () => { peerCbs = peerCbs.filter(f => f !== cb); }; },
        onConnection(cb) { connCbs.push(cb); return () => { connCbs = connCbs.filter(f => f !== cb); }; },
        async leave() { left = true; clearInterval(hb); peersRef.off('value', onVal); connRef.off('value', onConn); try { await me.onDisconnect().cancel(); await me.remove(); } catch (e) { } }
      };
    }
  };
  window.claude = window.claude || {};
  window.claude.use = async name => {
    try { await Promise.race([FB.ready(), new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 15000))]); } catch (e) { return null; }
    return name === 'db' ? dbCap : name === 'user' ? userCap : name === 'room' ? roomCap : null;
  };
})();
