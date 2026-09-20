#!/usr/bin/env node
/**
 * converge — the loop that makes the registry and the fleet agree, and says so out loud.
 *
 * Everything this script runs already existed. `build-registry-map.mjs` rebuilds the join,
 * `leads-collect.mjs` folds project-originated findings into the librarian's inbox,
 * `signals-collect.mjs` folds consult counts into the public signals lane,
 * `build-fleet-map.mjs` inverts coverage. Each is correct. Each is operator-triggered.
 * And NONE of them can run in CI, because they all need `.machine.local.json`, which is
 * gitignored on purpose — the fleet's absolute roots are not publishable.
 *
 * So the whole apparatus converges only when a human remembers, and the measured result
 * of relying on that is: thirteen of thirteen project maps stale at once, 228 verdicts
 * judged against subjects that had since changed, 193 leads sitting in project ledgers
 * for up to three weeks, a signals file 22 days old, a usage file 28 days old, and the
 * one aggregate view of fleet coverage itself stale. Nothing was broken. Nobody ran it.
 *
 * This script is the one command, and — the part that actually changes the outcome — it
 * leaves behind a COMMITTED artifact, `librarian/fleet-coverage.md`, whose age a CI gate
 * can check even though CI can never see the fleet. That indirection is the whole trick:
 * the fleet cannot be measured from CI, but the freshness of a measurement can be, so
 * drift stops being invisible without CI ever needing fleet access.
 *
 * The report is public-safe by the librarian lane's rule: project slugs, counts and dates.
 * Never a checkout path, never a file name from a consumer's tree.
 *
 * Usage:
 *   node converge.mjs --check            # read-only; exit 1 if anything is stale
 *   node converge.mjs                    # run every phase, write the report
 *   node converge.mjs --only report      # maps|leads|signals|fleet-map|discover|report
 *   node converge.mjs --dry-run          # say what would run, run nothing
 *   node converge.mjs --pending          # compute each project's pending queue
 *   node converge.mjs --pending --write  # ...and write .ai/registry-pending.md into it
 *
 * Exits 0 when nothing is stale, 1 under --check when something is, 2 if it could not run.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadFleet } from './lib/projects.mjs';
import { EXIT } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const REPORT = path.join(ROOT, 'librarian', 'fleet-coverage.md');

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const valueOf = (n, d = null) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };

if (has('--help') || has('-h')) {
  console.log('usage: node converge.mjs [--check] [--dry-run] [--pending [--write]]');
  console.log('       node converge.mjs --only maps|leads|signals|fleet-map|discover|report|pending');
  process.exit(EXIT.OK);
}

const checkOnly = has('--check');
const dryRun = has('--dry-run');
const only = valueOf('--only');
// `--pending` is an exclusive MODE, not an extra phase. Treating it as a suffix made a
// request to compute the queue also rebuild maps, fold 195 leads and refresh the fleet
// map, which is a lot of writing to ask for by accident.
const pendingMode = has('--pending') || only === 'pending';
const wants = (phase) => (pendingMode ? phase === 'pending' : !only || only === phase);

const fleet = loadFleet(ROOT);
if (!fleet.machine) {
  console.error('converge: no .machine.local.json — this machine has no identity and no fleet to converge.');
  console.error('This is also why none of these phases can run in CI. The committed report is what CI checks.');
  process.exit(EXIT.FATAL);
}

const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };
const run = (script, args = []) => {
  if (dryRun) { console.log(`  would run: ${script} ${args.join(' ')}`); return { status: 0, stdout: '', dry: true }; }
  return spawnSync(process.execPath, [path.join(ROOT, 'scripts', script), ...args], { encoding: 'utf8' });
};

const notes = [];
const DAY = 86_400_000;
const ageDays = (iso) => { const t = Date.parse(iso ?? ''); return Number.isFinite(t) ? Math.floor((Date.now() - t) / DAY) : null; };

// ---------------------------------------------------------------------------
// Phase: discover — who is on this machine that nobody declared?
// ---------------------------------------------------------------------------

/**
 * `loadFleet` iterates the DECLARED checkouts and resolves anything else to nothing,
 * without erroring — a deliberate choice (the fleet is bigger than one box) with a silent
 * cost: a project that carries a manifest, consults and leads but never made it into
 * projects.json is invisible to every collector, permanently, and nothing says so. Two
 * such repos are on this machine right now. This phase is the thing that says so.
 */
