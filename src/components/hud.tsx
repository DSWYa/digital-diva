import React, { createContext, useContext } from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { accentA, C, F, H, hiA, W } from "../theme";

/* ---------- math helpers ---------- */
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => {
  const p = clamp01(x);
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
};
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / Math.max(1e-6, b - a));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const typed = (s: string, age: number, cps = 28) => s.slice(0, Math.max(0, Math.floor(age * cps)));
export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/* ---------- camera / parallax ---------- */
type Cam = { x: number; y: number; zoom: number; rot: number };
const CamCtx = createContext<Cam>({ x: 0, y: 0, zoom: 1, rot: 0 });

export const Camera: React.FC<{ x?: number; y?: number; zoom?: number; rot?: number; shake?: number; children: React.ReactNode }> = ({
  x = 0,
  y = 0,
  zoom = 1,
  rot = 0,
  shake = 0,
  children,
}) => {
  const f = useCurrentFrame();
  const sx = shake ? (random(`sx${f}`) - 0.5) * shake : 0;
  const sy = shake ? (random(`sy${f}`) - 0.5) * shake : 0;
  return (
    <CamCtx.Provider value={{ x: x + sx, y: y + sy, zoom, rot }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>{children}</AbsoluteFill>
    </CamCtx.Provider>
  );
};

/** depth 0 = static backdrop, 1 = subject plane, >1 = foreground. */
export const Layer: React.FC<{ depth: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ depth, children, style }) => {
  const cam = useContext(CamCtx);
  const z = 1 + (cam.zoom - 1) * depth;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${-cam.x * depth}px, ${-cam.y * depth}px) scale(${z}) rotate(${cam.rot * depth}deg)`,
        transformOrigin: "50% 50%",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Full-screen SVG canvas for line drawings. */
export const Canvas: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...style }}>
    {children}
  </svg>
);

/* ---------- per-scene style (background pattern + GUI insets) ---------- */
export type BgKind = "grid" | "dots" | "blueprint" | "scan" | "iso" | "rings" | "hatch" | "aurora";
export type SceneStyle = { bg: BgKind; inset: { top: number; left: number; bottom: number } };
export const StyleCtx = createContext<SceneStyle>({ bg: "grid", inset: { top: 0, left: 0, bottom: 0 } });
export const useSceneStyle = () => useContext(StyleCtx);

/* ---------- backgrounds ---------- */
export const Dark: React.FC<{ glow?: number }> = ({ glow = 0 }) => {
  const f = useCurrentFrame();
  const { bg } = useSceneStyle();
  const drift = f / 30;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 50% 45%, ${C.bg2} 0%, ${C.bg} 70%)` }}>
      {/* slow coloured light leaks so each palette reads as its own space */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + Math.sin(drift * 0.11) * 35}% ${30 + Math.cos(drift * 0.08) * 25}%, ${accentA(bg === "aurora" ? 0.22 : 0.07)} 0%, transparent ${bg === "aurora" ? 45 : 38}%), radial-gradient(circle at ${50 - Math.sin(drift * 0.07) * 40}% ${75 + Math.sin(drift * 0.1) * 15}%, ${hiA(bg === "aurora" ? 0.08 : 0.03)} 0%, transparent 40%)`,
        }}
      />
      {glow > 0 && <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${accentA(0.12 * glow)} 0%, transparent 55%)` }} />}
    </AbsoluteFill>
  );
};

export const Paper: React.FC = () => (
  <AbsoluteFill style={{ background: C.paper }}>
    <Canvas>
      {new Array(140).fill(0).map((_, i) => (
        <circle key={i} cx={random(`pp${i}`) * W} cy={random(`pq${i}`) * H} r={0.8 + random(`pr${i}`) * 1.2} fill={C.paperDim} opacity={0.5} />
      ))}
    </Canvas>
  </AbsoluteFill>
);

