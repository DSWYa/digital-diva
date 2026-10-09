import type React from "react";

/**
 * Colours are CSS variables so every scene can carry its own palette
 * (set by `paletteVars` on the scene container and on the lyric layer).
 */
export const C = {
  bg: "var(--bg)",
  bg2: "var(--bg2)",
  paper: "var(--paper)",
  paperInk: "var(--paperInk)",
  paperDim: "var(--paperDim)",
  line: "var(--ink)",
  dim: "var(--dim)",
  faint: "var(--faint)",
  grid: "var(--grid)",
  gridLine: "var(--gridLine)",
  unsung: "var(--unsung)",
  pink: "var(--accent)",
  pinkSoft: "var(--accent2)",
  white: "var(--hi)",
};

/** Accent colour at a given alpha (for glows and tints). */
export const accentA = (a: number) => `color-mix(in srgb, var(--accent) ${Math.round(a * 100)}%, transparent)`;
export const hiA = (a: number) => `color-mix(in srgb, var(--hi) ${Math.round(a * 100)}%, transparent)`;

type Palette = {
  bg: string;
  bg2: string;
  ink: string;
  dim: string;
  faint: string;
  grid: string;
  gridLine: string;
  unsung: string;
  accent: string;
  accent2: string;
  hi: string;
  paper?: string;
  paperInk?: string;
  paperDim?: string;
};

const PAPER = { paper: "#ebe9ea", paperInk: "#2b2a2e", paperDim: "#9c999f" };

export const PALETTES: Record<string, Palette> = {
  // hot pink on near-black: the house look
  neon: { bg: "#0d0c0f", bg2: "#17141b", ink: "#e9e7ea", dim: "#6e6b72", faint: "#2a282d", grid: "#1f1d22", gridLine: "#2c2a30", unsung: "#5f5c63", accent: "#ff2e8a", accent2: "#ff7ab5", hi: "#f4f2f5", ...PAPER },
  cyan: { bg: "#06121a", bg2: "#0b2029", ink: "#e2f5f6", dim: "#5f8086", faint: "#183038", grid: "#11252c", gridLine: "#1b3640", unsung: "#4f6d73", accent: "#22e3d3", accent2: "#9af7ee", hi: "#f0fffe", ...PAPER },
  amber: { bg: "#110b05", bg2: "#1f150a", ink: "#f7e6cc", dim: "#8c7552", faint: "#33250f", grid: "#24190c", gridLine: "#382814", unsung: "#6f5c42", accent: "#ffad1f", accent2: "#ffd58c", hi: "#fff5e3", ...PAPER },
  blueprint: { bg: "#0a1a3c", bg2: "#12285c", ink: "#dde8ff", dim: "#7f97c9", faint: "#20386c", grid: "#163063", gridLine: "#28457f", unsung: "#6680b3", accent: "#ff6a3d", accent2: "#ffb199", hi: "#ffffff", ...PAPER },
  violet: { bg: "#0d0918", bg2: "#1a1131", ink: "#eee8ff", dim: "#7e71a6", faint: "#2a1f45", grid: "#1d1633", gridLine: "#2e2450", unsung: "#625788", accent: "#a97cff", accent2: "#d9c8ff", hi: "#faf7ff", ...PAPER },
  lime: { bg: "#050c07", bg2: "#0b1a0f", ink: "#dcf5e0", dim: "#5f8467", faint: "#17301c", grid: "#102015", gridLine: "#1b3622", unsung: "#4c6b53", accent: "#7dff5a", accent2: "#c6ffb3", hi: "#f2fff0", ...PAPER },
  alert: { bg: "#130406", bg2: "#250a0f", ink: "#ffe8ea", dim: "#93636a", faint: "#3a161c", grid: "#2a0f14", gridLine: "#40181f", unsung: "#7a4d53", accent: "#ff3b3b", accent2: "#ff9d9d", hi: "#fff4f4", ...PAPER },
  // light "paper" scenes, each with its own ink accent
  paperPink: { bg: "#0d0c0f", bg2: "#17141b", ink: "#e9e7ea", dim: "#6e6b72", faint: "#2a282d", grid: "#1f1d22", gridLine: "#2c2a30", unsung: "#5f5c63", accent: "#e8217a", accent2: "#ff7ab5", hi: "#f4f2f5", paper: "#ecebe8", paperInk: "#2b2a2e", paperDim: "#a4a1a7" },
  paperBlue: { bg: "#0d0c0f", bg2: "#17141b", ink: "#e9e7ea", dim: "#6e6b72", faint: "#2a282d", grid: "#1f1d22", gridLine: "#2c2a30", unsung: "#5f5c63", accent: "#2d63ff", accent2: "#8fb0ff", hi: "#f4f2f5", paper: "#e7ecf2", paperInk: "#1e2633", paperDim: "#97a3b5" },
  paperGreen: { bg: "#0d0c0f", bg2: "#17141b", ink: "#e9e7ea", dim: "#6e6b72", faint: "#2a282d", grid: "#1f1d22", gridLine: "#2c2a30", unsung: "#5f5c63", accent: "#0f9d4a", accent2: "#6fd99a", hi: "#f4f2f5", paper: "#eaefe6", paperInk: "#1f2a22", paperDim: "#9aa898" },
};

export const paletteVars = (name: string | undefined): React.CSSProperties => {
  const p = PALETTES[name ?? "neon"] ?? PALETTES.neon;
  return {
    "--bg": p.bg,
    "--bg2": p.bg2,
    "--ink": p.ink,
    "--dim": p.dim,
    "--faint": p.faint,
    "--grid": p.grid,
    "--gridLine": p.gridLine,
    "--unsung": p.unsung,
    "--accent": p.accent,
    "--accent2": p.accent2,
    "--hi": p.hi,
    "--paper": p.paper,
    "--paperInk": p.paperInk,
    "--paperDim": p.paperDim,
  } as React.CSSProperties;
};

export const F = {
  sans: "'Archivo', 'Helvetica Neue', Arial, sans-serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
};

export const W = 1920;
export const H = 1080;
