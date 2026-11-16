import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption, MinuteBadge } from "../Reel9320/Hud";
import { Sfx } from "../Reel9320/Sfx";
import { Dancer, DOCTOR, DPose, HUSBAND, townsfolk, TROFFEA } from "./Dancer";
import { cue, SCENE_FRAMES } from "./timeline";
import { Notes, Town } from "./Town";
import { B, body, display, L } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const G = L.ground;

/** 0 → overshoot → 1 pop-in scale starting at `at`. */
const popAt = (frame: number, at: number) => interpolate(frame - at, [0, 5, 11], [0, 1.15, 1], clamp);

const Big: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      left: 40,
      right: 40,
      textAlign: "center",
      fontFamily: display,
      color: B.white,
      WebkitTextStroke: `14px ${B.ink}`,
      paintOrder: "stroke fill",
      textShadow: "0 8px 0 rgba(0,0,0,0.35)",
      ...style,
    }}
  >
    {children}
  </div>
);

const Skull: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M 50 6 C 22 6 10 26 12 48 C 13 60 20 66 24 70 L 24 84 L 76 84 L 76 70 C 80 66 87 60 88 48 C 90 26 78 6 50 6 Z" fill="#F4F1E1" stroke={B.ink} strokeWidth={5} />
    <ellipse cx={34} cy={46} rx={11} ry={12} fill={B.ink} />
    <ellipse cx={66} cy={46} rx={11} ry={12} fill={B.ink} />
    <path d="M 50 58 L 44 68 L 56 68 Z" fill={B.ink} />
    {[36, 46, 56, 66].map((x) => (
      <line key={x} x1={x} y1={74} x2={x} y2={84} stroke={B.ink} strokeWidth={4} />
    ))}
  </svg>
);

const Heart: React.FC<{ size: number; fill: string }> = ({ size, fill }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M 50 88 C 20 66 6 50 6 32 C 6 16 18 6 32 6 C 42 6 48 12 50 18 C 52 12 58 6 68 6 C 82 6 94 16 94 32 C 94 50 80 66 50 88 Z" fill={fill} stroke={B.ink} strokeWidth={6} />
  </svg>
);

