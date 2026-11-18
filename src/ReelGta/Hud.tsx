import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { body, C, display, LAYOUT } from "../Reel9320/theme";
import { V } from "./Cast";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * TV-style top bar, the "scoreboard" of this reel: how many people are at the office.
 * `present` can change mid-scene with `changeAt` (counts down/up and flashes).
 */
export const OfficeBoard: React.FC<{
  present: number;
  total: number;
  date: string;
  to?: number;
  changeAt?: number;
  changeLen?: number;
  accent?: string;
}> = ({ present, total, date, to, changeAt = 0, changeLen = 30, accent = "#2E6BD8" }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const value = to === undefined ? present : Math.round(interpolate(frame, [changeAt, changeAt + changeLen], [present, to], clamp));
  const glow = to !== undefined && frame >= changeAt ? interpolate(frame - changeAt, [0, changeLen + 20], [1, 0], clamp) : 0;
  const ratio = value / total;
  const valueColor = ratio > 0.7 ? "#36FF6B" : ratio > 0.4 ? V.yellow : "#FF5252";
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: LAYOUT.hudTop, opacity: enter, translate: `0 ${(1 - enter) * -40}px` }}>
      <div style={{ display: "flex", alignItems: "center", height: 96, borderRadius: 18, background: "rgba(8,14,28,0.9)", border: "3px solid rgba(255,255,255,0.14)", boxShadow: `0 0 ${glow * 50}px ${glow * 10}px #FF5252`, overflow: "hidden", fontFamily: body, fontWeight: 900, color: C.white }}>
        <div style={{ width: 16, alignSelf: "stretch", background: accent }} />
        <div style={{ flex: 1, fontSize: 36, paddingLeft: 20, letterSpacing: 1 }}>EN LA OFICINA</div>
        <div style={{ fontFamily: display, fontSize: 60, padding: "0 22px", alignSelf: "stretch", display: "flex", alignItems: "center", background: "rgba(255,255,255,0.1)", color: valueColor }}>
          {value}/{total}
        </div>
        <div style={{ width: 210, alignSelf: "stretch", display: "flex", alignItems: "center", justifyContent: "center", background: "#E8F4FF", color: C.ink, fontSize: 32 }}>{date}</div>
      </div>
    </div>
  );
};

/** Bottom chip, like "si acaba así, campeón": the employee's status. */
export const StatusChip: React.FC<{ before: "sano" | "enfermo" | "fingiendo"; after?: "sano" | "enfermo" | "fingiendo"; changeAt?: number; label?: string }> = ({
  before,
  after,
  changeAt = 0,
  label = "ESTADO DEL EMPLEADO:",
}) => {
  const frame = useCurrentFrame();
  const state = after && frame >= changeAt ? after : before;
  const pop = after ? interpolate(frame - changeAt, [0, 4, 12], [1, 1.25, 1], clamp) : 1;
  const enter = interpolate(frame, [4, 14], [0, 1], clamp);
  const look = {
    sano: { text: "SANO", bg: "#36C46B" },
    enfermo: { text: "ENFERMO", bg: V.red },
    fingiendo: { text: "«ENFERMO»", bg: V.pink },
  }[state];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: LAYOUT.chipTop, display: "flex", justifyContent: "center", opacity: enter }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 14px 10px 28px", borderRadius: 40, background: "rgba(8,14,28,0.88)", border: "3px solid rgba(255,255,255,0.2)", fontFamily: body, fontWeight: 900, fontSize: 30, color: C.white }}>
        {label}
        <span style={{ fontFamily: display, fontSize: 38, padding: "2px 18px", borderRadius: 26, background: look.bg, border: `4px solid ${C.ink}`, scale: `${pop}` }}>{look.text}</span>
      </div>
    </div>
  );
};

/** Red rubber stamp that slams in at `at`. */
export const Stamp: React.FC<{ text: string; at: number; top: number; color?: string; size?: number; rotate?: number }> = ({
  text,
  at,
  top,
  color = V.red,
  size = 110,
  rotate = -10,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const s = interpolate(frame - at, [0, 5, 10], [2.6, 0.92, 1], clamp);
  const o = interpolate(frame - at, [0, 3], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: display, fontSize: size, color, padding: "0 36px", border: `12px solid ${color}`, borderRadius: 24, rotate: `${rotate}deg`, scale: `${s}`, background: "rgba(255,255,255,0.92)", lineHeight: 1.15 }}>
        {text}
      </div>
    </div>
  );
};

