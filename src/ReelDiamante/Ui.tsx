import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { body, C, display, LAYOUT } from "./theme";

const stroke = (w: number, color = C.ink) =>
  `${w}px ${w}px 0 ${color}, -${w}px ${w}px 0 ${color}, ${w}px -${w}px 0 ${color}, -${w}px -${w}px 0 ${color}, 0 ${w * 2}px 0 ${color}`;

/** Big pop-in headline. */
export const Title: React.FC<{
  children: React.ReactNode;
  from?: number;
  top?: number;
  size?: number;
  color?: string;
  shake?: boolean;
  rotate?: number;
}> = ({ children, from = 0, top = LAYOUT.titleTop, size = 110, color = C.white, shake, rotate = -2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 9, stiffness: 160 } });
  if (frame < from) return null;
  const dx = shake ? Math.sin(frame * 2.1) * 6 * Math.max(0, 1 - (frame - from) / 20) : 0;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 40,
        right: 40,
        textAlign: "center",
        fontFamily: display,
        fontSize: size,
        lineHeight: 1.02,
        color,
        textShadow: stroke(6),
        transform: `translateX(${dx}px) scale(${s}) rotate(${rotate}deg)`,
      }}
    >
      {children}
    </div>
  );
};

/** Rounded label chip that slides in. */
export const Chip: React.FC<{
  children: React.ReactNode;
  from: number;
  top: number;
  left?: number;
  right?: number;
  bg?: string;
  color?: string;
  size?: number;
}> = ({ children, from, top, left, right, bg = C.gold, color = C.ink, size = 54 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 11 } });
  if (frame < from) return null;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        right,
        ...(left === undefined && right === undefined ? { left: 0, right: 0, display: "flex", justifyContent: "center" } : {}),
        transform: `scale(${s})`,
      }}
    >
      <div
        style={{
          background: bg,
          color,
          fontFamily: display,
          fontSize: size,
          padding: "14px 34px",
          borderRadius: 999,
          border: `6px solid ${C.ink}`,
          boxShadow: `0 10px 0 ${C.ink}`,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Hanging price tag that drops in and swings. */
export const PriceTag: React.FC<{ text: string; from: number; x: number; y: number; bg: string; rot?: number }> = ({
  text,
  from,
  x,
  y,
  bg,
  rot = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from) return null;
  const drop = spring({ frame: frame - from, fps, config: { damping: 8, stiffness: 120 } });
  const swing = Math.sin((frame - from) * 0.25) * 10 * Math.exp(-(frame - from) / 30) + rot;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 170,
        top: interpolate(drop, [0, 1], [-400, y]),
        width: 340,
        transformOrigin: "50% -60px",
        transform: `rotate(${swing}deg)`,
      }}
    >
      <div style={{ position: "absolute", left: 168, top: -80, width: 4, height: 80, background: "#EEE" }} />
      <div
        style={{
          background: bg,
          border: `6px solid ${C.ink}`,
          borderRadius: 26,
          textAlign: "center",
          fontFamily: display,
          fontSize: 96,
          color: C.ink,
          padding: "10px 0",
          boxShadow: `0 10px 0 ${C.ink}`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Counter that ticks from `a` to `b`. */
export const Counter: React.FC<{
  from: number;
  dur: number;
  a: number;
  b: number;
  top: number;
  prefix?: string;
  suffix?: string;
  size?: number;
  color?: string;
}> = ({ from, dur, a, b, top, prefix = "", suffix = "", size = 92, color = C.gold }) => {
  const frame = useCurrentFrame();
  if (frame < from) return null;
  const t = interpolate(frame, [from, from + dur], [0, 1], { extrapolateRight: "clamp" });
  const eased = 1 - Math.pow(1 - t, 3);
  const v = Math.round(a + (b - a) * eased);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: display,
        fontSize: size,
        color,
        textShadow: stroke(5),
      }}
    >
      {prefix}
      {v.toLocaleString("es-MX")}
      {suffix}
    </div>
  );
};

/**
 * TikTok-style captions: the narration line split into chunks of up to 3
 * words; the word being said pops in gold. Word timing is spread across the
 * clip by syllable-ish length (characters).
 */
export const Captions: React.FC<{ text: string; from: number; dur: number; top?: number }> = ({
  text,
  from,
  dur,
  top = LAYOUT.captionTop,
}) => {
  const frame = useCurrentFrame() - from;
  if (frame < 0 || frame > dur + 8) return null;
  const words = text.split(/\s+/).filter(Boolean);
  const weights = words.map((w) => w.replace(/[^\p{L}\d]/gu, "").length + 2 + (/[.?!,]$/.test(w) ? 4 : 0));
  const total = weights.reduce((a, b) => a + b, 0);
  const starts: number[] = [];
  let acc = 0;
  for (const w of weights) {
    starts.push((acc / total) * dur);
    acc += w;
  }
  let current = 0;
  for (let i = 0; i < words.length; i++) if (frame >= starts[i]) current = i;

  // Chunks of 3 words, but break after sentence punctuation.
  const chunks: number[][] = [];
  let cur: number[] = [];
  words.forEach((w, i) => {
    cur.push(i);
    if (cur.length === 3 || /[.?!]$/.test(w)) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  const chunk = chunks.find((c) => c.includes(current)) ?? chunks[0];

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 50,
        right: 50,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 22px",
        fontFamily: display,
        fontSize: 84,
        lineHeight: 1.1,
        textTransform: "uppercase",
      }}
    >
      {chunk.map((i) => {
        const active = i === current;
        const age = frame - starts[i];
        const pop = active ? 1 + 0.18 * Math.max(0, 1 - age / 6) : 1;
        return (
          <span
            key={i}
            style={{
              color: active ? C.gold : C.white,
              opacity: i <= current ? 1 : 0.55,
              textShadow: stroke(5),
              transform: `scale(${pop})`,
              display: "inline-block",
            }}
          >
            {words[i]}
          </span>
        );
      })}
    </div>
  );
};

export const Backdrop: React.FC<{ top: string; bottom: string; glow?: string }> = ({ top, bottom, glow = "transparent" }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(circle at 50% 42%, ${glow} 0%, transparent 45%), linear-gradient(${top}, ${bottom})`,
    }}
  />
);

export const Small: React.FC<{ children: React.ReactNode; top: number; from?: number }> = ({ children, top, from = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 60,
        right: 60,
        textAlign: "center",
        fontFamily: body,
        fontWeight: 900,
        fontSize: 40,
        color: C.white,
        opacity: o,
        textShadow: stroke(3),
      }}
    >
      {children}
    </div>
  );
};
