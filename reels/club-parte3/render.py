"""Reel "Mi nuevo club" — Parte 3, drawn from scratch (no Part 1 footage).

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
# --bg3d <dir>: JPEG frames from scene3d/render3d.js (the 3D world + coach); 2D only draws the graphics on top
BG3D = Path(sys.argv[sys.argv.index("--bg3d") + 1]) if "--bg3d" in sys.argv else None
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
    if BG3D:
        return
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


def meter(canvas, value, alarm=0.0, goal=2400, label="META DEL CLUB", done=False):
    d = D(canvas)
    x0, y0, x1, y1 = 70, 140, 1010, 300
    d.rrect((x0 + 6, y0 + 10, x1 + 6, y1 + 10), 30, fill=(0, 0, 0, 120))
    d.rrect((x0, y0, x1, y1), 30, fill=(20, 24, 40), outline=GREEN if done else WHITE, width=7)
    d.text((x0 + 36, y0 + 50), label, 46, anchor="lm")
    d.text((x1 - 34, y0 + 50), f"{money(value)} / {money(goal)}", 54, fill=GREEN if done else YEL, anchor="rm")
    bx0, by0, bx1, by1 = x0 + 34, y0 + 96, x1 - 34, y0 + 134
    d.rrect((bx0, by0, bx1, by1), 19, fill=(52, 58, 82))
    fx = bx0 + (bx1 - bx0) * min(value / goal, 1)
    if alarm > 0:
        a = int(120 + 135 * (0.5 + 0.5 * math.sin(alarm * 14)))
        d.rrect((fx - 20 if fx > bx0 + 20 else bx0, by0, bx1, by1), 19, fill=(232, 58, 64, a))
    if fx > bx0 + 38:
        col = GREEN if done else (255, 150, 40)
        d.rrect((bx0, by0, fx, by1), 19, fill=col)
        d.rrect((bx0, by0, fx, by0 + 16), 8, fill=(140, 240, 160) if done else (255, 200, 90))


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
    "s01": ["¡Ya tenemos a nuestros *ONCE* *TITULARES!*"],
    "s02": ["Los primeros *11* comentarios fueron los *AFORTUNADOS.*", "¡*GRACIAS,* cracks!"],
    "s03": ["¡Y completamos la *META!*", "*$2.400*"],
    "s04": ["Ya tenemos *VESTIDORES,*"],
    "s05": ["¡y *GRADAS* para la afición!"],
    "s06": ["Llegó el gran partido contra el equipo de *TERCERA* *DIVISIÓN.*"],
    "s07": ["Ellos *DOMINABAN* todo el partido.", "Tiro, tras tiro, tras *TIRO...*"],
    "s08": ["Pero en el *ÚLTIMO* *MINUTO...*", "¡*CONTRAGOLPE...* y *GOOOL!*"],
    "s09": ["¡Ganamos *1-0!*", "¡Ya somos de *TERCERA* *DIVISIÓN!*"],
    "s10": ["Pero ahora viene lo más *DIFÍCIL.*", "Para llegar a *SEGUNDA* *DIVISIÓN*", "necesitamos *$10.000.*"],
    "s11": ["Cada *LIKE* es *$1.*", "¡Y cada *COMENTARIO,* *$10!*"],
    "s12": ["¡*COMENTA* *YA!* Nos vemos en la cancha."],
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


def frac(k, f):
    a, b = LINES[k]
    return a + (b - a) * f


NAMES = ["hook", "thanks", "goal", "lockers", "stands", "vs", "press", "counter", "win", "next", "rates", "end"]
CUTS = [0.0] + [L(f"s{i:02d}") - 0.12 for i in range(2, 13)] + [TOTAL]
SCENES = [(CUTS[i], CUTS[i + 1], n) for i, n in enumerate(NAMES)]
START = {n: CUTS[i] for i, n in enumerate(NAMES)}
MARKS = {"gracias": frac("s02", 0.72), "diezmil": frac("s10", 0.78), "gol": frac("s08", 0.82)}


def stamp(text, sub=None, fill=RED, bg=(255, 255, 255, 245), w=820):
    spr, d = sprite(w, 330 if sub else 220)
    d.rrect((10, 10, w - 10, (320 if sub else 210)), 26, fill=bg, outline=fill, width=14)
    if sub:
        d.text((w / 2, 90), sub, 62, fill=fill)
        d.text((w / 2, 220), text, 150, fill=fill)
    else:
        d.text((w / 2, 112), text, 120, fill=fill)
    return spr


def scoreboard(c, a, b, minute, flash=0.0):
    d = D(c)
    x0, y0, x1, y1 = 140, 120, 940, 250
    d.rrect((x0 + 6, y0 + 10, x1 + 6, y1 + 10), 26, fill=(0, 0, 0, 120))
    d.rrect((x0, y0, x1, y1), 26, fill=(20, 24, 40), outline=WHITE, width=6)
    d.rrect((x0 + 14, y0 + 14, x0 + 270, y1 - 14), 16, fill=RED)
    d.text((x0 + 142, (y0 + y1) / 2), "FC STUAT", 50, stroke=4)
    d.rrect((x1 - 270, y0 + 14, x1 - 14, y1 - 14), 16, fill=(90, 96, 116))
    d.text((x1 - 142, (y0 + y1) / 2), "3ª DIV.", 54, stroke=4)
    col = YEL if flash > 0 and int(flash * 8) % 2 == 0 else WHITE
    d.text((540, (y0 + y1) / 2 - 8), f"{a} - {b}", 84, fill=col, stroke=5)
    d.rrect((470, y1 - 4, 610, y1 + 50), 14, fill=YEL, outline=DARK, width=4)
    d.text((540, y1 + 23), minute, 40, fill=DARK)


def stat_bar(c, y, label, a, b, prog):
    d = D(c)
    d.rrect((110, y, 970, y + 110), 22, fill=(20, 24, 40, 225), outline=WHITE, width=5)
    d.text((540, y + 30), label, 40, fill=YEL)
    d.text((150, y + 75), str(a) if isinstance(a, str) else f"{int(a * prog)}", 50, anchor="lm")
    d.text((930, y + 75), str(b) if isinstance(b, str) else f"{int(b * prog)}", 50, anchor="rm")


def sc_hook(c, lt, t):
    coach(c, 540, 1060 - abs(math.sin(lt * 5)) * 40, 1.7, "cheer", mouth_at(t), "happy", t)
    paste(c, title_plate("PARTE 3"), 540, 230, ease_back(lt / 0.35), rot=3 - 6 * ease_out(lt / 0.35))
    paste(c, big_text("¡YA TENEMOS", 110), 540, 390, ease_back((lt - 0.15) / 0.35))
    paste(c, big_text("EQUIPO!", 150, WHITE), 540, 540, ease_back((lt - 0.3) / 0.35), rot=-3)
    confetti(c, lt)


def sc_thanks(c, lt, t):
    d = D(c)
    d.rrect((60, 40, 1020, 290), 30, fill=(20, 24, 40, 235), outline=WHITE, width=7)
    d.text((540, 110), "LOS 11 AFORTUNADOS", 76, fill=YEL, stroke=6)
    d.text((540, 215), "= los primeros 11 comentarios", 50)
    g = MARKS["gracias"] - START["thanks"]
    if lt > g:
        paste(c, title_plate("¡GRACIAS!", GREEN, 90), 540, 1310, ease_back((lt - g) / 0.3), rot=-5)
        confetti(c, lt - g)


def sc_goal(c, lt, t):
    coach(c, 540, 1060 - abs(math.sin(lt * 6)) * 40, 1.7, "cheer", mouth_at(t), "happy", t)
    full = 0.9
    v = 900 + 1500 * ease_out((lt - 0.2) / full)
    done = lt > 0.2 + full
    meter(c, v, done=done)
    if done:
        x = (lt - 0.2 - full) / 0.25
        paste(c, stamp("$2.400", "¡META COMPLETADA!", GREEN), 540, 520, 1 + 0.8 * (1 - ease_out(x)), rot=-6,
              alpha=clamp(x * 1.5))
        confetti(c, lt - 0.2 - full)


def sc_item(c, lt, t, label):
    meter(c, 2400, done=True)
    paste(c, item_card(label), 540, 520, 0.7 + 0.3 * ease_back(lt / 0.3), rot=-3)
    if lt > 0.3:
        confetti(c, lt - 0.3)


def sc_vs(c, lt, t):
    D(c).rect((0, 0, W, H), fill=(6, 8, 20, 80 if BG3D else 120))
    paste(c, big_text("EL GRAN PARTIDO", 80, YEL, 8), 540, 260, ease_back(lt / 0.3))
    paste(c, crest("FC", "STUAT", RED), 270 - 300 * (1 - ease_out(lt / 0.35)), 640, 0.95)
    paste(c, crest("3ª", "DIVISIÓN", (80, 86, 104)), 810 + 300 * (1 - ease_out(lt / 0.35)), 640, 0.95)
    paste(c, big_text("VS", 190), 540, 660, ease_back((lt - 0.3) / 0.3), rot=-6)


def sc_press(c, lt, t):
    dur = START["counter"] - START["press"]
    m = 60 + int(29 * clamp(lt / dur))
    scoreboard(c, 0, 0, f"{m}'")
    p = ease_out((lt - 0.3) / 1.5)
    stat_bar(c, 330, "POSESIÓN", "20%", "80%", p)
    stat_bar(c, 460, "TIROS", 0, 17, p)
    if lt > 0.9:
        paste(c, title_plate("¡NOS DOMINAN!", RED, 70), 540, 670, ease_back((lt - 0.9) / 0.3), rot=-4)


def sc_counter(c, lt, t):
    g = MARKS["gol"] - START["counter"]
    scoreboard(c, 1 if lt > g else 0, 0, "90+3'", flash=(lt - g) if lt > g else 0)
    if lt < g:
        paste(c, title_plate("¡ÚLTIMO MINUTO!", RED, 66), 540, 360, ease_back(lt / 0.3), rot=3)
    else:
        u = lt - g
        paste(c, big_text("¡GOOOL!", 220), 540, 620, ease_back(u / 0.3) * (1 + 0.04 * math.sin(u * 20)), rot=-6)
        confetti(c, u)


def sc_win(c, lt, t):
    coach(c, 540, 1060 - abs(math.sin(lt * 6)) * 40, 1.7, "cheer", mouth_at(t), "happy", t)
    scoreboard(c, 1, 0, "FINAL")
    spr, dd = card_sprite(860, 230, GREEN, border=WHITE)
    bob = 10 * math.sin(lt * 9)
    dd.poly([(70, 160 + bob), (130, 60 + bob), (190, 160 + bob)], fill=WHITE)
    dd.text((480, 82), "¡SUBIMOS!", 120, stroke=10)
    dd.text((480, 190), "AHORA: TERCERA DIVISIÓN", 46, fill=WHITE, stroke=4)
    paste(c, spr, 540, 470, ease_back((lt - 0.2) / 0.3))
    confetti(c, lt)


def sc_next(c, lt, t):
    said = MARKS["diezmil"] - START["next"]
    news = lt > said
    coach(c, 540, 1020, 1.7, "head" if news else "open", mouth_at(t), "worried" if news else "happy", t)
    if lt < 1.4:
        paste(c, title_plate("PRÓXIMA META", NAVY, 70), 540, 470, ease_back(lt / 0.3))
    if lt > 0.5:
        meter(c, 0, alarm=lt if news else 0, goal=10000, label="SEGUNDA DIVISIÓN")
    else:
        meter(c, 2400, done=True)
    if lt > 1.4 and not news:
        paste(c, big_text("2ª DIVISIÓN", 130), 540, 520, ease_back((lt - 1.4) / 0.3), rot=-3)
    if news:
        x = (lt - said) / 0.22
        paste(c, stamp("$10.000", "NECESITAMOS"), 540, 540, 1 + 0.9 * (1 - ease_out(x)) if x < 1 else 1, rot=-7,
              alpha=min(1, x * 1.5))


def sc_rates(c, lt, t):
    coach(c, 400, 1040, 1.6, "point", mouth_at(t), "happy", t)
    meter(c, 0, goal=10000, label="SEGUNDA DIVISIÓN")
    ta, tb = frac("s11", 0.05) - START["rates"], frac("s11", 0.5) - START["rates"]
    if lt > ta:
        paste(c, rate_card("like"), 1300 - 560 * ease_out((lt - ta) / 0.3), 430, 1, rot=-3)
    if lt > tb:
        paste(c, rate_card("comment"), 1300 - 560 * ease_out((lt - tb) / 0.3), 600, 1, rot=2)


def sc_end(c, lt, t):
    coach(c, 540, 1060, 1.6, "wave", mouth_at(t), "happy", t)
    meter(c, 0, goal=10000, label="SEGUNDA DIVISIÓN")
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


SCENE_BG = {"hook": "dusk", "thanks": "board", "goal": "dusk", "lockers": "dusk", "stands": "dusk", "vs": "night",
            "press": "night", "counter": "night", "win": "night", "next": "night", "rates": "night", "end": "night"}
FN = {"hook": sc_hook, "thanks": sc_thanks, "goal": sc_goal, "lockers": lambda c, lt, t: sc_item(c, lt, t, "VESTIDORES"),
      "stands": lambda c, lt, t: sc_item(c, lt, t, "GRADAS"), "vs": sc_vs, "press": sc_press, "counter": sc_counter,
      "win": sc_win, "next": sc_next, "rates": sc_rates, "end": sc_end}


def frame(t):
    for s0, s1, name in SCENES:
        if s0 <= t < s1:
            break
    lt, dur = t - s0, s1 - s0
    if BG3D:
        c = Image.open(BG3D / f"{int(round(t * FPS)):04d}.jpg").convert("RGB").resize((W * K, H * K), Image.BILINEAR)
        if name == "vs":
            c = c.filter(ImageFilter.GaussianBlur(4 * K))
    else:
        c = bg(SCENE_BG[name])
    FN[name](c, lt, t)
    subtitles(c, t, 1620 if name in ("thanks", "press", "counter") else 1560)
    img = c.reduce(K)
    if name == "next":
        said = MARKS["diezmil"] - START["next"]
        if lt > said:
            img = Image.blend(img, img.convert("L").convert("RGB"), 0.45 * ease_out((lt - said) / 0.4))
            if lt < said + 0.3:
                k = (said + 0.3 - lt) / 0.3
                img = img.transform((W, H), Image.AFFINE, (1, 0, 14 * k * math.sin(lt * 90), 0, 1, 10 * k * math.cos(lt * 70)))
    if name == "counter":
        g = MARKS["gol"] - START["counter"]
        if 0 < lt - g < 0.35:
            k = (g + 0.35 - lt) / 0.35
            img = img.transform((W, H), Image.AFFINE, (1, 0, 16 * k * math.sin(lt * 90), 0, 1, 12 * k * math.cos(lt * 70)))
    z = 1 + (0 if BG3D else 0.04) * lt / max(dur, 0.1)
    img = img.transform((W, H), Image.AFFINE, (1 / z, 0, W / 2 * (1 - 1 / z), 0, 1 / z, H / 2 * (1 - 1 / z)),
                        Image.BILINEAR)
    if lt < 0.1 and s0 > 0:
        img = Image.blend(img, Image.new("RGB", (W, H), WHITE), 0.6 * (1 - lt / 0.1))
    if t > TOTAL - 0.4:
        img = Image.blend(img, Image.new("RGB", (W, H)), 0.6 * (t - (TOTAL - 0.4)) / 0.4)
    return img


def render_bytes(i):
    return frame(i / FPS).tobytes()


def export3d(d):
    d = Path(d)
    (d / "scenes.json").write_text(json.dumps({
        "scenes": [{"name": n, "s0": a, "s1": b} for a, b, n in SCENES],
        "start": START, "marks": MARKS, "total": TOTAL}))
    (d / "env.json").write_text(json.dumps([round(float(v), 3) for v in ENV]))
    print("frames", int(TOTAL * FPS))


def main():
    if "--export3d" in sys.argv:
        return export3d(sys.argv[sys.argv.index("--export3d") + 1])
    if PREVIEW:
        ts = [s0 + (s1 - s0) * f for s0, s1, _ in SCENES for f in (0.3, 0.85)][:24]
        if BG3D:
            ts = [int(f.stem) / FPS for f in sorted(BG3D.glob("*.jpg"))][:24]
        sheet = Image.new("RGB", (270 * 8, 480 * 3))
        for i, t in enumerate(ts):
            th = frame(t).resize((270, 480))
            ImageDraw.Draw(th).text((10, 10), f"{t:.1f}", fill=(0, 255, 255))
            sheet.paste(th, ((i % 8) * 270, (i // 8) * 480))
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
