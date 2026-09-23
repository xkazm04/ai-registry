#!/usr/bin/env node
// EXPERIMENT — no caller in CI, CONTRIBUTING, any SKILL.md or any docs/ contract; kept because
// the parallel-worker merge it implements is the only writer that lane can safely have. Last
// used in the 2026-08-29 personas gravity backtest wave (librarian/backtests/).
/**
 * merge-conform-runs — fold parallel /conform worker verdicts into a project's registry map.
 *
 * ## The gap this closes
 *
 * `/conform` writes verdicts into `<project>/.ai/registry-map.json` in place. That is fine for
 * one worker and a collision for fifteen: N agents judging N subject groups cannot share one
 * JSON file. So a parallel backtest wave has each worker write ONE file to
 * `<project>/.ai/conform-runs/<worker>.json` (read-only everywhere else), and this script is
 * the single writer that merges them — deterministically, idempotently, and only into the
 * fields `/conform` is allowed to touch (`state`, `evidence`, `evaluatedAt`,
 * `evaluatedAgainst` - the subject's own digest - and `evaluatedRevision`), clearing `stale`
 * on a re-judged pair. An `unknown`, or an anchor below the floor, is not merged.
 * Matching fields (`score`, `why`, `confidence`) are never rewritten.
 *
 * Technique-level verdicts do not fit the map's pair-level row, so they are kept beside it in
 * `<project>/.ai/conform-detail.json`, keyed `<context>/<subject>`, replaced per pair on merge.
 * Consumed run files are moved to `.ai/conform-runs/merged/` so a re-run is a no-op.
 *
 * Usage:
 *   node scripts/experiments/merge-conform-runs.mjs <project-root> [--dry]
 *
 * Exit 2 = instrument failure (bad input); exit 0 = merged (or dry). Prints the funnel:
 * pairs merged, states, technique verdict counts, and the deviation list — the apply backlog.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const root = args.find((a) => !a.startsWith('--'));
const dry = args.includes('--dry');
if (!root) { console.error('usage: scripts/experiments/merge-conform-runs.mjs <project-root> [--dry]'); process.exit(2); }

const mapPath = path.join(root, '.ai', 'registry-map.json');
const runsDir = path.join(root, '.ai', 'conform-runs');
const detailPath = path.join(root, '.ai', 'conform-detail.json');
const STATES = new Set(['conformant', 'deviation', 'not-applicable', 'unknown']);

// Assert the instrument before the result.
if (!fs.existsSync(mapPath)) { console.error(`no registry map at ${mapPath}`); process.exit(2); }
if (!fs.existsSync(runsDir)) { console.error(`no run directory at ${runsDir}`); process.exit(2); }
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
if (!Array.isArray(map.contexts) || !map.bundleDigests) { console.error('map has no contexts/bundleDigests — not a registry map'); process.exit(2); }

// A worker file carries `pairs[]`; the run's own rkb-run-result file (which /conform §5 writes
// into this same directory) does not, and is not this script's input. Skip it rather than
// refusing the whole merge.
const runFiles = fs.readdirSync(runsDir).filter((f) => f.endsWith('.json')).sort().filter((f) => {
  try { return Array.isArray(JSON.parse(fs.readFileSync(path.join(runsDir, f), 'utf8')).pairs); }
  catch (e) { console.error(`${f}: not JSON (${e.message})`); process.exit(2); }
});
if (!runFiles.length) { console.log('merge-conform-runs: nothing to merge (0 run files)'); process.exit(0); }

// `evaluatedAgainst` is the SUBJECT's own digest as the worker read it (/conform §4), taken from
// the registry index - never the bundle digest. The first version of this script wrote the
// bundle's, so every verdict it merged read stale again after the next bundle change anywhere.
const REGISTRY = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..');
const subjectIndex = {};
for (const bundle of Object.keys(map.bundleDigests)) {
  const idx = path.join(REGISTRY, 'knowledge', bundle, 'index.json');
  if (!fs.existsSync(idx)) continue;
  for (const [slug, s] of Object.entries(JSON.parse(fs.readFileSync(idx, 'utf8')).subjects || {})) {
    subjectIndex[`${bundle}/${slug}`] = { digest: s.digest, revision: s.revision };
  }
}

// The anchor floor: the evidence's first `path:line` must name a tracked-shaped relative path
// that exists and a line that is not blank. It is a floor, not the check /conform §3 asks for
// (does the line SAY what the evidence claims) - that stays the worker's job.
function anchorProblem(evidence) {
  const m = String(evidence || '').match(/([A-Za-z0-9_.@\/-]+\.[A-Za-z0-9]+):(\d+)/);
  if (!m) return 'no path:line anchor';
  const file = path.join(root, m[1]);
  if (!fs.existsSync(file)) return `anchor ${m[1]} does not exist`;
  const line = fs.readFileSync(file, 'utf8').split(/\r?\n/)[Number(m[2]) - 1];
  if (line === undefined) return `anchor ${m[1]}:${m[2]} is past the end of the file`;
  if (!line.trim()) return `anchor ${m[1]}:${m[2]} is a blank line`;
  return null;
}

const byContext = new Map(map.contexts.map((c) => [c.context, c]));
const detail = fs.existsSync(detailPath) ? JSON.parse(fs.readFileSync(detailPath, 'utf8')) : { schema: 'conform-detail/1', pairs: {} };

const stats = { files: 0, pairs: 0, merged: 0, declined: [], skipped: [], states: {}, flips: {}, techniques: {}, deviations: [], proposals: [] };
for (const f of runFiles) {
  const run = JSON.parse(fs.readFileSync(path.join(runsDir, f), 'utf8'));
  stats.files++;
  for (const d of run.declined || []) stats.declined.push(`${f}: ${d.subject} @ ${d.context}: ${d.reason}`);
  for (const p of run.pairs) {
    stats.pairs++;
    const ctx = byContext.get(p.context);
    if (!ctx) { stats.skipped.push(`${f}: unknown context ${p.context}`); continue; }
    const row = (ctx.subjects || []).find((s) => s.subject === p.subject);
    if (!row) { stats.skipped.push(`${f}: ${ctx.name} has no pair for ${p.subject}`); continue; }
    if (!STATES.has(p.state)) { stats.skipped.push(`${f}: ${p.subject} state "${p.state}" not in vocabulary`); continue; }
    // Uncertain is not a verdict: an `unknown` must not overwrite a recorded one. Leaving the
    // pair stale is the honest record of "not re-judged"; it belongs in `declined[]`.
    if (p.state === 'unknown') { stats.declined.push(`${f}: ${p.subject} @ ${ctx.name}: returned unknown`); continue; }
    if (!p.evidence) { stats.skipped.push(`${f}: ${p.subject} ${p.state} without evidence`); continue; }
    const bad = anchorProblem(p.evidence);
    if (bad) { stats.skipped.push(`${f}: ${p.subject} @ ${ctx.name}: ${bad}`); continue; }
    const key = `${p.bundle || row.bundle}/${p.subject}`;
    const was = row.state;
    row.state = p.state;
    row.evidence = p.evidence;
    row.evaluatedAt = run.evaluatedAt || new Date().toISOString().slice(0, 10);
    row.evaluatedAgainst = subjectIndex[key]?.digest || row.digest || row.evaluatedAgainst;
    if (Number.isInteger(row.revision)) row.evaluatedRevision = row.revision;
    delete row.stale;
    const flip = `${was || 'unknown'} -> ${p.state}`;
    stats.flips[flip] = (stats.flips[flip] || 0) + 1;
    stats.merged++;
    stats.states[p.state] = (stats.states[p.state] || 0) + 1;
    for (const t of p.techniques || []) {
      stats.techniques[t.verdict] = (stats.techniques[t.verdict] || 0) + 1;
      if (t.verdict === 'deviation') stats.deviations.push({ context: ctx.name, subject: p.subject, technique: t.technique, evidence: t.evidence });
    }
    if (p.registryProposal) stats.proposals.push({ subject: p.subject, context: ctx.name, proposal: p.registryProposal });
    detail.pairs[`${p.context}/${p.subject}`] = { context: ctx.name, subject: p.subject, bundle: p.bundle || row.bundle, state: p.state, evaluatedAt: row.evaluatedAt, worker: run.worker, techniques: p.techniques || [], registryProposal: p.registryProposal };
  }
}

if (!dry) {
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n');
  fs.writeFileSync(detailPath, JSON.stringify(detail, null, 2) + '\n');
  const mergedDir = path.join(runsDir, 'merged');
  fs.mkdirSync(mergedDir, { recursive: true });
  for (const f of runFiles) fs.renameSync(path.join(runsDir, f), path.join(mergedDir, f));
}

const judged = map.contexts.reduce((n, c) => n + (c.subjects || []).filter((s) => s.state && s.state !== 'unknown').length, 0);
const total = map.contexts.reduce((n, c) => n + (c.subjects || []).length, 0);
console.log(`merge-conform-runs${dry ? ' (dry)' : ''}: ${stats.files} run file(s) · ${stats.pairs} pair verdict(s) · ${stats.merged} merged · ${stats.skipped.length} skipped`);
console.log(`  pair states this merge: ${JSON.stringify(stats.states)}`);
console.log(`  verdict movement (was -> now): ${JSON.stringify(stats.flips)}`);
console.log(`  declined, left stale (${stats.declined.length}):`);
for (const d of stats.declined) console.log(`  - ${d}`);
console.log(`  technique verdicts this merge: ${JSON.stringify(stats.techniques)}`);
console.log(`  map now: ${judged}/${total} pairs judged`);
for (const s of stats.skipped) console.log(`  - skipped: ${s}`);
if (stats.proposals.length) { console.log(`  registry proposals (${stats.proposals.length}):`); for (const p of stats.proposals) console.log(`  - [${p.subject} @ ${p.context}] ${p.proposal}`); }
console.log(`  technique deviations (${stats.deviations.length}) — the apply backlog:`);
for (const d of stats.deviations) console.log(`  - ${d.subject}/${d.technique} @ ${d.context}: ${d.evidence}`);
