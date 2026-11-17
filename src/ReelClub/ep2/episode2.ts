import { CoachState, Episode, NEVER, Pose, REST, still } from "../episode";
import { at, BEATS, scene2, scene2At, SceneId2, voiceLevel2 } from "./timeline";

const poseFor = (id: SceneId2, frame: number): Pose => {
  const s = Math.sin;
  const f = frame;
  switch (id) {
    case "hook":
      // Celebrating with both arms, then points at the viewer.
      return f < at(1.0)
        ? { ...REST, lz: -2.7 - 0.25 * s(f * 0.7), rz: 2.7 + 0.25 * s(f * 0.7), brow: 0.4 }
        : { ...REST, lz: -0.55, rz: 0.15, rx: -1.45, brow: 0.3 };
    case "nombre":
      if (f < at(BEATS.papois)) return { ...REST, lz: -0.25, lx: -1.1, rz: 0.25, rx: -1.1, brow: 0.1 };
      if (f < at(BEATS.thanks)) return { ...REST, lz: -2.6 - 0.15 * s(f * 0.6), rz: 2.6 + 0.15 * s(f * 0.6), brow: 0.4 };
      // Grateful: hand on the heart.
      return { ...REST, lz: -0.3, rz: -0.55, rx: -1.15, brow: 0.25 };
    case "problema":
      // Shrug, palms up.
      return { ...REST, lz: -0.95, lx: -0.6, rz: 0.95, rx: -0.6, brow: -0.45 };
    case "once":
      return f < at(BEATS.titular)
        ? { ...REST, lz: -0.55, rz: 0.15, rx: -1.45, brow: 0.3 }
        : { ...REST, lz: -2.6 - 0.15 * s(f * 0.6), rz: 2.6 + 0.15 * s(f * 0.6), brow: 0.4 };
    case "rival":
      return f < at(BEATS.ascend)
        ? { ...REST, lz: -0.6, rz: 0.2, rx: -1.4, brow: -0.25 }
        : { ...REST, lz: -0.6, rz: 2.8 + 0.12 * s(f * 0.9), brow: 0.35 };
    case "cta":
      return { ...REST, lz: -2.7 - 0.25 * s(f * 0.7), rz: 2.7 + 0.25 * s(f * 0.7), brow: 0.4 };
    default:
      // Off-camera: thumbs up.
      return { ...REST, rz: 0.4, rx: -1.0, brow: 0.2 };
  }
};

const coach = (frame: number): CoachState => {
  const { scene, local } = scene2At(frame);
  const id = scene.id;
  const celebrate = (id === "hook" && frame < at(1.0)) || id === "cta";
  return still(poseFor(id, frame), {
    jump: celebrate ? Math.abs(Math.sin(local * 0.22)) * 0.4 : 0,
    headShake: id === "problema" && local > 20 ? Math.sin(local * 0.6) * 0.25 : 0,
    headTilt: id === "rival" ? -0.1 : 0,
    lean: (id === "nombre" && frame < at(BEATS.papois)) || (id === "rival" && frame < at(BEATS.ascend)) ? 0.12 : 0,
  });
};

/** Episode 2: only the goal gets built (with the $280); the rest stays broken, at dusk. */
export const EPISODE_2: Episode = {
  build: { porterias: at(BEATS.goal) - 6, cesped: NEVER, focos: NEVER, vestuario: NEVER, grada: NEVER },
  partyAt: scene2("cta").start,
  coach,
  voice: voiceLevel2,
};

