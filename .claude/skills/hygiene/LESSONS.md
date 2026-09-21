# Lessons - hygiene

Append-only reflection lane. One entry per run that taught something, newest last.
Format: `## <version used> - <YYYY-MM-DD> - <scope>` followed by `- ` bullets.
A lesson that changes classification belongs in `scripts/hygiene-scan.mjs` as code,
with the lesson here saying why.

## 1.0.0 - 2026-09-15 - design session, before the first run

- **The index mtime is not activity.** The Personas app polls its worktrees with a plain
  `git status`, which rewrites the index: three clean app worktrees with a nine-day-old
  HEAD read "active 6 min ago" and would have been reported live forever. Liveness now
  reads the reflog, dirty-file mtimes and HEAD commit time; the index counts only when
  the tree is dirty.
- **The first survey found the fleet's real shape.** kp 73 local branches / 38 worktrees,
  personas-web 51 / 37, ascent 21 / 19 - nearly all created by the Personas app's
  autopilot, several committed to minutes earlier. A hygiene design that treats
  "merged" as "deletable" without owner and liveness checks would have removed live app
  state on day one.
- **Four of thirteen checkouts had no `origin/HEAD`**, so `origin/HEAD` cannot be the
  source of the default branch. The instrument asks GitHub (`defaultBranchRef`) and sets
  the symbolic ref as a mechanical action.
- **Security posture varies per repo.** Dependabot alerts were disabled on the probed
  repos, code scanning existed only on kp, secret scanning answered everywhere. The plan
  reports posture as an operator row rather than pretending an empty queue is clean.

## 1.0.0 - 2026-09-15 - first live run, mechanical phase (96 done, 1 skipped)

- **"0 commits ahead" is also what a branch looks like one minute after it is created.**
  The personas-web primary sat on a fresh `chore/remove-react-virtuoso` with 10
  uncommitted changes; its remote twin classified `merged` and the plan deleted it. The
  repo's i18n pre-push hook rejected the delete - luck, not design. A remote branch whose
  name is checked out in any worktree is now never a delete candidate, in the planner
  and again at apply time. Ancestry says where content is, never whether work is done.
- **Pre-push hooks fire on branch deletions too.** A `git push --delete` runs the hook with
  the delete ref; a hook that gates every push (not only default-branch pushes) can
  reject a legitimate cleanup. SKIP is the right response; bypassing is not.
- **Every fleet repo pins "commit, never push - the owner pushes after reading the log".**
  11 of 13 primaries held unpushed default-branch commits (pof 76). The first design
  shipped them; the operator chose report-only. Hygiene authors merges, deletes and fixes
  and may push those; it never ships commits it did not write.
- **Hand-extracting a worker block through shell quoting dropped a whole section silently**
  (kp's quirks came out empty). Prompt assembly moved into `--brief <slug>`.
- **Compare branches to the local default branch too, not only origin's.** pof's worker
  found `direction/vision-chokepoint-d1` (70 commits, classified `unpushed`) was a literal
  ancestor of local master, which sits 76 commits ahead of origin. A worker spent judgment
  on what `merge-base --is-ancestor` answers: new class `on-local-default`, mechanical.
- **Worker supersession calls drift toward keyword evidence.** Two pof branches (31 and 48
  commits, no patch equivalence) were deleted as "re-implemented differently" on topic
  searches. The worker did cite superseding commits and the tips are archived, but the
  brief now requires named per-area evidence or the branch stays.
- **A red run on the default branch is not always a red gate.** politicas' `sentinel.yml`
  is `workflow_dispatch`-only, red by design until its store is wired, and was dispatched
  as `default-branch-red`; the worker correctly declined to "fix" it. systedo-case's reds
  were all scheduled jobs. Only `push`-event runs are the gate now; the rest is an
  operator row (`non-gate-workflow-red`).
- **A worker's notification is not necessarily its report.** pumper's worker ended a turn
  with "Waiting for the monitor notification" while its own Monitor watched CI. Phase 4
  treats anything that is not the fenced JSON block as still running, never as done.
- **A prose quirk lost to a playbook.** systedo-case's quirks said "settings deny git push;
  ship only through gh pr merge", its plan still carried `default-branch-red` (a push
  action), and the worker resolved the conflict toward the playbook: it pushed
  `hygiene/report-config-local-db` and opened PR #49 - a schema migration (v35), +166/-40,
  in a repo where merging deploys production. The deny does not bind a worker whose cwd
  is the registry, so the plan must: the scanner now reads each repo's
  `.claude/settings*.json` deny list, and a push-denied repo keeps only server-side merges
  with the worker. The brief now says quirks beat playbooks. The director stopped the
  merge; the PR is an operator decision.
