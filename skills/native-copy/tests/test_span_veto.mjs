// Unique-span expansion and the deterministic veto layer (copy-quality-gates/anchored-model-review).
//
// `node --test "skills/native-copy/tests/*.mjs"` - builtins only. The CLI case runs the real
// script against a temporary directory (never a project tree).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { uniqueSpan, locateSpan, occurrences } from '../scripts/lib/span.mjs';
import { applyVeto, unitResolver, VETOES } from '../scripts/lib/veto.mjs';
import { RULE_IDS } from '../scripts/lib/rules.mjs';
import { makeRecord } from '../scripts/lib/extract.mjs';
import { contractFor } from '../scripts/lib/contract.mjs';

// ------------------------------------------------------------------ span

test('occurrences counts overlapping matches', () => {
  assert.equal(occurrences('aaa', 'aa'), 2);
  assert.equal(occurrences('abc', ''), 0);
});

test('uniqueSpan: a unique span is returned as is', () => {
  assert.deepEqual(uniqueSpan('Save the draft.', 5, 3), { index: 5, length: 3, span: 'the', unique: true });
});

test('uniqueSpan: word by word in a space-separated script, right first, then left', () => {
  const t = 'Save the file. Save the draft.';
  const r = uniqueSpan(t, 15, 4);
  assert.equal(r.span, 'file. Save the');
  assert.equal(r.unique, true);
  assert.equal(occurrences(t, r.span), 1);
  assert.equal(t.slice(r.index, r.index + r.length), r.span);
});

test('uniqueSpan: character by character in a script without word spacing', () => {
  const t = 'データを保存します。データを削除します。';
  const r = uniqueSpan(t, 0, 3);
  assert.equal(r.span, 'データを保');
  assert.equal(occurrences(t, r.span), 1);
});

test('uniqueSpan: an empty span cannot be anchored', () => {
  assert.equal(uniqueSpan('abc', 1, 0).unique, false);
});

test('locateSpan: absent, ambiguous, or the index of the only occurrence', () => {
  assert.deepEqual(locateSpan('a b a', 'c'), { error: 'absent', count: 0 });
  assert.deepEqual(locateSpan('a b a', 'a'), { error: 'ambiguous', count: 2 });
  assert.deepEqual(locateSpan('a b a', 'b'), { index: 2 });
});

// ------------------------------------------------------------------ veto

const RECORDS = [
  makeRecord('messages/en.json', 1, 'hero.title', 'Seamless hiring for busy teams'),
  makeRecord('messages/en.json', 2, 'hero.body', 'Rank by the robust mean instead of the raw score.'),
  makeRecord('messages/en.json', 3, 'legal.terms', 'The provider shall hereby deliver the service.'),
  makeRecord('messages/en.json', 4, 'about.body', 'Colour Labs builds the plan, and the plan ships weekly.'),
  makeRecord('messages/en.json', 5, 'greet', 'Hi {name}, welcome back.'),
  makeRecord('src/A.tsx', 10, '<p>', 'Built for teams that ship.'),
  makeRecord('src/B.tsx', 20, '<p>', 'Built for teams that ship.'),
];
const CONTRACT = contractFor({ terms: { accept: ['Colour Labs'] }, keys: { locked: ['legal.**'] } });
const veto = (findings) => applyVeto(findings, { resolveUnit: unitResolver(RECORDS), ruleIds: new Set([...RULE_IDS, 'EN-JARGON', 'EN-NOUN-PILE']), contract: CONTRACT });
const only = (finding) => { const r = veto([finding]); return r.suppressed[0]?.veto ?? 'kept'; };

test('veto: a well-formed, anchored finding is kept with its unique anchor', () => {
  const r = veto([{ key: 'hero.title', span: 'Seamless', rule: 'EN-PUFFERY', mqm: 'style/unidiomatic', severity: 'major', fix: 'Structured' }]);
  assert.equal(r.given, 1);
  assert.equal(r.kept.length, 1);
  assert.equal(r.kept[0].anchor, 'Seamless');
  assert.equal(r.kept[0].file, 'messages/en.json');
  assert.deepEqual(r.counts, {});
});

