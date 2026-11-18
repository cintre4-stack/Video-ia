"""Synthesises the extra sound effects and the music bed for the GTA reel (numpy only).

    python3 scripts/sfx-gta.py   -> public/sfx/{rewind,ring,cash,glitch,bed-gta}.wav
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path("public/sfx")
rng = np.random.default_rng(7)


def save(name, x):
    x = np.clip(x / (np.max(np.abs(x)) + 1e-9) * 0.9, -1, 1)
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def t(sec):
    return np.arange(int(SR * sec)) / SR


def env(n, a=0.005, r=0.1):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


# VHS rewind: descending warbly sweep + tape hiss
tt = t(1.2)
f = np.linspace(1400, 180, tt.size) * (1 + 0.04 * np.sin(2 * np.pi * 9 * tt))
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.6 + rng.normal(0, 0.15, tt.size)
save("rewind.wav", x * env(tt.size, 0.01, 0.3))

# Phone ring: two 0.4 s bursts of 440+480 Hz, amplitude-modulated
parts = []
for _ in range(2):
    tb = t(0.4)
    b = (np.sin(2 * np.pi * 440 * tb) + np.sin(2 * np.pi * 480 * tb)) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 20 * tb)))
    parts += [b * env(tb.size, 0.005, 0.03), np.zeros(int(0.2 * SR))]
save("ring.wav", np.concatenate(parts))

# Cash register: click + bright bell (ka-ching)
tc = t(0.9)
click = rng.normal(0, 1, tc.size) * np.exp(-tc * 120)
bell = sum(np.sin(2 * np.pi * fr * tc) * a for fr, a in [(2093, 1), (2637, 0.6), (4186, 0.3)])
bell = np.where(tc > 0.12, bell * np.exp(-(tc - 0.12) * 5), 0)
save("cash.wav", click * 0.6 + bell)

# Glitch: bit-crushed noise bursts
tg = t(0.5)
g = np.sign(np.sin(2 * np.pi * 90 * tg)) * (rng.random(tg.size) > 0.4) * np.exp(-tg * 6)
save("glitch.wav", g + rng.normal(0, 0.2, tg.size) * np.exp(-tg * 8))

# Music bed: 8 s loop, synth-wave-ish (bass + pad + light hats), 100 BPM
bpm = 100
beat = 60 / bpm
bars = 4
dur = beat * 4 * bars
tb = t(dur)
x = np.zeros(tb.size)
chords = [(55.0, [220, 261.6, 329.6]), (43.65, [174.6, 220, 261.6]), (65.4, [261.6, 329.6, 392]), (49.0, [196, 246.9, 293.7])]
for i, (root, pad) in enumerate(chords):
    s0 = int(i * beat * 4 * SR)
    n = int(beat * 4 * SR)
    seg = tb[:n]
    for k in range(8):  # eighth-note bass
        a = int(k * beat / 2 * SR)
        ln = int(beat / 2 * SR)
        st = seg[:ln]
        x[s0 + a : s0 + a + ln] += 0.5 * np.sign(np.sin(2 * np.pi * root * st)) * np.exp(-st * 7)
    p = sum(np.sin(2 * np.pi * fr * seg + np.sin(2 * np.pi * 0.3 * seg)) for fr in pad) / 3
    x[s0 : s0 + n] += 0.35 * p * env(n, 0.3, 0.3)
for k in range(int(dur / (beat / 2))):  # hats
    a = int(k * beat / 2 * SR)
    ln = int(0.05 * SR)
    x[a : a + ln] += rng.normal(0, 0.12, ln) * np.exp(-np.arange(ln) / SR * 80)
for k in range(int(dur / beat)):  # soft kick
    a = int(k * beat * SR)
    ln = int(0.18 * SR)
    st = np.arange(ln) / SR
    x[a : a + ln] += 0.7 * np.sin(2 * np.pi * (50 + 80 * np.exp(-st * 30)) * st) * np.exp(-st * 18)
save("bed-gta.wav", x)
print("ok")
