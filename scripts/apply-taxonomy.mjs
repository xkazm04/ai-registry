#!/usr/bin/env node
/**
 * apply-taxonomy — the ONLY thing allowed to move a subject.
 *
 * `taxonomy.json` is the authority on where a subject lives; the folder tree is derived
 * from it. This is the deriving. It moves subject folders to their declared location and
 * rewrites every relative markdown link in the bundle to match.
 *
 * ## Why moving a subject by hand is forbidden
 *
 * Relative markdown links encode DEPTH. A golden path linking `../_laws.md` and a
 * technique linking `../../_laws.md` are the same link written from two depths, and this
 * bundle holds thousands of them. Move one subject one level down and every link into and
 * out of it is wrong - and the bundle gate will tell you so, loudly, several hundred
 * times. So the move and the rewrite are one operation, or the tree is broken between
 * them.
 *
 * ## How the rewrite works
 *
 * Not by pattern-matching paths, which is where this kind of script usually goes wrong.
 * Every file in the bundle gets an old->new absolute path; every relative link is RESOLVED
 * against its file's old directory, mapped through that table, and re-expressed relative
 * to its file's new directory. Link text is never parsed for meaning, so `../_laws.md`,
 * `../../other-subject/other-subject.md` and `./techniques/x.md` are all handled by the
 * same three lines, and a link that already resolves correctly stays correct.
 *
 * ## Reversible on purpose
 *
 * `--to flat` undoes `--to nested`. A migration you cannot reverse is a migration people
 * are afraid to run, and fear is how a tree stays broken.
 *
 * Usage:
 *   node scripts/apply-taxonomy.mjs <bundle> [--to nested|flat]   # dry run, prints everything
 *   node scripts/apply-taxonomy.mjs <bundle> --to nested --apply
 *   node scripts/apply-taxonomy.mjs --all --to nested             # every bundle, dry
 *
 * After --apply, run in this order (the catalog hash covers the index):
 *   node scripts/check-bundles.mjs && node scripts/build-index.mjs && node scripts/build-catalog.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { loadTaxonomy, walkSubjects, SLUG_RE } from './lib/taxonomy.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const KNOWLEDGE = path.join(ROOT, 'knowledge');

const argv = process.argv.slice(2);
const apply = argv.includes('--apply');
const all = argv.includes('--all');
const toIdx = argv.indexOf('--to');
const target = toIdx === -1 ? 'nested' : argv[toIdx + 1];
if (target !== 'nested' && target !== 'flat') {
  console.error(`apply-taxonomy FATAL: --to must be "nested" or "flat", got ${JSON.stringify(target)}`);
  process.exit(2);
}
const named = argv.filter((a) => !a.startsWith('--') && a !== target);

if (!fs.existsSync(KNOWLEDGE)) {
  console.error('apply-taxonomy FATAL: no knowledge/ lane.');
  process.exit(2);
}

const bundles = all
  ? fs.readdirSync(KNOWLEDGE, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : named;

if (bundles.length === 0) {
  console.error('apply-taxonomy FATAL: name a bundle, or pass --all.');
  process.exit(2);
}

const posix = (p) => p.split(path.sep).join('/');

/** Every file under a directory, absolute. */
const allFiles = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) allFiles(p, out);
    else out.push(p);
  }
  return out;
};

let totalMoves = 0;
let totalRewrites = 0;
let failed = false;

