#!/usr/bin/env node
/**
 * consult-check — the join between a commit and the standard that governs it.
 *
 * The registry's always-on rule puts 229 subject SLUGS in front of every session and
 * tells it to open the governing subject before a design decision. Measured over the
 * fleet's own ledgers, that obligation is met for about a quarter of the corpus: 172 of
 * 229 software-engineering subjects were never consulted once in a 30-day window, and
 * `table` — a forged subject with five techniques, three stack applications, and the
 * registry's own README using it as the worked example — was consulted twice, both times
 * inside the one project it was forged FROM, while nine other projects hand-rolled sixty
 * table implementations between them.
 *
 * The obligation is not weak because the corpus is weak. It is weak because it is
 * UNPRICED and UNVERIFIED: recognising a slug is free, resolving it costs a lookup plus
 * ~15K tokens of reading, and nothing anywhere notices the difference. This script is the
 * missing half. It answers one question cheaply enough to ask on every commit:
 *
 *     these files changed — what governs them, and did anyone read it?
 *
 * Two resolution paths, and the SECOND one is the reason this script exists:
 *
 *   1. MAPPED code — the file sits inside a context in `.ai/registry-map.json`, so its
 *      governing subjects are a lookup. This is the cheap, exact path.
 *   2. UNMAPPED code — the file sits in no context at all. This is not an edge case; it
 *      is the normal state of NEW work, which is exactly the work most worth governing.
 *      One project carries 160 contexts that arrived after its map was last built, and
 *      the knowledge-sync clause that 18 skills carry routes ONLY through the map — so
 *      for all of them the obligation resolves to nothing and reports success. Here an
 *      unmapped path falls back to the corpus router (`research-map.mjs`) over the path's
 *      own tokens, which is how a brand-new `components/DataTable.tsx` still reaches the
 *      `table` subject on the day it is written.
 *
 * NEVER BLOCKS. It exits 0 on a miss unless `--exit-code` is passed. This is deliberate
 * and was chosen against the alternative: thirteen repositories run incompatible hook
 * managers, several with pre-existing failures, and a hook that blocks a commit over a
 * knowledge read gets deleted within a week — at which point the measurement dies with
 * it. What it does instead is WRITE THE MISS DOWN (`outcome: "missed"` in the project's
 * consults ledger) so the gap becomes a number the convergence loop can report, and print
 * the governing subjects to stdout, where an agent session reads them as tool output at
 * the one moment it is deciding.
 *
 * Reads the project's map (100–220 KB), never the bundle index (1.39 MB for
 * software-engineering alone). Budget: under 300ms including the router fallback.
 *
 * Usage:
 *   node consult-check.mjs                      # staged paths in the cwd's project
 *   node consult-check.mjs --project <path>     # somewhere else
 *   node consult-check.mjs --paths a.ts,b.ts    # explicit, for tests and skills
 *   node consult-check.mjs --since HEAD~3       # a range rather than the index
 *   node consult-check.mjs --window 240         # minutes a consult stays fresh
 *   node consult-check.mjs --exit-code          # exit 1 on a miss (CI, never a hook)
 *   node consult-check.mjs --json               # machine-readable, for a skill
 *   node consult-check.mjs --quiet              # record only, print nothing
 *
 * Exits 0 always, unless --exit-code turns a miss into 1, or a precondition fails (2).
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';

const HERE = path.resolve(fileURLToPath(new URL('.', import.meta.url)));
const REGISTRY_ROOT = path.resolve(HERE, '..');

// ---------------------------------------------------------------------------
// argv
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const valueOf = (name, fallback = null) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};

if (flag('--help') || flag('-h')) {
  console.log(
    'usage: node consult-check.mjs [--project <path>] [--paths a,b] [--since <ref>]\n' +
    '                              [--window <minutes>] [--top <n>] [--exit-code]\n' +
    '                              [--json] [--quiet] [--no-record]'
  );
  process.exit(EXIT.OK);
}

const WINDOW_MINUTES = Number(valueOf('--window', '240')) || 240;
const TOP = Number(valueOf('--top', '3')) || 3;
const asJson = flag('--json');
const quiet = flag('--quiet');
const record = !flag('--no-record');
const exitCode = flag('--exit-code');

// ---------------------------------------------------------------------------
// Where are we?
// ---------------------------------------------------------------------------

/** Walk up for the nearest `.ai/manifest.yaml`. A project is where its manifest is. */
function findProjectRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.ai', 'manifest.yaml'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

