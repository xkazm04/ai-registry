---
layer: application
type: application
subject: funder-research
technique: adversarial-verification-pass
stack: process
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# The adversarial verify stage and its real-versus-open split in a grants research engine

The grant-writing product's research pipeline runs discovery, structural
validation, corpus dedupe, then a second independent CLI pass
(`verify.ts` `adversarialVerify`) that must fetch the claimed source and return
`{real, openNow, reason}`. The pass is built as the technique asks: it never
throws, an unparseable or errored verdict becomes a refuted one, the verdict is
validated against a declared schema, and it shares no context with discovery.
The reachability probe is separate and only moves confidence.

## What the seam showed

The technique separates "the program exists" from "applications are open now"
and says a real-but-not-open row is intelligence, never the actionable corpus.
The verdict carried both booleans, but the pipeline dropped on `!real` alone.
A real, not-open candidate was staged as pending with a small confidence
bonus, and the review surface showed it under a "real" badge beside the
approve button. One approval promoted it into the live corpus as an applyable
grant. The two verdicts were computed and then collapsed into one boolean at
the gate.

## A and B

A was the pipeline as found. B drops a real-not-open candidate from staging
with its own `real-not-open: <reason>` entry in the run log, distinct from
`adversarial-refuted`. The seam was chosen to falsify "the stage is
conformant", since the fail-closed, schema and independence properties all held
on reading. Target: a real-not-open candidate staged, A 1 of 1, B 0 of 1 with
the reason logged. Floor: 98 research tests green with the new case, hooks
green; the new test fails on the old pipeline.

## Not measured

The real share of discovered rows that are real but not open, and whether a
reviewer wanted those rows as a watch list. The run log keeps them but nothing
reads them back into a funder-intelligence view.
