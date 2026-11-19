// =====================================================================
// maps7.js — v3.0 新マップ（オリジナルレイアウト）
//  ・MYOJIN MOUNTAIN PASS（明神峠）: 連続ヘアピン・トンネル・駐車場/展望台のある峠
//  ・TOKYO METROPOLITAN EXPRESSWAY（東京メトロポリタン高速）: 高架・JCT・トンネル・ゲートのある都市高速
// コースは「直線/円弧」の区間リストから組み立て、2本の直線の長さを解いてループを閉じる。
// =====================================================================
function turtleCourse(segs, solve, opt = {}) {
  // segs: ['S', len, yEnd?, tag?] | ['A', R, deg(+左), yEnd?, tag?]
  const D2R = Math.PI / 180;
  const walk = (lens) => {
    let x = 0, z = 0, h = 0; const pts = [[0, 0, 0, 0]]; let dist = 0; const marks = [];
    segs.forEach((s, si) => {
      const start = dist;
      if (s[0] === 'S') { const L = lens[si] ?? s[1]; const m = Math.min(2000, Math.max(1, Math.ceil(Math.abs(L) / 8))); for (let k = 1; k <= m; k++) { x += Math.sin(h) * L / m; z += Math.cos(h) * L / m; dist += L / m; pts.push([x, 0, z, dist]); } }
      else { const R = s[1], a = s[2] * D2R, L = Math.abs(a) * R; const m = Math.max(2, Math.ceil(L / 6)); for (let k = 1; k <= m; k++) { const dh = a / m; h += dh / 2; x += Math.sin(h) * L / m; z += Math.cos(h) * L / m; h += dh / 2; dist += L / m; pts.push([x, 0, z, dist]); } }
      marks.push({ si, start, end: dist, tag: s[0] === 'S' ? s[3] : s[4], y: s[0] === 'S' ? s[2] : s[3] });
    });
    return { pts, x, z, h, dist, marks };
  };
  // 閉ループ化: 指定した2直線の長さを解く（位置は直線長に対して線形）
  const lens = {}; const [a, b] = solve; lens[a] = 0; lens[b] = 0;
  const base = walk(lens);
  const dirOf = (si) => { const l2 = Object.assign({}, lens); l2[si] = 1; const w = walk(l2); return [w.x - base.x, w.z - base.z]; };
  const da = dirOf(a), db = dirOf(b); const det = da[0] * db[1] - da[1] * db[0];
  const La = (-base.x * db[1] + base.z * db[0]) / det, Lb = (-da[0] * base.z + da[1] * base.x) / det;
  lens[a] = La; lens[b] = Lb;
  const w = walk(lens);
  // 高さ: 区間末端の目標高さを線形補間
  const keys = [[0, opt.y0 || 0]]; for (const m of w.marks) if (m.y != null) keys.push([m.end, m.y]); keys.push([w.dist, opt.y0 || 0]);
  const yAt = d => { for (let k = 1; k < keys.length; k++) if (d <= keys[k][0]) { const [d0, y0] = keys[k - 1], [d1, y1] = keys[k]; const t = d1 > d0 ? (d - d0) / (d1 - d0) : 1; return y0 + (y1 - y0) * (t * t * (3 - 2 * t)); } return opt.y0 || 0; };
  let cx = 0, cz = 0; const np = w.pts.length - 1; for (let k = 0; k < np; k++) { cx += w.pts[k][0] / np; cz += w.pts[k][2] / np; }
  const ctrl = []; for (let k = 0; k < np; k++) { const p = w.pts[k]; ctrl.push([p[0] - cx, yAt(p[3]), p[2] - cz]); }
  const tags = {}; for (const m of w.marks) if (m.tag) (tags[m.tag] = tags[m.tag] || []).push([m.start / w.dist, m.end / w.dist, m.end - m.start]);
  return { ctrl, len: w.dist, solved: [La, Lb], tags, gap: Math.hypot(w.x, w.z), turn: w.h / D2R };
}

