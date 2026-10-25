// Tests for the one leak scanner (scripts/lib/leaks.mjs) and the five gates that use it:
// check-public-paths, check-usage, check-signals, check-runs, check-projects.
//
// These are the canaries for the 2026-10-25 gates probe. Every form the probe planted and
// the old tables missed is planted here again, in each lane that must catch it, and the
// gate's exit code is asserted directly: 1 for a violation, 2 for could-not-run. Each lane
// also carries a clean control asserting 0, so a gate that went red on everything would
// fail here as surely as one that went silent.
//
// Nothing here reads or writes the real lanes: every gate runs against a temp root
// (`--root`, or REGISTRY_RUNS_ROOT for check-runs).

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { FORMS, PRESETS, leaksIn, assertScanner } from '../lib/leaks.mjs';
import { SCHEMA as RUN_SCHEMA, runId, validateRun } from '../lib/runs.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const script = (name) => path.join(ROOT, 'scripts', name);

const made = [];
const tmp = (tag) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), `rkb-leaks-${tag}-`)); made.push(d); return d; };
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

const run = (name, args = [], env = {}) =>
  spawnSync(process.execPath, [script(name), ...args], { cwd: ROOT, env: { ...process.env, ...env }, encoding: 'utf8' });
const write = (root, rel, text) => {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
};

// The forms the probe found missing in every table, as raw text.
const PROBE = {
  'lowercase profile': 'c:\\users\\jane\\code\\x',
  'WSL mount': '/mnt/c/Users/jane/code/x',
  'home-relative ~/': '~/code/app/src',
  '%USERPROFILE%': '%USERPROFILE%\\code\\app',
  '$HOME/': '$HOME/work/repo',
  'Windows profile, no separator': 'C:\\Users\\jane',
  'POSIX home, no separator': '/home/jane',
};

// ------------------------------------------------------------------ the table
test('every form fires on its own controls, and the scanner assertion holds', () => {
  assert.doesNotThrow(() => assertScanner(FORMS.map((f) => f.id)));
  for (const f of FORMS) {
    for (const c of f.controls) assert.ok(leaksIn(c, [f.id]).some((h) => h.form === f.id), `${f.id} on ${c}`);
  }
});

test('a dead pattern makes assertScanner throw - the scan cannot go silent', () => {
  const f = FORMS.find((x) => x.id === 'windows-profile');
  const live = f.re;
  f.re = /(?!)/g;
  try {
    assert.throws(() => assertScanner(PRESETS.PUBLISHED), /windows-profile.*did not match its control/);
  } finally { f.re = live; }
  assert.doesNotThrow(() => assertScanner(PRESETS.PUBLISHED));
  assert.throws(() => leaksIn('x', ['no-such-form']), /unknown form/);
});

test('PUBLISHED flags every probe form and returns the form name', () => {
  for (const [name, text] of Object.entries(PROBE)) {
    const hits = leaksIn(`see ${text} here`, PRESETS.PUBLISHED);
    assert.equal(hits.length, 1, `${name}: ${JSON.stringify(hits)}`);
    assert.equal(typeof hits[0].form, 'string');
    assert.equal(typeof hits[0].what, 'string');
  }
});

test('PUBLISHED lets teaching text through (one control per exemption)', () => {
  for (const text of [
    'C:\\Users\\<user>\\repo', '/home/me/repo', 'C:\\Users\\Public\\x', 'C:\\Users\\node_modules',
    'C:\\Users\\%USERNAME%\\x', 'C:\\Users\\...', 'C:\\Users\\\u2026',
    '~/.claude/projects', '$HOME/.config/x', '%USERPROFILE%\\.claude\\x', 'the ~/kiro root',
    "from '~/features/home/sub_start'", "import('~/lib/util')", '"paths": { "~/*": ["./src/*"] }',
    'https://example.com/home/jane/x', 'src/home/page.tsx', 'blank/~/x/-', '~~(.*?)~~/g',
  ]) assert.deepEqual(leaksIn(text, PRESETS.PUBLISHED), [], text);
});

// The share Windows Explorer hands out for a WSL distro's files. It names a Linux user's
// home exactly as /home/<n> does, but through a UNC prefix with either slash, so no other
// form saw it - in any preset, although FREE_TEXT promises "no absolute path of any kind".
test('a WSL UNC home path is flagged in every preset; a placeholder user still teaches', () => {
  for (const text of [
    String.raw`\\wsl.localhost\Ubuntu\home\jane\code`,
    String.raw`\\wsl$\Ubuntu-22.04\home\jane`,
    '//wsl.localhost/Ubuntu/home/jane/code',
    String.raw`\\\\wsl.localhost\\Ubuntu\\home\\jane\\x`, // JSON-escaped
  ]) {
    for (const [name, preset] of Object.entries(PRESETS)) {
      const hits = leaksIn(`see ${text} here`, preset);
      assert.equal(hits.length, 1, `${name}: ${text} -> ${JSON.stringify(hits)}`);
      assert.equal(hits[0].form, 'wsl-unc-home', `${name}: ${text}`);
    }
  }
  assert.deepEqual(leaksIn(String.raw`\\wsl.localhost\Ubuntu\home\<user>\x`, PRESETS.PUBLISHED), []);
  assert.deepEqual(leaksIn(String.raw`\\wsl$\Ubuntu\home\me`, PRESETS.PUBLISHED), []);
});

