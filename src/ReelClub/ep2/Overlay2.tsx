import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame } from "remotion";
import { Bubble, Caption, Heart, OUTLINE, Stamp, usePop } from "../Overlay";
import { body, CLUB, display } from "../theme";
import { money } from "../timeline";
import { BEATS, GOAL, localAt, RAISED, Scene2, scene2, SCENES2 } from "./timeline";

const Check: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill="#1F9D55" stroke="#0A0F1A" strokeWidth="1.5" />
    <path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Lock: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <rect x="4" y="10" width="16" height="12" rx="3" fill="#8A93A6" stroke="#0A0F1A" strokeWidth="1.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#0A0F1A" strokeWidth="2" />
  </svg>
);

/** Team crest for "Los Papois". */
export const Crest: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 200 230">
    <path d="M100 6 L190 30 V110 C190 170 145 205 100 224 C55 205 10 170 10 110 V30 Z" fill={CLUB.navy} stroke="#0A0F1A" strokeWidth="10" />
    <path d="M100 18 L178 39 V110 C178 162 140 193 100 210 Z" fill={CLUB.red} />
    <path d="M100 6 L190 30 V110 C190 170 145 205 100 224 C55 205 10 170 10 110 V30 Z" fill="none" stroke={CLUB.gold} strokeWidth="6" />
    <circle cx="100" cy="92" r="34" fill="#fff" stroke="#0A0F1A" strokeWidth="5" />
    <path d="M100 66l10 8-4 12h-12l-4-12zM76 86l11-4 6 11-6 10-11-3zM124 86l-11-4-6 11 6 10 11-3z" fill="#0A0F1A" />
    <rect x="22" y="138" width="156" height="44" rx="10" fill={CLUB.gold} stroke="#0A0F1A" strokeWidth="5" />
    <text x="100" y="170" textAnchor="middle" fontFamily="Lilita One" fontSize="30" fill="#0A0F1A">
      LOS PAPOIS
    </text>
  </svg>
);

const Banner: React.FC<{ children: React.ReactNode; at?: number; bg?: string; size?: number; rot?: number }> = ({
  children,
  at = 2,
  bg = CLUB.navy,
  size = 80,
  rot = -3,
}) => {
  const p = usePop(at);
  return (
    <div
      style={{
        display: "inline-block",
        fontFamily: display,
        fontSize: size,
        color: "#fff",
        background: bg,
        border: "8px solid #0A0F1A",
        borderRadius: 26,
        padding: "6px 34px",
        transform: `scale(${p}) rotate(${rot}deg)`,
        boxShadow: "0 12px 0 #0A0F1A",
      }}
    >
      {children}
    </div>
  );
};

