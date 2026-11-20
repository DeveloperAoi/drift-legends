// =====================================================================
// v40.js — パック開封の新演出：①上部をカットして開ける（なぞって切れる） ②裏返して背面のフラップを開ける
//          （爆発・強いフラッシュはなし）
// =====================================================================
{ const _open = PACKFX.open;
  PACKFX.open = function (c, res) { _open.call(this, c, res); const o = this.o; this.mode = SAVE.data.packFxMode === 'back' ? 'back' : SAVE.data.packFxMode === 'cut' ? 'cut' : (Math.random() < 0.5 ? 'cut' : 'back');
    const tip = o.querySelector('.pfx-tip'); if (tip) tip.textContent = this.mode === 'cut' ? 'パックの上の点線をなぞってカット！（ボタンでもOK）' : 'ボタンを押してパックを裏返して開けよう';
    const st = o.querySelector('.pfx-stage'); if (this.mode === 'cut') st.insertAdjacentHTML('beforeend', '<div class="pc-guide"><i></i><span>✂</span></div>');
    o.querySelector('.pfx-ui').insertAdjacentHTML('beforeend', `<div class="pfx-mode"><button data-p="mode:cut" class="${this.mode === 'cut' ? 'on' : ''}">✂ カット</button><button data-p="mode:back" class="${this.mode === 'back' ? 'on' : ''}">↻ 裏から開ける</button></div>`);
    // なぞってカット
    let sx = null, sy = 0, maxX = 0; const rect = () => st.getBoundingClientRect();
    st.onpointerdown = e => { if (this.busy || this.i >= 0 || this.mode !== 'cut') return; const r = rect(); if (e.clientY > r.top + r.height * 0.42) return; sx = e.clientX; sy = e.clientY; maxX = 0; st.setPointerCapture && st.setPointerCapture(e.pointerId); };
    st.onpointermove = e => { if (sx == null) return; const r = rect(), dx = e.clientX - sx; maxX = Math.max(maxX, Math.abs(dx)); const g = st.querySelector('.pc-guide i'); if (g) g.style.width = Math.min(100, maxX / (r.width * 0.75) * 100) + '%'; if (maxX > r.width * 0.75) { sx = null; this.tear(); } };
    st.onpointerup = st.onpointercancel = () => { sx = null; const g = st.querySelector('.pc-guide i'); if (g && this.i < 0) g.style.width = '0'; }; }; }
{ const _oc = PACKFX.onClick; PACKFX.onClick = function (e) { const b = e.target.closest('[data-p^="mode:"]'); if (b) { e.stopPropagation(); if (this.busy || this.i >= 0) return; const m = b.dataset.p.slice(5); this.mode = m; SAVE.data.packFxMode = m; SAVE.save();
      this.o.querySelectorAll('.pfx-mode button').forEach(x => x.classList.toggle('on', x === b)); const g = this.o.querySelector('.pc-guide'); if (m === 'cut' && !g) this.o.querySelector('.pfx-stage').insertAdjacentHTML('beforeend', '<div class="pc-guide"><i></i><span>✂</span></div>'); if (m !== 'cut' && g) g.remove();
      const tip = this.o.querySelector('.pfx-tip'); if (tip) tip.textContent = m === 'cut' ? 'パックの上の点線をなぞってカット！（ボタンでもOK）' : 'ボタンを押してパックを裏返して開けよう'; return; }
    if (e.target.closest('.pfx-stage') && this.i < 0 && !e.target.closest('[data-p]')) { e.stopPropagation(); return; } return _oc.call(this, e); }; }
PACKFX.tear = function () { if (this._torn) return; this._torn = true; setTimeout(() => this._torn = false, 3000); this.busy = true; const o = this.o, st = o.querySelector('.pfx-stage'), pk = st.querySelector('.pk'), top = this.topRar(), col = (this.cols(top) || ['#fff'])[0];
  o.querySelector('.pfx-open').classList.add('hide'); const md = o.querySelector('.pfx-mode'); md && md.remove(); const g = st.querySelector('.pc-guide'); g && g.remove(); AUDIO.pkButton && AUDIO.pkButton();
  pk.classList.remove('float', 'enter'); const html = pk.outerHTML; st.style.setProperty('--gl', col);
  if (this.mode === 'back') {
    st.innerHTML = `<div class="pb-wrap"><div class="pb-flip"><div class="pb-front">${html}</div><div class="pb-back"><div class="pb-body"><span class="pb-seam"></span><b>DRIFT LEGENDS</b><small>OPEN HERE ▲</small></div><div class="pb-flap"><div class="pb-flap-in"></div></div><div class="pb-glow"></div></div></div></div>`;
    const w = st.querySelector('.pb-wrap'); requestAnimationFrame(() => w.classList.add('flip')); AUDIO.pkSelect && AUDIO.pkSelect();
    setTimeout(() => { w.classList.add('peel'); AUDIO.pkTear && AUDIO.pkTear(); }, 900);
    setTimeout(() => { w.classList.add('glow', 'r-' + top); AUDIO.pkCharge && AUDIO.pkCharge(); }, 1350);
    setTimeout(() => { w.classList.add('drop'); this.deal(); }, 1900);
  } else {
    st.innerHTML = `<div class="pc-wrap"><div class="pc-body">${html}<div class="pc-mouth"></div></div><div class="pc-top">${html}</div><div class="pc-cut"></div></div>`;
    const w = st.querySelector('.pc-wrap'); requestAnimationFrame(() => w.classList.add('cutting')); AUDIO.pkCharge && AUDIO.pkCharge();
    setTimeout(() => { w.classList.add('cut'); AUDIO.pkTear && AUDIO.pkTear(); }, 520);
    setTimeout(() => { w.classList.add('glow', 'r-' + top); }, 900);
    setTimeout(() => { w.classList.add('drop'); this.deal(); }, 1500);
  } };
