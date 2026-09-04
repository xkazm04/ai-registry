---
layer: technique
type: technique
subject: admission-queue
technique: zero-depth-admission
status: forged
laws: [failure-not-empty-success, gate-sees-target, limits-are-derived]
shared_with: []
use_when: [deciding whether the gate needs a waiting room at all, the caller deadline is close to one service time, a queue depth was chosen without asking whether depth should be zero, refusals are slower than the work they refuse, queued arrivals are abandoned before a worker reaches them]
---

# Zero-depth admission

This subject surfaces two assumptions before it starts: that an arrival is
what moves the system ([self-paced-intake](./self-paced-intake.md)), and that
there is one line rather than several
([queue-cardinality](./queue-cardinality.md)). The golden path interrogates
the article in "the queue" and stops there. The noun is the third assumption,
and it is the one nobody surfaces:

> **Is there a waiting room at all?**

The default answer is yes, because a queue is what you build when work
outpaces capacity, and every technique in this subject is written for one.
But depth is a number, and zero is a value it can take. A gate with no waiting
room is not an undisciplined queue — it is a **different, sometimes better,
admission design**, and it has to be chosen rather than fallen into from
either direction.

## The selector is arithmetic, not a shape

The tempting rule is structural: *the caller is synchronous and already holds
its own deadline, therefore the waiting is already happening somewhere else,
therefore a server-side line double-books it.* That rule is wrong, and it is
worth stating plainly because it is the rule most people reach for — this
technique was first written with it, and a paired measurement against a real
engine refuted it (see the application beside this file). The shape is true of
every synchronous service; the right answer is not.

The selector is the arithmetic [depth-bounds-and-shed](./depth-bounds-and-shed.md)
already prescribes, followed to the value it returns instead of rounded up:

> **honest depth ≈ (tolerable wait ÷ expected service time) × concurrency**

Zero depth is the case where that expression collapses to the concurrency
itself — where **the caller's deadline is on the order of one service time**.
Then there is no position in the line that can be filled and drained before the
occupant leaves, and every entry is a promise the gate has already decided to
break.

The ratio, not the shape, is what flips the answer. Measured against a real
admission path at three times capacity, holding everything fixed but the
caller's patience:

| deadline ÷ service time | completed with a queue | completed with none |
| --- | --- | --- |
| 1 | 2 | **20** |
| 3 | 7 | **24** |
| 5 | 12 | **24** |
| 10 | **26** | 24 |
| 15 | **43** | 24 |

Below the crossover the queue is a machine for issuing positions nobody can
use — at ratio 1 it admitted 88 of 90 arrivals and served 2. Above it, the
queue is the only thing that can spend the caller's patience productively,
because a refused caller cannot poll fast enough to catch a worker that frees
50 ms later. **A deadline many multiples of the service time is capacity, and
refusing it away is the waste.**

So the tell is not "is the caller holding a deadline" — it always is. It is
**how many services fit inside that deadline**, and the honest instrument is
per-request rather than static: a gate that knows the caller's deadline and its
own predicted wait can compare them at admission and refuse the individual
arrival it cannot serve in time, which is
[resource-denominated-bounds](./resource-denominated-bounds.md)'s unsatisfiable
arrival with time as the denominating resource. Static zero depth is that
policy's degenerate case, correct when the ratio is near one for *every*
caller and therefore not worth computing per request.

Where the ratio genuinely is near one, the double-booking argument does bite,
and the consequences are the reason it matters:

- **The refusal you would have sent becomes a timeout.** The gate holds the
  request hoping capacity frees; the caller's deadline expires first; the
  caller sees a transport failure. A designed, healthy shed has been converted
  into the one outcome that is indistinguishable from the dependency being
  down ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
- **The overload signal arrives late and wrong.** Refusals are countable and
  attributable; timeouts are neither, because the caller books them against
  the network. Capacity planning loses its first instrument at exactly the load
  where it needs it.
- **Retry amplification is now automatic.** A caller that timed out does not
  know whether the work ran. Most retry it. The queue that existed to absorb a
  burst is now manufacturing one.

Where the caller is *asynchronous* — it submitted and went away, it will
collect the result later, its patience is measured in minutes — none of this
applies and the rest of this subject does. The discriminator is not the
transport's name; it is whether anyone is still holding the phone.

