// =====================================================================
// data.js — 車両・マップ・パーツ・ストーリー・音楽データ
// 新しい車やマップは配列に1行追加するだけで増やせます。
// 実在メーカー・車名は使用せず、すべてオリジナル名です（各車は時代・クラスのイメージのみ参考）。
// =====================================================================
const MAKERS = {
  AKATSUKI: { jp: '暁', color: '#e10600', desc: 'FRスポーツの名門' },
  HOKUTO: { jp: '北斗', color: '#c8c8d0', desc: 'ターボと4WD技術' },
  TSUBASA: { jp: '翼', color: '#ff2a2a', desc: '高回転NAエンジン' },
  HIBANA: { jp: '火花', color: '#ff7a00', desc: 'ロータリーの魂' },
  MIKAZUKI: { jp: '三日月', color: '#d0d0d0', desc: 'ラリー直系4WD' },
  SEIUN: { jp: '星雲', color: '#2a6cff', desc: '水平対向エンジン' },
  EUROPA: { jp: '欧州', color: '#ffd400', desc: '欧州スーパーカー' },
  EVENT: { jp: '限定', color: '#2fbf71', desc: 'イベント限定' }
};
// 列: id, maker, name, era, drive, hp, torque(Nm), kg, top(km/h), gears, redline, turbo, handling, drift, brake, price, body, L, W, H, color, popup, engineSound, wheelbase, frontBias, unlock
const CAR_ROWS = [
  ['ak_kiri', 'AKATSUKI', 'KIRI GT-APEX', '1983 ライトウェイトFR', 'FR', 130, 149, 940, 195, 5, 7600, 0, 70, 88, 55, 1200000, 'coupe80', 4.2, 1.63, 1.33, '#f2f2f2', 1, 'i4', 2.40, 0.53, null],
  ['ak_hayate', 'AKATSUKI', 'HAYATE RS', '2021 FRクーペ', 'FR', 235, 250, 1270, 226, 6, 7500, 0, 82, 80, 75, 3300000, 'modern', 4.26, 1.78, 1.31, '#d01020', 0, 'flat4', 2.57, 0.53, null],
  ['ak_raijin4', 'AKATSUKI', 'RAIJIN Mk.IV', '1993 ツインターボGT', 'FR', 330, 431, 1510, 285, 6, 6800, 1, 72, 74, 78, 5500000, 'gt', 4.52, 1.81, 1.28, '#f07800', 0, 'i6', 2.55, 0.53, { level: 3 }],
  ['ak_raijin5', 'AKATSUKI', 'RAIJIN Mk.V', '2019 FRスポーツGT', 'FR', 387, 500, 1520, 290, 8, 7000, 1, 84, 72, 85, 7800000, 'modern', 4.38, 1.85, 1.29, '#ffd000', 0, 'i6', 2.47, 0.52, { level: 5 }],
  ['ak_hayates', 'AKATSUKI', 'HAYATE S', '2012 FRクーペ', 'FR', 200, 205, 1240, 226, 6, 7400, 0, 78, 84, 70, 2500000, 'modern', 4.24, 1.78, 1.29, '#1a1a1a', 0, 'flat4', 2.57, 0.53, null],
  ['ak_kasumi5', 'AKATSUKI', 'KASUMI TOURER V', '1998 ターボセダン', 'FR', 280, 378, 1490, 250, 5, 7000, 1, 66, 86, 66, 2800000, 'sedan', 4.8, 1.75, 1.39, '#e8e8ee', 0, 'i6', 2.73, 0.54, null],
  ['ak_kasumi2', 'AKATSUKI', 'KASUMI II GRANDE', '1996 FRセダン', 'FR', 280, 378, 1470, 245, 5, 7000, 1, 64, 84, 64, 2400000, 'sedan', 4.76, 1.75, 1.39, '#3a3a44', 0, 'i6', 2.73, 0.54, null],
  ['ak_altair', 'AKATSUKI', 'ALTAIR RS200', '1999 コンパクトFR', 'FR', 210, 216, 1350, 225, 6, 8000, 0, 74, 74, 68, 1900000, 'sedan', 4.4, 1.72, 1.41, '#2050c0', 0, 'i4', 2.67, 0.53, null],
  ['hk_gt1', 'HOKUTO', 'RYUSEI GT-4 Mk.I', '1989 4WDターボ', '4WD', 280, 353, 1430, 260, 5, 8000, 1, 80, 58, 74, 4200000, 'gt', 4.55, 1.76, 1.34, '#5a5f6a', 0, 'i6', 2.62, 0.58, { story: 3 }],
  ['hk_gt2', 'HOKUTO', 'RYUSEI GT-4 Mk.II', '1995 4WDターボ', '4WD', 280, 368, 1530, 265, 5, 8000, 1, 79, 56, 75, 4500000, 'gt', 4.68, 1.78, 1.34, '#7a1a8a', 0, 'i6', 2.72, 0.58, { story: 3 }],
  ['hk_gt3', 'HOKUTO', 'RYUSEI GT-4 Mk.III', '1999 4WDターボ', '4WD', 280, 392, 1560, 270, 6, 8000, 1, 84, 58, 80, 8900000, 'gt', 4.6, 1.78, 1.36, '#1e5aff', 0, 'i6', 2.67, 0.57, { level: 4 }],
  ['hk_gtx', 'HOKUTO', 'RYUSEI GT-X', '2017 スーパーGT', '4WD', 570, 637, 1760, 315, 6, 7100, 1, 88, 50, 92, 14500000, 'modern', 4.71, 1.9, 1.37, '#d8d8de', 0, 'v6', 2.78, 0.54, { level: 6 }],
  ['hk_s1', 'HOKUTO', 'SAKURA S-I', '1988 FRターボ', 'FR', 205, 274, 1170, 230, 5, 7500, 1, 72, 90, 62, 1600000, 'coupe90', 4.47, 1.69, 1.29, '#b0b8c0', 0, 'i4', 2.47, 0.54, null],
  ['hk_s2', 'HOKUTO', 'SAKURA S-II', '1995 FRターボ', 'FR', 220, 275, 1240, 235, 5, 7500, 1, 74, 90, 66, 1900000, 'coupe90', 4.5, 1.73, 1.29, '#2a8a5a', 0, 'i4', 2.52, 0.54, null],
  ['hk_s3', 'HOKUTO', 'SAKURA S-III', '1999 FRターボ', 'FR', 250, 275, 1250, 245, 6, 7500, 1, 78, 92, 70, 2600000, 'coupe90', 4.45, 1.69, 1.28, '#ffd000', 0, 'i4', 2.52, 0.54, null],
  ['hk_zephyr', 'HOKUTO', 'ZEPHYR Z', '2008 FRスポーツ', 'FR', 336, 365, 1500, 250, 6, 7500, 0, 80, 78, 76, 4000000, 'gt', 4.26, 1.85, 1.32, '#c01818', 0, 'v6', 2.55, 0.54, { level: 2 }],
  ['hk_180', 'HOKUTO', 'ONE-EIGHTY', '1991 FRハッチ', 'FR', 205, 274, 1220, 230, 5, 7500, 1, 72, 90, 62, 1500000, 'coupe90', 4.54, 1.69, 1.29, '#f0f0f0', 1, 'i4', 2.47, 0.54, null],
  ['ts_kazami', 'TSUBASA', 'KAZAMI TYPE-Z', '2020 FFホットハッチ', 'FF', 320, 400, 1430, 272, 6, 7000, 1, 86, 40, 82, 5000000, 'hatch', 4.56, 1.88, 1.43, '#f4f4f4', 0, 'i4', 2.7, 0.62, { level: 3 }],
  ['ts_nx1', 'TSUBASA', 'NX-1', '1990 ミッドシップ', 'MR', 280, 294, 1350, 270, 6, 8000, 0, 90, 66, 84, 9800000, 'super', 4.43, 1.81, 1.17, '#c00000', 0, 'v6', 2.53, 0.42, { story: 7 }],
  ['ts_s2k', 'TSUBASA', 'S-2K', '1999 FRロードスター', 'FR', 250, 218, 1250, 240, 6, 9000, 0, 88, 82, 78, 3600000, 'roadster', 4.14, 1.75, 1.29, '#ffffff', 0, 'i4', 2.4, 0.5, { story: 4 }],
  ['ts_integral', 'TSUBASA', 'INTEGRAL Z', '1998 FFクーペ', 'FF', 200, 196, 1100, 230, 5, 8400, 0, 82, 42, 72, 1800000, 'coupe90', 4.38, 1.7, 1.33, '#e8e8e8', 0, 'i4', 2.57, 0.61, null],
  ['hb_r3', 'HIBANA', 'SPIRIT R-3', '1992 ロータリーターボ', 'FR', 280, 314, 1280, 260, 5, 8000, 1, 86, 88, 76, 4800000, 'rotary', 4.29, 1.76, 1.23, '#f2f2f2', 1, 'rotary', 2.43, 0.5, { story: 9 }],
  ['hb_r2', 'HIBANA', 'SPIRIT R-2', '1986 ロータリーターボ', 'FR', 215, 294, 1230, 240, 5, 7500, 1, 78, 86, 66, 2200000, 'coupe80', 4.33, 1.69, 1.27, '#f2f2f2', 1, 'rotary', 2.43, 0.51, { story: 2 }],
  ['hb_r8', 'HIBANA', 'SPIRIT R-8', '2008 ロータリーNA', 'FR', 250, 216, 1310, 245, 6, 9000, 0, 84, 82, 74, 2700000, 'modern', 4.47, 1.77, 1.34, '#3070ff', 0, 'rotary', 2.7, 0.5, null],
  ['hb_kaze', 'HIBANA', 'KAZE ROADSTER', '2016 ライトウェイト', 'FR', 135, 152, 1010, 205, 6, 7500, 0, 86, 86, 66, 2100000, 'roadster', 3.92, 1.73, 1.23, '#a00018', 0, 'i4', 2.31, 0.5, null],
  ['mk_6', 'MIKAZUKI', 'ARASHI VI', '1999 ラリー4WD', '4WD', 280, 373, 1360, 250, 5, 7500, 1, 82, 60, 76, 3400000, 'rally', 4.35, 1.77, 1.41, '#e8e8e8', 0, 'i4', 2.51, 0.6, { level: 2 }],
  ['mk_9', 'MIKAZUKI', 'ARASHI IX', '2005 ラリー4WD', '4WD', 280, 400, 1400, 255, 6, 7500, 1, 85, 62, 80, 4300000, 'rally', 4.49, 1.77, 1.45, '#1c3fa0', 0, 'i4', 2.62, 0.6, { story: 5 }],
  ['mk_10', 'MIKAZUKI', 'ARASHI X', '2008 ラリー4WD', '4WD', 300, 422, 1520, 255, 6, 7000, 1, 85, 58, 82, 4800000, 'rally', 4.5, 1.81, 1.48, '#d00000', 0, 'i4', 2.65, 0.6, { level: 4 }],
  ['se_tempest', 'SEIUN', 'TEMPEST STX', '2007 ラリー4WD', '4WD', 308, 422, 1480, 255, 6, 8000, 1, 84, 62, 80, 4600000, 'rally', 4.42, 1.8, 1.47, '#1838c0', 0, 'flat4', 2.62, 0.59, { level: 3 }],
  ['se_breeze', 'SEIUN', 'BREEZE', '2021 FRクーペ', 'FR', 235, 250, 1270, 226, 6, 7500, 0, 82, 80, 75, 3300000, 'modern', 4.26, 1.78, 1.31, '#3a6fd8', 0, 'flat4', 2.57, 0.53, null],
  ['eu_furioso', 'EUROPA', 'TORO FURIOSO V10', '2016 V10スーパーカー', '4WD', 640, 600, 1420, 325, 7, 8500, 0, 90, 60, 92, 32000000, 'super', 4.46, 1.93, 1.17, '#7fd400', 0, 'v10', 2.62, 0.43, { level: 8 }],
  ['eu_tempesta', 'EUROPA', 'TORO TEMPESTA V12', '2017 V12ハイパー', '4WD', 770, 720, 1575, 350, 7, 8700, 0, 88, 55, 92, 52000000, 'super', 4.8, 2.03, 1.14, '#ff8c00', 0, 'v12', 2.7, 0.43, { level: 10 }],
  ['eu_rosso', 'EUROPA', 'CAVALLO ROSSO 4.8T', '2016 ミッドシップV8', 'MR', 670, 760, 1475, 330, 7, 8000, 1, 92, 72, 94, 35000000, 'super', 4.57, 1.95, 1.21, '#d00010', 0, 'v8', 2.65, 0.42, { level: 8 }],
  ['eu_quaranta', 'EUROPA', 'CAVALLO QUARANTA', '1988 伝説のV8ターボ', 'MR', 478, 577, 1100, 324, 5, 7800, 1, 82, 80, 80, 48000000, 'super', 4.36, 1.97, 1.12, '#d00010', 1, 'v8', 2.45, 0.42, { level: 9 }],
  ['eu_schwarz', 'EUROPA', 'SCHWARZ 9 RS', '2018 RRスポーツ', 'RR', 510, 470, 1430, 318, 7, 9000, 0, 94, 70, 95, 24000000, 'modern', 4.56, 1.85, 1.27, '#f2f2f2', 0, 'flat6', 2.45, 0.39, { level: 7 }],
  ['eu_bavaria', 'EUROPA', 'BAVARIA M-SPORT 3', '2021 スポーツセダン', 'FR', 480, 550, 1730, 290, 8, 7200, 1, 82, 82, 84, 13000000, 'sedan', 4.79, 1.9, 1.43, '#2a8ad0', 0, 'i6', 2.86, 0.53, { level: 5 }],
  ['eu_stern', 'EUROPA', 'STERNWERK GT V8', '2017 FR GT', 'FR', 585, 700, 1630, 318, 7, 7000, 1, 86, 80, 88, 22000000, 'gt', 4.55, 1.94, 1.26, '#a8b0b8', 0, 'v8', 2.63, 0.47, { level: 7 }],
  ['eu_vierring', 'EUROPA', 'VIERRING V10 PLUS', '2016 V10ミッドシップ', '4WD', 620, 580, 1595, 330, 7, 8500, 0, 90, 58, 90, 28000000, 'super', 4.43, 1.94, 1.24, '#202020', 0, 'v10', 2.65, 0.43, { level: 8 }],
  ['eu_veloce', 'EUROPA', 'LIGHTSPEED VELOCE 7', '2018 カーボンスーパーカー', 'MR', 720, 770, 1420, 341, 7, 8500, 1, 93, 70, 95, 40000000, 'super', 4.54, 1.93, 1.2, '#ff6a00', 0, 'v8', 2.67, 0.42, { level: 9 }],
  ['ak_mr2', 'AKATSUKI', 'MR-TWO GT', '1993 ミッドシップターボ', 'MR', 245, 304, 1270, 245, 5, 7000, 1, 86, 74, 72, 2600000, 'super', 4.17, 1.7, 1.24, '#d01020', 1, 'i4', 2.4, 0.43, null],
  ['ak_celeste', 'AKATSUKI', 'CELESTE GT-FOUR', '1994 ラリーホモロゲ4WD', '4WD', 255, 304, 1380, 240, 5, 7000, 1, 82, 60, 74, 2900000, 'rally', 4.42, 1.75, 1.3, '#f2f2f2', 0, 'i4', 2.54, 0.6, { level: 2 }],
  ['hk_gts', 'HOKUTO', 'RYUSEI GTS-T', '1990 FRターボクーペ', 'FR', 215, 265, 1310, 240, 5, 7500, 1, 76, 88, 66, 1800000, 'gt', 4.53, 1.7, 1.34, '#1a1a1a', 0, 'i6', 2.62, 0.55, null],
  ['hk_laurel', 'HOKUTO', 'LAUREL CLUB-S', '1993 FRターボセダン', 'FR', 235, 274, 1450, 235, 5, 7000, 1, 68, 88, 64, 1700000, 'sedan', 4.72, 1.72, 1.39, '#5a5f6a', 0, 'i6', 2.67, 0.55, null],
  ['hk_sefia', 'HOKUTO', 'SEFIA A-31', '1990 FRセダン', 'FR', 205, 265, 1360, 225, 5, 7000, 1, 70, 90, 62, 1400000, 'sedan', 4.58, 1.7, 1.37, '#e8e8ee', 0, 'i6', 2.67, 0.55, null],
  ['ts_beat', 'TSUBASA', 'BEAT-K', '1991 軽ミッドシップ', 'MR', 64, 61, 760, 140, 5, 8500, 0, 92, 70, 60, 800000, 'roadster', 3.3, 1.4, 1.17, '#ffd000', 0, 'i4', 2.28, 0.43, null],
  ['ts_prelu', 'TSUBASA', 'PRELUDE SiR-Z', '1997 FFスペシャリティ', 'FF', 220, 221, 1270, 235, 5, 7800, 0, 84, 45, 72, 1600000, 'coupe90', 4.52, 1.75, 1.32, '#2050c0', 0, 'i4', 2.59, 0.62, null],
  ['hb_cosmos', 'HIBANA', 'COSMOS 20B', '1990 3ローターGT', 'FR', 300, 402, 1640, 255, 4, 7000, 1, 70, 76, 70, 3800000, 'gt', 4.81, 1.8, 1.31, '#3a3a44', 1, 'rotary', 2.75, 0.52, { level: 3 }],
  ['mk_gto', 'MIKAZUKI', 'GTR-3000 VR4', '1991 ツインターボ4WD', '4WD', 280, 427, 1700, 255, 5, 7000, 1, 76, 52, 80, 3200000, 'gt', 4.56, 1.84, 1.29, '#c01818', 1, 'v6', 2.47, 0.6, { level: 3 }],
  ['se_legend', 'SEIUN', 'LEGEND GT-B', '1999 ツインターボ4WD', '4WD', 280, 343, 1450, 245, 5, 7000, 1, 80, 58, 74, 2400000, 'sedan', 4.6, 1.7, 1.39, '#1838c0', 0, 'flat4', 2.65, 0.59, null],
  ['eu_schwarzc', 'EUROPA', 'SCHWARZ 9 TURBO CLASSIC', '1988 RRターボ', 'RR', 300, 432, 1335, 260, 4, 6800, 1, 76, 82, 76, 12000000, 'gt', 4.29, 1.78, 1.31, '#f2f2f2', 0, 'flat6', 2.27, 0.39, { level: 5 }],
  ['eu_bavc', 'EUROPA', 'BAVARIA M-SPORT 3 CLASSIC', '1988 FRホモロゲセダン', 'FR', 200, 230, 1200, 235, 5, 7250, 0, 86, 84, 70, 6500000, 'sedan', 4.35, 1.68, 1.37, '#f2f2f2', 0, 'i4', 2.56, 0.5, { level: 4 }],
  ['eu_delta', 'EUROPA', 'TORINO DELTA EVO', '1992 ラリーハッチ4WD', '4WD', 210, 300, 1340, 220, 5, 6500, 1, 84, 62, 72, 5800000, 'hatch', 3.9, 1.77, 1.37, '#c01818', 0, 'i4', 2.48, 0.6, { level: 4 }],
  ['eu_stallion', 'EUROPA', 'STALLION GT 5.0', '2018 アメリカンV8', 'FR', 460, 569, 1720, 270, 6, 7500, 0, 74, 88, 76, 7000000, 'gt', 4.79, 1.92, 1.38, '#ff6a00', 0, 'v8', 2.72, 0.53, { level: 4 }],
  ['eu_serpent', 'EUROPA', 'SERPENT ACR V10', '2017 FRモンスター', 'FR', 645, 813, 1530, 285, 6, 6400, 0, 84, 76, 92, 26000000, 'super', 4.46, 1.94, 1.25, '#1a40c0', 0, 'v10', 2.51, 0.5, { level: 7 }],
  ['xm_sleigh', 'EVENT', 'NORTH POLE SLEIGH GT', '聖夜限定スーパーGT', 'FR', 520, 600, 1350, 290, 6, 8000, 1, 88, 98, 84, 0, 'gt', 4.5, 1.86, 1.27, '#f8f8ff', 1, 'v8', 2.6, 0.5, { event: 1 }],
  ['xm_reindeer', 'EVENT', 'SAKURA "REINDEER"', '聖夜限定チューンドFR', 'FR', 320, 340, 1220, 250, 6, 7800, 1, 82, 96, 74, 0, 'coupe90', 4.45, 1.69, 1.28, '#c00018', 0, 'i4', 2.52, 0.54, { event: 1 }]
];
const CARS = CAR_ROWS.map(r => ({
  id: r[0], maker: r[1], name: r[2], era: r[3], drive: r[4], hp: r[5], torque: r[6], kg: r[7], top: r[8], gears: r[9], redline: r[10], turbo: !!r[11],
  handling: r[12], drift: r[13], brake: r[14], price: r[15], body: r[16], L: r[17], W: r[18], H: r[19], color: r[20], popup: !!r[21], sound: r[22], wb: r[23], fb: r[24], unlock: r[25]
}));
const CAR_BY_ID = Object.fromEntries(CARS.map(c => [c.id, c]));

