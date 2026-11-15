import { Audio } from "@remotion/media";
import React from "react";
import { Sequence, staticFile } from "remotion";

/** One-shot sound effect from public/sfx, placed at a local frame. */
export const Sfx: React.FC<{
  name: string;
  file: string;
  from: number;
  volume?: number;
  durationInFrames?: number;
}> = ({ name, file, from, volume = 0.8, durationInFrames = 150 }) => (
  <Sequence name={name} from={from} durationInFrames={durationInFrames} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);
