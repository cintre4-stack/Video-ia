import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { Dancer, TROFFEA } from "../ReelBaile/Dancer";
import { B, display } from "../ReelBaile/theme";

export const logoSchema = z.object({
  top: z.string(),
  bottom: z.string(),
  /** show the arched name (false = icon only, for tiny sizes) */
  withText: z.boolean(),
});

/**
 * Channel avatar, 1080x1080. Designed for a circular crop (TikTok / IG / YouTube):
 * everything important sits inside the central circle.
 */
export const LogoCanal: React.FC<z.infer<typeof logoSchema>> = ({ top, bottom, withText }) => {
  const R = 540;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #7B3FD1 0%, #3A1A78 55%, #160A2E 100%)" }}>
      {/* sunburst */}
      <svg width={1080} height={1080} style={{ position: "absolute" }}>
        {new Array(16).fill(0).map((_, i) => (
          <path
            key={i}
            d={`M 540 560 L ${540 + 900 * Math.cos((i * 2 * Math.PI) / 16)} ${560 + 900 * Math.sin((i * 2 * Math.PI) / 16)} L ${540 + 900 * Math.cos(((i + 0.5) * 2 * Math.PI) / 16)} ${560 + 900 * Math.sin(((i + 0.5) * 2 * Math.PI) / 16)} Z`}
            fill="rgba(255,255,255,0.06)"
          />
        ))}
        {/* floating question marks */}
        {[
          [190, 380, -18, 110],
          [880, 420, 16, 96],
          [230, 760, 10, 70],
          [860, 780, -12, 80],
        ].map(([x, y, r, s], i) => (
          <text key={i} x={x} y={y} fontFamily="Lilita One" fontSize={s} fill={B.gold} opacity={0.85} transform={`rotate(${r} ${x} ${y})`} textAnchor="middle" stroke={B.ink} strokeWidth={8} paintOrder="stroke">
            ?
          </text>
        ))}
      </svg>
      {/* mascot: wide-eyed chibi in medieval coif */}
      <Dancer {...TROFFEA} x={540} y={withText ? 980 : 1040} height={withText ? 760 : 860} pose="dance" mood="shock" phase={6} speed={0} />
      {withText && (
        <svg width={1080} height={1080} style={{ position: "absolute" }}>
          <defs>
            <path id="arcTop" d={`M 150 ${R} A 390 390 0 0 1 930 ${R}`} />
            <path id="arcBottom" d={`M 120 ${R + 30} A 420 420 0 0 0 960 ${R + 30}`} />
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
