---
layer: technique
type: technique
subject: codebase-scanning
technique: mismatch-vetoes-the-merge
status: forged
laws: [unknown-is-not-a-value, identity-survives-reuse, count-carries-predicate]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [a similarity score decides that a new item is the same as an existing one, a dedup pass only counts what two items share, a near-duplicate check folds a new filing into an old row, raising a similarity threshold is proposed to stop wrong merges, deciding what a field present on both sides and different must do to a match]
---

# A mismatch vetoes the merge

A similarity scorer that counts only what two items share has no way to hear that
they differ. Agreement raises the score and disagreement leaves it where it was, so
the scorer merges on the absence of a reason not to, which it cannot see. Two items
that share every word except the one naming which item they are will score as high
as two honest rewordings of one thing.

**A field that is present on both sides and differs vetoes the merge.** The veto
runs before the score is read, and it is not a penalty. A penalty can be outvoted by
enough shared words, and the case this exists for is exactly the one with enough
shared words.

A field present on one side only does not veto. That is
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) in the
direction a dedup pass needs: one write-up that omits the version says nothing about
the version, and treating the gap as a disagreement splits honest paraphrases.

## The field that earns the veto names the instance

A scorer built on shared words is usually tuned against paraphrase, so the error
it makes is not the one its author pictured. The natural first guess is opposed
actions: add against remove, enable against disable. Replayed over real titles, that
vocabulary had almost nothing to do. An agreement-only word-overlap rule, run over
the commit subjects of two repositories, merged 972 pairs, and a veto on opposed
action words separated **1** of them.

What the merges did share was a template. Roughly three in four differed by a
number present on each side: the eleventh wave against the twenty-eighth, three
verdicts against four, one release against the next. Those are the same *sentence*
about different *work*, and shared words cannot tell them apart, because the sentence
is what the words are. On a held-out set opened only after that reading was written
down, 7,995 subjects from five repositories, the same rule merged 977 pairs and 607
of them (62%) carried a digit-bearing token on each side that the other lacked. Thirty
drawn at random all read as different work, and a neighbouring pair the veto also
separated had nothing in common but a form of words.

So look first for the field that says *which one this is*: an ordinal, a count, a
version, an identifier, a scope. Where the store holds that field as data, use the
data. Where a door already treats a scope as part of identity in its exact key, its
fuzzy door inherits that scope, or the two doors disagree about what a duplicate is
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

## Raising the threshold is the repair that does not work

The reflex on seeing a wrong merge is to demand more agreement. It moves the wrong
quantity. On the same held-out set, raising the bar from 0.6 to 0.75 separated 318 of
the 607 mismatched pairs and lost **218 merges that had no mismatch at all**: honest
rewordings, in exchange for half the fix. The veto separated all 607 and lost none of
those, because it reads a different signal rather than asking for more of the same one.

## Which way the error is allowed to fall

The veto is cheap to be wrong about, and that is an argument for it. A wrong merge
folds a real item into an old row, and the new one is gone with nothing recording that
it existed. A wrong split leaves a duplicate that a reader closes in a second. Prefer
the error that stays visible, and where the merge is mechanical, keep a count of what
the veto separated beside the count of what it merged
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)), so a template
that changes shape shows up as a moving ratio.

## Where this stops

- **Inferring the field from free text is a proxy.** A digit test does not see a
  spelled ordinal, so a thirteenth and a twelfth still merge. It also vetoes when a
  figure is incidental; none of the thirty read pairs was, and thirty is thirty.
- **Commit subjects stand in for filings here.** They repeat more templates than a
  hand-written backlog does, so the share of merges the veto touches is an upper
  guide, and the rate on real filings is unmeasured. The opposed-action result does
  not refute that vocabulary for a store that holds actions as data.
- **No labelled recall was reachable.** On a labelled set of duplicate pairs the scorer
  merged none, so real duplicates lost to the veto are bounded only by reading the
  separated sample, by one reader.
- **A score is still needed on the other side of the veto.** This decides what a
  disagreement does. It says nothing about how much agreement is enough.
