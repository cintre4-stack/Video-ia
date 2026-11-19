import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Sfx } from "../Reel9320/Sfx";
import {
  SceneBanquet,
  SceneCta,
  SceneFinal,
  SceneHero,
  SceneHook,
  SceneRansom,
  SceneReveal,
  SceneSniff,
  SceneTheft,
  SceneWalk,
} from "./Scenes";
import { REVEAL_AT, SCENE_FRAMES, T, VOICE_LEAD } from "./timeline";

const Voice: React.FC<{ id: string; from: number }> = ({ id, from }) => (
  <Sequence name={`Voz ${id}`} from={from} layout="none">
    <Audio src={staticFile(`voiceover/pickles/${id}.mp3`)} volume={0.85} />
  </Sequence>
);

const Whoosh: React.FC = () => <Sfx name="Corte" file="whoosh.wav" from={0} volume={0.5} durationInFrames={20} />;

/**
 * Reel: Pickles, el perro que encontró la Copa del Mundo robada (Londres, 1966).
 * 10 escenas narradas, 1080x1920. La duración se ajusta a la locución.
 */
export const ReelPickles: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0B0F24" }}>
    <TransitionSeries>
      <TransitionSeries.Sequence name="1 Gancho" durationInFrames={SCENE_FRAMES.hook}>
        <SceneHook />
        <Voice id="s01" from={VOICE_LEAD} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="2 El robo" durationInFrames={SCENE_FRAMES.theft}>
        <SceneTheft />
        <Voice id="s02" from={VOICE_LEAD} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="3 Rescate" durationInFrames={SCENE_FRAMES.ransom}>
        <SceneRansom />
        <Voice id="s03" from={VOICE_LEAD} />
        <Whoosh />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="4 El paseo" durationInFrames={SCENE_FRAMES.walk}>
        <SceneWalk />
        <Voice id="s04" from={VOICE_LEAD} />
        <Whoosh />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="5 Olfato" durationInFrames={SCENE_FRAMES.sniff}>
        <SceneSniff />
        <Voice id="s05" from={VOICE_LEAD} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="6 ¡La copa!" durationInFrames={SCENE_FRAMES.reveal}>
        <SceneReveal />
        <Voice id="s06a" from={VOICE_LEAD} />
        <Voice id="s06b" from={REVEAL_AT} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="7 Héroe" durationInFrames={SCENE_FRAMES.hero}>
        <SceneHero />
        <Voice id="s07" from={VOICE_LEAD} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="8 Campeones" durationInFrames={SCENE_FRAMES.final}>
        <SceneFinal />
        <Voice id="s08" from={VOICE_LEAD} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="9 La cena" durationInFrames={SCENE_FRAMES.banquet}>
        <SceneBanquet />
        <Voice id="s09" from={VOICE_LEAD} />
        <Whoosh />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="10 CTA" durationInFrames={SCENE_FRAMES.cta}>
        <SceneCta />
        <Voice id="s10" from={VOICE_LEAD} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
