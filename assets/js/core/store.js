/* ============================================================
   store.js — État applicatif : profils multiples, progression,
   boîtes Leitner, carnet d'erreurs, réglages. 100 % local.
   ============================================================ */
import { kvGet, kvSet, kvDel } from './db.js';

let cache = null; // { settings, profiles:[Profile], data:{ [profileId]:ProfileData } }

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function newProfileData() {
  return {
    xp: 0,
    streak: { count: 0, best: 0, last: null },
    history: [],            // [{date, kind, minutes}] pour l'espace parent
    progress: {},           // unitId → {fiche, quizBest, exDone:[], done}
    srs: {},                // ref → {box, due, seen, ok, ko}
    errors: [],             // carnet d'erreurs (questions ratées)
    badges: [],             // [{id, date}]
    counters: { quizPerfect: 0, examsDone: 0, carnetCleared: 0, cardsMastered: 0 },
    plan: null,             // planning généré
    parentPin: null,        // hash simple du PIN local
    lastUnit: null,
    createdAt: todayISO(),
  };
}

/** Charge réglages + profils depuis le stockage local. */
export async function initStore() {
  cache = {
    settings: await kvGet('settings') || { lang: null, theme: 'auto', font: 'm', seenLang: false },
    profiles: await kvGet('profiles') || [],
    data: {},
  };
  for (const p of cache.profiles) {
    cache.data[p.id] = (await kvGet('profile:' + p.id)) || newProfileData();
  }
  return cache;
}

export function getStore() {
  if (!cache) throw new Error('Store non initialisé');
  return cache;
}

export function currentProfile() {
  if (!cache) return null;
  return cache.profiles.find(p => p.id === cache.settings.currentProfile) || cache.profiles[0] || null;
}

export function profileData(pid) {
  const p = currentProfile();
  return cache.data[(pid || (p && p.id))] || null;
}

export async function persistMeta() {
  await kvSet('settings', cache.settings);
  await kvSet('profiles', cache.profiles);
}

export async function persistProfile(pid) {
  const p = currentProfile();
  const id = pid || (p && p.id);
  if (id && cache.data[id]) await kvSet('profile:' + id, cache.data[id]);
}

/* ---------- Profils ---------- */

export function listProfiles() { return cache.profiles; }

export async function createProfile({ name, lang, niveau, serie }) {
  const profile = {
    id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: String(name || 'Élève').trim().slice(0, 24),
    lang, niveau, serie: serie || null,
  };
  cache.profiles.push(profile);
  cache.data[profile.id] = newProfileData();
  cache.settings.currentProfile = profile.id;
  if (!cache.settings.lang) cache.settings.lang = lang;
  await persistMeta();
  await persistProfile(profile.id);
  return profile;
}

export async function switchProfile(id) {
  if (!cache.profiles.some(p => p.id === id)) return;
  cache.settings.currentProfile = id;
  await persistMeta();
}

export async function updateProfile(id, patch) {
  const p = cache.profiles.find(x => x.id === id);
  if (!p) return;
  Object.assign(p, patch);
  await persistMeta();
}

export async function deleteProfile(id) {
  cache.profiles = cache.profiles.filter(p => p.id !== id);
  delete cache.data[id];
  await kvDel('profile:' + id);
  if (cache.settings.currentProfile === id) {
    cache.settings.currentProfile = cache.profiles[0] ? cache.profiles[0].id : null;
  }
  await persistMeta();
}

/* ---------- Réglages ---------- */

export async function setSettings(patch) {
  Object.assign(cache.settings, patch);
  await persistMeta();
}

/* ---------- Activité, streak, XP ---------- */

export function addXp(data, amount) {
  data.xp += Math.max(0, Math.round(amount));
}

/** Marque l'activité du jour et calcule la série de jours. */
export function touchStreak(data, kind = 'revision', minutes = 5) {
  const today = todayISO();
  const last = data.streak.last;
  if (last !== today) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
    data.streak.count = (last === yesterday) ? data.streak.count + 1 : 1;
    data.streak.last = today;
    data.streak.best = Math.max(data.streak.best, data.streak.count);
  }
  const h = data.history.find(x => x.date === today);
  if (h) { h.count = (h.count || 1) + 1; h.minutes += minutes; }
  else data.history.push({ date: today, kind, minutes });
  if (data.history.length > 400) data.history = data.history.slice(-400);
}

/* ---------- Badges ---------- */

const BADGE_DEFS = [
  { id: 'p1', key: 'badge_p1', test: d => d.history.length >= 1 },
  { id: 's3', key: 'badge_s3', test: d => d.streak.best >= 3 },
  { id: 's7', key: 'badge_s7', test: d => d.streak.best >= 7 },
  { id: 'qp', key: 'badge_qp', test: d => d.counters.quizPerfect >= 1 },
  { id: 'c20', key: 'badge_c20', test: d => d.counters.cardsMastered >= 20 },
  { id: 'ex1', key: 'badge_ex1', test: d => d.counters.examsDone >= 1 },
  { id: 'cz', key: 'badge_cz', test: d => d.counters.carnetCleared >= 1 },
];

/** Vérifie et attribue les nouveaux badges ; renvoie ceux nouvellement gagnés. */
export function checkBadges(data) {
  const won = [];
  for (const b of BADGE_DEFS) {
    if (!data.badges.some(x => x.id === b.id) && b.test(data)) {
      data.badges.push({ id: b.id, date: todayISO() });
      won.push(b);
    }
  }
  return won;
}

/* ---------- Carnet d'erreurs ---------- */

export function addError(data, entry) {
  if (!data.errors.some(e => e.key === entry.key)) {
    data.errors.push({ ...entry, streakOk: 0 });
  }
}

export function removeError(data, key) {
  const before = data.errors.length;
  data.errors = data.errors.filter(e => e.key !== key);
  if (before > 0 && data.errors.length === 0) data.counters.carnetCleared++;
  return before - data.errors.length;
}

/* ---------- Export / Import ---------- */

export async function exportAll() {
  const payload = { app: 'najma', version: 1, exportedAt: new Date().toISOString(), data: {} };
  payload.settings = cache.settings;
  payload.profiles = cache.profiles;
  for (const p of cache.profiles) {
    payload.data[p.id] = cache.data[p.id];
  }
  return payload;
}

export async function importAll(payload) {
  if (!payload || payload.app !== 'najma' || !Array.isArray(payload.profiles)) {
    throw new Error('format');
  }
  cache.settings = payload.settings || cache.settings;
  cache.profiles = payload.profiles;
  cache.data = {};
  for (const p of cache.profiles) {
    cache.data[p.id] = payload.data?.[p.id] || newProfileData();
    await kvSet('profile:' + p.id, cache.data[p.id]);
  }
  await persistMeta();
}

export { todayISO };
