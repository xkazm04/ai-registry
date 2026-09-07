#!/usr/bin/env node
/**
 * check-recipes - the gate for the `recipes/` lane (docs/recipes-lane.md).
 *
 * A recipe is craftsman knowledge: one kind of work done well, connector- and
 * trigger-agnostic, versioned like a skill. The lane's design rests on the same
 * rule the skills lane rests on - **versions are the comparison currency, hashes
 * only detect drift** - plus one the skills lane does not need: a recipe carries
 * a machine object AND a rendered human view, and a rendered surface with no
 * coupling to its input silently stops being true.
 *
 * So this gate has two modes, mirroring check-skills.mjs.
 *
 * 1. **Shape** (default): the v3 object's required fields and closed
 *    vocabularies, 3..8 branch-free activities, identity agreement between the
 *    folder / `slug` / `RECIPE.md` frontmatter, the rendered view's five
 *    frontmatter keys equalling their `recipe.json` twins, LESSONS.md in the
 *    lane format, the `desktop`-is-not-a-connector rule, the no-em-dash house
 *    rule over every string in the object, and the nested-depth contract
 *    (`recipes/<domain>/<topic>/<slug>/`, at most ten child dirs per level).
 *
 * 2. **Version discipline** (`--since <ref>`): a recipe whose content changed
 *    since <ref> must carry a different version, and that version may never go
 *    backwards. Any file under the recipe directory except LESSONS.md counts as
 *    content - a lesson records a run against a version, it is not a change to
 *    the craft.
 *
 * NOT checked here, and deliberately: whether the craft is any good (that is the
 * CODEOWNERS review, and it is the point of `write_path: pull-request`), whether
 * a LESSONS entry was appended (append-only is a property of history, not of a
 * file), and whether a `connector_type` exists in the consuming application's
 * connector catalog - this registry cannot see that catalog, and a hard list
 * copied here would go stale the first time a connector is added there.
 *
 * THE INSTRUMENT IS ASSERTED BEFORE THE RESULT: the measurement functions are
 * driven against a hand-built fixture with known answers before a single real
 * file is read, and an empty lane, an unreadable lane or a `--since` ref git
 * cannot resolve are FATAL (exit 2), never green. Zero dependencies on purpose.
 *
 * Usage:
 *   node scripts/check-recipes.mjs
 *   node scripts/check-recipes.mjs --since origin/main
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter, parseSemver, cmpSemver, LESSON_HEAD_RE } from './lib/skills-lane.mjs';
import { EXIT } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LANE = path.join(ROOT, 'recipes');

const RECIPE_JSON = 'recipe.json';
const RECIPE_MD = 'RECIPE.md';
const LESSONS_MD = 'LESSONS.md';
const EXAMPLES_DIR = 'examples';

// ------------------------------------------------------------- the contract
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Domains and topics are the folder names; a domain is the v2 family vocabulary,
// which is snake_case, and a topic is kebab. Both are checked as "a lowercase
// identifier" rather than against a closed list: the family vocabulary lives with
// the corpus, and a gate that hard-codes it fails the day a family is added.
const DIR_RE = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

const STATUSES = new Set(['seed', 'maturing', 'proven']);
const ACTIVITY_KINDS = new Set(['observe', 'decide', 'act', 'deliver']);
const TRIGGER_KINDS = new Set(['event', 'time', 'self_paced']);

const ACTIVITIES_MIN = 3;
const ACTIVITIES_MAX = 8;

// docs/recipes-lane.md: ten is a browsing limit, the same one knowledge/ runs on.
const MAX_CHILD_DIRS = 10;

// `guidance` is 40 to 90 words of judgment. A NOTE, never a failure: failing prose
// on a word count is how a gate earns its deletion. The bound is still worth
// reporting, because guidance that has drifted to 300 words is a runbook again.
const USE_CASES_MIN = 3;
const USE_CASES_MAX = 6;
const USE_CASE_MIN_WORDS = 6;

const GUIDANCE_MIN_WORDS = 40;
const GUIDANCE_MAX_WORDS = 90;

// `desktop` is the one hard-failing connector type. It is not a connector: every
// agent has desktop access, so a `desktop` connector type is a binding to nothing
// and it survives adoption as a question nobody can answer.
const FORBIDDEN_CONNECTOR_TYPES = new Set(['desktop']);

// The consuming catalog's `categories` values as recorded on 2026-09-06 (49 of
// them, measured over scripts/connectors/builtin/*.json in the Personas repo).
// NOTE-only, and it must stay that way: this registry cannot see that catalog, so
// a value outside this set is "newer than this list", not "wrong".
const RECORDED_CONNECTOR_TYPES = new Set([
  'advertising', 'ai', 'analytics', 'automation', 'bi', 'browser_automation', 'cache',
  'calendar', 'ci_cd', 'cloud', 'containers', 'crm', 'database', 'design', 'desktop',
  'development', 'devops', 'documentation', 'ecommerce', 'email', 'finance', 'forms',
  'image_generation', 'integration', 'knowledge_base', 'marketing', 'messaging',
  'model_hosting', 'monitoring', 'notifications', 'observability', 'personalization',
  'productivity', 'project_management', 'research', 'scheduling', 'social',
  'source_control', 'spreadsheet', 'storage', 'support', 'ticketing', 'time_tracking',
  'transcription', 'vector_search', 'video_generation', 'vision', 'voice_generation',
  'web_scraping',
]);

// The five RECIPE.md frontmatter keys, each equal to its recipe.json twin.
const RENDERED_KEYS = [
  ['name', 'slug'],
  ['version', 'version'],
  ['status', 'status'],
  ['domain', 'domain'],
  ['path', 'path'],
];

// ------------------------------------------------------------- measurements
// Kept pure and tiny so the fixture below can pin every one of them.

/** Every string value anywhere in a JSON value, with a dotted path to it. */
export const walkStrings = (value, at = '$', out = []) => {
  if (typeof value === 'string') out.push({ at, value });
  else if (Array.isArray(value)) value.forEach((v, i) => walkStrings(v, `${at}[${i}]`, out));
  else if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) walkStrings(value[k], `${at}.${k}`, out);
  }
  return out;
};

