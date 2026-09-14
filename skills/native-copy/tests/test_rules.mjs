// Deterministic tests for the EN rule set: a positive AND a negative control per rule.
//
// `node --test "skills/native-copy/tests/*.mjs"` - builtins only.
// A rule with only a positive test is a rule nobody has checked for false positives,
// and a false-positive rule in a blocking gate is the rule somebody deletes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RULES, RULE_IDS, lintRecords, maskText, SPELLING_BASE_PAIRS, caseShape } from '../scripts/lib/rules.mjs';
import { makeRecord } from '../scripts/lib/extract.mjs';
import { contractFor } from '../scripts/lib/contract.mjs';

/** Lint one string; returns findings of `rule` only. */
function hits(rule, text, { key = 'page.body', tag = null, contract = {} } = {}) {
  const rec = makeRecord('en.json', 1, key, text, { tag });
  return lintRecords([rec], contractFor(contract)).filter((f) => f.rule === rule);
}
const yes = (rule, text, opts) => assert.ok(hits(rule, text, opts).length > 0, `${rule} should flag: ${text}`);
const no = (rule, text, opts) => assert.equal(hits(rule, text, opts).length, 0, `${rule} should NOT flag: ${text} -> ${JSON.stringify(hits(rule, text, opts).map((f) => f.span))}`);

test('the rule set is the dossier set, each with a severity and fragment flag', () => {
  assert.equal(RULES.length, 34);
  for (const r of RULES) {
    assert.match(r.id, /^EN-[A-Z]+(-[A-Z]+)*$/);
    assert.ok(['error', 'warn'].includes(r.defaultSeverity));
    assert.equal(typeof r.fragmentSafe, 'boolean');
  }
  assert.equal(new Set(RULE_IDS).size, RULE_IDS.length);
});

test('EN-ARTIFACT', () => {
  yes('EN-ARTIFACT', 'See the report :contentReference[oaicite:0]{index=0}');
  yes('EN-ARTIFACT', "Certainly! Here's your hiring plan.");
  yes('EN-ARTIFACT', 'Contact [Company Name] for details.');
  yes('EN-ARTIFACT', 'Lorem ipsum dolor sit amet.');
  assert.equal(hits('EN-ARTIFACT', 'Contact [Company Name] today.')[0].severity, 'error');
  no('EN-ARTIFACT', "Here's how it works.");
  no('EN-ARTIFACT', 'Footnote [1] applies to annual plans.');
});

test('EN-SPELLING: keyed on the contract variant, both directions, >= 60 base pairs', () => {
  assert.ok(SPELLING_BASE_PAIRS >= 60, `only ${SPELLING_BASE_PAIRS} base pairs`);
  const us = hits('EN-SPELLING', 'Customise your colour palette');
  assert.deepEqual(us.map((f) => f.suggestion), ['Customize', 'color']);
  no('EN-SPELLING', 'Customize your color palette');
  no('EN-SPELLING', 'Docs at https://example.com/colour-guide and file theme_colour.css');
  yes('EN-SPELLING', 'Our training programme', {});
  yes('EN-SPELLING', 'Optimize the catalog', { contract: { variant: 'UK' } });
  no('EN-SPELLING', 'Install the program and check the licence', { contract: { variant: 'UK' } });
  no('EN-SPELLING', 'Organize your analyses', { contract: { variant: 'UK', spelling: 'oxford' } });
  no('EN-SPELLING', 'Optimise the catalogue', { contract: { variant: 'UK' } });
});

test('EN-DASH: ban, density and hyphen-as-dash per contract', () => {
  const ban = hits('EN-DASH', 'Fast — and cheap', { contract: { dash: { emDash: 'ban' } } });
  assert.equal(ban.length, 1); assert.equal(ban[0].severity, 'error');
  no('EN-DASH', 'Fast — and cheap', { contract: { dash: { emDash: 'allow' } } });
  const dense = hits('EN-DASH', 'One — two — three', { contract: { dash: { emDash: 'density' } } });
  assert.equal(dense.length, 1); assert.equal(dense[0].severity, 'warn');
  no('EN-DASH', 'One idea — stated once.', { contract: { dash: { emDash: 'density' } } });
  const hy = hits('EN-DASH', 'Fast - and cheap');
  assert.equal(hy.length, 1); assert.equal(hy[0].severity, 'warn'); assert.equal(hy[0].span, '-');
  no('EN-DASH', 'Open 2020 - 2021 in e-mail and sign-up');
});

