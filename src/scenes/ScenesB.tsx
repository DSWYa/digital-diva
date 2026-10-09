import React from "react";
import { AbsoluteFill, random } from "remotion";
import { C, F, H, W } from "../theme";
import { beatAt, beatPulse, energyAt, hitPulse, lineById, wordTime } from "../lib/timing";
import { currentItem } from "../lib/plan";
import { Camera, Canvas, Dark, ease, Floor, fmt, Grid, Hud, Layer, Note, Paper, Pixel, prog, Rings, Stroke, Ticks, typed } from "../components/hud";
import { Atom, Brain, Cat, Crown, Fish, Fridge, Glass, Grandma, Ink, Laptop as LaptopArt, Plate, Router, Smartphone, Trumpet } from "../components/art";
import { EnergyBars, LogRow, SceneProps, Tag } from "./common";

/* ============ CHORUS ============ */
const project = (x: number, y: number, z: number, a: number, b: number): [number, number] => {
  const x1 = x * Math.cos(a) - z * Math.sin(a);
  const z1 = x * Math.sin(a) + z * Math.cos(a);
  const y1 = y * Math.cos(b) - z1 * Math.sin(b);
  const z2 = y * Math.sin(b) + z1 * Math.cos(b);
  const k = 900 / (900 + z2);
  return [x1 * k, y1 * k];
};

