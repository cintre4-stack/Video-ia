"""Personaje chibi del reel 93:20 (src/Reel9320/Character.tsx) portado a PIL.

Mismas medidas del SVG original (viewBox -40 -60 280 400, pies en y=320),
dibujado a 2x y reducido para tener bordes suaves.
"""
import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

SS = 2
INK = (10, 15, 26)
WHITE = (255, 255, 255)
SKIN = {"light": (242, 201, 160), "tan": (227, 174, 127), "medium": (201, 139, 90), "dark": (122, 74, 46)}

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_TTF = os.path.join(_ROOT, "out", "fonts", "LilitaOne.ttf")
_fonts = {}


def lilita(size):
    if not os.path.exists(_TTF):
        from fontTools.ttLib import TTFont
        os.makedirs(os.path.dirname(_TTF), exist_ok=True)
        f = TTFont(os.path.join(_ROOT, "public", "fonts", "LilitaOne.woff2"))
        f.flavor = None
        f.save(_TTF)
    size = max(6, int(size))
    if size not in _fonts:
        _fonts[size] = ImageFont.truetype(_TTF, size)
    return _fonts[size]


# ------------------------------------------------------------ affine -------
def T(tx, ty):
    return np.array([[1, 0, tx], [0, 1, ty], [0, 0, 1]], float)


def S(sx, sy=None):
    return np.array([[sx, 0, 0], [0, sx if sy is None else sy, 0], [0, 0, 1]], float)


def R(deg, cx=0, cy=0):
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    return T(cx, cy) @ np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]], float) @ T(-cx, -cy)


class Pen:
    def __init__(self, d, M, k):
        self.d, self.M, self.k = d, M, k

    def sub(self, M2):
        return Pen(self.d, self.M @ M2, self.k)

    def tp(self, pts):
        a = np.asarray(pts, float)
        a = np.c_[a, np.ones(len(a))] @ self.M.T
        return [tuple(p) for p in a[:, :2]]

    def poly(self, pts, fill):
        self.d.polygon(self.tp(pts), fill=fill)

    def rrect(self, x, y, w, h, r, fill):
        r = min(r, w / 2, h / 2)
        pts = []
        for cx, cy, a0 in ((x + w - r, y + r, -90), (x + w - r, y + h - r, 0), (x + r, y + h - r, 90), (x + r, y + r, 180)):
            for i in range(7):
                a = math.radians(a0 + i * 15)
                pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
        self.poly(pts, fill)

    def ellipse_pts(self, cx, cy, rx, ry, n=40):
        return [(cx + rx * math.cos(2 * math.pi * i / n), cy + ry * math.sin(2 * math.pi * i / n)) for i in range(n)]

    def ellipse(self, cx, cy, rx, ry, fill):
        self.poly(self.ellipse_pts(cx, cy, rx, ry), fill)

    def ring(self, cx, cy, r, color, w):
        pts = self.tp(self.ellipse_pts(cx, cy, r, r, 60))
        self.d.line(pts + [pts[0]], fill=color, width=max(1, int(w * self.k)))

    def stroke(self, pts, color, w):
        p = self.tp(pts)
        ww = w * self.k
        self.d.line(p, fill=color, width=max(1, int(ww)), joint="curve")
        for q in (p[0], p[-1]):
            self.d.ellipse([q[0] - ww / 2, q[1] - ww / 2, q[0] + ww / 2, q[1] + ww / 2], fill=color)

    def path(self, spec, fill=None, stroke=None, w=0):
        """spec: 'M x y Q cx cy x y L x y Z' (absolute)."""
        tok = spec.replace(",", " ").split()
        pts, i, cur = [], 0, (0, 0)
        while i < len(tok):
            c = tok[i]; i += 1
            if c == "M" or c == "L":
                cur = (float(tok[i]), float(tok[i + 1])); i += 2; pts.append(cur)
            elif c == "Q":
                c1 = (float(tok[i]), float(tok[i + 1])); p2 = (float(tok[i + 2]), float(tok[i + 3])); i += 4
                for j in range(1, 13):
                    u = j / 12
                    pts.append(((1 - u) ** 2 * cur[0] + 2 * (1 - u) * u * c1[0] + u * u * p2[0],
                                (1 - u) ** 2 * cur[1] + 2 * (1 - u) * u * c1[1] + u * u * p2[1]))
                cur = p2
            elif c == "Z":
                pass
        if fill is not None:
            self.poly(pts, fill)
        if stroke is not None:
            self.stroke(pts, stroke, w)


