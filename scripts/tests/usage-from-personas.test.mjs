// Tests for scripts/usage-from-personas.mjs - the bootstrap writer of `usage/<contributor>.json`.
//
// `node --test scripts/tests/` - builtins only. Every run points --root at a fixture registry
// and --db at a fixture SQLite file, so the real `usage/` lane is never written and the real
// Personas database is never read. The script reads SQLite through node:sqlite (Node >= 22.5),
// so the tests that need a database skip when it is absent; the flag-refusal tests do not
// need one - the flag set is parsed before the database is opened.
//
// Refusals are asserted on their MESSAGE as well as the exit code: exit 2 also means "no
// contributor" and "no database" here, and a code-only assertion would pass for the wrong reason.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../usage-from-personas.mjs', import.meta.url));
const made = [];
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true }); });

let DatabaseSync = null;
try { ({ DatabaseSync } = await import('node:sqlite')); } catch { /* the db-backed tests skip */ }

/** A registry root with one skill directory (so the skill is "known") and a fixture Personas db. */
function fixture() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'usage-from-personas-'));
  made.push(base);
  const reg = path.join(base, 'registry');
  fs.mkdirSync(path.join(reg, 'skills', 'zz-fixture-skill'), { recursive: true });
  const db = path.join(base, 'personas.db');
  if (DatabaseSync) {
    const h = new DatabaseSync(db);
    h.exec('CREATE TABLE skill_usage_events (skill_name TEXT, event TEXT, occurred_at TEXT)');
    const ins = h.prepare('INSERT INTO skill_usage_events VALUES (?, ?, datetime(\'now\'))');
    ins.run('zz-fixture-skill', 'invoke');
    ins.run('zz-fixture-skill', 'invoke');
    h.close();
  }
  return { reg, db, usage: path.join(reg, 'usage') };
}
const run = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
const written = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []);

test('an unknown flag exits 2 and writes nothing', () => {
  const { reg, db, usage } = fixture();
  const r = run('--root', reg, '--db', db, '--contributor', 'other-c', '--forse');
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /unknown argument "--forse"/);
  assert.deepEqual(written(usage), []);
});

test('a value-flag with no value exits 2 and writes nothing', () => {
  const { reg, db, usage } = fixture();
  for (const flag of ['--contributor', '--db', '--root']) {
    const r = run(...(flag === '--root' ? ['--db', db, '--contributor=other-c', flag] : ['--root', reg, '--db', db, flag]));
    assert.equal(r.status, 2, `${flag}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, new RegExp(`${flag} needs a value`));
  }
  // The next flag is not a value.
  const swallowed = run('--root', reg, '--contributor', '--db', db);
  assert.equal(swallowed.status, 2, swallowed.stdout + swallowed.stderr);
  assert.match(swallowed.stderr, /--contributor needs a value/);
  assert.deepEqual(written(usage), []);
});

test('--contributor and --db in the space form are honoured, never dropped for the machine contributor', { skip: !DatabaseSync && 'node:sqlite is not available in this Node' }, () => {
  const { reg, db, usage } = fixture();
  const r = run('--root', reg, '--db', db, '--contributor', 'other-c');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.deepEqual(written(usage), ['other-c.json']);
  const doc = JSON.parse(fs.readFileSync(path.join(usage, 'other-c.json'), 'utf8'));
  assert.equal(doc.contributor, 'other-c');
  assert.equal(doc.skills['zz-fixture-skill'].invokes, 2, 'the --db fixture was the database read');
  const eq = run(`--root=${reg}`, `--db=${db}`, '--contributor=third-c');
  assert.equal(eq.status, 0, eq.stdout + eq.stderr);
  assert.deepEqual(written(usage), ['other-c.json', 'third-c.json']);
});
