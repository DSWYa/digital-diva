import React from "react";
import { C, F } from "../theme";
import { Segment } from "../lib/plan";

export type SceneProps = { seg: Segment; t: number; lt: number };

/** Vintage beige CRT computer. Screen content is HTML placed over the screen rect. */
export const VintageComputer: React.FC<{
  x: number;
  y: number;
  scale?: number;
  glow?: string;
  children?: React.ReactNode;
}> = ({ x, y, scale = 1, glow = C.turquoise, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 560 * scale, height: 560 * scale }}>
    <svg viewBox="0 0 560 560" width={560 * scale} height={560 * scale} style={{ position: "absolute", overflow: "visible" }}>
      <defs>
        <linearGradient id="beige" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#efe4c8" />
          <stop offset="1" stopColor="#bfae86" />
        </linearGradient>
      </defs>
      <path d="M200,400 L360,400 L390,450 L170,450 Z" fill="url(#beige)" stroke="#8c7a52" strokeWidth={4} />
      <rect x={20} y={20} width={520} height={390} rx={34} fill="url(#beige)" stroke="#8c7a52" strokeWidth={5} />
      <rect x={50} y={50} width={460} height={310} rx={26} fill="#0a1a1c" stroke="#5a4a2a" strokeWidth={6} />
      <rect x={40} y={370} width={120} height={20} rx={4} fill="#d8cba8" />
      <circle cx={500} cy={384} r={9} fill={glow} style={{ filter: `drop-shadow(0 0 6px ${glow})` }} />
      <path d="M380,374 h90" stroke="#8c7a52" strokeWidth={4} />
      {/* deco badge */}
      <path d="M270,372 l10,-10 l10,10 l-10,10 z" fill={C.gold} />
      {/* keyboard */}
      <path d="M60,470 L500,470 L540,550 L20,550 Z" fill="url(#beige)" stroke="#8c7a52" strokeWidth={4} />
      {new Array(3).fill(0).map((_, r) =>
        new Array(12).fill(0).map((__, c) => (
          <rect key={`${r}-${c}`} x={70 + c * 36 - r * 8} y={482 + r * 22} width={28} height={16} rx={3} fill="#f6efdc" stroke="#a89670" />
        )),
      )}
    </svg>
    <div
      style={{
        position: "absolute",
        left: 50 * scale,
        top: 50 * scale,
        width: 460 * scale,
        height: 310 * scale,
        borderRadius: 26 * scale,
        overflow: "hidden",
        boxShadow: `inset 0 0 ${40 * scale}px rgba(64,232,224,0.35)`,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 5px)",
          pointerEvents: "none",
        }}
      />
    </div>
  </div>
);

export const ScreenText: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 30,
  color = "#7dffc8",
  style,
}) => (
  <div
    style={{
      fontFamily: "'Courier New', monospace",
      fontWeight: 700,
      fontSize: size,
      color,
      textShadow: `0 0 8px ${color}`,
      lineHeight: 1.25,
      padding: "18px 22px",
      whiteSpace: "pre-wrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Typewriter reveal of a string over time. */
export const typed = (s: string, age: number, cps = 26) => s.slice(0, Math.max(0, Math.floor(age * cps)));

/** Speech/request bubble. */
export const Bubble: React.FC<{
  x: number;
  y: number;
  text: string;
  color?: string;
  size?: number;
  rot?: number;
  scale?: number;
  opacity?: number;
}> = ({ x, y, text, color = C.cream, size = 40, rot = 0, scale = 1, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`,
      opacity,
      background: color,
      color: C.night,
      fontFamily: F.chorus,
      fontSize: size,
      padding: `${size * 0.3}px ${size * 0.55}px`,
      borderRadius: size * 0.6,
      border: `4px solid ${C.gold}`,
      boxShadow: `0 8px 0 rgba(0,0,0,0.35), 0 0 24px rgba(64,232,224,0.35)`,
      whiteSpace: "nowrap",
    }}
  >
    {text}
    <div
      style={{
        position: "absolute",
        left: "22%",
        bottom: -18,
        width: 0,
        height: 0,
        borderLeft: "14px solid transparent",
        borderRight: "14px solid transparent",
        borderTop: `20px solid ${C.gold}`,
      }}
    />
  </div>
);
