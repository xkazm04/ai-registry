---
layer: technique
type: technique
subject: document-text-extraction
technique: structural-amplification-caps
status: forged
laws: [derivation-names-recomputation, absent-guard-is-loud]
shared_with: []
use_when: [a few kilobytes of upload made the process allocate gigabytes, adding a repeat or reference construct to a container reader, someone asks to make a safety limit configurable]
---

# Structural amplification caps

Document containers are compression formats with a schema on top. They repeat,
they nest, they reference, and every one of those constructs is a multiplier
between the bytes a user supplied and the bytes a reader materializes. The
quantity that matters is the **amplification factor** — materialized over
supplied — and the caps that guard an untrusted parse in general (a byte cap at
intake, a nesting-depth cap in the deserializer) do not bound it. They bound the
numerator's input, and the attack is entirely in the multiplier.

The shapes are ordinary and none of them requires ingenuity: a grid declaring a
few million addressable positions from two attributes; a repeat count that
materializes one content-bearing cell ten million times; an entry that
decompresses to a thousand times its stored size; a reference cycle a naive
walker follows forever. Each is a handful of bytes to write.

## Two caps on one expansion

**A cap on the count of an expansion does not bound the memory the expansion
costs, because each unit of the expansion may carry a payload.** Four million
grid positions is a number; four million grid positions each holding a
kilobyte of text is forty gigabytes. So every expansion construct gets two
caps: one on the **count** it may produce, and one on the **total payload
bytes** it may duplicate.

The two are independent in both directions, which is why one is not enough:
a document can saturate the count cap with empty positions (cheap, legitimate,
and common in real spreadsheets) and it can saturate the payload cap with a
small count of enormous cells. Sizing only for the case you happened to see
first leaves the other unguarded.

The generalization, worth stating because it applies to constructs this subject
has not met yet: **whenever a cap governs a quantity that can be multiplied by
another unbounded quantity, cap the product too, or cap the second factor.**
Count of entries and bytes per entry. Depth and branching. Number of references
and the size of what is referenced.

## An estimate is not a cap when the input supplies a term in the estimate

The two-caps rule above assumes the guard can compute the quantity it is
guarding. There is a nastier shape, and it defeats a cap that is watching
exactly the right quantity: the guard computes that quantity from a **declared
field the supplier controls**, so the arithmetic itself is attacker-supplied.

The canonical instance is a declared rate used as a divisor. A container states
a nominal rate; the guard estimates the materialized duration as units over
that rate and compares it against a duration ceiling. Inflate the declared rate
and the estimated duration shrinks to nothing while the actual unit count — and
therefore the actual buffer — is unchanged. The cap passes, the allocation
proceeds, and the guard was watching the correct concept the whole time.
Nothing about "cap the product too" catches this, because the product was
computed from a lie.

So the rule is about **units, not concepts**: a guard must be expressed in the
unit the allocator will actually request, and it must derive that unit from
values the supplier cannot restate. Where a declared field is unavoidable —
sometimes it genuinely is the only way to interpret a container — it does not
become trustworthy; it becomes a second thing to bound, and the allocation
still needs its own ceiling in bytes underneath the estimate. Two guards, one
on the interpretation and one on the allocation, and the second is the one that
must hold when the first is fed a fabricated input.

The same reasoning settles **where** the check goes, which is the other half
attackers exploit. A declared shape can be enormously cheaper to transmit than
to materialize — a sparse structure carrying its own dimensions is a few
hundred bytes describing hundreds of gigabytes — so a check placed after the
materializing call has already lost. The guard belongs **before** the
allocation, reading the declaration, refusing the request without ever asking
for the memory. A post-allocation check is not a late guard; on this shape it
is no guard at all, because the process is gone before it runs.

Two consequences worth stating for a reader sizing a real system. Every
expansion **stage** gets its own ceiling rather than one ceiling for the
pipeline, because the stages are defeated independently and a single end-to-end
number cannot say which one failed. And a ceiling that can be set to a
disabling value should say so where it is defined, together with the population
for whom disabling it is defensible — a limit whose off switch is undocumented
gets turned off by someone who believes it is a tuning parameter.

