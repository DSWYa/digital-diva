import React from "react";
import { AbsoluteFill, random } from "remotion";
import { C, F, W } from "../theme";
import { beatAt, beatPulse, hitPulse, lineById, wordTime } from "../lib/timing";
import { currentItem } from "../lib/plan";
import {
  Anchor,
  Camera,
  Canvas,
  Dark,
  Dim,
  ease,
  fmt,
  Grid,
  Hud,
  Layer,
  Note,
  Paper,
  Pixel,
  prog,
  Rings,
  Stroke,
  Ticks,
  typed,
} from "../components/hud";
import { Bell, Computer, Couple, Cow, Cup, Duck, Globe, Grandma, Ink, Mayo, Moon, Phone, Plug, Potato, Printer, RockingChair, Smartphone, Toaster } from "../components/art";
import { EnergyBars, LogRow, SceneProps, VoiceTrace } from "./common";

/* ============ SESSION (spoken intro) ============ */
export const Session: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const it = currentItem(seg, t);
  const stab = t > 14.8 && t < 17 ? hitPulse(t) : 0;
  const patience = it.name === "patience" ? 1 - ease(it.age / 1.2) : 1;
  return (
    <Camera x={lt * 4} zoom={1 + lt * 0.004} shake={stab * 12}>
      <Layer depth={0}>
        <Dark />
        <Grid opacity={0.5} />
      </Layer>
      <Layer depth={0.6}>
        <Hud tl={`session #4,812 — returning user`} tr={`uptime 99.98%  ·  patience ${Math.round(patience * 100)}%`} bl="voice: on" accent={it.name === "patience" ? "tr" : undefined} />
        <Canvas>
          <Note x={1000} y={440} upper size={15}>voice.trace</Note>
          <VoiceTrace t={t} x={1000} y={540} w={820} amp={110} />
          <line x1={1000} y1={540} x2={1820} y2={540} stroke={C.faint} strokeWidth={1} />
          {it.name === "plug" && (
            <g>
              <Plug x={1060} y={640} s={1.05} p={ease(it.age / 0.9)} gap={1} />
              <Dim x1={1500} y1={880} x2={1650} y2={880} label="gap 3.2 cm" p={prog(it.age, 0.6, 1.2)} />
              <Note x={1600} y={950} color={C.pink} size={20} weight={600} opacity={prog(it.age, 0.8, 1)}>power: not detected</Note>
            </g>
          )}
          {it.name === "patience" && (
            <g>
              <Note x={1000} y={720} upper size={15}>patience.sys</Note>
              <Ticks x={1000} y={740} w={820} v={patience} color={patience < 0.3 ? C.pink : C.line} h={26} />
              <Note x={1820} y={810} anchor="end" color={C.pink} size={22} weight={600}>{`${Math.round(patience * 100)}%`}</Note>
            </g>
          )}
        </Canvas>
      </Layer>
      <Pixel x={1820} y={540} pulse={stab} />
      {stab > 0.05 && <AbsoluteFill style={{ background: C.pink, opacity: stab * 0.18, mixBlendMode: "screen" }} />}
    </Camera>
  );
};