- **A stop message is queued, not delivered; a draft is a lock.** The systedo-case worker
  was idle on a Monitor watching #49's checks when the director messaged it not to merge.
  Delivery waits for the worker's next tool round, which could have been the merge. The
  director converted #49 to a draft (`gh pr ready 49 --undo`), which `gh pr merge` refuses,
  and left the reversal to the operator. Stop the action server-side, then tell the agent.
- **Remote deletes go through the API.** `git push --delete` from a primary checkout runs
  the full pre-push hook (personas: typecheck, census, i18n, evals) for a ref deletion.
  `--apply` and the brief now use `gh api -X DELETE .../git/refs/heads/<name>`.
- **The wrong package manager rewrites the lockfile.** personas' worker ran `npm ci` in a
  pnpm repo and `pnpm-lock.yaml` changed underneath it; it caught the churn before staging
  (verified: no lock or package file in its four pushed commits). The brief now maps
  lockfile to installer.
- **Same relative path, wrong tree.** systedo-case's worker had the primary's and its
  worktree's `src/lib/db.ts` both in context and edited the primary's; it caught the stray
  change with `git diff --stat` and reverted it. The director's check compared only the
  dirty COUNT, which an edit-and-revert of a different file would pass. The plan now keeps
  the primary's sorted dirty path set and Phase 4 compares sets; the brief requires an
  absolute-path check before every write.
- **Record what actually gates a merge.** systedo-case requires only "Typecheck, lint &
  build" and "E2E smoke"; its secret scan and weekly drills are red by design or by
  neglect and block nothing. The plan now carries `requiredChecks` from branch protection
  so workers and the operator list can tell a gate from a signal. And fixing the real
  red revealed a second, masked one: E2E smoke had never run against a passing build.
- **A deny-list matcher must tell a blanket deny from a variant deny.** The first
  push-denied check matched `git push` anywhere in a rule, so the fleet-wide force-push
  denies (`Bash(git push*--force*)`, `Bash(git push* -f *)`) made goat - and by the same
  rule every repo - read as push-denied, which would have turned every worker action into
  an operator row. Caught by a live probe before any run used it. `denyBlocksPush()` now
  accepts only `git push` followed by nothing but a wildcard, pinned by the real shapes.
- **A rule's text is not its meaning; its section is.** Grepping fleet settings for
  `git push` returned ascent's `Bash(git push *)` and the director read it as a deny and
  messaged ascent's worker to stop pushing - it was in `allow`. A correction followed
  minutes later, but the worker lost time on a false constraint. Parse settings JSON and
  read `permissions.deny` by key (as the scanner does); never infer a rule's effect from a
  grep line. Also: the Grep tool skips gitignored files, so it cannot see `.claude/` in a
  repo that ignores it (goat) - another reason to parse the files directly.
- **Attribute scratch state by its remote, not its name.** `C:/t/hyg-pr14` broke the
  `hyg-<slug>-<topic>` convention; the director guessed it was ascent's (ascent had a
  PR #14 in play) and said so in a message. `git remote get-url` showed tracklight, whose
  worker had also created a local branch literally named `hyg-pr14` - a helper branch the
  brief never told workers to clean up, which tomorrow's scan would triage as unexplained
  work. The brief now requires the slug in every worktree and `hyg/<slug>/<topic>` helper
  branches, deleted before the report.
- **A branch another tool has checked out is shared, even when nobody is in it.**
  personas-web's worker rebased and force-pushed PRs #10, #9 and #7, whose heads are
  checked out in Personas-app worktrees; the merges landed green, but the app's local
  copies now diverge from the remote. The brief allowed a rebase "if not shared" and the
  plan never said these were. PR actions now carry `sharedHead`/`headCheckedOutBy`, and
  the brief says merge, never rebase, for a shared head.
- **Merge a stacked base last-deleted, not first.** `gh pr merge --delete-branch` on #12
  auto-closed #13 stacked on it; GitHub will not reopen a PR whose base is gone, so the
  worker had to recreate it as #14. The stacked playbook now retargets the child before
  deleting the base.
- **Some PR branches never triggered Actions.** Four personas-web PRs showed only a Vercel
  check: their pushes came through a path that fired no workflow. A PR whose rollup has
  no Actions check is not "green" - it is unmeasured.
- **The rate limit that bites is the secondary one.** pumper, personas, personas-web and
  systedo-case workers all hit HTTP 403 on `gh` calls mid-run while `gh api rate_limit`
  showed the primary quota untouched: GitHub's abuse-detection limit on bursts of
  mutating and polling calls from one account. Thirteen workers at once is the burst.
  Phase 3 now caps concurrency at six, largest plans first.
