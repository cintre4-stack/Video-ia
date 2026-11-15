import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from "remotion";
import {
  SceneContext,
  SceneHook,
  SceneQpr,
  SceneRooney,
  SceneZabaleta,
} from "./ScenesA";
import {
  SceneAguero,
  SceneCta,
  SceneDzeko,
  SceneFinalTable,
  SceneStoppage,
  SceneSunderland,
} from "./ScenesB";
import { AGUERO_GOAL, SCENE_FRAMES, T, VOICE_LEAD } from "./timeline";
import { Voice } from "./Voice";


/**
 * Reel: última jornada Premier League 2011-12 (13 mayo 2012).
 * 11 escenas narradas, 1080x1920. La duración se ajusta a la locución.
 */
export const Reel9320: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1A2E" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="1 Gancho 93:20" durationInFrames={SCENE_FRAMES.hook}>
          <SceneHook />
          <Voice id="s01" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="2 Contexto" durationInFrames={SCENE_FRAMES.context}>
          <SceneContext />
          <Voice id="s02" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="3 Rooney 20'" durationInFrames={SCENE_FRAMES.rooney}>
          <SceneRooney />
          <Voice id="s03" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="4 Zabaleta 39'" durationInFrames={SCENE_FRAMES.zabaleta}>
          <SceneZabaleta />
          <Voice id="s04" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="5 Remontada QPR" durationInFrames={SCENE_FRAMES.qpr}>
          <SceneQpr />
          <Voice id="s05" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="6 Descuento" durationInFrames={SCENE_FRAMES.stoppage}>
          <SceneStoppage />
          <Voice id="s06" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="7 Dzeko 90+2" durationInFrames={SCENE_FRAMES.dzeko}>
          <SceneDzeko />
          <Voice id="s07" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="8 Final en Sunderland" durationInFrames={SCENE_FRAMES.sunderland}>
          <SceneSunderland />
          <Voice id="s08" from={VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="9 Agüero 93:20" durationInFrames={SCENE_FRAMES.aguero}>
          <SceneAguero />
          <Voice id="s09a" from={4} />
          <Voice id="s09b" from={AGUERO_GOAL + VOICE_LEAD} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="10 Clasificación final" durationInFrames={SCENE_FRAMES.table}>
          <SceneFinalTable />
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
          interpolate(f, [0, 20, durationInFrames - 30, durationInFrames], [0, 0.18, 0.18, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
};
