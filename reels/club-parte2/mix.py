"""Music bed + SFX + voice for "Mi nuevo club — Parte 2".

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
# a little silence for the "faltan" hit
a = int((L["s05"][0] + 0.9) * SR)
music[a:a + int(1.3 * SR)] *= np.linspace(0.15, 1, int(1.3 * SR)) ** 2
music *= 0.8

# ---------------- sfx
fx = np.zeros(N, np.float32)
S = {n: load(SFX / f"{n}.wav") for n in ["whoosh", "ding", "boom", "roar", "kick", "whistle", "crowd", "groan"]}
cuts = [L["s02"][0] - 0.12, L["s03"][0] - 0.06, L["s04"][0] - 0.06, L["s05"][0] - 0.2, L["s06"][0] - 0.15,
        L["s07"][0] - 0.15, L["s08"][0] - 0.15, L["s09"][0] - 0.05, L["s10"][0] - 0.15]
for c in cuts:
    add(fx, S["whoosh"], c - 0.12, 0.55)
add(fx, S["roar"], 0.0, 0.5)
add(fx, S["ding"], 1.1 + 0.0, 0.7)                         # $900 stamp
for c in cuts[:3]:
    add(fx, S["ding"], c + 0.15, 0.8)                      # each ✓
add(fx, S["roar"], cuts[2] + 0.2, 0.35)
add(fx, S["boom"], cuts[3] + 0.85, 0.9)                    # FALTAN $1.500
add(fx, S["groan"], cuts[3] + 1.0, 0.35)
s07 = L["s07"]
add(fx, S["roar"], s07[0] + (s07[1] - s07[0]) * 0.45, 0.6)  # FC Stuat
add(fx, S["ding"], s07[0] + (s07[1] - s07[0]) * 0.5, 0.7)
s08 = L["s08"]
st = s08[0] + (s08[1] - s08[0]) * 0.35
for i in range(11):
    add(fx, S["kick"], st + i * 0.17, 0.5)                  # each shirt
add(fx, S["whistle"], cuts[7] + 0.1, 0.5)
s09 = L["s09"]
add(fx, S["roar"], s09[0] + (s09[1] - s09[0]) * 0.62, 0.55)
crowd = S["crowd"][: int(TOTAL * SR)]
add(fx, crowd, 0, 0.12)
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
