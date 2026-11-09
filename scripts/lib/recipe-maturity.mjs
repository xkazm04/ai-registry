/**
 * recipe-maturity - the ONE definition of the recipe status ladder (seed | maturing | proven).
 *
 * Why it exists: docs/recipes-lane.md declared the closed status vocabulary and check-recipes
 * enforced it, but nothing defined what earns `maturing` or `proven`, nothing computed it, and
 * nothing stopped a hand-edit to `proven`. On 2026-11-09 all 144 recipes were `seed`, so the
 * field carried no information, and the first hand promotion would have made it carry a claim
 * nobody could check. Status is now a claim backed by evidence committed in the recipe's own
 * directory, and this module is the only place that reads that evidence and names the rung it
 * supports. The gate (check-recipes.mjs) and the report (recipe-maturity.mjs) both call
 * `assessRecipe`, so they cannot disagree.
 *
 * Every threshold below is a CONVENTION (chosen, not measured); the rule and the census it was
 * fitted to are written down in docs/recipes-lane.md "Status: the maturity ladder".
 *
 * Pure apart from reading the recipe directory. It reads no clock and no git history: anyone
 * holding the directory can re-derive the result.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseSemver, cmpSemver } from './skills-lane.mjs';

export const RUNGS = Object.freeze(['seed', 'maturing', 'proven']);

/**
 * Conventions. Chosen, not measured - see docs/recipes-lane.md.
 *
 * REGISTRY_PROJECT: a LESSONS.md entry whose project slot names this registry records
 * maintenance of the lane (136 of 143 entries on 2026-11-09 are one format-migration note
 * dated 2026-09-09), not a run of the recipe in an adopting project. Lessons reach a recipe
 * from adoptions, by proposal (docs/recipes-lane.md "Dual improvement"); this repository
 * hosts recipes and adopts none.
 */
export const MATURITY_RULE = Object.freeze({
  REGISTRY_PROJECT: 'ai-registry',
  maturing: Object.freeze({ minUseLessons: 2 }),
  proven: Object.freeze({ minVersion: '1.0.0', minProjects: 2, minExampleFiles: 2 }),
});

export const rankOf = (status) => RUNGS.indexOf(status);

// `## <version used> - <YYYY-MM-DD> - <project>`, the lane format (shared with skills/).
const ENTRY_RE = /^## (\S+) [-–—] (\d{4}-\d{2}-\d{2}) [-–—] (.+?)\s*$/;

/**
 * The project a lesson came from. The slot sometimes carries a parenthetical run label
 * ("gravitone-gcloud (second full run, ...)"); the project is the text before it.
 */
export const projectOf = (slot) => String(slot).replace(/\s*\(.*$/, '').trim();

/**
 * Lesson entries in a LESSONS.md, outside fenced code blocks (a seeded file shows its
 * contributors the heading template inside a fence, and that is not an entry).
 */
export const parseLessonEntries = (raw) => {
  const out = [];
  let inFence = false;
  for (const line of String(raw).split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence || !line.startsWith('## ')) continue;
    const m = line.match(ENTRY_RE);
    if (m) out.push({ version: m[1], date: m[2], project: projectOf(m[3]), heading: line });
  }
  return out;
};

