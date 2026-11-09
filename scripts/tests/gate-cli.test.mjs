// The real gate.mjs, run end to end in a temp tree whose every step script is a stub. It
// proves what the runner tests cannot: the CLI's verdict table names an incomplete step
// beside a violation, the calendar step is labelled, --write stops at the first red,
// --json is one parseable gate-result/1 object on stdout, and --changed selects rows from
// a git change (one lane -> that row, an unmapped path -> all, a bad base -> exit 2).
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from '../lib/exit-codes.mjs';

const PREFIX = 'registry-gate-cli-';
const REAL = (rel) => new URL(`../../${rel}`, import.meta.url);
const OK_STUB = "console.log('stub ok'); process.exit(0);\n";

// The real plan, so the stubs cover exactly the scripts the gate names.
const PLAN = JSON.parse(spawnSync(process.execPath, [fileURLToPath(new URL('../gate.mjs', import.meta.url)), '--list'], { encoding: 'utf8' }).stdout);
const SCRIPTS = [...new Set(PLAN.all.map((id) => id.split(' ')[0]))];

function tree(overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), PREFIX));
  const scripts = path.join(root, 'scripts');
  fs.mkdirSync(path.join(scripts, 'lib'), { recursive: true });
  fs.copyFileSync(REAL('scripts/gate.mjs'), path.join(scripts, 'gate.mjs'));
  for (const lib of ['exit-codes.mjs', 'gate-plan.mjs']) fs.copyFileSync(REAL(`scripts/lib/${lib}`), path.join(scripts, 'lib', lib));
  fs.copyFileSync(REAL('registry.yaml'), path.join(root, 'registry.yaml'));
  for (const name of SCRIPTS) fs.writeFileSync(path.join(scripts, name), overrides[name] ?? OK_STUB);
  return { root, gate: path.join(scripts, 'gate.mjs') };
}

function cleanup(root) {
  assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
  assert.ok(path.basename(root).startsWith(PREFIX));
  fs.rmSync(root, { recursive: true, force: true });
}

const gate = (g, root, args) => spawnSync(process.execPath, [g, ...args], {
  cwd: root, encoding: 'utf8', timeout: 60_000, env: { ...process.env, GATE_STEP_TIMEOUT_MS: '30000' },
});

