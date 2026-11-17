import { createContext, useContext } from "react";

export type Facility = "porterias" | "cesped" | "focos" | "vestuario" | "grada";

/** Arm angles (radians). z swings the arm sideways, x swings it forward (negative = toward camera). */
export type Pose = { lz: number; lx: number; rz: number; rx: number; turn: number; brow: number };
export const REST: Pose = { lz: -0.25, lx: 0, rz: 0.25, rx: 0, turn: 0, brow: 0 };

/** Everything the coach does at one frame: arm pose plus body beats. */
export type CoachState = Pose & { jump: number; headShake: number; headTilt: number; lean: number };
export const still = (p: Pose, extra: Partial<CoachState> = {}): CoachState => ({
  jump: 0,
  headShake: 0,
  headTilt: 0,
  lean: 0,
  ...p,
  ...extra,
});

/** Frame value for a facility that is already built when the reel starts / never gets built. */
export const BUILT = -1e6;
export const NEVER = 1e6;

/**
 * What a reel tells the shared 3D club and coach: when each facility is rebuilt (global frame),
 * when the party (confetti + fans) starts, the coach's acting and the narration loudness.
 */
export type Episode = {
  build: Record<Facility, number>;
  partyAt: number;
  coach: (frame: number) => CoachState;
  voice: (frame: number) => number;
};

const EpisodeContext = createContext<Episode | null>(null);
export const EpisodeProvider = EpisodeContext.Provider;
export const useEpisode = () => {
  const ep = useContext(EpisodeContext);
  if (!ep) throw new Error("Wrap the 3D club in <EpisodeProvider>");
  return ep;
};
