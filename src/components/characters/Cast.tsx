import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../../theme";

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { f, t: f / fps };
};

const Svg: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  scale?: number;
  vb: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x, y, w, h, scale = 1, vb, children, style }) => (
  <svg
    viewBox={vb}
    width={w * scale}
    height={h * scale}
    style={{ position: "absolute", left: x, top: y, overflow: "visible", ...style }}
  >
    {children}
  </svg>
);

/* ================= GRANDMA ================= */

export type GrandmaArms = "type" | "wave" | "search" | "phone" | "rest" | "thumb" | "letter";
export type GrandmaFace = "happy" | "confused" | "squint" | "delighted" | "talk";

/** Recurring tech-support grandma. 400x520 bust (head + torso + arms). */
export const Grandma: React.FC<{
  x?: number;
  y?: number;
  scale?: number;
  arms?: GrandmaArms;
  face?: GrandmaFace;
  glasses?: "eyes" | "head";
  talk?: number;
}> = ({ x = 0, y = 0, scale = 1, arms = "rest", face = "happy", glasses = "eyes", talk = 0 }) => {
  const { f, t } = useT();
  const blink = (f + 41) % 110 < 4;
  const bob = Math.sin(t * 2.2) * 3;
  const tilt = face === "confused" ? -8 + Math.sin(t * 1.5) * 3 : Math.sin(t * 1.3) * 2;
  const typing = arms === "type" ? Math.sin(t * 22) * 6 : 0;
  const mouthOpen = face === "talk" ? Math.abs(Math.sin(t * 11)) * 12 : talk * 12;

  const eyes = (() => {
    if (blink || face === "squint") {
      return (
        <g stroke="#3b2a2a" strokeWidth={4} strokeLinecap="round" fill="none">
          <path d="M150,212 Q165,204 180,212" />
          <path d="M220,212 Q235,204 250,212" />
        </g>
      );
    }
    if (face === "delighted") {
      return (
        <g stroke="#3b2a2a" strokeWidth={4} strokeLinecap="round" fill="none">
          <path d="M150,214 Q165,200 180,214" />
          <path d="M220,214 Q235,200 250,214" />
        </g>
      );
    }
    return (
      <g>
        <ellipse cx={165} cy={210} rx={8} ry={face === "confused" ? 10 : 8} fill="#2b1d1d" />
        <ellipse cx={235} cy={210} rx={8} ry={8} fill="#2b1d1d" />
        <circle cx={168} cy={206} r={3} fill="#fff" />
        <circle cx={238} cy={206} r={3} fill="#fff" />
      </g>
    );
  })();

  const specs = (onHead: boolean) => (
    <g transform={onHead ? "translate(0 -112) rotate(-4 200 200)" : undefined}>
      <circle cx={165} cy={210} r={30} fill={onHead ? "#cfe9ff33" : "#cfe9ff22"} stroke={C.gold} strokeWidth={6} />
      <circle cx={235} cy={210} r={30} fill={onHead ? "#cfe9ff33" : "#cfe9ff22"} stroke={C.gold} strokeWidth={6} />
      <path d="M195,208 Q200,200 205,208" stroke={C.gold} strokeWidth={5} fill="none" />
      <path d="M135,206 L112,198 M265,206 L288,198" stroke={C.gold} strokeWidth={5} />
      <path d="M150,196 L160,190" stroke="#fff" strokeWidth={4} opacity={0.7} strokeLinecap="round" />
      <path d="M220,196 L230,190" stroke="#fff" strokeWidth={4} opacity={0.7} strokeLinecap="round" />
      {/* bead chain */}
      {!onHead && <path d="M112,198 C100,260 110,300 140,320" stroke={C.goldLight} strokeWidth={2} strokeDasharray="2 5" fill="none" />}
    </g>
  );

  const armL = (() => {
    switch (arms) {
      case "type":
        return <path d={`M110,330 C80,380 90,430 150,${445 + typing}`} stroke="#7a5aa6" strokeWidth={38} strokeLinecap="round" fill="none" />;
      case "wave":
        return <path d="M110,330 C80,380 90,430 150,445" stroke="#7a5aa6" strokeWidth={38} strokeLinecap="round" fill="none" />;
      case "search":
        return <path d={`M110,330 C60,300 50,${250 + Math.sin(t * 6) * 10} 70,${220 + Math.sin(t * 6) * 14}`} stroke="#7a5aa6" strokeWidth={38} strokeLinecap="round" fill="none" />;
      case "letter":
        return <path d="M110,330 C80,370 100,400 150,390" stroke="#7a5aa6" strokeWidth={38} strokeLinecap="round" fill="none" />;
      default:
        return <path d="M110,330 C80,390 110,440 170,450" stroke="#7a5aa6" strokeWidth={38} strokeLinecap="round" fill="none" />;
    }
  })();
  const armR = (() => {
    switch (arms) {
      case "type":
        return <path d={`M290,330 C320,380 310,430 250,${445 - typing}`} stroke="#7a5aa6" strokeWidth={38} strokeLinecap="round" fill="none" />;
      case "wave": {
        const a = Math.sin(t * 9) * 14;
        return (
          <g>
            <path d="M290,330 C340,300 350,250 340,200" stroke="#7a5aa6" strokeWidth={38} strokeLinecap="round" fill="none" />
            <g transform={`translate(340 170) rotate(${a})`}>
              <ellipse cx={0} cy={0} rx={22} ry={28} fill="#f2c9b0" />
              {[-14, -5, 4, 13].map((k) => (
                <rect key={k} x={k - 4} y={-48} width={9} height={26} rx={4.5} fill="#f2c9b0" />
              ))}
            </g>
          </g>
        );
      }
      case "search":
        return <path d={`M290,330 C340,300 350,${250 - Math.sin(t * 6) * 10} 330,${220 - Math.sin(t * 6) * 14}`} stroke="#7a5aa6" strokeWidth={38} strokeLinecap="round" fill="none" />;
      case "phone":
        return (
          <g>
            <path d="M290,330 C330,310 320,250 280,232" stroke="#7a5aa6" strokeWidth={38} strokeLinecap="round" fill="none" />
            <rect x={270} y={180} width={36} height={66} rx={8} fill="#222" stroke={C.gold} strokeWidth={3} transform="rotate(-18 288 213)" />
          </g>
        );
      case "thumb":
        return (
          <g>
            <path d="M290,330 C340,320 350,280 340,250" stroke="#7a5aa6" strokeWidth={38} strokeLinecap="round" fill="none" />
            <ellipse cx={340} cy={232} rx={22} ry={20} fill="#f2c9b0" />
            <rect x={334} y={196} width={12} height={30} rx={6} fill="#f2c9b0" />
          </g>
        );
      case "letter":
        return <path d="M290,330 C320,370 300,400 250,390" stroke="#7a5aa6" strokeWidth={38} strokeLinecap="round" fill="none" />;
      default:
        return <path d="M290,330 C320,390 290,440 230,450" stroke="#7a5aa6" strokeWidth={38} strokeLinecap="round" fill="none" />;
    }
  })();
  const hands =
    arms === "type" || arms === "rest" ? (
      <g>
        <ellipse cx={arms === "type" ? 155 : 175} cy={(arms === "type" ? 450 : 455) + typing} rx={20} ry={14} fill="#f2c9b0" />
        <ellipse cx={arms === "type" ? 245 : 225} cy={(arms === "type" ? 450 : 455) - typing} rx={20} ry={14} fill="#f2c9b0" />
      </g>
    ) : arms === "letter" ? (
      <g transform={`rotate(${Math.sin(t * 2) * 2} 200 380)`}>
        <rect x={130} y={300} width={140} height={110} fill="#fbf3dd" stroke="#c9b98f" strokeWidth={3} />
        {[318, 334, 350, 366, 382].map((ly) => (
          <line key={ly} x1={144} y1={ly} x2={256 - (ly % 3) * 12} y2={ly} stroke="#8a7a5a" strokeWidth={3} />
        ))}
        <path d="M232,392 c6,-8 16,-2 10,6 l-10,10 l-10,-10 c-6,-8 4,-14 10,-6 z" fill={C.pink} />
        <ellipse cx={150} cy={392} rx={18} ry={13} fill="#f2c9b0" />
        <ellipse cx={250} cy={392} rx={18} ry={13} fill="#f2c9b0" />
      </g>
    ) : null;

  return (
    <Svg x={x} y={y + bob * scale} w={400} h={520} scale={scale} vb="0 0 400 520">
      <defs>
        <linearGradient id="gmCardigan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9b7cc8" />
          <stop offset="1" stopColor="#6a4b96" />
        </linearGradient>
        <radialGradient id="gmSkin" cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#ffe3cf" />
          <stop offset="1" stopColor="#efbf9f" />
        </radialGradient>
      </defs>
      {/* torso */}
      <path d="M90,520 C90,380 120,320 200,310 C280,320 310,380 310,520 Z" fill="url(#gmCardigan)" />
      <path d="M200,312 L200,520" stroke="#4d3672" strokeWidth={4} />
      <path d="M160,316 C175,350 225,350 240,316" fill="#f6ead0" />
      {[380, 420, 460, 500].map((by) => (
        <circle key={by} cx={212} cy={by} r={7} fill={C.gold} />
      ))}
      {/* cable knit hints */}
      <path d="M130,400 q10,10 0,20 q-10,10 0,20 q10,10 0,20" stroke="#b79be0" strokeWidth={4} fill="none" />
      <path d="M270,400 q10,10 0,20 q-10,10 0,20 q10,10 0,20" stroke="#b79be0" strokeWidth={4} fill="none" />
      {/* pearls */}
      {new Array(11).fill(0).map((_, i) => {
        const a = Math.PI * (0.15 + (i / 10) * 0.7);
        return <circle key={i} cx={200 - Math.cos(a) * 46} cy={322 + Math.sin(a) * 30} r={6} fill="#fdf6e3" stroke="#d9cfb5" />;
      })}
      {armL}
      {armR}
      {hands}
      <g transform={`rotate(${tilt} 200 300)`}>
        {/* neck */}
        <rect x={180} y={270} width={40} height={44} fill="#efbf9f" />
        {/* bun */}
        <circle cx={200} cy={92} r={46} fill="#d9dbe4" />
        <circle cx={200} cy={92} r={46} fill="none" stroke="#b9bccb" strokeWidth={4} strokeDasharray="10 12" />
        <path d="M232,60 L262,36" stroke={C.pink} strokeWidth={6} strokeLinecap="round" />
        <circle cx={264} cy={34} r={6} fill={C.gold} />
        {/* head */}
        <ellipse cx={200} cy={210} rx={92} ry={100} fill="url(#gmSkin)" />
        {/* hair */}
        <path d="M108,200 C100,120 150,100 200,104 C250,100 300,120 292,200 C280,160 250,140 200,146 C150,140 120,160 108,200 Z" fill="#e4e6ee" />
        <path d="M130,160 C150,140 170,150 186,140 M214,140 C232,150 250,140 270,160" stroke="#b9bccb" strokeWidth={4} fill="none" />
        {/* ears + earrings */}
        <ellipse cx={108} cy={216} rx={12} ry={18} fill="#efbf9f" />
        <ellipse cx={292} cy={216} rx={12} ry={18} fill="#efbf9f" />
        <circle cx={108} cy={240} r={7} fill={C.turquoise} />
        <circle cx={292} cy={240} r={7} fill={C.turquoise} />
        {/* cheeks */}
        <circle cx={145} cy={248} r={18} fill="#ff8fa8" opacity={0.45} />
        <circle cx={255} cy={248} r={18} fill="#ff8fa8" opacity={0.45} />
        {/* brows */}
        <path
          d={face === "confused" ? "M146,176 Q165,166 182,180 M218,174 Q236,160 254,170" : "M146,180 Q165,170 182,178 M218,178 Q236,170 254,180"}
          stroke="#b9bccb"
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
        />
        {eyes}
        {/* wrinkles */}
        <path d="M128,212 l-10,-4 M128,220 l-10,2 M272,212 l10,-4 M272,220 l10,2" stroke="#d29a7d" strokeWidth={2} />
        {/* nose */}
        <path d="M200,214 C192,240 196,250 208,248" stroke="#d29a7d" strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* mouth */}
        {mouthOpen > 1 ? (
          <ellipse cx={200} cy={274} rx={16} ry={4 + mouthOpen} fill="#7a2c3a" />
        ) : face === "confused" ? (
          <path d="M184,278 Q200,270 216,280" stroke="#a5405a" strokeWidth={5} fill="none" strokeLinecap="round" />
        ) : (
          <path d="M176,270 Q200,292 224,270" stroke="#a5405a" strokeWidth={5} fill="#c9566f" strokeLinecap="round" />
        )}
        {specs(glasses === "head")}
      </g>
    </Svg>
  );
};

