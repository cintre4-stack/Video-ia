"""Synthesises the kitchen sound effects and an original background loop (no samples).

    python3 scripts/make-kitchen-audio.py

Writes public/sfx/sizzle.wav, public/sfx/pop.wav, public/sfx/bubble.wav and
public/music/cocina-loop.wav (16 bars at 124 bpm, loops seamlessly).
"""

import wave
from pathlib import Path

import numpy as np

SR = 44100
rng = np.random.default_rng(7)


def save(path: str, x: np.ndarray) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    x = x / max(1e-9, np.max(np.abs(x))) * 0.89
    data = (x * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print("wrote", path, f"{len(x) / SR:.2f}s")


def onepole_hp(x, a=0.97):
    y = np.zeros_like(x)
    prev_x = prev_y = 0.0
    for i, v in enumerate(x):
        prev_y = a * (prev_y + v - prev_x)
        prev_x = v
        y[i] = prev_y
    return y


# Sizzle: high-passed noise with random crackles, 6 s, loopable-ish.
n = SR * 6
noise = onepole_hp(rng.standard_normal(n), 0.9) * 0.25
crackle = np.zeros(n)
for pos in rng.integers(0, n - 400, 900):
    L = rng.integers(40, 300)
    crackle[pos : pos + L] += rng.standard_normal(L) * np.exp(-np.linspace(0, 6, L)) * rng.uniform(0.3, 1.0)
sizzle = noise * (0.7 + 0.3 * np.sin(np.linspace(0, 40, n))) + onepole_hp(crackle, 0.6)
fade = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (SR * 0.3))
save("public/sfx/sizzle.wav", sizzle * fade)

# Pop: quick pitch drop.
t = np.arange(int(SR * 0.12)) / SR
pop = np.sin(2 * np.pi * (900 * t - 2600 * t * t)) * np.exp(-t * 40)
save("public/sfx/pop.wav", pop)

# Bubble: a few rising blips.
out = np.zeros(int(SR * 1.2))
for k in range(7):
    s = int(rng.uniform(0, 1.0) * SR)
    t = np.arange(int(SR * 0.08)) / SR
    f0 = rng.uniform(300, 600)
    blip = np.sin(2 * np.pi * (f0 * t + 3000 * t * t)) * np.exp(-t * 50)
    out[s : s + len(blip)] += blip
save("public/sfx/bubble.wav", out)

# ---- Music: plucked melody + bass + shaker, C major, 124 bpm ----
BPM = 124
beat = 60 / BPM
bars = 16
total = int(SR * beat * 4 * bars)
mix = np.zeros(total)


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


def pluck(freq, dur, amp=0.3):
    # Karplus-Strong
    N = int(SR / freq)
    buf = rng.uniform(-1, 1, N)
    L = int(SR * dur)
    y = np.zeros(L)
    for i in range(L):
        y[i] = buf[i % N]
        buf[i % N] = 0.5 * (buf[i % N] + buf[(i + 1) % N]) * 0.996
    return y * amp


def add(sig, start_beat):
    s = int(start_beat * beat * SR)
    e = min(total, s + len(sig))
    mix[s:e] += sig[: e - s]


chords = [  # C  Am  F  G  (x4)
    (48, [60, 64, 67]),
    (45, [57, 60, 64]),
    (41, [57, 60, 65]),
    (43, [59, 62, 67]),
]
melody = [  # (beat offset within 2 bars, midi, length in beats)
    (0, 72, 0.5), (0.5, 74, 0.5), (1, 76, 1), (2, 79, 0.5), (2.5, 76, 0.5), (3, 74, 1),
    (4, 72, 0.5), (4.5, 69, 0.5), (5, 72, 1), (6, 74, 1.5), (7.5, 71, 0.5),
]
for bar in range(bars):
    root, chord = chords[bar % 4]
    b0 = bar * 4
    # bass on 1 and 3, fifth on 3
    add(pluck(midi(root - 12 + 12), beat * 1.8, 0.45), b0)
    add(pluck(midi(root + 7), beat * 1.8, 0.3), b0 + 2)
    # off-beat chord strums
    for off in (0.5, 1.5, 2.5, 3.5):
        for k, m in enumerate(chord):
            add(pluck(midi(m), beat * 0.6, 0.11), b0 + off + k * 0.015)
    # shaker on eighths
    for e in range(8):
        L = int(SR * 0.05)
        sh = onepole_hp(rng.standard_normal(L), 0.5) * np.exp(-np.linspace(0, 8, L)) * (0.06 if e % 2 else 0.035)
        add(sh, b0 + e * 0.5)
# melody on bars 4-15, every two bars, up an octave the second half
for phrase in range(2, 8):
    shift = 12 if phrase >= 6 else 0
    for off, m, ln in melody:
        add(pluck(midi(m + shift - 12), beat * ln * 1.4, 0.32), phrase * 8 + off)
save("public/music/cocina-loop.wav", mix)
