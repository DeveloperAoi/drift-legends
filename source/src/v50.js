// =====================================================================
// v50.js — v3.91：ムービーパック限定車「SHADE INTERCEPTOR」・メインメニューの曲を全員に反映（開発者メニュー）
// =====================================================================
// ---------------- 新車：SHADE INTERCEPTOR（オリジナル。80年代の映画に出てきそうな黒いウェッジ型スーパーカー風） ----------------
WHEEL_STYLES.push({ id: 'shademesh', name: 'ゴールドメッシュ', price: 0, spokes: 20, deep: 1, rim: '#d8b04a' });
{ const c = addCar(['mv_shade', 'CINEMA', 'SHADE INTERCEPTOR', 'ムービーパック限定・荒野の夜に現れる謎の黒いインターセプター（カード限定）', 'MR', 620, 640, 1180, 312, 6, 8200, 1, 90, 84, 90, 0, 'wedge', 4.75, 1.94, 1.06, '#202226', 0, 'v8', 2.62, 0.43, { chest: 1, cards: 1 }]);
  Object.assign(c, { isNew: '3.91', stockWheel: 'shademesh', prof: { nose: .26, hood: .40, deck: .60, ws: .70, rf: .47, rr: .26, rb: .06 }, hero: 'shade' });
  CAR_CARDS.mv_shade = { need: 45, movie: 1 };
  for (const [n, r] of [[1, 'R'], [3, 'E'], [10, 'L']]) addItem({ id: `cc_mv_shade_${n}`, type: 'carcard', car: 'mv_shade', cards: n, rarity: r, lim: 1, movie: 1, name: `${c.name} カード ×${n}`, en: `${c.name} card x${n}` });
  for (const n of [1, 3]) addItem({ id: `sc_mv_shade_${n}`, type: 'starcard', car: 'mv_shade', cards: n, rarity: n === 3 ? 'L' : 'E', lim: 1, starcard: 1, name: `${c.name} 車両カード ×${n}`, en: `${c.name} vehicle card x${n}` });
  for (const it of ITEMS) ITEM_BY_ID[it.id] = it; }
// 車両パック（ハイパー）にはこの車の星アップカードを入れない（ムービーパック限定のため）
{ const _pp = packPool; packPool = function (c, rar) { const r = _pp(c, rar); if (c.pool === 'veh') return r.filter(i => i.car !== 'mv_shade'); if (c.pool === 'movie') return r.concat(ITEMS.filter(i => i.starcard && i.car === 'mv_shade' && i.rarity === rar)); return r; }; }
// ニトロ中：タービンの青白い排気の光
{ const GP = Game.prototype, _up = GP.update; GP.update = function (dt) { _up.call(this, dt); const car = this.carInst && CAR_BY_ID[this.carInst.id]; if (!car || car.hero !== 'shade' || !this.active) return; const v = this.veh; if (!v || !v.nitroOn || !this.sparks) return;
    const fx = Math.sin(v.heading), fz = Math.cos(v.heading), L = car.L || 4.7; for (let k = 0; k < 3; k++) { const s = (Math.random() - 0.5) * 0.5; try { this.sparks.spawn({ x: v.x - fx * L / 2 + Math.cos(v.heading) * s, y: (v.y || 0) + 0.45, z: v.z - fz * L / 2 - Math.sin(v.heading) * s, vx: v.vx * 0.8 - fx * 6 + (Math.random() - .5), vy: Math.random(), vz: v.vz * 0.8 - fz * 6 + (Math.random() - .5), life: 0, max: 0.25 + Math.random() * 0.2, size: 0.32, grow: -0.4, r: 0.55, g: 0.8, b: 1, a: 1, grav: 0, drag: 1 }); } catch (e) { } } }; }

