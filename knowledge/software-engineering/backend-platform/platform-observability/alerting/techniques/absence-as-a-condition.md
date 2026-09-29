---
layer: technique
type: technique
subject: alerting
technique: absence-as-a-condition
status: forged
laws:
  - failure-not-empty-success
shared_with: []
use_when: [a rule's metric stopped being emitted, deciding what a no-data tick does to a sustain streak, a job that must run on a schedule needs a rule, the evaluator itself could be dead]
---

# Absence as a condition

A threshold rule is a comparison, and a comparison needs a value. Take the
value away — the emitter died, the metric was renamed, the window is empty,
the evaluator stopped — and the comparison has nothing to say, so the rule
says nothing. Everything else in this subject assumes a signal is arriving.
This technique is about the day it is not, because that is the day a system
looks exactly as healthy as it does on a good one.

[Evaluation-loop](./evaluation-loop.md) already settles the first move: an
empty window is *no value*, never zero, and the rule is skipped and recorded
as not evaluable. That is right and it is only the first move. Skipping is a
per-tick decision; a rule that has been skipped for a day is a different fact
from a rule skipped once, and nothing in the per-tick decision knows the
difference.

## No data is a state of its own

Absence has to be **expressible as a condition**, because a comparison rule
cannot express it. Every mainstream alerting system that has been used long
enough grew the same three things independently:

- a **third state** beside firing and normal — "no data" or "insufficient
  data" — so a rule that cannot evaluate is visible as such rather than
  filed under either;
- a way to write a rule *about* absence ("this series has not reported for N
  minutes"), separate from any rule that compares its values;
- a **per-rule policy** for what the no-data state does: raise its own alert,
  count as breaching, count as healthy, or hold whatever state the rule was in.

The last is the design decision, and it has no universal default. The
question that decides it is one: **is silence itself the symptom?**

- *Yes* — a job that must run hourly, a heartbeat, an emitter that reports
  continuously. Absence is the failure, and the rule treats no-data as
  breaching, or is written as an explicit freshness rule with a grace period.
- *No* — a rate on an idle system, an event counter that only moves when
  something happens. There is no denominator, the honest answer is "unknown",
  and the rule is skipped, as the evaluation loop says. Treating this as
  breaching pages forever on a machine doing nothing.

The choice is made **per rule, at authoring**, and shown there. It is not an
evaluator constant: an evaluator-wide "missing means fine" default is exactly
the silent coverage loss that
[rule-authoring-validation](./rule-authoring-validation.md) rejects for
retired metrics, arriving at runtime instead of at save time. A rule with no
declared policy takes the neutral one — not-evaluable, surfaced — never the
silent-healthy one.

"Hold the last state" is the policy to distrust. It is right for a short gap
in a rule that is already firing (the alert should not resolve because the
data blinked), and wrong as a resting state: a rule that holds *normal*
through a dead emitter is a rule that has stopped watching and says it is
fine.

## A rule that cannot evaluate has an age

A not-evaluable rule is not a per-tick note; it is a **condition with a
duration**, and the duration is a bound. Past it the rule is surfaced to its
author as *broken*, on the rule's own status and in the same place firing
alerts appear — because a rule provides coverage only while it can evaluate,
and the team believes the coverage is there. Count consecutive not-evaluable
ticks (or record the time of the last successful evaluation) per rule, and
alert on that count. Without it the rule that fell silent when its metric was
renamed looks identical, in every list a person reads, to the rule that has
been quietly true.

What a no-data tick does to a **sustain streak** is a second decision the
rule must have made, and systems genuinely differ: some reset the streak on
the first absent sample, some count the gap as time toward a no-data outcome,
some fill it with a configured value or hold the state. None is universal, so
the technique does not pick one; it requires that the rule's behaviour be
*chosen and stated*. The default worth refusing is the accidental one — a
streak that resets silently every time the data hiccups, so that a rule over
a patchy signal never reaches its sustain and never fires, with nothing on
the record to say why.

## The watcher needs a watcher

The evaluation loop is asked to expose its own liveness. That is necessary
and cannot be sufficient, because a liveness record written by the evaluator
cannot report the evaluator's death: a dead loop writes nothing, and nothing
reads as "no alerts". Some part of the observation has to live **outside the
thing being observed**.

The convergent shape is a **positive signal that must keep arriving**, watched
by a receiver that alerts on its *absence*:

- The evaluator (or a rule that is always true, an *always-firing* rule) emits
  a heartbeat on a fixed cadence, through the **whole delivery path** a real
  alert would take — the rule engine, the routing, the channel.
- An independent receiver holds an expectation ("at least one in this
  period") and raises the alarm when the period passes empty. The dead
  component never has to speak; that is the entire point.
- **The sender interval sits well inside the receiver's window.** A heartbeat
  sent every fifteen minutes and expected once an hour survives one lost
  delivery without a page; a sender and receiver on the same period pages on
  every jitter. Receivers formalize this as a period plus a grace time, and the
  grace is the part people leave out.
- The receiver lives on a **different failure domain** from the evaluator —
  another process, host or service. A watchdog on the same box, behind the
  same deploy, is watching itself.

The same construction covers every scheduled job the product depends on. A
"this must run" rule is a heartbeat rule; treating it as a threshold over
"failures" is the version that stays green when the job never starts.

A quiet summary channel is the same problem in another dress: a period that
produced no push must be distinguishable from a batch that never ran
([periodic-digest](./periodic-digest.md)). The heartbeat is what lets "quiet"
and "broken" be told apart on both channels.

## Decision rules

- Every rule declares what no-data means for it — skip, breach, or hold —
  and the authoring surface shows the choice; an undeclared rule is
  not-evaluable and surfaced, never assumed healthy.
- A rule that stays not-evaluable past a stated bound is reported as broken,
  to its author, where firing alerts appear.
- The behaviour of a sustain streak across a missing sample is stated on the
  rule, not inherited from evaluator code.
- The evaluator emits a heartbeat through the real delivery path, to a
  receiver in a different failure domain, with the sender period well under
  the receiver's expectation plus its grace.
- Jobs the product relies on are watched by a freshness or heartbeat rule, not
  by a failure-count threshold.
- Test the direction that pages: a rule that must fire on absence is proven
  against an emitter that was killed, not against one that reports zero.
