import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { body, C, display } from "../Reel9320/theme";

export const P = {
  england: "#FFFFFF",
  englandNavy: "#1B2A5C",
  englandRed: "#CF142B",
  germany: "#1A1A1A",
  brick: "#A4452C",
  brickDark: "#7C3220",
  sky: "#8FCBF0",
  hedge: "#2F7D32",
  hedgeDark: "#1F5A24",
  paper: "#EFE8D6",
  police: "#14213D",
};

export const ENGLAND_CROWD = ["#FFFFFF", "#FFFFFF", P.englandRed, "#FFFFFF", P.englandNavy];

/** Victorian exhibition hall: wood panels, red carpet, spotlight. */
export const HallSet: React.FC<{ dark?: number }> = ({ dark = 0 }) => (
  <AbsoluteFill style={{ background: "#3A1F14" }}>
    <AbsoluteFill
      style={{
        background:
          "repeating-linear-gradient(90deg, #5A3220 0px, #5A3220 150px, #4B2918 150px, #4B2918 160px)",
      }}
    />
    {/* arches */}
    {[120, 540, 960].map((cx) => (
      <div
        key={cx}
        style={{
          position: "absolute",
          left: cx - 140,
          top: 640,
          width: 280,
          height: 560,
          borderRadius: "140px 140px 0 0",
          background: "linear-gradient(180deg,#2A160E,#1C0F09)",
          border: "10px solid #C9A04A",
        }}
      />
    ))}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1180,
        bottom: 0,
        background: "repeating-linear-gradient(90deg,#8E1B24 0px,#8E1B24 120px,#7C1720 120px,#7C1720 240px)",
        borderTop: "12px solid #C9A04A",
      }}
    />
    {/* sign */}
    <div
      style={{
        position: "absolute",
        left: 140,
        right: 140,
        top: 1240,
        padding: "14px 0",
        textAlign: "center",
        fontFamily: body,
        fontWeight: 900,
        fontSize: 30,
        letterSpacing: 3,
        color: "#3A1F14",
        background: "#EAD9A6",
        border: `6px solid ${C.ink}`,
        borderRadius: 12,
      }}
    >
      EXPOSICIÓN DE SELLOS · WESTMINSTER
    </div>
    {/* spotlight cone */}
    <div
      style={{
        position: "absolute",
        left: 290,
        top: 560,
        width: 500,
        height: 760,
        background: "radial-gradient(ellipse at 50% 70%, rgba(255,240,190,0.45) 0%, rgba(255,240,190,0) 65%)",
      }}
    />
    {dark > 0 && <AbsoluteFill style={{ background: `rgba(5,5,20,${dark})` }} />}
  </AbsoluteFill>
);

/** Glass display case on a pedestal. Children go inside the glass. */
export const DisplayCase: React.FC<{ x: number; y: number; children?: React.ReactNode; broken?: boolean }> = ({
  x,
  y,
  children,
  broken,
}) => (
  <>
    {/* pedestal */}
    <div
      style={{
        position: "absolute",
        left: x - 130,
        top: y,
        width: 260,
        height: 1430 - y + 20,
        background: "linear-gradient(90deg,#2B2B36,#45455A,#2B2B36)",
        border: `8px solid ${C.ink}`,
        borderRadius: 12,
      }}
    />
    <div style={{ position: "absolute", left: x - 150, top: y - 20, width: 300, height: 34, background: "#C9A04A", border: `6px solid ${C.ink}`, borderRadius: 8 }} />
    {children}
    {/* glass */}
    <div
      style={{
        position: "absolute",
        left: x - 140,
        top: y - 380,
        width: 280,
        height: 360,
        border: `8px solid ${C.ink}`,
        borderRadius: 12,
        background: "linear-gradient(135deg, rgba(200,235,255,0.28) 0%, rgba(200,235,255,0.08) 40%, rgba(255,255,255,0.3) 45%, rgba(200,235,255,0.08) 52%)",
      }}
    />
    {broken && (
      <svg style={{ position: "absolute", left: x - 140, top: y - 380 }} width={280} height={360}>
        <path d="M 150 90 L 120 160 L 170 200 L 130 280 M 150 90 L 220 60 M 120 160 L 40 150 M 170 200 L 260 230" stroke="#FFFFFF" strokeWidth={5} fill="none" />
      </svg>
    )}
  </>
);

