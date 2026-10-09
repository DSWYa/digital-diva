import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../../theme";
import { singing } from "../../lib/timing";

export type DivaPose =
  | "idle"
  | "hip"
  | "wave"
  | "present"
  | "shrug"
  | "facepalm"
  | "point"
  | "cheer"
  | "mic"
  | "trumpet"
  | "think"
  | "cover";
export type DivaFace =
  | "smile"
  | "smirk"
  | "shock"
  | "unamused"
  | "love"
  | "angry"
  | "wink"
  | "closed"
  | "error";

// Arm spec: [shoulder angle, elbow bend] (0 = hanging down, + = toward screen-left)
// or {to: [x, y], elbow: "out" | "down"} solved with 2-bone IK.
type ArmSpec = [number, number] | { to: [number, number]; elbow: "out" | "down" };
const POSES: Record<DivaPose, [ArmSpec, ArmSpec]> = {
  idle: [[12, 8], [-12, -8]],
  hip: [{ to: [150, 440], elbow: "out" }, [-12, -8]],
  wave: [[12, 8], [-100, -75]],
  present: [[12, 8], [-40, -60]],
  shrug: [[30, 90], [-30, -90]],
  facepalm: [{ to: [150, 440], elbow: "out" }, { to: [214, 166], elbow: "out" }],
  point: [[12, 8], [-100, -5]],
  cheer: [[160, 15], [-160, -15]],
  mic: [{ to: [150, 440], elbow: "out" }, { to: [282, 236], elbow: "out" }],
  trumpet: [{ to: [96, 240], elbow: "down" }, { to: [142, 236], elbow: "down" }],
  think: [{ to: [252, 380], elbow: "down" }, { to: [212, 226], elbow: "down" }],
  cover: [{ to: [166, 166], elbow: "out" }, { to: [234, 166], elbow: "out" }],
};
const L1 = 98;
const L2 = 108;
const ang = (vx: number, vy: number) => (Math.atan2(-vx, vy) * 180) / Math.PI;
const solve = (spec: ArmSpec, sx: number, sy: number): [number, number] => {
  if (Array.isArray(spec)) return spec;
  const [px, py] = spec.to;
  const d = Math.min(L1 + L2 - 1, Math.max(Math.abs(L1 - L2) + 1, Math.hypot(px - sx, py - sy)));
  const base = ang(px - sx, py - sy);
  const alpha = (Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)) * 180) / Math.PI;
  const options = [base + alpha, base - alpha].map((t1) => {
    const r = (t1 * Math.PI) / 180;
    const ex = sx - Math.sin(r) * L1;
    const ey = sy + Math.cos(r) * L1;
    return { t1, ex, ey, t2: ang(px - ex, py - ey) };
  });
  const outward = (o: { ex: number }) => (sx < 200 ? -o.ex : o.ex);
  options.sort((p, q) => (spec.elbow === "out" ? outward(q) - outward(p) : q.ey - p.ey));
  const o = options[0];
  return [o.t1, o.t2 - o.t1];
};

