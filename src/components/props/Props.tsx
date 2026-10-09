import React from "react";
import { random } from "remotion";
import { C, F } from "../../theme";

/** Every prop draws inside a 600x600 viewBox centred at (300,300). `t` = seconds since the prop appeared. */
type P = { t: number };

const Txt: React.FC<{
  x: number;
  y: number;
  size: number;
  fill?: string;
  font?: string;
  children: React.ReactNode;
  anchor?: "middle" | "start" | "end";
  weight?: number;
}> = ({ x, y, size, fill = C.goldLight, font = F.deco, children, anchor = "middle", weight }) => (
  <text x={x} y={y} fontSize={size} fill={fill} fontFamily={font} textAnchor={anchor} fontWeight={weight}>
    {children}
  </text>
);

const Heart: React.FC<{ x: number; y: number; s: number; fill?: string; o?: number }> = ({ x, y, s, fill = C.pink, o = 1 }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0,12 C-24,-6 -16,-26 0,-12 C16,-26 24,-6 0,12 Z"
    fill={fill}
    opacity={o}
  />
);

const Money: React.FC<P> = ({ t }) => (
  <g>
    {new Array(10).fill(0).map((_, i) => {
      const life = (t * 0.6 + i / 10) % 1;
      return (
        <g key={i} transform={`translate(${120 + random(`m${i}`) * 360} ${-40 + life * 640}) rotate(${life * 300 + i * 40})`} opacity={1 - life}>
          <rect x={-40} y={-20} width={80} height={40} rx={4} fill="#3fae6a" stroke="#1d6b3c" strokeWidth={3} />
          <circle r={11} fill="none" stroke="#1d6b3c" strokeWidth={3} />
        </g>
      );
    })}
    <path d="M190,280 C150,360 150,520 300,530 C450,520 450,360 410,280 Z" fill="#b9935a" stroke="#7a5a2a" strokeWidth={6} />
    <path d="M230,280 C240,240 360,240 370,280 Z" fill="#a37f47" />
    <path d="M240,250 C260,200 340,200 360,250" stroke="#7a5a2a" strokeWidth={14} fill="none" />
    <Txt x={300} y={460} size={150} fill="#2f5e2f" font={F.deco}>$</Txt>
    <Txt x={300} y={580} size={40} fill={C.goldLight}>× 1,000,000</Txt>
  </g>
);

const Duck: React.FC<P> = ({ t }) => {
  const bob = Math.sin(t * 4) * 8;
  return (
    <g transform={`translate(0 ${bob})`}>
      <ellipse cx={300} cy={480} rx={220} ry={30} fill={C.teal} opacity={0.3} />
      <path d="M150,400 C150,320 260,300 330,330 C400,300 470,330 460,400 C450,470 200,480 150,400 Z" fill="#fff6cc" stroke="#e0c97a" strokeWidth={4} />
      <path d="M210,380 C250,350 300,360 320,390" stroke="#e0c97a" strokeWidth={5} fill="none" />
      <circle cx={380} cy={250} r={80} fill="#fff6cc" stroke="#e0c97a" strokeWidth={4} />
      <path d="M440,250 C500,240 520,270 500,286 C470,296 445,284 440,270 Z" fill="#ffa726" />
      {/* eyelashes, bedroom eyes */}
      <path d="M380,232 Q396,222 412,232" stroke="#222" strokeWidth={6} fill="none" />
      <path d="M384,226 l-4,-12 M396,222 l0,-13 M408,226 l4,-12" stroke="#222" strokeWidth={3} />
      {/* rose */}
      <path d="M500,278 L560,340" stroke="#2e7d32" strokeWidth={6} />
      <circle cx={566} cy={346} r={20} fill="#d81b60" />
      <path d="M556,340 q10,-8 18,4" stroke="#880e4f" strokeWidth={3} fill="none" />
      <Heart x={300} y={150 - (t * 40) % 80} s={2} o={0.9} />
      <Heart x={220} y={190 - (t * 50) % 100} s={1.3} fill={C.pinkSoft} />
    </g>
  );
};

const Potato: React.FC<P> = ({ t }) => {
  const wob = Math.sin(t * 3) * 3;
  return (
    <g>
      <ellipse cx={300} cy={500} rx={210} ry={40} fill="#5b0f2e" />
      <path d="M100,480 C100,440 500,440 500,480 L500,500 C500,540 100,540 100,500 Z" fill="#8e1846" stroke={C.gold} strokeWidth={4} />
      {[120, 480].map((tx) => (
        <path key={tx} d={`M${tx},490 l-10,30 l20,0 z`} fill={C.gold} />
      ))}
      <g transform={`rotate(${wob} 300 380)`}>
        <path d="M170,380 C150,280 240,220 320,230 C420,240 460,320 440,390 C420,460 220,470 170,380 Z" fill="#c8a165" stroke="#8a6a35" strokeWidth={5} />
        {[[220, 300], [390, 290], [340, 420], [250, 410], [410, 370]].map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r={5} fill="#8a6a35" />
        ))}
        <circle cx={265} cy={320} r={30} fill="#fff" stroke="#222" strokeWidth={3} />
        <circle cx={350} cy={316} r={36} fill="#fff" stroke="#222" strokeWidth={3} />
        <circle cx={268 + Math.sin(t * 5) * 8} cy={328} r={13} fill="#111" />
        <circle cx={354 - Math.sin(t * 4) * 10} cy={326} r={15} fill="#111" />
        <path d="M280,380 Q310,398 340,380" stroke="#5a3d1a" strokeWidth={5} fill="none" />
        {/* bowtie */}
        <path d="M270,430 L300,445 L270,460 Z M330,430 L300,445 L330,460 Z" fill={C.pink} stroke="#880e4f" strokeWidth={2} />
        <circle cx={300} cy={445} r={7} fill={C.gold} />
      </g>
      {/* name tag */}
      <g transform={`translate(420 170) rotate(${8 + wob})`}>
        <rect x={-90} y={-50} width={180} height={110} rx={10} fill="#fff" stroke={C.pink} strokeWidth={5} />
        <rect x={-90} y={-50} width={180} height={34} rx={10} fill={C.pink} />
        <Txt x={0} y={-25} size={20} fill="#fff" font={F.verse} weight={700}>HELLO my name is</Txt>
        <Txt x={0} y={40} size={52} fill="#333" font={F.verse} weight={700}>???</Txt>
      </g>
    </g>
  );
};

