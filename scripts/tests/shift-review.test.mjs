// Runs the real render-triage: a blind page tested against a hand-made key would prove nothing
// about the key the proof seats actually seal.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { EXIT } from '../lib/exit-codes.mjs';
import { pendingRuns, reviewDir, reviewSize, treeBytes } from '../lib/shift-review-state.mjs';
import { blindSection, buildPage, main, verdictLine } from '../shift-review.mjs';

const TRIAGE = fileURLToPath(new URL('../render-triage.mjs', import.meta.url));
const SECRET_A = 'the candidate prompt nobody may read before a verdict';
const SECRET_B = 'the control prompt that is also different in its own words';

function tmpRoot(backlogRows = []) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'shift-review-'));
  fs.mkdirSync(path.join(root, 'librarian', 'harvest'), { recursive: true });
  fs.writeFileSync(path.join(root, 'librarian', 'harvest', 'backlog.jsonl'), backlogRows.map((r) => `${JSON.stringify(r)}\n`).join(''));
  return root;
}

const pairOf = (id, extra = {}) => ({
  id,
  brief: `brief for ${id}`,
  discrimination: { between: 0.5, within: 0.1 },
  arms: {
    corpusBefore: { file: `renders/${id}-armBefore.png`, prompt: SECRET_B },
    corpusAfter: { file: `renders/${id}-armAfter.png`, prompt: SECRET_A },
  },
  ...extra,
});

function item(root, run, { pairs = [pairOf('shot1')], seal = true, flags = [], ...fields } = {}) {
  const dir = path.join(root, '.ai', 'shift', 'review', 'items', run);
  fs.mkdirSync(path.join(dir, 'renders'), { recursive: true });
  for (const p of pairs) for (const a of Object.values(p.arms)) fs.writeFileSync(path.join(dir, a.file), Buffer.alloc(2048, a.file));
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ run, question: 'Which table looks more solid?', pairs, ...fields }));
  if (seal) {
    const r = spawnSync(process.execPath, [TRIAGE, 'sheet', dir, ...flags], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
  }
  return dir;
}

function run(root, ...args) {
  const out = [];
  const err = [];
  const code = main(args, { root, log: (s) => out.push(s), err: (s) => err.push(s) });
  return { code, out: out.join('\n'), err: err.join('\n') };
}
const page = (root) => fs.readFileSync(path.join(reviewDir(root), 'index.html'), 'utf8');

test('build: question, side-by-side blind outputs, relative paths and the exact command', () => {
  const root = tmpRoot();
  item(root, 'run-1', { landing: 'the multiview sheet technique' });
  const r = run(root, 'build');
  assert.equal(r.code, EXIT.OK, r.err);
  const html = page(root);
  assert.match(html, /Which table looks more solid\?/);
  assert.match(html, /brief for shot1/);
  assert.match(html, /the multiview sheet technique/);
  assert.ok(html.includes('src="items/run-1/triage/shot1-X.png"'));
  assert.ok(html.includes('src="items/run-1/triage/shot1-Y.png"'));
  assert.ok(html.includes('/shift verdict run-1 shot1=&lt;label&gt;'));
});

test('the page never exposes the key, the arm names, their files or their prompts', () => {
  const root = tmpRoot();
  item(root, 'run-1');
  run(root, 'build');
  const html = page(root);
  for (const secret of ['key.json', 'corpusBefore', 'corpusAfter', 'armBefore', 'armAfter', SECRET_A, SECRET_B, '"pairs"']) {
    assert.ok(!html.includes(secret), `leaked: ${secret}`);
  }
});

test('what a pick lands is stated without tying it to a letter', () => {
  const root = tmpRoot();
  item(root, 'run-1', { landing: 'LANDING-TEXT' });
  run(root, 'build');
  const html = page(root);
  const at = html.indexOf('LANDING-TEXT');
  assert.ok(at > 0);
  assert.equal(html.split('LANDING-TEXT').length, 2, 'stated once, not per label');
  const around = html.slice(html.lastIndexOf('<div class="card plan">', at), html.indexOf('</div>', at));
  assert.doesNotMatch(around, /\b[XYZW]\b/, 'no letter sits next to the landing');
});

test('the same page comes out whichever way the key was shuffled', () => {
  // The strongest statement of blind: nothing on the page depends on the mapping.
  const root = tmpRoot();
  const dir = item(root, 'run-1');
  const before = blindSection(root, 'run-1').html;
  const keyFile = path.join(dir, 'triage', 'key.json');
  const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  const { X, Y } = key.pairs.shot1;
  key.pairs.shot1 = { X: Y, Y: X };
  fs.writeFileSync(keyFile, JSON.stringify(key));
  assert.equal(blindSection(root, 'run-1').html, before);
});

