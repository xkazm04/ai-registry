#!/usr/bin/env node
// Catalog builder — refreshes the `bundles` array in catalog.json.
//
// The catalog is the index a consumer syncs instead of walking the whole tree. It already
// carried `skills`; this adds `bundles` for the knowledge lane. ADDITIVE ON PURPOSE: every
// key this script does not own is read and written back untouched, so Ascent's indexer (or
// any other reader) keeps working while a second producer edits the same file.
//
// `--check` verifies the committed catalog matches what a fresh build would produce and
// exits non-zero if not — that is the CI form. Without it, the file is rewritten.
//
// Counts and hashes only. No prose from inside the bundles ever lands here; a catalog that
// duplicates content becomes a second authority that drifts.
//
// It also owns each skill's `invokes30d`, aggregated from the `usage/` lane
// (docs/usage-lane.md). That field used to be a hand-seeded number nothing computed —
// which meant the catalog asserted usage that no installation had reported. It is now
// DERIVED: contributors each own one file, this sums them, and hand-editing the count in
// catalog.json is overwritten on the next build. That is the point — many writers into one
// shared field is the failure the per-contributor files exist to prevent.
//
// A usage count EXPIRES. A report covers the `windowDays` ending at its own `generatedAt`;
// it is `current` while its whole-day age against the catalog's evidence date (`generatedAt`
// below: the newest instant in the committed data, usage reports included) is at most its
// `windowDays`, and `stale` after. Only current 30-day reports reach `invokes30d` and
// `usageContributors`; stale contributors are named in `usageStaleContributors`; everything
// still reaches `reportedInvokes`. The evidence date is fixed from all inputs BEFORE any
// state is read against it and no state feeds back into it, so the verdict is deterministic
// and the clock never enters it: a committed catalog does not go stale because a day passed.
//
// And each skill's run-log fields (`runs30d`, `outcomes30d`, `difficulty30d`,
// `tokensMedian30d`, `tokensBasis30d`) from `usage/runs/`, folded by the same function
// scripts/runs-report.mjs uses (lib/runs-aggregate.mjs) - one fold, two readers.
//
// Could-not-run is exit 2, in BOTH modes. The 2026-10-25 gates probe emptied the skills
// lane and this wrote `skills: []` and exited 0 - a catalog telling every consumer the lane
// is gone, published by a green step; and an unparseable catalog.json died on an uncaught
// throw, exit 1, which this repo reads as "violations found". An empty skills lane or an
// empty knowledge lane is a broken precondition (lib/check-result.mjs requirePopulation),
// and so is a catalog that does not parse: neither is a verdict about the content.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashBundle, sameIgnoringNewlines } from './lib/bundle-hash.mjs';
import { walkSubjects } from './lib/taxonomy.mjs';
import { readLane, contentDigest, lessonHeadings } from './lib/skills-lane.mjs';
import {loadIdentities,resolveIdentity} from './lib/telemetry.mjs';
import { loadLane as loadRunsLane, aggregateRuns, catalogFields } from './lib/runs-aggregate.mjs';
import { EXIT, installCrashDoor } from './lib/exit-codes.mjs';
import { requirePopulation } from './lib/check-result.mjs';
import { partitionReports } from './lib/currency-clock.mjs';

installCrashDoor();

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const KNOWLEDGE = path.join(ROOT, 'knowledge');
const SKILLS = path.join(ROOT, 'skills');
const PRACTICES = path.join(ROOT, 'practices');
const MEMORY = path.join(ROOT, 'memory');
const USAGE = path.join(ROOT, 'usage');
const CATALOG = path.join(ROOT, 'catalog.json');
// A closed flag set, read before any lane: anything but `--check` used to be WRITE mode.
const USAGE_LINE = 'usage: node scripts/build-catalog.mjs [--check]';
const ARGS = process.argv.slice(2);
if (ARGS.includes('--help') || ARGS.includes('-h')) { console.log(USAGE_LINE); process.exit(EXIT.OK); }
const strays = ARGS.filter((a) => a !== '--check');
if (strays.length) { console.error(`build-catalog: unknown argument(s) ${strays.join(' ')} - nothing read or written\n${USAGE_LINE}`); process.exit(EXIT.FATAL); }
const checkOnly = ARGS.includes('--check');