const Printer: React.FC<P> = ({ t }) => {
  const blink = Math.floor(t * 3) % 2 === 0;
  return (
    <g>
      <rect x={110} y={250} width={380} height={190} rx={22} fill="#e8e2d0" stroke="#8c8574" strokeWidth={6} />
      <rect x={150} y={200} width={300} height={70} rx={10} fill="#d4ccb5" stroke="#8c8574" strokeWidth={5} />
      <rect x={170} y={430} width={260} height={60} fill="#cfc7ae" stroke="#8c8574" strokeWidth={5} />
      <rect x={180} y={300} width={240} height={14} rx={7} fill="#1f1f1f" />
      <rect x={400} y={350} width={70} height={50} rx={6} fill="#111" />
      <Txt x={435} y={384} size={22} fill={blink ? "#ff3b3b" : "#550"} font={F.verse} weight={700}>!</Txt>
      <circle cx={140} cy={290} r={10} fill={blink ? "#ff3b3b" : "#552222"} />
      {/* empty tray */}
      <path d="M150,210 L170,140 L430,140 L450,210" fill="none" stroke="#8c8574" strokeWidth={5} strokeDasharray="12 10" />
      <g opacity={blink ? 1 : 0.4} transform="translate(300 560)">
        <rect x={-200} y={-46} width={400} height={64} rx={8} fill="#1a0610" stroke="#ff3b3b" strokeWidth={4} />
        <Txt x={0} y={0} size={40} fill="#ff4d6d" font={F.chorus}>OUT OF PAPER</Txt>
      </g>
    </g>
  );
};

const Thesis: React.FC<P> = ({ t }) => {
  const n = Math.min(10, Math.floor(t * 8));
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => (
        <g key={i} transform={`translate(${300 + Math.sin(i * 1.7) * 14} ${470 - i * 26}) rotate(${Math.sin(i * 2.3) * 4})`}>
          <rect x={-150} y={-20} width={300} height={24} fill="#fbf3dd" stroke="#c9b98f" strokeWidth={2} />
        </g>
      ))}
      <g transform={`translate(300 ${200 - n * 6})`}>
        <rect x={-130} y={-80} width={260} height={160} fill="#fbf3dd" stroke={C.gold} strokeWidth={4} />
        <Txt x={0} y={-30} size={34} fill="#3a2a10">THESIS</Txt>
        <Txt x={0} y={20} size={24} fill="#7a6a40" font={F.verse}>pg. {n} / 10</Txt>
        <path d="M-90,50 h180" stroke="#c9b98f" strokeWidth={3} />
      </g>
    </g>
  );
};

const Sneeze: React.FC<P> = ({ t }) => {
  const ah = (t * 1.2) % 1.6;
  const burst = ah > 1 ? (ah - 1) / 0.6 : 0;
  return (
    <g>
      <rect x={180} y={300} width={240} height={190} rx={16} fill="#a7d7f0" stroke="#5a9ac0" strokeWidth={5} />
      <path d="M180,330 L420,330" stroke="#5a9ac0" strokeWidth={4} />
      <path d={`M240,300 C230,${220 - burst * 40} 300,${200 - burst * 60} 300,${250 - burst * 30} C300,${200 - burst * 60} 370,${220 - burst * 40} 360,300 Z`} fill="#fff" stroke="#d8e6ef" strokeWidth={3} />
      <Txt x={300} y={420} size={44} fill="#2a5a7a" font={F.chorus}>TISSUES</Txt>
      {burst > 0 && <Txt x={300} y={140 - burst * 20} size={80 + burst * 40} fill={C.pinkSoft} font={F.chorus}>ACHOO!</Txt>}
      {/* thermometer */}
      <g transform={`translate(470 220) rotate(30)`}>
        <rect x={-12} y={-90} width={24} height={150} rx={12} fill="#fff" stroke="#999" strokeWidth={3} />
        <rect x={-5} y={-40} width={10} height={90} fill="#e53935" />
        <circle cx={0} cy={70} r={20} fill="#e53935" />
      </g>
    </g>
  );
};

const Stethoscope: React.FC<P> = ({ t }) => (
  <g>
    <path d="M200,140 C180,320 300,360 300,420 M400,140 C420,320 300,360 300,420" stroke="#222" strokeWidth={14} fill="none" />
    <circle cx={200} cy={140} r={14} fill={C.chrome} />
    <circle cx={400} cy={140} r={14} fill={C.chrome} />
    <path d="M300,420 C300,490 380,500 400,450" stroke="#222" strokeWidth={14} fill="none" />
    <circle cx={410} cy={440} r={40} fill={C.chrome} stroke={C.chromeDark} strokeWidth={6} />
    <Heart x={410} y={440} s={1 + 0.2 * Math.abs(Math.sin(t * 8))} />
    <g transform="translate(150 470)">
      <rect x={-60} y={-60} width={120} height={120} rx={14} fill="#fff" stroke="#e53935" strokeWidth={6} />
      <path d="M-14,-40 h28 v26 h26 v28 h-26 v26 h-28 v-26 h-26 v-28 h26 z" fill="#e53935" />
    </g>
  </g>
);

const HeartBack: React.FC<P> = ({ t }) => {
  const a = Math.sin(t * 3) * 40;
  return (
    <g>
      <g transform={`translate(300 300) rotate(${a})`}>
        <path d="M0,40 C-120,-40 -80,-140 0,-70 C80,-140 120,-40 0,40 Z" fill={C.pink} stroke="#880e4f" strokeWidth={6} transform="scale(1.8)" />
        <path d="M-10,-120 L20,-60 L-20,-20 L10,40" stroke="#1a0610" strokeWidth={10} fill="none" />
      </g>
      <path d="M100,480 C200,560 400,560 500,480" stroke={C.gold} strokeWidth={6} fill="none" strokeDasharray="20 14" />
      <path d="M490,470 l20,14 l-24,8" stroke={C.gold} strokeWidth={6} fill="none" />
    </g>
  );
};

