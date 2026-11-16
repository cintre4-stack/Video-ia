import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./theme";
import { Chibi, GemCharacter, Loupe, Pedestal, Sparkle, Stage } from "./Toon3D";
import { Backdrop, Captions, Chip, Counter, PriceTag, Small, Title } from "./Ui";
import { LINES, VOICE_LEAD, wordAt } from "./timeline";

type SceneProps = { voice: number };

/** Gem feet sit 1.38 units below its center (at scale 1). */
const FOOT = 1.38;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lerp = (f: number, a: number, b: number, from: number, to: number) => interpolate(f, [a, b], [from, to], clamp);

const Caps: React.FC<{ id: keyof typeof LINES; voice: number }> = ({ id, voice }) => (
  <Captions text={LINES[id]} from={VOICE_LEAD} dur={voice} />
);

/* 1 · Gancho: dos diamantes idénticos, uno vale x10 ------------------ */
export const SceneHook: React.FC<SceneProps> = ({ voice }) => {
  const frame = useCurrentFrame();
  const tags = wordAt("s01", voice, "uno");
  const why = wordAt("s01", voice, "¿Por");
  const z = lerp(frame, 0, 140, 12.5, 11.2);
  const after = frame >= tags;
  const s = 0.82;
  const y = 0.35;
  return (
    <AbsoluteFill>
      <Backdrop top="#2A0F45" bottom={C.bg} glow="#7A3DB8" />
      <Stage camera={[0, 0.6, z]}>
        <Pedestal position={[-1.12, y - FOOT * s, 0]} />
        <Pedestal position={[1.12, y - FOOT * s, 0]} />
        <GemCharacter
          position={[-1.12, y, 0]}
          scale={s}
          look={after ? [0, 0.3] : [1, 0]}
          mood={after ? "smug" : "neutral"}
          pose={after ? "wave" : "idle"}
        />
        <GemCharacter
          position={[1.12, y, 0]}
          scale={s}
          seed={4}
          look={after ? [-1, 0] : [-1, 0]}
          mood={frame >= why ? "worried" : after ? "shock" : "neutral"}
          sweat={frame >= why}
        />
        <Sparkle position={[-1.7, 1.2, 1]} seed={1} />
        <Sparkle position={[1.6, 1.0, 1]} seed={3} />
        <Sparkle position={[-0.4, 1.4, 1]} seed={5} size={0.25} />
      </Stage>
      {frame < why ? (
        <Title from={3} size={118}>
          ¿IDÉNTICOS?
        </Title>
      ) : (
        <Title from={why} size={140} color={C.gold} shake rotate={3}>
          ¿POR QUÉ?
        </Title>
      )}
      <PriceTag text="x10" from={tags} x={262} y={470} bg={C.gold} rot={-4} />
      <PriceTag text="x1" from={tags + 6} x={818} y={470} bg="#C9C3D6" rot={5} />
      <Caps id="s01" voice={voice} />
    </AbsoluteFill>
  );
};

