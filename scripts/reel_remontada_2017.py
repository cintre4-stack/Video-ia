#!/usr/bin/env python3
"""Reel vertical 'La Remontada' (Barca 6-1 PSG, 2017) en Estilo Cancha Chibi.

Uso:
  python3 scripts/reel_remontada_2017.py --sheet            # hoja de contactos
  python3 scripts/reel_remontada_2017.py --render           # video mudo + sfx
  python3 scripts/reel_remontada_2017.py --render --voice v.mp3 --timeline tl.json
"""
import argparse, json, math, os, random, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageChops, ImageFilter

W, H, FPS = 1080, 1920, 24
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out", "remontada")
FONT_XB = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
INK = (18, 18, 24)
YEL = (255, 230, 90)

# ----------------------------------------------------------------- kits ----
SKIN = (240, 196, 160)
SKIN2 = (196, 140, 100)
BAR = dict(shirt=(0, 77, 152), stripe=(165, 0, 68), shorts=(0, 50, 110), socks=(0, 50, 110),
           style="vstripes", skin=SKIN, hair=(40, 28, 20), gk=False, numc=(255, 214, 60))
PSG = dict(shirt=(10, 30, 80), stripe=(218, 30, 50), shorts=(10, 30, 80), socks=(10, 30, 80),
           style="band", skin=SKIN, hair=(30, 22, 16), gk=False, numc=(255, 255, 255))
TER = dict(shirt=(40, 175, 90), stripe=(20, 120, 60), shorts=(20, 110, 60), socks=(40, 175, 90),
           style="plain", skin=SKIN, hair=(205, 170, 90), gk=True, numc=(255, 255, 255))
TRAPP = dict(shirt=(95, 98, 110), stripe=(60, 62, 72), shorts=(60, 62, 72), socks=(95, 98, 110),
             style="plain", skin=SKIN, hair=(120, 90, 50), gk=True, numc=(255, 255, 255))
REF = dict(shirt=(20, 20, 26), stripe=(60, 60, 70), shorts=(20, 20, 26), socks=(20, 20, 26),
           style="plain", skin=SKIN, hair=(40, 30, 20), gk=False, numc=(255, 255, 255))


def kit(base, **kw):
    k = dict(base); k.update(kw); return k


SUAREZ = kit(BAR, hair=(30, 22, 16))
NEY = kit(BAR, skin=SKIN2, hair=(240, 210, 120))
MESSI = kit(BAR, hair=(150, 90, 40))
SERGI = kit(BAR, hair=(30, 22, 16))
CAVANI = kit(PSG, hair=(30, 22, 16))

# ------------------------------------------------------------ helpers ------
_fonts = {}


def font(size):
    if size not in _fonts:
        _fonts[size] = ImageFont.truetype(FONT_XB, size)
    return _fonts[size]


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def lerp(a, b, u):
    return a + (b - a) * u


def ease_out_back(u, s=1.70158):
    u = clamp(u) - 1
    return 1 + (s + 1) * u ** 3 + s * u ** 2


def ease_io(u):
    u = clamp(u); return u * u * (3 - 2 * u)


def path(t, keys):
    """keys: [(t, value)], interpolacion suave por tramos."""
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t <= t1:
            u = ease_io((t - t0) / (t1 - t0)) if t1 > t0 else 1
            return lerp(v0, v1, u)
    return keys[-1][1]


def lin(t, keys):
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t <= t1:
            return lerp(v0, v1, (t - t0) / (t1 - t0)) if t1 > t0 else v1
    return keys[-1][1]


# ------------------------------------------------------------- chibi -------
def chibi(d, x, y, s, k, pose="idle", t=0.0, face=1, mouth=None, num="", back=False, lift=0.0, tilt=0.0):
    """Dibuja un personaje chibi con los pies en (x, y)."""
    lw = max(2, int(5 * s))
    leg, th, tw, R = 38 * s, 48 * s, 54 * s, 46 * s
    la = ra = 0.0          # angulo piernas (desde vertical, + hacia 'face')
    al, ar = 0.25, 0.25    # brazos (0 abajo, pi arriba)
    bob = 0.0
    m = mouth
    if pose == "run":
        ph = t * 2 * math.pi * 2.3
        la, ra = 0.65 * math.sin(ph), -0.65 * math.sin(ph)
        al, ar = 0.5 + 0.7 * math.sin(ph), 0.5 - 0.7 * math.sin(ph)
        bob = -abs(math.sin(ph)) * 8 * s
        m = m or "flat"
    elif pose == "walk":
        ph = t * 2 * math.pi * 1.3
        la, ra = 0.3 * math.sin(ph), -0.3 * math.sin(ph)
        al, ar = 0.25 + 0.3 * math.sin(ph), 0.25 - 0.3 * math.sin(ph)
        bob = -abs(math.sin(ph)) * 4 * s
    elif pose == "celebrate":
        ph = t * 2 * math.pi * 2.0
        al, ar = 2.6 + 0.25 * math.sin(ph * 2), 2.6 - 0.25 * math.sin(ph * 2)
        bob = -abs(math.sin(ph)) * 26 * s
        la, ra = 0.25, -0.25
        m = m or "open"
    elif pose == "jump":
        la, ra = 0.7, -0.2
        al, ar = 2.3, 2.5
        bob = -lift * s
        m = m or "o"
    elif pose == "sad":
        al, ar = 0.08, 0.08
        bob = 2 * s
        m = m or "sad"
    elif pose == "kick":
        la, ra = -0.25, 1.35
        al, ar = 1.4, 0.9
        m = m or "open"
    elif pose == "dive":
        la, ra = 0.5, 0.9
        al, ar = 2.6, 2.9
        bob = -lift * s
        m = m or "o"
    elif pose == "card":
        al, ar = 0.2, 2.9
        m = m or "flat"
    elif pose == "slide":
        la, ra = 1.2, 1.5
        al, ar = 1.6, 1.0
        bob = 14 * s
        m = m or "o"
    else:
        ph = t * 2 * math.pi * 0.6
        bob = math.sin(ph) * 1.5 * s
        m = m or "smile"

    d.ellipse([x - 34 * s, y - 7 * s, x + 34 * s, y + 7 * s], fill=(0, 40, 10, 90))
    hip = (x, y - leg + bob)
    # piernas
    for off, a in ((-11 * s, la), (11 * s, ra)):
        hx = hip[0] + off * 0.6
        fx = hx + math.sin(a) * leg * face
        fy = hip[1] + math.cos(a) * leg
        d.line([(hx, hip[1]), (fx, fy)], fill=INK, width=int(17 * s))
        d.line([(hx, hip[1]), (fx, fy)], fill=k["socks"], width=int(10 * s))
        d.ellipse([fx - 10 * s + 4 * s * face, fy - 6 * s, fx + 10 * s + 4 * s * face, fy + 6 * s], fill=INK)
    # torso
    top = hip[1] - th
    x0, x1 = x - tw / 2, x + tw / 2
    d.rounded_rectangle([x0, top, x1, hip[1] + 6 * s], radius=int(12 * s), fill=k["shirt"])
    if k["style"] == "vstripes":
        n = 4
        for i in range(n):
            if i % 2 == 1:
                d.rectangle([x0 + tw * i / n, top + 6 * s, x0 + tw * (i + 1) / n, hip[1] - 8 * s], fill=k["stripe"])
    elif k["style"] == "band":
        cx = x
        d.rectangle([cx - 12 * s, top + 3 * s, cx + 12 * s, hip[1] - 8 * s], fill=(245, 245, 245))
        d.rectangle([cx - 8 * s, top + 3 * s, cx + 8 * s, hip[1] - 8 * s], fill=k["stripe"])
    else:
        d.rectangle([x0 + 4 * s, top + th * 0.45, x1 - 4 * s, top + th * 0.55], fill=k["stripe"])
    # pantalon
    d.rectangle([x0 + 2 * s, hip[1] - 6 * s, x1 - 2 * s, hip[1] + 8 * s], fill=k["shorts"])
    d.rounded_rectangle([x0, top, x1, hip[1] + 8 * s], radius=int(12 * s), outline=INK, width=lw)
    if num:
        fs = int((30 if back else 20) * s)
        f = font(max(8, fs))
        cy = top + th * (0.48 if back else 0.32)
        cxn = x if back else x + 12 * s * face
        d.text((cxn, cy), num, font=f, fill=k["numc"], anchor="mm", stroke_width=max(1, int(2 * s)), stroke_fill=INK)
    # brazos
    hand = (255, 140, 30) if k["gk"] else k["skin"]
    for side, a in ((-1, al), (1, ar)):
        sx, sy = x + side * (tw / 2 - 5 * s), top + 10 * s
        L = 32 * s
        ex, ey = sx + side * math.sin(a) * L, sy + math.cos(a) * L
        d.line([(sx, sy), (ex, ey)], fill=INK, width=int(15 * s))
        d.line([(sx, sy), (ex, ey)], fill=k["shirt"], width=int(8 * s))
        r = (8 if k["gk"] else 6.5) * s
        d.ellipse([ex - r, ey - r, ex + r, ey + r], fill=hand, outline=INK, width=max(1, int(3 * s)))
    # cabeza
    hx = x + tilt * 20 * s
    hy = top - R * 0.82 + (5 * s if pose == "sad" else 0)
    d.ellipse([hx - R, hy - R, hx + R, hy + R], fill=k["skin"], outline=INK, width=lw)
    if back:
        d.chord([hx - R - 2, hy - R - 2, hx + R + 2, hy + R + 2], 150, 390, fill=k["hair"])
        d.ellipse([hx - R, hy - R, hx + R, hy + R], outline=INK, width=lw)
        return
    # pelo
    d.chord([hx - R - 3, hy - R - 4, hx + R + 3, hy + R * 0.6], 180 + (20 if face < 0 else 0), 360 - (20 if face > 0 else 0), fill=k["hair"])
    d.arc([hx - R, hy - R, hx + R, hy + R], 180, 360, fill=INK, width=lw)
    # ojos
    ex_off = 5 * s * face
    for side in (-1, 1):
        cx, cy = hx + side * 17 * s + ex_off, hy + 4 * s
        if m == "sad":
            cy += 3 * s
        d.ellipse([cx - 11 * s, cy - 13 * s, cx + 11 * s, cy + 13 * s], fill=(255, 255, 255), outline=INK, width=max(1, int(3 * s)))
        px, py = cx + 4 * s * face, cy + (4 * s if m == "sad" else 1 * s)
        d.ellipse([px - 5.5 * s, py - 6 * s, px + 5.5 * s, py + 6 * s], fill=INK)
        d.ellipse([px - 1 * s, py - 4 * s, px + 2.5 * s, py - 0.5 * s], fill=(255, 255, 255))
        if m == "sad":
            d.line([(cx - 10 * s, cy - 18 * s + side * 3 * s), (cx + 10 * s, cy - 18 * s - side * 3 * s)], fill=INK, width=max(1, int(3 * s)))
    # mejillas
    for side in (-1, 1):
        cx, cy = hx + side * 30 * s + ex_off, hy + 22 * s
        d.ellipse([cx - 7 * s, cy - 4 * s, cx + 7 * s, cy + 4 * s], fill=(245, 150, 150))
    # boca
    mx, my = hx + ex_off, hy + 28 * s
    bw = max(1, int(3 * s))
    if m == "open":
        d.ellipse([mx - 11 * s, my - 7 * s, mx + 11 * s, my + 12 * s], fill=(90, 20, 30), outline=INK, width=bw)
        d.ellipse([mx - 6 * s, my + 3 * s, mx + 6 * s, my + 10 * s], fill=(230, 90, 100))
    elif m == "sad":
        d.arc([mx - 10 * s, my + 1 * s, mx + 10 * s, my + 14 * s], 200, 340, fill=INK, width=bw)
    elif m == "o":
        d.ellipse([mx - 5 * s, my - 2 * s, mx + 5 * s, my + 9 * s], fill=(90, 20, 30), outline=INK, width=bw)
    elif m == "flat":
        d.line([(mx - 8 * s, my + 4 * s), (mx + 8 * s, my + 4 * s)], fill=INK, width=bw)
    else:
        d.arc([mx - 11 * s, my - 8 * s, mx + 11 * s, my + 8 * s], 20, 160, fill=INK, width=bw)