const Crown: React.FC<P> = ({ t }) => (
  <g transform={`translate(0 ${Math.sin(t * 3) * 10})`}>
    <path d="M120,420 L100,200 L210,300 L300,150 L390,300 L500,200 L480,420 Z" fill={C.gold} stroke={C.goldLight} strokeWidth={8} />
    <rect x={115} y={410} width={370} height={50} rx={10} fill={C.goldDark} stroke={C.goldLight} strokeWidth={6} />
    {[100, 300, 500].map((px, i) => (
      <circle key={px} cx={px} cy={i === 1 ? 150 : 200} r={22} fill={i === 1 ? C.pink : C.turquoise} stroke={C.goldLight} strokeWidth={4} />
    ))}
    {[180, 300, 420].map((px, i) => (
      <polygon key={px} points={`${px},405 ${px + 18},430 ${px},455 ${px - 18},430`} fill={i === 1 ? C.pink : C.turquoise} />
    ))}
  </g>
);

const Typewriter: React.FC<P> = ({ t }) => {
  const key = Math.floor(t * 10) % 12;
  const carriage = ((t * 60) % 160) - 80;
  return (
    <g>
      <rect x={180 + carriage} y={160} width={240} height={140} fill="#fbf3dd" stroke="#c9b98f" strokeWidth={3} />
      <Txt x={300 + carriage} y={220} size={30} fill="#333" font={F.verse} weight={700}>01001…</Txt>
      <rect x={140 + carriage} y={280} width={320} height={40} rx={20} fill="#2a2a3a" stroke={C.gold} strokeWidth={4} />
      <path d="M120,330 L480,330 L540,500 L60,500 Z" fill="#1d1f33" stroke={C.gold} strokeWidth={6} />
      {new Array(12).fill(0).map((_, i) => (
        <circle key={i} cx={120 + (i % 6) * 72} cy={400 + Math.floor(i / 6) * 50 + (i === key ? 6 : 0)} r={20} fill={i === key ? C.turquoise : "#f6ead0"} stroke={C.gold} strokeWidth={3} />
      ))}
      <Txt x={300} y={120} size={50} fill={C.pinkSoft} font={F.chorus}>CLICK · CLACK</Txt>
    </g>
  );
};

const Tally: React.FC<P> = ({ t }) => {
  const n = Math.min(45, Math.floor(t * 30));
  return (
    <g>
      <rect x={110} y={140} width={380} height={300} rx={30} fill="#1d1f33" stroke={C.gold} strokeWidth={8} />
      <rect x={150} y={190} width={300} height={170} rx={12} fill="#0b0f1f" stroke={C.teal} strokeWidth={4} />
      <Txt x={300} y={330} size={150} fill={C.turquoise} font={F.chorus}>{String(n).padStart(2, "0")}</Txt>
      <Txt x={300} y={420} size={34} fill={C.goldLight}>TIMES EXPLAINED</Txt>
      <rect x={270} y={90} width={60} height={50} rx={8} fill={C.gold} />
    </g>
  );
};

const Hats: React.FC<P> = ({ t }) => {
  const k = Math.min(2, Math.floor(t * 1.4));
  const label = ["TUTOR", "THERAPIST", "TECH SUPPORT"];
  return (
    <g>
      {/* mortarboard */}
      <g opacity={k >= 0 ? 1 : 0.2} transform="translate(130 260)">
        <path d="M-90,0 L0,-40 L90,0 L0,40 Z" fill="#111" stroke={C.gold} strokeWidth={4} />
        <rect x={-50} y={10} width={100} height={50} fill="#111" />
        <path d="M60,6 L70,80" stroke={C.gold} strokeWidth={5} />
      </g>
      {/* therapy couch */}
      <g opacity={k >= 1 ? 1 : 0.2} transform="translate(300 280)">
        <path d="M-90,30 C-90,-40 -40,-50 -20,0 L90,0 L90,50 L-90,50 Z" fill="#8e1846" stroke={C.gold} strokeWidth={4} />
        <rect x={-80} y={50} width={12} height={24} fill={C.gold} />
        <rect x={70} y={50} width={12} height={24} fill={C.gold} />
      </g>
      {/* headset */}
      <g opacity={k >= 2 ? 1 : 0.2} transform="translate(470 260)">
        <path d="M-60,20 C-60,-70 60,-70 60,20" stroke="#222" strokeWidth={14} fill="none" />
        <rect x={-76} y={0} width={30} height={56} rx={12} fill={C.teal} />
        <rect x={46} y={0} width={30} height={56} rx={12} fill={C.teal} />
        <path d="M-60,50 C-50,90 0,90 10,80" stroke="#222" strokeWidth={6} fill="none" />
        <circle cx={14} cy={80} r={10} fill="#222" />
      </g>
      {label.map((l, i) => (
        <Txt key={l} x={[130, 300, 470][i]} y={420} size={30} fill={i <= k ? C.goldLight : "#555"} font={F.chorus}>
          {l}
        </Txt>
      ))}
    </g>
  );
};

const SearchBar: React.FC<P> = ({ t }) => {
  const txt = "overqualified...";
  const n = Math.floor(t * 12) % (txt.length + 8);
  return (
    <g>
      <rect x={20} y={240} width={560} height={110} rx={55} fill="#fff" stroke={C.gold} strokeWidth={8} />
      <circle cx={90} cy={295} r={26} fill="none" stroke="#666" strokeWidth={8} />
      <path d="M108,314 L130,336" stroke="#666" strokeWidth={10} strokeLinecap="round" />
      <Txt x={150} y={312} size={46} fill="#333" font={F.verse} anchor="start" weight={600}>
        {txt.slice(0, Math.min(n, txt.length))}
        {Math.floor(t * 3) % 2 ? "|" : ""}
      </Txt>
      {/* suggestions */}
      {["is mayo an instrument", "why is wifi slow", "how to milk cow"].map((s, i) => (
        <g key={s} opacity={Math.min(1, Math.max(0, t * 2 - i * 0.4))}>
          <rect x={60} y={370 + i * 60} width={480} height={52} fill="#f4f4f8" stroke="#ccc" />
          <Txt x={90} y={406 + i * 60} size={28} fill="#555" font={F.verse} anchor="start">
            {s}
          </Txt>
        </g>
      ))}
    </g>
  );
};

