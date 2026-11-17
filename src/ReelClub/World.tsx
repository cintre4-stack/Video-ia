import React, { useMemo } from "react";
import * as THREE from "three";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CLUB } from "./theme";
import { sceneById, SceneId, UPGRADE_AT } from "./timeline";

/* ---------- helpers ---------- */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Global frame at which an item is rebuilt. */
const upgradeFrame = (id: SceneId) => sceneById(id).start + UPGRADE_AT;

/** Bouncy 0→1(+overshoot) build progress of an item. */
const useBuild = (id: SceneId, delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - upgradeFrame(id) - delay, fps, config: { damping: 11, stiffness: 140 } });
};

/** 1→0 as the broken version is cleared away. */
const useGone = (id: SceneId) => {
  const frame = useCurrentFrame();
  return interpolate(frame - upgradeFrame(id), [-2, 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

/** 0 at dusk → 1 at night, as the floodlights are installed. */
export const useNight = () => {
  const frame = useCurrentFrame();
  const t = sceneById("focos").start;
  return interpolate(frame, [t, t + UPGRADE_AT - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

const Mat: React.FC<{ c: string; r?: number; m?: number; e?: string; ei?: number }> = ({ c, r = 0.7, m = 0, e, ei = 0 }) => (
  <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? "#000"} emissiveIntensity={ei} />
);

const canvasTexture = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/* ---------- sky, ground, scenery ---------- */

const Sky: React.FC = () => {
  const night = useNight();
  const dusk = useMemo(
    () =>
      canvasTexture(4, 256, (g) => {
        const gr = g.createLinearGradient(0, 0, 0, 256);
        gr.addColorStop(0, "#2B2D6E");
        gr.addColorStop(0.35, "#7B4A9E");
        gr.addColorStop(0.5, "#F08A5D");
        gr.addColorStop(0.56, "#FFC97A");
        gr.addColorStop(1, "#FFC97A");
        g.fillStyle = gr;
        g.fillRect(0, 0, 4, 256);
      }),
    [],
  );
  const nightTex = useMemo(
    () =>
      canvasTexture(256, 256, (g) => {
        const gr = g.createLinearGradient(0, 0, 0, 256);
        gr.addColorStop(0, "#050A1F");
        gr.addColorStop(0.45, "#12204A");
        gr.addColorStop(0.55, "#2A3A70");
        gr.addColorStop(1, "#2A3A70");
        g.fillStyle = gr;
        g.fillRect(0, 0, 256, 256);
      }),
    [],
  );
  return (
    <>
      <mesh renderOrder={-10}>
        <sphereGeometry args={[90, 32, 16]} />
        <meshBasicMaterial map={dusk} side={THREE.BackSide} fog={false} depthWrite={false} />
      </mesh>
      <mesh scale={0.99} renderOrder={-9}>
        <sphereGeometry args={[90, 32, 16]} />
        <meshBasicMaterial map={nightTex} side={THREE.BackSide} transparent opacity={night} fog={false} depthWrite={false} />
      </mesh>
    </>
  );
};

const Tree: React.FC<{ p: [number, number, number]; s: number }> = ({ p, s }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.6, 0]}>
      <cylinderGeometry args={[0.15, 0.2, 1.2, 8]} />
      <Mat c="#5A3B22" />
    </mesh>
    <mesh position={[0, 2, 0]}>
      <coneGeometry args={[1, 2.4, 10]} />
      <Mat c="#2F6B3A" r={0.9} />
    </mesh>
    <mesh position={[0, 2.9, 0]}>
      <coneGeometry args={[0.75, 1.8, 10]} />
      <Mat c="#3A7F45" r={0.9} />
    </mesh>
  </group>
);

const Scenery: React.FC = () => {
  const trees = useMemo(() => {
    const out: { p: [number, number, number]; s: number }[] = [];
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * Math.PI * 2 + random(`ta${i}`) * 0.1;
      const r = 26 + random(`tr${i}`) * 10;
      out.push({ p: [Math.cos(a) * r, 0, -9 + Math.sin(a) * r * 1.1], s: 1.2 + random(`ts${i}`) * 1.3 });
    }
    return out;
  }, []);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -9]}>
        <planeGeometry args={[200, 200]} />
        <Mat c="#56683A" r={1} />
      </mesh>
      {trees.map((t, i) => (
        <Tree key={i} {...t} />
      ))}
      {/* distant hills */}
      {[-40, -10, 25, 55].map((x, i) => (
        <mesh key={x} position={[x, -6, -75]} scale={[30, 14 + i * 2, 10]}>
          <sphereGeometry args={[1, 24, 12]} />
          <Mat c="#3E5B3C" r={1} />
        </mesh>
      ))}
    </>
  );
};

