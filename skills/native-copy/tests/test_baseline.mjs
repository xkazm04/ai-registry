// Deterministic tests for the ratchet, changed-string diffing, the contract and --init.
//
// `node --test "skills/native-copy/tests/*.mjs"` - builtins only. The CLI cases run the
// real script against a temporary directory (never a project tree).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { fingerprint, sha1, buildBaseline, applyBaseline, changedRecords } from '../scripts/lib/baseline.mjs';
import { extractJson, makeRecord } from '../scripts/lib/extract.mjs';
import { normalizeContract, contractFor } from '../scripts/lib/contract.mjs';
import { RULE_IDS } from '../scripts/lib/rules.mjs';
import { countConventions, proposeContract } from '../scripts/lib/init.mjs';

const f = (rule, key, raw, severity = 'error', file = 'messages/en.json') => ({ rule, key, raw, text: raw, severity, file });

test('fingerprint is rule|file|key|sha1(raw text)', () => {
  assert.equal(fingerprint(f('EN-DASH', 'a.b', 'x')), `EN-DASH|messages/en.json|a.b|${sha1('x')}`);
  assert.equal(sha1('x').length, 40);
});

test('baseline: dedupes and sorts; only error findings outside it are new', () => {
  const findings = [f('EN-DASH', 'b', 'two'), f('EN-DASH', 'a', 'one'), f('EN-DASH', 'a', 'one')];
  const b = buildBaseline(findings);
  assert.equal(b.count, 2);
  assert.deepEqual(b.fingerprints, [...b.fingerprints].sort());
  const now = [f('EN-DASH', 'a', 'one'), f('EN-LATIN', 'c', 'e.g. three', 'warn'), f('EN-SPELLING', 'd', 'colour')];
  const r = applyBaseline(now, b);
  assert.equal(r.newErrors, 1);
  assert.equal(r.resolved, 1);
  assert.deepEqual(now.map((x) => x.baselined), [true, false, false]);
});

test('baseline: a same-count swap is caught (a count bucket would hide it)', () => {
  const b = buildBaseline([f('EN-DASH', 'hero.a', 'Fast — cheap')]);
  const now = [f('EN-DASH', 'hero.b', 'Good — fair')];
  const r = applyBaseline(now, b);
  assert.equal(r.newErrors, 1);
  assert.equal(r.resolved, 1);
});

test('baseline: editing the text of a baselined string makes its finding new', () => {
  const b = buildBaseline([f('EN-DASH', 'hero.a', 'Fast — cheap')]);
  assert.equal(applyBaseline([f('EN-DASH', 'hero.a', 'Fast — and cheap')], b).newErrors, 1);
});

test('no baseline: every error is new', () => {
  assert.equal(applyBaseline([f('EN-DASH', 'a', 'x'), f('EN-LATIN', 'b', 'y', 'warn')], null).newErrors, 1);
});

test('changed keys: two in-memory JSON versions yield exactly the edited and added keys', () => {
  const base = JSON.stringify({ a: 'Hello there', b: { c: ['first line', 'second line'] }, e: 'Removed later' }, null, 2);
  const cur = JSON.stringify({ a: 'Hello there', b: { c: ['first line', 'second line, edited'] }, d: 'Brand new string' }, null, 2);
  const changed = changedRecords(extractJson(cur, 'en.json'), extractJson(base, 'en.json'));
  assert.deepEqual(changed.map((r) => r.key), ['b.c[1]', 'd']);
});

test('changed keys: a moved key with the same value is a change of key, unchanged file yields none', () => {
  const base = JSON.stringify({ a: { title: 'Pricing' } });
  const cur = JSON.stringify({ b: { title: 'Pricing' } });
  assert.deepEqual(changedRecords(extractJson(cur, 'x'), extractJson(base, 'x')).map((r) => r.key), ['b.title']);
  assert.equal(changedRecords(extractJson(base, 'x'), extractJson(base, 'x')).length, 0);
});

test('changed keyless strings compare as a multiset', () => {
  const r = (t) => makeRecord('x.tsx', 1, '<p>', t);
  assert.equal(changedRecords([r('Same text'), r('Same text')], [r('Same text')]).length, 1);
});

// ------------------------------------------------------------------ contract

