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

/* Repli de sécurité : si _matieres.json est absent (hébergeur qui exclut
   les fichiers à underscore), l'app fonctionne quand même. */
const MATIERES_FALLBACK = {
  arabe: { label: { fr: 'Arabe · اللغة العربية', ar: 'اللغة العربية' }, icone: 'book' },
  francais: { label: { fr: 'Français · الفرنسية', ar: 'الفرنسية' }, icone: 'pen' },
  mathematiques: { label: { fr: 'Mathématiques · الرياضيات', ar: 'الرياضيات' }, icone: 'calc' },
  sciences: { label: { fr: 'Sciences · العلوم', ar: 'العلوم' }, icone: 'flask' },
  sciences_naturelles: { label: { fr: 'Sciences naturelles · علوم الطبيعة والحياة', ar: 'علوم الطبيعة والحياة' }, icone: 'leaf' },
  physique_chimie: { label: { fr: 'Physique-Chimie · الفيزياء والكيمياء', ar: 'الفيزياء والكيمياء' }, icone: 'atom' },
  histoire_geo: { label: { fr: 'Histoire-Géographie · التاريخ والجغرافيا', ar: 'التاريخ والجغرافيا' }, icone: 'globe' },
  education_islamique: { label: { fr: 'Éducation islamique · التربية الإسلامية', ar: 'التربية الإسلامية' }, icone: 'star' },
  anglais: { label: { fr: 'Anglais · الإنجليزية', ar: 'الإنجليزية' }, icone: 'globe' },
  philosophie: { label: { fr: 'Philosophie · الفلسفة', ar: 'الفلسفة' }, icone: 'book' },
};

export async function loadMatieres() {
  if (!matieres) {
    if (EMBED) { matieres = EMBED.matieres; return matieres; }
    try {
      const res = await fetch('content/_matieres.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data || typeof data !== 'object' || !data.mathematiques) throw new Error('format invalide');
      matieres = data;
    } catch {
      matieres = MATIERES_FALLBACK; // l'app ne doit jamais s'arrêter pour ce fichier
    }
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
