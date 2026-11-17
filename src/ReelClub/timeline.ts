import { VOICE_ENV } from "./envelope.generated";
import { VOICE_FRAMES } from "./voiceover.generated";

export const FPS = 30;
/** Frames between the start of a scene and its voice line. */
export const LEAD = 6;
const TAIL = 10;
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

type VoiceId = keyof typeof VOICE_FRAMES;

/** Order, voice line, minimum length and on-screen caption for each scene. */
const SCENE_DEFS: { id: SceneId; voice: VoiceId; base: number; caption: string }[] = [
  { id: "hook", voice: "s01", base: 80, caption: "¡Oye, tú! Sí, TÚ. ¡Necesito tu AYUDA!" },
  { id: "cancha", voice: "s02", base: 120, caption: "Estoy fundando mi propio CLUB... pero mira esta cancha. Da PENA." },
  { id: "reglas", voice: "s03", base: 160, caption: "Cada LIKE es $1. ¡Y cada COMENTARIO, $10!" },
  { id: "porterias", voice: "s04", base: 80, caption: "Porterías nuevas: $500" },
  { id: "cesped", voice: "s05", base: 75, caption: "Césped de verdad: $2.000" },
  { id: "focos", voice: "s06", base: 80, caption: "Focos para jugar de noche: $1.500" },
  { id: "vestuario", voice: "s07", base: 80, caption: "Vestuario con duchas calientes: $3.000" },
  { id: "grada", voice: "s08", base: 85, caption: "Y una grada para TI: ¡$5.000!" },
  { id: "nombre", voice: "s09", base: 125, caption: "El comentario con MÁS LIKES... ¡será el NOMBRE del equipo!" },
  { id: "cta", voice: "s10", base: 130, caption: "¡COMENTA YA! Nos vemos en la cancha." },
];

export type Scene = (typeof SCENE_DEFS)[number] & { start: number; dur: number; index: number };

export const SCENES: Scene[] = (() => {
  let t = 0;
  return SCENE_DEFS.map((s, index) => {
    const dur = Math.max(s.base, LEAD + VOICE_FRAMES[s.voice] + TAIL);
    const scene = { ...s, start: t, dur, index };
    t += dur;
    return scene;
  });
})();

export const REEL_CLUB_FRAMES = SCENES.reduce((a, s) => a + s.dur, 0);

export const sceneById = (id: SceneId) => SCENES.find((s) => s.id === id)!;

export const sceneAt = (frame: number) => {
  const scene = SCENES.find((s) => frame >= s.start && frame < s.start + s.dur) ?? SCENES[SCENES.length - 1];
  return { scene, local: frame - scene.start };
};

/** 0..1 loudness of the coach's voice at a global frame (drives the mouth). */
export const voiceLevel = (frame: number) => {
  const { scene, local } = sceneAt(frame);
  const env = VOICE_ENV[scene.voice];
  const i = local - LEAD;
  if (!env || i < 0 || i >= env.length) return 0;
  return env[i];
};

/** Club facilities and their price tags, in the order they get upgraded. */
export const ITEMS = [
  { scene: "porterias", label: "PORTERÍAS NUEVAS", price: 500 },
  { scene: "cesped", label: "CÉSPED DE VERDAD", price: 2000 },
  { scene: "focos", label: "FOCOS NOCTURNOS", price: 1500 },
  { scene: "vestuario", label: "VESTUARIO + DUCHAS", price: 3000 },
  { scene: "grada", label: "GRADA PARA TI", price: 5000 },
] as const satisfies readonly { scene: SceneId; label: string; price: number }[];

export const GOAL_TOTAL = ITEMS.reduce((a, i) => a + i.price, 0);

/** Frame (inside its scene) at which an item is rebuilt and its price pops. */
export const UPGRADE_AT = FLY + 4;

export const money = (n: number) => "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export { VOICE_FRAMES as VOICE_FRAMES_EXPORT } from "./voiceover.generated";