// An explicit --project is still checked for a manifest. Trusting the flag would make
// the caller's guess about what a project is outrank the project's own declaration, and
// the "not a consumer" branch below would then be unreachable for every explicit call —
// including every call a hook makes with a computed path.
const named = valueOf('--project');
const candidate = named ? path.resolve(named) : findProjectRoot(process.cwd());
const projectRoot = candidate && fs.existsSync(path.join(candidate, '.ai', 'manifest.yaml')) ? candidate : null;

if (!projectRoot) {
  // Not a consuming project. A hook fires in every repo on the machine, including ones
  // that never subscribed; saying so once and leaving is the correct behaviour, and it
  // is not a failure of this instrument.
  if (!quiet && !asJson) console.log('consult-check: no .ai/manifest.yaml above this directory — not a registry consumer.');
  if (asJson) console.log(JSON.stringify({ skipped: 'no-manifest' }, null, 1));
  process.exit(EXIT.OK);
}

// ---------------------------------------------------------------------------
// Inputs. Every one of them degrades to a stated reason, never to a silent pass.
// ---------------------------------------------------------------------------

const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };

const mapPath = path.join(projectRoot, '.ai', 'registry-map.json');
const map = readJson(mapPath);

/**
 * `registry.local` out of the manifest, without a YAML dependency. The registry is
 * dependency-free Node by rule, and this file is read by a git hook on every commit:
 * pulling a parser in for two scalars would be the most expensive line in the script.
 */
function manifestValue(key) {
  try {
    const text = fs.readFileSync(path.join(projectRoot, '.ai', 'manifest.yaml'), 'utf8');
    const m = new RegExp(`^\\s*${key}:\\s*(.+)$`, 'm').exec(text);
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
  } catch { return null; }
}

