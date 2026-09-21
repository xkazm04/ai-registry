// The rule catalog as data: metadata shape, examples-as-tests for EVERY rule (the enumerating
// ratchet), the compatibility pins the fleet's baselines depend on, one span one finding,
// temp_off, anchors, and the generated references/rules.md.
//
// `node --test "skills/native-copy/tests/*.mjs"` - builtins only.
// A rule added without a positive fixture and a negative control fails here, by enumeration,
// not by someone remembering to write its test.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RULES, RULE_KINDS, INCLUSIVE_SEED, lintRecords, resolveOverlaps } from '../scripts/lib/rules.mjs';
import { makeRecord } from '../scripts/lib/extract.mjs';
import { contractFor, normalizeContract, keyClassOf } from '../scripts/lib/contract.mjs';
import { rulesMarkdown } from '../scripts/lib/report.mjs';
import { occurrences } from '../scripts/lib/span.mjs';

const SKILL = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Run one example ({ text, key?, tag?, contract? } or a string) and return findings of `ruleId`. */
function run(ruleId, example) {
  const e = typeof example === 'string' ? { text: example } : example;
  const rec = makeRecord('en.json', 1, e.key ?? 'page.body', e.text, { tag: e.tag ?? null });
  return lintRecords([rec], contractFor(e.contract ?? {})).filter((f) => f.rule === ruleId);
}
const label = (e) => (typeof e === 'string' ? e : JSON.stringify(e));

// The 26 rules the fleet's baselines were written against, with their shipped severity. A change
// here changes which findings are errors in eight projects' ratchets: it is never incidental.
const PINNED = {
  'EN-ARTIFACT': 'error', 'EN-SPELLING': 'error', 'EN-DASH': 'error', 'EN-SPACING': 'error', 'EN-SOURCE-RESIDUE': 'error', 'EN-COUNTABLE': 'error',
  'EN-COMPLEMENT': 'warn', 'EN-CONDITIONAL': 'warn', 'EN-PERFECT': 'warn', 'EN-FALSE-FRIEND': 'warn', 'EN-OFFICIALESE': 'warn', 'EN-PUFFERY': 'warn',
  'EN-OPENER': 'warn', 'EN-SIGNIFICANCE': 'warn', 'EN-PARTICIPLE-TAIL': 'warn', 'EN-HEDGE': 'warn', 'EN-LATIN': 'warn', 'EN-LINK': 'warn', 'EN-CASE': 'warn',
  'EN-END-PUNCT': 'warn', 'EN-ELLIPSIS': 'warn', 'EN-QUOTES': 'warn', 'EN-AMPERSAND': 'warn', 'EN-MINIMIZER': 'warn', 'EN-ONE-TERM': 'error', 'EN-EXCLAIM': 'warn',
};
const WAVE3 = ['EN-REDUNDANCY', 'EN-REDUNDANT-ACRONYM', 'EN-EXPLETIVE-OPEN', 'EN-UNCOMPARABLE', 'EN-CLICHE', 'EN-DIALECT-LEXIS', 'EN-INCLUSIVE', 'EN-GENERIC-PRONOUN'];

test('every rule carries its metadata as data', () => {
  for (const r of RULES) {
    assert.ok(RULE_KINDS.includes(r.kind), `${r.id}: kind ${r.kind} is not in the vocabulary`);
    assert.ok(['word', 'char', 'unit'].includes(r.granularity), `${r.id}: granularity`);
    assert.ok(Number.isInteger(r.priority), `${r.id}: priority must be an integer`);
    assert.ok(['on', 'temp_off'].includes(r.status), `${r.id}: status`);
    const p = r.precision;
    assert.ok(p && 'value' in p && 'sample' in p && 'date' in p && typeof p.note === 'string', `${r.id}: precision { value, sample, date, note }`);
    if (p.value !== null) { assert.ok(p.value >= 0 && p.value <= 1, `${r.id}: precision value is a share`); assert.ok(Number.isInteger(p.sample) && p.sample > 0, `${r.id}: a counted precision names its sample`); assert.match(p.date, /^\d{4}-\d{2}-\d{2}$/); }
    assert.ok(Array.isArray(r.guards), `${r.id}: guards array`);
    for (const g of r.guards) {
      assert.ok(g.pattern instanceof RegExp || (typeof g.pattern === 'string' && g.pattern.trim()), `${r.id}: guard pattern`);
      assert.ok(typeof g.reason === 'string' && g.reason.trim(), `${r.id}: guard reason`);
      assert.ok(typeof g.seen === 'string' && g.seen.trim(), `${r.id}: guard seen`);
      assert.ok(g.example !== undefined, `${r.id}: every guard names its negative control`);
    }
  }
});

