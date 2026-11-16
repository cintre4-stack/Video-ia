import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Stage: canvas + lights + animated camera                            */
/* ------------------------------------------------------------------ */

type Vec3 = [number, number, number];

const CameraRig: React.FC<{ position: Vec3; target: Vec3 }> = ({ position, target }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(...position);
    camera.lookAt(...target);
    camera.updateProjectionMatrix();
  }, [camera, position, target]);
  return null;
};

export const Stage: React.FC<{
  children: React.ReactNode;
  camera?: Vec3;
  target?: Vec3;
  fov?: number;
  /** tint of the colored rim lights */
  rim?: [string, string];
}> = ({ children, camera = [0, 0.6, 12], target = [0, 0.2, 0], fov = 35, rim = ["#7A5CFF", "#FF5CA8"] }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: camera, fov }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <CameraRig position={camera} target={target} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#FFFFFF", "#3A2050", 0.7]} />
      <directionalLight position={[4, 8, 6]} intensity={1.6} />
      <pointLight position={[-5, 2, 4]} intensity={40} color={rim[0]} />
      <pointLight position={[5, -1, 4]} intensity={40} color={rim[1]} />
      {children}
    </ThreeCanvas>
  );
};

/* ------------------------------------------------------------------ */
/* Faceted brilliant-cut gem                                           */
/* ------------------------------------------------------------------ */

const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

