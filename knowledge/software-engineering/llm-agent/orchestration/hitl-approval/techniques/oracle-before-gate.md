---
layer: technique
type: technique
subject: hitl-approval
technique: oracle-before-gate
status: forged
laws: [gate-sees-target, unknown-is-not-a-value, count-carries-predicate]
shared_with: []
use_when: [choosing which machine output a human should review, a reviewer approves everything and cannot say what they checked it against, deciding whether a reversible-but-opaque change needs a gate, a review queue is ordered by impact and effort alone, an approval rate sits near 100% and the items are not obviously safe, an unverifiable item was split into smaller items that are each still unverifiable, deciding at which artifact altitude a reviewer should be shown the work]
---

# An oracle before a gate

Consequence decides **whether** a human is asked. Verifiability decides whether
their answer means anything. Before arming a gate, name the thing the reviewer
will compare the output against — and when there is nothing to name, understand
that the gate is not the repair.

## The second axis

The rest of this subject keys on consequence. A gate is mandatory when the
action is irreversible, spends, leaves the boundary, or is novel; reads and
reversible acts are exempt by design. Every one of those is a property of
**what happens if the output is wrong**.

None of them is a property of **whether the reviewer can find out that it is**.
That is a separate axis, it varies independently, and the two together describe
four situations rather than two:

| | verifiable | unverifiable |
| --- | --- | --- |
| **high consequence** | gate; the verdict is real | gate fires, verdict is theatre |
| **low consequence** | exempt; correct | exempt — and this is where drift lives |

The left column is the one this subject already handles well. The right column
is where the mechanism fails in two different ways, and neither failure is
visible from the gate's own telemetry.

## A gate without an oracle is a rubber stamp by construction

[Gate fatigue](../hitl-approval.md) explains rubber-stamping as an
attention-budget failure: too many prompts, so the human stops reading. Every
countermeasure the subject offers reduces **volume** — tier by consequence,
batch the homogeneous, remember decisions, grant unattended runs.

There is a second cause of the same symptom, and volume has nothing to do with
it. The reviewer reads the whole thing, carefully, at leisure, and still cannot
tell whether it is right. A refactor that is plausible on every line. A summary
of a document nobody has time to re-read. A configuration change whose effect
appears three environments away. A translation into a language the reviewer does
not speak. The approval that follows is not laziness and no amount of queue
hygiene prevents it — it is the only move available to someone holding a
question they have no instrument to answer.

The distinction matters because the repairs are disjoint. Fatigue is repaired by
sending fewer items. This is repaired by changing what arrives, or by not
delegating the work at all. Applying the fatigue cures here makes the number of
unanswerable questions smaller and the answers no better, while every metric
improves.

## Name the oracle, in the trigger, before arming the gate

For each gated class, write down what the reviewer compares the output against.
An oracle is concrete or it is absent:

- a diff against a state known to be good
- a test that fails before the change and passes after
- a spec line, a schema, a type, a contract the output must satisfy
- a reference output produced independently
- a number reported with its predicate, next to the number it replaced
- a second party with standing to disagree — a different model, a second
  reviewer, the person who filed the request

"The reviewer's judgement" is not an oracle. It is the faculty that *uses* one.
Where the field is genuinely empty, say so with a token rather than leaving it
blank: an unverifiable item recorded as `no-oracle` is governed, and one that
renders as an ordinary pending item is not
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## What to do when the field is empty

There are four honest resolutions and the gate is not among them.

1. **Build the oracle.** Usually the cheapest, and usually skipped because it
   looks like scope. A golden-file comparison, a property the output must hold,
   a check the machine runs against its own work before it queues it. This is
   the move that converts the right column into the left.
2. **Narrow the task until an oracle exists.** An opaque change is often a
   verifiable change wearing a large diff. Split it until each piece has
   something to be checked against, and gate the pieces. The reviewer's
   attention is unchanged; what they can conclude with it is not.
3. **Withhold the delegation.** Some work is kept because handing it over
   produces an artifact nobody can accept or reject. That is a legitimate,
   recordable outcome, and writing it down is what stops the same task from
   being re-delegated every quarter.
