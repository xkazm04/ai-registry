#!/usr/bin/env node
/**
 * runs-backfill - make THIS device's run log whole: drain pending rows, then measure.
 *
 * The run log (`usage/runs/<device>.jsonl`, contract in lib/runs.mjs) is written by the
 * agent at run end, and the agent can only report what it can see: a token ESTIMATE and a
 * SELF-REPORTED model. The harness transcript on this machine holds the measurement. This
 * script is the only bridge between the two, and it runs per device on purpose - the
 * transcripts never leave the machine that produced them, and neither does the machine's
 * identity, so a backfill run elsewhere would have nothing to read.
 *
 * Two passes:
 *
 *   1. DRAIN. A consuming project whose agent could not resolve the machine identity wrote
 *      its row to `<project>/.ai/skill-runs.pending.jsonl` with id and device null. Here the
 *      identity exists: stamp device + contributor, recompute the id, validate, append to
 *      the device log, then rewrite the pending file with ONLY the rows that failed - after
 *      the append succeeded, never before, so a crash loses nothing. A row whose id is
 *      already in the log (a drain that crashed between append and truncate) is dropped
 *      from pending without a second append. Pending files are looked for at the registry
 *      root, each fleet checkout, and every `.claude/worktrees/*` under either.
 *
 *   2. MEASURE. For each `provider: "claude"` row with no sidecar entry, find the session
 *      that ran it and sum its usage over the run's window into ONE sidecar row
 *      (`<device>.exact.jsonl`). The log is never rewritten - parallel sessions append to
 *      it, and a rewrite would race them. Idempotent by id: a second run appends nothing.
 *      A row that cannot be tied to a span is REPORTED as unmatched, never estimated -
 *      the sidecar's whole value is that every number in it was measured.
 *
 * Pure transcript logic lives in lib/runs-transcript.mjs (tests import it without side
 * effects); this file is the I/O around it, and exports `backfill()` for the same reason.
 *
 * Usage:  node scripts/runs-backfill.mjs [--dry-run] [--root <registry>] [--claude-projects <dir>]
 *   --root and --claude-projects exist for fixtures; the defaults are this checkout and
 *   ~/.claude/projects.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import { loadFleet } from './lib/projects.mjs';
import {
  EXACT_SCHEMA, EXACT_KEYS, MATCHED, RUN_KEYS, REGISTRY_PROJECT,
  validateRun, validateExact, runId, runsDir, runsFile, exactFile, PENDING_REL, readJsonl,
} from './lib/runs.mjs';
import { transcriptDirs, listSessions, matchRun, stampPending } from './lib/runs-transcript.mjs';

const HERE_ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

const jsonLine = (row) => `${JSON.stringify(row)}\n`;
const ordered = (row, keys) => Object.fromEntries(keys.map((k) => [k, row[k]]));
const textLines = (file) => fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim());
const parses = (l) => { try { JSON.parse(l); return true; } catch { return false; } };

/**
 * Where pending files can be. log-run writes `<cwd>/.ai/...`, and an agent's cwd is the
 * project root, a worktree under it, or the registry itself - so all three are looked at.
 * A pending file in any other subdirectory is not found - a consumer's agent that logs from
 * deeper in its tree strands the row until someone moves it.
 */
