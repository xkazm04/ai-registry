// Tests for scripts/hygiene-disk.mjs - the disk lane's rules, and its git facts on real
// throwaway repositories (never the fleet's). Builtins only.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { classifyCheckout, classifyPlain, classifyTemp, leakFamilies, checkoutFacts, scratchRootOf, BUILD_OUTPUT, scan } from '../hygiene-disk.mjs';

// Fixture git never sees a hook's GIT_DIR (2026-09-19: fixtures wrote into real repositories).
const ENV = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_'))), GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t.invalid', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t.invalid' };
const g = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { env: ENV, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

function repos() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'hdisk-'));
  const home = path.join(base, 'home');
  fs.mkdirSync(home);
  g(home, 'init', '-q', '-b', 'main');
  fs.writeFileSync(path.join(home, 'a.txt'), 'one\n');
  g(home, 'add', 'a.txt');
  g(home, 'commit', '-q', '-m', 'one');
  const clone = path.join(base, 'cn1-home');
  execFileSync('git', ['clone', '-q', home, clone], { env: ENV, stdio: 'ignore' });
  const homes = [{ slug: 'home', path: home, keys: [home.toLowerCase().replace(/\\/g, '/')] }];
  return { base, home, clone, homes, cleanup: () => fs.rmSync(base, { recursive: true, force: true }) };
}

test('classifyCheckout: live is hands-off, hyg is the operator, WIP and unlanded stay, landed+clean goes', () => {
  const ok = { name: 'cn1-kp', ageH: 30, dirtyOther: [], headLanded: true };
  assert.equal(classifyCheckout({ ...ok, ageH: 2 }).class, 'hands-off');
  assert.equal(classifyCheckout({ ...ok, name: 'hyg-ascent-pr23' }).kind, 'scratch-hyg-worktree');
  assert.equal(classifyCheckout({ ...ok, dirtyOther: ['src/x.ts'] }).kind, 'scratch-wip');
  assert.equal(classifyCheckout({ ...ok, headLanded: false }).kind, 'scratch-unlanded');
  assert.equal(classifyCheckout({ ...ok, headLanded: null }).class, 'operator', 'unknown is not landed');
  assert.equal(classifyCheckout(ok).kind, 'remove-scratch-checkout');
});

test('build-output names seen in the scratch root on 2026-10-15 match; ordinary names do not', () => {
  for (const n of ['cn116-target', 'cn93-tl-target', 'cargo-target-b68c', 'personas-cargo-target-2', 'personas-target-mesh-test', 'tgt-x', 'pumper-ctrl-target', 'node_modules']) assert.ok(BUILD_OUTPUT.test(n), n);
  for (const n of ['cn198-tl', 'targeting-notes', 'fix-sys', 'integ', 'bm-ctx']) assert.ok(!BUILD_OUTPUT.test(n), n);
  assert.equal(classifyPlain({ name: 'cn116-target', ageH: 30 }).kind, 'remove-build-output');
  assert.equal(classifyPlain({ name: 'cn116-target', ageH: 3 }), null, 'a live build is never touched');
  assert.equal(classifyPlain({ name: 'tmp-sec', ageH: 30 * 24 }).kind, 'scratch-dir', 'unknown content goes to the operator');
  assert.equal(classifyPlain({ name: 'tmp-sec', ageH: 3 * 24 }), null);
});

test('classifyTemp: 7 days, or 2 days and 100 MB', () => {
  assert.equal(classifyTemp({ ageH: 8 * 24, bytes: 10 }).kind, 'remove-temp');
  assert.equal(classifyTemp({ ageH: 50, bytes: 200e6 }).kind, 'remove-temp');
  assert.equal(classifyTemp({ ageH: 50, bytes: 1e6 }), null);
  assert.equal(classifyTemp({ ageH: 20, bytes: 5e9 }), null, 'a fresh big dir is somebody\'s live work');
});