/* 2 · Carbono puro; el joyero no los distingue ------------------------ */
export const SceneCarbon: React.FC<SceneProps> = ({ voice }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const expert = wordAt("s02", voice, "Ni");
  const walk = spring({ frame: frame - expert + 10, fps, config: { damping: 18 } });
  const scan = Math.sin((frame - expert) * 0.12);
  const s = 0.62;
  return (
    <AbsoluteFill>
      <Backdrop top="#10183A" bottom="#090B1C" glow="#2E4FB8" />
      <Stage camera={[0, 0.4, 12]} rim={["#4C8DFF", "#B05CFF"]}>
        {[-1.05, 1.05].map((x, k) => (
          <group key={x}>
            <GemCharacter position={[x, 1.35, 0]} scale={s} seed={k * 5} look={[-scan, -0.5]} mood="neutral" />
            {/* carbon atoms orbiting */}
            {[0, 1, 2, 3, 4].map((i) => {
              const a = frame * 0.09 + (i / 5) * Math.PI * 2 + k;
              return (
                <mesh key={i} position={[x + Math.cos(a) * 0.95, 1.35 + Math.sin(a * 2) * 0.12, Math.sin(a) * 0.95]}>
                  <sphereGeometry args={[0.12, 16, 12]} />
                  <meshStandardMaterial color="#3A3A4A" roughness={0.3} emissive="#222244" />
                </mesh>
              );
            })}
          </group>
        ))}
        <Chibi
          position={[interpolate(walk, [0, 1], [3.4, 0]), -1.05, 0.8]}
          scale={0.62}
          skin="#E3AE7F"
          hair="#5A5A66"
          shirt="#2E2E44"
          glasses
          mood={frame > expert + 25 ? "worried" : "neutral"}
          pose={frame > expert + 25 ? "scratch" : "hold"}
          look={[scan, 0.8]}
          held={frame > expert + 25 ? undefined : <Loupe />}
          turn={-0.15}
        />
      </Stage>
      <Title from={3} size={104}>
        100% CARBONO
      </Title>
      <Chip from={14} top={395} bg="#C9C3D6" size={46}>
        MISMO BRILLO · MISMA DUREZA
      </Chip>
      {frame > expert + 25 && (
        <div
          style={{
            position: "absolute",
            left: 640,
            top: 820,
            fontFamily: "'Lilita One'",
            fontSize: 150,
            color: C.gold,
            textShadow: "6px 6px 0 #0A0716",
            transform: `rotate(12deg) scale(${spring({ frame: frame - expert - 25, fps })})`,
          }}
        >
          ?
        </div>
      )}
      <Caps id="s02" voice={voice} />
    </AbsoluteFill>
  );
};

/* 3 · Nació hace +1.000 millones de años a 150 km -------------------- */
const Layer: React.FC<{ top: number; bottom: number; color: string; glow?: number }> = ({ top, bottom, color, glow = 0 }) => (
  <mesh position={[0, (top + bottom) / 2, -1]}>
    <boxGeometry args={[12, top - bottom, 1]} />
    <meshStandardMaterial color={color} roughness={0.9} emissive={color} emissiveIntensity={glow} />
  </mesh>
);

const ROCKS: [number, number, number][] = [
  [-1.6, -2.0, 0.4],
  [1.4, -3.4, 0.35],
  [-1.2, -5.0, 0.5],
  [1.7, -6.3, 0.4],
  [-1.8, -7.6, 0.45],
  [1.2, -1.2, 0.3],
];

