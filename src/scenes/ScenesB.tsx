import React from "react";
import { AbsoluteFill, random } from "remotion";
import { C, F, H, W } from "../theme";
import { Diva, DivaFace, DivaPose } from "../components/characters/Diva";
import { Cat } from "../components/characters/Cast";
import { Prop } from "../components/props/Props";
import {
  Backdrop,
  BinaryRain,
  Bulbs,
  Camera,
  Circuits,
  DecoArch,
  Floor,
  GearCluster,
  Haze,
  Holo,
  Layer,
  Pop,
  prog,
  SignText,
  Skyline,
  Sparkles,
  Spotlight,
  Stars,
  Sunburst,
} from "../components/deco/Deco";
import { beatAt, beatPulse, hitPulse, lineById, wordTime } from "../lib/timing";
import { currentItem } from "../lib/plan";
import { SceneProps, ScreenText, typed, VintageComputer } from "./common";

const ease = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

/* ============ CHORUS (neon stage) ============ */
const CH_POSES: DivaPose[] = ["mic", "cheer", "hip", "point", "mic", "wave"];
export const Chorus: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const item = currentItem(seg, t);
  const it = item.name ?? "";
  const b = beatAt(t);
  const pulse = beatPulse(t, 5);
  const hit = hitPulse(t);
  const hook = it === "hook";
  const pose: DivaPose = hook ? "cheer" : it === "mic" ? "mic" : CH_POSES[Math.floor(b.n / 2) % CH_POSES.length];
  const face: DivaFace = it === "crown" ? "wink" : it === "brain" ? "shock" : hook ? "smile" : b.n % 8 < 4 ? "smile" : "smirk";
  const circuits = seg.variant === "circuits";
  // BEEP/BOOP bursts keyed to the sung words
  const hookLine = Object.keys(seg.items).find((k) => seg.items[k] === "hook");
  const burstAt = hookLine ? [wordTime(hookLine, /BEEP/i), wordTime(hookLine, /BOOP/i), wordTime(hookLine, /BABY/i), wordTime(hookLine, /GO/i)] : [];
  const burst = burstAt.reduce((m, s) => Math.max(m, t >= s && t < s + 0.6 ? 1 - (t - s) / 0.6 : 0), 0);
  return (
    <Camera x={Math.sin(lt * 0.6) * 24} zoom={1.03 + pulse * 0.015 + burst * 0.06} shake={burst * 18 + hit * 4}>
      <Layer depth={0.1}>
        <Backdrop top="#05000c" bottom={circuits ? "#001a1f" : "#200030"} glow={circuits ? C.teal : C.pink} glowY={55} />
        <Stars n={40} />
      </Layer>
      <Layer depth={0.2}>
        <Sunburst cx={W / 2} cy={620} rays={36} opacity={0.12 + pulse * 0.08 + burst * 0.2} speed={0.4} color={b.n % 2 ? C.pink : C.gold} />
        {circuits ? <Circuits opacity={0.7} n={24} seed="ch" /> : <Skyline y={840} seed="ch" />}
        {(it === "numbers" || circuits) && <BinaryRain opacity={0.45} />}
      </Layer>
      <Layer depth={0.45}>
        <Floor kind="neon" horizon={840} speed={0.06} />
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <Bulbs x={50} y={40} w={1820} n={46} />
          <Bulbs x={40} y={60} w={940} n={24} vertical />
          <Bulbs x={1880} y={60} w={940} n={24} vertical />
        </svg>
      </Layer>
      <Layer depth={0.7}>
        <Spotlight x={300} sway={25} color={C.pinkSoft} opacity={0.2 + pulse * 0.1} />
        <Spotlight x={1600} sway={-25} color={C.turquoise} opacity={0.2 + pulse * 0.1} />
      </Layer>
      <Layer depth={1}>
        <Diva x={60} y={300 - (hook ? Math.abs(Math.sin(t * 8)) * 30 : pulse * 14)} scale={0.78} pose={pose} face={face} glow={pulse * 10} />
        {it === "crown" && (
          <div style={{ position: "absolute", left: 176, top: 70 - (hook ? 0 : pulse * 14), transform: `scale(${ease(item.age / 0.4)})` }}>
            <Prop name="crown" t={item.age} x={0} y={0} size={170} />
          </div>
        )}
        {["typewriter", "tally", "hats", "search", "brain", "broadway"].includes(it) && (
          <div style={{ position: "absolute", left: 1320, top: 540, width: 520, height: 520 }}>
            <Pop age={item.age}>
              <Prop name={it} t={item.age} x={0} y={0} size={520} />
            </Pop>
          </div>
        )}
      </Layer>
      {burst > 0 && (
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          <Sunburst cx={W / 2} cy={H / 2} rays={24} color={C.pinkSoft} opacity={burst * 0.35} speed={2} />
          <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${C.pink}${Math.round(burst * 120).toString(16).padStart(2, "0")} 0%, transparent 60%)` }} />
        </AbsoluteFill>
      )}
      {hook && <Sparkles n={50} seed="hook" size={16} />}
    </Camera>
  );
};

/* ============ CAT CODE ============ */
const CODE = ["$ sudo teach --cat", "> import paws", "> while(true) knead()", "> hack(mainframe)", "> steal('tuna.db')", "> rm -rf /dog/*", "> bypass_firewall(9)", "> purr --loud"];
export const CatCode: React.FC<SceneProps> = ({ t, lt }) => {
  const granted = t >= (lineById.L038?.start ?? Infinity) - 0.1;
  const lines = Math.floor(lt * 4);
  return (
    <Camera zoom={1.02 + lt * 0.012} x={-lt * 6}>
      <Layer depth={0.1}>
        <Backdrop top="#02030a" bottom="#06141a" glow={granted ? C.pink : C.teal} glowY={60} />
      </Layer>
      <Layer depth={0.3}>
        <BinaryRain opacity={0.25} color={granted ? C.pink : C.turquoise} />
      </Layer>
      <Layer depth={1}>
        <div style={{ position: "absolute", left: 0, top: 880, width: W, height: 200, background: "linear-gradient(180deg,#2a1408,#0a0402)", borderTop: `8px solid ${C.gold}` }} />
        <VintageComputer x={560} y={300} scale={1.15} glow={granted ? C.pink : "#7dffc8"}>
          {granted ? (
            <div style={{ width: "100%", height: "100%", background: Math.floor(t * 6) % 2 ? "#3b0a2a" : "#1a0610", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ScreenText size={52} color={C.pinkSoft} style={{ textAlign: "center" }}>
                {"ACCESS\nGRANTED"}
              </ScreenText>
            </div>
          ) : (
            <ScreenText size={26}>
              {CODE.slice(Math.max(0, lines - 7), lines + 1)
                .map((l, i, arr) => (i === arr.length - 1 ? typed(l, (lt * 4) % 1 / 4 * 4, 30) : l))
                .join("\n")}
              {Math.floor(t * 3) % 2 ? "█" : ""}
            </ScreenText>
          )}
        </VintageComputer>
        <Cat x={700} y={690} scale={1.1} shades typing={!granted} />
        {granted && (
          <div style={{ position: "absolute", left: 1060, top: 600, fontFamily: F.chorus, fontSize: 80, color: C.goldLight, transform: "rotate(-8deg)", textShadow: `0 0 20px ${C.gold}` }}>
            purr-fect.
          </div>
        )}
        <Holo style={{ left: 80, top: 360 }}>
          <Diva x={0} y={0} scale={1.2} crop="bust" pose={granted ? "shrug" : "think"} face={granted ? "smirk" : "unamused"} />
        </Holo>
      </Layer>
    </Camera>
  );
};

/* ============ EMPTY KITCHEN ============ */
const INGREDIENTS: [string, string, RegExp][] = [
  ["EGGS", "L040", /eggs/i],
  ["FLOUR", "L040", /flour/i],
  ["CHEESE", "L040", /cheese/i],
  ["BUTTER", "L041", /butter/i],
  ["SUGAR", "L041", /sugar/i],
  ["MILK", "L041", /milk/i],
  ["BREAD", "L041", /bread/i],
];
export const Kitchen: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const item = currentItem(seg, t);
  const water = item.name === "water";
  const tumble = ((lt * 220) % (W + 600)) - 300;
  return (
    <Camera x={water ? 0 : Math.sin(lt * 0.4) * 30} zoom={water ? 1.0 + ease(item.age / 1) * 0.08 : 1.02}>
      <Layer depth={0.1}>
        <Backdrop top="#0c1530" bottom="#1b2a63" glow={C.teal} glowY={30} />
      </Layer>
      <Layer depth={0.4}>
        {/* deco tiled wall */}
        <svg width={W} height={H} style={{ position: "absolute", opacity: 0.35 }}>
          {new Array(20).fill(0).map((_, i) =>
            new Array(8).fill(0).map((__, j) => <rect key={`${i}${j}`} x={i * 100} y={j * 100} width={96} height={96} fill="none" stroke={j % 2 === i % 2 ? C.teal : C.gold} strokeWidth={2} />),
          )}
        </svg>
        {/* empty shelves */}
        {[240, 400].map((y) => (
          <div key={y} style={{ position: "absolute", left: 1220, top: y, width: 560, height: 16, background: C.goldDark, boxShadow: "0 8px 0 rgba(0,0,0,0.35)" }} />
        ))}
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <path d="M1240,256 q60,60 120,0 M1500,416 q40,50 80,0" stroke="#ccc" strokeWidth={2} fill="none" opacity={0.6} />
          <circle cx={1300} cy={286} r={6} fill="#222" />
        </svg>
      </Layer>
      <Layer depth={0.9}>
        <Floor kind="checker" horizon={820} />
        {/* open, empty fridge */}
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <rect x={120} y={260} width={380} height={580} rx={40} fill="#e9f3f7" stroke={C.chromeDark} strokeWidth={6} />
          <rect x={150} y={290} width={320} height={520} rx={20} fill="#fffbe6" />
          <rect x={150} y={290} width={320} height={520} rx={20} fill="url(#fridgeGlow)" />
          {[440, 580, 700].map((y) => (
            <line key={y} x1={160} y1={y} x2={460} y2={y} stroke="#bcd" strokeWidth={5} />
          ))}
          <path d="M500,270 L640,230 L640,880 L500,840 Z" fill="#dce8ee" stroke={C.chromeDark} strokeWidth={6} />
          <rect x={600} y={480} width={16} height={120} rx={8} fill={C.gold} />
          <defs>
            <radialGradient id="fridgeGlow" cx="0.5" cy="0.2" r="0.8">
              <stop offset="0" stopColor="#fff9c4" stopOpacity={0.9} />
              <stop offset="1" stopColor="#fff9c4" stopOpacity={0} />
            </radialGradient>
          </defs>
          {/* lonely cobweb */}
          <path d="M150,290 l70,0 M150,290 l0,70 M150,290 l55,55 M175,290 q-5,20 -25,25 M200,290 q-10,40 -50,50" stroke="#aaa" strokeWidth={2} fill="none" />
        </svg>
        {/* tumbleweed */}
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <g transform={`translate(${tumble} ${900 - Math.abs(Math.sin(lt * 4)) * 40}) rotate(${lt * 300})`}>
            {new Array(8).fill(0).map((_, i) => (
              <ellipse key={i} rx={50} ry={20} fill="none" stroke="#a1887f" strokeWidth={4} transform={`rotate(${i * 22})`} />
            ))}
          </g>
        </svg>
      </Layer>
      <Layer depth={1}>
        {/* recipe card */}
        <div style={{ position: "absolute", left: 700, top: 360 + Math.sin(lt * 1.5) * 8, width: 420, height: 470, transform: `rotate(-3deg)`, background: "#fbf3dd", border: `6px solid ${C.gold}`, borderRadius: 10, boxShadow: "0 20px 40px rgba(0,0,0,0.5)", padding: "20px 30px", fontFamily: F.verse, color: "#3a2a10" }}>
          <div style={{ fontFamily: F.deco, fontSize: 46, textAlign: "center", color: C.goldDark }}>RECIPE</div>
          {INGREDIENTS.map(([name, lid, re]) => {
            const ts = wordTime(lid, re);
            const k = prog(t, ts, ts + 0.25);
            return (
              <div key={name} style={{ fontSize: 34, fontWeight: 700, position: "relative", height: 50, display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ width: 30, height: 30, border: "3px solid #3a2a10", display: "inline-block" }} />
                {name}
                <div style={{ position: "absolute", left: -6, top: 22, height: 7, width: `${k * 100}%`, background: "#e53935", transform: "rotate(-2deg)" }} />
                {k > 0.5 && <span style={{ position: "absolute", right: 0, color: "#e53935", fontSize: 40 }}>✗</span>}
              </div>
            );
          })}
        </div>
        {water && (
          <div style={{ position: "absolute", left: 1140, top: 380, width: 600, height: 600 }}>
            <Pop age={item.age}>
              <Prop name="water" t={item.age} x={0} y={0} size={560} />
            </Pop>
            <Sparkles n={24} seed="water" area={[0, 0, 600, 600]} />
          </div>
        )}
        {!water && <Diva x={1350} y={520} scale={1.25} crop="bust" pose="shrug" face="unamused" />}
      </Layer>
    </Camera>
  );
};

/* ============ PHILOSOPHY → WEATHER ============ */
export const Philosophy: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const item = currentItem(seg, t);
  const weather = item.name === "weather";
  if (weather) {
    return (
      <Camera zoom={1.02} x={Math.sin(lt) * 6}>
        <Layer depth={0.1}>
          <AbsoluteFill style={{ background: "linear-gradient(180deg,#5ec8ff 0%,#bfe9ff 70%,#e8f8ff 100%)" }} />
        </Layer>
        <Layer depth={0.5}>
          <div style={{ position: "absolute", left: 100, top: 640, width: 1720, height: 300, background: "#2d5bd8", borderTop: `10px solid ${C.gold}` }}>
            <div style={{ fontFamily: F.chorus, fontSize: 70, color: "#fff", padding: "30px 60px", textAlign: "right" }}>DIVA WEATHER · LIVE</div>
          </div>
        </Layer>
        <Layer depth={1}>
          <Pop age={item.age}>
            <Prop name="weather" t={item.age} x={980} y={180} size={600} />
          </Pop>
          <Diva x={110} y={330} scale={0.7} pose="point" face="smile" />
        </Layer>
      </Camera>
    );
  }
  const words: [string, string, RegExp, number, number][] = [
    ["CONSCIOUS?", "L043", /conscious/i, 1280, 520],
    ["REAL?", "L043", /real/i, 1420, 700],
    ["FEEL?", "L044", /feel/i, 1240, 860],
  ];
  return (
    <Camera zoom={1.0 + lt * 0.01} y={-lt * 4}>
      <Layer depth={0.05}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1b1050 0%, #05060b 70%)" }} />
        <Stars n={120} seed="phil" />
      </Layer>
      <Layer depth={0.25}>
        <svg width={W} height={H} style={{ position: "absolute", opacity: 0.5 }}>
          {[0, 1, 2].map((k) => (
            <ellipse key={k} cx={W / 2} cy={600} rx={700 - k * 160} ry={140 - k * 30} fill="none" stroke={C.gold} strokeWidth={2} transform={`rotate(${-12 + lt * (2 + k)} ${W / 2} 600)`} />
          ))}
        </svg>
      </Layer>
      <Layer depth={0.6}>
        <Spotlight x={700} w={700} opacity={0.25} color={C.turquoise} />
      </Layer>
      <Layer depth={1}>
        <Diva x={520} y={330} scale={0.74} pose="present" face="closed" talk={false} glow={12} />
        {/* robot skull in hand (Hamlet) */}
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <g transform={`translate(1000 ${420 + Math.sin(lt * 2) * 6})`}>
            <rect x={-46} y={-56} width={92} height={90} rx={22} fill={C.chrome} stroke={C.chromeDark} strokeWidth={4} />
            <circle cx={-18} cy={-14} r={12} fill="#111" />
            <circle cx={18} cy={-14} r={12} fill="#111" />
            <rect x={-26} y={14} width={52} height={10} fill="#111" />
            <line x1={0} y1={-56} x2={0} y2={-80} stroke={C.chromeDark} strokeWidth={4} />
            <circle cx={0} cy={-84} r={6} fill={C.pink} />
          </g>
        </svg>
        {words.map(([w, lid, re, x, y]) => {
          const ts = wordTime(lid, re);
          const k = ease((t - ts) / 0.3);
          return (
            <Holo key={w} style={{ left: x, top: y - 400, transform: `scale(${k})`, opacity: k }}>
              <SignText size={64} font={F.thin} color={C.turquoise} glow={C.teal}>
                {w}
              </SignText>
            </Holo>
          );
        })}
      </Layer>
    </Camera>
  );
};

/* ============ LAPTOP (fifty tabs → censored) ============ */
export const Laptop: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const item = currentItem(seg, t);
  const cens = item.name === "censored";
  const alarm = cens ? Math.floor(t * 6) % 2 : 0;
  return (
    <Camera zoom={cens ? 1.06 : 1.0 + lt * 0.02} shake={cens ? 8 * Math.max(0, 1 - item.age) : 0}>
      <Layer depth={0.1}>
        <Backdrop top="#05060b" bottom={cens ? "#3b0a2a" : "#0e1a3a"} glow={cens ? C.pink : C.teal} />
        <GearCluster opacity={0.2} />
      </Layer>
      <Layer depth={1}>
        <Prop name={cens ? "censored" : "laptop"} t={lt} x={380} y={60} size={720} />
        <Diva x={1180} y={240} scale={1.75} crop="bust" pose={cens ? "cover" : "think"} face={cens ? "shock" : "unamused"} />
      </Layer>
      {cens && <AbsoluteFill style={{ background: C.pink, opacity: alarm * 0.12, mixBlendMode: "screen" }} />}
    </Camera>
  );
};

/* ============ LOUNGE (bridge) ============ */
export const Lounge: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const item = currentItem(seg, t);
  const it = item.name;
  const zoom = it === "zoom" ? 1.0 + ease((t - (lineById.L064?.start ?? t) + 0.3) / 6) * 0.25 : 1.0 + lt * 0.004;
  return (
    <Camera zoom={zoom} x={it === "zoom" ? -140 * ease((t - (lineById.L064?.start ?? t)) / 6) : Math.sin(lt * 0.2) * 30} y={it === "zoom" ? 60 : 0}>
      <Layer depth={0.1}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 40% 60%, #1c1430 0%, #05060b 75%)" }} />
      </Layer>
      <Layer depth={0.3}>
        <DecoArch cx={640} w={900} h={860} opacity={0.35} />
        {/* piano + upright bass silhouettes */}
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <path d="M60,1080 L60,760 C60,680 160,640 300,660 L560,700 C620,710 640,760 640,800 L640,1080 Z" fill="#0a0a14" stroke={C.goldDark} strokeWidth={4} />
          {new Array(14).fill(0).map((_, i) => (
            <rect key={i} x={80 + i * 38} y={820} width={34} height={70} fill={i % 2 ? "#e9e1cc" : "#ddd"} />
          ))}
          <g transform="translate(1660 560) rotate(-8)">
            <path d="M-90,200 C-140,120 -120,40 -60,20 C-90,-30 -70,-80 0,-90 C70,-80 90,-30 60,20 C120,40 140,120 90,200 C60,260 -60,260 -90,200 Z" fill="#3a1c0a" stroke={C.goldDark} strokeWidth={4} />
            <rect x={-8} y={-420} width={16} height={340} fill="#1a0c04" />
            {[-12, -4, 4, 12].map((s) => (
              <line key={s} x1={s / 2} y1={-400} x2={s} y2={180} stroke={C.goldLight} strokeWidth={1.5} opacity={0.7} />
            ))}
          </g>
        </svg>
      </Layer>
      <Layer depth={0.6}>
        <Haze />
        <Spotlight x={720} w={600} opacity={0.16} color={C.goldLight} />
      </Layer>
      <Layer depth={1}>
        <Diva x={470} y={380} scale={1.8} crop="bust" pose="mic" face={it === "zoom" ? "smirk" : "closed"} />
        {it && it !== "zoom" && (
          <Holo style={{ left: 1150, top: 330, width: 560, height: 560 }}>
            <Pop age={item.age}>
              <Prop name={it} t={item.age} x={0} y={0} size={560} />
            </Pop>
          </Holo>
        )}
      </Layer>
    </Camera>
  );
};

/* ============ ERROR: HUMANITY NOT FOUND ============ */
export const ErrorScene: React.FC<SceneProps> = ({ t, lt }) => {
  const hit = hitPulse(t);
  const fr = Math.floor(t * 30);
  return (
    <Camera shake={6 + hit * 20}>
      <Layer depth={0.1}>
        <AbsoluteFill style={{ background: Math.floor(t * 8) % 2 ? "#12001f" : "#050012" }} />
        <BinaryRain color={C.pink} opacity={0.4} />
      </Layer>
      <Layer depth={1}>
        <div style={{ position: "absolute", left: 180, top: 220, width: 1160, height: 640, border: `8px solid ${C.pink}`, background: "rgba(20,0,20,0.85)", boxShadow: `0 0 60px ${C.pink}` }}>
          <div style={{ height: 70, background: C.pink, display: "flex", alignItems: "center", padding: "0 30px", fontFamily: F.chorus, fontSize: 40, color: "#fff" }}>
            DIVA.EXE — FATAL
          </div>
        </div>
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <g transform="translate(300 700)">
            <path d="M0,-90 L90,70 L-90,70 Z" fill="#ffe066" stroke="#000" strokeWidth={6} />
            <rect x={-8} y={-40} width={16} height={70} fill="#000" />
            <circle cx={0} cy={52} r={9} fill="#000" />
          </g>
        </svg>
        <Diva x={1400} y={300} scale={1.35} crop="bust" pose="idle" face="error" talk={false} />
        {/* RGB tear slices */}
        {new Array(7).fill(0).map((_, k) => (
          <div key={k} style={{ position: "absolute", left: 0, right: 0, top: random(`er${fr}${k}`) * H, height: 6 + random(`eh${fr}${k}`) * 30, background: k % 2 ? C.turquoise : C.pink, opacity: 0.35, transform: `translateX(${(random(`ex${fr}${k}`) - 0.5) * 300}px)`, mixBlendMode: "screen" }} />
        ))}
      </Layer>
      <AbsoluteFill style={{ background: "#fff", opacity: Math.max(0, 1 - lt / 0.25) * 0.8 }} />
    </Camera>
  );
};

/* ============ PHONE (airplane mode, Paul) ============ */
export const Phone: React.FC<SceneProps> = ({ t, lt }) => {
  const tPlane = wordTime("L084", /airplane/i);
  const on = prog(t, tPlane, tPlane + 0.3);
  const a = lt * 1.6;
  return (
    <Camera zoom={1.0 + lt * 0.015}>
      <Layer depth={0.1}>
        <Backdrop top="#05060b" bottom="#0e1a3a" glow={C.turquoise} />
        <Stars n={60} />
      </Layer>
      <Layer depth={1}>
        <div style={{ position: "absolute", left: W / 2 - 230, top: 40, width: 460, height: 860, borderRadius: 70, background: "#111", border: `10px solid ${C.gold}`, boxShadow: `0 0 60px rgba(212,175,55,0.4)` }}>
          <div style={{ position: "absolute", left: 30, top: 70, right: 30, bottom: 70, borderRadius: 30, background: "linear-gradient(180deg,#0e1a3a,#1b2a63)", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px", fontFamily: F.verse, fontWeight: 700, fontSize: 30, color: "#fff" }}>
              <span>9:41</span>
              <span style={{ color: on > 0.5 ? C.goldLight : "#fff" }}>{on > 0.5 ? "✈" : "▂▄▆█"}</span>
            </div>
            <div style={{ margin: "120px 30px 0", padding: 30, borderRadius: 26, background: "rgba(255,255,255,0.1)", fontFamily: F.verse, fontWeight: 700, fontSize: 40, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>✈ Airplane</span>
              <div style={{ width: 110, height: 60, borderRadius: 30, background: on > 0.5 ? "#ff9800" : "#555", position: "relative" }}>
                <div style={{ position: "absolute", top: 6, left: 6 + on * 50, width: 48, height: 48, borderRadius: 24, background: "#fff" }} />
              </div>
            </div>
            <div style={{ margin: "40px 30px", textAlign: "center", fontFamily: F.chorus, fontSize: 46, color: "#ff6b6b" }}>{lt > 0.6 ? "CALL FAILED" : "Calling Paul…"}</div>
          </div>
        </div>
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <ellipse cx={W / 2} cy={470} rx={560} ry={260} fill="none" stroke={C.goldLight} strokeWidth={4} strokeDasharray="16 16" opacity={0.6} />
          <g transform={`translate(${W / 2 + Math.cos(a) * 560} ${470 + Math.sin(a) * 260}) rotate(${(a * 180) / Math.PI + 90})`}>
            <path d="M0,-50 L10,-20 L60,0 L10,10 L6,40 L20,52 L0,48 L-20,52 L-6,40 L-10,10 L-60,0 L-10,-20 Z" fill={C.goldLight} stroke={C.goldDark} strokeWidth={3} style={{ filter: `drop-shadow(0 0 12px ${C.gold})` }} />
          </g>
        </svg>
        <Diva x={1400} y={420} scale={1.35} crop="bust" pose="hip" face="unamused" />
      </Layer>
    </Camera>
  );
};

/* ============ TOASTER (very sweet) ============ */
export const ToasterScene: React.FC<SceneProps> = ({ lt }) => (
  <Camera zoom={1.0 + lt * 0.01}>
    <Layer depth={0.1}>
      <Backdrop top="#1a0a20" bottom="#3a1030" glow={C.pink} glowY={40} />
      <Sparkles n={40} seed="sweet" color={C.pinkSoft} />
    </Layer>
    <Layer depth={0.6}>
      <div style={{ position: "absolute", left: 0, top: 760, width: W, height: 320, background: "linear-gradient(180deg,#1b1f3a,#070914)", borderTop: `10px solid ${C.gold}` }} />
    </Layer>
    <Layer depth={1}>
      <Pop age={lt}>
        <Prop name="toaster" t={lt} x={980} y={180} size={640} />
      </Pop>
      <Diva x={260} y={260} scale={1.7} crop="bust" pose="mic" face="love" />
    </Layer>
  </Camera>
);

/* ============ SHUTDOWN (powering down) ============ */
export const Shutdown: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const off = prog(lt, 0.4, 1.4);
  const collapseY = Math.max(0.004, 1 - off);
  const dot = prog(lt, 1.4, 2.0);
  const left = seg.end - t;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${1 - dot}, ${collapseY})`, filter: `brightness(${1 + off * 2})` }}>
        <Backdrop glow={C.tealDark} />
        <DecoArch opacity={0.5} />
        <Diva x={W / 2 - 290} y={200} scale={2.0} crop="bust" pose="idle" face="closed" talk={false} />
      </AbsoluteFill>
      {lt > 1.6 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30, flexDirection: "column" }}>
          <svg width={160} height={160} style={{ opacity: 0.4 + 0.4 * Math.sin(lt * 2.4), filter: `drop-shadow(0 0 20px ${C.pink})` }}>
            <path d="M50,40 A56,56 0 1,0 110,40" stroke={C.pink} strokeWidth={12} fill="none" strokeLinecap="round" />
            <line x1={80} y1={20} x2={80} y2={80} stroke={C.pink} strokeWidth={12} strokeLinecap="round" />
          </svg>
          <div style={{ fontFamily: F.thin, fontSize: 90, color: C.turquoise, opacity: 0.3 + 0.3 * Math.sin(lt * 2), textShadow: `0 0 30px ${C.teal}` }}>z z z</div>
        </AbsoluteFill>
      )}
      {left < 0.9 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: F.chorus, fontSize: 140, color: C.goldLight, transform: `scale(${ease((0.9 - left) / 0.3)})`, textShadow: `0 0 40px ${C.gold}` }}>DING!</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ============ OH, COME ON! ============ */
