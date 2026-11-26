/* ============================================================
   main.js — Point d'entrée Najma · نجمة
   Bootstrap : réglages → lang/dir → routeur (écrans lazy) → SW.
   ============================================================ */
import { setLang } from './core/i18n.js';
import { initStore, getStore, currentProfile } from './core/store.js';
import { initRouter } from './core/router.js';

const app = document.getElementById('app');

/* ---------- Réglages visuels ---------- */
function applyLook() {
  const s = getStore().settings;
  const p = currentProfile();
  document.documentElement.dataset.theme = s.theme || 'auto';
  document.documentElement.dataset.font = s.font || 'm';
  const lang = p?.lang || s.lang || 'fr';
  setLang(lang);
}

/* ---------- Routes (écrans chargés à la demande) ---------- */
const ROUTES = [
  { re: /^\/onboarding$/, src: 'onboarding.js', exp: 'build' },
  { re: /^\/home$/, src: 'home.js', exp: 'build' },
  { re: /^\/niveau\/([^/]+)$/, src: 'browse.js', exp: 'buildNiveau' },
  { re: /^\/matiere\/([^/]+)\/([^/]+)$/, src: 'browse.js', exp: 'buildMatiere' },
  { re: /^\/chapitre\/([^/]+)$/, src: 'chapter.js', exp: 'build' },
  { re: /^\/examens$/, src: 'exam.js', exp: 'buildExamList' },
  { re: /^\/examen\/([^/]+)$/, src: 'exam.js', exp: 'buildExamRun' },
  { re: /^\/planning$/, src: 'planner.js', exp: 'build' },
  { re: /^\/parent$/, src: 'parent.js', exp: 'build' },
  { re: /^\/carnet$/, src: 'errors.js', exp: 'build' },
  { re: /^\/reglages$/, src: 'settings.js', exp: 'build' },
  { re: /^\/profils$/, src: 'settings.js', exp: 'buildProfils' },
  // Filet de sécurité : tout chemin inconnu renvoie à l'accueil (jamais de 404)
  { re: /^.*$/, src: 'home.js', exp: 'build' },
];

/* ---------- Démarrage ---------- */
async function start() {
  try {
    await initStore();
    applyLook();

    // Le routeur (assets/js/core/router.js) importe dynamiquement `def.src` :
    // les chemins sont relatifs au dossier screens/ (import différé).
    const defs = ROUTES.map(r => ({
      re: r.re,
      src: `../screens/${r.src}`,
      exp: r.exp,
    }));
    initRouter(app, defs);

    // Route initiale : onboarding sans profil, accueil sinon.
    // Indispensable à la réouverture / rafraîchissement (URL sans hash).
    const p = currentProfile();
    if (!p) {
      if (!location.hash || location.hash === '#/') location.replace('#/onboarding');
    } else if (!location.hash || location.hash === '#/') {
      location.replace('#/home');
    }

    // Service Worker (PWA hors ligne) — https ou localhost uniquement
    if ('serviceWorker' in navigator &&
        (location.protocol === 'https:' ||
         ['localhost', '127.0.0.1'].includes(location.hostname))) {
      try { navigator.serviceWorker.register('sw.js'); } catch { /* support absent */ }
    }
  } catch (err) {
    console.error(err);
    app.textContent = 'Erreur de démarrage : ' + (err?.message || err);
  }
}

start();
