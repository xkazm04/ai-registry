// The hygiene planner decides what gets deleted in eleven repositories every morning.
// Each case below is a safety rule, most of them learned from a near miss on the live
// fleet (see .claude/skills/hygiene/LESSONS.md). The planner is pure: fixtures in, actions out.
import test from 'node:test';
import assert from 'node:assert/strict';
import { planActions, denyBlocksPush, splitRed } from '../hygiene-scan.mjs';

const HOUR = 60;

function project(over = {}) {
  return {
    slug: 'demo', repo: 'o/demo', archived: false, originHeadSet: true, defaultBranch: 'main',
    worktrees: [{ path: 'C:/k/demo', owner: 'primary', branch: 'main', dirty: 0, live: false, lastActivityMin: 5 * HOUR }],
    primary: { branch: 'main', onDefault: true, dirty: 0, live: false, ahead: 0, behind: 0, unpushed: [] },
    localBranches: [], remoteBranches: [], openPrs: [], defaultCi: [],
    security: {
      codeScanning: { posture: 'enabled', alerts: [], bySeverity: {} },
      secretScanning: { posture: 'enabled', alerts: [], bySeverity: {} },
      dependabot: { posture: 'enabled', alerts: [], bySeverity: {} },
    },
    ...over,
  };
}
const branch = (name, over = {}) => ({ name, sha: 'a'.repeat(40), cls: 'merged', ahead: 0, remote: false, live: false, commitMin: 100 * HOUR, worktree: null, baseOfOpenPr: false, pr: null, ...over });
const kinds = (actions, cls) => actions.filter((a) => !cls || a.class === cls).map((a) => `${a.kind} ${a.target}`);

test('a merged remote branch nobody has checked out is a mechanical delete', () => {
  const A = planActions(project({ remoteBranches: [branch('old-feature', { remote: true })] }));
  assert.deepEqual(kinds(A, 'mechanical'), ['delete-remote-branch old-feature']);
});

test('a remote branch checked out in the primary is never deleted, even at 0 ahead', () => {
  // 2026-09-15: personas-web primary on a fresh branch with 10 uncommitted changes.
  const P = project({
    worktrees: [{ path: 'C:/k/demo', owner: 'primary', branch: 'chore/wip', dirty: 10, live: false, lastActivityMin: 20 * HOUR }],
    primary: { branch: 'chore/wip', onDefault: false, dirty: 10, live: false, ahead: null, behind: null, unpushed: [] },
    remoteBranches: [branch('chore/wip', { remote: true })],
  });
  assert.deepEqual(kinds(planActions(P), 'mechanical'), []);
});

test('the base of an open stacked PR is never deleted', () => {
  const A = planActions(project({ remoteBranches: [branch('base', { remote: true, baseOfOpenPr: true })] }));
  assert.equal(A.filter((a) => a.kind === 'delete-remote-branch').length, 0);
});

test('a live branch is hands-off, not deleted', () => {
  const A = planActions(project({ localBranches: [branch('hot', { live: true, commitMin: 10 })] }));
  assert.deepEqual(kinds(A, 'mechanical'), []);
  assert.deepEqual(kinds(A, 'hands-off'), ['live-branch hot']);
});

test('a clean idle merged Claude Code worktree is removed with its branch', () => {
  const P = project({
    worktrees: [
      project().worktrees[0],
      { path: 'C:/k/demo/.claude/worktrees/x', owner: 'claude-code', branch: 'wt-x', head: 'b'.repeat(40), dirty: 0, live: false, lastActivityMin: 48 * HOUR },
    ],
    localBranches: [branch('wt-x', { worktree: { path: 'C:/k/demo/.claude/worktrees/x', owner: 'claude-code', dirty: 0, live: false } })],
  });
  const A = planActions(P);
  const rm = A.find((a) => a.kind === 'remove-worktree');
  assert.equal(rm?.class, 'mechanical');
  assert.equal(rm.deleteBranch, true);
  assert.equal(A.filter((a) => a.kind === 'delete-local-branch').length, 0, 'the branch goes with its worktree, not separately');
});

