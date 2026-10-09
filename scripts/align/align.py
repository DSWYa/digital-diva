"""Step 2 of lyric alignment: map lyrics.txt onto recognised words + analyse the beat.

Reads  lyrics.txt, .cache/asr-words.json, .cache/vocal-envelope.json, the MP3
Writes src/data/lyrics-timing.json   (hand-editable; the video reads this)
       src/data/audio-analysis.json  (tempo, beat phase, brass/accent hits, energy)

Every word gets {t: text, s: start, e: end, c: confidence}. Words the recogniser did
not hear are placed inside detected vocal activity between anchors and flagged u: true.
"""
import json, os, re, subprocess, sys
from datetime import datetime, timezone
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CACHE = os.path.join(ROOT, ".cache")
AUDIO = os.path.join(ROOT, "public", "audio", "digital-diva.mp3")

SECTION_KINDS = [("pre-chorus", "prechorus"), ("final chorus", "chorus"), ("chorus", "chorus"),
                 ("final verse", "verse"), ("verse", "verse"), ("bridge", "bridge"), ("intro", "intro"),
                 ("outro", "outro"), ("instrumental", "instrumental")]
PUNCH_CUES = ("music cuts out", "beat stop", "beat cut", "final beat stop", "whispered",
              "robotic voice", "exasperated", "robotic whisper")
