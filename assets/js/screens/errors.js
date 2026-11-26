/* ============================================================
   errors.js — Carnet d'erreurs : réinjection automatique des
   questions ratées (quiz et examens). 2 bonnes réponses de suite
   → la question sort du carnet.
   ============================================================ */
import { el, icon, appHeader, chip, langToggle } from '../ui/components.js';
import { t, bi, setLang, nf } from '../core/i18n.js';
import { currentProfile, profileData, persistProfile, removeError, addXp, touchStreak, checkBadges } from '../core/store.js';
import { answerMatches, toast } from '../ui/components.js';
import { navigate } from '../core/router.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

function isCorrect(q, ans) {
  if (q.type === 'qcm') return ans === q.bonne;
  if (q.type === 'vf') return ans === q.bonne;
  return answerMatches(ans, q.acceptees || [], q.type === 'calcul' ? 0.05 : 0.01);
}

export async function build() {
  const profile = currentProfile();
  if (!profile) { navigate('#/onboarding'); return { root: el('div') }; }
  setLang(profile.lang || 'fr');
  const data = profileData();
  const lang = profile.lang || 'fr';
  const root = el('div');

  root.append(appHeader(t('carnet'), { back: { hash: '#/home', label: t('accueil') },
    langBtn: langToggle(lang, async l => { profile.lang = l; setLang(l); navigate(location.hash); }) }));

  root.append(el('div', { class: 'note-edit', text: t('carnetIntro') }));
  root.append(el('p', { class: 'row' }, chip(nf(data.errors.length) + ' ' + t('questions'), data.errors.length ? 'err' : 'ok')));

  if (!data.errors.length) {
    root.append(el('div', { class: 'empty' }, icon('check'), el('p', { text: t('carnetVide') })));
    return { root };
  }

  /* Session de rejeu */
  const queue = data.errors.slice();
  const view = el('div');
  root.append(view);
  let idx = 0;

  function render() {
    if (idx >= queue.length) {
      const won = checkBadges(data);
      persistProfile();
      view.textContent = '';
      view.append(el('div', { class: 'result-hero' },
        el('b', { text: '✓' }),
        el('span', { text: t('carnetVide') })));
      for (const b of won) toast(t('newBadge', { b: t(b.key) }));
      view.append(el('button', { class: 'btn primary big', text: t('accueil'), onclick: () => navigate('#/home') }));
      return;
    }
    const entry = queue[idx];
    const q = entry.q;
    view.textContent = '';

    const counter = el('div', { class: 'qbar' },
      el('span', { class: 'n', text: `${nf(idx + 1)} / ${nf(queue.length)}` }));
    view.append(counter);

    const card = el('div', { class: 'card' });
    card.append(el('h3', {}, el('bdi', { text: bi(q.q || q.enonce) })));
    card.append(chip(entry.kind === 'exam' ? t('examens') : t('quiz'), 'brand'));
    const zone = el('div');
    card.append(zone);
    if (q.type === 'qcm') {
      q.choix.forEach((c, i) => zone.append(el('button', { class: 'opt', dataset: { k: String(i) } },
        el('span', { class: 'k', text: LETTERS[i] }), el('bdi', { text: bi(c) }))));
    } else if (q.type === 'vf') {
      for (const [label, k] of [['✔ Vrai / صحيح', 'T'], ['✘ Faux / خطأ', 'F']]) {
        zone.append(el('button', { class: 'opt', dataset: { k } }, label));
      }
    } else {
      const input = el('input', { type: 'text', autocomplete: 'off', placeholder: '…' });
      zone.append(input);
      zone.append(el('button', { class: 'btn primary', style: 'margin-top:.5rem', text: t('reponse'),
        onclick: () => submit(input.value) }));
    }
    const feedback = el('div');
    card.append(feedback);
    view.append(card);

    function mark(ok) {
      if (ok) {
        entry.streakOk = (entry.streakOk || 0) + 1;
        addXp(data, 5);
        if (entry.streakOk >= 2) { removeError(data, entry.key); }
      } else {
        entry.streakOk = 0;
      }
      persistProfile();
      feedback.append(el('div', { class: 'feedback' + (ok ? '' : ' bad') },
        el('strong', { text: ok ? t('bonneReponse') : t('mauvaiseReponse') }),
        q.explication ? el('div', { class: 'why' }, el('bdi', { text: bi(q.explication) })) : null,
        el('div', { class: 'why', text: `${t('carnet')} : ${entry.streakOk}/2` })));
      const next = el('button', { class: 'btn primary big', style: 'margin-top:.6rem', text: t('suivant'),
        onclick: () => { idx++; render(); } });
      view.append(next);
      next.focus();
    }

    function submit(ans) {
      const ok = isCorrect(q, ans);
      zone.querySelectorAll('.opt').forEach(btn => {
        btn.disabled = true;
        const isBonne = (q.type === 'qcm' && btn.dataset.k === String(q.bonne)) ||
          (q.type === 'vf' && (btn.dataset.k === 'T') === !!q.bonne);
        if (isBonne) btn.classList.add('correct');
        if (!ok && q.type === 'qcm' && btn.dataset.k === String(ans)) btn.classList.add('wrong');
        if (!ok && q.type === 'vf' && (btn.dataset.k === 'T') === !!ans && !isBonne) btn.classList.add('wrong');
      });
      mark(ok);
    }

    zone.addEventListener('click', e => {
      const btn = e.target.closest('.opt');
      if (!btn || btn.disabled) return;
      const ans = q.type === 'vf' ? btn.dataset.k === 'T' : Number(btn.dataset.k);
      submit(ans);
    });
  }

  render();
  return { root };
}
