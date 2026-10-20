---
name: hygiene
description: "Start-of-day fleet sweep before any development: scan every project registered on this machine for open pull requests, merged or abandoned branches and worktrees, a red default branch, and open GitHub security alerts (code scanning, secret scanning, Dependabot), plus invalid Claude Code project settings via `claude doctor`, and the disk debris agent runs leave on the machine (landed scratch clones, build output, stale compiler caches, session and test-fixture temp). Cleans up what is mechanical itself, then dispatches one Sonnet worker per project to ship, repair, merge, delete or fix the rest onto main/master, and hands back only what needs a human. Use at the start of a day, when branches, PRs and alerts have piled up across the fleet, or when the disk is filling."
category: ai-native
memory: project
version: 1.2.0
tags: fleet, hygiene, pull-requests, branches, worktrees, security-alerts, ship, dispatch, sonnet-workers, start-of-day
---

# Hygiene

The fleet accumulates debris faster than anyone looks at it: autopilot PRs that
passed CI and were never merged, branches whose content landed by squash weeks ago,
Claude Code worktrees from sessions nobody remembers, a default branch that went red
overnight, security alerts nobody opened. Each item is small. Together they tax every
development session that starts on top of them - a stale checkout, a conflicting PR,
a failing gate that is not yours.

**This skill clears that before the day's work starts.** It is a dispatcher, not a
fixer: an instrument classifies everything, the director applies the mechanical class
itself, and one Sonnet worker per project does the rest in isolated worktrees.

What it is not: `/maintain` reduces code debt inside one repo, `/librarian` maintains
this registry's knowledge, `/ci-triage` diagnoses one red build (workers borrow its
method). Hygiene owns the delivery surface - PRs, branches, worktrees, the default
branch's CI, GitHub's alert queues - and the **debris** dev processes leave in a checkout:
crash dumps, bytecode caches, scratch folders, a dot-directory a tool created at the root
because it did not know where to put its working files.

## Invocation

```
/hygiene                  # full run: scan -> mechanical -> dispatch -> verify -> report
/hygiene scan             # plan only, touches nothing
/hygiene kp,ascent        # full run limited to these project slugs
/hygiene status           # print today's plan.md and applied.jsonl, touch nothing
/hygiene disk             # the disk lane alone: scan, apply mechanical, report (no GitHub, no workers)
/hygiene reflect          # land what the last runs taught into this file and LESSONS.md
```

## Standing authorization and its limits

Operator, 2026-09-15: hygiene merges, deletes, implements and pushes to the default
branches of fleet repos **without asking**. The fleet has one owner; the gates are the
guard, not a confirmation round trip. So never stop mid-run to ask "may I merge #37?".

What the authorization does NOT cover, for the director and every worker:

- `--no-verify`, `*_SKIP_GATE=1`, `LEFTHOOK=0`, `HUSKY=0`, or force-pushing a default
  branch. A gate that blocks is an answer. `--force-with-lease` on a feature branch is fine.
- Discarding uncommitted changes anywhere, ever. Stale WIP goes to the operator list.
- Touching a worktree under `AppData/Roaming/com.personas.desktop/worktrees/`. The
  Personas app created it, tracks it, and finalizes it itself.
- Resolving or dismissing a **secret-scanning** alert. Rotation is a human act.
- Dismissing a code-scanning or Dependabot alert without a concrete, recorded reason.
- Anything the instrument marks `hands-off`. Something live touched it.
- `git push` into systedo-case (its settings deny it on purpose): server-side
  `gh pr merge` only.
- **Shipping commits hygiene did not author**, when the push is not a clean fast-forward
  sync. Operator decision, 2026-10-04 (revises 2026-09-15): unpushed commits on a primary's
  default branch are routinely another session's or another machine's already-committed
  work, and syncing that is exactly what a start-of-day sweep is for - so a clean
  fast-forward push (not diverged, checkout idle, repo does not deny push, default branch
  not a production-deploy target) is `mechanical` (`push-primary`), not a worker action.
  Operator decision 2026-10-20 extends it: **diverged history is merged too**
  (`merge-primary-baseline`, a worker action: merge origin into the local commits in a
  worktree, gate, push; the next apply fast-forwards the primary). Setting the baseline is
  one of the reasons this skill runs first thing in the morning. What still goes to the
  operator as `primary-unpushed`: a live checkout, a push-denied repo, or a
  production-deploy default branch (see below). The dispatch prompt remains the explicit ask
  for anything a worker itself authors - merges, deletions, fixes.
