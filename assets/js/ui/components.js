/* ============================================================
   components.js — Petits composants UI partagés + bibliothèque
   d'icônes SVG inline (aucune dépendance externe, RTL natif).
   ============================================================ */

export const ICONS = {
  star: '<path d="M12 3l2.5 5.6 6 .6-4.5 4.1 1.3 5.9L12 16.9 6.7 19.2 8 13.3 3.5 9.2l6-.6z"/>',
  book: '<path d="M4 5a2 2 0 012-2h6v16H6a2 2 0 01-2-2zM12 3h6a2 2 0 012 2v12a2 2 0 01-2 2h-6"/>',
  math: '<path d="M5 5h5M7.5 3v4M13 8l5-5M18 8l-5-5M5 15h5v5H5zM13 14h6M13 18h6"/>',
  letters: '<path d="M4 18L9 5l5 13M5.6 14h6.8M16 8l4 6-4 6"/>',
  leaf: '<path d="M5 19C5 9 13 5 20 5c0 7-4 14-13 14zM5 19c2-4 5-7 9-9"/>',
  flask: '<path d="M10 3h4v5l4.5 8.5A2.5 2.5 0 0116.2 20H7.8a2.5 2.5 0 01-2.3-3.5L10 8zM9 14h6"/>',
  globe: '<path d="M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18"/>',
  mosque: '<path d="M12 3c-3 2.5-6 4-6 7h12c0-3-3-4.5-6-7zM5 10v9M19 10v9M3 19h18M9 19v-4a3 3 0 016 0v4"/>',
  clock: '<path d="M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l4 2"/>',
  calendar: '<path d="M5 6h14v14H5zM5 10h14M9 3v4M15 3v4"/>',
  err: '<path d="M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v5M12 16h.01"/>',
  users: '<path d="M8 11a3 3 0 100-6 3 3 0 000 6zM2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 11a3 3 0 100-6M17 14.5c2.8.8 5 2.8 5 5.5"/>',
  gear: '<path d="M12 9a3 3 0 100 6 3 3 0 000-6zM4 12l-2-1 2-4 2.2.8L8 6.5 7.8 4h4.4L12 6.5l1.8 1.3L16 7l2 4-2 1 2 1-2 4-2.2-.8-1.8 1.3.2 2.5H7.8l.2-2.5-1.8-1.3L4 16l-2-4z" fill="none"/>',
  flame: '<path d="M12 3s5 4 5 9a5 5 0 01-10 0c0-2 1-3.5 2-5 .3 1.4 1 2 2 2.5C10 8 10.5 5.5 12 3z"/>',
  trophy: '<path d="M7 4h10v4a5 5 0 01-10 0zM7 5H4v2a3 3 0 003 3M17 5h3v2a3 3 0 01-3 3M12 13v4M8 21h8M10 17h4"/>',
  check: '<path d="M4 12.5L9.5 18 20 6"/>',
  x: '<path d="M5 5l14 14M19 5L5 19"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 019.5 4 8.5 8.5 0 1020 14.5z"/>',
  sun: '<path d="M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
  upload: '<path d="M12 15V3M7 8l5-5 5 5M4 20h16"/>',
  lock: '<path d="M6 11V8a6 6 0 0112 0v3M5 11h14v9H5zM12 15v2"/>',
  play: '<path d="M7 5l12 7-12 7z"/>',
  home: '<path d="M4 11l8-7 8 7v9H4zM10 20v-6h4v6"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-8M21 20H3"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  cards: '<path d="M7 7h10v10H7zM4 10v10h10" fill="none"/>',
  file: '<path d="M6 3h8l4 4v14H6zM14 3v4h4"/>',
  bell: '<path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21a2 2 0 004 0"/>',
  map: '<path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11zM12 8a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"/>',
};

