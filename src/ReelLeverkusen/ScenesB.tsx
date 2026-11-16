import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Character } from "../Reel9320/Character";
import { GOAL_FRAME, GoalPlay } from "../Reel9320/GoalPlay";
import { Caption, MinuteBadge } from "../Reel9320/Hud";
import { Sfx } from "../Reel9320/Sfx";
import { Confetti, Flash, Goal, Stadium } from "../Reel9320/Stage";
import { body, C, display, LAYOUT } from "../Reel9320/theme";
import { BigWord, LossChip, MatchBoard, Stamp } from "./Hud";
import {
  BAYARENA_CROWD,
  BAYERN_A,
  BAYERN_B,
  BONIFACE,
  BREMEN_A,
  BREMEN_KEEPER,
  FANS,
  FRIMPONG,
  GRIMALDO,
  K,
  WIRTZ,
  XABI,
  XHAKA,
} from "./Players";
import { NeverWord } from "./ScenesA";
import { beat, BREMEN_GOALS, WIRTZ_GOALS } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const G = LAYOUT.ground;
const pop = (frame: number, at: number) =>
  interpolate(frame - at, [0, 6, 12], [0, 1.15, 1], { ...clamp, easing: Easing.out(Easing.quad) });

/* ───────────── 7. FEBRERO: 3-0 AL BAYERN ───────────── */
export const SceneBayern30: React.FC = () => {
  const frame = useCurrentFrame();
  const goals = [beat("s07", 0.25), beat("s07", 0.4), beat("s07", 0.55)];
  const n = goals.filter((g) => frame >= g).length;
  const last = n > 0 ? goals[n - 1] : undefined;
  return (
    <AbsoluteFill>
      <Stadium crowd={BAYARENA_CROWD} hype={0.4 + n * 0.2} />
      <MatchBoard home="LEVERKUSEN" away="BAYERN" homeColor={K.lev} awayColor={K.bayern} score={[n, 0]} tag="10 FEB" flashAt={last} />
      <MinuteBadge text="FEBRERO 2024" color={K.lev} />
      <Caption name="3-0 Bayern" delay={4} accentWords="3-0" accent={K.gold}>
        3-0 al Bayern
      </Caption>
      <Stamp text="AVISO" at={beat("s07", 0.8)} top={780} rotate={-9} />
      <Character {...GRIMALDO} x={200} y={G} height={290} pose={n > 0 ? "celebrate" : "idle"} mood="happy" />
      <Character {...FRIMPONG} x={420} y={G} height={290} pose={n > 1 ? "celebrate" : "idle"} mood="happy" phase={5} />
      <Character {...BAYERN_A} x={700} y={G} height={280} pose="sad" mood={n > 0 ? "sad" : "worried"} facing="left" />
      <Character {...BAYERN_B} x={900} y={G} height={270} pose="sad" mood="sad" facing="left" phase={8} />
      {goals.map((g, i) => (
        <Sfx key={g} name={`Gol ${i + 1}`} file="kick.wav" from={g} volume={0.7} durationInFrames={12} />
      ))}
      <Sfx name="Grito 3-0" file="roar.wav" from={goals[2]} volume={0.5} />
      <Sfx name="Sello aviso" file="boom.wav" from={beat("s07", 0.8)} volume={0.5} durationInFrames={30} />
      <LossChip value="0" />
    </AbsoluteFill>
  );
};

