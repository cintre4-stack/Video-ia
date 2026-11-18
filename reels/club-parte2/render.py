"""Reel "Mi nuevo club" — Parte 2, drawn from scratch (no Part 1 footage).

    python3 render.py <voice dir with timeline.json + voice.wav> <out.mp4> --fonts <dir with LilitaOne.ttf> [--preview]

Everything is drawn with PIL at 2x and downscaled. The coach's mouth follows the
voice loudness, so any new voice file (e.g. ElevenLabs) syncs automatically.
"""

import json
import math
import subprocess
import sys
from multiprocessing import Pool
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

VODIR, OUT = Path(sys.argv[1]), sys.argv[2]
PREVIEW = "--preview" in sys.argv
FONTDIR = Path(sys.argv[sys.argv.index("--fonts") + 1]) if "--fonts" in sys.argv else Path("fonts")
W, H, FPS, K = 1080, 1920, 30, 2  # K = supersampling
TL = json.loads((VODIR / "timeline.json").read_text())
LINES, TOTAL = TL["tl"], TL["total"]

YEL = (255, 214, 64)
RED = (226, 50, 52)
NAVY = (30, 38, 70)
DARK = (22, 20, 28)
GREEN = (46, 190, 90)
WHITE = (255, 255, 255)
SKIN = (240, 200, 160)
SKIN_D = (214, 166, 126)

_fonts = {}


def F(size):
    size = int(size * K)
    if size not in _fonts:
        _fonts[size] = ImageFont.truetype(str(FONTDIR / "LilitaOne.ttf"), size)
    return _fonts[size]


# ---------------------------------------------------------------- voice envelope -> mouth
def envelope():
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(VODIR / "voice.wav"), "-ac", "1", "-ar", "24000",
                                   "-f", "f32le", "-"])
    a = np.frombuffer(raw, np.float32)
    hop = 24000 // FPS
    n = len(a) // hop
    rms = np.sqrt((a[: n * hop].reshape(n, hop) ** 2).mean(1))
    rms = rms / (np.percentile(rms, 95) + 1e-6)
    return np.clip(rms, 0, 1)


ENV = envelope()


def mouth_at(t):
    i = int(t * FPS)
    return float(ENV[i]) if 0 <= i < len(ENV) else 0.0


# ---------------------------------------------------------------- easing
def clamp(x):
    return min(max(x, 0.0), 1.0)


def ease_back(x):
    x = clamp(x)
    return 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2


def ease_out(x):
    return 1 - (1 - clamp(x)) ** 3


# ---------------------------------------------------------------- 2x drawing helper
class D:
    """ImageDraw wrapper that takes 1x coordinates and draws on a Kx canvas."""

    def __init__(self, im):
        self.im = im
        self.d = ImageDraw.Draw(im, "RGBA")  # blend semi-transparent fills

    @staticmethod
    def _b(box):
        return [v * K for v in box]

    @staticmethod
    def _w(kw):
        if "width" in kw:
            kw["width"] = int(kw["width"] * K)

    def ellipse(self, box, **kw):
        self._w(kw)
        self.d.ellipse(self._b(box), **kw)

    def rect(self, box, **kw):
        self._w(kw)
        self.d.rectangle(self._b(box), **kw)

    def rrect(self, box, r, **kw):
        self._w(kw)
        self.d.rounded_rectangle(self._b(box), r * K, **kw)

    def poly(self, pts, **kw):
        self._w(kw)
        self.d.polygon([(x * K, y * K) for x, y in pts], **kw)

    def line(self, pts, width, **kw):
        self.d.line([(x * K, y * K) for x, y in pts], width=int(width * K), **kw)

    def cap_line(self, pts, width, fill):
        """Thick line with round ends (limbs)."""
        self.line(pts, width, fill=fill, joint="curve")
        r = width / 2
        for x, y in (pts[0], pts[-1]):
            self.ellipse((x - r, y - r, x + r, y + r), fill=fill)

    def arc(self, box, a0, a1, width, fill):
        self.d.arc(self._b(box), a0, a1, fill=fill, width=int(width * K))

    def text(self, xy, s, size, fill=WHITE, stroke=0, sc=DARK, anchor="mm"):
        self.d.text((xy[0] * K, xy[1] * K), s, font=F(size), fill=fill, stroke_width=int(stroke * K),
                    stroke_fill=sc, anchor=anchor)


def textlen(s, size):
    return F(size).getlength(s) / K


def sprite(w, h):
    im = Image.new("RGBA", (int(w * K), int(h * K)))
    return im, D(im)


def paste(canvas, spr, cx, cy, s=1.0, rot=0.0, alpha=1.0):
    """Paste a sprite centred at (cx, cy) in 1x coords, scaled and rotated."""
    if s <= 0.02 or alpha <= 0.01:
        return
    im = spr
    if abs(s - 1) > 1e-3:
        im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.BILINEAR)
    if rot:
        im = im.rotate(rot, Image.BILINEAR, expand=True)
    if alpha < 1:
        im = im.copy()
        im.putalpha(im.getchannel("A").point(lambda v: int(v * alpha)))
    x, y = int(cx * K - im.width / 2), int(cy * K - im.height / 2)
    canvas.paste(im, (x, y), im)


