import { CORNER_GOAL } from "./Plays";
import { HOOK_FLIP } from "./Scenes";
import { VOICE_FRAMES } from "./voiceover.generated";

export const VOICE_LEAD = 6;
const VOICE_TAIL = 10;
export const T = 8;

const fit = (base: number, voice: number) => Math.max(base, VOICE_LEAD + voice + VOICE_TAIL);

/** Line 8b starts as Trent takes the corner, so "¡Origi!" lands on the goal. */
export const CORNER_VOICE_B = CORNER_GOAL - 38;

export const SCENE_FRAMES = {
  hook: fit(HOOK_FLIP + 45, VOICE_FRAMES.s01),
  suarez: fit(110, VOICE_FRAMES.s02),
  messi: fit(150, VOICE_FRAMES.s03),
  salah: fit(130, VOICE_FRAMES.s04),
  origi: fit(110, VOICE_FRAMES.s05),
  halftime: fit(120, VOICE_FRAMES.s06),
  wijnaldum: fit(200, VOICE_FRAMES.s07),
  corner: Math.max(CORNER_GOAL + 60, CORNER_VOICE_B + VOICE_FRAMES.s08b + 20),
  ynwa: fit(120, VOICE_FRAMES.s09),
  global: fit(140, VOICE_FRAMES.s10),
  cta: fit(100, VOICE_FRAMES.s11),
};

export const REEL_ANFIELD_FRAMES =
  Object.values(SCENE_FRAMES).reduce((a, b) => a + b, 0) - (Object.keys(SCENE_FRAMES).length - 1) * T;