function discover() {
  const base = readJson(path.join(ROOT, '.machine.local.json'))?.root;
  if (!base || !fs.existsSync(base)) return { scanned: 0, undeclared: [], quiet: [] };
  const declared = new Set(Object.values(fleet.projects).map((p) => path.resolve(p.path).toLowerCase()));
  const found = [];
  const quiet = [];
  let scanned = 0;

  /** `repo.name` out of a manifest — the project's own claim about which project it IS. */
  const repoName = (dir) => {
    try {
      const text = fs.readFileSync(path.join(dir, '.ai', 'manifest.yaml'), 'utf8');
      return /^repo:\s*\n\s*name:\s*(.+)$/m.exec(text)?.[1].trim().replace(/^["']|["']$/g, '') ?? null;
    } catch { return null; }
  };

  /**
   * IDENTITY, not location, decides whether an undeclared checkout is a new project.
   *
   * The obvious tests all fail here, and each failure is instructive. A path-name skip
   * list is machine-specific. A ledger test fails because benchmark clones RAN the skills
   * and so carry real consults. An origin-remote test fails because none of these
   * checkouts has a remote at all. What does work is the manifest's own `repo.name`: a
   * benchmark clone of `kp` declares `name: kp`, byte-identical to the declared project,
   * while a genuinely unregistered project declares a name nothing else claims. The
   * artifact that says what a project is turns out to be the artifact that says whether
   * it is a copy.
   */
  const declaredNames = new Set();
  for (const p of Object.values(fleet.projects)) {
    declaredNames.add(p.slug.toLowerCase());
    const n = p.exists ? repoName(p.path) : null;
    if (n) declaredNames.add(n.toLowerCase());
  }

  const active = (dir) => {
    for (const f of ['consults.jsonl', 'registry-leads.jsonl', 'councils.jsonl']) {
      const p = path.join(dir, '.ai', f);
      try { if (fs.statSync(p).size > 0) return true; } catch { /* absent */ }
    }
    return false;
  };

  const note = (label, dir) => {
    const n = repoName(dir);
    // A copy of something already declared. Its knowledge has a home; this one is a shadow.
    if (n && declaredNames.has(n.toLowerCase())) return;
    // A git worktree's .git is a FILE pointing into its parent — also a copy.
    try { if (fs.statSync(path.join(dir, '.git')).isFile()) return; } catch { /* no .git at all */ }
    if (active(dir)) found.push(label); else quiet.push(label);
  };
  // One level under the machine root, then one more: checkouts live at <root>/<group>/<repo>
  // or <root>/<repo>. Deeper than that is a monorepo's business, not the fleet's.
  const dirs = (d) => { try { return fs.readdirSync(d, { withFileTypes: true }).filter((e) => e.isDirectory()); } catch { return []; } };
  for (const lvl1 of dirs(base)) {
    const p1 = path.join(base, lvl1.name);
    scanned += 1;
    if (fs.existsSync(path.join(p1, '.ai', 'manifest.yaml')) && !declared.has(path.resolve(p1).toLowerCase())) note(lvl1.name, p1);
    for (const lvl2 of dirs(p1)) {
      const p2 = path.join(p1, lvl2.name);
      scanned += 1;
      if (fs.existsSync(path.join(p2, '.ai', 'manifest.yaml')) && !declared.has(path.resolve(p2).toLowerCase())) note(`${lvl1.name}/${lvl2.name}`, p2);
    }
  }
  return { scanned, undeclared: found, quiet };
}

// ---------------------------------------------------------------------------
// Per-project facts, read from committed artifacts and machine-local ledgers.
// ---------------------------------------------------------------------------

function ledgerCounts(repo, file, days = 30) {
  const p = path.join(repo, '.ai', file);
  if (!fs.existsSync(p)) return null;
  const cutoff = Date.now() - days * DAY;
  let total = 0, recent = 0, missed = 0, newest = null;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim(); if (!t) continue;
    let row; try { row = JSON.parse(t); } catch { continue; }
    total += 1;
    const ts = Date.parse(row.ts ?? '');
    if (Number.isFinite(ts)) { if (!newest || ts > newest) newest = ts; if (ts >= cutoff) { recent += 1; if (row.outcome === 'missed') missed += 1; } }
  }
  return { total, recent, missed, newest: newest ? new Date(newest).toISOString().slice(0, 10) : null };
}

function projectRow(p) {
  const row = { slug: p.slug, exists: p.exists };
  if (!p.exists) return row;
  const map = readJson(path.join(p.path, '.ai', 'registry-map.json'));
  if (map) {
    let pairs = 0, judged = 0;
    for (const c of map.contexts ?? []) for (const s of c.subjects ?? []) { pairs += 1; if (s.state && s.state !== 'unknown') judged += 1; }
    row.contexts = map.contexts?.length ?? 0;
    row.pairs = pairs;
    row.judged = judged;
    row.mapAge = ageDays(map.generatedAt);
    row.stale = map.stats?.staleVerdicts ?? 0;
    row.arrived = map.stats?.arrivedContexts ?? 0;
    row.orphaned = map.stats?.orphanedVerdicts ?? 0;
  }
  row.consults = ledgerCounts(p.path, 'consults.jsonl');
  row.leads = ledgerCounts(p.path, 'registry-leads.jsonl');
  row.hasManifest = fs.existsSync(path.join(p.path, '.ai', 'manifest.yaml'));
  return row;
}

// ---------------------------------------------------------------------------
// Phases
// ---------------------------------------------------------------------------

console.log(`converge — machine ${fleet.machine}, ${Object.keys(fleet.projects).length} declared project(s)${checkOnly ? ' [check only]' : ''}\n`);

if (!checkOnly && wants('maps')) {
  console.log('maps: rebuilding every project map that resolves on this machine');
  const r = run('build-registry-map.mjs');
  if (!r.dry && r.status !== 0 && r.status !== 1) notes.push(`build-registry-map exited ${r.status}`);
}

if (!checkOnly && wants('leads')) {
  console.log('leads: folding project-originated leads into librarian/inbox.md');
  const r = run('leads-collect.mjs', ['--since-days', '365']);
  if (!r.dry && r.stdout) {
    const m = /(\d+)\s+new lead/.exec(r.stdout);
    if (m) console.log(`  ${m[1]} lead(s) appended`);
  }
}

if (!checkOnly && wants('signals')) {
  // The identity guard. `.machine.local.json` declares a contributor; the signals lane may
  // already hold a DIFFERENT id for this same installation. Minting the declared one then
  // splits one installation's telemetry across two public files, and docs/telemetry-identity.md
  // is explicit that a rename is an evidence-backed migration in identity-aliases.json,
  // never an inference from similar names. So: reuse what exists, and say what we saw.
  const declared = fleet.contributor;
  const existing = fs.existsSync(path.join(ROOT, 'signals'))
    ? fs.readdirSync(path.join(ROOT, 'signals')).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''))
    : [];
  const mine = existing.filter((id) => {
    const j = readJson(path.join(ROOT, 'signals', `${id}.json`));
    return j?.app === 'ai-registry-scripts';
  });
  if (declared && mine.length && !mine.includes(declared)) {
    notes.push(
      `signals SKIPPED: .machine.local.json declares contributor "${declared}" but this lane already holds ` +
      `${mine.map((m) => `"${m}"`).join(', ')} for the same app. Collecting would create a SECOND public identity ` +
      `for one installation. Resolve it deliberately — align .machine.local.json, or record the migration in ` +
      `identity-aliases.json — then re-run.`
    );
    console.log('signals: skipped (contributor identity conflict — see notes)');
  } else {
    console.log('signals: folding consult counts into the signals lane');
    run('signals-collect.mjs');
  }
}

