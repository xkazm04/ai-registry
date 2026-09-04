---
layer: technique
type: technique
subject: test-input-generation
technique: inside-out-invariants
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [a defect appeared far from its cause, testing a system whose components hold related state, an external test suite cannot express the property that actually matters]
---

# Inside-out invariants

A test driven through the public interface can assert only what that interface
exposes. This is usually stated as a virtue — it is the same discipline that
keeps tests from breaking on refactors — and for behavioural testing it is
correct. For a system whose components hold **related** state, it is also a
hard ceiling, and the properties above the ceiling are frequently the ones
whose violation causes the visible defect several steps later.

## The properties an outside test cannot reach

Two internal components, each individually consistent, can hold a relationship
that no caller can observe: an index and the records it points at, a cache and
its backing store, a write-ahead log and the state it describes, two replicas
of the same data, a counter and the collection it counts. The relationship
between them is a real invariant with real code defending it, and from outside
the system it is visible only through its consequences — usually much later,
usually as a symptom that points nowhere near the cause.

An outside-in test therefore observes a **proxy** — external behaviour — for
the property it means to protect, and passes exactly when the proxy and the
target diverge, which is the moment the check existed for
([gate-sees-target](../../../../_laws.md#gate-sees-target)). It reports success
throughout, because from its vantage point nothing is wrong yet
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

The move is to stop inferring internal health from external behaviour and
assert it directly, during the run, at points the generator drives the system
through.

## The procedure

1. **Write the cross-component invariants down.** They are usually known but
   unwritten, living in the heads of whoever built each side. *Every index
   entry resolves to a live record. The cached value equals the stored value or
   is absent. The committed position never exceeds the durable position. Two
   replicas agree on every entry below the agreed position.* An unwritten
   invariant cannot be asserted and is not reviewable.
2. **Expose a checking entry point, not the state.** Give the system a single
   internal operation that verifies its own invariants and is compiled out or
   gated in production builds. This is better than exporting the internals for
   the test to inspect: the check lives with the code that must maintain it, it
   updates in the same change that alters the invariant, and it does not widen
   the public surface for a test's benefit.
3. **Call it at the interesting instants**, which are transitions rather than
   idle points: after each generated operation in a short run, and at
   boundaries — after a flush, after recovery, after a compaction, after a
   fault is injected and again after it clears. Continuous checking on every
   step is affordable in a slow lane and worth its runtime there.
4. **Assert both directions of every relationship.** Checking that every index
   entry has a record catches deletions; checking that every record has an
   index entry catches missed insertions. Teams write the first
   overwhelmingly more often than the second, and the missing half is where
   the silent data loss hides.

## Cost discipline

An internal check is O(state) and the operation that triggered it may be O(1),
so full verification after every step can dominate the run entirely.

The asymmetry that makes this affordable is worth naming, because it licenses
spending that otherwise looks reckless: **where a control path is small and the
data path is large, the control path can afford to verify the data path.** A
component that runs once per transition, per batch, or per recovery may spend
proportional to the whole state and still be negligible against the work it
governs. Placement therefore matters more than frequency — put the expensive
check where the rare operation happens.

Where the check is genuinely too expensive to run always, sample it: verify
fully on a fraction of runs and after every fault, and keep a cheap partial
check on the rest. Sampling a check is an ordinary trade; **removing it because
a run got slow** is the failure this technique exists to prevent, and it should
be a recorded decision rather than a quiet one.

## Prefer a less severe failure class

A design move falls out of doing this repeatedly, and it is worth stating
separately because it changes what the system should do when the check fails,
not just where the check goes.

Failures are not equally bad, and their ordering is stable: a system that
**stops** is recoverable, a system that is **unavailable** is recoverable more
slowly, and a system that is **silently wrong** may never be recovered at all,
because the corruption propagates into everything downstream that trusted it
and nothing marks the boundary. So when an internal invariant cannot be
preserved under some fault, the engineering goal is not always to preserve it —
it is often to ensure the violation lands in a less severe class than the one
it would naturally take.

Concretely: refuse to serve rather than serve a result you cannot verify;
halt a component rather than let it write state it knows is inconsistent;
convert a correctness failure into a liveness failure that an operator can see
and act on. This is why an internal assertion that fires in production and
stops the process is frequently the right behaviour rather than an
embarrassment — it has converted the worst class into a lesser one, at the
exact moment the system still knew something was wrong.

### Who supplies the value decides whether stopping is the lesser class

The ordering above assumes the trigger is reachable only from inside. Where
the value that trips the check crosses a trust boundary on its way in —
bytes off a network, a document a stranger submits, a field an untrusted
caller fills — the ladder inverts. **"Stops" is then not the lesser class;
it is the outcome the adversary selected.** A check that halts on malformed
input hands anyone who can send input the ability to halt the system, and
the trade has gone the wrong way: the correctness failure it was avoiding
was hypothetical, and the availability failure it created is now available
on demand, cheaply, repeatedly.

The test for which case you are in is not how the failure looks at the
boundary but **who can produce the input** — the same discriminator
[reclassification-is-not-repair](../../../../backend-platform/resilience/error-handling/techniques/reclassification-is-not-repair.md)
already uses to separate an internal error from a real one, asked here of
failure severity rather than of error class.

The remedy is not to drop the assertion, which would surrender everything
this technique argues for. It is to **split it by build population**:

- **Where the inputs are the suite's own** — test, fuzz, simulation,
  developer builds — the check stays dense and live. This is where it does
  its catching, where a violation costs a stack trace rather than an
  outage, and where no adversary is choosing the bytes.
- **On the release path it compiles out**, and the same condition is
  handled as a value: a rejection, a reset, a default response, plus a
  metric and a log naming the invariant that would have fired. The
  invariant is still *stated*; only its consequence changes.

Two obligations come with the split, and skipping either turns it into a
new defect. The gated check must not change behaviour — gate the
*assertion*, never the assignment beside it, or the shipped binary and the
tested binary are different programs and the suite has been certifying the
wrong one. And the handled-as-a-value path needs tests of its own, because
it is now the only path the adversary reaches and the assertion is no
longer standing behind it.

This also resolves a tension inside this technique: the procedure asks for
a checking entry point "compiled out or gated in production builds", while
the paragraph above describes what to do when one fires in production. Both
are right, for different populations. Where the invariant is genuinely
internal — a control path's own bookkeeping, a relationship no caller can
influence — the ladder stands unchanged and halting is still frequently
correct.

## When not to use it

- **For behavioural properties the interface does express.** Assert those from
  outside; an internal check there couples the test to a structure that may
  legitimately change.
- **Where the "internal" relationship is really a public contract** that
  callers depend on. Publish it and test it as a contract instead.
- **Where the invariant is genuinely one component's own.** That is an ordinary
  assertion at its own layer and does not need a cross-component check.
- **On a fast lane, at full frequency.** The full check belongs where its cost
  is affordable; a fast lane gets the sampled or boundary-only form.
