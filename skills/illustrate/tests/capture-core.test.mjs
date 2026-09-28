import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs, blankScore, captureName, textVerdict, TEXT_LIMITS, countWords, balanceVerdict, emptyRatio, BALANCE_LIMITS } from '../scripts/lib/capture-core.mjs';

const px = (r, g, b) => [r, g, b, 255];

test('a uniform frame is blank, a frame with content is not', () => {
  const flat = Array.from({ length: 400 }, () => px(17, 19, 24)).flat();
  assert.equal(blankScore(flat).blank, true);
  const content = Array.from({ length: 400 }, (_, i) => (i % 5 === 0 ? px(230, 230, 230) : px(17, 19, 24))).flat();
  assert.equal(blankScore(content).blank, false);
});

test('a few stray pixels do not make a frame non-blank', () => {
  const nearlyFlat = Array.from({ length: 1000 }, (_, i) => (i < 5 ? px(255, 255, 255) : px(20, 20, 20))).flat();
  assert.equal(blankScore(nearlyFlat).blank, true);
});

test('an empty buffer is blank', () => {
  assert.deepEqual(blankScore([]), { spread: 0, blank: true });
});

test('parseArgs requires url, a kebab-case section, two tabs and an out dir', () => {
  assert.match(parseArgs([]).error, /--url/);
  assert.match(parseArgs(['--url', 'x', '--section', 'Bad Name']).error, /section/);
  assert.match(parseArgs(['--url', 'x', '--section', 'use-cases', '--tabs', 'current']).error, /two/);
  const ok = parseArgs(['--url', 'http://l/', '--section', 'use-cases', '--tabs', 'current, relay', '--out', 'o', '--widths', '1440,375']);
  assert.deepEqual(ok.tabs, ['current', 'relay']);
  assert.deepEqual(ok.widths, [1440, 375]);
  assert.equal(parseArgs(['--url', 'x', '--nope']).error, 'unknown argument: --nope');
});

test('capture names encode section, tab, width and motion', () => {
  assert.equal(captureName('hub', 'relay', 390, 'reduce'), 'hub-relay-390-reduced.png');
  assert.equal(captureName('hub', 'current', 1280, 'no-preference'), 'hub-current-1280-motion.png');
});

test('a label layer passes; sentences, word piles and text-covered art do not', () => {
  assert.equal(textVerdict({ words: 12, longestRun: 3, textRatio: 0.03 }).heavy, false);
  assert.match(textVerdict({ words: 12, longestRun: 16, textRatio: 0.03 }).reasons[0], /sentence/);
  assert.equal(textVerdict({ words: 131, longestRun: 4, textRatio: 0.03 }).heavy, true);
  assert.equal(textVerdict({ words: 10, longestRun: 2, textRatio: 0.14 }).heavy, true);
});

test('1.2 room: labels plus a short key pass (35 words, 7-word captions, 8% text)', () => {
  assert.equal(textVerdict({ words: 35, longestRun: 7, textRatio: 0.08 }).heavy, false);
});

test('empty cells: a flat frame is all empty, a striped one is not', () => {
  const w = 16;
  const h = 16;
  const flat = Array.from({ length: w * h }, () => [20, 20, 20, 255]).flat();
  assert.equal(emptyRatio(flat, w, h), 1);
  const striped = Array.from({ length: w * h }, (_, i) => (i % 2 ? [220, 220, 220, 255] : [20, 20, 20, 255])).flat();
  assert.equal(emptyRatio(striped, w, h), 0);
  // content in one quadrant of four
  const quad = Array.from({ length: w * h }, (_, i) => {
    const x = i % w;
    const y = Math.floor(i / w);
    return x < 8 && y < 8 && (x + y) % 2 ? [220, 220, 220, 255] : [20, 20, 20, 255];
  }).flat();
  assert.equal(emptyRatio(quad, w, h), 0.75);
});

test('balance: the accepted illustrations pass; sparse art, tiny labels and thin sections do not', () => {
  // Measured 2026-09-25 on the owner-accepted run-twice / nested-vault / router art at 1280px.
  for (const ok of [
    { empty: 0.28, minLabelPx: 14, sectionWords: 16, width: 1280 },
    { empty: 0.33, minLabelPx: 19, sectionWords: 23, width: 1280 },
    { empty: 0.32, minLabelPx: 17, sectionWords: 24, width: 1280 },
  ]) assert.equal(balanceVerdict(ok).failed, false);
  assert.match(balanceVerdict({ empty: 0.6, minLabelPx: 18, sectionWords: 20, width: 1280 }).reasons[0], /SPARSE/);
  assert.match(balanceVerdict({ empty: 0.2, minLabelPx: 9, sectionWords: 20, width: 1280 }).reasons[0], /TINY-LABELS/);
  assert.equal(balanceVerdict({ empty: 0.2, minLabelPx: 11, sectionWords: 20, width: 390 }).failed, false);
  assert.match(balanceVerdict({ empty: 0.2, minLabelPx: 18, sectionWords: 8, width: 1280 }).reasons[0], /TEXT-THIN/);
  // A section without scoped art has no emptiness reading and is not penalised for it.
  assert.equal(balanceVerdict({ empty: null, minLabelPx: null, sectionWords: 20, width: 1280 }).failed, false);
  assert.equal(BALANCE_LIMITS.maxEmpty, 0.45);
});

test('balance limits are overridable from the command line', () => {
  const a = parseArgs(['--url', 'x', '--section', 's', '--tabs', 'current,a', '--out', 'o', '--max-empty', '0.4', '--min-label', '14', '--min-section-words', '20']);
  assert.deepEqual(a.balance, { maxEmpty: 0.4, minLabelDesktop: 14, minSectionWords: 20 });
});

test('the first run kept-variant measurements are flagged under the defaults', () => {
  assert.equal(textVerdict({ words: 92, longestRun: 19, textRatio: 0.07 }, TEXT_LIMITS).heavy, true);
  assert.equal(textVerdict({ words: 131, longestRun: 16, textRatio: 0.144 }, TEXT_LIMITS).heavy, true);
});

test('text limits are overridable from the command line', () => {
  const a = parseArgs(['--url', 'x', '--section', 's', '--tabs', 'current,a', '--out', 'o', '--max-words', '50', '--max-run', '8']);
  assert.deepEqual(a.limits, { maxWords: 50, maxRun: 8 });
});

test('words split on whitespace, not on a letter', () => {
  assert.equal(countWords('Constraint'), 1);
  assert.equal(countWords('  Your  device  '), 2);
  assert.equal(countWords('Stores secrets in the OS vault'), 6);
  assert.equal(countWords(''), 0);
});

test('--hide takes a comma list of selectors', () => {
  const a = parseArgs(['--url', 'x', '--section', 's', '--tabs', 'current,a', '--out', 'o', '--hide', '.cookie, #banner']);
  assert.deepEqual(a.hide, ['.cookie', '#banner']);
});
