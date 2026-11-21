// =====================================================================
// v64.js — v4.5：バックファイアの炎の色・ニトロの炎の色・ブローオフ音・ライトの光り方（パック）
//          シフトノブUI・ハンドル操作（設定でON/OFF、デザインはパック）・ステッカー帳
//          デイリーイベント拡張（イベント一覧・報酬タブ・チケット）
// =====================================================================
const RGB = h => hexToRgb(h);
// ---------------- バックファイアの炎・ニトロの炎 ----------------
const BF_FX = [
  ['orange', 'オレンジ', 'Orange', 'C', ['#ff7a1a', '#ffd23a']], ['red', 'レッド', 'Red', 'C', ['#ff2a1a', '#ff8a3a']], ['yellow', 'イエロー', 'Yellow', 'C', ['#ffe23a', '#fff4a0']], ['white', 'ホワイトヒート', 'White Heat', 'C', ['#ffffff', '#ffe8c8']],
  ['blue', 'ブルー', 'Blue', 'U', ['#2a7aff', '#9ad0ff']], ['green', 'グリーン', 'Green', 'U', ['#2adc5a', '#c8ff8a']], ['purple', 'パープル', 'Purple', 'U', ['#9a3aff', '#e0a0ff']], ['cyan', 'シアン', 'Cyan', 'U', ['#1ae0ff', '#c8faff']],
  ['pink', 'ピンク', 'Pink', 'R', ['#ff3a9a', '#ffb0d8']], ['lime', 'ライム', 'Lime', 'R', ['#a8ff1a', '#f0ffb0']], ['ice', 'アイス', 'Ice', 'R', ['#bfe8ff', '#ffffff']],
  ['gold', 'ゴールド', 'Gold', 'E', ['#ffb000', '#fff0a0']], ['dragon', '龍炎', 'Dragon Fire', 'E', ['#ff1a1a', '#ffd700']], ['rainbow', 'レインボー', 'Rainbow', 'E', 'rainbow'],
  ['galaxy', 'ギャラクシー', 'Galaxy', 'L', ['#5a2aff', '#ff6ae8']], ['plasma', 'プラズマ', 'Plasma', 'L', ['#3ac8ff', '#ffffff']]
];
const BF_BY = {}, NF_BY = {};
for (const [id, nm, en, r, c] of BF_FX) { BF_BY[id] = { id, nm, c }; NF_BY[id] = { id, nm, c };
  mkItem({ id: 'bf_' + id, type: 'bfflame', bfX: id, name: 'バックファイア「' + nm + '」', en: 'Backfire "' + en + '"', rarity: r, lim: 1, desc: 'アクセルを抜いたときやシフトアップのときにマフラーから出る炎の色（車ごとに設定）' });
  mkItem({ id: 'nf_' + id, type: 'nitrofx', nfX: id, name: 'ニトロの炎「' + nm + '」', en: 'Nitro Flame "' + en + '"', rarity: r, lim: 1, desc: 'ニトロを使ったときにマフラーから噴き出す炎の色（車ごとに設定）' }); }
const flameCol = (c, k) => { if (c === 'rainbow') { const h = (performance.now() / 600 + k * 0.3) % 1, q = o => 0.55 + 0.45 * Math.cos(TAU * (h + o)); return [q(0), q(0.33), q(0.66)]; } const a = RGB(c[0]), b = RGB(c[1]); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; };
const flameCss = c => c === 'rainbow' ? 'conic-gradient(#ff3a3a,#ffd23a,#3adc5a,#3ac8ff,#9a3aff,#ff3a3a)' : `linear-gradient(90deg,${c[0]},${c[1]})`;
function flameSvg(c, s = 40, nitro = false) { const g = 'fl' + Math.random().toString(36).slice(2, 7), st = c === 'rainbow' ? [['0', '#ff3a3a'], ['.35', '#ffd23a'], ['.6', '#3adc5a'], ['1', '#3ac8ff']] : [['0', c[1]], ['1', c[0]]];
  return `<svg viewBox="0 0 48 48" width="${s}" height="${s}"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0">${st.map(([o, cc]) => `<stop offset="${o}" stop-color="${cc}"/>`).join('')}</linearGradient></defs><rect x="2" y="18" width="14" height="12" rx="3" fill="#8a8e96" stroke="#4a4e56" stroke-width="1.5"/><ellipse cx="16" cy="24" rx="2" ry="5" fill="#2a2c30"/>${nitro ? `<path d="M17 18 L46 22 L46 26 L17 30 Z" fill="url(#${g})"/><path d="M17 21 L40 24 L17 27 Z" fill="#fff" opacity=".85"/>` : `<path d="M17 19 C26 10 30 22 36 14 C34 22 44 20 46 24 C40 26 42 34 34 30 C30 38 26 28 17 29 Z" fill="url(#${g})"/><path d="M18 22 C24 20 26 24 32 22 C28 26 24 26 18 26 Z" fill="#fff" opacity=".8"/>`}</svg>`; }

// ---------------- ブローオフ音 ----------------
const BOV = [['pssh', 'クラシック・プシュー', 'Classic Pssh', 'C'], ['soft', 'ソフトリリーフ', 'Soft Relief', 'C'], ['chatter', 'フラッター', 'Flutter', 'U'], ['whistle', 'ホイッスル', 'Whistle', 'U'], ['double', 'ダブルブロー', 'Double Blow', 'R'], ['stutu', 'ストゥトゥトゥ', 'Stu-tu-tu', 'R'], ['jet', 'ロングジェット', 'Long Jet', 'E'], ['squeal', 'スクリーム', 'Scream', 'E'], ['dragon', '龍の息吹', 'Dragon Breath', 'L'], ['thunder', 'サンダーリリース', 'Thunder Release', 'L']];
const BOV_BY = {}; for (const [id, nm, en, r] of BOV) { BOV_BY[id] = { id, nm }; mkItem({ id: 'bov_' + id, type: 'bov', bovX: id, name: 'ブローオフ音「' + nm + '」', en: 'Blow-off "' + en + '"', rarity: r, lim: 1, desc: 'アクセルを抜いたときの「プシュー」の音（ターボ車以外でも鳴ります・車ごとに設定）' }); }
AUDIO.bovPlay = function (id) { if (!this.ok) return; const B = this.engineBus, nb = (d, f, q, v, w = 0, t = 'bandpass') => this.noiseBurst(d, f, q, v, w, t, B), tn = (f, d, ty, v, w = 0, sl = 0) => this.tone(f, d, ty, v, w, sl, B);
  switch (id) { case 'pssh': nb(0.4, 2600, 1.2, 0.2); nb(0.3, 5200, 0.8, 0.08, 0.03, 'highpass'); break; case 'soft': nb(0.55, 1600, 0.9, 0.13); break;
    case 'chatter': for (let i = 0; i < 7; i++) nb(0.04, 1700 + i * 60, 2.2, 0.13, i * 0.035); break; case 'whistle': nb(0.35, 2600, 1.2, 0.12); tn(2400, 0.45, 'sine', 0.05, 0, -0.4); break;
    case 'double': nb(0.25, 2800, 1.2, 0.18); nb(0.3, 2400, 1.2, 0.16, 0.22); break; case 'stutu': for (let i = 0; i < 4; i++) { nb(0.06, 1200, 2.5, 0.16, i * 0.09); tn(240 - i * 20, 0.05, 'square', 0.05, i * 0.09); } break;
    case 'jet': nb(0.9, 3400, 0.6, 0.18); nb(0.7, 7000, 0.8, 0.06, 0.05, 'highpass'); break; case 'squeal': nb(0.35, 3000, 1.2, 0.14); tn(3200, 0.35, 'sawtooth', 0.025, 0, 0.6); break;
    case 'dragon': nb(0.7, 900, 0.7, 0.22); tn(110, 0.6, 'sawtooth', 0.07, 0, -0.5); nb(0.5, 4000, 1, 0.07, 0.1, 'highpass'); break; case 'thunder': nb(0.25, 3000, 1.2, 0.2); nb(0.6, 300, 0.7, 0.3, 0.05, 'lowpass'); tn(55, 0.5, 'sine', 0.2, 0.05, -0.3); break; } };
AUDIO.bfPop = function () { if (!this.ok) return; const B = this.engineBus; this.noiseBurst(0.07, 500, 1, 0.3, 0, 'lowpass', B); this.tone(70, 0.06, 'square', 0.12, 0, 0, B); this.noiseBurst(0.05, 900, 1, 0.18, 0.08, 'lowpass', B); this.noiseBurst(0.04, 1400, 1, 0.1, 0.16, 'bandpass', B); };

// ---------------- ライトの光り方（ヘッドライト／テールランプ） ----------------
const LFX = [
  ['h', 'pulse', 'パルス', 'Pulse', 'C', 80000], ['h', 'breath', 'ブリージング', 'Breathing', 'C', 120000], ['h', 'strobe', 'ストロボ', 'Strobe', 'U', 250000], ['h', 'flicker', 'ネオンのちらつき', 'Neon Flicker', 'U', 300000],
  ['h', 'police', 'ポリス（赤青）', 'Police (Red/Blue)', 'R'], ['h', 'heart', 'ハートビート', 'Heartbeat', 'R'], ['h', 'rainbow', 'レインボー', 'Rainbow', 'E'], ['h', 'aurora', 'オーロラ', 'Aurora', 'E'], ['h', 'galaxy', 'ギャラクシー', 'Galaxy', 'L'],
  ['t', 'tpulse', 'テール・パルス', 'Tail Pulse', 'C', 80000], ['t', 'tbreath', 'テール・ブリージング', 'Tail Breathing', 'C', 120000], ['t', 'tstrobe', 'テール・ストロボ', 'Tail Strobe', 'U', 250000],
  ['t', 'theart', 'テール・ハートビート', 'Tail Heartbeat', 'R'], ['t', 'tflash', '3連フラッシュ', 'Triple Flash', 'R'], ['t', 'train', 'テール・レインボー', 'Tail Rainbow', 'E'], ['t', 'tember', '残り火', 'Ember Glow', 'L']
];
const LFX_BY = {}; for (const [p, id, nm, en, r, price] of LFX) { LFX_BY[id] = { p, id, nm, price }; mkItem({ id: 'lf_' + id, type: 'lightfx', lfX: id, part: p, name: (p === 'h' ? 'ヘッドライト「' : 'テールランプ「') + nm + '」', en: (p === 'h' ? 'Headlight "' : 'Taillight "') + en + '"', rarity: r, lim: 1, desc: (p === 'h' ? 'ヘッドライト' : 'テールランプ') + 'の光り方（車ごとに設定）' + (price ? '・カスタマイズでも購入できます' : '') }); }
function lfxVal(id, t, brake) { const s = Math.sin; switch (id) {
  case 'pulse': case 'tpulse': return [0.55 + 0.45 * s(t * 6), null]; case 'breath': case 'tbreath': return [0.35 + 0.65 * (0.5 + 0.5 * s(t * 1.8)) ** 2, null];
  case 'strobe': case 'tstrobe': return [(t * 8 % 1) < 0.35 ? 1.3 : 0.15, null]; case 'flicker': return [Math.random() < 0.08 ? 0.15 : 1, [0.6 + 0.4 * s(t), 0.95, 1]];
  case 'police': { const a = (t * 3 % 1) < 0.5; return [1.2, a ? [1, 0.15, 0.15] : [0.2, 0.4, 1]]; } case 'heart': case 'theart': { const p = t * 1.3 % 1; return [p < 0.1 || (p > 0.2 && p < 0.3) ? 1.4 : 0.35, null]; }
  case 'rainbow': case 'train': { const h = t * 0.3 % 1, q = o => 0.55 + 0.45 * Math.cos(TAU * (h + o)); return [1.1, [q(0), q(0.33), q(0.66)]]; }
  case 'aurora': return [1, [0.3 + 0.3 * s(t * 0.9), 0.9, 0.7 + 0.3 * s(t * 0.6 + 1)]]; case 'galaxy': { const k = 0.5 + 0.5 * s(t * 1.4); return [0.9 + 0.4 * Math.random() * 0.3, [lerp(0.45, 1, k), lerp(0.25, 0.4, k), 1]]; }
  case 'tflash': { const p = t * 0.8 % 1; return [brake ? 1 : (p < 0.06 || (p > 0.12 && p < 0.18) || (p > 0.24 && p < 0.3) ? 1.6 : 0.3), null]; }
  case 'tember': return [0.5 + 0.35 * s(t * 2.3) + 0.15 * s(t * 5.1), [1, 0.35 + 0.15 * s(t * 1.7), 0.05]]; } return [1, null]; }
{ const _bm = buildCarModel; buildCarModel = function (R, car, look, opts = {}) { const m = _bm.apply(this, arguments); const lh = look && look.lfH && LFX_BY[look.lfH] ? look.lfH : '', lt = look && look.lfT && LFX_BY[look.lfT] ? look.lfT : ''; if (!lh && !lt || !m) return m;
    let bh = m.headMat.emis, bt = m.brakeMat.emis, br = false; const th = m.headMat.tint ? m.headMat.tint.slice() : [1, 1, 1], tt = m.brakeMat.tint ? m.brakeMat.tint.slice() : [1, 1, 1];
    const _sl = m.setLights, _sb = m.setBrake, _up = m.update;
    m.setLights = function (on) { _sl.call(this, on); bh = this.headMat.emis; bt = this.brakeMat.emis; }; m.setBrake = function (v) { _sb.call(this, v); bt = this.brakeMat.emis; br = !!v; };
    m.update = function (dt, st) { _up.call(this, dt, st); const t = performance.now() / 1000;
      if (lh) { const [k, c] = lfxVal(lh, t, false); this.headMat.emis = Math.max(0.15, bh) * k * (this.lightsOn ? 1 : 3); if (c) this.headMat.tint = c; else this.headMat.tint = th; }
      if (lt) { const [k, c] = lfxVal(lt, t, br); this.brakeMat.emis = Math.max(0.5, bt) * k; if (c) this.brakeMat.tint = c; else this.brakeMat.tint = tt; } };
    return m; }; }

