"""Step 1 of lyric alignment (fully local, open-source models via sherpa-onnx).

  1. Decode the MP3 with ffmpeg.
  2. Isolate vocals with UVR-MDX-NET-Voc_FT (ONNX).
  3. Transcribe vocals with NVIDIA Parakeet-TDT 0.6B v2 (int8 ONNX) -> token timestamps.
  4. Write .cache/asr-words.json and .cache/vocal-envelope.json (100 Hz RMS of the vocal stem).

Usage: python scripts/align/transcribe.py [path/to/audio.mp3]
Models are downloaded once into .models/ (see download_models()).
"""
import json, os, subprocess, sys, urllib.request, tarfile
import numpy as np
import sherpa_onnx

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODELS = os.path.join(ROOT, ".models")
CACHE = os.path.join(ROOT, ".cache")
REL = "https://github.com/k2-fsa/sherpa-onnx/releases/download"
UVR = os.path.join(MODELS, "UVR-MDX-NET-Voc_FT.onnx")
ASR = os.path.join(MODELS, "sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8")
THREADS = max(1, (os.cpu_count() or 2))


def download_models():
    os.makedirs(MODELS, exist_ok=True)
    if not os.path.exists(UVR):
        print("Downloading UVR vocal model...")
        urllib.request.urlretrieve(f"{REL}/source-separation-models/UVR-MDX-NET-Voc_FT.onnx", UVR)
    if not os.path.isdir(ASR):
        print("Downloading Parakeet ASR model (~650 MB)...")
        tmp = ASR + ".tar.bz2"
        urllib.request.urlretrieve(f"{REL}/asr-models/{os.path.basename(ASR)}.tar.bz2", tmp)
        with tarfile.open(tmp) as t:
            t.extractall(MODELS)
        os.remove(tmp)


def decode(path, sr, channels):
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", str(channels), "-ar", str(sr), "-"],
        check=True, capture_output=True).stdout
    return np.frombuffer(out, dtype=np.float32).reshape(-1, channels).T.copy()


def resample(x, sr_in, sr_out):
    n = int(len(x) * sr_out / sr_in)
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)


def separate(audio_path):
    vocals_path = os.path.join(CACHE, "vocals-44k.npy")
    if os.path.exists(vocals_path):
        return np.load(vocals_path)
    print("Separating vocals (UVR-MDX-NET)... this takes a few minutes on CPU")
    stereo = decode(audio_path, 44100, 2)
    cfg = sherpa_onnx.OfflineSourceSeparationConfig(
        model=sherpa_onnx.OfflineSourceSeparationModelConfig(
            uvr=sherpa_onnx.OfflineSourceSeparationUvrModelConfig(model=UVR), num_threads=THREADS))
    sep = sherpa_onnx.OfflineSourceSeparation(cfg)
    out = sep.process(sample_rate=44100, samples=stereo)
    vocals = np.asarray(out.stems[0].data, dtype=np.float32)  # (channels, samples)
    np.save(vocals_path, vocals)
    return vocals


def transcribe(v16):
    rec = sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=os.path.join(ASR, "encoder.int8.onnx"), decoder=os.path.join(ASR, "decoder.int8.onnx"),
        joiner=os.path.join(ASR, "joiner.int8.onnx"), tokens=os.path.join(ASR, "tokens.txt"),
        num_threads=THREADS, model_type="nemo_transducer")
    sr, win, hop = 16000, 24.0, 16.0  # overlapping windows; keep tokens from each window's centre
    words, t = [], 0.0
    total = len(v16) / sr
    while t < total:
        a, b = int(t * sr), int(min(total, t + win) * sr)
        s = rec.create_stream()
        s.accept_waveform(sr, v16[a:b])
        rec.decode_stream(s)
        r = s.result
        keep_lo = 0 if t == 0 else (win - hop) / 2
        keep_hi = win if t + win >= total else win - (win - hop) / 2
        cur = None
        for tok, ts in zip(r.tokens, r.timestamps):
            if tok.startswith(" ") or tok.startswith("▁") or cur is None:
                if cur and keep_lo <= cur["start"] - t < keep_hi:
                    words.append(cur)
                cur = {"word": tok.replace("▁", "").strip(), "start": round(t + ts, 3)}
            else:
                cur["word"] += tok
        if cur and keep_lo <= cur["start"] - t < keep_hi:
            words.append(cur)
        print(f"  {t:6.1f}s: {r.text[:90]}")
        t += hop
    words = [w for w in words if w["word"]]
    for i, w in enumerate(words):  # end = next start, capped
        nxt = words[i + 1]["start"] if i + 1 < len(words) else w["start"] + 0.6
        w["end"] = round(min(nxt, w["start"] + 0.9), 3)
    return words


def main():
    audio = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "public", "audio", "digital-diva.mp3")
    os.makedirs(CACHE, exist_ok=True)
    download_models()
    vocals = separate(audio)
    mono = vocals.mean(axis=0)
    v16 = resample(mono, 44100, 16000)
    # 100 Hz RMS envelope of the vocal stem (used to place words the ASR missed)
    hop = 441
    n = len(mono) // hop
    env = np.sqrt((mono[: n * hop].reshape(n, hop) ** 2).mean(axis=1))
    env = env / (np.percentile(env, 99) + 1e-9)
    json.dump({"rate": 100, "rms": [round(float(x), 3) for x in env]}, open(os.path.join(CACHE, "vocal-envelope.json"), "w"))
    print("Transcribing vocals (Parakeet-TDT)...")
    words = transcribe(v16)
    json.dump(words, open(os.path.join(CACHE, "asr-words.json"), "w"), indent=0)
    print(f"Wrote {len(words)} recognised words to .cache/asr-words.json")


if __name__ == "__main__":
    main()
