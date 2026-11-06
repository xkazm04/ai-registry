#!/usr/bin/env node
/**
 * shift-review - the one rolling page where the operator answers /shift's render proofs.
 *
 * WHY
 * The shift banks proofs through the night, and a verdict stays the operator's. One page per
 * proof would scatter that into tabs nobody opens, so every unjudged proof waits on one page,
 * decision first and numbers last. This instrument owns none of the blind machinery: a proof
 * seat runs `render-triage sheet` in `.ai/shift/review/items/<runId>/`, which shuffles, seals
 * key.json and hard-links the neutral files. `reveal` and `clean` are render-triage's too, so
 * its refusals (no second verdict, no cleanup before a verdict) hold here unchanged.
 *
 * WHY THE PAGE CANNOT SAY WHAT A LETTER LANDS
 * "What each pick would land" written per label would be the key in prose. So the page states
 * one optional `manifest.landing` and what follows if a letter turns out to be the candidate or
 * the control, without saying which letter is which. It reads only the LABELS from key.json,
 * never the arm a label maps to, and an item whose section would still reveal an arm (its brief
 * quoting an arm's prompt, say) is withheld whole rather than shown.
 *
 * COMMANDS
 *   build                                      write .ai/shift/review/index.html
 *   size [--json]                              {"reviewGb":n,"capGb":n,"overCap":bool,"pending":n}
 *   verdict <runId> <pairId>=<label|tie|neither>...   render-triage reveal; prints the result; no cleaning
 *   clean <runId>                              render-triage clean; refuses before a verdict
 *
 * EXIT 0 ok · 1 build withheld an item · 2 could not run (usage, broken config or ledger, a
 * refused reveal or clean)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT, installCrashDoor } from './lib/exit-codes.mjs';
import { itemsDir, pendingRuns, reviewDir, reviewSize } from './lib/shift-review-state.mjs';
import { parseLedger } from './backlog-wave.mjs';
import { DISCRIMINATION_RATIO, MEDIA, esc, indistinct, leaks, mediaTag } from './render-triage.mjs';
import { UsageError, atomicWrite, parseArgs } from './shift-queue.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RENDER_TRIAGE = path.join(ROOT, 'scripts', 'render-triage.mjs');
const RUN_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const NO_CANDIDATE_TEXT = 'the candidate this run tested';

const relUrl = (...parts) => parts.map(encodeURIComponent).join('/');

/* ---------------------------------------------------------------- blind sections */

/** An arm's own name on the page decodes it. One-letter names are too short to search for. */
function armNameLeaks(html, manifest) {
  const found = [];
  for (const pair of manifest.pairs) {
    for (const arm of Object.keys(pair.arms)) {
      if (arm.length < 3) continue;
      const name = arm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`(?:^|[^A-Za-z0-9])${name}(?:$|[^A-Za-z0-9])`).test(html)) found.push(`${pair.id}: name of arm ${arm}`);
    }
  }
  return found;
}

function pickRules(landing) {
  return `<div class="card plan">
<b>If your letter is the candidate</b><span>Verdict better: ${esc(landing || NO_CANDIDATE_TEXT)} lands.</span>
<b>If it is the control</b><span>Verdict not-better: nothing lands.</span>
<b>tie</b><span>Nothing lands. It reads as unmeasurable at this sample size, or as no verdict at all if the pair is below the discrimination floor.</span>
<b>neither</b><span>Nothing lands. The brief or its anchors failed, and the proof is owed again.</span>
</div>
<p class="meta">Which letter is which stays sealed until you answer. That is what keeps this blind.</p>`;
}

