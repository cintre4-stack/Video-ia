import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Character } from "./Character";
import { GOAL_FRAME, GoalPlay } from "./GoalPlay";
import { Caption, LiveChampion, MinuteBadge, Scoreboard } from "./Hud";
import {
  AGUERO,
  BARTON,
  CISSE,
  KEEPER_CITY,
  KEEPER_QPR,
  KEEPER_SUN,
  MACKIE,
  REFEREE,
  ROONEY,
  ZABALETA,
} from "./Players";
import { Sfx } from "./Sfx";
import { Confetti, Flash, Stadium } from "./Stage";
import { body, C, display, LAYOUT } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ETIHAD_CROWD = [C.city, C.city, C.white, C.cityDark, C.city];
export const SUNDERLAND_CROWD = [C.sunderland, C.white, C.sunderland, C.utd, C.ink];

/* ───────────── 1. HOOK ───────────── */
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const seconds = Math.min(17 + Math.floor(frame / 12), 20);
  const hit = 36;
  const shake = frame >= hit ? Math.sin(frame * 3) * interpolate(frame - hit, [0, 14], [18, 0], clamp) : 0;
  return (
    <AbsoluteFill
      style={{ background: `radial-gradient(circle at 50% 45%, #1C3A66 0%, ${C.night} 70%)` }}
    >
      <div
        style={{
          position: "absolute",
          top: 270,
          width: "100%",
          textAlign: "center",
          fontFamily: body,
          fontWeight: 900,
          fontSize: 44,
          letterSpacing: 6,
          color: "rgba(255,255,255,0.75)",
        }}
      >
        13 · MAYO · 2012
      </div>
      <div
        style={{
          position: "absolute",
          top: 360,
          width: "100%",
          textAlign: "center",
          fontFamily: display,
          fontSize: 300,
          color: frame >= hit ? C.city : C.white,
          WebkitTextStroke: `16px ${C.ink}`,
          paintOrder: "stroke fill",
          translate: `${shake}px 0`,
          scale: `${interpolate(frame, [hit, hit + 5, hit + 14], [1, 1.18, 1.05], clamp)}`,
          textShadow: frame >= hit ? `0 0 60px ${C.city}` : "none",
        }}
      >
        93:{String(seconds).padStart(2, "0")}
      </div>
      <Caption
        name="Hook"
        delay={hit + 6}
        accentWords="Manchester"
        accent={C.city}
        style={{ top: 720 }}
      >
        El segundo que cambió Manchester para siempre
      </Caption>
      <Character
        {...AGUERO}
        x={540}
        y={1500}
        height={420}
        pose={frame >= hit ? "celebrate" : "idle"}
        mood={frame >= hit ? "happy" : "worried"}
        opacity={interpolate(frame, [hit, hit + 6], [0.15, 1], clamp)}
      />
      <Confetti start={hit} colors={[C.city, C.white, C.gold]} count={60} />
      <Flash amount={interpolate(frame, [hit, hit + 2, hit + 8], [0, 0.8, 0], clamp)} />
      <Sfx name="Latido" file="heartbeat.wav" from={0} durationInFrames={hit} volume={0.9} />
      <Sfx name="Boom 93:20" file="boom.wav" from={hit} volume={1} />
      <Sfx name="Grito" file="roar.wav" from={hit} volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── 2. CONTEXTO ───────────── */
export const SceneContext: React.FC = () => {
  const frame = useCurrentFrame();
  const split = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const table = interpolate(frame, [40, 54], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const sub = interpolate(frame, [75, 85], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: C.city,
          clipPath: `polygon(0 0, ${58 * split}% 0, ${42 * split}% 100%, 0 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: C.utd,
          clipPath: `polygon(${100 - 42 * split}% 0, 100% 0, 100% 100%, ${100 - 58 * split}% 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: LAYOUT.hudTop + 10,
          width: "100%",
          textAlign: "center",
          fontFamily: body,
          fontWeight: 900,
          fontSize: 44,
          letterSpacing: 4,
          color: C.white,
        }}
      >
        PREMIER LEAGUE · ÚLTIMA JORNADA
      </div>
      <Caption name="Contexto" delay={4} accentWords="título." style={{ top: 340 }}>
        Dos equipos. Una ciudad. Un solo título.
      </Caption>
      {/* standings card */}
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 640,
          borderRadius: 28,
          background: "rgba(8,14,28,0.92)",
          border: "4px solid rgba(255,255,255,0.2)",
          padding: "18px 28px",
          fontFamily: body,
          fontWeight: 900,
          color: C.white,
          opacity: table,
          translate: `0 ${(1 - table) * 60}px`,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, opacity: 0.6, paddingBottom: 8 }}>
          <span style={{ flex: 1 }}>ANTES DEL ÚLTIMO PARTIDO</span>
          <span style={{ width: 120, textAlign: "right" }}>PTS</span>
          <span style={{ width: 130, textAlign: "right" }}>DG</span>
        </div>
        {[
          { pos: 1, name: "MAN CITY", pts: 86, dg: "+63", color: C.city },
          { pos: 2, name: "MAN UTD", pts: 86, dg: "+55", color: C.utd },
        ].map((r) => (
          <div
            key={r.name}
            style={{ display: "flex", alignItems: "center", fontSize: 50, padding: "8px 0" }}
          >
            <span style={{ width: 50, opacity: 0.6 }}>{r.pos}</span>
            <span
              style={{ width: 18, height: 50, background: r.color, borderRadius: 6, marginRight: 18 }}
            />
            <span style={{ flex: 1 }}>{r.name}</span>
            <span style={{ width: 120, textAlign: "right", fontFamily: display, fontSize: 60 }}>{r.pts}</span>
            <span style={{ width: 130, textAlign: "right", fontFamily: display, fontSize: 60, color: C.gold }}>
              {r.dg}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 960,
          textAlign: "center",
          fontFamily: body,
          fontWeight: 900,
          fontSize: 46,
          lineHeight: 1.2,
          color: C.white,
          opacity: sub,
          textShadow: "0 4px 0 rgba(0,0,0,0.4)",
        }}
      >
        Empatados a puntos.
        <br />
        El City manda por <span style={{ color: C.gold }}>diferencia de goles</span>.
      </div>
      <Character {...AGUERO} x={270} y={1470} height={300} pose="idle" mood="worried" />
      <Character {...ROONEY} x={810} y={1470} height={300} pose="idle" mood="neutral" facing="left" />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1260,
          textAlign: "center",
          fontFamily: display,
          fontSize: 120,
          color: C.gold,
          WebkitTextStroke: `12px ${C.ink}`,
          paintOrder: "stroke fill",
          scale: `${interpolate(frame, [10, 18, 26], [0, 1.3, 1], clamp)}`,
        }}
      >
        VS
      </div>
      <Sfx name="Whoosh" file="whoosh.wav" from={0} volume={0.6} />
      <Sfx name="Tabla" file="ding.wav" from={42} volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── 3. ROONEY 20' ───────────── */
