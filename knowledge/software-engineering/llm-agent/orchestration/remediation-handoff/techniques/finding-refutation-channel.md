---
layer: technique
type: technique
subject: remediation-handoff
technique: finding-refutation-channel
status: forged
laws: [count-carries-predicate, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [handing a named target list to a worker you do not supervise, a brief carries counts produced by a text-shaped scan, a worker reports that the premise is false]
---

# The finding-refutation channel

A handoff brief asserts things: these files, this many occurrences, this
defect. Every one of those assertions was produced by an instrument, at a
past moment, usually over a *textual* view of the code — and the worker
receiving the brief is about to read the code itself, at present, in context.
The worker is therefore in a strictly better epistemic position than the
brief, on every claim the brief makes.

Most handoff designs do not model this. They offer two outcomes: **done** and
**failed**. A worker who discovers the premise is false has no honest square
to stand in, and both available answers are lies — "done" erases the finding,
"failed" blames the worker for the producer's error. What the design needs is
a third outcome.

> **Refuted** — the work was not performed because the premise did not hold,
> and here is which part of it did not hold.

## What the channel carries

A refutation is not a shrug; it is a measurement, and it must arrive with the
same rigour a completion does:

- **Which claim failed** — the target that does not exist, the count that was
  wrong, the defect that is not a defect at this site.
- **What is true instead**, measured now, with the same predicate the brief
  used, so the two are comparable at all.
- **The scope of the failure** — one entry wrong, or the category wrong. The
  distinction decides whether the producer fixes a row or retires a rule.
- **What the worker did anyway**, if anything. Partial work under a partly
  false premise is common and must be reportable as such rather than rounded
  to either pole.

And it must write **back to the producer**. A refutation absorbed by the
worker and dropped is the same finding regenerated next run, handed to the
next worker, refuted again — a loop that costs a full session per cycle and
leaves no trace anywhere ([the gate must see its
target](../../../../_laws.md#gate-sees-target): the producer never observes its own
precision).

## The rates are the point

Refutation rates measured across one campaign's specialist lanes, all of them
answering briefs written by an orchestrator with a broad view and no
site-level reading:

- one lane moved **4 of 32** named targets and demonstrated that the gate the
  brief proposed would have scored **12.5%** precision;
- one **withheld 3 of 7** proposed rules as not carrying their weight;
- one found **4 of 5** named targets already fixed;
- one **refused both** proposed deletions as resting on false premises.

The pattern is not that the orchestrator was careless. It is structural: a
brief is written from an aggregate view, and aggregates are where the
imprecision lives. Which is why the sharpest instance is a catalogue of sites
said to need one specific repair — the catalogue collapsed when a single entry
turned out to be one statement rather than the nine it was credited with, and
on re-measurement **not one of the eight counts was right, and they were wrong
in both directions.** The *concern* was real and survived. Every number
attached to it did not.

## Decision rules

1. **A count in a brief is a lead, not a finding.** It carries its predicate
   and its date, or it carries nothing
   ([a count carries its predicate](../../../../_laws.md#count-carries-predicate)).
   Briefs that state bare numbers train workers to trust them.
2. **The worker re-measures before acting**, on its own reading of the current
   tree, and a mismatch **stops the work** rather than being silently
   reconciled. Silent reconciliation is how a wrong count survives into the
   record as a right one.
3. **A refusal is never graded as a failure.** The incentive is the entire
   mechanism: a worker that is penalized for refuting will complete the work
   instead, and the completion of work resting on a false premise is the most
   expensive outcome in this whole subject — it is a change nobody needed,
   reviewed as if it were needed.
4. **Track the refutation rate per producer, and treat a rate of zero as an
   instrument alarm.** A lane refusing nothing is a lane not re-measuring
   ([failure must be spelled differently from empty
   success](../../../../_laws.md#failure-not-empty-success)). Somewhere between a
   tenth and a third of items refuted is the healthy band for briefs written
   from aggregates; sustained zero means the check is not running.
5. **Refutation is bounded by the brief, not by taste.** The worker refutes
   claims the brief makes. It does not get to refuse work because it prefers
   a different approach — that is a different conversation and belongs in the
   completion report, not in this channel. Keeping the boundary sharp is what
   keeps the channel credible.

## When not to use it

For mechanical batches whose premise is verified by construction — a rename
driven by the compiler, a generated edit applied where the generator says —
the channel is ceremony: there is no claim to refute. Introduce it where the
brief encodes *judgement*: named targets, counts, severities, proposals for
new rules. Those are the briefs that are wrong often enough to need somewhere
to say so.