// ---------------------------------------------------------------------
// マップ（コースはパラメータから自動生成。既存作品のコピーではないオリジナル地形）
// env: mountain / highway / city / port / industrial / coast / circuit / lot
// hp: ヘアピン群 {at:周回位置0-1, n:本数, amp:振幅}
// ---------------------------------------------------------------------
const MAPS = [
  { id: 'akigiri', name: 'AKIGIRI PASS', jp: '秋霧峠', cat: 'touge', env: 'mountain', seed: 1101, R: 560, N: 64, harm: [[2, .10], [3, .07], [5, .03]], hp: [{ at: .58, n: 5, amp: .19 }], H: 60, width: 8, diff: 3, time: 'night', weather: 'clear', desc: '霧が立ちこめる伝統の峠。後半の5連ヘアピンが勝負所。', unlock: null, tunnel: null },
  { id: 'kuremine', name: 'KUREMINE PASS', jp: '紅嶺峠', cat: 'touge', env: 'mountain', seed: 2202, R: 640, N: 64, harm: [[2, .12], [4, .05], [3, .05]], hp: [{ at: .3, n: 3, amp: .16 }], H: 75, width: 9, diff: 3, time: 'evening', weather: 'clear', desc: '道幅が広く高速セクションが続く。夕焼けの稜線を駆け抜けろ。', unlock: null, tunnel: [.78, 160] },
  { id: 'harukaze', name: 'HARUKAZE LAKE PASS', jp: '榛風峠', cat: 'touge', env: 'mountain', lake: true, seed: 3303, R: 520, N: 64, harm: [[3, .08], [2, .07], [6, .025]], hp: [{ at: .7, n: 4, amp: .18 }], H: 55, width: 8, diff: 3, time: 'day', weather: 'clear', desc: '湖を囲む中速コーナーの連続。リズムが命。', unlock: { story: 2 }, tunnel: null },
  { id: 'hakoya', name: 'HAKOYA TURNPIKE', jp: '箱谷ターンパイク', cat: 'touge', env: 'mountain', seed: 4404, R: 760, N: 56, harm: [[2, .1], [3, .07], [5, .05], [7, .025]], hp: [], H: 95, width: 10, diff: 2, time: 'day', weather: 'fog', desc: '大きくうねる有料道路風の高速峠。濃霧に注意。', unlock: { story: 5 }, tunnel: [.4, 220] },
  { id: 'nanamagari', name: 'NANAMAGARI SLOPE', jp: '七曲坂', cat: 'touge', env: 'mountain', autumn: true, seed: 5505, R: 680, N: 100, harm: [[2, .06], [3, .04]], hp: [{ at: .2, n: 8, amp: .16 }, { at: .66, n: 8, amp: .16 }], H: 70, width: 8, diff: 4, time: 'evening', weather: 'clear', desc: '紅葉に染まるヘアピンの連続。立ち上がりの姿勢を作れ。', unlock: { story: 6 }, tunnel: null },
  { id: 'tengu', name: 'TENGU PASS', jp: '天狗峠', cat: 'touge', env: 'mountain', seed: 6606, R: 600, N: 72, harm: [[2, .09], [3, .06], [5, .035]], hp: [{ at: .35, n: 4, amp: .17 }, { at: .8, n: 3, amp: .16 }], H: 80, width: 8, diff: 4, time: 'night', weather: 'clear', desc: '伝説の走り屋が棲むという深山の峠。全てが試される。', unlock: { story: 8 }, tunnel: [.6, 140] },
  { id: 'hayate', name: 'HAYATE HIGHLANDS', jp: '疾風峠', cat: 'touge', env: 'mountain', seed: 7707, R: 950, N: 64, harm: [[2, .1], [4, .08], [6, .05], [9, .025]], hp: [], H: 90, width: 10, diff: 3, time: 'day', weather: 'clear', desc: '超高速コーナーが連続する高原ルート。度胸が試される。', unlock: { story: 7 }, tunnel: [.15, 180] },
  { id: 'tsuzura', name: 'TSUZURAORI', jp: '九十九折峠', cat: 'touge', env: 'mountain', seed: 8808, R: 640, N: 110, harm: [[2, .05]], hp: [{ at: .12, n: 10, amp: .2 }, { at: .62, n: 10, amp: .2 }], H: 85, width: 7.5, diff: 5, time: 'day', weather: 'clear', desc: 'ヘアピンだらけの九十九折。サイドブレーキを使いこなせ。', unlock: { story: 4 }, tunnel: null },
  { id: 'hosomichi', name: 'HOSOMICHI PASS', jp: '細道峠', cat: 'touge', env: 'mountain', seed: 9909, R: 440, N: 72, harm: [[5, .05], [7, .035], [3, .05]], hp: [{ at: .45, n: 4, amp: .2 }], H: 45, width: 6, diff: 5, time: 'night', weather: 'rain', desc: '狭く荒れたテクニカル林道。一瞬のミスが命取り。', unlock: { story: 3 }, tunnel: null },
  { id: 'baylane', name: 'TOKYO BAY EXPRESS', jp: '東京ベイエクスプレス', cat: 'city', env: 'highway', seed: 1212, R: 1500, N: 40, poly: 7, fillet: [140, 300], harm: [[2, .14], [3, .05]], hp: [], H: 6, width: 15, diff: 2, time: 'night', weather: 'clear', desc: '湾岸を貫く超高速ルート。最高速アタックに。', unlock: null, tunnel: [.5, 400] },
  { id: 'cloop', name: 'METRO C-LOOP', jp: '都心環状線', cat: 'city', env: 'highway', seed: 1313, R: 640, N: 48, poly: 10, fillet: [35, 70], harm: [[2, .08], [3, .05]], hp: [], H: 8, width: 11, diff: 4, time: 'night', weather: 'clear', desc: 'ビルの谷間とトンネルを縫う都市高速のループ。', unlock: { level: 3 }, tunnel: [.25, 260] },
  { id: 'harbor', name: 'HARBOR LINE', jp: '港湾エリア', cat: 'city', env: 'port', seed: 1414, R: 520, N: 48, poly: 8, fillet: [25, 55], harm: [[3, .08], [2, .06]], hp: [], H: 2, width: 12, diff: 2, time: 'evening', weather: 'clear', desc: 'コンテナが積み上がる埠頭を周回。', unlock: { level: 2 }, tunnel: null },
  { id: 'kogyo', name: 'KOGYO ZONE', jp: '工業地帯', cat: 'city', env: 'industrial', seed: 1515, R: 540, N: 48, poly: 9, fillet: [25, 50], harm: [[2, .07], [3, .05]], hp: [], H: 3, width: 11, diff: 3, time: 'night', weather: 'clear', desc: '煙突と配管が光るプラントを抜ける夜のコース。', unlock: { level: 4 }, tunnel: null },
  { id: 'seaside', name: 'SEASIDE LINE', jp: '海沿いルート', cat: 'city', env: 'coast', seed: 1616, R: 820, N: 72, harm: [[2, .1], [3, .08], [6, .06], [9, .03]], hp: [], H: 22, width: 9, diff: 2, time: 'day', weather: 'clear', desc: '海岸線をなぞる爽快なワインディング。', unlock: { level: 2 }, tunnel: [.7, 150] },
  { id: 'neon', name: 'NEON DISTRICT', jp: '夜の都市部', cat: 'city', env: 'city', seed: 1717, R: 500, N: 48, poly: 10, fillet: [20, 40], harm: [[2, .06], [3, .05]], hp: [], H: 2, width: 12, diff: 3, time: 'night', weather: 'rain', desc: 'ネオン輝く繁華街の公道コース。濡れた路面に注意。', unlock: { level: 5 }, tunnel: null },
  { id: 'jumppark', name: 'SKY RAMP PARK', jp: 'スカイランプ・パーク', cat: 'circuit', env: 'port', seed: 7707, R: 620, N: 48, poly: 5, fillet: [34, 70], harm: [[2, .05]], hp: [], H: 3, width: 14, diff: 2, time: 'evening', weather: 'clear', jumps: [0.08, 0.3, 0.52, 0.76], jumpH: 1.7, desc: 'ジャンプ台が並ぶ特設コース。直線で加速して、空を飛べ！', unlock: null, tunnel: null },
  { id: 'circuit', name: 'SAKURA MOTOR CIRCUIT', jp: 'サーキット', cat: 'circuit', env: 'circuit', seed: 1818, R: 540, N: 48, poly: 9, fillet: [14, 80], harm: [[2, .12], [3, .1]], hp: [], H: 6, width: 13, diff: 2, time: 'day', weather: 'clear', desc: '国際格式のオリジナルサーキット。セッティング確認に最適。', unlock: null, tunnel: null },
  { id: 'lot', name: 'TEST LOT', jp: '駐車場・テスト走行エリア', cat: 'free', env: 'lot', seed: 1919, R: 90, N: 24, harm: [[2, .15]], hp: [], H: 0, width: 12, diff: 1, time: 'day', weather: 'clear', open: 170, desc: '自由に走れる広大なテスト場。ドリフト練習・試乗に。', unlock: null, tunnel: null },
  { id: 'momiji', name: 'MOMIJI VALLEY', jp: '紅葉渓谷', cat: 'touge', env: 'mountain', autumn: true, seed: 3131, R: 600, N: 72, harm: [[2, .09], [3, .06], [5, .04]], hp: [{ at: .5, n: 3, amp: .17 }], H: 70, width: 8, diff: 3, time: 'evening', weather: 'clear', desc: '燃えるような紅葉の渓谷を下る中速ワインディング。', unlock: null, tunnel: [.2, 120] },
  { id: 'kirisame', name: 'KIRISAME FOREST', jp: '霧雨林道', cat: 'touge', env: 'mountain', seed: 3232, R: 470, N: 80, harm: [[4, .06], [6, .035], [3, .05]], hp: [{ at: .3, n: 4, amp: .19 }, { at: .75, n: 2, amp: .15 }], H: 50, width: 6.5, diff: 4, time: 'day', weather: 'rain', desc: '霧雨に濡れた狭い林道。路面はいつも滑りやすい。', unlock: { level: 3 }, tunnel: null },
  { id: 'yukimi', name: 'YUKIMI WINTER PASS', jp: '雪見峠', cat: 'touge', env: 'mountain', seed: 3333, R: 560, N: 72, harm: [[2, .1], [3, .06]], hp: [{ at: .6, n: 4, amp: .18 }], H: 75, width: 8, diff: 4, time: 'day', weather: 'snow', desc: '冬季の圧雪路。繊細なアクセルワークで滑らせろ。', unlock: { level: 4 }, tunnel: [.3, 160] },
  { id: 'kazan', name: 'KAZAN SKYLINE', jp: '火山スカイライン', cat: 'touge', env: 'mountain', seed: 3434, R: 880, N: 64, harm: [[2, .12], [4, .07], [7, .03]], hp: [], H: 110, width: 9.5, diff: 3, time: 'evening', weather: 'fog', desc: '火山の稜線を縫う高速スカイライン。霧に包まれる。', unlock: { level: 5 }, tunnel: null },
  { id: 'tanada', name: 'TANADA DOWNHILL', jp: '棚田ダウンヒル', cat: 'touge', env: 'mountain', seed: 3535, R: 520, N: 90, harm: [[3, .05], [2, .05]], hp: [{ at: .25, n: 6, amp: .17 }, { at: .7, n: 6, amp: .17 }], H: 90, width: 7, diff: 5, time: 'day', weather: 'clear', desc: '棚田の斜面を一気に下る、ヘアピン12連発。', unlock: { level: 6 }, tunnel: null },
  { id: 'damu', name: 'DAM LAKE ROUTE', jp: 'ダム湖ルート', cat: 'touge', env: 'mountain', lake: true, seed: 3636, R: 640, N: 72, harm: [[2, .08], [3, .06], [5, .03]], hp: [{ at: .4, n: 3, amp: .14 }], H: 60, width: 8.5, diff: 3, time: 'night', weather: 'clear', desc: 'ダム湖を周回する夜の峠。トンネルを抜けると湖面が光る。', unlock: { level: 2 }, tunnel: [.82, 260] },
  { id: 'bridge', name: 'BAY BRIDGE ROUTE', jp: 'ベイブリッジルート', cat: 'city', env: 'highway', seed: 3737, R: 1100, N: 40, poly: 6, fillet: [90, 200], harm: [[2, .1], [3, .05]], hp: [], H: 14, width: 13, diff: 2, time: 'night', weather: 'clear', desc: '海を渡る長大橋と高架を駆ける湾岸ナイトクルーズ。', unlock: { level: 2 }, tunnel: [.6, 300] },
  { id: 'downtown', name: 'DOWNTOWN STREETS', jp: '昼の繁華街', cat: 'city', env: 'city', seed: 3838, R: 460, N: 48, poly: 12, fillet: [16, 32], harm: [[2, .07], [3, .05]], hp: [], H: 2, width: 11, diff: 4, time: 'day', weather: 'clear', desc: '直角コーナーが連続するビル街。ブレーキングが鍵。', unlock: null, tunnel: null },
  { id: 'airport', name: 'AIRPORT CIRCUIT', jp: '空港特設コース', cat: 'circuit', env: 'circuit', seed: 3939, R: 650, N: 48, poly: 7, fillet: [18, 90], harm: [[2, .14], [3, .08]], hp: [], H: 0, width: 16, diff: 2, time: 'night', weather: 'clear', desc: '滑走路を使った超ワイドな特設コース。最高速を試せ。', unlock: { level: 3 }, tunnel: null },
  { id: 'x_forest', name: 'SNOW FOREST LIGHTS', jp: '雪の森イルミロード', cat: 'xmas', env: 'mountain', xmas: true, seed: 2528, R: 500, N: 72, harm: [[3, .07], [2, .06]], hp: [{ at: .55, n: 4, amp: .17 }], H: 50, width: 8, diff: 3, time: 'evening', weather: 'snow', desc: '雪化粧の森を光のトンネルが照らす聖夜のワインディング。', unlock: { event: 1 }, tunnel: null },
  { id: 'x_pass', name: 'HOLY NIGHT PASS', jp: '聖夜峠', cat: 'xmas', env: 'mountain', xmas: true, seed: 2525, R: 560, N: 72, harm: [[2, .1], [3, .06]], hp: [{ at: .45, n: 5, amp: .18 }], H: 60, width: 8, diff: 4, time: 'night', weather: 'snow', desc: '雪が舞い、イルミネーションが灯る聖夜の峠。', unlock: { event: 1 }, tunnel: null },
  { id: 'x_city', name: 'HOLY LIGHTS CITY', jp: 'イルミネーションの街', cat: 'xmas', env: 'city', xmas: true, seed: 2526, R: 520, N: 48, poly: 9, fillet: [22, 45], harm: [[2, .06], [3, .05]], hp: [], H: 2, width: 12, diff: 3, time: 'night', weather: 'snow', desc: '巨大ツリーとライトアップされた道路が彩る雪の街。', unlock: { event: 1 }, tunnel: null },
  { id: 'x_park', name: 'SNOW DRIFT PARK', jp: '雪道ドリフトコース', cat: 'xmas', env: 'circuit', xmas: true, seed: 2527, R: 300, N: 40, poly: 8, fillet: [14, 40], harm: [[3, .1], [2, .08]], hp: [], H: 4, width: 14, diff: 3, time: 'night', weather: 'snow', desc: '圧雪のドリフト専用コース。低いグリップを楽しめ。', unlock: { event: 1 }, tunnel: null }
];
const MAP_BY_ID = Object.fromEntries(MAPS.map(m => [m.id, m]));

