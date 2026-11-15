import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Character } from "./Character";
import { GOAL_FRAME, GoalPlay } from "./GoalPlay";
import { Caption, LiveChampion, MinuteBadge, Scoreboard } from "./Hud";
import {
  AGUERO,
  BALOTELLI,
  BARTON,
  DZEKO,
  KEEPER_QPR,
  OFFICIAL,
  REFEREE,
  ROONEY,
  UTD_A,
  UTD_B,
  UTD_C,
  ZABALETA,
} from "./Players";
import { ETIHAD_CROWD, SUNDERLAND_CROWD } from "./ScenesA";
import { Sfx } from "./Sfx";
import { Ball, Confetti, Flash, Goal, Stadium } from "./Stage";
import { body, C, display, LAYOUT } from "./theme";
import { AGUERO_GOAL } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const G = LAYOUT.ground;

/* ───────────── 6. DESCUENTO ───────────── */
export const SceneStoppage: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stadium crowd={ETIHAD_CROWD} hype={0.05} mood="tense" />
      <Character {...OFFICIAL} x={260} y={G} holding="board" boardText="+5" pose="idle" />
      <Character {...DZEKO} x={620} y={G} pose="sad" mood="sad" facing="left" />
      <Character {...AGUERO} x={850} y={G} pose="sad" mood="worried" facing="left" phase={20} />
      <Scoreboard city={[1, 2]} utd={[0, 1]} minuteCity="90'" minuteUtd="90'" />
      <MinuteBadge text="90'" color="#E3121B" />
      <Caption name="Descuento" delay={4} accentWords="5" accent="#36FF6B">
        Quedan 5 minutos. El City pierde.
      </Caption>
      <LiveChampion before="utd" />
      <Sfx name="Latido descuento" file="heartbeat.wav" from={0} volume={1} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 ${interpolate(Math.sin(frame * 0.35), [-1, 1], [80, 200])}px rgba(160,0,0,0.6)`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ───────────── 7. DZEKO 90+2 ───────────── */
export const SceneDzeko: React.FC = () => {
  const frame = useCurrentFrame();
  const start = 10;
  const goal = start + GOAL_FRAME.header;
  return (
    <AbsoluteFill>
      <Stadium crowd={ETIHAD_CROWD} hype={frame >= goal ? 0.7 : 0.1} mood={frame >= goal ? "normal" : "tense"} />
      <Sequence name="Cabezazo Dzeko" from={start} layout="none">
        <GoalPlay kind="header" scorer={DZEKO} keeper={KEEPER_QPR} reaction="roar" shout="2-2" />
      </Sequence>
      <Scoreboard
        city={frame >= goal ? [2, 2] : [1, 2]}
        utd={[0, 1]}
        minuteCity="90+2"
        minuteUtd="90+2"
        flashRow="city"
        flashAt={goal}
      />
      <MinuteBadge text="90+2'" color={C.city} textColor={C.cityDark} />
      <Sequence name="Texto Dzeko" durationInFrames={72} layout="none">
        <Caption name="Dzeko" delay={2} accentWords="cabeza:" accent={C.city}>
          Dzeko, de cabeza: 2-2
        </Caption>
      </Sequence>
      <Sequence name="Texto no sirve" from={72} layout="none">
        <Caption name="No sirve" delay={0} accentWords="NO" accent="#FF4B4B">
          Pero el empate NO sirve...
        </Caption>
      </Sequence>
      <LiveChampion before="utd" />
    </AbsoluteFill>
  );
};

/* ───────────── 8. MIENTRAS, EN SUNDERLAND ───────────── */
export const SceneSunderland: React.FC = () => {
  const frame = useCurrentFrame();
  const whistle = 12;
  const ended = frame >= whistle;
  return (
    <AbsoluteFill>
      <Stadium crowd={SUNDERLAND_CROWD} hype={0.1} />
      <Character {...REFEREE} x={170} y={G} holding="whistle" pose={ended ? "celebrate" : "idle"} mood="neutral" phase={0} />
      <Character {...UTD_A} x={400} y={G} pose={ended ? "wait" : "idle"} mood="worried" facing="left" phase={7} />
      <Character {...ROONEY} x={580} y={G} pose={ended ? "wait" : "idle"} mood="worried" facing="left" phase={19} />
      <Character {...UTD_B} x={760} y={G} pose={ended ? "wait" : "idle"} mood="worried" facing="left" phase={31} />
      <Character {...UTD_C} x={940} y={G} pose={ended ? "wait" : "idle"} mood="worried" facing="left" phase={43} />
      <Scoreboard
        city={[2, 2]}
        utd={[0, 1]}
        minuteCity="90+3"
        minuteUtd={ended ? "FINAL" : "90+3"}
        flashRow="utd"
        flashAt={whistle}
      />
      <MinuteBadge text="MIENTRAS, EN SUNDERLAND" color={C.utd} />
      <Caption name="Final Sunderland" delay={whistle} accentWords="campeón." accent={C.utd}>
        Pitido final. El United espera... ya campeón.
      </Caption>
      <LiveChampion before="utd" />
      <Sfx name="Pitido final" file="whistle-final.wav" from={whistle} volume={0.7} />
    </AbsoluteFill>
  );
};

/* ───────────── 9. AGÜERO 93:20 ───────────── */
export const SceneAguero: React.FC = () => {
  const frame = useCurrentFrame();
  const pass = 28; // Agüero → Balotelli
  const layoff = 46; // Balotelli, falling, gives it back
  const contact = 128;
  const goal = AGUERO_GOAL;
  const scored = frame >= goal;

  // Agüero path
  const ax = interpolate(frame, [0, pass, 60, 100, 118], [80, 260, 520, 640, 660], clamp);
  const aPose =
    scored ? "celebrate" : frame >= 112 ? "kick" : frame >= pass + 4 ? "run" : "run";
  const aAction = interpolate(frame, [112, 136], [0, 1], clamp);

  // ball path
  let bx: number;
  let by: number;
  if (frame < pass) {
    bx = ax + 55;
    by = G - 26;
  } else if (frame < layoff) {
    bx = interpolate(frame, [pass, pass + 10], [ax + 55, 400], clamp);
    by = G - 26;
  } else if (frame < contact) {
    const t = interpolate(frame, [layoff, 62], [0, 1], clamp);
    bx = frame < 62 ? interpolate(t, [0, 1], [400, 575]) : ax + 55;
    by = G - 26 - Math.sin(t * Math.PI) * 30;
  } else {
    const t = interpolate(frame, [contact, goal], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
    bx = interpolate(t, [0, 1], [720, 975]);
    by = G - 26 - 90 * t;
  }
  if (scored) {
    bx = 990;
    by = Math.min(G - 116 + (frame - goal) ** 2 * 1.4, G - 30);
  }

  const zoom = interpolate(frame, [92, 128, goal, goal + 10], [1, 1.35, 1.35, 1], {
    ...clamp,
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });
  const seconds = scored ? 20 : Math.min(5 + Math.floor((frame / goal) * 15), 19);
  const clock = `93:${String(seconds).padStart(2, "0")}`;
  const keeperDive = interpolate(frame, [contact + 2, goal + 4], [0, 1], clamp);
  const shake = scored ? interpolate(frame - goal, [0, 24], [1, 0], clamp) : 0;
  const shout = interpolate(frame - goal, [0, 6, 14], [0, 1.3, 1], clamp);
  const shakeCam = scored ? Math.sin(frame * 2.7) * interpolate(frame - goal, [0, 18], [22, 0], clamp) : 0;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          scale: `${zoom}`,
          transformOrigin: "700px 1250px",
          translate: `${shakeCam}px ${shakeCam * 0.6}px`,
        }}
      >
        <Stadium crowd={ETIHAD_CROWD} hype={scored ? 1 : 0.25} mood={scored ? "normal" : "tense"} />
        <Goal shake={shake} />
        <Character
          {...KEEPER_QPR}
          x={interpolate(keeperDive, [0, 1], [930, 900])}
          y={G}
          height={270}
          facing="left"
          pose={keeperDive > 0 ? "dive" : "idle"}
          action={keeperDive}
          mood={scored ? "sad" : "worried"}
        />
        {/* defender who gets beaten */}
        <Character
          {...BARTON}
          kit={{ ...BARTON.kit, number: undefined }}
          hair="short"
          x={interpolate(frame, [80, 110], [700, 760], clamp)}
          y={G}
          facing="left"
          pose={frame > 96 ? "slide" : "idle"}
          mood="worried"
          height={280}
        />
        <Character
          {...BALOTELLI}
          x={400}
          y={G}
          pose={frame >= layoff - 6 && frame < 90 ? "slide" : scored ? "celebrate" : "idle"}
          mood={scored ? "happy" : "neutral"}
          phase={9}
        />
        <Character
          {...AGUERO}
          x={scored ? interpolate(frame, [goal, goal + 80], [660, 520], clamp) : ax}
          y={G}
          pose={aPose}
          action={aAction}
          mood={scored ? "happy" : frame > 100 ? "shout" : "neutral"}
          holding={frame > goal + 20 ? "shirt" : undefined}
        />
        <Ball x={bx} y={by} spin={frame * 16} />
      </div>
      <Confetti start={goal} colors={[C.city, C.white, C.gold]} count={110} />
      <Scoreboard
        city={scored ? [3, 2] : [2, 2]}
        utd={[0, 1]}
        minuteCity={clock}
        minuteUtd="FINAL"
        flashRow="city"
        flashAt={goal}
      />
      <Sequence name="Texto última jugada" durationInFrames={goal} layout="none">
        <Caption name="Última jugada" delay={2} accentWords="última" accent={C.gold}>
          93:05. La última jugada.
        </Caption>
      </Sequence>
      {scored && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 560,
            textAlign: "center",
            fontFamily: display,
            fontSize: 132,
            lineHeight: 1,
            color: C.city,
            WebkitTextStroke: `18px ${C.ink}`,
            paintOrder: "stroke fill",
            scale: `${shout}`,
            rotate: "-5deg",
          }}
        >
          ¡AGÜE
          {"R" + "O".repeat(Math.min(1 + Math.floor((frame - goal) / 5), 4))}!
          <div style={{ fontSize: 110, color: C.gold }}>93:20</div>
        </div>
      )}
      <Flash amount={interpolate(frame - goal, [0, 2, 10], [0, 0.95, 0], clamp)} />
      <LiveChampion before="utd" after="city" changeAt={goal} />
      <Sfx name="Latido final" file="heartbeat.wav" from={60} durationInFrames={goal - 60} volume={1} />
      <Sfx name="Pase" file="kick.wav" from={pass} volume={0.6} />
      <Sfx name="Pase Balotelli" file="kick.wav" from={layoff} volume={0.6} />
      <Sfx name="Whoosh tiro" file="whoosh.wav" from={contact - 4} volume={0.8} />
      <Sfx name="Disparo" file="kick.wav" from={contact} volume={1} />
      <Sfx name="Boom gol" file="boom.wav" from={goal} volume={1} />
      <Sfx name="Estadio explota" file="roar.wav" from={goal} volume={0.6} />
      <Sfx name="Estadio explota 2" file="roar.wav" from={goal + 60} volume={0.45} />
    </AbsoluteFill>
  );
};

/* ───────────── 10. CLASIFICACIÓN FINAL ───────────── */
export const SceneFinalTable: React.FC = () => {
  const frame = useCurrentFrame();
  const card = interpolate(frame, [6, 20], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const sub = interpolate(frame, [55, 65], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Stadium crowd={ETIHAD_CROWD} hype={1} />
      <Confetti start={-40} colors={[C.city, C.white, C.gold]} count={60} />
      <Caption name="Clasificación" delay={2} accentWords="8" style={{ top: LAYOUT.hudTop + 10 }}>
        Mismos puntos. Campeón por 8 goles.
      </Caption>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 560,
          borderRadius: 28,
          background: "rgba(8,14,28,0.93)",
          border: `5px solid ${C.gold}`,
          padding: "18px 28px",
          fontFamily: body,
          fontWeight: 900,
          color: C.white,
          opacity: card,
          scale: `${interpolate(card, [0, 1], [0.8, 1])}`,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, opacity: 0.6, paddingBottom: 8 }}>
          <span style={{ flex: 1 }}>CLASIFICACIÓN FINAL 2011-12</span>
          <span style={{ width: 110, textAlign: "right" }}>PTS</span>
          <span style={{ width: 120, textAlign: "right" }}>DG</span>
        </div>
        {[
          { pos: 1, name: "MAN CITY", pts: 89, dg: "+64", color: C.city },
          { pos: 2, name: "MAN UTD", pts: 89, dg: "+56", color: C.utd },
        ].map((r) => (
          <div key={r.name} style={{ display: "flex", alignItems: "center", fontSize: 50, padding: "8px 0" }}>
            <span style={{ width: 50, opacity: 0.6 }}>{r.pos}</span>
            <span style={{ width: 18, height: 50, background: r.color, borderRadius: 6, marginRight: 18 }} />
            <span style={{ flex: 1 }}>{r.name}</span>
            <span style={{ width: 110, textAlign: "right", fontFamily: display, fontSize: 60 }}>{r.pts}</span>
            <span style={{ width: 120, textAlign: "right", fontFamily: display, fontSize: 60, color: C.gold }}>
              {r.dg}
            </span>
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
          fontSize: 66,
          lineHeight: 1.1,
          color: C.gold,
          WebkitTextStroke: `10px ${C.ink}`,
          paintOrder: "stroke fill",
          opacity: sub,
          scale: `${interpolate(sub, [0, 1], [0.7, 1])}`,
        }}
      >
        Primera liga del City en 44 años
      </div>
      <Character {...ZABALETA} x={250} y={G} pose="celebrate" mood="happy" phase={5} />
      <Character {...AGUERO} x={540} y={G} pose="celebrate" mood="happy" holding="trophy" height={330} />
      <Character {...BALOTELLI} x={830} y={G} pose="celebrate" mood="happy" phase={14} facing="left" />
      <Sfx name="Ding tabla" file="ding.wav" from={8} volume={0.5} />
      <Sfx name="Ding 44" file="ding.wav" from={56} volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── 11. CTA ───────────── */
export const SceneCta: React.FC = () => {
  const frame = useCurrentFrame();
  const sub = interpolate(frame, [30, 40], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #2A5C93 0%, ${C.night} 75%)` }}>
      <Caption name="Pregunta" delay={2} accentWords="93:20?" accent={C.city} style={{ top: 420, fontSize: 100 }}>
        ¿Dónde estabas tú en el 93:20?
      </Caption>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 800,
          textAlign: "center",
          fontFamily: body,
          fontWeight: 900,
          fontSize: 50,
          lineHeight: 1.3,
          color: C.white,
          opacity: sub,
        }}
      >
        Cuéntamelo en comentarios
        <br />
        <span style={{ color: C.gold }}>y sígueme para más historias de fútbol</span>
      </div>
      <Character {...AGUERO} x={540} y={1450} height={380} pose="celebrate" mood="happy" holding="shirt" />
    </AbsoluteFill>
  );
};
