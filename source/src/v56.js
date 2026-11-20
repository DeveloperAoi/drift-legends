// =====================================================================
// v56.js — v3.97：タイヤスモーク・チャット用スタンプ・追加メーター（それぞれ専用パック）・パックの天井・コレクションブック・フォトモード
// =====================================================================
// ---------------- タイヤスモークの色 ----------------
const SMOKES = [
  ['white', 'ホワイトスモーク', 'White Smoke', 'C', [[0.95, 0.95, 0.97]]], ['black', 'ブラックスモーク', 'Black Smoke', 'C', [[0.12, 0.12, 0.14]]],
  ['red', 'レッド', 'Red', 'C', [[0.95, 0.15, 0.15]]], ['blue', 'ブルー', 'Blue', 'C', [[0.2, 0.45, 1]]], ['green', 'グリーン', 'Green', 'C', [[0.2, 0.9, 0.35]]],
  ['yellow', 'イエロー', 'Yellow', 'U', [[1, 0.88, 0.15]]], ['orange', 'オレンジ', 'Orange', 'U', [[1, 0.5, 0.08]]], ['pink', 'ピンク', 'Pink', 'U', [[1, 0.45, 0.75]]],
  ['purple', 'パープル', 'Purple', 'U', [[0.6, 0.3, 1]]], ['cyan', 'シアン', 'Cyan', 'U', [[0.2, 0.95, 0.95]]],
  ['cotton', '綿あめ', 'Cotton Candy', 'R', [[1, 0.6, 0.85], [0.6, 0.85, 1]]], ['fire', 'ファイア', 'Fire', 'R', [[1, 0.3, 0.05], [1, 0.75, 0.1], [0.9, 0.1, 0.05]]],
  ['police', 'ポリス', 'Police', 'R', [[1, 0.1, 0.1], [0.15, 0.3, 1]]], ['jp', '日の丸', 'Rising Sun', 'R', [[1, 1, 1], [0.95, 0.1, 0.15]]],
  ['ocean', 'オーシャン', 'Ocean', 'E', [[0.1, 0.4, 1], [0.2, 0.9, 0.9], [0.9, 1, 1]]], ['toxic', 'トキシック', 'Toxic', 'E', [[0.5, 1, 0.1], [0.2, 0.7, 0.05]]],
  ['sakura', '桜', 'Sakura', 'E', [[1, 0.75, 0.85], [1, 0.95, 0.97]]], ['neon', 'ネオン', 'Neon', 'E', [[1, 0.15, 0.85], [0.1, 0.9, 1]]],
  ['gold', 'ゴールド', 'Gold', 'L', [[1, 0.82, 0.25], [1, 0.95, 0.6]]], ['rainbow', 'レインボー', 'Rainbow', 'L', null], ['galaxy', 'ギャラクシー', 'Galaxy', 'L', [[0.45, 0.2, 1], [0.15, 0.1, 0.4], [1, 0.5, 0.9], [0.4, 0.8, 1]]]
];
const SMOKE_BY = {}; for (const [id, nm, en, r, cols] of SMOKES) { SMOKE_BY[id] = { id, nm, cols }; mkItem({ id: 'smk_' + id, type: 'smoke', smokeX: id, name: 'タイヤスモーク「' + nm + '」', en: 'Tire Smoke "' + en + '"', rarity: r, lim: 1, desc: 'ドリフトしたときのタイヤの煙の色（「飾り・小物」から装着）' }); }
const rgbHex = c => '#' + c.map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
const smokeSvg = (id, s = 40) => { const S = SMOKE_BY[id] || {}, C = S.cols ? S.cols.map(rgbHex) : ['#ff3a3a', '#ffd21a', '#3adc5a', '#2a9aff', '#b05aff']; return `<svg viewBox="0 0 48 48" width="${s}" height="${s}">${[[16, 30, 10], [26, 22, 12], [34, 32, 10], [22, 36, 9], [36, 18, 8]].map(([x, y, r], k) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C[k % C.length]}" opacity=".85"/>`).join('')}<circle cx="14" cy="40" r="6" fill="#222"/><circle cx="14" cy="40" r="2.5" fill="#888"/></svg>`; };
{ const GP = Game.prototype, _st = GP.start; GP.start = function (cfg) { const r = _st.apply(this, arguments); try { const L = (cfg && cfg.carInst && cfg.carInst.look) || {}, S = L.smokeX && invHas('smk_' + L.smokeX) && SMOKE_BY[L.smokeX];
      if (S && !this.smokeEx) this.smokeEx = S.cols ? { kind: 'smoke', get smokeCol() { return S.cols[(Math.random() * S.cols.length) | 0]; } } : { kind: 'smoke' }; } catch (e) { } return r; }; }

// ---------------- チャット用スタンプ ----------------
const STAMPS = [];
{ const face = (bg, inner) => `<circle cx="40" cy="40" r="30" fill="${bg}" stroke="#3a2a10" stroke-width="2.5"/>${inner}`, txt = (t, c = '#fff', y = 72, fs = 13) => `<text x="40" y="${y}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="${c}" stroke="#111" stroke-width="3" paint-order="stroke" font-family="Arial, sans-serif">${t}</text>`;
  const eyesH = '<path d="M26 36 q5 -7 10 0 M44 36 q5 -7 10 0" stroke="#3a2a10" stroke-width="4" fill="none" stroke-linecap="round"/>', eyesD = '<circle cx="31" cy="35" r="4" fill="#3a2a10"/><circle cx="49" cy="35" r="4" fill="#3a2a10"/>', smile = '<path d="M28 48 q12 12 24 0" stroke="#3a2a10" stroke-width="4" fill="none" stroke-linecap="round"/>';
  const S = (id, nm, r, an, svg) => { STAMPS.push({ id, nm, r, an, svg }); mkItem({ id: 'stp_' + id, type: 'stamp', stamp: id, name: 'スタンプ「' + nm + '」', en: 'Stamp "' + nm + '"', rarity: r, lim: 1, desc: 'チャットで送れる大きな動くスタンプ' }); };
  S('s1', 'やったね！', 'C', 'bounce', face('#ffd23a', eyesH + smile) + txt('YAY!'));
  S('s2', 'GG！', 'C', 'pulse', '<rect x="8" y="16" width="64" height="48" rx="12" fill="#2a8aff" stroke="#111" stroke-width="3"/>' + txt('GG!', '#fff', 50, 26));
  S('s3', 'ありがとう', 'C', 'bounce', face('#ffb0c8', eyesH + smile + '<path d="M58 18 l3 5 5 1 -4 3 1 5 -5 -3 -5 3 1 -5 -4 -3 5 -1z" fill="#ff3a6a"/>') + txt('THANKS'));
  S('s4', 'よろしく！', 'C', 'wave', face('#ffd23a', eyesD + smile + '<path d="M66 30 q8 -12 2 -20" stroke="#ffd23a" stroke-width="8" stroke-linecap="round"/>') + txt('HELLO!'));
  S('s5', 'ドンマイ', 'U', 'shake', face('#9ad8ff', '<path d="M26 34 h10 M44 34 h10" stroke="#3a2a10" stroke-width="4" stroke-linecap="round"/><path d="M28 52 q12 -8 24 0" stroke="#3a2a10" stroke-width="4" fill="none"/><path d="M58 22 q-4 8 0 12 q4 -4 0 -12" fill="#4ab0ff"/>') + txt('DON\'T MIND'));
  S('s6', 'ナイスドリフト', 'U', 'spin', '<circle cx="40" cy="38" r="26" fill="#1a1a1c" stroke="#ffcf3d" stroke-width="4"/><circle cx="40" cy="38" r="12" fill="#c8ccd2"/>' + Array.from({ length: 5 }, (_, k) => `<path d="M40 38 L40 28" stroke="#666" stroke-width="3" transform="rotate(${k * 72} 40 38)"/>`).join('') + txt('NICE DRIFT', '#ffcf3d', 74, 11));
  S('s7', 'おつかれ', 'U', 'bounce', face('#ffd23a', '<path d="M26 36 h10 M44 36 h10" stroke="#3a2a10" stroke-width="4" stroke-linecap="round"/>' + smile + '<path d="M20 22 q4 -6 8 0" stroke="#4ab0ff" stroke-width="3" fill="none"/>') + txt('GOOD JOB'));
  S('s8', 'まけないぞ', 'U', 'shake', face('#ff6a3a', '<path d="M24 28 l12 6 M56 28 l-12 6" stroke="#3a2a10" stroke-width="4" stroke-linecap="round"/>' + eyesD + '<path d="M30 52 h20" stroke="#3a2a10" stroke-width="4"/>') + txt('BRING IT'));
  S('s9', 'えっ！？', 'U', 'pop', face('#ffd23a', '<circle cx="31" cy="35" r="7" fill="#fff" stroke="#3a2a10" stroke-width="2"/><circle cx="49" cy="35" r="7" fill="#fff" stroke="#3a2a10" stroke-width="2"/><circle cx="31" cy="35" r="3" fill="#3a2a10"/><circle cx="49" cy="35" r="3" fill="#3a2a10"/><ellipse cx="40" cy="54" rx="6" ry="7" fill="#3a2a10"/>') + txt('WHAT!?'));
  S('s10', '最速！', 'R', 'pulse', '<path d="M8 50 L30 20 L44 34 L72 10 L62 44 L50 32 L26 62z" fill="#ffcf3d" stroke="#111" stroke-width="3"/>' + txt('最速!', '#fff', 74, 15));
  S('s11', 'ハート', 'R', 'pulse', '<path d="M40 66 L12 38 a14 14 0 0 1 28 -18 a14 14 0 0 1 28 18z" fill="#ff3a6a" stroke="#111" stroke-width="3"/><path d="M24 30 q4 -6 10 -4" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>');
  S('s12', 'チェッカー', 'R', 'wave', '<path d="M14 8 V72" stroke="#888" stroke-width="4"/>' + Array.from({ length: 20 }, (_, k) => `<rect x="${16 + (k % 5) * 11}" y="${10 + Math.floor(k / 5) * 11}" width="11" height="11" fill="${(k + Math.floor(k / 5)) % 2 ? '#111' : '#fff'}"/>`).join('') + txt('FINISH', '#ffcf3d', 72, 12));
  S('s13', 'ブースト！', 'R', 'shake', '<path d="M10 40 h30 l-6 -14 36 14 -36 14 6 -14" fill="#ff6a00" stroke="#111" stroke-width="3"/><path d="M6 34 h12 M4 46 h14" stroke="#ffcf3d" stroke-width="4" stroke-linecap="round"/>' + txt('BOOST!', '#fff', 74, 13));
  S('s14', 'ねこOK', 'R', 'bounce', '<circle cx="40" cy="42" r="24" fill="#fff" stroke="#111" stroke-width="3"/><path d="M20 28 l4 -16 12 10z M60 28 l-4 -16 -12 10z" fill="#fff" stroke="#111" stroke-width="3"/>' + eyesH + '<path d="M36 48 q4 4 8 0" stroke="#111" stroke-width="2.5" fill="none"/>' + txt('OK!', '#ff3a6a', 76, 14));
  S('s15', 'いぬWOW', 'R', 'pop', '<ellipse cx="40" cy="44" rx="24" ry="22" fill="#e8b070" stroke="#111" stroke-width="3"/><ellipse cx="18" cy="38" rx="7" ry="14" fill="#a06a30"/><ellipse cx="62" cy="38" rx="7" ry="14" fill="#a06a30"/>' + eyesD + '<ellipse cx="40" cy="50" rx="5" ry="4" fill="#111"/><ellipse cx="40" cy="58" rx="4" ry="5" fill="#ff6a8a"/>' + txt('WOW', '#fff', 78, 13));
  S('s16', 'おにぎりパワー', 'U', 'bounce', '<path d="M40 8 L70 60 a6 6 0 0 1 -6 8 H16 a6 6 0 0 1 -6 -8z" fill="#fff" stroke="#111" stroke-width="3"/><rect x="22" y="44" width="36" height="24" fill="#1a2a1a"/>' + eyesH.replace(/36/g, '40') + txt('POWER', '#ffcf3d', 62, 11));
  S('s17', 'ラーメンいこ', 'U', 'wave', '<path d="M8 36 h64 a32 28 0 0 1 -64 0z" fill="#e10600" stroke="#111" stroke-width="3"/><path d="M14 36 h52" stroke="#ffd060" stroke-width="6"/><path d="M56 6 L36 34 M66 8 L46 34" stroke="#a86a2a" stroke-width="3"/>' + txt('RAMEN?', '#fff', 76, 12));
  S('s18', 'もうちょい！', 'U', 'shake', face('#ffd23a', eyesD + '<path d="M30 50 h20" stroke="#3a2a10" stroke-width="4"/><path d="M56 20 l8 -6 M60 28 l10 -2" stroke="#ff3a3a" stroke-width="3" stroke-linecap="round"/>') + txt('ALMOST!'));
  S('s19', 'ドヤ', 'E', 'pulse', face('#ffd23a', '<path d="M22 32 h16 v6 h-16z M42 32 h16 v6 h-16z" fill="#111"/><path d="M38 34 h4" stroke="#111" stroke-width="3"/><path d="M30 50 q10 4 20 -4" stroke="#3a2a10" stroke-width="4" fill="none" stroke-linecap="round"/>') + txt('DOYA!', '#ffcf3d'));
  S('s20', 'ファイヤー', 'E', 'shake', '<path d="M40 72 C16 66 12 40 30 20 C30 34 38 34 40 26 C44 16 40 8 46 4 C58 18 70 34 64 52 C60 66 52 70 40 72z" fill="#ff5a00" stroke="#111" stroke-width="3"/><path d="M40 66 C30 62 28 50 36 40 C38 48 44 46 44 40 C52 48 54 58 40 66z" fill="#ffd21a"/>' + txt('FIRE!', '#fff', 76, 13));
  S('s21', '王冠', 'E', 'bounce', '<path d="M10 58 L14 22 L28 38 L40 14 L52 38 L66 22 L70 58z" fill="#ffcf3d" stroke="#111" stroke-width="3"/><circle cx="40" cy="14" r="5" fill="#ff3a5a" stroke="#111" stroke-width="2"/><rect x="10" y="56" width="60" height="10" fill="#c88a00" stroke="#111" stroke-width="3"/>' + txt('KING', '#fff', 50, 12));
  S('s22', 'ロケット', 'E', 'fly', '<path d="M40 6 q18 18 12 44 h-24 q-6 -26 12 -44z" fill="#f4f4f4" stroke="#111" stroke-width="3"/><circle cx="40" cy="28" r="6" fill="#5ad1ff" stroke="#111" stroke-width="2"/><path d="M28 44 l-10 14 h10z M52 44 l10 14 h-10z" fill="#e10600" stroke="#111" stroke-width="2"/><path d="M32 52 q8 26 16 0z" fill="#ffb000"/>');
  S('s23', 'りゅう', 'L', 'fly', '<path d="M10 60 C20 30 40 60 50 34 C56 18 70 20 70 8" stroke="#2adc7a" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="68" cy="10" r="9" fill="#2adc7a" stroke="#111" stroke-width="2"/><circle cx="71" cy="8" r="2.5" fill="#e10600"/><path d="M62 4 l-6 -4 M74 2 l2 -6" stroke="#ffcf3d" stroke-width="3"/>' + txt('天下無双', '#ffcf3d', 76, 13));
  S('s24', 'レジェンド', 'L', 'spin', '<path d="M40 4 l9 22 24 2 -18 15 6 23 -21 -13 -21 13 6 -23 -18 -15 24 -2z" fill="#ffcf3d" stroke="#111" stroke-width="3"/>' + txt('LEGEND', '#fff', 46, 11));
  S('s25', 'サンキューGT', 'R', 'wave', '<path d="M8 50 l8 -14 h18 l8 -10 h20 l10 14 v10z" fill="#e10600" stroke="#111" stroke-width="3"/><circle cx="22" cy="54" r="7" fill="#222"/><circle cx="58" cy="54" r="7" fill="#222"/>' + txt('THX!', '#fff', 76, 14));
  S('s26', 'ZZZ', 'C', 'pulse', face('#ffd23a', '<path d="M26 36 h10 M44 36 h10" stroke="#3a2a10" stroke-width="4" stroke-linecap="round"/><ellipse cx="40" cy="52" rx="4" ry="3" fill="#3a2a10"/>') + '<text x="60" y="20" font-size="14" font-weight="900" fill="#5ad1ff" stroke="#111" stroke-width="2" paint-order="stroke">Z</text><text x="68" y="10" font-size="10" font-weight="900" fill="#5ad1ff">z</text>');
  S('s27', 'パーティー', 'E', 'bounce', '<path d="M12 70 L28 20 L60 52z" fill="#b07aff" stroke="#111" stroke-width="3"/>' + Array.from({ length: 10 }, (_, k) => `<rect x="${36 + (k * 7) % 36}" y="${6 + (k * 11) % 30}" width="6" height="3" fill="${['#ff3a5a', '#ffd21a', '#3ac8ff', '#4ae07a'][k % 4]}" transform="rotate(${k * 40} ${38 + (k * 7) % 36} ${8 + (k * 11) % 30})"/>`).join('') + txt('PARTY!', '#fff', 78, 12));
  S('s28', 'ハテナ', 'U', 'shake', face('#9ad8ff', eyesD + '<path d="M32 52 q8 -4 16 0" stroke="#3a2a10" stroke-width="4" fill="none"/>') + '<text x="64" y="22" font-size="22" font-weight="900" fill="#ffcf3d" stroke="#111" stroke-width="2.5" paint-order="stroke">?</text>');
  S('s29', 'ピース', 'R', 'wave', face('#ffd23a', eyesH + smile) + '<path d="M64 46 l4 -22 M70 46 l8 -20" stroke="#ffd23a" stroke-width="7" stroke-linecap="round"/><path d="M64 46 l4 -22 M70 46 l8 -20" stroke="#111" stroke-width="1.5"/>' + txt('PEACE'));
  S('s30', 'ネオンGG', 'L', 'pulse', '<rect x="6" y="18" width="68" height="44" rx="10" fill="#120020" stroke="#ff2bd6" stroke-width="4"/><text x="40" y="50" font-size="26" font-weight="900" text-anchor="middle" fill="#00e5ff" style="filter:drop-shadow(0 0 4px #00e5ff)">GG</text>');
}
const STAMP_BY = {}; for (const s of STAMPS) STAMP_BY[s.id] = s;
const stampSvg = (id, s = 64) => { const S = STAMP_BY[id]; return S ? `<svg class="stp an-${S.an}" viewBox="0 0 80 80" width="${s}" height="${s}">${S.svg}</svg>` : ''; };
{ const _er = emoRender; emoRender = s => _er(s).replace(/:(s\d{1,2}):/g, (m, id) => STAMP_BY[id] ? `<span class="stp-in">${stampSvg(id, 72)}</span>` : m); }
{ const _ep = UI.emoPickerHTML; UI.emoPickerHTML = function (target) { const stTab = `<button class="${this.emoCat === 'stamp' ? 'on' : ''}" data-a="emoCat" data-v="stamp:${target}">${stampSvg('s1', 20)}<span>スタンプ</span></button>`;
    if (this.emoCat !== 'stamp') { const h = _ep.call(this, target); return h.replace('</div><div class="emo', stTab + '</div><div class="emo'); }
    const keep = this.emoCat; this.emoCat = 'face'; let h = _ep.call(this, target); this.emoCat = keep; h = h.replace('</div><div class="emo', stTab + '</div><div class="emo').replace(/class="on" data-a="emoCat" data-v="face/, 'class="" data-a="emoCat" data-v="face');
    const own = STAMPS.filter(s => invHas('stp_' + s.id)).length, grid = `<div class="emo-grid stp-grid">${STAMPS.map(s => { const ok = invHas('stp_' + s.id); return `<button class="emo-b stp-b ${ok ? '' : 'lock'}" data-a="${ok ? 'emoIns' : 'stpLocked'}" data-v="${s.id}:${target}" title="${esc(s.nm)}">${stampSvg(s.id, 46)}</button>`; }).join('')}</div><div class="emo-foot"><span>${own} / ${STAMPS.length} 個を所持</span><button class="btn" data-a="goPackSp" data-v="stamppack">スタンプパックで集める</button></div>`;
    const a = h.indexOf('<div class="emo-grid'); return a < 0 ? h : h.slice(0, a) + grid + '</div>'; }; }
UI.a_stpLocked = function () { this.toast('スタンプはスタンプパックから手に入ります'); };

// ---------------- 追加メーター（HUDガジェット） ----------------
const GADGETS = [
  ['gmeter', 'Gメーター', 'G-Meter', 'U', '#5ad1ff'], ['gmeter_n', 'Gメーター（ネオン）', 'G-Meter (Neon)', 'E', '#ff2bd6'],
  ['boost', 'ブースト計', 'Boost Gauge', 'U', '#ffcf3d'], ['boost_r', 'ブースト計（レッド）', 'Boost Gauge (Red)', 'R', '#ff3a3a'],
  ['angle', 'ドリフト角メーター', 'Drift Angle', 'R', '#2adc7a'], ['angle_g', 'ドリフト角メーター（ゴールド）', 'Drift Angle (Gold)', 'L', '#ffcf3d'],
  ['gear', 'ビッグギア表示', 'Big Gear', 'C', '#fff'], ['gear_c', 'ビッグギア表示（シアン）', 'Big Gear (Cyan)', 'U', '#2adcd0'],
  ['shift', 'シフトランプ', 'Shift Lights', 'R', '#3adc5a'], ['shift_p', 'シフトランプ（プロ）', 'Shift Lights (Pro)', 'E', '#b07aff'],
  ['pedals', 'ペダルバー', 'Pedal Bars', 'C', '#3adc5a'], ['graph', 'スピードグラフ', 'Speed Graph', 'R', '#5ad1ff'], ['graph_n', 'スピードグラフ（ネオン）', 'Speed Graph (Neon)', 'E', '#ff2bd6'],
  ['compass', 'コンパス', 'Compass', 'C', '#ffcf3d'], ['alt', '高度計', 'Altimeter', 'U', '#9ad8ff'], ['clock', 'デジタル時計', 'Digital Clock', 'C', '#2adc7a'],
  ['odo', '走行距離', 'Odometer', 'C', '#fff'], ['top', '最高速度', 'Top Speed', 'U', '#ff8a2a'], ['rpmnum', 'デジタル回転計', 'Digital RPM', 'U', '#ff3a3a'],
  ['kmh_big', 'ビッグスピード', 'Big Speed', 'R', '#fff'], ['kmh_retro', 'レトロLCDスピード', 'Retro LCD Speed', 'E', '#9aff6a'], ['combo', 'ドリフトスコア', 'Drift Score', 'R', '#ffcf3d'],
  ['rainbow', 'レインボーメーター', 'Rainbow Meter', 'L', '#ff7ad8'], ['heart', 'ハートビート', 'Heartbeat', 'E', '#ff3a6a']
];
const GADGET_BY = {}; for (const [id, nm, en, r, c] of GADGETS) { GADGET_BY[id] = { id, nm, c, k: id.split('_')[0] }; mkItem({ id: 'hud_' + id, type: 'hudgadget', gadget: id, name: '追加メーター「' + nm + '」', en: 'Extra Gauge "' + en + '"', rarity: r, lim: 1, desc: 'レース画面に追加できるメーター（「飾り・小物」から最大3つ）' }); }
const HUDG_MAX = 3;
const gadgetSvg = (id, s = 40) => { const G = GADGET_BY[id] || { c: '#5ad1ff', k: 'gmeter' }, c = G.c; const body = {
  gmeter: `<circle cx="24" cy="24" r="18" fill="none" stroke="${c}" stroke-width="2"/><circle cx="24" cy="24" r="9" fill="none" stroke="${c}" stroke-width="1" opacity=".6"/><path d="M6 24h36M24 6v36" stroke="${c}" stroke-width="1" opacity=".4"/><circle cx="30" cy="20" r="4" fill="${c}"/>`,
  boost: `<path d="M8 34 a18 18 0 1 1 32 0" stroke="#444" stroke-width="5" fill="none"/><path d="M8 34 a18 18 0 0 1 24 -22" stroke="${c}" stroke-width="5" fill="none"/><path d="M24 32 L34 16" stroke="#fff" stroke-width="2.5"/>`,
  angle: `<path d="M8 36 a18 18 0 0 1 32 0" stroke="#444" stroke-width="4" fill="none"/><path d="M24 36 L12 18" stroke="${c}" stroke-width="3"/><text x="24" y="46" font-size="9" font-weight="900" text-anchor="middle" fill="${c}">45°</text>`,
  gear: `<text x="24" y="34" font-size="28" font-weight="900" text-anchor="middle" fill="${c}">4</text>`,
  shift: [0, 1, 2, 3, 4].map(k => `<circle cx="${8 + k * 8}" cy="24" r="3.5" fill="${k < 2 ? '#3adc5a' : k < 4 ? '#ffd21a' : '#ff3a3a'}"/>`).join(''),
  pedals: `<rect x="12" y="10" width="8" height="28" fill="#333"/><rect x="12" y="18" width="8" height="20" fill="#3adc5a"/><rect x="28" y="10" width="8" height="28" fill="#333"/><rect x="28" y="30" width="8" height="8" fill="#ff3a3a"/>`,
  graph: `<path d="M6 36 L14 28 L20 32 L28 18 L34 22 L42 10" stroke="${c}" stroke-width="2.5" fill="none"/><path d="M6 40h36" stroke="#555"/>`,
  compass: `<circle cx="24" cy="24" r="17" fill="none" stroke="${c}" stroke-width="2"/><path d="M24 10 L28 24 L24 38 L20 24z" fill="${c}"/><text x="24" y="9" font-size="7" font-weight="900" text-anchor="middle" fill="#fff">N</text>`,
  alt: `<path d="M6 38 L18 18 L26 28 L32 20 L42 38z" fill="${c}" opacity=".7"/><text x="24" y="14" font-size="8" font-weight="900" text-anchor="middle" fill="#fff">ALT</text>`,
  clock: `<rect x="4" y="14" width="40" height="20" rx="3" fill="#111" stroke="${c}"/><text x="24" y="29" font-size="11" font-weight="900" text-anchor="middle" fill="${c}" font-family="monospace">12:34</text>`,
  odo: `<rect x="4" y="16" width="40" height="16" rx="2" fill="#111" stroke="#888"/><text x="24" y="28" font-size="10" font-weight="900" text-anchor="middle" fill="${c}" font-family="monospace">0086km</text>`,
  top: `<text x="24" y="22" font-size="7" font-weight="900" text-anchor="middle" fill="#aaa">TOP</text><text x="24" y="36" font-size="14" font-weight="900" text-anchor="middle" fill="${c}">286</text>`,
  rpmnum: `<text x="24" y="30" font-size="13" font-weight="900" text-anchor="middle" fill="${c}" font-family="monospace">7200</text>`,
  kmh: `<text x="24" y="32" font-size="18" font-weight="900" text-anchor="middle" fill="${c}" font-family="${id === 'kmh_retro' ? 'monospace' : 'Arial'}">188</text>`,
  combo: `<text x="24" y="22" font-size="7" font-weight="900" text-anchor="middle" fill="#aaa">DRIFT</text><text x="24" y="36" font-size="13" font-weight="900" text-anchor="middle" fill="${c}">12.8K</text>`,
  rainbow: ['#ff3a3a', '#ffd21a', '#3adc5a', '#2a9aff', '#b05aff'].map((cc, k) => `<rect x="${6 + k * 8}" y="${34 - k * 5}" width="6" height="${6 + k * 5}" fill="${cc}"/>`).join(''),
  heart: `<path d="M4 26 h10 l4 -10 6 20 4 -12 3 2 h13" stroke="${c}" stroke-width="2.5" fill="none"/>`
}[G.k] || ''; return `<svg viewBox="0 0 48 48" width="${s}" height="${s}"><rect x="1" y="1" width="46" height="46" rx="9" fill="#0c0e14" stroke="#333"/>${body}</svg>`; };
const HUDG = { el: null, hist: [], last: null, lastSp: 0, lastHd: null, maxKmh: 0, dist: 0,
  ensure() { if (!this.el) { this.el = document.createElement('div'); this.el.id = 'hudGad'; document.body.appendChild(this.el); } return this.el; },
  build(list) { const el = this.ensure(); const sig = list.join(','); if (el.dataset.sig === sig) return; el.dataset.sig = sig; el.innerHTML = list.map(id => { const G = GADGET_BY[id]; return `<div class="hg hg-${G.k} ${id === 'kmh_retro' ? 'retro' : ''}" style="--hc:${G.c}" data-g="${id}">${this.inner(G)}</div>`; }).join(''); },
  inner(G) { switch (G.k) {
    case 'gmeter': return '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" class="hg-ring"/><circle cx="30" cy="30" r="13" class="hg-ring2"/><path d="M4 30h52M30 4v52" class="hg-axis"/><circle cx="30" cy="30" r="5" class="hg-dot"/></svg><b class="hg-v">0.0G</b>';
    case 'boost': return '<svg viewBox="0 0 60 44"><path d="M8 40 a24 24 0 1 1 44 0" class="hg-trk"/><path d="M8 40 a24 24 0 1 1 44 0" class="hg-arc" pathLength="100" stroke-dasharray="0 100"/></svg><b class="hg-v">0.0</b><small>BOOST</small>';
    case 'angle': return '<svg viewBox="0 0 60 36"><path d="M6 32 a24 24 0 0 1 48 0" class="hg-trk"/><path d="M30 32 L30 10" class="hg-ndl"/></svg><b class="hg-v">0°</b><small>ANGLE</small>';
    case 'gear': return '<b class="hg-big">N</b><small>GEAR</small>';
    case 'shift': return `<div class="hg-leds">${Array.from({ length: id8(G) }, (_, k) => `<i data-k="${k}"></i>`).join('')}</div><small>SHIFT</small>`;
    case 'pedals': return '<div class="hg-ped"><i class="t"><s></s></i><i class="b"><s></s></i></div><small>THR / BRK</small>';
    case 'graph': return '<canvas width="120" height="44"></canvas><small>SPEED</small>';
    case 'compass': return '<div class="hg-cmp"><div class="hg-rose"><b>N</b><b>E</b><b>S</b><b>W</b></div><i></i></div>';
    case 'alt': return '<b class="hg-v">0 m</b><small>ALTITUDE</small>';
    case 'clock': return '<b class="hg-v mono">--:--</b><small>TIME</small>';
    case 'odo': return '<b class="hg-v mono">0.00 km</b><small>DISTANCE</small>';
    case 'top': return '<b class="hg-v">0</b><small>TOP km/h</small>';
    case 'rpmnum': return '<b class="hg-v mono">0</b><small>RPM</small>';
    case 'kmh': return '<b class="hg-big">0</b><small>km/h</small>';
    case 'combo': return '<b class="hg-v">0</b><small>DRIFT PTS</small>';
    case 'rainbow': return `<div class="hg-rb">${Array.from({ length: 10 }, (_, k) => `<i data-k="${k}"></i>`).join('')}</div><small>POWER</small>`;
    case 'heart': return '<canvas width="120" height="44"></canvas><b class="hg-v sm">-- bpm</b>';
  } return ''; },
  update(g, dt) { const d = SAVE.data, list = (d.hudG || []).filter(id => GADGET_BY[id] && invHas('hud_' + id)).slice(0, HUDG_MAX), el = this.ensure();
    const show = list.length && g.active && !(g.cfg && g.cfg.replay) && !document.body.classList.contains('photo') && !document.querySelector('#overlay:not(.hidden) .modal'); el.style.display = show ? '' : 'none'; if (!show) return; this.build(list);
    const v = g.veh, kmh = (v.speed || 0) * 3.6, step = Math.max(0.001, Math.min(0.05, dt || 0.016)), hd = v.heading; if (this.lastHd == null || this._g !== g) { this._g = g; this.lastHd = hd; this.maxKmh = 0; this.hist = []; this.dist = 0; this.lastSp = v.speed; }
    const yaw = wrapAngle(hd - this.lastHd) / step; this.lastHd = hd; const lat = clamp(yaw * v.speed / 9.81, -2, 2), lon = clamp((v.speed - this.lastSp) / step / 9.81, -2, 2); this.lastSp = v.speed; this.maxKmh = Math.max(this.maxKmh, kmh); this.dist += v.speed * step;
    const vang = v.speed > 3 ? Math.abs(wrapAngle(Math.atan2(v.vx, v.vz) - hd)) * 57.3 : 0, nr = clamp((v.rpm || 0) / ((g.spec && g.spec.redline) || 7000), 0, 1.05);
    this._acc = (this._acc || 0) + step; const slow = this._acc > 0.1; if (slow) { this._acc = 0; this.hist.push(kmh); if (this.hist.length > 60) this.hist.shift(); }
    for (const w of el.children) { const G = GADGET_BY[w.dataset.g], V = w.querySelector('.hg-v'), B = w.querySelector('.hg-big');
      switch (G.k) {
        case 'gmeter': { const dot = w.querySelector('.hg-dot'); dot.setAttribute('cx', 30 + clamp(lat, -1.8, 1.8) * 13); dot.setAttribute('cy', 30 - clamp(lon, -1.8, 1.8) * 13); if (slow) V.textContent = Math.hypot(lat, lon).toFixed(1) + 'G'; break; }
        case 'boost': { const b = clamp(v.boost || 0, 0, 1.5); w.querySelector('.hg-arc').setAttribute('stroke-dasharray', `${b / 1.5 * 100} 100`); if (slow) V.textContent = (b * 1.2).toFixed(1); break; }
        case 'angle': w.querySelector('.hg-ndl').setAttribute('transform', `rotate(${clamp(vang, 0, 90) * (wrapAngle(Math.atan2(v.vx, v.vz) - hd) > 0 ? -1 : 1)} 30 32)`); if (slow) V.textContent = Math.round(vang) + '°'; break;
        case 'gear': B.textContent = v.gear > 0 ? v.gear : v.gear < 0 ? 'R' : 'N'; break;
        case 'shift': { const leds = w.querySelectorAll('i'), n = leds.length, on = Math.round(clamp((nr - 0.55) / 0.42, 0, 1) * n); leds.forEach((l, k) => { l.className = k < on ? (nr > 0.96 ? 'on flash' : 'on') : ''; }); break; }
        case 'pedals': w.querySelector('.t s').style.height = Math.round(clamp(v.throttleOut || 0, 0, 1) * 100) + '%'; w.querySelector('.b s').style.height = Math.round(clamp(v.brakeOut != null ? v.brakeOut : (Input && Input.brake ? 1 : 0), 0, 1) * 100) + '%'; break;
        case 'graph': case 'heart': if (slow) { const cv = w.querySelector('canvas'), c = cv.getContext('2d'); c.clearRect(0, 0, 120, 44); c.strokeStyle = G.c; c.lineWidth = 2; c.beginPath(); if (G.k === 'graph') { this.hist.forEach((s, k) => { const x = k * 2, y = 42 - clamp(s / Math.max(120, this.maxKmh), 0, 1) * 38; k ? c.lineTo(x, y) : c.moveTo(x, y); }); } else { const bpm = Math.round(70 + clamp(kmh, 0, 300) * 0.35 + vang * 0.4); this._ht = (this._ht || 0) + 0.1 * bpm / 60; for (let x = 0; x < 120; x++) { const ph = ((x / 120) * 2 + this._ht) % 1, y = 26 - (ph > 0.42 && ph < 0.47 ? 18 : ph > 0.47 && ph < 0.5 ? -8 : 0); x ? c.lineTo(x, y) : c.moveTo(x, y); } V.textContent = bpm + ' bpm'; } c.stroke(); } break;
        case 'compass': w.querySelector('.hg-rose').style.transform = `rotate(${(-hd * 57.3).toFixed(1)}deg)`; break;
        case 'alt': if (slow) V.textContent = Math.round(v.y || 0) + ' m'; break;
        case 'clock': if (slow) { const t = new Date(); V.textContent = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0'); } break;
        case 'odo': if (slow) V.textContent = (this.dist / 1000).toFixed(2) + ' km'; break;
        case 'top': if (slow) V.textContent = Math.round(this.maxKmh); break;
        case 'rpmnum': if (slow) V.textContent = Math.round((v.rpm || 0) / 50) * 50; break;
        case 'kmh': B.textContent = Math.round(kmh); break;
        case 'combo': if (slow) { const s = (g.drift && (g.drift.score || g.drift.total)) || 0; V.textContent = s > 9999 ? (s / 1000).toFixed(1) + 'K' : Math.round(s); } break;
        case 'rainbow': { const leds = w.querySelectorAll('i'), on = Math.round(clamp(nr, 0, 1) * leds.length); leds.forEach((l, k) => l.classList.toggle('on', k < on)); break; }
      } } } };
function id8(G) { return G.id === 'shift_p' ? 10 : 7; }
{ const GP = Game.prototype, _up = GP.update; GP.update = function (dt) { _up.call(this, dt); try { HUDG.update(this, dt); } catch (e) { } }; }
{ const _gm = UI.goMenu; UI.goMenu = function () { if (HUDG.el) HUDG.el.style.display = 'none'; return _gm.apply(this, arguments); }; }

// ---------------- パック ----------------
CHESTS.push({ id: 'smokepack', name: 'タイヤスモークパック', price: 1000000, odds: { C: 34, U: 32, R: 20, E: 11, L: 3 }, color: '#d8dee6', pool: 'smoke' },
  { id: 'stamppack', name: 'スタンプパック', price: 0, dia: 40, odds: { C: 34, U: 34, R: 20, E: 9, L: 3 }, color: '#ffd23a', pool: 'stamp' },
  { id: 'hudpack', name: '追加メーターパック', price: 1500000, odds: { C: 30, U: 34, R: 22, E: 11, L: 3 }, color: '#5ad1ff', pool: 'hudgadget' });
Object.assign(PACK_ART, { smokepack: { a: '#1a1a20', b: '#d8dee6', t: 'SMOKE' }, stamppack: { a: '#2a2006', b: '#ffd23a', t: 'STAMPS' }, hudpack: { a: '#061a2a', b: '#5ad1ff', t: 'GAUGES' } });
Object.assign(PACK_TIER, { smokepack: 2, stamppack: 2, hudpack: 3 }); Object.assign(NEWPOOL, { smoke: 'smoke', stamp: 'stamp', hudgadget: 'hudgadget' }); Object.assign(ITEM_TYPES, { smoke: 'タイヤスモーク', stamp: 'スタンプ', hudgadget: '追加メーター' });
Object.assign(COVER_SVG, {
  smokepack: `${[[30, 40, 18, '#ff4a8a'], [50, 30, 20, '#5ad1ff'], [70, 42, 17, '#ffd21a'], [44, 52, 15, '#b07aff'], [62, 56, 13, '#3adc5a']].map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".85"/>`).join('')}<circle cx="24" cy="70" r="13" fill="#1a1a1c" stroke="#666" stroke-width="2"/><circle cx="24" cy="70" r="6" fill="#c8ccd2"/>`,
  stamppack: `<g transform="rotate(-8 50 45)"><rect x="18" y="14" width="44" height="44" rx="8" fill="#fff" stroke="#111" stroke-width="2.5"/><svg x="20" y="16" width="40" height="40" viewBox="0 0 80 80">${STAMP_BY.s1.svg}</svg></g><g transform="rotate(10 60 50)"><rect x="44" y="30" width="40" height="40" rx="8" fill="#fff" stroke="#111" stroke-width="2.5"/><svg x="46" y="32" width="36" height="36" viewBox="0 0 80 80">${STAMP_BY.s2.svg}</svg></g>`,
  hudpack: `<rect x="10" y="20" width="80" height="50" rx="8" fill="#0c0e14" stroke="#5ad1ff" stroke-width="2.5"/><circle cx="32" cy="45" r="15" fill="none" stroke="#5ad1ff" stroke-width="2"/><circle cx="37" cy="40" r="4" fill="#5ad1ff"/><path d="M52 58 a14 14 0 1 1 26 0" stroke="#444" stroke-width="4" fill="none"/><path d="M52 58 a14 14 0 0 1 18 -18" stroke="#ffcf3d" stroke-width="4" fill="none"/>${[0, 1, 2, 3, 4].map(k => `<circle cx="${52 + k * 7}" cy="28" r="2.6" fill="${k < 2 ? '#3adc5a' : k < 4 ? '#ffd21a' : '#ff3a3a'}"/>`).join('')}`
});
{ const _ic = itemIconSvg; itemIconSvg = function (it, size = 34) { if (it) { if (it.type === 'smoke') return smokeSvg(it.smokeX, size); if (it.type === 'stamp') return stampSvg(it.stamp, size); if (it.type === 'hudgadget') return gadgetSvg(it.gadget, size); } return _ic(it, size); }; }
{ const _sh = UI.packStoreHTML; UI.packStoreHTML = function () { let h = _sh.apply(this, arguments); for (const [id, k] of [['smokepack', 'ドリフトの煙の色'], ['stamppack', 'チャット用の動くスタンプ'], ['hudpack', 'レース画面の追加メーター']]) h = h.replace(new RegExp(`(data-v="${id}"[\\s\\S]*?<span class="ps-kind">)[^<]*`), `$1${k}`); return h; }; }
// 「飾り・小物」タブ：スモーク・メーター
CM_TABS.push(['smoke', 'スモーク'], ['hud', 'メーター']);
{ const _rc = UI.r_charm; UI.r_charm = function () { const tab = this.cmTab; if (tab !== 'smoke' && tab !== 'hud') return _rc.apply(this, arguments); $('panelTitle').textContent = 'CUSTOM'; const inst = SAVE.cur(), d = SAVE.data; this.show.setCar(inst);
    const tabs = `<div class="cm-tabs">${CM_TABS.map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-a="cmTab" data-v="${k}">${n}</button>`).join('')}</div>`;
    const grid = (type, key, isOn, act, icon, noneLabel) => { const all = ITEMS.filter(i => i.type === type), own = all.filter(i => invHas(i.id)); return `<div class="h3">${own.length} / ${all.length} 所持</div><div class="cm-grid">${noneLabel ? `<button class="cm-it ${isOn('') ? 'on' : ''}" data-a="${act}" data-v=""><span class="cm-none">なし</span><b>${noneLabel}</b></button>` : ''}${all.map(it => { const o = invHas(it.id); return `<button class="cm-it ${isOn(it[key]) ? 'on' : ''} ${o ? '' : 'lock'}" data-a="${o ? act : 'cmLocked'}" data-v="${it[key]}" style="--rc:${RCOL(it.rarity)}">${icon(it)}<b>${esc(it.name.replace(/^[^「]*「|」$/g, ''))}</b><small>${RARITY[it.rarity].name}</small></button>`; }).join('')}</div>`; };
    if (tab === 'smoke') { const cur = (inst.look || {}).smokeX || ''; return tabs + `<div class="cm-hero"><div class="gf-cover">${smokeSvg(cur || 'rainbow', 66)}</div><div><b>タイヤスモークの色</b><small>いま乗っている車がドリフトしたときの煙の色です（スモーク系のエキストラを付けているときはそちらが優先）。</small><button class="btn" data-a="smkAll">全部の車に同じ色を付ける</button> <button class="btn" data-a="goPackSp" data-v="smokepack">タイヤスモークパックへ</button></div></div>` + grid('smoke', 'smokeX', x => x === cur, 'setSmokeX', it => smokeSvg(it.smokeX, 46), '標準の煙'); }
    const on = (d.hudG || []).filter(id => invHas('hud_' + id)); return tabs + `<div class="cm-hero"><div class="gf-cover">${gadgetSvg('gmeter_n', 66)}</div><div><b>追加メーター（${on.length} / ${HUDG_MAX}）</b><small>レース画面にメーターを追加できます（最大${HUDG_MAX}つ）。タップで付ける／外す。</small><button class="btn" data-a="hudClear">全部外す</button> <button class="btn" data-a="goPackSp" data-v="hudpack">追加メーターパックへ</button></div></div>` + grid('hudgadget', 'gadget', x => on.includes(x), 'togHudG', it => gadgetSvg(it.gadget, 46)); }; }
Object.assign(UI, {
  a_setSmokeX(id) { const inst = SAVE.cur(); inst.look = inst.look || defaultLook(CAR_BY_ID[inst.id]); inst.look.smokeX = id || ''; SAVE.save(); AUDIO.confirm && AUDIO.confirm(); this.render(); },
  a_smkAll() { const id = (SAVE.cur().look || {}).smokeX || ''; for (const c of SAVE.data.cars) { c.look = c.look || defaultLook(CAR_BY_ID[c.id]); c.look.smokeX = id; } SAVE.save(); this.toast('全部の車に同じスモークを付けました'); },
  a_togHudG(id) { const d = SAVE.data; d.hudG = (d.hudG || []).filter(x => invHas('hud_' + x)); const i = d.hudG.indexOf(id); if (i >= 0) d.hudG.splice(i, 1); else { if (d.hudG.length >= HUDG_MAX) return this.toast(`メーターは ${HUDG_MAX} つまで付けられます`); d.hudG.push(id); } SAVE.save(); AUDIO.confirm && AUDIO.confirm(); this.render(); },
  a_hudClear() { SAVE.data.hudG = []; SAVE.save(); this.render(); }
});

// ---------------- パックの天井（決まった回数でレジェンダリー確定） ----------------
const PITY_N = c => { const L = (c.odds && c.odds.L) || 0; return L <= 0 ? 0 : L >= 10 ? 30 : L >= 4 ? 50 : 80; };
{ const _rc = rollChest; rollChest = function (chest, rnd = Math.random) { const def = CHESTS.find(x => x.id === chest.id) || chest, N = PITY_N(def); if (!N || def.daily || def.id === 'giftbox') return _rc(chest, rnd);
    const d = SAVE.data; d.pity = d.pity || {}; const cnt = (d.pity[def.id] || 0) + 1; let it;
    if (cnt >= N) { const odds = chest.odds || def.odds; let off = 0; for (const r of RAR_ORDER) { if (r === 'L') break; off += odds[r] || 0; } let first = true; const rig = () => { if (first) { first = false; return (off + (odds.L || 1) / 2) / 100; } return rnd(); }; it = _rc(chest, rig); }
    else it = _rc(chest, rnd);
    d.pity[def.id] = it && (it.rarity === 'L' || it.rarity === 'M') ? 0 : cnt; return it; }; }
{ const _po = UI.a_psOpen; UI.a_psOpen = function (id) { const r = _po.apply(this, arguments); const c = CHESTS.find(x => x.id === id), N = c && PITY_N(c); if (N && !c.daily) { const n = (SAVE.data.pity || {})[id] || 0, note = document.querySelector('.pd-note'); if (note && !note.querySelector('.pity')) note.insertAdjacentHTML('beforeend', `<div class="pity"><b>天井</b>あと <em>${N - n}</em> 枚でレジェンダリー確定<span class="pity-bar"><i style="width:${n / N * 100}%"></i></span><small>${n} / ${N}</small></div>`); } return r; }; }

// ---------------- コレクションブック ----------------
const COL_SKIP = new Set(['cash', 'dia', 'ticket', 'starcard', 'carcard']);
const COL_RW = [[0.25, { k: 'dia', a: 5 }], [0.5, { k: 'dia', a: 15 }], [0.75, { k: 'money', a: 3000000 }], [1, { k: 'dia', a: 60 }]];
const colTypes = () => { const m = {}; for (const it of ITEMS) { if (COL_SKIP.has(it.type) || it.hidden) continue; (m[it.type] = m[it.type] || []).push(it); } return Object.entries(m).filter(([, l]) => l.length >= 3).sort((a, b) => b[1].length - a[1].length); };
Object.assign(UI, {
  r_colbook() { $('panelTitle').textContent = 'COLLECTION BOOK'; this.show.setCar(SAVE.cur()); const d = SAVE.data; d.colRw = d.colRw || {}; const T = colTypes(), sel = this.cbType;
    let allN = 0, allO = 0; for (const [, l] of T) { allN += l.length; allO += l.filter(i => invHas(i.id)).length; }
    if (sel && T.find(([t]) => t === sel)) { const l = T.find(([t]) => t === sel)[1], o = l.filter(i => invHas(i.id)).length;
      return `<button class="btn" data-a="cbType" data-v="">← 一覧へ</button><div class="cb-head"><b>${esc(ITEM_TYPES[sel] || sel)}</b><span>${o} / ${l.length}</span><div class="cb-bar"><i style="width:${o / l.length * 100}%"></i></div></div><div class="cb-grid">${l.slice().sort((a, b) => RAR_ORDER.indexOf(b.rarity) - RAR_ORDER.indexOf(a.rarity)).map(it => { const own = invHas(it.id); return `<div class="cb-it ${own ? '' : 'lock'}" style="--rc:${RCOL(it.rarity)}" title="${esc(it.name)}"><div class="cb-ic">${own ? itemIconSvg(it, 40) : '<b>?</b>'}</div><small>${own ? esc(it.name.replace(/^[^「]*「|」$/g, '')) : '???'}</small><i class="cb-r">${it.rarity}</i></div>`; }).join('')}</div>`; }
    return `<div class="cb-hero"><div><b>コレクションブック</b><small>アイテムを集めて図鑑を完成させよう。集めた割合に応じてごほうびがもらえます。</small></div><div class="cb-all"><em>${Math.floor(allO / allN * 100)}%</em><small>${allO} / ${allN}</small></div></div>
      <div class="cb-list">${T.map(([t, l]) => { const o = l.filter(i => invHas(i.id)).length, p = o / l.length, got = d.colRw[t] || 0, top = l.slice().sort((a, b) => RAR_ORDER.indexOf(b.rarity) - RAR_ORDER.indexOf(a.rarity)).find(i => invHas(i.id));
        return `<div class="cb-row"><button class="cb-open" data-a="cbType" data-v="${t}"><span class="cb-ic">${top ? itemIconSvg(top, 34) : '<b>?</b>'}</span><span class="cb-tx"><b>${esc(ITEM_TYPES[t] || t)}</b><span class="cb-bar"><i style="width:${p * 100}%"></i></span><small>${o} / ${l.length}（${Math.floor(p * 100)}%）</small></span></button><div class="cb-rw">${COL_RW.map(([th, rw], i) => { const ok = p >= th, claimed = got > i; return `<button class="cb-r ${claimed ? 'got' : ok ? 'ready' : ''}" data-a="cbClaim" data-v="${t}:${i}" ${ok && !claimed ? '' : 'disabled'}><small>${th * 100}%</small>${claimed ? '✓' : rw.k === 'dia' ? SICO.gem(12) + rw.a : '¥' + (rw.a / 1e6) + 'M'}</button>`; }).join('')}</div></div>`; }).join('')}</div>`; },
  a_cbType(t) { this.cbType = t; this.render(); },
  a_cbClaim(v) { const [t, si] = v.split(':'), i = +si, d = SAVE.data; d.colRw = d.colRw || {}; const T = colTypes().find(([x]) => x === t); if (!T) return; const l = T[1], p = l.filter(x => invHas(x.id)).length / l.length; if ((d.colRw[t] || 0) !== i || p < COL_RW[i][0]) return;
    const rw = COL_RW[i][1]; if (rw.k === 'dia') d.diamonds = (d.diamonds || 0) + rw.a; else SAVE.addMoney(rw.a); d.colRw[t] = i + 1; SAVE.save(); AUDIO.buy && AUDIO.buy(); this.toast(`ごほうび：${rw.k === 'dia' ? 'ダイヤ ×' + rw.a : yen(rw.a)} を受け取りました`); this.refreshTop(); this.render(); }
});
{ const _mi = UI.menuItems; UI.menuItems = function () { _mi.apply(this, arguments); const el = $('menuList'), pills = el && el.querySelectorAll('.nm-pills')[0]; if (pills && !pills.querySelector('[data-m="colbook"]')) pills.insertAdjacentHTML('beforeend', `<button class="nm-pill" data-m="colbook"><span class="nmc-ic"><svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="3" width="14" height="18" rx="2" fill="#5ad1ff"/><rect x="7" y="3" width="14" height="18" rx="2" fill="#2a8aff" stroke="#fff" stroke-width="1"/><path d="M11 9 h6 M11 13 h6" stroke="#fff" stroke-width="1.5"/></svg></span><span>コレクションブック</span></button>`); }; }
BNAV_OF.colbook = 'garage';

// ---------------- フォトモード ----------------
const PHOTO = { on: false, yaw: 2.6, pitch: 0.25, dist: 7, fov: 50, h: 0, filter: 0, frame: 0, logo: true };
const PH_FILTERS = [['ノーマル', 'none'], ['ビビッド', 'saturate(1.5) contrast(1.1)'], ['モノクロ', 'grayscale(1) contrast(1.15)'], ['セピア', 'sepia(.85) contrast(1.05)'], ['シネマ', 'contrast(1.25) saturate(.8) brightness(.95)'], ['ネオン', 'saturate(1.8) hue-rotate(-20deg) contrast(1.2)'], ['レトロ', 'sepia(.35) saturate(1.3) contrast(.9) brightness(1.05)'], ['ナイト', 'brightness(.8) contrast(1.3) hue-rotate(190deg) saturate(.6)']];
const PH_FRAMES = ['なし', 'シネマ', 'ポラロイド', 'フィルム', 'レーシング'];
{ const GP = Game.prototype, _uc = GP.updateCamera; GP.updateCamera = function (dt) { if (!PHOTO.on) return _uc.call(this, dt); const v = this.veh, c = this.R.cam; const cx = v.x, cy = v.y + 0.7 + PHOTO.h, cz = v.z, a = v.heading + PHOTO.yaw, cp = Math.cos(PHOTO.pitch);
    const eye = [cx + Math.sin(a) * PHOTO.dist * cp, cy + Math.sin(PHOTO.pitch) * PHOTO.dist, cz + Math.cos(a) * PHOTO.dist * cp]; try { const gy = this.track.env === 'lot' ? 0 : this.track.locate(eye[0], eye[2], this.loc.i).y; eye[1] = Math.max(eye[1], gy + 0.3); } catch (e) { }
    c.pos = eye; c.target = [cx, cy, cz]; c.fov = PHOTO.fov; this.fovCur = PHOTO.fov; c.near = 0.15; c.far = 2400; }; }
{ const _p = UI.pause; UI.pause = function (refresh) { const r = _p.apply(this, arguments); const m = document.querySelector('#overlay .modal .btns'); if (m && !m.querySelector('[data-a=photoOn]') && !(this.game.cfg && this.game.cfg.replay)) m.insertAdjacentHTML('beforeend', '<button class="btn" data-a="photoOn">📷 フォトモード</button>'); return r; }; }
Object.assign(UI, {
  a_photoOn() { this.closeModal(); this.game.paused = true; this.paused = true; PHOTO.on = true; document.body.classList.add('photo'); this.photoUI(); },
  photoUI() { let el = document.getElementById('photoUI'); if (!el) { el = document.createElement('div'); el.id = 'photoUI'; document.body.appendChild(el); el.addEventListener('click', e => this.onAction(e)); el.addEventListener('input', e => { const k = e.target.dataset.ph; if (k) { PHOTO[k] = +e.target.value; } }); this.photoDrag(el); }
    el.innerHTML = `<div class="ph-drag"></div><div class="ph-frame f${PHOTO.frame}" style="--flt:${PH_FILTERS[PHOTO.filter][1]}">${PHOTO.logo ? '<span class="ph-logo">DRIFT <b>LEGENDS</b></span>' : ''}</div>
      <div class="ph-top"><button class="ph-b" data-a="photoOff">✕ 終了</button><span>ドラッグで回す・ピンチ／ホイールで寄る</span><button class="ph-b shot" data-a="photoShot">📷 撮影</button></div>
      <div class="ph-bot"><button class="ph-b" data-a="phFilter">フィルター：${PH_FILTERS[PHOTO.filter][0]}</button><button class="ph-b" data-a="phFrame">フレーム：${PH_FRAMES[PHOTO.frame]}</button><button class="ph-b" data-a="phLogo">ロゴ：${PHOTO.logo ? 'ON' : 'OFF'}</button>
        <label>高さ<input type="range" min="-0.6" max="3" step="0.05" value="${PHOTO.h}" data-ph="h"></label><label>画角<input type="range" min="20" max="90" step="1" value="${PHOTO.fov}" data-ph="fov"></label></div>`;
    document.getElementById('gl').style.filter = PH_FILTERS[PHOTO.filter][1]; },
  photoDrag(el) { const pts = new Map(); let pinch = null; el.addEventListener('pointerdown', e => { if (!e.target.classList.contains('ph-drag')) return; pts.set(e.pointerId, [e.clientX, e.clientY]); try { e.target.setPointerCapture(e.pointerId); } catch (x) { } });
    el.addEventListener('pointermove', e => { if (!pts.has(e.pointerId)) return; const p = pts.get(e.pointerId); if (pts.size === 2) { pts.set(e.pointerId, [e.clientX, e.clientY]); const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) PHOTO.dist = clamp(PHOTO.dist * pinch / d, 2.5, 30); pinch = d; return; }
      PHOTO.yaw -= (e.clientX - p[0]) * 0.008; PHOTO.pitch = clamp(PHOTO.pitch + (e.clientY - p[1]) * 0.005, -0.15, 1.4); pts.set(e.pointerId, [e.clientX, e.clientY]); });
    const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', e => { PHOTO.dist = clamp(PHOTO.dist * (1 + Math.sign(e.deltaY) * 0.08), 2.5, 30); e.preventDefault(); }, { passive: false }); },
  a_phFilter() { PHOTO.filter = (PHOTO.filter + 1) % PH_FILTERS.length; this.photoUI(); },
  a_phFrame() { PHOTO.frame = (PHOTO.frame + 1) % PH_FRAMES.length; this.photoUI(); },
  a_phLogo() { PHOTO.logo = !PHOTO.logo; this.photoUI(); },
  a_photoOff() { PHOTO.on = false; document.body.classList.remove('photo'); const el = document.getElementById('photoUI'); if (el) el.remove(); document.getElementById('gl').style.filter = ''; this.pause(); },
  a_photoShot() { const g = this.game, cv = document.getElementById('gl'); try { g.render(0); } catch (e) { } let src; try { src = cv.toDataURL('image/png'); } catch (e) { return this.toast('撮影できませんでした'); }
    const img = new Image(); img.onload = () => { const W = cv.width, H = cv.height, o = document.createElement('canvas'); o.width = W; o.height = H; const c = o.getContext('2d'); c.filter = PH_FILTERS[PHOTO.filter][1]; c.drawImage(img, 0, 0, W, H); c.filter = 'none';
      const f = PHOTO.frame, s = W / 1000; if (f === 1) { c.fillStyle = '#000'; c.fillRect(0, 0, W, H * 0.11); c.fillRect(0, H * 0.89, W, H * 0.11); } else if (f === 2) { const b = 26 * s; c.fillStyle = '#fafaf6'; c.fillRect(0, 0, W, b); c.fillRect(0, 0, b, H); c.fillRect(W - b, 0, b, H); c.fillRect(0, H - b * 3.4, W, b * 3.4); c.fillStyle = '#333'; c.font = `italic ${24 * s}px serif`; c.fillText(new Date().toLocaleDateString('ja-JP'), b, H - b * 1.4); }
      else if (f === 3) { c.fillStyle = '#111'; c.fillRect(0, 0, W, 40 * s); c.fillRect(0, H - 40 * s, W, 40 * s); c.fillStyle = '#f4e8c8'; for (let x = 10 * s; x < W; x += 34 * s) { c.fillRect(x, 12 * s, 18 * s, 16 * s); c.fillRect(x, H - 28 * s, 18 * s, 16 * s); } }
      else if (f === 4) { c.strokeStyle = '#ffcf3d'; c.lineWidth = 10 * s; c.strokeRect(14 * s, 14 * s, W - 28 * s, H - 28 * s); for (let k = 0; k < 12; k++) { c.fillStyle = k % 2 ? '#111' : '#fff'; c.fillRect(14 * s + k * 18 * s, 14 * s, 18 * s, 18 * s); c.fillStyle = k % 2 ? '#fff' : '#111'; c.fillRect(14 * s + k * 18 * s, 32 * s, 18 * s, 18 * s); } }
      if (PHOTO.logo) { c.font = `900 italic ${30 * s}px Arial`; c.textAlign = 'right'; c.fillStyle = 'rgba(0,0,0,.5)'; c.fillText('DRIFT LEGENDS', W - 30 * s + 2, H - (f === 2 ? 44 : f === 1 ? H * 0.11 / s - 20 : 30) * s + 2); c.fillStyle = '#fff'; c.fillText('DRIFT LEGENDS', W - 30 * s, H - (f === 2 ? 44 : f === 1 ? H * 0.11 / s - 20 : 30) * s); }
      const url = o.toDataURL('image/png'); AUDIO.tone && (AUDIO.tone(1800, 0.05, 'square', 0.1), AUDIO.noiseBurst && AUDIO.noiseBurst(0.12, 4000, 0.7, 0.15, 0.04));
      const fl = document.createElement('div'); fl.className = 'ph-flash'; document.body.appendChild(fl); setTimeout(() => fl.remove(), 500);
      const pv = document.createElement('div'); pv.id = 'phPrev'; pv.innerHTML = `<div class="php-in"><img src="${url}"><div class="btns"><a class="btn pri" href="${url}" download="drift-legends-${Date.now()}.png">保存する</a><button class="btn" data-x="1">閉じる</button></div><small>スマホでは画像を長押しして保存することもできます</small></div>`; pv.addEventListener('click', e => { if (e.target.dataset.x || e.target === pv) pv.remove(); }); document.body.appendChild(pv); };
    img.src = src; }
});
{ const _gm = UI.goMenu; UI.goMenu = function () { if (PHOTO.on) { PHOTO.on = false; document.body.classList.remove('photo'); const el = document.getElementById('photoUI'); if (el) el.remove(); document.getElementById('gl').style.filter = ''; } return _gm.apply(this, arguments); }; }
{ const _rs = UI.a_resume; if (_rs) UI.a_resume = function () { if (PHOTO.on) return; return _rs.apply(this, arguments); }; }
window.__DLX = Object.assign(window.__DLX || {}, { packPool, PHOTO, HUDG, SMOKE_BY, STAMP_BY, GADGET_BY, colTypes, PITY_N, rollChest: (c) => rollChest(c) });
