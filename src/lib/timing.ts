import timingJson from "../data/lyrics-timing.json";
import analysisJson from "../data/audio-analysis.json";

export type Word = { t: string; s: number; e: number; c: number; u?: boolean };
export type LineStyle =
  | "verse"
  | "prechorus"
  | "chorus"
  | "hook"
  | "punchline"
  | "response"
  | "spoken";
export type Line = {
  id: string;
  section: string;
  style: LineStyle;
  text: string;
  start: number;
  end: number;
  cue?: string;
  uncertain?: boolean;
  words: Word[];
};
export type Section = {
  id: string;
  name: string;
  kind: string;
  start?: number;
  end?: number;
};
export type Timing = {
  meta: { globalOffsetSec: number; method: string };
  sections: Section[];
  events: { type: string; text: string; t: number }[];
  lines: Line[];
};
export type Analysis = {
  bpm: number;
  beatOffsetSec: number;
  durationSec: number;
  hits: [number, number][];
  energy: { rate: number; v: number[] };
};

const raw = timingJson as unknown as Timing;
const off = raw.meta.globalOffsetSec || 0;

export const timing: Timing = {
  ...raw,
  lines: raw.lines.map((l) => ({
    ...l,
    start: l.start + off,
    end: l.end + off,
    words: l.words.map((w) => ({ ...w, s: w.s + off, e: w.e + off })),
  })),
};
export const analysis = analysisJson as unknown as Analysis;
export const lines = timing.lines;
export const lineById: Record<string, Line> = Object.fromEntries(
  lines.map((l) => [l.id, l]),
);

/** Index of the line being sung (or most recently sung) at time t. -1 before first line. */
export const lineIndexAt = (t: number) => {
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].start - 0.35 <= t) idx = i;
    else break;
  }
  return idx;
};

/** Beat number + phase (0..1) from the tempo analysis. */
export const beatAt = (t: number) => {
  const period = 60 / analysis.bpm;
  const x = (t - analysis.beatOffsetSec) / period;
  const n = Math.floor(x);
  return { n, phase: x - n, period };
};

/** 0..1 pulse that spikes on each beat and decays. */
export const beatPulse = (t: number, sharp = 6) =>
  Math.exp(-beatAt(t).phase * sharp);

const hits = analysis.hits;
/** Envelope of detected accent hits (brass stabs / snares) at time t. */
export const hitPulse = (t: number, decay = 0.22) => {
  let lo = 0;
  let hi = hits.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (hits[mid][0] <= t) lo = mid + 1;
    else hi = mid - 1;
  }
  let v = 0;
  for (let i = hi; i >= 0 && i > hi - 4; i--) {
    const dt = t - hits[i][0];
    if (dt > decay * 5) break;
    v = Math.max(v, hits[i][1] * Math.exp(-dt / decay));
  }
  return Math.min(1, v);
};

export const energyAt = (t: number) => {
  const e = analysis.energy;
  const i = Math.max(0, t * e.rate);
  const a = e.v[Math.min(e.v.length - 1, Math.floor(i))] ?? 0;
  const b = e.v[Math.min(e.v.length - 1, Math.ceil(i))] ?? 0;
  return a + (b - a) * (i - Math.floor(i));
};

/** How open the singer's mouth is at time t (0..1), from word timings. */
export const singing = (t: number) => {
  const i = lineIndexAt(t);
  if (i < 0) return 0;
  for (const l of [lines[i], lines[i + 1]]) {
    if (!l) continue;
    for (const w of l.words) {
      if (t >= w.s && t <= w.e + 0.04) {
        const p = (t - w.s) / Math.max(0.08, w.e - w.s);
        return (
          Math.sin(Math.PI * Math.min(1, p)) *
          (0.6 + 0.4 * Math.abs(Math.sin(t * 23)))
        );
      }
    }
  }
  return 0;
};

/** Start time of the first word in a line matching `re` (for timed gags). */
export const wordTime = (lineId: string, re: RegExp) => {
  const l = lineById[lineId];
  if (!l) return 0;
  return l.words.find((w) => re.test(w.t))?.s ?? l.start;
};

/** Start of a line, with a fallback. */
export const lineStart = (id: string, fallback = 0) =>
  lineById[id]?.start ?? fallback;
export const lineEnd = (id: string, fallback = 0) =>
  lineById[id]?.end ?? fallback;
