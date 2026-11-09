#!/usr/bin/env node
/**
 * build-readme - keep README.md's restatements of registry.yaml derived, not hand-copied.
 *
 * ## Why
 *
 * `registry.yaml` is the authority on what lanes this repository carries; README.md is
 * the landing document that restates it for a human. Restated by hand, the two drifted
 * (measured 2026-11-09): README said "eight lanes" against nine declared, the publications
 * lane was missing from its table, its layout block named four of the nine maintenance
 * skills under `.claude/skills/`, and nothing checked that a path the layout block names
 * still exists. `scripts/check-readmes.mjs` measures the SHAPE of landing documents across
 * the fleet; it does not check this README's facts against this repository. This does.
 *
 * The README stays hand-written prose. Only the restatements are generated:
 *
 *   lanes               the lane-count sentence and the lane table (lane link, holds,
 *                       status), in registry.yaml order. The link is the lane's README.md
 *                       when it has one, else its index.md, else its `spec`.
 *   maintenance-skills  the sentence in "### Skills" naming every directory under
 *                       .claude/skills/ that holds a SKILL.md.
 *
 * Each sits between an opening comment that names this generator and a closing comment -
 * the marker idea scripts/apply-skill-clauses.mjs uses - and each must appear EXACTLY
 * once. A missing, duplicated or out-of-order marker is a problem (exit 1) and the README
 * is not rewritten: the script will not guess which copy is meant.
 *
 *   <!-- generated: <id> - by scripts/build-readme.mjs from <source>; edit the source, then re-run -->
 *   ...
 *   <!-- /generated: <id> -->
 *
 * One more restatement lives inside the "## Layout" code fence, where an HTML comment
 * would render as literal text: the single fence line that starts `.claude/skills/` and
 * whose comment reads `# the skills that maintain THIS registry: ...`. Everything after
 * that colon is generated (`/name` per skill). The line itself is the marker; exactly one
 * such line must exist.
 *
 * Dead paths: `--check` (and a write) also fail when a repository path the layout fence
 * names, or a lane path or link in the lane table, does not exist. Placeholders (`<domain>`,
 * `<name>`, ...) are skipped, a `*` matches within one path segment, and a line whose
 * comment begins `GITIGNORED` names machine state that a checkout need not have. It does
 * not require every script to be listed: the README is a landing document with a word
 * budget, not an inventory.
 *
 * ## Contract
 *
 *   node scripts/build-readme.mjs            # regenerate the blocks; report dead paths
 *   node scripts/build-readme.mjs --check    # exit 1 if a block is stale or a path is dead
 *   node scripts/build-readme.mjs --root <dir>   # operate on another checkout (tests)
 *
 * Exit: 0 clean; 1 a stale block, a marker problem or a dead path; 2 could not run
 * (unreadable README, registry.yaml outside the reader's subset, a lane missing a field).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT, installCrashDoor } from './lib/exit-codes.mjs';
import { parseRegistryYaml, lanesOf } from './lib/registry-yaml.mjs';

const GENERATOR = 'scripts/build-readme.mjs';
const USAGE = 'usage: node scripts/build-readme.mjs [--check] [--root <dir>]';

export const openMarker = (id, source) => `<!-- generated: ${id} - by ${GENERATOR} from ${source}; edit the source, then re-run -->`;
export const closeMarker = (id) => `<!-- /generated: ${id} -->`;

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const countWord = (n) => NUMBER_WORDS[n] ?? String(n);
const cell = (s) => String(s).replace(/\s+/g, ' ').trim().replace(/\|/g, '\\|');
const exists = (root, rel) => fs.existsSync(path.join(root, rel));

/** The lane's landing document, as the README links it. */
export function laneLink(root, lane) {
  const dir = String(lane.path).replace(/\/?$/, '/');
  for (const f of ['README.md', 'index.md']) if (exists(root, dir + f)) return dir + f;
  return lane.spec;
}

