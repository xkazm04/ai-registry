// lib/currency-clock.mjs is the one clock behind check-currency and librarian-scan. Before it
// existed the librarian scored only an explicit `refresh_by`, so an application on the derived
// clock (`verified_on` + the stack's window) never expired in its bundle's attention points
// while the currency report counted it: 20 vs 19 at risk on the real tree, 2026-10-25.
// The cases are: the clock's own arithmetic, then BOTH tools run over one fixture registry and
// required to agree, application by application.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { clockOf, WINDOW_DAYS, DEFAULT_WINDOW_DAYS } from '../lib/currency-clock.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const isoIn = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const today = isoIn(0);

test('clockOf: refresh_by is the expiry and beats derivation', () => {
  const c = clockOf({ stack: 'node', verified_on: '2020-01-01', refresh_by: isoIn(40) }, today);
  assert.deepEqual([c.clockSource, c.expiresOn, c.daysLeft], ['refresh_by', isoIn(40), 40]);
});

test('clockOf: without refresh_by the expiry is verified_on + the stack window', () => {
  for (const stack of ['react', 'next', 'node', 'rust', 'sql']) {
    const c = clockOf({ stack, verified_on: isoIn(-10) }, today);
    assert.equal(c.clockSource, 'derived', stack);
    assert.equal(c.daysLeft, WINDOW_DAYS[stack] - 10, stack);
  }
  // an unlisted stack takes the default window, not "no clock"
  assert.equal(clockOf({ stack: 'zig', verified_on: isoIn(-10) }, today).daysLeft, DEFAULT_WINDOW_DAYS - 10);
});

test('clockOf: process, spec and data have no derived clock; no verified_on has none either', () => {
  for (const stack of ['process', 'spec', 'data']) {
    const c = clockOf({ stack, verified_on: '2020-01-01' }, today);
    assert.deepEqual([c.clockSource, c.expiresOn, c.daysLeft], ['none', null, null], stack);
  }
  assert.equal(clockOf({ stack: 'node' }, today).clockSource, 'none');
});

test('clockOf: an empty key (a reader may hand back []) or a non-date verified_on derives nothing and does not throw', () => {
  assert.equal(clockOf({ stack: 'node', verified_on: [] }, today).clockSource, 'none');
  assert.equal(clockOf({ stack: 'node', verified_on: 'soon' }, today).clockSource, 'none');
  assert.equal(clockOf({ stack: [], verified_on: isoIn(-1) }, today).window, DEFAULT_WINDOW_DAYS);
});

// ---------------------------------------------------------------- both tools, one registry
function registry(t, apps) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'currency-clock-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(path.join(root, 'scripts/lib'), path.join(dir, 'scripts/lib'), { recursive: true });
  for (const s of ['check-currency.mjs', 'librarian-scan.mjs']) fs.copyFileSync(path.join(root, 'scripts', s), path.join(dir, 'scripts', s));
  fs.mkdirSync(path.join(dir, 'skills'));
  fs.mkdirSync(path.join(dir, 'librarian'));
  fs.writeFileSync(path.join(dir, 'identity-aliases.json'), JSON.stringify({ schema: 1 }));
  fs.copyFileSync(path.join(root, 'librarian/standard.md'), path.join(dir, 'librarian/standard.md'));
  const subj = path.join(dir, 'knowledge/demo/alpha');
  fs.mkdirSync(path.join(subj, 'techniques'), { recursive: true });
  fs.mkdirSync(path.join(subj, 'applications'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'knowledge/demo/index.json'), JSON.stringify({ subjects: { alpha: { file: 'knowledge/demo/alpha/alpha.md' } } }));
  fs.writeFileSync(path.join(subj, 'alpha.md'), '---\nslug: alpha\nstatus: forged\n---\nbody\n');
  for (const [f, fm] of Object.entries(apps)) fs.writeFileSync(path.join(subj, 'applications', f), `---\n${fm.join('\n')}\n---\nbody\n`);
  return dir;
}
function both(dir) {
  const c = spawnSync(process.execPath, [path.join(dir, 'scripts/check-currency.mjs'), '--json'], { encoding: 'utf8' });
  assert.equal(c.status, 0, c.stderr);
  const l = spawnSync(process.execPath, [path.join(dir, 'scripts/librarian-scan.mjs'), '--json'], { encoding: 'utf8' });
  assert.equal(l.status, 0, l.stderr);
  const cj = JSON.parse(c.stdout);
  const lj = JSON.parse(l.stdout).subjects.find((s) => s.id === 'demo/alpha');
  return { currency: [cj.totals.expired, cj.totals.atRisk], librarian: [lj.expired, lj.atRisk] };
}

test('an application with no refresh_by and verified_on past its stack window is expired in BOTH tools', (t) => {
  const dir = registry(t, { 'node--a.md': ['stack: node', `verified_on: ${isoIn(-(WINDOW_DAYS.node + 5))}`] });
  const r = both(dir);
  assert.deepEqual(r.currency, [1, 0]);
  assert.deepEqual(r.librarian, [1, 0]);
});

test('a derived clock inside the horizon is at risk in BOTH tools', (t) => {
  const dir = registry(t, { 'next--a.md': ['stack: next', `verified_on: ${isoIn(-(WINDOW_DAYS.next - 30))}`] });
  const r = both(dir);
  assert.deepEqual(r.currency, [0, 1]);
  assert.deepEqual(r.librarian, [0, 1]);
});

test('the two tools agree over a mixed registry: derived, explicit, override, and clockless', (t) => {
  const dir = registry(t, {
    'node--derived-expired.md': ['stack: node', `verified_on: ${isoIn(-400)}`],
    'react--derived-ok.md': ['stack: react', `verified_on: ${isoIn(-5)}`],
    'sql--explicit-expired.md': ['stack: sql', `verified_on: ${isoIn(-5)}`, `refresh_by: ${isoIn(-1)}`],
    'node--override-ok.md': ['stack: node', `verified_on: ${isoIn(-400)}`, `refresh_by: ${isoIn(300)}`],
    'process--none.md': ['stack: process', `verified_on: ${isoIn(-900)}`],
    'spec--none.md': ['stack: spec', `verified_on: ${isoIn(-900)}`],
    'rust--at-risk.md': ['stack: rust', `verified_on: ${isoIn(-(WINDOW_DAYS.rust - 12))}`],
  });
  const r = both(dir);
  assert.deepEqual(r.currency, [2, 1]);
  assert.deepEqual(r.librarian, r.currency);
});
