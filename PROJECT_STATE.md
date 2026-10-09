# Digital Diva — project state

Animated kinetic lyric video (Remotion 4, React/TS), 1920×1080 @ 30 fps, full track (276.84 s / 8306 frames).

## Run
- Preview: `npm i` then `npm run dev` → open http://localhost:3000/DigitalDiva
- Timing debug overlay: in Studio props set `showTimingDebug: true` (shows current time and scene; uncertain words are `"u": true` in the timing JSON)
- Render: `npm run render` → `out/digital-diva.mp4` (H.264 + original audio). Short test: `npm run render:test`

## Where things live
- `src/data/lyrics-timing.json` — word timings (authority = recording). Edit `s`/`e` per word, or `meta.globalOffsetSec` to shift all.
- `src/data/scene-plan.json` — scene timeline: start line/second, scene, lyric zone, per-line props, transition.
- `src/data/audio-analysis.json` — tempo (128.8 BPM), beat phase, accent hits, energy (drives pulses/flashes).
- Style (v2, per user references): monochrome line-art diagrams + HUD annotations, hot-pink accent, no singer character.
  The glowing pink pixel stands in for the AI.
- `src/lyrics/Lyrics.tsx` — karaoke couplets: unsung grey → letters fill pink as sung → white (key nouns stay pink).
  Layouts: block, log (mono, paper), path (text rides an SVG curve), slam (hooks).
- `src/components/hud.tsx` — camera/parallax, grids, self-drawing strokes, dimension lines, anchors, HUD labels.
- `src/components/art.tsx` — monoline drawings (Grandma, cat, cow, couple, duck, phone, computer, printer, toaster…).
- `src/scenes/` — 21 scene components; `src/DigitalDiva.tsx` — assembly, wipe/glitch/flash transitions, audio.

## Alignment pipeline (local, open-source, no uploads)
`npm run align` (Python 3 + `pip install -r scripts/align/requirements.txt`, ffmpeg on PATH):
UVR-MDX vocal isolation → Parakeet-TDT 0.6B ASR (sherpa-onnx) → Needleman-Wunsch match to `lyrics.txt` → unmatched words placed on vocal activity and flagged `u: true`.
`scripts/align/overrides.json` pins lines the recogniser can't hear. Models download once to `.models/` (~720 MB).

## Status
- Done: full video, all 90 lines (incl. spoken), 33 scene segments, test render verified (audio corr 0.992, 23 ms AAC offset).
- Uncertain timings (23/515 words): BEEP!/BOOP! in all 3 hooks, "Ding-ding!" (L017), "HERE WE GO!" (L052), "numbers" (L027),
  "Click-clack, tick-tock" (L054), "Ba-da-bip, ba-da-boop" (L068), and L067 "ERROR. HUMANITY NOT FOUND." (manual 167.55–171.6 s; robotic voice not detectable in the vocal stem).
