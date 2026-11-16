import { VOICE_FRAMES } from "./voiceover.generated";

export type LineId = keyof typeof VOICE_FRAMES;

export const VOICE_LEAD = 6;
const VOICE_TAIL = 12;
/** transition length between scenes */
export const T = 8;

const fit = (base: number, id: LineId) =>
  Math.max(base, VOICE_LEAD + VOICE_FRAMES[id] + VOICE_TAIL);

/**
 * Local frame where a given fraction of a line has been spoken.
 * Fractions are estimated from the text, so visuals land near the words
 * whichever TTS engine produced the audio.
 */
export const cue = (id: LineId, fraction: number) =>
  Math.round(VOICE_LEAD + VOICE_FRAMES[id] * fraction);

export const SCENE_IDS = [
  "s01",
  "s02",
  "s03",
  "s04",
  "s05",
  "s06",
  "s07",
  "s08",
  "s09",
  "s10",
] as const;

export const SCENE_FRAMES: Record<(typeof SCENE_IDS)[number], number> = {
  s01: fit(160, "s01"),
  s02: fit(170, "s02"),
  s03: fit(180, "s03"),
  s04: fit(170, "s04"),
  s05: fit(170, "s05"),
  s06: fit(170, "s06"),
  s07: fit(200, "s07"),
  s08: fit(190, "s08"),
  s09: fit(210, "s09"),
  s10: fit(200, "s10") + 20,
};

/** Absolute start frame of each scene (transitions overlap scenes by T). */
export const SCENE_START = SCENE_IDS.reduce(
  (acc, id, i) => {
    acc[id] =
      i === 0 ? 0 : acc[SCENE_IDS[i - 1]] + SCENE_FRAMES[SCENE_IDS[i - 1]] - T;
    return acc;
  },
  {} as Record<(typeof SCENE_IDS)[number], number>,
);

export const REEL_CERVEZA_FRAMES = SCENE_START.s10 + SCENE_FRAMES.s10;
