import React from "react";
import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { B, L } from "../ReelBaile/theme";

export const BEER = {
  dark: "#3B1F0E",
  mid: "#5A2E12",
  light: "#7A4520",
  foam: "#F6E7C8",
  foamShade: "#E3CFA4",
};

const SKIES = {
  grey: ["#8E98A8", "#D8D1C2"],
  dusk: ["#4E4A6E", "#E39A6A"],
  night: ["#141A30", "#2E3556"],
} as const;
export type LSky = keyof typeof SKIES;

/** Georgian brick terrace house with sash windows and chimney. */
const Terrace: React.FC<{
  x: number;
  w: number;
  h: number;
  seed: number;
  poor?: boolean;
  lit?: boolean;
  tone?: number;
}> = ({ x, w, h, seed, poor, lit, tone = 0 }) => {
  const frame = useCurrentFrame();
  const bricks = poor
    ? ["#6E5A4E", "#7A6656", "#5E4E46"]
    : ["#9A4E36", "#8E4B36", "#A85C3E", "#7E4430"];
  const brick = bricks[seed % bricks.length];
  const top = L.ground - 90 - h;
  const win = lit ? "#FFD66B" : "#3E4A5E";
  const cols = Math.max(2, Math.round(w / 90));
  const floors = Math.round(h / 150);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: top - 70,
        width: w,
        height: h + 70,
        filter: tone ? `brightness(${1 - tone})` : undefined,
      }}
    >
      <svg width={w} height={h + 70} viewBox={`0 0 ${w} ${h + 70}`}>
        {/* chimney + smoke */}
        <rect
          x={w * 0.68}
          y={4}
          width={34}
          height={70}
          fill={brick}
          stroke={B.ink}
          strokeWidth={3}
        />
        {[0, 1, 2].map((i) => {
          const t = (frame * 0.8 + i * 30 + seed * 17) % 90;
          return (
            <circle
              key={i}
              cx={w * 0.68 + 17 + Math.sin(t * 0.08) * 10 + t * 0.3}
              cy={0 - t * 0.6 + 6}
              r={8 + t * 0.2}
              fill="rgba(200,200,205,0.5)"
              opacity={1 - t / 90}
            />
          );
        })}
        <rect x={0} y={60} width={w} height={h + 10} fill={brick} />
        {/* brick texture */}
        {new Array(Math.floor(h / 22)).fill(0).map((_, r) => (
          <line
            key={r}
            x1={0}
            y1={70 + r * 22}
            x2={w}
            y2={70 + r * 22}
            stroke="rgba(0,0,0,0.12)"
            strokeWidth={2}
          />
        ))}
        <rect
          x={0}
          y={56}
          width={w}
          height={14}
          fill={poor ? "#4A3E38" : "#E8E0D0"}
        />
        {new Array(floors).fill(0).map((_, f) =>
          new Array(cols).fill(0).map((__, c) => {
            const wx = (c + 0.5) * (w / cols) - 26;
            const wy = 90 + f * 150;
            if (f === floors - 1 && c === 0) return null;
            const broken = poor && random(`b${seed}${f}${c}`) > 0.7;
            return (
              <g key={`${f}-${c}`}>
                <rect
                  x={wx}
                  y={wy}
                  width={52}
                  height={92}
                  fill={broken ? "#22262E" : win}
                  stroke="#F2EFE6"
                  strokeWidth={6}
                />
                <line
                  x1={wx}
                  y1={wy + 46}
                  x2={wx + 52}
                  y2={wy + 46}
                  stroke="#F2EFE6"
                  strokeWidth={5}
                />
                <line
                  x1={wx + 26}
                  y1={wy}
                  x2={wx + 26}
                  y2={wy + 92}
                  stroke="#F2EFE6"
                  strokeWidth={4}
                />
                {broken && (
                  <path
                    d={`M ${wx + 6} ${wy + 10} l 16 22 l -8 10`}
                    stroke="#F2EFE6"
                    strokeWidth={3}
                    fill="none"
                  />
                )}
              </g>
            );
          }),
        )}
        {/* door */}
        <rect
          x={(w / cols) * 0.5 - 30}
          y={h - 60}
          width={60}
          height={130}
          rx={4}
          fill={poor ? "#3A2A20" : "#1E3A2A"}
          stroke={B.ink}
          strokeWidth={3}
        />
        {!poor && (
          <path
            d={`M ${(w / cols) * 0.5 - 34} ${h - 60} a 34 34 0 0 1 68 0 Z`}
            fill="#F2EFE6"
          />
        )}
      </svg>
    </div>
  );
};

