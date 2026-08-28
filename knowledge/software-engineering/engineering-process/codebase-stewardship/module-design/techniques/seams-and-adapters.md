---
layer: technique
type: technique
subject: module-design
technique: seams-and-adapters
status: forged
laws: [gate-sees-target, one-validation-door]
shared_with: []
use_when: [deciding where a boundary should allow substitution, making untested code testable, choosing whether a dependency deserves an interface, planning to replace an external dependency]
---

# Seams and adapters

A **seam** is a place where behaviour can be changed without editing at that
place. The definition is Feathers', and its precision is the point: not "a
place where an interface exists," but a place where you can substitute *from
outside*. Every seam has an **enabling point** — the location where the choice
of which implementation runs is actually made. A seam whose enabling point sits
inside the code you are trying to vary is not a seam; it is an interface with a
hard-coded answer.

An **adapter** is a concrete thing that satisfies a seam. The production
implementation and the test double are two adapters of one interface — not two
kinds of object, and not a real thing plus a testing artefact. Treating them as
the same kind is what makes the rest of this technique work.

## One question, asked once, answered for both

"Where should this be replaceable?" and "where can I test this in isolation?"
have the same answer at the same location. That identity is the most useful
thing in the subject, and it has two consequences worth stating as rules.

**Testability is a structural property.** It is not a quality of the test suite
and it is not something a testing effort can add from outside. Code with no
seams cannot be tested in isolation at any budget; the budget buys either
end-to-end tests that are slow and coarse, or tests that reach into internals
and pin the implementation instead of the behaviour.

**"We will add tests later" is usually a structural claim in disguise.** Adding
tests later to seamless code requires introducing seams, which is the design
work that was being deferred. Saying so converts a scheduling promise into an
estimable piece of work, which is the honest version of the conversation.

## Where a seam belongs: three signals, which can disagree

1. **Dependency direction.** A seam earns its cost where a dependency currently
   points from the part of the system that encodes the organisation's own
   decisions toward a part that encodes somebody else's. Introducing an
   interface owned by the first side and an implementation on the second
   inverts it. The critical discipline: **the interface is expressed in the
   caller's vocabulary, not the dependency's.** An interface that mirrors the
   external thing's operations is a seam that will not survive the day the
   external thing is replaced, because the replacement has different
   operations and the interface was a transcription rather than an abstraction.
2. **Rate of change.** Put a seam between two things that change at different
   speeds. Its inverse is the sharper rule: **a boundary between two things
   that always change together is pure cost**, crossed by every change,
   hiding nothing, and paid for on every read.
3. **What must be replaceable.** Anything that cannot run inside a test — a
   network, a clock, randomness, a payment, a human — plus anything with more
   than one plausible supplier now or later, plus anything that is the subject
   of an active organisational decision.

When the signals disagree, rate of change is the tiebreaker, because it is the
only one measured from history rather than from prediction. Dependency direction
and future replaceability are both bets; change frequency is a record.

## The single-door rule

A seam is only worth what its coverage is worth. **If any code path reaches the
concern without going through the adapter, the seam is decorative.** The
substitution silently does not apply on that path, and the divergence surfaces
only in the environment where that path is taken — which is generally
production, because the bypass was added for something production-specific.