if (!checkOnly && wants('fleet-map')) {
  console.log('fleet-map: inverting coverage across the fleet');
  run('build-fleet-map.mjs');
}

const found = wants('discover') || wants('report') ? discover() : { scanned: 0, undeclared: [], quiet: [] };
if (found.undeclared.length) {
  notes.push(
    `${found.undeclared.length} checkout(s) carry .ai/manifest.yaml but are absent from projects.json ` +
    `(${found.undeclared.join(', ')}). Their consults and leads can never reach this registry, and no ` +
    `existing instrument errors on them.`
  );
}

// ---------------------------------------------------------------------------
// Phase: pending — the efferent nerve.
// ---------------------------------------------------------------------------

/**
 * What reaches a project when a subject lands somewhere else.
 *
 * There is no push mechanism in this registry and there does not need to be one, because
 * the signal is already computable from committed data that nobody renders. Every map
 * pair carries the `revision` of the subject it was judged against (`evaluatedRevision`)
 * and the subject's `revision` now; every rebuilt map marks contexts that `arrived` after
 * the last pass. A landing in the registry therefore ALREADY shows up in each consuming
 * project's own map as a number that moved. Propagation was never missing — it was
 * unrendered.
 *
 * What this deliberately does NOT list: pairs nobody has ever judged. Fleet-wide that is
 * 94.6% of them, and a queue that opens with four thousand rows of "unknown" is a queue
 * nobody reads. `unknown` is a coverage question for `/conform`; this file answers a
 * narrower and more urgent one — what changed under a verdict this project already gave,
 * and what arrived that no verdict covers yet.
 *
 * `revisionsBehind` is null, never zero, when a pair predates the revision field. One is
 * a touch-up and five is a rewrite; "unknown distance" is a third thing and it says so.
 */
