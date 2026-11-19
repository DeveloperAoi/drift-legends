// =====================================================================
// content25.js — v2.5 追加コンテンツ
// ドリフト練習場・ドラッグストリップ／新曲／ストーリー シーズン2・3／実績／コード／ガレージレベル
// =====================================================================

// ---- 新マップ ----
{ // ドラッグストリップ：長い直線 2 本をつないだ周回路（スタートから 402m がゴール）
  const ctrl = [], S = 760, Rr = 70;
  for (let i = 0; i <= 18; i++) ctrl.push([-Rr, 0, -S / 2 + S * i / 18]);
  for (let i = 1; i < 12; i++) { const a = PI - i / 12 * PI; ctrl.push([Math.cos(a) * Rr, 0, S / 2 + Math.sin(a) * Rr]); }
  for (let i = 0; i <= 18; i++) ctrl.push([Rr, 0, S / 2 - S * i / 18]);
  for (let i = 1; i < 12; i++) { const a = -i / 12 * PI; ctrl.push([Math.cos(a) * Rr, 0, -S / 2 + Math.sin(a) * Rr]); }
  MAPS.push({ id: 'dragstrip', name: 'SAKURA DRAG STRIP', jp: 'ドラッグストリップ', cat: 'drag', env: 'circuit', seed: 2525, R: 300, N: 40, ctrl, harm: [[2, 0]], hp: [], H: 0, width: 16, diff: 1, time: 'night', weather: 'clear', desc: '0-400m を一直線に駆け抜けるドラッグレース専用コース。', unlock: null, tunnel: null });
  // ドリフト練習場：広い駐車場＋テクニカルな周回（パイロン付き）
  const dc = [[0, 0, -60], [40, 0, -70], [70, 0, -45], [60, 0, -10], [30, 0, 0], [35, 0, 30], [70, 0, 45], [60, 0, 80], [20, 0, 85], [-15, 0, 65], [-25, 0, 30], [-60, 0, 20], [-80, 0, -15], [-60, 0, -50], [-30, 0, -70]];
  MAPS.push({ id: 'driftpark', name: 'DRIFT PRACTICE PARK', jp: 'ドリフト練習場', cat: 'free', env: 'lot', seed: 2626, R: 80, N: 24, ctrl: dc, harm: [[2, 0]], hp: [], H: 0, width: 14, diff: 1, time: 'day', weather: 'clear', open: 200, drift: true, desc: '定常円・8の字・テクニカルコースがそろう練習用の広場。ぶつけても大丈夫。', unlock: null, tunnel: null });
  for (const m of MAPS.slice(-2)) MAP_BY_ID[m.id] = m;
  RECORD_PACE.circuit = RECORD_PACE.circuit || 32;
}

// ---- 新曲（ストーリー用5曲＋練習・ドラッグ用） ----
TRACKS.push(
  { id: 't14', name: 'SEASON TWO: KANTO SIEGE', bpm: 158, key: 50, minor: 1, seed: 151, prog: [0, 5, 3, 4], cat: 'story' },
  { id: 't15', name: 'CROSSING THE MOUNTAIN LINE', bpm: 154, key: 55, minor: 1, seed: 163, prog: [5, 3, 0, 4], cat: 'story' },
  { id: 't16', name: 'RIVALS OF THE NIGHT CITY', bpm: 162, key: 52, minor: 1, seed: 177, prog: [0, 6, 5, 4], cat: 'story' },
  { id: 't17', name: 'SEASON THREE: NATIONAL ACE', bpm: 160, key: 57, minor: 1, seed: 189, prog: [0, 3, 6, 4], cat: 'story' },
  { id: 't18', name: 'FINAL GATE OF LEGENDS', bpm: 164, key: 48, minor: 1, seed: 199, prog: [0, 5, 6, 4], cat: 'story' },
  { id: 't19', name: 'PRACTICE IN THE SUN', bpm: 128, key: 53, minor: 0, seed: 211, prog: [0, 4, 5, 3], cat: 'menu', chill: 1 },
  { id: 't20', name: 'QUARTER MILE RUSH', bpm: 168, key: 45, minor: 1, seed: 223, prog: [0, 6, 5, 4], cat: 'race' }
);

