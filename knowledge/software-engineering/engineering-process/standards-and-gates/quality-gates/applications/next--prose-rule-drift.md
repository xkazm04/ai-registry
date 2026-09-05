---
layer: application
type: application
subject: quality-gates
technique: prose-rule-drift
stack: next
status: forged
verified_on: 2026-09-04
verified_against: next@16
applied: code
ab_verdict: better
proof: ab-paired
---

# A per-edit cap that was obeyed, over an artifact cap that was not

A game-production tool built on a React meta-framework keeps a shared
session-memory file for the parallel coding agents that work in its tree:
one line per entry, append-only, three entry kinds. Its standing instruction
file states two rules for that file in the same paragraph. Each session
appends **at most two lines**. The file stays **under about two hundred
lines**, and when it grows past that the oldest entries of the disposable
kind are the ones to prune.

This application is the amendment to
[prose-rule-drift](../techniques/prose-rule-drift.md) applied to that pair:
a bound on the edit beside a bound on the artifact, with only the first ever
observable in a commit.

## The two arms

The measurable was chosen before the run: **the number of commits in the
file's history that a check would flag**, under two different checks on the
same history. Both arms read the same commits with the same instrument, so
the comparison is paired.

- **Arm A — the per-edit view.** For every commit touching the file, the
  lines added, against the two-line append cap. This is what a reviewer of
  any single commit sees, and what a diff-reading hook could enforce.
- **Arm B — the artifact view.** For every commit, the file's total length
  at that commit, against the two-hundred-line cap. This is what the
  standing document actually asked for.

Before the arms were read, the instrument was run against cases whose
answers were already known: a backlog document in a sibling project that
states a three-hundred-line split rule and sits under it (must report
clean), and a page from an external machine-maintained wiki that states a
two-hundred-line cap and is over it by more than an order of magnitude (must
report over). Both came back as expected, and the seeding commits at the top
of the memory file's own history — bulk pastes of eighteen to forty-two
lines, before the append rule existed — tripped arm A, so the per-edit check
demonstrably sees a per-edit violation when there is one.

## What the arms said

| | commits | flagged |
| --- | --- | --- |
| whole history | 59 | A: 6 (all seeding, before the rule) · B: 26 |
| since the crossing | 26 | A: 0 · B: 26 |

The file crossed two hundred lines on 2026-08-19. Every commit after that
obeyed the append cap — twenty-four of them at exactly two lines, one at
one, one a one-line correction — and every one of them left the file over
its bound. One commit in the whole history removed a line, and it was the
correction, not a prune. The document's own remedy sentence, prune the
oldest disposable entries, had never been executed. At the time of the run
the file was forty-eight lines over, thirteen days after the crossing.

Arm A reports the history as clean from the day the rule applied. Arm B
reports a violation that began at a specific commit and was extended, by
its permitted two lines, by every compliant commit since. Same history,
same instrument, opposite verdicts, which is the amendment's claim measured:
the compliant edits *were* the violation.

## What the tree said about the standard

Nothing in the project read the file's length. The per-CLI gate typechecks
the whole tree and lints and tests only the files a session changed —
deliberately, so foreign in-flight work on the shared checkout does not fail
another session's gate. A rule about a shared file's total size has no home
in a gate designed to see only one session's diff, and that is not an
oversight in the gate; it is the shape the amendment predicts. A per-session
gate is a per-edit quantifier by construction, and the artifact rule needed
a check that reads the artifact regardless of who last touched it.

## What was shipped

The project's next change was made in the run, as the technique
prescribes: a check that reads the file's length against the cap and fails
closed with the document's own remedy printed beside the red, a `--prune`
mode that performs that remedy mechanically — dropping only the oldest
entries of the disposable kind, never the two durable kinds — and a call to
the check at the end of the per-CLI gate, so a red is seen by whichever
session next runs it. The prune was run once in the same commit to bring the
file to exactly its cap, removing forty-eight disposable entries and no
durable ones. The per-edit rule stays in the instruction file as prose; it
never needed a mechanism, because its violations were rare and its
compliance was never the question.

## What this realization cannot do

The check reads a line count, so it enforces the bound the document stated
and nothing about whether the lines kept are the ones worth keeping. The
document's ordering rule — prune the disposable kind first — is honoured;
its implicit rule that durable entries outlive disposable ones is only true
while the durable kinds stay under the cap by themselves, and the check
does not measure that. The gate runs when a session invokes it, not when
the file is appended to, so a file can sit over cap between one session's
append and the next session's check. That window is the fallback shape the
technique names, strictly better than prose and strictly worse than a
refusing appender, and there is no appending tool in this tree to put the
refusal in.

## Re-read 2026-09-04

Every citation re-resolved against the tree at its current head. The
standing rule is still the same paragraph (append at most two one-line
entries; prune the oldest disposable entries past about two hundred lines);
the cap check is present and invoked at the end of the per-CLI gate and as
its own package script; and the memory file sits at exactly two hundred
lines — the cap has held for the three days since the prune, which is the
smallest observation window that says anything and is recorded as such. The
tree's meta-framework moved one major since the first read, and the check
does not touch it.