const Atom: React.FC<P> = ({ t }) => (
  <g transform="translate(300 300)">
    {[0, 60, 120].map((r, i) => (
      <g key={r} transform={`rotate(${r + t * 10})`}>
        <ellipse rx={220} ry={70} fill="none" stroke={C.turquoise} strokeWidth={5} />
        <circle cx={220 * Math.cos(t * 3 + i * 2)} cy={70 * Math.sin(t * 3 + i * 2)} r={14} fill={C.pink} />
      </g>
    ))}
    <circle r={40} fill={C.gold} style={{ filter: `drop-shadow(0 0 20px ${C.gold})` }} />
    <Txt x={0} y={260} size={40} fill={C.turquoise} font={F.chorus}>ψ = Σ quantum</Txt>
  </g>
);

const Symphony: React.FC<P> = ({ t }) => (
  <g>
    {[0, 1, 2, 3, 4].map((k) => (
      <path key={k} d={`M40,${200 + k * 24} C200,${180 + k * 24 + Math.sin(t * 2) * 20} 400,${220 + k * 24 - Math.sin(t * 2) * 20} 560,${200 + k * 24}`} stroke={C.goldLight} strokeWidth={3} fill="none" />
    ))}
    {new Array(8).fill(0).map((_, i) => {
      const x = 80 + i * 62;
      const y = 200 + ((i * 37) % 5) * 24 + Math.sin(t * 3 + i) * 10;
      return (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={16} ry={12} fill={C.turquoise} transform={`rotate(-20 ${x} ${y})`} />
          <path d={`M${x + 14},${y} L${x + 14},${y - 70}`} stroke={C.turquoise} strokeWidth={4} />
        </g>
      );
    })}
    {/* conductor baton */}
    <path d={`M300,520 L${300 + Math.sin(t * 4) * 120},${400 - Math.abs(Math.cos(t * 4)) * 60}`} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
  </g>
);

const Languages: React.FC<P> = ({ t }) => {
  const words = ["Hello", "Bonjour", "Hola", "Ciao", "Hallo", "Olá", "Salut", "Hej"];
  return (
    <g>
      <circle cx={300} cy={300} r={150} fill="#0b2b4a" stroke={C.turquoise} strokeWidth={6} />
      <path d="M150,300 h300 M300,150 v300 M180,220 C260,250 340,250 420,220 M180,380 C260,350 340,350 420,380" stroke={C.turquoise} strokeWidth={3} fill="none" opacity={0.7} />
      <ellipse cx={300} cy={300} rx={70} ry={150} fill="none" stroke={C.turquoise} strokeWidth={3} opacity={0.7} />
      {words.map((w, i) => {
        const a = t * 0.9 + (i / words.length) * Math.PI * 2;
        return (
          <Txt key={w} x={300 + Math.cos(a) * 230} y={310 + Math.sin(a) * 200} size={36} fill={i % 2 ? C.goldLight : C.pinkSoft} font={F.chorus}>
            {w}
          </Txt>
        );
      })}
      <Txt x={300} y={322} size={54} fill={C.goldLight}>×100</Txt>
    </g>
  );
};

const Mayo: React.FC<P> = ({ t }) => (
  <g>
    <rect x={190} y={190} width={220} height={290} rx={40} fill="#fffbe6" stroke="#d8cfa5" strokeWidth={6} />
    <rect x={200} y={150} width={200} height={60} rx={14} fill="#2d5bd8" />
    <rect x={190} y={290} width={220} height={110} fill="#2d5bd8" />
    <Txt x={300} y={345} size={44} fill="#fff" font={F.chorus}>MAYO</Txt>
    <Txt x={300} y={385} size={20} fill="#ffe066" font={F.verse} weight={700}>REAL INSTRUMENT?</Txt>
    {[0, 1, 2].map((k) => {
      const life = (t * 0.7 + k / 3) % 1;
      return (
        <g key={k} transform={`translate(${430 + life * 60} ${260 - life * 160}) rotate(${life * 30})`} opacity={1 - life}>
          <ellipse cx={0} cy={0} rx={12} ry={9} fill={C.goldLight} />
          <path d="M11,0 L11,-40 L28,-30" stroke={C.goldLight} strokeWidth={4} fill="none" />
        </g>
      );
    })}
    <ellipse cx={300} cy={500} rx={160} ry={22} fill="#000" opacity={0.4} />
  </g>
);

