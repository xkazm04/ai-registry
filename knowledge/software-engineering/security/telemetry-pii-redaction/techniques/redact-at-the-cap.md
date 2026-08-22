---
layer: technique
type: technique
subject: telemetry-pii-redaction
technique: redact-at-the-cap
status: forged
laws: [failure-not-empty-success]
shared_with: []
use_when: [writing the recursive walker inside a scrubber, choosing depth and size limits for an outbound payload, deciding what happens when the redactor itself throws]
---

# Redact at the cap

Every recursive walker needs limits, and a walker that runs on the failure
path needs them badly: the objects it meets there are cyclic, enormous, and
shaped by whatever just went wrong. Depth, breadth, string length, total
serialised size — all four caps are correct and none of them is the subject
of this technique. The subject is the **direction the walker fails in when
it hits one**, which is the single decision that separates a privacy
boundary from a formatter.

## The direction rule

A pretty-printer that reaches its depth cap prints an ellipsis and lets the
remaining structure through. That is right for a pretty-printer: its worst
outcome is an ugly page. A redactor that reaches its depth cap and lets the
subtree through has emitted **the one region it did not inspect** — and the
selection is not random. Object graphs nest deepest exactly where they are
richest: the deep node is the loaded record, the hydrated relation, the
parsed response body. A cap that passes through is a cap that systematically
forwards the highest-value material in the payload.

So: **at the cap, drop.** Replace the untraversed value with a marker; never
forward it, never stringify it as a convenience, never make an exception for
a type that "obviously" cannot contain anything. The rule holds for all four
caps, and it holds for the redactor's own crash — see below. The naive
reading is that a cap is a performance knob; it is not, it is the last
branch in the boundary, and it is the branch a reviewer should look at
first.

## Markers carry which cap fired

One marker for every kind of removal makes an investigation guess. Three
facts are worth distinguishing, and they cost one word each:

- **removed because the key was sensitive** — the boundary worked as
  designed, and the reader knows not to look for the value.
- **removed because a limit was reached** — the boundary did *not* inspect
  this, and the reader now knows there is a blind spot at that path. This
  is the one that matters: a limit fired at a path that fires repeatedly is
  a signal to give that field an explicit shape, not to raise the limit.
- **rewritten by a value pattern** — the field survived, partially.

An investigator reading a record with no markers at all can conclude the
record is complete. An investigator reading a record where every marker is
the same word can conclude nothing, which is why a single generic
placeholder is a small design error with a long tail
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)
applied inside a payload: *nothing sensitive here* and *I could not look*
must not be spelled the same way).

## Cycles, exotic values, and the default branch

Two more places the walker leaks, both by omission:

**Cycles.** Keep a set of already-visited nodes; a revisited node is a
drop, not a second traversal. Without it the depth cap is doing the work of
a cycle guard, and doing it by emitting an arbitrary prefix of an infinite
structure.

**Exotic values.** A walker written for plain objects and arrays needs a
default branch, and the default branch decides the technique's real
posture. Class instances, error objects, binary buffers, streams, accessor
properties that compute on read, and objects with custom string conversion
all arrive here. Passing them through is the common default and the wrong
one — and stringifying them is worse, because a custom conversion may print
precisely the fields the keyed pass would have dropped. **Unknown kinds are
dropped**, with a marker naming the kind; a value type earns passthrough by
being enumerated, not by being unfamiliar.

## The redactor's own failure is not consent to send

Wrap the whole scrub in a guard. If it throws — a getter that explodes, a
structure that defeats an assumption, a stack overflow on a shape the cycle
guard missed — the outbound record does not fall back to the original. It
falls back to a minimal record: the error type, a note that scrubbing
failed, and nothing else. Then the failure is counted somewhere a human
sees it, because a scrubber that has started throwing on every event is a
boundary that has silently stopped existing.

The same reasoning governs the transport's own contract. Many outbound
hooks treat a thrown callback as *send the original*; a few treat it as
*drop the event*. Find out which, in writing, before relying on it — and
regardless of the answer, do not let the exception reach the transport.

## Choosing the numbers

The caps themselves are ordinary engineering, and the constraint is that
this code runs while something is already wrong: the process may be short
of memory, the event loop may be saturated, and a redactor that becomes the
slow part of the failure path will be removed by whoever is on call. Pick
depth in single digits, breadth in tens, string length in hundreds to low
thousands, and a total size well under the transport's own rejection
threshold — a payload the sink truncates on arrival was scrubbed by
somebody else's rules, not yours.

Then treat a cap that fires *routinely* as a design signal rather than a
tuning problem. A field that is regularly deeper than the limit is a field
whose shape you now know; give it an explicit projection at the call site
and let the walker stop meeting it.

## When not to reach for this

Nothing here relaxes. The direction rule has no exception worth taking: an
inspected-and-passed value is a decision, an uninspected-and-passed value
is a disclosure, and no cap is set so tightly that dropping at it costs
more than the class of leak it prevents. The tunable part is the numbers,
and the numbers are the least interesting thing in the technique.