- **Leaving branches standing.** Operator decision 2026-10-20: every unmerged branch the scan
  lists is analysed and **harvested** - its progress landed through a PR, or its ideas
  recorded in a `Harvest:` issue - and then deleted (tip archived under
  `refs/hygiene-archive/<date>/`). Historic branches (`backup/*`, `salvage/*`, stash
  snapshots, the history of a merged PR, closed experiment arms) are deleted after the same
  check. Only a branch with uncommitted WIP in its worktree, a hands-off target, or a
  Personas-app branch stays. See the triage playbook in `references/worker-brief.md`.

Merging **or pushing** to `master` on ascent or systedo-case **is a production deploy**
(Vercel Git integration). CI green before either is not optional there, and there is no CI
run yet to check for commits that were never pushed - so `push-primary` never fires for
`ascent:master` (`PRODUCTION_DEPLOY_DEFAULT` in `hygiene-scan.mjs`); systedo-case is already
excluded via its push-deny settings. Widen that set only for a repo whose default branch
deploys outside its own CI.

## Never classify anything yourself

`node scripts/hygiene-scan.mjs` is the instrument. It resolves the fleet through
`scripts/lib/projects.mjs`, fetches every checkout, and writes
`$(git rev-parse --git-common-dir)/hygiene/<date>/plan.json` + `plan.md`: per project
the open PRs with check rollups, every local and remote branch classified (`merged`,
`squash-merged`, `patch-on-default`, `open-pr`, `closed-pr`, `no-pr`, `unpushed`,
`merged-pr-then-more-commits`), every worktree with its owner and activity, default
branch CI per workflow, the three security surfaces, and a list of **actions** in four
classes:

| class | who | examples |
|---|---|---|
| `mechanical` | the script's `--apply` | delete branches whose content is on the default branch (tip archived to `refs/hygiene-archive/<date>/` first), remove clean idle Claude Code/temp worktrees, prune missing worktrees, set `origin/HEAD`, fast-forward an idle primary checkout, **push an idle primary's clean fast-forward-able unpushed commits** (`push-primary` - skipped if diverged, live, push-denied, or a production-deploy default branch), **delete untracked junk-named debris** (`*.stackdump`, `__pycache__`, `*.pyc`, `*.orig/.rej/.swp`, `Thumbs.db`, `.DS_Store`, `nul`, editor `~` files) |
| `worker` | one Sonnet per project | ship or repair open PRs, fix a red default branch, merge a diverged primary's commits (`merge-primary-baseline`), harvest then delete unmerged branches, fix code-scanning/Dependabot alerts |
| `operator` | the human, in the final report | `debris-candidate` (untracked top-level scratch-looking entries: `tmp*`, `out`, `backup*`, `*.bak/.log/.tmp`, an unknown dot-directory), `tracked-junk` (a junk name that is committed), secret alerts, stale uncommitted WIP, a primary checkout parked on a feature branch, `primary-unpushed` that is live/push-denied/production-deploy, Personas-app worktree backlog, security posture (scanning not configured) |
| `hands-off` | nobody | anything with reflog, commit or dirty-file activity inside `--live-minutes` (default 120), and PRs updated inside it |

If the plan looks wrong, fix `scripts/hygiene-scan.mjs` - never override a class by
hand in the run. A classification the director overrides once is overridden
differently tomorrow.

Re-verify any change to it against **a project you already know is red and one you know is
green**, before and after. Every wrong version of the 2026-09-21 CI-selection fix made the
table calmer than the truth - an all-green control set would have passed all three.

## Phase 0 - Preflight

1. `gh auth status` must show a logged-in account with repo scope. Its `admin:repo_hook`
   hint on 403/404 responses is noise.
2. `node scripts/run-board.mjs list`, then
   `node scripts/run-board.mjs claim --skill hygiene --source fleet-<date> --run hyg-<date>`.
   A second hygiene run on the same day is a CONTENDED answer (exit 3): stop.
   The claim goes stale without heartbeats, and the worker phase lasts hours: beat it at
   every phase boundary and after each worker report
   (`node scripts/run-board.mjs beat --run hyg-<date> --phase <phase>`).
3. `ListAgents` - note how many peer sessions are busy. Informational only: the
   instrument's liveness check is what gates actions, since session names do not say
   which checkout they are in.

## Phase 1 - Scan

