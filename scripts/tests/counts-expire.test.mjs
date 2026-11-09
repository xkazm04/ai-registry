// Counts that expire. A usage or signals report covers the `windowDays` ending at its own
// `generatedAt`. The catalog used to sum a report from August into November's `invokes30d`
// (spark: 6, "usageContributors: [wolf]") and the librarian counted every signals file as a
// reporting installation whatever its age. The rule now lives in lib/currency-clock.mjs
// (reportState): current while the whole-day age is at most windowDays, else stale.
//   - build-catalog measures against the catalog's evidence date, never the clock;
//   - check-currency and librarian-scan measure against an injectable clock (`--as-of`).
// Every fixture date here is compared with an explicit as-of or evidence date, never now.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { reportState, partitionReports } from '../lib/currency-clock.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const node = (args, opts = {}) => spawnSync(process.execPath, args, { encoding: 'utf8', ...opts });

function tempRegistry(t, scripts) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'counts-expire-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(path.join(root, 'scripts/lib'), path.join(dir, 'scripts/lib'), { recursive: true });
  for (const s of scripts) fs.copyFileSync(path.join(root, 'scripts', s), path.join(dir, 'scripts', s));
  fs.mkdirSync(path.join(dir, 'knowledge'));
  fs.mkdirSync(path.join(dir, 'skills'));
  fs.writeFileSync(path.join(dir, 'identity-aliases.json'), JSON.stringify({ schema: 1 }));
  return dir;
}
const writeJson = (dir, rel, doc) => {
  fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
  fs.writeFileSync(path.join(dir, rel), `${JSON.stringify(doc, null, 2)}\n`);
};

// ------------------------------------------------------------------ the rule itself
test('reportState: inclusive boundary on floored whole days', () => {
  const asOf = '2026-10-31T00:00:00Z';
  assert.deepEqual(reportState('2026-10-01T00:00:00Z', 30, asOf), { state: 'current', ageDays: 30 }, 'exactly windowDays old: current');
  assert.deepEqual(reportState('2026-09-30T00:00:01Z', 30, asOf), { state: 'current', ageDays: 30 }, '30 days 23:59:59 floors to 30: current');
  assert.deepEqual(reportState('2026-09-30T00:00:00Z', 30, asOf), { state: 'stale', ageDays: 31 }, '31 whole days: stale');
  assert.deepEqual(reportState('2026-08-22T17:24:57Z', 30, '2026-11-09T00:00:00Z'), { state: 'stale', ageDays: 78 });
});

test('reportState: undatable, windowless or unmeasurable reports are stale, never current', () => {
  assert.equal(reportState(undefined, 30, '2026-10-31').state, 'stale');
  assert.equal(reportState('not a date', 30, '2026-10-31').state, 'stale');
  assert.equal(reportState('2026-10-30T00:00:00Z', undefined, '2026-10-31').state, 'stale');
  assert.equal(reportState('2026-10-30T00:00:00Z', 0, '2026-10-31').state, 'stale');
  assert.deepEqual(reportState('2026-10-30T00:00:00Z', 30, undefined), { state: 'stale', ageDays: null });
  // dated after as-of (clock skew): not older than its window, so current, and not re-dated
  assert.deepEqual(reportState('2026-11-02T00:00:00Z', 30, '2026-10-31T00:00:00Z'), { state: 'current', ageDays: -2 });
});

test('partitionReports keeps order and reports every age', () => {
  const docs = [
    { contributor: 'a', generatedAt: '2026-10-20T00:00:00Z', windowDays: 30 },
    { contributor: 'b', generatedAt: '2026-08-01T00:00:00Z', windowDays: 30 },
  ];
  const { current, stale, ages } = partitionReports(docs, '2026-10-31T00:00:00Z');
  assert.deepEqual(current.map((d) => d.contributor), ['a']);
  assert.deepEqual(stale.map((d) => d.contributor), ['b']);
  assert.deepEqual(ages.map((a) => [a.contributor, a.state, a.ageDays]), [['a', 'current', 11], ['b', 'stale', 91]]);
});