test('EN-SPACING', () => {
  yes('EN-SPACING', 'Ready ?');
  yes('EN-SPACING', 'Note : this matters');
  yes('EN-SPACING', 'Two  spaces here');
  no('EN-SPACING', 'Ready? Note: this matters.');
  no('EN-SPACING', 'Meet at 10 : 30 with a 3 : 1 ratio');
  no('EN-SPACING', 'Smile :)');
});

test('EN-SOURCE-RESIDUE', () => {
  yes('EN-SOURCE-RESIDUE', '„Quoted“ text');
  yes('EN-SOURCE-RESIDUE', '25 % off');
  yes('EN-SOURCE-RESIDUE', 'Takes 1,5 hours');
  yes('EN-SOURCE-RESIDUE', 'From 499 Kč');
  yes('EN-SOURCE-RESIDUE', 'Only 499,-');
  no('EN-SOURCE-RESIDUE', '25% off for 1,000 users, 12,500 seats, 1.5 hours');
});

test('EN-COUNTABLE', () => {
  assert.equal(hits('EN-COUNTABLE', 'More informations')[0].suggestion, 'information');
  yes('EN-COUNTABLE', 'Send us a feedback');
  no('EN-COUNTABLE', 'Close a feedback loop and share information');
});

test('EN-COMPLEMENT', () => {
  yes('EN-COMPLEMENT', 'The app allows to export data');
  yes('EN-COMPLEMENT', 'We offer the possibility to pay later');
  no('EN-COMPLEMENT', 'The app allows you to export data');
  no('EN-COMPLEMENT', 'You are allowed to edit this');
});

test('EN-CONDITIONAL', () => {
  yes('EN-CONDITIONAL', 'When you will sign up, you get a gift.');
  no('EN-CONDITIONAL', 'When you sign up, you get a gift.');
  no('EN-CONDITIONAL', 'It is, if you will, a map of the market.');
});

test('EN-PERFECT: sentence-level only', () => {
  yes('EN-PERFECT', 'We are on the market since 2015 already.');
  yes('EN-PERFECT', 'We help teams since 2019 across Europe.');
  no('EN-PERFECT', "We've helped teams since 2019 across Europe.");
  no('EN-PERFECT', 'It has been live since 2019 for everyone.');
  no('EN-PERFECT', 'Trusted since 2012', {}); // a fragment: the rule never runs
});

test('EN-FALSE-FRIEND: a warning that says the word can be right', () => {
  const f = hits('EN-FALSE-FRIEND', 'See the actual prices today.');
  assert.equal(f.length, 1); assert.equal(f[0].severity, 'warn');
  assert.match(f[0].message, /check the sense; valid English if meant/);
  no('EN-FALSE-FRIEND', 'See the current prices today.');
});

test('EN-OFFICIALESE', () => {
  yes('EN-OFFICIALESE', 'Do not hesitate to contact us.');
  yes('EN-OFFICIALESE', 'We would like to inform you that the plan changed.');
  no('EN-OFFICIALESE', 'Questions? Contact us any time.');
});

test('EN-PUFFERY: density in body copy, one word in a heading', () => {
  yes('EN-PUFFERY', 'Seamless and robust sync for every team.');
  yes('EN-PUFFERY', 'Unlock growth', { key: 'hero.title' });
  no('EN-PUFFERY', 'A robust estimator of the median.');
  no('EN-PUFFERY', 'Unlock the door with your badge', { key: 'help.body' });
});

test('EN-OPENER', () => {
  yes('EN-OPENER', "In today's fast-paced world, teams ship weekly.");
  yes('EN-OPENER', 'Imagine a world where hiring runs itself.');
  no('EN-OPENER', 'Today, teams ship weekly.');
});

test('EN-SIGNIFICANCE', () => {
  yes('EN-SIGNIFICANCE', 'Data plays a crucial role in hiring.');
  yes('EN-SIGNIFICANCE', 'This launch is a testament to our team.');
  no('EN-SIGNIFICANCE', 'Data decides who gets the next interview.');
});

test('EN-PARTICIPLE-TAIL', () => {
  yes('EN-PARTICIPLE-TAIL', 'We check every string, ensuring consistent quality.');
  no('EN-PARTICIPLE-TAIL', 'Ensuring quality is the job of the gate.');
  no('EN-PARTICIPLE-TAIL', 'We check every string, then we ship.');
});

