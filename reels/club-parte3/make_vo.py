"""Build vo/voice.wav + vo/timeline.json for Parte 3.

Piper (offline):   python3 make_vo.py piper <model.onnx> guion.json vo/
ElevenLabs take:   python3 make_vo.py take <voice.mp3> guion.json vo/
  (one take with all the lines; it is cut at the 11 longest silences, in order)

timeline.json = {"tl": {id: [start, end]}, "total": seconds}
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np

SR = 44100
FILTER = ("aresample=44100,highpass=f=90,equalizer=f=3000:t=q:w=1.2:g=4,equalizer=f=250:t=q:w=1:g=-2,"
          "acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=7,"
          "silenceremove=start_periods=1:start_threshold=-45dB,"
          "areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse")


def load(path, af=None):
    cmd = ["ffmpeg", "-v", "error", "-i", str(path)] + (["-af", af] if af else []) + \
          ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.check_output(cmd), np.float32).copy()


def write(out, voice, tl):
    out.mkdir(parents=True, exist_ok=True)
    total = len(voice) / SR + 0.6
    voice = np.concatenate([voice, np.zeros(int(0.6 * SR), np.float32)])
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                          str(out / "voice.wav")], stdin=subprocess.PIPE)
    p.communicate(voice.tobytes())
    (out / "timeline.json").write_text(json.dumps({"tl": tl, "total": round(total, 3)}, indent=1))
    print("total", round(total, 2), "s")


def piper(model, g, out):
    lead, parts, tl, t = 0.25, [], {}, 0.25
    parts.append(np.zeros(int(lead * SR), np.float32))
    with tempfile.TemporaryDirectory() as tmp:
        for lid, text in g["lines"]:
            wav = Path(tmp) / f"{lid}.wav"
            subprocess.run([sys.executable, "-m", "piper", "-m", model, "-f", str(wav), "--length-scale",
                            str(g.get("speed", {}).get(lid, 0.9)), "--sentence-silence", "0.2"],
                           input=text.encode(), check=True, capture_output=True)
            a = load(wav, FILTER)
            gap = g.get("gap", {}).get(lid, 0.12)
            if lid != g["lines"][0][0]:
                parts.append(np.zeros(int(gap * SR), np.float32))
                t += gap
            tl[lid] = [round(t, 3), round(t + len(a) / SR, 3)]
            parts.append(a)
            t += len(a) / SR
    write(out, np.concatenate(parts), tl)


def take(path, g, out):
    a = load(path)
    hop = SR // 100
    n = len(a) // hop
    rms = np.sqrt((a[:n * hop].reshape(n, hop) ** 2).mean(1))
    quiet = rms < max(rms.max() * 0.02, 1e-4)
    runs, i = [], 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            runs.append((i, j))
            i = j
        else:
            i += 1
    start = runs[0][1] if runs and runs[0][0] == 0 else 0
    end = runs[-1][0] if runs and runs[-1][1] == n else n
    inner = [r for r in runs if r[0] > start and r[1] < end]
    k = len(g["lines"]) - 1
    cuts = sorted(sorted(inner, key=lambda r: r[1] - r[0], reverse=True)[:k])
    bounds = [start] + [x for r in cuts for x in r] + [end]
    tl = {lid: [round(bounds[2 * i] / 100, 3), round(bounds[2 * i + 1] / 100, 3)]
          for i, (lid, _) in enumerate(g["lines"])}
    write(out, a, tl)


if __name__ == "__main__":
    mode, src, guion, out = sys.argv[1:5]
    g = json.loads(Path(guion).read_text())
    (piper if mode == "piper" else take)(src, g, Path(out))
