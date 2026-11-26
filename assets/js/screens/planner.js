/* ============================================================
   planner.js — Planificateur de révision : l'élève saisit la date
   de son examen et son temps quotidien ; le planning quotidien est
   généré et cochable (streak + XP à chaque tâche faite).
   ============================================================ */
import { el, icon, appHeader, chip, langToggle, progressBar, toast } from '../ui/components.js';
import { t, bi, setLang, nf, dfDate } from '../core/i18n.js';
import { loadCatalogue, getCatalogue, matieresOf, unitesOf } from '../core/content.js';
import { currentProfile, profileData, persistProfile, addXp, touchStreak, checkBadges } from '../core/store.js';
import { makePlan, planProgress } from '../core/planner.js';
import { navigate } from '../core/router.js';

export async function build() {
  const cat = await loadCatalogue();
  const profile = currentProfile();
  if (!profile) { navigate('#/onboarding'); return { root: el('div') }; }
  setLang(profile.lang || 'fr');
  const data = profileData();
  const lang = profile.lang || 'fr';
  const root = el('div');

  root.append(appHeader(t('planning'), { back: { hash: '#/home', label: t('accueil') },
    langBtn: langToggle(lang, async l => { profile.lang = l; setLang(l); navigate(location.hash); }) }));

  /* ---------- Formulaire ---------- */
  const todayIso = new Date().toISOString().slice(0, 10);
  const dateInput = el('input', { type: 'date', min: todayIso, value: data.plan?.examDate || '' });
  const minutesSel = el('select', {},
    el('option', { value: '20', text: '20 ' + t('minutes') }),
    el('option', { value: '30', text: '30 ' + t('minutes') }),
    el('option', { value: '45', text: '45 ' + t('minutes') }),
    el('option', { value: '60', text: '60 ' + t('minutes') }),
    el('option', { value: '90', text: '90 ' + t('minutes') }));
  minutesSel.value = String(data.plan?.minutesPerDay || 30);

  const err = el('p', { class: 'chip err', text: '', style: 'display:none;margin:.5rem 0' });
  const gen = el('button', { class: 'btn primary big', style: 'margin-top:.8rem', text: t('generer') });

  const form = el('div', { class: 'card' },
    el('label', { class: 'field' }, el('span', { text: t('dateExamen') }), dateInput),
    el('label', { class: 'field' }, el('span', { text: t('minutesParJour') }), minutesSel),
    err, gen);
  root.append(form);

  gen.addEventListener('click', () => {
    const endISO = dateInput.value;
    if (!endISO || endISO <= todayIso) { err.textContent = t('dateRequise'); err.style.display = 'block'; return; }
    const units = matieresOf(profile.niveau, profile.serie)
      .flatMap(mid => unitesOf(profile.niveau, mid))
      .filter(u => u.statut === 'PUBLIE')
      .map(u => ({ id: u.id, titre: u.titre, duree_min: u.duree_min || 25 }));
    const plan = makePlan({ endISO, minutesPerDay: Number(minutesSel.value), unites: units });
    if (!plan) { err.textContent = t('dateRequise'); err.style.display = 'block'; return; }
    data.plan = plan;
    persistProfile();
    toast(t('planCree'));
    renderPlan();
  });

  /* ---------- Affichage du planning ---------- */
  const planZone = el('div');
  root.append(planZone);

  function renderPlan() {
    planZone.textContent = '';
    if (!data.plan) return;
    const pp = planProgress(data.plan);
    planZone.append(el('h2', { text: t('planModifie') }),
      el('div', { class: 'row', style: 'margin-bottom:.4rem' },
        chip(`${nf(pp.done)}/${nf(pp.total)}`, 'gold'), progressBar(pp.pct)));

    const todayIso2 = new Date().toISOString().slice(0, 10);
    for (const day of data.plan.days) {
      const isToday = day.date === todayIso2;
      const box = el('div', { class: 'plan-day' + (isToday ? ' today' : '') });
      box.append(el('div', { class: 'd' }, icon('calendar'), el('bdi', { text: dfDate(day.date) }),
        isToday ? chip(t('aujourdhui'), 'gold') : null));
      for (const [ti, task] of day.tasks.entries()) {
        const cb = el('input', { type: 'checkbox' });
        cb.checked = !!task.done;
        cb.addEventListener('change', () => {
          task.done = cb.checked;
          if (task.done) { addXp(data, 5); touchStreak(data, task.kind, Math.min(30, task.minutes || 10)); checkBadges(data); }
          persistProfile();
          rowEl.classList.toggle('done', task.done);
        });
        const rowEl = el('label', { class: 'task' + (task.done ? ' done' : '') },
          cb,
          el('span', { class: 'kind k-' + task.kind, text: task.kind }),
          el('span', { class: 'tt' }, el('bdi', { text: bi(task.titre) })),
          el('span', { class: 'min', text: task.minutes ? nf(task.minutes) + ' ' + t('minutes') : '' }));
        if (task.ref && task.kind === 'cours') {
          rowEl.querySelector('.tt').style.cursor = 'pointer';
          rowEl.querySelector('.tt').addEventListener('click', () => navigate('#/chapitre/' + task.ref));
        }
        box.append(rowEl);
      }
      planZone.append(box);
    }
    planZone.append(el('button', { class: 'btn ghost big', style: 'margin-top:.8rem', text: t('generer') + ' ↻',
      onclick: () => { data.plan = null; persistProfile(); planZone.textContent = ''; form.hidden = false; } }));
    form.hidden = true;
  }

  renderPlan();
  return { root };
}
