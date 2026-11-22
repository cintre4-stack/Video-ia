// Genera la narracion del reel FC Stuart con ElevenLabs TTS.
//
//   ELEVENLABS_API_KEY=... node scripts/generate-voiceover-fcstuart.mjs [voiceId]
//
// Escribe public/voiceover/fcstuart/<id>.mp3 y src/FCStuart/voiceover.generated.ts
// (duracion de cada linea en frames a 30 fps).
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const FPS = 30;
const VOICE_ID = process.argv[2] ?? process.env.ELEVENLABS_VOICE_ID;
const KEY = process.env.ELEVENLABS_API_KEY;
if (!VOICE_ID || !KEY) {
  console.error("Uso: ELEVENLABS_API_KEY=... node scripts/generate-voiceover-fcstuart.mjs <voiceId>");
  process.exit(1);
}

// Mantener sincronizado con guiones/reel-fc-stuart.md
const LINES = [
  ["s01", "¡Necesitamos afición para subir a Segunda! Sin hinchas, no hay ascenso."],
  ["s02", "Cada comentario es un aficionado del FC Stuart. ¡Cada comentario vale diez dólares!"],
  ["s03", "Y cada like, un dólar. ¡Dale like, dale like!"],
  ["s04", "Pero... ¿para qué necesitamos tanto dinero? Para fichajes."],
  ["s05", "Piojo Alvarado: mil quinientos dólares."],
  ["s06", "Neymar: dos mil dólares."],
  ["s07", "Lamine Yamal: tres mil dólares. ¡Comenta, dale like y hacemos historia!"],
];

const outDir = "public/voiceover/fcstuart";
mkdirSync(outDir, { recursive: true });

const frames = {};
let previous = "";
for (const [id, text] of LINES) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        language_code: "es",
        previous_text: previous || undefined,
        voice_settings: { stability: 0.35, similarity_boost: 0.8, style: 0.6, use_speaker_boost: true },
      }),
    },
  );
  if (!res.ok) {
    console.error(id, res.status, await res.text());
    process.exit(1);
  }
  const file = `${outDir}/${id}.mp3`;
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  const seconds = Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString(),
  );
  frames[id] = Math.ceil(seconds * FPS);
  previous = text;
  console.log(`${id}  ${seconds.toFixed(2)}s  ${text}`);
}

writeFileSync(
  "src/FCStuart/voiceover.generated.ts",
  `// Generado por scripts/generate-voiceover-fcstuart.mjs — no editar a mano.\n` +
    `export const VOICE_FRAMES = ${JSON.stringify(frames, null, 2)} as const;\n`,
);
console.log("Escrito src/FCStuart/voiceover.generated.ts");
