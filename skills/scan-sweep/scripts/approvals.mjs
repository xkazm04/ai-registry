#!/usr/bin/env node
// scan-sweep hand-off - file the items a run left open into Personas Approvals.
//
// Approvals -> Backlog is Personas' `dev_ideas` table. The memory outbox reaches it
// only 30 findings a pass and only when a Fleet session exits, so a sweep's
// leftovers used to sit in repo files nobody reopened. This script files them over
// the app's local HTTP door instead (POST /dev-tools/ideas, origin scan_sweep), with
// no cap, and reports per item what the app did.
//
// Usage:
//   node approvals.mjs --file <cards.jsonl> [--repo <root>] [--run-id <id>] [--dry-run] [--register]
//                      [--out <results.jsonl>] [--json]
//
// A card is one JSON object per line, the SKILL.md section 9 finding shape (scan-finding/1 fields,
// snake_case): title, body, evidence, lens, context, category, size, impact, impact_why, confidence,
// effort, risk, band, mvp, mvp_rule, mvp_why, predicted_verdict, predicted_why, predicted_by, proof,
// gate, result, method, lane, disposition, sweep_run_id, auto_decide, source. Only `title` is
// required. filing.mjs maps it to the door's body: every field top-level, scales on their native
// 1-10 (never halved), score computed by score.mjs, absent keys omitted - never defaulted. A field
// that is present but out of its scale or enum is a card that does not land (`invalid`, exit 1).
// `--run-id` stamps sweepRunId on cards that lack one. Reserve-band cards are filed like any other.
//
// Each result carries the door's `autoDecided` / `level` when it answered them (Seam A4): the door,
// not this script, decides whether an `auto_decide` card's predicted verdict becomes the decision.
//
// Exit codes: 0 every line of the file landed as a card (created / deduped / rated /
// near_duplicate), 1 at least one card failed or a line was not a card (bad JSON, no
// title, invalid field - reported by line number), 2 bad arguments, 3 Personas is not running,
// 4 the repo is not a registered Personas project (pass --register).
// With the registry's scripts/personas-door.mjs reachable, "Personas is not running" no longer exits 3: the cards are
// spooled (exit 0, durable) and replayed through the same door the next time the app is up. --no-spool restores exit 3.
// The caller deletes a source file only on exit 0: a card that did not land is
// still owed, and the file is its only record.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { handshakePath, readHandshake, connect, findProject, contextIds } from './door.mjs';
import { toFiling } from './filing.mjs';

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const opt = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const file = opt('--file');
const repo = resolve(opt('--repo', process.cwd()));
const dryRun = has('--dry-run');
const register = has('--register');
const outPath = opt('--out');
const asJson = has('--json');
const runId = opt('--run-id');

const USAGE = 'usage: approvals.mjs --file <cards.jsonl> [--repo <root>] [--run-id <id>] [--dry-run] [--register] [--out <p>] [--json]';
// --help wins over every other argument: a help flag must never file a card (personas cycle 2: a --help wrote).
if (has('--help') || has('-h')) { console.log(USAGE); process.exit(0); }
if (!file || !existsSync(file)) {
  console.error(USAGE);
  process.exit(2);
}

// A line that is not a card is still a card owed: it is reported by its line number, written to
// --out as `unreadable`, and keeps the exit at 1 - the caller deletes the file on 0, and the file
// is that card's only record.
const unreadable = [];
const cards = [];
readFileSync(file, 'utf8').split('\n').forEach((raw, i) => {
  const l = raw.trim();
  if (!l) return;
  let c;
  try { c = JSON.parse(l); } catch { unreadable.push({ line: i + 1, error: 'not JSON' }); return; }
  if (!c || typeof c !== 'object' || typeof c.title !== 'string' || !c.title.trim()) { unreadable.push({ line: i + 1, error: 'no title' }); return; }
  cards.push({ line: i + 1, card: c });
});
for (const u of unreadable) console.error(`line ${u.line}: ${u.error} - not filed, still owed`);

// Reachability first: a handshake file that outlived the app (connection refused) is as down as a missing
// one. Before 2026-10-30 only a MISSING file reached the spool, so a stale one exited 3 with the spool tool
// right there (personas, 4.9.0).
const call = connect(readHandshake());
let project;
let down = call ? null : `${handshakePath()} missing or unreadable`;
if (call) {
  try { project = await findProject(call, repo); } catch (e) { down = `Personas did not answer (${e.message})`; }
}

