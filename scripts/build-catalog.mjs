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
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const KNOWLEDGE = path.join(ROOT, 'knowledge');
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

// Content hash over the bundle's published files: sorted relative paths + their bytes, so
// the digest changes when content changes and NOT when the filesystem reorders a listing.
const hashBundle = (dir) => {
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (e.name.startsWith('.')) continue; // local overlays never enter the digest
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else files.push(p);
    }
  };
  walk(dir);
  const h = crypto.createHash('sha256');
  for (const f of files.sort()) {
    h.update(path.relative(dir, f).replace(/\\/g, '/'));
    h.update(fs.readFileSync(f));
  }
  return { hash: `sha256:${h.digest('hex').slice(0, 16)}`, count: files.length };
};

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

const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
const next = { ...catalog, bundles };
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
  console.log(`catalog.json is fresh — ${bundles.length} bundle(s) indexed`);
} else {
  fs.writeFileSync(CATALOG, serialized);
  console.log(`catalog.json updated — ${bundles.length} bundle(s):`);
  for (const b of bundles) {
    console.log(`  ${b.name}: ${b.subjects} subjects / ${b.techniques} techniques / ${b.applications} applications (${b.contentHash})`);
  }
}
