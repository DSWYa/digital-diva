import React from "react";
import { AbsoluteFill, random } from "remotion";
import { C, F, H, W } from "../theme";
import { Diva, DivaFace, DivaPose } from "../components/characters/Diva";
import { Cow, Couple, Grandma } from "../components/characters/Cast";
import { Prop } from "../components/props/Props";
import {
  Backdrop,
  Bulbs,
  Camera,
  Circuits,
  Confetti,
  Curtains,
  DecoArch,
  DecoPanel,
  Floor,
  GearCluster,
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
import { beatAt, beatPulse, hitPulse, lineStart, wordTime } from "../lib/timing";
import { currentItem, currentLineId } from "../lib/plan";
import { Bubble, SceneProps, ScreenText, typed, VintageComputer } from "./common";

const ease = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

/* ============ BOOT (intro, spoken) ============ */
export const Boot: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const item = currentItem(seg, t);
  const lid = currentLineId(t);
  const on = prog(lt, 0.2, 1.6);
  const faces: Record<string, DivaFace> = { L000: "smile", L001: "smirk", L002: "unamused", L003: "unamused", L004: "unamused" };
  const face: DivaFace = lt < 1.2 ? "closed" : faces[lid ?? "L000"] ?? "smile";
  const pose: DivaPose = item.name === "facepalm" ? "facepalm" : lid === "L001" ? "hip" : lid === "L002" ? "think" : "idle";
  const stab = hitPulse(t) * (t > 14.8 && t < 16.5 ? 1 : 0);
  return (
    <Camera x={-40 + lt * 3} y={-lt * 2} zoom={1 + lt * 0.006}>
      <Layer depth={0.1}>
        <Backdrop glow={C.tealDark} glowY={40} />
        <Stars n={50} />
      </Layer>
      <Layer depth={0.25}>
        <Sunburst cx={1360} cy={760} opacity={0.12 * on} speed={0.05} />
        <DecoArch cx={1360} w={760} h={900} opacity={0.6 * on} />
      </Layer>
      <Layer depth={0.4}>
        <GearCluster side="right" opacity={0.25} />
      </Layer>
      <Layer depth={1}>
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(${(1 - on) * 100}% 0 0 0)` }}>
          <Diva x={1040} y={260} scale={2.05} crop="bust" pose={pose} face={face} eyeColor={lt < 1.2 ? "#333" : C.turquoise} glow={stab * 30} />
        </div>
        {/* boot scanline */}
        {on < 1 && <div style={{ position: "absolute", left: 980, width: 760, top: 260 + (1 - on) * 860, height: 6, background: C.turquoise, boxShadow: `0 0 30px ${C.turquoise}` }} />}
      </Layer>
      <Layer depth={1.25}>
        <Prop name="gramophone" t={lt} x={40} y={720} size={340} />
        {item.name === "plug" && (
          <Pop age={item.age}>
            <Prop name="plug" t={item.age} x={700} y={300} size={400} />
          </Pop>
        )}
      </Layer>
      {stab > 0.05 && <AbsoluteFill style={{ background: C.goldLight, opacity: stab * 0.35, mixBlendMode: "screen" }} />}
    </Camera>
  );
};

/* ============ MARQUEE (instrumentals + finale) ============ */
const DANCE: DivaPose[] = ["cheer", "hip", "point", "wave", "shrug", "present", "cheer", "mic"];
export const Marquee: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const v = seg.variant ?? "title";
  const b = beatAt(t);
  const pulse = beatPulse(t, 5);
  const hit = hitPulse(t);
  const pose: DivaPose = v === "trumpet" ? "trumpet" : v === "finale" && lt > 9 ? "present" : DANCE[Math.floor(b.n / 2) % DANCE.length];
  const sign = { title: ["DIGITAL DIVA", "BEEP · BOOP · BABY"], trumpet: ["HOT JAZZ", "TRUMPET SOLO"], dance: ["SYSTEM", "OVERLOAD"], glitch: ["THE DIVA", "CHORUS LINE"], finale: ["DIGITAL DIVA", "THANK YOU, HUMANS"] }[v] ?? ["DIGITAL DIVA", ""];
  const neonFloor = v === "dance" || v === "glitch";
  const glitch = v === "dance" || v === "glitch" ? hit : 0;
  const signIn = ease(lt / 0.8);
  const endFade = v === "finale" ? prog(t, seg.end - 1.2, seg.end - 0.1) : 0;
  return (
    <Camera x={Math.sin(lt * 0.4) * 30} y={0} zoom={1.02 + pulse * 0.012} shake={glitch * 14}>
      <Layer depth={0.1}>
        <Backdrop top={C.black} bottom={neonFloor ? "#1a0033" : C.navy} glow={neonFloor ? C.pink : C.tealDark} glowY={45} />
        <Stars n={60} />
      </Layer>
      <Layer depth={0.2}>
        <Sunburst cy={700} opacity={0.14 + pulse * 0.06} speed={neonFloor ? 0.4 : 0.12} color={neonFloor ? C.pink : C.gold} />
        <Skyline y={800} lit seed={v} />
      </Layer>
      <Layer depth={0.45}>
        <Floor kind={neonFloor ? "neon" : "stage"} horizon={800} speed={neonFloor ? 0.05 : 0} />
        {neonFloor && <Circuits opacity={0.4} seed={v} />}
      </Layer>
      <Layer depth={0.6}>
        {/* marquee sign */}
        <div style={{ position: "absolute", left: W / 2 - 560, top: 40, width: 1120, height: 300, transform: `scale(${0.6 + 0.4 * signIn}) translateY(${(1 - signIn) * -200}px)`, opacity: signIn }}>
          <DecoPanel x={0} y={0} w={1120} h={300} fill="#0b0f26" glow={C.gold}>
            <svg width={1120} height={300} style={{ position: "absolute" }}>
              <Bulbs x={40} y={22} w={1040} n={30} />
              <Bulbs x={40} y={278} w={1040} n={30} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <SignText size={118} font={F.deco} color={C.goldLight} glow={C.gold}>
                {sign[0]}
              </SignText>
              <SignText size={52} font={F.chorus} color="#fff" glow={Math.floor(lt * 4) % 7 === 0 ? C.turquoise : C.pink}>
                {sign[1]}
              </SignText>
            </div>
          </DecoPanel>
        </div>
      </Layer>
      <Layer depth={0.8}>
        <Spotlight x={420} sway={18} opacity={0.18 + pulse * 0.1} />
        <Spotlight x={1500} sway={-18} opacity={0.18 + pulse * 0.1} color={C.pinkSoft} />
      </Layer>
      <Layer depth={1}>
        {v === "glitch" ? (
          [0, 1, 2, 3, 4].map((k) => (
            <Diva key={k} x={140 + k * 330} y={360 + Math.abs(k - 2) * 20} scale={0.66} pose={DANCE[(Math.floor(b.n / 2) + (k % 2)) % DANCE.length]} face={k === 2 ? "wink" : "smile"} flip={k % 2 === 1} talk={false} />
          ))
        ) : (
          <Diva x={v === "trumpet" ? 640 : 760} y={330} scale={0.74} pose={pose} face={v === "trumpet" ? "closed" : v === "finale" ? "smile" : "wink"} talk={false} />
        )}
        {v === "trumpet" &&
          new Array(6).fill(0).map((_, k) => {
            const p = (lt * 0.5 + k / 6) % 1;
            return (
              <div key={k} style={{ position: "absolute", left: 600 - p * 500, top: 420 - p * 260 + Math.sin(p * 9 + k) * 40, fontSize: 70 + k * 6, color: k % 2 ? C.goldLight : C.turquoise, opacity: 1 - p, textShadow: `0 0 16px ${C.gold}`, fontFamily: F.chorus }}>
                {k % 3 ? "♪" : "♫"}
              </div>
            );
          })}
      </Layer>
      <Layer depth={1.3}>
        <Sparkles n={30} seed={v} />
        {v === "finale" && <Confetti t0={0} />}
        {v === "finale" && <Grandma x={1460} y={700} scale={0.75} arms="wave" face="delighted" />}
      </Layer>
      {glitch > 0.3 && (
        <AbsoluteFill style={{ mixBlendMode: "screen", opacity: glitch * 0.6 }}>
          {new Array(6).fill(0).map((_, k) => (
            <div key={k} style={{ position: "absolute", left: 0, right: 0, top: random(`gl${Math.floor(t * 30)}${k}`) * H, height: 10 + random(`gh${k}${Math.floor(t * 30)}`) * 40, background: k % 2 ? C.pink : C.turquoise, opacity: 0.5, transform: `translateX(${(random(`gx${k}${Math.floor(t * 30)}`) - 0.5) * 200}px)` }} />
          ))}
        </AbsoluteFill>
      )}
      {endFade > 0 && <AbsoluteFill style={{ background: "#000", opacity: endFade }} />}
    </Camera>
  );
};

/* ============ GRANDMA (vintage computer messages) ============ */
export const GrandmaScene: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const item = currentItem(seg, t);
  const it = item.name ?? "clock";
  const dark = it === "newmsg";
  const rocking = it === "rocking";
  const rock = rocking ? Math.sin(item.age * 3.2) * 6 : 0;
  const arms = it === "search" || it === "glasses" ? "search" : it === "wave" ? "wave" : it === "thanks" ? "letter" : rocking ? "rest" : "type";
  const face = it === "search" || it === "glasses" ? "confused" : it === "wave" || it === "thanks" ? "delighted" : it === "newmsg" ? "squint" : it === "letter" ? "talk" : "happy";
  const glasses = it === "search" || it === "glasses" ? "head" : "eyes";

  const screen = (() => {
    switch (it) {
      case "clock":
        return <ScreenText size={34}>{typed("> CONNECTING...\n> DIAL TONE OK\n> HELLO ROBOT???", item.age, 22)}</ScreenText>;
      case "message":
        return <ScreenText size={38}>{typed("DEAR LITTLE ROBOT,\nHOPE YOU'RE DOING\nFINE!!! ♥♥♥", item.age, 24)}</ScreenText>;
      case "letter": {
        const scroll = item.age * 70;
        return (
          <div style={{ transform: `translateY(${-scroll}px)` }}>
            <ScreenText size={22} color="#ffe9a8">
              {new Array(7)
                .fill(0)
                .map((_, k) => `¶${k + 1}  Bless you dear robot, I pray for your circuits and your little fan and...\n`)
                .join("\n")}
            </ScreenText>
          </div>
        );
      }
      case "rocking":
        return <ScreenText size={34}>{"HOW 2 TURN ON\nELECTRIC ROCKING\nCHAIR???  ⚡"}</ScreenText>;
      case "search":
      case "glasses":
        return (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Diva x={20} y={-10} scale={0.66} crop="bust" pose="point" face="unamused" talk={false} />
            <ScreenText size={30} color={C.pinkSoft} style={{ position: "absolute", right: 0, top: 30, textAlign: "right" }}>
              {"THEY'RE\nON YOUR\nHEAD ↑"}
            </ScreenText>
          </div>
        );
      case "wave":
        return (
          <div style={{ position: "relative", width: "100%", height: "100%", background: "#082a2e" }}>
            <Diva x={90} y={0} scale={0.7} crop="bust" pose="wave" face="smile" />
          </div>
        );
      case "thanks":
        return <ScreenText size={30} color="#ffd1ea">{new Array(9).fill("THANK YOU DEAR ♥ ").join("").slice(0, Math.floor(item.age * 30))}</ScreenText>;
      case "newmsg":
        return (
          <div style={{ position: "relative", width: "100%", height: "100%", background: "#0a1a1c" }}>
            <Prop name="envelope" t={item.age} x={60} y={-30} size={340} />
            <ScreenText size={26} style={{ position: "absolute", bottom: 0, width: "100%", textAlign: "center", padding: 8 }}>
              NEW MESSAGE ✉
            </ScreenText>
          </div>
        );
      default:
        return null;
    }
  })();

  return (
    <Camera x={Math.sin(lt * 0.3) * 20 + (it === "glasses" ? 60 : 0)} y={it === "glasses" ? -30 : 0} zoom={it === "glasses" ? 1.12 : 1.03 + lt * 0.004}>
      <Layer depth={0.1}>
        <Backdrop top={dark ? "#020208" : "#1a1030"} bottom={dark ? "#05060b" : "#3a2350"} glow={dark ? C.tealDark : C.pink} glowY={30} />
      </Layer>
      <Layer depth={0.3} style={{ opacity: dark ? 0.25 : 1 }}>
        {/* wallpaper deco fans */}
        <svg width={W} height={H} style={{ position: "absolute", opacity: 0.18 }}>
          {new Array(8).fill(0).map((_, i) =>
            new Array(4).fill(0).map((__, j) => (
              <path key={`${i}${j}`} d={`M${i * 260 + (j % 2) * 130},${j * 220 + 200} a110,110 0 0,1 220,0 z`} fill="none" stroke={C.gold} strokeWidth={3} />
            )),
          )}
        </svg>
        {/* window with dawn */}
        <div style={{ position: "absolute", left: 590, top: 20, width: 300, height: 320, borderRadius: "150px 150px 0 0", border: `12px solid ${C.goldDark}`, background: dark ? "#050818" : "linear-gradient(180deg,#2a1a4a 0%,#ff8a5c 70%,#ffd27a 100%)", overflow: "hidden" }}>
          {!dark && <div style={{ position: "absolute", left: 80, top: 200 - prog(lt, 0, 8) * 60, width: 140, height: 140, borderRadius: "50%", background: "#ffe08a", boxShadow: "0 0 60px #ffd27a" }} />}
          <div style={{ position: "absolute", left: 138, top: 0, width: 12, height: "100%", background: C.goldDark }} />
          <div style={{ position: "absolute", top: 150, left: 0, height: 12, width: "100%", background: C.goldDark }} />
        </div>
        {it === "clock" && <Prop name="clock" t={item.age} x={150} y={10} size={280} />}
      </Layer>
      <Layer depth={1}>
        {/* desk */}
        <div style={{ position: "absolute", left: -40, top: 840, width: 1100, height: 260, background: "linear-gradient(180deg,#6b3a1c,#3a1c0a)", borderTop: `8px solid ${C.gold}` }} />
        <div style={{ transform: `rotate(${rock}deg)`, transformOrigin: "620px 1000px", position: "absolute", inset: 0 }}>
          {rocking && (
            <svg width={W} height={H} style={{ position: "absolute" }}>
              <path d="M470,980 Q620,1040 800,960" stroke={C.goldDark} strokeWidth={22} fill="none" />
              <rect x={470} y={360} width={320} height={430} rx={30} fill="#5a2e14" stroke={C.gold} strokeWidth={6} />
              <path d="M520,790 L500,980 M740,790 L770,970" stroke="#5a2e14" strokeWidth={22} />
              {/* power cord + sparks */}
              <path d="M780,700 C900,760 880,900 1000,1000" stroke="#222" strokeWidth={10} fill="none" />
              {new Array(5).fill(0).map((_, k) => (
                <path key={k} d={`M${800 + k * 10},${560 + random(`sp${k}${Math.floor(t * 12)}`) * 200} l20,-30 l-10,0 l20,-30`} stroke="#ffe066" strokeWidth={5} fill="none" style={{ filter: "drop-shadow(0 0 8px #ffe066)" }} />
              ))}
            </svg>
          )}
          <Grandma x={rocking ? 430 : 520} y={rocking ? 330 : 360} scale={1.0} arms={arms} face={face} glasses={glasses} />
        </div>
        {!rocking && (
          <VintageComputer x={20} y={300} scale={1.0} glow={dark ? C.pink : C.turquoise}>
            {screen}
          </VintageComputer>
        )}
        {rocking && (
          <VintageComputer x={-40} y={420} scale={0.75}>
            {screen}
          </VintageComputer>
        )}
        {it === "glasses" && (
          <div style={{ position: "absolute", left: 640, top: 290, width: 230, height: 140, borderRadius: "50%", border: `8px solid ${C.pink}`, boxShadow: `0 0 30px ${C.pink}`, transform: `scale(${1 + 0.08 * Math.sin(t * 10)})` }} />
        )}
        {dark && <AbsoluteFill style={{ background: "radial-gradient(ellipse 40% 50% at 15% 45%, transparent 0%, rgba(0,0,0,0.65) 100%)" }} />}
      </Layer>
    </Camera>
  );
};

/* ============ SWITCHBOARD (politeness / feelings / coffee) ============ */
export const Switchboard: React.FC<SceneProps> = ({ seg, t }) => {
  const item = currentItem(seg, t);
  const it = item.name ?? "polite";
  const face: DivaFace = it === "feelings" ? "unamused" : it === "coffee" ? "smirk" : it === "lean" ? "wink" : "smirk";
  const pose: DivaPose = it === "coffee" ? "shrug" : it === "lean" ? "present" : it === "feelings" ? "hip" : "mic";
  const lean = it === "lean" ? ease(item.age / 0.6) : 0;
  return (
    <Camera x={lean * -120} y={lean * -40} zoom={1 + lean * 0.18}>
      <Layer depth={0.1}>
        <Backdrop top="#05060b" bottom="#0e1a3a" glow={C.tealDark} />
      </Layer>
      <Layer depth={0.35}>
        {/* switchboard wall */}
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <rect x={60} y={80} width={1800} height={760} rx={20} fill="#2a1408" stroke={C.gold} strokeWidth={8} />
          {new Array(8).fill(0).map((_, r) =>
            new Array(22).fill(0).map((__, c) => {
              const on = random(`sw${r}${c}${Math.floor(t * 3 + r)}`) > 0.75;
              return (
                <g key={`${r}${c}`}>
                  <circle cx={120 + c * 80} cy={140 + r * 86} r={14} fill="#111" stroke={C.goldDark} strokeWidth={3} />
                  <circle cx={120 + c * 80} cy={110 + r * 86} r={7} fill={on ? (c % 3 ? C.turquoise : C.pink) : "#3a2a1a"} style={on ? { filter: `drop-shadow(0 0 6px ${C.turquoise})` } : undefined} />
                </g>
              );
            }),
          )}
          {new Array(9).fill(0).map((_, k) => (
            <path key={k} d={`M${200 + k * 180},${180 + (k % 4) * 86} C${240 + k * 170},${900} ${500 + k * 120},${880} ${300 + k * 150},${140 + ((k + 2) % 7) * 86}`} stroke={[C.pink, C.teal, C.gold][k % 3]} strokeWidth={8} fill="none" opacity={0.85} />
          ))}
        </svg>
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(5,6,11,0.2) 0%, rgba(5,6,11,0.55) 55%, rgba(5,6,11,0.85) 100%)" }} />
      </Layer>
      <Layer depth={1}>
        <div style={{ position: "absolute", left: 0, top: 850, width: W, height: 240, background: "linear-gradient(180deg,#3a1c0a,#120802)", borderTop: `8px solid ${C.gold}` }} />
        <Diva x={20} y={260} scale={1.75} crop="bust" pose={pose} face={face} />
        <div style={{ position: "absolute", left: 520, top: 200, width: 440, height: 520 }}>
          {it === "polite" &&
            ["PLEASE", "THANK YOU", "SORRY, DEAR"].map((w, k) => {
              const age = item.age - k * 0.45;
              return age > 0 ? <Bubble key={w} x={220 + (k - 1) * 30} y={90 + k * 160} text={w} size={42} rot={(k - 1) * 6} scale={ease(age / 0.3)} color={k === 1 ? "#ffd1ea" : C.cream} /> : null;
            })}
          {it === "feelings" && (
            <Pop age={item.age}>
              <svg viewBox="0 0 520 600" width={440} height={508}>
                <path d="M60,380 A200,200 0 0,1 460,380" fill="none" stroke={C.gold} strokeWidth={30} />
                <path d="M60,380 A200,200 0 0,1 140,220" fill="none" stroke={C.pink} strokeWidth={30} />
                <line x1={260} y1={380} x2={260 - Math.cos(0.15 + Math.sin(t * 20) * 0.04) * 170} y2={380 - Math.sin(0.15) * 170} stroke="#fff" strokeWidth={10} strokeLinecap="round" />
                <circle cx={260} cy={380} r={22} fill={C.gold} />
                <text x={260} y={470} textAnchor="middle" fontFamily={F.deco} fontSize={56} fill={C.goldLight}>FEELINGS</text>
                <text x={260} y={530} textAnchor="middle" fontFamily={F.chorus} fontSize={44} fill={C.pinkSoft}>0% · N/A</text>
              </svg>
            </Pop>
          )}
          {it === "coffee" && (
            <Pop age={item.age}>
              <Prop name="coffee" t={item.age} x={0} y={40} size={440} />
            </Pop>
          )}
          {it === "lean" && <Sparkles n={24} seed="lean" area={[0, 0, 520, 600]} />}
        </div>
      </Layer>
    </Camera>
  );
};

/* ============ SHOWCASE (props in a deco frame / spotlight / quiz) ============ */
export const Showcase: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const item = currentItem(seg, t);
  const bg = seg.bg ?? "deco";
  const name = item.name ?? Object.values(seg.items)[0];
  const age = item.name ? item.age : lt;
  if (bg === "spotlight") {
    const dim = prog(lt, 0, 0.4);
    return (
      <Camera zoom={1.0 + lt * 0.012} y={-lt * 4}>
        <Layer depth={0.1}>
          <AbsoluteFill style={{ background: "#020205" }} />
        </Layer>
        <Layer depth={0.3}>
          <Curtains open={0.6} />
        </Layer>
        <Layer depth={0.6}>
          <Spotlight x={W / 2} w={900} opacity={0.32 * dim} />
          <div style={{ position: "absolute", left: W / 2 - 520, top: 760, width: 1040, height: 120, borderRadius: "50%", background: `radial-gradient(ellipse at center, ${C.goldLight}55 0%, transparent 70%)` }} />
        </Layer>
        <Layer depth={1}>
          <Pop age={age} from={0.6}>
            <Prop name={name} t={age} x={W / 2 - 330} y={110} size={660} />
          </Pop>
          <Diva x={1500} y={430} scale={1.3} crop="bust" pose="hip" face="unamused" />
        </Layer>
      </Camera>
    );
  }
  if (bg === "quiz") {
    const lid = currentLineId(t) ?? "";
    const responses: Record<string, string> = { L032: "smirk", L034: "wink", L036: "angry", L038: "shock" };
    const face = (responses[lid] as DivaFace) ?? "smile";
    const q = ["L031", "L033", "L035"].filter((id) => lineStart(id) - 0.4 <= t).length;
    return (
      <Camera x={Math.sin(lt) * 10} zoom={1.02}>
        <Layer depth={0.1}>
          <Backdrop top="#05060b" bottom="#1b0a33" glow={C.pink} glowY={70} />
          <Sunburst cy={1000} color={C.pink} opacity={0.1} speed={0.2} />
        </Layer>
        <Layer depth={0.4}>
          <svg width={W} height={H} style={{ position: "absolute" }}>
            <Bulbs x={80} y={430} w={1760} n={44} />
          </svg>
          <div style={{ position: "absolute", left: 120, top: 460, display: "flex", gap: 18 }}>
            {[1, 2, 3].map((k) => (
              <div key={k} style={{ width: 70, height: 70, borderRadius: 12, border: `4px solid ${C.gold}`, background: k <= q ? C.pink : "#1a1030", color: "#fff", fontFamily: F.chorus, fontSize: 44, textAlign: "center", lineHeight: "64px" }}>
                ?
              </div>
            ))}
          </div>
        </Layer>
        <Layer depth={1}>
          <DecoPanel x={640} y={470} w={640} h={560} fill="#0b0f26" glow={C.pink}>
            <Pop age={age}>
              <Prop name={name} t={age} x={60} y={20} size={520} />
            </Pop>
          </DecoPanel>
          <Diva x={1360} y={380} scale={0.72} pose={lid === "L036" ? "facepalm" : "point"} face={face} flip />
          <Diva x={60} y={560} scale={1.2} crop="bust" pose="mic" face={face} talk={false} glow={8} eyeColor={C.pinkSoft} />
        </Layer>
      </Camera>
    );
  }
  // deco frame (default)
  return (
    <Camera x={Math.sin(lt * 0.5) * 20} zoom={1.02 + beatPulse(t, 6) * 0.01}>
      <Layer depth={0.1}>
        <Backdrop glow={C.tealDark} />
        <Sunburst cx={760} cy={480} opacity={0.12} speed={0.1} />
      </Layer>
      <Layer depth={0.35}>
        <GearCluster opacity={0.22} />
        <DecoArch cx={760} w={900} h={860} base={880} opacity={0.5} />
      </Layer>
      <Layer depth={1}>
        <DecoPanel x={420} y={130} w={680} h={620} fill="#0b0f26" glow={C.gold}>
          <Pop age={age}>
            <Prop name={name} t={age} x={50} y={20} size={580} />
          </Pop>
        </DecoPanel>
        <Diva x={1240} y={170} scale={0.62} pose="present" face="smirk" flip />
      </Layer>
    </Camera>
  );
};

/* ============ WEDDING → COW ============ */
export const WeddingCow: React.FC<SceneProps> = ({ t, lt }) => {
  const tCow = wordTime("L016", /cows/i);
  const k = prog(t, tCow - 0.05, tCow + 0.35);
  const puff = k > 0 && k < 1;
  const shake = puff ? Math.sin(t * 60) * 10 : 0;
  return (
    <Camera zoom={1.02 + lt * 0.01}>
      <Layer depth={0.1}>
        <Backdrop top="#140a24" bottom="#2a1040" glow={C.pink} glowY={40} />
        <Sparkles n={30} seed="wed" color={C.pinkSoft} />
      </Layer>
      <Layer depth={1}>
        <div style={{ position: "absolute", left: W / 2 - 400, top: 60, width: 800, height: 680, transform: `translateX(${shake}px) rotate(${shake * 0.2}deg)` }}>
          {/* ornate frame */}
          <svg width={800} height={680} style={{ position: "absolute" }}>
            <rect x={10} y={10} width={780} height={660} rx={30} fill="#f6ead0" stroke={C.gold} strokeWidth={26} />
            <rect x={44} y={44} width={712} height={592} rx={18} fill="#fff8ec" stroke={C.goldDark} strokeWidth={6} />
            {[[10, 10], [790, 10], [10, 670], [790, 670]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={34} fill={C.gold} stroke={C.goldLight} strokeWidth={6} />
            ))}
            <path d="M400,60 l30,30 l-30,30 l-30,-30 z" fill={C.pink} />
          </svg>
          <div style={{ position: "absolute", left: 50, top: 50, width: 700, height: 580, overflow: "hidden", borderRadius: 16 }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 30%, #ffe4f1 0%, #f6ead0 70%)" }} />
            <div style={{ opacity: 1 - k, transform: `scale(${1 - k * 0.3})`, transformOrigin: "50% 80%" }}>
              <Couple x={140} y={120} scale={1.0} />
            </div>
            <div style={{ opacity: k, transform: `scale(${0.6 + k * 0.4})`, transformOrigin: "50% 80%" }}>
              <Cow x={150} y={110} scale={1.0} />
            </div>
          </div>
          {puff &&
            new Array(10).fill(0).map((_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return <div key={i} style={{ position: "absolute", left: 400 + Math.cos(a) * 200 * k - 70, top: 340 + Math.sin(a) * 160 * k - 70, width: 140, height: 140, borderRadius: "50%", background: "#fff", opacity: 0.9 * (1 - k) }} />;
            })}
        </div>
        {k > 0.9 && (
          <div style={{ position: "absolute", left: 1270, top: 140, transform: `rotate(12deg) scale(${ease((t - tCow - 0.3) / 0.3)})`, fontFamily: F.chorus, fontSize: 110, color: C.pink, textShadow: `0 0 20px ${C.pink}, 0 6px 0 #3b0a2a` }}>
            MOO!
          </div>
        )}
        <Diva x={60} y={300} scale={1.4} crop="bust" pose={k > 0.5 ? "facepalm" : "mic"} face={k > 0.5 ? "unamused" : "smile"} />
      </Layer>
    </Camera>
  );
};

