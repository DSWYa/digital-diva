import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F, H, hiA, W } from "../theme";
import { analysis, beatAt, beatPulse, energyAt, lines } from "../lib/timing";
import { clamp01, ease } from "./hud";
import { outro } from "../lib/plan";

/** Interface chrome drawn over a scene (under the lyrics). Everything hugs the screen edges. */
export type GuiKind = "editor" | "window" | "terminal" | "dashboard" | "player" | "none";
export const GUI_INSETS: Record<GuiKind, { top: number; left: number; bottom: number }> = {
  editor: { top: 62, left: 62, bottom: 36 },
  window: { top: 36, left: 0, bottom: 36 },
  terminal: { top: 36, left: 0, bottom: 40 },
  dashboard: { top: 36, left: 0, bottom: 36 },
  player: { top: 0, left: 0, bottom: 76 },
  none: { top: 0, left: 0, bottom: 0 },
};

const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
const chromeBg = `color-mix(in srgb, ${C.bg2} 88%, ${C.line} 6%)`;
const edge = `1px solid color-mix(in srgb, ${C.line} 16%, transparent)`;
const mono = (size = 13, color: string = C.dim): React.CSSProperties => ({ fontFamily: F.mono, fontSize: size, color, letterSpacing: "0.04em", whiteSpace: "nowrap" });

const TitleBar: React.FC<{ title: string; tabs?: string[]; active?: number; t: number; paper?: boolean }> = ({ title, tabs = [], active = 0, t, paper }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 36, background: paper ? "rgba(0,0,0,0.06)" : chromeBg, borderBottom: paper ? "1px solid rgba(0,0,0,0.12)" : edge, display: "flex", alignItems: "center" }}>
    <div style={{ display: "flex", gap: 8, padding: "0 14px" }}>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c, opacity: 0.85 }} />
      ))}
    </div>
    <div style={{ display: "flex", height: "100%", marginLeft: 10 }}>
      {tabs.map((tab, i) => (
        <div
          key={tab}
          style={{
            ...mono(15, i === active ? (paper ? C.paperInk : C.line) : paper ? C.paperDim : C.dim),
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            borderRight: paper ? "1px solid rgba(0,0,0,0.1)" : edge,
            borderTop: i === active ? `2px solid ${C.pink}` : "2px solid transparent",
            background: i === active ? (paper ? "rgba(255,255,255,0.5)" : hiA(0.04)) : "transparent",
          }}
        >
          {tab}
        </div>
      ))}
    </div>
    <div style={{ ...mono(15, paper ? C.paperDim : C.dim), position: "absolute", left: 0, right: 0, textAlign: "center", pointerEvents: "none" }}>{title}</div>
    <div style={{ ...mono(15, paper ? C.paperDim : C.dim), marginLeft: "auto", padding: "0 16px", display: "flex", gap: 18, alignItems: "center" }}>
      <span>◐ {Math.round(96 - t / 20)}%</span>
      <span>⌁ wifi</span>
      <span>{mmss(t)}</span>
    </div>
  </div>
);

const StatusBar: React.FC<{ left: string; mid: string; t: number; paper?: boolean; height?: number }> = ({ left, mid, t, paper, height = 36 }) => {
  const cpu = clamp01(0.35 + energyAt(t) * 0.6);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height, background: paper ? "rgba(0,0,0,0.06)" : chromeBg, borderTop: paper ? "1px solid rgba(0,0,0,0.12)" : edge, display: "flex", alignItems: "center", padding: "0 16px", gap: 26 }}>
      <span style={{ ...mono(15, C.pink) }}>●</span>
      <span style={mono(15, paper ? C.paperInk : C.line)}>{left}</span>
      <span style={mono(15, paper ? C.paperDim : C.dim)}>{mid}</span>
      <div style={{ marginLeft: "auto", display: "flex", gap: 22, alignItems: "center" }}>
        <span style={mono(15, paper ? C.paperDim : C.dim)}>cpu</span>
        <div style={{ display: "flex", gap: 2 }}>
          {new Array(16).fill(0).map((_, i) => (
            <div key={i} style={{ width: 5, height: 14, background: i / 16 < cpu ? (i > 12 ? C.pink : paper ? C.paperInk : C.line) : paper ? "rgba(0,0,0,0.12)" : C.faint }} />
          ))}
        </div>
        <span style={mono(15, paper ? C.paperDim : C.dim)}>30 fps</span>
        <span style={mono(15, paper ? C.paperInk : C.line)}>{mmss(t)}.{String(Math.floor((t % 1) * 30)).padStart(2, "0")}</span>
      </div>
    </div>
  );
};

