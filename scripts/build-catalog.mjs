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

  let subjects = 0, techniques = 0, applications = 0;
  for (const s of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!s.isDirectory()) continue;
    subjects++;
    const t = path.join(dir, s.name, 'techniques');
    const a = path.join(dir, s.name, 'applications');
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