function git(root, ...args) {
  const r = spawnSync('git', ['-c', 'user.name=gate-fixture', '-c', 'user.email=gate-fixture', '-c', 'commit.gpgsign=false', ...args], { cwd: root, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout;
}

function repo() {
  const t = tree();
  for (const d of ['signals', 'recipes']) {
    fs.mkdirSync(path.join(t.root, d));
    fs.writeFileSync(path.join(t.root, d, 'a.md'), 'one\n');
  }
  fs.writeFileSync(path.join(t.root, 'README.md'), 'readme\n');
  git(t.root, 'init', '-q');
  git(t.root, 'add', '-A');
  git(t.root, 'commit', '-q', '-m', 'fixture');
  return t;
}

const SCHEMA_STATUSES = new Set(['ok', 'violations', 'could-not-run', 'timed-out', 'not-run']);
function assertSchema(doc) {
  assert.equal(doc.schema, 'gate-result/1');
  assert.equal(typeof doc.label, 'string');
  assert.ok(doc.mode === 'check' || doc.mode === 'write');
  assert.ok(Number.isInteger(doc.jobs) && doc.jobs >= 1);
  assert.ok(Number.isInteger(doc.exit));
  assert.ok(Array.isArray(doc.steps));
  for (const st of doc.steps) {
    assert.deepEqual(Object.keys(st).sort(), ['args', 'exit', 'ms', 'script', 'status']);
    assert.equal(typeof st.script, 'string');
    assert.ok(Array.isArray(st.args));
    assert.ok(SCHEMA_STATUSES.has(st.status), st.status);
    assert.ok(st.exit === null || Number.isInteger(st.exit));
    assert.ok(st.ms === null || Number.isInteger(st.ms));
  }
}

test('--all keeps going: a violation and an incomplete step are both reported, exit 1, the calendar row is labelled', () => {
  const t = tree({
    'check-coverage-age.mjs': "console.log('coverage is old'); process.exit(1);\n",
    'run-tests.mjs': "console.error('no runtime'); process.exit(2);\n",
  });
  try {
    const r = gate(t.gate, t.root, ['--all', '--jobs', '4']);
    assert.equal(r.status, EXIT.VIOLATIONS, r.stdout + r.stderr);
    assert.match(r.stdout, /violations\s+1\s+\d+\s+check-coverage-age\.mjs\s+\[calendar\]/);
    assert.match(r.stdout, /could-not-run\s+2\s+\d+\s+run-tests\.mjs/);
    assert.match(r.stdout, /did not reach a verdict: run-tests\.mjs/);
    assert.match(r.stdout, /No other step was hidden by it/);
    assert.match(r.stdout, new RegExp(`gate: ${PLAN.all.length - 2} ok, 1 violations, 1 incomplete`));
    assert.match(r.stdout, /NOT run here:/);
    // the step after both reds ran
    assert.match(r.stdout, /ok\s+0\s+\d+\s+build-catalog\.mjs --check/);
  } finally {
    cleanup(t.root);
  }
});

test('--all with only a could-not-run exits 2; --fail-fast stops at the first red', () => {
  const t = tree({
    'check-skills.mjs': 'process.exit(2);\n',
    'check-bundles.mjs': 'process.exit(1);\n',
  });
  try {
    const cnr = gate(t.gate, t.root, ['--lane', 'skills']);
    assert.equal(cnr.status, EXIT.FATAL, cnr.stdout + cnr.stderr);
    const ff = gate(t.gate, t.root, ['--all', '--fail-fast', '--json']);
    assert.equal(ff.status, EXIT.FATAL, ff.stdout + ff.stderr);
    const doc = JSON.parse(ff.stdout);
    assertSchema(doc);
    assert.equal(doc.jobs, 1);
    assert.equal(doc.steps[0].status, 'could-not-run');
    assert.ok(doc.steps.slice(1).every((s) => s.status === 'not-run'), 'fail-fast ran a step after the first red');
    assert.match(ff.stderr, /gate FAILED at scripts\/check-skills\.mjs/);
  } finally {
    cleanup(t.root);
  }
});

test('--write is sequential and stops at the first red', () => {
  const t = tree({
    'check-recipes.mjs': 'process.exit(1);\n',
    'render-recipes.mjs': "import fs from 'node:fs'; fs.writeFileSync('generator-ran', 'x');\n",
    'build-recipes-index.mjs': "import fs from 'node:fs'; fs.writeFileSync('generator-ran', 'x');\n",
  });
  try {
    const r = gate(t.gate, t.root, ['--lane', 'recipes', '--write', '--jobs', '8', '--json']);
    assert.equal(r.status, EXIT.VIOLATIONS, r.stdout + r.stderr);
    const doc = JSON.parse(r.stdout);
    assertSchema(doc);
    assert.equal(doc.mode, 'write');
    assert.equal(doc.jobs, 1);
    assert.deepEqual(doc.steps.map((s) => s.status), ['violations', 'not-run', 'not-run']);
    assert.equal(fs.existsSync(path.join(t.root, 'generator-ran')), false);
  } finally {
    cleanup(t.root);
  }
});

test('--json prints exactly one gate-result/1 object on stdout; step output goes to stderr', () => {
  const t = tree();
  try {
    const r = gate(t.gate, t.root, ['--all', '--json']);
    assert.equal(r.status, EXIT.OK, r.stderr);
    const doc = JSON.parse(r.stdout);
    assertSchema(doc);
    assert.equal(doc.label, 'all');
    assert.equal(doc.exit, 0);
    assert.deepEqual(doc.steps.map((s) => [s.script, ...s.args].join(' ')), PLAN.all);
    assert.match(r.stderr, /stub ok/);
    assert.doesNotMatch(r.stdout, /stub ok/);
  } finally {
    cleanup(t.root);
  }
});

test('--changed: one lane selects its row, an unmapped path selects all, a bad base exits 2', () => {
  const t = repo();
  try {
    // A dirty change under signals/ (no upstream, no origin/main: base is HEAD).
    fs.writeFileSync(path.join(t.root, 'signals', 'a.md'), 'two\n');
    let r = gate(t.gate, t.root, ['--changed', '--json']);
    assert.equal(r.status, EXIT.OK, r.stdout + r.stderr);
    let doc = JSON.parse(r.stdout);
    assertSchema(doc);
    assert.deepEqual(doc.steps.map((s) => s.script), ['check-signals.mjs']);
    assert.deepEqual(doc.changed.lanes, ['signals']);
    assert.equal(doc.changed.base, 'HEAD');
    assert.match(r.stderr, /base HEAD \(no upstream and no origin\/main resolve\)/);

    // An untracked file under recipes/ joins the selection.
    fs.writeFileSync(path.join(t.root, 'recipes', 'new.md'), 'x\n');
    doc = JSON.parse(gate(t.gate, t.root, ['--changed', '--json']).stdout);
    assert.deepEqual(doc.changed.lanes, ['recipes', 'signals']);

    // Committed history against an explicit base.
    git(t.root, 'add', '-A');
    git(t.root, 'commit', '-q', '-m', 'recipes and signals');
    r = gate(t.gate, t.root, ['--changed', 'HEAD~1', '--json']);
    assert.equal(r.status, EXIT.OK, r.stderr);
    doc = JSON.parse(r.stdout);
    assert.deepEqual(doc.changed.lanes, ['recipes', 'signals']);
    assert.equal(doc.changed.base, 'HEAD~1');

    // An unmapped path selects the whole chain, and says which path did it.
    fs.writeFileSync(path.join(t.root, 'README.md'), 'changed\n');
    r = gate(t.gate, t.root, ['--changed']);
    assert.equal(r.status, EXIT.OK, r.stderr);
    assert.match(r.stdout, /Whole chain selected/);
    assert.match(r.stdout, /README\.md maps to no lane/);
    assert.match(r.stdout, new RegExp(`gate: ${PLAN.all.length} step\\(s\\)`));

    // A base git cannot resolve is could-not-run, before any step starts.
    r = gate(t.gate, t.root, ['--changed', 'no-such-ref']);
    assert.equal(r.status, EXIT.FATAL);
    assert.match(r.stderr, /--changed base "no-such-ref" does not resolve/);
    assert.doesNotMatch(r.stdout, /^--- node/m);
  } finally {
    cleanup(t.root);
  }
});

test('--changed with --all or --lane is refused', () => {
  const t = tree();
  try {
    for (const args of [['--changed', '--all'], ['--lane', 'signals', '--changed']]) {
      const r = gate(t.gate, t.root, args);
      assert.equal(r.status, EXIT.FATAL, args.join(' '));
      assert.match(r.stderr, /exclusive/);
    }
  } finally {
    cleanup(t.root);
  }
});
