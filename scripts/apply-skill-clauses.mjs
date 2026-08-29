#!/usr/bin/env node
/**
 * apply-skill-clauses - stamp the lane's SHARED clauses into every skill from ONE template.
 *
 * ## Why
 *
 * Every skill in the lane carries two sections that are not about that skill at all:
 * `## Skill Reflection` (how a run improves the skill itself: project lane -> overlay,
 * method lane -> LESSONS.md + version bump, committed in the registry because the skill
 * directory is a link) and, for the skills that propose and execute backlog items,
 * `## Knowledge sync` (subscribe to the bundle's golden paths through
 * `.ai/registry-map.json`, read before proposing, log the consult, file a lead when a
 * landed fix taught something). Measured 2026-08-29: 16 skills carried a hand-copied
 * reflection clause in FOUR drifting variants, and the oldest variant still instructed
 * "copy to ~/.claude/skills/<name>/" - which is precisely what produced the 11 stale
 * personal-tier shadows the fleet audit found. A clause copied by hand into 27 files is
 * 27 places for the next drift. So the clause lives in `docs/skill-clauses/<id>.md` and
 * this script is the only thing that writes it into a SKILL.md, between markers.
 *
 * ## Contract
 *
 *   node scripts/apply-skill-clauses.mjs            # stamp; report which files changed
 *   node scripts/apply-skill-clauses.mjs --check    # exit 1 if any stamp is missing/stale
 *   node scripts/apply-skill-clauses.mjs --bump minor|patch   # stamp AND bump the version
 *                                                             # of every skill whose bytes changed
 *
 * Stamped block shape (the markers are the contract; the heading is inside the block):
 *
 *   <!-- clause: <id> v<n> - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/<id>.md; edit the template, then re-stamp -->
 *   ## <Heading>
 *   ...
 *   <!-- /clause: <id> -->
 *
 * The template's first line is its `## Heading`. `{{name}}` in a template renders to the
 * skill's directory name. Placement: `skill-reflection` replaces a legacy unmarked
 * `## Skill Reflection` section (which is always the last section) or is appended;
 * `knowledge-sync` is inserted directly above the reflection block so reflection stays last.
 *
 * Fail-loud: an empty lane, a missing template, or a template whose first line is not a
 * `## ` heading is FATAL (exit 2), never a green no-op.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter, parseSemver, SKILL_FILE } from './lib/skills-lane.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LANE = path.join(ROOT, 'skills');
const TEMPLATES = path.join(ROOT, 'docs', 'skill-clauses');
const argv = process.argv.slice(2);
const checkOnly = argv.includes('--check');
const bumpIdx = argv.indexOf('--bump');
const bump = bumpIdx === -1 ? null : argv[bumpIdx + 1];
if (bump && !['minor', 'patch'].includes(bump)) { console.error(`FATAL: --bump takes minor|patch, got "${bump}"`); process.exit(2); }

/**
 * Which clause goes where. `all: true` = every skill in the lane. `skills: [...]` = the
 * named subset. `except` = skills that carry a BESPOKE, richer version of the same
 * doctrine in their own sections (scan-sweep: section 4 read + section 6 leads; conform and
 * consult ARE the knowledge sync) - stamping the generic block there would say it twice.
 */
const CLAUSES = [
  { id: 'skill-reflection', version: 2, all: true },
  {
    id: 'knowledge-sync', version: 1,
    skills: ['architect', 'explorer', 'friend', 'perfect', 'ship-loop', 'spark', 'tiger', 'uat', 'mvp',
      'research', 'project-populate', 'i18n-translate', 'kpi-sim', 'ci-triage', 'promote'],
  },
];

const skills = fs.readdirSync(LANE, { withFileTypes: true })
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(LANE, e.name, SKILL_FILE)))
  .map((e) => e.name).sort();
if (skills.length === 0) { console.error('FATAL: the lane parsed to zero skills - the reader is broken.'); process.exit(2); }

