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
 * `evaluatedAgainst`). Matching fields (`score`, `why`, `confidence`) are never rewritten.
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

const runFiles = fs.readdirSync(runsDir).filter((f) => f.endsWith('.json')).sort();
if (!runFiles.length) { console.log('merge-conform-runs: nothing to merge (0 run files)'); process.exit(0); }

const byContext = new Map(map.contexts.map((c) => [c.context, c]));
const detail = fs.existsSync(detailPath) ? JSON.parse(fs.readFileSync(detailPath, 'utf8')) : { schema: 'conform-detail/1', pairs: {} };

const stats = { files: 0, pairs: 0, merged: 0, skipped: [], states: {}, techniques: {}, deviations: [], proposals: [] };
for (const f of runFiles) {
  let run;
  try { run = JSON.parse(fs.readFileSync(path.join(runsDir, f), 'utf8')); }
  catch (e) { console.error(`${f}: not JSON (${e.message})`); process.exit(2); }
  if (!Array.isArray(run.pairs)) { console.error(`${f}: no pairs[]`); process.exit(2); }
  stats.files++;
  for (const p of run.pairs) {
    stats.pairs++;
    const ctx = byContext.get(p.context);
    if (!ctx) { stats.skipped.push(`${f}: unknown context ${p.context}`); continue; }
    const row = (ctx.subjects || []).find((s) => s.subject === p.subject);
    if (!row) { stats.skipped.push(`${f}: ${ctx.name} has no pair for ${p.subject}`); continue; }
    if (!STATES.has(p.state)) { stats.skipped.push(`${f}: ${p.subject} state "${p.state}" not in vocabulary`); continue; }
    if (p.state !== 'unknown' && !p.evidence) { stats.skipped.push(`${f}: ${p.subject} ${p.state} without evidence`); continue; }
    row.state = p.state;
    row.evidence = p.evidence || row.evidence;
    row.evaluatedAt = run.evaluatedAt || new Date().toISOString().slice(0, 10);
    row.evaluatedAgainst = map.bundleDigests[p.bundle || row.bundle] || row.evaluatedAgainst;
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
console.log(`  technique verdicts this merge: ${JSON.stringify(stats.techniques)}`);
console.log(`  map now: ${judged}/${total} pairs judged`);
for (const s of stats.skipped) console.log(`  - skipped: ${s}`);
if (stats.proposals.length) { console.log(`  registry proposals (${stats.proposals.length}):`); for (const p of stats.proposals) console.log(`  - [${p.subject} @ ${p.context}] ${p.proposal}`); }
console.log(`  technique deviations (${stats.deviations.length}) — the apply backlog:`);
for (const d of stats.deviations) console.log(`  - ${d.subject}/${d.technique} @ ${d.context}: ${d.evidence}`);
