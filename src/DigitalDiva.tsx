import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { C, H, W } from "./theme";
import { ensureFonts } from "./fonts";
import { segments, Segment, zoneOfLine } from "./lib/plan";
import { hitPulse } from "./lib/timing";
import { LyricLayer } from "./lyrics/Lyrics";
import { DecoFrame, Vignette } from "./components/deco/Deco";
import { SceneProps } from "./scenes/common";
import { Boot, GrandmaScene, Marquee, Showcase, Storm, Switchboard, WeddingCow } from "./scenes/ScenesA";
import { CatCode, Chorus, ComeOn, ErrorScene, Kitchen, Laptop, Lounge, Philosophy, Phone, Shutdown, ToasterScene } from "./scenes/ScenesB";

const SCENES: Record<string, React.FC<SceneProps>> = {
  boot: Boot,
  marquee: Marquee,
  grandma: GrandmaScene,
  switchboard: Switchboard,
  showcase: Showcase,
  weddingCow: WeddingCow,
  storm: Storm,
  chorus: Chorus,
  catCode: CatCode,
  kitchen: Kitchen,
  philosophy: Philosophy,
  laptop: Laptop,
  lounge: Lounge,
  error: ErrorScene,
  phone: Phone,
  toaster: ToasterScene,
  shutdown: Shutdown,
  comeon: ComeOn,
};

const TR: Record<Segment["transition"], number> = { iris: 0.45, fan: 0.5, blinds: 0.45, slide: 0.4, fade: 0.6, flash: 0, cut: 0 };
const ease = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

const TransitionMask: React.FC<{ seg: Segment; t: number; children: React.ReactNode }> = ({ seg, t, children }) => {
  const d = TR[seg.transition];
  const p = d ? ease((t - seg.start) / d) : 1;
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  let style: React.CSSProperties = {};
  let edge: React.ReactNode = null;
  switch (seg.transition) {
    case "iris": {
      const r = p * 1150;
      style = { clipPath: `circle(${r}px at 50% 50%)` };
      edge = (
        <div style={{ position: "absolute", left: W / 2 - r, top: H / 2 - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `10px solid ${C.gold}`, boxShadow: `0 0 30px ${C.gold}` }} />
      );
      break;
    }
    case "fan": {
      const a = p * 180;
      const mask = `conic-gradient(from -90deg at 50% 100%, #000 0deg, #000 ${a}deg, transparent ${a + 0.5}deg)`;
      style = { WebkitMaskImage: mask, maskImage: mask };
      const rad = ((a - 90) * Math.PI) / 180;
      edge = (
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <line x1={W / 2} y1={H} x2={W / 2 + Math.sin(rad) * 2400} y2={H - Math.cos(rad) * 2400} stroke={C.gold} strokeWidth={10} style={{ filter: `drop-shadow(0 0 12px ${C.gold})` }} />
        </svg>
      );
      break;
    }
    case "blinds": {
      const w = p * 160;
      const mask = `repeating-linear-gradient(90deg, #000 0px, #000 ${w}px, transparent ${w}px, transparent 160px)`;
      style = { WebkitMaskImage: mask, maskImage: mask };
      break;
    }
    case "slide":
      style = { transform: `translateX(${(1 - p) * W}px)` };
      edge = <div style={{ position: "absolute", top: 0, bottom: 0, left: (1 - p) * W - 12, width: 12, background: C.gold, boxShadow: `0 0 30px ${C.gold}` }} />;
      break;
    case "fade":
      style = { opacity: p };
      break;
    default:
      break;
  }
  return (
    <>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
      {edge}
    </>
  );
};

const SceneStack: React.FC<{ t: number }> = ({ t }) => {
  const active: Segment[] = [];
  for (const s of segments) {
    const tail = segments[s.index + 1] ? TR[segments[s.index + 1].transition] : 0;
    if (t >= s.start && t < s.end + tail) active.push(s);
  }
  return (
    <>
      {active.map((seg) => {
        const Comp = SCENES[seg.scene];
        if (!Comp) return null;
        return (
          <TransitionMask key={seg.index} seg={seg} t={t}>
            <Comp seg={seg} t={t} lt={t - seg.start} />
          </TransitionMask>
        );
      })}
      {/* flash transitions */}
      {active
        .filter((s) => s.transition === "flash" && t - s.start < 0.35)
        .map((s) => (
          <AbsoluteFill key={`f${s.index}`} style={{ background: `radial-gradient(circle, #fff 0%, ${C.pinkSoft} 60%, ${C.pink} 100%)`, opacity: 1 - (t - s.start) / 0.35 }} />
        ))}
    </>
  );
};

export type DigitalDivaProps = { showTimingDebug: boolean };

export const DigitalDiva: React.FC<DigitalDivaProps> = ({ showTimingDebug }) => {
  ensureFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const hit = hitPulse(t);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black, overflow: "hidden" }}>
      <Audio src={staticFile("audio/digital-diva.mp3")} />
      <SceneStack t={t} />
      <LyricLayer zoneOf={zoneOfLine} debug={showTimingDebug} />
      {/* musical accent glow */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 110%, ${C.gold} 0%, transparent 55%)`, opacity: hit * 0.12, mixBlendMode: "screen", pointerEvents: "none" }} />
      <Vignette strength={0.6} />
      <Img src={staticFile("noise.png")} style={{ position: "absolute", left: -((frame * 137) % 512), top: -((frame * 71) % 512), width: W + 1024, height: H + 1024, objectFit: "none", opacity: 0.05, mixBlendMode: "overlay", pointerEvents: "none" }} />
      <DecoFrame opacity={0.55} />
      {showTimingDebug && (
        <div style={{ position: "absolute", right: 40, bottom: 40, fontFamily: "monospace", fontSize: 28, color: "#9f9", background: "rgba(0,0,0,0.6)", padding: 8 }}>
          {t.toFixed(2)}s · {segments.filter((s) => t >= s.start && t < s.end).map((s) => s.scene).join(",")}
        </div>
      )}
    </AbsoluteFill>
  );
};
