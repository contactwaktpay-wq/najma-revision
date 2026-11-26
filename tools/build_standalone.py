#!/usr/bin/env python3
# ============================================================
# build_standalone.py — Génère najma-standalone.html :
# UN seul fichier HTML qui contient CSS + JS + tout le contenu.
# Double-cliquable (file://), sans serveur, sans connexion.
# Usage : python3 tools/build_standalone.py
# ============================================================
import argparse, json, os, posixpath, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS_DIR = os.path.join(ROOT, 'assets', 'js')

ap = argparse.ArgumentParser(description='Génère un fichier HTML unique autonome.')
ap.add_argument('--out', default='najma-standalone.html', help='nom du fichier de sortie')
ap.add_argument('--only', nargs='*', default=[], metavar='NIVEAU:MATIERE',
                help='filtre du contenu embarqué, ex. 6AF:mathematiques 6AF:* (* = toutes les matières)')
ap.add_argument('--only-units', nargs='*', default=[], metavar='ID',
                help='sélection fine par identifiant d\u2019unité')
args = ap.parse_args()

# ---------- collecte des modules ----------
mod_files = []
for base, _dirs, files in os.walk(JS_DIR):
    for f in sorted(files):
        if f.endswith('.js'):
            mod_files.append(os.path.relpath(os.path.join(base, f), ROOT).replace(os.sep, '/'))
mod_files.sort()

def read(mid):
    with open(os.path.join(ROOT, mid), encoding='utf-8') as f:
        return f.read()

RE_IMP = re.compile(r"import\s*\{([^}]*)\}\s*from\s*['\"]([^'\"]+)['\"]\s*;", re.S)

def resolve(spec, cur_dir):
    return posixpath.normpath(posixpath.join(cur_dir, spec))

# graphe de dépendances + réécriture des imports
deps = {}
rewritten = {}
for mid in mod_files:
    src = read(mid)
    cur_dir = posixpath.dirname(mid)
    local = set()
    def repl(m):
        names, spec = m.group(1), m.group(2)
        rid = resolve(spec, cur_dir)
        local.add(rid)
        destruct = re.sub(r'\s+', ' ', names.replace('\n', ' ').strip())
        destruct = re.sub(r'\bas\b', ':', destruct)  # alias import {a as b} → {a: b}
        return "const { %s } = __req('%s');" % (destruct, rid)
    rewritten[mid] = RE_IMP.sub(repl, src)
    deps[mid] = {d for d in local if d in set(mod_files)}

# ordre topologique (dépendances d'abord) + détection de cycles
order, seen = [], {}
def visit(mid, stack):
    if seen.get(mid) == 2:
        return
    if mid in stack:
        sys.exit("✗ Cycle de dépendances : " + ' → '.join(stack + [mid]))
    for d in sorted(deps[mid]):
        visit(d, stack + [mid])
    seen[mid] = 2
    order.append(mid)
for m in mod_files:
    visit(m, [])

RE_EXP_FN = re.compile(r"^export\s+(?=(async\s+)?function\s+(\w+))", re.M)
RE_EXP_VAR = re.compile(r"^export\s+(const|let|var)\s+(\w+)", re.M)
RE_EXP_LIST = re.compile(r"^export\s*\{([^}]*)\}\s*;?\s*$", re.M)

def wrap(mid):
    src = rewritten[mid]
    exported = []
    for m in RE_EXP_FN.finditer(src):
        exported.append(m.group(2))
    src = RE_EXP_FN.sub('', src)
    for m in RE_EXP_VAR.finditer(src):
        exported.append(m.group(2))
    src = RE_EXP_VAR.sub(r'\1 \2', src)
    for m in RE_EXP_LIST.finditer(src):
        for item in m.group(1).split(','):
            item = item.strip()
            if not item:
                continue
            mm = re.match(r'(\w+)(?:\s+as\s+(\w+))$', item)
            if mm:
                exported.append('%s: %s' % (mm.group(2), mm.group(1)))
            else:
                exported.append(item)
    src = RE_EXP_LIST.sub('', src)
    # le routeur importe les écrans dynamiquement → registre local
    if mid.endswith('core/router.js'):
        src = src.replace('await import(def.src)', 'await __dimport(def.src)')
    body = src.strip('\n')
    ret = 'return { %s };' % ', '.join(sorted(set(exported)))
    return "__def('%s', () => {\n%s\n%s\n});" % (mid, body, ret)

