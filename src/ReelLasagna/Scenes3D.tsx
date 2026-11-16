import { useThree } from "@react-three/fiber";
import React from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { Chef } from "./Chef";
import { Kitchen } from "./Kitchen";
import { MOUTH } from "./mouth.generated";
import {
  BakingDish,
  Board,
  Bubbles,
  Grater,
  interpolateHex,
  Knife,
  LayerKind,
  Liquid,
  Oven,
  Pan,
  Pieces,
  Pot,
  Shaker,
  Spatula,
  Spoon,
  Steam,
  Whisk,
} from "./Props";
import { C, clamp } from "./theme";
import { VOICE_LEAD } from "./timeline";

type V3 = [number, number, number];
const ease = Easing.inOut(Easing.cubic);

/** Cámara: viaja de `from` a `to` durante la escena (siempre con el frame). */
export const Cam: React.FC<{ from: V3; to: V3; target: V3; targetTo?: V3; dur: number; fov?: number }> = ({
  from,
  to,
  target,
  targetTo,
  dur,
  fov = 46,
}) => {
  const f = useCurrentFrame();
  const camera = useThree((s) => s.camera);
  const t = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: ease });
  const tt = targetTo ?? target;
  camera.position.set(...(from.map((v, i) => v + (to[i] - v) * t) as V3));
  if ("fov" in camera && camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  camera.lookAt(...(target.map((v, i) => v + (tt[i] - v) * t) as V3));
  return null;
};

/** Apertura de boca sincronizada con la locución de la escena. */
const useMouth = (voice: string, offset = VOICE_LEAD) => {
  const f = useCurrentFrame();
  const env = MOUTH[voice] ?? [];
  return env[f - offset] ?? 0;
};

export const Lights: React.FC = () => (
  <>
    <hemisphereLight args={["#FFF6E8", "#B98A5A", 1.1]} />
    <directionalLight position={[3, 6, 5]} intensity={2.2} color="#FFF1DC" />
    <directionalLight position={[-4, 3, 2]} intensity={0.7} color="#CFE3FF" />
  </>
);

const FULL_LAYERS: LayerKind[] = ["pasta", "carne", "bechamel", "pasta", "carne", "bechamel", "pasta", "carne", "bechamel"];
/** Frames (locales del paso 5) en que cae cada capa: los usa también el rótulo. */
export const MONTAJE_LAYERS = FULL_LAYERS.map((kind, i) => ({ kind, at: 22 + i * 15 }));
const READY = [...FULL_LAYERS, "queso" as const].map((kind) => ({ kind, at: -100 }));

/* ------------------------------ 0 · Gancho ------------------------------ */
export const SceneIntro: React.FC<{ dur: number }> = ({ dur }) => {
  const mouth = useMouth("s01");
  return (
    <>
      <Cam from={[0, 2.4, 7.0]} to={[0, 2.6, 5.4]} target={[0, 1.0, -0.4]} dur={dur} />
      <Kitchen />
      <Chef action="wave" mouth={mouth} happy look={[0, -0.1]} />
      <BakingDish position={[0, 0.01, 0.45]} layers={READY} golden={1} />
      <Steam position={[0, 0.6, 0.45]} amount={12} spread={0.6} />
    </>
  );
};

/* ------------------------------ 1 · Sofrito ----------------------------- */
export const SceneSofrito: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const mouth = useMouth("s02");
  const chopping = f < 100;
  const boardLeft = interpolate(f, [20, 95], [1, 0], clamp);
  const burner = interpolate(f, [0, 20], [0.2, 1], clamp);
  return (
    <>
      <Cam from={[0.6, 2.7, 4.6]} to={[0, 2.9, 3.9]} target={[0, 0.5, -0.2]} dur={dur} />
      <Kitchen burner={burner} />
      <Chef
        action={chopping ? "chop" : "stir"}
        mouth={mouth}
        rightTool={chopping ? <Knife /> : <Spoon />}
        look={[0, -0.6]}
      />
      <Board position={[0.05, 0.0, 0.85]}>
        {boardLeft > 0.01 && (
          <>
            <mesh position={[-0.28, 0.17, 0]} scale={[boardLeft, boardLeft, boardLeft]}>
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshStandardMaterial color="#D9B3E0" roughness={0.4} />
            </mesh>
            <mesh position={[0.15, 0.07, 0.05]} rotation={[0, 0, Math.PI / 2]} scale={[boardLeft, 1, boardLeft]}>
              <coneGeometry args={[0.07, 0.5, 16]} />
              <meshStandardMaterial color={C.carrot} roughness={0.5} />
            </mesh>
            <mesh position={[0.4, 0.07, -0.15]} scale={boardLeft}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color={C.garlic} roughness={0.5} />
            </mesh>
          </>
        )}
      </Board>
      <Pan>
        <Pieces seed="onion" count={22} start={22} every={3} radius={0.42} color={C.onion} shape="cube" size={0.07} jitter={0.015} />
        <Pieces seed="carrot" count={16} start={30} every={4} radius={0.42} color={C.carrot} shape="cube" size={0.06} jitter={0.015} />
        <Pieces seed="garlic" count={8} start={70} every={3} radius={0.35} color={C.garlic} shape="cube" size={0.04} jitter={0.015} />
      </Pan>
      <Steam intensity={interpolate(f, [40, 90], [0, 1], clamp)} />
    </>
  );
};