// ---- 明神峠（オリジナルの峠レイアウト）----
const MYOJIN = turtleCourse([
  ['S', 150, 0, 'start'],           // 0 スタート/ゴール（山頂）
  ['A', 180, -30],                  // 1 高速右
  ['S', 100, -6],                   // 2
  ['A', 70, 80],                    // 3 左ミドル
  ['S', 60],                        // 4
  ['A', 40, -70],                   // 5 右タイト
  ['A', 40, 20, -18],               // 6 S字
  ['S', 230, -36, 'tunnel'],        // 7 トンネル
  ['A', 110, -90],                  // 8
  ['S', 80, -44, 'hpIn'],           // 9 ヘアピン区間へ
  ['A', 15, -180, -49],              // 10 第1ヘアピン
  ['S', 70, -56],                   // 11
  ['A', 15, 180, -61],             // 12 第2ヘアピン
  ['S', 70, -68],                   // 13
  ['A', 16, -180, -73],              // 14 第3ヘアピン
  ['S', 60, -79],                   // 15
  ['A', 15, 180, -84],             // 16 第4ヘアピン
  ['S', 90, -90],                   // 17
  ['A', 60, 90],                    // 18
  ['S', 140, -94, 'park'],          // 19 駐車場・展望台
  ['A', 90, 60],                    // 20
  ['A', 35, -60, -98],              // 21 右タイト
  ['S', 120, -100],                 // 22
  ['A', 50, 90],                    // 23 谷底ターン
  ['S', 80, -100],                  // 24 （solve）
  ['A', 50, 90, -96],               // 25
  ['S', 200, -80, 'fast'],          // 26 高速上り
  ['A', 150, 30],                   // 27
  ['A', 120, -60, -60],             // 28
  ['S', 150, -44],                  // 29
  ['A', 80, 30],                    // 30
  ['A', 45, -50],                   // 31 S字
  ['A', 45, 50, -36],               // 32
  ['S', 70],                        // 33
  ['A', 18, -180, -32],             // 34 上りヘアピン（Z）
  ['S', 60, -28],                   // 35
  ['A', 18, 180, -24],              // 36
  ['S', 200, -14],                  // 37 （solve）
  ['A', 60, 90, -4],                // 38 山頂ターン
  ['S', 170],                       // 39
  ['A', 60, 90, 0]                  // 40
], [24, 37]);

// ---- 東京メトロポリタン高速（オリジナルの都市高速レイアウト）----
const METROX = turtleCourse([
  ['S', 350, 0, 'start'],           // 0 スタート直線（ゲート）
  ['A', 150, -90, 4],               // 1
  ['S', 300, 8, 'jct1'],            // 2 JCT1（分岐）（solve）
  ['A', 55, -70, 10],               // 3 都心部S字
  ['A', 55, 70],                    // 4
  ['S', 120, 12],                   // 5
  ['A', 70, -60, 8],                // 6
  ['S', 400, 4, 'tunnel'],          // 7 トンネル
  ['A', 100, -30, 2],               // 8
  ['S', 600, 0, 'wall'],            // 9 湾岸直線（遮音壁）
  ['A', 300, -30, 8],               // 10 大きな高速カーブ
  ['S', 200, 14, 'jct2'],           // 11 JCT2
  ['A', 40, -120, 18],              // 12 タイトコーナー
  ['S', 150, 18, 'city'],           // 13 ビルの谷間
  ['A', 60, 60, 14],                // 14
  ['A', 60, -60, 10],               // 15
  ['S', 250, 6, 'city2'],           // 16 （solve）
  ['A', 120, -30, 0]                // 17
], [2, 16]);

// ---- 雷鳴峠（オリジナルの峠レイアウト：狭い道幅・5連ヘアピン・尾根の高速区間）----
const KAMINARI = turtleCourse([
  ['S', 260, 0, 'start'],           // 0 ふもとのスタート
  ['A', 120, 25],                   // 1
  ['S', 80, 6],                     // 2
  ['A', 60, -50],                   // 3
  ['A', 60, 25, 12],                // 4
  ['S', 180, 16, 'tun'],            // 5 トンネル
  ['A', 16, 180, 21],               // 6 上りZヘアピン
  ['S', 60, 27],                    // 7
  ['A', 16, -180, 33],              // 8
  ['S', 380, 46],                   // 9
  ['A', 40, -70],                   // 10 S字
  ['A', 40, 70, 54],                // 11
  ['S', 200, 60],                   // 12
  ['A', 55, -90, 66],               // 13 山頂ターン
  ['S', 120, 70, 'top'],            // 14 （solve）
  ['A', 55, -90, 68],               // 15
  ['S', 480, 62, 'ridge'],          // 16 尾根の高速ストレート（solve）
  ['A', 200, 30],                   // 17
  ['A', 200, -30, 54],              // 18
  ['S', 80, 50],                    // 19
  ['A', 60, -90, 46],               // 20 5連ヘアピンへ
  ['S', 70, 42, 'hp5'],             // 21
  ['A', 14, 180, 39],               // 22
  ['S', 60, 34],                    // 23
  ['A', 14, -180, 30],              // 24
  ['S', 60, 25],                    // 25
  ['A', 14, 180, 21],               // 26
  ['S', 60, 16],                    // 27
  ['A', 14, -180, 12],              // 28
  ['S', 60, 8],                     // 29
  ['A', 15, 180, 5],                // 30
  ['S', 70, 3],                     // 31
  ['A', 60, -90],                   // 32
  ['S', 240, 1],                    // 33
  ['A', 45, 60],                    // 34 S字
  ['A', 45, -60, 0],                // 35
  ['S', 100, 0],                    // 36
  ['A', 60, -90],                   // 37 谷底ターン
  ['S', 200, 0],                    // 38
  ['A', 60, -90, 0]                 // 39
], [16, 14]);