/* ================= CAT ================= */

/** Tuxedo cat hacker, typing. 360x360. */
export const Cat: React.FC<{ x: number; y: number; scale?: number; shades?: boolean; typing?: boolean }> = ({
  x,
  y,
  scale = 1,
  shades = true,
  typing = true,
}) => {
  const { t } = useT();
  const pawL = typing ? Math.max(0, Math.sin(t * 20)) * 14 : 0;
  const pawR = typing ? Math.max(0, Math.sin(t * 20 + Math.PI)) * 14 : 0;
  const tail = Math.sin(t * 3) * 18;
  const ear = Math.sin(t * 1.7) > 0.9 ? -8 : 0;
  return (
    <Svg x={x} y={y} w={360} h={360} scale={scale} vb="0 0 360 360">
      <path d={`M270,300 C340,290 330,${200 + tail} ${300 + tail},${160}`} stroke="#15151f" strokeWidth={22} strokeLinecap="round" fill="none" />
      <ellipse cx={180} cy={270} rx={100} ry={80} fill="#15151f" />
      <path d="M150,220 C160,280 200,280 210,220 L195,330 L165,330 Z" fill="#f4f1ea" />
      <g transform={`rotate(${Math.sin(t * 2) * 3} 180 180)`}>
        <path d={`M100,${110 + ear} L118,40 L160,96 Z`} fill="#15151f" />
        <path d="M260,110 L242,40 L200,96 Z" fill="#15151f" />
        <path d="M118,92 L124,60 L146,90 Z" fill={C.pinkSoft} />
        <path d="M242,92 L236,60 L214,90 Z" fill={C.pinkSoft} />
        <ellipse cx={180} cy={140} rx={88} ry={72} fill="#15151f" />
        <path d="M150,160 C160,200 200,200 210,160 C200,150 160,150 150,160 Z" fill="#f4f1ea" />
        {shades ? (
          <g>
            <path d="M110,118 L172,118 L166,146 L120,146 Z M188,118 L250,118 L240,146 L194,146 Z" fill="#05050a" stroke={C.turquoise} strokeWidth={3} />
            <line x1={172} y1={124} x2={188} y2={124} stroke={C.turquoise} strokeWidth={4} />
            <path d="M126,124 L140,124" stroke={C.turquoise} strokeWidth={3} opacity={0.8} />
          </g>
        ) : (
          <g>
            <ellipse cx={145} cy={130} rx={16} ry={18} fill="#c7f05a" />
            <ellipse cx={215} cy={130} rx={16} ry={18} fill="#c7f05a" />
            <ellipse cx={145} cy={130} rx={4} ry={14} fill="#111" />
            <ellipse cx={215} cy={130} rx={4} ry={14} fill="#111" />
          </g>
        )}
        <path d="M172,164 L188,164 L180,174 Z" fill={C.pink} />
        <path d="M180,174 Q170,186 160,180 M180,174 Q190,186 200,180" stroke="#333" strokeWidth={3} fill="none" />
        <path d="M120,168 L70,160 M120,176 L72,182 M240,168 L290,160 M240,176 L288,182" stroke="#ddd" strokeWidth={2} />
      </g>
      {/* paws */}
      <ellipse cx={130} cy={320 - pawL} rx={30} ry={18} fill="#f4f1ea" />
      <ellipse cx={230} cy={320 - pawR} rx={30} ry={18} fill="#f4f1ea" />
    </Svg>
  );
};

