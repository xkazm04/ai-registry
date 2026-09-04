#!/usr/bin/env node
// CONTRACT — `docs/subject-proposal-repository-landing-document.md` sources every figure it
// quotes from this instrument, and `.claude/explorer/config.md` names it as the gate to run
// when `docs/`, `README.md` or a workflow changes. Run on demand; it has no scheduled tick.
/**
 * check-readmes — measures every fleet project's landing document against the
 * `repository-landing-document` golden path.
 *
 * A README is the one document in a repository that nobody owns and everybody
 * edits, so it grows until its author stops rather than until it is finished.
 * The failure is invisible by construction: no build goes red, no test fails,
 * and the reader who bounced off it is never in the room. This instrument makes
 * the shape countable so the argument can be about thresholds instead of taste.
 *
 * What it measures per landing document:
 *
 *   words          total prose budget
 *   figures        images, and how many carry a caption (markdown has no
 *                  figcaption, so an uncaptioned figure makes the reader guess)
 *   badges         and how many link to an artifact INSIDE the repository —
 *                  a badge whose link target cannot go red is decoration
 *   callouts       host alert blocks, the only channel that distinguishes
 *                  "say this to an agent" from "run this in a shell"
 *   routing        whether a table routes the reader onward, and how much prose
 *                  lives in the pages it routes to
 *   first screen   whether anything non-prose appears before the fold
 *
 * THE INSTRUMENT IS ASSERTED BEFORE THE RESULT. Every measurement function runs
 * against a built-in fixture with hand-counted answers first; a disagreement is
 * FATAL (exit 2), never a green report over a broken counter. A project the
 * bridge names but whose tree is missing is also fatal — a fleet sweep that
 * silently skips half the fleet is measuring the bridge, not the fleet.
 *
 * NOT checked here, and deliberately: whether the prose is any good, whether the
 * claims are true (that is docs-sync), and whether a figure is STALE — a
 * rendered surface needs its input digest, not a word count
 * (docs-sync/rendered-surface-coupling).
 *
 * Usage:
 *   node scripts/check-readmes.mjs            # report, exit 1 on findings
 *   node scripts/check-readmes.mjs --json     # machine-readable
 *   node scripts/check-readmes.mjs --quiet    # findings only
 *
 * Zero dependencies on purpose.
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadFleet } from './lib/projects.mjs';

// ------------------------------------------------------------- thresholds
// EVERY NUMBER HERE IS READ FROM THE SUBJECT, NEVER INVENTED HERE. A threshold
// that lives only in a script is a standard nobody agreed to and nobody can
// argue with — see repository-landing-document/techniques/visual-text-cadence,
// which states each of these in prose with the measurement it was chosen
// against. Change the subject first, then this block.
const T = {
  // visual-text-cadence: fifteen rendered lines, chosen against a survey of
  // eight landing documents on 2026-09-01 — above the disciplined case (10) and
  // below the worst undisciplined one (39), because a limit everything passes
  // measures nothing.
  proseRunLines: 15,
  // visual-text-cadence: a window approximating one screen; being off by five
  // lines changes nothing.
  firstScreenLines: 30,
};
// landing-document-as-router replaces the tempting word cap with a POPULATION
// test, whose one countable consequence is a ratio: the front page holds fewer
// words than the pages it routes to, added together, both counted by the same
// counter on the same day. There is deliberately no maxWords here — a single
// word count across a library, an application, a plugin and a workspace is a
// number picked from a sample of one.
//
// There is deliberately no minFigures either. The cadence rule asks for a
// non-prose ELEMENT, not an image: a figure, a worked example, a table or a
// callout each satisfy it. An earlier draft of this instrument demanded a
// figure and reported six projects as defective for a rule the subject does
// not make.

// -------------------------------------------------------------- measures
// Each takes the raw markdown and returns a number or a list. Kept pure and
// tiny so the fixture below can pin every one of them.

const stripFences = (md) => md.replace(/```[\s\S]*?```/g, '\n');

const countWords = (md) =>
  stripFences(md).split(/\s+/).filter(Boolean).length;

const findFigures = (md) => {
  const lines = md.split('\n');
  const figures = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/!\[[^\]]*\]\([^)]+\)/.test(lines[i])) continue;
    if (/^\s*\[!\[/.test(lines[i]) || /shields\.io|badge/i.test(lines[i])) continue;
    // A caption is an italic or centered block within two lines below, or the
    // next row of a comparison table.
    const after = lines.slice(i + 1, i + 4).join('\n');
    const captioned = /<i>|<em>|^\s*\*[^*]|\|\s*\*/m.test(after);
    figures.push({ line: i + 1, captioned });
  }
  return figures;
};

const findBadges = (md, repoFiles) => {
  const badges = [];
  const re = /\[!\[[^\]]*\]\(([^)]+)\)\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(md)) !== null) {
    const target = m[2];
    // A badge earns its place when its link target is something in this
    // repository that can go red — a workflow, a manifest, a licence.
    const internal = !/^https?:\/\//.test(target) ||
      repoFiles.some((f) => target.includes(f));
    badges.push({ target, internal });
  }
  return badges;
};

