import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HORNO_CUT, MONTAJE_LAYERS } from "./Scenes3D";
import { body, C, clamp, display } from "./theme";
import { VOICE_LEAD } from "./timeline";

const usePop = (delay = 0) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping: 12, stiffness: 180 } });
};

/** Cabecera compacta: barra de progreso de 6 pasos + "PASO n" + título. */
export const StepHeader: React.FC<{ step: number; title: string; color?: string }> = ({ step, title, color = C.tomato }) => {
  const pop = usePop(2);
  const titlePop = usePop(6);
  return (
    <div style={{ position: "absolute", top: 100, left: 70, right: 70, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 14,
              borderRadius: 7,
              background: i <= step ? color : "rgba(42,26,18,0.25)",
              boxShadow: i === step ? `0 0 18px ${color}` : undefined,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div
          style={{
            fontFamily: display,
            fontSize: 50,
            color: C.cream,
            background: color,
            padding: "6px 22px 2px",
            borderRadius: 18,
            border: `5px solid ${C.ink}`,
            scale: `${pop}`,
            rotate: "-3deg",
          }}
        >
          PASO {step}
        </div>
        <div
          style={{
            fontFamily: display,
            fontSize: 92,
            lineHeight: 1,
            color: C.cream,
            WebkitTextStroke: `14px ${C.ink}`,
            paintOrder: "stroke fill",
            scale: `${titlePop}`,
            textShadow: "0 9px 0 rgba(0,0,0,0.25)",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
};

/** Lista de ingredientes que entran uno a uno, en "pegatinas". */
export const Chips: React.FC<{ items: { text: string; color: string; at: number }[]; top?: number }> = ({ items, top = 300 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
      {items.map((it, i) => {
        const p = spring({ frame: f - it.at, fps, config: { damping: 11, stiffness: 200 } });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontFamily: body,
              fontWeight: 900,
              fontSize: 38,
              color: C.ink,
              background: C.cream,
              padding: "8px 22px 8px 14px",
              borderRadius: 40,
              border: `5px solid ${C.ink}`,
              boxShadow: "0 7px 0 rgba(0,0,0,0.25)",
              scale: `${p}`,
              rotate: `${(i % 2 ? 1 : -1) * 2}deg`,
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 15, background: it.color, border: `4px solid ${C.ink}` }} />
            {it.text}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Subtítulos palabra a palabra. El tiempo de cada palabra es proporcional a sus
 * letras dentro de la duración de la locución (Piper no da marcas de tiempo).
 */
export const Captions: React.FC<{ text: string; voiceFrames: number; top?: number }> = ({ text, voiceFrames, top = 1440 }) => {
  const f = useCurrentFrame() - VOICE_LEAD;
  const words = text.split(/\s+/);
  const weights = words.map((w) => w.replace(/[^\p{L}\p{N}]/gu, "").length + 2 + (/[.,!?¡¿]$/.test(w) ? 5 : 0));
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  const starts = weights.map((w) => {
    const s = (acc / total) * voiceFrames;
    acc += w;
    return s;
  });
  // Trozos de hasta 4 palabras, cortando tras puntuación.
  const chunks: number[][] = [];
  let cur: number[] = [];
  words.forEach((w, i) => {
    cur.push(i);
    if (cur.length >= 4 || /[.,!?]$/.test(w)) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  if (f < 0 || f > voiceFrames + 6) return null;
  const chunk = [...chunks].reverse().find((c) => starts[c[0]] <= f) ?? chunks[0];
  const chunkStart = starts[chunk[0]];
  const pop = interpolate(f - chunkStart, [0, 5], [0.85, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 18px",
          fontFamily: display,
          fontSize: 76,
          lineHeight: 1.12,
          textAlign: "center",
          scale: `${pop}`,
        }}
      >
        {chunk.map((i) => {
          const active = f >= starts[i] && (i === words.length - 1 || f < starts[i + 1]);
          return (
            <span
              key={i}
              style={{
                color: active ? C.cheese : "#FFFFFF",
                WebkitTextStroke: `12px ${C.ink}`,
                paintOrder: "stroke fill",
                textShadow: "0 7px 0 rgba(0,0,0,0.3)",
              }}
            >
              {words[i].toUpperCase()}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Portada del gancho. */
export const IntroTitle: React.FC = () => {
  const a = usePop(4);
  const b = usePop(14);
  const c = usePop(24);
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 150, left: 60, right: 60, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          fontFamily: display,
          fontSize: 150,
          lineHeight: 0.95,
          color: C.cheese,
          WebkitTextStroke: `18px ${C.ink}`,
          paintOrder: "stroke fill",
          textAlign: "center",
          scale: `${a}`,
          rotate: `${Math.sin(f * 0.08) * 2 - 2}deg`,
          textShadow: "0 14px 0 rgba(0,0,0,0.25)",
        }}
      >
        LASAÑA
        <br />
        CASERA
      </div>
      <div
        style={{
          marginTop: 26,
          fontFamily: display,
          fontSize: 66,
          color: C.cream,
          background: C.tomato,
          padding: "8px 34px 2px",
          borderRadius: 22,
          border: `6px solid ${C.ink}`,
          scale: `${b}`,
          rotate: "2deg",
        }}
      >
        EN 6 PASOS
      </div>
      <div style={{ marginTop: 22, fontFamily: body, fontWeight: 900, fontSize: 44, color: C.ink, scale: `${c}` }}>con Chef Bolo</div>
    </div>
  );
};

/** Montaje: rótulo de la capa que está cayendo. */
export const LayerLabel: React.FC = () => {
  const f = useCurrentFrame();
  const current = [...MONTAJE_LAYERS].reverse().find((l) => f >= l.at);
  if (!current) return null;
  const idx = MONTAJE_LAYERS.indexOf(current);
  const p = interpolate(f - current.at, [0, 6], [0.6, 1], { ...clamp, easing: Easing.out(Easing.back(2.5)) });
  const color = { pasta: C.pasta, carne: "#A5321D", bechamel: C.bechamel, queso: C.cheese }[current.kind];
  return (
    <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
      <div
        style={{
          fontFamily: display,
          fontSize: 70,
          color: current.kind === "carne" ? C.cream : C.ink,
          background: color,
          padding: "8px 36px 2px",
          borderRadius: 24,
          border: `6px solid ${C.ink}`,
          scale: `${p}`,
        }}
      >
        {current.kind.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: display,
          fontSize: 56,
          color: C.cream,
          WebkitTextStroke: `10px ${C.ink}`,
          paintOrder: "stroke fill",
          alignSelf: "center",
        }}
      >
        CAPA {Math.floor(idx / 3) + 1}/3
      </div>
    </div>
  );
};

/** Horno: 180 °C y temporizador que corre de 30:00 a 00:00. */
export const OvenTimer: React.FC<{ dur: number }> = ({ dur }) => {
  const pop = usePop(HORNO_CUT + 30);
  const f = useCurrentFrame() - HORNO_CUT;
  if (f < 0) return null;
  const secs = Math.round(interpolate(f, [34, dur - HORNO_CUT - 12], [1800, 0], clamp));
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return (
    <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20, scale: `${pop}` }}>
      {[`180 °C`, `${mm}:${ss}`].map((t, i) => (
        <div
          key={t.slice(0, 3)}
          style={{
            fontFamily: display,
            fontSize: 76,
            color: i === 0 ? C.cream : C.cheese,
            background: i === 0 ? C.tomato : C.ink,
            padding: "8px 30px 2px",
            borderRadius: 24,
            border: `6px solid ${C.ink}`,
            fontVariantNumeric: "tabular-nums",
            minWidth: i === 1 ? 260 : undefined,
            textAlign: "center",
          }}
        >
          {t}
        </div>
      ))}
    </div>
  );
};

/** Cierre: "¡Guárdala!" con icono de marcador. */
export const Cta: React.FC<{ at: number }> = ({ at }) => {
  const p = usePop(at);
  const title = usePop(4);
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 150, left: 60, right: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div
        style={{
          fontFamily: display,
          fontSize: 132,
          color: C.cheese,
          WebkitTextStroke: `16px ${C.ink}`,
          paintOrder: "stroke fill",
          textShadow: "0 12px 0 rgba(0,0,0,0.25)",
          scale: `${title}`,
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        ¡LISTA!
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontFamily: display,
          fontSize: 64,
          color: C.cream,
          background: C.tomato,
          border: `6px solid ${C.ink}`,
          borderRadius: 28,
          padding: "12px 34px 8px",
          scale: `${p}`,
          rotate: `${Math.sin(f * 0.15) * 3}deg`,
        }}
      >
        <svg width="54" height="64" viewBox="0 0 24 28">
          <path d="M3 2h18v24l-9-6-9 6z" fill={C.cream} stroke={C.ink} strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
        GUÁRDALA
      </div>
    </div>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, transparent 55%, rgba(60,30,10,0.35) 100%)", pointerEvents: "none" }} />
);

/** Destello blanco en cada corte. */
export const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6], [0.7, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{ background: "#FFF8E8", opacity: o }} /> : null;
};
