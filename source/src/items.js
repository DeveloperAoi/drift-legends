// =====================================================================
// items.js — チェスト／日替わりショップのアイテム（114種）
// レア度: コモン / アンコモン / レア / エピック / レジェンダリー
// =====================================================================
const RARITY = {
  C: { name: 'コモン', color: '#b0b8c0', dup: 50000, shop: 200000 },
  U: { name: 'アンコモン', color: '#2fdc7a', dup: 150000, shop: 500000 },
  R: { name: 'レア', color: '#3a8cff', dup: 400000, shop: 1200000 },
  E: { name: 'エピック', color: '#b04dff', dup: 1200000, shop: 3000000 },
  L: { name: 'レジェンダリー', color: '#ffb300', dup: 4000000, shop: 9000000 }
};
const RAR_ORDER = ['C', 'U', 'R', 'E', 'L'];
const ITEM_TYPES = { decal: 'デカール', paint: '限定カラー', wheel: 'ホイール', neon: 'アンダーネオン', caliper: 'キャリパー', tune: 'チューニングパーツ', bg: 'ホーム背景', meter: 'スピードメーター', plate: '光るナンバー', kit: 'ボディパーツ', music: '音楽', car: '限定車両' };
const ITEMS = [];
const addItem = (o) => { ITEMS.push(o); return o; };

// ---- デカール 44種 ----
[
  ['TURBO', 'C', '#111', '#ffd400'], ['NOS', 'C', '#1e5aff', '#fff'], ['JDM', 'C', '#fff', '#e10600'], ['RACING', 'C', '#111', '#fff'], ['STREET', 'C', '#333', '#fff'],
  ['SPEED', 'C', '#e10600', '#fff'], ['APEX', 'C', '#fff', '#111'], ['走', 'C', '#fff', '#111', 'serif'], ['峠', 'C', '#111', '#fff', 'serif'], ['夜', 'C', '#0a1a40', '#ffd400', 'serif'],
  ['MIDNIGHT', 'U', '#0a0a20', '#9ad0ff'], ['OVERDRIVE', 'U', '#111', '#ff6a00'], ['REDLINE', 'U', '#fff', '#e10600'], ['COUNTER', 'U', '#222', '#2fdc7a'], ['魂', 'U', '#e10600', '#fff', 'serif'],
  ['疾風', 'U', '#fff', '#1e5aff', 'serif'], ['雷', 'U', '#ffd400', '#111', 'serif'], ['侍', 'U', '#111', '#e10600', 'serif'], ['KAZE RACING', 'U', '#1e5aff', '#fff'], ['HASHIRIYA', 'U', '#111', '#ffd400'],
  ['神風', 'R', '#fff', '#c00018', 'serif'], ['夜叉', 'R', '#111', '#b04dff', 'serif'], ['龍', 'R', '#c00018', '#ffd400', 'serif'], ['DRIFT KING', 'R', '#111', '#ffb300'], ['LEGENDARY', 'R', '#ffb300', '#111'],
  ['忍', 'R', '#111', '#9ad0ff', 'serif'], ['頂', 'E', '#ffb300', '#111', 'serif'], ['天下無双', 'E', '#111', '#ffb300', 'serif'], ['GOD SPEED', 'E', '#b04dff', '#fff'], ['DRIFT LEGEND', 'L', '#111', '#ffb300']
].forEach(([t, r, bg, fg, font], i) => addItem({ id: 'dc_t' + i, type: 'decal', name: '「' + t + '」ステッカー', rarity: r, kind: 'text', text: t, bg, fg, font: font || 'Arial' }));
[
  ['star', '星', 'C', '#ffd400'], ['bolt', 'イナズマ', 'C', '#ffd400'], ['heart', 'ハート', 'C', '#ff4fa0'], ['circle', '日の丸', 'C', '#e10600'], ['flame', 'フレイム', 'U', '#ff6a00'],
  ['sakura', '桜', 'U', '#ffb7d5'], ['wing', 'ウイング', 'U', '#f2f2f2'], ['diamond', 'ダイヤ', 'R', '#9ad0ff'], ['crown', 'クラウン', 'R', '#ffb300'], ['checker', 'チェッカー', 'R', '#111'],
  ['paw', '肉球', 'U', '#f2f2f2'], ['skullx', 'ゴースト', 'E', '#f2f2f2'], ['phoenix', '鳳凰', 'E', '#ff6a00'], ['dragon', '昇り龍', 'L', '#2fdc7a']
].forEach(([sh, nm, r, col], i) => addItem({ id: 'dc_s' + i, type: 'decal', name: nm + 'マーク', rarity: r, kind: 'shape', shape: sh, color: col }));