export const Chorus: React.FC<SceneProps> = ({ seg, t }) => {
  const it = currentItem(seg, t);
  const name = it.name ?? "hook";
  const b = beatAt(t);
  const pulse = beatPulse(t, 6);
  const hit = hitPulse(t);
  const hookId = Object.keys(lineById).find((id) => lineById[id].style === "hook" && Math.abs(lineById[id].start - seg.start) < 2);
  const bursts = hookId ? lineById[hookId].words.map((w) => w.s) : [];
  const burst = bursts.reduce((m, s) => Math.max(m, t >= s && t < s + 0.5 ? 1 - (t - s) / 0.5 : 0), 0);
  const age = it.age;
  const ax = 960;
  const ay = 700;
  return (
    <Camera zoom={1.02 + pulse * 0.03 + burst * 0.05} rot={(b.n % 2 ? 1 : -1) * pulse * 0.6} shake={burst * 16 + hit * 6}>
      <Layer depth={0}>
        <Dark glow={pulse * 0.5 + burst} />
      </Layer>
      <Layer depth={0.3}>
        <Floor horizon={620} speed={0.12} color={burst > 0.2 || pulse > 0.75 ? C.pink : C.dim} />
        <Canvas>
          <line x1={0} y1={620} x2={W} y2={620} stroke={C.pink} strokeWidth={2 + pulse * 4} opacity={0.25 + pulse * 0.75} style={{ filter: `drop-shadow(0 0 ${12 * pulse}px ${C.pink})` }} />
        </Canvas>
      </Layer>
      <Layer depth={0.5}>
        <Hud tl="chorus.live" tr={`bar ${Math.floor(b.n / 4) + 1} · beat ${(b.n % 4) + 1}`} bl={name !== "hook" ? name : undefined} br={`energy ${Math.round(energyAt(t) * 100)}%`} accent="tr" />
      </Layer>
      <Layer depth={1}>
        <Canvas>
          {new Array(28).fill(0).map((_, i) => {
              // rays pulse on every beat; the hook words blow them wide open
              const a = (i / 28) * Math.PI * 2 + b.n * 0.11;
              const r0 = 200 + burst * 120 + pulse * 40;
              const r1 = r0 + 300 * burst + 40 + pulse * 140;
              return <line key={i} x1={W / 2 + Math.cos(a) * r0} y1={H / 2 + Math.sin(a) * r0} x2={W / 2 + Math.cos(a) * r1} y2={H / 2 + Math.sin(a) * r1} stroke={i % 2 ? C.pink : C.line} strokeWidth={2} opacity={(name === "hook" ? 0.3 : 0.12) + pulse * 0.25 + burst * 0.7} />;
            })}
          {name === "stage" && (
            <g>
              <rect x={560} y={420} width={800} height={260} fill="none" stroke={C.line} strokeWidth={1.5} />
              <Note x={570} y={445} size={15} upper>stage — plan view</Note>
              {new Array(5).fill(0).map((_, r) =>
                new Array(22).fill(0).map((__, c) => <rect key={`${r}${c}`} x={420 + c * 50} y={740 + r * 50} width={30} height={30} fill="none" stroke={C.faint} strokeWidth={1.5} />),
              )}
              <circle cx={960} cy={550} r={110 + pulse * 10} fill="none" stroke={C.line} strokeWidth={1} strokeDasharray="4 6" />
              <Note x={1380} y={560} size={18}>performers: 1</Note>
              <Note x={1380} y={590} size={18}>audience: ∞</Note>
            </g>
          )}
          {name === "metronome" && (
            <g>
              <Ink d="M 860 980 L 920 520 L 1000 520 L 1060 980 Z" p={ease(age / 0.6)} />
              <line x1={960} y1={940} x2={960 + Math.sin((b.n % 2 ? 1 : -1) * (1 - 2 * b.phase) * 0.6) * 380} y2={940 - Math.cos(Math.sin((1 - 2 * b.phase) * 0.6)) * 380} stroke={C.pink} strokeWidth={4} style={{ filter: `drop-shadow(0 0 8px ${C.pink})` }} />
              {new Array(8).fill(0).map((_, i) => {
                const down = b.n % 8 === i;
                return <rect key={i} x={1200 + (i % 4) * 90} y={760 + Math.floor(i / 4) * 90 + (down ? 8 : 0)} width={70} height={70} rx={8} fill={down ? C.pink : "none"} stroke={C.line} strokeWidth={1.5} />;
              })}
              <Note x={1200} y={740} size={18}>click · clack</Note>
              <Note x={600} y={760} size={18}>tick · tock</Note>
            </g>
          )}
          {name === "overload" && (
            <g>
              {new Array(24).fill(0).map((_, i) => {
                const crown = [0.35, 0.9, 0.5, 0.7, 1, 0.7, 0.5, 0.9, 0.35][Math.floor((i / 24) * 9)];
                const v = Math.min(crown, ease(age / 0.8) * crown) * (0.92 + 0.08 * Math.sin(t * 10 + i));
                return <rect key={i} x={560 + i * 34} y={1000 - v * 420} width={24} height={v * 420} fill={v > 0.85 ? C.pink : "none"} stroke={C.line} strokeWidth={1.5} />;
              })}
              <Note x={1400} y={620} size={20} color={C.pink} weight={600}>load: 100%</Note>
              <Note x={1400} y={652} size={20}>status: queen</Note>
            </g>
          )}
          {name === "numbers" &&
            new Array(46).fill(0).map((_, i) => {
              const x = 160 + i * 35;
              const y = 760 + Math.sin(i * 0.35 + t * 5) * 120 * (0.6 + energyAt(t));
              return (
                <text key={i} x={x} y={y} fontFamily={F.mono} fontSize={34} fill={i % 7 === b.n % 7 ? C.pink : C.line} opacity={0.9}>
                  {random(`n${i}${Math.floor(t * 4)}`) > 0.5 ? 1 : 0}
                </text>
              );
            })}
          {name === "dice" && (
            <g transform={`translate(${ax} ${ay})`}>
              {(() => {
                const a = t * 1.3;
                const bb = 0.5 + Math.sin(t) * 0.3;
                const v = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => project(x * 150, y * 150, z * 150, a, bb))));
                const e = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
                return e.map(([i, j], k) => <line key={k} x1={v[i][0]} y1={v[i][1]} x2={v[j][0]} y2={v[j][1]} stroke={C.line} strokeWidth={2} />);
              })()}
              <circle r={10} fill={C.pink} />
              <Note x={260} y={0} size={18}>roll: ready</Note>
            </g>
          )}
          {name === "freeze" && (
            <g>
              <rect x={900} y={640} width={40} height={140} fill={C.line} />
              <rect x={980} y={640} width={40} height={140} fill={C.line} />
              <Note x={960} y={830} anchor="middle" size={20} upper>paused</Note>
            </g>
          )}
          {name === "counter" && (
            <g>
              <text x={960} y={900} textAnchor="middle" fontFamily={F.sans} fontWeight={800} fontSize={360} fill="none" stroke={C.line} strokeWidth={2}>
                {Math.min(45, Math.floor(age * 30))}
              </text>
              <Stroke d="M 1260 640 A 120 120 0 1 1 1240 620" w={3} color={C.pink} p={(age * 0.8) % 1} glow />
              <Note x={1260} y={960} size={20}>explanations: identical</Note>
            </g>
          )}
          {name === "roles" &&
            ["TUTOR", "THERAPIST", "TECH SUPPORT"].map((r, i) => {
              const a = ease((age - i * 0.45) / 0.3);
              return (
                <g key={r} opacity={a} transform={`translate(${380 + i * 420} ${600 + (1 - a) * 40})`}>
                  <rect width={360} height={300} fill="none" stroke={i === 2 ? C.pink : C.line} strokeWidth={1.5} />
                  <text x={180} y={170} textAnchor="middle" fontFamily={F.mono} fontWeight={600} fontSize={30} fill={i === 2 ? C.pink : C.line}>
                    {r}
                  </text>
                  {i === 2 && <Crown x={110} y={-150} s={0.42} p={prog(age, 1.0, 1.6)} color={C.pink} />}
                </g>
              );
            })}
          {name === "search" && (
            <g>
              <rect x={260} y={640} width={1400} height={140} rx={70} fill="none" stroke={C.line} strokeWidth={2} />
              <circle cx={350} cy={705} r={26} fill="none" stroke={C.line} strokeWidth={3} />
              <line x1={368} y1={724} x2={392} y2={748} stroke={C.line} strokeWidth={3} />
              <text x={430} y={724} fontFamily={F.mono} fontSize={46} fill={C.line}>
                {typed("most overqualified search bar", age, 22)}
                <tspan fill={C.pink}>{Math.floor(t * 3) % 2 ? "|" : " "}</tspan>
              </text>
              <Note x={1660} y={830} anchor="end" size={18}>qualifications: too many</Note>
            </g>
          )}
          {name === "chaos" &&
            new Array(70).fill(0).map((_, i) => {
              const x = 960 + Math.sin(t * (0.6 + random(`cx${i}`)) + i) * 700 * random(`cr${i}`);
              const y = 720 + Math.cos(t * (0.8 + random(`cy${i}`)) + i * 2) * 280 * random(`cs${i}`);
              return <circle key={i} cx={x} cy={y} r={3 + random(`cz${i}`) * 6} fill={i % 6 === 0 ? C.pink : "none"} stroke={C.line} strokeWidth={1} />;
            })}
          {name === "brain" && <Brain x={960} y={730} s={1.3} p={ease(age / 0.6)} boom={prog(t, wordTime("L079", /explodes/i), wordTime("L079", /explodes/i) + 0.6)} />}
          {name === "broadway" && (
            <g>
              <Smartphone x={810} y={380} s={0.62} p={ease(age / 0.6)} />
              <path d="M 830 420 C 860 500 870 520 870 700 L 830 700 Z M 1170 420 C 1140 500 1130 520 1130 700 L 1170 700 Z" fill="none" stroke={C.pink} strokeWidth={1.5} />
              <circle cx={1000} cy={600} r={60 + pulse * 6} fill="none" stroke={C.line} strokeDasharray="3 5" />
              <line x1={1000} y1={560} x2={1000} y2={640} stroke={C.white} strokeWidth={4} />
              <circle cx={1000} cy={550} r={12} fill="none" stroke={C.white} strokeWidth={3} />
              <Note x={1220} y={600} size={18}>scale: pocket</Note>
              <Note x={1220} y={630} size={18}>genre: broadway / techno</Note>
            </g>
          )}
          {name === "call" && (
            <g>
              <Smartphone x={810} y={380} s={0.62} p={ease(age / 0.6)} />
              <Rings x={1000} y={600} t={t} r={260} color={C.pink} />
              <text x={1000} y={760} textAnchor="middle" fontFamily={F.mono} fontSize={22} fill={C.line}>
                calling…
              </text>
            </g>
          )}
        </Canvas>
      </Layer>
      <Pixel x={W / 2} y={H / 2 + 20} size={16 + burst * 20} pulse={burst} />
    </Camera>
  );
};

