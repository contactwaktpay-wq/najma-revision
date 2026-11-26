/* ============================================================
   exam.js — Moteur d'examens blancs chronométrés au format
   officiel (Concours 6AF, Brevet 4AS, Bac 7AS) : barème par
   question, réponses auto-corrigées + correction guidée pour les
   questions de rédaction, correction détaillée en fin d'épreuve.
   Les erreurs auto-corrigées alimentent le carnet d'erreurs.
   ============================================================ */
import { el, icon, answerMatches, shuffle, modal, toast, progressBar } from './components.js';
import { t, bi, nf } from '../core/i18n.js';
import { addError, addXp, touchStreak, checkBadges, persistProfile } from '../core/store.js';

function flat(exam) {
  const list = [];
  for (const s of exam.sections) {
    for (const q of s.questions) list.push({ sec: s, q });
  }
  return list;
}

function gradeOne(q, ans) {
  if (q.type === 'redaction') return ans || 0; // auto-évaluation (points)
  if (ans == null || ans === '') return 0;
  if (q.type === 'qcm') return ans === q.bonne ? q.points : 0;
  if (q.type === 'vf') return ans === q.bonne ? q.points : 0;
  return answerMatches(ans, q.acceptees || [], q.type === 'calcul' ? 0.05 : 0.01) ? q.points : 0;
}

