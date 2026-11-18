import { VOICE_CUES, VOICE_FRAMES } from "./voiceover.generated";

export const VOICE_LEAD = 6;
const VOICE_TAIL = 12;
export const T = 8;

const fit = (base: number, voice: number, lead = VOICE_LEAD) => Math.max(base, lead + voice + VOICE_TAIL);

/** In the phone-call scene the narrator waits for the ring. */
export const CALL_VOICE_FROM = 26;

type CueName<K extends keyof typeof VOICE_CUES> = keyof (typeof VOICE_CUES)[K];

/** Scene-local frame at which a named moment of the narration is spoken. */
export const cue = <K extends keyof typeof VOICE_CUES>(id: K, name: CueName<K>, lead = VOICE_LEAD): number =>
  lead + (VOICE_CUES[id] as Record<string, number>)[name as string];

export const SCENE_FRAMES = {
  hook: fit(120, VOICE_FRAMES.s01),
  rewind: fit(110, VOICE_FRAMES.s02),
  poll: fit(150, VOICE_FRAMES.s03),
  oneInFive: fit(120, VOICE_FRAMES.s04),
  call: fit(100, VOICE_FRAMES.s05, CALL_VOICE_FROM) + 14,
  queue: fit(110, VOICE_FRAMES.s06),
  money: fit(170, VOICE_FRAMES.s07),
  office: fit(110, VOICE_FRAMES.s08),
  later: fit(110, VOICE_FRAMES.s09),
  numbers: fit(170, VOICE_FRAMES.s10) + 14,
  diagnosis: fit(150, VOICE_FRAMES.s11),
  cta: fit(130, VOICE_FRAMES.s12),
};

export const REEL_GTA_FRAMES =
  Object.values(SCENE_FRAMES).reduce((a, b) => a + b, 0) - (Object.keys(SCENE_FRAMES).length - 1) * T;
