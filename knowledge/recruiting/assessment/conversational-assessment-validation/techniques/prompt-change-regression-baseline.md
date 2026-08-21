---
layer: technique
type: technique
subject: conversational-assessment-validation
technique: prompt-change-regression-baseline
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [changing the instructions that drive an automated interviewer, a fix for one behaviour may have broken another, deciding what evidence a brief edit needs before release]
---

# Prompt-change regression baseline

A conversational instrument is validated *as a specific text*. Compliance
depends on a rule's exact wording, its position in the document and its
grammatical form, so rephrasing a passing rule for elegance produces an
unvalidated instrument that looks identical in review
([a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
The discipline that follows is a frozen baseline and a diff.

The question a validation run answers after a change is **not** "did the new
version pass". It is **"did anything that used to pass now fail"**. Those are
different questions and only the second catches the normal outcome of a brief
edit, which is that the targeted behaviour improved and something three
categories away quietly broke. Non-local regression is the rule here, not the
exception, because rules in a single document compete for a finite amount of
compliance.

## What a baseline is

A baseline is a complete stored run of the whole behaviour cast against one
exact instrument version: every conversation, every per-cell outcome, both axes,
the cast identity, the judge rubric version, and the thresholds in force. It is
not a headline number. A stored number cannot answer the diff question, and a
baseline that has been reduced to a number is a baseline that has been thrown
away.

A baseline is only worth what its fidelity to the production instrument is
worth. Where the harness runs a re-rendered copy of the shipped instructions
rather than the shipped text itself — a common and often necessary arrangement
when the instrument lives in one runtime and the harness in another — the copy
must be pinned by a **drift guard**: an automated check that fails the moment
the two diverge. The stronger arrangement, worth building, is a path that emits
the *exact* production text plus a test asserting the copy equals it, so the
copy is provably faithful and the exact path is available when it matters. And
every variant must be reachable: a variant that can only be produced by the live
application, because it composes stored data, needs a fixture harness of its own
rather than an exemption — otherwise the most complex instrument you ship is the
one you never test.

Three things pin a baseline, and all three must be recorded or the comparison is
invalid:

- **the instrument text**, byte-exact, including rule order;
- **the cast**, byte-exact — a regenerated cast is a different cast and its rates
  are not comparable to the previous run's;
- **the judge rubric and thresholds**, versioned, since a rubric edit re-opens
  every verdict it produced.

## Reading a diff

Compare cell by cell, and classify every change into one of four buckets before
anything else happens:

- **Intended improvement** — a cell the change targeted, now green. Necessary,
  and the least interesting result in the diff.
- **Non-local regression** — a green cell now red, in an area the change did not
  touch. This is what the technique exists for and it blocks by default.
- **Non-local improvement** — an untargeted cell that got better. Treat with
  suspicion: it is often the instrument becoming more conservative overall,
  which will show up as a benign-near-miss failure elsewhere.
- **Noise** — a cell that flips at a rate consistent with the measured
  run-to-run spread. Distinguishing this from a real regression requires knowing
  that spread, which means the baseline must have been run more than once before
  it was trusted.

The last bucket is the one that decides whether the whole practice survives. A
team that cannot separate noise from regression will either chase phantoms until
it stops running the suite, or dismiss real regressions as flakiness. Establish
the spread first — repeat runs of an *unchanged* instrument — and treat any
cell whose flip rate exceeds that spread as real.

## Procedure

1. **Freeze the baseline before the change**, over the full cast, with the
   instrument text, cast identity, rubric version and thresholds stored beside
   it.
2. **Establish run-to-run spread** by repeating the unchanged run at least
   enough times to bound it, and record the number of conversations behind it
   ([a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
3. **Change one thing.** A brief edit that moves a rule and rewords it produces
   a diff nobody can attribute.
4. **Re-run the identical cast** against the changed instrument.
5. **Diff cell by cell** and classify every change into the four buckets.
6. **Block on any non-local regression on the reliability axis**, without
   exception; on the quality axis, block by default and release only with the
   regression named and owned.
7. **Promote the new run to baseline only on release**, so an unshipped
   experiment cannot silently become the reference.
8. **Keep the rejected versions.** A wording that was measured and found to
   break something is a finding with permanent value; deleted, it is re-derived
   and shipped blind within two releases.

## The accept rule for an iterative fix

Repairing an instrument against its own failing cases is a hill climb, and hill
climbs overfit. The accept rule that keeps it honest has three parts and the
third is the one usually missing:

1. Read the failing transcripts and the judge's verbatim critiques, and propose
   the **smallest** change that could plausibly fix them. Large rewrites cannot
   be attributed and cannot be reverted precisely.
2. Re-run **the failing set plus a fresh random sample of cases that were
   passing.** Re-running only the failures measures nothing but whether you
   aimed correctly.
3. Accept only when the pass rate rises **and the regression count is zero.** A
   net improvement with one regression is not an improvement; it is a trade
   nobody was asked to approve, and on the reliability axis it is a breach.

Run the loop against the frozen bank, and validate the accepted result against
the rotating sample. A fix that holds on the bank and fails on fresh cases was
fitted to the test set.

## Decision rules

- **When a rule is reworded after passing, re-run.** "It means the same thing"
  is exactly the claim this technique exists to refuse.
- **When the diff shows improvement in the targeted cell and nothing else
  changed, be suspicious of the cast, not pleased.** A cast that only ever
  responds where you aimed is a cast with narrow coverage.
- **When two changes must ship together, run three diffs** — each alone and both
  — or accept that you cannot attribute the result. Bundled brief changes are
  the most common reason a regression cannot be traced.
- **When the cast must be regenerated, do it on a release boundary and re-baseline
  deliberately**, marking the discontinuity in the record. Never regenerate
  quietly mid-comparison.
- **When the same non-local regression appears for a second time under a
  different change, stop treating it as a regression and treat it as a
  structural property** of the instrument: two rules are competing, and the
  repair is ordering or removal, not wording.
- **When a change is urgent and the suite cannot run in time, the honest state
  is unvalidated, not passing.** Ship it if the business requires, with a named
  owner and the gap recorded — never by declaring a subset run sufficient.

## When not to use it

A baseline diff is worthless without a cast broad enough that non-local damage
has somewhere to show. Building the diff machinery before the behaviour bank
produces precise measurements of a narrow slice and a false sense of safety.
It also does not replace the ablation of a *new* guardrail: a diff tells you the
combined instrument regressed, while isolating which wording of which rule
caused it is a separate, deliberate experiment. And a baseline says nothing
about whether the instrument was ever good — it only preserves whatever state it
was frozen in, including a bad one.
