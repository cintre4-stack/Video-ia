import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, clamp } from "./theme";

export type ChefAction = "idle" | "wave" | "chop" | "stir" | "shake" | "pour" | "whisk" | "place" | "cheer" | "point";

/**
 * Chef Bolo: personaje original, una bolita de masa con gorro de chef.
 * Todo se anima con el frame local de la escena (nada se mueve solo).
 */
export const Chef: React.FC<{
  position?: [number, number, number];
  scale?: number;
  action?: ChefAction;
  /** Apertura de la boca 0..1 para este frame (lip-sync). */
  mouth?: number;
  /** Utensilio que sujeta la mano derecha (en coordenadas de la mano). */
  rightTool?: React.ReactNode;
  leftTool?: React.ReactNode;
  /** Mirada: -1 izquierda, 1 derecha; y -1 abajo, 1 arriba. */
  look?: [number, number];
  happy?: boolean;
  /** Sonrisa abierta (para retratos/fotos fijas). */
  smile?: boolean;
  apron?: boolean;
}> = ({ position = [0, 0.62, -1.75], scale = 1, action = "idle", mouth = 0, rightTool, leftTool, look = [0, -0.3], happy, smile, apron = true }) => {
  const f = useCurrentFrame();

  // Entrada con rebote al empezar la escena.
  const enter = interpolate(f, [0, 6, 12], [0.9, 1.04, 1], clamp);
  const breathe = Math.sin(f * 0.18);
  let hop = 0;
  if (action === "cheer") hop = Math.abs(Math.sin(f * 0.22)) * 0.28;
  const squashY = 1 + breathe * 0.025 + (action === "cheer" ? Math.sin(f * 0.44) * 0.04 : 0);
  const squashXZ = 1 - breathe * 0.015;

  // Parpadeo cada ~2.7 s.
  const bf = f % 80;
  const blink = bf > 74 ? 0.12 : 1;

  // Brazos: rotación [x, z] en el hombro. x negativa = hacia delante.
  let rArm: [number, number, number] = [-0.35, 0, 0.35];
  let lArm: [number, number, number] = [-0.35, 0, -0.35];
  switch (action) {
    case "wave":
      rArm = [-0.3, 0, 2.3 + Math.sin(f * 0.45) * 0.45];
      break;
    case "chop":
      rArm = [-1.15 + Math.max(0, Math.sin(f * 0.9)) * 0.55, 0, 0.35];
      lArm = [-1.0, 0, -0.5];
      break;
    case "stir":
      rArm = [-1.1 + Math.sin(f * 0.35) * 0.12, Math.cos(f * 0.35) * 0.25, 0.12];
      break;
    case "whisk":
      rArm = [-1.15 + Math.sin(f * 0.9) * 0.1, Math.cos(f * 0.9) * 0.3, 0.1];
      lArm = [-0.9, 0, -0.6];
      break;
    case "shake":
      rArm = [-1.45 + Math.sin(f * 1.1) * 0.25, 0, 0.3];
      break;
    case "pour":
      rArm = [-1.35, 0, 0.35];
      break;
    case "place":
      rArm = [-1.2, 0, 0.55];
      lArm = [-1.2, 0, -0.55];
      break;
    case "cheer":
      rArm = [-0.2, 0, 2.5 + Math.sin(f * 0.44) * 0.2];
      lArm = [-0.2, 0, -2.5 - Math.sin(f * 0.44) * 0.2];
      break;
    case "point":
      rArm = [-1.4, 0, 0.9];
      break;
    default:
      rArm = [-0.35 + breathe * 0.05, 0, 0.35];
      lArm = [-0.35 - breathe * 0.05, 0, -0.35];
  }

  const eyeX = look[0] * 0.05;
  const eyeY = look[1] * 0.05;
  const mouthOpen = Math.max(0, Math.min(1, mouth));

  return (
    <group position={[position[0], position[1] + hop, position[2]]} scale={scale * enter}>
      <group scale={[squashXZ, squashY, squashXZ]}>
        {/* Cuerpo */}
        <mesh scale={[1, 0.93, 0.9]}>
          <sphereGeometry args={[0.85, 48, 48]} />
          <meshStandardMaterial color={C.chef} roughness={0.55} />
        </mesh>
        {/* Barriga más clara */}
        <mesh position={[0, -0.45, 0.36]} scale={[0.55, 0.42, 0.35]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#FFD08A" roughness={0.6} />
        </mesh>
        {/* Delantal */}
        {apron && <mesh position={[0, -0.62, 0.48]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.8, 0.5, 0.06]} />
          <meshStandardMaterial color={C.cream} roughness={0.8} />
        </mesh>}
        {/* Pajarita roja */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.13, -0.5, 0.72]} rotation={[0, 0, (s * -Math.PI) / 2]}>
            <coneGeometry args={[0.1, 0.24, 16]} />
            <meshStandardMaterial color={C.tomato} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, -0.5, 0.77]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={C.tomatoDark} roughness={0.5} />
        </mesh>
        {/* Ojos */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.27, 0.22, 0.6]} scale={[1, blink, 1]}>
            <mesh scale={[1, 1.18, 0.75]}>
              <sphereGeometry args={[0.2, 32, 32]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
            </mesh>
            <mesh position={[eyeX, eyeY, 0.13]}>
              <sphereGeometry args={[0.11, 24, 24]} />
              <meshStandardMaterial color="#1B120D" roughness={0.2} />
            </mesh>
            <mesh position={[eyeX + 0.04, eyeY + 0.05, 0.22]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            {/* Ceja */}
            <mesh position={[0, 0.3 + (happy ? 0.04 : 0), 0.06]} rotation={[0, 0, Math.PI / 2 + s * (happy ? 0.2 : -0.1)]}>
              <capsuleGeometry args={[0.028, 0.16, 4, 8]} />
              <meshStandardMaterial color="#5A2E14" />
            </mesh>
          </group>
        ))}
        {/* Mofletes */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.5, -0.02, 0.55]} scale={[1, 0.6, 0.4]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={C.cheek} roughness={0.8} transparent opacity={0.85} />
          </mesh>
        ))}
        {/* Bigote */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.1, -0.03, 0.75]} rotation={[0, 0, s * -0.35]} scale={[1.6, 0.7, 0.7]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#6B3416" roughness={0.7} />
          </mesh>
        ))}
        {/* Boca */}
        {smile ? (
          <group position={[0, -0.16, 0.7]} rotation={[-0.25, 0, 0]}>
            <mesh>
              <circleGeometry args={[0.19, 40, Math.PI, Math.PI]} />
              <meshStandardMaterial color="#7A1E1E" roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.12, 0.005]} scale={[1, 0.55, 1]}>
              <circleGeometry args={[0.11, 32]} />
              <meshStandardMaterial color="#FF6F7D" roughness={0.6} />
            </mesh>
          </group>
        ) : (
        <mesh position={[0, -0.21, 0.69]} scale={[0.14 + mouthOpen * 0.03, 0.04 + mouthOpen * 0.11, 0.08]}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial color="#7A1E1E" roughness={0.5} />
        </mesh>
        )}

        {/* Gorro de chef */}
        <group position={[0, 0.78, -0.02]} rotation={[-0.08, 0, Math.sin(f * 0.12) * 0.04]}>
          <mesh>
            <cylinderGeometry args={[0.42, 0.45, 0.32, 32]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.3, 0]} scale={[1, 0.72, 1]}>
            <sphereGeometry args={[0.48, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.3, 0.24, 0.05]}>
              <sphereGeometry args={[0.3, 24, 24]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Brazos */}
      <Arm side={1} rot={rArm} tool={rightTool} />
      <Arm side={-1} rot={lArm} tool={leftTool} />
    </group>
  );
};

const Arm: React.FC<{ side: 1 | -1; rot: [number, number, number]; tool?: React.ReactNode }> = ({ side, rot, tool }) => (
  <group position={[side * 0.74, -0.05, 0.1]} rotation={rot}>
    <mesh position={[0, -0.32, 0]}>
      <capsuleGeometry args={[0.11, 0.45, 8, 16]} />
      <meshStandardMaterial color={C.chef} roughness={0.55} />
    </mesh>
    <group position={[0, -0.66, 0]}>
      <mesh>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial color={C.chefShade} roughness={0.55} />
      </mesh>
      {tool}
    </group>
  </group>
);
