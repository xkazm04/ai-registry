---
layer: technique
type: technique
subject: telemetry-pii-redaction
technique: redaction-invariants-as-tests
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [pinning a scrubber against regression, a redaction change that fixed a false positive, proving to a reviewer that secrets do not leave the process]
---

# Redaction invariants as tests

A redactor is one of the few security controls that unit-tests completely,
because it is a pure function from a record to a record. It is also one of
the few whose failure is perfectly silent in both directions: a redactor
that has become a no-op ships a green build and a working feature, and a
redactor that has become a shredder produces no defect report because
nobody files *our crash reports are too safe*. Tests are not confidence
here; they are the only instrument that can tell the difference between the
three states.

## Assert absence in the serialised output

Build a hostile record from the
[emit-site-inventory](./emit-site-inventory.md) — every field populated,
each with a **distinct** planted value. Run the redactor. Then serialise
the result exactly as the transport would, and assert that each planted
value does not appear anywhere in the resulting string.

Two things about that sentence are load-bearing.

**Serialised, not structural.** A per-field assertion — *the user object no
longer has a mail address* — mirrors the redactor's own structure and
therefore shares its blind spots: the field the walker never entered is the
field the assertion never checked. A whole-string absence assertion does
not care where the value was, which is exactly the property needed, since
the leak you are hunting is by definition in a place you did not think of.
And it observes the artifact that actually travels rather than an
intermediate the transport may not use
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

**Distinct planted values.** One marker in every field gives a failure that
says a secret leaked and not which field leaked it. Distinct values per
field turn the assertion into a locator, which is the difference between a
five-minute fix and an afternoon.

One craft detail that catches teams out: search the string the transport
would send, not a convenient re-encoding of it. Escaping, nested encoding
of a payload inside a field, and non-ASCII normalisation can each hide a
literal match that is nevertheless plainly present on the wire. If the
transport encodes, encode the same way before searching.

## The clean-survival case is not optional

Immediately after the absence suite, a record with no sensitive content at
all goes through and emerges **unchanged**. This is the pin against
over-redaction, and without it the cheapest way to satisfy every other test
in the file is to return an empty record — which passes, ships, and quietly
converts the error tracker into a counter.

Make it specific rather than token: an ordinary error message with a real
sentence in it, a route with no identifiers, a context object with counts
and durations and flags. These are the fields triage actually reads, and
this case is the contract that they keep arriving intact. When a pattern is
narrowed to fix a false positive, the example that motivated the change is
added here, so the next person tempted to widen it again has to delete a
test with a comment on it.

## A regression case per cap

Each limit in [redact-at-the-cap](./redact-at-the-cap.md) gets one test,
and each is written the same way: construct a structure that exceeds the
limit, place a planted secret **beyond** it, assert the secret is absent
from the serialised output. This is the highest-value test in the file,
because passing a subtree through at the cap is the single most likely
refactor accident — it is what a walker does by default, it looks like a
performance improvement in review, and no other assertion in the suite
notices.

Cover the exotic branch the same way: a class instance with a custom string
conversion that prints its fields, a getter that throws, a cyclic
structure. Each asserts the same invariant, and each pins a default branch
that a future contributor would otherwise widen for a good-looking reason.

## Assert the instrument, not only the result

A suite that only asserts absence cannot distinguish *the redactor removed
the secret* from *the redactor never ran and the fixture never had one*.
Both produce a passing assertion, and a wiring change that stops calling
the scrubber turns the whole file into decoration without breaking a single
test
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
So one test asserts the positive: a known-dirty record comes back
**different** from what went in, and its markers are present. It is two
lines, and it is the test that fails when the redactor is disconnected.

The same reasoning extends one level out: cover the capture wrapper as well
as the scrub function, since the wrapper is where the caller's object is
handled and a test suite that exercises only the pure function proves
nothing about the path production takes.

## Decision rules

- **Test fields and caps, not the pattern library.** A corpus of a thousand
  synthetic mail addresses tests a regular-expression engine. One case per
  pattern, plus the false-positive examples that history has produced, is
  the whole useful set.
- **Every disclosure becomes a case.** When something leaks, the fix is a
  test with the field named in it before the code change lands; otherwise
  the same field is rediscovered after the next transport upgrade.
- **Keep the fixtures obviously fake.** A planted value that looks like a
  real person's details will eventually be pasted into a report by someone
  proving the test works. Plant values that are unmistakably synthetic and
  still shaped correctly enough to match the patterns.

## When not to reach for this

There is no exemption; the suite is cheap and the control is otherwise
unobservable. The only thing to resist is letting it grow into a
characterisation test of the whole payload — asserting the exact shape of
a redacted record couples the suite to the transport's schema, and the
next client upgrade will fail it for reasons that have nothing to do with
privacy. Assert absence, survival, and the caps. Assert nothing else.
