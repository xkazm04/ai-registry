// lessons-ledger: ids are stable, the gate goes red for each defect class it exists for,
// and the repeats report clusters reworded bullets across blocks but not within one.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  parseLessons, readLessonsLane, checkLedger, buildReport, findRepeats, skillText, recordedVersion, contentWords, LEDGER_REL,
} from '../lessons-ledger.mjs';
import { LESSON_HEAD_RE } from '../lib/skills-lane.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SCRIPT = path.join(ROOT, 'scripts', 'lessons-ledger.mjs');
const TEMP = fs.realpathSync(os.tmpdir());

const SKILL = `---
name: demo
description: "A demo skill."
category: other
memory: none
version: 1.4.0
---

# Demo

Always measure the gate before you trust its silence.
`;
const LESSONS = `# Lessons - demo

## 1.0.0 - 2026-09-01 - alpha
- The builder trusted a green gate that never ran on the touched paths at all.
- Unrelated observation about latency budgets in the export pipeline today.

## 1.1.0 - 2026-09-05 - beta
- Again the builder trusted a green gate that never ran on its touched paths.

### Redesign proposal
Make the gate print the paths it covered.

## 1.1.0 - 2026-09-05 - beta
- A second block under the same heading, from a second run that day.
`;

function fixture(t, { skill = SKILL, lessons = LESSONS, ledger = null, refs = null } = {}) {
  const root = fs.mkdtempSync(path.join(TEMP, 'lessons-ledger-test-'));
  t.after(() => {
    const rel = path.relative(TEMP, fs.realpathSync(root));
    if (!rel.startsWith('lessons-ledger-test-') || rel.includes(path.sep)) throw new Error('unsafe cleanup');
    fs.rmSync(root, { recursive: true, force: true });
  });
  const dir = path.join(root, 'skills', 'demo');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'SKILL.md'), skill);
  fs.writeFileSync(path.join(dir, 'LESSONS.md'), lessons);
  if (refs) { fs.mkdirSync(path.join(dir, 'references')); fs.writeFileSync(path.join(dir, 'references', 'more.md'), refs); }
  if (ledger) {
    fs.mkdirSync(path.join(root, 'librarian', 'skills'), { recursive: true });
    fs.writeFileSync(path.join(root, LEDGER_REL), typeof ledger === 'string' ? ledger : JSON.stringify(ledger, null, 2));
  }
  const run = (...args) => spawnSync(process.execPath, [SCRIPT, '--root', root, ...args], { encoding: 'utf8' });
  return { root, dir, run };
}
const ledgerOf = (entries) => ({ schema: 'lessons-ledger/1', skills: { demo: entries } });
const check = (root) => {
  const lane = readLessonsLane(root);
  const ledger = JSON.parse(fs.readFileSync(path.join(root, LEDGER_REL), 'utf8'));
  return checkLedger(ledger, lane, (s) => skillText(lane.skills[s].dir));
};
const GOOD = {
  '1.0.0 - 2026-09-01 - alpha': { state: 'promoted', version: '1.2.0', anchor: 'measure the gate before you trust its silence' },
};

// ------------------------------------------------------------------ ids

test('a repeated heading gets distinct ids, and sub-blocks are addressable under their block', () => {
  const ids = parseLessons(LESSONS).flatMap((b) => [b.id, ...b.subs.map((s) => s.id)]);
  assert.deepEqual(ids, [
    '1.0.0 - 2026-09-01 - alpha',
    '1.1.0 - 2026-09-05 - beta',
    '1.1.0 - 2026-09-05 - beta#Redesign proposal',
    '1.1.0 - 2026-09-05 - beta [2]',
  ]);
});

