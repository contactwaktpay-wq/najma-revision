/* ============================================================
   content.js — Accès au contenu pédagogique (JSON statiques)
   catalogue.json est chargé une fois ; chaque unité / examen est
   récupéré à la demande (lazy) et mis en cache mémoire.
   ============================================================ */
let catalogue = null;
let matieres = null;
const unitCache = new Map();
const examCache = new Map();

/* Version « fichier unique » : tout le contenu est embarqué dans la page
   (globalThis.NAJMA_CONTENT) → aucun fetch, fonctionne même en file://. */
const EMBED = globalThis.NAJMA_CONTENT || null;

export async function loadCatalogue(force = false) {
  if (!catalogue || force) {
    if (EMBED) { catalogue = EMBED.catalogue; return catalogue; }
    const res = await fetch('content/catalogue.json');
    if (!res.ok) throw new Error('catalogue.json introuvable');
    catalogue = await res.json();
  }
  return catalogue;
}

export async function loadMatieres() {
  if (!matieres) {
    if (EMBED) { matieres = EMBED.matieres; return matieres; }
    const res = await fetch('content/_matieres.json');
    matieres = await res.json();
  }
  return matieres;
}

export function getCatalogue() {
  if (!catalogue) throw new Error('Catalogue non chargé');
  return catalogue;
}

export function niveauById(id) {
  return getCatalogue().niveaux.find(n => n.id === id) || null;
}

export function uniteById(id) {
  return getCatalogue().unites.find(u => u.id === id) || null;
}

export function examenById(id) {
  return getCatalogue().examens.find(e => e.id === id) || null;
}

/** Matières d'un niveau (avec série pour le 7AS). */
export function matieresOf(niveauId, serie) {
  const n = niveauById(niveauId);
  if (!n) return [];
  let ids = [...n.matieres];
  if (niveauId === '7AS' && serie) {
    const s = getCatalogue().series['7AS'].find(x => x.id === serie);
    if (s) ids = ids.concat(s.matieresExtra);
  }
  return ids;
}

export function unitesOf(niveauId, matiereId) {
  return getCatalogue().unites
    .filter(u => u.niveau === niveauId && u.matiere === matiereId)
    .sort((a, b) => a.ordre - b.ordre);
}

export function examensOf(niveauId) {
  return getCatalogue().examens.filter(e => e.niveau === niveauId);
}

/** Charge un fichier d'unité (fiche, exercices, quiz, flashcards). */
export async function fetchUnite(path) {
  if (!unitCache.has(path)) {
    if (EMBED) { unitCache.set(path, EMBED.unites[path]); return unitCache.get(path); }
    const res = await fetch('content/' + path);
    if (!res.ok) throw new Error('Unité introuvable: ' + path);
    unitCache.set(path, await res.json());
  }
  return unitCache.get(path);
}

/** Charge un examen blanc. `path` inclut le préfixe « examens/ » (cf. catalogue). */
export async function fetchExamen(path) {
  if (!examCache.has(path)) {
    if (EMBED) { examCache.set(path, EMBED.examens[path]); return examCache.get(path); }
    const res = await fetch('content/' + path);
    if (!res.ok) throw new Error('Examen introuvable: ' + path);
    examCache.set(path, await res.json());
  }
  return examCache.get(path);
}
