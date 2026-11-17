// =====================================================================
// i18n.js — 言語切り替え（日本語 / English）
// 画面に出る日本語を辞書（I18N_EN）で英語に置き換える。ユーザー名などは .noi18n で除外。
// =====================================================================
const I18N = {
  lang: 'ja', cache: new Map(), maxLen: 1,
  RUN: /[　-ヿ一-鿿＀-￯ー・、。！？（）「」『』〜…％]+/g,
  HAS: /[぀-ヿ一-鿿]/,
  PAT: [
    [/クリスマスまで\s*あと\s*(\d+)\s*日/g, '$1 days until Christmas'], [/あと\s*(\d+)\s*日/g, '$1 days left'], [/(\d+)時間(\d+)分/g, '$1h $2m'],
    [/12月(\d+)日/g, 'Dec $1'], [/ストーリー第(\d+)話クリアで解放/g, 'Unlocked after Story Ch.$1'], [/ストーリー第(\d+)話クリアで販売/g, 'On sale after Story Ch.$1'], [/(\d+)日目/g, 'Day $1']
  ],
  init() {
    try { this.lang = (SAVE.data && SAVE.data.settings.lang) || 'ja'; } catch (e) { this.lang = 'ja'; }
    if (this.lang !== 'en' || typeof I18N_EN === 'undefined') return;
    try { for (const it of ITEMS) if (it.en) I18N_EN[it.name] = it.en; for (const e of EXTRAS) if (e.en) I18N_EN[e.name] = e.en; for (const c of CONSUMABLES) I18N_EN[c.name] = c.en; for (const k of BODY_KITS) I18N_EN[k.name] = k.en; } catch (e) { }
    for (const k in I18N_EN) if (k.length > this.maxLen) this.maxLen = Math.min(60, k.length);
    this.walk(document.body);
    new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') this.node(m.target); else for (const n of m.addedNodes) n.nodeType === 3 ? this.node(n) : n.nodeType === 1 && this.walk(n); } })
      .observe(document.body, { subtree: true, childList: true, characterData: true });
  },
  skip(n) { const p = n.parentElement; return !p || p.closest('.noi18n,script,style,textarea'); },
  node(n) { if (n.nodeType !== 3 || !this.HAS.test(n.nodeValue) || this.skip(n)) return; const t = this.tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; },
  walk(root) {
    if (root.nodeType === 1 && root.closest && root.closest('.noi18n')) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; const list = []; while ((n = w.nextNode())) list.push(n); list.forEach(x => this.node(x));
    if (root.querySelectorAll) root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el => { for (const a of ['placeholder', 'title', 'aria-label']) { const v = el.getAttribute(a); if (v && this.HAS.test(v)) el.setAttribute(a, this.tr(v)); } });
  },
  tr(s) {
    if (this.lang !== 'en' || !s || !this.HAS.test(s)) return s;
    const c = this.cache.get(s); if (c !== undefined) return c;
    let r = s; for (const [re, to] of this.PAT) r = r.replace(re, to);
    r = r.replace(this.RUN, (run, off, str) => { let t = I18N_EN[run]; if (t === undefined) t = this.greedy(run); const nx = str[off + run.length], pv = str[off - 1];
      if (t && /[A-Za-z)%!.,:]$/.test(t) && nx && /[\dA-Za-z¥(]/.test(nx)) t += ' '; if (t && /^[A-Za-z(¥]/.test(t) && pv && /[\dA-Za-z)]/.test(pv)) t = ' ' + t; return t; });
    r = r.replace(/ {2,}/g, ' ');
    if (this.cache.size > 5000) this.cache.clear(); this.cache.set(s, r); return r;
  },
  greedy(run) {
    let out = '', i = 0;
    while (i < run.length) { let hit = false; for (let L = Math.min(this.maxLen, run.length - i); L >= 1; L--) { const t = I18N_EN[run.substr(i, L)]; if (t !== undefined) { if (out && /[A-Za-z]$/.test(out) && /^[A-Za-z]/.test(t)) out += ' '; out += t; i += L; hit = true; break; } } if (!hit) { out += run[i]; i++; } }
    return out;
  }
};