const Arm: React.FC<{
  x: number;
  y: number;
  a1: number;
  a2: number;
  flip: boolean;
}> = ({ x, y, a1, a2, flip }) => {
  const s = flip ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a1})`}>
      <circle r={20} fill={C.gold} stroke={C.goldDark} strokeWidth={3} />
      {/* upper arm: chrome */}
      <rect x={-13} y={0} width={26} height={98} rx={13} fill="url(#divaChrome)" stroke={C.chromeDark} strokeWidth={2} />
      <line x1={-10} y1={48} x2={10} y2={48} stroke={C.chromeDark} strokeWidth={2} />
      <g transform={`translate(0 98) rotate(${a2})`}>
        <circle r={15} fill={C.gold} stroke={C.goldDark} strokeWidth={2} />
        {/* forearm: black opera glove */}
        <rect x={-12} y={0} width={24} height={92} rx={12} fill="#141228" stroke="#2a2550" strokeWidth={2} />
        <rect x={-13} y={8} width={26} height={7} rx={3} fill={C.gold} />
        {/* bracelet */}
        <rect x={-14} y={70} width={28} height={8} rx={4} fill={C.turquoise} />
        {/* hand */}
        <g transform={`translate(0 96) scale(${s} 1)`}>
          <ellipse cx={0} cy={14} rx={15} ry={19} fill="#141228" />
          <rect x={-14} y={22} width={7} height={20} rx={3.5} fill="#141228" />
          <rect x={-6} y={25} width={7} height={22} rx={3.5} fill="#141228" />
          <rect x={2} y={24} width={7} height={20} rx={3.5} fill="#141228" />
          <rect x={10} y={4} width={7} height={18} rx={3.5} fill="#141228" transform="rotate(-30 13 6)" />
          <circle cx={-2} cy={30} r={3} fill={C.pink} />
        </g>
      </g>
    </g>
  );
};

/**
 * Digital Diva: a 1920s flapper android. Rendered in a 400x900 box (full body)
 * — use `crop="bust"` for a 400x430 head-and-shoulders crop.
 */
export const Diva: React.FC<{
  pose?: DivaPose;
  face?: DivaFace;
  x?: number;
  y?: number;
  scale?: number;
  sway?: number;
  tilt?: number;
  crop?: "full" | "bust";
  talk?: boolean;
  glow?: number;
  flip?: boolean;
  eyeColor?: string;
}> = ({
  pose = "idle",
  face = "smile",
  x = 0,
  y = 0,
  scale = 1,
  sway = 1,
  tilt = 0,
  crop = "full",
  talk = true,
  glow = 0,
  flip = false,
  eyeColor = C.turquoise,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const mouth = talk ? singing(t) : 0;
  const bob = Math.sin(t * Math.PI * 2 * 1.07) * 4 * sway;
  const hipSw = Math.sin(t * Math.PI * 2 * 1.07) * 3 * sway;
  const blink = (f + 13) % 97 < 4 || face === "closed";
  const [l1, l2] = solve(POSES[pose][0], 142, 300);
  const [r1, r2] = solve(POSES[pose][1], 258, 300);
  const wob = Math.sin(t * 5.3) * 3 * sway;

  // Face geometry
  const browY = face === "shock" ? -10 : face === "angry" ? 6 : face === "unamused" ? 3 : 0;
  const browRotL = face === "angry" ? 14 : face === "unamused" ? -4 : face === "smirk" ? -8 : 0;
  const browRotR = face === "angry" ? -14 : face === "smirk" ? 10 : 0;
  const lid = face === "unamused" ? 0.5 : face === "smirk" ? 0.3 : 0;
  const mOpen = Math.max(face === "shock" ? 0.9 : face === "angry" ? 0.5 : 0, mouth);

  const eye = (cx: number, side: number) => {
    const closed = blink || (face === "wink" && side > 0);
    if (face === "love") {
      return (
        <path
          transform={`translate(${cx} 162) scale(${1 + 0.1 * Math.sin(t * 8)})`}
          d="M0,8 C-14,-4 -10,-16 0,-8 C10,-16 14,-4 0,8 Z"
          fill={C.pink}
          style={{ filter: `drop-shadow(0 0 6px ${C.pink})` }}
        />
      );
    }
    if (face === "error") {
      return (
        <g transform={`translate(${cx} 162)`} stroke={C.pink} strokeWidth={5} strokeLinecap="round">
          <line x1={-10} y1={-10} x2={10} y2={10} />
          <line x1={10} y1={-10} x2={-10} y2={10} />
        </g>
      );
    }
    if (closed) {
      return <path d={`M${cx - 18},${164} Q${cx},${174} ${cx + 18},${164}`} stroke="#1a1030" strokeWidth={4} fill="none" />;
    }
    const pupilDx = face === "unamused" ? side * -4 + 6 : 0;
    return (
      <g>
        <ellipse cx={cx} cy={162} rx={20} ry={face === "shock" ? 17 : 13} fill="#0b0b1e" />
        <ellipse cx={cx + pupilDx} cy={163} rx={11} ry={face === "shock" ? 12 : 10} fill={eyeColor} style={{ filter: `drop-shadow(0 0 6px ${eyeColor})` }} />
        <circle cx={cx + pupilDx} cy={163} r={4} fill="#eafffd" />
        <circle cx={cx + pupilDx + 4} cy={159} r={2.5} fill="#fff" />
        {lid > 0 && <rect x={cx - 22} y={147} width={44} height={30 * lid} fill="url(#divaFace)" />}
        <path d={`M${cx - 22},${155 + lid * 10} Q${cx},${143 + lid * 12} ${cx + 22},${155 + lid * 10}`} stroke="#0b0b1e" strokeWidth={4} fill="none" />
        {/* lashes */}
        <path d={`M${cx + side * 20},${154 + lid * 8} l${side * 9},-7 M${cx + side * 14},${150 + lid * 9} l${side * 6},-9`} stroke="#0b0b1e" strokeWidth={3} strokeLinecap="round" />
      </g>
    );
  };

  const mouthEl = (() => {
    const cy = 214;
    if (face === "smirk" && mOpen < 0.15) {
      return <path d={`M182,${cy} Q205,${cy + 6} 226,${cy - 8}`} stroke={C.pink} strokeWidth={7} strokeLinecap="round" fill="none" />;
    }
    if (face === "unamused" && mOpen < 0.15) {
      return <path d={`M184,${cy + 2} L222,${cy}`} stroke={C.pink} strokeWidth={7} strokeLinecap="round" />;
    }
    const h = 4 + mOpen * 22;
    const w = face === "shock" ? 18 : 24 - mOpen * 4;
    const smile = face === "smile" || face === "love" || face === "wink" ? 5 : 0;
    return (
      <g>
        <path
          d={`M${200 - w},${cy - 2} Q200,${cy - 8 - smile * 0.2} ${200 + w},${cy - 2} Q200,${cy + h + smile} ${200 - w},${cy - 2} Z`}
          fill={mOpen > 0.1 ? "#3b0a2a" : C.pink}
          stroke={C.pink}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        {mOpen > 0.25 && <ellipse cx={200} cy={cy + h * 0.55} rx={w * 0.45} ry={h * 0.18} fill={C.pinkSoft} opacity={0.7} />}
      </g>
    );
  })();

  const head = (
    <g transform={`rotate(${tilt + wob * 0.4} 200 250)`}>
      {/* back hair (bob) */}
      <path d="M108,150 C100,70 160,40 205,42 C258,40 305,72 296,150 L304,232 C290,250 268,250 262,232 L262,170 L140,170 L140,232 C134,250 110,250 98,232 Z" fill="url(#divaHair)" />
      {/* ear discs */}
      <circle cx={110} cy={180} r={18} fill={C.gold} stroke={C.goldDark} strokeWidth={3} />
      <circle cx={110} cy={180} r={7} fill={C.turquoise} opacity={0.6 + 0.4 * Math.sin(t * 6)} />
      <circle cx={290} cy={180} r={18} fill={C.gold} stroke={C.goldDark} strokeWidth={3} />
      <circle cx={290} cy={180} r={7} fill={C.turquoise} opacity={0.6 + 0.4 * Math.cos(t * 6)} />
      {/* face plate */}
      <path d="M125,130 C125,85 160,70 200,70 C240,70 275,85 275,130 L272,190 C268,228 238,252 200,254 C162,252 132,228 128,190 Z" fill="url(#divaFace)" stroke="#8fb9c4" strokeWidth={2} />
      {/* jaw seam */}
      <path d="M140,204 C150,232 175,246 200,247 C225,246 250,232 260,204" stroke="#7aa8b5" strokeWidth={2} fill="none" opacity={0.7} />
      {/* cheek circuits */}
      <g opacity={0.8}>
        <circle cx={152} cy={196} r={9} fill={C.pink} opacity={0.35} />
        <circle cx={248} cy={196} r={9} fill={C.pink} opacity={0.35} />
        <path d="M140,182 h10 l6,6 h8" stroke={C.teal} strokeWidth={2} fill="none" />
        <path d="M260,182 h-10 l-6,6 h-8" stroke={C.teal} strokeWidth={2} fill="none" />
      </g>
      {/* brows */}
      <path transform={`translate(0 ${browY}) rotate(${browRotL} 160 136)`} d="M138,140 Q160,126 182,136" stroke="#0b0b1e" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path transform={`translate(0 ${browY}) rotate(${browRotR} 240 136)`} d="M218,136 Q240,126 262,140" stroke="#0b0b1e" strokeWidth={5} fill="none" strokeLinecap="round" />
      {eye(160, -1)}
      {eye(240, 1)}
      {/* nose */}
      <path d="M200,172 L195,192 L204,192" stroke="#7aa8b5" strokeWidth={3} fill="none" strokeLinecap="round" />
      {mouthEl}
      {/* front hair: finger waves + bangs */}
      <path d="M118,140 C118,80 165,52 205,52 C250,52 290,82 284,140 C270,118 250,104 228,104 C214,118 190,122 170,114 C150,112 132,124 118,140 Z" fill="url(#divaHair)" />
      <path d="M150,92 C170,80 190,96 210,84 C230,74 250,88 266,98" stroke={C.turquoise} strokeWidth={4} fill="none" opacity={0.55} />
      <path d="M136,116 C154,104 170,116 186,108" stroke={C.turquoise} strokeWidth={3} fill="none" opacity={0.4} />
      {/* spit curls */}
      <path d="M132,170 c-14,-4 -12,-22 2,-20 c8,2 6,12 -2,10" stroke="#0b0b1e" strokeWidth={5} fill="none" />
      <path d="M268,170 c14,-4 12,-22 -2,-20 c-8,2 -6,12 2,10" stroke="#0b0b1e" strokeWidth={5} fill="none" />
      {/* headband */}
      <path d="M116,124 C150,96 250,96 288,124" stroke={C.gold} strokeWidth={10} fill="none" />
      <path d="M116,124 C150,96 250,96 288,124" stroke={C.goldLight} strokeWidth={2} fill="none" strokeDasharray="4 10" />
      <g transform="translate(262 106)">
        <polygon points="0,-16 12,0 0,16 -12,0" fill={C.pink} stroke={C.goldLight} strokeWidth={3} style={{ filter: `drop-shadow(0 0 8px ${C.pink})` }} />
        {/* feather plume */}
        <g transform={`rotate(${20 + Math.sin(t * 3) * 6})`}>
          <path d="M0,-12 C-10,-60 10,-100 30,-118 C30,-80 22,-40 0,-12 Z" fill={C.turquoise} opacity={0.9} />
          <path d="M0,-12 C6,-50 18,-86 30,-118" stroke={C.goldLight} strokeWidth={2} fill="none" />
          <path d="M4,-14 C22,-50 44,-70 64,-80 C54,-50 34,-28 4,-14 Z" fill={C.pinkSoft} opacity={0.85} />
        </g>
      </g>
    </g>
  );

  // fringe dress
  const fringe = [];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 18; i++) {
      const fx = 120 + i * 9.5 + row * 3;
      const fy = 470 + row * 46;
      const swing = Math.sin(t * 7 + i * 0.5 + row) * 8 * sway + hipSw * 2;
      fringe.push(
        <path key={`${row}-${i}`} d={`M${fx},${fy} q${swing / 2},26 ${swing},52`} stroke={row % 2 ? C.goldLight : C.gold} strokeWidth={3} fill="none" opacity={0.95} />,
      );
    }
  }

  const body = (
    <g>
      {/* legs */}
      <g transform={`rotate(${hipSw * 0.6} 200 560)`}>
        <path d="M156,596 L194,596 C194,650 186,690 186,712 C186,750 182,790 180,830 L168,830 C166,790 162,750 164,712 C164,690 156,650 156,596 Z" fill="url(#divaChrome)" stroke={C.chromeDark} strokeWidth={2} />
        <path d="M208,596 L246,596 C246,650 238,690 238,712 C238,750 234,790 232,830 L220,830 C218,790 214,750 216,712 C216,690 208,650 208,596 Z" fill="url(#divaChrome)" stroke={C.chromeDark} strokeWidth={2} transform={`rotate(${-6 + Math.sin(t * 6.7) * 4 * sway} 227 600)`} />
        <circle cx={175} cy={712} r={11} fill={C.gold} />
        <circle cx={227} cy={712} r={11} fill={C.gold} />
        {/* T-strap heels */}
        <path d="M160,824 C166,818 186,818 190,826 L196,846 L158,846 Z" fill={C.pink} />
        <path d="M164,846 l-4,20" stroke={C.gold} strokeWidth={5} />
        <path d="M212,824 C218,818 238,818 242,826 L248,846 L210,846 Z" fill={C.pink} />
        <path d="M216,846 l-4,20" stroke={C.gold} strokeWidth={5} />
      </g>
      {/* neck */}
      <rect x={182} y={244} width={36} height={44} fill="url(#divaChrome)" />
      {[254, 266, 278].map((yy) => (
        <rect key={yy} x={180} y={yy} width={40} height={5} rx={2} fill={C.chromeDark} />
      ))}
      {/* dress torso */}
      <g transform={`rotate(${hipSw * 0.4} 200 470)`}>
        <path d="M144,290 C175,280 225,280 256,290 C262,330 262,360 254,392 C250,420 262,446 276,470 L124,470 C138,446 150,420 146,392 C138,360 138,330 144,290 Z" fill="url(#divaDress)" stroke={C.gold} strokeWidth={3} />
        <path d="M168,286 L200,330 L232,286" stroke={C.goldLight} strokeWidth={3} fill="#0c1030" />
        {/* deco chevrons */}
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M${150 + k * 3},${340 + k * 30} L200,${370 + k * 30} L${250 - k * 3},${340 + k * 30}`} stroke={k % 2 ? C.teal : C.gold} strokeWidth={4} fill="none" />
        ))}
        {/* drop waist sash */}
        <path d="M116,455 L284,455 L286,478 L114,478 Z" fill={C.pink} />
        <circle cx={262} cy={466} r={14} fill={C.gold} stroke={C.goldLight} strokeWidth={3} />
        {/* skirt base + fringe */}
        <path d="M114,478 L286,478 L300,600 L100,600 Z" fill="#141a3e" />
        {fringe}
        {/* pearls */}
        <path d="M168,292 C170,350 200,400 205,420" stroke="none" fill="none" />
        {new Array(16).fill(0).map((_, i) => {
          const p = i / 15;
          const px = 165 + p * 42 + Math.sin(p * 3.1) * 14;
          const py = 292 + p * 140 + Math.sin(t * 7 + p * 3) * 2 * sway;
          return <circle key={i} cx={px} cy={py} r={5} fill="#fdf6e3" stroke="#d9cfb5" strokeWidth={1} />;
        })}
        <circle cx={208} cy={440} r={9} fill={C.turquoise} stroke={C.gold} strokeWidth={3} />
        {/* power core */}
        <circle cx={200} cy={318} r={11} fill={C.turquoise} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 3))} style={{ filter: `drop-shadow(0 0 10px ${C.turquoise})` }} />
      </g>
    </g>
  );

  const arms = (
    <g>
      <Arm x={142} y={300} a1={l1 + Math.sin(t * 4) * 3 * sway} a2={l2} flip={false} />
      <Arm x={258} y={300} a1={r1 - Math.sin(t * 4) * 3 * sway} a2={r2} flip />
    </g>
  );

  const trumpet = pose === "trumpet" && (
    <g>
      <rect x={188} y={208} width={14} height={10} rx={3} fill={C.goldLight} />
      <path d="M190,213 L60,213" stroke={C.gold} strokeWidth={9} />
      <path d="M170,228 L80,228 C70,228 70,213 80,213" stroke={C.gold} strokeWidth={7} fill="none" />
      {[110, 126, 142].map((vx) => (
        <g key={vx}>
          <rect x={vx - 6} y={198} width={12} height={40} rx={3} fill={C.goldLight} stroke={C.goldDark} strokeWidth={2} />
          <rect x={vx - 8} y={192} width={16} height={8} rx={3} fill={C.goldDark} />
        </g>
      ))}
      <path d="M64,206 C40,206 20,184 -6,170 L-6,258 C20,244 40,222 64,222 Z" fill="url(#divaBrass)" stroke={C.goldDark} strokeWidth={3} />
      <ellipse cx={-6} cy={214} rx={10} ry={44} fill="#5a3f0c" stroke={C.goldLight} strokeWidth={3} />
    </g>
  );

  const mic = pose === "mic" && (
    <g transform="translate(280 180)">
      <rect x={-8} y={20} width={16} height={60} rx={6} fill="#1b1b2e" stroke={C.gold} strokeWidth={2} />
      <rect x={-22} y={-26} width={44} height={52} rx={18} fill="url(#divaChrome)" stroke={C.gold} strokeWidth={3} />
      {[-12, -2, 8].map((k) => (
        <line key={k} x1={-18} y1={k} x2={18} y2={k} stroke={C.chromeDark} strokeWidth={2} />
      ))}
    </g>
  );

  const vb = crop === "bust" ? "60 20 280 420" : "0 -130 400 1030";
  const w = crop === "bust" ? 280 : 400;
  const h = crop === "bust" ? 420 : 1030;
  return (
    <svg
      viewBox={vb}
      width={w * scale}
      height={h * scale}
      style={{
        position: "absolute",
        left: x,
        top: y + bob * scale,
        overflow: "visible",
        transform: flip ? "scaleX(-1)" : undefined,
        filter: glow ? `drop-shadow(0 0 ${glow}px ${C.turquoise})` : undefined,
      }}
    >
      <defs>
        <linearGradient id="divaChrome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d93a8" />
          <stop offset="0.35" stopColor="#eef6fb" />
          <stop offset="0.6" stopColor="#b7c8d6" />
          <stop offset="1" stopColor="#5d7186" />
        </linearGradient>
        <linearGradient id="divaFace" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#e9fbfb" />
          <stop offset="0.6" stopColor={C.skin} />
          <stop offset="1" stopColor="#8fc6cf" />
        </linearGradient>
        <linearGradient id="divaBrass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.goldLight} />
          <stop offset="0.5" stopColor={C.gold} />
          <stop offset="1" stopColor={C.goldDark} />
        </linearGradient>
        <linearGradient id="divaHair" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1d1f3d" />
          <stop offset="0.5" stopColor="#07070f" />
          <stop offset="1" stopColor="#12304a" />
        </linearGradient>
        <linearGradient id="divaDress" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f2a66" />
          <stop offset="1" stopColor="#0c1030" />
        </linearGradient>
      </defs>
      {crop === "full" && body}
      {crop === "bust" && (
        <g>
          <rect x={182} y={244} width={36} height={44} fill="url(#divaChrome)" />
          <path d="M120,300 C160,282 240,282 280,300 L300,460 L100,460 Z" fill="url(#divaDress)" stroke={C.gold} strokeWidth={3} />
          <path d="M150,330 L200,362 L250,330" stroke={C.gold} strokeWidth={4} fill="none" />
          <path d="M160,360 L200,392 L240,360" stroke={C.teal} strokeWidth={4} fill="none" />
          {new Array(10).fill(0).map((_, i) => (
            <circle key={i} cx={168 + i * 7} cy={296 + Math.sin(i / 3) * 30} r={5} fill="#fdf6e3" />
          ))}
        </g>
      )}
      {head}
      {trumpet}
      {mic}
      {arms}
    </svg>
  );
};
