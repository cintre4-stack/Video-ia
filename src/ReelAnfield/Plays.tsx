import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Character } from "../Reel9320/Character";
import { Sfx } from "../Reel9320/Sfx";
import { Ball, Flash, Goal } from "../Reel9320/Stage";
import { C, display, LAYOUT } from "../Reel9320/theme";
import { ALISSON, BALL_BOY, BARCA_A, BARCA_B, BARCA_C, MESSI, ORIGI, POOL_A, POOL_B, TER_STEGEN, TRENT } from "./Players";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const G = LAYOUT.ground;

const Shout: React.FC<{ text: string; at: number; color?: string; top?: number }> = ({
  text,
  at,
  color = C.gold,
  top = 880,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        textAlign: "center",
        fontFamily: display,
        fontSize: 170,
        color,
        WebkitTextStroke: `18px ${C.ink}`,
        paintOrder: "stroke fill",
        scale: `${interpolate(frame - at, [0, 6, 14], [0, 1.25, 1], clamp)}`,
        rotate: "-6deg",
        opacity: interpolate(frame - at, [34, 46], [1, 0], clamp),
      }}
    >
      {text}
    </div>
  );
};

/** Local frame at which Messi's free kick hits the net. */
export const FREE_KICK_GOAL = 74;

/** Messi free kick over a jumping Liverpool wall into the top corner. */
export const FreeKick: React.FC = () => {
  const frame = useCurrentFrame();
  const contact = 50;
  const goal = FREE_KICK_GOAL;
  const scored = frame >= goal;
  const mx = interpolate(frame, [22, 44], [230, 330], clamp);
  const pose = scored ? "celebrate" : frame >= 40 ? "kick" : frame >= 22 ? "run" : "idle";
  const action = interpolate(frame, [40, 56], [0, 1], clamp);

  let bx = 395;
  let by = G - 26;
  if (frame >= contact) {
    const t = interpolate(frame, [contact, goal], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
    // quadratic bezier: ball → over the wall → top corner
    const p0 = [395, G - 26];
    const p1 = [640, G - 560];
    const p2 = [955, G - 290];
    bx = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
    by = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
  }
  if (scored) {
    bx = 975;
    by = Math.min(G - 290 + (frame - goal) ** 2 * 1.4, G - 30);
  }
  const wallJump = Math.max(0, Math.sin(interpolate(frame, [contact - 2, contact + 18], [0, Math.PI], clamp))) * 90;
  const dive = interpolate(frame, [contact + 8, goal + 4], [0, 1], clamp);

  return (
    <>
      <Goal shake={scored ? interpolate(frame - goal, [0, 24], [1, 0], clamp) : 0} />
      <Character {...ALISSON} x={interpolate(dive, [0, 1], [930, 905])} y={G} height={270} facing="left"
        pose={dive > 0 ? "dive" : "idle"} action={dive} mood={scored ? "sad" : "worried"} />
      {[560, 615, 670].map((wx, i) => (
        <Character key={wx} {...(i === 1 ? POOL_B : POOL_A)} x={wx} y={G} height={270} facing="left"
          pose={wallJump > 4 ? "header" : "idle"} lift={wallJump} mood="worried" phase={i * 9} />
      ))}
      <Character {...MESSI} x={mx} y={G} pose={pose} action={action} mood={scored ? "happy" : "neutral"} />
      <Ball x={bx} y={by} spin={frame * 14} />
      <Flash amount={scored ? interpolate(frame - goal, [0, 2, 8], [0, 0.7, 0], clamp) : 0} />
      <Shout text="¡GOLAZO!" at={goal} />
      <Sfx name="Golpeo falta" file="kick.wav" from={contact} volume={0.9} />
      <Sfx name="Grito Camp Nou" file="roar.wav" from={goal} volume={0.7} />
    </>
  );
};

/** Local frame at which Origi's shot from the quick corner hits the net. */
export const CORNER_GOAL = 150;

/** Trent pretends to walk away, then takes the corner quickly; Origi finishes first time. */
export const QuickCorner: React.FC = () => {
  const frame = useCurrentFrame();
  const turn = 96;
  const cross = 108;
  const strike = 130;
  const goal = CORNER_GOAL;
  const scored = frame >= goal;

  // Ball: ball boy → Trent → cross → Origi → net
  let bx: number;
  let by: number;
  if (frame < 18) {
    bx = interpolate(frame, [0, 18], [40, 120], clamp);
    by = G - 26 - Math.sin(interpolate(frame, [0, 18], [0, Math.PI], clamp)) * 120;
  } else if (frame < cross) {
    bx = 120;
    by = G - 26;
  } else if (frame < strike) {
    const t = interpolate(frame, [cross, strike], [0, 1], clamp);
    bx = interpolate(t, [0, 1], [120, 600]);
    by = G - 26 - Math.sin(t * Math.PI) * 40;
  } else {
    const t = interpolate(frame, [strike, goal], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
    bx = interpolate(t, [0, 1], [640, 960]);
    by = G - 26 - 300 * t;
  }
  if (scored) {
    bx = 980;
    by = Math.min(G - 326 + (frame - goal) ** 2 * 1.4, G - 30);
  }

  // Trent walks away from the ball (facing left) then spins back to cross.
  const tx = frame < turn ? interpolate(frame, [40, turn], [100, 30], clamp) : interpolate(frame, [turn, cross], [30, 60], clamp);
  const trentPose = scored ? "celebrate" : frame >= cross - 6 ? "kick" : frame >= 40 ? "run" : "idle";
  const trentAction = interpolate(frame, [cross - 6, cross + 6], [0.3, 1], clamp);
  const origiPose = scored ? "celebrate" : frame >= strike - 8 ? "kick" : "idle";
  const origiAction = interpolate(frame, [strike - 8, strike + 6], [0.3, 1], clamp);
  const dive = interpolate(frame, [strike + 4, goal + 4], [0, 1], clamp);
  // Barça players turned away, then react far too late
  const late = frame >= strike;

  return (
    <>
      <Goal shake={scored ? interpolate(frame - goal, [0, 24], [1, 0], clamp) : 0} />
      <Character {...TER_STEGEN} x={interpolate(dive, [0, 1], [930, 900])} y={G} height={270} facing="left"
        pose={dive > 0 ? "dive" : "idle"} action={dive} mood={late ? "shout" : "neutral"} />
      <Character {...BARCA_A} x={760} y={G} height={280} facing="right" pose={late ? "sad" : "idle"} mood={late ? "worried" : "neutral"} phase={4} />
      <Character {...BARCA_B} x={450} y={G} height={280} facing="right" pose={late ? "sad" : "idle"} mood={late ? "worried" : "neutral"} phase={13} />
      <Character {...BARCA_C} x={820} y={G - 4} height={260} facing="right" pose={late ? "sad" : "idle"} mood={late ? "worried" : "neutral"} phase={22} />
      <Character {...BALL_BOY} x={60} y={G} facing="right" pose={frame < 20 ? "kick" : "idle"} action={interpolate(frame, [0, 10], [0.3, 1], clamp)} mood="happy" />
      <Character {...TRENT} x={tx + 40} y={G} facing={frame < turn ? "left" : "right"} pose={trentPose} action={trentAction}
        mood={scored ? "happy" : frame >= turn ? "shout" : "neutral"} />
      <Character {...ORIGI} x={590} y={G} pose={origiPose} action={origiAction} mood={scored ? "happy" : "neutral"} phase={7} />
      <Ball x={bx} y={by} spin={frame * 16} />
      <Flash amount={scored ? interpolate(frame - goal, [0, 2, 10], [0, 0.9, 0], clamp) : 0} />
      <Shout text="¡ORIGI!" at={goal} color="#FFFFFF" />
      {frame >= turn && frame < strike && (
        <div style={{ position: "absolute", left: 40, top: G - 420, fontFamily: display, fontSize: 70, color: C.gold,
          WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill", rotate: "-8deg",
          scale: `${interpolate(frame - turn, [0, 5, 10], [0, 1.2, 1], clamp)}` }}>
          ¡RÁPIDO!
        </div>
      )}
      <Sfx name="Recogepelotas" file="whoosh.wav" from={0} volume={0.5} />
      <Sfx name="Centro Trent" file="kick.wav" from={cross} volume={0.7} />
      <Sfx name="Remate Origi" file="kick.wav" from={strike} volume={1} />
      <Sfx name="Boom Anfield" file="boom.wav" from={goal} volume={0.9} />
      <Sfx name="Anfield explota" file="roar.wav" from={goal} volume={0.9} />
    </>
  );
};
