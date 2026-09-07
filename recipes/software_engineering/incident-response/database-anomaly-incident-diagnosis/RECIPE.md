---
name: database-anomaly-incident-diagnosis
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/incident-response
---

# Database anomaly incident diagnosis

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A serious database deviation reaches a person as an alarm and nothing else, so
the first hour goes into reconstructing evidence that has already stopped existing.
Almost everything worth knowing during a database incident is held in views of the
present instant rather than in a log, and the first instinct of anyone responding is to
restart something, which destroys all of it. There is no way to sample the past.

**Input.** The live state of the database while the condition is still happening, what
else moved at the same time, and the operator's verdicts on earlier hypotheses of the
same shape.

**Core action.** Capture the evidence while it still exists, repeatedly rather than once
so that what is stuck can be told from what is merely busy, follow the contention back
to whatever is at the root of it, and offer a hypothesis carrying the confidence the
evidence supports rather than the confidence that would be reassuring.

**Output.** An escalation carrying the captured evidence, a named hypothesis with what
would confirm or refute it, remediation options with their costs, and a database that
has not been touched.

## Activities

1. Take repeated snapshots of live state while the condition is still happening
*(observe)*
2. Follow the contention back to whatever is at the root of it *(observe)*
3. Find what else moved at the same time *(observe)*
4. Name what the evidence supports and what would confirm or refute it *(decide)*
5. Set out the remediation options and what each would cost *(decide)*
6. Hand a person the evidence and the hypothesis, having changed nothing *(deliver)*
7. Record the operator's verdict where the next case of this shape reads it *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**What the database was doing during the incident is still available after somebody has
restarted it.**

- Evidence is captured while the condition is live and written somewhere durable before
  any option is offered, because the views it comes from hold no history of their own.
- The capture is repeated a few times seconds apart rather than taken once, so that a
  session which is genuinely stuck is distinguishable from one that was merely in flight
  when the snapshot was taken.
- Where contention forms a chain, the chain is followed to its root rather than reported
  at its first hop, and the root is named even when it is something doing no work at
  all.

**The operator can tell what was measured from what was inferred, without asking.**

- The escalation separates what was observed from what is assumed from what is judged,
  and names the one assumption the judgment rests on.
- It names what would confirm or refute the hypothesis, so the next step is decidable
  rather than a matter of taste.
- Where the evidence supports no hypothesis, that is stated as the finding along with
  what was captured, rather than filled with the most plausible available story.
- Where several things contributed, they are named as several rather than reduced to one
  cause for tidiness, with at most one of them labelled as the trigger.

**The diagnosis does not become part of the incident, and what the operator concluded is
known to the next diagnosis.**

- Nothing this work does alters the database, its data, its plans or its statistics, and
  any diagnostic that would run the suspect work rather than describe it is refused.
- Every escalation ends with a recorded verdict, including a verdict that the hypothesis
  was wrong, and the record is durable rather than a conversation.
- A cause that has been confirmed before is recognised as recurring and reaches the
  escalation as such, instead of being diagnosed from nothing each time.

## Guidance

Capture first, always. Everything useful lives in views of the present moment, and the
first mitigation anybody reaches for erases them, so the snapshot has to be durable
before any option is named. One snapshot cannot tell stuck from busy: take several.
Follow contention to its root, which is often something idle rather than something
expensive. Do not act on the database. Offer options with costs and say plainly when the
evidence supports nothing.

## Where this is worth adopting

- A small team with no database specialist, where a serious deviation currently means
  somebody restarting things until it stops and nobody afterwards being able to say what
  happened.
- An overnight incident that resolves itself before anyone logs in, so the only durable
  record is that something was slow and the same thing will happen again next month.
- A recurring stall whose cause is a long open transaction holding a lock, which is
  invisible in any snapshot that reports the expensive queries rather than the ones
  doing nothing.
- An operation where the responder has production access and the honest risk is not that
  they will do nothing but that they will act before the evidence is captured.
- A team that has diagnosed the same shape of incident four times without noticing,
  because each diagnosis was written into a message and none of them into a record the
  next one reads.

## Connector types

`database`, `messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`event`. A serious deviation is a real event and the diagnosis has to begin while the
evidence still exists, so this work wakes on the detection rather than choosing its own
moment. Every minute between the condition and the capture is evidence that is gone,
which is what makes a self paced version of this work unable to do it at all.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What this work is allowed to touch during an incident, which should be nothing,
  because the default has to be read only and the adopter should have to say otherwise
  deliberately rather than discover it.
- How much load the capture itself may impose, since some of the views it reads are
  cheap ordinarily and are not cheap during exactly the kind of incident this recipe
  runs in.
- Who to reach and how when the operator is not the responder, because a diagnosis that
  reaches nobody in time is the same as no diagnosis.
- Which earlier incidents count as the same shape here, since that judgment is what
  turns a recorded verdict into a lesson rather than a note.

## Dependencies

None.
