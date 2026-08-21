---
layer: technique
type: technique
subject: unattended-build-loop
technique: budget-reservation-and-drain-not-kill
status: forged
laws: [refuse-rather-than-destroy, a-budget-shapes-the-output, unmeasured-is-not-a-pass]
shared_with: []
use_when: [giving an autonomous loop a spend ceiling, running concurrent workers against a shared budget, deciding what to do with in-flight work when a cap trips]
---

# Budget reservation, and drain rather than kill

A ceiling that reads only settled spend does not hold. Reserve an estimate before
each launch, count the outstanding reservations in the admission check, and when
the cap trips, stop claiming new work while awaiting what is already claimed —
then report the overshoot instead of implying there was none.

## The procedure

1. **Resolve the ceiling explicitly, and default it to finite.** A caller who
   passes no budget gets a default ceiling, not an unlimited run. Unlimited is a
   separate flag that must be asked for by name.
2. **Estimate per launch from observed history.** Use the running average of
   settled work once any exists; fall back to a fixed estimate so the first
   launches still reserve a non-zero amount rather than reserving nothing and
   admitting everything.
3. **Reserve at launch.** Record the estimate against the launching worker's
   identity so the release is exact and cannot leak.
4. **Admit against the full projection.** The check is: settled spend, plus the
   sum of outstanding reservations, plus this launch's estimate, must stay within
   the ceiling. Omitting the middle term is what lets a pool of width N overshoot
   by N−1 launches, invisibly.
5. **Release on return and book the actual.** The reservation is optimistic
   bookkeeping; the settled figure replaces it, and the running average updates.
6. **Gate every spawn, not just the planned ones.** Repair passes, retries and
   follow-up sessions spend real money. Each takes its own reservation through
   the same admission check.
7. **On cap-hit, drain.** Refuse to claim further work, await everything already
   claimed, record how many items were in flight at the moment the stop was first
   observed, and report that width. Pause; do not mark the run complete.

## Decision rules

- **When a resource's cost is only known on completion, never cancel it.**
  Cancelling does not refund the cost — it burns it and destroys the measurement
  at the same time, converting a counted overshoot into an invisible one. It can
  also leave a half-read output that some parser will happily turn into a partial
  result. This generalises well beyond model calls: any metered call whose usage
  arrives in a closing envelope has the same property.
- **When a spawn reports no cost, book it at the estimate and flag it
  unmeasured.** Unmeasured must not collapse into free. Only a path that
  provably spawned nothing is genuinely zero, and that path must be
  distinguishable by a separate flag — "did we spawn?" is a different question
  from "what did it cost?".
- **When choosing the denominator for the running average, exclude short atypical
  sessions.** Repair passes are usually much shorter than primary work; folding
  them into the per-launch estimate drags it down and makes the in-flight
  reservation less conservative exactly when the run is going badly.
- **When the cap trips, the run is paused, not finished.** A cap-hit that falls
  through into the completion path flips the run terminal, and everything
  downstream — resume, history, identity resolution — then treats an interrupted
  run as a finished one.
- **When reporting the pause, name the cap as the reason.** A generic "stopped by
  request" message on a budget stop sends the operator looking for a person who
  does not exist.

## The overshoot is a number, not an embarrassment

Bounded overshoot is the honest outcome of any concurrent system with a shared
ceiling: enforcement happens between claims, not mid-claim, so whatever is in
flight when the ceiling is crossed runs to completion. A ceiling of one unit that
pauses having spent 1.06 units is behaving correctly. What is not correct is
reporting 1.00, or reporting nothing. Return the overshoot width from the pool so
the caller can state it, and size the pool knowing that its width *is* the
worst-case overshoot in units of one launch.

## When NOT to use this

- **When the resource is cheap and cancellable with a genuine refund** — a local
  computation, a pre-paid slot. Then killing is fine and reservation is
  ceremony.
- **When latency of the stop matters more than the cost of the overshoot.** A
  runaway process that is actively causing harm should be stopped, not drained;
  the drain rule is about cost accounting, not about safety-critical halts.
- **When work is idempotent and re-runnable at negligible cost**, so an abandoned
  item costs nothing to redo. Even then, count what was abandoned — an unreported
  abandonment is still a hole in the run's record.