// ---------------------------------------------------------------------
// パーツ・カスタマイズ（価格は¥）
// ---------------------------------------------------------------------
const PARTS = {
  engine: { label: 'エンジン形式', cat: 'engine', opts: [
    { id: 'stock', name: '純正エンジン', price: 0 }, { id: 'turbo', name: 'ターボキット / スポーツタービン', price: 680000 },
    { id: 'bigturbo', name: '大型ターボ', price: 1200000 }, { id: 'super', name: 'スーパーチャージャー', price: 850000 }, { id: 'super2', name: '大型スーパーチャージャー（ツインスクリュー）', price: 1500000 }, { id: 'twin', name: 'ツインチャージャー（ターボ＋SC）', price: 2200000 }, { id: 'swap', name: 'エンジン載せ替え (V8)', price: 2400000 }] },
  ecu: { label: 'ECU', cat: 'engine', lv: [0, 120000, 250000, 450000], names: ['純正', 'ROM チューン', 'サブコン', 'フルコン'] },
  intercooler: { label: 'インタークーラー', cat: 'engine', lv: [0, 150000, 320000], names: ['純正', '前置き', '大容量'] },
  intake: { label: '吸排気系', cat: 'engine', lv: [0, 60000, 140000, 260000], names: ['純正', 'エアクリーナー', 'インテーク+EXマニ', 'フル吸排気'] },
  muffler: { label: 'マフラー', cat: 'engine', lv: [0, 80000, 160000, 300000], names: ['純正', 'スポーツ', 'ストレート', 'チタン砲弾'] },
  reinforce: { label: 'エンジン強化', cat: 'engine', lv: [0, 300000, 600000, 1000000], names: ['純正', 'ステージ1', 'ステージ2', 'ステージ3'] },
  susp: { label: 'サスペンション', cat: 'chassis', lv: [0, 180000, 350000, 650000], names: ['純正', 'ストリート', '車高調 (調整式)', 'レース用'] },
  brake: { label: 'ブレーキ', cat: 'chassis', lv: [0, 90000, 220000, 480000], names: ['純正', 'スポーツパッド', '大径ローター', '6POTキャリパー'] },
  diff: { label: 'デファレンシャル', cat: 'chassis', opts: [
    { id: 'open', name: 'オープンデフ', price: 0 }, { id: '1way', name: 'LSD 1WAY', price: 150000 }, { id: '15way', name: 'LSD 1.5WAY', price: 180000 }, { id: '2way', name: 'LSD 2WAY', price: 200000 }] },
  trans: { label: 'トランスミッション', cat: 'chassis', lv: [0, 380000], names: ['純正', 'クロスミッション (ファイナル調整可)'] },
  cam: { label: 'カムシャフト', cat: 'engine', lv: [0, 160000, 320000], names: ['純正', 'ハイカム', 'レース用カム'] },
  piston: { label: 'ピストン・コンロッド', cat: 'engine', lv: [0, 420000], names: ['純正', '鍛造ピストン'] },
  fuel: { label: '燃料系', cat: 'engine', lv: [0, 90000, 210000], names: ['純正', '大容量インジェクター', 'フューエルシステム一式'] },
  flywheel: { label: 'フライホイール', cat: 'engine', lv: [0, 110000], names: ['純正', '軽量フライホイール'] },
  clutch: { label: 'クラッチ', cat: 'engine', lv: [0, 90000, 180000], names: ['純正', 'シングルプレート', 'ツインプレート'] },
  nos: { label: 'ニトロシステム', cat: 'engine', lv: [0, 250000, 500000], names: ['標準', '大容量ボトル', 'ツインボトル'] },
  stab: { label: 'スタビライザー', cat: 'chassis', lv: [0, 80000, 160000], names: ['純正', '強化', '調整式'] },
  strut: { label: 'タワーバー', cat: 'chassis', lv: [0, 45000], names: ['なし', 'フロント+リア'] },
  knuckle: { label: 'ナックル（切れ角）', cat: 'chassis', lv: [0, 280000], names: ['純正', 'ハイアングルナックル'] },
  weight: { label: '軽量化', cat: 'chassis', lv: [0, 150000, 400000, 900000], names: ['なし', '内装軽量化', 'カーボンパネル', 'フルカーボン化'] },
  tire: { label: 'タイヤの種類', cat: 'tire', opts: [
    { id: 'street', name: 'ストリートタイヤ', price: 0, mu: 0.96, slide: 0.72, wet: 0.78, snow: 0.6 },
    { id: 'sport', name: 'スポーツタイヤ', price: 85000, mu: 1.03, slide: 0.72, wet: 0.8, snow: 0.58 },
    { id: 'high', name: 'ハイグリップタイヤ', price: 140000, mu: 1.12, slide: 0.7, wet: 0.74, snow: 0.52 },
    { id: 'drift', name: 'ドリフトタイヤ', price: 95000, mu: 0.98, slide: 0.86, wet: 0.76, snow: 0.6 },
    { id: 'racing', name: 'レーシングタイヤ', price: 220000, mu: 1.22, slide: 0.66, wet: 0.66, snow: 0.45 },
    { id: 'wet', name: 'ウェットタイヤ', price: 110000, mu: 0.98, slide: 0.74, wet: 0.95, snow: 0.8 },
    { id: 'slick', name: 'スリックタイヤ', price: 320000, mu: 1.32, slide: 0.62, wet: 0.45, snow: 0.35 },
    { id: 'rally', name: 'ラリータイヤ', price: 120000, mu: 0.95, slide: 0.8, wet: 0.86, snow: 0.86 },
    { id: 'studless', name: 'スタッドレスタイヤ', price: 100000, mu: 0.9, slide: 0.76, wet: 0.9, snow: 1.05 },
    { id: 'semi', name: 'セミスリック（ドリフト用）', price: 180000, mu: 1.08, slide: 0.84, wet: 0.7, snow: 0.5 }] }
};
const WHEEL_STYLES = [
  { id: 'sd1', name: '紫電 I 純正 8本', price: 160000, spokes: 8, only: 'shiden' }, { id: 'sd2', name: '紫電 II 純正 ツイン5本', price: 180000, spokes: 10, only: 'shiden' }, { id: 'sd3', name: '紫電 III 純正 6本ディープ', price: 220000, spokes: 6, deep: 1, only: 'shiden' }, { id: 'sd4', name: '紫電 V 純正 鍛造10本', price: 260000, spokes: 10, rim: '#3a3c42', only: 'shiden' },
  { id: 'stock', name: '純正スチール', price: 0, spokes: 0 }, { id: 'five', name: '5本スポーク', price: 120000, spokes: 5 },
  { id: 'six', name: '6本スポーク', price: 140000, spokes: 6 }, { id: 'mesh', name: 'メッシュ', price: 180000, spokes: 12 },
  { id: 'deep', name: '深リム', price: 160000, spokes: 8, deep: 1 }, { id: 'turbo', name: 'ターボファン', price: 150000, spokes: 10 },
  { id: 'blade', name: '10本ブレード', price: 170000, spokes: 10 }, { id: 'y7', name: 'Y字7スポーク', price: 150000, spokes: 7 }, { id: 'rally', name: 'ラリー用ディッシュ', price: 90000, spokes: 4, deep: 1 },
  { id: 'mesh16', name: 'クロスメッシュ16', price: 210000, spokes: 16 }, { id: 'spoke3', name: '3本スポーク', price: 130000, spokes: 3 },
  { id: 'gold6', name: 'ゴールド6本', price: 240000, spokes: 6, rim: '#d4af37' }, { id: 'bronze10', name: 'ブロンズ10本', price: 220000, spokes: 10, rim: '#8c5a2b' },
  { id: 'black8', name: 'マットブラック深リム', price: 230000, spokes: 8, deep: 1, rim: '#1a1a1a' }, { id: 'white7', name: 'ホワイト7本', price: 190000, spokes: 7, rim: '#f2f2f2' },
  { id: 'chrome12', name: 'クローム深リムメッシュ', price: 280000, spokes: 12, deep: 1, rim: '#e0e4ea' }, { id: 'fine20', name: 'ファイン20本', price: 260000, spokes: 20 },
  { id: 'candy', name: 'キャンディケイン (限定)', price: 0, spokes: 6, xmas: 1 }, { id: 'star', name: 'スノースター (限定)', price: 0, spokes: 5, xmas: 2 }
];
const AERO = {
  front: { label: 'フロントバンパー', opts: [['純正', 0], ['リップスポイラー', 90000], ['エアロバンパー', 150000], ['カナード付き', 190000], ['フルエアロ（大型スプリッター）', 260000], ['ストリートリップ', 80000], ['カーボンスプリッター', 180000], ['2段カナード', 230000], ['タイムアタックスプリッター', 320000], ['VIPバンパー', 200000], ['ラリーガード', 160000], ['ドリフトバンパー（大型ダクト）', 210000], ['GTバンパー', 240000], ['ブルバー', 120000], ['ショートリップ', 60000], ['紫電 専用エアロバンパー', 320000, { only: 'shiden' }]] },
  rear: { label: 'リアバンパー', opts: [['純正', 0], ['アンダーディフューザー', 80000], ['レーシングディフューザー', 140000], ['ビッグディフューザー', 210000], ['7枚フィンディフューザー', 180000], ['カーボンバランス', 150000], ['リアカナード', 120000], ['センター出しバンパー', 170000], ['ドラッグディフューザー', 220000], ['ワイドリアバンパー', 200000], ['ラリーマッドガード', 90000], ['GTディフューザー（大型フィン）', 290000], ['紫電 専用ディフューザー', 260000, { only: 'shiden' }]] },
  side: { label: 'サイドスカート', opts: [['純正', 0], ['スポーツスカート', 70000], ['ワイドスカート', 110000], ['カーボンワイドスカート', 160000], ['サイドウイングレット', 140000], ['ローダウンスカート', 120000], ['サイドスプリッター', 150000], ['VIPスカート', 130000], ['ラリースカート', 90000], ['GTサイドポッド', 210000], ['スリムスカート', 60000]] },
  wing: { label: 'リアウイング', opts: [['なし', 0], ['ダックテール', 60000], ['GTウイング', 180000], ['ハイマウントウイング', 260000], ['スワンネック大型ウイング', 340000], ['ダブルデッキウイング', 380000], ['ワイドカーボンGTウイング', 420000], ['ローマウントGT', 200000], ['カーボンダックテール', 140000], ['3段ウイング', 460000], ['大型エンドプレートGT', 360000], ['スプリットウイング', 300000], ['ハッチスポイラー', 120000], ['ガーニーフラップGT', 280000], ['タイムアタックウイング', 520000], ['ミニウイングレット', 90000], ['ドラッグウイング', 330000], ['ワイドスワンネック', 440000], ['ツインポストハイマウント', 380000], ['紫電 専用GTウイング', 480000, { only: 'shiden' }]] },
  hood: { label: 'ボンネット', opts: [['純正', 0], ['カーボン', 140000], ['ダクト付きカーボン', 160000], ['ベンテッドボンネット', 190000], ['パワーバルジ', 150000], ['ルーバーボンネット', 170000], ['大型エアスクープ', 200000], ['ボンネットピン付き', 90000], ['ツインダクト', 180000], ['ラリーボンネット', 160000], ['GTエアアウトレット', 220000], ['紫電 専用ベンテッドボンネット', 300000, { only: 'shiden' }]] },
  exhaust: { label: 'マフラー形状', opts: [['純正', 0], ['デュアル', 50000], ['砲弾', 70000], ['クワッド', 90000]] },
  fender: { label: 'オーバーフェンダー', opts: [['純正', 0], ['ビス留めフェンダー', 220000], ['ワイドボディキット', 480000], ['リベットワイドボディ', 560000], ['スムースワイド', 420000], ['スーパーワイド', 620000], ['マッドフラップ', 70000], ['ベンテッドフェンダー', 260000]] },
  mirror: { label: 'サイドミラー', opts: [['純正', 0], ['エアロミラー', 45000], ['カーボンミラー', 80000]] },
  roof: { label: 'ルーフ', opts: [['純正', 0], ['ルーフベント', 60000], ['ルーフスポイラー', 75000], ['ルーフスクープ', 90000], ['シャークフィン', 70000], ['ルーフラック', 80000], ['ライトバー', 110000], ['カーボンルーフ', 130000], ['ボルテックスジェネレーター', 100000], ['ルーフウイング', 120000]] },
  head: { label: 'ヘッドライト', opts: [['純正', 0], ['イエローバルブ', 30000], ['スモーク', 40000]] },
  hl: { label: 'ヘッドライトの形', opts: [['純正', 0], ['丸目2灯', 90000], ['丸目4灯', 120000], ['角目2灯', 90000], ['プロジェクター', 160000], ['LEDライン', 180000], ['つり目', 140000], ['角目4灯', 120000], ['フォグランプ付き', 110000], ['ポップアップ（リトラクタブル）', 250000], ['スリムライン', 150000], ['ラリーライト（4連）', 130000]] },
  trunk: { label: 'トランク', opts: [['純正', 0], ['トランクリップ', 70000], ['トランクパネル', 120000], ['ビッグダックテール', 150000], ['カーボントランク＋リップ', 190000], ['ミニトランクウイング', 110000], ['ハイマウントブレーキ灯', 80000], ['ダブルリップ', 130000]] },
  tail: { label: 'テールランプ', opts: [['純正', 0], ['クリアテール', 50000], ['スモークテール', 50000]] }
};
const PAINT_TYPES = [['gloss', 'ソリッド', 50000], ['metallic', 'メタリック', 80000], ['matte', 'マット', 120000], ['pearl', 'パール', 150000]];
const PALETTE = ['#f2f2f2', '#111114', '#d01020', '#ff6a00', '#ffd000', '#2fbf71', '#1e5aff', '#7a1a8a', '#b0b8c0', '#5a5f6a', '#00b8d4', '#ff4fa0', '#8b5a2b', '#c0a060', '#204030', '#0a1a40'];
const XMAS_PALETTE = ['#c00018', '#0f6b2f', '#f8f8ff', '#d4af37'];
const LIVERIES = [
  { id: 'none', name: 'なし', price: 0 }, { id: 'stripe', name: 'センターストライプ', price: 100000 }, { id: 'side', name: 'サイドライン', price: 80000 },
  { id: 'two', name: 'ツートン', price: 120000 }, { id: 'panda', name: 'パンダ (白黒)', price: 120000 }, { id: 'fade', name: 'グラデーション', price: 150000 },
  { id: 'flame', name: 'ファイアパターン', price: 160000 }, { id: 'race', name: 'レーシングナンバー', price: 90000 }, { id: 'snow', name: 'スノーフレーク (限定)', price: 0, xmas: 1 }
];
const DECALS = [
  { id: 'touge', name: '「峠」ステッカー', price: 40000 }, { id: 'legends', name: 'DRIFT LEGENDS', price: 40000 }, { id: 'doraku', name: '峠道楽', price: 40000 },
  { id: 'shoshin', name: '初心者マーク', price: 10000 }, { id: 'kaze', name: '風神', price: 40000 }, { id: 'nightkids', name: 'MIDNIGHT CLUB', price: 40000 },
  { id: 'sponsor', name: 'スポンサーロゴ', price: 50000 }, { id: 'num', name: 'ゼッケンプレート', price: 30000 },
  { id: 'xmas', name: 'MERRY DRIFTMAS (限定)', price: 0, xmas: 1 }, { id: 'snowman', name: '雪だるま (限定)', price: 0, xmas: 1 }
];