def ball(d, x, y, r, rot=0.0):
    d.ellipse([x - r, y - r, x + r, y + r], fill=(250, 250, 250), outline=INK, width=max(2, int(r * 0.22)))
    for i in range(3):
        a = rot + i * 2.09
        px, py = x + math.cos(a) * r * 0.45, y + math.sin(a) * r * 0.45
        q = r * 0.28
        d.ellipse([px - q, py - q, px + q, py + q], fill=INK)


def shadow(d, x, y, w):
    d.ellipse([x - w, y - w * 0.22, x + w, y + w * 0.22], fill=(10, 60, 25, 150))


# --------------------------------------------------------- backgrounds -----
HORIZON = 820


def make_background(seed=1, jump=0):
    rnd = random.Random(seed)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    d = ImageDraw.Draw(img)
    for y in range(0, HORIZON):
        u = y / HORIZON
        d.line([(0, y), (W, y)], fill=(int(8 + 14 * u), int(10 + 16 * u), int(30 + 30 * u)))
    # gradas
    for row in range(26):
        yy = 300 + row * 19 + row * row * 0.12
        r = 4 + row * 0.22
        n = int(W / (r * 2.6))
        for i in range(n + 2):
            xx = i * r * 2.6 + (row % 2) * r * 1.3 + rnd.uniform(-2, 2)
            dy = -rnd.choice([0, 4, 7]) * jump
            c = rnd.choice([(0, 77, 152), (165, 0, 68), (165, 0, 68), (0, 77, 152), (240, 200, 40), (220, 220, 230), (60, 60, 80)])
            sh = rnd.uniform(0.55, 1.0)
            c = tuple(int(v * sh) for v in c)
            d.ellipse([xx - r, yy - r + dy, xx + r, yy + r + dy], fill=c)
    d.rectangle([0, 786, W, HORIZON], fill=(22, 22, 34))
    d.rectangle([0, 790, W, 800], fill=(165, 0, 68))
    # cesped
    N = 14
    for k in range(N):
        y0 = HORIZON + (H - HORIZON) * (k / N) ** 1.5
        y1 = HORIZON + (H - HORIZON) * ((k + 1) / N) ** 1.5
        d.rectangle([0, y0, W, y1 + 1], fill=(44, 146, 64) if k % 2 == 0 else (36, 128, 55))
    d.line([(0, HORIZON + 8), (W, HORIZON + 8)], fill=(235, 245, 235), width=4)
    # reflectores
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for cx, cy in ((110, 180), (970, 180)):
        for rr in range(260, 0, -10):
            a = int(70 * (1 - rr / 260) ** 2)
            gd.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(255, 250, 220, a))
        for i in range(3):
            for j in range(2):
                gd.rectangle([cx - 45 + i * 32, cy - 25 + j * 28, cx - 21 + i * 32, cy - 3 + j * 28], fill=(255, 255, 240, 255))
    glow = glow.filter(ImageFilter.GaussianBlur(3))
    img.alpha_composite(glow)
    return img


BG = None
BG_JUMP = None


def bgs():
    global BG, BG_JUMP
    if BG is None:
        BG = make_background(1, 0)
        BG_JUMP = make_background(1, 1)
    return BG, BG_JUMP


# rain
RNG = np.random.default_rng(7)
DROPS = [(RNG.uniform(-300, W), RNG.uniform(0, H), RNG.uniform(1500, 2300), RNG.uniform(26, 50)) for _ in range(190)]


def rain(img, rt, alpha=95, slow=1.0):
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for x0, y0, v, L in DROPS:
        y = (y0 + v * rt) % (H + 100) - 50
        x = (x0 + 0.28 * v * rt) % (W + 300) - 150
        Ls = L * (0.45 if slow < 0.5 else 1)
        d.line([(x, y), (x + Ls * 0.28, y + Ls)], fill=(200, 215, 240, alpha), width=2)
    img.alpha_composite(ov)