export const SceneDeep: React.FC<SceneProps> = ({ voice }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const born = wordAt("s03", voice, "Este");
  const km = wordAt("s03", voice, "ciento");
  const camY = lerp(frame, 0, born + 10, 1.2, -8.6);
  const birth = spring({ frame: frame - born - 4, fps, config: { damping: 10 } });
  const gemY = -8.9 + Math.sin(frame * 0.1) * 0.08;
  return (
    <AbsoluteFill>
      <Backdrop top="#7EC8FF" bottom="#2A1206" />
      <Stage camera={[0, camY + 0.3, 11]} target={[0, camY, 0]} rim={["#FF7A2E", "#FFB347"]}>
        {/* sky strip + ground layers */}
        <Layer top={0.3} bottom={0} color="#3FBF5A" />
        <Layer top={0} bottom={-2.6} color="#7A4A2A" />
        <Layer top={-2.6} bottom={-6.2} color="#5A5266" />
        <Layer top={-6.2} bottom={-8.0} color="#8A3A1A" glow={0.15} />
        <Layer top={-8.0} bottom={-14} color="#FF6A1A" glow={0.7} />
        {/* kimberlite pipe */}
        <mesh position={[0, -4.2, -0.9]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.85, 9.0, 24, 1, true]} />
          <meshStandardMaterial color="#56607E" roughness={0.9} />
        </mesh>
        {ROCKS.map(([x, y, r], i) => (
          <mesh key={i} position={[x, y, 0]} rotation={[i, i * 2, 0]}>
            <dodecahedronGeometry args={[r, 0]} />
            <meshStandardMaterial color="#8B8496" flatShading />
          </mesh>
        ))}
        {/* tiny house on the surface for scale */}
        <group position={[1.4, 0.55, 0]}>
          <mesh>
            <boxGeometry args={[0.5, 0.4, 0.4]} />
            <meshStandardMaterial color="#FFF2D6" />
          </mesh>
          <mesh position={[0, 0.35, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.42, 0.3, 4]} />
            <meshStandardMaterial color="#D9483B" />
          </mesh>
        </group>
        <group scale={birth}>
          <GemCharacter position={[0, gemY, 0.6]} scale={0.85} mood="happy" pose="cheer" seed={2} glow="#FF8A3A" />
        </group>
        {frame > born && (
          <>
            <Sparkle position={[-1.1, -8.2, 1.5]} seed={0} color="#FFE7A0" />
            <Sparkle position={[1.2, -9.4, 1.5]} seed={2} color="#FFE7A0" />
            <Sparkle position={[0.9, -7.8, 1.5]} seed={4} size={0.25} color="#FFE7A0" />
          </>
        )}
      </Stage>
      {frame < born ? (
        <Title from={3} size={100}>
          SU HISTORIA
        </Title>
      ) : (
        <>
          <Counter from={born} dur={50} a={0} b={1000000000} top={240} prefix="+" size={100} />
          <Small top={360} from={born}>
            AÑOS
          </Small>
        </>
      )}
      {/* depth meter */}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 470,
          width: 18,
          height: 760,
          borderRadius: 9,
          background: "rgba(10,7,22,0.45)",
          border: "4px solid #0A0716",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -4,
            top: -4,
            width: 18,
            height: lerp(frame, 0, born + 10, 0, 760),
            borderRadius: 9,
            background: C.gold,
            border: "4px solid #0A0716",
          }}
        />
      </div>
      <Chip from={km} top={480} left={90} bg={C.red} color={C.white} size={58}>
        -150 KM
      </Chip>
      <Caps id="s03" voice={voice} />
    </AbsoluteFill>
  );
};

