"""Reel "Mi nuevo club" — Parte 2.

Reuses the footage of Part 1 (coach + club scenes), removes its burned-in text,
and lays new graphics on top: goal meter at $900 / $2.400, "FALTAN $1.500",
the FC Stuat comment card, the 11 starter slots and the third-division match.

    python3 render.py <part1.mp4 frames dir> <voice dir with timeline.json + voice.wav> <out.mp4> [--preview]

Frames dir: ffmpeg -i part1.mp4 -q:v 2 <dir>/%04d.jpg   (30 fps, 1080x1920)
"""

import json
import math
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC, VODIR, OUT = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
PREVIEW = "--preview" in sys.argv
FONTDIR = Path(sys.argv[sys.argv.index("--fonts") + 1]) if "--fonts" in sys.argv else Path("fonts")
W, H, FPS = 1080, 1920, 30
TL = json.loads((VODIR / "timeline.json").read_text())
LINES, TOTAL = TL["tl"], TL["total"]
NSRC = len(list(SRC.glob("*.jpg")))

YEL = (255, 214, 64)
RED = (232, 58, 64)
NAVY = (22, 34, 66)
DARK = (18, 18, 24)
GREEN = (46, 190, 90)
WHITE = (255, 255, 255)


def font(name, size):
    return ImageFont.truetype(str(FONTDIR / f"{name}.ttf"), size)


LIL = {s: font("LilitaOne", s) for s in (40, 46, 54, 62, 66, 80, 96, 120, 150, 190)}


def ease_back(x):
    x = min(max(x, 0.0), 1.0)
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


# ---------------------------------------------------------------- scenes
# (out_start, out_end, src_start, src_end, name)
def L(k, i=0):
    return LINES[k][i]


CUTS = [0.0, L("s02") - 0.12, L("s03") - 0.06, L("s04") - 0.06, L("s05") - 0.2, L("s06") - 0.15,
        L("s07") - 0.15, L("s08") - 0.15, L("s09") - 0.05, L("s10") - 0.15, TOTAL]
SRCR = {
    "hook": (0.0, 3.9), "goal": (14.9, 16.9), "grass": (19.2, 20.4), "lights": (21.3, 22.5),
    "short": (4.5, 8.0), "rates": (8.0, 11.8), "name": (30.2, 33.2), "eleven": (33.4, 35.4),
    "vs": (21.0, 23.3), "end": (35.4, 37.6),
}
NAMES = ["hook", "goal", "grass", "lights", "short", "rates", "name", "eleven", "vs", "end"]
SCENES = [(CUTS[i], CUTS[i + 1], *SRCR[n], n) for i, n in enumerate(NAMES)]


def scene_at(t):
    for s in SCENES:
        if s[0] <= t < s[1]:
            return s
    return SCENES[-1]


# ---------------------------------------------------------------- text removal
_cache = {}


def src_frame(sec):
    idx = min(max(int(round(sec * 30)) + 1, 1), NSRC)
    if idx not in _cache:
        if len(_cache) > 60:
            _cache.clear()
        _cache[idx] = cv2.imread(str(SRC / f"{idx:04d}.jpg"))
    return _cache[idx].copy()


def text_mask(bgr, y0, y1):
    """White / yellow caption letters plus their dark outline inside a band."""
    band = bgr[y0:y1]
    b, g, r = band[..., 0].astype(int), band[..., 1].astype(int), band[..., 2].astype(int)
    white = (r > 215) & (g > 215) & (b > 205)
    yellow = (r > 215) & (g > 165) & (b < 110)
    m = ((white | yellow) * 255).astype(np.uint8)
    m = cv2.dilate(m, np.ones((15, 15), np.uint8))
    full = np.zeros(bgr.shape[:2], np.uint8)
    full[y0:y1] = m
    return full


def sky_fill(bgr, x0, x1, y0, y1):
    """Replace a rectangle with a left/right interpolated gradient (for flat skies)."""
    left = bgr[y0:y1, max(x0 - 6, 0):x0].mean(axis=1)
    right = bgr[y0:y1, x1:x1 + 6].mean(axis=1)
    a = np.linspace(0, 1, x1 - x0)[None, :, None]
    bgr[y0:y1, x0:x1] = (left[:, None, :] * (1 - a) + right[:, None, :] * a).astype(np.uint8)
    bgr[y0:y1, x0:x1] = cv2.GaussianBlur(bgr[y0:y1, x0:x1], (0, 0), 6)


