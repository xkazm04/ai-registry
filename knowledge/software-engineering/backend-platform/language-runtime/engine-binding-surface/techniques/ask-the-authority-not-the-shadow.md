---
layer: technique
type: technique
subject: engine-binding-surface
technique: ask-the-authority-not-the-shadow
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [caching a foreign runtime's answer to a safety-critical question, a thread-local is being used to avoid a call across a boundary, a cached flag must stay correct across a window the cache does not observe, deciding whether a provenance check may answer optimistically when it cannot decide]
---

# Ask the authority, not the shadow

A binding layer asks the foreign runtime the same small questions constantly.
*Does this thread hold the lock? Is this handle's owner still alive? Which
instance hosts this value?* Each answer costs a call across the boundary, each
call sits on a hot path — handle clone, handle drop, equality, hashing — and
the obvious optimisation is to keep a local copy of the answer and consult that
instead.

The optimisation is correct exactly when the shadow cannot go stale and cannot
outlive its own correctness. Both conditions fail more often than they look,
and when they fail the shadow does not merely mispredict. It **authorises an
operation the real answer would have refused**, which in this layer means
touching a foreign heap without the right to.

## The two failure modes, in order of how often they are missed

**The window the shadow does not observe.** A cached flag tracks a state the
foreign runtime changes on its own schedule. Every transition the binding layer
performs itself is easy to shadow correctly; the ones that break it are the
transitions it merely *permits*. A scope that temporarily releases the lock and
runs caller code inside that window is the recurring instance: the thread still
holds the object that represents the lock, the shadow still says *held*, and
the runtime says *not held* — and everything the caller does in that window is
running on a lie the binding layer told it. Any scheme that shadows a state
with a suspension window owes a correct update at both edges of every such
window, and the windows are discovered rather than enumerated.

**The shadow's own teardown is not yours to sequence.** This is the one that
disqualifies a whole storage class rather than a particular use, and it is
worth stating concretely because the reasoning is not obvious. Per-thread
storage is destroyed in an order the runtime chooses, and code running inside
one such destructor may not be able to reach another — the access itself
faults, and in the host language's usual design a fault inside a per-thread
destructor cannot be caught and takes the process down. So a handle that
happens to live in per-thread storage, initialized before the shadow, will run
its destructor after the shadow is gone, and that destructor's first act is to
consult the shadow. **The shadow is not merely stale there; reading it is
fatal.** A binding layer cannot forbid its users from putting a handle in
per-thread storage, so it cannot use per-thread storage for anything its own
destructors consult.

## The rule

**Where an authority exists and the question is safety-critical, call the
authority.** The foreign runtime owns the vocabulary of its own state
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
a local copy is a second authority for the same word, and the copy is the one
that is wrong. Pay the call.

Cache only under all three conditions, and write them down where the cache
lives:

- the cached fact **cannot change** while the cache exists, or every transition
  that changes it passes through code this layer owns — including the
  suspension windows;
- the cache's **storage outlives every consumer of it**, which per-thread
  storage does not and a field on the resource itself does;
- being wrong is **recoverable** — a slow path, a retry, an extra call — and
  not an authorisation.

The asymmetry is what makes this decidable without measurement: a call across
the boundary costs nanoseconds on a path that is already doing foreign work,
and a wrong answer costs a corrupted heap. Record the reasoning at the call
site, because the next reader will have the same optimisation idea and the
comment is the only thing that will stop them a second time.

## When the authority cannot answer

Sometimes the question has no authority to ask — a handle that can identify its
owning instance in one representation and not in another, so a comparison
between two of them is genuinely undecidable. The available answers are refuse,
answer pessimistically, or answer optimistically, and the choice has to be
made rather than defaulted into.

The rule that keeps this honest: **an undecidable case is a third value, not a
quietly chosen one of the two**
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). A
check that returns *yes* when it means *cannot tell* has converted an unknown
into an authorisation, and every caller downstream reads it as a verdict. That
is sometimes the only shippable answer — refusing every undecidable comparison
can break legitimate callers the layer cannot see — but then two things are
owed: the optimistic branch is **written as its own case** rather than folded
into the success path, and the site says what would make it decidable and why
that information is not available yet. The distinction that survives review is
between a permissive answer somebody chose and priced, and a permissive answer
that is simply what the code does when it runs out of matches.

Note that a *pessimistic* answer is not automatically the safe one. Refusing
when uncertain converts a possible corruption into a certain failure, which is
the right trade for an operation that authorises a write and the wrong trade
for one that merely compares — and the difference is a property of the caller,
not of the check.

## When not to use it

**When the authority is the expensive thing.** Some runtimes answer these
questions by walking a structure, and then the call is not nanoseconds. The
rule does not change but the design does: cache under the three conditions
above, in storage the layer owns, invalidated at the transitions the layer
performs — and keep the undecidable case explicit either way.

**When the question is not safety-critical.** A cached answer driving a
diagnostic, a metric, or a fast-path guess whose slow path is always correct is
ordinary caching and none of this applies.
