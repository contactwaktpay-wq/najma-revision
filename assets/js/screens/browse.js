/* ============================================================
   browse.js — Écran niveau (liste des matières) et écran matière
   (liste des unités avec progression et statut éditorial).
   ============================================================ */
import { el, icon, progressBar, chip, appHeader, langToggle } from '../ui/components.js';
import { t, bi, setLang, nf } from '../core/i18n.js';
import { loadCatalogue, getCatalogue, loadMatieres, unitesOf, matieresOf, examensOf } from '../core/content.js';
import { currentProfile, profileData } from '../core/store.js';
import { navigate } from '../core/router.js';

/* ---------- Écran NIVEAU ---------- */
export async function buildNiveau([levelId]) {
  const cat = await loadCatalogue();
  await loadMatieres();
  const profile = currentProfile();
  if (profile) setLang(profile.lang || 'fr');
  const n = cat.niveaux.find(x => x.id === levelId);
  const root = el('div');
  if (!n) { navigate('#/home'); return { root: el('div') }; }

  root.append(appHeader(bi(n.label), { back: { hash: '#/home', label: t('accueil') },
    langBtn: profile ? langToggle(profile.lang || 'fr', async l => { profile.lang = l; setLang(l); navigate(location.hash); }) : null }));

  const grid = el('div', { class: 'grid two' });
  for (const mid of matieresOf(n.id, profile?.serie)) {
    const m = cat.matieres[mid];
    const published = unitesOf(n.id, mid).filter(u => u.statut === 'PUBLIE');
    grid.append(el('button', { class: 'tile', onclick: () => navigate(`#/matiere/${n.id}/${mid}`) },
      el('span', { class: 'ic', html: icon(m.icone || 'book') }),
      el('span', { text: bi(m.label) }),
      el('small', { text: published.length ? `${nf(published.length)} ${t('chapitres')}` : t('bientot') })));
  }
  root.append(grid);

  const exams = examensOf(n.id);
  if (exams.length) {
    root.append(el('div', { class: 'section-t' }, t('examens')));
    for (const e of exams) {
      root.append(el('button', { class: 'listrow', onclick: () => navigate('#/examen/' + e.id) },
        el('span', { class: 'ic', html: icon('clock') }),
        el('span', { class: 'grow' }, el('span', { class: 't', text: bi(e.titre) }),
          el('br'), el('span', { class: 's', text: `${nf(e.duree_min)} ${t('minutes')} · /${nf(e.note_max)}` })),
        el('span', { class: 'chip gold', text: '→' })));
    }
  }
  return { root };
}

/* ---------- Écran MATIÈRE ---------- */
export async function buildMatiere([levelId, matId]) {
  const cat = await loadCatalogue();
  await loadMatieres();
  const profile = currentProfile();
  if (profile) setLang(profile.lang || 'fr');
  const data = profileData();
  const m = cat.matieres[matId];
  const n = cat.niveaux.find(x => x.id === levelId);
  const root = el('div');
  if (!m || !n) { navigate('#/home'); return { root: el('div') }; }

  root.append(appHeader(bi(m.label), {
    back: { hash: profile && profile.niveau === levelId ? '#/home' : '#/niveau/' + levelId, label: t('retour') },
    langBtn: profile ? langToggle(profile.lang || 'fr', async l => { profile.lang = l; setLang(l); navigate(location.hash); }) : null,
  }));

  const units = unitesOf(levelId, matId);
  if (!units.length) {
    root.append(el('div', { class: 'empty' }, icon('star'),
      el('h2', { text: t('bientot') }),
      el('p', { text: t('carnetIntro') })));
    return { root };
  }

  for (const u of units) {
    const p = data.progress[u.id] || {};
    const done = (p.fiche ? 1 : 0) + (p.quizBest != null ? 1 : 0) + ((p.exDone?.length || 0) > 0 ? 1 : 0);
    const pct = Math.round(100 * done / 3);
    const row = el('button', { class: 'listrow unitrow', onclick: () => navigate('#/chapitre/' + u.id) },
      el('span', { class: 'ic', html: icon('book') }),
      el('span', { class: 'grow' },
        el('span', { class: 't', text: bi(u.titre) }),
        el('br'),
        el('span', { class: 's', text: `${nf(u.duree_min)} ${t('minutes')}` }),
        u.statut === 'A_RELIRE' ? chip(t('enRelire'), 'warn') : null),
      el('span', { class: 'pct', text: `${nf(pct)}%` }));
    row.append(progressBar(pct));
    // la barre sous forme compacte dans la carte
    row.lastChild.classList.add('grow');
    row.lastChild.style.flexBasis = '70px';
    root.append(row);
  }
  return { root };
}