function pendingFor(p, subjectRevisions) {
  const map = readJson(path.join(p.path, '.ai', 'registry-map.json'));
  if (!map) return null;

  const contextName = new Map((map.contexts ?? []).map((c) => [c.context, c.name ?? c.context]));
  const moved = new Map();

  for (const c of map.contexts ?? []) {
    for (const s of c.subjects ?? []) {
      if (!s.state || s.state === 'unknown') continue;
      const now = subjectRevisions.get(`${s.bundle}/${s.subject}`) ?? s.revision ?? null;
      const then = s.evaluatedRevision ?? null;
      const behindByDigest = s.stale === true || (s.evaluatedAgainst && s.digest && s.evaluatedAgainst !== s.digest);
      if (!behindByDigest) continue;
      const key = `${s.bundle}/${s.subject}`;
      const prev = moved.get(key) ?? { subject: s.subject, bundle: s.bundle, contexts: new Set(), behind: null, state: s.state };
      prev.contexts.add(c.name ?? c.context);
      const behind = now !== null && then !== null ? now - then : null;
      if (behind !== null) prev.behind = Math.max(prev.behind ?? 0, behind);
      moved.set(key, prev);
    }
  }

  const arrived = (map.contexts ?? []).filter((c) => c.arrived === true);
  return { project: p.slug, moved: [...moved.values()], arrived, contextName, generatedAt: map.generatedAt };
}

/** Every subject's CURRENT revision, from the generated bundle indexes. */
function currentRevisions() {
  const out = new Map();
  const kdir = path.join(ROOT, 'knowledge');
  for (const bundle of fs.existsSync(kdir) ? fs.readdirSync(kdir) : []) {
    const idx = readJson(path.join(kdir, bundle, 'index.json'));
    for (const [slug, v] of Object.entries(idx?.subjects ?? {})) {
      if (typeof v?.revision === 'number') out.set(`${bundle}/${slug}`, v.revision);
    }
  }
  return out;
}

function renderPending(q) {
  const L = [];
  L.push('# Registry — pending for this project');
  L.push('');
  L.push('<!-- GENERATED by ai-registry/scripts/converge.mjs --pending. Do not hand-edit. -->');
  L.push('');
  L.push(`generated: ${generatedAtStamp} · project: ${q.project}`);
  L.push('');
  L.push('The registry moved under verdicts this repository already gave, or code arrived that no');
  L.push('verdict covers. Neither is a defect; both are work this project owns. Nothing here is');
  L.push('applied automatically — `merging is adopting, and a human acts`.');
  L.push('');

  if (q.moved.length) {
    L.push('## The standard moved under a verdict here');
    L.push('');
    L.push('| subject | bundle | last verdict | revisions behind | contexts affected |');
    L.push('| --- | --- | --- | ---: | --- |');
    for (const m of q.moved.sort((a, b) => (b.behind ?? 0) - (a.behind ?? 0) || a.subject.localeCompare(b.subject))) {
      const ctx = [...m.contexts].sort();
      const shown = ctx.slice(0, 4).join(', ') + (ctx.length > 4 ? `, +${ctx.length - 4} more` : '');
      L.push(`| \`${m.subject}\` | ${m.bundle} | ${m.state} | ${m.behind ?? '?'} | ${shown} |`);
    }
    L.push('');
    L.push('`?` means the pair predates revision tracking — an unknown distance, never zero.');
    L.push('Re-judge with `/conform --stale`.');
    L.push('');
  }

  if (q.arrived.length) {
    L.push('## Contexts that arrived since the last pass');
    L.push('');
    L.push(`${q.arrived.length} context(s) entered this repository after its map was last judged, so`);
    L.push('nothing governs them yet. This is where new code outruns the standard.');
    L.push('');
    for (const c of q.arrived.slice(0, 40)) {
      const subs = (c.subjects ?? []).slice(0, 3).map((s) => `\`${s.subject}\``).join(', ');
      L.push(`- **${c.name ?? c.context}** — candidate subjects: ${subs || '_none matched_'}`);
    }
    if (q.arrived.length > 40) L.push(`- _…and ${q.arrived.length - 40} more._`);
    L.push('');
  }

  if (!q.moved.length && !q.arrived.length) {
    L.push('Nothing pending. Every verdict this project gave was judged against the standard as it');
    L.push('stands, and no context arrived unjudged.');
    L.push('');
  }
  return L.join('\n');
}

const generatedAtStamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

if (pendingMode) {
  const revs = currentRevisions();
  const writePending = has('--write');
  console.log(`pending: ${writePending ? 'writing' : 'computing'} .ai/registry-pending.md per project\n`);
  console.log('  project          moved  arrived  action');
  for (const p of Object.values(fleet.projects)) {
    if (!p.exists) continue;
    const q = pendingFor(p, revs);
    if (!q) { console.log(`  ${p.slug.padEnd(16)} ${'-'.padStart(5)}  ${'-'.padStart(7)}  no map`); continue; }
    const target = path.join(p.path, '.ai', 'registry-pending.md');
    let action = 'would write';
    if (writePending && !dryRun) {
      if (!q.moved.length && !q.arrived.length && fs.existsSync(target)) { fs.rmSync(target); action = 'removed (clean)'; }
      else if (!q.moved.length && !q.arrived.length) { action = 'none (clean)'; }
      else { fs.writeFileSync(target, renderPending(q), 'utf8'); action = 'written'; }
    } else if (!q.moved.length && !q.arrived.length) action = 'none (clean)';
    console.log(`  ${p.slug.padEnd(16)} ${String(q.moved.length).padStart(5)}  ${String(q.arrived.length).padStart(7)}  ${action}`);
  }
  console.log('\n  A pending file is a TRACKED artifact in that project. This script never commits and never pushes.');
  process.exit(EXIT.OK);
}

// ---------------------------------------------------------------------------
// The report
// ---------------------------------------------------------------------------

const rows = Object.values(fleet.projects).map(projectRow);

const tot = rows.reduce((a, r) => ({
  contexts: a.contexts + (r.contexts ?? 0),
  pairs: a.pairs + (r.pairs ?? 0),
  judged: a.judged + (r.judged ?? 0),
  stale: a.stale + (r.stale ?? 0),
  arrived: a.arrived + (r.arrived ?? 0),
  consults: a.consults + (r.consults?.recent ?? 0),
  misses: a.misses + (r.consults?.missed ?? 0),
  leads: a.leads + (r.leads?.total ?? 0),
}), { contexts: 0, pairs: 0, judged: 0, stale: 0, arrived: 0, consults: 0, misses: 0, leads: 0 });

const pct = (n, d) => (d ? `${((100 * n) / d).toFixed(1)}%` : '-');
const cell = (v) => (v === null || v === undefined ? '-' : String(v));
const generatedAt = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

