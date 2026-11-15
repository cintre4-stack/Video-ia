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

const T = 8; // transition length in frames

/**
 * Reel: última jornada Premier League 2011-12 (13 mayo 2012).
 * 11 escenas, ~48 s, 1080x1920.
 */
export const Reel9320: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1A2E" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="1 Gancho 93:20" durationInFrames={100}>
          <SceneHook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="2 Contexto" durationInFrames={150}>
          <SceneContext />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="3 Rooney 20'" durationInFrames={120}>
          <SceneRooney />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="4 Zabaleta 39'" durationInFrames={120}>
          <SceneZabaleta />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="5 Remontada QPR" durationInFrames={210}>
          <SceneQpr />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="6 Descuento" durationInFrames={100}>
          <SceneStoppage />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="7 Dzeko 90+2" durationInFrames={120}>
          <SceneDzeko />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="8 Final en Sunderland" durationInFrames={120}>
          <SceneSunderland />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="9 Agüero 93:20" durationInFrames={240}>
          <SceneAguero />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="10 Clasificación final" durationInFrames={150}>
          <SceneFinalTable />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="11 CTA" durationInFrames={90}>
          <SceneCta />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio
        name="Ambiente estadio"
        src={staticFile("sfx/crowd.wav")}
        volume={(f) =>
          interpolate(f, [0, 20, durationInFrames - 30, durationInFrames], [0, 0.35, 0.35, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
};