// ---- ストーリー シーズン2・3 ----
{ const SEASONS = [
    { n: 2, base: 100, title: '関東遠征編', maps: ['momiji', 'kirisame', 'cloop', 'kazan', 'seaside', 'yukimi', 'neon', 'tanada', 'damu', 'baylane', 'hayate', 'tsuzura'],
      rivals: [['真田 ユウ', 'MOMIJI REDS', 'ak_hachi', '#f4f4f4'], ['霧島 アヤ', 'RAIN FOREST', 'ts_integral', '#d01020'], ['神谷 リョウ', 'C-LOOP RUNNERS', 'hk_r32', '#3a3d44'], ['火野 ダイチ', 'VOLCANO HEAT', 'hb_fd', '#e8202a'],
        ['海堂 ミナト', 'SEASIDE WAVE', 'hk_onevia', '#2c2f35'], ['白石 ユキ', 'SNOW QUEENS', 'mk_9', '#f2f2f2'], ['黒田 ネオ', 'NEON GHOSTS', 'ts_sup', '#101012'], ['棚橋 ゴロウ', 'TANADA DOWNHILLERS', 'hb_fc', '#f2f2f2'],
        ['水城 シズク', 'DAM LAKE NIGHT', 'hk_gt2', '#2050c0'], ['速水 レン', 'BAY LANE KINGS', 'hk_gtx', '#7a7f88'], ['疾風 カイト', 'HIGHLAND STORM', 'eu_schwarz', '#ffcf3d'], ['天城 リュウ（覚醒）', '峠の伝説', 'hb_r3', '#f2f2f2']],
      bonus: { 3: { t: 'dia', v: 50 }, 6: { t: 'item', v: 'car_lg_kiri' }, 9: { t: 'chest', v: 'gold' }, 12: { t: 'car', v: 'hb_fd', name: 'SPIRIT FD-3S を手に入れる' } } },
    { n: 3, base: 200, title: '全国制覇編', maps: ['akigiri', 'kuremine', 'harukaze', 'hakoya', 'nanamagari', 'tengu', 'hosomichi', 'kogyo', 'harbor', 'circuit', 'kazan', 'tsuzura'],
      rivals: [['九条 アキラ', 'KYUSHU FLAMES', 'hk_s3', '#ff7a00'], ['北条 マコト', 'HOKKAIDO ICE', 'mk_10', '#1e5aff'], ['西園寺 レイナ', 'KANSAI QUEENS', 'eu_quaranta', '#d01020'], ['剛田 タケシ', 'TURNPIKE TITANS', 'eu_stallion', '#1a1a1a'],
        ['七瀬 カナ', 'AUTUMN SEVEN', 'ts_s2k', '#ffcf3d'], ['鞍馬 テング', 'TENGU CLAN', 'hb_r8', '#8a2be2'], ['影山 シン', 'SHADOW LINE', 'ak_hayates', '#202024'], ['鉄生 ジョウ', 'STEEL PLANT', 'eu_vierring', '#7a7f88'],
        ['港 アンナ', 'HARBOR ANGELS', 'eu_rosso', '#d01020'], ['桜井 ミライ', 'SAKURA RACING', 'eu_veloce', '#f0f0f0'], ['朱雀 レッカ', 'VERMILION BIRD', 'eu_toro', '#7adf20'], ['DRIFT GOD', '???', 'eu_tempesta', '#ffd700']],
      bonus: { 2: { t: 'dia', v: 60 }, 4: { t: 'chest', v: 'gold' }, 6: { t: 'dia', v: 100 }, 8: { t: 'item', v: 'car_lg_raijin' }, 10: { t: 'chest', v: 'legend' }, 12: { t: 'car', v: 'eu_toro', name: 'TORO VELENO V12 を手に入れる' } } }
  ];
  const lines = [
    [['{r}', 'よそ者が{m}を走るって？ 面白い。'], ['{r}', 'ここのコーナーは全部頭に入ってる。ついて来られるか？'], ['あなた', '走れば分かる。']],
    [['{r}', '噂は聞いてるぜ。でもここは{m}だ。'], ['{r}', '一本勝負。負けたら看板は置いていけ。'], ['あなた', 'いいだろう。']],
    [['{r}', 'あなたの走り、映像で全部見たわ。'], ['{r}', '弱点もね。{m}でそれを証明してあげる。'], ['あなた', '……やってみろ。']],
    [['{r}', '{t}のエースとして、ここは譲れない。'], ['{r}', '全開で行くぞ。'], ['あなた', '望むところだ。']]
  ];
  const winL = [['{r}', '……負けた。あんたの走り、本物だな。'], ['{r}', '次の峠のヤツはもっと速いぜ。']], loseL = [['{r}', 'まだ甘い。出直してきな。']];
  const fill = (arr, r, m, t) => arr.map(([w, s]) => [w.replace('{r}', r.split(' ')[1] || r), s.replace('{m}', m).replace('{t}', t)]);
  for (const S of SEASONS) S.rivals.forEach(([name, team, car, color], i) => {
    if (!CAR_BY_ID[car]) car = 'hk_s3';
    const m = MAP_BY_ID[S.maps[i]] || MAP_BY_ID.akigiri, lv = i + 1, boss = lv === 12;
    STORY.push({ id: S.base + lv, season: S.n, lv, title: `S${S.n}-${lv}　${boss ? '最終決戦' : m.jp + 'の' + name.split(' ')[1]}`, map: m.id,
      rival: { name, team, car, color, skill: Math.min(0.97, (S.n === 2 ? 0.8 : 0.88) + i * 0.008) }, reward: (S.n === 2 ? 800000 : 1500000) + i * (S.n === 2 ? 120000 : 220000), xp: (S.n === 2 ? 1200 : 2000) + i * 120, boss,
      bonus: S.bonus[lv] || null, pre: fill(lines[i % lines.length], name, m.jp, team), win: fill(winL, name, m.jp, team), lose: fill(loseL, name, m.jp, team) });
  });
  for (const s of STORY) if (!s.season) { s.season = 1; s.lv = s.id; }
  window.STORY_SEASONS = [{ n: 1, title: '峠デビュー編', en: 'Touge Debut' }, { n: 2, title: '関東遠征編', en: 'Kanto Expedition' }, { n: 3, title: '全国制覇編', en: 'National Conquest' }];
}

