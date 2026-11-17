// =====================================================================
// audio.js — WebAudio 合成サウンド（エンジン・タイヤ・ターボ・効果音）
//            ＋ リアルタイム生成のオリジナル・ユーロビート
// 外部音源は一切使用しない。音声が使えない環境でもゲームは動作する。
// =====================================================================
// エンジン形式ごとの音のプロファイル（h=倍音、hi=高域、sub=低い鼓動、rasp=排気のザラつき）
const ENGINE_PROFILES = {
  i4: { h: [1, 0.62, 0.48, 0.28, 0.3, 0.12, 0.12, 0.06], h2: [1, 0.4, 0.3, 0.2], hi: 0.22, hiMul: 2, sub: 0.18, rasp: 0.55, intake: 0.08, bright: 600, crackle: 0.35 },
  i6: { h: [1, 0.42, 0.32, 0.16, 0.12, 0.08, 0.05], h2: [1, 0.2, 0.15], hi: 0.18, hiMul: 3, sub: 0.12, rasp: 0.35, intake: 0.06, bright: 400, crackle: 0.3 },
  v6: { h: [1, 0.5, 0.36, 0.22, 0.12, 0.08], hi: 0.15, hiMul: 2, sub: 0.3, rasp: 0.45, intake: 0.05, bright: 300, lumpy: 0.5, lumpAmt: 0.12, crackle: 0.35 },
  v8: { h: [1, 0.72, 0.42, 0.32, 0.16, 0.1], h2: [1, 0.5, 0.3], hi: 0.1, hiMul: 0.5, sub: 0.6, rasp: 0.6, intake: 0.05, bright: -100, lumpy: 0.25, lumpAmt: 0.38, crackle: 0.5 },
  v12: { h: [1, 0.3, 0.26, 0.22, 0.16, 0.13, 0.1, 0.08, 0.06], h2: [1, 0.5, 0.35, 0.2], hi: 0.35, hiMul: 2, sub: 0.08, rasp: 0.3, intake: 0.07, bright: 900, crackle: 0.25 },
  diesel: { h: [1, 0.7, 0.5, 0.4, 0.2, 0.15], h2: [1, 0.5], hi: 0.06, hiMul: 2, sub: 0.45, rasp: 0.25, intake: 0.12, bright: 180, lumpy: 0.7, lumpAmt: 0.2, crackle: 0 },
  rotary: { h: [1, 0.08, 0.72, 0.1, 0.52, 0.08, 0.36, 0.06, 0.24], h2: [1, 0.1, 0.6, 0.1, 0.4], hi: 0.3, hiMul: 2, sub: 0.1, rasp: 0.75, intake: 0.09, bright: 1000, crackle: 0.6 },
  flat4: { h: [1, 0.55, 0.4, 0.2, 0.12], hi: 0.12, hiMul: 2, sub: 0.5, rasp: 0.5, intake: 0.06, bright: 100, lumpy: 0.5, lumpAmt: 0.3, crackle: 0.4 }
};
ENGINE_PROFILES.flat6 = ENGINE_PROFILES.flat4; ENGINE_PROFILES.v10 = ENGINE_PROFILES.v12;
class AudioSys {
  constructor() { this.ok = false; this.ctx = null; this.vol = { bgm: 0.6, sfx: 0.8, mute: false }; this.music = { playing: false, track: null, cat: 'menu', step: 0, next: 0, bar: 0, paused: false }; this.listeners = []; this.engines = []; }
  init() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const c = this.ctx = new AC();
      this.master = c.createGain(); const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      this.master.connect(comp); comp.connect(c.destination);
      this.musicBus = c.createGain(); this.sfxBus = c.createGain(); this.musicBus.connect(this.master); this.sfxBus.connect(this.master);
      // ディレイ（音楽用）
      this.delay = c.createDelay(1); this.delay.delayTime.value = 0.3; const fb = c.createGain(); fb.gain.value = 0.28; const dl = c.createGain(); dl.gain.value = 0.25;
      this.delay.connect(fb); fb.connect(this.delay); this.delay.connect(dl); dl.connect(this.musicBus);
      const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; this.noise = buf;
      this.ok = true; this.applyVol();
      this.timer = setInterval(() => { try { this.schedule(); } catch (e) { } }, 25);
    } catch (e) { this.ok = false; }
  }
  resume() { try { if (this.ctx && this.ctx.state !== 'running') this.ctx.resume(); } catch (e) { } }
  applyVol() { if (!this.ok) return; const m = this.vol.mute ? 0 : 1; this.musicBus.gain.value = this.vol.bgm * 0.55 * m; this.sfxBus.gain.value = this.vol.sfx * m; }
  setVol(v) { Object.assign(this.vol, v); this.applyVol(); }
  noiseSrc() { const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.loop = true; s.loopStart = Math.random(); return s; }
  // ---------------- 効果音 ----------------
  tone(freq, dur, type = 'square', vol = 0.2, when = 0, slide = 0, bus) {
    if (!this.ok || !isFinite(freq) || !isFinite(dur) || !isFinite(vol) || !isFinite(when) || !isFinite(slide)) return; const c = this.ctx, t = c.currentTime + when; const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(bus || this.sfxBus); o.start(t); o.stop(t + dur + 0.02);
  }
  noiseBurst(dur, freq, q, vol, when = 0, type = 'bandpass', bus) {
    if (!this.ok || ![dur, freq, q, vol, when].every(isFinite)) return; const c = this.ctx, t = c.currentTime + when; const s = this.noiseSrc(), f = c.createBiquadFilter(), g = c.createGain(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(bus || this.sfxBus); s.start(t); s.stop(t + dur + 0.05);
  }
  click() { this.tone(1400, 0.05, 'square', 0.06); this.tone(2100, 0.04, 'sine', 0.05, 0.02); }
  hover() { this.tone(900, 0.03, 'sine', 0.03); }
  buy() { [880, 1108, 1318, 1760].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.12, i * 0.07)); }
  error() { this.tone(220, 0.25, 'square', 0.1, 0, 0.6); }
  countdown(n) { if (n > 0) this.tone(660, 0.25, 'square', 0.18); else { this.tone(1320, 0.6, 'square', 0.2); this.tone(1980, 0.6, 'sine', 0.12); } }
  crash(k) { k = clamp(k, 0.1, 1); this.noiseBurst(0.35 + k * 0.3, 400, 0.8, 0.5 * k, 0, 'lowpass'); this.tone(90, 0.3, 'sine', 0.5 * k, 0, 0.5); this.noiseBurst(0.15, 3000, 2, 0.2 * k); }
  land(k) { k = clamp(k, 0.1, 1); this.noiseBurst(0.3 + k * 0.2, 180, 0.7, 0.55 * k, 0, 'lowpass'); this.tone(55, 0.25, 'sine', 0.5 * k, 0, 0.6); this.noiseBurst(0.08, 2400, 2, 0.12 * k, 0.02); }
  scrape(k) { this.noiseBurst(0.12, 2500, 3, 0.12 * k); }
  shiftSfx() { this.noiseBurst(0.05, 1800, 4, 0.08); this.tone(120, 0.06, 'square', 0.06); }
  blowoff() { this.noiseBurst(0.35, 2600, 1.2, 0.18, 0, 'bandpass'); this.noiseBurst(0.25, 5000, 0.7, 0.08, 0.03, 'highpass'); }
  nitroBurst() { // ニトロ点火：圧縮ガスの噴出音＋低音のドン
    if (!this.ok) return; const c = this.ctx, t = c.currentTime;
    const n = this.noiseSrc(), f = c.createBiquadFilter(), g = c.createGain(); f.type = 'bandpass'; f.Q.value = 0.8; f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(5000, t + 0.35);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7); n.connect(f); f.connect(g); g.connect(this.sfxBus); n.start(t); n.stop(t + 0.75);
    this.tone(70, 0.35, 'sine', 0.45, 0, 0.5); this.tone(140, 0.25, 'sawtooth', 0.12, 0.02, 2.2);
  }
  chestOpen(rar) { // チェストを開ける音：きしみ→ガタガタ→開く→レア度に応じたきらめき
    if (!this.ok) return; const c = this.ctx, t = c.currentTime;
    for (let k = 0; k < 4; k++) this.noiseBurst(0.07, 300 + k * 60, 1.2, 0.18, k * 0.16, 'bandpass');
    this.tone(90, 0.12, 'square', 0.12, 0.65, 0.6); this.noiseBurst(0.35, 1800, 0.6, 0.18, 0.7, 'bandpass');
    const base = [523, 587, 659, 784, 880][rar] || 523; const n = 3 + rar * 2;
    for (let k = 0; k < n; k++) this.tone(base * Math.pow(2, k / 5), 0.25, 'triangle', 0.1, 0.8 + k * 0.06);
    if (rar >= 3) { this.tone(base * 2, 0.8, 'sine', 0.12, 0.8 + n * 0.06); this.noiseBurst(1.2, 7000, 0.7, 0.08, 0.85, 'highpass'); }
    if (rar >= 4) [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.5, 'sawtooth', 0.08, 1.3 + i * 0.12));
  }
  pop() { this.noiseBurst(0.06, 600, 1, 0.35, 0, 'lowpass'); this.tone(70, 0.05, 'square', 0.2); }
  starter() { if (!this.ok) return; for (let i = 0; i < 7; i++) this.tone(55 + (i % 2) * 8, 0.09, 'sawtooth', 0.12, i * 0.09); this.noiseBurst(0.4, 300, 1, 0.3, 0.6, 'lowpass'); }
  fanfare() { [523, 659, 784, 1046, 784, 1046].forEach((f, i) => this.tone(f, 0.3, 'square', 0.1, i * 0.12)); }
  // ---------------- エンジン音 ----------------
  createEngine(spec, isPlayer = true) {
    if (!this.ok) return null; const c = this.ctx;
    const out = c.createGain(); out.gain.value = 0; out.connect(this.sfxBus);
    const pan = c.createStereoPanner ? c.createStereoPanner() : null; if (pan) { pan.connect(out); }
    const dest = pan || out;
    const ws = c.createWaveShaper(); const curve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 2.2); } ws.curve = curve;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2.5; lp.frequency.value = 800;
    const eg = c.createGain(); eg.gain.value = 0.0;
    ws.connect(lp); lp.connect(eg); eg.connect(dest);
    // エンジン形式ごとの倍音構成（v2.2：よりリアルな音）
    const P = ENGINE_PROFILES[spec.sound] || ENGINE_PROFILES.i4; const mkWave = h => { const re = new Float32Array(h.length + 1), im = new Float32Array(h.length + 1); h.forEach((v, i) => im[i + 1] = v); return c.createPeriodicWave(re, im); };
    const o1 = c.createOscillator(); o1.setPeriodicWave(mkWave(P.h)); const o2 = c.createOscillator(); o2.setPeriodicWave(mkWave(P.h2 || [1, 0.3, 0.15])); const o3 = c.createOscillator(); o3.type = 'sine';
    const g1 = c.createGain(), g2 = c.createGain(), g3 = c.createGain(); g1.gain.value = 0.55; g2.gain.value = P.hi; g3.gain.value = P.sub;
    o1.connect(g1); o2.connect(g2); o3.connect(g3); g1.connect(ws); g2.connect(ws); g3.connect(ws);
    // 燃焼の脈動（ノイズを点火周期で揺らす）＝排気のザラつき
    const cn = this.noiseSrc(), cnf = c.createBiquadFilter(); cnf.type = 'bandpass'; cnf.Q.value = 0.9; const cam = c.createGain(); cam.gain.value = 0; const cmod = c.createOscillator(); cmod.type = 'sine'; const cmodG = c.createGain(); cmodG.gain.value = 0;
    cn.connect(cnf); cnf.connect(cam); cmod.connect(cmodG); cmodG.connect(cam.gain); cam.connect(lp);
    // 吸気音
    const inz = this.noiseSrc(), inf = c.createBiquadFilter(); inf.type = 'bandpass'; inf.Q.value = 1.6; const ing = c.createGain(); ing.gain.value = 0; inz.connect(inf); inf.connect(ing); ing.connect(dest);
    // 不等間隔燃焼の揺らぎ（ボクサー/V8の鼓動感）
    const lfo = c.createOscillator(); lfo.type = 'sine'; const lfoG = c.createGain(); lfoG.gain.value = 0; lfo.connect(lfoG); lfoG.connect(eg.gain);
    const nz = this.noiseSrc(), nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.Q.value = 1.2; const ng = c.createGain(); ng.gain.value = 0; nz.connect(nf); nf.connect(ng); ng.connect(dest);
    // ターボ
    const tw = c.createOscillator(); tw.type = 'sine'; const twg = c.createGain(); twg.gain.value = 0; tw.connect(twg); twg.connect(dest);
    // タイヤスキール
    const sq = this.noiseSrc(), sqf = c.createBiquadFilter(), sqf2 = c.createBiquadFilter(); sqf.type = 'bandpass'; sqf.Q.value = 9; sqf.frequency.value = 1500; sqf2.type = 'bandpass'; sqf2.Q.value = 6; sqf2.frequency.value = 2400;
    const sqg = c.createGain(); sqg.gain.value = 0; sq.connect(sqf); sq.connect(sqf2); sqf.connect(sqg); sqf2.connect(sqg); sqg.connect(dest);
    // 風切り
    const wn = this.noiseSrc(), wf = c.createBiquadFilter(); wf.type = 'lowpass'; wf.frequency.value = 600; const wg = c.createGain(); wg.gain.value = 0; wn.connect(wf); wf.connect(wg); wg.connect(dest);
    // ニトロ噴射音（高域ノイズの連続音）
    const nn = this.noiseSrc(), nbp = c.createBiquadFilter(), nhp = c.createBiquadFilter(), ng2 = c.createGain(); nbp.type = 'bandpass'; nbp.frequency.value = 2200; nbp.Q.value = 0.6; nhp.type = 'highpass'; nhp.frequency.value = 900; ng2.gain.value = 0;
    nn.connect(nbp); nbp.connect(nhp); nhp.connect(ng2); ng2.connect(dest);
    const t = c.currentTime; [o1, o2, o3, lfo, nz, tw, sq, wn, nn, cn, cmod, inz].forEach(o => o.start(t));
    out.gain.setTargetAtTime(isPlayer ? 0.9 : 0.5, t, 0.3);
    const cyl = { i4: 2, i6: 3, v6: 3, v8: 4, v10: 5, v12: 6, flat4: 2, flat6: 3, rotary: 2 }[spec.sound] || 2;
    const e = { P, cnf, cam, cmod, cmodG, inf, ing, gear: 1, shiftT: 0, out, pan, lp, eg, o1, o2, o3, g1, g2, g3, lfo, lfoG, ng, nf, tw, twg, sqg, sqf, sqf2, wg, wf, cyl, sound: spec.sound, muffler: spec.muffler || 0, player: isPlayer, nodes: [o1, o2, o3, lfo, nz, tw, sq, wn, nn, cn, cmod, inz], popT: 0, lastThr: 0, nitroG: ng2, nitroF: nbp };
    this.engines.push(e); return e;
  }
  // AudioParam へ非数値を渡すと例外になるため、安全に設定する
  sp(param, v, t, k) { if (isFinite(v) && isFinite(t) && isFinite(k)) { try { param.setTargetAtTime(v, t, k); } catch (x) { } } }
  updateEngine(e, s) { // s: {rpm, thr, boost, slip, speed, redline, dist, panX, limiter}
    if (!e || !this.ok) return; for (const k2 in s) if (typeof s[k2] === 'number' && !isFinite(s[k2])) s[k2] = 0; const c = this.ctx, t = c.currentTime, k = 0.03;
    const P = e.P || ENGINE_PROFILES.i4; const f = s.rpm / 60 * e.cyl * (e.sound === 'rotary' ? 1.0 : 0.5);
    const base = e.sound === 'rotary' ? f * 1.5 : f;
    this.sp(e.o1.frequency, base, t, k); this.sp(e.o2.frequency, base * P.hiMul, t, k); this.sp(e.o3.frequency, base * 0.5, t, k);
    const nr = s.rpm / s.redline;
    const muff = 1 + e.muffler * 0.18;
    // シフトチェンジ：一瞬音が途切れてガチャッ
    if (s.gear !== undefined && s.gear !== e.gear) { if (e.player && s.gear > e.gear && e.gear > 0) { e.shiftT = 0.12; this.noiseBurst(0.05, 900, 2, 0.08); } e.gear = s.gear; }
    if (e.shiftT > 0) e.shiftT -= 1 / 60;
    const load = s.thr * (0.6 + 0.4 * nr);
    this.sp(e.lp.frequency, (300 + s.thr * 1700 * muff + nr * 2600 + P.bright) * (e.shiftT > 0 ? 0.5 : 1), t, k);
    this.sp(e.g2.gain, P.hi * (0.5 + nr * 0.8) * (0.6 + s.thr * 0.6), t, k);
    let vol = (0.16 + s.thr * 0.3 + nr * 0.2) * muff * (e.shiftT > 0 ? 0.35 : 1);
    if (s.limiter) vol *= 0.55 + 0.45 * (Math.sin(t * 160) > 0 ? 1 : 0);
    const distAtt = e.player ? 1 : clamp(1 / (1 + (s.dist || 0) / 18), 0, 1);
    this.sp(e.eg.gain, vol * distAtt, t, s.limiter ? 0.004 : k);
    if (P.lumpy) { this.sp(e.lfo.frequency, f * P.lumpy, t, k); this.sp(e.lfoG.gain, vol * P.lumpAmt * distAtt, t, k); }
    // 燃焼の脈動と吸気音
    if (e.cam) { this.sp(e.cmod.frequency, f, t, k); this.sp(e.cmodG.gain, P.rasp * (0.3 + load) * muff, t, k); this.sp(e.cnf.frequency, 700 + nr * 2400 + P.bright * 0.6, t, k); this.sp(e.inf.frequency, 400 + nr * 1600, t, k); this.sp(e.ing.gain, P.intake * s.thr * (0.3 + nr) * distAtt, t, k); }
    this.sp(e.nf.frequency, 500 + nr * 2500, t, k); this.sp(e.ng.gain, (0.02 + s.thr * 0.05) * muff * distAtt, t, k);
    // ターボ
    this.sp(e.tw.frequency, 2500 + s.boost * 5500, t, 0.05); this.sp(e.twg.gain, s.boost * s.thr * 0.045 * distAtt, t, 0.05);
    // ニトロ
    if (e.nitroG) { this.sp(e.nitroG.gain, s.nitro ? 0.22 * distAtt : 0, t, s.nitro ? 0.04 : 0.15); this.sp(e.nitroF.frequency, 1800 + (s.speed || 0) * 25, t, 0.1); }
    // スキール
    const sl = clamp(s.slip, 0, 1); this.sp(e.sqg.gain, sl * sl * 0.35 * distAtt * (s.snow ? 0.25 : 1), t, 0.04);
    this.sp(e.sqf.frequency, 1100 + sl * 700 + Math.sin(t * 13) * 120, t, 0.05); this.sp(e.sqf2.frequency, 2000 + sl * 900, t, 0.05);
    this.sp(e.wg.gain, clamp(s.speed / 80, 0, 1) * 0.12 * (e.player ? 1 : 0), t, 0.1); this.sp(e.wf.frequency, 300 + s.speed * 12, t, 0.1);
    if (e.pan && s.panX !== undefined) this.sp(e.pan.pan, clamp(s.panX, -1, 1), t, 0.05);
    // アフターファイア
    if (e.player && e.lastThr > 0.8 && s.thr < 0.2 && nr > 0.55 && (e.muffler >= 1 || Math.random() < (P.crackle || 0.3))) { const n = 2 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) setTimeout(() => this.pop(), 40 + i * 70 + Math.random() * 40); }
    e.lastThr = s.thr;
  }
  stopEngine(e) {
    if (!e || !this.ok) return; const t = this.ctx.currentTime; e.out.gain.setTargetAtTime(0, t, 0.1);
    setTimeout(() => { try { e.nodes.forEach(n => n.stop()); e.out.disconnect(); } catch (x) { } }, 600);
    this.engines = this.engines.filter(x => x !== e);
  }
  stopAllEngines() { for (const e of this.engines.slice()) this.stopEngine(e); }
  // ---------------- 音楽 ----------------
  unlocked(t) { return !t.lock || (typeof invHas === 'function' && invHas(t.lock)); }
  tracksFor(cat) { const a = TRACKS.filter(t => (t.cat === cat || (cat === 'race' && t.cat === 'story')) && this.unlocked(t)); return a.length ? a : TRACKS.filter(t => !t.lock); }
  playCat(cat, force = false) {
    this.music.cat = cat;
    if (!force && this.music.track && (this.music.track.cat === cat || (cat === 'race' && this.music.track.cat === 'story')) && this.music.playing) return;
    const list = this.tracksFor(cat); this.play(list[Math.floor(Math.random() * list.length)].id);
  }
  play(id) {
    const tr = TRACKS.find(t => t.id === id) || TRACKS[0]; this.music.track = tr; this.music.playing = true; this.music.paused = false; this.music.step = 0; this.music.bar = 0;
    this.music.next = this.ok ? this.ctx.currentTime + 0.1 : 0; this.prepSong(tr);
    this.listeners.forEach(f => { try { f(tr); } catch (e) { } });
  }
  nextTrack(d = 1) { const all = TRACKS.filter(t => this.unlocked(t)); const i = all.indexOf(this.music.track); this.play(all[(i + d + all.length) % all.length].id); }
  togglePause() { this.music.paused = !this.music.paused; if (!this.music.paused && this.ok) this.music.next = this.ctx.currentTime + 0.05; return this.music.paused; }
  prepSong(tr) {
    const rng = mulberry32(tr.seed * 131); const scale = tr.minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
    const chordNotes = d => [0, 2, 4].map(k => { const idx = d + k; return scale[idx % 7] + 12 * Math.floor(idx / 7); });
    // 2小節モチーフ（32ステップ）×4 フレーズ
    const motif = () => { const m = []; let deg = 4 + Math.floor(rng() * 3); for (let s = 0; s < 32; s++) { const strong = s % 4 === 0, p = strong ? 0.75 : (s % 2 === 0 ? 0.5 : 0.28); if (rng() < p) { deg += Math.floor(rng() * 5) - 2; deg = clamp(deg, 0, 11); m.push({ s, deg, len: rng() < 0.3 ? 3 : 1 }); } } return m; };
    const A = motif(), B = motif(), C = motif();
    this.song = { tr, scale, chordNotes, phr: [A, A, B, C], arpPat: [0, 1, 2, 1, 0, 2, 1, 2], stab: [0, 3, 6, 10, 12, 14].map(x => x) };
  }
  midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  schedule() {
    const M = this.music; if (!this.ok || !M.playing || M.paused || !this.song) return;
    const c = this.ctx, S = this.song, tr = S.tr; const spb = 60 / tr.bpm, st = spb / 4;
    if (M.next < c.currentTime - 0.5) M.next = c.currentTime + 0.05;
    while (M.next < c.currentTime + 0.15) {
      this.playStep(M.step, M.next, st); M.next += st; M.step++;
      if (M.step % 16 === 0) { M.bar++; if (M.bar >= 96) { const list = this.tracksFor(M.cat); const i = list.indexOf(tr); this.play(list[(i + 1) % list.length].id); return; } }
    }
  }
  rockPrep() {
    // 「ジングルベル」（J.L.ピアポント作曲・1857年／パブリックドメイン）サビのメロディ
    const B = 71, C = 72, D = 74, G = 67, A = 69;
    const bars = [[[B, 1], [B, 1], [B, 2]], [[B, 1], [B, 1], [B, 2]], [[B, 1], [D, 1], [G, 1.5], [A, .5]], [[B, 4]], [[C, 1], [C, 1], [C, 1.5], [C, .5]], [[C, 1], [B, 1], [B, 1], [B, .5], [B, .5]], [[B, 1], [A, 1], [A, 1], [B, 1]], [[A, 2], [D, 2]],
      [[B, 1], [B, 1], [B, 2]], [[B, 1], [B, 1], [B, 2]], [[B, 1], [D, 1], [G, 1.5], [A, .5]], [[B, 4]], [[C, 1], [C, 1], [C, 1.5], [C, .5]], [[C, 1], [B, 1], [B, 1], [B, .5], [B, .5]], [[D, 1], [D, 1], [C, 1], [A, 1]], [[G, 4]]];
    const ev = []; bars.forEach((bar, bi) => { let pos = 0; for (const [n, len] of bar) { ev.push({ step: bi * 16 + Math.round(pos * 4), n, len: len * 4 }); pos += len; } });
    this.rock = { ev, chords: [55, 55, 55, 55, 60, 55, 57, 62, 55, 55, 55, 55, 60, 55, 62, 55], third: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] };
  }
  rockStep(step, t, st) {
    if (!this.rock) this.rockPrep(); const R = this.rock; const bus = this.musicBus;
    const intro = 4, loopLen = 32; const s16 = step % 16; const bar = Math.floor(step / 16);
    const inIntro = bar < intro; const lb = inIntro ? 0 : (bar - intro) % loopLen; const pass = inIntro ? -1 : Math.floor((bar - intro) / 16) % 2;
    const root = R.chords[lb % 16];
    // ドラム（ロック）
    if (s16 === 0 || s16 === 8 || s16 === 10) this.kick(t);
    if (s16 === 4 || s16 === 12) { this.clap(t, 0.24); this.noiseBurstAt(t, 0.12, 2500, 0.8, 0.12, 'bandpass'); }
    if (s16 % 2 === 0) this.hat(t, s16 % 4 === 2 ? 0.08 : 0.05, 0.05);
    if (s16 === 0 && (lb % 8 === 0) && !inIntro) this.noiseBurstAt(t, 0.9, 6000, 0.4, 0.14, 'highpass');
    if (s16 % 2 === 0) this.noiseBurstAt(t, 0.07, 9500, 0.5, 0.06, 'highpass'); // そりの鈴
    // ブギーベース
    if (s16 % 2 === 0) { const walk = [0, 0, 4, 4, 7, 7, 9, 7][s16 / 2]; this.synth(t, this.midi(root - 12 + walk), st * 1.7, 'sawtooth', 0.15, 1100); }
    // リズムギター（パワーコード）
    if (!inIntro && s16 % 2 === 0) { for (const iv of [0, 7, 12]) this.synth(t, this.midi(root + iv), st * (s16 % 4 === 2 ? 1.6 : 0.9), 'square', s16 % 4 === 2 ? 0.035 : 0.022, 1800, iv ? 6 : -6); }
    // メロディ
    if (!inIntro) {
      const local = (lb % 16) * 16 + s16; const up = pass === 1 ? 12 : 0;
      for (const e of R.ev) if (e.step === local) {
        const dur = st * e.len * 0.92;
        this.synth(t, this.midi(e.n + up), dur, 'sawtooth', 0.065, 3800, 8, true); this.synth(t, this.midi(e.n + up), dur, 'square', 0.04, 2600, -8, true);
        this.bell(t, this.midi(e.n + 12), 0.05);
      }
    }
  }
  playStep(step, t, st) {
    if (this.song.tr.rock) return this.rockStep(step, t, st);
    const S = this.song, tr = S.tr, s16 = step % 16, bar = Math.floor(step / 16), sec = Math.floor(bar / 8) % 6; // 0 intro 1 A 2 B 3 C 4 C 5 break
    const chordDeg = tr.prog[bar % 4], root = tr.key + S.scale[chordDeg % 7] - 12;
    const notes = S.chordNotes(chordDeg).map(n => tr.key + n);
    const bus = this.musicBus, chill = tr.chill, brk = sec === 5 && bar % 8 < 4;
    // ソフト（ビート控えめのユーロビート）
    if (tr.soft) {
      if (!brk) { if (s16 === 0) this.kick(t, 0.45); if (s16 % 4 === 2 && sec >= 1) this.noiseBurstAt(t, 0.05, 9500, 0.5, 0.025, 'highpass'); }
      if (s16 === 0 && sec !== 5) notes.forEach((n, i) => { this.synth(t, this.midi(n), st * 15.5, 'triangle', 0.045, 1600, i * 5 - 5); this.synth(t, this.midi(n + 12), st * 15.5, 'sawtooth', 0.016, 1100, i * 7 - 7); });
      if (s16 % 2 === 0 && sec !== 5) this.synth(t, this.midi(root + (s16 % 4 === 2 ? 12 : 0)), st * 1.5, 'sawtooth', 0.1, 650 + (s16 % 4 === 2 ? 400 : 0));
      if (sec >= 1 && sec !== 5 && [0, 3, 6, 10, 12, 14].includes(s16)) notes.forEach((n, i) => this.synth(t, this.midi(n + 12), st * 1.2, 'square', 0.022, 2400, i * 4 - 4));
      if (sec >= 1) { const n = notes[S.arpPat[s16 % 8] % 3] + 24; this.synth(t, this.midi(n), st * 0.85, 'triangle', 0.035, 4200, 0, true); if (s16 % 4 === 0) this.bell(t, this.midi(n + 12), 0.025); }
      if (sec >= 2 && sec !== 5 || (sec === 5 && bar % 8 >= 4)) { const ph = S.phr[Math.floor((bar % 8) / 2)]; const pos = (bar % 2) * 16 + s16;
        for (const nt of ph) if (nt.s === pos) { const n = tr.key + 12 + S.scale[nt.deg % 7] + 12 * Math.floor(nt.deg / 7); const dur = st * (nt.len * 2.2); this.synth(t, this.midi(n), dur, 'sawtooth', 0.055, 3600, 6, true); this.synth(t, this.midi(n + 12), dur, 'triangle', 0.035, 5000, -6, true); this.bell(t, this.midi(n + 24), 0.03); } }
      return;
    }
    // ドラム
    if (!brk) {
      if (chill ? s16 % 8 === 0 : s16 % 4 === 0) this.kick(t);
      if (s16 === 4 || s16 === 12) this.clap(t, chill ? 0.12 : 0.22);
      if (s16 % 4 === 2) this.hat(t, chill ? 0.05 : 0.09, 0.09);
      else if (!chill && s16 % 2 === 1) this.hat(t, 0.03, 0.03);
      if (tr.bells && s16 % 2 === 0) this.noiseBurstAt(t, 0.06, 9000, 0.5, 0.04 + (s16 % 4 === 2 ? 0.03 : 0), 'highpass');
    }
    // ベース（オクターブ）
    if (s16 % 2 === 0 && sec !== 5) this.synth(t, this.midi(root + (s16 % 4 === 2 ? 12 : 0)), st * 1.6, 'sawtooth', chill ? 0.12 : 0.16, 900 + (s16 % 4 === 2 ? 600 : 0));
    // スタブ
    if (sec >= 1 && !chill && [0, 3, 6, 10, 12, 14].includes(s16)) notes.forEach((n, i) => this.synth(t, this.midi(n + 12), st * 1.4, 'sawtooth', 0.045, 2800, i * 4 - 4));
    if (chill && s16 === 0) notes.forEach(n => this.synth(t, this.midi(n), st * 15, 'triangle', 0.05, 1800));
    // アルペジオ
    if (sec >= 2 && sec !== 5) { const n = notes[S.arpPat[s16 % 8] % 3] + 24; this.synth(t, this.midi(n), st * 0.9, 'square', chill ? 0.025 : 0.035, 3500, 0, true); }
    // リード
    if (sec === 3 || sec === 4 || (sec === 5 && bar % 8 >= 4) || (chill && sec >= 2)) {
      const ph = S.phr[Math.floor((bar % 8) / 2)]; const pos = (bar % 2) * 16 + s16;
      for (const nt of ph) if (nt.s === pos) {
        const d = nt.deg + chordDeg * 0; const idx = d; const n = tr.key + 12 + S.scale[idx % 7] + 12 * Math.floor(idx / 7);
        const dur = st * (nt.len * 1.8);
        this.synth(t, this.midi(n), dur, 'sawtooth', 0.07, 4200, 7, true); this.synth(t, this.midi(n), dur, 'square', 0.04, 3000, -7, true);
        if (tr.bells) this.bell(t, this.midi(n + 12), 0.06);
      }
    }
  }
  kick(t, v = 1) { const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); g.gain.setValueAtTime(0.9 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(g); g.connect(this.musicBus); o.start(t); o.stop(t + 0.32); }
  clap(t, v) { this.noiseBurstAt(t, 0.14, 1600, 1.2, v, 'bandpass'); this.noiseBurstAt(t + 0.01, 0.1, 1200, 1, v * 0.6, 'bandpass'); }
  hat(t, v, d) { this.noiseBurstAt(t, d, 8000, 0.7, v, 'highpass'); }
  noiseBurstAt(t, dur, freq, q, vol, type) { const c = this.ctx; const s = c.createBufferSource(); s.buffer = this.noise; const f = c.createBiquadFilter(), g = c.createGain(); f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(this.musicBus); s.start(t, Math.random()); s.stop(t + dur + 0.02); }
  synth(t, f, dur, type, vol, cut, det = 0, toDelay = false) {
    if (![t, f, dur, vol, cut, det].every(isFinite)) return;
    const c = this.ctx, o = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain(); o.type = type; o.frequency.value = f; o.detune.value = det;
    fl.type = 'lowpass'; fl.frequency.setValueAtTime(cut, t); fl.frequency.exponentialRampToValueAtTime(Math.max(200, cut * 0.35), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(fl); fl.connect(g); g.connect(this.musicBus); if (toDelay) g.connect(this.delay); o.start(t); o.stop(t + dur + 0.02);
  }
  bell(t, f, vol) { const c = this.ctx; for (const [m, v] of [[1, 1], [2.76, 0.4], [5.4, 0.2]]) { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f * m; g.gain.setValueAtTime(vol * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8); o.connect(g); g.connect(this.musicBus); g.connect(this.delay); o.start(t); o.stop(t + 0.85); } }
}
const AUDIO = new AudioSys();