# goals --------------------------------------------------------------------
def net_side(d, gx, gy, h, depth, bulge=0.0, by=None):
    """Porteria vista de lado, la boca mira a la izquierda (gx = poste)."""
    by = by if by is not None else gy - h * 0.5
    top_back = gy - h + 28
    def bp(u, v):  # u 0..1 profundidad, v 0..1 altura
        x = gx + depth * u
        ytop = lerp(gy - h, top_back, u)
        yy = lerp(gy, ytop, v)
        g = math.exp(-((yy - by) / (h * 0.28)) ** 2) * u
        return (x + bulge * 70 * g, yy)
    col = (235, 235, 240, 170)
    for i in range(9):
        v = i / 8
        d.line([bp(u / 10, v) for u in range(11)], fill=col, width=2)
    for i in range(9):
        u = i / 8
        d.line([bp(u, v / 10) for v in range(11)], fill=col, width=2)
    d.line([(gx + 24, gy - h + 8), (gx + 24, gy)], fill=(200, 200, 210), width=10)
    d.line([(gx, gy - h), (gx + depth, top_back)], fill=(250, 250, 250), width=12)
    d.line([(gx, gy - h), (gx, gy + 4)], fill=INK, width=20)
    d.line([(gx, gy - h), (gx, gy + 4)], fill=(250, 250, 250), width=13)


GL, GR, GT, GB = 230, 850, 1130, 1440


def net_front(d, bulge=0.0, bx=540, by=1280):
    col = (230, 230, 240, 160)
    def warp(x, y):
        dx, dy = x - bx, y - by
        g = math.exp(-(dx * dx + dy * dy) / (2 * 110 ** 2))
        return (x + dx * 0.35 * bulge * g, y + dy * 0.35 * bulge * g)
    for i in range(17):
        x = lerp(GL + 30, GR - 30, i / 16)
        d.line([warp(x, lerp(GT + 25, GB - 10, v / 12)) for v in range(13)], fill=col, width=2)
    for j in range(11):
        y = lerp(GT + 25, GB - 10, j / 10)
        d.line([warp(lerp(GL + 30, GR - 30, u / 16), y) for u in range(17)], fill=col, width=2)
    for pts in ([(GL, GB), (GL, GT), (GR, GT), (GR, GB)],):
        d.line(pts, fill=INK, width=24, joint="curve")
        d.line(pts, fill=(250, 250, 250), width=16, joint="curve")


# ------------------------------------------------------------ text ---------
_tcache = {}


def text_img(txt, size, fill=YEL, stroke=10, sfill=(0, 0, 0)):
    key = (txt, size, fill, stroke, sfill)
    if key not in _tcache:
        f = font(size)
        lines = txt.split("\n")
        bbs = [f.getbbox(l, stroke_width=stroke) for l in lines]
        lh = int(size * 1.08)
        w = max(b[2] - b[0] for b in bbs) + 20
        h = lh * len(lines) + stroke * 2 + 20
        im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        for i, l in enumerate(lines):
            d.text((w / 2, 10 + stroke + i * lh + lh / 2), l, font=f, fill=fill, anchor="mm", stroke_width=stroke, stroke_fill=sfill)
        _tcache[key] = im
    return _tcache[key]


def paste_scaled(img, src, cx, cy, sc, rot=0.0, alpha=1.0):
    if sc <= 0.01 or alpha <= 0.01:
        return
    w, h = max(1, int(src.width * sc)), max(1, int(src.height * sc))
    s = src.resize((w, h), Image.BILINEAR)
    if rot:
        s = s.rotate(rot, expand=True, resample=Image.BICUBIC)
    if alpha < 1:
        a = s.getchannel("A").point(lambda v: int(v * alpha))
        s.putalpha(a)
    img.alpha_composite(s, (int(cx - s.width / 2), int(cy - s.height / 2)))


def pop(img, txt, lt, cx, cy, size=150, fill=YEL, t_in=0.0, t_out=99, rot=0.0):
    if lt < t_in or lt > t_out:
        return
    u = (lt - t_in) / 0.28
    sc = ease_out_back(u)
    a = clamp((t_out - lt) / 0.15)
    paste_scaled(img, text_img(txt, size, fill), cx, cy, sc, rot, a)


_scache = {}


def stamp(img, txt, lt, cx, cy, t_in, size=110, rot=-12):
    if lt < t_in:
        return
    key = (txt, size)
    if key not in _scache:
        f = font(size)
        bb = f.getbbox(txt)
        w, h = bb[2] - bb[0] + 70, bb[3] - bb[1] + 60
        im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        d.rounded_rectangle([6, 6, w - 6, h - 6], radius=18, outline=(225, 30, 40), width=12)
        d.text((w / 2, h / 2), txt, font=f, fill=(225, 30, 40), anchor="mm")
        _scache[key] = im
    u = (lt - t_in) / 0.18
    sc = lerp(2.4, 1.0, ease_io(u))
    paste_scaled(img, _scache[key], cx, cy, sc, rot, clamp(u * 2))


_subcache = {}


def subtitle(img, txt, lt, y=1030):
    if txt not in _subcache:
        f = font(70)
        words = txt.upper().split()
        lines, cur = [], ""
        for w_ in words:
            test = (cur + " " + w_).strip()
            if f.getlength(test) > 900 and cur:
                lines.append(cur); cur = w_
            else:
                cur = test
        lines.append(cur)
        lines = lines[:2]
        lw = max(f.getlength(l) for l in lines)
        bw, bh = int(lw + 70), int(len(lines) * 84 + 40)
        im = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        d.rounded_rectangle([0, 0, bw, bh], radius=28, fill=(0, 0, 0, 153))
        for i, l in enumerate(lines):
            d.text((bw / 2, 20 + 42 + i * 84), l, font=f, fill=(255, 255, 255), anchor="mm")
        _subcache[txt] = im
    sc = lerp(0.85, 1.0, ease_out_back(lt / 0.18))
    paste_scaled(img, _subcache[txt], W / 2, y, sc, 0, clamp(lt / 0.08))


# scoreboard ---------------------------------------------------------------
def scoreboard(img, bar, psg, minute, glob=True):
    d = ImageDraw.Draw(img)
    x0, y0, h = 120, 92, 92
    d.rounded_rectangle([x0, y0, W - x0, y0 + h], radius=16, fill=(16, 16, 22), outline=(255, 255, 255), width=3)
    # bloques de color
    d.rectangle([x0 + 18, y0 + 18, x0 + 38, y0 + h - 18], fill=(0, 77, 152))
    d.rectangle([x0 + 38, y0 + 18, x0 + 58, y0 + h - 18], fill=(165, 0, 68))
    f = font(52)
    d.text((x0 + 70, y0 + h / 2), "BAR", font=f, fill=(255, 255, 255), anchor="lm")
    d.text((W / 2 - 40, y0 + h / 2), f"{bar} - {psg}", font=font(60), fill=YEL, anchor="mm")
    d.text((W / 2 + 100, y0 + h / 2), "PSG", font=f, fill=(255, 255, 255), anchor="lm")
    bx = W / 2 + 222
    d.rectangle([bx, y0 + 18, bx + 18, y0 + h - 18], fill=(10, 30, 80))
    d.rectangle([bx + 6, y0 + 18, bx + 12, y0 + h - 18], fill=(218, 30, 50))
    # minuto
    mw = 150
    d.rounded_rectangle([W - x0 - mw - 4, y0 + 8, W - x0 - 8, y0 + h - 8], radius=10, fill=(215, 30, 40))
    d.text((W - x0 - mw / 2 - 6, y0 + h / 2), minute, font=font(40), fill=(255, 255, 255), anchor="mm")
    if glob:
        gb, gp = bar, psg + 4
        d.rounded_rectangle([W / 2 - 170, y0 + h + 8, W / 2 + 170, y0 + h + 62], radius=12, fill=(255, 255, 255))
        d.text((W / 2, y0 + h + 35), f"GLOBAL  {gb} - {gp}", font=font(36), fill=(16, 16, 22), anchor="mm")