// The house rule the corpus is written to: no em dashes. The en dash is included
// because it renders as the same long stroke and arrives from the same sources;
// both have an ASCII twin (` - `) that a reader's eye already substitutes.
const LONG_DASH_RE = /[–—]/;
/** The first em/en dash in a JSON value, or null. */
export const firstLongDash = (value) => {
  for (const s of walkStrings(value)) {
    const m = s.value.match(LONG_DASH_RE);
    if (m) return { at: s.at, char: m[0], code: m[0].codePointAt(0).toString(16).toUpperCase() };
  }
  return null;
};

const childDirs = (dir) => {
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name)
      .sort();
  } catch { return null; }
};

const words = (s) => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;

/**
 * `## ` headings in a LESSONS.md, EXCLUDING anything inside a fenced code block.
 *
 * The shared `lessonHeadings` in lib/skills-lane.mjs is a plain line filter, and it
 * cannot tell an entry from the format template a seeded file shows its future
 * contributors. That is not a hypothetical: this lane's own worked example carries
 * the template in a fence, and the plain filter reported it as a malformed entry.
 * The skills lane has never hit it because no LESSONS.md there fences an example.
 */
export const lessonHeadingsOutsideFences = (raw) => {
  const out = [];
  let inFence = false;
  for (const line of raw.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (!inFence && line.startsWith('## ')) out.push(line);
  }
  return out;
};

/**
 * Walk the lane to exactly `<domain>/<topic>/<slug>`, reporting anything at the
 * wrong depth rather than skipping it. A recipe one level too shallow or too deep
 * is invisible to the index, which is the failure mode a depth contract exists to
 * make loud.
 */