test('a worktree younger than the idle floor is left alone', () => {
  const P = project({
    worktrees: [project().worktrees[0], { path: 'C:/t/x', owner: 'temp', branch: 'wt-x', dirty: 0, live: false, lastActivityMin: 3 * HOUR }],
    localBranches: [branch('wt-x', { worktree: { path: 'C:/t/x', owner: 'temp', dirty: 0, live: false } })],
  });
  assert.equal(planActions(P).filter((a) => a.kind === 'remove-worktree').length, 0);
});

test('uncommitted changes are never mechanical, however old', () => {
  const P = project({
    worktrees: [project().worktrees[0], { path: 'C:/k/demo/.claude/worktrees/y', owner: 'claude-code', branch: 'wt-y', dirty: 1, live: false, lastActivityMin: 3000 * HOUR }],
    localBranches: [branch('wt-y', { worktree: { path: 'C:/k/demo/.claude/worktrees/y', owner: 'claude-code', dirty: 1, live: false } })],
  });
  const A = planActions(P);
  assert.deepEqual(kinds(A, 'mechanical'), []);
  assert.equal(A.find((a) => a.kind === 'stale-uncommitted-worktree')?.class, 'operator');
});

test('Personas-app worktrees are summarized for the operator, never removed', () => {
  const app = 'C:/Users/u/AppData/Roaming/com.personas.desktop/worktrees/id/run-1';
  const P = project({
    worktrees: [project().worktrees[0], { path: app, owner: 'personas-app', branch: 'autopilot/run-1', dirty: 0, live: false, lastActivityMin: 500 * HOUR }],
    localBranches: [branch('autopilot/run-1', { worktree: { path: app, owner: 'personas-app', dirty: 0, live: false } })],
  });
  const A = planActions(P);
  assert.deepEqual(kinds(A, 'mechanical'), []);
  assert.equal(A.find((a) => a.kind === 'personas-app-worktrees')?.class, 'operator');
});

test('unpushed commits on the primary default branch are an operator row, never a worker ship', () => {
  // Operator decision 2026-09-15: the owner pushes after reading the log.
  const P = project({ primary: { branch: 'main', onDefault: true, dirty: 0, live: false, ahead: 3, behind: 0, unpushed: ['abc fix: x'] } });
  const A = planActions(P);
  assert.equal(A.find((a) => a.kind === 'primary-unpushed')?.class, 'operator');
  assert.equal(A.filter((a) => a.class === 'worker').length, 0);
});

test('an idle primary that is only behind is fast-forwarded; a live one is hands-off', () => {
  const idle = planActions(project({ primary: { branch: 'main', onDefault: true, dirty: 0, live: false, ahead: 0, behind: 4, unpushed: [] } }));
  assert.deepEqual(kinds(idle, 'mechanical'), ['ff-primary main']);
  const live = planActions(project({ primary: { branch: 'main', onDefault: true, dirty: 2, live: true, lastActivityMin: 3, ahead: 0, behind: 4, unpushed: [] } }));
  assert.deepEqual(kinds(live, 'mechanical'), []);
});

test('a recently updated PR is hands-off; a stale green one is a worker ship', () => {
  const pr = (number, updatedMin) => ({ number, title: 't', head: `h${number}`, base: 'main', draft: false, mergeable: 'MERGEABLE', mergeState: 'CLEAN', checks: { pass: 3, fail: 0, pending: 0, failing: [] }, stacked: false, updatedMin, live: updatedMin < 120 });
  const A = planActions(project({ openPrs: [pr(1, 30), pr(2, 3000)] }));
  assert.deepEqual(kinds(A, 'hands-off'), ['live-pr #1']);
  assert.deepEqual(kinds(A, 'worker'), ['pr-ship #2']);
});

test('a branch contained in the unpushed local default branch is a mechanical delete, not a triage', () => {
  // 2026-09-15, pof: a 70-commit branch was an ancestor of local master (76 ahead of origin).
  const A = planActions(project({ localBranches: [branch('direction/done-locally', { cls: 'on-local-default', ahead: 70 })] }));
  assert.deepEqual(kinds(A, 'mechanical'), ['delete-local-branch direction/done-locally']);
  assert.equal(A.filter((a) => a.class === 'worker').length, 0);
});