_SB = [None]


def SB(*a):
    _SB[0] = a


# ------------------------------------------------------------ fx -----------
VIG = None
SCAN = None


def red_vignette():
    global VIG
    if VIG is None:
        yy, xx = np.mgrid[0:H, 0:W]
        dd = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2)
        a = np.clip((dd - 0.45) / 0.55, 0, 1) ** 1.6 * 210
        arr = np.zeros((H, W, 4), np.uint8)
        arr[..., 0] = 170; arr[..., 1] = 0; arr[..., 2] = 10; arr[..., 3] = a.astype(np.uint8)
        VIG = Image.fromarray(arr, "RGBA")
    return VIG


def scanlines():
    global SCAN
    if SCAN is None:
        arr = np.zeros((H, W, 4), np.uint8)
        arr[::4, :, 3] = 70
        SCAN = Image.fromarray(arr, "RGBA")
    return SCAN


def desat(img, amt):
    if amt <= 0:
        return img
    rgb = img.convert("RGB")
    g = ImageEnhance.Color(rgb).enhance(1 - amt)
    g = ImageEnhance.Contrast(g).enhance(1 + 0.15 * amt)
    return g.convert("RGBA")


def camera(img, zoom=1.0, cx=W / 2, cy=H / 2, sx=0, sy=0):
    if zoom == 1.0 and sx == 0 and sy == 0:
        return img
    z = max(zoom, 1.0 + (0.035 if (sx or sy) else 0))
    cw, ch = W / z, H / z
    l = clamp(cx - cw / 2 + sx, 0, W - cw)
    t = clamp(cy - ch / 2 + sy, 0, H - ch)
    return img.crop((int(l), int(t), int(l + cw), int(t + ch))).resize((W, H), Image.BILINEAR)


def flash(img, a):
    if a <= 0:
        return img
    return Image.blend(img, Image.new("RGBA", (W, H), (255, 255, 255, 255)), clamp(a))


def vhs(img, amt, t):
    rgb = img.convert("RGB")
    r, g, b = rgb.split()
    off = int(14 * amt)
    r = ImageChops.offset(r, off, 0)
    b = ImageChops.offset(b, -off, 0)
    out = Image.merge("RGB", (r, g, b)).convert("RGBA")
    out.alpha_composite(scanlines())
    d = ImageDraw.Draw(out, "RGBA")
    yb = int((t * 900) % H)
    d.rectangle([0, yb, W, yb + 14], fill=(255, 255, 255, 25))
    return out


CONF = [(RNG.uniform(0, W), RNG.uniform(-1600, 0), RNG.uniform(260, 520), RNG.uniform(0, 6.28),
         random.Random(i).choice([(0, 77, 152), (165, 0, 68), (255, 214, 60), (255, 255, 255)])) for i in range(170)]


def confetti(img, lt):
    if lt < 0:
        return
    d = ImageDraw.Draw(img)
    for x0, y0, v, ph, c in CONF:
        y = y0 + v * lt * 1.6
        if y < -20 or y > H + 20:
            continue
        x = x0 + 40 * math.sin(lt * 3 + ph)
        w = 14 * abs(math.cos(lt * 5 + ph)) + 3
        d.rectangle([x - w, y - 7, x + w, y + 7], fill=c)


# ------------------------------------------------------- ball paths -------
def arc(t, t0, t1, p0, p1, hgt):
    u = clamp((t - t0) / (t1 - t0))
    return (lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) - hgt * 4 * u * (1 - u))


# ================================================================ scenes ==
# Cada escena: fn(img, d, lt, S) donde S tiene start/dur/beat y datos.
# Devuelve dict de efectos {zoom, cx, cy, shake, flash, desat, vig, vhs}.

GROUND = 1500
GX = 905


def final_core(img, d, r, show_net=True):
    """Ultima jugada. r = 0 cuando el balon toca la red."""
    fx = {}
    gx, gy = GX, GROUND
    bulge = math.exp(-((r - 0.12) / 0.18) ** 2) * 1.0 if r > -0.02 else 0
    # Trapp
    tr_l = 0 if r < -0.25 else clamp((r + 0.25) / 0.3) * 60
    trx = path(r, [(-1.5, 860), (-0.2, 830), (0.2, 860)])
    # defensas
    for i, (xa, xb) in enumerate(((560, 700), (480, 640))):
        xx = path(r, [(-2.0, xa), (-0.1, xb)])
        chibi(d, xx, GROUND - 40 + i * 70, 1.25, PSG, "run" if r < 0 else "sad", r + i * 0.3, 1, num=str(3 + i * 2))
    chibi(d, trx, GROUND - 20, 1.3, TRAPP, "dive" if r > -0.25 else "idle", r, -1, lift=tr_l, num="1")
    # Neymar (centro)
    ny_pose = "kick" if -1.85 < r < -1.45 else ("run" if r < 0 else "celebrate")
    nyx = path(r, [(-2.5, 90), (-1.7, 180), (0, 300), (1.5, 420)])
    chibi(d, nyx, GROUND + 70, 1.45, NEY, ny_pose, r, 1, num="11")
    # Sergi Roberto
    srx = path(r, [(-2.5, 300), (-0.2, 760), (1.0, 640), (3.0, 420)])
    if -0.3 < r < 0.25:
        pose = "kick"
    elif r < 0:
        pose = "run"
    else:
        pose = "celebrate"
    chibi(d, srx, GROUND + 20, 1.55, SERGI, pose, r, 1 if r < 0.6 else -1, num="20", mouth="open" if r > -0.3 else None)
    # balon
    if r < -1.7:
        bx, by = nyx + 30, GROUND + 60
    elif r < -0.15:
        bx, by = arc(r, -1.7, -0.15, (210, GROUND + 50), (840, GROUND - 60), 720)
    elif r < 0.0:
        bx, by = arc(r, -0.15, 0.0, (840, GROUND - 60), (gx + 20, GROUND - 150), 20)
    else:
        bx = gx + 20 + 60 * clamp(r / 0.15)
        by = GROUND - 150 + 140 * clamp((r - 0.15) / 0.5) ** 2
    if show_net:
        net_side(d, gx, gy, 300, 175, bulge, GROUND - 150)
    ball(d, bx, by, 22, r * 12)
    return fx


def sc_hook(img, d, lt, S):
    b = S["beat"]  # momento del gol (red)
    r = min(lt - b, 0.12)
    fx = {}
    final_core(img, d, r)
    score = (6, 1) if lt >= b else (5, 1)
    SB(*score, "90+5'")
    if lt >= b:
        fx["flash"] = clamp(1 - (lt - b) / 0.25)
        k = clamp(1 - (lt - b) / 0.5)
        fx["shake"] = (math.sin(lt * 90) * 26 * k, math.cos(lt * 77) * 20 * k)
        fz = clamp((lt - b - 0.2) / 0.4)
        fx["desat"] = 0.85 * fz
        fx["vig"] = fz
        fx["zoom"] = 1 + 0.12 * ease_io((lt - b) / 2.5)
        fx["cx"], fx["cy"] = 760, 1350
    fx["post"] = lambda im: (pop(im, "MINUTO 95", lt, W / 2, 520, 120, t_in=0.05),
                             pop(im, "¡6-1!", lt, W / 2, 690, 230, t_in=b + 0.05),
                             stamp(im, "¿IMPOSIBLE?", lt, W / 2, 1300, S["imp"], 100))
    return fx


def sc_rewind(img, d, lt, S):
    D = S["dur"]
    r = lerp(0.6, -2.4, lt / D)
    final_core(img, d, r)
    SB(random.Random(int(lt * 20)).randint(0, 6), 1, "◀◀")
    fx = {"vhs": 1.0, "desat": 0.3}
    fx["post"] = lambda im: pop(im, "◀◀ REBOBINANDO", lt, W / 2, 600, 92, fill=(255, 255, 255))
    return fx