test('appending a block changes no existing id, even when it repeats a heading', () => {
  const before = parseLessons(LESSONS).map((b) => b.id);
  const after = parseLessons(`${LESSONS}\n## 1.1.0 - 2026-09-05 - beta\n- third.\n\n## 1.2.0 - 2026-09-09 - gamma\n- new.\n`).map((b) => b.id);
  assert.deepEqual(after.slice(0, before.length), before);
  assert.deepEqual(after.slice(before.length), ['1.1.0 - 2026-09-05 - beta [3]', '1.2.0 - 2026-09-09 - gamma']);
});

test('CRLF files parse to the same ids and bullets', () => {
  const lf = parseLessons(LESSONS);
  const crlf = parseLessons(LESSONS.replace(/\n/g, '\r\n'));
  assert.deepEqual(crlf.map((b) => [b.id, b.bullets]), lf.map((b) => [b.id, b.bullets]));
});

test('the recorded version is the lowest version the heading slot names', () => {
  assert.deepEqual(recordedVersion('1.0'), [1, 0, 0]);
  assert.deepEqual(recordedVersion('0.1-1.0'), [0, 1, 0]);
  assert.equal(recordedVersion('v-unversioned'), null);
});

// ------------------------------------------------------------------ the gate

test('control: a well-formed ledger over the fixture is green, by function and by CLI', (t) => {
  const { root, run } = fixture(t, { ledger: ledgerOf(GOOD) });
  assert.deepEqual(check(root), []);
  const r = run('--check');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /OK - 1 ledger entry/);
});

test('no ledger file is green: every lesson is open', (t) => {
  const { run } = fixture(t);
  const r = run('--check');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /every lesson is open/);
});

test('red: an orphan key (no such block) and an orphan skill', (t) => {
  const { root, run } = fixture(t, { ledger: { schema: 'lessons-ledger/1', skills: { demo: { ...GOOD, '9.9.9 - 2026-01-01 - nowhere': { state: 'superseded', by: '1.0.0' } }, ghost: {} } } });
  const v = check(root);
  assert.ok(v.some((x) => /9\.9\.9 .*orphan key/.test(x)), v.join('\n'));
  assert.ok(v.some((x) => /ghost: no such skill/.test(x)), v.join('\n'));
  assert.equal(run('--check').status, 1);
});

test('red: a malformed state, a missing field and a field foreign to the state', (t) => {
  const { root } = fixture(t, {
    ledger: ledgerOf({
      '1.0.0 - 2026-09-01 - alpha': { state: 'open' },
      '1.1.0 - 2026-09-05 - beta': { state: 'declined', date: '2026-13-45' },
      '1.1.0 - 2026-09-05 - beta [2]': { state: 'superseded', by: '1.1.0 - 2026-09-05 - beta', anchor: 'stray field here' },
    }),
  });
  const v = check(root).join('\n');
  assert.match(v, /alpha: state must be one of/);
  assert.match(v, /beta: declined needs "reason"/);
  assert.match(v, /beta: date "2026-13-45" is not YYYY-MM-DD/);
  assert.match(v, /beta \[2\]: field "anchor" is not part of a superseded entry/);
});

