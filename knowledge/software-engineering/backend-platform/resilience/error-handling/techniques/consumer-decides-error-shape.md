---
layer: technique
type: technique
subject: error-handling
technique: consumer-decides-error-shape
status: forged
laws: [verdict-survives-boundary, one-authority-per-vocabulary]
shared_with: []
use_when: [choosing between a closed failure enumeration and an opaque aggregate, a reusable unit's callers cannot branch on why it failed, deciding where a failure representation should be converted, an application-shaped error type has leaked into something other teams depend on]
---

# The consumer decides the error shape

[taxonomy-design](./taxonomy-design.md) and
[structured-propagation](./structured-propagation.md) describe the *vertical*
journey of a failure: born deep, enriched on the way up, decided high, and the
asymmetry that loss is one-way. Both assume a single unit of ownership — one
codebase, one release, one set of authors who can change every layer at once.

There is a second axis, and it decides the representation before the vertical
rules get a vote. **Failure shape is a property of who consumes it, not of
where it is raised.** A unit whose failures are consumed by code released on a
different schedule, by authors who cannot edit yours, owes a different artifact
from a unit whose failures die at a door inside its own release.

## The two shapes, and what each one is for

**A closed enumeration, crossing a published boundary.** Where the two sides of
a boundary ship independently, the category must be a value the far side can
branch on: an enumerated kind with stable membership and a stable serialized
spelling, exactly as [taxonomy-design](./taxonomy-design.md) specifies for the
cross-boundary case. The far side cannot add a category, cannot read your
source to learn the set, and cannot wait for your next release to get the
distinction it needs. Every category it may need to act on must already be in
the vocabulary you published.

**An opaque aggregate, inside a unit that terminates in a door.** Where the
consumer of the failure is a door in the same release — a request handler that
returns a status, a command that exits, a job that records and moves on — the
work of maintaining an enumeration buys nothing that the door will spend. One
aggregate type that any failure converts into, carrying the accumulated context
trail and the preserved cause, is cheaper to write and strictly more
informative to read. Nothing branches on the category, so the category costs
what it costs and returns nothing.

Most systems are **both**, in one tree: the reusable interior publishes
enumerations, the outermost assembly aggregates. That is not a compromise, it
is the correct answer applied twice, and the boundary between the two regions
is exactly where the conversion belongs.

## The rule the corpus already implies and never states

The subject's own governing rule is *classify on structure, never on prose* —
and the reason is that prose is not a contract, so a consumer that branches on
it is a correct program today and a silent misclassifier after the next
upstream change.

**A published unit that returns an opaque failure forces every one of its
consumers to do precisely what that rule forbids.** They still have decisions
to make — retry or not, re-authenticate or not, tell the user to edit or to
wait — and the only discriminator they were given is a rendered message. Some
of them will match on it. The unit's author never sees the classifier that
results, because it lives in a repository they do not read, and it breaks on
their next release note.

So the obligation is asymmetric and it lands on the publisher:

> **Across a boundary whose two sides ship independently, the failure category
> is part of the published interface, and returning an opaque failure is a
> defect in that interface even though the unit compiles, tests, and behaves
> correctly.**

This is [verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)
with the boundary read as an *ownership* line rather than a representation
change. The classification exists where it was computed and dies at the release
edge, and the test the law states — what the outermost consumer can branch on —
is answered by somebody the publisher will never meet.

## Where the conversion belongs

One rule, and it is mechanical:

- **Convert at the boundary, in the direction of the consumer.** The assembly
  that terminates in a door absorbs published enumerations into its aggregate
  at the point of call. It never does the reverse — an aggregate that escapes
  outward through a published interface has already destroyed the far side's
  ability to branch, and no layer above can restore it.
- **The conversion is a widening, so it is safe; the absence of a conversion is
  where the defect lives.** A unit that reaches for the aggregate because it is
  convenient, and is later published, ships that convenience as its contract.
  Deciding shape by *who will consume this* rather than by *what is easy here*
  is the whole discipline, and it has to be decided at the moment the unit is
  written, because the cheap direction is the one that cannot be walked back.
- **One authority per vocabulary still holds inside the enumerated half.** A
  published unit that mints its own parallel spelling of a category its
  dependency already publishes has created a second authority
  ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
  it wraps and re-exports, or it derives, but it does not re-declare.

## Consequences worth planning for

- **Adding a category to a published enumeration is a compatibility event.**
  The far side may have a total match over your set. Publish the enumeration as
  extensible from the start — a declared allowance for members not yet known,
  so consumers must write a conservative default branch — or accept that every
  new failure kind is a breaking change. This is the same evolution problem
  [taxonomy-design](./taxonomy-design.md) describes, with the added constraint
  that the consumers cannot be walked through by a compiler you control.
- **The aggregate is not an excuse to stop enriching.** Its value is the
  accumulated context trail, which only exists if every layer adds what only it
  knows. An aggregate assembled from bare messages is the propagation failure
  wearing a sanctioned type.
- **Both halves may live in one unit.** A published unit that also ships an
  executable entry point enumerates in its interface and aggregates in its
  entry point. Two shapes, one repository, one conversion between them.

## When not to use it

**At the top of a terminating assembly, a closed set earns nothing.** The
categories have exactly one consumer, that consumer is the door, and the door
branches on a handful of routing questions that the aggregate can answer from
its own fields. Building an enumeration there buys a maintenance obligation and
a widening conversion at every call, in exchange for a discrimination nobody
performs. The aggregate wins, and reaching for the enumeration because it is
the more disciplined-sounding option is over-engineering with a taxonomy's
vocabulary.

The inversion also runs the other way in one narrow case: a boundary that is
*nominally* published but has exactly one consumer inside the same release
train, upgraded in lockstep, is not an independent-schedule boundary. Treat it
as the interior it actually is — and re-decide the moment a second consumer
appears, because that is the release in which the interior becomes an
interface.
