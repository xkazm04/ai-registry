---
layer: technique
type: technique
subject: declared-process-graph
technique: panic-proof-numeric-fields
status: forged
laws:
  - gate-sees-target
  - unknown-is-not-a-value
shared_with: []
use_when: [a declared duration or size reaches a runtime conversion, a control plane must survive any document an author submits, a periodic node spins at full rate on a small declared period]
---

# Panic-proof numeric fields

A topology document is full of quantities: periods, timeouts, windows, queue
depths, byte thresholds, backoff bases. Each is written as text by an author and
each is eventually converted into the runtime's own representation — a duration
type, a sized integer, a capacity. Every one of those conversions has a domain,
and every value outside that domain is a fault at a place the author chose.

The consequence is sharper than "bad input". The validator runs **inside the
control plane**, before any process exists, which means the conversion that
faults takes down the component that supervises the whole graph — and a document
is submitted by a user. A single field is therefore a denial of service on the
system's most privileged process, reachable by anyone who may submit a topology.

## Probe at the boundary the runtime will actually cross

The rule is that validation performs **the same conversion the runtime will
perform later, on the same value, using the same fallible operation**, and turns
its failure into a named refusal. Not a range check that approximates the
domain: an approximating check passes exactly where the approximation and the
real conversion disagree, which is the entire set of cases the check was written
for ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

Concretely, for a duration expressed as a fractional number of seconds, the
domain excludes more than "negative": it excludes non-finite values, values whose
whole part overflows the representation, and — depending on the type — sub-unit
values that round to nothing. Each of those is a distinct message. For a size
expressed as a count times a unit, the multiplication itself is the boundary and
must be done in a checked form, because the overflow happens in the validator's
own arithmetic before any type conversion is reached; where the text admits an
integer, do the arithmetic in integers, and fall back to floating point only for
the fractional spellings, so the common case has no rounding at all.

**A saturating conversion is the same defect as a fault, pointed the other way.**
Where the fallible conversion panics, the lenient one silently clamps: a negative
or not-a-number value becomes zero and an infinite one becomes the maximum, so an
absurd declaration is quietly turned into the most permissive setting the system
has, or into the zero that means "no limit" or "no delay". Nothing fails, and the
running system is configured by an arithmetic accident. Every conversion in the
probe is therefore checked in *both* directions — the fault is refused and the
clamp is refused — and a value must be rejected before it reaches a cast that
would swallow it.

**Zero is a per-field decision and the probe carries it.** Zero is legal and
meaningful for some fields — a grace period of none, a rotation count meaning
keep only the live file — and is a fault for others, because a periodic timer
built from a zero period panics rather than ticking. Do not guess it from the
type and do not adopt one global rule: the probe takes the field's zero
disposition as an argument, so every call site states it and a new field cannot
inherit the wrong answer by omission. Place the zero check on the **converted**
value, after every unit-specific parse, rather than on the text: a value given in
a derived unit — a frequency that becomes a period — reaches zero by rounding, in
a spelling where no literal zero appears anywhere in the document.

The refusal names the node, the field, the value as written, and the reason the
value is outside the domain. "Invalid duration" makes the author try another
spelling; "value is not finite" and "value exceeds the maximum period" send them
to the right correction immediately.

**Probe every field, not the interesting ones.** The class is defined by *the
conversion*, not by the field's importance, so the enumeration must come from the
side of the code that performs conversions. A single helper that every numeric
field passes through — one for durations, one for sizes — is what makes the
coverage checkable by reading a list of call sites, rather than by hoping.

## The round trip is half the rule, and it is the half that gets skipped

A value that parses is not yet a value that is safe. It must also **render back
to its own textual form exactly**. Quantities in a topology document do not stay
in one place: they are echoed into a child's environment, written into a
persisted plan, printed in a status listing, and re-parsed at the other end. Every
one of those hops is a render followed by a parse, and a render that loses
precision produces a different value on the far side than the one the validator
approved.

The damage is not symmetric across fields. When the field is a **period**, a
lossy render of a sub-unit value is *zero* — and a period of zero is not a slow
timer, it is a loop with no wait in it, saturating a core for the life of the
deployment and delivering events faster than any consumer drains them. The
author declared a fast timer and received a spin. Nothing in the system reports
an error, because from every component's point of view the value was accepted,
rendered, parsed, and honoured.

So the grammar and the renderer are designed together:

- The textual grammar admits every value the type admits, at every magnitude the
  design allows — if the type can express a value the grammar cannot spell, that
  value cannot survive a hop, and it must be refused at the door rather than
  silently degraded later.
- The renderer emits the **coarsest unit that is still exact**. Coarsest for
  readability, exact as the hard constraint: a value that does not divide evenly
  into the coarser unit renders in the finer one, never rounded into the coarser.
- Validation asserts the round trip on the value in hand — render it, parse it
  back, compare — and refuses on mismatch. This is the one check that catches a
  renderer bug on the author's actual value rather than on the test suite's.

An unrepresentable value must never come out the other side as a definite one,
least of all zero ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## Decision rules

- When a numeric field is added, it is added through the shared probe helper. A
  field that reads a number directly out of the parsed document is the next
  incident.
- When a conversion is fallible in the runtime, it is fallible in the validator
  too — never unwrapped, never defaulted. A default substituted for an
  out-of-domain value is the parse-then-discard failure wearing arithmetic.
- When a value is legal in the type but meaningless in *this* field — a zero
  period, a zero-depth queue — refuse it explicitly and say what the field means.
  The type system will not do this, and the runtime will behave pathologically
  rather than fail.
- When the same quantity appears in two documents that must agree — a declared
  window and the backoff schedule derived from it — validate the relation, not
  only each side. Both can be individually legal and jointly absurd.
- When a bound comes from the platform rather than the design — a maximum
  representable duration, a maximum shared-memory allocation — state it in the
  refusal message. An author who is told the limit corrects once; an author who
  is told "invalid" bisects.

## When not to use this

Numbers inside a node's own opaque configuration block are not this technique's
business: the runtime does not convert them, does not know their units, and must
pass them through unread. The node validates them at its own start, and the
failure is a node failure, not a refused document.

A field that never crosses a conversion boundary — an untyped label that happens
to be numeric, a version count compared only for equality — needs the legality
check its kind gives it and nothing here. Applying the full probe to it is noise
that dilutes the call-site list the technique depends on being readable.