test('every pair must be answered at once, so the command lists them all', () => {
  const root = tmpRoot();
  item(root, 'run-1', { pairs: [pairOf('shot1'), pairOf('shot2')] });
  run(root, 'build');
  assert.ok(page(root).includes('/shift verdict run-1 shot1=&lt;label&gt; shot2=&lt;label&gt;'));
});

test('what the sheet cannot see is still checked: an item that would reveal an arm is withheld whole, exit 1', () => {
  // `landing` is this page's own field, so render-triage's leak check never read it, and it does
  // not search for arm names at all. Both reach only this page.
  const root = tmpRoot();
  item(root, 'leaky', { landing: `the prompt: ${SECRET_A}` });
  item(root, 'named', { pairs: [pairOf('shot1', { brief: 'this one is corpusAfter, honest' })] });
  item(root, 'fine');
  const r = run(root, 'build');
  assert.equal(r.code, EXIT.VIOLATIONS);
  assert.match(r.err, /withheld leaky: would reveal the arms/);
  assert.match(r.err, /withheld named: .*name of arm corpusAfter/);
  const html = page(root);
  assert.ok(!html.includes(SECRET_A));
  assert.ok(!html.includes('items/leaky/'));
  assert.ok(html.includes('items/fine/'));
  assert.match(html, /withheld/);
});

test('a manifest naming another run, or a missing output, is withheld', () => {
  const root = tmpRoot();
  const dir = item(root, 'run-1');
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ ...m, run: 'other' }));
  assert.match(blindSection(root, 'run-1').why, /names run "other"/);
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(m));
  fs.rmSync(path.join(dir, 'triage', 'shot1-X.png'));
  assert.match(blindSection(root, 'run-1').why, /output X is missing/);
});

const radiosOf = (html, pairId) => {
  const group = new RegExp(`<fieldset data-pair="${pairId}">[\\s\\S]*?</fieldset>`).exec(html)?.[0] ?? '';
  return [...group.matchAll(/<label><input type="radio" name="([^"]+)" value="([^"]+)"[^>]*> ([^<]+)<\/label>/g)].map((m) => ({ name: m[1], value: m[2], text: m[3], tag: m[0] }));
};

test('the radios carry exactly the labels plus tie and neither, each labelled, none preselected', () => {
  const root = tmpRoot();
  item(root, 'run-1', { pairs: [pairOf('shot1'), pairOf('shot2')] });
  run(root, 'build');
  const html = page(root);
  for (const id of ['shot1', 'shot2']) {
    const radios = radiosOf(html, id);
    assert.deepEqual(radios.map((r) => r.value), ['X', 'Y', 'tie', 'neither']);
    assert.deepEqual(radios.map((r) => r.text), ['X', 'Y', 'tie', 'neither']);
    assert.deepEqual([...new Set(radios.map((r) => r.name))], [`run-1/${id}`], 'one group per pair');
    assert.ok(radios.every((r) => !/\bchecked\b/.test(r.tag)));
  }
  assert.equal([...html.matchAll(/type="radio"/g)].length, 8);
  assert.match(html, /<legend>Your answer for shot1<\/legend>/);
});

test('the command is built only when every pair has a valid answer', () => {
  const pairs = [{ id: 'shot1', choices: ['X', 'Y', 'tie', 'neither'] }, { id: 'shot2', choices: ['X', 'Y', 'tie', 'neither'] }];
  assert.equal(verdictLine('run-1', pairs, { shot1: 'X', shot2: 'neither' }), '/shift verdict run-1 shot1=X shot2=neither');
  assert.equal(verdictLine('run-1', pairs, { shot2: 'tie', shot1: 'Y' }), '/shift verdict run-1 shot1=Y shot2=tie', 'manifest order');
  assert.equal(verdictLine('run-1', pairs, {}), null);
  assert.equal(verdictLine('run-1', pairs, { shot1: 'X' }), null, 'partial is refused, as reveal refuses it');
  assert.equal(verdictLine('run-1', pairs, { shot1: 'X', shot2: 'Q' }), null, 'a stale label is not an answer');
  assert.equal(verdictLine('run-1', [], {}), null);
});

