import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import {
  SceneCorner,
  SceneCta,
  SceneGlobal,
  SceneHalftime,
  SceneHook,
  SceneMessi,
  SceneOrigi,
  SceneSalah,
  SceneSuarez,
  SceneWijnaldum,
  SceneYnwa,
} from "./Scenes";
import { CORNER_VOICE_B, SCENE_FRAMES, T, VOICE_LEAD } from "./timeline";

const Voice: React.FC<{ id: string; from: number }> = ({ id, from }) => (
  <Sequence name={`Voz ${id}`} from={from} layout="none">
    <Audio src={staticFile(`voiceover/anfield/${id}.mp3`)} volume={0.8} />
  </Sequence>
);

/**
 * Reel: semifinal Champions 2019, Liverpool 4-0 Barcelona (global 4-3).
 * 11 escenas narradas, 1080x1920. La duración se ajusta a la locución.
 */
export const ReelAnfield: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0F24" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="1 Gancho 3-0 / 4-0" durationInFrames={SCENE_FRAMES.hook}>
          <SceneHook />
          <Voice id="s01" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="2 Ida Suárez" durationInFrames={SCENE_FRAMES.suarez}>
          <SceneSuarez />
          <Voice id="s02" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="3 Falta de Messi" durationInFrames={SCENE_FRAMES.messi}>
          <SceneMessi />
          <Voice id="s03" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="4 Never Give Up" durationInFrames={SCENE_FRAMES.salah}>
          <SceneSalah />
          <Voice id="s04" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="5 Origi 7'" durationInFrames={SCENE_FRAMES.origi}>
          <SceneOrigi />
          <Voice id="s05" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="6 Descanso" durationInFrames={SCENE_FRAMES.halftime}>
          <SceneHalftime />
          <Voice id="s06" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="7 Wijnaldum x2" durationInFrames={SCENE_FRAMES.wijnaldum}>
          <SceneWijnaldum />
          <Voice id="s07" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="8 Córner rápido" durationInFrames={SCENE_FRAMES.corner}>
          <SceneCorner />
          <Voice id="s08a" from={2} />
          <Voice id="s08b" from={CORNER_VOICE_B} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="9 You'll Never Walk Alone" durationInFrames={SCENE_FRAMES.ynwa}>
          <SceneYnwa />
          <Voice id="s09" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="10 Global y final" durationInFrames={SCENE_FRAMES.global}>
          <SceneGlobal />
          <Voice id="s10" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="11 CTA" durationInFrames={SCENE_FRAMES.cta}>
          <SceneCta />
          <Voice id="s11" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio
        name="Ambiente estadio"
        src={staticFile("sfx/crowd.wav")}
        volume={(f) =>
          interpolate(f, [0, 20, durationInFrames - 30, durationInFrames], [0, 0.12, 0.12, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
};
