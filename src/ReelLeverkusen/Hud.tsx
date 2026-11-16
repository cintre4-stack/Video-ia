import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { body, C, display, LAYOUT } from "../Reel9320/theme";
import { K } from "./Players";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** TV-style single-match scoreboard at the top. */
export const MatchBoard: React.FC<{
  home: string;
  away: string;
  homeColor: string;
  awayColor: string;
  score: [number, number];
  tag: string;
  /** frame at which the score pops (a goal) */
  flashAt?: number;
}> = ({ home, away, homeColor, awayColor, score, tag, flashAt }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const flashing = flashAt !== undefined && frame >= flashAt;
  const pop = flashing ? interpolate(frame - flashAt, [0, 4, 16], [1, 1.12, 1], clamp) : 1;
  const glow = flashing ? interpolate(frame - flashAt, [0, 30], [1, 0], clamp) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: LAYOUT.hudTop,
        opacity: enter,
        translate: `0 ${(1 - enter) * -40}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 92,
          borderRadius: 18,
          background: "rgba(8,10,16,0.92)",
          border: "3px solid rgba(255,255,255,0.14)",
          boxShadow: `0 0 ${glow * 50}px ${glow * 10}px ${K.lev}`,
          scale: `${pop}`,
          fontFamily: body,
          fontWeight: 900,
          color: C.white,
          overflow: "hidden",
          fontSize: 36,
        }}
      >
        <div style={{ width: 16, alignSelf: "stretch", background: homeColor }} />
        <div style={{ flex: 1, paddingLeft: 18, letterSpacing: 1 }}>{home}</div>
        <div
          style={{
            fontFamily: display,
            fontSize: 58,
            padding: "0 20px",
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
            minWidth: 130,
            padding: "0 12px",
            alignSelf: "stretch",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: K.lev,
            color: C.white,
            fontSize: 32,
          }}
        >
          {tag}
        </div>
      </div>
    </div>
  );
};

/** Running "league defeats" pill at the bottom: the reel's through-line. */
export const LossChip: React.FC<{ label?: string; value: string; color?: string; pulseAt?: number }> = ({
  label = "DERROTAS EN LIGA:",
  value,
  color = K.lev,
  pulseAt,
}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [4, 14], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const pop = pulseAt !== undefined ? interpolate(frame - pulseAt, [0, 5, 18], [1, 1.25, 1], clamp) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: LAYOUT.chipTop,
        display: "flex",
        justifyContent: "center",
        opacity: enter,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 14px 12px 28px",
          borderRadius: 999,
          background: "rgba(8,10,16,0.92)",
          border: `4px solid ${color}`,
          scale: `${pop}`,
          fontFamily: body,
          fontWeight: 900,
          color: C.white,
          fontSize: 34,
        }}
      >
        <span style={{ opacity: 0.85 }}>{label}</span>
        <span
          style={{
            fontFamily: display,
            fontSize: 46,
            background: color,
            color: C.white,
            borderRadius: 999,
            padding: "2px 26px",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

/** Rubber stamp that slams in (scale 2.4 → 1) and stays. */
export const Stamp: React.FC<{
  text: string;
  at: number;
  top: number;
  color?: string;
  rotate?: number;
  fontSize?: number;
  left?: number;
  right?: number;
}> = ({ text, at, top, color = "#E8222E", rotate = -10, fontSize = 120, left = 0, right = 0 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const s = interpolate(frame - at, [0, 5, 9], [2.4, 0.92, 1], clamp);
  return (
    <div style={{ position: "absolute", left, right, top, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: display,
          fontSize,
          lineHeight: 1,
          color,
          border: `10px solid ${color}`,
          borderRadius: 22,
          padding: "6px 30px 2px",
          background: "rgba(255,255,255,0.08)",
          rotate: `${rotate}deg`,
          scale: `${s}`,
          opacity: interpolate(frame - at, [0, 3], [0, 0.95], clamp),
          textShadow: "0 4px 0 rgba(0,0,0,0.35)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** VHS rewind overlay: scanlines, tracking bar, RGB tint and a "◀◀" label. 0..1 */
export const VhsRewind: React.FC<{ amount: number; label?: string }> = ({ amount, label = "◀◀ REBOBINANDO" }) => {
  const frame = useCurrentFrame();
  if (amount <= 0) return null;
  const barY = (frame * 97) % 1920;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: amount }}>
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(180deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 3px, transparent 3px, transparent 7px)",
        }}
      />
      <AbsoluteFill style={{ background: "rgba(40,0,80,0.25)", mixBlendMode: "screen" }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: barY,
          height: 90,
          background: "rgba(255,255,255,0.18)",
          filter: "blur(6px)",
        }}
      />
      {new Array(6).fill(0).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: random(`vhs${i}-${Math.floor(frame / 2)}`) * 1920,
            height: 4 + random(`vh${i}`) * 10,
            background: "rgba(255,255,255,0.4)",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 250,
          fontFamily: "monospace",
          fontWeight: 900,
          fontSize: 64,
          color: C.white,
          textShadow: "4px 0 0 #FF2A6D, -4px 0 0 #05D9E8",
          opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0.4,
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};

/** Big outlined title word, Lilita style. */
export const BigWord: React.FC<{
  children: React.ReactNode;
  top: number;
  size?: number;
  color?: string;
  scale?: number;
  shake?: number;
  glow?: string;
}> = ({ children, top, size = 190, color = C.white, scale = 1, shake = 0, glow }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: display,
      fontSize: size,
      lineHeight: 1,
      color,
      WebkitTextStroke: `${Math.round(size / 13)}px ${C.ink}`,
      paintOrder: "stroke fill",
      translate: `${shake}px 0`,
      scale: `${scale}`,
      textShadow: glow ? `0 0 60px ${glow}` : "0 10px 0 rgba(0,0,0,0.35)",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);
