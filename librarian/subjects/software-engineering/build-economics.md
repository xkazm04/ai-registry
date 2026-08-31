---
domain: software-engineering
subject: build-economics
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# build-economics

First touch: [[2026-08-31-remeda]], intake of a utility library repository mined
for its agent-facing reference documents. `build-measurement` amended in two
places; no new techniques.

## What the gap actually was

Not an omission and not a wrong claim. `build-measurement` is thorough — three
instruments, a scenario-labelling discipline that insists the predicate travels
with the number, a before/after rule with one-variable-per-comparison, and a
loud-failure clause for the instruments themselves. Its scenario axes ask **which**
build (cold / warm / incremental), **which** variant, **which** machine, and
**when**.

The missing axis is **whose**. Every instrument in the subject is standing inside
the repository being measured, and some of the costs a repository creates are paid
entirely elsewhere: a published artifact imposes compile cost on everything that
consumes it, that cost accretes by exactly the mechanism the subject already
describes, and no instrument named is positioned to see it.

What makes it a real gap rather than a scoping choice is that the cost is invisible
to *every other* signal too. A change that doubles a consumer's compile time is
correct, tested, and green — there is no assertion it violates and no suite that
gets slower. `gate-sees-target` in a place the subject had not looked.

## The measured half

The source supplies the mechanism and a number for why the intuitive approach
fails. Measuring type-level cost from inside the project carries the whole codebase
as baseline overhead: **~115,000 symbols before the measured change is reached**,
against an effect worth low single-digit percent — unresolvable inside that much
noise, and cleanly resolvable through the published artifact. So the harness is a
separate minimal project consuming the build output the way a consumer does, never
the source tree.

Two protocol requirements landed with it, and one folded in from a separate
candidate in the same source: rebuild before measuring and **check that you did**
(the harness reads an artifact, so a stale one silently reports the previous
version's cost) — scoped to the inputs that actually reach the artifact, because a
freshness check that counts test files cries wolf until someone disables it. Plus
warm-up-and-discard.

## The second amendment: gate on the leading indicator

A separate section, because it is a different claim. Among the figures such a
harness reports, the count of intermediate compiler work items moves **first** —
before wall time or memory budge. A metric that only shifts once the cost is
perceptible is a detector, not a gate: it fires after the change has shipped and
after the decision that caused it has been forgotten. Same argument as the
subject's own regression baseline, one level finer.

## Applied: unmeasurable, and the instrument is named

Three real cases from a managed project's Rust workspace under both policies. The
producer/consumer crate boundary exists and policy B has a clear prediction there;
the run's own two arms (1m19s vs 5m33s, same crate, same hour, both labelled
"warm") support the *predicate* half and explicitly do **not** test the vantage
half; and the application binary is a leaf where the rule correctly declines,
which is what a well-bounded rule should do somewhere.

Verdict `unmeasurable` rather than `better`, because the core claim was reasoned
and not run. Instrument named as the vocabulary requires: a minimal crate
depending on the engine, timed after an interface change against a body-only
change — which separates the two costs the single producer-side number currently
fuses. Nothing in the fleet has it, and it is cheap.