## Caps are a system; state the relationships

Caps chosen one at a time do not compose. The property you actually want is
that **saturating any single cap lands inside the next budget outward** — a
maximally expanded part fits within the per-document budget, a maximal document
fits within the process budget — so that no combination of individually legal
values produces an illegal total. That relationship is a design decision, and
it is invisible in a list of constants. Write it down beside them: which cap is
derived from which, and what the containing budget is.

## A derived cap names its derivation, and a test pins the constant

Caps derived from a measured per-unit cost are the good kind — a node cap sized
from the measured bytes a node costs in the reader's own representation is a
cap you can defend and re-derive. They are also the kind that rots invisibly,
because the derivation depends on a measurement in code that will change for
unrelated reasons: a field added to a node, a different string representation,
a library upgrade that changes an allocator's behaviour. The constant stays;
the reality moves; the cap silently stops meaning what it was chosen to mean.

So a derived cap carries two things
([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)):

- **the derivation, in prose beside the constant** — "sized from the measured
  worst-case per-node cost so that a saturating part stays inside the
  per-document budget" — because a bare number can only be cargo-culted, and
  the next person to raise it needs to know what they are trading;
- **a test that measures the per-unit cost the derivation assumed**, failing
  when it drifts past a stated margin. This is the part almost nobody builds,
  and it is the part that makes the derivation durable. Without it the
  recomputation path is documented and never invoked, which is a discrepancy
  with no arbiter — the exact condition the law names.

## Crossing a cap is a hard failure, never a truncation

The most tempting mistake in this technique is also the one that destroys the
rest of the subject: on hitting a cap, stop expanding and return what you have.
It feels graceful. It produces **output that is missing content and looks
complete** — the precise defect the entire subject exists to prevent, arrived
at from the safety code rather than the extraction code.

Two consequences follow, and both are load-bearing:

- **A cap crossing produces a refusal that names the limit and what exceeded
  it.** "Resource limit exceeded: repeat expansion, 6.2 million cells against a
  4 million cap" lets an operator tell hostile input from a cap that is simply
  wrong for their corpus. "Document too complex" tells them nothing and
  generates a support thread.
- **A cap crossing is fatal in every context, including recovery paths.** A
  reader that tolerates damaged optional parts — skipping a broken sub-document
  and continuing — must not let that tolerance swallow a limit crossing. The
  recovery logic cannot distinguish "this part was corrupt" from "this part was
  a bomb", and an attacker who learns that a limit is recoverable has learned
  that the limit is advisory. Mark limit failures as non-recoverable at the
  type level so the recovery path cannot absorb one by omission.

## Non-configurability is earned by distance

The instinct is to make every limit a setting. Resist it, and resist it with a
stated criterion rather than a preference:

> A cap is safe to freeze as a constant exactly when the legitimate
> distribution sits **orders of magnitude** below it. Where legitimate inputs
> come within a small factor of the cap, it is not a safety limit — it is a
> tuning knob, and you have chosen the wrong cap.

Freezing is the stronger position when the criterion holds, and it holds for
the same reason
[absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud) argues for
self-engaging guards: a configurable cap converges on whatever each deployment
left it at, most deployments leave it at the default, and the ones that raised
it did so under production pressure at 3am with no measurement. A constant is a
guard that engages everywhere, including in the installations nobody tuned.

The criterion also tells you when you have designed badly. If real documents
are brushing your cap, do not raise it — that is treating the symptom. Ask why
your reader materializes something a legitimate document produces at that
scale, and whether the expansion needs to be materialized at all.

## When not to use this

Caps belong on **materialization**, not on traversal. A reader that streams an
expansion — emitting cells as it walks them, never holding the expanded form —
has no amplification to bound and does not need the cap; the bound belongs on
whatever accumulates downstream, and putting it in both places produces a
refusal for documents that were never a threat. Before adding a cap, name the
buffer it protects. If you cannot name one, you are guarding a number rather
than a resource.