// ---------------------------------------------------------------------
// ストーリー
// ---------------------------------------------------------------------
const STORY = [
  { id: 1, title: '第1話　霧の峠の噂', map: 'akigiri', rival: { name: '黒沢 ジン', team: 'AKIGIRI SPEEDSTARS', car: 'hk_s1', color: '#b0b8c0', skill: 0.70 }, reward: 300000, xp: 500,
    pre: [['ジン', 'お前が最近この峠で噂の新入りか？'], ['ジン', 'ここは俺たちのホームコースだ。下りで勝負してやるよ。'], ['あなた', '……受けて立つ。']],
    win: [['ジン', 'マジかよ……あのラインで突っ込んでくるなんて。'], ['ジン', '紅嶺峠の連中には気をつけな。あそこは格が違う。']],
    lose: [['ジン', 'まだまだだな。峠は甘くないぜ。']] },
  { id: 2, title: '第2話　紅嶺の白い閃光', map: 'kuremine', rival: { name: '氷室 レイ', team: 'RED RIDGE RACING', car: 'hb_r2', color: '#f2f2f2', skill: 0.72 }, reward: 400000, xp: 650,
    pre: [['レイ', 'ロータリーの音、聞こえるだろう？'], ['レイ', '紅嶺の高速セクションで、理論の違いを見せてあげる。']],
    win: [['レイ', '……計算外ね。あなたの走り、データに残しておく。']], lose: [['レイ', '感覚だけでは届かない領域があるの。']] },
  { id: 3, title: '第3話　4WDの壁', map: 'harukaze', rival: { name: '堂島 ケンタ', team: 'LAKE SIDE GANG', car: 'hk_gt1', color: '#5a5f6a', skill: 0.74 }, reward: 500000, xp: 800,
    pre: [['ケンタ', '4WDのトラクションに勝てると思ってんのか？'], ['ケンタ', '湖の周りは立ち上がり勝負だ。覚悟しな！']],
    win: [['ケンタ', 'FRでここまで……俺の負けだ。']], lose: [['ケンタ', '立ち上がりで全部持っていかれたな！']] },
  { id: 4, title: '第4話　細道の雨', map: 'hosomichi', rival: { name: '白石 ミオ', team: 'NIGHT RAIN', car: 'ts_s2k', color: '#ffffff', skill: 0.75 }, reward: 600000, xp: 950,
    pre: [['ミオ', '雨の細道は、優しく走らないと牙をむくよ。'], ['ミオ', 'ついてこられる？']],
    win: [['ミオ', 'ふふ、いいアクセルワーク。また走ろうね。']], lose: [['ミオ', '濡れた路面は嘘をつかないよ。']] },
  { id: 5, title: '第5話　九十九折の双子', map: 'tsuzura', rival: { name: '鬼塚 兄弟', team: 'ONIZUKA BROTHERS', car: 'mk_9', color: '#1c3fa0', skill: 0.76 }, reward: 750000, xp: 1100,
    pre: [['鬼塚(兄)', 'ヘアピン20連発、俺たちの庭だ。'], ['鬼塚(弟)', 'サイドブレーキの使い方、教えてやるよ！']],
    win: [['鬼塚(兄)', '嘘だろ……ヘアピンで抜かれるなんて。']], lose: [['鬼塚(弟)', 'ヘアピンじゃ俺たちに勝てねぇ！']] },
  { id: 6, title: '第6話　霧のターンパイク', map: 'hakoya', rival: { name: '神楽 ユウ', team: 'HAKOYA ZERO', car: 'ak_raijin4', color: '#f07800', skill: 0.77 }, reward: 900000, xp: 1300,
    pre: [['ユウ', 'パワーこそ正義。直線で全部ひっくり返す。'], ['ユウ', '霧の中で俺のテールランプを見失うなよ。']],
    win: [['ユウ', 'パワー差を……コーナーで埋めたっていうのか。']], lose: [['ユウ', '直線番長って言われても、勝ちは勝ちだ。']] },
  { id: 7, title: '第7話　紅葉のミッドシップ', map: 'nanamagari', rival: { name: '柳 ソウマ', team: 'AUTUMN LEAVES', car: 'ts_nx1', color: '#c00000', skill: 0.78 }, reward: 1100000, xp: 1500,
    pre: [['ソウマ', 'ミッドシップの回頭性、七曲坂でこそ活きる。'], ['ソウマ', '美しく走ろう。']],
    win: [['ソウマ', '見事だ。紅葉より鮮やかなドリフトだった。']], lose: [['ソウマ', '美しさが足りないね。']] },
  { id: 8, title: '第8話　疾風のモンスター', map: 'hayate', rival: { name: '東条 カイ', team: 'GT-X WORKS', car: 'hk_gtx', color: '#d8d8de', skill: 0.79 }, reward: 1400000, xp: 1800,
    pre: [['カイ', '最新テクノロジーの前に、旧車の時代は終わったんだ。'], ['カイ', '超高速コーナーでついてこられるか？']],
    win: [['カイ', 'テクノロジーを……ドライバーが超えた？']], lose: [['カイ', '数字は嘘をつかない。']] },
  { id: 9, title: '最終話　天狗峠の伝説', map: 'tengu', boss: true, rival: { name: '天城 リュウ', team: '峠の伝説', car: 'hb_r3', color: '#f2f2f2', skill: 0.82 }, reward: 3000000, xp: 3000,
    pre: [['???', '……お前か。最近あちこちの峠を荒らしているのは。'], ['リュウ', '天城リュウだ。この天狗峠で負けたことは一度もない。'], ['リュウ', '伝説になりたければ、俺の前を走ってみろ。']],
    win: [['リュウ', '……完敗だ。今日からお前が、この峠の伝説だ。'], ['リュウ', 'DRIFT LEGEND——その名にふさわしい走りだった。']], lose: [['リュウ', '伝説はそう簡単に塗り替えられない。また来い。']] }
];
const STORY_UNLOCKS = { 1: { maps: [], cars: [] }, 2: { maps: ['harukaze'], cars: ['hb_r2'] }, 3: { maps: ['hosomichi'], cars: ['hk_gt1', 'hk_gt2'] }, 4: { maps: ['tsuzura'], cars: ['ts_s2k'] }, 5: { maps: ['hakoya'], cars: ['mk_9'] }, 6: { maps: ['nanamagari'], cars: [] }, 7: { maps: ['hayate'], cars: ['ts_nx1'] }, 8: { maps: ['tengu'], cars: [] }, 9: { maps: [], cars: ['hb_r3'] } };

// ---------------------------------------------------------------------
// クリスマスイベント
// ---------------------------------------------------------------------
const XMAS_EVENT = {
  title: 'WINTER LEGENDS 2026', jp: 'ウィンターレジェンズ', start: '2026-11-15', end: '2026-12-31',
  tasks: [
    { id: 'x_race', name: 'クリスマス限定レース', desc: '聖夜峠でサンタ・ドリフターに勝利', type: 'race', map: 'x_pass', rival: { name: 'サンタ・ドリフター', team: 'NORTH POLE RACING', car: 'xm_reindeer', color: '#c00018', skill: 0.74 }, reward: { money: 800000, item: 'car:xm_reindeer' } },
    { id: 'x_drift', name: '雪道ドリフトチャレンジ', desc: 'スノードリフトパークで15,000点以上', type: 'touge', map: 'x_park', target: 15000, reward: { money: 500000, item: 'wheel:candy' } },
    { id: 'x_city', name: 'イルミネーション・タイムアタック', desc: 'イルミネーションの街を走りきる (1周)', type: 'time', map: 'x_city', reward: { money: 400000, item: 'livery:snow' } },
    { id: 'x_pass_drift', name: '聖夜峠ドリフト', desc: '聖夜峠で10,000点以上', type: 'touge', map: 'x_pass', target: 10000, reward: { money: 400000, item: 'decal:xmas' } },
    { id: 'x_forest', name: '雪の森ドリフト', desc: '雪の森イルミロードで8,000点以上', type: 'touge', map: 'x_forest', target: 8000, reward: { money: 300000, item: 'acc:hat' } }
  ],
  colors: XMAS_PALETTE
};