/** The brewery: big brick block with the sign; `damage` 0..1 knocks a hole in the wall. */
export const Brewery: React.FC<{ x?: number; damage?: number }> = ({
  x = 560,
  damage = 0,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: L.ground - 90 - 700,
      width: 560,
      height: 700,
    }}
  >
    <svg
      width={560}
      height={700}
      viewBox="0 0 560 700"
      style={{ overflow: "visible" }}
    >
      <polygon
        points="-10,120 280,20 570,120"
        fill="#5E3A2A"
        stroke={B.ink}
        strokeWidth={4}
      />
      <rect
        x={0}
        y={120}
        width={560}
        height={580}
        fill="#7E4430"
        stroke={B.ink}
        strokeWidth={4}
      />
      {new Array(24).fill(0).map((_, r) => (
        <line
          key={r}
          x1={0}
          y1={140 + r * 24}
          x2={560}
          y2={140 + r * 24}
          stroke="rgba(0,0,0,0.12)"
          strokeWidth={2}
        />
      ))}
      <rect
        x={40}
        y={150}
        width={480}
        height={86}
        rx={10}
        fill="#1E2A3A"
        stroke={B.gold}
        strokeWidth={5}
      />
      <text
        x={280}
        y={192}
        textAnchor="middle"
        fontFamily="Lilita One"
        fontSize={40}
        fill={B.gold}
      >
        MEUX &amp; CO
      </text>
      <text
        x={280}
        y={226}
        textAnchor="middle"
        fontFamily="Nunito"
        fontWeight={900}
        fontSize={24}
        fill="#F2EFE6"
        letterSpacing={2}
      >
        HORSE SHOE BREWERY
      </text>
      {[0, 1, 2, 3].map((c) => (
        <path
          key={c}
          d={`M ${70 + c * 120} 420 v -110 a 30 30 0 0 1 60 0 v 110 Z`}
          fill="#2A3346"
          stroke="#E8E0D0"
          strokeWidth={5}
        />
      ))}
      <rect
        x={200}
        y={520}
        width={160}
        height={180}
        fill="#3A2416"
        stroke={B.ink}
        strokeWidth={4}
      />
      {damage > 0 && (
        <path
          d={`M ${300 - 160 * damage} 700 L ${290 - 140 * damage} ${560 - 120 * damage} L ${330} ${470 - 140 * damage} L ${390 + 120 * damage} ${540 - 100 * damage} L ${420 + 120 * damage} 700 Z`}
          fill={BEER.dark}
          stroke={B.ink}
          strokeWidth={5}
        />
      )}
    </svg>
  </div>
);

