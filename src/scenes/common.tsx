import React from "react";
import { C, F } from "../theme";
import { Segment } from "../lib/plan";
import { analysis, singing } from "../lib/timing";
import { clamp01, ease } from "../components/hud";

export type SceneProps = { seg: Segment; t: number; lt: number };

/** The singer's voice as an oscilloscope trace (driven by word timings). */
export const VoiceTrace: React.FC<{ t: number; x: number; y: number; w: number; amp?: number; color?: string }> = ({ t, x, y, w, amp = 120, color = C.line }) => {
  const n = 140;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const tt = t - (n - i) * 0.012;
    const v = singing(tt);
    const wob = Math.sin(i * 0.9 + t * 20) * 0.6 + Math.sin(i * 0.37 - t * 7) * 0.4;
    pts.push(`${(x + (i / n) * w).toFixed(1)},${(y + wob * v * amp).toFixed(1)}`);
  }
  return <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={2} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />;
};

/** Energy envelope of the actual song around time t (bars). */
export const EnergyBars: React.FC<{ t: number; x: number; y: number; w: number; h: number; n?: number; span?: number; color?: string; mirror?: boolean }> = ({
  t,
  x,
  y,
  w,
  h,
  n = 96,
  span = 8,
  color = C.line,
  mirror = true,
}) => {
  const e = analysis.energy;
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const tt = t - span / 2 + (i / n) * span;
        const v = e.v[Math.max(0, Math.min(e.v.length - 1, Math.round(tt * e.rate)))] ?? 0;
        const bh = Math.max(2, v * h);
        const now = Math.abs(tt - t) < span / n;
        return (
          <rect
            key={i}
            x={x + (i * w) / n}
            y={mirror ? y - bh / 2 : y - bh}
            width={Math.max(1, w / n - 3)}
            height={bh}
            fill={now ? C.pink : tt < t ? color : C.faint}
          />
        );
      })}
    </g>
  );
};

/** Log row with a pink-underlined timestamp (paper or dark). */
export const LogRow: React.FC<{ y: number; ts: string; text: string; age: number; paper?: boolean; hot?: boolean; x?: number; size?: number }> = ({
  y,
  ts,
  text,
  age,
  paper = true,
  hot,
  x = 80,
  size = 30,
}) => {
  const a = ease(age / 0.3);
  if (age < 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: F.mono, fontSize: size, opacity: a, transform: `translateX(${(1 - a) * -20}px)`, whiteSpace: "pre", color: paper ? C.paperInk : C.line }}>
      <span style={{ color: hot ? C.pink : paper ? "#6b2a4a" : C.pinkSoft, borderBottom: `3px solid ${C.pink}`, paddingBottom: 2 }}>{ts}</span>
      <span style={{ color: paper ? "#5b5a5e" : C.dim }}>{"  " + text}</span>
    </div>
  );
};

/** Simple boxed label (HTML). */
export const Tag: React.FC<{ x: number; y: number; children: React.ReactNode; hot?: boolean; size?: number; age?: number; paper?: boolean }> = ({
  x,
  y,
  children,
  hot,
  size = 22,
  age = 1,
  paper,
}) => {
  const a = clamp01(age / 0.2);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: a,
        transform: `scale(${0.9 + 0.1 * a})`,
        fontFamily: F.mono,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "0.08em",
        padding: `${size * 0.3}px ${size * 0.6}px`,
        border: `1.5px solid ${hot ? C.pink : paper ? C.paperInk : C.line}`,
        color: hot ? C.pink : paper ? C.paperInk : C.line,
        background: hot ? "rgba(255,46,138,0.08)" : "transparent",
        whiteSpace: "nowrap",
        boxShadow: hot ? `0 0 18px rgba(255,46,138,0.35)` : undefined,
      }}
    >
      {children}
    </div>
  );
};