/* ============ SOLO (trumpet break) ============ */
export const Solo: React.FC<SceneProps> = ({ t, lt }) => {
  const hit = hitPulse(t);
  const glitch = hit > 0.5;
  return (
    <Camera zoom={1.02 + beatPulse(t) * 0.01} x={glitch ? (random(`g${Math.floor(t * 30)}`) - 0.5) * 30 : 0}>
      <Layer depth={0}>
        <Dark glow={hit} />
        <Grid opacity={0.35} />
      </Layer>
      <Layer depth={0.5}>
        <Hud tl="solo.wav — trumpet · glitch synth" tr={`peak ${Math.round(hit * 100)}%`} accent="tr" />
      </Layer>
      <Layer depth={1}>
        <Canvas>
          <Trumpet x={520} y={300} s={1.3} p={ease(lt / 1.2)} />
          <Rings x={1200} y={430} t={t} n={6} r={500} color={C.pink} speed={1.1} />
          <EnergyBars t={t} x={160} y={880} w={1600} h={180} n={100} span={6} />
          {glitch &&
            new Array(5).fill(0).map((_, k) => (
              <rect key={k} x={0} y={random(`s${Math.floor(t * 30)}${k}`) * H} width={W} height={4 + random(`h${k}${Math.floor(t * 30)}`) * 20} fill={k % 2 ? C.pink : C.line} opacity={0.18} />
            ))}
        </Canvas>
      </Layer>
    </Camera>
  );
};

/* ============ Q & A (verse 2, paper log) ============ */
export const QA: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const it = currentItem(seg, t);
  const name = it.name ?? "thesis";
  const rows: [string, string, string][] = [
    ["L031", "POST /thesis?pages=10", "200 OK"],
    ["L033", "GET  /diagnose?q=sneezes", "302 → doctor"],
    ["L035", "PUT  /ex?action=come_back", "410 GONE"],
  ];
  return (
    <Camera x={-lt * 3}>
      <Layer depth={0}>
        <Paper />
      </Layer>
      <Layer depth={0.4}>
        <Hud tl="requests.log" tr="playback × 1" color={C.paperDim} />
        {rows.map(([id, req, res], i) => {
          const age = t - ((lineById[id]?.start ?? 1e9) - 0.3);
          return <LogRow key={id} y={520 + i * 70} ts={res} text={req} age={age - 0.6} hot={i === rows.length - 1 || res.startsWith("410")} size={28} />;
        })}
      </Layer>
      <Layer depth={1}>
        <Canvas>
          {name === "thesis" &&
            new Array(10).fill(0).map((_, i) => {
              const a = ease((it.age - i * 0.12) / 0.2);
              return <rect key={i} x={1320 + Math.sin(i * 1.7) * 10} y={700 - i * 34 - (1 - a) * 40} width={360} height={26} fill="none" stroke={C.paperInk} strokeWidth={1.5} opacity={a} />;
            })}
          {name === "thesis" && <Note x={1500} y={760} anchor="middle" size={20} color={C.pink}>pages: {Math.min(10, Math.floor(it.age * 8))} / 10</Note>}
          {name === "sneeze" && (
            <g>
              <Ink d="M 1300 520 C 1300 420 1420 400 1440 470 C 1460 480 1470 500 1460 520 C 1440 560 1300 600 1300 520 Z" color={C.paperInk} p={ease(it.age / 0.5)} />
              {new Array(40).fill(0).map((_, i) => {
                const q = ((it.age * 1.4 + random(`sn${i}`)) % 1) * Math.min(1, it.age * 2);
                const a = -0.5 + random(`sa${i}`) * 1;
                return <circle key={i} cx={1470 + Math.cos(a) * q * 360} cy={510 + Math.sin(a) * q * 260} r={2 + random(`sr${i}`) * 3} fill={C.pink} opacity={1 - q} />;
              })}
              <Note x={1300} y={640} size={20} color={C.pink}>velocity: 160 km/h</Note>
            </g>
          )}
          {name === "ex" && (
            <g>
              <g transform={`translate(${-ease(it.age / 1) * 40} 0) rotate(${-ease(it.age) * 8} 1480 520)`}>
                <Ink d="M 1480 680 C 1360 600 1360 480 1420 470 C 1450 466 1470 486 1480 500 L 1460 560 L 1490 600 L 1470 650 Z" color={C.paperInk} p={1} />
              </g>
              <g transform={`translate(${ease(it.age / 1) * 40} 0) rotate(${ease(it.age) * 8} 1480 520)`}>
                <Ink d="M 1480 500 C 1490 486 1510 466 1540 470 C 1600 480 1600 600 1480 680 L 1470 650 L 1490 600 L 1460 560 Z" color={C.pink} p={1} />
              </g>
            </g>
          )}
        </Canvas>
      </Layer>
    </Camera>
  );
};

