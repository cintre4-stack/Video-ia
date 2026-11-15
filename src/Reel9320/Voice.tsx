import { Audio } from "@remotion/media";
import React from "react";
import { Sequence, staticFile } from "remotion";

/** One narration line from public/voiceover/reel9320. */
export const Voice: React.FC<{ id: string; from: number }> = ({ id, from }) => (
  <Sequence name={`Voz ${id}`} from={from} layout="none">
    <Audio src={staticFile(`voiceover/reel9320/${id}.mp3`)} volume={1} />
  </Sequence>
);
