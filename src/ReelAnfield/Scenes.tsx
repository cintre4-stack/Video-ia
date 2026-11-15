import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Character } from "../Reel9320/Character";
import { GOAL_FRAME, GoalPlay } from "../Reel9320/GoalPlay";
import { Caption, MinuteBadge } from "../Reel9320/Hud";
import { Sfx } from "../Reel9320/Sfx";
import { Confetti, Flash, Stadium } from "../Reel9320/Stage";
import { body, C, display, LAYOUT } from "../Reel9320/theme";
import { AggregateBoard, FinalChip } from "./Hud";
import { FreeKick, FREE_KICK_GOAL, QuickCorner, CORNER_GOAL } from "./Plays";
import {
  ALISSON,
  ANFIELD_CROWD,
  BARCA_A,
  CAMP_NOU_CROWD,
  K,
  MESSI,
  OFFICIAL,
  ORIGI,
  POOL_A,
  ROBERTSON,
  SALAH_TEE,
  SUAREZ,
  TER_STEGEN,
  TRENT,
  WIJNALDUM,
} from "./Players";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const G = LAYOUT.ground;
// The second-leg board has 3 rows, so badge and caption sit lower in this reel.
const BADGE_TOP = 505;
const CAPTION_TOP = 605;

/* ───────────── 1. GANCHO: 3-0 → 4-0 ───────────── */
export const HOOK_FLIP = 92;
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const flipped = frame >= HOOK_FLIP;
  const crack = interpolate(frame, [HOOK_FLIP - 30, HOOK_FLIP], [0, 1], clamp);
  const shake = !flipped ? Math.sin(frame * 3.1) * crack * 10 : Math.sin(frame * 3) * interpolate(frame - HOOK_FLIP, [0, 14], [20, 0], clamp);
  return (
    <AbsoluteFill style={{ background: flipped ? `radial-gradient(circle at 50% 40%, #6B0F1E 0%, #12060A 75%)` : `radial-gradient(circle at 50% 40%, #1B2F66 0%, #0B0F24 75%)` }}>
      <div style={{ position: "absolute", top: 270, width: "100%", textAlign: "center", fontFamily: body, fontWeight: 900, fontSize: 42, letterSpacing: 5, color: "rgba(255,255,255,0.8)" }}>
        CHAMPIONS · SEMIFINAL 2019
      </div>
      <div
        style={{
          position: "absolute",
          top: 340,
          width: "100%",
          textAlign: "center",
          fontFamily: display,
          fontSize: 330,
          color: flipped ? "#FFFFFF" : "#FFD23F",
          WebkitTextStroke: `16px ${C.ink}`,
          paintOrder: "stroke fill",
          translate: `${shake}px 0`,
          scale: `${flipped ? interpolate(frame - HOOK_FLIP, [0, 5, 14], [1.4, 0.95, 1], clamp) : 1}`,
          textShadow: flipped ? `0 0 70px ${K.pool}` : "none",
        }}
      >
        {flipped ? "4-0" : "3-0"}
      </div>
      <div style={{ position: "absolute", top: 700, width: "100%", textAlign: "center", fontFamily: body, fontWeight: 900, fontSize: 46, color: C.white, opacity: 0.9 }}>
        {flipped ? "VUELTA · ANFIELD" : "IDA · CAMP NOU"}
      </div>
      <Caption name="Gancho" delay={flipped ? HOOK_FLIP + 4 : 6} accentWords={flipped ? "anfield" : "imposible?"} accent={flipped ? K.pool : "#FFD23F"} style={{ top: 800 }}>
        {flipped ? "Hasta que llegó Anfield" : "Remontar esto... ¿imposible?"}
      </Caption>
      {flipped ? (
        <Character {...ORIGI} x={540} y={1460} height={380} pose="celebrate" mood="happy" />
      ) : (
        <Character {...MESSI} x={540} y={1460} height={380} pose="idle" mood="happy" />
      )}
      <Flash amount={interpolate(frame, [HOOK_FLIP, HOOK_FLIP + 2, HOOK_FLIP + 10], [0, 0.9, 0], clamp)} color={flipped ? "#FFD0D0" : "#FFFFFF"} />
      <Sfx name="Latido" file="heartbeat.wav" from={0} durationInFrames={HOOK_FLIP} volume={0.8} />
      <Sfx name="Boom 4-0" file="boom.wav" from={HOOK_FLIP} volume={1} />
      <Sfx name="Grito Anfield" file="roar.wav" from={HOOK_FLIP} volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── 2. IDA: SUÁREZ 26' ───────────── */
export const SceneSuarez: React.FC = () => {
  const frame = useCurrentFrame();
  const start = 12;
  const goal = start + GOAL_FRAME.shot;
  return (
    <AbsoluteFill>
      <Stadium crowd={CAMP_NOU_CROWD} hype={frame >= goal ? 0.8 : 0.25} />
      <Sequence name="Jugada Suárez" from={start} layout="none">
        <GoalPlay kind="shot" scorer={SUAREZ} keeper={ALISSON} reaction="roar" />
      </Sequence>
      <AggregateBoard leg="ida" ida={frame >= goal ? [1, 0] : [0, 0]} minute="26'" flashAt={goal} />
      <MinuteBadge text="IDA · 1 MAYO 2019" color={K.barca} top={BADGE_TOP} />
      <Caption name="Suárez" delay={4} accentWords="ex" accent="#FFD23F" style={{ top: CAPTION_TOP }}>
        Suárez marca a su ex equipo
      </Caption>
      <FinalChip before="barca" />
    </AbsoluteFill>
  );
};

/* ───────────── 3. IDA: FALTA DE MESSI ───────────── */
export const SceneMessi: React.FC = () => {
  const frame = useCurrentFrame();
  const start = 10;
  const goal = start + FREE_KICK_GOAL;
  return (
    <AbsoluteFill>
      <Stadium crowd={CAMP_NOU_CROWD} hype={frame >= goal ? 1 : 0.2} />
      <Sequence name="Falta Messi" from={start} layout="none">
        <FreeKick />
      </Sequence>
      <AggregateBoard leg="ida" ida={frame >= goal ? [3, 0] : [2, 0]} minute="82'" flashAt={goal} />
      <MinuteBadge text="82' · GOL 600 DE MESSI" color={K.barca} top={BADGE_TOP} />
      <Caption name="Messi" delay={4} accentWords="falta." accent="#FFD23F" style={{ top: CAPTION_TOP }}>
        Messi, de falta. 3-0.
      </Caption>
      <FinalChip before="barca" />
    </AbsoluteFill>
  );
};

/* ───────────── 4. BAJAS: SALAH "NEVER GIVE UP" ───────────── */
export const SceneSalah: React.FC = () => {
  const frame = useCurrentFrame();
  const banner = interpolate(frame, [40, 52], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return (
    <AbsoluteFill>
      <Stadium crowd={ANFIELD_CROWD} hype={0.15} mood="dark" />
      <AggregateBoard leg="vuelta" ida={[3, 0]} vuelta={[0, 0]} minute="7 MAY" />
      <MinuteBadge text="VUELTA · ANFIELD" color={K.pool} top={BADGE_TOP} />
      <Caption name="Bajas" delay={4} accentWords="Salah Firmino" accent={K.pool} style={{ top: CAPTION_TOP + 40 }}>
        Sin Salah ni Firmino
      </Caption>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 900,
          display: "flex",
          justifyContent: "center",
          opacity: banner,
          scale: `${interpolate(banner, [0, 1], [0.6, 1])}`,
        }}
      >
        <div style={{ background: "#111", color: C.white, fontFamily: display, fontSize: 92, padding: "10px 40px", borderRadius: 18, border: "6px solid #FFFFFF", rotate: "-3deg" }}>
          NEVER GIVE UP
        </div>
      </div>
      <Character {...SALAH_TEE} x={540} y={G} height={320} pose="idle" mood="neutral" />
      <FinalChip before="barca" />
      <Sfx name="Golpe cartel" file="ding.wav" from={42} volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── 5. ORIGI 7' ───────────── */
export const SceneOrigi: React.FC = () => {
  const frame = useCurrentFrame();
  const start = 10;
  const goal = start + GOAL_FRAME.shot;
  return (
    <AbsoluteFill>
      <Stadium crowd={ANFIELD_CROWD} hype={frame >= goal ? 0.9 : 0.3} />
      <Sequence name="Jugada Origi" from={start} layout="none">
        <GoalPlay kind="shot" scorer={ORIGI} keeper={TER_STEGEN} reaction="roar" shoutColor="#FFFFFF" />
      </Sequence>
      <AggregateBoard leg="vuelta" ida={[3, 0]} vuelta={frame >= goal ? [1, 0] : [0, 0]} minute="7'" flashAt={goal} />
      <MinuteBadge text="7'" color={K.pool} top={BADGE_TOP} />
      <Caption name="Origi" delay={4} accentWords="Origi" accent={K.pool} style={{ top: CAPTION_TOP }}>
        Origi, al rechace
      </Caption>
      <FinalChip before="barca" />
    </AbsoluteFill>
  );
};

/* ───────────── 6. DESCANSO: ENTRA WIJNALDUM ───────────── */
export const SceneHalftime: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stadium crowd={ANFIELD_CROWD} hype={0.2} />
      <Character {...OFFICIAL} x={540} y={G} holding="board" boardText="5" pose="idle" />
      <Character {...ROBERTSON} x={interpolate(frame, [10, 120], [420, 80], clamp)} y={G} facing="left" pose="run" mood="sad" phase={3} />
      <Character {...WIJNALDUM} x={interpolate(frame, [10, 90], [1100, 790], clamp)} y={G} facing="left" pose={frame < 90 ? "run" : "idle"} mood="shout" />
      <AggregateBoard leg="vuelta" ida={[3, 0]} vuelta={[1, 0]} minute="DESC." />
      <MinuteBadge text="DESCANSO" color="#E8E8E8" textColor={C.ink} top={BADGE_TOP} />
      <Caption name="Cambio" delay={4} accentWords="Wijnaldum." accent={K.pool} style={{ top: CAPTION_TOP }}>
        Se lesiona Robertson. Entra Wijnaldum.
      </Caption>
      <FinalChip before="barca" />
      <Sfx name="Silbato descanso" file="whistle.wav" from={0} volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── 7. WIJNALDUM 54' + 56' ───────────── */
export const SceneWijnaldum: React.FC = () => {
  const frame = useCurrentFrame();
  const beat = 92;
  const g1 = GOAL_FRAME.shot;
  const g2 = beat + GOAL_FRAME.header;
  const vuelta: [number, number] = frame >= g2 ? [3, 0] : frame >= g1 ? [2, 0] : [1, 0];
  return (
    <AbsoluteFill>
      <Stadium crowd={ANFIELD_CROWD} hype={frame >= g1 ? 1 : 0.4} />
      <Sequence name="Gol 54'" durationInFrames={beat} layout="none">
        <GoalPlay kind="shot" scorer={WIJNALDUM} keeper={TER_STEGEN} reaction="roar" shout="2-0" shoutColor="#FFFFFF" />
        <MinuteBadge text="54'" color={K.pool} top={BADGE_TOP} />
        <Caption name="Wijnaldum 1" delay={2} accentWords="Wijnaldum!" accent={K.pool} style={{ top: CAPTION_TOP }}>
          ¡Wijnaldum!
        </Caption>
      </Sequence>
      <Sequence name="Gol 56'" from={beat} layout="none">
        <GoalPlay kind="header" scorer={WIJNALDUM} keeper={TER_STEGEN} reaction="roar" shout="3-0" shoutColor="#FFFFFF" />
        <MinuteBadge text="56'" color={K.pool} top={BADGE_TOP} />
        <Caption name="Wijnaldum 2" delay={2} accentWords="otra vez" accent={K.pool} style={{ top: CAPTION_TOP }}>
          ¡Y otra vez Wijnaldum! 3-3 global
        </Caption>
      </Sequence>
      <AggregateBoard leg="vuelta" ida={[3, 0]} vuelta={vuelta} minute={frame >= beat ? "56'" : "54'"} flashAt={frame >= g2 ? g2 : g1} />
      <FinalChip before="barca" after="prorroga" changeAt={g2} />
    </AbsoluteFill>
  );
};

/* ───────────── 8. EL CÓRNER RÁPIDO 79' ───────────── */
export const SceneCorner: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stadium crowd={ANFIELD_CROWD} hype={frame >= CORNER_GOAL ? 1 : 0.35} mood={frame >= CORNER_GOAL ? "normal" : "tense"} />
      <QuickCorner />
      <AggregateBoard leg="vuelta" ida={[3, 0]} vuelta={frame >= CORNER_GOAL ? [4, 0] : [3, 0]} minute="79'" flashAt={CORNER_GOAL} />
      <Sequence name="Texto córner" durationInFrames={CORNER_GOAL} layout="none">
        <MinuteBadge text="79' · CÓRNER" color={K.pool} top={BADGE_TOP} />
        <Caption name="Despiste" delay={4} accentWords="despistado..." accent="#FFD23F" style={{ top: CAPTION_TOP }}>
          El Barça, despistado...
        </Caption>
      </Sequence>
      <Sequence name="Texto Origi" from={CORNER_GOAL} layout="none">
        <Caption name="Trent Origi" delay={0} accentWords="Trent ORIGI!" accent={K.pool} style={{ top: CAPTION_TOP }}>
          ¡Trent la saca rápido! ¡ORIGI!
        </Caption>
      </Sequence>
      <Confetti start={CORNER_GOAL} colors={[K.pool, "#FFFFFF", "#F6EB61"]} count={90} />
      <FinalChip before="prorroga" after="liverpool" changeAt={CORNER_GOAL} />
    </AbsoluteFill>
  );
};

