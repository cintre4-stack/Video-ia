import { VOICE_FRAMES } from "./voiceover.generated";

const TAIL = 20;
const MIN = 75;
const len = (f: number) => Math.max(MIN, f + TAIL);

export const SCENE_FRAMES = {
  hook: len(VOICE_FRAMES.s01),
  comments: len(VOICE_FRAMES.s02) + 40,
  likes: len(VOICE_FRAMES.s03),
  why: len(VOICE_FRAMES.s04),
  piojo: len(VOICE_FRAMES.s05),
  neymar: len(VOICE_FRAMES.s06),
  yamal: len(VOICE_FRAMES.s07) + 30,
};

const starts: Record<keyof typeof SCENE_FRAMES, number> = {} as never;
let acc = 0;
for (const k of Object.keys(SCENE_FRAMES) as (keyof typeof SCENE_FRAMES)[]) {
  starts[k] = acc;
  acc += SCENE_FRAMES[k];
}
export const SCENE_START = starts;

export const FC_STUART_FRAMES = acc;
