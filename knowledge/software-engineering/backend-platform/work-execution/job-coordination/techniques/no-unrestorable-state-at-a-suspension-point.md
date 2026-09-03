---
layer: technique
type: technique
subject: job-coordination
technique: no-unrestorable-state-at-a-suspension-point
status: forged
laws: [record-precedes-effect, failure-not-empty-success]
shared_with: [background-jobs, concurrency-guards]
use_when: [work can be destroyed between two operations with no cleanup path, a step performs two effects with a wait between them, deciding where a unit of work is allowed to be interruptible]
---

# No un-restorable state at a suspension point

Every other recovery technique in this subject presumes the interrupted party
**survives to participate**. It polls a stop token, writes a checkpoint, runs a
cleanup path, or is later found by a sweep and given a verdict. That
presumption is so uniform it is invisible, and it hides a whole regime: work
that is **destroyed between two operations**, with no notification, no cleanup
path, and no reaper on its own side. Nothing runs. There is no unwind, no
final block, no last write. The unit simply ceases at a point the runtime
chose.

That regime inverts the cooperative model. Cooperative cancellation is the
code *choosing* when it is interruptible — a token checked at points the
author designated as safe. Under involuntary destruction the code does not
choose: **every suspension point is already a safe point, or the design has a
defect.** Making that true is a design act, performed before any recovery
machinery is reachable, because none of the recovery machinery gets to run.

## The rule

Enumerate the points at which a unit of work can be involuntarily destroyed —
in most systems, every point at which it can suspend and yield control. At
each one, the state the unit holds must be one of exactly three things:

- **Durable** — already written to storage that survives the unit, so a
  successor can read it.
- **Reconstructible** — derivable from durable inputs by re-running work that
  costs less than protecting it would.
- **Compensable** — its effects have a named, idempotent undo that some other
  party can run without the destroyed unit's cooperation.

A span between two suspension points holding state that is none of the three
is the defect this technique exists to remove. The canonical shape is a pair
of effects that must both happen or neither: a value taken from one place at
the first operation and given to another at the second, with a suspension
between them. Destruction in the gap does not fail loudly; it removes the
value from the world. Nothing is left to report it
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
has no observer here — there is not even an empty result, only an absence),
which is why this class is found by design review and almost never by tests.

## The three repairs, in preference order

1. **Collapse the span into one atomic effect.** Both halves become one
   operation the substrate either applies or does not. This is the repair with
   the fewest moving parts and it is available more often than teams assume.
2. **Move the span behind a transaction.** The effects accumulate against a
   handle that commits as a unit; destruction before commit leaves nothing
   applied. The suspension points still exist, but the state they straddle is
   held by something that outlives the unit and abandons cleanly.
3. **Declare the span uninterruptible.** Where neither of the first two is
   possible, the span is marked as one the system will not destroy — held
   through shutdown, excluded from supersession — and the marking is
   explicit and reviewable rather than a comment. This is the honest reading
   of the uncancellable span other techniques allow: it is a claim on the
   scheduler, not a hope.

Notice what the repairs have in common: **they change where the suspension
points are.** They do not add a handler, because there is nowhere to hang one.
That is the whole distinction from cancellation-shaped work, where the repair
is a check or a cleanup path.

## The rule is already followed in the corpus, unstated

Two places apply it exactly and neither names it. A request-deduplication
registry stores the pending result under its key *synchronously, before any
suspension point*, because the gap between launching and registering is where
the duplicate slips through
([in-flight-dedup](../../../../client-architecture/client-fetch-cache/techniques/in-flight-dedup.md)).
An admission gate for metered work counts in-flight reservations and creates
the new reservation with **no suspension point between them**, because
concurrent requests inside that window all read the same remainder and all
pass. Both are this rule; both were derived locally, against the specific
failure in front of the author, which is what a missing general statement
looks like from the inside.

The general statement is also
[record-precedes-effect](../../../../_laws.md#record-precedes-effect) at a
finer grain than that law usually gets applied. The law is normally read
across a crash boundary — write the record, then act. Read across a
suspension point it says the same thing about a much smaller window, and the
window is one most designs never look at because nothing in the code marks it
as a boundary.

## What this does not cover, and what covers it

[step-position-and-resumability](./step-position-and-resumability.md)
guarantees **at-least-once per step** and says nothing about state held
*within* a step across a suspension. That is precisely the gap. A job may
have a perfect checkpoint protocol, a versioned plan, a per-step idempotency
declaration — and still lose money inside step four, because the checkpoint
boundary is coarser than the destruction boundary. The two disciplines
compose: checkpoints decide where recovery re-enters, this technique decides
what may be held between the points recovery cannot see.

Likewise, this is not the cancellation contract. A stop token checked at safe
points, the two-step acknowledgment, and the cleanup that runs on the cancel
path all belong to
[job-progress-and-cancellation](../../background-jobs/techniques/job-progress-and-cancellation.md),
and every one of them assumes the unit is still executing when the request
arrives. And a cancelled unit whose *cause* must be attributed is
error-handling's problem; a destroyed unit produces no signal to attribute.

## Inversion: when the machinery costs more than the loss

The corpus already states the counter-case and it applies unchanged here:
where discarding and restarting from zero costs less than the machinery,
**a job of one idempotent step is its own checkpoint**
([step-position-and-resumability](./step-position-and-resumability.md)).
If every span between suspension points is reconstructible by re-running the
whole unit — a pure read, a recomputation, a write that converges — the audit
finds nothing to repair and the correct action is to record that the unit is
restart-safe and move on. Declaring a span uninterruptible has real cost too:
it constrains the scheduler, delays drain, and each declaration is a promise
somebody must keep. Spend them on the spans where the state is genuinely
un-restorable, not on every gap in the code.

## Decision rules

- List a unit's suspension points before reviewing its logic. If nobody can
  produce the list, the unit has not been designed for involuntary
  destruction, whatever else it has been designed for.
- For each point, name which of durable, reconstructible or compensable the
  held state is. "It will not be interrupted there" is not one of the three.
- An effect that removes value from the world and an effect that adds it are
  one span, never two. If a suspension separates them, repair the span before
  anything else in the unit.
- Prefer collapsing over transacting, and transacting over declaring
  uninterruptible. Each step down the list buys correctness with a constraint
  someone else has to honour.
- A span declared uninterruptible states who honours the declaration and what
  happens at shutdown, or it is a comment.