export const walkLane = (laneDir) => {
  const recipes = [];
  const depthProblems = [];
  const capProblems = [];

  const cap = (rel, dir) => {
    const kids = childDirs(dir);
    if (kids && kids.length > MAX_CHILD_DIRS) {
      capProblems.push(`${rel}: ${kids.length} child directories (cap ${MAX_CHILD_DIRS}) - ten is a browsing limit, subdivide`);
    }
    return kids ?? [];
  };

  for (const domain of cap('recipes/', laneDir)) {
    if (!DIR_RE.test(domain)) depthProblems.push(`recipes/${domain}/: domain folder is not a lowercase identifier`);
    const domainDir = path.join(laneDir, domain);
    for (const topic of cap(`recipes/${domain}/`, domainDir)) {
      if (!DIR_RE.test(topic)) depthProblems.push(`recipes/${domain}/${topic}/: topic folder is not a lowercase identifier`);
      const topicDir = path.join(domainDir, topic);
      for (const slug of cap(`recipes/${domain}/${topic}/`, topicDir)) {
        const dir = path.join(topicDir, slug);
        recipes.push({ domain, topic, slug, dir, rel: `recipes/${domain}/${topic}/${slug}` });
        // Below a recipe, only `examples/` may be a directory. A fourth level of
        // grouping would put a recipe at a depth the index does not address.
        for (const extra of childDirs(dir) ?? []) {
          if (extra !== EXAMPLES_DIR) {
            depthProblems.push(`recipes/${domain}/${topic}/${slug}/${extra}/: the only directory a recipe may hold is ${EXAMPLES_DIR}/ - depth is exactly recipes/<domain>/<topic>/<slug>/`);
          }
        }
      }
    }
  }

  // A recipe.json anywhere other than the declared depth is the loud case: it
  // exists, it looks like a recipe, and the index will never see it.
  const stray = [];
  const scan = (dir, rel, depth) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue;
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) { if (depth < 4) scan(path.join(dir, e.name), r, depth + 1); }
      else if (e.name === RECIPE_JSON && depth !== 3) stray.push(`recipes/${r}: a recipe.json at depth ${depth}, not recipes/<domain>/<topic>/<slug>/ - the index addresses exactly one depth, so this recipe would silently not exist`);
    }
  };
  scan(laneDir, '', 0);

  return { recipes, problems: [...depthProblems, ...stray], capProblems };
};

// ------------------------------------------------- assert the instrument
// Hand-built fixture with known answers. If any of these disagree, everything
// below is noise, and a green report from a broken counter is worse than none.
function assertInstrument() {
  const problems = [];
  const check = (label, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want)) {
      problems.push(`${label}: measured ${JSON.stringify(got)}, fixture says ${JSON.stringify(want)}`);
    }
  };

  const obj = {
    title: 'plain ascii',
    description: { need: 'a value with an — in it', input: 'fine' },
    activities: [{ id: 'a', label: 'fine' }],
  };
  check('strings walked', walkStrings(obj).length, 5);
  const dash = firstLongDash(obj);
  check('long dash found at', dash && dash.at, '$.description.need');
  check('long dash code', dash && dash.code, '2014');
  check('en dash found', firstLongDash({ a: 'x – y' })?.code, '2013');
  check('clean object has none', firstLongDash({ a: 'x - y', b: ['ok'] }), null);
  check('word count', words('  one two   three '), 3);
  check('slug shape accepts kebab', SLUG_RE.test('web-analytics-performance-review'), true);
  check('slug shape rejects snake', SLUG_RE.test('web_analytics'), false);
  check('dir shape accepts snake', DIR_RE.test('sales_marketing'), true);
  check('lesson heading shape', LESSON_HEAD_RE.test('## 0.1.0 - 2026-09-06 - personas'), true);
  // The planted positive that matters: a template inside a fence is NOT an entry.
  const lessonsFixture = [
    '# Lessons', '', 'Append-only, in this shape:', '',
    '```markdown', '## <version used> - <YYYY-MM-DD> - <project>', '```', '',
    '## 0.1.0 - 2026-09-06 - personas', '- a real entry',
  ].join('\n');
  check('fenced template is not an entry', lessonHeadingsOutsideFences(lessonsFixture), ['## 0.1.0 - 2026-09-06 - personas']);

  if (problems.length) {
    console.error('check-recipes: THE INSTRUMENT IS BROKEN - refusing to report.\n');
    for (const p of problems) console.error(`  - ${p}`);
    console.error('\nFix the measurement functions or the fixture. A green report from a');
    console.error('broken counter is worse than no report.');
    process.exit(EXIT.FATAL);
  }
}

