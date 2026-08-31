---
layer: application
type: application
subject: health-checks
technique: three-state-outcomes
stack: node
status: forged
verified_on: 2026-08-31
verified_against: node@22
applied: experiment
ab_verdict: not-better
proof: structural-only
---

# Per-class not-computed, already load-bearing in a lint ratchet (Node)

This realization was opened to test the technique's per-class amendment — that a
check reporting several finding classes needs the third state on each class, not
only on the check. The tree already implements it, in two independent
instruments, which makes the row a corroboration rather than an adoption.

## The instrument

A Next.js app carries a **ratchet** (`scripts/ratchet.mjs`) that measures several
independent counters into one baseline file (`.ai/ratchet-baseline.json`) and
fails when any bucket rises. The buckets come from different tools —
per-rule lint counts, typecheck errors, unused-export counts, a documentation
coupling scan — so the check is exactly the multi-class shape the amendment is
about: one verdict over classes whose inputs can fail independently.

## The three obligations, all present

**A not-computed marker distinct from zero.** Every instrument routes measurement
failure to a shared `cannotRun(...)` path with its own exit code
(`EXIT_CANNOT_RUN`), never to a count. The distinction is drawn precisely where
it is easy to lose: the lint pass separates "the tool exited non-zero because it
found problems" from "the tool produced no output at all" —
`if (!err.stdout) cannotRun(...)` (`ratchet.mjs:104`) — and again on the parse,
where unparseable output is a measurement failure rather than an empty result
(`:112`). The coupling scan draws the same line on its own exit codes (`:265-277`),
with a comment naming why the second case must not be lost to the bucket
comparison.

**Exclusion from the baseline.** `--update` refuses to run together with `--only`
(`:341-345`), and the stated reason is the amendment's third obligation:

> a partial re-baseline would silently delete the skipped buckets.

A class that was not measured does not get to participate in the number that
future runs are judged against. Without that refusal, one scoped run would write
a baseline in which every unmeasured bucket reads zero, and the ratchet would
thereafter pass or fail on a comparison against classes nobody looked at.

**A self-assertion before reporting.** The lint pass asserts its population is
not empty before trusting its counts (`:115`) — an instrument that walks nothing
and reports zero findings is the failure the marker exists to prevent, arriving
through the input rather than the output.

The baseline file states the same discipline at the policy level: it is "NEVER
auto-updated by a pipeline — a baseline that rewrites itself is a recorder, not a
gate", and every moved number must say in its commit message whether the finding
was fixed, deleted, **or the counter broke**. That third option is the per-class
unverifiable spelled out in a review instruction.

## The finding ledger draws the same line one level down

The same tree's findings ledger (`.ai/findings.json`) carries a state vocabulary
in which two entries exist only to keep absence from reading as resolution:

- `expired` — "not re-found by a sweep **that actually re-examined its
  location**"; and
- `needs-reanchor` — "the anchor file no longer exists. NOT fixed — **absence
  also happens when the sensor never ran**."

And its scan block discloses that its 190 findings came from a per-context cap of
five "by construction — a per-context CAP, not a measurement of how many defects
each context holds", with the disclosure justified on the ground that an
undisclosed cap over an unstable order rotates which findings anyone ever sees.
That is a truncated enumeration refusing to publish its count as a measurement —
the amendment's case, at the level of the sweep rather than the class.

## The arms

Arm A is the shipped ratchet. Arm B is the shipped ratchet with the amendment
applied: a per-class not-computed marker, excluded from totals and from
thresholds.

| | Arm A (shipped) | Arm B (amendment applied) |
| --- | --- | --- |
| classes whose measurement failure folds into zero | **0** | **0** |
| classes excluded from the baseline when unmeasured | all | all |
| edits required to reach Arm B | — | **none** |

Arm B is Arm A. The verdict is `not-better`, and it is not a defect in the
amendment — it is the strongest form of support the amendment could have had
short of a controlled deployment. Two instruments in a tree with no connection to
the source that produced the rule reached it independently, from the same
pressure: a count that was never taken must not be published as a count of zero.

## What this realization cannot do

It measures structure, not behaviour: no run was forced into the `cannotRun` path
to observe the ratchet's downstream reaction, so the exclusion is verified as
written rather than as executed. It also cannot speak to the amendment's harder
case — a class that is *partially* computed, where a paginated enumeration
returns some of a lane and the absence claim is unavailable while the presence
claims are fine. Every not-computed path in this tree is all-or-nothing at the
instrument level, so the partial case remains supported only by the source.

**Return condition:** re-test when a checker here grows a finding class whose
enumeration can truncate mid-scan rather than fail outright.