const CodeQuill: React.FC<P> = ({ t }) => (
  <g>
    <rect x={60} y={130} width={240} height={300} rx={10} fill="#0b0f1f" stroke={C.teal} strokeWidth={5} />
    {["fn fix() {", "  bugs = 0", "  swing()", "}"].map((l, i) => (
      <Txt key={l} x={80} y={190 + i * 50} size={28} fill={i % 2 ? C.turquoise : C.goldLight} font="monospace" anchor="start">
        {l.slice(0, Math.max(0, Math.floor(t * 18 - i * 8)))}
      </Txt>
    ))}
    <rect x={320} y={130} width={230} height={300} fill="#fbf3dd" stroke="#c9b98f" strokeWidth={4} />
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M340,${190 + i * 44} h${150 - (i % 2) * 40}`} stroke="#6a5a3a" strokeWidth={4} />
    ))}
    <g transform={`translate(${470 + Math.sin(t * 6) * 20} ${260 + Math.cos(t * 6) * 10}) rotate(35)`}>
      <path d="M0,0 C-30,-80 10,-160 40,-200 C30,-140 30,-60 0,0 Z" fill="#f6ead0" stroke={C.gold} strokeWidth={3} />
      <path d="M0,0 L-6,24" stroke="#222" strokeWidth={5} />
    </g>
  </g>
);

const Wifi: React.FC<P> = ({ t }) => {
  const bars = Math.floor(t * 3) % 4;
  return (
    <g>
      <rect x={160} y={330} width={280} height={90} rx={20} fill="#1d1f33" stroke={C.gold} strokeWidth={6} />
      <path d="M200,330 L180,230 M400,330 L420,230" stroke="#ccc" strokeWidth={10} strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={210 + i * 40} cy={375} r={10} fill={i < bars ? C.turquoise : "#333"} />
      ))}
      {[1, 2, 3].map((k) => (
        <path key={k} d={`M${300 - k * 60},${260 - k * 30} Q300,${200 - k * 60} ${300 + k * 60},${260 - k * 30}`} stroke={k <= bars ? C.turquoise : "#333"} strokeWidth={14} fill="none" strokeLinecap="round" />
      ))}
      {/* blowing wind / it "blows" */}
      {[0, 1, 2].map((k) => {
        const p = (t * 0.8 + k / 3) % 1;
        return <path key={k} d={`M${100 + p * 420},${470 + k * 30} q30,-20 60,0 t60,0`} stroke={C.pinkSoft} strokeWidth={5} fill="none" opacity={1 - p} />;
      })}
    </g>
  );
};

const FishTicket: React.FC<P> = ({ t }) => (
  <g>
    <g transform={`translate(160 190) rotate(-10)`}>
      <rect x={-130} y={-70} width={260} height={140} rx={10} fill="#fbf3dd" stroke={C.gold} strokeWidth={4} />
      <path d="M60,-70 v140" stroke={C.gold} strokeWidth={3} strokeDasharray="8 8" />
      <Txt x={-30} y={-20} size={26} fill="#3a2a10">BOARDING</Txt>
      <Txt x={-30} y={20} size={36} fill={C.tealDark}>PARIS</Txt>
      <path d={`M80,0 l40,-10 l-6,10 l6,10 z`} fill={C.tealDark} />
    </g>
    {/* fishbowl */}
    <circle cx={390} cy={390} r={140} fill="#7fd6f533" stroke="#bfe9ff" strokeWidth={6} />
    <path d="M260,410 Q390,380 520,410 L500,480 Q390,540 280,480 Z" fill="#40e8e044" />
    <g transform={`translate(${390 + Math.sin(t * 2) * 50} ${400}) scale(${Math.cos(t * 2) > 0 ? 1 : -1} 1)`}>
      <ellipse cx={0} cy={0} rx={44} ry={28} fill="#ff9800" />
      <path d="M40,0 L76,-24 L76,24 Z" fill="#ff9800" />
      <circle cx={-22} cy={-6} r={6} fill="#111" />
    </g>
    <g transform="translate(390 230) rotate(6)">
      <rect x={-80} y={-26} width={160} height={52} rx={8} fill="#fff" stroke={C.pink} strokeWidth={4} />
      <Txt x={0} y={12} size={32} fill={C.pink} font={F.chorus}>BUBBLES</Txt>
    </g>
  </g>
);

const Calorie: React.FC<P> = ({ t }) => {
  const n = Math.floor(Math.min(1, t / 1.2) * 742);
  return (
    <g>
      <ellipse cx={300} cy={400} rx={220} ry={70} fill="#fff" stroke="#ccc" strokeWidth={6} />
      <ellipse cx={300} cy={390} rx={150} ry={42} fill="#f0f0f0" />
      <path d="M220,380 C240,330 290,320 300,370 C320,320 380,330 380,380 Z" fill="#8bc34a" />
      <circle cx={260} cy={372} r={18} fill="#e53935" />
      <circle cx={340} cy={376} r={14} fill="#ffb300" />
      <rect x={180} y={110} width={240} height={170} rx={14} fill="#1d1f33" stroke={C.gold} strokeWidth={6} />
      <rect x={200} y={130} width={200} height={70} fill="#9ccc65" />
      <Txt x={300} y={186} size={54} fill="#1b3a0a" font="monospace">{n}</Txt>
      <Txt x={300} y={250} size={28} fill={C.goldLight}>kcal</Txt>
    </g>
  );
};

const Brain: React.FC<P> = ({ t }) => {
  const boom = Math.min(1, t / 0.6);
  return (
    <g>
      {new Array(16).fill(0).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const r = 120 + boom * 200;
        return (
          <g key={i} transform={`translate(${300 + Math.cos(a) * r} ${300 + Math.sin(a) * r}) rotate(${t * 200 + i * 20})`} opacity={1 - boom * 0.6}>
            <path d="M0,-18 L5,-5 L18,0 L5,5 L0,18 L-5,5 L-18,0 L-5,-5 Z" fill={i % 2 ? C.gold : C.pink} />
          </g>
        );
      })}
      <g transform={`translate(300 300) scale(${1 + Math.sin(t * 20) * 0.04 * (1 - boom * 0.5)})`}>
        <path d="M-130,10 C-150,-80 -60,-130 0,-100 C60,-130 150,-80 130,10 C140,80 60,110 0,90 C-60,110 -140,80 -130,10 Z" fill="#ff9ec4" stroke="#c2185b" strokeWidth={6} />
        <path d="M0,-100 L0,90 M-90,-40 C-60,-20 -80,10 -50,30 M90,-40 C60,-20 80,10 50,30 M-40,-70 C-20,-50 -40,-30 -20,-10 M40,-70 C20,-50 40,-30 20,-10" stroke="#c2185b" strokeWidth={5} fill="none" />
      </g>
      <Txt x={300} y={560} size={64} fill={C.gold} font={F.chorus}>KA-BOOM!</Txt>
    </g>
  );
};

const Broadway: React.FC<P> = ({ t }) => (
  <g>
    <rect x={180} y={60} width={240} height={480} rx={36} fill="#111" stroke={C.gold} strokeWidth={8} />
    <rect x={200} y={110} width={200} height={380} fill="#2a0a1a" />
    {/* tiny stage */}
    <path d="M200,110 C240,170 260,170 260,490 L200,490 Z M400,110 C360,170 340,170 340,490 L400,490 Z" fill="#b0103e" />
    <rect x={200} y={430} width={200} height={60} fill="#5a3410" />
    <circle cx={300} cy={300} r={60} fill={C.goldLight} opacity={0.15 + 0.1 * Math.sin(t * 6)} />
    <g transform={`translate(300 ${380 - Math.abs(Math.sin(t * 6)) * 20})`}>
      <circle cx={0} cy={-40} r={14} fill={C.skin} />
      <path d="M-14,-24 L14,-24 L20,30 L-20,30 Z" fill={C.pink} />
      <path d={`M-14,-20 L${-34},${-50 + Math.sin(t * 6) * 10} M14,-20 L34,${-50 - Math.sin(t * 6) * 10}`} stroke={C.skin} strokeWidth={5} />
    </g>
    <svg x={200} y={70} width={200} height={40} overflow="visible">
      <rect x={20} y={0} width={160} height={36} fill="#000" stroke={C.gold} strokeWidth={3} />
    </svg>
    <Txt x={300} y={98} size={22} fill={C.goldLight}>NOW PLAYING</Txt>
  </g>
);

const Globe: React.FC<P> = ({ t }) => (
  <g transform="translate(300 300)">
    <circle r={190} fill="#0b2b4a" stroke={C.gold} strokeWidth={6} />
    {[-120, -60, 0, 60, 120].map((y) => (
      <ellipse key={y} cx={0} cy={y} rx={Math.sqrt(190 * 190 - y * y)} ry={8} fill="none" stroke={C.teal} strokeWidth={2} />
    ))}
    {[0, 1, 2, 3].map((k) => (
      <ellipse key={k} rx={Math.abs(Math.cos(t + k * 0.8)) * 190} ry={190} fill="none" stroke={C.teal} strokeWidth={2} />
    ))}
    <path d="M-80,-60 C-40,-100 20,-80 10,-30 C0,10 -60,20 -90,-10 Z M40,40 C80,20 120,60 90,110 C60,130 30,90 40,40 Z" fill={C.goldDark} opacity={0.8} />
    <path d="M-200,0 a200,60 0 1,0 400,0" stroke={C.gold} strokeWidth={6} fill="none" />
    <rect x={-20} y={190} width={40} height={60} fill={C.gold} />
    <rect x={-100} y={240} width={200} height={24} rx={10} fill={C.goldDark} />
  </g>
);

const Bells: React.FC<P> = ({ t }) => {
  const ring = Math.sin(t * 30) * 18 * Math.exp(-((t * 2) % 1.4));
  return (
    <g>
      {[200, 400].map((bx, i) => (
        <g key={bx} transform={`translate(${bx} 300) rotate(${i ? -ring : ring})`}>
          <path d="M-90,60 C-90,-40 -50,-110 0,-110 C50,-110 90,-40 90,60 L110,90 L-110,90 Z" fill={C.gold} stroke={C.goldLight} strokeWidth={6} />
          <circle cx={0} cy={104} r={20} fill={C.goldDark} />
          <rect x={-10} y={-136} width={20} height={30} fill={C.goldDark} />
        </g>
      ))}
      <Txt x={300} y={110} size={70} fill={C.pinkSoft} font={F.chorus}>DING!</Txt>
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M${80 - k * 26},${240 - k * 20} q-20,60 0,120 M${520 + k * 26},${240 - k * 20} q20,60 0,120`} stroke={C.turquoise} strokeWidth={6} fill="none" opacity={0.7 - k * 0.2} />
      ))}
    </g>
  );
};

