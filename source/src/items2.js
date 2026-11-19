// =====================================================================
// items2.js — v2.1 大型アイテム追加（デカール・メーター・チューン・エキストラ・パーツ・音楽・ダイヤ商品・そり）
// 各アイテムは en（英語名）を持つ → 英語モードで自動的に翻訳される
// =====================================================================
const addCar = (r) => { CAR_ROWS.push(r); const c = { id: r[0], maker: r[1], name: r[2], era: r[3], drive: r[4], hp: r[5], torque: r[6], kg: r[7], top: r[8], gears: r[9], redline: r[10], turbo: !!r[11], handling: r[12], drift: r[13], brake: r[14], price: r[15], body: r[16], L: r[17], W: r[18], H: r[19], color: r[20], popup: !!r[21], sound: r[22], wb: r[23], fb: r[24], unlock: r[25] }; if (!CAR_BY_ID[c.id]) { CARS.push(c); CAR_BY_ID[c.id] = c; } return c; };
const RR = ['C', 'C', 'U', 'U', 'R', 'E'];
// ---- サンタのそり（クリスマス限定車） ----
addCar(['xm_santa', 'EVENT', 'SANTA SLEIGH', 'サンタクロースのそり', 'FR', 480, 520, 900, 260, 6, 8000, 0, 90, 99, 80, 0, 'sleigh', 4.4, 1.8, 1.2, '#c8102e', 0, 'v8', 2.6, 0.5, { event: 1 }]);
// ---- デカール +40 ----
[['BOOST', '#111', '#ff3a3a'], ['TOUGE KING', '#000', '#ffd400'], ['NIGHT RUN', '#0a0a2a', '#9ad0ff'], ['ZERO', '#fff', '#111'], ['SHIFT', '#ff6a00', '#111'], ['GRIP', '#1e5aff', '#fff'], ['SLIDE', '#2fdc7a', '#111'], ['HYPER', '#b04dff', '#fff'], ['LIMIT', '#e10600', '#fff'], ['TURBO GT', '#fff', '#e10600'],
 ['RAPID', '#111', '#2fdc7a'], ['NEON', '#ff2bd6', '#fff'], ['STORM', '#30333a', '#fff'], ['ACE', '#ffd400', '#111'], ['ORBIT', '#0b1a3a', '#ffcf3d'], ['ROCKET', '#c00018', '#fff'], ['DRIFT CLUB', '#111', '#ff8a3d'], ['GO FAST', '#fff', '#1e5aff'], ['NO BRAKES', '#111', '#ff3a3a'], ['SIDEWAYS', '#ffcf3d', '#111'],
 ['頂点', '#111', '#ffd400', 'serif'], ['疾走', '#fff', '#111', 'serif'], ['爆走', '#e10600', '#fff', 'serif'], ['峠王', '#000', '#ffd700', 'serif'], ['夜桜', '#3a1a3a', '#ffb7d5', 'serif'], ['閃光', '#0b1a3a', '#9ad0ff', 'serif'], ['紅蓮', '#600000', '#ffb000', 'serif'], ['無限', '#111', '#2fdc7a', 'serif'], ['覇者', '#2a1a00', '#ffcf3d', 'serif'], ['旋風', '#fff', '#2a6aff', 'serif']]
  .forEach(([t, bg, fg, font], i) => addItem({ id: 'dc2_t' + i, type: 'decal', name: '「' + t + '」ステッカー', en: '"' + t + '" sticker', rarity: RR[i % 6], kind: 'text', text: t, bg, fg, font: font || 'Arial' }));
[['star', '#ff4fa0', 'ピンクスター', 'Pink Star'], ['star', '#2fdc7a', 'グリーンスター', 'Green Star'], ['bolt', '#00e5ff', 'ブルーイナズマ', 'Blue Bolt'], ['bolt', '#ff3a3a', 'レッドイナズマ', 'Red Bolt'], ['heart', '#ff2a2a', 'レッドハート', 'Red Heart'], ['flame', '#00b0ff', 'ブルーフレイム', 'Blue Flame'], ['diamond', '#ff4fa0', 'ピンクダイヤ', 'Pink Diamond'], ['crown', '#c8ccd4', 'シルバークラウン', 'Silver Crown'], ['sakura', '#ffffff', 'ホワイトサクラ', 'White Sakura'], ['wing', '#ffd400', 'ゴールドウイング', 'Gold Wing']]
  .forEach(([sh, col, nm, en], i) => addItem({ id: 'dc2_s' + i, type: 'decal', name: nm + 'マーク', en: en + ' mark', rarity: RR[(i + 2) % 6], kind: 'shape', shape: sh, color: col }));
// ---- 限定カラー +20 ----
[['ネオンピンク', 'Neon Pink', '#ff2bd6', 'gloss'], ['ディープオーシャン', 'Deep Ocean', '#0a3a6a', 'pearl'], ['フォレストグリーン', 'Forest Green', '#1a4a2a', 'metallic'], ['ラベンダー', 'Lavender', '#b49aff', 'pearl'], ['コッパー', 'Copper', '#b8733a', 'metallic'],
 ['ミントグリーン', 'Mint Green', '#7affc8', 'gloss'], ['スカイブルー', 'Sky Blue', '#6ac8ff', 'gloss'], ['ワインレッド', 'Wine Red', '#5a0a1a', 'pearl'], ['サンドベージュ', 'Sand Beige', '#d8c49a', 'matte'], ['チャコール', 'Charcoal', '#2a2c30', 'matte'],
 ['キャンディパープル', 'Candy Purple', '#6a00a0', 'candy'], ['キャンディグリーン', 'Candy Green', '#00804a', 'candy'], ['キャンディブルー', 'Candy Blue', '#0040c0', 'candy'], ['クロームレッド', 'Chrome Red', '#c0102a', 'chrome'], ['クロームブルー', 'Chrome Blue', '#2050c0', 'chrome'],
 ['マットホワイト', 'Matte White', '#e8e8e4', 'matte'], ['マットオリーブ', 'Matte Olive', '#4a5030', 'matte'], ['パールオレンジ', 'Pearl Orange', '#ff8a2a', 'pearl'], ['パールイエロー', 'Pearl Yellow', '#ffd84a', 'pearl'], ['ギャラクシーブラック', 'Galaxy Black', '#0a0a18', 'pearl']]
  .forEach(([nm, en, c, p], i) => addItem({ id: 'pt2_' + i, type: 'paint', name: nm, en, rarity: RR[i % 6], color: c, paint: p }));
