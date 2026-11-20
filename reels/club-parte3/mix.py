"""Music bed + SFX + voice for "Mi nuevo club — Parte 3".

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
def fr(k, f):
    return L[k][0] + (L[k][1] - L[k][0]) * f


# a little silence for the "$10.000" hit
a = int(fr("s10", 0.78) * SR)
music[a:a + int(1.3 * SR)] *= np.linspace(0.15, 1, int(1.3 * SR)) ** 2
# tension during the match: music drops, crowd carries it
a, b = int(L["s07"][0] * SR), int(fr("s08", 0.82) * SR)
music[a:b] *= 0.45
music *= 0.8

# ---------------- sfx
fx = np.zeros(N, np.float32)
S = {n: load(SFX / f"{n}.wav") for n in ["whoosh", "ding", "boom", "roar", "kick", "whistle", "crowd", "groan",
                                         "heartbeat", "whistle-final"]}
cuts = [L[f"s{i:02d}"][0] - 0.12 for i in range(2, 13)]
for c in cuts:
    add(fx, S["whoosh"], c - 0.12, 0.5)
add(fx, S["roar"], 0.0, 0.5)
for i in range(11):
    add(fx, S["kick"], L["s02"][0] + 0.15 + i * 0.12, 0.35)       # the 11 pop in
add(fx, S["ding"], fr("s03", 0.45), 0.8)                          # META COMPLETADA
add(fx, S["roar"], fr("s03", 0.45), 0.4)
add(fx, S["ding"], cuts[2] + 0.15, 0.8)                           # vestidores
add(fx, S["ding"], cuts[3] + 0.15, 0.8)                           # gradas
add(fx, S["roar"], cuts[3] + 0.3, 0.45)
add(fx, S["whistle"], cuts[4] + 0.3, 0.6)                         # kick-off
dur = cuts[6] - cuts[5]
for q in (0.08, 0.38, 0.68):                                      # three shots, three saves
    add(fx, S["kick"], cuts[5] + dur * q, 0.7)
    add(fx, S["groan"], cuts[5] + dur * (q + 0.17), 0.25)
add(fx, S["heartbeat"], L["s08"][0], 0.6)
add(fx, S["kick"], fr("s08", 0.7), 0.8)
add(fx, S["boom"], fr("s08", 0.82), 0.8)                          # GOOOL
add(fx, S["roar"], fr("s08", 0.82), 0.9)
add(fx, S["whistle-final"], cuts[7] + 0.1, 0.5)
add(fx, S["roar"], cuts[7] + 0.3, 0.6)
add(fx, S["boom"], fr("s10", 0.78), 0.8)                          # NECESITAMOS $10.000
add(fx, S["ding"], fr("s11", 0.05), 0.6)
add(fx, S["ding"], fr("s11", 0.5), 0.6)
crowd = S["crowd"][: int(TOTAL * SR)]
add(fx, crowd, 0, 0.12)
crowd2 = S["crowd"][: int((cuts[8] - cuts[4]) * SR)]
add(fx, crowd2, cuts[4], 0.25)                                    # stadium during the match
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
