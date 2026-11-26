/* ============================================================
   quiz.js — Sessions de quiz interactives (QCM, vrai/faux,
   réponse courte) avec feedback immédiat, mise à jour des boîtes
   Leitner et alimentation du carnet d'erreurs.
   ============================================================ */
import { el, icon, shuffle, answerMatches, toast, progressBar, chip } from './components.js';
import { t, bi, nf } from '../core/i18n.js';
import { getItem, gradeItem } from '../core/leitner.js';
import { addError, addXp, touchStreak, checkBadges, persistProfile } from '../core/store.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

function isCorrect(q, ans) {
  if (q.type === 'qcm') return ans === q.bonne;
  if (q.type === 'vf') return ans === q.bonne;
  return answerMatches(ans, q.acceptees || [], q.type === 'calcul' ? 0.05 : 0.01);
}

/** Lance un quiz dans `root`. questions : tableau du champ "quiz" d'une unité. */
export function buildQuiz(root, { data, unitId, questions }) {
  const state = { idx: 0, correct: 0, answered: false };
  const view = el('section', { class: 'quizview' });
  root.textContent = '';
  root.append(view);

  function renderQuestion() {
    const q = questions[state.idx];
    state.answered = false;
    view.textContent = '';
    const total = questions.length;

    const dots = el('div', { class: 'qdots' });
    questions.forEach((_, i) => {
      const d = el('i');
      if (i < state.idx) d.className = 'done';
      else if (i === state.idx) d.className = 'cur';
      dots.append(d);
    });
    view.append(el('div', { class: 'qbar' },
      el('span', { class: 'n', text: `${nf(state.idx + 1)} / ${nf(total)}` }),
      dots,
    ));

    const qEl = el('div', { class: 'card' });
    qEl.append(el('h3', { text: bi(q.q) }));

    const zone = el('div');
    qEl.append(zone);

    if (q.type === 'qcm') {
      // Ordre d'affichage mélangé : la bonne réponse n'est pas toujours en A
      const order = shuffle(q.choix.map((_, i) => i));
      order.forEach((oi, j) => {
        zone.append(el('button', { class: 'opt', dataset: { k: String(oi) } },
          el('span', { class: 'k', text: LETTERS[j] }), el('bdi', { text: bi(q.choix[oi]) })));
      });
    } else if (q.type === 'vf') {
      for (const [label, val] of [['✔ Vrai / صحيح', true], ['✘ Faux / خطأ', false]]) {
        zone.append(el('button', { class: 'opt', dataset: { k: String(val) } },
          el('span', { class: 'k', text: val ? '✓' : '✗' }), label));
      }
    } else {
      const input = el('input', { type: 'text', inputmode: q.type === 'calcul' ? 'decimal' : 'text',
        placeholder: q.type === 'calcul' ? '123,45' : '…', autocomplete: 'off' });
      zone.append(input);
      zone.append(el('button', { class: 'btn primary', style: 'margin-top:.5rem', text: t('reponse'),
        onclick: () => submit(q.type === 'vf' ? null : input.value, input) }));
    }

    view.append(qEl);
    const feedback = el('div');
    view.append(feedback);
    view.append(nextBtn); // ré-attaché après chaque nettoyage de la vue

    function submit(ans, inputEl) {
      if (state.answered) return;
      state.answered = true;
      const ok = isCorrect(q, ans);
      if (ok) state.correct++;
      const dot = view.querySelector('.qdots i.cur');
      if (dot) dot.classList.add(ok ? 'done' : 'bad');
      // Leitner + carnet
      const ref = `u:${unitId}:${q.id}`;
      gradeItem(getItem(data.srs, ref), ok);
      if (!ok) addError(data, { key: ref, kind: 'quiz', unitId, q: JSON.parse(JSON.stringify(q)) });
      // Marquage visuel
      zone.querySelectorAll('.opt').forEach(btn => {
        btn.disabled = true;
        const k = btn.dataset.k;
        if (k === String(ans) || (q.type === 'vf' && (k === 'true') === !!ans)) btn.classList.add('picked');
        const isBonne = (q.type === 'qcm' && k === String(q.bonne)) ||
                        (q.type === 'vf' && (k === 'true') === !!q.bonne);
        if (isBonne) btn.classList.add('correct');
        if (!ok && k === String(ans) && q.type === 'qcm') btn.classList.add('wrong');
        if (!ok && q.type === 'vf' && k === String(ans) && k !== String(q.bonne)) btn.classList.add('wrong');
      });
      feedback.append(el('div', { class: 'feedback' + (ok ? '' : ' bad') },
        el('strong', { text: ok ? t('bonneReponse') : t('mauvaiseReponse') }),
        q.explication ? el('div', { class: 'why' }, el('bdi', { text: t('explication') + ' : ' + bi(q.explication) })) : null,
      ));
      nextBtn.textContent = state.idx === total - 1 ? t('terminer') : t('suivant');
      nextBtn.disabled = false;
      nextBtn.focus();
    }
    zone.addEventListener('click', e => {
      const btn = e.target.closest('.opt');
      if (!btn || state.answered) return;
      const ans = q.type === 'vf' ? btn.dataset.k === 'true' : Number(btn.dataset.k);
      submit(ans);
    });
    return q;
  }

  const nextBtn = el('button', { class: 'btn primary big', text: t('suivant'), disabled: true });
  nextBtn.addEventListener('click', () => {
    if (!state.answered) return;
    state.idx++;
    if (state.idx >= questions.length) renderEnd();
    else renderQuestion();
  });
  view.append(nextBtn);

  function renderEnd() {
    const total = questions.length;
    const pct = Math.round(100 * state.correct / total);
    const perfect = state.correct === total;
    if (perfect) data.counters.quizPerfect++;
    addXp(data, state.correct * 10 + (perfect ? 5 : 0));
    touchStreak(data, 'quiz', Math.max(3, total));
    const won = checkBadges(data);
    persistProfile();
    view.textContent = '';
    view.append(el('div', { class: 'result-hero' },
      el('b', { text: `${nf(state.correct)} / ${nf(total)}` }),
      el('span', { text: `${t('score')} : ${nf(pct)} %` }),
      el('div', { text: perfect ? t('quizParfait') : t('courage') }),
    ));
    for (const b of won) toast(t('newBadge', { b: t(b.key) }));
    view.append(el('button', { class: 'btn gold big', onclick: () => { state.idx = 0; state.correct = 0; renderQuestion(); } },
      icon('play'), t('recommencer')));
    view.append(el('div', { class: 'note-edit', text: t('carnetIntro') }));
  }

  renderQuestion();
  return view;
}
