// node --test skills/scan-sweep/tests/rank.test.mjs
// Pins the round's slot allocation (scan-finding/1 "Coverage"): every lens with a verified finding
// gets its MVP ranked first, the remaining slots go by score across lenses, the rest is reserve -
// so a 13-lens deep tier can no longer crowd the tail lenses out of a 16-slot round.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { allocate, lensTable } from '../scripts/rank.mjs';

const SCRIPT = fileURLToPath(new URL('../scripts/rank.mjs', import.meta.url));
const made = [];
const scratch = () => { const d = mkdtempSync(join(tmpdir(), 'scan-sweep-rank-')); made.push(d); return d; };
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

const f = (lens, title, impact, extra = {}) => ({ lens, title, impact, effort: 2, risk: 2, confidence: 'medium', ...extra });

test('a tail lens keeps its MVP even when the head lenses outscore it on every slot', () => {
  const head = Array.from({ length: 6 }, (_, i) => f('bounty-hunter', `head ${i}`, 9));
  const out = allocate([...head, f('copy-auditor', 'tail', 2)], 3);
  const tail = out.find((x) => x.title === 'tail');
  assert.equal(tail.band, 'ranked');
  assert.equal(tail.mvp, true);
  assert.equal(tail.mvp_rule, 'top-score');
  assert.deepEqual(out.filter((x) => x.band === 'ranked').map((x) => x.title).sort(), ['head 0', 'head 1', 'tail']);
  assert.equal(out.filter((x) => x.band === 'reserve').length, 4, 'over the cap is reserve, not dropped');
});

test('remaining slots go by score across lenses; ranked band comes first in the output', () => {
  const out = allocate([f('a', 'a-low', 2), f('a', 'a-top', 6), f('b', 'b-top', 5), f('b', 'b-mid', 4), f('a', 'a-mid', 3)], 3);
  assert.deepEqual(out.map((x) => [x.title, x.band]), [['a-top', 'ranked'], ['b-top', 'ranked'], ['b-mid', 'ranked'], ['a-mid', 'reserve'], ['a-low', 'reserve']]);
  assert.equal(out.filter((x) => x.mvp).length, 2, 'exactly one MVP per lens');
});

test('score comes from score.mjs (card score overwritten); effort from size; unscored ranks last, never 0', () => {
  const out = allocate([
    { lens: 'a', title: 'unscored', impact: 9 },
    { lens: 'a', title: 'sized', impact: 8, size: 'M', risk: 3, confidence: 'medium', score: 1 },
  ], 5);
  assert.equal(out[0].title, 'sized');
  assert.equal(out[0].score, 40.5);
  assert.equal(out[0].effort, 4);
  assert.ok(!('score' in out[1]), 'no effort and no size: unscored');
  assert.equal(out[0].mvp, true);
});

test('override: the reader names the MVP with a reason; without one it is refused', () => {
  const out = allocate([f('a', 'top', 9), f('a', 'chosen', 3, { mvp_rule: 'override', mvp_why: 'the root cause of top' })], 1);
  const chosen = out.find((x) => x.title === 'chosen');
  assert.deepEqual([chosen.mvp, chosen.mvp_rule, chosen.band], [true, 'override', 'ranked']);
  assert.equal(out.find((x) => x.title === 'top').band, 'reserve');
  assert.throws(() => allocate([f('a', 'x', 3, { mvp_rule: 'override' })], 1), /mvp_why/);
  assert.throws(() => allocate([{ title: 'no lens', impact: 3, effort: 2 }], 1), /no lens/);
});

test('more lenses than slots: every MVP is ranked and the overflow is reported', () => {
  const out = allocate([f('a', 'a', 3), f('b', 'b', 3), f('c', 'c', 3)], 2);
  assert.equal(out.filter((x) => x.band === 'ranked').length, 3);
});

test('lensTable: per-lens counts, MVP title and score; tokens only when given', () => {
  const out = allocate([f('a', 'a1', 6), f('a', 'a2', 5), f('b', 'b1', 4)], 2);
  const t = lensTable(out, { tokens: { a: 1200 } });
  assert.deepEqual(t, [
    { lens: 'a', ranked: 1, reserve: 1, mvp_title: 'a1', mvp_score: out[0].score, tokens: 1200 },
    { lens: 'b', ranked: 1, reserve: 0, mvp_title: 'b1', mvp_score: out.find((x) => x.title === 'b1').score },
  ]);
});

