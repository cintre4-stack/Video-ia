import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { body, CLUB, display } from "./theme";
import { GOAL_TOTAL, ITEMS, LEAD, money, Scene, sceneById, SCENES, UPGRADE_AT } from "./timeline";
import { VOICE_FRAMES } from "./voiceover.generated";

const OUTLINE: React.CSSProperties = {
  WebkitTextStroke: "12px #0A0F1A",
  paintOrder: "stroke fill",
};

const usePop = (delay: number, damping = 10) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 170 } });
};

/* ---------- icons ---------- */

const Heart: React.FC<{ size: number; color?: string }> = ({ size, color = CLUB.red }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.6.7-1.4 2.2-2.6 4.3-2.6 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"
      fill={color}
      stroke="#0A0F1A"
      strokeWidth={1.4}
    />
  </svg>
);

const Bubble: React.FC<{ size: number; color?: string }> = ({ size, color = "#4CC9F0" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
      fill={color}
      stroke="#0A0F1A"
      strokeWidth={1.4}
    />
    <circle cx="8" cy="11" r="1.4" fill="#0A0F1A" />
    <circle cx="12" cy="11" r="1.4" fill="#0A0F1A" />
    <circle cx="16" cy="11" r="1.4" fill="#0A0F1A" />
  </svg>
);

/* ---------- captions ---------- */

const Caption: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const words = scene.caption.split(" ");
  const span = VOICE_FRAMES[scene.voice] * 0.85;
  const out = interpolate(frame, [scene.dur - 6, scene.dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: 1270,
        left: 70,
        right: 70,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 22px",
        opacity: out,
      }}
    >
      {words.map((w, i) => {
        const at = LEAD + (i / words.length) * span;
        const t = interpolate(frame, [at, at + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const hot = w.includes("$") || (w.replace(/[^A-ZÁÉÍÓÚÑa-záéíóúñ]/g, "").length > 1 && w === w.toUpperCase());
        return (
          <span
            key={i}
            style={{
              fontFamily: display,
              fontSize: hot ? 92 : 80,
              lineHeight: 1.12,
              color: hot ? CLUB.gold : CLUB.white,
              transform: `translateY(${(1 - t) * 30}px) scale(${0.6 + t * 0.4 + (hot ? Math.sin(t * Math.PI) * 0.15 : 0)})`,
              opacity: t,
              display: "inline-block",
              ...OUTLINE,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- per-scene graphics ---------- */

const HookTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const p1 = usePop(2);
  const p2 = usePop(10);
  const wob = Math.sin(frame * 0.5) * 3;
  return (
    <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center" }}>
      <div
        style={{
          display: "inline-block",
          background: CLUB.red,
          border: "8px solid #0A0F1A",
          borderRadius: 28,
          padding: "10px 40px",
          transform: `scale(${p1}) rotate(${-4 + wob}deg)`,
          boxShadow: "0 14px 0 #0A0F1A",
        }}
      >
        <div style={{ fontFamily: display, fontSize: 96, color: "#fff", ...OUTLINE, WebkitTextStroke: "8px #0A0F1A" }}>
          ¡NECESITO
        </div>
      </div>
      <div
        style={{
          fontFamily: display,
          fontSize: 132,
          color: CLUB.gold,
          marginTop: 14,
          transform: `scale(${p2}) rotate(${3 - wob}deg)`,
          ...OUTLINE,
        }}
      >
        TU AYUDA!
      </div>
    </div>
  );
};

const Stamp: React.FC<{ text: string; at: number; color?: string; top?: number }> = ({ text, at, color = CLUB.red, top = 300 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) });
  if (frame < at) return null;
  return (
    <div style={{ position: "absolute", top, width: "100%", textAlign: "center" }}>
      <div
        style={{
          display: "inline-block",
          fontFamily: display,
          fontSize: 120,
          color,
          border: `12px solid ${color}`,
          borderRadius: 24,
          padding: "0 34px",
          background: "rgba(255,255,255,0.88)",
          transform: `scale(${3 - 2 * t}) rotate(-8deg)`,
          opacity: t,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const CanchaGraphics: React.FC = () => {
  const p = usePop(LEAD);
  return (
    <>
      <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            fontFamily: display,
            fontSize: 84,
            color: "#fff",
            background: CLUB.navy,
            border: "7px solid #0A0F1A",
            borderRadius: 22,
            padding: "6px 34px",
            transform: `scale(${p})`,
          }}
        >
          MI NUEVO CLUB
        </div>
      </div>
      <Stamp text="DA PENA" at={LEAD + VOICE_FRAMES.s02 - 28} top={420} />
    </>
  );
};

const RuleCard: React.FC<{ at: number; icon: React.ReactNode; left: string; right: string; tilt: number; size?: number }> = ({
  at,
  icon,
  left,
  right,
  tilt,
  size = 92,
}) => {
  const p = usePop(at, 9);
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        background: "#fff",
        border: "8px solid #0A0F1A",
        borderRadius: 36,
        padding: "14px 40px",
        boxShadow: "0 14px 0 #0A0F1A",
        transform: `translateX(${(1 - p) * (tilt > 0 ? 900 : -900)}px) rotate(${tilt + Math.sin(frame * 0.2) * 1.2}deg)`,
        marginBottom: 34,
      }}
    >
      {icon}
      <div style={{ fontFamily: display, fontSize: size, color: CLUB.ink, whiteSpace: "nowrap" }}>{left}</div>
      <div style={{ fontFamily: display, fontSize: 92, color: CLUB.ink }}>=</div>
      <div style={{ fontFamily: display, fontSize: 116, color: "#1F9D55" }}>{right}</div>
    </div>
  );
};

const Rules: React.FC = () => (
  <div style={{ position: "absolute", top: 250, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
    <RuleCard at={LEAD + 58} icon={<Heart size={110} />} left="1 LIKE" right="$1" tilt={-3} />
    <RuleCard at={LEAD + 108} icon={<Bubble size={96} />} left="1 COMENTARIO" right="$10" tilt={3} size={70} />
  </div>
);

const PriceTag: React.FC<{ label: string; price: number }> = ({ label, price }) => {
  const frame = useCurrentFrame();
  const p = usePop(UPGRADE_AT, 8);
  const swing = Math.sin((frame - UPGRADE_AT) * 0.25) * 6 * Math.exp(-(frame - UPGRADE_AT) / 25);
  if (frame < UPGRADE_AT) return null;
  return (
    <div style={{ position: "absolute", top: 400, width: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `scale(${p}) rotate(${swing - 3}deg)`, transformOrigin: "50% 0%", textAlign: "center" }}>
        <div
          style={{
            background: CLUB.gold,
            border: "9px solid #0A0F1A",
            borderRadius: 34,
            padding: "12px 46px 18px",
            boxShadow: "0 16px 0 #0A0F1A",
          }}
        >
          <div style={{ fontFamily: body, fontWeight: 900, fontSize: 46, color: CLUB.ink, letterSpacing: 2 }}>{label}</div>
          <div style={{ fontFamily: display, fontSize: 170, lineHeight: 1, color: "#fff", ...OUTLINE }}>{money(price)}</div>
        </div>
      </div>
    </div>
  );
};

/** Club fundraising meter: fills as each price is revealed. */
const GoalHud: React.FC = () => {
  const frame = useCurrentFrame();
  const first = sceneById("porterias");
  const nombre = sceneById("nombre");
  if (frame < first.start + UPGRADE_AT) return null;
  // Out of the way while the name card is on screen.
  if (frame >= nombre.start && frame < nombre.start + nombre.dur) return null;
  let raised = 0;
  for (const item of ITEMS) {
    const t = sceneById(item.scene).start + UPGRADE_AT;
    raised += item.price * interpolate(frame, [t, t + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  }
  const appear = spring({ frame: frame - first.start - UPGRADE_AT, fps: 30, config: { damping: 14 } });
  const pct = raised / GOAL_TOTAL;
  return (
    <div
      style={{
        position: "absolute",
        top: 236,
        left: 90,
        right: 90,
        transform: `translateY(${(1 - appear) * -200}px)`,
        background: "rgba(10,15,26,0.82)",
        border: "5px solid #fff",
        borderRadius: 26,
        padding: "12px 24px 16px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: body, fontWeight: 900, fontSize: 34, color: "#fff", letterSpacing: 2 }}>META DEL CLUB</div>
        <div style={{ fontFamily: display, fontSize: 54, color: CLUB.gold }}>{money(raised)}</div>
      </div>
      <div style={{ height: 26, background: "#2A3346", borderRadius: 13, overflow: "hidden", marginTop: 6 }}>
        <div
          style={{
            width: `${pct * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${CLUB.red}, ${CLUB.gold})`,
            borderRadius: 13,
          }}
        />
      </div>
    </div>
  );
};

const NameReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const card = usePop(LEAD + 6);
  const revealAt = LEAD + Math.round(VOICE_FRAMES.s09 * 0.55);
  const ribbon = usePop(revealAt, 8);
  const likes = Math.floor(interpolate(frame, [LEAD + 6, revealAt + 20], [12, 9999], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) }));
  const cursor = Math.floor(frame / 8) % 2 === 0 ? "|" : " ";
  return (
    <div style={{ position: "absolute", top: 250, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          width: 860,
          background: "#fff",
          border: "8px solid #0A0F1A",
          borderRadius: 34,
          padding: "22px 30px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          transform: `scale(${card}) rotate(-2deg)`,
          boxShadow: "0 14px 0 #0A0F1A",
        }}
      >
        <div style={{ width: 96, height: 96, borderRadius: 48, background: CLUB.navy, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: display, fontSize: 56, color: "#fff" }}>
          TÚ
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: body, fontWeight: 800, fontSize: 32, color: "#667" }}>tu comentario</div>
          <div style={{ fontFamily: display, fontSize: 64, color: CLUB.ink }}>
            Club ??? {cursor}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Heart size={72} />
          <div style={{ fontFamily: display, fontSize: 40, color: CLUB.red }}>{money(likes).slice(1)}</div>
        </div>
      </div>
      <div
        style={{
          marginTop: 34,
          fontFamily: display,
          fontSize: 92,
          color: CLUB.gold,
          textAlign: "center",
          lineHeight: 1.05,
          transform: `scale(${ribbon}) rotate(${2 + Math.sin(frame * 0.3) * 2}deg)`,
          ...OUTLINE,
        }}
      >
        = NOMBRE
        <br />
        DEL EQUIPO
      </div>
    </div>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(2, 8);
  const beat = 1 + Math.abs(Math.sin(frame * 0.18)) * 0.06;
  const arrow = Math.sin(frame * 0.35) * 18;
  const pill = usePop(26);
  return (
    <>
      <div style={{ position: "absolute", top: 420, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, transform: `scale(${p * beat}) rotate(-3deg)` }}>
          <Bubble size={150} />
          <div style={{ fontFamily: display, fontSize: 132, color: "#fff", lineHeight: 1, ...OUTLINE }}>
            ¡COMENTA
            <br />
            <span style={{ color: CLUB.gold }}>YA!</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 34,
            background: "#fff",
            border: "7px solid #0A0F1A",
            borderRadius: 60,
            padding: "10px 36px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            transform: `scale(${pill})`,
            fontFamily: display,
            fontSize: 54,
            color: CLUB.ink,
          }}
        >
          <Heart size={60} /> $1 <span style={{ color: "#aab" }}>·</span> <Bubble size={60} /> $10
        </div>
      </div>
      {/* point at the like / comment buttons on the right edge */}
      <div style={{ position: "absolute", top: 1060, right: 150 + arrow, display: "flex", alignItems: "center", gap: 10, opacity: pill }}>
        <div style={{ fontFamily: display, fontSize: 58, color: "#fff", ...OUTLINE, WebkitTextStroke: "9px #0A0F1A" }}>AQUÍ</div>
        <svg width={110} height={80} viewBox="0 0 110 80">
          <path d="M5 30h65V8l35 32-35 32V50H5z" fill={CLUB.gold} stroke="#0A0F1A" strokeWidth={6} strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
};

const SCENE_GRAPHICS: Partial<Record<Scene["id"], React.FC>> = {
  hook: HookTitle,
  cancha: CanchaGraphics,
  reglas: Rules,
  nombre: NameReveal,
  cta: Cta,
};

export const Overlay: React.FC = () => (
  <AbsoluteFill>
    {/* soft vignette for legibility */}
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.45) 100%)",
      }}
    />
    {SCENES.map((s) => {
      const G = SCENE_GRAPHICS[s.id];
      const item = ITEMS.find((i) => i.scene === s.id);
      return (
        <Sequence key={s.id} name={`Gráficos ${s.index + 1} ${s.id}`} from={s.start} durationInFrames={s.dur}>
          {G && <G />}
          {item && <PriceTag label={item.label} price={item.price} />}
          <Caption scene={s} />
        </Sequence>
      );
    })}
    <GoalHud />
  </AbsoluteFill>
);
