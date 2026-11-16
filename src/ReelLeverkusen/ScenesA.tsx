import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Character } from "../Reel9320/Character";
import { GOAL_FRAME, GoalPlay } from "../Reel9320/GoalPlay";
import { Caption, MinuteBadge } from "../Reel9320/Hud";
import { Sfx } from "../Reel9320/Sfx";
import { Confetti, Flash, Stadium } from "../Reel9320/Stage";
import { body, C, display, LAYOUT } from "../Reel9320/theme";
import { BigWord, LossChip, MatchBoard, Stamp, VhsRewind } from "./Hud";
import {
  BALLACK,
  BAYARENA_CROWD,
  BAYERN_A,
  BAYERN_B,
  BAYERN_CROWD,
  FRIMPONG,
  GRIMALDO,
  K,
  LEV_A,
  RIVAL_KEEPER,
  WIRTZ,
  XABI,
  XHAKA,
} from "./Players";
import { beat, HOOK_FLIP, LATE_GOAL } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const G = LAYOUT.ground;
const pop = (frame: number, at: number) =>
  interpolate(frame - at, [0, 6, 12], [0, 1.15, 1], { ...clamp, easing: Easing.out(Easing.quad) });

/** "NEVERKUSEN" where the N can fall off and an L slam in its place. */
export const NeverWord: React.FC<{ swapAt?: number; top: number; size?: number; shake?: number }> = ({
  swapAt,
  top,
  size = 170,
  shake = 0,
}) => {
  const frame = useCurrentFrame();
  const t = swapAt === undefined ? -1 : frame - swapAt;
  const swapped = t >= 0;
  const fall = swapped ? interpolate(t, [0, 16], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) }) : 0;
  const lScale = swapped ? interpolate(t, [2, 7, 13], [3, 0.9, 1], clamp) : 0;
  const letter: React.CSSProperties = { display: "inline-block" };
  return (
    <BigWord top={top} size={size} shake={shake} color={swapped ? C.white : "#C9CED8"} glow={swapped ? K.lev : undefined}>
      <span style={{ ...letter, position: "relative" }}>
        {/* the L takes the slot in the flow so the word stays tight; the N falls away on top */}
        {swapped && <span style={{ ...letter, scale: `${lScale}`, color: K.lev }}>L</span>}
        <span
          style={{
            ...letter,
            ...(swapped ? { position: "absolute", left: 0, top: 0 } : {}),
            translate: `0 ${fall * 1600}px`,
            rotate: `${fall * 80}deg`,
            opacity: swapped ? interpolate(t, [0, 14], [1, 0], clamp) : 1,
            color: swapped ? "#8A909C" : undefined,
          }}
        >
          N
        </span>
      </span>
      <span style={letter}>EVERKUSEN</span>
    </BigWord>
  );
};