/* 4 · Laboratorio: en semanas, sin límite ---------------------------- */
const Machine: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <group position={[-1.1, 0.2, 0]} scale={0.9}>
      <mesh>
        <boxGeometry args={[1.6, 2.2, 1.2]} />
        <meshStandardMaterial color="#E8F1F5" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.25, 0.61]}>
        <torusGeometry args={[0.45, 0.08, 10, 30]} />
        <meshStandardMaterial color="#38E1C8" />
      </mesh>
      <mesh position={[0, 0.25, 0.6]}>
        <circleGeometry args={[0.42, 30]} />
        <meshStandardMaterial color="#B8FFF4" emissive="#38E1C8" emissiveIntensity={0.6 + Math.sin(frame * 0.5) * 0.3} />
      </mesh>
      {[-0.5, -0.25, 0, 0.25, 0.5].map((x, i) => (
        <mesh key={x} position={[x, -0.7, 0.61]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial
            color="#222"
            emissive={["#FF3B5C", "#FFC93C", "#38E1C8"][(i + Math.floor(frame / 6)) % 3]}
            emissiveIntensity={1.2}
          />
        </mesh>
      ))}
      <mesh position={[0.5, 1.35, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh position={[0.5, 1.65, 0]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color="#FF3B5C" emissive="#FF3B5C" emissiveIntensity={frame % 20 < 10 ? 1.5 : 0.2} />
      </mesh>
    </group>
  );
};

export const SceneLab: React.FC<SceneProps> = ({ voice }) => {
  const frame = useCurrentFrame();
  const limit = wordAt("s04", voice, "Y");
  const every = 12;
  const speed = 0.045; // units per frame along the belt
  const n = Math.floor(frame / every) + 1;
  const belt = -0.75;
  return (
    <AbsoluteFill>
      <Backdrop top="#DFF7F3" bottom="#7FCFC4" glow="#FFFFFF" />
      <Stage camera={[-0.05, 0.6, 12]} target={[-0.05, 0, 0]} rim={["#38E1C8", "#7A9CFF"]}>
        {/* floor */}
        <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 8]} />
          <meshStandardMaterial color="#BFE9E2" />
        </mesh>
        <Machine />
        {/* conveyor */}
        <mesh position={[1.3, belt - 0.2, 0.2]}>
          <boxGeometry args={[3.6, 0.3, 1.0]} />
          <meshStandardMaterial color="#2C3E50" />
        </mesh>
        {Array.from({ length: 12 }).map((_, i) => {
          const x = -0.5 + ((i * 0.33 + frame * speed) % 4);
          return (
            <mesh key={i} position={[x, belt - 0.04, 0.71]}>
              <boxGeometry args={[0.08, 0.04, 0.02]} />
              <meshStandardMaterial color="#F5F5F5" />
            </mesh>
          );
        })}
        {[-1.2, -0.6].map((dy) => (
          <mesh key={dy} position={[0.6, belt - 0.7 + dy * 0.3, 0.2]}>
            <boxGeometry args={[0.12, 1.0, 0.12]} />
            <meshStandardMaterial color="#556" />
          </mesh>
        ))}
        {Array.from({ length: Math.min(n, 14) }).map((_, j) => {
          const i = n - 1 - j;
          const age = frame - i * every;
          const pop = Math.min(1, age / 6);
          const x = -0.45 + age * speed;
          if (x > 3.4) return null;
          const s = 0.36;
          return (
            <GemCharacter
              key={i}
              position={[x, belt + FOOT * s + Math.max(0, (1 - pop) * 0.6), 0.3]}
              scale={s * (0.4 + 0.6 * pop)}
              goggles
              seed={i}
              mood={i % 3 === 0 ? "happy" : "neutral"}
              pose="idle"
              palette={["#FFFFFF", "#D8FFF8", "#B8F5EC", "#E8FFFF"]}
              glow="#1FC8B0"
            />
          );
        })}
      </Stage>
      <Title from={3} size={108} color={C.lab}>
        LABORATORIO
      </Title>
      <Chip from={14} top={395} bg={C.white} size={52}>
        HECHO EN SEMANAS
      </Chip>
      {frame >= limit && (
        <>
          <Counter from={limit} dur={60} a={n} b={99999} top={1110} prefix="x" size={110} color={C.white} />
          <Chip from={limit + 6} top={510} bg={C.lab} size={56}>
            ¡SIN LÍMITE!
          </Chip>
        </>
      )}
      <Caps id="s04" voice={voice} />
    </AbsoluteFill>
  );
};

