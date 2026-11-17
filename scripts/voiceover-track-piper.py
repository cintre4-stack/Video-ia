"""Placeholder narration as ONE track (Piper), plus the second each line starts/ends.

    python3 scripts/voiceover-track-piper.py <model.onnx> guiones/<guion>.json public/voiceover/<dir>

Writes <dir>/voz.mp3 and prints the [id, start, end] anchors to paste into the reel's timeline.
Swap voz.mp3 for a real recording later and update the anchors.
"""
import json, subprocess, sys, tempfile
from pathlib import Path

GAP = 0.35
FILTER = ("aresample=44100,highpass=f=90,equalizer=f=3000:t=q:w=1.2:g=4,"
          "acompressor=threshold=-20dB:ratio=3:attack=5:release=80,"
          "silenceremove=start_periods=1:start_threshold=-45dB,"
          "areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse")

model, guion, out_dir = sys.argv[1:4]
data = json.loads(Path(guion).read_text())
out = Path(out_dir); out.mkdir(parents=True, exist_ok=True)
anchors, t, parts = [], 0.0, []
with tempfile.TemporaryDirectory() as tmp:
    for i, (line_id, text) in enumerate(data["lines"]):
        wav = Path(tmp) / f"{i}.wav"; clean = Path(tmp) / f"{i}c.wav"
        subprocess.run([sys.executable, "-m", "piper", "-m", model, "-f", str(wav), "--length-scale", "0.9",
                        "--sentence-silence", "0.2"], input=text.encode(), check=True, capture_output=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-af", FILTER, "-ar", "44100", "-ac", "1", str(clean)], check=True)
        d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(clean)]))
        anchors.append([line_id, round(t, 2), round(t + d, 2)])
        parts.append(str(clean)); t += d + GAP
    lst = Path(tmp) / "list.txt"
    sil = Path(tmp) / "gap.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", str(GAP), str(sil)], check=True)
    lst.write_text("".join(f"file '{p}'\nfile '{sil}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
                    "-af", "loudnorm=I=-16:TP=-1.5:LRA=7", "-ar", "44100", "-b:a", "160k", str(out / "voz.mp3")], check=True)
print(json.dumps(anchors))
