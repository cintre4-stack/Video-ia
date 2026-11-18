import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C, display } from "../Reel9320/theme";
import { V } from "./Cast";

/** Little sunset-with-palms picture used inside TV screens (generic open-world vibe). */
export const SunsetPic: React.FC<{ w: number; h: number; t?: number }> = ({ w, h, t = 0 }) => (
  <svg width={w} height={h} viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#3B1466" />
        <stop offset="0.55" stopColor="#FF3EA5" />
        <stop offset="1" stopColor="#FF9F1C" />
      </linearGradient>
    </defs>
    <rect width={320} height={180} fill="url(#sky)" />
    <circle cx={160} cy={118} r={46} fill="#FFE45A" />
    {[100, 108, 116, 124].map((y) => (
      <rect key={y} x={100} y={y} width={120} height={3} fill="#FF3EA5" />
    ))}
    <rect y={130} width={320} height={50} fill="#1B0B33" />
    {/* road stripes moving */}
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={((i * 80 - t * 8) % 400) - 40} y={154} width={40} height={5} fill="#FFE45A" />
    ))}
    <Palm x={40} />
    <Palm x={282} flip />
  </svg>
);

const Palm: React.FC<{ x: number; flip?: boolean }> = ({ x, flip }) => (
  <g transform={`translate(${x} 132) scale(${flip ? -1 : 1} 1)`} fill="#1B0B33">
    <path d="M -3 0 Q 6 -50 4 -86 l 6 0 Q 14 -50 5 0 Z" />
    {[-60, -25, 15, 50, 160, 200].map((a) => (
      <ellipse key={a} cx={7} cy={-86} rx={34} ry={7} transform={`rotate(${a} 7 -86) translate(28 0)`} />
    ))}
  </g>
);

/** Night living room: window with moon, glowing TV on the right. Couch drawn separately (front layer). */
export const Room: React.FC<{ tvGlow?: boolean }> = ({ tvGlow = true }) => {
  const frame = useCurrentFrame();
  const flicker = 0.75 + Math.sin(frame * 0.7) * 0.08 + Math.sin(frame * 1.9) * 0.05;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#1B1F4A 0%,#2A2160 55%,#3A2C6E 100%)" }}>
      {/* wallpaper stripes */}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 60px, transparent 60px 120px)" }} />
      {/* window */}
      <div style={{ position: "absolute", left: 90, top: 700, width: 330, height: 360, borderRadius: 18, background: "linear-gradient(180deg,#0B1030,#1C2A66)", border: "14px solid #4A3A80", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 200, top: 40, width: 70, height: 70, borderRadius: "50%", background: "#FFF3C4", boxShadow: "0 0 40px 10px rgba(255,243,196,0.5)" }} />
        {new Array(14).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: i * 24, bottom: 0, width: 22, height: 80 + random(`b${i}`) * 140, background: "#141A40" }}>
            {random(`w${i}`) > 0.4 && <div style={{ margin: "14px 6px", height: 8, background: "#FFE45A", opacity: 0.8 }} />}
          </div>
        ))}
        <div style={{ position: "absolute", left: 151, top: 0, width: 14, height: "100%", background: "#4A3A80" }} />
      </div>
      {/* TV */}
      <div style={{ position: "absolute", left: 600, top: 760, width: 400, height: 250, borderRadius: 16, background: "#0E0E14", border: "12px solid #22222C", overflow: "hidden", boxShadow: tvGlow ? `0 0 ${120 * flicker}px ${30 * flicker}px rgba(255,62,165,0.35)` : "none" }}>
        <SunsetPic w={376} h={226} t={frame} />
      </div>
      <div style={{ position: "absolute", left: 760, top: 1022, width: 80, height: 40, background: "#22222C" }} />
      <div style={{ position: "absolute", left: 560, top: 1060, width: 480, height: 60, borderRadius: 10, background: "#5A3E2B" }} />
      {/* floor */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1120, bottom: 0, background: "repeating-linear-gradient(90deg,#6B4A33 0 140px,#5E412D 140px 280px)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1120, height: 14, background: "#3E2A1C" }} />
      {/* TV light spill */}
      {tvGlow && <AbsoluteFill style={{ background: `radial-gradient(circle at 80% 48%, rgba(255,62,165,${0.22 * flicker}) 0%, rgba(46,230,255,0) 55%)` }} />}
    </AbsoluteFill>
  );
};

