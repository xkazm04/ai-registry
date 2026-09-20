#!/usr/bin/env node
/**
 * check-context-coverage — how much of each project the registry can even see.
 *
 * Everything downstream of the context map inherits its blind spots. `/conform` judges
 * pairs, pairs hang off contexts, and a context is a named set of file paths — so a source
 * file in no context is a file no standard can ever be applied to, no matter how good the
 * corpus is or how diligent the session. That gap is invisible from every instrument we
 * had: the registry map reports `contextsWithMissingPaths` (contexts pointing at files that
 * are gone) and has no field at all for the opposite and more common direction, files that
 * no context points at.
 *
 * It is also invisible from the map's own `paths`, which is a TWELVE-PATH SAMPLE
 * (`build-registry-map.mjs` publishes `c.paths.slice(0, 12)` while matching against up to
 * sixty). Reading "this file is in no context" off the map is therefore wrong, and a
 * conform wave on 2026-09-20 produced three reports that did exactly that. This script
 * reads the project's `context-map.json` directly, where the full `filePaths` live.
 *
 * Two numbers per project, and they fail differently:
 *
 *   COVERAGE   tracked source files that some context claims. Low coverage means the
 *              registry is governing a fraction of the repo and reporting nothing about
 *              the rest.
 *   DEAD PATHS context entries pointing at files that no longer exist. High dead-path
 *              counts mean the map is describing a tree that moved on, and a verdict
 *              written against such a context is about code nobody has.
 *
 * Both are properties of the CONTEXT MAP, which this repository does not own and cannot
 * regenerate — that is `/project-populate` in the consuming project. So this script is
 * deliberately a report, not a gate: it says what is unreachable and how stale the reach
 * is, and the fix lives in the other repo.
 *
 * Usage:
 *   node check-context-coverage.mjs                 # table for every project on this machine
 *   node check-context-coverage.mjs --project kp    # one
 *   node check-context-coverage.mjs --json          # machine-readable
 *   node check-context-coverage.mjs --uncovered kp  # list that project's uncovered dirs
 *
 * Exits 0 when it ran. 2 when it could not (no machine bridge).
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadFleet } from './lib/projects.mjs';
import { EXIT } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const valueOf = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };

if (has('--help') || has('-h')) {
  console.log('usage: node check-context-coverage.mjs [--project <slug>] [--json] [--uncovered <slug>]');
  process.exit(EXIT.OK);
}

/**
 * What counts as a source file. Deliberately narrow: a context map is a partition of the
 * code a developer reasons about, not of every tracked byte. Counting lockfiles, fixtures
 * and generated bundles would manufacture a coverage gap that no context map should ever
 * close, and a number nobody can act on is worse than no number.
 */
const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|rs|py|go|java|kt|swift|rb|php|vue|svelte|astro)$/;
const NOT_SOURCE = new RegExp(
  '(^|/)(' + [
    'node_modules', 'dist', 'build', 'out', 'target', '\\.next', '\\.nuxt', 'coverage',
    'vendor', 'third_party', '__generated__', 'generated', '__snapshots__', '__fixtures__',
    'fixtures', 'e2e-results', 'playwright-report', 'storybook-static', '\\.worktrees',
    '\\.claude', '\\.git',
  ].join('|') + ')(/|$)'
);
/** Generated or machine-authored files a human never places in a context. */
const GENERATED = /(\.generated\.|\.gen\.|\.d\.ts$|bindings?\/|locales?\/[a-z-]{2,5}\.json$)/;

const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };

/** Every context in a map, whatever shape the exporter used. */
function contextsOf(cm) {
  const out = [];
  for (const g of cm.groups ?? []) for (const c of g.contexts ?? []) out.push(c);
  for (const c of cm.ungrouped ?? []) out.push(c);
  if (Array.isArray(cm.contexts)) for (const c of cm.contexts) out.push(c);
  return out;
}

const DAY = 86_400_000;
const ageDays = (iso) => { const t = Date.parse(iso ?? ''); return Number.isFinite(t) ? Math.floor((Date.now() - t) / DAY) : null; };