// ---- ホイール +16 ----
[['シルバースター', 'Silver Star', 5, 0, '#d8dce4'], ['レッドリム', 'Red Rim', 6, 1, '#c00018'], ['ブルーメッシュ', 'Blue Mesh', 14, 0, '#2a6aff'], ['ピンクスポーク', 'Pink Spokes', 7, 0, '#ff4fa0'], ['ゴールドブレード', 'Gold Blades', 12, 0, '#d4af37'], ['カーボンディッシュ', 'Carbon Dish', 4, 1, '#222'],
 ['ホワイト深リム', 'White Deep-Rim', 8, 1, '#f4f4f4'], ['オレンジ10本', 'Orange 10-Spoke', 10, 0, '#ff6a00'], ['グリーンY字', 'Green Y-Spoke', 7, 0, '#2fdc7a'], ['パープルメッシュ', 'Purple Mesh', 16, 0, '#9a4dff'], ['ブロンズ深リム', 'Bronze Deep-Rim', 6, 1, '#9a6a30'], ['チタン12本', 'Titanium 12-Spoke', 12, 0, '#8a9aa8'],
 ['ネオンイエロー', 'Neon Yellow', 6, 0, '#e8ff00'], ['ブラッククローム', 'Black Chrome', 9, 1, '#30333a'], ['ローズゴールド', 'Rose Gold', 10, 1, '#e8a090'], ['アイスホワイト', 'Ice White', 20, 0, '#eef6ff']]
  .forEach(([nm, en, sp, deep, rim], i) => addItem({ id: 'wh2_' + i, type: 'wheel', name: nm, en, rarity: RR[i % 6], spokes: sp, deep, rim }));
// ---- アンダーネオン +12 ----
[['ライム', 'Lime', [0.6, 1, 0.1]], ['マゼンタ', 'Magenta', [1, 0.1, 0.8]], ['アイスブルー', 'Ice Blue', [0.5, 0.85, 1]], ['サンセット', 'Sunset', [1, 0.4, 0.2]], ['ミント', 'Mint', [0.3, 1, 0.7]], ['バイオレット', 'Violet', [0.5, 0.2, 1]],
 ['ルビー', 'Ruby', [1, 0.05, 0.2]], ['アンバー', 'Amber', [1, 0.65, 0.05]], ['ターコイズ', 'Turquoise', [0.1, 0.9, 0.8]], ['ローズ', 'Rose', [1, 0.5, 0.6]], ['ディープブルー', 'Deep Blue', [0.1, 0.2, 1]], ['オーロラ', 'Aurora', [1, 1, 1], 1]]
  .forEach(([nm, en, rgb, rb], i) => addItem({ id: 'ne2_' + i, type: 'neon', name: nm + 'ネオン', en: en + ' Neon', rarity: RR[(i + 1) % 6], rgb, rainbow: !!rb }));
// ---- キャリパー +8 / 光るナンバー +8 ----
[['レッドメタル', 'Red Metal', '#e01030'], ['ブルーメタル', 'Blue Metal', '#2060ff'], ['ライムグリーン', 'Lime Green', '#9cff2e'], ['ローズゴールド', 'Rose Gold', '#e8a090'], ['チタン', 'Titanium', '#8a9aa8'], ['ターコイズ', 'Turquoise', '#20d0c0'], ['ブラック', 'Black', '#151517'], ['ネオンピンク', 'Neon Pink', '#ff2bd6']]
  .forEach(([nm, en, c], i) => addItem({ id: 'cp2_' + i, type: 'caliper', name: nm + 'キャリパー', en: en + ' Calipers', rarity: RR[i % 6], color: c }));
[['シアン', 'Cyan', [0.1, 0.95, 1]], ['ピンク', 'Pink', [1, 0.3, 0.75]], ['オレンジ', 'Orange', [1, 0.5, 0.1]], ['ライム', 'Lime', [0.6, 1, 0.1]], ['バイオレット', 'Violet', [0.55, 0.25, 1]], ['アイス', 'Ice', [0.7, 0.9, 1]], ['ルビー', 'Ruby', [1, 0.05, 0.2]], ['ネオンミックス', 'Neon Mix', [1, 1, 1], 1]]
  .forEach(([nm, en, rgb, rb], i) => addItem({ id: 'pl2_' + i, type: 'plate', name: '光るナンバー「' + nm + '」', en: 'Glowing Plate "' + en + '"', rarity: RR[(i + 2) % 6], rgb, rainbow: !!rb }));
