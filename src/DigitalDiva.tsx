import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { C, H, paletteVars, W } from "./theme";
import { ensureFonts } from "./fonts";
import { currentItem, groups, layoutOfGroup, paletteOfGroup, segments, Segment } from "./lib/plan";
import { hitPulse } from "./lib/timing";
import { LyricLayer } from "./lyrics/Lyrics";
import { ease, StyleCtx } from "./components/hud";
import { Chrome, GUI_INSETS } from "./components/gui";
import { SceneProps } from "./scenes/common";
import { Filter, Inbox, Notify, Queue, Session, Specimen, Title } from "./scenes/ScenesA";
import { Bridge, CatScene, Chorus, ComeOn, Drop, ErrorScene, GlassesScene, Kitchen, LaptopScene, Montage, Neural, QA, Shutdown, Solo } from "./scenes/ScenesB";

const SCENES: Record<string, React.FC<SceneProps>> = {
  session: Session,
  title: Title,
  inbox: Inbox,
  filter: Filter,
  queue: Queue,
  notify: Notify,
  specimen: Specimen,
  chorus: Chorus,
  solo: Solo,
  qa: QA,
  cat: CatScene,
  kitchen: Kitchen,
  neural: Neural,
  laptop: LaptopScene,
  bridge: Bridge,
  error: ErrorScene,
  drop: Drop,
  montage: Montage,
  glasses: GlassesScene,
  shutdown: Shutdown,
  comeon: ComeOn,
};

const TITLES: Record<string, string> = {
  session: "session.log",
  title: "now playing",
  inbox: "inbox — mail",
  filter: "pipeline.fig",
  queue: "queue.db",
  notify: "notifications",
  chorus: "chorus.live",
  solo: "solo.wav",
  qa: "requests.log",
  cat: "tty1",
  kitchen: "recipe.json",
  neural: "self.model",
  laptop: "activity monitor",
  bridge: "capabilities.md",
  error: "diva.exe",
  drop: "visualizer",
  montage: "can_do.test",
  glasses: "search.app",
};

/** Scene + its palette, background style and interface chrome. */
const StyledScene: React.FC<{ seg: Segment; t: number }> = ({ seg, t }) => {
  const Comp = SCENES[seg.scene];
  const lt = t - seg.start;
  const items = Object.keys(seg.items).length;
  const it = currentItem(seg, t);
  const idx = it.name ? Object.values(seg.items).indexOf(it.name) : 0;
  const paper = (seg.palette ?? "").startsWith("paper");
  return (
    <AbsoluteFill style={paletteVars(seg.palette)}>
      <StyleCtx.Provider value={{ bg: seg.bg, inset: GUI_INSETS[seg.gui] }}>
        <Comp seg={seg} t={t} lt={lt} />
        <Chrome
          kind={seg.gui}
          t={t}
          lt={lt}
          title={seg.title ?? (seg.scene === "specimen" ? `${seg.variant}.svg` : TITLES[seg.scene] ?? seg.scene)}
          paper={paper}
          widget={seg.widget}
          cursor={seg.cursor}
          itemAge={items && it.name ? it.age : 99}
          itemIndex={idx}
        />
      </StyleCtx.Provider>
    </AbsoluteFill>
  );
};

const TR: Record<Segment["transition"], number> = { wipe: 0.4, glitch: 0.25, fade: 0.6, flash: 0, cut: 0 };

const TransitionMask: React.FC<{ seg: Segment; t: number; children: React.ReactNode }> = ({ seg, t, children }) => {
  const d = TR[seg.transition];
  const p = d ? ease((t - seg.start) / d) : 1;
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  if (seg.transition === "wipe") {
    const x = p * W;
    return (
      <>
        <AbsoluteFill style={{ clipPath: `inset(0 ${W - x}px 0 0)` }}>{children}</AbsoluteFill>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: x - 1, width: 2, background: C.pink, boxShadow: `0 0 24px ${C.pink}` }} />
      </>
    );
  }
  if (seg.transition === "glitch") {
    const f = Math.floor(t * 30);
    const slices = 9;
    return (
      <>
        {new Array(slices).fill(0).map((_, i) => {
          const show = random(`gl${seg.index}${i}`) < p * 1.3;
          const top = (i / slices) * H;
          return (
            <AbsoluteFill key={i} style={{ clipPath: `inset(${top}px 0 ${H - top - H / slices}px 0)`, opacity: show ? 1 : 0, transform: `translateX(${(random(`gx${f}${i}`) - 0.5) * 120 * (1 - p)}px)` }}>
              {children}
            </AbsoluteFill>
          );
        })}
      </>
    );
  }
  return <AbsoluteFill style={{ opacity: p }}>{children}</AbsoluteFill>;
};

const SceneStack: React.FC<{ t: number }> = ({ t }) => {
  const active = segments.filter((s) => {
    const next = segments[s.index + 1];
    const tail = next ? TR[next.transition] : 0;
    return t >= s.start && t < s.end + tail;
  });
  return (
    <>
      {active.map((seg) =>
        SCENES[seg.scene] ? (
          <TransitionMask key={seg.index} seg={seg} t={t}>
            <StyledScene seg={seg} t={t} />
          </TransitionMask>
        ) : null,
      )}
      {active
        .filter((s) => s.transition === "flash" && t - s.start < 0.3)
        .map((s) => (
          <AbsoluteFill key={`f${s.index}`} style={{ background: `radial-gradient(circle, #ffffff 0%, ${C.pink} 70%)`, opacity: 0.85 * (1 - (t - s.start) / 0.3) }} />
        ))}
    </>
  );
};

export type DigitalDivaProps = { showTimingDebug: boolean; qa?: boolean };

export const DigitalDiva: React.FC<DigitalDivaProps> = ({ showTimingDebug, qa = false }) => {
  ensureFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const hit = hitPulse(t);
  return (
    <AbsoluteFill style={{ ...paletteVars("neon"), backgroundColor: C.bg, overflow: "hidden" }}>
      <Audio src={staticFile("audio/digital-diva.mp3")} />
      <SceneStack t={t} />
      <LyricLayer groups={groups} layoutOf={layoutOfGroup} styleOf={(g) => paletteVars(paletteOfGroup(g))} qa={qa} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 120%, ${C.pink} 0%, transparent 50%)`, opacity: hit * 0.1, mixBlendMode: "screen", pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 75% at 50% 50%, transparent 60%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />
      <Img src={staticFile("noise.png")} style={{ position: "absolute", left: -((frame * 137) % 512), top: -((frame * 71) % 512), width: W + 1024, height: H + 1024, objectFit: "none", opacity: 0.045, mixBlendMode: "overlay", pointerEvents: "none" }} />
      {showTimingDebug && (
        <div style={{ position: "absolute", right: 40, bottom: 70, fontFamily: "monospace", fontSize: 26, color: "#9f9", background: "rgba(0,0,0,0.7)", padding: 8 }}>
          {t.toFixed(2)}s · {segments.filter((s) => t >= s.start && t < s.end).map((s) => s.scene).join(",")}
        </div>
      )}
    </AbsoluteFill>
  );
};
