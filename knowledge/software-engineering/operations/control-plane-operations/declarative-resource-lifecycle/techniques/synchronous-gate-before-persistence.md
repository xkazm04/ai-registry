---
layer: technique
type: technique
subject: declarative-resource-lifecycle
technique: synchronous-gate-before-persistence
status: forged
laws: [gate-sees-target, absent-guard-is-loud, verdict-survives-boundary]
shared_with: []
use_when: [a rule must bind writers that predate it or that nobody controls, deciding whether a policy check fails open or fails closed when the checker itself is down, a gate that both validates and rewrites the thing it judges, client-side validation is being treated as enforcement]
stage: fleet
---

# Synchronous gate before persistence

Some rules cannot live in the clients. A rule that binds only the writers who
loaded it does not bind the writer deployed last year, the writer nobody
owns, the one-off script, or the person at a console — and those are the
writers the rule was written for. The construction that binds all of them is
a **gate**: a participant, registered with the store rather than compiled
into it, that sees every matching write *before it lands* and answers with
one of two verdicts — refuse this, with a reason, or here is the rewritten
version to store instead.

Placing it there buys the one property no other placement offers: the write
does not exist until the gate has spoken. There is no interval in which the
bad record is real.

## The availability policy is the design question

The gate's own logic is usually a dozen lines. The decision that determines
whether the system is operable is what happens when **the gate is down** —
unreachable, slow past its deadline, crash-looping, or freshly deployed with
its certificate wrong.

There are exactly two answers and both are legitimate:

- **Fail closed.** A write that could not be judged is refused. The rule
  holds absolutely, and the cost is that an outage of one gate becomes an
  outage of every writer whose writes it matches — including, in the worst
  arrangements, the writes needed to repair the gate.
- **Fail open.** A write that could not be judged is admitted. The system
  keeps running, and the rule is now advice: it holds while the gate is up,
  and the moment it matters most is exactly the moment nobody can promise it
  held.

The rule is: **choose per rule class, and state the choice where the rule is
registered.** A gate preventing an unrecoverable state — a write that would
destroy data, escalate privilege, or create something no later pass can
repair — fails closed, and its blast radius is deliberately narrowed
(below) so that its outage is survivable. A gate supplying a convenience
default or a cosmetic annotation fails open, because its absence costs a
missing default and its presence-as-a-blocker costs the whole system. One
global setting for both is a decision made by whoever last edited a
configuration file, and it is wrong for half the rules by construction.

Where a gate degrades to open, the degradation is **loud**
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)): a
counted, visible, attributable event, not a silently admitted write. A gate
that has been failing open for a week and has not said so has converted
itself into documentation, and the review that approved it is now describing
a system that does not exist.

## Narrow the scope at registration, not inside the gate

The registration declares what the gate wants to see: which kinds of record,
which operations, which scopes. A gate that registers for everything and
filters internally has put its network round trip, its deadline, and its
failure mode on **every write in the system**, including the vast majority it
will immediately ignore. Its latency is now everyone's latency
and its outage is a total outage — and none of that appears anywhere except
in an aggregate the gate's author does not read.

Narrowing at registration is also what makes a fail-closed gate affordable.
The blast radius of a closed gate is exactly its registered scope; the
discipline of writing that scope down as narrowly as the rule allows is the
same act as deciding what an outage costs.

## The gate sees the object as it will be stored

A gate judges the thing that lands, not the thing that arrived
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Two consequences
follow and both are ordering rules.

Rewriting participants run **before** judging ones. A judging gate placed
first has evaluated a document that was never persisted, and its verdict is
about a draft — which is the proxy-check failure in its purest form, because
it passes exactly when the rewriter's output differs from its input, and that
is the only situation the rewriter exists for.

And no gate may assume it is alone. Several participants may rewrite the same
record, in an order the gate does not choose and may not know, so a rewrite
is expressed as a *change to specified paths* rather than as a replacement
document. A gate that returns a whole object silently discards every other
participant's contribution, and the discard is invisible: the record that
lands is valid, complete, and missing something.

## Deadlines are derived, not picked

The write's own deadline is the ceiling, and every gate on the path spends
part of it. The budget for one gate is therefore derived from the write's
tolerance divided among the gates registered for it, with a margin — not a
number chosen because it felt generous. Write the derivation beside the
number. When a second gate is added to the same path, the arithmetic changes
and somebody has to notice; a hand-picked timeout does not tell them.