const TOOLS = ["↖", "✎", "▭", "◯", "T", "✋", "⌖"];
const Toolbar: React.FC<{ active: number }> = ({ active }) => (
  <div style={{ position: "absolute", left: 0, top: 36, bottom: 36, width: 62, background: chromeBg, borderRight: edge, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 34, gap: 10 }}>
    {TOOLS.map((tool, i) => (
      <div key={tool} style={{ width: 42, height: 42, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, color: i === active ? C.bg : C.dim, background: i === active ? C.pink : "transparent", fontFamily: F.mono }}>
        {tool}
      </div>
    ))}
  </div>
);

const Rulers: React.FC<{ t: number; mark: [number, number] }> = ({ t, mark }) => {
  const off = (t * 14) % 100;
  return (
    <>
      <svg width={W} height={26} style={{ position: "absolute", left: 0, top: 36, background: chromeBg, borderBottom: edge }}>
        {new Array(Math.ceil(W / 10) + 12).fill(0).map((_, i) => {
          const x = 62 + i * 10 - off;
          const big = i % 10 === 0;
          return (
            <g key={i}>
              <line x1={x} y1={26} x2={x} y2={big ? 8 : i % 5 === 0 ? 16 : 20} stroke={C.dim} strokeWidth={1} />
              {big && (
                <text x={x + 3} y={13} fontFamily={F.mono} fontSize={11} fill={C.dim}>
                  {Math.round((i * 10 + Math.floor(t * 14 / 100) * 100) / 10) * 10}
                </text>
              )}
            </g>
          );
        })}
        <path d={`M ${mark[0] - 6} 26 L ${mark[0] + 6} 26 L ${mark[0]} 16 Z`} fill={C.pink} />
      </svg>
      <svg width={26} height={H - 98} style={{ position: "absolute", left: 62, top: 62, background: chromeBg, borderRight: edge }}>
        {new Array(Math.ceil(H / 10)).fill(0).map((_, i) => (
          <line key={i} x1={26} y1={i * 10} x2={i % 10 === 0 ? 8 : i % 5 === 0 ? 16 : 20} y2={i * 10} stroke={C.dim} strokeWidth={1} />
        ))}
        <path d={`M 26 ${mark[1] - 68} L 26 ${mark[1] - 56} L 16 ${mark[1] - 62} Z`} fill={C.pink} />
      </svg>
    </>
  );
};

/** Floating telemetry card (sparkline + meters). */
const Widget: React.FC<{ corner: string; t: number; title: string }> = ({ corner, t, title }) => {
  const wdt = 380;
  const hgt = 214;
  const x = corner.endsWith("l") ? 80 : W - 80 - wdt;
  const y = corner.startsWith("t") ? 90 : H - 36 - 26 - hgt;
  const pts = new Array(60).fill(0).map((_, i) => {
    const tt = t - 6 + i * 0.1;
    return `${(i / 59) * (wdt - 32)},${48 - energyAt(Math.max(0, tt)) * 44}`;
  });
  const meters: [string, number][] = [
    ["queries/s", clamp01(0.55 + 0.4 * Math.sin(t * 0.7))],
    ["patience", clamp01(0.85 - (t % 60) / 80)],
    ["beat", beatPulse(t, 4)],
  ];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: wdt, height: hgt, background: `color-mix(in srgb, ${C.bg} 82%, transparent)`, border: edge, borderRadius: 8, padding: 14, boxShadow: `0 10px 40px rgba(0,0,0,0.45)` }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={mono(13, C.dim)}>{title.toUpperCase()}</span>
        <span style={mono(13, C.pink)}>● live</span>
      </div>
      <svg width={wdt - 30} height={60} style={{ marginTop: 8 }}>
        <polyline points={pts.join(" ")} fill="none" stroke={C.pink} strokeWidth={1.5} />
        <line x1={0} y1={50} x2={wdt} y2={50} stroke={C.faint} />
      </svg>
      {meters.map(([label, v]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
          <span style={{ ...mono(13, C.dim), width: 80 }}>{label}</span>
          <div style={{ flex: 1, height: 6, background: C.faint, borderRadius: 3 }}>
            <div style={{ width: `${v * 100}%`, height: "100%", background: label === "patience" && v < 0.3 ? C.pink : C.line, borderRadius: 3 }} />
          </div>
          <span style={{ ...mono(13, C.line), width: 34, textAlign: "right" }}>{Math.round(v * 100)}</span>
        </div>
      ))}
    </div>
  );
};

