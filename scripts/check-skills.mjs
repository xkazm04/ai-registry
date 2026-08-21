#!/usr/bin/env node
/**
 * check-skills — the gate for the `skills/` lane (docs/skills-lane.md).
 *
 * This lane went ungated longer than any other, and it is the one whose whole
 * design rests on a rule a human has to remember: **versions are the comparison
 * currency, hashes only detect drift.** A consumer asks "am I stale?" by
 * comparing its version to the registry's. If an author changes behaviour and
 * leaves the version alone, every consumer resolves `in_sync` while running
 * different instructions — the failure is silent on both sides, and the only
 * artifact that would reveal it (the content hash) is documented as a drift
 * detector, not an authority.
 *
 * So this gate has two modes, and the second is the one that matters.
 *
 * 1. **Shape** (default): frontmatter contract, kebab-case name that matches its
 *    directory, closed-set category, semver version, LESSONS heading format, and
 *    the ASCII-only rule the README states for this lane and nothing enforced.
 *
 * 2. **Version discipline** (`--since <ref>`): a skill whose content changed
 *    since <ref> must carry a different version, and that version may never go
 *    backwards. A checker cannot tell a typo from a behaviour change, so it asks
 *    for the cheapest honest signal — a patch bump — rather than guessing.
 *
 * NOT checked here, and deliberately: whether the body is any good, whether a
 * LESSONS entry was actually appended (append-only is a property of history, not
 * of a file), and whether a skill's sub-resources are complete — the lane does
 * not yet declare a shape for them (docs/skills-lane.md, "Not yet specified").
 *
 * THE INSTRUMENT IS ASSERTED BEFORE THE RESULT, the same doctrine check-bundles
 * runs on: a gate that walks zero files and exits 0 reports "clean" when it means
 * "blind". An empty lane, an unreadable lane, or a `--since` ref git cannot
 * resolve are FATAL (exit 2), never green.
 *
 * Zero dependencies on purpose: a registry that needs an install step before it
 * can be validated is a registry people validate less often.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LANE = path.join(ROOT, 'skills');

// The closed set from registry.yaml / .ascent/registry.yaml `policies.categories`.
// An unlisted value is normalized to `other` at index time, which means a typo
// silently becomes `other` in every consumer's catalog instead of failing here.
const CATEGORIES = new Set(['ci-cd', 'testing', 'security', 'ai-native', 'docs', 'workflow', 'other']);

const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/;
// `## <version> - <YYYY-MM-DD> - <project>`. The version slot accepts a range
// (`0.1-1.0`) because a lesson can cover the arc across several versions, which
// the existing corpus does.
const LESSON_HEAD_RE = /^## \S.* - \d{4}-\d{2}-\d{2} - \S/;

// Frontmatter keys the lane names. Unknown keys are NOT a failure: this registry
// guarantees `compatibility: additive` and requires readers to ignore what they
// do not recognize. They are surfaced as notes so a typo'd key is still visible.
const KNOWN_KEYS = new Set(['name', 'description', 'category', 'memory', 'version', 'tags']);
const REQUIRED_KEYS = ['name', 'description', 'category', 'memory', 'version'];

// Consumers bound the description they render (a catalog is a prompt, and a
// prompt has a budget). Not a failure — the registry does not own any one
// consumer's bound — but an author should know the tail may not survive.
const DESCRIPTION_SOFT_MAX = 500;

const failures = [];
const notes = [];
const fail = (msg) => failures.push(msg);

// ---------------------------------------------------------------- inputs
if (!fs.existsSync(LANE)) {
  console.error(`FATAL: no skills/ lane at ${LANE}`);
  console.error('This gate cannot run. Failing loudly rather than reporting a green tree.');
  process.exit(2);
}

let dirs;
try {
  dirs = fs.readdirSync(LANE, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
} catch (e) {
  console.error(`FATAL: skills/ exists but cannot be read (${e.message}).`);
  console.error('Reporting nothing is not the same as finding nothing — refusing to exit 0.');
  process.exit(2);
}

if (dirs.length === 0) {
  console.error('FATAL: skills/ holds zero skills. THE READER IS BROKEN, or the lane is empty —');
  console.error('either way this gate has checked nothing and will not claim success.');
  process.exit(2);
}

// Minimal YAML-subset frontmatter parser, the same one check-bundles uses:
// scalars, `- item` lists, inline [a, b], trailing ` # comment` stripped.
// Anything fancier in a frontmatter block is a contract violation anyway.
const parseFrontmatter = (raw) => {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  const fm = {};
  let currentKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && currentKey) {
      fm[currentKey].push(item[1].replace(/\s+#.*$/, '').trim());
      continue;
    }
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!kv) continue;
    const [, key, valRaw] = kv;
    const val = valRaw.replace(/\s+#.*$/, '').trim();
    if (val === '') { fm[key] = []; currentKey = key; }
    else if (val === '[]') { fm[key] = []; currentKey = null; }
    else if (val.startsWith('[')) {
      fm[key] = val.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean);
      currentKey = null;
    } else { fm[key] = val.replace(/^["']|["']$/g, ''); currentKey = null; }
  }
  return { fm, body: raw.slice(m[0].length) };
};

// The README states the rule for this lane: these files get copied into
// terminals, shell heredocs and `.claude/` directories, "where a stray Unicode
// dash is a debugging session nobody planned". Stated rules that nothing checks
// are the ones that rot, so it is checked.
const firstNonAscii = (raw) => {
  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    // eslint-disable-next-line no-control-regex
    const m = lines[i].match(/[^\x00-\x7F]/);
    if (m) return { line: i + 1, char: m[0], code: m[0].codePointAt(0).toString(16).toUpperCase() };
  }
  return null;
};

const parseSemver = (v) => {
  const m = SEMVER_RE.exec(String(v ?? ''));
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
};
const cmpSemver = (a, b) => (a[0] - b[0]) || (a[1] - b[1]) || (a[2] - b[2]);

// ---------------------------------------------------------------- shape
const seen = new Map(); // name -> { version, category }
let parsed = 0;
let lessonFiles = 0;
let lessonEntries = 0;

for (const dir of dirs) {
  const rel = `skills/${dir}`;
  const skillPath = path.join(LANE, dir, 'SKILL.md');

  if (!fs.existsSync(skillPath)) {
    fail(`${rel}: no SKILL.md — a skill directory without one is invisible to every consumer`);
    continue;
  }

  let raw;
  try {
    raw = fs.readFileSync(skillPath, 'utf8');
  } catch (e) {
    fail(`${rel}/SKILL.md: cannot be read (${e.message})`);
    continue;
  }

  const nonAscii = firstNonAscii(raw);
  if (nonAscii) {
    fail(
      `${rel}/SKILL.md:${nonAscii.line}: non-ASCII character ${JSON.stringify(nonAscii.char)} (U+${nonAscii.code}). ` +
        'This lane is ASCII-only — its files get copied into terminals and heredocs.',
    );
  }

  const doc = parseFrontmatter(raw);
  if (!doc) {
    fail(`${rel}/SKILL.md: no YAML frontmatter block — the file opens with something other than \`---\``);
    continue;
  }
  parsed += 1;
  const { fm } = doc;

  for (const key of REQUIRED_KEYS) {
    if (fm[key] === undefined || String(fm[key]).trim() === '') {
      fail(`${rel}/SKILL.md: frontmatter is missing required key \`${key}\``);
    }
  }
  for (const key of Object.keys(fm)) {
    if (!KNOWN_KEYS.has(key)) {
      notes.push(`${rel}/SKILL.md: unrecognized frontmatter key \`${key}\` — allowed (additive), but check it is not a typo`);
    }
  }

  if (fm.name !== undefined) {
    if (!NAME_RE.test(String(fm.name))) {
      fail(`${rel}/SKILL.md: name ${JSON.stringify(fm.name)} is not kebab-case (${NAME_RE})`);
    } else if (fm.name !== dir) {
      // The directory is how a consumer addresses the skill on disk; the field is
      // how it addresses it in a catalog. If they disagree, a copy and an index
      // disagree about what was adopted.
      fail(`${rel}/SKILL.md: name ${JSON.stringify(fm.name)} does not match its directory "${dir}"`);
    }
  }

  if (typeof fm.description === 'string' && fm.description.length > DESCRIPTION_SOFT_MAX) {
    notes.push(
      `${rel}/SKILL.md: description is ${fm.description.length} chars — consumers may truncate ` +
        `around ${DESCRIPTION_SOFT_MAX}; put the routing signal first`,
    );
  }

  if (fm.category !== undefined && !CATEGORIES.has(String(fm.category))) {
    fail(
      `${rel}/SKILL.md: category ${JSON.stringify(fm.category)} is outside the closed set ` +
        `[${[...CATEGORIES].join(', ')}] — an unlisted value is normalized to "other" at index time, ` +
        'so a typo would silently recategorize the skill rather than fail',
    );
  }

  if (fm.version !== undefined && !parseSemver(fm.version)) {
    fail(`${rel}/SKILL.md: version ${JSON.stringify(fm.version)} is not semver (MAJOR.MINOR.PATCH)`);
  }

  if (fm.name !== undefined && seen.has(fm.name)) {
    fail(`${rel}/SKILL.md: duplicate skill name ${JSON.stringify(fm.name)} — also declared by skills/${seen.get(fm.name).dir}`);
  } else if (fm.name !== undefined) {
    seen.set(fm.name, { dir, version: fm.version, category: fm.category });
  }

  // LESSONS.md is optional. When present, its headings are the join key between a
  // lesson and the version it was learned against — an unparseable heading loses
  // that link.
  const lessonsPath = path.join(LANE, dir, 'LESSONS.md');
  if (fs.existsSync(lessonsPath)) {
    lessonFiles += 1;
    const lraw = fs.readFileSync(lessonsPath, 'utf8');
    const lNonAscii = firstNonAscii(lraw);
    if (lNonAscii) {
      fail(
        `${rel}/LESSONS.md:${lNonAscii.line}: non-ASCII character ${JSON.stringify(lNonAscii.char)} ` +
          `(U+${lNonAscii.code}). This lane is ASCII-only.`,
      );
    }
    const heads = lraw.split(/\r?\n/).filter((l) => l.startsWith('## '));
    if (heads.length === 0) {
      fail(`${rel}/LESSONS.md: no \`## \` entries — an empty lessons file is worse than none, it implies nothing was learned`);
    }
    for (const h of heads) {
      lessonEntries += 1;
      if (!LESSON_HEAD_RE.test(h)) {
        fail(`${rel}/LESSONS.md: heading ${JSON.stringify(h.slice(0, 70))} is not \`## <version> - <YYYY-MM-DD> - <project>\``);
      }
    }
  }
}

if (parsed === 0) {
  console.error('FATAL: zero SKILL.md files parsed across the whole lane. THE PARSER IS BROKEN.');
  process.exit(2);
}

// ---------------------------------------------------------------- version discipline
const sinceIdx = process.argv.indexOf('--since');
let bumpChecked = 0;
if (sinceIdx !== -1) {
  const ref = process.argv[sinceIdx + 1];
  if (!ref) {
    console.error('FATAL: --since requires a git ref (e.g. --since origin/main).');
    process.exit(2);
  }

  const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

  try {
    git(['rev-parse', '--verify', `${ref}^{commit}`]);
  } catch (e) {
    console.error(`FATAL: --since ref "${ref}" does not resolve in this checkout (${String(e.message).trim()}).`);
    console.error('A shallow clone is the usual cause; CI needs fetch-depth: 0.');
    console.error('Refusing to report "no version problems" from a comparison that never ran.');
    process.exit(2);
  }

  let changed;
  try {
    // Three-dot: compare against the merge base, so unrelated commits that landed
    // on the base branch are not read as this change's work.
    changed = git(['diff', '--name-only', `${ref}...HEAD`, '--', 'skills/'])
      .split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  } catch (e) {
    console.error(`FATAL: git diff against "${ref}" failed (${String(e.message).trim()}).`);
    process.exit(2);
  }

  // A LESSONS.md append records a run at the CURRENT version; it is not a change
  // to the method and must not demand a bump. Everything else under the skill
  // directory is the method or the resources it loads.
  const touched = new Map();
  for (const file of changed) {
    const m = file.match(/^skills\/([^/]+)\/(.+)$/);
    if (!m) continue;
    if (m[2] === 'LESSONS.md') continue;
    if (!touched.has(m[1])) touched.set(m[1], []);
    touched.get(m[1]).push(m[2]);
  }

  for (const [name, files] of [...touched.entries()].sort()) {
    const current = seen.get(name);
    if (!current) continue; // deleted, or failed shape above and already reported.

    let oldRaw;
    try {
      oldRaw = git(['show', `${ref}:skills/${name}/SKILL.md`]);
    } catch {
      // Not present at the base ref: a new skill. Nothing to bump from.
      notes.push(`skills/${name}: new in this change — no prior version to compare`);
      continue;
    }

    bumpChecked += 1;
    const oldFm = parseFrontmatter(oldRaw)?.fm ?? {};
    const oldV = parseSemver(oldFm.version);
    const newV = parseSemver(current.version);

    if (!oldV || !newV) {
      // Shape check already reported an unparseable current version; an
      // unparseable OLD one is history we cannot fix from here.
      if (!oldV) notes.push(`skills/${name}: version at ${ref} (${JSON.stringify(oldFm.version)}) is not semver — bump not comparable`);
      continue;
    }

    if (cmpSemver(newV, oldV) === 0) {
      fail(
        `skills/${name}: content changed (${files.join(', ')}) but version stayed ${current.version}. ` +
          'Versions are the comparison currency — an unchanged version tells every consumer it is in sync ' +
          'while it runs different instructions. A non-behavioural fix takes a PATCH bump; the level is free.',
      );
    } else if (cmpSemver(newV, oldV) < 0) {
      fail(
        `skills/${name}: version went BACKWARDS, ${oldFm.version} -> ${current.version}. ` +
          'A consumer already at the higher version would resolve as ahead of the registry and never sync again.',
      );
    }
  }
}

// ---------------------------------------------------------------- report
const byCategory = new Map();
for (const { category } of seen.values()) byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
const catSummary = [...byCategory.entries()].sort().map(([c, n]) => `${c}:${n}`).join(' ');

console.log(`skills lane: ${dirs.length} skill(s) - ${catSummary}`);
console.log(`${lessonFiles} LESSONS.md file(s) - ${lessonEntries} entries`);
if (sinceIdx !== -1) {
  console.log(`version discipline: ${bumpChecked} changed skill(s) compared against ${process.argv[sinceIdx + 1]}`);
} else {
  console.log('version discipline: NOT run (pass --since <ref>; CI runs it on every pull request)');
}
console.log('NOT checked here: whether a lesson was appended (append-only is a property of history, not a file)');
for (const n of notes) console.log(`  note: ${n}`);

if (failures.length) {
  console.error(`\nskills lane FAILED - ${failures.length} problem(s):\n`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error('');
  process.exit(1);
}
console.log('skills lane OK');