test('CLI: writes the ranked file, annotates the ladder from a trust file, prints the table and skipped list', () => {
  const dir = scratch();
  const file = join(dir, 'f.jsonl');
  writeFileSync(file, [f('error-handler', 'eh', 7, { category: 'technical', size: 'S' }), f('feature-scout', 'fs', 6, { category: 'product', size: 'M' })].map((x) => JSON.stringify(x)).join('\n'));
  writeFileSync(join(dir, 'trust.json'), JSON.stringify({ reachable: false, reason: 'down' }));
  const out = join(dir, 'ranked.jsonl');
  const stdout = execFileSync(process.execPath, [SCRIPT, '--file', file, '--cap', '16', '--out', out, '--trust', join(dir, 'trust.json'), '--skipped', 'mobile-specialist'], { encoding: 'utf8' });
  const rows = readFileSync(out, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.deepEqual(rows.map((r) => [r.title, r.slice, r.level, r.lane_a_ok, r.auto_decide]), [
    ['eh', 'technical|error-handler|-|S', 2, true, true],
    ['fs', 'product|feature-scout|-|M', 0, false, false],
  ]);
  assert.match(stdout, /\| lens \| ranked \| reserve \| MVP \| MVP score \|\n/);
  assert.doesNotMatch(stdout, /tokens/, 'the tokens column is omitted when unknown');
  assert.match(stdout, /skipped: mobile-specialist/);
});

test('category: a product lens card relabelled technical is clamped to product and reported (never product -> technical)', () => {
  // Dowser cycle 2: a fork relabelled its product lens's cards `technical` and they landed in an L1 slice,
  // skipping the human gate. Operator decision 2026-10-31: technical -> product is allowed, the reverse is not.
  const out = allocate([
    f('feature-scout', 'relabelled', 6, { category: 'technical', size: 'S' }),
    f('error-handler', 'moved to product', 5, { category: 'product', size: 'S' }),
    f('feature-scout', 'defaulted', 4, { size: 'S' }),
  ], 5);
  const by = Object.fromEntries(out.map((x) => [x.title, x]));
  assert.equal(by.relabelled.category, 'product');
  assert.equal(by.relabelled.category_clamped, true);
  assert.equal(by['moved to product'].category, 'product', 'technical lens -> product is the judge\'s right');
  assert.ok(!('category_clamped' in by['moved to product']));
  assert.equal(by.defaulted.category, 'product', 'absent category takes the lens default');
});

test('CLI: the clamp happens before the ladder lookup, and the summary counts it', () => {
  const dir = scratch();
  const file = join(dir, 'f.jsonl');
  writeFileSync(file, JSON.stringify(f('feature-scout', 'fs', 6, { category: 'technical', size: 'S' })));
  writeFileSync(join(dir, 'trust.json'), JSON.stringify({ reachable: false }));
  const out = join(dir, 'ranked.jsonl');
  const stdout = execFileSync(process.execPath, [SCRIPT, '--file', file, '--cap', '4', '--out', out, '--trust', join(dir, 'trust.json'), '--json'], { encoding: 'utf8' });
  const [row] = readFileSync(out, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.deepEqual([row.slice, row.level, row.auto_decide], ['product|feature-scout|-|S', 0, false]);
  assert.equal(JSON.parse(stdout).clamped, 1);
});

test('ladder: Lane C items are never auto-decided - gate none + lane C, and gate contract (personas cycle 2 shapes)', () => {
  const dir = scratch();
  const file = join(dir, 'f.jsonl');
  writeFileSync(file, [
    f('architecture-analyst', 'context-map split', 6, { category: 'technical', size: 'S', gate: 'none', lane: 'C' }),
    f('architecture-analyst', 'context-map contract', 5, { category: 'technical', size: 'S', gate: 'contract' }),
    f('error-handler', 'plain', 5, { category: 'technical', size: 'S', gate: 'none' }),
  ].map((x) => JSON.stringify(x)).join('\n'));
  writeFileSync(join(dir, 'trust.json'), JSON.stringify({ reachable: true, slices: [] }));
  const out = join(dir, 'ranked.jsonl');
  execFileSync(process.execPath, [SCRIPT, '--file', file, '--cap', '4', '--out', out, '--trust', join(dir, 'trust.json')], { encoding: 'utf8' });
  const by = Object.fromEntries(readFileSync(out, 'utf8').trim().split('\n').map((l) => JSON.parse(l)).map((r) => [r.title, r]));
  assert.deepEqual([by['context-map split'].auto_decide, by['context-map split'].lane_a_ok], [false, false]);
  assert.equal(by['context-map contract'].auto_decide, false);
  assert.equal(by.plain.auto_decide, true);
});

test('CLI: an out-of-scale value writes nothing and exits 1', () => {
  const dir = scratch();
  const file = join(dir, 'f.jsonl');
  writeFileSync(file, JSON.stringify(f('a', 'bad', 12)));
  let status = 0;
  try { execFileSync(process.execPath, [SCRIPT, '--file', file, '--cap', '4', '--out', join(dir, 'o.jsonl')], { encoding: 'utf8', stdio: 'pipe' }); } catch (e) { status = e.status; }
  assert.equal(status, 1);
});
