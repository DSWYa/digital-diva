import React from "react";
import { C } from "../theme";
import { clamp01, Stroke } from "./hud";

/**
 * Monoline drawings. Every drawing is authored in a local box and placed with
 * x/y/s. `p` = draw-on progress (0..1), `t` = seconds for idle motion.
 * Each stroke is inked twice with a small offset for a hand-plotted look.
 */
type Art = { x: number; y: number; s?: number; p?: number; t?: number; color?: string; rot?: number };

export const Ink: React.FC<{ d: string; p?: number; color?: string; w?: number; fill?: string; glow?: boolean; dash?: string }> = ({
  d,
  p = 1,
  color = C.line,
  w = 2,
  fill,
  glow,
  dash,
}) => (
  <>
    {fill && <path d={d} fill={fill} opacity={clamp01(p * 1.5 - 0.5)} />}
    <Stroke d={d} p={p} color={color} w={w} glow={glow} dash={dash} />
    <Stroke d={d} p={p} color={color} w={w * 0.6} opacity={0.3} transform="translate(2.2 -1.6)" dash={dash} />
  </>
);

const G: React.FC<Art & { children: React.ReactNode }> = ({ x, y, s = 1, rot = 0, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>{children}</g>
);

/** staggered progress for the i-th of n strokes */
const sp = (p: number, i: number, n: number) => clamp01(p * n * 0.7 - i * 0.7 + 0.3);

export const Grandma: React.FC<Art & { glasses?: "eyes" | "head"; mood?: "happy" | "confused" | "talk" }> = ({
  p = 1,
  t = 0,
  color = C.line,
  glasses = "eyes",
  mood = "happy",
  ...g
}) => {
  const bob = Math.sin(t * 2) * 3;
  const mouth = mood === "talk" ? 6 + Math.abs(Math.sin(t * 11)) * 10 : 0;
  const n = 12;
  const gy = glasses === "head" ? -92 : 0;
  return (
    <G {...g}>
      <g transform={`translate(0 ${bob})`}>
        <Ink p={sp(p, 0, n)} color={color} d="M 160 66 a 40 40 0 1 1 80 0 a 40 40 0 1 1 -80 0" />
        <Ink p={sp(p, 1, n)} color={color} d="M 110 190 C 104 120 150 92 200 92 C 250 92 296 120 290 190 C 292 250 262 300 200 304 C 138 300 108 250 110 190 Z" />
        <Ink p={sp(p, 2, n)} color={color} d="M 112 170 C 130 120 170 112 200 124 C 230 112 270 120 288 170" />
        <g transform={`translate(0 ${gy}) rotate(${glasses === "head" ? -5 : 0} 200 200)`}>
          <Ink p={sp(p, 3, n)} color={glasses === "head" ? C.pink : color} glow={glasses === "head"} d="M 140 200 a 26 26 0 1 0 52 0 a 26 26 0 1 0 -52 0 M 208 200 a 26 26 0 1 0 52 0 a 26 26 0 1 0 -52 0 M 192 198 q 8 -8 16 0" />
        </g>
        {glasses === "head" ? (
          <Ink p={sp(p, 4, n)} color={color} d="M 152 204 l 26 0 M 222 204 l 26 0" />
        ) : (
          <Ink p={sp(p, 4, n)} color={color} d="M 160 202 q 6 -6 12 0 M 228 202 q 6 -6 12 0" />
        )}
        {mood === "confused" ? (
          <Ink p={sp(p, 5, n)} color={color} d="M 145 168 q 18 -12 36 4 M 218 160 q 20 -10 36 2" />
        ) : (
          <Ink p={sp(p, 5, n)} color={color} d="M 145 170 q 18 -10 36 0 M 219 170 q 18 -10 36 0" />
        )}
        <Ink p={sp(p, 6, n)} color={color} d="M 200 214 c -8 22 -4 30 8 30" />
        {mouth > 0 ? (
          <Ink p={sp(p, 7, n)} color={color} d={`M 182 270 q 18 ${mouth} 36 0 q -18 ${-mouth * 0.3} -36 0`} />
        ) : mood === "confused" ? (
          <Ink p={sp(p, 7, n)} color={color} d="M 184 272 q 16 -8 32 4" />
        ) : (
          <Ink p={sp(p, 7, n)} color={color} d="M 176 262 q 24 22 48 0" />
        )}
        <Ink p={sp(p, 8, n)} color={color} d="M 176 302 L 176 330 M 224 302 L 224 330" />
        <Ink p={sp(p, 9, n)} color={color} d="M 70 520 C 70 400 110 340 176 330 L 200 380 L 224 330 C 290 340 330 400 330 520" />
        <Ink p={sp(p, 10, n)} color={color} d="M 200 380 L 200 520 M 214 410 l 0 2 M 214 450 l 0 2 M 214 490 l 0 2" w={3} />
        <Ink p={sp(p, 11, n)} color={color} d="M 156 336 C 166 372 234 372 244 336" dash="2 9" />
      </g>
    </G>
  );
};

export const Phone: React.FC<Art & { ring?: boolean }> = ({ p = 1, t = 0, color = C.line, ring, ...g }) => {
  const shake = ring ? Math.sin(t * 60) * 3 : 0;
  return (
    <G {...g}>
      <g transform={`translate(${shake} 0)`}>
        <Ink p={sp(p, 0, 4)} color={color} d="M 40 200 L 70 120 L 290 120 L 320 200 L 320 280 L 40 280 Z" />
        <Ink p={sp(p, 1, 4)} color={color} d={`M 20 110 C 20 60 340 60 340 110 L 300 ${126 - (ring ? Math.abs(Math.sin(t * 30)) * 14 : 0)} L 60 ${126 - (ring ? Math.abs(Math.sin(t * 30)) * 14 : 0)} Z`} />
        <Ink p={sp(p, 2, 4)} color={color} d="M 120 200 a 60 60 0 1 0 120 0 a 60 60 0 1 0 -120 0 M 160 200 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0" />
        <Ink p={sp(p, 3, 4)} color={color} d="M 140 168 l 0 1 M 180 152 l 0 1 M 220 168 l 0 1 M 230 206 l 0 1 M 132 206 l 0 1 M 150 240 l 0 1" w={6} />
      </g>
    </G>
  );
};

export const Computer: React.FC<Art> = ({ p = 1, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={sp(p, 0, 4)} color={color} d="M 0 0 L 420 0 L 420 300 L 0 300 Z" />
    <Ink p={sp(p, 1, 4)} color={color} d="M 26 24 L 394 24 L 394 250 L 26 250 Z" />
    <Ink p={sp(p, 2, 4)} color={color} d="M 160 300 L 140 340 L 280 340 L 260 300 M 40 362 L 380 362 L 410 410 L 10 410 Z" />
    <Ink p={sp(p, 3, 4)} color={color} d="M 60 380 h 300 M 50 394 h 320" dash="6 6" />
  </G>
);

export const RockingChair: React.FC<Art> = ({ p = 1, t = 0, color = C.line, ...g }) => {
  const a = Math.sin(t * 2.6) * 9;
  return (
    <G {...g}>
      <g transform={`rotate(${a} 200 400)`}>
        <Ink p={sp(p, 0, 5)} color={color} d="M 20 380 C 120 440 300 440 380 360" />
        <Ink p={sp(p, 1, 5)} color={color} d="M 100 70 L 120 260 L 300 260 L 300 380 M 120 260 L 110 410 M 280 70 L 300 260" />
        <Ink p={sp(p, 2, 5)} color={color} d="M 100 70 L 280 70 M 104 110 L 284 110 M 108 150 L 288 150 M 112 190 L 292 190" />
        <Ink p={sp(p, 3, 5)} color={color} d="M 110 250 L 320 250 L 320 270" />
      </g>
      <Ink p={sp(p, 4, 5)} color={C.pink} glow d="M 320 300 C 400 330 420 420 520 430" />
      <Ink p={sp(p, 4, 5)} color={C.pink} d="M 520 410 l 30 0 l 0 40 l -30 0 Z M 550 420 l 20 0 M 550 440 l 20 0" />
    </G>
  );
};

export const Duck: React.FC<Art> = ({ p = 1, t = 0, color = C.line, ...g }) => (
  <G {...g}>
    <g transform={`translate(0 ${Math.sin(t * 3) * 6})`}>
      <Ink p={sp(p, 0, 4)} color={color} d="M 40 250 C 40 190 120 170 190 200 C 210 120 300 110 320 170 C 340 180 370 182 380 196 C 360 210 330 206 316 200 C 320 240 300 300 200 310 C 120 316 50 300 40 250 Z" />
      <Ink p={sp(p, 1, 4)} color={color} d="M 100 240 C 140 220 190 230 210 260" />
      <Ink p={sp(p, 2, 4)} color={color} d="M 270 160 q 10 -8 20 0 M 272 156 l -4 -10 M 282 152 l 0 -11 M 292 156 l 4 -10" />
      <Ink p={sp(p, 3, 4)} color={C.pink} glow d="M 380 196 L 440 160 M 440 160 a 16 16 0 1 0 0.1 0" />
    </g>
    <Ink p={p} color={color} d="M -20 330 q 40 -12 80 0 t 80 0 t 80 0 t 80 0 t 80 0" dash="4 8" />
  </G>
);

export const Couple: React.FC<Art> = ({ p = 1, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={sp(p, 0, 4)} color={color} d="M 90 90 a 40 40 0 1 0 80 0 a 40 40 0 1 0 -80 0 M 230 96 a 38 38 0 1 0 76 0 a 38 38 0 1 0 -76 0" />
    <Ink p={sp(p, 1, 4)} color={color} d="M 60 400 L 80 170 C 100 150 160 150 180 170 L 200 400 M 118 170 L 130 240 L 142 170" />
    <Ink p={sp(p, 2, 4)} color={color} d="M 200 400 C 230 300 240 230 246 170 L 290 170 C 300 230 320 300 360 400 Z M 230 56 C 300 40 350 120 370 300" />
    <Ink p={sp(p, 3, 4)} color={C.pink} d="M 200 40 c 6 -10 20 -4 14 6 l -14 14 l -14 -14 c -6 -10 8 -16 14 -6 z" />
  </G>
);

export const Cow: React.FC<Art> = ({ p = 1, t = 0, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={sp(p, 0, 6)} color={color} d="M 110 110 C 60 100 40 120 50 136 C 80 140 100 134 112 126 M 290 110 C 340 100 360 120 350 136 C 320 140 300 134 288 126" />
    <Ink p={sp(p, 1, 6)} color={color} d="M 120 70 C 110 40 130 30 140 60 M 280 70 C 290 40 270 30 260 60" />
    <Ink p={sp(p, 2, 6)} color={color} d="M 110 140 C 100 70 300 70 290 140 C 300 200 290 230 200 236 C 110 230 100 200 110 140 Z" />
    <Ink p={sp(p, 3, 6)} color={color} d={`M 130 230 C 120 300 280 300 270 230 M 170 262 l 0 ${2 + Math.sin(t * 6)} M 230 262 l 0 2`} w={3} />
    <Ink p={sp(p, 4, 6)} color={color} d="M 150 140 a 8 10 0 1 0 0.1 0 M 250 140 a 8 10 0 1 0 0.1 0 M 130 100 C 160 90 170 120 150 130" />
    <Ink p={sp(p, 5, 6)} color={C.pink} glow d="M 110 80 C 150 50 250 50 290 80 M 130 70 C 60 160 50 300 70 400 M 270 70 C 340 160 350 300 330 400" />
  </G>
);

export const Bell: React.FC<Art> = ({ p = 1, t = 0, color = C.line, ...g }) => {
  const a = Math.sin(t * 28) * 14 * Math.exp(-((t * 1.6) % 1.2) * 2);
  return (
    <G {...g}>
      <g transform={`rotate(${a} 100 0)`}>
        <Ink p={sp(p, 0, 3)} color={color} d="M 20 170 C 20 80 50 30 100 30 C 150 30 180 80 180 170 L 200 196 L 0 196 Z" />
        <Ink p={sp(p, 1, 3)} color={color} d="M 100 30 L 100 0 M 84 214 a 16 16 0 1 0 32 0" />
      </g>
      <Ink p={sp(p, 2, 3)} color={color} d="M -30 60 q -20 60 0 120 M -60 40 q -30 80 0 160 M 230 60 q 20 60 0 120 M 260 40 q 30 80 0 160" />
    </G>
  );
};

export const Globe: React.FC<Art> = ({ p = 1, t = 0, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={p} color={color} d="M 0 0 m -200 0 a 200 200 0 1 0 400 0 a 200 200 0 1 0 -400 0" />
    {[-140, -70, 0, 70, 140].map((y, i) => {
      const r = Math.sqrt(200 * 200 - y * y);
      return <Ink key={y} p={sp(p, i, 9)} color={color} w={1} d={`M ${-r} ${y} A ${r} ${r * 0.18} 0 0 0 ${r} ${y}`} />;
    })}
    {[0, 1, 2, 3].map((k) => {
      const rx = Math.abs(Math.cos(t * 0.6 + k * 0.78)) * 200;
      return <Ink key={k} p={sp(p, 5 + k, 9)} color={color} w={1} d={`M 0 -200 A ${rx} 200 0 0 ${Math.cos(t * 0.6 + k * 0.78) > 0 ? 1 : 0} 0 200`} />;
    })}
  </G>
);

export const Potato: React.FC<Art> = ({ p = 1, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={sp(p, 0, 3)} color={color} d="M 30 170 C 10 90 120 30 220 40 C 340 50 400 120 380 200 C 360 280 240 300 150 290 C 80 284 40 240 30 170 Z" />
    <Ink p={sp(p, 1, 3)} color={color} d="M 110 110 l 1 1 M 290 90 l 1 1 M 320 220 l 1 1 M 180 240 l 1 1 M 240 150 l 1 1" w={5} />
    <Ink p={sp(p, 2, 3)} color={color} d="M 100 200 c 20 -10 30 -4 40 6 M 270 70 c 14 4 24 12 28 24" w={1.5} />
  </G>
);

export const Printer: React.FC<Art> = ({ p = 1, t = 0, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={sp(p, 0, 5)} color={color} d="M 0 120 L 440 120 L 440 300 L 0 300 Z" />
    <Ink p={sp(p, 1, 5)} color={color} d="M 60 120 L 90 20 L 350 20 L 380 120" dash="10 8" />
    <Ink p={sp(p, 2, 5)} color={color} d="M 60 300 L 60 360 L 380 360 L 380 300 M 80 200 L 360 200" />
    <Ink p={sp(p, 3, 5)} color={color} d="M 380 160 L 420 160 L 420 190 L 380 190 Z" />
    <Ink p={sp(p, 4, 5)} color={Math.floor(t * 3) % 2 ? C.pink : C.dim} glow d="M 30 150 a 6 6 0 1 0 0.1 0" />
  </G>
);

export const Trumpet: React.FC<Art> = ({ p = 1, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={sp(p, 0, 4)} color={color} d="M 0 100 L 40 100 M 40 92 L 40 108 L 380 108 L 380 92 Z" />
    <Ink p={sp(p, 1, 4)} color={color} d="M 380 92 C 440 80 480 30 520 10 L 520 190 C 480 170 440 120 380 108" />
    <Ink p={sp(p, 2, 4)} color={color} d="M 120 108 L 120 150 C 120 170 300 170 300 150 L 300 108 M 140 150 L 280 150" />
    <Ink p={sp(p, 3, 4)} color={color} d="M 170 92 L 170 50 M 200 92 L 200 50 M 230 92 L 230 50 M 162 50 h 16 M 192 50 h 16 M 222 50 h 16" />
  </G>
);

/** Black cat silhouette with contour echoes (walks/sits). */
export const Cat: React.FC<Art & { typing?: boolean; paper?: boolean }> = ({ p = 1, t = 0, typing, paper, ...g }) => {
  const paw = typing ? Math.max(0, Math.sin(t * 18)) * 12 : 0;
  const paw2 = typing ? Math.max(0, Math.sin(t * 18 + Math.PI)) * 12 : 0;
  const tail = Math.sin(t * 2.4) * 16;
  const body = `M 80 330 C 60 250 90 180 150 170 C 150 120 170 80 200 70 L 210 30 L 236 66 L 270 66 L 296 30 L 304 74 C 330 96 334 140 320 170 C 380 190 400 260 380 330 Z`;
  const tailD = `M 370 310 C 450 300 460 ${210 + tail} ${420 + tail} 140`;
  const ink = paper ? C.paperInk : C.line;
  return (
    <G {...g}>
      {[18, 12, 6].map((o, i) => (
        <path key={o} d={body} transform={`translate(${-o * 0.4} ${o * 0.2})`} fill="none" stroke={ink} strokeWidth={1.5} opacity={(0.25 + i * 0.15) * p} />
      ))}
      <path d={tailD} fill="none" stroke={ink} strokeWidth={10} strokeLinecap="round" opacity={p} />
      <path d={body} fill={paper ? "#1b1a1d" : "#040405"} stroke={ink} strokeWidth={2} opacity={p} />
      <path d={`M 120 ${330 - paw} l 40 0 M 250 ${330 - paw2} l 40 0`} stroke={ink} strokeWidth={14} strokeLinecap="round" opacity={p} />
      <circle cx={232} cy={118} r={7} fill={C.pink} opacity={p} style={{ filter: `drop-shadow(0 0 6px ${C.pink})` }} />
      <circle cx={282} cy={118} r={7} fill={C.pink} opacity={p} style={{ filter: `drop-shadow(0 0 6px ${C.pink})` }} />
    </G>
  );
};

export const Fridge: React.FC<Art> = ({ p = 1, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={sp(p, 0, 4)} color={color} d="M 0 0 L 260 0 L 260 520 L 0 520 Z M 0 170 L 260 170" />
    <Ink p={sp(p, 1, 4)} color={color} d="M 260 0 L 400 -40 L 400 560 L 260 520" />
    <Ink p={sp(p, 2, 4)} color={color} d="M 20 260 h 220 M 20 360 h 220 M 20 450 h 220" dash="3 7" />
    <Ink p={sp(p, 3, 4)} color={color} d="M 20 190 l 50 0 M 20 190 l 0 50 M 20 190 l 40 40" w={1} />
  </G>
);

export const Glass: React.FC<Art & { fill?: number }> = ({ p = 1, t = 0, color = C.line, fill = 1, ...g }) => {
  const lvl = 300 - fill * 220;
  return (
    <G {...g}>
      <Ink p={p} color={color} d="M 0 0 L 160 0 L 140 300 L 20 300 Z" />
      {new Array(Math.floor(fill * 12)).fill(0).map((_, i) => (
        <line key={i} x1={14 + i * 0.6} y1={300 - i * 18} x2={146 - i * 0.6} y2={300 - i * 18} stroke={C.pink} strokeWidth={1.5} opacity={0.7} />
      ))}
      <Ink p={p} color={C.pink} glow d={`M 8 ${lvl} q 38 ${Math.sin(t * 3) * 6} 76 0 t 70 0`} />
    </G>
  );
};

export const Laptop: React.FC<Art> = ({ p = 1, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={sp(p, 0, 3)} color={color} d="M 40 0 L 700 0 L 700 420 L 40 420 Z" />
    <Ink p={sp(p, 1, 3)} color={color} d="M 0 440 L 740 440 L 780 480 L -40 480 Z" />
    <Ink p={sp(p, 2, 3)} color={color} d="M 320 460 h 100" />
  </G>
);

export const Moon: React.FC<Art> = ({ p = 1, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={p} color={color} d="M 0 -160 A 160 160 0 1 0 0 160 A 120 160 0 1 1 0 -160 Z" />
    <Ink p={p} color={color} d="M -90 -40 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0 M -110 50 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0" w={1} />
  </G>
);

export const Mayo: React.FC<Art> = ({ p = 1, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={sp(p, 0, 4)} color={color} d="M 20 60 L 220 60 L 220 100 L 20 100 Z" />
    <Ink p={sp(p, 1, 4)} color={color} d="M 0 140 C 0 110 240 110 240 140 L 240 380 C 240 420 0 420 0 380 Z" />
    <Ink p={sp(p, 2, 4)} color={color} d="M 0 200 L 240 200 M 0 300 L 240 300" />
    <Ink p={sp(p, 3, 4)} color={C.pink} glow d="M 60 120 L 60 380 M 100 120 L 100 380 M 140 120 L 140 380 M 180 120 L 180 380" w={1.2} />
  </G>
);

export const Head: React.FC<Art> = ({ p = 1, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={sp(p, 0, 3)} color={color} d="M 120 420 L 120 340 C 60 320 40 260 40 200 C 40 90 120 30 210 30 C 300 30 360 90 360 180 C 360 210 380 230 390 260 L 360 270 C 370 300 360 340 320 340 L 300 340 L 300 420" />
    <Ink p={sp(p, 1, 3)} color={color} d="M 330 210 l 0 1 M 290 290 q 20 6 36 -6" w={3} />
    <Ink p={sp(p, 2, 3)} color={color} d="M 120 120 C 160 60 260 50 320 100" w={1} />
  </G>
);

export const Router: React.FC<Art> = ({ p = 1, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={sp(p, 0, 2)} color={color} d="M 0 120 L 300 120 L 300 190 L 0 190 Z M 40 150 h 1 M 80 150 h 1 M 120 150 h 1" />
    <Ink p={sp(p, 1, 2)} color={color} d="M 40 120 L 20 20 M 260 120 L 280 20" />
  </G>
);

export const Fish: React.FC<Art> = ({ p = 1, t = 0, color = C.line, ...g }) => (
  <G {...g}>
    <g transform={`translate(${Math.sin(t * 2) * 30} 0) scale(${Math.cos(t * 2) > 0 ? 1 : -1} 1)`}>
      <Ink p={p} color={color} d="M -70 0 C -40 -40 30 -40 60 0 C 30 40 -40 40 -70 0 Z M 60 0 L 100 -30 L 100 30 Z M -40 -6 l 1 1" />
    </g>
    <Ink p={p} color={color} d="M -150 -40 A 160 150 0 1 0 150 -40" />
  </G>
);

export const Plate: React.FC<Art> = ({ p = 1, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={p} color={color} d="M -220 0 A 220 70 0 1 0 220 0 A 220 70 0 1 0 -220 0 M -150 0 A 150 44 0 1 0 150 0 A 150 44 0 1 0 -150 0" />
    <Ink p={p} color={color} d="M -60 -10 C -40 -60 10 -60 20 -10 M 40 -6 a 20 14 0 1 0 0.1 0" />
  </G>
);

export const Brain: React.FC<Art & { boom?: number }> = ({ p = 1, color = C.line, boom = 0, ...g }) => {
  const parts = [
    "M -130 10 C -150 -80 -60 -130 0 -100",
    "M 0 -100 C 60 -130 150 -80 130 10",
    "M 130 10 C 140 80 60 110 0 90",
    "M 0 90 C -60 110 -140 80 -130 10",
    "M 0 -100 L 0 90",
    "M -90 -40 C -60 -20 -80 10 -50 30 M 90 -40 C 60 -20 80 10 50 30",
  ];
  return (
    <G {...g}>
      {parts.map((d, i) => {
        const a = (i / parts.length) * Math.PI * 2;
        return (
          <g key={i} transform={`translate(${Math.cos(a) * boom * 260} ${Math.sin(a) * boom * 200}) rotate(${boom * (i % 2 ? 40 : -40)})`}>
            <Ink p={sp(p, i, parts.length)} color={boom > 0.05 ? C.pink : color} glow={boom > 0.05} d={d} />
          </g>
        );
      })}
    </G>
  );
};

export const Smartphone: React.FC<Art> = ({ p = 1, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={sp(p, 0, 2)} color={color} d="M 30 0 L 270 0 C 290 0 300 10 300 30 L 300 570 C 300 590 290 600 270 600 L 30 600 C 10 600 0 590 0 570 L 0 30 C 0 10 10 0 30 0 Z" />
    <Ink p={sp(p, 1, 2)} color={color} d="M 120 24 h 60 M 20 60 L 280 60 L 280 540 L 20 540 Z" />
  </G>
);

export const Toaster: React.FC<Art> = ({ p = 1, t = 0, color = C.line, ...g }) => {
  const pop = Math.max(0, Math.sin(t * 2)) * 50;
  return (
    <G {...g}>
      <Ink p={sp(p, 0, 4)} color={color} d={`M 90 ${40 - pop} L 190 ${40 - pop} L 190 120 L 90 120 Z M 230 ${40 - pop} L 330 ${40 - pop} L 330 120 L 230 120 Z`} />
      <Ink p={sp(p, 1, 4)} color={color} d="M 40 100 C 40 70 380 70 380 100 L 380 330 C 380 360 40 360 40 330 Z" />
      <Ink p={sp(p, 2, 4)} color={color} d="M 120 190 L 300 190 L 300 290 L 120 290 Z M 380 200 L 420 200" />
      <Ink p={sp(p, 3, 4)} color={C.pink} glow d="M 210 270 C 150 230 160 200 190 205 C 200 207 207 214 210 222 C 213 214 220 207 230 205 C 260 200 270 230 210 270 Z" />
    </G>
  );
};

export const Envelope: React.FC<Art> = ({ p = 1, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={p} color={color} d="M 0 0 L 360 0 L 360 230 L 0 230 Z M 0 0 L 180 130 L 360 0" />
  </G>
);

export const Plug: React.FC<Art & { gap?: number }> = ({ p = 1, color = C.line, gap = 1, ...g }) => (
  <G {...g}>
    <Ink p={sp(p, 0, 3)} color={color} d="M 560 60 L 720 60 L 720 300 L 560 300 Z M 610 140 l 0 50 M 670 140 l 0 50 M 630 240 a 10 10 0 1 0 20 0" />
    <g transform={`translate(${-gap * 160} ${gap * 40})`}>
      <Ink p={sp(p, 1, 3)} color={color} d="M 380 120 L 480 120 L 480 230 L 380 230 Z M 480 150 L 540 150 M 480 200 L 540 200" />
      <Ink p={sp(p, 2, 3)} color={color} d="M 380 175 C 260 175 200 300 0 320" />
    </g>
  </G>
);

export const Cup: React.FC<Art> = ({ p = 1, t = 0, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={sp(p, 0, 3)} color={color} d="M 0 0 L 220 0 L 196 220 L 24 220 Z M 220 40 C 290 40 290 140 208 140" />
    {[0, 1, 2].map((k) => (
      <Ink key={k} p={sp(p, 1, 3)} color={color} w={1.2} d={`M ${60 + k * 50} -20 q ${-16 + Math.sin(t * 3 + k) * 8} -40 0 -80 q 16 -40 0 -80`} />
    ))}
  </G>
);

export const Atom: React.FC<Art> = ({ p = 1, t = 0, color = C.line, ...g }) => (
  <G {...g}>
    {[0, 60, 120].map((r, i) => (
      <g key={r} transform={`rotate(${r + t * 8})`}>
        <Ink p={sp(p, i, 3)} color={color} d="M -240 0 A 240 80 0 1 0 240 0 A 240 80 0 1 0 -240 0" />
        <circle cx={240 * Math.cos(t * 2.4 + i * 2)} cy={80 * Math.sin(t * 2.4 + i * 2)} r={7} fill={C.pink} opacity={p} />
      </g>
    ))}
    <circle r={14} fill="none" stroke={color} strokeWidth={2} opacity={p} />
  </G>
);

export const Crown: React.FC<Art> = ({ p = 1, color = C.line, ...g }) => (
  <G {...g}>
    <Ink p={p} color={color} d="M 0 220 L -20 40 L 90 130 L 170 0 L 250 130 L 360 40 L 340 220 Z M 0 220 L 340 220 L 340 260 L 0 260 Z" />
  </G>
);