export const SceneRooney: React.FC = () => {
  const frame = useCurrentFrame();
  const start = 15;
  const goal = start + GOAL_FRAME.shot;
  return (
    <AbsoluteFill>
      <Stadium crowd={SUNDERLAND_CROWD} hype={frame >= goal ? 0.8 : 0.2} />
      <Sequence name="Jugada Rooney" from={start} layout="none">
        <GoalPlay kind="shot" scorer={ROONEY} keeper={KEEPER_SUN} reaction="roar" />
      </Sequence>
      <Scoreboard
        city={[0, 0]}
        utd={frame >= goal ? [0, 1] : [0, 0]}
        minuteCity="20'"
        minuteUtd="20'"
        flashRow="utd"
        flashAt={goal}
      />
      <MinuteBadge text="20' · EN SUNDERLAND" color={C.utd} />
      <Caption name="Rooney" delay={4} accentWords="Rooney" accent={C.utd}>
        Golpea primero el United: Rooney
      </Caption>
      <LiveChampion before="city" after="utd" changeAt={goal} />
    </AbsoluteFill>
  );
};

/* ───────────── 4. ZABALETA 39' ───────────── */
export const SceneZabaleta: React.FC = () => {
  const frame = useCurrentFrame();
  const start = 15;
  const goal = start + GOAL_FRAME.shot;
  return (
    <AbsoluteFill>
      <Stadium crowd={ETIHAD_CROWD} hype={frame >= goal ? 1 : 0.3} />
      <Sequence name="Jugada Zabaleta" from={start} layout="none">
        <GoalPlay kind="shot" scorer={ZABALETA} keeper={KEEPER_QPR} reaction="roar" />
      </Sequence>
      <Scoreboard
        city={frame >= goal ? [1, 0] : [0, 0]}
        utd={[0, 1]}
        minuteCity="39'"
        minuteUtd="39'"
        flashRow="city"
        flashAt={goal}
      />
      <MinuteBadge text="39' · EN EL ETIHAD" color={C.city} textColor={C.cityDark} />
      <Caption name="Zabaleta" delay={4} accentWords="Zabaleta!" accent={C.city}>
        Responde el City: ¡Zabaleta!
      </Caption>
      <LiveChampion before="utd" after="city" changeAt={goal} />
    </AbsoluteFill>
  );
};

