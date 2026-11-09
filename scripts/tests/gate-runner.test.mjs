// The gate used to stop at the first red, so one red step hid every step behind it (19 on
// 2026-10-06, 15 on 2026-11-09). These tests drive the exported runner in
// scripts/lib/gate-plan.mjs with tiny fixture scripts - not the 26 real gates - and prove:
// a keep-going run reports every red and still runs the steps after them; the exit code
// follows "violations (1) beats incomplete (2) beats ok (0)"; --fail-fast and --write stop
// at the first red; output stays in plan order when steps run concurrently.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EXIT } from '../lib/exit-codes.mjs';
import {
  STATUS, runSteps, runExit, selectRows, readRegistryLanes, deriveLanes, unionRows, validatePlan, stepId,
} from '../lib/gate-plan.mjs';

const PREFIX = 'registry-gate-runner-';
const SOURCES = {
  'pass.mjs': 'process.exit(0);\n',
  'viol.mjs': "console.log('found one'); process.exit(1);\n",
  'viol2.mjs': "console.log('found another'); process.exit(1);\n",
  'cnr.mjs': "console.error('missing input'); process.exit(2);\n",
  'contended.mjs': 'process.exit(3);\n',
  'undeclared.mjs': 'process.exit(7);\n',
  // Writes a marker into its cwd, so a test can tell whether it ran.
  'later.mjs': "import fs from 'node:fs'; fs.writeFileSync('later-ran', 'yes'); process.exit(0);\n",
  'slow-a.mjs': "setTimeout(() => { console.log('A-out'); process.exit(0); }, 400);\n",
  'fast-b.mjs': "console.log('B-out'); process.exit(0);\n",
  'log-a.mjs': "import fs from 'node:fs'; fs.appendFileSync('order.log', 'a-start\\n'); setTimeout(() => fs.appendFileSync('order.log', 'a-end\\n'), 2500);\n",
  'log-b.mjs': "import fs from 'node:fs'; fs.appendFileSync('order.log', 'b-start\\n'); setTimeout(() => fs.appendFileSync('order.log', 'b-end\\n'), 100);\n",
  'log-c.mjs': "import fs from 'node:fs'; fs.appendFileSync('order.log', 'c-start\\n'); fs.appendFileSync('order.log', 'c-end\\n');\n",
  // Ends itself after 25s so a removed ceiling fails the test without an immortal orphan.
  'hang.mjs': 'setInterval(() => {}, 1e9); setTimeout(() => process.exit(0), 25_000);\n',
};

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), PREFIX));
  const scriptsDir = path.join(root, 'scripts');
  fs.mkdirSync(scriptsDir);
  for (const [name, src] of Object.entries(SOURCES)) fs.writeFileSync(path.join(scriptsDir, name), src);
  return { root, scriptsDir };
}

function cleanup(root) {
  assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
  assert.ok(path.basename(root).startsWith(PREFIX));
  fs.rmSync(root, { recursive: true, force: true });
}

const sink = () => ({ text: '', write(d) { this.text += String(d); return true; } });
const s = (script, extra = {}) => ({ script, check: [], write: null, lanes: ['x'], ...extra });

async function run(steps, opts = {}) {
  const { root, scriptsDir } = fixture();
  const out = sink();
  const err = sink();
  try {
    const results = await runSteps(steps, { root, scriptsDir, timeoutMs: 10_000, jobs: 2, out, err, ...opts });
    return { results, out: out.text, err: err.text, laterRan: fs.existsSync(path.join(root, 'later-ran')) };
  } finally {
    cleanup(root);
  }
}

test('keep-going: both reds are reported, the step after them runs, exit is 1', async () => {
  const r = await run([s('viol.mjs'), s('viol2.mjs'), s('later.mjs')]);
  assert.deepEqual(r.results.map((x) => x.status), [STATUS.VIOLATIONS, STATUS.VIOLATIONS, STATUS.OK]);
  assert.equal(r.laterRan, true);
  assert.equal(runExit(r.results), EXIT.VIOLATIONS);
  assert.match(r.out, /found one/);
  assert.match(r.out, /found another/);
  for (const x of r.results) assert.ok(Number.isInteger(x.ms) && x.ms >= 0, 'every run step carries a wall time');
});