/* 5 · Precio en caída + reventa ------------------------------------- */
export const SceneCrash: React.FC<SceneProps> = ({ voice }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const resell = wordAt("s05", voice, "Intenta");
  const swap = spring({ frame: frame - resell + 4, fps, config: { damping: 16 } });
  const heights = [3.0, 2.3, 1.6, 1.0, 0.45];
  return (
    <AbsoluteFill>
      <Backdrop top="#2A0A1A" bottom="#12060E" glow="#8A1A3A" />
      <Stage camera={[0, 0.4, 12]} rim={["#FF3B5C", "#FF9A3C"]}>
        {/* chart */}
        <group position={[-swap * 6, 0, 0]}>
          {heights.map((h, i) => {
            const grow = lerp(frame, 4 + i * 7, 14 + i * 7, 0.01, 1);
            const hh = h * grow;
            return (
              <mesh key={i} position={[-1.6 + i * 0.8, -1.2 + hh / 2, 0]}>
                <boxGeometry args={[0.6, hh, 0.6]} />
                <meshStandardMaterial color={i === 0 ? "#FF8A9C" : C.red} roughness={0.4} />
              </mesh>
            );
          })}
          {/* falling arrow */}
          <group position={[-0.3, 0.9, 0.6]} rotation={[0, 0, -Math.PI * 0.8]} scale={lerp(frame, 30, 42, 0.01, 1)}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 2.6, 12]} />
              <meshStandardMaterial color="#FFD5DC" emissive="#FF3B5C" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <coneGeometry args={[0.3, 0.6, 16]} />
              <meshStandardMaterial color="#FFD5DC" emissive="#FF3B5C" emissiveIntensity={0.4} />
            </mesh>
          </group>
          <GemCharacter
            position={[1.6, -1.2 + 0.45 + FOOT * 0.42, 0.2]}
            scale={0.42}
            goggles
            mood="worried"
            pose="slump"
            sweat
            palette={["#FFFFFF", "#D8FFF8", "#B8F5EC", "#E8FFFF"]}
            glow="#1FC8B0"
          />
        </group>
        {/* resale shop */}
        <group position={[(1 - swap) * 6, 0, 0]}>
          <mesh position={[0.4, -0.9, 0]}>
            <boxGeometry args={[3.0, 1.0, 1.0]} />
            <meshStandardMaterial color="#8A5A3A" roughness={0.7} />
          </mesh>
          <mesh position={[0.4, -0.38, 0]}>
            <boxGeometry args={[3.1, 0.06, 1.1]} />
            <meshStandardMaterial color="#C98B5A" />
          </mesh>
          <Chibi
            position={[0.9, -1.15, -0.8]}
            scale={0.7}
            skin="#C98B5A"
            hair="#1A1A1A"
            shirt="#FFC93C"
            mood="neutral"
            pose={frame > resell + 14 ? "shakeHead" : "idle"}
            look={[-0.6, -0.4]}
          />
          <GemCharacter
            position={[-0.7, -0.35 + FOOT * 0.5, 0.2]}
            scale={0.5}
            goggles
            mood={frame > resell + 24 ? "sad" : "happy"}
            pose={frame > resell + 24 ? "slump" : "wave"}
            look={[1, 0.3]}
            palette={["#FFFFFF", "#D8FFF8", "#B8F5EC", "#E8FFFF"]}
            glow="#1FC8B0"
          />
        </group>
      </Stage>
      {frame < resell ? (
        <Title from={3} size={110} color={C.red}>
          PRECIO EN CAÍDA
        </Title>
      ) : (
        <Title from={resell} size={110}>
          ¿REVENDERLO?
        </Title>
      )}
      {frame >= resell + 14 && (
        <Chip from={resell + 14} top={560} right={90} bg={C.white} size={56}>
          NO, GRACIAS
        </Chip>
      )}
      <Caps id="s05" voice={voice} />
    </AbsoluteFill>
  );
};