/** London street, 1814. */
export const London: React.FC<{
  sky?: LSky;
  poor?: boolean;
  brewery?: boolean;
  breweryDamage?: number;
  lit?: boolean;
  tone?: number;
}> = ({ sky = "grey", poor, brewery, breweryDamage = 0, lit, tone = 0 }) => {
  const { width } = useVideoConfig();
  const [c1, c2] = SKIES[sky];
  const houses = brewery
    ? [
        { x: -30, w: 250, h: 520 },
        { x: 220, w: 330, h: 600 },
      ]
    : [
        { x: -40, w: 260, h: 560 },
        { x: 215, w: 300, h: 470 },
        { x: 510, w: 260, h: 620 },
        { x: 765, w: 330, h: 520 },
      ];
  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(180deg, ${c1} 0%, ${c2} 75%)` }}
    >
      {/* distant skyline with St Paul's dome */}
      <svg
        width={width}
        height={1400}
        style={{ position: "absolute", opacity: 0.35 }}
      >
        <path
          d="M 0 900 h 120 v -60 h 80 v 40 h 90 v -90 h 70 v 70 h 110 v -40 h 60 v 80 h 120 v -50 h 90 v 60 h 160 v 70 h 180 V 1400 H 0 Z"
          fill="#5A6070"
        />
        <g transform="translate(560 720)">
          <rect x={-90} y={60} width={180} height={140} fill="#5A6070" />
          <path d="M -80 62 a 80 80 0 0 1 160 0 Z" fill="#5A6070" />
          <rect x={-10} y={-40} width={20} height={34} fill="#5A6070" />
        </g>
      </svg>
      {houses.map((h, i) => (
        <Terrace
          key={i}
          {...h}
          seed={i + (poor ? 7 : 0)}
          poor={poor}
          lit={lit}
          tone={tone}
        />
      ))}
      {brewery && <Brewery damage={breweryDamage} />}
      {/* street */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: L.ground - 90,
          bottom: 0,
          background: poor ? "#5E564E" : "#8C8478",
        }}
      >
        <svg width={width} height={600}>
          {new Array(8)
            .fill(0)
            .map((_, r) =>
              new Array(14)
                .fill(0)
                .map((__, c) => (
                  <rect
                    key={`${r}-${c}`}
                    x={c * 80 + (r % 2) * 40 - 20}
                    y={r * 44 + 8}
                    width={70}
                    height={34}
                    rx={12}
                    fill={poor ? "#4E4840" : "#7A7266"}
                  />
                )),
            )}
        </svg>
      </div>
      {tone > 0 && (
        <AbsoluteFill style={{ background: `rgba(10,10,20,${tone * 0.6})` }} />
      )}
    </AbsoluteFill>
  );
};

/** Giant porter vat seen from the side. */
export const Vat: React.FC<{
  x: number;
  bottom: number;
  w?: number;
  h?: number;
  /** 0..1 how far the loose hoop has slid down */
  slip?: number;
  /** 0..1 bulging before bursting */
  bulge?: number;
  /** frames since burst (undefined = intact) */
  burstT?: number;
}> = ({ x, bottom, w = 360, h = 620, slip = 0, bulge = 0, burstT }) => {
  const frame = useCurrentFrame();
  const hoops = [0.08, 0.3, 0.52, 0.74, 0.93];
  const shakeX = bulge > 0.5 ? Math.sin(frame * 4) * (bulge - 0.5) * 16 : 0;
  if (burstT !== undefined) {
    // staves flying outwards
    return (
      <div
        style={{
          position: "absolute",
          left: x - w / 2,
          top: bottom - h,
          width: w,
          height: h,
        }}
      >
        <svg width={w} height={h} style={{ overflow: "visible" }}>
          {new Array(9).fill(0).map((_, i) => {
            const dir = i - 4;
            const tx = dir * burstT * 9;
            const ty =
              -burstT * (14 - Math.abs(dir) * 2) + burstT * burstT * 0.5;
            return (
              <rect
                key={i}
                x={i * (w / 9)}
                y={0}
                width={w / 9 - 4}
                height={h}
                rx={10}
                fill={i % 2 ? "#9A6234" : "#8A5428"}
                stroke={B.ink}
                strokeWidth={4}
                transform={`translate(${tx} ${ty}) rotate(${dir * burstT * 2} ${i * (w / 9) + w / 18} ${h / 2})`}
              />
            );
          })}
        </svg>
      </div>
    );
  }
  const bw = bulge * 40;
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2 + shakeX,
        top: bottom - h,
        width: w,
        height: h,
      }}
    >
      <svg width={w} height={h} style={{ overflow: "visible" }}>
        <path
          d={`M 0 0 H ${w} Q ${w + 30 + bw} ${h / 2} ${w} ${h} H 0 Q ${-30 - bw} ${h / 2} 0 0 Z`}
          fill="#9A6234"
          stroke={B.ink}
          strokeWidth={6}
        />
        {new Array(8).fill(0).map((_, i) => (
          <line
            key={i}
            x1={(i + 1) * (w / 9)}
            y1={4}
            x2={(i + 1) * (w / 9)}
            y2={h - 4}
            stroke="rgba(0,0,0,0.22)"
            strokeWidth={4}
          />
        ))}
        {hoops.map((p, i) => {
          const loose = i === 1;
          const y = (loose ? p + slip * 0.18 : p) * h;
          const tiltDeg = loose ? slip * 6 : 0;
          return (
            <rect
              key={i}
              x={-24 - bw * Math.sin((y / h) * Math.PI)}
              y={y - 12}
              width={w + 48 + 2 * bw * Math.sin((y / h) * Math.PI)}
              height={24}
              rx={6}
              fill={loose && slip > 0 ? "#C24A2A" : "#3E3E46"}
              stroke={B.ink}
              strokeWidth={4}
              transform={`rotate(${tiltDeg} ${w / 2} ${y})`}
            />
          );
        })}
        {bulge > 0.3 && (
          <g stroke={B.ink} strokeWidth={5} fill="none">
            <path
              d={`M ${w * 0.4} ${h * 0.45} l 20 30 l -14 26 l 18 30`}
              opacity={(bulge - 0.3) / 0.7}
            />
            <path
              d={`M ${w * 0.66} ${h * 0.6} l -16 24 l 12 26`}
              opacity={(bulge - 0.5) / 0.5}
            />
          </g>
        )}
        {bulge > 0.4 &&
          [0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M ${w * (0.35 + i * 0.15)} ${h * 0.55 + i * 30} q 6 ${20 + ((frame * 3 + i * 10) % 40)} 0 ${30 + ((frame * 3 + i * 10) % 40)}`}
              stroke={BEER.light}
              strokeWidth={8}
              strokeLinecap="round"
              fill="none"
            />
          ))}
      </svg>
    </div>
  );
};