test('overlapping forms collapse to one finding; strict presets add the blunt forms', () => {
  assert.equal(leaksIn('C:\\Users\\jane\\x', PRESETS.COUNTS_ONLY).length, 1);
  assert.equal(leaksIn('C:\\Users\\jane\\x', PRESETS.COUNTS_ONLY)[0].form, 'windows-profile');
  assert.equal(leaksIn('C:\\Users\\x\\y', PRESETS.COUNTS_ONLY)[0].form, 'windows-drive', 'a placeholder user is still a path in a counts lane');
  assert.deepEqual(leaksIn('see https://example.com/x', PRESETS.FREE_TEXT), [], 'URLs are evidence in the run log');
  assert.equal(leaksIn('see https://example.com/x', PRESETS.COUNTS_ONLY)[0].form, 'url');
  assert.equal(leaksIn('~/.claude/projects', PRESETS.FREE_TEXT)[0].form, 'home-anchor');
  assert.equal(leaksIn('a@b.co', PRESETS.FREE_TEXT)[0].form, 'email');
  assert.deepEqual(leaksIn('fine text, 30 days, kiro/pof', PRESETS.COUNTS_ONLY), []);
});

// ------------------------------------------------------------------ check-public-paths
function gitRepo(files) {
  const root = tmp('pp');
  const git = (...a) => spawnSync('git', ['-C', root, ...a], { encoding: 'utf8' });
  assert.equal(git('init', '-q').status, 0);
  for (const [rel, text] of Object.entries(files)) write(root, rel, text);
  if (Object.keys(files).length) assert.equal(git('add', '-A').status, 0);
  return root;
}

