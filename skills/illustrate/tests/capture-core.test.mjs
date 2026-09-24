import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs, blankScore, captureName, textVerdict, TEXT_LIMITS } from '../scripts/lib/capture-core.mjs';

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

test('the first run kept-variant measurements are flagged under the defaults', () => {
  assert.equal(textVerdict({ words: 92, longestRun: 19, textRatio: 0.07 }, TEXT_LIMITS).heavy, true);
  assert.equal(textVerdict({ words: 131, longestRun: 16, textRatio: 0.144 }, TEXT_LIMITS).heavy, true);
});

test('text limits are overridable from the command line', () => {
  const a = parseArgs(['--url', 'x', '--section', 's', '--tabs', 'current,a', '--out', 'o', '--max-words', '50', '--max-run', '8']);
  assert.deepEqual(a.limits, { maxWords: 50, maxRun: 8 });
});
