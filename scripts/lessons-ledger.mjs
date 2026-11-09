#!/usr/bin/env node
/**
 * lessons-ledger - what became of each lesson in the skills lane.
 *
 * Why this exists. Every lane skill keeps `skills/<name>/LESSONS.md`: append-only, one
 * block per run (docs/skills-lane.md, "LESSONS.md"). On 2026-11-09 that was 391 blocks
 * and about 760 KB across 44 files, and none of them carried a state. Nobody could say,
 * without rereading all of it, which lessons a method absorbed, which were declined,
 * which are still open, and which have now been seen twice. Worse, a lesson that WAS
 * folded into a skill had nothing guarding it: a later rewrite could drop the rule the
 * lesson paid for and no gate would notice.
 *
 * So the state lives in ONE file outside every skill directory,
 * `librarian/skills/lessons-ledger.json` (inside a skill it would enter the skill's
 * content hash and its version rule, and LESSONS.md stays append-only and untouched).
 * A lesson absent from the ledger is `open`; the ledger lists only decided lessons, so
 * appending a lesson needs no ledger edit. A `promoted` lesson names the skill version
 * that absorbed it and an ANCHOR: a phrase that must still occur in the skill's current
 * SKILL.md or references/. `--check` fails when an anchor has left the skill text, which
 * turns every absorbed lesson into a regression guard on the method.
 *
 * Identity. A lesson is `<skill>` plus the exact text of its `## ` heading line (without
 * the `## `), with ` [n]` appended to the n-th occurrence (n >= 2) of a heading the file
 * repeats. A `### ` sub-block inside it is `<id>#<sub-heading text>`, with the same
 * ordinal rule inside its block. Appending a block never changes an existing id; a file
 * that PREPENDS a repeated heading would renumber, and --check would then report the
 * ledger entry against a different block's text - review catches that, the id rule says
 * so here rather than pretending otherwise.
 *
 * Modes:
 *   node scripts/lessons-ledger.mjs                 per-skill counts, oldest open block,
 *                                                   every open Redesign proposal
 *   node scripts/lessons-ledger.mjs --skill <name>  that skill's blocks with their state
 *   node scripts/lessons-ledger.mjs --json          all of the above as JSON
 *   node scripts/lessons-ledger.mjs --check         the gate (exit 1 on any violation)
 *   node scripts/lessons-ledger.mjs --repeats [--skill <name>] [--threshold 0.30] [--top 10]
 *                                                   "seen twice" leads: bullets from
 *                                                   different blocks whose wording overlaps
 *   --root <dir>                                    another checkout (tests use fixtures)
 *
 * Exit: 0 ok (report modes always 0), 1 --check found violations, 2 could not run (no
 * skills/ lane, no LESSONS.md anywhere, usage error).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT, installCrashDoor } from './lib/exit-codes.mjs';
import { requirePopulation } from './lib/check-result.mjs';
import { readSkill, LESSON_HEAD_RE, parseSemver, cmpSemver } from './lib/skills-lane.mjs';

export const LEDGER_REL = 'librarian/skills/lessons-ledger.json';
export const LEDGER_SCHEMA = 'lessons-ledger/1';
export const STATES = ['promoted', 'declined', 'superseded'];
const FIELDS = {
  promoted: { required: ['version', 'anchor'], optional: ['note'] },
  declined: { required: ['reason', 'date'], optional: ['note'] },
  superseded: { required: ['by'], optional: ['note'] },
};
// An anchor shorter than this matches by accident ("the gate", "never") and guards
// nothing; the floor is on the whitespace-collapsed text.
export const ANCHOR_MIN = 16;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HEAD_PARTS_RE = /^(\S[^\n]*?) [-–—] (\d{4}-\d{2}-\d{2}) [-–—] (\S.*)$/;

// ------------------------------------------------------------------ parsing

/**
 * Parse a LESSONS.md into blocks. Pure. A block runs from its `## ` line to the next
 * `## ` line; text before the first one is the file's preamble and belongs to no block.
 * Each block carries its bullets (a `- ` line plus its indented continuation lines),
 * which the repeats report reads.
 */
