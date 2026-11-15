import type { CharacterProps, Kit } from "./Character";
import { C, SKIN } from "./theme";

type Look = Omit<CharacterProps, "x" | "y">;

const cityKit = (number?: number): Kit => ({
  shirt: C.city,
  shorts: C.white,
  socks: C.city,
  number,
  numberColor: C.cityDark,
});
const utdKit = (number?: number): Kit => ({
  shirt: C.utd,
  shorts: C.white,
  socks: C.ink,
  number,
});
const qprKit = (number?: number): Kit => ({
  shirt: C.qpr,
  shirt2: C.white,
  pattern: "hoops",
  shorts: C.white,
  socks: C.white,
  number,
});

// Caricatures: identified by kit colors, numbers and one hair trait each.
export const AGUERO: Look = { kit: cityKit(16), skin: SKIN.tan, hair: "short", hairColor: "#1E140C" };
export const BALOTELLI: Look = { kit: cityKit(45), skin: SKIN.dark, hair: "mohawk", hairColor: "#111" };
export const DZEKO: Look = { kit: cityKit(10), skin: SKIN.light, hair: "short", hairColor: "#2B1B10", height: 330 };
export const ZABALETA: Look = { kit: cityKit(5), skin: SKIN.light, hair: "short", hairColor: "#2B1B10", beard: true };
export const CITY_FAN: Look = { kit: cityKit(), skin: SKIN.light, hair: "short", hairColor: "#6B3E1E" };

export const ROONEY: Look = { kit: utdKit(10), skin: SKIN.light, hair: "buzz", hairColor: "#6B4A2B" };
export const UTD_A: Look = { kit: utdKit(), skin: SKIN.light, hair: "short", hairColor: "#3B2A1A" };
export const UTD_B: Look = { kit: utdKit(), skin: SKIN.medium, hair: "buzz", hairColor: "#111" };
export const UTD_C: Look = { kit: utdKit(), skin: SKIN.light, hair: "long", hairColor: "#5A3A22" };

export const CISSE: Look = { kit: qprKit(), skin: SKIN.dark, hair: "blond" };
export const MACKIE: Look = { kit: qprKit(), skin: SKIN.light, hair: "short", hairColor: "#7A4B26" };
export const BARTON: Look = { kit: qprKit(), skin: SKIN.light, hair: "buzz", hairColor: "#3B2A1A" };

export const KEEPER_QPR: Look = {
  kit: { shirt: "#2FBF4A", shorts: "#1E7A30", socks: "#2FBF4A", number: 1 },
  skin: SKIN.light,
  hair: "buzz",
  hairColor: "#5A3A22",
};
export const KEEPER_SUN: Look = {
  kit: { shirt: "#F5D400", shorts: "#222", socks: "#F5D400", number: 1, numberColor: C.ink },
  skin: SKIN.light,
  hair: "short",
  hairColor: "#3B2A1A",
};
export const KEEPER_CITY: Look = {
  kit: { shirt: "#8E44AD", shorts: "#5B2C6F", socks: "#8E44AD", number: 1 },
  skin: SKIN.light,
  hair: "short",
  hairColor: "#6B4A2B",
};

export const REFEREE: Look = {
  kit: { shirt: C.ref, shorts: C.ref, socks: C.ref },
  skin: SKIN.light,
  hair: "bald",
};
export const OFFICIAL: Look = {
  kit: { shirt: "#333", shorts: "#333", socks: "#333" },
  skin: SKIN.light,
  hair: "buzz",
  hairColor: "#888",
};