// ---- 限定カラー 16種 ----
[
  ['ミッドナイトパープル', '#3a1a5a', 'pearl', 'R'], ['ゴールドクローム', '#d4af37', 'chrome', 'L'], ['キャンディアップル', '#b0001a', 'candy', 'R'], ['ライムグリーン', '#9cff2e', 'gloss', 'C'],
  ['サクラピンク', '#ffb7d5', 'pearl', 'U'], ['アイスブルー', '#9ad0ff', 'pearl', 'U'], ['マットブラック', '#151517', 'matte', 'C'], ['ガンメタル', '#4a4f57', 'metallic', 'C'],
  ['オーロラシルバー', '#cfd8e0', 'chrome', 'E'], ['サンセットオレンジ', '#ff7a1a', 'candy', 'U'], ['エメラルド', '#0f7a4a', 'pearl', 'R'], ['ロイヤルブルー', '#1a2a8a', 'candy', 'R'],
  ['パールホワイト', '#f6f6f2', 'pearl', 'C'], ['ブラッドレッド', '#6b0010', 'matte', 'U'], ['ネオンイエロー', '#e8ff00', 'gloss', 'U'], ['ブラッククローム', '#1a1c20', 'chrome', 'E']
].forEach(([nm, c, p, r], i) => addItem({ id: 'pt_' + i, type: 'paint', name: nm, rarity: r, color: c, paint: p }));

// ---- ホイール 10種 ----
[
  ['ゴールドメッシュ', 14, 0, '#d4af37', 'R'], ['ブロンズ6本', 6, 0, '#8c5a2b', 'U'], ['ブラッククロス', 8, 1, '#1a1a1a', 'U'], ['ホワイトレーシング', 6, 0, '#f2f2f2', 'C'], ['レッドスター', 5, 0, '#c00018', 'C'],
  ['チタンブルー', 10, 0, '#3a6aa0', 'R'], ['クロームディープ', 12, 1, '#e0e4ea', 'E'], ['ネオングリーン', 7, 0, '#2fdc7a', 'U'], ['ガンメタ深リム', 9, 1, '#4a4f57', 'C'], ['レジェンドゴールド', 20, 1, '#ffb300', 'L']
].forEach(([nm, sp, deep, rim, r], i) => addItem({ id: 'wh_' + i, type: 'wheel', name: nm, rarity: r, spokes: sp, deep, rim }));

// ---- アンダーネオン 6種 / キャリパー 6種 ----
[['オレンジ', [1, 0.5, 0.05], 'C'], ['シアン', [0.1, 0.9, 1], 'C'], ['ピンク', [1, 0.3, 0.7], 'U'], ['イエロー', [1, 0.9, 0.1], 'U'], ['レインボー', [1, 1, 1], 'E', 1], ['ゴールド', [1, 0.75, 0.2], 'R']]
  .forEach(([nm, rgb, r, rainbow], i) => addItem({ id: 'ne_' + i, type: 'neon', name: nm + 'ネオン', rarity: r, rgb, rainbow: !!rainbow }));
[['ピンク', '#ff4fa0', 'C'], ['オレンジ', '#ff6a00', 'C'], ['グリーン', '#2fdc7a', 'U'], ['パープル', '#b04dff', 'U'], ['ホワイト', '#f4f4f4', 'C'], ['プラチナ', '#e5e4e2', 'R']]
  .forEach(([nm, c, r], i) => addItem({ id: 'cp_' + i, type: 'caliper', name: nm + 'キャリパー', rarity: r, color: c }));