// ---------------------------------------------------------------- inputs
assertInstrument();

if (!fs.existsSync(LANE)) {
  console.error(`FATAL: no recipes/ lane at ${LANE}`);
  console.error('This gate cannot run. Failing loudly rather than reporting a green tree.');
  process.exit(EXIT.FATAL);
}

let walked;
try {
  walked = walkLane(LANE);
} catch (e) {
  console.error(`FATAL: recipes/ exists but cannot be read (${e.message}).`);
  console.error('Reporting nothing is not the same as finding nothing - refusing to exit 0.');
  process.exit(EXIT.FATAL);
}
if (walked.recipes.length === 0) {
  console.error('FATAL: recipes/ holds zero recipes at recipes/<domain>/<topic>/<slug>/.');
  console.error('THE READER IS BROKEN, or the lane is empty - either way this gate has');
  console.error('checked nothing and will not claim success. The lane is declared ahead of');
  console.error('its corpus by design, but it carries one worked example so the gate has');
  console.error('something real to validate against (docs/recipes-lane.md).');
  process.exit(EXIT.FATAL);
}

// ---------------------------------------------------------------- shape
const failures = [];
const notes = [];
const fail = (msg) => failures.push(msg);

for (const p of walked.problems) fail(p);
for (const p of walked.capProblems) fail(p);

const seen = new Map(); // slug -> { rel, version, status, domain, topic }
let parsed = 0;
let lessonEntries = 0;