/** Icône SVG inline (stroke currentColor). */
export function icon(name, cls) {
  const d = ICONS[name] || ICONS.star;
  return `<svg class="i ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
}

/** Création d'éléments : el('button', {class, html, dataset, on}, ...enfants). */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat(9)) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

/* ---------- App bar ---------- */

export function appHeader(title, { back = null, right = null, langBtn = null } = {}) {
  const bar = el('header', { class: 'appbar' });
  if (back) {
    bar.append(el('button', {
      class: 'iconbtn', 'aria-label': back.label, onclick: () => { location.hash = back.hash; },
      html: icon('chev', 'i-chev'),
    }));
  }
  bar.append(el('h1', { text: title }));
  if (langBtn) bar.append(langBtn);
  if (right) bar.append(right);
  // Expose la hauteur réelle de la barre aux éléments collants (chrono, ancres)
  requestAnimationFrame(() => {
    try {
      const h = Math.round(bar.getBoundingClientRect().height) || 64;
      document.documentElement.style.setProperty('--appbar-h', h + 'px');
    } catch { /* ignore */ }
  });
  return bar;
}

/** Bouton bascule langue FR/AR (utilisé dans l'app bar). */
export function langToggle(current, onChange) {
  const b = el('button', { class: 'iconbtn', 'aria-label': 'FR / العربية', text: current === 'ar' ? 'FR' : 'ع' });
  b.addEventListener('click', () => onChange(b.textContent === 'ع' ? 'ar' : 'fr'));
  return b;
}

/* ---------- Toast & modale ---------- */

let toastTimer = null;
export function toast(msg) {
  document.querySelectorAll('.toast').forEach(x => x.remove());
  const t = el('div', { class: 'toast', role: 'status', text: msg });
  document.body.append(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 2600);
}

export function modal({ title, body, okLabel, cancelLabel, danger = false }) {
  return new Promise(resolve => {
    const back = el('div', { class: 'modal-back' });
    const close = v => { back.remove(); resolve(v); };
    const box = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' },
      el('h3', { text: title || '' }),
      body instanceof Node ? body : el('p', { text: body || '' }),
      el('div', { class: 'actions' },
        cancelLabel ? el('button', { class: 'btn ghost', text: cancelLabel, onclick: () => close(false) }) : null,
        el('button', { class: 'btn ' + (danger ? 'danger' : 'primary'), text: okLabel, onclick: () => close(true) }),
      ));
    back.append(box);
    back.addEventListener('click', e => { if (e.target === back) close(false); });
    document.body.append(back);
  });
}

/* ---------- Petits blocs ---------- */

export function progressBar(pct) {
  return el('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 },
    el('i', { style: 'width:' + Math.max(0, Math.min(100, pct)) + '%' }));
}

export function chip(text, tone) {
  return el('span', { class: 'chip ' + (tone || ''), text });
}

export function statBlock(value, label) {
  return el('div', { class: 'stat' }, el('b', { text: value }), el('span', { text: label }));
}

/** Mascotte "Najma" (étoile souriante) pour le skin Fondamental. */
export function mascot(size = 110) {
  return `<svg class="mascot" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32,4 L38.5,23 L58,26 L43,39 L47,58 L32,48 L17,58 L21,39 L6,26 L25.5,23 Z" fill="#F0C75E" stroke="#D9A032" stroke-width="1.5"/>
    <circle cx="26" cy="28" r="2.6" fill="#1C2B36"/>
    <circle cx="38" cy="28" r="2.6" fill="#1C2B36"/>
    <path d="M25 35 Q32 41 39 35" stroke="#1C2B36" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="20" cy="33" r="2.4" fill="#E8927C" opacity=".7"/>
    <circle cx="44" cy="33" r="2.4" fill="#E8927C" opacity=".7"/>
  </svg>`;
}

/* ---------- Utilitaires ---------- */

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Normalise une réponse courte : minuscules, sans accents ni espaces multiples. */
export function normAnswer(s) {
  return String(s || '')
    .trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[?!؟«»"“”()\[\]]/g, '')   // ponctuation de phrase
    .replace(/['\u2019\u00b4`]/g, '')    // apostrophes (qu'est → quest)
    .replace(/[-\u2013\u2014]/g, ' ')    // tirets → espace
    .replace(/\.(?!\d)/g, '')            // point final, jamais la décimale
    .replace(/[،؛]/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Comparaison souple : espaces supprimés + tolérance numérique. */
export function answerMatches(given, accepted, tol = 0.01) {
  const g = normAnswer(given);
  const gNoSpace = g.replace(/\s/g, '');
  for (const a of accepted) {
    const acc = normAnswer(a);
    if (g === acc || gNoSpace === acc.replace(/\s/g, '')) return true;
    const gn = parseFloat(g.replace(',', '.'));
    const an = parseFloat(acc.replace(',', '.'));
    if (!isNaN(gn) && !isNaN(an) && Math.abs(gn - an) <= tol) return true;
  }
  return false;
}