const Bubble: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M 12 14 H 88 Q 94 14 94 20 V 64 Q 94 70 88 70 H 40 L 20 90 L 24 70 H 12 Q 6 70 6 64 V 20 Q 6 14 12 14 Z" fill="#fff" stroke={B.ink} strokeWidth={6} />
    {[30, 50, 70].map((x) => (
      <circle key={x} cx={x} cy={42} r={6} fill={B.ink} />
    ))}
  </svg>
);

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(".", ",")}K` : `${Math.round(n)}`);

/* ───────────── 1. GANCHO: el primer challenge viral ───────────── */
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const fatal = cue("s01", 0.82);
  const isFatal = frame >= fatal;
  const likes = interpolate(frame, [8, fatal], [0, 400000], { ...clamp, easing: Easing.in(Easing.cubic) });
  const shake = isFatal ? Math.sin(frame * 3) * interpolate(frame - fatal, [0, 16], [22, 0], clamp) : 0;
  const cardIn = interpolate(frame, [0, 12], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return (
    <AbsoluteFill
      style={{
        background: isFatal
          ? "radial-gradient(circle at 50% 45%, #6B0F1E 0%, #12060A 80%)"
          : "radial-gradient(circle at 50% 45%, #5B2A9E 0%, #160A2E 80%)",
      }}
    >
      <Caption name="Gancho" delay={3} accentWords={isFatal ? "fatal" : "challenge viral"} accent={isFatal ? "#FF4D4D" : B.gold} style={{ top: 250, fontSize: 92 }}>
        {isFatal ? "...y acabó FATAL" : "El primer challenge viral"}
      </Caption>
      {/* vertical-video card */}
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 560,
          width: 700,
          height: 860,
          borderRadius: 54,
          border: `12px solid ${B.ink}`,
          overflow: "hidden",
          background: "linear-gradient(180deg, #7EC8F2, #F7D9A8)",
          scale: `${0.6 + 0.4 * cardIn}`,
          opacity: cardIn,
          translate: `${shake}px 0`,
          filter: isFatal ? "grayscale(0.9) brightness(0.7)" : undefined,
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 200, background: B.cobble1 }} />
        <Dancer {...TROFFEA} x={320} y={720} height={520} pose={isFatal ? "tired" : "frenzy"} mood={isFatal ? "exhausted" : "crazy"} speed={isFatal ? 0.6 : 1} />
        {!isFatal && <Notes x={300} y={420} count={4} />}
        {/* generic social UI */}
        <div style={{ position: "absolute", right: 22, bottom: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, fontFamily: body, fontWeight: 900, fontSize: 30, color: "#fff", textShadow: "0 3px 0 #000" }}>
          <div style={{ scale: `${1 + Math.max(0, Math.sin(frame * 0.5)) * 0.15}` }}>
            <Heart size={84} fill="#FF3B5C" />
          </div>
          <div>{fmt(likes)}</div>
          <Bubble size={78} />
          <div>{fmt(likes / 9)}</div>
        </div>
        <div style={{ position: "absolute", left: 28, bottom: 34, right: 140, fontFamily: body, fontWeight: 900, color: "#fff", textShadow: "0 3px 0 #000" }}>
          <div style={{ fontSize: 36 }}>@frau_troffea</div>
          <div style={{ fontSize: 30, opacity: 0.95 }}>#BaileChallenge · Estrasburgo</div>
        </div>
        <div style={{ position: "absolute", left: 24, top: 24, fontFamily: display, fontSize: 44, color: "#fff", background: B.red, padding: "0 18px", borderRadius: 12 }}>1518</div>
      </div>
      {isFatal && (
        <div style={{ position: "absolute", left: 540 - 160, top: 820, scale: `${popAt(frame, fatal)}`, rotate: `${Math.sin(frame * 0.3) * 6}deg` }}>
          <Skull size={320} />
        </div>
      )}
      <Sfx name="Whoosh" file="whoosh.wav" from={0} volume={0.6} />
      <Sfx name="Boom fatal" file="boom.wav" from={fatal} volume={1} />
    </AbsoluteFill>
  );
};

/* ───────────── 2. Frau Troffea sale a la calle ───────────── */
export const SceneTroffea: React.FC = () => {
  const frame = useCurrentFrame();
  const dance = cue("s02", 0.72);
  const walkEnd = dance - 14;
  const x = interpolate(frame, [0, walkEnd], [-120, 540], { ...clamp, easing: Easing.out(Easing.quad) });
  const pose: DPose = frame < walkEnd ? "walk" : frame < dance ? "idle" : "dance";
  const shocked = frame >= dance + 6;
  return (
    <AbsoluteFill>
      <Town sky="day" />
      <MinuteBadge text="JULIO 1518 · ESTRASBURGO" color={B.wine} top={L.badgeTop} />
      <Caption name="Sale a la calle" delay={frame >= dance ? dance : 8} accentWords={frame >= dance ? "bailar." : "Troffea"} accent={B.gold} style={{ top: L.captionTop + 20 }}>
        {frame >= dance ? "...y se pone a bailar." : "Frau Troffea sale a la calle"}
      </Caption>
      <Dancer {...townsfolk(1)} x={140} y={G - 40} height={250} pose="idle" mood={shocked ? "shock" : "neutral"} phase={10} />
      <Dancer {...townsfolk(4)} x={950} y={G - 30} height={260} pose="idle" mood={shocked ? "shock" : "neutral"} facing="left" phase={30} />
      <Dancer {...TROFFEA} x={x} y={G + 40} height={400} pose={pose} mood={frame >= dance ? "happy" : "neutral"} />
      {frame >= dance && <Notes x={540} y={1000} count={3} color={B.gold} />}
      <Sfx name="Ding" file="ding.wav" from={dance} volume={0.7} />
    </AbsoluteFill>
  );
};

/* ───────────── 3. Sin música, durante días ───────────── */
export const SceneDays: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = SCENE_FRAMES.s03;
  const progress = interpolate(frame, [10, dur - 10], [0, 1], clamp);
  const day = 1 + Math.min(5, Math.floor(progress * 6));
  const plead = cue("s03", 0.3);
  const keepsOn = cue("s03", 0.55);
  return (
    <AbsoluteFill>
      <Town cycle={progress * 3} />
      <Caption name="Sigue" delay={frame >= keepsOn ? keepsOn : 4} accentWords={frame >= keepsOn ? "sigue." : "música."} accent={B.gold} style={{ top: L.captionTop - 60 }}>
        {frame >= keepsOn ? "Ella sigue. Y sigue." : "Sin música. Sin motivo."}
      </Caption>
      {/* day counter */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center" }}>
        <div
          key={day}
          style={{
            fontFamily: display,
            fontSize: 110,
            color: B.ink,
            background: B.parchment,
            border: `8px solid ${B.ink}`,
            borderRadius: 26,
            padding: "0 40px",
            rotate: "-4deg",
            scale: `${interpolate(frame % 1000, [0, 1], [1, 1])}`,
          }}
        >
          DÍA {day}
        </div>
      </div>
      <Dancer {...HUSBAND} x={300} y={G + 40} height={330} pose={frame >= plead ? "plead" : "idle"} mood="worried" />
      {frame >= plead && (
        <div
          style={{
            position: "absolute",
            left: 90,
            top: 860,
            scale: `${popAt(frame, plead)}`,
            fontFamily: display,
            fontSize: 56,
            color: B.ink,
            background: "#fff",
            border: `6px solid ${B.ink}`,
            borderRadius: 40,
            padding: "10px 30px",
          }}
        >
          ¡PARA, MUJER!
        </div>
      )}
      <Dancer {...TROFFEA} x={720} y={G + 40} height={420} pose="frenzy" mood="crazy" facing="left" />
      {frame >= keepsOn && (
        <div style={{ position: "absolute", left: 640, top: 900, scale: `${popAt(frame, keepsOn)}`, fontFamily: display, fontSize: 64, color: B.gold, WebkitTextStroke: `10px ${B.ink}`, paintOrder: "stroke fill", rotate: "8deg" }}>
          NOP
        </div>
      )}
      <Sfx name="Whoosh días" file="whoosh.wav" from={4} volume={0.4} />
    </AbsoluteFill>
  );
};

/* ───────────── 4. De 1 a cientos ───────────── */
const CROWD = new Array(30).fill(0).map((_, i) => {
  const row = i < 8 ? 2 : i < 18 ? 1 : 0; // 0 = front
  const inRow = row === 2 ? i : row === 1 ? i - 8 : i - 18;
  const per = row === 2 ? 8 : row === 1 ? 10 : 12;
  return {
    i,
    row,
    x: 60 + (inRow + 0.5) * (960 / per) + (random(`cx${i}`) - 0.5) * 40,
    y: [G + 120, G + 10, G - 70][row],
    h: [250, 190, 140][row],
    threshold: random(`ct${i}`),
  };
});
export const SceneSpread: React.FC = () => {
  const frame = useCurrentFrame();
  const week = cue("s04", 0.12);
  const month = cue("s04", 0.5);
  const count =
    frame < month
      ? Math.round(interpolate(frame, [0, week + 10], [1, 34], { ...clamp, easing: Easing.out(Easing.cubic) }))
      : Math.round(interpolate(frame, [month, month + 30], [34, 400], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const share = interpolate(count, [1, 34, 400], [0, 0.35, 1], clamp);
  return (
    <AbsoluteFill>
      <Town sky="dusk" />
      <MinuteBadge text={frame >= month ? "AL MES" : "A LA SEMANA"} color={frame >= month ? B.red : B.teal} top={L.badgeTop} />
      <Big style={{ top: 360, fontSize: 250, color: frame >= month ? "#FF5A4D" : B.gold, scale: `${frame >= month ? popAt(frame, month) : 1}` }}>
        {frame >= month ? `~${count}` : count}
      </Big>
      <Big style={{ top: 640, fontSize: 70 }}>{frame >= month ? "BAILANDO SIN PARAR" : "BAILARINES"}</Big>
      {[...CROWD].reverse().map((c) =>
        c.threshold < share || c.i === 23 ? (
          <Dancer
            key={c.i}
            {...(c.i === 23 ? TROFFEA : townsfolk(c.i))}
            x={c.x}
            y={c.y}
            height={c.h}
            pose={c.i % 3 === 0 ? "frenzy" : "dance"}
            mood={c.i % 2 ? "crazy" : "happy"}
            phase={c.i * 7}
            facing={c.i % 2 ? "left" : "right"}
          />
        ) : null,
      )}
      <Sfx name="Boom mes" file="boom.wav" from={month} volume={0.7} />
      <Sfx name="Multitud" file="crowd.wav" from={month} volume={0.5} durationInFrames={120} />
    </AbsoluteFill>
  );
};

/* ───────────── 5. Los médicos: ¡más baile! ───────────── */
const Flame: React.FC = () => (
  <svg width={70} height={84} viewBox="0 0 70 84" style={{ verticalAlign: "middle" }}>
    <path d="M 35 2 C 44 22 66 32 62 56 C 58 76 44 82 35 82 C 18 82 6 70 8 52 C 10 38 20 34 22 18 C 30 26 30 34 32 38 C 38 28 38 14 35 2 Z" fill="#FF6A2B" stroke={B.ink} strokeWidth={4} />
    <path d="M 35 46 C 42 56 50 62 46 72 C 42 80 28 80 24 72 C 20 62 30 58 35 46 Z" fill={B.gold} />
  </svg>
);
export const SceneDoctors: React.FC = () => {
  const frame = useCurrentFrame();
  const diag = cue("s05", 0.42);
  const cureQ = cue("s05", 0.7);
  const stamp = cue("s05", 0.8);
  const paperIn = interpolate(frame, [cue("s05", 0.2), cue("s05", 0.2) + 12], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const stampScale = interpolate(frame - stamp, [0, 5, 10], [3, 0.9, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #6A4A7E 0%, #2A1A38 85%)" }}>
      {/* stone wall */}
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.18 }}>
        {new Array(24).fill(0).map((_, r) =>
          new Array(6).fill(0).map((__, c) => <rect key={`${r}-${c}`} x={c * 200 + (r % 2) * 100 - 100} y={r * 80} width={190} height={72} rx={10} fill="#000" />),
        )}
      </svg>
      <Caption name="Autoridades" delay={4} accentWords="autoridades?" accent={B.gold} style={{ top: 250 }}>
        ¿La solución de las autoridades?
      </Caption>
      {/* medical report */}
      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: 560,
          height: 560,
          background: B.parchment,
          border: `8px solid ${B.parchmentDark}`,
          borderRadius: 18,
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          padding: "34px 44px",
          fontFamily: body,
          fontWeight: 900,
          color: B.ink,
          rotate: "-2deg",
          opacity: paperIn,
          translate: `0 ${(1 - paperIn) * 200}px`,
        }}
      >
        <div style={{ fontFamily: display, fontSize: 48, textAlign: "center", color: B.wine }}>INFORME MÉDICO · 1518</div>
        <div style={{ fontSize: 40, marginTop: 30, opacity: frame >= diag ? 1 : 0 }}>Diagnóstico:</div>
        <div style={{ fontFamily: display, fontSize: 76, color: "#C2361E", scale: `${popAt(frame, diag)}`, transformOrigin: "left center" }}>
          SANGRE CALIENTE <Flame />
        </div>
        <div style={{ fontSize: 40, marginTop: 30, opacity: frame >= cureQ ? 1 : 0 }}>Tratamiento:</div>
      </div>
      {frame >= stamp && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 870,
            display: "flex",
            justifyContent: "center",
            scale: `${stampScale}`,
            zIndex: 2,
          }}
        >
          <div style={{ fontFamily: display, fontSize: 110, color: "#E3121B", border: "12px solid #E3121B", borderRadius: 22, padding: "0 30px", rotate: "-8deg", background: "rgba(255,255,255,0.65)" }}>
            ¡MÁS BAILE!
          </div>
        </div>
      )}
      <Dancer {...DOCTOR} x={250} y={G + 150} height={360} pose={frame >= stamp ? "dance" : "point"} mood={frame >= stamp ? "happy" : "neutral"} holding={frame >= stamp ? undefined : "scroll"} />
      <Dancer {...DOCTOR} hatColor="#1E4E6B" top="#3A2A1E" bottom="#3A2A1E" hairColor="#8A6A4A" x={830} y={G + 150} height={350} pose={frame >= stamp ? "dance" : "idle"} mood={frame >= stamp ? "happy" : "neutral"} facing="left" phase={20} />
      <Sfx name="Papel" file="whoosh.wav" from={cue("s05", 0.2)} volume={0.5} />
      <Sfx name="Sello" file="boom.wav" from={stamp} volume={0.9} />
    </AbsoluteFill>
  );
};

/* ───────────── 6. Rave medieval ───────────── */
const Check: React.FC = () => (
  <svg width={56} height={56} viewBox="0 0 56 56" style={{ verticalAlign: "middle", marginRight: 12 }}>
    <rect x={2} y={2} width={52} height={52} rx={12} fill="#36D96B" stroke={B.ink} strokeWidth={4} />
    <path d="M 14 29 L 24 39 L 43 17" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const SceneRave: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [
    { t: cue("s06", 0.12), label: "MÚSICOS" },
    { t: cue("s06", 0.32), label: "SALONES" },
    { t: cue("s06", 0.5), label: "ESCENARIO" },
  ];
  const neon = cue("s06", 0.7);
  const flicker = frame >= neon ? (frame - neon < 10 ? (Math.floor(frame / 2) % 2 ? 1 : 0.2) : 0.85 + 0.15 * Math.sin(frame * 0.8)) : 0;
  const beams = ["#FF3EA5", "#1FB5A8", "#7B4DFF", "#FFC93C"];
  return (
    <AbsoluteFill>
      <Town sky="night" lights dim={0.35} />
      {/* spotlights */}
      {beams.map((c, i) => (
        <div
          key={c}
          style={{
            position: "absolute",
            left: 140 + i * 260 - 60,
            top: 1240,
            width: 120,
            height: 1100,
            transformOrigin: "50% 0%",
            rotate: `${180 + Math.sin(frame * 0.06 + i * 1.7) * 32}deg`,
            background: `linear-gradient(180deg, ${c}CC 0%, ${c}00 90%)`,
            clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)",
            mixBlendMode: "screen",
            opacity: frame >= items[2].t ? 0.8 : 0.3,
          }}
        />
      ))}
      {/* stage */}
      <div style={{ position: "absolute", left: 160, right: 160, top: 1150, height: 90, background: "#7A4A26", border: `6px solid ${B.ink}`, borderRadius: 10 }}>
        {new Array(8).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: i * 95, top: 0, width: 6, bottom: 0, background: "rgba(0,0,0,0.25)" }} />
        ))}
      </div>
      <Dancer {...townsfolk(5)} hat="cap" hatColor="#FF3EA5" x={380} y={1160} height={230} pose="drum" mood="happy" />
      <Dancer {...townsfolk(7)} hat="hood" hatColor="#1FB5A8" x={700} y={1160} height={230} pose="pipe" mood="happy" facing="left" />
      <Notes x={540} y={900} count={6} color={B.gold} />
      {new Array(9).fill(0).map((_, i) => (
        <Dancer
          key={i}
          {...(i === 4 ? TROFFEA : townsfolk(i + 10))}
          x={70 + i * 118}
          y={G + 120 + (i % 2) * 60}
          height={i === 4 ? 320 : 270}
          pose={i % 2 ? "frenzy" : "dance"}
          mood={i % 3 ? "crazy" : "happy"}
          phase={i * 9}
          speed={1.2}
          facing={i % 2 ? "left" : "right"}
        />
      ))}
      <div style={{ position: "absolute", left: 120, top: 250, display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((it) =>
          frame >= it.t ? (
            <div key={it.label} style={{ fontFamily: display, fontSize: 72, color: "#fff", WebkitTextStroke: `10px ${B.ink}`, paintOrder: "stroke fill", scale: `${popAt(frame, it.t)}`, transformOrigin: "left center" }}>
              <Check />
              {it.label}
            </div>
          ) : null,
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 600,
          textAlign: "center",
          fontFamily: display,
          fontSize: 120,
          lineHeight: 1,
          color: "#FFE6F5",
          opacity: flicker,
          textShadow: "0 0 12px #FF3EA5, 0 0 30px #FF3EA5, 0 0 60px #FF3EA5",
          rotate: "-4deg",
        }}
      >
        RAVE
        <br />
        <span style={{ color: "#E6FFFB", textShadow: "0 0 12px #1FB5A8, 0 0 30px #1FB5A8, 0 0 60px #1FB5A8" }}>MEDIEVAL</span>
      </div>
      {items.map((it) => (
        <Sfx key={it.label} name={`Check ${it.label}`} file="ding.wav" from={it.t} volume={0.5} />
      ))}
      <Sfx name="Público rave" file="roar.wav" from={neon} volume={0.35} />
    </AbsoluteFill>
  );
};

/* ───────────── 7. Mala idea ───────────── */
export const SceneCollapse: React.FC = () => {
  const frame = useCurrentFrame();
  const feet = cue("s07", 0.18);
  const died = cue("s07", 0.66);
  const caption = frame >= died ? "Según las crónicas, algunos murieron." : frame >= feet ? "Pies destrozados. Agotados." : "Mala idea.";
  const delay = frame >= died ? died : frame >= feet ? feet : 2;
  return (
    <AbsoluteFill>
      <Town sky="grey" />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, rgba(0,0,0,0) 30%, rgba(0,0,10,0.75) 100%)" }} />
      <Caption name="Mala idea" delay={delay} accentWords={frame >= died ? "murieron." : frame >= feet ? "" : "mala idea."} accent="#FF5A4D" style={{ top: L.captionTop - 40, fontSize: frame >= feet ? 76 : 110 }}>
        {caption}
      </Caption>
      {new Array(6).fill(0).map((_, i) => {
        const fallAt = feet + 20 + i * 14;
        const fallen = frame >= fallAt && i % 2 === 0;
        return (
          <Dancer
            key={i}
            {...(i === 2 ? TROFFEA : townsfolk(i + 20))}
            x={120 + i * 170}
            y={G + 60 + (i % 2) * 70}
            height={280}
            pose={fallen ? "fallen" : "tired"}
            mood="exhausted"
            phase={i * 11}
            facing={i % 2 ? "left" : "right"}
          />
        );
      })}
      <div style={{ position: "absolute", left: 90, right: 90, top: 600, textAlign: "center", fontFamily: body, fontWeight: 800, fontSize: 32, color: "rgba(255,255,255,0.85)", opacity: interpolate(frame, [died, died + 10], [0, 1], clamp) }}>
        *El número de muertos no está claro: las fuentes no se ponen de acuerdo.
      </div>
      <Sfx name="Scratch" file="scratch.wav" from={0} volume={1} />
      <Sfx name="Latido" file="heartbeat.wav" from={feet} volume={0.6} durationInFrames={120} />
    </AbsoluteFill>
  );
};

/* ───────────── 8. Prohibida la música · San Vito ───────────── */
const Hills: React.FC = () => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4B3A7C 0%, #F2A06B 75%)" }}>
      <svg width={width} height={1920} style={{ position: "absolute" }}>
        <path d="M 0 1050 Q 300 820 620 960 T 1080 860 V 1920 H 0 Z" fill="#5E7A5A" />
        <path d="M 0 1250 Q 400 1080 760 1180 T 1080 1120 V 1920 H 0 Z" fill="#4C6B48" />
        <path d="M 0 1340 Q 540 1290 1080 1330 V 1920 H 0 Z" fill="#3E5A3C" />
        {/* shrine / chapel on the hill */}
        <g transform="translate(820 760)">
          <rect x={0} y={60} width={150} height={120} fill="#E9DCC6" stroke={B.ink} strokeWidth={5} />
          <polygon points="-14,64 75,0 164,64" fill="#8E3B2B" stroke={B.ink} strokeWidth={5} />
          <rect x={60} y={110} width={32} height={70} rx={14} fill="#4A2C1A" />
          <rect x={70} y={-50} width={12} height={56} fill={B.ink} />
          <rect x={56} y={-36} width={40} height={11} fill={B.ink} />
          <circle cx={76} cy={84} r={14} fill="#FFD66B" stroke={B.ink} strokeWidth={4} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
export const SceneShrine: React.FC = () => {
  const frame = useCurrentFrame();
  const toShrine = cue("s08", 0.3);
  const shoes = cue("s08", 0.62);
  const ended = cue("s08", 0.86);
  if (frame < toShrine) {
    const boardIn = interpolate(frame, [4, 16], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
    return (
      <AbsoluteFill>
        <Town sky="day" dim={0.25} />
        <Caption name="Cambio de plan" delay={3} accentWords="plan" accent={B.gold} style={{ top: L.captionTop - 60 }}>
          Cambio de plan
        </Caption>
        <div style={{ position: "absolute", left: 525, top: 1000, width: 30, height: 460, background: "#5A3418", border: `5px solid ${B.ink}` }} />
        <div
          style={{
            position: "absolute",
            left: 150,
            right: 150,
            top: 600,
            height: 520,
            background: B.parchment,
            border: `8px solid ${B.parchmentDark}`,
            borderRadius: 14,
            textAlign: "center",
            fontFamily: body,
            fontWeight: 900,
            color: B.ink,
            padding: 30,
            scale: `${boardIn}`,
            rotate: "2deg",
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          }}
        >
          <div style={{ fontFamily: display, fontSize: 70, color: B.wine }}>BANDO</div>
          <div style={{ fontSize: 46, marginTop: 18 }}>Queda prohibida</div>
          <div style={{ fontFamily: display, fontSize: 84, color: "#E3121B", lineHeight: 1.05 }}>LA MÚSICA Y EL BAILE</div>
          <div style={{ fontSize: 40, marginTop: 10 }}>en público</div>
          {[[40, 40], [770, 40], [40, 460], [770, 460]].map(([nx, ny]) => (
            <div key={`${nx}-${ny}`} style={{ position: "absolute", left: nx - 12, top: ny - 12, width: 24, height: 24, borderRadius: "50%", background: "#555", border: `4px solid ${B.ink}` }} />
          ))}
        </div>
        <Sfx name="Clavo" file="kick.wav" from={8} volume={0.8} />
      </AbsoluteFill>
    );
  }
  const walking = frame < ended;
  const t = frame - toShrine;
  return (
    <AbsoluteFill>
      <Hills />
      <MinuteBadge text="SANTUARIO DE SAN VITO" color={B.wine} top={L.badgeTop} />
      <Caption
        name="San Vito"
        delay={frame >= ended ? ended : frame >= shoes ? shoes : toShrine + 3}
        accentWords={frame >= ended ? "apagó." : frame >= shoes ? "rojos" : "vito"}
        accent={frame >= shoes && frame < ended ? "#FF4D4D" : B.gold}
        style={{ top: L.captionTop + 20 }}
      >
        {frame >= ended ? "Y el baile se apagó." : frame >= shoes ? "Zapatos rojos y oraciones" : "Rumbo a San Vito"}
      </Caption>
      {new Array(5).fill(0).map((_, i) => {
        const x = walking ? -140 + i * 170 + t * 2.4 : -140 + i * 170 + (ended - toShrine) * 2.4;
        return (
          <Dancer
            key={i}
            {...(i === 4 ? TROFFEA : townsfolk(i + 30))}
            x={x}
            y={G + 80 - i * 6}
            height={270}
            pose={walking ? "walk" : "pray"}
            mood={walking ? "exhausted" : "neutral"}
            phase={i * 13}
            glowShoes={frame >= shoes}
          />
        );
      })}
      {frame >= shoes && frame < ended && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", scale: `${popAt(frame, shoes)}` }}>
          <svg width={360} height={180} viewBox="0 0 360 180">
            {[0, 180].map((ox) => (
              <g key={ox} transform={`translate(${ox + 10} 30)`}>
                <path d="M 10 100 Q 10 40 60 40 L 90 40 Q 120 70 160 80 Q 170 120 150 130 L 20 130 Q 6 126 10 100 Z" fill="#E3121B" stroke={B.ink} strokeWidth={6} />
                <path d="M 60 55 v 30 M 45 70 h 30" stroke={B.gold} strokeWidth={6} />
              </g>
            ))}
          </svg>
        </div>
      )}
      <Sfx name="Campana" file="ding.wav" from={toShrine} volume={0.6} />
      <Sfx name="Zapatos" file="ding.wav" from={shoes} volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── 9. Teorías ───────────── */
const Bread: React.FC = () => (
  <svg width={130} height={110} viewBox="0 0 130 110">
    <path d="M 10 70 Q 10 20 65 18 Q 120 20 120 70 Q 120 96 65 96 Q 10 96 10 70 Z" fill="#D9A15A" stroke={B.ink} strokeWidth={5} />
    {[[40, 50], [70, 40], [90, 64], [55, 72]].map(([x, y]) => (
      <ellipse key={`${x}${y}`} cx={x} cy={y} rx={7} ry={4} fill="#3A2238" transform={`rotate(-30 ${x} ${y})`} />
    ))}
  </svg>
);
const Swirl: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={130} height={110} viewBox="0 0 130 110">
    <circle cx={65} cy={55} r={48} fill="#B9A3FF" stroke={B.ink} strokeWidth={5} />
    <path d="M 65 55 m -6 0 a 6 6 0 1 1 6 6 a 14 14 0 1 1 -14 -14 a 24 24 0 1 1 24 24 a 34 34 0 1 1 -34 -34" fill="none" stroke={B.ink} strokeWidth={5} transform={`rotate(${frame * 8} 65 55)`} />
  </svg>
);
const Ghost: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={130} height={120} viewBox="0 0 130 120" style={{ translate: `0 ${Math.sin(frame * 0.15) * 6}px` }}>
    <ellipse cx={65} cy={14} rx={30} ry={8} fill="none" stroke={B.gold} strokeWidth={6} />
    <path d="M 25 110 V 60 Q 25 24 65 24 Q 105 24 105 60 V 110 L 92 98 L 78 110 L 65 98 L 52 110 L 38 98 Z" fill="#F4F1E1" stroke={B.ink} strokeWidth={5} />
    <circle cx={52} cy={58} r={7} fill={B.ink} />
    <circle cx={78} cy={58} r={7} fill={B.ink} />
    <ellipse cx={65} cy={78} rx={7} ry={9} fill={B.ink} />
  </svg>
);
export const SceneTheories: React.FC = () => {
  const frame = useCurrentFrame();
  const nobody = cue("s09", 0.2);
  const cards = [
    { t: cue("s09", 0.32), icon: <Bread />, title: "¿HONGO EN EL PAN?", sub: "El cornezuelo del centeno", color: "#FFB547" },
    { t: cue("s09", 0.55), icon: <Swirl frame={frame} />, title: "¿HISTERIA COLECTIVA?", sub: "Hambre, enfermedad y miedo", color: "#9B7BFF" },
    { t: cue("s09", 0.86), icon: <Ghost frame={frame} />, title: "¿UNA MALDICIÓN?", sub: "Muchos culparon a San Vito", color: "#4DD6C8" },
  ];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #3A2466 0%, #120A24 85%)" }}>
      {new Array(10).fill(0).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: random(`qx${i}`) * 1000,
            top: 200 + ((random(`qy${i}`) * 1500 - frame * (1 + random(`qs${i}`) * 2)) % 1500 + 1500) % 1500,
            fontFamily: display,
            fontSize: 80 + random(`qz${i}`) * 120,
            color: "rgba(255,255,255,0.07)",
          }}
        >
          ?
        </div>
      ))}
      <Caption name="Por qué" delay={3} accentWords="pasó?" accent={B.gold} style={{ top: 250 }}>
        ¿Por qué pasó?
      </Caption>
      {frame >= nobody && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 410, display: "flex", justifyContent: "center", scale: `${interpolate(frame - nobody, [0, 5, 10], [2.6, 0.92, 1], clamp)}` }}>
          <div style={{ fontFamily: display, fontSize: 92, color: "#FF4D4D", border: "10px solid #FF4D4D", borderRadius: 20, padding: "0 30px", rotate: "-5deg" }}>NADIE LO SABE</div>
        </div>
      )}
      {cards.map((c, i) => {
        const k = interpolate(frame - c.t, [0, 12], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
        return (
          <div
            key={c.title}
            style={{
              position: "absolute",
              left: 70,
              right: 70,
              top: 640 + i * 250,
              height: 220,
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: "0 30px",
              background: "rgba(255,255,255,0.96)",
              borderRadius: 30,
              border: `8px solid ${c.color}`,
              boxShadow: "0 16px 0 rgba(0,0,0,0.3)",
              opacity: k,
              translate: `${(1 - k) * (i % 2 ? 600 : -600)}px 0`,
              rotate: `${i % 2 ? 1.5 : -1.5}deg`,
            }}
          >
            {c.icon}
            <div>
              <div style={{ fontFamily: display, fontSize: 60, color: B.ink, lineHeight: 1.05 }}>{c.title}</div>
              <div style={{ fontFamily: body, fontWeight: 800, fontSize: 36, color: "#4A4060" }}>{c.sub}</div>
            </div>
          </div>
        );
      })}
      <Sfx name="Sello nadie" file="boom.wav" from={nobody} volume={0.7} />
      {cards.map((c) => (
        <Sfx key={c.title} name={`Carta ${c.title}`} file="whoosh.wav" from={c.t} volume={0.5} />
      ))}
    </AbsoluteFill>
  );
};

/* ───────────── 10. CTA ───────────── */
const Foot: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={300} height={200} viewBox="0 0 300 200" style={{ overflow: "visible" }}>
    <g transform={`rotate(${-Math.max(0, Math.sin(frame * 0.6)) * 16} 40 170)`}>
      <path d="M 20 170 Q 10 110 70 100 L 150 96 Q 250 110 270 160 Q 276 180 250 182 L 30 182 Q 18 180 20 170 Z" fill="#E3121B" stroke={B.ink} strokeWidth={7} />
      <path d="M 70 100 Q 60 40 90 20 L 140 20 Q 150 60 150 96" fill={B.parchment} stroke={B.ink} strokeWidth={7} />
    </g>
    <path d="M 0 192 H 300" stroke={B.ink} strokeWidth={8} strokeLinecap="round" />
  </svg>
);
export const SceneCta: React.FC = () => {
  const frame = useCurrentFrame();
  const comments = cue("s10", 0.16);
  const foot = cue("s10", 0.45);
  const stop = cue("s10", 0.78);
  const stopped = frame >= stop;
  return (
    <AbsoluteFill>
      <Town sky="night" lights dim={0.2} />
      <Caption
        name="CTA"
        delay={stopped ? stop : frame >= foot ? foot : 3}
        accentWords={stopped ? "para." : frame >= foot ? "pie?" : "crees?"}
        accent={stopped ? "#FF4D4D" : B.gold}
        style={{ top: 250, fontSize: stopped ? 110 : 92 }}
      >
        {stopped ? "PARA. Por si acaso." : frame >= foot ? "¿Moviendo el pie?" : "¿Tú qué crees?"}
      </Caption>
      {frame >= comments && frame < foot && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, scale: `${popAt(frame, comments)}` }}>
          <Bubble size={130} />
          <div style={{ fontFamily: display, fontSize: 64, color: "#fff", WebkitTextStroke: `10px ${B.ink}`, paintOrder: "stroke fill" }}>Te leo abajo</div>
        </div>
      )}
      {frame >= foot && !stopped && (
        <div style={{ position: "absolute", left: 390, top: 570, scale: `${popAt(frame, foot)}` }}>
          <Foot frame={frame} />
        </div>
      )}
      <Dancer {...TROFFEA} x={540} y={G + 60} height={560} pose={stopped ? "stop" : "dance"} mood={stopped ? "wink" : "happy"} speed={stopped ? 0 : 1.1} />
      {!stopped && <Notes x={540} y={1000} count={5} color={B.gold} />}
      <Sfx name="Burbuja" file="ding.wav" from={comments} volume={0.5} />
      <Sfx name="Stop" file="scratch.wav" from={stop} volume={0.9} />
    </AbsoluteFill>
  );
};
