#!/usr/bin/env node
// check-skill-triggers.mjs — tier-2-style trigger & routing lint for the skills lane.
//
// A skill's frontmatter description (plus tags) is its entire trigger surface:
// it is what a harness matches a user's prompt against when deciding which
// skill to surface. Two skills whose trigger vocabularies near-collide tax
// every future routing decision — the measured version of this failure is the
// 2026 skills field study's finding that confusable neighbours degrade
// selection more than pool size does (see agent-memory/procedure-promotion,
// "Selection is the scaling failure").
//
// Pattern adopted from the awesome-llm-apps / addyosmani agent-skills eval
// ladder (tier 2: trigger & routing), reduced to the half that needs no
// per-skill case files: pairwise near-collision detection over descriptions.
// Deterministic, zero-dependency, advisory by default.
//
//   node scripts/check-skill-triggers.mjs            # report, exit 0
//   node scripts/check-skill-triggers.mjs --strict   # exit 1 on any collision >= STRICT_FLOOR
//
// Scans skills/*/SKILL.md (the lane) and .claude/skills/*/SKILL.md (registry
// maintenance skills) — the registry set is included because a consuming
// session may load both, and a collision across the two sets is still a
// routing collision.
//
// IDENTITY IS THE RESOLVED FILE, NOT THE DIRECTORY NAME. A lane skill the
// registry also runs on itself is LINKED in, not copied (scripts/link-registry.mjs),
// so one SKILL.md is reachable from both trees — and the harness loads it once.
// Keyed on the entry name, that file scanned as two skills with byte-identical
// descriptions, which is containment 1.00: this gate reported the registry's own
// distribution mechanism as a routing collision, and --strict failed on it. The
// same-file case is deduped below; scripts/fleet-audit.mjs carries the idiom.
//
// A same NAME backed by two DIFFERENT files is the opposite finding and keeps its
// own verdict: that is a shadow copy of a lane skill, which the lane forbids
// (one home per name) and which no amount of description editing fixes. It is
// reported as SHADOW COPY and does not fail --strict — an install-hygiene defect
// is not a trigger-surface defect, and this gate only blocks on its own subject.