# ---------------------------------------------------------- partes ---------
LEG_LEN = 74


def limb(p, x, y, angle, ln, color, hand):
    q = p.sub(R(angle, x, y))
    q.rrect(x - 10, y - 6, 20, ln * 0.55, 10, color)
    q.rrect(x - 8, y + ln * 0.4, 16, ln * 0.55, 8, hand)
    q.ellipse(x, y + ln, 10, 10, hand)


def leg(p, x, y, angle, kit, skin):
    q = p.sub(R(-angle, x, y))
    q.rrect(x - 11, y, 22, LEG_LEN * 0.45, 10, skin)
    q.rrect(x - 11, y + LEG_LEN * 0.38, 22, LEG_LEN * 0.55, 9, kit["socks"])
    q.ellipse(x + 8, y + LEG_LEN + 2, 18, 9, INK)


HAIR = {
    "buzz": "M 46 62 Q 52 16 100 14 Q 148 16 154 62 Q 128 38 100 38 Q 72 38 46 62 Z",
    "blond": "M 44 66 Q 44 8 100 8 Q 156 8 156 66 Q 140 34 100 32 Q 60 34 44 66 Z",
    "long": "M 40 100 Q 34 6 100 6 Q 166 6 160 100 Q 152 40 100 34 Q 48 40 40 100 Z",
    "short": "M 44 70 Q 40 6 100 6 Q 160 6 156 70 Q 150 40 128 34 Q 118 46 100 36 Q 84 46 72 34 Q 50 40 44 70 Z",
    "mohawk_base": "M 48 60 Q 54 20 100 16 Q 146 20 152 60 Q 128 42 100 42 Q 72 42 48 60 Z",
    "mohawk_top": "M 84 30 Q 86 -6 100 -10 Q 114 -6 116 30 Q 100 24 84 30 Z",
    "curly": "M 42 76 Q 36 4 100 2 Q 164 4 158 76 Q 150 42 100 36 Q 50 42 42 76 Z",
    "beard": "M 58 86 Q 62 128 100 130 Q 138 128 142 86 Q 130 112 100 114 Q 70 112 58 86 Z",
}


def mix(c, a, bg=None):
    """Color c con opacidad a sobre bg (opaco). Sin bg devuelve rgba."""
    if bg is None:
        return tuple(c) + (int(255 * a),)
    return tuple(int(bg[i] * (1 - a) + c[i] * a) for i in range(3))


def hair_shape(p, hair, color, skin):
    if hair == "bald":
        return
    if hair == "buzz":
        p.path(HAIR["buzz"], fill=mix(color, 0.75, skin))
    elif hair == "mohawk":
        p.path(HAIR["mohawk_base"], fill=mix(color, 0.45, skin))
        p.path(HAIR["mohawk_top"], fill=color)
    elif hair == "blond":
        p.path(HAIR["blond"], fill=(244, 211, 94))
    elif hair == "curly":
        p.path(HAIR["curly"], fill=color)
        for i, cx in enumerate((48, 66, 84, 100, 116, 134, 152)):
            p.ellipse(cx, 6 if i % 2 else 16, 16, 16, color)
        p.ellipse(42, 44, 14, 14, color); p.ellipse(158, 44, 14, 14, color)
    elif hair == "long":
        p.path(HAIR["long"], fill=color)
    else:
        p.path(HAIR["short"], fill=color)


def eyes(p, mood, closed):
    if closed:
        p.path("M 70 78 Q 80 68 90 78", stroke=INK, w=5)
        p.path("M 110 78 Q 120 68 130 78", stroke=INK, w=5)
        return
    p.ellipse(80, 78, 8, 11, INK); p.ellipse(120, 78, 8, 11, INK)
    p.ellipse(83, 74, 3, 3, WHITE); p.ellipse(123, 74, 3, 3, WHITE)
    if mood in ("sad", "worried"):
        # cejas caidas hacia fuera
        p.stroke([(68, 62), (90, 54)], INK, 5)
        p.stroke([(110, 54), (132, 62)], INK, 5)
    elif mood == "shout":
        p.stroke([(68, 54), (90, 60)], INK, 5)
        p.stroke([(110, 60), (132, 54)], INK, 5)
    else:
        p.stroke([(70, 58), (90, 56)], INK, 5)
        p.stroke([(110, 56), (130, 58)], INK, 5)


