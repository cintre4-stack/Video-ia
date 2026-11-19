import { VOICE_FRAMES } from "./voiceover.generated";

export const VOICE_LEAD = 6;
const VOICE_TAIL = 10;
/** Transition overlap between scenes (frames). */
export const T = 8;

const fit = (base: number, voice: number) => Math.max(base, VOICE_LEAD + voice + VOICE_TAIL);

/** "Rebobinemos" lands in the last third of line s01. */
export const HOOK_REWIND = VOICE_LEAD + Math.round(VOICE_FRAMES.s01 * 0.66);
/** "...y roban la copa" is the last ~30% of line s02. */
export const THEFT_AT = VOICE_LEAD + Math.round(VOICE_FRAMES.s02 * 0.7);
/** "...y nada." closes line s03. */
export const NADA_AT = VOICE_LEAD + Math.round(VOICE_FRAMES.s03 * 0.82);
/** Line s06b ("¡Es la Copa del Mundo!") starts as the paper bursts. */
export const REVEAL_AT = VOICE_LEAD + VOICE_FRAMES.s06a + 4;

export const SCENE_FRAMES = {
  hook: fit(HOOK_REWIND + 30, VOICE_FRAMES.s01),
  theft: fit(THEFT_AT + 40, VOICE_FRAMES.s02),
  ransom: fit(NADA_AT + 28, VOICE_FRAMES.s03),
  walk: fit(100, VOICE_FRAMES.s04),
  sniff: fit(84, VOICE_FRAMES.s05),
  reveal: Math.max(REVEAL_AT + 60, REVEAL_AT + VOICE_FRAMES.s06b + 20),
  hero: fit(72, VOICE_FRAMES.s07),
  final: fit(96, VOICE_FRAMES.s08),
  banquet: fit(90, VOICE_FRAMES.s09),
  cta: fit(150, VOICE_FRAMES.s10),
};

export const REEL_PICKLES_FRAMES =
  Object.values(SCENE_FRAMES).reduce((a, b) => a + b, 0) - (Object.keys(SCENE_FRAMES).length - 1) * T;