// ---- マップ定義 ----
{
  const T = MYOJIN.tags, M = METROX.tags, L1 = MYOJIN.len, L2 = METROX.len;
  const f1 = (tag, off, k = 0) => T[tag][k][0] + off / L1, f2 = (tag, off, k = 0) => M[tag][k][0] + off / L2;
  MAPS.push({ id: 'myojin', name: 'MYOJIN MOUNTAIN PASS', jp: '明神峠', cat: 'touge', env: 'mountain', pass: true, seed: 7101, R: 600, N: 64, ctrl: MYOJIN.ctrl, harm: [[2, 0]], hp: [], H: 0, width: 9, diff: 4, time: 'night', weather: 'clear',
    desc: '山頂からトンネルを抜け、4連ヘアピンを下って谷底へ。帰りは高速コーナーとZ字ヘアピンを登り返す本格派の峠。', unlock: null, isNew: '3.0',
    tunnels: [[f1('tunnel', 25), 180]], park: [f1('park', 15), 110], start: true,
    feats: ['4連ヘアピン', 'Z字ヘアピン', 'トンネル', '高低差 約100m', 'カーブミラー・矢印板', '駐車場・展望台'] });
  MAPS.push({ id: 'metrox', name: 'TOKYO METROPOLITAN EXPRESSWAY', jp: '東京メトロポリタン高速', cat: 'city', env: 'highway', metro: true, seed: 7202, R: 900, N: 40, ctrl: METROX.ctrl, harm: [[2, 0]], hp: [], H: 0, width: 11, diff: 3, time: 'night', weather: 'clear',
    desc: 'ビルの谷間を縫う高架、地下トンネル、湾岸の長い直線と2つのJCT。ネオンの夜景を駆け抜けるオリジナル都市高速。', unlock: null, isNew: '3.0',
    tunnels: [[f2('tunnel', 20), 360]], gates: [f2('start', 170)], walls: [[M.wall[0][0], M.wall[0][1]], [M.city2[0][0], M.city2[0][1]]], dense: [[M.city[0][0] - 0.02, M.city[0][1] + 0.04], [M.jct1[0][0], M.jct1[0][1] + 0.08]],
    jct: [{ at: f2('jct1', 180), len: 150, to: 'ベイエリア 方面', main: '都心環状 方面' }, { at: f2('jct2', 90), len: 130, to: '空港 方面', main: '都心 方面' }],
    feats: ['高架道路', 'JCT・分岐 ×2', '地下トンネル', 'ゲート', '遮音壁', 'ネオン街・高層ビル'] });
  MAP_BY_ID.myojin = MAPS[MAPS.length - 2]; MAP_BY_ID.metrox = MAPS[MAPS.length - 1];
  const K = KAMINARI.tags, L3 = KAMINARI.len;
  MAPS.push({ id: 'kaminari', name: 'KAMINARI THUNDER PASS', jp: '雷鳴峠', cat: 'touge', env: 'mountain', pass: true, seed: 7303, R: 600, N: 64, ctrl: KAMINARI.ctrl, harm: [[2, 0]], hp: [], H: 0, width: 8, diff: 5, time: 'evening', weather: 'clear',
    desc: '道幅8mの細い峠。トンネルとZ字ヘアピンを登って尾根の高速ストレートへ。最後は名物の5連ヘアピンを一気に下る上級者向けコース。', unlock: null, isNew: '3.2',
    tunnels: [[K.tun[0][0] + 15 / L3, 150]], start: true, feats: ['5連ヘアピン', 'Z字ヘアピン', 'トンネル', '尾根の高速ストレート', '道幅8m・上級者向け', '高低差 約70m'] });
  MAP_BY_ID.kaminari = MAPS[MAPS.length - 1];
}