// ---------------------------------------------------------------------
// 音楽（すべて本ゲーム内でリアルタイム生成するオリジナル曲。外部音源は不使用）
// ---------------------------------------------------------------------
const TRACKS = [
  { id: 't1', name: 'MIDNIGHT PASS OVERDRIVE', bpm: 158, key: 57, minor: 1, seed: 11, prog: [0, 5, 3, 4], cat: 'race' },
  { id: 't2', name: 'HAIRPIN HEARTBEAT', bpm: 160, key: 52, minor: 1, seed: 23, prog: [5, 3, 0, 4], cat: 'race' },
  { id: 't3', name: 'NEON COUNTERSTEER', bpm: 155, key: 54, minor: 1, seed: 37, prog: [0, 3, 6, 4], cat: 'race' },
  { id: 't4', name: 'REDLINE FEVER', bpm: 162, key: 48, minor: 1, seed: 41, prog: [0, 6, 5, 4], cat: 'race' },
  { id: 't5', name: 'LEGENDS RISING', bpm: 150, key: 50, minor: 1, seed: 53, prog: [0, 5, 6, 4], cat: 'menu' },
  { id: 't6', name: 'GARAGE LIGHTS', bpm: 124, key: 55, minor: 0, seed: 61, prog: [0, 4, 5, 3], cat: 'garage', chill: 1 },
  { id: 't7', name: "RIVAL'S SHADOW", bpm: 156, key: 59, minor: 1, seed: 71, prog: [0, 5, 3, 4], cat: 'story' },
  { id: 't8', name: 'SNOWFALL OVERDRIVE', bpm: 156, key: 55, minor: 0, seed: 83, prog: [0, 5, 3, 4], cat: 'xmas', bells: 1 },
  { id: 't9', name: 'JINGLE TURBO NIGHT', bpm: 160, key: 48, minor: 0, seed: 97, prog: [0, 3, 4, 0], cat: 'xmas', bells: 1 },
  { id: 't10', name: 'JINGLE BELLS ROCK RUN（「ジングルベル」ロック編曲）', bpm: 168, key: 55, minor: 0, seed: 5, prog: [0, 0, 0, 0], cat: 'xmas', bells: 1, rock: 1 },
  { id: 't11', name: 'AURORA DRIFT', bpm: 150, key: 53, minor: 1, seed: 113, prog: [0, 5, 3, 4], cat: 'race', soft: 1 },
  { id: 't12', name: 'STARLIGHT HIGHWAY', bpm: 146, key: 58, minor: 1, seed: 127, prog: [5, 3, 0, 4], cat: 'menu', soft: 1 },
  { id: 't13', name: 'MOONLIT APEX', bpm: 152, key: 51, minor: 1, seed: 139, prog: [0, 3, 6, 4], cat: 'race', soft: 1 }
];

// クリスマスショップ（イベントで貯めたクリスマスポイントで購入）
const XMAS_SHOP = [
  { item: 'car:xm_reindeer', name: 'SAKURA "REINDEER"（限定車）', cost: 3000 },
  { item: 'car:xm_sleigh', name: 'NORTH POLE SLEIGH GT（限定車）', cost: 7000 },
  { item: 'wheel:candy', name: '限定ホイール キャンディケイン', cost: 700 },
  { item: 'wheel:star', name: '限定ホイール スノースター', cost: 900 },
  { item: 'livery:snow', name: '限定リバリー スノーフレーク', cost: 600 },
  { item: 'livery:candy', name: '限定リバリー キャンディストライプ', cost: 900 },
  { item: 'decal:xmas', name: '限定デカール MERRY DRIFTMAS', cost: 300 },
  { item: 'decal:snowman', name: '限定デカール 雪だるま', cost: 300 },
  { item: 'acc:hat', name: 'ルーフ飾り サンタ帽', cost: 1200 },
  { item: 'acc:antler', name: 'ルーフ飾り トナカイの角＋赤鼻', cost: 1400 },
  { item: 'acc:tree', name: 'ルーフ飾り ミニツリー', cost: 1600 },
  { item: 'glow:xmas', name: 'クリスマスネオン（赤×緑）', cost: 1000 },
  { item: 'xmas:colors', name: '限定カラーパック（常時使用可能に）', cost: 500 },
  { item: 'caliper:gold', name: 'ゴールドキャリパー', cost: 400 },
  { item: 'car:xm_santa', name: 'サンタのそり SANTA SLEIGH（限定車・トナカイ付き）', cost: 6000 },
  { item: 'wacc:antler', name: '窓飾り トナカイの角（運転席・助手席の窓から）', cost: 1500 },
  { item: 'pglow:xmas', name: '光るナンバー クリスマス（赤×緑）', cost: 800 },
  { item: 'meter:candy', name: '限定スピードメーター キャンディケイン', cost: 1000 }
];
const ACHIEVEMENTS = [
  { id: 'first_win', name: '初勝利', desc: 'ストーリーで初めて勝利する' },
  { id: 'legend', name: 'DRIFT LEGEND', desc: 'ストーリーを全話クリア' },
  { id: 'drift10k', name: 'ドリフトキング見習い', desc: '峠チャレンジで10,000点' },
  { id: 'drift50k', name: '峠の支配者', desc: '峠チャレンジで50,000点' },
  { id: 'combo10', name: 'コンボマスター', desc: '10コンボ達成' },
  { id: 'speed250', name: '音速の壁', desc: '最高速度250km/h到達' },
  { id: 'garage5', name: 'コレクター', desc: '車を5台所有' },
  { id: 'rich', name: '億万長者への道', desc: '所持金¥10,000,000' },
  { id: 'record', name: 'コースレコード', desc: 'タイムアタックでコースレコード更新' },
  { id: 'tuner', name: 'チューナー', desc: 'パーツを10個購入' },
  { id: 'xmas', name: 'メリー・ドリフトマス', desc: 'クリスマスイベントのタスクを1つ達成' },
  { id: 'night10', name: 'ミッドナイトランナー', desc: '夜間に合計10km走行' }
];
// タイムアタックのコースレコード基準 (秒/km あたりの係数)。実際のレコードはコース長から算出
const RECORD_PACE = { mountain: 44, highway: 22, city: 36, port: 34, industrial: 34, coast: 32, circuit: 32, lot: 40 };
const DEV_NAMES = ['K.TAKAGI', 'R.AMAGI', 'S.KUROSAWA', 'M.SHIRAISHI', 'Y.KAGURA', 'K.TOJO', 'DEV TEAM', 'NIGHT GHOST'];

// ---- エキストラパーツ（パーツショップ） ----
// perf: true のものは性能に影響するため、装着中は週間ランキングに記録されない
const EXTRAS = [
  { id: 'jet', name: 'ジェットエンジン', price: 8000000, perf: 1, kind: 'thrust', F: 8000, drain: 0.18, rech: 0.07, col: [1, 0.55, 0.15], desc: 'ブーストボタンで噴射。長く押し続けられる強力な推進力' },
  { id: 'twinjet', name: 'ツインジェット', price: 12000000, perf: 1, kind: 'thrust', F: 11000, drain: 0.22, rech: 0.06, col: [1, 0.5, 0.1], twin: 1, desc: 'ジェット2基。さらに強い推進力' },
  { id: 'rocket', name: 'ロケットエンジン', price: 15000000, perf: 1, kind: 'thrust', F: 19000, drain: 0.45, rech: 0.05, col: [1, 0.3, 0.05], desc: '約2秒の爆発的な加速。チャージに時間がかかる' },
  { id: 'plasma', name: 'プラズマブースター', price: 10000000, perf: 1, kind: 'thrust', F: 9500, drain: 0.16, rech: 0.09, col: [0.3, 0.6, 1], desc: '青い炎のブースター。回復が速い' },
  { id: 'hop', name: 'ジャンプスラスター', price: 6000000, perf: 1, kind: 'hop', drain: 0.5, rech: 0.2, col: [0.6, 0.9, 1], desc: 'ブーストボタンでその場でジャンプ！' },
  { id: 'chute', name: 'ドラッグシュート', price: 700000, perf: 0, kind: 'chute', drain: 0.3, rech: 0.15, col: [1, 1, 1], desc: 'ブーストボタンでパラシュートを開いて急減速' },
  { id: 'fireworks', name: '花火ランチャー', price: 1200000, perf: 0, kind: 'fireworks', drain: 0.35, rech: 0.25, col: [1, 0.8, 0.2], desc: 'ブーストボタンで花火を打ち上げる（見た目だけ）' },
  { id: 'backfire', name: 'バックファイアキット', price: 900000, perf: 0, kind: 'backfire', drain: 0.25, rech: 0.2, col: [1, 0.45, 0.1], desc: 'ブーストボタンでマフラーから炎（見た目だけ）' },
  { id: 'horn', name: 'ミュージックホーン', price: 500000, perf: 0, kind: 'horn', drain: 0.5, rech: 0.3, col: [1, 1, 1], desc: 'ブーストボタンでメロディホーンを鳴らす' },
  { id: 'smoke', name: 'レインボースモーク', price: 800000, perf: 0, kind: 'smoke', desc: 'ドリフトのタイヤスモークが虹色に（ブーストはニトロのまま）' }
];
const EXTRA_BY_ID = Object.fromEntries(EXTRAS.map(e => [e.id, e]));