def sc_ida(img, d, lt, S):
    D = S["dur"]
    # PSG celebrando al fondo, Barca triste delante
    for i, x in enumerate((260, 520, 780)):
        chibi(d, x, 1360, 1.0, PSG, "celebrate", lt + i * 0.37, 1 if i < 1 else -1, num=str(7 + i))
    for i, x in enumerate((200, 540, 880)):
        chibi(d, x, 1700, 1.6, BAR, "sad", lt, -1 if i == 2 else 1, num=["10", "9", "11"][i], mouth="sad")
    fx = {"desat": 0.75, "zoom": 1 + 0.06 * lt / D, "cy": 1300}

    def post(im):
        dd = ImageDraw.Draw(im)
        u = ease_out_back((lt - 0.1) / 0.3)
        if lt > 0.1:
            box = Image.new("RGBA", (760, 260), (0, 0, 0, 0))
            bd = ImageDraw.Draw(box)
            bd.rounded_rectangle([0, 0, 760, 260], radius=26, fill=(16, 16, 22, 235), outline=(255, 255, 255), width=4)
            bd.text((380, 58), "IDA · PARÍS", font=font(50), fill=(200, 200, 210), anchor="mm")
            bd.text((380, 168), "PSG 4 - 0 BAR", font=font(104), fill=(255, 80, 80), anchor="mm")
            paste_scaled(im, box, W / 2, 420, u)
        stamp(im, "NUNCA VISTO", lt, W / 2, 700, S["imp"], 104, rot=8)
    fx["post"] = post
    return fx


def sc_date(img, d, lt, S):
    D = S["dur"]
    for i in range(5):
        x = lerp(-60, 1000, clamp(lt / D * 0.9)) - i * 190
        chibi(d, x, 1640 + (i % 2) * 50, 1.6, BAR, "walk", lt + i * 0.2, 1, num=["1", "3", "5", "9", "10"][i] if i else "1")
    chibi(d, 860, 1420, 1.0, REF, "idle", lt, -1)
    # flashes de fotos
    rr = random.Random(int(lt * 12))
    for _ in range(9):
        x, y = rr.uniform(0, W), rr.uniform(300, 780)
        d.ellipse([x - 7, y - 7, x + 7, y + 7], fill=(255, 255, 255))
    fx = {"zoom": 1.08 - 0.08 * ease_io(lt / D), "cy": 900}
    fx["post"] = lambda im: (pop(im, "8 MARZO 2017", lt, W / 2, 450, 120, t_in=0.05),
                             pop(im, "CAMP NOU", lt, W / 2, 610, 150, fill=(255, 255, 255), t_in=S["t2"]))
    return fx


def goal_fx(fx, lt, b, amp=28):
    if lt >= b:
        fx["flash"] = clamp(1 - (lt - b) / 0.22)
        k = clamp(1 - (lt - b) / 0.55)
        fx["shake"] = (math.sin(lt * 95) * amp * k, math.cos(lt * 71) * amp * 0.8 * k)


def sc_suarez(img, d, lt, S):
    b = S["beat"]; r = lt - b
    hit = -0.32
    net_side(d, GX, GROUND, 300, 175, math.exp(-((r - 0.12) / 0.18) ** 2) if r > -0.02 else 0, GROUND - 170)
    lift = 60 * math.sin(math.pi * clamp((r + 0.6) / 0.6)) if -0.6 < r < 0 else 0
    sx = path(r, [(-2.0, 380), (-0.5, 650), (0.3, 660), (2.0, 300)])
    pose = "run" if r < -0.6 else ("jump" if r < 0.05 else "celebrate")
    chibi(d, 820, GROUND - 30, 1.25, PSG, "run" if r < 0 else "sad", lt, -1, num="2")
    chibi(d, path(r, [(-0.3, 870), (0.2, 850)]), GROUND - 10, 1.3, TRAPP, "dive" if r > -0.1 else "idle", lt, -1, lift=clamp((r + 0.1) / 0.3) * 50, num="1")
    chibi(d, sx, GROUND + 40, 1.5, SUAREZ, pose, lt, 1 if r < 0.3 else -1, num="9", lift=lift, tilt=0.4 if -0.4 < r < 0 else 0)
    if r < hit:
        bx, by = arc(r, hit - 1.0, hit, (-40, 1250), (sx + 20, GROUND - 260 - lift * 1.5), 260)
    elif r < 0:
        bx, by = arc(r, hit, 0, (sx + 20, GROUND - 260 - lift * 1.5), (GX + 25, GROUND - 170), 30)
    else:
        bx, by = GX + 25 + 55 * clamp(r / 0.15), GROUND - 170 + 150 * clamp((r - 0.15) / 0.5) ** 2
    ball(d, bx, by, 22, lt * 10)
    SB(1 if r >= 0 else 0, 0, "3'")
    fx = {}
    goal_fx(fx, lt, b)
    fx["post"] = lambda im: (pop(im, "¡DE CABEZA!", lt, W / 2, 520, 120, t_in=b - 0.35, t_out=b + 0.1),
                             pop(im, "¡1-0!", lt, W / 2, 600, 220, t_in=b + 0.1))
    return fx


def sc_kurzawa(img, d, lt, S):
    b = S["beat"]; r = lt - b
    net_side(d, GX, GROUND, 300, 175, math.exp(-((r - 0.12) / 0.18) ** 2) if r > -0.02 else 0, GROUND - 60)
    # pase raso de Barca
    chibi(d, path(r, [(-2, 120), (-1.0, 230)]), GROUND + 60, 1.35, BAR, "kick" if -1.15 < r < -0.8 else "run", lt, 1, num="8")
    kx = path(r, [(-2, 520), (-0.35, 690)])
    chibi(d, kx, GROUND + 10, 1.45, PSG, "slide" if r > -0.35 else "run", lt, 1, num="20", mouth="o")
    chibi(d, path(r, [(-0.2, 880), (0.2, 900)]), GROUND - 20, 1.3, TRAPP, "dive" if r > -0.15 else "idle", lt, -1, lift=10, num="1")
    chibi(d, path(r, [(-2, 330), (0.0, 600), (1.5, 420)]), GROUND - 70, 1.15, SUAREZ, "run" if r < 0 else "celebrate", lt, 1, num="9")
    if r < -0.9:
        bx, by = 280, GROUND + 50
    elif r < -0.3:
        bx, by = arc(r, -0.9, -0.3, (280, GROUND + 50), (kx + 40, GROUND), 10)
    elif r < 0:
        bx, by = arc(r, -0.3, 0, (kx + 40, GROUND), (GX + 25, GROUND - 60), 40)
    else:
        bx, by = GX + 25 + 55 * clamp(r / 0.15), GROUND - 60
    ball(d, bx, by, 22, lt * 10)
    SB(2 if r >= 0 else 1, 0, "40'")
    fx = {}
    goal_fx(fx, lt, b)
    fx["post"] = lambda im: (stamp(im, "EN PROPIA", lt, W / 2, 560, b + 0.15, 120, -10),
                             pop(im, "¡2-0!", lt, W / 2, 380, 170, t_in=S["t2"]))
    return fx


def penalty(img, d, lt, b, taker_kit, num, keeper_kit, dive_dir, shot_to):
    r = lt - b
    tk = (GL + GR) / 2
    bulge = math.exp(-((r - 0.08) / 0.15) ** 2) if r > -0.02 else 0
    tx, ty = shot_to
    net_front(d, bulge, tx, ty)
    # portero
    if r < -0.2:
        kx, ky, pose, lift = tk + 20 * math.sin(lt * 5), GB, "idle", 0
    else:
        u = clamp((r + 0.2) / 0.35)
        kx, ky, pose, lift = tk + dive_dir * 230 * ease_io(u), GB, "dive", 60 * math.sin(math.pi * min(u, 1) * 0.8)
    chibi(d, kx, ky, 1.25, keeper_kit, pose, lt, 1, num="1", lift=lift, tilt=dive_dir * 0.6 if pose == "dive" else 0)
    # balon
    shot = b - 0.35
    if lt < shot:
        bx, by, br = 540, 1760, 30
    elif r < 0:
        u = clamp((lt - shot) / 0.35)
        bx, by, br = lerp(540, tx, u), lerp(1760, ty, u) - 80 * 4 * u * (1 - u), lerp(30, 18, u)
    else:
        bx, by, br = tx, ty + 120 * clamp((r - 0.1) / 0.5) ** 2, 18
    # cobrador de espaldas
    run = clamp((lt - (shot - 0.8)) / 0.8)
    cxp = lerp(380, 500, run)
    pose = "idle" if lt < shot - 0.8 else ("run" if lt < shot else ("kick" if r < 0.3 else "celebrate"))
    if lt < shot or r < 0.3:
        ball(d, bx, by, br, lt * 9 if lt > shot else 0)
        chibi(d, cxp, 1900, 2.3, taker_kit, pose, lt, 1, num=num, back=True)
    else:
        chibi(d, cxp, 1900, 2.3, taker_kit, pose, lt, 1, num=num, back=True)
        ball(d, bx, by, br, lt * 9)


