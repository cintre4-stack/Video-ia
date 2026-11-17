import { VOICE_ENV } from "./envelope.generated";

export const FPS = 30;
/** The narration track starts this many frames into the reel. */
export const LEAD = 6;

export type SceneId2 = "hook" | "porteria" | "nombre" | "problema" | "once" | "rival" | "meta" | "cta";

/**
 * Narration: public/voiceover/club-ep2/voz.mp3 (one track). `a`/`end` = seconds in that track
 * where each line starts/ends. To swap in a real recording, replace voz.mp3, update these
 * anchors and BEATS, and rerun scripts/voice-envelope.py.
 */
const SCENE_DEFS: { id: SceneId2; a: number; end: number; caption: string }[] = [
  { id: "hook", a: 0.0, end: 2.74, caption: "¡Lo LOGRAMOS! Recaudamos $280..." },
  { id: "porteria", a: 3.09, end: 6.13, caption: "...y solo alcanzó para la PORTERÍA. ¡Pero mírala qué BONITA!" },
  { id: "nombre", a: 6.48, end: 11.53, caption: "El equipo ya tiene nombre... ¡LOS PAPOIS! Gracias a @SoyDamiánblox" },
  { id: "problema", a: 11.88, end: 13.77, caption: "Pero hay un problema... NO tengo jugadores." },
  { id: "once", a: 14.12, end: 17.67, caption: "Los primeros 11 COMENTARIOS... ¡serán el ONCE TITULAR!" },
  { id: "rival", a: 18.02, end: 22.47, caption: "Próximo video: vs un equipo de TERCERA DIVISIÓN. ¡A ASCENDER!" },
  { id: "meta", a: 22.82, end: 26.72, caption: "La meta sigue: $2.400 para el club." },
  { id: "cta", a: 27.07, end: 28.55, caption: "¡COMENTA YA y entra al ONCE!" },
];

/** Key words, in seconds of the narration track. */
export const BEATS = {
  goal: 4.1, // "...para la portería"
  papois: 8.84, // "¡Los Papois!"
  thanks: 10.53, // "Gracias a..."
  titular: 15.9, // "¡serán el once titular!"
  ascend: 21.88, // "¡Para ascender!"
  metaNum: 24.69, // "dos mil cuatrocientos"
};

/** Hold after the last word before the reel ends. */
const END_HOLD = 110;

export type Scene2 = (typeof SCENE_DEFS)[number] & { start: number; dur: number; index: number; vlen: number };

export const SCENES2: Scene2[] = SCENE_DEFS.map((s, index) => {
  const start = Math.round(s.a * FPS);
  const next = SCENE_DEFS[index + 1];
  const dur = next ? Math.round(next.a * FPS) - start : END_HOLD;
  return { ...s, start, dur, index, vlen: Math.round((s.end - s.a) * FPS) };
});

export const REEL_EP2_FRAMES = SCENES2.reduce((a, s) => a + s.dur, 0);

export const scene2 = (id: SceneId2) => SCENES2.find((s) => s.id === id)!;

export const scene2At = (frame: number) => {
  const scene = SCENES2.find((s) => frame >= s.start && frame < s.start + s.dur) ?? SCENES2[SCENES2.length - 1];
  return { scene, local: frame - scene.start };
};

/** Global frame of a moment `t` seconds into the narration track. */
export const at = (t: number) => Math.round(t * FPS) + LEAD;

/** Local frame (inside scene `id`) of a moment `t` seconds into the narration track. */
export const localAt = (id: SceneId2, t: number) => at(t) - scene2(id).start;

export const voiceLevel2 = (frame: number) => VOICE_ENV.voz?.[frame - LEAD] ?? 0;

export const RAISED = 280;
export const GOAL = 2400;
