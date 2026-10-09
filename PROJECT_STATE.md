# Digital Diva — project state

Animated kinetic lyric video (Remotion 4, React/TS), 1920×1080 @ 30 fps, full track (276.84 s / 8306 frames).

## Run
- Preview: `npm i` then `npm run dev` → open http://localhost:3000/DigitalDiva
- Timing debug overlay: in Studio props set `showTimingDebug: true` (shows line ids, times, uncertain words dashed red)
- Render: `npm run render` → `out/digital-diva.mp4` (H.264 + original audio). Short test: `npm run render:test`

## Where things live
- `src/data/lyrics-timing.json` — word timings (authority = recording). Edit `s`/`e` per word, or `meta.globalOffsetSec` to shift all.
- `src/data/scene-plan.json` — scene timeline: start line/second, scene, lyric zone, per-line props, transition.
- `src/data/audio-analysis.json` — tempo (128.8 BPM), beat phase, accent hits, energy (drives pulses/flashes).
- `src/lyrics/Lyrics.tsx` — reusable kinetic text: verse / prechorus / chorus (neon tubes) / hook (Monoton burst) / punchline (slam plate) / response (stamp) / spoken (smoky blur).
- `src/components/characters/` — Diva (poses w/ 2-bone IK, expressions, lip-sync from word timings), Grandma, Cat, Cow, Couple.
- `src/components/props/Props.tsx` — ~36 illustrated joke props. `src/components/deco/Deco.tsx` — camera/parallax, sunbursts, gears, circuits, curtains, floors, etc.
- `src/scenes/` — 18 scene components; `src/DigitalDiva.tsx` — assembly, Art Deco transitions, overlays, audio.

## Alignment pipeline (local, open-source, no uploads)
`npm run align` (Python 3 + `pip install -r scripts/align/requirements.txt`, ffmpeg on PATH):
UVR-MDX vocal isolation → Parakeet-TDT 0.6B ASR (sherpa-onnx) → Needleman-Wunsch match to `lyrics.txt` → unmatched words placed on vocal activity and flagged `u: true`.
`scripts/align/overrides.json` pins lines the recogniser can't hear. Models download once to `.models/` (~720 MB).

## Status
- Done: full video, all 90 lines (incl. spoken), 34 scene segments, test render verified (audio corr 0.992, 23 ms AAC offset).
- Uncertain timings (23/515 words): BEEP!/BOOP! in all 3 hooks, "Ding-ding!" (L017), "HERE WE GO!" (L052), "numbers" (L027),
  "Click-clack, tick-tock" (L054), "Ba-da-bip, ba-da-boop" (L068), and L067 "ERROR. HUMANITY NOT FOUND." (manual 167.55–171.6 s; robotic voice not detectable in the vocal stem).