/** Couch front: draw AFTER the characters so it hides their legs. */
export const Couch: React.FC<{ x?: number; w?: number; top?: number }> = ({ x = 140, w = 800, top = 1290 }) => (
  <>
    <div style={{ position: "absolute", left: x, top: top - 150, width: w, height: 190, borderRadius: "40px 40px 0 0", background: "#C0392B", border: `8px solid ${C.ink}`, zIndex: 0, opacity: 0 }} />
    <div style={{ position: "absolute", left: x - 30, top, width: w + 60, height: 200, borderRadius: 36, background: "#D9483B", border: `8px solid ${C.ink}` }} />
    <div style={{ position: "absolute", left: x - 60, top: top - 70, width: 100, height: 260, borderRadius: 36, background: "#B83A2E", border: `8px solid ${C.ink}` }} />
    <div style={{ position: "absolute", left: x + w - 40, top: top - 70, width: 100, height: 260, borderRadius: 36, background: "#B83A2E", border: `8px solid ${C.ink}` }} />
  </>
);

/** Couch back: draw BEFORE the characters. */
export const CouchBack: React.FC<{ x?: number; w?: number; top?: number }> = ({ x = 140, w = 800, top = 1290 }) => (
  <div style={{ position: "absolute", left: x, top: top - 230, width: w, height: 260, borderRadius: "50px 50px 0 0", background: "#B83A2E", border: `8px solid ${C.ink}` }} />
);

/** Bright office: window skyline, floor. Desks are separate so characters can sit between layers. */
export const Office: React.FC<{ dim?: number }> = ({ dim = 0 }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#BFD9EC 0%,#D8E8F3 100%)" }}>
    <div style={{ position: "absolute", left: 60, right: 60, top: 640, height: 420, borderRadius: 16, background: "linear-gradient(180deg,#7EC8F2,#CFEFFF)", border: "14px solid #8BA3B8", overflow: "hidden" }}>
      {new Array(12).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: i * 82, bottom: 0, width: 70, height: 120 + random(`o${i}`) * 220, background: i % 2 ? "#6E8FB0" : "#86A6C4" }}>
          {new Array(6).fill(0).map((__, j) => (
            <div key={j} style={{ margin: "14px 10px 0", height: 10, background: "rgba(255,255,255,0.6)" }} />
          ))}
        </div>
      ))}
      {[1, 2, 3].map((k) => (
        <div key={k} style={{ position: "absolute", left: `${k * 25}%`, top: 0, width: 12, height: "100%", background: "#8BA3B8" }} />
      ))}
    </div>
    {/* ceiling lights */}
    {[200, 540, 880].map((x) => (
      <div key={x} style={{ position: "absolute", left: x - 110, top: 560, width: 220, height: 22, borderRadius: 8, background: "#FFFFFF", boxShadow: "0 10px 40px 8px rgba(255,255,255,0.8)" }} />
    ))}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1150, bottom: 0, background: "repeating-linear-gradient(90deg,#9AA8B5 0 120px,#8E9CAA 120px 240px)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1150, height: 14, background: "#6F7E8C" }} />
    {dim > 0 && <AbsoluteFill style={{ background: `rgba(10,15,40,${dim})` }} />}
  </AbsoluteFill>
);

export const Chair: React.FC<{ x: number; y: number; spin?: number }> = ({ x, y, spin = 0 }) => (
  <div style={{ position: "absolute", left: x - 70, top: y - 260, width: 140, height: 260, rotate: `${spin}deg` }}>
    <div style={{ position: "absolute", left: 10, top: 0, width: 120, height: 150, borderRadius: 30, background: "#2C3550", border: `6px solid ${C.ink}` }} />
    <div style={{ position: "absolute", left: 62, top: 150, width: 16, height: 80, background: "#555" }} />
    <div style={{ position: "absolute", left: 10, top: 225, width: 120, height: 16, borderRadius: 8, background: "#444" }} />
  </div>
);

export const Desk: React.FC<{ x: number; y: number; w?: number; screen?: "off" | "on" | "game" }> = ({ x, y, w = 300, screen = "on" }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - 250, width: w, height: 250 }}>
      <div style={{ position: "absolute", left: w / 2 - 80, top: 0, width: 160, height: 104, borderRadius: 10, background: "#1E2430", border: `6px solid ${C.ink}`, overflow: "hidden" }}>
        {screen === "on" && <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg,#DDEBFF,#AFC8EE)" }} />}
        {screen === "game" && <SunsetPic w={148} h={92} t={frame} />}
      </div>
      <div style={{ position: "absolute", left: w / 2 - 10, top: 104, width: 20, height: 26, background: "#333" }} />
      <div style={{ position: "absolute", left: 0, top: 128, width: w, height: 30, borderRadius: 8, background: "#E8D3B0", border: `6px solid ${C.ink}` }} />
      <div style={{ position: "absolute", left: 14, top: 158, width: w - 28, height: 92, background: "#CDB58F", border: `6px solid ${C.ink}`, borderTop: "none" }} />
    </div>
  );
};