export function pendingSources(fleet, registryRoot) {
  const roots = [{ slug: REGISTRY_PROJECT, project: REGISTRY_PROJECT, path: registryRoot }];
  for (const p of Object.values(fleet.projects).sort((a, b) => a.slug.localeCompare(b.slug))) if (p.exists) roots.push({ slug: p.slug, project: p.slug, path: p.path });
  const out = [];
  for (const r of roots) {
    out.push(r);
    const wt = path.join(r.path, '.claude', 'worktrees');
    let names = [];
    try { names = fs.readdirSync(wt, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort(); } catch { /* no worktrees */ }
    for (const n of names) out.push({ slug: `${r.slug} (worktree ${n})`, project: r.project, path: path.join(wt, n) });
  }
  return out;
}

/**
 * Run both passes. Returns the summary object; `log` receives human lines.
 * Throws only for a precondition (no machine identity) - the caller maps that to FATAL.
 */
export function backfill({ registryRoot = HERE_ROOT, claudeProjects = path.join(os.homedir(), '.claude', 'projects'), dryRun = false, log = console.log } = {}) {
  const fleet = loadFleet(registryRoot);
  if (!fleet.machine) {
    const err = new Error(`this machine has no identity - ${fleet.problems.join('; ') || 'loadFleet returned no machine'}`);
    err.fatal = true;
    throw err;
  }
  const device = fleet.machine;
  const logFile = runsFile(registryRoot, device);
  const sideFile = exactFile(registryRoot, device);
  const summary = {
    device, dryRun,
    drained: 0, drainDuplicates: 0, drainInvalid: [], drainProjectMismatch: [], pendingFiles: 0,
    matched: Object.fromEntries(MATCHED.map((k) => [k, 0])), unmatched: [], skippedNonClaude: 0,
    alreadyExact: 0, invalidLogRows: 0, written: 0,
  };

  const logRows = readJsonl(logFile).rows;
  const logIds = new Set(logRows.map((r) => r?.id).filter(Boolean));
  const drainedRows = [];

  // ---------------------------------------------------------------- 1. drain
  for (const p of pendingSources(fleet, registryRoot)) {
    const pendingFile = path.join(p.path, PENDING_REL);
    if (!fs.existsSync(pendingFile)) continue;
    summary.pendingFiles += 1;
    const origLines = textLines(pendingFile);
    const keep = []; const take = [];
    for (const l of origLines) {
      if (!parses(l)) continue;
      const raw = JSON.parse(l);
      let row; let problems;
      try {
        row = stampPending(raw, { device, contributor: fleet.contributor, runId, keys: RUN_KEYS });
        problems = validateRun(row);
      } catch (e) {
        problems = [`could not stamp: ${e.message}`];
      }
      if (problems.length) {
        keep.push(l);
        summary.drainInvalid.push({ project: p.slug, skill: raw?.skill ?? null, ts: raw?.ts ?? null, problems });
        continue;
      }
      if (logIds.has(row.id)) { summary.drainDuplicates += 1; continue; }
      logIds.add(row.id);
      take.push(row);
      // Not rewritten: the project was resolved where the row was written, and a guess here
      // would be a second opinion. Named, because a slug the fleet does not know cannot be
      // measured and will surface as unmatched below.
      if (row.project !== p.project) summary.drainProjectMismatch.push({ id: row.id, project: row.project, foundIn: p.slug });
    }
    // Unparseable lines are kept verbatim - they are not ours to destroy, and the operator
    // needs to see them.
    const unparseable = origLines.filter((l) => !parses(l));
    if (unparseable.length) summary.drainInvalid.push({ project: p.slug, skill: null, ts: null, problems: [`${unparseable.length} unparseable line(s), kept verbatim`] });
    log(`  drain ${p.slug}: ${take.length} to append, ${keep.length} invalid kept${unparseable.length ? `, ${unparseable.length} unparseable kept` : ''}`);
    summary.drained += take.length;
    drainedRows.push(...take);
    if (dryRun) continue;
    if (take.length) {
      fs.mkdirSync(runsDir(registryRoot), { recursive: true });
      fs.appendFileSync(logFile, take.map(jsonLine).join(''));
    }
    // Only after the append landed. Lines a consumer appended while this ran (the file is
    // append-only, so they sit past what we read) are kept for the next drain rather than
    // lost to the rewrite.
    const nowLines = textLines(pendingFile);
    const arrived = nowLines.slice(0, origLines.length).every((l, i) => l === origLines[i]) ? nowLines.slice(origLines.length) : [];
    fs.writeFileSync(pendingFile, [...keep, ...unparseable, ...arrived].map((l) => `${l}\n`).join(''));
  }

  // ---------------------------------------------------------------- 2. measure
  const exactIds = new Set(readJsonl(sideFile).rows.map((r) => r?.id).filter(Boolean));
  const checkoutOf = (project) => {
    if (project === REGISTRY_PROJECT) return registryRoot;
    const p = fleet.projects[project];
    return p?.exists ? p.path : null;
  };
  const cache = new Map();
  const newExact = [];
  for (const row of [...logRows, ...drainedRows]) {
    if (!row || typeof row !== 'object' || typeof row.id !== 'string' || typeof row.ts !== 'string' || typeof row.skill !== 'string') { summary.invalidLogRows += 1; continue; }
    if (row.provider !== 'claude') { summary.skippedNonClaude += 1; continue; }
    if (exactIds.has(row.id)) { summary.alreadyExact += 1; continue; }
    const checkout = checkoutOf(row.project);
    if (!checkout) { summary.unmatched.push({ id: row.id, reason: `project "${row.project}" has no checkout on ${device}` }); continue; }
    const sessions = listSessions(transcriptDirs(claudeProjects, checkout), cache);
    const res = matchRun(row, sessions, { schema: EXACT_SCHEMA });
    if (res.unmatched) { summary.unmatched.push({ id: row.id, reason: res.unmatched }); continue; }
    const exact = ordered(res.exact, EXACT_KEYS);
    const problems = validateExact(exact);
    if (problems.length) { summary.unmatched.push({ id: row.id, reason: `measured row invalid: ${problems.join('; ')}` }); continue; }
    exactIds.add(row.id);
    newExact.push(exact);
    summary.matched[exact.matched] += 1;
    log(`  ${dryRun ? 'would write' : 'write'} ${row.id}: ${exact.matched} session=${exact.session} fresh=${exact.input + exact.cacheWrite + exact.output} cacheRead=${exact.cacheRead} model=${exact.model} effort=${exact.effort}`);
  }
  if (newExact.length && !dryRun) {
    fs.mkdirSync(runsDir(registryRoot), { recursive: true });
    fs.appendFileSync(sideFile, newExact.map(jsonLine).join(''));
  }
  summary.written = newExact.length;
  return summary;
}

function printSummary(s, log = console.log) {
  const m = Object.entries(s.matched).map(([k, n]) => `${k} ${n}`).join(', ');
  log(`\nruns-backfill on ${s.device}${s.dryRun ? ' (DRY RUN - nothing written)' : ''}`);
  log(`  pending: ${s.drained} ${s.dryRun ? 'would be ' : ''}drained from ${s.pendingFiles} file(s), ${s.drainDuplicates} already in the log, ${s.drainInvalid.length} invalid left in place`);
  for (const d of s.drainInvalid) log(`    - ${d.project} ${d.skill ?? '?'} ${d.ts ?? '?'}: ${d.problems.join('; ')}`);
  for (const d of s.drainProjectMismatch) log(`    ! ${d.id}: logged as project "${d.project}" but found in ${d.foundIn}'s pending file - kept as logged`);
  log(`  exact: ${s.written} ${s.dryRun ? 'would be ' : ''}written (${m}); ${s.alreadyExact} already measured; ${s.skippedNonClaude} non-claude skipped${s.invalidLogRows ? `; ${s.invalidLogRows} log row(s) without id/ts/skill ignored` : ''}`);
  log(`  unmatched: ${s.unmatched.length}`);
  for (const u of s.unmatched) log(`    - ${u.id}: ${u.reason}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const val = (flag) => { const i = argv.indexOf(flag); return i === -1 ? undefined : argv[i + 1]; };
  const opts = { dryRun: argv.includes('--dry-run') };
  if (val('--root')) opts.registryRoot = path.resolve(val('--root'));
  if (val('--claude-projects')) opts.claudeProjects = path.resolve(val('--claude-projects'));
  try {
    printSummary(backfill(opts));
    process.exit(EXIT.OK);
  } catch (e) {
    console.error(`FATAL: ${e.message}`);
    if (!e.fatal) console.error(e.stack);
    process.exit(EXIT.FATAL);
  }
}