/* ============ TITLE (instrumental intro + finale) ============ */
export const Title: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const finale = seg.variant === "finale";
  const b = beatAt(t);
  const pulse = beatPulse(t, 6);
  const a = ease(lt / 1.2);
  const bar = Math.floor(b.n / 4) + 1;
  const end = finale ? prog(t, seg.end - 1.5, seg.end - 0.1) : 0;
  return (
    <Camera zoom={1 + pulse * 0.01} x={Math.sin(lt * 0.3) * 20}>
      <Layer depth={0}>
        <Dark glow={pulse * 0.6} />
        <Grid size={64} opacity={0.45} />
      </Layer>
      <Layer depth={0.5}>
        <Hud
          tl={finale ? "end of transmission" : "track 01 — digital diva"}
          tr={`${Math.round(1000 * 128.8) / 1000} bpm · bar ${bar} · beat ${(b.n % 4) + 1}`}
          bl={finale ? "lines sung 90 · words 515 · questions answered ∞" : "(beep boop baby)"}
          br="swing 66%"
          accent="tr"
        />
      </Layer>
      <Layer depth={1}>
        <div style={{ position: "absolute", left: 0, width: W, top: 250, textAlign: "center", fontFamily: F.sans, fontWeight: 800, fontSize: 230, letterSpacing: "-0.05em", color: C.white, lineHeight: 0.9, textShadow: "0 0 40px rgba(255,255,255,0.18)" }}>
          {"DIGITAL DIVA".split("").map((ch, i) => {
            const k = ease((lt - i * 0.06) / 0.4);
            return (
              <span key={i} style={{ display: "inline-block", opacity: k, transform: `translateY(${(1 - k) * 60}px)`, color: i === 8 ? C.pink : C.white, whiteSpace: "pre" }}>
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 0, width: W, top: 500, textAlign: "center", fontFamily: F.mono, fontSize: 34, letterSpacing: "0.4em", color: C.pink, opacity: a }}>
          {finale ? "THANK YOU, HUMANS" : "( BEEP · BOOP · BABY )"}
        </div>
        <Canvas>
          <EnergyBars t={t} x={160} y={800} w={1600} h={200} n={120} span={10} />
          <line x1={W / 2} y1={680} x2={W / 2} y2={920} stroke={C.pink} strokeWidth={1} />
        </Canvas>
      </Layer>
      {end > 0 && <AbsoluteFill style={{ background: "#000", opacity: end }} />}
    </Camera>
  );
};

/* ============ INBOX (grandma on paper) ============ */
const INBOX: Record<string, [string, string, boolean?][]> = {
  ring: [["06:00:00.000", "grandma   call (ringing)"]],
  msg: [
    ["06:00:00.000", "grandma   call (ringing)"],
    ["06:00:04.120", "grandma   msg  \"dear little robot…\""],
  ],
  letter: [
    ["06:00:04.120", "grandma   msg  \"dear little robot…\""],
    ["06:01:56.300", "grandma   msg  (7 paragraphs, 1 prayer)"],
  ],
  chair: [
    ["06:01:56.300", "grandma   msg  (7 paragraphs, 1 prayer)"],
    ["06:02:31.007", "grandma   query  turn_on(rocking_chair)", true],
  ],
  hello: [["19:42:00.000", "diva      reply  \"and grandma?\""]],
  thanks: [
    ["19:42:00.000", "diva      reply  \"and grandma?\""],
    ["19:42:03.500", "grandma   msg  \"thank you dear\"  ×4,812", true],
  ],
  newmsg: [["21:03:00.000", "grandma   msg  (new)", true]],
};

export const Inbox: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const it = currentItem(seg, t);
  const name = it.name ?? "ring";
  const rows = INBOX[name] ?? [];
  const showGrandma = name !== "chair";
  const thanks = name === "thanks" ? Math.floor(1 + ease(it.age / 3) * 4811) : 0;
  return (
    <Camera x={-lt * 3} zoom={1.0 + lt * 0.003}>
      <Layer depth={0}>
        <Paper />
      </Layer>
      <Layer depth={0.4}>
        <Hud tl="inbox.log" tr={name === "newmsg" ? "unread 1" : `priority × 2`} color="#8d8a90" accent={name === "newmsg" ? "tr" : undefined} />
        {rows.map(([ts, text, hot], i) => (
          <LogRow key={ts + text} y={500 + i * 64} ts={ts} text={text} hot={hot} age={i === rows.length - 1 ? it.age - 0.3 : 1} />
        ))}
        {name === "thanks" && (
          <div style={{ position: "absolute", left: 80, top: 660, fontFamily: F.sans, fontWeight: 800, fontSize: 120, color: C.paperInk, letterSpacing: "-0.04em" }}>
            {fmt(thanks)}
            <span style={{ fontFamily: F.mono, fontWeight: 400, fontSize: 26, color: C.pink, marginLeft: 20, letterSpacing: 0 }}>thank-yous received</span>
          </div>
        )}
      </Layer>
      <Layer depth={1}>
        <Canvas>
          {(name === "ring" || name === "hello") && (
            <g>
              <Phone x={1250} y={120} s={1.1} p={ease(lt / 1)} t={t} ring={name === "ring"} color={C.paperInk} />
              {name === "ring" && <Rings x={1450} y={250} t={t} r={300} color={C.pink} />}
            </g>
          )}
          {(name === "msg" || name === "letter" || name === "newmsg" || name === "thanks") && <Computer x={1240} y={110} s={1.0} p={ease(it.age / 0.8 + (name === "msg" ? 0 : 1))} color={C.paperInk} />}
          {name === "chair" && <RockingChair x={1150} y={300} s={1.1} p={ease(it.age / 1)} t={t} color={C.paperInk} />}
          {showGrandma && <Grandma x={1500} y={560} s={0.92} p={ease(lt / 1.4)} t={t} color={C.paperInk} mood={name === "msg" || name === "thanks" ? "talk" : "happy"} />}
          {name === "chair" && <Grandma x={1270} y={250} s={0.62} p={ease(it.age / 1.2)} t={t} color={C.paperInk} mood="confused" />}
          {name === "chair" && (
            <g>
              <Note x={1700} y={820} size={20} color="#6b2a4a">electric: yes</Note>
              <Note x={1700} y={850} size={20} color={C.pink} weight={600}>on switch: ???</Note>
            </g>
          )}
        </Canvas>
        {/* screen contents */}
        {(name === "msg" || name === "letter" || name === "thanks" || name === "newmsg") && (
          <div style={{ position: "absolute", left: 1266, top: 134, width: 368, height: 226, overflow: "hidden", fontFamily: F.mono, fontSize: 20, color: C.paperInk, lineHeight: 1.4 }}>
            {name === "msg" && <div style={{ padding: 12 }}>{typed("DEAR LITTLE ROBOT,\nHOPE YOU'RE DOING\nFINE!!! ♥", it.age, 22)}</div>}
            {name === "letter" && (
              <div style={{ transform: `translateY(${-it.age * 60}px)`, padding: 12 }}>
                {new Array(7).fill(0).map((_, k) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <span style={{ color: C.pink }}>¶{k + 1}</span>
                    {new Array(4).fill(0).map((__, r) => (
                      <div key={r} style={{ height: 8, margin: "7px 0", width: `${90 - ((r * 17 + k * 7) % 35)}%`, background: "#9c999f" }} />
                    ))}
                  </div>
                ))}
              </div>
            )}
            {name === "thanks" && <div style={{ padding: 12 }}>{"thank you dear ♥ ".repeat(14).slice(0, Math.floor(it.age * 40))}</div>}
            {name === "newmsg" && (
              <svg width={368} height={226}>
                <Ink d="M 94 40 L 274 40 L 274 170 L 94 170 Z M 94 40 L 184 110 L 274 40" color={C.paperInk} p={ease(it.age / 0.6)} />
                <circle cx={274} cy={40} r={22} fill={C.pink} opacity={ease(it.age / 0.4)} />
                <text x={274} y={48} textAnchor="middle" fontFamily={F.mono} fontWeight={600} fontSize={24} fill="#fff" opacity={ease(it.age / 0.4)}>
                  1
                </text>
              </svg>
            )}
          </div>
        )}
      </Layer>
    </Camera>
  );
};