/** Night street with a game shop and neon sign (generic, no brands). */
export const Street: React.FC = () => {
  const frame = useCurrentFrame();
  const neon = 0.85 + Math.sin(frame * 0.9) * 0.1 * (random(`n${Math.floor(frame / 6)}`) > 0.85 ? -3 : 1);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#0B1030 0%,#1C1A48 60%,#2A2050 100%)" }}>
      {new Array(40).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: random(`sx${i}`) * 1080, top: 300 + random(`sy${i}`) * 300, width: 4, height: 4, borderRadius: 2, background: "#FFF", opacity: 0.5 + 0.5 * Math.sin(frame * 0.2 + i) }} />
      ))}
      {/* building */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 640, height: 640, background: "#3A2C5E", border: `10px solid ${C.ink}`, borderBottom: "none" }} />
      {/* neon sign */}
      <div style={{ position: "absolute", left: 140, right: 140, top: 680, height: 120, borderRadius: 20, border: `8px solid ${V.pink}`, boxShadow: `0 0 ${50 * neon}px ${V.pink}, inset 0 0 ${30 * neon}px ${V.pink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: display, fontSize: 84, color: "#FFE6F4", textShadow: `0 0 ${24 * neon}px ${V.pink}`, opacity: neon }}>
        VIDEOJUEGOS
      </div>
      {/* shop window + door */}
      <div style={{ position: "absolute", left: 90, top: 850, width: 520, height: 330, background: "linear-gradient(180deg,#FFE9A8,#FFC86B)", border: `10px solid ${C.ink}`, boxShadow: "0 0 80px 10px rgba(255,200,107,0.45)" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", left: 30 + i * 120, top: 60, width: 90, height: 120, borderRadius: 6, background: i % 2 ? V.pink : V.cyan, border: `5px solid ${C.ink}` }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 700, top: 820, width: 260, height: 460, background: "#FFDA85", border: `10px solid ${C.ink}`, boxShadow: "0 0 80px 10px rgba(255,200,107,0.5)" }}>
        <div style={{ margin: "40px auto 0", width: 180, padding: "6px 0", textAlign: "center", fontFamily: display, fontSize: 40, background: V.red, color: "#FFF", borderRadius: 10, border: `5px solid ${C.ink}` }}>00:00</div>
      </div>
      {/* sidewalk */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1280, bottom: 0, background: "#4A4560" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1280, height: 20, background: "#6A6480" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, bottom: 0, background: "#26233A" }} />
    </AbsoluteFill>
  );
};

/** Vice-style sunset sky with sun stripes and palms, for the GTA 6 part. */
export const NeonSky: React.FC<{ zoom?: number }> = ({ zoom = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: `${zoom}` }}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg,#14062E 0%,#3B1466 35%,#C2187A 62%,#FF9F1C 80%)" }} />
        <div style={{ position: "absolute", left: 240, top: 980, width: 600, height: 600, borderRadius: "50%", background: "linear-gradient(180deg,#FFE45A,#FF3EA5)" }} />
        {new Array(7).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 200, right: 200, top: 1150 + i * 40, height: 8 + i * 3, background: "#C2187A" }} />
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1380, bottom: 0, background: "#14062E" }} />
        {/* perspective grid */}
        <svg style={{ position: "absolute", left: 0, top: 1380 }} width={1080} height={540}>
          {new Array(11).fill(0).map((_, i) => (
            <line key={i} x1={540} y1={0} x2={-500 + i * 208} y2={540} stroke={V.cyan} strokeWidth={3} opacity={0.6} />
          ))}
          {new Array(8).fill(0).map((_, i) => {
            const y = ((i * 70 + frame * 4) % 560) ** 1.15 / 1.6;
            return <line key={`h${i}`} x1={0} y1={y} x2={1080} y2={y} stroke={V.cyan} strokeWidth={3} opacity={0.6} />;
          })}
        </svg>
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1920} viewBox="0 0 1080 1920">
          <g transform="translate(70 1400) scale(3.2)" fill="#14062E">
            <PalmShape />
          </g>
          <g transform="translate(1010 1400) scale(-3.4 3.4)" fill="#14062E">
            <PalmShape />
          </g>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PalmShape: React.FC = () => (
  <>
    <path d="M -3 0 Q 6 -50 4 -86 l 6 0 Q 14 -50 5 0 Z" />
    {[-60, -25, 15, 50, 160, 200].map((a) => (
      <ellipse key={a} cx={7} cy={-86} rx={34} ry={7} transform={`rotate(${a} 7 -86) translate(28 0)`} />
    ))}
  </>
);
