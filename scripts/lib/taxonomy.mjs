/**
 * taxonomy — the authority on where a subject lives, shared by every script that needs it.
 *
 * ## Why this is a module and not a copied helper
 *
 * The rest of `scripts/` is deliberately standalone: each gate carries its own small
 * frontmatter parser, and duplication there is cheap because a divergence shows up as a
 * different verdict on the same file, loudly.
 *
 * A slug -> path resolver is not like that. If `check-bundles.mjs` and `build-index.mjs`
 * disagreed about where `table` lives, the gate would pass a tree the index describes
 * incorrectly, and the corpus would be quietly wrong in the one file consumers actually
 * read. One resolver, imported twice.
 *
 * ## The model
 *
 * `taxonomy.json` is the AUTHORITY; the folder tree is derived from it. That inversion is
 * the point: once folders encode the taxonomy, a hand-edited recategorization is a
 * corpus-wide link break waiting to happen, so moves become a scripted operation
 * (`apply-taxonomy.mjs`) and this module is what both the mover and the checkers read.
 *
 * A subject's IDENTITY is its bare slug, everywhere and forever - `technique@owner`,
 * `shared_with`, the index's subject map, the signals lane. Only its LOCATION is nested.
 * Nothing outside this module should ever construct a subject path.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * The cap: no directory under `knowledge/` may hold more than this many child DIRECTORIES.
 *
 * Files are not counted. A subject's `techniques/` holds markdown, and a subject with
 * thirty techniques needs splitting for reasons that have nothing to do with browsing.
 *
 * Ten is a browsing limit, not a structural truth - it is the number of things a person
 * can see in one screenful and hold in their head at once.
 */
export const MAX_CHILD_DIRS = 10;

/**
 * Hysteresis. A category is subdivided when it goes OVER the cap and collapsed back only
 * when it falls to this or below.
 *
 * Without the gap, a category oscillating around ten would trigger a move-and-rewrite of
 * every subject inside it on alternating contributions - and every move rewrites links.
 */
export const COLLAPSE_AT = 6;

export const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Read and validate one bundle's taxonomy.
 *
 * Returns `{ taxonomy, errors, subjects }` where `subjects` maps slug -> {
 *   category, subcategory, dir } and `dir` is the path RELATIVE to the bundle root where
 * that subject belongs under the declared layout. `errors` is never null - callers report
 * it; this module never exits a process, because it does not know whose gate it is in.
 */
