import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Coach3DScene, FanRow3D } from "./Coach3D";
import { FC_STUART_FRAMES, SCENE_FRAMES, SCENE_START } from "./timeline";

const FONT = "'Arial Black', 'Arial', sans-serif";
const YELLOW = "#FFE65A";

const Stage: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse at 50% 20%, #2B6B3A 0%, #17402A 60%, #0B2016 100%)",
    }}
  >
    {/* Franjas de cesped */}
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1180 + i * 110,
          height: 55,
          background: i % 2 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)",
        }}
      />
    ))}
  </AbsoluteFill>
);

const Title: React.FC<{ text: string; color?: string; size?: number; top?: number }> = ({
  text,
  color = YELLOW,
  size = 110,
  top = 150,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 9 } });
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 40,
        right: 40,
        textAlign: "center",
        fontFamily: FONT,
        fontSize: size,
        lineHeight: 1.05,
        color,
        WebkitTextStroke: "10px #0B0B14",
        paintOrder: "stroke fill",
        transform: `scale(${interpolate(s, [0, 1], [0.4, 1])})`,
        opacity: interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
        textShadow: "0 12px 0 #0B0B14",
      }}
    >
      {text}
    </div>
  );
};

const Banner: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      bottom: 90,
      left: 60,
      right: 60,
      textAlign: "center",
      fontFamily: FONT,
      fontSize: 52,
      color: "#fff",
      background: "rgba(10,12,28,0.78)",
      borderRadius: 28,
      padding: "22px 30px",
    }}
  >
    {text}
  </div>
);

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const bob = Math.abs(Math.sin(frame / 6)) * 0.35;
  const mouth = (Math.sin(frame / 4) + 1) / 2;
  return (
    <AbsoluteFill>
      <Title text="¡NECESITAMOS AFICIÓN!" top={140} size={80} />
      <Title text="PARA SUBIR A SEGUNDA" color="#fff" top={300} size={62} />
      <div style={{ position: "absolute", left: 0, top: 480, width: 1080, height: 900 }}>
        <Coach3DScene width={1080} height={900} armsUp={1} mouthOpen={mouth} bob={bob} scale={1.3} />
      </div>
      <Banner text="FC Stuart · Tercera división" />
    </AbsoluteFill>
  );
};

const Comments: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const count = Math.round(interpolate(frame, [10, durationInFrames - 30], [0, 500], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }));
  const fans = Math.min(18, Math.floor(count / 28));
  return (
    <AbsoluteFill>
      <Title text="CADA COMENTARIO" top={160} size={96} />
      <Title text="= UN AFICIONADO" color="#fff" top={290} size={78} />
      <div style={{ position: "absolute", top: 470, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontSize: 130, color: "#fff", WebkitTextStroke: "8px #0B0B14", paintOrder: "stroke fill" }}>
        {count} <span style={{ fontSize: 60 }}>comentarios</span>
      </div>
      <div style={{ position: "absolute", top: 640, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontSize: 84, color: YELLOW, WebkitTextStroke: "8px #0B0B14", paintOrder: "stroke fill" }}>
        ${(count * 10).toLocaleString("en-US")}
      </div>
      <div style={{ position: "absolute", left: 0, top: 880, width: 1080, height: 700 }}>
        <FanRow3D width={1080} height={700} count={Math.max(1, fans)} />
      </div>
      <Banner text="Cada comentario = $10 dólares" />
    </AbsoluteFill>
  );
};

const Likes: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const likes = Math.round(interpolate(frame, [10, durationInFrames - 20], [0, 1500], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }));
  const pop = spring({ frame: frame % 15, fps: 30, config: { damping: 8 } });
  return (
    <AbsoluteFill>
      <Title text="CADA LIKE" top={170} size={110} />
      <Title text="= $1 DÓLAR" color="#fff" top={310} size={90} />
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontSize: 200, transform: `scale(${interpolate(pop, [0, 1], [1, 1.12])})`, color: "#FF5C7A", WebkitTextStroke: "10px #0B0B14", paintOrder: "stroke fill" }}>
        👍 {likes}
      </div>
      <div style={{ position: "absolute", top: 820, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontSize: 84, color: YELLOW, WebkitTextStroke: "8px #0B0B14", paintOrder: "stroke fill" }}>
        ${likes.toLocaleString("en-US")}
      </div>
      <div style={{ position: "absolute", left: 0, top: 980, width: 1080, height: 760 }}>
        <Coach3DScene width={1080} height={760} armsUp={0.6} mouthOpen={0.5} scale={1.15} />
      </div>
      <Banner text="Ya llevamos dinero para fichajes" />
    </AbsoluteFill>
  );
};

