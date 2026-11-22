"""Music bed + SFX + voice for "Mi nuevo club — Parte 4".

    python3 mix.py <voice dir with timeline.json + voice.wav> <sfx dir> <video.mp4> <out.mp4>
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

VODIR, SFX, VIDEO, OUT = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3], sys.argv[4]
SR = 44100
TL = json.loads((VODIR / "timeline.json").read_text())
L, TOTAL = TL["tl"], TL["total"]
MK = TL.get("marks", {})
N = int(TOTAL * SR) + SR


def load(path):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).copy()


def add(buf, clip, t, gain):
    i = int(t * SR)
    if i >= len(buf):
        return
    clip = clip[: len(buf) - i]
    buf[i:i + len(clip)] += clip * gain


# ---------------- music bed: 118 bpm, major, bouncy
rng = np.random.default_rng(3)
music = np.zeros(N, np.float32)
bpm = 118
beat = 60 / bpm
tt = np.arange(int(0.35 * SR)) / SR
kick = np.sin(2 * np.pi * (50 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
hat = rng.standard_normal(int(0.05 * SR)) * np.exp(-np.arange(int(0.05 * SR)) / SR * 90)
hat = np.diff(hat, prepend=0)
clap = rng.standard_normal(int(0.18 * SR)) * np.exp(-np.arange(int(0.18 * SR)) / SR * 22)
prog = [(48, [60, 64, 67]), (55, [59, 62, 67]), (57, [60, 64, 69]), (53, [57, 60, 65])]  # C G Am F


def tone(f, dur, kind="pluck"):
    t = np.arange(int(dur * SR)) / SR
    w = np.sign(np.sin(2 * np.pi * f * t)) * 0.3 + np.sin(2 * np.pi * f * t) * 0.7
    env = np.exp(-t * (7 if kind == "pluck" else 2.5))
    return (w * env).astype(np.float32)


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


nbeats = int(TOTAL / beat) + 2
for b in range(nbeats):
    t = b * beat
    bar = (b // 4) % 4
    root, chord = prog[bar]
    add(music, kick, t, 0.55)
    if b % 2 == 1:
        add(music, clap, t, 0.18)
    add(music, hat, t + beat / 2, 0.22)
    add(music, tone(midi(root - 12) * 1, beat * 0.9, "bass"), t, 0.22)
    for k, n in enumerate(chord):  # arpeggio on 8ths
        add(music, tone(midi(n + 12), beat * 0.5), t + (k % 2) * beat / 2, 0.06)
def fr(k, f):
    return L[k][0] + (L[k][1] - L[k][0]) * f


# music: full on the celebration, almost gone while the stadium is empty, back when the fans arrive
cuts = [L[f"s{i:02d}"][0] - 0.12 for i in range(2, 11)]   # div2 empty nofans fill you mystery animal cta end
a, b = int(cuts[1] * SR), int(cuts[3] * SR)
music[a:b] *= 0.25
a, b = int(cuts[5] * SR), int(cuts[7] * SR)
music[a:b] *= 0.55                                          # mystery
music *= 0.8

# ---------------- sfx
fx = np.zeros(N, np.float32)
S = {n: load(SFX / f"{n}.wav") for n in ["whoosh", "ding", "boom", "roar", "kick", "whistle", "crowd", "groan",
                                         "heartbeat", "whistle-final"]}
for c in cuts:
    add(fx, S["whoosh"], c - 0.12, 0.5)
add(fx, S["roar"], 0.0, 0.5)
add(fx, S["ding"], 0.35, 0.8)                                       # $10.000
add(fx, S["ding"], cuts[0] + 0.2, 0.8)                              # 2ª DIVISIÓN
add(fx, S["roar"], cuts[0] + 0.2, 0.45)
add(fx, S["groan"], cuts[1] + 0.1, 0.4)                             # el problema
add(fx, S["boom"], cuts[2] + 0.25, 0.8)                             # 0 AFICIONADOS
dur = cuts[4] - cuts[3]
for i in range(8):                                                  # comments arriving
    add(fx, S["ding"], cuts[3] + 0.3 + i * dur * 0.6 / 8, 0.35)
crowd = S["crowd"]
a = cuts[3]
seg = crowd[: int((TOTAL - a) * SR)].copy()
seg *= np.linspace(0.05, 1.0, len(seg)) ** 1.5
add(fx, seg, a, 0.38)                                               # the stadium fills up
add(fx, S["roar"], cuts[3] + 0.6, 0.55)
add(fx, S["kick"], cuts[4] + 0.15, 0.6)                             # TÚ
add(fx, S["ding"], cuts[4] + 0.2, 0.7)
add(fx, S["heartbeat"], cuts[5], 0.7)                               # mystery
add(fx, S["boom"], cuts[5] + 0.3, 0.6)
add(fx, S["whistle"], cuts[6] + 0.1, 0.5)
add(fx, S["ding"], L["s08"][1] - 0.6, 0.8)                          # ¡OBVIO!
add(fx, S["roar"], L["s08"][1] - 0.6, 0.6)
add(fx, S["roar"], cuts[8] + 0.2, 0.5)
fx *= 0.55

voice = load(VODIR / "voice.wav")

tmp = Path(OUT).with_suffix("")
paths = {}
for name, arr in [("bed", music + fx), ("voice", voice)]:
    p = f"{tmp}_{name}.f32"
    np.asarray(arr, np.float32).tofile(p)
    paths[name] = p

subprocess.run([
    "ffmpeg", "-v", "error", "-y", "-i", VIDEO,
    "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", paths["bed"],
    "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", paths["voice"],
    "-filter_complex",
    "[2:a]asplit=2[v1][v2];"
    "[1:a][v1]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[bed];"
    "[bed][v2]amix=inputs=2:normalize=0:weights=1 1.35,loudnorm=I=-14:TP=-1.5[a]",
    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-shortest", OUT,
], check=True)
for p in paths.values():
    Path(p).unlink()
print("wrote", OUT)