import { readFileSync, readdirSync, existsSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const STRICT = process.argv.includes('--strict');

// Containment of the smaller vocabulary in the larger one. 1.0 = one skill's
// trigger surface is a subset of another's.
const REPORT_FLOOR = Number(process.env.TRIGGER_FLOOR || 0.45); // pairs at/above this are printed
const STRICT_FLOOR = 0.6;  // pairs at/above this fail --strict
const MIN_SHARED = Number(process.env.TRIGGER_MIN_SHARED || 4);

const STOP = new Set(`a an the and or of to in on for with is are was were be been it its
this that those these you your i me my we our they their he she his her do does did done
can could should would will just very really some any all not no yes if then than as at
by from into out up down over under again more most other own same so too when use using
used uses run runs running via one two per each every into onto skill skills agent agents
ai llm code file files repo repository project projects registry`.split(/\s+/));

function tokens(text) {
  const out = new Set();
  for (let w of (text.toLowerCase().match(/[a-z0-9']+/g) || [])) {
    if (STOP.has(w) || w.length < 3) continue;
    for (const suf of ['ing', 'ed', 'es', 's']) {
      if (w.endsWith(suf) && w.length - suf.length >= 3) { w = w.slice(0, -suf.length); break; }
    }
    out.add(w);
  }
  return out;
}

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  let key = null;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (kv) { key = kv[1]; fm[key] = kv[2]; }
    else if (key && /^\s+/.test(line)) fm[key] += ' ' + line.trim();
  }
  return fm;
}

function collect(dir, label) {
  const skills = [];
  if (!existsSync(dir)) return skills;
  for (const entry of readdirSync(dir)) {
    const f = join(dir, entry, 'SKILL.md');
    if (!existsSync(f)) continue;
    // The resolved path is the identity. A link and its target are one skill.
    let real;
    try { real = realpathSync(f); } catch { real = f; }
    const fm = frontmatter(readFileSync(f, 'utf8'));
    const surface = [fm.description || '', fm.tags || '', fm['argument-hint'] || ''].join(' ');
    const toks = tokens(surface);
    skills.push({ name: fm.name || entry, set: label, real, toks, size: toks.size });
  }
  return skills;
}

/** One entry per resolved file. A second location for the same file records only its label. */
function dedupe(all) {
  const byFile = new Map();
  const linked = [];
  for (const s of all) {
    const seen = byFile.get(s.real);
    if (!seen) { byFile.set(s.real, s); continue; }
    seen.alsoIn = s.set;
    linked.push(`${seen.name}: linked, one file in ${seen.set} and ${s.set}`);
  }
  return { skills: [...byFile.values()], linked };
}

/** Same name, different files: a copy shadowing the lane, not a routing collision. */
function shadows(skills) {
  const byName = new Map();
  for (const s of skills) {
    const prev = byName.get(s.name);
    if (prev) prev.push(s); else byName.set(s.name, [s]);
  }
  return [...byName.values()].filter((g) => g.length > 1);
}

const scanned = [...collect(join(ROOT, 'skills'), 'lane'), ...collect(join(ROOT, '.claude', 'skills'), 'registry')];
const { skills, linked } = dedupe(scanned);
const shadowed = shadows(skills);
const shadowNames = new Set(shadowed.map((g) => g[0].name));
if (!skills.length) { console.error('no skills found'); process.exit(2); }

const empty = skills.filter((s) => s.toks.size < 5);
const pairs = [];
for (let i = 0; i < skills.length; i++) {
  for (let j = i + 1; j < skills.length; j++) {
    const a = skills[i], b = skills[j];
    if (!a.toks.size || !b.toks.size) continue;
    let inter = 0;
    for (const t of a.toks) if (b.toks.has(t)) inter++;
    const containment = inter / Math.min(a.toks.size, b.toks.size);
    // A shadow pair is the same skill twice over. Its 1.00 containment says
    // nothing about trigger surfaces, so it is reported below, not here.
    if (a.name === b.name) continue;
    if (containment >= REPORT_FLOOR && inter >= MIN_SHARED) {
      pairs.push({ a, b, inter, containment });
    }
  }
}
pairs.sort((x, y) => y.containment - x.containment);

console.log(`skill-triggers: ${skills.length} skill(s) scanned (${skills.filter(s => s.set === 'lane').length} lane, ${skills.filter(s => s.set === 'registry').length} registry)`);
for (const l of linked) {
  console.log(`  linked      ${l} — one file, counted once`);
}
for (const g of shadowed) {
  const where = g.map((s) => s.set).join(' + ');
  console.log(`  SHADOW COPY: ${g[0].name} exists as ${g.length} separate files (${where}) — the lane's rule is one home per name; link it (scripts/link-registry.mjs), do not copy it`);
}
for (const s of empty) {
  console.log(`  THIN TRIGGER SURFACE: ${s.name} (${s.set}) — ${s.toks.size} content token(s) in description/tags; routing on this is guesswork`);
}
if (!pairs.length) {
  console.log('  no near-collisions at floor ' + REPORT_FLOOR);
} else {
  for (const p of pairs) {
    const shared = [...p.a.toks].filter((t) => p.b.toks.has(t)).slice(0, 8).join(', ');
    const sev = p.containment >= STRICT_FLOOR ? 'COLLISION' : 'near-miss';
    console.log(`  ${sev}  ${p.a.name} (${p.a.set}) <> ${p.b.name} (${p.b.set})  containment ${p.containment.toFixed(2)}, ${p.inter} shared: ${shared}`);
  }
}
console.log('  rule: two skills a selector confuses are one skill with a parameter, or two whose descriptions must name their boundary.');

const hard = pairs.filter((p) => p.containment >= STRICT_FLOOR);
if (STRICT && (hard.length || empty.length)) process.exit(1);
process.exit(0);