// ---- スピードメーター +30（デザインは自動生成） ----
const GEN_METERS = [];
[['スターダスト', 'Stardust', '#0a0c1a', '#cfe0ff', '#ffd76a', ['#6a8aff', '#ffd76a']], ['マグマ', 'Magma', '#1a0500', '#ff9a50', '#ffcf3d', ['#ff3a00', '#ffcf3d']], ['オーシャンブルー', 'Ocean Blue', '#021624', '#7ad8ff', '#fff', ['#0060ff', '#00e5ff']], ['フォレスト', 'Forest', '#06140a', '#9aff9a', '#fff', ['#1a8a3a', '#9aff4a']],
 ['ルビー', 'Ruby', '#140006', '#ff8aa0', '#fff', ['#a0001a', '#ff3a6a']], ['アメジスト', 'Amethyst', '#0e0618', '#d8b0ff', '#fff', ['#6a00ff', '#ff6ae8']], ['サンライズ', 'Sunrise', '#1a0e04', '#ffe0a0', '#ff6a00', ['#ff6a00', '#ffe04a']], ['アイス', 'Ice', '#e8f4ff', '#123', '#2a6aff', ['#8ac8ff', '#2a6aff'], '#123'],
 ['ホワイトクラシック', 'White Classic', '#f4f4ef', '#111', '#e10600', null, '#111'], ['ブラックゴールド', 'Black Gold', '#000', '#ffd700', '#ffd700', ['#8a6a10', '#ffd700']], ['ネオンライム', 'Neon Lime', '#050a00', '#c8ff3d', '#ff3ad0', ['#6aff00', '#c8ff3d']], ['レトロオレンジ', 'Retro Orange', '#201408', '#ffb060', '#fff', ['#ff7a00', '#ffb060']],
 ['ミッドナイト', 'Midnight', '#02030a', '#7a8aff', '#fff', ['#2a2aff', '#7a8aff']], ['チェリー', 'Cherry', '#1a0a10', '#ffc0d8', '#ff2a6a', ['#ff6aa0', '#ff2a6a']], ['カーボンブルー', 'Carbon Blue', 'carbon', '#9ad0ff', '#2a8aff', ['#2a6aff', '#9ad0ff']]]
  .forEach(([nm, en, face, tick, needle, arc, txt], i) => { const id = 'mt2_a' + i; GEN_METERS.push([id, { kind: 'analog', face, tick, num: tick, needle, arc, bezel: arc ? arc[1] : '#c0c0c8', red: '#ff3030', glow: i % 3 === 0 ? (arc ? arc[1] : null) : null, faceText: txt, sub: txt }]); addItem({ id, type: 'meter', name: 'メーター「' + nm + '」', en: 'Meter "' + en + '"', rarity: RR[i % 6], meter: id }); });
[['ブルーLCD', 'Blue LCD', 'bar', '#040a18', '#3a8cff', '#9ad0ff', '#ff4040', '#9ad0ff', 1], ['レッドLED', 'Red LED', 'bar', '#100000', '#ff3030', '#ff8a3a', '#fff', '#ff6a6a', 0], ['ホワイトミニマル', 'White Minimal', 'thin', 'rgba(255,255,255,.12)', '#fff', '#fff', '#ff3030', '#fff', 0], ['ゴールドミニマル', 'Gold Minimal', 'thin', 'rgba(0,0,0,.4)', '#ffd700', '#ffd700', '#ff3030', '#ffd700', 0],
 ['シアンリング', 'Cyan Ring', 'ring', '#001418', '#00f0ff', '#00f0ff', '#ff3ad0', '#fff', 0], ['マゼンタリング', 'Magenta Ring', 'ring', '#14001a', '#ff2bd6', '#ff2bd6', '#fff200', '#fff', 0], ['トロピカル', 'Tropical', 'ring', '#001a14', '#2fdc7a', '#ffd040', '#ff3030', '#fff', 0], ['アーケード', 'Arcade', 'bar', '#0a0018', '#ff2bd6', '#00f0ff', '#fff200', '#fff200', 0],
 ['グリーンターミナル', 'Green Terminal', 'bar', '#000', '#00ff40', '#00ff40', '#ff0000', '#00ff40', 1], ['アンバーVFD', 'Amber VFD', 'ring', '#120800', '#ffb000', '#ffb000', '#ff5000', '#ffb000', 0], ['アイスLCD', 'Ice LCD', 'bar', '#dfeaf2', '#2a6aff', '#2a6aff', '#e10600', '#123', 1], ['ステルス', 'Stealth', 'thin', 'rgba(0,0,0,.6)', '#666', '#aaa', '#e10600', '#ccc', 0],
 ['オーロラリング', 'Aurora Ring', 'ring', '#000814', '#3bff9a', '#3bc8ff', '#b05bff', '#fff', 0], ['サンセットバー', 'Sunset Bar', 'bar', '#1a0800', '#ff6a00', '#ffd040', '#ff2a6a', '#ffd040', 0], ['プラズマ', 'Plasma', 'ring', '#04001a', '#5a7aff', '#b05bff', '#ff3ad0', '#fff', 1]]
  .forEach(([nm, en, look, bg, c1, c2, c3, digit, lcd], i) => { const id = 'mt2_d' + i; GEN_METERS.push([id, { kind: 'digital', look, bg, c1, c2, c3, digit, glow: i % 2 ? c1 : 0, lcd, scan: i % 4 === 3 ? 1 : 0 }]); addItem({ id, type: 'meter', name: 'メーター「' + nm + '」', en: 'Meter "' + en + '"', rarity: RR[(i + 1) % 6], meter: id }); });
