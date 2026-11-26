/* ============================================================
   router.js — Routeur à hash (#/chemin), écrans chargés en différé.
   Chaque écran est un module importé dynamiquement → poids minimal
   au démarrage (smartphones d'entrée de gamme, 3G instable).
   ============================================================ */
import { el } from '../ui/components.js';

const routes = [];
let outlet = null;
let cleanupFn = null;
let renderSeq = 0;

/** Enregistre l'élément racine et les définitions d'écrans. */
export function initRouter(outletEl, defs) {
  outlet = outletEl;
  defs.forEach(d => routes.push(d));
  window.addEventListener('hashchange', render);
  render();
}

export function navigate(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

function currentPath() {
  return (location.hash || '#/').replace(/^#/, '') || '/';
}

async function render() {
  const path = currentPath();
  const token = ++renderSeq;
  let def = null, match = null;
  for (const d of routes) {
    match = path.match(d.re);
    if (match) { def = d; break; }
  }
  if (cleanupFn) { try { cleanupFn(); } catch { /* noop */ } cleanupFn = null; }
  outlet.textContent = '';
  window.scrollTo(0, 0);
  if (!def) {
    outlet.append(el('div', { class: 'empty' },
      el('h2', {}, '404'), el('p', {}, path)));
    return;
  }
  try {
    const mod = await import(def.src);
    const fn = mod[def.exp] || mod.build;
    if (typeof fn !== 'function') throw new Error('Fonction d\u2019écran introuvable : ' + (def.exp || 'build'));
    const view = await fn(match.slice(1), outlet);
    if (token !== renderSeq) return; // une navigation plus récente a pris le dessus
    if (!view) return;
    if (view instanceof Node) outlet.append(view);
    else {
      if (view.cleanup) cleanupFn = view.cleanup;
      if (view.root) outlet.append(view.root);
    }
  } catch (err) {
    console.error('Écran', path, err);
    if (token === renderSeq) {
      outlet.append(el('div', { class: 'empty' },
        el('h2', {}, 'Oups / عذرًا'),
        el('p', {}, String(err && err.message || err))));
    }
  }
}
