import { GOAL_FRAME } from "../Reel9320/GoalPlay";
import { VOICE_FRAMES } from "./voiceover.generated";

export const VOICE_LEAD = 6;
const VOICE_TAIL = 12;
/** Transition length between scenes. */
export const T = 8;

type Line = keyof typeof VOICE_FRAMES;

/**
 * Local frame inside a scene at which the narration reaches `frac` of line `id`.
 * Beats (goals, stamps) are tied to the voice this way, so swapping the
 * provisional voice for the ElevenLabs one keeps everything in sync.
 */
export const beat = (id: Line, frac: number) => VOICE_LEAD + Math.round(VOICE_FRAMES[id] * frac);

const fit = (base: number, id: Line) => Math.max(base, VOICE_LEAD + VOICE_FRAMES[id] + VOICE_TAIL);

export const HOOK_FLIP = VOICE_LEAD + VOICE_FRAMES.s01 + 4;

/** Wirtz hat-trick: goals tied to "¡Wirtz!", "¡Wirtz otra vez!", "el quinto". */
export const WIRTZ_GOALS = [beat("s09", 0.06), beat("s09", 0.33), beat("s09", 0.9)] as const;
/** Bremen: Boniface on "de penalti", Xhaka on "golazo". */
export const BREMEN_GOALS = [beat("s08", 0.74), beat("s08", 0.97)] as const;
export const LATE_GOAL = beat("s06", 0.4);

export const SCENE_FRAMES = {
  hook: HOOK_FLIP + 50,
  y2002: fit(150, "s02"),
  bayern11: fit(90, "s03"),
  xabi: fit(130, "s04"),
  unbeaten: fit(100, "s05"),
  late: Math.max(fit(130, "s06"), LATE_GOAL + 50),
  bayern30: fit(95, "s07"),
  bremen: Math.max(fit(150, "s08"), BREMEN_GOALS[1] + 48),
  wirtz: Math.max(fit(160, "s09"), WIRTZ_GOALS[2] + 46),
  champions: fit(120, "s10"),
  stats: fit(140, "s11"),
  cta: fit(120, "s12") + 20,
};

export const REEL_LEVERKUSEN_FRAMES =
  Object.values(SCENE_FRAMES).reduce((a, b) => a + b, 0) - (Object.keys(SCENE_FRAMES).length - 1) * T;

export { GOAL_FRAME };
