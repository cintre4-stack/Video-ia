import { Audio } from "@remotion/media";
import {
  linearTiming,
  TransitionPresentation,
  TransitionSeries,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import {
  SceneBrewery,
  SceneBurst,
  SceneCta,
  SceneHook,
  SceneHoop,
  SceneMyth,
  SceneStGiles,
  SceneTragedy,
  SceneTrial,
  SceneWave,
} from "./Scenes";
import {
  REEL_CERVEZA_FRAMES,
  SCENE_FRAMES,
  SCENE_START,
  T,
  VOICE_LEAD,
} from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const S = SCENE_START;

const Voice: React.FC<{ id: string }> = ({ id }) => (
  <Sequence name={`Voz ${id}`} from={VOICE_LEAD} layout="none">
    <Audio src={staticFile(`voiceover/cerveza/${id}.mp3`)} volume={0.9} />
  </Sequence>
);

const SCENES = [
  { id: "s01", name: "1 Gancho ola de cerveza", C: SceneHook },
  { id: "s02", name: "2 Fábrica Meux", C: SceneBrewery },
  { id: "s03", name: "3 Aro suelto", C: SceneHoop },
  { id: "s04", name: "4 BUM dominó", C: SceneBurst },
  { id: "s05", name: "5 La ola", C: SceneWave },
  { id: "s06", name: "6 St Giles", C: SceneStGiles },
  { id: "s07", name: "7 Tragedia", C: SceneTragedy },
  { id: "s08", name: "8 El mito", C: SceneMyth },
  { id: "s09", name: "9 Juicio", C: SceneTrial },
  { id: "s10", name: "10 CTA barril", C: SceneCta },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TRANSITIONS: TransitionPresentation<any>[] = [
  slide({ direction: "from-bottom" }),
  fade(),
  fade(),
  wipe({ direction: "from-left" }),
  fade(),
  fade(),
  fade(),
  slide({ direction: "from-right" }),
  wipe({ direction: "from-right" }),
];

/**
 * Reel: la inundación de cerveza de Londres (17 octubre 1814).
 * 10 escenas narradas, 1080x1920. La duración se ajusta a la locución.
 * Música: canción de taberna sintetizada (scripts/synth-pub-music.py).
 */
export const ReelCerveza: React.FC = () => {
  const total = REEL_CERVEZA_FRAMES;
  return (
    <AbsoluteFill style={{ backgroundColor: "#141A30" }}>
      <TransitionSeries>
        {SCENES.map(({ id, name, C }, i) => (
          <React.Fragment key={id}>
            {i > 0 && (
              <TransitionSeries.Transition
                presentation={TRANSITIONS[i - 1]}
                timing={linearTiming({ durationInFrames: T })}
              />
            )}
            <TransitionSeries.Sequence
              name={name}
              durationInFrames={SCENE_FRAMES[id]}
            >
              <C />
              <Voice id={id} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>

      {/* Music: tavern song for the comedy, drone for the tragedy, tavern song again after. */}
      <Sequence name="Taberna" durationInFrames={S.s06 + T} layout="none">
        <Audio
          src={staticFile("music/pub.wav")}
          loop
          volume={(f) =>
            interpolate(
              f,
              [0, S.s02, S.s02 + 10, S.s06 - 10, S.s06 + T],
              [0.3, 0.3, 0.1, 0.1, 0],
              clamp,
            )
          }
        />
      </Sequence>
      <Sequence
        name="Dron"
        from={S.s06}
        durationInFrames={S.s08 - S.s06 + T}
        layout="none"
      >
        <Audio
          src={staticFile("music/drone.wav")}
          loop
          volume={(f) =>
            interpolate(
              f,
              [0, 20, S.s08 - S.s06 - 10, S.s08 - S.s06 + T],
              [0, 0.22, 0.22, 0],
              clamp,
            )
          }
        />
      </Sequence>
      <Sequence
        name="Taberna final"
        from={S.s08}
        durationInFrames={total - S.s08}
        layout="none"
      >
        <Audio
          src={staticFile("music/pub.wav")}
          loop
          volume={(f) =>
            interpolate(
              f,
              [0, 20, total - S.s08 - 25, total - S.s08],
              [0, 0.12, 0.12, 0],
              clamp,
            )
          }
        />
      </Sequence>
    </AbsoluteFill>
  );
};