/** One unjudged run as blind HTML, or the reason it may not be shown. */
export function blindSection(root, runId) {
  const dir = path.join(itemsDir(root), runId);
  let manifest;
  let key;
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    key = JSON.parse(fs.readFileSync(path.join(dir, 'triage', 'key.json'), 'utf8'));
  } catch (e) { return { why: `manifest or key unreadable: ${e.message}` }; }
  if (manifest.run !== runId) return { why: `manifest names run ${JSON.stringify(manifest.run)} but it sits in ${runId}` };
  if (!Array.isArray(manifest.pairs) || !manifest.pairs.length) return { why: 'manifest has no pairs' };

  const triage = fs.readdirSync(path.join(dir, 'triage'));
  const pairs = [];
  const picks = [];
  for (const pair of manifest.pairs) {
    const labels = Object.keys(key.pairs?.[pair.id] ?? {});
    if (!labels.length) return { why: `pair ${pair.id} is not on the sealed sheet` };
    const cells = [];
    for (const label of labels) {
      const file = triage.find((f) => f.startsWith(`${pair.id}-${label}.`));
      if (!file) return { why: `pair ${pair.id} output ${label} is missing from triage/` };
      cells.push(`<figure>${mediaTag(relUrl('items', runId, 'triage', file))}<figcaption><strong>${esc(label)}</strong></figcaption></figure>`);
    }
    const low = indistinct(pair);
    pairs.push(`<h3>${esc(pair.id)}</h3>
${pair.brief ? `<p>${esc(pair.brief)}</p>` : ''}
${low ? '<p><span class="verdict warn">below the floor</span> This pair may not author a landing. It is shown so you can disagree with the measurement.</p>' : ''}
<div class="grid wide">${cells.join('')}</div>
<p class="meta">Answers: ${labels.map(esc).join(', ')}, tie, neither</p>`);
    picks.push(`${pair.id}=<label>`);
  }
  const html = `<section>
<h2>${esc(runId)}</h2>
<p><strong>${esc(manifest.question || 'Which output is better?')}</strong></p>
${pairs.join('\n')}
${pickRules(manifest.landing)}
<h3>Answer with</h3>
<pre>${esc(`/shift verdict ${runId} ${picks.join(' ')}`)}</pre>
<p class="meta">Every pair is answered at once. Sheet ${esc(key.sheet ?? '?')}.</p>
</section>`;
  const leaked = [...leaks(html, manifest), ...armNameLeaks(html, manifest)];
  if (leaked.length) return { why: `would reveal the arms: ${leaked.join('; ')}` };
  return { html, manifest };
}

/* ---------------------------------------------------------------- the lower sections */

function mediaFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) walk(path.join(d, e.name));
      else if (MEDIA.has(path.extname(e.name).toLowerCase())) out.push(path.relative(dir, path.join(d, e.name)).split(path.sep));
    }
  };
  if (fs.existsSync(dir)) walk(dir);
  return out;
}

function benchmarkSection(root, rows) {
  if (!rows.length) return '';
  const body = rows.map((r) => {
    const runId = r.render.runId ?? '';
    const files = RUN_ID_RE.test(runId) ? mediaFiles(path.join(itemsDir(root), runId)) : [];
    const links = files.map((parts) => `<a href="${esc(relUrl('items', runId, ...parts))}">${esc(parts.at(-1))}</a>`).join(', ');
    return `<tr><td>${esc(r.title ?? r.id)}</td><td>${esc(r.status)}</td><td>${esc(r.render.brief ?? '-')}</td><td>${esc(r.render.estGpuMin ?? '-')}</td><td>${esc(r.render.display ?? '-')}</td><td>${links || '-'}</td></tr>`;
  }).join('\n');
  return `<h2>Benchmarks (nothing to judge)</h2>
<div class="card scroll"><table>
<tr><th>Benchmark</th><th>Status</th><th>Brief</th><th>Est. GPU min</th><th>Display</th><th>Outputs</th></tr>
${body}
</table></div>`;
}

function judgedSection(root) {
  const dir = itemsDir(root);
  if (!fs.existsSync(dir)) return '';
  const rows = [];
  for (const run of fs.readdirSync(dir).sort()) {
    const file = path.join(dir, run, 'verdict.json');
    if (!fs.existsSync(file) || !mediaFiles(path.join(dir, run)).length) continue;
    const verdict = JSON.parse(fs.readFileSync(file, 'utf8'));
    const picks = Object.entries(verdict.pairs ?? {}).map(([id, v]) => `${id}: ${v.operator} = ${v.arm}`).join('; ');
    rows.push(`<tr><td>${esc(run)}</td><td>${esc(picks)}</td><td><code>${esc(`node scripts/shift-review.mjs clean ${run}`)}</code></td></tr>`);
  }
  if (!rows.length) return '';
  return `<h2>Answered, media still on disk</h2>
<div class="card scroll"><table><tr><th>Run</th><th>Your picks</th><th>Free the disk</th></tr>
${rows.join('\n')}</table></div>`;
}

