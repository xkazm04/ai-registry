---
layer: technique
type: technique
subject: interview-round-design
technique: not-advanced-is-a-recordable-outcome
status: forged
laws: [absence-of-evidence-is-not-evidence, every-decision-names-its-actor, no-adverse-outcome-is-solely-automated, say-only-what-the-record-holds]
shared_with: []
use_when: [designing what happens to candidates who do not advance past a round, adding a machine round before a human one, auditing a loop for silently stalled candidacies]
---

# "Not advanced" is a recordable outcome

When a loop adds a round, it adds a new way to end a candidacy — and the new way does
not look like an ending. Nobody is rejected. No terminal status is set. No letter goes
out. The candidate is simply not among the people who continue, and in a system that
only models *advanced* and *rejected*, that is represented as nothing at all.

This is the highest-volume consequential event in most loops. When a machine round
precedes a human one, not-advanced can easily be ninety percent of everyone who entered.
Leaving the most common outcome of the process unmodelled is the defect this technique
exists to prevent.

## Give it a state of its own

*Not advanced past round N* is a distinct state, and specifically it is distinct from
three states it gets confused with:

- **Rejected.** A rejection is a verdict on the candidacy. Not-advanced is a verdict on
  a cohort comparison at one gate — often relative ("we advanced six"), often
  reversible, and sometimes followed by advancement for another role. Collapsing it into
  rejection overstates what was decided; treating it as identical to rejection in
  reporting also misstates the loop's actual selection rates.
- **Still in the round.** The difference matters to the candidate more than to anyone
  else, and it is the difference between "we are considering you" and "we are not".
- **Never assessed.** A candidate who was assessed and not advanced is a different object
  from one the round never reached, per
  [absence-of-evidence-is-not-evidence](../../_laws.md#absence-of-evidence-is-not-evidence).
  Both are "not in round two"; only one of them was measured. Merging them corrupts every
  downstream rate and, worse, makes it impossible to find the people who fell through a
  scheduling crack.

## What the record must carry

- **The actor.** Who or what applied the reducer, per
  [every-decision-names-its-actor](../../_laws.md#every-decision-names-its-actor). Where
  a machine round produced the ranking and a human released the set, both appear.
- **The basis.** Which reducer, which version, what the threshold or shortlist size was,
  and what the candidate's recorded reading was against it. This is what makes the
  outcome replayable and what makes a reconsideration possible without re-litigating from
  memory.
- **The timestamp of the decision**, not of the round. The gap between them is the
  invisible wait — the period where the candidate has spoken to you and does not know
  what happened — and it cannot be managed until it is measured.
- **Nothing more.** The record says what was recorded, in the terms the record holds,
  per [say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds). A
  not-advanced record is not the place to write a narrative about the candidate's
  weaknesses that the round did not actually establish.

## Human release, and reversibility

Because the outcome is adverse in effect, its release is human, per
[no-adverse-outcome-is-solely-automated](../../_laws.md#no-adverse-outcome-is-solely-automated).
At volume this means approving the exact set, re-derived at the moment of commit, rather
than approving a rule.

And it stays reversible for as long as the opening is open. This is not generosity; it is
the cheapest error correction available in the whole process. A reducer applied to a
cohort will occasionally be wrong about one person, and the moment to fix that — while
the loop is still running, before the seat is filled — costs almost nothing. Once the
outcome hardens into a rejection, fixing it costs a re-opened process and an awkward
conversation. Design the state as reversible from the start, with the reason readable
back so the person reconsidering can see what the original decision was based on.

## Tell the candidate

A candidacy that is over is told. The failure mode here is unique to not-advanced,
because the system did not do anything that would naturally trigger a notification: the
candidate is out, the record is silent, and the only party who does not know is the one
whose plans depend on it. That is the worst configuration available, and it is the
default configuration in a loop that treats not-advanced as an absence.

What the message says is the rejection-with-dignity subject's craft, and the timing and
staleness rules belong to the status-transparency and pipeline-aging subjects. What round
design owes them is an event to hang the message on. Two specifics belong here:

- **Do not describe a conversation that did not happen.** If the candidate was not
  advanced from a screening round, the message does not thank them for interviewing.
- **Do not manufacture a reason.** A shortlist reducer's honest reason is that a limited
  number advanced. Inventing a competency-based reason to sound more substantive is a
  claim about a person that nobody made.

## Reporting

Not-advanced is a stage transition and should be counted as one. Two rules keep the
numbers honest:

- The loop's stage-to-stage conversion uses real transitions, not inferred ones. A
  candidate's absence from round two is not evidence of a decision at the round-one gate;
  the recorded not-advanced event is.
- Not-advanced volume is reported separately from rejection volume. A process reporting
  a low rejection rate while ninety percent of its candidates were quietly not advanced
  is reporting a number that is true and misleading, which is the most dangerous kind.

## When not to use a distinct state

- **Loops with no reducer.** Where everyone advances, the state has no population. Do not
  add it as a placeholder.
- **The final round.** After the last round, the outcome is an offer or a rejection.
  Not-advanced is a *between-rounds* state and should not be used to soften a terminal
  decision — that is just a rejection nobody was told about.
- **Withdrawals.** A candidate who left is not a candidate you did not advance. Attributing
  their exit to your reducer flatters the process and corrupts the drop-off analysis that
  would otherwise tell you your loop is too long.