export function renderLanes(root, lanes) {
  const rows = lanes.map((l) => `| [\`${l.path}\`](${laneLink(root, l)}) | ${cell(l.holds)} | ${cell(l.status)} |`);
  return [
    `The repository carries ${countWord(lanes.length)} lanes, declared in [\`registry.yaml\`](registry.yaml):`,
    '',
    '| Lane | Holds | Status |',
    '| --- | --- | --- |',
    ...rows,
  ].join('\n');
}

const englishList = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')}, and ${xs[xs.length - 1]}`);

export function renderSkills(skills) {
  return `Registry maintenance methods live in [.claude/skills/](.claude/skills/): ${englishList(skills)}.`;
}

export function maintenanceSkills(root) {
  const dir = path.join(root, '.claude', 'skills');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, 'SKILL.md')))
    .map((e) => e.name).sort();
}

/** Replace the one marked block `id` in text, or record why it cannot be. */
function replaceBlock(text, id, source, body, problems) {
  const open = new RegExp(`^<!-- generated: ${id} [^\\n]*-->$`, 'gm');
  const close = closeMarker(id);
  const opens = [...text.matchAll(open)];
  const closes = text.split('\n').filter((l) => l === close).length;
  if (opens.length !== 1 || closes !== 1) {
    problems.push(`README.md: block "${id}" must appear exactly once - found ${opens.length} open marker(s), ${closes} close marker(s)`);
    return null;
  }
  const start = opens[0].index;
  const end = text.indexOf(`\n${close}`, start);
  if (end === -1) {
    problems.push(`README.md: block "${id}" closes before it opens`);
    return null;
  }
  return `${text.slice(0, start)}${openMarker(id, source)}\n${body}${text.slice(end)}`;
}

