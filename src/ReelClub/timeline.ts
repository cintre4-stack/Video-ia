import { VOICE_ENV } from "./envelope.generated";

export const FPS = 30;
/** The narration track starts this many frames into the reel (scene 1 has a short run-up). */
export const LEAD = 6;
/** Frames the camera takes to fly from one shot to the next. */
export const FLY = 16;

export type SceneId =
  | "hook"
  | "cancha"
  | "reglas"
  | "porterias"
  | "cesped"
  | "focos"
  | "vestuario"
  | "grada"
  | "nombre"
  | "cta";

/**
 * One narration track (ElevenLabs, voz.mp3). `a`/`end` are the seconds in that track where the
 * scene's line starts/ends; `up` is the local frame at which the facility is rebuilt, timed so
 * the price lands on the spoken price. Scene n starts at frame a*30, the track plays from LEAD.
 */
const SCENE_DEFS: { id: SceneId; a: number; end: number; up: number; caption: string }[] = [
  { id: "hook", a: 0.0, end: 3.12, up: 0, caption: "¡Oye, tú! Sí, TÚ. ¡Necesito tu AYUDA!" },
  { id: "cancha", a: 3.71, end: 9.29, up: 0, caption: "Estoy fundando mi propio CLUB... pero mira esta cancha. Da PENA." },
  { id: "reglas", a: 9.83, end: 15.55, up: 0, caption: "Cada LIKE es $1. ¡Y cada COMENTARIO, $10!" },
  { id: "porterias", a: 15.83, end: 17.75, up: 30, caption: "Porterías nuevas: $100" },
  { id: "cesped", a: 18.05, end: 19.8, up: 23, caption: "Césped de verdad: $400" },
  { id: "focos", a: 20.13, end: 22.36, up: 37, caption: "Focos para jugar de noche: $300" },
  { id: "vestuario", a: 22.58, end: 25.52, up: 56, caption: "Vestuario con duchas calientes: $600" },
  { id: "grada", a: 25.78, end: 28.26, up: 38, caption: "Y una grada para TI: ¡$1.000!" },
  { id: "nombre", a: 28.65, end: 33.13, up: 0, caption: "Y lo mejor... el comentario con MÁS LIKES... ¡será el NOMBRE del equipo!" },
  { id: "cta", a: 33.5, end: 35.79, up: 0, caption: "¡COMENTA YA! Nos vemos en la cancha." },
];
/** Hold after the last word before the reel ends. */
const END_HOLD = 100;

export type Scene = (typeof SCENE_DEFS)[number] & { start: number; dur: number; index: number; vlen: number };

export const SCENES: Scene[] = SCENE_DEFS.map((s, index) => {
  const start = Math.round(s.a * FPS);
  const next = SCENE_DEFS[index + 1];
  const dur = next ? Math.round(next.a * FPS) - start : END_HOLD;
  return { ...s, start, dur, index, vlen: Math.round((s.end - s.a) * FPS) };
});

export const REEL_CLUB_FRAMES = SCENES.reduce((a, s) => a + s.dur, 0);

/** Local frame (inside its scene) of a moment `t` seconds into the narration track. */
export const voiceFrame = (id: SceneId, t: number) => Math.round((t - sceneById(id).a) * FPS) + LEAD;

export const sceneById = (id: SceneId) => SCENES.find((s) => s.id === id)!;

export const sceneAt = (frame: number) => {
  const scene = SCENES.find((s) => frame >= s.start && frame < s.start + s.dur) ?? SCENES[SCENES.length - 1];
  return { scene, local: frame - scene.start };
};

/** 0..1 loudness of the coach's voice at a global frame (drives the mouth). */
export const voiceLevel = (frame: number) => VOICE_ENV.voz?.[frame - LEAD] ?? 0;

/** Club facilities and their price tags, in the order they get upgraded. */
export const ITEMS = [
  { scene: "porterias", label: "PORTERÍAS NUEVAS", price: 100 },
  { scene: "cesped", label: "CÉSPED DE VERDAD", price: 400 },
  { scene: "focos", label: "FOCOS NOCTURNOS", price: 300 },
  { scene: "vestuario", label: "VESTUARIO + DUCHAS", price: 600 },
  { scene: "grada", label: "GRADA PARA TI", price: 1000 },
] as const satisfies readonly { scene: SceneId; label: string; price: number }[];

export const GOAL_TOTAL = ITEMS.reduce((a, i) => a + i.price, 0);

/** Frame (inside its scene) at which an item is rebuilt and its price pops. */
export const upgradeAt = (id: SceneId) => sceneById(id).up;

export const money = (n: number) => "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
