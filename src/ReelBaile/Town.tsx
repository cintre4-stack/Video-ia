import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { B, L } from "./theme";

export type Sky = "day" | "dusk" | "night" | "grey";

const SKY: Record<Sky, [string, string]> = {
  day: [B.skyDay1, B.skyDay2],
  dusk: ["#5B3A8C", "#F29E6B"],
  night: [B.skyNight1, B.skyNight2],
  grey: ["#4A4E5C", "#8A8C94"],
};

/** Strasbourg cathedral silhouette (single north spire), drawn simply. */
const Cathedral: React.FC<{ color: string; window: string }> = ({ color, window }) => (
  <svg width={420} height={900} viewBox="0 0 420 900" style={{ position: "absolute", left: 560, top: 210 }}>
    <g fill={color}>
      {/* nave + facade */}
      <rect x={20} y={430} width={380} height={470} />
      {/* left (north) tower with spire */}
      <rect x={30} y={250} width={150} height={200} />
      <polygon points="40,250 105,40 170,250" />
      <rect x={98} y={0} width={14} height={60} />
      {/* right tower, unfinished flat top */}
      <rect x={240} y={300} width={150} height={150} />
      <rect x={232} y={290} width={166} height={18} />
    </g>
    {/* rose window */}
    <circle cx={210} cy={560} r={60} fill={window} opacity={0.9} />
    <circle cx={210} cy={560} r={60} fill="none" stroke={color} strokeWidth={8} />
    {[0, 30, 60, 90, 120, 150].map((a) => (
      <line key={a} x1={210} y1={500} x2={210} y2={620} stroke={color} strokeWidth={5} transform={`rotate(${a} 210 560)`} />
    ))}
    {[70, 130, 290, 350].map((wx) => (
      <path key={wx} d={`M ${wx - 14} 430 v -60 q 14 -26 28 0 v 60 Z`} fill={window} opacity={0.7} />
    ))}
  </svg>
);

/** Half-timbered house; beams pattern varies with seed. */
const House: React.FC<{ x: number; w: number; h: number; seed: number; lit: boolean; dark: boolean }> = ({
  x,
  w,
  h,
  seed,
  lit,
  dark,
}) => {
  const plaster = dark ? "#5C5566" : B.plaster[seed % B.plaster.length];
  const roof = dark ? "#3A2A3A" : B.roof[seed % B.roof.length];
  const beam = dark ? "#2A1C22" : B.beam;
  const top = L.ground - 90 - h;
  const floors = 3;
  const fh = h / floors;
  const win = lit ? "#FFD66B" : dark ? "#2A2440" : "#5B7FA6";
  return (
    <div style={{ position: "absolute", left: x, top: top - w * 0.55, width: w, height: h + w * 0.55 }}>
      <svg width={w} height={h + w * 0.55} viewBox={`0 0 ${w} ${h + w * 0.55}`}>
        <polygon points={`-6,${w * 0.56} ${w / 2},0 ${w + 6},${w * 0.56}`} fill={roof} />
        <rect x={w / 2 - 14} y={w * 0.22} width={28} height={30} fill={win} stroke={beam} strokeWidth={4} />
        <g transform={`translate(0 ${w * 0.55})`}>
          <rect x={0} y={0} width={w} height={h} fill={plaster} />
          {new Array(floors).fill(0).map((_, f) => (
            <g key={f}>
              <rect x={0} y={f * fh} width={w} height={8} fill={beam} />
              {[0.08, 0.5, 0.92].map((px) => (
                <rect key={px} x={w * px - 5} y={f * fh} width={10} height={fh} fill={beam} />
              ))}
              {(seed + f) % 2 === 0 ? (
                <>
                  <line x1={w * 0.08} y1={f * fh + fh} x2={w * 0.5} y2={f * fh + 8} stroke={beam} strokeWidth={8} />
                  <line x1={w * 0.92} y1={f * fh + fh} x2={w * 0.5} y2={f * fh + 8} stroke={beam} strokeWidth={8} />
                </>
              ) : (
                <>
                  <line x1={w * 0.08} y1={f * fh + 8} x2={w * 0.5} y2={f * fh + fh} stroke={beam} strokeWidth={8} />
                  <line x1={w * 0.92} y1={f * fh + 8} x2={w * 0.5} y2={f * fh + fh} stroke={beam} strokeWidth={8} />
                </>
              )}
              {f > 0 &&
                [0.29, 0.71].map((px) => (
                  <rect key={px} x={w * px - 22} y={f * fh + fh * 0.28} width={44} height={fh * 0.45} rx={4} fill={win} stroke={beam} strokeWidth={5} />
                ))}
            </g>
          ))}
          <path d={`M ${w * 0.29 - 26} ${h} v -${fh * 0.7} q 26 -30 52 0 v ${fh * 0.7} Z`} fill={beam} />
        </g>
      </svg>
    </div>
  );
};

