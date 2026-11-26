import { dueItems, getItem, gradeItem, masteredCount, NB_BOXES, BOX_DAYS } from '../assets/js/core/leitner.js';
import { makePlan, planProgress } from '../assets/js/core/planner.js';
import { t, bi, setLang, nf } from '../assets/js/core/i18n.js';
import { kvGet, kvSet } from '../assets/js/core/db.js';
import { normAnswer, answerMatches, shuffle, el } from '../assets/js/ui/components.js';

let fails = 0;
const ok = (cond, msg) => { if (!cond) { console.log('✗', msg); fails++; } else console.log('✔', msg); };

// Leitner
const srs = {};
const it = getItem(srs, 'u:6AF-math-01:q1');
ok(it.box === 0, 'Leitner: carte neuve en boîte 0');
gradeItem(it, true); ok(it.box === 1, 'Leitner: réussite → boîte 1');
gradeItem(it, true); ok(it.box === 2, 'Leitner: 2e réussite → boîte 2');
gradeItem(it, false); ok(it.box === 1, 'Leitner: échec → retour boîte 1');
for (let i=0;i<5;i++) gradeItem(it, true);
ok(it.box === NB_BOXES, 'Leitner: plafond boîte 5');
ok(dueItems(srs, Date.now() + 20*864e5).length === 1, 'Leitner: carte due après 16 jours');
ok(masteredCount(srs) === 1, 'Leitner: maîtrise comptée');

// Planner
const plan = makePlan({ endISO: '2026-12-20', minutesPerDay: 30,
  unites: Array.from({length: 12}, (_,i) => ({ id: 'u'+i, titre: {fr:'L'+i, ar:'د'+i}, duree_min: 25 })) });
const expectedDays = Math.round((new Date('2026-12-20T12:00:00Z') - new Date(new Date().toISOString().slice(0, 10) + 'T12:00:00Z')) / 864e5);
ok(plan && plan.days.length === expectedDays, 'Planner: ' + expectedDays + ' jours générés (indépendant de la date)');
ok(plan.days.every(d => d.tasks.length > 0), 'Planner: aucun jour vide');
const last = plan.days[plan.days.length-1].tasks.map(t=>t.kind);
ok(last.includes('revision') && last.includes('examen'), 'Planner: fin de parcours = révision + examen');
plan.days[0].tasks[0].done = true;
ok(planProgress(plan).done === 1, 'Planner: progression cochée');

// i18n
ok(t('commencer') === 'Commencer', 'i18n: fr par défaut');
setLang('ar');
ok(t('commencer') === 'ابدأ', 'i18n: ar');
ok(bi({fr:'Bonjour', ar:'مرحبا'}) === 'مرحبا', 'i18n: bi en arabe');
ok(nf(1234).includes('1'), 'i18n: nf ok');
setLang('fr');

// db (fallback mémoire en Node)
await kvSet('x', {a:1});
ok((await kvGet('x')).a === 1, 'DB: set/get');
ok(await kvGet('absent') === undefined, 'DB: clé absente → undefined');

// utils
ok(answerMatches('12,5', ['12.5']) === true, 'Utils: virgule/dot équivalents');
ok(answerMatches(' 12 5 ', ['125']) === true, 'Utils: espaces ignorés');
ok(answerMatches('150 m', ['150']) === true, 'Utils: unité ignorée si préfixée');
ok(answerMatches('abc', ['abd']) === false, 'Utils: texte différent rejeté');
ok(answerMatches('7043', ['700 090'], 0.05) === false, 'Utils: valeurs distinctes rejetées');
ok(answerMatches('Qui est-ce qui ?', ['qui est-ce qui']) === true, 'Utils: ponctuation ignorée (question GNS)');
ok(answerMatches("Qu'est-ce qui", ["qu'est-ce qui"]) === true, 'Utils: apostrophes ignorées');
ok(answerMatches('À revoir !', ['à revoir']) === true, 'Utils: accents et point ignorés');
ok(answerMatches('x² + 6x + 9.', ['x²+6x+9']) === true, 'Utils: expression avec point final');
ok(shuffle([1,2,3]).length === 3, 'Utils: shuffle préserve la taille');

// catalogue intégré
const cat = (await import('node:fs')).readFileSync('content/catalogue.json','utf8');
const parsed = JSON.parse(cat);
ok(parsed.unites.length === 48, 'Catalogue: 36 unités');
ok(parsed.examens.length === 3, 'Catalogue: 3 examens');
const e4 = parsed.examens.find(e => e.id==='EX-4AS');
ok(e4.duree_min === 120, 'Catalogue: brevet 120 min');

// une unité complète : fiche + quiz + flashcards + exercices
const u = JSON.parse((await import('node:fs')).readFileSync('content/fondamental/6AF/mathematiques/u1-nombres.json','utf8'));
ok(u.fiche.length >= 2 && u.quiz.length >= 5 && u.flashcards.length >= 5 && u.exercices.length >= 3, 'Unité 6AF-math-01 complète');
const u7 = JSON.parse((await import('node:fs')).readFileSync('content/lycee/7AS/serie-D/mathematiques/u1-limites-continuite.json','utf8'));
ok(u7.quiz.length >= 5, 'Unité 7ASD complète');

// validation stricte des index "bonne"
let bad = 0;
const glob = (await import('node:fs'));
function walk(dir){ let out=[]; for(const e of glob.readdirSync(dir,{recursive:true})){ const p=dir+'/'+e; if(p.endsWith('.json')) out.push(p);} return out; }
for (const f of walk('content')) {
  const d = JSON.parse(glob.readFileSync(f,'utf8'));
  const quizzes = d.quiz || [];
  for (const q of quizzes) if (q.type==='qcm' && !(q.bonne >= 0 && q.bonne < (q.choix||[]).length)) bad++;
  const secs = d.sections || [];
  for (const s of secs) for (const q of s.questions||[]) if (q.type==='qcm' && !(q.bonne >= 0 && q.bonne < (q.choix||[]).length)) bad++;
}
ok(bad === 0, 'Aucun index "bonne" hors limites');

console.log(fails ? `\n✗ ${fails} échec(s)` : '\n✔ SMOKE TEST : tout est vert');
process.exit(fails ? 1 : 0);