```
node scripts/hygiene-scan.mjs [--only <slugs>]
```

Read `plan.md`. Then **spot-check before trusting it** (a plausible count is not an
assertion): for one `mechanical` row and one `hands-off` row, verify the claim straight
from git (`git rev-list --count origin/<default>..<sha>`, `git -C <wt> log -1 --format=%cr`,
`git -C <wt> reflog -1 --date=relative`). If either disagrees, stop and fix the script.

**Harness settings (Tier 1).** The same scan runs `claude doctor` in every checkout - a
read-only, model-free validation of `.claude/settings*.json` and `.mcp.json` - and files
any finding as an `operator` row, `harness-settings` (settings are the trust surface:
permissions, hooks, MCP servers, so a human decides). The `harness` column reads `clean`,
a finding count, or `not-run`, and `not-run` is also a PROBLEM line: the tool exits 0
even when it reports invalid settings, so the instrument reads the "Invalid settings"
block and never the exit code, and a run that produced no report is not a clean one.
Know what it cannot see: it is a schema check, so unknown keys, unknown tool names,
allow rules made unreachable by a deny, and a missing MCP binary all pass it, and
malformed JSON hides every other error in that file - fix the JSON and re-scan. The
judgment tier (`claude -p "/doctor" --permission-mode plan`, per project, weekly or after
a harness upgrade) is NOT part of this sweep: its findings are a source to verify, per
`librarian/sources/2026-10-08-claude-code-doctor.md`, never cleanups to apply.
`--no-harness` skips Tier 1 on a machine without `claude` on PATH.

Then the disk lane: `node scripts/hygiene-disk.mjs` (minutes: it walks the scratch root and
temp in full, because a liveness gate on a deletion has to see every file). Spot-check one
`remove-scratch-checkout` row from git (`git -C <dir> rev-list HEAD --not --remotes`, `git -C <dir>
status --porcelain`) before trusting the class.

`/hygiene scan` ends here: print the table and the operator list.

## Debris - what counts and what never does