test('examples-as-tests: every rule has a positive fixture and a negative control, and both hold', () => {
  for (const r of RULES) {
    assert.ok(r.examples && r.examples.hit.length > 0, `${r.id} has no positive fixture`);
    assert.ok(r.examples.clean.length + r.guards.length > 0 && r.examples.clean.length > 0, `${r.id} has no negative control`);
    for (const e of r.examples.hit) assert.ok(run(r.id, e).length > 0, `${r.id} should flag: ${label(e)}`);
    for (const e of r.examples.clean) assert.equal(run(r.id, e).length, 0, `${r.id} should NOT flag: ${label(e)} -> ${JSON.stringify(run(r.id, e).map((f) => f.span))}`);
    for (const g of r.guards) assert.equal(run(r.id, g.example).length, 0, `${r.id} guard control flagged (${g.reason}): ${label(g.example)}`);
  }
});

test('compatibility: the 26 baselined rules keep their ids and default severities', () => {
  for (const [id, sev] of Object.entries(PINNED)) {
    const r = RULES.find((x) => x.id === id);
    assert.ok(r, `${id} disappeared`);
    assert.equal(r.defaultSeverity, sev, `${id} default severity changed - eight fleet baselines depend on it`);
    assert.equal(r.status, 'on', `${id} was turned off`);
  }
});

test('wave-3 rules ship at warn, each with at least one guard', () => {
  for (const id of WAVE3) {
    const r = RULES.find((x) => x.id === id);
    assert.ok(r, `${id} missing`);
    assert.equal(r.defaultSeverity, 'warn', `${id} must enter as a warning (count before blocking)`);
    assert.ok(r.guards.length >= 1, `${id} needs a guard with its reason`);
  }
  assert.equal(RULES.length, Object.keys(PINNED).length + WAVE3.length);
});

test('temp_off keeps the rule and its data but it never fires', () => {
  const r = RULES.find((x) => x.id === 'EN-LATIN');
  assert.ok(run('EN-LATIN', 'Use a tag, e.g. urgent.').length > 0);
  r.status = 'temp_off';
  try {
    assert.equal(run('EN-LATIN', 'Use a tag, e.g. urgent.').length, 0);
    // even a contract that names the rule cannot wake it
    assert.equal(run('EN-LATIN', { text: 'Use a tag, e.g. urgent.', contract: { rules: { 'EN-LATIN': 'error' } } }).length, 0);
  } finally { r.status = 'on'; }
});

test('one span, one finding: a phrase rule claims its words', () => {
  const all = (text, key = 'page.body', contract = {}) => lintRecords([makeRecord('en.json', 1, key, text)], contractFor(contract));
  // a puffery word inside a cliché
  const cliche = all('Take your hiring to the next level', 'hero.title');
  assert.deepEqual(cliche.map((f) => f.rule), ['EN-CLICHE']);
  // a hedge inside a participle tail
  const tail = all('We sync every night, ensuring reports could potentially arrive sooner.');
  assert.deepEqual(tail.map((f) => f.rule), ['EN-PARTICIPLE-TAIL']);
  // negative control: the hedge alone still fires
  assert.deepEqual(all('Reports could potentially arrive sooner.').map((f) => f.rule), ['EN-HEDGE']);
});

test('one span, one finding never drops an error, and typography never competes with wording', () => {
  const recs = [makeRecord('en.json', 1, 'a.b', 'We ship nightly, ensuring the colour stays right.')];
  const rules = lintRecords(recs, contractFor()).map((f) => f.rule).sort();
  assert.ok(rules.includes('EN-SPELLING'), 'the baselined error survives a wording warning over the same span');
  const quotes = lintRecords([makeRecord('en.json', 1, 'a.b', 'We ship nightly, ensuring "fast" results.')], contractFor({ quotes: 'curly' })).map((f) => f.rule).sort();
  assert.deepEqual(quotes, ['EN-PARTICIPLE-TAIL', 'EN-QUOTES']);
  // the resolver itself: rank is severity, then priority, then length; greedy
  const f = (rule, severity, priority, index, length, granularity = 'word') => ({ rule, severity, priority, index, length, granularity });
  const out = resolveOverlaps([f('A', 'warn', 10, 0, 10), f('B', 'warn', 50, 5, 3), f('C', 'warn', 5, 9, 4), f('E', 'error', 1, 0, 2), f('D', 'warn', 99, 0, 20, 'char')]);
  // E (error) kept; B kept; A overlaps both and is dropped; C overlaps only the dropped A, so it stays; D is char-level
  assert.deepEqual(out.map((x) => x.rule).sort(), ['B', 'C', 'D', 'E']);
});

