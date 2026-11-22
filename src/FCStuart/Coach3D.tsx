import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { useCurrentFrame } from "remotion";

const SKIN = "#F2B88E";
const JACKET = "#E23030";
const JACKET_DARK = "#8E1212";
const CAP = "#1F4FD1";
const CAP_DARK = "#0E2A7A";
const TRIM = "#FFFFFF";
const GOLD = "#FFD84A";
const HAIR = "#2B1A10";

/** Pieza con material mate: 3D de estilo juguete. */
const Mat: React.FC<{ color: string; roughness?: number }> = ({ color, roughness = 0.55 }) => (
  <meshStandardMaterial color={color} roughness={roughness} metalness={0.05} emissive={color} emissiveIntensity={0.18} />
);

/** Brazo: pivote en el hombro, cápsula colgando hacia abajo. */
const Arm: React.FC<{ side: 1 | -1; angle: number; color: string }> = ({ side, angle, color }) => (
  <group position={[side * 0.95, 0.35, 0]} rotation={[0, 0, side * angle]}>
    <mesh position={[0, -0.55, 0]} castShadow>
      <capsuleGeometry args={[0.22, 0.8, 8, 16]} />
      <Mat color={color} />
    </mesh>
    <mesh position={[0, -1.25, 0]} castShadow>
      <sphereGeometry args={[0.24, 20, 20]} />
      <Mat color={SKIN} roughness={0.4} />
    </mesh>
  </group>
);

/** Entrenador: cabezón, gorra azul, chamarra roja con franja blanca. */
export const CoachMesh: React.FC<{ armsUp?: number; mouthOpen?: number; bob?: number; scale?: number }> = ({
  armsUp = 0.3,
  mouthOpen = 0,
  bob = 0,
  scale = 1,
}) => {
  const armAngle = 0.25 + armsUp * 2.4;
  return (
    <group scale={scale} position={[0, bob, 0]}>
      {/* Torso */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <capsuleGeometry args={[0.72, 0.9, 10, 24]} />
        <Mat color={JACKET} />
      </mesh>
      <mesh position={[0, -0.4, 0.66]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[1.5, 0.12, 0.05]} />
        <Mat color={TRIM} />
      </mesh>
      <mesh position={[0, -0.9, 0.72]}>
        <boxGeometry args={[0.7, 0.32, 0.05]} />
        <Mat color={GOLD} roughness={0.3} />
      </mesh>
      {/* Brazos */}
      <Arm side={1} angle={armAngle} color={JACKET_DARK} />
      <Arm side={-1} angle={armAngle} color={JACKET_DARK} />
      {/* Cabeza grande */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[1.0, 40, 40]} />
        <Mat color={SKIN} roughness={0.4} />
      </mesh>
      {/* Gorra */}
      <mesh position={[0, 1.95, 0]} castShadow scale={[1.04, 0.82, 1.04]}>
        <sphereGeometry args={[1.0, 40, 24]} />
        <Mat color={CAP} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.98, 0.86]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 0.08, 0.5]} />
        <Mat color={CAP_DARK} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.95, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <Mat color={GOLD} roughness={0.3} />
      </mesh>
      {/* Ojos */}
      {[-0.36, 0.36].map((x) => (
        <group key={x} position={[x, 1.55, 0.9]}>
          <mesh scale={[0.3, 0.36, 0.14]}>
            <sphereGeometry args={[1, 24, 24]} />
            <Mat color="#FFFFFF" roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.02, 0.1]} scale={[0.15, 0.18, 0.1]}>
            <sphereGeometry args={[1, 20, 20]} />
            <Mat color="#151515" roughness={0.2} />
          </mesh>
        </group>
      ))}
      {/* Cejas */}
      <mesh position={[-0.36, 1.92, 0.92]} rotation={[0, 0, 0.35]} scale={[0.32, 0.07, 0.07]}>
        <sphereGeometry args={[1, 12, 12]} />
        <Mat color={HAIR} />
      </mesh>
      <mesh position={[0.36, 1.92, 0.92]} rotation={[0, 0, -0.35]} scale={[0.32, 0.07, 0.07]}>
        <sphereGeometry args={[1, 12, 12]} />
        <Mat color={HAIR} />
      </mesh>
      {/* Bigote */}
      <mesh position={[0, 1.2, 0.92]} scale={[0.5, 0.12, 0.1]}>
        <sphereGeometry args={[1, 16, 16]} />
        <Mat color={HAIR} />
      </mesh>
      {/* Boca: se abre con la voz */}
      <mesh position={[0, 1.02 - mouthOpen * 0.05, 0.9]} scale={[0.34, 0.12 + mouthOpen * 0.22, 0.1]}>
        <sphereGeometry args={[1, 20, 20]} />
        <Mat color="#6E0E0E" roughness={0.3} />
      </mesh>
    </group>
  );
};

