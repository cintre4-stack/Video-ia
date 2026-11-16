"""Synthesizes original music and effects for the 1814 London beer-flood reel.

    python3 scripts/synth-pub-music.py

Writes public/music/pub.wav (2/4 oom-pah drinking song in G major, loopable)
and public/sfx/creak.wav, clang.wav, flood.wav. Pure numpy, royalty free.
"""

import wave
from pathlib import Path

import numpy as np

SR = 44100
rng = np.random.default_rng(1814)


def write(path, x):
    x = x / max(1e-9, np.max(np.abs(x))) * 0.89
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.stack([x, x], 1) * 32767).astype(np.int16).tobytes())


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def t_(d):
    return np.arange(int(d * SR)) / SR


def squeeze(freq, dur, amp=1.0):
    """Accordion-ish reed: two slightly detuned sawtooth-like voices."""
    t = t_(dur)
    s = np.zeros_like(t)
    for det in (1.0, 1.004):
        ph = 2 * np.pi * freq * det * t
        for h in range(1, 7):
            s += np.sin(h * ph) / h * (0.8 if h % 2 else 0.5)
    env = np.minimum(1, t / 0.02) * np.minimum(1, (dur - t) / 0.03).clip(0) * (0.85 + 0.15 * np.exp(-t * 6))
    return s * env * amp * 0.25


def tuba(freq, dur):
    t = t_(dur)
    ph = 2 * np.pi * freq * t
    s = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)
    return s * np.minimum(1, t / 0.015) * np.exp(-t * 5)


def chop(dur):
    t = t_(dur)
    return rng.standard_normal(len(t)) * np.exp(-t * 35) * 0.3 + 0.4 * np.sin(2 * np.pi * 180 * t) * np.exp(-t * 25)


def pub(bpm=116, bars=16):
    beat = 60 / bpm  # quarter note; 2/4 → 2 beats per bar, melody in eighths
    G = 67
    maj = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16]
    n = lambda d: G + maj[d]
    # melody: 4 eighths per bar
    A = [[0, 2, 4, 4], [5, 4, 2, 0], [1, 3, 5, 5], [4, 3, 1, -1],
         [0, 2, 4, 7], [7, 6, 5, 4], [3, 4, 5, 3], [1, 1, 0, -1]]
    B = [[4, 4, 5, 6], [7, 6, 5, 4], [3, 3, 4, 5], [6, 5, 4, 3],
         [4, 4, 5, 6], [7, 8, 7, 5], [4, 3, 2, 1], [0, 0, 0, -1]]
    chords = [0, 0, 4, 4, 0, 0, 4, 0, 3, 3, 4, 4, 3, 0, 4, 0]  # degree roots (I / IV / V)
    root = {0: 43, 3: 48, 4: 50}  # G2, C3, D3
    out = np.zeros(int(bars * 2 * beat * SR) + SR)
    for b, bar in enumerate((A + B)[:bars]):
        b0 = b * 2 * beat
        for i, deg in enumerate(bar):
            if deg < 0:
                continue
            st = int((b0 + i * beat / 2) * SR)
            note = squeeze(midi(n(deg)), beat / 2 * 0.92)
            out[st:st + len(note)] += note
        r = root[chords[b]]
        for k in range(2):  # oom on the beat, pah on the off-beat
            st = int((b0 + k * beat) * SR)
            o = tuba(midi(r if k == 0 else r + 7), beat * 0.45)
            out[st:st + len(o)] += o * 0.6
            st2 = int((b0 + k * beat + beat / 2) * SR)
            c = chop(beat * 0.3)
            out[st2:st2 + len(c)] += c
            for iv in (12, 16, 19):
                p = squeeze(midi(r + iv), beat * 0.25, 0.35)
                out[st2:st2 + len(p)] += p
    return out[: int(bars * 2 * beat * SR)]


def creak():
    t = t_(1.2)
    f = 90 + 40 * np.sin(2 * np.pi * 0.9 * t) + 25 * rng.standard_normal(len(t)).cumsum() / 400
    ph = 2 * np.pi * np.cumsum(f) / SR
    pulses = (np.sin(ph) > 0.6).astype(float)  # stick-slip clicks
    s = pulses * (0.6 + 0.4 * rng.standard_normal(len(t)))
    env = np.minimum(1, t / 0.1) * np.minimum(1, (1.2 - t) / 0.2)
    return np.convolve(s * env, np.ones(30) / 30, "same")


def clang():
    t = t_(1.8)
    s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in
            [(310, 1, 2.2), (821, 0.7, 3), (1347, 0.5, 4), (2011, 0.35, 5), (2760, 0.2, 7)])
    return s + rng.standard_normal(len(t)) * np.exp(-t * 60) * 0.5


def flood():
    t = t_(3.5)
    noise = rng.standard_normal(len(t))
    # crude low-pass by moving average, plus rumble
    lp = np.convolve(noise, np.ones(40) / 40, "same") * 4
    rumble = np.sin(2 * np.pi * (40 + 10 * np.sin(2 * np.pi * 0.7 * t)) * t)
    env = np.minimum(1, t / 0.25) * np.exp(-np.maximum(0, t - 1.2) * 1.1)
    return (lp + 0.6 * rumble + 0.3 * noise * np.exp(-t * 3)) * env


if __name__ == "__main__":
    write("public/music/pub.wav", pub())
    write("public/sfx/creak.wav", creak())
    write("public/sfx/clang.wav", clang())
    write("public/sfx/flood.wav", flood())
    print("ok")
