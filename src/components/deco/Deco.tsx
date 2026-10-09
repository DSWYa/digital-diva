import React, { createContext, useContext } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { C, F, H, W } from "../../theme";

/* ---------------- Camera + parallax ---------------- */

type Cam = { x: number; y: number; zoom: number; rot: number };
const CamCtx = createContext<Cam>({ x: 0, y: 0, zoom: 1, rot: 0 });

/** Camera wrapper. Children <Layer depth> shift by depth for 2.5D parallax. */
export const Camera: React.FC<{
  x?: number;
  y?: number;
  zoom?: number;
  rot?: number;
  shake?: number;
  children: React.ReactNode;
}> = ({ x = 0, y = 0, zoom = 1, rot = 0, shake = 0, children }) => {
  const f = useCurrentFrame();
  const sx = shake ? (random(`sx${f}`) - 0.5) * shake : 0;
  const sy = shake ? (random(`sy${f}`) - 0.5) * shake : 0;
  return (
    <CamCtx.Provider value={{ x: x + sx, y: y + sy, zoom, rot }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>{children}</AbsoluteFill>
    </CamCtx.Provider>
  );
};

/** depth: 0 = infinitely far (static), 1 = subject plane, >1 foreground. */
export const Layer: React.FC<{
  depth: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ depth, children, style }) => {
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

/* ---------------- Backgrounds ---------------- */

export const Backdrop: React.FC<{
  top?: string;
  bottom?: string;
  glow?: string;
  glowY?: number;
}> = ({ top = C.black, bottom = C.navy, glow = C.tealDark, glowY = 60 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 70% 55% at 50% ${glowY}%, ${glow}55 0%, transparent 70%), linear-gradient(180deg, ${top} 0%, ${C.night} 45%, ${bottom} 100%)`,
    }}
  />
);

export const Sunburst: React.FC<{
  cx?: number;
  cy?: number;
  rays?: number;
  color?: string;
  opacity?: number;
  speed?: number;
  r?: number;
}> = ({
  cx = W / 2,
  cy = H * 0.62,
  rays = 28,
  color = C.gold,
  opacity = 0.18,
  speed = 0.08,
  r = 1600,
}) => {
  const f = useCurrentFrame();
  const paths = [];
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * Math.PI * 2;
    const a1 = a0 + (Math.PI / rays) * 0.55;
    paths.push(
      <path
        key={i}
        d={`M${cx},${cy} L${cx + Math.cos(a0) * r},${cy + Math.sin(a0) * r} L${cx + Math.cos(a1) * r},${cy + Math.sin(a1) * r} Z`}
        fill={color}
        opacity={i % 2 ? opacity : opacity * 0.55}
      />,
    );
  }
  return (
    <AbsoluteFill>
      <svg width={W} height={H}>
        <g transform={`rotate(${f * speed} ${cx} ${cy})`}>{paths}</g>
      </svg>
    </AbsoluteFill>
  );
};

export const Stars: React.FC<{ n?: number; seed?: string; color?: string }> = ({
  n = 70,
  seed = "st",
  color = C.goldLight,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={W} height={H}>
        {new Array(n).fill(0).map((_, i) => {
          const x = random(`${seed}x${i}`) * W;
          const y = random(`${seed}y${i}`) * H * 0.75;
          const s = 1 + random(`${seed}s${i}`) * 2.5;
          const tw =
            0.35 + 0.65 * Math.abs(Math.sin(f / 18 + random(`${seed}p${i}`) * 9));
          return (
            <g key={i} opacity={tw} transform={`translate(${x} ${y})`}>
              <path
                d={`M0,${-s * 2} L${s * 0.5},0 L0,${s * 2} L${-s * 0.5},0 Z M${-s * 2},0 L0,${s * 0.5} L${s * 2},0 L0,${-s * 0.5} Z`}
                fill={color}
              />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Stepped Art Deco skyline silhouettes. */
export const Skyline: React.FC<{ color?: string; y?: number; seed?: string; lit?: boolean }> = ({
  color = "#070b1f",
  y = 760,
  seed = "sky",
  lit = true,
}) => {
  const f = useCurrentFrame();
  const bldgs = [];
  let x = -40;
  let i = 0;
  while (x < W + 40) {
    const w = 90 + random(`${seed}w${i}`) * 140;
    const h = 120 + random(`${seed}h${i}`) * 300;
    const top = y - h;
    const step = w * 0.18;
    bldgs.push(
      <g key={i}>
        <path
          d={`M${x},${H} L${x},${top + 40} L${x + step},${top + 40} L${x + step},${top + 20} L${x + step * 2},${top + 20} L${x + step * 2},${top} L${x + w - step * 2},${top} L${x + w - step * 2},${top + 20} L${x + w - step},${top + 20} L${x + w - step},${top + 40} L${x + w},${top + 40} L${x + w},${H} Z`}
          fill={color}
        />
        {random(`${seed}sp${i}`) > 0.6 && (
          <path d={`M${x + w / 2},${top - 70} L${x + w / 2 - 6},${top} L${x + w / 2 + 6},${top} Z`} fill={color} />
        )}
        {lit &&
          new Array(6).fill(0).map((_, k) => {
            const on = Math.sin(f / 40 + random(`${seed}l${i}${k}`) * 20) > 0.2;
            return (
              <rect
                key={k}
                x={x + 14 + (k % 3) * (w - 28) / 3}
                y={top + 60 + Math.floor(k / 3) * 46}
                width={(w - 40) / 4}
                height={18}
                fill={k % 2 ? C.gold : C.teal}
                opacity={on ? 0.45 : 0.08}
              />
            );
          })}
      </g>,
    );
    x += w + 6;
    i++;
  }
  return (
    <AbsoluteFill>
      <svg width={W} height={H}>
        {bldgs}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- Mechanical bits ---------------- */

export const Gear: React.FC<{
  x: number;
  y: number;
  r: number;
  teeth?: number;
  speed?: number;
  color?: string;
  opacity?: number;
}> = ({ x, y, r, teeth = 12, speed = 1, color = C.gold, opacity = 0.5 }) => {
  const f = useCurrentFrame();
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 ? r : r * 1.16;
    const a2 = a + Math.PI / (teeth * 2);
    pts.push(`${Math.cos(a) * rr},${Math.sin(a) * rr}`);
    pts.push(`${Math.cos(a2) * rr},${Math.sin(a2) * rr}`);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${f * speed})`} opacity={opacity}>
      <polygon points={pts.join(" ")} fill="none" stroke={color} strokeWidth={6} />
      <circle r={r * 0.62} fill="none" stroke={color} strokeWidth={4} />
      <circle r={r * 0.18} fill={color} />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <line
          key={k}
          x1={0}
          y1={0}
          x2={Math.cos((k * Math.PI) / 3) * r * 0.62}
          y2={Math.sin((k * Math.PI) / 3) * r * 0.62}
          stroke={color}
          strokeWidth={4}
        />
      ))}
    </g>
  );
};

