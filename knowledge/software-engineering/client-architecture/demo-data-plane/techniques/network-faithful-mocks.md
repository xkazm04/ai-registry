---
layer: technique
type: technique
subject: demo-data-plane
technique: network-faithful-mocks
status: forged
laws: [failure-not-empty-success, one-validation-door]
shared_with: []
use_when: [loading states are never seen during development, the demo behaves oddly after a few minutes of clicking, error handling has no way to be exercised]
---

# Network-faithful mocks

A fake plane that returns instantly, always succeeds, and hands back the objects
it holds is not a faithful implementation of a network client. It is a different
object with the same method names, and every difference hides a class of defect
until a real user finds it.

Four properties close the gap: simulated latency, per-call copies, provocable
failure, and writes that meet the same validation the real plane applies.

## Simulated latency

Every method waits before resolving. Not a fixed value — a small band, so that
concurrent calls resolve in varying order and the surfaces are exercised against
the interleavings they will actually meet.

What this buys is that **the loading states get built and get seen**. A team
developing against an instant fake plane never renders a spinner, never notices
the skeleton is missing, never discovers that two panels racing produce a layout
shift. The first person to see any of that is a real user on a real connection,
and by then the fix is a redesign rather than a detail.

Bands worth using: tens of milliseconds for a cached-feeling read, a couple of
hundred for an ordinary query, longer for anything the real system does slowly —
a report, an export, a model call. The point is *shape*, not accuracy: the
demo's timing should teach the same intuitions the real product does. A demo
that answers in one millisecond also sets an expectation the real product will
disappoint.

Two guards keep it from being an annoyance. The band is declared in one place so
it can be tuned or zeroed as a whole; and automated tests that drive the fake
plane set it to zero, because a suite that pays two hundred milliseconds per call
is a suite that gets moved out of the fast lane.

## Per-call copies

Every call returns a fresh copy of the data, never the stored fixture.

The defect this prevents is one of the least findable in the subject. A consumer
receives a list, sorts it in place, or pushes an optimistic entry onto it, or
normalises a field — all ordinary things for a consumer to do with a value it
believes it owns — and the fixture is now permanently mutated for every
subsequent screen in that session. The symptom is "the demo goes weird after you
use it for a while," it depends on exactly what the viewer clicked, and it never
reproduces on a fresh load, which is how the person investigating it concludes
there is no bug.

A real network client has this property for free: every response is deserialized
into new objects. The fake plane must supply deliberately what the real one
supplies structurally. Copy on the way out, at the plane's boundary, so no
consumer has to know. Copy deeply enough that nested collections are also
fresh — a shallow copy of a wrapper around the same array is the same bug with
an extra step.

## Failure must be reachable

A plane that cannot fail makes every error branch in the product dead code, and
dead code is untested code
([_laws: failure-not-empty-success_](../../../_laws.md#failure-not-empty-success)).
The product's error states are then discovered in production, in aggregate, by
users.

The fake plane therefore offers a way to provoke failure deliberately: a
declared fault mode the tests can turn on, and — worth more than it costs — a
handful of fixture entities that always fail. The entity whose detail view
returns an error, the collection that times out, the write that is rejected.
These are part of the world, they are stable because they are declared rather
than random, and they mean the error path is exercised by the demo itself rather
than only by a test.

What the plane must **not** do is fail at random. A demo that intermittently
shows an error to a prospect has chosen the worst possible moment to demonstrate
its error handling, and it violates determinism besides. Failure is a property of
specific declared fixtures and of an explicitly enabled fault mode; it is never a
probability.

## Writes go through the real validation

The fake plane's write methods accept the same arguments, apply the same
validation, and reject the same inputs the real plane rejects. Validation is
shared with the real path rather than reimplemented
([_laws: one-validation-door_](../../../_laws.md#one-validation-door)) — a second
copy of the rules in the fake plane is a copy that will disagree, and it will
disagree in the permissive direction, because nobody adds a constraint to the
fake plane when they add one to the real one.

A fake write that accepts anything trains the product's forms against a validator
that does not exist: the field that must be non-empty, the name that must be
unique, the value that must be in range all pass in the demo and fail on the
first real submission, and the failure surfaces as an unhandled error because
the surface was never built to render that rejection.

Where the write should succeed, it mutates the in-session copy of the world so
that the surfaces update as they would — that is what makes the demo
demonstrable — and it does so **in the session only**. Nothing the demo writes
survives the session, and nothing it writes touches the declared root, which
stays pristine for the next entry.

## Ordering and concurrency

Two smaller faithfulness properties, both cheap:

- **Resolve out of order.** With a latency band, two calls issued together will
  sometimes settle in the opposite order. That is what the network does, and a
  surface that assumes issue order is a surface with a race the fake plane
  should be finding.
- **Honour cancellation.** If the interface declares that a call can be
  abandoned, the fake plane must respect the abandonment rather than resolving
  into a surface that has moved on. Otherwise the stale-response bug — an answer
  applied after the question changed — is invisible in the demo and live in
  production.

## When not to use it

Do not add latency to a fake plane that exists only to serve a suite of unit
tests; there the instant answer is the point. This technique is for the plane a
human interacts with. Where one implementation serves both audiences, make the
band a declared setting the suite sets to zero, and keep the copies and the
validation on in both — those two cost nothing and prevent bugs in both.
