import guion from "../../guiones/reel-diamante-natural.json";
import { VOICE_FRAMES } from "./voiceover.generated";

export type LineId = keyof typeof VOICE_FRAMES;

export const LINES = Object.fromEntries(guion.lines) as Record<LineId, string>;

export const VOICE_LEAD = 6;
const VOICE_TAIL = 12;
export const T = 10;

/**
 * Frame (inside the scene) when `word` is spoken, using the same
 * length-weighted spread as the captions so beats land with the subtitles.
 */
export const wordAt = (id: LineId, voice: number, word: string) => {
  const words = LINES[id].split(/\s+/).filter(Boolean);
  const weights = words.map((w) => w.replace(/[^\p{L}\d]/gu, "").length + 2 + (/[.?!,]$/.test(w) ? 4 : 0));
  const total = weights.reduce((a, b) => a + b, 0);
  const idx = words.indexOf(word);
  if (idx < 0) throw new Error(`"${word}" not in ${id}`);
  const before = weights.slice(0, idx).reduce((a, b) => a + b, 0);
  return VOICE_LEAD + Math.round((before / total) * voice);
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
