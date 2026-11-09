#!/usr/bin/env node
/**
 * recipe-maturity - report, and on request apply, the recipe status ladder.
 *
 * Why it exists: `status` (seed | maturing | proven) was a closed vocabulary with no rule
 * behind it - on 2026-11-09 every one of 144 recipes was `seed`, nothing said what would earn
 * more, and nothing stopped a hand-edit to `proven`. The rule now lives in
 * scripts/lib/recipe-maturity.mjs and reads only evidence committed in each recipe's own
 * directory (LESSONS.md entries, examples/ files, the version). check-recipes.mjs calls the
 * same function to fail a status declared ABOVE its evidence; this script shows every
 * recipe's evidence, the rung it supports, and what the next rung still lacks.
 *
 * Promotion is a human adoption decision, so the report never writes. `--apply` does, for the
 * named slugs only: it sets `status` to the supported rung, bumps the PATCH version (a status
 * change is content, and the lane's version discipline requires a bump; a patch bump cannot
 * itself satisfy the ladder, which reads major.minor), then runs the lane's own generators -
 * scripts/render-recipes.mjs and scripts/build-recipes-index.mjs - so the rendered views and
 * the index agree with the JSON before it exits. All or nothing: if any named slug is unknown
 * or its evidence supports no higher rung than it declares, nothing is written. It never
 * demotes.
 *
 * Usage:
 *   node scripts/recipe-maturity.mjs                 # summary + recipes whose evidence differs from their status
 *   node scripts/recipe-maturity.mjs --json          # every row, machine-readable
 *   node scripts/recipe-maturity.mjs --slug <slug>   # one recipe
 *   node scripts/recipe-maturity.mjs --apply <slug> [<slug> ...]
 *
 * Exit: 0 it ran (a report, or an apply that wrote); 1 --apply refused a slug the evidence
 * does not support (nothing written); 2 could not run (unknown flag, unknown slug, lane
 * unreadable, a generator failed). Reads no clock.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT, installCrashDoor } from './lib/exit-codes.mjs';
import { parseSemver } from './lib/skills-lane.mjs';
import { assessRecipe, rankOf, RUNGS, MATURITY_RULE } from './lib/recipe-maturity.mjs';

installCrashDoor();

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LANE = path.join(ROOT, 'recipes');
const USAGE = 'usage: node scripts/recipe-maturity.mjs [--json] [--slug <slug>] | --apply <slug> [<slug> ...]';

// ------------------------------------------------------------------ arguments
const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) { console.log(USAGE); process.exit(EXIT.OK); }
let json = false;
let slug = null;
let apply = null;
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--json') json = true;
  else if (a === '--slug') {
    if (!argv[i + 1] || argv[i + 1].startsWith('--')) { console.error(`FATAL: --slug requires a recipe slug.\n${USAGE}`); process.exit(EXIT.FATAL); }
    slug = argv[i += 1];
  } else if (a === '--apply') {
    apply = [];
    while (argv[i + 1] && !argv[i + 1].startsWith('--')) apply.push(argv[i += 1]);
    if (!apply.length) { console.error(`FATAL: --apply requires at least one recipe slug.\n${USAGE}`); process.exit(EXIT.FATAL); }
  } else { console.error(`FATAL: unknown argument ${JSON.stringify(a)}; nothing was read.\n${USAGE}`); process.exit(EXIT.FATAL); }
}
if (apply && (json || slug)) { console.error(`FATAL: --apply does not combine with --json or --slug.\n${USAGE}`); process.exit(EXIT.FATAL); }

// ------------------------------------------------------------------ read the lane
const dirsIn = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith('.')).map((e) => e.name).sort();

const rows = [];
try {
  if (!fs.existsSync(LANE)) throw new Error('no recipes/ lane');
  for (const domain of dirsIn(LANE)) {
    for (const topic of dirsIn(path.join(LANE, domain))) {
      for (const dirName of dirsIn(path.join(LANE, domain, topic))) {
        const dir = path.join(LANE, domain, topic, dirName);
        const file = path.join(dir, 'recipe.json');
        const raw = fs.readFileSync(file, 'utf8');
        const obj = JSON.parse(raw);
        rows.push({ rel: `recipes/${domain}/${topic}/${dirName}`, dir, file, raw, obj, ...assessRecipe(dir, obj), slug: obj.slug ?? dirName });
      }
    }
  }
  if (!rows.length) throw new Error('recipes/ holds zero recipes at recipes/<domain>/<topic>/<slug>/');
} catch (e) {
  console.error(`FATAL: the recipes lane cannot be read (${e.message}). Reporting nothing is not the same as finding nothing.`);
  process.exit(EXIT.FATAL);
}

const publicRow = (r) => ({
  slug: r.slug,
  path: r.rel,
  declared: r.declared,
  supported: r.supported,
  evidence: r.evidence,
  next: r.next,
  missing_for_next: r.missingForNext,
  declared_above_evidence: r.declaredAboveEvidence,
  missing_for_declared: r.missingForDeclared,
});

const describe = (r) => {
  const ev = r.evidence;
  const lines = [
    `${r.slug}  (${r.rel})`,
    `  declared ${r.declared}, evidence supports ${r.supported}${r.declaredAboveEvidence ? '  <- DECLARED ABOVE EVIDENCE' : ''}`,
    `  version ${ev.version}; use lessons ${ev.useLessons} (projects: ${ev.projects.join(', ') || 'none'}; dates: ${ev.useDates.join(', ') || 'none'}; lowest version used ${ev.lowestUseVersion ?? 'n/a'}); ${MATURITY_RULE.REGISTRY_PROJECT} maintenance entries ${ev.maintenanceLessons}`,
    `  craft version moved past first use: ${ev.craftMovedByUse ? 'yes' : 'no'}; example files ${ev.exampleFiles.length}${ev.exampleFiles.length ? ` (${ev.exampleFiles.join(', ')})` : ''}; connector types ${ev.connectorTypes}`,
  ];
  if (r.declaredAboveEvidence) for (const m of r.missingForDeclared) lines.push(`  missing for ${r.declared}: ${m}`);
  if (r.next) for (const m of r.missingForNext) lines.push(`  missing for ${r.next}: ${m}`);
  return lines.join('\n');
};

// ------------------------------------------------------------------ apply
if (apply) {
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const unknown = apply.filter((s) => !bySlug.has(s));
  if (unknown.length) { console.error(`FATAL: no recipe with slug ${unknown.map((s) => JSON.stringify(s)).join(', ')}. Nothing was written.`); process.exit(EXIT.FATAL); }
  const refused = [];
  const plan = [];
  for (const s of [...new Set(apply)]) {
    const r = bySlug.get(s);
    if (rankOf(r.supported) <= rankOf(r.declared)) {
      // Covers both "already at its rung" and "declared above evidence": never a demotion.
      refused.push(`${s}: declared ${r.declared}, evidence supports ${r.supported} - nothing to promote${r.next ? `; ${r.next} still needs: ${r.missingForNext.join('; ')}` : ''}`);
      continue;
    }
    const v = parseSemver(r.obj.version);
    if (!v) { refused.push(`${s}: version ${JSON.stringify(r.obj.version)} is not semver, cannot bump`); continue; }
    const nextVersion = `${v[0]}.${v[1]}.${v[2] + 1}`;
    // Targeted replacement keeps the file's own formatting; the parse below proves only the
    // two top-level fields changed.
    let edited = r.raw.replace(/("status"\s*:\s*)"[^"]*"/, `$1"${r.supported}"`).replace(/("version"\s*:\s*)"[^"]*"/, `$1"${nextVersion}"`);
    const check = JSON.parse(edited);
    const expect = { ...r.obj, status: r.supported, version: nextVersion };
    if (JSON.stringify(check) !== JSON.stringify(expect)) {
      edited = `${JSON.stringify(expect, null, 2)}\n`;
    }
    plan.push({ r, nextVersion, edited });
  }
  if (refused.length) {
    console.error(`recipe-maturity --apply REFUSED - nothing was written:`);
    for (const x of refused) console.error(`  - ${x}`);
    process.exit(EXIT.VIOLATIONS);
  }
  for (const { r, nextVersion, edited } of plan) {
    fs.writeFileSync(r.file, edited);
    console.log(`promoted ${r.slug}: ${r.declared} -> ${r.supported}, version ${r.obj.version} -> ${nextVersion}`);
  }
  for (const gen of ['render-recipes.mjs', 'build-recipes-index.mjs']) {
    const g = spawnSync(process.execPath, [path.join('scripts', gen)], { cwd: ROOT, encoding: 'utf8' });
    if (g.status !== 0) {
      console.error(`FATAL: ${gen} exited ${g.status ?? g.signal} after the status change was written; the views or the index are stale. Run node scripts/gate.mjs --lane recipes --write.`);
      if (g.stderr) console.error(g.stderr.trim());
      process.exit(EXIT.FATAL);
    }
    console.log(`  ${g.stdout.trim().split(/\r?\n/).join(' | ')}`);
  }
  console.log('Add a LESSONS.md note only if a run taught something; the promotion itself is recorded by the version bump.');
  process.exit(EXIT.OK);
}

// ------------------------------------------------------------------ report
if (slug) {
  const r = rows.find((x) => x.slug === slug);
  if (!r) { console.error(`FATAL: no recipe with slug ${JSON.stringify(slug)}.`); process.exit(EXIT.FATAL); }
  if (json) console.log(JSON.stringify(publicRow(r), null, 2));
  else console.log(describe(r));
  process.exit(EXIT.OK);
}

if (json) {
  console.log(JSON.stringify({ rule: MATURITY_RULE, recipes: rows.map(publicRow) }, null, 2));
  process.exit(EXIT.OK);
}

const tally = (key) => Object.fromEntries(RUNGS.map((s) => [s, rows.filter((r) => r[key] === s).length]));
const fmt = (o) => Object.entries(o).map(([k, n]) => `${k}:${n}`).join(' ');
const ev = rows.map((r) => r.evidence);
console.log(`recipe maturity: ${rows.length} recipe(s)`);
console.log(`  declared:  ${fmt(tally('declared'))}`);
console.log(`  supported: ${fmt(tally('supported'))}`);
console.log(`  evidence: ${ev.filter((e) => e.useLessons > 0).length} with a use lesson, ${ev.filter((e) => e.useLessons >= 2).length} with two or more, ${ev.filter((e) => e.projects.length >= 2).length} from two or more projects; ${ev.filter((e) => e.craftMovedByUse).length} changed by use; ${ev.filter((e) => e.exampleFiles.length > 0).length} with example files`);
const differ = rows.filter((r) => r.declared !== r.supported);
if (!differ.length) console.log('every declared status equals the status its evidence supports');
else {
  console.log(`\n${differ.length} recipe(s) whose evidence supports a different status than declared:\n`);
  for (const r of differ) console.log(`${describe(r)}\n`);
}
const above = rows.filter((r) => r.declaredAboveEvidence).length;
if (above) console.log(`${above} declared ABOVE evidence - check-recipes.mjs fails these.`);
console.log('Promotion is a human decision: node scripts/recipe-maturity.mjs --apply <slug>');
process.exit(EXIT.OK);
