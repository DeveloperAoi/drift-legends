// =====================================================================
// v33.js — 日本車の作り直し（専用造形 sig・プロポーション prof）と追加、欧州車の整理
// ※実在のメーカー名・車名・デザインは使わないオリジナル車（雰囲気の近い車種として作る）
// 既存の所有車は消さない（欧州車はショップの一覧から外すだけ）
// =====================================================================
const SIG = {
  ak_raijin4: { sig: 'raijin4', prof: { nose: .40, hood: .585, deck: .705, ws: .62, rf: .50, rr: .34, rb: .19 } },
  ak_raijin5: { sig: 'raijin5', prof: { nose: .39, hood: .56, deck: .72, ws: .60, rf: .47, rr: .40, rb: .22 } },
  hk_s3: { sig: 'sakura3', prof: { nose: .44, hood: .585, deck: .685, ws: .64, rf: .535, rr: .30, rb: .17 } },
  se_tempest: { sig: 'tempest', prof: { nose: .49, hood: .62, deck: .70, ws: .655, rf: .56, rr: .26, rb: .15 } },
  hk_zephyr: { sig: 'zephyr', prof: { nose: .40, hood: .565, deck: .70, ws: .62, rf: .50, rr: .40, rb: .20 } },
  eu_rosso: { sig: 'eu_it' }, eu_toro: { sig: 'eu_it' }, eu_schwarz: { sig: 'eu_de' }, eu_bavaria: { sig: 'eu_de' }
};
// 新車（日本車）
addCar(['ak_raijin3', 'AKATSUKI', 'RAIJIN Mk.III', '1989 直6ターボ・リトラクタブルGT', 'FR', 280, 360, 1520, 245, 5, 6800, 1, 74, 80, 76, 3200000, 'gt', 4.62, 1.75, 1.31, '#c8c8cc', 1, 'i6', 2.6, 0.53, null]);
addCar(['se_tempest22', 'SEIUN', 'TEMPEST 22-R', '1998 水平対向ターボ・ワイドボディ4WDクーペ', '4WD', 300, 363, 1270, 250, 5, 7900, 1, 88, 78, 82, 9800000, 'rally', 4.37, 1.77, 1.42, '#1a3a9a', 0, 'flat4', 2.52, 0.55, null]);
Object.assign(SIG, { se_tempest22: { sig: 'tempest', prof: { nose: .49, hood: .62, deck: .70, ws: .655, rf: .56, rr: .26, rb: .15 } } });
for (const id of ['ak_raijin3', 'se_tempest22']) CAR_BY_ID[id].isNew = '3.0';
for (const [id, o] of Object.entries(SIG)) if (CAR_BY_ID[id]) Object.assign(CAR_BY_ID[id], o, { face: 1, remodel: true });
// 22-R は金色ホイールが純正
CAR_BY_ID.se_tempest22.stockWheel = 'tp_gold'; WHEEL_STYLES.push({ id: 'tp_gold', name: 'TEMPEST 純正ゴールド 5本', price: 120000, spokes: 5, rim: '#d4a83a', only: null });
CAR_BY_ID.se_tempest.stockWheel = 'tp_gold';
// 欧州車：ショップの一覧はモデルを作り込んだ5台だけに（持っている車はそのまま使える）
const EU_KEEP = ['eu_rosso', 'eu_toro', 'eu_schwarz', 'eu_bavaria', 'eu_delta'];
for (const c of CARS) if (c.maker === 'EUROPA' && !EU_KEEP.includes(c.id)) c.retired = true;
{ const _rs = UI.r_shop; UI.r_shop = function () { const keep = []; for (const c of CARS) if (c.retired) keep.push(c); for (const c of keep) CARS.splice(CARS.indexOf(c), 1);
    try { return _rs.apply(this, arguments); } finally { CARS.push(...keep); } }; }
window.__DLX = Object.assign(window.__DLX || {}, { SIG, EU_KEEP });