// ------------------------------------------------------------------ build-catalog
// Evidence date = the newest committed instant: a subject changedAt of 2026-10-31.
function catalogRegistry(t, usage) {
  const dir = tempRegistry(t, ['build-catalog.mjs']);
  fs.mkdirSync(path.join(dir, 'skills/demo'));
  fs.writeFileSync(path.join(dir, 'skills/demo/SKILL.md'), '---\nname: demo\nversion: 1.0.0\ndescription: a demo\n---\n\n# Demo\n');
  writeJson(dir, 'knowledge/demo/index.json', { meta: { subjects: 0, techniques: 0, applications: 0 }, subjects: { s0: { file: 'knowledge/demo/s0/s0.md', changedAt: '2026-10-31' } } });
  fs.writeFileSync(path.join(dir, 'catalog.json'), '{}\n');
  for (const [who, generatedAt, invokes] of usage) {
    writeJson(dir, `usage/${who}.json`, { schema: 'rkb-usage/1', contributor: who, app: 'test', generatedAt, windowDays: 30, skills: { demo: { invokes } } });
  }
  return dir;
}
const buildCatalog = (dir, ...args) => node([path.join(dir, 'scripts/build-catalog.mjs'), ...args]);
const readCatalog = (dir) => JSON.parse(fs.readFileSync(path.join(dir, 'catalog.json'), 'utf8'));

test('catalog: only the current report reaches invokes30d and usageContributors; both reach reportedInvokes', (t) => {
  const dir = catalogRegistry(t, [['fresh', '2026-10-20T00:00:00Z', 3], ['old', '2026-08-22T17:24:57Z', 6]]);
  const w = buildCatalog(dir);
  assert.equal(w.status, 0, w.stdout + w.stderr);
  assert.match(w.stdout, /1 stale against 2026-10-31T00:00:00Z/);
  const cat = readCatalog(dir);
  assert.equal(cat.generatedAt, '2026-10-31T00:00:00Z');
  const demo = cat.skills.find((s) => s.name === 'demo');
  assert.equal(demo.invokes30d, 3);
  assert.deepEqual(demo.usageContributors, ['fresh']);
  assert.deepEqual(demo.usageStaleContributors, ['old']);
  assert.equal(demo.reportedInvokes, 9);
  assert.deepEqual(cat.usageEvidence.reports, [
    { contributor: 'fresh', generatedAt: '2026-10-20T00:00:00Z', windowDays: 30, state: 'current', ageDays: 11 },
    { contributor: 'old', generatedAt: '2026-08-22T17:24:57Z', windowDays: 30, state: 'stale', ageDays: 69 },
  ]);
});

test('catalog: a report exactly windowDays before the evidence date is current; one more whole day is stale', (t) => {
  const dir = catalogRegistry(t, [['edge', '2026-10-01T00:00:00Z', 2], ['past', '2026-09-30T00:00:00Z', 5]]);
  assert.equal(buildCatalog(dir).status, 0);
  const cat = readCatalog(dir);
  const demo = cat.skills.find((s) => s.name === 'demo');
  assert.deepEqual(cat.usageEvidence.reports.map((r) => [r.contributor, r.state, r.ageDays]), [['edge', 'current', 30], ['past', 'stale', 31]]);
  assert.equal(demo.invokes30d, 2, 'the boundary report (age == windowDays) is inside');
  assert.deepEqual(demo.usageStaleContributors, ['past']);
});

test('catalog: a skill nobody reports on has empty contributor lists, both always present', (t) => {
  const dir = catalogRegistry(t, []);
  assert.equal(buildCatalog(dir).status, 0);
  const demo = readCatalog(dir).skills.find((s) => s.name === 'demo');
  assert.equal(demo.invokes30d, 0);
  assert.deepEqual(demo.usageContributors, []);
  assert.deepEqual(demo.usageStaleContributors, []);
});

