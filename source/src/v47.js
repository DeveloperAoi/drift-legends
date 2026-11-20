// =====================================================================
// v47.js — ストアのページの高さを中身に合わせる・車カード交換を横スクロールのカードに
//          デイリーショップは更新しても必ず6個
// =====================================================================
// ページの高さを一番高いページに合わせる（ムダな余白をなくす）
{ const _vb = vpBind; vpBind = function () { document.querySelectorAll('.vp').forEach(vp => { if (vp._h) return; vp._h = 1; const view = vp.querySelector('.vp-view'), pages = [...vp.querySelectorAll('.vp-page')]; if (!view || !pages.length) return;
      vp.classList.add('vp-measure'); let mx = 0; pages.forEach(p => { mx = Math.max(mx, p.scrollHeight); }); vp.classList.remove('vp-measure');
      const rail = vp.querySelector('.vp-rail'), minH = rail ? Math.min(300, rail.scrollHeight) : 240; vp.style.height = Math.max(minH, Math.min(mx + 4, innerHeight - 140)) + 'px'; }); _vb(); }; }
// 車カード交換：横スクロールのカード（サムネイル＋交換ボタン）
carCardsHTML = function () { const list = Object.entries(CAR_CARDS).filter(([id, cc]) => CAR_BY_ID[id] && (!cc.xmas || carCards(id) > 0 || (typeof xmasPackOpen === 'function' && xmasPackOpen())));
  return `<div class="cc2-row">${list.map(([id, cc], i) => { const c = CAR_BY_ID[id], n = carCards(id), own = SAVE.data.cars.some(x => x.id === id), ok = n >= cc.need, pct = Math.min(100, n / cc.need * 100);
    return `<div class="cc2 ${ok ? 'ready' : ''} ${own ? 'own' : ''}" style="--cc:${c.color};animation-delay:${i * 0.04}s"><div class="cc2-thumb" data-a="ccPrev" data-v="${id}">${packCarSvg(id, 150)}${own ? '<span class="cc2-own">所有中</span>' : ''}</div><b class="cc2-nm">${esc(c.name)}</b><small>${esc(c.maker)}</small><div class="cc2-bar"><i style="width:${pct}%"></i><span>${n} / ${cc.need}</span></div><button class="cc2-btn" data-a="ccTrade" data-v="${id}" ${ok ? '' : 'disabled'}>${ok ? '交換する' : `あと ${cc.need - n} 枚`}</button></div>`; }).join('')}</div>`; };
// デイリーショップ：フィルターで減っても必ず6個（更新した回数ごとにランダム）
{ const _ds = dailyShop; dailyShop = function (key) { const L = _ds(key).slice(0, 6); if (L.length >= 6) return L; const seed = ((key || srvDateKey()) + '#' + ((typeof dsState === 'function' && dsState().n) || 0) + 'fill'); const r = mulberry32([...seed].reduce((a, c) => a * 33 + c.charCodeAt(0), 9) >>> 0);
    const pool = ITEMS.filter(i => !i.lim && !i.mythic && i.rarity !== 'M' && i.rarity !== 'L' && !['carcard', 'ticket', 'cash', 'dia', 'car', 'music'].includes(i.type) && !PROF_TYPES.includes(i.type) && !i.movie && !i.neon && !i.xmas && !L.includes(i));
    while (L.length < 6 && pool.length) L.push(pool.splice(Math.floor(r() * pool.length), 1)[0]); return L; }; }
