import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { beatPulse, Line, lines, Word } from "../lib/timing";

export type ZoneName = "bottom" | "top" | "left" | "right" | "center" | "upper" | "stage";
export type Zone = { x: number; y: number; w: number; h: number };
export const ZONES: Record<ZoneName, Zone> = {
  bottom: { x: 140, y: 770, w: 1640, h: 250 },
  top: { x: 140, y: 60, w: 1640, h: 250 },
  upper: { x: 140, y: 130, w: 1640, h: 300 },
  left: { x: 90, y: 230, w: 860, h: 620 },
  right: { x: 970, y: 230, w: 860, h: 620 },
  center: { x: 140, y: 290, w: 1640, h: 500 },
  stage: { x: 600, y: 110, w: 1240, h: 560 },
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const backOut = (x: number) => {
  const c = 1.9;
  const p = clamp01(x) - 1;
  return 1 + (c + 1) * p * p * p + c * p * p;
};

type StyleSpec = {
  font: string;
  upper: boolean;
  maxSize: number;
  charW: number;
  lead: number;
  gap: number;
};
const SPECS: Record<Line["style"], StyleSpec> = {
  verse: { font: F.verse, upper: false, maxSize: 96, charW: 0.5, lead: 0.3, gap: 0.26 },
  prechorus: { font: F.chorus, upper: true, maxSize: 104, charW: 0.6, lead: 0.25, gap: 0.24 },
  chorus: { font: F.chorus, upper: true, maxSize: 124, charW: 0.6, lead: 0.3, gap: 0.24 },
  hook: { font: F.neon, upper: true, maxSize: 190, charW: 0.95, lead: 0.12, gap: 0.2 },
  punchline: { font: F.deco, upper: false, maxSize: 118, charW: 0.56, lead: 0.12, gap: 0.24 },
  response: { font: F.chorus, upper: true, maxSize: 150, charW: 0.62, lead: 0.05, gap: 0.2 },
  spoken: { font: F.deco, upper: false, maxSize: 104, charW: 0.55, lead: 0.35, gap: 0.26 },
};

/** When each line is on screen: [in, out]. Exit animation runs for EXIT seconds after out. */
const EXIT = 0.25;
export const lineWindow = (i: number): [number, number] => {
  const l = lines[i];
  const next = lines[i + 1];
  const spec = SPECS[l.style];
  const tin = l.start - spec.lead;
  let tout = l.end + (l.style === "punchline" || l.style === "spoken" ? 1.6 : 1.0);
  if (next) {
    if (next.style === "response" && l.style !== "response") {
      const after = lines[i + 2];
      tout = Math.min(next.end + 0.5, after ? after.start - 0.15 : Infinity);
    } else {
      tout = Math.min(tout, next.start - SPECS[next.style].lead);
    }
  }
  return [tin, Math.max(tout, tin + 0.4)];
};

const fit = (text: string, spec: StyleSpec, zone: Zone, scale: number) => {
  const chars = text.length;
  const max = spec.maxSize * scale;
  const oneRow = zone.w / (chars * spec.charW);
  if (oneRow >= max * 0.82) return Math.min(max, oneRow);
  const twoRow = Math.min((zone.w * 2) / (chars * spec.charW * 1.08), zone.h / 2.5);
  if (twoRow >= max * 0.72 || zone.w >= 1000) return Math.min(max, twoRow);
  const threeRow = Math.min((zone.w * 3) / (chars * spec.charW * 1.12), zone.h / 3.4);
  return Math.min(max, Math.max(twoRow, threeRow));
};

const HOOK_COLORS = [C.pink, C.turquoise, C.goldLight, C.pink, C.turquoise, C.goldLight];

const WordSpan: React.FC<{
  w: Word;
  idx: number;
  t: number;
  style: Line["style"];
  spec: StyleSpec;
  debug: boolean;
}> = ({ w, idx, t, style, spec, debug }) => {
  const dt = t - w.s;
  const dur = Math.max(0.12, w.e - w.s);
  const active = dt >= 0 && dt <= dur + 0.05;
  const sung = dt >= 0;
  const text = spec.upper ? w.t.toUpperCase() : w.t;
  const base: React.CSSProperties = {
    display: "inline-block",
    marginRight: `${spec.gap}em`,
    whiteSpace: "nowrap",
    willChange: "transform",
    borderBottom: debug && w.u ? "4px dashed #ff4040" : undefined,
  };
  const outline = "0 3px 0 rgba(0,0,0,0.85), 0 0 22px rgba(0,0,0,0.75)";

  switch (style) {
    case "verse": {
      const k = easeOut(dt / 0.22);
      const bump = active ? Math.sin(Math.PI * clamp01(dt / 0.3)) : 0;
      return (
        <span
          style={{
            ...base,
            color: active ? C.goldLight : sung ? C.cream : "rgba(246,234,208,0.32)",
            transform: `translateY(${sung ? (1 - k) * 22 - bump * 6 : 0}px) scale(${1 + bump * 0.12})`,
            textShadow: active ? `0 0 18px ${C.gold}, ${outline}` : outline,
          }}
        >
          {text}
        </span>
      );
    }
    case "prechorus": {
      const k = easeOut(dt / 0.16);
      return (
        <span
          style={{
            ...base,
            opacity: sung ? 1 : 0.12,
            color: active ? C.pinkSoft : C.turquoise,
            transform: `perspective(600px) rotateX(${sung ? (1 - k) * 85 : 70}deg)`,
            textShadow: active ? `0 0 24px ${C.pink}, ${outline}` : `0 0 14px ${C.tealDark}, ${outline}`,
          }}
        >
          {text}
        </span>
      );
    }
    case "chorus": {
      const ignite = clamp01(dt / 0.12);
      const flicker = dt > 0 && dt < 0.14 ? (Math.floor(dt * 60) % 2 ? 0.5 : 1) : 1;
      const pop = sung ? 1 + (1 - easeOut(dt / 0.25)) * 0.16 : 1;
      const lit = sung ? flicker : 0;
      return (
        <span
          style={{
            ...base,
            color: lit ? "#fff7fb" : "transparent",
            WebkitTextStroke: lit ? `2px ${C.pink}` : `2px rgba(212,175,55,0.55)`,
            transform: `scale(${pop})`,
            opacity: sung ? 1 : 0.9,
            textShadow: lit
              ? `0 0 8px ${C.pink}, 0 0 26px ${C.pink}, 0 0 60px ${C.pink}, 0 4px 0 #3b0a2a`
              : "none",
            filter: ignite < 1 && sung ? `brightness(${1 + (1 - ignite)})` : undefined,
          }}
        >
          {text}
        </span>
      );
    }
    case "hook": {
      if (!sung) return <span style={{ ...base, opacity: 0 }}>{text}</span>;
      const k = backOut(dt / 0.3);
      const col = HOOK_COLORS[idx % HOOK_COLORS.length];
      return (
        <span
          style={{
            ...base,
            color: "#fff",
            transform: `scale(${2.4 - 1.4 * k}) rotate(${(1 - clamp01(dt / 0.3)) * (idx % 2 ? 14 : -14)}deg)`,
            opacity: clamp01(dt / 0.06),
            textShadow: `0 0 10px ${col}, 0 0 30px ${col}, 0 0 70px ${col}`,
          }}
        >
          {text}
        </span>
      );
    }
    case "punchline": {
      if (!sung) return <span style={{ ...base, opacity: 0 }}>{text}</span>;
      const k = easeOut(dt / 0.14);
      return (
        <span
          style={{
            ...base,
            color: active ? "#ffffff" : C.goldLight,
            transform: `scale(${2.3 - 1.3 * k}) rotate(${(1 - k) * -6}deg)`,
            opacity: clamp01(dt / 0.05),
            textShadow: `4px 4px 0 ${C.pink}, 8px 8px 0 ${C.tealDark}, 0 0 30px rgba(0,0,0,0.8)`,
          }}
        >
          {text}
        </span>
      );
    }
    case "response": {
      return (
        <span style={{ ...base, color: C.pinkSoft, textShadow: `0 0 20px ${C.pink}, ${outline}` }}>{text}</span>
      );
    }
    default: {
      // spoken: smoky blur-in
      const k = easeOut(dt / 0.4);
      return (
        <span
          style={{
            ...base,
            color: active ? "#fff4d6" : C.goldLight,
            opacity: sung ? k : 0,
            filter: `blur(${sung ? (1 - k) * 10 : 10}px)`,
            transform: `translateY(${sung ? (1 - k) * 14 : 14}px)`,
            textShadow: `0 0 16px rgba(212,175,55,0.6), ${outline}`,
          }}
        >
          {text}
        </span>
      );
    }
  }
};

/** One lyric line inside a zone, with entrance/exit treatment by style. */
export const LyricLine: React.FC<{
  line: Line;
  idx: number;
  zone: Zone;
  t: number;
  win: [number, number];
  offsetY?: number;
  sizeScale?: number;
  debug?: boolean;
}> = ({ line, zone, t, win, offsetY = 0, sizeScale = 1, debug = false }) => {
  const spec = SPECS[line.style];
  const size = fit(line.text, spec, zone, sizeScale);
  const enter = easeOut((t - win[0] - 0.1) / 0.25);
  const exit = clamp01((t - win[1]) / EXIT);
  const style = line.style;

  let transform = "";
  let opacity = 1;
  let filter: string | undefined;
  if (style === "chorus" || style === "hook") {
    const bounce = beatPulse(t, 7) * 6;
    transform = `translateY(${-bounce}px) scale(${1 + exit * 0.25})`;
    opacity = 1 - exit;
  } else if (style === "punchline") {
    transform = `translateY(${exit * 60}px)`;
    opacity = 1 - exit;
  } else if (style === "response") {
    const k = backOut((t - line.start + 0.05) / 0.22);
    transform = `rotate(-7deg) scale(${t < line.start - 0.05 ? 0 : 3 - 2 * k})`;
    opacity = t < line.start - 0.05 ? 0 : 1 - exit;
  } else if (style === "prechorus") {
    const p = clamp01((t - line.start) / Math.max(0.5, line.end - line.start));
    transform = `translateY(${(1 - enter) * 40 - exit * 70}px) scale(${0.96 + p * 0.08})`;
    opacity = enter * (1 - exit);
  } else {
    transform = `translateY(${(1 - enter) * 40 - exit * 70}px)`;
    opacity = enter * (1 - exit);
    filter = exit > 0 ? `blur(${exit * 8}px)` : undefined;
  }

  const plate =
    style === "punchline" ? (
      <div
        style={{
          position: "absolute",
          inset: "-24px -48px",
          border: `4px solid ${C.gold}`,
          outline: `2px solid ${C.gold}`,
          outlineOffset: 8,
          background: "linear-gradient(180deg, rgba(10,16,40,0.92), rgba(5,6,11,0.92))",
          transform: `scaleX(${easeOut((t - line.start + 0.1) / 0.2)})`,
          boxShadow: `0 0 40px rgba(255,47,160,0.45)`,
        }}
      />
    ) : style === "response" ? (
      <div
        style={{
          position: "absolute",
          inset: "-10px -30px",
          border: `8px solid ${C.pink}`,
          borderRadius: 14,
          background: "rgba(26,6,16,0.75)",
        }}
      />
    ) : null;

  return (
    <div
      style={{
        position: "absolute",
        left: zone.x,
        top: zone.y + offsetY,
        width: zone.w,
        height: zone.h,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "relative", transform, opacity, filter, maxWidth: zone.w }}>
        {!plate && (
          <div
            style={{
              position: "absolute",
              inset: "-50px -90px",
              background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(3,4,12,${style === "hook" ? 0.25 : 0.62}) 0%, rgba(3,4,12,${style === "hook" ? 0.1 : 0.4}) 55%, transparent 100%)`,
            }}
          />
        )}
        {plate}
        <div
          style={{
            position: "relative",
            fontFamily: spec.font,
            fontSize: size,
            fontWeight: style === "verse" ? 700 : 400,
            lineHeight: 1.12,
            textAlign: "center",
            letterSpacing: style === "prechorus" ? size * 0.03 : style === "hook" ? size * 0.02 : 0,
          }}
        >
          {line.words.map((w, wi) => (
            <WordSpan key={wi} w={w} idx={wi} t={t} style={style} spec={spec} debug={debug} />
          ))}
        </div>
        {debug && (
          <div style={{ position: "absolute", top: -34, left: 0, fontSize: 22, color: line.uncertain ? "#ff6060" : "#9f9", fontFamily: "monospace" }}>
            {line.id} {line.start.toFixed(2)}–{line.end.toFixed(2)} {line.uncertain ? "UNCERTAIN" : ""}
          </div>
        )}
      </div>
    </div>
  );
};

/** All lyrics: picks visible lines (max two) and places them in the zone of their scene. */
export const LyricLayer: React.FC<{
  zoneOf: (lineIdx: number) => { zone: Zone; scale?: number };
  debug?: boolean;
}> = ({ zoneOf, debug = false }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const visible: { i: number; win: [number, number] }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const win = lineWindow(i);
    if (t >= win[0] && t <= win[1] + EXIT) visible.push({ i, win });
  }
  const shown = visible.slice(-2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {shown.map(({ i, win }) => {
        const { zone, scale } = zoneOf(i);
        const line = lines[i];
        const asks = lines[i + 1]?.style === "response" && line.style !== "response";
        const offsetY = line.style === "response" ? zone.h * 0.32 : asks ? -zone.h * 0.18 : 0;
        const sizeScale = (scale ?? 1) * (asks ? 0.88 : 1);
        return (
          <LyricLine key={line.id} line={line} idx={i} zone={zone} t={t} win={win} offsetY={offsetY} sizeScale={sizeScale} debug={debug} />
        );
      })}
    </AbsoluteFill>
  );
};

export const easing = { easeOut, backOut, clamp01 };
export const interp = (t: number, a: number, b: number, from: number, to: number) =>
  interpolate(t, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