// ---- 限定チューニングパーツ +54（自動生成：9系統 × 6段階） ----
[['吸気キット', 'Intake Kit', l => ({ hp: 1 + 0.015 * l })], ['排気システム', 'Exhaust System', l => ({ hp: 1 + 0.014 * l, mass: -2 * l })], ['ECUマップ', 'ECU Map', l => ({ hp: 1 + 0.02 * l })], ['軽量パネル', 'Light Panels', l => ({ mass: -8 * l })],
 ['グリップコンパウンド', 'Grip Compound', l => ({ grip: 1 + 0.012 * l })], ['LSDプレート', 'LSD Plates', l => ({ lsd: 0.03 * l })], ['ステアリングキット', 'Steering Kit', l => ({ steer: 1 + 0.025 * l })], ['ニトロタンク', 'Nitro Tank', l => ({ nitro: 1 + 0.12 * l })], ['タービンキット', 'Turbine Kit', l => ({ hp: 1 + 0.018 * l, lag: 1 - 0.05 * l })]]
  .forEach(([nm, en, fx], k) => [['ストリート', 'Street'], ['スポーツ', 'Sport'], ['チューンド', 'Tuned'], ['レーシング', 'Racing'], ['プロ', 'Pro'], ['エクストリーム', 'Extreme']].forEach(([gj, ge], l) => {
    const f = fx(l + 1); const desc = Object.entries(f).map(([a, v]) => ({ hp: '出力', mass: '重量', grip: 'グリップ', lsd: 'LSD', steer: '切れ角', nitro: 'ニトロ', lag: 'ラグ' }[a] + (a === 'mass' ? ` ${v}kg` : a === 'lsd' ? ` +${Math.round(v * 100)}%` : ` ${v >= 1 ? '+' : ''}${Math.round((v - 1) * 100)}%`))).join(' ');
    addItem({ id: `tn2_${k}_${l}`, type: 'tune', name: gj + nm, en: ge + ' ' + en, rarity: ['C', 'C', 'U', 'R', 'E', 'L'][l], fx: f, desc });
  }));
// ---- ボディパーツ（スポイラー・スカート・ボンネット・バンパー・トランク・ルーフ）— 仕上げ色つき ----
const KIT_FIN = [['ゴールド', 'Gold', [1, 0.8, 0.25]], ['クローム', 'Chrome', [0.9, 0.92, 0.96]], ['レッド', 'Red', [0.85, 0.06, 0.08]], ['ホワイト', 'White', [0.95, 0.95, 0.95]], ['ブラック', 'Black', [0.06, 0.06, 0.07]], ['ブルー', 'Blue', [0.15, 0.35, 0.95]], ['ピンク', 'Pink', [1, 0.35, 0.7]], ['グリーン', 'Green', [0.15, 0.8, 0.35]]];
const KIT_SLOTS = [['wing', 'GTウイング', 'GT Wing', 2], ['wing', 'ダブルデッキウイング', 'Double-Deck Wing', 5], ['wing', 'スワンネックウイング', 'Swan-Neck Wing', 4], ['front', 'フルエアロバンパー', 'Full Aero Bumper', 4], ['rear', 'ビッグディフューザー', 'Big Diffuser', 3],
  ['side', 'ワイドスカート', 'Wide Skirts', 3], ['hood', 'ベンテッドボンネット', 'Vented Hood', 3], ['roof', 'ルーフスクープ', 'Roof Scoop', 3], ['trunk', 'トランクリップ', 'Trunk Lip', 1], ['trunk', 'トランクパネル', 'Trunk Panel', 2]];
KIT_SLOTS.forEach(([slot, nm, en, shape], si) => KIT_FIN.forEach(([fj, fe, col], fi) => { if ((si + fi) % 2) return; addItem({ id: `kit_${si}_${fi}`, type: 'kit', name: fj + nm, en: fe + ' ' + en, rarity: fi < 2 ? 'E' : RR[(si + fi) % 6], slot, shape, fin: col, chrome: fi < 2 }); }));
// ---- ホーム背景 +6 ----
[['ruby', 'ルビーナイト', 'Ruby Night', 'R', { floor: [0.1, 0.02, 0.03], wall: [0.08, 0.01, 0.02], strip: [[1, 0.1, 0.25]], zen: [0.5, 0.1, 0.15], hor: [0.2, 0.03, 0.05], fog: [0.08, 0.01, 0.02], fx: 'ember' }],
 ['aqua', 'アクアリウム', 'Aquarium', 'E', { floor: [0.02, 0.1, 0.14], wall: [0.02, 0.08, 0.12], strip: [[0.2, 1, 0.9]], zen: [0.2, 0.6, 0.7], hor: [0.05, 0.25, 0.3], fog: [0.02, 0.08, 0.1], fx: 'bubble' }],
 ['matrix', 'デジタルグリッド', 'Digital Grid', 'R', { floor: [0.01, 0.05, 0.02], wall: [0.0, 0.04, 0.01], strip: [[0.2, 1, 0.3]], zen: [0.05, 0.3, 0.1], hor: [0.01, 0.1, 0.03], fog: [0.0, 0.03, 0.01], fx: 'star' }],
 ['candy', 'キャンディランド', 'Candy Land', 'U', { floor: [0.3, 0.15, 0.22], wall: [0.35, 0.2, 0.3], strip: [[1, 0.5, 0.8], [0.5, 0.9, 1]], zen: [1, 0.7, 0.85], hor: [0.7, 0.45, 0.6], fog: [0.3, 0.18, 0.25], fx: 'confetti' }],
 ['storm', 'サンダーストーム', 'Thunderstorm', 'E', { floor: [0.05, 0.05, 0.07], wall: [0.04, 0.04, 0.06], strip: [[0.6, 0.7, 1]], zen: [0.2, 0.22, 0.3], hor: [0.08, 0.08, 0.12], fog: [0.04, 0.04, 0.06], fx: 'snow' }],
 ['royal', 'ロイヤルパレス', 'Royal Palace', 'L', { floor: [0.2, 0.05, 0.25], wall: [0.15, 0.03, 0.2], strip: [[1, 0.8, 0.3], [0.8, 0.4, 1]], zen: [0.7, 0.4, 0.9], hor: [0.35, 0.15, 0.45], fog: [0.15, 0.04, 0.2], fx: 'confetti' }]]
  .forEach(([key, nm, en, r, th]) => { BG_THEMES[key] = Object.assign({ name: nm }, th); addItem({ id: 'bg_' + key, type: 'bg', name: '背景「' + nm + '」', en: 'Background "' + en + '"', rarity: r, bg: key }); });
