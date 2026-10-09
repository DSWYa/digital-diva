/* Static QA checks over timing + scene plan + lyric grouping. Run: npm run qa */
import { groups, layoutOfGroup, segments } from "../../src/lib/plan";
import { lines, lineById, analysis } from "../../src/lib/timing";
import { EXIT, fitSize } from "../../src/lyrics/Lyrics";

const ease = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
const issues: string[] = [];
const warn = (s: string) => issues.push(s);
const fmt = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, "0")}`;

// 1. every line in exactly one group; single-line layouts hold one line
const seen = new Map<number, number>();
groups.forEach((g, gi) => g.ids.forEach((i) => seen.set(i, (seen.get(i) ?? 0) + 1)));
lines.forEach((l, i) => {
  if (seen.get(i) !== 1) warn(`COVERAGE ${l.id} appears in ${seen.get(i) ?? 0} groups`);
});
groups.forEach((g) => {
  const k = layoutOfGroup(g).kind;
  if ((k === "path" || k === "slam") && g.ids.length > 1) warn(`LAYOUT ${k} group ${g.ids.map((i) => lines[i].id).join("+")} renders only its first line`);
});

// 2/3. each word fully visible while sung (simulates LyricLayer: last two visible groups)
const visibleAt = (t: number) => groups.filter((g) => t >= g.start && t <= g.end + EXIT).slice(-2);
let wordFails = 0;
groups.forEach((g) => {
  let k = 0;
  g.ids.forEach((li) =>
    lines[li].words.forEach((w) => {
      const idx = k++;
      for (const t of [w.s, (w.s + w.e) / 2]) {
        const shown = visibleAt(t).includes(g);
        const out = Math.max(0, Math.min(1, (t - g.end) / EXIT));
        const alpha = ease((t - g.start - idx * 0.02) / 0.22) * (1 - out);
        if (!shown || alpha < 0.85) {
          wordFails++;
          warn(`VISIBILITY ${lines[li].id} "${w.t}" @${fmt(t)} alpha=${alpha.toFixed(2)}${shown ? "" : " (group not shown)"}`);
          break;
        }
      }
    }),
  );
});

// lead-in / lingering
groups.forEach((g) => {
  const first = lines[g.ids[0]];
  const last = lines[g.ids[g.ids.length - 1]];
  const lead = first.start - g.start;
  if (lead < 0.1) warn(`LATE ENTRY ${first.id} appears only ${lead.toFixed(2)}s before first word`);
  if (g.end - last.end > 3) warn(`LINGER ${last.id} stays ${(g.end - last.end).toFixed(1)}s after last word`);
});

// 5. font sizes
const MIN = { block: 46, log: 40, path: 60, slam: 120 } as const;
groups.forEach((g) => {
  const L = layoutOfGroup(g);
  if (L.kind === "path" || L.kind === "slam") {
    if (L.size < MIN[L.kind]) warn(`FONT ${lines[g.ids[0]].id} ${L.kind} size ${L.size}`);
    return;
  }
  const s = fitSize(L, g.ids.map((i) => (L.kind === "log" ? "# " : "") + lines[i].text));
  if (s < MIN[L.kind]) warn(`FONT ${g.ids.map((i) => lines[i].id).join("+")} ${L.kind} ${s.toFixed(0)}px`);
  // vertical budget (rough): rows * size * lineHeight
  const cw = L.kind === "log" ? 0.6 : 0.56;
  const rows = g.ids.reduce((n, i) => n + Math.ceil(((L.kind === "log" ? 2 : 0) + lines[i].text.length) * s * cw / L.w - 0.02), 0);
  const height = rows * s * (L.kind === "log" ? 1.45 : 1.12);
  if (L.y + height > 1040) warn(`OVERFLOW-Y? ${g.ids.map((i) => lines[i].id).join("+")} bottom≈${(L.y + height).toFixed(0)}px`);
});

// 7. plan items must point at lines inside their segment
segments.forEach((s) => {
  for (const id of Object.keys(s.items)) {
    const l = lineById[id];
    if (!l) warn(`PLAN ${s.scene}#${s.index} item references unknown line ${id}`);
    else if (l.start < s.start - 1 || l.start > s.end) warn(`PLAN ${s.scene}#${s.index} item ${id} (${fmt(l.start)}) outside segment ${fmt(s.start)}–${fmt(s.end)}`);
  }
  const dur = s.end - s.start;
  if (dur < 1.2) warn(`SHORT SCENE ${s.scene}#${s.index} lasts ${dur.toFixed(2)}s`);
  if (dur > 16 && Object.keys(s.items).length < 2) warn(`LONG SCENE ${s.scene}#${s.index} lasts ${dur.toFixed(1)}s`);
});
// scenes must not change in the middle of a sung line
import { segmentIndexAt as segAt } from "../../src/lib/plan";
lines.forEach((l) => {
  const a = segAt(l.words[0].s);
  const b = segAt(l.words[l.words.length - 1].s);
  if (a !== b) warn(`MID-LINE CUT ${l.id} "${l.text}" changes scene ${segments[a].scene} → ${segments[b].scene} at ${fmt(segments[b].start)}`);
});
const frames = Math.ceil(analysis.durationSec * 30);
console.log(`duration ${analysis.durationSec}s → ${frames} frames (${(frames / 30).toFixed(3)}s); lines ${lines.length}; groups ${groups.length}; segments ${segments.length}`);
console.log(`word visibility failures: ${wordFails}`);
console.log(issues.length ? issues.join("\n") : "no issues");

// One representative frame per couplet (all its words on screen), for scripts/qa/bounds.sh
if (process.env.QA_FRAMES) {
  const { writeFileSync } = await import("node:fs");
  const fr = groups.map((g) => {
    const last = lines[g.ids[g.ids.length - 1]];
    const lw = last.words[last.words.length - 1];
    return Math.round(Math.min(g.end - 0.05, Math.max(g.start + 0.6, lw.s + 0.1)) * 30);
  });
  writeFileSync(process.env.QA_FRAMES, fr.join("\n"));
}

// Line → on-screen imagery table (QA_TABLE=1 node scripts/qa/run.mjs)
if (process.env.QA_TABLE) {
  const { currentItem, segmentIndexAt } = await import("../../src/lib/plan");
  for (const l of lines) {
    const t = (l.start + l.end) / 2;
    const s = segments[segmentIndexAt(t)];
    const it = currentItem(s, t).name ?? "-";
    console.log(`${l.id} ${t.toFixed(1).padStart(6)}s  ${(s.scene + (s.variant ? "/" + s.variant : "")).padEnd(18)} ${it.padEnd(10)} ${l.text}`);
  }
}