/* ---------- particles ---------- */

/** Sparkles + dust puff when a facility is rebuilt. */
const Burst: React.FC<{ at: SceneId; pos: [number, number, number]; size?: number }> = ({ at, pos, size = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame - upgradeFrame(at);
  if (t < 0 || t > 40) return null;
  return (
    <group position={pos} scale={size}>
      {Array.from({ length: 26 }, (_, i) => {
        const a = random(`ba${at}${i}`) * Math.PI * 2;
        const up = 0.6 + random(`bu${at}${i}`) * 1.4;
        const sp = 0.08 + random(`bs${at}${i}`) * 0.1;
        const x = Math.cos(a) * sp * t;
        const z = Math.sin(a) * sp * t;
        const y = up * t * 0.12 - 0.006 * t * t + 0.3;
        const s = 0.12 * (1 - t / 40);
        return (
          <mesh key={i} position={[x, Math.max(0.05, y), z]} rotation={[t * 0.3, t * 0.2, i]} scale={s}>
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color={i % 3 === 0 ? CLUB.white : CLUB.gold} />
          </mesh>
        );
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = 0.4 + t * 0.06;
        return (
          <mesh key={`d${i}`} position={[Math.cos(a) * r, 0.3 + t * 0.01, Math.sin(a) * r]} scale={0.3 + t * 0.03}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color="#D9CBB4" transparent opacity={0.3 * (1 - t / 40)} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

const Confetti: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - sceneById("cta").start;
  if (t < 0) return null;
  const colors = [CLUB.red, CLUB.gold, CLUB.white, "#4CC9F0", CLUB.navy];
  return (
    <group>
      {Array.from({ length: 140 }, (_, i) => {
        const x = (random(`cx${i}`) - 0.5) * 16;
        const z = -12 + random(`cz${i}`) * 18;
        const speed = 0.06 + random(`cv${i}`) * 0.05;
        const y = 13 - ((t * speed + random(`cy${i}`) * 13) % 13);
        const sway = Math.sin(t * 0.1 + i) * 0.4;
        return (
          <mesh key={i} position={[x + sway, y, z]} rotation={[t * 0.15 + i, t * 0.1, i]}>
            <planeGeometry args={[0.18, 0.1]} />
            <meshBasicMaterial color={colors[i % colors.length]} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ---------- facilities ---------- */

const FIELD = { w: 16, l: 26, cz: -9 };

const Pitch: React.FC = () => {
  const p = useBuild("cesped");
  const frame = useCurrentFrame();
  const stripes = 13;
  const linesOpacity = clamp01((frame - upgradeFrame("cesped") - 12) / 10);
  const tufts = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        x: (random(`gx${i}`) - 0.5) * FIELD.w,
        z: FIELD.cz + (random(`gz${i}`) - 0.5) * FIELD.l,
        s: 0.15 + random(`gs${i}`) * 0.25,
      })),
    [],
  );
  const gone = useGone("cesped");
  const white = <meshBasicMaterial color="#fff" transparent opacity={linesOpacity * 0.9} />;
  return (
    <group>
      {/* bare dirt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, FIELD.cz]}>
        <planeGeometry args={[FIELD.w + 2, FIELD.l + 2]} />
        <Mat c={CLUB.dirt} r={1} />
      </mesh>
      {/* sad patches, a puddle and weed tufts */}
      {[
        [-3, -4, 2.2],
        [4, -14, 1.6],
        [-5, -18, 1.4],
        [2.5, 0, 1.2],
      ].map(([x, z, r], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.004, z]} scale={gone}>
          <circleGeometry args={[r, 20]} />
          <Mat c={i === 3 ? "#4C5A6E" : CLUB.dirtDark} r={i === 3 ? 0.1 : 1} />
        </mesh>
      ))}
      {tufts.map((t, i) => (
        <mesh key={i} position={[t.x, t.s / 2, t.z]} scale={[1, gone, 1]}>
          <coneGeometry args={[t.s * 0.5, t.s, 5]} />
          <Mat c="#A7A65A" r={1} />
        </mesh>
      ))}
      {/* new turf rolls out stripe by stripe, from the camera end */}
      {Array.from({ length: stripes }, (_, i) => {
        const s = clamp01(p * stripes * 1.15 - i);
        if (s <= 0) return null;
        const len = FIELD.l / stripes;
        return (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.008, 4 - len * i - (len * s) / 2]}
            scale={[1, s, 1]}
          >
            <planeGeometry args={[FIELD.w, len]} />
            <Mat c={i % 2 ? CLUB.grass1 : CLUB.grass2} r={0.95} />
          </mesh>
        );
      })}
      {/* white lines */}
      {linesOpacity > 0 && (
        <group position={[0, 0.015, FIELD.cz]}>
          {[
            [0, FIELD.l / 2 - 0.05, FIELD.w, 0.1],
            [0, -FIELD.l / 2 + 0.05, FIELD.w, 0.1],
            [0, 0, FIELD.w, 0.1],
            [-FIELD.w / 2 + 0.05, 0, 0.1, FIELD.l],
            [FIELD.w / 2 - 0.05, 0, 0.1, FIELD.l],
            [0, -FIELD.l / 2 + 2.5, 7, 0.1],
            [-3.5, -FIELD.l / 2 + 1.25, 0.1, 2.5],
            [3.5, -FIELD.l / 2 + 1.25, 0.1, 2.5],
            [0, FIELD.l / 2 - 2.5, 7, 0.1],
            [-3.5, FIELD.l / 2 - 1.25, 0.1, 2.5],
            [3.5, FIELD.l / 2 - 1.25, 0.1, 2.5],
          ].map(([x, z, w, l], i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, z]}>
              <planeGeometry args={[w, l]} />
              {white}
            </mesh>
          ))}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.1, 2.2, 48]} />
            {white}
          </mesh>
        </group>
      )}
    </group>
  );
};