// ---- 音楽（カードパック限定・ショップ販売） ----
const BONUS_TRACKS = [
  ['tb1', 'CRYSTAL DRIFT', 154, 52, 1, 201, [0, 5, 3, 4], 'chest', 'E'], ['tb2', 'GOLDEN APEX', 158, 55, 1, 211, [5, 3, 0, 4], 'chest', 'L'], ['tb3', 'NEON SAMURAI', 160, 50, 1, 223, [0, 6, 5, 4], 'chest', 'R'], ['tb4', 'LUNAR COUNTERSTEER', 148, 57, 1, 233, [0, 3, 6, 4], 'chest', 'E'],
  ['tb5', 'MIDNIGHT EXPRESS', 156, 54, 1, 241, [0, 5, 6, 4], 'shop', 'R'], ['tb6', 'SUNRISE HIGHWAY', 150, 60, 0, 251, [0, 4, 5, 3], 'shop', 'U'], ['tb7', 'VELVET THUNDER', 162, 53, 1, 263, [5, 6, 0, 4], 'shop', 'R'], ['tb8', 'DIAMOND RUSH', 164, 58, 1, 271, [0, 5, 3, 6], 'diamond', 'L']
];
for (const [id, nm, bpm, key, minor, seed, prog, src, r] of BONUS_TRACKS) { TRACKS.push({ id, name: nm, bpm, key, minor, seed, prog, cat: 'race', lock: 'mu_' + id, soft: src === 'shop' && id === 'tb6' ? 1 : 0 }); addItem({ id: 'mu_' + id, type: 'music', name: '曲「' + nm + '」', en: 'Song "' + nm + '"', rarity: r, track: id, lim: src === 'chest' ? undefined : src === 'diamond' ? 'diamond' : 'shop' }); }
// ---- エキストラ +22 ----
[['goldjet', 'ゴールドジェット', 'Gold Jet', { perf: 1, kind: 'thrust', F: 9000, drain: 0.16, rech: 0.08, col: [1, 0.85, 0.3], gold: 1, desc: '金色に輝くジェット。炎も金色', dia: 120 }],
 ['afterburner', 'アフターバーナー', 'Afterburner', { perf: 1, kind: 'thrust', F: 13000, drain: 0.3, rech: 0.07, col: [1, 0.4, 0.8], desc: '戦闘機のような強烈な噴射', price: 14000000 }],
 ['ionjet', 'イオンスラスター', 'Ion Thruster', { perf: 1, kind: 'thrust', F: 6500, drain: 0.08, rech: 0.06, col: [0.4, 1, 0.9], desc: '弱めだが長時間噴射できる', price: 7000000 }],
 ['saturn', 'サターンロケット', 'Saturn Rocket', { perf: 1, kind: 'thrust', F: 24000, drain: 0.6, rech: 0.04, col: [1, 0.6, 0.2], desc: '約1.5秒の超加速。チャージは長い', price: 18000000 }],
 ['neonjet', 'ネオンジェット', 'Neon Jet', { perf: 1, kind: 'thrust', F: 8500, drain: 0.18, rech: 0.07, col: [1, 0.2, 0.9], desc: 'ピンクの炎のジェット', price: 9000000 }],
 ['twinrocket', 'ツインロケット', 'Twin Rocket', { perf: 1, kind: 'thrust', F: 21000, drain: 0.5, rech: 0.05, col: [1, 0.35, 0.05], twin: 1, desc: 'ロケット2基の爆発的加速', price: 20000000 }],
 ['superhop', 'ハイパージャンプ', 'Hyper Jump', { perf: 1, kind: 'hop', drain: 0.6, rech: 0.15, col: [1, 0.9, 0.3], vy: 11, desc: '高く跳び上がる強化ジャンプ', price: 9000000 }],
 ['doublehop', 'ダブルジャンプ', 'Double Jump', { perf: 1, kind: 'hop', drain: 0.35, rech: 0.2, col: [0.5, 1, 0.6], vy: 6, air2: 1, desc: '空中でもう一度ジャンプできる', price: 11000000 }],
 ['goldchute', 'ゴールドシュート', 'Gold Chute', { perf: 0, kind: 'chute', drain: 0.3, rech: 0.15, col: [1, 0.85, 0.3], desc: '金色のパラシュートで減速', price: 1500000 }],
 ['heartworks', 'ハート花火', 'Heart Fireworks', { perf: 0, kind: 'fireworks', drain: 0.35, rech: 0.25, col: [1, 0.3, 0.6], fwCols: [[1, 0.3, 0.6], [1, 0.6, 0.8]], desc: 'ピンクのハート色の花火', price: 1600000 }],
 ['goldworks', 'ゴールド花火', 'Gold Fireworks', { perf: 0, kind: 'fireworks', drain: 0.35, rech: 0.25, col: [1, 0.85, 0.3], fwCols: [[1, 0.85, 0.3], [1, 1, 0.7]], desc: '金色の豪華な花火', price: 2000000 }],
 ['confetti', '紙吹雪キャノン', 'Confetti Cannon', { perf: 0, kind: 'fireworks', drain: 0.25, rech: 0.3, col: [1, 1, 1], fwCols: [[1, 0.3, 0.3], [0.3, 0.7, 1], [1, 0.9, 0.3], [0.4, 1, 0.5]], low: 1, desc: '車の上から紙吹雪を発射', price: 1300000 }],
 ['blueflame', 'ブルーフレイム', 'Blue Flame Kit', { perf: 0, kind: 'backfire', drain: 0.25, rech: 0.2, col: [0.3, 0.6, 1], desc: 'マフラーから青い炎（見た目だけ）', price: 1200000 }],
 ['greenflame', 'グリーンフレイム', 'Green Flame Kit', { perf: 0, kind: 'backfire', drain: 0.25, rech: 0.2, col: [0.3, 1, 0.4], desc: 'マフラーから緑の炎（見た目だけ）', price: 1200000 }],
 ['trumpet', 'トランペットホーン', 'Trumpet Horn', { perf: 0, kind: 'horn', drain: 0.5, rech: 0.3, col: [1, 1, 1], tune: 1, desc: 'ファンファーレ風のホーン', price: 700000 }],
 ['chime', 'チャイムホーン', 'Chime Horn', { perf: 0, kind: 'horn', drain: 0.5, rech: 0.3, col: [1, 1, 1], tune: 2, desc: 'きらきらしたチャイムの音', price: 700000 }],
 ['redsmoke', 'レッドスモーク', 'Red Smoke', { perf: 0, kind: 'smoke', smokeCol: [1, 0.25, 0.25], desc: 'タイヤスモークが赤色に', price: 600000 }],
 ['bluesmoke', 'ブルースモーク', 'Blue Smoke', { perf: 0, kind: 'smoke', smokeCol: [0.3, 0.55, 1], desc: 'タイヤスモークが青色に', price: 600000 }],
 ['pinksmoke', 'ピンクスモーク', 'Pink Smoke', { perf: 0, kind: 'smoke', smokeCol: [1, 0.45, 0.8], desc: 'タイヤスモークがピンク色に', price: 600000 }],
 ['goldsmoke', 'ゴールドスモーク', 'Gold Smoke', { perf: 0, kind: 'smoke', smokeCol: [1, 0.82, 0.3], desc: 'タイヤスモークが金色に', dia: 60 }],
 ['blacksmoke', 'ブラックスモーク', 'Black Smoke', { perf: 0, kind: 'smoke', smokeCol: [0.12, 0.12, 0.14], desc: 'タイヤスモークが黒色に', price: 600000 }],
 ['snowsmoke', 'スノースモーク', 'Snow Smoke', { perf: 0, kind: 'smoke', smokeCol: [0.85, 0.95, 1], snowflake: 1, desc: '雪の結晶のようなスモーク', price: 800000 }]]
  .forEach(([id, nm, en, o]) => { const e = Object.assign({ id, name: nm, en, price: 0 }, o); EXTRAS.push(e); EXTRA_BY_ID[id] = e; });