export function parseLessons(raw) {
  const lines = String(raw).replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  const seen = new Map();
  let cur = null;
  let sub = null;
  // A bullet is a `- ` line plus its indented continuation; a paragraph is a run of other
  // non-blank lines (some blocks and most proposals are prose). Both are "items".
  let bullet = null;
  let para = null;
  const endBullet = () => {
    if (bullet) { (sub ?? cur).bullets.push(collapse(bullet.join(' '))); bullet = null; }
    if (para) { (sub ?? cur).bullets.push(collapse(para.join(' '))); para = null; }
  };
  lines.forEach((line, i) => {
    if (line.startsWith('## ')) {
      endBullet();
      const heading = line.slice(3).trim();
      const n = (seen.get(heading) ?? 0) + 1;
      seen.set(heading, n);
      const m = HEAD_PARTS_RE.exec(heading);
      cur = {
        id: n === 1 ? heading : `${heading} [${n}]`,
        heading, line: i + 1,
        matched: LESSON_HEAD_RE.test(line),
        version: m ? m[1] : null, date: m ? m[2] : null, project: m ? m[3] : null,
        bullets: [], subs: [], subSeen: new Map(),
      };
      sub = null;
      blocks.push(cur);
      return;
    }
    if (!cur) return;
    if (line.startsWith('### ')) {
      endBullet();
      const heading = line.slice(4).trim();
      const n = (cur.subSeen.get(heading) ?? 0) + 1;
      cur.subSeen.set(heading, n);
      sub = { id: `${cur.id}#${n === 1 ? heading : `${heading} [${n}]`}`, heading, line: i + 1, bullets: [], text: [] };
      cur.subs.push(sub);
      return;
    }
    if (sub) sub.text.push(line);
    if (/^\s*[-*] /.test(line) && !/^\s{2,}[-*] /.test(line)) { endBullet(); bullet = [line.replace(/^\s*[-*] /, '')]; return; }
    if (bullet && /^\s+\S/.test(line)) { bullet.push(line.trim()); return; }
    if (line.trim()) {
      if (bullet) endBullet();
      (para ??= []).push(line.trim());
      return;
    }
    endBullet();
  });
  endBullet();
  for (const b of blocks) {
    delete b.subSeen;
    for (const s of b.subs) { s.text = s.text.join('\n').trim(); }
  }
  return blocks;
}

/** The lowest version a heading's version slot names, as a semver triple, or null. */
export function recordedVersion(slot) {
  const found = String(slot ?? '').match(/\d+\.\d+(?:\.\d+)?/g);
  if (!found) return null;
  const triples = found.map((v) => { const p = v.split('.').map(Number); return [p[0], p[1], p[2] ?? 0]; });
  return triples.sort(cmpSemver)[0];
}

export const collapse = (s) => String(s).replace(/\s+/g, ' ').trim();

/** The text an anchor must occur in: SKILL.md plus every file under references/. */
export function skillText(skillDir) {
  const parts = [];
  const skillPath = path.join(skillDir, 'SKILL.md');
  if (fs.existsSync(skillPath)) parts.push(fs.readFileSync(skillPath, 'utf8'));
  const refs = path.join(skillDir, 'references');
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && fs.statSync(p).size < 4 * 1024 * 1024) parts.push(fs.readFileSync(p, 'utf8'));
    }
  };
  if (fs.existsSync(refs) && fs.statSync(refs).isDirectory()) walk(refs);
  return collapse(parts.join('\n'));
}

// ------------------------------------------------------------------ reading the tree

