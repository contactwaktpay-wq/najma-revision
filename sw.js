/* Généré automatiquement par tools/build.py — ne pas éditer la liste. */
const VERSION = 'najma-v1-1-20261125';
const PRECACHE = [
  "index.html",
  "manifest.webmanifest",
  "assets/css/base.css",
  "assets/css/ui.css",
  "assets/js/main.js",
  "assets/js/screens/browse.js",
  "assets/js/screens/chapter.js",
  "assets/js/screens/errors.js",
  "assets/js/screens/exam.js",
  "assets/js/screens/home.js",
  "assets/js/screens/onboarding.js",
  "assets/js/screens/parent.js",
  "assets/js/screens/planner.js",
  "assets/js/screens/settings.js",
  "assets/js/core/content.js",
  "assets/js/core/db.js",
  "assets/js/core/i18n.js",
  "assets/js/core/leitner.js",
  "assets/js/core/planner.js",
  "assets/js/core/router.js",
  "assets/js/core/store.js",
  "assets/js/ui/components.js",
  "assets/js/ui/exam.js",
  "assets/js/ui/flashcards.js",
  "assets/js/ui/quiz.js",
  "assets/img/logo-mono.svg",
  "assets/img/logo-texte.svg",
  "assets/img/logo.svg",
  "assets/img/icons/apple-touch-icon.png",
  "assets/img/icons/favicon-32.png",
  "assets/img/icons/icon-192.png",
  "assets/img/icons/icon-512.png",
  "assets/img/icons/maskable-192.png",
  "assets/img/icons/maskable-512.png",
  "content/_TEMPLATE.json",
  "content/_matieres.json",
  "content/catalogue.json",
  "content/examens/EX-4AS-brevet.json",
  "content/examens/EX-6AF-concours.json",
  "content/examens/EX-7ASD-bac.json",
  "content/lycee/7AS/commun/histoire_geo/index.json",
  "content/lycee/7AS/commun/anglais/index.json",
  "content/lycee/7AS/commun/philosophie/index.json",
  "content/lycee/7AS/commun/francais/index.json",
  "content/lycee/7AS/commun/education_islamique/index.json",
  "content/lycee/7AS/serie-D/physique_chimie/index.json",
  "content/lycee/7AS/serie-D/mathematiques/index.json",
  "content/lycee/7AS/serie-D/mathematiques/u1-limites-continuite.json",
  "content/lycee/7AS/serie-D/mathematiques/u2-derivations.json",
  "content/lycee/7AS/serie-D/mathematiques/u3-suites.json",
  "content/lycee/7AS/serie-D/mathematiques/u4-exp-ln.json",
  "content/lycee/7AS/serie-D/mathematiques/u5-integration.json",
  "content/lycee/7AS/serie-D/mathematiques/u6-probabilites.json",
  "content/lycee/7AS/serie-D/sciences_naturelles/index.json",
  "content/lycee/7AS/serie-D/sciences_naturelles/u1-reproduction-humaine.json",
  "content/lycee/7AS/serie-D/sciences_naturelles/u2-genetique.json",
  "content/lycee/7AS/serie-D/sciences_naturelles/u3-immunologie.json",
  "content/lycee/7AS/serie-D/sciences_naturelles/u4-glycemie.json",
  "content/lycee/7AS/serie-D/sciences_naturelles/u5-evolution-biodiversite.json",
  "content/lycee/7AS/serie-A/physique_chimie/index.json",
  "content/lycee/7AS/serie-A/mathematiques/index.json",
  "content/lycee/7AS/serie-A/arabe/index.json",
  "content/lycee/7AS/serie-C/physique_chimie/index.json",
  "content/lycee/7AS/serie-C/mathematiques/index.json",
  "content/lycee/7AS/serie-C/arabe/index.json",
  "content/lycee/7AS/serie-C/sciences_naturelles/index.json",
  "content/lycee/6AS/physique_chimie/index.json",
  "content/lycee/6AS/mathematiques/index.json",
  "content/lycee/6AS/arabe/index.json",
  "content/lycee/6AS/histoire_geo/index.json",
  "content/lycee/6AS/sciences_naturelles/index.json",
  "content/lycee/6AS/anglais/index.json",
  "content/lycee/6AS/francais/index.json",
  "content/lycee/6AS/education_islamique/index.json",
  "content/lycee/5AS/physique_chimie/index.json",
  "content/lycee/5AS/mathematiques/index.json",
  "content/lycee/5AS/arabe/index.json",
  "content/lycee/5AS/histoire_geo/index.json",
  "content/lycee/5AS/sciences_naturelles/index.json",
  "content/lycee/5AS/anglais/index.json",
  "content/lycee/5AS/francais/index.json",
  "content/lycee/5AS/education_islamique/index.json",
  "content/fondamental/5AF/mathematiques/index.json",
  "content/fondamental/5AF/arabe/index.json",
  "content/fondamental/5AF/histoire_geo/index.json",
  "content/fondamental/5AF/francais/index.json",
  "content/fondamental/5AF/sciences/index.json",
  "content/fondamental/5AF/education_islamique/index.json",
  "content/fondamental/2AF/mathematiques/index.json",
  "content/fondamental/2AF/arabe/index.json",
  "content/fondamental/2AF/francais/index.json",
  "content/fondamental/2AF/education_islamique/index.json",
  "content/fondamental/1AF/mathematiques/index.json",
  "content/fondamental/1AF/arabe/index.json",
  "content/fondamental/1AF/francais/index.json",
  "content/fondamental/1AF/education_islamique/index.json",
  "content/fondamental/6AF/mathematiques/index.json",
  "content/fondamental/6AF/mathematiques/u1-nombres.json",
  "content/fondamental/6AF/mathematiques/u10-temps-durees.json",
  "content/fondamental/6AF/mathematiques/u11-symetrie.json",
  "content/fondamental/6AF/mathematiques/u12-problemes-synthese.json",
  "content/fondamental/6AF/mathematiques/u2-operations.json",
  "content/fondamental/6AF/mathematiques/u3-fractions.json",
  "content/fondamental/6AF/mathematiques/u4-proportionnalite.json",
  "content/fondamental/6AF/mathematiques/u5-geometrie.json",
  "content/fondamental/6AF/mathematiques/u6-mesures.json",
  "content/fondamental/6AF/mathematiques/u7-perimetres-aires.json",
  "content/fondamental/6AF/mathematiques/u8-mesures-agraires.json",
  "content/fondamental/6AF/mathematiques/u9-volumes.json",
  "content/fondamental/6AF/arabe/index.json",
  "content/fondamental/6AF/histoire_geo/index.json",
  "content/fondamental/6AF/francais/index.json",
  "content/fondamental/6AF/francais/u1-phrase.json",
  "content/fondamental/6AF/francais/u10-pronoms-prepositions.json",
  "content/fondamental/6AF/francais/u11-vocabulaire-avance.json",
  "content/fondamental/6AF/francais/u12-orthographe-avance.json",
  "content/fondamental/6AF/francais/u2-noms-et-determinants.json",
  "content/fondamental/6AF/francais/u3-temps-du-recit.json",
  "content/fondamental/6AF/francais/u4-orthographe-homophones.json",
  "content/fondamental/6AF/francais/u5-vocabulaire.json",
  "content/fondamental/6AF/francais/u6-production-ecrite.json",
  "content/fondamental/6AF/francais/u7-conjugaison-present.json",
  "content/fondamental/6AF/francais/u8-conjugaison-futur-pc.json",
  "content/fondamental/6AF/francais/u9-adjectifs.json",
  "content/fondamental/6AF/sciences/index.json",
  "content/fondamental/6AF/education_islamique/index.json",
  "content/fondamental/6AF/education_islamique/u1-sourates-courtes.json",
  "content/fondamental/4AF/mathematiques/index.json",
  "content/fondamental/4AF/arabe/index.json",
  "content/fondamental/4AF/francais/index.json",
  "content/fondamental/4AF/sciences/index.json",
  "content/fondamental/4AF/education_islamique/index.json",
  "content/fondamental/3AF/mathematiques/index.json",
  "content/fondamental/3AF/arabe/index.json",
  "content/fondamental/3AF/francais/index.json",
  "content/fondamental/3AF/sciences/index.json",
  "content/fondamental/3AF/education_islamique/index.json",
  "content/college/4AS/physique_chimie/index.json",
  "content/college/4AS/mathematiques/index.json",
  "content/college/4AS/mathematiques/u1-calculs.json",
  "content/college/4AS/mathematiques/u2-calcul-litteral.json",
  "content/college/4AS/mathematiques/u3-equations.json",
  "content/college/4AS/mathematiques/u4-geometrie.json",
  "content/college/4AS/mathematiques/u5-trigonometrie.json",
  "content/college/4AS/mathematiques/u6-statistiques.json",
  "content/college/4AS/arabe/index.json",
  "content/college/4AS/histoire_geo/index.json",
  "content/college/4AS/sciences_naturelles/index.json",
  "content/college/4AS/sciences_naturelles/u1-classification.json",
  "content/college/4AS/sciences_naturelles/u2-alimentation-digestion.json",
  "content/college/4AS/sciences_naturelles/u3-respiration-circulation.json",
  "content/college/4AS/sciences_naturelles/u4-puberte-reproduction.json",
  "content/college/4AS/sciences_naturelles/u5-sante-maladies.json",
  "content/college/4AS/sciences_naturelles/u6-equilibres-naturels.json",
  "content/college/4AS/anglais/index.json",
  "content/college/4AS/francais/index.json",
  "content/college/4AS/education_islamique/index.json",
  "content/college/2AS/mathematiques/index.json",
  "content/college/2AS/arabe/index.json",
  "content/college/2AS/histoire_geo/index.json",
  "content/college/2AS/sciences_naturelles/index.json",
  "content/college/2AS/francais/index.json",
  "content/college/2AS/education_islamique/index.json",
  "content/college/3AS/physique_chimie/index.json",
  "content/college/3AS/mathematiques/index.json",
  "content/college/3AS/arabe/index.json",
  "content/college/3AS/histoire_geo/index.json",
  "content/college/3AS/sciences_naturelles/index.json",
  "content/college/3AS/anglais/index.json",
  "content/college/3AS/francais/index.json",
  "content/college/3AS/education_islamique/index.json",
  "content/college/1AS/mathematiques/index.json",
  "content/college/1AS/arabe/index.json",
  "content/college/1AS/histoire_geo/index.json",
  "content/college/1AS/sciences_naturelles/index.json",
  "content/college/1AS/francais/index.json",
  "content/college/1AS/education_islamique/index.json"
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    for (let i = 0; i < PRECACHE.length; i += 20) {
      const chunk = PRECACHE.slice(i, i + 20);
      await Promise.all(chunk.map(u => cache.add(u).catch(() => {})));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req);
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && res.status === 200) cache.put(req, res.clone());
      return res;
    } catch (err) {
      // Mode avion : retomber sur la coquille applicative
      const shell = await cache.match('./index.html');
      if (shell) return shell;
      throw err;
    }
  })());
});

self.addEventListener('message', (e) => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