// ---------------- シフトノブ・ハンドル（デザイン） ----------------
const KNOBS = [['std', '純正ノブ', 'Stock Knob', '', '#2a2c30', '#8a8e96', 'ball'], ['black', 'ブラックボール', 'Black Ball', 'C', '#111114', '#5a5e66', 'ball'], ['white', 'ホワイトボール', 'White Ball', 'C', '#f4f4f4', '#9aa0a8', 'ball'], ['wood', 'ウッドノブ', 'Wood Knob', 'C', '#8a5428', '#c88a50', 'ball'],
  ['carbon', 'カーボンノブ', 'Carbon Knob', 'U', '#18181b', '#4a4c52', 'tall'], ['chrome', 'クロームしずく', 'Chrome Teardrop', 'U', '#c8ccd2', '#ffffff', 'drop'], ['eight', 'エイトボール', 'Eight Ball', 'U', '#0a0a0c', '#ffffff', 'eight'],
  ['crystal', 'クリスタル', 'Crystal', 'R', '#9ad8ff', '#ffffff', 'gem'], ['skull', 'スカル', 'Skull', 'R', '#f0ece0', '#2a2c30', 'skull'], ['neon', 'ネオン', 'Neon', 'R', '#0a1a22', '#3af0ff', 'ball'],
  ['katana', '日本刀のつか', 'Katana Hilt', 'E', '#1a1a1e', '#c8a040', 'katana'], ['seq', 'シーケンシャル', 'Sequential', 'E', '#2a2c30', '#e10600', 'seq'], ['gold', 'ゴールド', 'Gold', 'L', '#d4af37', '#fff4c8', 'gem'], ['dragon', '龍の玉', 'Dragon Orb', 'L', '#2fbf71', '#ffd700', 'orb']];
const KNOB_BY = {}; for (const [id, nm, en, r, c1, c2, sh] of KNOBS) { KNOB_BY[id] = { id, nm, c1, c2, sh }; if (r) mkItem({ id: 'knob_' + id, type: 'knob', knobX: id, name: 'シフトノブ「' + nm + '」', en: 'Shift Knob "' + en + '"', rarity: r, lim: 1, desc: 'レース画面のシフトノブUIのデザイン（設定でシフトノブUIをONにすると表示）' }); }
const STEERS = [['std', '純正ハンドル', 'Stock Wheel', '', '#2a2c30', '#5a5e66', 'round'], ['sport', 'スポーツ', 'Sport', 'C', '#1a1a1e', '#e10600', 'round'], ['wood', 'ウッドクラシック', 'Wood Classic', 'C', '#8a5428', '#c8ccd2', 'classic'], ['suede', 'ラリースエード', 'Rally Suede', 'C', '#3a3c42', '#ffcf3d', 'round'],
  ['flat', 'Dシェイプ', 'D-Shape', 'U', '#18181b', '#3ac8ff', 'flat'], ['deep', 'ディープコーン', 'Deep Dish', 'U', '#141416', '#c8ccd2', 'deep'], ['carbon', 'カーボン', 'Carbon', 'U', '#141416', '#8a8e96', 'flat'],
  ['yoke', 'バタフライ', 'Yoke', 'R', '#1a1a1e', '#ff8a2a', 'yoke'], ['neon', 'ネオンリング', 'Neon Ring', 'R', '#0a1a22', '#3af0ff', 'round'], ['f1', 'フォーミュラ', 'Formula', 'E', '#18181b', '#2adc5a', 'f1'],
  ['gold', 'ゴールド', 'Gold', 'E', '#d4af37', '#2a2418', 'classic'], ['dragon', '龍のハンドル', 'Dragon Wheel', 'L', '#c8102e', '#ffd700', 'deep'], ['hyper', 'ハイパーカー', 'Hypercar', 'L', '#1d3f8f', '#e8ecf2', 'flat']];
const STEER_BY = {}; for (const [id, nm, en, r, c1, c2, sh] of STEERS) { STEER_BY[id] = { id, nm, c1, c2, sh }; if (r) mkItem({ id: 'stw_' + id, type: 'steerw', swX: id, name: 'ハンドル「' + nm + '」', en: 'Steering Wheel "' + en + '"', rarity: r, lim: 1, desc: 'ハンドル操作UIのデザイン（設定でハンドル操作をONにすると表示）' }); }
const curKnob = () => { const k = SAVE.data.knobX; return KNOB_BY[k] && (k === 'std' || invHas('knob_' + k)) ? KNOB_BY[k] : KNOB_BY.std; };
const curSteer = () => { const k = SAVE.data.swX; return STEER_BY[k] && (k === 'std' || invHas('stw_' + k)) ? STEER_BY[k] : STEER_BY.std; };
function knobSvg(id, s = 60) { const K = KNOB_BY[id] || KNOB_BY.std, a = K.c1, b = K.c2, g = 'kn' + id + s; let top;
  const grad = `<defs><radialGradient id="${g}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${b}"/><stop offset=".5" stop-color="${a}"/><stop offset="1" stop-color="${a}"/></radialGradient></defs>`;
  switch (K.sh) { case 'tall': top = `<rect x="18" y="8" width="24" height="34" rx="11" fill="url(#${g})"/>`; break; case 'drop': top = `<path d="M30 6 C44 18 44 34 30 40 C16 34 16 18 30 6Z" fill="url(#${g})" stroke="#888"/>`; break;
    case 'eight': top = `<circle cx="30" cy="24" r="17" fill="url(#${g})"/><circle cx="30" cy="22" r="7" fill="#fff"/><text x="30" y="26" font-size="10" font-weight="900" text-anchor="middle" fill="#111" font-family="Arial">8</text>`; break;
    case 'gem': top = `<path d="M30 6 L46 20 L30 42 L14 20Z" fill="url(#${g})" stroke="#fff" stroke-width="1"/><path d="M14 20 H46 M30 6 V42" stroke="#fff" opacity=".5"/>`; break;
    case 'skull': top = `<path d="M14 22 a16 16 0 0 1 32 0 v8 l-5 3 v6 h-22 v-6 l-5 -3z" fill="url(#${g})"/><circle cx="24" cy="24" r="4.5" fill="${b}"/><circle cx="36" cy="24" r="4.5" fill="${b}"/>`; break;
    case 'katana': top = `<rect x="22" y="4" width="16" height="38" rx="4" fill="${a}"/>${[8, 16, 24, 32].map(y => `<path d="M22 ${y} L38 ${y + 6} M38 ${y} L22 ${y + 6}" stroke="${b}" stroke-width="2"/>`).join('')}<rect x="16" y="38" width="28" height="5" rx="2" fill="${b}"/>`; break;
    case 'seq': top = `<rect x="20" y="6" width="20" height="36" rx="6" fill="url(#${g})"/><path d="M26 14 l4 -4 4 4 M26 32 l4 4 4 -4" stroke="${b}" stroke-width="2.5" fill="none"/><text x="30" y="27" font-size="8" font-weight="900" text-anchor="middle" fill="#fff" font-family="Arial">+/-</text>`; break;
    case 'orb': top = `<circle cx="30" cy="24" r="16" fill="url(#${g})"/><path d="M18 22 q12 -12 24 0 q-12 8 -24 0" fill="${b}" opacity=".8"/>`; break;
    default: top = `<circle cx="30" cy="24" r="17" fill="url(#${g})"/>${id === 'neon' ? `<circle cx="30" cy="24" r="17" fill="none" stroke="${b}" stroke-width="2.5"/>` : ''}<text x="30" y="20" font-size="6" font-weight="900" text-anchor="middle" fill="${b}" font-family="Arial" opacity=".9">1 3 5</text><text x="30" y="31" font-size="6" font-weight="900" text-anchor="middle" fill="${b}" font-family="Arial" opacity=".9">2 4 R</text>`; }
  return `<svg viewBox="0 0 60 90" width="${s}" height="${s * 1.5}">${grad}<path d="M10 90 Q14 56 24 44 H36 Q46 56 50 90Z" fill="#1a1a1c"/>${[52, 60, 68, 76, 84].map(y => `<path d="M${16 + (y - 52) * -0.15} ${y} Q30 ${y + 4} ${44 + (y - 52) * 0.15} ${y}" stroke="#2c2c30" stroke-width="2" fill="none"/>`).join('')}<rect x="27" y="38" width="6" height="10" fill="#6a6e76"/>${top}</svg>`; }
