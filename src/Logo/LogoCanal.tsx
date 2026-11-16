import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { Dancer, Look } from "../ReelBaile/Dancer";
import { B, display } from "../ReelBaile/theme";

export const logoSchema = z.object({
  top: z.string(),
  bottom: z.string(),
  /** show the name (false = icon only, for tiny sizes) */
  withText: z.boolean(),
});

/** Neutral storyteller: not tied to any single video or era. */
const NARRADOR: Look = {
  skin: "#E6B48A",
  top: "#2E86AB",
  bottom: "#2E5E7A",
  hat: "none",
  hair: "short",
  hairColor: "#3E2614",
  shoes: "#3A2416",
};

const stroke = { stroke: B.ink, strokeWidth: 7, strokeLinejoin: "round" as const };

/** Topic icons orbiting the mascot: time, power, death, sport — "any story". */
const Hourglass: React.FC = () => (
  <g {...stroke}>
    <path d="M -34 -48 H 34 V -36 Q 34 -8 8 0 Q 34 8 34 36 V 48 H -34 V 36 Q -34 8 -8 0 Q -34 -8 -34 -36 Z" fill="#FFF3C9" />
    <path d="M -22 -38 H 22 Q 18 -16 0 -6 Q -18 -16 -22 -38 Z" fill="#FFC93C" stroke="none" />
    <path d="M -24 42 Q -10 14 0 14 Q 10 14 24 42 Z" fill="#FFC93C" stroke="none" />
  </g>
);
const Crown: React.FC = () => (
  <g {...stroke}>
    <path d="M -42 30 L -50 -26 L -22 0 L 0 -42 L 22 0 L 50 -26 L 42 30 Z" fill="#FFC93C" />
    <circle cx={0} cy={6} r={7} fill="#E0322B" />
  </g>
);
const Skull: React.FC = () => (
  <g {...stroke}>
    <path d="M 0 -44 C -30 -44 -42 -24 -40 -2 C -39 10 -32 16 -28 20 V 38 H 28 V 20 C 32 16 39 10 40 -2 C 42 -24 30 -44 0 -44 Z" fill="#F4F1E1" />
    <ellipse cx={-16} cy={-4} rx={9} ry={10} fill={B.ink} stroke="none" />
    <ellipse cx={16} cy={-4} rx={9} ry={10} fill={B.ink} stroke="none" />
    <path d="M 0 8 L -5 18 L 5 18 Z" fill={B.ink} stroke="none" />
  </g>
);
const Ball: React.FC = () => (
  <g {...stroke}>
    <circle r={42} fill="#fff" />
    <polygon points="0,-18 17,-6 11,14 -11,14 -17,-6" fill={B.ink} />
    <path d="M 0 -18 V -40 M 17 -6 L 38 -14 M 11 14 L 26 32 M -11 14 L -26 32 M -17 -6 L -38 -14" strokeWidth={5} />
  </g>
);

/**
 * Channel avatar, 1080x1080. Designed for a circular crop (TikTok / IG / YouTube):
 * everything important sits inside the central circle.
 */
export const LogoCanal: React.FC<z.infer<typeof logoSchema>> = ({ top, bottom, withText }) => {
  const R = 540;
  const orbit: [React.FC, number, number, number][] = [
    [Hourglass, 195, 400, -12],
    [Crown, 880, 385, 12],
    [Skull, 215, 650, 10],
    [Ball, 870, 735, -10],
  ];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #7B3FD1 0%, #3A1A78 55%, #160A2E 100%)" }}>
      <svg width={1080} height={1080} style={{ position: "absolute" }}>
        {new Array(16).fill(0).map((_, i) => (
          <path
            key={i}
            d={`M 540 560 L ${540 + 900 * Math.cos((i * 2 * Math.PI) / 16)} ${560 + 900 * Math.sin((i * 2 * Math.PI) / 16)} L ${540 + 900 * Math.cos(((i + 0.5) * 2 * Math.PI) / 16)} ${560 + 900 * Math.sin(((i + 0.5) * 2 * Math.PI) / 16)} Z`}
            fill="rgba(255,255,255,0.06)"
          />
        ))}
        {orbit.map(([Icon, x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${withText ? 1.15 : 1.35})`}>
            <Icon />
          </g>
        ))}
        {[
          [345, 300, -18, 90],
          [735, 290, 16, 80],
        ].map(([x, y, r, s], i) => (
          <text key={i} x={x} y={y} fontFamily="Lilita One" fontSize={s} fill={B.gold} transform={`rotate(${r} ${x} ${y})`} textAnchor="middle" stroke={B.ink} strokeWidth={8} paintOrder="stroke">
            ?
          </text>
        ))}
      </svg>
      <Dancer {...NARRADOR} x={540} y={withText ? 960 : 1030} height={withText ? 720 : 840} pose="point" mood="wink" holding="scroll" speed={0} />
      {withText && (
        <svg width={1080} height={1080} style={{ position: "absolute" }}>
          <defs>
            <path id="arcTop" d={`M 150 ${R} A 390 390 0 0 1 930 ${R}`} />
          </defs>
          <text fontFamily="Lilita One" fontSize={150} fill="#FFFFFF" stroke={B.ink} strokeWidth={26} paintOrder="stroke" letterSpacing={4}>
            <textPath href="#arcTop" startOffset="50%" textAnchor="middle">
              {top}
            </textPath>
          </text>
        </svg>
      )}
      {withText && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 800, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              fontFamily: display,
              fontSize: 140,
              lineHeight: 1,
              color: B.ink,
              background: B.gold,
              border: `12px solid ${B.ink}`,
              borderRadius: 34,
              padding: "6px 40px 14px",
              rotate: "-4deg",
              boxShadow: "0 14px 0 rgba(0,0,0,0.35)",
            }}
          >
            {bottom}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