// ---- 実績（たくさん） ----
{ const A = (id, cat, name, desc, goal, get, rw) => ({ id, cat, name, desc, goal, get, rw });
  const S = d => d.stats || {};
  const carsOwned = d => d.cars.length, itemsOwned = d => Object.keys(d.inv || {}).filter(k => d.inv[k] > 0).length;
  const toBest = d => Math.max(0, ...Object.values((d.records && d.records.touge) || {}).map(x => typeof x === 'number' ? x : (x && x.score) || 0));
  const storyS = (d, n) => STORY.filter(s => s.season === n && d.story.cleared.includes(s.id)).length;
  const list = [
    A('race1', 'race', 'はじめの一歩', 'レースを1回走る', 1, d => S(d).races, { money: 50000 }),
    A('race10', 'race', '峠の常連', 'レースを10回走る', 10, d => S(d).races, { money: 200000 }),
    A('race50', 'race', '走り込み', 'レースを50回走る', 50, d => S(d).races, { money: 600000, dia: 10 }),
    A('race100', 'race', '百戦錬磨', 'レースを100回走る', 100, d => S(d).races, { money: 1200000, dia: 20 }),
    A('race500', 'race', '走りの求道者', 'レースを500回走る', 500, d => S(d).races, { dia: 100 }),
    A('win10', 'race', '勝ち癖', '10勝する', 10, d => S(d).wins, { money: 400000 }),
    A('win25', 'race', '常勝', '25勝する', 25, d => S(d).wins, { money: 900000, dia: 15 }),
    A('win50', 'race', '負け知らず', '50勝する', 50, d => S(d).wins, { dia: 40 }),
    A('win100', 'race', '百勝の伝説', '100勝する', 100, d => S(d).wins, { dia: 100 }),
    A('drift100', 'drift', 'ドリフト入門', '合計100回ドリフトする', 100, d => S(d).drifts, { money: 150000 }),
    A('drift1000', 'drift', 'ドリフト職人', '合計1,000回ドリフトする', 1000, d => S(d).drifts, { money: 800000, dia: 15 }),
    A('drift5000', 'drift', '横向きの達人', '合計5,000回ドリフトする', 5000, d => S(d).drifts, { dia: 60 }),
    A('touge100k', 'drift', '峠の神', '峠チャレンジで100,000点', 100000, toBest, { dia: 80 }),
    A('practice10', 'drift', '朝練', 'ドリフト練習場で合計10分走る', 600, d => S(d).practiceSec || 0, { money: 300000 }),
    A('practice60', 'drift', '練習の鬼', 'ドリフト練習場で合計60分走る', 3600, d => S(d).practiceSec || 0, { dia: 30 }),
    A('speed200', 'speed', '200の壁', '最高速度200km/h到達', 200, d => S(d).topSpeed || 0, { money: 100000 }),
    A('speed300', 'speed', '300の世界', '最高速度300km/h到達', 300, d => S(d).topSpeed || 0, { dia: 30 }),
    A('drag1', 'drag', 'スタートライン', 'ドラッグレースを1回走る', 1, d => S(d).drags || 0, { money: 100000 }),
    A('dragwin10', 'drag', 'ゼロヨン番長', 'ドラッグレースで10勝', 10, d => S(d).dragWins || 0, { money: 1000000, dia: 20 }),
    A('drag12', 'drag', '12秒の壁', '0-400mを12秒以内で走る', 1, d => (S(d).dragBest && S(d).dragBest <= 12) ? 1 : 0, { money: 500000 }),
    A('drag10', 'drag', '10秒の男', '0-400mを10秒以内で走る', 1, d => (S(d).dragBest && S(d).dragBest <= 10) ? 1 : 0, { dia: 50 }),
    A('story5', 'story', 'ストーリー序盤', 'ストーリーを5話クリア', 5, d => d.story.cleared.length, { money: 300000 }),
    A('storyS2', 'story', '関東制覇', 'シーズン2をすべてクリア', 12, d => storyS(d, 2), { dia: 100 }),
    A('storyS3', 'story', '全国制覇', 'シーズン3をすべてクリア', 12, d => storyS(d, 3), { dia: 200 }),
    A('story30', 'story', '物語の語り部', 'ストーリーを30話クリア', 30, d => d.story.cleared.length, { dia: 50 }),
    A('cars10', 'collect', 'ガレージ拡張', '車を10台所有', 10, carsOwned, { money: 500000 }),
    A('cars20', 'collect', 'カーコレクター', '車を20台所有', 20, carsOwned, { money: 1500000, dia: 20 }),
    A('cars40', 'collect', '博物館', '車を40台所有', 40, carsOwned, { dia: 80 }),
    A('items50', 'collect', '集め始め', 'アイテムを50種類集める', 50, itemsOwned, { money: 300000 }),
    A('items150', 'collect', 'コレクション', 'アイテムを150種類集める', 150, itemsOwned, { dia: 30 }),
    A('items300', 'collect', 'アイテムマスター', 'アイテムを300種類集める', 300, itemsOwned, { dia: 80 }),
    A('items500', 'collect', 'コンプリート目前', 'アイテムを500種類集める', 500, itemsOwned, { dia: 200 }),
    A('glv10', 'collect', 'ガレージLv.10', 'ガレージレベル10', 10, d => garageLevel(d).lv, { money: 500000 }),
    A('glv50', 'collect', 'ガレージLv.50', 'ガレージレベル50', 50, d => garageLevel(d).lv, { dia: 60 }),
    A('glv100', 'collect', 'ガレージLv.100', 'ガレージレベル100', 100, d => garageLevel(d).lv, { dia: 200 }),
    A('rich100m', 'money', '大富豪', '所持金¥100,000,000', 100000000, d => d.money, { dia: 50 }),
    A('dia500', 'money', 'ダイヤの山', 'ダイヤを500個持つ', 500, d => d.diamonds || 0, { money: 2000000 }),
    A('tuner50', 'money', 'メカニック', 'パーツを50個購入', 50, d => S(d).parts, { money: 800000 }),
    A('tuner200', 'money', 'チューニングの鬼', 'パーツを200個購入', 200, d => S(d).parts, { dia: 40 }),
    A('chest10', 'money', '宝探し', 'チェストを10個開ける', 10, d => S(d).chests || 0, { money: 300000 }),
    A('chest100', 'money', 'チェストハンター', 'チェストを100個開ける', 100, d => S(d).chests || 0, { dia: 40 }),
    A('cons1', 'money', 'ひと休み', '消費アイテムを1回使う', 1, d => S(d).consUsed || 0, { money: 100000 }),
    A('cons20', 'money', 'ブースト中毒', '消費アイテムを20回使う', 20, d => S(d).consUsed || 0, { dia: 20 }),
    A('code1', 'money', '合言葉', 'コードを1回使う', 1, d => Object.keys(d.codes || {}).length, { money: 100000 }),
    A('night50', 'race', '真夜中の住人', '夜間に合計50km走行', 50000, d => S(d).nightDist || 0, { dia: 20 }),
    A('play1h', 'race', '1時間プレイ', '合計1時間遊ぶ', 3600, d => S(d).playSec || 0, { money: 200000 }),
    A('play10h', 'race', '10時間プレイ', '合計10時間遊ぶ', 36000, d => S(d).playSec || 0, { dia: 50 }),
    A('friend1', 'social', 'はじめてのフレンド', 'フレンドを1人作る', 1, d => S(d).friends || 0, { dia: 10 }),
    A('friend5', 'social', '仲間たち', 'フレンドを5人作る', 5, d => S(d).friends || 0, { dia: 30 }),
    A('clan1', 'social', 'チーム結成', 'クランに参加する', 1, d => S(d).clanJoined || 0, { dia: 20 }),
    A('chat1', 'social', 'よろしく！', 'クランチャットに書き込む', 1, d => S(d).chats || 0, { money: 100000 }),
    A('trade1', 'social', '初トレード', 'トレードを1回成立させる', 1, d => S(d).trades || 0, { dia: 15 }),
    A('trade10', 'social', '商売上手', 'トレードを10回成立させる', 10, d => S(d).trades || 0, { dia: 50 }),
    A('ftask1', 'social', '協力プレイ', 'フレンドタスクを1つ達成', 1, d => S(d).ftasks || 0, { dia: 20 })
  ];
  for (const a of ACHIEVEMENTS) if (!a.cat) { a.cat = 'classic'; a.rw = a.rw || { money: 200000 }; }
  ACHIEVEMENTS.push(...list);
  window.ACH_CATS = [['race', 'レース'], ['drift', 'ドリフト'], ['speed', 'スピード'], ['drag', 'ドラッグ'], ['story', 'ストーリー'], ['collect', 'コレクション'], ['money', 'お金・アイテム'], ['social', 'ソーシャル'], ['classic', 'クラシック']];
}