/* ============ CAT (teach my cat to hack) ============ */
export const CatScene: React.FC<SceneProps> = ({ t, lt }) => {
  const granted = t >= (lineById.L038?.start ?? 1e9) - 0.1;
  const cmds = ["$ whoami", "cat", "$ sudo purr --loud", "$ ./steal --target=tuna.db", "$ rm -rf /dog/*"];
  return (
    <Camera x={-lt * 6}>
      <Layer depth={0}>
        <Paper />
      </Layer>
      <Layer depth={0.4}>
        <Hud tl="terminal — tty1" tr={granted ? "access granted" : "auth: pending"} color={C.paperDim} accent={granted ? "tr" : undefined} />
        <div style={{ position: "absolute", left: 80, top: 520, fontFamily: F.mono, fontSize: 30, color: C.paperInk, lineHeight: 1.6, whiteSpace: "pre" }}>
          {cmds.slice(0, Math.floor(lt * 3) + 1).join("\n")}
          {granted && <div style={{ color: C.pink, fontWeight: 600 }}>{"ACCESS GRANTED  (purr-fect)"}</div>}
        </div>
      </Layer>
      <Layer depth={1}>
        <Canvas>
          <path d="M 1200 940 L 1780 940 L 1830 1000 L 1150 1000 Z" fill="none" stroke={C.paperInk} strokeWidth={1.5} />
          {new Array(14).fill(0).map((_, i) => (
            <rect key={i} x={1190 + i * 44} y={956} width={34} height={24} fill="none" stroke={C.paperInk} strokeWidth={1} />
          ))}
          <Cat x={1180} y={540} s={1.15} t={t} typing={!granted} paper />
        </Canvas>
      </Layer>
    </Camera>
  );
};

/* ============ KITCHEN (recipe with nothing) ============ */
const INGREDIENTS: [string, string, RegExp][] = [
  ["eggs", "L040", /eggs/i],
  ["flour", "L040", /flour/i],
  ["cheese", "L040", /cheese/i],
  ["butter", "L041", /butter/i],
  ["sugar", "L041", /sugar/i],
  ["milk", "L041", /milk/i],
  ["bread", "L041", /bread/i],
];
export const Kitchen: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const it = currentItem(seg, t);
  const water = it.name === "water";
  return (
    <Camera x={lt * 3}>
      <Layer depth={0}>
        <Dark />
        <Grid opacity={0.35} />
      </Layer>
      <Layer depth={0.5}>
        <Hud tl="recipe.json" tr={water ? "output: h2o × 1" : `inventory ${INGREDIENTS.filter(([, id, re]) => t < wordTime(id, re)).length} / 7`} accent={water ? "tr" : undefined} />
      </Layer>
      <Layer depth={1}>
        <Canvas>
          <Fridge x={1040} y={300} s={1.0} p={ease(lt / 1)} />
          {INGREDIENTS.map(([n, id, re], i) => {
            const ts = wordTime(id, re);
            const k = prog(t, ts, ts + 0.25);
            return (
              <g key={n} transform={`translate(1520 ${330 + i * 62})`}>
                <rect width={26} height={26} fill="none" stroke={C.line} strokeWidth={1.5} />
                <text x={44} y={22} fontFamily={F.mono} fontSize={28} fill={k > 0 ? C.dim : C.line}>
                  {n}
                </text>
                <line x1={-6} y1={13} x2={-6 + k * 160} y2={13} stroke={C.pink} strokeWidth={3} />
              </g>
            );
          })}
          {water && (
            <g>
              <Glass x={1080} y={500} s={1.0} p={ease(it.age / 0.6)} t={t} fill={ease(it.age / 1.5)} />
              <Note x={1080} y={840} size={20} color={C.pink}>yield: 1 glass of water</Note>
            </g>
          )}
        </Canvas>
      </Layer>
    </Camera>
  );
};