def clean(bgr, name):
    if name in ("eleven", "end"):  # coach's face sits right under the captions: no inpaint, the band hides them
        return bgr
    m = text_mask(bgr, 1245, 1600)
    if name == "hook":
        sky_fill(bgr, 90, 990, 210, 580)
    return cv2.inpaint(bgr, m, 6, cv2.INPAINT_TELEA)


# ---------------------------------------------------------------- drawing helpers
def outlined(d, xy, text, f, fill=WHITE, stroke=10, anchor="mm", sc=DARK):
    d.text(xy, text, font=f, fill=fill, stroke_width=stroke, stroke_fill=sc, anchor=anchor)


def pop_layer(layer, cx, cy, s, rot=0):
    """Scale (and rotate) a full-frame RGBA layer around the point (cx, cy)."""
    if s <= 0.01:
        return None
    if rot:
        layer = layer.rotate(rot, Image.BICUBIC, center=(cx, cy))
    if abs(s - 1) < 1e-3:
        return layer
    return layer.transform((W, H), Image.AFFINE, (1 / s, 0, cx - cx / s, 0, 1 / s, cy - cy / s), Image.BICUBIC)


def card(w, h, fill, border=DARK, radius=28, bw=8, shadow=True):
    im = Image.new("RGBA", (w + 24, h + 30))
    d = ImageDraw.Draw(im)
    if shadow:
        d.rounded_rectangle((12, 22, w + 12, h + 22), radius, fill=(0, 0, 0, 110))
    d.rounded_rectangle((8, 8, w + 8, h + 8), radius, fill=fill, outline=border, width=bw)
    return im


