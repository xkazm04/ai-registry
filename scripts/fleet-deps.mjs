#!/usr/bin/env node
/**
 * fleet-deps — the OPERATOR-SIDE instrument for the dependency lane.
 *
 * Sibling of fleet-audit.mjs, which answers the same shape of question about SKILLS:
 * the registry cannot see any installation, so it cannot answer "what is actually
 * installed across the fleet". This script runs where the checkouts are, reads the
 * fleet config (committed `projects.json` + local `.machine.local.json`), and reports two things the manifests alone
 * cannot tell you:
 *
 *   - DRIFT: one dependency resolved to different versions across projects that are
 *     nominally on the same line. The manifest is a wish; the lockfile is the fact, and
 *     a fleet reading its own manifests will report itself as coherent when it is not.
 *   - FLOOR: whether every project is at or above a given version. This is the advisory
 *     lane. A security advisory publishes "patched in X"; the only question that matters
 *     to a fleet is whether anyone is below X, and it deserves an exit code rather than
 *     a paragraph. `--min` makes it a gate.
 *
 * Why this is not a flag on fleet-audit: that instrument's charter is one home per skill
 * name, and its report is organised by skill. Dependencies are a different axis over the
 * same bridge, and one report answering two questions answers neither well.
 *
 * Zero dependencies. Paths never leave this machine: the report prints slugs, exactly as
 * fleet-audit does — only `.machine.local.json` is gitignored, because this registry publishes
 * no consumer paths.
 *
 *   node scripts/fleet-deps.mjs                          # drift across all shared deps
 *   node scripts/fleet-deps.mjs --dep next               # one dependency, every project
 *   node scripts/fleet-deps.mjs --dep next --min 16.3.3  # exit 1 if any project is below
 *   node scripts/fleet-deps.mjs --json
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadBridge } from './lib/projects.mjs';

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); return i === -1 ? null : args[i + 1] ?? null; };
const has = (n) => args.includes(n);
const ONLY_DEP = flag('--dep');
const MIN = flag('--min');
const AS_JSON = has('--json');

// ---- semver, the small honest subset ------------------------------------------------
// Enough for comparing resolved lockfile versions, which are always exact. Prerelease
// tags sort BEFORE their release (16.4.0-canary.1 < 16.4.0), which is the rule that
// matters for a floor check against a fleet that may run a canary.
function parse(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?/.exec(String(v ?? '').trim());
  if (!m) return null;
  return { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] ?? null };
}
function cmp(a, b) {
  const x = parse(a), y = parse(b);
  if (!x || !y) return null;
  for (const k of ['major', 'minor', 'patch']) if (x[k] !== y[k]) return x[k] < y[k] ? -1 : 1;
  if (x.pre === y.pre) return 0;
  if (x.pre === null) return 1;      // release > prerelease
  if (y.pre === null) return -1;
  return x.pre < y.pre ? -1 : 1;
}

// ---- assert the instrument before it reports anything --------------------------------
// A comparator that is wrong is worse than absent here: it would report a vulnerable
// fleet as patched. These are the cases that actually decide a floor check.
const SELF = [
  ['16.3.3', '16.3.0', 1], ['16.3.0', '16.3.3', -1], ['16.3.3', '16.3.3', 0],
  ['16.2.10', '16.3.0', -1],          // minor beats a larger patch number
  ['16.3.10', '16.3.9', 1],           // numeric, not lexicographic
  ['16.4.0-canary.1', '16.4.0', -1],  // prerelease sorts below its release
  ['15.5.24', '16.0.0', -1],
];
for (const [a, b, want] of SELF) {
  if (cmp(a, b) !== want) {
    console.error(`fleet-deps: SELF-CHECK FAILED — cmp(${a}, ${b}) = ${cmp(a, b)}, expected ${want}`);
    process.exit(2);
  }
}
if (parse('not-a-version') !== null) {
  console.error('fleet-deps: SELF-CHECK FAILED — garbage parsed as a version');
  process.exit(2);
}

// ---- the bridge ----------------------------------------------------------------------
const bridge = loadBridge(process.cwd());
if (!Object.keys(bridge.projects).length) {
  console.error('fleet-deps: this machine resolves no projects.');
  for (const p of bridge._fleet.problems) console.error(`  - ${p}`);
  console.error('  Expected a committed projects.json plus a local .machine.local.json.');
  console.error('  See librarian/projects.md for the published half.');
  process.exit(2);
}
const projects = bridge.projects ?? {};

const readJSON = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };

// slug -> { dep -> { range, resolved } }
const fleet = {};
const missing = [];
for (const [slug, meta] of Object.entries(projects)) {
  const dir = meta.path;
  const pkg = readJSON(path.join(dir, 'package.json'));
  if (!pkg) { missing.push(slug); continue; }
  const lock = readJSON(path.join(dir, 'package-lock.json'));
  const declared = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  const row = {};
  for (const [dep, range] of Object.entries(declared)) {
    if (ONLY_DEP && dep !== ONLY_DEP) continue;
    const locked = lock?.packages?.[`node_modules/${dep}`]?.version ?? null;
    row[dep] = { range: String(range), resolved: locked };
  }
  fleet[slug] = row;
}

// ---- drift: one dep, more than one resolved version across the fleet -----------------
const byDep = {};
for (const [slug, row] of Object.entries(fleet)) {
  for (const [dep, info] of Object.entries(row)) {
    (byDep[dep] ??= []).push({ slug, ...info });
  }
}
const shared = Object.entries(byDep).filter(([, rows]) => rows.length > 1);
const drifted = shared.filter(([, rows]) => new Set(rows.map((r) => r.resolved ?? '?')).size > 1);

// ---- floor check ---------------------------------------------------------------------
let below = [];
if (MIN) {
  if (!ONLY_DEP) { console.error('fleet-deps: --min requires --dep'); process.exit(2); }
  if (!parse(MIN)) { console.error(`fleet-deps: --min "${MIN}" is not a version`); process.exit(2); }
  for (const r of byDep[ONLY_DEP] ?? []) {
    if (r.resolved === null) { below.push({ ...r, why: 'no lockfile entry' }); continue; }
    if (cmp(r.resolved, MIN) < 0) below.push({ ...r, why: `below ${MIN}` });
  }
}

if (AS_JSON) {
  console.log(JSON.stringify({ fleet, drifted: drifted.map(([d]) => d), below, missing }, null, 2));
  process.exit(below.length ? 1 : 0);
}

// ---- report ---------------------------------------------------------------------------
console.log(`fleet-deps — ${new Date().toISOString().slice(0, 10)}`);
console.log(`  ${Object.keys(fleet).length} project(s) with a package.json` +
            (missing.length ? `; no manifest: ${missing.join(', ')}` : ''));
console.log();

if (ONLY_DEP) {
  const rows = byDep[ONLY_DEP] ?? [];
  if (!rows.length) { console.log(`  no project declares "${ONLY_DEP}"`); process.exit(0); }
  console.log(`  ${ONLY_DEP.toUpperCase()} across the fleet`);
  console.log(`    ${'project'.padEnd(16)} ${'manifest'.padEnd(12)} resolved`);
  for (const r of rows.sort((a, b) => a.slug.localeCompare(b.slug))) {
    const loose = /^[\^~]|\|\||\s-\s|\*/.test(r.range);
    const mark = r.resolved === null ? '  (not in lockfile)'
      : below.some((b) => b.slug === r.slug) ? '  <-- BELOW FLOOR'
      : loose ? '  (loose range; the lockfile is the fact)' : '';
    console.log(`    ${r.slug.padEnd(16)} ${r.range.padEnd(12)} ${String(r.resolved ?? '?').padEnd(10)}${mark}`);
  }
  console.log();
} else {
  console.log('  DRIFT — a shared dependency resolved to more than one version');
  if (!drifted.length) {
    console.log(`    none across ${shared.length} shared dependencies`);
  } else {
    for (const [dep, rows] of drifted.sort((a, b) => b[1].length - a[1].length)) {
      const versions = [...new Set(rows.map((r) => r.resolved ?? '?'))].sort();
      console.log(`    ${dep.padEnd(28)} ${versions.join(' , ')}`);
      for (const r of rows.sort((a, b) => a.slug.localeCompare(b.slug))) {
        console.log(`      ${r.slug.padEnd(16)} ${String(r.resolved ?? '?').padEnd(12)} (manifest ${r.range})`);
      }
    }
  }
  console.log();
  console.log(`  ${drifted.length} drifted / ${shared.length} shared / ${Object.keys(byDep).length} total dependencies`);
  console.log('  Ask a floor question with:  node scripts/fleet-deps.mjs --dep <name> --min <version>');
}

if (MIN) {
  if (below.length) {
    console.log(`  FLOOR — ${below.length} project(s) below ${ONLY_DEP}@${MIN}:`);
    for (const b of below) console.log(`    ${b.slug.padEnd(16)} ${String(b.resolved ?? '?').padEnd(12)} ${b.why}`);
    process.exit(1);
  }
  console.log(`  FLOOR — every project is at or above ${ONLY_DEP}@${MIN}.`);
}