const Plug: React.FC<P> = ({ t }) => {
  const sway = Math.sin(t * 2.5) * 10;
  return (
    <g>
      {/* wall socket */}
      <rect x={340} y={200} width={180} height={240} rx={20} fill="#f6ead0" stroke={C.gold} strokeWidth={8} />
      <rect x={385} y={260} width={20} height={44} rx={6} fill="#333" />
      <rect x={455} y={260} width={20} height={44} rx={6} fill="#333" />
      <circle cx={430} cy={360} r={14} fill="#333" />
      {/* dangling plug */}
      <path d={`M60,40 C80,200 100,300 ${170 + sway},380`} stroke="#222" strokeWidth={14} fill="none" />
      <g transform={`translate(${170 + sway} 380) rotate(${-30 + sway})`}>
        <rect x={-40} y={0} width={80} height={90} rx={12} fill="#222" />
        <rect x={-26} y={86} width={14} height={40} fill={C.chrome} />
        <rect x={12} y={86} width={14} height={40} fill={C.chrome} />
      </g>
      <Txt x={430} y={540} size={70} fill={C.pinkSoft} font={F.chorus}>?!</Txt>
    </g>
  );
};

const Coffee: React.FC<P> = ({ t }) => (
  <g>
    <path d="M170,250 L430,250 L400,470 C395,500 205,500 200,470 Z" fill="#f6ead0" stroke={C.gold} strokeWidth={6} />
    <path d="M430,290 C500,290 500,400 415,400" stroke={C.gold} strokeWidth={14} fill="none" />
    <ellipse cx={300} cy={252} rx={130} ry={20} fill="#5d3a1a" />
    {[0, 1, 2].map((k) => (
      <path key={k} d={`M${250 + k * 50},230 q-20,-40 0,-80 q20,-40 0,-80`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.3 + 0.3 * Math.sin(t * 3 + k)} />
    ))}
    <g opacity={Math.min(1, t * 2)}>
      <line x1={120} y1={120} x2={480} y2={520} stroke="#ff3b3b" strokeWidth={26} strokeLinecap="round" />
      <line x1={480} y1={120} x2={120} y2={520} stroke="#ff3b3b" strokeWidth={26} strokeLinecap="round" />
    </g>
    <Txt x={300} y={580} size={44} fill={C.goldLight}>NO BREAKS NEEDED</Txt>
  </g>
);

