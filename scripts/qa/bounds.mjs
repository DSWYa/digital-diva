// Renders one QA still per lyric couplet and reports any lyric text outside the 40px safe area.
// Usage: node scripts/qa/bounds.mjs [browser-executable]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "dd-qa-"));
execFileSync("node", ["scripts/qa/run.mjs"], { env: { ...process.env, QA_FRAMES: join(dir, "frames.txt") }, stdio: "ignore" });
const frames = readFileSync(join(dir, "frames.txt"), "utf8").trim().split("\n").map(Number);
const serveUrl = await bundle({ entryPoint: "src/index.ts" });
const inputProps = { showTimingDebug: false, qa: true };
const browserExecutable = process.argv[2] ?? null;
const composition = await selectComposition({ serveUrl, id: "DigitalDiva", inputProps, browserExecutable });
const results = [];
for (const frame of frames) {
  let got = null;
  await renderStill({
    serveUrl, composition, frame, inputProps, browserExecutable, scale: 0.25,
    output: join(dir, `f${frame}.jpg`), imageFormat: "jpeg",
    onBrowserLog: (log) => { const m = log.text.match(/QA-BOUNDS (.*)/); if (m) got = JSON.parse(m[1]); },
  });
  if (got) results.push({ ...got, frame });
}
const M = 40;
let bad = 0;
for (const b of results) {
  const { x0, y0, x1, y1 } = b; // composition pixels
  if (x0 < M || y0 < M || x1 > 1920 - M || y1 > 1080 - M) {
    bad++;
    console.log(`OUT OF SAFE AREA ${(b.frame / 30).toFixed(2)}s: x ${x0.toFixed(0)}–${x1.toFixed(0)}, y ${y0.toFixed(0)}–${y1.toFixed(0)} (font ${b.font})`);
  }
}
const fonts = results.map((b) => parseFloat(b.font) || 0).filter(Boolean);
console.log(`${results.length}/${frames.length} couplets measured, ${bad} outside the ${M}px safe area; smallest lyric font ${Math.min(...fonts).toFixed(0)}px`);