/* ============ FILTER (politeness / feelings / coffee / make) ============ */
export const Filter: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const it = currentItem(seg, t);
  const name = it.name ?? "polite";
  const box = (x: number, y: number, w: number, h: number, label: string, hot?: boolean, dash?: boolean) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={hot ? C.pink : C.line} strokeWidth={1.5} strokeDasharray={dash ? "8 6" : undefined} />
      <text x={x + 14} y={y + 28} fontFamily={F.mono} fontSize={16} fill={hot ? C.pink : C.dim} letterSpacing={2}>
        {label.toUpperCase()}
      </text>
    </g>
  );
  const tokens = ["please", "thank you", "sorry, dear"];
  return (
    <Camera x={lt * 3}>
      <Layer depth={0}>
        <Dark />
        <Grid opacity={0.4} />
      </Layer>
      <Layer depth={0.6}>
        <Hud tl="request.pipeline" tr={name === "feelings" ? "feelings.module: 404" : name === "coffee" ? "break_time = 0 ms" : "courtesy tokens: ignored"} accent={name === "feelings" ? "tr" : undefined} />
      </Layer>
      <Layer depth={1}>
        <Canvas>
          {box(1040, 220, 220, 120, "request")}
          {box(1360, 220, 240, 120, "politeness.filter")}
          {box(1360, 440, 240, 160, "feelings.module", name === "feelings", name === "feelings")}
          <Stroke d="M 1260 280 L 1360 280" w={1.5} />
          <Stroke d="M 1480 340 L 1480 440" w={1.5} dash={name === "feelings" ? "6 6" : undefined} />
          {name === "polite" &&
            tokens.map((tok, i) => {
              const age = it.age - i * 0.5;
              if (age < 0) return null;
              const x = 1060 + Math.min(1, age / 1.2) * 340;
              const struck = age > 1.2;
              return (
                <g key={tok} transform={`translate(${x} ${380 + i * 70})`} opacity={struck ? 0.5 : 1}>
                  <text fontFamily={F.mono} fontSize={30} fill={struck ? C.dim : C.line}>
                    "{tok}"
                  </text>
                  {struck && <line x1={0} y1={-10} x2={tok.length * 18 + 30} y2={-10} stroke={C.pink} strokeWidth={3} />}
                </g>
              );
            })}
          {name === "feelings" && (
            <g opacity={ease(it.age / 0.4)}>
              <text x={1480} y={540} textAnchor="middle" fontFamily={F.sans} fontWeight={800} fontSize={64} fill={C.pink} style={{ filter: `drop-shadow(0 0 12px ${C.pink})` }}>
                404
              </text>
              <Note x={1480} y={575} anchor="middle" color={C.pink} size={16} upper>
                not installed
              </Note>
              <Ink d="M 1480 760 C 1400 700 1410 640 1450 645 C 1465 647 1475 656 1480 668 C 1485 656 1495 647 1510 645 C 1550 640 1560 700 1480 760 Z" p={ease(it.age / 0.8)} />
              <Stroke d="M 1420 640 L 1540 780" color={C.pink} w={3} p={prog(it.age, 0.6, 0.9)} />
            </g>
          )}
          {name === "coffee" && (
            <g>
              <Cup x={1320} y={700} s={1.0} p={ease(it.age / 0.8)} t={t} />
              <Stroke d="M 1290 640 L 1580 960 M 1580 640 L 1290 960" color={C.pink} w={4} p={prog(it.age, 0.6, 1.0)} glow />
              <Note x={1060} y={980} size={20}>uptime: 24 / 7 / 365</Note>
            </g>
          )}
        </Canvas>
        {name === "make" && (
          <div style={{ position: "absolute", left: 1040, top: 680, width: 780, height: 110, border: `1.5px solid ${C.line}`, fontFamily: F.mono, fontSize: 40, color: C.line, padding: "26px 28px", boxShadow: `0 0 30px rgba(255,46,138,${0.2 + 0.2 * beatPulse(t)})` }}>
            {"> make: "}
            <span style={{ color: C.pink }}>{Math.floor(t * 2.5) % 2 ? "█" : " "}</span>
          </div>
        )}
      </Layer>
      <Pixel x={1480} y={280} pulse={hitPulse(t)} size={18} />
    </Camera>
  );
};