if (!fs.existsSync(KNOWLEDGE)) {
  console.error(`FATAL: no knowledge/ lane at ${KNOWLEDGE} — refusing to write a catalog that claims zero bundles.`);
  process.exit(EXIT.FATAL);
}
if (!fs.existsSync(CATALOG)) {
  console.error(`FATAL: ${CATALOG} does not exist. This script edits a catalog, it does not invent one.`);
  process.exit(EXIT.FATAL);
}

/** Exit 2 with the floor's reason when a population came back below its floor. */
const floor = (count, what) => {
  const r = requirePopulation(count, what);
  if (r.code === EXIT.OK) return;
  console.error(`build-catalog FATAL: ${r.reason}. Refusing to ${checkOnly ? 'check' : 'write'} a catalog over it.`);
  process.exit(r.code);
};

let catalog;
try {
  catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
} catch (err) {
  console.error(`build-catalog FATAL: catalog.json does not parse (${err.message}). This script carries keys forward from it, so it cannot rebuild over it - restore it from git first.`);
  process.exit(EXIT.FATAL);
}

const laneSkills = fs.existsSync(SKILLS) ? readLane(SKILLS).filter((s) => s.exists && s.fm && s.fm.name) : [];
floor(laneSkills.length, 'skills in skills/');

const readFm = (file) => {
  const m = fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.+)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
  }
  return fm;
};

// The digest itself lives in scripts/lib/bundle-hash.mjs so the stability guard
// (check-hash-stability.mjs) hashes through exactly the same code this builder does —
// two copies of a digest is two answers to "did this bundle change".