/* ───────────── 1. GANCHO: NEVERKUSEN → LEVERKUSEN ───────────── */
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const flipped = frame >= HOOK_FLIP;
  const tension = interpolate(frame, [HOOK_FLIP - 40, HOOK_FLIP], [0, 1], clamp);
  const shake = !flipped
    ? Math.sin(frame * 3.1) * tension * 8
    : Math.sin(frame * 3) * interpolate(frame - HOOK_FLIP, [0, 14], [22, 0], clamp);
  const zoom = flipped ? 1 : interpolate(frame, [0, HOOK_FLIP], [1, 1.08], clamp);
  return (
    <AbsoluteFill
      style={{
        background: flipped
          ? `radial-gradient(circle at 50% 40%, #B0141B 0%, #2A0507 75%)`
          : `radial-gradient(circle at 50% 40%, #2C313C 0%, #0B0D12 75%)`,
      }}
    >
      <AbsoluteFill style={{ scale: `${zoom}` }}>
        <div
          style={{
            position: "absolute",
            top: 270,
            width: "100%",
            textAlign: "center",
            fontFamily: body,
            fontWeight: 900,
            fontSize: 42,
            letterSpacing: 5,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          {flipped ? "BUNDESLIGA · 2023/24" : "BAYER · DESDE 1904 · 0 LIGAS"}
        </div>
        <NeverWord top={360} swapAt={HOOK_FLIP} shake={shake} />
        <Caption
          name="Gancho"
          delay={flipped ? HOOK_FLIP + 6 : beat("s01", 0.55)}
          accentWords={flipped ? "nunca" : "nunca nada"}
          accent={flipped ? K.gold : "#FF5A5F"}
          style={{ top: 600 }}
        >
          {flipped ? "Hasta que dejaron de perder" : "El equipo que nunca gana nada"}
        </Caption>
        {flipped ? (
          <Character {...WIRTZ} x={540} y={1420} height={440} pose="celebrate" mood="happy" holding="trophy" />
        ) : (
          <Character {...BALLACK} x={540} y={1420} height={440} pose="sad" mood="sad" />
        )}
      </AbsoluteFill>
      <Confetti start={HOOK_FLIP} colors={[K.lev, C.white, K.black, K.gold]} count={70} />
      <Flash amount={interpolate(frame, [HOOK_FLIP, HOOK_FLIP + 2, HOOK_FLIP + 10], [0, 0.9, 0], clamp)} />
      {/* red vignette while the curse hangs over them */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle, transparent 45%, rgba(160,0,0,0.55) 100%)",
          opacity: flipped ? 0 : 0.4 + tension * 0.6,
        }}
      />
      <Sfx name="Latido" file="heartbeat.wav" from={0} durationInFrames={HOOK_FLIP} volume={0.8} />
      <Sfx name="Boom L" file="boom.wav" from={HOOK_FLIP} volume={1} />
      <Sfx name="Grito BayArena" file="roar.wav" from={HOOK_FLIP} volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── 2. REBOBINADO: 2002, TRES VECES SEGUNDOS ───────────── */
const LOSSES_2002 = [
  { label: "BUNDESLIGA", detail: "2º · SE ESCAPA AL FINAL", at: 0.42 },
  { label: "COPA", detail: "FINAL PERDIDA", at: 0.62 },
  { label: "CHAMPIONS", detail: "FINAL PERDIDA", at: 0.78 },
];
export const Scene2002: React.FC = () => {
  const frame = useCurrentFrame();
  const vhs = interpolate(frame, [0, 22, 28], [1, 1, 0], clamp);
  const jitter = vhs > 0 ? Math.sin(frame * 7) * 14 * vhs : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ translate: `${jitter}px 0`, filter: `sepia(${0.35 + vhs * 0.4}) saturate(${1 - vhs * 0.5})` }}>
        <Stadium crowd={BAYARENA_CROWD} hype={0.1} mood="dark" />
        <BigWord top={235} size={190} scale={pop(frame, 4)} color={K.gold}>
          2002
        </BigWord>
        {LOSSES_2002.map((l, i) => {
          const at = beat("s02", l.at);
          const s = pop(frame, at);
          return (
            <div
              key={l.label}
              style={{
                position: "absolute",
                left: 90,
                right: 90,
                top: 480 + i * 124,
                height: 104,
                display: "flex",
                alignItems: "center",
                borderRadius: 20,
                background: "rgba(8,10,16,0.92)",
                border: "4px solid rgba(255,255,255,0.18)",
                scale: `${s}`,
                fontFamily: body,
                fontWeight: 900,
                color: C.white,
                overflow: "hidden",
              }}
            >
              <div style={{ width: 16, alignSelf: "stretch", background: K.lev }} />
              <div style={{ flex: 1, paddingLeft: 24 }}>
                <div style={{ fontFamily: display, fontSize: 46, lineHeight: 1 }}>{l.label}</div>
                <div style={{ fontSize: 26, opacity: 0.7 }}>{l.detail}</div>
              </div>
              <div
                style={{
                  width: 104,
                  alignSelf: "stretch",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#E8222E",
                  fontFamily: display,
                  fontSize: 70,
                }}
              >
                ✗
              </div>
            </div>
          );
        })}
        <Caption name="Un mes" delay={beat("s02", 0.85)} accentWords="mes" accent={K.gold} style={{ top: 870, fontSize: 80 }}>
          Todo en un mes
        </Caption>
        <Character {...BALLACK} x={540} y={G} height={300} pose="sad" mood="sad" />
        <LossChip label="TÍTULOS:" value="0" color="#666C78" pulseAt={beat("s02", 0.8)} />
      </AbsoluteFill>
      <VhsRewind amount={vhs} />
      <Sfx name="Rebobinado" file="whoosh.wav" from={0} volume={0.9} />
      {LOSSES_2002.map((l) => (
        <Sfx key={l.label} name={`Golpe ${l.label}`} file="groan.wav" from={beat("s02", l.at)} volume={0.35} durationInFrames={40} />
      ))}
    </AbsoluteFill>
  );
};