test('veto: each seeded false-positive shape is suppressed with its id', () => {
  assert.equal(only({ key: 'hero.title', rule: 'EN-PUFFERY' }), 'V-SHAPE');
  assert.equal(only({ key: 'hero.title', span: 'Seamless', rule: 'EN-VIBES' }), 'V-UNKNOWN-RULE');
  assert.equal(only({ key: 'hero.title', span: 'Seamless', rule: 'EN-PUFFERY', reason: 'this sounds AI-generated' }), 'V-AUTHORSHIP');
  assert.equal(only({ key: 'hero.title', span: 'Seamless', rule: 'EN-PUFFERY', reason: 'detector score 87% AI' }), 'V-AUTHORSHIP');
  assert.equal(only({ key: 'nope.key', span: 'Seamless', rule: 'EN-PUFFERY' }), 'V-UNKNOWN-UNIT');
  assert.equal(only({ key: '<p>', span: 'teams that ship', rule: 'EN-JARGON' }), 'V-UNIT-AMBIGUOUS');
  assert.equal(only({ key: 'legal.terms', span: 'hereby', rule: 'EN-OFFICIALESE' }), 'V-LOCKED-UNIT');
  assert.equal(only({ key: 'hero.title', span: 'seamless hiring', rule: 'EN-PUFFERY' }), 'V-SPAN-NOT-VERBATIM');
  assert.equal(only({ key: 'about.body', span: 'the plan', rule: 'EN-NOUN-PILE' }), 'V-SPAN-AMBIGUOUS');
  assert.equal(only({ key: 'about.body', span: 'Colour', rule: 'EN-SPELLING', fix: 'Color' }), 'V-ACCEPTED-TERM');
  assert.equal(only({ key: 'greet', span: 'Hi {name},', rule: 'EN-NOUN-PILE', fix: 'Hello,' }), 'V-SKELETON');
  assert.equal(only({ key: 'hero.title', span: 'Seamless', rule: 'EN-PUFFERY', fix: 'Seamless' }), 'V-NOOP-FIX');
  assert.equal(only({ key: 'hero.title', span: 'Seamless', rule: 'EN-PUFFERY', fix: 'Effortless' }), 'V-SYNONYM-SWAP');
  assert.equal(only({ key: 'hero.body', span: 'robust', rule: 'EN-PUFFERY', fix: 'trimmed' }), 'V-RULE-GUARD');
});

test('veto: negative controls - the same shapes done right are kept', () => {
  assert.equal(only({ key: '<p>', file: 'src/B.tsx', span: 'teams that ship', rule: 'EN-JARGON' }), 'kept', 'file disambiguates the unit');
  assert.equal(only({ key: 'about.body', span: 'the plan ships', rule: 'EN-NOUN-PILE' }), 'kept', 'a span made unique is anchored');
  assert.equal(only({ key: 'about.body', span: 'the plan', index: 33, rule: 'EN-NOUN-PILE' }), 'kept', 'an offset anchors a repeated span');
  assert.equal(only({ key: 'greet', span: 'Hi {name},', rule: 'EN-NOUN-PILE', fix: 'Hello {name},' }), 'kept', 'placeholders kept');
  assert.equal(only({ key: 'hero.title', span: 'Seamless hiring', rule: 'EN-PUFFERY', fix: 'Hiring in two clicks' }), 'kept', 'removing the claim is not a swap');
  assert.equal(only({ key: 'hero.body', span: 'raw score', rule: 'EN-NOUN-PILE', reason: 'reads as a nominalization chain' }), 'kept', 'a property, not authorship');
});