function steerSvg(id, s = 120) { const K = STEER_BY[id] || STEER_BY.std, a = K.c1, b = K.c2; const sp = `<path d="M60 60 L22 64 M60 60 L98 64 M60 60 L60 100" stroke="${a}" stroke-width="12" stroke-linecap="round"/><circle cx="60" cy="60" r="16" fill="${a}" stroke="${b}" stroke-width="2"/>`;
  let rim; switch (K.sh) { case 'flat': rim = `<path d="M60 10 A50 50 0 0 1 108 74 L96 100 H24 L12 74 A50 50 0 0 1 60 10Z" fill="none" stroke="${a}" stroke-width="12"/><path d="M50 12 h20" stroke="${b}" stroke-width="12"/>`; break;
    case 'yoke': rim = `<path d="M14 40 Q14 22 30 26 L90 26 Q106 22 106 40 L106 80 Q106 98 92 98 L80 90 H40 L28 98 Q14 98 14 80Z" fill="none" stroke="${a}" stroke-width="12"/><path d="M14 52 v16 M106 52 v16" stroke="${b}" stroke-width="13"/>`; break;
    case 'f1': rim = `<rect x="8" y="34" width="104" height="56" rx="16" fill="${a}"/><rect x="34" y="44" width="52" height="24" rx="4" fill="#0a0a0c"/><text x="60" y="61" font-size="14" font-weight="900" text-anchor="middle" fill="${b}" font-family="Arial">3</text>${[18, 26, 94, 102].map((x, k) => `<circle cx="${x}" cy="${k % 2 ? 78 : 50}" r="4" fill="${['#e10600', '#ffcf3d', '#3ac8ff', b][k]}"/>`).join('')}<path d="M8 50 v24 M112 50 v24" stroke="${b}" stroke-width="6"/>`; return `<svg viewBox="0 0 120 120" width="${s}" height="${s}">${rim}</svg>`;
    case 'classic': rim = `<circle cx="60" cy="60" r="50" fill="none" stroke="${a}" stroke-width="9"/>${[0, 1, 2].map(k => `<path d="M60 60 L${60 + Math.cos(k * 2.094 - 1.57) * 48} ${60 + Math.sin(k * 2.094 - 1.57) * 48}" stroke="${b}" stroke-width="5"/>`).join('')}`; return `<svg viewBox="0 0 120 120" width="${s}" height="${s}">${rim}<circle cx="60" cy="60" r="12" fill="${b}"/></svg>`;
    case 'deep': rim = `<circle cx="60" cy="60" r="52" fill="none" stroke="${a}" stroke-width="12"/><circle cx="60" cy="60" r="38" fill="none" stroke="${b}" stroke-width="2" opacity=".6"/><path d="M54 8 h12" stroke="${b}" stroke-width="12"/>`; break;
    default: rim = `<circle cx="60" cy="60" r="50" fill="none" stroke="${a}" stroke-width="12"/><path d="M54 10 h12" stroke="${b}" stroke-width="12"/>${id === 'neon' ? `<circle cx="60" cy="60" r="50" fill="none" stroke="${b}" stroke-width="2.5"/>` : ''}`; }
  return `<svg viewBox="0 0 120 120" width="${s}" height="${s}">${rim}${sp}</svg>`; }

// ---------------- ステッカー帳 ----------------
const BOOK_MAPS = () => MAPS.filter(m => !m.xmas && m.cat !== 'event' && m.cat !== 'drag');
const BSTK = [['sun', '日の出', 'Sunrise', 'C'], ['wave', '大波', 'Big Wave', 'C'], ['fuji', '富士', 'Mt. Fuji', 'C'], ['cat', '走り屋ねこ', 'Racer Cat', 'C'], ['bolt', 'イナズマ', 'Lightning', 'C'],
  ['tire', 'タイヤ痕', 'Tire Marks', 'U'], ['flag', 'チェッカー', 'Checkered', 'U'], ['wing', 'ウイング', 'Wing', 'U'], ['turbo', 'ターボ', 'Turbo', 'U'], ['moon', '月夜', 'Moonlit Night', 'U'],
  ['fox', 'きつね', 'Fox', 'R'], ['koi', '鯉', 'Koi', 'R'], ['torii', '鳥居', 'Torii', 'R'], ['piston', 'ピストン', 'Piston', 'R'], ['sakura', '夜桜', 'Night Sakura', 'R'],
  ['tiger', '虎', 'Tiger', 'E'], ['crane', '鶴', 'Crane', 'E'], ['oni', '鬼', 'Oni', 'E'], ['rocket', 'ロケット', 'Rocket', 'E'],
  ['dragon', '昇り龍', 'Rising Dragon', 'L'], ['phoenix', '鳳凰', 'Phoenix', 'L'], ['crown', '王冠', 'Crown', 'L'], ['galaxy', '銀河', 'Galaxy', 'L'], ['legend', 'レジェンド', 'Legend', 'L']];
