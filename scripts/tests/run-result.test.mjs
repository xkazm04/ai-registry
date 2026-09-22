import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EXIT } from '../lib/exit-codes.mjs';
import { SCHEMA, validateRunResult, writeRunResult, readRunResult, unpublishablePath } from '../lib/run-result.mjs';

/** A minimal result that passes every rule - each test breaks exactly one thing. */
const valid = (over = {}) => ({
  schema: SCHEMA,
  run_id: '2026-09-23-deepen-1',
  skill: 'deepen',
  skill_version: '1.2.0',
  mode: 'batch',
  domain: 'software-engineering',
  started_at: '2026-09-23T09:00:00Z',
  ended_at: '2026-09-23T10:30:00Z',
  exit: EXIT.OK,
  counts: { dispatched: 2, landed: 1, declined: 1, idled: 0, contended: 0 },
  subjects: [{ id: 'software-engineering/data-access', at: '2026-09-23', engine: 'deepen', outcome: 'landed', points_before: 18, points_after: 4 }],
  verdicts: [{ subject: 'data-access', technique: 'read-models-and-projections', verdict: 'better', mode: 'simulation' }],
  files: ['knowledge/software-engineering/backend-platform/data-layer/data-access/golden-path.md'],
  commits: [{ sha: '354e7df', branch: 'main', pathspec: 'knowledge/software-engineering/' }],
  pr: null,
  declined: [{ subject: 'software-engineering/migrations', reason: 'dry streak 2, no clock and no event to point at' }],
  failure_signature: null,
  notes: 'one landing, one decline',
  ...over,
});