// Regressions from the 2026-09-14 anchored review of personas-web's money-page copy: the veto
// suppressed 4 findings, all instrument defects, hiding two findings 2 of 3 reviewers agreed on.
const REVIEW_RECORDS = [
  makeRecord('src/i18n/en.ts', 40, 'en.pricing.lead', 'Not another chatbot, just a complete agent platform.'),
  makeRecord('src/lib/seo.ts', 9, '', 'Build and orchestrate multi-agent AI pipelines locally or in the cloud. Multi-provider AI, AES-256 encrypted credential vault, self-healing execution, and 40+ integrations — no code required.'),
  makeRecord('src/lib/seo.ts', 12, 'legal.notice', 'All rights reserved, no code required.'),
];
const reviewOnly = (finding) => applyVeto([finding], { resolveUnit: unitResolver([...RECORDS, ...REVIEW_RECORDS]), ruleIds: new Set(RULE_IDS), contract: CONTRACT }).suppressed[0]?.veto ?? 'kept';

test('veto regression (personas-web review 2026-09-14): a fix that keeps one claim word and removes another is not a synonym swap', () => {
  assert.equal(reviewOnly({ key: 'en.pricing.lead', span: 'just a complete agent platform', rule: 'EN-PUFFERY', fix: 'just an agent platform' }), 'kept', 'a word in both span and fix is retained, not swapped');
  assert.equal(reviewOnly({ key: 'en.pricing.lead', span: 'just a complete agent platform', rule: 'EN-PUFFERY', fix: 'an agent platform' }), 'kept', 'removing the claim word outright is not a swap');
  // negative controls: a real replacement is still suppressed, including beside a retained word
  assert.equal(reviewOnly({ key: 'en.pricing.lead', span: 'just a complete agent platform', rule: 'EN-PUFFERY', fix: 'simply a complete agent platform' }), 'V-SYNONYM-SWAP');
  assert.equal(reviewOnly({ key: 'hero.title', span: 'Seamless hiring', rule: 'EN-PUFFERY', fix: 'Effortless hiring' }), 'V-SYNONYM-SWAP');
});

test('veto regression (personas-web review 2026-09-14): a key-less unit is resolved by file and line', () => {
  const seo = { key: '', file: 'src/lib/seo.ts', line: 9, span: 'no code required', rule: 'EN-PUFFERY', fix: 'no code to write' };
  const r = applyVeto([seo], { resolveUnit: unitResolver([...RECORDS, ...REVIEW_RECORDS]), ruleIds: new Set(RULE_IDS), contract: CONTRACT });
  assert.equal(r.kept.length, 1, JSON.stringify(r.suppressed));
  assert.equal(r.kept[0].file, 'src/lib/seo.ts');
  assert.equal(r.kept[0].line, 9);
  assert.equal(r.kept[0].anchor, 'no code required');
  const { key, ...noKeyField } = seo;
  assert.equal(reviewOnly(noKeyField), 'kept', 'an absent key field is the same as an empty key');
  assert.equal(reviewOnly({ ...seo, line: '9' }), 'kept', 'a line given as a string');
  // negative controls: a finding naming no unit at all is still rejected
  assert.equal(reviewOnly({ key: '', span: 'no code required', rule: 'EN-PUFFERY' }), 'V-SHAPE');
  assert.equal(reviewOnly({ span: 'no code required', rule: 'EN-PUFFERY' }), 'V-SHAPE');
  assert.equal(reviewOnly({ key: '', file: 'src/lib/seo.ts', span: 'no code required', rule: 'EN-PUFFERY' }), 'V-SHAPE', 'file without line names no unit');
  assert.equal(reviewOnly({ ...seo, line: 10 }), 'V-UNKNOWN-UNIT', 'no key-less string at that line');
  // a key-less finding never reaches a keyed string (and so never steps around a lock)
  assert.equal(reviewOnly({ ...seo, line: 12 }), 'V-UNKNOWN-UNIT');
});

