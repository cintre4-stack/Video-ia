import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, LAYOUT } from "./theme";

/** Night stadium: sky, floodlights, crowd stands and a striped pitch. */
export const Stadium: React.FC<{
  crowd: string[];
  /** 0 = calm, 1 = crowd jumping */
  hype?: number;
  /** tint the whole scene (e.g. dark blue when it goes wrong) */
  mood?: "normal" | "tense" | "dark";
}> = ({ crowd, hype = 0.2, mood = "normal" }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const standTop = 760;
  const standBottom = 1140;
  const rows = 9;
  const cols = 30;

  return (
    <AbsoluteFill style={{ backgroundColor: C.night }}>
      {/* sky */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.night} 0%, ${C.night2} 45%, #1E3D6B 70%)`,
        }}
      />
      {/* floodlights */}
      {[140, 940].map((lx) => (
        <React.Fragment key={lx}>
          <div
            style={{
              position: "absolute",
              left: lx - 260,
              top: 420,
              width: 520,
              height: 520,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,250,220,0.35) 0%, rgba(255,250,220,0) 65%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: lx - 60,
              top: 640,
              width: 120,
              height: 46,
              borderRadius: 10,
              background: "#FFF8D6",
              boxShadow: "0 0 60px 20px rgba(255,248,214,0.6)",
            }}
          />
        </React.Fragment>
      ))}
      {/* stand */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: standTop,
          width,
          height: standBottom - standTop,
          background: "#16223A",
          borderTop: "10px solid #24365A",
        }}
      >
        <svg width={width} height={standBottom - standTop}>
          {new Array(rows).fill(0).map((_, r) =>
            new Array(cols).fill(0).map((__, c) => {
              const seed = r * 100 + c;
              const color = crowd[Math.floor(random(seed) * crowd.length)];
              const jump =
                Math.max(0, Math.sin(frame * 0.5 + random(seed + 1) * 6.28)) * 14 * hype;
              const cx = (c + 0.5) * (width / cols) + (r % 2) * 12;
              const cy = 30 + r * 40 - jump;
              return (
                <g key={seed}>
                  <circle cx={cx} cy={cy} r={11} fill={color} />
                  <rect x={cx - 13} y={cy + 9} width={26} height={22} rx={8} fill={color} opacity={0.85} />
                </g>
              );
            }),
          )}
        </svg>
      </div>
      {/* advertising boards */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: standBottom,
          width,
          height: 44,
          background: "linear-gradient(90deg,#0E2A4D,#123766,#0E2A4D)",
          borderTop: "4px solid #2C4E80",
        }}
      />
      {/* pitch */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: standBottom + 44,
          width,
          bottom: 0,
          background: `repeating-linear-gradient(90deg, ${C.grass1} 0px, ${C.grass1} 90px, ${C.grass2} 90px, ${C.grass2} 180px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: LAYOUT.ground + 20,
          width,
          height: 6,
          background: "rgba(255,255,255,0.55)",
        }}
      />
      {mood !== "normal" && (
        <AbsoluteFill
          style={{
            background:
              mood === "dark"
                ? "radial-gradient(circle at 50% 60%, rgba(0,0,0,0.15) 30%, rgba(0,0,10,0.75) 100%)"
                : `radial-gradient(circle at 50% 60%, rgba(0,0,0,0) 35%, rgba(120,0,0,${interpolate(
                    Math.sin(frame * 0.35),
                    [-1, 1],
                    [0.25, 0.55],
                  )}) 100%)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

/** Side-on goal, right edge of frame. `shake` 0..1 bulges the net. */
export const Goal: React.FC<{ shake?: number; side?: "right" | "left" }> = ({
  shake = 0,
  side = "right",
}) => {
  const frame = useCurrentFrame();
  const bulge = shake * 26 * Math.cos(frame * 0.9) * Math.exp(-shake * 0.2);
  const left = side === "right" ? 830 : 30;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: LAYOUT.ground - 330,
        width: 230,
        height: 360,
        scale: side === "left" ? "-1 1" : "1 1",
      }}
    >
      <svg width={230} height={360} style={{ overflow: "visible" }}>
        <defs>
          <pattern id="net" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 0 0 L 22 22 M 22 0 L 0 22" stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
          </pattern>
        </defs>
        <path
          d={`M 24 20 L ${200 + bulge} 60 L ${210 + bulge} 340 L 24 340 Z`}
          fill="url(#net)"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={3}
        />
        {/* posts */}
        <rect x={14} y={12} width={20} height={340} rx={6} fill="#FFFFFF" />
        <rect x={14} y={12} width={190} height={18} rx={6} fill="#FFFFFF" transform="skewY(12) translate(0 -3)" />
      </svg>
    </div>
  );
};

export const Ball: React.FC<{ x: number; y: number; size?: number; spin?: number }> = ({
  x,
  y,
  size = 54,
  spin = 0,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      rotate: `${spin}deg`,
    }}
  >
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx={50} cy={50} r={47} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
      <polygon points="50,30 68,43 61,64 39,64 32,43" fill={C.ink} />
      <path d="M 50 30 L 50 5 M 68 43 L 92 35 M 61 64 L 76 86 M 39 64 L 24 86 M 32 43 L 8 35" stroke={C.ink} strokeWidth={4} />
    </svg>
  </div>
);

/** Full-frame white flash, 0..1 */
export const Flash: React.FC<{ amount: number; color?: string }> = ({ amount, color = "#FFFFFF" }) =>
  amount <= 0 ? null : <AbsoluteFill style={{ backgroundColor: color, opacity: amount }} />;

/** Confetti burst from top. */
export const Confetti: React.FC<{ start: number; colors: string[]; count?: number }> = ({
  start,
  colors,
  count = 90,
}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x0 = random(`cx${i}`) * 1080;
        const vy = 6 + random(`cv${i}`) * 9;
        const sway = Math.sin(t * 0.15 + i) * 40;
        const y = -60 + t * vy - random(`cd${i}`) * 400;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x0 + sway,
              top: y,
              width: 18,
              height: 30,
              borderRadius: 4,
              background: colors[i % colors.length],
              rotate: `${t * (5 + random(`cr${i}`) * 10)}deg`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