/** Every skill that has a LESSONS.md, parsed, with its current version and text. */
export function readLessonsLane(root) {
  const laneDir = path.join(root, 'skills');
  if (!fs.existsSync(laneDir) || !fs.statSync(laneDir).isDirectory()) return { error: `no skills/ lane under ${root}` };
  const skills = {};
  for (const e of fs.readdirSync(laneDir, { withFileTypes: true }).filter((x) => x.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const s = readSkill(laneDir, e.name);
    skills[e.name] = {
      name: e.name,
      exists: s.exists,
      version: s.fm?.version ?? null,
      hasLessons: s.lessonsRaw != null,
      blocks: s.lessonsRaw != null ? parseLessons(s.lessonsRaw) : [],
      dir: s.dir,
    };
  }
  return { skills };
}

export function readLedger(root) {
  const p = path.join(root, LEDGER_REL);
  if (!fs.existsSync(p)) return { ledger: { schema: LEDGER_SCHEMA, skills: {} }, missing: true };
  try { return { ledger: JSON.parse(fs.readFileSync(p, 'utf8')) }; } catch (e) { return { parseError: e.message }; }
}

const stateOf = (ledger, skill, id) => ledger?.skills?.[skill]?.[id]?.state ?? 'open';

// ------------------------------------------------------------------ the gate

/**
 * Every violation in the ledger against the lane, as strings. Pure over its inputs except
 * for the anchor text, which `textFor(skill)` supplies (the CLI reads the skill dir; a
 * test may pass a string).
 */
export function checkLedger(ledger, lane, textFor) {
  const v = [];
  if (!ledger || typeof ledger !== 'object' || Array.isArray(ledger)) return ['ledger is not a JSON object'];
  if (ledger.schema !== LEDGER_SCHEMA) v.push(`schema must be "${LEDGER_SCHEMA}" (found ${JSON.stringify(ledger.schema)})`);
  for (const k of Object.keys(ledger)) if (!['schema', 'about', 'skills'].includes(k)) v.push(`unknown top-level key "${k}"`);
  const skills = ledger.skills;
  if (!skills || typeof skills !== 'object' || Array.isArray(skills)) { v.push('"skills" must be an object keyed by skill name'); return v; }
  for (const [skill, entries] of Object.entries(skills)) {
    const s = lane.skills[skill];
    if (!s) { v.push(`${skill}: no such skill in skills/ (orphan skill key)`); continue; }
    if (!s.hasLessons) { v.push(`${skill}: has no LESSONS.md, so no ledger key can resolve`); continue; }
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) { v.push(`${skill}: entries must be an object keyed by lesson id`); continue; }
    const ids = new Map();
    for (const b of s.blocks) { ids.set(b.id, b); for (const sb of b.subs) ids.set(sb.id, { ...sb, date: b.date, version: b.version }); }
    const current = parseSemver(s.version);
    let text = null;
    for (const [id, e] of Object.entries(entries)) {
      const where = `${skill} :: ${id}`;
      const block = ids.get(id);
      if (!block) { v.push(`${where}: no block or sub-block with this id in skills/${skill}/LESSONS.md (orphan key)`); continue; }
      if (!e || typeof e !== 'object' || Array.isArray(e)) { v.push(`${where}: entry must be an object`); continue; }
      if (!STATES.includes(e.state)) { v.push(`${where}: state must be one of ${STATES.join(' | ')} (open is the absence of an entry), found ${JSON.stringify(e.state)}`); continue; }
      const spec = FIELDS[e.state];
      for (const f of spec.required) if (e[f] == null || e[f] === '' || (Array.isArray(e[f]) && !e[f].length)) v.push(`${where}: ${e.state} needs "${f}"`);
      for (const f of Object.keys(e)) if (f !== 'state' && !spec.required.includes(f) && !spec.optional.includes(f)) v.push(`${where}: field "${f}" is not part of a ${e.state} entry`);
      if (e.note != null && (typeof e.note !== 'string' || !e.note.trim())) v.push(`${where}: note must be a non-empty string`);
      if (e.state === 'promoted') {
        const pv = parseSemver(e.version);
        if (e.version != null && !pv) v.push(`${where}: version "${e.version}" is not MAJOR.MINOR.PATCH`);
        if (pv) {
          const rec = recordedVersion(block.version);
          if (rec && cmpSemver(pv, rec) < 0) v.push(`${where}: promoted in ${e.version}, below the version the lesson was recorded against (${block.version})`);
          if (!current) v.push(`${where}: skill ${skill} has no semver version to bound the promotion`);
          else if (cmpSemver(pv, current) > 0) v.push(`${where}: promoted in ${e.version}, above the skill's current version ${s.version}`);
        }
        if (e.anchor != null) {
          const anchors = Array.isArray(e.anchor) ? e.anchor : [e.anchor];
          for (const a of anchors) {
            if (typeof a !== 'string' || collapse(a).length < ANCHOR_MIN) { v.push(`${where}: anchor ${JSON.stringify(a)} must be a string of at least ${ANCHOR_MIN} characters`); continue; }
            text ??= textFor(skill);
            if (!text.includes(collapse(a))) v.push(`${where}: anchor "${collapse(a)}" no longer occurs in skills/${skill}/SKILL.md or references/ - the method dropped a rule this lesson paid for`);
          }
        }
      }
      if (e.state === 'declined') {
        if (e.reason != null && (typeof e.reason !== 'string' || !e.reason.trim())) v.push(`${where}: reason must be a non-empty string`);
        if (e.date != null && (typeof e.date !== 'string' || !DATE_RE.test(e.date) || Number.isNaN(Date.parse(`${e.date}T00:00:00Z`)))) v.push(`${where}: date "${e.date}" is not YYYY-MM-DD`);
      }
      if (e.state === 'superseded' && e.by != null) {
        if (typeof e.by !== 'string') v.push(`${where}: by must be a lesson id or a version string`);
        else if (parseSemver(e.by)) {
          if (current && cmpSemver(parseSemver(e.by), current) > 0) v.push(`${where}: superseded by ${e.by}, above the skill's current version ${s.version}`);
        } else {
          const later = ids.get(e.by);
          if (!later) v.push(`${where}: superseded by "${e.by}", which is neither a lesson id in this skill nor a MAJOR.MINOR.PATCH version`);
          else if (e.by === id) v.push(`${where}: a lesson cannot supersede itself`);
          else if (later.date && block.date && later.date < block.date) v.push(`${where}: superseded by "${e.by}", which is dated before it`);
        }
      }
    }
  }
  return v;
}