- **A stale fork point makes small PRs look unmergeable.** pumper #38 and #39 carry tiny
  changes on a merge base ~225 commits behind master; merging master in conflicts across a
  dozen core files. The right repair is recreating the change on current master, which is
  a worker-sized job the brief should name explicitly next time rather than skip.
- **A quirk broader than its reason gets reinterpreted by the worker.** fleet-quirks said
  `autopilot/*` local branches are never removed; the plan, correctly, listed four
  worktree-less autopilot branches for triage. kp's worker read the quirk narrowly, deleted
  them (all one SHA, an ancestor of local main) and flagged the reading. The worker was
  right and the quirk was wrong: what the app owns is its worktrees and the branches
  checked out in them. Write a quirk as the reason, not a pattern.
- **Queue-wide identical failures mean fix main, not the PRs.** kp's 23 queued PRs failed
  the same three checks regardless of diff. The worker checked a clean worktree of
  origin/main first, fixed two of four root causes on main, and merged none - the correct
  outcome, since the remaining reds are product calls. A playbook that repairs PRs one by
  one would have spent the whole time box on doomed attempts; the brief should say it.
- **Worker reports are not always valid JSON.** kp's report carried a JavaScript
  `.slice(0,8)` expression inside a SHA field. The director reads reports by eye today; a
  parser-based Phase 4 needs a tolerant read or a re-ask, never a silent skip.
- **The flake register may live in session notes.** pumper's red master after #33 was a
  single Windows timing test that pumper's own `.perfect` sessions had flagged as
  load-flaky three times in August. Before treating a post-merge red as an outage, grep the
  repo for the failing test name - including its session notes.
- **Thirteen workers also spend the model session limit, not just GitHub's.** At ~80
  minutes three still-running workers (tracklight, ascent, gravitone) died together on an
  HTTP 429 session limit, each mid-action ("Let's ship it", "now run the verify gate",
  waiting on tests). What recovered them: `SendMessage` to each agent id after the reset
  (it resumes from the transcript, so the worker remembers what it pushed), with orders to
  re-read live state before acting, finish only the in-flight item, start nothing new, and
  clean up. The director snapshotted each repo first (worktrees, PRs, default-branch CI)
  to check the resumed reports against. The concurrency cap of six is the prevention; a
  run log of per-worker agent ids is what makes the resume possible at all.
- **A push is not a commit.** tracklight's report attributed its Postgres and Firestore
  fixes to push `7fa11f1` - which is a 2-line TypeScript type fix. The store fixes were
  three earlier commits in the same push; the report named only the tip. Verification
  found them by listing `<scan-time default sha>..origin/<default>`, which is the check to
  run for every project anyway: it shows everything that reached the default branch,
  including commits a report forgot. `pushes[].commits` now lists every SHA.
- **Queue-wide blockage appeared in three repos, not one.** tracklight's 11 Dependabot PRs,
  kp's 23, and systedo-case's 6 were all blocked by their default branch's own reds. The
  shared-cause rule in the brief is the most valuable single instruction this run produced.
- **The report and the planner disagreed about what "red" means.** The after-scan table
  showed gravitone RED - a parked perf-ledger workflow - minutes after its tip run was
  verified green, because the table still used "any red run" while the planner used
  "push-triggered red". And push-triggered was itself too coarse: tracklight's tip was red
  only on gitleaks and cargo-deny advisories, neither a required check. `splitRed()` now
  decides gate vs signal once (push event AND a failing job that branch protection
  requires, falling back to push-only when protection is unknown), and both the planner
  and the table call it.
- **A run-board claim expires under a long worker phase.** The run claimed `hyg-2026-09-15`
  in Phase 0; by the end of Phase 4, hours later, `run-board list` showed no live runs -
  the claim had gone stale without heartbeats and was collected. A second `/hygiene` in
  that window would have read the board as clear. Beat the claim at each phase boundary
  and after each worker report (`node scripts/run-board.mjs beat --run <id> --phase <p>`).
- **An error string is not a posture.** "Code scanning is not enabled" fell through to
  `error` because the matcher only knew "disabled"; read the message before mapping it.

## 1.0.1 - 2026-09-19 - second live run (13 projects, 90 mechanical, 11 workers)

- **A triage count against origin hides the owner's unread commits.** pof `backlog/c26`
  read "82 not on master" with 2 of its own; the other 80 were the primary's unpushed
  commits, and the brief's revive path would have pushed them. Twelve rows carried this.
  The scan now records `ridesUnpushed` and says so in the row; the brief forbids pushing
  or PR'ing such a branch. Every worker that met one honoured it.