/* ───────────── 9. YOU'LL NEVER WALK ALONE ───────────── */
export const SceneYnwa: React.FC = () => {
  const frame = useCurrentFrame();
  const sway = (i: number) => Math.sin(frame * 0.08 + i) * 12;
  return (
    <AbsoluteFill>
      <Stadium crowd={ANFIELD_CROWD} hype={0.5} />
      {[ORIGI, TRENT, WIJNALDUM, POOL_A].map((p, i) => (
        <Character key={i} {...p} x={170 + i * 175 + sway(i)} y={G} height={280} pose="wait" mood="happy" phase={i * 11} />
      ))}
      <Character {...MESSI} x={950} y={G} height={260} facing="left" pose="sad" mood="sad" />
      <AggregateBoard leg="vuelta" ida={[3, 0]} vuelta={[4, 0]} minute="FINAL" />
      <Caption name="YNWA" delay={6} accentWords="Alone" accent={K.pool} style={{ fontSize: 76, top: CAPTION_TOP }}>
        Anfield canta: You'll Never Walk Alone
      </Caption>
      <FinalChip before="liverpool" />
      <Sfx name="Pitido final" file="whistle-final.wav" from={0} volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── 10. GLOBAL + FINAL DE MADRID ───────────── */
export const SceneGlobal: React.FC = () => {
  const frame = useCurrentFrame();
  const card = interpolate(frame, [6, 20], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const sub = interpolate(frame, [55, 65], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Stadium crowd={ANFIELD_CROWD} hype={1} />
      <Confetti start={-40} colors={[K.pool, "#FFFFFF", K.gold]} count={60} />
      <Caption name="Global" delay={2} accentWords="4-3" accent={K.gold} style={{ top: LAYOUT.hudTop + 10 }}>
        Global: Liverpool 4-3 Barça
      </Caption>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 560,
          borderRadius: 28,
          background: "rgba(8,14,28,0.93)",
          border: `5px solid ${K.gold}`,
          padding: "18px 28px",
          fontFamily: body,
          fontWeight: 900,
          color: C.white,
          opacity: card,
          scale: `${interpolate(card, [0, 1], [0.8, 1])}`,
          fontSize: 46,
        }}
      >
        {[
          ["IDA", "Barça 3-0 Liverpool"],
          ["VUELTA", "Liverpool 4-0 Barça"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", padding: "8px 0" }}>
            <span style={{ width: 200, opacity: 0.6, fontSize: 34, alignSelf: "center" }}>{k}</span>
            <span style={{ flex: 1, textAlign: "right" }}>{v}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 860,
          textAlign: "center",
          fontFamily: display,
          fontSize: 64,
          lineHeight: 1.1,
          color: K.gold,
          WebkitTextStroke: `10px ${C.ink}`,
          paintOrder: "stroke fill",
          opacity: sub,
          scale: `${interpolate(sub, [0, 1], [0.7, 1])}`,
        }}
      >
        Un mes después: campeones de Europa
      </div>
      <Character {...WIJNALDUM} x={250} y={G} pose="celebrate" mood="happy" phase={5} />
      <Character {...ORIGI} x={540} y={G} pose="celebrate" mood="happy" holding="trophy" height={330} />
      <Character {...TRENT} x={830} y={G} pose="celebrate" mood="happy" phase={14} facing="left" />
      <Sfx name="Ding" file="ding.wav" from={8} volume={0.5} />
      <Sfx name="Ding campeones" file="ding.wav" from={56} volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── 11. CTA ───────────── */
export const SceneCta: React.FC = () => {
  const frame = useCurrentFrame();
  const sub = interpolate(frame, [30, 40], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #8C1325 0%, #12060A 75%)` }}>
      <Caption name="Pregunta" delay={2} accentWords="mejor remontada" accent={K.gold} style={{ top: 420, fontSize: 96 }}>
        ¿La mejor remontada de la Champions?
      </Caption>
      <div style={{ position: "absolute", left: 80, right: 80, top: 830, textAlign: "center", fontFamily: body, fontWeight: 900, fontSize: 50, lineHeight: 1.3, color: C.white, opacity: sub }}>
        Cuéntamelo en comentarios
        <br />
        <span style={{ color: K.gold }}>y sígueme para más historias de fútbol</span>
      </div>
      <Character {...ORIGI} x={380} y={1450} height={340} pose="celebrate" mood="happy" />
      <Character {...BARCA_A} x={720} y={1450} height={300} pose="sad" mood="sad" facing="left" />
    </AbsoluteFill>
  );
};