def sc_messi(img, d, lt, S):
    b = S["beat"]
    penalty(img, d, lt, b, MESSI, "10", TRAPP, -1, (735, 1250))
    SB(3 if lt >= b else 2, 0, "50'")
    fx = {}
    goal_fx(fx, lt, b)
    fx["post"] = lambda im: (pop(im, "PENALTI", lt, W / 2, 480, 110, fill=(255, 255, 255), t_in=0.05, t_out=b),
                             pop(im, "¡3-0!", lt, W / 2, 470, 220, t_in=b + 0.08))
    return fx


def sc_cavani(img, d, lt, S):
    b = S["beat"]; r = lt - b
    net_side(d, GX, GROUND, 300, 175, math.exp(-((r - 0.1) / 0.18) ** 2) if r > -0.02 else 0, GROUND - 255)
    cx = path(r, [(-2, 420), (-0.4, 620)])
    chibi(d, path(r, [(-2, 640), (-0.2, 760)]), GROUND - 50, 1.25, BAR, "run" if r < 0 else "sad", lt, -1, num="3")
    chibi(d, cx, GROUND + 40, 1.55, CAVANI, "kick" if -0.5 < r < -0.1 else ("run" if r < 0 else "celebrate"), lt, 1, num="9")
    chibi(d, path(r, [(-0.25, 870), (0.1, 845)]), GROUND - 10, 1.3, TER, "dive" if r > -0.2 else "idle", lt, -1, lift=clamp((r + 0.2) / 0.3) * 80, num="1")
    if r < -0.35:
        bx, by = arc(r, -1.3, -0.35, (200, 1150), (cx + 40, GROUND), 200)
    elif r < 0:
        bx, by = arc(r, -0.35, 0, (cx + 40, GROUND), (GX + 25, GROUND - 255), 40)
    else:
        bx, by = GX + 25 + 55 * clamp(r / 0.15), GROUND - 255 + 230 * clamp((r - 0.15) / 0.6) ** 2
    ball(d, bx, by, 22, lt * 10)
    SB(3, 1 if r >= 0 else 0, "62'")
    fx = {}
    if r >= 0:
        fx["shake"] = (math.sin(lt * 60) * 10 * clamp(1 - r / 0.4), 0)
        dz = clamp((r - 0.3) / 1.0)
        fx["desat"] = 0.85 * dz
        fx["zoom"] = 1 + 0.18 * ease_io((r - 0.3) / (S["dur"] - b))
        fx["cx"], fx["cy"] = 540, 1250
    fx["post"] = lambda im: (pop(im, "3-1", lt, W / 2, 470, 200, fill=(255, 90, 90), t_in=b + 0.1, t_out=S["t2"]),
                             pop(im, "FALTAN\n3 GOLES", lt, W / 2, 520, 140, t_in=S["t2"]))
    return fx


def sc_neyfk(img, d, lt, S):
    b = S["beat"]; r = lt - b
    net_side(d, GX, GROUND, 300, 175, math.exp(-((r - 0.1) / 0.18) ** 2) if r > -0.02 else 0, GROUND - 255)
    shot = -0.75
    for i in range(3):
        chibi(d, 610 + i * 22, GROUND - 10 + i * 18, 1.3, PSG, "jump" if -0.6 < r < -0.2 else "idle", lt, -1, num=str(4 + i), lift=40)
    nx = path(r, [(shot - 0.9, 160), (shot, 290)])
    chibi(d, nx, GROUND + 60, 1.5, NEY, "idle" if r < shot - 0.9 else ("run" if r < shot else ("kick" if r < shot + 0.35 else "celebrate")), lt, 1, num="11")
    chibi(d, path(r, [(-0.3, 865), (0.1, 860)]), GROUND - 10, 1.3, TRAPP, "dive" if r > -0.25 else "idle", lt, -1, lift=clamp((r + 0.25) / 0.3) * 90, num="1")
    if r < shot:
        bx, by = 330, GROUND + 50
    elif r < 0:
        bx, by = arc(r, shot, 0, (330, GROUND + 50), (GX + 25, GROUND - 260), 330)
    else:
        bx, by = GX + 25 + 55 * clamp(r / 0.15), GROUND - 260 + 240 * clamp((r - 0.15) / 0.6) ** 2
    ball(d, bx, by, 22, lt * 12)
    SB(4 if r >= 0 else 3, 1, "88'")
    fx = {}
    goal_fx(fx, lt, b)
    if r < 0:
        fx["zoom"] = 1 + 0.05 * clamp(lt / b)
    fx["post"] = lambda im: (pop(im, "MIN 88", lt, W / 2, 480, 120, fill=(255, 255, 255), t_in=0.05, t_out=b),
                             pop(im, "¡GOLAZO!", lt, W / 2, 440, 150, t_in=b + 0.05),
                             pop(im, "¡4-1!", lt, W / 2, 620, 200, t_in=b + 0.4))
    return fx


def sc_neypen(img, d, lt, S):
    b = S["beat"]
    penalty(img, d, lt, b, NEY, "11", TRAPP, 1, (330, 1300))
    SB(5 if lt >= b else 4, 1, "90+1'")
    fx = {}
    goal_fx(fx, lt, b)
    fx["post"] = lambda im: (pop(im, "90+1'", lt, W / 2, 480, 130, fill=(255, 255, 255), t_in=0.05, t_out=b),
                             pop(im, "¡5-1!", lt, W / 2, 440, 200, t_in=b + 0.08),
                             pop(im, "GLOBAL 5-5", lt, W / 2, 640, 90, fill=(255, 255, 255), t_in=b + 0.5))
    return fx


def sc_final(img, d, lt, S):
    b = S["beat"]; r = lt - b
    final_core(img, d, r)
    SB(6 if r >= 0 else 5, 1, "90+5'")
    fx = {}
    if r < -1.7:
        u = clamp(lt / (b - 1.7))
        fx["desat"] = 0.55 * u
        fx["zoom"] = 1 + 0.10 * ease_io(u)
        fx["cx"], fx["cy"] = 400, 1380
    elif r < 0:
        fx["desat"] = 0.55 * clamp(-r / 1.7)
        fx["zoom"] = 1 + 0.10 * clamp(-r / 1.7)
        fx["cx"], fx["cy"] = 400, 1380
    goal_fx(fx, lt, b, 34)
    fx["confetti"] = r
    fx["jump"] = r >= 0
    fx["post"] = lambda im: (pop(im, "QUEDAN\nSEGUNDOS", lt, W / 2, 500, 120, fill=(255, 255, 255), t_in=0.05, t_out=b - 1.75),
                             pop(im, "¡6-1!", lt, W / 2, 470, 240, t_in=b + 0.05),
                             pop(im, "LA REMONTADA", lt, W / 2, 720, 120, t_in=S["t2"]))
    return fx


def sc_outro(img, d, lt, S):
    xs = [150, 330, 540, 750, 930]
    nums = ["20", "11", "10", "9", "1"]
    kits = [SERGI, NEY, MESSI, SUAREZ, TER]
    for i, x in enumerate(xs):
        chibi(d, x, 1640 + (i % 2) * 50, 1.45, kits[i], "celebrate", lt + i * 0.21, 1 if x < 540 else -1, num=nums[i])
    for i, x in enumerate((240, 840)):
        chibi(d, x, 1290, 0.95, PSG, "sad", lt, 1, num=str(7 + i))
    SB(6, 1, "FINAL")
    fx = {"confetti": lt + 3, "jump": True}
    fx["post"] = lambda im: (pop(im, "GLOBAL 6-5", lt, W / 2, 400, 110, fill=(255, 255, 255), t_in=0.05),
                             pop(im, "¿DÓNDE\nESTABAS TÚ?", lt, W / 2, 700, 130, t_in=S["t2"]))
    return fx