const Sofrito: React.FC = () => (
  <>
    <Pieces seed="onion" count={22} start={-100} every={0} radius={0.42} color="#F0D9A8" shape="cube" size={0.07} />
    <Pieces seed="carrot" count={16} start={-100} every={0} radius={0.42} color={C.carrot} shape="cube" size={0.06} />
  </>
);

/* ------------------------------ 2 · Carne ------------------------------- */
export const SceneCarne: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const mouth = useMouth("s03");
  const brown = interpolate(f, [50, 130], [0, 1], clamp);
  const meatColor = interpolateHex(C.meatRaw, C.meat, brown);
  const seasoning = f > 112;
  return (
    <>
      <Cam from={[-0.4, 2.9, 4.5]} to={[0.3, 2.8, 4.0]} target={[0, 0.45, -0.35]} dur={dur} />
      <Kitchen burner={1} />
      <Chef
        action={seasoning ? "shake" : "stir"}
        mouth={mouth}
        rightTool={seasoning ? <Shaker color="#FFFFFF" /> : <Spoon />}
        look={[0, -0.7]}
      />
      <Pan>
        <Sofrito />
        <Pieces seed="meat" count={60} start={12} every={1.2} radius={0.5} color={meatColor} shape="ball" size={0.06} jitter={0.012} />
        <Pieces seed="salt" count={18} start={118} every={1} radius={0.4} y={0.1} color={(i) => (i % 2 ? "#FFFFFF" : "#222222")} shape="cube" size={0.018} />
      </Pan>
      <Steam intensity={0.4 + brown * 0.6} />
    </>
  );
};

const Meat: React.FC = () => (
  <>
    <Sofrito />
    <Pieces seed="meat" count={60} start={-100} every={0} radius={0.5} color={C.meat} shape="ball" size={0.06} />
  </>
);

/* ------------------------------ 3 · Tomate ------------------------------ */
export const SceneTomate: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const mouth = useMouth("s04");
  const tilt = interpolate(f, [10, 25, 75, 90], [0, 2.1, 2.1, 0], { ...clamp, easing: ease });
  const canY = interpolate(f, [0, 12], [2.4, 1.15], { ...clamp, easing: Easing.out(Easing.back(1.5)) });
  const pouring = f > 22 && f < 80;
  const level = interpolate(f, [22, 80], [0, 0.11], clamp);
  return (
    <>
      <Cam from={[0, 3.1, 4.3]} to={[0, 3.0, 3.8]} target={[0, 0.4, -0.35]} dur={dur} fov={44} />
      <Kitchen burner={1} />
      <Chef action={f > 85 ? "stir" : "point"} mouth={mouth} rightTool={f > 85 ? <Spoon /> : undefined} look={[0.4, -0.6]} />
      {/* Lata de tomate */}
      {f < 95 && (
        <group position={[0.55, canY, -0.35]} rotation={[0, 0, tilt]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.2, 0.42, 32]} />
            <meshStandardMaterial color={C.tomato} roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.205, 0.205, 0.16, 32]} />
            <meshStandardMaterial color="#FFF4DD" roughness={0.5} />
          </mesh>
        </group>
      )}
      {pouring && (
        <mesh position={[0.35, 0.65, -0.35]}>
          <cylinderGeometry args={[0.05, 0.07, 1.0, 16]} />
          <meshStandardMaterial color={C.sauce} roughness={0.2} />
        </mesh>
      )}
      <Pan>
        <Meat />
        <Liquid radius={0.55} level={level} color={C.sauce} shine={0.2} />
        {f > 70 && <Bubbles y={level + 0.01} radius={0.45} color="#D9442E" count={14} />}
        <Pieces seed="oregano" count={30} start={110} every={0.8} radius={0.45} y={0.12} color={C.oregano} shape="flake" size={0.04} />
      </Pan>
      <Steam intensity={0.8} />
    </>
  );
};