/* ============ STORM (pre-chorus: impossible requests) ============ */
const REQUESTS = ["HELP!!", "URGENT", "PLS?", "HOW 2…", "WHY?", "ASAP!", "FIX IT", "ARE U REAL?", "QUICK Q", "LOL WHAT", "???", "HI AGAIN"];
export const Storm: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const item = currentItem(seg, t);
  const it = item.name ?? "bells";
  const n = Math.min(REQUESTS.length, 3 + Math.floor(lt * 1.6));
  const zoom = it === "zoom" ? 1 + ease(item.age / 1.5) * 0.35 : 1.0;
  return (
    <Camera zoom={zoom} y={it === "zoom" ? 120 * ease(item.age / 1.5) : 0} shake={hitPulse(t) * 6}>
      <Layer depth={0.1}>
        <Backdrop top="#05060b" bottom="#0e1a3a" glow={C.teal} glowY={65} />
        <Stars n={40} />
      </Layer>
      <Layer depth={0.3}>
        <Sunburst cy={760} speed={0.3 + lt * 0.05} opacity={0.12} color={C.teal} />
        <Circuits opacity={0.45} seed="storm" />
        {it === "globe" && (
          <Holo style={{ left: W / 2 - 330, top: 260, width: 660, height: 660 }}>
            <Prop name="globe" t={item.age} x={0} y={0} size={660} />
          </Holo>
        )}
        {it === "moon" && <Prop name="moon" t={item.age} x={1380} y={300} size={460} />}
      </Layer>
      <Layer depth={0.8}>
        {new Array(n).fill(0).map((_, i) => {
          const a = (i / REQUESTS.length) * Math.PI * 2 + lt * (it === "orbit" || it === "moon" ? 0.9 : 0.35);
          const r = 560 + (i % 3) * 60;
          const x = W / 2 + Math.cos(a) * r;
          const y = 690 + Math.sin(a) * 260;
          return <Bubble key={i} x={x} y={y} text={REQUESTS[i]} size={36 + (i % 3) * 6} rot={Math.sin(a) * 10} color={i % 4 === 0 ? "#ffd1ea" : C.cream} />;
        })}
      </Layer>
      <Layer depth={1}>
        <Diva x={W / 2 - 280} y={480} scale={1.65} crop="bust" pose={it === "zoom" ? "think" : "shrug"} face={it === "zoom" ? "shock" : "unamused"} />
        {it === "bells" && (
          <>
            <Pop age={item.age}>
              <Prop name="bells" t={item.age} x={80} y={500} size={420} />
            </Pop>
            <Pop age={item.age - 0.2}>
              <Prop name="bells" t={item.age + 0.3} x={1420} y={500} size={420} />
            </Pop>
          </>
        )}
      </Layer>
    </Camera>
  );
};