// ---- 限定チューニングパーツ 16種（1台につき1つ装着可能） ----
[
  ['ハイフロー・インジェクター', 'C', { hp: 1.04 }, '出力 +4%'], ['軽量バッテリー', 'C', { mass: -8 }, '重量 -8kg'], ['強化エンジンマウント', 'C', { grip: 1.01, hp: 1.01 }, '出力+1% グリップ+1%'],
  ['ストリートLSDプレート', 'U', { lsd: 0.08 }, 'LSD効き +8%'], ['ビッグスロットル', 'U', { hp: 1.07 }, '出力 +7%'], ['カーボンドア', 'U', { mass: -22 }, '重量 -22kg'],
  ['高効率インタークーラー', 'U', { hp: 1.05, lag: 0.8 }, '出力+5% ターボラグ-20%'], ['ドリフトナックル Pro', 'R', { steer: 1.12, slide: 0.03 }, '切れ角+12% 滑り特性UP'],
  ['チタンエキゾースト', 'R', { hp: 1.08, mass: -10 }, '出力+8% 重量-10kg'], ['セミスリック・コンパウンド', 'R', { grip: 1.06 }, 'グリップ +6%'], ['大容量ニトロシステム', 'R', { nitro: 1.6 }, 'ニトロ持続 +60%'],
  ['レーシングECU "雷"', 'E', { hp: 1.13 }, '出力 +13%'], ['カーボンモノコック', 'E', { mass: -60, grip: 1.02 }, '重量-60kg グリップ+2%'], ['ツインスクロールタービン', 'E', { hp: 1.12, lag: 0.6 }, '出力+12% ラグ-40%'],
  ['レジェンド・ドリフトパッケージ', 'L', { slide: 0.07, lsd: 0.2, steer: 1.15, hp: 1.06 }, 'ドリフト特化（滑り/LSD/切れ角/出力UP）'], ['ゴッドスピード・エンジン', 'L', { hp: 1.25, lag: 0.7 }, '出力 +25%']
].forEach(([nm, r, fx, desc], i) => addItem({ id: 'tn_' + i, type: 'tune', name: nm, rarity: r, fx, desc }));