const Clock6: React.FC<P> = ({ t }) => {
  const shake = Math.sin(t * 50) * 4;
  return (
    <g transform={`translate(${shake} 0)`}>
      <circle cx={190} cy={110} r={60} fill={C.gold} />
      <circle cx={410} cy={110} r={60} fill={C.gold} />
      <circle cx={300} cy={300} r={200} fill="#f6ead0" stroke={C.gold} strokeWidth={14} />
      {new Array(12).fill(0).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={300 + Math.sin(a) * 160} y1={300 - Math.cos(a) * 160} x2={300 + Math.sin(a) * 180} y2={300 - Math.cos(a) * 180} stroke="#333" strokeWidth={i % 3 ? 4 : 10} />;
      })}
      <line x1={300} y1={300} x2={300} y2={440} stroke="#222" strokeWidth={14} strokeLinecap="round" />
      <line x1={300} y1={300} x2={300} y2={140} stroke="#222" strokeWidth={8} strokeLinecap="round" />
      <circle cx={300} cy={300} r={14} fill={C.pink} />
      <path d="M240,520 l-30,40 M360,520 l30,40" stroke={C.gold} strokeWidth={14} />
      <rect x={170} y={540} width={260} height={60} rx={10} fill="#1a0610" stroke={C.pink} strokeWidth={4} />
      <Txt x={300} y={584} size={40} fill={C.pinkSoft} font={F.chorus}>6:00 AM</Txt>
    </g>
  );
};

const Water: React.FC<P> = ({ t }) => (
  <g>
    <ellipse cx={300} cy={520} rx={160} ry={24} fill={C.goldDark} />
    <rect x={160} y={500} width={280} height={30} fill={C.gold} />
    <path d="M210,180 L390,180 L370,500 L230,500 Z" fill="#bfe9ff33" stroke="#e0f7ff" strokeWidth={6} />
    <path d={`M218,${280 + Math.sin(t * 3) * 4} Q300,${270 - Math.sin(t * 3) * 6} 382,${280 + Math.sin(t * 3) * 4} L370,500 L230,500 Z`} fill="#40e8e066" />
    {[0, 1, 2, 3].map((k) => {
      const p = (t * 0.5 + k / 4) % 1;
      return <circle key={k} cx={250 + k * 30} cy={480 - p * 190} r={5} fill="#fff" opacity={1 - p} />;
    })}
    <path d="M240,200 L250,470" stroke="#fff" strokeWidth={6} opacity={0.5} />
    <Txt x={300} y={120} size={50} fill={C.turquoise} font={F.chorus}>H₂O À LA CARTE</Txt>
  </g>
);

const Envelope: React.FC<P> = ({ t }) => {
  const pulse = 1 + 0.06 * Math.sin(t * 8);
  return (
    <g transform={`translate(300 300) scale(${pulse})`}>
      <rect x={-200} y={-130} width={400} height={260} rx={14} fill="#fbf3dd" stroke={C.gold} strokeWidth={8} />
      <path d="M-200,-130 L0,30 L200,-130" stroke={C.gold} strokeWidth={8} fill="none" />
      <circle cx={180} cy={-120} r={50} fill="#ff3b3b" />
      <Txt x={180} y={-102} size={54} fill="#fff" font={F.chorus}>1</Txt>
      <Heart x={0} y={70} s={1.8} />
    </g>
  );
};

const Toaster: React.FC<P> = ({ t }) => {
  const pop = Math.max(0, Math.sin(t * 2.2)) * 60;
  return (
    <g>
      {[0, 1].map((k) => (
        <g key={k} transform={`translate(${230 + k * 140} ${190 - pop})`}>
          <rect x={-50} y={-60} width={100} height={110} rx={30} fill="#e0a85a" stroke="#9a6a2a" strokeWidth={4} />
          <Heart x={0} y={-4} s={1.6} fill="#9a6a2a" />
        </g>
      ))}
      <path d="M120,220 C120,180 480,180 480,220 L480,460 C480,500 120,500 120,460 Z" fill="url(#propChrome)" stroke={C.chromeDark} strokeWidth={6} />
      <rect x={170} y={190} width={110} height={18} rx={8} fill="#222" />
      <rect x={320} y={190} width={110} height={18} rx={8} fill="#222" />
      {[160, 200, 240].map((y) => (
        <path key={y} d={`M140,${y + 100} h320`} stroke={C.chromeDark} strokeWidth={3} opacity={0.6} />
      ))}
      {/* display screen */}
      <rect x={200} y={320} width={200} height={110} rx={12} fill="#120818" stroke={C.gold} strokeWidth={5} />
      <Heart x={300} y={372} s={2.4 + 0.3 * Math.sin(t * 8)} />
      <Heart x={240} y={350} s={0.8} fill={C.pinkSoft} o={0.6 + 0.4 * Math.sin(t * 6)} />
      <Heart x={360} y={395} s={0.8} fill={C.pinkSoft} o={0.6 + 0.4 * Math.cos(t * 6)} />
      <rect x={460} y={300} width={40} height={20} rx={6} fill="#222" />
      <rect x={160} y={490} width={40} height={22} rx={4} fill="#222" />
      <rect x={400} y={490} width={40} height={22} rx={4} fill="#222" />
      {new Array(6).fill(0).map((_, k) => {
        const p = (t * 0.6 + k / 6) % 1;
        return <Heart key={k} x={300 + Math.sin(k * 2.1 + t) * 160} y={150 - p * 160} s={0.9} o={1 - p} fill={k % 2 ? C.pink : C.pinkSoft} />;
      })}
    </g>
  );
};