function measure(repo) {
  const cmPath = path.join(repo, 'context-map.json');
  const cm = readJson(cmPath);
  if (!cm) return { error: 'no context-map.json' };

  const r = spawnSync('git', ['ls-files'], { cwd: repo, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  if (r.status !== 0) return { error: 'git ls-files failed' };

  const tracked = r.stdout.split('\n').map((s) => s.trim()).filter(Boolean);
  const trackedSet = new Set(tracked);
  const source = tracked.filter((f) => SOURCE_EXT.test(f) && !NOT_SOURCE.test(f) && !GENERATED.test(f));

  const claimed = new Set();
  const ctxs = contextsOf(cm);
  let withId = 0;
  for (const c of ctxs) {
    if (c.id !== undefined && c.id !== null) withId += 1;
    for (const f of c.filePaths ?? c.file_paths ?? []) claimed.add(String(f).replace(/\\/g, '/'));
  }

  const uncovered = source.filter((f) => !claimed.has(f));
  // A claimed path that is not tracked any more. Restricted to source files so a context
  // naming a deleted config does not read as rot in the code partition.
  const dead = [...claimed].filter((f) => !trackedSet.has(f) && SOURCE_EXT.test(f));

  const byDir = new Map();
  for (const f of uncovered) {
    const d = f.split('/').slice(0, 2).join('/') || '.';
    byDir.set(d, (byDir.get(d) ?? 0) + 1);
  }

  return {
    contexts: ctxs.length,
    // The key the registry map will use. Without ids on EVERY context the key is
    // `<group>/<name>`, so renaming a context or moving it between groups mints a new key
    // and its verdicts orphan. That is the difference between a safe context-map refresh
    // and one that discards the expensive half of every /conform run.
    keyedById: ctxs.length > 0 && withId === ctxs.length,
    source: source.length,
    covered: source.length - uncovered.length,
    uncovered: uncovered.length,
    pct: source.length ? Math.round((100 * (source.length - uncovered.length)) / source.length) : null,
    dead: dead.length,
    age: ageDays(cm.generatedAt ?? cm.generated_at ?? null),
    hotDirs: [...byDir.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
    uncoveredList: uncovered,
  };
}

const fleet = loadFleet(ROOT);
if (!fleet.machine) {
  console.error('check-context-coverage: no .machine.local.json — no fleet to measure.');
  process.exit(EXIT.FATAL);
}

const only = valueOf('--project') ?? valueOf('--uncovered');
const rows = [];
for (const p of Object.values(fleet.projects)) {
  if (only && p.slug !== only) continue;
  if (!p.exists) continue;
  rows.push({ slug: p.slug, ...measure(p.path) });
}

if (valueOf('--uncovered')) {
  const r = rows[0];
  if (!r || r.error) { console.error(`no measurement for ${only}: ${r?.error ?? 'not found'}`); process.exit(EXIT.FATAL); }
  console.log(`${only}: ${r.uncovered} uncovered source file(s) of ${r.source}\n`);
  for (const [d, n] of r.hotDirs) console.log(`  ${String(n).padStart(5)}  ${d}/`);
  console.log('\nfull list:');
  for (const f of r.uncoveredList.slice(0, 200)) console.log(`  ${f}`);
  if (r.uncoveredList.length > 200) console.log(`  …and ${r.uncoveredList.length - 200} more`);
  process.exit(EXIT.OK);
}

if (has('--json')) {
  console.log(JSON.stringify(rows.map(({ uncoveredList, ...r }) => r), null, 1));
  process.exit(EXIT.OK);
}

console.log(`check-context-coverage — machine ${fleet.machine}, ${rows.length} project(s)\n`);
console.log('  project            ctx   source  covered    %   uncovered  dead  map age  key');
let tS = 0, tC = 0, tU = 0, tD = 0;
for (const r of rows.sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101))) {
  if (r.error) { console.log(`  ${r.slug.padEnd(18)} ${r.error}`); continue; }
  tS += r.source; tC += r.covered; tU += r.uncovered; tD += r.dead;
  console.log(
    `  ${r.slug.padEnd(18)} ${String(r.contexts).padStart(3)}  ${String(r.source).padStart(6)}  ` +
    `${String(r.covered).padStart(7)}  ${String(r.pct ?? '-').padStart(3)}%  ${String(r.uncovered).padStart(9)}  ` +
    `${String(r.dead).padStart(4)}  ${String(r.age ?? '?').padStart(5)}d  ${r.keyedById ? 'id' : 'group/name'}`
  );
}
console.log('');
console.log(`  TOTAL ${tC} of ${tS} source file(s) reachable (${tS ? Math.round((100 * tC) / tS) : 0}%), ${tU} unreachable, ${tD} dead context path(s).`);
console.log('');
console.log('  A file in no context can never be judged, however good the corpus is. Coverage is a');
console.log('  property of the project\'s own context-map.json, which this registry cannot regenerate;');
console.log('  the fix is /project-populate in that repo. `key: group/name` means a context rename');
console.log('  there mints a new key and ORPHANS its verdicts — refresh those with care.');
process.exit(EXIT.OK);
