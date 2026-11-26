#!/usr/bin/env python3
# ============================================================
# build.py — Outil de génération Najma · نجمة
#  1. Scan du dossier content/ (unités + examens JSON)
#  2. Génération de content/catalogue.json + content/_matieres.json
#  3. Création des dossiers manquants (arborescence complète 1AF→7AS)
#     avec un index.json "A_RELIRE" pour les matières vides
#  4. Génération de sw.js (précache de TOUTE l'application)
#  5. Validation des schémas JSON
#  6. Mise à jour de docs/TABLEAU_DE_CONTROLE.md (section auto)
# Usage : python3 tools/build.py
# ============================================================
import json, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, 'content')
DOCS = os.path.join(ROOT, 'docs')

# ---------------- Spécification (programmes par niveau) ----------------
MATIERES = {
    "arabe":                {"label": {"fr": "Arabe (langue nationale)", "ar": "العربية (اللغة الوطنية)"}, "icone": "letters"},
    "francais":             {"label": {"fr": "Français", "ar": "الفرنسية"}, "icone": "book"},
    "mathematiques":        {"label": {"fr": "Mathématiques", "ar": "الرياضيات"}, "icone": "math"},
    "sciences":             {"label": {"fr": "Sciences (éveil)", "ar": "العلوم"}, "icone": "leaf"},
    "sciences_naturelles":  {"label": {"fr": "Sciences Naturelles", "ar": "العلوم الطبيعية"}, "icone": "leaf"},
    "physique_chimie":      {"label": {"fr": "Physique-Chimie", "ar": "الفيزياء والكيمياء"}, "icone": "flask"},
    "histoire_geo":         {"label": {"fr": "Histoire-Géographie", "ar": "التاريخ والجغرافيا"}, "icone": "globe"},
    "education_islamique":  {"label": {"fr": "Éducation islamique", "ar": "التربية الإسلامية"}, "icone": "mosque"},
    "anglais":              {"label": {"fr": "Anglais", "ar": "الإنجليزية"}, "icone": "globe"},
    "philosophie":          {"label": {"fr": "Philosophie", "ar": "الفلسفة"}, "icone": "book"},
}

NIVEAUX = [
    ("1AF", "fondamental", 1,  {"fr": "1AF · 1re année fondamental", "ar": "السنة الأولى أساسي"},
     ["arabe", "francais", "mathematiques", "education_islamique"]),
    ("2AF", "fondamental", 2,  {"fr": "2AF · 2e année fondamental", "ar": "السنة الثانية أساسي"},
     ["arabe", "francais", "mathematiques", "education_islamique"]),
    ("3AF", "fondamental", 3,  {"fr": "3AF · 3e année fondamental", "ar": "السنة الثالثة أساسي"},
     ["arabe", "francais", "mathematiques", "education_islamique", "sciences"]),
    ("4AF", "fondamental", 4,  {"fr": "4AF · 4e année fondamental", "ar": "السنة الرابعة أساسي"},
     ["arabe", "francais", "mathematiques", "education_islamique", "sciences"]),
    ("5AF", "fondamental", 5,  {"fr": "5AF · 5e année fondamental", "ar": "السنة الخامسة أساسي"},
     ["arabe", "francais", "mathematiques", "education_islamique", "sciences", "histoire_geo"]),
    ("6AF", "fondamental", 6,  {"fr": "6AF · 6e année fondamental (Concours)", "ar": "السنة السادسة أساسي (المباراة)"},
     ["arabe", "francais", "mathematiques", "education_islamique", "sciences", "histoire_geo"]),
    ("1AS", "college", 7,  {"fr": "1AS · 1re année secondaire (collège)", "ar": "السنة الأولى إعدادي"},
     ["arabe", "francais", "mathematiques", "sciences_naturelles", "histoire_geo", "education_islamique"]),
    ("2AS", "college", 8,  {"fr": "2AS · 2e année secondaire (collège)", "ar": "السنة الثانية إعدادي"},
     ["arabe", "francais", "mathematiques", "sciences_naturelles", "histoire_geo", "education_islamique"]),
    ("3AS", "college", 9,  {"fr": "3AS · 3e année secondaire (collège)", "ar": "السنة الثالثة إعدادي"},
     ["arabe", "francais", "mathematiques", "sciences_naturelles", "physique_chimie", "histoire_geo", "education_islamique", "anglais"]),
    ("4AS", "college", 10, {"fr": "4AS · 4e année secondaire (Brevet/BEPC)", "ar": "السنة الرابعة إعدادي (شهادة البريفيه)"},
     ["arabe", "francais", "mathematiques", "sciences_naturelles", "physique_chimie", "histoire_geo", "education_islamique", "anglais"]),
    ("5AS", "lycee", 11, {"fr": "5AS · 1re année lycée (2nd cycle)", "ar": "السنة الخامسة ثانوي"},
     ["arabe", "francais", "mathematiques", "sciences_naturelles", "physique_chimie", "histoire_geo", "education_islamique", "anglais"]),
    ("6AS", "lycee", 12, {"fr": "6AS · 2e année lycée", "ar": "السنة السادسة ثانوي"},
     ["arabe", "francais", "mathematiques", "sciences_naturelles", "physique_chimie", "histoire_geo", "education_islamique", "anglais"]),
    ("7AS", "lycee", 13, {"fr": "7AS · Année du Baccalauréat", "ar": "السنة السابعة ثانوي (البكالوريا)"},
     ["francais", "histoire_geo", "education_islamique", "anglais", "philosophie"]),
]