// ------------------------------------------------------------------ the report

const isProposal = (sub) => /redesign proposal/i.test(sub.heading);

export function buildReport(lane, ledger) {
  const out = { skills: {}, totals: { blocks: 0, matched: 0, open: 0, promoted: 0, declined: 0, superseded: 0, subBlocks: 0, proposals: 0, openProposals: 0 } };
  for (const s of Object.values(lane.skills)) {
    if (!s.hasLessons) continue;
    const counts = { open: 0, promoted: 0, declined: 0, superseded: 0 };
    let oldest = null;
    const proposals = [];
    const blocks = s.blocks.map((b) => {
      const state = stateOf(ledger, s.name, b.id);
      counts[state]++;
      if (state === 'open' && b.date && (!oldest || b.date < oldest.date)) oldest = { id: b.id, date: b.date };
      const subs = b.subs.map((sb) => {
        const st = stateOf(ledger, s.name, sb.id);
        if (isProposal(sb)) proposals.push({ id: sb.id, state: st, line: sb.line });
        return { id: sb.id, line: sb.line, state: st };
      });
      return { id: b.id, line: b.line, matched: b.matched, date: b.date, version: b.version, state, bullets: b.bullets.length, subs };
    });
    const subCount = blocks.reduce((n, b) => n + b.subs.length, 0);
    out.skills[s.name] = { version: s.version, blocks: blocks.length, counts, oldestOpen: oldest, openProposals: proposals.filter((p) => p.state === 'open'), proposals, subBlocks: subCount, detail: blocks };
    const t = out.totals;
    t.blocks += blocks.length; t.matched += blocks.filter((b) => b.matched).length; t.subBlocks += subCount;
    for (const k of Object.keys(counts)) t[k] += counts[k];
    t.proposals += proposals.length; t.openProposals += proposals.filter((p) => p.state === 'open').length;
  }
  return out;
}