const countCallouts = (md) => (md.match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/gm) || []).length;

const findRoutingTable = (md) => {
  // A routing table is a table whose cells carry relative links to docs.
  const rows = md.split('\n').filter((l) => /^\|/.test(l));
  const targets = [];
  for (const row of rows) {
    for (const m of row.matchAll(/\]\((?!https?:)([^)]+\.md)\)/g)) targets.push(m[1]);
  }
  return targets;
};

// visual-text-cadence, "The closed set of breaks": a break is a figure, a table,
// a fenced block, a callout, or a heading WITH CONTENT UNDER IT. Furniture is not
// a break — a badge row, a horizontal rule, a bare heading immediately followed by
// another heading, a jump bar of links. That clause is where cadence rules are
// usually lost: admit furniture and a forty-line run interrupted by a decorative
// rule scores compliant while reading exactly as badly as before.
const isFurniture = (l) => {
  const t = l.trim();
  if (!t) return false;
  if (/^([-*_]\s*){3,}$/.test(t)) return true;                 // horizontal rule
  if (/^(\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)\s*)+$/.test(t)) return true; // badge row
  if (/^\**\[[^\]]+\]\([^)]+\)\**(\s*[·|]\s*\**\[[^\]]+\]\([^)]+\)\**)+$/.test(t)) return true; // jump bar
  return false;
};

const longestProseRun = (md) => {
  const lines = md.split('\n');
  let run = 0, worst = 0, inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*```/.test(l)) { inFence = !inFence; run = 0; continue; }  // a fenced block breaks
    if (inFence) continue;
    if (isFurniture(l)) continue;                                      // furniture neither breaks nor counts
    const heading = /^#{1,6}\s/.test(l);
    if (heading) {
      // A heading breaks only if content follows it. Find the next meaningful line.
      let j = i + 1;
      while (j < lines.length && (!lines[j].trim() || isFurniture(lines[j]))) j++;
      const bare = j >= lines.length || /^#{1,6}\s/.test(lines[j]);
      if (!bare) run = 0;
      continue;
    }
    if (/^!\[|^\s*\||^>\s*\[!|^\s*<(img|p|div|table)/.test(l)) { run = 0; continue; }
    if (l.trim()) run++;
    if (run > worst) worst = run;
  }
  return worst;
};

// The closed break set, from visual-text-cadence: a figure, a worked example (a
// fenced block), a table, or a callout. Not "an image" — the rule says something
// must be here, not what.
const NON_PROSE = /!\[|^\s*\||^```|^>\s*\[!|<img|<p align|<table/m;

const firstScreenHasVisual = (md) =>
  NON_PROSE.test(md.split('\n').slice(0, T.firstScreenLines).join('\n'));

// ------------------------------------------------- assert the instrument
// Hand-counted fixture. If any of these disagree, the report below is noise.
const FIXTURE = [
  '# Title',
  '',
  '[![CI](https://img.shields.io/badge/ci-passing-green)](.github/workflows/ci.yml)',
  '[![Site](https://img.shields.io/badge/site-up-blue)](https://example.invalid)',
  '',
  '![A hero](docs/hero.png)',
  '<p align="center"><i>What you are looking at.</i></p>',
  '',
  '![Uncaptioned](docs/plain.png)',
  '',
  '> [!TIP]',
  '> say this to an agent',
  '',
  '| Page | What is in it |',
  '|---|---|',
  '| [Install](docs/install.md) | every path |',
  '',
  'prose one',
  'prose two',
].join('\n');

function assertInstrument() {
  const problems = [];
  const check = (label, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want)) {
      problems.push(`${label}: measured ${JSON.stringify(got)}, fixture says ${JSON.stringify(want)}`);
    }
  };
  const figs = findFigures(FIXTURE);
  check('figures found', figs.length, 2);
  check('figures captioned', figs.filter((f) => f.captioned).length, 1);
  const badges = findBadges(FIXTURE, ['.github/workflows/ci.yml']);
  check('badges found', badges.length, 2);
  check('badges internal', badges.filter((b) => b.internal).length, 1);
  check('callouts', countCallouts(FIXTURE), 1);
  check('routing targets', findRoutingTable(FIXTURE), ['docs/install.md']);
  check('first screen has a visual', firstScreenHasVisual(FIXTURE), true);
  // Only "prose one / prose two" is an unbroken run: the badge row is furniture
  // (skipped, not a break), the figures and the table break, and the heading
  // breaks because content follows it.
  check('longest prose run', longestProseRun(FIXTURE), 2);
  check('furniture is not a break', isFurniture('---'), true);
  check('a real paragraph is not furniture', isFurniture('some prose here'), false);
  if (problems.length) {
    console.error('check-readmes: THE INSTRUMENT IS BROKEN - refusing to report.\n');
    for (const p of problems) console.error(`  - ${p}`);
    console.error('\nFix the measurement functions or the fixture. A green report from a');
    console.error('broken counter is worse than no report.');
    process.exit(2);
  }
}

