import { CoachState, Episode, Pose, REST, still } from "./episode";
import { sceneAt, sceneById, SceneId, upgradeAt, voiceLevel } from "./timeline";

const poseFor = (id: SceneId, local: number, f: number): Pose => {
  const s = Math.sin;
  switch (id) {
    case "hook":
      // Waves, then points straight at the viewer.
      return local < 62
        ? { ...REST, lz: -0.55, rz: 2.5 + 0.35 * s(f * 0.55), brow: 0.25 }
        : { ...REST, lz: -0.55, rz: 0.15, rx: -1.45, brow: 0.3 };
    case "cancha":
      // Turns toward the pitch and points at it, then shakes head.
      return { ...REST, turn: local < 20 ? 0 : 0.9, rz: 0.5, rx: -1.35, lz: -0.45, brow: -0.35 };
    case "reglas":
      // Open arms, then one fist up for "¡diez dólares!".
      return local < 116
        ? { ...REST, lz: -1.15 - 0.1 * s(f * 0.3), rz: 1.15 + 0.1 * s(f * 0.3), lx: -0.3, rx: -0.3, brow: 0.2 }
        : { ...REST, lz: -0.6, rz: 2.8 + 0.12 * s(f * 0.9), brow: 0.35 };
    case "nombre":
      return local < 98
        ? { ...REST, lz: -0.25, lx: -1.1, rz: 0.25, rx: -1.1, brow: 0.1 }
        : { ...REST, lz: -2.6 - 0.15 * s(f * 0.6), rz: 2.6 + 0.15 * s(f * 0.6), brow: 0.4 };
    case "cta":
      return { ...REST, lz: -2.7 - 0.25 * s(f * 0.7), rz: 2.7 + 0.25 * s(f * 0.7), brow: 0.4 };
    default:
      // Off-camera during the price tour: a proud thumbs up.
      return { ...REST, rz: 0.4, rx: -1.0, brow: 0.2 };
  }
};

/** Coach acting for episode 1, scene by scene. */
const coach = (frame: number): CoachState => {
  const { scene, local } = sceneAt(frame);
  return still(poseFor(scene.id, local, frame), {
    // Big jumps at the end, head shake on "da pena", whisper lean on "y lo mejor".
    jump: scene.id === "cta" ? Math.abs(Math.sin(local * 0.22)) * 0.45 : 0,
    headShake: scene.id === "cancha" && local > 140 ? Math.sin(local * 0.6) * 0.25 : 0,
    headTilt: scene.id === "hook" && local > 62 ? -0.12 : 0,
    lean: scene.id === "nombre" && local < 98 ? 0.12 : 0,
  });
};

const at = (id: SceneId) => sceneById(id).start + upgradeAt(id);

export const EPISODE_1: Episode = {
  build: { porterias: at("porterias"), cesped: at("cesped"), focos: at("focos"), vestuario: at("vestuario"), grada: at("grada") },
  partyAt: sceneById("cta").start,
  coach,
  voice: voiceLevel,
};