/** Background pattern; the scene's style decides which (grid, dots, blueprint, scanlines…). */
export const Grid: React.FC<{ size?: number; color?: string; opacity?: number; major?: number }> = ({ size = 48, color = C.gridLine, opacity = 0.7, major = 0 }) => {
  const f = useCurrentFrame();
  const { bg } = useSceneStyle();
  const id = `g${bg}${size}${major}`;
  if (bg === "scan") {
    const band = (f * 6) % (H + 300) - 150;
    return (
      <AbsoluteFill style={{ opacity }}>
        <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, ${color} 0px, ${color} 1px, transparent 1px, transparent 5px)`, opacity: 0.8 }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: band, height: 140, background: `linear-gradient(180deg, transparent, ${hiA(0.05)}, transparent)` }} />
        <AbsoluteFill style={{ boxShadow: `inset 0 0 220px rgba(0,0,0,0.75)`, borderRadius: 40 }} />
      </AbsoluteFill>
    );
  }
  if (bg === "aurora") return null;
  let pattern: React.ReactNode;
  const w = size;
  let h = size;
  switch (bg) {
    case "dots":
      pattern = <circle cx={size / 2} cy={size / 2} r={1.6} fill={color} />;
      break;
    case "iso":
      h = size * 0.577 * 2;
      pattern = <path d={`M 0 0 L ${size} ${h / 2} M ${size} 0 L 0 ${h / 2} M 0 ${h / 2} L ${size} ${h} M ${size} ${h / 2} L 0 ${h}`} stroke={color} strokeWidth={1} fill="none" />;
      break;
    case "hatch":
      pattern = <path d={`M 0 ${size} L ${size} 0`} stroke={color} strokeWidth={1} fill="none" />;
      break;
    default:
      pattern = <path d={`M ${size} 0 L 0 0 0 ${size}`} fill="none" stroke={color} strokeWidth={1} />;
  }
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={W} height={H}>
        <defs>
          <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">
            {pattern}
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#${id})`} />
        {bg === "rings" &&
          new Array(14).fill(0).map((_, i) => <circle key={i} cx={W / 2} cy={H / 2} r={80 + i * 90} fill="none" stroke={color} strokeWidth={i % 4 === 0 ? 2 : 1} />)}
        {bg === "rings" &&
          new Array(12).fill(0).map((_, i) => (
            <line key={`s${i}`} x1={W / 2} y1={H / 2} x2={W / 2 + Math.cos((i / 12) * Math.PI * 2) * 1400} y2={H / 2 + Math.sin((i / 12) * Math.PI * 2) * 1400} stroke={color} strokeWidth={1} />
          ))}
        {bg === "blueprint" && (
          <g>
            {new Array(Math.ceil(W / (size * 5)) + 1).fill(0).map((_, i) => (
              <line key={`v${i}`} x1={i * size * 5} y1={0} x2={i * size * 5} y2={H} stroke={color} strokeWidth={2} />
            ))}
            {new Array(Math.ceil(H / (size * 5)) + 1).fill(0).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={i * size * 5} x2={W} y2={i * size * 5} stroke={color} strokeWidth={2} />
            ))}
            {new Array(Math.ceil(W / (size * 5)) + 1).fill(0).map((_, i) =>
              new Array(Math.ceil(H / (size * 5)) + 1).fill(0).map((__, j) => (
                <path key={`c${i}${j}`} d={`M ${i * size * 5 - 8} ${j * size * 5} h 16 M ${i * size * 5} ${j * size * 5 - 8} v 16`} stroke={C.dim} strokeWidth={1.5} />
              )),
            )}
          </g>
        )}
        {major > 0 &&
          new Array(Math.ceil(W / (size * major))).fill(0).map((_, i) => (
            <line key={i} x1={i * size * major} y1={0} x2={i * size * major} y2={H} stroke={color} strokeWidth={2} />
          ))}
      </svg>
    </AbsoluteFill>
  );
};