function numbersSection(blind, size, unsealed) {
  const rows = blind.flatMap(({ manifest }) => manifest.pairs.map((p) => {
    const d = p.discrimination;
    const ratio = d?.within ? `${(d.between / d.within).toFixed(2)}x` : '-';
    return `<tr><td>${esc(manifest.run)}</td><td>${esc(p.id)}</td><td>${esc(ratio)}</td><td>${esc(d?.between ?? '-')}</td><td>${esc(d?.within ?? '-')}</td></tr>`;
  })).join('\n');
  return `<h2>Numbers</h2>
<p>${size.pending} proof(s) waiting on you, ${unsealed} still being prepared. Review folder ${size.reviewGb} GB of a ${size.capGb} GB cap.</p>
${rows ? `<div class="card scroll"><table><tr><th>Run</th><th>Pair</th><th>Discrimination (floor ${DISCRIMINATION_RATIO}x)</th><th>Between</th><th>Within</th></tr>
${rows}</table></div>` : ''}`;
}

/* ---------------------------------------------------------------- build */

const STYLE = `:root { --bg:#f6f5f2; --card:#fff; --ink:#1d1d1b; --mute:#6b6a66; --line:#e2e0da; --warn:#9a6700; }
@media (prefers-color-scheme: dark) { :root { --bg:#161615; --card:#21211f; --ink:#ecebe7; --mute:#a3a29d; --line:#363532; --warn:#e0b450; } a { color:#8ab4f8; } }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--ink); font:15px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; }
main { max-width:1100px; margin:0 auto; padding:24px 16px 64px; }
h1 { font-size:24px; margin:0 0 4px; }
h2 { font-size:19px; margin:40px 0 8px; padding-top:16px; border-top:1px solid var(--line); }
h3 { font-size:15px; margin:20px 0 6px; }
p, li { max-width:75ch; }
.meta { color:var(--mute); font-size:13px; }
.card { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:14px 16px; margin:12px 0; }
.plan { display:grid; grid-template-columns:190px 1fr; gap:4px 12px; font-size:14px; }
.plan b { color:var(--mute); font-weight:600; }
.verdict { display:inline-block; font-weight:700; font-size:12px; letter-spacing:.04em; text-transform:uppercase; padding:2px 8px; border-radius:99px; border:1px solid currentColor; }
.warn { color:var(--warn); }
.grid.wide { display:grid; gap:10px; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); }
figure { margin:0; background:var(--card); border:1px solid var(--line); border-radius:8px; overflow:hidden; }
figure img, figure video { display:block; width:100%; height:auto; background:#c9c7c1; }
figure audio { display:block; width:100%; }
figcaption { padding:6px 10px; font-size:18px; color:var(--ink); }
table { border-collapse:collapse; width:100%; font-size:13.5px; margin:8px 0; }
th, td { text-align:left; padding:6px 8px; border-bottom:1px solid var(--line); }
th { color:var(--mute); font-weight:600; }
.scroll { overflow-x:auto; }
code, pre { font:13px ui-monospace, Consolas, monospace; }
pre { background:var(--card); border:1px solid var(--line); border-radius:8px; padding:10px 12px; overflow-x:auto; }`;

