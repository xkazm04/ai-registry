---
name: work-candidate-triage-gate
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/work-intake
---

# Work candidate triage gate

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Anything that generates candidates will eventually generate more than anyone
can absorb, and the two ways a gate then fails are the same failure wearing different
clothes: it accepts everything, or it grows a queue nobody drains. Both follow from
never saying how many decisions actually fit in a week. There is a third failure that
looks like health, which is a gate kept green by a rule that closes old items on its
own: the counts improve, the reviewer feels faster, and what quietly falls is how much
anybody bothers to submit.

**Input.** Candidates from whatever produced them, the context each carries, the
capacity the reviewer has declared for this period, and the record of what this person
has already refused and why.

**Core action.** Hold the decision to a declared capacity: admit only as many candidates
as this person can genuinely decide on, give each one enough context to decide without
further digging, and turn what they decide into a signal the producer upstream learns
from.

**Output.** A decision on every admitted candidate, an accepted one leaving with
somebody carrying it rather than with a changed status, a refusal carrying a reason from
a small closed set, and a visible count of what is being held rather than decided.

## Activities

1. Admit candidates up to the capacity declared for this period and hold the rest
visibly *(observe)*
2. Present each with enough context to decide without more digging *(deliver)*
3. Record accept, decline or defer with a reason from a closed set *(act)*
4. Send an accepted candidate on with an owner and a next step *(deliver)*
5. Feed the reasons back so the producer stops surfacing that shape *(act)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The gate closes at least as fast as it opens, and what it cannot reach is held in the
open rather than accepted by default or quietly lost.**

- The number admitted in a period is set by what the reviewer can decide on, not by how
  many candidates the producers made.
- The health of the gate is read from decisions made against candidates arriving over a
  rolling window, never from the depth of the queue, which improves for good and bad
  reasons alike.
- A queue that grows across several windows is reported as a capacity problem and
  answered by narrowing the producers, not by asking the reviewer to decide faster.
- An item that ages past its window is declined by a person with a reason, and where a
  rule closes items automatically the recipe reports what stopped being submitted as
  well as what stopped being queued.

**Accepting a candidate puts it in somebody's hands, so an acceptance is distinguishable
from an item that was merely marked accepted.**

- An accepted candidate leaves with an owner and a next step; a changed status on its
  own is not an acceptance and is not reported as one.
- Completion comes back to the gate, so an accepted item nobody ever carried is visible
  as exactly that rather than looking identical to one that was delivered.
- An item still open is distinguishable from one that finished and never reported,
  because otherwise the gate defers work that is already done.

**The same shape of low value candidate stops arriving once the reviewer has refused it
a few times.**

- A refusal carries a typed reason from a small closed set, because a category can be
  suppressed from a type and cannot be suppressed from free text.
- Repeated refusals of one shape measurably reduce how often that shape arrives, and the
  reduction is reported so the reviewer can see the gate learning.
- A refusal is cheap to reverse and says so, because a meaningful share of decisions at
  any intake gate are wrong in both directions and an irreversible no is the expensive
  kind.

## Guidance

The scarce thing is the reviewer's attention, not the work, so start by declaring how
many decisions fit in a week and admit that many. Judge the gate on whether it closes at
least as fast as it opens, never on how deep the queue is. Make declining cheap and
typed: a reason from a small closed set can suppress a whole category, and free text
cannot. An accepted item that nobody carries is a decision that never happened.

## Where this is worth adopting

- A setup where a code scan, an idea harvester and an outside scout all file into one
  place, so the person in the middle now spends more time deciding than all three
  producers spent producing.
- A team whose backlog grows every week and whose review always ends before the bottom
  of it, so the oldest items are decided by never being reached and nobody has to own
  that.
- An automated loop where producing candidates is cheap and accepting one is the single
  act reserved for a person, so every worker downstream idles at full capacity while the
  queue fills up.
- A project that turned on a rule to close stale items, watched the queue depth improve,
  and has not connected that to the fact that fewer people bother submitting anything
  now.
- A solo operator who wants to say no in one word and have that word mean that the same
  shape stops arriving, rather than having to say it again next month.

## Connector types

None. This work needs no external connector: the tools the agent already has are enough.

## Recommended trigger

`event`. A candidate arriving is what creates the work, and a gate that only sweeps on
its own schedule delays every candidate by up to one sweep for no benefit. Waking on
arrival is not the same as deciding on arrival: batching the decisions into a fixed slot
with a named reviewer is the arrangement that survives at scale, and that batching
belongs to the adopter's cadence rather than to this recipe.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- How many decisions this person can genuinely make in a period, because that number is
  the capacity the gate is built around and every other property follows from it.
- How much context they need to decide, since too little means digging and too much
  means the queue goes unread, and the two failures look nothing alike.
- How a refusal should shape the producer, because suppressing a category permanently
  and damping it are different promises and only one of them is safe to make from three
  refusals.
- How long an undecided candidate should wait before it is surfaced again rather than
  dropped, and who is allowed to close one without deciding on it.
- Who carries an accepted candidate and how the gate learns that they finished, because
  without that half an acceptance is a status and not a commitment.

## Dependencies

None.
