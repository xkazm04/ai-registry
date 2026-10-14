---
layer: technique
type: technique
subject: cost-metering
technique: time-ceilings-count-working-time
status: forged
laws: [count-carries-predicate, derivation-names-recomputation]
shared_with: []
use_when: [adding a time ceiling to an interactive agent session, a duration limit that trips while the user is reading, deciding what a session clock measures, a ceiling that overshoots by one in-flight call]
---

# Time ceilings count working time

A ceiling on time looks like the simplest of the three units: start a clock,
stop at the limit. In an interactive session it is the one that is wrong by
default. A session stays open while a person reads the answer, thinks, makes
coffee and types the next message. A clock started when the session opened
measures *attendance*, and a ceiling over attendance expires during the pause,
so the user's next message is refused before any work happens. The limit
stopped measuring what the operator wanted bounded, which was how long the
agents spend running.

## The rule: sum the durations of the work, not the span of the session

- **Accumulate per unit of work.** Each model turn (or tool batch) records
  start and end, and the ceiling reads the *sum*. Idle time between turns is
  never added. The stored figure is an accumulator of durations, not a
  timestamp the check subtracts from "now".
- **Attribute each duration to the actor that ran it.** The same record that
  feeds the total feeds a per-actor line, so a tripped limit says who spent
  the time ([one-pot-across-delegation](./one-pot-across-delegation.md) keeps
  the pot single and the breakdown per actor).
- **Housekeeping counts.** A summarization or evaluation call is work. Its
  duration is recorded against the same accumulator, or the ceiling
  undercounts exactly the calls nobody thinks of as the task.
- **Pick the predicate and state it in the unit's name.** "Working time" is a
  different number from "elapsed time" and from "time since the last message".
  A figure reported without its predicate fails
  [count-carries-predicate](../../../../_laws.md#count-carries-predicate): the
  operator reading "ceiling 10m" cannot tell which of the three it bounds.

## Where it is checked, and the overshoot it permits

Check at **turn boundaries**, before starting the next unit of work, never in
the streaming path. The consequence is a bound a team can state and accept:
the run overshoots by at most the one unit already in flight. A time ceiling
does not cancel a call that has started, and saying so is more honest than
implying a hard wall. Operators should set limits with headroom for one more
turn rather than at the number they cannot exceed. If a hard wall is truly
required, that is a request deadline on the call, owned by
[one-deadline-across-attempts](../../model-call-outcome-integrity/techniques/one-deadline-across-attempts.md),
and it is a different mechanism with a different failure message.

## The three ceilings are checked in one place, and report the one that tripped

Cost, tokens and time share a single check that returns *which* limit was
crossed, the amount used and the configured maximum, and the path of the
setting to raise. The message names the setting, so an operator holding three
ceilings is not left guessing which one stopped the run. Two properties matter:

- **A terminal stop for a deliberately set ceiling.** A budget crossing ends
  the run and is distinguishable from normal completion in telemetry (its own
  stream-end reason). It does not open a "continue anyway?" prompt: raising the
  number means editing the configuration, because the operator who set it
  chose it on purpose. This is a deliberate narrowing of the interactive
  override described in [budget-enforcement](./budget-enforcement.md): where a
  ceiling is declared in the run's own configuration by the person running it,
  the override *is* the edit, and a dialog that answers it in the moment makes
  the ceiling advisory. Where the ceiling protects somebody other than the
  person at the keyboard, the recorded override stays.
- **Accumulators saturate.** A counter that wraps converts spend into credit.
  Add with a clamp at the type's maximum so overflow can only make the
  ceiling trip sooner.

## Smells

- A time ceiling that fires after the user returns from a break.
- A duration stored as a start timestamp, with the check computing
  `now - start`.
- A ceiling documented as "time" with no predicate.
- A time limit that cancels a call mid-stream and also claims to be a budget.
- A limit message that does not say which setting to change.