SPOKEN_KINDS = {"intro", "bridge", "outro"}

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def num_words(n):
    if n < 20: return [ONES[n]]
    if n < 100: return [TENS[n // 10]] + ([ONES[n % 10]] if n % 10 else [])
    if n < 1000: return [ONES[n // 100], "hundred"] + (num_words(n % 100) if n % 100 else [])
    return [str(n)]


def norm_tokens(word):
    """Display word -> list of normalised match tokens."""
    w = word.lower().replace("’", "'")
    out = []
    for part in re.split(r"[-–—\s]+", w):
        part = re.sub(r"[^a-z0-9']", "", part).strip("'")
        if not part: continue
        if part.isdigit(): out += num_words(int(part))
        else: out.append(part)
    return out


def parse_lyrics(path):
    sections, lines, events = [], [], []
    section = {"name": "Intro", "kind": "intro"}
    pending_cues = []
    for raw in open(path, encoding="utf-8").read().splitlines():
        s = raw.strip()
        if not s: continue
        m = re.fullmatch(r"\[(.+)\]", s)
        if m:
            head = m.group(1)
            name = re.split(r"\s+[—–-]\s+", head)[0].strip()
            kind = next((k for key, k in SECTION_KINDS if name.lower().startswith(key)), None)
            if kind:
                section = {"name": name, "kind": kind, "direction": head}
                sections.append(dict(section, id=f"s{len(sections)}", lineIds=[]))
            if not kind or "drop" in head.lower() or "instrumental" in head.lower():
                pending_cues.append(head)
                events.append({"type": "cue", "text": head, "afterLine": len(lines) - 1})
            continue
        if re.fullmatch(r"\*[^*].*[^*]\*", s):  # *sfx*
            events.append({"type": "sfx", "text": s.strip("*"), "afterLine": len(lines) - 1})
            continue
        text = s.replace("**", "").replace("*", "")
        if not sections:
            sections.append(dict(section, id="s0", lineIds=[]))
        cue = " | ".join(pending_cues) if pending_cues else None
        pending_cues = []
        sec = sections[-1]
        style = {"prechorus": "prechorus", "chorus": "chorus", "verse": "verse"}.get(sec["kind"], "spoken")
        if cue and any(p in cue.lower() for p in PUNCH_CUES): style = "punchline"
        if text.upper().startswith("BEEP! BOOP!"): style = "hook"
        if len(text.split()) <= 2 and sec["kind"] == "verse" and lines and lines[-1]["text"].endswith('?"'):
            style = "response"
        if text.endswith("...Possibly."): style = "response"
        line = {"id": f"L{len(lines):03d}", "section": sec["id"], "style": style, "text": text}
        if cue: line["cue"] = cue
        sec["lineIds"].append(line["id"])
        lines.append(line)
    return sections, lines, events


def lev(a, b):
    if a == b: return 0
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def sim(a, b):
    return 1 - lev(a, b) / max(len(a), len(b), 1)


def align_seq(L, A):
    """Needleman-Wunsch: L, A lists of tokens. Returns dict lyricIdx -> (asrIdx, sim)."""
    n, m = len(L), len(A)
    GL, GA = -0.45, -0.25
    S = np.zeros((n + 1, m + 1)); P = np.zeros((n + 1, m + 1), dtype=np.int8)
    S[1:, 0] = GL * np.arange(1, n + 1); S[0, 1:] = GA * np.arange(1, m + 1); P[1:, 0] = 1; P[0, 1:] = 2
    simc = {}
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            k = (L[i - 1], A[j - 1])
            if k not in simc: simc[k] = sim(*k)
            d = S[i - 1, j - 1] + (2.2 * simc[k] - 1.1)
            u = S[i - 1, j] + GL; l = S[i, j - 1] + GA
            if d >= u and d >= l: S[i, j], P[i, j] = d, 0
            elif u >= l: S[i, j], P[i, j] = u, 1
            else: S[i, j], P[i, j] = l, 2
    res, i, j = {}, n, m
    while i > 0 or j > 0:
        p = P[i, j]
        if p == 0:
            s = simc[(L[i - 1], A[j - 1])]
            if s >= 0.5: res[i - 1] = (j - 1, s)
            i, j = i - 1, j - 1
        elif p == 1: i -= 1
        else: j -= 1
    return res


def syllables(tok):
    return max(1, len(re.findall(r"[aeiouy]+", tok)))


def main():
    sections, lines, events = parse_lyrics(os.path.join(ROOT, "lyrics.txt"))
    asr = json.load(open(os.path.join(CACHE, "asr-words.json")))
    env = json.load(open(os.path.join(CACHE, "vocal-envelope.json")))
    rms = np.array(env["rms"]); rate = env["rate"]
    voiced = rms > 0.06

    # flatten lyric match tokens
    toks = []  # (lineIdx, wordIdx, token)
    for li, ln in enumerate(lines):
        ln["words"] = [{"t": w} for w in ln["text"].split()]
        for wi, w in enumerate(ln["words"]):
            for t in norm_tokens(w["t"]) or ["_"]:
                toks.append((li, wi, t))
    A = []
    for k, w in enumerate(asr):
        for t in norm_tokens(w["word"]):
            A.append((k, t))
    match = align_seq([t for _, _, t in toks], [t for _, t in A])

    times = [None] * len(toks)
    for i, (j, s) in match.items():
        w = asr[A[j][0]]
        times[i] = [w["start"], w["end"], s]
    # fill unmatched runs using vocal activity between anchors
    dur = len(rms) / rate
    i = 0
    while i < len(toks):
        if times[i]: i += 1; continue
        j = i
        while j < len(toks) and not times[j]: j += 1
        t0 = times[i - 1][1] if i > 0 else max(0.0, (times[j][0] if j < len(toks) else dur) - 0.4 * (j - i) - 0.5)
        t1 = times[j][0] if j < len(toks) else min(dur, t0 + 0.45 * (j - i) + 0.5)
        if t1 - t0 > 0.45 * (j - i) * 2.5:  # long gap: hug the side nearer the lyric structure
            same_line_prev = i > 0 and toks[i - 1][0] == toks[i][0]
            if same_line_prev: t1 = t0 + 0.45 * (j - i) * 1.5
            else: t0 = t1 - 0.45 * (j - i) * 1.5
        w = np.array([syllables(toks[k][2]) for k in range(i, j)], float)
        a, b = int(t0 * rate), max(int(t0 * rate) + 1, int(t1 * rate))
        mask = voiced[a:b].astype(float)
        if mask.sum() < 0.3 * (b - a): mask = np.ones(b - a)
        cum = np.concatenate([[0], np.cumsum(mask)]); cum /= cum[-1]
        edges = np.concatenate([[0], np.cumsum(w)]) / w.sum()
        tt = [t0 + np.searchsorted(cum, e) / rate for e in edges]
        for k in range(i, j):
            times[k] = [tt[k - i], max(tt[k - i] + 0.08, tt[k - i + 1]), 0.0]
        i = j

    # manual overrides for lines the recogniser cannot hear
    ov = json.load(open(os.path.join(ROOT, "scripts", "align", "overrides.json")))
    for k, (li, wi, tok) in enumerate(toks):
        o = ov.get(lines[li]["id"])
        if not isinstance(o, dict): continue
        ks = [q for q, x in enumerate(toks) if x[0] == li]
        wts = np.array([syllables(toks[q][2]) for q in ks], float)
        edges = o["start"] + (o["end"] - o["start"]) * np.concatenate([[0], np.cumsum(wts)]) / wts.sum()
        pos = ks.index(k)
        times[k] = [edges[pos], edges[pos + 1], 0.0]
        lines[li]["manual"] = o.get("note", True)

    # collapse tokens back to display words
    for k, (li, wi, _) in enumerate(toks):
        w = lines[li]["words"][wi]
        s, e, c = times[k]
        if "s" not in w: w["s"], w["e"], w["c"] = s, e, c
        else: w["e"], w["c"] = e, min(w["c"], c)
    flat = [w for ln in lines for w in ln["words"]]
    for k, w in enumerate(flat):  # monotonic, no overlaps
        if k and w["s"] < flat[k - 1]["s"]: w["s"] = flat[k - 1]["s"] + 0.02
        if k + 1 < len(flat): w["e"] = min(w["e"], max(w["s"] + 0.06, flat[k + 1]["s"]))
        w["e"] = max(w["e"], w["s"] + 0.06)
        w["s"], w["e"], w["c"] = round(w["s"], 2), round(w["e"], 2), round(w["c"], 2)
        if w["c"] < 0.5: w["u"] = True
    for ln in lines:
        ln["start"], ln["end"] = ln["words"][0]["s"], ln["words"][-1]["e"]
        unc = sum(1 for w in ln["words"] if w.get("u")) / len(ln["words"])
        if unc > 0.34: ln["uncertain"] = True
    for sec in sections:
        ls = [l for l in lines if l["section"] == sec["id"]]
        if ls: sec["start"], sec["end"] = ls[0]["start"], ls[-1]["end"]
    for ev in events:
        k = ev.pop("afterLine")
        nxt = lines[k + 1]["start"] if k + 1 < len(lines) else dur
        prv = lines[k]["end"] if k >= 0 else 0
        ev["t"] = round(prv + min(0.3, (nxt - prv) / 2) if ev["type"] == "sfx" else (prv + nxt) / 2 if nxt - prv < 3 else prv + 0.4, 2)

    out = {
        "meta": {"audio": "audio/digital-diva.mp3", "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                 "method": "UVR-MDX vocal isolation + Parakeet-TDT ASR (sherpa-onnx) + Needleman-Wunsch lyric alignment; unmatched words placed on vocal activity (u: true)",
                 "globalOffsetSec": 0},
        "sections": sections, "events": events, "lines": lines,
    }
    os.makedirs(os.path.join(ROOT, "src", "data"), exist_ok=True)
    with open(os.path.join(ROOT, "src", "data", "lyrics-timing.json"), "w") as f:
        f.write(json_compact(out))
    analyse_audio()
    n_u = sum(1 for w in flat if w.get("u"))
    print(f"{len(lines)} lines, {len(flat)} words, {len(flat) - n_u} matched, {n_u} uncertain")
    for ln in lines:
        flag = "??" if ln.get("uncertain") else "  "
        print(f"{flag} {ln['start']:7.2f}-{ln['end']:7.2f} [{ln['style']:9}] {ln['text']}")


def json_compact(obj):
    """One line per lyric line / word list so the file stays hand-editable."""
    s = json.dumps(obj, indent=1, ensure_ascii=False)
    return re.sub(r'\{\s*"t": ([^{}]*?)\s*\}', lambda m: "{\"t\": " + re.sub(r"\s*\n\s*", " ", m.group(1)) + "}", s)


def probe_duration():
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", AUDIO],
                         check=True, capture_output=True, text=True).stdout
    return round(float(out.strip()), 3)


def analyse_audio():
    sr, hop = 22050, 512
    x = subprocess.run(["ffmpeg", "-v", "error", "-i", AUDIO, "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"],
                       check=True, capture_output=True).stdout
    x = np.frombuffer(x, np.float32)
    n = (len(x) - 2048) // hop
    idx = np.arange(2048)[None, :] + hop * np.arange(n)[:, None]
    spec = np.abs(np.fft.rfft(x[idx] * np.hanning(2048), axis=1))
    logs = np.log1p(spec * 10)
    flux = np.maximum(0, np.diff(logs, axis=0)).sum(axis=1)
    flux = np.concatenate([[0], flux]); flux /= flux.max() + 1e-9
    fr = sr / hop
    # tempo by autocorrelation of onset envelope (60-180 BPM), prefer 90-140
    o = flux - flux.mean()
    ac = np.correlate(o, o, "full")[len(o) - 1:]
    lags = np.arange(int(fr * 60 / 180), int(fr * 60 / 60))
    w = np.exp(-0.5 * (np.log2((60 * fr / lags) / 120) / 0.6) ** 2)
    lag = lags[np.argmax(ac[lags] * w)]
    y0, y1, y2 = ac[lag - 1], ac[lag], ac[lag + 1]  # parabolic refinement
    best = lag + 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2 + 1e-9)
    bpm = 60 * fr / best
    phases = np.arange(0, best, 0.25)
    scores = [np.interp(np.arange(p, len(flux), best), np.arange(len(flux)), flux).sum() for p in phases]
    offset = phases[int(np.argmax(scores))] / fr
    # accent hits: strong broadband onsets in the mid/high band (brass, snare, stabs)
    band = np.maximum(0, np.diff(logs[:, 40:400], axis=0)).sum(axis=1)
    band = np.concatenate([[0], band]); band /= np.percentile(band, 99.5) + 1e-9
    hits, last = [], -1
    thr = 0.55
    for k in range(1, len(band) - 1):
        t = k / fr
        if band[k] > thr and band[k] >= band[k - 1] and band[k] >= band[k + 1] and t - last > 0.25:
            hits.append([round(t, 2), round(float(min(1.5, band[k])), 2)]); last = t
    # loudness envelope 10 Hz
    rmsf = np.sqrt((x[: len(x) // 2205 * 2205].reshape(-1, 2205) ** 2).mean(axis=1))
    rmsf /= np.percentile(rmsf, 98) + 1e-9
    out = {"bpm": round(float(bpm), 2), "beatOffsetSec": round(float(offset), 3), "durationSec": probe_duration(),
           "hits": hits, "energy": {"rate": 10, "v": [round(float(min(1.2, v)), 2) for v in rmsf]}}
    json.dump(out, open(os.path.join(ROOT, "src", "data", "audio-analysis.json"), "w"), separators=(",", ":"))
    print(f"Tempo ~{bpm:.1f} BPM, beat offset {offset:.3f}s, {len(hits)} accent hits")


if __name__ == "__main__":
    main()
