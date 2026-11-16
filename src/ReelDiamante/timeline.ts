import guion from "../../guiones/reel-diamante-natural.json";
import { PHRASES, VOICE_FRAMES } from "./voiceover.generated";

export type LineId = keyof typeof VOICE_FRAMES;

export const LINES = Object.fromEntries(guion.lines) as Record<LineId, string>;

export const VOICE_LEAD = 6;
const VOICE_TAIL = 12;
export const T = 10;

const weight = (w: string) => w.replace(/[^\p{L}\d]/gu, "").length + 2 + (/[.?!,]$/.test(w) ? 3 : 0);

/**
 * Words of a line and the frame (relative to the voice clip) each one starts.
 * Phrase boundaries come from the real take; inside a phrase, words are spread
 * by length.
 */
export const lineWords = (id: LineId): { words: string[]; starts: number[] } => {
  const words: string[] = [];
  const starts: number[] = [];
  for (const [a, b, text] of PHRASES[id]) {
    const ws = text.split(/\s+/).filter(Boolean);
    const wts = ws.map(weight);
    const total = wts.reduce((x, y) => x + y, 0);
    let acc = 0;
    ws.forEach((w, i) => {
      words.push(w);
      starts.push(a + ((b - a) * acc) / total);
      acc += wts[i];
    });
  }
  return { words, starts };
};

/** Frame inside the scene when `word` is spoken (first occurrence). */
export const wordAt = (id: LineId, _voice: number, word: string) => {
  const { words, starts } = lineWords(id);
  const idx = words.indexOf(word);
  if (idx < 0) throw new Error(`"${word}" not in ${id}`);
  return VOICE_LEAD + Math.round(starts[idx]);
};

const fit = (base: number, voice: number) => Math.max(base, VOICE_LEAD + voice + VOICE_TAIL);

export const SCENE_FRAMES = {
  hook: fit(120, VOICE_FRAMES.s01),
  carbon: fit(110, VOICE_FRAMES.s02),
  deep: fit(150, VOICE_FRAMES.s03),
  lab: fit(120, VOICE_FRAMES.s04),
  crash: fit(130, VOICE_FRAMES.s05),
  heirloom: fit(160, VOICE_FRAMES.s06),
  cta: VOICE_LEAD + VOICE_FRAMES.s07 + 45,
};

export const REEL_DIAMANTE_FRAMES =
  Object.values(SCENE_FRAMES).reduce((a, b) => a + b, 0) - (Object.keys(SCENE_FRAMES).length - 1) * T;
