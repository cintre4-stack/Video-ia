import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Chef } from "./Chef";
import { Spoon } from "./Props";
import { Lights } from "./Scenes3D";
import { C } from "./theme";

/**
 * Foto de perfil del canal: Chef Bolo sonriendo, centrado para el recorte circular
 * de Instagram/TikTok/YouTube. Sin texto: a tamaño miniatura no se lee.
 */
export const AvatarChefBolo: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${C.cheese} 0%, #FF9A3C 55%, ${C.tomato} 100%)` }}>
      {/* Rayos suaves detrás del personaje */}
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from 0deg at 50% 46%, rgba(255,255,255,0.13) 0deg 10deg, transparent 10deg 20deg)`,
        }}
      />
      {/* Sombra suave bajo el personaje */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 820,
          width: 460,
          height: 70,
          translate: "-50% 0",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(110,30,0,0.45), transparent 70%)",
        }}
      />
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ alpha: true, antialias: true }}
        camera={{ fov: 30, position: [0, 0.3, 6.1], near: 0.1, far: 40 }}
      >
        <Lights />
        <pointLight position={[0, 0.5, 3]} intensity={3} color="#FFF3E0" />
        <Chef
          position={[0, -0.1, 0]}
          action="wave"
          smile
          apron={false}
          happy
          look={[0, 0.15]}
          leftTool={<Spoon />}
        />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