// ---------------- メインメニューの曲（全員に反映・開発者メニューから変更） ----------------
const MENU_MUSIC = { src: '' };
const menuLike = cat => ['menu', 'xmas', 'garage'].includes(cat) && !(UI.game && UI.game.active);
{ const _st = ADM.start; ADM.start = async function () { const r = await _st.apply(this, arguments); try { if (window.DL_FB) { await DL_FB.ready(); DL_FB.db().ref('admin/menuMusic').on('value', s => { const v = s.val(); const nv = (v && v.src) || ''; const ch = nv !== MENU_MUSIC.src; MENU_MUSIC.src = nv; if (ch && AUDIO.music && menuLike(AUDIO.music.cat)) AUDIO.playCat(AUDIO.music.cat, true); }, () => { }); } } catch (e) { } return r; }; }
{ const _pc = AUDIO.playCat.bind(AUDIO); AUDIO.playCat = function (cat, force = false) { const src = MENU_MUSIC.src; if (!menuLike(cat) || !src) return _pc(cat, force);
    this.music.cat = cat;
    if (src.startsWith('mp3:')) { const file = src.slice(4); let tr = this.mp3.list.find(t => t.file === file); if (!tr) { tr = { id: src, file, mp3: true, cat: 'menu', name: file.replace(/\.mp3$/i, '').replace(/_/g, ' ') }; this.mp3.list.push(tr); }
      if (!force && this.mp3.cur === tr && this.mp3.el && !this.mp3.el.paused) return; return this.playMp3(tr); }
    if (src.startsWith('tr:')) { const id = src.slice(3); if (!TRACKS.some(t => t.id === id)) return _pc(cat, force); this.music.cat = cat; if (!force && this.music.playing && this.music.track && this.music.track.id === id) return; this.stopMp3(); this.fadeMusic(1, 0.3); return this.play(id); }
    return _pc(cat, force); }; }
const menuMusicName = src => !src ? '自動（今まで通り）' : src.startsWith('mp3:') ? src.slice(4) : ((TRACKS.find(t => 'tr:' + t.id === src) || {}).name || src);
{ const _dp = UI.r_devPanel; UI.r_devPanel = function () { let h = _dp.call(this); if (!DEV.owner || !window.DL_FB) return h; h = h.replace('</div><div class="note">', `<button class="tab ${this.tab === 'mmusic' ? 'on' : ''}" data-a="setTab" data-v="mmusic">MENU MUSIC</button></div><div class="note">`); if (this.tab !== 'mmusic') return h;
    if (!AUDIO.mp3.loaded) AUDIO.loadPlaylist().then(() => { if (this.tab === 'mmusic') this.render(); });
    const cur = MENU_MUSIC.src, row = (src, nm, sub) => `<div class="mm-row ${cur === src ? 'on' : ''}"><div><b>${esc(nm)}</b><small>${sub}</small></div><button class="btn" data-a="mmPrev" data-v="${src}">試聴</button><button class="btn ${cur === src ? 'pri' : ''}" data-a="mmSet" data-v="${src}">${cur === src ? '設定中' : 'これにする'}</button></div>`;
    const mp3 = AUDIO.mp3.list.filter(t => t.mp3), builtin = TRACKS.filter(t => !t.lock || t.cat === 'menu');
    return h + `<div class="kv dev-kv"><div>現在のメニュー曲</div><div><b>${esc(menuMusicName(cur))}</b></div></div><div class="note">選んだ曲が全プレイヤーのメインメニューで流れます（すぐに反映）。MP3 はリポジトリの <b>music/</b> フォルダに置くと、ここに一覧で出ます。</div>
      <div class="mm-list">${row('', '自動（今まで通り）', 'menu で始まるMP3、なければゲーム内の曲')}<div class="h3">MP3（music/ フォルダ）</div>${mp3.length ? mp3.map(t => row('mp3:' + t.file, t.file, t.cat === 'menu' ? 'メニュー用' : t.cat === 'xmasRace' ? 'クリスマス用' : 'レース用')).join('') : '<div class="note">MP3 が見つかりません（ローカルのファイルで開いているときは読み込めません）</div>'}
      <div class="h3">ゲーム内の曲</div>${builtin.map(t => row('tr:' + t.id, t.name, t.cat === 'menu' ? 'メニュー用' : t.cat)).join('')}</div>`; }; }
Object.assign(UI, {
  a_mmSet(src) { this._adm(async () => { await ADM.write('admin/menuMusic', src ? { src, by: DL_FB.user.uid } : null); await ADM.log('menu-music', src || 'auto'); MENU_MUSIC.src = src; AUDIO.playCat(xmasThemeOn() ? 'xmas' : 'menu', true); this.render(); }, 'メニューの曲を変更しました（全員に反映）'); },
  a_mmPrev(src) { const keep = MENU_MUSIC.src; MENU_MUSIC.src = src; AUDIO.playCat('menu', true); MENU_MUSIC.src = keep; AUDIO.music.cat = xmasThemeOn() ? 'xmas' : 'menu'; this.toast('試聴中：' + menuMusicName(src)); }
});
window.__DLX = Object.assign(window.__DLX || {}, { MENU_MUSIC, packPool });
