---
layer: application
type: application
subject: markdown-vault
technique: read-triggered-reconciliation
stack: node
status: forged
verified_on: 2026-09-04
verified_against: node@22
applied: code
ab_verdict: better
proof: ab-paired
---

# A stamp that was written for three months and read by nothing

A managed project in this fleet keeps a context index beside its code: one
record per module, each naming the module's path, its `CONTEXT.md`, and a
`reconciledToSha` — the commit the context document was last brought level with.
A zero-dependency upkeep script maintains it, with a `touch` subcommand that
writes the stamp and a `check` subcommand wired into pre-push.

This is the failure mode the technique names **the stamp nobody resolves**,
found in the wild.

## The two gates, and which one existed

`check` computed staleness from the *uncommitted working diff* — the union of
`git diff --name-only HEAD` and `--cached` — warning when a module had code
files in that set and its `CONTEXT.md` did not. `reconciledToSha` appeared in
the file it read, and was never resolved, compared, or mentioned.

The consequence is the second failure mode in the technique's list, exactly: the
gate fires while an edit is in the working set and goes silent the moment the
edit lands. Drift is detectable during the one window in which it is not yet
drift. Commit the code without refreshing the context, and the warning is gone
permanently.

The technique's gate is the other one: resolve the stamp the mirror carries, and
compare it against the source's own current state.

## The paired measurement

**Measurable:** module-context drift conditions the pre-push gate reports, over
the repository exactly as it stands. Same command, same repository, both arms.

| | Arm A (working-diff gate) | Arm B (stamp resolved against history) |
| --- | --- | --- |
| Warnings | 1 | 2 |
| What it saw | today's uncommitted files | today's uncommitted files, **plus**: the recorded stamp does not resolve to a commit in this repository |
| `--strict` exit | 0 | 1 |

The added warning is not a near-miss. The stamp on the sole module record is
seven hex characters that `git cat-file -t` rejects as *"Not a valid object
name"* — a value from a rewritten or foreign history, or one that never existed.
Behind it: the module's `CONTEXT.md` was last committed 2026-06-11, and **4,215
commits touching 8,788 files** have landed since. Arm A reported none of it, and
had reported none of it for three months, because none of it was ever in a
working tree at the moment `check` ran.

Arm B's second branch was verified separately by pointing the index at a
resolvable stamp: it reports `4198 commit(s) under . since reconciledToSha
<sha>, and CONTEXT.md was not touched in any of them`. Both branches run.

Verdict: **better**. The instrument gained a detection class it structurally
could not reach, at fourteen lines and no new dependency, and the first thing it
detected was a real defect nobody was auditing for.

## Two things the change had to get right

- **The peel syntax is not portable through a shell.** The first draft verified
  the stamp with `git rev-parse --verify --quiet <sha>^{commit}`. On Windows,
  `execSync` runs through `cmd.exe`, where `^` is the escape character — the ref
  arrives as `<sha>{commit}`, resolves to nothing, and the gate reports *every
  valid stamp* as unresolvable. It was caught because the resolvable-stamp branch
  was exercised deliberately rather than assumed from the failing one. `git
  cat-file -t <sha>` carries no shell metacharacter and answers the same
  question.
- **A probe that may legitimately fail must not print.** Resolving a stamp that
  might not exist is a normal outcome here, and the helper inherited stderr, so a
  healthy run emitted a bare `fatal:` line above its own verdict. Ignoring stderr
  in the git helper is the fix; a gate that prints noise on a clean run is how
  people learn to skim gates.

## What this realization cannot do

It measures drift in **commits**, not in meaning: a module whose context is
genuinely still accurate after two hundred commits reports as stale, and the
only cure the script offers is `touch`, which re-stamps without checking that
anyone re-read anything. The gate proves the context was *considered* at a
commit, never that it is correct — the same distinction the subject's own lint
draws between a syntactic pass and a judgment pass. Sharpening it further needs
a content check the project has no instrument for.