SERIES_7AS = {
    "7AS": [
        {"id": "A", "label": {"fr": "Série A — Lettres & langues", "ar": "الشعبة الآداب واللغات"},
         "matieresExtra": ["arabe", "mathematiques", "physique_chimie"]},
        {"id": "C", "label": {"fr": "Série C — Mathématiques & sciences physiques", "ar": "الشعبة الرياضية والفيزياء"},
         "matieresExtra": ["arabe", "mathematiques", "sciences_naturelles", "physique_chimie"]},
        {"id": "D", "label": {"fr": "Série D — Sciences expérimentales (SVT)", "ar": "الشعبة العلمية (علوم الحياة والأرض)"},
         "matieresExtra": ["mathematiques", "sciences_naturelles", "physique_chimie"]},
    ]
}

EMPTY_NOTE = {
    "fr": "Matière en préparation : ajoutez vos unités ici (voir content/_GUIDE.md).",
    "ar": "مادة قيد الإعداد: أضف دروسك هنا (انظر content/_GUIDE.md).",
}

# ---------------- Lecture du contenu ----------------
def load_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)

def scan_units():
    units, problems = [], []
    for path in sorted(glob.glob(os.path.join(CONTENT, '**', '*.json'), recursive=True)):
        rel = os.path.relpath(path, CONTENT).replace(os.sep, '/')
        base = os.path.basename(path)
        if base == 'index.json' or base.startswith('_') or base == 'catalogue.json':
            continue
        try:
            data = load_json(path)
        except Exception as e:
            problems.append(f"JSON invalide : content/{rel} → {e}")
            continue
        schema = data.get('schema', '')
        if schema == 'sehil.examen@1':
            continue  # géré à part
        if schema != 'sehil.unit@1':
            problems.append(f"Schéma inconnu : content/{rel} ({schema})")
            continue
        units.append({"data": data, "path": rel})
    return units, problems

def scan_exams():
    exams, problems = [], []
    for path in sorted(glob.glob(os.path.join(CONTENT, 'examens', '*.json'))):
        base = os.path.basename(path)
        try:
            data = load_json(path)
        except Exception as e:
            problems.append(f"JSON invalide : content/examens/{base} → {e}")
            continue
        if data.get('schema') != 'sehil.examen@1':
            problems.append(f"Schéma examen inconnu : {base}")
            continue
        exams.append({"data": data, "path": base})
    return exams, problems

# ---------------- Validation des schémas ----------------
def validate_unit(data, rel, problems):
    for field in ("id", "niveau", "matiere", "ordre", "titre", "objectifs", "statut"):
        if field not in data:
            problems.append(f"Unité content/{rel} : champ manquant « {field} »")
    if data.get('statut') not in ('PUBLIE', 'A_RELIRE'):
        problems.append(f"Unité content/{rel} : statut invalide ({data.get('statut')})")
    ids = set()
    for q in data.get('quiz', []):
        if q.get('id') in ids:
            problems.append(f"Unité content/{rel} : quiz id dupliqué {q.get('id')}")
        ids.add(q.get('id'))
        if q.get('type') == 'qcm' and not (0 <= q.get('bonne', -1) < len(q.get('choix', []))):
            problems.append(f"Unité content/{rel} : quiz {q.get('id')} — index « bonne » hors limites")
        if q.get('type') in ('courte', 'calcul') and not q.get('acceptees'):
            problems.append(f"Unité content/{rel} : quiz {q.get('id')} — « acceptees » manquant")
    fids = set()
    for f in data.get('flashcards', []):
        if f.get('id') in fids:
            problems.append(f"Unité content/{rel} : flashcard id dupliqué {f.get('id')}")
        fids.add(f.get('id'))