/** Big outlined title text with pop. */
export const BigText: React.FC<{ children: React.ReactNode; at?: number; top: number; size?: number; color?: string; glow?: string }> = ({
  children,
  at = 0,
  top,
  size = 140,
  color = V.yellow,
  glow,
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame - at, [0, 6, 12], [0, 1.15, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top, textAlign: "center", fontFamily: display, fontSize: size, lineHeight: 1, color, WebkitTextStroke: `${Math.round(size / 9)}px ${C.ink}`, paintOrder: "stroke fill", textShadow: glow ? `0 0 50px ${glow}` : "0 10px 0 rgba(0,0,0,0.35)", scale: `${s}` }}>
      {children}
    </div>
  );
};

/** VHS rewind overlay: scanlines, tracking band, RGB tint and the "<< REBOBINANDO" label. */
export const Vhs: React.FC<{ amount: number }> = ({ amount }) => {
  const frame = useCurrentFrame();
  if (amount <= 0) return null;
  const band = (frame * 37) % 1920;
  return (
    <AbsoluteFill style={{ opacity: amount, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(180deg, rgba(0,0,0,0.25) 0 3px, transparent 3px 7px)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(255,0,80,0.12), rgba(0,200,255,0.12))", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: band, height: 60, background: "rgba(255,255,255,0.25)", filter: "blur(6px)" }} />
      {new Array(10).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: random(`v${i}${Math.floor(frame / 2)}`) * 900, top: random(`vy${i}${Math.floor(frame / 2)}`) * 1920, width: 180, height: 4, background: "rgba(255,255,255,0.5)" }} />
      ))}
      <div style={{ position: "absolute", left: 70, top: 250, display: "flex", alignItems: "center", gap: 18, fontFamily: display, fontSize: 64, color: C.white, textShadow: "4px 0 0 rgba(255,0,80,0.8), -4px 0 0 rgba(0,200,255,0.8)" }}>
        <svg width={90} height={56} viewBox="0 0 90 56">
          <path d="M 44 0 L 0 28 L 44 56 Z M 90 0 L 46 28 L 90 56 Z" fill="#FFF" />
        </svg>
        REBOBINANDO
      </div>
      <div style={{ position: "absolute", right: 70, top: 262, fontFamily: body, fontWeight: 900, fontSize: 40, color: C.white }}>
        {`-${String(13 - Math.min(13, Math.floor(frame / 2))).padStart(2, "0")} AÑOS`}
      </div>
    </AbsoluteFill>
  );
};

/** Tear-off calendar page. */
export const CalendarPage: React.FC<{ day: string; month: string; year: string; at?: number; top: number; color?: string }> = ({
  day,
  month,
  year,
  at = 0,
  top,
  color = V.red,
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame - at, [0, 6, 12], [0, 1.15, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", scale: `${s}`, rotate: "-4deg" }}>
      <div style={{ width: 420, borderRadius: 28, overflow: "hidden", border: `10px solid ${C.ink}`, background: C.white, boxShadow: "0 20px 0 rgba(0,0,0,0.3)" }}>
        <div style={{ background: color, color: C.white, fontFamily: display, fontSize: 70, textAlign: "center", padding: "8px 0", borderBottom: `8px solid ${C.ink}` }}>{month}</div>
        <div style={{ fontFamily: display, fontSize: 230, textAlign: "center", lineHeight: 1.05, color: C.ink }}>{day}</div>
        <div style={{ fontFamily: body, fontWeight: 900, fontSize: 56, textAlign: "center", paddingBottom: 14, color: "#555" }}>{year}</div>
      </div>
    </div>
  );
};

/** Comic speech bubble. */
export const Bubble: React.FC<{ children: React.ReactNode; at: number; left: number; top: number; width: number; tail?: "left" | "right" | "down"; size?: number }> = ({
  children,
  at,
  left,
  top,
  width,
  tail = "down",
  size = 58,
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame - at, [0, 5, 10], [0, 1.12, 1], clamp);
  return (
    <div style={{ position: "absolute", left, top, width, scale: `${s}`, transformOrigin: "50% 100%" }}>
      <div style={{ background: C.white, border: `8px solid ${C.ink}`, borderRadius: 40, padding: "18px 26px", fontFamily: display, fontSize: size, lineHeight: 1.05, textAlign: "center", color: C.ink }}>{children}</div>
      <div style={{ position: "absolute", left: tail === "left" ? 60 : tail === "right" ? width - 120 : width / 2 - 30, bottom: -42, width: 0, height: 0, borderLeft: "30px solid transparent", borderRight: "30px solid transparent", borderTop: `50px solid ${C.ink}` }} />
    </div>
  );
};

/** Red alarm vignette for the hook. */
export const RedVignette: React.FC<{ amount: number }> = ({ amount }) => {
  const frame = useCurrentFrame();
  return amount <= 0 ? null : (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, rgba(0,0,0,0) 35%, rgba(150,0,0,${amount * interpolate(Math.sin(frame * 0.35), [-1, 1], [0.35, 0.65])}) 100%)` }} />
  );
};