const bundles = [];
for (const e of fs.readdirSync(KNOWLEDGE, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
  if (!e.isDirectory()) continue;
  const dir = path.join(KNOWLEDGE, e.name);
  const idx = path.join(dir, 'index.md');
  const fm = fs.existsSync(idx) ? readFm(idx) : {};

  // Subjects are FOUND, never assumed to sit one level down. This loop used to read
  // `<domain>/<subject>/techniques` at a fixed depth; when bundles nested it counted
  // CATEGORY folders as subjects and reported "4 subjects / 0 techniques" for a bundle
  // holding 15 subjects and 91 techniques - and `--check` stayed green throughout,
  // because it compares the committed file against a fresh build of the same wrong
  // logic. Freshness is not correctness. See the cross-check below.
  let subjects = 0, techniques = 0, applications = 0;
  const { found } = walkSubjects(dir);
  for (const [, at] of found) {
    subjects++;
    const t = path.join(dir, at, 'techniques');
    const a = path.join(dir, at, 'applications');
    if (fs.existsSync(t)) techniques += fs.readdirSync(t).filter((f) => f.endsWith('.md')).length;
    if (fs.existsSync(a)) applications += fs.readdirSync(a).filter((f) => f.endsWith('.md')).length;
  }

  const { hash, count } = hashBundle(dir);
  bundles.push({
    name: e.name,
    title: fm.okf_bundle_title ?? e.name,
    path: `knowledge/${e.name}`,
    okfVersion: fm.okf_version ?? null,
    profile: 'rkb/0.1',
    purity: fm.purity ?? 'generic',
    subjects,
    techniques,
    applications,
    files: count,
    contentHash: hash,
  });
}

floor(bundles.length, 'bundles in knowledge/');

// -- cross-check against the bundle indexes ----------------------------------
//
// build-index.mjs and this script both count the same corpus, by different code. Two
// independent counts of one thing that disagree mean one of them is wrong, and until this
// check existed nothing said which - `--check` only proves the committed file matches a
// fresh build of the SAME logic, so a walker bug stays green forever while every number
// it publishes is false. That is not hypothetical: this loop counted category folders as
// subjects the moment bundles nested, and shipped "4 subjects / 0 techniques" for a
// 15-subject bundle across two commits.
//
// FATAL rather than a warning. A catalog is the file consumers sync instead of walking
// the tree; publishing numbers we know are contradicted is worse than publishing none.
const mismatches = [];
const indexChangedAt = []; // every subject's `changedAt`, for generatedAt below
const collectChangedAt = (node) => {
  if (Array.isArray(node)) { node.forEach(collectChangedAt); return; }
  if (node === null || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node)) {
    if (k === 'changedAt' && typeof v === 'string') indexChangedAt.push(v);
    else collectChangedAt(v);
  }
};
for (const b of bundles) {
  const idxFile = path.join(KNOWLEDGE, b.name, 'index.json');
  if (!fs.existsSync(idxFile)) {
    mismatches.push(`${b.name}: no index.json — run build-index.mjs first (its hash is covered by this catalog)`);
    continue;
  }
  let meta;
  try {
    const idxDoc = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
    meta = idxDoc.meta ?? {};
    collectChangedAt(idxDoc.subjects ?? {});
  } catch (err) {
    mismatches.push(`${b.name}: index.json does not parse (${err.message})`);
    continue;
  }
  for (const field of ['subjects', 'techniques', 'applications']) {
    if (meta[field] !== b[field]) {
      mismatches.push(`${b.name}.${field}: catalog says ${b[field]}, index says ${meta[field]}`);
    }
  }
}
if (mismatches.length) {
  console.error('build-catalog FATAL: the catalog and the bundle indexes disagree.\n');
  for (const m of mismatches) console.error(`  ${m}`);
  console.error('\nTwo counts of one corpus, computed by different code. One of them is wrong.');
  console.error('Regenerate the index first (node scripts/build-index.mjs); if they still');
  console.error('disagree, a walker is broken and neither number may be published.');
  process.exit(EXIT.FATAL);
}

// -- usage aggregation -------------------------------------------------------
// One file per contributing installation, summed per skill. Validation lives in
// scripts/check-usage.mjs; this reads what that gate has already accepted and is
// deliberately tolerant — a malformed file must not be able to erase every
// count, so it is skipped and named rather than thrown on.
const identities=loadIdentities(ROOT);
const unresolvedUsage=[];
const usageReports=[];
const usage = new Map(); // skill -> { invokes, invokes30d, contributors:Set, staleContributors:Set }
const usageDocs = []; // every parsed report, folded after the evidence date is known
let usageFiles = 0;
// Skipping an unparseable contributor is correct here — this builder's green authorizes
// no claim of correctness, and one bad file must not erase every other installation's
// report. What the skip owes is its predicate: `invokes30d` is DERIVED, so a dropped
// contributor lowers it silently, and a count that does not say how many files were
// attempted is a number with no predicate (_laws.md#count-carries-predicate).
let usageSkipped = 0;
if (fs.existsSync(USAGE)) {
  for (const f of fs.readdirSync(USAGE).filter((x) => x.endsWith('.json')).sort()) {
    let doc;
    try {
      doc = JSON.parse(fs.readFileSync(path.join(USAGE, f), 'utf8'));
    } catch {
      console.warn(`  note: usage/${f} is not valid JSON — skipped (run check-usage.mjs)`);
      usageSkipped += 1;
      continue;
    }
    // Valid JSON is not yet a report: `null` or `7` parse fine and then threw on
    // `doc.contributor` (exit 1). Same skip, same predicate, as unparseable.
    if (doc === null || typeof doc !== 'object' || Array.isArray(doc)) {
      console.warn(`  note: usage/${f} is not a JSON object — skipped (run check-usage.mjs)`);
      usageSkipped += 1;
      continue;
    }
    usageFiles += 1;
    usageDocs.push(doc);
  }
}
// The fold itself runs below, once the catalog's evidence date is known (see "the usage
// fold"): whether a report's counts are current depends on that date.

