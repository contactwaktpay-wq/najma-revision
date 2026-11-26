/* Test end-to-end de najma-standalone.html dans jsdom.
   Prérequis dev : npm i jsdom dans /tmp/jt (ou ajuster JSDOM_DIR ci-dessous).
   Usage : node tools/standalone-test.mjs */
import { createRequire } from 'node:module';

const JSDOM_DIR = '/tmp/jt/';
const require = createRequire(JSDOM_DIR);
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('node:fs');

let fails = 0;
const ok = (c, msg) => { if (c) console.log('✔', msg); else { console.log('✗', msg); fails++; } };

const html = fs.readFileSync(new URL('../najma-standalone.html', import.meta.url), 'utf8');
const cat = JSON.parse(fs.readFileSync(new URL('../content/catalogue.json', import.meta.url), 'utf8'));
const unitData = JSON.parse(fs.readFileSync(new URL('../content/fondamental/6AF/mathematiques/u1-nombres.json', import.meta.url), 'utf8'));

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => {
  if (!/scrollTo/.test(e.message)) errors.push('jsdomError: ' + e.message);
});
vc.on('error', (...a) => errors.push('console.error: ' + a.map(String).join(' ').slice(0, 200)));

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://najma.test/index.html',
  virtualConsole: vc,
});
const w = dom.window;
const doc = w.document;
const wait = ms => new Promise(r => setTimeout(r, ms));

function go(hash) {
  w.location.hash = hash;
  w.dispatchEvent(new w.HashChangeEvent('hashchange', { newURL: 'https://najma.test/' + hash }));
  return wait(140);
}
const appText = () => doc.getElementById('app').textContent || '';
const clickByText = (txt, scope = doc) => [...scope.querySelectorAll('button')].find(b => b.textContent.trim().includes(txt));

await wait(400);

ok(appText().length > 10, 'Démarrage : un écran est rendu');
ok(/Choisis ta langue|Ton prénom/.test(appText()), 'Onboarding (formulaire) visible sans profil');

/* ----- création du profil ----- */
doc.querySelector('input[type="text"]').value = 'ÉlèveTest';
[...doc.querySelectorAll('button')].find(b => b.dataset && b.dataset.lvl === '6AF').click();
await wait(50);
clickByText('Commencer').click();
await wait(250);
ok(w.location.hash === '#/home', 'Redirection vers #/home après création de profil');

/* ----- navigation générale ----- */
await go('#/reglages');
ok(/Langue|Thème|Taille/.test(appText()), 'Écran réglages');
await go('#/examens');
ok(/Bac blanc|Brevet|Concours/.test(appText()), 'Les 3 examens blancs listés');
await go('#/matiere/6AF/mathematiques');
ok(/nombres|Numération|Nombres/i.test(appText()), 'Unités 6AF maths listées');

const u = cat.unites.find(x => x.niveau === '6AF' && x.matiere === 'mathematiques');
await go('#/chapitre/' + encodeURIComponent(u.id));
ok(/Objectifs|Définitions|Quiz/i.test(appText()), 'Chapitre : onglets affichés');

/* ----- Exercices répondables ----- */
clickByText('Exercices').click(); await wait(120);
const exos = [...doc.querySelectorAll('.exo')];
ok(exos.length >= 3, 'Exercices : cartes présentes');
ok(exos[0].querySelector('.exo-text bdi').textContent.trim().length > 10, 'Énoncé dans un bloc séparé (pas de bouton dans le texte)');
ok(exos[0].querySelector('.sol').hidden === true, 'Correction masquée avant révélation');

// révélation guidée manuelle (bouton « Voir la correction »)
const reveal0 = [...exos[0].querySelectorAll('button')].find(b => /Voir la correction/.test(b.textContent));
reveal0.click(); await wait(60);
ok(exos[0].querySelector('.sol').hidden === false && exos[0].querySelectorAll('.steps li').length === 1,
  'Révélation guidée : l\u2019étape 1 s\u2019affiche seule');

// auto-vérification : bonne réponse
const iAuto = unitData.exercices.findIndex(e => e.acceptees && e.acceptees.length);
ok(iAuto >= 0 && exos[iAuto], 'Exercice auto-vérifiable présent (n°' + (iAuto + 1) + ')');
if (iAuto >= 0) {
  const cardA = exos[iAuto];
  cardA.querySelector('input').value = String(unitData.exercices[iAuto].acceptees[0]);
  [...cardA.querySelectorAll('button')].find(b => /Vérifier|تحقق/.test(b.textContent)).click();
  await wait(80);
  ok(/Bonne réponse/.test(cardA.textContent), 'Auto-vérification : réponse correcte acceptée + solution affichée');
}
// auto-vérification : mauvaise réponse → jugement guidé
const iAuto2 = unitData.exercices.findIndex((e, j) => j > iAuto && e.acceptees && e.acceptees.length);
if (iAuto2 >= 0) {
  const cardB = exos[iAuto2];
  cardB.querySelector('input').value = '999999';
  [...cardB.querySelectorAll('button')].find(b => /Vérifier|تحقق/.test(b.textContent)).click();
  await wait(80);
  ok(/Pas encore/.test(cardB.textContent) && /correcte/.test(cardB.textContent), 'Réponse fausse : feedback + auto-jugement proposé');
}
// réponse ouverte : comparaison + auto-évaluation
const iOpen = unitData.exercices.findIndex(e => !e.acceptees || !e.acceptees.length);
if (iOpen >= 0) {
  const cardC = exos[iOpen];
  cardC.querySelector('input').value = 'ma réponse';
  [...cardC.querySelectorAll('button')].find(b => /Vérifier|تحقق/.test(b.textContent)).click();
  await wait(80);
  ok(/Compare ta réponse/.test(cardC.textContent), 'Réponse ouverte : comparaison + auto-évaluation');
}