// ---- ホーム背景 10種 ----
const BG_THEMES = {
  garage: { name: 'ガレージ（標準）', floor: [0.07, 0.07, 0.08], wall: [0.08, 0.08, 0.09], strip: [[0.9, 0.05, 0.03]], zen: [0.55, 0.56, 0.6], hor: [0.28, 0.29, 0.32], fog: [0.02, 0.02, 0.025], fx: 'none' }
};
[
  ['yozakura', '夜桜', 'R', { floor: [0.08, 0.05, 0.08], wall: [0.06, 0.03, 0.07], strip: [[1, 0.5, 0.75]], zen: [0.5, 0.35, 0.5], hor: [0.25, 0.12, 0.25], fog: [0.06, 0.02, 0.06], fx: 'petal', prop: 'sakura' }],
  ['snowfield', '雪原', 'U', { floor: [0.75, 0.78, 0.82], wall: [0.55, 0.6, 0.68], strip: [[0.6, 0.85, 1]], zen: [0.7, 0.75, 0.85], hor: [0.6, 0.65, 0.75], fog: [0.35, 0.4, 0.5], fx: 'snow' }],
  ['neon', 'ネオンシティ', 'R', { floor: [0.04, 0.03, 0.08], wall: [0.03, 0.02, 0.06], strip: [[1, 0.1, 0.6], [0.1, 0.9, 1]], zen: [0.4, 0.2, 0.6], hor: [0.15, 0.05, 0.25], fog: [0.03, 0.01, 0.06], fx: 'none', prop: 'neon' }],
  ['sunset', 'サンセット', 'U', { floor: [0.18, 0.1, 0.08], wall: [0.35, 0.15, 0.1], strip: [[1, 0.55, 0.2]], zen: [0.9, 0.5, 0.3], hor: [0.6, 0.25, 0.15], fog: [0.25, 0.1, 0.06], fx: 'none' }],
  ['space', 'スペース', 'E', { floor: [0.02, 0.02, 0.04], wall: [0.01, 0.01, 0.03], strip: [[0.5, 0.6, 1]], zen: [0.2, 0.25, 0.5], hor: [0.05, 0.05, 0.12], fog: [0.0, 0.0, 0.02], fx: 'star' }],
  ['touge', '峠の夜景', 'C', { floor: [0.06, 0.07, 0.06], wall: [0.04, 0.06, 0.05], strip: [[1, 0.8, 0.3]], zen: [0.3, 0.35, 0.4], hor: [0.1, 0.12, 0.14], fog: [0.02, 0.03, 0.03], fx: 'firefly', prop: 'trees' }],
  ['inferno', 'インフェルノ', 'E', { floor: [0.12, 0.03, 0.02], wall: [0.1, 0.02, 0.01], strip: [[1, 0.3, 0.05]], zen: [0.8, 0.3, 0.1], hor: [0.4, 0.08, 0.02], fog: [0.15, 0.03, 0.01], fx: 'ember' }],
  ['ocean', 'オーシャン', 'U', { floor: [0.04, 0.12, 0.18], wall: [0.03, 0.1, 0.16], strip: [[0.2, 0.8, 1]], zen: [0.3, 0.6, 0.8], hor: [0.1, 0.3, 0.45], fog: [0.02, 0.08, 0.12], fx: 'bubble' }],
  ['gold', 'ゴールデン', 'L', { floor: [0.25, 0.18, 0.05], wall: [0.2, 0.14, 0.04], strip: [[1, 0.8, 0.3]], zen: [1, 0.85, 0.5], hor: [0.6, 0.45, 0.2], fog: [0.2, 0.14, 0.04], fx: 'confetti' }],
  ['autumn', '紅葉', 'C', { floor: [0.12, 0.07, 0.04], wall: [0.1, 0.05, 0.03], strip: [[1, 0.45, 0.1]], zen: [0.7, 0.45, 0.3], hor: [0.35, 0.18, 0.1], fog: [0.1, 0.05, 0.03], fx: 'leaf', prop: 'trees' }]
].forEach(([key, nm, r, th]) => { BG_THEMES[key] = Object.assign({ name: nm }, th); addItem({ id: 'bg_' + key, type: 'bg', name: '背景「' + nm + '」', rarity: r, bg: key }); });

