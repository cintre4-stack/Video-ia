import { VOICE_FRAMES } from "./voiceover.generated";

/** Frames between scene start and the voice starting. */
export const VOICE_LEAD = 8;
const VOICE_TAIL = 14;
const fit = (base: number, voice: number) => Math.max(base, VOICE_LEAD + voice + VOICE_TAIL);

export type StepId = "intro" | "sofrito" | "carne" | "tomate" | "bechamel" | "montaje" | "horno" | "final";

export const STEPS: { id: StepId; voice: keyof typeof VOICE_FRAMES; frames: number }[] = [
  { id: "intro", voice: "s01", frames: fit(120, VOICE_FRAMES.s01) },
  { id: "sofrito", voice: "s02", frames: fit(180, VOICE_FRAMES.s02) },
  { id: "carne", voice: "s03", frames: fit(160, VOICE_FRAMES.s03) },
  { id: "tomate", voice: "s04", frames: fit(180, VOICE_FRAMES.s04) },
  { id: "bechamel", voice: "s05", frames: fit(180, VOICE_FRAMES.s05) },
  { id: "montaje", voice: "s06", frames: fit(190, VOICE_FRAMES.s06) },
  { id: "horno", voice: "s07", frames: fit(180, VOICE_FRAMES.s07) },
  { id: "final", voice: "s08", frames: fit(220, VOICE_FRAMES.s08) },
];

export const STEP_FROM: Record<StepId, number> = (() => {
  const out = {} as Record<StepId, number>;
  let acc = 0;
  for (const s of STEPS) {
    out[s.id] = acc;
    acc += s.frames;
  }
  return out;
})();

export const STEP_FRAMES = Object.fromEntries(STEPS.map((s) => [s.id, s.frames])) as Record<StepId, number>;

export const REEL_LASAGNA_FRAMES = STEPS.reduce((a, s) => a + s.frames, 0);
