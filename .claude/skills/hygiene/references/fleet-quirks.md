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
- **Do NOT junction `node_modules` into a worktree for `test:unit`** - run a real `npm ci`
  (~4 min). `scripts/test-alias-loader.mjs` detects a linked checkout (a Windows junction
  counts) and swaps `next/server` for a shim whose `NextResponse` has no constructor, so any
  route using `new NextResponse(...)` returns 500 and reads as a real BROKEN failure, twice.
  Measured 2026-09-21: three false interview-recording failures, green after `npm ci`.
- The Node quality job runs `test:perf` BEFORE `test:unit`, so a red perf budget hides every
  unit failure behind it. Greening the budget can surface weeks of unit reds at once.
- The perf budget counts a dynamic `import()`: writing `await import(...)` does not take a
  module off a route's graph. Never raise a ceiling to pass your own merge.
- Code scanning is enabled and holds 100+ open alerts - cap per run applies.
- Many parallel `autopilot/accepted-idea-delivery-to-the-main-branch-N` PRs: they often
  touch neighbouring files; after each merge re-check the next PR's mergeability.

## politicas

- lefthook blocks a commit touching a doc-coupled path without its doc or a
  `Doc-sync(...)` trailer. Update the doc or add the trailer with a real reason.
- `typecheck` and the full vitest suite were both GREEN at `origin/master` on 2026-09-21
  (`tsc --noEmit` exit 0, 4101 tests). An older note here said typecheck had pre-existing
  failures; that is disproved - a red typecheck is now yours until shown otherwise.
- `sentinel.yml` is DISABLED at the repository level since 2026-09-21 (red by design until
  `SENTINEL_STORE_RUN_ID` points at a `db:backup` store snapshot). The re-enable path is in
  the workflow's header comment.
- `origin/HEAD` was unset on 2026-09-15.

## personas

- The primary checkout is shared by many live sessions; its commits use an
  isolated-index ritual. Workers never commit there anyway (worktree only).
- A fresh worktree has no `node_modules` and lefthook's pre-push typecheck needs it:
  junction it from the primary FIRST, and `rmdir` the junction before removing the worktree.
  Order matters: without it the hook shim runs a full `pnpm install` and leaves a REAL
  `node_modules` (not a junction) plus a rewritten `pnpm-lock.yaml` - which then defeats a
  `Test-Path node_modules` guard on the junction step. Before any recursive delete, check
  `fsutil reparsepoint query node_modules`: a junction must be `rmdir`'d, a real directory
  is safe to delete. `git checkout -- pnpm-lock.yaml` if it drifted.
- master CI is red for documented, pre-existing reasons (rust-deny: RUSTSEC-2023-0071 rsa,
  no fixed release; rust-no-features: glib-2.0 missing on the runner; rust-tests windows:
  `app_lib` test binary fails to start, STATUS_ENTRYPOINT_NOT_FOUND). `rust-tests (linux)`
  went GREEN on 2026-09-21 - do not regress it. Judge a push as "no NEW failure", job by
  job against the tip you actually merged onto, never against an older remembered baseline.
- `frontend-checks` cannot finish inside its 30-minute timeout and is cancelled mid
  "Run frontend tests" - the frontend test lane is effectively unmeasured on master.
- CodeQL runs on pull_request and a Monday cron only: an alert fixed mid-week stays open
  until the next scheduled scan. `git log -S` the flagged pattern before "fixing" it.

## tracklight

- Remote repo is `xkazm04/lighttrack`. Crates are named `lighttrack-*`, not `tracklight-*`.
- `guidance_guard` PASSED 4/4 at `origin/main` on 2026-09-21 (`9a53828`, `68566b8`). An
  older note here said it fails at HEAD; that is disproved - a red one is now yours until a
  clean `origin/main` worktree shows otherwise.
- A direct push to `main` prints `Bypassed rule violations ... 10 of 10 required status
  checks are expected`: the owner's admin permission bypasses the ruleset. No flag is
  involved and CI still runs after - but verify the pushed SHA's run yourself.
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
- `pumper-core::host_memory_honesty::prune_drops_empty_stale_rows_not_learned_state` is a
  second wall-clock flake on Windows runners (1 s TTL; its own comment claims a slow machine
  cannot cross it - CI did on 2026-09-21). One rerun, never a quarantine: `.flake/register.json`
  requires a human author for a quarantine row.
- `deny.toml:59`'s ignore for RUSTSEC-2025-0057 (fxhash via scraper->selectors) matches
  nothing since the scraper 0.27 bump - an `advisory-not-detected` warning, safe to delete.

## personas-web

- The primary checkout has NO `node_modules`, so junctioning it into a worktree yields an
  EMPTY junction ("tsc is not recognized"). Run a real `npm ci` in the worktree.
- The pre-push hook runs only i18n-coverage / i18n-encoding / guide-content / copy-check.
  The real gate is `.github/workflows/ci.yml` (typecheck, lint, test:unit, guide-coverage,
  build, check:bundle): a clean push is not a clean build here.
- `npm run lint` sits at EXACTLY its `--max-warnings 13` ceiling. A merge must be
  warning-neutral; one new warning turns master red. Never raise the ceiling.
- The copy gate SKIPS in any worktree ("native-copy checker not installed") because the
  native-copy link is gitignored. For a real verdict run
  `node <ai-registry>/skills/native-copy/scripts/copy-check.mjs --root <worktree>`.
- The native-copy baseline fingerprints the WHOLE string: a merge that edits any part of a
  string already carrying an em dash reports that dash as new. Re-fingerprint only that
  entry; never raise the baseline.
- A guide topic edited on both sides of a merge needs every locale `_meta.json`
  `translatedFromHash` moved to the merged English hash - after checking each locale was
  current on both sides.
- `test-results/.last-run.json` is TRACKED: any local Playwright run dirties it. Restore it
  before committing.
- The primary has sat on `chore/remove-react-virtuoso` for weeks; the name is stale (the
  virtuoso removal shipped 2026-09-07 in `8f2e544`) and the branch now carries unrelated
  i18n and bookkeeping work.

## pof

- **No CI workflows at all** (`.github/workflows` does not exist). A push has nothing to be
  confirmed against: the commit read and a local `npm run validate` are the whole safety
  net. Say so in the report.
- `visual-gen-mesh-split-route.test.ts` reads `generated/meshes/props__crate.glb`, a 3.5 MB
  GITIGNORED untracked artifact: it passes only on the owner's machine and fails in any clean
  worktree. Not a regression - an environment dependency.
- `POF_UPDATE_GOLDEN=1` rewrites ~47 golden files but typically only a few carry content; the
  rest are CRLF-only. Stage the real ones and `git checkout -- .` the line-ending churn.
- The layout-lab component suite is parallel-load flaky (a different test fails each full
  run, all pass in isolation). Re-run named files in isolation before attributing them.
- `gdd-compliance-evidence-age` expects `aging` and gets `stale` on origin/master - likely a
  wall-clock date bomb, pre-existing.