/* ───────────── 3. ARRIBA, EL BAYERN: 11 LIGAS SEGUIDAS ───────────── */
export const SceneBayern11: React.FC = () => {
  const frame = useCurrentFrame();
  const start = beat("s03", 0.5);
  const count = Math.max(0, Math.min(11, Math.floor((frame - start) / 3) + 1));
  return (
    <AbsoluteFill>
      <Stadium crowd={BAYERN_CROWD} hype={0.7} />
      <BigWord top={240} size={210} color={K.silver} scale={frame >= start ? interpolate((frame - start) % 3, [0, 1, 2], [1.06, 1, 1]) : 0}>
        {count}
      </BigWord>
      <div style={{ position: "absolute", left: 90, right: 90, top: 480, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
        {new Array(11).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${K.silver} 45%, #8C95A3 100%)`,
              border: `5px solid ${C.ink}`,
              scale: `${pop(frame, start + i * 3)}`,
            }}
          />
        ))}
      </div>
      <Caption name="Bayern" delay={4} accentWords="Bayern 11" accent={K.bayern} style={{ top: 690 }}>
        Bayern: 11 ligas seguidas
      </Caption>
      <Character {...BAYERN_A} x={360} y={G} height={330} pose="celebrate" mood="happy" holding="trophy" />
      <Character {...BAYERN_B} x={560} y={G} height={290} pose="celebrate" mood="happy" phase={9} />
      <Character {...LEV_A} x={840} y={G} height={260} pose="sad" mood="sad" facing="left" />
      <Sfx name="Ding plato" file="ding.wav" from={start} volume={0.35} />
    </AbsoluteFill>
  );
};

/* ───────────── 4. OCT 2022: EN DESCENSO, LLEGA XABI ───────────── */
export const SceneXabi: React.FC = () => {
  const frame = useCurrentFrame();
  const arrive = beat("s04", 0.74);
  const here = frame >= arrive;
  const table = interpolate(frame, [beat("s04", 0.3), beat("s04", 0.3) + 10], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const xx = interpolate(frame, [arrive - 10, arrive + 22], [1180, 600], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill>
      <Stadium crowd={BAYARENA_CROWD} hype={here ? 0.6 : 0.1} mood={here ? "normal" : "dark"} />
      <MinuteBadge text="OCTUBRE 2022" color={K.lev} top={250} />
      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: 380,
          borderRadius: 22,
          background: "rgba(8,10,16,0.93)",
          border: "4px solid rgba(255,255,255,0.16)",
          fontFamily: body,
          fontWeight: 900,
          color: C.white,
          fontSize: 38,
          opacity: table,
          scale: `${interpolate(table, [0, 1], [0.85, 1])}`,
          overflow: "hidden",
        }}
      >
        {[
          ["16", "· · ·", false],
          ["17", "LEVERKUSEN", true],
          ["18", "· · ·", false],
        ].map(([pos, name, hl]) => (
          <div
            key={String(pos)}
            style={{
              display: "flex",
              padding: "10px 24px",
              background: hl ? "rgba(232,34,46,0.85)" : "transparent",
              opacity: hl ? 1 : 0.5,
            }}
          >
            <span style={{ width: 70 }}>{pos}</span>
            <span style={{ flex: 1 }}>{name}</span>
            {hl && <span style={{ fontSize: 30 }}>DESCENSO ▼</span>}
          </div>
        ))}
      </div>
      {here && (
        <Caption name="Llega Xabi" delay={arrive} accentWords="Xabi Alonso" accent={K.gold} style={{ top: 640 }}>
          Y llega Xabi Alonso
        </Caption>
      )}
      <Character {...XHAKA} x={200} y={G} height={280} pose={here ? "wait" : "sad"} mood={here ? "happy" : "sad"} />
      <Character {...WIRTZ} x={360} y={G} height={270} pose={here ? "wait" : "sad"} mood={here ? "happy" : "sad"} phase={7} />
      <Character {...XABI} x={xx} y={G} facing="left" pose={frame < arrive + 22 ? "run" : "idle"} mood="happy" />
      <Flash amount={interpolate(frame, [arrive + 18, arrive + 20, arrive + 28], [0, 0.35, 0], clamp)} />
      <Sfx name="Entrada Xabi" file="whoosh.wav" from={arrive - 8} volume={0.7} />
      <Sfx name="Ding Xabi" file="ding.wav" from={arrive + 20} volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── 5. JORNADA TRAS JORNADA: NO PIERDEN ───────────── */
export const SceneUnbeaten: React.FC = () => {
  const frame = useCurrentFrame();
  const end = beat("s05", 0.8);
  const md = Math.round(interpolate(frame, [4, end], [1, 28], { ...clamp, easing: Easing.in(Easing.quad) }));
  const tick = md;
  const runX = (start: number, speed: number) => ((start + frame * speed) % 1400) - 160;
  return (
    <AbsoluteFill>
      <Stadium crowd={BAYARENA_CROWD} hype={0.7} />
      <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center", fontFamily: body, fontWeight: 900, fontSize: 44, letterSpacing: 6, color: "rgba(255,255,255,0.85)" }}>
        JORNADA
      </div>
      <BigWord top={300} size={230} color={C.white}>
        {md}
      </BigWord>
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: display,
            fontSize: 74,
            color: C.white,
            background: K.lev,
            border: `6px solid ${C.ink}`,
            borderRadius: 22,
            padding: "4px 30px",
            rotate: "-3deg",
            scale: `${1 + (tick % 2) * 0.04}`,
          }}
        >
          DERROTAS: 0
        </div>
      </div>
      <Caption name="No pierden" delay={beat("s05", 0.45)} accentWords="Ni vez" accent={K.gold} style={{ top: 740 }}>
        No pierden. Ni una vez.
      </Caption>
      <Character {...FRIMPONG} x={runX(200, 13)} y={G} pose="run" mood="happy" height={280} />
      <Character {...WIRTZ} x={runX(650, 13)} y={G} pose="run" mood="happy" height={280} phase={6} />
      <Character {...GRIMALDO} x={runX(1100, 13)} y={G} pose="run" mood="happy" height={280} phase={11} />
      <Sfx name="Tic jornadas" file="kick.wav" from={4} volume={0.3} durationInFrames={10} />
    </AbsoluteFill>
  );
};

