import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

loadFont({ family: "Lilita One", url: staticFile("fonts/LilitaOne.woff2"), weight: "400" });
loadFont({ family: "Nunito", url: staticFile("fonts/Nunito.woff2"), weight: "200 1000" });

export const display = "'Lilita One', sans-serif";
export const body = "Nunito, sans-serif";

/** Club palette: red tracksuit, navy, gold. */
export const CLUB = {
  red: "#E63946",
  redDark: "#9B1D27",
  navy: "#1D3557",
  gold: "#FFC93C",
  white: "#FFFFFF",
  ink: "#0A0F1A",
  skin: "#F1C29A",
  skinDark: "#E2A27A",
  hair: "#3B2618",
  grass1: "#3FA34D",
  grass2: "#36923F",
  dirt: "#9C7A52",
  dirtDark: "#7D5E3C",
  rust: "#8A5A3B",
};