test('--fail-fast (sequential) stops at the first red and runs nothing after it', async () => {
  const r = await run([s('viol.mjs'), s('viol2.mjs'), s('later.mjs')], { jobs: 1, failFast: true });
  assert.deepEqual(r.results.map((x) => x.status), [STATUS.VIOLATIONS, STATUS.NOT_RUN, STATUS.NOT_RUN]);
  assert.equal(r.laterRan, false);
  assert.equal(runExit(r.results, { failFast: true }), EXIT.VIOLATIONS);
  assert.equal(r.results[1].exit, null);
  assert.equal(r.results[1].ms, null);
});

test('a violation beside a could-not-run exits 1; a could-not-run alone exits 2', async () => {
  const mixed = await run([s('viol.mjs'), s('cnr.mjs'), s('pass.mjs')]);
  assert.deepEqual(mixed.results.map((x) => x.status), [STATUS.VIOLATIONS, STATUS.COULD_NOT_RUN, STATUS.OK]);
  assert.equal(runExit(mixed.results), EXIT.VIOLATIONS);
  const alone = await run([s('cnr.mjs'), s('pass.mjs')]);
  assert.equal(runExit(alone.results), EXIT.FATAL);
  assert.equal(alone.results[0].exit, 2);
});

test('an undeclared code, a CONTENDED code and a timeout are incomplete, never a verdict', async () => {
  // The ceiling leaves the two quick steps room to start on a saturated machine.
  const r = await run([s('undeclared.mjs'), s('contended.mjs'), s('hang.mjs')], { timeoutMs: 4000, jobs: 3 });
  assert.deepEqual(r.results.map((x) => x.status), [STATUS.COULD_NOT_RUN, STATUS.COULD_NOT_RUN, STATUS.TIMED_OUT]);
  assert.equal(runExit(r.results), EXIT.FATAL);
  assert.match(r.err, /undeclared\.mjs exit 7 \(undeclared code\)/);
  assert.match(r.err, /hang\.mjs timed out after 4000 ms/);
  // Fail-fast keeps the gate's historical propagation of a declared code.
  assert.equal(runExit([{ status: STATUS.COULD_NOT_RUN, exit: 3 }], { failFast: true }), 3);
  assert.equal(runExit([{ status: STATUS.COULD_NOT_RUN, exit: 7 }], { failFast: true }), EXIT.FATAL);
  assert.equal(runExit([{ status: STATUS.TIMED_OUT, exit: null }], { failFast: true }), EXIT.FATAL);
});

test('--write stops at the first red: the generator behind a red checker never runs', async () => {
  const steps = [s('pass.mjs', { write: [] }), s('viol.mjs'), s('later.mjs', { write: [] })];
  const r = await run(steps, { mode: 'write', jobs: 1, failFast: true });
  assert.deepEqual(r.results.map((x) => x.status), [STATUS.OK, STATUS.VIOLATIONS, STATUS.NOT_RUN]);
  assert.equal(r.laterRan, false);
});

test('concurrent output is printed whole, in plan order, not in finishing order', async () => {
  const r = await run([s('slow-a.mjs'), s('fast-b.mjs')], { jobs: 2 });
  const a = r.out.indexOf('A-out');
  const b = r.out.indexOf('B-out');
  assert.ok(a !== -1 && b !== -1, r.out);
  assert.ok(a < b, `plan order lost:\n${r.out}`);
  assert.ok(r.out.indexOf('--- node scripts/slow-a.mjs') < a);
  assert.ok(r.out.indexOf('--- node scripts/fast-b.mjs') > a);
});