for (const r of walked.recipes) {
  const jsonPath = path.join(r.dir, RECIPE_JSON);
  if (!fs.existsSync(jsonPath)) {
    fail(`${r.rel}: no ${RECIPE_JSON} - a recipe directory without one is invisible to every consumer`);
    continue;
  }

  let raw;
  let obj;
  try { raw = fs.readFileSync(jsonPath, 'utf8'); } catch (e) { fail(`${r.rel}/${RECIPE_JSON}: cannot be read (${e.message})`); continue; }
  try { obj = JSON.parse(raw); } catch (e) { fail(`${r.rel}/${RECIPE_JSON}: does not parse as JSON (${e.message})`); continue; }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) { fail(`${r.rel}/${RECIPE_JSON}: is not a JSON object`); continue; }
  parsed += 1;

  const at = (msg) => fail(`${r.rel}/${RECIPE_JSON}: ${msg}`);
  const str = (k) => (typeof obj[k] === 'string' && obj[k].trim() ? obj[k].trim() : null);

  // --- identity
  for (const k of ['id', 'slug', 'title', 'version', 'status', 'path', 'domain', 'guidance']) {
    if (!str(k)) at(`missing or empty required string field \`${k}\``);
  }
  if (str('slug') && !SLUG_RE.test(obj.slug)) at(`slug ${JSON.stringify(obj.slug)} is not kebab-case (${SLUG_RE})`);
  if (str('slug') && obj.slug !== r.slug) {
    at(`slug ${JSON.stringify(obj.slug)} does not match its directory "${r.slug}" - a copy and an index would disagree about what was adopted`);
  }
  if (str('domain') && obj.domain !== r.domain) {
    at(`domain ${JSON.stringify(obj.domain)} does not match its top folder "${r.domain}"`);
  }
  if (str('path') && obj.path !== `${r.domain}/${r.topic}`) {
    at(`path ${JSON.stringify(obj.path)} is not "${r.domain}/${r.topic}" - the object's own location field must agree with where the bytes are`);
  }
  if (str('version') && !parseSemver(obj.version)) at(`version ${JSON.stringify(obj.version)} is not semver (MAJOR.MINOR.PATCH)`);
  if (str('status') && !STATUSES.has(obj.status)) {
    at(`status ${JSON.stringify(obj.status)} is outside the closed set [${[...STATUSES].join(', ')}]`);
  }
  if (str('slug')) {
    if (seen.has(obj.slug)) at(`duplicate slug ${JSON.stringify(obj.slug)} - also declared by ${seen.get(obj.slug).rel}`);
    else seen.set(obj.slug, { rel: r.rel, version: obj.version, status: obj.status, domain: r.domain, topic: r.topic, obj });
  }

  // --- description: four fields, always, in the same order every time
  const d = obj.description;
  if (!d || typeof d !== 'object' || Array.isArray(d)) at('`description` must be an object with need, input, core_action, output');
  else {
    for (const k of ['need', 'input', 'core_action', 'output']) {
      if (typeof d[k] !== 'string' || !d[k].trim()) at(`description.${k} is missing or empty - the four fields are the reader's contract and are always all four`);
    }
  }

  // --- activities: a shape, not a runbook
  const acts = obj.activities;
  if (!Array.isArray(acts)) at('`activities` must be an array');
  else {
    if (acts.length < ACTIVITIES_MIN || acts.length > ACTIVITIES_MAX) {
      at(`${acts.length} activities - the contract is ${ACTIVITIES_MIN} to ${ACTIVITIES_MAX}. Fewer is not a shape; more is a runbook`);
    }
    const ids = new Set();
    acts.forEach((a, i) => {
      if (!a || typeof a !== 'object' || Array.isArray(a)) { at(`activities[${i}] is not an object`); return; }
      if (typeof a.id !== 'string' || !SLUG_RE.test(a.id)) at(`activities[${i}].id ${JSON.stringify(a.id)} is missing or not kebab-case`);
      else if (ids.has(a.id)) at(`activities[${i}].id ${JSON.stringify(a.id)} is a duplicate - ids address a chip in the rendered sequence`);
      else ids.add(a.id);
      if (typeof a.label !== 'string' || !a.label.trim()) at(`activities[${i}].label is missing or empty`);
      if (!ACTIVITY_KINDS.has(a.kind)) at(`activities[${i}].kind ${JSON.stringify(a.kind)} is outside the closed set [${[...ACTIVITY_KINDS].join(', ')}]`);
      // The predecessor field was a node and edge graph. Any of these keys means
      // the runbook is growing back.
      for (const banned of ['edges', 'next', 'condition', 'branches', 'when']) {
        if (banned in a) at(`activities[${i}] carries \`${banned}\` - activities are linear and branch-free; a branch means it is a runbook and does not belong in a recipe`);
      }
    });
  }

  // --- outcomes: claims about the world, with how anyone could tell
  if (!Array.isArray(obj.outcomes) || obj.outcomes.length === 0) at('`outcomes` must be a non-empty array');
  else {
    obj.outcomes.forEach((o, i) => {
      if (!o || typeof o !== 'object' || Array.isArray(o)) { at(`outcomes[${i}] is not an object`); return; }
      if (typeof o.id !== 'string' || !o.id.trim()) at(`outcomes[${i}].id is missing`);
      if (typeof o.statement !== 'string' || !o.statement.trim()) at(`outcomes[${i}].statement is missing`);
      if (!Array.isArray(o.success_criteria) || o.success_criteria.length === 0) {
        at(`outcomes[${i}].success_criteria must be a non-empty array - an outcome with no way to tell is a wish`);
      }
    });
  }

  // --- connector TYPES, never connector ids
  if (!Array.isArray(obj.connector_types)) at('`connector_types` must be an array (it may be empty; a recipe that needs no connector is real)');
  else {
    obj.connector_types.forEach((c, i) => {
      if (typeof c !== 'string' || !c.trim()) { at(`connector_types[${i}] is not a non-empty string`); return; }
      if (FORBIDDEN_CONNECTOR_TYPES.has(c)) {
        at(`connector_types[${i}] is "${c}" - ${c} is not a connector and never appears; every agent has desktop access, so this binds to nothing`);
      } else if (!RECORDED_CONNECTOR_TYPES.has(c)) {
        notes.push(`${r.rel}/${RECIPE_JSON}: connector_types[${i}] "${c}" is not in the catalog categories recorded here on 2026-09-06 - allowed (the catalog lives with the consumer and this list cannot see it), but check it is not a connector id`);
      }
    });
  }

  // --- trigger: recommended, never bound
  const trig = obj.recommended_trigger;
  if (!trig || typeof trig !== 'object' || Array.isArray(trig)) at('`recommended_trigger` must be an object with kind and rationale');
  else {
    if (!TRIGGER_KINDS.has(trig.kind)) at(`recommended_trigger.kind ${JSON.stringify(trig.kind)} is outside the closed set [${[...TRIGGER_KINDS].join(', ')}]`);
    if (typeof trig.rationale !== 'string' || !trig.rationale.trim()) at('recommended_trigger.rationale is missing - a recommendation with no reason cannot be overridden knowingly');
    for (const banned of ['cron', 'interval', 'event_name', 'schedule', 'cadence']) {
      if (banned in trig) at(`recommended_trigger carries \`${banned}\` - a recipe recommends a KIND; the adopter assigns the actual trigger`);
    }
  }

  // --- use_cases: the adoption signal
  // Required, because a corpus of two hundred recipes is selected FROM, and
  // need/core_action describe the craft rather than the situation that should
  // reach for it. Three to six, each naming a concrete situation and why this
  // recipe earns its place there; a bare noun phrase ("marketing teams") is the
  // failure mode this length floor catches.
  if (!Array.isArray(obj.use_cases)) {
    at('missing required array `use_cases` - three to six situations where this recipe is worth adopting, each naming the situation and why this work pays there');
  } else {
    if (obj.use_cases.length < USE_CASES_MIN || obj.use_cases.length > USE_CASES_MAX) {
      at(`use_cases has ${obj.use_cases.length} entries (the contract asks ${USE_CASES_MIN}-${USE_CASES_MAX}) - fewer reads as a stub, more reads as a list of everyone`);
    }
    obj.use_cases.forEach((u, i) => {
      if (typeof u !== 'string' || !u.trim()) { at(`use_cases[${i}] is not a non-empty string`); return; }
      if (words(u) < USE_CASE_MIN_WORDS) {
        notes.push(`${r.rel}/${RECIPE_JSON}: use_cases[${i}] is ${words(u)} words - name the situation and why the work pays there, not an audience`);
      }
    });
  }

  // --- the remaining arrays
  for (const k of ['personalization_needs', 'dependencies', 'examples', 'lessons']) {
    if (k in obj && !Array.isArray(obj[k])) at(`\`${k}\` must be an array when present`);
  }
  if ('input_schema' in obj && !Array.isArray(obj.input_schema)) at('`input_schema` must be an array when present');

  // Concrete-solution knowledge lives in examples/ and only there. An example that
  // names a connector with no file beside it is a pointer to nothing.
  if (Array.isArray(obj.examples)) {
    obj.examples.forEach((ex, i) => {
      if (!ex || typeof ex !== 'object' || Array.isArray(ex)) { at(`examples[${i}] is not an object`); return; }
      if (typeof ex.connector !== 'string' || !ex.connector.trim()) at(`examples[${i}].connector is missing - an example is knowledge about ONE concrete connector`);
      else if (!fs.existsSync(path.join(r.dir, EXAMPLES_DIR, `${ex.connector}.md`))) {
        notes.push(`${r.rel}: examples[${i}] names connector "${ex.connector}" with no ${EXAMPLES_DIR}/${ex.connector}.md beside it`);
      }
    });
  }

  // --- guidance length: a note, on purpose
  if (str('guidance')) {
    const n = words(obj.guidance);
    if (n < GUIDANCE_MIN_WORDS || n > GUIDANCE_MAX_WORDS) {
      notes.push(`${r.rel}/${RECIPE_JSON}: guidance is ${n} words (the contract asks ${GUIDANCE_MIN_WORDS}-${GUIDANCE_MAX_WORDS}); short reads as a stub, long reads as the runbook coming back`);
    }
    if (/^\s*\d+[.)]\s/m.test(obj.guidance)) {
      notes.push(`${r.rel}/${RECIPE_JSON}: guidance contains numbered steps - guidance is judgment, the sequence is \`activities\``);
    }
  }

  // --- the house rule, over every string in the object
  const dash = firstLongDash(obj);
  if (dash) {
    at(`${dash.at} contains ${JSON.stringify(dash.char)} (U+${dash.code}) - the corpus is written without em or en dashes; rewrite the sentence rather than swapping the character`);
  }

  // --- the rendered view
  const mdPath = path.join(r.dir, RECIPE_MD);
  if (!fs.existsSync(mdPath)) {
    fail(`${r.rel}: no ${RECIPE_MD} - the JSON is a payload; a person browsing this lane reads the rendered view`);
  } else {
    const mdRaw = fs.readFileSync(mdPath, 'utf8');
    const doc = parseFrontmatter(mdRaw);
    if (!doc) fail(`${r.rel}/${RECIPE_MD}: no YAML frontmatter block - the file opens with something other than \`---\``);
    else {
      // eslint-disable-next-line no-control-regex
      const nonAscii = doc.raw.split(/\r?\n/).map((l, i) => ({ i, m: l.match(/[^\x00-\x7F]/) })).find((x) => x.m);
      if (nonAscii) {
        fail(`${r.rel}/${RECIPE_MD}:${nonAscii.i + 1}: non-ASCII ${JSON.stringify(nonAscii.m[0])} in FRONTMATTER - every consumer parses this block with a small hand-rolled parser; keep it ASCII`);
      }
      for (const [mdKey, jsonKey] of RENDERED_KEYS) {
        const want = obj[jsonKey];
        const got = doc.fm[mdKey];
        if (got === undefined) fail(`${r.rel}/${RECIPE_MD}: frontmatter is missing required key \`${mdKey}\``);
        else if (typeof want === 'string' && String(got) !== want) {
          fail(`${r.rel}/${RECIPE_MD}: frontmatter ${mdKey} is ${JSON.stringify(String(got))} but ${RECIPE_JSON} ${jsonKey} is ${JSON.stringify(want)} - the rendered view has drifted from its input, and a rendered surface with no coupling silently stops being true`);
        }
      }
    }
  }

  // --- lessons
  const lessonsPath = path.join(r.dir, LESSONS_MD);
  if (!fs.existsSync(lessonsPath)) {
    fail(`${r.rel}: no ${LESSONS_MD} - a recipe improves by use, and the file is where a run says what it taught. Seed it with the shape and no entries rather than omitting it`);
  } else {
    for (const h of lessonHeadingsOutsideFences(fs.readFileSync(lessonsPath, 'utf8'))) {
      lessonEntries += 1;
      if (!LESSON_HEAD_RE.test(h)) fail(`${r.rel}/${LESSONS_MD}: heading ${JSON.stringify(h.slice(0, 70))} is not \`## <version> - <YYYY-MM-DD> - <project>\``);
    }
  }
}