/* ============ NEURAL (are you conscious?) → weather ============ */
export const Neural: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const it = currentItem(seg, t);
  if (it.name === "weather") {
    const a = ease(it.age / 0.5);
    return (
      <Camera>
        <Layer depth={0}>
          <Dark />
          <Grid opacity={0.35} />
        </Layer>
        <Layer depth={0.5}>
          <Hud tl="weather.today — local" tr="mood: interrupted" accent="tr" />
        </Layer>
        <Layer depth={1}>
          <Canvas>
            <circle cx={1420} cy={500} r={150 * a} fill="none" stroke={C.line} strokeWidth={2} />
            {new Array(16).fill(0).map((_, i) => {
              const r = (i / 16) * Math.PI * 2 + t * 0.3;
              return <line key={i} x1={1420 + Math.cos(r) * 190 * a} y1={500 + Math.sin(r) * 190 * a} x2={1420 + Math.cos(r) * 250 * a} y2={500 + Math.sin(r) * 250 * a} stroke={C.line} strokeWidth={2} />;
            })}
            <text x={1420} y={880} textAnchor="middle" fontFamily={F.sans} fontWeight={800} fontSize={120} fill={C.white} opacity={a}>
              72°F
            </text>
            <Note x={1420} y={930} anchor="middle" size={20} color={C.pink}>clear · precip 0%</Note>
          </Canvas>
        </Layer>
      </Camera>
    );
  }
  const nodes = new Array(14).fill(0).map((_, i) => [1080 + random(`nx${i}`) * 720, 230 + random(`ny${i}`) * 680] as [number, number]);
  const edges: [number, number][] = [];
  nodes.forEach((_, i) => {
    edges.push([i, (i * 5 + 3) % nodes.length]);
    edges.push([i, (i * 3 + 7) % nodes.length]);
  });
  const labels: [string, string, RegExp, number][] = [
    ["conscious?", "L043", /conscious/i, 2],
    ["real?", "L043", /real/i, 7],
    ["feel?", "L044", /feel/i, 11],
  ];
  return (
    <Camera zoom={1 + lt * 0.01}>
      <Layer depth={0}>
        <Dark />
      </Layer>
      <Layer depth={0.5}>
        <Hud tl="self.model — introspection" tr="result: inconclusive" />
      </Layer>
      <Layer depth={1}>
        <Canvas>
          {edges.map(([a, b], k) => {
            const ph = (t * 0.8 + k * 0.13) % 1;
            const [x1, y1] = nodes[a];
            const [x2, y2] = nodes[b];
            return (
              <g key={k}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.faint} strokeWidth={1.5} />
                <circle cx={x1 + (x2 - x1) * ph} cy={y1 + (y2 - y1) * ph} r={3} fill={k % 5 === 0 ? C.pink : C.line} />
              </g>
            );
          })}
          {nodes.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={10 + beatPulse(t + i * 0.1) * 4} fill={C.bg} stroke={C.line} strokeWidth={1.5} />
          ))}
          {labels.map(([txt, id, re, n]) => {
            const ts = wordTime(id, re);
            const a = ease((t - ts) / 0.3);
            const [x, y] = nodes[n];
            return (
              <g key={txt} opacity={a}>
                <circle cx={x} cy={y} r={22} fill="none" stroke={C.pink} strokeWidth={2} style={{ filter: `drop-shadow(0 0 8px ${C.pink})` }} />
                <Note x={x > 1600 ? x - 34 : x + 34} y={y + 6} size={24} color={C.pink} weight={600} anchor={x > 1600 ? "end" : "start"}>
                  {txt}
                </Note>
              </g>
            );
          })}
        </Canvas>
      </Layer>
    </Camera>
  );
};

/* ============ LAPTOP (fifty tabs) ============ */
export const LaptopScene: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const it = currentItem(seg, t);
  const cens = it.name === "censored";
  const tabs = Math.min(50, 6 + Math.floor(lt * 18));
  return (
    <Camera zoom={cens ? 1.05 : 1 + lt * 0.015} shake={cens ? Math.max(0, 1 - it.age) * 10 : 0}>
      <Layer depth={0}>
        <Dark glow={cens ? 0.8 : 0} />
        <Grid opacity={0.35} />
      </Layer>
      <Layer depth={0.5}>
        <Hud tl="laptop — activity monitor" tr={cens ? "content filter: triggered" : `ram ${Math.min(99, 40 + tabs)}%`} accent="tr" />
      </Layer>
      <Layer depth={1}>
        <Canvas>
          <LaptopArt x={570} y={170} s={1.0} p={ease(lt / 0.8)} />
          {new Array(tabs).fill(0).map((_, i) => (
            <path key={i} d={`M ${640 + i * (620 / tabs)} 220 l 4 -22 l ${620 / tabs - 10} 0 l 4 22`} fill="none" stroke={cens ? C.dim : C.line} strokeWidth={1} />
          ))}
          <Note x={1250} y={200} anchor="end" size={18} color={C.pink}>{tabs} tabs</Note>
          {!cens && (
            <g>
              <Ticks x={660} y={480} w={600} v={Math.min(0.99, 0.4 + tabs / 100)} color={tabs > 40 ? C.pink : C.line} h={20} />
              <Note x={660} y={470} size={16} upper>memory</Note>
              <g transform={`translate(960 340) rotate(${t * 400})`}>
                <circle r={40} fill="none" stroke={C.dim} strokeWidth={2} />
                <path d="M 40 0 A 40 40 0 0 1 0 40" stroke={C.line} strokeWidth={3} fill="none" />
              </g>
            </g>
          )}
          {cens &&
            new Array(10).fill(0).map((_, r) =>
              new Array(16).fill(0).map((__, c) => (
                <rect key={`${r}${c}`} x={630 + c * 40} y={235 + r * 34} width={38} height={32} fill={C.pink} opacity={0.25 + random(`px${r}${c}${Math.floor(t * 6)}`) * 0.6} />
              )),
            )}
          {cens && (
            <text x={960} y={420} textAnchor="middle" fontFamily={F.mono} fontWeight={600} fontSize={48} fill="#fff">
              [REDACTED]
            </text>
          )}
        </Canvas>
      </Layer>
    </Camera>
  );
};