/** Aficionado chico con el uniforme del equipo. */
export const FanMesh: React.FC<{ jump?: number; scale?: number }> = ({ jump = 0, scale = 0.5 }) => (
  <group scale={scale} position={[0, jump, 0]}>
    <mesh position={[0, -0.1, 0]} castShadow>
      <capsuleGeometry args={[0.55, 0.7, 8, 16]} />
      <Mat color={JACKET} />
    </mesh>
    <mesh position={[0, 1.2, 0]} castShadow>
      <sphereGeometry args={[0.7, 28, 28]} />
      <Mat color={SKIN} roughness={0.4} />
    </mesh>
    <mesh position={[0, 1.5, 0]} scale={[0.78, 0.5, 0.78]} castShadow>
      <sphereGeometry args={[0.75, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <Mat color={CAP} roughness={0.4} />
    </mesh>
    {[-0.25, 0.25].map((x) => (
      <mesh key={x} position={[x, 1.2, 0.62]} scale={[0.14, 0.18, 0.1]}>
        <sphereGeometry args={[1, 14, 14]} />
        <Mat color="#151515" roughness={0.2} />
      </mesh>
    ))}
  </group>
);

/** Piso de cancha y luces comunes a las escenas 3D. */
const Set: React.FC<{ children: React.ReactNode; cameraZ?: number; cameraY?: number; fov?: number }> = ({
  children,
  cameraZ = 9,
  cameraY = 1.8,
  fov = 36,
}) => (
  <>
    <perspectiveCamera position={[0, cameraY, cameraZ]} fov={fov} near={0.1} far={100} />
    <ambientLight intensity={0.55} />
    <hemisphereLight args={["#CFE8FF", "#1B4A2A", 0.7]} />
    <directionalLight position={[4, 8, 6]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]} receiveShadow>
      <circleGeometry args={[3.2, 64]} />
      <shadowMaterial opacity={0.35} />
    </mesh>
    {children}
  </>
);

/** Escena 3D completa del entrenador (con su luz y cámara). */
export const Coach3DScene: React.FC<{
  width: number;
  height: number;
  armsUp?: number;
  mouthOpen?: number;
  bob?: number;
  scale?: number;
}> = ({ width, height, armsUp, mouthOpen, bob, scale }) => (
  <ThreeCanvas width={width} height={height} style={{ background: "transparent" }} shadows>
    <Set>
      <CoachMesh armsUp={armsUp} mouthOpen={mouthOpen} bob={bob} scale={scale} />
    </Set>
  </ThreeCanvas>
);

/** Hilera de aficionados que van saltando en 3D. */
export const FanRow3D: React.FC<{ width: number; height: number; count: number }> = ({ width, height, count }) => {
  const frame = useCurrentFrame();
  const cols = Math.min(count, 6);
  const rows = Math.ceil(count / 6);
  return (
    <ThreeCanvas width={width} height={height} style={{ background: "transparent" }} shadows>
      <Set cameraZ={11} cameraY={1.5} fov={40}>
        {Array.from({ length: count }).map((_, i) => {
          const r = Math.floor(i / 6);
          const c = i % 6;
          const x = (c - (cols - 1) / 2) * 1.5;
          const z = -r * 1.5 + ((rows - 1) * 1.5) / 2;
          const jump = Math.abs(Math.sin((frame + i * 7) / 6)) * 0.35;
          return (
            <group key={i} position={[x, -2.6, z]}>
              <FanMesh jump={jump} scale={0.75} />
            </group>
          );
        })}
      </Set>
    </ThreeCanvas>
  );
};
