import planJson from "../data/scene-plan.json";
import { buildGroups, Group, LyricLayout } from "../lyrics/Lyrics";
import { analysis, lineById, lines } from "./timing";

export type Transition = "cut" | "wipe" | "glitch" | "flash" | "fade";
type RawSegment = {
  at: string | number;
  scene: string;
  lyric?: string | LyricLayout;
  items?: Record<string, string>;
  variant?: string;
  transition?: Transition;
};
export type Segment = Omit<RawSegment, "lyric"> & {
  index: number;
  start: number;
  end: number;
  lyric: LyricLayout;
  items: Record<string, string>;
  transition: Transition;
};

export const PRESETS: Record<string, LyricLayout> = {
  left: { kind: "block", x: 110, y: 300, w: 860, size: 84 },
  right: { kind: "block", x: 1000, y: 300, w: 820, size: 80 },
  top: { kind: "block", x: 110, y: 96, w: 1560, size: 84 },
  bottom: { kind: "block", x: 110, y: 790, w: 1700, size: 72 },
  center: { kind: "block", x: 160, y: 400, w: 1600, size: 104, align: "center" },
  log: { kind: "log", x: 80, y: 140, w: 1150, size: 52, paper: true },
  logDark: { kind: "log", x: 80, y: 140, w: 1150, size: 52 },
};
const SLAM: LyricLayout = { kind: "slam", x: 100, y: 330, w: 1720, size: 190 };

const LEAD = 0.45;
/** When a change keyed to line `id` may happen: shortly before it, but never while the previous line is still being sung. */
const switchTime = (id: string, lead: number) => {
  const l = lineById[id];
  if (!l) return Infinity;
  const i = lines.indexOf(l);
  const prev = lines[i - 1];
  const prevEnd = prev ? prev.words[prev.words.length - 1].e : 0;
  return Math.min(l.start - 0.05, Math.max(l.start - lead, prevEnd - 0.05));
};
const resolveAt = (at: string | number) => (typeof at === "number" ? at : Math.max(0, switchTime(at, LEAD)));

const raw = (planJson as unknown as { segments: RawSegment[] }).segments;
const starts = raw.map((s) => resolveAt(s.at));

export const segments: Segment[] = raw.map((s, i) => ({
  ...s,
  index: i,
  start: starts[i],
  end: i + 1 < raw.length ? starts[i + 1] : analysis.durationSec,
  lyric: typeof s.lyric === "object" ? s.lyric : PRESETS[s.lyric ?? "bottom"] ?? PRESETS.bottom,
  items: s.items ?? {},
  // eslint-disable-next-line @remotion/non-pure-animation -- scene transition type, not CSS
  transition: s.transition ?? "cut",
}));

export const segmentIndexAt = (t: number) => {
  let k = 0;
  for (let i = 0; i < segments.length; i++) if (segments[i].start <= t) k = i;
  return k;
};

export const groups: Group[] = buildGroups(segmentIndexAt);

export const layoutOfGroup = (g: Group): LyricLayout => {
  const first = lines[g.ids[0]];
  if (first.style === "hook") return SLAM;
  return segments[segmentIndexAt(first.start)].lyric;
};

/** The most recent per-line item of a segment that has started by time t. */
export const currentItem = (seg: Segment, t: number) => {
  let name: string | undefined;
  let since = -Infinity;
  for (const [lineId, v] of Object.entries(seg.items)) {
    const st = switchTime(lineId, 0.3);
    if (st <= t && st >= since) {
      name = v;
      since = st;
    }
  }
  return { name, age: name ? t - since : 0 };
};
