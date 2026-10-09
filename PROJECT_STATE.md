# Digital Diva — project state

Animated kinetic lyric video (Remotion 4, React/TS), 1920×1080 @ 30 fps. Music fades from 4:15 and the video ends at 4:23.5
(7905 frames) — set by `outro` in `src/data/scene-plan.json`.

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
- Per-scene look (scene-plan.json): `palette` (neon, cyan, amber, blueprint, violet, lime, alert, paperPink/Blue/Green — CSS variables in `src/theme.ts`),
  `bg` pattern (grid, dots, blueprint, scan, iso, rings, hatch, aurora) and `gui` chrome (editor, window, terminal, dashboard, player).
- `src/components/hud.tsx` — camera/parallax, background patterns, self-drawing strokes, dimension lines, anchors, HUD labels.
- `src/components/gui.tsx` — interface chrome: title bars/tabs, rulers, toolbar, status bar, telemetry widget, media player.
- `src/components/art.tsx` — monoline drawings (Grandma, cat, cow, couple, duck, phone, computer, printer, toaster…).
- `src/scenes/` — 21 scene components; `src/DigitalDiva.tsx` — assembly, wipe/glitch/flash transitions, audio.

## Alignment pipeline (local, open-source, no uploads)
`npm run align` (Python 3 + `pip install -r scripts/align/requirements.txt`, ffmpeg on PATH):
UVR-MDX vocal isolation → Parakeet-TDT 0.6B ASR (sherpa-onnx) → Needleman-Wunsch match to `lyrics.txt` → unmatched words placed on vocal activity and flagged `u: true`.
`scripts/align/overrides.json` pins lines the recogniser can't hear. Models download once to `.models/` (~720 MB).

## QA
- `npm run qa` — static checks: every line on screen, every word fully visible while sung, no mid-line scene cuts,
  plan items inside their scenes, font floor. `npm run qa:bounds` — renders one frame per couplet and measures real text bounds.
- `python scripts/qa/crosscheck.py [--apply]` — second recogniser (Zipformer) cross-checks word times; `--apply` confirms agreed uncertain words.
- `python scripts/qa/video_check.py out/digital-diva.mp4` — durations, audio alignment start/end, blank/static frames, chorus energy.

## Status (QA pass, latest)
- 90/90 lines shown; 0 words fade while sung; 56/56 couplets inside 40px safe area; min lyric font 52px.
- Timing cross-check: 461/515 words confirmed by an independent model, median |Δ| 0.08 s, 90th pct 0.16 s.
- Render: 8306 frames, exit 0, no warnings; audio +0.023 s (AAC priming) at start and end; no static stretch ≥ 4 s;
  only near-black moment is the intentional 0.5 s CRT-off at 250.2 s; chorus motion 3.04 vs verse 2.48.
- Still uncertain (needs ears): BEEP!/BOOP! in L022 (65.1–65.6 s), L052 (130.2–130.8 s), L076 (215.9–216.3 s);
  L052 "WE GO!" (131.9–132.4 s); L023 "my" (67.5 s); L027 "numbers" (75.0 s); L054 "Click-clack, tick-tock" (134.7–135.0 s);
  L068 "Ba-da-bip, ba-da-boop" (200.0–201.5 s); L081 "I'm" (224.3 s); L067 "ERROR. HUMANITY NOT FOUND." placed by hand
  at 167.55–171.6 s (robotic voice not detectable). L017 opening "Ding-ding!" may not be sung in the recording.