const lines = [];
lines.push('# Fleet coverage — what the registry reaches, and what reaches back');
lines.push('');
lines.push('<!-- GENERATED by scripts/converge.mjs. Do not hand-edit. -->');
lines.push('');
lines.push(`generated: ${generatedAt} · machine: ${fleet.machine} · projects declared: ${rows.length}`);
lines.push('');
lines.push('Counts and slugs only, per the librarian lane\'s rule — no consumer paths appear here.');
lines.push('The fleet instruments cannot run in CI (they need the gitignored machine bridge), so the');
lines.push('gate checks THIS FILE\'S AGE instead. A stale report is the signal; see scripts/check-coverage-age.mjs.');
lines.push('');
lines.push('## Totals');
lines.push('');
lines.push('| measure | value |');
lines.push('| --- | --- |');
lines.push(`| contexts mapped | ${tot.contexts} |`);
lines.push(`| context↔subject pairs | ${tot.pairs} |`);
lines.push(`| pairs judged | ${tot.judged} (${pct(tot.judged, tot.pairs)}) |`);
lines.push(`| verdicts stale against a moved subject | ${tot.stale} |`);
lines.push(`| contexts arrived since the last judgement | ${tot.arrived} |`);
lines.push(`| consults logged, last 30d | ${tot.consults} |`);
lines.push(`| of those, recorded MISSES | ${tot.misses} |`);
lines.push(`| leads held in project ledgers | ${tot.leads} |`);
lines.push('');
lines.push('## Per project');
lines.push('');
lines.push('| project | contexts | pairs | judged | judged % | map age (d) | stale verdicts | arrived | consults 30d | misses 30d | leads |');
lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
for (const r of rows.sort((a, b) => a.slug.localeCompare(b.slug))) {
  if (!r.exists) { lines.push(`| ${r.slug} | — not checked out on this machine — |||||||||||`); continue; }
  lines.push(
    `| ${r.slug} | ${cell(r.contexts)} | ${cell(r.pairs)} | ${cell(r.judged)} | ${pct(r.judged ?? 0, r.pairs ?? 0)} | ` +
    `${cell(r.mapAge)} | ${cell(r.stale)} | ${cell(r.arrived)} | ${cell(r.consults?.recent)} | ${cell(r.consults?.missed)} | ${cell(r.leads?.total)} |`
  );
}
lines.push('');
lines.push('**judged %** is the share of pairs any pass has actually read the code for. `unknown` is not');
lines.push('conformance; it is the absence of a verdict. **misses** are commits whose governing subject was');
lines.push('not read, recorded by `consult-check`; a project with 0 consults AND 0 misses is not compliant,');
lines.push('it is uninstrumented.');
lines.push('');

if (found.undeclared.length) {
  lines.push('## Undeclared checkouts');
  lines.push('');
  lines.push('These carry `.ai/manifest.yaml`, have already written a consult or lead ledger, and are');
  lines.push('absent from `projects.json` — so every collector resolves them to nothing without erroring,');
  lines.push('and whatever they learned cannot arrive.');
  lines.push('');
  for (const u of found.undeclared) lines.push(`- \`${u}\``);
  lines.push('');
  if (found.quiet.length) {
    lines.push(`${found.quiet.length} further undeclared checkout(s) carry a manifest but no ledger — benchmark`);
    lines.push('clones and scratch trees that inherited one. Counted, not listed: they have produced nothing to lose.');
    lines.push('');
  }
}

if (notes.length) {
  lines.push('## Notes from this run');
  lines.push('');
  for (const n of notes) lines.push(`- ${n}`);
  lines.push('');
}

if (!checkOnly && !dryRun && wants('report')) {
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, lines.join('\n'), 'utf8');
  console.log(`\nreport: ${path.relative(ROOT, REPORT)} written`);
}

// ---------------------------------------------------------------------------
// Say it on stdout too — a report nobody opens is the state we started from.
// ---------------------------------------------------------------------------

console.log('');
console.log('  project          contexts  pairs  judged  judged%  mapAge  stale  arrived  consults30d  misses  leads');
for (const r of rows.sort((a, b) => a.slug.localeCompare(b.slug))) {
  if (!r.exists) { console.log(`  ${r.slug.padEnd(16)} (not checked out)`); continue; }
  console.log(
    `  ${r.slug.padEnd(16)} ${cell(r.contexts).padStart(8)}  ${cell(r.pairs).padStart(5)}  ${cell(r.judged).padStart(6)}  ` +
    `${pct(r.judged ?? 0, r.pairs ?? 0).padStart(7)}  ${cell(r.mapAge).padStart(6)}  ${cell(r.stale).padStart(5)}  ` +
    `${cell(r.arrived).padStart(7)}  ${cell(r.consults?.recent).padStart(11)}  ${cell(r.consults?.missed).padStart(6)}  ${cell(r.leads?.total).padStart(5)}`
  );
}
console.log('');
console.log(`  TOTAL: ${tot.pairs} pair(s), ${tot.judged} judged (${pct(tot.judged, tot.pairs)}), ${tot.stale} stale verdict(s), ${tot.arrived} arrived context(s), ${tot.leads} lead(s) held.`);

for (const n of notes) console.log(`\n  ! ${n}`);

if (checkOnly) {
  const report = fs.existsSync(REPORT) ? fs.readFileSync(REPORT, 'utf8') : null;
  const stale = !report || (ageDays(/generated: (\S+)/.exec(report)?.[1]) ?? 999) > 14;
  if (stale || notes.length) { console.log('\nconverge --check: FAILED'); process.exit(EXIT.VIOLATIONS); }
  console.log('\nconverge --check: fleet and registry agree.');
}

process.exit(EXIT.OK);