// -------------------------------------------------------------- the sweep
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const quiet = args.includes('--quiet');

assertInstrument();

// `--path <dir>` measures an arbitrary checkout instead of the fleet. It exists so
// a reference repository can be compared against the fleet ON THE SAME COUNTER;
// two numbers from two counters are not a comparison (count-carries-predicate).
const pathIdx = args.indexOf('--path');
const targets = pathIdx !== -1
  ? { [path.basename(args[pathIdx + 1])]: { path: path.resolve(args[pathIdx + 1]), relPath: args[pathIdx + 1], exists: true } }
  : loadFleet().projects;

const results = [];
const fatal = [];

for (const [slug, project] of Object.entries(targets)) {
  if (!project.exists) {
    fatal.push(`${slug}: the bridge names ${project.relPath}, and it is not on this machine`);
    continue;
  }
  const readme = path.join(project.path, 'README.md');
  if (!fs.existsSync(readme)) {
    results.push({ slug, missing: true, findings: ['no README.md at all'] });
    continue;
  }
  const md = fs.readFileSync(readme, 'utf8');
  let repoFiles = [];
  try {
    repoFiles = fs.readdirSync(path.join(project.path, '.github', 'workflows')).map((f) => `workflows/${f}`);
  } catch { /* no workflows directory is not a finding here */ }

  const figures = findFigures(md);
  const badges = findBadges(md, [...repoFiles, 'LICENSE', 'pyproject.toml', 'package.json']);
  const routed = findRoutingTable(md);
  let routedWords = 0;
  for (const target of routed) {
    const p = path.join(project.path, target);
    if (fs.existsSync(p)) routedWords += countWords(fs.readFileSync(p, 'utf8'));
  }

  const m = {
    slug,
    words: countWords(md),
    figures: figures.length,
    captioned: figures.filter((f) => f.captioned).length,
    badges: badges.length,
    badgesWithEvidence: badges.filter((b) => b.internal).length,
    callouts: countCallouts(md),
    routedPages: routed.length,
    routedWords,
    longestProseRun: longestProseRun(md),
    firstScreenVisual: firstScreenHasVisual(md),
  };

  const findings = [];
  if (m.routedPages === 0) {
    findings.push(`${m.words} words and routes nowhere - this is a manual in the shopfront`);
  } else if (m.words >= m.routedWords) {
    findings.push(
      `${m.words} words on the front page vs ${m.routedWords} in the ${m.routedPages} page(s) it routes to - the router holds more than its destinations`,
    );
  }
  if (m.figures > m.captioned) findings.push(`${m.figures - m.captioned} uncaptioned figure(s)`);
  if (m.badges > m.badgesWithEvidence) {
    findings.push(`${m.badges - m.badgesWithEvidence} badge(s) link to nothing that can go red`);
  }
  if (m.longestProseRun > T.proseRunLines) {
    findings.push(`${m.longestProseRun} consecutive prose lines unbroken (budget ${T.proseRunLines})`);
  }
  if (!m.firstScreenVisual) findings.push('nothing but prose above the fold');

  results.push({ ...m, findings });
}

// ------------------------------------------------------------- the report
if (fatal.length) {
  console.error('check-readmes: the fleet could not be swept honestly.\n');
  for (const f of fatal) console.error(`  - ${f}`);
  process.exit(2);
}

if (asJson) {
  console.log(JSON.stringify({ thresholds: T, results }, null, 2));
} else {
  const withFindings = results.filter((r) => r.findings.length);
  if (!quiet) {
    const head = ['project', 'words', 'figs', 'cap', 'badge', 'evid', 'call', 'routed', 'run'];
    console.log(head.map((h, i) => (i ? h.padStart(6) : h.padEnd(12))).join(''));
    for (const r of results) {
      if (r.missing) { console.log(`${r.slug.padEnd(12)}${'- no README -'.padStart(6)}`); continue; }
      console.log([
        r.slug.padEnd(12),
        String(r.words).padStart(6), String(r.figures).padStart(6),
        String(r.captioned).padStart(6), String(r.badges).padStart(6),
        String(r.badgesWithEvidence).padStart(6), String(r.callouts).padStart(6),
        String(r.routedPages).padStart(6), String(r.longestProseRun).padStart(6),
      ].join(''));
    }
    console.log('');
  }
  for (const r of withFindings) {
    console.log(`${r.slug}:`);
    for (const f of r.findings) console.log(`  - ${f}`);
  }
  console.log('');
  console.log(`${results.length} landing document(s) swept, ${withFindings.length} with findings`);
  console.log('NOT checked here: whether the prose is true (docs-sync), whether a figure is stale');
  console.log('  (docs-sync/rendered-surface-coupling - a rendered surface needs its input digest)');
  if (withFindings.length) process.exit(1);
}