test('leakFamilies folds ids and counters into one family per leaking suite', () => {
  // fs.mkdtemp(prefix) appends six random [A-Za-z0-9] directly to the prefix
  const AL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const rnd = () => Array.from({ length: 6 }, () => AL[Math.floor(Math.random() * AL.length)]).join('');
  const names = [];
  for (let i = 0; i < 250; i++) names.push(`pumper-server-e2e${rnd()}`);
  for (let i = 0; i < 30; i++) names.push(`kp-analyze-run-test${rnd()}`);
  const fam = leakFamilies(names, 200);
  assert.equal(fam.length, 1);
  assert.equal(fam[0][1], 250);
  assert.equal(leakFamilies(names, 20).length, 2);
});

test('scratchRootOf is `t` at the root of the fleet drive', () => {
  assert.equal(scratchRootOf(path.join(path.parse(os.homedir()).root, 'Users', 'x')), path.join(path.parse(os.homedir()).root, 't'));
});

test('checkoutFacts: a clean clone is landed; an unpushed commit is not, until its patch is in the home repo', () => {
  const r = repos();
  try {
    let f = checkoutFacts(r.clone, r.homes);
    assert.equal(f.headLanded, true, f.why);
    assert.deepEqual(f.dirtyOther, []);
    fs.writeFileSync(path.join(r.clone, 'b.txt'), 'work\n');
    g(r.clone, 'add', 'b.txt');
    g(r.clone, 'commit', '-q', '-m', 'unpushed work');
    f = checkoutFacts(r.clone, r.homes);
    assert.equal(f.headLanded, false, 'a commit only the clone holds');
    assert.match(f.why, /1 of 1 local commits not in home/);
    assert.equal(checkoutFacts(r.clone, []).headLanded, false, 'no home to check in: not landed');
    // the same change lands in the home repository under another sha (an apply flow, a cherry-pick)
    fs.writeFileSync(path.join(r.home, 'b.txt'), 'work\n');
    g(r.home, 'add', 'b.txt');
    g(r.home, 'commit', '-q', '-m', 'landed differently');
    f = checkoutFacts(r.clone, r.homes);
    assert.equal(f.headLanded, true, f.why);
    assert.match(f.why, /by patch-id/);
  } finally { r.cleanup(); }
});

test('checkoutFacts: a clone is landed only when EVERY local ref is, not just HEAD', () => {
  // Deleting a clone deletes all of its refs: a side branch or a stash holding unpushed
  // commits is lost even when HEAD sits on origin/main.
  const r = repos();
  try {
    g(r.clone, 'checkout', '-q', '-b', 'side');
    fs.writeFileSync(path.join(r.clone, 'side.txt'), 'side work\n');
    g(r.clone, 'add', 'side.txt');
    g(r.clone, 'commit', '-q', '-m', 'side work');
    g(r.clone, 'checkout', '-q', 'main');
    let f = checkoutFacts(r.clone, r.homes);
    assert.equal(f.headLanded, false, `a side branch with an unpushed commit: ${f.why}`);
    g(r.clone, 'branch', '-q', '-D', 'side');
    assert.equal(checkoutFacts(r.clone, r.homes).headLanded, true, 'nothing left but what origin has');
    fs.writeFileSync(path.join(r.clone, 'a.txt'), 'stashed\n');
    g(r.clone, 'stash', '-q');
    f = checkoutFacts(r.clone, r.homes);
    assert.equal(f.headLanded, false, `a stash is local work: ${f.why}`);
  } finally { r.cleanup(); }
});