def validate_exam(data, base, problems):
    total = 0
    for s in data.get('sections', []):
        total += s.get('points', 0)
        for q in s.get('questions', []):
            if q.get('type') == 'qcm' and not (0 <= q.get('bonne', -1) < len(q.get('choix', []))):
                problems.append(f"Examen {base} : question {q.get('id')} — index « bonne » hors limites")
            if q.get('type') in ('courte', 'calcul') and not q.get('acceptees'):
                problems.append(f"Examen {base} : question {q.get('id')} — « acceptees » manquant")
            if q.get('type') == 'redaction' and q.get('points', 0) < 1:
                problems.append(f"Examen {base} : question {q.get('id')} — points < 1")
    if total != data.get('note_max'):
        problems.append(f"Examen {base} : somme des sections = {total} ≠ note_max {data.get('note_max')}")

# ---------------- Arborescence complète ----------------
def ensure_tree():
    created = 0
    for (nid, cycle, _o, _l, mats) in NIVEAUX:
        cycle_dir = {"fondamental": "fondamental", "college": "college", "lycee": "lycee"}[cycle]
        if nid == '7AS':
            base = os.path.join(CONTENT, cycle_dir, nid)
            for mid in NIVEAUX[12][4]:
                d = os.path.join(base, 'commun', mid)
                if not os.path.isdir(d):
                    os.makedirs(d, exist_ok=True); created += 1
                write_index_if_missing(d)
            for serie in SERIES_7AS['7AS']:
                for mid in serie['matieresExtra']:
                    d = os.path.join(base, f"serie-{serie['id']}", mid)
                    if not os.path.isdir(d):
                        os.makedirs(d, exist_ok=True); created += 1
                    write_index_if_missing(d)
        else:
            for mid in mats:
                d = os.path.join(CONTENT, cycle_dir, nid, mid)
                if not os.path.isdir(d):
                    os.makedirs(d, exist_ok=True); created += 1
                write_index_if_missing(d)
    return created

def write_index_if_missing(d):
    idx = os.path.join(d, 'index.json')
    if not os.path.exists(idx):
        with open(idx, 'w', encoding='utf-8') as f:
            json.dump({"schema": "najma.index@1", "statut": "A_RELIRE", "note": EMPTY_NOTE, "unites": []},
                      f, ensure_ascii=False, indent=2)

# ---------------- Catalogue ----------------
def build_catalogue(units, exams):
    unites_out = []
    for u in units:
        d = u['data']
        unites_out.append({
            "id": d['id'], "niveau": d['niveau'], "matiere": d['matiere'], "ordre": d.get('ordre', 1),
            "path": u['path'], "titre": d['titre'], "statut": d.get('statut', 'A_RELIRE'),
            "duree_min": d.get('duree_min', 25),
        })
    unites_out.sort(key=lambda x: (x['niveau'], x['matiere'], x['ordre']))

    exams_out = []
    for e in exams:
        d = e['data']
        exams_out.append({
            "id": d['id'], "niveau": d['niveau'], "serie": d.get('serie'),
            "path": 'examens/' + e['path'], "titre": d['titre'],
            "duree_min": d.get('duree_min', 120), "note_max": d.get('note_max', 20),
            "statut": d.get('statut', 'A_RELIRE'),
        })

    niveaux = [{"id": nid, "cycle": cycle, "ordre": o, "label": lab, "matieres": mats}
               for (nid, cycle, o, lab, mats) in NIVEAUX]

    cat = {
        "schema": "najma.catalogue@1",
        "genere": "2026-11-24",
        "matieres": {mid: {"label": m['label'], "icone": m['icone']} for mid, m in MATIERES.items()},
        "niveaux": niveaux,
        "series": SERIES_7AS,
        "unites": unites_out,
        "examens": exams_out,
    }
    with open(os.path.join(CONTENT, 'catalogue.json'), 'w', encoding='utf-8') as f:
        json.dump(cat, f, ensure_ascii=False, indent=2)
    # Fichier de métadonnées des matières (utilisé par l'app)
    with open(os.path.join(CONTENT, '_matieres.json'), 'w', encoding='utf-8') as f:
        json.dump({mid: {"label": m['label'], "icone": m['icone']} for mid, m in MATIERES.items()},
                  f, ensure_ascii=False, indent=2)
    return cat

# ---------------- Service Worker ----------------
APP_EXTS = ('.html', '.css', '.js', '.json', '.png', '.svg', '.webmanifest', '.ico')

