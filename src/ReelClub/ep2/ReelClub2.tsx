import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { CameraRig, Shot } from "../CameraRig";
import { Coach } from "../Coach";
import { EpisodeProvider } from "../episode";
import "../theme";
import { World } from "../World";
import { EPISODE_2 } from "./episode2";
import { Overlay2 } from "./Overlay2";
import { CoinRain, GhostXI } from "./Props3D";
import { at, BEATS, LEAD, scene2, SCENES2 } from "./timeline";

const SHOTS_EP2: Record<string, Shot> = {
  hook: { from: [0, 2.3, 7.6], to: [0, 2.2, 6.3], look: [0, 2.05, 2], fov: 44 },
  porteria: { from: [2.5, 2.8, -10], to: [1.2, 2.4, -12.5], look: [0, 1.2, -21.8], fov: 48 },
  nombre: { from: [0, 2.2, 7.8], to: [0, 2.2, 7.1], look: [0, 2.6, 2], fov: 45 },
  problema: { from: [0, 6.5, 12.5], to: [0, 7.5, 14.5], look: [0, 0.5, -6], fov: 50 },
  once: { from: [0, 14, 8], to: [0, 15, 9.5], look: [0, 0, -11], fov: 50 },
  rival: { from: [0, 2.3, 7.4], to: [0, 2.2, 6.4], look: [0, 2.6, 2], fov: 44 },
  meta: { from: [9, 5, 7], to: [-9, 5, 7], look: [0, 0.5, -9], fov: 55 },
  cta: { from: [0, 2.6, 8.8], to: [0, 4.2, 10.5], look: [0, 2.6, -6], fov: 52 },
};

const SFX_GAIN = 0.55;
const Sfx: React.FC<{ file: string; from: number; volume?: number; dur?: number }> = ({ file, from, volume = 0.8, dur = 150 }) => (
  <Sequence name={`SFX ${file}`} from={from} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume * SFX_GAIN} />
  </Sequence>
);

/**
 * Reel 3D, episodio 2: se recaudaron $280 (solo para la portería), el equipo se llama
 * Los Papois, los 11 primeros comentarios serán el once titular, próximo rival de tercera
 * división, y la meta de $2.400 sigue. 1080x1920 @30fps.
 */
export const ReelClub2: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#1B1F3A" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 45, near: 0.1, far: 300, position: [0, 2, 6] }}>
        <EpisodeProvider value={EPISODE_2}>
          <CameraRig shots={SHOTS_EP2} scenes={SCENES2} />
          <World />
          <Coach />
          <CoinRain />
          <GhostXI />
        </EpisodeProvider>
      </ThreeCanvas>
      <Overlay2 />

      <Sequence name="Voz entrenador" from={LEAD} layout="none">
        <Audio src={staticFile("voiceover/club-ep2-eleven/voz.mp3")} volume={1} />
      </Sequence>

      <Sfx file="whistle.wav" from={0} volume={0.6} />
      <Sfx file="ding.wav" from={at(BEATS.recaud)} volume={0.7} dur={60} />
      <Sfx file="ding.wav" from={at(BEATS.recaud) + 22} volume={0.7} dur={60} />
      <Sfx file="ding.wav" from={at(BEATS.recaud) + 44} volume={0.8} dur={60} />
      {SCENES2.slice(1).map((s) => (
        <Sfx key={s.id} file="whoosh.wav" from={s.start} volume={0.45} dur={30} />
      ))}
      <Sfx file="kick.wav" from={at(BEATS.goal) - 8} volume={0.6} dur={30} />
      <Sfx file="ding.wav" from={at(BEATS.goal) - 4} volume={0.75} dur={60} />
      <Sfx file="boom.wav" from={at(BEATS.papois)} volume={0.8} />
      <Sfx file="roar.wav" from={at(BEATS.papois)} volume={0.35} dur={60} />
      <Sfx file="boom.wav" from={at(BEATS.jugadores)} volume={0.6} />
      <Sfx file="groan.wav" from={at(BEATS.jugadores) + 4} volume={0.4} dur={60} />
      <Sfx file="boom.wav" from={at(BEATS.titular)} volume={0.6} />
      <Sfx file="boom.wav" from={scene2("rival").start + 28} volume={0.7} />
      <Sfx file="roar.wav" from={at(BEATS.ascend)} volume={0.4} dur={60} />
      <Sfx file="roar.wav" from={scene2("cta").start} volume={0.55} dur={scene2("cta").dur} />
      <Sfx file="crowd.wav" from={scene2("cta").start} volume={0.4} dur={scene2("cta").dur} />
    </AbsoluteFill>
  );
};