The scan looks only at **untracked, not-ignored** entries of each primary checkout
(`git ls-files --others --exclude-standard --directory`: an untracked directory is one row).
Ignored paths are intentional; ordinary untracked files are somebody's WIP and are never
listed. Three tiers: *junk* names are deleted by `--apply` after re-checking that the entry
is still untracked, idle past `--live-minutes`, inside the repo and free of symlinks or
junctions (a recursive delete that follows one wiped a primary's `node_modules`); *candidate*
names go to the operator with size and age, because a script cannot know whether `out/` or
`.personas-web/` holds the only copy of something; *tracked-junk* is a content change and is
reported only. Debris deletion is **not recoverable** (no archive ref exists for an untracked
file) - that is why the junk list stays short and name-based. Widen it only with a LESSONS
entry showing the name was never content. The rule for the operator triage: ask for a decision
and, once made, either delete it, add it to `.gitignore` if the tool keeps recreating it, or
fix the process that wrote it there.

## Disk lane - what runs leave on the machine

A checkout's `git status` never shows where the bytes went. On 2026-10-15 one curator night
had left 337 folders in the scratch root in thirteen hours, about 200 GB: a clone of a fleet
project per claim, each with its own install, `.next` and cargo `target`, because the run
removed its registry worktree on landing and never the project clone. Beside it sat a 62 GB
cargo `incremental/` cache (one entry per feature set ever built), 36 GB of Claude session
temp and about 100,000 test-fixture temp dirs, one suite alone 19,147. `scripts/hygiene-disk.mjs`
is the instrument for that surface; it writes `disk.json`/`disk.md` beside `plan.json`.

| area | mechanical | operator |
|---|---|---|
| scratch root (`<drive>/t`) | a checkout idle past `--idle-hours` whose HEAD is landed (worktree: on another ref of its repo; clone: every commit on its remotes, or each local commit's patch-id in its fleet home) and whose dirty paths are noise only (`next-env.d.ts`, `*.generated.ts`, untracked husky shims, a whitespace or line-ending diff); a build-output folder (`*target*`, `tgt*`, `cargo-target-*`) once idle | a checkout with WIP or unlanded commits; any `hyg-*` entry (the dead-worker rule); an unknown folder after `--temp-days` |
| build caches | cargo `incremental/` crate dirs in fleet checkouts untouched past `--idle-hours`; an out-of-tree build-output sibling of a checkout after `--temp-days` | the same sibling before `--temp-days` |
| temp | a user-temp entry or a Claude session dir untouched `--temp-days` (7), or 48 h and 100 MB | `temp-leak`: a name family with hundreds of members - a suite that never removes its `mkdtemp` dirs; fix it in that repo |
| models | - | a local model store over 1 GB (operator 2026-10-15: none wanted on this machine) |

Everything inside `--idle-hours` is `hands-off` (`.git/index` is not activity: scanners refresh
it). Deletion goes through `scripts/lib/safe-remove.mjs`, which removes a symlink or junction as
a link and never enters it, and clears the read-only bit git puts on objects. `--apply`
re-measures and re-classifies each row immediately before deleting and requires the same answer
(the same HEAD for a checkout). A run that makes scratch entries cleans its own with
`node scripts/hygiene-disk.mjs --reap <dir>...` at the end of each task: the same rules at idle
floor 0, kept entries printed with the reason. curator's night does this per claim.

`/hygiene disk` is this lane alone: the Phase 0 claim, `hygiene-disk.mjs`, the spot-check,
`--apply`, and the report's **Disk** section. No GitHub calls, no workers.

## Phase 2 - Mechanical

```
node scripts/hygiene-scan.mjs --apply [--only <slugs>]
```

Every action re-verifies its precondition immediately before acting (tip unchanged,
still idle, still clean, not now the base of a PR) and logs DONE or SKIP to
`applied.jsonl`. SKIP is a normal answer. Read the SKIP reasons: a pattern
(e.g. every remote delete rejected by a hook) is a LESSONS entry.

Recovery, if ever needed: `git for-each-ref refs/hygiene-archive/` in the checkout, then
`git branch <name> <sha>` or `git push origin <sha>:refs/heads/<name>`.

Then `node scripts/hygiene-disk.mjs --apply`; it appends to `disk-applied.jsonl`. Disk deletions
are not recoverable, which is why a checkout goes only when its commits are provably elsewhere.

## Phase 3 - Dispatch

One worker per project that has at least one `worker` action; each one touches only its
own repository. **Run at most 6 at a time**, largest plans first (kp, tracklight, ascent
before the one-action projects), and start the next as each finishes. Thirteen concurrent
workers on 2026-09-15 tripped GitHub's secondary (abuse-detection) rate limit - 403s on
merges and branch deletes while `gh api rate_limit` still read 5000/5000 - and doubled
scan times in the middle of the run.

```
node scripts/hygiene-scan.mjs --brief <slug> > <scratchpad>/brief-<slug>.md

Agent({
  description: "hygiene <slug>",
  subagent_type: "general-purpose",
  model: "sonnet",
  prompt: "Read <scratchpad>/brief-<slug>.md in full and carry it out. It is your whole task."
})
```

`--brief` assembles the prompt from files - `references/worker-brief.md` verbatim, the
project's slice of `plan.json` (`worker` actions in full, `operator` rows as context so the
worker does not "fix" them, `hands-off` targets so it does not touch them) and its
`references/fleet-quirks.md` sections. Never retype or paraphrase a block: a hand-built
extraction on 2026-09-15 silently dropped kp's quirks section through shell quoting.
Handing the worker a file path keeps a 20 KB kp block out of the director's own context.

Order inside a project is the worker's job (brief, "Order of work"). Across projects
there is none.

Record every dispatch in `<plan dir>/dispatch.jsonl` - one line per worker with `slug`,
the agent id from the spawn result, and the dispatch time. It is the only way back to a
worker that dies mid-run - **inside this session only**: a new session's `SendMessage` to
that id answers "No transcript found" (2026-09-26, reaching the 2026-09-24 ascent worker).

Save each worker's report to `<plan dir>/reports/<slug>.md` the moment it arrives, before
starting the next worker. A director that dies otherwise takes every report with it: the
2026-09-24 run dispatched ten workers and left no report, no verify and no record of what
they shipped.

A project whose previous-run worker died mid-item (its `C:/t/hyg-<slug>-*` worktrees are
still there, and the scan lists them as stale WIP) gets no worker until the owner clears
them. Say so in `dispatch.jsonl` and in the report.

While workers run, do not touch their repositories. Wait for the notifications. A
notification whose text is not the fenced JSON report means the worker is still going
(it ended a turn waiting on CI) - never count it as done.

**A worker that fails mid-run** (an API session limit killed three at once on 2026-09-15):
after the limit resets, snapshot its repo first (`C:/t/hyg*` worktrees and their state,
`gh pr list --state all`, default-branch runs), then `SendMessage` to its agent id - that
resumes it from its own transcript, so it still knows what it pushed. Order it to re-read
live state before acting, finish only the in-flight item, start nothing new, clean up, and
report. Never dispatch a fresh worker onto a repo a dead one was halfway through.

## Phase 4 - Verify

A worker's report is a claim. For each project:

0. **Start from what actually landed, not from the report:**
   `git -C <path> fetch origin` then
   `git -C <path> log --reverse --format='%h %an | %s' <plan defaultSha>..origin/<default>`.
   Every commit there must be accounted for by a merged PR, a report's `pushes[].commits`,
   or a mechanical `push-primary` DONE row in `applied.jsonl`; one that is not is either a
   sibling session's work (check its author and time) or something the worker forgot to
   report (tracklight 2026-09-15: three store fixes hidden behind a push's tip SHA). Steps
   2 and 5 run against this list - `push-primary` commits included, since they were not
   authored by this run and still need the same post-push CI check.
1. Every PR the report says merged: `gh pr view <n> -R <repo> --json state,mergedAt`.
2. Every push to a default branch: `gh run list -R <repo> --branch <default> --limit 5`
   shows the run for that SHA completed green (or still in progress - then
   `gh run watch <id> --exit-status`). A red default branch after a hygiene push is an
   outage the run caused: dispatch a repair worker for that project before reporting.
3. The primary checkout is untouched: `git -C <path> branch --show-current` matches, and the
   **sorted set** of `git --no-optional-locks status --porcelain` paths equals `plan.json`'s
   `primary.dirtyPaths` (except an `ff-primary` or `delete-debris` DONE row, or a live primary whose own
   session moved on - then name the differing paths and judge whether a worker could have
   written them). A count is not enough: a worker that edits the wrong tree and reverts a
   different file leaves the count intact. Also read `git -C <path> config --local --list`
   and `.git/info/exclude`: a test fixture run by a pre-push hook from a worktree writes
   into the real repository's config (2026-09-19: `core.bare`, `core.worktree`, a fixture
   `user.name`, a replaced exclude file), and none of that shows in branch or dirty paths.
4. The worker left no worktrees or helper branches behind:
   `git -C <path> worktree list | grep hyg` and `git -C <path> branch --list 'hyg*'` are
   empty (except the head branch of a PR the report lists as left open). Attribute any
   `C:/t/hyg*` directory by `git -C <dir> remote get-url origin`, never by its name.
5. **Every worker commit that touches tests is checked for a weakened gate** - the likeliest
   way "make CI green" goes wrong. For each pushed SHA:
   `git show <sha> -- '*test*' '*spec*' | grep -cE '^-.*(expect\(|assert)'` versus the `^+`
   count, and `grep -cE '^\+.*(\.skip|\.only|\.fixme|#\[ignore\]|pytest\.mark\.skip)'`.
   A new skip marker fails verification. A net loss of assertions is read line by line:
   acceptable only when the removed assertions pressed UI or APIs that no longer exist
   (gravity 2026-09-15: a Board-tab pair deleted with the tab itself), never when the
   behaviour still exists.

Then re-scan (`node scripts/hygiene-scan.mjs --out <plan dir>/after`) and compare the
table rows before and after.

## Phase 5 - Report and release

Write `<plan dir>/report.md` and print it:

- **Shipped** - PRs merged, commits pushed, alerts fixed, each with the default-branch CI result.
- **Removed** - branch and worktree counts per project (archive refs noted).
- **Disk** - GB freed per area and free space after; every `temp-leak` family (repo and suite
  to fix) and scratch checkout kept for WIP.
- **Needs you** - every `operator` row plus every worker `operator` item, one line each,
  most urgent first (secret alerts, then red CI the workers could not fix, then WIP).
- **Left alone** - hands-off counts and why.
- **Before / after** table.

Append a `LESSONS.md` entry when the run taught something (a misclassification, a
repo quirk, a worker failure mode). Add repo quirks to `references/fleet-quirks.md`.
`node scripts/run-board.mjs release --run hyg-<date>`.

## Tuning

- `--live-minutes` (120) - raise it on a day with many live autopilot sessions.
- `--idle-hours` (24) - the floor before a clean, merged worktree may be removed.
- A project that should never be touched: leave it out of `projects.json` on this
  machine, or pass `--only`.
