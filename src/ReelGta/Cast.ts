import type { CharacterProps, Kit } from "../Reel9320/Character";
import { SKIN } from "../Reel9320/theme";

type Look = Omit<CharacterProps, "x" | "y">;

/** Vice-ish neon palette for the GTA 6 part. Colors only, no logos. */
export const V = {
  pink: "#FF3EA5",
  cyan: "#2EE6FF",
  orange: "#FF9F1C",
  purple: "#3B1466",
  money: "#3BB273",
  moneyDark: "#1F6E45",
  sick: "#7CC46A",
  red: "#E3121B",
  yellow: "#FFE45A",
};

const office = (shirt: string, tie: string, pants = "#2C3550"): Kit => ({ shirt, tie, shorts: pants, socks: pants });

export const PAJAMAS: Kit = { shirt: "#4C7BD9", shirt2: "#89AEF5", pattern: "stripes", shorts: "#3A62B8", socks: "#3A62B8" };

/** The protagonist: the guy who "gets sick" every big launch. */
export const GAMER: Look = { kit: PAJAMAS, skin: SKIN.light, hair: "curly", hairColor: "#3A2414" };
export const BOSS: Look = { kit: office("#5A6272", "#E3121B", "#353B47"), skin: SKIN.tan, hair: "bald", beard: true, hairColor: "#5B4636" };

export const WORKERS: Look[] = [
  { kit: office("#F4F7FB", "#2E6BD8"), skin: SKIN.medium, hair: "short", hairColor: "#1E140C" },
  { kit: office("#FFE1E8", "#7A2E8C"), skin: SKIN.light, hair: "long", hairColor: "#6B3E1E" },
  { kit: office("#DFF3FF", "#1F6E45"), skin: SKIN.dark, hair: "buzz", hairColor: "#111" },
  { kit: office("#F4F7FB", "#E3121B"), skin: SKIN.light, hair: "blond" },
  { kit: office("#FFF3D6", "#2C3550"), skin: SKIN.tan, hair: "mohawk", hairColor: "#222" },
  { kit: office("#E8FFE8", "#FF9F1C"), skin: SKIN.medium, hair: "curly", hairColor: "#1A1A1A" },
];

/** Casual fans for the midnight queue (2013). */
export const FANS: Look[] = [
  { kit: { shirt: "#2B2F3A", shorts: "#1E3A6B", socks: "#EEE" }, skin: SKIN.light, hair: "short", hairColor: "#2B1B10" },
  { kit: { shirt: "#3BB273", shorts: "#2C3550", socks: "#EEE" }, skin: SKIN.dark, hair: "buzz", hairColor: "#111" },
  { kit: { shirt: "#E3121B", shorts: "#2C3550", socks: "#EEE" }, skin: SKIN.tan, hair: "long", hairColor: "#1E140C" },
  { kit: { shirt: "#FF9F1C", shorts: "#3A3A3A", socks: "#EEE" }, skin: SKIN.medium, hair: "mohawk", hairColor: "#111" },
  { kit: { shirt: "#7A2E8C", shorts: "#1E3A6B", socks: "#EEE" }, skin: SKIN.light, hair: "blond" },
  { kit: { shirt: "#2E6BD8", shorts: "#2B2F3A", socks: "#EEE" }, skin: SKIN.tan, hair: "curly", hairColor: "#3A2414" },
];
