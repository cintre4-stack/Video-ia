"""Synthesizes the original background music for the 1518 dancing-plague reel.

    python3 scripts/synth-medieval-jig.py

Writes public/music/jig.wav (a 6/8 pipe-and-tabor jig in D dorian, loopable),
public/music/drone.wav (dark hurdy-gurdy style drone) and public/sfx/scratch.wav.
Everything is generated from scratch with numpy, so it is royalty free.
"""

import wave
from pathlib import Path

import numpy as np

SR = 44100
rng = np.random.default_rng(1518)


def write(path: str, x: np.ndarray) -> None:
    x = x / max(1e-9, np.max(np.abs(x))) * 0.89
    stereo = np.stack([x, x], axis=1)
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((stereo * 32767).astype(np.int16).tobytes())


def midi(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


def pipe(freq: float, dur: float) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t * 6, 0, 1)
    ph = 2 * np.pi * freq * np.cumsum(vib) / SR
    # fife-ish: fundamental + odd harmonics + breath noise
    s = np.sin(ph) + 0.35 * np.sin(3 * ph) + 0.12 * np.sin(5 * ph) + 0.25 * np.sin(2 * ph)
    s += 0.04 * rng.standard_normal(len(t))
    env = np.minimum(1, t / 0.012) * np.exp(-t * 1.2) * np.minimum(1, (dur - t) / 0.02).clip(0)
    return s * env


def drum(dur: float, low: bool) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    if low:
        f = 70 + 60 * np.exp(-t * 30)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
        s += 0.3 * rng.standard_normal(len(t)) * np.exp(-t * 40)
    else:
        s = rng.standard_normal(len(t)) * np.exp(-t * 28) * 0.35  # tambourine-ish
        s += 0.15 * np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 30)
    return s


def jig(bpm: float = 132, bars: int = 16) -> np.ndarray:
    # 6/8: dotted-quarter beat at bpm; one eighth = beat / 3
    eighth = 60 / bpm / 3
    D = 62  # D4
    sc = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17]  # dorian degrees
    n = lambda d: D + sc[d] if d >= 0 else D - 12 + sc[d + 7]
    # Two 4-bar phrases (A, B) of 6 eighths each, scale-degree numbers.
    A = [
        [0, 2, 4, 4, 2, 0], [1, 3, 5, 5, 3, 1], [0, 2, 4, 7, 6, 4], [5, 3, 1, 0, 0, 0],
        [0, 2, 4, 4, 2, 0], [1, 3, 5, 5, 3, 1], [4, 5, 6, 7, 5, 3], [4, 2, 1, 0, 0, 0],
    ]
    B = [
        [7, 7, 6, 7, 8, 9], [8, 7, 6, 5, 4, 3], [4, 4, 3, 4, 5, 6], [5, 4, 3, 2, 1, 0],
        [7, 7, 6, 7, 8, 9], [8, 7, 6, 5, 4, 5], [6, 5, 4, 3, 2, 1], [0, 2, 1, 0, 0, 0],
    ]
    tune = (A + B)[:bars]
    total = int(bars * 6 * eighth * SR) + SR
    out = np.zeros(total)
    for b, bar in enumerate(tune):
        for i, deg in enumerate(bar):
            start = int((b * 6 + i) * eighth * SR)
            # merge held notes at the end of a phrase into one longer note
            if i > 0 and deg == bar[i - 1] and i >= 3 and bar[3:] == [bar[3]] * 3:
                continue
            length = eighth * (3 if i == 3 and bar[3:] == [bar[3]] * 3 else 1)
            note = pipe(midi(n(deg) + 12), length * 0.95)
            out[start:start + len(note)] += note * 0.55
            hit = drum(eighth * 0.9, low=i in (0, 3))
            out[start:start + len(hit)] += hit * (0.9 if i in (0, 3) else 0.45)
        # drone on D and A underneath
        start = int(b * 6 * eighth * SR)
        L = int(6 * eighth * SR)
        t = np.arange(L) / SR
        dr = 0.12 * (np.sin(2 * np.pi * midi(50) * t) + 0.6 * np.sin(2 * np.pi * midi(57) * t))
        out[start:start + L] += dr
    return out[: int(bars * 6 * eighth * SR)]


def drone(dur: float = 20) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for f, a in [(midi(38), 1), (midi(45), 0.6), (midi(50), 0.4), (midi(51), 0.15)]:
        ph = 2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.2 * t)
        s += a * (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph))
    s *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.25 * t)
    fade = np.minimum(1, t / 1.5) * np.minimum(1, (dur - t) / 1.5)
    return s * fade


def scratch() -> np.ndarray:
    dur = 0.55
    t = np.arange(int(dur * SR)) / SR
    noise = rng.standard_normal(len(t))
    # band-ish noise swept by modulating with a falling tone
    f = 900 * np.exp(-t * 3) + 120
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR)
    s = noise * 0.5 * tone + 0.6 * tone
    env = np.minimum(1, t / 0.01) * np.exp(-t * 4)
    return s * env


if __name__ == "__main__":
    write("public/music/jig.wav", jig())
    write("public/music/drone.wav", drone())
    write("public/sfx/scratch.wav", scratch())
    print("ok")
