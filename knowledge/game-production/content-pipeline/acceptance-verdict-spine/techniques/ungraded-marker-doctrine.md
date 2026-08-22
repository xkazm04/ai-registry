---
layer: technique
type: technique
subject: acceptance-verdict-spine
technique: ungraded-marker-doctrine
status: forged
laws: [no-gate-self-certifies, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a producer reports its own success, an independent re-grade cannot resolve a checker, counting how much of a completion claim was actually verified]
---

# Ungraded marker doctrine

The named concern: **a producer's unverified claim of success must be structurally
distinguishable from a verified pass, everywhere it is read.**

This is the most transplantable idea in the subject. Any system that accepts a
self-reported outcome — a build agent, a content generator, an unattended worker, a
third-party importer — needs it, in any domain.

## The hole this closes

The standard defence against fabricated success is to re-grade on the receiving side:
whatever a producer submits, an independent checker grades it again, so a claimed
pass that the data does not support becomes a failure. Sound, and usually sufficient.

The hole is that **re-grading is conditional on a checker existing for that unit's
label**. For any unit whose label the receiver cannot resolve, the re-grade silently
does nothing and the producer's own status stands. The store then holds a mixture of
verified and asserted passes with no field distinguishing them, and every count
computed over it overstates what is known.

This is not a rare edge. It appears exactly where labels drift: legacy units that
predate the registered pipeline, synthetic namespaces written by a feature that keeps
its own lifecycle, ad-hoc rows from a one-off migration. In one measured case, a
sixth of the persisted rows for a mature content type carried labels the registered
pipeline never declared — every one of them a producer's word taken as a verdict.

## The four states, and why the fourth is a finding

Classify every (unit-type, label) pair into exactly one of four states — never a
silent fifth:

1. **registered** — a declared pipeline owns it; the independent checker resolves.
2. **bespoke** — a legacy or hand-written label with a checker registered explicitly
   for it, so the receiver can grade it even though no pipeline declares it.
3. **unservable** — genuinely ungradable on the receiving side, **recorded with a
   reason**. This is a stated limitation, not an oversight.
4. **unknown** — none of the above. This is **not an accepted state**. It is a finding
   that some write path is persisting rows nothing can grade.

The point of separating 3 from 4 is accountability. Both produce an unverified row;
only one of them has an owner who thought about it. A system with a growing
`unknown` population is losing coverage and does not know it.

## The marker

For any row the receiver could not grade:

- **Keep the producer's status.** There is nothing truer to replace it with, and
  overwriting it with a failure would be its own kind of lie.
- **Stamp the row's reason with a fixed, greppable prefix** that says it was never
  verified — the same token on every such row, at the start, uppercase, chosen so a
  plain text search over the store finds all of them.
- **State why**: no checker for this label in this namespace, or the recorded reason
  for a declared-unservable one.
- **Append the producer's own reported reason after a separator.** The claim is
  preserved and demoted to what it is: an input, labelled as self-reported.

The marker travels with the artifact wherever the artifact is read. That is the whole
mechanism: the gap stops being invisible and becomes countable, closable, and
regression-testable. A dashboard can show it, a query can trend it, a gate can refuse
to advance while it is non-zero.

## Decision rules

- **When you cannot verify, annotate — never silently accept, never fabricate.**
  Both alternatives are worse than a marked row.
- **When a whole namespace is ungradable, record the reason once at the namespace
  level** rather than per row, and make prefix matches resolve to it — otherwise the
  reason rots in a comment.
- **When an unattended process reports completion, report two numbers**: units
  verified, and units merely asserted. A completion claim quotes the verified one
  ([no gate self-certifies](../../../_laws.md#no-gate-self-certifies)).
- **When adding a new state, add it to the classification, not to the silence.** The
  four states are exhaustive by construction; if reality has a fifth, name it.
- **Do not fix label drift by renaming.** A unit label is usually a persistence key.
  Aligning names would orphan every existing row. Teach the receiver the labels
  instead — a bespoke checker registry can only ever *add* gradability, consulted
  after the registered pipeline so a registered unit always wins.

## When NOT to use this

- **When every unit is independently gradable.** Then the marker's population is
  permanently zero and the machinery is dead weight — but keep the assertion that it
  is zero.
- **When the producer is the authority by design** (a human curator recording a
  judgment they are accountable for). A signed human decision is a verdict; mark it
  as attributed, not as unverified.
- **As a way to pass a gate.** Marking a row ungraded does not make it acceptable. If
  the gate's meaning is "verified", an ungraded row is not a pass to it — the marker
  makes it honest, not compliant.
