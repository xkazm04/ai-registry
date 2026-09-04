// Deterministic tests for the pure text helpers behind the social-card writer.
//
// `node --test "skills/leonardo/tests/*.mjs"` — no install, no network, no API key.
// Every other tool in this skill resolves `sharp` or calls a generation API at module
// scope, so importing one to check a helper runs the tool; `tools/og-text.mjs` exists
// precisely so the two functions that ARE pure can be reached without that.
//
// Both functions produce something a human then looks at, which is why they are worth
// pinning: their failure mode is a card that renders and is wrong. A wrap that emits
// an empty first line pushes the whole block down a leading; an escape applied in the
// wrong order prints `&amp;lt;` on the card. Neither throws.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrapText, svgEscape } from '../tools/og-text.mjs';

// ------------------------------------------------------------------ wrapText
test('wraps greedily, filling each line to the budget before starting the next', () => {
  assert.deepEqual(wrapText('one two three four five', 9), ['one two', 'three', 'four five']);
});

test('a phrase inside the budget stays on one line', () => {
  assert.deepEqual(wrapText('Ai Bookkeeper', 22), ['Ai Bookkeeper']);
});

test('a word longer than the budget gets its own line — never split, never dropped', () => {
  // Overflow is visible to a designer; a silent truncation looks correct and is wrong.
  assert.deepEqual(wrapText('a supercalifragilistic b', 6), ['a', 'supercalifragilistic', 'b']);
});

test('empty input yields NO lines, not one empty line', () => {
  // One empty line would push every following line down by a full leading, and the
  // card would render with the title floating below where it was laid out.
  assert.deepEqual(wrapText('', 22), []);
  assert.deepEqual(wrapText('   ', 22), []);
  assert.deepEqual(wrapText(null, 22), []);
  assert.deepEqual(wrapText(undefined, 22), []);
});

test('runs of whitespace collapse and no line is padded or empty', () => {
  const lines = wrapText('  Double-entry   that\n\tadds   up.  ', 14);
  assert.deepEqual(lines, ['Double-entry', 'that adds up.']);
  for (const l of lines) {
    assert.equal(l, l.trim(), `line ${JSON.stringify(l)} carries stray whitespace`);
    assert.notEqual(l, '');
  }
});

test('every line except an over-budget single word is within the budget', () => {
  const budget = 22;
  for (const l of wrapText('Ledgers reconciliation and quarterly reporting for small teams', budget)) {
    assert.ok(l.length <= budget || !l.includes(' '), `${JSON.stringify(l)} exceeds ${budget} and is not one word`);
  }
});

// ------------------------------------------------------------------ svgEscape
test('escapes the four characters that break an SVG attribute or text node', () => {
  assert.equal(svgEscape('<a href="x">&'), '&lt;a href=&quot;x&quot;&gt;&amp;');
});

test('an ampersand is escaped ONCE — order, not idempotence', () => {
  // The common real title is "Design & Build". Replacing `<` before `&` would turn it
  // into `&amp;lt;` and print the entity on the card.
  assert.equal(svgEscape('Design & Build'), 'Design &amp; Build');
  assert.equal(svgEscape('<'), '&lt;');
  assert.equal(svgEscape('&lt;'), '&amp;lt;', 'input that already looks escaped is still data');
});

test('non-strings are coerced rather than thrown on', () => {
  assert.equal(svgEscape(2026), '2026');
  assert.equal(svgEscape(null), 'null');
});

test('the escaped output carries no raw markup character left', () => {
  const out = svgEscape('a <b> & "c" — d');
  assert.doesNotMatch(out, /[<>"]/);
  assert.match(out, /—/, 'an em dash is legitimate typography on a card and is left alone');
});
