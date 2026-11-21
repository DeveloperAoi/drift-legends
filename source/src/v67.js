// =====================================================================
// v67.js — v4.8：オフライン対応（ホーム画面に追加・ネットなしで起動・セーブは端末に保存→オンラインで自動同期）
// =====================================================================
const OFF = { reg: null, waiting: null,
  online() { return navigator.onLine !== false; },
  // オンラインが必要な画面
  NEED: { online: 'オンライン対戦', lb: 'ランキング', market: '中古車マーケット', friends: 'フレンド', clan: 'クラン', account: 'ログイン' },
  badge() { const el = document.getElementById('saveSt'); if (!el) return; let b = document.getElementById('offBadge'); if (this.online()) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('span'); b.id = 'offBadge'; b.className = 'off-badge'; b.innerHTML = '<i></i>オフライン'; el.parentNode.insertBefore(b, el); } },
  async register() { if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol) || location.hostname === 'localhost' && !window.DL_SW_DEV) return;
    try { const reg = this.reg = await navigator.serviceWorker.register('sw.js'); const watch = w => { if (!w) return; w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) this.updateReady(w); }); };
      if (reg.waiting && navigator.serviceWorker.controller) this.updateReady(reg.waiting); watch(reg.installing); reg.addEventListener('updatefound', () => watch(reg.installing));
      let reloaded = false; navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloaded || !this._want) return; reloaded = true; location.reload(); });
      setInterval(() => { if (this.online()) reg.update().catch(() => { }); }, 30 * 60000); } catch (e) { console.warn('sw', e); }
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { } },
  updateReady(w) { this.waiting = w; if (document.getElementById('swUpd')) return; document.body.insertAdjacentHTML('beforeend', `<div id="swUpd" class="sw-upd"><span><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3v12M6 10l6 6 6-6M4 20h16" stroke="#ffcf3d" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg><b>新しいバージョンがあります</b></span><button class="btn pri" data-sw="go">更新する</button><button class="btn" data-sw="later">あとで</button></div>`);
    const el = document.getElementById('swUpd'); el.addEventListener('click', e => { const k = e.target.closest('[data-sw]'); if (!k) return; if (k.dataset.sw === 'go') { if (UI.game && UI.game.active) { UI.toast('レースが終わってから更新してください'); return; } SAVE.save(true); this._want = true; w.postMessage('skip'); } el.remove(); }); }
};
window.addEventListener('online', () => { OFF.badge(); UI.toast('オンラインに戻りました。セーブデータをクラウドに保存します'); try { if (CLOUD.doc) { CLOUD.pending = true; CLOUD.flush(); } else CLOUD.init(); } catch (e) { } try { if (window.DL_FB && !DL_FB.user) DL_FB.ready().catch(() => { }); } catch (e) { } });
window.addEventListener('offline', () => { OFF.badge(); UI.toast('オフラインになりました。このまま遊べます（セーブは端末に保存されます）'); });
{ const _op = UI.open; UI.open = function (k) { if (!OFF.online() && OFF.NEED[k]) { AUDIO.error && AUDIO.error(); return this.toast(`${OFF.NEED[k]}はオンラインのときに使えます（いまはオフラインです）`); } return _op.apply(this, arguments); }; }
{ const _ss = UI.saveStatus; UI.saveStatus = function () { const r = _ss ? _ss.apply(this, arguments) : undefined; try { OFF.badge(); if (!OFF.online()) { const el = $('saveSt'); if (el) el.textContent = '端末に保存済み'; } } catch (e) { } return r; }; }
setTimeout(() => { OFF.badge(); OFF.register(); }, 1500);
window.__DLX = Object.assign(window.__DLX || {}, { OFF });
