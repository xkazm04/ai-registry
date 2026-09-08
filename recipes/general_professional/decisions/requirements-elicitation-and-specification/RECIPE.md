---
name: requirements-elicitation-and-specification
version: 0.1.0
status: seed
domain: general_professional
path: general_professional/decisions
---

# Requirements elicitation and specification

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** People ask for solutions because a solution is easier to say than an outcome,
and a specification that faithfully records the ask reads as complete, passes review and
is signed by everybody. The quieter failure is worse: wording vague enough that two
stakeholders can both approve it while meaning different things, so the disagreement is
not resolved, it is hidden inside the consensus and is discovered by the team that has
to build one of the two readings.

**Input.** The request in the requester's own words, the people who will live with the
result and not only those who commissioned it, the constraints that are actually
immovable, what an earlier version of the specification already promised, and the
decisions on this ground that have already been ruled elsewhere.

**Core action.** Separate what was asked for from the outcome that would make the
requester stop asking, then decide which wants become binding and are written so
somebody could observe them met, which are deferred against a named condition that would
bring them back, and which genuinely conflict and must be put to whoever can rule
between them rather than dissolved into wording both parties will read their own way.

**Output.** A specification whose binding requirements are each stated as an observable
condition, whose deferrals each carry what would reopen them, and whose unresolved
conflicts are named with the person who must rule and what each side would lose; plus,
when a round of listening changed nothing, a dated record of what was asked and why the
specification did not move.

## Activities

1. Take the request in the requester's own words with the outcome they expect from it
*(observe)*
2. Reach the people who will live with the result, not only those who commissioned it
*(observe)*
3. Separate a stated solution from the outcome it was standing in for *(decide)*
4. Rule what becomes binding, what is deferred against a condition, and what conflicts
*(decide)*
5. State each binding requirement as a condition somebody could observe to be met or not
*(act)*
6. Put an unresolved conflict to whoever can rule between the parties, named rather than
smoothed *(act)*
7. Publish the specification with its open conflicts and the record of what was heard
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**What is written down is the outcome that would satisfy the requester, in words that
cannot be read two ways.**

- Every binding requirement is stated as an observable condition, so two readers cannot
  both approve it while holding different pictures of what was agreed.
- A want that arrived already shaped as a screen, a field or a workaround is recorded
  together with the outcome it was standing in for, and the outcome is what becomes
  binding.
- A requirement nobody can name a way to check is returned as not yet a requirement,
  rather than written down in the words it arrived in because those words were
  available.
- A first pass with no prior specification publishes the scope boundary and what was
  deliberately left out, because an empty deferred list is otherwise read later as
  evidence that nothing was ever deferred.

**Two stakeholders wanting incompatible things reaches the person who can decide,
instead of surviving sign-off as a sentence both could sign.**

- A conflict is recorded with both positions in their own terms and the person who can
  rule between them named, rather than replaced by a formulation acceptable to both.
- Wording that each party reads in their own favour is treated as an unresolved
  conflict, not as agreement reached.
- A ruling records who ruled and what was given up, so the party that lost finds the
  reasoning and not only the outcome.
- Sign-off is recorded against a version, so a requirement added after approval reopens
  the approval instead of quietly inheriting it.

**Nothing leaves the specification by going quiet, and nothing enters it without saying
what it invalidates.**

- Each deferred want carries the condition that would make it binding, since a deferral
  with no condition is a refusal nobody said out loud.
- A round that heard the requester out and changed nothing still leaves a dated record
  of what was asked and why the specification did not move.
- A binding requirement the delivery team has already built against is never silently
  rewritten by a later round; a change to one is recorded as a change, naming what it
  invalidates and who has to be told.
- A want that turns out to be already settled by a decision ruled elsewhere is closed
  against that decision rather than re-litigated inside this specification.

## Guidance

Requesters describe solutions because a solution is easier to say than an outcome; take
the words, then ask what would have to become true for them to stop asking. Write each
binding requirement so somebody could observe it met, because wording two readers can
both approve is how a disagreement survives sign-off and reappears at delivery. A
deferral without the condition that reopens it is a refusal nobody said out loud. When
two parties want incompatible things, name the person who rules, not the compromise.

## Where this is worth adopting

- A replacement for a system nobody documented, where the loudest requirement is that it
  behave exactly like the old one and no two users describe the old behaviour the same
  way.
- A request that arrives already specified as a screen or a field, because the person
  asking has been living with a workaround long enough to mistake it for the
  requirement.
- A programme where the sponsor signs off and the people who will use the result daily
  were never in the room, so acceptance testing is the first time anybody checks that
  assumption.
- Two departments that each need the same record to mean something different, where the
  previous specification chose wording both could accept and delivery now has to pick
  one of them anyway.
- A second round of elicitation on a build already underway, where the real risk is not
  missing a want but quietly rewriting a requirement the team has already built against.

## Connector types

`documentation`, `knowledge_base`, `project_management`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`event`. The work starts when somebody asks for something, which nobody can schedule,
and its quality decays fast: the reasoning behind a request is recoverable while the
request is fresh and is reconstructed from memory a month later. A periodic requirements
review turns into document maintenance, re-reading a specification that no new question
has moved, and it arrives after design has already committed to one reading of the
ambiguous sentence.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Who can rule when two stakeholders want incompatible things, because a pass with no
  escalation route produces well documented disagreements and no decisions.
- What this operation accepts as a testable statement of a requirement, since a formal
  acceptance criterion and a sentence a reviewer signs are different bars and neither
  transfers to the other setting.
- Which constraints here are genuinely immovable and which are habits stated as
  constraints, because a specification that treats a habit as a boundary never surfaces
  the option that would have been cheapest.
- Where the specification lives and whether the delivery team reads that copy, since a
  requirement ruled in a document nobody builds from is a decision that did not happen.

## Dependencies

None.