/** Media-player bar with a scrubber over the real song energy. */
const Player: React.FC<{ t: number }> = ({ t }) => {
  const dur = outro.end;
  const p = t / dur;
  const n = 180;
  const x0 = 250;
  const w = W - x0 - 330;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 76, background: `linear-gradient(180deg, transparent, ${chromeBg} 30%)` }}>
      <div style={{ position: "absolute", left: 40, top: 20, width: 38, height: 38, borderRadius: 19, border: `1.5px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <div style={{ width: 4, height: 12, background: C.line }} />
        <div style={{ width: 4, height: 12, background: C.line }} />
      </div>
      <div style={{ position: "absolute", left: 96, top: 20, ...mono(16, C.line) }}>DIGITAL DIVA</div>
      <div style={{ position: "absolute", left: 96, top: 40, ...mono(13, C.dim) }}>beep boop baby</div>
      <svg width={w} height={44} style={{ position: "absolute", left: x0, top: 16 }}>
        {new Array(n).fill(0).map((_, i) => {
          const tt = (i / n) * dur;
          const v = analysis.energy.v[Math.round(tt * analysis.energy.rate)] ?? 0;
          const bh = 3 + v * 26;
          return <rect key={i} x={(i / n) * w} y={20 - bh / 2} width={w / n - 1.5} height={bh} fill={i / n < p ? C.pink : C.faint} />;
        })}
        <line x1={p * w} y1={0} x2={p * w} y2={40} stroke={C.white} strokeWidth={2} />
      </svg>
      <div style={{ position: "absolute", right: 200, top: 28, ...mono(16, C.line) }}>
        {mmss(t)} <span style={{ color: C.dim }}>/ {mmss(dur)}</span>
      </div>
      <div style={{ position: "absolute", right: 40, top: 26, display: "flex", gap: 3, alignItems: "flex-end" }}>
        {[0, 1, 2, 3, 4].map((k) => (
          <div key={k} style={{ width: 5, height: 4 + k * 3, background: k / 5 < 0.4 + energyAt(t) * 0.6 ? C.line : C.faint }} />
        ))}
      </div>
    </div>
  );
};

export const Chrome: React.FC<{
  kind: GuiKind;
  t: number;
  lt: number;
  title: string;
  paper?: boolean;
  widget?: string;
  cursor?: [number, number] | null;
  itemAge?: number;
  itemIndex?: number;
}> = ({ kind, t, lt, title, paper, widget, cursor, itemIndex = 0 }) => {
  if (kind === "none") return null;
  const lineNo = lines.filter((l) => l.start <= t).length;
  const b = beatAt(t);
  const mid = `line ${lineNo}/${lines.length} · bar ${Math.floor(b.n / 4) + 1} · beat ${(b.n % 4) + 1}`;
  const reveal = ease(lt / 0.35);
  const at: [number, number] = cursor ?? [1400, 640];
  const cx = at[0] + Math.sin(t * 0.45) * 120;
  const cy = at[1] + Math.cos(t * 0.37) * 80;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: reveal }}>
      {kind === "editor" && (
        <>
          <Rulers t={t} mark={[cx, cy]} />
          <Toolbar active={itemIndex % TOOLS.length} />
        </>
      )}
      {kind !== "player" && (
        <TitleBar
          t={t}
          paper={paper}
          title={kind === "terminal" ? `${title} — diva@cloud: ~` : title}
          tabs={kind === "editor" ? [title, "layers", "export"] : kind === "window" ? [title, "+"] : kind === "dashboard" ? ["overview", title] : []}
          active={kind === "dashboard" ? 1 : 0}
        />
      )}
      {(kind === "editor" || kind === "window" || kind === "dashboard") && <StatusBar left={kind === "editor" ? `${Math.round(100 + lt * 8)}% zoom · x ${Math.round(cx)} y ${Math.round(cy)}` : title} mid={mid} t={t} paper={paper} />}
      {kind === "terminal" && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 40, background: paper ? "rgba(0,0,0,0.06)" : chromeBg, borderTop: paper ? "1px solid rgba(0,0,0,0.12)" : edge, display: "flex", alignItems: "center", padding: "0 18px", ...mono(17, paper ? C.paperInk : C.line) }}>
          <span style={{ color: C.pink }}>diva@cloud</span>:~$&nbsp;<span>{["tail -f questions.log", "sudo patience --restore", "ping grandma"][Math.floor(t / 7) % 3].slice(0, Math.floor((t % 7) * 12))}</span>
          <span style={{ color: C.pink }}>{Math.floor(t * 2) % 2 ? "█" : " "}</span>
        </div>
      )}
      {kind === "dashboard" && <Widget corner={widget ?? "tr"} t={t} title={title} />}
      {kind === "player" && <Player t={t} />}
    </AbsoluteFill>
  );
};