A gate that cannot answer within its budget is the down case, and it takes
the availability policy above. It is not a separate branch, and treating it
as one is how a system acquires a third, undocumented behaviour: refuse on
error, admit on timeout.

## The refusal is a reason; the advice is a different channel

Two outbound channels, kept apart on purpose.

**Refusal** carries a message that reaches the original writer — the person
or process that issued the write, which may be several hops away
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
Write it for that reader: what was wrong, in which field, and what would be
accepted. A refusal that says "policy violation" has spent the one chance the
system had to explain itself. Note the asymmetry the response shape should
enforce: the reason is consulted **only** when the answer is refuse, so
diagnostic text attached to an approval has been written to nowhere, and an
author who believes otherwise is logging into a void.

**Advice** is non-fatal: a remark that rides back with an admitted write.
This is what a rule looks like before it becomes enforcement, and keeping the
channel separate is what makes the staged rollout possible — warn this
quarter, refuse next, with the same rule and the same gate. Advice has a
budget, short and few, for the ordinary reason that a channel which always
carries text stops being read; a gate that warns on every write has built an
ignorable channel and will not get it back.

## The correlation identifier, and making the echo unforgettable

Every request carries an identifier the store uses to match the answer to the
question, and every response must echo it. A response with the wrong
identifier is not an error the caller sees; it is a write that hangs until
its deadline, which then takes the availability policy — so forgetting the
echo turns a working gate into an outage whose cause is three layers away
from its symptom.

Do not make this a field an author remembers to set. **Construct the response
from the request**, so that the only way to make a well-formed answer carries
the echo automatically, and let the deny and rewrite paths be transformations
of that value rather than independent constructors. Exactly one other
constructor is justified — the one for a request that could not be parsed at
all, which has no identifier to echo — and it can only produce a refusal,
because there is nothing to approve.

Keep the response shape open for extension. A gate is a contract between two
independently deployed things, and a response type that cannot gain a field
without breaking every implementation guarantees that the next thing the
protocol needs will be smuggled in through a field that already exists.

## Client-side checks are demoted, not deleted

The same rules, evaluated in the client before the request, are worth having:
they are fast, they are specific, and they catch the mistake at the keyboard
rather than after a round trip. What they are not is **enforcement**. Keeping
both is right; describing the client-side copy as the control is the error,
and it is a comfortable one, because the client-side copy is the one
developers see working every day.

The tell that a team has confused them: the server-side rule is missing for a
check the client performs, and nobody noticed, because everything they tested
went through the client.

## The rejected alternative: repair after the fact

Let the write land, and have a convergence pass notice bad records and fix
them. It costs no round trip on the write path, adds no new failure mode to
the store, needs no certificates or reachable service, and the machinery
already exists — the pass is right there, already reading every record.

It is the right answer more often than gate advocates admit, and it fails on
two classes. First, the **window**: between landing and repair the bad record
is real, and other parties read it, build from it, and derive dependents from
it. A repair that arrives later is indistinguishable from somebody else's
edit, so a writer who set a field and saw it change back learns nothing about
why. Second, the **never** class: a record whose brief existence is itself
the harm — an escalation, an exposure, a resource that costs money the moment
it exists — cannot be repaired after the fact, because the harm is not the
record's persistence, it is its having existed at all.

The decision rule: repair after the fact when the bad state is
*tolerable-for-a-moment* and *repairable*; gate before persistence when it is
either of the two things repair cannot undo. A system that gates everything
has bought a round trip and an outage mode for rules that a sweep would have
handled.

## Boundary

The nearest-shaped neighbour is
[webhook-ingestion](../../../../backend-platform/resilience/webhook-ingestion/webhook-ingestion.md),
and the geometry is reversed. There, an outside party pushes a delivery at an
endpoint you exposed: the bytes are unverified, the delivery is at-least-once,
the sender is gone before processing finishes, and nothing the endpoint
concludes blocks anybody. Here, **the store calls out and waits**: the
connection is initiated from the inside, the payload is a write the store
already holds, the original writer is still on the line, and the answer
decides whether the write happens at all. The two share the word and nothing
else; a designer who imports the ingestion posture builds a gate that records
its objection and returns success.

A second false neighbour worth naming:
[admission-queue](../../../../backend-platform/work-execution/admission-queue/admission-queue.md)
also refuses writes at a chokepoint, and refuses them **by capacity** — this
is too much work right now, come back later. This gate refuses **by content**
— this must never be stored, at any load. A capacity refusal is retryable by
definition and a content refusal never is, so collapsing them produces the
single worst client behaviour available: an infinite retry against a rule.