const Laptop: React.FC<P & { censored?: boolean }> = ({ t, censored }) => {
  const tabs = Math.min(50, Math.floor(t * 30) + 6);
  return (
    <g>
      <path d="M90,90 L510,90 L510,400 L90,400 Z" fill="#1d1f33" stroke={C.gold} strokeWidth={8} />
      <rect x={110} y={110} width={380} height={270} fill="#e8eef5" />
      {new Array(tabs).fill(0).map((_, i) => (
        <rect key={i} x={110 + i * (380 / tabs)} y={110} width={380 / tabs - 1} height={22} fill={i % 2 ? "#c7d3e0" : "#d8e2ec"} stroke="#9aa8b8" strokeWidth={0.5} />
      ))}
      <Txt x={480} y={160} size={22} fill="#ff3b3b" font={F.verse} anchor="end" weight={700}>
        {tabs} tabs
      </Txt>
      {/* spinner */}
      <g transform={`translate(300 260) rotate(${t * 300})`}>
        <circle r={40} fill="none" stroke="#9aa8b8" strokeWidth={10} />
        <path d="M40,0 A40,40 0 0,1 0,40" stroke={C.teal} strokeWidth={10} fill="none" />
      </g>
      {censored && (
        <g>
          <rect x={110} y={110} width={380} height={270} fill="url(#pixelate)" />
          <rect x={60} y={200} width={480} height={90} fill="#000" transform="rotate(-6 300 245)" />
          <Txt x={300} y={268} size={64} fill={C.pink} font={F.chorus}>
            CENSORED
          </Txt>
        </g>
      )}
      <path d="M40,400 L560,400 L600,450 L0,450 Z" fill="#2a2d45" stroke={C.gold} strokeWidth={6} />
      <defs>
        <pattern id="pixelate" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill={C.pink} />
          <rect x="20" width="20" height="20" fill={C.pinkSoft} />
          <rect y="20" width="20" height="20" fill="#ff8fc8" />
          <rect x="20" y="20" width="20" height="20" fill="#d81b60" />
        </pattern>
      </defs>
    </g>
  );
};

const Weather: React.FC<P> = ({ t }) => (
  <g>
    <circle cx={360} cy={220} r={110} fill="#ffcc33" style={{ filter: "drop-shadow(0 0 30px #ffcc33)" }} />
    {new Array(10).fill(0).map((_, i) => {
      const a = (i / 10) * Math.PI * 2 + t;
      return <line key={i} x1={360 + Math.cos(a) * 130} y1={220 + Math.sin(a) * 130} x2={360 + Math.cos(a) * 170} y2={220 + Math.sin(a) * 170} stroke="#ffcc33" strokeWidth={12} strokeLinecap="round" />;
    })}
    <g transform={`translate(${Math.sin(t) * 30} 0)`}>
      <path d="M100,400 C60,400 60,320 120,320 C130,260 230,250 250,310 C320,290 350,400 290,400 Z" fill="#f4f6fb" />
    </g>
    <Txt x={300} y={540} size={70} fill={C.goldLight} font={F.chorus}>72°F · SUNNY</Txt>
  </g>
);

const Moon: React.FC<P> = ({ t }) => (
  <g>
    <circle cx={300} cy={280} r={170} fill="#f6ead0" style={{ filter: `drop-shadow(0 0 40px ${C.goldLight})` }} />
    <circle cx={370} cy={230} r={170} fill="#0a1028" />
    <circle cx={210} cy={240} r={18} fill="#d8cba8" />
    <circle cx={190} cy={340} r={26} fill="#d8cba8" />
    <path d="M200,290 q14,-10 26,0" stroke="#5a4a2a" strokeWidth={5} fill="none" />
    <Txt x={300} y={560} size={90} fill={C.pinkSoft} font={F.chorus}>WHY?</Txt>
    <g transform={`translate(${470 + Math.sin(t * 2) * 20} 420)`}>
      <Txt x={0} y={0} size={70} fill={C.turquoise} font={F.chorus}>?</Txt>
    </g>
  </g>
);

const Gramophone: React.FC<P> = ({ t }) => (
  <g>
    <rect x={150} y={380} width={300} height={130} rx={12} fill="#5a2e14" stroke={C.gold} strokeWidth={6} />
    <ellipse cx={300} cy={380} rx={140} ry={30} fill="#111" />
    <ellipse cx={300} cy={380} rx={50} ry={11} fill={C.pink} transform={`rotate(${(t * 200) % 360} 300 380)`} />
    <path d="M400,380 L420,250 C420,220 400,200 380,190" stroke={C.gold} strokeWidth={10} fill="none" />
    <path d="M380,190 C320,120 200,40 100,60 C120,140 200,220 360,210 Z" fill="url(#propBrass)" stroke={C.goldDark} strokeWidth={4} />
    {[0, 1, 2].map((k) => {
      const p = (t * 0.5 + k / 3) % 1;
      return <Txt key={k} x={120 - p * 60} y={100 - p * 80} size={50} fill={C.goldLight} font={F.chorus}><tspan opacity={1 - p}>♪</tspan></Txt>;
    })}
  </g>
);

export const PROPS: Record<string, React.FC<P>> = {
  money: Money,
  duck: Duck,
  potato: Potato,
  printer: Printer,
  thesis: Thesis,
  sneeze: Sneeze,
  doctor: Stethoscope,
  heartBack: HeartBack,
  crown: Crown,
  typewriter: Typewriter,
  tally: Tally,
  hats: Hats,
  search: SearchBar,
  atom: Atom,
  symphony: Symphony,
  languages: Languages,
  mayo: Mayo,
  code: CodeQuill,
  wifi: Wifi,
  fish: FishTicket,
  calorie: Calorie,
  brain: Brain,
  broadway: Broadway,
  globe: Globe,
  bells: Bells,
  plug: Plug,
  coffee: Coffee,
  clock: Clock6,
  water: Water,
  envelope: Envelope,
  toaster: Toaster,
  laptop: (p) => <Laptop {...p} />,
  censored: (p) => <Laptop {...p} censored />,
  weather: Weather,
  moon: Moon,
  gramophone: Gramophone,
};

/** Renders a prop by name inside a positioned square box. */
export const Prop: React.FC<{
  name: string;
  t: number;
  x: number;
  y: number;
  size: number;
  style?: React.CSSProperties;
}> = ({ name, t, x, y, size, style }) => {
  const Comp = PROPS[name];
  if (!Comp) return null;
  return (
    <svg viewBox="0 0 600 600" width={size} height={size} style={{ position: "absolute", left: x, top: y, overflow: "visible", ...style }}>
      <defs>
        <linearGradient id="propChrome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d93a8" />
          <stop offset="0.35" stopColor="#eef6fb" />
          <stop offset="0.6" stopColor="#b7c8d6" />
          <stop offset="1" stopColor="#5d7186" />
        </linearGradient>
        <linearGradient id="propBrass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.goldLight} />
          <stop offset="1" stopColor={C.goldDark} />
        </linearGradient>
      </defs>
      <Comp t={t} />
    </svg>
  );
};
