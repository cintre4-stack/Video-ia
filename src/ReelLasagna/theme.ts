import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

loadFont({ family: "Lilita One", url: staticFile("fonts/LilitaOne.woff2"), weight: "400" });
loadFont({ family: "Nunito", url: staticFile("fonts/Nunito.woff2"), weight: "200 1000" });

export const display = "'Lilita One', sans-serif";
export const body = "Nunito, sans-serif";

/** Paleta cálida de cocina italiana. */
export const C = {
  cream: "#FFF4DD",
  ink: "#2A1A12",
  tomato: "#E2412C",
  tomatoDark: "#9E2414",
  basil: "#3E9B4F",
  cheese: "#FFC93C",
  wall: "#F6E3C6",
  tile: "#FFFFFF",
  tileLine: "#E9D2B0",
  wood: "#B9773F",
  woodDark: "#8A5228",
  counter: "#F4F1EA",
  steel: "#B8C0C8",
  steelDark: "#5E6670",
  chef: "#FFB44D",
  chefShade: "#F08F2E",
  cheek: "#FF7A7A",
  pasta: "#F8D772",
  meatRaw: "#D9787A",
  meat: "#7A3B22",
  sauce: "#C7301E",
  bechamel: "#FBF1D9",
  butter: "#FFE27A",
  onion: "#F3E9F5",
  carrot: "#F37A21",
  garlic: "#FAF6E8",
  oregano: "#4F7A2A",
  crust: "#E89A2F",
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