const templates = {};
for (const c of CLAUSES) {
  const file = path.join(TEMPLATES, `${c.id}.md`);
  if (!fs.existsSync(file)) { console.error(`FATAL: template missing: ${path.relative(ROOT, file)}`); process.exit(2); }
  const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').trimEnd();
  if (!/^## \S/.test(text)) { console.error(`FATAL: ${c.id}.md must start with its "## Heading" line`); process.exit(2); }
  templates[c.id] = text;
  for (const s of c.skills ?? []) if (!skills.includes(s)) { console.error(`FATAL: clause ${c.id} names unknown skill "${s}"`); process.exit(2); }
}

const openMarker = (c) => `<!-- clause: ${c.id} v${c.version} - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/${c.id}.md; edit the template, then re-stamp -->`;
const closeMarker = (c) => `<!-- /clause: ${c.id} -->`;
const render = (c, name) => `${openMarker(c)}\n${templates[c.id].replaceAll('{{name}}', name)}\n${closeMarker(c)}`;
const blockRe = (c) => new RegExp(`<!-- clause: ${c.id} v\\d+ [^\\n]*-->\\n[\\s\\S]*?<!-- /clause: ${c.id} -->`);
const heading = (c) => templates[c.id].split('\n')[0];

const wants = (c, name) => c.all || c.skills.includes(name);

const problems = [];
let changed = 0;
for (const name of skills) {
  const file = path.join(LANE, name, SKILL_FILE);
  const original = fs.readFileSync(file, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  let text = original.replace(/\r\n/g, '\n');

  for (const c of CLAUSES) {
    if (!wants(c, name)) continue;
    const block = render(c, name);
    const existing = text.match(blockRe(c));
    if (existing) {
      if (existing[0] !== block) text = text.replace(existing[0], block);
      continue;
    }
    if (c.id === 'skill-reflection') {
      // Legacy: an unmarked "## Skill Reflection" section, always the last section of the file.
      const at = text.indexOf(`\n${heading(c)}\n`);
      if (at !== -1) {
        const tail = text.slice(at + 1);
        if (/\n## /.test(tail.slice(heading(c).length))) {
          problems.push(`${name}: legacy "${heading(c)}" is not the last section - refusing to guess its extent`);
          continue;
        }
        text = `${text.slice(0, at + 1)}${block}\n`;
      } else {
        text = `${text.trimEnd()}\n\n---\n\n${block}\n`;
      }
      continue;
    }
    // knowledge-sync: directly above the reflection block (which is stamped first).
    const refl = CLAUSES.find((x) => x.id === 'skill-reflection');
    const at = text.indexOf(openMarker(refl));
    if (at === -1) { problems.push(`${name}: no reflection block to anchor ${c.id} above`); continue; }
    text = `${text.slice(0, at)}${block}\n\n${text.slice(at)}`;
  }

  // A skill that is NOT in a clause's set must not carry that clause (a stale opt-in).
  for (const c of CLAUSES) if (!wants(c, name) && blockRe(c).test(text)) problems.push(`${name}: carries clause ${c.id} but is not in its set`);

  const next = text.replace(/\n/g, eol);
  if (next === original) continue;
  changed += 1;
  if (checkOnly) { problems.push(`${name}: stamp missing or stale (run without --check)`); continue; }
  let out = next;
  if (bump) {
    const fm = parseFrontmatter(out);
    const cur = parseSemver(fm?.fm?.version ?? '');
    if (!cur) { problems.push(`${name}: cannot bump - version "${fm?.fm?.version}" is not semver`); }
    else {
      const v = bump === 'minor' ? [cur[0], cur[1] + 1, 0] : [cur[0], cur[1], cur[2] + 1];
      out = out.replace(/^version:\s*\S+/m, `version: ${v.join('.')}`);
      console.log(`  ${name}: ${cur.join('.')} -> ${v.join('.')}`);
    }
  }
  fs.writeFileSync(file, out);
  console.log(`  stamped ${name}`);
}

console.log(`apply-skill-clauses: ${skills.length} skill(s), ${CLAUSES.length} clause(s), ${changed} file(s) ${checkOnly ? 'out of date' : 'written'}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
