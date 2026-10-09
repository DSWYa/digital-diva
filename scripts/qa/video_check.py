"""QA on the rendered MP4: durations, audio alignment at start/end, blank frames, static stretches,
chorus-vs-verse energy. Run: python scripts/qa/video_check.py out/digital-diva.mp4"""
import json, os, subprocess, sys
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
VID = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "out", "digital-diva.mp4")
SRC = os.path.join(ROOT, "public", "audio", "digital-diva.mp3")
FPS, Wd, Hd = 6, 96, 54

def probe(path):
    return json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path], capture_output=True, text=True, check=True).stdout)

def pcm(path, ss=0, t=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", str(ss), "-i", path] + (["-t", str(t)] if t else []) + ["-ac", "1", "-ar", "8000", "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32)

info, src = probe(VID), probe(SRC)
v = next(s for s in info["streams"] if s["codec_type"] == "video")
a = next(s for s in info["streams"] if s["codec_type"] == "audio")
src_dur = float(src["format"]["duration"])
print(f"video {v['codec_name']} {v['width']}x{v['height']} {v['r_frame_rate']} frames={v.get('nb_frames')} dur={float(v['duration']):.3f}s")
print(f"audio {a['codec_name']} {a['sample_rate']}Hz ch={a['channels']} start={float(a.get('start_time', 0)):.3f}s dur={float(a['duration']):.3f}s; source {src_dur:.3f}s")

def lag(x, y):  # offset of y inside x (seconds), and correlation
    best = (-1, 0)
    for k in range(0, len(x) - len(y), 4):
        seg = x[k:k + len(y)]
        c = float(np.dot(seg, y) / (np.linalg.norm(seg) * np.linalg.norm(y) + 1e-9))
        if c > best[0]: best = (c, k)
    return best[1] / 8000, best[0]

r_start, s_start = pcm(VID, 0, 12), pcm(SRC, 0, 12)
off, c = lag(np.concatenate([np.zeros(4000, np.float32), r_start]), s_start[4000:4000 + 8000 * 6])
print(f"audio start: render vs source offset {off - 1.0:+.3f}s (corr {c:.3f})")
end0 = src_dur - 12
r_end, s_end = pcm(VID, end0 - 0.5, 12.5), pcm(SRC, end0, 10)
off, c = lag(r_end, s_end)
print(f"audio end:   render vs source offset {off - 0.5:+.3f}s (corr {c:.3f}); render tail after source ends: {float(info['format']['duration']) - src_dur:+.3f}s")
rms_tail = np.sqrt(np.mean(pcm(VID, src_dur - 0.6, 0.6) ** 2))
print(f"last 0.6s of song present in render: rms {rms_tail:.4f}")

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", VID, "-vf", f"fps={FPS},scale={Wd}:{Hd}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, Hd, Wd, 3).astype(np.float32)
luma = fr.mean(axis=3)
mean, std = luma.mean(axis=(1, 2)), luma.std(axis=(1, 2))
diff = np.concatenate([[0], np.abs(np.diff(luma, axis=0)).mean(axis=(1, 2))])
pink = ((fr[..., 0] > 170) & (fr[..., 1] < 110) & (fr[..., 2] > 90)).mean(axis=(1, 2))
t = np.arange(len(fr)) / FPS

def runs(mask, min_len):
    out, s = [], None
    for i, m in enumerate(list(mask) + [False]):
        if m and s is None: s = i
        if not m and s is not None:
            if (i - s) / FPS >= min_len: out.append((s / FPS, i / FPS))
            s = None
    return out

print("near-blank stretches (≥0.5 s, almost uniform frame):")
for s, e in runs(std < 2.0, 0.5): print(f"  {s:7.2f}–{e:7.2f}s  mean luma {mean[int(s*FPS):int(e*FPS)].mean():.1f}")
print("static stretches (≥4 s with almost no pixel change):")
for s, e in runs(diff < 0.15, 4.0): print(f"  {s:7.2f}–{e:7.2f}s")

timing = json.load(open(os.path.join(ROOT, "src", "data", "lyrics-timing.json")))
kinds = {}
for sec in timing["sections"]:
    if "start" not in sec: continue
    m = (t >= sec["start"]) & (t <= sec["end"])
    kinds.setdefault(sec["kind"], []).append((diff[m].mean(), pink[m].mean(), mean[m].mean()))
print("energy by section kind (motion = mean frame diff, pink = share of accent pixels, luma):")
for k, vals in kinds.items():
    v_ = np.array(vals).mean(axis=0)
    print(f"  {k:10} motion {v_[0]:.2f}  pink {v_[1]*100:.2f}%  luma {v_[2]:.1f}")