test('every finding carries its kind and an anchor that occurs exactly once in its string', () => {
  const recs = [
    makeRecord('en.json', 1, 'a', 'Fast — and — cheap, with free gift and free gift wrap.'),
    makeRecord('en.json', 2, 'b', 'Customise the colour, then customise the colour again.'),
  ];
  const findings = lintRecords(recs, contractFor({ dash: { emDash: 'ban' } }));
  assert.ok(findings.length >= 3);
  for (const x of findings) {
    assert.ok(RULE_KINDS.includes(x.kind), `${x.rule} finding has kind ${x.kind}`);
    assert.equal(occurrences(x.text, x.anchor), 1, `${x.rule} anchor ${JSON.stringify(x.anchor)} is not unique in ${JSON.stringify(x.text)}`);
    assert.ok(x.anchor.includes(x.span), 'the anchor contains the span');
  }
});

test('EN-DIALECT-LEXIS reports one form once per file, with the count', () => {
  const recs = [
    makeRecord('en.json', 1, 'a', 'Upload your CV here.'),
    makeRecord('en.json', 2, 'b', 'We read every CV twice.'),
    makeRecord('en.json', 3, 'c', 'Your CV is ready.'),
    makeRecord('other.json', 1, 'd', 'Attach a CV.'),
  ];
  const found = lintRecords(recs, contractFor()).filter((f) => f.rule === 'EN-DIALECT-LEXIS');
  assert.deepEqual(found.map((f) => `${f.file}:${f.key}`), ['en.json:a', 'other.json:d']);
  assert.match(found[0].message, /3 occurrences of this form in this file/);
  assert.doesNotMatch(found[1].message, /occurrences/);
});

test('EN-INCLUSIVE is driven by the termbase: seed by default, the contract list when declared', () => {
  assert.ok(INCLUSIVE_SEED.some((t) => t.term === 'whitelist'));
  assert.ok(run('EN-INCLUSIVE', 'Add it to the whitelist.').length > 0);
  assert.equal(run('EN-INCLUSIVE', { text: 'Add it to the whitelist.', contract: { terms: { inclusive: [{ term: 'denylist', use: 'blocklist' }] } } }).length, 0);
  assert.equal(run('EN-INCLUSIVE', { text: 'Copy the master/slave pair.' })[0].span, 'master/slave');
  const bad = normalizeContract({ variant: 'US', sources: [{ path: 'x', kind: 'json-catalog' }], terms: { inclusive: [{ term: 'x' }] } });
  assert.ok(bad.errors.some((e) => e.includes('terms.inclusive')));
});

test('contract keys: locked and preserved key classes, dot globs', () => {
  const { contract, errors } = normalizeContract({ variant: 'US', sources: [{ path: 'x', kind: 'json-catalog' }], keys: { locked: ['legal.**'], preserved: ['testimonials.*.quote'] } });
  assert.deepEqual(errors, []);
  assert.equal(keyClassOf('legal.terms.section[2]', contract), 'locked');
  assert.equal(keyClassOf('testimonials.acme.quote', contract), 'preserved');
  assert.equal(keyClassOf('testimonials.acme.author.quote', contract), null);
  assert.equal(keyClassOf('landing.hero.title', contract), null);
  const bad = normalizeContract({ variant: 'US', sources: [{ path: 'x', kind: 'json-catalog' }], keys: { frozen: ['a'] } });
  assert.ok(bad.errors.some((e) => e.includes('keys.frozen')));
});

test('references/rules.md is the generated catalog (regenerate with --rules-md)', () => {
  const committed = fs.readFileSync(path.join(SKILL, 'references', 'rules.md'), 'utf8').replace(/\r\n/g, '\n');
  assert.equal(committed, rulesMarkdown(RULES, { inclusiveSeed: INCLUSIVE_SEED }), 'references/rules.md is stale: node scripts/copy-check.mjs --rules-md > references/rules.md');
});