/**
 * Beer wave sweeping left → right. `front` = x of the wave front,
 * `height` = crest height above the ground line.
 */
export const BeerWave: React.FC<{
  front: number;
  height: number;
  base?: number;
  water?: boolean;
}> = ({ front, height, base = L.ground + 40, water }) => {
  const P = water
    ? {
        light: "#6FB6F0",
        mid: "#3A7BD5",
        dark: "#1E4E9A",
        foam: "#FFFFFF",
        foamShade: "#CFE6FA",
      }
    : {
        light: BEER.light,
        mid: BEER.mid,
        dark: BEER.dark,
        foam: BEER.foam,
        foamShade: BEER.foamShade,
      };
  const gid = water ? "waterG" : "beerG";
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const crestY = base - height;
  const pts: string[] = [];
  for (let x = -40; x <= front - 120; x += 40) {
    pts.push(`L ${x} ${crestY + 60 + Math.sin(x * 0.02 + frame * 0.3) * 18}`);
  }
  const curl = `L ${front - 120} ${crestY + 30} Q ${front - 40} ${crestY - 40} ${front + 30} ${crestY + 10} Q ${front + 70} ${crestY + 40} ${front + 30} ${crestY + 80} Q ${front - 10} ${crestY + 90} ${front + 10} ${base - height * 0.4} Q ${front + 60} ${base - 30} ${front + 120} ${base} `;
  const d = `M -40 ${base + 600} ${pts.join(" ")} ${curl} L ${front + 120} ${base + 600} Z`;
  return (
    <svg
      width={width}
      height={1920}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={P.light} />
          <stop offset="0.4" stopColor={P.mid} />
          <stop offset="1" stopColor={P.dark} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${gid})`} stroke={B.ink} strokeWidth={6} />
      {/* foam along the crest */}
      {new Array(Math.max(0, Math.floor((front + 60) / 34)))
        .fill(0)
        .map((_, i) => {
          const x = i * 34 - 20;
          const nearFront = x > front - 140;
          const y = nearFront
            ? crestY + 10 + (front - x) * 0.25
            : crestY + 60 + Math.sin(x * 0.02 + frame * 0.3) * 18;
          return (
            <circle
              key={i}
              cx={x}
              cy={y - 6}
              r={16 + random(`f${i}`) * 12}
              fill={P.foam}
              stroke={P.foamShade}
              strokeWidth={3}
            />
          );
        })}
      {/* spray */}
      {new Array(14).fill(0).map((_, i) => {
        const t = (frame * 2 + i * 13) % 40;
        return (
          <circle
            key={`s${i}`}
            cx={front + 20 + random(`sx${i}`) * 80 + t * 2}
            cy={crestY + 10 - t * 3 + t * t * 0.12}
            r={6 + random(`sr${i}`) * 8}
            fill={i % 3 ? P.foam : P.light}
            opacity={1 - t / 40}
          />
        );
      })}
    </svg>
  );
};

/** Flat flood at a given surface y, with ripples and foam. */
export const BeerFlood: React.FC<{ level: number; foam?: boolean }> = ({
  level,
  foam = true,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const pts: string[] = [];
  for (let x = -20; x <= width + 40; x += 30)
    pts.push(`L ${x} ${level + Math.sin(x * 0.025 + frame * 0.2) * 8}`);
  return (
    <svg
      width={width}
      height={1920}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      <path
        d={`M -20 1940 ${pts.join(" ")} L ${width + 40} 1940 Z`}
        fill={BEER.mid}
        opacity={0.94}
        stroke={B.ink}
        strokeWidth={5}
      />
      {foam &&
        new Array(18).fill(0).map((_, i) => {
          const x = ((i * 67 + frame * 1.2) % (width + 80)) - 40;
          return (
            <ellipse
              key={i}
              cx={x}
              cy={level + Math.sin(x * 0.025 + frame * 0.2) * 8}
              rx={26 + (i % 3) * 8}
              ry={9}
              fill={BEER.foam}
              opacity={0.9}
            />
          );
        })}
    </svg>
  );
};