/** Wireframe perspective floor. */
export const Floor: React.FC<{ horizon?: number; color?: string; speed?: number; opacity?: number }> = ({ horizon = 640, color = C.dim, speed = 0, opacity = 0.55 }) => {
  const f = useCurrentFrame();
  const vx = W / 2;
  const items: React.ReactNode[] = [];
  for (let i = -24; i <= 24; i++) {
    items.push(<line key={`v${i}`} x1={vx + i * 14} y1={horizon} x2={vx + i * 190} y2={H + 60} stroke={color} strokeWidth={1} />);
  }
  for (let r = 0; r < 16; r++) {
    const p = ((r + ((f * speed) % 1)) / 16) ** 2.3;
    const y = horizon + p * (H - horizon + 60);
    items.push(<line key={`h${r}`} x1={0} y1={y} x2={W} y2={y} stroke={color} strokeWidth={1} />);
  }
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={W} height={H}>{items}</svg>
    </AbsoluteFill>
  );
};

/* ---------- strokes & annotations ---------- */

/** A path that draws itself on as p goes 0 → 1. */
export const Stroke: React.FC<{
  d: string;
  p?: number;
  color?: string;
  w?: number;
  dash?: string;
  fill?: string;
  opacity?: number;
  glow?: boolean;
  transform?: string;
}> = ({ d, p = 1, color = C.line, w = 2, dash, fill = "none", opacity = 1, glow, transform }) => (
  <path
    d={d}
    pathLength={dash ? undefined : 1}
    strokeDasharray={dash ?? "1 1"}
    strokeDashoffset={dash ? 0 : 1 - clamp01(p)}
    stroke={color}
    strokeWidth={w}
    fill={fill}
    opacity={dash ? opacity * clamp01(p * 3) : opacity}
    strokeLinecap="round"
    strokeLinejoin="round"
    transform={transform}
    style={glow ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}
  />
);

/** Small monospace annotation (SVG). */
export const Note: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  upper?: boolean;
  weight?: number;
  opacity?: number;
}> = ({ x, y, children, size = 16, color = C.dim, anchor = "start", upper, weight = 400, opacity = 1 }) => (
  <text
    x={x}
    y={y}
    fontFamily={F.mono}
    fontSize={size}
    fill={color}
    textAnchor={anchor}
    fontWeight={weight}
    letterSpacing={upper ? size * 0.16 : 0}
    opacity={opacity}
  >
    {upper && typeof children === "string" ? children.toUpperCase() : children}
  </text>
);

/** Corner HUD labels, like an editor chrome. */
export const Hud: React.FC<{ tl?: string; tr?: string; bl?: string; br?: string; color?: string; accent?: "tl" | "tr" | "bl" | "br" }> = ({
  tl,
  tr,
  bl,
  br,
  color = C.dim,
  accent,
}) => {
  const { inset } = useSceneStyle();
  const st = (k: string): React.CSSProperties => ({
    position: "absolute",
    fontFamily: F.mono,
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent === k ? C.pink : color,
    whiteSpace: "nowrap",
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {tl && <div style={{ ...st("tl"), left: 80 + inset.left, top: 36 + inset.top }}>{tl}</div>}
      {tr && <div style={{ ...st("tr"), right: 80, top: 36 + inset.top }}>{tr}</div>}
      {bl && <div style={{ ...st("bl"), left: 80 + inset.left, bottom: 36 + inset.bottom }}>{bl}</div>}
      {br && <div style={{ ...st("br"), right: 80, bottom: 36 + inset.bottom }}>{br}</div>}
    </AbsoluteFill>
  );
};

/** Dimension line with end ticks and a label. */
export const Dim: React.FC<{ x1: number; y1: number; x2: number; y2: number; label: string; p?: number; color?: string }> = ({
  x1,
  y1,
  x2,
  y2,
  label,
  p = 1,
  color = C.dim,
}) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const nx = -Math.sin(a) * 10;
  const ny = Math.cos(a) * 10;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g opacity={clamp01(p * 2)}>
      <line x1={x1} y1={y1} x2={lerp(x1, x2, ease(p))} y2={lerp(y1, y2, ease(p))} stroke={color} strokeWidth={1} />
      <line x1={x1 - nx} y1={y1 - ny} x2={x1 + nx} y2={y1 + ny} stroke={color} strokeWidth={1} />
      <line x1={x2 - nx} y1={y2 - ny} x2={x2 + nx} y2={y2 + ny} stroke={color} strokeWidth={1} />
      <text
        x={mx + nx * 2}
        y={my + ny * 2}
        fontFamily={F.mono}
        fontSize={15}
        fill={color}
        textAnchor="middle"
        transform={`rotate(${((a * 180) / Math.PI + 360) % 180 > 90 ? (a * 180) / Math.PI + 180 : (a * 180) / Math.PI} ${mx + nx * 2} ${my + ny * 2})`}
      >
        {label}
      </text>
    </g>
  );
};

