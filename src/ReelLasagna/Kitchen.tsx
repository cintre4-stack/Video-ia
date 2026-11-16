import React from "react";
import { C } from "./theme";

/** Decorado fijo: pared con azulejos, estante con botes, encimera y fogón. */
export const Kitchen: React.FC<{ burner?: number }> = ({ burner = 0 }) => {
  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = -7; c <= 7; c++) {
      tiles.push(
        <mesh key={`${r}-${c}`} position={[c * 0.52 + (r % 2) * 0.26, 0.3 + r * 0.52, -3.18]}>
          <boxGeometry args={[0.48, 0.48, 0.04]} />
          <meshStandardMaterial color={(r + c) % 5 === 0 ? "#FCE3C2" : C.tile} roughness={0.35} />
        </mesh>,
      );
    }
  }
  return (
    <group>
      {/* Pared */}
      <mesh position={[0, 3, -3.25]}>
        <planeGeometry args={[30, 14]} />
        <meshStandardMaterial color={C.wall} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.6, -3.22]}>
        <planeGeometry args={[30, 3.4]} />
        <meshStandardMaterial color={C.tileLine} roughness={0.9} />
      </mesh>
      {tiles}
      {/* Estante con botes */}
      <mesh position={[0, 3.55, -2.95]}>
        <boxGeometry args={[6, 0.1, 0.55]} />
        <meshStandardMaterial color={C.wood} roughness={0.7} />
      </mesh>
      {[
        [-1.5, C.tomato, 0.5],
        [-0.85, C.basil, 0.38],
        [-0.25, C.cheese, 0.6],
        [0.45, "#E9E2D0", 0.45],
        [1.1, C.carrot, 0.52],
        [1.7, C.tomatoDark, 0.4],
      ].map(([x, color, h], i) => (
        <group key={i} position={[x as number, 3.6 + (h as number) / 2, -2.9]}>
          <mesh>
            <cylinderGeometry args={[0.17, 0.17, h as number, 20]} />
            <meshStandardMaterial color={color as string} roughness={0.3} />
          </mesh>
          <mesh position={[0, (h as number) / 2 + 0.04, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.08, 20]} />
            <meshStandardMaterial color={C.woodDark} roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* Encimera */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[12, 0.12, 3.2]} />
        <meshStandardMaterial color={C.counter} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.9, 0.05]}>
        <boxGeometry args={[12, 1.6, 3.1]} />
        <meshStandardMaterial color={C.wood} roughness={0.7} />
      </mesh>
      {/* Fogón */}
      <group position={[0, 0.005, -0.35]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.72, 48]} />
          <meshStandardMaterial color="#2B2B30" roughness={0.6} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.38, 0.5, 48]} />
          <meshStandardMaterial color="#FF5A1F" emissive="#FF3A0A" emissiveIntensity={burner * 1.6} />
        </mesh>
      </group>
    </group>
  );
};