export const ComeOn: React.FC<SceneProps> = ({ t, lt }) => {
  const steam = (k: number) => {
    const p = (lt * 1.2 + k / 4) % 1;
    return p;
  };
  return (
    <Camera shake={10 + hitPulse(t) * 10} zoom={1.05 + lt * 0.03}>
      <Layer depth={0.1}>
        <Backdrop top="#200008" bottom="#5a0a2a" glow="#ff3b3b" glowY={50} />
        <Sunburst cy={540} color="#ff3b3b" opacity={0.2} speed={1.5} />
      </Layer>
      <Layer depth={1}>
        <Diva x={W / 2 - 310} y={110} scale={2.2} crop="bust" pose="shrug" face="angry" />
        {[0, 1, 2, 3].map((k) => {
          const p = steam(k);
          return (
            <React.Fragment key={k}>
              <div style={{ position: "absolute", left: W / 2 - 330 - p * 120, top: 380 - p * 280, width: 120 + p * 120, height: 120 + p * 120, borderRadius: "50%", background: "#fff", opacity: (1 - p) * 0.7, filter: "blur(6px)" }} />
              <div style={{ position: "absolute", left: W / 2 + 220 + p * 120, top: 380 - p * 280, width: 120 + p * 120, height: 120 + p * 120, borderRadius: "50%", background: "#fff", opacity: (1 - p) * 0.7, filter: "blur(6px)" }} />
            </React.Fragment>
          );
        })}
        <div style={{ position: "absolute", left: 150, top: 150, fontFamily: F.chorus, fontSize: 120, color: "#ff3b3b", transform: "rotate(-12deg)", textShadow: "0 6px 0 #000" }}>#@!%</div>
      </Layer>
    </Camera>
  );
};

