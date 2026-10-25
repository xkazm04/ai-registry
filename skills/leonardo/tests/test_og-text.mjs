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
import { wrapText, svgEscape, buildCardSvg } from '../tools/og-text.mjs';

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

// ------------------------------------------------------------------ buildCardSvg
// `--font-display '"Space Grotesk", sans-serif'` is an ordinary CSS font stack. Before
// the builder escaped attributes it closed font-family="..." early; the SVG was
// malformed and sharp reported a composite failure, not bad input. No XML library
// here (the registry has no dependencies): a tiny scanner that checks what that bug
// breaks - every tag's attributes are name="value" pairs, no value holds a raw `<`
// or a bare `&`, text holds neither, and tags nest.
function xmlProblems(xml) {
  const problems = [];
  const stack = [];
  const re = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<(\/?)([A-Za-z][\w:-]*)([^>]*?)(\/?)>|([^<]+)|(<)/g;
  const BARE_AMP = /&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/;
  let m;
  while ((m = re.exec(xml))) {
    const [, close, name, attrs, selfClose, text, stray] = m;
    if (stray) { problems.push(`stray "<" at ${m.index}`); continue; }
    if (text !== undefined) {
      if (BARE_AMP.test(text)) problems.push(`bare & in text ${JSON.stringify(text)}`);
      continue;
    }
    if (!name) continue; // comment or declaration
    if (close) {
      if (stack.pop() !== name) problems.push(`mismatched </${name}>`);
      continue;
    }
    const rest = attrs.replace(/\s+[A-Za-z][\w:-]*="([^"<]*)"/g, (_, v) => {
      if (BARE_AMP.test(v)) problems.push(`bare & in attribute value ${JSON.stringify(v)}`);
      return '';
    });
    if (rest.trim() !== '') problems.push(`malformed attributes on <${name}>: ${JSON.stringify(rest.trim())}`);
    if (!selfClose) stack.push(name);
  }
  if (stack.length) problems.push(`unclosed: ${stack.join(',')}`);
  return problems;
}

test('scanner self-check: it does flag a quoted value inside an attribute', () => {
  assert.ok(xmlProblems('<a x="1" font-family=""Space Grotesk", sans-serif">t</a>').length > 0);
  assert.ok(xmlProblems('<a x="a & b"/>').length > 0);
  assert.deepEqual(xmlProblems('<a x="&quot;q&quot;"><b/>t &amp; u</a>'), []);
});

test('a default card is well-formed', () => {
  const { svg } = buildCardSvg({ title: 'Ai Bookkeeper', tagline: 'Double-entry that adds up.' });
  assert.deepEqual(xmlProblems(svg), []);
});

test('a quoted CSS font stack leaves no unescaped quote inside an attribute', () => {
  const { svg } = buildCardSvg({
    title: 'Design & Build',
    tagline: 'Plans <fast> & "cheap"',
    fontDisplay: '"Space Grotesk", sans-serif',
    fontBody: "'DM Sans', \"Helvetica Neue\", sans-serif",
  });
  assert.deepEqual(xmlProblems(svg), []);
  assert.match(svg, /font-family="&quot;Space Grotesk&quot;, sans-serif"/);
});

test('hostile colour arguments cannot break out of their attributes', () => {
  const { svg } = buildCardSvg({
    title: 'T', bg: '#000" onload="x', ink: '"><script/>', accent: 'red"&',
  });
  assert.deepEqual(xmlProblems(svg), []);
  assert.doesNotMatch(svg, /<script/);
});

test('buildCardSvg reports the wrapped lines it drew', () => {
  const r = buildCardSvg({ title: 'one two three four five six seven eight nine ten eleven', tagline: '' });
  assert.equal(r.titleLines.length, 2, 'the title is capped at two lines');
  assert.deepEqual(r.taglineLines, []);
});
