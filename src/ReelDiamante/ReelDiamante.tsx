import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { SceneCarbon, SceneCrash, SceneCta, SceneDeep, SceneHeirloom, SceneHook, SceneLab } from "./Scenes";
import { SCENE_FRAMES, T, VOICE_LEAD, wordAt } from "./timeline";
import { VOICE_FRAMES } from "./voiceover.generated";

const Voice: React.FC<{ id: keyof typeof VOICE_FRAMES }> = ({ id }) => (
  <Sequence name={`Voz ${id}`} from={VOICE_LEAD} layout="none">
    <Audio src={staticFile(`voiceover/diamante/${id}.mp3`)} volume={1} />
  </Sequence>
);

const Sfx: React.FC<{ name: string; at: number; volume?: number }> = ({ name, at, volume = 0.35 }) => (
  <Sequence name={`SFX ${name}`} from={at} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/**
 * Reel 3D: por qué un diamante natural y no uno de laboratorio.
 * 7 escenas narradas, 1080x1920. La duración se ajusta a la locución.
 */
export const ReelDiamante: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const v = VOICE_FRAMES;
  return (
    <AbsoluteFill style={{ backgroundColor: "#120A24" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="1 Gancho ¿idénticos?" durationInFrames={SCENE_FRAMES.hook}>
          <SceneHook voice={v.s01} />
          <Voice id="s01" />
          <Sfx name="ding" at={wordAt("s01", v.s01, "uno")} />
          <Sfx name="ding" at={wordAt("s01", v.s01, "uno") + 6} />
          <Sfx name="boom" at={wordAt("s01", v.s01, "¿Por")} volume={0.25} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="2 Carbono puro" durationInFrames={SCENE_FRAMES.carbon}>
          <SceneCarbon voice={v.s02} />
          <Voice id="s02" />
          <Sfx name="whoosh" at={0} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-top" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="3 150 km bajo tierra" durationInFrames={SCENE_FRAMES.deep}>
          <SceneDeep voice={v.s03} />
          <Voice id="s03" />
          <Sfx name="whoosh" at={4} />
          <Sfx name="boom" at={wordAt("s03", v.s03, "Este")} volume={0.2} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="4 Laboratorio" durationInFrames={SCENE_FRAMES.lab}>
          <SceneLab voice={v.s04} />
          <Voice id="s04" />
          {Array.from({ length: 9 }).map((_, i) => (
            <Sfx key={i} name="kick" at={i * 12} volume={0.12} />
          ))}
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="5 Precio y reventa" durationInFrames={SCENE_FRAMES.crash}>
          <SceneCrash voice={v.s05} />
          <Voice id="s05" />
          <Sfx name="groan" at={wordAt("s05", v.s05, "Intenta") + 24} volume={0.15} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="6 Se hereda" durationInFrames={SCENE_FRAMES.heirloom}>
          <SceneHeirloom voice={v.s06} />
          <Voice id="s06" />
          <Sfx name="ding" at={wordAt("s06", v.s06, "escaso,")} />
          <Sfx name="ding" at={wordAt("s06", v.s06, "guarda")} />
          <Sfx name="ding" at={wordAt("s06", v.s06, "hereda.")} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-left" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="7 CTA" durationInFrames={SCENE_FRAMES.cta}>
          <SceneCta voice={v.s07} />
          <Voice id="s07" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio
        name="Música"
        src={staticFile("music/diamante-pad.mp3")}
        volume={(f) =>
          interpolate(f, [0, 15, durationInFrames - 40, durationInFrames], [0, 0.22, 0.22, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
};