/* 6 · Natural: escaso, guarda su valor, se hereda -------------------- */
export const SceneHeirloom: React.FC<SceneProps> = ({ voice }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rare = wordAt("s06", voice, "escaso,");
  const value = wordAt("s06", voice, "guarda");
  const heir = wordAt("s06", voice, "hereda.");
  const earth = wordAt("s06", voice, "Es");
  const lid = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  const pass = lerp(frame, heir - 6, heir + 18, 0, 1);
  return (
    <AbsoluteFill>
      <Backdrop top="#3A0F2A" bottom="#12060E" glow="#C8507A" />
      <Stage camera={[0, 0.8, 12]} target={[0, 0.2, 0]} rim={["#FFC93C", "#FF5CA8"]}>
        {/* ring box */}
        <group position={[0, -0.6, 0]}>
          <mesh position={[0, -0.35, 0]}>
            <boxGeometry args={[2.0, 0.7, 1.6]} />
            <meshStandardMaterial color={C.velvet} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.02, 0.05]}>
            <boxGeometry args={[1.8, 0.06, 1.4]} />
            <meshStandardMaterial color={C.velvet2} roughness={0.95} />
          </mesh>
          <group position={[0, 0, -0.8]} rotation={[-lid * 1.9, 0, 0]}>
            <mesh position={[0, 0.3, 0.8]}>
              <boxGeometry args={[2.0, 0.6, 1.6]} />
              <meshStandardMaterial color={C.velvet} roughness={0.85} />
            </mesh>
          </group>
          {/* ring */}
          <mesh position={[0, 0.65, 0.1]}>
            <torusGeometry args={[0.6, 0.11, 16, 48]} />
            <meshStandardMaterial color="#FFC93C" metalness={0.35} roughness={0.25} emissive="#B87A00" emissiveIntensity={0.45} />
          </mesh>
        </group>
        <GemCharacter position={[0, 1.15 + Math.sin(frame * 0.08) * 0.05, 0.1]} scale={0.6} crown mood="happy" pose={frame > earth ? "cheer" : "wave"} seed={1} />
        {[[-1.4, 1.5], [1.5, 1.2], [-0.9, 2.3], [1.0, 2.4], [0, -0.1]].map(([x, y], i) => (
          <Sparkle key={i} position={[x, y, 1]} seed={i} color="#FFE7A0" />
        ))}
        {/* abuela y nieta */}
        <Chibi
          position={[-1.45, -2.45, 0.8]}
          scale={0.55}
          hair="#E6E6EE"
          hairStyle="bun"
          shirt="#9B5CFF"
          glasses
          mood="happy"
          pose={pass > 0 ? "point" : "idle"}
          turn={0.4}
        />
        <Chibi
          position={[1.45, -2.45, 0.8]}
          scale={0.5}
          skin="#E3AE7F"
          hair="#5A2E1A"
          hairStyle="long"
          shirt="#FF5CA8"
          mood={pass > 0.5 ? "happy" : "neutral"}
          pose={pass > 0.8 ? "cheer" : "idle"}
          turn={-0.4}
          seed={3}
        />
      </Stage>
      <Title from={3} size={100} color={C.gold}>
        NATURAL
      </Title>
      {frame < earth ? (
        <>
          <Chip from={rare} top={380} left={70} size={50}>
            ESCASO
          </Chip>
          <Chip from={value} top={380} right={70} bg={C.white} size={50}>
            GUARDA SU VALOR
          </Chip>
          <Chip from={heir} top={1130} bg={C.gold} size={54}>
            SE HEREDA
          </Chip>
        </>
      ) : (
        <Chip from={earth} top={385} bg={C.white} size={52}>
          HISTORIA DE LA TIERRA
        </Chip>
      )}
      <Caps id="s06" voice={voice} />
    </AbsoluteFill>
  );
};

/* 7 · CTA ------------------------------------------------------------ */
export const SceneCta: React.FC<SceneProps> = ({ voice }) => {
  const frame = useCurrentFrame();
  const s = 0.78;
  const y = 0.45;
  return (
    <AbsoluteFill>
      <Backdrop top="#2A0F45" bottom={C.bg} glow="#7A3DB8" />
      <Stage camera={[0, 0.6, 11.5]}>
        <Pedestal position={[-1.12, y - FOOT * s, 0]} />
        <Pedestal position={[1.12, y - FOOT * s, 0]} color="#163A40" />
        <GemCharacter position={[-1.12, y, 0]} scale={s} crown mood="happy" pose="wave" seed={1} />
        <GemCharacter
          position={[1.12, y, 0]}
          scale={s}
          goggles
          mood="happy"
          pose="wave"
          seed={6}
          palette={["#FFFFFF", "#D8FFF8", "#B8F5EC", "#E8FFFF"]}
          glow="#1FC8B0"
        />
        <Sparkle position={[-1.8, 1.4, 1]} seed={2} color="#FFE7A0" />
        <Sparkle position={[1.8, 1.4, 1]} seed={4} />
      </Stage>
      <Title from={3} size={104}>
        ¿CUÁL LE DARÍAS?
      </Title>
      <Chip from={10} top={1120} left={70} size={50}>
        NATURAL
      </Chip>
      <Chip from={16} top={1120} right={70} bg={C.lab} size={50}>
        LABORATORIO
      </Chip>
      <Chip from={wordAt("s07", voice, "Te")} top={1560} bg={C.red} color={C.white} size={62}>
        ¡COMENTA!
      </Chip>
      <div style={{ opacity: frame < 2 ? 0 : 1 }}>
        <Caps id="s07" voice={voice} />
      </div>
    </AbsoluteFill>
  );
};
