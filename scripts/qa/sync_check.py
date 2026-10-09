"""Audio-side QA: global lyric offset vs the isolated vocal, per-line drift, unmatched sung words.
Needs .cache/ from scripts/align/transcribe.py. Run: python scripts/qa/sync_check.py"""
import json, os, re, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "align"))
import align  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
env = json.load(open(os.path.join(ROOT, ".cache", "vocal-envelope.json")))
rms, rate = np.array(env["rms"]), env["rate"]
timing = json.load(open(os.path.join(ROOT, "src", "data", "lyrics-timing.json")))
words = [w for l in timing["lines"] for w in l["words"]]
onset = np.maximum(0, np.diff(np.convolve(rms, np.ones(3) / 3, "same"), prepend=0))

def score(lag, ws):
    idx = [int((w["s"] + lag) * rate) for w in ws]
    return np.mean([onset[max(0, i - 3):i + 4].max() for i in idx if 0 <= i < len(onset)])

sure = [w for w in words if not w.get("u")]
lags = np.arange(-0.25, 0.2501, 0.01)
sc = [score(l, sure) for l in lags]
best = lags[int(np.argmax(sc))]
print(f"global: best onset lag {best:+.2f}s (score {max(sc):.3f} vs {score(0, sure):.3f} at 0)")

print("per-line drift (lines whose own best lag differs from 0 by > 0.12 s):")
for l in timing["lines"]:
    ws = [w for w in l["words"] if not w.get("u")]
    if len(ws) < 3: continue
    s = [score(x, ws) for x in lags]
    b = lags[int(np.argmax(s))]
    if abs(b) > 0.12 and max(s) > 1.3 * score(0, ws):
        print(f"  {l['id']} {l['start']:7.2f}s lag {b:+.2f}s  {l['text'][:50]}")

# sung words the recogniser heard that match no lyric (possible missing / ad-lib lines)
sections, lines, _ = align.parse_lyrics(os.path.join(ROOT, "lyrics.txt"))
toks = [t for ln in lines for w in ln["text"].split() for t in (align.norm_tokens(w) or ["_"])]
asr = json.load(open(os.path.join(ROOT, ".cache", "asr-words.json")))
A = [(k, t) for k, w in enumerate(asr) for t in align.norm_tokens(w["word"])]
m = align.align_seq(toks, [t for _, t in A])
used = {A[j][0] for j, _ in m.values()}
run = []
print("recognised words not matched to lyrics.txt (runs of 2+):")
for k, w in enumerate(asr + [{"word": "", "start": 1e9}]):
    if k < len(asr) and k not in used:
        run.append(w)
    else:
        if len(run) >= 2:
            print(f"  {run[0]['start']:7.2f}s  {' '.join(x['word'] for x in run)}")
        run = []
