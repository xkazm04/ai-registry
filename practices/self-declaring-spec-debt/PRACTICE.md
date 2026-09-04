---
id: self-declaring-spec-debt
dimension: D5
applies-when: "The repo carries a normative specification or design document that describes behaviour, and a reader cannot tell from the document which parts are implemented, which are aspirational, and which are contradicted by the shipped code."
---

# Self-declaring spec debt

**What it gives you:** a specification a reader can trust without running the
code, because it states its own gaps in the same voice it states its rules.

**Dimension:** D5.

## The problem this removes

A long design document written before or alongside an implementation is always
partly ahead of it. That is normal and not the defect. The defect is that the
document does not say *which* parts, so a reader has three bad options: believe
all of it and build against behaviour that does not exist; believe none of it
and read the source instead, which makes the document worthless; or find out
case by case, which is the same as the second option with extra steps.

The usual mitigations both fail. A `STATUS.md` beside the spec drifts within
weeks, because the person changing a section is not the person maintaining a
separate file. Scattered `TODO` comments are invisible to anyone reading the
section they qualify, since they sit at the point of implementation rather than
the point of claim.

## The shape

**One labelled inventory, and the same label again at every site.**

1. **An implementation-status section**, near the top, listing every known gap
   as a short labelled item — a stable id, one sentence of what is missing, and
   a pointer to the section it qualifies:

   ```markdown
   ## Implementation status

   - **J1 — snapshot compaction (§1.7):** specified, not implemented; dead
     bytes are never reclaimed today.
   - **R12 — `watchSession` (§5.2):** public method throws; the sole stubbed
     method on this interface.
   - **C1 — remote transport (§2.8):** the specified transport contradicts the
     shipped process-local product; a decision is required before implementing
     either direction.
   ```

2. **The same label repeated at the section it qualifies**, so a reader who
   arrives mid-document by search or link sees the caveat without having read
   the inventory. This is the half that makes it work, and the half most often
   skipped.

3. **A stated relationship between the document and the source**, so it is clear
   which one wins. "This document is normative; the source files named in §0.7
   carry the declarations" is a different contract from "this describes what the
   code does", and readers need to know which they are holding.

## The three item classes, kept distinct

Collapsing these is what makes a status section unreadable:

- **Not implemented** — the spec is right, the code is absent. A plan.
- **Contradicted** — the spec and the shipped product disagree, and *neither is
  yet agreed to be wrong*. This is the class teams hide, and it is the most
  valuable one to publish: it names a decision somebody owes, rather than work
  somebody owes.
- **Corrections** — the spec was wrong about its own source and has been fixed;
  worth listing while readers may still hold the old version.

## Deny the coverage claim explicitly

A specification that includes a conformance matrix, an invariant list or a test
tier description invites a reading it usually has not earned: *these are all
tested.* Say otherwise in one sentence where the matrix appears — "this states
the required conformance matrix; it is not a claim that every listed row has a
dedicated test."

That single sentence is the highest-value line in the practice. Without it a
reviewer treats the matrix as evidence, and a matrix is a *requirement*. The
distinction costs nothing to state and is expensive to discover during an
incident.

## Why this earns its keep

- **A gap with a stable id is countable and citable.** Work items, commit
  messages and review comments can reference `R12` and mean one thing; "the
  watch thing isn't done" cannot be tracked.
- **It survives the document being read out of order**, which is how long
  specifications are actually read.
- **It converts an unfalsifiable document into a falsifiable one.** A reader can
  check whether a labelled gap still exists. Nobody can check a document that
  claims everything works.
- **It makes stale sections cheap to spot.** A gap that has been closed leaves
  a label with nothing behind it — visible, and a one-line deletion.

## How it fails

- **The inventory exists and the inline labels do not.** Readers arriving by
  search miss every caveat, and the section becomes decoration.
- **Ids get reused or renumbered.** They are identifiers; treat them as
  permanent and retire rather than recycle.
- **It becomes a backlog.** This lists what the *document* claims and the code
  does not do. Feature wishes belong elsewhere; an item here always names a
  specific section that is currently untrue.
- **Nothing removes items.** If closing a gap does not include deleting its
  label, the section decays into a list of historical anxieties and readers stop
  trusting it — which costs more than never having written it.
