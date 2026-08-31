---
layer: application
type: application
subject: quality-gates
technique: false-positive-economics
stack: rust
status: forged
verified_on: 2026-08-31
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# A proposal gate where the death spiral has nowhere to start

A Rust scraping and data-pipeline service maintains a governed taxonomy: a
registry of canonical categories that several downstream apps key their
records on. An agentic step proposes new entries to that taxonomy by reading
scraped material. This is a gate over machine-generated content, which is the
case [false-positive-economics](../techniques/false-positive-economics.md)
now carves out — and the tree turns out to satisfy the carve-out by
construction, which is why it is worth writing down.

## The structural check: how many ways can a proposal go live by itself?

The technique's second precondition is that the power to close a finding has
been taken from the party being gated. That is a countable property, so it was
counted rather than asserted.

Two numbers, because the first is not the measurement. A grep for sites
setting the registry's `enabled` flag true returns **12**. Hand-verifying each:
compile-time seed entries, unit-test fixtures, and unrelated configuration
defaults in other subsystems account for all twelve. Production code paths by
which a machine-written proposal becomes live without a human setting the flag:
**0**.

The gate is fail-closed at the reader, not at the writer. A record must opt in
with an explicit enable; absent or false means it is not part of the live
taxonomy, and a record whose provenance field is missing defaults to
*proposed* rather than to *approved*. The proposer writes the record with the
flag false and emits, in its own result payload, a next-step instruction for a
human to review it and set the flag. It has no path to set it itself.

## Why this is the technique's case and not the ordinary one

The subject being refused here is a **candidate nobody was entitled to have
shipped**. When the proposer is wrong, the cost is one wasted generation and
one reviewer glance. No author is told they are wrong about their own work, so
step 1 of the death spiral — the author who knows they are right and
suppresses the finding — has no one to run through. The trust budget the
spiral consumes is never debited.

The consequence, which is the point of the amendment: **the proposer's
precision is a cost property here, not a survival property.** Tuning it for
precision before letting it write would be optimising the wrong number. What
its precision buys or costs is reviewer-minutes times proposal volume, traded
against the recall of a proposer that is too conservative to suggest a real
missing category.

## The fail-closed default is doing the work, and it was built for governance

The comment guarding the default calls it a governance rule, not a precision
rule. That is the structural fact: the design was chosen so that a taxonomy
change requires human intent, and the precision economics fall out of it for
free. Nobody reasoned about false-positive rates when writing it, and nobody
needed to — the shape of the gate made the rate cheap.

## A and B, and why the verdict is `unmeasurable`

- **A** — treat the proposer as an author-facing detector: hold it to a
  precision bar before it may write.
- **B** — treat it as a proposal filter: let it write freely into a
  default-denied state, and price its precision in review time.

The tree already implements B, so there is no code change to make and no
behavioural difference to observe. The structural arm is measured and reported
above; the behavioural arm is not runnable, and saying so is the honest
outcome rather than dressing a confirmation as an improvement.

**The instrument that would make it measurable** — required by the method
before this word may be used — is per-proposal review-outcome telemetry: a
count of proposals emitted, accepted and rejected per proposer run, and the
reviewer time spent per accepted entry. The service currently emits counts of
new and changed records but records no acceptance outcome, so the denominator
that would let anyone read the proposer's precision against the base rate of
useful proposals does not exist. Until it does, the proposer's precision is
unknown in both arms, and no threshold on it can be defended.

## What this realization cannot do

It cannot generalise to the service's other gates. This is one governed
registry with one proposer; the same tree runs approval flows in other
subsystems whose promotion predicates take an `accepted` argument and permit
promotion from a validated state without it. Those are a different shape and
were not examined here.

It also proves nothing about the amendment's *first* case — a gate shipping at
low precision because the artifact is machine-generated — because this gate
has no measured precision at all. It corroborates only the second: that
removing the author's power to close a finding removes the spiral's engine.