function manifestDomains() {
  try {
    const text = fs.readFileSync(path.join(projectRoot, '.ai', 'manifest.yaml'), 'utf8');
    const inline = /^\s*domains:\s*\[(.+?)\]/m.exec(text);
    if (inline) return inline[1].split(',').map((s) => s.trim()).filter(Boolean);
    const block = /^\s*domains:\s*\n((?:\s*-\s*.+\n?)+)/m.exec(text);
    if (block) return block[1].split('\n').map((l) => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
    return [];
  } catch { return []; }
}

const declaredRegistry = manifestValue('local') || manifestValue('registry.local');
const registryRoot = (() => {
  if (process.env.AI_REGISTRY_DIR && fs.existsSync(process.env.AI_REGISTRY_DIR)) return path.resolve(process.env.AI_REGISTRY_DIR);
  if (declaredRegistry) {
    const abs = path.resolve(projectRoot, declaredRegistry);
    if (fs.existsSync(abs)) return abs;
  }
  // The script is IN the registry; if the project does not say where it lives, here is
  // a better answer than nothing — but only if it actually looks like the registry.
  if (fs.existsSync(path.join(REGISTRY_ROOT, 'registry.yaml'))) return REGISTRY_ROOT;
  return null;
})();

// ---------------------------------------------------------------------------
// What changed?
// ---------------------------------------------------------------------------

function changedPaths() {
  const explicit = valueOf('--paths');
  if (explicit) return explicit.split(',').map((s) => s.trim()).filter(Boolean);

  const since = valueOf('--since');
  const args = since
    ? ['diff', '--name-only', '--diff-filter=ACMR', `${since}..HEAD`]
    : ['diff', '--cached', '--name-only', '--diff-filter=ACMR'];
  const r = spawnSync('git', args, { cwd: projectRoot, encoding: 'utf8' });
  if (r.status !== 0) return [];
  return r.stdout.split('\n').map((s) => s.trim()).filter(Boolean);
}

const paths = changedPaths();

if (paths.length === 0) {
  if (!quiet && !asJson) console.log('consult-check: nothing staged.');
  if (asJson) console.log(JSON.stringify({ skipped: 'no-paths' }, null, 1));
  process.exit(EXIT.OK);
}

// ---------------------------------------------------------------------------
// Path 1 — MAPPED. The lookup.
// ---------------------------------------------------------------------------

/**
 * A context owns a changed file when one of its declared paths is that file or a
 * directory prefix of it. Longest prefix wins, so `app/admin/audit/` beats `app/`:
 * a file governed by a narrow context and a broad one is governed by the narrow one,
 * and letting both match would bury the precise answer under the general one.
 */
function contextsFor(file) {
  if (!map?.contexts) return [];
  const norm = file.replace(/\\/g, '/');
  const hits = [];
  for (const ctx of map.contexts) {
    let best = -1;
    for (const p of ctx.paths ?? []) {
      const cand = String(p).replace(/\\/g, '/').replace(/\/+$/, '');
      if (!cand) continue;
      if (norm === cand || norm.startsWith(cand + '/')) best = Math.max(best, cand.length);
    }
    if (best >= 0) hits.push({ ctx, depth: best });
  }
  if (hits.length === 0) return [];
  const deepest = Math.max(...hits.map((h) => h.depth));
  return hits.filter((h) => h.depth === deepest).map((h) => h.ctx);
}

const governing = new Map(); // subject -> {subject, bundle, confidence, score, state, via, contexts:Set}
const unmapped = [];

for (const file of paths) {
  const ctxs = contextsFor(file);
  if (ctxs.length === 0) { unmapped.push(file); continue; }
  for (const ctx of ctxs) {
    for (const s of ctx.subjects ?? []) {
      const prev = governing.get(s.subject);
      const entry = prev ?? {
        subject: s.subject, bundle: s.bundle, confidence: s.confidence,
        score: s.score, state: s.state, via: 'map', contexts: new Set(),
      };
      // Keep the strongest evidence across contexts, not the last one read.
      if (prev && (s.score ?? 0) > (prev.score ?? 0)) { entry.score = s.score; entry.confidence = s.confidence; }
      entry.contexts.add(ctx.name ?? ctx.context);
      governing.set(s.subject, entry);
    }
  }
}

// ---------------------------------------------------------------------------
// Path 2 — UNMAPPED. The router fallback. This is the half the clause is missing.
// ---------------------------------------------------------------------------

/**
 * Turn file paths into router terms. Directory and file names are what a developer
 * already chose to call the thing, which makes them the cheapest honest description of
 * it available at commit time — `src/components/audit/DataTable.tsx` yields
 * "components audit data table", and that is enough for the router to reach `table`.
 */
function termsFromPaths(files) {
  const words = new Set();
  for (const f of files) {
    for (const seg of f.replace(/\\/g, '/').split('/')) {
      const base = seg.replace(/\.[a-z0-9]+$/i, '');
      for (const w of base.split(/[^A-Za-z0-9]+|(?<=[a-z0-9])(?=[A-Z])/)) {
        const t = w.toLowerCase();
        if (t.length >= 3 && !STOP.has(t)) words.add(t);
      }
    }
  }
  return [...words];
}

const STOP = new Set([
  'src', 'app', 'lib', 'com', 'index', 'test', 'tests', 'spec', 'utils', 'util',
  'types', 'type', 'the', 'and', 'for', 'new', 'tsx', 'jsx', 'mjs', 'cjs', 'json',
  'components', 'component', 'features', 'feature', 'pages', 'page', 'hooks',
]);

let routed = [];
let routerNote = null;

if (unmapped.length > 0) {
  if (!registryRoot) {
    routerNote = 'registry checkout not resolved — unmapped paths were not routed';
  } else {
    const terms = termsFromPaths(unmapped);
    if (terms.length === 0) {
      routerNote = 'unmapped paths yielded no usable terms';
    } else {
      const domains = (map?.domains ?? manifestDomains()).filter(Boolean);
      // ONE TERM PER TOKEN, never the tokens joined into a sentence. Measured against
      // this corpus: `AuditDataTable.tsx` as the single term "audit data table" ranks
      // audit-logging 17 / data-access 15 and does not return `table` at all, because a
      // joined term scores on aggregate overlap and the majority tokens bury the one
      // that names the surface. As separate terms, "table" alone scores 24 against the
      // table subject and wins its own row. The distinction decides whether a new table
      // component ever reaches the table standard.
      const args = [
        path.join(registryRoot, 'scripts', 'research-map.mjs'),
        ...terms.slice(0, 12),
        '--top', String(TOP), '--json',
      ];
      // Scope to what the project declared. An unscoped router would answer a Next.js
      // table question out of the recruiting bundle, which is noise wearing a score.
      if (domains.length === 1) args.push('--domain', domains[0]);
      const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 10_000 });
      if (r.status !== 0 || !r.stdout) {
        routerNote = 'router did not run';
      } else {
        try {
          const j = JSON.parse(r.stdout);
          // Merge across terms, keeping each subject's BEST score. A subject that wins
          // one specific token outranks one that places mid-table on several vague ones.
          const best = new Map();
          for (const res of j.results ?? []) {
            for (const h of res.hits ?? []) {
              if (domains.length && !domains.includes(h.domain)) continue;
              const prev = best.get(h.subject);
              if (!prev || (h.score ?? 0) > prev.score) {
                best.set(h.subject, { subject: h.subject, bundle: h.domain, score: h.score ?? 0, file: h.file, term: res.term, via: 'router' });
              }
            }
          }
          routed = [...best.values()].sort((a, b) => b.score - a.score).slice(0, TOP);
        } catch { routerNote = 'router output was not readable'; }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Was it read?
// ---------------------------------------------------------------------------

const ledgerPath = path.join(projectRoot, '.ai', 'consults.jsonl');

/**
 * Rows inside the freshness window. A consult logged last month is not evidence that
 * THIS change was informed by it — the standard may have moved, and the session
 * certainly has. `outcome: "missed"` rows are this script's own output and can never
 * count as coverage; treating them as such would make the instrument certify itself.
 */
function recentConsults() {
  if (!fs.existsSync(ledgerPath)) return [];
  const cutoff = Date.now() - WINDOW_MINUTES * 60_000;
  const out = [];
  for (const line of fs.readFileSync(ledgerPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t) continue;
    let row; try { row = JSON.parse(t); } catch { continue; }
    if (row.outcome === 'missed') continue;          // never self-certify
    const ts = Date.parse(row.ts ?? '');
    if (!Number.isFinite(ts) || ts < cutoff) continue;
    out.push(row);
  }
  return out;
}

const covered = new Set();
for (const row of recentConsults()) for (const s of row.subjects ?? []) covered.add(s);

const wanted = [...governing.values(), ...routed];
// A subject is reported once, and the map's verdict outranks the router's guess.
const seen = new Set();
const deduped = [];
for (const w of wanted) {
  if (seen.has(w.subject)) continue;
  seen.add(w.subject);
  deduped.push(w);
}

const ranked = deduped.sort((a, b) => {
  const rank = { strong: 0, probable: 1, weak: 2 };
  const ra = rank[a.confidence] ?? (a.via === 'router' ? 1.5 : 2);
  const rb = rank[b.confidence] ?? (b.via === 'router' ? 1.5 : 2);
  if (ra !== rb) return ra - rb;
  return (b.score ?? 0) - (a.score ?? 0);
});

const missed = ranked.filter((s) => !covered.has(s.subject));
const met = ranked.filter((s) => covered.has(s.subject));

// ---------------------------------------------------------------------------
// Record. Counts and slugs only — this ledger is folded into a PUBLIC lane.
// ---------------------------------------------------------------------------

if (record && missed.length > 0) {
  const byBundle = new Map();
  for (const s of missed) {
    if (!byBundle.has(s.bundle)) byBundle.set(s.bundle, []);
    byBundle.get(s.bundle).push(s.subject);
  }
  const lines = [];
  for (const [bundle, subjects] of byBundle) {
    lines.push(JSON.stringify({
      ts: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
      bundle,
      subjects: subjects.sort(),
      techniques: [],
      deviations: 0,
      outcome: 'missed',
      from: 'consult-check',
    }));
  }
  try {
    fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
    fs.appendFileSync(ledgerPath, lines.join('\n') + '\n', 'utf8');
  } catch { /* a ledger that cannot be written is not a reason to fail a commit */ }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (asJson) {
  console.log(JSON.stringify({
    project: map?.project ?? path.basename(projectRoot),
    paths: paths.length,
    unmapped: unmapped.length,
    mapGeneratedAt: map?.generatedAt ?? null,
    routerNote,
    met: met.map((s) => s.subject),
    missed: missed.map((s) => ({ subject: s.subject, bundle: s.bundle, via: s.via, confidence: s.confidence ?? null, state: s.state ?? null })),
  }, null, 1));
} else if (!quiet) {
  if (!map) {
    console.log('consult-check: no .ai/registry-map.json — build it with `node <registry>/scripts/build-registry-map.mjs --project <slug>`.');
  }
  if (missed.length === 0) {
    console.log(`consult-check: ${paths.length} path(s), ${ranked.length} governing subject(s), all read in the last ${WINDOW_MINUTES}m.`);
  } else {
    const label = missed.map((s) => s.subject).join(', ');
    console.log('');
    console.log(`  consult-check: ${missed.length} subject(s) govern this change and were not read.`);
    for (const s of missed) {
      const how = s.via === 'router' ? 'unmapped path, routed' : `${s.confidence ?? 'mapped'}${s.state && s.state !== 'unknown' ? `, ${s.state}` : ''}`;
      console.log(`    ${s.subject.padEnd(34)} ${s.bundle}   (${how})`);
    }
    if (routerNote) console.log(`    note: ${routerNote}`);
    console.log('');
    console.log(`    read them:  node <registry>/scripts/research-map.mjs "${label}" --prose`);
    console.log('    the golden path is subjects[<slug>].file in the bundle index; techniques sit beside it.');
    console.log('    recorded as a miss. This never blocks a commit.');
    console.log('');
  }
}

process.exit(exitCode && missed.length > 0 ? EXIT.VIOLATIONS : EXIT.OK);