test('the line the page builds is one reveal accepts', () => {
  const root = tmpRoot();
  const dir = item(root, 'run-1', { pairs: [pairOf('shot1'), pairOf('shot2')] });
  const pairs = ['shot1', 'shot2'].map((id) => ({ id, choices: ['X', 'Y', 'tie', 'neither'] }));
  const line = verdictLine('run-1', pairs, { shot1: 'X', shot2: 'tie' });
  const [, , ...args] = line.split(' ');
  assert.equal(run(root, 'verdict', ...args).code, EXIT.OK);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'verdict.json'), 'utf8')).pairs.shot2.operator, 'tie');
});

test('each pair says what it decides: its own line, or the default that does not repeat the landing', () => {
  const root = tmpRoot();
  item(root, 'run-1', { landing: 'LANDING-TEXT', pairs: [pairOf('shot1', { decides: 'Whether a sheet <beats> a line' }), pairOf('shot2')] });
  assert.equal(run(root, 'build').code, EXIT.OK);
  const html = page(root);
  assert.ok(html.includes('<b>What this decides:</b> Whether a sheet &lt;beats&gt; a line'), 'escaped');
  assert.match(html, /<b>What this decides:<\/b> Whether the candidate this run tested lands/);
  assert.equal(html.split('LANDING-TEXT').length, 2);
  assert.ok(html.indexOf('What this decides') < html.indexOf('src="items/run-1/triage/shot1-X.png"'), 'the reason comes before the outputs');
});

test('a leaking decides withholds the item: an arm name in any case, a whole prompt or a fragment of one', () => {
  const root = tmpRoot();
  const cases = {
    named: 'Whether corpusAfter wins',
    capitalised: 'CorpusAfter or nothing',
    quoted: `Whether "${SECRET_A}" helps`,
    fragment: 'Whether THE CANDIDATE PROMPT nobody may carries it',
    filename: 'Compare shot1-armAfter.png',
  };
  for (const [id, decides] of Object.entries(cases)) item(root, id, { pairs: [pairOf('shot1', { decides })] });
  item(root, 'fine', { pairs: [pairOf('shot1', { decides: 'Whether the table reads as solid wood' })] });
  const r = run(root, 'build');
  assert.equal(r.code, EXIT.VIOLATIONS);
  const html = page(root);
  for (const id of Object.keys(cases)) {
    assert.match(r.err, new RegExp(`withheld ${id}: would reveal the arms`));
    assert.ok(!html.includes(`items/${id}/`));
  }
  assert.ok(html.includes('items/fine/'));
  assert.ok(!html.includes(SECRET_A));
});

test('a decides that shares words with both arms is not a leak', () => {
  const shared = 'a wooden table on a plain grey ground';
  const root = tmpRoot();
  const pair = pairOf('shot1', { decides: `Whether ${shared} reads as solid` });
  pair.arms.corpusBefore.prompt = `${shared}, soft light`;
  pair.arms.corpusAfter.prompt = `${shared}, hard light`;
  item(root, 'run-1', { pairs: [pair] });
  assert.equal(blindSection(root, 'run-1').why, undefined);
});

test('a decides that is not a string, or an id the command cannot carry, is withheld', () => {
  const root = tmpRoot();
  item(root, 'odd', { pairs: [pairOf('shot1', { decides: { text: 'x' } })] });
  item(root, 'spaced', { pairs: [pairOf('shot 1')] });
  assert.match(blindSection(root, 'odd').why, /decides must be a string/);
  assert.match(blindSection(root, 'spaced').why, /cannot be written in a verdict command/);
});

