import planJson from "../data/scene-plan.json";
import { ZONES, ZoneName } from "../lyrics/Lyrics";
import { analysis, lineById, lines } from "./timing";

export type Transition = "iris" | "fan" | "blinds" | "slide" | "cut" | "flash" | "fade";
export type RawSegment = {
  at: string | number;
  scene: string;
  zone?: ZoneName;
  items?: Record<string, string>;
  variant?: string;
  bg?: string;
  transition?: Transition;
};
export type Segment = RawSegment & {
  index: number;
  start: number;
  end: number;
  zone: ZoneName;
  items: Record<string, string>;
  transition: Transition;
};

const LEAD = 0.45;
const resolveAt = (at: string | number) =>
  typeof at === "number" ? at : Math.max(0, (lineById[at]?.start ?? 0) - LEAD);

const raw = (planJson as { segments: RawSegment[] }).segments;
const starts = raw.map((s) => resolveAt(s.at));

export const segments: Segment[] = raw.map((s, i) => ({
  ...s,
  index: i,
  start: starts[i],
  end: i + 1 < raw.length ? starts[i + 1] : analysis.durationSec,
  zone: s.zone ?? "bottom",
  items: s.items ?? {},
  // eslint-disable-next-line @remotion/non-pure-animation -- scene transition type, not CSS
  transition: s.transition ?? "iris",
}));

export const segmentAt = (t: number) => {
  let k = 0;
  for (let i = 0; i < segments.length; i++) if (segments[i].start <= t) k = i;
  return segments[k];
};

/** Zone for a lyric line = zone of the segment it starts in. */
export const zoneOfLine = (i: number) => {
  const seg = segmentAt(lines[i].start);
  const style = lines[i].style;
  if (style === "hook") return { zone: ZONES.center };
  return { zone: ZONES[seg.zone] };
};

/** The most recent per-line item of a segment that has started by time t. */
export const currentItem = (seg: Segment, t: number) => {
  let name: string | undefined;
  let since = 0;
  let id: string | undefined;
  for (const [lineId, v] of Object.entries(seg.items)) {
    const st = (lineById[lineId]?.start ?? Infinity) - 0.3;
    if (st <= t && (id === undefined || st >= since)) {
      name = v;
      since = st;
      id = lineId;
    }
  }
  return { name, since, lineId: id, age: name ? t - since : 0 };
};

/** Current line id (latest started line) for gags keyed on lines. */
export const currentLineId = (t: number) => {
  let id: string | undefined;
  for (const l of lines) if (l.start - 0.3 <= t) id = l.id;
  return id;
};