const Center: React.FC<{ top: number; children: React.ReactNode }> = ({ top, children }) => (
  <div style={{ position: "absolute", top, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>{children}</div>
);

/* ---------- scenes ---------- */

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const from = localAt("hook", BEATS.recaud);
  const n = interpolate(frame, [from, from + 66], [0, RAISED], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const p = usePop(from, 8);
  const pulse = 1 + Math.abs(Math.sin(frame * 0.25)) * 0.05;
  return (
    <Center top={250}>
      <Banner bg={CLUB.red} size={96}>
        ¡LO LOGRAMOS!
      </Banner>
      <div style={{ marginTop: 26, fontFamily: display, fontSize: 230, lineHeight: 1, color: CLUB.gold, transform: `scale(${p * pulse}) rotate(2deg)`, ...OUTLINE, WebkitTextStroke: "16px #0A0F1A" }}>
        {money(n)}
      </div>
    </Center>
  );
};

const Porteria: React.FC = () => {
  const goalAt = localAt("porteria", BEATS.goal);
  const p = usePop(goalAt, 8);
  return (
    <>
      <Center top={420}>
        <div
          style={{
            transform: `scale(${p}) rotate(-3deg)`,
            background: CLUB.gold,
            border: "9px solid #0A0F1A",
            borderRadius: 34,
            padding: "14px 44px",
            boxShadow: "0 16px 0 #0A0F1A",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <Check size={90} />
          <div style={{ fontFamily: display, fontSize: 90, color: "#fff", ...OUTLINE }}>PORTERÍA NUEVA</div>
        </div>
      </Center>
      <Stamp text="PAGADA" at={goalAt + 14} color="#1F9D55" top={600} />
    </>
  );
};

const Nombre: React.FC = () => {
  const frame = useCurrentFrame();
  const card = usePop(4);
  const crestAt = localAt("nombre", BEATS.papois);
  const crest = usePop(crestAt, 8);
  const spin = interpolate(frame, [crestAt, crestAt + 14], [-200, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) });
  return (
    <Center top={240}>
      <div
        style={{
          width: 880,
          background: "#fff",
          border: "8px solid #0A0F1A",
          borderRadius: 34,
          padding: "18px 26px",
          display: "flex",
          alignItems: "center",
          gap: 22,
          transform: `scale(${card}) rotate(-2deg)`,
          boxShadow: "0 14px 0 #0A0F1A",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: -34, right: 30, background: CLUB.gold, border: "6px solid #0A0F1A", borderRadius: 18, padding: "0 18px", fontFamily: display, fontSize: 40, color: CLUB.ink }}>
          GANADOR
        </div>
        <div style={{ width: 92, height: 92, borderRadius: 46, background: "#7B5CFF", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: display, fontSize: 56, color: "#fff" }}>
          S
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: body, fontWeight: 900, fontSize: 34, color: "#556" }}>@SoyDamiánblox</div>
          <div style={{ fontFamily: display, fontSize: 66, color: CLUB.ink }}>Los Papois</div>
        </div>
        <Heart size={80} />
      </div>
      <div style={{ marginTop: 40, transform: `scale(${crest}) rotate(${spin}deg)` }}>
        <Crest size={300} />
      </div>
    </Center>
  );
};

const Problema: React.FC = () => (
  <>
    <Center top={270}>
      <Banner bg={CLUB.navy} size={74}>
        PLANTILLA ACTUAL
      </Banner>
    </Center>
    <Stamp text="0 JUGADORES" at={localAt("problema", BEATS.jugadores)} top={430} />
  </>
);

const Once: React.FC = () => {
  const frame = useCurrentFrame();
  const filled = Math.min(11, Math.max(0, Math.floor((frame - 8) / 4) + 1));
  const ribbon = usePop(localAt("once", BEATS.titular), 8);
  return (
    <Center top={250}>
      <Banner bg={CLUB.red} size={64}>
        <div style={{ textAlign: "center", lineHeight: 1.05 }}>
          LOS PRIMEROS
          <br />
          11 COMENTARIOS
        </div>
      </Banner>
      <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
        {Array.from({ length: 11 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 66,
              height: 66,
              borderRadius: 33,
              border: "5px solid #0A0F1A",
              background: i < filled ? CLUB.gold : "rgba(255,255,255,0.35)",
              fontFamily: display,
              fontSize: 40,
              color: CLUB.ink,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${i < filled ? 1 : 0.8})`,
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 26, fontFamily: display, fontSize: 104, color: CLUB.gold, transform: `scale(${ribbon}) rotate(2deg)`, ...OUTLINE }}>
        = ONCE TITULAR
      </div>
    </Center>
  );
};

const Rival: React.FC = () => {
  const frame = useCurrentFrame();
  const pill = usePop(2);
  const left = usePop(8, 9);
  const right = usePop(16, 9);
  const vs = usePop(22, 7);
  const up = usePop(localAt("rival", BEATS.ascend), 8);
  const bounce = Math.sin(frame * 0.3) * 8;
  return (
    <Center top={240}>
      <div style={{ transform: `scale(${pill})`, background: "#fff", border: "6px solid #0A0F1A", borderRadius: 40, padding: "4px 30px", fontFamily: display, fontSize: 52, color: CLUB.red }}>
        PRÓXIMO VIDEO
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 24 }}>
        <div style={{ transform: `translateX(${(1 - left) * -600}px)` }}>
          <Crest size={230} />
        </div>
        <div style={{ fontFamily: display, fontSize: 120, color: "#fff", transform: `scale(${vs}) rotate(-8deg)`, ...OUTLINE }}>VS</div>
        <div style={{ transform: `translateX(${(1 - right) * 600}px)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg width={230} height={265} viewBox="0 0 200 230">
            <path d="M100 6 L190 30 V110 C190 170 145 205 100 224 C55 205 10 170 10 110 V30 Z" fill="#4A5160" stroke="#0A0F1A" strokeWidth="10" />
            <text x="100" y="140" textAnchor="middle" fontFamily="Lilita One" fontSize="120" fill="#C9CED6">
              ?
            </text>
          </svg>
        </div>
      </div>
      <div style={{ marginTop: 14, background: "#4A5160", border: "6px solid #0A0F1A", borderRadius: 20, padding: "4px 26px", fontFamily: display, fontSize: 56, color: "#fff", transform: `scale(${right})` }}>
        RIVAL DE 3ª DIVISIÓN
      </div>
      <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10, transform: `scale(${up}) translateY(${-bounce}px)` }}>
        <svg width={90} height={90} viewBox="0 0 24 24">
          <path d="M12 2l9 10h-5v10H8V12H3z" fill="#2ECC71" stroke="#0A0F1A" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <div style={{ fontFamily: display, fontSize: 96, color: "#2ECC71", ...OUTLINE }}>ASCENSO</div>
      </div>
    </Center>
  );
};

const ROWS: { label: string; done: boolean }[] = [
  { label: "PORTERÍA", done: true },
  { label: "CÉSPED", done: false },
  { label: "FOCOS", done: false },
  { label: "VESTUARIO", done: false },
  { label: "GRADA", done: false },
];

const Meta: React.FC = () => {
  const frame = useCurrentFrame();
  const panel = usePop(2, 12);
  const fill = interpolate(frame, [10, 40], [0, RAISED / GOAL], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const big = usePop(localAt("meta", BEATS.metaNum), 8);
  return (
    <Center top={250}>
      <div style={{ width: 900, background: "rgba(10,15,26,0.88)", border: "6px solid #fff", borderRadius: 34, padding: "22px 32px", transform: `scale(${panel})` }}>
        <div style={{ fontFamily: body, fontWeight: 900, fontSize: 38, color: "#fff", letterSpacing: 2 }}>META DEL CLUB</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <div style={{ fontFamily: display, fontSize: 90, color: CLUB.gold }}>{money(RAISED)}</div>
          <div style={{ fontFamily: display, fontSize: 60, color: "#fff", transform: `scale(${0.6 + big * 0.4})`, transformOrigin: "left center" }}>/ {money(GOAL)}</div>
        </div>
        <div style={{ height: 30, background: "#2A3346", borderRadius: 15, overflow: "hidden" }}>
          <div style={{ width: `${fill * 100}%`, height: "100%", background: `linear-gradient(90deg, ${CLUB.red}, ${CLUB.gold})` }} />
        </div>
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          {ROWS.map((r, i) => {
            const t = spring({ frame: frame - 14 - i * 4, fps: 30, config: { damping: 14 } });
            return (
              <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 16, opacity: t, transform: `translateX(${(1 - t) * 60}px)` }}>
                {r.done ? <Check size={46} /> : <Lock size={46} />}
                <div style={{ fontFamily: display, fontSize: 46, color: r.done ? "#fff" : "#8A93A6" }}>{r.label}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ marginTop: 26, background: "#fff", border: "6px solid #0A0F1A", borderRadius: 60, padding: "8px 32px", display: "flex", alignItems: "center", gap: 14, fontFamily: display, fontSize: 50, color: CLUB.ink, transform: `scale(${usePop(30)})` }}>
        <Heart size={54} /> $1 <span style={{ color: "#aab" }}>·</span> <Bubble size={54} /> $10
      </div>
    </Center>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(2, 8);
  const beat = 1 + Math.abs(Math.sin(frame * 0.18)) * 0.06;
  const arrow = Math.sin(frame * 0.35) * 18;
  const sub = usePop(14);
  return (
    <>
      <Center top={420}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, transform: `scale(${p * beat}) rotate(-3deg)` }}>
          <Bubble size={150} />
          <div style={{ fontFamily: display, fontSize: 132, color: "#fff", lineHeight: 1, ...OUTLINE }}>
            ¡COMENTA
            <br />
            <span style={{ color: CLUB.gold }}>YA!</span>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <div style={{ transform: `scale(${sub})` }}>
            <Banner at={14} bg={CLUB.red} size={70} rot={2}>
              ENTRA AL ONCE
            </Banner>
          </div>
        </div>
      </Center>
      <div style={{ position: "absolute", top: 1060, right: 150 + arrow, display: "flex", alignItems: "center", gap: 10, opacity: sub }}>
        <div style={{ fontFamily: display, fontSize: 58, color: "#fff", ...OUTLINE, WebkitTextStroke: "9px #0A0F1A" }}>AQUÍ</div>
        <svg width={110} height={80} viewBox="0 0 110 80">
          <path d="M5 30h65V8l35 32-35 32V50H5z" fill={CLUB.gold} stroke="#0A0F1A" strokeWidth={6} strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
};

/** Small fundraising meter, kept on screen in the scenes without a top card. */
const MiniHud: React.FC = () => {
  const frame = useCurrentFrame();
  const s = scene2("porteria");
  const show = frame >= s.start && frame < s.start + s.dur;
  if (!show) return null;
  return (
    <div style={{ position: "absolute", top: 1150, left: 260, right: 260, background: "rgba(10,15,26,0.82)", border: "4px solid #fff", borderRadius: 22, padding: "8px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: display, fontSize: 34, color: "#fff" }}>
        <span>META</span>
        <span style={{ color: CLUB.gold }}>
          {money(RAISED)} / {money(GOAL)}
        </span>
      </div>
      <div style={{ height: 14, background: "#2A3346", borderRadius: 7, overflow: "hidden", marginTop: 4 }}>
        <div style={{ width: `${(RAISED / GOAL) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${CLUB.red}, ${CLUB.gold})` }} />
      </div>
    </div>
  );
};

const GRAPHICS: Record<Scene2["id"], React.FC> = {
  hook: Hook,
  porteria: Porteria,
  nombre: Nombre,
  problema: Problema,
  once: Once,
  rival: Rival,
  meta: Meta,
  cta: Cta,
};

export const Overlay2: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.45) 100%)",
      }}
    />
    {SCENES2.map((s) => {
      const G = GRAPHICS[s.id];
      return (
        <Sequence key={s.id} name={`Gráficos ${s.index + 1} ${s.id}`} from={s.start} durationInFrames={s.dur}>
          <G />
          <Caption scene={s} />
        </Sequence>
      );
    })}
    <MiniHud />
  </AbsoluteFill>
);