/* ───────────── 8. 14 ABRIL 2024 · BREMEN: BONIFACE + XHAKA ───────────── */
export const SceneBremen: React.FC = () => {
  const frame = useCurrentFrame();
  const [g1, g2] = BREMEN_GOALS;
  const s1 = g1 - GOAL_FRAME.shot;
  const s2 = g2 - GOAL_FRAME.shot;
  const score: [number, number] = [frame >= g2 ? 2 : frame >= g1 ? 1 : 0, 0];
  return (
    <AbsoluteFill>
      <Stadium crowd={BAYARENA_CROWD} hype={frame >= g1 ? 0.9 : 0.5} />
      {frame < s1 && (
        <>
          <Goal />
          <Character {...BREMEN_KEEPER} x={930} y={G} height={270} facing="left" pose="idle" mood="worried" />
          <Character {...BONIFACE} x={120} y={G} pose="idle" mood="neutral" />
          <Character {...BREMEN_A} x={640} y={G} height={280} facing="left" pose="idle" mood="worried" />
        </>
      )}
      <Sequence name="Penalti Boniface 25'" from={s1} durationInFrames={s2 - s1} layout="none">
        <GoalPlay kind="shot" scorer={BONIFACE} keeper={BREMEN_KEEPER} reaction="roar" shout="1-0" shoutColor={C.white} />
      </Sequence>
      <Sequence name="Golazo Xhaka 60'" from={s2} layout="none">
        <GoalPlay kind="shot" scorer={XHAKA} keeper={BREMEN_KEEPER} reaction="roar" shout="¡GOLAZO!" />
      </Sequence>
      <MatchBoard
        home="LEVERKUSEN"
        away="BREMEN"
        homeColor={K.lev}
        awayColor={K.bremen}
        score={score}
        tag={frame >= s2 ? "60'" : frame >= s1 ? "25'" : "J29"}
        flashAt={frame >= g2 ? g2 : g1}
      />
      <Sequence name="Texto fecha" durationInFrames={s1} layout="none">
        <MinuteBadge text="14 ABRIL 2024" color={K.lev} />
        <Caption name="Si ganan, campeones" delay={6} accentWords="campeones" accent={K.gold}>
          Si ganan, son campeones
        </Caption>
      </Sequence>
      <Sequence name="Texto Boniface" from={s1} durationInFrames={s2 - s1} layout="none">
        <MinuteBadge text="25' · PENALTI" color={K.lev} />
        <Caption name="Boniface" delay={2} accentWords="Boniface" accent={K.lev}>
          Boniface, de penalti
        </Caption>
      </Sequence>
      <Sequence name="Texto Xhaka" from={s2} layout="none">
        <MinuteBadge text="60'" color={K.lev} />
        <Caption name="Xhaka" delay={2} accentWords="Xhaka" accent={K.lev}>
          ¡Y Xhaka, golazo!
        </Caption>
      </Sequence>
      <LossChip value="0" />
      <Sfx name="Boom golazo" file="boom.wav" from={g2} volume={0.7} />
    </AbsoluteFill>
  );
};