const netTexture = () =>
  canvasTexture(128, 128, (g) => {
    g.clearRect(0, 0, 128, 128);
    g.strokeStyle = "rgba(255,255,255,0.95)";
    g.lineWidth = 6;
    g.strokeRect(0, 0, 128, 128);
  });

const GOAL = { w: 5, h: 2, d: 1.3, z: -21.8 };

const Goal: React.FC = () => {
  const p = useBuild("porterias");
  const gone = useGone("porterias");
  const nets = useMemo(
    () =>
      [
        [16, 7],
        [16, 4],
        [4, 7],
      ].map(([rx, ry]) => {
        const t = netTexture();
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(rx, ry);
        return t;
      }),
    [],
  );
  const netMat = (k: number) => (
    <meshBasicMaterial map={nets[k]} transparent side={THREE.DoubleSide} depthWrite={false} />
  );
  const post = (x: number) => (
    <mesh position={[x, GOAL.h / 2, 0]}>
      <cylinderGeometry args={[0.07, 0.07, GOAL.h, 16]} />
      <Mat c="#fff" r={0.25} />
    </mesh>
  );
  return (
    <group position={[0, 0, GOAL.z]}>
      {/* old rusty goal: leaning, no net, crossbar hanging */}
      {gone > 0 && (
        <group scale={[1, gone, 1]}>
          <mesh position={[-2.2, 0.8, 0]} rotation={[0, 0, 0.12]}>
            <cylinderGeometry args={[0.06, 0.06, 1.6, 8]} />
            <Mat c={CLUB.rust} />
          </mesh>
          <mesh position={[2.3, 0.6, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
            <Mat c={CLUB.rust} />
          </mesh>
          <mesh position={[0.2, 1.1, 0]} rotation={[0, 0, Math.PI / 2 + 0.22]}>
            <cylinderGeometry args={[0.05, 0.05, 4.4, 8]} />
            <Mat c={CLUB.rust} />
          </mesh>
          <mesh position={[1.4, 0.18, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.13, 10, 20]} />
            <Mat c="#222" r={0.9} />
          </mesh>
        </group>
      )}
      {/* new goal with net pops up */}
      {p > 0.001 && (
        <group scale={[p, p, p]}>
          {post(-GOAL.w / 2)}
          {post(GOAL.w / 2)}
          <mesh position={[0, GOAL.h, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, GOAL.w + 0.14, 16]} />
            <Mat c="#fff" r={0.25} />
          </mesh>
          <mesh position={[0, GOAL.h / 2, -GOAL.d]}>
            <planeGeometry args={[GOAL.w, GOAL.h]} />
            {netMat(0)}
          </mesh>
          <mesh position={[0, GOAL.h, -GOAL.d / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[GOAL.w, GOAL.d]} />
            {netMat(1)}
          </mesh>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[(sd * GOAL.w) / 2, GOAL.h / 2, -GOAL.d / 2]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[GOAL.d, GOAL.h]} />
              {netMat(2)}
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

const glowTexture = () =>
  canvasTexture(256, 256, (g) => {
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, "rgba(255,250,225,1)");
    gr.addColorStop(0.2, "rgba(255,240,200,0.55)");
    gr.addColorStop(0.5, "rgba(255,230,180,0.15)");
    gr.addColorStop(1, "rgba(255,230,180,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
  });

const TOWERS: [number, number][] = [
  [-9.8, 3],
  [9.8, 3],
  [-9.8, -21],
  [9.8, -21],
];

const Floodlights: React.FC = () => {
  const frame = useCurrentFrame();
  const gone = useGone("focos");
  const glow = useMemo(glowTexture, []);
  const t0 = upgradeFrame("focos");
  return (
    <>
      {TOWERS.map(([x, z], i) => {
        const p = spring({ frame: frame - t0 - i * 3, fps: 30, config: { damping: 12, stiffness: 120 } });
        // Lights switch on one by one with a flicker after the towers rise.
        const on = frame - t0 - 14 - i * 4;
        const lit = on < 0 ? 0 : on < 6 ? (on % 2 === 0 ? 1 : 0.2) : 1;
        const face = Math.atan2(-x, FIELD.cz - z);
        return (
          <group key={i} position={[x, 0, z]}>
            {/* old wooden pole with one sad bulb */}
            {gone > 0 && i % 2 === 0 && (
              <group scale={[1, gone, 1]} rotation={[0, 0, x > 0 ? -0.15 : 0.15]}>
                <mesh position={[0, 1.5, 0]}>
                  <cylinderGeometry args={[0.08, 0.1, 3, 8]} />
                  <Mat c="#6B4A2B" />
                </mesh>
                <mesh position={[0, 3.05, 0]}>
                  <sphereGeometry args={[0.13, 12, 12]} />
                  <Mat c="#C9B27A" e="#C9B27A" ei={0.25} />
                </mesh>
              </group>
            )}
            {p > 0.001 && (
              <group scale={[1, p, 1]} rotation={[0, face, 0]}>
                <mesh position={[0, 4, 0]}>
                  <cylinderGeometry args={[0.13, 0.2, 8, 12]} />
                  <Mat c="#9AA3AE" m={0.6} r={0.35} />
                </mesh>
                <group position={[0, 8.2, 0.2]} rotation={[0.6, 0, 0]}>
                  <mesh>
                    <boxGeometry args={[2, 1.2, 0.25]} />
                    <Mat c="#3D4550" m={0.5} r={0.4} />
                  </mesh>
                  {Array.from({ length: 8 }, (_, k) => (
                    <mesh key={k} position={[-0.72 + (k % 4) * 0.48, k < 4 ? 0.25 : -0.25, 0.14]}>
                      <boxGeometry args={[0.38, 0.38, 0.05]} />
                      <meshStandardMaterial color="#fff" emissive="#FFF6D5" emissiveIntensity={0.2 + lit * 3} />
                    </mesh>
                  ))}
                  {/* light beam */}
                  <mesh position={[0, 0, 6.5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[3.2, 13, 24, 1, true]} />
                    <meshBasicMaterial
                      color="#FFF2C2"
                      transparent
                      opacity={0.12 * lit}
                      fog={false}
                      blending={THREE.AdditiveBlending}
                      depthWrite={false}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                  {/* halo */}
                  <mesh position={[0, 0, 0.4]} scale={0.001 + lit}>
                    <planeGeometry args={[9, 9]} />
                    <meshBasicMaterial map={glow} transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
                  </mesh>
                </group>
                <pointLight position={[0, 7.5, 1.5]} intensity={lit * 90} distance={30} decay={1.4} color="#FFF3D6" />
              </group>
            )}
          </group>
        );
      })}
    </>
  );
};

const signTexture = () =>
  canvasTexture(512, 128, (g) => {
    g.fillStyle = CLUB.navy;
    g.fillRect(0, 0, 512, 128);
    g.fillStyle = "#fff";
    g.font = "bold 72px sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("VESTUARIO", 256, 68);
  });

const LockerRoom: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useBuild("vestuario");
  const gone = useGone("vestuario");
  const sign = useMemo(signTexture, []);
  const steamT = frame - upgradeFrame("vestuario");
  return (
    <group position={[-13, 0, -9]} rotation={[0, Math.PI / 2, 0]}>
      {/* old shack */}
      {gone > 0 && (
        <group scale={[1, gone, 1]} rotation={[0, 0, 0.04]}>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[3.6, 2, 2.6]} />
            <Mat c="#7A5A3A" r={1} />
          </mesh>
          <mesh position={[0, 2.15, 0]} rotation={[0.18, 0, 0.08]}>
            <boxGeometry args={[4, 0.08, 3.1]} />
            <Mat c="#8C6A52" m={0.3} />
          </mesh>
          <mesh position={[0.6, 0.75, 1.31]} rotation={[0, 0, 0.12]}>
            <boxGeometry args={[0.8, 1.5, 0.05]} />
            <Mat c="#3A2A1C" />
          </mesh>
          {[
            [-1.1, 1.3],
            [-0.6, 0.5],
          ].map(([x, y], i) => (
            <mesh key={i} position={[x, y, 1.31]}>
              <boxGeometry args={[0.35, 0.25, 0.04]} />
              <Mat c="#111" />
            </mesh>
          ))}
        </group>
      )}
      {/* new locker room */}
      {p > 0.001 && (
        <group scale={[p, p, p]}>
          <mesh position={[0, 1.4, 0]}>
            <boxGeometry args={[5.2, 2.8, 3.4]} />
            <Mat c="#F4F1EA" r={0.6} />
          </mesh>
          <mesh position={[0, 0.25, 0.02]}>
            <boxGeometry args={[5.25, 0.5, 3.45]} />
            <Mat c={CLUB.navy} />
          </mesh>
          <mesh position={[0, 2.9, 0]}>
            <boxGeometry args={[5.8, 0.25, 4]} />
            <Mat c={CLUB.red} r={0.5} />
          </mesh>
          <mesh position={[0, 1.1, 1.71]}>
            <boxGeometry args={[1, 1.9, 0.05]} />
            <Mat c={CLUB.navy} />
          </mesh>
          {[-1.7, 1.7].map((x) => (
            <mesh key={x} position={[x, 1.7, 1.71]}>
              <boxGeometry args={[1, 0.7, 0.05]} />
              <meshStandardMaterial color="#BFE3FF" emissive="#FFE7A8" emissiveIntensity={1.2} />
            </mesh>
          ))}
          <mesh position={[0, 2.45, 1.73]}>
            <planeGeometry args={[2.4, 0.6]} />
            <meshBasicMaterial map={sign} />
          </mesh>
          {/* hot shower steam from the roof */}
          {steamT > 10 &&
            Array.from({ length: 7 }, (_, i) => {
              const tt = (steamT * 0.6 + i * 9) % 60;
              return (
                <mesh key={i} position={[1.6 + Math.sin(tt * 0.1 + i) * 0.2, 3.1 + tt * 0.05, -0.8]} scale={0.25 + tt * 0.012}>
                  <sphereGeometry args={[1, 12, 10]} />
                  <meshStandardMaterial color="#fff" transparent opacity={0.5 * (1 - tt / 60)} depthWrite={false} />
                </mesh>
              );
            })}
        </group>
      )}
    </group>
  );
};

const Fan: React.FC<{ seed: number; color: string; t: number }> = ({ seed, color, t }) => {
  const hop = Math.abs(Math.sin(t * 0.25 + seed)) * 0.25;
  const pop = clamp01((t - seed * 2) / 8);
  return (
    <group position={[0, hop, 0]} scale={pop}>
      <mesh position={[0, 0.35, 0]}>
        <capsuleGeometry args={[0.18, 0.25, 6, 12]} />
        <Mat c={color} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <Mat c={random(`skin${seed}`) > 0.5 ? CLUB.skin : "#B97A50"} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.25, 0.65 + hop * 0.5, 0]} rotation={[0, 0, sd * -2.6]}>
          <capsuleGeometry args={[0.05, 0.25, 4, 8]} />
          <Mat c={color} />
        </mesh>
      ))}
    </group>
  );
};