/** The "## Layout" code fence: [startLine, endLine) indexes of its content lines. */
function layoutFence(lines) {
  const h = lines.findIndex((l) => /^## Layout\s*$/.test(l));
  if (h === -1) return null;
  const a = lines.findIndex((l, i) => i > h && /^```/.test(l));
  if (a === -1) return null;
  const b = lines.findIndex((l, i) => i > a && /^```\s*$/.test(l));
  if (b === -1) return null;
  return [a + 1, b];
}

const SKILLS_LINE = /^(\.claude\/skills\/\s+# the skills that maintain THIS registry:)( .*)?$/;

function replaceSkillsLine(text, skills, problems) {
  const lines = text.split('\n');
  const fence = layoutFence(lines);
  if (!fence) { problems.push('README.md: no "## Layout" code fence found'); return null; }
  const hits = [];
  for (let i = fence[0]; i < fence[1]; i += 1) if (SKILLS_LINE.test(lines[i])) hits.push(i);
  if (hits.length !== 1) {
    problems.push(`README.md: the layout fence must hold exactly one ".claude/skills/ ... # the skills that maintain THIS registry:" line - found ${hits.length}`);
    return null;
  }
  const i = hits[0];
  lines[i] = lines[i].replace(SKILLS_LINE, (_, head) => `${head} ${skills.map((s) => `/${s}`).join(' ')}`);
  return lines.join('\n');
}

/** Does a repo-relative path (possibly with `*` in a segment) exist under root? */
function pathExists(root, rel) {
  const clean = rel.replace(/\/+$/, '');
  if (!clean.includes('*')) return exists(root, clean);
  const segs = clean.split('/');
  let frontier = [''];
  for (const seg of segs) {
    const next = [];
    for (const base of frontier) {
      if (!seg.includes('*')) { if (exists(root, path.join(base, seg))) next.push(path.join(base, seg)); continue; }
      const dir = path.join(root, base);
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
      const re = new RegExp(`^${seg.split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')}$`);
      for (const name of fs.readdirSync(dir)) if (re.test(name)) next.push(path.join(base, name));
    }
    frontier = next;
    if (frontier.length === 0) return false;
  }
  return true;
}

/** Paths the layout fence and the lane table name that do not exist. */
export function deadPaths(root, text) {
  const dead = [];
  const lines = text.split('\n');
  const fence = layoutFence(lines);
  if (fence) {
    for (let i = fence[0]; i < fence[1]; i += 1) {
      const m = /^([^\s#]+)\s*(?:#\s*(.*))?$/.exec(lines[i]);
      if (!m) continue;
      const [, p, comment = ''] = m;
      if (/<[^>]*>/.test(p) || comment.startsWith('GITIGNORED')) continue;
      if (!pathExists(root, p)) dead.push(`layout line ${i + 1}: ${p}`);
    }
  }
  const open = /^<!-- generated: lanes [^\n]*-->$/m.exec(text);
  const closeAt = open ? text.indexOf(`\n${closeMarker('lanes')}`, open.index) : -1;
  if (open && closeAt !== -1) {
    const block = text.slice(open.index, closeAt);
    for (const m of block.matchAll(/^\| \[`([^`]+)`\]\(([^)]+)\)/gm)) {
      for (const p of [m[1], m[2]]) if (!/^[a-z]+:/i.test(p) && !pathExists(root, p.split('#')[0])) dead.push(`lane table: ${p}`);
    }
  }
  return [...new Set(dead)];
}

/** Build the README text from the sources. Returns { text, problems }. */
export function build(root, original) {
  const doc = parseRegistryYaml(fs.readFileSync(path.join(root, 'registry.yaml'), 'utf8'));
  const lanes = lanesOf(doc);
  for (const l of lanes) for (const f of ['path', 'holds', 'status']) {
    if (typeof l[f] !== 'string' || l[f].trim() === '') throw new Error(`registry.yaml lane "${l.name}" has no \`${f}\` - the lane table cannot be derived`);
  }
  for (const l of lanes) if (laneLink(root, l) == null) throw new Error(`registry.yaml lane "${l.name}" has no README.md, index.md or \`spec\` to link`);
  const skills = maintenanceSkills(root);
  if (skills.length === 0) throw new Error('.claude/skills/ holds no skill directory - the reader is broken or the root is wrong');

  const problems = [];
  let text = original.replace(/\r\n/g, '\n');
  const steps = [
    (t) => replaceBlock(t, 'lanes', 'registry.yaml', renderLanes(root, lanes), problems),
    (t) => replaceBlock(t, 'maintenance-skills', '.claude/skills/', renderSkills(skills), problems),
    (t) => replaceSkillsLine(t, skills, problems),
  ];
  let ok = true;
  for (const step of steps) {
    const next = step(text);
    if (next === null) ok = false; else text = next;
  }
  return { text: ok ? text : null, problems };
}

function main() {
  installCrashDoor();
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h')) { console.log(USAGE); process.exit(EXIT.OK); }
  const checkOnly = argv.includes('--check');
  const rootIdx = argv.indexOf('--root');
  const strays = argv.filter((a, i) => a !== '--check' && a !== '--root' && !(rootIdx !== -1 && i === rootIdx + 1));
  if (strays.length || (rootIdx !== -1 && !argv[rootIdx + 1])) {
    console.error(`build-readme: unknown or incomplete argument(s) ${strays.join(' ')} - nothing read or written\n${USAGE}`);
    process.exit(EXIT.FATAL);
  }
  const root = rootIdx !== -1 ? path.resolve(argv[rootIdx + 1]) : path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
  const readme = path.join(root, 'README.md');

  let original;
  let result;
  try {
    original = fs.readFileSync(readme, 'utf8');
    result = build(root, original);
  } catch (e) {
    console.error(`FATAL: build-readme could not run: ${e.message}`);
    process.exit(EXIT.FATAL);
  }
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const problems = [...result.problems];
  let state = 'unchanged';
  let finalText = original.replace(/\r\n/g, '\n');
  if (result.text !== null) {
    const next = result.text.replace(/\n/g, eol);
    if (next !== original) {
      if (checkOnly) { problems.push('README.md: generated block(s) are stale (run node scripts/build-readme.mjs)'); state = 'stale'; }
      else { fs.writeFileSync(readme, next); state = 'written'; finalText = result.text; }
    }
  } else {
    state = 'not written';
  }
  for (const d of deadPaths(root, finalText)) problems.push(`README.md: names a path that does not exist - ${d}`);

  console.log(`build-readme: README.md ${state}${checkOnly ? ' (--check)' : ''}`);
  if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(EXIT.VIOLATIONS);
  }
  process.exit(EXIT.OK);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