const useGemGeometry = (palette: string[]) =>
  useMemo(() => {
    // Profile from the culet (bottom tip) up to the table (flat top).
    const pts = [
      new THREE.Vector2(0.001, -1.0),
      new THREE.Vector2(1.0, 0.0),
      new THREE.Vector2(1.0, 0.1),
      new THREE.Vector2(0.62, 0.52),
      new THREE.Vector2(0.001, 0.52),
    ];
    const g = new THREE.LatheGeometry(pts, 10).toNonIndexed();
    const colors: number[] = [];
    const c = new THREE.Color();
    const tris = g.attributes.position.count / 3;
    for (let i = 0; i < tris; i++) {
      c.set(palette[Math.floor(hash(i + 1) * palette.length)]);
      for (let k = 0; k < 3; k++) colors.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [palette]);

const GEM_PALETTE = ["#FFFFFF", "#D8F6FF", "#A9E8FF", "#E7D9FF", "#BFFFF3", "#FFFFFF", "#9FD4FF"];

export const Gem: React.FC<{ palette?: string[]; glow?: string; spin?: number }> = ({
  palette = GEM_PALETTE,
  glow = "#3A6CFF",
  spin = 0,
}) => {
  const geometry = useGemGeometry(palette);
  return (
    <mesh geometry={geometry} rotation={[0, spin, 0]}>
      <meshPhysicalMaterial
        vertexColors
        flatShading
        roughness={0.08}
        metalness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.05}
        iridescence={0.8}
        iridescenceIOR={1.6}
        emissive={glow}
        emissiveIntensity={0.18}
      />
    </mesh>
  );
};

/* ------------------------------------------------------------------ */
/* Cartoon face parts                                                  */
/* ------------------------------------------------------------------ */

export type Mood = "neutral" | "happy" | "sad" | "shock" | "smug" | "worried";

const Eye: React.FC<{ x: number; blink: number; look: [number, number]; mood: Mood; r?: number }> = ({
  x,
  blink,
  look,
  mood,
  r = 0.2,
}) => {
  const lid = mood === "smug" ? 0.55 : mood === "happy" ? 0.35 : 1;
  const sy = Math.max(0.08, blink * lid);
  return (
    <group position={[x, 0, 0]}>
      <mesh scale={[1, sy, 0.7]}>
        <sphereGeometry args={[r, 24, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      <mesh position={[look[0] * r * 0.35, look[1] * r * 0.35 * sy, r * 0.62]} scale={[1, sy, 0.5]}>
        <sphereGeometry args={[r * 0.55, 20, 14]} />
        <meshStandardMaterial color="#14102A" roughness={0.2} />
      </mesh>
      <mesh position={[look[0] * r * 0.35 + r * 0.18, look[1] * r * 0.35 * sy + r * 0.2 * sy, r * 0.85]}>
        <sphereGeometry args={[r * 0.16, 10, 8]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      {(mood === "worried" || mood === "sad") && (
        <mesh position={[0, r * 1.25, r * 0.3]} rotation={[0, 0, x > 0 ? 0.35 : -0.35]}>
          <boxGeometry args={[r * 1.4, r * 0.22, r * 0.2]} />
          <meshStandardMaterial color="#14102A" />
        </mesh>
      )}
    </group>
  );
};

const Mouth: React.FC<{ mood: Mood; talk: number }> = ({ mood, talk }) => {
  const dark = <meshStandardMaterial color="#3A0E2A" roughness={0.5} />;
  if (mood === "shock" || talk > 0.05) {
    const open = mood === "shock" ? 1 : talk;
    return (
      <mesh scale={[0.8 + open * 0.2, 0.35 + open * 0.75, 0.4]}>
        <sphereGeometry args={[0.12, 18, 12]} />
        {dark}
      </mesh>
    );
  }
  const frown = mood === "sad" || mood === "worried";
  const arc = mood === "happy" ? Math.PI * 0.9 : mood === "smug" ? Math.PI * 0.55 : Math.PI * 0.6;
  return (
    <mesh rotation={[0, 0, frown ? Math.PI / 2 - arc / 2 + Math.PI : -Math.PI / 2 - arc / 2]} position={[0, frown ? -0.06 : 0.06, 0]}>
      <torusGeometry args={[0.13, 0.03, 8, 24, arc]} />
      {dark}
    </mesh>
  );
};

/** Blink once every ~2.7s, offset by seed. */
const useBlink = (seed: number) => {
  const frame = useCurrentFrame();
  const t = (frame + seed * 37) % 80;
  return t < 3 ? 0.1 : t < 5 ? 0.5 : 1;
};

/* ------------------------------------------------------------------ */
/* Accessories                                                         */
/* ------------------------------------------------------------------ */

const Crown: React.FC = () => (
  <group position={[0, 0.6, 0]} scale={0.55}>
    <mesh>
      <cylinderGeometry args={[0.55, 0.6, 0.35, 20, 1, true]} />
      <meshStandardMaterial color="#FFC93C" metalness={0.35} roughness={0.25} emissive="#B87A00" emissiveIntensity={0.45} side={THREE.DoubleSide} />
    </mesh>
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2;
      return (
        <group key={i} position={[Math.sin(a) * 0.55, 0.32, Math.cos(a) * 0.55]}>
          <mesh>
            <coneGeometry args={[0.13, 0.35, 8]} />
            <meshStandardMaterial color="#FFC93C" metalness={0.35} roughness={0.25} emissive="#B87A00" emissiveIntensity={0.45} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshStandardMaterial color="#FF3B5C" emissive="#FF3B5C" emissiveIntensity={0.4} />
          </mesh>
        </group>
      );
    })}
  </group>
);

const Goggles: React.FC = () => (
  <group position={[0, 0.16, 0.9]}>
    {[-0.3, 0.3].map((x) => (
      <mesh key={x} position={[x, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.14, 24, 1, true]} />
        <meshStandardMaterial color="#38E1C8" metalness={0.3} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
    ))}
    {[-0.3, 0.3].map((x) => (
      <mesh key={`g${x}`} position={[x, 0, 0.13]}>
        <circleGeometry args={[0.23, 24]} />
        <meshPhysicalMaterial color="#B8FFF4" transparent opacity={0.28} roughness={0} />
      </mesh>
    ))}
    <mesh position={[0, 0, 0.06]}>
      <boxGeometry args={[0.16, 0.06, 0.06]} />
      <meshStandardMaterial color="#1F8F80" />
    </mesh>
    <mesh position={[0, 0, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.98, 0.04, 6, 40]} />
      <meshStandardMaterial color="#1F8F80" />
    </mesh>
  </group>
);

const Glove: React.FC<{ color?: string }> = ({ color = "#FFFFFF" }) => (
  <mesh>
    <sphereGeometry args={[0.16, 16, 12]} />
    <meshStandardMaterial color={color} roughness={0.5} />
  </mesh>
);

/** A capsule limb hanging from its own origin, rotated by `angle` around Z. */
const Limb: React.FC<{ angle: number; length: number; color: string; radius?: number; end?: React.ReactNode }> = ({
  angle,
  length,
  color,
  radius = 0.06,
  end,
}) => (
  <group rotation={[0, 0, angle]}>
    <mesh position={[0, -length / 2, 0]}>
      <capsuleGeometry args={[radius, length, 4, 10]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
    <group position={[0, -length, 0]}>{end}</group>
  </group>
);

/* ------------------------------------------------------------------ */
/* Gem character                                                       */
/* ------------------------------------------------------------------ */

export type GemPose = "idle" | "wave" | "cheer" | "shrug" | "walk" | "slump";

export const GemCharacter: React.FC<{
  position?: Vec3;
  scale?: number;
  mood?: Mood;
  pose?: GemPose;
  talk?: number;
  look?: [number, number];
  crown?: boolean;
  goggles?: boolean;
  seed?: number;
  turn?: number;
  sweat?: boolean;
  palette?: string[];
  glow?: string;
}> = ({
  position = [0, 0, 0],
  scale = 1,
  mood = "neutral",
  pose = "idle",
  talk = 0,
  look = [0, 0],
  crown,
  goggles,
  seed = 0,
  turn = 0,
  sweat,
  palette,
  glow,
}) => {
  const frame = useCurrentFrame() + seed * 13;
  const blink = useBlink(seed);
  const bob = pose === "cheer" ? Math.abs(Math.sin(frame * 0.3)) * 0.35 : Math.sin(frame * 0.1) * 0.05;
  const sway = pose === "walk" ? Math.sin(frame * 0.4) * 0.08 : pose === "slump" ? -0.12 : Math.sin(frame * 0.07) * 0.03;
  const gemSpin = Math.sin(frame * 0.05) * 0.15;

  let armL = 0.5;
  let armR = -0.5;
  if (pose === "wave") {
    armL = 0.4;
    armR = -2.5 + Math.sin(frame * 0.45) * 0.45;
  } else if (pose === "cheer") {
    armL = 2.6 + Math.sin(frame * 0.6) * 0.2;
    armR = -2.6 - Math.sin(frame * 0.6) * 0.2;
  } else if (pose === "shrug") {
    armL = 1.9;
    armR = -1.9;
  } else if (pose === "slump") {
    armL = 0.15;
    armR = -0.15;
  } else {
    armL = 0.5 + Math.sin(frame * 0.1) * 0.06;
    armR = -0.5 - Math.sin(frame * 0.1) * 0.06;
  }
  const legSwing = pose === "walk" ? Math.sin(frame * 0.4) * 0.5 : 0;

  return (
    <group position={[position[0], position[1] + bob, position[2]]} scale={scale} rotation={[0, turn, sway]}>
      <group rotation={[0, gemSpin, 0]}>
        <Gem palette={palette} glow={glow} />
      </group>
      {/* face sits on the girdle, facing camera */}
      <group position={[0, 0.16, 0.86]}>
        <Eye x={-0.3} blink={blink} look={look} mood={mood} />
        <Eye x={0.3} blink={blink} look={look} mood={mood} />
      </group>
      <group position={[0, -0.22, 0.74]} rotation={[-0.5, 0, 0]}>
        <Mouth mood={mood} talk={talk} />
      </group>
      {/* blush */}
      {[-0.52, 0.52].map((x) => (
        <mesh key={x} position={[x, -0.08, 0.78]} scale={[1, 0.55, 0.3]}>
          <sphereGeometry args={[0.1, 12, 8]} />
          <meshStandardMaterial color="#FF8FB8" transparent opacity={0.75} />
        </mesh>
      ))}
      {goggles && <Goggles />}
      {crown && <Crown />}
      {sweat && (
        <mesh position={[0.72, 0.42 - ((frame % 30) / 30) * 0.4, 0.55]} scale={[0.7, 1, 0.7]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color="#7FD3FF" transparent opacity={0.85} />
        </mesh>
      )}
      {/* arms */}
      <group position={[-0.98, 0.02, 0]}>
        <Limb angle={-armL} length={0.55} color="#E8F4FF" end={<Glove />} />
      </group>
      <group position={[0.98, 0.02, 0]}>
        <Limb angle={-armR} length={0.55} color="#E8F4FF" end={<Glove />} />
      </group>
      {/* legs */}
      {[-0.22, 0.22].map((x, i) => (
        <group key={x} position={[x, -0.78, 0]} rotation={[i === 0 ? legSwing : -legSwing, 0, 0]}>
          <mesh position={[0, -0.25, 0]}>
            <capsuleGeometry args={[0.06, 0.4, 4, 10]} />
            <meshStandardMaterial color="#E8F4FF" />
          </mesh>
          <mesh position={[0, -0.52, 0.08]} scale={[1, 0.6, 1.4]}>
            <sphereGeometry args={[0.13, 14, 10]} />
            <meshStandardMaterial color={goggles ? "#1F8F80" : crown ? "#B8860B" : "#6B4CFF"} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Chibi human                                                         */
/* ------------------------------------------------------------------ */

export type ChibiPose = "idle" | "shakeHead" | "scratch" | "hold" | "cheer" | "point";

export const Chibi: React.FC<{
  position?: Vec3;
  scale?: number;
  skin?: string;
  hair?: string;
  hairStyle?: "short" | "bun" | "long";
  shirt?: string;
  mood?: Mood;
  pose?: ChibiPose;
  talk?: number;
  look?: [number, number];
  turn?: number;
  seed?: number;
  glasses?: boolean;
  /** something held in the right hand */
  held?: React.ReactNode;
}> = ({
  position = [0, 0, 0],
  scale = 1,
  skin = "#F2C9A0",
  hair = "#3B2416",
  hairStyle = "short",
  shirt = "#4D7CFF",
  mood = "neutral",
  pose = "idle",
  talk = 0,
  look = [0, 0],
  turn = 0,
  seed = 0,
  glasses,
  held,
}) => {
  const frame = useCurrentFrame() + seed * 17;
  const blink = useBlink(seed + 3);
  const headYaw = pose === "shakeHead" ? Math.sin(frame * 0.5) * 0.5 : Math.sin(frame * 0.05) * 0.08;
  const headRoll = pose === "scratch" ? 0.18 : 0;
  const bob = pose === "cheer" ? Math.abs(Math.sin(frame * 0.3)) * 0.3 : Math.sin(frame * 0.1) * 0.03;

  let armL = 0.35;
  let armR = -0.35;
  if (pose === "scratch") armR = -2.7 + Math.sin(frame * 0.8) * 0.15;
  if (pose === "hold") armR = -1.4;
  if (pose === "point") armR = -1.6;
  if (pose === "cheer") {
    armL = 2.7;
    armR = -2.7;
  }
  if (pose === "shakeHead") {
    armL = 0.3;
    armR = -0.3;
  }

  return (
    <group position={[position[0], position[1] + bob, position[2]]} scale={scale} rotation={[0, turn, 0]}>
      {/* body */}
      <mesh position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.42, 0.45, 6, 16]} />
        <meshStandardMaterial color={shirt} roughness={0.7} />
      </mesh>
      {/* legs */}
      {[-0.2, 0.2].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.08, 0]}>
            <capsuleGeometry args={[0.13, 0.25, 4, 10]} />
            <meshStandardMaterial color="#2A2A44" />
          </mesh>
          <mesh position={[x, -0.1, 0.08]} scale={[1, 0.6, 1.5]}>
            <sphereGeometry args={[0.16, 12, 10]} />
            <meshStandardMaterial color="#1A1A2A" />
          </mesh>
        </group>
      ))}
      {/* arms */}
      <group position={[-0.45, 0.85, 0]}>
        <Limb angle={-armL} length={0.5} color={shirt} radius={0.11} end={<Glove color={skin} />} />
      </group>
      <group position={[0.45, 0.85, 0]}>
        <Limb
          angle={-armR}
          length={0.5}
          color={shirt}
          radius={0.11}
          end={
            <>
              <Glove color={skin} />
              {held}
            </>
          }
        />
      </group>
      {/* head */}
      <group position={[0, 1.75, 0]} rotation={[0, headYaw, headRoll]}>
        <mesh>
          <sphereGeometry args={[0.78, 32, 24]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
        {/* hair cap */}
        <mesh position={[0, 0.16, -0.06]} scale={[1.05, 0.95, 1.05]} rotation={[-0.35, 0, 0]}>
          <sphereGeometry args={[0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
          <meshStandardMaterial color={hair} roughness={0.8} />
        </mesh>
        {hairStyle === "bun" && (
          <mesh position={[0, 0.85, -0.25]}>
            <sphereGeometry args={[0.3, 20, 14]} />
            <meshStandardMaterial color={hair} roughness={0.8} />
          </mesh>
        )}
        {hairStyle === "long" && (
          <mesh position={[0, -0.1, -0.3]} scale={[1.05, 1.1, 0.8]}>
            <sphereGeometry args={[0.8, 24, 16]} />
            <meshStandardMaterial color={hair} roughness={0.8} />
          </mesh>
        )}
        <group position={[0, 0.0, 0.68]}>
          <Eye x={-0.27} blink={blink} look={look} mood={mood} r={0.15} />
          <Eye x={0.27} blink={blink} look={look} mood={mood} r={0.15} />
        </group>
        {glasses && (
          <group position={[0, 0.0, 0.8]}>
            {[-0.27, 0.27].map((x) => (
              <mesh key={x} position={[x, 0, 0]}>
                <torusGeometry args={[0.19, 0.025, 8, 24]} />
                <meshStandardMaterial color="#6A4A2A" metalness={0.5} />
              </mesh>
            ))}
          </group>
        )}
        <group position={[0, -0.33, 0.7]} rotation={[-0.35, 0, 0]}>
          <Mouth mood={mood} talk={talk} />
        </group>
        {[-0.45, 0.45].map((x) => (
          <mesh key={x} position={[x, -0.18, 0.6]} scale={[1, 0.55, 0.3]}>
            <sphereGeometry args={[0.1, 12, 8]} />
            <meshStandardMaterial color="#FF8FA0" transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

export const Pedestal: React.FC<{ position?: Vec3; color?: string }> = ({ position = [0, 0, 0], color = "#2B1846" }) => (
  <group position={position}>
    <mesh position={[0, -0.5, 0]}>
      <cylinderGeometry args={[0.95, 1.05, 1, 32]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
    </mesh>
    <mesh position={[0, 0.02, 0]}>
      <cylinderGeometry args={[1.0, 1.0, 0.06, 32]} />
      <meshStandardMaterial color="#FFC93C" metalness={0.35} roughness={0.25} emissive="#B87A00" emissiveIntensity={0.45} />
    </mesh>
  </group>
);

/** Four-pointed twinkle made of two thin crossed boxes, driven by frame. */
export const Sparkle: React.FC<{ position: Vec3; size?: number; seed?: number; color?: string }> = ({
  position,
  size = 0.35,
  seed = 0,
  color = "#FFFFFF",
}) => {
  const frame = useCurrentFrame();
  const s = Math.max(0, Math.sin(frame * 0.18 + seed * 2.3)) * size;
  return (
    <group position={position} rotation={[0, 0, frame * 0.03 + seed]} scale={s}>
      <mesh>
        <boxGeometry args={[1, 0.08, 0.02]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.08, 1, 0.02]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
};

/** Jeweler's loupe for the hand. */
export const Loupe: React.FC = () => (
  <group position={[0, -0.25, 0.1]}>
    <mesh position={[0, -0.18, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
      <meshStandardMaterial color="#222" />
    </mesh>
    <mesh position={[0, -0.5, 0]}>
      <torusGeometry args={[0.18, 0.04, 8, 24]} />
      <meshStandardMaterial color="#222" />
    </mesh>
    <mesh position={[0, -0.5, 0]}>
      <circleGeometry args={[0.17, 24]} />
      <meshPhysicalMaterial color="#CFF4FF" transparent opacity={0.5} roughness={0} side={THREE.DoubleSide} />
    </mesh>
  </group>
);
