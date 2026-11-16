import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import {
  SceneCollapse,
  SceneCta,
  SceneDays,
  SceneDoctors,
  SceneHook,
  SceneRave,
  SceneShrine,
  SceneSpread,
  SceneTheories,
  SceneTroffea,
} from "./Scenes";
import { REEL_BAILE_FRAMES, SCENE_FRAMES, SCENE_START, T, VOICE_LEAD } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Voice: React.FC<{ id: string }> = ({ id }) => (
  <Sequence name={`Voz ${id}`} from={VOICE_LEAD} layout="none">
    <Audio src={staticFile(`voiceover/baile/${id}.mp3`)} volume={0.9} />
  </Sequence>
);

const S = SCENE_START;

/**
 * Reel: la plaga del baile de Estrasburgo (1518).
 * 10 escenas narradas, 1080x1920. La duración se ajusta a la locución.
 * Música: jiga medieval sintetizada (scripts/synth-medieval-jig.py).
 */
export const ReelBaile: React.FC = () => {
  const jigEnd = S.s07 + 2;
  return (
    <AbsoluteFill style={{ backgroundColor: "#120A24" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="1 Gancho challenge" durationInFrames={SCENE_FRAMES.s01}>
          <SceneHook />
          <Voice id="s01" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="2 Frau Troffea" durationInFrames={SCENE_FRAMES.s02}>
          <SceneTroffea />
          <Voice id="s02" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="3 Durante días" durationInFrames={SCENE_FRAMES.s03}>
          <SceneDays />
          <Voice id="s03" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="4 Contagio" durationInFrames={SCENE_FRAMES.s04}>
          <SceneSpread />
          <Voice id="s04" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="5 Médicos" durationInFrames={SCENE_FRAMES.s05}>
          <SceneDoctors />
          <Voice id="s05" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="6 Rave medieval" durationInFrames={SCENE_FRAMES.s06}>
          <SceneRave />
          <Voice id="s06" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 2 })} />
        <TransitionSeries.Sequence name="7 Mala idea" durationInFrames={SCENE_FRAMES.s07}>
          <SceneCollapse />
          <Voice id="s07" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="8 San Vito" durationInFrames={SCENE_FRAMES.s08}>
          <SceneShrine />
          <Voice id="s08" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="9 Teorías" durationInFrames={SCENE_FRAMES.s09}>
          <SceneTheories />
          <Voice id="s09" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="10 CTA" durationInFrames={SCENE_FRAMES.s10}>
          <SceneCta />
          <Voice id="s10" />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Music: jig up to the rave, cut by a record scratch, drone, jig again for the CTA joke. */}
      <Sequence name="Jiga" durationInFrames={jigEnd} layout="none">
        <Audio
          src={staticFile("music/jig.wav")}
          loop
          volume={(f) =>
            f < S.s02
              ? 0.3
              : f < S.s06
                ? 0.09
                : interpolate(f, [S.s06, S.s06 + 15], [0.09, 0.4], clamp)
          }
        />
      </Sequence>
      <Sequence name="Dron" from={S.s07} durationInFrames={S.s10 - S.s07 + T} layout="none">
        <Audio
          src={staticFile("music/drone.wav")}
          loop
          volume={(f) => interpolate(f, [0, 20, S.s10 - S.s07 - 10, S.s10 - S.s07 + T], [0, 0.22, 0.22, 0], clamp)}
        />
      </Sequence>
      <Sequence name="Jiga final" from={S.s10} durationInFrames={REEL_BAILE_FRAMES - S.s10} layout="none">
        <Audio
          src={staticFile("music/jig.wav")}
          volume={(f) => interpolate(f, [0, 15, REEL_BAILE_FRAMES - S.s10 - 20, REEL_BAILE_FRAMES - S.s10], [0, 0.22, 0.22, 0], clamp)}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