// ---- 限定車両 6種（チェスト限定） ----
addItem({ id: 'car_lg_kiri', type: 'car', name: 'KIRI GT-APEX "LEGEND"', rarity: 'L', car: 'lg_kiri' });
addItem({ id: 'car_lg_raijin', type: 'car', name: 'RAIJIN Mk.IV "GOLD"', rarity: 'E', car: 'lg_raijin' });
addItem({ id: 'car_lg_aurora', type: 'car', name: 'AURORA HYPER X', rarity: 'L', car: 'lg_aurora' });
addItem({ id: 'car_lg_shadow', type: 'car', name: 'SAKURA S-III "SHADOW"', rarity: 'E', car: 'lg_shadow' });
addItem({ id: 'car_lg_oni', type: 'car', name: 'ARASHI "ONI"', rarity: 'R', car: 'lg_oni' });
addItem({ id: 'car_lg_neko', type: 'car', name: 'KOGARASU "NEKO"', rarity: 'R', car: 'lg_neko' });
// 車両データ（CARS へ追加）
CAR_ROWS.push(
  ['lg_kiri', 'LEGEND', 'KIRI GT-APEX "LEGEND"', '伝説仕様のライトウェイトFR', 'FR', 260, 240, 900, 240, 6, 9000, 0, 88, 98, 78, 0, 'coupe80', 4.2, 1.66, 1.31, '#f2f2f2', 1, 'i4', 2.4, 0.52, { chest: 1 }],
  ['lg_raijin', 'LEGEND', 'RAIJIN Mk.IV "GOLD"', '金色の1000馬力GT', 'FR', 720, 860, 1480, 340, 6, 7600, 1, 80, 82, 88, 0, 'gt', 4.52, 1.85, 1.27, '#d4af37', 0, 'i6', 2.55, 0.52, { chest: 1 }],
  ['lg_aurora', 'LEGEND', 'AURORA HYPER X', '未来型ハイパーカー', '4WD', 1100, 1300, 1350, 380, 8, 9500, 1, 96, 70, 98, 0, 'super', 4.7, 2.0, 1.1, '#2fdc7a', 0, 'v12', 2.75, 0.44, { chest: 1 }],
  ['lg_shadow', 'LEGEND', 'SAKURA S-III "SHADOW"', '漆黒のドリフトマシン', 'FR', 450, 520, 1180, 280, 6, 8200, 1, 84, 99, 80, 0, 'coupe90', 4.45, 1.74, 1.26, '#151517', 0, 'i4', 2.52, 0.53, { chest: 1 }],
  ['lg_oni', 'LEGEND', 'ARASHI "ONI"', '鬼のラリーマシン', '4WD', 520, 600, 1300, 290, 6, 8000, 1, 90, 72, 86, 0, 'rally', 4.49, 1.82, 1.43, '#c00018', 0, 'i4', 2.62, 0.58, { chest: 1 }],
  ['lg_santa', 'LEGEND', 'SANTA EXPRESS', 'アドベントカレンダー限定・聖夜のGT', 'FR', 640, 720, 1350, 320, 6, 8000, 1, 86, 94, 84, 0, 'gt', 4.5, 1.84, 1.28, '#c8102e', 0, 'v8', 2.6, 0.52, { chest: 1 }],
  ['lg_neko', 'LEGEND', 'KOGARASU "NEKO"', '猫耳ステッカーの軽MR', 'MR', 160, 190, 780, 200, 6, 9000, 1, 96, 88, 76, 0, 'kei', 3.39, 1.47, 1.18, '#ff4fa0', 0, 'i4', 2.28, 0.45, { chest: 1 }]
);
for (const r of CAR_ROWS.slice(-7)) { const c = { id: r[0], maker: r[1], name: r[2], era: r[3], drive: r[4], hp: r[5], torque: r[6], kg: r[7], top: r[8], gears: r[9], redline: r[10], turbo: !!r[11], handling: r[12], drift: r[13], brake: r[14], price: r[15], body: r[16], L: r[17], W: r[18], H: r[19], color: r[20], popup: !!r[21], sound: r[22], wb: r[23], fb: r[24], unlock: r[25] }; if (!CAR_BY_ID[c.id]) { CARS.push(c); CAR_BY_ID[c.id] = c; } }
MAKERS.LEGEND = { jp: '伝説', color: '#ffb300', desc: 'チェスト限定' };
// ---- スピードメーター（デザインは meters.js） ----
[['mt_classic', 'クラシック', 'U'], ['mt_carbon', 'カーボンレース', 'R'], ['mt_neon', 'ネオンリング', 'R'], ['mt_gold', 'ゴールドクロノ', 'E'], ['mt_sakura', 'サクラ', 'U'], ['mt_legend', 'レジェンドプリズム', 'L'],
 ['mt_lcd', 'グリーンLCD', 'C'], ['mt_bar', 'バーグラフ', 'U'], ['mt_retro', 'レトロ80s', 'R'], ['mt_cyber', 'サイバーパンク', 'E'], ['mt_minimal', 'ミニマル', 'C']]
  .forEach(([id, nm, r]) => addItem({ id, type: 'meter', name: 'メーター「' + nm + '」', rarity: r, meter: id }));
// ---- 光るナンバー（ナンバープレートのネオン） ----
[['ホワイト', [1, 1, 1], 'C'], ['ブルー', [0.2, 0.55, 1], 'U'], ['レッド', [1, 0.12, 0.1], 'U'], ['グリーン', [0.15, 1, 0.4], 'U'], ['パープル', [0.7, 0.25, 1], 'R'], ['ゴールド', [1, 0.78, 0.25], 'R'], ['レインボー', [1, 1, 1], 'E', 1]]
  .forEach(([nm, rgb, r, rb], i) => addItem({ id: 'pl_' + i, type: 'plate', name: '光るナンバー「' + nm + '」', rarity: r, rgb, rainbow: !!rb }));