test('EN-HEDGE', () => {
  yes('EN-HEDGE', 'This could potentially save time.');
  yes('EN-HEDGE', "It's important to note that plans renew.");
  no('EN-HEDGE', 'This could save time.');
});

test('EN-LATIN', () => {
  assert.equal(hits('EN-LATIN', 'Use a tag, e.g. urgent.')[0].suggestion, 'for example');
  yes('EN-LATIN', 'Files, images, etc.');
  no('EN-LATIN', 'Use a tag, for example urgent, and eggs.');
});

test('EN-LINK', () => {
  yes('EN-LINK', 'Learn more →');
  yes('EN-LINK', 'Click here');
  no('EN-LINK', 'Learn more about pricing');
});

test('EN-CASE: heading/button classes per declared style; accepted names and proper nouns excluded', () => {
  const sentence = { case: { style: 'sentence' } };
  yes('EN-CASE', 'Browse By Category Today', { key: 'pricing.title', contract: sentence });
  yes('EN-CASE', 'Browse by Category', { key: 'nav.heading', contract: sentence });
  no('EN-CASE', 'Browse by category today', { key: 'pricing.title', contract: sentence });
  no('EN-CASE', 'Works with Google Ads', { key: 'pricing.title', contract: { ...sentence, terms: { accept: ['Google Ads'] } } });
  no('EN-CASE', 'Browse By Category Today', { key: 'pricing.body', contract: sentence });
  no('EN-CASE', 'Browse By Category Today', { key: 'pricing.title', contract: { case: { style: 'any' } } });
  yes('EN-CASE', 'Browse by category today', { key: 'pricing.title', contract: { case: { style: 'title' } } });
  no('EN-CASE', 'SETTINGS AND HIRING PLAN', { key: 'page.eyebrow', contract: sentence });
  assert.equal(caseShape('Sign in with OpenAI and GitHub').capitalized, 0);
});

test('EN-END-PUNCT', () => {
  yes('EN-END-PUNCT', 'Save changes.', { key: 'form.submitButton' });
  no('EN-END-PUNCT', 'Save changes', { key: 'form.submitButton' });
  no('EN-END-PUNCT', 'Your changes were saved.', { key: 'form.status' });
  no('EN-END-PUNCT', 'Loading...', { key: 'form.submitButton' });
});

test('EN-ELLIPSIS', () => {
  yes('EN-ELLIPSIS', 'Saving...', { contract: { ellipsis: 'char' } });
  no('EN-ELLIPSIS', 'Saving…', { contract: { ellipsis: 'char' } });
  yes('EN-ELLIPSIS', 'Saving…', { contract: { ellipsis: 'dots' } });
  no('EN-ELLIPSIS', 'Saving...', { contract: { ellipsis: 'any' } });
});

test('EN-QUOTES', () => {
  yes('EN-QUOTES', 'Select "Save" to continue', { contract: { quotes: 'curly' } });
  no('EN-QUOTES', 'Select “Save” to continue', { contract: { quotes: 'curly' } });
  yes('EN-QUOTES', 'Select “Save” to continue', { contract: { quotes: 'straight' } });
  no('EN-QUOTES', 'Select "Save" to continue', { contract: { quotes: 'any' } });
});

test('EN-AMPERSAND', () => {
  yes('EN-AMPERSAND', 'Plan & ship your launch in one place.');
  yes('EN-AMPERSAND', 'Plans & pricing', { key: 'pricing.title' });
  no('EN-AMPERSAND', 'Terms & conditions', { key: 'footer.link' });
  no('EN-AMPERSAND', 'Our R&D team reviews every Q&A in one place.');
});

test('EN-MINIMIZER', () => {
  yes('EN-MINIMIZER', 'Simply drag the file here.');
  no('EN-MINIMIZER', 'Drag the file here; a simple list appears.');
});

test('EN-ONE-TERM: termbase forbidden variants', () => {
  const contract = { terms: { reject: [{ term: 'sign on', use: 'sign in' }] } };
  const f = hits('EN-ONE-TERM', 'Sign on to continue', { contract });
  assert.equal(f.length, 1); assert.equal(f[0].severity, 'error'); assert.equal(f[0].suggestion, 'sign in');
  no('EN-ONE-TERM', 'Sign in to continue with a design online', { contract });
});

