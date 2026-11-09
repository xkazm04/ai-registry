#!/usr/bin/env node
/**
 * pick-projects - rank the connected fleet for today's daybreak run.
 *
 * WHY: the daily loop has a bounded budget, so the order decides what gets swept. Projects
 * that never synced with the registry go first (a sweep there also gets the map built),
 * then the one swept longest ago. A frozen project is skipped, never swept.
 *
 *   node pick-projects.mjs [--registry-root <dir>] [--stale-days 30] [--limit N]
 *
 * Read-only: it reads each checkout's .ai/registry-map.json, .ai/consults.jsonl mtime and an
 * optional freeze marker, and the vault ledger. It writes nothing. Output is a JSON list of
 * {slug, root, synced, lastSweep, reasons[]}; `root` is the relative label from projects.json,
 * never an absolute path.
 *
 * Freeze record (the repo defines none, so this tool does): a project is frozen when its
 * checkout holds .ai/freeze.json or .ai/FREEZE, or the vault's Daybreak/freeze.json lists the
 * slug. Rationale goes in the file; this script only checks that it exists.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { EXIT, installCrashDoor } from '../../../scripts/lib/exit-codes.mjs';
import { loadFleet } from '../../../scripts/lib/projects.mjs';
import { lastSweeps, vaultRoot, safeJoin } from './vault-ledger.mjs';

/**
 * Pure ranking. rows: {slug, root, synced, lastSweep|null, frozen, reasons[]}.
 * Frozen rows are dropped; unsynced first; then never-swept before swept, oldest sweep
 * first; slug as the final tiebreak so the order is deterministic.
 */
export function rank(rows) {
  const t = (r) => (r.lastSweep ? Date.parse(r.lastSweep) : -Infinity);
  return rows
    .filter((r) => !r.frozen)
    .sort((a, b) => (a.synced === b.synced ? 0 : a.synced ? 1 : -1) || t(a) - t(b) || a.slug.localeCompare(b.slug))
    .map(({ slug, root, synced, lastSweep, reasons }) => ({ slug, root, synced, lastSweep: lastSweep ?? null, reasons }));
}

const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };

/** Inspect one checkout. now is injected for the age math. */
export function inspect(project, { sweeps = {}, vaultFrozen = {}, staleDays = 30, now = Date.now() } = {}) {
  const reasons = [];
  const row = { slug: project.slug, root: project.relPath ?? project.slug, lastSweep: sweeps[project.slug] ?? null, frozen: false };
  if (!project.exists) return { ...row, synced: false, frozen: true, reasons: ['checkout-missing'] };
  const ai = path.join(project.path, '.ai');
  if (fs.existsSync(path.join(ai, 'freeze.json')) || fs.existsSync(path.join(ai, 'FREEZE')) || vaultFrozen[project.slug]) {
    return { ...row, synced: false, frozen: true, reasons: ['frozen'] };
  }
  const map = readJson(path.join(ai, 'registry-map.json'));
  let judged = 0;
  for (const c of map?.contexts ?? []) for (const s of c.subjects ?? []) if (s.state && s.state !== 'unknown') judged += 1;
  if (!map) reasons.push('no-registry-map');
  else if (judged === 0) reasons.push('map-has-no-judged-pairs');
  let consultAge = null;
  try { consultAge = (now - fs.statSync(path.join(ai, 'consults.jsonl')).mtimeMs) / 86400000; } catch { /* absent */ }
  if (consultAge === null) reasons.push('no-consults');
  else if (consultAge > staleDays) reasons.push(`consults-${Math.floor(consultAge)}d-old`);
  const synced = map !== null && judged > 0 && consultAge !== null && consultAge <= staleDays;
  if (synced) reasons.push('synced');
  if (!row.lastSweep) reasons.push('never-swept');
  return { ...row, synced, reasons };
}

function main() {
  installCrashDoor();
  const argv = process.argv.slice(2);
  const arg = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
  const registryRoot = path.resolve(arg('--registry-root', process.cwd()));
  const fleet = loadFleet(registryRoot);
  if (fleet.problems.length && !Object.keys(fleet.projects).length) {
    console.error(`FATAL: ${fleet.problems.join('; ')}`);
    process.exit(EXIT.FATAL);
  }
  const vault = vaultRoot();
  const sweeps = lastSweeps(vault);
  let vaultFrozen = {};
  if (vault) vaultFrozen = readJson(safeJoin(vault, 'freeze.json')) ?? {};
  const rows = Object.values(fleet.projects).map((p) => inspect(p, { sweeps, vaultFrozen, staleDays: Number(arg('--stale-days', 30)) }));
  const limit = Number(arg('--limit', 0));
  const out = rank(rows);
  console.log(JSON.stringify(limit > 0 ? out.slice(0, limit) : out, null, 2));
  process.exit(EXIT.OK);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