def build_sw():
    assets = ['index.html', 'manifest.webmanifest']
    for base in ('assets/css', 'assets/js', 'assets/img'):
        for dirpath, _dirs, files in os.walk(os.path.join(ROOT, base)):
            for fn in sorted(files):
                if fn.endswith(APP_EXTS):
                    rel = os.path.relpath(os.path.join(dirpath, fn), ROOT).replace(os.sep, '/')
                    assets.append(rel)
    for dirpath, _dirs, files in os.walk(CONTENT):
        for fn in sorted(files):
            if fn.endswith('.json'):
                rel = os.path.relpath(os.path.join(dirpath, fn), ROOT).replace(os.sep, '/')
                assets.append(rel)
    version = 'najma-v1-' + '20261124'
    body = f"""/* Généré automatiquement par tools/build.py — ne pas éditer la liste. */
const VERSION = '{version}';
const PRECACHE = {json.dumps(assets, indent=2)};

self.addEventListener('install', (event) => {{
  event.waitUntil((async () => {{
    const cache = await caches.open(VERSION);
    for (let i = 0; i < PRECACHE.length; i += 20) {{
      const chunk = PRECACHE.slice(i, i + 20);
      await Promise.all(chunk.map(u => cache.add(u).catch(() => {{}})));
    }}
    await self.skipWaiting();
  }})());
}});

self.addEventListener('activate', (event) => {{
  event.waitUntil((async () => {{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  }})());
}});

self.addEventListener('fetch', (event) => {{
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {{
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req);
    if (hit) return hit;
    try {{
      const res = await fetch(req);
      if (res && res.status === 200) cache.put(req, res.clone());
      return res;
    }} catch (err) {{
      // Mode avion : retomber sur la coquille applicative
      const shell = await cache.match('./index.html');
      if (shell) return shell;
      throw err;
    }}
  }})());
}});

self.addEventListener('message', (e) => {{ if (e.data === 'SKIP_WAITING') self.skipWaiting(); }});
"""
    with open(os.path.join(ROOT, 'sw.js'), 'w', encoding='utf-8') as f:
        f.write(body)
    return len(assets)

# ---------------- Tableau de contrôle (section auto) ----------------
def build_control_table(units, exams, problems):
    rows = []
    for u in sorted(units, key=lambda x: (x['data']['niveau'], x['data']['matiere'], x['data'].get('ordre', 1))):
        d = u['data']
        notes = d.get('notes_editeur', [])
        note_txt = ' ; '.join(n.get('fr', n) if isinstance(n, dict) else n for n in notes) or '—'
        rows.append(f"| {d['niveau']} | {d['matiere']} | {d['titre']['fr']} | `{d['id']}` | {d.get('statut')} | {note_txt} |")
    rows_ex = []
    for e in exams:
        d = e['data']
        notes = d.get('notes_editeur', [])
        note_txt = ' ; '.join(n.get('fr', n) if isinstance(n, dict) else n for n in notes) or '—'
        rows_ex.append(f"| {d['niveau']} | {d['titre']['fr']} | `{d['id']}` | {d.get('statut')} | {note_txt} |")

    md = f"""
<!-- Section générée automatiquement par tools/build.py — ne pas éditer à la main -->

## Contenu présent dans l'application ({len(units)} unités, {len(exams)} examens blancs)

### Unités pédagogiques

| Niveau | Matière | Titre | ID | Statut | Points à relire |
|---|---|---|---|---|---|
{chr(10).join(rows)}

### Examens blancs

| Niveau | Titre | ID | Statut | Points à relire |
|---|---|---|---|---|
{chr(10).join(rows_ex)}

### Rapport de validation

{chr(10).join('- ✅ ' + p for p in problems) if problems else '- ✅ Aucun problème détecté : tous les JSON sont valides et complets.'}
"""
    return md

# ---------------- Main ----------------
def main():
    if not os.path.isdir(CONTENT):
        print('Dossier content/ introuvable'); sys.exit(1)
    created = ensure_tree()
    units, problems = scan_units()
    exams, problems_ex = scan_exams()
    problems += problems_ex
    for u in units:
        validate_unit(u['data'], u['path'], problems)
    for e in exams:
        validate_exam(e['data'], e['path'], problems)
    cat = build_catalogue(units, exams)
    n_assets = build_sw()
    os.makedirs(DOCS, exist_ok=True)
    table = build_control_table(units, exams, problems)
    marker_file = os.path.join(DOCS, '_auto_section.md')
    with open(marker_file, 'w', encoding='utf-8') as f:
        f.write(table)
    print(f"✔ Dossiers créés : {created}")
    print(f"✔ Unités scannées : {len(units)}  (PUBLIE={sum(1 for u in units if u['data'].get('statut')=='PUBLIE')}, A_RELIRE={sum(1 for u in units if u['data'].get('statut')=='A_RELIRE')})")
    print(f"✔ Examens scannés : {len(exams)}")
    print(f"✔ catalogue.json : {len(cat['niveaux'])} niveaux, {sum(len(n['matieres']) for n in cat['niveaux'])} lignes de matières")
    print(f"✔ sw.js : {n_assets} fichiers précachés")
    if problems:
        print(f"⚠ {len(problems)} problème(s) de validation :")
        for p in problems: print('  -', p)
    else:
        print('✔ Validation : tous les JSON sont conformes.')

if __name__ == '__main__':
    main()
