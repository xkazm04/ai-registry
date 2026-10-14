import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runQuery, parseLedger, tableGroups, estimateTokens } from '../ledger-read.mjs';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ledger-read.mjs');

const LEDGER = [
  '# Ledger',
  '',
  '| Date | Technique | Verdict | Note |',
  '| --- | --- | --- | --- |',
  '| 2026-10-01 | alpha | better | first |',
  '| 2026-10-02 | beta | not-better | a cell with an escaped \\| pipe |',
  '',
  '## A side table',
  '',
  '| k | v |',
  '| --- | --- |',
  '| x | y |',
  '',
  'A paragraph between, then rows appended without a header:',
  '',
  '| 2026-10-03 | gamma | better | surplus | cells | stay |',
  '| 2026-10-04 | delta | unmeasurable |',
  '',
  'Closing paragraph one.',
  '',
  'Closing paragraph two,',
  'on two lines.',
  '',
].join('\n');

const q = (argv, text = LEDGER) => runQuery(argv, text);
const json = (argv, text) => JSON.parse(q([...argv, '--json'], text).output);

test('table policy: headerless rows join the widest table above; surplus stays in the last column', () => {
  const { main, groups } = tableGroups(parseLedger(LEDGER));
  assert.equal(groups.length, 2);
  assert.deepEqual(main.columns, ['Date', 'Technique', 'Verdict', 'Note']);
  const r = json(['rows', 'f.md']);
  assert.equal(r.total, 4);
  assert.deepEqual(r.items.map((i) => i.fields.Technique), ['alpha', 'beta', 'gamma', 'delta']);
  assert.equal(r.items[1].fields.Note, 'a cell with an escaped | pipe');
  assert.equal(r.items[2].fields.Note, 'surplus | cells | stay');
  assert.equal(r.items[2].ragged, true);
  assert.equal(r.items[3].fields.Note, '');
  // the side table is reachable by index, and not mixed into the main one
  assert.deepEqual(json(['rows', 'f.md', '--table', '1']).items.map((i) => i.fields.k), ['x']);
});

test('selection: --where (=, ~, !~, *), --since, --last, --fields, with omissions said', () => {
  let r = json(['rows', 'f.md', '--where', 'Verdict=better']);
  assert.deepEqual(r.items.map((i) => i.fields.Technique), ['alpha', 'gamma']);
  assert.deepEqual(r.omitted, [{ reason: '--where Verdict=better', count: 2 }]);
  r = json(['rows', 'f.md', '--where', 'Verdict!~better']);
  assert.deepEqual(r.items.map((i) => i.fields.Technique), ['delta']);
  r = json(['rows', 'f.md', '--where', '*~escaped']);
  assert.deepEqual(r.items.map((i) => i.fields.Technique), ['beta']);
  r = json(['rows', 'f.md', '--since', '2026-10-03', '--fields', 'technique']);
  assert.deepEqual(r.items.map((i) => Object.keys(i.fields)), [['Technique'], ['Technique']]);
  assert.ok(r.omitted.some((o) => o.reason === 'columns not selected' && o.columns.includes('Note')));
  r = json(['rows', 'f.md', '--last', '1']);
  assert.equal(r.items[0].fields.Technique, 'delta');
  assert.ok(r.omitted.some((o) => o.reason === 'before --last 1' && o.count === 3));
  r = json(['rows', 'f.md', '--where', 'Technique=nothing']);
  assert.equal(r.items.length, 0);
  assert.equal(r.has_more, false);
  assert.throws(() => q(['rows', 'f.md', '--where', 'Nope=1']), /unknown column/);
});

test('sections and closing prose', () => {
  const s = json(['sections', 'f.md']);
  assert.equal(s.items.length, 1);
  assert.equal(s.items[0].fields.heading, 'A side table');
  const p = json(['prose', 'f.md', '--after-table', '--last-paragraphs', '1']);
  assert.deepEqual(p.items.map((i) => i.fields.text), ['Closing paragraph two,\non two lines.']);
  assert.ok(p.omitted.some((o) => o.reason === 'before --last-paragraphs 1' && o.count === 1));
  const all = json(['prose', 'f.md', '--after-table']);
  assert.deepEqual(all.items.map((i) => i.fields.text), ['Closing paragraph one.', 'Closing paragraph two,\non two lines.']);
});

// A ledger with one oversize row between ordinary ones.
const BIG = 'é€x'.repeat(1000) + ' end-of-big'; // 2- and 3-byte chars, so a cut must snap to a char boundary
const big = (extraRows = []) => [
  '| Date | Technique | Note |',
  '| --- | --- | --- |',
  '| 2026-10-01 | small-1 | ok |',
  `| 2026-10-02 | huge | ${BIG} |`,
  '| 2026-10-03 | small-2 | ok |',
  ...extraRows,
  '',
].join('\n');

function walk(argv, text, mutate) {
  const pages = [];
  let cursor = null;
  let t = text;
  for (let k = 0; k < 100; k++) {
    const r = JSON.parse(runQuery([...argv, '--json', ...(cursor ? ['--cursor', cursor] : [])], t).output);
    pages.push(r);
    if (!r.has_more) break;
    cursor = r.cursor;
    if (mutate && k === 0) t = mutate(t);
  }
  return pages;
}
function rebuild(pages) {
  const out = new Map();
  for (const p of pages) for (const it of p.items) {
    if (!out.has(it.id)) out.set(it.id, {});
    const f = out.get(it.id);
    for (const [name, v] of Object.entries(it.fields)) {
      const seg = typeof v === 'string' ? { text: v, start: 0 } : v;
      (f[name] ||= []).push(seg);
    }
  }
  return [...out.values()].map((f) => Object.fromEntries(Object.entries(f).map(([k, segs]) => [k, segs.sort((a, b) => a.start - b.start).map((s) => s.text).join('')])));
}

