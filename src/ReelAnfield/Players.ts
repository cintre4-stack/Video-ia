import type { CharacterProps, Kit } from "../Reel9320/Character";
import { SKIN } from "../Reel9320/theme";

type Look = Omit<CharacterProps, "x" | "y">;

export const K = {
  barca: "#A50044",
  barcaBlue: "#004D98",
  pool: "#C8102E",
  poolDark: "#7A0A1C",
  gold: "#FFC93C",
};

/** Crowd palettes */
export const CAMP_NOU_CROWD = [K.barca, K.barcaBlue, K.barcaBlue, "#FFFFFF", K.barca];
export const ANFIELD_CROWD = [K.pool, K.pool, "#FFFFFF", K.pool, "#F6EB61"];

const barcaKit = (number?: number): Kit => ({
  shirt: K.barcaBlue,
  shirt2: K.barca,
  pattern: "stripes",
  shorts: K.barcaBlue,
  socks: K.barcaBlue,
  number,
  numberColor: "#FFD23F",
});
const poolKit = (number?: number): Kit => ({
  shirt: K.pool,
  shorts: K.pool,
  socks: K.pool,
  number,
});

// Caricatures: identified by kit colours, numbers and one trait each.
export const MESSI: Look = { kit: barcaKit(10), skin: SKIN.light, hair: "short", hairColor: "#4A2E1A", beard: true, height: 285 };
export const SUAREZ: Look = { kit: barcaKit(9), skin: SKIN.tan, hair: "short", hairColor: "#1E140C" };
export const BARCA_A: Look = { kit: barcaKit(), skin: SKIN.light, hair: "short", hairColor: "#2B1B10" };
export const BARCA_B: Look = { kit: barcaKit(), skin: SKIN.medium, hair: "buzz", hairColor: "#111" };
export const BARCA_C: Look = { kit: barcaKit(), skin: SKIN.light, hair: "long", hairColor: "#3B2A1A" };
export const TER_STEGEN: Look = {
  kit: { shirt: "#F2A900", shorts: "#222", socks: "#F2A900", number: 1, numberColor: "#111" },
  skin: SKIN.light,
  hair: "blond",
};

export const ORIGI: Look = { kit: poolKit(27), skin: SKIN.dark, hair: "buzz", hairColor: "#111" };
export const WIJNALDUM: Look = { kit: poolKit(5), skin: SKIN.dark, hair: "buzz", hairColor: "#111" };
export const TRENT: Look = { kit: poolKit(66), skin: SKIN.medium, hair: "buzz", hairColor: "#111" };
export const ROBERTSON: Look = { kit: poolKit(26), skin: SKIN.light, hair: "short", hairColor: "#6B4A2B" };
export const POOL_A: Look = { kit: poolKit(), skin: SKIN.light, hair: "short", hairColor: "#3B2A1A" };
export const POOL_B: Look = { kit: poolKit(), skin: SKIN.light, hair: "buzz", hairColor: "#6B4A2B", beard: true };
export const ALISSON: Look = {
  kit: { shirt: "#2FBF4A", shorts: "#1E7A30", socks: "#2FBF4A", number: 13 },
  skin: SKIN.light,
  hair: "short",
  hairColor: "#2B1B10",
  beard: true,
};
/** Salah in the stands, in his black "NEVER GIVE UP" T-shirt. */
export const SALAH_TEE: Look = {
  kit: { shirt: "#111111", shorts: "#2B3A55", socks: "#2B3A55" },
  skin: SKIN.medium,
  hair: "curly",
  hairColor: "#1E140C",
  beard: true,
};
export const BALL_BOY: Look = {
  kit: { shirt: "#1F2A44", shorts: "#1F2A44", socks: "#1F2A44" },
  skin: SKIN.dark,
  hair: "buzz",
  hairColor: "#111",
  height: 210,
};
export const OFFICIAL: Look = {
  kit: { shirt: "#333", shorts: "#333", socks: "#333" },
  skin: SKIN.light,
  hair: "buzz",
  hairColor: "#888",
};