test('checkoutFacts: install noise is not work; a real untracked or modified file is', () => {
  const r = repos();
  try {
    // as in the systedo clones: .husky is tracked, the installer drops untracked hook shims into it
    fs.mkdirSync(path.join(r.clone, '.husky'));
    fs.writeFileSync(path.join(r.clone, '.husky', 'pre-commit'), 'tracked hook');
    g(r.clone, 'add', '.husky/pre-commit');
    g(r.clone, 'commit', '-q', '-m', 'hooks');
    g(r.clone, 'push', '-q', 'origin', 'HEAD:hooks'); // on its remote, so still landed
    fs.writeFileSync(path.join(r.clone, 'next-env.d.ts'), 'generated');
    fs.writeFileSync(path.join(r.clone, '.husky', 'commit-msg'), 'shim');
    fs.writeFileSync(path.join(r.clone, 'grep.exe.stackdump'), 'crash'); // C:/t/dp-* 2026-10-21
    assert.deepEqual(checkoutFacts(r.clone, r.homes).dirtyOther, []);
    fs.writeFileSync(path.join(r.clone, 'a.txt'), 'one\r\n'); // line-ending-only change
    assert.deepEqual(checkoutFacts(r.clone, r.homes).dirtyOther, []);
    fs.writeFileSync(path.join(r.clone, 'a.txt'), 'two\n');
    assert.deepEqual(checkoutFacts(r.clone, r.homes).dirtyOther, ['a.txt']);
    fs.writeFileSync(path.join(r.clone, 'a.txt'), 'one\n');
    fs.writeFileSync(path.join(r.clone, 'notes.md'), 'mine');
    assert.deepEqual(checkoutFacts(r.clone, r.homes).dirtyOther, ['notes.md']);
  } finally { r.cleanup(); }
});

test('checkoutFacts: staged work is work - a staged new file or edit keeps the clone, a staged whitespace edit does not', () => {
  // `git diff` alone compares the tree to the INDEX, so `git add`ed work read as clean and a
  // landed clone holding it was a mechanical delete.
  const r = repos();
  try {
    fs.writeFileSync(path.join(r.clone, 'staged.txt'), 'staged only\n');
    g(r.clone, 'add', 'staged.txt');
    assert.deepEqual(checkoutFacts(r.clone, r.homes).dirtyOther, ['staged.txt'], 'a staged new file');
    g(r.clone, 'rm', '-q', '--cached', 'staged.txt');
    fs.rmSync(path.join(r.clone, 'staged.txt'));
    fs.writeFileSync(path.join(r.clone, 'a.txt'), 'two\n');
    g(r.clone, 'add', 'a.txt');
    assert.deepEqual(checkoutFacts(r.clone, r.homes).dirtyOther, ['a.txt'], 'a staged edit');
    fs.writeFileSync(path.join(r.clone, 'a.txt'), 'one  \n');
    g(r.clone, 'add', 'a.txt');
    assert.deepEqual(checkoutFacts(r.clone, r.homes).dirtyOther, [], 'a staged whitespace-only edit is still noise');
  } finally { r.cleanup(); }
});

test('scan: a checkout in the temp dir gets the checkout rules, not the temp age rule', () => {
  // Workers and fixtures put worktrees and clones straight into the user temp dir
  // (hygiene-scan's ownerOf calls them `temp`). Age alone made one with WIP a mechanical delete.
  const r = repos();
  try {
    const tmp = path.join(r.base, 'tmp');
    const home = path.join(r.base, 'userhome');
    fs.mkdirSync(tmp); fs.mkdirSync(home);
    const wip = path.join(tmp, 'wt-wip');
    const landed = path.join(tmp, 'cn-landed');
    for (const d of [wip, landed]) execFileSync('git', ['clone', '-q', r.home, d], { env: ENV, stdio: 'ignore' });
    fs.writeFileSync(path.join(wip, 'notes.md'), 'only copy\n');
    fs.mkdirSync(path.join(tmp, 'plain-old'));
    fs.writeFileSync(path.join(tmp, 'plain-old', 'x.bin'), 'x');
    const rows = scan({ fleet: { projects: {} }, idleH: 24, tempDays: 7, scratch: path.join(r.base, 'no-scratch'), tmp, home, now: Date.now() + 10 * 86400e3 });
    const by = Object.fromEntries(rows.map((x) => [path.basename(x.path), x]));
    assert.equal(by['wt-wip'].class, 'operator', JSON.stringify(by['wt-wip']));
    assert.equal(by['wt-wip'].kind, 'scratch-wip');
    assert.equal(by['cn-landed'].kind, 'remove-scratch-checkout', 'landed and clean: removable, with a HEAD to re-check at apply');
    assert.ok(by['cn-landed'].head);
    assert.equal(by['plain-old'].kind, 'remove-temp');
  } finally { r.cleanup(); }
});