# ---------------------------------------------------------------- backgrounds (cached)
def gradient(top, bottom, h0, h1, im):
    d = ImageDraw.Draw(im)
    for y in range(int(h0 * K), int(h1 * K)):
        a = (y - h0 * K) / max(1, (h1 - h0) * K)
        d.line([(0, y), (W * K, y)], fill=tuple(int(top[i] * (1 - a) + bottom[i] * a) for i in range(3)))


def pine(d, x, base, h, col=(52, 128, 70), dark=(36, 96, 54)):
    d.rect((x - h * 0.05, base - h * 0.15, x + h * 0.05, base), fill=(110, 70, 40))
    for i in range(3):
        y0 = base - h * 0.15 - i * h * 0.26
        w = h * (0.34 - i * 0.08)
        d.poly([(x - w, y0), (x + w, y0), (x, y0 - h * 0.42)], fill=col if i % 2 == 0 else dark)


def field_stripes(d, top, col1=(78, 170, 70), col2=(66, 152, 60), n=9):
    hh = (H - top) / n
    for i in range(n):
        d.rect((0, top + i * hh, W, top + (i + 1) * hh + 1), fill=col1 if i % 2 == 0 else col2)


def bg_dusk(field="grass"):
    im = Image.new("RGBA", (W * K, H * K))
    gradient((96, 66, 150), (246, 150, 110), 0, 900, im)
    d = D(im)
    rng = np.random.default_rng(1)
    d.ellipse((-300, 760, 700, 1150), fill=(150, 120, 90))
    d.ellipse((400, 720, 1400, 1150), fill=(160, 126, 92))
    for i in range(16):
        pine(d, i * 75 + rng.uniform(-20, 20), 960 + rng.uniform(-10, 20), rng.uniform(170, 260))
    if field == "grass":
        field_stripes(d, 940)
        d.line([(0, 1100), (W, 1100)], 6, fill=(235, 245, 230))
    else:
        d.rect((0, 940, W, H), fill=(196, 128, 74))
        for _ in range(9):
            x, y = rng.uniform(0, W), rng.uniform(1000, 1900)
            d.ellipse((x - 120, y - 30, x + 120, y + 30), fill=(170, 104, 60))
    return im


def tower(d, x, base, on=1.0, h=640):
    d.rect((x - 9, base - h, x + 9, base), fill=(120, 126, 140))
    top = base - h
    d.rrect((x - 70, top - 70, x + 70, top + 20), 10, fill=(70, 76, 90))
    v = int(90 + 165 * on)
    for i in range(3):
        for j in range(2):
            cx, cy = x - 45 + i * 45, top - 45 + j * 40
            d.ellipse((cx - 16, cy - 16, cx + 16, cy + 16), fill=(v, v, int(v * 0.9)))


def bg_night(lit=True):
    im = Image.new("RGBA", (W * K, H * K))
    gradient((10, 14, 40), (40, 52, 110), 0, 950, im)
    d = D(im)
    rng = np.random.default_rng(2)
    for _ in range(70):
        x, y, r = rng.uniform(0, W), rng.uniform(0, 700), rng.uniform(1.5, 3.5)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 230))
    d.ellipse((-300, 800, 700, 1100), fill=(40, 50, 90))
    d.ellipse((400, 760, 1400, 1100), fill=(46, 56, 98))
    for i in range(16):
        pine(d, i * 75 + rng.uniform(-20, 20), 980 + rng.uniform(-10, 20), rng.uniform(170, 250),
             col=(34, 92, 64), dark=(24, 70, 50))
    field_stripes(d, 960, (64, 160, 72), (54, 142, 62))
    if lit:
        glow = Image.new("RGBA", im.size)
        g = D(glow)
        for x in (110, 970):
            g.poly([(x - 30, 380), (x + 30, 380), (540 + (x - 540) * 0.2 + 420, 1500),
                    (540 + (x - 540) * 0.2 - 420, 1500)], fill=(255, 250, 210, 40))
        im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(30 * K)))
        for x in (110, 970):
            tower(d, x, 1000, on=1)
    return im


BG = {}


def bg(name):
    if name not in BG:
        if name == "dusk":
            BG[name] = bg_dusk()
        elif name == "dirt":
            BG[name] = bg_dusk("dirt")
        elif name == "night":
            BG[name] = bg_night(True)
        elif name == "night_dark":
            BG[name] = bg_night(False)
        elif name == "board":
            im = Image.new("RGBA", (W * K, H * K))
            d = D(im)
            field_stripes(d, 0, (70, 166, 74), (60, 150, 64), n=12)
            c = (236, 246, 236)
            d.rect((70, 330, W - 70, 1830), outline=c, width=6)
            d.line([(70, 1080), (W - 70, 1080)], 6, fill=c)
            d.ellipse((400, 940, 680, 1220), outline=c, width=6)
            d.rect((270, 1580, 810, 1830), outline=c, width=6)
            d.rect((270, 330, 810, 580), outline=c, width=6)
            BG[name] = im
    return BG[name].convert("RGB")