function scratch(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-run-result-'));
  try { return fn(root); } finally {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('registry-run-result-'));
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('a valid result round trips through the default librarian/runs placement', () => {
  scratch((root) => {
    const result = valid();
    const rel = writeRunResult(result, { root });
    assert.equal(rel, 'librarian/runs/2026-09-23-deepen-1/result.json');
    assert.equal(path.isAbsolute(rel), false, 'the returned path is root-relative so echoing it cannot leak a machine path');

    const onDisk = fs.readFileSync(path.join(root, rel), 'utf8');
    assert.ok(onDisk.endsWith('}\n'), 'ends with a newline so the file diffs cleanly');
    assert.ok(onDisk.includes('\n  "run_id"'), 'two-space indentation, stable across writers');

    assert.deepEqual(readRunResult('2026-09-23-deepen-1', { root }), result);
  });
});

test('a run that never reported is absent, not failed', () => {
  scratch((root) => {
    assert.equal(readRunResult('2026-09-23-never-ran', { root }), null);
  });
});

test('the schema is stamped when the caller omits it, and a wrong one is refused', () => {
  scratch((root) => {
    const { schema: _drop, ...noSchema } = valid();
    writeRunResult(noSchema, { root });
    assert.equal(readRunResult(noSchema.run_id, { root }).schema, SCHEMA);
    assert.throws(() => writeRunResult(valid({ schema: 'rkb-run-result/2' }), { root }), /result\.schema must be/);
  });
});

test('a path that would publish a machine is refused wherever it appears', () => {
  const host = os.hostname().split('.')[0];
  const user = os.userInfo().username;
  const cases = [
    ['/etc/passwd', /is absolute/],
    ['C:\\Users\\someone\\repo\\file.md', /carries a drive letter/],
    ['C:/repo/file.md', /carries a drive letter/],
    ['knowledge\\bundle\\file.md', /backslash/],
    ['knowledge/../../../etc/passwd', /"\.\." segment/],
    ['../sibling-repo/file.md', /"\.\." segment/],
    ['Users/someone/repo/file.md', /home directory/],
    ['home/someone/repo/file.md', /home directory/],
    ['', /blank/],
    [42, /not a string/],
  ];
  for (const [value, why] of cases) {
    assert.match(String(unpublishablePath(value)), why, `expected ${JSON.stringify(value)} to be refused`);
    const problems = validateRunResult(valid({ files: [value] }));
    assert.ok(problems.some((p) => p.startsWith('result.files[0]')), `files[] must refuse ${JSON.stringify(value)}`);
    const onCommit = validateRunResult(valid({ commits: [{ sha: '354e7df', branch: 'main', pathspec: value }] }));
    assert.ok(onCommit.some((p) => p.startsWith('result.commits[0].pathspec')), `a commit pathspec must refuse ${JSON.stringify(value)}`);
  }
  if (host.length >= 3) {
    assert.match(String(unpublishablePath(`knowledge/${host}/file.md`)), /names this machine/);
  }
  if (user.length >= 3) {
    assert.match(String(unpublishablePath(`librarian/${user}/notes.md`)), /names this machine/);
  }
  assert.equal(unpublishablePath('librarian/runs/2026-09-23-1/result.json'), null, 'an ordinary repo-relative path passes');
});

test('a decline is only real when written down', () => {
  assert.ok(validateRunResult(valid({ declined: [{ subject: 'x/y', reason: '  ' }] }))
    .some((p) => /result\.declined\[0\]\.reason/.test(p)), 'a blank reason is a defect');
  assert.ok(validateRunResult(valid({ declined: [{ subject: 'x/y' }] }))
    .some((p) => /missing required field "reason"/.test(p)), 'an absent reason is a defect');
  assert.ok(validateRunResult(valid({ counts: { dispatched: 2, landed: 1, declined: 3, idled: 0, contended: 0 }, declined: [] }))
    .some((p) => /counts\.declined is 3 but result\.declined\[\] is empty/.test(p)), 'a counted decline nobody wrote down is a defect');
  assert.deepEqual(validateRunResult(valid({ counts: { dispatched: 2, landed: 1, declined: 0, idled: 0, contended: 0 }, declined: [] })), []);
});

test('a refused write leaves no file, no directory and no temp residue', () => {
  scratch((root) => {
    assert.throws(() => writeRunResult(valid({ files: ['/etc/passwd'] }), { root }), /refused to write/);
    assert.equal(fs.existsSync(path.join(root, 'librarian')), false, 'validation runs to completion before anything touches the disk');
  });
});

test('a refused write cannot damage the result already on disk', () => {
  scratch((root) => {
    const rel = writeRunResult(valid(), { root });
    const before = fs.readFileSync(path.join(root, rel), 'utf8');
    assert.throws(() => writeRunResult(valid({ notes: 'x'.repeat(281) }), { root }), /notes must be <= 280/);
    assert.equal(fs.readFileSync(path.join(root, rel), 'utf8'), before, 'the previous result is byte-identical');
    assert.deepEqual(fs.readdirSync(path.dirname(path.join(root, rel))), ['result.json'], 'no temp file survives');
  });
});

test('a successful overwrite is a single rename, never a half-written document', () => {
  scratch((root) => {
    const rel = writeRunResult(valid(), { root });
    writeRunResult(valid({ notes: 'second pass' }), { root });
    assert.equal(readRunResult(valid().run_id, { root }).notes, 'second pass');
    assert.deepEqual(fs.readdirSync(path.dirname(path.join(root, rel))), ['result.json']);
  });
});

test('a field nobody declared is refused, at every level', () => {
  assert.ok(validateRunResult(valid({ cost_usd: 4 })).some((p) => /result: unknown field "cost_usd"/.test(p)));
  assert.ok(validateRunResult(valid({ counts: { ...valid().counts, skipped: 1 } })).some((p) => /result\.counts: unknown field "skipped"/.test(p)));
  assert.ok(validateRunResult(valid({ pr: { number: 7, url: 'https://example.invalid/pr/7', title: 'x' } })).some((p) => /result\.pr: unknown field "title"/.test(p)));
  assert.ok(validateRunResult(valid({ verdicts: [{ subject: 'a', technique: null, verdict: 'better', mode: 'code', why: 'x' }] }))
    .some((p) => /result\.verdicts\[0\]: unknown field "why"/.test(p)));
});

test('a missing field is named rather than defaulted', () => {
  const { pr: _pr, failure_signature: _fs, ...missing } = valid();
  const problems = validateRunResult(missing);
  assert.ok(problems.some((p) => /missing required field "pr"/.test(p)));
  assert.ok(problems.some((p) => /missing required field "failure_signature"/.test(p)));
});

test('the run id is a directory name, so it is narrow', () => {
  scratch((root) => {
    for (const bad of ['abc', 'a'.repeat(65), 'has space', 'has/slash', '']) {
      assert.throws(() => writeRunResult(valid({ run_id: bad }), { root }), /run_id must match/, `expected ${JSON.stringify(bad)} to be refused`);
    }
    assert.equal(fs.existsSync(path.join(root, 'librarian')), false, 'a refused id never creates its directory');
    assert.throws(() => readRunResult('a b', { root }), /run id must match/);
  });
});

test('exit mirrors the declared vocabulary and nothing else', () => {
  for (const code of Object.values(EXIT)) assert.deepEqual(validateRunResult(valid({ exit: code })), []);
  for (const bad of [97, -1, '0', null]) {
    assert.ok(validateRunResult(valid({ exit: bad })).some((p) => /result\.exit must be a code/.test(p)), `expected ${JSON.stringify(bad)} to be refused`);
  }
});

test('a verdict comes from the closed vocabulary, and pr is an object or an honest null', () => {
  for (const v of ['better', 'not-better', 'unmeasurable', 'COVERED']) {
    assert.deepEqual(validateRunResult(valid({ verdicts: [{ subject: 'a', technique: null, verdict: v, mode: 'code' }] })), []);
  }
  assert.ok(validateRunResult(valid({ verdicts: [{ subject: 'a', technique: null, verdict: 'good', mode: 'code' }] }))
    .some((p) => /verdict must be one of/.test(p)));
  assert.deepEqual(validateRunResult(valid({ pr: { number: 7, url: 'https://example.invalid/pr/7' } })), []);
  assert.ok(validateRunResult(valid({ pr: 'maybe' })).some((p) => /result\.pr must be an object or null/.test(p)));
});

test('a failure signature is an identity, not an attempt count', () => {
  assert.deepEqual(validateRunResult(valid({ failure_signature: 'check-bundles:cap-breach' })), []);
  assert.ok(validateRunResult(valid({ failure_signature: '3' })).some((p) => /not count attempts/.test(p)));
  assert.ok(validateRunResult(valid({ failure_signature: 'x'.repeat(121) })).some((p) => /<= 120 characters/.test(p)));
});

test('time runs forwards', () => {
  assert.ok(validateRunResult(valid({ ended_at: '2026-09-23T08:00:00Z' })).some((p) => /ended_at is before/.test(p)));
  assert.ok(validateRunResult(valid({ started_at: '2026-09-23' })).some((p) => /started_at must be an ISO-8601 instant/.test(p)));
});

test('/conform lands the same schema in the project it judged, at its own path', () => {
  scratch((root) => {
    const result = valid({ run_id: 'conform-2026-09-23-1', skill: 'conform', skill_version: '1.7.3', mode: 'stale', domain: null,
      files: ['.ai/registry-map.json'], commits: [{ sha: 'abc1234', branch: 'master', pathspec: ['.ai/registry-map.json'] }],
      declined: [], counts: { dispatched: 0, landed: 4, declined: 0, idled: 0, contended: 0 } });
    const rel = writeRunResult(result, { root, path: '.ai/conform-runs/conform-2026-09-23-1.json' });
    assert.equal(rel, '.ai/conform-runs/conform-2026-09-23-1.json');
    assert.ok(fs.existsSync(path.join(root, rel)));
    assert.deepEqual(readRunResult('conform-2026-09-23-1', { root, path: rel }), result);
  });
});

test('a corrupt result on disk is an error, never a quiet absence', () => {
  scratch((root) => {
    const rel = writeRunResult(valid(), { root });
    fs.writeFileSync(path.join(root, rel), '{ not json');
    assert.throws(() => readRunResult(valid().run_id, { root }), /not readable JSON/);
    fs.writeFileSync(path.join(root, rel), JSON.stringify({ ...valid(), files: ['/etc/passwd'] }));
    assert.throws(() => readRunResult(valid().run_id, { root }), /is not a valid rkb-run-result\/1/);
  });
});