// ---- コード（入力すると報酬） ----
// ここにあるコードは誰でも使える。開発者メニューから追加したコードはオンラインで共有される。
const REDEEM_CODES = {
  WELCOME: { money: 500000, dia: 20, note: 'ようこそ DRIFT LEGENDS へ！' },
  DRIFT2026: { money: 1000000, note: 'ドリフト応援コード' },
  TOUGE: { chest: 'silver', note: '峠の贈り物' },
  DIAMOND: { dia: 50, note: 'キラキラのダイヤ' },
  LEGEND: { chest: 'gold', note: '伝説への一歩' },
  NIGHTRUN: { money: 2000000, note: '夜の走り屋へ' },
  BUSDRIVER: { cons: { energy: 3 }, note: 'エナジードリンク×3' },
  XMAS2026: { dia: 30, cons: { cookie: 2 }, until: '2026-12-31', note: 'メリークリスマス！' },
  STORY3: { dia: 40, note: 'シーズン3開幕記念' },
  FRIENDS: { cons: { charm: 1 }, money: 300000, note: '仲間と走ろう' }
};

// ---- ガレージレベル（持っている車で上がる） ----
const GARAGE_MAX = 100;
function carGaragePts(c) { const car = CAR_BY_ID[c.id]; if (!car) return 0; return 100 + Math.min(400, Math.round((car.price || 6000000) / 40000)); }
function garageNeed(lv) { return Math.round(1.2 * lv * lv + 40 * lv); } // その Lv に到達する累計ポイント
function garageLevel(d) {
  const pts = d.cars.reduce((s, c) => s + carGaragePts(c), 0); let lv = 0;
  while (lv < GARAGE_MAX && pts >= garageNeed(lv + 1)) lv++;
  let extra = 0; if (lv >= GARAGE_MAX) { extra = Math.floor((pts - garageNeed(GARAGE_MAX)) / 600); }
  const cur = lv >= GARAGE_MAX ? garageNeed(GARAGE_MAX) + extra * 600 : garageNeed(lv), next = lv >= GARAGE_MAX ? cur + 600 : garageNeed(lv + 1);
  return { pts, lv: lv + extra, base: lv, extra, cur, next };
}
function garageReward(lv) { // Lv ごとの報酬
  if (lv > GARAGE_MAX) return lv % 2 ? { money: 500000, note: 'コイン' } : { randItem: 1, note: 'ランダムなアイテム' };
  if (lv % 25 === 0) return { dia: 50 + lv, chest: 'legend', note: '大報酬' };
  if (lv % 10 === 0) return { dia: 10 + Math.round(lv / 5), chest: 'gold' };
  if (lv % 5 === 0) return { chest: lv >= 50 ? 'gold' : 'silver', money: 100000 * Math.ceil(lv / 10) };
  return { money: 50000 + lv * 15000 };
}