// ------------------------------------------------------------------ repeats

// The measure, stated once so the doc and the code cannot disagree. Each item (a bullet,
// or a prose paragraph) becomes the SET of its content words: lowercased, split on
// anything that is not a letter or digit, words under three letters, stop words and any
// word containing a digit dropped. Two items from DIFFERENT blocks of one skill are
// linked when the Jaccard overlap of their word sets reaches the threshold (0.25), and
// linked items cluster transitively (union-find).
//
// Two filters, both from measuring the real lane on 2026-11-09: an item with fewer than
// six content words is skipped (a short line overlaps everything a little), and so is a
// MEASUREMENT line - a table row, or an item where more than a fifth of the
// whitespace-separated tokens carry a digit. Without that filter the top of the list was
// fourteen pairs of contest "Cost and wall: opus@xhigh 29 min / $8.26 / 56 turns" lines,
// which share a template, not a lesson. Word 3-shingles were tried first and found one
// cluster in the whole lane: repeats are reworded, so phrase overlap misses them.
export const REPEAT_THRESHOLD = 0.25;
const MIN_WORDS = 6;
const MAX_DIGIT_SHARE = 0.2;
const STOP = new Set('the and for that this with from into are was were not but its their them then than when what which who will would should could has have had been being one two any all each per our out off own via also only just more most much many very such over under onto upon here there where your you they she him his her itself these those does did doing can may must every some same other another because while after before about again once both few nor too ever even yet how why'.split(' '));

/** The content-word set of one item, or null when the item is filtered out. */
export function contentWords(text) {
  const t = String(text);
  if (t.trimStart().startsWith('|')) return null;
  const raw = t.split(/\s+/).filter(Boolean);
  if (raw.length && raw.filter((w) => /\d/.test(w)).length / raw.length > MAX_DIGIT_SHARE) return null;
  const words = new Set(t.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !STOP.has(w) && !/\d/.test(w)));
  return words.size >= MIN_WORDS ? words : null;
}

export function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  const [small, big] = a.size <= b.size ? [a, b] : [b, a];
  for (const x of small) if (big.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

/** Clusters of overlapping bullets across blocks of one skill. Deterministic. */
export function findRepeats(lane, ledger, { threshold = REPEAT_THRESHOLD, skill = null } = {}) {
  const clusters = [];
  for (const s of Object.values(lane.skills)) {
    if (!s.hasLessons || (skill && s.name !== skill)) continue;
    const items = [];
    s.blocks.forEach((b, bi) => {
      // A sub-block's items carry the sub-block's id (and so its own state); `bi` stays the
      // parent's, so a block never clusters with its own sub-block.
      const all = [...b.bullets.map((text) => [b, text]), ...b.subs.flatMap((sb) => sb.bullets.map((text) => [{ id: sb.id, project: b.project }, text]))];
      all.forEach(([unit, text]) => { const sh = contentWords(text); if (sh) items.push({ bi, block: unit, text, sh }); });
    });
    const parent = items.map((_, i) => i);
    const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
    const best = new Map();
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (items[i].bi === items[j].bi) continue;
        const sim = jaccard(items[i].sh, items[j].sh);
        if (sim >= threshold) {
          const a = find(i); const b = find(j);
          if (a !== b) parent[b] = a;
          for (const k of [i, j]) best.set(k, Math.max(best.get(k) ?? 0, sim));
        }
      }
    }
    const groups = new Map();
    for (let i = 0; i < items.length; i++) if (best.has(i)) { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(i); }
    for (const members of groups.values()) {
      const blocks = [...new Set(members.map((i) => items[i].block.id))];
      const projects = new Set(members.map((i) => (items[i].block.project ?? '').split(' ')[0]).filter(Boolean));
      const states = blocks.map((id) => stateOf(ledger, s.name, id));
      clusters.push({
        skill: s.name,
        open: states.some((x) => x === 'open'),
        blocks: blocks.length,
        projects: projects.size,
        maxOverlap: Math.max(...members.map((i) => best.get(i))),
        members: members.map((i) => ({ block: items[i].block.id, state: stateOf(ledger, s.name, items[i].block.id), overlap: Number(best.get(i).toFixed(3)), text: items[i].text })),
      });
    }
  }
  // Open first, then the clusters spanning most projects, then most blocks, then overlap,
  // then name - a total order, so two runs over one tree print the same list.
  clusters.sort((a, b) => (b.open - a.open) || (b.projects - a.projects) || (b.blocks - a.blocks) || (b.maxOverlap - a.maxOverlap) || a.skill.localeCompare(b.skill) || a.members[0].block.localeCompare(b.members[0].block));
  return clusters;
}