const Why: React.FC = () => (
  <AbsoluteFill>
    <Title text="¿Y PARA QUÉ" top={330} size={110} />
    <Title text="NECESITAMOS TANTO?" color="#fff" top={470} size={92} />
    <Title text="PARA FICHAJES" color={YELLOW} top={900} size={120} />
    <Banner text="Fichajes del FC Stuart" />
  </AbsoluteFill>
);

const PriceCard: React.FC<{ name: string; price: string; delay: number; color: string }> = ({ name, price, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 10 } });
  return (
    <div
      style={{
        transform: `translateX(${interpolate(s, [0, 1], [900, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
        opacity: s,
        background: "#fff",
        border: "10px solid #0B0B14",
        borderRadius: 40,
        padding: "34px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: 900,
        boxShadow: `0 16px 0 #0B0B14`,
        borderLeft: `40px solid ${color}`,
      }}
    >
      <div style={{ fontFamily: FONT, fontSize: 64, color: "#0B0B14" }}>{name}</div>
      <div style={{ fontFamily: FONT, fontSize: 80, color: "#0B0B14" }}>{price}</div>
    </div>
  );
};

const Piojo: React.FC = () => (
  <AbsoluteFill>
    <Title text="FICHAJES" top={150} size={120} />
    <div style={{ position: "absolute", top: 420, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <PriceCard name="Piojo Alvarado" price="$1,500" delay={5} color="#2E7BFF" />
    </div>
    <Banner text="Piojo Alvarado: 1,500 dólares" />
  </AbsoluteFill>
);

const Neymar: React.FC = () => (
  <AbsoluteFill>
    <Title text="FICHAJES" top={150} size={120} />
    <div style={{ position: "absolute", top: 420, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 50 }}>
      <PriceCard name="Piojo Alvarado" price="$1,500" delay={0} color="#2E7BFF" />
      <PriceCard name="Neymar" price="$2,000" delay={8} color="#FFD84A" />
    </div>
    <Banner text="Neymar: 2,000 dólares" />
  </AbsoluteFill>
);

const Yamal: React.FC = () => (
  <AbsoluteFill>
    <Title text="FICHAJES" top={150} size={120} />
    <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
      <PriceCard name="Piojo Alvarado" price="$1,500" delay={0} color="#2E7BFF" />
      <PriceCard name="Neymar" price="$2,000" delay={6} color="#FFD84A" />
      <PriceCard name="Lamine Yamal" price="$3,000" delay={12} color="#FF5C7A" />
    </div>
    <Title text="TOTAL: $6,500" color={YELLOW} top={1250} size={110} />
    <Banner text="¡Comenta, dale like y hacemos historia!" />
  </AbsoluteFill>
);

export const FCStuart: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0B0F24" }}>
    <Stage />
    <Sequence name="1 Gancho" from={SCENE_START.hook} durationInFrames={SCENE_FRAMES.hook}><Hook /></Sequence>
    <Sequence name="2 Comentarios" from={SCENE_START.comments} durationInFrames={SCENE_FRAMES.comments}><Comments /></Sequence>
    <Sequence name="3 Likes" from={SCENE_START.likes} durationInFrames={SCENE_FRAMES.likes}><Likes /></Sequence>
    <Sequence name="4 Para qué" from={SCENE_START.why} durationInFrames={SCENE_FRAMES.why}><Why /></Sequence>
    <Sequence name="5 Piojo" from={SCENE_START.piojo} durationInFrames={SCENE_FRAMES.piojo}><Piojo /></Sequence>
    <Sequence name="6 Neymar" from={SCENE_START.neymar} durationInFrames={SCENE_FRAMES.neymar}><Neymar /></Sequence>
    <Sequence name="7 Yamal" from={SCENE_START.yamal} durationInFrames={SCENE_FRAMES.yamal}><Yamal /></Sequence>
  </AbsoluteFill>
);

export const FC_STUART_TOTAL_FRAMES = FC_STUART_FRAMES;
