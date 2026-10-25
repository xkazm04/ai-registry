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

## 1.0.2-1.0.4 - 2026-09-21 - third live run (13 projects, 0 mechanical, 9 workers)

- **`gh run list --branch <default>` serves a stale page, intermittently, and it reads as a
  clean verdict.** Three times in one run, across two repos, the listing came back without
  any of the tip's runs on it: ascent's newest `CI` run came back as one from three weeks
  earlier, then on a re-scan as a *different* three-week-old run, while master had been red
  on its tip since 2026-09-19; personas later drew one from two weeks earlier. The same
  query with a different `--limit` disagreed with itself minute to minute, so this is not a
  paging bug to sort around. Both of the day's scans therefore reported ascent's CI health
  off a months-old run, and the before/after table showed ascent "turning RED" during a run
  that never touched it.
- **`--commit <sha>` is not the cross-check either - it lies in the opposite direction.** The
  first fix used `gh run list --commit <defaultSha>` as a deterministic freshness probe and
  said so in this file. It is not deterministic. Hours later the same day, `--commit befe6d59`
  returned **zero rows** for ai-registry, twice, minutes apart, while an unfiltered
  `gh run list` showed **four completed successful runs on that exact sha**. `--branch`
  manufactures a stale presence; `--commit` manufactures an ABSENCE, and an empty result is
  indistinguishable from "CI never ran". A cross-check drawn from the same server-side
  filtering layer inherits that layer's bias - [[assertion-inherits-its-own-bias]] landing on
  the fix written to honour it. **What works:** take an unfiltered `gh run list --limit N` and
  match `headSha` yourself on the rows you were handed. Filtering rows already in hand can only
  miss the tip when the window is too small, which is the safe direction. Those tip runs then
  double as the branch page's freshness check: a page carrying none of them is stale, so retry
  once and then record a `problems` row rather than passing old history off as health.
- **The broken version failed safe, which is why a control run did not catch it.** With
  `--commit` returning empty, `tipIds` was empty, so the staleness flag never fired and
  selection quietly fell back to the sorted branch listing: no wrong answer, just the
  protection absent exactly where it was needed. A fix that degrades to "no worse than before"
  passes every control you own. Assert that the mechanism *fired*, not only that the output
  looked right.
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

## 1.0.5-1.0.6 - 2026-09-26 - fifth live run (13 projects, 3 mechanical, 9 workers, ascent held)

- **The 2026-09-24 run left no report at all.** Ten workers dispatched, `dispatch.jsonl`
  written, then nothing: no `report.md`, no verify, no LESSONS entry. Its ascent worker died
  mid-PR-#23 with an unpushed local merge in `C:/t/hyg-ascent-pr23`, and two days later a
  `SendMessage` to its agent id from this session answered "No transcript found": the resume
  path in Phase 3 only works inside the session that spawned the worker. Workers' reports now
  go to `<plan dir>/reports/` as they arrive, and a project with a dead predecessor's worktrees
  gets no worker (1.0.6). The ascent leftovers turned out to be EOL-only diffs on prisma
  migrations plus the unpushed merge, which is still the operator's call.
- **A newer scheduled run of the same workflow hid a red push run.** `defaultCi` kept one run
  per workflow NAME, preferring the tip's newest verdict. personas-web's `CI` failed its bundle
  gate on push (2026-09-25 08:49), the 03:29 nightly failed the same way on the same tip and
  won by being newer, and `splitRed` then read the only surviving run as a schedule signal:
  table "green (signals red)", no worker action for a red gate. The worker noticed and fixed
  master anyway. `pickDefaultCi` now keys on workflow and trigger (push vs other), so the push
  verdict decides the gate and a scheduled red stays a signal beside it. Controls, before and
  after: systedo-case RED, ascent signal-only, gravitone and goat green, all unchanged; the fix
  also surfaced a second masked push red (systedo-case `Supply chain`, non-required, a signal).
  Same shape as 2026-09-21: every wrong version reads calmer than the truth.
- **A worker's repair can uncover a lost history, not just a stuck PR.** pumper's #38 and #39
  both fork from `4a5905a` (2026-09-01) and carry ~225 commits - the whole N01-N36 moonshot
  wave, ~112k lines, e.g. `clients/cli/` - that are on neither origin/master nor local master.
  The director confirmed it from git (`git branch -a --contains`, files absent on master) before
  reporting it as the top operator item. Two remote branches are the only copy; the worker
  rebuilt #38's one commit on master as #44 instead of rebasing onto the fork. A branch that is
  "only" the head of a closed PR can be the last holder of real work: never mechanical there.
- **`triage-branch` rows recur because nothing remembers a verdict.** pof `backlog/c33` was
  left for the same reason (its own commit says "never for the active branch as-is") on
  2026-09-21 and again today; kp's 18 triage rows were all left, tracklight's 3 too. Each
  costs a worker reading the same commits again. Open: a per-sha "left, because" ledger the
  scan honours until the branch tip moves.