export const GearCluster: React.FC<{ opacity?: number; side?: "left" | "right" | "both" }> = ({
  opacity = 0.35,
  side = "both",
}) => (
  <AbsoluteFill>
    <svg width={W} height={H}>
      {side !== "right" && (
        <>
          <Gear x={90} y={180} r={120} teeth={14} speed={0.6} opacity={opacity} />
          <Gear x={255} y={320} r={70} teeth={9} speed={-1.0} color={C.teal} opacity={opacity} />
          <Gear x={110} y={930} r={150} teeth={16} speed={-0.4} opacity={opacity * 0.8} />
        </>
      )}
      {side !== "left" && (
        <>
          <Gear x={1830} y={160} r={110} teeth={13} speed={-0.7} opacity={opacity} />
          <Gear x={1680} y={290} r={62} teeth={8} speed={1.3} color={C.teal} opacity={opacity} />
          <Gear x={1820} y={940} r={140} teeth={15} speed={0.5} opacity={opacity * 0.8} />
        </>
      )}
    </svg>
  </AbsoluteFill>
);

/** Circuit traces with travelling light pulses. */
export const Circuits: React.FC<{ seed?: string; opacity?: number; color?: string; n?: number }> = ({
  seed = "c",
  opacity = 0.5,
  color = C.teal,
  n = 16,
}) => {
  const f = useCurrentFrame();
  const traces = new Array(n).fill(0).map((_, i) => {
    const left = i % 2 === 0;
    const y0 = 80 + random(`${seed}y${i}`) * (H - 160);
    const x0 = left ? -10 : W + 10;
    const len1 = 120 + random(`${seed}a${i}`) * 260;
    const x1 = left ? x0 + len1 : x0 - len1;
    const dy = (random(`${seed}d${i}`) - 0.5) * 220;
    const x2 = left ? x1 + Math.abs(dy) : x1 - Math.abs(dy);
    const y2 = y0 + dy;
    const x3 = left ? x2 + 80 + random(`${seed}b${i}`) * 160 : x2 - 80 - random(`${seed}b${i}`) * 160;
    const d = `M${x0},${y0} L${x1},${y0} L${x2},${y2} L${x3},${y2}`;
    const total = Math.abs(x3 - x0) + Math.abs(dy) * 1.5;
    const off = ((f * 9 + random(`${seed}o${i}`) * 900) % (total + 300)) - 150;
    return (
      <g key={i}>
        <path d={d} stroke={color} strokeWidth={3} fill="none" opacity={0.35} />
        <circle cx={x3} cy={y2} r={7} fill="none" stroke={color} strokeWidth={3} opacity={0.6} />
        <path
          d={d}
          stroke={C.turquoise}
          strokeWidth={5}
          fill="none"
          strokeDasharray={`60 ${total + 400}`}
          strokeDashoffset={-off}
          style={{ filter: `drop-shadow(0 0 6px ${C.turquoise})` }}
        />
      </g>
    );
  });
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={W} height={H}>
        {traces}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- Light / FX ---------------- */

export const Spotlight: React.FC<{
  x: number;
  y?: number;
  w?: number;
  color?: string;
  opacity?: number;
  sway?: number;
}> = ({ x, y = H, w = 520, color = C.goldLight, opacity = 0.22, sway = 0 }) => {
  const f = useCurrentFrame();
  const a = Math.sin(f / 45) * sway;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <svg width={W} height={H}>
        <defs>
          <linearGradient id={`sp${x}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={opacity * 1.6} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <g transform={`rotate(${a} ${x} -40)`}>
          <path d={`M${x - 40},-40 L${x + 40},-40 L${x + w / 2},${y} L${x - w / 2},${y} Z`} fill={`url(#sp${x})`} />
        </g>
        <ellipse cx={x} cy={y - 60} rx={w / 2} ry={50} fill={color} opacity={opacity * 0.5} />
      </svg>
    </AbsoluteFill>
  );
};

export const Sparkles: React.FC<{
  n?: number;
  seed?: string;
  color?: string;
  area?: [number, number, number, number];
  size?: number;
}> = ({ n = 30, seed = "sp", color = C.goldLight, area = [0, 0, W, H], size = 10 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H}>
        {new Array(n).fill(0).map((_, i) => {
          const life = 50 + random(`${seed}l${i}`) * 40;
          const t = ((f + random(`${seed}o${i}`) * 300) % life) / life;
          const x = area[0] + random(`${seed}x${i}`) * area[2];
          const y = area[1] + random(`${seed}y${i}`) * area[3] - t * 60;
          const s = size * Math.sin(t * Math.PI) * (0.5 + random(`${seed}s${i}`));
          return (
            <path
              key={i}
              transform={`translate(${x} ${y}) rotate(${t * 90})`}
              d={`M0,${-s} Q0,0 ${s},0 Q0,0 0,${s} Q0,0 ${-s},0 Q0,0 0,${-s} Z`}
              fill={i % 3 === 0 ? C.pinkSoft : color}
              opacity={0.9}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** Cheap film grain + scanlines via SVG noise; cached by the browser. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const f = useCurrentFrame();
  const seed = f % 6;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width={W} height={H}>
        <filter id={`gr${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={seed} />
        </filter>
        <rect width={W} height={H} filter={`url(#gr${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Hologram treatment: teal tint, scanlines, flicker. */
export const Holo: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = C.turquoise,
  style,
}) => {
  const f = useCurrentFrame();
  const flick = 0.82 + 0.18 * Math.abs(Math.sin(f * 1.7) * Math.sin(f * 0.31));
  return (
    <div
      style={{
        position: "absolute",
        opacity: flick,
        filter: `drop-shadow(0 0 14px ${color})`,
        ...style,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `repeating-linear-gradient(0deg, ${color}22 0px, ${color}22 2px, transparent 2px, transparent 6px)`,
          backgroundPositionY: f * 2,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};

/* ---------------- Deco frames / panels ---------------- */

/** Thin gold Art Deco frame around the whole video. */
export const DecoFrame: React.FC<{ color?: string; opacity?: number }> = ({ color = C.gold, opacity = 0.75 }) => {
  const m = 26;
  const corner = (rot: number, x: number, y: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M0,0 L120,0 M0,0 L0,120 M14,14 L80,14 M14,14 L14,80 M28,28 L50,28 L50,50 L28,50 Z" stroke={color} strokeWidth={3} fill="none" />
      <path d="M0,0 L40,40" stroke={color} strokeWidth={2} />
      <circle cx={39} cy={39} r={5} fill={color} />
    </g>
  );
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <svg width={W} height={H}>
        <rect x={m} y={m} width={W - m * 2} height={H - m * 2} fill="none" stroke={color} strokeWidth={2} />
        <rect x={m + 8} y={m + 8} width={W - m * 2 - 16} height={H - m * 2 - 16} fill="none" stroke={color} strokeWidth={1} opacity={0.6} />
        {corner(0, m, m)}
        {corner(90, W - m, m)}
        {corner(180, W - m, H - m)}
        {corner(270, m, H - m)}
      </svg>
    </AbsoluteFill>
  );
};

/** Stepped-corner Art Deco panel. Renders children inside. */
export const DecoPanel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  stroke?: string;
  children?: React.ReactNode;
  glow?: string;
}> = ({ x, y, w, h, fill = "#0d1535", stroke = C.gold, children, glow }) => {
  const s = 26;
  const d = `M${s},0 L${w - s},0 L${w - s},${s * 0.5} L${w - s * 0.5},${s * 0.5} L${w - s * 0.5},${s} L${w},${s} L${w},${h - s} L${w - s * 0.5},${h - s} L${w - s * 0.5},${h - s * 0.5} L${w - s},${h - s * 0.5} L${w - s},${h} L${s},${h} L${s},${h - s * 0.5} L${s * 0.5},${h - s * 0.5} L${s * 0.5},${h - s} L0,${h - s} L0,${s} L${s * 0.5},${s} L${s * 0.5},${s * 0.5} L${s},${s * 0.5} Z`;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
      <svg width={w} height={h} style={{ position: "absolute", overflow: "visible", filter: glow ? `drop-shadow(0 0 18px ${glow})` : undefined }}>
        <path d={d} fill={fill} stroke={stroke} strokeWidth={4} />
        <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} opacity={0.6} transform={`translate(${w * 0.02} ${h * 0.02}) scale(0.96)`} />
      </svg>
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
};

/** Row of chasing marquee bulbs. */
export const Bulbs: React.FC<{ x: number; y: number; w: number; n?: number; vertical?: boolean }> = ({
  x,
  y,
  w,
  n = 20,
  vertical,
}) => {
  const f = useCurrentFrame();
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const on = (i + Math.floor(f / 4)) % 3 === 0;
        const px = vertical ? x : x + (i / (n - 1)) * w;
        const py = vertical ? y + (i / (n - 1)) * w : y;
        return (
          <circle
            key={i}
            cx={px}
            cy={py}
            r={9}
            fill={on ? "#fff6d0" : C.goldDark}
            style={on ? { filter: `drop-shadow(0 0 10px ${C.goldLight})` } : undefined}
          />
        );
      })}
    </g>
  );
};

/** Big deco label text (for signs inside illustrations). */
export const SignText: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  glow?: string;
  font?: string;
  style?: React.CSSProperties;
}> = ({ children, size = 40, color = C.goldLight, glow, font = F.deco, style }) => (
  <div
    style={{
      fontFamily: font,
      fontSize: size,
      color,
      textShadow: glow ? `0 0 12px ${glow}, 0 0 30px ${glow}` : undefined,
      letterSpacing: size * 0.06,
      lineHeight: 1,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Utility: 0..1 progress between two times with clamp. */
export const prog = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/* ---------------- Environment pieces ---------------- */

/** Concentric stepped Art Deco arches (theatre proscenium). */
export const DecoArch: React.FC<{ cx?: number; base?: number; w?: number; h?: number; color?: string; rings?: number; opacity?: number }> = ({
  cx = W / 2,
  base = H,
  w = 900,
  h = 820,
  color = C.gold,
  rings = 5,
  opacity = 0.7,
}) => (
  <AbsoluteFill style={{ opacity }}>
    <svg width={W} height={H}>
      {new Array(rings).fill(0).map((_, i) => {
        const ww = w - i * 70;
        const hh = h - i * 60;
        const x0 = cx - ww / 2;
        const r = ww / 2;
        return (
          <path
            key={i}
            d={`M${x0},${base} L${x0},${base - hh + r} A${r},${r} 0 0,1 ${x0 + ww},${base - hh + r} L${x0 + ww},${base}`}
            fill="none"
            stroke={i % 2 ? C.teal : color}
            strokeWidth={i === 0 ? 10 : 4}
          />
        );
      })}
      <path d={`M${cx - 30},${base - h - 10} L${cx},${base - h - 70} L${cx + 30},${base - h - 10} Z`} fill={color} />
    </svg>
  </AbsoluteFill>
);

export const Curtains: React.FC<{ open?: number; color?: string }> = ({ open = 1, color = "#7a0e35" }) => {
  const f = useCurrentFrame();
  const side = (left: boolean) => {
    const w = 420 - open * 220;
    const folds = 7;
    const d: string[] = [];
    for (let i = 0; i < folds; i++) {
      const x = (i / folds) * w;
      const sway = Math.sin(f / 30 + i) * 4;
      d.push(`M${x},0 Q${x + w / folds / 2 + sway},${H / 2} ${x},${H}`);
    }
    return (
      <svg width={w} height={H} style={{ position: "absolute", top: 0, [left ? "left" : "right"]: 0, transform: left ? undefined : "scaleX(-1)" }}>
        <defs>
          <linearGradient id={`cur${left}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={color} />
            <stop offset="0.5" stopColor="#b3164f" />
            <stop offset="1" stopColor="#4a0620" />
          </linearGradient>
        </defs>
        <rect width={w} height={H} fill={`url(#cur${left})`} />
        {d.map((p, i) => (
          <path key={i} d={p} stroke="#2a0010" strokeWidth={10} fill="none" opacity={0.45} />
        ))}
        <rect y={0} width={w} height={70} fill={C.goldDark} />
        <path d={`M0,70 ${new Array(12).fill(0).map((_, k) => `L${(k + 0.5) * (w / 12)},100 L${(k + 1) * (w / 12)},70`).join(" ")}`} fill={C.gold} />
      </svg>
    );
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {side(true)}
      {side(false)}
    </AbsoluteFill>
  );
};

/** Perspective floor: checkerboard (kitchen / ballroom) or neon grid (dance). */
export const Floor: React.FC<{ kind?: "checker" | "neon" | "stage"; horizon?: number; speed?: number }> = ({ kind = "stage", horizon = 760, speed = 0 }) => {
  const f = useCurrentFrame();
  const vx = W / 2;
  const lines = [];
  const n = 16;
  for (let i = -n; i <= n; i++) {
    lines.push(<line key={`v${i}`} x1={vx + i * 18} y1={horizon} x2={vx + i * 260} y2={H + 40} stroke={kind === "neon" ? C.pink : C.goldDark} strokeWidth={kind === "neon" ? 3 : 2} opacity={0.8} />);
  }
  const rows = 12;
  for (let r = 0; r < rows; r++) {
    const p = ((r + (speed ? (f * speed) % 1 : 0)) / rows) ** 2.2;
    const y = horizon + p * (H - horizon + 40);
    lines.push(<line key={`h${r}`} x1={0} y1={y} x2={W} y2={y} stroke={kind === "neon" ? C.turquoise : C.goldDark} strokeWidth={kind === "neon" ? 3 : 2} opacity={0.8} />);
  }
  return (
    <AbsoluteFill>
      <svg width={W} height={H}>
        <defs>
          <linearGradient id={`fl${kind}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={kind === "checker" ? "#2a2440" : kind === "neon" ? "#12002a" : "#2a1408"} />
            <stop offset="1" stopColor={kind === "checker" ? "#0e0c1c" : kind === "neon" ? "#05000f" : "#120802"} />
          </linearGradient>
          {kind === "checker" && (
            <pattern id="checks" width="160" height="160" patternUnits="userSpaceOnUse" patternTransform="scale(1 0.35) rotate(45)">
              <rect width="80" height="80" fill="#e9e1cc" />
              <rect x="80" y="80" width="80" height="80" fill="#e9e1cc" />
              <rect x="80" width="80" height="80" fill="#1a1a2a" />
              <rect y="80" width="80" height="80" fill="#1a1a2a" />
            </pattern>
          )}
        </defs>
        <rect x={0} y={horizon} width={W} height={H - horizon} fill={kind === "checker" ? "url(#checks)" : `url(#fl${kind})`} />
        {kind !== "checker" && lines}
        {kind === "stage" && <rect x={0} y={horizon} width={W} height={8} fill={C.gold} />}
      </svg>
    </AbsoluteFill>
  );
};

/** Falling binary digits. */
export const BinaryRain: React.FC<{ opacity?: number; color?: string }> = ({ opacity = 0.6, color = C.turquoise }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, fontFamily: "monospace", fontSize: 30, color }}>
      {new Array(34).fill(0).map((_, i) => {
        const x = (i / 34) * W + random(`bx${i}`) * 30;
        const sp = 4 + random(`bs${i}`) * 8;
        const y0 = ((f * sp + random(`by${i}`) * H) % (H + 400)) - 400;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y0, lineHeight: "34px", textShadow: `0 0 8px ${color}` }}>
            {new Array(10).fill(0).map((__, k) => (
              <div key={k} style={{ opacity: k / 10 }}>{random(`b${i}${k}${Math.floor(f / 6)}`) > 0.5 ? 1 : 0}</div>
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Confetti: React.FC<{ n?: number; t0?: number }> = ({ n = 80, t0 = 0 }) => {
  const f = useCurrentFrame();
  const cols = [C.gold, C.pink, C.turquoise, C.goldLight, C.pinkSoft];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H}>
        {new Array(n).fill(0).map((_, i) => {
          const tt = Math.max(0, f - t0) + random(`cf${i}`) * 200;
          const x = random(`cx${i}`) * W + Math.sin(tt / 14 + i) * 40;
          const y = ((tt * (3 + random(`cv${i}`) * 4)) % (H + 100)) - 50;
          return <rect key={i} x={x} y={y} width={14} height={8} fill={cols[i % cols.length]} transform={`rotate(${tt * 6 + i * 30} ${x} ${y})`} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Drifting smoke haze for lounge scenes. */
export const Haze: React.FC<{ color?: string; opacity?: number }> = ({ color = "#9fb4d8", opacity = 0.18 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none", mixBlendMode: "screen" }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: ((f * (0.6 + i * 0.3) + i * 500) % (W + 1200)) - 900,
            top: 200 + i * 180,
            width: 1100,
            height: 340,
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
            filter: "blur(30px)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** Pops content in with a springy scale whenever `k` (an id) changes; `age` = seconds since change. */
export const Pop: React.FC<{ age: number; children: React.ReactNode; style?: React.CSSProperties; from?: number }> = ({ age, children, style, from = 0.2 }) => {
  const p = Math.max(0, Math.min(1, age / 0.35));
  const c = 1.9;
  const q = p - 1;
  const s = from + (1 - from) * (1 + (c + 1) * q * q * q + c * q * q);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${s}) rotate(${(1 - p) * -8}deg)`, opacity: Math.min(1, age / 0.12), ...style }}>
      {children}
    </div>
  );
};