test('catalog: the verdict does not depend on the wall clock (--check under a clock five years ahead)', (t) => {
  const dir = catalogRegistry(t, [['fresh', '2026-10-20T00:00:00Z', 3], ['old', '2026-08-22T17:24:57Z', 6]]);
  assert.equal(buildCatalog(dir).status, 0);
  const built = fs.readFileSync(path.join(dir, 'catalog.json'), 'utf8');
  // A preload that moves every `Date.now()` and `new Date()` to 2031.
  const fake = path.join(dir, 'fake-clock.mjs');
  fs.writeFileSync(fake, [
    'const Real = Date;',
    "const OFFSET = Real.parse('2031-06-01T00:00:00Z') - Real.now();",
    'class Shifted extends Real {',
    '  constructor(...a) { if (a.length === 0) super(Real.now() + OFFSET); else super(...a); }',
    '  static now() { return Real.now() + OFFSET; }',
    '}',
    'globalThis.Date = Shifted;',
    '',
  ].join('\n'));
  const preload = ['--import', pathToFileURL(fake).href];
  // control: the preload really moves the clock
  const year = node([...preload, '-e', 'console.log(new Date().getUTCFullYear(), new Date(Date.now()).getUTCFullYear())']);
  assert.equal(year.stdout.trim(), '2031 2031', year.stderr);
  const check = node([...preload, path.join(dir, 'scripts/build-catalog.mjs'), '--check']);
  assert.equal(check.status, 0, check.stdout + check.stderr);
  const rewrite = node([...preload, path.join(dir, 'scripts/build-catalog.mjs')]);
  assert.equal(rewrite.status, 0, rewrite.stdout + rewrite.stderr);
  assert.equal(fs.readFileSync(path.join(dir, 'catalog.json'), 'utf8'), built, 'a rebuild in 2031 writes the same bytes');
});

// ------------------------------------------------------------------ signals readers
// Two bundles: `demo` reported by a fresh contributor, `other` only by a stale one.
function signalsRegistry(t, script) {
  const dir = tempRegistry(t, [script]);
  fs.mkdirSync(path.join(dir, 'librarian'));
  fs.writeFileSync(path.join(dir, 'librarian/standard.md'), fs.readFileSync(path.join(root, 'librarian/standard.md'), 'utf8').replace(/\r\n/g, '\n'));
  for (const [domain, slug] of [['demo', 'alpha'], ['other', 'beta']]) {
    const subj = path.join(dir, 'knowledge', domain, slug);
    fs.mkdirSync(path.join(subj, 'techniques'), { recursive: true });
    fs.mkdirSync(path.join(subj, 'applications'), { recursive: true });
    writeJson(dir, `knowledge/${domain}/index.json`, { subjects: { [slug]: { file: `knowledge/${domain}/${slug}/${slug}.md` } } });
    fs.writeFileSync(path.join(subj, `${slug}.md`), `---\nslug: ${slug}\nstatus: forged\n---\nbody\n`);
    fs.writeFileSync(path.join(subj, 'techniques', 't1.md'), '---\nuse_when: [a case]\n---\nbody\n');
    fs.writeFileSync(path.join(subj, 'applications', 'node--a.md'), '---\nstack: node\nverified_on: 2026-10-01\n---\nbody\n');
  }
  const signals = (who, generatedAt, domain, slug) => writeJson(dir, `signals/${who}.json`, {
    schema: 'rkb-signals/1', contributor: who, app: 'test', generatedAt, windowDays: 30, stack: { node: 24 },
    bundles: { [domain]: { consults: { [slug]: 4 } } },
  });
  signals('fresh', '2026-10-14T18:25:22Z', 'demo', 'alpha');
  signals('old', '2026-08-30T10:40:43Z', 'other', 'beta');
  return dir;
}
const AS_OF = '2026-11-09';