// ---- アップデート情報（新しい順） ----
const GAME_VERSION = '3.98';
const CHANGELOG = [
  { v: '3.98', title: '免許証＆クリスマスパーツ', items: [
    'ストアの上のタブに「ミニゲーム」と「消費アイテム」を追加（消費アイテムはその場で購入・使用できます）',
    '消費アイテムを12種類追加（峠のおにぎり・特製ラーメン・走り屋弁当・抹茶ラテ・ダイヤチョコ・ハイパーエナジー・天井チケット・ミステリーボックスなど）と「消費アイテムパック」',
    'オリジナルの免許証（メインメニュー「免許証」）：愛車・ホームコース・走りのスタイル・誕生日・ひとことを書いてカスタマイズ。デザイン20種類・マーク14種類が入った「免許証パック」',
    'クリスマスパーツ12種類（キャンディケイン・星・ゆきだるま・ベルのアンテナ、サンタ帽・トナカイのツノ・ルーフツリー・イルミネーション、赤い鼻・リース）とダイヤ専用の「クリスマスパーツパック」'] },
  { v: '3.97', title: 'フォト＆コレクション', items: [
    'フォトモード：レース中のポーズ画面から。カメラを自由に動かして、フィルター8種類・フレーム5種類・ロゴを付けて撮影・保存できます',
    'コレクションブック（メインメニュー）：アイテムの種類ごとに図鑑で確認でき、集めた割合（25%・50%・75%・100%）でごほうび',
    'パックの天井：決まった回数パックを開けるとレジェンダリーが確定（パックの内容画面に残り回数を表示）',
    'タイヤスモークの色21種類（綿あめ・ファイア・ポリス・ネオン・ゴールド・レインボー・ギャラクシーなど）と専用パック',
    'チャット用の動くスタンプ30種類と専用パック（絵文字の一覧の「スタンプ」タブから送れます）',
    '追加メーター24種類（Gメーター・ブースト計・ドリフト角・シフトランプ・スピードグラフ・コンパス・レトロLCDなど）と専用パック。レース画面に最大3つ'] },
  { v: '3.96', title: 'エンジン＆ミニゲーム', items: [
    '「特別なエンジン」18種類：車のエンジン音を置き換えられます（電気モーター・ジェットタービン・3ローター・V10スクリーマー・アメリカンV8・2ストローク・龍のエンジンなど）。専用の「特別なエンジンパック」から入手し、「飾り・小物」の「エンジン音」タブで装着',
    'ミニゲームを追加（メインメニューの「ミニゲーム」）：ダイヤで遊べるルーレット（最高はダイヤ×100のジャックポット）と、けずって遊ぶスクラッチくじ'] },
  { v: '3.95', title: 'パックの表紙リニューアル', items: [
    'デイリー・ブロンズ・シルバー・ゴールド・レジェンド・ミシック・パーツ・スタイル・プロフィール・ストリート・チューナーのパックの表紙を、それぞれオリジナルのイラストに'] },
  { v: '3.94', title: 'カスタム小物アップデート', items: [
    'ナンバープレートのデザイン24種類（チェッカー・さくら・フレイム・ネオン・ゴールド・ギャラクシー・レインボーなど）',
    'ゴール演出22種類（紙吹雪・打ち上げ花火・コインシャワー・お菓子の雨・イナズマ・昇り龍・レインボーアーチなど）',
    'ガレージの飾り付け26種類：ポスター・ネオンサイン・アーケードゲーム機・自動販売機・トロフィー棚・ジュークボックス・ミニ鳥居など、メニューのガレージに最大8個まで置けます',
    'クラクション24種類（エアホーン・汽笛・アヒル・ネコ・和太鼓・メロディ・龍の咆哮など）。レース中のクラクションボタンかキーボードの H で鳴らせます',
    'それぞれ専用パック（ナンバーデザイン・ゴール演出・ガレージ飾り・クラクション）をストアの「パーツ・スタイル・プロフィール」の欄に追加',
    'メインメニューの「飾り」を「飾り・小物」にして、タブで全部まとめて変更できるように'] },
  { v: '3.93', title: 'スイーツカー登場', items: [
    'ムービーパック限定のお菓子の車「COOKIE CRUISER」を追加（カード40枚で交換）：チョコチップクッキーのタイヤ、板チョコのシャシー、いちごのフロスティングとスプリンクル、チェリー、キャンディケインのウイング、ペロペロキャンディのアンテナ',
    'ニトロやドリフト中にカラフルなスプリンクルが飛び散ります',
    'ムービーパックにお菓子のペイント・ステッカー・称号を追加、飾り「クッキー」も登場'] },
  { v: '3.92', title: 'プレビュー＆アイテム追加', items: [
    '車カード交換で車をタップすると、3Dで車を見られるように（性能・必要枚数も表示）',
    '新しい飾り16種類（おにぎり・パンダ・きつねのお面・ちょうちん・ミニUFO・ミニトロフィーなど）',
    '新しいステッカー・ペイント・ホイール・ネオン・キャリパー・光るナンバー・称号を追加',
    '開発者がイベントや期間限定パック・ショップの期間を変更・延長できるように',
    'カードパックの購入ボタンの位置がずれる問題を修正'] },
  { v: '3.91', title: 'ムービーパック新車', items: [
    'ムービーパック限定車「SHADE INTERCEPTOR」を追加：荒野の夜に現れる謎の黒いウェッジ型インターセプター（カード45枚で交換）。ゴールドメッシュホイール、ニトロで青白いタービンの光',
    'メインメニューの曲を開発者が全員分まとめて設定できるように（開発者メニューの「MENU MUSIC」）',
    '車両パックの表紙のずれを修正'] },
  { v: '3.9', title: 'スター＆ミラー アップデート', items: [
    '全ての車に星（ランク）が登場！車両カードを集めて星を上げると、ガレージ経験値がたまり、装着できるエキストラが増えます',
    '車のクラスをアルファベット（F・D・C・B・A・S）で表示。最大の星はクラスによって ★3 / ★5 / ★8',
    '最大ランクに達した車のカードは自動でお金に変換されます',
    'ストアのパックに「車両パック」の欄を追加（ストリート・スポーツ・ハイパー）',
    'レース中の画面上部にバックミラーを追加。ミラーの下に吊り下げる「飾り」が車の動きに合わせて揺れます',
    '飾りは専用の「飾りカードパック」からのみ入手可能。メインメニューの「飾り」から変更でき、大きさや表示は設定でも変更できます',
    '絵文字パックの表紙をオリジナル絵文字に変更し、パーツ・スタイル・プロフィールの欄に移動',
    'ダイヤ両替の画面をリニューアル（好きな数で両替もできるように）',
    'レアカードにホロ加工、すべてのカードに流れる光のエフェクトを追加',
    '新しいステッカー・ペイント・ホイール・ネオン・称号を追加'] },
  { v: '3.8', title: '絵文字＆ウィンター アップデート', items: [
    'オリジナルの絵文字を200種類追加（かお・クルマ・きごう・どうぶつ・たべもの・きせつ・ことば）。クランのチャットと新しい「フレンドとのチャット」で使えます（最初から20種類使用可能）',
    'フレンド一覧に「チャット」ボタン：フレンドと1対1でメッセージと絵文字を送り合えます',
    '新しい通常パック「絵文字パック」（1パック 60ダイヤ）：チャット用の絵文字が1つ入っています',
    '期間限定「ウィンターカードパック」（2/28まで）：限定車 AURORA GLACIER GT（30枚）のカード、冬の限定ペイント・ネオン・ステッカー・ホイール・フレーム・エフェクト・称号',
    '新しい通常パック「ストリートカードパック」「チューナーカードパック」と、新しいステッカー・ホイール・ネオン・ナンバー・ペイント・キャリパー',
    'バンドルを6種類追加（ウィンター・絵文字まとめ買い・ストリートスターター・フルチューナー・ムービー・ドライバー応援）',
    'ストアの「クリスマス」に「クリスマスポイント」のページを追加。クリスマスイベントのショップはストアに移動しました',
    'メインメニューのPLAYボタンや残り時間の絵文字をオリジナルのアイコンに',
    'スマホの縦向き・横向きのどちらでもメニューとストアが見やすいように調整。パックの詳細画面で下の購入ボタンが隠れる問題、ポップアップが下のナビと重なる問題を修正'
  ] },
  { v: '3.72', title: 'スマホ表示の修正', items: [
    'スマホ（横向き）でストアの「カードパック」「オファー」を開くと、カードが大きすぎて購入ボタンが下に隠れて買えなかった問題を修正。画面の高さに合わせてカードを小さく表示し、上の見出しもコンパクトにしました'
  ] },
  { v: '3.71', title: 'ストア改善パッチ', items: [
    'ストアの「オファー」「カードパック」のページの高さを中身にぴったり合わせました（余白を削減）。パックが増えたら横にスクロールできます',
    '車カード交換を横スクロールのカードに：車のサムネイル（タップで車を見る）・集めた枚数のバー・「交換する」ボタン',
    'デイリーショップは品揃えを更新しても必ず6個並ぶように'
  ] },
  { v: '3.7', title: 'ムービー アップデート', items: [
    '期間限定「ムービーカードパック」：限定車 CHRONO WING（40枚）・NIGHT AGENT（40枚）・NEBULA RACER（30枚）のカードと、映画モチーフのリバリー・ステッカー・ペイント・ネオン・ホイール・メーター・フレーム・エフェクト・バナー・称号（開発者メニューから販売期間を設定できます）',
    'CHRONO WING：ガルウイングのタイムマシン風の車。専用「クロノナビ」UI（現在の日付・行き先の日付・チャージ）、ブーストで後ろから炎と効果音、チャージ満タンでブーストすると「TIME WARP」演出。専用メーター（変更不可）',
    'NIGHT AGENT：AIパートナーを積んだ黒い追跡車風の車。フロントで光が左右に動くスキャナー、AIの音声波形・メッセージ・TURBO/PURSUIT/SCAN表示が動く専用UI、専用メーター（変更不可）',
    '映画モチーフの車を追加：CITY CAB 77・PURSUIT V8・THUNDER STALLION・MYSTERY VAN・SILVER SPY GT・NOIR SEDAN 48・STUNT RALLY',
    '新マップ「映画スタジオ・バックロット」：巨大スクリーンとレッドカーペット、サウンドステージ、西部劇の町、SF映画のセット、街並みのセット',
    '期間限定イベント「シネマナイト」（12/14まで）：スタントバトル・セットタイムアタック、イベント限定の称号・ステッカー・ペイント・フレーム・リバリー'
  ] },
  { v: '3.6', title: 'ストア操作感アップデート', items: [
    'ストアの「オファー」と「カードパック」を縦スワイプのページに：左のレールのボタンかスワイプでページを切り替え（スポットライト／期間限定バンドル／パックBOX、期間限定パック／カードパック／パーツ・スタイル・プロフィール／車カード交換）',
    'パーツ・スタイル・プロフィールのカードパックは専用のページに移動',
    'ボタンを押すと効果音が鳴るように。購入ボタンなどは押した場所から波紋が広がり、押している間は色が変わります',
    'スマホでショップの商品をタップすると、指の位置を中心に商品のまわりがうっすら光るように',
    '購入が完了すると、専用の効果音と「購入完了！」のチェックマーク演出、押したボタンが緑に光る演出'
  ] },
  { v: '3.5', title: '大阪・南港口 アップデート', items: [
    '新マップ「大阪 住之江・南港口」：住之江区の南港口〜平林がモデル。ニュートラムの高架と南港口駅・平林駅、平林貯木場の大きな池、大和川と阪神高速湾岸線、府立高校、団地、コンビニ、ガソリンスタンド、物流倉庫、工場、信号・横断歩道・電柱まで配置した約3.7kmのコース',
    'カードパックの表紙を一新：チェストのアイコンをやめ、オリジナルのエンブレム（パックのランクを星で表示）に',
    '期間限定の車カードが入っているパック（クリスマス・ネオンナイト）は、表紙にその限定車のアイコンと「LIMITED CAR」を表示',
    'カードパック開封で、後ろに残っているカードがめくったカードの手前に重なってしまう問題を修正'
  ] },
  { v: '3.4', title: 'めがね橋 アップデート', items: [
    '新マップ「眼鏡橋（千本松大橋）」：大阪・木津川に架かるループ橋「めがね橋」がモデル。両岸の2階建てらせんループ（720度）を登って水面から約36mの橋を渡り、反対側のループを下ります',
    '帰りは急な上り坂から下流の大きなアーチ橋へ。大正区側の3重ループを下って工場・倉庫街を抜ける約4.2kmの周回コース',
    '木津川の水面と護岸、川の中の橋脚、貨物船・タグボート・渡し船と渡船場、川沿いの松並木（千本松）、クレーンやガスタンクのある工場街を再現'
  ] },
  { v: '3.31', title: '修正パッチ', items: [
    'カードパックやプレゼントボックスを開けたとき、カードの表面が真っ黒になって何も表示されないことがある問題を修正',
    'パック開封の「裏から開ける」演出を削除し、上部をカットして開ける演出に統一'
  ] },
  { v: '3.3', title: 'ホーリーナイト アップデート', items: [
    'クリスマスイブイベント「聖夜のナイトドライブ」（12/24 限定）：聖夜峠でサンタのライバルとバトル、イルミネーションの街をドライブ。限定の称号・ペイント・ナンバー・ステッカー、全ミッション達成でプレゼントボックス×3',
    'クリスマスプレゼント：12/25 になると全プレイヤーに「クリスマスプレゼントボックス」（中身ランダム）が届きます（12/31まで受け取れます）',
    'プレゼント受け取りボックス：運営からのプレゼント（お金・ダイヤ・パック・BOX・車カード・アイテムなど）をメニューから受け取れるように',
    'ストアに「クリスマス限定ショップ」（12/26まで）：プレゼントボックスを1個・5個・10個で購入、サンタの大袋も登場',
    'プレゼントボックスは3Dの箱。開けるとリボンがほどけてフタが飛び、中から光とカードが出てきます',
    'カード・パックの演出を3Dに：指やマウスの動きに合わせてパックとカードが立体的に傾き、カードに厚みと光の反射がつきました',
    'パーツショップをガレージに統合：ガレージの「パーツを買う」からホイール・タイヤ・ボディキット・エンジン・エキストラなどを購入できます',
    'バックパックを一新：所持金・ダイヤ・車・未開封の数が見やすいヘッダー、アイコン付きのタブ、カードが順番に出てくるアニメーション'
  ] },
  { v: '3.21', title: 'パック開封 演出パッチ', items: [
    'カードパックの開封演出を一新：爆発する演出をやめて、「パックの上の点線をなぞってカットして開ける」演出と「パックを裏返して背面のフラップを開ける」演出に（開封画面のボタンでどちらか選べます）',
    'パックを開けると、切り口や背面のすき間から、いちばん良いカードのレア度の色の光がもれ出します'
  ] },
  { v: '3.2', title: 'ネオンナイト アップデート', items: [
    'チューニングの性能プレビュー：パーツのボタンに「+35PS」などの変化量を表示。買う前に、出力・トルク・最高速・0-100・重量・ハンドリング・ドリフト・ブレーキがどう変わるかをグラフで確認できます',
    '期間限定「ネオンナイト カードパック」（12/13まで）：限定車 NEON ONI GT（40枚）・KITSUNE-BI RS（30枚）・RYUJIN 4X（30枚）のカードと、ネオン限定のペイント・ネオン・ステッカー・フレーム・エフェクト・バナー・称号',
    'ストアのオファーに「スポットライト」：限定車のリレーパック・エクスクルーシブパック・スモールパックなど6種類（購入制限つき、中身を確認してから購入）',
    '週替わりバンドルを6種類追加（KAGURA デビュー・スタイル詰め合わせ・ミシックチャレンジ・ドリフト王・ネオンナイト・旧車コレクション）',
    '新車16台：新メーカー KAGURA（MAIHIME S・TENMA V12・SHINOBI GT3・IKAZUCHI D-SPEC）ほか、TSURUGI R・GINGA 240・YUKIKAZE RS・HAYABUSA SPEC-R・RAIMEI EVO-X・KOGANE GT・SHIDEN GTX-VI・KOHAKU WAGON・KURENAI 7・SORA TYPE-S・KOMA TURBO・TSUMUJI 4x4',
    'アイテムを約150種類追加：ペイント24・キャリパー12・アンダーネオン10・光るナンバー6・ステッカー24・ホイール12・称号10・フレーム12・バナー8・アイコン8・エフェクト6（ネオンナイト限定アイテムは別に17種類）'
  ] },
  { v: '3.1', title: 'レジェンズパス アップデート', items: [
    'レジェンズパス登場：デイリー・ウィークリーのパスミッションでパスポイントを集めてステージを進め、全30ステージの報酬をゲット（無料パス＋ダイヤで買えるプレミアムパス、ダイヤでステージ購入も可能）',
    'パスは毎月新シーズンに切り替わり報酬も変わります（SEASON 1「LEGENDS RISING」は11/30 23:59まで、SEASON 2「WINTER LEGENDS」は12/1〜12/31 23:59のクリスマス仕様）',
    'デイリーイベント：毎日変わる3つのレース（タイムアタック・ドリフト・レース）の条件をクリアしてお金とダイヤをゲット、3つすべてクリアでボーナスダイヤ',
    'スペシャルイベント「ドリフトキング杯」開催（12/6まで）：雷鳴峠のライバル戦とミッションで豪華報酬',
    'デイリーショップを一新：カード型のグリッドに、ダイヤで買える車カードコーナーを追加。ダイヤで今すぐ品揃えを更新（1日3回まで）',
    'ロード画面とタイトル画面をモダンなデザインに一新',
    'コモン系パック（フリー・ブロンズ・シルバー）の中身を整理して種類を減らし、ほかのアイテムは上位パックから出るように'
  ] },
  { v: '3.01', title: 'リプレイ＆新ストア パッチ', items: [
    'リプレイ機能：レースやタイムアタックのあと、リザルトの「▶ リプレイ」で自分の走りを見返せます（一時停止・5秒戻し・0.5倍/2倍・カメラ切り替え）',
    'ランキングのリプレイ：タイムアタックとドリフトの週間ランキングで、各プレイヤーの ▶ を押すとその人の走りを見られます（記録を更新したときに保存）',
    '新しい「ストア」：期間限定バンドル（○○と○○のセット）、カードパックBOX、ダイヤ両替をまとめた横スクロールのお店。セール表示・旧価格・残り時間つき',
    'カードパックBOX：10パック入りで20%オフ。エピック以上が1枚以上確定',
    'ダイヤ両替：ダイヤをお金に交換（1ダイヤ＝¥10,000、まとめて両替するとボーナス最大+20%）',
    'カードパックの表紙を新デザインに（ホログラム・圧着部分・ロゴ）。開封の演出と効果音を強化（フィルムのカサカサ音・破れる音・カードを引き抜く音）',
    '下部ナビの SHOP からストアを開けるように。メインメニューにも「ストア」を追加',
    'カードパック・日替わりショップ・ダイヤ・コレクション・ホーム背景をすべてストアにまとめました（メインメニューの「カードパック」「ダイヤ」はストアに統合）',
    'カードパック売り場を一新：「期間限定パック」「カードパック」を横に並べ、残り時間・価格を表示。パックを押すと中身（メインの限定車カードなど）と出現率を確認でき、1・5・10パックから選んで購入できます。BOXはオファーのバンドルの隣に移動',
    'ストアのタブ・ダイヤ・お金のアイコンをオリジナルデザインに変更',
    '新レア度「ミシック」を追加：限定カラー8色・ネオン4種・ステッカー4種・フレーム・エフェクト・バナー・称号、限定車「KIRIN AURORA "MYTHIC"」のカード（40枚で交換）',
    '新カードパック：パーツカードパック・スタイルカードパック・ミシックカードパック（ミシック7%）。ビークルカードパックは終了しました',
    'カードパックからダイヤとお金も出るように。車のカードはゴールド・レジェンド・ミシック・クリスマスのパックだけに入ります（コモン系のパックには入りません）',
    'パックの詳細画面に出現アイテムを全部表示：左のレジェンダリー（ミシック）から右のコモンまで、横スクロールで確認できます',
    'レジェンダリー・ミシックが出たときの演出を豪華に（LEGENDARY!／MYTHIC!! の文字・画面の揺れ・紙吹雪・ファンファーレ）。「3Dで見る」でカードをくるくる回して眺められます',
    'パックBOXを本物のディスプレイBOXのような3Dの箱に。買うときに「今すぐ開ける」か「インベントリに保存」を選べます。開封はフタが持ち上がって中のパックが見える演出つきで、開けたあと「10パックすべて開ける」か「保存してあとで開ける」を選べます',
    'ストアに「未開封」タブ：保存したBOXとパックをいつでも開けられます（1パックずつ／まとめて）',
    '日替わり・ダイヤ・コレクション・ホーム背景の画面を一新：大きなカードとカウントダウン、達成率リングとジャンル別の進み具合、背景のプレビュー付き一覧'
  ] },
  { v: '3.0', title: '新マップ・プロフィール・最終統合アップデート', items: [
    '新マップ「明神峠（MYOJIN MOUNTAIN PASS）」：山頂スタート、トンネル、4連ヘアピン、Z字ヘアピン、高低差約100m。カーブミラー・矢印板・駐車場と展望台・スタート小屋つき（昼・夕方・夜に対応）',
    '新マップ「東京メトロポリタン高速（TOKYO METROPOLITAN EXPRESSWAY）」：高架、地下トンネル、料金所風ゲート、遮音壁、2か所のJCT（分岐ランプと緑の案内標識）、窓とネオンのあるビル群',
    'JCTの手前で「JCT ○m・左：ベイエリア方面／本線直進：都心環状方面」の案内を表示（本線はそのまま直進です）',
    'マップ選択を刷新：FREE RUN / TIME ATTACK / RACE / DRIFT CHALLENGE をタブで切り替え。特徴・対応モード・ベストタイム・ベストドリフトを表示。新マップに NEW マーク',
    '新モード「RACE」：好きなコースでライバル1台と対戦（周回数も選べます）。メニューにも追加',
    '既存コースの道路を全コースで点検（コース生成の失敗・道路の重なり・急すぎる勾配がないことを確認）。トンネルを1コースに複数作れるように改良',
    '新車「HOKUTO GRANDBOX TURBO」：オリジナルのワンボックス車（ディーゼルターボ・FR）。カードパック限定',
    '車カード：カードパックから限定車のカード（×1・×3・×10）が出るように。30枚集めると車と交換できます（カードパック画面の「車カード」）',
    'リザルト画面を刷新：RACE FINISHED / TIME ATTACK FINISHED、順位または自己ベストとの差、ドリフトスコア、走行距離、最大コンボ、賞金とXPのカウントアップ、NEW PERSONAL BEST 表示',
    'ゴール後はカメラが車の周りを回る演出に。背景を暗くしてリザルトがなめらかに出ます',
    'リザルトのボタンを RETRY / MAIN MENU / CONTINUE に。1レースの報酬は1回だけ受け取れるように（二重受取を防止）',
    '画面下部にナビゲーションバー（HOME / GARAGE / RACE / SHOP / EVENTS / PROFILE）を追加。レース中・パック開封中・リザルトでは自動で隠れます',
    'スマホの初期操作を「左：ハンドル（◀▶）／右：アクセル・ブレーキ」に（新しく始めた人の初期設定。今の設定は変わりません。設定 → 操作 → ボタンでいつでも切り替え可能）',
    'メインメニュー用のBGM（MP3）を後から追加できるように',
    'お知らせ配信：運営からのお知らせ（通常・重要・緊急・アップデート）がリアルタイムで届くように。同じお知らせは1回だけ表示',
    'メンテナンス画面とメンテナンス・アップデートまでのカウントダウン表示を追加',
    'プレイヤーレベルの上限（Lv.200）を撤廃。何レベルでも上げられるようになりました（今までのXPとレベルはそのまま）',
    '開発者用の管理画面（DEVELOPER CONTROL PANEL）を追加。操作の権限はサーバー側（Firebase のルール）で確認します',
    'プロフィールを自由にカスタマイズ：アイコン・フレーム・動くエフェクト・バナー・称号・ひとこと・表示名（プロフィール →「プロフィールを編集」）',
    'プロフィール用アイテムを78種類追加：フレーム24種・エフェクト16種・バナー16種・アイコン12種・新しい称号10種',
    'ショップに「プロフィール」タブ。レジェンダリー以外は定価で買えます（レジェンダリーはパック限定）。日替わりショップやカードパックからも出ます',
    '専用カードパックを2種類追加：「ビークルカードパック」（限定車のカードだけが出る）と「プロフィールパック」（フレーム・エフェクト・バナー・アイコン・称号）',
    'カードパック限定車を3台追加：戦車「TYPE-26 "TETSUJIN"」（40枚）・フォーミュラカー「FORMULA V-26」（50枚）・ブロックで組んだ車「BRICK RACER」（30枚）',
    '日替わりショップのデザインを刷新（レア度ごとの光るカード・大きなカウントダウン）',
    'メインメニューのアニメーションを強化（ボタンが順番に出てくる・ホバーで光る・ストーリーボタンが輝く）',
    '新マップ「雷鳴峠（KAMINARI THUNDER PASS）」：道幅8mの細い峠。トンネル・Z字ヘアピン・尾根の高速ストレート・名物の5連ヘアピン（上級者向け）',
    '明神峠などの峠で、山側の岩壁がカーブの内側にきちんと出るように修正。トンネルの入口が草の山でふさがっていた問題を修正（トンネルの上に山を盛る形に）',
    'マップ選択にカテゴリ（すべて・NEW・峠・高速道路・市街地・サーキット など）と並び替え（新しい順・難易度順・距離が長い順・名前順）を追加。カードも見やすく',
    '新車「HOKUTO MINI-TRUCK KT」（軽トラ）をカーショップで販売。フルチューン版「MINI-TRUCK KT "FULL TUNE"」はカードパック限定',
    'フルチューンチケットを追加：カードパックからまれに出ます。ガレージで使うと選んだ車が一瞬でフルチューン',
    'ストーリーのレース中にライバルがしゃべるように（スタート・抜いた／抜かれた・離された・ラストスパート）',
    '車選択画面を一新：青いネオン調のパネル、大きな車名、セグメント式のスペックゲージ、START ボタン。選択とスタートに効果音',
    'エンジン音を強化：エンジン形式ごとの排気の共鳴、アクセルを踏み込んだときの歪み（うなり）、回転の微妙な揺らぎを追加',
    'メインメニューを見やすく（背景を暗くして文字を大きく・ボタンのコントラストを強化）',
    'プロフィールの名前は Google でログインしていない人でも「プロフィールを編集 → ひとこと」から変えられます',
    '通知（トースト）が縦に長く伸びて表示されていた問題を修正',
    '日本車を作り直し：RAIJIN Mk.IV（大きなループウイング・丸型4灯テール・3連ライト）、RAIJIN Mk.V（大型グリル・L字LED）、SAKURA S-III（つり目ライト・ダックテール）、TEMPEST STX（ボンネットのエアスクープ・大型ウイング・金色ホイール）、ZEPHYR Z（縦長ライト・ブーメラン型テール）。プロポーションも見直し',
    '新車：RAIJIN Mk.III（1989・リトラクタブルライトの直6ターボGT）、TEMPEST 22-R（1998・ワイドボディの4WDクーペ・金色ホイール）',
    '欧州車を5台に整理（TORO VELENO・CAVALLO ROSSO・SCHWARZ 9 RS・BAVARIA M-SPORT 3・TORINO DELTA）。この5台はライト・テール・インテークを専用デザインに。ほかの欧州車はショップから外しましたが、持っている車はそのまま使えます',
    'メインメニューを一新：大きなストーリーカード、レースモードのカード、ガレージ・ショップ・その他のボタンをすっきり整理（スマホでも見やすく）',
    '期間限定「クリスマスカードパック」（12/31まで）：クリスマス限定車「FROST KAISER GT」（30枚）・「CANDY CANE ROADSTER」（25枚）のカード、限定フレーム（スノーフレーク・ヒイラギ・キャンディケイン・イルミネーション）・エフェクト・バナー・称号',
    'プロフィール用アイテム（フレーム・エフェクト・アイコン・バナー・称号）はカードパックからのみ入手できるように変更（ショップでは販売しません）',
    '設定 → サウンドの音楽リストに、追加した曲（MP3）を表示。タップでいつでも再生でき、終わると次の追加曲が流れます'
  ] },
  { v: '2.9', title: '期間限定イベント アップデート', items: [
    'イベント画面を刷新：開催中・開催予定・終了のタブ。日時はすべて日本時間で、サーバーの時刻を使ってカウントダウン',
    '「NEW YEAR\'S EVE 2026」（12/31〜1/1）：年越しナイトラン・カウントダウンドライブ・イベントミッション・限定デカール/ナンバー/ホイール/称号',
    '1月1日0:00（日本時間）に全員で「HAPPY NEW YEAR 2027」のカウントダウン演出と専用曲',
    '「NEW YEAR 2027」（1/1〜1/14）：新年限定レース・新年タイムアタック・参加中はXP 1.5倍・限定アイテム',
    '新しいイベント専用コース3つ（年越しベイライン・大晦日の夜景シティ・初日の出ライン）。クリスマスイベントもそのまま遊べます'
  ] },
  { v: '2.8', title: 'レベル＆プロフィール アップデート', items: [
    'レベルを最大200まで拡張。レベルが上がるほど必要XPが増える方式に（今までのレベルと進み具合はそのまま引き継ぎ）',
    'XPの入手：レース完走・タイムアタック・自己ベスト更新・ドリフトスコア・イベント・実績の報酬',
    'ホーム・ガレージ・プロフィール・リザルトにレベルとXPバーを表示。リザルトではバーが伸びるアニメーション',
    'LEVEL UP演出と専用の効果音',
    'レベル報酬：お金・デカール・称号・ガレージ装飾・エアロパーツ・ダイヤ・新車の入荷（1レベルにつき1回だけ）',
    'プロフィール画面を一新：レベル・総レース数・完走数・総走行距離・ベストタイム・総ドリフトスコア・所有車両とパーツ・実績・称号',
    '実績を追加：FIRST RACE・FIRST TIME ATTACK・PERSONAL BEST・100 RACES・100 KM・1000 KM・DRIFT MASTER・LEVEL 10/50/100。解除日も表示',
    '実績の報酬でXPももらえるように',
    'セーブの保護：壊れたデータでは上書きしない・バックアップを保存'
  ] },
  { v: '2.7', title: 'カードパック＆インベントリ アップデート', items: [
    'カードパックをカードパックに一新：パックごとに違うデザイン、OPEN PACKで開封',
    '豪華な開封演出：パックが浮かんで光り、破れてカードが飛び出し、回転して表面を公開',
    'レア度ごとの演出：レアは青、エピックは紫の強い光と粒子、レジェンダリーは金色の光の筋と特別な演出',
    'カードパック専用の効果音（開封・破れる音・カードの回転・レア度ごとの獲得音）',
    'SKIP ANIMATION：演出を飛ばしても報酬は開封前に確定・保存済み。開封中の二重操作も防止',
    '開封前に排出確率と重複時の変換ルールを表示',
    '新しい獲得アイテム：称号15種・マフラー5種（ストレートパイプ音つき）',
    'バックパックをインベントリに一新：種類・レア度で絞り込み、未所持も表示、タップでプレビュー、装着・取り外し（車ごとに保存）、開封履歴',
    'デイリーショップの更新をサーバー時刻基準にして、カウントダウンを秒まで表示',
    'パーツショップのアイテムも購入前に車に付けた状態をプレビュー',
    'アイテムの一部（追加分のホイールなど）が装着画面に出ない不具合を修正'
  ] },
  { v: '2.6', title: '紫電シリーズ＆サウンド大型アップデート', items: [
    '新しい音楽を追加：「Keep the Road Between Us Wide」「No Way To Stop Me」（通常レース・タイムアタック・ストーリーでランダムに流れる）',
    'クリスマスイベントのレースでは専用曲「ChristmasNight」が流れるように',
    'エンジン音を強化：回転域ごとの音をクロスフェード、エンジンブレーキ、ロータリーのアイドリング、車ごとの音（紫電・ロータリー各車）',
    'ターボ車の吸気音・過給音・ブローオフ（車によってはバタつく音）',
    'マフラーの音を選べるように：純正・スポーツ・大径・競技用・チタン（選ぶと空ぶかしで試聴）',
    'タイヤ音：軽い滑り・ドリフト・高速の横滑り・グリップ回復で音が変わる',
    '運転席視点では吸気音と振動感が強く、車外では排気音が強く聞こえるように。ライバル車は近い2台だけ鳴らして音の重なりを防止',
    'ボタンの効果音を種類分け（クリック・メニュー切り替え・決定・キャンセル・購入・エラー・ロック中）',
    '設定に音量を追加：BGM・UI効果音・エンジン・タイヤ・その他の効果音（それぞれ保存）。効果音が鳴るときはBGMを少し下げて聞き取りやすく',
    'オリジナルの4世代GTシリーズ「紫電（SHIDEN）」を追加：GTS-X／GTS-X II／GTS-X III／GTX-V',
    '世代ごとに専用のボディ形状・フロントフェイス・ヘッドライト・テールランプ・ボンネット・フェンダー・純正ウイング・純正ホイール',
    '紫電シリーズ専用パーツ：専用エアロバンパー・専用ディフューザー・専用GTウイング・専用ベンテッドボンネット',
    '塗装の質感を一新：クリアコートの映り込み、メタリックの粒、パール、マット、クローム、カーボン',
    '全車にワイパー・エンブレム・サイドマーカーを追加。タイヤのトレッド、ホイールナット、ドリルドローターも追加',
    'カスタマイズに「スタイル」を追加：純正・ストリート・ワイドボディ・レーシング・ドリフトをワンタップで',
    'チューニングにトレッド幅（左右のタイヤの張り出し）を追加'
  ] },
  { v: '2.5', title: 'ソーシャル＆シーズン3 大型アップデート', items: [
    'ストーリーモードにシーズン2「関東遠征編」とシーズン3「全国制覇編」を追加（合計33レベル）。ときどきレベル報酬あり（選ぶと中身が見られる）',
    'ストーリーのシーズン・レベル選択画面をモダンなデザインに一新',
    'ストーリー用の新曲5曲＋練習・ドラッグ用の新曲',
    '新モード「ドラッグレース」（0-400m）と専用コース「ドラッグストリップ」',
    '練習用の新マップ「ドリフト練習場」',
    '運転席を作り込み：ハンドルとドライバーの手が操作に合わせて回り、タコメーターとスピードメーターの針が動く',
    '車ごとにヘッドライトの形を変更（丸目・角目・プロジェクター・LEDなど）',
    '実績システム（50種類以上・報酬つき）',
    'コード入力（コードを入れると報酬がもらえる）',
    'ガレージレベル：持っている車でレベルが上がり、Lv.100まで報酬。100以降はコインやランダムなアイテム',
    'フレンド：ユーザーネームで申請、フレンドと協力する週替わりのフレンドタスク',
    'クラン：ダイヤで作成（1人1つ）、公開／コード制を選べる、メンバー一覧とグループチャット',
    'トレード（フレンドのみ）：アイテム・車・お金・ダイヤを交換／プレゼント。お互い了承して5秒で成立',
    'はじめての人向けのチュートリアル（スマホの操作変更の方法つき）。メニューや設定からいつでも見られる',
    '上部にガレージレベル・フレンド・クランのボタンを追加',
    'カスタマイズ・カーショップ・バックパックなどの画面をモダンなデザインに'
  ] },
  { v: '2.4', title: '全車モデル作り直しアップデート', items: [
    '全車のボディ形状を作り直し。上から見た角の丸み、フロントとリアの傾斜、バンパー下の絞り込みで実車に近いシルエットに',
    'フロントガラスとリアガラスを実車のようなまっすぐ寝かせた形に（丸く膨らんだキャビンを修正）',
    'ルーフをわずかに丸め、窓まわりの幅とピラーの太さを実車のバランスに',
    'ハッチバックの形を修正：短い車は切り立ったリアゲート、長い車はなだらかなファストバックに',
    '軽自動車ミッドシップ専用のボディ形状を追加',
    'タイヤを少し大きくし、ホイールアーチとの隙間を実車らしく調整'
  ] },
  { v: '2.3.1', title: '車のモデル改良', items: [
    '全車のボディを作り直し、ぺったんこだったボンネットを実車らしい高さと丸みに',
    'ボンネットの両脇にフェンダーの稜線、タイヤの上にフェンダーの張り出しを追加',
    'ボンネットとトランクに見切り線（パネルの隙間）を追加'
  ] },
  { v: '2.3', title: 'プレビュー＆バス登場アップデート', items: [
    'カスタマイズやパーツショップで、買う前に車にパーツを付けた状態をプレビューできるように',
    '購入確定ボタンを追加。「購入確定」を押すまでお金やダイヤは減らない（キャンセルも可能）',
    'カードパック限定の新車「MIKAZUKI CITY LINER」（路線バス）を追加。ディーゼルのエンジン音つき',
    'ウェッジシェイプのV12スーパーカー「TORO VELENO V12」「TORO DIABOLO SV」（リトラ）を追加',
    '新しい車のモデルを細かく作り込み（大型サイドインテーク、Y字デイライト、ルーバー、六角テールなど）',
    'アイテムを200種類追加（ステッカー・限定カラー・ホイール・ネオン・キャリパー・光るナンバー・メーター・背景・ボディパーツ）',
    'エキストラを2つ同時に装着できるように。2つ目のスロットはダイヤ150個で解放',
    '大きな車ではカメラが自動で引くように'
  ] },
  { v: '2.2', title: 'パーツ一新＆名車アップデート', items: [
    'ボディパーツを大幅に追加（スポイラー・バンパー・スカート・ボンネット・ルーフ・トランク・フェンダーなど合計100種類以上）',
    '10種類のボディキット（セット）を追加。ストリート・タイムアタック・ドリフト・VIP・ラリー・GTなど',
    '新しい形のボディパーツ（ゴールド・ダイヤなどの仕上げ色）をカードパックとダイヤショップに追加',
    'ヘッドライトの形を11種類追加（丸目・角目・プロジェクター・LEDライン・つり目・ポップアップなど）',
    'ヘッドライトの色を変更できるように（ハロゲン・イエロー・ブルー・パープル・ピンク・レインボーなど）。路面を照らす光の色も変わる',
    '6台の新車を追加：高回転NAのハッチバック「KIRI TRUENO-86（パンダ）」、ロータリーの「SPIRIT FD-3S」と「SPIRIT FC-3S」、リトラの「SAKURA ONE-EIGHTY」、直6ターボの「ZENITH RZ-80」と「RAIDEN GT-R32」',
    'ポップアップ（リトラクタブル）ヘッドライトがライトに合わせて開閉',
    'エンジン音を一新。直4・直6・V8・ロータリー・水平対向ごとのリアルな音、シフト時の音、レブリミッター、アフターファイア',
    '消費アイテムを12種類追加（エナジードリンクで賞金アップ、ダイヤキャンディ、XPコーヒー、ラッキーチャームなど）',
    'バックパックに「消費アイテム」タブ。使用中のブーストはメニューとレース画面に残り時間つきで表示'
  ] },
  { v: '2.1', title: 'ダイヤ＆アイテム大量追加アップデート', items: [
    '新しい通貨「ダイヤ」と、ダイヤでしか買えないダイヤショップ（ダイヤ・ゴールドの車やパーツ）',
    '毎週入れ替わる「ダイヤレース」。ストーリー・イベントの勝利などでもダイヤがもらえる',
    'カードパックを1・3・5・10個まとめて開けられるように。開ける時の効果音を追加',
    'アイテムを大幅追加：デカール40・カラー20・ホイール16・ネオン12・メーター30・チューニングパーツ54など',
    'ボディパーツ（スポイラー・バンパー・スカート・ボンネット・ルーフ・トランク）を仕上げ色つきで追加',
    'エキストラを22種追加（合計32種）',
    'クリスマス限定車「サンタのそり」（トナカイのあり・なしを選べる）',
    'カードパック限定の曲とショップで買える曲を追加'] },
  { v: '2.0', title: '英語対応アップデート', items: [
    '設定で言語を「日本語 / English」から選べるように（設定 → サウンド）',
    'メニュー・説明・ストーリー・アイテム名などを英語に翻訳'] },
  { v: '1.9', title: 'パーツ＆エキストラ アップデート', items: [
    'パーツショップを追加（ホイール・タイヤ・ボディキット・エンジン・エキストラ）',
    'ホイール8種・タイヤ4種・ボディキット6種・スーパーチャージャー2種を追加',
    'エキストラ10種を追加（ジェット・ロケット・ジャンプスラスター・花火など）。ブーストボタンで作動',
    '週間ランキングにタイムアタック（コース別の最速ラップ）を追加',
    'ランキング1〜3位に金・銀・銅メダルと限定報酬、参加者全員に参加賞',
    'バックパックを追加（メダル・アイテム・エキストラ・所持品を確認）',
    'ステッカーを左右・ボンネット・ルーフ・トランクの好きな場所に1枚ずつ貼れるように',
    '新曲3曲（ドラム控えめのユーロビート）',
    'アップデート情報の画面を追加'] },
  { v: '1.8', title: 'ランキング アップデート', items: [
    '週間ランキング（峠ドリフト・最長ジャンプ・走行距離）を追加。毎週月曜にリセット',
    'Googleログインとユーザーネーム（重複不可）を追加',
    'メインメニューに「みんなのプレイ状況」とあなたのプレイ時間を表示'] },
  { v: '1.7', title: 'クリスマス大型アップデート', items: [
    'アドベントカレンダー（12/1〜25、毎日限定アイテム。カウントダウン付き）',
    '新コース「スカイランプ・パーク」（ジャンプ台つき）',
    'スピードメーター16種（アナログ＆デジタル）',
    'クリスマスショップに「窓からトナカイの角」「光るナンバー」を追加',
    'メインメニューを新デザインに',
    '開発者メニューを追加'] },
  { v: '1.6', title: '操作設定アップデート', items: [
    'スマホの操作プリセット7種（かんたん・アクセル切替・スライド・片手 など）',
    'アクセルのタップでON/OFF・自動、スライド操作、ボタンの大きさ・濃さ・左右入れ替え',
    'オートサイドブレーキ・オートニトロ',
    '横画面でメニューをスクロールできるように',
    'ボタンのタップ反応を改善、スマホの「戻る」操作に対応'] },
  { v: '1.5', title: 'GitHub版 公開', items: [
    'GitHub Pages でどこでも遊べるように',
    'オンライン対戦とクラウド保存（Googleログインで端末間の引き継ぎ）'] },
  { v: '1.4', title: 'カードパック＆コレクション', items: [
    'カードパック5種（コモン〜レジェンダリーのレア度・確率表示）',
    '限定アイテム114種・日替わりショップ・ホーム背景・カードパック限定車',
    'ニトロの効果音、ステッカーの位置を自由に調整',
    'ロード画面（ロゴ・TIPS・ランダム背景）',
    'アイコンをすべてオリジナルデザインに'] },
  { v: '1.3', title: 'カスタマイズ刷新＆不具合修正', items: [
    '車のモデルをよりリアルに（フロント形状の修正）',
    'カスタマイズ・チューニングのメニューを見やすく刷新',
    '峠チャレンジの開始エラー、数値エラー、タッチボタンが反応しない問題を修正'] },
  { v: '1.2', title: 'オンライン対戦＆大型拡張', items: [
    'オンライン対戦（部屋コード制）',
    'コース・車両・パーツを大幅追加',
    'くり返し遊べるクリスマスイベント（ポイント・クリスマスショップ）',
    'クリスマス曲（ジングルベル ロック編曲）'] },
  { v: '1.1', title: '遊びやすさ改善', items: [
    'ストーリーなどのライバルを遊びやすい強さに',
    'スマホのジャイロ操作（ON/OFF）',
    '進行状況の自動セーブ'] },
  { v: '1.0', title: '初回リリース', items: [
    'ストーリー・タイムアタック・峠チャレンジ・フリードライブ',
    'ガレージ・カーショップ・チューニング',
    'クリスマスイベント、ユーロビートBGM、HUD・ミニマップ'] }
];

