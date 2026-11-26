# Tableau final de contrôle — Najma · نجمة

> Date de génération : 24 novembre 2026 · Version 1.0
> Légende : **PUBLIE** = conforme au programme standard, utilisable immédiatement ;
> **A_RELIRE** = construit par rapprochement des programmes francophones voisins
> (Sénégal/BFEM, programmes du sous-région) et mérite une relecture pédagogique
> par un inspecteur mauritanien avant usage intensif.

## 1. Synthèse par niveau

| Niveau | Cycle | Matières déclarées | Unités réelles | Examens blancs | État |
|---|---|---|---|---|---|
| 1AF–5AF | Fondamental | Arabe, Français, Maths, Éd. islamique, Sciences (3AF+), Hist-Géo (5AF+) | Arborescence prête (index `A_RELIRE`) | — | Squelette prêt à remplir |
| **6AF** | Fondamental | idem | **25 unités complètes** (Maths ×12, Français ×12, Éd. islamique ×1) — enrichies : 5 exercices / 8 quiz / 8 cartes par unité | **Concours blanc (90 min, /20)** | ✅ Tranche complète |
| 1AS–3AS | Collège | +SN, +PC (3AS), +Anglais (3AS) | Arborescence prête | — | Squelette prêt à remplir |
| **4AS** | Collège | 8 matières | **12 unités complètes** (Maths ×6, SN ×6) | **Brevet blanc (120 min, /20)** | ✅ Tranche complète |
| 5AS–6AS | Lycée | 8 matières | Arborescence prête | — | Squelette prêt à remplir |
| **7AS série D** | Lycée | 5 communes + 3 de série | **11 unités complètes** (Maths ×6, SN ×5) | **Bac blanc D (240 min, /20)** | ✅ Tranche complète |
| 7AS séries A / C | Lycée | commun + extra par série | Arborescence prête | — | Squelette prêt à remplir |

**Total contenu réel : 48 unités pédagogiques complètes (bilingues FR/AR) + 3 examens blancs — 6AF : 123 exercices corrigés, 198 quiz, 198 flashcards.**
Toutes les matières des 13 niveaux existent dans le catalogue : celles sans unité affichent
honnêtement « Bientôt disponible » (aucun contenu vide n'est présenté comme du cours).

## 2. Conformité au programme mauritanien standard (PUBLIE)

- **Structure scolaire** : Fondamental 1AF→6AF (concours d'entrée en secondaire),
  Collège 1AS→4AS (BEPC/Brevet), Lycée 5AS→7AS (Bac, séries A/C/D). ✅ conforme.
- **6AF Maths** : numération jusqu'au milliard, décimaux, 4 opérations, division
  euclidienne, divisibilité, fractions, proportionnalité/pourcentages, géométrie,
  mesures avec **ouguiya (MRU) et khoums** (1 MRU = 5 khoums ✅ réalité mauritanienne). ✅ conforme CM2/6AF francophone.
- **6AF Français** : types de phrases, GNS/verbe, accord, déterminants, temps du récit,
  homophones, vocabulaire, production d'écrit. ✅ conforme fin de fondamental.
- **4AS Maths** : puissances/racines/ensembles ℕℤℚ, calcul littéral, équations/inéquations,
  Pythagore/Thalès/volumes, statistiques. ✅ conforme programme de 3e/BFEM.
- **4AS SN** : classification, alimentation-digestion, respiration-circulation, puberté,
  santé avec **paludisme/anophèle/moustiquaire** (contexte sahélien), équilibres naturels
  avec **Banc d'Arguin** et désertification. ✅ conforme + ancrage local.
- **7AS-D Maths** : limites/continuité/TVI, dérivation, suites, ln/exp, intégration,
  probabilités. ✅ conforme aux programmes terminales D du sous-région.
- **7AS-D SN** : reproduction et régulation hormonale, génétique (Mendel), immunologie,
  glycémie, évolution/biodiversité. ✅ conforme en grandes lignes.

## 3. Contenus adaptés par rapprochement → à relire (A_RELIRE)

| Élément | Pourquoi A_RELIRE |
|---|---|
| 4AS Maths · Trigonométrie (u5) | Présent au BFEM sénégalais ; vérifier l'intitulé/coef exact au programme mauritanien de 4AS. |
| 7AS-D Maths · ln/exp (u4) et Intégration (u5) | Programme standard sous-régional ; vérifier l'étendue officielle (integration par parties exigée ou non). |
| 7AS-D Maths · Loi binomiale (u6) | Standard sénégalais Terminale D ; à confirmer pour le bac mauritanien. |
| 7AS-D SN · Reproduction (u1), Génétique (u2), Immunologie (u3) | Grandes lignes sûres ; vérifier la profondeur officielle exigée (cinétiques, pedigrees). |
| 7AS-D SN · Évolution/biodiversité (u5) | Module présent chez les voisins ; vérifier s'il est exigé au bac MR (sinon = culture scientifique). |
| 6AF Éd. islamique (u1) | Versets/hadiths uniquement sûrs (Al-Fātiḥa, Al-Ikhlāṣ, al-Falaq, an-Nās ; hadith de la niyya — Bukhārī) mais **vocalisation à recouper sur un muṣḥaf de référence** ; choix « مَالِكِ / مَلِكِ » à aligner sur le manuel MR. |
| Examens blancs (les 3) | Format et barèmes « type officiel » reconstruits ; à recalibrer sur les annales/arrêtés officiels mauritaniens. |
| Libellés des niveaux et séries (A/C/D) | Terminologie usuelle ; à harmoniser avec la nomenclature officielle (السنة… أساسي/ثانوي). |
| Matières vides (1AF–5AF, 1AS–3AS, 5AS–6AS, 7AS A/C) | Arborescence + `index.json` `A_RELIRE` : contenu à produire selon le même gabarit. |

## 4. Conformité technique

| Exigence | État |
|---|---|
| Zéro serveur, zéro base distante, zéro API | ✅ export statique pur (HTML/CSS/JS/JSON) |
| Stockage local IndexedDB (+ repli localStorage, puis mémoire) | ✅ `assets/js/core/db.js` |
| Multi-profils sans compte / sans email / sans traceur | ✅ profils locaux + PIN parent local |
| Export/Import sauvegarde `.json` | ✅ Réglages → Exporter/Importer |
| PWA : manifest complet (192/512 + maskable + raccourcis) | ✅ |
| Service Worker précachant l'app **et** tous les JSON | ✅ 163 fichiers précachés (généré par `build.py`) |
| Lazy loading (écrans + chapitres) | ✅ dynamic import + fetch à la demande |
| Bilinguisme RTL/LTR instantané, flèches/marges/polices adaptées | ✅ `dir`, propriétés logiques CSS |
| Contrastes AA, sombre/clair, taille de texte, reduced-motion | ✅ |
| Boutons ≥ 48 px (Fondamental : ≥ 56 px) | ✅ tokens par skin d'âge |
| Trois interfaces d'âge (ludique / gamifiée sobre / performance Bac) | ✅ skins `fondamental / college / lycee` |
| Testé : moteurs Leitner, planificateur, i18n, stockage, normalisation réponses | ✅ 29 assertions vertes (`tools/smoke-test.mjs`) |

<!-- Section générée automatiquement par tools/build.py — voir _auto_section.md -->