test('the page script is single, inline, parseable, runs the tested function, and reaches nothing', () => {
  const root = tmpRoot();
  const dir = item(root, 'run-1');
  run(root, 'build');
  const html = page(root);
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  assert.equal([...html.matchAll(/<script\b/g)].length, 1);
  const body = scripts[0][1];
  assert.doesNotThrow(() => new vm.Script(body));
  assert.ok(body.includes(verdictLine.toString()), 'the button runs the function the tests run');
  assert.doesNotMatch(body, /\bfetch\b|XMLHttpRequest|WebSocket|sendBeacon|\bimport\b|\beval\b|innerHTML|\.play\(/);
  // Answers are stored per sheet: a reseal reshuffles the labels, so old answers must not return.
  assert.match(body, /box\.dataset\.sheet/);
  const sheetId = JSON.parse(fs.readFileSync(path.join(dir, 'triage', 'key.json'), 'utf8')).sheet;
  assert.ok(html.includes(`data-sheet="${sheetId}"`));
  assert.match(html, /<button type="button" disabled>Copy verdict for run-1<\/button>/);
  assert.match(html, /<strong role="status">0 of 1 answered<\/strong>/);
  assert.match(html, /<label class="line">Command <textarea readonly/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /alt="Output X of shot1"/);
});

test('with nothing to judge the page carries no script', () => {
  const root = tmpRoot();
  run(root, 'build');
  assert.doesNotMatch(page(root), /<script\b/);
});

test('an unsealed item is not shown and is not pending', () => {
  const root = tmpRoot();
  item(root, 'in-progress', { seal: false });
  assert.deepEqual(pendingRuns(root), []);
  assert.equal(run(root, 'build').code, EXIT.OK);
  const html = page(root);
  assert.ok(!html.includes('items/in-progress'));
  assert.match(html, /No proof is waiting on you/);
  assert.match(html, /1 still being prepared/);
});

test('below-floor pairs are labelled, not hidden', () => {
  const root = tmpRoot();
  item(root, 'low', { pairs: [pairOf('shot1', { discrimination: { between: 0.1, within: 0.1 } })], flags: ['--allow-indistinct'] });
  run(root, 'build');
  assert.match(page(root), /below the floor/);
});

test('order: decisions, then benchmarks, then numbers; no network reference anywhere', () => {
  const bench = { id: 'b1', status: 'held', queue: 'media', title: 'H3 clip timing', render: { kind: 'benchmark', runId: 'bench-1', brief: 'timed clip', estGpuMin: 8, machine: 'Lynx', display: 'on' } };
  const proofRow = { id: 'p1', status: 'held', queue: 'media', title: 'not a benchmark', render: { kind: 'proof', runId: 'run-1' } };
  const doneBench = { id: 'b2', status: 'landed', title: 'an old benchmark', render: { kind: 'benchmark', runId: 'bench-0' } };
  const root = tmpRoot([bench, proofRow, doneBench]);
  item(root, 'run-1');
  fs.mkdirSync(path.join(reviewDir(root), 'items', 'bench-1'), { recursive: true });
  fs.writeFileSync(path.join(reviewDir(root), 'items', 'bench-1', 'clip one.mp4'), 'x');
  assert.equal(run(root, 'build').code, EXIT.OK);
  const html = page(root);
  const [q, b, n] = ['Which table looks more solid?', 'Benchmarks (nothing to judge)', '<h2>Numbers</h2>'].map((s) => html.indexOf(s));
  assert.ok(q > 0 && q < b && b < n, `${q} ${b} ${n}`);
  assert.match(html, /H3 clip timing/);
  assert.ok(html.includes('href="items/bench-1/clip%20one.mp4"'), 'relative and encoded');
  assert.ok(!html.includes('an old benchmark'));
  assert.match(html, /0 still being prepared/, 'a benchmark folder is not a proof in preparation');
  assert.doesNotMatch(html, /https?:\/\//);
  assert.doesNotMatch(html, /<link\b/);
  assert.doesNotMatch(html, /<script\b[^>]*\bsrc=/);
});

test('verdict reveals through render-triage, prints the result, cleans nothing, moves the item down', () => {
  const root = tmpRoot();
  const dir = item(root, 'run-1');
  run(root, 'build');
  const r = run(root, 'verdict', 'run-1', 'shot1=X');
  assert.equal(r.code, EXIT.OK, r.err);
  assert.match(r.out, /shot1\s+picked X\s+-> arm corpus(Before|After)/);
  assert.ok(fs.existsSync(path.join(dir, 'verdict.json')));
  assert.ok(fs.existsSync(path.join(dir, 'triage', 'shot1-X.png')), 'media stays until clean');
  const html = page(root);
  assert.match(html, /No proof is waiting on you/, 'the page stops asking');
  assert.match(html, /Answered, media still on disk/);
  assert.match(html, /shift-review\.mjs clean run-1/);
  assert.equal(reviewSize(root).pending, 0);
});

test('verdict passes render-triage\'s refusals through, and offers no --force', () => {
  const root = tmpRoot();
  const dir = item(root, 'run-1', { pairs: [pairOf('shot1'), pairOf('shot2')] });
  assert.equal(run(root, 'verdict', 'run-1', 'shot1=X').code, EXIT.FATAL, 'every pair or none');
  assert.equal(run(root, 'verdict', 'run-1', 'shot1=Q', 'shot2=X').code, EXIT.FATAL, 'label not on the sheet');
  assert.ok(!fs.existsSync(path.join(dir, 'verdict.json')));
  assert.equal(run(root, 'verdict', 'run-1', 'shot1=tie', 'shot2=neither').code, EXIT.OK);
  const again = run(root, 'verdict', 'run-1', 'shot1=X', 'shot2=X');
  assert.equal(again.code, EXIT.FATAL);
  assert.match(again.err, /already records/);
  assert.equal(run(root, 'verdict', 'run-1', 'shot1=X', 'shot2=X', '--force').code, EXIT.FATAL);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'verdict.json'), 'utf8')).pairs.shot1.operator, 'tie');
});