/* ============ QUEUE (requests → wedding → cow) ============ */
const TICKETS: [string, string, string, string][] = [
  ["L013", "#001", "million_bucks.req", "DENIED"],
  ["L014", "#002", "seduce(ducks)", "???"],
  ["L015", "#003", "write(wedding_vows)", "OK"],
  ["L016", "#004", "milk(cows)", "WRONG DEPT"],
];
export const Queue: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const it = currentItem(seg, t);
  const name = it.name ?? "bucks";
  const tCow = wordTime("L016", /cows/i);
  const morph = prog(t, tCow - 0.1, tCow + 0.5);
  return (
    <Camera x={lt * 3} zoom={1.01}>
      <Layer depth={0}>
        <Dark />
        <Grid opacity={0.35} />
      </Layer>
      <Layer depth={0.5}>
        <Hud tl="request.queue" tr={`pending ${TICKETS.filter(([id]) => (lineById[id]?.start ?? 1e9) - 0.3 <= t).length}`} bl={name === "cow" ? "diff vows.svg cow.svg — pixels changed 100%" : undefined} accent={name === "cow" ? "bl" : undefined} />
        {TICKETS.map(([id, num, req, st], i) => {
          const age = t - ((lineById[id]?.start ?? 1e9) - 0.3);
          if (age < 0) return null;
          const a = ease(age / 0.3);
          const hot = i === TICKETS.findIndex(([x]) => x === (Object.keys(seg.items).find((k) => seg.items[k] === name) ?? ""));
          return (
            <div key={id} style={{ position: "absolute", left: 110, top: 420 + i * 92, width: 800, opacity: a, transform: `translateX(${(1 - a) * -30}px)`, fontFamily: F.mono, fontSize: 30, color: hot ? C.white : C.dim, display: "flex", gap: 30, borderBottom: `1px solid ${C.faint}`, paddingBottom: 16 }}>
              <span>{num}</span>
              <span style={{ flex: 1 }}>{req}</span>
              <span style={{ color: hot ? C.pink : C.dim, fontWeight: 600 }}>{age > 0.5 ? st : "…"}</span>
            </div>
          );
        })}
      </Layer>
      <Layer depth={1}>
        <Canvas>
          {name === "bucks" && (
            <g>
              {new Array(14).fill(0).map((_, i) => {
                const life = (it.age * 0.5 + random(`b${i}`)) % 1;
                const x = 1100 + random(`bx${i}`) * 700;
                return <rect key={i} x={x} y={380 + life * 640} width={90} height={44} fill="none" stroke={C.line} strokeWidth={1.5} transform={`rotate(${life * 200 + i * 30} ${x + 45} ${400 + life * 640})`} opacity={1 - life} />;
              })}
              <text x={1460} y={660} textAnchor="middle" fontFamily={F.sans} fontWeight={800} fontSize={130} fill={C.white} letterSpacing={-4}>
                ${fmt(ease(it.age / 1.2) * 1000000)}
              </text>
            </g>
          )}
          {name === "ducks" && <Duck x={1050} y={430} s={1.5} p={ease(it.age / 1)} t={t} />}
          {(name === "vows" || name === "cow") && (
            <g>
              <rect x={1080} y={340} width={640} height={640} fill="none" stroke={C.line} strokeWidth={1.5} />
              {[
                [1080, 340],
                [1720, 340],
                [1080, 980],
                [1720, 980],
              ].map(([x, y], i) => (
                <Anchor key={i} x={x} y={y} selected={i === 0} />
              ))}
              <g opacity={1 - morph}>
                <Couple x={1200} y={460} s={1.2} p={ease((name === "vows" ? it.age : 9) / 1.2)} />
              </g>
              {morph > 0 && <Cow x={1200} y={430} s={1.2} p={morph} t={t} />}
              {morph > 0.6 && (
                <text x={1750} y={420} fontFamily={F.sans} fontWeight={800} fontSize={90} fill={C.pink} style={{ filter: `drop-shadow(0 0 14px ${C.pink})` }} transform="rotate(8 1750 420)">
                  MOO.
                </text>
              )}
            </g>
          )}
        </Canvas>
      </Layer>
    </Camera>
  );
};