This is [one-validation-door](../../../../_laws.md#one-validation-door) applied
to structure rather than to writes: the fix is structural, not disciplinary.
Making the door the only way in — by construction, so that the direct route is
unavailable rather than merely discouraged — is the difference between a
boundary and a convention. A convention is the boundary minus whichever call
site is added next quarter.

The practical form: the adapter owns the import, the credential, the connection,
the format knowledge. Nothing else in the system names the outside thing at all.
When that holds, "can we replace it?" is answerable by reading one folder; when
it does not, the answer is a survey with an unknown error rate.

## The double must be checked against the same contract

The failure mode that makes seams disappointing: the test double drifts from the
real adapter, and the suite goes on passing against a system that no longer
exists. That is precisely
[gate-sees-target](../../../../_laws.md#gate-sees-target) — a check running over
a proxy passes *exactly when* the proxy diverges from the target, which is the
moment the check existed for.

Two mechanisms, and both are needed:

- **A shared contract exercise.** One suite of expectations — about return
  shapes, error cases, ordering, idempotency, what happens on partial failure —
  runs against every adapter of the interface, the double included. The double
  earns its trust by passing it. Where the real thing cannot be exercised in
  ordinary runs, the contract suite runs against it on a slower cadence, and
  its last-run date is reported rather than assumed.
- **At least one path exercised end to end with the real adapter.** The contract
  suite proves the double matches what was written down; only the real path
  proves what was written down matches reality.

The corresponding rule for writing doubles: **a double asserts behaviour, not
implementation.** A double that records call sequences and a test that asserts
them together pin how the caller is written rather than what it achieves, and
they turn every subsequent structural improvement into a test-editing exercise —
which is how a suite becomes the thing that prevents refactoring instead of
enabling it.
## An adapter that refuses a verb is not an adapter

The contract suite catches a double that drifts. It also catches something it
was not written for, and naming it saves the argument each time it appears: an
adapter that satisfies the interface's signature and refuses part of its
behaviour. A read-only variant that throws on write. A backend that no-ops a
verb it cannot support. A subtype introduced to borrow one implementation,
which inherits every promise of its parent and intends to keep one of them.
Each type-checks as a substitute and fails as one, and the failure surfaces at
the single call site written against the promise, at runtime, in whichever
environment first passes the narrow thing where the wide one was expected.

The rule: **subtyping is a substitution promise, and a substitute that narrows
the guarantee has broken the promise, not implemented it.** The fix is never in
the narrow adapter. It is in the interface, which was drawn one capability too
wide: split it at the capability that differs — the readers' contract from the
writers', the query surface from the mutation surface — let each consumer name
only the contract it uses, and the narrow thing stops being a lie and becomes a
complete adapter of a smaller seam. The static check that then rejects the
wrong argument is the same check the runtime error was making, moved to where
it costs nothing. The detection signal is the one
[module-depth](./module-depth.md) gives for the merged module — no two callers
touch the same subset of the interface — read from the adapter's side: no
adapter implements the whole of it.

The corollary for reuse: taking an implementation by inheritance in order to
borrow a method makes the same promise by accident. If the relationship needed
is *has one of these* rather than *can stand in for one of these*, it is
composition — hold the dependency, call it, and substitute it at the seam that
already exists — and no contract is created for anyone to honour.


## A seam nobody substitutes at probably does not hold

An interface with exactly one implementation, forever, has never been made to be
honest. It will have absorbed that implementation's assumptions into its shape —
a parameter that only makes sense for one backend, an error taxonomy borrowed
from one library, an implicit ordering guarantee nobody stated — and the second
implementation is what discovers all of it, at the worst possible moment,
usually under a deadline.

So the rule is a fork, not a warning: **either substitute at the seam, or stop
paying for it.** A test double counts as a substitution and is the cheap way to
buy the honesty. Where no substitution is plausible and none is wanted, say so
and collapse the interface — the boundary was an internal one, and an internal
boundary does not need a substitutable interface to be a good boundary.

## Pin behaviour before moving a boundary

Moving a seam in code whose behaviour is not fully understood is where
structural work turns into a rewrite with unknown semantics. The order is fixed
and inverting it is the common mistake:

1. **Find or create a seam** — usually the smallest possible one, introduced
   only to make step 2 possible.
2. **Pin current behaviour** with characterization tests: assertions that record
   what the system *does*, including the parts that look wrong. A
   characterization test is not a specification and must not be written as one;
   its value is that it fails when the change alters behaviour, and a test
   written from what the code *should* do fails on day one and teaches nothing.
3. **Then change the structure**, with the pins as the invariant.

Deliberate behaviour changes ride separately, before or after, never inside. A
structural change that also fixes a bug cannot be reverted without losing the
fix, and cannot be reviewed without arguing two questions at once.

## When not to use it

Not every dependency deserves a seam. A seam costs an interface, and an
interface is a learnable surface — the shallow-module failure in
[module-depth](./module-depth.md) wearing an abstraction's clothes. Do not put
one in front of something that has exactly one plausible implementation, changes
at the same rate as its caller, and runs fine inside a test. That seam hides
nothing, adds a name, and will be defended for years on the grounds that it
might be needed.

Nor is a seam the right instrument for coupling *inside* one coherent job.
Introducing substitutability between two parts that share invariants converts a
maintainable relationship into a contract that must be kept honest at a
boundary, and the cost of that contract is real. Seams go where substitution is
wanted; hiding goes where it is not.
