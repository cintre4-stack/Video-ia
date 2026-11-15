import { Audio } from "@remotion/media";
import React from "react";
import { Sequence, staticFile } from "remotion";

/** Master trim for all one-shot effects, so they sit under the narration. */
export const SFX_GAIN = 0.6;

/** One-shot sound effect from public/sfx, placed at a local frame. */
export const Sfx: React.FC<{
  name: string;
  file: string;
  from: number;
  volume?: number;
  durationInFrames?: number;
}> = ({ name, file, from, volume = 0.8, durationInFrames = 150 }) => (
  <Sequence name={name} from={from} durationInFrames={durationInFrames} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume * SFX_GAIN} />
  </Sequence>
);