## Two arms, and the gate must be non-blocking to have them

A zero-depth gate takes capacity or refuses, and the implementation follows
from the arithmetic: the acquire is **non-blocking**. Not a timed wait tuned
low — a `try` that returns immediately with a verdict either way. A timed
wait is a waiting room with the depth expressed in milliseconds instead of
entries, and it re-imports every consequence above while looking like it did
not.

This is the one place the vocabulary contracts.
[admission-vocabulary](./admission-vocabulary.md) names three verdicts and
warns against collapsing them; a zero-depth gate has two, and that is correct
rather than a collapse — the third arm is unreachable by construction, not
erased in transit. The amendment on that technique states the discriminator
and what still has to survive.

## The invariant: the refusal must not queue behind the work it refuses

This is the property that separates a zero-depth gate from a broken one, and
it is the one nobody tests.

A gate can be perfectly correct about *who* it refuses and still be useless,
because the refusal is generated by the same worker, the same task, the same
lock, or the same connection that is busy with the admitted work. The verdict
is right and it arrives after the deadline it was supposed to beat. From the
caller's side that is identical to having no gate at all — which means the
entire mechanism can pass every functional test and deliver none of its value.

> **The refusal's latency must be independent of the service time of the work
> in flight.** State it as a bound, in the units callers care about, and
> assert it.

The assertion is cheap and mechanical, and it is the shape of the test rather
than its numbers that matters:

1. Saturate capacity with work that will not finish — a request that blocks on
   a signal you control, holding the only permit.
2. Send a second request whose own deadline is *longer* than the first's, so a
   pass cannot be an artifact of the client giving up.
3. Assert the refusal arrives inside a bound far below the in-flight work's
   service time, and that it says `refused`, not `timeout`.

A suite that omits step 1 tests the happy path. A suite that omits step 2
proves only that the client's timeout fired. Both are common, and both leave
the invariant unmeasured
([gate-sees-target](../../../../_laws.md#gate-sees-target): the assertion has
to observe the property under the condition it exists for).

Three implementation facts follow, and each is a place real systems lose the
invariant:

- **Refusals do not take the permit.** Obvious, and violated whenever the
  refusal path is written as an early return *inside* the guarded section.
- **Refusals do not take the same lock as admissions.** A mutex around the
  capacity counter is fine; a mutex around the *handler* is the invariant's
  most common grave.
- **The reply path is not the work path.** If refusal and result travel the
  same bounded channel, a full channel makes the refusal wait for the work.
  This is the failure the whole technique exists to prevent, reintroduced one
  layer down.

## The bound is still derived, and now it is derived from capacity alone

Zero depth removes the depth decision; it does not remove
[resource-denominated-bounds](./resource-denominated-bounds.md). Concurrency
is still a number, still spelled in a unit, and still
derived ([limits-are-derived](../../../../_laws.md#limits-are-derived)) — from
the connections the backend holds, the memory the working set occupies, the
downstream permit. What zero depth buys is that this is now the *only* number,
so it can be reasoned about instead of traded against a depth nobody sized.

Two related derivations become available once the line is gone:

- **The default belongs to the framework, not to each deployment.** A shared
  service runtime that knows the relative cost of each of its tenants can ship
  a per-service default that is right out of the box, keyed by service. That
  inverts the usual "each service owns its limits" and is correct whenever the
  operator is not the author — a self-hoster cannot tune six services and
  should not have to.
- **Backpressure moves outward.** With no line to absorb a burst, the producer
  is where shaping has to happen, which is
  [depth-bounds-and-shed](./depth-bounds-and-shed.md)'s backpressure section
  with the queue removed: the refusal must carry a reason and a retry hint,
  because it is now the *only* signal the producer will get.

## When not to do this

Zero depth is wrong wherever "later" is a promise worth making, and the
subject's own three facts say when that is: the work is expensive relative to
the wait, the caller is absent, the arrival is bursty against a service rate
that is genuinely adequate on average. A build queue, a batch pipeline, a
human-facing job submission — all of these want depth, ordering, fairness and
aging, and a zero-depth gate would refuse work that everyone agrees should
simply wait.

The failure mode of choosing wrongly in *this* direction is loud and
immediate: a refusal rate that is high while utilization is low. That is the
signature of a system refusing work it had the capacity to do, and it is the
one number to watch after adopting this.
