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
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashBundle } from './lib/bundle-hash.mjs';
import { walkSubjects } from './lib/taxonomy.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const KNOWLEDGE = path.join(ROOT, 'knowledge');
const USAGE = path.join(ROOT, 'usage');
const CATALOG = path.join(ROOT, 'catalog.json');
const checkOnly = process.argv.includes('--check');

if (!fs.existsSync(KNOWLEDGE)) {
  console.error(`FATAL: no knowledge/ lane at ${KNOWLEDGE} — refusing to write a catalog that claims zero bundles.`);
  process.exit(2);
}
if (!fs.existsSync(CATALOG)) {
  console.error(`FATAL: ${CATALOG} does not exist. This script edits a catalog, it does not invent one.`);
  process.exit(2);
}

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
for (const b of bundles) {
  const idxFile = path.join(KNOWLEDGE, b.name, 'index.json');
  if (!fs.existsSync(idxFile)) {
    mismatches.push(`${b.name}: no index.json — run build-index.mjs first (its hash is covered by this catalog)`);
    continue;
  }
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(idxFile, 'utf8')).meta ?? {};
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
  process.exit(2);
}

// -- usage aggregation -------------------------------------------------------
// One file per contributing installation, summed per skill. Validation lives in
// scripts/check-usage.mjs; this reads what that gate has already accepted and is
// deliberately tolerant — a malformed file must not be able to erase every
// count, so it is skipped and named rather than thrown on.
const usage = new Map(); // skill -> { invokes, contributors:Set }
let usageFiles = 0;
if (fs.existsSync(USAGE)) {
  for (const f of fs.readdirSync(USAGE).filter((x) => x.endsWith('.json')).sort()) {
    let doc;
    try {
      doc = JSON.parse(fs.readFileSync(path.join(USAGE, f), 'utf8'));
    } catch {
      console.warn(`  note: usage/${f} is not valid JSON — skipped (run check-usage.mjs)`);
      continue;
    }
    usageFiles += 1;
    for (const [name, entry] of Object.entries(doc?.skills ?? {})) {
      const n = Number.isInteger(entry?.invokes) && entry.invokes >= 0 ? entry.invokes : 0;
      const row = usage.get(name) ?? { invokes: 0, contributors: new Set() };
      row.invokes += n;
      if (doc?.contributor) row.contributors.add(doc.contributor);
      usage.set(name, row);
    }
  }
}

const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));

const skills = Array.isArray(catalog.skills)
  ? catalog.skills.map((sk) => {
      const row = usage.get(sk.name);
      return {
        ...sk,
        invokes30d: row ? row.invokes : 0,
        // Named so a reader can tell "nobody uses this" from "nobody reports on
        // this" — a zero with no contributors means the lane has no witness, not
        // that the skill is dead.
        usageContributors: row ? [...row.contributors].sort() : [],
      };
    })
  : catalog.skills;

const next = { ...catalog, skills, bundles };
const serialized = `${JSON.stringify(next, null, 2)}\n`;

if (checkOnly) {
  const current = fs.readFileSync(CATALOG, 'utf8');
  if (current !== serialized) {
    console.error('catalog.json is STALE — run `node scripts/build-catalog.mjs` and commit the result.');
    const cur = JSON.stringify(catalog.bundles ?? null);
    const nxt = JSON.stringify(bundles);
    if (cur !== nxt) console.error(`  bundles differ:\n    committed: ${cur}\n    computed:  ${nxt}`);
    else console.error('  bundles match; the difference is elsewhere in the file (formatting or another key).');
    process.exit(1);
  }
  console.log(`catalog.json is fresh — ${bundles.length} bundle(s) indexed, ${usageFiles} usage contributor(s)`);
} else {
  fs.writeFileSync(CATALOG, serialized);
  console.log(`catalog.json updated — ${bundles.length} bundle(s), usage from ${usageFiles} contributor(s):`);
  for (const b of bundles) {
    console.log(`  ${b.name}: ${b.subjects} subjects / ${b.techniques} techniques / ${b.applications} applications (${b.contentHash})`);
  }
}