/* ------------------------------ 4 · Bechamel ---------------------------- */
export const SceneBechamel: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const mouth = useMouth("s05");
  const butterIn = interpolate(f, [8, 20], [1.6, 0.06], { ...clamp, easing: Easing.in(Easing.quad) });
  const melt = interpolate(f, [24, 60], [1, 0], clamp);
  const milk = f > 80 && f < 140;
  const cartonTilt = interpolate(f, [70, 82, 135, 148], [0, 1.9, 1.9, 0], { ...clamp, easing: ease });
  const level = interpolate(f, [24, 60, 82, 140], [0, 0.05, 0.05, 0.28], clamp);
  const color = interpolateHex(C.butter, C.bechamel, interpolate(f, [60, 150], [0, 1], clamp));
  return (
    <>
      <Cam from={[0.4, 2.9, 4.5]} to={[-0.2, 2.8, 4.0]} target={[0, 0.55, -0.35]} dur={dur} />
      <Kitchen burner={0.7} />
      <Chef action={f > 36 ? "whisk" : "point"} mouth={mouth} rightTool={f > 36 ? <Whisk /> : undefined} look={[0, -0.6]} />
      <Pot>
        {melt > 0.02 && (
          <mesh position={[0, butterIn, 0]} scale={[0.6 + melt * 0.4, melt, 0.6 + melt * 0.4]}>
            <boxGeometry args={[0.32, 0.18, 0.22]} />
            <meshStandardMaterial color={C.butter} roughness={0.3} />
          </mesh>
        )}
        <Liquid radius={0.51} level={level} color={color} shine={0.3} />
        <Pieces seed="flour" count={36} start={42} every={0.7} radius={0.4} y={0.06} color="#FFFFFF" shape="cube" size={0.03} />
      </Pot>
      {/* Brik de leche */}
      {f > 62 && f < 152 && (
        <group position={[0.75, 1.15, -0.35]} rotation={[0, 0, cartonTilt]}>
          <mesh>
            <boxGeometry args={[0.32, 0.55, 0.32]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.05, 0.165]}>
            <boxGeometry args={[0.32, 0.22, 0.01]} />
            <meshStandardMaterial color="#3D7BD9" roughness={0.5} />
          </mesh>
        </group>
      )}
      {milk && (
        <mesh position={[0.35, 0.75, -0.35]}>
          <cylinderGeometry args={[0.04, 0.05, 0.8, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>
      )}
      <Steam position={[0, 0.55, -0.35]} intensity={0.6} />
    </>
  );
};

/* ------------------------------ 5 · Montaje ----------------------------- */
export const SceneMontaje: React.FC<{ dur: number }> = ({ dur }) => {
  const mouth = useMouth("s06");
  return (
    <>
      <Cam from={[1.5, 2.3, 4.8]} to={[0.8, 2.1, 4.3]} target={[0, 0.55, -0.2]} dur={dur} fov={44} />
      <Kitchen />
      <Chef action="place" mouth={mouth} look={[0, -0.8]} />
      <BakingDish position={[0, 0.01, 0.05]} layers={MONTAJE_LAYERS} />
    </>
  );
};