const BSTK_BY = {}; for (const [id, nm, en, r] of BSTK) { BSTK_BY[id] = { id, nm, r }; mkItem({ id: 'bstk_' + id, type: 'bookstk', bsX: id, name: 'スペシャルステッカー「' + nm + '」', en: 'Special Sticker "' + en + '"', rarity: r, lim: 1, desc: 'ステッカー帳のスペシャルページに貼られるステッカー' }); }
function bstkSvg(id, s = 64) { const R0 = (BSTK_BY[id] || {}).r || 'C', rc = RCOL(R0); const ic = {
  sun: '<circle cx="32" cy="34" r="12" fill="#ff5a1a"/><path d="M8 46 h48" stroke="#ff5a1a" stroke-width="3"/>', wave: '<path d="M8 40 q8 -16 18 -8 q-6 -12 10 -12 q14 2 18 20 q-12 -6 -16 4 q-8 -6 -14 2 q-8 -4 -16 -6z" fill="#1a6aff"/>',
  fuji: '<path d="M6 48 L26 18 L32 22 L38 18 L58 48z" fill="#3a5aa8"/><path d="M22 24 L26 18 L32 22 L38 18 L42 24 L36 26 L32 23 L28 26z" fill="#fff"/>', cat: '<circle cx="32" cy="34" r="14" fill="#222"/><path d="M20 24 l2 -10 7 7z M44 24 l-2 -10 -7 7z" fill="#222"/><circle cx="27" cy="33" r="2.5" fill="#ffd23a"/><circle cx="37" cy="33" r="2.5" fill="#ffd23a"/><path d="M14 44 h36" stroke="#e10600" stroke-width="4"/>',
  bolt: '<path d="M36 8 L18 36 H30 L26 56 L46 26 H34z" fill="#ffd23a" stroke="#c88a00" stroke-width="2"/>', tire: '<path d="M14 54 q10 -40 20 -46 M30 56 q8 -40 20 -46" stroke="#222" stroke-width="7" stroke-dasharray="4 3" fill="none"/>',
  flag: [0, 1, 2, 3].map(x => [0, 1, 2].map(y => (x + y) % 2 ? `<rect x="${16 + x * 8}" y="${20 + y * 8}" width="8" height="8" fill="#111"/>` : '').join('')).join('') + '<rect x="16" y="20" width="32" height="24" fill="none" stroke="#111" stroke-width="1.5"/>',
  wing: '<path d="M8 26 h48 v6 h-48z M14 32 v12 M50 32 v12" stroke="#e10600" stroke-width="3" fill="#e10600"/>', turbo: '<circle cx="32" cy="32" r="16" fill="#c8ccd2" stroke="#6a6e76" stroke-width="2"/>' + Array.from({ length: 8 }, (_, k) => `<path d="M32 32 q7 -5 3 -14" stroke="#4a4e56" stroke-width="2.5" fill="none" transform="rotate(${k * 45} 32 32)"/>`).join(''),
  moon: '<path d="M38 12 a20 20 0 1 0 14 32 a16 16 0 0 1 -14 -32z" fill="#ffe28a"/>', fox: '<path d="M12 16 L24 26 L32 22 L40 26 L52 16 L46 40 L32 52 L18 40z" fill="#ff8a2a"/><path d="M22 36 L32 46 L42 36 L32 40z" fill="#fff"/>',
  koi: '<path d="M10 32 q14 -16 32 -4 l10 -8 v24 l-10 -8 q-18 12 -32 -4z" fill="#ff5a1a"/><circle cx="18" cy="30" r="2" fill="#111"/><path d="M24 26 q6 6 12 0" fill="#fff"/>', torii: '<path d="M8 18 h48 M12 24 h40 M18 18 v34 M46 18 v34" stroke="#e10600" stroke-width="5"/>',
  piston: '<rect x="20" y="12" width="24" height="18" rx="2" fill="#c8ccd2" stroke="#6a6e76" stroke-width="2"/><path d="M28 30 l-2 18 h12 l-2 -18" fill="#9aa0a8"/>', sakura: [0, 72, 144, 216, 288].map(a => `<ellipse cx="32" cy="18" rx="7" ry="11" fill="#ffb0c8" transform="rotate(${a} 32 32)"/>`).join('') + '<circle cx="32" cy="32" r="4" fill="#ff5a8a"/>',
  tiger: '<circle cx="32" cy="32" r="16" fill="#ff9a1a"/>' + [[-8, 0], [0, -4], [8, 0]].map(([x, y]) => `<path d="M${32 + x} ${18 + y} v10" stroke="#111" stroke-width="3"/>`).join('') + '<circle cx="26" cy="32" r="2" fill="#111"/><circle cx="38" cy="32" r="2" fill="#111"/>',
  crane: '<path d="M10 40 q22 -30 44 -10 q-12 -2 -20 8 q-10 -10 -24 2z" fill="#fff" stroke="#888"/><circle cx="46" cy="22" r="3" fill="#e10600"/>', oni: '<circle cx="32" cy="34" r="16" fill="#c8102e"/><path d="M20 20 l4 -10 4 8 M44 20 l-4 -10 -4 8" fill="#ffd23a" stroke="#ffd23a" stroke-width="2"/><path d="M24 42 h16" stroke="#fff" stroke-width="3"/>',
  rocket: '<path d="M32 8 q12 12 8 32 h-16 q-4 -20 8 -32z" fill="#e8ecf2" stroke="#888"/><circle cx="32" cy="24" r="4" fill="#3ac8ff"/><path d="M26 40 l6 14 6 -14z" fill="#ff6a1a"/>',
  dragon: '<path d="M8 48 q8 -30 24 -20 q14 8 24 -16 q2 26 -18 30 q-14 2 -30 6z" fill="#2fbf71" stroke="#ffd23a" stroke-width="2"/>', phoenix: '<path d="M32 10 q20 10 16 30 q-8 -10 -16 -4 q-8 -6 -16 4 q-4 -20 16 -30z" fill="#ff5a1a" stroke="#ffd23a" stroke-width="2"/><path d="M32 36 v16" stroke="#ffd23a" stroke-width="3"/>',
  crown: '<path d="M10 44 V20 L22 32 L32 14 L42 32 L54 20 V44z" fill="#ffcf3d" stroke="#c88a00" stroke-width="2"/>', galaxy: '<ellipse cx="32" cy="32" rx="22" ry="10" fill="#5a2aff" transform="rotate(-20 32 32)"/><circle cx="32" cy="32" r="6" fill="#fff"/>' + [[14, 16], [50, 18], [48, 48], [16, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5" fill="#fff"/>`).join(''),
  legend: '<path d="M32 8 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2z" fill="#ffcf3d" stroke="#fff" stroke-width="2"/><text x="32" y="38" font-size="8" font-weight="900" text-anchor="middle" fill="#7a4a00" font-family="Arial">DL</text>' }[id] || '';
  return `<svg viewBox="0 0 64 64" width="${s}" height="${s}"><path d="M6 6 h52 v52 h-52z" fill="#fff" stroke="${rc}" stroke-width="3" transform="rotate(-3 32 32)"/>${ic}</svg>`; }
function courseStkSvg(m, tier, s = 64) { const pal = { mountain: ['#2a6a3a', '#a8e08a'], highway: ['#1a2a5a', '#6ab0ff'], city: ['#3a1a5a', '#ff6ae8'], port: ['#1a3a4a', '#5ad1ff'], industrial: ['#3a2a1a', '#ff9a3a'], coast: ['#0a4a6a', '#ffd23a'], circuit: ['#3a0a0a', '#ff4a3a'], lot: ['#2a2c30', '#c8ccd2'] }[m.env] || ['#2a2c30', '#fff'];
  const ring = ['#b8bcc4', '#b8bcc4', '#e8ecf2', '#ffcf3d'][tier] || '#555', nm = (m.jp || '').replace(/（.*）/, '').slice(0, 7);
  return `<svg viewBox="0 0 64 64" width="${s}" height="${s}"><circle cx="32" cy="32" r="29" fill="${pal[0]}" stroke="${ring}" stroke-width="${tier >= 3 ? 4 : 3}"/><path d="M8 40 L20 26 L28 34 L38 20 L56 40 Z" fill="${pal[1]}" opacity=".85"/><path d="M10 44 Q32 52 54 44" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="3 3"/><text x="32" y="${nm.length > 5 ? 17 : 18}" font-size="${nm.length > 5 ? 7 : 9}" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif">${esc(nm)}</text>${tier >= 2 ? `<text x="32" y="58" font-size="7" font-weight="900" text-anchor="middle" fill="${ring}" font-family="Arial">${tier >= 3 ? 'GOLD' : 'SILVER'}</text>` : ''}</svg>`; }
const STK_TIER = [0, 1, 5, 15]; // 完走回数：ノーマル・シルバー・ゴールド
const stkCnt = id => ((SAVE.data.stkBook || {})[id] || 0), stkTier = id => { const n = stkCnt(id); return n >= 15 ? 3 : n >= 5 ? 2 : n >= 1 ? 1 : 0; };
const BOOK_RW = [[25, ['dia', 20]], [50, ['dia', 40]], [75, ['money', 2000000]], [100, ['dia', 150]]];
function bookPct() { const ms = BOOK_MAPS(), tot = ms.length * 3 + BSTK.length; let got = 0; for (const m of ms) got += stkTier(m.id); got += BSTK.filter(b => invHas('bstk_' + b[0])).length; return Math.floor(got / tot * 100); }
mkItem({ id: 'tt45_book', type: 'title', name: '称号「ステッカーマスター」', en: 'Title "Sticker Master"', rarity: 'L', lim: 1, title: 'ステッカーマスター', titleEn: 'Sticker Master', desc: 'ステッカー帳を100%にするともらえる称号' });

// ---------------- パック（ドライビングギア） ----------------
Object.assign(ITEM_TYPES, { bfflame: 'バックファイアの炎', nitrofx: 'ニトロの炎', bov: 'ブローオフ音', lightfx: 'ライトの光り方', knob: 'シフトノブ', steerw: 'ハンドル', bookstk: 'スペシャルステッカー' });
Object.assign(NEWPOOL, { bov: 'bov', lightfx: 'lightfx', knob: 'knob', steerw: 'steerw', bookstk: 'bookstk' });
CHESTS.push({ id: 'flamepack', name: 'フレイムパック', price: 1200000, odds: { C: 32, U: 32, R: 21, E: 11, L: 4 }, color: '#ff6a1a', pool: 'flame' },
  { id: 'bovpack', name: 'ブローオフ音パック', price: 1000000, odds: { C: 32, U: 32, R: 21, E: 11, L: 4 }, color: '#3ac8ff', pool: 'bov' },
  { id: 'lightpack', name: 'ライトパターンパック', price: 1100000, odds: { C: 32, U: 32, R: 21, E: 11, L: 4 }, color: '#ffe23a', pool: 'lightfx' },
  { id: 'knobpack', name: 'シフトノブパック', price: 800000, odds: { C: 34, U: 32, R: 20, E: 10, L: 4 }, color: '#c8ccd2', pool: 'knob' },
  { id: 'steerpack', name: 'ハンドルパック', price: 900000, odds: { C: 34, U: 32, R: 20, E: 10, L: 4 }, color: '#e10600', pool: 'steerw' },
  { id: 'stickerpack', name: 'ステッカー帳パック', price: 600000, odds: { C: 36, U: 30, R: 20, E: 10, L: 4 }, color: '#ff6ae8', pool: 'bookstk' });
Object.assign(PACK_ART, { flamepack: { a: '#2a0a00', b: '#ff6a1a', t: 'FLAMES' }, bovpack: { a: '#06202a', b: '#3ac8ff', t: 'BLOW-OFF' }, lightpack: { a: '#2a2400', b: '#ffe23a', t: 'LIGHTS' }, knobpack: { a: '#1a1c20', b: '#c8ccd2', t: 'SHIFT KNOBS' }, steerpack: { a: '#2a0404', b: '#e10600', t: 'WHEELS' }, stickerpack: { a: '#2a0624', b: '#ff6ae8', t: 'STICKERS' } });
Object.assign(PACK_TIER, { flamepack: 3, bovpack: 3, lightpack: 3, knobpack: 2, steerpack: 2, stickerpack: 2 });
{ const _pp = packPool; packPool = function (c, rar) { if (c.pool === 'flame') return ITEMS.filter(i => (i.type === 'bfflame' || i.type === 'nitrofx') && i.rarity === rar); return _pp(c, rar).filter(i => i.type !== 'bfflame' && i.type !== 'nitrofx'); }; }
const bovSvg = (s = 40, c = '#3ac8ff') => `<svg viewBox="0 0 48 48" width="${s}" height="${s}"><rect x="8" y="14" width="18" height="22" rx="4" fill="#9aa0a8" stroke="#4a4e56" stroke-width="2"/><rect x="12" y="8" width="10" height="7" rx="2" fill="#6a6e76"/><path d="M26 22 h6 v6 h-6" fill="#6a6e76"/><path d="M34 18 q6 7 0 14 M38 14 q9 11 0 22 M42 10 q12 15 0 30" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
const lfxSvg = (id, s = 40) => { const L = LFX_BY[id] || {}, h = L.p !== 't', c = { police: '#3a6aff', rainbow: '#ff6ae8', aurora: '#3adca8', galaxy: '#9a5aff', train: '#ff6ae8', tember: '#ff8a1a' }[id] || (h ? '#fff4c8' : '#ff2a2a');
  return `<svg viewBox="0 0 48 48" width="${s}" height="${s}"><path d="M6 30 q2 -12 16 -12 h12 q8 0 10 8 v8 h-38z" fill="#2a2c32"/>${h ? `<path d="M34 22 h8 v6 h-8z" fill="${c}"/><path d="M42 23 l6 -3 M42 25 h6 M42 27 l6 3" stroke="${c}" stroke-width="1.5"/>` : `<path d="M6 24 h8 v6 h-8z" fill="${c}"/><path d="M6 25 l-5 -3 M6 27 h-5 M6 29 l-5 3" stroke="${c}" stroke-width="1.5"/>`}<circle cx="14" cy="34" r="5" fill="#111"/><circle cx="36" cy="34" r="5" fill="#111"/></svg>`; };
{ const _ic = itemIconSvg; itemIconSvg = function (it, size = 34) { if (!it) return _ic(it, size);
    if (it.type === 'bfflame') return flameSvg(BF_BY[it.bfX].c, size); if (it.type === 'nitrofx') return flameSvg(NF_BY[it.nfX].c, size, true); if (it.type === 'bov') return bovSvg(size, RCOL(it.rarity));
    if (it.type === 'lightfx') return lfxSvg(it.lfX, size); if (it.type === 'knob') return knobSvg(it.knobX, size * 0.62); if (it.type === 'steerw') return steerSvg(it.swX, size); if (it.type === 'bookstk') return bstkSvg(it.bsX, size); return _ic(it, size); }; }
Object.assign(COVER_SVG, {
  flamepack: `${flameSvg(BF_BY.blue.c, 46).replace('<svg ', '<svg x="6" y="10" ')}${flameSvg(BF_BY.rainbow.c, 46, true).replace('<svg ', '<svg x="44" y="34" ')}`,
  bovpack: `${bovSvg(64).replace('<svg ', '<svg x="18" y="12" ')}`, lightpack: `${lfxSvg('police', 40).replace('<svg ', '<svg x="6" y="8" ')}${lfxSvg('train', 40).replace('<svg ', '<svg x="50" y="40" ')}`,
  knobpack: `${knobSvg('crystal', 40).replace('<svg ', '<svg x="8" y="2" ')}${knobSvg('katana', 40).replace('<svg ', '<svg x="50" y="14" ')}`,
  steerpack: `${steerSvg('yoke', 44).replace('<svg ', '<svg x="6" y="10" ')}${steerSvg('deep', 40).replace('<svg ', '<svg x="50" y="36" ')}`,
  stickerpack: `${bstkSvg('dragon', 40).replace('<svg ', '<svg x="8" y="8" ')}${bstkSvg('koi', 34).replace('<svg ', '<svg x="54" y="22" ')}${bstkSvg('fuji', 30).replace('<svg ', '<svg x="26" y="52" ')}` });
{ const _sh = UI.packStoreHTML; UI.packStoreHTML = function () { let h = _sh.apply(this, arguments); for (const [id, k] of [['flamepack', 'バックファイア＆ニトロの炎'], ['bovpack', 'ターボのブローオフ音'], ['lightpack', 'ライトの光り方'], ['knobpack', 'シフトノブUIのデザイン'], ['steerpack', 'ハンドルUIのデザイン'], ['stickerpack', 'ステッカー帳のスペシャル']]) h = h.replace(new RegExp(`(data-v="${id}"[\\s\\S]*?<span class="ps-kind">)[^<]*`), `$1${k}`); return h; }; }
window.__DLX = Object.assign(window.__DLX || {}, { BF_BY, BOV_BY, LFX_BY, KNOB_BY, STEER_BY, BSTK_BY, bookPct });

// =====================================================================
// レース中：バックファイア・ニトロの炎・ブローオフ音
// =====================================================================
const curLook = g => (g && g.carInst && g.carInst.look) || {};
const ownedFx = (lk, k, pre) => lk[k] && invHas(pre + lk[k]) ? lk[k] : '';
{ const _bo = AUDIO.blowoffFor.bind(AUDIO); AUDIO.blowoffFor = function (e) { const g = UI.game; if (g && g.active && e && e === g.engine && ownedFx(curLook(g), 'bovX', 'bov_')) return; return _bo(e); }; }
{ const GP = Game.prototype, _up = GP.update; GP.update = function (dt) { _up.call(this, dt); const g = this, v = g.veh; if (!g.active || !v || g.paused) return; try { CTL.frame(g, dt); } catch (e) { }
    if (!g.started || g.cfg.replay) { g._pThr = 0; g._pGear = v.gear; return; } const lk = curLook(g), bf = ownedFx(lk, 'bfX', 'bf_'), nf = ownedFx(lk, 'nfX', 'nf_'), bov = ownedFx(lk, 'bovX', 'bov_'), red = (g.spec && g.spec.redline) || 7500;
    const thr = v.throttleOut || 0, lift = (g._pThr || 0) > 0.6 && thr < 0.15 && (g._pRpm || 0) > red * 0.55, up = v.gear > (g._pGear || 0) && (g._pGear || 0) > 0 && (g._pRpm || 0) > red * 0.6;
    if ((lift || up) && performance.now() - (g._bfLast || 0) > 250) { g._bfLast = performance.now(); if (bf) { g._bfT = 0.2; AUDIO.bfPop(); } if (lift && bov) AUDIO.bovPlay(bov); }
    g._pThr = thr; g._pGear = v.gear; g._pRpm = v.rpm;
    const m = g.model, P = g.sparks; if (!m || !P) return; const fx = Math.sin(v.heading), fz = Math.cos(v.heading), lx = Math.cos(v.heading), lz = -Math.sin(v.heading), L = m.dims.L;
    const shoot = (c, n, sp, life, size) => { for (const s of [-0.38, 0.38]) for (let k = 0; k < n; k++) { const col = flameCol(c, Math.random()); P.spawn({ x: v.x - fx * (L / 2 + 0.05) + lx * s, y: v.y + 0.3 + (Math.random() - .5) * 0.06, z: v.z - fz * (L / 2 + 0.05) + lz * s, vx: v.vx * 0.85 - fx * (sp + Math.random() * sp) + (Math.random() - .5), vy: (Math.random() - .3) * 0.8, vz: v.vz * 0.85 - fz * (sp + Math.random() * sp) + (Math.random() - .5), life: 0, max: life * (0.6 + Math.random() * 0.6), size, grow: -size * 1.5, r: col[0], g: col[1], b: col[2], a: 1 }); } };
    if (g._bfT > 0 && bf) { g._bfT -= dt; shoot(BF_BY[bf].c, 3, 3, 0.16, 0.42); }
    if (v.nitroOn && nf) shoot(NF_BY[nf].c, 2, 7, 0.2, 0.3); }; }

// =====================================================================
// シフトノブUI・ハンドル操作UI（タッチ・マウス両対応、設定でON/OFF）
// =====================================================================
const CTL = { wheel: { drag: false, val: 0, rot: 0, a0: 0, r0: 0 }, knob: null, gear: null,
  ensure() { if (document.getElementById('knobUI')) return; document.body.insertAdjacentHTML('beforeend', `<div id="knobUI" class="hidden"><div class="kn-gate"></div><div class="kn-body"><span class="kn-up">▲</span><div class="kn-k"></div><span class="kn-dn">▼</span></div></div><div id="wheelUI" class="hidden"><div class="wh-in"></div><b class="wh-v"></b></div>`);
    const k = document.getElementById('knobUI'), w = document.getElementById('wheelUI'); let y0 = null, fired = false;
    k.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); y0 = e.clientY; fired = false; try { k.setPointerCapture(e.pointerId); } catch (x) { } });
    k.addEventListener('pointermove', e => { if (y0 === null || fired) return; const dy = e.clientY - y0; if (Math.abs(dy) > 26) { fired = true; this.shift(dy < 0 ? 1 : -1); } });
    const kup = e => { if (y0 === null) return; if (!fired) { const r = k.querySelector('.kn-body').getBoundingClientRect(); this.shift(e.clientY < r.top + r.height / 2 ? 1 : -1); } y0 = null; };
    k.addEventListener('pointerup', kup); k.addEventListener('pointercancel', () => { y0 = null; });
    const W = this.wheel, ang = e => { const r = w.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
    w.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); W.drag = true; W.a0 = ang(e); W.r0 = W.rot; w.classList.add('on'); try { w.setPointerCapture(e.pointerId); } catch (x) { } });
    w.addEventListener('pointermove', e => { if (!W.drag) return; let d = ang(e) - W.a0; if (d > 180) d -= 360; if (d < -180) d += 360; W.rot = clamp(W.r0 + d, -120, 120); W.val = W.rot / 120; });
    const wup = () => { W.drag = false; w.classList.remove('on'); }; w.addEventListener('pointerup', wup); w.addEventListener('pointercancel', wup); w.addEventListener('lostpointercapture', wup);
    w.addEventListener('contextmenu', e => e.preventDefault()); k.addEventListener('contextmenu', e => e.preventDefault()); },
  shift(d) { Input.events.push(d > 0 ? 'up' : 'down'); this.anim(d); AUDIO.tap && AUDIO.tap(); if (navigator.vibrate) try { navigator.vibrate(12); } catch (x) { } },
  anim(d) { const b = document.querySelector('#knobUI .kn-k'); if (!b) return; b.classList.remove('up', 'dn'); void b.offsetWidth; b.classList.add(d > 0 ? 'up' : 'dn'); },
  frame(g, dt) { const s = SAVE.data.settings, on = g.active && !g.cfg.replay && !document.body.classList.contains('cine'); this.ensure(); const k = document.getElementById('knobUI'), w = document.getElementById('wheelUI');
    const ko = on && !!s.knobUI, wo = on && !!s.wheelUI; k.classList.toggle('hidden', !ko); w.classList.toggle('hidden', !wo); document.body.classList.toggle('wheelon', wo);
    if (ko) { const kid = curKnob().id; if (k.dataset.k !== kid) { k.dataset.k = kid; k.querySelector('.kn-k').innerHTML = knobSvg(kid, 64); }
      const v = g.veh, n = (g.spec && g.spec.ratios && g.spec.ratios.length) || 6; if (this.gear !== v.gear) { if (this.gear !== null && v.gear !== this.gear) this.anim(v.gear > this.gear ? 1 : -1); this.gear = v.gear;
        k.querySelector('.kn-gate').innerHTML = ['R', 'N'].concat(Array.from({ length: n }, (_, i) => String(i + 1))).map((t, i) => `<i class="${(i === 0 && v.gear < 0) || (i === 1 && v.gear === 0) || (i > 1 && v.gear === i - 1) ? 'on' : ''}">${t}</i>`).join(''); } }
    if (wo) { const W = this.wheel, sid = curSteer().id; if (w.dataset.k !== sid) { w.dataset.k = sid; w.querySelector('.wh-in').innerHTML = steerSvg(sid, 200); }
      if (!W.drag) { const fb = g.veh ? clamp(g.veh.steer || 0, -1, 1) * 120 : 0; W.rot += (fb - W.rot) * Math.min(1, dt * 14); W.val = 0; }
      w.querySelector('.wh-in').style.transform = `rotate(${W.rot}deg)`; } },
  hide() { for (const id of ['knobUI', 'wheelUI']) { const e = document.getElementById(id); if (e) e.classList.add('hidden'); } document.body.classList.remove('wheelon'); this.wheel.drag = false; this.wheel.val = 0; this.gear = null; }
};
{ const _rd = Input.read; Input.read = function (set) { const r = _rd.apply(this, arguments); if (CTL.wheel.drag && SAVE.data.settings.wheelUI) { r.steer = CTL.wheel.val; r.analog = true; } return r; }; }
{ const GP = Game.prototype, _ex = GP.exit; GP.exit = function () { CTL.hide(); return _ex.apply(this, arguments); }; }

// ---------------- 「飾り・小物」タブ：炎・ブローオフ・ライト・シフトノブ／ハンドル ----------------
CM_TABS.push(['flame', '炎'], ['bov', 'ブローオフ'], ['lights', 'ライト'], ['gear', 'ノブ・ハンドル']);
{ const _rc = UI.r_charm; UI.r_charm = function () { const tab = this.cmTab; if (!['flame', 'bov', 'lights', 'gear'].includes(tab)) return _rc.apply(this, arguments); $('panelTitle').textContent = 'CUSTOM'; const d = SAVE.data, inst = SAVE.cur(), car = CAR_BY_ID[inst.id]; inst.look = inst.look || defaultLook(car); const lk = inst.look; this.show.setCar(inst);
    const tabs = (this.nyTabFix ? this.nyTabFix.bind(this) : x => x)(`<div class="cm-tabs">${CM_TABS.map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-a="cmTab" data-v="${k}">${n}</button>`).join('')}</div>`);
    const nm = it => esc(it.name.replace(/^[^「]*「|」$/g, ''));
    const grid = (items, cur, key, icon, none, extra) => `<div class="cm-grid"><button class="cm-it ${!cur ? 'on' : ''}" data-a="setFx2" data-v="${key}:">${none}</button>${items.map(it => { const o = invHas(it.id), v = it[{ bfX: 'bfX', nfX: 'nfX', bovX: 'bovX', lfH: 'lfX', lfT: 'lfX', knobX: 'knobX', swX: 'swX' }[key]];
      const buy = extra && !o && LFX_BY[v] && LFX_BY[v].price; return `<button class="cm-it ${cur === v ? 'on' : ''} ${o ? '' : 'lock'}" data-a="${o ? 'setFx2' : buy ? 'buyLfx' : 'cmLocked'}" data-v="${o ? key + ':' + v : v}" style="--rc:${RCOL(it.rarity)}">${icon(it)}<b>${nm(it)}</b><small>${buy ? yen(LFX_BY[v].price) + ' で購入' : RARITY[it.rarity].name}</small>${o && (key === 'bovX') ? `<span class="cm-pv" data-a="pvBov" data-v="${v}">▶</span>` : ''}</button>`; }).join('')}</div>`;
    const hero = (svg, t, s, pack) => `<div class="cm-hero"><div class="gf-cover">${svg}</div><div><b>${t}</b><small>${s}</small><button class="btn" data-a="goPackSp" data-v="${pack}">${esc((CHESTS.find(c => c.id === pack) || {}).name || '')}へ</button></div></div>`;
    if (tab === 'flame') { const B = ITEMS.filter(i => i.type === 'bfflame'), N = ITEMS.filter(i => i.type === 'nitrofx');
      return tabs + hero(flameSvg(BF_BY[ownedFx(lk, 'bfX', 'bf_') || 'orange'].c, 60), 'バックファイア・ニトロの炎', `いま乗っている車（${esc(car.name)}）のマフラーから出る炎の色。バックファイアはアクセルを抜いたときとシフトアップのときに、ニトロの炎はニトロを使ったときに出ます。`, 'flamepack')
        + `<div class="h3">バックファイア（${B.filter(i => invHas(i.id)).length} / ${B.length}）</div>` + grid(B, ownedFx(lk, 'bfX', 'bf_'), 'bfX', it => flameSvg(BF_BY[it.bfX].c, 40), '<span class="cm-none">なし</span><b>なし</b>')
        + `<div class="h3">ニトロの炎（${N.filter(i => invHas(i.id)).length} / ${N.length}）</div>` + grid(N, ownedFx(lk, 'nfX', 'nf_'), 'nfX', it => flameSvg(NF_BY[it.nfX].c, 40, true), '<span class="cm-none">純正</span><b>純正（青い光）</b>'); }
    if (tab === 'bov') { const A = ITEMS.filter(i => i.type === 'bov'); return tabs + hero(bovSvg(60), 'ブローオフ音', `アクセルを抜いたときの「プシュー」の音（${esc(car.name)}）。ターボ車でなくても鳴ります。▶ で試し聞きできます。`, 'bovpack') + `<div class="h3">${A.filter(i => invHas(i.id)).length} / ${A.length} 所持</div>` + grid(A, ownedFx(lk, 'bovX', 'bov_'), 'bovX', it => bovSvg(40, RCOL(it.rarity)), '<span class="cm-none">純正</span><b>純正</b>'); }
    if (tab === 'lights') { const H = ITEMS.filter(i => i.type === 'lightfx' && i.part === 'h'), T = ITEMS.filter(i => i.type === 'lightfx' && i.part === 't');
      return tabs + hero(lfxSvg('police', 60), 'ライトの光り方', `ヘッドライトとテールランプの光り方（${esc(car.name)}）。コモンとアンコモンはここでお金で買えます。ほかはライトパターンパックから。`, 'lightpack')
        + `<div class="h3">ヘッドライト</div>` + grid(H, ownedFx(lk, 'lfH', 'lf_'), 'lfH', it => lfxSvg(it.lfX, 40), '<span class="cm-none">標準</span><b>標準</b>', true)
        + `<div class="h3">テールランプ</div>` + grid(T, ownedFx(lk, 'lfT', 'lf_'), 'lfT', it => lfxSvg(it.lfX, 40), '<span class="cm-none">標準</span><b>標準</b>', true); }
    const K = ITEMS.filter(i => i.type === 'knob'), S = ITEMS.filter(i => i.type === 'steerw'), s = d.settings;
    return tabs + `<div class="cm-hero"><div class="gf-cover gear-cv">${knobSvg(curKnob().id, 34)}${steerSvg(curSteer().id, 56)}</div><div><b>シフトノブ・ハンドル</b><small>レース画面に出すシフトノブUI（上下にスワイプ／タップでシフト）とハンドル操作UI（回して操作）のデザイン。スマホでもPC（マウス）でも使えます。</small>
      <label class="cm-chk"><input type="checkbox" data-in="ctlTog" data-k="knobUI" ${s.knobUI ? 'checked' : ''}> シフトノブUIを表示する</label><label class="cm-chk"><input type="checkbox" data-in="ctlTog" data-k="wheelUI" ${s.wheelUI ? 'checked' : ''}> ハンドル操作を使う</label>
      <div class="kh-btns"><button class="btn" data-a="goPackSp" data-v="knobpack">シフトノブパックへ</button><button class="btn" data-a="goPackSp" data-v="steerpack">ハンドルパックへ</button></div></div></div>
      <div class="h3">シフトノブ（${K.filter(i => invHas(i.id)).length + 1} / ${K.length + 1}）</div>` + grid(K, curKnob().id === 'std' ? '' : curKnob().id, 'knobX', it => knobSvg(it.knobX, 26), knobSvg('std', 26) + '<b>純正ノブ</b>')
      + `<div class="h3">ハンドル（${S.filter(i => invHas(i.id)).length + 1} / ${S.length + 1}）</div>` + grid(S, curSteer().id === 'std' ? '' : curSteer().id, 'swX', it => steerSvg(it.swX, 44), steerSvg('std', 44) + '<b>純正ハンドル</b>'); }; }