/* ───────────── 9. WIRTZ x3 + INVASIÓN ───────────── */
const Fans: React.FC<{ on: number; off: number }> = ({ on, off }) => {
  const frame = useCurrentFrame();
  if (frame < on || frame > off + 30) return null;
  const inT = interpolate(frame, [on, on + 22], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const outT = interpolate(frame, [off, off + 26], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <>
      {FANS.map((f, i) => {
        const fromLeft = i % 2 === 0;
        const target = 150 + i * 150;
        const offscreen = fromLeft ? -150 : 1230;
        const x = interpolate(inT, [0, 1], [offscreen, target]) + interpolate(outT, [0, 1], [0, offscreen - target]);
        const moving = inT < 1 || outT > 0;
        return (
          <Character
            key={i}
            {...f}
            x={x}
            y={G + 10 + (i % 3) * 14}
            height={250}
            facing={(fromLeft ? outT === 0 : outT > 0) ? "right" : "left"}
            pose={moving ? "run" : "celebrate"}
            mood="happy"
            phase={i * 7}
          />
        );
      })}
    </>
  );
};

export const SceneWirtz: React.FC = () => {
  const frame = useCurrentFrame();
  const [, g4, g5] = WIRTZ_GOALS;
  const shouts = ["3-0", "4-0", "5-0"];
  const n = WIRTZ_GOALS.filter((g) => frame >= g).length;
  const score: [number, number] = [2 + n, 0];
  const minutes = ["68'", "83'", "90'"];
  const fansOn = g4 + 10;
  const fansOff = g5 - GOAL_FRAME.shot - 28;
  const invasion = frame >= fansOn && frame < g5 - GOAL_FRAME.shot;
  return (
    <AbsoluteFill>
      <Stadium crowd={BAYARENA_CROWD} hype={1} />
      {WIRTZ_GOALS.map((g, i) => {
        const from = g - GOAL_FRAME.shot;
        const next = i < 2 ? WIRTZ_GOALS[i + 1] - GOAL_FRAME.shot : undefined;
        // While fans are on the pitch the play pauses after goal 2.
        const dur = i === 1 ? fansOn - from : next !== undefined ? next - from : undefined;
        return (
          <Sequence key={g} name={`Wirtz ${minutes[i]}`} from={from} durationInFrames={dur} layout="none">
            <GoalPlay kind={i === 1 ? "header" : "shot"} scorer={WIRTZ} keeper={BREMEN_KEEPER} reaction="roar" shout={shouts[i]} shoutColor={C.white} />
          </Sequence>
        );
      })}
      {invasion && <Goal />}
      <Fans on={fansOn} off={fansOff} />
      <MatchBoard
        home="LEVERKUSEN"
        away="BREMEN"
        homeColor={K.lev}
        awayColor={K.bremen}
        score={score}
        tag={minutes[Math.max(0, n - 1)]}
        flashAt={n > 0 ? WIRTZ_GOALS[n - 1] : undefined}
      />
      <MinuteBadge text={invasion ? "¡PARTIDO PARADO!" : `WIRTZ · ${minutes[Math.max(0, n - 1)]}`} color={invasion ? K.gold : K.lev} textColor={invasion ? C.ink : C.white} />
      <Sequence name="Texto Wirtz 1" durationInFrames={g4} layout="none">
        <Caption name="Wirtz 1" delay={2} accentWords="Wirtz" accent={K.lev}>
          ¡Wirtz! 3-0
        </Caption>
      </Sequence>
      <Sequence name="Texto Wirtz 2" from={g4} durationInFrames={fansOn + 8 - g4} layout="none">
        <Caption name="Wirtz 2" delay={0} accentWords="Wirtz" accent={K.lev}>
          ¡Wirtz otra vez!
        </Caption>
      </Sequence>
      <Sequence name="Texto invasión" from={fansOn + 8} durationInFrames={g5 - 10 - fansOn - 8} layout="none">
        <Caption name="Invasión" delay={0} accentWords="afición" accent={K.gold} style={{ fontSize: 76 }}>
          ¡La afición invade el campo!
        </Caption>
      </Sequence>
      <Sequence name="Texto quinto" from={g5 - 10} layout="none">
        <Caption name="Wirtz 3" delay={0} accentWords="Wirtz" accent={K.lev}>
          ¡Y Wirtz, el quinto!
        </Caption>
      </Sequence>
      <Confetti start={g5} colors={[K.lev, C.white, K.black]} count={70} />
      <Flash amount={interpolate(frame, [g5, g5 + 2, g5 + 12], [0, 0.9, 0], clamp)} />
      <Sfx name="Invasión" file="roar.wav" from={fansOn} volume={0.9} />
      <Sfx name="Boom quinto" file="boom.wav" from={g5} volume={0.9} />
      <LossChip value="0" />
    </AbsoluteFill>
  );
};

/* ───────────── 10. ¡CAMPEONES! ───────────── */
export const SceneChampions: React.FC = () => {
  const frame = useCurrentFrame();
  const sub = beat("s10", 0.35);
  return (
    <AbsoluteFill>
      <Stadium crowd={BAYARENA_CROWD} hype={1} />
      <Confetti start={-30} colors={[K.lev, C.white, K.black, K.gold]} count={90} />
      <BigWord top={330} size={150} color={K.gold} scale={pop(frame, 4)} shake={Math.sin(frame * 3) * interpolate(frame, [4, 18], [16, 0], clamp)}>
        ¡CAMPEONES!
      </BigWord>
      <Caption name="120 años" delay={sub} accentWords="120" accent={K.gold} style={{ top: 560, fontSize: 76 }}>
        Primera Bundesliga en 120 años
      </Caption>
      <Character {...XHAKA} x={220} y={G} pose="celebrate" mood="happy" phase={5} />
      <Character {...WIRTZ} x={540} y={G} pose="celebrate" mood="happy" holding="trophy" height={340} />
      <Character {...XABI} x={850} y={G} pose="celebrate" mood="happy" facing="left" phase={12} />
      <Flash amount={interpolate(frame, [0, 2, 10], [0, 0.8, 0], clamp)} />
      <Sfx name="Pitido final" file="whistle-final.wav" from={0} volume={0.6} />
      <Sfx name="Grito campeón" file="roar.wav" from={2} volume={0.8} />
      <Sfx name="Ding 120" file="ding.wav" from={sub} volume={0.4} />
    </AbsoluteFill>
  );
};

/* ───────────── 11. 34 PARTIDOS · 0 DERROTAS ───────────── */
const STATS: { k: string; v: string; at: number; hl?: boolean }[] = [
  { k: "PARTIDOS", v: "34", at: 0.05 },
  { k: "VICTORIAS", v: "28", at: 0.18 },
  { k: "EMPATES", v: "6", at: 0.26 },
  { k: "DERROTAS", v: "0", at: 0.36, hl: true },
  { k: "PUNTOS", v: "90", at: 0.5 },
];
export const SceneStats: React.FC = () => {
  const frame = useCurrentFrame();
  const zero = beat("s11", 0.36);
  return (
    <AbsoluteFill>
      <Stadium crowd={BAYARENA_CROWD} hype={0.8} />
      <MinuteBadge text="BUNDESLIGA 2023/24" color={K.lev} top={250} />
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 360,
          borderRadius: 26,
          background: "rgba(8,10,16,0.93)",
          border: `5px solid ${K.gold}`,
          padding: "14px 34px",
          fontFamily: body,
          fontWeight: 900,
          color: C.white,
        }}
      >
        {STATS.map((s) => {
          const at = beat("s11", s.at);
          const glow = s.hl && frame >= at ? interpolate(Math.sin((frame - at) * 0.25), [-1, 1], [0.4, 1]) : 0;
          return (
            <div
              key={s.k}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 0",
                opacity: interpolate(frame - at, [0, 4], [0, 1], clamp),
                translate: `${interpolate(frame - at, [0, 8], [60, 0], { ...clamp, easing: Easing.out(Easing.quad) })}px 0`,
              }}
            >
              <span style={{ flex: 1, fontSize: 38, opacity: s.hl ? 1 : 0.75, color: s.hl ? "#FF6A6F" : undefined }}>{s.k}</span>
              <span
                style={{
                  fontFamily: display,
                  fontSize: s.hl ? 104 : 66,
                  color: s.hl ? K.lev : C.white,
                  WebkitTextStroke: s.hl ? `8px ${C.ink}` : undefined,
                  paintOrder: "stroke fill",
                  textShadow: s.hl ? `0 0 ${40 * glow}px ${K.lev}` : undefined,
                  scale: `${s.hl ? pop(frame, at) : 1}`,
                }}
              >
                {s.v}
              </span>
            </div>
          );
        })}
      </div>
      <Caption name="Nadie" delay={beat("s11", 0.6)} accentWords="Nadie" accent={K.gold} style={{ top: 880, fontSize: 74 }}>
        Nadie lo había hecho en Alemania
      </Caption>
      <Character {...FRIMPONG} x={230} y={G} height={280} pose="celebrate" mood="happy" />
      <Character {...BONIFACE} x={450} y={G} height={290} pose="celebrate" mood="happy" phase={6} />
      <Character {...GRIMALDO} x={660} y={G} height={280} pose="celebrate" mood="happy" phase={12} />
      <Character {...XHAKA} x={870} y={G} height={290} pose="celebrate" mood="happy" phase={3} facing="left" />
      {STATS.map((s) => (
        <Sfx key={s.k} name={`Dato ${s.k}`} file={s.hl ? "boom.wav" : "ding.wav"} from={beat("s11", s.at)} volume={s.hl ? 0.6 : 0.25} durationInFrames={40} />
      ))}
      <Flash amount={interpolate(frame, [zero, zero + 2, zero + 8], [0, 0.4, 0], clamp)} color="#FFD0D0" />
    </AbsoluteFill>
  );
};