/** Daytime South London street. `scroll` moves the houses left in px. */
export const StreetSet: React.FC<{ scroll?: number; close?: boolean }> = ({ scroll = 0, close }) => {
  const houseW = 300;
  const houses = 7;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #5FB4EA 0%, ${P.sky} 60%, #D8F0FF 100%)` }}>
      {/* clouds */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: ((i * 420 - scroll * 0.15) % 1400) + (i === 1 ? 100 : 0) - 100,
            top: 300 + i * 70,
            width: 240,
            height: 70,
            borderRadius: 40,
            background: "rgba(255,255,255,0.9)",
            boxShadow: "60px -24px 0 -6px rgba(255,255,255,0.9), 120px 0 0 -10px rgba(255,255,255,0.9)",
          }}
        />
      ))}
      {/* terraced houses */}
      <div style={{ position: "absolute", left: -((scroll * 0.6) % houseW) - 60, top: close ? 560 : 640, display: "flex" }}>
        {new Array(houses).fill(0).map((_, i) => (
          <div key={i} style={{ position: "relative", width: houseW, height: 640 }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 60,
                width: houseW,
                height: 580,
                background: `repeating-linear-gradient(0deg, ${P.brick} 0px, ${P.brick} 22px, ${P.brickDark} 22px, ${P.brickDark} 26px)`,
                borderLeft: `6px solid ${C.ink}`,
                borderRight: `6px solid ${C.ink}`,
              }}
            />
            {/* roof */}
            <div style={{ position: "absolute", left: -10, top: 20, width: houseW + 20, height: 50, background: "#3B3F4A", border: `6px solid ${C.ink}` }} />
            <div style={{ position: "absolute", left: 200, top: -30, width: 50, height: 60, background: P.brickDark, border: `6px solid ${C.ink}` }} />
            {/* windows */}
            {[60, 180].map((wx) => (
              <div key={wx} style={{ position: "absolute", left: wx, top: 130, width: 70, height: 100, background: "#BFE6FF", border: `8px solid #F4F1E8`, outline: `4px solid ${C.ink}` }} />
            ))}
            <div style={{ position: "absolute", left: 60, top: 330, width: 70, height: 100, background: "#BFE6FF", border: `8px solid #F4F1E8`, outline: `4px solid ${C.ink}` }} />
            {/* door */}
            <div
              style={{
                position: "absolute",
                left: 180,
                top: 320,
                width: 74,
                height: 140,
                background: [P.englandRed, "#1F5FA8", "#2E7D32", "#1A1A1A"][i % 4],
                border: `6px solid ${C.ink}`,
                borderRadius: "36px 36px 0 0",
              }}
            />
          </div>
        ))}
      </div>
      {/* hedge row */}
      <div style={{ position: "absolute", left: -((scroll * 0.9) % 140) - 140, top: close ? 1000 : 1090, display: "flex" }}>
        {new Array(12).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              width: 140,
              height: close ? 300 : 210,
              marginRight: -20,
              borderRadius: "70px 70px 10px 10px",
              background: `radial-gradient(circle at 40% 30%, ${P.hedge} 0%, ${P.hedgeDark} 80%)`,
              border: `6px solid ${C.ink}`,
            }}
          />
        ))}
      </div>
      {/* pavement + kerb */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1290, height: 170, background: "repeating-linear-gradient(90deg,#B9B6AE 0px,#B9B6AE 176px,#A19E96 176px,#A19E96 180px)", borderTop: `6px solid ${C.ink}`, backgroundPositionX: -scroll }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, bottom: 0, background: "#4A4D55", borderTop: `10px solid #D9D6CE` }} />
    </AbsoluteFill>
  );
};

/** Newspaper-wrapped parcel tied with string. `open` 0..1 tears it apart. */
export const Parcel: React.FC<{ x: number; y: number; w?: number; open?: number; wiggle?: number }> = ({
  x,
  y,
  w = 220,
  open = 0,
  wiggle = 0,
}) => {
  const frame = useCurrentFrame();
  const h = w * 0.62;
  const rot = Math.sin(frame * 1.3) * wiggle;
  const half = (side: -1 | 1) => (
    <div
      style={{
        position: "absolute",
        left: side === -1 ? 0 : w / 2,
        top: 0,
        width: w / 2,
        height: h,
        background: P.paper,
        border: `6px solid ${C.ink}`,
        borderRadius: side === -1 ? "14px 0 0 14px" : "0 14px 14px 0",
        overflow: "hidden",
        translate: `${side * open * 260}px ${-open * 120}px`,
        rotate: `${side * open * 40}deg`,
        opacity: 1 - Math.max(0, open - 0.6) * 2.5,
      }}
    >
      {/* fake newsprint */}
      <div style={{ position: "absolute", left: side === -1 ? 10 : -w / 2 + 10, top: 8, fontFamily: display, fontSize: w * 0.12, color: "#2A2A2A", whiteSpace: "nowrap" }}>
        DAILY NEWS
      </div>
      {new Array(6).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 12, right: 12, top: h * 0.32 + i * h * 0.1, height: h * 0.04, background: "rgba(40,40,40,0.35)", borderRadius: 4 }} />
      ))}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, rotate: `${rot}deg` }}>
      {half(-1)}
      {half(1)}
      {open === 0 && (
        <>
          <div style={{ position: "absolute", left: w / 2 - 4, top: -4, width: 8, height: h + 8, background: "#B98B4E" }} />
          <div style={{ position: "absolute", left: -4, top: h / 2 - 4, width: w + 8, height: 8, background: "#B98B4E" }} />
        </>
      )}
    </div>
  );
};