if (parsed === 0) {
  console.error(`FATAL: zero ${RECIPE_JSON} files parsed across the whole lane. THE PARSER IS BROKEN.`);
  process.exit(EXIT.FATAL);
}

// ---------------------------------------------------------------- version discipline
const sinceIdx = process.argv.indexOf('--since');
let bumpChecked = 0;
if (sinceIdx !== -1) {
  const ref = process.argv[sinceIdx + 1];
  if (!ref) { console.error('FATAL: --since requires a git ref (e.g. --since origin/main).'); process.exit(EXIT.FATAL); }
  const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  try { git(['rev-parse', '--verify', `${ref}^{commit}`]); } catch (e) {
    console.error(`FATAL: --since ref "${ref}" does not resolve in this checkout (${String(e.message).trim()}).`);
    console.error('A shallow clone is the usual cause; CI needs fetch-depth: 0.');
    console.error('Refusing to report "no version problems" from a comparison that never ran.');
    process.exit(EXIT.FATAL);
  }
  let changed;
  try {
    changed = git(['diff', '--name-only', `${ref}...HEAD`, '--', 'recipes/']).split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  } catch (e) {
    console.error(`FATAL: git diff against "${ref}" failed (${String(e.message).trim()}).`);
    process.exit(EXIT.FATAL);
  }
  // A LESSONS.md append records a run at the CURRENT version; it is not a change
  // to the craft. Everything else under the directory is the craft or the
  // connector knowledge it ships, and so must move the version.
  const touched = new Map();
  for (const file of changed) {
    const m = file.match(/^recipes\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/);
    if (!m || m[4] === LESSONS_MD) continue;
    const key = `${m[1]}/${m[2]}/${m[3]}`;
    if (!touched.has(key)) touched.set(key, { slug: m[3], files: [] });
    touched.get(key).files.push(m[4]);
  }
  for (const [key, { slug, files }] of [...touched.entries()].sort()) {
    const current = seen.get(slug);
    if (!current) continue; // deleted, or failed shape above and already reported.
    let oldRaw;
    try { oldRaw = git(['show', `${ref}:recipes/${key}/${RECIPE_JSON}`]); } catch {
      notes.push(`recipes/${key}: new in this change - no prior version to compare`);
      continue;
    }
    bumpChecked += 1;
    let oldV = null;
    try { oldV = parseSemver(JSON.parse(oldRaw).version); } catch { /* handled below */ }
    const newV = parseSemver(current.version);
    if (!oldV || !newV) {
      if (!oldV) notes.push(`recipes/${key}: version at ${ref} is not readable semver - bump not comparable`);
      continue;
    }
    if (cmpSemver(newV, oldV) === 0) {
      fail(`recipes/${key}: content changed (${files.join(', ')}) but version stayed ${current.version}. Versions are the comparison currency - an unchanged version tells every consumer it holds the current craft while it holds different knowledge. A non-behavioural fix takes a PATCH bump; the level is free.`);
    } else if (cmpSemver(newV, oldV) < 0) {
      fail(`recipes/${key}: version went BACKWARDS -> ${current.version}. A consumer already at the higher version would resolve as ahead of the registry and never sync again.`);
    }
  }
}

