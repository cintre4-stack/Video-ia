import React, { useMemo } from "react";
import * as THREE from "three";
import { random, spring, useCurrentFrame } from "remotion";
import { CLUB } from "../theme";
import { scene2 } from "./timeline";

/** Gold coins raining around the coach during the hook ($280!). */
export const CoinRain: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= scene2("porteria").start + 4) return null;
  return (
    <group>
      {Array.from({ length: 70 }, (_, i) => {
        const delay = random(`cd${i}`) * 45;
        const t = frame - delay;
        if (t < 0) return null;
        const x = (random(`cx${i}`) - 0.5) * 5;
        const z = 0.6 + random(`cz${i}`) * 3.4;
        const y0 = 5 + random(`cy${i}`) * 2;
        const y = Math.max(0.03 + (i % 5) * 0.025, y0 - 0.006 * t * t - 0.05 * t);
        const landed = y <= 0.15;
        return (
          <mesh
            key={i}
            position={[x, y, z]}
            rotation={landed ? [Math.PI / 2, 0, i] : [t * 0.25 + i, t * 0.15, 0]}
          >
            <cylinderGeometry args={[0.12, 0.12, 0.03, 20]} />
            <meshStandardMaterial color={CLUB.gold} metalness={0.7} roughness={0.25} emissive="#7A5200" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};

const questionTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = CLUB.gold;
  g.beginPath();
  g.arc(64, 64, 60, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = CLUB.navy;
  g.font = "bold 96px sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("?", 64, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** 4-3-3, attacking toward the camera; the keeper stands in the new goal. */
const FORMATION: [number, number][] = [
  [0, -20.5],
  [-5.5, -16],
  [-1.8, -16.8],
  [1.8, -16.8],
  [5.5, -16],
  [-3.5, -11],
  [0, -12],
  [3.5, -11],
  [-5, -5.5],
  [0, -4.5],
  [5, -5.5],
];

/** Eleven empty, see-through players with a "?" — one spot per comment. */
export const GhostXI: React.FC = () => {
  const frame = useCurrentFrame();
  const q = useMemo(questionTexture, []);
  const t0 = scene2("once").start + 8;
  return (
    <group>
      {FORMATION.map(([x, z], i) => {
        const p = spring({ frame: frame - t0 - i * 4, fps: 30, config: { damping: 10, stiffness: 160 } });
        if (p <= 0.001) return null;
        const bob = Math.sin(frame * 0.15 + i) * 0.06;
        const color = i === 0 ? CLUB.gold : "#FFFFFF";
        return (
          <group key={i} position={[x, bob, z]} scale={p * 1.25}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02 - bob, 0]}>
              <ringGeometry args={[0.45, 0.6, 32]} />
              <meshBasicMaterial color={CLUB.gold} transparent opacity={0.8} />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <capsuleGeometry args={[0.28, 0.45, 8, 16]} />
              <meshStandardMaterial color={color} transparent opacity={0.45} depthWrite={false} />
            </mesh>
            <mesh position={[0, 1.25, 0]}>
              <sphereGeometry args={[0.32, 20, 20]} />
              <meshStandardMaterial color={color} transparent opacity={0.45} depthWrite={false} />
            </mesh>
            <mesh position={[0, 1.95, 0]} rotation={[-0.5, 0, 0]}>
              <planeGeometry args={[0.6, 0.6]} />
              <meshBasicMaterial map={q} transparent side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
