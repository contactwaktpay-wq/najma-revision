# Najma · نجمة — La boussole de la réussite / بوصلة النجاح

**Application web progressive (PWA) de révision scolaire pour la Mauritanie** — bilingue
Français / العربية (RTL natif), du **1AF au Baccalauréat** (séries A, C, D).

100 % statique, 100 % locale, 100 % hors ligne après la première ouverture.
Aucun compte, aucun email, aucune publicité, aucun traceur, aucun serveur.

---

## 1. Démarrage rapide

**Trois façons de lancer Najma :**

| Mode | Comment | Pour quoi |
|---|---|---|
| 🖱️ **Fichier unique** | Double-clic sur **`najma-standalone.html`** (tout est dedans : CSS, JS, contenu) | Test immédiat sur n'importe quel ordinateur, même sans connexion |
| 📁 **Projet complet (PWA)** | Servir le dossier en HTTPS : `python3 -m http.server 8080`, GitHub Pages, Netlify Drop (glisser-déposer), Cloudflare Pages… | Installation sur téléphone (« Ajouter à l'écran d'accueil »), **mode avion complet**, données persistantes |
| 🧪 **En ligne ici** | Aperçu fourni dans la conversation | Essai sans rien installer |

> Le double-clic sur `index.html` du projet complet **ne fonctionne pas** : les navigateurs
> bloquent les modules ES et le `fetch()` en `file://`. C'est pourquoi le fichier unique
> `najma-standalone.html` existe (regénéré par `python3 tools/build_standalone.py`).

Regénérer après modification du contenu :

```bash
python3 tools/build.py              # catalogue + sw.js + validation
python3 tools/build_standalone.py   # fichier unique
node tools/smoke-test.mjs           # tests des moteurs
node tools/standalone-test.mjs      # test de navigation complet (jsdom)
```

## 2. Ce que contient le projet

```
najma/
├── index.html                  # Coquille applicative
├── manifest.webmanifest        # Manifeste PWA (icônes, raccourcis)
├── sw.js                       # Service Worker (précache total — généré)
├── assets/
│   ├── css/                    # Design system (tokens, base, composants)
│   ├── js/
│   │   ├── main.js             # Bootstrap + routes
│   │   ├── core/               # db, store, i18n, router, content, leitner, planner
│   │   ├── ui/                 # composants, quiz, flashcards, moteur d'examen
│   │   └── screens/            # 9 écrans (chargés à la demande)
│   └── img/                    # logo SVG (couleur + mono), icônes PWA
├── content/                    # ★ CONTENU PÉDAGOGIQUE (JSON éditables)
│   ├── _TEMPLATE.json          # Modèle d'unité
│   ├── _GUIDE.md               # Guide d'édition court
│   ├── catalogue.json          # Généré automatiquement
│   ├── fondamental/ college/ lycee/   # 1AF → 7AS (arborescence complète)
│   └── examens/                # Concours 6AF, Brevet 4AS, Bac 7AS-D
├── docs/
│   ├── TABLEAU_DE_CONTROLE.md  # ★ Conformité + points A_RELIRE
│   └── _auto_section.md        # Section auto-générée par build.py
└── tools/
    ├── build.py                # Regénère catalogue + sw.js + validation
    ├── icons.py                # Regénère les icônes PNG
    └── smoke-test.mjs          # Tests des moteurs (node tools/smoke-test.mjs)
```

## 3. Fonctionnalités

- **Parcours** : Langue → Niveau → Série (Bac) → Matière → Chapitre.
- **Chapitre** : fiche de synthèse, définitions/formules, exemples résolus pas-à-pas,
  exercices progressifs corrigés, quiz interactif, flashcards.
- **Moteur cognitif** : répétition espacée Leitner (5 boîtes : 1/2/4/8/16 jours) +
  **carnet d'erreurs** qui réinjecte les questions ratées (sortie après 2 bonnes réponses).
- **Examens blancs chronométrés** : Concours fin de fondamental (6AF), Brevet 4AS,
  Bac blanc 7AS série D — barème par question, correction détaillée, auto-notation guidée
  des questions de rédaction.
- **Planificateur** : date d'examen + temps disponible → planning quotidien réaliste
  (cours, quiz, révision Leitner, carnet, examens blancs en fin de parcours).
- **Multi-profils** locaux + Espace Parent/Enseignant protégé par PIN local.
- **Bilinguisme** : bascule FR ⇄ AR instantanée (`dir` RTL/LTR, polices, terminologie).
- **Accessibilité** : contrastes AA, thème clair/sombre/auto, 3 tailles de texte,
  `prefers-reduced-motion`, cibles tactiles ≥ 48 px.
- **Sauvegarde** : Export/Import `.json` pour transférer les données entre téléphones.

## 4. Éditer le contenu (pour l'équipe pédagogique)

1. Copier `content/_TEMPLATE.json` dans le bon dossier
   (`content/{cycle}/{niveau}/{matiere}/…`).
2. Remplir, avec `statut: "PUBLIE"` ou `"A_RELIRE"` + `notes_editeur`.
3. Regénérer : `python3 tools/build.py` (catalogue, précache SW, validation, tableau de contrôle).
4. Tester : `node tools/smoke-test.mjs`.

Détails dans `content/_GUIDE.md`.

## 5. Instal­lation par l'élève

Ouvrir l'URL une fois (connexion nécessaire), puis « Ajouter à l'écran d'accueil » :
tout le contenu est précaché — l'app fonctionne **entièrement hors ligne** ensuite
(les données restent dans le téléphone, avec sauvegarde exportable).