test('budget is enforced on the final rendered string, in both modes, at every budget', () => {
  for (const budget of [200, 250, 333, 500, 900, 2000]) {
    for (const mode of [[], ['--json']]) {
      const out = runQuery(['rows', 'f.md', '--max-tokens', String(budget), ...mode], big()).output;
      assert.ok(estimateTokens(out) <= budget, `budget ${budget} ${mode} rendered ${estimateTokens(out)}`);
      const stated = Number((mode.length ? JSON.parse(out).tokens_estimated : /tokens_estimated: (\d+)/.exec(out)[1]));
      assert.equal(stated, estimateTokens(out), 'the stated estimate is the estimate of the printed string');
    }
  }
});

test('an oversize row is split across pages by byte offset and reassembles exactly', () => {
  const pages = walk(['rows', 'f.md', '--max-tokens', '400'], big());
  assert.ok(pages.length > 3, `expected the big row to span pages, got ${pages.length}`);
  const partial = pages.flatMap((p) => p.items).filter((i) => !i.complete);
  assert.ok(partial.length >= 2);
  for (const it of partial) assert.ok(it.truncated.length >= 1 && it.bytes.end > it.bytes.start);
  const rows = rebuild(pages);
  assert.deepEqual(rows.map((r) => r.Technique), ['small-1', 'huge', 'small-2']);
  assert.equal(rows[1].Note, BIG, 'no byte lost or duplicated, no character split');
  for (const p of pages) for (const it of p.items) for (const v of Object.values(it.fields)) assert.ok(!(typeof v === 'string' ? v : v.text).includes('�'), 'a page carried half a character');
  assert.equal(pages.at(-1).has_more, false);
});

test('a row appended mid-walk does not shift pages; the walk ends where it began', () => {
  const plain = walk(['rows', 'f.md', '--max-tokens', '400'], big());
  const appended = walk(['rows', 'f.md', '--max-tokens', '400'], big(), (t) => t + '| 2026-10-09 | late | ok |\n');
  assert.deepEqual(rebuild(appended), rebuild(plain));
  assert.equal(appended.length, plain.length);
  // a newest-first ledger: a row PREPENDED above the anchor does not shift pages either
  const prepended = walk(['rows', 'f.md', '--max-tokens', '400'], big(), (t) => t.replace('| --- | --- | --- |\n', '| --- | --- | --- |\n| 2026-10-10 | newest | ok |\n'));
  assert.deepEqual(rebuild(prepended), rebuild(plain));
});

test('a changed anchor row is refused, never skipped; a cursor from another query is refused', () => {
  const first = JSON.parse(runQuery(['rows', 'f.md', '--max-tokens', '400', '--json'], big()).output);
  assert.equal(first.has_more, true);
  const edited = big().replace(' end-of-big', ' end-of-big (edited)');
  assert.throws(() => runQuery(['rows', 'f.md', '--max-tokens', '400', '--cursor', first.cursor], edited), /cursor refused: anchor row/);
  assert.throws(() => runQuery(['rows', 'f.md', '--fields', 'Note', '--cursor', first.cursor], big()), /different query/);
  // positive control: the same cursor on the unchanged file is accepted
  assert.doesNotThrow(() => runQuery(['rows', 'f.md', '--max-tokens', '400', '--cursor', first.cursor], big()));
});

test('--last binds the walk: the cursor keeps the original last-N window after an append', () => {
  const rows = Array.from({ length: 30 }, (_, k) => `| 2026-09-${String(k + 1).padStart(2, '0')} | t${k} | ${'x'.repeat(200)} |`);
  const text = ['| Date | Technique | Note |', '| --- | --- | --- |', ...rows, ''].join('\n');
  const pages = walk(['rows', 'f.md', '--last', '10', '--max-tokens', '300'], text, (t) => t + '| 2026-10-01 | t-new | y |\n');
  assert.deepEqual(rebuild(pages).map((r) => r.Technique), Array.from({ length: 10 }, (_, k) => `t${k + 20}`));
});

test('the text mode says what it omitted and whether there is more', () => {
  const out = runQuery(['rows', 'f.md', '--max-tokens', '200', '--fields', 'Date,Note'], big()).output;
  assert.match(out, /^omitted: .*columns not selected: Technique/m);
  assert.match(out, /^has_more: true \| remaining: \d+ rows$/m);
  assert.match(out, /^cursor: \S+$/m);
  assert.match(out, /\[bytes 0-\d+ of \d+, truncated\]/);
});

test('CLI: exit 0 on an answer (also an empty one), 2 on usage, a too-small budget, a refused cursor', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-read-'));
  try {
    const f = path.join(dir, 'l.md');
    fs.writeFileSync(f, big());
    const run = (...a) => spawnSync(process.execPath, [SCRIPT, ...a], { encoding: 'utf8' });
    assert.equal(run('rows', f).status, 0);
    assert.equal(run('rows', f, '--where', 'Technique=none').status, 0);
    assert.equal(run('rows', f, '--bogus').status, 2);
    assert.equal(run('rows', f, '--max-tokens', '5').status, 2);
    const first = JSON.parse(run('rows', f, '--max-tokens', '300', '--json').stdout);
    fs.writeFileSync(f, big().replace('small-1', 'small-1-renamed').replace(' end-of-big', ' end-of-big!'));
    const r = run('rows', f, '--max-tokens', '300', '--cursor', first.cursor);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /cursor refused/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