/* ================= COW (bride) ================= */

export const Cow: React.FC<{ x: number; y: number; scale?: number; veil?: boolean }> = ({ x, y, scale = 1, veil = true }) => {
  const { t } = useT();
  const chew = Math.sin(t * 6) * 4;
  return (
    <Svg x={x} y={y} w={400} h={460} scale={scale} vb="0 0 400 460">
      {veil && <path d="M110,90 C60,200 40,330 60,450 L340,450 C360,330 340,200 290,90 Z" fill="#ffffff" opacity={0.45} />}
      <path d="M80,460 C80,340 120,300 200,300 C280,300 320,340 320,460 Z" fill="#fbfbfb" />
      <path d="M120,360 C150,340 170,380 140,410 C110,420 100,380 120,360 Z M250,340 C290,330 300,380 270,400 C240,410 230,360 250,340 Z" fill="#1b1b1b" />
      {/* bouquet */}
      <g transform="translate(200 400)">
        {[[-30, 0, C.pink], [0, -16, C.pinkSoft], [30, 0, C.pink], [-14, 18, "#fff"], [16, 18, C.pinkSoft]].map(([bx, by, c], i) => (
          <circle key={i} cx={bx as number} cy={by as number} r={20} fill={c as string} stroke="#c2185b" strokeWidth={2} />
        ))}
        <path d="M-10,30 L0,70 L10,30" fill="#2e7d32" />
      </g>
      {/* head */}
      <g transform={`rotate(${Math.sin(t * 1.4) * 4} 200 200)`}>
        <path d="M86,120 C60,110 40,124 46,140 C70,146 90,140 104,132 Z" fill="#fbfbfb" stroke="#ddd" strokeWidth={2} />
        <path d="M314,120 C340,110 360,124 354,140 C330,146 310,140 296,132 Z" fill="#fbfbfb" stroke="#ddd" strokeWidth={2} />
        <path d="M130,70 C120,40 140,30 150,60 M270,70 C280,40 260,30 250,60" stroke="#e8d9b0" strokeWidth={14} strokeLinecap="round" fill="none" />
        <ellipse cx={200} cy={150} rx={104} ry={110} fill="#fbfbfb" />
        <path d="M120,90 C150,70 180,100 160,140 C130,150 110,120 120,90 Z" fill="#1b1b1b" />
        <ellipse cx={200} cy={226} rx={84} ry={52} fill="#ffb3c7" />
        <ellipse cx={170} cy={222} rx={10} ry={14} fill="#c2185b" />
        <ellipse cx={230} cy={222} rx={10} ry={14} fill="#c2185b" />
        <path d={`M170,${256 + chew} Q200,${266 + chew} 230,${256 + chew}`} stroke="#c2185b" strokeWidth={4} fill="none" />
        <ellipse cx={160} cy={150} rx={16} ry={20} fill="#1b1b1b" />
        <ellipse cx={240} cy={150} rx={16} ry={20} fill="#1b1b1b" />
        <circle cx={165} cy={144} r={6} fill="#fff" />
        <circle cx={245} cy={144} r={6} fill="#fff" />
        <path d="M140,124 l-8,-10 M150,120 l-4,-12 M250,120 l4,-12 M260,124 l8,-10" stroke="#1b1b1b" strokeWidth={3} />
        {veil && (
          <g>
            <path d="M120,72 C160,40 240,40 280,72" stroke={C.goldLight} strokeWidth={10} fill="none" />
            {[140, 170, 200, 230, 260].map((px) => (
              <circle key={px} cx={px} cy={58 - Math.sin(((px - 120) / 160) * Math.PI) * 12} r={7} fill="#fff" stroke={C.gold} strokeWidth={2} />
            ))}
          </g>
        )}
      </g>
    </Svg>
  );
};

