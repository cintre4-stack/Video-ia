import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { Captions, Chips, Cta, Flash, IntroTitle, LayerLabel, OvenTimer, StepHeader, Vignette } from "./Hud";
import {
  HORNO_CUT,
  Lights,
  SceneBechamel,
  SceneCarne,
  SceneFinal,
  SceneHorno,
  SceneIntro,
  SceneMontaje,
  SceneSofrito,
  SceneTomate,
} from "./Scenes3D";
import { C, clamp } from "./theme";
import { REEL_LASAGNA_FRAMES, STEP_FRAMES as D, STEP_FROM as F, VOICE_LEAD } from "./timeline";
import { VOICE_FRAMES as V } from "./voiceover.generated";
import guion from "../../guiones/reel-lasana-chef-bolo.json";

const TEXT = Object.fromEntries(guion.lines) as Record<string, string>;

const Voice: React.FC<{ id: keyof typeof V; from: number }> = ({ id, from }) => (
  <Sequence name={`Voz ${id}`} from={from + VOICE_LEAD} durationInFrames={V[id] + 4} layout="none">
    <Audio src={staticFile(`voiceover/lasana/${id}.mp3`)} volume={1} />
  </Sequence>
);

const Sfx: React.FC<{ file: string; from: number; volume?: number; dur?: number }> = ({ file, from, volume = 0.5, dur = 60 }) => (
  <Sequence name={`Sfx ${file}`} from={from} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);

/**
 * Reel vertical: Chef Bolo cocina una lasaña boloñesa en 6 pasos.
 * Una única escena 3D (Three.js) con los pasos en secuencia + rótulos 2D encima.
 * La duración de cada paso se ajusta a la locución (timeline.ts).
 */