test('EN-EXCLAIM: one per component surface, one per catalog message; none in error-class strings', () => {
  const c = contractFor();
  // catalog siblings may never co-render (fleet false positive, 2026-09-14): only a message with two marks is flagged
  const siblings = lintRecords([makeRecord('en.json', 1, 'landing.a', 'Welcome aboard!'), makeRecord('en.json', 2, 'landing.b', 'You did it!')], c).filter((f) => f.rule === 'EN-EXCLAIM');
  assert.equal(siblings.length, 0);
  const doubled = lintRecords([makeRecord('en.json', 1, 'landing.a', 'Welcome! You did it!')], c).filter((f) => f.rule === 'EN-EXCLAIM');
  assert.deepEqual(doubled.map((f) => f.key), ['landing.a']);
  const page = lintRecords([makeRecord('Hero.tsx', 1, '<h1>', 'Welcome aboard!'), makeRecord('Hero.tsx', 2, '<p>', 'You did it!')], c).filter((f) => f.rule === 'EN-EXCLAIM');
  assert.equal(page.length, 1);
  const err = lintRecords([makeRecord('en.json', 1, 'errors.network', 'Something failed!')], c).filter((f) => f.rule === 'EN-EXCLAIM');
  assert.equal(err.length, 1);
  no('EN-EXCLAIM', 'Use !important sparingly and a != b');
});

test('contract rule overrides: promote, demote, off', () => {
  assert.equal(hits('EN-LATIN', 'Use a tag, e.g. urgent.', { contract: { rules: { 'EN-LATIN': 'error' } } })[0].severity, 'error');
  no('EN-LATIN', 'Use a tag, e.g. urgent.', { contract: { rules: { 'EN-LATIN': 'off' } } });
  assert.equal(hits('EN-ARTIFACT', 'Lorem ipsum dolor.', { contract: { rules: { 'EN-ARTIFACT': 'warn' } } })[0].severity, 'warn');
});

test('ICU branches are linted: a defect only in `one {...}` is still seen', () => {
  const rec = makeRecord('en.json', 1, 'x.count', '{count, plural, one {# informations} other {# details}}');
  assert.ok(lintRecords([rec], contractFor()).some((f) => f.rule === 'EN-COUNTABLE'));
});

test('smoke-test false positives stay fixed (first real-catalog run, 2026-09-14)', () => {
  // "analyses" is the plural of the noun "analysis" in US English too
  no('EN-SPELLING', 'Recruiter time-per-hire analyses and cost reports');
  // a capitalized multi-word proper name keeps its own spelling
  no('EN-SPELLING', 'Openings registered at the Czech Labour Office every week');
  yes('EN-SPELLING', 'Built on public labour-market data');
  // "actual(ly)" in its native "real(ly)" sense
  no('EN-FALSE-FRIEND', 'Verify what the candidate actually did with their actual CV.');
  yes('EN-FALSE-FRIEND', 'These offers are actually available until Friday.');
  // "robust" as a statistics term, not puffery
  no('EN-PUFFERY', 'Rank by the robust cross-scheme mean instead', { key: 'jobs.fairRankTitle' });
  no('EN-PUFFERY', 'Own = own weights; Robust = mean across schemes; delta = robust - own.');
  // "simply" as "merely" or manner, not a claim about the reader's effort
  no('EN-MINIMIZER', 'That proves nothing: the candidate may simply have edited the line away.');
  no('EN-MINIMIZER', 'Explains complex ideas simply and checks for understanding.');
  yes('EN-MINIMIZER', 'You can easily export every report.');
  // an empty rich tag is filled at the call site and must not manufacture a double space
  no('EN-SPACING', 'The sources in <path></path> rendered live.');
  // a segment separator or a colon starts a new segment: its first word may be capitalized
  const sentence = { case: { style: 'sentence' } };
  no('EN-CASE', 'Set up · Company', { key: 'setup.steps.company.eyebrow', contract: sentence });
  no('EN-CASE', 'Pricing: Plans for every team', { key: 'pricing.title', contract: sentence });
  yes('EN-CASE', 'Durable Skill Profile', { key: 'skillProfile.title', contract: sentence });
});

test('maskText keeps length and hides code-ish tokens, URLs and accepted terms', () => {
  const s = 'Open https://x.io/colour, run theme_colour and ask Colour Labs';
  const m = maskText(s, ['Colour Labs']);
  assert.equal(m.length, s.length);
  assert.ok(!/colour/i.test(m));
  assert.ok(m.startsWith('Open '));
});