/* ───────────── 12. CTA: NEVERKUSEN... NUNCA MÁS ───────────── */
export const SceneCta: React.FC = () => {
  const frame = useCurrentFrame();
  const swap = beat("s12", 0.12);
  const q = beat("s12", 0.4);
  const sub = interpolate(frame, [beat("s12", 0.75), beat("s12", 0.75) + 10], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #B0141B 0%, #1A0304 75%)` }}>
      <NeverWord top={260} swapAt={swap} />
      <Stamp text="NUNCA MÁS" at={swap + 10} top={470} rotate={-7} fontSize={96} />
      <Caption name="Pregunta" delay={q} accentWords="mejor temporada" accent={K.gold} style={{ top: 680, fontSize: 88 }}>
        ¿La mejor temporada que has visto?
      </Caption>
      <div style={{ position: "absolute", left: 80, right: 80, top: 990, textAlign: "center", fontFamily: body, fontWeight: 900, fontSize: 50, lineHeight: 1.3, color: C.white, opacity: sub }}>
        Te leo en comentarios
        <br />
        <span style={{ color: K.gold }}>y sígueme para más historias de fútbol</span>
      </div>
      <Character {...WIRTZ} x={380} y={1500} height={340} pose="celebrate" mood="happy" holding="trophy" />
      <Character {...XABI} x={720} y={1500} height={320} pose="wait" mood="happy" facing="left" />
      <Sfx name="Boom L final" file="boom.wav" from={swap} volume={0.6} durationInFrames={40} />
      <Sfx name="Sello nunca más" file="boom.wav" from={swap + 10} volume={0.4} durationInFrames={30} />
    </AbsoluteFill>
  );
};