SCENES = {"hook": sc_hook, "rewind": sc_rewind, "ida": sc_ida, "date": sc_date, "suarez": sc_suarez,
          "kurzawa": sc_kurzawa, "messi": sc_messi, "cavani": sc_cavani, "neyfk": sc_neyfk,
          "neypen": sc_neypen, "final": sc_final, "outro": sc_outro}

# --------------------------------------------------------- timeline -------
DEFAULT_TL = {
    "scenes": [
        {"id": "hook", "start": 0.0, "beat": 1.25, "imp": 3.0},
        {"id": "rewind", "start": 4.4},
        {"id": "ida", "start": 6.0, "imp": 2.6},
        {"id": "date", "start": 11.6, "t2": 1.3},
        {"id": "suarez", "start": 14.4, "beat": 2.0},
        {"id": "kurzawa", "start": 17.8, "beat": 2.6, "t2": 2.9},
        {"id": "messi", "start": 21.4, "beat": 1.9},
        {"id": "cavani", "start": 24.4, "beat": 1.6, "t2": 3.2},
        {"id": "neyfk", "start": 29.6, "beat": 2.2},
        {"id": "neypen", "start": 33.0, "beat": 2.6},
        {"id": "final", "start": 37.0, "beat": 3.4, "t2": 4.6},
        {"id": "outro", "start": 44.6, "t2": 1.0},
    ],
    "end": 50.0,
    "subs": [
        [0.05, 1.2, "¡Minuto noventa y cinco!"],
        [1.2, 2.6, "¡Sergi Roberto! ¡Seis a uno!"],
        [2.7, 4.3, "Pero esto era imposible."],
        [4.4, 6.0, "Rebobinemos."],
        [6.0, 8.3, "Ida en París: PSG 4, Barça 0."],
        [8.3, 11.5, "Nadie había remontado algo así en la Champions."],
        [11.6, 14.3, "8 de marzo de 2017. Camp Nou."],
        [14.4, 17.7, "Minuto 3: Suárez, de cabeza. ¡Uno a cero!"],
        [17.8, 21.3, "Kurzawa la mete en su propia portería. ¡Dos a cero!"],
        [21.4, 24.3, "Penalti. Messi no perdona. ¡Tres a cero!"],
        [24.4, 27.0, "Y entonces... Cavani. Tres a uno."],
        [27.0, 29.5, "Ahora el Barça necesita tres goles más."],
        [29.6, 32.9, "Minuto 88. Falta para Neymar... ¡golazo!"],
        [33.0, 36.9, "Penalti a Suárez. Neymar, sin temblar. ¡Cinco a uno!"],
        [37.0, 40.3, "Quedan segundos. Neymar la levanta al área..."],
        [40.3, 44.5, "¡Sergi Roberto! ¡Seis a uno! ¡La remontada!"],
        [45.4, 49.6, "¿Dónde estabas tú esa noche?"],
    ],
}


def load_tl(p):
    tl = json.load(open(p)) if p else DEFAULT_TL
    sc = tl["scenes"]
    for i, s in enumerate(sc):
        s["end"] = sc[i + 1]["start"] if i + 1 < len(sc) else tl["end"]
        s["dur"] = s["end"] - s["start"]
    return tl


def scene_at(tl, t):
    for s in tl["scenes"]:
        if s["start"] <= t < s["end"]:
            return s
    return tl["scenes"][-1]


SIDE = {"hook", "rewind", "suarez", "kurzawa", "cavani", "neyfk", "final"}


def render_frame(tl, t, rain_clock):
    S = scene_at(tl, t)
    lt = t - S["start"]
    bg, bgj = bgs()
    jumping = False
    img = bg.copy()
    d = ImageDraw.Draw(img, "RGBA")
    _SB[0] = None
    fx = SCENES[S["id"]](img, d, lt, S) or {}
    if fx.get("jump"):
        # gradas saltando (alternar fondo) -> se redibuja debajo
        if int(t * 8) % 2 == 0:
            img2 = bgj.copy()
            d2 = ImageDraw.Draw(img2, "RGBA")
            # hay que volver a dibujar la escena encima del otro fondo
            fx = SCENES[S["id"]](img2, d2, lt, S) or {}
            img = img2
    slow = 0.3 if fx.get("vig") else 1.0
    rain(img, rain_clock, 80 if S["id"] != "ida" else 120, slow)
    if "confetti" in fx:
        confetti(img, fx["confetti"])
    # efectos de grading
    if fx.get("desat"):
        img = desat(img, fx["desat"])
    if fx.get("vig"):
        v = red_vignette()
        if fx["vig"] < 1:
            v = v.copy(); v.putalpha(v.getchannel("A").point(lambda a: int(a * fx["vig"])))
        img.alpha_composite(v)
    sx, sy = fx.get("shake", (0, 0))
    z, cx, cy = fx.get("zoom", 1.0), fx.get("cx", W / 2), fx.get("cy", H / 2)
    if S["id"] in SIDE:
        # encuadre base mas cerrado (1.22 sobre 620,900) dentro del encuadre de la escena
        zz = max(z, 1.0)
        w1, h1 = W / zz, H / zz
        l1 = clamp(cx - w1 / 2, 0, W - w1); t1 = clamp(cy - h1 / 2, 0, H - h1)
        cx, cy = l1 + 620 / W * w1, t1 + 900 / H * h1
        z = zz * 1.22
    img = camera(img, z, cx, cy, sx, sy)
    if _SB[0]:
        scoreboard(img, *_SB[0])
    # graficos que no se mueven con la camara
    if "post" in fx:
        fx["post"](img)
    for a, b, txt in tl["subs"]:
        if a <= t < b:
            subtitle(img, txt, t - a, 790 if S["id"] in ("messi", "neypen") else 1030)
    if fx.get("vhs"):
        img = vhs(img, fx["vhs"], t)
    if fx.get("flash"):
        img = flash(img, fx["flash"])
    # cierre de loop: fundir con el primer fotograma
    end = tl["end"]
    if t > end - 0.5:
        first = FIRST_FRAME[0]
        if first is not None:
            img = Image.blend(img, first, clamp((t - (end - 0.5)) / 0.5))
    return img.convert("RGB")


FIRST_FRAME = [None]


def rain_clocks(tl, n):
    clocks, c = [], 0.0
    for i in range(n):
        t = i / FPS
        S = scene_at(tl, t)
        lt = t - S["start"]
        sp = 1.0
        if S["id"] == "hook" and lt > S["beat"]:
            sp = 0.25
        if S["id"] == "final" and -1.7 < lt - S["beat"] < 0.4:
            sp = 0.4
        clocks.append(c)
        c += sp / FPS
    return clocks


# ---------------------------------------------------------------- audio ---
SR = 48000


def env(n, a, r):
    e = np.ones(n)
    ai, ri = int(a * SR), int(r * SR)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if ri: e[-ri:] *= np.linspace(1, 0, ri)
    return e


def lowpass(x, alpha):
    y = np.empty_like(x); acc = 0.0
    # vectorizado aproximado: filtro IIR via cumsum no trivial -> usar convolucion exponencial
    k = int(4 / alpha) if alpha > 0 else 1
    ker = alpha * (1 - alpha) ** np.arange(k)
    return np.convolve(x, ker, mode="same")