test('clean refuses before a verdict and frees the media after one', () => {
  const root = tmpRoot();
  const dir = item(root, 'run-1');
  const early = run(root, 'clean', 'run-1');
  assert.equal(early.code, EXIT.FATAL);
  assert.match(early.err, /no verdict\.json/);
  assert.ok(fs.existsSync(path.join(dir, 'renders', 'shot1-armAfter.png')));
  assert.equal(run(root, 'clean', 'run-1', '--force').code, EXIT.FATAL);
  run(root, 'verdict', 'run-1', 'shot1=X');
  const r = run(root, 'clean', 'run-1');
  assert.equal(r.code, EXIT.OK, r.err);
  assert.match(r.out, /clean: removed/);
  assert.ok(!fs.existsSync(path.join(dir, 'renders', 'shot1-armAfter.png')));
  assert.ok(fs.existsSync(path.join(dir, 'verdict.json')), 'the judgement outlives the media');
  assert.ok(!page(root).includes('Answered, media still on disk'), 'nothing left to free');
});

test('a run id is not a path', () => {
  const root = tmpRoot();
  for (const args of [['clean', '..'], ['clean', '../x'], ['verdict', '.', 'a=b'], ['clean', 'absent'], ['clean'], ['verdict', 'x']]) {
    assert.equal(run(root, ...args).code, EXIT.FATAL, JSON.stringify(args));
  }
});

test('size --json has exactly the agreed shape, on an empty folder too', () => {
  const root = tmpRoot();
  const r = run(root, 'size', '--json');
  assert.equal(r.code, EXIT.OK);
  assert.deepEqual(JSON.parse(r.out), { reviewGb: 0, capGb: 5, overCap: false, pending: 0 });
  assert.match(run(root, 'size').out, /review 0 GB of 5 GB/);
});

test('size takes the cap from config, reports over cap, and refuses a broken config', () => {
  const root = tmpRoot();
  item(root, 'run-1');
  fs.writeFileSync(path.join(root, '.ai', 'shift', 'config.json'), JSON.stringify({ reviewCapGb: 0.000001 }));
  const s = JSON.parse(run(root, 'size', '--json').out);
  assert.deepEqual([s.capGb, s.overCap, s.pending], [0.000001, true, 1]);
  assert.match(buildPage(root).html, /proofs paused/);
  fs.writeFileSync(path.join(root, '.ai', 'shift', 'config.json'), '{"reviewCapGB":1}');
  assert.equal(run(root, 'size', '--json').code, EXIT.FATAL);
});

test('a hard-linked output counts once, or proofs would pause at half the cap', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shift-bytes-'));
  fs.writeFileSync(path.join(dir, 'a.bin'), Buffer.alloc(1000));
  fs.linkSync(path.join(dir, 'a.bin'), path.join(dir, 'b.bin'));
  fs.mkdirSync(path.join(dir, 'sub'));
  fs.writeFileSync(path.join(dir, 'sub', 'c.bin'), Buffer.alloc(500));
  assert.equal(treeBytes(dir), 1500);
  assert.equal(treeBytes(path.join(dir, 'absent')), 0);
});

test('a real sealed sheet is measured without its neutral copies', () => {
  const root = tmpRoot();
  const dir = item(root, 'run-1');
  const measured = treeBytes(dir);
  const manifestAndSheet = ['manifest.json', 'triage/index.html', 'triage/key.json'].reduce((n, f) => n + fs.statSync(path.join(dir, f)).size, 0);
  assert.equal(measured, manifestAndSheet + 2 * 2048);
});

test('usage errors are could-not-run', () => {
  const root = tmpRoot();
  for (const args of [[], ['bogus'], ['build', '--x'], ['size', '--yaml']]) {
    assert.equal(run(root, ...args).code, EXIT.FATAL, JSON.stringify(args));
  }
});
