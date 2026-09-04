---
layer: technique
type: technique
subject: self-healing
technique: healer-death-as-promotion
status: forged
laws: [record-precedes-effect, failure-not-empty-success, verdict-survives-boundary]
shared_with: []
use_when: [the component being healed is mandatory and its healer dies with it, promotion has no operator queue to promote into, a restart ladder exhausts and nothing is left running to report it]
---

# The healer's own death is a promotion trigger

Every promotion trigger in the standard set — recurrence, healing futility,
rollback, severity class, budget trips — is evaluated by a healer that is still
running when it fires. That assumption is invisible until it breaks, and it
breaks in one specific configuration: **the healed component is mandatory, so
the healer cannot outlive it.**

The ordinary healer supervises something optional. A cache warmer wedges, the
healer restarts it five times, the allowance runs out, the healer promotes an
incident and carries on healing everything else. Exhaustion is terminal for the
*work item* and routine for the healer, which is why the standard destination for
an exhausted ladder is a dead-letter lane or an operator queue.

Now make the component mandatory — the video pipeline of an appliance, the
protocol bridge a gateway exists to run, the storage engine underneath the
service. There is no lane to dead-letter "the thing this process is for" into.
When the allowance runs out, the correct behaviour is not to promote and carry
on; it is to stop, because carrying on means serving while the reason for
serving is absent. **The healer's exhaustion and the process's termination are
the same event**, and every party that would have received the promotion dies in
it.

## The promotion is written before the exit, or it does not exist

This is [record-precedes-effect](../../../../_laws.md#record-precedes-effect)
applied to the healer's own termination, and it inverts the usual ordering
instinct. The reflex is to exit and let the platform's crash handling record what
happened; the platform records *that* the process died, which is the one fact
nobody needed. What is needed is the verdict — *the recovery loop for this
component was tried to its limit and failed* — and the only party that ever held
that verdict is the process now exiting.

So the sequence is fixed:

1. the ladder reaches its final attempt and fails;
2. the healer writes the promotion — a declared, machine-matchable marker, not a
   sentence (see [declared-verdict-over-inferred-wreckage](./declared-verdict-over-inferred-wreckage.md));
3. only then does it exit.

If step 2 cannot complete, the law's load-bearing half applies: the effect does
not happen either. A healer that cannot record its own defeat should keep
attempting rather than exit silently, because a silent exit is
[failure spelled as empty success](../../../../_laws.md#failure-not-empty-success)
at the largest scale the system has — the whole process, gone, with a clean exit
code and nothing to distinguish it from a shutdown somebody asked for.

## The audience is the successor, not an operator

The second half of the inversion is who receives the promotion. In the ordinary
case an incident is a tracked object with an implied owner, and the owner is a
person. Here there may be no person reachable — an appliance in a rack in
somebody's basement, a unit with no console, a fleet member whose operator learns
about it from a support ticket weeks later. Waiting for a human to act on the
promotion means the device is down until they do.

The receiver that is guaranteed to exist is **the next incarnation of the
process**. Promotion therefore has a second destination beside the operator
queue, and it is a mode: the successor reads the marker at startup and comes up
*differently* — with the mandatory component disabled, with a reduced surface
that is enough to diagnose and repair, with the failure stated on whatever
display it has. The person still gets told, eventually, through whatever
telemetry survives; but the recovery does not wait on them.

Two rules keep this from becoming a licence to hide failures:

- **The degraded mode is loud, and it is not the default.** A successor that
  comes up degraded says so on every surface it has, and a system that can enter
  the mode without a marker having been written has an
  [absent guard](../../../../_laws.md#absent-guard-is-loud). The mode is entered
  by evidence, never by a timeout or a heuristic.
- **The marker is one-shot, and the mode is not sticky.** A promotion that
  persists across the successor's own startup converts one exhausted ladder into
  a permanently crippled device — see
  [consume-once-mode-handoff](./consume-once-mode-handoff.md) for the channel
  disciplines that prevent it.

## What this does not license

It does not license entering a degraded mode on any failure. The trigger is
specifically *the healer's allowance being spent*, which is a statement about the
recovery machinery, not about the component. A component that crashed once and
was successfully restarted has produced no promotion at all; a component that
crashed in a way the healer never attempted to fix has produced a diagnostic
record and nothing more. Widening the trigger to "something bad happened" is the
failure this technique's discipline exists to prevent, and it is expensive: a
device that drops into a reduced mode on any panic spends most of its life there.

It also does not replace effectiveness accounting. The exhaustion still lands in
the accounting cell as attempts-high-confirmations-absent; the promotion written
at death is *additional*, because the accounting store is a place a living healer
reads and the successor has no memory of what the previous incarnation measured.
