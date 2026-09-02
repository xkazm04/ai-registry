---
layer: technique
type: technique
subject: regeneration-vs-repair-economics
technique: defect-class-to-remedy-map
status: forged
laws: [unmeasured-is-not-a-pass, one-authority-per-quantity]
use_when: [routing a rejected generated asset to a remedy, deciding which defects a repair pass actually cures, a repair keeps running and changing nothing]
---

# Defect class to remedy map

## The concern

A rejection arrives as a set of named defect classes. Something has to decide what to do
about them. The map is that decision, declared as data: for each remedy, the exact set of
defect classes it is known to resolve — and, by omission, every class it does not.

It is a map from **remedy to classes**, not from class to remedy, and the direction
matters. Written the other way, each class acquires a remedy by default and the map never
has to admit that a class has none. Written this way, a class that appears in no remedy's
set is visibly unaddressed, which is the state you most need to see.

## Procedure

1. **Take the class vocabulary from the acceptance gate, unchanged.** The gate that named
   the defect owns the vocabulary. The map consumes those codes verbatim; it never
   introduces a synonym, never re-parses reason prose to infer a class, and never splits a
   class the gate treats as one. Two vocabularies for one set of defects is two authorities
   for one quantity, and the disagreement surfaces only when it is load-bearing.
2. **Enumerate the remedies you actually have.** Typically: a local repair pass, another
   paid generation, an upstream change to the input, and the null remedy (accept with the
   defect named). Each is a set.
3. **For each remedy × class pair, run a before/after pair and record the verdict shift.**
   One artifact exhibiting the class, graded by the production grader, before the remedy
   and after it. Record the verdict on both sides — not the score, the verdict, and the
   per-class findings under it.
4. **Admit a class to a remedy's set only on a measured cure.** No cure, no entry. A
   partial cure — the class drops from fail to warn — is an entry with that fact recorded
   next to it, because a warn is a different claim from a pass.
5. **Record the anti-entries too.** Where a remedy measurably *worsens* a class, that is
   the most valuable line in the file. Keep it beside the set, as a comment or a second
   list, so nobody re-adds the entry six months later from first principles.
6. **Derive, at routing time, three disjoint lists from a verdict's failing codes**:
   which are resolvable by the local repair, which are resolvable by a paid roll, and
   which are addressed by neither. The third list is the one that must never be dropped.

## Decision rules

- **Route to the local repair only when at least one *failing* class is in its set.** Warn
  classes do not justify a repair run on their own; they justify recording.
- **Route to a paid roll only when a failing class is in the paid set.** That set is
  typically tiny — an empty return, a degenerate result — because those are the only
  outcomes a re-draw genuinely resamples. If your paid set is large, you have not measured
  it; you have assumed it.
- **When the unaddressed list is non-empty, say so before the remedy runs.** The routed
  plan carries the sentence "this will resolve A and B; C will still be wrong afterwards".
  A plan that promises a clean result it cannot deliver is worse than a refusal.
- **When every failing class is unaddressed, refuse.** That is the separate refusal
  technique's job; the map's contribution is the evidence that nothing applies.
- **An unmapped class routes to the null branch, labelled *remedy unknown*, never to a
  remedy chosen by resemblance.** Unmeasured is not a pass, and it is not a cure either.
- **Declare the stage the artifact is at, and never infer it.** A class that the next
  pipeline stage exists to satisfy is not a defect in a pre-stage artifact — it is an
  un-run stage. An undeclared stage renders as *undeclared* and the tiered reading is
  withheld, because a guessed stage produces a confidently wrong route.

## The mis-tier case

There is one derived state worth naming explicitly: an artifact declared as pre-repair
whose failing classes are *all* in the repair set and none in the paid set. That artifact
is not bad; it is being graded against a bar that a later stage exists to clear. Emit that
as its own signal, with the caveat text derived from the artifact's own findings rather
than printed as a blanket disclaimer.

The discipline that keeps this honest: the mis-tier signal is display and routing only.
There must be no path by which it converts a fail into anything else. "The bar was applied
early" must never become "so ship it" without the null branch's explicit, recorded
acceptance.

## When not to use this

- **When there is only one remedy.** A map with one entry is a conditional; write the
  conditional.
- **When the defects are content defects.** Whether the artifact is the *right thing* is
  not a structural class and no entry in this map addresses it. Route those to the input,
  not to a remedy.
- **Before the class vocabulary is stable.** A map built over reason strings that the
  grader is still rewording will mis-match, and the mis-matches are silent. Wait for codes.

## Failure modes

- **Listing the dominant class under the obvious remedy.** The dominant class attracts
  wishful entries precisely because curing it would help most. Measure the pair.
- **Inferring a class by string matching on the grader's prose.** Numbers move every roll
  and incidental findings come and go; matching on text produces intermittent mis-routes
  that reproduce only in production.
- **Letting the map drift from the grader.** When the gate adds a class and the map does
  not, the new class silently joins the unaddressed list — which is the correct default,
  but only if the unaddressed list is actually reported. Report it.
