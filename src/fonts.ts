import "@fontsource/limelight/400.css";
import "@fontsource/josefin-sans/600.css";
import "@fontsource/josefin-sans/700.css";
import "@fontsource/righteous/400.css";
import "@fontsource/monoton/400.css";
import "@fontsource/poiret-one/400.css";
import { continueRender, delayRender } from "remotion";

const specs = [
  "400 80px Limelight",
  "700 80px 'Josefin Sans'",
  "600 80px 'Josefin Sans'",
  "400 80px Righteous",
  "400 80px Monoton",
  "400 80px 'Poiret One'",
];

let started = false;
export const ensureFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("Loading fonts");
  Promise.all(specs.map((s) => document.fonts.load(s)))
    .catch((e) => console.warn("Font load failed", e))
    .finally(() => continueRender(handle));
};