for (const bundle of bundles) {
  const base = path.join(KNOWLEDGE, bundle);
  if (!fs.existsSync(base)) {
    console.error(`apply-taxonomy FATAL: knowledge/${bundle} does not exist.`);
    process.exit(2);
  }

  const { taxonomy, errors, subjects: declared } = loadTaxonomy(base, bundle);
  if (errors.length) {
    console.error(`\n${bundle}: taxonomy is not usable —`);
    for (const e of errors) console.error(`  ${e}`);
    failed = true;
    continue;
  }

  const { found, duplicates } = walkSubjects(base);
  if (duplicates.length) {
    console.error(`\n${bundle}: two folders claim one slug — resolve before moving anything:`);
    for (const d of duplicates) console.error(`  ${d.slug}: ${d.at.join(' and ')}`);
    failed = true;
    continue;
  }

  // A grouping folder that shares a name with a subject would collide the moment the
  // subject moved into it. Checked BEFORE anything is touched, because discovering it
  // halfway through is discovering it with a half-moved tree.
  const groupIds = new Set();
  for (const c of taxonomy.categories) {
    groupIds.add(c.id);
    for (const s of c.subcategories ?? []) groupIds.add(s.id);
  }
  const collisions = [...found.keys()].filter((slug) => groupIds.has(slug));
  if (collisions.length) {
    console.error(`\n${bundle}: these slugs name both a subject and a grouping folder: ${collisions.join(', ')}`);
    console.error('  Rename one side in taxonomy.json first. Refusing to move into a collision.');
    failed = true;
    continue;
  }
  for (const id of groupIds) {
    if (!SLUG_RE.test(id)) {
      console.error(`\n${bundle}: grouping id "${id}" is not a kebab-case slug`);
      failed = true;
    }
  }
  if (failed) continue;

  // ---- where each subject goes
  const moves = []; // { slug, fromRel, toRel }
  for (const [slug, at] of found) {
    const want = declared.get(slug);
    if (!want) {
      console.error(`\n${bundle}: subject "${slug}" is on disk but absent from taxonomy.json. Refusing.`);
      failed = true;
      continue;
    }
    // `want.dir` already reflects taxonomy.layout, which is the CURRENT state. Compute the
    // destination for the REQUESTED layout instead.
    const toRel =
      target === 'flat'
        ? slug
        : want.subcategory
          ? `${want.category}/${want.subcategory}/${slug}`
          : `${want.category}/${slug}`;
    if (toRel !== at) moves.push({ slug, fromRel: at, toRel });
  }
  if (failed) continue;

  // ---- old -> new for EVERY file, which is what makes the link rewrite exact
  const fileMap = new Map(); // abs old -> abs new
  for (const abs of allFiles(base)) {
    const rel = posix(path.relative(base, abs));
    const top = rel.split('/')[0];
    // A subject's own files move with it; bundle-root files (index.md, _laws.md, log.md,
    // taxonomy.json, index.json) never move.
    const owner = [...found.entries()].find(([, at]) => rel === at || rel.startsWith(`${at}/`));
    if (!owner) {
      fileMap.set(abs, abs);
      continue;
    }
    const [slug, at] = owner;
    const mv = moves.find((m) => m.slug === slug);
    if (!mv) {
      fileMap.set(abs, abs);
      continue;
    }
    const tail = rel.slice(at.length); // includes the leading '/'
    fileMap.set(abs, path.join(base, mv.toRel + tail));
    void top;
  }

  // ---- the link rewrite, computed before anything moves
  const LINK_RE = /(\]\()([^)\s]+)(\))/g;
  const edits = []; // { absOld, absNew, next }
  let rewritten = 0;
  let unresolved = 0;

  for (const [absOld, absNew] of fileMap) {
    if (!absOld.endsWith('.md')) continue;
    const src = fs.readFileSync(absOld, 'utf8');
    let changed = false;

    const next = src.replace(LINK_RE, (whole, open, href, close) => {
      if (/^(https?:|mailto:|#)/.test(href)) return whole;
      const [linkPath, anchor] = href.split('#');
      if (!linkPath) return whole;

      const targetOld = path.resolve(path.dirname(absOld), linkPath);
      const targetNew = fileMap.get(targetOld);
      if (!targetNew) {
        // Either already broken (the bundle gate owns that finding) or points outside the
        // bundle. Left exactly as written - a mover that "fixes" links it does not
        // understand is a mover that corrupts prose.
        unresolved++;
        return whole;
      }
      let rel = posix(path.relative(path.dirname(absNew), targetNew));
      if (!rel.startsWith('.')) rel = `./${rel}`;
      const out = anchor === undefined ? rel : `${rel}#${anchor}`;
      if (out !== href) {
        changed = true;
        rewritten++;
      }
      return `${open}${out}${close}`;
    });

    if (changed) edits.push({ absOld, absNew, next });
  }

  // ---- report
  console.log(`\n${bundle} → ${target}`);
  console.log(`  ${moves.length} subject folder(s) move, ${edits.length} file(s) get ${rewritten} link rewrite(s)`);
  if (unresolved) console.log(`  ${unresolved} link(s) left alone (already broken, or outside the bundle)`);
  const show = moves.slice(0, apply ? 0 : 6);
  for (const m of show) console.log(`    ${m.fromRel}  ->  ${m.toRel}`);
  if (!apply && moves.length > show.length) console.log(`    … and ${moves.length - show.length} more`);

  totalMoves += moves.length;
  totalRewrites += rewritten;

  if (!apply) continue;

  // ---- do it
  //
  // Links are rewritten FIRST, at the old paths, then the folders move. Doing it the
  // other way round means computing every path twice, and it leaves a window where the
  // tree on disk matches neither the old links nor the new ones.
  for (const e of edits) fs.writeFileSync(e.absOld, e.next, 'utf8');

  const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  for (const m of moves) {
    const from = path.join(base, m.fromRel);
    const to = path.join(base, m.toRel);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    try {
      git('mv', posix(path.relative(ROOT, from)), posix(path.relative(ROOT, to)));
    } catch (err) {
      console.error(`  FAILED to move ${m.fromRel} -> ${m.toRel}: ${String(err.stderr || err.message).trim()}`);
      failed = true;
    }
  }

  // Prune grouping folders left empty by a --to flat pass.
  const prune = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const p = path.join(dir, e.name);
      prune(p);
      if (fs.readdirSync(p).length === 0) fs.rmdirSync(p);
    }
  };
  prune(base);

  // The declaration follows the tree, so the two can never disagree afterwards.
  taxonomy.layout = target;
  fs.writeFileSync(path.join(base, 'taxonomy.json'), `${JSON.stringify(taxonomy, null, 2)}\n`);
  console.log(`  applied; taxonomy.json layout = ${target}`);
}

console.log(
  `\n${apply ? 'applied' : 'dry run'}: ${totalMoves} move(s), ${totalRewrites} link rewrite(s) across ${bundles.length} bundle(s)`,
);
if (!apply) console.log('pass --apply to write. Nothing has been touched.');
else console.log('now run: check-bundles.mjs, then build-index.mjs, then build-catalog.mjs');

process.exit(failed ? 1 : 0);
