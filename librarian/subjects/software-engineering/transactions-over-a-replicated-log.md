---
subject: transactions-over-a-replicated-log
domain: software-engineering
last_touched: 2026-09-03
touched_by: intake
dry_streak: 0
---

# transactions-over-a-replicated-log

First touch: 2026-09-03, `/intake` run `intake-rowboat-0903` over a vendor
repository read as a system. Not selected from the worklist - reached because
a design decision in the source converged with, and then inverted, this
subject's `same-value-still-conflicts`.

## State

Forged 2026-09-02 (go stack). One amendment added, no other change.

## 2026-09-03 - intake, rowboat

**Amendment to `same-value-still-conflicts`: the mergeable plane inverts the
rule, and still records.**

The source's collaborative asset plane contends on a *document* rather than a
key, and the store owns a content-level three-way merge, so a stale base is
an input to a merge that usually succeeds rather than a refusal. That is a
real inversion of the technique's central rule, and the amendment states its
preconditions narrowly so it cannot be read as permission to soften the main
rule: the merge must be a property of the store (so every writer gets the
same verdict), its outcomes must be pinned by shared fixtures, and an
unresolvable merge must return as a normal outcome carrying everything needed
to retry in one round trip.

**The identical-write case survives the inversion in a different currency.**
The source writes a change-set for a clean merge that lands byte-identical
content, so the second writer stays attributed. The technique refuses an
identical write for serialization correctness; the source records one for
attribution. The shared root - **a write's record is about the decision, not
about the bytes** - is banked as a law lead in the source note, not minted:
two sightings, and a law wants convergence across runs.

## Open

- The law lead above. Return condition: a third independent sighting.
- The subject is still single-stack (`go`). This amendment cites a second
  system but adds no application, because no fleet project runs a mergeable
  multi-writer document plane - checked across the four trees the operator
  authorized, with the instrument asserted against a known positive first.