test('check-public-paths: clean control 0, each probe form 1, in every new lane', () => {
  const clean = { 'docs/a.md': 'repo-relative pof/src/x.ts and ~/.claude/projects\n', 'projects.json': '{"schema":2}\n' };
  const ok = run('check-public-paths.mjs', ['--root', gitRepo(clean)]);
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  for (const [name, text] of Object.entries(PROBE)) {
    const r = run('check-public-paths.mjs', ['--root', gitRepo({ ...clean, 'docs/b.md': `line\nsee ${text}\n` })]);
    assert.equal(r.status, 1, `${name}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /docs\/b\.md:2:/);
  }
  for (const lane of ['projects.json', 'usage/wolf.json', 'signals/wolf.json', 'usage/runs/Fox.jsonl']) {
    const r = run('check-public-paths.mjs', ['--root', gitRepo({ ...clean, [lane]: '{"note":"C:/Users/jane/kiro"}\n' })]);
    assert.equal(r.status, 1, `${lane}: ${r.stdout}${r.stderr}`);
  }
});

test('check-public-paths: could-not-run is 2 - no files, not a checkout, no git', () => {
  const empty = run('check-public-paths.mjs', ['--root', gitRepo({})]);
  assert.equal(empty.status, 2, empty.stdout + empty.stderr);
  assert.match(empty.stderr, /walked 0 published text files/);
  const notRepo = run('check-public-paths.mjs', ['--root', tmp('nogit')]);
  assert.equal(notRepo.status, 2, notRepo.stdout + notRepo.stderr);
  const bare = tmp('nopath');
  const noGit = run('check-public-paths.mjs', [], { PATH: bare, Path: bare });
  assert.equal(noGit.status, 2, noGit.stdout + noGit.stderr);
  assert.match(noGit.stderr, /could not list the published files/);
  assert.equal(run('check-public-paths.mjs', ['--self-test']).status, 0);
});

// ------------------------------------------------------------------ check-usage / check-signals
const usageDoc = (over = {}) => JSON.stringify({ schema: 'rkb-usage/1', contributor: 'test-box', app: 'x', generatedAt: '2026-10-01T00:00:00Z', windowDays: 30, skills: {}, ...over }, null, 2);
const signalsDoc = (over = {}) => JSON.stringify({ schema: 'rkb-signals/1', contributor: 'test-box', app: 'x', generatedAt: '2026-10-01T00:00:00Z', windowDays: 30, stack: {}, bundles: {}, ...over }, null, 2);

for (const [gate, lane, doc] of [['check-usage.mjs', 'usage', usageDoc], ['check-signals.mjs', 'signals', signalsDoc]]) {
  test(`${gate}: clean control 0, each probe form 1`, () => {
    const root = tmp(lane);
    write(root, `${lane}/test-box.json`, doc());
    if (lane === 'usage') fs.mkdirSync(path.join(root, 'usage', 'runs'), { recursive: true });
    const ok = run(gate, ['--root', root]);
    assert.equal(ok.status, 0, ok.stdout + ok.stderr);
    for (const [name, text] of Object.entries(PROBE)) {
      const r0 = tmp(lane);
      write(r0, `${lane}/test-box.json`, doc({ app: text }));
      const r = run(gate, ['--root', r0]);
      assert.equal(r.status, 1, `${name}: ${r.stdout}${r.stderr}`);
      assert.match(r.stderr, /contains /);
    }
  });

  test(`${gate}: a stray file or folder in the lane is a violation`, () => {
    for (const stray of ['notes.txt', 'wolf.JSON', 'draft/x.json', '.hidden']) {
      const root = tmp(lane);
      write(root, `${lane}/test-box.json`, doc());
      write(root, `${lane}/${stray}`, '{}');
      const r = run(gate, ['--root', root]);
      assert.equal(r.status, 1, `${stray}: ${r.stdout}${r.stderr}`);
      assert.match(r.stderr, /unexpected (file|directory)/);
    }
  });
}

// ------------------------------------------------------------------ check-runs
function runRow(over = {}) {
  const row = {
    schema: RUN_SCHEMA, id: null, ts: '2026-09-21T10:11:12.345Z', started: '2026-09-21T09:00:00Z',
    project: 'personas', skill: 'spark', version: '1.3.2', device: 'Fox', contributor: 'mkdol-dev-box',
    provider: 'claude', model: 'claude-opus-5', effort: 'high', outcome: 'shipped', difficulty: 3,
    result: 'shipped the run log', comment: 'Went fine; see https://example.com/x for the source.', tokensEst: 1200,
    ...over,
  };
  row.id = runId(row);
  return row;
}

test('check-runs: clean control 0; probe forms the row validator misses are caught on the raw line', () => {
  const lane = (row) => { const r = tmp('runs'); write(r, 'usage/runs/Fox.jsonl', `${JSON.stringify(row)}\n`); return r; };
  const ok = spawnSync(process.execPath, [script('check-runs.mjs')], { cwd: ROOT, env: { ...process.env, REGISTRY_RUNS_ROOT: lane(runRow()) }, encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  let missedByValidator = 0;
  for (const [name, text] of Object.entries(PROBE)) {
    const row = runRow({ comment: `edited ${text} today` });
    if (validateRun(row).length === 0) missedByValidator++;
    const r = spawnSync(process.execPath, [script('check-runs.mjs')], { cwd: ROOT, env: { ...process.env, REGISTRY_RUNS_ROOT: lane(row) }, encoding: 'utf8' });
    assert.equal(r.status, 1, `${name}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /Fox\.jsonl:1: /);
  }
  assert.ok(missedByValidator > 0, 'the raw scan is what catches the new forms');
});

// ------------------------------------------------------------------ check-projects
const fleet = (over = {}) => ({ schema: 2, machines: { Fox: { note: 'dev box' } }, projects: { app: { checkouts: { Fox: 'code/app' } } }, ...over });

test('check-projects: clean control 0, a leak in any free-text key or value 1, missing file 2', () => {
  const at = (doc) => { const r = tmp('proj'); write(r, 'projects.json', JSON.stringify(doc, null, 2)); return run('check-projects.mjs', ['--root', r]); };
  const ok = at(fleet());
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  const plants = [
    ['machines.*.note', fleet({ machines: { Fox: { note: 'root is C:\\Users\\jane\\code' } } })],
    ['machines.*.home', fleet({ machines: { Fox: { home: 'c:\\users\\jane' } } })],
    ['projects.*.path', fleet({ projects: { app: { checkouts: { Fox: 'code/app' }, path: '/mnt/c/Users/jane/app' } } })],
    ['_note', fleet({ _note: 'clone to ~/code/app/ first' })],
    ['a key', fleet({ projects: { app: { checkouts: { Fox: 'code/app' }, notes: { '$HOME/work/app': 1 } } } })],
    ['an email', fleet({ machines: { Fox: { note: 'ask jane@example.com' } } })],
  ];
  for (const [name, doc] of plants) {
    const r = at(doc);
    assert.equal(r.status, 1, `${name}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /contains /);
  }
  const missing = run('check-projects.mjs', ['--root', tmp('noproj')]);
  assert.equal(missing.status, 2, missing.stdout + missing.stderr);
});