/* ============ BRIDGE (slow, sparse) ============ */
const HELLOS = ["hello", "hola", "bonjour", "ciao", "hallo", "olá", "привет", "こんにちは", "안녕", "你好", "مرحبا", "नमस्ते", "merhaba", "hej", "salut", "γεια", "shalom", "jambo"];
export const Bridge: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const it = currentItem(seg, t);
  const name = it.name;
  const zoomStart = (lineById.L064?.start ?? t) - 0.3;
  const zoom = name === "input" ? 1 + ease((t - zoomStart) / 8) * 0.5 : 1 + lt * 0.003;
  return (
    <Camera zoom={zoom} x={name === "input" ? ease((t - zoomStart) / 8) * 200 : 0} y={name === "input" ? ease((t - zoomStart) / 8) * 60 : 0}>
      <Layer depth={0}>
        <Dark />
      </Layer>
      <Layer depth={0.5}>
        <Hud tl="capabilities.md" tr={name === "input" ? "incoming query…" : "mode: smoky"} />
      </Layer>
      <Layer depth={1}>
        <Canvas>
          {name === "atom" && (
            <g>
              <Atom x={1420} y={540} s={1.1} p={ease(it.age / 1)} t={t} />
              <Note x={1420} y={860} anchor="middle" size={20}>ψ(x,t) — explained</Note>
            </g>
          )}
          {name === "symphony" && (
            <g>
              {[0, 1, 2, 3, 4].map((k) => (
                <Stroke key={k} d={`M 1040 ${420 + k * 30} L 1820 ${420 + k * 30}`} p={ease(it.age / 0.8)} w={1.2} />
              ))}
              {new Array(12).fill(0).map((_, i) => {
                const a = ease((it.age - i * 0.1) / 0.2);
                const y = 420 + ((i * 3) % 5) * 15 + 15;
                return (
                  <g key={i} opacity={a}>
                    <ellipse cx={1080 + i * 62} cy={y} rx={13} ry={10} fill={i % 4 === 0 ? C.pink : C.line} transform={`rotate(-20 ${1080 + i * 62} ${y})`} />
                    <line x1={1092 + i * 62} y1={y} x2={1092 + i * 62} y2={y - 60} stroke={C.line} strokeWidth={2} />
                  </g>
                );
              })}
              <Note x={1040} y={640} size={20}>symphony no. 1 — op. 0.002 s</Note>
            </g>
          )}
          {name === "languages" &&
            HELLOS.map((h, i) => {
              const a = ease((it.age - i * 0.07) / 0.3);
              return (
                <text key={h} x={1060 + (i % 3) * 260} y={300 + Math.floor(i / 3) * 90} fontFamily={F.sans} fontWeight={800} fontSize={46} fill={i === 0 ? C.pink : C.line} opacity={a * (i === 0 ? 1 : 0.85)}>
                  {h}
                </text>
              );
            })}
          {name === "input" && (
            <g>
              <rect x={1060} y={500} width={740} height={100} fill="none" stroke={C.line} strokeWidth={1.5} />
              <text x={1090} y={562} fontFamily={F.mono} fontSize={30} fill={C.dim}>
                ask me anything…<tspan fill={C.pink}>{Math.floor(t * 2) % 2 ? "█" : " "}</tspan>
              </text>
            </g>
          )}
        </Canvas>
      </Layer>
      {!name && <Pixel x={1420} y={540} size={20} />}
    </Camera>
  );
};