// -- run-log aggregation (usage/runs/, docs/runs-lane.md) ---------------------
// Folded by the SAME function runs-report.mjs uses, so the catalog and the librarian's
// report cannot disagree about a skill. Grouped by skill name across versions: the catalog
// entry is per skill, and a version bump must not zero a skill's recent history.
//
// The 30-day window ends at the NEWEST row in the lane, not at the wall clock. `--check`
// must be a pure function of the tree: anchored to "now", a committed catalog would go
// stale on its own as rows aged out, and CI would fail on a day nothing changed. The
// price is that a lane nobody writes to keeps showing its last 30 days of activity - a
// reader who needs "as of today" runs runs-report.mjs, which counts back from now.
const runsLane = loadRunsLane(ROOT);
const runsNewest = runsLane.rows.reduce((m, r) => { const t = Date.parse(r?.ts); return Number.isNaN(t) ? m : Math.max(m, t); }, -Infinity);
const runStats = runsNewest === -Infinity
  ? {}
  : aggregateRuns(runsLane.rows, runsLane.exact, { by: 'skill', resolveSkill: runsLane.resolveSkill, sinceMs: runsNewest - 30 * 86400000, untilMs: runsNewest });

// -- generatedAt: derived from committed data, never from the clock or live git ---------
// This used to be `catalog.generatedAt`, carried forward untouched, so it sat at
// 2026-08-18T00:00:00Z while the catalog was rebuilt dozens of times, and the readers that
// take it as "when was this built" (Ascent's indexer, personas) were told August. The clock
// is not an option: `--check` must be a pure function of the tree, and a catalog stamped
// with "now" is stale the instant it is written. Live `git log` is not either: CI clones
// may be shallow and a depth-1 clone has one commit to date everything by. So the date is
// the NEWEST instant found in data the catalog already reads and the tree already commits:
// a subject's `changedAt` (knowledge/*/index.json), a usage report's `generatedAt`, a run
// row's `ts`, a LESSONS.md heading's date. It moves exactly when a lane gains newer
// evidence, and an unchanged tree rebuilds to the same value. If none parses, the committed
// value is kept rather than invented.
//
// It is computed HERE, before any usage count is folded, because it is also the date a usage
// report's age is measured against (below). Every report's `generatedAt` is an input to it,
// and that is not circular: the evidence date is fixed first from ALL dated inputs, every
// report's state is then read against that one fixed value, and a state never feeds back into
// the date. So the outcome is a pure function of the tree, and the newest report is always
// current at age 0 (it IS the evidence date, or older than it).
const lessonDates = laneSkills.flatMap((s) => (s.lessonsRaw ? lessonHeadings(s.lessonsRaw) : [])
  .map((h) => /[-–—] (\d{4}-\d{2}-\d{2}) [-–—]/.exec(h)?.[1]).filter(Boolean));
