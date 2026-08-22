---
layer: technique
type: technique
subject: hitl-approval
technique: severity-sla-ladder
status: forged
laws: [one-authority-per-vocabulary, creation-names-reaper, derivation-names-recomputation]
shared_with: []
use_when: [deciding how long a pending item may wait before the system acts, timeout policy written as scattered conditionals per call site, a severity that deserves no automated verdict at all]
---

# Severity SLA ladder

A gate that pauses needs a clock, and the clock cannot be one number. "Every
pending item expires in 24 hours" is either far too slow for the thing that is
on fire or far too fast for the thing that needs a specialist back from leave,
and a system with one deadline gets both wrong on the same afternoon. The
instrument that fixes it is a **ladder**: for each severity, one deadline and
one terminal action, declared together in a single data table that every
consumer reads. The ladder answers, for any item on any queue, the only two
questions the clock raises — how long may this wait, and what happens when the
waiting ends.

## One table, not a cascade of conditionals

The ladder is **data, not control flow**. Written as conditionals it spreads:
the sweep that applies terminal actions carries one copy, the surface that
renders a countdown carries a second, the notification that warns before expiry
carries a third, and the operator's understanding of the policy is a fourth
copy that lives in nobody's repository. Those copies drift on the day someone
adds a severity, and they drift asymmetrically — the sweep learns about the new
rung, the countdown does not, and the surface shows an item as comfortable
while the sweep resolves it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

A rung declares three things and nothing else:

| Field | What it fixes |
| --- | --- |
| **severity** | the key — a member of the closed severity vocabulary, every member present, no fall-through arm |
| **deadline** | how long an item at this severity may sit pending, in a unit an operator budgets in |
| **terminal action** | the one thing that happens when the deadline passes |

Every severity has a rung. A ladder with a default arm — "anything else gets
the standard timeout" — has smuggled a fifth copy of the policy back in, and
the arm is exactly where a newly added severity lands silently.

## The terminal action set is closed, and it has three members

The naive set has two members, approve and escalate, and the naive set is the
technique's central error. Two members force **every** severity into an
automated decision at the deadline, including the severities that deserve none.
The honest set is:

- **auto-approve** — the deadline passes and the item proceeds as though a
  human had said yes;
- **escalate** — the deadline passes and the item is pushed at a *different*
  human, one with more authority or more availability than the one who did not
  answer, with the failure to answer recorded as part of why;
- **hold** — the deadline passes and *nothing happens to the item*. It stays
  pending, it stays visible, and the only thing the deadline did was mark it
  overdue.

Hold is the member implementations omit and the one that makes the ladder
truthful. A severity whose right answer is "a person must look at this, and no
amount of elapsed time changes that" is common — the irreversible action, the
outbound message to a customer, the spend above the ceiling — and a two-member
set has nowhere to put it. What it does instead is pick the least-bad automated
action and apply it, which converts a policy gap into a decision nobody made.
An overdue queue is a visible, diagnosable, embarrassing state; it is strictly
better than a queue that stays clean by deciding things on its own.

## Auto-approve is a confession, and it must be a true one

The subject's default is that timeout resolves to deny or hold and never to
proceed, and an auto-approve rung looks like a violation of it. It is not — but
it is only not a violation under one reading, and the reading has to be stated
or the rung becomes the loophole through which the default is lost. **An
auto-approve rung is a confession that, for this severity, the gate is firing
below the judgment threshold.** It is legitimate exactly when the actions at
that severity fail every test for a mandatory gate: reversible, unspent,
internal, familiar. For those, a gate was arguably a mistake in the first
place, and auto-approval at the deadline is the ladder cleaning up after an
over-eager trigger.

Where the actions at the auto-approving severity are *not* all of those things,
the rung is the mechanism executing the outcome it exists to prevent, on a
timer, with an audit trail that says it was policy. The test is mechanical:
read the set of action classes that can carry the mildest severity, and if any
of them is irreversible, spends, or leaves the boundary, the rung is wrong —
either the rung becomes hold, or the classifier stops assigning that severity
to those actions.

## The deadline is derived, and it names its recomputation

An item's deadline is ask time plus its rung's budget. Store it if the queries
need it — sorting by urgency across severities is much cheaper against a
materialized timestamp than against a join to the policy — but a stored
deadline is a derived value and owes the recomputation path that regenerates it
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
The moment that matters is a policy change: an operator shortens the critical
budget from twelve hours to four, and every already-pending critical item is
carrying a deadline computed under the old policy. Either the change re-derives
them, or the ladder is a description of what *new* items will experience and
the operator has to be told so. Silently keeping both is the worst of the
three, because the surface presents old and new deadlines in one list with
nothing to distinguish them.

The deadline is also the pending item's reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)) — with the
qualification that the hold rung's reaper is a human rather than a sweep, which
is a legitimate answer to "who ends this?" and a very different one from having
no answer.

## The sweep that applies the ladder is a writer

Reading the ladder is free; acting on it is not. The terminal action is a
durable write — an approval that lands, an escalation that notifies, a record
that appends — and every duplicate of it is a duplicate consequence. The sweep
that walks overdue items therefore needs the discipline of a writer rather than
of a poller: only one runner may hold the pass at a time, an item is claimed
before its action starts and released only after it finishes, and each action
is *awaited* so that the walk cannot re-pick a row whose write is still in
flight. The failure without these is not a rare race — a sweep on a short
interval, several copies of the surface open at once, and one slow write are
enough to fire the same auto-approval twice from one deadline. A ladder whose
terminal actions are idempotent by construction is better still; where they
cannot be, the claim is what stands in for idempotence.

## What the ladder does not own

The ladder says *when* and *what*; it does not own the states the item moves
through, which belong to the gate's state machine, and it does not own the
record the terminal action writes, which is a decision record like any other —
decider being the ladder rather than a person, exactly as an unattended grant
records itself. Nor does the ladder assign severity: it consumes a severity the
classifier produced, and its correctness is bounded by that classifier's. A
perfectly tuned ladder over a classifier that defaults unreadable items to the
mildest rung is a machine for approving the things it did not understand.
