#!/usr/bin/env node
/**
 * check-skills — the gate for the `skills/` lane (docs/skills-lane.md).
 *
 * The lane's whole design rests on a rule a human has to remember: **versions are
 * the comparison currency, hashes only detect drift.** A consumer asks "am I
 * stale?" by comparing its version to the registry's. If an author changes
 * behaviour and leaves the version alone, every consumer resolves `in_sync` while
 * running different instructions — the failure is silent on both sides.
 *
 * So this gate has two modes, and the second is the one that matters.
 *
 * 1. **Shape** (default): frontmatter contract, kebab-case name that matches its
 *    directory, closed-set category, semver version, description within the
 *    harness's routing budget, LESSONS heading format, the sub-resource rules
 *    (what a skill directory may and may not publish), and the ASCII rule where it
 *    still applies (frontmatter and fenced code — prose is UTF-8 since v2 of the
 *    lane; see docs/skills-lane.md, "ASCII where it bites").
 *
 * 2. **Version discipline** (`--since <ref>`): a skill whose content changed
 *    since <ref> must carry a different version, and that version may never go
 *    backwards. A checker cannot tell a typo from a behaviour change, so it asks
 *    for the cheapest honest signal — a patch bump — rather than guessing. Any
 *    file under the skill directory except LESSONS.md counts as content: the
 *    references and scripts a skill ships are part of the method.
 *
 * NOT checked here, and deliberately: whether the body is any good, whether a
 * LESSONS entry was actually appended (append-only is a property of history, not
 * of a file), and whether a consumer's copy or the personal tier shadows a lane
 * skill — that is `scripts/fleet-audit.mjs`, which runs where the installations
 * are, because the registry cannot see them.
 *
 * THE INSTRUMENT IS ASSERTED BEFORE THE RESULT: an empty lane, an unreadable
 * lane, or a `--since` ref git cannot resolve are FATAL (exit 2), never green.
 * Zero dependencies on purpose.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  readLane, parseFrontmatter, parseSemver, cmpSemver, lessonHeadings,
  LESSON_HEAD_RE, subResourceFindings, SKILL_FILE,
} from './lib/skills-lane.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LANE = path.join(ROOT, 'skills');

// The closed set from registry.yaml / .ascent/registry.yaml `policies.categories`.
// An unlisted value is normalized to `other` at index time, which means a typo
// silently becomes `other` in every consumer's catalog instead of failing here.
const CATEGORIES = new Set(['ci-cd', 'testing', 'security', 'ai-native', 'docs', 'workflow', 'other']);
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Frontmatter keys the lane names, plus the keys the reference harness (Claude Code)
// reads from a SKILL.md. Unknown keys are NOT a failure: this registry guarantees
// `compatibility: additive`. They are surfaced as notes so a typo'd key is visible.
const LANE_KEYS = ['name', 'description', 'category', 'memory', 'version', 'tags'];
const HARNESS_KEYS = [
  'argument-hint', 'arguments', 'allowed-tools', 'disallowed-tools', 'disable-model-invocation',
  'user-invocable', 'paths', 'context', 'agent', 'model', 'effort', 'background', 'hooks', 'shell',
  'when_to_use', 'metadata', 'license', 'compatibility',
];
// Keys the Personas installation writes and reads; harmless to every other consumer.
const INSTALLATION_KEYS = ['contexts'];
const KNOWN_KEYS = new Set([...LANE_KEYS, ...HARNESS_KEYS, ...INSTALLATION_KEYS]);
const REQUIRED_KEYS = ['name', 'description', 'category', 'memory', 'version'];

// The harness routes on `description` (+ `when_to_use`) and truncates the pair at
// 1,536 characters — silently, which is why the cap is a FAILURE here and not a note:
// a truncated routing signal is a skill that stops being reached for without anyone
// noticing. The soft bound below is where an author should start worrying.
const DESCRIPTION_HARD_MAX = 1536;
const DESCRIPTION_SOFT_MAX = 1200;
// The harness's own guidance: keep SKILL.md under 500 lines, move detail to references.
// A note, not a failure — a long method is a smell, not a contract breach.
const BODY_SOFT_MAX_LINES = 500;

const failures = [];
const notes = [];
const fail = (msg) => failures.push(msg);

// ---------------------------------------------------------------- inputs
if (!fs.existsSync(LANE)) {
  console.error(`FATAL: no skills/ lane at ${LANE}`);
  console.error('This gate cannot run. Failing loudly rather than reporting a green tree.');
  process.exit(2);
}
let skills;
try {
  skills = readLane(LANE);
} catch (e) {
  console.error(`FATAL: skills/ exists but cannot be read (${e.message}).`);
  console.error('Reporting nothing is not the same as finding nothing — refusing to exit 0.');
  process.exit(2);
}
if (skills.length === 0) {
  console.error('FATAL: skills/ holds zero skills. THE READER IS BROKEN, or the lane is empty —');
  console.error('either way this gate has checked nothing and will not claim success.');
  process.exit(2);
}

// ASCII where it bites: frontmatter (parsed by small hand-rolled parsers in every
// consumer) and fenced code (copied into terminals and heredocs). Prose is UTF-8.
const firstNonAsciiIn = (text, lineOffset = 0) => {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    // eslint-disable-next-line no-control-regex
    const m = lines[i].match(/[^\x00-\x7F]/);
    if (m) return { line: lineOffset + i + 1, char: m[0], code: m[0].codePointAt(0).toString(16).toUpperCase() };
  }
  return null;
};
// Dashes U+2010..2015, quotes U+2018..201F, the no-break space, the ellipsis, the
// multiplication sign and the comparison operators: every one of them has an ASCII
// twin a reader's eye substitutes and a shell does not.
const LOOKALIKE_RE = /[‐-―‘-‟ …×≤≥≠]/;
const firstLookalikeIn = (text, lineOffset = 0) => {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(LOOKALIKE_RE);
    if (m) return { line: lineOffset + i + 1, char: m[0], code: m[0].codePointAt(0).toString(16).toUpperCase() };
  }
  return null;
};
const fencedBlocks = (body, bodyStartLine) => {
  const out = [];
  const lines = body.split(/\r?\n/);
  let open = null;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^\s*(```|~~~)/.test(lines[i])) {
      if (open === null) open = i;
      else { out.push({ text: lines.slice(open + 1, i).join('\n'), line: bodyStartLine + open + 1 }); open = null; }
    }
  }
  return out;
};

// ---------------------------------------------------------------- shape
const seen = new Map(); // name -> { dir, version, category }
let parsed = 0;
let lessonFiles = 0;
let lessonEntries = 0;

for (const s of skills) {
  const rel = s.rel;
  if (!s.exists) {
    fail(`${rel}: no SKILL.md — a skill directory without one is invisible to every consumer`);
    // A lowercase skill.md is the usual cause, and it only "works" on a case-insensitive disk.
    if (fs.existsSync(path.join(s.dir, 'skill.md'))) fail(`${rel}/skill.md: the method file must be named exactly SKILL.md`);
    continue;
  }
  if (s.raw === null) { fail(`${rel}/SKILL.md: cannot be read`); continue; }

  const doc = parseFrontmatter(s.raw);
  if (!doc) {
    fail(`${rel}/SKILL.md: no YAML frontmatter block — the file opens with something other than \`---\``);
    continue;
  }
  parsed += 1;
  const { fm } = doc;
  const fmLines = doc.raw.split(/\r?\n/).length;

  const fmNonAscii = firstNonAsciiIn(doc.raw, 0);
  if (fmNonAscii) {
    fail(`${rel}/SKILL.md:${fmNonAscii.line}: non-ASCII ${JSON.stringify(fmNonAscii.char)} (U+${fmNonAscii.code}) in FRONTMATTER — every consumer parses this block with a small hand-rolled parser; keep it ASCII`);
  }
  // Inside fenced code the hazard is not "non-ASCII" — a Czech string in a heredoc or
  // a box-drawing diagram is fine — it is LOOKALIKE punctuation: a dash, quote, space
  // or operator that reads as ASCII and is not. Those break a pasted command silently.
  for (const block of fencedBlocks(doc.body, fmLines)) {
    const la = firstLookalikeIn(block.text, block.line);
    if (la) {
      fail(`${rel}/SKILL.md:${la.line}: ${JSON.stringify(la.char)} (U+${la.code}) inside a fenced code block looks like ASCII punctuation and is not — a pasted command breaks silently; write \`-\`, \`"\`, \`->\`, \`<=\``);
      break;
    }
  }

  for (const key of REQUIRED_KEYS) {
    if (fm[key] === undefined || String(fm[key]).trim() === '') fail(`${rel}/SKILL.md: frontmatter is missing required key \`${key}\``);
  }
  for (const key of Object.keys(fm)) {
    if (!KNOWN_KEYS.has(key)) notes.push(`${rel}/SKILL.md: unrecognized frontmatter key \`${key}\` — allowed (additive), but check it is not a typo`);
  }

  if (fm.name !== undefined) {
    if (!NAME_RE.test(String(fm.name))) fail(`${rel}/SKILL.md: name ${JSON.stringify(fm.name)} is not kebab-case (${NAME_RE})`);
    else if (fm.name !== s.name) fail(`${rel}/SKILL.md: name ${JSON.stringify(fm.name)} does not match its directory "${s.name}" — a copy and an index would disagree about what was adopted`);
  }

  if (typeof fm.description === 'string') {
    const routing = fm.description.length + (typeof fm.when_to_use === 'string' ? fm.when_to_use.length : 0);
    if (routing > DESCRIPTION_HARD_MAX) {
      fail(`${rel}/SKILL.md: description (+when_to_use) is ${routing} chars — the harness truncates the routing signal at ${DESCRIPTION_HARD_MAX}; past that the skill silently stops being reached for`);
    } else if (routing > DESCRIPTION_SOFT_MAX) {
      notes.push(`${rel}/SKILL.md: description is ${routing} chars — close to the ${DESCRIPTION_HARD_MAX} routing cap; put the trigger first`);
    }
  }

  if (fm.category !== undefined && !CATEGORIES.has(String(fm.category))) {
    fail(`${rel}/SKILL.md: category ${JSON.stringify(fm.category)} is outside the closed set [${[...CATEGORIES].join(', ')}] — an unlisted value is normalized to "other" at index time, so a typo would silently recategorize the skill rather than fail`);
  }
  if (fm.version !== undefined && !parseSemver(fm.version)) {
    fail(`${rel}/SKILL.md: version ${JSON.stringify(fm.version)} is not semver (MAJOR.MINOR.PATCH)`);
  }
  if (fm.name !== undefined && seen.has(fm.name)) fail(`${rel}/SKILL.md: duplicate skill name ${JSON.stringify(fm.name)} — also declared by skills/${seen.get(fm.name).dir}`);
  else if (fm.name !== undefined) seen.set(fm.name, { dir: s.name, version: fm.version, category: fm.category });

  if (s.lines > BODY_SOFT_MAX_LINES) {
    notes.push(`${rel}/SKILL.md is ${s.lines} lines — the harness recommends under ${BODY_SOFT_MAX_LINES}; move reference material into references/ and link it`);
  }

  // Sub-resources: what the directory publishes besides SKILL.md.
  const sub = subResourceFindings(s);
  for (const f of sub.fails) fail(f);
  for (const n of sub.notes) notes.push(n);

  // LESSONS.md is optional. When present, its headings are the join key between a
  // lesson and the version it was learned against — an unparseable heading loses it.
  if (s.lessonsRaw !== null) {
    lessonFiles += 1;
    const heads = lessonHeadings(s.lessonsRaw);
    if (heads.length === 0) fail(`${rel}/LESSONS.md: no \`## \` entries — an empty lessons file is worse than none, it implies nothing was learned`);
    for (const h of heads) {
      lessonEntries += 1;
      if (!LESSON_HEAD_RE.test(h)) fail(`${rel}/LESSONS.md: heading ${JSON.stringify(h.slice(0, 70))} is not \`## <version> - <YYYY-MM-DD> - <project>\``);
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
  if (!ref) { console.error('FATAL: --since requires a git ref (e.g. --since origin/main).'); process.exit(2); }
  const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  try { git(['rev-parse', '--verify', `${ref}^{commit}`]); } catch (e) {
    console.error(`FATAL: --since ref "${ref}" does not resolve in this checkout (${String(e.message).trim()}).`);
    console.error('A shallow clone is the usual cause; CI needs fetch-depth: 0.');
    console.error('Refusing to report "no version problems" from a comparison that never ran.');
    process.exit(2);
  }
  let changed;
  try {
    changed = git(['diff', '--name-only', `${ref}...HEAD`, '--', 'skills/']).split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  } catch (e) {
    console.error(`FATAL: git diff against "${ref}" failed (${String(e.message).trim()}).`);
    process.exit(2);
  }
  // A LESSONS.md append records a run at the CURRENT version; it is not a change to
  // the method. Everything else under the skill directory is the method or the
  // resources it loads, and so must move the version.
  const touched = new Map();
  for (const file of changed) {
    const m = file.match(/^skills\/([^/]+)\/(.+)$/);
    if (!m || m[2] === 'LESSONS.md') continue;
    if (!touched.has(m[1])) touched.set(m[1], []);
    touched.get(m[1]).push(m[2]);
  }
  for (const [name, files] of [...touched.entries()].sort()) {
    const current = seen.get(name);
    if (!current) continue; // deleted, or failed shape above and already reported.
    let oldRaw;
    try { oldRaw = git(['show', `${ref}:skills/${name}/${SKILL_FILE}`]); } catch {
      notes.push(`skills/${name}: new in this change — no prior version to compare`);
      continue;
    }
    bumpChecked += 1;
    const oldFm = parseFrontmatter(oldRaw)?.fm ?? {};
    const oldV = parseSemver(oldFm.version);
    const newV = parseSemver(current.version);
    if (!oldV || !newV) {
      if (!oldV) notes.push(`skills/${name}: version at ${ref} (${JSON.stringify(oldFm.version)}) is not semver — bump not comparable`);
      continue;
    }
    if (cmpSemver(newV, oldV) === 0) {
      fail(`skills/${name}: content changed (${files.join(', ')}) but version stayed ${current.version}. Versions are the comparison currency — an unchanged version tells every consumer it is in sync while it runs different instructions. A non-behavioural fix takes a PATCH bump; the level is free.`);
    } else if (cmpSemver(newV, oldV) < 0) {
      fail(`skills/${name}: version went BACKWARDS, ${oldFm.version} -> ${current.version}. A consumer already at the higher version would resolve as ahead of the registry and never sync again.`);
    }
  }
}

// ---------------------------------------------------------------- report
const byCategory = new Map();
for (const { category } of seen.values()) byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
const catSummary = [...byCategory.entries()].sort().map(([c, n]) => `${c}:${n}`).join(' ');
console.log(`skills lane: ${skills.length} skill(s) - ${catSummary}`);
console.log(`${lessonFiles} LESSONS.md file(s) - ${lessonEntries} entries`);
if (sinceIdx !== -1) console.log(`version discipline: ${bumpChecked} changed skill(s) compared against ${process.argv[sinceIdx + 1]}`);
else console.log('version discipline: NOT run (pass --since <ref>; CI runs it on every pull request)');
console.log('NOT checked here: whether a lesson was appended; whether an installation shadows a lane skill (scripts/fleet-audit.mjs)');
for (const n of notes) console.log(`  note: ${n}`);
if (failures.length) {
  console.error(`\nskills lane FAILED - ${failures.length} problem(s):\n`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error('');
  process.exit(1);
}
console.log('skills lane OK');