const stampMs = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}([T ]|$)/.test(v) ? Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T00:00:00Z` : v) : NaN);
const newestMs = Math.max(-Infinity, ...[
  ...indexChangedAt, ...lessonDates, ...usageDocs.map((u) => u.generatedAt),
  ...runsLane.rows.map((r) => r?.ts),
].map(stampMs).filter(Number.isFinite));
const generatedAt = newestMs === -Infinity ? catalog.generatedAt : new Date(newestMs).toISOString().replace(/\.\d{3}Z$/, 'Z');

// -- the usage fold: only a CURRENT report is a 30-day count -------------------------------
// A usage report describes the `windowDays` that ended at its own `generatedAt`. Summed with
// no look at its age, a report from August was published in November as `invokes30d: 6`
// beside a run log counting 103 runs in the last 30 days - a reader takes "6 in the last 30
// days" from a window that ended 79 days before the catalog's own evidence date. So a report
// is `current` when its whole-day age against the evidence date is at most its `windowDays`
// (inclusive; lib/currency-clock.mjs reportState), otherwise `stale`:
//   - `invokes30d` sums current 30-day reports only;
//   - `usageContributors` lists current contributors only, so a zero beside an empty list
//     reads as it should: nobody is reporting;
//   - `usageStaleContributors` names the contributors whose reports have aged out;
//   - `reportedInvokes` keeps everything ever reported, any age, so no history is lost.
// An undatable report is stale (unwitnessed reads as unknown, never as current).
const { ages: usageAges } = partitionReports(usageDocs, generatedAt);
usageDocs.forEach((doc, i) => {
  const { state, ageDays } = usageAges[i];
  usageReports.push({ contributor: doc.contributor, generatedAt: doc.generatedAt, windowDays: doc.windowDays, state, ageDays });
  for (const [reportedName, entry] of Object.entries(doc?.skills ?? {})) {
    const name = resolveIdentity(identities, 'skills', reportedName);
    if (!name) { unresolvedUsage.push({ contributor: doc.contributor, name: reportedName, ...entry }); continue; }
    const n = Number.isInteger(entry?.invokes) && entry.invokes >= 0 ? entry.invokes : 0;
    const row = usage.get(name) ?? { invokes: 0, invokes30d: 0, contributors: new Set(), staleContributors: new Set() };
    row.invokes += n;
    if (state === 'current' && doc.windowDays === 30) row.invokes30d += n;
    if (doc?.contributor) (state === 'current' ? row.contributors : row.staleContributors).add(doc.contributor);
    usage.set(name, row);
  }
});
const usageStale = usageAges.filter((a) => a.state === 'stale').length;


// -- the skills lane --------------------------------------------------------
// The catalog's `skills` entries used to be a hand-seeded fixture waiting for an
// external indexer to rewrite them — and nothing ever did, so the catalog described
// three example skills while the lane held twenty. The registry is the authority on
// its own lane; it reads the same files an indexer would and writes the same shape
// (name, version, category, path, contentHash, lessons). Two producers computing one
// truth from one source is not a conflict. What the registry CANNOT compute is
// carried forward from the committed file, per skill, untouched: `adopters` (which
// installations hold the skill at which version — an operator's fleet-audit writes
// it; see scripts/fleet-audit.mjs) and `applicability` (a consumer's own dimension
// mapping). A skill that left the lane leaves the catalog; nothing is invented.
const prior = new Map((Array.isArray(catalog.skills) ? catalog.skills : []).map((s) => [s.name, s]));
const skills = laneSkills.map((s) => {
  const row = usage.get(s.name);
  const old = prior.get(s.name) ?? {};
  const entry = {
    name: s.name,
    version: s.fm.version ?? null,
    category: s.fm.category ?? 'other',
    path: `skills/${s.name}/SKILL.md`,
    contentHash: s.contentHash,
  };
  if (old.applicability) entry.applicability = old.applicability;
  if (old._drift) entry._drift = old._drift;
  entry.adopters = Array.isArray(old.adopters) ? old.adopters : [];
  entry.invokes30d = row ? row.invokes30d : 0;
  entry.reportedInvokes = row ? row.invokes : 0;
  entry.lessons = s.lessons;
  if (s.lessonsPath) { entry.lessonsPath = s.lessonsPath; entry.lessonsHash = s.lessonsHash; }
  // Named so a reader can tell "nobody uses this" from "nobody reports on this" —
  // a zero with no contributors means the lane has no witness, not that the skill
  // is dead.
  entry.usageContributors = row ? [...row.contributors].sort() : [];
  // And who DID report, in a window that has since closed: their counts live on in
  // `reportedInvokes` only. Always present, empty when none.
  entry.usageStaleContributors = row ? [...row.staleContributors].sort() : [];
  // From the run log, not the usage lane: invokes30d counts invocations a contributor
  // reported; these describe how the runs that logged themselves went. Always present -
  // zero/null on a skill with no logged runs, so a reader never has to tell "absent" from
  // "none".
  Object.assign(entry, catalogFields(runStats[s.name]));
  return entry;
});

// -- the practices and memory lanes ----------------------------------------
// Same rule, same reason: the registry reads its own lanes. Shape matches what the
// reference consumer's indexer writes for these entries.
const practices = [];
if (fs.existsSync(PRACTICES)) {
  for (const slug of fs.readdirSync(PRACTICES, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
    const file = path.join(PRACTICES, slug, 'PRACTICE.md');
    if (!fs.existsSync(file)) continue;
    const raw = fs.readFileSync(file, 'utf8');
    const fm = readFm(file);
    const starterDir = path.join(PRACTICES, slug, 'starter');
    const starter = [];
    const walkStarter = (dir, rel) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const r = `${rel}/${e.name}`;
        if (e.isDirectory()) walkStarter(path.join(dir, e.name), r); else starter.push(r);
      }
    };
    if (fs.existsSync(starterDir)) walkStarter(starterDir, `practices/${slug}/starter`);
    practices.push({ id: fm.id ?? slug, dimension: fm.dimension ?? null, path: `practices/${slug}/PRACTICE.md`, contentHash: contentDigest(raw), starter });
  }
}
const memory = [];
if (fs.existsSync(MEMORY)) {
  for (const kind of fs.readdirSync(MEMORY, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
    for (const f of fs.readdirSync(path.join(MEMORY, kind)).filter((x) => x.endsWith('.md') && !x.startsWith('_')).sort()) {
      const file = path.join(MEMORY, kind, f);
      const fm = readFm(file);
      const conf = Number(fm.confidence);
      memory.push({
        kind: fm.kind ?? kind, slug: f.replace(/\.md$/, ''), path: `memory/${kind}/${f}`,
        contentHash: contentDigest(fs.readFileSync(file, 'utf8')),
        confidence: Number.isFinite(conf) ? conf : 1, namespace: fm.namespace ?? null, source: fm.source ?? null,
      });
    }
  }
}
const counts = { skills: skills.length, practices: practices.length, memory: memory.length, lessons: skills.reduce((n, s) => n + (s.lessons ?? 0), 0) };

// generatedAt (the evidence date) is computed above the usage fold, which measures against it.

const next = {
  ...catalog,
  _note: 'GENERATED FILE — scripts/build-catalog.mjs reads every lane (skills, practices, memory, knowledge, usage) and rewrites this file; --check fails CI when it is stale. Per skill, `adopters` is carried forward untouched (the registry cannot see installations; an operator\'s scripts/fleet-audit.mjs --write-adopters maintains it) and `invokes30d` + `usageContributors` + `usageStaleContributors` + `reportedInvokes` are DERIVED from the usage/ lane (a report is current while its whole-day age against `generatedAt` is at most its windowDays; only current reports reach `invokes30d` and `usageContributors`, stale ones are named in `usageStaleContributors`, every report reaches `reportedInvokes`); `runs30d`, `outcomes30d`, `difficulty30d`, `tokensMedian30d` and `tokensBasis30d` are DERIVED from the usage/runs/ run log (30 days ending at the newest logged run; tokens are the measured median when at least half the runs are measured, else the agents\' estimate, and tokensBasis30d says which). `generatedAt` is the newest instant in the committed data this catalog reads (a subject changedAt, a usage report generatedAt, a run row ts, a LESSONS heading date), ISO 8601 UTC: the date of the newest evidence in the registry, not the wall-clock time of the build, so --check stays a pure function of the tree. Hand-edits to anything else are overwritten on the next build. A second producer (e.g. Ascent\'s indexer) may rewrite the envelope from the same files; two producers computing one truth from one source is not a conflict.',
  generatedAt,
  generatedBy: 'scripts/build-catalog.mjs',
  skills, practices, memory, counts, bundles,
  usageEvidence: {reports:usageReports,unresolved:unresolvedUsage,interpretation: 'invokes30d includes only CURRENT reported 30-day windows ending at each report date; reportedInvokes includes all reported windows, any age. Each report carries state (current when its whole-day ageDays against the catalog generatedAt, the evidence date, is at most its windowDays, else stale) and ageDays. Neither count is a live rolling count. Unresolved names retain counts here.'},
};
const serialized = `${JSON.stringify(next, null, 2)}\n`;

if (checkOnly) {
  const current = fs.readFileSync(CATALOG, 'utf8');
  // Newline-insensitive, for the same reason the bundle digest is: a Windows checkout
  // holds CRLF while this writes LF, so a raw comparison reports a byte-identical
  // catalog as STALE — a verdict about the checkout wearing the costume of a verdict
  // about the content, which is precisely the failure lib/bundle-hash.mjs exists for.
  if (!sameIgnoringNewlines(current, serialized)) {
    console.error('catalog.json is STALE — run `node scripts/build-catalog.mjs` and commit the result.');
    const cur = JSON.stringify(catalog.bundles ?? null);
    const nxt = JSON.stringify(bundles);
    if (cur !== nxt) console.error(`  bundles differ:\n    committed: ${cur}\n    computed:  ${nxt}`);
    // Name what differs instead of "elsewhere": the top-level keys, and per-entry fields for
    // the keyed arrays a hand-edit most often lands in.
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const keys = [...new Set([...Object.keys(catalog), ...Object.keys(next)])].filter((k) => !same(catalog[k], next[k]));
    if (keys.length) console.error(`  differing key(s): ${keys.join(', ')}`);
    else console.error('  every key matches; the difference is formatting only (key order or whitespace).');
    for (const [key, id] of [['skills', 'name'], ['practices', 'id'], ['memory', 'path']]) {
      if (!keys.includes(key) || !Array.isArray(catalog[key])) continue;
      const committed = new Map(catalog[key].map((e) => [e?.[id], e]));
      for (const e of next[key]) {
        const c = committed.get(e[id]);
        if (!c) { console.error(`    ${key}[${e[id]}]: absent from the committed file`); continue; }
        const fields = [...new Set([...Object.keys(c), ...Object.keys(e)])].filter((f) => !same(c[f], e[f]));
        if (fields.length) console.error(`    ${key}[${e[id]}]: ${fields.join(', ')}`);
      }
      for (const c of catalog[key]) if (!next[key].some((e) => e[id] === c?.[id])) console.error(`    ${key}[${c?.[id]}]: committed but no longer in the lane`);
    }
    process.exit(EXIT.VIOLATIONS);
  }
  console.log(`catalog.json is fresh — ${bundles.length} bundle(s) indexed, usage from ${usageFiles} of ${usageFiles + usageSkipped} contributor file(s)${usageSkipped ? ` — ${usageSkipped} skipped as unparseable` : ''}${usageStale ? `, ${usageStale} stale against ${generatedAt}` : ''}`);
} else {
  fs.writeFileSync(CATALOG, serialized);
  console.log(`catalog.json updated — ${bundles.length} bundle(s), usage from ${usageFiles} of ${usageFiles + usageSkipped} contributor file(s)${usageSkipped ? ` — ${usageSkipped} skipped as unparseable; invokes30d is derived from the ${usageFiles} that parsed` : ''}${usageStale ? ` (${usageStale} stale against ${generatedAt}: kept in reportedInvokes, out of invokes30d)` : ''}:`);
  for (const b of bundles) {
    console.log(`  ${b.name}: ${b.subjects} subjects / ${b.techniques} techniques / ${b.applications} applications (${b.contentHash})`);
  }
}