def build_sfx(tl, dur):
    n = int(dur * SR)
    rng = np.random.default_rng(3)
    out = np.zeros(n)

    def add(sig, t, g=1.0):
        i = int(t * SR)
        if i >= n: return
        j = min(n, i + len(sig))
        out[i:j] += sig[: j - i] * g

    noise = rng.standard_normal(n)
    # lluvia: ruido paso alto
    rainn = noise - lowpass(noise, 0.15)
    out += rainn * 0.05
    # murmullo de estadio: ruido grave modulado
    mur = lowpass(rng.standard_normal(n), 0.01) * 6
    mod = 0.6 + 0.4 * np.sin(np.arange(n) / SR * 0.7)
    crowd_gain = np.full(n, 0.10)
    sc = {s["id"]: s for s in tl["scenes"]}
    f = sc["final"]
    a, b = int((f["start"] + 0.5) * SR), int((f["start"] + f["beat"] - 0.1) * SR)
    crowd_gain[a:b] = np.linspace(0.10, 0.015, b - a)
    ida = sc["ida"]
    crowd_gain[int(ida["start"] * SR):int(ida["end"] * SR)] = 0.04
    out += mur * mod * crowd_gain

    def roar(L=3.0):
        m = int(L * SR)
        x = lowpass(rng.standard_normal(m), 0.04) * 5 + lowpass(rng.standard_normal(m), 0.2) * 0.6
        e = np.minimum(1, np.arange(m) / (0.12 * SR)) * np.exp(-np.arange(m) / (1.4 * SR))
        return x * e

    def kick():
        m = int(0.12 * SR); tt = np.arange(m) / SR
        return np.sin(2 * np.pi * (120 - 400 * tt) * tt) * np.exp(-tt * 40) + rng.standard_normal(m) * np.exp(-tt * 90) * 0.4

    def netw():
        m = int(0.4 * SR); x = rng.standard_normal(m)
        x = x - lowpass(x, 0.3)
        return x * np.exp(-np.arange(m) / (0.1 * SR)) * 0.7

    def whoosh(L=0.35):
        m = int(L * SR); x = rng.standard_normal(m)
        e = np.sin(np.pi * np.arange(m) / m) ** 2
        return lowpass(x, 0.08) * e * 2.5

    def whistle(L=0.6):
        m = int(L * SR); tt = np.arange(m) / SR
        fr = 2900 + 60 * np.sin(2 * np.pi * 28 * tt)
        return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(m, 0.02, 0.08) * 0.35

    def heartbeat():
        m = int(0.5 * SR); tt = np.arange(m) / SR
        s = np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 18)
        s2 = np.roll(s, int(0.18 * SR)) * 0.7
        return (s + s2) * 1.4

    def rewind_tone(L):
        m = int(L * SR); tt = np.arange(m) / SR
        fr = np.linspace(1400, 200, m)
        return np.sign(np.sin(2 * np.pi * np.cumsum(fr) / SR)) * 0.08 * env(m, 0.02, 0.1)

    for s in tl["scenes"][1:]:
        add(whoosh(), s["start"] - 0.17, 0.9)
    for sid, kt in (("hook", -0.15), ("suarez", -0.32), ("kurzawa", -0.3), ("cavani", -0.35), ("final", -0.15)):
        s = sc[sid]; add(kick(), s["start"] + s["beat"] + kt, 1.0)
    add(kick(), sc["final"]["start"] + sc["final"]["beat"] - 1.7, 0.9)
    add(kick(), sc["kurzawa"]["start"] + sc["kurzawa"]["beat"] - 0.9, 0.8)
    add(kick(), sc["neyfk"]["start"] + sc["neyfk"]["beat"] - 0.75, 1.0)
    for sid in ("messi", "neypen"):
        s = sc[sid]
        add(whistle(0.35), s["start"] + max(0.2, s["beat"] - 1.6), 0.8)
        add(kick(), s["start"] + s["beat"] - 0.35, 1.0)
    for sid in ("hook", "suarez", "kurzawa", "messi", "cavani", "neyfk", "neypen", "final"):
        s = sc[sid]; tb = s["start"] + s["beat"]
        add(netw(), tb, 1.0)
        add(roar(3.0 if sid != "cavani" else 1.5), tb + 0.02, 0.9 if sid != "cavani" else 0.35)
    add(roar(5.0), sc["final"]["start"] + sc["final"]["beat"] + 0.02, 0.6)
    add(roar(4.0), sc["outro"]["start"], 0.5)
    add(whistle(0.5), sc["date"]["start"] + sc["date"]["dur"] - 0.7, 1.0)
    add(whistle(0.3), sc["outro"]["start"] + 0.2, 0.8)
    add(whistle(0.3), sc["outro"]["start"] + 0.55, 0.8)
    add(whistle(0.9), sc["outro"]["start"] + 0.9, 0.8)
    rw = sc["rewind"]; add(rewind_tone(rw["dur"]), rw["start"], 1.0)
    # latidos: tension tras Cavani y antes del ultimo gol
    c = sc["cavani"]
    t = c["start"] + c["beat"] + 0.8
    while t < c["end"] - 0.2:
        add(heartbeat(), t, 0.9); t += 0.75
    t = f["start"] + 0.3
    while t < f["start"] + f["beat"] - 0.3:
        add(heartbeat(), t, 1.0); t += 0.6
    out = out / (np.max(np.abs(out)) + 1e-9) * 0.9
    return out


def write_wav(p, x):
    x16 = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    st = np.stack([x16, x16], 1)
    with wave.open(p, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(st.tobytes())


# ----------------------------------------------------------------- main ---
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sheet", action="store_true")
    ap.add_argument("--render", action="store_true")
    ap.add_argument("--voice")
    ap.add_argument("--timeline")
    ap.add_argument("--times", default="")
    ap.add_argument("--out", default=os.path.join(OUT, "remontada_2017.mp4"))
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    tl = load_tl(a.timeline)
    dur = tl["end"]
    n = int(dur * FPS)
    clocks = rain_clocks(tl, n + 1)
    FIRST_FRAME[0] = None
    FIRST_FRAME[0] = render_frame(tl, 0.0, 0.0).convert("RGBA")

    if a.sheet:
        times = [float(x) for x in a.times.split(",")] if a.times else [s["start"] + min(s.get("beat", s["dur"] / 2) + 0.15, s["dur"] - 0.1) for s in tl["scenes"]]
        cols = 4
        tw, th = 270, 480
        rows = math.ceil(len(times) / cols)
        sheet = Image.new("RGB", (cols * tw, rows * th), (0, 0, 0))
        for i, t in enumerate(times):
            fr = render_frame(tl, t, clocks[min(int(t * FPS), n)])
            sheet.paste(fr.resize((tw, th)), ((i % cols) * tw, (i // cols) * th))
            ImageDraw.Draw(sheet).text(((i % cols) * tw + 6, (i // cols) * th + 4), f"{t:.2f}", fill=(255, 255, 0))
        p = os.path.join(OUT, "sheet.png")
        sheet.save(p)
        print(p)
        return

    if a.render:
        sfx = build_sfx(tl, dur + 0.5)
        sp = os.path.join(OUT, "sfx.wav")
        write_wav(sp, sfx)
        silent = os.path.join(OUT, "video_mudo.mp4")
        proc = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                                 "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast",
                                 "-crf", "20", "-pix_fmt", "yuv420p", silent], stdin=subprocess.PIPE)
        for i in range(n):
            t = i / FPS
            proc.stdin.write(render_frame(tl, t, clocks[i]).tobytes())
            if i % 120 == 0:
                print(f"frame {i}/{n}", flush=True)
        proc.stdin.close(); proc.wait()
        if a.voice:
            fc = ("[1:a]volume=0.55[s];[2:a]asplit=2[v][vk];[s][vk]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[sd];"
                  "[sd][v]amix=inputs=2:normalize=0:duration=longest,loudnorm=I=-14:TP=-1.5[a]")
            cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", silent, "-i", sp, "-i", a.voice, "-filter_complex", fc,
                   "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", a.out]
        else:
            cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", silent, "-i", sp, "-filter_complex",
                   "[1:a]volume=0.8,loudnorm=I=-14:TP=-1.5[a]", "-map", "0:v", "-map", "[a]", "-c:v", "copy",
                   "-c:a", "aac", "-b:a", "192k", "-shortest", a.out]
        subprocess.run(cmd, check=True)
        print(a.out)


if __name__ == "__main__":
    main()
