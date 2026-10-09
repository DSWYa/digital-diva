import "@fontsource/archivo/700.css";
import "@fontsource/archivo/800.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/600.css";
import { continueRender, delayRender } from "remotion";

const specs = ["700 80px Archivo", "800 80px Archivo", "400 40px 'IBM Plex Mono'", "600 40px 'IBM Plex Mono'"];

let started = false;
export const ensureFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("Loading fonts");
  Promise.all(specs.map((s) => document.fonts.load(s)))
    .catch((e) => console.warn("Font load failed", e))
    .finally(() => continueRender(handle));
};
