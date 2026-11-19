import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../Reel9320/theme";

export type DogPose = "idle" | "walk" | "sniff" | "happy" | "sit" | "lick" | "shock";

/**
 * Pickles: chibi black-and-white collie mix. Big head, floppy ears,
 * white blaze and chest, wagging tail. Drawn facing right.
 */
export const Dog: React.FC<{
  x: number;
  /** feet baseline */
  y: number;
  height?: number;
  pose?: DogPose;
  facing?: "left" | "right";
  phase?: number;
  lift?: number;
  /** golden trophy held in the mouth */
  trophy?: boolean;
  medal?: boolean;
  /** leash anchor in the collar (for drawing the lead from outside) */
  opacity?: number;
}> = ({ x, y, height = 240, pose = "idle", facing = "right", phase = 0, lift = 0, trophy, medal, opacity = 1 }) => {
  const f = useCurrentFrame() + phase;
  const s = height / 240;

  let bob = 0;
  let headDy = 0;
  let headRot = 0;
  let legA = 0;
  let tailSpeed = 0.5;
  let tailAmp = 18;
  let tongue = false;
  let eyes: "open" | "happy" | "big" = "open";
  let bodyRot = 0;

  const cyc = Math.sin(f * 0.5);
  switch (pose) {
    case "idle":
      bob = Math.sin(f * 0.15) * 2;
      break;
    case "walk":
      legA = cyc * 28;
      bob = -Math.abs(Math.cos(f * 0.5)) * 6;
      tailSpeed = 0.6;
      break;
    case "sniff":
      headDy = 44;
      headRot = 22;
      bodyRot = 6;
      bob = Math.sin(f * 1.6) * 1.5;
      tailSpeed = 0.9;
      tailAmp = 26;
      break;
    case "happy":
      bob = -Math.abs(Math.sin(f * 0.3)) * 34;
      legA = Math.sin(f * 0.6) * 20;
      tongue = true;
      eyes = "happy";
      tailSpeed = 1.2;
      tailAmp = 30;
      break;
    case "sit":
      bodyRot = -14;
      tongue = true;
      tailSpeed = 0.9;
      break;
    case "lick":
      headDy = 34;
      headRot = 16;
      tongue = true;
      eyes = "happy";
      tailSpeed = 1.3;
      tailAmp = 30;
      break;
    case "shock":
      eyes = "big";
      bob = -Math.abs(Math.sin(f * 0.9)) * 6;
      tailAmp = 6;
      break;
  }

  const tail = Math.sin(f * tailSpeed) * tailAmp;
  const ink = C.ink;
  const black = "#1E1C22";
  const white = "#FBF7EE";
  const tan = "#C98B4E";

  const leg = (lx: number, a: number, key: string, back?: boolean) => (
    <g key={key} transform={`rotate(${a} ${lx} 196)`}>
      <rect x={lx - 13} y={190} width={26} height={52} rx={12} fill={back ? "#2B2930" : black} stroke={ink} strokeWidth={5} />
      <ellipse cx={lx + 4} cy={242} rx={18} ry={11} fill={white} stroke={ink} strokeWidth={5} />
    </g>
  );

  const tongueY = pose === "lick" ? 24 + Math.abs(Math.sin(f * 0.8)) * 14 : 18;

  return (
    <div
      style={{
        position: "absolute",
        left: x - 160 * s,
        top: y - 260 * s - lift,
        width: 320 * s,
        height: 260 * s,
        opacity,
        scale: facing === "left" ? "-1 1" : "1 1",
      }}
    >
      <svg viewBox="0 0 320 260" width={320 * s} height={260 * s} style={{ overflow: "visible" }}>
        <ellipse cx={150} cy={250} rx={100 - Math.min(lift, 80) * 0.4} ry={10} fill="rgba(0,0,0,0.28)" />
        <g transform={`translate(0 ${bob})`}>
          {pose === "sit" ? (
            <g transform={`rotate(${bodyRot} 120 220)`}>
              {/* tail */}
              <path d={`M 66 214 q -40 -10 -50 ${-30 + tail}`} stroke={ink} strokeWidth={26} fill="none" strokeLinecap="round" />
              <path d={`M 66 214 q -40 -10 -50 ${-30 + tail}`} stroke={black} strokeWidth={16} fill="none" strokeLinecap="round" />
              <ellipse cx={120} cy={196} rx={66} ry={52} fill={black} stroke={ink} strokeWidth={6} />
              <ellipse cx={168} cy={196} rx={30} ry={44} fill={white} />
              {leg(150, 0, "f1")}
              {leg(178, 0, "f2")}
            </g>
          ) : (
            <g transform={`rotate(${bodyRot} 150 200)`}>
              {/* tail */}
              <g transform={`rotate(${tail} 70 160)`}>
                <path d="M 72 162 q -36 -14 -44 -58" stroke={ink} strokeWidth={28} fill="none" strokeLinecap="round" />
                <path d="M 72 162 q -36 -14 -44 -58" stroke={black} strokeWidth={18} fill="none" strokeLinecap="round" />
                <circle cx={28} cy={104} r={9} fill={white} />
              </g>
              {leg(92, -legA, "b1", true)}
              {leg(196, legA, "f1", true)}
              {/* body */}
              <rect x={64} y={128} width={160} height={84} rx={42} fill={black} stroke={ink} strokeWidth={6} />
              <path d="M 180 136 q 40 10 42 50 q -10 22 -40 24 q -18 -30 -2 -74 Z" fill={white} />
              <ellipse cx={136} cy={204} rx={44} ry={9} fill={white} opacity={0.9} />
              {leg(116, legA, "b2")}
              {leg(212, -legA, "f2")}
              {medal && (
                <g>
                  <path d="M 196 146 L 206 196 L 224 146" stroke="#C8102E" strokeWidth={8} fill="none" />
                  <circle cx={206} cy={202} r={16} fill="#D9D9E0" stroke={ink} strokeWidth={4} />
                  <text x={206} y={209} textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize={18} fill={ink}>
                    1
                  </text>
                </g>
              )}
            </g>
          )}
          {/* head */}
          <g transform={`translate(${pose === "sit" ? -16 : 0} ${headDy - (pose === "sit" ? 28 : 0)}) rotate(${headRot} 214 120)`}>
            {/* back ear */}
            <path d="M 176 52 q -16 -36 4 -50 q 22 14 18 46 Z" fill={black} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
            {/* skull */}
            <circle cx={212} cy={96} r={72} fill={black} stroke={ink} strokeWidth={6} />
            {/* white blaze + muzzle */}
            <path d="M 204 26 q 14 -2 16 0 l 10 56 q 30 6 52 30 q 4 40 -40 52 q -46 6 -66 -24 q -6 -26 18 -48 Z" fill={white} />
            {/* tan cheeks */}
            <circle cx={164} cy={112} r={13} fill={tan} opacity={0.85} />
            <circle cx={268} cy={92} r={10} fill="#FF8A8A" opacity={0.4} />
            {/* snout */}
            <ellipse cx={262} cy={124} rx={42} ry={30} fill={white} stroke={ink} strokeWidth={6} />
            <ellipse cx={294} cy={112} rx={15} ry={11} fill={ink} />
            <circle cx={298} cy={108} r={4} fill="#666" />
            {/* mouth */}
            <path d="M 294 124 q -6 18 -26 16 q -14 -2 -18 -12" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />
            {tongue && (
              <path
                d={`M 266 138 q 4 ${tongueY} 16 ${tongueY} q 12 0 12 -${tongueY - 4} Z`}
                fill="#F26D7D"
                stroke={ink}
                strokeWidth={4}
              />
            )}
            {/* eyes */}
            {eyes === "happy" ? (
              <g stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round">
                <path d="M 188 90 q 12 -14 24 0" />
                <path d="M 234 84 q 12 -14 24 0" />
              </g>
            ) : (
              <g>
                <ellipse cx={200} cy={88} rx={eyes === "big" ? 19 : 15} ry={eyes === "big" ? 23 : 19} fill={white} stroke={ink} strokeWidth={4} />
                <ellipse cx={246} cy={82} rx={eyes === "big" ? 19 : 15} ry={eyes === "big" ? 23 : 19} fill={white} stroke={ink} strokeWidth={4} />
                <circle cx={205} cy={90} r={eyes === "big" ? 7 : 10} fill={ink} />
                <circle cx={251} cy={84} r={eyes === "big" ? 7 : 10} fill={ink} />
                <circle cx={208} cy={86} r={3.5} fill={white} />
                <circle cx={254} cy={80} r={3.5} fill={white} />
              </g>
            )}
            {/* front ear (floppy) */}
            <g transform={`rotate(${pose === "happy" ? Math.sin(f * 0.6) * 12 : pose === "shock" ? -25 : 0} 186 40)`}>
              <path d="M 176 40 q -40 -10 -48 30 q 6 26 28 22 q 18 -18 20 -52 Z" fill={black} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
            </g>
            {/* collar */}
            <path d="M 160 150 q 40 26 84 18" stroke="#C8102E" strokeWidth={12} fill="none" strokeLinecap="round" />
            <circle cx={204} cy={170} r={8} fill={C.gold} stroke={ink} strokeWidth={3} />
            {trophy && (
              <g transform="translate(290 160) scale(0.72) rotate(-8)">
                <TrophyShape />
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};

/**
 * Stylised gold trophy with winged figure holding a cup aloft, on a dark
 * blue base (generic shape, origin at the bottom centre of the base).
 */
export const TrophyShape: React.FC<{ shine?: number }> = ({ shine = 0 }) => {
  const gold = "#F6C445";
  const goldDark = "#B07A12";
  const ink = C.ink;
  return (
    <g>
      {/* base */}
      <path d="M -54 0 L -46 -46 L 46 -46 L 54 0 Z" fill="#2A4FA8" stroke={ink} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-50} y={-30} width={100} height={8} fill={gold} />
      {/* body / dress */}
      <path d="M -34 -46 Q -20 -120 -14 -150 L 14 -150 Q 20 -120 34 -46 Z" fill={gold} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -10 -60 Q -4 -110 -2 -140" stroke={goldDark} strokeWidth={4} fill="none" />
      <path d="M 12 -60 Q 8 -110 6 -140" stroke={goldDark} strokeWidth={4} fill="none" />
      {/* wings */}
      <path d="M -14 -150 Q -70 -170 -60 -230 Q -30 -200 -8 -186 Z" fill={gold} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 14 -150 Q 70 -170 60 -230 Q 30 -200 8 -186 Z" fill={gold} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -50 -214 q 16 14 34 18 M -46 -196 q 14 10 32 12" stroke={goldDark} strokeWidth={4} fill="none" />
      <path d="M 50 -214 q -16 14 -34 18 M 46 -196 q -14 10 -32 12" stroke={goldDark} strokeWidth={4} fill="none" />
      {/* arms + cup */}
      <path d="M -10 -176 L -18 -218 M 10 -176 L 18 -218" stroke={ink} strokeWidth={14} strokeLinecap="round" />
      <path d="M -10 -176 L -18 -218 M 10 -176 L 18 -218" stroke={gold} strokeWidth={6} strokeLinecap="round" />
      <path d="M -40 -262 L 40 -262 L 26 -222 L -26 -222 Z" fill={gold} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={0} cy={-262} rx={40} ry={9} fill={goldDark} stroke={ink} strokeWidth={5} />
      {/* head */}
      <circle cx={0} cy={-170} r={13} fill={gold} stroke={ink} strokeWidth={5} />
      {/* highlight */}
      <path d="M -24 -60 Q -14 -110 -10 -136" stroke="#FFF3C4" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.8} />
      {shine > 0 && (
        <g opacity={shine} fill="#FFFFFF">
          <path d="M 30 -246 l 5 -16 l 5 16 l 16 5 l -16 5 l -5 16 l -5 -16 l -16 -5 Z" />
          <path d="M -40 -110 l 3 -10 l 3 10 l 10 3 l -10 3 l -3 10 l -3 -10 l -10 -3 Z" />
        </g>
      )}
    </g>
  );
};

/** Trophy as a positioned element. `size` = total height in px. */
export const Trophy: React.FC<{ x: number; y: number; size?: number; shine?: number; rotate?: number; opacity?: number }> = ({
  x,
  y,
  size = 300,
  shine = 0,
  rotate = 0,
  opacity = 1,
}) => {
  const k = size / 280;
  return (
    <svg
      width={160 * k}
      height={290 * k}
      viewBox="-80 -280 160 290"
      style={{ position: "absolute", left: x - 80 * k, top: y - 280 * k, overflow: "visible", rotate: `${rotate}deg`, opacity }}
    >
      <TrophyShape shine={shine} />
    </svg>
  );
};
