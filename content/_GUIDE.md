# Guide d'édition du contenu — Najma · نجمة

## 1. Où ajouter un chapitre ?

Chaque chapitre est **un fichier JSON** dans l'arborescence :

```
content/{cycle}/{niveau}/{matiere}/{unite}.json
```

- cycle : `fondamental` (1AF–6AF), `college` (1AS–4AS), `lycee` (5AS–7AS)
- Pour le 7AS : `content/lycee/7AS/commun/{matiere}/` (matières communes) ou
  `content/lycee/7AS/serie-{A|C|D}/{matiere}/` (matières de série).

Copiez `content/_TEMPLATE.json`, renommez-le (ex. `u3-fractions.json`) et remplissez les champs.

## 2. Champs obligatoires

| Champ | Rôle |
|---|---|
| `schema` | Toujours `"sehil.unit@1"` (ne pas modifier) |
| `id` | Identifiant unique, format conseillé `6AF-math-03` |
| `niveau` / `matiere` / `ordre` | Position dans le parcours (ordre = rang d'affichage) |
| `titre` | `{fr, ar}` — bilingue obligatoire |
| `duree_min` | Durée estimée de la leçon (utilisé par le planificateur) |
| `statut` | `"PUBLIE"` (visible par l'élève) ou `"A_RELIRE"` (marqué « En relecture ») |
| `objectifs`, `fiche`, `definitions`, `exercices`, `quiz`, `flashcards` | Contenu pédagogique |

## 3. Types de quiz acceptés

- `"qcm"` : `choix` (2 à 5) + `bonne` (index 0-based) + `explication`
- `"vf"` : `bonne` = `true`/`false` + `explication`
- `"courte"` : `acceptees` (liste de réponses acceptées, comparaison souple : accents/espaces ignorés)
- `"calcul"` (examens) : comme `courte`, avec tolérance numérique ±0,05

## 4. Après avoir ajouté ou modifié un fichier

```bash
python3 tools/build.py
```

L'outil regénère `content/catalogue.json`, met à jour la liste de précache du Service
Worker (`sw.js`) et le tableau de contrôle (`docs/_auto_section.md`). Rechargez
ensuite l'application : le contenu apparaît immédiatement.

## 5. Règles de qualité

1. **Zéro coquille vide** : n'ajoutez pas un fichier tant que quiz + flashcards + exercices
   ne sont pas remplis réellement.
2. **Bilinguisme** : chaque texte porte `{fr, ar}`. En mathématiques/sciences, les formules
   restent dans le champ `formules` (langue neutre, affichée LTR).
3. **Éducation islamique** : ne citez que des versets/hadiths dont la vocalisation est sûre
   à 100 %, sinon écrivez littéralement `[Verset à insérer]` / `[Hadith à insérer]`.
4. **Statut `A_RELIRE`** : à utiliser dès qu'un point dépend d'un manuel ou d'une note
   officielle mauritanienne précise (coefficient, intitulé exact d'épreuve, année…).
   Décrivez le point à vérifier dans `notes_editeur`.
5. **Progressivité** : 3 exercices minimum (difficulté 1 = application directe,
   2 = combinaison, 3 = transfert/problème).