test('an exclusive step runs with nothing beside it', async () => {
  // Each step appends start/end to one log in its cwd. Without `exclusive`, b starts while
  // a still runs (the control); with it, b waits for a and c waits for b.
  const order = async (exclusive) => {
    const { root, scriptsDir } = fixture();
    try {
      const results = await runSteps(
        [s('log-a.mjs'), s('log-b.mjs', { exclusive }), s('log-c.mjs')],
        { root, scriptsDir, timeoutMs: 10_000, jobs: 3, out: sink(), err: sink() },
      );
      assert.deepEqual(results.map((x) => x.status), [STATUS.OK, STATUS.OK, STATUS.OK]);
      return fs.readFileSync(path.join(root, 'order.log'), 'utf8').trim().split('\n');
    } finally {
      cleanup(root);
    }
  };
  const control = await order(false);
  assert.ok(control.indexOf('b-start') < control.indexOf('a-end'), `control did not overlap: ${control}`);
  assert.deepEqual(await order(true), ['a-start', 'a-end', 'b-start', 'b-end', 'c-start', 'c-end']);
});

test('plan derivation: each row is the plan filtered, --all is the union, each step once', () => {
  const plan = [s('a.mjs', { lanes: ['one'] }), s('b.mjs', { lanes: ['one', 'two'] }), s('c.mjs', { lanes: ['two'] })];
  assert.deepEqual(validatePlan(plan, ['one', 'two']), []);
  const lanes = deriveLanes(plan, ['one', 'two']);
  assert.deepEqual(lanes.one.map(stepId), ['a.mjs', 'b.mjs']);
  assert.deepEqual(lanes.two.map(stepId), ['b.mjs', 'c.mjs']);
  assert.deepEqual(unionRows(plan, ['two', 'one']).map(stepId), ['a.mjs', 'b.mjs', 'c.mjs']);
  const bad = validatePlan([...plan, s('a.mjs', { lanes: ['three'] }), s('d.mjs', { lanes: [] })], ['one', 'two', 'four']);
  assert.ok(bad.some((p) => /declared twice/.test(p)));
  assert.ok(bad.some((p) => /undeclared lane "three"/.test(p)));
  assert.ok(bad.some((p) => /belongs to no lane/.test(p)));
  assert.ok(bad.some((p) => /lane "four" has no steps/.test(p)));
});

test('registry.yaml lanes are read line by line: paths (own and nested) and the gate', () => {
  const yaml = [
    'version: 1',
    'lanes:',
    '  knowledge:',
    '    path: knowledge/',
    '    gate: scripts/check-bundles.mjs',
    '    # a comment',
    '    rules:',
    '      path: rules/',
    '  librarian:',
    '    path: librarian/',
    'guarantees:',
    '  other:',
    '    path: nope/',
  ].join('\r\n');
  assert.deepEqual(readRegistryLanes(yaml), {
    knowledge: { paths: ['knowledge/', 'rules/'], gate: 'scripts/check-bundles.mjs' },
    librarian: { paths: ['librarian/'], gate: null },
  });
});

test('changed paths select rows; an unmapped path selects all and says why', () => {
  const routes = [
    { match: (p) => p.startsWith('signals/'), lanes: ['signals'] },
    { match: (p) => p.startsWith('scripts/lib/'), all: true, why: 'shared library' },
    { match: (p) => p.startsWith('scripts/'), lanes: (p) => (p.endsWith('x.mjs') ? ['a', 'b'] : ['scripts']) },
  ];
  assert.deepEqual(selectRows(['signals/a.md', 'signals/b.md'], routes), { all: false, lanes: ['signals'], why: [] });
  assert.deepEqual(selectRows(['scripts/x.mjs'], routes).lanes, ['a', 'b']);
  const lib = selectRows(['scripts/lib/y.mjs', 'signals/a.md'], routes);
  assert.equal(lib.all, true);
  assert.deepEqual(lib.why, ['scripts/lib/y.mjs: shared library']);
  const readme = selectRows(['README.md'], routes);
  assert.equal(readme.all, true);
  assert.deepEqual(readme.why, ['README.md maps to no lane']);
  assert.deepEqual(selectRows([], routes), { all: false, lanes: [], why: [] });
});