bundle = "\n\n".join(wrap(m) for m in order)
bundle += "\n\n__req('assets/js/main.js');\n"

runtime = """'use strict';
const __M = Object.create(null);
const __req = (id) => { const m = __M[id]; if (!m) throw new Error('Module manquant: ' + id); return m; };
const __def = (id, factory) => { __M[id] = factory(); };
/* import dynamique simulé : résout comme le routeur (relatif à assets/js/core/) */
const __dimport = (spec) => {
  const out = [];
  for (const p of ('assets/js/core/' + spec).split('/')) {
    if (p === '..') out.pop(); else if (p && p !== '.') out.push(p);
  }
  return Promise.resolve(__req(out.join('/')));
};
"""

# ---------- contenu embarqué ----------
def load_json(rel):
    with open(os.path.join(ROOT, rel), encoding='utf-8') as f:
        return json.load(f)

cat = load_json('content/catalogue.json')

# Filtre optionnel du contenu (versions de démonstration légères)
if args.only:
    keep = []
    for spec in args.only:
        niv, _, mat = spec.partition(':')
        keep.append((niv or '*', mat or '*'))
    def _keep(u):
        return any((n == '*' or u['niveau'] == n) and (m == '*' or u['matiere'] == m) for n, m in keep)
    cat['unites'] = [u for u in cat['unites'] if _keep(u)]
    nivs = {u['niveau'] for u in cat['unites']}
    cat['examens'] = [e for e in cat['examens'] if e['niveau'] in nivs]
if args.only_units:
    ids = set(args.only_units)
    cat['unites'] = [u for u in cat['unites'] if u['id'] in ids]
    nivs = {u['niveau'] for u in cat['unites']}
    cat['examens'] = [e for e in cat['examens'] if e['niveau'] in nivs]

matieres = load_json('content/_matieres.json')
unites = {}
for u in cat['unites']:
    unites[u['path']] = load_json('content/' + u['path'])
examens = {}
for e in cat['examens']:
    examens[e['path']] = load_json('content/' + e['path'])

embed = json.dumps({
    'catalogue': cat, 'matieres': matieres, 'unites': unites, 'examens': examens,
}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')

# ---------- assemblage HTML ----------
with open(os.path.join(ROOT, 'index.html'), encoding='utf-8') as f:
    html = f.read()

css = ''
for href in ('assets/css/base.css', 'assets/css/ui.css'):
    with open(os.path.join(ROOT, href), encoding='utf-8') as f:
        css += '/* ===== %s ===== */\n' % href + f.read() + '\n'

html = re.sub(r'<link\s+rel="stylesheet"[^>]*>', '', html)
html = html.replace('</head>', '<style>\n%s</style>\n</head>' % css)
html = re.sub(
    r'<script\s+type="module"[^>]*>\s*</script>',
    lambda m: "<script>globalThis.NAJMA_CONTENT = %s;</script>\n<script>\n%s%s</script>"
              % (embed, runtime, bundle),
    html, count=1)

if '<script type="module"' in html:
    sys.exit('✗ script module non remplacé — vérifier index.html')

out = os.path.join(ROOT, args.out)
with open(out, 'w', encoding='utf-8') as f:
    f.write(html)
print('✔ najma-standalone.html généré (%d modules, %.1f Ko)'
      % (len(order), os.path.getsize(out) / 1024))
print('  ordre :', ' → '.join(m.split('/')[-1] for m in order[:6]), '…')