// ---- アドベントカレンダー限定（チェスト・ショップには出ない） ----
addItem({ id: 'dc_adv1', type: 'decal', name: '「HOLY NIGHT」ステッカー', rarity: 'E', kind: 'text', text: 'HOLY NIGHT', bg: '#0b3d2a', fg: '#ffd76a', font: 'Arial', lim: 'advent' });
addItem({ id: 'dc_adv2', type: 'decal', name: '「聖夜」ステッカー', rarity: 'R', kind: 'text', text: '聖夜', bg: '#b0001a', fg: '#fff', font: 'serif', lim: 'advent' });
addItem({ id: 'pt_adv', type: 'paint', name: 'ホーリーグリーン', rarity: 'R', color: '#0b5d3b', paint: 'pearl', lim: 'advent' });
addItem({ id: 'wh_adv', type: 'wheel', name: 'スノーフレーク・ゴールド', rarity: 'E', spokes: 16, deep: 1, rim: '#f1dfa8', lim: 'advent' });
addItem({ id: 'pl_aurora', type: 'plate', name: '光るナンバー「オーロラ」', rarity: 'E', rgb: [0.4, 1, 0.8], rainbow: true, aurora: true, lim: 'advent' });
addItem({ id: 'mt_snow', type: 'meter', name: 'メーター「スノーデジタル」', rarity: 'E', meter: 'mt_snow', lim: 'advent' });
addItem({ id: 'mt_holy', type: 'meter', name: 'メーター「ホーリーナイト」', rarity: 'L', meter: 'mt_holy', lim: 'advent' });
BG_THEMES.holynight = { name: 'ホーリーナイト', floor: [0.06, 0.08, 0.12], wall: [0.04, 0.05, 0.1], strip: [[1, 0.15, 0.15], [0.15, 0.9, 0.35]], zen: [0.18, 0.22, 0.42], hor: [0.08, 0.1, 0.2], fog: [0.03, 0.04, 0.08], fx: 'snow', prop: 'trees', pine: 1 };
addItem({ id: 'bg_holynight', type: 'bg', name: '背景「ホーリーナイト」', rarity: 'L', bg: 'holynight', lim: 'advent' });
addItem({ id: 'car_lg_santa', type: 'car', name: 'SANTA EXPRESS（限定車）', rarity: 'L', car: 'lg_santa', lim: 'advent' });
// ---- ランキング上位の限定報酬（チェスト・ショップには出ない） ----
addItem({ id: 'dc_champ', type: 'decal', name: '「CHAMPION」ステッカー', rarity: 'L', kind: 'text', text: 'CHAMPION', bg: '#111', fg: '#ffd700', font: 'Arial', lim: 'rank' });
addItem({ id: 'mt_champ', type: 'meter', name: 'メーター「チャンピオン」', rarity: 'L', meter: 'mt_champ', lim: 'rank' });
addItem({ id: 'pl_champ', type: 'plate', name: '光るナンバー「チャンピオンゴールド」', rarity: 'L', rgb: [1, 0.84, 0.2], lim: 'rank' });
addItem({ id: 'wh_champ', type: 'wheel', name: 'チャンピオンゴールド', rarity: 'L', spokes: 18, deep: 1, rim: '#ffd700', lim: 'rank' });
addItem({ id: 'dc_rank2', type: 'decal', name: '「RUNNER-UP」ステッカー', rarity: 'E', kind: 'text', text: 'RUNNER-UP', bg: '#2a2c30', fg: '#e6e8ec', font: 'Arial', lim: 'rank' });
addItem({ id: 'pt_rank2', type: 'paint', name: 'シルバーメダリスト', rarity: 'E', color: '#c8ccd4', paint: 'chrome', lim: 'rank' });
addItem({ id: 'dc_rank3', type: 'decal', name: '「PODIUM」ステッカー', rarity: 'R', kind: 'text', text: 'PODIUM', bg: '#3a1e08', fg: '#e8a060', font: 'Arial', lim: 'rank' });
addItem({ id: 'pt_rank3', type: 'paint', name: 'ブロンズメダリスト', rarity: 'R', color: '#b87333', paint: 'metallic', lim: 'rank' });
const RANK_POOLS = { 1: ['dc_champ', 'mt_champ', 'pl_champ', 'wh_champ'], 2: ['dc_rank2', 'pt_rank2'], 3: ['dc_rank3', 'pt_rank3'] };
const ITEM_BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));
// チェスト限定ホイールを WHEEL_STYLES に登録
for (const it of ITEMS.filter(i => i.type === 'wheel')) WHEEL_STYLES.push({ id: it.id, name: it.name, price: 0, spokes: it.spokes, deep: it.deep, rim: it.rim, chest: 1 });
// チェスト限定デカールを DECALS に登録
for (const it of ITEMS.filter(i => i.type === 'decal')) DECALS.push({ id: it.id, name: it.name, price: 0, chest: 1 });

