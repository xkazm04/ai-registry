---
layer: technique
type: technique
subject: earned-autonomy-tiers
technique: shadow-next-rung
status: forged
stage: team
laws: [silent-state-is-ungoverned, count-carries-predicate]
shared_with: []
use_when: [a promotion needs evidence the current rung cannot produce, re-qualifying a class after the agent changed, judging whether a hands-off rung would have been safe]
---

# Shadow the next rung

A record earned at one rung answers that rung's question. At supervised, the record says how
often a person approved the agent's change. Promotion to hands-off asks something else: what
would have happened if nobody had been asked. The current rung cannot answer that by
construction, because a person was always asked. Shadowing the next rung is how the answer is
collected without paying for it in landed mistakes.

## The procedure

For every action in the class, the gate makes its real decision at the effective tier and,
alongside it, computes and records the decision it **would** have made one rung up. At
supervised, the shadow decision is "would land on its proof without review"; at assisted, it is
"would be authored by the agent and queued for approval". The shadow decision never acts.

It is written **at the moment of the real decision, into the same durable record, before any
outcome exists.** That timing is what makes the shadow a pre-registered trial rather than a
retrospective one: the set of actions the next rung would have let through is fixed before anyone
knows how they turned out, so nobody — the agent's operator least of all — can later choose which
counterfactuals to count. A shadow computed afterwards, over outcomes already known, invites
exactly that choice. If the decision record is tamper-evident, the shadow inherits it.

There is no shadow when there is no next rung to try: the standing is at the top, the rung above
is over the class ceiling, or nobody holds a standing in the class. A shadow above the ceiling
would collect evidence for a promotion the policy forbids.

Later, once the real outcome is known, each shadow decision is scored from the same outside facts
the promotion record uses. Only the rows where the shadow would have **acted alone** are trials —
landed without review at hands-off, approved for a person to merge at supervised — because a
shadow that would also have waited proves nothing about the rung. Each trial resolves one of two
ways, or stays open:

| real outcome of a trial action | meaning |
|---|---|
| landed as the agent wrote it, and stuck | agreement — the next rung would have been right |
| a person edited it before it landed, closed it, or it was later reverted or reopened | **catch** — the next rung would have let a worse change through |
| not yet stated | unresolved — left out, never guessed |

The edit-before-landing row is the easy one to miss: a person who fixed the agent's change and
then approved it did not agree with it, and at the next rung that person would not have been
there. Counting it as agreement makes every supervised record look ready for hands-off.

The bar for promotion reads the catches directly — a maximum number over a minimum of resolved
trials — and a trial set short of its minimum is **inconclusive, not a pass**, however clean it
looks; unresolved trials may yet resolve as catches. The rows where the shadow would have held back are worth a
glance for the opposite reason: a high share means the proof at the next rung is too strict and
promotion would buy less throughput than expected.

## Disagreement is the output

A shadow that agrees with the real decision on every action proves little; the interesting rows
are where the next rung would have decided differently from the person. Each one is a case the
reviewer can read — what the proof saw, what the person saw, which was right — and a cluster of
them usually names a gap in the class's proof rather than a weakness in the agent. Surface them;
per [silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned), a shadow whose
disagreements are recorded but never read is a shadow that measured nothing.

## Keeping the shadow from leaking

Three rules keep shadow evidence from being mistaken for standing.

**Shadow records are never read as standing.** The effective tier is computed from real standing
only. Keep the shadow in a field of its own that the tier computation does not read; a shadow the
tier computation can see is one refactor away from a class promoting itself on hypothetical
approvals.

**The shadow uses the next rung's real logic.** It calls the gate's own decision function, on the
same inputs, against a copy of the state in which that one standing is raised by a rung — not a
reimplementation, and never by mutating the real state. The raised copy carries no lease, since a
fresh grant has not had time to lapse. A shadow that approximates the next rung measures the
approximation.

**Shadow figures carry their predicate.** "94% agreement" with no window, no denominator and no
cell definition is unusable, per [count-carries-predicate](../../../../_laws.md#count-carries-predicate).
Report the trials, the catches, the unresolved, the window, and which outcome source resolved
each row — and say plainly which outcomes the record alone cannot state (an edit made on the
hosting system, a close and who closed it), so a reviewer who recomputes from the record knows
why their count of resolved trials is lower.

## Uses beyond promotion

The same run re-qualifies a class after a material change to the agent: drop the class a rung,
shadow its old rung, and restore it when the shadow trials over a fresh window clear the bar
again. It also tests a proposed ceiling change before it is made — shadow the class at the ceiling
being considered, across every agent that holds it.

## When not to use it

Shadowing costs a second gate evaluation per action and a join later, which is cheap; what it
needs is an outcome source that arrives in reasonable time. When the real outcome takes months
to surface (a defect found only in a quarterly audit), the shadow record cannot be scored inside
any useful window, and promotion for that class should rest on a longer supervised record instead.
A class with too few actions to fill the window is the other case — a shadow over eight actions
is anecdote.
