/* ============================================================
   leitner.js — Répétition espacée (système Leitner, 5 boîtes).
   Boîte 0 = carte neuve ; réussite → boîte suivante ; échec → boîte 1.
   Intervalle de rappel (jours) : 0, 1, 2, 4, 8, 16.
   Clé d'une carte : "u:<unité>:<id>" (quiz/flashcard) — examens → carnet.
   ============================================================ */
export const BOX_DAYS = [0, 1, 2, 4, 8, 16]; // index = boîte 0..5
export const NB_BOXES = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

export function newSrsItem(ref) {
  return { ref, box: 0, due: 0, seen: 0, ok: 0, ko: 0 };
}

/** Met à jour une carte après une réponse. */
export function gradeItem(item, ok, now = Date.now()) {
  item.box = ok ? Math.min(NB_BOXES, item.box + 1) : 1;
  item.due = now + BOX_DAYS[item.box] * DAY_MS;
  item.seen += 1;
  if (ok) item.ok += 1; else item.ko += 1;
  return item;
}

export function isDue(item, now = Date.now()) {
  return !item.due || item.due <= now;
}

/** Cartes à revoir maintenant (dues) parmi un dictionnaire {ref: item}. */
export function dueItems(srsMap, now = Date.now()) {
  return Object.values(srsMap || {}).filter(i => isDue(i, now));
}

/** Nombre de cartes maîtrisées (boîte 5). */
export function masteredCount(srsMap) {
  return Object.values(srsMap || {}).filter(i => i.box >= NB_BOXES).length;
}

/** Récupère (ou crée) la carte d'une ref dans le profil. */
export function getItem(srsMap, ref) {
  if (!srsMap[ref]) srsMap[ref] = newSrsItem(ref);
  return srsMap[ref];
}
