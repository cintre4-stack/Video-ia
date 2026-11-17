import { useThree } from "@react-three/fiber";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FLY } from "./timeline";

type V3 = [number, number, number];
/** Each shot drifts from `from` to `to` while looking at `look`. */
export type Shot = { from: V3; to: V3; look: V3; fov: number };
export type CameraScene = { id: string; start: number; dur: number };

export const SHOTS_EP1: Record<string, Shot> = {
  hook: { from: [0, 2.3, 7.6], to: [0, 2.2, 6.3], look: [0, 2.05, 2], fov: 42 },
  cancha: { from: [3, 5, 9.5], to: [1.5, 6.5, 10.5], look: [0, 0.5, -10], fov: 50 },
  reglas: { from: [0, 2.2, 7.6], to: [0, 2.2, 7.0], look: [0, 2.45, 2], fov: 45 },
  porterias: { from: [2.5, 2.8, -10], to: [1.2, 2.4, -12.5], look: [0, 1.2, -21.8], fov: 48 },
  cesped: { from: [8, 11, 5], to: [-3, 12, 5], look: [0, 0, -10], fov: 52 },
  focos: { from: [-1, 1.4, -8], to: [-2, 1.3, -10], look: [-9.8, 7.2, -21], fov: 62 },
  vestuario: { from: [-5, 2.4, -2.5], to: [-6, 2.2, -4], look: [-13, 1.6, -9], fov: 50 },
  grada: { from: [4.5, 2.8, -1.5], to: [5.5, 2.9, -3.5], look: [12.6, 1.9, -10], fov: 52 },
  nombre: { from: [0, 2.3, 7.2], to: [0, 2.2, 5.9], look: [0, 2.2, 2], fov: 42 },
  cta: { from: [0, 2.6, 8.8], to: [0, 4.2, 10.5], look: [0, 2.6, -6], fov: 52 },
};

const lerp = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const ease = Easing.bezier(0.65, 0, 0.35, 1);

/** Drives the default camera from the current frame: slow drift per shot, fast fly between shots. */
export const CameraRig: React.FC<{ shots: Record<string, Shot>; scenes: CameraScene[] }> = ({ shots, scenes }) => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera) as import("three").PerspectiveCamera;
  const index = Math.max(0, scenes.findIndex((s) => frame >= s.start && frame < s.start + s.dur));
  const scene = frame >= scenes[scenes.length - 1].start ? scenes[scenes.length - 1] : scenes[index];
  const sceneIndex = scenes.indexOf(scene);
  const local = frame - scene.start;
  const shotAt = (id: string, t: number) => {
    const s = shots[id];
    return { pos: lerp(s.from, s.to, t), look: s.look, fov: s.fov };
  };
  const drift = Easing.out(Easing.quad)(Math.min(1, local / scene.dur));
  let { pos, look, fov } = shotAt(scene.id, drift);

  if (sceneIndex > 0 && local < FLY) {
    const prev = scenes[sceneIndex - 1];
    const a = shotAt(prev.id, 1);
    const t = ease(interpolate(local, [0, FLY], [0, 1]));
    // Arc slightly upward mid-flight for a drone feel.
    const lift = Math.sin(t * Math.PI) * 1.5;
    const p = lerp(a.pos, pos, t);
    pos = [p[0], p[1] + lift, p[2]];
    look = lerp(a.look, look, t);
    fov = a.fov + (fov - a.fov) * t;
  }
  // Opening shot: punch-in during the first frames.
  if (sceneIndex === 0) {
    const punch = interpolate(local, [0, 10], [2.5, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    pos = [pos[0], pos[1], pos[2] + punch];
  }
  // Tiny handheld shake.
  const shake = 0.025;
  camera.position.set(pos[0] + Math.sin(frame * 0.21) * shake, pos[1] + Math.sin(frame * 0.17 + 1) * shake, pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  if (camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  return null;
};