// ---- ダイヤショップ限定 ----
addCar(['dm_crystal', 'LEGEND', 'CRYSTAL GT "DIAMOND"', 'ダイヤショップ限定・輝くクリスタルGT', 'FR', 820, 900, 1300, 340, 7, 8200, 1, 92, 96, 92, 0, 'super', 4.6, 1.95, 1.15, '#e8f6ff', 0, 'v12', 2.7, 0.46, { chest: 1 }]);
addCar(['dm_gold', 'LEGEND', 'AURUM ROADSTER "GOLD"', 'ダイヤショップ限定・純金のロードスター', 'FR', 560, 600, 1050, 300, 6, 8800, 1, 94, 98, 86, 0, 'coupe90', 4.3, 1.78, 1.24, '#d4af37', 0, 'i6', 2.5, 0.5, { chest: 1 }]);
const DIA_ITEMS = [];
const addD = (o, dia) => { addItem(Object.assign({ lim: 'diamond' }, o)); DIA_ITEMS.push([o.id, dia]); };
addD({ id: 'car_dm_crystal', type: 'car', name: 'CRYSTAL GT（ダイヤ限定車）', en: 'CRYSTAL GT (Diamond car)', rarity: 'L', car: 'dm_crystal' }, 1200);
addD({ id: 'car_dm_gold', type: 'car', name: 'AURUM ROADSTER（ダイヤ限定車）', en: 'AURUM ROADSTER (Diamond car)', rarity: 'L', car: 'dm_gold' }, 900);
addD({ id: 'pt_dia', type: 'paint', name: 'ダイヤモンドホワイト', en: 'Diamond White', rarity: 'L', color: '#f4fbff', paint: 'diamond' }, 300);
addD({ id: 'pt_gold', type: 'paint', name: '24金ゴールド', en: '24K Gold', rarity: 'L', color: '#e8c050', paint: 'diamond' }, 300);
addD({ id: 'pt_rosegold', type: 'paint', name: 'ローズゴールドクローム', en: 'Rose Gold Chrome', rarity: 'E', color: '#f0b0a0', paint: 'chrome' }, 200);
addD({ id: 'pt_crystal', type: 'paint', name: 'クリスタルブルー', en: 'Crystal Blue', rarity: 'E', color: '#8ad0ff', paint: 'diamond' }, 220);
addD({ id: 'wh_dia', type: 'wheel', name: 'ダイヤモンドカット', en: 'Diamond Cut', rarity: 'L', spokes: 24, deep: 1, rim: '#f0f8ff' }, 250);
addD({ id: 'wh_gold24', type: 'wheel', name: '24金メッシュ', en: '24K Mesh', rarity: 'L', spokes: 16, deep: 1, rim: '#ffd23a' }, 250);
addD({ id: 'ne_dia', type: 'neon', name: 'ダイヤモンドネオン', en: 'Diamond Neon', rarity: 'L', rgb: [0.85, 0.95, 1] }, 150);
addD({ id: 'ne_gold', type: 'neon', name: 'ゴールドネオン', en: 'Gold Neon', rarity: 'E', rgb: [1, 0.8, 0.25] }, 120);
addD({ id: 'cp_dia', type: 'caliper', name: 'ダイヤモンドキャリパー', en: 'Diamond Calipers', rarity: 'L', color: '#e8f6ff' }, 100);
addD({ id: 'pl_dia', type: 'plate', name: '光るナンバー「ダイヤモンド」', en: 'Glowing Plate "Diamond"', rarity: 'L', rgb: [0.9, 0.97, 1], rainbow: true, aurora: true }, 120);
addD({ id: 'dc_dia1', type: 'decal', name: '「DIAMOND」ステッカー', en: '"DIAMOND" sticker', rarity: 'L', kind: 'text', text: 'DIAMOND', bg: '#0a1a2a', fg: '#bfe9ff', font: 'Arial' }, 80);
addD({ id: 'dc_dia2', type: 'decal', name: 'ダイヤモンドマーク', en: 'Diamond mark', rarity: 'L', kind: 'shape', shape: 'diamond', color: '#e8f6ff' }, 80);
addD({ id: 'dc_gold1', type: 'decal', name: '「GOLD」ステッカー', en: '"GOLD" sticker', rarity: 'E', kind: 'text', text: 'GOLD', bg: '#2a1e00', fg: '#ffd700', font: 'Arial' }, 60);
addD({ id: 'mt_dia', type: 'meter', name: 'メーター「ダイヤモンド」', en: 'Meter "Diamond"', rarity: 'L', meter: 'mt_dia' }, 200);
addD({ id: 'mt_gold24', type: 'meter', name: 'メーター「24金」', en: 'Meter "24K"', rarity: 'L', meter: 'mt_gold24' }, 180);
addD({ id: 'bg_diamond', type: 'bg', name: '背景「ダイヤモンドホール」', en: 'Background "Diamond Hall"', rarity: 'L', bg: 'diamond' }, 250);
BG_THEMES.diamond = { name: 'ダイヤモンドホール', floor: [0.5, 0.6, 0.7], wall: [0.3, 0.38, 0.48], strip: [[0.85, 0.95, 1], [1, 0.85, 0.4]], zen: [0.7, 0.8, 0.95], hor: [0.4, 0.5, 0.65], fog: [0.2, 0.25, 0.35], fx: 'star' };
addD({ id: 'kit_gold_wing', type: 'kit', name: '純金GTウイング', en: 'Pure Gold GT Wing', rarity: 'L', slot: 'wing', shape: 6, fin: [1, 0.82, 0.25], chrome: 1 }, 160);
addD({ id: 'kit_dia_wing', type: 'kit', name: 'ダイヤモンドウイング', en: 'Diamond Wing', rarity: 'L', slot: 'wing', shape: 5, fin: [0.9, 0.97, 1], chrome: 1 }, 200);
addD({ id: 'kit_gold_front', type: 'kit', name: '純金フルエアロ', en: 'Pure Gold Full Aero', rarity: 'L', slot: 'front', shape: 4, fin: [1, 0.82, 0.25], chrome: 1 }, 140);
addD({ id: 'kit_gold_side', type: 'kit', name: '純金サイドスカート', en: 'Pure Gold Side Skirts', rarity: 'L', slot: 'side', shape: 3, fin: [1, 0.82, 0.25], chrome: 1 }, 120);
addD({ id: 'kit_gold_hood', type: 'kit', name: '純金ベンテッドボンネット', en: 'Pure Gold Vented Hood', rarity: 'L', slot: 'hood', shape: 3, fin: [1, 0.82, 0.25], chrome: 1 }, 140);
addD({ id: 'kit_dia_trunk', type: 'kit', name: 'ダイヤモンドトランク', en: 'Diamond Trunk', rarity: 'L', slot: 'trunk', shape: 2, fin: [0.9, 0.97, 1], chrome: 1 }, 120);
addD({ id: 'mu_tb8', type: 'music', name: '曲「DIAMOND RUSH」', en: 'Song "DIAMOND RUSH"', rarity: 'L', track: 'tb8' }, 100);
// ダイヤで買えるエキストラ
for (const e of EXTRAS) if (e.dia) DIA_ITEMS.push(['ex_' + e.id, e.dia]);
// 再登録（追加したホイール・デカールを各リストに）
for (const it of ITEMS) { ITEM_BY_ID[it.id] = it; if (it.type === 'wheel' && !WHEEL_STYLES.some(w => w.id === it.id)) WHEEL_STYLES.push({ id: it.id, name: it.name, price: 0, spokes: it.spokes, deep: it.deep, rim: it.rim, chest: 1 }); if (it.type === 'decal' && !DECALS.some(d => d.id === it.id)) DECALS.push({ id: it.id, name: it.name, price: 0, chest: 1 }); }
// 音楽ショップ（お金で購入）
const MUSIC_SHOP = [['mu_tb5', 1500000], ['mu_tb6', 1200000], ['mu_tb7', 1800000]];