test('only a push-triggered red run is a worker repair; scheduled or dispatched red is an operator signal', () => {
  const run = (workflow, event) => ({ workflow, event, status: 'completed', conclusion: 'failure', id: 1, onTip: true });
  const A = planActions(project({ defaultCi: [run('sentinel', 'workflow_dispatch'), run('flake watch', 'schedule')] }));
  assert.equal(A.filter((a) => a.kind === 'default-branch-red').length, 0);
  assert.equal(A.find((a) => a.kind === 'non-gate-workflow-red')?.class, 'operator');
  const B = planActions(project({ defaultCi: [run('CI', 'push')] }));
  assert.equal(B.find((a) => a.kind === 'default-branch-red')?.class, 'worker');
});

test('a push-denied repo keeps only server-side merges with the worker', () => {
  // 2026-09-15, systedo-case: settings deny git push, yet a worker pushed a PR branch to fix red CI.
  const pr = { number: 7, title: 't', head: 'h', base: 'main', draft: false, mergeable: 'MERGEABLE', mergeState: 'CLEAN', checks: { pass: 2, fail: 0, pending: 0, failing: [] }, stacked: false, updatedMin: 5000, live: false };
  const A = planActions(project({
    pushDenied: true,
    openPrs: [pr],
    defaultCi: [{ workflow: 'CI', event: 'push', status: 'completed', conclusion: 'failure', id: 1, onTip: true }],
    remoteBranches: [branch('old', { remote: true }), branch('wip', { remote: true, cls: 'no-pr', ahead: 3 })],
  }));
  assert.deepEqual(kinds(A, 'worker'), ['pr-ship #7']);
  for (const k of ['default-branch-red', 'delete-remote-branch', 'triage-branch']) {
    assert.equal(A.find((a) => a.kind === k)?.class, 'operator', k);
  }
});

test('only a blanket push deny marks a repo push-denied; force-push denies do not', () => {
  // The fleet's real rule shapes, 2026-09-15.
  assert.equal(denyBlocksPush(['Bash(git push:*)']), true, 'systedo-case');
  assert.equal(denyBlocksPush(['Bash(git push *)']), true, 'space-wildcard shape');
  assert.equal(denyBlocksPush(['Bash(git push)']), true);
  assert.equal(denyBlocksPush(['Bash(git push*--force*)', 'Bash(git push* -f *)']), false, 'every other repo');
  assert.equal(denyBlocksPush(['Bash(*--no-verify*)', 'Bash(git commit*)']), false);
  assert.equal(denyBlocksPush([]), false);
});

test('a red push run that fails no required check is a signal, not the gate', () => {
  // tracklight 2026-09-15: tip red on gitleaks + cargo-deny advisories, neither required.
  const run = (over) => ({ workflow: 'CI', event: 'push', status: 'completed', conclusion: 'failure', id: 1, onTip: true, ...over });
  const signalOnly = [run({ failingJobs: ['gitleaks (secrets)'], failsRequired: false })];
  assert.equal(splitRed(signalOnly).gate.length, 0);
  assert.equal(planActions(project({ defaultCi: signalOnly })).find((a) => a.kind === 'non-gate-workflow-red')?.class, 'operator');
  // Required job failed, or protection unknown: still the gate.
  assert.equal(splitRed([run({ failingJobs: ['cargo test --workspace'], failsRequired: true })]).gate.length, 1);
  assert.equal(splitRed([run({})]).gate.length, 1, 'unknown protection keeps the push rule');
  // A green or in-progress run is neither.
  assert.deepEqual(splitRed([run({ conclusion: 'success' }), run({ status: 'in_progress', conclusion: null })]), { gate: [], signal: [] });
});

test('a leaked secret goes to the operator, never to a worker', () => {
  const P = project();
  P.security.secretScanning = { posture: 'enabled', alerts: [{ number: 1, type: 'Google API Key' }], bySeverity: { secret: 1 } };
  const A = planActions(P);
  assert.equal(A.find((a) => a.kind === 'secret-scanning')?.class, 'operator');
});
