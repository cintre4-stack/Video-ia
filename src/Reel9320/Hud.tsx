import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { body, C, display, LAYOUT } from "./theme";

type Row = {
  home: string;
  away: string;
  homeColor: string;
  awayColor: string;
  score: [number, number];
  minute: string;
};

/**
 * Dual live scoreboard, both final-day matches at once.
 * `flashRow` + `flashAt` pop one row when a goal goes in.
 */
export const Scoreboard: React.FC<{
  city: [number, number];
  utd: [number, number];
  minuteCity: string;
  minuteUtd: string;
  flashRow?: "city" | "utd";
  flashAt?: number;
}> = ({ city, utd, minuteCity, minuteUtd, flashRow, flashAt = 0 }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const pop = (row: "city" | "utd") =>
    flashRow === row
      ? interpolate(frame - flashAt, [0, 4, 16], [1, 1.12, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const glow = (row: "city" | "utd") =>
    flashRow === row && frame >= flashAt
      ? interpolate(frame - flashAt, [0, 30], [1, 0], { extrapolateRight: "clamp" })
      : 0;

  const rows: (Row & { key: "city" | "utd" })[] = [
    {
      key: "city",
      home: "MAN CITY",
      away: "QPR",
      homeColor: C.city,
      awayColor: C.qpr,
      score: city,
      minute: minuteCity,
    },
    {
      key: "utd",
      home: "SUNDERLAND",
      away: "MAN UTD",
      homeColor: C.sunderland,
      awayColor: C.utd,
      score: utd,
      minute: minuteUtd,
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: LAYOUT.hudTop,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        opacity: enter,
        translate: `0 ${(1 - enter) * -40}px`,
      }}
    >
      {rows.map((r) => (
        <div
          key={r.key}
          style={{
            display: "flex",
            alignItems: "center",
            height: 84,
            borderRadius: 18,
            background: "rgba(8,14,28,0.88)",
            border: "3px solid rgba(255,255,255,0.14)",
            boxShadow: `0 0 ${glow(r.key) * 50}px ${glow(r.key) * 10}px ${
              r.key === "city" ? C.city : C.utd
            }`,
            scale: `${pop(r.key)}`,
            fontFamily: body,
            fontWeight: 900,
            color: C.white,
            overflow: "hidden",
          }}
        >
          <div style={{ width: 16, alignSelf: "stretch", background: r.homeColor }} />
          <div style={{ flex: 1, fontSize: 36, paddingLeft: 18, letterSpacing: 1 }}>{r.home}</div>
          <div
            style={{
              fontFamily: display,
              fontSize: 54,
              padding: "0 18px",
              background: "rgba(255,255,255,0.1)",
              alignSelf: "stretch",
              display: "flex",
              alignItems: "center",
            }}
          >
            {r.score[0]} - {r.score[1]}
          </div>
          <div style={{ flex: 1, fontSize: 36, textAlign: "right", paddingRight: 18, letterSpacing: 1 }}>
            {r.away}
          </div>
          <div style={{ width: 16, alignSelf: "stretch", background: r.awayColor }} />
          <div
            style={{
              width: 128,
              alignSelf: "stretch",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: r.minute === "FINAL" ? "#444" : "#E8F4FF",
              color: r.minute === "FINAL" ? C.white : C.ink,
              fontSize: 32,
            }}
          >
            {r.minute}
          </div>
        </div>
      ))}
    </div>
  );
};

/** "Si acaba así, campeón:" live indicator. Pops when `changeAt` is reached. */
export const LiveChampion: React.FC<{
  before: "city" | "utd";
  after?: "city" | "utd";
  changeAt?: number;
}> = ({ before, after, changeAt = 0 }) => {
  const frame = useCurrentFrame();
  const current = after && frame >= changeAt ? after : before;
  const pop =
    after && after !== before
      ? interpolate(frame - changeAt, [0, 5, 18], [1, 1.25, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const color = current === "city" ? C.city : C.utd;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: LAYOUT.chipTop,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 14px 12px 28px",
          borderRadius: 999,
          background: "rgba(8,14,28,0.9)",
          border: `4px solid ${color}`,
          scale: `${pop}`,
          fontFamily: body,
          fontWeight: 900,
          color: C.white,
          fontSize: 34,
        }}
      >
        <span style={{ opacity: 0.85 }}>SI ACABA ASÍ, CAMPEÓN:</span>
        <span
          style={{
            fontFamily: display,
            fontSize: 44,
            background: color,
            color: current === "city" ? C.cityDark : C.white,
            borderRadius: 999,
            padding: "4px 24px",
          }}
        >
          {current === "city" ? "CITY" : "UNITED"}
        </span>
      </div>
    </div>
  );
};

const CaptionInner: React.FC<{
  children: string;
  /** frame at which the words start popping in */
  delay?: number;
  /** words to paint in the accent color */
  accentWords?: string;
  accent?: string;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, accentWords = "", accent = C.gold, style }) => {
  const frame = useCurrentFrame();
  const words = children.split(" ");
  const accents = new Set(
    accentWords
      .toUpperCase()
      .split(" ")
      .filter(Boolean),
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: LAYOUT.captionTop,
        textAlign: "center",
        fontFamily: display,
        fontSize: 84,
        lineHeight: 1.05,
        color: C.white,
        WebkitTextStroke: `14px ${C.ink}`,
        paintOrder: "stroke fill",
        textShadow: "0 8px 0 rgba(0,0,0,0.35)",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const t = frame - delay - i * 3;
        const s = interpolate(t, [0, 4, 9], [0, 1.18, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const clean = w.toUpperCase().replace(/[.,!?¡¿:]/g, "");
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.25em",
              scale: `${s}`,
              color: accents.has(clean) ? accent : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Word-by-word pop caption; text and style editable in Studio. */
export const Caption = Interactive.create({
  Component: CaptionInner,
  layout: "none",
  schema: {
    ...Interactive.textSchema,
    children: { type: "string", default: "", description: "Texto" },
    accentWords: { type: "string", default: "", description: "Palabras resaltadas" },
    accent: { type: "color", default: C.gold, description: "Color de resaltado" },
  } as const,
});

/** Small label above the caption: minute badge like "20'". */
export const MinuteBadge: React.FC<{ text: string; color: string; textColor?: string; top?: number }> = ({
  text,
  color,
  textColor = C.white,
  top = LAYOUT.badgeTop,
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, 6, 12], [0, 1.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        display: "flex",
        justifyContent: "center",
        scale: `${s}`,
      }}
    >
      <div
        style={{
          fontFamily: display,
          fontSize: 56,
          color: textColor,
          background: color,
          padding: "2px 26px",
          borderRadius: 16,
          border: `5px solid ${C.ink}`,
          rotate: "-3deg",
        }}
      >
        {text}
      </div>
    </div>
  );
};