4. **Descend an altitude.** The field is empty at the altitude the item was
   framed at, which is not the same as empty everywhere. A refactor nobody can
   vouch for has a public signature diff that reads against the committed one;
   a translation nobody in the room speaks has placeholder parity, plural forms
   and glossary terms; a summary nobody has time to re-read has citations that
   either resolve to a span saying that or do not. Review the lower artifact and
   **state what the verdict does not cover** — the remainder stays `no-oracle`,
   because a verdict inherited upward from the altitude that could be checked is
   the rubber stamp again with evidence attached to the wrong claim.

A gate armed over an empty field is the fifth option and it is the only
dishonest one, because it manufactures a decision record — a name, a timestamp,
a version, a verdict — for a judgement that was never possible
([gate-sees-target](../../../../_laws.md#gate-sees-target) is about the gated party
being unable to open the gate; this is the adjacent failure where the gate opens
correctly and means nothing).

## Narrowing and descending are different moves, and one of them can make it worse

The two middle resolutions are routinely taken for one, because both end with
smaller things to look at. They are opposite operations:

> **Narrowing keeps the artifact class and reduces its scope. Descending keeps
> the scope and changes the artifact class.**

Which one is available is decided by *why* the item is opaque, and there are two
reasons that present identically at the queue. An item can be opaque **because it
is large** — an oracle exists for the kind of thing it is, and the diff simply
outran it. Or it can be opaque **in kind** — nothing at that altitude was ever
checkable against anything, at any size.

Narrowing repairs the first and does nothing to the second. Split a
plausible-on-every-line refactor into six commits and there are six
plausible-on-every-line commits, not one verifiable one: the `no-oracle` count
went from one to six, the average item got smaller, and every queue metric
improved. That is the same dishonest arithmetic an armed gate produces, reached
by the other road, and it is harder to see because the work looks like diligence.

So the questions are asked in order, and the first one is not about size:
*is there an oracle for this kind of thing, at this altitude?* If yes and the
item outgrew it, narrow. If no, narrowing is contraindicated — descend until an
oracle exists, or go back to build or withhold.

## Carry verifiability into the queue, not only into the display

A review queue that sorts and filters on consequence terms alone treats every
item as costing the same verdict. It does not: the cost of a verdict is
dominated by what the reviewer has to do to reach it, and that is the property
being left out.

Two consequences for the surface:

- **Order and filter on it.** An item with an oracle attached and an item
  without are different work, and a queue that can only express impact, effort
  and risk cannot route them differently. A verification state that exists on
  the record and is rendered as a badge — but appears in no comparator, no
  score and no filter — is decoration
  ([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).
- **Report the split with the count.** "Forty pending" is not the load;
  "forty pending, nine with no oracle" is, and the nine are the ones that will
  be approved without being decided
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Reading the approval rate correctly

This subject already notes that a gate approving near 100% for months is
measuring nothing and its trigger belongs higher. That reading assumes the items
were verifiable and turned out fine. Split the rate by whether an oracle was
present before acting on it: a high approval rate over items with oracles is a
trigger set too low, and the fix is to raise it. The same rate over items
without them is the rubber stamp, and raising the trigger removes the last
record that the work happened at all.

## Decision rules

- Do not arm a gate for a class until the oracle field is filled or explicitly
  recorded as empty.
- An empty field routes to build, narrow, descend, or withhold — never to a gate.
- Ask whether the item is opaque because it is large or opaque in kind before
  choosing between them. Narrowing an item that is opaque in kind multiplies
  `no-oracle` items while every queue metric improves.
- A verdict reached at a lower altitude covers what that altitude can see and
  nothing above it. Record the remainder rather than letting it inherit the
  verdict.
- Reversibility exempts an item from a gate; it does not exempt it from needing
  an oracle. Reversible-but-unverifiable work is where undetected drift
  accumulates, because nothing fires and nothing can be reconstructed later.
- Verifiability belongs in the queue's ordering and filtering, not only in its
  rendering.
- Split every approval-rate reading by oracle presence before drawing a
  conclusion from it.