// ------------------------------------------------------------------ CLI

const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 3)}...` : s);

function main() {
  installCrashDoor();
  const argv = process.argv.slice(2);
  const opt = (name) => { const i = argv.indexOf(name); return i === -1 ? null : argv[i + 1]; };
  const known = new Set(['--check', '--json', '--repeats', '--skill', '--root', '--threshold', '--top']);
  for (let i = 0; i < argv.length; i++) {
    if (!known.has(argv[i])) { console.error(`lessons-ledger: unknown argument "${argv[i]}"`); return EXIT.FATAL; }
    if (['--skill', '--root', '--threshold', '--top'].includes(argv[i])) {
      if (argv[i + 1] == null || argv[i + 1].startsWith('--')) { console.error(`lessons-ledger: ${argv[i]} needs a value`); return EXIT.FATAL; }
      i++;
    }
  }
  const root = path.resolve(opt('--root') ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
  const json = argv.includes('--json');
  const skillArg = opt('--skill');

  const lane = readLessonsLane(root);
  if (lane.error) { console.error(`lessons-ledger: could not run - ${lane.error}`); return EXIT.FATAL; }
  const withLessons = Object.values(lane.skills).filter((s) => s.hasLessons).length;
  const floor = requirePopulation(withLessons, 'LESSONS.md files');
  if (floor.code !== EXIT.OK) { console.error(`lessons-ledger: could not run - ${floor.reason}`); return EXIT.FATAL; }
  if (skillArg && !lane.skills[skillArg]?.hasLessons) { console.error(`lessons-ledger: skills/${skillArg}/LESSONS.md does not exist`); return EXIT.FATAL; }

  const read = readLedger(root);

  if (argv.includes('--check')) {
    if (read.parseError) { console.error(`lessons-ledger --check: ${LEDGER_REL} is not valid JSON (${read.parseError})`); return EXIT.VIOLATIONS; }
    const textCache = new Map();
    const textFor = (skill) => { if (!textCache.has(skill)) textCache.set(skill, skillText(lane.skills[skill].dir)); return textCache.get(skill); };
    const violations = checkLedger(read.ledger, lane, textFor);
    const entries = Object.values(read.ledger.skills ?? {}).reduce((n, e) => n + Object.keys(e ?? {}).length, 0);
    if (violations.length) {
      console.error(`lessons-ledger --check: ${violations.length} violation(s) in ${LEDGER_REL}`);
      for (const x of violations) console.error(`  - ${x}`);
      return EXIT.VIOLATIONS;
    }
    console.log(`lessons-ledger --check: OK - ${entries} ledger entr${entries === 1 ? 'y' : 'ies'} over ${withLessons} LESSONS.md files${read.missing ? ` (no ${LEDGER_REL} yet: every lesson is open)` : ''}`);
    return EXIT.OK;
  }

  if (read.parseError) { console.error(`lessons-ledger: could not run - ${LEDGER_REL} is not valid JSON (${read.parseError})`); return EXIT.FATAL; }
  const ledger = read.ledger;

  if (argv.includes('--repeats')) {
    const threshold = opt('--threshold') != null ? Number(opt('--threshold')) : REPEAT_THRESHOLD;
    const top = opt('--top') != null ? Number(opt('--top')) : 10;
    if (!(threshold > 0 && threshold <= 1) || !(Number.isInteger(top) && top > 0)) { console.error('lessons-ledger: --threshold takes (0,1], --top a positive integer'); return EXIT.FATAL; }
    const clusters = findRepeats(lane, ledger, { threshold, skill: skillArg });
    if (json) { console.log(JSON.stringify({ measure: 'jaccard over content-word sets', threshold, clusters }, null, 2)); return EXIT.OK; }
    console.log(`Repeats: ${clusters.length} cluster(s) at Jaccard >= ${threshold} over content-word sets (open first; leads for a reviewer, never a verdict)`);
    clusters.slice(0, top).forEach((c, i) => {
      console.log(`\n${i + 1}. ${c.skill} - ${c.blocks} blocks, ${c.projects} project(s), max overlap ${c.maxOverlap.toFixed(2)}${c.open ? '' : ' (all members decided)'}`);
      for (const m of c.members) console.log(`   [${m.state}] ${m.block}\n      ${clip(m.text, 200)}`);
    });
    if (clusters.length > top) console.log(`\n(${clusters.length - top} more; --top N to see them)`);
    return EXIT.OK;
  }

  const report = buildReport(lane, ledger);
  if (skillArg) {
    const s = report.skills[skillArg];
    if (json) { console.log(JSON.stringify({ skill: skillArg, ...s }, null, 2)); return EXIT.OK; }
    console.log(`${skillArg} ${s.version ?? '(no version)'} - ${s.blocks} blocks: ${s.counts.open} open, ${s.counts.promoted} promoted, ${s.counts.declined} declined, ${s.counts.superseded} superseded`);
    for (const b of s.detail) {
      console.log(`  [${b.state}] ${b.id}${b.matched ? '' : '  (heading does not match LESSON_HEAD_RE)'}`);
      for (const sb of b.subs) console.log(`      [${sb.state}] #${sb.id.slice(b.id.length + 1)}`);
    }
    return EXIT.OK;
  }
  if (json) { console.log(JSON.stringify(report, null, 2)); return EXIT.OK; }
  const t = report.totals;
  console.log(`Lessons ledger: ${t.blocks} blocks in ${withLessons} LESSONS.md files (${t.matched} match LESSON_HEAD_RE) - ${t.open} open, ${t.promoted} promoted, ${t.declined} declined, ${t.superseded} superseded; ${t.subBlocks} sub-blocks, ${t.proposals} redesign proposals (${t.openProposals} open)${read.missing ? `; no ${LEDGER_REL} yet` : ''}`);
  console.log('');
  console.log('skill                     open  prom  decl  supr  oldest open');
  for (const [name, s] of Object.entries(report.skills)) {
    console.log(`${name.padEnd(25)} ${String(s.counts.open).padStart(4)}  ${String(s.counts.promoted).padStart(4)}  ${String(s.counts.declined).padStart(4)}  ${String(s.counts.superseded).padStart(4)}  ${s.oldestOpen ? clip(s.oldestOpen.id, 70) : '-'}`);
  }
  const open = Object.entries(report.skills).flatMap(([name, s]) => s.openProposals.map((p) => `${name} :: ${p.id}`));
  console.log(`\nOpen redesign proposals (${open.length}):`);
  for (const p of open) console.log(`  ${p}`);
  return EXIT.OK;
}

// Importable for tests; runs only when invoked as the script.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