test('librarian-scan: a fresh contributor counts, a stale one is set aside, its bundle reads unknown', (t) => {
  const dir = signalsRegistry(t, 'librarian-scan.mjs');
  const script = path.join(dir, 'scripts/librarian-scan.mjs');
  const j = node([script, '--json', '--as-of', AS_OF]);
  assert.equal(j.status, 0, j.stderr);
  const doc = JSON.parse(j.stdout);
  assert.equal(doc.asOf, AS_OF);
  assert.equal(doc.contributors, 1);
  assert.equal(doc.contributorsStale, 1);
  assert.deepEqual(doc.contributorAges.map((a) => [a.contributor, a.state, a.ageDays]), [['fresh', 'current', 25], ['old', 'stale', 70]]);
  const known = Object.fromEntries(doc.domains.map((d) => [d.domain, d.demandKnown]));
  assert.deepEqual(known, { demo: true, other: false });
  assert.equal(doc.subjects.find((s) => s.id === 'other/beta').demand ?? null, null, 'no demand scored from the stale report');

  const h = node([script, '--as-of', AS_OF]);
  assert.equal(h.status, 0, h.stderr);
  assert.match(h.stdout, /1 reporting installation\(s\) \(1 set aside as stale\)/);
  assert.match(h.stdout, /signals: fresh 25d current \(window 30d/);
  assert.match(h.stdout, /signals: old 70d stale \(window 30d/);

  // The same tree a month earlier: both are current. The clock decides, not the fixture.
  const early = JSON.parse(node([script, '--json', '--as-of', '2026-09-15']).stdout);
  assert.equal(early.contributors, 2);
  assert.equal(early.contributorsStale, 0);
});

test('check-currency: a fresh contributor witnesses, a stale one is set aside and its bundle reads unknown', (t) => {
  const dir = signalsRegistry(t, 'check-currency.mjs');
  const script = path.join(dir, 'scripts/check-currency.mjs');
  const j = node([script, '--json', '--as-of', AS_OF]);
  assert.equal(j.status, 0, j.stderr);
  const doc = JSON.parse(j.stdout);
  assert.equal(doc.asOf, AS_OF);
  assert.equal(doc.today, AS_OF);
  assert.equal(doc.totals.contributors, 1);
  assert.equal(doc.totals.contributorsStale, 1);
  assert.deepEqual(doc.contributorAges.map((a) => [a.contributor, a.state, a.ageDays]), [['fresh', 'current', 25], ['old', 'stale', 70]]);
  assert.deepEqual(Object.fromEntries(doc.domains.map((d) => [d.domain, d.witness])), { demo: 'reported', other: 'unknown' });

  const h = node([script, '--as-of', AS_OF]);
  assert.equal(h.status, 0, h.stderr);
  assert.match(h.stdout, /1 reporting installation\(s\) \(1 set aside as stale\)/);
  assert.match(h.stdout, /signals: fresh 25d current/);
  assert.match(h.stdout, /signals: old 70d stale/);
  assert.match(h.stdout, /UNWITNESSED[^\n]*\n[^\n]*\n\s+other\b/);
  // A stale report is a truth to state, not a build to break: even --fail-on-expired stays
  // green when nothing has expired (the fixture's node clocks run to 2027).
  assert.equal(node([script, '--fail-on-expired', '--as-of', AS_OF]).status, 0);
});

test('both instruments refuse a malformed --as-of instead of falling back to now', (t) => {
  for (const script of ['librarian-scan.mjs', 'check-currency.mjs']) {
    const dir = signalsRegistry(t, script);
    for (const args of [['--as-of'], ['--as-of', 'yesterday']]) {
      const r = node([path.join(dir, 'scripts', script), ...args]);
      assert.equal(r.status, 2, `${script} ${args.join(' ')}: ${r.stdout.slice(0, 200)}`);
    }
  }
});

// ------------------------------------------------------------------ closed flag sets
test('check-usage and check-signals refuse an unknown flag (2) instead of passing as a clean gate', () => {
  for (const script of ['check-usage.mjs', 'check-signals.mjs']) {
    const s = path.join(root, 'scripts', script);
    for (const args of [['--chekc'], ['--root']]) {
      const r = node([s, ...args]);
      assert.equal(r.status, 2, `${script} ${args.join(' ')}: ${r.stdout.slice(0, 200)}`);
    }
    const bad = node([s, '--chekc']);
    assert.match(bad.stderr, /unknown argument "--chekc"/);
    const help = node([s, '--help']);
    assert.equal(help.status, 0);
    assert.match(help.stdout, /usage: node scripts\//);
  }
});
