import type { CharacterProps, Kit } from "../Reel9320/Character";
import { SKIN } from "../Reel9320/theme";

type Look = Omit<CharacterProps, "x" | "y">;

/** Club colours only: no crests or official logos. */
export const K = {
  lev: "#E32221",
  levDark: "#7E0F10",
  black: "#141414",
  bayern: "#DC052D",
  bayernNavy: "#0B2A5B",
  bremen: "#1D9053",
  silver: "#D9DEE5",
  gold: "#FFC93C",
};

export const BAYARENA_CROWD = [K.lev, K.lev, K.black, "#FFFFFF", K.lev];
export const BAYERN_CROWD = [K.bayern, "#FFFFFF", K.bayern, K.bayernNavy, K.bayern];

const levKit = (number?: number): Kit => ({
  shirt: K.lev,
  shorts: K.black,
  socks: K.lev,
  number,
  numberColor: "#FFFFFF",
});
const bayernKit = (number?: number): Kit => ({
  shirt: K.bayern,
  shirt2: "#FFFFFF",
  pattern: "stripes",
  shorts: "#FFFFFF",
  socks: K.bayern,
  number,
  numberColor: K.bayernNavy,
});
const bremenKit = (number?: number): Kit => ({
  shirt: K.bremen,
  shorts: "#FFFFFF",
  socks: K.bremen,
  number,
});

// Caricatures: identified by kit colours, numbers and one trait each.
export const WIRTZ: Look = { kit: levKit(10), skin: SKIN.light, hair: "short", hairColor: "#6B4A2B" };
export const XHAKA: Look = { kit: levKit(34), skin: SKIN.light, hair: "short", hairColor: "#1E140C", beard: true };
export const BONIFACE: Look = { kit: levKit(22), skin: SKIN.dark, hair: "buzz", hairColor: "#111" };
export const GRIMALDO: Look = { kit: levKit(20), skin: SKIN.tan, hair: "short", hairColor: "#2B1B10", beard: true };
export const FRIMPONG: Look = { kit: levKit(30), skin: SKIN.dark, hair: "curly", hairColor: "#111" };
export const LEV_A: Look = { kit: levKit(), skin: SKIN.light, hair: "blond" };
/** 2002: Ballack, no. 13, the face of the "treble of runners-up". */
export const BALLACK: Look = { kit: levKit(13), skin: SKIN.light, hair: "short", hairColor: "#2B1B10" };
/** Coach in a dark suit. */
export const XABI: Look = {
  kit: { shirt: "#1B2233", shorts: "#1B2233", socks: "#111" },
  skin: SKIN.light,
  hair: "short",
  hairColor: "#5A4636",
  beard: true,
  height: 310,
};

export const BAYERN_A: Look = { kit: bayernKit(9), skin: SKIN.light, hair: "short", hairColor: "#3B2A1A" };
export const BAYERN_B: Look = { kit: bayernKit(), skin: SKIN.medium, hair: "buzz", hairColor: "#111" };
export const BAYERN_KEEPER: Look = {
  kit: { shirt: "#2FBF4A", shorts: "#1E7A30", socks: "#2FBF4A", number: 1 },
  skin: SKIN.light,
  hair: "blond",
};

export const BREMEN_A: Look = { kit: bremenKit(), skin: SKIN.light, hair: "short", hairColor: "#3B2A1A" };
export const BREMEN_KEEPER: Look = {
  kit: { shirt: "#F2C230", shorts: "#333", socks: "#F2C230", number: 30, numberColor: "#111" },
  skin: SKIN.light,
  hair: "short",
  hairColor: "#6B4A2B",
};
export const RIVAL_KEEPER: Look = {
  kit: { shirt: "#7A3FD0", shorts: "#222", socks: "#7A3FD0", number: 1 },
  skin: SKIN.light,
  hair: "buzz",
  hairColor: "#3B2A1A",
};

/** Fans in red/black tees for the pitch invasion. */
export const FANS: Look[] = [
  { kit: { shirt: K.lev, shorts: "#2B3A55", socks: "#222" }, skin: SKIN.light, hair: "short", hairColor: "#3B2A1A" },
  { kit: { shirt: K.black, shorts: "#2B3A55", socks: "#222" }, skin: SKIN.medium, hair: "curly", hairColor: "#111" },
  { kit: { shirt: K.lev, shorts: "#444", socks: "#222" }, skin: SKIN.light, hair: "long", hairColor: "#C99A4B" },
  { kit: { shirt: "#FFFFFF", shorts: "#2B3A55", socks: "#222" }, skin: SKIN.tan, hair: "bald" },
  { kit: { shirt: K.black, shorts: "#444", socks: "#222" }, skin: SKIN.light, hair: "blond", beard: true },
  { kit: { shirt: K.lev, shorts: "#2B3A55", socks: "#222" }, skin: SKIN.dark, hair: "buzz", hairColor: "#111" },
];
