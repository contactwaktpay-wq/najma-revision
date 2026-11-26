/* ============================================================
   flashcards.js — Cartes mémoire avec auto-évaluation
   ("Je savais" / "À revoir") branchée sur les boîtes Leitner.
   Priorité aux cartes dues, puis aux cartes neuves (max 12).
   ============================================================ */
import { el, icon, progressBar, toast } from './components.js';
import { t, bi, nf } from '../core/i18n.js';
import { getItem, gradeItem, isDue, NB_BOXES } from '../core/leitner.js';
import { addXp, touchStreak, checkBadges, persistProfile } from '../core/store.js';

export function selectDueCards(cards, srsMap, max = 12) {
  const due = cards.filter(c => {
    const it = srsMap[`f:${c.id}`];
    return !it || isDue(it);
  });
  const rest = cards.filter(c => {
    const it = srsMap[`f:${c.id}`];
    return it && !isDue(it);
  });
  return due.slice(0, max).concat(rest.slice(0, 0));
}

/** Lance une session de flashcards dans `root`. */
export function buildFlashcards(root, { data, unitId, cards }) {
  const session = selectDueCards(cards, data.srs);
  const view = el('section');
  root.textContent = '';

  if (!session.length) {
    view.append(el('div', { class: 'empty' }, icon('star'),
      el('p', { text: t('rienAfaire') })));
    root.append(view);
    return view;
  }

  let idx = 0, okCount = 0;
  const counter = el('div', { class: 'qbar' });
  const cardZone = el('div');
  const navZone = el('div');

  view.append(counter, cardZone, navZone);
  root.append(view);

  function render() {
    counter.textContent = '';
    counter.append(el('span', { class: 'n', text: `${nf(idx + 1)} / ${nf(session.length)}` }),
      progressBar(Math.round(100 * idx / session.length)));

    const c = session[idx];
    const ref = `f:${unitId}:${c.id}`;
    let flipped = false;

    const big = el('div', { class: 'big' });
    const hint = el('div', { class: 'hint' });
    const fc = el('div', { class: 'fc', role: 'button', tabindex: 0, 'aria-label': t('flip') }, big, hint);

    const draw = () => {
      big.textContent = '';
      navZone.textContent = '';
      if (!flipped) {
        big.append(el('bdi', { text: bi(c.recto) }));
        hint.textContent = t('flip');
      } else {
        big.append(el('div', { class: 'tag', text: t('resultat') }), el('bdi', { text: bi(c.verso) }));
        navZone.append(btns(c, ref));
      }
    };
    const flip = () => {
      flipped = !flipped;
      fc.classList.toggle('revealed', flipped);
      draw();
    };
    fc.addEventListener('click', flip);
    fc.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });

    cardZone.textContent = '';
    cardZone.append(el('div', { class: 'fcwrap' }, fc));
    draw();
  }

  function btns(c, ref) {
    const wrap = el('div', { class: 'grid two' });
    wrap.append(
      el('button', { class: 'btn', text: '🔁 ' + t('aRevoir'), onclick: () => grade(false) }),
      el('button', { class: 'btn primary', text: '✓ ' + t('jeSavais'), onclick: () => grade(true) }),
    );
    function grade(ok) {
      const item = getItem(data.srs, ref);
      const wasMastered = item.box >= NB_BOXES;
      gradeItem(item, ok);
      if (ok && item.box >= NB_BOXES && !wasMastered) data.counters.cardsMastered++;
      addXp(data, ok ? 2 : 0);
      if (ok) okCount++;
      idx++;
      if (idx >= session.length) end();
      else render();
    }
    return wrap;
  }

  function end() {
    touchStreak(data, 'flashcards', session.length);
    const won = checkBadges(data);
    persistProfile();
    view.textContent = '';
    view.append(el('div', { class: 'result-hero' },
      el('b', { text: nf(okCount) }),
      el('span', { text: `${t('carteMaitrisee')} · ${t('score')} : ${nf(Math.round(100 * okCount / session.length))} %` }),
    ));
    for (const b of won) toast(t('newBadge', { b: t(b.key) }));
    view.append(el('button', { class: 'btn gold big', onclick: () => buildFlashcards(root, { data, unitId, cards }) },
      icon('play'), t('recommencer')));
  }

  render();
  return view;
}
