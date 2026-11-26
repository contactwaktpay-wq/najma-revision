/* ============================================================
   db.js — Couche de stockage local unifiée
   IndexedDB → fallback localStorage → fallback mémoire.
   Toutes les données Najma vivent sous des clés simples (KV).
   ============================================================ */
const DB_NAME = 'najma';
const DB_VERSION = 1;
const STORE = 'kv';
const LS_PREFIX = 'najma:';

let mode = null;          // 'idb' | 'ls' | 'mem'
let dbPromise = null;
const MEMORY = new Map();

function detect() {
  try {
    if (typeof indexedDB !== 'undefined' && indexedDB) { mode = 'idb'; return; }
  } catch { /* ignore */ }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('__najma_probe__', '1');
      localStorage.removeItem('__najma_probe__');
      mode = 'ls';
      return;
    }
  } catch { /* ignore */ }
  mode = 'mem';
}

function openIdb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB bloqué'));
  });
  dbPromise.catch(() => { dbPromise = null; });
  return dbPromise;
}

function txRun(modeTx, fn) {
  return openIdb().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, modeTx);
    const s = t.objectStore(STORE);
    const req = fn(s);
    t.oncomplete = () => resolve(req ? req.result : undefined);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error('Transaction annulée'));
  }));
}

/** Degrade proprement si IndexedDB est indisponible/corrompu. */
function degrade() {
  if (mode === 'idb') mode = (typeof localStorage !== 'undefined') ? 'ls' : 'mem';
  else mode = 'mem';
}

export async function kvGet(key) {
  if (!mode) detect();
  try {
    if (mode === 'idb') return await txRun('readonly', s => s.get(key));
    if (mode === 'ls') {
      const raw = localStorage.getItem(LS_PREFIX + key);
      return raw == null ? undefined : JSON.parse(raw);
    }
    return MEMORY.has(key) ? MEMORY.get(key) : undefined;
  } catch (e) {
    degrade();
    return kvGet(key);
  }
}

export async function kvSet(key, value) {
  if (!mode) detect();
  try {
    if (mode === 'idb') { await txRun('readwrite', s => s.put(value, key)); return; }
    if (mode === 'ls') { localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); return; }
    MEMORY.set(key, value);
  } catch (e) {
    degrade();
    return kvSet(key, value);
  }
}

export async function kvDel(key) {
  if (!mode) detect();
  try {
    if (mode === 'idb') { await txRun('readwrite', s => s.delete(key)); return; }
    if (mode === 'ls') { localStorage.removeItem(LS_PREFIX + key); return; }
    MEMORY.delete(key);
  } catch (e) {
    degrade();
    return kvDel(key);
  }
}

export async function storageKind() {
  if (!mode) detect();
  return mode;
}