/* ------------------------------ 6 · Horno ------------------------------- */
export const HORNO_CUT = 78;
export const SceneHorno: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const mouth = useMouth("s07");
  const layersCheese = [...FULL_LAYERS.map((kind) => ({ kind, at: -100 })), { kind: "queso" as const, at: 52 }];
  if (f < HORNO_CUT) {
    return (
      <>
        <Cam from={[0, 2.9, 4.3]} to={[0, 2.7, 3.8]} target={[0, 0.55, -0.2]} dur={HORNO_CUT} />
        <Kitchen />
        <Chef action="shake" mouth={mouth} rightTool={<Grater />} look={[0, -0.8]} />
        <BakingDish position={[0, 0.01, 0.05]} layers={layersCheese} />
        <Pieces seed="cheese" count={50} start={8} every={0.9} radius={0.42} y={0.62} color={C.cheese} shape="flake" size={0.06} fromOffset={[0, 1.4, 0.05]} />
      </>
    );
  }
  const g = f - HORNO_CUT;
  const door = interpolate(g, [0, 8, 22, 32], [1, 1, 1, 0], { ...clamp, easing: ease });
  const slide = interpolate(g, [4, 22], [1.6, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const glow = interpolate(g, [30, 50], [0, 1], clamp) * (0.9 + Math.sin(g * 0.3) * 0.1);
  const golden = interpolate(g, [40, dur - HORNO_CUT - 10], [0, 1], clamp);
  return (
    <>
      <Cam from={[0, 2.0, 6.4]} to={[0, 1.9, 5.6]} target={[0, 1.05, 0]} dur={dur - HORNO_CUT} fov={46} />
      <pointLight position={[0, 1.0, 1.6]} intensity={glow * 6} color="#FF8A2A" distance={5} />
      <Kitchen />
      <Chef position={[0.55, 1.9, -1.4]} scale={0.8} action="point" mouth={mouth} look={[-0.6, -0.8]} happy />
      <Oven glow={glow} doorOpen={door} dial={interpolate(g, [28, 40], [0, 2.4], clamp)}>
        <BakingDish position={[0, -0.42, slide - 0.35]} layers={READY} golden={golden} />
      </Oven>
    </>
  );
};

/* ------------------------------ 7 · Final ------------------------------- */
export const SceneFinal: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const mouth = useMouth("s08");
  const cut = interpolate(f, [55, 110], [0, 1], { ...clamp, easing: ease });
  const stretch = interpolate(f, [55, 110, 125], [0, 1, 0], clamp);
  const sliceX = 1.7 / 2 - 0.06 - 0.21;
  return (
    <>
      <Cam from={[1.3, 2.3, 3.7]} to={[0.3, 2.6, 5.0]} target={[0.3, 0.4, 0.2]} targetTo={[0, 0.7, -0.2]} dur={dur} />
      <Kitchen />
      <Chef action={f > 110 ? "cheer" : "point"} mouth={mouth} happy look={[0.5, -0.5]} rightTool={f <= 110 ? <Spatula /> : undefined} />
      <BakingDish position={[0, 0.01, 0.25]} layers={READY} golden={1} cut={cut} />
      {/* Hilos de queso */}
      {stretch > 0.02 &&
        [-0.12, 0, 0.13].map((dx, i) => (
          <mesh key={i} position={[sliceX + dx, 0.62 + cut * 0.25, 0.25 + cut * 0.25]} scale={[1, 0.2 + cut * 0.6, 1]}>
            <cylinderGeometry args={[0.012 + (1 - stretch) * 0.01, 0.02, 0.9, 8]} />
            <meshStandardMaterial color={C.cheese} roughness={0.4} />
          </mesh>
        ))}
      <Steam position={[0.6, 0.65, 0.3]} amount={12} spread={0.4} />
      {f > 110 && <Confetti start={110} />}
    </>
  );
};

const Confetti: React.FC<{ start: number }> = ({ start }) => {
  const f = useCurrentFrame() - start;
  const colors = [C.tomato, C.cheese, C.basil, "#FFFFFF", C.carrot];
  return (
    <>
      {Array.from({ length: 60 }).map((_, i) => {
        const x = (random(`cf-x-${i}`) - 0.5) * 3.2;
        const z = random(`cf-z-${i}`) * 1.5 - 0.5;
        const speed = 0.025 + random(`cf-s-${i}`) * 0.02;
        const y = 3.6 - f * speed - random(`cf-y-${i}`) * 1.2;
        if (y < 0.05) return null;
        return (
          <mesh key={i} position={[x + Math.sin(f * 0.1 + i) * 0.1, y, z]} rotation={[f * 0.1 + i, f * 0.13, i]}>
            <boxGeometry args={[0.07, 0.04, 0.005]} />
            <meshStandardMaterial color={colors[i % colors.length]} side={2} />
          </mesh>
        );
      })}
    </>
  );
};