- **The worst damage of the run came from the fleet's own tests, through the gate.** A
  pre-push hook exports `GIT_DIR`; `git -C <scratch>` does not override it. Pushed from a
  worktree (absolute `GIT_DIR`), a test fixture's scratch-repo git acted on the REAL
  repository. tracklight: `core.bare = true` on the primary, an empty "base" commit
  (author `t <t@t>`) pushed to origin/main as 08c177d, a stray `lt-fix/test` checkout.
  ascent: `core.worktree` set to a deleted path, `.git/info/exclude` overwritten with
  fixture rules, and - since 2026-09-03, long before this run - the fixture identity in
  `.git/config`, so 471 master commits are authored "Ascent Loop" (more as "Deps Test",
  "Land Test", "Worktree Test"). Both workers reported it as a mystery or a flake. Fixed at
  the root: tracklight 8324768 (scrub in the git helper), ascent PR #22 (scrub in
  vitest.config.js), each with a decoy-`GIT_DIR` negative control that reproduced the
  pollution. A first grep found fixture-git test files in nine more repos; unexamined.
- **Primary verification must read config, not just branch and dirty set.** Phase 4 step 3
  compared branch and dirty paths; ascent's dirty set then differed only because the
  worker's repair unset the polluted excludes file. `git config --local --list` against the
  scan-time snapshot would have caught identity, bare, worktree and excludesFile drift -
  the scan should record it.
- **Workers still invent SHA tails.** kp reported PR #67's head as `69646d8b1c8c1e9e8a7a...`
  (real: `69646d8b1e84...`). Verify reads every SHA back from git; the quirks file now says
  so.
- **Six at a time held.** No secondary rate limit and no session-limit deaths; the long
  poles were kp (68 min) and ascent (3 h, six sequential master landings each waiting on CI).

## 1.0.2 - 2026-09-21 - third live run (13 projects, 0 mechanical, 9 workers)

- **`gh run list --branch <default>` serves a stale page, intermittently, and it reads as a
  clean verdict.** Three times in one run, across two repos, the listing came back without
  any of the tip's runs on it: ascent's newest `CI` run came back as one from three weeks
  earlier, then on a re-scan as a *different* three-week-old run, while master had been red
  on its tip since 2026-09-19; personas later drew one from two weeks earlier. The same
  query with a different `--limit` disagreed with itself minute to minute, so this is not a
  paging bug to sort around. Both of the day's scans therefore reported ascent's CI health
  off a months-old run, and the before/after table showed ascent "turning RED" during a run
  that never touched it. Fixed in the scan: query `gh run list --commit <defaultSha>` too -
  that one is deterministic, so it doubles as the freshness check. A branch page carrying
  none of the tip's runs is stale: retry once, then record a `problems` row instead of
  quietly reporting old history as the branch's health.
- **Only a run that reached a verdict is a verdict, and "completed" is not that test.**
  Tightening the above twice went wrong in the same shape. Preferring the tip's run let an
  *in-flight* run erase personas' known red the moment hygiene pushed to it. Preferring the
  newest *completed* run then let a **cancelled** run do the same: personas' second push
  cancelled the run before it, and that cancellation - completed, not in `RED_CONCLUSIONS` -
  read a branch failing since the previous day as green. The selector now takes the newest
  run whose conclusion is `success` or red; in flight, `cancelled` and `skipped` all mean
  "no answer yet" and fall through to history.
- **Both regressions were caught only because the control set included a known RED.** Each
  wrong version looked *better* than the truth - fewer red rows, a calmer table. A control
  set of green projects would have passed all three times. Re-verify an instrument change
  against a project you already know is red and one you know is green, every time.
- **A no-op mechanical phase is a real answer.** Zero mechanical actions fleet-wide, the
  first time; the two prior runs' 96 and 90 rows had already cleared that surface. Spot-check
  something else when there is no mechanical row to spot-check.
- **Most `triage-branch` rows this run were not debris but deliberate.** Workers left almost
  all of them: skillbench/conform model-comparison arms (athena, kp, tracklight), a pof
  experiment arm whose own commit message says "never for the active branch as-is", a
  personas branch self-described "Preserved here unreviewed". The class is a decision queue
  for the operator far more than a work queue for a worker. tracklight showed the exception
  worth keeping it for: per-commit `git cherry` found 7 of 9 commits already on main and two
  genuinely live bug fixes stranded, which it cherry-picked and shipped as PR #31.
- **A shared red base makes a whole project's PR queue unworkable, and the worker should say
  so once.** kp's main fails two required checks; all 29 open PRs fail identically. The
  worker diagnosed the shared cause, refused to "fix" it by raising the perf ceilings, and
  reported once instead of writing 29 near-identical skip rows. Same shape on personas.
- **The registry gate can be red from a sibling session's work.** `gate.mjs --all` failed on
  stale knowledge indexes in bundles this run never touched, while another session had
  `check-bundles.mjs` and `build-registry-map.mjs` open. Regenerating them would have swept
  their work into the run's commit. Report the failure, commit only your own paths.