- **A dead ecosystem major reads like 29 separate repair jobs.** ESLint 10 (politicas #28, kp
  #71), TypeScript 7 (politicas #20) and sqlx 0.9 (tracklight #30, pumper #37) were each
  diagnosed from scratch by a different worker. Now a fleet-wide quirk.
- **My own verifier lied on its first run.** It trimmed `git status --porcelain` output as a
  whole, which stripped the first line's leading status space, so `.gitignore` became
  `gitignore` and eight clean primaries read "dirty DIFF". Split porcelain output into lines
  before trimming anything. The two real differences (kp, personas) were sibling sessions'
  live work, judged by path and mtime against what each worker touched.
- **A push nobody reported can be the owner's.** pof's origin/master jumped by its 127
  unpushed commits at 11:39Z, 27 minutes after its worker finished with no changes; blaming the
  worker was the obvious read. The push event time against the worker's
  window settled it.

## 2026-09-30

- **A worker brief must carry the node_modules junction hazard.** The pof worker junctioned
  node_modules into its worktree, and `git worktree remove --force` followed the junction and
  wiped the primary's copy (restored with `npm ci`). The rule is in memory but not in
  `references/worker-brief.md`: say "run `npm ci` in the worktree, never junction".
- **Ascent went undispatched for the second run** because the 2026-09-24 worker's
  `C:/t/hyg-ascent-*` worktrees (1 and 73 uncommitted changes) are still there. The
  dead-worker rule holds, but it means a repo's backlog grows until the owner clears them.
- **The "trim porcelain" bug recurred in the director's own verifier** (first entry lost its
  leading space, `.ai/x` read as `ai/x`). Split lines before trimming, always.
- **A fix that a worker cannot push still gets committed.** personas' CodeQL fix sits on a
  local branch because the pre-push census gate fails on master itself; the census drift is
  now the blocker for every personas worktree push.
- **Every dependabot bump in politicas fails Doc-sync**, not its own change; an empty commit
  with four `Doc-sync(...)` trailers clears it. Merge commits need the trailers too.
- **Scanning with `| head` kills the scan** (SIGPIPE); redirect to a file and read the file.

## 2026-10-01

- **Debris pass added; its first delete destroyed a registered worktree.** `git ls-files --others`
  reports a nested checkout as one untracked directory, so ascent's `.bench/ship-main` (a
  detached worktree at a release commit, idle 9 days) read as 44 MB of cache. I confirmed it
  was a worktree in the SAME shell command that deleted it, so the check could not stop the
  delete. No commits lost (tip on master, entry pruned); any uncommitted content in it is gone.
  Rules now: a directory holding `.git` is never debris (scan and apply re-check), and a
  check and the irreversible act it guards never share one command. Also: a `.bench/.../node_modules`
  junction pointed at ascent's real `node_modules` - unlink with `cmd //c rmdir`, verify the target.
- **A candidate is not mess until someone opens it.** `ai-registry/.personas-web/registry.yaml`
  looked like a stray dot-dir and is a real consumer overlay. Candidates stay operator rows.

## 1.0.7 - 2026-10-04 - policy change, `primary-unpushed`

- **Operator reversed the 2026-09-15 "never ship commits hygiene did not author" rule for
  the clean case.** The fleet runs many unattended sessions across machines; unpushed
  primary-branch commits are routinely their already-committed work, not unread WIP, and
  syncing that is the whole point of a start-of-day sweep. A fast-forward-only push
  (`behind === 0`) on an idle, non-push-denied, non-production-deploy primary is now
  `mechanical` (`push-primary`), applied without a worker. Diverged history, a live
  checkout, a push-denied repo (systedo-case, via its own deny settings), and a
  production-deploy default branch (`ascent:master` - Vercel deploys on push, and there is
  no CI run yet for a commit that was never pushed) still go to the operator as
  `primary-unpushed`, unchanged. Widen `PRODUCTION_DEPLOY_DEFAULT` in `hygiene-scan.mjs`
  only for a repo whose default branch deploys outside its own CI - debris, alerts and
  WIP (points 1/2/4 of the 2026-10-04 request) were left untouched.

## 1.0.7 - 2026-10-07 - full fleet run, 12 workers

- **A session limit killed the gravitone worker AFTER it had pushed to main.** Its first push (d72dc28) and a dirty gates.yml were the only trace; the snapshot (worktree state, `gh run list`) plus `SendMessage` to its agent id resumed it with its own history, and it finished the item. Snapshot against the project's real checkout path from `projects.json`: a guessed path ran `gh pr list` in the wrong repo and read as an empty answer.
- **Red default branch was often several independent faults.** gravitone main had a stale lockfile, a selftest asserting a gitignored corpus and no chromium install; personas had a stale evidence path plus three linux-only test failures with a fourth (clippy dead_code) hidden behind them. Re-read the next step's result after each fix before calling it done.
- **Dependabot PRs red on a shared cause are red on the base, not on themselves.** pumper: three unpatched wasmtime advisories failed all six PRs; fix master, then `gh pr update-branch`. politicas: every package.json bump fails Doc-sync until it carries Doc-sync trailers (operator decision pending: a standing exemption).
- **A push to a protected master from a worker worktree was accepted with "Bypassed rule violations: 6 of 6 required status checks"** (pumper, wasmtime lock bump). Authorized, and CI was green after, but it is the admin-bypass path: worth deciding whether workers may use it.
- **The Bash tool in worker sessions had no git, gh, head or tail on PATH**; every worker fell back to PowerShell. Put "use PowerShell" in the worker brief.
- **Hygiene never reached a verdict on four items a worker could not bound**: kp main red because origin/main lacks 124 unpushed local commits (live primary, so not mechanical), gravitone live-lane spec rewrite, sqlx 0.9 and utoipa 6 migrations. All went to the operator list with the located cause.

## 1.0.7 - 2026-10-08 - full fleet run, 13 workers