// ---- ボディキット（セット） ----
const BODY_KITS = [
  { id: 'street', name: 'ストリートキット', en: 'Street Kit', price: 380000, set: { front: 5, side: 1, rear: 1, wing: 1, trunk: 1 } },
  { id: 'timeattack', name: 'タイムアタックキット', en: 'Time Attack Kit', price: 1300000, set: { front: 8, side: 6, rear: 11, wing: 14, fender: 3, hood: 11 } },
  { id: 'drift', name: 'ドリフトキット', en: 'Drift Kit', price: 950000, set: { front: 11, side: 3, rear: 4, wing: 2, fender: 1, hood: 5 } },
  { id: 'vip', name: 'VIPキット', en: 'VIP Kit', price: 800000, set: { front: 9, side: 7, rear: 9, wing: 0, trunk: 3, fender: 4 } },
  { id: 'rally', name: 'ラリーキット', en: 'Rally Kit', price: 700000, set: { front: 10, side: 8, rear: 10, wing: 3, fender: 6, roof: 6, hood: 9 } },
  { id: 'gt', name: 'GTキット', en: 'GT Kit', price: 1500000, set: { front: 12, side: 9, rear: 11, wing: 10, fender: 2, hood: 10 } },
  { id: 'widebody', name: 'ワイドボディキット', en: 'Widebody Kit', price: 1800000, set: { front: 4, side: 3, rear: 3, wing: 17, fender: 5 } },
  { id: 'carbon', name: 'フルカーボンキット', en: 'Full Carbon Kit', price: 1400000, set: { front: 6, side: 3, rear: 5, wing: 8, hood: 1, roof: 7, trunk: 4 } },
  { id: 'drag', name: 'ゼロヨンキット', en: 'Drag Kit', price: 900000, set: { front: 14, side: 10, rear: 8, wing: 16, hood: 7 } },
  { id: 'classic', name: 'クラシックキット', en: 'Classic Kit', price: 500000, set: { front: 13, side: 0, rear: 0, wing: 12, fender: 1, hl: 1 } }
];
// ---- ヘッドライトの色 ----
const HL_COLORS = [['white', 'ホワイト', [1, 0.97, 0.9]], ['halogen', 'ハロゲン', [1, 0.88, 0.62]], ['yellow', 'イエロー', [1, 0.8, 0.22]], ['ice', 'アイスブルー', [0.8, 0.92, 1]], ['blue', 'ブルー', [0.5, 0.68, 1]], ['purple', 'パープル', [0.78, 0.5, 1]], ['green', 'グリーン', [0.5, 1, 0.55]], ['pink', 'ピンク', [1, 0.55, 0.82]], ['red', 'レッド', [1, 0.3, 0.25]], ['rainbow', 'レインボー', [1, 1, 1]]];
// ---- 消費アイテム（使うとブーストがかかる） ----
const CONSUMABLES = [
  { id: 'snack', name: 'ドリフトスナック', en: 'Drift Snack', type: 'coin', mult: 1.25, mins: 15, price: 100000, icon: 'snack', col: '#ffb030', desc: '獲得賞金 1.25倍（15分）' },
  { id: 'energy', name: 'エナジードリンク', en: 'Energy Drink', type: 'coin', mult: 1.5, mins: 30, price: 300000, icon: 'can', col: '#30d0ff', desc: '獲得賞金 1.5倍（30分）' },
  { id: 'premium', name: 'プレミアムエナジー', en: 'Premium Energy', type: 'coin', mult: 2, mins: 30, price: 900000, dia: 30, icon: 'can', col: '#ffd700', desc: '獲得賞金 2倍（30分）' },
  { id: 'mega', name: 'メガエナジー', en: 'Mega Energy', type: 'coin', mult: 2, mins: 60, dia: 60, icon: 'can', col: '#ff3a6a', desc: '獲得賞金 2倍（60分）' },
  { id: 'diacandy', name: 'ダイヤキャンディ', en: 'Diamond Candy', type: 'dia', mult: 2, mins: 30, price: 2500000, dia: 40, icon: 'candy', col: '#9ad8ff', desc: '獲得ダイヤ 2倍（30分）' },
  { id: 'diagummy', name: 'ダイヤグミ', en: 'Diamond Gummy', type: 'dia', mult: 1.5, mins: 60, price: 1800000, icon: 'candy', col: '#c0a0ff', desc: '獲得ダイヤ 1.5倍（60分）' },
  { id: 'xpcoffee', name: 'XPコーヒー', en: 'XP Coffee', type: 'xp', mult: 2, mins: 30, price: 400000, icon: 'cup', col: '#a0603a', desc: '経験値 2倍（30分）' },
  { id: 'xplatte', name: 'XPラテ', en: 'XP Latte', type: 'xp', mult: 3, mins: 30, dia: 25, icon: 'cup', col: '#e0c090', desc: '経験値 3倍（30分）' },
  { id: 'cookie', name: 'クリスマスクッキー', en: 'Christmas Cookie', type: 'xmas', mult: 2, mins: 30, price: 500000, icon: 'cookie', col: '#c8102e', desc: 'クリスマスポイント 2倍（30分）' },
  { id: 'charm', name: 'ラッキーチャーム', en: 'Lucky Charm', type: 'luck', uses: 10, price: 1500000, icon: 'charm', col: '#2fdc7a', desc: 'カードパックでレア以上が出やすくなる（10回分）' },
  { id: 'goldcharm', name: 'ゴールデンチャーム', en: 'Golden Charm', type: 'luck', uses: 25, dia: 50, icon: 'charm', col: '#ffd700', desc: 'カードパックでレア以上が出やすくなる（25回分）' },
  { id: 'allboost', name: 'オールブーストドリンク', en: 'All-Boost Drink', type: 'all', mult: 2, mins: 30, dia: 80, icon: 'can', col: '#ff6ae8', desc: '賞金・ダイヤ・経験値 すべて2倍（30分）' }
];
const CONS_BY_ID = Object.fromEntries(CONSUMABLES.map(c => [c.id, c]));