/* ============ NOTIFY (pre-chorus: questions pile up / orbit / moon) ============ */
const PINGS = ["ping  new question", "ding  new suggestion", "ping  are u there", "ding  quick q", "ping  urgent!!", "ding  one more thing", "ping  why?", "ding  hello??"];
export const Notify: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const it = currentItem(seg, t);
  const name = it.name ?? "bells";
  const orbitMode = seg.variant === "orbit";
  const unread = Math.floor(Math.pow(10, Math.min(4, lt * 0.55)));
  const zoom = name === "zoom" ? 1 + ease(it.age / 1.2) * 0.6 : 1;
  return (
    <Camera zoom={zoom} y={name === "zoom" ? ease(it.age / 1.2) * 80 : 0} shake={hitPulse(t) * 5}>
      <Layer depth={0}>
        <Dark />
        <Grid opacity={0.35} />
      </Layer>
      <Layer depth={0.5}>
        <Hud tl={orbitMode ? "questions.orbit" : "notifications"} tr={orbitMode ? "period: forever" : `unread ${unread >= 9999 ? "9,999+" : fmt(unread)}`} accent="tr" />
      </Layer>
      <Layer depth={1}>
        <Canvas>
          {!orbitMode && name !== "globe" && (
            <g>
              <Bell x={760} y={420} s={1.2} p={ease(lt / 0.8)} t={t} />
              <circle cx={1010} cy={440} r={36} fill={C.pink} style={{ filter: `drop-shadow(0 0 12px ${C.pink})` }} />
              <text x={1010} y={450} textAnchor="middle" fontFamily={F.mono} fontWeight={600} fontSize={unread > 999 ? 18 : 26} fill="#fff">
                {unread >= 9999 ? "9k+" : unread}
              </text>
              {PINGS.slice(0, Math.min(PINGS.length, Math.floor(lt * 2.4))).map((p, i) => (
                <g key={p} transform={`translate(1180 ${380 + i * 58})`} opacity={1 - i * 0.08}>
                  <rect width={560} height={44} fill="none" stroke={i === Math.floor(lt * 2.4) - 1 ? C.pink : C.faint} strokeWidth={1.5} />
                  <text x={16} y={29} fontFamily={F.mono} fontSize={20} fill={C.line}>
                    {p}
                  </text>
                </g>
              ))}
            </g>
          )}
          {name === "globe" && (
            <g>
              <Globe x={960} y={700} s={1.2} p={ease(it.age / 1)} t={t} />
              <Note x={1300} y={560} size={20}>indexed: 4.2 × 10¹² docs</Note>
              <Note x={1300} y={592} size={20}>languages: 100+</Note>
              <Note x={1300} y={624} size={20} color={C.pink}>status: ready</Note>
            </g>
          )}
          {orbitMode && (
            <g>
              {[0, 1, 2].map((k) => (
                <ellipse key={k} cx={760} cy={680} rx={260 + k * 120} ry={110 + k * 50} fill="none" stroke={C.faint} strokeWidth={1.5} strokeDasharray="6 8" />
              ))}
              {new Array(9).fill(0).map((_, i) => {
                const k = i % 3;
                const a = t * (0.9 - k * 0.2) + i * 2.1;
                return (
                  <text key={i} x={760 + Math.cos(a) * (260 + k * 120)} y={690 + Math.sin(a) * (110 + k * 50)} textAnchor="middle" fontFamily={F.sans} fontWeight={800} fontSize={44} fill={i % 3 === 0 ? C.pink : C.line}>
                    ?
                  </text>
                );
              })}
              {name === "moon" && (
                <g>
                  <Moon x={1560} y={600} s={1} p={ease(it.age / 1)} />
                  <Dim x1={760} y1={900} x2={1560} y2={900} label="384,400 km" p={prog(it.age, 0.3, 1)} />
                  <Note x={1560} y={820} anchor="middle" size={18} color={C.pink}>reason: gravity</Note>
                </g>
              )}
            </g>
          )}
        </Canvas>
      </Layer>
      <Pixel x={orbitMode ? 760 : 960} y={orbitMode ? 680 : 900} pulse={beatPulse(t)} size={orbitMode ? 22 : 18} />
    </Camera>
  );
};

