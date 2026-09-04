#!/usr/bin/env node
/**
 * surface-snapshot — capture the published surface as of this commit, and diff two captures.
 *
 * ## What is broken without it
 *
 * The registry publishes a SURFACE: a bundle's subjects, a subject's techniques, the laws
 * they cite, and the `use_when` lines consumers route on. Every one of those is an address
 * somebody else depends on. Nothing here produced an artifact of that surface, so a rename
 * or an accidental drop was invisible in review — the diff showed a file moving and said
 * nothing about the entry point that stopped existing.
 *
 * ## Why the sort is the whole trick
 *
 * A snapshot is only useful if a re-run over an unchanged tree produces byte-identical
 * output. Directory order, taxonomy declaration order and frontmatter order all vary for
 * reasons that are not changes; left unsorted they produce diff noise that hides the one
 * real removal inside forty reorderings, and a reviewer who has learned to skim the noise
 * has learned to skim the finding. Everything is sorted at every level — bundles, subjects,
 * techniques, laws, and each `use_when` list — so that a non-empty diff means something.
 *
 * ## The instrument is asserted before the result
 *
 * A walk that finds nothing and a walk that is broken must not look alike. Zero bundles,
 * zero subjects, zero techniques and an unreadable taxonomy are all exit 2, never an empty
 * snapshot reported as a clean surface.
 *
 * Usage:
 *   node scripts/surface-snapshot.mjs --out surface.json     # capture
 *   node scripts/surface-snapshot.mjs --diff old.json new.json
 *   node scripts/surface-snapshot.mjs --diff old.json        # compare against the live tree
 *
 * Exit codes:
 *   0  snapshot written, or diff found no differences
 *   1  diff found differences (removals, additions, renames, use_when changes)
 *   2  the instrument could not run — missing lane, empty walk, unreadable snapshot
 *
 * Zero dependencies, like every gate here.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Nothing outside `lib/taxonomy.mjs` may construct a subject path — this script reads the
// tree through the same resolver the gate and the index builder use, or it would report a
// surface the corpus does not have.
import { loadTaxonomy, walkSubjects } from './lib/taxonomy.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const KNOWLEDGE = path.join(ROOT, 'knowledge');

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const pick = (f, d) => { const i = argv.indexOf(f); return i === -1 ? d : argv[i + 1]; };

const die = (msg) => { console.error(`FATAL: ${msg}`); console.error('This instrument has checked nothing and will not claim success.'); process.exit(2); };

// ------------------------------------------------------------------ frontmatter
// This script's own parser, matching the repo convention that each runnable carries one.
const useWhenOf = (file) => {
  const m = fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return [];
  const out = [];
  let inList = false;
  for (const line of m[1].split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (inList && item) { out.push(item[1].replace(/\s+#.*$/, '').trim()); continue; }
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!kv) continue;
    inList = kv[1] === 'use_when';
    if (!inList) continue;
    const val = kv[2].replace(/\s+#.*$/, '').trim();
    if (val.startsWith('[')) { out.push(...val.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean)); inList = false; }
  }
  return out.filter(Boolean).sort();
};

// ------------------------------------------------------------------ capture
const capture = () => {
  if (!fs.existsSync(KNOWLEDGE)) die(`no knowledge/ lane at ${KNOWLEDGE}`);
  const names = fs.readdirSync(KNOWLEDGE, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
  if (names.length === 0) die('knowledge/ holds zero bundles — THE READER IS BROKEN, or the lane is empty');

  const bundles = [];
  let subjectCount = 0;
  let techniqueCount = 0;
  for (const name of names) {
    const dir = path.join(KNOWLEDGE, name);
    const { errors } = loadTaxonomy(dir, name);
    if (errors.length) die(`knowledge/${name}: ${errors[0]}`);
    const { found } = walkSubjects(dir);

    const lawsFile = path.join(dir, '_laws.md');
    const laws = fs.existsSync(lawsFile)
      ? [...fs.readFileSync(lawsFile, 'utf8').matchAll(/<a id="([^"]+)"/g)].map((m) => m[1]).sort()
      : [];

    const subjects = [...found.keys()].sort().map((slug) => {
      const tDir = path.join(dir, found.get(slug), 'techniques');
      const techniques = (fs.existsSync(tDir) ? fs.readdirSync(tDir).filter((f) => f.endsWith('.md')) : [])
        .map((f) => f.replace(/\.md$/, ''))
        .sort()
        .map((t) => ({ slug: t, use_when: useWhenOf(path.join(tDir, `${t}.md`)) }));
      techniqueCount += techniques.length;
      return { slug, techniques };
    });
    subjectCount += subjects.length;
    bundles.push({ bundle: name, laws, subjects });
  }

  if (subjectCount === 0) die('zero subjects across every bundle — THE SUBJECT WALK IS BROKEN');
  if (techniqueCount === 0) die('zero techniques across every subject — THE TECHNIQUE WALK IS BROKEN');
  return { schema: 'rkb-surface/1', bundles, counts: { bundles: bundles.length, subjects: subjectCount, techniques: techniqueCount } };
};

// A snapshot flattens to addressed entries; the diff is set arithmetic over the addresses.
const entries = (snap) => {
  const m = new Map();
  for (const b of snap.bundles ?? []) {
    for (const law of b.laws ?? []) m.set(`${b.bundle}#${law}`, '');
    for (const s of b.subjects ?? []) {
      m.set(`${b.bundle}/${s.slug}`, '');
      for (const t of s.techniques ?? []) m.set(`${b.bundle}/${s.slug}/${t.slug}`, (t.use_when ?? []).join(' | '));
    }
  }
  return m;
};

const read = (f) => {
  if (!f) die('--diff needs at least one snapshot path');
  if (!fs.existsSync(f)) die(`snapshot ${f} does not exist`);
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return die(`snapshot ${f} does not parse: ${e.message}`); }
};

// ------------------------------------------------------------------ run
if (has('--diff')) {
  const i = argv.indexOf('--diff');
  const before = entries(read(argv[i + 1]));
  const afterArg = argv[i + 2] && !argv[i + 2].startsWith('--') ? argv[i + 2] : null;
  const after = entries(afterArg ? read(afterArg) : capture());

  const removed = [...before.keys()].filter((k) => !after.has(k)).sort();
  const added = [...after.keys()].filter((k) => !before.has(k)).sort();
  const changed = [...before.keys()].filter((k) => after.has(k) && after.get(k) !== before.get(k)).sort();

  // A rename is a removal and an addition under the same parent carrying the identical,
  // non-empty routing text. Naming it as a rename is what stops a reviewer from reading a
  // real removal and a real addition into one harmless move — or the reverse.
  const parent = (k) => k.slice(0, k.lastIndexOf('/'));
  const renamed = [];
  for (const r of [...removed]) {
    const text = before.get(r);
    if (!text) continue;
    const a = added.find((x) => parent(x) === parent(r) && after.get(x) === text);
    if (!a) continue;
    renamed.push(`${r} -> ${a}`);
    removed.splice(removed.indexOf(r), 1);
    added.splice(added.indexOf(a), 1);
  }

  // Removals first and alone: an addition breaks nobody, a removal breaks every consumer
  // holding the address.
  if (removed.length) { console.log(`REMOVED (${removed.length}) — each of these was an address somebody could be holding:`); for (const k of removed) console.log(`  - ${k}`); }
  if (renamed.length) { console.log(`renamed (${renamed.length}):`); for (const k of renamed) console.log(`  ~ ${k}`); }
  if (added.length) { console.log(`added (${added.length}):`); for (const k of added) console.log(`  + ${k}`); }
  if (changed.length) { console.log(`use_when changed (${changed.length}):`); for (const k of changed) console.log(`  * ${k}`); }

  const total = removed.length + renamed.length + added.length + changed.length;
  console.log(total === 0 ? 'surface unchanged' : `surface differs — ${total} entr${total === 1 ? 'y' : 'ies'}`);
  process.exit(total === 0 ? 0 : 1);
}

const out = pick('--out', null);
if (!out) { console.error('usage: node scripts/surface-snapshot.mjs --out <file> | --diff <old.json> [<new.json>]'); process.exit(2); }
const snap = capture();
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(snap, null, 2)}\n`);
console.log(`${snap.counts.bundles} bundles · ${snap.counts.subjects} subjects · ${snap.counts.techniques} techniques -> ${out}`);