const Stand: React.FC = () => {
  const frame = useCurrentFrame();
  const gone = useGone("grada");
  const t0 = upgradeFrame("grada");
  const rows = 5;
  const len = 10;
  const ctaT = frame - sceneById("cta").start;
  return (
    <group position={[12.6, 0, -9]} rotation={[0, -Math.PI / 2, 0]}>
      {/* one lonely broken bench */}
      {gone > 0 && (
        <group scale={[1, gone, 1]}>
          <mesh position={[0, 0.45, 0]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[2.4, 0.08, 0.4]} />
            <Mat c="#7A5A3A" />
          </mesh>
          {[-1, 0.9].map((x) => (
            <mesh key={x} position={[x, 0.22, 0]}>
              <boxGeometry args={[0.08, 0.45, 0.35]} />
              <Mat c="#5E4129" />
            </mesh>
          ))}
          <mesh position={[2, 0.2, 0.4]} rotation={[0.3, 0.6, 1.4]}>
            <boxGeometry args={[0.45, 0.06, 0.45]} />
            <Mat c="#E8E2D0" />
          </mesh>
        </group>
      )}
      {Array.from({ length: rows }, (_, r) => {
        const p = spring({ frame: frame - t0 - r * 3, fps: 30, config: { damping: 11, stiffness: 140 } });
        if (p <= 0.001) return null;
        const y = 0.45 * (r + 1);
        const z = -0.9 * r;
        return (
          <group key={r} position={[0, 0, z]} scale={[1, p, 1]}>
            <mesh position={[0, y / 2, 0]}>
              <boxGeometry args={[len, y, 0.9]} />
              <Mat c="#B9BEC6" r={0.8} />
            </mesh>
            {Array.from({ length: 12 }, (_, s) => {
              const x = -len / 2 + 0.45 + s * 0.83;
              const special = r === 0 && s === 6;
              return (
                <group key={s} position={[x, y + 0.15, 0.1]}>
                  <mesh>
                    <boxGeometry args={[0.55, 0.3, 0.45]} />
                    <Mat
                      c={special ? CLUB.gold : [CLUB.red, CLUB.white, CLUB.navy][(s + r) % 3]}
                      e={special ? CLUB.gold : undefined}
                      ei={special ? 0.6 : 0}
                    />
                  </mesh>
                  {ctaT > 0 && (s * 7 + r * 3) % 5 === 0 && (
                    <group position={[0, 0.1, -0.05]}>
                      <Fan seed={s + r * 12} color={[CLUB.red, CLUB.gold, CLUB.navy][(s + r) % 3]} t={ctaT} />
                    </group>
                  )}
                </group>
              );
            })}
          </group>
        );
      })}
      {/* roof canopy */}
      {(() => {
        const p = spring({ frame: frame - t0 - 16, fps: 30, config: { damping: 12, stiffness: 120 } });
        if (p <= 0.001) return null;
        return (
          <group scale={[1, p, 1]}>
            {[-len / 2, len / 2].map((x) => (
              <mesh key={x} position={[x, 2.2, -3.8]}>
                <cylinderGeometry args={[0.08, 0.08, 4.4, 8]} />
                <Mat c="#9AA3AE" m={0.6} />
              </mesh>
            ))}
            <mesh position={[0, 4.4, -2.2]} rotation={[0.18, 0, 0]}>
              <boxGeometry args={[len + 0.6, 0.15, 4.4]} />
              <Mat c={CLUB.navy} />
            </mesh>
          </group>
        );
      })()}
    </group>
  );
};