- **Ascent loop branches and skillbench arms cost worker runs and produced no actions.** firetv (8), mage-arena-vr (7), garden-vr (5), kp (10 skillbench), tracklight (3 skillbench): every worker read each branch in full and left all of them, because each holds unique, divergent commits and adopting them is a product call. Proposal: the scan should classify `ascent/loop-*`, `ascent/runner` and `skillbench/*` as `operator` (an adopt-or-archive decision), not `worker`. Three of the 13 workers would then not have been dispatched.
- **kp origin/main is red for the reason 2026-10-07 named, now from the other side**: a sibling pushed commits that import files that exist only in the primary's unpushed line (166 ahead). Every PR then fails typecheck and build alike, so #93 and #94 were repaired and could not merge. A red default branch whose missing symbols resolve in `git log main` (local) is a primary-unpushed problem, not a worker fix.
- **gravitone: a UI redesign dropped test ids that only the live lane drives** (race sheet, `cell-<id>-<step>`). The live job stayed red for three days while gates and python were green. The worker restored the attribute and the job went green.
- **A pull_request run freezes its merge ref**: rerunning it, or closing and reopening the PR, reused the stale merge. `gh pr update-branch` makes a fresh merge ref (gravitone #3).
- **A PR head cut from the primary's unpushed line looks like a small PR and is not**: personas #29 has a README title and carries 44 commits and 807 files. kp #95 showed +10k lines for one line, from CRLF churn plus a regenerated registry map. Read `changedFiles` and `git diff --ignore-space-at-eol` before calling a PR superseded or repairable.
- **Director verify instrument**: comparing the primary's dirty set needs plain `git status --porcelain` (not `-uall`, since the plan stores an untracked directory as one row). Do not trim the whole output, because that eats the leading space of the first ` M` line and shifts its path by one character. Two primaries (personas, personas-web) differed because their own live sessions committed during the run. Check `reflog` before blaming a worker.

## 1.1.0 - 2026-10-10 - live run on Fox (11 projects, 88 mechanical, 9 workers, 5 stalled)

- **An API outage stalled five of six concurrent workers at once**, each killed by the 600 s
  stream watchdog mid-item (a tracklight cherry-pick, a kp worktree with an uncommitted fix,
  a grant `npm install`). The Phase 3 recovery worked as written: snapshot `C:/t/hyg*`,
  then `SendMessage` each agent id inside the same session; all five resumed from their
  transcripts and cleaned up. The cost of "finish the in-flight item, start nothing new" is
  real: kp reached none of its six items and grant none of its four triage rows. That is
  the price of not compounding a half-known state; the next run picks them up.
- **`git worktree remove` on Windows half-deletes a worktree with a deep `node_modules`.**
  athena-everywhere: the admin entry and `.git` file went, the directory stayed, the action
  logged SKIP "Filename too long", and the remnant became an untracked `.claude/worktrees/`
  in the primary. `--apply` now passes `-c core.longpaths=true`; the remnant was removed by
  hand via a `\?\` path and its merged branch archived, then deleted.
- **Concurrent `npm ci` into fresh worktrees fails on this box** (kp gave up after 20+ min,
  grant hit repeated ENOTEMPTY until `rd /s /q node_modules` plus `--ignore-scripts`). Six
  workers is the GitHub limit, not the disk's: npm-heavy projects compete for one cache.
- **A fixed first red hides the next one.** grant's main had been red since July on six
  lint errors; fixing them let the unit step run for the first time and expose four tests
  whose stub-certificate fixtures expired on 2026-08-19. Expect a red-fix to take two
  pushes when the first failing step gated everything after it (kp shows the same shape:
  `test:agent` fails before lint-ratchet, perf, unit and build ever run).
- **A master with live pushers cannot confirm a fix per SHA.** personas' CI concurrency
  cancelled the runs on the worker's fix and the two pushes after it; the scan then fell
  back to the last *completed* push verdict (the old failure) and still read RED. That is
  the right conservative answer; verify against the tip's run, not the fix's.
- **The fixture identity leak recurred in ascent.** Repo-local `user.name=Deps Test`
  (`deps-test@ascent.invalid`) predates this run - two 2026-10-07 commits on `readme-boost`
  carry it - so the 2026-09-19 pre-push-fixture pattern is still live there. Only Phase 4
  step 3's config read caught it; a worker that commits without `-c user.name` inherits it.
- **Triage rows still lack two facts a worker needs.** goat's "27 commits not on main" was a
  one-day-old v2 redesign, not debris (no age on the row); pumper's 24 local `moonshot/*`
  rows were all strict ancestors of a remote preservation branch and could have been
  classified as contained mechanically (`merge-base --is-ancestor` against remote heads).

## 1.2.0 - 2026-10-15 - disk lane, designed after a 200 GB day

- **The fleet's biggest mess was never in a checkout.** The operator saw ~200 GB appear in a
  day, with 117 GB left free, while every `git status` looked ordinary. A read-only walk of the drive (17.8 M
  files, 17 min) put 429 GB of creation-or-write since the day before into: 337 scratch-root
  folders from one curator night (a project clone per claim, each with its own install,
  `.next` and cargo `target`; the night removed its registry worktree on landing, never the
  clone), a 62 GB cargo `incremental/` cache in one checkout (135 crate dirs, one per feature set
  ever built, 89 untouched for a day), 36 GB of Claude session temp and ~100,000 test-fixture
  temp dirs (`pumper-server-e2e*` alone 19,147). New lane: `scripts/hygiene-disk.mjs`, its own
  instrument and plan beside `plan.json`, so the per-checkout scanner stays what it is.
- **Most "dirty" scratch clones were install noise.** Of 36 clones that were not plainly clean,
  every kp one differed only by a regenerated `next-env.d.ts`, every systedo one by two untracked
  husky shims, and four by line endings or whitespace (`git diff --ignore-all-space
  --ignore-cr-at-eol` empty). The noise list is code (`NOISE`); real WIP stays an operator row.
- **"Landed" for a clone has to survive another sha.** A curator clone's commit reaches its home
  repository through an apply flow or a cherry-pick, so ancestry misses it. The lane checks each
  local commit's `patch-id --stable` against the home's history; one systedo clone was kept on
  exactly that, its commit found nowhere. The patch-id cache is keyed on the home's ref tips: the
  first version cached per repository and read a commit that landed mid-run as missing.
- **The porcelain-trim bug arrived a third time, in the new instrument, and its first test
  caught it** (` M a.txt` read as `.txt`). The git helper now trims the end only. The one-off
  cleanup that ran before the lane existed carried the same bug and kept six kp clones it
  should have deleted: the wrong direction, but the bug is the same one LESSONS named twice.
- **A recursive delete must never enter a junction.** `scripts/lib/safe-remove.mjs` removes a
  symlink or junction as a link and clears git's read-only bit; its test plants a real junction
  (`mklink /J`) to a sentinel tree, and a mutant that follows links fails it. 238 GB of model
  stores, 102 GB of temp and 110+ GB of scratch clones went through it with 2 errors, both
  files an open app held (EBUSY).
- **Fix the process that wrote it, not only the bytes.** The night's own skill (personas
  `/curator` 1.2.0) now reaps each claim's clones on settle through `hygiene-disk.mjs --reap`,
  and its workers build with `CARGO_INCREMENTAL=0`. The temp-leak rows name the suites to fix.

## 1.2.0 - 2026-10-15 - the first temp-leak chase (operator: fix every leaking suite, commit on main)

- **The disk lane's `temp-leak` rows were the work list, and a name family is only a lead.**
  A per-repo `git grep -F` of each family's literal prefix (with a planted positive) mapped 80
  of 141 families to one repo; most of the rest were assembled from variables (`` `systedo-${name}-${pid}.db` ``)
  and went by stem. Three stems pointed at the wrong repo: `mage-*` was a sibling checkout
  (`mage-arena-tv`), `bp-open-`/`bp-stress-` a one-off stress script no longer on disk, and two
  families (`harvest-tail-`, `council-cmd-gate-`) are in no tracked file anywhere. The worker
  brief's `not_this_repo` field carried those back instead of a guessed fix.
- **Three causes covered nearly every leak.** (1) a helper or module-level `mkdtemp` with no
  cleanup at all (most suites); (2) cleanup that FAILS SILENTLY on Windows because a SQLite
  handle is still open - `rmSync` throws EPERM/EBUSY and a `try {} catch {}` or a Drop impl
  swallows it (kp, the lens-scan store tests, athena's `store.rs`, whose `Drop` deleted the
  file before its connection field dropped); (3) a hook in the wrong scope (politicas: an
  `afterAll` inside the first `describe`, so the second recreated the store and left it).
  Close, then remove; a swallowed removal error is the leak.
- **Production code leaks too.** devsecops' `ledger-append.mjs` made a scratch dir on every
  run and `die()` called `process.exit`, which skips `finally`; pof's image-to-3D dispatcher
  wrote provider input PNGs to temp that mocked tests never consumed.
- **A fix on main does not reach live worktrees on older commits.** 99 `belay-ledger-` dirs
  appeared after devsecops' fix, all from a tiger run and agent worktrees cut before it. The
  leak stops when they merge main; nothing to delete in their trees.
- **Measure, or say you did not.** Every worker recorded the new NAMES one command left before
  and after (counts lie when siblings run the same suite). stat-reel had no `node_modules`, so
  its fix is honest "fixed, not run". Workers sharing one scratch directory overwrote each
  other's snapshot scripts and two reported a false 0 before re-measuring; give each worker
  a private scratch subfolder from the start. The firetv worker found the measurement that
  beats name diffs: run each suite with `TEMP`, `TMP` and `TMPDIR` pointed at a private empty
  folder, so everything that appears there is that run's (56 suites, one leak found that a
  shared-temp diff had buried under a sibling session's concurrent runs). Brief it that way.
- **The director's own codemod inserted its helper inside a template string** (a test that
  generates a child script with `import` lines), and the first verify run caught it as 7 new
  failures. Insert after the top import block only, and run the suite before believing a diff.

## 2026-10-15 - a default-branch-red worker on a 70-minute CI is a three-hour worker

- **The personas worker ran 3 h 18 min on one `default-branch-red` item.**
  - Each CI cycle is about 70 min, with the 3-OS matrix and macOS as the long pole. Each cycle showed only the next failure: Linux clippy dead_code, then a PERSONAS_HOME race, then a flaky p2p loopback test.
  - `gh run rerun --failed` is refused until every job ends, so the flake alone cost a 36-minute wait.
  - Cap a red-default item by CI **cycles** (two), not by minutes, and report the rest. Fixing master red in a repo whose CI no push has finished green in a week is a project, not hygiene.
- **Ten workers polling `gh run view` every 30 s used up the 5,000/h API quota** at 08:03Z. Every worker lost about 10 minutes. Poll at 90-120 s, or have the director watch runs.
- **A brief must not suggest a commit type without reading the repo's commit-lint.** The repair brief said `deps:`. personas allows `feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert`, so commit-lint went red on a pushed master commit that can't be amended (no force push). Use `fix(deps):` or `chore(deps):`.
- **A new RUSTSEC batch reddens every repo that runs cargo-deny at once.** After a push-primary, paypal went red on RUSTSEC-2026-0346..0349 (rustls), which the pushed commits had nothing to do with. Before blaming a push for a red, read the deny job first. The fix is a lockfile-only `cargo update -p rustls`; pumper, paypal and personas all took it the same day.
- Worker transcript timestamps are UTC, and the machine runs CEDT (UTC+2). A worker that looked idle for two hours was five minutes into a poll.

## 2026-10-16 - triage rows that only a person can decide

- **Of 12 workers, 7 changed nothing.** The rows were `ascent/*`, `skillbench/*`, `lens/*`, `salvage/*` and `backup/*` branches, plus pumper #39 and tracklight #30 / politicas #20 major bumps. The scanner emits `worker` for rows that fleet quirks or lens-scan rules already reserve for the owner. A scan-side classifier that sends `lens/*`, `skillbench/*`, `salvage/*` and `backup/*` branches to `operator` would save about 8 worker runs a day.
- **Ascent loop branches chain.** Later `ascent/loop-*` tips contain earlier ones and often share a tip with `ascent/runner`. Check ancestry between them first: mage-arena-vr deleted 6 and personas-web 3 on `merge-base --is-ancestor`.
- **Re-list default-branch runs before diagnosing red.** personas-web's red had been fixed by a sibling session (`afe0032b`) before its worker started.
- **A source-only push to kp needs a Doc-sync trailer in the same commit.** The CI doc-sync job reads HEAD~1..HEAD and the pre-push hook does not run it, so the first push went red and an empty follow-up commit cleared it.
- **A fresh Windows worktree is CRLF under `core.autocrlf=true`.** Tests that read fixture bytes fail locally and pass in CI; check out with `-c core.autocrlf=false -c core.eol=lf`.
- **push-primary skips when the checkout goes live between scan and apply** (personas-web, "active 0 min ago"). A sibling session then pushed the same two commits itself.
- **The gravitone red took three pushes** (cancel on a 20-minute timeout, then a second spec file needing the seeded store). Seed first, run `--list` on the spec split, then push.

## 2026-10-17 - push-primary can ship a red; the 10-16 triage finding repeats

- **push-primary of already-committed work turned paypal red.** The 88 commits were type-clean only under the local, looser check. CI's `client` job (typecheck, then test, then build) failed on `listingCode.ts`/`tableDraft.ts`, and the type errors hid four failing test files. A repair worker fixed both in one commit (`f73ffbab`). Phase 4 step 2 caught it, so it is working. The push itself has no pre-check: a repo with no pre-push hook pushes whatever the primary holds.
- **9 of 11 workers changed nothing, the same rows as on 10-16** (`ascent/*`, `skillbench/*`, `salvage/*`, `backup/*`, `tri/*`, majors on #20/#30/#37/#71, pumper #39). The classifier change proposed on 10-16 is now two runs of evidence: about 8 of the day's 11 worker spawns are spent re-reading operator decisions.
- **Re-applying from the after-scan needs `--out <plan dir>/after`.** A bare `--apply` re-reads the morning plan and SKIPs its stale `push-primary` rows as "diverged". The `ff-primary` rows that worker merges create appear only in the after plan.
- **The temp-leak families `gpu-lease-pw-*`, `gt-store-pw-*` and `gt-frames-*` (about 930 dirs) come from gravitone's Playwright config and next-server tests.** That is the repo to fix.

## 2026-10-18 - the triage no-op is now three runs; a disk-scan race

- **6 of 11 workers changed nothing, the third run in a row** (tracklight, pumper, politicas, pof, garden-vr, mage-arena-vr; firetv deleted one branch out of 11 rows). The rows were the same owner-reserved families as 10-16 and 10-17. Workers that had a red to fix (personas-web, athena-portable, personas) or alerts (kp) shipped. The scan-side classifier is overdue: `ascent/*`, `skillbench/*`, `salvage/*`, `backup/*`, `tri/*` and a Dependabot major already carrying a located-cause hygiene comment should be `operator`.
- **`hygiene-disk.mjs` crashed with ENOENT** when a Claude session temp dir vanished between listing the project dir and reading it (a live session cleaning up). The scan now skips a project dir it can no longer read. A crash here aborts the whole disk lane, so every `readdirSync` on a shared temp root needs the same guard.
- **personas frontend-checks now finishes instead of timing out**, so a hygiene push can turn a "cancelled" into a "failure" without causing it. Compare the failing job set of the run before the push with the one after before calling it an outage the run caused. Here commit-lint and rust-tests went green, and frontend-checks went from cancelled to failure on checks the diff did not touch.
- **The Rust test pathspec in Phase 4 step 5 misses inline `#[cfg(test)]` modules** (`git show <sha> -- '*test*'` saw nothing in ab1abb46, three `src/**/*.rs` files). For a Rust commit, grep the whole diff.

## 2026-10-20 - `git worktree remove` followed junctions into a primary

- **A mechanical `remove-worktree` wiped gravitone's primary.** `.claude/worktrees/mutants` and `mutants-unit` held a `node_modules` of per-package junctions into the primary's `node_modules`, workspace packages included (`node_modules/@gravitone/*` -> `packages/*`). `git worktree remove` on Git for Windows descended into them: the primary's `node_modules` was emptied and 608 tracked files under `packages/` deleted. The second removal then failed with "Directory not empty", and the push gate's `'tsc' is not recognized` was the first visible symptom. Recovery: `git checkout -- packages/` (all 608 were clean at HEAD; the pre-run dirty set was `names.tmp` only), the leftover dir removed through `safe-remove`, `npm ci`.
- **Fix:** `remove-worktree` now deletes through `safe-remove.removeTree` and runs `git worktree prune`; workers use the new `scripts/remove-worktree.mjs` (refuses a dirty or locked worktree). A fixture with two junctions reproduces the wipe with the old command and leaves the primary intact with the new one. The `delete-debris` guard of 2026-09 was never applied to worktree removal - check every deletion path, not only the one that bit last time.
- **push-primary skip reasons kept the first three stderr lines**, which for a lefthook/Turbopack gate are warnings. politicas and kp both logged a Vite warning as the reason. The row now keeps the first line and the last six; politicas's real verdict was its local `typecheck` and `test` failing on master while CI is green.
- **Restoring a primary makes it "live" for `--live-minutes`.** gravitone's push-primary then skipped as active; retry it after the window, or leave it to the next run.
- **Workers exhausted the shared GitHub API budget twice** (3269 -> 0 within a minute at 07:59Z; gravitone also hit a secondary limit for ~30 min while core read 3300). kp's worker blamed its own `until`-loop polling of `gh`. Six concurrent workers polling `gh run watch`/`list` is enough; the brief should ask for one poll per few minutes, or the REST runs endpoint, which still answered when `gh run list` returned 403.
- **The owner-reserved triage families went to workers for the fourth run** (garden-vr, mage-arena-vr, pof, athena-portable changed nothing; firetv deleted 6 superseded loop branches). Still unbuilt: the scan-side classifier for `ascent/*`, `skillbench/*`, `salvage/*`, `backup/*`, `tri/*`.

## 2026-10-20 (afternoon) - first harvest-and-baseline run

- **Harvest works and is fast where branches chain.** ~60 branches across 14 repos ended shipped, recorded or superseded; worker rows went from 96 to 6. Most ascent/* families were a prefix chain ending in `ascent/runner`: harvest the tip, the rest are superseded by it.
- **"Gate green" was too loose for a harvest that adds CI.** firetv's harvest merged three workflows that had never been green plus a supply-chain job needing a disabled repo setting; main went red and needed a repair PR. The brief now requires every check on the harvest PR green, new workflows included. Three repos (firetv, garden-vr, mage-arena-vr) got their first CI from harvests.
- **A worker baseline-merged a live primary** (personas) although the scan held it as an operator row. Workers read the whole plan block and act on the director's spoken intent; the brief's "operator rows are context" line needs to be as explicit for baselines as it is for pushes.
- **Workers loosen gates when a red has no in-bounds fix**: paypal ignored three cargo-deny advisories, personas allowlisted three VOID events. Each carried reasons, but neither had an operator ruling. Hard rule 4 must name "adding an ignore/allowlist/baseline entry" explicitly.
- **Push-denied repos cannot be harvested** (systedo-case): branches, baseline and PR repairs all need a push. Either accept that or grant a scoped push for hyg/* branches.
- **Vercel deploy evidence is missing on both production-deploy repos** (ascent since 2026-09-03, systedo-case since 2026-10-13): the "merge is a production deploy" quirk may no longer hold.

## 2026-10-21 - a crash dump held three scratch clones; push-primary meets a moved advisory DB

- **`grep.exe.stackdump` alone kept three landed scratch clones as `scratch-wip`** (`C:/t/dp-cis`, `dp-bj0926`, `dp-lsdf`): 0 unlanded commits, the dump the only dirty path. The checkout lane's `NOISE` list lacked the name the debris lane already deletes as junk. `*.stackdump` is now noise in `hygiene-disk.mjs` (test red without the rule, green with it); the three moved to `remove-scratch-checkout`. Two lanes with two junk lists drift: when one learns a name, check the other.
- **A clean push-primary was followed by a red Dependency audit that the push did not cause** (pumper, `.ai/`-only commits): cargo-deny picked up RUSTSEC-2026-0382/-0378/-0379 published since the 05:47Z green run. The repair worker cleared it with a lockfile-only `cargo update -p rustls-webpki -p wasmtime` (fb6002fc). Any Rust repo with cargo-deny can turn red on the first run of the day without a code change, so attribute an audit red by diffing the advisory IDs against the last green run before calling it an outage the run caused.
- **politicas's push-primary SKIP was the primary's WIP, not the commits.** The lefthook gate reads the working tree (a modified `tieFlags.test.ts`, untracked `pnpm-lock.yaml`/`pnpm-workspace.yaml`) and a stale shared pglite template in `%TEMP%` (its fingerprint drops the version because pglite 0.4.6 does not export `./package.json`). A worker re-ran the same hook in a clean detached worktree with a private TEMP, it passed, and the fast-forward went out. A dirty primary's push-primary SKIP is worth a clean-worktree retry before it becomes an operator row.
- **`ff-primary` SKIPs twice on mage-arena-vr** for a local `.gitignore` edit that the incoming commits also touch. The scan can see that conflict (dirty path in `git diff --name-only HEAD..origin/<default>`) and should file it as `operator`, not `mechanical`.
- **Workers read origin refs they had not refetched.** personas-web reported its primary "2 ahead" after the director's push had landed. Brief: `git fetch` before quoting ahead/behind.
- **The TypeScript 7.0.2 Dependabot PR is now open on four repos** (kp #121, politicas #20, personas-web #28, firetv #18), each with a located-cause comment; workers re-read them every run. Same verdict as the 10-16 triage finding: a Dependabot major with a hygiene comment and an unmoved cause belongs in `operator`.

## 2026-10-22 - 8 workers, 5 PRs merged, 3 baselines set; scan gaps that recur

- **`default-branch-red` on a run "not on tip" sent two workers to a stale red** (gravitone run 39393462849, personas 39613821516). On both tips the jobs that failed in the old run had gone green or been cancelled. Per-job conclusions on the tip run are what matter. The scan should read the tip run's jobs before filing a worker row, or file "not on tip" as context only. Still unbuilt, like the 10-21 `ff-primary` conflict rule: mage-arena-vr skipped a third time on the same `.gitignore`.
- **An owner-held branch arrived as a worker `triage-branch`** (politicas `intake/tacs-1022-term-depth`, which a memory and an intake run marked as awaiting an owner decision). The director withdrew it in the dispatch prompt and recorded it in the quirks. That is a hand override the skill forbids, and the scan has no hold marker to read. It needs one, such as a committed hold list the scan reads, so that a held branch classifies as `operator`.
- **The repeat Dependabot majors cost a worker each run for no change**: TS 7 on four repos and sqlx 0.9 on tracklight, which now has eight identical comments. Three of the eight workers changed nothing. A PR with an earlier hygiene comment and no new commits since should classify as `operator`.
- **A detached-worktree push ran without its pre-push hook** (pumper: `core.hooksPath` unset there), so CI was the only gate. CI was green. The brief should make the worker confirm that the hook banner printed before it trusts a push.
- **Re-scan after workers, then apply against that plan**: `--apply --only ... --out <plan dir>/after` reads `after/plan.json`. It found six mechanical rows that had become ready during the run (primaries idle again, baselines just pushed). Four were applied (pof and personas-web push-primary; pumper and politicas ff-primary). gravitone's push-primary was refused by its own pre-push gate (`next-unit` and `build` failed locally on `.ai/`-only commits, while CI `gates` is green on origin), which goes to the operator.
- **personas master red is a flaky test plus timeouts, not the push.** The 84-commit push-primary touched only `.ai/`. The same base 576d18f0 alternated green and red on schedule. On the tip the Linux failure is `export_stats_report_both_athena_tiers`: an "empty" export already counts Athena rows, which suggests state leaking between parallel tests.

## 1.3.0 - 2026-10-22 - first disk deep pass (54 GB -> 158 GB free)

- **The morning lane measured about 23 GB of a problem that held about 480 GB.** `hygiene-disk.mjs` sees the scratch root, temp and incremental caches idle 24 h. MangoDisk's read-only scan found 252.7 GB in 46 cargo `target/`s, 56 GB of node build output, a 40 GB uv cache, 36 GB of Unreal `Intermediate/` and package-manager caches. An outside analyzer is the instrument for "where did the space go"; our lane remains the instrument for what may be deleted.
- **The incremental floor left most of the cache standing.** After the morning sweep, paypal still held 38 GB of `incremental/` and personas 18 GB, because each crate dir had been touched inside 24 h. With no cargo process running and nothing written in 60 min, removing them freed 73.3 GB and broke nothing (rebuild cost only). A process check is a better gate than a 24 h idle floor for a pure speed cache.
- **Named Unreal worktrees are outside every lane.** `mage-arena-vr-wt/T17..T26` and `slice` were clean, landed and idle for two weeks, with 2.9 GB of `Intermediate/` each (26.2 GB in all). No class removes a named sibling worktree, and that is right. Its ignored build output was the safe cut.
- **Package-manager temp outlives its operation.** uv left 8.4 GB of torch unpacks in `cache/.tmp*` from a run five days earlier. `uv cache prune` waits on the cache lock while any `uv` runs, so it hit a 300 s timeout against a sibling's `uv run pytest`. Check for a `uv.exe` process first.
- **MangoDisk `--apply` is not a hygiene action.** Its CLI selects only `recommended` or `all`. `recommended` clears browser and app caches with the apps running, and its project rules delete whole `target/`/`node_modules` with no liveness check. Measure with it, delete with our gates.
- **The analyzer found a fifth of the problem; a growth walk found the rest.** After the analyzer-guided pass (158 GB free), the operator noted that 200-300 GB was still missing. A node walk of C: (11.5 M files, 19 min) totalled bytes modified since the last good sweep (2026-10-15, 684 GB free): 891 GB written. That surfaced 465 GB in five families that no rule names: a spike's model store (202 GB), 14 orphaned Personas headless paypal worktrees (145 GB, no `.git`, unregistered, about 11 GB of `target/` each), an out-of-tree `paypal-belay-target` (63 GB), cargo builds in session scratchpads (28 GB) and per-wave repo exports (15 GB). After deleting them with operator approval, free space reached 546 GB. Start a deep pass from "what grew since <date>", not from "what does a cleaner recognise". The walk is now `tools/growth-walk.mjs`.
- **The Personas app's headless finalize can unregister a worktree without deleting its files.** A git-level check never sees it, because neither `worktree list` nor the scan lists a directory without `.git`. The disk lane should classify `~/.personas/headless-masters/worktrees/*/*` without `.git` and absent from `--porcelain` as a mechanical row after an idle floor. It still needs code in `hygiene-disk.mjs`; on 2026-10-22 it took a hand-run removal with operator approval.

## 2026-10-23 - 8 workers, 7 mechanical pushes, 51 GB disk; a push-primary turned personas red

- **A clean fast-forward push-primary can still turn a default branch red: personas' required `commit-lint` lints the pushed range.** 71 commits went out; three intake-lane subjects (`ai(applied):`, `apply(...)`, `intake(apply):`) failed the lint, and master's run on `de418f01` concluded failure. The pre-push hook does not lint subjects, and pushed history cannot be rewritten under the no-force rule, so the red stands until the next push. `push-primary` should run the repo's commit-subject rule over `origin/<default>..HEAD` before pushing (SKIP to `operator` on a violation), and the intake lanes that commit into personas need conventional types. Not built yet.
- **A gate the CI does not run can hold origin red for a day unseen.** politicas' push-primary SKIP listed typecheck, test and copy-check. A clean worktree with a private TMP reproduced only copy-check, and it was red on `origin/master` itself (two em dashes from `ab72023`, 10-22), while CI stayed green because CI has no copy-check. The worker's first pass, following the dispatch note, reported it as operator; the director resumed it for the two-string fix (`0753bb6`), after which all 9 commits shipped. Fixing a red pre-push gate on origin is within the worker's repair mandate. The dispatch note should not have offered "operator" as the default for a located, small fix.
- **The disk lane's husky NOISE rule was checked against content, and held.** `C:/t/qw1022` carried real prose edits in the tracked `.husky/commit-msg` and `prepare-commit-msg` that are on no ref anywhere. They are the output of the installer committed in that same tree (`scripts/install-commit-hooks.mjs`, "managed by ... delete this line to own the file"), so the files can be regenerated. Before trusting a noise rule on a tracked file, check that something committed regenerates it.
- **Recurring scan gaps, unchanged from 10-21/10-22.** `ff-primary` on mage-arena-vr SKIPped a fourth time on the same dirty `.gitignore`; personas joined it with `.claude/active-runs.md`. The director again withdrew politicas' owner-held `intake/tacs-1022-term-depth` by dispatch note (no hold marker exists). Repeat Dependabot majors: four of the eight workers spent their run re-confirming TS 7 (kp #121, politicas #20, personas-web #28, firetv #18), sqlx 0.9 (tracklight #30) or websockets 17 (kp #37) with no new cause. personas-web's worker posted no fourth comment, which is the right behaviour.
- **Workers still quote the plan's ahead/behind instead of live refs.** personas-web reported its primary "7 unpushed" after the mechanical push had landed (0/0 live). The 10-21 brief fix (`git fetch` before quoting) has not reached the brief.
- **A PR merge with red checks needs a job-by-job "no NEW failure" argument, and the director re-checks it.** personas #33 (9 harvested commits from a 5-week-old worktree branch, 14 others recorded in issue #34) merged with rust-deny, rust-no-features, frontend-checks, smoke and rust-tests (linux) red; each was matched to a master run with the same failure. That is the quirk's rule applied correctly, but the master run on the merge commit was still queued at report time.
- **A worker ran `git push` in a primary checkout by accident** (personas, a cleanup command). It was a no-op because local master was behind origin. The brief already forbids pushes from the primary; the slip came from a compound command. Verify step 3 caught no change.
- **Disk: the morning lane freed 50.9 GB (6,633 rows), and free space still fell from 552 to 548 GB during the run.** Workers' `npm ci` and cargo builds plus five live sessions outwrote the cleanup. Measure free space before dispatch, not after the workers.

## 2026-10-25 - 8 workers, 20 mechanical repo actions, 26.5 GB disk; an empty-dir age bug found in the disk instrument

- **`measureTree` aged an empty directory as Infinity, so seconds-old `mkdtemp` dirs were classed mechanical.** An empty dir has no file mtime to read, `newestMs` stayed 0 and `ageOf` returned Infinity. 776 of the day's mechanical rows had `ageH: null`, and 759 of them were under 7 days old (the youngest 7 h); `remove-session-temp` read 542 rows. Fixed in `scripts/lib/safe-remove.mjs`: an empty directory contributes its own mtime/birthtime. After the fix null-age mechanical rows were 0, session-temp fell to 48, and the youngest mechanical row was 33.6 h. Found by spot-checking the row with `bytes: 0` and `ageH: null` rather than the 26 GB cache rows. Add a null-age assertion to the next change of the disk classifier.
- **A push-primary SKIP by the repo's own pre-push gate is a finding, not noise.** gravitone's 76 unpushed commits were blocked by `probes` and `build` failing locally; its worker saw only the red `live` job and called the push a clean fast-forward it did not own. The commits stay local until the owner fixes the gate.
- **A red `default-branch-red` row can be the known non-gate job only.** gravitone's worker checked per-job conclusions first and stopped with no worktree. Keep that order in the brief.
- **Windows npm install strips `libc` fields from the lockfile; Dependabot rebases after every merge to master.** politicas' worker restored the lockfile from origin and applied only the dependency hunk, and re-fetched before each push.
- **Dependabot PRs that look like code reds can be the doc-sync gate.** politicas: `package.json` couples to four docs, so each bump needs `Doc-sync(...)` trailers; five PRs merged that way.
- **A major SDK bump can silently disable a privacy hook.** Sentry 11 ignores `beforeSendTransaction` under span streaming; typecheck passed, the SDK-event test caught it. The `traceLifecycle: 'static'` pin is documented in politicas `docs/routes/schranka.md`.