def mouth(p, mood):
    if mood == "happy":
        p.path("M 82 98 Q 100 120 118 98 Z", fill=(122, 31, 31))
        p.path("M 82 98 Q 100 120 118 98 L 82 98", stroke=INK, w=3)
    elif mood == "shout":
        p.ellipse(100, 106, 16, 18, INK)
        p.ellipse(100, 106, 13, 15, (122, 31, 31))
    elif mood == "sad":
        p.path("M 84 110 Q 100 96 116 110", stroke=INK, w=5)
    elif mood == "worried":
        p.path("M 86 106 Q 93 100 100 106 Q 107 112 114 106", stroke=INK, w=4)
    else:
        p.stroke([(88, 104), (112, 104)], INK, 5)


def red_card(p, armR):
    q = p.sub(R(armR, 136, 146))
    hx, hy = 136, 146 + 58
    q.rrect(hx - 16, hy - 2, 32, 44, 5, INK)
    q.rrect(hx - 14, hy, 28, 40, 4, (227, 18, 27))


# ------------------------------------------------------------ main ---------
def draw_character(img, x, y, height=300, kit=None, skin=SKIN["light"], hair="short", hair_color=(43, 27, 16),
                   beard=False, pose="idle", mood="neutral", action=0.0, facing="right", frame=0.0, lift=0.0,
                   holding=None, back=False, gloves=None, head_tilt_extra=0.0):
    legL = legR = 0.0
    armL, armR = 18.0, -18.0
    bob = tilt = headTilt = 0.0
    cyc = math.sin(frame * 0.55)
    if pose == "idle":
        bob = math.sin(frame * 0.12) * 3
        armL = 14 + math.sin(frame * 0.12) * 3
        armR = -14 - math.sin(frame * 0.12) * 3
    elif pose == "wait":
        bob = math.sin(frame * 0.08) * 2
        armL, armR = 150, -150
        headTilt = math.sin(frame * 0.07) * 6
    elif pose == "run":
        legL, legR = cyc * 38, -cyc * 38
        armL, armR = -cyc * 45, cyc * 45
        bob = -abs(math.cos(frame * 0.55)) * 10
        tilt = 6
    elif pose == "walk":
        c2 = math.sin(frame * 0.3)
        legL, legR = c2 * 22, -c2 * 22
        armL, armR = 10 - c2 * 25, -10 + c2 * 25
        bob = -abs(math.cos(frame * 0.3)) * 5
    elif pose == "kick":
        wind = min(action / 0.45, 1)
        strike = max((action - 0.45) / 0.55, 0)
        legR = -45 * wind + 120 * strike
        legL = 6
        armL, armR = -50, 70
        tilt = -8 * strike + 4
    elif pose == "header":
        legL, legR = -20, 25
        armL, armR = 70, -70
        tilt = 10 + action * 25
        headTilt = action * 20
    elif pose == "celebrate":
        armL = 160 + math.sin(frame * 0.6) * 15
        armR = -160 - math.sin(frame * 0.6) * 15
        bob = -abs(math.sin(frame * 0.32)) * 40
        legL, legR = 18, -18
    elif pose == "sad":
        armL, armR = 6, -6
        headTilt, tilt, bob = 14, 4, 6
    elif pose == "slide":
        legL, legR = 85, 65
        armL, armR = -40, 120
        tilt, bob = -55, 60
    elif pose == "dive":
        armL, armR = 150, 120
        legL, legR = 20, -10
        tilt = -85 * action
        bob = -60 * math.sin(action * math.pi)
    if holding == "redcard":
        armR = -165
    headTilt += head_tilt_extra

    scale = height / 320
    k = scale * SS
    cw, ch = int(280 * k) + 2, int(400 * k) + 2
    can = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    d = ImageDraw.Draw(can, "RGBA")
    root = S(k) @ T(40, 60)
    if facing == "left":
        root = root @ T(200, 0) @ S(-1, 1)
    p = Pen(d, root, k)

    # sombra
    rx = 58 - min(lift + abs(bob), 120) * 0.2
    p.ellipse(100, 318, rx, 9, (0, 0, 0, 72))
    b = p.sub(T(0, bob) @ R(tilt, 100, 240))
    hand = gloves or skin
    limb(b, 64, 146, armL, 58, kit["shirt"], hand)
    leg(b, 86, 222, legL, kit, skin)
    leg(b, 114, 222, legR, kit, skin)
    b.rrect(64, 196, 72, 44, 12, kit["shorts"])
    # torso (patron recortado a mano dentro del rect redondeado)
    b.rrect(58, 128, 84, 82, 24, kit["shirt"])
    pat = kit.get("pattern")
    if pat == "stripes":
        for i in range(4):
            x0 = 66 + i * 22
            top = 128 + (8 if i in (0, 3) else 0)
            bot = 210 - (8 if i in (0, 3) else 0)
            b.poly([(x0, top), (x0 + 11, top), (x0 + 11, bot), (x0, bot)], kit["shirt2"])
    elif pat == "band":
        b.poly([(86, 129), (114, 129), (114, 209), (86, 209)], WHITE)
        b.poly([(91, 129), (109, 129), (109, 209), (91, 209)], kit["shirt2"])
    elif pat == "hoops":
        for i in range(4):
            b.poly([(60, 138 + i * 22), (140, 138 + i * 22), (140, 149 + i * 22), (60, 149 + i * 22)], kit["shirt2"])
    # contorno suave
    pts = []
    for cx, cy, a0 in ((118, 152, -90), (118, 186, 0), (82, 186, 90), (82, 152, 180)):
        for i in range(7):
            a = math.radians(a0 + i * 15)
            pts.append((cx + 24 * math.cos(a), cy + 24 * math.sin(a)))
    tp = b.tp(pts)
    d.line(tp + [tp[0]], fill=mix(INK, 0.25, kit["shirt"]), width=max(1, int(3 * k)))
    num = kit.get("number")
    numpos = None
    if num is not None:
        nx, ny = b.tp([(100, 196 if back else 186)])[0]
        numpos = (nx, ny, num, (kit.get("numberSize") or (54 if back else 38)) * k, kit.get("numberColor", WHITE))
    if not back:
        limb(b, 136, 146, armR, 58, kit["shirt"], hand)
    # cabeza
    h = b.sub(R(headTilt, 100, 120))
    h.rrect(90, 112, 20, 20, 2, skin)
    h.ellipse(100, 72, 56, 56, skin)
    if back:
        if hair == "bald":
            h.ellipse(100, 72, 56, 56, skin)
        else:
            col = (244, 211, 94) if hair == "blond" else hair_color
            h.path("M 44 92 Q 40 6 100 6 Q 160 6 156 92 Q 150 118 100 116 Q 50 118 44 92 Z", fill=col)
        h.ring(100, 72, 56, mix(INK, 0.18, hair_color if hair != "bald" else skin), 3)
        h.ellipse(44, 80, 8, 12, skin); h.ellipse(156, 80, 8, 12, skin)
    else:
        h.ring(100, 72, 56, mix(INK, 0.18, skin), 3)
        hair_shape(h, hair, hair_color, skin)
        if beard:
            h.path(HAIR["beard"], fill=mix(hair_color, 0.85, skin))
        h.ellipse(70, 92, 8, 8, mix((255, 138, 138), 0.35, skin))
        h.ellipse(130, 92, 8, 8, mix((255, 138, 138), 0.35, skin))
        eyes(h, mood, mood == "happy" and pose == "celebrate")
        mouth(h, mood)
    if back:
        limb(b, 136, 146, armR, 58, kit["shirt"], hand)
    if holding == "redcard":
        red_card(b, armR)
    if numpos:
        nx, ny, num, fs, col = numpos
        d.text((nx, ny), str(num), font=lilita(fs), fill=col, anchor="ms",
               stroke_width=max(1, int(2 * k)), stroke_fill=mix(INK, 0.35, kit["shirt"]))
    small = can.resize((max(1, cw // SS), max(1, ch // SS)), Image.LANCZOS)
    img.alpha_composite(small, (int(x - 140 * scale), int(y - 380 * scale - lift)))