Object.assign(UI, {
  a_setFx2(v) { const [k, id] = v.split(':'); if (k === 'knobX' || k === 'swX') SAVE.data[k] = id || 'std'; else { const inst = SAVE.cur(); inst.look = inst.look || defaultLook(CAR_BY_ID[inst.id]); inst.look[k] = id || ''; if (k === 'bovX' && id) AUDIO.bovPlay(id); if (k === 'bfX' && id) AUDIO.bfPop(); this.show.sig = ''; }
    SAVE.save(); AUDIO.confirm && AUDIO.confirm(); this.render(); },
  a_pvBov(id) { AUDIO.init(); AUDIO.bovPlay(id); },
  a_buyLfx(id) { const L = LFX_BY[id], it = ITEM_BY_ID['lf_' + id]; if (!L || !L.price || invHas(it.id)) return; if (!SAVE.spend(L.price)) return this.toast('お金が足りません'); grantChestItem(it); SAVE.save(); AUDIO.buy && AUDIO.buy(); this.toast(it.name + ' を購入しました'); this.refreshTop(); this.render(); },
  in_ctlTog(v, el) { SAVE.data.settings[el.dataset.k] = !!el.checked; SAVE.save(); }
});
{ const _st = UI.r_settings; UI.r_settings = function () { const h = _st.apply(this, arguments), s = SAVE.data.settings; if (this.tab !== 'control') return h; const row = (lb, k, on, note) => `<div class="row"><label>${lb}<small class="set-note">${note}</small></label><button class="btn ${on ? 'pri' : ''}" data-a="setTog" data-v="${k}">${on ? 'ON' : 'OFF'}</button></div>`;
    return h + `<div class="h3">シフトノブ・ハンドル</div>${row('シフトノブUI', 'knobUI', !!s.knobUI, 'レース画面にシフトノブを表示。上にスワイプ（上半分をタップ）でシフトアップ、下でシフトダウン。デザインは「飾り・小物」で変更')}${row('ハンドル操作', 'wheelUI', !!s.wheelUI, 'レース画面のハンドルを指やマウスで回して操作。スマホでは左右ボタンの代わりに表示されます')}`; }; }