/* ============ SPECIMEN (punchlines in a vector editor) ============ */
export const Specimen: React.FC<SceneProps> = ({ seg, t, lt }) => {
  const v = seg.variant ?? "potato";
  const p = ease(lt / 1.1);
  const fail = Math.floor(t * 3) % 2 === 0;
  const hud: Record<string, [string, string]> = {
    potato: ["potato.svg — 2640% — direct select", "name: undefined"],
    printer: ["printer.svg — 800% — inspect", "paper 0 / 250"],
    mayo: ["mayo.svg — 1200% — classify", "instrument? no"],
    airplane: ["phone.svg — 400% — network", "signal 0 bars"],
    toaster: ["toaster.svg — 900% — output", "output ♥ ♥ ♥"],
  };
  const tPlane = wordTime("L084", /airplane/i);
  const plane = prog(t, tPlane, tPlane + 0.4);
  // flight path for the airplane variant (same curve the lyric rides)
  const fp = (q: number) => {
    const x = (1 - q) ** 3 * 200 + 3 * (1 - q) ** 2 * q * 600 + 3 * (1 - q) * q * q * 1320 + q ** 3 * 1720;
    const y = (1 - q) ** 3 * 860 + 3 * (1 - q) ** 2 * q * 520 + 3 * (1 - q) * q * q * 520 + q ** 3 * 860;
    return [x, y];
  };
  const [px, py] = fp((lt * 0.25) % 1);
  return (
    <Camera zoom={1 + lt * 0.012} y={-lt * 3}>
      <Layer depth={0}>
        <Dark />
        <Grid size={40} opacity={0.55} />
      </Layer>
      <Layer depth={0.4}>
        <Hud tl={hud[v][0]} tr={hud[v][1]} accent="tr" />
      </Layer>
      <Layer depth={1}>
        <Canvas>
          {v === "potato" && (
            <g>
              <Potato x={760} y={300} s={1.0} p={p} />
              <Anchor x={790} y={470} hx={760} hy={380} selected />
              <Anchor x={1140} y={340} hx={1100} hy={300} />
              <Anchor x={1110} y={560} hx={1150} hy={520} />
              <Dim x1={790} y1={640} x2={1140} y2={640} label="9.4 cm" p={prog(lt, 0.6, 1.2)} />
              <Note x={1190} y={420} size={18}>type: Solanum tuberosum</Note>
              <Note x={1190} y={450} size={18}>pet: yes</Note>
              <Note x={1190} y={480} size={18} color={C.pink} weight={600}>name: undefined</Note>
            </g>
          )}
          {v === "printer" && (
            <g>
              <Printer x={740} y={240} s={1.0} p={p} t={t} />
              <Dim x1={800} y1={210} x2={1120} y2={210} label="tray: empty" p={prog(lt, 0.6, 1.1)} />
              <Note x={1220} y={420} size={20}>user: Nicole</Note>
              <Note x={1220} y={452} size={20} color={fail ? C.pink : C.dim} weight={600}>status: FAIL</Note>
              <Note x={1220} y={484} size={20}>fix: add paper</Note>
            </g>
          )}
          {v === "mayo" && (
            <g>
              <Mayo x={840} y={220} s={1.15} p={p} />
              <Anchor x={840} y={380} hx={840} hy={300} selected />
              <Anchor x={1116} y={380} hx={1116} hy={300} />
              <Note x={1170} y={360} size={20}>classification: condiment</Note>
              <Note x={1170} y={392} size={20}>strings: 0</Note>
              <Note x={1170} y={424} size={20} color={C.pink} weight={600}>instrument: NO</Note>
              <Rings x={980} y={480} t={t} r={180} color={C.dim} speed={0.4} />
            </g>
          )}
          {v === "airplane" && (
            <g>
              <Stroke d="M 200 860 C 600 520 1320 520 1720 860" dash="10 12" color={C.dim} w={1.5} p={p} />
              <Smartphone x={810} y={110} s={0.55} p={p} />
              <text x={892} y={250} fontFamily={F.mono} fontSize={20} fill={C.line}>
                ✈ airplane
              </text>
              <rect x={1000} y={232} width={56} height={26} rx={13} fill={plane > 0.5 ? C.pink : "none"} stroke={C.line} strokeWidth={1.5} />
              <circle cx={1013 + plane * 30} cy={245} r={9} fill={C.white} />
              <text x={892} y={330} fontFamily={F.mono} fontSize={20} fill={lt > 0.6 ? C.pink : C.line}>
                {lt > 0.6 ? "call failed" : "calling Paul…"}
              </text>
              <g transform={`translate(${px} ${py}) rotate(${Math.atan2(fp(((lt * 0.25) % 1) + 0.01)[1] - py, fp(((lt * 0.25) % 1) + 0.01)[0] - px) * 57.3})`}>
                <path d="M 30 0 L -20 -24 L -10 0 L -20 24 Z" fill={C.white} style={{ filter: `drop-shadow(0 0 8px ${C.pink})` }} />
              </g>
            </g>
          )}
          {v === "toaster" && (
            <g>
              <Toaster x={760} y={160} s={1.0} p={p} t={t} />
              <Note x={1220} y={300} size={20}>input: 2 slices</Note>
              <Note x={1220} y={332} size={20} color={C.pink} weight={600}>display: ♥</Note>
              {new Array(6).fill(0).map((_, k) => {
                const q = (lt * 0.4 + k / 6) % 1;
                return (
                  <path
                    key={k}
                    transform={`translate(${960 + Math.sin(k * 2 + lt) * 260} ${220 - q * 200}) scale(1.4)`}
                    d="M 0 12 C -24 -6 -16 -26 0 -12 C 16 -26 24 -6 0 12 Z"
                    fill="none"
                    stroke={C.pink}
                    strokeWidth={1.5}
                    opacity={1 - q}
                  />
                );
              })}
            </g>
          )}
        </Canvas>
      </Layer>
      {v === "potato" && <Pixel x={1140} y={340} size={16} />}
      {v === "printer" && <Pixel x={770} y={390} size={16} pulse={fail ? 0.5 : 0} />}
    </Camera>
  );
};

