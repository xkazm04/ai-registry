// Tests for scripts/backlog-phantom-screen.mjs, against a throwaway repository carrying a
// copy of the script: one source note, one later forge commit that added a technique under
// the row's home without touching the note - the phantom shape the screen exists to find.
// Git runs with no system or global config; nothing here reads this checkout's history.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../backlog-phantom-screen.mjs', import.meta.url));

function fixture(t, home = 'se/forged-subject') {
  const temp = fs.realpathSync(os.tmpdir());
  const base = fs.mkdtempSync(path.join(temp, 'phantom-test-'));
  t.after(() => {
    const rel = path.relative(temp, fs.realpathSync(base));
    if (!rel.startsWith('phantom-test-') || rel.includes(path.sep)) throw new Error('unsafe cleanup');
    fs.rmSync(base, { recursive: true, force: true });
  });
  const globalCfg = path.join(base, 'gitconfig');
  fs.writeFileSync(globalCfg, '[user]\n\tname = t\n\temail = t@example.invalid\n[init]\n\tdefaultBranch = main\n');
  const env = { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: globalCfg };
  for (const k of Object.keys(env)) if (k.startsWith('GIT_') && !['GIT_CONFIG_NOSYSTEM', 'GIT_CONFIG_GLOBAL'].includes(k)) delete env[k];
  const repo = path.join(base, 'repo');
  const write = (rel, text) => { fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true }); fs.writeFileSync(path.join(repo, rel), text); };
  const commit = (msg, when) => {
    const e = { ...env, GIT_AUTHOR_DATE: when, GIT_COMMITTER_DATE: when };
    execFileSync('git', ['add', '-A'], { cwd: repo, env: e });
    execFileSync('git', ['commit', '-qm', msg], { cwd: repo, env: e });
  };
  fs.mkdirSync(repo);
  execFileSync('git', ['init', '-q'], { cwd: repo, env });
  write('scripts/backlog-phantom-screen.mjs', fs.readFileSync(SCRIPT, 'utf8'));
  // The screen reads a row's home through backlog-wave's foldHome, which in turn imports the exit vocabulary.
  write('scripts/backlog-wave.mjs', fs.readFileSync(new URL('../backlog-wave.mjs', import.meta.url), 'utf8'));
  write('scripts/lib/exit-codes.mjs', fs.readFileSync(new URL('../lib/exit-codes.mjs', import.meta.url), 'utf8'));
  write('librarian/sources/2026-01-01-widgetkit.md', '---\nuntriaged: 3\n---\n# widgetkit\n');
  write('librarian/harvest/backlog.jsonl', `${JSON.stringify({ id: '1-001', note: '2026-01-01-widgetkit', status: 'queued', home, score: 5 })}\n`);
  commit('intake(widgetkit): the source note', '2026-01-01T10:00:00Z');
  write('knowledge/se/forged-subject/techniques/a-technique.md', '# a technique\n');
  commit('intake(widgetkit): forge one technique from the note', '2026-01-02T10:00:00Z');
  const run = (cwd) => {
    const r = spawnSync(process.execPath, [path.join(repo, 'scripts', 'backlog-phantom-screen.mjs'), '--json'], { cwd, env, encoding: 'utf8' });
    return { status: r.status, out: r.stdout ?? '', err: r.stderr ?? '' };
  };
  return { repo, run };
}

test('the fixture phantom is found from the repository root', (t) => {
  const f = fixture(t);
  const r = f.run(f.repo);
  assert.equal(r.status, 0, r.err);
  const j = JSON.parse(r.out);
  assert.equal(j.stale.length, 1);
  assert.equal(j.stale[0].note, '2026-01-01-widgetkit');
  assert.deepEqual(j.stale[0].ids_home_in_forged_subject, ['1-001']);
});

test('REGRESSION: the same report from a subdirectory - paths resolve from the script, not the cwd', (t) => {
  // Before: every path (the ledger, librarian/sources, the git pathspecs) was cwd-relative,
  // so from scripts/ the technique pathspec matched nothing and the run died on
  // "self-check FAILED: ... is the pathspec wrong?" - blaming the instrument for the cwd.
  const f = fixture(t);
  const fromRoot = f.run(f.repo);
  const fromSub = f.run(path.join(f.repo, 'scripts'));
  assert.equal(fromSub.status, 0, fromSub.err);
  assert.deepEqual(JSON.parse(fromSub.out), JSON.parse(fromRoot.out));
});

test('a row whose home is annotated or one of several is still found inside the forged subject', (t) => {
  // Before: homeInside compared the raw string, so '<subject> (note)' and '<other>; <subject>'
  // - 39 of the queued ledger's homes have this shape - were never inside the subject they name.
  for (const home of ['se/forged-subject (the retry half)', 'se/elsewhere; se/forged-subject', 'se/elsewhere, se/forged-subject (b)']) {
    const f = fixture(t, home);
    const r = f.run(f.repo);
    assert.equal(r.status, 0, r.err);
    assert.deepEqual(JSON.parse(r.out).stale[0]?.ids_home_in_forged_subject, ['1-001'], home);
  }
  // positive control: a prose home that merely mentions no subject address names no row inside it
  for (const home of ['strong in recruiting; thin elsewhere', 'se/elsewhere (se/forged-subject is mentioned only in the note)']) {
    const f = fixture(t, home);
    const r = f.run(f.repo);
    assert.equal(r.status, 0, r.err);
    assert.deepEqual(JSON.parse(r.out).stale[0].ids_home_in_forged_subject, [], home);
  }
});
