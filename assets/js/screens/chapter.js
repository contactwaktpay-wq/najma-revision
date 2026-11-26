/* ============================================================
   chapter.js — Écran chapitre : Fiche de synthèse, Exercices
   progressifs corrigés, Quiz interactif, Flashcards.
   Onglets à état, progression enregistrée par unité.
   ============================================================ */
import { el, icon, chip, appHeader, langToggle, progressBar, answerMatches } from '../ui/components.js';
import { t, bi, setLang, nf } from '../core/i18n.js';
import { loadCatalogue, uniteById, fetchUnite, getCatalogue } from '../core/content.js';
import { currentProfile, profileData, addXp, touchStreak, checkBadges, persistProfile } from '../core/store.js';
import { buildQuiz } from '../ui/quiz.js';
import { buildFlashcards } from '../ui/flashcards.js';
import { toast, mascot } from '../ui/components.js';
import { navigate } from '../core/router.js';

export async function build([unitId]) {
  const cat = await loadCatalogue();
  const meta = uniteById(unitId);
  const profile = currentProfile();
  if (!meta || !profile) { navigate('#/home'); return { root: el('div') }; }
  setLang(profile.lang || 'fr');
  const data = profileData();
  const unit = await fetchUnite(meta.path);
  const lang = profile.lang || 'fr';

  const root = el('div');
  root.append(appHeader(bi(unit.titre), {
    back: { hash: `#/matiere/${meta.niveau}/${meta.matiere}`, label: t('retour') },
    langBtn: langToggle(lang, async l => { profile.lang = l; setLang(l); navigate(location.hash); }),
  }));

  // Progression persistée
  const p = data.progress[unitId] = data.progress[unitId] || { fiche: false, quizBest: null, exDone: [], done: false };
  data.lastUnit = unitId;
  persistProfile();

  // Note éditoriale (A_RELIRE)
  if (unit.statut === 'A_RELIRE' || meta.statut === 'A_RELIRE') {
    root.append(el('div', { class: 'note-edit', text: '✎ ' + t('enRelire') }));
    if (unit.notes_editeur?.length) {
      for (const nte of unit.notes_editeur) root.append(el('p', { class: 'note-edit', text: '✎ ' + nte[lang] || nte.fr }));
    }
  }

  /* ---------- Onglets ---------- */
  const tabs = el('div', { class: 'tabs', role: 'tablist' });
  const body = el('div');
  root.append(tabs, body);

  const TABS = [
    ['fiche', 'book', t('fiche'), renderFiche],
    ['exercices', 'file', t('exercices'), renderExercices],
    ['quiz', 'check', t('quiz'), renderQuiz],
    ['flashcards', 'cards', t('flashcards'), renderFlash],
  ];
  let current = 'fiche';

  for (const [id, ic, label] of TABS) {
    const b = el('button', { role: 'tab', text: label, 'aria-selected': String(id === current) });
    b.addEventListener('click', () => { current = id; refreshTabs(); renderBody(); });
    b.dataset.tab = id;
    tabs.append(b);
  }
  function refreshTabs() {
    tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === current)));
  }

  function renderBody() {
    body.textContent = '';
    TABS.find(x => x[0] === current)[3](body);
  }

  /* ---------- Rendu bilingue générique ---------- */
  const B = bi;

  function renderFiche(container) {
    if (!p.fiche) { p.fiche = true; addXp(data, 5); touchStreak(data, 'cours', unit.duree_min || 15); checkBadges(data); persistProfile(); }
    if (cycleIsFondamental()) container.append(el('div', { style: 'text-align:center' }, el('div', { html: mascot(80) })));

    container.append(el('h2', { text: t('objectifs') }));
    const ol = el('ul');
    for (const o of unit.objectifs[lang] || unit.objectifs.fr) ol.append(el('li', {}, el('bdi', { text: o })));
    container.append(ol);

    for (const [i, sec] of (unit.fiche || []).entries()) {
      container.append(el('h2', { text: `${nf(i + 1)}. ${B(sec.titre)}` }));
      if (sec.bloc) for (const pa of sec.bloc) container.append(el('p', {}, el('bdi', { text: B(pa) })));
      if (sec.puces) {
        const ul = el('ul');
        for (const pu of sec.puces) ul.append(el('li', {}, el('bdi', { text: B(pu) })));
        container.append(ul);
      }
      if (sec.formules) for (const f of sec.formules) container.append(el('div', { class: 'formule', text: f }));
      if (sec.tableau) {
        const tbl = el('table', { class: 'tbl' });
        const thead = el('tr');
        for (const h of sec.tableau.entetes) thead.append(el('th', {}, el('bdi', { text: B(h) })));
        tbl.append(thead);
        for (const row of sec.tableau.lignes) {
          const tr = el('tr');
          for (const cell of row) tr.append(el('td', {}, el('bdi', { text: B(cell) })));
          tbl.append(tr);
        }
        container.append(tbl);
      }
      if (sec.exemple) {
        const ex = el('div', { class: 'example' }, el('span', { class: 'tag', text: t('exemples') }),
          el('p', {}, el('bdi', { text: B(sec.exemple.enonce) })));
        const steps = el('ol', { class: 'steps', hidden: true });
        for (const s of sec.exemple.etapes) steps.append(el('li', {}, el('bdi', { text: B(s) })));
        ex.append(steps, el('p', { hidden: true, class: 'resultat-p' }, el('b', { text: t('resultat') + ' : ' }), el('bdi', { text: B(sec.exemple.resultat) })));
        ex.append(el('button', { class: 'btn ghost', text: t('etapeSuivante'), onclick: e => {
          if (!steps.hidden && steps.querySelectorAll('li[hidden]').length === 0) {
            e.target.hidden = true; ex.querySelector('.resultat-p').hidden = false; return;
          }
          const firstHidden = steps.querySelector('li[hidden]');
          if (firstHidden) { firstHidden.hidden = false; steps.hidden = false; }
          else { e.target.hidden = true; ex.querySelector('.resultat-p').hidden = false; }
        } }));
        // Étapes initialement cachées
        steps.querySelectorAll('li').forEach(li => li.hidden = true);
        container.append(ex);
      }
    }

    // Définitions clés
    if (unit.definitions?.length) {
      container.append(el('h2', { text: t('definitions') }));
      for (const d of unit.definitions) {
        container.append(el('div', { class: 'def' }, el('b', {}, el('bdi', { text: B(d.terme) })),
          ' — ', el('bdi', { text: B(d.def) })));
      }
    }
  }

  function renderExercices(container) {
    (unit.exercices || []).forEach((ex, i) => {
      const card = el('div', { class: 'exo' });
      // En-tête : numéro + phase (sur sa propre ligne, jamais dans le texte)
      card.append(el('div', { class: 'exo-head' },
        el('span', { class: 'num', text: nf(i + 1) }),
        chip(t('phase') + ' ' + nf(ex.niveau_diff || 1), (ex.niveau_diff || 1) >= 3 ? 'err' : (ex.niveau_diff || 1) === 2 ? 'warn' : 'ok')));
      // Énoncé : bloc plein, retour à la ligne garanti
      card.append(el('p', { class: 'exo-text' }, el('bdi', { text: B(ex.enonce) })));

      // Champ de réponse de l'élève
      const auto = Array.isArray(ex.acceptees) && ex.acceptees.length > 0;
      const inp = el('input', { type: 'text', autocomplete: 'off', placeholder: t('taReponse') });
      const fb = el('div');

      const total = (ex.correction?.etapes || []).length;
      const stepsEl = el('ol', { class: 'steps' });
      const resP = el('p', {}, el('b', { text: t('resultat') + ' : ' }), el('bdi', { text: B(ex.correction?.resultat || {}) }));
      let shown = 0;
      const sol = el('div', { class: 'sol', hidden: true }, stepsEl);
      const showFullSol = () => {
        sol.hidden = false;
        stepsEl.textContent = '';
        (ex.correction?.etapes || []).forEach(s => stepsEl.append(el('li', {}, el('bdi', { text: B(s) }))));
        sol.append(resP);
        revealBtn.remove();
      };
      const revealBtn = el('button', { class: 'btn ghost',
        text: total > 1 ? `${t('voirCorrection')} · 1/${nf(total)}` : t('voirCorrection') });
      revealBtn.onclick = () => {
        if (shown >= total) return;
        stepsEl.append(el('li', {}, el('bdi', { text: B(ex.correction.etapes[shown]) })));
        shown++;
        sol.hidden = false;
        if (shown >= total) { sol.append(resP); revealBtn.remove(); }
        else revealBtn.textContent = `${t('etapeSuivante')} · ${nf(shown + 1)}/${nf(total)}`;
      };

      const markSolved = () => {
        if (!p.exDone.includes(ex.id)) {
          p.exDone.push(ex.id);
          addXp(data, 5);
          touchStreak(data, 'exercice', 6);
          checkBadges(data);
          persistProfile();
        }
      };

      if (auto) {
        // Vérification automatique (réponse unique connue)
        const checkBtn = el('button', { class: 'btn primary', text: t('verifier') });
        const tryCheck = () => {
          if (fb.dataset.done || !inp.value.trim()) return;
          fb.dataset.done = '1';
          inp.disabled = true;
          if (answerMatches(inp.value, ex.acceptees)) {
            checkBtn.remove();
            fb.append(el('div', { class: 'feedback' }, el('strong', { text: t('bonneReponse') })));
            markSolved();
            showFullSol();
          } else {
            checkBtn.remove();
            fb.append(el('div', { class: 'feedback bad' },
              el('strong', { text: t('mauvaiseReponse') }),
              el('div', { class: 'why', text: t('autoEvaluez') })));
            fb.append(el('div', { class: 'exo-actions' },
              el('button', { class: 'btn ghost', text: '✓ ' + t('repJuste'), onclick: () => { markSolved(); fb.textContent = ''; showFullSol(); } }),
              el('button', { class: 'btn ghost', text: '🔁 ' + t('repARevoir'), onclick: () => { fb.textContent = ''; revealBtn.click(); } })));
          }
        };
        checkBtn.onclick = tryCheck;
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') tryCheck(); });
        card.append(el('div', { class: 'exo-actions' }, inp, checkBtn, revealBtn), fb, sol);
      } else {
        // Réponse ouverte : l'élève écrit, compare à la correction, puis s'auto-évalue
        const checkBtn = el('button', { class: 'btn primary', text: t('verifier') });
        checkBtn.onclick = () => {
          if (fb.dataset.done) return;
          fb.dataset.done = '1';
          checkBtn.remove();
          fb.append(el('div', { class: 'def' },
            el('b', { text: t('votreRep') + ' : ' }), el('bdi', { text: inp.value.trim() || '—' })),
            el('div', { class: 'why', text: t('autoEvaluez') }));
          fb.append(el('div', { class: 'exo-actions' },
            el('button', { class: 'btn ghost', text: '✓ ' + t('repJuste'), onclick: () => { markSolved(); fb.textContent = ''; } }),
            el('button', { class: 'btn ghost', text: '🔁 ' + t('repARevoir'), onclick: () => { fb.textContent = ''; } })));
        };
        card.append(el('div', { class: 'exo-actions' }, inp, checkBtn, revealBtn), fb, sol);
      }
      container.append(card);
    });
    if (!unit.exercices?.length) container.append(el('div', { class: 'empty', text: t('bientot') }));
  }

  function renderQuiz(container) {
    if (p.quizBest != null) {
      container.append(el('div', { class: 'row', style: 'margin-bottom:.5rem' },
        chip(`${t('quizReussi')} · ${t('score')} ${nf(p.quizBest)}%`, 'ok')));
    }
    buildQuiz(container, { data, unitId, questions: unit.quiz || [] });
  }

  function renderFlash(container) {
    buildFlashcards(container, { data, unitId, cards: unit.flashcards || [] });
  }

  function cycleIsFondamental() {
    return cat.niveaux.find(n => n.id === meta.niveau)?.cycle === 'fondamental';
  }

  renderBody();
  return { root };
}
