import { Audio } from "@remotion/media";
import React from "react";
import { Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Character, type CharacterProps } from "./Character";
import { SFX_GAIN } from "./Sfx";
import { Ball, Flash, Goal } from "./Stage";
import { display, C, LAYOUT } from "./theme";

type Look = Omit<CharacterProps, "x" | "y">;

/** Local frame at which the ball crosses the line, per play type. */
export const GOAL_FRAME = { shot: 44, header: 40 } as const;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const G = LAYOUT.ground;

/**
 * One goal, choreographed: run-up + shot, or cross + header.
 * Everything is relative to the Sequence it is placed in.
 */
export const GoalPlay: React.FC<{
  kind: "shot" | "header";
  scorer: Look;
  keeper: Look;
  reaction: "roar" | "groan";
  /** big word that pops on the goal */
  shout?: string;
  shoutColor?: string;
}> = ({ kind, scorer, keeper, reaction, shout = "¡GOL!", shoutColor = C.gold }) => {
  const frame = useCurrentFrame();
  const goalAt = GOAL_FRAME[kind];
  const scored = frame >= goalAt;

  let sx: number;
  let pose: CharacterProps["pose"];
  let action = 0;
  let lift = 0;
  let ballX: number;
  let ballY: number;
  let contact: number;

  if (kind === "shot") {
    contact = 30;
    sx = interpolate(frame, [0, 24], [120, 470], clamp);
    pose = frame < 24 ? "run" : scored ? "celebrate" : "kick";
    action = interpolate(frame, [24, 34], [0, 1], clamp);
    if (frame < contact) {
      ballX = sx + 60 + Math.max(0, Math.sin(frame * 0.55)) * 14;
      ballY = G - 26;
    } else {
      const t = interpolate(frame, [contact, goalAt], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
      ballX = interpolate(t, [0, 1], [540, 960]);
      ballY = G - 26 - 170 * t - Math.sin(t * Math.PI) * 140;
    }
  } else {
    contact = 26;
    sx = 600;
    pose = scored ? "celebrate" : "header";
    lift = frame < contact + 4 ? Math.max(0, Math.sin(interpolate(frame, [14, 34], [0, Math.PI], clamp))) * 120 : 0;
    action = interpolate(frame, [18, 30], [0, 1], clamp);
    if (frame < contact) {
      const t = interpolate(frame, [0, contact], [0, 1], clamp);
      ballX = interpolate(t, [0, 1], [-60, 640]);
      ballY = G - 560 + 280 * t - Math.sin(t * Math.PI) * 200;
    } else {
      const t = interpolate(frame, [contact, goalAt], [0, 1], clamp);
      ballX = interpolate(t, [0, 1], [650, 965]);
      ballY = interpolate(t, [0, 1], [G - 280 - 20, G - 150]);
    }
  }

  if (scored) {
    // ball drops inside the net
    const t = frame - goalAt;
    ballX = (kind === "shot" ? 960 : 965) + Math.min(t, 6) * 3;
    ballY = Math.min((kind === "shot" ? G - 196 : G - 150) + t * t * 1.4, G - 30);
  }

  const keeperDive = interpolate(frame, [contact + 2, goalAt + 4], [0, 1], clamp);
  const shake = scored ? interpolate(frame - goalAt, [0, 24], [1, 0], clamp) : 0;
  const flash = scored ? interpolate(frame - goalAt, [0, 2, 8], [0.0, 0.7, 0], clamp) : 0;
  const shoutScale = interpolate(frame - goalAt, [0, 6, 14], [0, 1.25, 1], clamp);

  return (
    <>
      <Goal shake={shake} />
      <Character
        {...keeper}
        x={interpolate(keeperDive, [0, 1], [930, 900])}
        y={G}
        height={270}
        facing="left"
        pose={keeperDive > 0 ? "dive" : "idle"}
        action={keeperDive}
        mood={scored ? "sad" : "worried"}
      />
      <Character
        {...scorer}
        x={sx}
        y={G}
        pose={pose}
        action={action}
        lift={lift}
        mood={scored ? (reaction === "roar" ? "happy" : "shout") : "neutral"}
        height={scorer.height ?? 300}
      />
      <Ball x={ballX} y={ballY - lift * 0} spin={frame * 18} />
      <Flash amount={flash} />
      {scored && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 880,
            textAlign: "center",
            fontFamily: display,
            fontSize: 190,
            color: shoutColor,
            WebkitTextStroke: `18px ${C.ink}`,
            paintOrder: "stroke fill",
            scale: `${shoutScale}`,
            rotate: "-6deg",
            opacity: interpolate(frame - goalAt, [30, 42], [1, 0], clamp),
          }}
        >
          {shout}
        </div>
      )}
      <Sequence name="SFX patada" from={contact} durationInFrames={10} layout="none">
        <Audio src={staticFile("sfx/kick.wav")} volume={0.9 * SFX_GAIN} />
      </Sequence>
      <Sequence name={`SFX ${reaction}`} from={goalAt} durationInFrames={120} layout="none">
        <Audio src={staticFile(`sfx/${reaction}.wav`)} volume={(reaction === "roar" ? 0.7 : 0.8) * SFX_GAIN} />
      </Sequence>
    </>
  );
};
