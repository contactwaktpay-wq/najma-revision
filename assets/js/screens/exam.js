/* ============================================================
   exam.js (écrans) — Liste des examens blancs du niveau puis
   lancement de l'épreuve chronométrée (moteur ui/exam.js).
   ============================================================ */
import { el, icon, appHeader, chip, langToggle } from '../ui/components.js';
import { t, bi, setLang, nf } from '../core/i18n.js';
import { loadCatalogue, examensOf, examenById, fetchExamen } from '../core/content.js';
import { currentProfile, profileData } from '../core/store.js';
import { runExam } from '../ui/exam.js';
import { navigate } from '../core/router.js';

export async function buildExamList() {
  const cat = await loadCatalogue();
  const profile = currentProfile();
  if (!profile) { navigate('#/onboarding'); return { root: el('div') }; }
  setLang(profile.lang || 'fr');
  const data = profileData();
  const root = el('div');

  root.append(appHeader(t('examens'), { back: { hash: '#/home', label: t('accueil') } }));

  const list = examensOf(profile.niveau);
  if (!list.length) {
    root.append(el('div', { class: 'empty' }, icon('clock'), el('p', { text: t('aucunExamen') })));
    return { root };
  }
  for (const e of list) {
    const done = data.counters.examsDone > 0 && data.progress['exam:' + e.id]?.done;
    root.append(el('button', { class: 'listrow', onclick: () => navigate('#/examen/' + e.id) },
      el('span', { class: 'ic', html: icon('clock') }),
      el('span', { class: 'grow' },
        el('span', { class: 't', text: bi(e.titre) }),
        el('br'), el('span', { class: 's', text: `${nf(e.duree_min)} ${t('minutes')} · ${t('bareme')} /${nf(e.note_max)}` })),
      done ? chip(t('examenTermine'), 'ok') : el('span', { class: 'chip gold', text: '→' })));
  }
  root.append(el('div', { class: 'note-edit', text: t('carnetIntro') }));
  return { root };
}

export async function buildExamRun([examId]) {
  const cat = await loadCatalogue();
  const meta = examenById(examId);
  const profile = currentProfile();
  if (!meta || !profile) { navigate('#/home'); return { root: el('div') }; }
  setLang(profile.lang || 'fr');
  const data = profileData();
  const exam = await fetchExamen(meta.path);
  const root = el('div');

  const header = appHeader(bi(exam.titre), { back: { hash: '#/examens', label: t('retour') } });
  root.append(header);

  // Consignes avant l'épreuve
  const intro = el('div');
  intro.append(el('h2', { text: t('consignes') }));
  const ul = el('ul');
  for (const c of (exam.consignes[profile.lang || 'fr'] || exam.consignes.fr)) ul.append(el('li', {}, el('bdi', { text: c })));
  intro.append(ul);
  intro.append(el('p', { class: 'row' }, chip(`${t('duree')} : ${nf(exam.duree_min)} ${t('minutes')}`, 'brand'),
    chip(`${t('bareme')} : /${nf(exam.note_max)}`, 'gold')));
  const start = el('button', { class: 'btn gold big', text: '▶ ' + t('commencerExamen'), style: 'margin-top:1rem' });
  intro.append(start);
  root.append(intro);

  start.addEventListener('click', () => {
    intro.remove();
    const runner = runExam(root, { data, exam });
    runner.onExit = () => navigate('#/examens');
  });

  return { root };
}