/** Affiche l'épreuve et renvoie la note obtenue via un callback. */
export function runExam(root, { data, exam }) {
  const items = flat(exam);
  const SSKEY = `najma-exam-${exam.id}`;
  const answers = {};
  let cur = 0;
  let remaining = exam.duree_min * 60;
  let submitted = false;
  let timerId = null;

  // Reprise possible après fermeture accidentelle (même session navigateur)
  try {
    const saved = JSON.parse(sessionStorage.getItem(SSKEY) || 'null');
    if (saved && saved.answers) { Object.assign(answers, saved.answers); cur = saved.cur || 0; remaining = saved.remaining ?? remaining; }
  } catch { /* ignore */ }

  const save = () => {
    try { sessionStorage.setItem(SSKEY, JSON.stringify({ answers, cur, remaining })); } catch { /* ignore */ }
  };

  const view = el('section', { class: 'examview' });
  root.textContent = '';
  root.append(view);

  const clock = el('span', { class: 'clock' });
  const bar = progressBar(0);
  const counter = el('span', { class: 'chip', text: '' });
  const timerbar = el('div', { class: 'timerbar' }, clock, bar, counter);
  const qZone = el('div');
  const navZone = el('div', { class: 'row' });

  view.append(timerbar, qZone, navZone);

  function fmt(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function tick() {
    remaining--;
    clock.textContent = `${t('tempsRestant')} · ${fmt(Math.max(0, remaining))}`;
    bar.firstChild.style.width = `${Math.round(100 * remaining / (exam.duree_min * 60))}%`;
    timerbar.classList.toggle('low', remaining < exam.duree_min * 60 * 0.2);
    if (remaining <= 0) { submit(true); }
    else save();
  }
  timerId = setInterval(tick, 1000);
  clock.textContent = `${t('tempsRestant')} · ${fmt(remaining)}`;

  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

  function render() {
    const it = items[cur];
    const q = it.q;
    counter.textContent = `${nf(cur + 1)} / ${nf(items.length)}`;
    qZone.textContent = '';
    // En-tête de section (barème)
    if (cur === 0 || items[cur - 1].sec !== it.sec) {
      qZone.append(el('div', { class: 'sec-title' },
        el('h3', { text: `${t('secA')} — ${bi(it.sec.titre)}` }),
        el('small', { text: `${nf(it.sec.points)} ${t('points')}` })));
    }
    const card = el('div', { class: 'card examcard' },
      el('div', { class: 'qhead row' },
        el('span', { class: 'qnum', text: q.id }),
        el('bdi', { class: 'grow', text: bi(q.enonce) })),
      el('div', { class: 'pts' }, el('span', { class: 'chip gold', text: `${nf(q.points)} ${t('points')}` })));
    const zone = el('div');
    card.append(zone);

    if (q.type === 'qcm') {
      // Ordre mélangé : la bonne réponse change de place à chaque affichage
      const order = shuffle(q.choix.map((_, i) => i));
      order.forEach((oi, j) => {
        zone.append(el('button', { class: 'opt', dataset: { k: String(oi) } },
          el('span', { class: 'k', text: ['A', 'B', 'C', 'D', 'E'][j] }), el('bdi', { text: bi(q.choix[oi]) })));
      });
    } else if (q.type === 'vf') {
      for (const [label, val, k] of [['✔ Vrai / صحيح', true, 'T'], ['✘ Faux / خطأ', false, 'F']]) {
        zone.append(el('button', { class: 'opt', dataset: { k } }, label));
      }
    } else if (q.type === 'redaction') {
      zone.append(el('div', { class: 'def' }, el('bdi', { text: bi(q.consigne || {}) })));
      const corr = el('div', { class: 'sol', hidden: true },
        ...q.correction.etapes.map(s => el('p', {}, el('bdi', { text: '• ' + bi(s) }))),
        q.correction.resultat ? el('p', { html: `<b>${t('resultat')} :</b> <bdi>${bi(q.correction.resultat)}</bdi>` }) : null);
      zone.append(el('button', { class: 'btn ghost', text: t('voirCorrection'), onclick: e => { corr.hidden = false; e.target.remove(); } }), corr);
      const self = el('div', { class: 'selfscore' });
      self.append(el('span', { text: t('autoEvaluation') }));
      for (let p = 0; p <= q.points; p++) {
        self.append(el('button', { class: 'btn', dataset: { p: String(p) }, text: String(p),
          'aria-pressed': String(answers[q.id] === p) }));
      }
      self.addEventListener('click', e => {
        const b = e.target.closest('button[data-p]');
        if (!b) return;
        answers[q.id] = Number(b.dataset.p);
        self.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(Number(x.dataset.p) === answers[q.id])));
        save();
      });
      zone.append(self);
    } else {
      const input = el('input', { type: 'text', inputmode: q.type === 'calcul' ? 'decimal' : 'text',
        placeholder: '…', autocomplete: 'off' });
      if (answers[q.id] != null) input.value = answers[q.id];
      input.addEventListener('input', () => { answers[q.id] = input.value; save(); });
      zone.append(input);
    }
    qZone.append(card);

    // Sélection qcm / vf
    zone.addEventListener('click', e => {
      const btn = e.target.closest('.opt');
      if (!btn) return;
      if (q.type === 'qcm') answers[q.id] = Number(btn.dataset.k);
      else answers[q.id] = btn.dataset.k === 'T';
      zone.querySelectorAll('.opt').forEach(x => x.setAttribute('aria-pressed', String(x === btn)));
      save();
    });
    zone.querySelectorAll('.opt').forEach(x => {
      const sel = q.type === 'qcm' ? answers[q.id] === Number(x.dataset.k)
        : (x.dataset.k === 'T') === answers[q.id];
      if (answers[q.id] != null && sel) x.setAttribute('aria-pressed', 'true');
    });

    navZone.textContent = '';
    if (cur > 0) navZone.append(el('button', { class: 'btn ghost', text: '← ' + t('precedent'), onclick: () => { cur--; render(); } }));
    if (cur < items.length - 1) {
      navZone.append(el('button', { class: 'btn primary grow', text: t('suivant') + ' →', onclick: () => { cur++; render(); save(); } }));
    } else {
      navZone.append(el('button', { class: 'btn gold grow', text: t('rendre'), onclick: async () => {
        const ok = await modal({ title: t('confirmerRendre'), body: t('donneesLocales'), okLabel: t('rendre'), cancelLabel: t('retour') });
        if (ok) submit(false);
      } }));
    }
  }

  async function submit(auto) {
    if (submitted) return;
    submitted = true;
    stopTimer();
    try { sessionStorage.removeItem(SSKEY); } catch { /* ignore */ }
    if (auto) toast(t('tempsEcoule'));

    // ---- Correction ----
    let score = 0;
    const perSec = new Map();
    for (const it of items) {
      const got = gradeOne(it.q, answers[it.q.id]);
      score += got;
      perSec.set(it.sec, (perSec.get(it.sec) || 0) + got);
      // Carnet d'erreurs pour les questions auto-corrigées ratées
      if (it.q.type !== 'redaction' && got < it.q.points) {
        addError(data, { key: `x:${exam.id}:${it.q.id}`, kind: 'exam', examId: exam.id, q: JSON.parse(JSON.stringify(it.q)) });
      }
    }
    data.counters.examsDone++;
    addXp(data, 25 + Math.floor(score));
    touchStreak(data, 'examen', Math.min(60, Math.round((exam.duree_min || 60) / 4)));
    const won = checkBadges(data);
    persistProfile();

    // ---- Résultats ----
    const pct = Math.round(100 * score / exam.note_max);
    view.textContent = '';
    view.append(el('div', { class: 'result-hero' },
      el('span', { text: t('noteFinale') }),
      el('b', { text: `${nf(score)} / ${nf(exam.note_max)}` }),
      el('span', { text: `${nf(pct)} %` }),
    ));
    const secList = el('div', { class: 'row', style: 'flex-wrap:wrap;gap:6px' });
    for (const s of exam.sections) {
      secList.append(el('span', { class: 'chip brand', text: `${bi(s.titre)} : ${nf(perSec.get(s) || 0)}/${nf(s.points)}` }));
    }
    view.append(secList);
    for (const b of won) toast(t('newBadge', { b: t(b.key) }));

    view.append(el('h2', { text: t('correctionDetaillee') }));
    for (const it of items) {
      const q = it.q;
      const got = gradeOne(q, answers[q.id]);
      const c = el('div', { class: 'exo' });
      c.append(el('p', {}, el('b', { text: q.id + ' · ' }), el('bdi', { text: bi(q.enonce) })),
        el('p', { class: 'row', style: 'gap:6px' },
          el('span', { class: 'chip ' + (got >= q.points ? 'ok' : got > 0 ? 'warn' : 'err'),
            text: `${nf(got)}/${nf(q.points)} ${t('points')}` }),
          el('span', { class: 'chip', text: `${t('votreRep')} : ${q.type === 'qcm' && answers[q.id] != null ? bi(q.choix[answers[q.id]]) : answers[q.id] == null ? '—' : String(answers[q.id])}` })));
      if (q.type === 'qcm') c.append(el('p', {}, el('bdi', { text: `${t('bonneRep')} : ${bi(q.choix[q.bonne])}` })));
      if (q.type === 'vf') c.append(el('p', {}, el('bdi', { text: `${t('bonneRep')} : ${q.bonne ? '✔' : '✘'}` })));
      if (q.acceptees) c.append(el('p', {}, el('bdi', { text: `${t('bonneRep')} : ${q.acceptees.join(' · ')}` })));
      if (q.correction) {
        const sol = el('div', { class: 'sol' },
          ...q.correction.etapes.map(s => el('p', {}, el('bdi', { text: '• ' + bi(s) }))),
          q.correction.resultat ? el('p', { html: `<b>${t('resultat')} :</b> <bdi>${bi(q.correction.resultat)}</bdi>` }) : null);
        c.append(sol);
      }
      view.append(c);
    }
    view.append(el('button', { class: 'btn primary big', onclick: () => { if (onExit) onExit(); } }, icon('home'), t('retour')));
  }

  let onExit = null;
  const api = { set onExit(f) { onExit = f; } };

  render();
  return api;
}