/** Strasbourg street: sky, cathedral, half-timbered houses and cobbles. */
export const Town: React.FC<{
  sky?: Sky;
  /** 0..1 sun/moon cycle progress for time-lapse; undefined = static */
  cycle?: number;
  lights?: boolean;
  dim?: number;
}> = ({ sky = "day", cycle, lights, dim = 0 }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const night = sky === "night";
  const grey = sky === "grey";
  let [c1, c2] = SKY[sky];
  let celestial: React.ReactNode = null;
  if (cycle !== undefined) {
    // full day/night rotations; celestial body travels an arc
    const t = cycle % 1;
    const isDay = t < 0.5;
    const k = isDay ? t * 2 : (t - 0.5) * 2;
    const cx = interpolate(k, [0, 1], [-80, width + 80]);
    const cy = 700 - Math.sin(k * Math.PI) * 440;
    [c1, c2] = isDay ? SKY.day : SKY.night;
    celestial = isDay ? (
      <div style={{ position: "absolute", left: cx - 70, top: cy - 70, width: 140, height: 140, borderRadius: "50%", background: "#FFD23F", boxShadow: "0 0 80px 30px rgba(255,210,63,0.6)" }} />
    ) : (
      <div style={{ position: "absolute", left: cx - 55, top: cy - 55, width: 110, height: 110, borderRadius: "50%", background: "#F4F1E1", boxShadow: "inset -26px -8px 0 0 #CFC9AE, 0 0 50px 10px rgba(255,255,230,0.3)" }} />
    );
  }
  const houses = [
    { x: -40, w: 230, h: 470 },
    { x: 170, w: 200, h: 560 },
    { x: 350, w: 220, h: 430 },
    { x: 680, w: 200, h: 380 },
    { x: 860, w: 240, h: 500 },
  ];
  const isNightLook = night || (cycle !== undefined && cycle % 1 >= 0.5);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${c1} 0%, ${c2} 70%)` }}>
      {isNightLook &&
        new Array(40).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: random(`sx${i}`) * width,
              top: 120 + random(`sy${i}`) * 700,
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#fff",
              opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.1 + i)),
            }}
          />
        ))}
      {celestial}
      <Cathedral color={isNightLook ? "#241A3A" : grey ? "#5E5A66" : "#C98E6B"} window={isNightLook && lights ? "#FFB84D" : isNightLook ? "#3A2A55" : "#7A4A6B"} />
      {houses.map((h, i) => (
        <House key={i} {...h} seed={i} lit={!!lights} dark={isNightLook || grey} />
      ))}
      {/* street */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: L.ground - 90,
          bottom: 0,
          background: isNightLook ? "#3A3448" : grey ? "#6E6A70" : B.cobble1,
        }}
      >
        <svg width={width} height={600}>
          {new Array(8).fill(0).map((_, r) =>
            new Array(14).fill(0).map((__, c) => (
              <rect
                key={`${r}-${c}`}
                x={c * 80 + (r % 2) * 40 - 20}
                y={r * 44 + 8}
                width={70}
                height={34}
                rx={14}
                fill={isNightLook ? "#2E293C" : grey ? "#5E5A60" : B.cobble2}
              />
            )),
          )}
        </svg>
      </div>
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(10,5,20,${dim})` }} />}
    </AbsoluteFill>
  );
};

/** Floating music notes rising from a point. */
export const Notes: React.FC<{ x: number; y: number; count?: number; color?: string }> = ({ x, y, count = 6, color = B.white }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const t = (frame * 1.6 + i * 40) % 160;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin((frame + i * 30) * 0.08) * 50 + (i - count / 2) * 30,
              top: y - t * 3,
              fontFamily: "serif",
              fontSize: 64,
              fontWeight: 900,
              color,
              opacity: interpolate(t, [0, 20, 130, 160], [0, 1, 1, 0]),
              textShadow: "0 4px 0 rgba(0,0,0,0.3)",
            }}
          >
            {i % 2 ? "♪" : "♫"}
          </div>
        );
      })}
    </>
  );
};