const Ball: React.FC = () => (
  <group position={[1.1, 0.2, 2.9]}>
    <mesh>
      <sphereGeometry args={[0.2, 24, 24]} />
      <Mat c="#fff" r={0.4} />
    </mesh>
    {[
      [0, 0, 1],
      [0.8, 0.5, 0.3],
      [-0.8, 0.5, 0.3],
      [0, 1, 0],
      [0.5, -0.6, 0.6],
      [-0.5, -0.6, 0.6],
    ].map((d, i) => {
      const v = new THREE.Vector3(...(d as [number, number, number])).normalize().multiplyScalar(0.19);
      return (
        <mesh key={i} position={v} scale={0.07}>
          <sphereGeometry args={[1, 10, 10]} />
          <Mat c="#111" />
        </mesh>
      );
    })}
  </group>
);

/** Lights that move from warm dusk to night. */
const Lighting: React.FC = () => {
  const night = useNight();
  const mix = (a: number, b: number) => a + (b - a) * night;
  return (
    <>
      <hemisphereLight args={["#FFE2C4", "#4A5A35", mix(1.2, 0.35)]} />
      <ambientLight intensity={mix(0.5, 0.35)} color={night > 0.5 ? "#8FA2FF" : "#FFD9B0"} />
      <directionalLight position={[-12, 14, 10]} intensity={mix(2.0, 0.35)} color={night > 0.5 ? "#9DB0FF" : "#FFC48A"} />
      <directionalLight position={[0, 6, 12]} intensity={0.6} color="#fff" />
      <fog attach="fog" args={[night > 0.5 ? "#16244E" : "#E9A07A", 40, 95]} />
    </>
  );
};

export const World: React.FC = () => (
  <>
    <Lighting />
    <Sky />
    <Scenery />
    <Pitch />
    <Goal />
    <Floodlights />
    <LockerRoom />
    <Stand />
    <Ball />
    <Burst at="porterias" pos={[0, 0, GOAL.z]} size={1.6} />
    <Burst at="cesped" pos={[0, 0, -9]} size={2.5} />
    <Burst at="focos" pos={[-9.8, 0, -21]} size={1.5} />
    <Burst at="vestuario" pos={[-13, 0, -9]} size={2} />
    <Burst at="grada" pos={[12.6, 0, -10]} size={2.2} />
    <Confetti />
  </>
);
