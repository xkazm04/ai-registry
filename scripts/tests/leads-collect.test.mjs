// Tests for scripts/leads-collect.mjs - the operator-side fold of consumer lead ledgers into
// librarian/inbox.md.
//
// `node --test scripts/tests/` - builtins only. Every run points --root at a fixture
// registry (its own projects.json, .machine.local.json and one consumer checkout), so the
// real fleet's ledgers are never read and the real inbox is never written.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../leads-collect.mjs', import.meta.url));
const made = [];
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true }); });

/** A registry root with a one-project fleet on machine Testbox; `leads` go into the project's ledger. */
function fixture(leads) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'leads-collect-'));
  made.push(base);
  const reg = path.join(base, 'registry');
  const proj = path.join(base, 'work', 'demo');
  fs.mkdirSync(reg, { recursive: true });
  fs.mkdirSync(path.join(proj, '.ai'), { recursive: true });
  fs.writeFileSync(path.join(reg, 'projects.json'), JSON.stringify({ schema: 2, machines: { Testbox: {} }, projects: { demo: { checkouts: { Testbox: 'work/demo' } } } }));
  fs.writeFileSync(path.join(reg, '.machine.local.json'), JSON.stringify({ machine: 'Testbox', root: base, contributor: 'test-box' }));
  fs.writeFileSync(path.join(proj, '.ai', 'registry-leads.jsonl'), leads.map((l) => `${JSON.stringify(l)}\n`).join(''));
  return { reg, inbox: path.join(reg, 'librarian', 'inbox.md') };
}
const lead = (claim, over = {}) => ({ ts: new Date().toISOString(), bundle: 'software-engineering', nearest: 'data-access', kind: 'technique', claim, because: 'measured on a fixture', confidence: 'medium', from: 'scan-sweep@1.0.0', ...over });
const run = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });

test('--root folds the fixture fleet\'s ledger, and only it, into that root\'s inbox', () => {
  const { reg, inbox } = fixture([lead('when a cache key omits the tenant, include it, because reads cross tenants')]);
  const dry = run('--root', reg, '--dry-run');
  assert.equal(dry.status, 0, dry.stderr);
  assert.match(dry.stdout, /when a cache key omits the tenant/);
  assert.match(dry.stdout, /1 new lead\(s\) from 1 project/);
  assert.equal(fs.existsSync(inbox), false, 'a dry run writes nothing');
  const real = run('--root', reg);
  assert.equal(real.status, 0, real.stderr);
  assert.match(fs.readFileSync(inbox, 'utf8'), /\| demo \/ scan-sweep@1\.0\.0 \|/);
  assert.match(run('--root', reg).stdout, /no new leads/, 'a second pass is idempotent');
});

test('--root without a value is a usage error, not a run against this checkout', () => {
  const r = run('--dry-run', '--root');
  assert.equal(r.status, 2, r.stdout + r.stderr);
});

test('a lead whose text would publish a machine path or an address is withheld and counted, never written to the public inbox', () => {
  const { reg, inbox } = fixture([
    lead('when a retry storms, cap it fleet-wide, because one budget sees every caller'),
    lead('when the queue drains, stop the poller, because idle polls cost money', { because: 'measured in D:/work/acme-billing/src/poller.ts' }),
    lead('ask jane.doe@acme-corp.com before changing the retry cap, because she owns it'),
    lead('when a hook is slow, time it, because the budget is shared', { from: 'scan-sweep@1.0.0 run in ~/work/acme' }),
  ]);
  const r = run('--root', reg);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /1 new lead\(s\) appended/);
  assert.match(r.stdout + r.stderr, /3 lead\(s\) withheld/);
  const text = fs.readFileSync(inbox, 'utf8');
  assert.match(text, /cap it fleet-wide/);
  for (const leak of ['D:/work', 'acme-corp.com', '~/work']) assert.ok(!text.includes(leak), `the inbox carries ${leak}`);
});