// ---- チェスト ----
const CHESTS = [
  { id: 'free', name: 'デイリーチェスト', price: 0, daily: 1, odds: { C: 70, U: 22, R: 7, E: 1, L: 0 }, color: '#2fdc7a' },
  { id: 'bronze', name: 'ブロンズチェスト', price: 300000, odds: { C: 60, U: 28, R: 10, E: 2, L: 0 }, color: '#c07a3a' },
  { id: 'silver', name: 'シルバーチェスト', price: 900000, odds: { C: 35, U: 35, R: 22, E: 7, L: 1 }, color: '#c8ccd4' },
  { id: 'gold', name: 'ゴールドチェスト', price: 2500000, odds: { C: 0, U: 30, R: 45, E: 20, L: 5 }, color: '#ffc83d' },
  { id: 'legend', name: 'レジェンドチェスト', price: 8000000, odds: { C: 0, U: 0, R: 50, E: 38, L: 12 }, color: '#b04dff' }
];
function rollChest(chest, rnd = Math.random) {
  let x = rnd() * 100, rar = 'C';
  for (const r of RAR_ORDER) { const p = chest.odds[r] || 0; if (x < p) { rar = r; break; } x -= p; }
  const pool = ITEMS.filter(i => i.rarity === rar && !i.lim); return pool[Math.floor(rnd() * pool.length)];
}
// 日替わりショップ（日本時間の日付で毎日更新）
function jstDateKey(d = new Date()) { const j = new Date(d.getTime() + 9 * 3600000); return j.toISOString().slice(0, 10); }
function dailyShop(key = jstDateKey()) {
  let h = 0; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) | 0; const rnd = mulberry32(h);
  const picks = []; const want = ['L', 'E', 'R', 'R', 'U', 'C']; const used = new Set();
  for (const r of want) { const pool = ITEMS.filter(i => (i.rarity === r || (r === 'L' && rnd() < 0.5 && i.rarity === 'E')) && !used.has(i.id) && !i.lim); const it = pool[Math.floor(rnd() * pool.length)]; if (it) { used.add(it.id); picks.push(it); } }
  return picks;
}

// ---- アドベントカレンダー（12/1〜12/25） ----
const ADVENT = [
  null,
  { t: 'money', v: 300000 }, { t: 'chest', v: 'bronze' }, { t: 'pts', v: 500 }, { t: 'item', v: 'dc_adv2' }, { t: 'money', v: 500000 },
  { t: 'chest', v: 'silver' }, { t: 'item', v: 'mt_snow' }, { t: 'pts', v: 800 }, { t: 'money', v: 800000 }, { t: 'item', v: 'pl_aurora' },
  { t: 'chest', v: 'gold' }, { t: 'item', v: 'pt_adv' }, { t: 'pts', v: 1200 }, { t: 'item', v: 'wh_adv' }, { t: 'money', v: 1000000 },
  { t: 'chest', v: 'silver' }, { t: 'item', v: 'bg_holynight' }, { t: 'pts', v: 1500 }, { t: 'item', v: 'dc_adv1' }, { t: 'chest', v: 'gold' },
  { t: 'money', v: 2000000 }, { t: 'item', v: 'mt_holy' }, { t: 'pts', v: 2500 }, { t: 'chest', v: 'legend' }, { t: 'item', v: 'car_lg_santa', bonus: 3000000 }
];