test('red: a promoted version below the recorded one, and above the current skill version', (t) => {
  const { root } = fixture(t, {
    ledger: ledgerOf({
      '1.1.0 - 2026-09-05 - beta': { state: 'promoted', version: '1.0.5', anchor: 'measure the gate before you trust its silence' },
      '1.0.0 - 2026-09-01 - alpha': { state: 'promoted', version: '2.0.0', anchor: 'measure the gate before you trust its silence' },
    }),
  });
  const v = check(root).join('\n');
  assert.match(v, /beta: promoted in 1\.0\.5, below the version the lesson was recorded against \(1\.1\.0\)/);
  assert.match(v, /alpha: promoted in 2\.0\.0, above the skill's current version 1\.4\.0/);
});

test('red: an anchor that has left the skill text is the regression the gate exists for', (t) => {
  const { root, dir, run } = fixture(t, { ledger: ledgerOf(GOOD) });
  assert.equal(run('--check').status, 0);
  fs.writeFileSync(path.join(dir, 'SKILL.md'), SKILL.replace('Always measure the gate before you trust its silence.', 'Trust the gate.'));
  const r = run('--check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /anchor "measure the gate before you trust its silence" no longer occurs .* dropped a rule this lesson paid for/);
});

test('an anchor may live in references/, and line wrapping does not break it', (t) => {
  const { root } = fixture(t, {
    refs: 'When the gate prints nothing,\n   ask it which paths it covered.\n',
    ledger: ledgerOf({ '1.1.0 - 2026-09-05 - beta#Redesign proposal': { state: 'promoted', version: '1.4.0', anchor: 'ask it which paths it covered' } }),
  });
  assert.deepEqual(check(root), []);
  const wrapped = fixture(t, { ledger: ledgerOf({ '1.0.0 - 2026-09-01 - alpha': { state: 'promoted', version: '1.4.0', anchor: 'When the gate prints nothing, ask it' } }), refs: 'When the gate prints nothing,\n   ask it which paths it covered.\n' });
  assert.deepEqual(check(wrapped.root), []);
});

test('red: a trivially short anchor guards nothing', (t) => {
  const { root } = fixture(t, { ledger: ledgerOf({ '1.0.0 - 2026-09-01 - alpha': { state: 'promoted', version: '1.4.0', anchor: 'the gate' } }) });
  assert.match(check(root).join('\n'), /at least 16 characters/);
});

test('superseded: by a later lesson or a version; never by itself, an unknown id or an earlier lesson', (t) => {
  const ok = fixture(t, { ledger: ledgerOf({ '1.0.0 - 2026-09-01 - alpha': { state: 'superseded', by: '1.1.0 - 2026-09-05 - beta' }, '1.1.0 - 2026-09-05 - beta [2]': { state: 'superseded', by: '1.3.0' } }) });
  assert.deepEqual(check(ok.root), []);
  const bad = fixture(t, {
    ledger: ledgerOf({
      '1.1.0 - 2026-09-05 - beta': { state: 'superseded', by: '1.0.0 - 2026-09-01 - alpha' },
      '1.1.0 - 2026-09-05 - beta [2]': { state: 'superseded', by: '1.1.0 - 2026-09-05 - beta [2]' },
      '1.0.0 - 2026-09-01 - alpha': { state: 'superseded', by: 'some later thing' },
    }),
  });
  const v = check(bad.root).join('\n');
  assert.match(v, /beta: superseded by .*alpha", which is dated before it/);
  assert.match(v, /cannot supersede itself/);
  assert.match(v, /neither a lesson id in this skill nor a MAJOR\.MINOR\.PATCH version/);
});

test('an unparseable ledger is a violation under --check and could-not-run for a report', (t) => {
  const { run } = fixture(t, { ledger: '{ "schema": ' });
  assert.equal(run('--check').status, 1);
  assert.equal(run().status, 2);
});

test('could not run: no skills lane, no LESSONS.md anywhere, an unknown --skill, a bad flag', (t) => {
  const empty = fs.mkdtempSync(path.join(TEMP, 'lessons-ledger-test-'));
  t.after(() => fs.rmSync(empty, { recursive: true, force: true }));
  assert.equal(spawnSync(process.execPath, [SCRIPT, '--root', empty, '--check'], { encoding: 'utf8' }).status, 2);
  fs.mkdirSync(path.join(empty, 'skills', 'bare'), { recursive: true });
  fs.writeFileSync(path.join(empty, 'skills', 'bare', 'SKILL.md'), SKILL);
  const r = spawnSync(process.execPath, [SCRIPT, '--root', empty, '--check'], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /reporting nothing is not finding nothing/);
  const { run } = fixture(t);
  assert.equal(run('--skill', 'nope').status, 2);
  assert.equal(run('--bogus').status, 2);
});

// ------------------------------------------------------------------ report

test('report: counts by state, oldest open block, open proposals', (t) => {
  const { root, run } = fixture(t, { ledger: ledgerOf(GOOD) });
  const report = buildReport(readLessonsLane(root), JSON.parse(fs.readFileSync(path.join(root, LEDGER_REL), 'utf8')));
  const s = report.skills.demo;
  assert.deepEqual(s.counts, { open: 2, promoted: 1, declined: 0, superseded: 0 });
  assert.equal(s.oldestOpen.id, '1.1.0 - 2026-09-05 - beta');
  assert.deepEqual(s.openProposals.map((p) => p.id), ['1.1.0 - 2026-09-05 - beta#Redesign proposal']);
  const r = run('--skill', 'demo');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /\[promoted\] 1\.0\.0 - 2026-09-01 - alpha/);
  assert.match(r.stdout, /\[open\] #Redesign proposal/);
  assert.equal(JSON.parse(run('--json').stdout).totals.blocks, 3);
});

test('real lane: the report counts exactly the headings LESSON_HEAD_RE counts', () => {
  const lane = readLessonsLane(ROOT);
  let headings = 0;
  let matched = 0;
  for (const s of Object.values(lane.skills)) {
    if (!s.hasLessons) continue;
    const raw = fs.readFileSync(path.join(s.dir, 'LESSONS.md'), 'utf8');
    for (const l of raw.split(/\r?\n/)) if (l.startsWith('## ')) { headings++; if (LESSON_HEAD_RE.test(l)) matched++; }
  }
  const { totals } = buildReport(lane, { schema: 'lessons-ledger/1', skills: {} });
  assert.ok(headings > 0);
  assert.equal(totals.blocks, headings);
  assert.equal(totals.matched, matched);
});

// ------------------------------------------------------------------ repeats

test('repeats: reworded bullets from different blocks cluster; one block never clusters with itself', (t) => {
  const { root } = fixture(t);
  const clusters = findRepeats(readLessonsLane(root), {});
  assert.equal(clusters.length, 1);
  assert.deepEqual(clusters[0].members.map((m) => m.block), ['1.0.0 - 2026-09-01 - alpha', '1.1.0 - 2026-09-05 - beta']);
  const same = fixture(t, { lessons: '## 1.0.0 - 2026-09-01 - alpha\n- The builder trusted a green gate that never ran on the touched paths at all.\n- Again the builder trusted a green gate that never ran on its touched paths.\n' });
  assert.equal(findRepeats(readLessonsLane(same.root), {}).length, 0);
});

test('repeats: a measurement line is not a lesson, and a decided cluster sorts after an open one', (t) => {
  assert.equal(contentWords('Cost and wall: opus@xhigh 29 min / $8.26 / 56 turns; grok 36 min / $1.42 / 58 turns'), null);
  assert.equal(contentWords('| Round | Seat | Wall | Turns |'), null);
  assert.ok(contentWords('The builder trusted a green gate that never ran on the touched paths.'));
  const lessons = `${LESSONS}\n## 1.2.0 - 2026-09-09 - gamma\n- Sandbox flag wrong again: codex seat thinks and never writes on windows hosts.\n\n## 1.3.0 - 2026-09-10 - delta\n- Sandbox flag still wrong: codex seat thinks and never writes on windows.\n`;
  const { root } = fixture(t, { lessons });
  const ledger = { schema: 'lessons-ledger/1', skills: { demo: { '1.0.0 - 2026-09-01 - alpha': { state: 'declined', reason: 'x', date: '2026-09-02' }, '1.1.0 - 2026-09-05 - beta': { state: 'declined', reason: 'x', date: '2026-09-06' } } } };
  const clusters = findRepeats(readLessonsLane(root), ledger);
  assert.equal(clusters.length, 2);
  assert.equal(clusters[0].open, true);
  assert.equal(clusters[1].open, false);
});