// ---------------------------------------------------------------- report
const byStatus = new Map();
const byDomain = new Map();
for (const v of seen.values()) {
  byStatus.set(v.status, (byStatus.get(v.status) ?? 0) + 1);
  byDomain.set(v.domain, (byDomain.get(v.domain) ?? 0) + 1);
}
const fmt = (m) => [...m.entries()].sort().map(([k, n]) => `${k}:${n}`).join(' ');

console.log(`recipes lane: ${walked.recipes.length} recipe(s) - ${fmt(byStatus)}`);
console.log(`domains: ${fmt(byDomain)} - ${lessonEntries} LESSONS entr(ies)`);
if (sinceIdx !== -1) console.log(`version discipline: ${bumpChecked} changed recipe(s) compared against ${process.argv[sinceIdx + 1]}`);
else console.log('version discipline: NOT run (pass --since <ref>; CI runs it on every pull request)');
console.log('NOT checked here: whether the craft is any good; whether a lesson was appended;');
console.log('  whether a connector_type exists in the consuming catalog (this registry cannot see it)');
for (const n of notes) console.log(`  note: ${n}`);
if (failures.length) {
  console.error(`\nrecipes lane FAILED - ${failures.length} problem(s):\n`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error('');
  process.exit(EXIT.VIOLATIONS);
}
console.log('recipes lane OK');
process.exit(EXIT.OK);