def goal_front(d, cx, base, w=760, h=330, shine=0.0):
    x0, x1, y0 = cx - w / 2, cx + w / 2, base - h
    for i in range(21):
        x = x0 + i * w / 20
        d.line([(x, y0), (x, base)], 2, fill=(240, 240, 240))
    for j in range(10):
        y = y0 + j * h / 9
        d.line([(x0, y), (x1, y)], 2, fill=(240, 240, 240))
    d.line([(x0, base), (x0, y0), (x1, y0), (x1, base)], 18, fill=WHITE, joint="curve")
    if 0 < shine < 1:
        x = x0 + (w + 200) * shine - 100
        d.line([(x, y0 - 10), (x - 60, base + 10)], 24, fill=(255, 255, 230))


def ball(d, x, y, r, lt):
    d.ellipse((x - r, y - r, x + r, y + r), fill=WHITE, outline=DARK, width=5)
    a = lt * 4
    for i in range(5):
        px, py = x + r * 0.58 * math.cos(a + i * 1.256), y + r * 0.58 * math.sin(a + i * 1.256)
        d.ellipse((px - r * 0.18, py - r * 0.18, px + r * 0.18, py + r * 0.18), fill=DARK)
    d.ellipse((x - r * 0.22, y - r * 0.22, x + r * 0.22, y + r * 0.22), fill=DARK)


# ---------------------------------------------------------------- the coach
def coach(canvas, cx, cy, s, pose="idle", mouth=0.0, mood="happy", t=0.0):
    """cx, cy = centre of the head; s = scale (head radius = 150*s)."""
    d = D(canvas)
    R = 150 * s
    cy += math.sin(t * 7) * 4 * s
    by = cy + R * 1.05  # body top
    # shadow + legs
    d.ellipse((cx - R * 1.1, by + R * 2.2, cx + R * 1.1, by + R * 2.5), fill=(0, 0, 0, 60))
    for sx in (-1, 1):
        x = cx + sx * R * 0.42
        d.rrect((x - R * 0.26, by + R * 1.3, x + R * 0.26, by + R * 2.2), R * 0.12, fill=NAVY)
        d.ellipse((x - R * 0.34 + sx * 8 * s, by + R * 2.1, x + R * 0.34 + sx * 8 * s, by + R * 2.38), fill=DARK)
    sh = {-1: (cx - R * 0.85, by + R * 0.35), 1: (cx + R * 0.85, by + R * 0.35)}
    wig = math.sin(t * 14) * R * 0.12
    hands = {
        "idle": {-1: (cx - R * 1.15, by + R * 1.2), 1: (cx + R * 1.15, by + R * 1.2)},
        "cheer": {-1: (cx - R * 1.45, cy - R * 0.55 + wig), 1: (cx + R * 1.45, cy - R * 0.55 - wig)},
        "wave": {-1: (cx - R * 1.15, by + R * 1.2), 1: (cx + R * 1.45 + wig, cy - R * 0.35)},
        "open": {-1: (cx - R * 1.6, by + R * 0.75 + wig * 0.5), 1: (cx + R * 1.6, by + R * 0.75 - wig * 0.5)},
        "point": {-1: (cx - R * 1.15, by + R * 1.2), 1: (cx + R * 1.75, by + R * 0.1 + wig * 0.3)},
        "head": {-1: (cx - R * 1.0, cy - R * 0.25), 1: (cx + R * 1.0, cy - R * 0.25)},
    }[pose]
    arm_w = R * 0.34
    up = {sx for sx in (-1, 1) if hands[sx][1] < by}  # raised arms are drawn behind the head

    def arm(sx):
        (x0, y0), (x1, y1) = sh[sx], hands[sx]
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        ln = math.hypot(x1 - x0, y1 - y0) or 1
        nx, ny = -(y1 - y0) / ln, (x1 - x0) / ln
        if nx * sx < 0:
            nx, ny = -nx, -ny
        bend = R * 0.3
        d.cap_line([(x0, y0), (mx + nx * bend, my + ny * bend), (x1, y1)], arm_w, RED)

    for sx in up:
        arm(sx)
    # body
    d.ellipse((cx - R * 1.05, by - R * 0.15, cx + R * 1.05, by + R * 1.75), fill=RED)
    d.ellipse((cx - R * 0.95, by + R * 0.7, cx + R * 0.95, by + R * 1.75), fill=(204, 40, 44))
    d.line([(cx, by + R * 0.05), (cx, by + R * 1.6)], R * 0.05, fill=WHITE)
    for sx in (-1, 1):
        d.line([(cx + sx * R * 0.68, by + R * 0.2), (cx + sx * R * 0.8, by + R * 1.4)], R * 0.06, fill=(240, 240, 240))
    d.ellipse((cx - R * 0.55, by + R * 0.45, cx - R * 0.3, by + R * 0.72), fill=(238, 214, 150))
    d.rrect((cx + R * 0.25, by + R * 0.55, cx + R * 0.5, by + R * 0.65), 3, fill=DARK)
    for sx in (-1, 1):
        if sx not in up:
            arm(sx)
    # head
    d.ellipse((cx - R * 1.08, cy - R * 0.1, cx - R * 0.82, cy + R * 0.3), fill=SKIN_D)
    d.ellipse((cx + R * 0.82, cy - R * 0.1, cx + R * 1.08, cy + R * 0.3), fill=SKIN_D)
    d.ellipse((cx - R, cy - R, cx + R, cy + R), fill=SKIN_D)
    d.ellipse((cx - R * 0.97, cy - R * 0.97, cx + R * 0.9, cy + R * 0.9), fill=SKIN)
    # cap
    d.d.chord(D._b((cx - R * 1.08, cy - R * 1.22, cx + R * 1.08, cy + R * 0.62)), 180, 360, fill=NAVY)
    d.d.chord(D._b((cx - R * 0.9, cy - R * 1.12, cx + R * 0.5, cy + R * 0.3)), 200, 300, fill=(50, 60, 100))
    d.rrect((cx - R * 1.1, cy - R * 0.36, cx + R * 1.1, cy - R * 0.22), R * 0.07, fill=(22, 28, 54))
    d.ellipse((cx - R * 0.13, cy - R * 1.36, cx + R * 0.13, cy - R * 1.1), fill=RED)
    worried = mood == "worried"
    for sx in (-1, 1):  # brows
        x = cx + sx * R * 0.38
        inner, outer = (-R * 0.16, R * 0.02) if worried else (-R * 0.1, -R * 0.04)
        d.cap_line([(x - sx * R * 0.18, cy - R * 0.12 + inner), (x, cy - R * 0.16 + min(inner, outer) - R * 0.03),
                    (x + sx * R * 0.18, cy - R * 0.12 + outer)], R * 0.09, (60, 36, 26))
    for sx in (-1, 1):  # eyes
        x, y = cx + sx * R * 0.38, cy + R * 0.18
        d.ellipse((x - R * 0.21, y - R * 0.24, x + R * 0.21, y + R * 0.24), fill=WHITE)
        d.ellipse((x - R * 0.13, y - R * 0.12, x + R * 0.13, y + R * 0.18), fill=DARK)
        d.ellipse((x - R * 0.02, y - R * 0.06, x + R * 0.06, y + R * 0.02), fill=WHITE)
    d.ellipse((cx - R * 0.17, cy + R * 0.3, cx + R * 0.17, cy + R * 0.58), fill=(232, 156, 120))  # nose
    my = cy + R * 0.72  # mouth
    op = clamp(mouth * 1.3)
    if op > 0.08:
        mh = R * (0.08 + 0.3 * op)
        d.ellipse((cx - R * 0.26, my - mh * 0.3, cx + R * 0.26, my + mh), fill=(110, 26, 30))
        d.ellipse((cx - R * 0.15, my + mh * 0.35, cx + R * 0.15, my + mh * 0.95), fill=(220, 90, 90))
    elif worried:
        d.arc((cx - R * 0.2, my + R * 0.02, cx + R * 0.2, my + R * 0.26), 200, 340, R * 0.06, (110, 26, 30))
    else:
        d.arc((cx - R * 0.24, my - R * 0.2, cx + R * 0.24, my + R * 0.14), 20, 160, R * 0.07, (110, 26, 30))
    for sx in (-1, 1):  # moustache
        ox = sx * R * 0.17
        d.ellipse((cx + ox - R * 0.3, cy + R * 0.5, cx + ox + R * 0.3, cy + R * 0.72), fill=(52, 30, 22))


