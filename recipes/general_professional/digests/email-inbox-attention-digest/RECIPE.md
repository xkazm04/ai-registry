---
name: email-inbox-attention-digest
version: 0.1.0
status: seed
domain: general_professional
path: general_professional/digests
---

# Email inbox attention digest

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Reading every unread message to find the few that matter costs more attention
than the messages do, and a digest ordered by arrival saves none of it. The harder
problem is that a short list gives a reader no way to tell a good filter from a broken
one, so the first time something important is missing they go back to reading everything
and the digest has cost them twice.

**Input.** The unread set since the last pass, the model of which senders and subjects
this reader actually acts on, the corrections they have made to earlier digests, and the
record of what has already been surfaced.

**Core action.** Decide what does not need the reader and account for that decision out
loud, ranking the remainder on who they actually answer combined with what the message
says, so the digest can be judged on what it withheld rather than only on what it
showed.

**Output.** A short tiered list of what genuinely needs the reader, carrying the number
of messages looked at and the classes that were dropped, delivered even when it holds
nothing so that quiet is distinguishable from a watch that stopped.

## Activities

1. Read and count the unread set since the last pass *(observe)*
2. Score each message on who the reader actually answers together with what it says
*(decide)*
3. Decide what does not need the reader, by class rather than message by message
*(decide)*
4. Tier the survivors so the costliest thing to miss cannot be missed *(act)*
5. Deliver the digest with its denominator and its dropped classes, including when it
holds nothing *(deliver)*
6. Update the model from corrections ahead of behaviour, and keep a slot for senders it
has stopped showing *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The reader can act on what was surfaced, safely ignore the rest, and see which of
those two the work actually did.**

- Every digest states how many messages were looked at and how many were surfaced.
- What was dropped is named by class, so a wrong exclusion is visible without opening
  the mailbox.
- Ranking rests on who the reader answers combined with what the message says, never on
  arrival order.
- Nothing is surfaced twice across passes.

**A quiet period arrives as a quiet period, so the reader never has to wonder whether
the watch is still running.**

- When nothing qualifies the digest is still delivered, carrying the counts and nothing
  else.
- A pass where the mailbox could not be read is reported as unread and is
  distinguishable from a pass where nothing qualified.
- No message is promoted into an empty digest to give it something to show.

**The importance model can still discover it was wrong about a sender it stopped
showing.**

- An explicit correction outweighs the behaviour the model inferred on its own.
- A sender the model has demoted is surfaced again occasionally, because a model trained
  only on what it chose to show has no path back.
- The model's current standing for a sender can be inspected and corrected directly,
  rather than only shifted by weeks of behaviour.

## Guidance

The product is what you left out, so say what it was. A digest that names its
denominator and the classes it dropped can be judged; one that shows three messages can
only be trusted or not. Learn from who the reader answers, but let a correction outrank
the inferred pattern, and show a demoted sender occasionally, because a model trained on
its own selections never finds out it was wrong. When nothing qualifies, send that.

## Where this is worth adopting

- Someone whose mail arrives faster than they can read it, who has already tried folders
  and filters and abandoned both because a rule that was right in March is wrong in
  September and nothing told them.
- A person returning from two weeks away to several hundred unread messages, where the
  useful answer is the six that still need them and an account of the several hundred
  that no longer do.
- An operator who stopped trusting an automatic filter after one important message went
  missing, for whom the thing that rebuilds trust is not better ranking but seeing what
  the filter decided to drop.
- A founder whose most important correspondent writes rarely, so any system learning
  importance from volume will bury them, and the exception has to be stated rather than
  learned.
- A role where mail arrives in long calm stretches broken by something genuinely urgent,
  and the reader needs the calm stretches confirmed rather than merely unbroken by a
  system that may have quietly stopped.

## Connector types

`email`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`self_paced`. A fixed hour is a habit rather than a property of an inbox: nothing about
unread mail is defined by a calendar boundary. Act when the unread set holds something
that would change what the reader does next, or when enough has accumulated that one
pass replaces a visit, and respect their working hours. The pacing still owes a delivery
even when nothing qualifies, so that quiet remains observable.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which mailbox and which accounts are in scope, because reading more than was intended
  is the one mistake here that cannot be taken back.
- Who the reader always answers, because a model with no starting point spends its first
  weeks wrong and gets switched off before it is right.
- What they never want surfaced, because an exclusion the model has to infer costs
  several bad digests to learn and each one spends trust.
- How much a miss costs relative to an interruption for this reader, because that ratio
  is the only thing that sets how aggressive the cut should be, and it differs between a
  support role and a maker's week.

## Dependencies

None.