// =====================================================================
// ステッカー帳（コースを走ってもらえるご当地ステッカー＋パックのスペシャル）
// =====================================================================
Object.assign(UI, {
  r_stkbook() { $('panelTitle').textContent = 'STICKER BOOK'; $('panelBody').classList.add('wide'); const d = SAVE.data, tab = this.sbTab || 'course', pct = bookPct(); d.stkRw = d.stkRw || [];
    const ms = BOOK_MAPS(), cGot = ms.reduce((a, m) => a + stkTier(m.id), 0), sGot = BSTK.filter(b => invHas('bstk_' + b[0])).length;
    let h = `<div class="sb-hero"><div class="sb-book"><i></i><b>${pct}%</b></div><div class="sb-ht"><b>ステッカー帳</b><small>コースを完走するとそのコースのご当地ステッカーがもらえます（1回でノーマル、${STK_TIER[2]}回でシルバー、${STK_TIER[3]}回でゴールド）。スペシャルステッカーはステッカー帳パックから。</small>
      <div class="sb-rw">${BOOK_RW.map(([p, r]) => { const got = d.stkRw.includes(p), ok = pct >= p; return `<button class="sb-rwb ${got ? 'got' : ok ? 'ok' : ''}" data-a="sbClaim" data-v="${p}" ${ok && !got ? '' : 'disabled'}><b>${p}%</b><span>${rwArt(r, 22)}</span><small>${got ? '受取済み' : rwLabel(r)}</small></button>`; }).join('')}</div></div></div>
      <div class="cm-tabs"><button class="tab ${tab === 'course' ? 'on' : ''}" data-a="sbTab" data-v="course">コース（${cGot} / ${ms.length * 3}）</button><button class="tab ${tab === 'sp' ? 'on' : ''}" data-a="sbTab" data-v="sp">スペシャル（${sGot} / ${BSTK.length}）</button><button class="btn" data-a="goPackSp" data-v="stickerpack">ステッカー帳パックへ</button></div><div class="sb-page">`;
    if (tab === 'course') h += ms.map((m, i) => { const t = stkTier(m.id), n = stkCnt(m.id); return `<div class="sb-slot ${t ? 'got t' + t : ''}" style="--r:${((i * 37) % 9) - 4}deg">${t ? courseStkSvg(m, t, 72) : `<span class="sb-q">?</span>`}<b>${esc(m.jp)}</b><small>${t ? `完走 ${n}回${t < 3 ? `・次まで ${STK_TIER[t + 1] - n}回` : ''}` : 'このコースを完走'}</small></div>`; }).join('');
    else h += BSTK.map(([id, nm, en, r], i) => { const o = invHas('bstk_' + id); return `<div class="sb-slot ${o ? 'got' : ''}" style="--r:${((i * 29) % 9) - 4}deg;--rc:${RCOL(r)}">${o ? bstkSvg(id, 72) : `<span class="sb-q">?</span>`}<b>${o ? esc(nm) : '？？？'}</b><small>${RARITY[r].name}</small></div>`; }).join('');
    return h + '</div>'; },
  a_sbTab(t) { this.sbTab = t; this.render(); },
  a_sbClaim(p) { p = +p; const d = SAVE.data; d.stkRw = d.stkRw || []; if (d.stkRw.includes(p) || bookPct() < p) return; const r = (BOOK_RW.find(x => x[0] === p) || [])[1]; if (!r) return; d.stkRw.push(p); grantRw(r); if (p === 100 && !invHas('tt45_book')) grantChestItem(ITEM_BY_ID.tt45_book); SAVE.save(); AUDIO.buyOk && AUDIO.buyOk(); this.toast('ステッカー帳の報酬：' + rwLabel(r)); this.refreshTop(); this.render(); }
});
{ const _mi = UI.menuItems; UI.menuItems = function () { _mi.apply(this, arguments); const el = $('menuList'), pills = el && el.querySelectorAll('.nm-pills')[0]; if (pills && !pills.querySelector('[data-m="stkbook"]')) pills.insertAdjacentHTML('beforeend', `<button class="nm-pill" data-m="stkbook"><span class="nmc-ic">${bstkSvg('fuji', 16)}</span><span>ステッカー帳</span></button>`); }; }

// =====================================================================
// デイリーイベント（イベント一覧・報酬タブ・チケット）
// =====================================================================
const tkIco = (n = 16) => `<svg viewBox="0 0 24 24" width="${n}" height="${n}"><path d="M3 7 h18 v3 a2 2 0 0 0 0 4 v3 h-18 v-3 a2 2 0 0 0 0 -4z" fill="#ffcf3d" stroke="#7a5a00" stroke-width="1.2"/><path d="M15 7 v10" stroke="#7a5a00" stroke-dasharray="1.5 1.5"/><path d="M8 10 l1.2 2.2 2.4 .3 -1.8 1.6 .5 2.4 -2.3 -1.2 -2.3 1.2 .5 -2.4 -1.8 -1.6 2.4 -.3z" fill="#7a5a00"/></svg>`;
const EV_TK_MAX = 10, EV_TK_MIN = 20, EV_TK_DIA = 30, EV_EPOCH = Date.UTC(2026, 0, 4, 15); // 月曜 0:00 JST
function evTk() { const d = SAVE.data, now = Date.now(); if (!d.evTk) d.evTk = { n: EV_TK_MAX, t: now }; const T = d.evTk; if (T.n >= EV_TK_MAX) { T.t = now; return T; } const add = Math.floor((now - T.t) / (EV_TK_MIN * 60000)); if (add > 0) { T.n = Math.min(EV_TK_MAX, T.n + add); T.t += add * EV_TK_MIN * 60000; if (T.n >= EV_TK_MAX) T.t = now; } return T; }
const EV_T = [
  { id: 'show', en: 'LEGEND SHOWCASE', jp: 'レジェンド・ショーケース', days: 7, off: 0, kind: 'race', tk: 2, loan: 'hy_aurex', mult: 3, art: 'gold', maps: ['kaminari', 'myojin', 'kuremine', 'tengu'],
    desc: 'ハイパーカー「VORTEX 16」を無料でお試し！峠の強敵とバトルして、ソロ報酬・クラン報酬・ランキング報酬を集めよう。このイベントの賞金は3倍！', main: [['pack', 'gold', 1], ['dia', 60]],
    solo: [['レースを完走', 'finish', 1, 4, ['money', 600000]], ['ライバルに勝つ', 'win', 1, 3, ['pack', 'silver', 1]], ['ドリフト：5,000点', 'drift', 5000, 5, ['dia', 25]], ['最高速度：180km/h', 'speed', 180, 4, ['pack', 'gold', 1]]],
    rank: [['ブロンズ', 1, ['money', 300000]], ['シルバー', 3, ['dia', 20]], ['ゴールド', 6, ['pack', 'gold', 1]], ['レジェンド', 10, ['dia', 60]]], rankStat: 'wins', rankUnit: '勝' },
  { id: 'drift', en: 'DRIFT MASTERS', jp: 'ドリフトマスターズ', days: 3, off: 1, kind: 'touge', tk: 2, art: 'red', maps: ['akigiri', 'nanamagari', 'tsuzura', 'momiji', 'hosomichi'],
    desc: '峠チャレンジでドリフトスコアを稼げ！角度とつなぎが勝負のカギ。', main: [['pack', 'parts', 1], ['dia', 30]],
    solo: [['走りきる', 'finish', 1, 4, ['money', 400000]], ['ドリフト：10,000点', 'drift', 10000, 5, ['dia', 15]], ['ドリフト：25,000点', 'drift', 25000, 3, ['pack', 'parts', 1]]],
    rank: [['ブロンズ', 8000, ['money', 300000]], ['シルバー', 20000, ['dia', 15]], ['ゴールド', 40000, ['pack', 'style', 1]], ['レジェンド', 70000, ['dia', 40]]], rankStat: 'drift', rankUnit: '点' },
  { id: 'jump', en: 'SKY JUMP FESTA', jp: 'スカイジャンプ・フェスタ', days: 4, off: 2, kind: 'time', tk: 1, loan: 'ka_tenma', art: 'purple', maps: ['jumppark'],
    desc: 'スカイランプ・パークでジャンプしまくれ！特別な車を無料でお試しできます。', main: [['pack', 'style', 1], ['dia', 20]],
    solo: [['レースを完走', 'finish', 1, 4, ['money', 300000]], ['ジャンプ：4回', 'jumps', 4, 8, ['pack', 'silver', 1]], ['ジャンプ：8回', 'jumps', 8, 3, ['dia', 20]]],
    rank: [['ブロンズ', 3, ['money', 200000]], ['シルバー', 6, ['dia', 10]], ['ゴールド', 10, ['pack', 'style', 1]], ['レジェンド', 15, ['dia', 30]]], rankStat: 'jumps', rankUnit: '回' },
  { id: 'night', en: 'MIDNIGHT RUN', jp: 'ミッドナイト・ラン', days: 2, off: 0, kind: 'race', tk: 2, art: 'blue', maps: ['neon', 'cloop', 'baylane', 'metrox', 'bridge'], night: 1,
    desc: '真夜中の街でライバルと一騎打ち。ネオンの光の中を駆け抜けろ。', main: [['pack', 'silver', 2], ['dia', 20]],
    solo: [['レースを完走', 'finish', 1, 4, ['money', 400000]], ['ライバルに勝つ', 'win', 1, 3, ['dia', 15]], ['最高速度：200km/h', 'speed', 200, 3, ['pack', 'silver', 1]]],
    rank: [['ブロンズ', 1, ['money', 250000]], ['シルバー', 3, ['dia', 10]], ['ゴールド', 5, ['pack', 'gold', 1]], ['レジェンド', 8, ['dia', 30]]], rankStat: 'wins', rankUnit: '勝' },
  { id: 'touge', en: 'TOUGE BATTLE', jp: '峠バトル', days: 3, off: 2, kind: 'race', tk: 2, loan: 'hk_sd3', art: 'green', maps: ['harukaze', 'hakoya', 'hayate', 'kazan', 'tanada', 'damu'],
    desc: '名車を無料でお試し！峠のダウンヒルでライバルを抜き去れ。', main: [['pack', 'gold', 1], ['dia', 25]],
    solo: [['レースを完走', 'finish', 1, 4, ['money', 450000]], ['ライバルに勝つ', 'win', 1, 3, ['pack', 'silver', 1]], ['ドリフト：3,000点', 'drift', 3000, 4, ['dia', 15]]],
    rank: [['ブロンズ', 1, ['money', 250000]], ['シルバー', 3, ['dia', 10]], ['ゴールド', 5, ['pack', 'gold', 1]], ['レジェンド', 8, ['dia', 30]]], rankStat: 'wins', rankUnit: '勝' },
  { id: 'speed', en: 'TOP SPEED', jp: 'トップスピード', days: 1, off: 0, kind: 'time', tk: 1, art: 'orange', maps: ['baylane', 'airport', 'metrox', 'circuit'],
    desc: '最高速アタック！長いストレートで限界まで踏み込め。', main: [['money', 1000000], ['dia', 15]],
    solo: [['レースを完走', 'finish', 1, 3, ['money', 300000]], ['最高速度：220km/h', 'speed', 220, 3, ['dia', 15]], ['最高速度：260km/h', 'speed', 260, 2, ['pack', 'gold', 1]]],
    rank: [['ブロンズ', 180, ['money', 200000]], ['シルバー', 220, ['dia', 10]], ['ゴールド', 260, ['pack', 'silver', 1]], ['レジェンド', 300, ['dia', 30]]], rankStat: 'speed', rankUnit: 'km/h' },
  { id: 'coast', en: 'COAST CRUISE', jp: 'コースト・クルーズ', days: 5, off: 3, kind: 'time', tk: 1, art: 'cyan', maps: ['seaside', 'harbor', 'megane', 'nanko'],
    desc: '海と街のコースでタイムアタック。走るほど報酬がたまる、のんびり派向けのイベント。', main: [['pack', 'style', 1], ['money', 800000]],
    solo: [['レースを完走', 'finish', 1, 6, ['money', 300000]], ['ジャンプ：1回', 'jumps', 1, 3, ['dia', 10]], ['最高速度：160km/h', 'speed', 160, 4, ['pack', 'silver', 1]]],
    rank: [['ブロンズ', 2, ['money', 200000]], ['シルバー', 5, ['dia', 10]], ['ゴールド', 10, ['pack', 'style', 1]], ['レジェンド', 20, ['dia', 30]]], rankStat: 'runs', rankUnit: '回' }
];
function evList() { const now = Date.now(); return EV_T.map(T => { const D = T.days * 86400000, o = T.off * 86400000, start = EV_EPOCH + o + Math.floor((now - EV_EPOCH - o) / D) * D, end = start + D, r = mulberry32((start / 3600000 | 0) * 31 + T.id.length * 7 + T.id.charCodeAt(0));
    const map = T.maps.filter(m => MAP_BY_ID[m])[Math.floor(r() * T.maps.length) % Math.max(1, T.maps.filter(m => MAP_BY_ID[m]).length)] || 'akigiri'; return Object.assign({}, T, { key: T.id + '@' + start, start, end, map }); }); }