test('veto: counts per veto id, and the input findings are not mutated', () => {
  const input = [
    { key: 'hero.title', span: 'Seamless', rule: 'EN-PUFFERY', fix: 'Effortless' },
    { key: 'hero.title', span: 'Seamless', rule: 'EN-PUFFERY', fix: 'Frictionless' },
    { key: 'hero.title', span: 'x', rule: 'EN-VIBES' },
  ];
  const copy = JSON.parse(JSON.stringify(input));
  const r = veto(input);
  assert.deepEqual(r.counts, { 'V-SYNONYM-SWAP': 2, 'V-UNKNOWN-RULE': 1 });
  assert.equal(r.kept.length + r.suppressed.length, r.given);
  assert.deepEqual(input, copy);
  assert.ok(VETOES.every((v) => /^V-[A-Z-]+$/.test(v.id) && v.why));
});

test('CLI --veto: reads model findings, resolves units from the contract sources, writes nothing', () => {
  const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'copy-check.mjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'native-copy-veto-'));
  try {
    fs.mkdirSync(path.join(dir, 'docs', 'i18n'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'messages'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs', 'i18n', 'copy-contract.json'), JSON.stringify({ variant: 'US', sources: [{ path: 'messages/en.json', kind: 'json-catalog' }], keys: { locked: ['legal.**'] } }));
    fs.writeFileSync(path.join(dir, 'messages', 'en.json'), JSON.stringify({ hero: { title: 'Seamless hiring for busy teams' }, legal: { terms: 'We hereby agree.' } }, null, 2));
    const findings = [
      { key: 'hero.title', span: 'Seamless', rule: 'EN-PUFFERY', fix: 'Hiring in two clicks' },
      { key: 'hero.title', span: 'Seamless', rule: 'EN-TRIAD', reason: 'sounds generated' },
      { key: 'legal.terms', span: 'hereby', rule: 'EN-OFFICIALESE' },
    ];
    const file = path.join(dir, 'review.json');
    fs.writeFileSync(file, JSON.stringify({ findings }));
    const before = fs.readdirSync(dir).sort();
    const r = spawnSync(process.execPath, [CLI, '--root', dir, '--veto', file], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const out = JSON.parse(r.stdout);
    assert.equal(out.kept.length, 1);
    assert.deepEqual(out.counts, { 'V-AUTHORSHIP': 1, 'V-LOCKED-UNIT': 1 });
    assert.ok(out.catalogIds > RULE_IDS.length, 'the review checklist ids are part of the catalog (EN-TRIAD is not a checker rule)');
    assert.deepEqual(fs.readdirSync(dir).sort(), before, '--veto writes nothing');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI --veto regression (personas-web review 2026-09-14): a module-constant meta description is reviewable by file and line', () => {
  const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'copy-check.mjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'native-copy-veto-'));
  try {
    fs.mkdirSync(path.join(dir, 'docs', 'i18n'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'src', 'lib'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs', 'i18n', 'copy-contract.json'), JSON.stringify({ variant: 'US', sources: [{ path: 'src/lib/seo.ts', kind: 'ts-module' }] }));
    fs.writeFileSync(path.join(dir, 'src', 'lib', 'seo.ts'), 'export const SITE_NAME = "Personas";\n\nexport const SITE_DESCRIPTION =\n  "Build and orchestrate multi-agent AI pipelines locally or in the cloud, no code required.";\n');
    const file = path.join(dir, 'review.json');
    fs.writeFileSync(file, JSON.stringify([
      { key: '', file: 'src/lib/seo.ts', line: 4, span: 'no code required', rule: 'EN-PUFFERY', fix: 'no code to write' },
      { key: '', span: 'no code required', rule: 'EN-PUFFERY' },
    ]));
    const r = spawnSync(process.execPath, [CLI, '--root', dir, '--veto', file], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const out = JSON.parse(r.stdout);
    assert.equal(out.kept.length, 1, JSON.stringify(out.suppressed));
    assert.equal(out.kept[0].anchor, 'no code required');
    assert.deepEqual(out.counts, { 'V-SHAPE': 1 }, 'a finding naming no unit is still rejected');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