export function buildPage(root) {
  const backlog = parseLedger(fs.readFileSync(path.join(root, 'librarian', 'harvest', 'backlog.jsonl'), 'utf8'));
  const benchmarks = backlog.filter((r) => r.render?.kind === 'benchmark' && (r.status === 'held' || r.status === 'measuring'));
  const benchRuns = new Set(benchmarks.map((r) => r.render.runId));

  const sealed = pendingRuns(root);
  const blind = [];
  const withheld = [];
  for (const run of sealed) {
    const s = blindSection(root, run);
    if (s.why) withheld.push({ run, why: s.why });
    else blind.push(s);
  }
  const dir = itemsDir(root);
  const unsealed = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((run) => !benchRuns.has(run) && !fs.existsSync(path.join(dir, run, 'triage', 'key.json'))).length
    : 0;
  const size = reviewSize(root);

  const decisions = blind.length ? blind.map((b) => b.html).join('\n') : '<p>No proof is waiting on you.</p>';
  const held = withheld.length
    ? `<p><span class="verdict warn">withheld</span> ${withheld.map((w) => `${esc(w.run)}: ${esc(w.why)}`).join('<br>')}</p>`
    : '';
  const paused = size.overCap
    ? '<p><span class="verdict warn">proofs paused</span> The review folder is over its cap. Answering and cleaning below lets new proofs run.</p>'
    : '';
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Shift review</title>
<style>
${STYLE}
</style>
</head>
<body>
<main>
<h1>Shift review</h1>
${paused}
${held}
${decisions}
${benchmarkSection(root, benchmarks)}
${judgedSection(root)}
${numbersSection(blind, size, unsealed)}
</main>
</body>
</html>
`;
  // The last gate, over the whole page: lower sections are built from other data than the blind ones.
  const leaked = blind.flatMap((b) => leaks(html, b.manifest));
  if (leaked.length) throw new Error(`page would reveal the arms, not written: ${leaked.join('; ')}`);
  return { html, withheld, shown: blind.length };
}

function writePage(root) {
  const page = buildPage(root);
  atomicWrite(path.join(reviewDir(root), 'index.html'), page.html);
  return page;
}

/* ---------------------------------------------------------------- commands */

function cmdBuild(argv, ctx) {
  parseArgs(argv);
  const page = writePage(ctx.root);
  ctx.log(`${path.relative(ctx.root, path.join(reviewDir(ctx.root), 'index.html')).split(path.sep).join('/')}  (${page.shown} proof(s) to judge)`);
  for (const w of page.withheld) ctx.err(`withheld ${w.run}: ${w.why}`);
  return page.withheld.length ? EXIT.VIOLATIONS : EXIT.OK;
}

function cmdSize(argv, ctx) {
  const { opts } = parseArgs(argv, { bool: ['json'] });
  const s = reviewSize(ctx.root);
  ctx.log(opts.json ? JSON.stringify(s) : `review ${s.reviewGb} GB of ${s.capGb} GB${s.overCap ? ' (OVER CAP, proofs paused)' : ''}, ${s.pending} waiting on a verdict`);
  return EXIT.OK;
}

function itemOf(runId, ctx) {
  if (!runId || !RUN_ID_RE.test(runId)) throw new UsageError('a plain <runId> is required');
  const dir = path.join(itemsDir(ctx.root), runId);
  if (!fs.existsSync(dir)) throw new UsageError(`no review item ${runId}`);
  return dir;
}

/** render-triage's answer is the answer: its output and its refusal both pass through. */
function passThrough(args, ctx) {
  const r = ctx.triage(args);
  if (String(r.stdout ?? '').trim()) ctx.log(String(r.stdout).trimEnd());
  if (String(r.stderr ?? '').trim()) ctx.err(String(r.stderr).trimEnd());
  if (r.status !== EXIT.OK) return r.status === null || r.status === undefined ? EXIT.FATAL : r.status;
  // The page must not go on asking a question that has just been answered.
  writePage(ctx.root);
  return EXIT.OK;
}

function cmdVerdict(argv, ctx) {
  // parseArgs refuses --force: replacing a recorded judgement is not something this door offers.
  const { positional: [runId, ...picks] } = parseArgs(argv);
  const dir = itemOf(runId, ctx);
  if (!picks.length) throw new UsageError('verdict needs <pairId>=<label|tie|neither> for every pair');
  return passThrough(['reveal', dir, ...picks], ctx);
}

function cmdClean(argv, ctx) {
  const { positional: [runId] } = parseArgs(argv);
  return passThrough(['clean', itemOf(runId, ctx)], ctx);
}

const USAGE = 'usage: shift-review.mjs build | size [--json] | verdict <runId> <pairId>=<label|tie|neither>... | clean <runId>';

export function main(argv, over = {}) {
  const ctx = {
    root: ROOT,
    log: (s) => console.log(s),
    err: (s) => console.error(s),
    triage: (args) => spawnSync(process.execPath, [RENDER_TRIAGE, ...args], { encoding: 'utf8', windowsHide: true, shell: false }),
    ...over,
  };
  const table = { build: cmdBuild, size: cmdSize, verdict: cmdVerdict, clean: cmdClean };
  const cmd = table[argv[0]];
  if (!cmd) { ctx.err(USAGE); return EXIT.FATAL; }
  try { return cmd(argv.slice(1), ctx); } catch (e) {
    ctx.err(e instanceof UsageError ? e.message : `FATAL: ${e.message}`);
    return EXIT.FATAL;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  installCrashDoor();
  process.exitCode = main(process.argv.slice(2));
}