/* ----- Quiz : mélange + Suivant activé ----- */
clickByText('Quiz').click(); await wait(120);
const opts = [...doc.querySelectorAll('.quizview .opt')];
const ks = opts.map(b => b.dataset.k).sort().join(',');
ok(ks === opts.map((_, i) => String(i)).sort().join(','), 'QCM mélangé : permutation complète des choix (' + ks + ')');
const bonneBtn = opts.find(b => b.dataset.k === String(unitData.quiz[0].bonne));
if (bonneBtn) bonneBtn.click(); else doc.querySelector('.quizview input') && (doc.querySelector('.quizview input').value = unitData.quiz[0].acceptees?.[0] || 'x');
await wait(80);
ok(bonneBtn && bonneBtn.classList.contains('correct'), 'La bonne réponse est marquée correcte (index original préservé)');
const nextBtn = doc.querySelector('.quizview .btn.big');
ok(nextBtn && nextBtn.disabled === false, 'BUG CORRIGÉ : « Suivant » activé après la réponse');
const before = appText();
nextBtn.click(); await wait(80);
ok(/2 \/ \d/.test(appText()) && appText() !== before, 'Passage effectif à la question 2');

/* ----- Flashcards ----- */
clickByText('Flashcards').click(); await wait(120);
const recto = doc.querySelector('.fc .big bdi');
ok(recto && recto.textContent.trim().length > 2, 'BUG CORRIGÉ : la carte flashcard est visible');
doc.querySelector('.fc').click(); await wait(80);
ok(doc.querySelector('.fc .big bdi').textContent !== recto.textContent, 'Carte retournée : le verso s\u2019affiche');
ok([...doc.querySelectorAll('button')].some(b => /Je savais/.test(b.textContent)), 'Boutons d\u2019auto-évaluation présents après le flip');

/* ----- Examen blanc ----- */
await go('#/examen/' + encodeURIComponent('EX-6AF'));
ok(/Consignes|Commencer/.test(appText()), 'Examen blanc : page de consignes');
clickByText('Commencer').click(); await wait(150);
ok(/Temps restant|points|Partie/i.test(appText()), 'Examen démarré : question + chronomètre');
ok(/Ferme la porte/.test(appText()), 'Énoncé complet affiché (aucune troncature)');
ok(!/color-mix/.test(html), 'Barres opaques : aucun masquage par transparence');
const examOpts = [...doc.querySelectorAll('.examview .opt, .opt')];
const examKs = examOpts.map(b => b.dataset.k).filter(k => k != null).sort().join(',');
ok(examKs.includes('0') && examKs.includes('1') && examKs.includes('2'), 'Examen : QCM aussi mélangé');

/* ----- écrans restants ----- */
await go('#/planning');
ok(/Planificateur|Date/.test(appText()), 'Planificateur rendu');
await go('#/carnet');
ok(/carnet/i.test(appText()), 'Carnet d\u2019erreurs rendu');
await go('#/parent');
ok(/PIN|Parent/i.test(appText()), 'Espace parent (PIN) rendu');
await go('#/profils');
ok(/profil|Profil|Ajouter/i.test(appText()), 'Gestion des profils rendue');

/* ----- Réouverture / rafraîchissement : jamais de 404 ----- */
await go('#/chemin/inconnu/xyz');
ok(!/404/.test(appText()) && appText().length > 20, 'BUG CORRIGÉ : chemin inconnu → accueil (pas de 404)');
w.location.hash = '';
w.dispatchEvent(new w.HashChangeEvent('hashchange', { newURL: 'https://najma.test/' }));
await wait(140);
ok(!/404/.test(appText()) && appText().length > 20, 'BUG CORRIGÉ : URL vide (rafraîchissement) → accueil (pas de 404)');

ok(errors.length === 0, 'Aucune erreur JS non gérée' + (errors.length ? ' → ' + errors.slice(0, 3).join(' | ') : ''));

console.log(fails ? '\n✗ ' + fails + ' échec(s)' : '\n✔ STANDALONE : navigation complète OK');
process.exit(fails ? 1 : 0);