export const ReelLasagna: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: C.wall }}>
      {/* ---------- 3D ---------- */}
      <ThreeCanvas width={width} height={height} camera={{ fov: 46, position: [0, 2.5, 5], near: 0.1, far: 60 }}>
        <color attach="background" args={[C.wall]} />
        <Lights />
        <Sequence name="3D · Gancho" from={F.intro} durationInFrames={D.intro} layout="none">
          <SceneIntro dur={D.intro} />
        </Sequence>
        <Sequence name="3D · Sofrito" from={F.sofrito} durationInFrames={D.sofrito} layout="none">
          <SceneSofrito dur={D.sofrito} />
        </Sequence>
        <Sequence name="3D · Carne" from={F.carne} durationInFrames={D.carne} layout="none">
          <SceneCarne dur={D.carne} />
        </Sequence>
        <Sequence name="3D · Tomate" from={F.tomate} durationInFrames={D.tomate} layout="none">
          <SceneTomate dur={D.tomate} />
        </Sequence>
        <Sequence name="3D · Bechamel" from={F.bechamel} durationInFrames={D.bechamel} layout="none">
          <SceneBechamel dur={D.bechamel} />
        </Sequence>
        <Sequence name="3D · Montaje" from={F.montaje} durationInFrames={D.montaje} layout="none">
          <SceneMontaje dur={D.montaje} />
        </Sequence>
        <Sequence name="3D · Horno" from={F.horno} durationInFrames={D.horno} layout="none">
          <SceneHorno dur={D.horno} />
        </Sequence>
        <Sequence name="3D · Final" from={F.final} durationInFrames={D.final} layout="none">
          <SceneFinal dur={D.final} />
        </Sequence>
      </ThreeCanvas>
      <Vignette />

      {/* ---------- Rótulos ---------- */}
      <Sequence name="Gancho" from={F.intro} durationInFrames={D.intro}>
        <IntroTitle />
        <Captions text={TEXT.s01} voiceFrames={V.s01} />
      </Sequence>
      <Sequence name="Paso 1 · Sofrito" from={F.sofrito} durationInFrames={D.sofrito}>
        <StepHeader step={1} title="SOFRITO" color={C.basil} />
        <Chips
          items={[
            { text: "1 cebolla", color: "#D9B3E0", at: 18 },
            { text: "1 zanahoria", color: C.carrot, at: 34 },
            { text: "2 ajos", color: C.garlic, at: 52 },
            { text: "10 min", color: C.tomato, at: 120 },
          ]}
        />
        <Captions text={TEXT.s02} voiceFrames={V.s02} />
      </Sequence>
      <Sequence name="Paso 2 · Carne" from={F.carne} durationInFrames={D.carne}>
        <StepHeader step={2} title="CARNE" color={C.meat} />
        <Chips
          items={[
            { text: "500 g carne picada", color: C.meatRaw, at: 22 },
            { text: "sal y pimienta", color: "#FFFFFF", at: 112 },
          ]}
        />
        <Captions text={TEXT.s03} voiceFrames={V.s03} />
      </Sequence>
      <Sequence name="Paso 3 · Tomate" from={F.tomate} durationInFrames={D.tomate}>
        <StepHeader step={3} title="TOMATE" color={C.tomato} />
        <Chips
          items={[
            { text: "400 g tomate triturado", color: C.sauce, at: 22 },
            { text: "orégano", color: C.oregano, at: 100 },
            { text: "20 min", color: C.cheese, at: 150 },
          ]}
        />
        <Captions text={TEXT.s04} voiceFrames={V.s04} />
      </Sequence>
      <Sequence name="Paso 4 · Bechamel" from={F.bechamel} durationInFrames={D.bechamel}>
        <StepHeader step={4} title="BECHAMEL" color="#C9A15A" />
        <Chips
          items={[
            { text: "50 g mantequilla", color: C.butter, at: 30 },
            { text: "50 g harina", color: "#FFFFFF", at: 70 },
            { text: "500 ml leche", color: "#9CC3F5", at: 100 },
          ]}
        />
        <Captions text={TEXT.s05} voiceFrames={V.s05} />
      </Sequence>
      <Sequence name="Paso 5 · Montaje" from={F.montaje} durationInFrames={D.montaje}>
        <StepHeader step={5} title="MONTA CAPAS" color={C.carrot} />
        <LayerLabel />
        <Captions text={TEXT.s06} voiceFrames={V.s06} />
      </Sequence>
      <Sequence name="Paso 6 · Horno" from={F.horno} durationInFrames={D.horno}>
        <StepHeader step={6} title="AL HORNO" color={C.tomatoDark} />
        <Sequence name="Queso" durationInFrames={HORNO_CUT} layout="none">
          <Chips items={[{ text: "queso rallado", color: C.cheese, at: 20 }]} />
        </Sequence>
        <Sequence name="Temporizador" layout="none">
          <OvenTimer dur={D.horno} />
        </Sequence>
        <Captions text={TEXT.s07} voiceFrames={V.s07} />
      </Sequence>
      <Sequence name="Final · ¡Lista!" from={F.final} durationInFrames={D.final}>
        <Cta at={110} />
        <Captions text={TEXT.s08} voiceFrames={V.s08} />
      </Sequence>

      {/* Destello en cada corte */}
      {(["sofrito", "carne", "tomate", "bechamel", "montaje", "horno", "final"] as const).map((id) => (
        <Sequence key={id} name={`Corte ${id}`} from={F[id]} durationInFrames={8}>
          <Flash />
        </Sequence>
      ))}
      <Sequence name="Corte horno (plano 2)" from={F.horno + HORNO_CUT} durationInFrames={8}>
        <Flash />
      </Sequence>

      {/* ---------- Audio ---------- */}
      <Voice id="s01" from={F.intro} />
      <Voice id="s02" from={F.sofrito} />
      <Voice id="s03" from={F.carne} />
      <Voice id="s04" from={F.tomate} />
      <Voice id="s05" from={F.bechamel} />
      <Voice id="s06" from={F.montaje} />
      <Voice id="s07" from={F.horno} />
      <Voice id="s08" from={F.final} />

      {(["sofrito", "carne", "tomate", "bechamel", "montaje", "horno", "final"] as const).map((id) => (
        <Sfx key={id} file="whoosh.wav" from={F[id] - 4} volume={0.25} dur={30} />
      ))}
      <Sequence name="Chisporroteo" from={F.sofrito + 20} durationInFrames={F.bechamel - F.sofrito - 20}>
        <Audio
          src={staticFile("sfx/sizzle.wav")}
          loop
          volume={(f) => interpolate(f, [0, 20, F.bechamel - F.sofrito - 50, F.bechamel - F.sofrito - 20], [0, 0.18, 0.18, 0], clamp)}
        />
      </Sequence>
      <Sfx file="bubble.wav" from={F.tomate + 75} volume={0.35} />
      <Sfx file="bubble.wav" from={F.tomate + 120} volume={0.3} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Sfx key={i} file="pop.wav" from={F.montaje + 22 + i * 15 + 10} volume={0.35} dur={10} />
      ))}
      <Sfx file="ding.wav" from={F.horno + HORNO_CUT + 30} volume={0.35} />
      <Sfx file="ding.wav" from={F.final + 110} volume={0.45} />
      <Audio
        name="Música"
        src={staticFile("music/cocina-loop.wav")}
        loop
        volume={(f) => interpolate(f, [0, 15, REEL_LASAGNA_FRAMES - 40, REEL_LASAGNA_FRAMES], [0, 0.13, 0.13, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