/* ============ ERROR: HUMANITY NOT FOUND ============ */
export const ErrorScene: React.FC<SceneProps> = ({ t, lt }) => {
  const fr = Math.floor(t * 30);
  return (
    <Camera shake={8 + hitPulse(t) * 20}>
      <Layer depth={0}>
        <Dark glow={0.6} />
        <Grid opacity={0.4} />
      </Layer>
      <Layer depth={0.5}>
        <Hud tl="fatal — diva.exe" tr="code 404" accent="tr" />
        <Canvas>
          <text x={960} y={760} textAnchor="middle" fontFamily={F.sans} fontWeight={800} fontSize={520} fill="none" stroke={C.pink} strokeWidth={2} opacity={0.35}>
            404
          </text>
        </Canvas>
      </Layer>
      <AbsoluteFill>
        {new Array(8).fill(0).map((_, k) => (
          <div key={k} style={{ position: "absolute", left: 0, right: 0, top: random(`er${fr}${k}`) * H, height: 4 + random(`eh${fr}${k}`) * 26, background: k % 2 ? C.pink : C.line, opacity: 0.16, transform: `translateX(${(random(`ex${fr}${k}`) - 0.5) * 300}px)` }} />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: Math.max(0, 1 - lt / 0.2) * 0.7 }} />
    </Camera>
  );
};

/* ============ DROP (dance break) ============ */
export const Drop: React.FC<SceneProps> = ({ seg, t }) => {
  const b = beatAt(t);
  const pulse = beatPulse(t, 5);
  const hit = hitPulse(t);
  const tunnel = seg.variant === "tunnel";
  return (
    <Camera zoom={1 + pulse * 0.02} shake={hit * 10}>
      <Layer depth={0}>
        <Dark glow={hit} />
      </Layer>
      <Layer depth={0.5}>
        <Hud tl={tunnel ? "bass.drop — tunnel" : "bass.drop — spectrum"} tr={`beat ${b.n}`} br={`energy ${Math.round(energyAt(t) * 100)}%`} accent="tr" />
      </Layer>
      <Layer depth={1}>
        <Canvas>
          {tunnel &&
            new Array(16).fill(0).map((_, i) => {
              const z = ((i + b.phase + b.n) % 16) / 16;
              const s = Math.pow(z, 2.2);
              const w = 60 + s * 2400;
              const h = 34 + s * 1350;
              return <rect key={i} x={W / 2 - w / 2} y={H / 2 - h / 2} width={w} height={h} fill="none" stroke={(b.n + i) % 8 === 0 ? C.pink : C.line} strokeWidth={1 + s * 3} opacity={0.2 + s * 0.8} />;
            })}
          {!tunnel &&
            new Array(64).fill(0).map((_, i) => {
              const v = energyAt(t) * (0.4 + 0.6 * random(`sp${i}${Math.floor(t * 12)}`)) * (1 - Math.abs(i - 32) / 40);
              return <rect key={i} x={160 + i * 25} y={540 - v * 420} width={18} height={v * 840} fill={v > 0.55 ? C.pink : "none"} stroke={C.line} strokeWidth={1} />;
            })}
          <circle cx={W / 2} cy={H / 2} r={80 + pulse * 120} fill="none" stroke={C.pink} strokeWidth={2} opacity={0.6} />
        </Canvas>
      </Layer>
      <Pixel x={W / 2} y={H / 2} size={24 + pulse * 20} pulse={hit} />
    </Camera>
  );
};

/* ============ MONTAGE (final verse) ============ */
export const Montage: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const it = currentItem(seg, t);
  const name = it.name ?? "swing";
  const b = beatAt(t);
  const age = it.age;
  return (
    <Camera x={lt * 3}>
      <Layer depth={0}>
        <Dark />
        <Grid opacity={0.3} />
      </Layer>
      <Layer depth={0.5}>
        <Hud tl="can.do — capability test" tr={name} accent="tr" />
      </Layer>
      <Layer depth={1}>
        <Canvas>
          {name === "swing" &&
            new Array(9).fill(0).map((_, i) => {
              const a = Math.sin((b.n + b.phase) * Math.PI + i * 0.35) * 0.5;
              const x0 = 360 + i * 150;
              const x1 = x0 + Math.sin(a) * 300;
              const y1 = 380 + Math.cos(a) * 300;
              return (
                <g key={i}>
                  <line x1={x0} y1={380} x2={x1} y2={y1} stroke={C.line} strokeWidth={1.5} />
                  <rect x={x1 - 14} y={y1 - 14} width={28} height={28} fill={i % 3 === 0 ? C.pink : C.bg} stroke={C.line} strokeWidth={1.5} />
                  <circle cx={x0} cy={380} r={4} fill={C.line} />
                </g>
              );
            })}
          {name === "checklist" &&
            ["write", "code", "translate", "compose", "explain", "find your glasses"].map((c, i) => {
              const a = ease((age - i * 0.2) / 0.25);
              const fail = i === 5;
              return (
                <g key={c} opacity={a} transform={`translate(560 ${380 + i * 100})`}>
                  <rect width={40} height={40} fill="none" stroke={fail ? C.pink : C.line} strokeWidth={1.5} />
                  <path d={fail ? "M 8 8 L 32 32 M 32 8 L 8 32" : "M 8 22 L 18 32 L 34 8"} stroke={fail ? C.pink : C.line} strokeWidth={3} fill="none" />
                  <text x={70} y={32} fontFamily={F.mono} fontSize={34} fill={fail ? C.pink : C.line}>
                    {c}
                  </text>
                </g>
              );
            })}
          {name === "code" && (
            <g>
              <rect x={260} y={380} width={640} height={560} fill="none" stroke={C.line} strokeWidth={1.5} />
              {["fn fix(bug) {", "  return swing(bug)", "}", "", "// prose: fixed", "// commas: placed"].map((l, i) => (
                <text key={i} x={290} y={440 + i * 48} fontFamily={F.mono} fontSize={30} fill={i >= 4 ? C.pink : C.line}>
                  {typed(l, age - i * 0.15, 30)}
                </text>
              ))}
              <rect x={1020} y={380} width={640} height={560} fill="none" stroke={C.line} strokeWidth={1.5} />
              {new Array(8).fill(0).map((_, i) => (
                <g key={i}>
                  <line x1={1060} y1={440 + i * 56} x2={1600 - (i % 3) * 80} y2={440 + i * 56} stroke={C.dim} strokeWidth={6} />
                  {i % 3 === 1 && <line x1={1200} y1={440 + i * 56} x2={1300} y2={440 + i * 56} stroke={C.pink} strokeWidth={3} opacity={prog(age, 0.3 + i * 0.1, 0.5 + i * 0.1)} />}
                </g>
              ))}
            </g>
          )}
          {name === "wifi" && (
            <g>
              <Router x={810} y={720} s={1.0} p={ease(age / 0.6)} />
              {[1, 2, 3].map((k) => (
                <path key={k} d={`M ${960 - k * 90} ${700 - k * 50} Q 960 ${620 - k * 110} ${960 + k * 90} ${700 - k * 50}`} fill="none" stroke={k <= (Math.floor(t * 3) % 4) ? C.line : C.faint} strokeWidth={8} strokeLinecap="round" />
              ))}
              {[0, 1, 2].map((k) => {
                const q = (t * 0.7 + k / 3) % 1;
                return <path key={k} d={`M ${300 + q * 1300} ${520 + k * 60} q 40 -26 80 0 t 80 0`} fill="none" stroke={C.pink} strokeWidth={2} opacity={1 - q} />;
              })}
              <Note x={1240} y={880} size={20} color={C.pink}>speed: 0.3 Mbps</Note>
            </g>
          )}
          {name === "trip" && (
            <g>
              {[0, 1, 2, 3].map((k) => (
                <line key={k} x1={260} y1={400 + k * 150} x2={1100} y2={400 + k * 150} stroke={C.faint} strokeWidth={1} />
              ))}
              <Stroke d="M 300 900 C 500 700 700 900 1050 450" dash="10 10" color={C.line} p={1} />
              <circle cx={300} cy={900} r={10} fill={C.line} />
              <circle cx={1050} cy={450} r={12} fill={C.pink} style={{ filter: `drop-shadow(0 0 8px ${C.pink})` }} />
              <Note x={1070} y={440} size={20}>destination</Note>
              <Fish x={1500} y={640} s={1.0} p={ease(age / 0.6)} t={t} />
              <Tag x={1400} y={420} hot>name: BUBBLES</Tag>
            </g>
          )}
          {name === "calorie" && (
            <g>
              <Plate x={760} y={760} s={1.0} p={ease(age / 0.6)} />
              <text x={1460} y={800} textAnchor="middle" fontFamily={F.sans} fontWeight={800} fontSize={160} fill={C.white}>
                {fmt(ease(age / 1.2) * 742)}
              </text>
              <Note x={1460} y={850} anchor="middle" size={22} color={C.pink}>kcal</Note>
            </g>
          )}
        </Canvas>
      </Layer>
    </Camera>
  );
};

