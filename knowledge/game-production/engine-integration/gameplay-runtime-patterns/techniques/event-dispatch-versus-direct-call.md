---
layer: technique
type: technique
subject: gameplay-runtime-patterns
technique: event-dispatch-versus-direct-call
status: forged
laws: [compiling-is-not-wiring, structural-proof-is-never-sufficient]
shared_with: []
use_when: [deciding how one gameplay system tells another that something happened, reviewing generated code that routes a single consequence through a message bus, diagnosing a handler that exists and never runs]
---

# Event dispatch versus direct call

The named concern: choose, per notification, among three tiers of increasing cost — the
direct call, the synchronous subscription, and the deferred queue — on the two questions
that actually separate them, and refuse the higher tiers when neither question answers yes.
The failure this prevents is a program whose control flow exists only at run time, assembled
one reasonable-looking decoupling at a time.

## The three tiers and what each buys

**Direct call.** The producer names the consumer and calls it. The interaction is visible to
the compiler, to a symbol search, to a stack trace and to a reader. Cost: the producer's
module depends on the consumer's. That is the entire cost, and it is frequently the correct
price.

**Synchronous subscription.** The producer broadcasts; interested parties registered
beforehand are invoked immediately, in registration order, on the producer's stack. Buys:
the producer no longer names or depends on its consumers, and the consumer set may vary at
run time. Costs: the call site no longer says who runs; the invocation order is an emergent
property of registration; every subscriber owns an unsubscribe obligation tied to its own
lifetime; and because it runs on the producer's stack, a subscriber that mutates the
producer's state, or broadcasts again, has created re-entrancy inside a function that was
not written to expect it.

**Deferred queue.** The producer appends a record; a drain consumes it later — after the
current update, next step, on another thread. Buys exactly one thing that neither tier below
it offers: the consequence happens at a *different time* from the trigger. That is worth
paying for when the work is expensive and must not extend the current step, when the
consumer is not safe to run at the trigger point, or when the volume must be smoothed. Costs:
everything the subscription costs, plus a latency that becomes part of the game's feel, plus
storage that can grow without bound, plus a record that must be self-contained because the
world it described may no longer exist by the time it is read.

## The two questions

Ask them in this order and stop at the first no.

**Does the receiver set vary, or must the producer avoid depending on the consumer's
module?** If a single consumer is known at authoring time and the dependency is acceptable,
the direct call is the answer and the tiers above are pure cost. Note what does *not* count
here: a wish for future flexibility, a preference for smaller header dependencies, and a
stated design goal of "loose coupling" with no named consumer that varies.

**Must the consequence happen later in time, rather than merely elsewhere in the code?** If
no, stop at the subscription. A queue adopted to separate two modules has bought deferral —
with its latency, its unbounded growth and its stale-record hazard — to solve a problem the
subscription already solved for free.

The compression of both questions into a sentence: **decoupling in space is a subscription;
decoupling in time is a queue; and neither is a synonym for "good design".**

## The wiring obligation that automated authors drop

A dispatch turns a compile-time relationship into a run-time one, and everything that was
previously guaranteed by the compiler now has to be arranged and verified by someone. Three
specific obligations, each of which produces a well-formed program that does the wrong thing:

**Subscription.** A handler that is written, compiles, and is never registered is a
compile-clean nothing. The build is green, the code review approves it, and the behaviour is
absent. This is the most common way generated event-driven code fails, because every
structural check passes: the handler exists, has the right signature, and is referenced by
nothing at all.

**Unsubscription.** A subscriber that outlives nothing but whose registration outlives *it*
is invoked on a destroyed object. Every subscription is paired with a removal bound to the
subscriber's lifetime, and the pairing is written at the same moment as the subscription or
it is not written.

**Ordering.** When two subscribers both respond and one depends on the other having responded,
the correct behaviour depends on registration order, which is an artifact of initialisation
sequence and not a designed property. Either the dependency is removed or the two are
collapsed into one ordered consumer. Encoding it as a priority number is a third option and
a poor one — priorities across modules are a global ordering nobody owns.

## Decision rules

- **When one known consumer exists and the module dependency is tolerable, call it
  directly, because the interaction stays findable by a compiler.** This is the default and
  it does not require justification; the tiers above it do.
- **When the producer broadcasts, verify the subscription behaviourally, not structurally.**
  The evidence that a handler runs is an observation of it running. That it exists and is
  spelled correctly is not evidence of anything.
- **When adding a subscription, write its removal in the same change.** A subscription
  without a paired removal is an incomplete change, in the same sense that an opened resource
  without a close is.
- **When a subscriber mutates the producer's state or re-broadcasts, move it to a queue.**
  Re-entrancy through a synchronous dispatch is a defect class that manifests as an
  inconsistent world halfway through an update, and it is nearly impossible to read out of
  the source.
- **When a queue is introduced, state its capacity and its overflow policy.** An unbounded
  queue is a memory leak with a delay, and the moment it matters is a frame spike under load
  — precisely when nothing is being watched. Dropping with a counted, reported loss is a
  better outcome than growing without limit.
- **When a queued record is written, make it self-contained.** Reference the participant by a
  stable identity rather than a raw handle, and copy the values the consumer will need,
  because the drain runs in a world that has moved on.
- **When a notification is a request for an immediate answer, it is not a notification.** A
  broadcast whose producer then reads a value the consumer was supposed to set has
  reinvented a call with extra steps and worse failure modes.

## When not to use this

- **On a per-step data flow.** Notification tiers are for occurrences. A quantity that
  changes every step is read where it is needed, not published; publishing it produces one
  message per participant per step and a bus that is now the hot path.
- **Where the platform already supplies a canonical notification mechanism.** Adopt it rather
  than layering a second one — two dispatch systems for the same class of occurrence is two
  orderings, two lifetimes and two places to look, which is worse than either alone.
- **As a retrofit to make an existing tangle testable.** Replacing direct calls with a bus so
  a test can inject a listener leaves the same coupling with less visibility. The tangle is
  the finding; the bus hides it.
