import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are self-hosted in public/fonts so renders work offline.
// Lilita One & Nunito: SIL Open Font License (Google Fonts).
loadFont({ family: "Lilita One", url: staticFile("fonts/LilitaOne.woff2"), weight: "400" });
loadFont({ family: "Nunito", url: staticFile("fonts/Nunito.woff2"), weight: "200 1000" });

export const display = "'Lilita One', sans-serif";
export const body = "Nunito, sans-serif";

export const C = {
  night: "#0B1A2E",
  night2: "#13294A",
  city: "#6CABDD",
  cityDark: "#1C2C5B",
  utd: "#DA291C",
  utdDark: "#7A0F0A",
  qpr: "#1D5BA4",
  sunderland: "#E1251B",
  grass1: "#2E8B3E",
  grass2: "#37A048",
  white: "#FFFFFF",
  ink: "#0A0F1A",
  gold: "#FFC93C",
  ref: "#1A1A1A",
};

export const SKIN = {
  light: "#F2C9A0",
  tan: "#E3AE7F",
  medium: "#C98B5A",
  dark: "#7A4A2E",
};

/**
 * Vertical reel layout (1080x1920). Instagram/TikTok cover roughly the top
 * 220px and bottom 380px with UI, so key info stays between those lines.
 */
export const LAYOUT = {
  hudTop: 240,
  badgeTop: 450,
  captionTop: 555,
  ground: 1430,
  chipTop: 1475,
};
