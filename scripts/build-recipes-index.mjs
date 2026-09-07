#!/usr/bin/env node
/**
 * build-recipes-index - emit `recipes/index.json` for the whole lane.
 *
 * The index is what makes a nested lane usable WITHOUT walking the tree: one
 * document mapping every slug to where it lives, what version it is, how mature
 * it is, and the two facts an adopter selects on before opening anything -
 * which connector TYPES it needs and what trigger kind it recommends. An agent
 * choosing a recipe reads this; a human reads the markdown.
 *
 * It is also what makes `depth: nested` safe here. `skills/` is `depth: fixed`
 * because a consumer's indexer selects skills by exact path length, so a folder
 * inserted there makes every skill silently vanish. This lane's consumers read
 * this generated file instead, which is why the folder depth is ours to choose.
 *
 * ## Why this is a separate script from build-index.mjs
 *
 * `scripts/build-index.mjs` is not a generic nested-lane indexer. It is the
 * knowledge bundle's indexer, and every line of it is about a bundle: it loads
 * `taxonomy.json` through `scripts/lib/taxonomy.mjs`, walks `techniques/` and
 * `applications/`, resolves `_laws.md` anchors into law statements, and reports
 * `use_when` coverage. None of those exist in a recipe, and none of a recipe's
 * fields exist in a bundle. Sharing the file would mean one script with two
 * disjoint bodies behind a lane flag, which is two scripts wearing one name.
 * What IS shared is the freshness contract: `--check`, newline-insensitive
 * comparison, and a FATAL rather than a green report when the lane is empty.
 *
 * Usage:
 *   node scripts/build-recipes-index.mjs            # write
 *   node scripts/build-recipes-index.mjs --check    # verify freshness, write nothing (CI)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sameIgnoringNewlines } from './lib/bundle-hash.mjs';
import { EXIT } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LANE = path.join(ROOT, 'recipes');
const OUT = path.join(LANE, 'index.json');
const check = process.argv.includes('--check');

const dirsIn = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
  .map((e) => e.name)
  .sort();

if (!fs.existsSync(LANE)) {
  console.error('build-recipes-index FATAL: no recipes/ lane. Nothing to index - refusing to exit 0.');
  process.exit(EXIT.FATAL);
}

// The gate owns validity. This builder owns SHAPE ONLY, and it refuses to write
// an index over something it could not read - a half-index is worse than none,
// because a consumer cannot tell a missing recipe from a retired one.
const recipes = {};
const problems = [];
let scanned = 0;

for (const domain of dirsIn(LANE)) {
  for (const topic of dirsIn(path.join(LANE, domain))) {
    for (const slug of dirsIn(path.join(LANE, domain, topic))) {
      const rel = `recipes/${domain}/${topic}/${slug}`;
      const file = path.join(LANE, domain, topic, slug, 'recipe.json');
      if (!fs.existsSync(file)) { problems.push(`${rel}: no recipe.json`); continue; }
      scanned += 1;
      let obj;
      try { obj = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {
        problems.push(`${rel}/recipe.json: does not parse (${e.message})`);
        continue;
      }
      const key = typeof obj.slug === 'string' && obj.slug ? obj.slug : slug;
      if (recipes[key]) { problems.push(`${rel}: duplicate slug "${key}", also at ${recipes[key].path}`); continue; }
      recipes[key] = {
        path: rel,
        version: obj.version ?? null,
        status: obj.status ?? null,
        domain: obj.domain ?? domain,
        topic,
        title: typeof obj.title === 'string' ? obj.title : null,
        connector_types: Array.isArray(obj.connector_types) ? obj.connector_types : [],
        // The trigger is a RECOMMENDATION and the index carries only its kind.
        // The rationale is prose a reader wants at the recipe, not a field a
        // selector filters on, and copying it here would be a second place for
        // it to go stale.
        recommended_trigger_kind: obj.recommended_trigger?.kind ?? null,
      };
    }
  }
}

if (problems.length) {
  console.error(`build-recipes-index FATAL: ${problems.length} recipe(s) could not be read -`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('Refusing to write an index that silently omits them. Run scripts/check-recipes.mjs.');
  process.exit(EXIT.FATAL);
}
if (scanned === 0) {
  console.error('build-recipes-index FATAL: recipes/ contains no recipes at recipes/<domain>/<topic>/<slug>/.');
  console.error('Reporting nothing is not the same as finding nothing - refusing to exit 0.');
  process.exit(EXIT.FATAL);
}

const slugs = Object.keys(recipes).sort();
const ordered = {};
for (const s of slugs) ordered[s] = recipes[s];

const byStatus = {};
const byDomain = {};
for (const r of Object.values(ordered)) {
  byStatus[r.status ?? 'unknown'] = (byStatus[r.status ?? 'unknown'] ?? 0) + 1;
  byDomain[r.domain] = (byDomain[r.domain] ?? 0) + 1;
}

const index = {
  meta: {
    generated_by: 'scripts/build-recipes-index.mjs',
    lane: 'recipes',
    source: 'recipes/<domain>/<topic>/<slug>/recipe.json',
    recipes: slugs.length,
    by_status: byStatus,
    by_domain: byDomain,
    // Stated in-band so nobody builds a feature on a field this index does not
    // carry. The full object is one file open away; this is a selector, not a
    // mirror, and a mirror is a second copy that goes stale.
    excludes: 'description, activities, outcomes, guidance, examples, lessons - open the recipe',
  },
  recipes: ordered,
};

const next = `${JSON.stringify(index, null, 1)}\n`;
const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;

// Compared ignoring newlines: a Windows checkout hands the working tree CRLF while
// this script writes LF, and a freshness verdict must not depend on which platform
// cloned the repo. Same rule build-index.mjs runs on.
if (check) {
  if (prev === null || !sameIgnoringNewlines(prev, next)) {
    console.error('stale: recipes/index.json does not match the lane.');
    console.error('Run `node scripts/build-recipes-index.mjs` and commit the result.');
    process.exit(EXIT.VIOLATIONS);
  }
} else if (prev === null || !sameIgnoringNewlines(prev, next)) {
  fs.writeFileSync(OUT, next);
}

const fmt = (o) => Object.entries(o).sort().map(([k, n]) => `${k}:${n}`).join(' ');
console.log(`recipes: ${slugs.length} recipe(s) - ${fmt(byStatus)} - domains ${fmt(byDomain)}`);
console.log(check ? 'index is current' : 'index written');
process.exit(EXIT.OK);