/** Bezier anchor (square) with optional handle. */
export const Anchor: React.FC<{ x: number; y: number; hx?: number; hy?: number; selected?: boolean; color?: string }> = ({ x, y, hx, hy, selected, color = C.line }) => (
  <g>
    {hx !== undefined && hy !== undefined && (
      <>
        <line x1={x} y1={y} x2={hx} y2={hy} stroke={color} strokeWidth={1} opacity={0.7} />
        <circle cx={hx} cy={hy} r={4} fill={color} />
      </>
    )}
    <rect x={x - 6} y={y - 6} width={12} height={12} fill={selected ? color : C.bg} stroke={color} strokeWidth={1.5} />
  </g>
);

/** The glowing pink pixel: the AI's presence in every scene. */
export const Pixel: React.FC<{ x: number; y: number; size?: number; pulse?: number }> = ({ x, y, size = 22, pulse = 0 }) => {
  const f = useCurrentFrame();
  const g = 0.75 + 0.25 * Math.sin(f / 9) + pulse * 0.6;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        background: "#fff",
        boxShadow: `0 0 ${size * 0.6}px ${C.pink}, 0 0 ${size * 2.2 * g}px ${C.pink}, 0 0 ${size * 5 * g}px ${accentA(0.45)}`,
        border: `3px solid ${C.pinkSoft}`,
      }}
    />
  );
};

/** HTML monospace block. */
export const Mono: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  x,
  y,
  children,
  size = 18,
  color = C.dim,
  style,
}) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: F.mono, fontSize: size, color, lineHeight: 1.6, whiteSpace: "pre", ...style }}>{children}</div>
);

/** Horizontal meter bar made of ticks (like a progress readout). */
export const Ticks: React.FC<{ x: number; y: number; w: number; v: number; n?: number; color?: string; h?: number }> = ({ x, y, w, v, n = 60, color = C.line, h = 12 }) => (
  <g>
    {new Array(n).fill(0).map((_, i) => (
      <rect key={i} x={x + (i * w) / n} y={y} width={Math.max(1, w / n - 2)} height={h} fill={i / n < v ? color : C.faint} />
    ))}
  </g>
);

/** Expanding rings (sound / signal). */
export const Rings: React.FC<{ x: number; y: number; t: number; n?: number; r?: number; color?: string; speed?: number }> = ({ x, y, t, n = 4, r = 260, color = C.line, speed = 0.8 }) => (
  <g>
    {new Array(n).fill(0).map((_, i) => {
      const p = (t * speed + i / n) % 1;
      return <circle key={i} cx={x} cy={y} r={20 + p * r} fill="none" stroke={color} strokeWidth={1.5} opacity={(1 - p) * 0.8} />;
    })}
  </g>
);

/** Deterministic jittery hand-drawn version of a polyline. */
export const sketch = (pts: [number, number][], seed: string, amt = 2.5, closed = false) => {
  const j = (k: number) => (random(`${seed}${k}`) - 0.5) * amt * 2;
  const p = pts.map(([x, y], i) => [x + j(i * 2), y + j(i * 2 + 1)]);
  return `M${p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L")}${closed ? " Z" : ""}`;
};