/** Radiating golden light rays, rotating. */
export const Rays: React.FC<{ x: number; y: number; opacity: number; color?: string; size?: number }> = ({
  x,
  y,
  opacity,
  color = "rgba(255,214,90,0.55)",
  size = 1800,
}) => {
  const frame = useCurrentFrame();
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        opacity,
        rotate: `${frame * 0.6}deg`,
        background: `repeating-conic-gradient(${color} 0deg 10deg, rgba(0,0,0,0) 10deg 22deg)`,
        maskImage: "radial-gradient(circle, black 15%, transparent 65%)",
        WebkitMaskImage: "radial-gradient(circle, black 15%, transparent 65%)",
      }}
    />
  );
};

/** Red rotated rubber stamp ("¡ROBADA!", "NADA."). */
export const Stamp: React.FC<{ text: string; at: number; top?: number; color?: string; size?: number }> = ({
  text,
  at,
  top = 880,
  color = "#E3121B",
  size = 150,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  const s = interpolate(t, [0, 5, 10], [2.6, 0.92, 1], { extrapolateRight: "clamp" });
  const o = interpolate(t, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          fontFamily: display,
          fontSize: size,
          color,
          border: `14px solid ${color}`,
          borderRadius: 24,
          padding: "0 40px",
          rotate: "-12deg",
          scale: `${s}`,
          opacity: o * 0.95,
          background: "rgba(255,255,255,0.12)",
          textShadow: "0 0 2px rgba(0,0,0,0.3)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Bobby helmet drawn over a Character's head (same x/y/height as the Character). */
export const BobbyHelmet: React.FC<{ x: number; y: number; height?: number; lift?: number }> = ({ x, y, height = 300, lift = 0 }) => {
  const s = height / 320;
  return (
    <svg
      viewBox="0 0 200 120"
      width={200 * s}
      height={120 * s}
      style={{ position: "absolute", left: x - 100 * s, top: y - 320 * s - lift - 56 * s, overflow: "visible" }}
    >
      <path d="M 44 96 Q 40 10 100 0 Q 160 10 156 96 Z" fill={P.police} stroke={C.ink} strokeWidth={6} />
      <rect x={34} y={88} width={132} height={16} rx={8} fill={P.police} stroke={C.ink} strokeWidth={5} />
      <circle cx={100} cy={2} r={9} fill="#C0C4CC" stroke={C.ink} strokeWidth={4} />
      <path d="M 100 40 l 10 14 l -10 14 l -10 -14 Z" fill="#C0C4CC" stroke={C.ink} strokeWidth={3} />
    </svg>
  );
};

/** Burglar eye-mask overlay for a Character. */
export const EyeMask: React.FC<{ x: number; y: number; height?: number; lift?: number }> = ({ x, y, height = 300, lift = 0 }) => {
  const s = height / 320;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 48 * s,
        top: y - 320 * s - lift + 64 * s,
        width: 96 * s,
        height: 30 * s,
        background: "#111",
        borderRadius: 14 * s,
        boxShadow: `inset 0 0 0 ${4 * s}px #000`,
      }}
    >
      {[22, 62].map((ex) => (
        <div key={ex} style={{ position: "absolute", left: ex * s, top: 7 * s, width: 14 * s, height: 16 * s, borderRadius: "50%", background: "#fff" }}>
          <div style={{ position: "absolute", left: 4 * s, top: 4 * s, width: 7 * s, height: 8 * s, borderRadius: "50%", background: "#111" }} />
        </div>
      ))}
    </div>
  );
};

