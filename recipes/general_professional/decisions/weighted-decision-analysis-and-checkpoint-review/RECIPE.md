---
name: weighted-decision-analysis-and-checkpoint-review
version: 0.2.0
status: seed
domain: general_professional
path: general_professional/decisions
---

# Weighted decision analysis and checkpoint review

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A hard choice gets settled by whichever criterion was loudest that day, the
weights are chosen after the preferred option is already in view so the matrix agrees
with it, and nothing is written down at the time that a later review could use. What
survives is a decision that can only be judged by how it turned out, which teaches the
wrong lesson whether it went well or badly.

**Input.** The decision as the requester states it, the alternatives they can see plus
the ones they have not said out loud, the constraints, and the record of earlier
decisions of a similar shape together with whatever their checkpoints found.

**Core action.** Fix the criteria and their weights against the spread each one actually
covers across these options, before any option is scored, then find how far a weight has
to move before the answer changes and say plainly when the leading two sit inside that
margin.

**Output.** A scored comparison that names the margin it survives, a pre-mortem against
the leading option, and a durable decision record holding the prediction, the
confidence, the falsifying observation and a checkpoint stated as an observable state
and a date, which the requester is brought back to when it comes due.

## Activities

1. Establish the real alternatives, including doing nothing, and whether this decision
earns an analysis at all *(observe)*
2. Fix the criteria and weights against the spread each covers across these options,
before any option is scored *(decide)*
3. Score every option against the locked weights and run a pre-mortem on the leader
*(act)*
4. Find how far a weight has to move before the winner changes, and report a tie as a
tie *(decide)*
5. Write the kill criterion as an observable state and a date, alongside the success
metric *(act)*
6. Write the prediction, the confidence and the falsifier into a durable record the
checkpoint can find *(deliver)*
7. Return at the checkpoint, re-validate that the premise still holds, and report the
outcome separately from the reasoning *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The comparison is settled by weights that were fixed before anyone saw a score, and it
says how much of a margin the answer survives.**

- Weights are recorded, with the worst-to-best spread each criterion covers across the
  actual options, before any score is entered.
- A criterion every option scores about the same on carries a weight near zero, however
  important it sounds in the abstract.
- The report names the smallest weight change that would flip the winner.
- When the leading two options sit inside that margin they are reported as a tie the
  matrix cannot settle, with the criteria it does not hold named.
- A requester who goes with an option the matrix did not pick has said a criterion
  carries weight they did not declare, and that is written on the decision's record as a
  claim about their weighting rather than about these options, so a later decision of
  the same shape opens from it; it never reaches the weights of the decision in hand,
  which were locked before any score existed and are worth nothing if a preference can
  reopen them.

**A decision can later be judged on the reasoning that produced it, not only on how it
turned out.**

- The prediction, the stated confidence and the observation that would prove it wrong
  are written at the time of the decision, not reconstructed at the checkpoint.
- The kill criterion names a state and a date, so it can be observed to have fired or
  not fired.
- The checkpoint verdict reports whether the metric was hit and whether the reasoning
  was sound given what was knowable, as two separate findings.
- A checkpoint reached on a decision the world has already overtaken is closed with that
  reason recorded, rather than scored against a premise that no longer holds.

**Cheap and reversible decisions do not get a matrix, and the refusal is recorded rather
than left silent.**

- A decision judged too cheap or too easily reversed to justify the structure is
  returned unanalysed with that judgment stated.
- A lone option is reframed against doing nothing rather than scored on its own, because
  a matrix with one row always approves.
- An option added after scoring triggers a re-score rather than an amendment, since a
  weighted sum can reorder the options it was already holding.

## Guidance

Fix the weights before any option is scored, and fix them against the spread a criterion
actually covers across these options rather than against how important it sounds. A
criterion everything scores the same on decides nothing, however vital. Then find how
far a weight must move before the winner changes: a small move means the leading two are
tied and the matrix cannot settle it. Write the kill criterion as a state and a date,
because a vague one never fires.

## Where this is worth adopting

- A founder choosing between two vendors where one is already the favourite, and the
  honest question is not which scores higher but whether the scoring was built to agree
  with a preference that was formed first.
- A team that relitigates the same architectural choice every few months because nobody
  wrote down what would have to become true for the answer to change, so each round
  starts from memory and memory has already been edited by what happened since.
- An operator with a long record of choices that all look correct in hindsight, who
  cannot separate a good decision that went badly from a bad one that got lucky, and is
  learning the wrong lesson from both.
- A commitment with a real exit cost, such as a hire, a platform migration or a lease,
  where the only moment anyone will name the condition for backing out is before the
  sunk cost exists.
- A steady stream of small reversible calls where a structured analysis would cost more
  than the decision is worth, and the useful answer is a fast refusal that says why
  rather than a matrix produced out of politeness.

## Connector types

`knowledge_base`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[notion](examples/notion.md) for `knowledge_base`.

## Recommended trigger

`self_paced`. Two moments, and neither sits on a calendar. One is when a decision is
brought, which nobody can schedule. The other is when a recorded checkpoint comes due,
which is a date this work wrote itself and must then be the thing that remembers,
because the requester will not. Self-paced is what lets one piece of work answer both
without a clock imposing reviews nobody needed.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which decisions the requester wants structured and which they consider their own
  business, because analysis offered where it was not wanted reads as friction and the
  whole habit gets dropped rather than tuned.
- The criteria they actually weigh, read from choices they have already made rather than
  from what they say matters, because a generic matrix produces a defensible answer they
  do not believe and quietly override.
- How far out a checkpoint should sit for the kinds of decision they bring, because the
  interval has to be long enough for the metric to have moved and short enough that
  reversing still costs less than continuing.
- Where the decision record lives and whether the checkpoint date is queryable there,
  because a record that cannot be searched by date turns the return step into something
  the requester has to remember, which is the failure this work exists to prevent.

## Dependencies

None.
