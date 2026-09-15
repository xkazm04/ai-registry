---
name: hygiene
description: "Start-of-day fleet sweep before any development: scan every project registered on this machine for open pull requests, merged or abandoned branches and worktrees, a red default branch, and open GitHub security alerts (code scanning, secret scanning, Dependabot). Cleans up what is mechanical itself, then dispatches one Sonnet worker per project to ship, repair, merge, delete or fix the rest onto main/master, and hands back only what needs a human. Use at the start of a day, or when branches, PRs and alerts have piled up across the fleet."
category: ai-native
memory: project
version: 1.0.0
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
method). Hygiene owns only the delivery surface: PRs, branches, worktrees, the default
branch's CI, and GitHub's alert queues.

## Invocation

```
/hygiene                  # full run: scan -> mechanical -> dispatch -> verify -> report
/hygiene scan             # plan only, touches nothing
/hygiene kp,ascent        # full run limited to these project slugs
/hygiene status           # print today's plan.md and applied.jsonl, touch nothing
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
- **Shipping commits hygiene did not author.** Operator decision, 2026-09-15: every fleet
  repo's CLAUDE.md says "commit, never push - the owner pushes after reading the log",
  and the unpushed commits sitting on a primary checkout's default branch are exactly the
  ones not read yet. They are an `operator` row (`primary-unpushed`, with the newest
  subjects), never a worker action. The dispatch prompt is the explicit ask those
  CLAUDE.md lines allow for - but only for merges, deletions and fixes the run authors.

Merging to `master` on ascent or systedo-case **is a production deploy** (Vercel Git
integration). CI green before merge is not optional there.

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
| `mechanical` | the script's `--apply` | delete branches whose content is on the default branch (tip archived to `refs/hygiene-archive/<date>/` first), remove clean idle Claude Code/temp worktrees, prune missing worktrees, set `origin/HEAD`, fast-forward an idle primary checkout |
| `worker` | one Sonnet per project | ship or repair open PRs, fix a red default branch, triage unmerged branches, push unpushed default-branch commits, fix code-scanning/Dependabot alerts |
| `operator` | the human, in the final report | secret alerts, stale uncommitted WIP, a primary checkout parked on a feature branch, Personas-app worktree backlog, security posture (scanning not configured) |
| `hands-off` | nobody | anything with reflog, commit or dirty-file activity inside `--live-minutes` (default 120), and PRs updated inside it |

If the plan looks wrong, fix `scripts/hygiene-scan.mjs` - never override a class by
hand in the run. A classification the director overrides once is overridden
differently tomorrow.

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

`/hygiene scan` ends here: print the table and the operator list.

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
worker that dies mid-run.

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
   Every commit there must be accounted for by a merged PR or a report's
   `pushes[].commits`; one that is not is either a sibling session's work (check its author
   and time) or something the worker forgot to report (tracklight 2026-09-15: three store
   fixes hidden behind a push's tip SHA). Steps 2 and 5 run against this list.
1. Every PR the report says merged: `gh pr view <n> -R <repo> --json state,mergedAt`.
2. Every push to a default branch: `gh run list -R <repo> --branch <default> --limit 5`
   shows the run for that SHA completed green (or still in progress - then
   `gh run watch <id> --exit-status`). A red default branch after a hygiene push is an
   outage the run caused: dispatch a repair worker for that project before reporting.
3. The primary checkout is untouched: `git -C <path> branch --show-current` matches, and the
   **sorted set** of `git --no-optional-locks status --porcelain` paths equals `plan.json`'s
   `primary.dirtyPaths` (except an `ff-primary` DONE row, or a live primary whose own
   session moved on - then name the differing paths and judge whether a worker could have
   written them). A count is not enough: a worker that edits the wrong tree and reverts a
   different file leaves the count intact.
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
