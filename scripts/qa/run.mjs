// Bundles scripts/qa/checks.ts with esbuild and runs it.
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const out = join(tmpdir(), "digital-diva-qa.mjs");
await build({ entryPoints: ["scripts/qa/checks.ts"], bundle: true, platform: "node", format: "esm", jsx: "automatic", outfile: out, logLevel: "warning" });
await import(pathToFileURL(out).href);
