/* ============================================================
   home.js — Accueil adapté à l'âge (3 skins) :
   - Fondamental : tuiles géantes + mascotte ;
   - Collège : série de jours, badges, quiz ;
   - Lycée : dense, compte à rebours Bac, examens blancs.
   ============================================================ */
import { el, icon, progressBar, chip, statBlock, toast, appHeader, langToggle, mascot } from '../ui/components.js';
import { t, bi, setLang, nf } from '../core/i18n.js';
import { loadCatalogue, getCatalogue, loadMatieres, unitesOf, matieresOf, examensOf } from '../core/content.js';
import { currentProfile, profileData, setSettings, switchProfile, listProfiles } from '../core/store.js';
import { dueItems, masteredCount } from '../core/leitner.js';
import { planProgress } from '../core/planner.js';
import { navigate } from '../core/router.js';

export async function build() {
  const cat = await loadCatalogue();
  await loadMatieres();
  const profile = currentProfile();
  if (!profile) { navigate('#/onboarding'); return { root: el('div') }; }
  const data = profileData();
  const lang = profile.lang || 'fr';
  setLang(lang);
  const cycle = cat.niveaux.find(n => n.id === profile.niveau)?.cycle || 'college';
  document.body.dataset.skin = cycle === 'fondamental' ? 'fondamental' : cycle === 'lycee' ? 'lycee' : 'college';

  const root = el('div');
  const langBtn = langToggle(lang, async l => {
    profile.lang = l;
    setLang(l);
    await setSettings({ lang: l });
    navigate('#/home');
  });
  root.append(appHeader(t('bienvenue') + ', ' + profile.name, {
    right: el('button', { class: 'iconbtn', 'aria-label': t('reglages'), html: icon('gear'),
      onclick: () => navigate('#/reglages') }),
    langBtn,
  }));

  /* ----- Bandeau stats ----- */
  const due = dueItems(data.srs).length;
  const stats = el('div', { class: 'card row' });
  stats.append(statBlock('★ ' + nf(data.xp), t('etoiles')));
  stats.append(statBlock(nf(data.streak.count), t('serieJours')));
  stats.append(statBlock(nf(due), t('aReviser')));
  if (cycle === 'fondamental') stats.insertAdjacentHTML('afterbegin', `<div style="flex:0 0 auto">${mascot(64)}</div>`);
  root.append(stats);

  /* ----- Continuer ----- */
  const cat1 = cat;
  const lastUnit = data.lastUnit ? cat1.unites.find(u => u.id === data.lastUnit) : null;
  const firstPub = cat1.unites.find(u => u.niveau === profile.niveau && u.statut === 'PUBLIE');
  const nextUnit = lastUnit || firstPub;
  if (nextUnit) {
    const c = el('button', { class: 'listrow', onclick: () => navigate('#/chapitre/' + nextUnit.id) },
      el('span', { class: 'ic', html: icon('play') }),
      el('span', { class: 'grow' },
        el('span', { class: 't', text: t('continuer') }),
        el('br'), el('span', { class: 's', text: bi(nextUnit.titre) })),
      el('span', { class: 'chip gold', text: '→' }));
    root.append(c);
  }

  /* ----- Compte à rebours (lycée) ----- */
  if (cycle === 'lycee') {
    const todayIso = new Date().toISOString().slice(0, 10);
    let cd = null;
    if (data.plan?.examDate) {
      const days = Math.round((new Date(data.plan.examDate + 'T12:00:00') - new Date(todayIso + 'T12:00:00')) / 86400000);
      const pp = planProgress(data.plan);
      cd = el('div', { class: 'card' },
        el('div', { class: 'row' },
          el('div', { class: 'grow' },
            el('h3', { text: t('bacCountdown') }),
            el('p', { class: 'countdown', text: days >= 0 ? t('joursRestants', { n: nf(days) }) : '—' })),
          el('span', { class: 'chip gold', text: `${nf(pp.pct)} %` })),
        progressBar(pp.pct));
    } else {
      cd = el('button', { class: 'card row', onclick: () => navigate('#/planning') },
        el('span', { class: 'ic', html: icon('calendar') }),
        el('span', { class: 'grow' }, el('span', { class: 't', text: t('planning') }),
          el('br'), el('span', { class: 's', text: t('definirDate') })));
    }
    root.append(cd);
  }

  /* ----- Matières ----- */
  const sec = el('div', { class: 'section-t' }, t('matieres'));
  root.append(sec);
  const matIds = matieresOf(profile.niveau, profile.serie);
  const grid = el('div', { class: cycle === 'fondamental' ? 'grid two' : 'grid two' });
  for (const mid of matIds) {
    const m = cat.matieres[mid];
    const units = unitesOf(profile.niveau, mid);
    const published = units.filter(u => u.statut === 'PUBLIE');
    const done = published.filter(u => data.progress[u.id]?.quizBest != null || data.progress[u.id]?.fiche).length;
    const pct = published.length ? Math.round(100 * done / published.length) : 0;
    const tile = el('button', { class: 'tile', onclick: () => navigate(`#/matiere/${profile.niveau}/${mid}`) },
      el('span', { class: 'ic', html: icon(m.icone || 'book') }),
      el('span', { text: bi(m.label) }),
      published.length ? el('small', { text: `${nf(done)}/${nf(published.length)} · ${nf(pct)}%` }) : el('small', { text: t('bientot') }));
    grid.append(tile);
  }
  root.append(grid);

  /* ----- Outils ----- */
  root.append(el('div', { class: 'section-t' }, t('outils')));
  const tools = el('div', { class: 'toolgrid' });
  const toolDefs = [
    ['carnet', 'err', t('carnet'), nf(data.errors.length)],
    ['planning', 'calendar', t('planning'), data.plan ? bi({ fr: 'actif', ar: 'نشط' }) : '—'],
    ['examens', 'clock', t('examens'), nf(examensOf(profile.niveau).length)],
    ['profils', 'users', t('profils'), nf(listProfiles().length)],
  ];
  for (const [hash, ic, label, info] of toolDefs) {
    tools.append(el('button', { class: 'tile', onclick: () => navigate('#/' + hash) },
      el('span', { class: 'ic', html: icon(ic) }), el('span', { text: label }), el('small', { text: info })));
  }
  root.append(tools);

  /* ----- Badges (collège / lycée) ----- */
  if (cycle !== 'fondamental') {
    root.append(el('div', { class: 'section-t' }, t('badges')));
    const badges = el('div', { class: 'row', style: 'flex-wrap:wrap;gap:8px;overflow-x:auto' });
    const defs = [['p1', 'star', 'badge_p1'], ['s3', 'flame', 'badge_s3'], ['s7', 'flame', 'badge_s7'],
      ['qp', 'trophy', 'badge_qp'], ['c20', 'cards', 'badge_c20'], ['ex1', 'clock', 'badge_ex1'], ['cz', 'check', 'badge_cz']];
    for (const [id, ic, key] of defs) {
      const got = data.badges.some(b => b.id === id);
      badges.append(el('div', { class: 'badge-medal' + (got ? '' : ' locked'), title: t(key) },
        el('span', { class: 'ic', html: icon(ic) }), el('span', { text: t(key) })));
    }
    root.append(badges);
  }

  root.append(el('p', { class: 'empty', text: t('donneesLocales') }));
  return { root };
}
