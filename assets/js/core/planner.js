/* ============================================================
   planner.js — Planificateur de révision.
   Entrée : date d'examen, temps dispo/jour, unités à couvrir.
   Sortie : planning quotidien réaliste (cours → révision → carnet
   → examens blancs en fin de parcours).
   ============================================================ */

const DAY_MS = 24 * 60 * 60 * 1000;

function listDays(startISO, endISO) {
  const days = [];
  const start = new Date(startISO + 'T12:00:00');
  const end = new Date(endISO + 'T12:00:00');
  for (let d = start.getTime(); d < end.getTime(); d += DAY_MS) {
    const dt = new Date(d);
    days.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`);
  }
  return days;
}

const TASKS = {
  cours: { fr: 'Leçon : {x}', ar: 'الدرس: {x}' },
  quiz: { fr: 'Quiz de contrôle : {x}', ar: 'اختبار قصير: {x}' },
  flashcards: { fr: 'Flashcards : {x}', ar: 'بطاقات التعلم: {x}' },
  revision: { fr: 'Révision des boîtes Leitner (cartes dues)', ar: 'مراجعة صناديق لايتنر (البطاقات المستحقة)' },
  carnet: { fr: "Carnet d'erreurs", ar: 'دفتر الأخطاء' },
  examen: { fr: 'Examen blanc chronométré', ar: 'امتحان تجريبي محدَّد الوقت' },
};

function task(kind, ref, titre, minutes) {
  return { kind, ref: ref || null, titre, minutes, done: false };
}

/**
 * Génère le planning. `unites` : [{id, titre:{fr,ar}, duree_min}]
 * La densité s'adapte : si peu de jours, les révisions libres sont réduites.
 */
export function makePlan({ endISO, minutesPerDay, unites, startISO }) {
  const start = startISO || new Date().toISOString().slice(0, 10);
  const days = listDays(start, endISO);
  if (days.length === 0) return null;

  const n = days.length;
  const newUnits = unites.slice();
  const intensif = n <= 5;
  const plan = { examDate: endISO, created: start, minutesPerDay, days: [] };

  days.forEach((date, idx) => {
    const tasks = [];
    const rest = n - idx; // jours restants (1 = veille de l'examen)

    if (rest <= 2) {
      tasks.push(task('revision', null, TASKS.revision, Math.round(minutesPerDay * 0.5)));
      tasks.push(task('carnet', null, TASKS.carnet, Math.round(minutesPerDay * 0.3)));
      tasks.push(task('examen', null, TASKS.examen, Math.round(minutesPerDay * 0.2)));
    } else if (rest <= 4) {
      tasks.push(task('examen', null, TASKS.examen, Math.round(minutesPerDay * 0.6)));
      tasks.push(task('revision', null, TASKS.revision, Math.round(minutesPerDay * 0.4)));
    } else {
      const budget = minutesPerDay;
      let used = 0;
      // 1 nouvelle leçon (si disponible)
      if (newUnits.length) {
        const u = newUnits.shift();
        const m = Math.min(u.duree_min || 25, Math.round(budget * 0.6));
        tasks.push(task('cours', u.id, fill(TASKS.cours, u.titre), m));
        tasks.push(task('quiz', u.id, fill(TASKS.quiz, u.titre), 8));
        used += m + 8;
      }
      // Une leçon sur 3 : jour de synthèse (flashcards + carnet)
      if (!intensif && (idx % 3 === 2)) {
        tasks.push(task('flashcards', null, TASKS.flashcards, 10));
        tasks.push(task('carnet', null, TASKS.carnet, 10));
        used += 20;
      } else if (!intensif) {
        tasks.push(task('revision', null, TASKS.revision, 10));
        used += 10;
      }
      // S'il reste du budget et des leçons : une 2e leçon légère
      if (newUnits.length && used + 20 <= budget) {
        const u2 = newUnits.shift();
        tasks.push(task('cours', u2.id, fill(TASKS.cours, u2.titre), Math.min(u2.duree_min || 25, 20)));
      }
    }
    plan.days.push({ date, tasks });
  });

  // S'il reste des leçons non placées, les insérer dans les jours "examen"
  if (newUnits.length) {
    for (const d of plan.days) {
      if (!newUnits.length) break;
      const u = newUnits.shift();
      d.tasks.push(task('cours', u.id, fill(TASKS.cours, u.titre), Math.min(u.duree_min || 25, 15)));
    }
  }
  return plan;
}

function fill(tpl, titre) {
  return {
    fr: tpl.fr.replace('{x}', titre?.fr || ''),
    ar: tpl.ar.replace('{x}', titre?.ar || ''),
  };
}

export function planProgress(plan) {
  let total = 0, done = 0;
  for (const d of plan.days) for (const t of d.tasks) { total++; if (t.done) done++; }
  return { total, done, pct: total ? Math.round(100 * done / total) : 0 };
}
