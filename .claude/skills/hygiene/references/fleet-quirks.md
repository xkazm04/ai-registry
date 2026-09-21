# Fleet quirks for hygiene workers

Per-repo facts that have cost a run time before. The director pastes the matching
section into each worker's project block. Add to it from worker `lessons`; delete a line
when a run proves it stale. Slugs match `projects.json`.

## All projects

- Fleet delivery standard: an aggregate `verify` script equal to CI's blocking set, a
  pre-push hook that fires on default-branch pushes, `gh run watch --exit-status` after
  every default-branch push. A red default branch is an outage.
- Eight projects run the `native-copy` English copy gate at pre-push (US English, em dash
  banned in user-facing copy, new errors only). A copy change that trips it is fixed,
  not bypassed.
- Every Wolf checkout carries a `permissions.deny` block for `--no-verify`, force-push and
  the repo's own skip variable. Do not try to route around it.
- Python is `py` on this machine, not `python`.
- Worktrees under `AppData/Roaming/com.personas.desktop/` belong to the Personas desktop
  app, and so does any branch checked out in one: hygiene never removes those worktrees or
  those branches, and never rebases or force-pushes a PR whose head is one (merge instead).
  Their PRs may be shipped. An `autopilot/*` branch with NO worktree is ordinary: the app
  finalized its run and left the branch behind on purpose (`LeaveAsBranch`), so it is
  triaged like any other branch. (The first version of this line said all autopilot
  local branches were untouchable; kp's worker had to reinterpret it on 2026-09-15.)
- **A pre-push hook exports `GIT_DIR`, and `git -C <dir>` does not override it.** A test
  suite that spawns git on a scratch repo, run by the hook from a worktree, acts on the
  REAL repository: tracklight 2026-09-19 got `core.bare = true` on the primary, a foreign
  empty "base" commit on origin/main, and a checked-out `lt-fix/test`, all from its own
  test. If a checkout suddenly reads as bare, or a commit you did not make appears on the
  branch you are pushing, suspect this first; the fix is scrubbing `GIT_DIR`,
  `GIT_WORK_TREE`, `GIT_INDEX_FILE` and friends from the spawned command. A test that
  "fails under the hook, passes by hand" is the same bug until proven otherwise.
- Every SHA in the report is copied from git output, never typed: kp 2026-09-19 reported a
  PR head whose second half was invented.

## kp

- Self-hosted Docker/Helm, not Vercel.
- The commit-msg hook accepts only conventional types (`fix`, `feat`, `chore`, `docs`,
  `test`, `refactor`, `perf`, `ci`, `build`). A custom type is rejected.
- `test:unit` strips types and does not typecheck: run `npx tsc --noEmit` after touching
  a shared type.
- Code scanning is enabled and holds 100+ open alerts - cap per run applies.
- Many parallel `autopilot/accepted-idea-delivery-to-the-main-branch-N` PRs: they often
  touch neighbouring files; after each merge re-check the next PR's mergeability.

## politicas

- lefthook blocks a commit touching a doc-coupled path without its doc or a
  `Doc-sync(...)` trailer. Update the doc or add the trailer with a real reason.
- `typecheck` has pre-existing failures: grep the output for your own files.
- `origin/HEAD` was unset on 2026-09-15.

## personas

- The primary checkout is shared by many live sessions; its commits use an
  isolated-index ritual. Workers never commit there anyway (worktree only).
- A fresh worktree has no `node_modules` and lefthook's pre-push typecheck needs it:
  junction it from the primary, and `rmdir` the junction before removing the worktree.
- CodeQL runs on pull_request and a Monday cron only: an alert fixed mid-week stays open
  until the next scheduled scan. `git log -S` the flagged pattern before "fixing" it.

## tracklight

- Remote repo is `xkazm04/lighttrack`. Crates are named `lighttrack-*`, not `tracklight-*`.
- `guidance_guard` fails at HEAD for reasons unrelated to most changes - verify on a
  clean `origin/main` worktree before attributing it.
- `cargo deny (advisories)` is a permanent, documented non-blocking red (h2 RUSTSEC).
- The responder git-env bug above was fixed on main in `8324768` (2026-09-19); if
  `a_failed_commit_reports_false_and_leaves_the_tree_dirty` fails under the hook again,
  check for a new unscrubbed git spawn before calling it a flake.

## systedo-case

- Vercel deploys every push to `master`: merging is a production deploy.
- The checkout's settings deny `git push*` on purpose. Ship only through
  `gh pr merge` (server-side). Unpushed local commits go to the operator.
- Production env holds only `GEMINI_API_KEY`; e2e needs env that CI may lack.
- `E2E smoke` only runs when `Typecheck, lint & build` passes, so a red typecheck hides
  any e2e regression behind it (2026-09-19: three `/kampane` Playwright failures surfaced
  only on draft PR #49, the one PR with a green typecheck).

## ascent

- Vercel deploys every push to `master`: merging is a production deploy.
- Node 24.x on Vercel; keep the repo on 24.
- `smoke.yml` has historically never fired - its absence from a check rollup is not a failure.

## gravitone

- Deploys nowhere from CI, but `deploy/` holds live Helm/CloudFormation config. Treat the
  k8s probes as production. Chart policy gate: `node --test scripts/check-chart.test.mjs`.
- CI's `service` job installs fastapi/starlette/pydantic **unpinned**: a routine upstream
  release can break an introspection test while every route still works (fastapi 0.141.1,
  2026-09-15). Reproduce with the CI-resolved versions in a venv before calling it a flake.
- `perf-ledger` was parked to `perf-ledger.yml.example` on 2026-08-05; an old red
  perf-ledger run is a dead workflow, not a gate.
- The native-copy `.githooks/pre-push` exists only in the primary's unpushed commits (as of
  2026-09-15), so it does not fire on pushes from an `origin/main` worktree yet.

## goat

- `.claude/` is gitignored; its deny block is machine-local.

## pumper

- Rust workspace. Dependabot PRs (`deps: bump ...`) arrive in batches; a major bump
  (e.g. `sqlx` 0.8 -> 0.9) is usually a migration, not a bump.
- `e2e::fanout_offslot::a_slow_index_no_longer_holds_a_scrape_permit` is a known load-flaky
  wall-clock-ratio test on Windows runners (flagged in `.perfect` sessions 2026-08-04 and
  2026-08-13; failed once after the #33 merge on 2026-09-15, green on one rerun). A red
  Windows test job failing only this test gets exactly one `gh run rerun --failed`.
- `dependabot.yml` ignores standalone `ego-tree` bumps: a `scraper` major bump needs the
  matching `ego-tree` bump by hand in the same PR, or CI fails with mismatched `NodeRef` types.
- Windows test jobs take 11-25 minutes; a PR merge's full verification is slow.
