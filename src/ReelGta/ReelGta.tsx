import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { Sfx } from "../Reel9320/Sfx";
import {
  SceneCall,
  SceneCta,
  SceneDiagnosis,
  SceneHook,
  SceneLater,
  SceneMoney,
  SceneNumbers,
  SceneOffice,
  SceneOneInFive,
  ScenePoll,
  SceneQueue,
  SceneRewind,
} from "./Scenes";
import { CALL_VOICE_FROM, SCENE_FRAMES, T, VOICE_LEAD } from "./timeline";

const Voice: React.FC<{ id: string; from?: number }> = ({ id, from = VOICE_LEAD }) => (
  <Sequence name={`Voz ${id}`} from={from} layout="none">
    <Audio src={staticFile(`voiceover/gta/${id}.mp3`)} volume={0.85} />
  </Sequence>
);

const Whoosh: React.FC = () => <Sfx name="Whoosh" file="whoosh.wav" from={0} volume={0.35} durationInFrames={20} />;

const t = linearTiming({ durationInFrames: T });

/**
 * Reel: "La fiebre GTA". GTA V (17 sep 2013) dejó oficinas vacías; GTA 6 sale el 19 nov 2026.
 * 12 escenas narradas, 1080x1920. La duración se ajusta a la locución.
 */
export const ReelGta: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#14062E" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="1 Gancho: la fiebre" durationInFrames={SCENE_FRAMES.hook}>
          <SceneHook />
          <Voice id="s01" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t} />
        <TransitionSeries.Sequence name="2 Rebobinar a 2013" durationInFrames={SCENE_FRAMES.rewind}>
          <SceneRewind />
          <Voice id="s02" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={t} />
        <TransitionSeries.Sequence name="3 Encuesta 46%" durationInFrames={SCENE_FRAMES.poll}>
          <ScenePoll />
          <Voice id="s03" />
          <Whoosh />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={t} />
        <TransitionSeries.Sequence name="4 Uno de cada cinco" durationInFrames={SCENE_FRAMES.oneInFive}>
          <SceneOneInFive />
          <Voice id="s04" />
          <Whoosh />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={t} />
        <TransitionSeries.Sequence name="5 Llamada al jefe" durationInFrames={SCENE_FRAMES.call}>
          <SceneCall />
          <Voice id="s05" from={CALL_VOICE_FROM} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t} />
        <TransitionSeries.Sequence name="6 Colas a medianoche" durationInFrames={SCENE_FRAMES.queue}>
          <SceneQueue />
          <Voice id="s06" />
          <Whoosh />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={t} />
        <TransitionSeries.Sequence name="7 800M en un día" durationInFrames={SCENE_FRAMES.money}>
          <SceneMoney />
          <Voice id="s07" />
          <Whoosh />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={t} />
        <TransitionSeries.Sequence name="8 Oficinas vacías" durationInFrames={SCENE_FRAMES.office}>
          <SceneOffice />
          <Voice id="s08" />
          <Whoosh />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t} />
        <TransitionSeries.Sequence name="9 Trece años después" durationInFrames={SCENE_FRAMES.later}>
          <SceneLater />
          <Voice id="s09" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={t} />
        <TransitionSeries.Sequence name="10 1,5 millones" durationInFrames={SCENE_FRAMES.numbers}>
          <SceneNumbers />
          <Voice id="s10" />
          <Whoosh />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={t} />
        <TransitionSeries.Sequence name="11 Diagnóstico" durationInFrames={SCENE_FRAMES.diagnosis}>
          <SceneDiagnosis />
          <Voice id="s11" />
          <Whoosh />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t} />
        <TransitionSeries.Sequence name="12 CTA" durationInFrames={SCENE_FRAMES.cta}>
          <SceneCta />
          <Voice id="s12" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio
        name="Música"
        src={staticFile("sfx/bed-gta.wav")}
        loop
        volume={(f) =>
          interpolate(f, [0, 15, durationInFrames - 30, durationInFrames], [0, 0.09, 0.09, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
};
