import { Audio } from "@remotion/media";
import { linearTiming, type TransitionPresentation, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { Sfx } from "../Reel9320/Sfx";
import { Scene2002, SceneBayern11, SceneHook, SceneLate, SceneUnbeaten, SceneXabi } from "./ScenesA";
import { SceneBayern30, SceneBremen, SceneChampions, SceneCta, SceneStats, SceneWirtz } from "./ScenesB";
import { SCENE_FRAMES, T, VOICE_LEAD } from "./timeline";

const Voice: React.FC<{ id: string }> = ({ id }) => (
  <Sequence name={`Voz ${id}`} from={VOICE_LEAD} layout="none">
    <Audio src={staticFile(`voiceover/leverkusen/${id}.mp3`)} volume={0.85} />
  </Sequence>
);

const SCENES: {
  name: string;
  key: keyof typeof SCENE_FRAMES;
  voice: string;
  Comp: React.FC;
  enter: "fade" | "right" | "left" | "bottom" | "wipe";
}[] = [
  { name: "1 Gancho Neverkusen", key: "hook", voice: "s01", Comp: SceneHook, enter: "fade" },
  { name: "2 Rebobinado 2002", key: "y2002", voice: "s02", Comp: Scene2002, enter: "fade" },
  { name: "3 Bayern 11 ligas", key: "bayern11", voice: "s03", Comp: SceneBayern11, enter: "right" },
  { name: "4 Llega Xabi", key: "xabi", voice: "s04", Comp: SceneXabi, enter: "wipe" },
  { name: "5 Invictos", key: "unbeaten", voice: "s05", Comp: SceneUnbeaten, enter: "bottom" },
  { name: "6 Descuento", key: "late", voice: "s06", Comp: SceneLate, enter: "right" },
  { name: "7 3-0 al Bayern", key: "bayern30", voice: "s07", Comp: SceneBayern30, enter: "wipe" },
  { name: "8 Bremen: Boniface y Xhaka", key: "bremen", voice: "s08", Comp: SceneBremen, enter: "fade" },
  { name: "9 Wirtz x3 + invasión", key: "wirtz", voice: "s09", Comp: SceneWirtz, enter: "right" },
  { name: "10 Campeones", key: "champions", voice: "s10", Comp: SceneChampions, enter: "fade" },
  { name: "11 34 partidos, 0 derrotas", key: "stats", voice: "s11", Comp: SceneStats, enter: "bottom" },
  { name: "12 CTA", key: "cta", voice: "s12", Comp: SceneCta, enter: "fade" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const presentation = (e: (typeof SCENES)[number]["enter"]): TransitionPresentation<any> => {
  switch (e) {
    case "right":
      return slide({ direction: "from-right" });
    case "left":
      return slide({ direction: "from-left" });
    case "bottom":
      return slide({ direction: "from-bottom" });
    case "wipe":
      return wipe({ direction: "from-left" });
    default:
      return fade();
  }
};

/**
 * Reel: Bayer Leverkusen, campeón invicto de la Bundesliga 2023/24.
 * "Neverkusen" → Leverkusen. 12 escenas narradas, 1080x1920 a 30 fps.
 */
export const ReelLeverkusen: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  let cursor = 0;
  const cuts: number[] = [];
  SCENES.forEach((s, i) => {
    if (i > 0) cuts.push(cursor);
    cursor += SCENE_FRAMES[s.key] - T;
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0D12" }}>
      <TransitionSeries>
        {SCENES.flatMap((s, i) => {
          const seq = (
            <TransitionSeries.Sequence key={s.key} name={s.name} durationInFrames={SCENE_FRAMES[s.key]}>
              <s.Comp />
              <Voice id={s.voice} />
            </TransitionSeries.Sequence>
          );
          if (i === 0) return [seq];
          return [
            <TransitionSeries.Transition
              key={`${s.key}-t`}
              presentation={presentation(s.enter)}
              timing={linearTiming({ durationInFrames: T })}
            />,
            seq,
          ];
        })}
      </TransitionSeries>
      {cuts.map((c, i) => (
        <Sfx key={c} name={`Whoosh corte ${i + 2}`} file="whoosh.wav" from={c - 4} volume={0.35} durationInFrames={20} />
      ))}
      <Audio
        name="Ambiente estadio"
        src={staticFile("sfx/crowd.wav")}
        volume={(f) =>
          interpolate(f, [0, 20, durationInFrames - 30, durationInFrames], [0, 0.1, 0.1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
};
