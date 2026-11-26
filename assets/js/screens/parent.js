/* ============================================================
   parent.js — Espace Parent / Enseignant : protégé par un code PIN
   local (4 chiffres, stocké haché dans le téléphone uniquement).
   Vue synthétique : progression par matière, activité, carnet.
   ============================================================ */
import { el, icon, appHeader, chip, progressBar, toast, modal } from '../ui/components.js';
import { t, bi, setLang, nf, dfDate } from '../core/i18n.js';
import { loadCatalogue, getCatalogue, matieresOf, unitesOf, loadMatieres } from '../core/content.js';
import { currentProfile, profileData, persistProfile, todayISO } from '../core/store.js';
import { masteredCount } from '../core/leitner.js';
import { navigate } from '../core/router.js';

function hashPin(pin) {
  let h = 5381;
  for (const c of String(pin)) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  return 'n' + h.toString(36);
}

export async function build() {
  const cat = await loadCatalogue();
  await loadMatieres();
  const profile = currentProfile();
  if (!profile) { navigate('#/onboarding'); return { root: el('div') }; }
  setLang(profile.lang || 'fr');
  const data = profileData();
  const lang = profile.lang || 'fr';
  const root = el('div');

  root.append(appHeader(t('parent'), { back: { hash: '#/home', label: t('accueil') } }));

  /* ---------- Étape 1 : PIN ---------- */
  const gate = el('div', { class: 'card' });
  root.append(gate);

  function pinInput(label, onDone) {
    const inp = el('input', { type: 'password', inputmode: 'numeric', maxlength: '4', autocomplete: 'off', placeholder: '••••' });
    const btn = el('button', { class: 'btn primary big', text: label });
    const err = el('p', { class: 'chip err', text: '', style: 'display:none' });
    btn.addEventListener('click', () => {
      if (!/^\d{4}$/.test(inp.value)) { err.textContent = t('pinIncorrect'); err.style.display = 'block'; return; }
      onDone(inp.value);
    });
    return el('div', {}, el('label', { class: 'field' }, el('span', { text: label }), inp), btn, err);
  }

  if (!data.parentPin) {
    let first = null;
    gate.append(el('p', {}, el('bdi', { text: t('definirPin') })));
    const step1 = pinInput(t('definirPin'), pin => { first = pin; step1.hidden = true; step2.hidden = false; });
    const step2 = pinInput(t('confirmerPin'), pin => {
      if (hashPin(pin) !== hashPin(first)) {
        step2.querySelector('.chip').textContent = t('pinMismatch');
        step2.querySelector('.chip').style.display = 'block';
        return;
      }
      data.parentPin = hashPin(pin);
      persistProfile();
      gate.remove();
      renderDashboard();
    });
    step2.hidden = true;
    gate.append(step1, step2);
  } else {
    gate.append(el('p', {}, el('bdi', { text: t('saisiPin') })));
    gate.append(pinInput(t('saisiPin'), pin => {
      if (hashPin(pin) !== data.parentPin) {
        gate.querySelector('.chip').textContent = t('pinIncorrect');
        gate.querySelector('.chip').style.display = 'block';
        return;
      }
      gate.remove();
      renderDashboard();
    }));
  }

  /* ---------- Étape 2 : tableau de bord ---------- */
  function renderDashboard() {
    const zone = el('div');
    root.append(zone);

    zone.append(el('h2', { text: profile.name + ' · ' + profile.niveau + (profile.serie ? '/' + profile.serie : '') }));
    const today = todayISO();
    const lastAct = data.history.length ? data.history[data.history.length - 1] : null;
    zone.append(el('div', { class: 'card row' },
      el('div', { class: 'grow' },
        el('b', { text: t('activiteRecente') }),
        el('p', { text: lastAct ? dfDate(lastAct.date) : '—' })),
      el('span', { class: 'chip gold', text: `${nf(data.streak.count)} 🔥` }),
      el('span', { class: 'chip brand', text: `★ ${nf(data.xp)}` })));

    for (const mid of matieresOf(profile.niveau, profile.serie)) {
      const m = cat.matieres[mid];
      const units = unitesOf(profile.niveau, mid);
      const published = units.filter(u => u.statut === 'PUBLIE');
      if (!published.length) continue;
      const started = published.filter(u => data.progress[u.id]?.fiche).length;
      const quizScores = published.map(u => data.progress[u.id]?.quizBest).filter(x => x != null);
      const avg = quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : null;
      const cardsM = masteredCount(data.srs);
      const row = el('div', { class: 'card' },
        el('div', { class: 'row' },
          el('b', { text: bi(m.label) }),
          chip(started === published.length ? t('publie') : `${nf(started)}/${nf(published.length)}`, started === published.length ? 'ok' : '')));
      row.append(progressBar(Math.round(100 * started / published.length)));
      row.append(el('p', { class: 's', text:
        `${t('quiz')} : ${avg != null ? nf(avg) + ' %' : '—'} · ${t('carteMaitrisee')} : ${nf(cardsM)} · ${t('carnet')} : ${nf(data.errors.length)}` }));
      zone.append(row);
    }

    zone.append(el('div', { class: 'note-edit', text: t('donneesLocales') }));
  }

  return { root };
}