/* ───────────── 5. REMONTADA DEL QPR ───────────── */
export const SceneQpr: React.FC = () => {
  const frame = useCurrentFrame();
  const beat = 70;
  const cisseGoal = GOAL_FRAME.shot;
  const mackieGoal = 2 * beat + GOAL_FRAME.header;
  const city: [number, number] = frame >= mackieGoal ? [1, 2] : frame >= cisseGoal ? [1, 1] : [1, 0];
  const minute = frame < beat ? "48'" : frame < 2 * beat ? "55'" : "66'";
  const barton = frame - beat;
  return (
    <AbsoluteFill>
      <Stadium
        crowd={ETIHAD_CROWD}
        hype={0.15}
        mood={frame >= mackieGoal ? "dark" : "normal"}
      />
      <Sequence name="Gol Cissé" durationInFrames={beat} layout="none">
        <GoalPlay kind="shot" scorer={CISSE} keeper={KEEPER_CITY} reaction="groan" shout="1-1" shoutColor={C.white} />
        <MinuteBadge text="48'" color={C.qpr} />
        <Caption name="Cissé" delay={2} accentWords="Cissé">
          Pero empata Cissé
        </Caption>
      </Sequence>
      <Sequence name="Roja Barton" from={beat} durationInFrames={beat} layout="none">
        <Character {...REFEREE} x={330} y={LAYOUT.ground} holding="redcard" mood="shout" pose="idle" />
        <Character
          {...BARTON}
          x={interpolate(barton, [10, 70], [600, 900], clamp)}
          y={LAYOUT.ground}
          pose={barton > 10 ? "run" : "idle"}
          mood="shout"
          facing={barton > 10 ? "right" : "left"}
        />
        <MinuteBadge text="55'" color="#E3121B" />
        <Caption name="Barton" delay={2} accentWords="Barton." accent="#FF4B4B">
          Roja a Barton. QPR, con 10.
        </Caption>
        <Sfx name="Silbato roja" file="whistle.wav" from={0} volume={0.7} />
      </Sequence>
      <Sequence name="Gol Mackie" from={2 * beat} durationInFrames={beat} layout="none">
        <GoalPlay kind="header" scorer={MACKIE} keeper={KEEPER_CITY} reaction="groan" shout="1-2" shoutColor="#FF4B4B" />
        <MinuteBadge text="66'" color={C.qpr} />
        <Caption name="Mackie" delay={2} accentWords="1-2" accent="#FF4B4B">
          ¡Y Mackie hace el 1-2!
        </Caption>
      </Sequence>
      <Scoreboard
        city={city}
        utd={[0, 1]}
        minuteCity={minute}
        minuteUtd={minute}
        flashRow="city"
        flashAt={frame >= mackieGoal ? mackieGoal : cisseGoal}
      />
      <LiveChampion before="city" after="utd" changeAt={cisseGoal} />
    </AbsoluteFill>
  );
};