export function loadTaxonomy(bundleDir, bundleName) {
  const file = path.join(bundleDir, 'taxonomy.json');
  const errors = [];
  const subjects = new Map();

  if (!fs.existsSync(file)) {
    errors.push(`knowledge/${bundleName}/taxonomy.json is missing — it is the authority on where every subject lives`);
    return { taxonomy: null, errors, subjects };
  }

  let tx;
  try {
    tx = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    errors.push(`knowledge/${bundleName}/taxonomy.json does not parse: ${e.message}`);
    return { taxonomy: null, errors, subjects };
  }

  const rel = `knowledge/${bundleName}/taxonomy.json`;
  if (tx.schema !== 'rkb-taxonomy/1') {
    errors.push(`${rel}: schema must be "rkb-taxonomy/1", found ${JSON.stringify(tx.schema)}`);
  }
  if (tx.bundle !== bundleName) {
    errors.push(`${rel}: bundle "${tx.bundle}" does not match the folder "${bundleName}"`);
  }
  if (tx.layout !== 'flat' && tx.layout !== 'nested') {
    errors.push(`${rel}: layout must be "flat" (subjects sit directly under the bundle) or "nested" (subjects sit at their taxonomy path), found ${JSON.stringify(tx.layout)}`);
  }

  const cats = Array.isArray(tx.categories) ? tx.categories : null;
  if (!cats || cats.length === 0) {
    errors.push(`${rel}: declares zero categories`);
    return { taxonomy: tx, errors, subjects };
  }
  if (cats.length > MAX_CHILD_DIRS) {
    errors.push(
      `${rel}: ${cats.length} categories exceeds the cap of ${MAX_CHILD_DIRS} — ` +
        'a level with more than ten children is the thing this taxonomy exists to prevent',
    );
  }

  const orders = cats.map((c) => c.order);
  if (new Set(orders).size !== orders.length) {
    errors.push(`${rel}: duplicate order values — order is the display sequence and must be unique`);
  }

  const seenCat = new Set();
  for (const cat of cats) {
    if (!SLUG_RE.test(String(cat.id ?? ''))) {
      errors.push(`${rel}: category id ${JSON.stringify(cat.id)} is not a kebab-case slug`);
      continue;
    }
    if (seenCat.has(cat.id)) errors.push(`${rel}: category "${cat.id}" declared twice`);
    seenCat.add(cat.id);
    if (typeof cat.title !== 'string' || !cat.title.trim()) {
      errors.push(`${rel}: category "${cat.id}" has no title`);
    }

    const hasSubs = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;
    const hasSubjects = Array.isArray(cat.subjects);

    // Either/or, never both. A category that held subjects AND subcategories would put
    // two kinds of thing at one level, which is exactly how a tree stops being readable.
    if (hasSubs && hasSubjects && cat.subjects.length > 0) {
      errors.push(`${rel}: category "${cat.id}" declares both subjects and subcategories — a level holds one kind of child`);
      continue;
    }
    if (!hasSubs && !hasSubjects) {
      errors.push(`${rel}: category "${cat.id}" declares neither subjects nor subcategories`);
      continue;
    }

    const place = (slug, subcatId, dirParts) => {
      if (!SLUG_RE.test(String(slug ?? ''))) {
        errors.push(`${rel}: subject ${JSON.stringify(slug)} is not a kebab-case slug`);
        return;
      }
      if (subjects.has(slug)) {
        errors.push(`${rel}: subject "${slug}" is assigned twice — a subject has exactly one home`);
        return;
      }
      subjects.set(slug, {
        category: cat.id,
        subcategory: subcatId,
        // Under `flat`, the taxonomy is declared but not materialized: the bytes still sit
        // directly under the bundle. This is what lets the authority land before anything
        // moves, and lets each bundle flip independently.
        dir: tx.layout === 'nested' ? path.posix.join(...dirParts, slug) : slug,
      });
    };

    if (hasSubs) {
      if (cat.subcategories.length > MAX_CHILD_DIRS) {
        errors.push(`${rel}: category "${cat.id}" holds ${cat.subcategories.length} subcategories, over the cap of ${MAX_CHILD_DIRS}`);
      }
      const seenSub = new Set();
      for (const sub of cat.subcategories) {
        if (!SLUG_RE.test(String(sub.id ?? ''))) {
          errors.push(`${rel}: subcategory id ${JSON.stringify(sub.id)} in "${cat.id}" is not a kebab-case slug`);
          continue;
        }
        if (seenSub.has(sub.id)) errors.push(`${rel}: subcategory "${cat.id}/${sub.id}" declared twice`);
        seenSub.add(sub.id);
        if (typeof sub.title !== 'string' || !sub.title.trim()) {
          errors.push(`${rel}: subcategory "${cat.id}/${sub.id}" has no title`);
        }
        const list = Array.isArray(sub.subjects) ? sub.subjects : [];
        if (list.length === 0) {
          errors.push(`${rel}: subcategory "${cat.id}/${sub.id}" is empty — a folder that groups nothing is noise`);
        }
        if (list.length > MAX_CHILD_DIRS) {
          errors.push(`${rel}: subcategory "${cat.id}/${sub.id}" holds ${list.length} subjects, over the cap of ${MAX_CHILD_DIRS}`);
        }
        for (const slug of list) place(slug, sub.id, [cat.id, sub.id]);
      }
    } else {
      if (cat.subjects.length > MAX_CHILD_DIRS) {
        errors.push(
          `${rel}: category "${cat.id}" holds ${cat.subjects.length} subjects, over the cap of ${MAX_CHILD_DIRS} — ` +
            'it needs subcategories',
        );
      }
      for (const slug of cat.subjects) place(slug, null, [cat.id]);
    }
  }

  return { taxonomy: tx, errors, subjects };
}

/**
 * Where the subjects actually ARE, by walking the bundle.
 *
 * A subject folder is identified by containing `<slug>.md` - its golden path. Anything
 * else holding directories is a grouping folder and is descended into. That test is what
 * makes the walk work identically at any depth, so nothing here needs to know whether a
 * bundle has been migrated yet.
 *
 * Returns `{ found: Map<slug, relDir>, groupDirs: Map<relDir, childDirCount>, duplicates }`.
 */
export function walkSubjects(bundleDir) {
  const found = new Map();
  const groupDirs = new Map();
  const duplicates = [];

  const walk = (absDir, relDir) => {
    const children = fs
      .readdirSync(absDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'));
    groupDirs.set(relDir, children.length);

    for (const e of children) {
      const abs = path.join(absDir, e.name);
      const rel = relDir ? `${relDir}/${e.name}` : e.name;
      if (fs.existsSync(path.join(abs, `${e.name}.md`))) {
        if (found.has(e.name)) duplicates.push({ slug: e.name, at: [found.get(e.name), rel] });
        else found.set(e.name, rel);
      } else {
        walk(abs, rel);
      }
    }
  };

  walk(bundleDir, '');
  return { found, groupDirs, duplicates };
}