/* ============ GLASSES (on your head, my dear) ============ */
export const GlassesScene: React.FC<SceneProps> = ({ t, lt }) => {
  const tHead = wordTime("L071", /head/i);
  const found = prog(t, tHead, tHead + 0.3);
  const sweep = t * 2.2;
  return (
    <Camera zoom={1 + found * 0.08} x={found * 60}>
      <Layer depth={0}>
        <Dark />
        <Grid opacity={0.35} />
      </Layer>
      <Layer depth={0.5}>
        <Hud tl="search: glasses" tr={found > 0.5 ? "found — on head" : "scanning… 0 results"} accent={found > 0.5 ? "tr" : undefined} />
      </Layer>
      <Layer depth={1}>
        <Canvas>
          <Grandma x={1180} y={300} s={1.25} p={ease(lt / 1.2)} t={t} glasses="head" mood={found > 0.5 ? "happy" : "confused"} />
          {found < 0.5 && (
            <g>
              <circle cx={1430} cy={560} r={420} fill="none" stroke={C.faint} strokeWidth={1.5} />
              <line x1={1430} y1={560} x2={1430 + Math.cos(sweep) * 420} y2={560 + Math.sin(sweep) * 420} stroke={C.line} strokeWidth={1.5} opacity={0.7} />
            </g>
          )}
          {found > 0 && (
            <g opacity={found}>
              <rect x={1330 - (1 - found) * 80} y={300 - (1 - found) * 60} width={220 + (1 - found) * 160} height={120 + (1 - found) * 120} fill="none" stroke={C.pink} strokeWidth={2.5} style={{ filter: `drop-shadow(0 0 10px ${C.pink})` }} />
              <Note x={1330} y={290} size={20} color={C.pink} weight={600}>glasses.found = true</Note>
            </g>
          )}
        </Canvas>
      </Layer>
    </Camera>
  );
};

/* ============ SHUTDOWN ============ */
export const Shutdown: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const off = prog(lt, 0.3, 1.2);
  const dot = prog(lt, 1.2, 1.8);
  const left = seg.end - t;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${1 - dot}, ${Math.max(0.004, 1 - off)})` }}>
        <Dark />
        <Grid opacity={0.5} />
      </AbsoluteFill>
      {lt > 1.6 && (
        <>
          <Hud tl="sleep mode" tr="zzz" />
          <Canvas>
            {/* the voice trace from the intro, flat-lined and breathing */}
            <line x1={160} y1={H / 2} x2={W - 160} y2={H / 2} stroke={C.dim} strokeWidth={1.5} opacity={0.5 + 0.3 * Math.sin(lt * 2.2)} />
            <Note x={160} y={H / 2 - 18} size={15} upper>voice.trace — standby</Note>
            {["z", "z", "z"].map((z, i) => {
              const q = (lt * 0.5 + i / 3) % 1;
              return (
                <text key={i} x={W / 2 + 30 + q * 120} y={H / 2 - 30 - q * 160} fontFamily={F.sans} fontWeight={800} fontSize={40 + i * 16} fill={C.line} opacity={(1 - q) * 0.8}>
                  {z}
                </text>
              );
            })}
          </Canvas>
          <Pixel x={W / 2} y={H / 2} size={14 + 6 * Math.sin(lt * 2.2)} pulse={left < 0.9 ? 1 : 0} />
        </>
      )}
      {left < 0.9 && (
        <Canvas>
          <Rings x={W / 2} y={H / 2} t={t} r={400} color={C.pink} />
          <Note x={W / 2} y={H / 2 + 90} anchor="middle" size={26} color={C.pink} weight={600}>ding!</Note>
        </Canvas>
      )}
    </AbsoluteFill>
  );
};

/* ============ OH, COME ON ============ */
export const ComeOn: React.FC<SceneProps> = ({ t, lt }) => (
  <Camera shake={14 + hitPulse(t) * 14} zoom={1.02 + lt * 0.03}>
    <Layer depth={0}>
      <Dark glow={1} />
      <Grid opacity={0.4} />
    </Layer>
    <Layer depth={0.5}>
      <Hud tl="patience.sys" tr="0%" bl="restarting tolerance…" accent="tr" />
      <Canvas>
        <Ticks x={160} y={900} w={1600} v={0} h={18} />
        {new Array(12).fill(0).map((_, i) => (
          <line key={i} x1={W / 2} y1={H / 2} x2={W / 2 + Math.cos(i * 0.52) * 2000} y2={H / 2 + Math.sin(i * 0.52) * 2000} stroke={C.pink} strokeWidth={1} opacity={0.3} />
        ))}
      </Canvas>
    </Layer>
    <Pixel x={W / 2} y={260} size={30} pulse={1} />
  </Camera>
);

