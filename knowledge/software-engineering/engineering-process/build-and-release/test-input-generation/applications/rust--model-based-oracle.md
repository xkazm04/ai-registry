---
layer: application
type: application
subject: test-input-generation
technique: model-based-oracle
stack: rust
status: forged
verified_on: 2026-08-31
verified_against: rust@1.96
applied: simulation
ab_verdict: better
proof: before-after
---

# Three defects that one arm could not have seen

An observability workspace defines a storage trait with three implementations —
an embedded file store, a hosted relational store, and a document store — and
holds all three to one shared conformance suite: a 1,900-line assertion set the
backends are run against, each from its own integration test. The suite is the
authority; no implementation is designated the reference.

That makes it the right tree to test the amendment's mechanism on, because the
mechanism is not really about *references*. It is about what an oracle run
against one implementation can and cannot see, and this tree ran the same oracle
against three and kept the history.

## The policies

**Policy A** — the single-arm run. The embedded store's conformance test is the
one that needs no external infrastructure: fast, deterministic, always green in
CI. It is the arm a team keeps when the others are inconvenient.

**Policy B** — as shipped. The same `conformance::run` against all three, with
ephemeral infrastructure stood up for the two that need it.

Three cases from this repository's own history, walked under both.

## Case 1 — caps that were advisory on the backend carrying production traffic

Usage caps were enforced by the trait's default check-then-insert: list the
rules, read usage, insert the event — three round trips with no lock spanning
them. **The embedded store overrode that default** with a single locked
connection. The other two did not.

Under policy A the suite is green, permanently, and correctly: the arm it runs
against has an override that makes the default's race unreachable. Under policy
B it is not, and the fix commit records the measurement — eight simultaneous
admissions against a cap of four admitted 8/8 before, exactly 3 after, every
run.

This is the sharpest of the three because the override is what hides it. The
single arm is not merely silent; it is *actively reassuring*, because the
implementation it exercises is the one that already solved the problem.

## Case 2 — a surface that returned "not implemented" only where it mattered

The trace surface worked on the embedded store and answered 501 on the hosted
one until a commit implemented it there. Policy A cannot distinguish "this
behaviour is implemented" from "this behaviour is implemented in the arm I run",
and the suite asserts the behaviour, so it passes.

## Case 3 — capability gaps that had been arriving as data

A commit introduced a distinct unsupported-capability error so that gaps "stop
masquerading as data". A gap is only visible as a gap when two implementations
are asked the same question and one of them cannot answer it; with one arm there
is nothing to compare against, and an empty or defaulted result reads as an
answer.

## Verdict, and what would falsify it

Policy B caught all three; policy A ships all three. The claim is falsifiable and
was checked: if any case had been reachable from the embedded arm alone, it would
not count — and case 1's own commit message states the embedded arm overrode the
defective path, which is why it could not be.

The generalisation the technique needed: **an oracle cannot see a defect in an
implementation it does not execute**, and the case where that bites hardest is
the one where the executed implementation has *already fixed* the defect
privately. A campaign reporting "the conformance suite is green" is reporting on
the arms it ran, and the count means nothing without them.

## The structural fact, which is a negative one

This tree does not have the failure the amendment is written against, and that
is the finding. There is no designated reference implementation here — the
authority is a written suite, which is the configuration the technique calls
correct — and consequently the amendment's ledger clause, separating "our port
diverged" from "the reference is wrong", has nothing to attach to. The mechanism
transferred; the vocabulary did not.

What did transfer, and is worth stating for any tree in this shape: the second
arm's value is not that it double-checks the first. It is that the two
implementations are **not invariant to the same things**, and every property one
of them accidentally guarantees is a property the suite is not actually testing.

## What this realisation cannot do

The three cases are historical, so the comparison is before/after rather than a
control — the arms were not run side by side today, and the counterfactual
"policy A would have shipped this" rests on reading each commit's account of why
the embedded arm was green. Case 1 states it explicitly; cases 2 and 3 are
inferred from the change's shape. No project code was modified for this
application.