// ---- 車ごとのヘッドライト（純正の形） ----
{ const BYBODY = { coupe80: [3, 1, 7], coupe90: [10, 6, 0], gt: [4, 7, 3], modern: [5, 6, 4], sedan: [7, 3, 0], hatch: [1, 10, 4], hatch80: [3], rotary: [10, 0], rally: [2, 8, 7], super: [10, 4], wedge: [10], fd: [0], roadster: [1, 10], kei: [1] };
  for (const c of CARS) { const L = BYBODY[c.body] || [0]; let h = 0; for (const ch of c.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0; c.hlDef = L[h % L.length]; }
}

// ---- v2.6 オリジナル 4世代 GT シリーズ「HOKUTO 紫電（SHIDEN）」 ----
// 世代ごとに専用のボディ形状・フロントフェイス・ライト・テール・ボンネット・フェンダー・ウイング・ホイールを持つ
addCar(['hk_sd1', 'HOKUTO', 'SHIDEN GTS-X', '1989 直6ツインターボ・4WD（第1世代）', '4WD', 280, 353, 1430, 255, 5, 8000, 1, 84, 74, 82, 4500000, 'gs1', 4.55, 1.755, 1.34, '#2b2d33', 0, 'i6', 2.615, 0.57, null]);
addCar(['hk_sd2', 'HOKUTO', 'SHIDEN GTS-X II', '1995 直6ツインターボ・4WD（第2世代）', '4WD', 280, 368, 1530, 265, 5, 8000, 1, 83, 72, 84, 5500000, 'gs2', 4.675, 1.78, 1.36, '#5a2a8a', 0, 'i6', 2.72, 0.57, null]);
addCar(['hk_sd3', 'HOKUTO', 'SHIDEN GTS-X III', '1999 直6ツインターボ・4WD（第3世代）', '4WD', 280, 392, 1560, 270, 6, 8000, 1, 88, 76, 88, 8000000, 'gs3', 4.6, 1.785, 1.36, '#1e5ad8', 0, 'i6', 2.665, 0.56, null]);
addCar(['hk_sd4', 'HOKUTO', 'SHIDEN GTX-V', '2010 V6ツインターボ・4WD（第4世代）', '4WD', 570, 637, 1740, 315, 6, 7100, 1, 90, 70, 94, 15000000, 'gs4', 4.71, 1.895, 1.37, '#e8e8ea', 0, 'v6', 2.78, 0.55, null]);
[['hk_sd1', 1, 'sd1'], ['hk_sd2', 2, 'sd2'], ['hk_sd3', 3, 'sd3'], ['hk_sd4', 4, 'sd4']].forEach(([id, g, w]) => Object.assign(CAR_BY_ID[id], { series: 'shiden', face: g, stockWheel: w, isNew: '2.6' }));

// ---- v2.6 車ごとのサウンド調整（重点：紫電 III・ロータリー各車） ----
Object.assign(CAR_BY_ID.hk_sd3 || {}, { snd: { hi: 0.24, hiMul: 3, rasp: 0.42, bright: 520, whistle: 1.25, crackle: 0.45 } });
Object.assign(CAR_BY_ID.hk_sd1 || {}, { snd: { rasp: 0.4, bright: 380, whistle: 1.1 } });
Object.assign(CAR_BY_ID.hk_sd2 || {}, { snd: { rasp: 0.38, bright: 420, whistle: 1.15, flutter: 1 } });
Object.assign(CAR_BY_ID.hk_sd4 || {}, { snd: { bright: 600, whistle: 0.9 } });
Object.assign(CAR_BY_ID.hb_fc || {}, { snd: { rasp: 0.9, bright: 800, crackle: 0.75, whistle: 1.0, flutter: 1 } }); // 古いロータリーターボ：荒々しい
Object.assign(CAR_BY_ID.hb_fd || {}, { snd: { rasp: 0.7, bright: 1150, crackle: 0.65, whistle: 1.3, hi: 0.36 } }); // ツインターボ：滑らかで甲高い
Object.assign(CAR_BY_ID.hb_r8 || {}, { snd: { rasp: 0.55, bright: 1400, hi: 0.42, hiMul: 2, crackle: 0.5 } }); // 高回転NAロータリー
for (const id of ['hb_r3', 'hb_r2']) Object.assign(CAR_BY_ID[id] || {}, { snd: { rasp: 0.78, bright: 1000, whistle: 1.15 } });
const MUFFLER_TYPES = [['stock', '純正', 0], ['sport', 'スポーツ', 60000], ['big', '大径', 90000], ['race', '競技用', 150000], ['titanium', 'チタン', 200000]];
