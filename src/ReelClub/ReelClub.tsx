import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { CameraRig } from "./CameraRig";
import { Coach } from "./Coach";
import { Overlay } from "./Overlay";
import { ITEMS, LEAD, sceneById, SCENES, UPGRADE_AT, VOICE_FRAMES_EXPORT } from "./timeline";
import { World } from "./World";
import "./theme";

const SFX_GAIN = 0.55;
const Sfx: React.FC<{ file: string; from: number; volume?: number; dur?: number }> = ({ file, from, volume = 0.8, dur = 150 }) => (
  <Sequence name={`SFX ${file}`} from={from} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume * SFX_GAIN} />
  </Sequence>
);

/**
 * Reel 3D: un entrenador chibi funda su club y pide ayuda.
 * 1 like = $1, 1 comentario = $10; cada instalación se arregla con su precio
 * y el comentario con más likes será el nombre del equipo. 1080x1920 @30fps.
 */
export const ReelClub: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#1B1F3A" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 45, near: 0.1, far: 300, position: [0, 2, 6] }}>
        <CameraRig />
        <World />
        <Coach />
      </ThreeCanvas>
      <Overlay />

      {/* Narration */}
      {SCENES.map((s) => (
        <Sequence key={s.voice} name={`Voz ${s.voice}`} from={s.start + LEAD} durationInFrames={VOICE_FRAMES_EXPORT[s.voice] + 4} layout="none">
          <Audio src={staticFile(`voiceover/club/${s.voice}.mp3`)} volume={1} />
        </Sequence>
      ))}

      {/* Sound design */}
      <Sfx file="whistle.wav" from={0} volume={0.6} />
      <Sfx file="boom.wav" from={sceneById("cancha").start + LEAD + VOICE_FRAMES_EXPORT.s02 - 28} volume={0.7} />
      <Sfx file="ding.wav" from={sceneById("reglas").start + LEAD + 58} volume={0.7} />
      <Sfx file="ding.wav" from={sceneById("reglas").start + LEAD + 108} volume={0.8} />
      {SCENES.slice(1).map((s) => (
        <Sfx key={s.id} file="whoosh.wav" from={s.start} volume={0.45} dur={30} />
      ))}
      {ITEMS.map((i) => (
        <React.Fragment key={i.scene}>
          <Sfx file="kick.wav" from={sceneById(i.scene).start + UPGRADE_AT - 2} volume={0.6} dur={30} />
          <Sfx file="ding.wav" from={sceneById(i.scene).start + UPGRADE_AT + 2} volume={0.75} dur={60} />
        </React.Fragment>
      ))}
      <Sfx file="boom.wav" from={sceneById("nombre").start + LEAD + Math.round(VOICE_FRAMES_EXPORT.s09 * 0.55)} volume={0.8} />
      <Sfx file="roar.wav" from={sceneById("cta").start} volume={0.55} dur={sceneById("cta").dur} />
      <Sfx file="crowd.wav" from={sceneById("cta").start} volume={0.4} dur={sceneById("cta").dur} />
    </AbsoluteFill>
  );
};