const listExampleFiles = (dir) => {
  try {
    return fs.readdirSync(path.join(dir, 'examples'), { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.md'))
      .map((e) => e.name)
      .sort();
  } catch { return []; }
};

/**
 * Collect the evidence for one recipe. `obj` is its parsed recipe.json; `lessonsRaw` is the
 * LESSONS.md text (or null); `exampleFiles` the `examples/*.md` basenames. Pure.
 */
export const evidenceOf = (obj, lessonsRaw, exampleFiles) => {
  const entries = lessonsRaw == null ? [] : parseLessonEntries(lessonsRaw);
  const useLessons = entries.filter((e) => e.project !== MATURITY_RULE.REGISTRY_PROJECT);
  const projects = [...new Set(useLessons.map((e) => e.project))].sort();
  const version = typeof obj?.version === 'string' ? obj.version : null;
  const v = version ? parseSemver(version) : null;
  // "Changed by use": the craft version (major.minor) has moved past the lowest version a
  // use lesson was recorded against. A patch bump is not a craft change (docs/recipes-lane.md
  // Versioning), so it cannot manufacture this - including the patch bump --apply makes.
  const usedAt = useLessons.map((e) => parseSemver(e.version)).filter(Boolean).sort(cmpSemver);
  const lowestUse = usedAt[0] ?? null;
  const craftMovedByUse = Boolean(v && lowestUse && (v[0] > lowestUse[0] || (v[0] === lowestUse[0] && v[1] > lowestUse[1])));
  const connectorTypes = Array.isArray(obj?.connector_types) ? obj.connector_types.length : 0;
  return {
    version,
    lessonEntries: entries.length,
    maintenanceLessons: entries.length - useLessons.length,
    useLessons: useLessons.length,
    useDates: [...new Set(useLessons.map((e) => e.date))].sort(),
    projects,
    lowestUseVersion: lowestUse ? lowestUse.join('.') : null,
    craftMovedByUse,
    exampleFiles: [...exampleFiles],
    connectorTypes,
  };
};

/** What each rung still lacks, given the evidence. An empty list means the rung is met. */
export const missingFor = (ev) => {
  const R = MATURITY_RULE;
  const maturing = [];
  if (ev.useLessons < R.maturing.minUseLessons) {
    maturing.push(`${R.maturing.minUseLessons} dated LESSONS.md entries from an adopting project (has ${ev.useLessons}${ev.maintenanceLessons ? `; ${ev.maintenanceLessons} ${R.REGISTRY_PROJECT} maintenance entr${ev.maintenanceLessons === 1 ? 'y does' : 'ies do'} not count` : ''})`);
  }
  if (!ev.craftMovedByUse) {
    maturing.push(ev.lowestUseVersion
      ? `a minor or major version above ${ev.lowestUseVersion}, the lowest version a use lesson was recorded against (is ${ev.version})`
      : 'a minor or major version above the version a use lesson was recorded against (no use lesson yet)');
  }
  const proven = [...maturing];
  const vMin = parseSemver(R.proven.minVersion);
  const v = ev.version ? parseSemver(ev.version) : null;
  if (!v || cmpSemver(v, vMin) < 0) proven.push(`version at or above ${R.proven.minVersion} (is ${ev.version})`);
  if (ev.projects.length < R.proven.minProjects) {
    proven.push(`use lessons from ${R.proven.minProjects} distinct projects (has ${ev.projects.length}${ev.projects.length ? `: ${ev.projects.join(', ')}` : ''})`);
  }
  // Examples are knowledge about ONE concrete connector; a recipe that declares no connector
  // type has nothing to map, so the example threshold does not apply to it.
  if (ev.connectorTypes > 0 && ev.exampleFiles.length < R.proven.minExampleFiles) {
    proven.push(`${R.proven.minExampleFiles} example files under examples/ (has ${ev.exampleFiles.length})`);
  }
  return { seed: [], maturing, proven };
};

/** The highest rung the evidence supports. */
export const supportedStatus = (ev) => {
  const miss = missingFor(ev);
  if (!miss.proven.length) return 'proven';
  if (!miss.maturing.length) return 'maturing';
  return 'seed';
};

/**
 * The verdict for one recipe: declared status, evidence, supported status, what the next rung
 * lacks, and - when the declared status is above the supported one - what the declared rung
 * lacks. `declaredAboveEvidence` is the gate's violation; a declared status BELOW the
 * evidence is fine (promotion is a human decision).
 */
export const assess = (obj, lessonsRaw, exampleFiles) => {
  const evidence = evidenceOf(obj, lessonsRaw, exampleFiles);
  const missing = missingFor(evidence);
  const supported = supportedStatus(evidence);
  const declared = typeof obj?.status === 'string' ? obj.status : null;
  const next = RUNGS[rankOf(supported) + 1] ?? null;
  const declaredRank = rankOf(declared);
  const declaredAboveEvidence = declaredRank > rankOf(supported);
  return {
    slug: obj?.slug ?? null,
    declared,
    supported,
    evidence,
    next,
    missingForNext: next ? missing[next] : [],
    declaredAboveEvidence,
    missingForDeclared: declaredAboveEvidence ? missing[declared] : [],
  };
};

/** `assess`, reading the evidence from a recipe directory on disk. */
export const assessRecipe = (dir, obj) => {
  let lessonsRaw = null;
  try { lessonsRaw = fs.readFileSync(path.join(dir, 'LESSONS.md'), 'utf8'); } catch { /* no file: no lessons */ }
  return assess(obj, lessonsRaw, listExampleFiles(dir));
};