// ---- v2.2 新車（架空の名車たち） ----
addCar(['ak_hachi', 'AKATSUKI', 'KIRI TRUENO-86 "PANDA"', '1985 高回転NA・ハッチバックFR', 'FR', 130, 149, 950, 200, 5, 7800, 0, 76, 94, 58, 1500000, 'hatch80', 4.18, 1.63, 1.34, '#151517', 1, 'i4', 2.40, 0.53, null]);
addCar(['hb_fd', 'HIBANA', 'SPIRIT FD-3S', '1997 ロータリーツインターボ', 'FR', 280, 314, 1250, 265, 5, 8000, 1, 88, 90, 78, 3800000, 'fd', 4.29, 1.76, 1.23, '#e8202a', 1, 'rotary', 2.43, 0.5, null]);
addCar(['hb_fc', 'HIBANA', 'SPIRIT FC-3S', '1989 ロータリーターボ', 'FR', 215, 294, 1240, 245, 5, 7800, 1, 80, 88, 68, 2400000, 'coupe80', 4.33, 1.69, 1.27, '#f2f2f2', 1, 'rotary', 2.43, 0.51, null]);
addCar(['hk_onevia', 'HOKUTO', 'SAKURA ONE-EIGHTY', '1994 リトラクタブルFRクーペ', 'FR', 205, 274, 1230, 235, 5, 7400, 1, 74, 92, 64, 1700000, 'coupe90', 4.54, 1.69, 1.29, '#2c2f35', 1, 'i4', 2.47, 0.54, null]);
addCar(['ts_sup', 'TSUBASA', 'ZENITH RZ-80', '1997 直6ツインターボGT', 'FR', 280, 451, 1510, 285, 6, 6800, 1, 80, 82, 82, 4200000, 'gt', 4.52, 1.81, 1.28, '#f0f0f0', 0, 'i6', 2.55, 0.53, null]);
addCar(['hk_r32', 'HOKUTO', 'RAIDEN GT-R32', '1991 直6ターボ・電子制御4WD', '4WD', 280, 353, 1430, 270, 5, 8000, 1, 86, 72, 84, 4500000, 'coupe90', 4.55, 1.76, 1.34, '#3a3d44', 0, 'i6', 2.62, 0.56, null]);
for (const id of ['ak_hachi', 'hb_fd', 'hb_fc', 'hk_onevia', 'ts_sup', 'hk_r32']) { const c = CAR_BY_ID[id]; c.isNew = '2.2'; }
CAR_BY_ID.ak_hachi.panda = 1;
// ---- v2.2 新形状のボディパーツ（仕上げ色つき） ----
const KIT_SLOTS2 = [['wing', 'タイムアタックウイング', 'Time Attack Wing', 14], ['wing', 'ワイドスワンネック', 'Wide Swan-Neck', 17], ['wing', '3段ウイング', 'Triple Wing', 9], ['wing', 'ダックテール', 'Ducktail', 8], ['front', 'タイムアタックスプリッター', 'Time Attack Splitter', 8], ['front', '2段カナード', 'Dual Canards', 7], ['rear', 'GTディフューザー', 'GT Diffuser', 11], ['side', 'GTサイドポッド', 'GT Side Pods', 9], ['hood', '大型エアスクープ', 'Big Air Scoop', 6], ['roof', 'ルーフウイング', 'Roof Wing', 9], ['trunk', 'ビッグダックテール', 'Big Ducktail', 3]];
KIT_SLOTS2.forEach(([slot, nm, en, shape], si) => KIT_FIN.forEach(([fj, fe, col], fi) => { if ((si + fi) % 3) return; addItem({ id: `kit2_${si}_${fi}`, type: 'kit', name: fj + nm, en: fe + ' ' + en, rarity: fi < 2 ? 'E' : RR[(si + fi) % 6], slot, shape, fin: col, chrome: fi < 2 }); }));
addD({ id: 'kit_dia_ta', type: 'kit', name: 'ダイヤモンド・タイムアタックウイング', en: 'Diamond Time Attack Wing', rarity: 'L', slot: 'wing', shape: 14, fin: [0.9, 0.97, 1], chrome: 1 }, 260);
addD({ id: 'kit_gold_swan', type: 'kit', name: '純金ワイドスワンネック', en: 'Pure Gold Wide Swan-Neck', rarity: 'L', slot: 'wing', shape: 17, fin: [1, 0.82, 0.25], chrome: 1 }, 240);
addD({ id: 'kit_dia_split', type: 'kit', name: 'ダイヤモンドスプリッター', en: 'Diamond Splitter', rarity: 'L', slot: 'front', shape: 8, fin: [0.9, 0.97, 1], chrome: 1 }, 180);
addD({ id: 'kit_gold_diff', type: 'kit', name: '純金GTディフューザー', en: 'Pure Gold GT Diffuser', rarity: 'L', slot: 'rear', shape: 11, fin: [1, 0.82, 0.25], chrome: 1 }, 160);
addD({ id: 'kit_dia_pods', type: 'kit', name: 'ダイヤモンドサイドポッド', en: 'Diamond Side Pods', rarity: 'L', slot: 'side', shape: 9, fin: [0.9, 0.97, 1], chrome: 1 }, 160);
addD({ id: 'kit_gold_scoop', type: 'kit', name: '純金エアスクープ', en: 'Pure Gold Air Scoop', rarity: 'L', slot: 'hood', shape: 6, fin: [1, 0.82, 0.25], chrome: 1 }, 140);
