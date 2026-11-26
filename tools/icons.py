#!/usr/bin/env python3
# ============================================================
# icons.py — Génère les icônes PNG de la PWA depuis le motif de
# marque Najma (étoile à 8 branches + dunes), avec Pillow.
# Usage : python3 tools/icons.py
# ============================================================
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'img', 'icons')
os.makedirs(OUT, exist_ok=True)

BLEU = (13, 59, 102, 255)        # #0D3B66
BLEU_DEEP = (9, 42, 74, 255)     # #092A4A
OR = (240, 199, 94, 255)         # #F0C75E
OR_DEEP = (217, 160, 50, 255)    # #D9A032
BLANC = (250, 247, 240, 255)     # #FAF7F0
SABLE = (242, 232, 213, 255)     # #F2E8D5
OCRE = (199, 123, 63, 255)       # #C77B3F

def star8(cx, cy, r, rot=0.0):
    """Silhouette d'étoile à 8 branches = union de 2 carrés tournés de 45°."""
    pts_all = []
    for k in range(2):
        a0 = rot + k * 3.14159 / 4
        pts = []
        for i in range(4):
            a = a0 + i * 3.14159 / 2
            pts.append((cx + r * __import__('math').cos(a), cy + r * __import__('math').sin(a)))
        pts_all.append(pts)
    return pts_all

def draw_icon(size, maskable=False):
    img = Image.new('RGBA', (size, size), BLEU)
    d = ImageDraw.Draw(img)
    S = size / 512.0
    cy = size * (0.40 if maskable else 0.42)
    r = size * (0.13 if maskable else 0.165)  # zone de sécurité maskable ≈ 80 %
    # Halo
    d.ellipse([cy - r * 1.9, cy - r * 1.9, cy + r * 1.9, cy + r * 1.9], fill=BLEU_DEEP)
    # Étoile à 8 branches (2 carrés tournés)
    import math
    for rot in (0, math.pi / 8):
        pts = [(cy + r * math.cos(rot + i * math.pi / 4),
                cy + r * math.sin(rot + i * math.pi / 4)) for i in range(4)]
        d.polygon(pts, fill=OR)
    # Contour doré foncé
    d.ellipse([cy - r * 0.30, cy - r * 0.30, cy + r * 0.30, cy + r * 0.30], fill=OR_DEEP)
    d.ellipse([cy - r * 0.20, cy - r * 0.20, cy + r * 0.20, cy + r * 0.20], fill=BLANC)
    # Petites étoiles du ciel
    for (sx, sy, sr) in [(0.22, 0.14, 4), (0.80, 0.18, 3), (0.16, 0.42, 2.5), (0.86, 0.40, 2.5)]:
        x, y, rr = size * sx, size * sy, sr * S
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=BLANC)
    # Dunes (2 arcs superposés en bas)
    d.pieslice([-size * 0.25, size * 0.62, size * 0.85, size * 1.25], 180, 300, fill=OCRE)
    d.pieslice([size * 0.35, size * 0.68, size * 1.3, size * 1.35], 240, 360, fill=SABLE)
    return img

for name, size in [('icon-192.png', 192), ('icon-512.png', 512)]:
    draw_icon(size).save(os.path.join(OUT, name), optimize=True)

for name, size in [('maskable-192.png', 192), ('maskable-512.png', 512)]:
    draw_icon(size, maskable=True).save(os.path.join(OUT, name), optimize=True)

draw_icon(180).save(os.path.join(OUT, 'apple-touch-icon.png'), optimize=True)
draw_icon(32).save(os.path.join(OUT, 'favicon-32.png'), optimize=True)
print('✔ Icônes générées dans assets/img/icons/')
