// =====================================================================
// v68.js — v4.9：大型アイテム追加アップデート（パックに入るアイテムを130種類以上追加）
// =====================================================================
{ const A = o => mkItem(Object.assign({ isNew: '4.9' }, o));
  // ペイント（30色）
  [['サクラピンク', 'Sakura Pink', '#ffb0c8', 'pearl', 'C'], ['ミッドナイトブルー', 'Midnight Blue', '#0e1a4a', 'metallic', 'C'], ['フォレストグリーン', 'Forest Green', '#1a4a2a', 'gloss', 'C'], ['サンセットオレンジ', 'Sunset Orange', '#ff6a1a', 'gloss', 'C'], ['スモークグレー', 'Smoke Gray', '#5a5e66', 'matte', 'C'],
    ['ワインレッド', 'Wine Red', '#6a0a1a', 'metallic', 'C'], ['クリームホワイト', 'Cream White', '#f4ecd8', 'gloss', 'C'], ['オリーブマット', 'Olive Matte', '#5a6a2a', 'matte', 'U'], ['ターコイズ', 'Turquoise', '#1ac8c0', 'pearl', 'U'], ['ラベンダーパール', 'Lavender Pearl', '#b8a0ff', 'pearl', 'U'],
    ['マスタード', 'Mustard', '#d8a81a', 'gloss', 'U'], ['ガンメタル', 'Gunmetal', '#3a3c42', 'metallic', 'U'], ['コーラルピンク', 'Coral Pink', '#ff7a7a', 'gloss', 'U'], ['アイスブルー', 'Ice Blue', '#a8e0ff', 'pearl', 'U'], ['ブロンズ', 'Bronze', '#a86a2a', 'metallic', 'R'],
    ['エメラルド', 'Emerald', '#0aa860', 'candy', 'R'], ['アメジスト', 'Amethyst', '#7a2ad8', 'candy', 'R'], ['ルビーキャンディ', 'Ruby Candy', '#c8001a', 'candy', 'R'], ['サファイアキャンディ', 'Sapphire Candy', '#0a3ad8', 'candy', 'R'], ['マットブラック', 'Matte Black', '#141416', 'matte', 'R'],
    ['ローズゴールド', 'Rose Gold', '#e8a088', 'chrome', 'E'], ['ブラッククローム', 'Black Chrome', '#2a2c30', 'chrome', 'E'], ['ネオンライム', 'Neon Lime', '#b8ff1a', 'pearl', 'E'], ['ホログラフィック', 'Holographic', '#c8b8ff', 'diamond', 'E'], ['トワイライト', 'Twilight', '#4a2a7a', 'candy', 'E'],
    ['ブルークローム', 'Blue Chrome', '#3a7aff', 'chrome', 'L'], ['24金', '24K Gold', '#ffcf3d', 'chrome', 'L'], ['ダイヤモンドホワイト', 'Diamond White', '#ffffff', 'diamond', 'L'], ['オーロラフレーク', 'Aurora Flake', '#5ae8c0', 'diamond', 'L'], ['ドラゴンレッド', 'Dragon Red', '#e0102a', 'diamond', 'L']
  ].forEach(([nm, en, color, paint, r], i) => A({ id: 'p49_' + i, type: 'paint', name: 'ペイント「' + nm + '」', en: 'Paint "' + en + '"', rarity: r, color, paint }));
  // アンダーネオン（16色）
  [['ミント', 'Mint', [0.4, 1, 0.75], 'C'], ['ピーチ', 'Peach', [1, 0.6, 0.45], 'C'], ['スカイ', 'Sky', [0.45, 0.8, 1], 'C'], ['レモン', 'Lemon', [1, 0.95, 0.3], 'C'], ['バイオレット', 'Violet', [0.6, 0.3, 1], 'U'], ['ローズ', 'Rose', [1, 0.3, 0.55], 'U'],
    ['アクア', 'Aqua', [0.2, 1, 1], 'U'], ['アンバー', 'Amber', [1, 0.6, 0.1], 'U'], ['ライム', 'Lime', [0.65, 1, 0.15], 'R'], ['マゼンタ', 'Magenta', [1, 0.15, 0.85], 'R'], ['ディープブルー', 'Deep Blue', [0.1, 0.25, 1], 'R'], ['ホワイトアイス', 'White Ice', [0.9, 0.97, 1], 'R'],
    ['サンセット', 'Sunset', [1, 0.4, 0.2], 'E', 1], ['オーシャン', 'Ocean', [0.2, 0.6, 1], 'E', 1], ['ギャラクシー', 'Galaxy', [0.55, 0.3, 1], 'L', 1], ['プリズム', 'Prism', [1, 1, 1], 'L', 1]
  ].forEach(([nm, en, rgb, r, rb], i) => A({ id: 'n49_' + i, type: 'neon', name: nm + 'ネオン', en: en + ' Neon', rarity: r, rgb, rainbow: !!rb }));
  // キャリパー（12色）
  [['ミント', 'Mint', '#5ae8c0', 'C'], ['パープル', 'Purple', '#8a3aff', 'C'], ['ホワイト', 'White', '#f4f4f4', 'C'], ['ピンク', 'Pink', '#ff5aa8', 'U'], ['ライム', 'Lime', '#a8ff1a', 'U'], ['スカイ', 'Sky', '#5ac8ff', 'U'],
    ['ブロンズ', 'Bronze', '#a86a2a', 'R'], ['ガンメタ', 'Gunmetal', '#4a4c52', 'R'], ['ネオンオレンジ', 'Neon Orange', '#ff7a00', 'E'], ['チタン', 'Titanium', '#c8ccd2', 'E'], ['ゴールドライン', 'Gold Line', '#ffcf3d', 'L'], ['カーボンレッド', 'Carbon Red', '#c8001a', 'L']
  ].forEach(([nm, en, color, r], i) => A({ id: 'c49_' + i, type: 'caliper', name: nm + 'キャリパー', en: en + ' Calipers', rarity: r, color }));
  // ホイール（18種）
  [['ストリート7本', 'Street 7-Spoke', 7, 0, '#c8ccd2', 'C'], ['クラシック8本', 'Classic 8-Spoke', 8, 0, '#e8e8e8', 'C'], ['ブラックメッシュ', 'Black Mesh', 14, 0, '#2a2c30', 'C'], ['ホワイトスポーク', 'White Spoke', 6, 0, '#f4f4f4', 'C'], ['ガンメタ10本', 'Gunmetal 10', 10, 0, '#4a4c52', 'U'],
    ['ブロンズ6本', 'Bronze 6', 6, 1, '#a86a2a', 'U'], ['ディープ5本', 'Deep 5', 5, 1, '#c8ccd2', 'U'], ['ツイン12本', 'Twin 12', 12, 0, '#9aa0a8', 'U'], ['レッドリム', 'Red Rim', 10, 1, '#c8001a', 'R'], ['ブルーリム', 'Blue Rim', 8, 1, '#1a5ad0', 'R'],
    ['ゴールドメッシュ', 'Gold Mesh', 16, 1, '#d4af37', 'R'], ['マットブラック', 'Matte Black', 6, 1, '#141416', 'R'], ['フォージド14本', 'Forged 14', 14, 1, '#b8bcc4', 'E'], ['ターボファン', 'Turbo Fan', 18, 0, '#e8ecf2', 'E'], ['ピンクディープ', 'Pink Deep', 8, 1, '#ff5aa8', 'E'],
    ['クロームスター', 'Chrome Star', 5, 1, '#ffffff', 'L'], ['ブラックゴールド', 'Black Gold', 10, 1, '#2a2418', 'L'], ['ネオンスポーク', 'Neon Spoke', 12, 1, '#3af0ff', 'L']
  ].forEach(([nm, en, spokes, deep, rim, r], i) => A({ id: 'w49_' + i, type: 'wheel', name: nm, en, rarity: r, spokes, deep, rim }));
  // 文字ステッカー（22種）
  [['峠最速', 'TOUGE KING', '#111', '#ffcf3d', 'C'], ['DRIFT', 'DRIFT', '#e10600', '#fff', 'C'], ['NO LIMIT', 'NO LIMIT', '#111', '#fff', 'C'], ['FULL BOOST', 'FULL BOOST', '#1a5ad0', '#fff', 'C'], ['走り屋', 'HASHIRIYA', '#fff', '#111', 'C'],
    ['SIDEWAYS', 'SIDEWAYS', '#ff6a1a', '#111', 'C'], ['NIGHT RUN', 'NIGHT RUN', '#0a0a2a', '#9ad0ff', 'U'], ['BOOST ON', 'BOOST ON', '#2adc5a', '#111', 'U'], ['夜桜', 'YOZAKURA', '#ffb0c8', '#6a0a2a', 'U'], ['APEX', 'APEX', '#111', '#e10600', 'U'],
    ['TURBO', 'TURBO', '#c8ccd2', '#111', 'U'], ['RED ZONE', 'RED ZONE', '#c8001a', '#fff', 'R'], ['STREET LEGAL', 'STREET LEGAL', '#2a2c30', '#ffcf3d', 'R'], ['雷神', 'RAIJIN', '#ffd23a', '#2a1a00', 'R'], ['LOW & SLOW', 'LOW & SLOW', '#5a2aff', '#fff', 'R'],
    ['CHAMPION', 'CHAMPION', '#d4af37', '#111', 'E'], ['龍', 'RYU', '#c8102e', '#ffd700', 'E'], ['WORLD TOUR', 'WORLD TOUR', '#0a3a6a', '#fff', 'E'], ['MIDNIGHT', 'MIDNIGHT', '#111', '#c8a8ff', 'E'],
    ['LEGEND', 'LEGEND', '#ffcf3d', '#111', 'L'], ['伝説', 'DENSETSU', '#111', '#ffcf3d', 'L'], ['UNSTOPPABLE', 'UNSTOPPABLE', '#e10600', '#ffd23a', 'L']
  ].forEach(([text, en, bg, fg, r], i) => A({ id: 'd49_' + i, type: 'decal', name: '「' + text + '」ステッカー', en: '"' + en + '" Sticker', rarity: r, kind: 'text', text, bg, fg, font: /[ぁ-んァ-ン一-龥]/.test(text) ? 'serif' : 'Arial' }));
  // 図形ステッカー（14種）
  [['star', 'スター', 'Star', '#ffcf3d', 'C'], ['bolt', 'イナズマ', 'Lightning', '#ffd23a', 'C'], ['heart', 'ハート', 'Heart', '#ff4a8a', 'C'], ['circle', 'ターゲット', 'Target', '#e10600', 'C'], ['checker', 'チェッカー', 'Checker', '#111', 'U'],
    ['flame', 'ブルーフレイム', 'Blue Flame', '#3a8aff', 'U'], ['sakura', '桜', 'Sakura', '#ffb0c8', 'U'], ['paw', '肉球', 'Paw', '#ff9ac8', 'U'], ['wing', 'ウイング', 'Wing', '#c8ccd2', 'R'], ['diamond', 'ダイヤ', 'Diamond', '#5ad1ff', 'R'],
    ['crown', '王冠', 'Crown', '#ffcf3d', 'E'], ['skullx', 'スカル', 'Skull', '#f0ece0', 'E'], ['phoenix', '鳳凰', 'Phoenix', '#ff6a1a', 'L'], ['dragon', '龍の舞', 'Dragon Dance', '#2fbf71', 'L']
  ].forEach(([shape, nm, en, color, r], i) => A({ id: 's49_' + i, type: 'decal', name: 'ステッカー「' + nm + '」', en: 'Sticker "' + en + '"', rarity: r, kind: 'shape', shape, color }));
  // 称号（18種）
  [['峠の新星', 'Touge Rookie', 'C'], ['夜の走り屋', 'Night Runner', 'C'], ['ドリフト見習い', 'Drift Apprentice', 'C'], ['ガレージの住人', 'Garage Dweller', 'C'], ['コレクター', 'Collector', 'U'], ['ニトロ中毒', 'Nitro Addict', 'U'],
    ['ヘアピン職人', 'Hairpin Artisan', 'U'], ['湾岸の狼', 'Bayshore Wolf', 'U'], ['雨の日の達人', 'Rain Master', 'R'], ['雪道の王', 'Snow King', 'R'], ['ゼロカウンター', 'Zero Counter', 'R'], ['パックハンター', 'Pack Hunter', 'R'],
    ['逃走の天才', 'Escape Genius', 'E'], ['チューニングの鬼', 'Tuning Demon', 'E'], ['峠の主', 'Lord of the Pass', 'E'], ['伝説の走り屋', 'Legendary Racer', 'L'], ['ドリフトの神', 'God of Drift', 'L'], ['最速の証', 'Proof of Speed', 'L']
  ].forEach(([title, en, r], i) => A({ id: 't49_' + i, type: 'title', name: '称号「' + title + '」', en: 'Title "' + en + '"', rarity: r, title, titleEn: en, desc: 'プロフィールとメニューに表示される称号' }));
  // ミラーの飾り（16種・飾りパック）
  [['donut', 'ドーナツ', 'Donut', 'C', '<circle cx="24" cy="24" r="18" fill="#d8a060"/><circle cx="24" cy="24" r="17" fill="none" stroke="#ff8ac8" stroke-width="8" stroke-dasharray="70 10"/><circle cx="24" cy="24" r="6" fill="#1a1b20"/>'],
    ['onigiri2', 'おにぎり（梅）', 'Rice Ball (Plum)', 'C', '<path d="M24 6 L42 38 Q42 44 36 44 H12 Q6 44 6 38 Z" fill="#fff" stroke="#ddd" stroke-width="2"/><rect x="14" y="30" width="20" height="14" fill="#1a2a1a"/><circle cx="24" cy="22" r="4" fill="#c8102e"/>'],
    ['cone', 'カラーコーン', 'Traffic Cone', 'C', '<path d="M24 4 L36 40 H12 Z" fill="#ff6a00"/><path d="M19 18 h10 M16 28 h16" stroke="#fff" stroke-width="4"/><rect x="8" y="40" width="32" height="5" fill="#ff6a00"/>'],
    ['sushi', 'おすし', 'Sushi', 'C', '<rect x="8" y="26" width="32" height="14" rx="6" fill="#fff" stroke="#ddd" stroke-width="2"/><path d="M6 26 q18 -16 36 0 q-18 6 -36 0z" fill="#ff7a5a"/><path d="M14 22 l4 4 M22 19 l4 5 M30 19 l4 5" stroke="#fff" stroke-width="1.5"/>'],
    ['ghost', 'おばけ', 'Ghost', 'U', '<path d="M10 44 V22 a14 14 0 0 1 28 0 V44 l-5 -4 -5 4 -4 -4 -5 4 -4 -4z" fill="#f4f4ff" stroke="#ccd" stroke-width="2"/><circle cx="19" cy="22" r="2.5" fill="#222"/><circle cx="29" cy="22" r="2.5" fill="#222"/>'],
    ['rocket2', 'ミニロケット', 'Mini Rocket', 'U', '<path d="M24 4 q12 12 8 30 h-16 q-4 -18 8 -30z" fill="#e8ecf2" stroke="#888" stroke-width="1.5"/><circle cx="24" cy="20" r="4" fill="#3ac8ff"/><path d="M18 34 l6 12 6 -12z" fill="#ff6a1a"/>'],
    ['cactus', 'サボテン', 'Cactus', 'U', '<rect x="20" y="10" width="8" height="30" rx="4" fill="#2fbf71"/><path d="M20 24 h-6 v-8" stroke="#2fbf71" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M28 28 h6 v-10" stroke="#2fbf71" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="14" y="38" width="20" height="8" fill="#c8602a"/>'],
    ['penguin', 'ペンギン', 'Penguin', 'U', '<ellipse cx="24" cy="28" rx="14" ry="17" fill="#1a1b20"/><ellipse cx="24" cy="31" rx="9" ry="12" fill="#fff"/><circle cx="20" cy="18" r="2" fill="#fff"/><circle cx="28" cy="18" r="2" fill="#fff"/><path d="M21 23 h6 l-3 3z" fill="#ffaa00"/>'],
    ['ufo', 'UFO', 'UFO', 'R', '<ellipse cx="24" cy="28" rx="20" ry="7" fill="#9aa0a8"/><path d="M14 26 a10 10 0 0 1 20 0" fill="#9ad0ff"/>' + [12, 20, 28, 36].map(x => `<circle cx="${x}" cy="30" r="2" fill="#ffd23a"/>`).join('')],
    ['trophy2', 'ミニトロフィー', 'Mini Trophy', 'R', '<path d="M14 6 h20 v10 a10 10 0 0 1 -20 0z" fill="#ffcf3d" stroke="#c88a00" stroke-width="2"/><rect x="21" y="26" width="6" height="10" fill="#c88a00"/><rect x="14" y="36" width="20" height="6" fill="#5a3a10"/>'],
    ['gear', 'ギア', 'Gear', 'R', Array.from({ length: 8 }, (_, k) => `<rect x="21" y="4" width="6" height="10" fill="#9aa0a8" transform="rotate(${k * 45} 24 24)"/>`).join('') + '<circle cx="24" cy="24" r="13" fill="#9aa0a8"/><circle cx="24" cy="24" r="5" fill="#2a2c30"/>'],
    ['fuji2', 'ミニ富士', 'Mini Fuji', 'R', '<path d="M4 42 L20 12 L28 12 L44 42z" fill="#3a5aa8"/><path d="M16 20 L20 12 L28 12 L32 20 L27 22 L24 19 L21 22z" fill="#fff"/>'],
    ['cat2', '黒ねこ', 'Black Cat', 'E', '<circle cx="24" cy="28" r="14" fill="#1a1b20"/><path d="M12 20 l2 -12 8 8z M36 20 l-2 -12 -8 8z" fill="#1a1b20"/><circle cx="19" cy="27" r="3" fill="#ffd23a"/><circle cx="29" cy="27" r="3" fill="#ffd23a"/>'],
    ['ruby', 'ルビー', 'Ruby', 'E', '<path d="M24 44 L6 18 L14 8 H34 L42 18Z" fill="#e0102a" stroke="#fff" stroke-width="1.5"/><path d="M6 18 H42 M14 8 L24 44 L34 8" stroke="#ff7a8a" stroke-width="1"/>'],
    ['phoenix2', '火の鳥', 'Firebird', 'L', '<path d="M24 6 q18 10 14 30 q-6 -10 -14 -4 q-8 -6 -14 4 q-4 -20 14 -30z" fill="#ff5a1a" stroke="#ffd23a" stroke-width="2"/><path d="M24 32 v14" stroke="#ffd23a" stroke-width="3"/>'],
    ['crown2', 'ダイヤの王冠', 'Diamond Crown', 'L', '<path d="M6 38 V14 L16 26 L24 8 L32 26 L42 14 V38z" fill="#ffcf3d" stroke="#c88a00" stroke-width="2"/>' + [[16, 32, '#3ac8ff'], [24, 30, '#ff3a6a'], [32, 32, '#3adc7a']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="3" fill="${c}"/>`).join('')]
  ].forEach(([id, nm, en, r, svg]) => { CHARMS.push({ id: 'x49' + id, nm, en, r, svg }); A({ id: 'ch_x49' + id, type: 'charm', charm: 'x49' + id, name: '飾り「' + nm + '」', en: 'Charm "' + en + '"', rarity: r, lim: 1, desc: 'レース中のミラーの下に吊り下げる飾り（メインメニューの「飾り・小物」で変更）' }); });
  for (const it of ITEMS) ITEM_BY_ID[it.id] = it; }
window.__DLX = Object.assign(window.__DLX || {}, { V49N: ITEMS.filter(i => i.isNew === '4.9').length });