// App down: hand the cards to the registry's shared door tool, which validates each through filing.mjs,
// spools the valid ones durably and replays them when the app is next up (exit 0 = durable; an invalid card
// is exit 1, still owed). Without that tool this script keeps its old contract (exit 3).
if (down && !has('--no-spool') && !dryRun) {
  const here = dirname(fileURLToPath(import.meta.url));
  const cands = [process.env.AI_REGISTRY_DIR && join(process.env.AI_REGISTRY_DIR, 'scripts'), join(here, '..', '..', '..', 'scripts'), join(repo, '..', 'ai-registry', 'scripts')]
    .filter(Boolean).map((d) => join(d, 'personas-door.mjs'));
  const tool = cands.find((c) => existsSync(c));
  if (tool) {
    const r = spawnSync(process.execPath, [tool, 'ideas', 'file', '--file', file, '--repo', repo, '--origin', 'scan_sweep', ...(register ? ['--register'] : []), ...(outPath ? ['--out', outPath] : [])], { stdio: 'inherit' });
    process.exit(r.status ?? 1);
  }
}
if (down) {
  console.error(`Personas is not running (${down}). Start the app and re-run; ${cards.length + unreadable.length} cards are still owed.`);
  process.exit(3);
}
if (!project) {
  if (!register) {
    console.error(`${repo} is not a registered Personas project. Re-run with --register, or register it in the app.`);
    process.exit(4);
  }
  if (dryRun) {
    console.log(`would register ${basename(repo)} at ${repo}`);
  } else {
    project = await call('POST', '/projects', { name: basename(repo), root_path: repo });
    console.log(`registered ${project.name} (${project.id})`);
  }
}

const contexts = project ? await contextIds(call, project.id) : new Map();

const LANDED = new Set(['created', 'deduped', 'rated', 'near_duplicate']);
const results = [];
for (const { line, card } of cards) {
  const f = toFiling(card, { projectId: project ? project.id : '<unregistered>', contexts, runId });
  const title = card.title.trim().slice(0, 200);
  if (f.error) {
    console.error(`line ${line}: ${f.error} - not filed, still owed`);
    results.push({ line, title, outcome: 'invalid', error: f.error });
    continue;
  }
  if (dryRun) { results.push({ title, outcome: 'dry-run', filing: f.body }); continue; }
  try {
    const r = await call('POST', '/ideas', f.body);
    const row = { title, outcome: r.outcome, id: r.idea?.id, status: r.idea?.status, note: r.duplicateNote || r.goalNote || null };
    // Echo what the door decided about autonomy; absent means it did not say (an older app).
    if (typeof r.autoDecided === 'boolean') row.autoDecided = r.autoDecided;
    if (Number.isInteger(r.level)) row.level = r.level;
    if (f.notes.some((n) => n.startsWith('category clamped'))) row.clamped = true;
    results.push(row);
  } catch (e) {
    results.push({ title, outcome: 'error', error: e.message });
  }
}

for (const u of unreadable) results.push({ line: u.line, outcome: 'unreadable', error: u.error });

const tally = {};
for (const r of results) tally[r.outcome] = (tally[r.outcome] || 0) + 1;
if (outPath) writeFileSync(outPath, results.map((r) => JSON.stringify(r)).join('\n') + '\n');
if (asJson) {
  console.log(JSON.stringify({ project: project?.name ?? null, cards: cards.length, tally, results }, null, 2));
} else {
  console.log(`${project?.name ?? basename(repo)}: ${cards.length} cards -> ${Object.entries(tally).map(([k, v]) => `${v} ${k}`).join(', ') || 'nothing'}`);
  for (const r of results.filter((r) => r.outcome === 'error' || r.outcome === 'invalid')) console.log(`  FAILED ${r.title}: ${r.error}`);
  const auto = results.filter((r) => r.autoDecided === true);
  if (auto.length) console.log(`  ${auto.length} machine-decided by the door (L${[...new Set(auto.map((r) => r.level))].join('/L')}, 24 h veto window)`);
  const clamped = results.filter((r) => r.clamped);
  if (clamped.length) console.log(`  ${clamped.length} clamped technical -> product (a product lens's card; category is the lens's default)`);
  const accepted = results.filter((r) => r.status && r.status !== 'pending' && r.autoDecided !== true);
  if (accepted.length) console.log(`  ${accepted.length} already decided in Approvals (dedup hit on a ${[...new Set(accepted.map((r) => r.status))].join('/')} row)`);
}
// exitCode, not exit(): exiting while fetch's sockets close trips a libuv assertion on Windows.
process.exitCode = dryRun || results.every((r) => LANDED.has(r.outcome)) ? 0 : 1;
