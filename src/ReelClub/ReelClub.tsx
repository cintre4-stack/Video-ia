import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { CameraRig, SHOTS_EP1 } from "./CameraRig";
import { EPISODE_1 } from "./ep1";
import { EpisodeProvider } from "./episode";
import { Coach } from "./Coach";
import { Overlay } from "./Overlay";
import { ITEMS, LEAD, SCENES, sceneById, upgradeAt, voiceFrame } from "./timeline";
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
        <EpisodeProvider value={EPISODE_1}>
          <CameraRig shots={SHOTS_EP1} scenes={SCENES} />
          <World />
          <Coach />
        </EpisodeProvider>
      </ThreeCanvas>
      <Overlay />

      {/* Narration: one ElevenLabs track */}
      <Sequence name="Voz entrenador" from={LEAD} layout="none">
        <Audio src={staticFile("voiceover/club-eleven/voz.mp3")} volume={1} />
      </Sequence>

      {/* Sound design */}
      <Sfx file="whistle.wav" from={0} volume={0.6} />
      <Sfx file="boom.wav" from={sceneById("cancha").start + voiceFrame("cancha", 8.51)} volume={0.7} />
      <Sfx file="ding.wav" from={sceneById("reglas").start + voiceFrame("reglas", 12.08)} volume={0.7} />
      <Sfx file="ding.wav" from={sceneById("reglas").start + voiceFrame("reglas", 13.5)} volume={0.8} />
      {SCENES.slice(1).map((s) => (
        <Sfx key={s.id} file="whoosh.wav" from={s.start} volume={0.45} dur={30} />
      ))}
      {ITEMS.map((i) => (
        <React.Fragment key={i.scene}>
          <Sfx file="kick.wav" from={sceneById(i.scene).start + upgradeAt(i.scene) - 2} volume={0.6} dur={30} />
          <Sfx file="ding.wav" from={sceneById(i.scene).start + upgradeAt(i.scene) + 2} volume={0.75} dur={60} />
        </React.Fragment>
      ))}
      <Sfx file="boom.wav" from={sceneById("nombre").start + voiceFrame("nombre", 31.72)} volume={0.8} />
      <Sfx file="roar.wav" from={sceneById("cta").start} volume={0.55} dur={sceneById("cta").dur} />
      <Sfx file="crowd.wav" from={sceneById("cta").start} volume={0.4} dur={sceneById("cta").dur} />
    </AbsoluteFill>
  );
};