/* ================= WEDDING COUPLE ================= */

export const Couple: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => {
  const { t } = useT();
  return (
    <Svg x={x} y={y} w={420} h={460} scale={scale} vb="0 0 420 460">
      {/* groom */}
      <g transform={`rotate(${Math.sin(t * 1.5) * 2} 130 460)`}>
        <path d="M60,460 L80,250 C90,220 170,220 180,250 L200,460 Z" fill="#11131f" />
        <path d="M118,240 L130,320 L142,240 Z" fill="#fff" />
        <path d="M122,246 L130,236 L138,246 L130,256 Z" fill={C.pink} />
        <circle cx={130} cy={180} r={50} fill="#f2c9b0" />
        <path d="M82,168 C84,120 176,120 178,168 C160,150 100,150 82,168 Z" fill="#3a2a1a" />
        <path d="M112,182 q6,-6 12,0 M136,182 q6,-6 12,0" stroke="#3a2a1a" strokeWidth={4} fill="none" />
        <path d="M118,204 Q130,214 142,204" stroke="#a5405a" strokeWidth={4} fill="none" />
      </g>
      {/* bride */}
      <g transform={`rotate(${-Math.sin(t * 1.5) * 2} 290 460)`}>
        <path d="M290,120 C230,200 220,360 230,460 L360,460 C370,360 350,200 290,120 Z" fill="#ffffff" opacity={0.55} />
        <path d="M200,460 C220,360 250,290 260,250 L320,250 C330,290 360,360 380,460 Z" fill="#fdfdfd" />
        <path d="M260,250 L320,250 L310,300 L270,300 Z" fill="#f1f1f1" />
        <circle cx={290} cy={180} r={48} fill="#f2c9b0" />
        <path d="M242,182 C238,130 342,130 338,182 C330,150 250,150 242,182 Z" fill="#b8742a" />
        <path d="M272,184 q6,-6 12,0 M296,184 q6,-6 12,0" stroke="#3a2a1a" strokeWidth={4} fill="none" />
        <path d="M278,206 Q290,216 302,206" stroke="#c2185b" strokeWidth={4} fill="none" />
        <path d="M250,140 C270,120 310,120 330,140" stroke={C.goldLight} strokeWidth={8} fill="none" />
        <g transform="translate(250 330)">
          {[[-14, 0], [6, -10], [16, 8], [-4, 14]].map(([bx, by], i) => (
            <circle key={i} cx={bx} cy={by} r={13} fill={i % 2 ? C.pink : C.pinkSoft} />
          ))}
        </g>
      </g>
      <path d="M200,80 c10,-14 30,-4 20,10 l-20,20 l-20,-20 c-10,-14 10,-24 20,-10 z" fill={C.pink} opacity={0.6 + 0.4 * Math.sin(t * 4)} />
    </Svg>
  );
};
