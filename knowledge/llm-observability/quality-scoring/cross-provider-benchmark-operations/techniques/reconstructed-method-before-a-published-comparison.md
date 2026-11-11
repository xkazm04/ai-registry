---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: reconstructed-method-before-a-published-comparison
status: forged
laws: [estimation-announces-itself, never-present-absence-as-an-answer]
shared_with: []
applied: blind-ab
ab_verdict: better
use_when: [placing a number you measured beside a number someone else published, a competitor's or vendor's benchmark harness is not public, deciding whether a published figure may sit in your scorecard as a column, a published leaderboard or results page may change after you read it]
---

# Reconstructed method before a published comparison

Every other technique in this subject assumes you ran both sides. You froze the
cases, declared the matrix, stamped the pinning, and the two numbers in a row
came out of one instrument. The comparison that gets quoted most often is the one
where that is false: your number, measured here, beside a number someone else
published, measured by a method you did not run and often cannot see. The
golden path's rule for a method change is "never compare without re-baselining".
Against a published number you cannot re-baseline, because the other method is
not yours to re-run. What is left is to **write the other method down, before you
compare, and say where the writing ran out.**

## The rule

Before your number is placed beside a published one, produce a **method
reconstruction** for the published side and keep it with your result as a pinned
artifact. It names, for each element the comparison depends on, what the
publisher used and where you learned it:

- **The number itself**, copied with the page it came from and the date you read
  it. Results pages are edited, leaderboards re-rank, and a figure whose fetch
  date is missing cannot be told apart from the figure that replaced it.
- **The metric definition**: what counts as a pass, how partial answers score,
  what the denominator is, whether the reported value is a mean, a best-of or a
  single run.
- **The cases**: which dataset, which version or split, how many, whether any
  were excluded and why.
- **The configuration**: model and version, sampling settings, hardware or tier,
  and the commands, copied verbatim when they were published rather than
  paraphrased.
- **The grader**, when one scored the outputs: rule, script or model, and which.

Each element is marked **stated** (the publisher wrote it down), **inferred**
(you reasoned it from something the publisher wrote, with the reasoning), or
**unknown**. Unknown is a legitimate entry and the most important one. "Their
harness is not public, and no raw results or automation were released" is a
finding about the published number, and it belongs in the reconstruction in so
many words.

## Where the gaps go

The reconstruction is not a methodology appendix. An appendix is separated from
the number by a scroll, and the comparison travels without it
([handicap-disclosure-in-the-result-row](./handicap-disclosure-in-the-result-row.md)
makes the same argument for your own concessions). The gaps travel in the
comparison sentence or on the comparison row:

- **Every load-bearing element stated, and the harness re-runnable**: re-run it
  yourself if you can afford to, and compare your run to your run. If you cannot,
  compare to the published number with the reconstruction pinned beside it. This
  is the ordinary case for a public benchmark with a released harness, and it
  needs no ceremony beyond the fetch date.
- **Some elements inferred**: the comparison may be shown, and it is labelled
  reconstructed, naming the inferred elements. "Against their published 85%,
  reconstructed: split and grader inferred from the paper, harness not public."
- **The metric definition or the case set unknown**: no side-by-side number. The
  two figures do not share a unit, and printing them in adjacent cells asserts
  that they do. Place the published system qualitatively, or measure it yourself
  under your own method, which turns it into one of your own targets
  ([target-matrix-runs](./target-matrix-runs.md)).

The asymmetry to watch for is in your own favour. A comparison you win, against a
method you reconstructed, is the one most likely to be won by the reconstruction:
an inferred split that is easier, an inferred grader that is more lenient, an
unknown exclusion list that removed the cases the other system did well on. When
your margin is smaller than the uncertainty an inferred element could carry, say
that the comparison does not resolve, rather than reporting the margin
([_laws: estimation-announces-itself_](../../../_laws.md#estimation-announces-itself)).

## Decision rules

- **Reconstruct before you run, not after you see the result.** A reconstruction
  written after the comparison came out well is written by someone with a reason
  to stop looking.
- **An unknown is never filled with your own choice silently.** If you scored
  with your grader because theirs is unknown, the grader row reads "unknown; ours
  used in its place", not "ours"
  ([_laws: never-present-absence-as-an-answer_](../../../_laws.md#never-present-absence-as-an-answer)).
- **A relayed number inherits the relay's gaps plus its own.** A figure quoted by
  a third party, a talk or a summary, without the publisher's page, has an unknown
  method by default until the original is found and read.
- **A vendor measuring itself on its own cases is one stated method and one
  unknown independence.** Record both; do not upgrade it to a comparison because
  the numbers line up.
- **When the publisher later releases the harness, re-run and supersede.** The
  old comparison stays on record with its reconstruction, marked superseded, so
  the decision it supported can still be read as it was made.

## When not to use it

A comparison between two of your own runs needs the rest of this subject, not
this. A published figure quoted as background ("a public benchmark reports
roughly this range") and never set beside a number of yours needs only its
source and date. The technique earns its cost where a published number becomes a
column, a baseline or a claim of superiority.
