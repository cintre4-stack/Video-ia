import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { body, C, display, LAYOUT } from "../Reel9320/theme";
import { K } from "./Players";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Row: React.FC<{
  home: string;
  away: string;
  homeColor: string;
  awayColor: string;
  score: [number, number];
  tag: string;
  dim?: boolean;
  glow?: number;
  pop?: number;
}> = ({ home, away, homeColor, awayColor, score, tag, dim, glow = 0, pop = 1 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      height: dim ? 64 : 88,
      borderRadius: 18,
      background: "rgba(8,14,28,0.9)",
      border: "3px solid rgba(255,255,255,0.14)",
      boxShadow: `0 0 ${glow * 50}px ${glow * 10}px ${K.pool}`,
      opacity: dim ? 0.75 : 1,
      scale: `${pop}`,
      fontFamily: body,
      fontWeight: 900,
      color: C.white,
      overflow: "hidden",
      fontSize: dim ? 28 : 36,
    }}
  >
    <div style={{ width: 16, alignSelf: "stretch", background: homeColor }} />
    <div style={{ flex: 1, paddingLeft: 18, letterSpacing: 1 }}>{home}</div>
    <div
      style={{
        fontFamily: display,
        fontSize: dim ? 40 : 56,
        padding: "0 18px",
        background: "rgba(255,255,255,0.1)",
        alignSelf: "stretch",
        display: "flex",
        alignItems: "center",
      }}
    >
      {score[0]} - {score[1]}
    </div>
    <div style={{ flex: 1, textAlign: "right", paddingRight: 18, letterSpacing: 1 }}>{away}</div>
    <div style={{ width: 16, alignSelf: "stretch", background: awayColor }} />
    <div
      style={{
        width: 130,
        alignSelf: "stretch",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: dim ? "#444" : "#E8F4FF",
        color: dim ? C.white : C.ink,
        fontSize: dim ? 24 : 32,
      }}
    >
      {tag}
    </div>
  </div>
);

/**
 * First leg (always shown once played) + second leg live + aggregate pill.
 * Before the second leg, pass `leg="ida"` to show only the first leg live.
 */
export const AggregateBoard: React.FC<{
  leg: "ida" | "vuelta";
  ida: [number, number];
  vuelta?: [number, number];
  minute: string;
  /** frame at which the live row pops (a goal) */
  flashAt?: number;
}> = ({ leg, ida, vuelta = [0, 0], minute, flashAt }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const flashing = flashAt !== undefined && frame >= flashAt;
  const pop = flashing ? interpolate(frame - flashAt, [0, 4, 16], [1, 1.12, 1], clamp) : 1;
  const glow = flashing ? interpolate(frame - flashAt, [0, 30], [1, 0], clamp) : 0;
  // aggregate: Liverpool - Barça
  const agg: [number, number] = [vuelta[0] + ida[1], vuelta[1] + ida[0]];

  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: LAYOUT.hudTop,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity: enter,
        translate: `0 ${(1 - enter) * -40}px`,
      }}
    >
      {leg === "ida" ? (
        <Row
          home="BARÇA"
          away="LIVERPOOL"
          homeColor={K.barca}
          awayColor={K.pool}
          score={ida}
          tag={minute}
          pop={pop}
        />
      ) : (
        <>
          <Row home="BARÇA" away="LIVERPOOL" homeColor={K.barca} awayColor={K.pool} score={ida} tag="IDA" dim />
          <Row
            home="LIVERPOOL"
            away="BARÇA"
            homeColor={K.pool}
            awayColor={K.barca}
            score={vuelta}
            tag={minute}
            glow={glow}
            pop={pop}
          />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                fontFamily: body,
                fontWeight: 900,
                fontSize: 32,
                color: C.white,
                background: "rgba(8,14,28,0.9)",
                borderRadius: 999,
                padding: "6px 26px",
                border: "3px solid rgba(255,255,255,0.2)",
              }}
            >
              GLOBAL&nbsp;&nbsp;
              <span style={{ fontFamily: display, fontSize: 40, color: K.gold }}>
                LIV {agg[0]} - {agg[1]} BAR
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

type Who = "barca" | "liverpool" | "prorroga";
const WHO: Record<Who, { label: string; bg: string; fg: string }> = {
  barca: { label: "BARÇA", bg: K.barca, fg: C.white },
  liverpool: { label: "LIVERPOOL", bg: K.pool, fg: C.white },
  prorroga: { label: "PRÓRROGA", bg: "#E8E8E8", fg: C.ink },
};

/** "Si acaba así, a la final:" live indicator. */
export const FinalChip: React.FC<{ before: Who; after?: Who; changeAt?: number }> = ({
  before,
  after,
  changeAt = 0,
}) => {
  const frame = useCurrentFrame();
  const current = after && frame >= changeAt ? after : before;
  const pop =
    after && after !== before
      ? interpolate(frame - changeAt, [0, 5, 18], [1, 1.25, 1], clamp)
      : 1;
  const w = WHO[current];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: LAYOUT.chipTop, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 14px 12px 28px",
          borderRadius: 999,
          background: "rgba(8,14,28,0.9)",
          border: `4px solid ${w.bg}`,
          scale: `${pop}`,
          fontFamily: body,
          fontWeight: 900,
          color: C.white,
          fontSize: 34,
        }}
      >
        <span style={{ opacity: 0.85 }}>{current === "prorroga" ? "SI ACABA ASÍ:" : "A LA FINAL:"}</span>
        <span
          style={{
            fontFamily: display,
            fontSize: 44,
            background: w.bg,
            color: w.fg,
            borderRadius: 999,
            padding: "4px 24px",
          }}
        >
          {w.label}
        </span>
      </div>
    </div>
  );
};
