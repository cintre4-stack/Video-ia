import React from "react";
import { useCurrentFrame } from "remotion";
import { CLUB } from "./theme";
import { CoachState, Pose, useEpisode } from "./episode";

/** Box-filters the arm pose over the last frames so every pose change eases in. */
const SMOOTH = 8;
const POSE_KEYS: (keyof Pose)[] = ["lz", "lx", "rz", "rx", "turn", "brow"];
const useCoachState = (frame: number): CoachState => {
  const { coach } = useEpisode();
  const now = coach(frame);
  const acc = { ...now };
  POSE_KEYS.forEach((k) => (acc[k] = 0));
  for (let k = 0; k < SMOOTH; k++) {
    const p = coach(Math.max(0, frame - k));
    POSE_KEYS.forEach((key) => (acc[key] += p[key] / SMOOTH));
  }
  return acc;
};

const Skin = () => <meshStandardMaterial color={CLUB.skin} roughness={0.55} />;

const Arm: React.FC<{ side: 1 | -1; z: number; x: number }> = ({ side, z, x }) => (
  <group position={[side * 0.43, 1.2, 0]} rotation={[x, 0, z]}>
    <mesh position={[0, -0.24, 0]}>
      <capsuleGeometry args={[0.11, 0.3, 8, 16]} />
      <meshStandardMaterial color={CLUB.red} roughness={0.5} />
    </mesh>
    <mesh position={[0, -0.5, 0]}>
      <sphereGeometry args={[0.12, 20, 20]} />
      <Skin />
    </mesh>
  </group>
);

/**
 * Chibi 3D coach: big head, cap, mustache, red tracksuit and a whistle.
 * Mouth opens with the narration loudness; everything is frame-driven.
 */
export const Coach: React.FC<{ position?: [number, number, number] }> = ({ position = [0, 0, 2] }) => {
  const frame = useCurrentFrame();
  const pose = useCoachState(frame);
  const talk = useEpisode().voice(frame);
  const { jump, headShake, lean } = pose;
  const bob = talk * 0.04 + Math.sin(frame * 0.12) * 0.015 + jump;
  const headTilt = Math.sin(frame * 0.07) * 0.06 + pose.headTilt;
  // Blink every ~2.5 s.
  const blink = frame % 75 < 3 ? 0.15 : 1;
  const mouthOpen = 0.08 + talk * 0.9;

  return (
    <group position={[position[0], position[1] + bob, position[2]]} rotation={[lean, pose.turn, 0]}>
      {/* blob shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01 - bob, 0]} scale={1 - jump * 0.8}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.3} />
      </mesh>
      {/* legs + shoes */}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 0.17, 0, 0]}>
          <mesh position={[0, 0.33, 0]}>
            <capsuleGeometry args={[0.12, 0.32, 8, 16]} />
            <meshStandardMaterial color={CLUB.navy} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.08, 0.07]} scale={[0.15, 0.09, 0.24]}>
            <sphereGeometry args={[1, 20, 16]} />
            <meshStandardMaterial color="#111" roughness={0.4} />
          </mesh>
        </group>
      ))}
      {/* torso: tracksuit jacket */}
      <mesh position={[0, 0.98, 0]}>
        <capsuleGeometry args={[0.38, 0.38, 12, 24]} />
        <meshStandardMaterial color={CLUB.red} roughness={0.5} />
      </mesh>
      {/* white side stripes + zipper */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.37, 0.98, 0]} scale={[0.04, 0.55, 0.2]}>
          <boxGeometry />
          <meshStandardMaterial color={CLUB.white} />
        </mesh>
      ))}
      <mesh position={[0, 0.98, 0.375]} scale={[0.025, 0.6, 0.02]}>
        <boxGeometry />
        <meshStandardMaterial color={CLUB.white} />
      </mesh>
      {/* club badge */}
      <mesh position={[-0.17, 1.12, 0.35]} rotation={[Math.PI / 2 - 0.3, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 24]} />
        <meshStandardMaterial color={CLUB.gold} metalness={0.4} roughness={0.3} />
      </mesh>
      {/* whistle on a cord */}
      <mesh position={[0, 1.3, 0.12]} rotation={[Math.PI / 2 - 0.35, 0, 0]}>
        <torusGeometry args={[0.24, 0.012, 8, 32]} />
        <meshStandardMaterial color={CLUB.white} />
      </mesh>
      <mesh position={[0.12, 1.08, 0.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
        <meshStandardMaterial color="#C9CED6" metalness={0.8} roughness={0.2} />
      </mesh>
      <Arm side={-1} z={pose.lz} x={pose.lx} />
      <Arm side={1} z={pose.rz} x={pose.rx} />
      {/* head */}
      <group position={[0, 1.83, 0]} rotation={[0, headShake, headTilt]}>
        <mesh>
          <sphereGeometry args={[0.56, 40, 40]} />
          <Skin />
        </mesh>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.55, -0.02, 0]} scale={[0.6, 1, 1]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <Skin />
          </mesh>
        ))}
        {/* eyes */}
        {[-1, 1].map((sd) => (
          <group key={sd} position={[sd * 0.2, -0.02, 0.46]} scale={[1, blink, 1]}>
            <mesh scale={[1, 1.15, 0.6]}>
              <sphereGeometry args={[0.12, 24, 24]} />
              <meshStandardMaterial color="#fff" roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.01, 0.06]} scale={[1, 1.1, 0.5]}>
              <sphereGeometry args={[0.07, 20, 20]} />
              <meshStandardMaterial color="#1b1410" roughness={0.2} />
            </mesh>
            <mesh position={[0.025, 0.03, 0.1]}>
              <sphereGeometry args={[0.018, 10, 10]} />
              <meshBasicMaterial color="#fff" />
            </mesh>
          </group>
        ))}
        {/* eyebrows */}
        {[-1, 1].map((sd) => (
          <mesh
            key={sd}
            position={[sd * 0.2, 0.15 + pose.brow * 0.05, 0.5]}
            rotation={[0, 0, sd * pose.brow * -0.4]}
            scale={[0.16, 0.045, 0.04]}
          >
            <boxGeometry />
            <meshStandardMaterial color={CLUB.hair} />
          </mesh>
        ))}
        {/* nose */}
        <mesh position={[0, -0.12, 0.54]}>
          <sphereGeometry args={[0.075, 20, 20]} />
          <meshStandardMaterial color={CLUB.skinDark} roughness={0.5} />
        </mesh>
        {/* mustache */}
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.09, -0.21, 0.5]} rotation={[0, 0, sd * -0.35 + Math.PI / 2]}>
            <capsuleGeometry args={[0.045, 0.12, 8, 12]} />
            <meshStandardMaterial color={CLUB.hair} roughness={0.8} />
          </mesh>
        ))}
        {/* mouth */}
        <mesh position={[0, -0.33, 0.45]} scale={[0.13, 0.02 + 0.12 * mouthOpen, 0.06]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color="#5a1414" roughness={0.6} />
        </mesh>
        {/* cap */}
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.585, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
          <meshStandardMaterial color={CLUB.navy} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.24, 0.47]} rotation={[-0.12, 0, 0]} scale={[1, 0.12, 0.75]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 32, 1, false, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color={CLUB.navy} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.48, 0.46]} rotation={[0.75, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.02, 20]} />
          <meshStandardMaterial color={CLUB.gold} metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={CLUB.red} />
        </mesh>
      </group>
    </group>
  );
};
