// DRIFT LEGENDS — オフライン用サービスワーカー（ネットがなくても起動できるようにする）
const VER = 'dl-20261121182737', CORE = 'dl-core-' + VER, RT = 'dl-runtime-v1', MUSIC = 'dl-music-v1';
const PRE = ['./', 'index.html', 'firebase-config.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'music/playlist.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CORE).then(c => Promise.all(PRE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => { }))))); });
self.addEventListener('activate', e => { e.waitUntil((async () => { for (const k of await caches.keys()) if (k.startsWith('dl-core-') && k !== CORE) await caches.delete(k); await self.clients.claim(); })()); });
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
const fresh = async (req, key) => { try { const r = await fetch(req); if (r && r.ok) (await caches.open(CORE)).put(key || req, r.clone()); return r; } catch (e) { const c = await caches.match(key || req, { ignoreSearch: true }); if (c) return c; throw e; } };
self.addEventListener('fetch', e => { const req = e.request; if (req.method !== 'GET') return; const u = new URL(req.url);
  if (u.origin === location.origin) {
    if (req.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('index.html')) return e.respondWith(fresh(req, 'index.html'));
    if (u.pathname.endsWith('firebase-config.js')) return e.respondWith(fresh(req, 'firebase-config.js'));
    if (u.pathname.endsWith('playlist.json')) return e.respondWith(fresh(req, 'music/playlist.json'));
    if (/\.mp3$/i.test(u.pathname)) { // 音楽：一度聴いた曲は端末に保存してオフラインでも再生
      return e.respondWith((async () => { const m = await caches.open(MUSIC), hit = await m.match(u.pathname); if (hit && !req.headers.get('range')) return hit;
        try { const r = await fetch(req); if (!hit) e.waitUntil(fetch(u.pathname).then(f => f.ok && m.put(u.pathname, f)).catch(() => { })); return r; } catch (x) { if (hit) return hit; throw x; } })()); }
    return e.respondWith(caches.match(req).then(c => c || fetch(req).then(r => { if (r.ok) caches.open(RT).then(x => x.put(req, r.clone())); return r; })));
  }
  // フォント・Firebase の読み込みファイル（通信そのものはキャッシュしない）
  if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname) || (u.hostname === 'www.gstatic.com' && u.pathname.startsWith('/firebasejs/'))) {
    return e.respondWith(caches.open(RT).then(async c => { const hit = await c.match(req); const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit); return hit || net; }));
  }
});