test('contract: defaults for undeclared mechanics are "any"; variant and sources are required', () => {
  const { contract, errors } = normalizeContract({ variant: 'UK', sources: [{ path: 'messages/en.json', kind: 'json-catalog' }], _notes: ['ignored'] }, { knownRules: RULE_IDS });
  assert.deepEqual(errors, []);
  assert.equal(contract.quotes, 'any');
  assert.equal(contract.ellipsis, 'any');
  assert.equal(contract.case.style, 'any');
  assert.equal(contract.dash.emDash, 'density');
  assert.equal(contract.baseline, '.ai/copy-baseline.json');
  assert.ok(contract.case.headingKeys.test('heroTitle1'));
  assert.ok(!contract.case.headingKeys.test('subtitle'));
  const bad = normalizeContract({ sources: [{ path: 'x', kind: 'yaml' }], quote: 'curly', rules: { 'EN-NOPE': 'error', 'EN-LATIN': 'block' }, case: { headingKeys: '(' } }, { knownRules: RULE_IDS });
  const joined = bad.errors.join('\n');
  for (const needle of ['variant is required', 'sources[0].kind', 'unknown top-level key "quote"', 'rules.EN-NOPE', 'rules.EN-LATIN', 'case.headingKeys']) assert.ok(joined.includes(needle), `missing error: ${needle}\n${joined}`);
});

// ------------------------------------------------------------------ init

test('init counts, never guesses: mixed spelling is reported as mixed, zero em dashes proposes a ban', () => {
  const recs = [
    makeRecord('en.json', 1, 'a.body', 'Optimize the color of your catalog.'),
    makeRecord('en.json', 2, 'b.body', 'Analyse the colour mix.'),
    makeRecord('en.json', 3, 'c.title', 'Browse By Category Now'),
    makeRecord('en.json', 4, 'd.title', 'Browse by category now'),
    makeRecord('en.json', 5, 'e.title', 'Pick A Better Plan'),
  ];
  const counts = countConventions(recs, contractFor());
  assert.equal(counts.usSpelling, 3);
  assert.equal(counts.ukSpelling, 2);
  assert.equal(counts.headingsJudged, 3);
  assert.equal(counts.titleCaseHeadings, 2);
  const p = proposeContract(counts, [{ path: 'messages/en.json', kind: 'json-catalog' }]);
  assert.equal(p.variant, 'US');
  assert.equal(p.dash.emDash, 'ban');
  assert.equal(p.case.style, 'title');
  assert.ok(p._notes.some((n) => /MIXED/.test(n)));
  assert.deepEqual(normalizeContract(p, { knownRules: RULE_IDS }).errors, [], 'the proposal must validate as written');
});

// ------------------------------------------------------------------ CLI end to end (temp dir)

const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'copy-check.mjs');
const run = (cwd, ...args) => spawnSync(process.execPath, [CLI, '--root', cwd, ...args], { encoding: 'utf8' });

test('CLI: exit 1 on new errors, baseline write, exit 0 against the baseline, exit 1 on a new one, exit 2 on config failure', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'native-copy-cli-'));
  try {
    fs.mkdirSync(path.join(dir, 'docs', 'i18n'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'messages'), { recursive: true });
    const contract = { variant: 'US', sources: [{ path: 'messages/en.json', kind: 'json-catalog' }], dash: { emDash: 'ban' } };
    fs.writeFileSync(path.join(dir, 'docs', 'i18n', 'copy-contract.json'), JSON.stringify(contract));
    const catalog = { hero: { title: 'Hiring, done right', lines: ['Fast — and fair', 'Plain line'] } };
    fs.writeFileSync(path.join(dir, 'messages', 'en.json'), JSON.stringify(catalog, null, 2));

    let r = run(dir);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /checked 3 strings \(3 fragments\) in 1 files from 1 sources; 0 unreadable; errors 1 \(new 1\), warnings 0/);
    assert.match(r.stdout, /hero\.lines\[0\] — EN-DASH/);

    r = run(dir, '--baseline', 'write');
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.ok(fs.existsSync(path.join(dir, '.ai', 'copy-baseline.json')));

    r = run(dir);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /errors 1 \(new 0\)/);

    catalog.hero.title = 'Hiring — done right';
    fs.writeFileSync(path.join(dir, 'messages', 'en.json'), JSON.stringify(catalog, null, 2));
    r = run(dir, '--json');
    assert.equal(r.status, 1);
    const out = JSON.parse(r.stdout);
    assert.equal(out.summary.newErrors, 1);
    assert.equal(out.findings.find((x) => !x.baselined).key, 'hero.title');

    fs.writeFileSync(path.join(dir, 'docs', 'i18n', 'copy-contract.json'), JSON.stringify({ ...contract, variant: 'AU' }));
    r = run(dir);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /config failure: .*variant must be one of/s);

    fs.rmSync(path.join(dir, 'docs'), { recursive: true });
    r = run(dir);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /no contract at/);

    r = run(dir, '--init');
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /proposal only - nothing written/);
    assert.ok(!fs.existsSync(path.join(dir, 'docs', 'i18n', 'copy-contract.json')));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
