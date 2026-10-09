"""Cross-validate lyric word timings with an independent recogniser (Zipformer, GigaSpeech).
Uses the cached vocal stem from scripts/align/transcribe.py. Run: python scripts/qa/crosscheck.py"""
import json, os, sys
import numpy as np
import sherpa_onnx
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "align"))
import align  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
M = os.path.join(ROOT, ".models", "sherpa-onnx-zipformer-gigaspeech-2023-12-12")
vocals = np.load(os.path.join(ROOT, ".cache", "vocals-44k.npy")).mean(axis=0)
n = int(len(vocals) * 16000 / 44100)
v16 = np.interp(np.linspace(0, len(vocals) - 1, n), np.arange(len(vocals)), vocals).astype(np.float32)
rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=f"{M}/encoder-epoch-30-avg-1.int8.onnx", decoder=f"{M}/decoder-epoch-30-avg-1.onnx",
    joiner=f"{M}/joiner-epoch-30-avg-1.int8.onnx", tokens=f"{M}/tokens.txt", num_threads=os.cpu_count() or 2)
sr, win, hop, t = 16000, 20.0, 13.0, -5.0  # window boundaries deliberately differ from transcribe.py
words, total = [], len(v16) / sr
while t < total:
    a, b = int(max(0, t) * sr), int(min(total, t + win) * sr)
    s = rec.create_stream(); s.accept_waveform(sr, v16[a:b]); rec.decode_stream(s)
    r = s.result; base = max(0, t)
    lo = 0 if t <= 0 else (win - hop) / 2
    hi = win if t + win >= total else win - (win - hop) / 2
    cur = None
    for tok, ts in zip(r.tokens, r.timestamps):
        if tok.startswith("▁") or tok.startswith(" ") or cur is None:
            if cur and lo <= cur["start"] - base < hi: words.append(cur)
            cur = {"word": tok.replace("▁", "").strip(), "start": base + ts}
        else:
            cur["word"] += tok
    if cur and lo <= cur["start"] - base < hi: words.append(cur)
    t += hop
words = [w for w in words if w["word"]]

timing = json.load(open(os.path.join(ROOT, "src", "data", "lyrics-timing.json")))
toks = [(li, wi, tk) for li, l in enumerate(timing["lines"]) for wi, w in enumerate(l["words"]) for tk in (align.norm_tokens(w["t"]) or ["_"])]
A = [(k, tk) for k, w in enumerate(words) for tk in align.norm_tokens(w["word"])]
m = align.align_seq([tk for *_, tk in toks], [tk for _, tk in A])
per_line, deltas, seen = {}, [], set()
for i, (j, sim) in m.items():
    li, wi, _ = toks[i]
    if (li, wi) in seen: continue
    seen.add((li, wi))
    w = timing["lines"][li]["words"][wi]
    d = words[A[j][0]]["start"] - w["s"]
    per_line.setdefault(li, []).append((d, w))
    if not w.get("u"): deltas.append(d)
d = np.array(deltas)
print(f"model B heard {len(words)} words; {len(seen)} lyric words cross-matched")
print(f"Δ start (B − ours) on confident words: median {np.median(d):+.3f}s, |Δ| median {np.median(abs(d)):.3f}s, 90th pct {np.percentile(abs(d), 90):.3f}s")
print("lines where the two models disagree (median |Δ| > 0.15 s) or B cannot confirm:")
for li, l in enumerate(timing["lines"]):
    ds = per_line.get(li, [])
    if not ds:
        print(f"  {l['id']} {l['start']:7.2f}s  NOT CONFIRMED by model B  {l['text'][:46]}")
        continue
    med = np.median([abs(x) for x, _ in ds])
    if med > 0.15:
        print(f"  {l['id']} {l['start']:7.2f}s  median |Δ| {med:.2f}s ({len(ds)}/{len(l['words'])} words)  {l['text'][:46]}  signed: " + " ".join(f"{x:+.2f}" for x, _ in ds))
# uncertain words that model B can place; --apply confirms the ones both models agree on (±0.12 s)
apply = "--apply" in sys.argv
for li, ds in per_line.items():
    for x, w in ds:
        if w.get("u"):
            ok = abs(x) <= 0.12
            print(f"  uncertain {timing['lines'][li]['id']} \"{w['t']}\" ours {w['s']:.2f}s, model B {w['s'] + x:.2f}s{'  → confirmed' if ok else ''}")
            if apply and ok:
                w.pop("u"); w["c"] = 0.6; w["confirmedBy"] = "zipformer"
if apply:
    for l in timing["lines"]:
        if l.get("uncertain") and sum(1 for w in l["words"] if w.get("u")) / len(l["words"]) <= 0.34:
            l.pop("uncertain")
    with open(os.path.join(ROOT, "src", "data", "lyrics-timing.json"), "w") as f:
        f.write(align.json_compact(timing))
    print("timing updated")
