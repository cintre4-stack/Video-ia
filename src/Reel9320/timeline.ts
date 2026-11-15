import { VOICE_FRAMES } from "./voiceover.generated";

/** Frames between scene start and the narrator starting to speak. */
export const VOICE_LEAD = 6;
/** Breathing room after each line before the cut. */
const VOICE_TAIL = 10;
/** Transition overlap between scenes. */
export const T = 8;

const fit = (base: number, voice: number) => Math.max(base, VOICE_LEAD + voice + VOICE_TAIL);

/** Local frame of Agüero's goal in SceneAguero; the "¡Agüeroooo!" line starts here. */
export const AGUERO_GOAL = 150;

export const SCENE_FRAMES = {
  hook: fit(100, VOICE_FRAMES.s01),
  context: fit(150, VOICE_FRAMES.s02),
  rooney: fit(120, VOICE_FRAMES.s03),
  zabaleta: fit(120, VOICE_FRAMES.s04),
  qpr: fit(210, VOICE_FRAMES.s05),
  stoppage: fit(100, VOICE_FRAMES.s06),
  dzeko: fit(120, VOICE_FRAMES.s07),
  sunderland: fit(120, VOICE_FRAMES.s08),
  aguero: Math.max(240, AGUERO_GOAL + VOICE_LEAD + VOICE_FRAMES.s09b + 30),
  table: fit(150, VOICE_FRAMES.s10),
  cta: fit(90, VOICE_FRAMES.s11),
};

export const REEL_9320_FRAMES =
  Object.values(SCENE_FRAMES).reduce((a, b) => a + b, 0) - (Object.keys(SCENE_FRAMES).length - 1) * T;