function ev2State(e) { const d = SAVE.data; d.ev2 = d.ev2 || {}; for (const k in d.ev2) if (!evList().some(x => x.key === k)) delete d.ev2[k]; return d.ev2[e.key] = d.ev2[e.key] || { runs: 0, wins: 0, best: {}, prog: {}, got: {}, rank: {}, clan: 0, cgot: {} }; }
const evLeft = ms => { const h = Math.max(0, Math.floor(ms / 3600000)); return `${String(Math.floor(h / 24)).padStart(2, '0')}日${String(h % 24).padStart(2, '0')}時間`; };
const EV_CLAN = [['クランで参加：2回', 2, ['money', 300000]], ['クランで参加：5回', 5, ['dia', 15]], ['クランで参加：10回', 10, ['pack', 'gold', 1]]];
function evArt2(e, w = 300) { const P = { gold: ['#ffb000', '#ffe27a', '#7a4a00'], red: ['#c8102e', '#ff6a3a', '#3a0008'], purple: ['#6a2aff', '#ff6ae8', '#1a0640'], blue: ['#1a4aff', '#3ac8ff', '#06103a'], green: ['#1a9a4a', '#a8ff5a', '#04200e'], orange: ['#ff6a1a', '#ffd23a', '#3a1000'], cyan: ['#1ab8d8', '#c8faff', '#042a3a'] }[e.art] || ['#555', '#999', '#111'];
  const ic = { show: `<path d="M150 70 l18 38 42 4 -32 28 10 42 -38 -22 -38 22 10 -42 -32 -28 42 -4z" fill="${P[1]}" stroke="#fff" stroke-width="4"/><path d="M96 150 q-30 -40 0 -90 M204 150 q30 -40 0 -90" stroke="${P[1]}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    drift: `<path d="M60 190 q60 -120 180 -130" stroke="#fff" stroke-width="10" stroke-dasharray="14 10" fill="none" opacity=".7"/><path d="M80 200 q60 -110 180 -120" stroke="#fff" stroke-width="10" stroke-dasharray="14 10" fill="none" opacity=".5"/><circle cx="220" cy="80" r="26" fill="#fff" opacity=".9"/><text x="220" y="88" font-size="22" font-weight="900" text-anchor="middle" fill="${P[0]}" font-family="Arial">D</text>`,
    jump: `<path d="M40 200 L150 120 L150 200z" fill="#fff" opacity=".6"/><path d="M150 120 q50 -80 110 -20" stroke="#fff" stroke-width="6" stroke-dasharray="10 8" fill="none"/><rect x="220" y="70" width="50" height="20" rx="6" fill="#fff" transform="rotate(20 245 80)"/>`,
    night: `${[50, 90, 130, 200, 240].map((x, k) => `<rect x="${x}" y="${80 + (k % 3) * 20}" width="34" height="${140 - (k % 3) * 20}" fill="#000" opacity=".5"/>`).join('')}<circle cx="230" cy="60" r="20" fill="#fff" opacity=".85"/>`,
    touge: `<path d="M0 200 L90 90 L150 140 L220 60 L300 200z" fill="#000" opacity=".35"/><path d="M40 200 q60 -60 30 -100 q-20 -30 60 -60" stroke="#fff" stroke-width="8" fill="none" opacity=".8"/>`,
    speed: `<circle cx="150" cy="140" r="70" fill="none" stroke="#fff" stroke-width="10" stroke-dasharray="6 6" opacity=".8"/><path d="M150 140 L205 95" stroke="#fff" stroke-width="10" stroke-linecap="round"/><circle cx="150" cy="140" r="10" fill="#fff"/>`,
    coast: `<path d="M0 150 q40 -20 80 0 t80 0 t80 0 t80 0 v60 H0z" fill="#fff" opacity=".5"/><circle cx="220" cy="80" r="28" fill="#fff" opacity=".85"/>` }[e.id] || '';
  return `<svg viewBox="0 0 300 220" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="ea${e.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P[0]}"/><stop offset="1" stop-color="${P[2]}"/></linearGradient></defs><rect width="300" height="220" fill="url(#ea${e.id})"/>${Array.from({ length: 6 }, (_, k) => `<path d="M${-40 + k * 70} 220 L${k * 70 + 60} 0" stroke="#ffffff14" stroke-width="16"/>`).join('')}${ic}</svg>`; }
const _oldDevent = UI.r_devent;
Object.assign(UI, {
  evTop() { const T = evTk(); return `<div class="ev2-tk"><span class="ev2-tki">${tkIco(18)}</span><b>${T.n}/${EV_TK_MAX}</b><button data-a="evTkBuy" title="チケット補充">＋</button></div>`; },
  r_devent() { $('panelTitle').textContent = 'DAILY EVENT'; $('panelBody').classList.add('wide'); if (this.ev2) return this.ev2Detail(); const L = evList(), now = Date.now(), f = L[0];
    let h = `<div class="ev2-head"><div><span class="ev2-left">残り <b>${evLeft(f.end - now)}</b></span><span class="ev2-cost">${tkIco(16)} ${f.tk}</span><h2 class="ev2-t">${f.en}</h2><p class="ev2-d">${esc(f.desc)}</p></div><div class="ev2-hr">${this.evTop()}<small>メイン報酬</small><div class="ev2-main">${f.main.map(r => `<span>${rwArt(r, 46)}</span>`).join('')}</div></div></div><div class="ev2-row">`;
    L.forEach((e, i) => { const S = ev2State(e), done = e.solo.filter((t, k) => S.got[k]).length;
      h += `<button class="ev2-card ${i === 0 ? 'feat' : ''}" data-a="ev2Open" data-v="${e.id}" style="animation-delay:${i * 0.05}s"><div class="ev2-art">${evArt2(e)}</div>${i ? `<span class="ev2-time"><b>${evLeft(e.end - now)}</b><em>${tkIco(12)} ${e.tk}</em></span>` : ''}${e.loan ? '<span class="ev2-free">無料でお試し！</span>' : ''}<span class="ev2-nm"><b>${e.en}</b><small>${esc(e.jp)}・${esc((MAP_BY_ID[e.map] || {}).jp || '')}</small></span>${e.mult ? `<span class="ev2-mult">賞金 ×${e.mult}</span>` : ''}<span class="ev2-prog">${done}/${e.solo.length}</span>${i === 0 ? '<span class="ev2-join">参加</span>' : ''}</button>`; });
    h += `<button class="ev2-card old" data-a="ev2Old"><div class="ev2-art">${evArt2({ id: 'speed', art: 'blue' })}</div><span class="ev2-nm"><b>DAILY CHALLENGE</b><small>毎日3つのチャレンジ</small></span><span class="ev2-time"><b>${passFmtLeft(msToJstMidnight())}</b></span></button></div><div class="note">チケットは${EV_TK_MIN}分ごとに1枚回復します（最大${EV_TK_MAX}枚）。「＋」でダイヤ${EV_TK_DIA}で満タンにできます。</div>`;
    return h; },
  ev2Detail() { const e = evList().find(x => x.id === this.ev2); if (!e) { this.ev2 = null; return this.r_devent(); } const S = ev2State(e), tab = this.ev2Tab || 'solo', now = Date.now(), m = MAP_BY_ID[e.map] || {};
    const card = (r, task, prog, goal, got) => `<div class="ev2-rw ${got ? 'got' : ''}"><div class="ev2-rwc"><span class="ev2-rwv">${esc(rwLabel(r).replace(/ ×\d+$/, ''))}</span><div class="ev2-rwi">${rwArt(r, 74)}</div><b>${r[0] === 'money' ? '' : r[0] === 'dia' ? r[1] : '×' + (r[2] || 1)}</b></div><div class="ev2-rwt"><span class="ev2-task">${esc(task)}</span><span class="ev2-cnt">${got ? '✓ 受取済み' : `↻ ${Math.min(prog, goal)}/${goal}`}</span></div></div>`;
    let body = '';
    if (tab === 'solo') body = e.solo.map(([t, st, per, n, r], k) => card(r, t, S.prog[k] || 0, n, S.got[k])).join('');
    if (tab === 'clan') body = SOC.clanId ? EV_CLAN.map(([t, n, r], k) => card(r, t, S.clan || 0, n, S.cgot[k])).join('') : `<div class="note">クランに入ると、このイベントを走った回数でクラン報酬がもらえます。<button class="btn" data-m="clan" data-a="ev2Clan">クランへ</button></div>`;
    if (tab === 'rank') { const v = e.rankStat === 'wins' ? S.wins : e.rankStat === 'runs' ? S.runs : (S.best[e.rankStat] || 0); body = `<div class="note">あなたの記録（${e.rankStat === 'wins' ? '勝利数' : e.rankStat === 'runs' ? '完走数' : e.rankStat === 'drift' ? 'ベストスコア' : e.rankStat === 'speed' ? '最高速度' : 'ジャンプ数'}：<b>${Math.round(v).toLocaleString()} ${e.rankUnit}</b>）でランクが決まります。</div>` + e.rank.map(([nm, thr, r], k) => card(r, `${nm}：${thr.toLocaleString()}${e.rankUnit}`, Math.round(v), thr, S.rank[k])).join(''); }
    const best = e.kind === 'time' ? (S.best.time ? fmtLap(S.best.time) : '--') : e.kind === 'touge' ? (S.best.drift ? S.best.drift.toLocaleString() + ' 点' : '--') : `${S.wins} 勝`;
    return `<div class="ev2-dt" style="--ea:${{ gold: '#5a3a00', red: '#4a0410', purple: '#3a0a8a', blue: '#0a1a5a', green: '#0a3a1a', orange: '#4a1a00', cyan: '#0a3a4a' }[e.art]}"><div class="ev2-dh"><button class="btn" data-a="ev2Back">‹ 一覧</button><div class="ev2-dhl"><h2 class="ev2-t">${e.en}</h2><span class="ev2-left">残り <b>${evLeft(e.end - now)}</b></span><span class="ev2-cost">${tkIco(16)} ${e.tk}</span></div>${this.evTop()}</div>
      <div class="ev2-info"><div class="ev2-ia">${evArt2(e)}</div><div><b>${esc(e.jp)}</b><small>${esc(m.jp || '')} ・ ${{ race: 'ライバルとバトル', time: 'タイムアタック', touge: 'ドリフト（峠チャレンジ）' }[e.kind]}${e.loan ? ` ・ 使用車：${esc(CAR_BY_ID[e.loan].name)}（無料でお試し）` : ' ・ いま乗っている車で参加'}</small><p>${esc(e.desc)}</p></div></div>
      <div class="ev2-tabs">${[['clan', 'クラン報酬'], ['solo', 'ソロ報酬'], ['rank', 'ランキング報酬']].map(([k, n]) => `<button class="${k === tab ? 'on' : ''}" data-a="ev2Tab" data-v="${k}">${n}</button>`).join('')}</div><div class="ev2-rws">${body}</div>
      <div class="ev2-foot"><div><small>${e.kind === 'time' ? 'ベストタイム' : e.kind === 'touge' ? 'ベストスコア' : '勝利数'}</small><b>${best}</b></div><button class="ev2-go" data-a="ev2Go" data-v="${e.id}">レース <em>${tkIco(16)} ${e.tk}</em></button></div></div>`; },
  a_ev2Open(id) { this.ev2 = id; this.ev2Tab = 'solo'; AUDIO.nav && AUDIO.nav(); this.render(); },
  a_ev2Back() { this.ev2 = null; this.render(); }, a_ev2Tab(t) { this.ev2Tab = t; this.render(); }, a_ev2Old() { this.open('deventOld'); }, a_ev2Clan() { this.open('clan'); },
  r_deventOld() { return _oldDevent.call(this); },
  a_evTkBuy() { const T = evTk(), d = SAVE.data; if (T.n >= EV_TK_MAX) return this.toast('チケットは満タンです'); if ((d.diamonds || 0) < EV_TK_DIA) return this.toast(`ダイヤが足りません（${EV_TK_DIA}必要）`); d.diamonds -= EV_TK_DIA; T.n = EV_TK_MAX; T.t = Date.now(); SAVE.save(); AUDIO.buy && AUDIO.buy(); this.toast('チケットを補充しました'); this.refreshTop(); this.render(); },
  a_ev2Go(id) { const e = evList().find(x => x.id === id), T = evTk(); if (!e) return; if (T.n < e.tk) return this.toast(`チケットが足りません（${e.tk}枚必要・${EV_TK_MIN}分で1枚回復）`); T.n -= e.tk; if (T.n < EV_TK_MAX && T.t > Date.now() - 1000) T.t = Date.now(); SAVE.save();
    const m = MAP_BY_ID[e.map], inst = e.loan ? Object.assign(SAVE.newCar(e.loan), { uid: 'loan_' + e.loan, loan: 1 }) : SAVE.cur();
    const base = { mapId: e.map, weather: 'clear', time: e.night ? 'night' : m.time, laps: 1, carInst: inst, ev2: e.key };
    if (e.kind === 'race') return this.launch(Object.assign(base, { mode: 'event', evRace: { title: e.en + ' ・ ' + m.jp, prize: 0 }, rivals: [{ name: { show: '伝説の挑戦者', night: '真夜中の亡霊', touge: '峠の刺客' }[e.id] || 'イベントの刺客', team: 'DAILY EVENT', car: e.loan || inst.id, color: '#3a3f4a', skill: e.id === 'show' ? 0.86 : 0.8 }] }));
    this.launch(Object.assign(base, { mode: e.kind, rivals: [] })); }
});
{ const _sr = UI.showResults; UI.showResults = function (res) { const g = this.game; const extra = { jumps: (g && g.jumps) || 0, drift: res.score || (g && g.drift && (g.drift.score || g.drift.total)) || 0 }; _sr.call(this, res); const d = SAVE.data;
    // ステッカー帳
    try { if (res.cfg && res.cfg.mapId && res.reason !== 'crash' && res.reason !== 'stuck' && BOOK_MAPS().some(m => m.id === res.cfg.mapId)) { d.stkBook = d.stkBook || {}; const t0 = stkTier(res.cfg.mapId); d.stkBook[res.cfg.mapId] = (d.stkBook[res.cfg.mapId] || 0) + 1; const t1 = stkTier(res.cfg.mapId); SAVE.save();
      if (t1 > t0) { const box = document.querySelector('#overlay .res-modal .btns'); if (box) box.insertAdjacentHTML('beforebegin', `<div class="dv-res ok sb-res">${courseStkSvg(MAP_BY_ID[res.cfg.mapId], t1, 34)} ステッカー帳：「${esc(MAP_BY_ID[res.cfg.mapId].jp)}」の${['', 'ノーマル', 'シルバー', 'ゴールド'][t1]}ステッカーを手に入れた！</div>`); } } } catch (x) { }
    // デイリーイベント
    const key = res.cfg && res.cfg.ev2; if (!key) return; const e = evList().find(x => x.key === key); if (!e) return; const S = ev2State(e);
    const fin = res.reason !== 'crash' && res.reason !== 'stuck', win = !!res.win, st = { finish: fin ? 1 : 0, win: win ? 1 : 0, jumps: extra.jumps, drift: extra.drift, speed: res.maxSpeed || 0 };
    S.runs += fin ? 1 : 0; S.wins += win ? 1 : 0; S.best.drift = Math.max(S.best.drift || 0, st.drift); S.best.speed = Math.max(S.best.speed || 0, st.speed); S.best.jumps = Math.max(S.best.jumps || 0, st.jumps);
    if (e.kind === 'time' && fin && res.laps && res.laps.length) { const t = Math.min(...res.laps.map(l => l.t)); if (!S.best.time || t < S.best.time) S.best.time = t; }
    if (SOC.clanId && fin) S.clan = (S.clan || 0) + 1; const got = [];
    e.solo.forEach(([t, k, per, n, r], i) => { if ((st[k] || 0) >= per) S.prog[i] = (S.prog[i] || 0) + 1; if (!S.got[i] && (S.prog[i] || 0) >= n) { S.got[i] = 1; grantRw(r); got.push(rwLabel(r)); } });
    EV_CLAN.forEach(([t, n, r], i) => { if (!S.cgot[i] && (S.clan || 0) >= n) { S.cgot[i] = 1; grantRw(r); got.push(rwLabel(r)); } });
    const rv = e.rankStat === 'wins' ? S.wins : e.rankStat === 'runs' ? S.runs : (S.best[e.rankStat] || 0); e.rank.forEach(([nm, thr, r], i) => { if (!S.rank[i] && rv >= thr) { S.rank[i] = 1; grantRw(r); got.push(nm + '：' + rwLabel(r)); } });
    if (e.mult && fin) { const bonus = 150000 * (e.mult - 1) * (win ? 2 : 1); SAVE.addMoney(bonus); got.push('賞金ボーナス ' + yen(bonus)); }
    SAVE.save(); const box = document.querySelector('#overlay .res-modal .btns'); if (box) box.insertAdjacentHTML('beforebegin', `<div class="dv-res ${got.length ? 'ok' : ''}">${esc(e.en)}：${got.length ? '報酬 ' + got.map(esc).join(' ＋ ') : 'ソロ報酬の条件を進めよう'}</div>`); }; }
{ const _rn = UI.a_resNext; UI.a_resNext = function () { const res = this.lastRes; if (res && res.cfg && res.cfg.ev2) { $('overlay').classList.remove('res-dim'); this.closeModal(); this.paused = false; AUDIO.applyVol(); this.game.exit(); this.goMenu(); this.ev2 = (evList().find(x => x.key === res.cfg.ev2) || {}).id || null; return this.open('devent'); } return _rn.call(this); }; }
for (const it of ITEMS) ITEM_BY_ID[it.id] = it;
window.__DLX = Object.assign(window.__DLX || {}, { evList, ev2State, evTk, CTL });

// =====================================================================
// メインメニューのボタン（GARAGE & SHOP / MORE）を分かりやすいタイルに
// =====================================================================
const NM_META = { store: ['パック・オファー', '#ffb400'], garage: ['車の選択', '#3a9aff'], tuning: ['性能アップ', '#ff7a2a'], shop: ['新しい車を買う', '#2fdc7a'], pshop: ['パーツを買う', '#8a9aff'],
  bag: ['持ち物を見る', '#b07aff'], charm: ['キー・炎・小物', '#ff6ab0'], minigame: ['ルーレット・くじ', '#ffd23a'], colbook: ['アイテム図鑑', '#4aa8ff', '図鑑'], license: ['プロフィール', '#e8c060'], stkbook: ['集めて報酬', '#ff6ae8'],
  events: ['期間限定', '#2fdc7a'], advent: ['毎日ひとつ', '#ffd76a'], ach: ['ミッション', '#ffcf3d'], codes: ['特典を受け取る', '#9aa4b8'], news: ['新しい機能', '#4ac8ff'], tutorial: ['操作とコツ', '#9aa4b8'], settings: ['音・操作・画質', '#9aa4b8'], admin: ['運営ツール', '#ff6a5a'], dev: ['開発者ツール', '#ff6a5a'] };
{ const _mi = UI.menuItems; UI.menuItems = function () { _mi.apply(this, arguments); const el = $('menuList'); if (!el) return;
    el.querySelectorAll('.nm-pills').forEach(box => { box.classList.add('nm-tiles'); box.querySelectorAll('.nm-pill').forEach(b => { if (b.dataset.tile) return; b.dataset.tile = 1; const k = b.dataset.m || '', M = NM_META[k] || ['', '#9aa4b8'];
      const badge = b.querySelector('.nm-b, i.mbadge'); const sp = [...b.children].find(c => c.tagName === 'SPAN' && !c.classList.contains('nmc-ic')); const label = M[2] || (sp ? sp.textContent : b.textContent.trim()); const ic = [...b.children].find(c => c.tagName.toLowerCase() === 'svg' || (c.classList && c.classList.contains('nmc-ic')));
      const icHTML = ic ? (ic.classList && ic.classList.contains('nmc-ic') ? ic.innerHTML : ic.outerHTML) : '';
      b.style.setProperty('--tc', M[1]); b.innerHTML = `<span class="nmt-ic">${icHTML}</span><span class="nmt-tx"><b>${esc(label.replace(badge ? badge.textContent : '', '').trim())}</b>${M[0] ? `<small>${M[0]}</small>` : ''}</span>${badge ? `<i class="nmt-b">${esc(badge.textContent)}</i>` : ''}<span class="nmt-ar">›</span>`; }); }); }; }