/** Magnifying glass prop. */
export const Magnifier: React.FC<{ x: number; y: number; size?: number; rotate?: number }> = ({ x, y, size = 150, rotate = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, rotate: `${rotate}deg`, overflow: "visible" }}>
    <line x1={64} y1={64} x2={96} y2={96} stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
    <line x1={64} y1={64} x2={96} y2={96} stroke="#8B5A2B" strokeWidth={9} strokeLinecap="round" />
    <circle cx={40} cy={40} r={32} fill="rgba(190,230,255,0.45)" stroke={C.ink} strokeWidth={8} />
    <circle cx={40} cy={40} r={26} fill="none" stroke="#C0C4CC" strokeWidth={4} />
    <path d="M 24 30 q 6 -10 16 -10" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
  </svg>
);

/** Night banquet room with chandeliers. */
export const BanquetSet: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#2B1240 0%,#4A1F4F 60%,#5C2A3A 100%)" }}>
      {[230, 850].map((cx, i) => (
        <div key={cx} style={{ position: "absolute", left: cx - 200, top: 520, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,226,150,0.45) 0%, rgba(255,226,150,0) 65%)", opacity: 0.85 + Math.sin(frame * 0.2 + i) * 0.1 }} />
      ))}
      {[230, 850].map((cx) => (
        <svg key={`c${cx}`} width={200} height={140} style={{ position: "absolute", left: cx - 100, top: 600 }}>
          <path d="M 100 0 V 50" stroke="#C9A04A" strokeWidth={6} />
          <path d="M 20 70 Q 100 120 180 70" stroke="#C9A04A" strokeWidth={10} fill="none" />
          {[20, 60, 100, 140, 180].map((lx) => (
            <g key={lx}>
              <rect x={lx - 6} y={60} width={12} height={26} fill="#FFF3D0" />
              <ellipse cx={lx} cy={52} rx={7} ry={12} fill="#FFD25A" />
            </g>
          ))}
        </svg>
      ))}
      {/* wall drapes */}
      {[0, 1].map((i) => (
        <div key={i} style={{ position: "absolute", top: 0, [i ? "right" : "left"]: 0, width: 130, height: 1300, background: "repeating-linear-gradient(90deg,#7A1020 0px,#7A1020 30px,#5E0C18 30px,#5E0C18 44px)" }} />
      ))}
      {/* floor */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, bottom: 0, background: "repeating-linear-gradient(90deg,#3A2418 0px,#3A2418 120px,#2E1C12 120px,#2E1C12 124px)" }} />
    </AbsoluteFill>
  );
};

/** Long banquet table (front edge at y). */
export const BanquetTable: React.FC<{ y: number }> = ({ y }) => (
  <>
    <div style={{ position: "absolute", left: 40, right: 40, top: y - 60, height: 60, background: "#F7F3EA", border: `6px solid ${C.ink}`, borderRadius: "16px 16px 0 0" }} />
    <div style={{ position: "absolute", left: 40, right: 40, top: y, height: 300, background: "linear-gradient(180deg,#FFFFFF,#E7E1D3)", border: `6px solid ${C.ink}`, borderTop: "none" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ position: "absolute", left: 40 + i * 200, top: 0, width: 120, height: 70, borderRadius: "0 0 60px 60px", background: "#E9E2D2", borderBottom: `4px solid rgba(0,0,0,0.12)` }} />
      ))}
    </div>
  </>
);

export const Plate: React.FC<{ x: number; y: number; clean?: number }> = ({ x, y, clean = 0 }) => (
  <svg width={150} height={50} viewBox="0 0 150 50" style={{ position: "absolute", left: x - 75, top: y - 25 }}>
    <ellipse cx={75} cy={25} rx={70} ry={20} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <ellipse cx={75} cy={25} rx={44} ry={11} fill="#EFEFEF" />
    {clean < 1 && <ellipse cx={75} cy={22} rx={36 * (1 - clean)} ry={9 * (1 - clean)} fill="#C46A2E" />}
    {clean >= 0.9 && <path d="M 100 14 l 4 -10 l 4 10 l 10 4 l -10 4 l -4 10 l -4 -10 l -10 -4 Z" fill="#FFF7A8" stroke={C.ink} strokeWidth={2} />}
  </svg>
);

/** Small falling particles (dust / sparkles). */
export const Sparkles: React.FC<{ count?: number; color?: string; seed?: string }> = ({ count = 30, color = "#FFE58A", seed = "sp" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`${seed}x${i}`) * 1080;
        const y = (random(`${seed}y${i}`) * 1920 + frame * (1 + random(`${seed}v${i}`) * 3)) % 1920;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.2 + i));
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 10, height: 10, borderRadius: "50%", background: color, opacity: tw, boxShadow: `0 0 12px ${color}` }} />;
      })}
    </AbsoluteFill>
  );
};
