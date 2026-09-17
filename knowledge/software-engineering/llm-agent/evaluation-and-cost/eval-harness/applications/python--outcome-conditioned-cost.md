---
layer: application
type: application
subject: eval-harness
technique: outcome-conditioned-cost
stack: python
status: forged
verified_on: 2026-09-17
verified_against: python@3
applied: code
ab_verdict: better
proof: ab-paired
---

# The grader's outage, charged to nobody

This tree replays a simulated year of one user's history through a ladder of
memory designs and grades every answer with a deterministic judge that first
asks a model to extract the value a verbose reply asserts. The Python version is
witnessed by the harness being invoked as `py -m memory_year`; nothing pins a
minor version, so `python@3` is what the tree supports.

The seam was chosen to falsify the boundary this technique now draws: that a
failure is incomplete or scored by **whose** it is. If the harness charged its
own failures to the arms, the published ladder would carry them, and the
section would need a measured instance rather than a constructed one. It did
not, and that outcome is the result.

## What the tree did

Two paths could put a harness-owned failure on an arm.

The visible one is an `error` verdict the judge emits when it cannot grade:

evals/memory-year/memory_year/judge.py:188 "model judge required"

and the report's denominator keeps it:

evals/memory-year/memory_year/run.py:245 "scored = tot["

so an `error` would count against the arm. Across the thirteen published runs
the verdict count for `error` is zero on every row, so this path has never
fired on the ladder.

The silent one was the extraction step. When the extracting call threw, or came
back empty, the function returned an empty string and the judge fell back to
matching the raw reply, which is the reading extraction exists to replace. The
verdict changed and nothing recorded why. A constructed reply that states the
current value and narrates the old one scores correct with a working extractor
and stale with a failing one.

## Arm A and arm B

A is the judge at the prior commit. B returns a distinct no-value on failure and
marks the verdict:

evals/memory-year/memory_year/judge.py:89 "return None     # the judge failed, not the design: judge_value marks the verdict"
evals/memory-year/memory_year/judge.py:106 "judge-degraded"

and the report counts it beside the headline:

evals/memory-year/memory_year/run.py:248 "judge-degraded verdicts (extraction failed, raw reply judged; the judge's failure, not the arm's)"

**Target:** degraded verdicts are visible and counted. **Floor:** no verdict on
any published run moves.

Both arms re-judged the cached answers of all thirteen published runs:
**2,158 judgments, 0 verdict changes, 0 degraded**, with 521 of 522 judge calls
served from cache. A throwing extractor and an empty one each produced a marked
verdict; a working one did not - the positive control, run before the zero was
trusted.

## The structural fact

The published ladder carries no silent judge failures, and until this change
there was no way to say so. That is the negative the technique predicts a
harness cannot produce on its own: a fallback that changes a verdict without a
mark is not an incomplete trial, it is an unrecorded one, and an unrecorded
failure has a count of "unknown", not zero.

## What this cannot do

The mark covers the extraction path only. A form-judged class is graded by a
model call with its own failure handling, and the arm-versus-harness boundary
for the designs under test - a store's writer timing out, a service failing
mid-replay - is recorded by each adapter, not by the judge. This change makes
one harness-owned failure visible; it does not enumerate the others.
