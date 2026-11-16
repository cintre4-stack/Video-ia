import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Self-hosted fonts (SIL OFL) so renders work offline.
loadFont({ family: "Lilita One", url: staticFile("fonts/LilitaOne.woff2"), weight: "400" });
loadFont({ family: "Nunito", url: staticFile("fonts/Nunito.woff2"), weight: "200 1000" });

export const display = "'Lilita One', sans-serif";
export const body = "Nunito, sans-serif";

export const C = {
  bg: "#120A24",
  velvet: "#5B1035",
  velvet2: "#3A0A24",
  gold: "#FFC93C",
  goldDeep: "#E09A12",
  ice: "#BFEFFF",
  lab: "#38E1C8",
  red: "#FF3B5C",
  white: "#FFFFFF",
  ink: "#0A0716",
};

/** Instagram/TikTok UI covers ~top 220px and bottom ~380px: keep key info inside. */
export const LAYOUT = {
  titleTop: 250,
  captionTop: 1330,
};
