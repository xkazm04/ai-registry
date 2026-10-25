#!/usr/bin/env node
/**
 * merge-generated - the git merge driver for this registry's generated files.
 *
 * Why it exists. Generated views ride on almost every commit, and more than one machine
 * pushes to one main. In the 30 days before this script, catalog.json was touched by 806
 * commits, knowledge/software-engineering/index.json by 203, rules/ai-registry-software-
 * engineering.md by 127, over 231 merge commits and 135 "regenerate" commits. A textual
 * three-way merge of a generated file is meaningless: both sides are views of their own
 * sources, and no interleaving of their lines is a view of the merged sources. Agents
 * hand-resolved those conflicts, then re-ran the generators anyway. The only correct
 * merge of a generated file is to regenerate it from the merged sources, AFTER the merge
 * commit exists (index.json dates `changedAt` from git history; built before the merge
 * commit, it stamps today on everything).
 *
 * So this driver does not merge. It keeps the current side (%A, untouched), records the
 * path in `<git-dir>/registry-regen-pending`, and exits 0, so the merge completes. The
 * post-merge / post-rewrite / post-commit hooks that install-merge-driver.mjs installs
 * see that file and run regen-generated.mjs, which rebuilds from the merged sources and
 * commits only the generated paths.
 *
 * One exception to "untouched": catalog.json carries a few fields the registry CANNOT
 * compute and build-catalog.mjs copies forward from the committed file (per skill:
 * `adopters`, `applicability`, `_drift`; plus top-level keys it does not own). Keeping
 * %A whole would silently drop the other side's edits to those, and the regeneration
 * would then carry the loss forward. They are folded three-way here: a field only the
 * other side changed is taken from it. A field both sides changed differently keeps
 * ours, with one line on stderr.
 *
 * Contract with git: no bytes on stdout, ever. Exit 0 whenever the pending record was
 * written. If it could NOT be written the driver exits 1, which git reports as an
 * ordinary conflict - today's behaviour, and louder than a silently stale view.
 *
 * Installed by scripts/install-merge-driver.mjs as
 *   merge.registry-generated.driver = node scripts/merge-generated.mjs %O %A %B %P
 * See docs/merge-driver.md.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';

export const PENDING_NAME = 'registry-regen-pending';

/** Top-level catalog keys build-catalog.mjs writes itself; every other key is carried. */
export const CATALOG_OWNED = Object.freeze([
  '_note', 'generatedBy', 'skills', 'practices', 'memory', 'counts', 'bundles', 'usageEvidence',
]);
/** Per-skill catalog fields build-catalog.mjs reads back from the committed file (`old.<k>`). */
export const CATALOG_SKILL_CARRIED = Object.freeze(['adopters', 'applicability', '_drift']);

const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);

/**
 * Fold the carried-forward catalog fields three-way into `ours`. Pure: returns
 * { doc, changed, clashes } and never throws on shape surprises (it skips them).
 */
export function foldCatalog(base, ours, theirs) {
  const doc = structuredClone(ours);
  const clashes = [];
  let changed = false;
  const take = (label, o, a, b, set) => {
    if (same(a, b) || same(b, o)) return;            // nothing new on their side
    if (same(a, o)) { set(b); changed = true; return; } // only they changed it
    clashes.push(label);                               // both changed it differently
  };

  for (const k of new Set([...Object.keys(base ?? {}), ...Object.keys(theirs ?? {})])) {
    if (CATALOG_OWNED.includes(k)) continue;
    take(k, base?.[k], doc[k], theirs?.[k], (v) => { if (v === undefined) delete doc[k]; else doc[k] = v; });
  }

  const byName = (arr) => new Map((Array.isArray(arr) ? arr : []).filter((s) => s && s.name).map((s) => [s.name, s]));
  const o = byName(base?.skills), b = byName(theirs?.skills);
  if (!Array.isArray(doc.skills)) doc.skills = [];
  const a = byName(doc.skills);
  for (const [name, theirSkill] of b) {
    const ourSkill = a.get(name);
    if (!ourSkill) {
      // A skill only their side has: build-catalog drops or keeps it by the merged lane,
      // and keeping its row lets the rebuild carry its fields forward.
      if (!o.has(name)) { doc.skills.push(theirSkill); changed = true; }
      continue;
    }
    for (const k of CATALOG_SKILL_CARRIED) {
      take(`skills[${name}].${k}`, o.get(name)?.[k], ourSkill[k], theirSkill[k], (v) => {
        if (v === undefined) delete ourSkill[k]; else ourSkill[k] = v;
      });
    }
  }
  return { doc, changed, clashes };
}

function gitDir(cwd) {
  const r = spawnSync('git', ['rev-parse', '--absolute-git-dir'], { cwd, encoding: 'utf8' });
  if (r.status !== 0 || !r.stdout.trim()) throw new Error(`git rev-parse failed: ${(r.stderr || '').trim()}`);
  return r.stdout.trim();
}

function main(argv) {
  if (argv.length < 4) {
    console.error('usage: node scripts/merge-generated.mjs <base %O> <ours %A> <theirs %B> <path %P>');
    console.error('A git merge driver; installed by scripts/install-merge-driver.mjs, not run by hand.');
    return EXIT.FATAL;
  }
  const [baseFile, oursFile, theirsFile, rel] = argv;

  // The fold is a refinement, never a precondition: any failure leaves %A as it was.
  if (rel.replace(/\\/g, '/') === 'catalog.json') {
    try {
      const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
      const { doc, changed, clashes } = foldCatalog(read(baseFile), read(oursFile), read(theirsFile));
      if (changed) fs.writeFileSync(oursFile, `${JSON.stringify(doc, null, 2)}\n`);
      if (clashes.length) {
        console.error(`merge-generated: catalog.json kept OUR value for ${clashes.length} carried field(s) both sides changed: ${clashes.slice(0, 5).join(', ')}${clashes.length > 5 ? ', ...' : ''}`);
      }
    } catch (err) {
      console.error(`merge-generated: catalog.json carried-field fold skipped (${err.message}); kept ours whole.`);
    }
  }

  try {
    const file = path.join(gitDir(process.cwd()), PENDING_NAME);
    fs.appendFileSync(file, `${rel}\n`);
  } catch (err) {
    console.error(`merge-generated: could not record ${rel} for regeneration (${err.message}).`);
    console.error('merge-generated: reporting a conflict instead, so the stale view cannot pass silently.');
    return EXIT.VIOLATIONS;
  }
  return EXIT.OK;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  process.exitCode = main(process.argv.slice(2));
}