# ---------------------------------------------------------------- UI sprites
def card_sprite(w, h, fill, border=DARK, radius=28, bw=8):
    spr, d = sprite(w + 24, h + 30)
    d.rrect((12, 22, w + 12, h + 22), radius, fill=(0, 0, 0, 110))
    d.rrect((8, 8, w + 8, h + 8), radius, fill=fill, outline=border, width=bw)
    return spr, d


def check(d, x, y, size):
    d.ellipse((x, y, x + size, y + size), fill=GREEN, outline=DARK, width=max(4, size // 14))
    d.line([(x + size * 0.27, y + size * 0.52), (x + size * 0.44, y + size * 0.69), (x + size * 0.75, y + size * 0.34)],
           size / 8, fill=WHITE, joint="curve")


def heart(d, cx, cy, r, fill=RED):
    d.ellipse((cx - r, cy - r * 0.9, cx, cy + r * 0.1), fill=fill)
    d.ellipse((cx, cy - r * 0.9, cx + r, cy + r * 0.1), fill=fill)
    d.poly([(cx - r * 0.97, cy - 0.25 * r), (cx + r * 0.97, cy - 0.25 * r), (cx, cy + r)], fill=fill)


def bubble(d, x, y, s, fill=(40, 140, 255)):
    d.rrect((x, y, x + s, y + s * 0.72), s * 0.18, fill=fill, outline=DARK, width=3)
    d.poly([(x + s * 0.2, y + s * 0.7), (x + s * 0.42, y + s * 0.7), (x + s * 0.18, y + s * 0.92)], fill=fill)
    for i in range(3):
        cx = x + s * (0.3 + 0.2 * i)
        d.ellipse((cx - s * 0.06, y + s * 0.3, cx + s * 0.06, y + s * 0.42), fill=WHITE)


def money(v):
    return "$" + f"{int(round(v)):,}".replace(",", ".")


GOAL, RAISED = 2400, 900


def meter(canvas, value, alarm=0.0):
    d = D(canvas)
    x0, y0, x1, y1 = 70, 140, 1010, 300
    d.rrect((x0 + 6, y0 + 10, x1 + 6, y1 + 10), 30, fill=(0, 0, 0, 120))
    d.rrect((x0, y0, x1, y1), 30, fill=(20, 24, 40), outline=WHITE, width=7)
    d.text((x0 + 36, y0 + 50), "META DEL CLUB", 46, anchor="lm")
    d.text((x1 - 34, y0 + 50), f"{money(value)} / {money(GOAL)}", 54, fill=YEL, anchor="rm")
    bx0, by0, bx1, by1 = x0 + 34, y0 + 96, x1 - 34, y0 + 134
    d.rrect((bx0, by0, bx1, by1), 19, fill=(52, 58, 82))
    fx = bx0 + (bx1 - bx0) * min(value / GOAL, 1)
    if alarm > 0:
        a = int(120 + 135 * (0.5 + 0.5 * math.sin(alarm * 14)))
        d.rrect((fx - 20, by0, bx1, by1), 19, fill=(232, 58, 64, a))
    if fx > bx0 + 38:
        d.rrect((bx0, by0, fx, by1), 19, fill=(255, 150, 40))
        d.rrect((bx0, by0, fx, by0 + 16), 8, fill=(255, 200, 90))


def title_plate(text, fill=RED, size=80):
    w = textlen(text, size) + 80
    spr, d = sprite(w + 20, size + 70)
    d.rrect((14, 16, w + 14, size + 56), 22, fill=(0, 0, 0, 110))
    d.rrect((6, 6, w + 6, size + 46), 22, fill=fill, outline=WHITE, width=7)
    d.text((w / 2 + 6, size / 2 + 28), text, size, stroke=6)
    return spr


def big_text(text, size, fill=YEL, stroke=14):
    w = textlen(text, size) + stroke * 2 + 20
    spr, d = sprite(w, size * 1.4)
    d.text((w / 2, size * 0.7), text, size, fill=fill, stroke=stroke)
    return spr


def item_card(label):
    spr, d = card_sprite(660, 300, YEL)
    d.text((338, 78), label, 54, fill=DARK)
    check(d, 90, 150, 118)
    d.text((380, 210), "¡LISTO!", 120, stroke=12)
    return spr


def rate_card(kind):
    spr, d = card_sprite(600, 130, WHITE, radius=26)
    if kind == "like":
        heart(d, 80, 72, 34)
        d.text((140, 74), "1 LIKE =", 62, fill=DARK, anchor="lm")
        d.text((420, 74), "$1", 80, fill=GREEN, stroke=4, anchor="lm")
    else:
        bubble(d, 40, 40, 70)
        d.text((130, 74), "1 COMENT. =", 58, fill=DARK, anchor="lm")
        d.text((450, 74), "$10", 80, fill=GREEN, stroke=4, anchor="lm")
    return spr


def comment_card(likes):
    spr, d = card_sprite(940, 220, WHITE, radius=30)
    d.ellipse((40, 60, 150, 170), fill=NAVY, outline=DARK, width=4)
    d.text((95, 115), "XD", 46)
    d.text((180, 70), "@xd12_1 · comentario", 40, fill=(110, 110, 130), anchor="lm")
    d.text((180, 150), "FC Stuat", 90, fill=DARK, anchor="lm")
    heart(d, 860, 90, 32)
    d.text((860, 170), f"{likes:,}".replace(",", "."), 42, fill=RED)
    return spr


def shirt_sprite(num, on, label=None):
    spr, d = sprite(180, 210)
    s, cx, cy = 150, 90, 92
    fill = RED if on else (60, 66, 92)
    pts = [(-0.5, -0.42), (-0.2, -0.5), (-0.1, -0.42), (0.1, -0.42), (0.2, -0.5), (0.5, -0.42), (0.62, -0.12),
           (0.38, -0.02), (0.36, 0.5), (-0.36, 0.5), (-0.38, -0.02), (-0.62, -0.12)]
    d.poly([(cx + x * s, cy + y * s) for x, y in pts], fill=fill, outline=DARK if on else (90, 96, 120), width=5)
    d.text((cx, cy + 12), str(num) if on else "?", 62, fill=WHITE if on else (140, 146, 170), stroke=5 if on else 0)
    if label:
        d.rrect((10, 166, 170, 206), 12, fill=(0, 0, 0, 190))
        d.text((90, 186), label, 30, fill=YEL)
    return spr


def crest(text1, text2, fill):
    spr, d = sprite(400, 500)
    d.poly([(20, 20), (380, 20), (380, 300), (200, 480), (20, 300)], fill=WHITE)
    d.poly([(40, 40), (360, 40), (360, 290), (200, 450), (40, 290)], fill=fill)
    d.text((200, 170), text1, 150, stroke=10)
    d.text((200, 320), text2, 70 if len(text2) > 6 else 96, stroke=8)
    return spr


# ---------------------------------------------------------------- confetti
rng = np.random.default_rng(7)
CONF = rng.random((80, 5))
CCOL = [YEL, RED, (60, 160, 255), GREEN, WHITE]


def confetti(canvas, lt):
    d = D(canvas)
    for i, (a, b, c, e, f) in enumerate(CONF):
        y = lt * (500 + 500 * b) + c * 400 - 460
        if y > H or y < -40:
            continue
        x = a * W + 40 * math.sin(lt * 4 + e * 6)
        r = 9 + 8 * f
        ang = lt * 6 + e * 6
        dx, dy = r * math.cos(ang), r * 0.5 * math.sin(ang) + r * 0.3
        d.poly([(x - dx, y - dy), (x + dx, y - dy * 0.2), (x + dx, y + dy), (x - dx, y + dy * 0.2)], fill=CCOL[i % 5])


# ---------------------------------------------------------------- subtitles (word by word, Part 1 style)
SUBS = {
    "s01": ["¡Lo logramos! ¡Juntamos *$900* para el club!"],
    "s02": ["Ya tenemos *PORTERÍAS* nuevas,"],
    "s03": ["*CANCHA* de verdad,"],
    "s04": ["¡y *LUCES* para jugar de noche!"],
    "s05": ["Pero ojo... todavía nos *FALTAN* *$1.500.*"],
    "s06": ["Así que no paren. Cada *LIKE* es *$1.*", "¡Y cada *COMENTARIO,* *$10!*"],
    "s07": ["Y el nombre del equipo ya está decidido: ¡*FC* *STUAT!*", "Idea de *@xd12_1*"],
    "s08": ["Y lo más importante: los primeros *11* comentarios", "serán el *ONCE* *TITULAR,*"],
    "s09": ["para jugar contra un equipo de *TERCERA* *DIVISIÓN.*", "¡Si ganamos, *SUBIMOS!*"],
    "s10": ["¡*COMENTA* *YA!* Nos vemos en la cancha."],
}
SUBSZ = 64


def sub_chunks():
    out = []
    for k, chunks in SUBS.items():
        a, b = LINES[k]
        total = sum(len(c) for c in chunks)
        t = a
        for c in chunks:
            dur = (b - a) * len(c) / total
            out.append((t, t + dur, c))
            t += dur
    return [(a, out[i + 1][0] if i + 1 < len(out) else TOTAL + 1, c, e) for i, (a, e, c) in enumerate(out)]


CHUNKS = sub_chunks()


def subtitles(canvas, t, y):
    for a, b, text, spoken in CHUNKS:
        if a <= t < b:
            break
    else:
        return
    words = [(w.replace("*", ""), "*" in w) for w in text.split(" ")]
    lines, cur = [], []
    for w in words:
        if cur and textlen(" ".join(x[0] for x in cur + [w]), SUBSZ) > 940:
            lines.append(cur)
            cur = [w]
        else:
            cur.append(w)
    lines.append(cur)
    n = len(words)
    speak_end = a + (spoken - a) * 0.85
    d = D(canvas)
    lh = 82
    top = y - (len(lines) - 1) * lh / 2
    k = 0
    for li, ln in enumerate(lines):
        x = W / 2 - textlen(" ".join(w for w, _ in ln), SUBSZ) / 2
        for w, hl in ln:
            wt = a + (speak_end - a) * k / n
            if t < wt:
                return
            lift = 16 * (1 - ease_out((t - wt) / 0.15))
            d.text((x, top + li * lh + lift), w, SUBSZ, fill=YEL if hl else WHITE, stroke=9, anchor="lm")
            x += textlen(w + " ", SUBSZ)
            k += 1


# ---------------------------------------------------------------- scenes
def L(k):
    return LINES[k][0]


CUTS = [0.0, L("s02") - 0.12, L("s03") - 0.06, L("s04") - 0.06, L("s05") - 0.2, L("s06") - 0.15,
        L("s07") - 0.15, L("s08") - 0.15, L("s09") - 0.05, L("s10") - 0.15, TOTAL]
NAMES = ["hook", "goal", "grass", "lights", "short", "rates", "name", "eleven", "vs", "end"]
SCENES = [(CUTS[i], CUTS[i + 1], n) for i, n in enumerate(NAMES)]
START = {n: CUTS[i] for i, n in enumerate(NAMES)}


def frac(k, f):
    a, b = LINES[k]
    return a + (b - a) * f


def sc_hook(c, lt, t):
    jump = abs(math.sin(lt * 5)) * 40
    coach(c, 540, 1060 - jump, 1.7, "cheer", mouth_at(t), "happy", t)
    paste(c, title_plate("PARTE 2"), 540, 260, ease_back(lt / 0.35), rot=3 - 6 * ease_out(lt / 0.35))
    paste(c, big_text("¡LO LOGRAMOS!", 120), 540, 430, ease_back((lt - 0.2) / 0.35))
    if lt > 1.1:
        spr, d = card_sprite(380, 170, YEL)
        d.text((202, 93), "$900", 150, stroke=12)
        paste(c, spr, 820, 640, ease_back((lt - 1.1) / 0.3), rot=10)
    confetti(c, lt)


ITEMS = {"goal": ("PORTERÍAS NUEVAS", 0, 300), "grass": ("CANCHA DE VERDAD", 300, 600),
         "lights": ("LUCES NOCTURNAS", 600, 900)}


def glow_layer(c, shapes, alpha, blur):
    q = 4
    gl = Image.new("RGBA", (W * K // q, H * K // q))
    g = ImageDraw.Draw(gl)
    for kind, pts in shapes:
        sc = [v * K // q for v in pts] if kind == "ellipse" else [(x * K // q, y * K // q) for x, y in pts]
        (g.ellipse if kind == "ellipse" else g.polygon)(sc, fill=(255, 250, 210, int(alpha)))
    gl = gl.filter(ImageFilter.GaussianBlur(blur)).resize((W * K, H * K), Image.BILINEAR)
    c.paste(gl, (0, 0), gl)


def sc_item(c, lt, t, name):
    d = D(c)
    if name == "goal":
        goal_front(d, 540, 1300 + 30 * (1 - ease_out(lt / 0.4)), 900, 440)
        d.ellipse((470, 1420, 610, 1470), fill=(0, 0, 0, 60))
        ball(d, 540, 1390 - abs(math.sin(lt * 6)) * 90, 55, lt)
    if name == "grass":
        x = W * ease_out(lt / 0.8)  # the dirt rolls away and leaves real grass
        d.rect((x, 940, W, H), fill=(196, 128, 74))
        d.ellipse((290, 1180, 790, 1480), outline=(240, 250, 240), width=8)
        d.rect((x, 1170, W, 1490), fill=(196, 128, 74))
    if name == "lights":
        on = clamp((lt - 0.25) / 0.15)
        if on > 0:
            glow_layer(c, [("poly", [(500, 760), (580, 760), (1000, 1900), (80, 1900)])], 90 * on, 10)
        tower(d, 540, 1700, on, h=920)
        if on > 0:
            glow_layer(c, [("ellipse", (390, 600, 690, 900))], 170 * on, 12)
            confetti(c, lt - 0.25)
    label, v0, v1 = ITEMS[name]
    meter(c, v0 + (v1 - v0) * ease_out((lt - 0.15) / 0.6))
    paste(c, item_card(label), 540, 520, 0.7 + 0.3 * ease_back(lt / 0.3), rot=-3)


def sc_short(c, lt, t):
    news = lt > 0.85
    coach(c, 540, 1020, 1.7, "head" if news else "open", mouth_at(t), "worried" if news else "happy", t)
    meter(c, RAISED, alarm=lt if news else 0)
    if news:
        spr, d = sprite(800, 320)
        d.rrect((10, 10, 790, 310), 26, fill=(255, 255, 255, 245), outline=RED, width=14)
        d.text((400, 90), "TODAVÍA FALTAN", 66, fill=RED)
        d.text((400, 215), "$1.500", 170, fill=RED)
        x = (lt - 0.85) / 0.22
        s = 1 + 0.9 * (1 - ease_out(x)) if x < 1 else 1
        paste(c, spr, 540, 520, s, rot=-7, alpha=min(1, x * 1.5))
        yy = 760 + ((lt * 200) % 120)
        D(c).ellipse((850, yy, 880, yy + 44), fill=(120, 200, 255))


def sc_rates(c, lt, t):
    coach(c, 400, 1040, 1.6, "point", mouth_at(t), "happy", t)
    meter(c, RAISED)
    ta, tb = frac("s06", 0.3) - START["rates"], frac("s06", 0.62) - START["rates"]
    if lt > ta:
        paste(c, rate_card("like"), 1300 - 560 * ease_out((lt - ta) / 0.3), 430, 1, rot=-3)
    if lt > tb:
        paste(c, rate_card("comment"), 1300 - 560 * ease_out((lt - tb) / 0.3), 600, 1, rot=2)


def sc_name(c, lt, t):
    said = frac("s07", 0.5) - START["name"]
    coach(c, 540, 1100, 1.6, "cheer" if lt > said else "open", mouth_at(t), "happy", t)
    likes = int(9999 * ease_out((lt - 0.3) / 2.0))
    paste(c, comment_card(max(likes, 0)), 540, 300, ease_back(lt / 0.3))
    paste(c, big_text("= NOMBRE DEL EQUIPO", 70), 540, 500, ease_back((lt - 0.6) / 0.3))
    if lt > said:
        paste(c, title_plate("¡ELEGIDO!", GREEN, 60), 870, 175, ease_back((lt - said) / 0.3), rot=-8)
        confetti(c, lt - said)


POS = [(540, 1700), (180, 1440), (405, 1480), (675, 1480), (900, 1440), (250, 1130), (540, 1170), (830, 1130),
       (220, 800), (540, 740), (860, 800)]


def sc_eleven(c, lt, t):
    start = frac("s08", 0.35) - START["eleven"]
    d = D(c)
    d.rrect((60, 40, 1020, 290), 30, fill=(20, 24, 40), outline=WHITE, width=7)
    d.text((540, 110), "ONCE TITULAR", 80, fill=YEL, stroke=6)
    d.text((540, 215), "= los primeros 11 comentarios", 50)
    for i, (x, y) in enumerate(POS):
        ti = start + i * 0.17
        on = lt > ti
        s = 0.8 + 0.2 * ease_back((lt - ti) / 0.25) if on else 0.8
        paste(c, shirt_sprite(i + 1, on, f"#{i + 1}" if on else None), x, y - 300, s)


def sc_vs(c, lt, t):
    D(c).rect((0, 0, W, H), fill=(6, 8, 20, 120))
    paste(c, big_text("PARTIDO POR EL ASCENSO", 66, YEL, 8), 540, 260, ease_back(lt / 0.3))
    paste(c, crest("FC", "STUAT", RED), 270 - 300 * (1 - ease_out(lt / 0.35)), 640, 0.95)
    paste(c, crest("3ª", "DIVISIÓN", (80, 86, 104)), 810 + 300 * (1 - ease_out(lt / 0.35)), 640, 0.95)
    paste(c, big_text("VS", 190), 540, 660, ease_back((lt - 0.3) / 0.3), rot=-6)
    win = frac("s09", 0.62) - START["vs"]
    if lt > win:
        bob = 10 * math.sin((lt - win) * 9)
        spr, dd = card_sprite(720, 170, GREEN, border=WHITE)
        dd.poly([(80, 130 + bob), (130, 50 + bob), (180, 130 + bob)], fill=WHITE)
        dd.text((430, 95), "¡SUBIMOS!", 120, stroke=10)
        paste(c, spr, 540, 1080, ease_back((lt - win) / 0.3))
        confetti(c, lt - win)


def sc_end(c, lt, t):
    coach(c, 540, 1060, 1.6, "wave", mouth_at(t), "happy", t)
    ball(D(c), 850, 1640, 60, 0)
    meter(c, RAISED)
    paste(c, big_text("¡COMENTA YA!", 130), 540, 450, ease_back(lt / 0.35), rot=-3)
    spr, dd = card_sprite(470, 100, WHITE, radius=50)
    heart(dd, 70, 58, 26)
    dd.text((150, 60), "$1", 56, fill=DARK)
    bubble(dd, 230, 30, 54)
    dd.text((360, 60), "$10", 56, fill=DARK)
    paste(c, spr, 540, 610, ease_back((lt - 0.25) / 0.3))
    if lt > 0.5:
        sp, d3 = sprite(260, 100)
        d3.text((80, 50), "AQUÍ", 56, fill=YEL, stroke=6)
        d3.line([(150, 50), (235, 50)], 14, fill=YEL)
        d3.poly([(210, 22), (250, 50), (210, 78)], fill=YEL)
        paste(c, sp, 900 + 20 * math.sin(lt * 8), 1300)
    confetti(c, lt)


SCENE_BG = {"hook": "dusk", "goal": "dusk", "grass": "dusk", "lights": "night_dark", "short": "dirt",
            "rates": "dusk", "name": "night", "eleven": "board", "vs": "night", "end": "night"}
FN = {"hook": sc_hook, "short": sc_short, "rates": sc_rates, "name": sc_name, "eleven": sc_eleven, "vs": sc_vs,
      "end": sc_end}


def frame(t):
    for s0, s1, name in SCENES:
        if s0 <= t < s1:
            break
    lt, dur = t - s0, s1 - s0
    c = bg(SCENE_BG[name])
    if name in ITEMS:
        sc_item(c, lt, t, name)
    else:
        FN[name](c, lt, t)
    subtitles(c, t, 1600 if name == "eleven" else 1560)
    img = c.reduce(K)
    if name == "short" and lt > 0.85:
        img = Image.blend(img, img.convert("L").convert("RGB"), 0.5 * ease_out((lt - 0.85) / 0.4))
        if lt < 1.15:
            k = (1.15 - lt) / 0.3
            img = img.transform((W, H), Image.AFFINE, (1, 0, 14 * k * math.sin(lt * 90), 0, 1, 10 * k * math.cos(lt * 70)))
    z = 1 + 0.04 * lt / max(dur, 0.1)  # slow push-in
    img = img.transform((W, H), Image.AFFINE, (1 / z, 0, W / 2 * (1 - 1 / z), 0, 1 / z, H / 2 * (1 - 1 / z)),
                        Image.BILINEAR)
    if lt < 0.1 and s0 > 0:
        img = Image.blend(img, Image.new("RGB", (W, H), WHITE), 0.6 * (1 - lt / 0.1))
    if t > TOTAL - 0.4:
        img = Image.blend(img, Image.new("RGB", (W, H)), 0.6 * (t - (TOTAL - 0.4)) / 0.4)
    return img


def render_bytes(i):
    return frame(i / FPS).tobytes()


def main():
    if PREVIEW:
        ts = [0.3, 1.5, 2.8, 4.2, 5.6, 6.9, 8.4, 9.9, 12.0, 14.5, 16.5, 19.5, 22.0, 24.3, 26.0, 28.0, 29.5, 31.5]
        sheet = Image.new("RGB", (360 * 6, 640 * 3))
        for i, t in enumerate(ts):
            th = frame(t).resize((360, 640))
            ImageDraw.Draw(th).text((10, 10), f"{t:.1f}", fill=(0, 255, 255))
            sheet.paste(th, ((i % 6) * 360, (i // 6) * 640))
        sheet.save(OUT)
        return
    n = int(TOTAL * FPS)
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                          "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                          "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for i, b in enumerate(pool.imap(render_bytes, range(n), chunksize=4)):
            p.stdin.write(b)
            if i % 150 == 0:
                print(f"{i}/{n}", flush=True)
    p.stdin.close()
    p.wait()


if __name__ == "__main__":
    main()