def check_icon(size):
    im = Image.new("RGBA", (size, size))
    d = ImageDraw.Draw(im)
    d.ellipse((0, 0, size - 1, size - 1), fill=GREEN, outline=DARK, width=max(4, size // 14))
    p = [(size * 0.27, size * 0.52), (size * 0.44, size * 0.69), (size * 0.75, size * 0.34)]
    d.line(p, fill=WHITE, width=max(6, size // 8), joint="curve")
    return im


def heart(d, cx, cy, r, fill=RED):
    d.ellipse((cx - r, cy - r * 0.9, cx, cy + r * 0.1), fill=fill)
    d.ellipse((cx, cy - r * 0.9, cx + r, cy + r * 0.1), fill=fill)
    d.polygon([(cx - r * 0.97, cy - 0.25 * r), (cx + r * 0.97, cy - 0.25 * r), (cx, cy + r)], fill=fill)


def bubble(d, x, y, s, fill=(40, 140, 255)):
    d.rounded_rectangle((x, y, x + s, y + s * 0.72), s * 0.18, fill=fill, outline=DARK, width=3)
    d.polygon([(x + s * 0.2, y + s * 0.7), (x + s * 0.42, y + s * 0.7), (x + s * 0.18, y + s * 0.92)], fill=fill)
    for i in range(3):
        cx = x + s * (0.3 + 0.2 * i)
        d.ellipse((cx - s * 0.06, y + s * 0.3, cx + s * 0.06, y + s * 0.42), fill=WHITE)


def money(v):
    return "$" + f"{int(round(v)):,}".replace(",", ".")


# ---------------------------------------------------------------- HUD: goal meter
GOAL, RAISED = 2400, 900


def meter(img, value, alarm=0.0):
    x0, y0, x1, y1 = 70, 222, 1010, 392
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((x0 + 6, y0 + 10, x1 + 6, y1 + 10), 30, fill=(0, 0, 0, 120))
    d.rounded_rectangle((x0, y0, x1, y1), 30, fill=(20, 24, 40, 255), outline=WHITE, width=7)
    d.text((x0 + 36, y0 + 52), "META DEL CLUB", font=LIL[46], fill=WHITE, anchor="lm")
    d.text((x1 - 34, y0 + 52), f"{money(value)} / {money(GOAL)}", font=LIL[54], fill=YEL, anchor="rm")
    bx0, by0, bx1, by1 = x0 + 34, y0 + 102, x1 - 34, y0 + 140
    d.rounded_rectangle((bx0, by0, bx1, by1), 19, fill=(52, 58, 82))
    fx = bx0 + (bx1 - bx0) * min(value / GOAL, 1)
    if alarm > 0:  # the missing part blinks red
        a = int(120 + 135 * (0.5 + 0.5 * math.sin(alarm * 14)))
        d.rounded_rectangle((fx - 20, by0, bx1, by1), 19, fill=(232, 58, 64, a))
    if fx > bx0 + 38:
        d.rounded_rectangle((bx0, by0, fx, by1), 19, fill=(255, 150, 40))
        d.rounded_rectangle((bx0, by0, fx, by0 + 16), 8, fill=(255, 200, 90))


# ---------------------------------------------------------------- subtitles (word by word, like Part 1)
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
SUB_F = LIL[66]


def wrap(words, maxw):
    lines, cur = [], []
    for w in words:
        test = " ".join(x[0] for x in cur + [w])
        if cur and SUB_F.getlength(test) > maxw:
            lines.append(cur)
            cur = [w]
        else:
            cur.append(w)
    if cur:
        lines.append(cur)
    return lines


def sub_chunks():
    out = []
    for k, chunks in SUBS.items():
        a, b = LINES[k]
        total = sum(len(c) for c in chunks)
        t = a
        for i, c in enumerate(chunks):
            dur = (b - a) * len(c) / total
            end = t + dur if i < len(chunks) - 1 else b + 0.3
            out.append((t, end, c))
            t += dur
    # hold each caption until the next one starts (and the last one to the end)
    return [(a, out[i + 1][0] if i + 1 < len(out) else TOTAL + 1, c, e) for i, (a, e, c) in enumerate(out)]


CHUNKS = sub_chunks()


def subtitles(img, t, y=1330, bottom=1490):
    for a, b, text, spoken in CHUNKS:
        if a <= t < b:
            break
    else:
        return
    words = []
    for w in text.split(" "):
        hl = w.startswith("*") or w.startswith("¡*")
        words.append((w.replace("*", ""), hl))
    lines = wrap(words, 940)
    n = sum(len(x) for x in lines)
    speak_end = a + (spoken - a) * 0.85
    # reveal words over the spoken part
    shown = max(1, int(n * min(1, (t - a) / max(0.01, speak_end - a)) + 0.999))
    lh = 80
    top = y - (len(lines) - 1) * lh / 2
    d = ImageDraw.Draw(img)
    # dark backing (also hides what the inpainting left behind)
    widths = [SUB_F.getlength(" ".join(w for w, _ in ln)) for ln in lines]
    # fixed-size band: also hides what the inpainting left of Part 1's captions
    d.rounded_rectangle((36, 1250, W - 36, bottom), 34, fill=(10, 10, 16, 228))
    k = 0
    for li, ln in enumerate(lines):
        x = W / 2 - widths[li] / 2
        yy = top + li * lh
        for w, hl in ln:
            if k >= shown:
                return
            age = t - (a + (speak_end - a) * k / n)
            s = 0.6 + 0.4 * ease_back(age / 0.18)
            f = SUB_F if s > 0.98 else LIL[max(40, int(66 * s))] if False else SUB_F
            col = YEL if hl else WHITE
            d.text((x, yy + (1 - s) * 18), w, font=f, fill=col, stroke_width=9, stroke_fill=DARK, anchor="lm")
            x += SUB_F.getlength(w + " ")
            k += 1


# ---------------------------------------------------------------- per-scene overlays
def ov_hook(img, lt, t):
    # red "PARTE 2" plate + yellow "¡LO LOGRAMOS!" where Part 1 said "¡NECESITO TU AYUDA!"
    lay = Image.new("RGBA", (W, H))
    d = ImageDraw.Draw(lay)
    d.rounded_rectangle((330, 232, 750, 352), 22, fill=(0, 0, 0, 120))
    d.rounded_rectangle((322, 222, 742, 342), 22, fill=RED, outline=WHITE, width=7)
    outlined(d, (532, 282), "PARTE 2", LIL[80], stroke=6)
    o = pop_layer(lay, 532, 282, ease_back(lt / 0.35), rot=-4 * (1 - ease_out(lt / 0.35)) + 3)
    if o:
        img.alpha_composite(o)
    lay2 = Image.new("RGBA", (W, H))
    d2 = ImageDraw.Draw(lay2)
    outlined(d2, (540, 455), "¡LO LOGRAMOS!", LIL[120], fill=YEL, stroke=14)
    o = pop_layer(lay2, 540, 455, ease_back((lt - 0.25) / 0.35))
    if o:
        img.alpha_composite(o)
    if lt > 1.1:  # "$900" stamp
        lay3 = Image.new("RGBA", (W, H))
        d3 = ImageDraw.Draw(lay3)
        c = card(420, 170, YEL)
        lay3.alpha_composite(c, (W - 470, 600))
        outlined(d3, (W - 252, 692), "$900", LIL[150], fill=WHITE, stroke=12)
        o = pop_layer(lay3, W - 252, 690, ease_back((lt - 1.1) / 0.3), rot=8)
        if o:
            img.alpha_composite(o)


ITEM = {"goal": ("PORTERÍAS NUEVAS", 0, 300), "grass": ("CANCHA DE VERDAD", 300, 600),
        "lights": ("LUCES NOCTURNAS", 600, 900)}


def ov_item(img, lt, name, dur):
    label, v0, v1 = ITEM[name]
    meter(img, v0 + (v1 - v0) * ease_out((lt - 0.15) / 0.6))
    lay = Image.new("RGBA", (W, H))
    d = ImageDraw.Draw(lay)
    lay.alpha_composite(card(660, 330, YEL), (200, 372))
    d.text((540, 462), label, font=LIL[54], fill=DARK, anchor="mm")
    outlined(d, (590, 590), "¡LISTO!", LIL[120], stroke=12)
    lay.alpha_composite(check_icon(118), (262, 532))
    o = pop_layer(lay, 540, 560, 0.75 + 0.25 * ease_back(lt / 0.25), rot=-3)
    if o:
        img.alpha_composite(o)


def ov_short(img, lt, dur):
    meter(img, RAISED, alarm=lt if lt > 0.9 else 0)
    if lt > 0.85:
        lay = Image.new("RGBA", (W, H))
        d = ImageDraw.Draw(lay)
        d.rounded_rectangle((140, 392, 940, 700), 26, fill=(255, 255, 255, 245), outline=RED, width=14)
        d.text((540, 470), "TODAVÍA FALTAN", font=LIL[66], fill=RED, anchor="mm")
        d.text((540, 600), "$1.500", font=LIL[190], fill=RED, anchor="mm")
        x = (lt - 0.85) / 0.22
        s = 1 + 0.9 * (1 - ease_out(x)) if x < 1 else 1
        o = pop_layer(lay, 540, 560, s, rot=-7)
        if o:
            if x < 1:
                o.putalpha(o.getchannel("A").point(lambda v: int(v * min(1, x * 1.5))))
            img.alpha_composite(o)


def ov_rates(img, lt):
    meter(img, RAISED)


def ov_name(img, lt, dur):
    # Part 1's "tu comentario: Club ???" card becomes the winning comment
    lay = Image.new("RGBA", (W, H))
    d = ImageDraw.Draw(lay)
    lay.alpha_composite(card(960, 200, WHITE, radius=30), (48, 236))
    d.ellipse((140, 288, 240, 388), fill=NAVY, outline=DARK, width=4)
    d.text((190, 338), "XD", font=LIL[46], fill=WHITE, anchor="mm")
    d.text((270, 300), "@xd12_1 · comentario", font=LIL[40], fill=(110, 110, 130), anchor="lm")
    d.text((270, 370), "FC Stuat", font=LIL[80], fill=DARK, anchor="lm")
    heart(d, 880, 310, 30)
    likes = int(9999 * ease_out((lt - 0.3) / 2.0))
    d.text((880, 380), money(likes)[1:], font=LIL[40], fill=RED, anchor="mm")
    o = pop_layer(lay, 540, 340, ease_back(lt / 0.3))
    if o:
        img.alpha_composite(o)
    # "¡ELEGIDO!" seal once the name is said
    when = (LINES["s07"][0] + (LINES["s07"][1] - LINES["s07"][0]) * 0.5) - scene_at(LINES["s07"][0])[0]
    if lt > when:
        lay2 = Image.new("RGBA", (W, H))
        d2 = ImageDraw.Draw(lay2)
        d2.rounded_rectangle((700, 170, 1040, 266), 18, fill=GREEN, outline=WHITE, width=7)
        outlined(d2, (870, 218), "¡ELEGIDO!", LIL[62], stroke=6)
        o = pop_layer(lay2, 870, 218, ease_back((lt - when) / 0.3), rot=-8)
        if o:
            img.alpha_composite(o)


def shirt(d, cx, cy, s, fill, num, shown):
    if not shown:
        fill = (60, 66, 92)
    pts = [(-0.5, -0.42), (-0.2, -0.5), (-0.1, -0.42), (0.1, -0.42), (0.2, -0.5), (0.5, -0.42), (0.62, -0.12),
           (0.38, -0.02), (0.36, 0.5), (-0.36, 0.5), (-0.38, -0.02), (-0.62, -0.12)]
    d.polygon([(cx + x * s, cy + y * s) for x, y in pts], fill=fill, outline=DARK, width=5)
    d.text((cx, cy + s * 0.08), str(num) if shown else "?", font=LIL[46], fill=WHITE if shown else (140, 146, 170),
           anchor="mm", stroke_width=4 if shown else 0, stroke_fill=DARK)


def ov_eleven(img, lt, dur):
    # covers Part 1's "¡COMENTA YA!" panel with the 11 starter slots
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((52, 402, 1028, 842), 34, fill=(0, 0, 0, 110))
    d.rounded_rectangle((44, 392, 1020, 832), 34, fill=(20, 24, 40, 245), outline=WHITE, width=7)
    outlined(d, (532, 452), "ONCE TITULAR · FC STUAT", LIL[62], fill=YEL, stroke=6)
    start = LINES["s08"][0] + (LINES["s08"][1] - LINES["s08"][0]) * 0.35 - scene_at(LINES["s08"][0])[0]
    filled = int(np.clip((lt - start) / 0.17, 0, 11))
    pos = [(140 + i * 130, 590) for i in range(6)] + [(205 + i * 130, 735) for i in range(5)]
    for i, (x, y) in enumerate(pos):
        shirt(d, x, y, 108, RED, i + 1, i < filled)
    meter(img, RAISED)


def ov_vs(img, lt, dur):
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, H), fill=(6, 8, 20, 110))
    lay = Image.new("RGBA", (W, H))
    dl = ImageDraw.Draw(lay)
    outlined(dl, (540, 300), "PARTIDO POR EL ASCENSO", LIL[62], fill=YEL, stroke=8)
    # FC Stuat badge (just colors, our own club)
    dl.rounded_rectangle((90, 420, 470, 900), 40, fill=RED, outline=WHITE, width=10)
    outlined(dl, (280, 560), "FC", LIL[150], stroke=10)
    outlined(dl, (280, 740), "STUAT", LIL[96], stroke=8)
    dl.rounded_rectangle((610, 420, 990, 900), 40, fill=(70, 74, 92), outline=WHITE, width=10)
    outlined(dl, (800, 560), "3ª", LIL[150], stroke=10)
    outlined(dl, (800, 740), "DIVISIÓN", LIL[80], stroke=8)
    o = pop_layer(lay, 540, 600, ease_back(lt / 0.35))
    if o:
        img.alpha_composite(o)
    lay2 = Image.new("RGBA", (W, H))
    d2 = ImageDraw.Draw(lay2)
    outlined(d2, (540, 660), "VS", LIL[190], fill=YEL, stroke=16)
    o = pop_layer(lay2, 540, 660, ease_back((lt - 0.3) / 0.3), rot=-6)
    if o:
        img.alpha_composite(o)
    win = LINES["s09"][0] + (LINES["s09"][1] - LINES["s09"][0]) * 0.62 - scene_at(LINES["s09"][0])[0]
    if lt > win:
        lay3 = Image.new("RGBA", (W, H))
        d3 = ImageDraw.Draw(lay3)
        lay3.alpha_composite(card(700, 160, GREEN, border=WHITE), (178, 960))
        bob = 10 * math.sin((lt - win) * 9)
        d3.polygon([(270, 1080 + bob), (310, 1010 + bob), (350, 1080 + bob)], fill=WHITE)
        d3.rectangle((293, 1078 + bob, 327, 1110 + bob), fill=WHITE)
        outlined(d3, (580, 1048), "¡SUBIMOS!", LIL[120], stroke=10)
        o = pop_layer(lay3, 530, 1048, ease_back((lt - win) / 0.3))
        if o:
            img.alpha_composite(o)


def ov_end(img, lt, dur):
    meter(img, RAISED)


# ---------------------------------------------------------------- confetti / flash
rng = np.random.default_rng(7)
CONF = rng.random((90, 5))


def confetti(img, lt):
    d = ImageDraw.Draw(img)
    cols = [YEL, RED, (60, 160, 255), GREEN, WHITE]
    for i, (a, b, c, e, f) in enumerate(CONF):
        y = -50 + (lt * (500 + 500 * b) + c * 300)
        if y > H:
            continue
        x = a * W + 40 * math.sin(lt * 4 + e * 6)
        r = 9 + 8 * f
        d.rectangle((x - r, y - r / 2, x + r, y + r / 2), fill=cols[i % 5])


# ---------------------------------------------------------------- frame
def frame(t):
    s0, s1, a, b, name = scene_at(t)
    lt = t - s0
    dur = s1 - s0
    src_t = a + (b - a) * min(lt / dur, 1)
    if name == "vs":
        src_t = a + (lt % (b - a))
    bgr = clean(src_frame(src_t), name)
    if name == "vs":
        bgr = cv2.GaussianBlur(bgr, (0, 0), 7)
    # slow push-in so the reused footage feels new
    z = 1.0 + 0.05 * (lt / max(dur, 0.1))
    if name == "short" and lt > 0.85:
        z += 0.04 * ease_out((lt - 0.85) / 0.4)
    if z > 1.001:
        M = cv2.getRotationMatrix2D((W / 2, H * 0.55), 0, z)
        bgr = cv2.warpAffine(bgr, M, (W, H), borderMode=cv2.BORDER_REFLECT)
    if name == "short" and lt > 0.85:  # desaturate when the bad news lands
        g = cv2.cvtColor(cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR)
        k = 0.55 * ease_out((lt - 0.85) / 0.4)
        bgr = cv2.addWeighted(bgr, 1 - k, g, k, 0)
    img = Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)).convert("RGBA")

    if name == "hook":
        ov_hook(img, lt, t)
        if lt < 2.5:
            confetti(img, lt)
    elif name in ITEM:
        ov_item(img, lt, name, dur)
        if name == "lights":
            confetti(img, lt)
    elif name == "short":
        ov_short(img, lt, dur)
    elif name == "rates":
        ov_rates(img, lt)
    elif name == "name":
        ov_name(img, lt, dur)
        if lt > 2.0:
            confetti(img, lt - 2.0)
    elif name == "eleven":
        ov_eleven(img, lt, dur)
    elif name == "vs":
        ov_vs(img, lt, dur)
    elif name == "end":
        ov_end(img, lt, dur)

    subtitles(img, t, y=1370, bottom=1600 if name in ("name", "short") else 1490)

    # white flash on each cut
    if lt < 0.1 and s0 > 0:
        fl = Image.new("RGBA", (W, H), (255, 255, 255, int(170 * (1 - lt / 0.1))))
        img.alpha_composite(fl)
    # shake on the "FALTAN" stamp
    rgb = img.convert("RGB")
    if name == "short" and 0.85 < lt < 1.15:
        k = (1.15 - lt) / 0.3
        rgb = rgb.transform((W, H), Image.AFFINE, (1, 0, 14 * k * math.sin(lt * 90), 0, 1, 10 * k * math.cos(lt * 70)))
    if t > TOTAL - 0.4:  # fade to the loop
        a = (t - (TOTAL - 0.4)) / 0.4
        rgb = Image.blend(rgb, Image.new("RGB", (W, H)), a * 0.6)
    return rgb


def main():
    if PREVIEW:
        ts = [0.2, 0.9, 2.5, 4.2, 5.6, 6.9, 8.4, 9.9, 12.0, 14.5, 16.5, 19.5, 22.0, 24.3, 26.0, 28.0, 29.5, 31.5]
        thumbs = [frame(t).resize((360, 640)) for t in ts]
        sheet = Image.new("RGB", (360 * 6, 640 * 3))
        for i, th in enumerate(thumbs):
            ImageDraw.Draw(th).text((10, 10), f"{ts[i]:.1f}", fill=(0, 255, 255))
            sheet.paste(th, ((i % 6) * 360, (i // 6) * 640))
        sheet.save(OUT)
        return
    n = int(TOTAL * FPS)
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                          "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                          "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)
    for i in range(n):
        p.stdin.write(frame(i / FPS).tobytes())
        if i % 150 == 0:
            print(f"{i}/{n}", flush=True)
    p.stdin.close()
    p.wait()


if __name__ == "__main__":
    main()
