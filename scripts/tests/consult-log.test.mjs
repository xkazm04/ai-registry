import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { consultFromPath, logConsult, mainCheckoutOf, loggingDisabled } from '../lib/consult-log.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const QUERY = path.join(HERE, '..', 'registry-query.mjs');
const CHECK = path.join(HERE, '..', 'consult-check.mjs');
const TECH = 'knowledge/software-engineering/ui-surfaces/data-display/table/techniques/client-server-split.md';

function tmp(t) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'consult-log-test-')));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
/** A git checkout; with `consumer` it carries .ai/manifest.yaml like a subscribed project. */
function repo(t, { consumer = true } = {}) {
  const dir = tmp(t);
  assert.equal(spawnSync('git', ['-C', dir, 'init', '-q'], { encoding: 'utf8' }).status, 0);
  if (consumer) {
    fs.mkdirSync(path.join(dir, '.ai'));
    fs.writeFileSync(path.join(dir, '.ai', 'manifest.yaml'), 'knowledge:\n  domains: [software-engineering]\n');
  }
  return dir;
}
const rows = (dir) => {
  const f = path.join(dir, '.ai', 'consults.jsonl');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
};
const cli = (cwd, args, env = {}) => spawnSync(process.execPath, [QUERY, ...args], { cwd, encoding: 'utf8', env: { ...process.env, REGISTRY_CONSULT_LOG: '', ...env } });

test('consultFromPath derives bare slugs at any taxonomy depth and refuses non-subject paths', () => {
  assert.deepEqual(consultFromPath(TECH), { bundle: 'software-engineering', subject: 'table', technique: 'client-server-split' });
  assert.deepEqual(consultFromPath('knowledge/software-engineering/ui-surfaces/data-display/table/table.md'), { bundle: 'software-engineering', subject: 'table', technique: null });
  assert.deepEqual(consultFromPath('knowledge/agent-operations/configuration-choice/agent-run-budgeting/applications/process--x.md'), { bundle: 'agent-operations', subject: 'agent-run-budgeting', technique: null });
  for (const p of ['knowledge/agent-operations/_laws.md', 'knowledge/README.md', 'recipes/x/recipe.json', 'docs/query-lane.md', 'knowledge/../x.md']) assert.equal(consultFromPath(p), null, p);
});

test('a front-door read appends one slug-only row, and consult-check then marks the subject covered, not missed', (t) => {
  const proj = repo(t);
  fs.writeFileSync(path.join(proj, '.ai', 'registry-map.json'), JSON.stringify({
    schema: 'rkb-registry-map/1', project: 'fixture', domains: ['software-engineering'],
    contexts: [{ context: 'tables', name: 'tables', paths: ['app/table'], subjects: [{ subject: 'table', bundle: 'software-engineering', score: 500, confidence: 'strong', state: 'unknown' }] }],
  }));
  const check = () => JSON.parse(spawnSync(process.execPath, [CHECK, '--project', proj, '--paths', 'app/table/Grid.tsx', '--no-record', '--json'], { encoding: 'utf8' }).stdout);
  assert.deepEqual(check().missed.map((m) => m.subject), ['table'], 'before the read: missed');

  const r = cli(proj, ['--read', TECH, '--max-tokens', '50']);
  assert.equal(r.status, 0, r.stderr);
  const got = rows(proj);
  assert.equal(got.length, 1);
  assert.deepEqual(Object.keys(got[0]).sort(), ['bundle', 'deviations', 'from', 'subjects', 'techniques', 'ts']);
  assert.deepEqual(got[0].subjects, ['table']);
  assert.deepEqual(got[0].techniques, ['client-server-split']);
  assert.ok(!JSON.stringify(got[0]).includes('/'), 'a row carries no path');
  const after = check();
  assert.deepEqual(after.met, ['table']);
  assert.deepEqual(after.missed, []);
});

test('--subject logs a consult for a known subject; an unknown one and a search do not', (t) => {
  const proj = repo(t);
  assert.equal(cli(proj, ['rate limiting retry']).status, 0);
  assert.equal(rows(proj).length, 0, 'a search is not a consult');
  assert.equal(cli(proj, ['--subject', 'no-such-subject-xyz']).status, 0);
  assert.equal(rows(proj).length, 0);
  assert.equal(cli(proj, ['--subject', 'table']).status, 0);
  assert.deepEqual(rows(proj).map((r) => r.subjects), [['table']]);
});

test('no write when the read failed, REGISTRY_CONSULT_LOG=0, outside git, or in a repo that never subscribed', (t) => {
  const proj = repo(t);
  assert.equal(cli(proj, ['--read', 'knowledge/software-engineering/nope/missing.md']).status, 2);
  assert.equal(rows(proj).length, 0, 'failed read');
  assert.equal(cli(proj, ['--read', TECH, '--max-tokens', '50'], { REGISTRY_CONSULT_LOG: '0' }).status, 0);
  assert.equal(rows(proj).length, 0, 'opt-out');

  const plain = repo(t, { consumer: false });
  assert.equal(cli(plain, ['--read', TECH, '--max-tokens', '50']).status, 0);
  assert.equal(fs.existsSync(path.join(plain, '.ai')), false, 'a non-consumer repo gets no stray .ai/');

  const outside = tmp(t);
  fs.mkdirSync(path.join(outside, '.ai'));
  fs.writeFileSync(path.join(outside, '.ai', 'manifest.yaml'), '');
  const r = cli(outside, ['--read', TECH, '--max-tokens', '50'], { GIT_CEILING_DIRECTORIES: path.dirname(outside) });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(rows(outside).length, 0, 'not inside a git checkout');
});

test('writes only append; a log that cannot be written never fails the read', (t) => {
  const proj = repo(t);
  const ledger = path.join(proj, '.ai', 'consults.jsonl');
  fs.writeFileSync(ledger, '{"keep":"me"}\n');
  assert.equal(cli(proj, ['--read', TECH, '--max-tokens', '50']).status, 0);
  const lines = fs.readFileSync(ledger, 'utf8').split('\n');
  assert.equal(lines[0], '{"keep":"me"}');
  assert.equal(lines.filter(Boolean).length, 2);
  // Make the ledger a directory: appendFileSync throws; the read must still answer and exit 0.
  const proj2 = repo(t);
  fs.mkdirSync(path.join(proj2, '.ai', 'consults.jsonl'));
  const r = cli(proj2, ['--read', TECH, '--max-tokens', '50']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /tokens/);
  assert.equal(logConsult({ cwd: proj2, bundle: 'software-engineering', subject: 'table' }), null);
});

test('a linked worktree logs into the main checkout, and the opt-out switch parses', (t) => {
  const main = repo(t);
  const git = (...a) => spawnSync('git', ['-C', main, '-c', 'user.email=t@t', '-c', 'user.name=t', ...a], { encoding: 'utf8' });
  git('commit', '--allow-empty', '-q', '-m', 'init');
  const wt = path.join(tmp(t), 'wt');
  assert.equal(git('worktree', 'add', '-q', '--detach', wt).status, 0);
  assert.equal(fs.realpathSync(mainCheckoutOf(wt)), fs.realpathSync(main));
  const file = logConsult({ cwd: wt, bundle: 'software-engineering', subject: 'table' });
  assert.equal(fs.realpathSync(path.dirname(file)), fs.realpathSync(path.join(main, '.ai')));
  assert.equal(rows(main).length, 1);
  for (const v of ['0', 'false', 'off']) assert.equal(loggingDisabled({ REGISTRY_CONSULT_LOG: v }), true);
  assert.equal(loggingDisabled({}), false);
});
