import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { accentA, C, F, hiA } from "../theme";
import { Line, lines, Word } from "../lib/timing";
import { clamp01, ease } from "../components/hud";

export type LyricKind = "block" | "log" | "path" | "slam";
export type LyricLayout = {
  kind: LyricKind;
  x: number;
  y: number;
  w: number;
  size: number;
  align?: "left" | "center" | "right";
  angle?: number;
  path?: string;
  paper?: boolean;
};

/** Words that stay pink after they're sung: the nouns the scenes are about. */
const ACCENT =
  /^(grandma'?s?|robot|paragraphs|prayer|rocking|chair|feelings|coffee|make|bucks|ducks|wedding|vows|cows|question|suggestion|information|potato|beep|boop|baby|show|code|overload|electricity|roll|printer|paper|nicole|thesis|sneezes|doctor|ex|cat|hack|possibly|recipe|eggs|flour|cheese|butter|sugar|milk|bread|water|conscious|real|feel|weather|moon|sky|laptop|slow|tabs|pornography|forty-five|tutor|therapist|tech|support|queen|search|bar|funny|quantum|physics|symphony|languages|mayonnaise|instrument|error|humanity|found|circuits|diva|anything|glasses|head|prose|wi-fi|fish|calorie|dish|chaotic|brain|explodes|broadway|techno|call|airplane|paul|sweet|message|received|sure|nope)$/i;
const isAccent = (w: string) => ACCENT.test(w.replace(/[^A-Za-z'-]/g, ""));

/* ---------- grouping: lines appear in couplets ---------- */
export type Group = { ids: number[]; start: number; end: number };
export const EXIT = 0.18;

export const buildGroups = (segOf: (t: number) => number): Group[] => {
  const groups: number[][] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const cur = groups[groups.length - 1];
    const prev = cur ? lines[cur[cur.length - 1]] : undefined;
    const solo = (x: Line) => x.style === "hook" || x.style === "punchline";
    const joinResponse = cur && l.style === "response" && cur.length <= 2;
    const canJoin =
      cur &&
      prev &&
      (joinResponse ||
        (cur.filter((k) => lines[k].style !== "response").length < 2 &&
          !solo(l) &&
          !solo(prev) &&
          segOf(l.start) === segOf(lines[cur[0]].start) &&
          l.start - prev.end < 2.5 &&
          cur.reduce((n, k) => n + lines[k].text.length, 0) + l.text.length < 90 &&
          !(prev.style === "response")));
    if (canJoin) cur.push(i);
    else groups.push([i]);
  }
  const out: Group[] = [];
  groups.forEach((ids, gi) => {
    const first = lines[ids[0]];
    const last = lines[ids[ids.length - 1]];
    const next = groups[gi + 1] ? lines[groups[gi + 1][0]] : undefined;
    const prevEnd = out.length ? out[out.length - 1].end : -Infinity;
    // wait for the previous couplet to finish leaving, but never start after the first word
    const start = Math.min(first.start - 0.12, Math.max(first.start - 0.35, prevEnd + EXIT * 0.5));
    const hold = last.style === "punchline" || last.style === "spoken" ? 1.8 : 1.2;
    const end = Math.min(last.end + hold, next ? next.start - 0.45 : Infinity);
    // never fade the final word while it is still being sung (short crossfade instead)
    const lw = last.words[last.words.length - 1];
    out.push({ ids, start, end: Math.max(end, Math.min(lw.e, lw.s + 0.5) - 0.02) });
  });
  return out;
};

/* ---------- word colouring ---------- */
const Glyphs: React.FC<{ w: Word; t: number; paper: boolean; mono: boolean }> = ({ w, t, paper, mono }) => {
  const unsung = paper ? C.paperDim : C.unsung;
  const done = paper ? C.paperInk : C.white;
  const dur = Math.max(0.1, w.e - w.s);
  const p = (t - w.s) / dur;
  const accent = isAccent(w.t);
  if (p < 0) return <span style={{ color: unsung }}>{w.t}</span>;
  if (p >= 1) {
    const col = accent ? C.pink : done;
    return (
      <span style={{ color: col, textShadow: paper ? undefined : accent ? `0 0 22px ${accentA(0.55)}` : `0 0 18px ${hiA(0.22)}` }}>{w.t}</span>
    );
  }
  // active: letters fill pink left → right
  const n = w.t.length;
  const filled = Math.ceil(clamp01(p * 1.15) * n);
  return (
    <span style={{ display: "inline-block", transform: `translateY(${-6 * Math.sin(Math.PI * clamp01(p))}px)`, textShadow: paper ? undefined : `0 0 24px ${accentA(0.7)}` }}>
      <span style={{ color: C.pink }}>{w.t.slice(0, filled)}</span>
      <span style={{ color: mono ? unsung : unsung }}>{w.t.slice(filled)}</span>
    </span>
  );
};

/* ---------- layouts ---------- */
export const fitSize = (layout: LyricLayout, texts: string[]) => {
  const longest = Math.max(...texts.map((s) => s.length));
  const cw = layout.kind === "log" ? 0.6 : 0.56;
  // allow wrapping into up to 3 rows per lyric line if it is very long
  let best = 0;
  for (const rows of [1, 2, 3]) {
    const s = Math.min(layout.size, (layout.w * rows) / (longest * cw * (rows === 1 ? 1 : 1.12)));
    best = s;
    if (s >= layout.size * (layout.kind === "log" ? 0.88 : 0.72)) break;
  }
  return best;
};

const BlockGroup: React.FC<{ g: Group; layout: LyricLayout; t: number }> = ({ g, layout, t }) => {
  const paper = !!layout.paper;
  const mono = layout.kind === "log";
  const size = fitSize(layout, g.ids.map((i) => (mono ? "# " : "") + lines[i].text));
  let wordIndex = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: layout.x,
        top: layout.y,
        width: layout.w,
        transform: layout.angle ? `rotate(${layout.angle}deg)` : undefined,
        transformOrigin: "0 0",
        textAlign: layout.align ?? "left",
        fontFamily: mono ? F.mono : F.sans,
        fontWeight: mono ? 400 : 800,
        fontSize: size,
        letterSpacing: mono ? 0 : "-0.025em",
        lineHeight: mono ? 1.45 : 1.06,
      }}
    >
      {g.ids.map((li) => {
        const l = lines[li];
        const response = l.style === "response";
        return (
          <div
            key={l.id}
            style={{
              marginBottom: mono ? 0 : size * 0.06,
              paddingLeft: response && !mono ? size * 0.6 : 0,
              // call-and-response punchlines land like a stamp
              transformOrigin: "0% 60%",
              transform: response ? `scale(${1 + 0.45 * (1 - ease((t - l.start + 0.05) / 0.22))}) rotate(${-2 * (1 - ease((t - l.start) / 0.3))}deg)` : undefined,
              fontWeight: response ? (mono ? 600 : 800) : undefined,
              fontSize: response ? "1.25em" : undefined,
            }}
          >
            {mono && <span style={{ color: response ? C.pink : paper ? C.paperDim : C.unsung }}>{response ? "→ " : "# "}</span>}
            {!mono && response && <span style={{ color: C.pink }}>→ </span>}
            {l.words.map((w, wi) => {
              const k = wordIndex++;
              const a = ease((t - g.start - k * 0.02) / 0.22);
              return (
                <span key={wi} style={{ display: "inline-block", opacity: a, transform: `translateY(${(1 - a) * 28}px)`, marginRight: "0.24em", whiteSpace: "nowrap" }}>
                  <Glyphs w={w} t={t} paper={paper} mono={mono} />
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/** Text that rides an SVG path (one lyric line). */
const PathGroup: React.FC<{ g: Group; layout: LyricLayout; t: number }> = ({ g, layout, t }) => {
  const l = lines[g.ids[0]];
  const id = `lp${l.id}`;
  const chars: { ch: string; color: string; dy: number; op: number }[] = [];
  let k = 0;
  l.words.forEach((w, wi) => {
    const dur = Math.max(0.1, w.e - w.s);
    const p = (t - w.s) / dur;
    const accent = isAccent(w.t);
    const txt = w.t + (wi < l.words.length - 1 ? " " : "");
    for (let c = 0; c < txt.length; c++) {
      const filled = p >= 1 || (p >= 0 && c < Math.ceil(clamp01(p * 1.15) * w.t.length));
      const color = p >= 1 ? (accent ? C.pink : C.white) : filled ? C.pink : C.unsung;
      const a = ease((t - g.start - k * 0.012) / 0.3);
      chars.push({ ch: txt[c], color, dy: (1 - a) * 30, op: a });
      k++;
    }
  });
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <path id={id} d={layout.path} />
      </defs>
      <text fontFamily={F.sans} fontWeight={800} fontSize={layout.size} letterSpacing={-1} style={{ filter: `drop-shadow(0 0 14px ${hiA(0.18)})` }}>
        <textPath href={`#${id}`} startOffset={layout.align === "center" ? "50%" : "0%"} textAnchor={layout.align === "center" ? "middle" : "start"}>
          {chars.map((c, i) => (
            <tspan key={i} fill={c.color} opacity={c.op}>
              {c.ch}
            </tspan>
          ))}
        </textPath>
      </text>
    </svg>
  );
};

/** Hook: each word lands huge, one after another. */
const SlamGroup: React.FC<{ g: Group; layout: LyricLayout; t: number }> = ({ g, layout, t }) => {
  const l = lines[g.ids[0]];
  return (
    <div
      style={{
        position: "absolute",
        left: layout.x,
        top: layout.y,
        width: layout.w,
        textAlign: "center",
        fontFamily: F.sans,
        fontWeight: 800,
        fontSize: layout.size,
        lineHeight: 0.95,
        letterSpacing: "-0.04em",
        textTransform: "uppercase",
      }}
    >
      {l.words.map((w, i) => {
        const dt = t - w.s;
        const q = clamp01(dt / 0.22) - 1;
        const k = 1 + 2.6 * q * q * q + 1.6 * q * q; // back-out: 0 → ~1.06 → 1
        const active = dt >= 0 && dt < Math.max(0.15, w.e - w.s);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.24em",
              opacity: dt < -0.02 ? 0 : 1,
              transform: `scale(${dt < 0 ? 0.75 : 0.75 + 0.25 * k})`,
              transformOrigin: "50% 70%",
              color: active ? C.pink : isAccent(w.t) ? C.pink : C.white,
              textShadow: active ? `0 0 40px ${accentA(0.9)}` : `0 0 24px ${hiA(0.25)}`,
            }}
          >
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

export const LyricLayer: React.FC<{ groups: Group[]; layoutOf: (g: Group) => LyricLayout; styleOf?: (g: Group) => React.CSSProperties; qa?: boolean }> = ({ groups, layoutOf, styleOf, qa }) => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  // QA mode: log the on-screen bounds of every lyric glyph run (read by scripts/qa/bounds.sh)
  useLayoutEffect(() => {
    if (!qa || !ref.current) return;
    const root = ref.current.getBoundingClientRect();
    const k = root.width > 0 ? 1920 / root.width : 1; // composition px per screen px
    const r = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
    ref.current.querySelectorAll("span,text").forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.width === 0) return;
      r.x0 = Math.min(r.x0, (b.left - root.left) * k);
      r.y0 = Math.min(r.y0, (b.top - root.top) * k);
      r.x1 = Math.max(r.x1, (b.right - root.left) * k);
      r.y1 = Math.max(r.y1, (b.bottom - root.top) * k);
    });
    const size = ref.current.querySelector("div[style*='font-size'], text");
    console.log(`QA-BOUNDS ${JSON.stringify({ f, ...r, font: size ? getComputedStyle(size).fontSize : null })}`);
  });
  const { fps } = useVideoConfig();
  const t = f / fps;
  const visible = groups.filter((g) => t >= g.start && t <= g.end + EXIT);
  return (
    <AbsoluteFill ref={ref} style={{ pointerEvents: "none" }}>
      {visible.slice(-2).map((g, k, shown) => {
        const layout = layoutOf(g);
        // an incoming couplet pushes the previous one up and out (teleprompter-style)
        const push = k === 0 && shown.length === 2 ? ease((t - shown[1].start) / 0.2) : 0;
        const out = Math.max(clamp01((t - g.end) / EXIT), push);
        const Comp = layout.kind === "path" ? PathGroup : layout.kind === "slam" ? SlamGroup : BlockGroup;
        return (
          <AbsoluteFill key={g.ids[0]} style={{ ...styleOf?.(g), opacity: (1 - out) * (1 - out), filter: out > 0 ? `blur(${out * 16}px)` : undefined, transform: `translateY(${-out * 60}px)` }}>
            <Comp g={g} layout={layout} t={t} />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
