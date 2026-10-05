#!/usr/bin/env node
/**
 * build-publications-index - emit `publications/index.json` for the whole lane.
 *
 * Why it exists: a consumer (the article pipeline that writes this lane, a site that
 * lists posts, an agent asking "has this subject been written up already?") should
 * select a publication without opening every directory. The index is that selector:
 * slug -> path, title, date, topic address, the standard it was held to, and counts.
 * The body, the sources and the figures stay in the publication - a mirror here would
 * be a second copy that goes stale.
 *
 * Why it is not build-recipes-index.mjs with a flag: the two lanes share the freshness
 * contract (`--check`, newline-insensitive comparison, FATAL on an empty lane) and
 * nothing else; a publication has no domain/topic folders, no connector types and no
 * trigger. One script with two disjoint bodies behind a flag is two scripts wearing
 * one name - the same reason build-recipes-index.mjs gives for not being build-index.mjs.
 *
 * The gate owns validity (scripts/check-publications.mjs runs first in the lane row).
 * This builder owns shape only, and refuses to write an index over a publication it
 * could not read: a half-index cannot tell a missing post from a withdrawn one.
 *
 * Usage:
 *   node scripts/build-publications-index.mjs                 # write
 *   node scripts/build-publications-index.mjs --check         # verify freshness (CI)
 *   node scripts/build-publications-index.mjs --root <dir>    # another lane root (tests)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sameIgnoringNewlines } from './lib/bundle-hash.mjs';
import { EXIT } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const argv = process.argv.slice(2);
const check = argv.includes('--check');
const rootIdx = argv.indexOf('--root');
if (rootIdx !== -1 && !argv[rootIdx + 1]) {
  console.error('build-publications-index FATAL: --root needs a directory.');
  process.exit(EXIT.FATAL);
}
const LANE = rootIdx === -1 ? path.join(ROOT, 'publications') : path.resolve(argv[rootIdx + 1]);
const OUT = path.join(LANE, 'index.json');

if (!fs.existsSync(LANE)) {
  console.error('build-publications-index FATAL: no publications/ lane. Nothing to index - refusing to exit 0.');
  process.exit(EXIT.FATAL);
}

const slugs = fs.readdirSync(LANE, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
  .map((e) => e.name)
  .sort();

const publications = {};
const problems = [];
for (const slug of slugs) {
  const rel = `publications/${slug}`;
  const file = path.join(LANE, slug, 'publication.json');
  if (!fs.existsSync(file)) { problems.push(`${rel}: no publication.json`); continue; }
  let p;
  try { p = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {
    problems.push(`${rel}/publication.json: does not parse (${e.message})`);
    continue;
  }
  if (p === null || typeof p !== 'object' || Array.isArray(p)) { problems.push(`${rel}/publication.json: not an object`); continue; }
  const sources = Array.isArray(p.sources) ? p.sources : [];
  const topic = p.topic && typeof p.topic === 'object' ? p.topic : {};
  const entry = {
    path: rel,
    title: p.title,
    subtitle: p.subtitle,
    date: p.date,
    readMinutes: p.readMinutes,
    status: p.status,
    // The topic's ADDRESS, never its text: a selector filters on bundle/subject, and the
    // free-text topic is prose a reader wants at the publication.
    topic: { kind: topic.kind, ...(topic.bundle ? { bundle: topic.bundle } : {}), ...(topic.subject ? { subject: topic.subject } : {}) },
    standard: p.standard,
    sources: sources.length,
    primary: sources.filter((s) => s && s.primary === true).length,
    counter: sources.filter((s) => s && s.counter === true).length,
    figures: Array.isArray(p.figures) ? p.figures.length : 0,
  };
  // Absent-value convention, same as the publication: omit the key, never write null.
  for (const k of Object.keys(entry)) if (entry[k] === undefined || entry[k] === null) delete entry[k];
  publications[slug] = entry;
}

if (problems.length) {
  console.error(`build-publications-index FATAL: ${problems.length} publication(s) could not be read -`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('Refusing to write an index that silently omits them. Run scripts/check-publications.mjs.');
  process.exit(EXIT.FATAL);
}
if (slugs.length === 0) {
  console.error('build-publications-index FATAL: publications/ contains no publications/<slug>/ directory.');
  console.error('Reporting nothing is not the same as finding nothing - refusing to exit 0.');
  process.exit(EXIT.FATAL);
}

const byStatus = {};
for (const e of Object.values(publications)) byStatus[e.status ?? 'unknown'] = (byStatus[e.status ?? 'unknown'] ?? 0) + 1;

const index = {
  meta: {
    generated_by: 'scripts/build-publications-index.mjs',
    lane: 'publications',
    source: 'publications/<slug>/publication.json',
    publications: slugs.length,
    by_status: byStatus,
    // Stated in-band so nobody builds a feature on a field this index does not carry.
    excludes: 'topic text, sources, claims, figures, check, run - open the publication',
  },
  publications,
};

const next = `${JSON.stringify(index, null, 1)}\n`;
const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;

// Newline-insensitive: a CRLF checkout must not read as stale. Same rule as the other indexes.
if (check) {
  if (prev === null || !sameIgnoringNewlines(prev, next)) {
    console.error('stale: publications/index.json does not match the lane.');
    console.error('Run `node scripts/build-publications-index.mjs` (or `node scripts/gate.mjs --lane publications --write`) and commit the result.');
    process.exit(EXIT.VIOLATIONS);
  }
} else if (prev === null || !sameIgnoringNewlines(prev, next)) {
  fs.writeFileSync(OUT, next);
}

console.log(`publications: ${slugs.length} publication(s) - ${Object.entries(byStatus).map(([k, n]) => `${k}:${n}`).join(' ')}`);
console.log(check ? 'index is current' : 'index written');
process.exit(EXIT.OK);