test('--reap deletes the landed clone and the build output it names, keeps unpushed work, refuses outside the scratch root', () => {
  const r = repos();
  try {
    const scratch = path.join(r.base, 'scratch');
    fs.mkdirSync(scratch);
    const landed = path.join(scratch, 'cn7-home');
    const unpushed = path.join(scratch, 'cn8-home');
    for (const d of [landed, unpushed]) execFileSync('git', ['clone', '-q', r.home, d], { env: ENV, stdio: 'ignore' });
    fs.writeFileSync(path.join(unpushed, 'w.txt'), 'only here\n');
    g(unpushed, 'add', 'w.txt');
    g(unpushed, 'commit', '-q', '-m', 'only here');
    const target = path.join(scratch, 'cn7-target');
    fs.mkdirSync(path.join(target, 'debug'), { recursive: true });
    fs.writeFileSync(path.join(target, 'debug', 'x.rlib'), 'bin');
    const SCRIPT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', 'hygiene-disk.mjs');
    const out = execFileSync(process.execPath, [SCRIPT, '--scratch', scratch, '--out', path.join(r.base, 'out'), '--reap', landed, unpushed, target, r.home], { env: ENV, encoding: 'utf8' });
    const rows = Object.fromEntries(out.trim().split('\n').map((l) => JSON.parse(l)).map((x) => [path.basename(x.path), x]));
    assert.equal(rows['cn7-home'].done, true, JSON.stringify(rows['cn7-home']));
    assert.equal(fs.existsSync(landed), false);
    assert.equal(rows['cn8-home'].done, false);
    assert.match(rows['cn8-home'].skipped, /scratch-unlanded/);
    assert.equal(fs.existsSync(path.join(unpushed, 'w.txt')), true, 'unpushed work survives');
    assert.equal(rows['cn7-target'].done, true);
    assert.equal(fs.existsSync(target), false);
    assert.match(rows.home.skipped, /not a top-level entry of the scratch root/);
    assert.equal(fs.existsSync(path.join(r.home, 'a.txt')), true);
    assert.equal(fs.readFileSync(path.join(r.base, 'out', 'disk-applied.jsonl'), 'utf8').trim().split('\n').length, 4);
  } finally { r.cleanup(); }
});

test('checkoutFacts: a worktree is landed only when its HEAD is on another ref of its repository', () => {
  const r = repos();
  try {
    const wt = path.join(r.base, 'wt');
    g(r.home, 'worktree', 'add', '-q', '-b', 'feature', wt);
    let f = checkoutFacts(wt, r.homes);
    assert.equal(f.headLanded, true, 'branch tip equals main');
    assert.equal(path.resolve(f.mainRepo).toLowerCase(), path.resolve(r.home).toLowerCase());
    fs.writeFileSync(path.join(wt, 'c.txt'), 'feature work\n');
    g(wt, 'add', 'c.txt');
    g(wt, 'commit', '-q', '-m', 'feature work');
    f = checkoutFacts(wt, r.homes);
    assert.equal(f.headLanded, false, 'its own branch is the only holder');
    g(r.home, 'merge', '-q', '--ff-only', 'feature');
    assert.equal(checkoutFacts(wt, r.homes).headLanded, true, 'merged into main');
  } finally { r.cleanup(); }
});