/* ───────────── 6. GOLES EN EL DESCUENTO ───────────── */
export const SceneLate: React.FC = () => {
  const frame = useCurrentFrame();
  const start = LATE_GOAL - GOAL_FRAME.shot;
  const scored = frame >= LATE_GOAL;
  const extra = Math.min(7, 1 + Math.floor(frame / 14));
  return (
    <AbsoluteFill>
      <Stadium crowd={BAYARENA_CROWD} hype={scored ? 1 : 0.3} mood={scored ? "normal" : "tense"} />
      <Sequence name="Gol en el añadido" from={start} layout="none">
        <GoalPlay kind="shot" scorer={{ ...LEV_A, kit: { ...LEV_A.kit, number: 2 } }} keeper={RIVAL_KEEPER} reaction="roar" shout="¡90+!" shoutColor={C.white} />
      </Sequence>
      {frame < start && <Character {...RIVAL_KEEPER} x={930} y={G} height={270} facing="left" pose="idle" mood="happy" />}
      <MatchBoard home="LEVERKUSEN" away="RIVAL" homeColor={K.lev} awayColor="#7A3FD0" score={scored ? [2, 2] : [1, 2]} tag={`90+${extra}'`} flashAt={LATE_GOAL} />
      <MinuteBadge text={scored ? "8 GOLES EN EL AÑADIDO" : "TIEMPO AÑADIDO"} color={scored ? K.gold : "#E8E8E8"} textColor={C.ink} />
      <Caption name="Descuento" delay={4} accentWords="descuento" accent={K.gold} style={{ fontSize: 74 }}>
        Y cuando van perdiendo... marcan en el descuento
      </Caption>
      <Stamp text="RÉCORD" at={beat("s06", 0.9)} top={980} rotate={-8} />
      <LossChip value="0" />
      <Sfx name="Latido descuento" file="heartbeat.wav" from={0} durationInFrames={LATE_GOAL} volume={0.6} />
      <Sfx name="Boom añadido" file="boom.wav" from={LATE_GOAL} volume={0.8} />
      <Sfx name="Sello récord" file="boom.wav" from={beat("s06", 0.9)} volume={0.4} durationInFrames={30} />
    </AbsoluteFill>
  );
};
